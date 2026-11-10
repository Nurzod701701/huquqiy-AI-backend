"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),vm=require("node:vm"),fs=require("node:fs"),path=require("node:path");
const {analyzeEvidenceText,RULES,linkFor}=require("../criminal-evidence-analyzer");
const {evidenceReviewPage}=require("../advokat-evidence-review");
const {DOC_TYPES,draftDocument}=require("../criminal-procedural-drafts");
const {criminalDraftPage}=require("../advokat-criminal-draft-page");
const workbench=require("../advokat-criminal-workbench");
const server=fs.readFileSync(path.join(__dirname,"..","server.js"),"utf8");
test("evidence preflight highlights review gaps but never invents a legal verdict",()=>{
 const result=analyzeEvidenceText("2026-11-10 kuni tergovchi tomonidan guvoh ishtirokida tintuv bayonnomasi tuzildi va imzolandi. Dalil manbasi alohida ko‘rsatildi.");
 assert.equal(result.ok,true);
 assert.equal(result.checks.length,8);
 assert.ok(result.mentioned>=4);
 assert.ok(result.needsReview>=1);
 assert.ok(result.checks.every(c=>["mentioned","not_found"].includes(c.status)));
 assert.ok(result.sources.some(x=>x.number==="95¹"));
 assert.ok(!JSON.stringify(result).includes("noqonuniy deb topildi"));
 assert.ok(linkFor("95¹").includes("lex.uz"));
});
test("coercion and defence concerns trigger caution flags, not automatic invalidity",()=>{
 const result=analyzeEvidenceText("Ushbu hujjat bo‘yicha himoyachisiz ko‘rsatuv olingani, bosim o‘tkazilgani va qalbakilashtirish ehtimoli haqida da’vo mavjud.");
 assert.ok(result.ok);
 assert.ok(result.flags.some(f=>f.id==="denied"));
 assert.ok(result.flags.some(f=>f.id==="altered"));
});
test("short or empty evidence never generates a full analysis",()=>{
 assert.equal(analyzeEvidenceText("").code,"TEXT_TOO_SHORT");
 assert.equal(analyzeEvidenceText("salom").ok,false);
});
test("three procedural drafting variants require factual fields and preserve uncertainty",()=>{
 assert.deepEqual(Object.keys(DOC_TYPES),["evidence_request","admissibility","additional_check"]);
 const incomplete=draftDocument({type:"admissibility",facts:"Faktlar"});
 assert.equal(incomplete.ok,false);
 assert.ok(incomplete.missing.includes("authority"));
 const info={authority:"Tergovchiga",lawyer:"Advokat: sinov",caseReference:"QA-2026",facts:"Guvoh ko‘rsatuvining rasmiy qaydi tekshirilmoqda.",evidence:"So‘roq bayonnomasining nusxasi",relevance:"Holatni aniqlash uchun muhim",action:"Bayonnoma olinishi va tekshirilishini so‘rayman."};
 for(const type of Object.keys(DOC_TYPES)){
  const output=draftDocument({...info,type,issue:"Dalil qonuniyligi yuzasidan taxminiy e’tiroz"});
  assert.equal(output.ok,true);
  assert.ok(output.text.includes(info.evidence));
  assert.ok(output.text.includes(info.action));
  assert.ok(output.text.includes("https://lex.uz/docs/-111460"));
  assert.match(output.text,/LOYIHA/);
 }
});
for(const lang of ["uz","ru","en"]){
 test("evidence upload page renders and browser analyzer compiles "+lang,()=>{
  const html=evidenceReviewPage(lang);
  assert.ok(html.includes('lang="'+lang+'"'));
  assert.match(html,/id="evidenceFile"/);
  assert.match(html,/id="evidenceText"/);
  assert.match(html,/id="consent"/);
  assert.match(html,/id="analyze"/);
  assert.match(html,/claim-evidence-extract/);
  assert.match(html,/\.pdf,\.docx,\.txt/);
  assert.match(html,/TXT/);
  assert.match(html,/id="results"/);
  const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script);new vm.Script(script);
 });
 test("draft editor supports all motions, editing and Word export "+lang,()=>{
  const html=criminalDraftPage(lang);
  assert.ok(html.includes('lang="'+lang+'"'));
  assert.equal((html.match(/<option value=/g)||[]).length,3);
  for(const id of ["authority","lawyer","caseReference","facts","evidence","relevance","action"])assert.ok(html.includes('data-field="'+id+'"'));
  assert.match(html,/id="editable"/);
  assert.match(html,/id="word"/);
  assert.match(html,/application\/msword/);
  assert.doesNotMatch(html,/fetch\(|XMLHttpRequest|localStorage|sessionStorage/);
  const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script);new vm.Script(script);
 });
 test("professional workbench links to both new tools "+lang,()=>{
  const html=workbench.advocateCriminalWorkbench(lang);
  assert.ok(html.includes('href="/advokat-pro/criminal/evidence-review?lang='+lang+'"'));
  assert.ok(html.includes('href="/advokat-pro/criminal/draft?lang='+lang+'"'));
 });
}
test("server registers upload and isolated GET endpoints; no new database dependencies",()=>{
 assert.match(server,/pathname === "\/advokat-pro\/criminal\/evidence-review"/);
 assert.match(server,/pathname === "\/advokat-pro\/criminal\/draft"/);
 assert.match(server,/pathname === "\/claim-evidence-extract"/);
 assert.match(server,/function claimEvidenceUpload\(req\)/);
 assert.ok(RULES.every(r=>r.refs.length>0));
});
