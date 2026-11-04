"use strict";
const assert=require("node:assert/strict");
const casePage=require("./advokat-cases-calendar");
const advocatePage=require("./advokat-pro");
let count=0;
for(const lang of ["uz","ru","en"]){
 for(const section of ["cases","calendar"]){
  const html=casePage(lang,section);
  assert.ok(html.includes('lang="'+lang+'"'));
  const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
  new Function(code);
  for(const id of ["caseForm","caseName","taskForm","taskName","dueDate","taskCase","caseList","taskList","import","export","clear"]){
   assert.equal((html.match(new RegExp('id="'+id+'"',"g"))||[]).length,1,id+" duplicated or missing");
  }
  const lines=code.split("\n");
  const helpers=lines.filter(s=>/^function (goodDate|safe|model)\(/.test(s)).join("\n");
  const {goodDate,model}=new Function("v",helpers+";return {goodDate,model}")({20:"Invalid input"});
  assert.equal(goodDate("2028-02-29"),true);
  assert.equal(goodDate("2027-02-29"),false);
  assert.equal(goodDate("2026-02-30"),false);
  assert.equal(goodDate("2026-13-01"),false);
  assert.equal(goodDate("2026-11-05"),true);
  const base={v:1,cases:[{id:"case00001",title:"Matter 1"}],tasks:[{id:"task00001",title:"Check",date:"2026-11-05",caseId:"case00001",done:false}]};
  assert.deepEqual(model(base),base);
  const bad=[
   {...base,cases:[base.cases[0],base.cases[0]]},
   {...base,tasks:[base.tasks[0],base.tasks[0]]},
   {...base,tasks:[{...base.tasks[0],date:"2026-02-30"}]},
   {...base,tasks:[{...base.tasks[0],caseId:"unknown00"}]},
   {...base,tasks:[{...base.tasks[0],title:""}]},
   {...base,cases:[{...base.cases[0],title:""}]},
   {...base,tasks:new Array(121).fill(base.tasks[0])},
   {v:2,cases:[],tasks:[]}
  ];
  bad.forEach(item=>assert.throws(()=>model(item)));
  count++;
 }
 const html=advocatePage(lang,(_lang,_active,body)=>"<html><head></head><body>"+body+"</body></html>");
 const js=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 new Function(js);
 assert.match(js,/function documentReady\(/);
 assert.match(js,/if\(!documentReady\(\)\)return;/);
 assert.match(js,/missing=fields\.filter/);
 assert.match(js,/stale=false/);
 count++;
}
console.log("Quality tests passed:",count,"rendered pages and data validation scenarios");
