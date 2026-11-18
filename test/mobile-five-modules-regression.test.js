"use strict";
const test=require("node:test"), assert=require("node:assert/strict"), fs=require("node:fs"), path=require("node:path");
const s=fs.readFileSync(path.join(__dirname,"..","server.js"),"utf8");
test("AI route and privacy restrictions remain present",()=>{
  assert.match(s,/pathname === "\/ai"/);
  assert.match(s,/async function callAI\(/);
  assert.match(s,/GEMINI_API_KEY/);
  assert.match(s,/AI_RATE_LIMIT/);
});
test("claim generates a document and warns before court submission",()=>{
  assert.match(s,/async function claimResultPage\(/);
  assert.match(s,/reviewClaim\(form,answer\)/);
  assert.match(s,/qualityGate\.problems\.length/);
});
test("DOCX is a binary file download, not HTML response",()=>{
  assert.match(s,/pathname === "\/claim-download"/);
  assert.match(s,/claimDocxBuffer\(claimText\)/);
  assert.match(s,/application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document/);
  assert.match(s,/Content-Disposition/);
});
test("PDF printing does not fail closed when mobile popups are blocked",()=>{
  assert.match(s,/function saveClaimPdf\(\)/);
  assert.match(s,/if\(!w\)\{/);
  assert.match(s,/claimMobilePrintFallback/);
  assert.match(s,/window\.print\(\)/);
  assert.match(s,/window\.addEventListener\("afterprint",cleanup/);
});
test("calculators and pension routes are still available",()=>{
  assert.match(s,/pathname === "\/calculators"/);
  assert.match(s,/pathname === "\/pension"/);
  assert.match(s,/calculatorsPage\(lang\)/);
  assert.match(s,/pensionPage\(lang\)/);
});
test("authenticated account and logout functionality remains",()=>{
  assert.match(s,/pathname==="\/account"/);
  assert.match(s,/accountRequire\(req,res,lang\)/);
  assert.match(s,/pathname==="\/logout"/);
  assert.match(s,/accountClearSession\(req,res\)/);
});
