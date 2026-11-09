"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const {isOfficialLexuzUrl, fetchOfficialLexuzHtml, MAX_LEXUZ_HTML_BYTES} = require("../official-lexuz-fetch");
const {applySecurityHeaders} = require("../security-hardening");

const official = "https://lex.uz/docs/-6257288";
test("LexUZ allowlist rejects remote hosts, credentials, insecure transport and query strings", () => {
 assert.equal(isOfficialLexuzUrl(official), true);
 for (const url of [
  "http://lex.uz/docs/-6257288",
  "https://lex.uz.evil.invalid/docs/-6257288",
  "https://example.invalid/docs/-6257288",
  "https://user:pass@lex.uz/docs/-6257288",
  "https://lex.uz/docs/-6257288?redirect=https://example.invalid",
  "https://lex.uz/other/-6257288"
 ]) assert.equal(isOfficialLexuzUrl(url), false, url);
});
test("LexUZ retrieval never follows redirects", async () => {
 await assert.rejects(fetchOfficialLexuzHtml(official, async (url, options) => {
  assert.equal(url, official);
  assert.equal(options.redirect, "manual");
  return new Response(null, {status:302, headers:{location:"https://example.invalid/private"}});
 }), /LEXUZ_FETCH_FAILED/);
});
test("LexUZ retrieval rejects non-HTML and oversized responses", async () => {
 await assert.rejects(fetchOfficialLexuzHtml(official, async () =>
  new Response("{}", {status:200,headers:{"content-type":"application/json"}})), /LEXUZ_INVALID_CONTENT_TYPE/);
 await assert.rejects(fetchOfficialLexuzHtml(official, async () =>
  new Response("hi", {status:200,headers:{"content-type":"text/html","content-length":String(MAX_LEXUZ_HTML_BYTES+1)}})), /LEXUZ_RESPONSE_TOO_LARGE/);
 await assert.rejects(fetchOfficialLexuzHtml(official, async () =>
  new Response("x".repeat(MAX_LEXUZ_HTML_BYTES+1), {status:200,headers:{"content-type":"text/html"}})), /LEXUZ_RESPONSE_TOO_LARGE/);
});
test("LexUZ retrieval accepts bounded official HTML", async () => {
 assert.equal(await fetchOfficialLexuzHtml(official, async () =>
  new Response("<html>Test</html>", {status:200,headers:{"content-type":"text/html"}})), "<html>Test</html>");
});
test("QOMUS browser security headers do not reveal sensitive URL referrers", () => {
 const headers = new Map();
 applySecurityHeaders({headers:{"x-forwarded-proto":"https"},socket:{encrypted:false}}, {setHeader:(key,value)=>headers.set(key,value)});
 assert.equal(headers.get("Referrer-Policy"),"no-referrer");
 assert.equal(headers.get("Cross-Origin-Opener-Policy"),"same-origin");
 assert.equal(headers.get("X-Permitted-Cross-Domain-Policies"),"none");
 assert.equal(headers.get("Strict-Transport-Security"),"max-age=31536000");
});
