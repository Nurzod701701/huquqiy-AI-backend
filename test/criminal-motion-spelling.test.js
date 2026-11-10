"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),vm=require("node:vm");
const {correctSpelling,correctNarrativeFields,NARRATIVE_FIELDS,PRESERVE_FIELDS}=require("../criminal-motion-spelling");
const {criminalDraftPage}=require("../advokat-criminal-draft-page");
const {draftDocument}=require("../criminal-procedural-drafts");

test("known legal Uzbek typos corrected without altering facts or dates",()=>{
 const source="Hujjani sohtalashtirish haqida tumat qilgan. Komputer yozishmalrni tekshrib chiqing.";
 const result=correctSpelling(source);
 assert.ok(result.count>=5);
 assert.ok(result.text.includes("Hujjatni soxtalashtirish"));
 assert.ok(result.text.includes("tuhmat"));
 assert.ok(result.text.includes("Kompyuter yozishmalarni tekshirib"));
 assert.equal(correctSpelling("JPK 95¹-modda JK 168 1111 111252").text,"JPK 95¹-modda JK 168 1111 111252");
 assert.equal(correctSpelling("Ziyodullayev Nurzod Xurshidovich").text,"Ziyodullayev Nurzod Xurshidovich");
});

test("repeated passes are idempotent; correction preserves other free text",()=>{
 const source="Himoaymdagi shax bo'yicha malumotlarni tekshirib chiqing.";
 const first=correctSpelling(source);
 assert.ok(first.count>=2);
 assert.equal(correctSpelling(first.text).count,0);
 assert.ok(first.text.includes("himoyamdagi")||first.text.includes("Himoyamdagi"));
 assert.equal(correctSpelling("hech qanday bunday ish bo'lmagan").text,"hech qanday bunday ish bo'lmagan");
});

test("only narrative fields can be corrected; names, case IDs, charges are never changed",()=>{
 const f={authority:"Toshkent shahar sudiga",lawyer:"Sohtalashtirish Komputer",caseReference:"1111 111252",
 charge:"JK 168-modda",accused:"Tumat Ism",facts:"hujjani komputer orqali sohtalashtirish"},
 result=correctNarrativeFields(f);
 assert.equal(result.form.lawyer,f.lawyer);
 assert.equal(result.form.accused,f.accused);
 assert.equal(result.form.caseReference,f.caseReference);
 assert.equal(result.form.charge,f.charge);
 assert.equal(result.form.facts,"hujjatni kompyuter orqali soxtalashtirish");
 for(const k of PRESERVE_FIELDS)assert.ok(!NARRATIVE_FIELDS.includes(k));
});

for(const lang of ["uz","ru","en"]){
 test("criminal draft "+lang+" includes browser-local live correction and still exports Word",()=>{
  const html=criminalDraftPage(lang);
  assert.ok(html.includes('id="spellingStatus"'));
  assert.ok(html.includes('id="generate"'));
  assert.ok(html.includes('id="editable"'));
  assert.ok(html.includes('id="word" disabled'));
  assert.ok(html.includes('id="approval"'));
  assert.match(html,/application\/msword/);
  assert.doesNotMatch(html,/fetch\(|XMLHttpRequest|localStorage|sessionStorage/);
  const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(js);
  new vm.Script(js);
 });
}
test("corrected narrative content is included in the structured motion draft",()=>{
 const base={type:"admissibility",authority:"Toshkent shahar sudiga",lawyer:"Advokat",caseReference:"QA-01",
 facts:"Hujjani sohtalashtirish haqida gumon bor",evidence:"Komputer yozishmalrni",
 relevance:"Hujjatni tekshirish uchun",action:"Dalilni tekshirib chiqishni sorayman"};
 const {form,count}=correctNarrativeFields(base);
 const draft=draftDocument(form);
 assert.ok(draft.ok);
 assert.ok(count>=3);
 assert.ok(draft.text.includes("Hujjatni soxtalashtirish"));
 assert.ok(draft.text.includes("Kompyuter yozishmalarni"));
 assert.ok(draft.text.includes("so‘rayman"));
 assert.equal(draft.readyForSignature,false);
});
