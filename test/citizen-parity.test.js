"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const server=fs.readFileSync(path.join(__dirname,"..","server.js"),"utf8");
const citizenHome=require("../citizen-home");
const existingRoutes=["/ai","/calculators","/pension","/documents","/legal-review","/questionnaire","/family","/employment","/business","/sources","/court","/login"];
for(const lang of ["uz","ru","en"]){
 test("citizen premium portal has all module links in "+lang,()=>{
  const html=citizenHome(lang);
  assert.match(html,/<header class="bar">/);
  assert.match(html,/<main id="main">/);
  assert.equal((html.match(/<article class="card">/g)||[]).length,12);
  for(const route of existingRoutes) assert.ok(html.includes('href="'+route+'?lang='+lang+'"'),route);
  assert.ok(html.includes("/advokat-pro?lang="+lang));
  assert.ok(html.includes("/fuqarolar?lang="+lang));
  assert.ok(html.includes('aria-current="page"'));
 });
}
test("citizen entry renders premium hub and preserves classic fallback",()=>{
 assert.match(server,/pathname === "\/fuqarolar"/);
 assert.match(server,/url\.searchParams\.get\("classic"\)==="1" \? homePage\(lang\) : require\("\.\/citizen-home"\)\(lang\)/);
 assert.match(server,/url\.searchParams\.get\("portal"\) === "fuqarolar"/);
});
test("citizen modules keep shared sidebar and global navigation",()=>{
 assert.match(server,/\["citizens", "\/fuqarolar"/);
 assert.ok(server.includes('href="/advokat-pro'));
 assert.ok(server.includes('href="/fuqarolar'));
});
