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

test("VERIUS navigation renders both audiences and services in UZ/RU/EN",()=>{
 const start=server.indexOf("function navigation(lang) {");
 const end=server.indexOf("// ======================================================\n// APP LAYOUT",start);
 assert.ok(start>=0 && end>start);
 const snippet=server.slice(start,end);
 const nav=new Function("getLang","q","tr","languageMenu",snippet+"\nreturn navigation;")(
   x=>x,x=>"?lang="+x,(_lang,key)=>key,()=>"<span>Languages</span>"
 );
 for(const lang of ["uz","ru","en"]){
   const html=nav(lang);
   for(const marker of ['class="navlinks"','class="veriusServiceMenu"','class="veriusMobileServices"','aria-controls="mobileNav" aria-expanded="false"','panel.classList.toggle("show")','event.key==="Escape"']){
     assert.ok(html.includes(marker),lang+": "+marker);
   }
   for(const route of ["/fuqarolar","/advokat-pro","/ai","/questionnaire","/documents","/legal-review","/calculators","/employment","/sources","/court","/login"]){
     assert.ok(html.includes('href="'+route+'?lang='+lang+'"'),lang+": missing "+route);
   }
   assert.equal(html.split("<details").length,html.split("</details>").length);
   assert.equal(html.split("<div").length,html.split("</div>").length);
   const script=html.match(/<script>([\s\S]*?)<\/script>/);
   assert.ok(script);
   assert.doesNotThrow(()=>new Function(script[1]));
 }
});
test("VERIUS shared wrapper has accessibility and court is not top-level",()=>{
 assert.ok(server.includes('class="veriusSkipLink"'));
 assert.ok(server.includes('id="verius-main"'));
 assert.ok(server.includes('<meta name="description"'));
 const app=server.slice(server.indexOf("function appLayout("),server.indexOf("function footer("));
 assert.ok(!app.includes('["court", "/court", "⌖"'));
 const footer=server.slice(server.indexOf("function footer("),server.indexOf("function page("));
 assert.ok(!footer.includes('href="/court'));
 assert.ok(footer.includes('href="/advokat-pro'));
});
