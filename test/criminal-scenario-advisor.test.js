"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const {scenarioAdvisorPage,ARTICLES,urlForArticle,SCENARIOS}=require("../criminal-scenario-advisor");
const {criminalQuestionsPage}=require("../criminal-questions");
const server=fs.readFileSync(path.join(__dirname,"..","server.js"),"utf8");
test("sources use verified article numbers and official LexUZ documents",()=>{
 const expected={"jpk-48":48,"jpk-221":221,"jpk-46":46,"jpk-66":66,"jk-168":168};
 for(const [key,number] of Object.entries(expected)){
  const a=ARTICLES[key];
  assert.equal(a.number,number);
  assert.equal(a.url,a.code==="JK"?"https://lex.uz/docs/-111453":"https://lex.uz/docs/-111460");
  assert.ok(urlForArticle(a).includes("#:~:text="),"text fragment may focus article on supported browsers");
  assert.ok(urlForArticle(a).includes(encodeURIComponent(a.fragment)));
 }
});
for(const lang of ["uz","ru","en"]){
 for(const role of ["citizen","advocate"]){
  test("scenario advisor "+role+" "+lang+" renders six options, legal sources and executable browser JS",()=>{
   const html=scenarioAdvisorPage(lang,role);
   assert.ok(html.includes('<html lang="'+lang+'">'));
   assert.equal((html.match(/<option /g)||[]).length,6);
   assert.match(html,/id="caseType"/);
   assert.match(html,/id="caseNotes"/);
   assert.match(html,/id="result"/);
   assert.match(html,/aria-live="polite"/);
   assert.match(html,/https:\/\/lex.uz\/docs\/-111453/);
   assert.match(html,/https:\/\/lex.uz\/docs\/-111460/);
   const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
   assert.equal(scripts.length,1);
   new vm.Script(scripts[0][1],{filename:"criminal-advisor-"+lang+"-"+role+".js"});
   assert.doesNotMatch(html,/<form[^>]+action=/);
   assert.doesNotMatch(html,/fetch\(|XMLHttpRequest|localStorage|sessionStorage/);
   assert.match(html,/VERIUS/);
   const cases=SCENARIOS[lang];
   assert.equal(cases.length,6);
   for(const c of cases){
    assert.ok(Array.isArray(c[role])&&c[role].length>=3,c.id);
    assert.ok(c.refs.length);
    for(const ref of c.refs)assert.ok(ARTICLES[ref],ref);
   }
  });
  test("existing criminal questions page opens interactive assistant "+role+" "+lang,()=>{
   const html=criminalQuestionsPage(lang,role);
   const url=role==="citizen"?"/criminal/advisor":"/advokat-pro/criminal/advisor";
   assert.ok(html.includes('href="'+url+'?lang='+lang+'"'));
   assert.equal((html.match(/<details class="qa">/g)||[]).length,8);
  });
 }
}
test("GET-only criminal advisor routes registered without disturbing existing routes",()=>{
 assert.match(server,/pathname === "\/criminal\/advisor"/);
 assert.match(server,/pathname === "\/advokat-pro\/criminal\/advisor"/);
 assert.match(server,/require\("\.\/criminal-scenario-advisor"\)\.scenarioAdvisorPage/);
 assert.match(server,/pathname === "\/criminal"/);
 assert.match(server,/pathname === "\/advokat-pro\/criminal"/);
});
