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

test("VERIUS common navigation renders accessible dual-audience structure in all languages",()=>{
 const start=server.indexOf("function navigation(lang) {");
 const end=server.indexOf("// ======================================================\\n// APP LAYOUT",start);
 assert.ok(start>=0 && end>start,"navigation section must exist");
 const snippet=server.slice(start,end);
 const nav=new Function("getLang","q","tr","languageMenu",snippet+"\\nreturn navigation;")(
   x=>x,x=>"?lang="+x,(_lang,key)=>key,()=>"<span>Languages</span>"
 );
 for(const lang of ["uz","ru","en"]){
   const html=nav(lang);
   assert.match(html,/class="navlinks"/);
   assert.match(html,/class="veriusServiceMenu"/);
   assert.match(html,/class="veriusMobileServices"/);
   assert.match(html,/aria-controls="mobileNav" aria-expanded="false"/);
   assert.match(html,/panel\.classList\.toggle\("show"\)/);
   assert.match(html,/event\.key==="Escape"/);
   for(const route of ["/fuqarolar","/advokat-pro","/ai","/questionnaire","/documents","/legal-review","/calculators","/employment","/sources","/court","/login"]){
     assert.ok(html.includes('href="'+route+'?lang='+lang+'"'),lang+": missing "+route);
   }
   assert.equal((html.match(/<details\\b/g)||[]).length,(html.match(/<\\/details>/g)||[]).length);
   assert.equal((html.match(/<div\\b/g)||[]).length,(html.match(/<\\/div>/g)||[]).length);
   const script=html.match(/<script>([\\s\\S]*?)<\\/script>/);
   assert.ok(script,"menu controller must exist");
   assert.doesNotThrow(()=>new Function(script[1]));
 }
});
test("VERIUS shared page includes accessibility and no top-level court link",()=>{
 assert.match(server,/class="veriusSkipLink"/);
 assert.match(server,/id="verius-main"/);
 assert.match(server,/<meta name="description"/);
 const app=server.slice(server.indexOf("function appLayout("),server.indexOf("function footer("));
 assert.doesNotMatch(app,/\\["court", "\/court", "⌖"/);
 const footer=server.slice(server.indexOf("function footer("),server.indexOf("function page("));
 assert.doesNotMatch(footer,/href="\/court/);
 assert.match(footer,/href="\/advokat-pro/);
});
