"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {auditOutbound}=require("../ai-egress-consent");

test("AI egress refuses secrets including unlabeled credentials",()=>{
 const secrets=[
   "password - superSecret123",
   "Parol:\nsecretValue123",
   "Authorization: Bearer abc.def.ghi",
   "access_token = sensitiveTokenValue",
   "secret key: serviceCredential123",
   "sk-or-v1-"+"a".repeat(40),
   "github_pat_"+"A".repeat(30),
   "ghp_"+"B".repeat(36),
   "AKIA"+"A".repeat(16),
   "eyJ"+"A".repeat(24)+"."+"eyJ"+"B".repeat(24)+"."+"C".repeat(16)
 ];
 for(const content of secrets) {
  assert.throws(()=>auditOutbound([{role:"user",content}]),/AI_PRIVACY_UNVERIFIED_CONTENT/,content.slice(0,18));
 }
});

test("AI egress retains safe legal text and redacts passport identifiers",()=>{
 const checked=auditOutbound([{role:"user",content:"Pasport AB1234567. FK 353-modda haqida tushuntiring."}]);
 assert.match(checked[0].content,/\[PASPORT_YASHIRILDI\]/);
 assert.match(checked[0].content,/353-modda/);
 assert.doesNotMatch(checked[0].content,/AB1234567/);
});

test("AI egress does not forward multimodal attachments or unverified objects",()=>{
 for(const content of [[{type:"image_url",image_url:{url:"https://example.com/secret.png"}}],{pdf:"unverified"}]){
  assert.throws(()=>auditOutbound([{role:"user",content}]),/AI_PRIVACY_UNVERIFIED_CONTENT/);
 }
});
