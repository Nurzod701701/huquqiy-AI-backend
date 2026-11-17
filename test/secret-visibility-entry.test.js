"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const portal=require("../portal-choice");
const script=require("../secret-visibility");
const server=fs.readFileSync(path.join(__dirname,"..","server.js"),"utf8");
test("single cabinet entry is in top header only, for all three languages",()=>{
 for(const lang of ["uz","ru","en"]){
  const html=portal(lang);
  assert.equal((html.match(new RegExp('href="/account\\?lang='+lang+'"','g'))||[]).length,1);
  assert.match(html,/class="portalAccountLink"/);
  assert.doesNotMatch(html,/class="portalAccountHero"/);
  assert.ok(html.includes('href="/fuqarolar?lang='+lang+'"'));
  assert.ok(html.includes('href="/advokat-pro?lang='+lang+'"'));
 }
});
test("visibility script supports passwords, verification codes and reset codes",()=>{
 assert.match(script,/input\[type="password"\]/);
 assert.match(script,/verify-email/);
 assert.match(script,/reset-password/);
 assert.match(script,/button\.type="button"/);
 assert.match(script,/aria-pressed/);
 assert.match(script,/input\.type=reveal\?"text":"password"/);
 assert.match(script,/DOMContentLoaded/);
});
test("secret visibility is injected by server without modifying authentication handlers",()=>{
 assert.match(server,/require\("\.\/secret-visibility"\)/);
 assert.match(server,/verius-secret-visibility-script/);
 assert.match(server,/accountVerifyPassword/);
 assert.match(server,/accountSixDigitCode/);
 assert.match(server,/accountClearSession/);
});
