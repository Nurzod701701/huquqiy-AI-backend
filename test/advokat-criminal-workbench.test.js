"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),vm=require("node:vm"),fs=require("node:fs"),path=require("node:path");
const {advocateCriminalWorkbench,WORKFLOWS,SOURCES,articleLink}=require("../advokat-criminal-workbench");
const advocateHome=require("../advokat-home");
const {criminalQuestionsPage}=require("../criminal-questions");
const citizenHome=require("../citizen-home");
const server=fs.readFileSync(path.join(__dirname,"..","server.js"),"utf8");
test("six distinct lawyer-focused workflows have seven tasks each and lawful source references",()=>{
 assert.deepEqual(WORKFLOWS.map(w=>w.id),["qualification","evidence","detention","motions","appeal","casefile"]);
 for(const flow of WORKFLOWS){
  assert.equal(flow.refs.length>=1,true,flow.id);
  for(const lang of ["uz","ru","en"]){
   assert.equal(flow.tasks[lang].length,7,flow.id+" "+lang);
   assert.ok(flow.labels[lang][0]);
  }
  for(const ref of flow.refs){
   assert.ok(SOURCES[ref[0]]);
   assert.ok(articleLink(ref).startsWith(SOURCES[ref[0]].url+"#:~:text="));
  }
 }
});
for(const lang of ["uz","ru","en"]){
 test("professional workbench "+lang+" renders six selectable case tools and compiles browser code",()=>{
  const html=advocateCriminalWorkbench(lang);
  assert.ok(html.includes('<html lang="'+lang+'">'));
  assert.equal((html.match(/class="task" data-task=/g)||[]).length,6);
  assert.match(html,/data-task="evidence"/);
  assert.match(html,/data-task="qualification"/);
  assert.match(html,/id="workspaceResult"/);
  assert.match(html,/id="export"/);
  assert.match(html,/id="reset"/);
  assert.match(html,/URL.createObjectURL/);
  assert.match(html,/https:\/\/lex.uz\/docs\/-111460/);
  assert.match(html,/https:\/\/lex.uz\/docs\/-111453/);
  assert.doesNotMatch(html,/fetch\(|XMLHttpRequest|localStorage|sessionStorage|<form[^>]+action=/);
  const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(js);
  new vm.Script(js);
 });
 test("advocate entry points use specialist workbench while citizen links remain unchanged "+lang,()=>{
  const adv=advocateHome(lang),questions=criminalQuestionsPage(lang,"advocate"),citizen=citizenHome(lang);
  const url="/advokat-pro/criminal/workbench?lang="+lang;
  assert.ok(adv.includes('href="'+url+'"'));
  assert.ok(questions.includes('href="'+url+'"'));
  assert.ok(!citizen.includes('href="/advokat-pro/criminal/workbench?lang='+lang+'"'));
  assert.ok(!citizen.includes("advokat-criminal-workbench"));
 });
}
test("server registers isolated GET workbench without changing public criminal advisor",()=>{
 assert.match(server,/pathname === "\/advokat-pro\/criminal\/workbench"/);
 assert.match(server,/require\("\.\/advokat-criminal-workbench"\)\.advocateCriminalWorkbench/);
 assert.match(server,/pathname === "\/criminal\/advisor"/);
});
