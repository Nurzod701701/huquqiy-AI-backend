"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const portal=require("../portal-choice");
test("VERIUS homepage shows personal cabinet immediately in UZ RU EN",()=>{
 for(const lang of ["uz","ru","en"]){
  const html=portal(lang);
  assert.match(html,/portalAccountHero/);
  assert.match(html,/portalAccountLink/);
  assert.equal((html.match(new RegExp('href="/account\\?lang='+lang+'"','g'))||[]).length,2);
  assert.ok(html.indexOf('class="portalAccountHero"')<html.indexOf('class="intro"'));
  assert.ok(html.includes('href="/fuqarolar?lang='+lang+'"'));
  assert.ok(html.includes('href="/advokat-pro?lang='+lang+'"'));
 }
});
test("the entry page has no forced sign-in and retains responsive layout",()=>{
 const html=portal("uz");
 assert.match(html,/portalTopActions/);
 assert.match(html,/max-width:760px/);
 assert.match(html,/min-height:44px/);
 assert.doesNotMatch(html,/window\.location\s*=/);
});
