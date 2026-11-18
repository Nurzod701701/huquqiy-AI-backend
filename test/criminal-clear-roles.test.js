"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),vm=require("node:vm");
const {criminalQuestionsPage,SOURCES}=require("../criminal-questions");
const {scenarioAdvisorPage,SCENARIOS}=require("../criminal-scenario-advisor");
const {advocateCriminalWorkbench,WORKFLOWS}=require("../advokat-criminal-workbench");
for(const lang of ["uz","ru","en"]){
 for(const role of ["citizen","advocate"]){
  test("clear 3-step criminal guide "+lang+" "+role,()=>{
    const html=criminalQuestionsPage(lang,role);
    assert.equal((html.match(/class="guideStep"/g)||[]).length,3);
    assert.equal((html.match(/<details class="qa">/g)||[]).length,8);
    assert.equal((html.match(/class="answerLabel"/g)||[]).length,8);
    assert.equal((html.match(/class="sourceHint"/g)||[]).length,8);
    assert.match(html,/<ol class="guideSteps">/);
    assert.match(html,/grid-template-columns:1fr/);
    assert.match(html,/aria-label=/);
    assert.ok(html.includes('href="'+SOURCES.jk+'"'));
    assert.ok(html.includes('href="'+SOURCES.jpk+'"'));
    assert.ok(html.includes('href="'+(role==="citizen"?"/criminal/advisor":"/advokat-pro/criminal/workbench")+"?lang="+lang+'"'));
    assert.equal((html.match(/<input|<textarea|<form/gi)||[]).length,0,"no sensitive uploads on questions page");
    assert.ok(html.includes('href="'+(role==="citizen"?"/fuqarolar":"/advokat-pro")+"?lang="+lang+'"'));
  });
  test("existing criminal situation assistant remains private "+lang+" "+role,()=>{
    const html=scenarioAdvisorPage(lang,role);
    assert.match(html,/class="card quickHelp"/);
    assert.equal((html.match(/<option /g)||[]).length,6);
    const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
    assert.equal(scripts.length,1);
    new vm.Script(scripts[0][1]);
    assert.doesNotMatch(html,/fetch\(|XMLHttpRequest|localStorage|sessionStorage/);
    assert.match(html,/id="caseType"/);
    assert.match(html,/https:\/\/lex.uz\/docs\/-111460/);
  });
 }
 test("advocate criminal workbench remains complete and exportable "+lang,()=>{
   const html=advocateCriminalWorkbench(lang);
   assert.match(html,/class="workHint"/);
   assert.equal((html.match(/class="task" data-task=/g)||[]).length,6);
   assert.match(html,/id="export"/);
   assert.match(html,/id="reset"/);
   assert.match(html,/min-height:44px/);
   const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
   assert.ok(script);
   new vm.Script(script);
   assert.doesNotMatch(html,/fetch\(|XMLHttpRequest|localStorage|sessionStorage/);
 });
}
test("existing questions and checklists not modified in count",()=>{
 assert.equal(WORKFLOWS.length,6);
 for(const f of WORKFLOWS)for(const lang of ["uz","ru","en"])assert.equal(f.tasks[lang].length,7);
 for(const lang of ["uz","ru","en"])assert.equal(SCENARIOS[lang].length,6);
});
