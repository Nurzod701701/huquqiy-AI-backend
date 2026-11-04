"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {parse,filter,list,PAGES}=require("../public-judgments");
const row='<table><tr><td>1</td><td>Fuqarolik sudi</td><td>Birinchi instansiya</td><td>2-1003-2301/22593</td><td>Nikohdan ajratish</td><td>Sudya</td><td>16-10-2024</td><td>Qanoatlantirilgan</td><td>Yakunlangan</td><td><a href="/files/decision.pdf">PDF</a></td></tr></table>';
test("public court row fields stay aligned with case number",()=>{
 const items=parse(row,"civil");
 assert.equal(items.length,1);
 assert.equal(items[0].court,"Fuqarolik sudi");
 assert.equal(items[0].subject,"Nikohdan ajratish");
 assert.equal(items[0].date,"16-10-2024");
 assert.equal(items[0].pdfUrl,"https://public.sud.uz/files/decision.pdf");
 assert.equal(filter(items,"Nikoh").length,1);
 assert.equal(filter(items,"no-match").length,0);
});
test("untrusted PDF destination is not exposed",()=>{
 const html=row.replace("/files/decision.pdf","https://example.net/decision.pdf");
 assert.equal(parse(html,"civil")[0].pdfUrl,null);
});
test("invalid category never requests remote portal",async()=>{
 const value=await list("unknown");
 assert.equal(value.state,"invalid_category");
 assert.equal(value.items.length,0);
 assert.ok(PAGES.civil);
});
