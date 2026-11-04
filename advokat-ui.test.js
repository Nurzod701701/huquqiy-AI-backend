"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const pages={
 "/advokat-pro":require("./advokat-home"),
 "/advokat-pro/documents":require("./advokat-pro"),
 "/advokat-pro/check":require("./advokat-check"),
 "/advokat-pro/grounded":require("./advokat-grounded"),
 "/advokat-pro/court-practice":require("./advokat-court-practice"),
 "/advokat-pro/cases":lang=>require("./advokat-cases-calendar")(lang,"cases"),
 "/advokat-pro/calendar":lang=>require("./advokat-cases-calendar")(lang,"calendar")
};
const wrap=require("./advokat-language");
const langs=["uz","ru","en"];
let checks=0;
for(const lang of langs){
 for(const [path,fn] of Object.entries(pages)){
  const raw=path==="/advokat-pro/documents"?fn(lang,(_lang,_active,content)=>"<html><head></head><body>"+content+"</body></html>"):fn(lang);
  const html=path==="/advokat-pro"?raw:wrap(lang,path,raw);
  assert.match(html,/<!doctype html>|<html>/i,path+" must be HTML");
  assert.doesNotMatch(html,/>undefined(?:<|\s)/i,path+" missing translation");
  assert.doesNotMatch(html,/>null(?:<|\s)/i,path+" missing content");
  if(path!=="/advokat-pro"){
   for(const l of langs)assert.ok(html.includes('href="'+path+'?lang='+l+'"'),path+" must stay on same path for "+l);
   assert.ok(html.includes('aria-current="page"'),path+" must label active language");
  }else{
   for(const l of langs)assert.ok(html.includes('href="/advokat-pro?lang='+l+'"'));
   assert.ok(html.includes('href="/advokat-pro/grounded?lang='+lang+'"'));
   assert.ok(html.includes('href="/advokat-pro/documents?lang='+lang+'"'));
   assert.ok(html.includes('href="/advokat-pro/cases?lang='+lang+'"'));
   assert.ok(html.includes('href="/advokat-pro/calendar?lang='+lang+'"'));
  }
  if(path==="/advokat-pro/cases"||path==="/advokat-pro/calendar"){
    for(const id of ["caseForm","taskForm","caseList","taskList","caseName","taskName","taskCase","dueDate","export","import","clear"]){
      assert.equal((html.match(new RegExp('id="'+id+'"',"g"))||[]).length,1,path+" missing "+id);
    }
  }
  const inline=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  for(const [,script] of inline)new Function(script);
  if(path==="/advokat-pro/documents"){
   for(const id of ["apAdd","apFeedback","apGenerate","apSave","apLoad","apWord","apPrint","apTxt"]){
    assert.equal((html.match(new RegExp('id="'+id+'"',"g"))||[]).length,1,path+" id "+id);
   }
   assert.ok(html.includes('href="/advokat-pro/check?lang='+lang+'"'));
   assert.ok(html.includes('href="/advokat-pro?lang='+lang+'"'));
  }
  checks++;
 }
}
const server=fs.readFileSync("server.js","utf8");
for(const path of Object.keys(pages)){
 if(path==="/advokat-pro")continue;
 assert.ok(server.includes('pathname === "'+path+'"'),"server route "+path);
}
assert.ok(server.includes(".lang a"),"Advocate home language must preserve route and hash");
console.log("Advokat PRO regressions passed:",checks,"pages across 3 languages; all scripts compile and language links are same-page");
