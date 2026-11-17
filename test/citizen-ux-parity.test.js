"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const citizen=require("../citizen-home");
const server=fs.readFileSync(path.join(__dirname,"..","server.js"),"utf8");
const routes=["/ai","/calculators","/pension","/documents","/legal-review","/questionnaire","/family","/employment","/business","/sources","/court","/account"];
test("Citizens hub preserves all 12 services, real account route, mobile navigation",()=>{
 for(const lang of ["uz","ru","en"]){
  const html=citizen(lang);
  assert.equal((html.match(/<article class="card">/g)||[]).length,12);
  for(const path of routes)assert.ok(html.includes('href="'+path+'?lang='+lang+'"'),path+" missing in "+lang);
  assert.ok(html.includes('class="pill" href="/account?lang='+lang+'"'));
  assert.ok(html.includes('href="/advokat-pro?lang='+lang+'"'));
  assert.ok(html.includes('href="/criminal?lang='+lang+'"'));
  assert.doesNotMatch(html,/href="\/login\?lang=/);
  assert.match(html,/\.lang a\{min-width:37px;min-height:44px/);
  assert.match(html,/@media\(max-width:390px\)/);
  assert.match(html,/@media\(hover:none\),\(pointer:coarse\)/);
  assert.match(html,/prefers-reduced-motion/);
  assert.match(html,/href="#main"/);
  assert.match(html,/<main id="main">/);
  assert.match(html,/aria-current="page"/);
  assert.doesNotMatch(html,/>undefined(?:\s|<)/);
 }
});
test("Citizens employment contract PDF uses popup fallback without changing editor contents",()=>{
 assert.match(server,/contractMobilePrintFallback/);
 assert.match(server,/document\.getElementById\('contractEditor'\)/);
 assert.match(server,/window\.print\(\)/);
 assert.match(server,/printContractPdf/);
 assert.match(server,/window\.addEventListener\('afterprint',clean/);
 assert.match(server,/editor\.innerHTML/);
 assert.match(server,/saveContractWord/);
 assert.match(server,/\/employment-contracts/);
 assert.match(server,/\/employment-contract-download/);
});
test("Citizens contract inline script is valid JavaScript",()=>{
 const source=server.slice(server.indexOf("function contractLibraryPage("),server.indexOf("function contractDownload("));
 assert.ok(source.length>2500);
 const inline=source.match(/<script>\s*([\s\S]*?)\s*<\/script>/);
 assert.ok(inline,"contract library embedded script missing");
 // Embedded server-side interpolation is inside ordinary string literals and is valid JS.
 new vm.Script(inline[1]);
});
test("citizen home does not modify or expose Advocate PRO, admin or account internals",()=>{
 const content=fs.readFileSync(path.join(__dirname,"..","citizen-home.js"),"utf8");
 assert.doesNotMatch(content,/require\("\.\/advokat/);
 assert.doesNotMatch(content,/DATABASE_URL|process\.env|localStorage|sessionStorage/);
 assert.match(server,/pathname === "\/fuqarolar"/);
 assert.match(server,/pathname === "\/advokat-pro"/);
 assert.match(server,/\/admin\/security/);
});
