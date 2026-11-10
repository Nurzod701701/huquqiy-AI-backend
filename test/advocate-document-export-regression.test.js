"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"..","advokat-pro.js"),"utf8");
test("advocate request uses destination instead of requiring a lawsuit defendant",()=>{
 assert.match(source,/if\(current\(\)\[0\]!=="request"\)fields\.push\(\["Opponent","Qarshi taraf"\]\)/);
 assert.match(source,/if\(!v\.Address\)missing\.push\(current\(\)\[0\]==="request"\?"Adresat tashkilot":"Sud yoki tashkilot"\)/);
 assert.match(source,/t\[0\]==="request"\?\(v\.Opponent\|\|v\.Address\|\|"\[adresat\]"\)/);
});
test("export blocks missing destination and legal reference placeholders",()=>{
 assert.match(source,/manzil\|tekshirilgan normalar/);
 assert.match(source,/if\(!documentReady\(\)\)return/);
 assert.match(source,/form\.action="\/claim-download"/);
});

test("court-practice empty results offer only official report fallback",()=>{
 const court=fs.readFileSync(path.join(__dirname,"..","advokat-court-practice.js"),"utf8");
 assert.match(court,/data\.sourceUrl/);
 assert.match(court,/u\.hostname===\\?"public\.sud\.uz\\?"/);
 assert.match(court,/u\.pathname\.startsWith\(\\?"\/report\/\\?"\)/);
 assert.match(court,/Rasmiy portaldagi ushbu toifani ochish/);
});
