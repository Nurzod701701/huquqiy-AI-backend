"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {spawn}=require("node:child_process");
const {setTimeout:delay}=require("node:timers/promises");
const crypto=require("node:crypto");
const {sanitizeText,auditOutbound,tokenFor,checkToken}=require("../ai-egress-consent");
test("signed preview expires, rejects altered content and requires opt-in",()=>{
 const p={question:sanitizeText("Passport AB1234567. Qanday yo‘l tutaman?")};
 const signed=tokenFor(p,Date.now()-1000);
 assert.equal(checkToken(p,signed),true);
 assert.equal(checkToken({question:p.question+"!"},signed),false);
 assert.equal(checkToken(p,tokenFor(p,Date.now()-11*60*1000)),false);
});
test("external egress rejects unverified media and high-risk secrets",()=>{
 assert.throws(()=>auditOutbound([{role:"user",content:[{type:"image_url",image_url:{url:"data:private"}}]}]),/AI_PRIVACY_UNVERIFIED_CONTENT/);
 assert.throws(()=>auditOutbound([{role:"user",content:"password: myVerySecretPassword"}]),/AI_PRIVACY_UNVERIFIED_CONTENT/);
 assert.throws(()=>auditOutbound([{role:"user",content:"data:image/png;base64,PRIVATE"}]),/AI_PRIVACY_UNVERIFIED_CONTENT/);
 assert.throws(()=>auditOutbound([{role:"system",content:"-----BEGIN PRIVATE KEY-----"}]),/AI_PRIVACY_UNVERIFIED_CONTENT/);
 const filtered=auditOutbound([{role:"user",content:"Safe legal question",metadata:{secret:"SECRET-METADATA"}}]);
 assert.equal(filtered[0].metadata,undefined);
 const checked=auditOutbound([{role:"user",content:"AB1234567 is my passport"}]);
 assert.doesNotMatch(checked[0].content,/AB1234567/);
});
test("AI egress rejects credentials in JSON, bearer headers, provider tokens and URLs",()=>{
 const secrets=[
  '{"api_key":"secret-value-123456"}',
  '{"refresh_token":"refresh-value-123456"}',
  '{"password":"my-private-password"}',
  "Authorization: Bearer abcdef1234567890.abcdef1234567890",
  "ghp_abcdefghijklmnopqrstuvwxyz123456",
  "sk-abcdefghijklmnopqrstuvwxyz123456",
  "https://example.invalid/?access_token=abcdefghijklmnop",
  "https://example.invalid/?api_key=abcdefghijklmnop"
 ];
 for(const secret of secrets)
   assert.throws(()=>auditOutbound([{role:"user",content:secret}]),/AI_PRIVACY_UNVERIFIED_CONTENT/,secret.slice(0,25));
 const normal=auditOutbound([{role:"user",content:"Mehnat kodeksi 123-modda bo'yicha yordam bering."}]);
 assert.match(normal[0].content,/Mehnat kodeksi/);
});
test("AI and document review require signed consent before any external AI call", {timeout:20000},async()=>{
 const port=39000+Math.floor(crypto.randomInt(1,2000));
 const child=spawn(process.execPath,["server.js"],{cwd:process.cwd(),env:{...process.env,PORT:String(port),NODE_ENV:"test",OPENROUTER_API_KEY:"",ACCOUNT_DATA_FILE:"/tmp/qomus-consent-qa-nonexistent-"+port+".json"},stdio:"ignore"});
 const host="http://127.0.0.1:"+port;
 const formHeaders={"content-type":"application/x-www-form-urlencoded","origin":host};
 async function post(route,body){return fetch(host+route,{method:"POST",redirect:"manual",headers:formHeaders,body:new URLSearchParams(body)});}
 try{
  let started=false;
  for(let i=0;i<60;i++){try{const r=await fetch(host+"/ai");if(r.ok){started=true;break;}}catch(_){}await delay(150);}
  assert.ok(started,"QOMUS QA server did not start");
  const direct=await post("/ai-result",{question:"Mehnat huquqi nima?"});
  assert.equal(direct.status,403,"direct AI route without consent must be rejected");
  const question="Passport AA1234567. Ish haqimni qanday olaman?";
  const preview=await post("/ai-preview",{question});
  assert.equal(preview.status,200);
  const body=await preview.text();
  assert.doesNotMatch(body,/AA1234567/,"raw passport must never appear in preview");
  assert.match(body,/PASPORT_YASHIRILDI/);
  const token=body.match(/name="aiConsentToken" value="([^"]+)"/)?.[1];
  assert.ok(token,"signed preview token must be embedded");
  const safe=sanitizeText(question);
  const withoutOptIn=await post("/ai-result",{question:safe,aiConsentToken:token});
  assert.equal(withoutOptIn.status,403);
  const tampered=await post("/ai-result",{question:safe+" altered",aiConsent:"yes",aiConsentToken:token});
  assert.equal(tampered.status,403);
  const approved=await post("/ai-result",{question:safe,aiConsent:"yes",aiConsentToken:token});
  assert.equal(approved.status,200,"signed consent should reach the existing AI response handler");
  // Additional AI forms must not bypass explicit signed approval.
  for(const route of ["/questionnaire-result","/claim-result","/business-result","/employment-result"]) {
    const draft={issue:"Mehnat masalasi",facts:"Passport AA1234567",mode:"analysis"};
    const first=await post(route,draft);
    assert.equal(first.status,200,"preview on "+route);
    const firstHtml=await first.text();
    assert.match(firstHtml,/aiConsentToken/,"signed consent required "+route);
    assert.doesNotMatch(firstHtml,/AA1234567/,"raw PII absent from preview "+route);
    const signed=firstHtml.match(/name="aiConsentToken" value="([^"]+)"/)?.[1];
    const reject=await post(route,{issue:draft.issue,facts:sanitizeText(draft.facts),mode:draft.mode,aiConsent:"yes",aiConsentToken:"invalid"});
    assert.equal(reject.status,403,"tampered consent rejected "+route);
    const approved=await post(route,{issue:draft.issue,facts:sanitizeText(draft.facts),mode:draft.mode,aiConsent:"yes",aiConsentToken:signed});
    assert.equal(approved.status,200,"approved request forwarded "+route);
  }
  const reviewDirect=await post("/legal-review-result",{documentText:"A".repeat(100)});
  assert.equal(reviewDirect.status,403);
  const docPayload={documentText:"Shartnoma. "+"Mazmun ".repeat(20)+" Passport AA1234567",documentType:"contract",legalArea:"employment",extraContext:""};
  const review=await post("/legal-review-preview",docPayload);
  assert.equal(review.status,200);
  const reviewHtml=await review.text();
  assert.doesNotMatch(reviewHtml,/AA1234567/);
  const reviewToken=reviewHtml.match(/name="aiConsentToken" value="([^"]+)"/)?.[1]; assert.ok(reviewToken);
  const reviewed={...docPayload,documentText:sanitizeText(docPayload.documentText)};
  const blocked=await post("/legal-review-result",{...reviewed,aiConsentToken:reviewToken});
  assert.equal(blocked.status,403);
  const permitted=await post("/legal-review-result",{...reviewed,aiConsentToken:reviewToken,aiConsent:"yes"});
  assert.equal(permitted.status,200);
 }finally{child.kill("SIGTERM");}
});
