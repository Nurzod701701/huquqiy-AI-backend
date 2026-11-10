"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {auditOutbound,sanitizeText}=require("../ai-egress-consent");
const source=fs.readFileSync(path.join(__dirname,"..","server.js"),"utf8");
test("AI answers use bounded configurable output and verified source policy",()=>{
 assert.match(source,/const AI_MAX_TOKENS = Math\.min\(1200, Math\.max\(450,/);
 assert.match(source,/max_tokens: AI_MAX_TOKENS/);
 assert.match(source,/Never guess an article number, legal deadline, penalty, amount/);
 assert.match(source,/LIVE LEXUZ CHECK FAILED/);
 assert.match(source,/OPENROUTER_RATE_LIMIT/);
});
test("AI egress redacts sensitive identifiers and removes message metadata",()=>{
 const cases=["Mening pasportim AA1234567","JSHSHIR: 12345678901234","Email: legal@example.com","Bank karta 8600 1234 5678 9012"];
 for(const source of cases){
  const text=sanitizeText(source);
  assert.notEqual(text,source,"must redact "+source);
  const messages=auditOutbound([{role:"user",content:source,metadata:{secret:"do-not-send"}}]);
  assert.ok(!JSON.stringify(messages).includes("do-not-send"));
 }
});
test("AI egress refuses opaque attachments and passwords",()=>{
 assert.throws(()=>auditOutbound([{role:"user",content:[{type:"image_url",image_url:{url:"data:image/png;base64,AAA"}}]}]),/AI_PRIVACY_UNVERIFIED_CONTENT/);
 assert.throws(()=>auditOutbound([{role:"user",content:"password: secret-demo-value"}]),/AI_PRIVACY_UNVERIFIED_CONTENT/);
});
