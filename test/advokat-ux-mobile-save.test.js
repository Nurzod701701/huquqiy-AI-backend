"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),vm=require("node:vm");
const documents=require("../advokat-pro"),calendar=require("../advokat-cases-calendar");
const home=require("../advokat-home");
const wrap=require("../advokat-language");
const urls=["/advokat-pro/documents","/advokat-pro/cases","/advokat-pro/calendar"];
test("revised document PDF action handles blocked popups without exposing HTML or personal data",()=>{
 for(const lang of ["uz","ru","en"]){
  const html=wrap(lang,urls[0],documents(lang,(_lang,_page,content)=>"<!doctype html><html><head></head><body>"+content+"</body></html>"));
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  for(const [,src] of scripts)new vm.Script(src);
  const code=scripts.map(m=>m[1]).join("\n");
  assert.match(code,/window\.open/);
  assert.match(code,/frame\.contentDocument/);
  assert.match(code,/frame\.contentWindow\.print\(\)/);
  assert.match(code,/download\("verius-hujjat\.txt",txt\)/);
  assert.match(code,/doc\.body\.textContent=txt/);
  assert.doesNotMatch(code,/doc\.body\.innerHTML=txt/);
  for(const id of ["apWord","apPrint","apTxt","apSave","apCloud"])assert.ok(html.includes('id="'+id+'"'));
 }
});
test("cases and calendar display pending save status and avoid blind navigation before writes finish",()=>{
 for(const lang of ["uz","ru","en"]){
  for(const kind of ["cases","calendar"]){
   const html=wrap(lang,"/advokat-pro/"+kind,calendar(lang,kind));
   const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
   new vm.Script(code);
   assert.match(code,/pendingSaves\+\+/);
   assert.match(code,/pendingSaves=Math\.max\(0,pendingSaves-1\)/);
   assert.match(code,/beforeunload/);
   assert.match(code,/if\(serverMode&&pendingSaves>0\)/);
   assert.match(code,/new URLSearchParams\(\{data:snapshot,version:String\(serverVersion\)\}\)/);
   assert.match(code,/Neon bazasida saqlandi/);
   for(const id of ["caseForm","taskForm","import","export","clear"])assert.ok(html.includes('id="'+id+'"'));
  }
 }
});
test("existing responsive premium navigation still works in three languages",()=>{
 for(const lang of ["uz","ru","en"]){
  const html=home(lang);
  assert.ok(html.includes('href="/advokat-pro?lang='+lang+'"'));
  for(const path of urls){
   const h=wrap(lang,path,'<!doctype html><html><head></head><body><header>Hi</header><main>Content</main></body></html>');
   assert.ok(h.includes('href="'+path+'?lang='+lang+'"'));
   assert.ok(h.includes('href="/account?lang='+lang+'"'));
  }
 }
});
