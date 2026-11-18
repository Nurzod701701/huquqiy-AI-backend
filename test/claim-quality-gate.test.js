"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {reviewClaim,renderReviewHtml}=require("../claim-quality-gate");
const base={claimant:"Da’vogar",defendant:"Javobgar",claimant_contact:"Toshkent sh.",defendant_contact:"Toshkent sh.",facts:"2026-yilda qarz berilgan.",request:"15 000 000 so‘m qarz undirish.",evidence:"Tilxat nusxasi; asl nusxa da’vogarda."};
test("completed form is still for lawyer review, never auto-certified",()=>{
 const r=reviewClaim(base,"DA’VO ARIZASI");
 assert.equal(r.status,"ADVOKATNING YAKUNIY TEKSHIRUVIGA TAYYOR");
 assert.equal(r.verifiedByLawyer,false);
 assert.match(r.warnings.join(" "),/LexUZ/);
});
test("missing contact or evidence requests completion",()=>{
 const r=reviewClaim({...base,evidence:"",defendant_contact:""},"DA’VO ARIZASI");
 assert.equal(r.status,"MA’LUMOTLARNI TO‘LDIRISH ZARUR");
 assert.ok(r.problems.length>=2);
});
test("penalty without proved basis is not ready",()=>{
 const r=reviewClaim({...base,request:"15 000 000 qarz va 500 000 penya undirilsin",facts:"Qarz qaytarilmagan."},"DA’VO ARIZASI");
 assert.equal(r.status,"MA’LUMOTLARNI TO‘LDIRISH ZARUR");
 assert.match(r.warnings.join(" "),/Penya/);
});
test("invented-looking receipt and case number trigger warning",()=>{
 const r=reviewClaim(base,"Ish raqami: 123456. Davlat boji to‘langani, kvitansiya ilova.");
 assert.equal(r.status,"MA’LUMOTLARNI TO‘LDIRISH ZARUR");
 assert.match(r.warnings.join(" "),/kvitansiya/);
});
test("missing core fields remain draft",()=>{
 assert.equal(reviewClaim({...base,claimant:""}).status,"QORALAMA");
});
test("html warnings are escaped",()=>{
 const escaped=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
 const html=renderReviewHtml({status:"QORALAMA",warnings:["<script>alert(1)</script>"]},escaped);
 assert.doesNotMatch(html,/<script>/);
});
