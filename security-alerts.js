"use strict";
const crypto = require("node:crypto");

// Security alerts never contain passwords, tokens, document text or full IP addresses.
// Configure SECURITY_ALERT_WEBHOOK only with a trusted, private HTTPS receiver.
// SECURITY_EVENT_HASH_KEY must be an independently generated secret.
const lastAlerts = new Map();
const MIN_ALERT_INTERVAL_MS = 10 * 60 * 1000;
const ALLOWED = new Set(["AUTH_RATE_LIMIT", "CROSS_SITE_POST", "INVALID_ORIGIN"]);

function alertEvent(category, address, path) {
  if (!ALLOWED.has(category)) return;
  const secret = process.env.SECURITY_EVENT_HASH_KEY;
  const webhook = process.env.SECURITY_ALERT_WEBHOOK;
  if (!secret || !webhook || !webhook.startsWith("https://")) return;
  let url;
  try { url = new URL(webhook); }
  catch (_) { return; }
  if (url.username || url.password) return;
  const id = crypto.createHmac("sha256", secret).update(String(address || "unknown")).digest("hex").slice(0, 16);
  const now = Date.now();
  const key = category + ":" + id;
  if (lastAlerts.size > 10000) {
    for (const [k, value] of lastAlerts) if (now - value > MIN_ALERT_INTERVAL_MS) lastAlerts.delete(k);
    if (lastAlerts.size > 10000) lastAlerts.clear();
  }
  if (now - (lastAlerts.get(key) || 0) < MIN_ALERT_INTERVAL_MS) return;
  lastAlerts.set(key, now);
  const safePath = String(path || "/").slice(0, 120).replace(/[^a-zA-Z0-9/_-]/g, "");
  // Never block the HTTP response waiting for notification delivery.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  Promise.resolve().then(() => fetch(url, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({event: "qomus.security", category, sourceId: id, path: safePath, at: new Date(now).toISOString()}),
    signal: controller.signal
  })).catch(() => {
    console.warn("SECURITY_ALERT_DELIVERY_FAILED", category);
  }).finally(() => clearTimeout(timeout));
}

module.exports = { alertEvent };
