"use strict";
// Fetch only the explicitly selected official LexUZ document URL.
// Do not follow cross-origin redirects or read unbounded response bodies.
const MAX_LEXUZ_HTML_BYTES = 1800000;
function isOfficialLexuzUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" && u.hostname.toLowerCase() === "lex.uz" &&
      !u.username && !u.password && !u.port &&
      /^\/(?:docs|uz\/docs|ru\/docs|en\/docs)\/-?\d+\/?$/.test(u.pathname) &&
      !u.search && !u.hash;
  } catch (_) { return false; }
}
async function fetchOfficialLexuzHtml(url, fetchImpl = fetch, signal) {
  if (!isOfficialLexuzUrl(url)) throw new Error("LEXUZ_UNTRUSTED_SOURCE");
  const response = await fetchImpl(url, {
    signal, redirect: "manual",
    headers: { "Accept": "text/html", "User-Agent": "QOMUS-LegalResearch/1.0" }
  });
  if (!response.ok || (response.status >= 300 && response.status < 400)) throw new Error("LEXUZ_FETCH_FAILED");
  if (!/text\/html/i.test(response.headers.get("content-type") || "")) throw new Error("LEXUZ_INVALID_CONTENT_TYPE");
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_LEXUZ_HTML_BYTES) throw new Error("LEXUZ_RESPONSE_TOO_LARGE");
  if (!response.body || typeof response.body.getReader !== "function") throw new Error("LEXUZ_STREAM_REQUIRED");
  const reader = response.body.getReader();
  const chunks = []; let total = 0;
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_LEXUZ_HTML_BYTES) throw new Error("LEXUZ_RESPONSE_TOO_LARGE");
      chunks.push(value);
    }
  } finally { try { await reader.cancel(); } catch (_) {} }
  return Buffer.concat(chunks.map(c => Buffer.from(c)), total).toString("utf8");
}
module.exports = {isOfficialLexuzUrl, fetchOfficialLexuzHtml, MAX_LEXUZ_HTML_BYTES};
