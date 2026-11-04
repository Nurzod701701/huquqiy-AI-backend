"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const engine=require("../court-practice-reasoning");
const sample={
 caseNumber:"2-1001-2501/123",court:"Sinov fuqarolik sudi",decisionDate:"2025-06-01",
 sourceUrl:"https://public.sud.uz/report/CIVIL_OLD",
 facts:"Nikoh vaqtida sotib olingan uy er xotin o'rtasida umumiy mulk sifatida taqsimlash nizosi yuzaga keldi.",
 legalReasoning:"Sud nikoh davrida orttirilgan umumiy mol-mulkni taraflar kelishuvi hamda amaldagi oila qonunchiligiga muvofiq baholadi; xarid davri va mablag' manbalari tekshirildi.",
 outcome:"Sud da'voni qisman qanoatlantirdi.",legalNorms:"Oila qonunchiligi",reviewStatus:"approved"
};
test("empty approved corpus cannot be described as precedent",()=>{
 const result=engine.evidence("Nikoh davrida uy bo'lish",{corpus:{version:1,items:[]}});
 assert.equal(result.found,false);assert.match(result.instruction,/Do not invent/i);
});
test("reviewed judicial reasoning is retrieved with source",()=>{
 const result=engine.evidence("nikoh umumiy mulk uy sotib olingan",{corpus:{version:1,items:[sample]}});
 assert.equal(result.found,true);assert.equal(result.count,1);
 assert.match(result.instruction,/2-1001-2501\/123/);assert.match(result.instruction,/https:\/\/public.sud.uz/);
});
test("unapproved or forged-source decisions are ignored",()=>{
 assert.equal(engine.validated({...sample,reviewStatus:"draft"}),null);
 assert.equal(engine.validated({...sample,sourceUrl:"https://evil.example/report/CIVIL_OLD"}),null);
 assert.equal(engine.validated({...sample,legalReasoning:"short"}),null);
});
test("unrelated decisions are not misrepresented as analogies",()=>{
 const result=engine.retrieve("soliq transport bojxona",{corpus:{version:1,items:[sample]}});
 assert.equal(result.length,0);
});
