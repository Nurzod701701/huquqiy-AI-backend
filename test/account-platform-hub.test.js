"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const hub=require("../account-platform-hub");
const advocateHome=require("../advokat-home");
const advocateCalendar=require("../advokat-cases-calendar");
const server=fs.readFileSync(path.join(__dirname,"..","server.js"),"utf8");

test("one account links to citizens, advocates, AI and document history in UZ RU EN",()=>{
 for(const lang of ["uz","ru","en"]){
  const html=hub.directory(lang);
  for(const href of ["/fuqarolar","/advokat-pro","/ai","/account/documents"])
   assert.ok(html.includes('href="'+href+"?lang="+lang+'"'),href+" missing for "+lang);
  assert.match(html,/verius-platform-hub/);
  assert.doesNotMatch(html,/href="\/sud(?:\?|")/);
 }
});
test("advocate stats count only selected workspace with safe empty defaults",()=>{
 assert.deepEqual(hub.counts(null),{cases:0,tasks:0});
 assert.deepEqual(hub.counts({v:1,cases:[{id:"a"},{id:"b"}],tasks:[{id:"c"}]}),{cases:2,tasks:1});
 const html=hub.advocate("uz",{v:1,cases:[{id:"m",title:"<img src=x onerror=alert(1)>"}],tasks:[]});
 assert.doesNotMatch(html,/<img/);
 assert.match(html,/>1<\/strong>/);
 assert.match(html,/\/advokat-pro\/calendar\?lang=uz/);
});
test("global navigation uses /account rather than /login, and account routes require session",()=>{
 assert.match(server,/class="desktopAccountLink"\s+href="\/account\$\{q\(lang\)\}"/);
 assert.match(server,/class="mobileAccountDirect"\s+href="\/account\$\{q\(lang\)\}"/);
 const start=server.indexOf('if(pathname.startsWith("/account"))');
 const end=server.indexOf('if(req.method==="GET" && pathname==="/account/modules")',start);
 assert.ok(start>0&&end>start);
 assert.match(server.slice(start,end),/accountRequire\(req,res,lang\)/);
 assert.match(server,/pathname==="\/account\/modules"/);
 assert.match(server,/pathname==="\/account\/advokat"/);
});
test("existing account data is scoped to signed-in user's id in both citizen and advocate read paths",()=>{
 assert.match(server,/db\.cases\.filter\(x=>x\.userId===user\.id\)/);
 assert.match(server,/db\.documents\.filter\(x=>x\.userId===user\.id\)/);
 assert.match(server,/db\.conversations\.filter\(x=>x\.userId===user\.id\)/);
 const scoped=(server.match(/db\.settings\?\.advokatWorkspaces\?\.\[user\.id\]/g)||[]).length;
 assert.ok(scoped>=3,"home, my cases, and advocate dashboard must use current user id");
 assert.match(server,/db\.settings\?\.advokatWorkspaces\?\.\[auth\.user\.id\]/);
});
test("Advokat landing and calendar link to same personal account",()=>{
 for(const lang of ["uz","ru","en"]){
  assert.ok(advocateHome(lang).includes('href="/account?lang='+lang+'"'));
  assert.ok(advocateCalendar(lang,"cases").includes('href="/account?lang='+lang+'"'));
  assert.ok(advocateCalendar(lang,"calendar").includes('href="/account?lang='+lang+'"'));
 }
});
