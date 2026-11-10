"use strict";
const test=require("node:test"), assert=require("node:assert/strict"), vm=require("node:vm");
const {DETAILS,TITLES}=require("../criminal-advice-details");
const {scenarioAdvisorPage,SCENARIOS,ARTICLES}=require("../criminal-scenario-advisor");

for(const lang of ["uz","ru","en"]){
 test("all six situations include expanded safe citizen and advocate guidance "+lang,()=>{
  assert.ok(TITLES[lang].immediate && TITLES[lang].documents && TITLES[lang].caution);
  for(const scenario of SCENARIOS[lang]){
   const detail=DETAILS[lang][scenario.id];
   assert.ok(detail,lang+":"+scenario.id);
   for(const role of ["citizen","advocate"]){
    for(const category of ["immediate","documents","caution"]){
     const lines=detail[role][category];
     assert.ok(Array.isArray(lines)&&lines.length>=2,lang+":"+scenario.id+":"+role+":"+category);
     for(const line of lines)assert.ok(typeof line==="string" && line.length>24);
    }
   }
   for(const ref of scenario.refs)assert.ok(ARTICLES[ref]);
  }
 });
 for(const role of ["citizen","advocate"]){
  test("browser "+lang+"/"+role+" embeds detailed sections and preserves no-upload behavior",()=>{
   const html=scenarioAdvisorPage(lang,role);
   assert.match(html,/advice-section/);
   assert.match(html,/"details":/);
   assert.match(html,/baseSteps/);
   assert.match(html,/c\.details\[data\.role\]/);
   assert.match(html,/id="result"/);
   assert.match(html,/https:\/\/lex\.uz\/docs\//);
   assert.doesNotMatch(html,/fetch\(|XMLHttpRequest|localStorage|sessionStorage|<form[^>]+action=/);
   const match=html.match(/<script>([\s\S]*?)<\/script>/);
   assert.ok(match);
   new vm.Script(match[1]);
   assert.ok(html.includes('lang="'+lang+'"'));
  });
 }
}
