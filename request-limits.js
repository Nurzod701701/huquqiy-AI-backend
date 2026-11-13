"use strict";
// Per-client sliding-window limits for expensive public endpoints
// (document parsing, DOCX export). In-memory: one Render instance.

// Client-supplied headers are spoofable. CF-Connecting-IP is honoured only when
// the deployment is really behind Cloudflare (TRUST_CF_CONNECTING_IP=yes).
// Otherwise use the right-most X-Forwarded-For entry: it is appended by the
// nearest (platform) proxy, so the client cannot choose it.
function clientKey(req) {
  if (process.env.TRUST_CF_CONNECTING_IP === "yes") {
    const cf = String(req.headers["cf-connecting-ip"] || "").trim();
    if (cf) return cf;
  }
  const xff = String(req.headers["x-forwarded-for"] || "").split(",").map(s => s.trim()).filter(Boolean);
  return xff.length ? xff[xff.length - 1] : String(req.socket && req.socket.remoteAddress || "unknown");
}

const buckets = new Map();
const RULES = Object.freeze({
  upload: { max: 12, windowMs: 10 * 60 * 1000 },   // PDF/DOCX parsing
  export: { max: 40, windowMs: 10 * 60 * 1000 }    // DOCX generation
});

function limited(req, name, now = Date.now()) {
  const rule = RULES[name];
  if (!rule) return false;
  const key = name + ":" + clientKey(req);
  const list = (buckets.get(key) || []).filter(t => now - t < rule.windowMs);
  if (list.length >= rule.max) { buckets.set(key, list); return true; }
  list.push(now); buckets.set(key, list);
  if (buckets.size > 20000) for (const [k, v] of buckets) if (!v.some(t => now - t < RULES[k.split(":")[0]].windowMs)) buckets.delete(k);
  return false;
}

module.exports = { clientKey, limited, RULES, _reset: () => buckets.clear() };
