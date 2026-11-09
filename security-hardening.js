"use strict";

// QOMUS security pilot. Protects auth endpoints without storing any credentials.
const { alertEvent } = require("./security-alerts");
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 12;
const MAX_TRACKED_ADDRESSES = 20000;
const attempts = new Map();
const AUTH_POST_ROUTES = new Set([
  "/login", "/admin/login", "/register", "/verify-email",
  "/resend-verification", "/forgot-password", "/reset-password"
]);

function applySecurityHeaders(req, res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  // CSP is not enabled here: existing QOMUS pages contain inline JS/CSS.
  // Add a nonce-based CSP only after migrating and testing those assets.
  if (req.headers["x-forwarded-proto"] === "https" || req.socket.encrypted) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000");
  }
}

function deny(res, code, message, retryAfterSeconds) {
  const headers = {"Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store"};
  if (retryAfterSeconds) headers["Retry-After"] = String(retryAfterSeconds);
  res.writeHead(code, headers);
  res.end(message);
}

function requestedPath(req) {
  try { return new URL(req.url, "http://localhost").pathname; }
  catch (_) { return "/"; }
}

function addressKey(req) {
  // socket.remoteAddress cannot be spoofed through a client-supplied X-Forwarded-For.
  // In multi-instance/proxy deployments use a shared Redis limiter with trusted proxy config.
  return String(req.socket.remoteAddress || "unknown");
}

function tooManyAttempts(req) {
  const now = Date.now();
  const key = addressKey(req) + ":" + requestedPath(req);
  let entry = attempts.get(key);
  if (!entry || now >= entry.expiresAt) {
    if (attempts.size >= MAX_TRACKED_ADDRESSES) {
      for (const [k, v] of attempts) if (now >= v.expiresAt) attempts.delete(k);
      if (attempts.size >= MAX_TRACKED_ADDRESSES) attempts.clear();
    }
    entry = {count: 0, expiresAt: now + ATTEMPT_WINDOW_MS};
  }
  entry.count += 1;
  attempts.set(key, entry);
  return entry.count > MAX_ATTEMPTS ? Math.max(1, Math.ceil((entry.expiresAt - now) / 1000)) : 0;
}

function sameOrigin(req) {
  const targetHost = String(req.headers.host || "").toLowerCase();
  const origin = req.headers.origin || req.headers.referer;
  if (!targetHost || !origin) return false;
  try {
    const source = new URL(origin);
    return source.protocol === "https:" && source.host.toLowerCase() === targetHost ||
      source.protocol === "http:" && source.host.toLowerCase() === targetHost &&
        (source.hostname === "localhost" || source.hostname === "127.0.0.1");
  } catch (_) { return false; }
}

function guardSensitiveRequest(req, res) {
  if (req.method !== "POST") return false;
  const route = requestedPath(req);
  const fetchSite = String(req.headers["sec-fetch-site"] || "").toLowerCase();
  if (fetchSite === "cross-site" && (/^\/account(?:\/|$)/.test(route) || /^\/admin(?:\/|$)/.test(route) || route==="/advokat-pro/workspace")) {
    alertEvent("CROSS_SITE_POST", addressKey(req), route);
    deny(res, 403, "Cross-site request rejected.");
    return true;
  }
  // Browser forms that modify an authenticated account must originate on QOMUS.
  if ((/^\/account(?:\/|$)/.test(route) || /^\/admin(?:\/|$)/.test(route) && route !== "/admin/login" || route==="/advokat-pro/workspace") &&
      /(?:^|;\s*)hq_session=/.test(String(req.headers.cookie || "")) && !sameOrigin(req)) {
    alertEvent("INVALID_ORIGIN", addressKey(req), route);
    deny(res, 403, "Request origin could not be verified.");
    return true;
  }
  // Enable only after configuring a trusted reverse-proxy identity and shared limiter.
  // Render may present the same socket IP for many genuine users.
  if (process.env.QOMUS_PILOT_AUTH_LIMIT === "enabled" && AUTH_POST_ROUTES.has(route)) {
    const retryAfter = tooManyAttempts(req);
    if (retryAfter) {
      alertEvent("AUTH_RATE_LIMIT", addressKey(req), route);
      deny(res, 429, "Too many attempts. Please try again later.", retryAfter);
      return true;
    }
  }
  return false;
}

module.exports = { applySecurityHeaders, guardSensitiveRequest };
