"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),vm=require("node:vm"),fs=require("node:fs"),path=require("node:path");
const shell=require("../advokat-ui-shell"),wrapper=require("../advokat-language");
const home=require("../advokat-home"),advokatDoc=require("../advokat-pro");
const cases=require("../advokat-cases-calendar"),check=require("../advokat-check");
const grounded=require("../advokat-grounded"),court=require("../advokat-court-practice");
const workbench=require("../advokat-criminal-workbench");
const evidence=require("../advokat-evidence-review");
const criminalDraft=require("../advokat-criminal-draft-page");
const criminalQuestions=require("../criminal-questions");
const advisor=require("../criminal-scenario-advisor");
const server=fs.readFileSync(path.join(__dirname,"..","server.js"),"utf8");
const paths={
 "/advokat-pro":lang=>home(lang),
 "/advokat-pro/documents":lang=>wrapper(lang,"/advokat-pro/documents",advokatDoc(lang,(_l,_page,body)=>"<!doctype html><html><head></head><body>"+body+"</body></html>")),
 "/advokat-pro/cases":lang=>wrapper(lang,"/advokat-pro/cases",cases(lang,"cases")),
 "/advokat-pro/calendar":lang=>wrapper(lang,"/advokat-pro/calendar",cases(lang,"calendar")),
 "/advokat-pro/check":lang=>wrapper(lang,"/advokat-pro/check",check(lang)),
 "/advokat-pro/grounded":lang=>wrapper(lang,"/advokat-pro/grounded",grounded(lang)),
 "/advokat-pro/court-practice":lang=>wrapper(lang,"/advokat-pro/court-practice",court(lang)),
 "/advokat-pro/criminal/workbench":lang=>wrapper(lang,"/advokat-pro/criminal/workbench",workbench.advocateCriminalWorkbench(lang)),
 "/advokat-pro/criminal/evidence-review":lang=>wrapper(lang,"/advokat-pro/criminal/evidence-review",evidence.evidenceReviewPage(lang)),
 "/advokat-pro/criminal/draft":lang=>wrapper(lang,"/advokat-pro/criminal/draft",criminalDraft.criminalDraftPage(lang)),
 "/advokat-pro/criminal":lang=>wrapper(lang,"/advokat-pro/criminal",criminalQuestions.criminalQuestionsPage(lang,"advocate")),
 "/advokat-pro/criminal/advisor":lang=>wrapper(lang,"/advokat-pro/criminal/advisor",advisor.scenarioAdvisorPage(lang,"advocate"))
};
test("navigation preserves the same route for all languages, account entry and accessible active state",()=>{
 for(const lang of ["uz","ru","en"]){
  for(const [path,build] of Object.entries(paths)){
   const html=build(lang);
   assert.equal((html.match(/class="apUnifiedNav"/g)||[]).length,1,lang+" "+path);
   assert.equal((html.match(/class="apNavScroll"/g)||[]).length,1,path);
   for(const locale of ["uz","ru","en"])assert.ok(html.includes('href="'+path+'?lang='+locale+'"'),"missing same-page language "+path+" "+locale);
   assert.ok(html.includes('href="/account?lang='+lang+'"'),"account entry "+path);
   assert.match(html,/aria-label=/);
   assert.match(html,/min-height:44px/);
   assert.match(html,/@media\(max-width:650px\)/);
   assert.match(html,/@media\(prefers-reduced-motion:reduce\)/);
   assert.match(html,/advokat-unified-shell-style/);
   assert.doesNotMatch(html,/class="advokatLanguageBar"/,"floating language control must be removed");
   assert.doesNotMatch(html,/>undefined(?:<|\s)/);
   for(const [,code] of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(code);
  }
 }
});
test("home retains existing native header language/one account and does not duplicate",()=>{
 const html=home("uz");
 assert.equal((html.match(/class="apNavAccount"/g)||[]).length,0);
 assert.equal((html.match(/class="apNavLanguages"/g)||[]).length,0);
 assert.ok(html.includes('class="cabinetLink"'));
 assert.ok(html.includes('href="/advokat-pro?lang=ru"'));
 assert.ok(html.includes('href="/advokat-pro/cases?lang=uz"'));
 assert.ok(html.includes('href="/advokat-pro/calendar?lang=uz"'));
 assert.match(html,/faqat rozilik bilan kabinetga saqlanadi/i);
});
test("subpage toolbar has one active section and correct language switch",()=>{
 for(const lang of ["uz","ru","en"]){
  const path="/advokat-pro/grounded",html=paths[path](lang);
  assert.equal((html.match(/class="apNavLink"[^>]+aria-current="page"/g)||[]).length,1);
  assert.equal((html.match(/class="apNavLanguages"/g)||[]).length,1);
  assert.ok(html.includes('href="'+path+'?lang=ru"'));
 }
 const nested=paths["/advokat-pro/criminal/evidence-review"]("uz");
 assert.ok(nested.includes('href="/advokat-pro/criminal/workbench?lang=uz" aria-current="page"'));
});
test("forms, actions, data handlers and client privacy preserved",()=>{
 for(const lang of ["uz","ru","en"]){
  const d=paths["/advokat-pro/documents"](lang);
  for(const id of ["apGenerate","apSave","apCloudConsent","apCloud","apWord","apPrint","apTxt","apDraft","apLoad"])
   assert.ok(d.includes('id="'+id+'"'),"missing document action "+id);
  const c=paths["/advokat-pro/cases"](lang);
  for(const id of ["caseForm","taskForm","caseList","taskList","import","export","clear","message"])
   assert.ok(c.includes('id="'+id+'"'),"missing case action "+id);
  assert.match(c,/serverVersion/);
  assert.match(c,/mergeAdvokatWorkspaces/);
  assert.match(d,/reviewAdvokatDraft/);
 }
 assert.match(server,/role==="advocate" \? require\("\.\/advokat-language"\)/);
 assert.ok(!shell.enhance("uz","/fuqarolar","<html><body>Citizen</body></html>").includes("apUnifiedNav"));
});
test("the shell does not tamper with existing inline scripts or double inject",()=>{
 const sample='<!doctype html><html><head><title>X</title></head><body><header>X</header><main><form id="preserve"><input id="field" value="raw"></form><script>window.__old=1;</script></main></body></html>';
 const once=shell.enhance("uz","/advokat-pro/check",sample),twice=shell.enhance("uz","/advokat-pro/check",once);
 assert.equal(once,twice);
 assert.ok(once.includes('<form id="preserve"><input id="field" value="raw"></form>'));
 assert.ok(once.includes('<script>window.__old=1;</script>'));
 assert.ok(once.indexOf('class="apUnifiedNav"')>once.indexOf("</header>"));
 assert.ok(once.indexOf('class="apUnifiedNav"')<once.indexOf("<main>"));
});
