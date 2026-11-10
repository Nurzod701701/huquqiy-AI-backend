"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {criminalQuestionsPage,SOURCES}=require("../criminal-questions");
const citizen=require("../citizen-home");
const advocate=require("../advokat-home");
const server=fs.readFileSync(path.join(__dirname,"..","server.js"),"utf8");

test("both criminal-law references point to actual LexUZ codes",()=>{
 assert.equal(SOURCES.jk,"https://lex.uz/docs/-111453");
 assert.equal(SOURCES.jpk,"https://lex.uz/docs/-111460");
});

for(const lang of ["uz","ru","en"]){
 for(const [role,route,back] of [["citizen","/criminal","/fuqarolar"],["advocate","/advokat-pro/criminal","/advokat-pro"]]){
  test("criminal "+role+" question page "+lang+" has 8 accessible sourced questions",()=>{
    const html=criminalQuestionsPage(lang,role);
    assert.match(html,/<html lang="/);
    assert.ok(html.includes('<html lang="'+lang+'">'));
    assert.ok(html.includes("VERIUS"));
    assert.equal((html.match(/<details class="qa">/g)||[]).length,8);
    assert.equal((html.match(/class="answer"/g)||[]).length,8);
    assert.ok(html.includes('href="'+back+'?lang='+lang+'"'));
    assert.ok(html.includes('href="'+SOURCES.jk+'"'));
    assert.ok(html.includes('href="'+SOURCES.jpk+'"'));
    assert.ok(html.includes('href="'+route+'?lang='+lang+'"'));
    assert.ok(html.includes('rel="noopener noreferrer"'));
    assert.equal((html.match(/<input|<textarea|<form/gi)||[]).length,0);
    assert.doesNotMatch(html,/<script|QOMUS/);
  });
 }
 test("criminal links appear on both main portal pages "+lang,()=>{
   const c=citizen(lang),a=advocate(lang);
   assert.ok(c.includes('href="/criminal?lang='+lang+'"'));
   assert.ok(a.includes('href="/advokat-pro/criminal/workbench?lang='+lang+'"'));
   assert.equal((c.match(/<article class="card">/g)||[]).length,12,"existing citizen modules retained");
   for(const old of ["/ai","/calculators","/pension","/documents","/login"]){
     assert.ok(c.includes('href="'+old+'?lang='+lang+'"'));
   }
   assert.ok(a.includes('href="/advokat-pro/documents?lang='+lang+'"'));
 });
}
test("criminal question routes are isolated GET handlers in HTTP server",()=>{
 assert.match(server,/pathname === "\/criminal"/);
 assert.match(server,/pathname === "\/advokat-pro\/criminal"/);
 assert.match(server,/require\("\.\/criminal-questions"\)\.criminalQuestionsPage/);
});
