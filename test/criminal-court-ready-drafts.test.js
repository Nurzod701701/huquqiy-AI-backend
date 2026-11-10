"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),vm=require("node:vm");
const {draftDocument,validateDraft,DOC_TYPES}=require("../criminal-procedural-drafts");
const {criminalDraftPage}=require("../advokat-criminal-draft-page");
const sample={
 type:"admissibility",authority:"Toshkent shahar sudi",lawyer:"Advokat QA Sinov",orderNumber:"ORDER-01",
 caseReference:"QA-111",stage:"Sud muhokamasi",accused:"Himoyadagi fuqaro",charge:"JK modda, qism ish materialida ko‘rsatilgan",
 proceduralRole:"Ayblanuvchi",facts:"Himoya tarafining ta’kidlashicha, hujjat muallifligi bahsli.",
 evidence:"Bahsli hujjatning asl nusxasi va elektron yozishmalar",relevance:"Hujjatning muallifligi va voqea holatlari uchun muhim.",
 issue:"Elektron yozishmalar kelib chiqishi tekshirilmagan.",action:"Hujjatning yaratilgan vaqtini va muallifini tegishli tartibda tekshirish.",
 expertQuestions:"Hujjat qaysi uskunada va qachon tayyorlangani aniqlanadimi?",
 digitalProvenance:"Qonuniy usulda olingan asl fayl va uning yaxlitligini tekshirish.",
 attachments:"Elektron yozishma nusxasi (advokat tasdiqlaydi)",date:"2026-11-10",signature:"Advokat imzosi"
};
test("court-oriented document distinguishes defence position and investigation from established guilt",()=>{
 const r=draftDocument(sample);
 assert.equal(r.ok,true);assert.equal(r.readyForSignature,true);assert.deepEqual(r.warnings,[]);
 assert.ok(r.text.includes("HUQUQIY ASOS"));
 assert.ok(r.text.includes("I. ILTIMOSNOMA ASOSLARI"));
 assert.ok(r.text.includes("II. TEKSHIRILISHI"));
 assert.ok(r.text.includes("Ekspert yoki mutaxassis"));
 assert.ok(r.text.includes("Elektron ma’lumot"));
 assert.ok(r.text.includes("JPK 95¹-moddasi"));
 assert.ok(r.text.includes("Toshkent shahar sudi\n"));
 assert.ok(!r.text.includes("sudigaга")&&!r.text.includes("sudigaga"));
 assert.ok(r.text.includes(sample.evidence));
 assert.ok(r.sourceLinks.every(x=>x.url.startsWith("https://lex.uz/docs/-111460")));
});
test("missing case identifiers or lawyer identity prevent generation",()=>{
 const r=draftDocument({facts:"Hodisaga oid savollar"});
 assert.equal(r.ok,false);assert.ok(r.missing.includes("authority"));
});
test("future document date is flagged for counsel review",()=>{
 const r=draftDocument({...sample,date:"2099-12-06"});
 assert.equal(r.ok,true);
 assert.equal(r.readyForSignature,false);
 assert.ok(r.warnings.some(w=>w.includes("kelajakda")));
});
test("unsigned and incomplete case does not claim court readiness",()=>{
 const r=draftDocument({type:"admissibility",authority:"Sud",lawyer:"Advokat",caseReference:"QA",facts:"Asoslar",evidence:"Dalil",relevance:"Ahamiyati",action:"So‘rov"});
 assert.ok(r.ok);assert.equal(r.readyForSignature,false);
 assert.ok(r.warnings.some(x=>x.includes("orderi")));
 assert.ok(r.warnings.some(x=>x.includes("bosqichi")));
 assert.ok(r.warnings.some(x=>x.includes("Ayblov")));
 assert.ok(r.text.includes("imzosi"));
});
for(const type of Object.keys(DOC_TYPES)){
 test("procedural type "+type+" includes appropriate article guidance",()=>{
  const r=draftDocument({...sample,type});
  assert.equal(r.ok,true);assert.ok(r.text.includes("Yuqori")===false);
  if(type==="additional_check")assert.ok(r.text.includes("JPK 172-moddasiga"));
 });
}
for(const lang of ["uz","ru","en"]){
 test("court draft editor "+lang+" includes lawyer review gate and compiles",()=>{
  const html=criminalDraftPage(lang);
  for(const k of ["stage","accused","charge","orderNumber","expertQuestions","digitalProvenance","signature"]){
   assert.ok(html.includes('data-field="'+k+'"'),k);
  }
  assert.ok(html.includes('id="approval"'));
  assert.ok(html.includes('id="word" disabled'));
  assert.ok(html.includes("https://lex.uz/docs/-111460"));
  assert.doesNotMatch(html,/fetch\(|XMLHttpRequest|localStorage|sessionStorage/);
  const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(js);new vm.Script(js);
 });
}
