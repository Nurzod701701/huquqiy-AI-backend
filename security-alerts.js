"use strict";
const crypto = require("node:crypto");

// Security alerts never contain passwords, tokens, document text or full IP addresses.
// Configure SECURITY_ALERT_WEBHOOK only with a trusted, private HTTPS receiver.
// SECURITY_EVENT_HASH_KEY must be an independently generated secret.
const lastAlerts = new Map();
const MIN_ALERT_INTERVAL_MS = 10 * 60 * 1000;
const processSecret = crypto.randomBytes(32);
const ALLOWED = new Set(["AUTH_RATE_LIMIT", "CROSS_SITE_POST", "INVALID_ORIGIN"]);

function alertEvent(category, address, path) {
  if (!ALLOWED.has(category)) return;
  const secret = process.env.SECURITY_EVENT_HASH_KEY || processSecret;
  const webhook = process.env.SECURITY_ALERT_WEBHOOK;
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
  // Persistent application logs can feed Render alert integrations.
  // No raw addresses or user secrets are ever logged.
  console.warn("QOMUS_SECURITY_EVENT", JSON.stringify({category,sourceId:id,path:safePath,at:new Date(now).toISOString()}));
  let target = "";
  let payload;
  let headers = {"Content-Type":"application/json"};
  if (webhook && webhook.startsWith("https://")) {
    try {
      const parsed = new URL(webhook);
      if (!parsed.username && !parsed.password) {
        target = parsed.toString();
        payload = {event:"qomus.security",category,sourceId:id,path:safePath,at:new Date(now).toISOString()};
      }
    } catch (_) {}
  }
  // Resend fallback only when the owner has explicitly configured sender and receiver.
  if (!target && process.env.SECURITY_ALERT_EMAIL && process.env.EMAIL_FROM && process.env.RESEND_API_KEY) {
    target = "https://api.resend.com/emails";
    headers.Authorization = "Bearer " + process.env.RESEND_API_KEY;
    payload = {from:process.env.EMAIL_FROM,to:[process.env.SECURITY_ALERT_EMAIL],
      subject:"QOMUS xavfsizlik ogohlantirishi: " + category,
      text:"Event: " + category + "\\nPath: " + safePath + "\\nAnonymous source: " + id + "\\nTime: " + new Date(now).toISOString()};
  }
  if (!target) return;
  // Never block the HTTP response waiting for notification delivery.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  Promise.resolve().then(() => fetch(target, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal: controller.signal
  })).then(response => {
    if (!response.ok) {
      // Do not log response bodies: providers can return sensitive details.
      console.warn("SECURITY_ALERT_DELIVERY_FAILED", category, "HTTP", response.status);
    }
  }).catch(() => {
    console.warn("SECURITY_ALERT_DELIVERY_FAILED", category);
  }).finally(() => clearTimeout(timeout));
}

module.exports = { alertEvent };
