"use strict";

// QOMUS security pilot. Protects auth endpoints without storing any credentials.
const { alertEvent } = require("./security-alerts");
const crypto = require("node:crypto");
const loginFailures = new Map();
const fs = require("node:fs");
const path = require("node:path");
// Single-instance Render restart durability; use shared PostgreSQL/Redis for horizontal scale.
// No raw email/password/IP is written. For isolated tests, opt in with an explicit path.
const durableLimiterPath = process.env.QOMUS_LOGIN_LIMIT_FILE ||
  (process.env.NODE_ENV === "test" ? "" : "/var/data/qomus-login-failures.json");
function loadLimiter() {
  if (!durableLimiterPath) return;
  try {
    const contents=JSON.parse(fs.readFileSync(durableLimiterPath,"utf8"));
    if (!contents || contents.version!==1 || !Array.isArray(contents.entries)) return;
    const now=Date.now();
    for(const [k,v] of contents.entries.slice(0,20000)) {
      if(typeof k==="string" && /^[a-z]+:[0-9a-f]{64}$/.test(k) &&
         Number.isInteger(v?.count) && Number.isFinite(v?.expiresAt) &&
         v.expiresAt>now && v.expiresAt<now+86400000) loginFailures.set(k,{count:v.count,expiresAt:v.expiresAt});
    }
  } catch(e) {
    if(e.code!=="ENOENT") console.warn("QOMUS_AUTH_LIMIT_LOAD_FAILED",e.code||"INVALID_STORE");
  }
}
function saveLimiter() {
  if (!durableLimiterPath) return;
  const now=Date.now();
  for(const [k,v] of loginFailures) if(v.expiresAt<=now)loginFailures.delete(k);
  try {
    fs.mkdirSync(path.dirname(durableLimiterPath),{recursive:true,mode:0o700});
    const tmp=durableLimiterPath+"."+process.pid+".tmp";
    fs.writeFileSync(tmp,JSON.stringify({version:1,entries:[...loginFailures].slice(-20000)}),{mode:0o600,flag:"w"});
    fs.renameSync(tmp,durableLimiterPath);
  } catch(e) {
    console.warn("QOMUS_AUTH_LIMIT_SAVE_FAILED",e.code||"IO_ERROR");
  }
}
loadLimiter();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
function identityKey(kind, identity) {
  return kind + ":" + crypto.createHash("sha256").update(String(identity||"").trim().toLowerCase()).digest("hex");
}
function getLoginBlockSeconds(kind, identity) {
  const item = loginFailures.get(identityKey(kind, identity));
  if (!item || item.expiresAt <= Date.now()) return 0;
  return item.count >= (kind === "admin" ? 6 : 8) ? Math.ceil((item.expiresAt - Date.now()) / 1000) : 0;
}
function recordLoginFailure(kind, identity) {
  const key=identityKey(kind,identity), now=Date.now();
  if (loginFailures.size > 20000) for (const [k,v] of loginFailures) if(v.expiresAt<=now) loginFailures.delete(k);
  if (loginFailures.size > 20000) loginFailures.clear();
  const last=loginFailures.get(key);
  loginFailures.set(key,{count:(last&&last.expiresAt>now?last.count:0)+1,expiresAt:last&&last.expiresAt>now?last.expiresAt:now+LOGIN_WINDOW_MS});
  saveLimiter();
}
function clearLoginFailures(kind,identity) { loginFailures.delete(identityKey(kind,identity)); saveLimiter(); }
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


// Shared-DB mode is optional until its schema, role and secret are provisioned.
// On database outage retain the safe process/disk limiter rather than fail open completely.
const sharedLimiter=require("./shared-login-limiter");
async function getEffectiveLoginBlockSeconds(kind,identity){
  const local=getLoginBlockSeconds(kind,identity);
  if(!sharedLimiter.enabled())return local;
  try{return Math.max(local,await sharedLimiter.blockSeconds(kind,identity));}
  catch(e){console.warn("QOMUS_AUTH_SHARED_LIMIT_READ_FAILED",e.code||"DB_ERROR");return local;}
}
async function recordEffectiveLoginFailure(kind,identity){
  recordLoginFailure(kind,identity);
  if(!sharedLimiter.enabled())return;
  try{await sharedLimiter.failure(kind,identity);}
  catch(e){console.warn("QOMUS_AUTH_SHARED_LIMIT_WRITE_FAILED",e.code||"DB_ERROR");}
}
async function clearEffectiveLoginFailures(kind,identity){
  clearLoginFailures(kind,identity);
  if(!sharedLimiter.enabled())return;
  try{await sharedLimiter.clear(kind,identity);}
  catch(e){console.warn("QOMUS_AUTH_SHARED_LIMIT_CLEAR_FAILED",e.code||"DB_ERROR");}
}

module.exports = { applySecurityHeaders, guardSensitiveRequest, getLoginBlockSeconds, recordLoginFailure, clearLoginFailures, getEffectiveLoginBlockSeconds, recordEffectiveLoginFailure, clearEffectiveLoginFailures };
