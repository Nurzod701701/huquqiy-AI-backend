"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const drafts=require("../advokat-draft-store");
const quality=require("../advokat-document-quality");
const {normalizedAdvokatWorkspace,mergeAdvokatWorkspaces}=require("../advokat-workspace-store");
const lawyerPage=require("../advokat-pro");
const calendarPage=require("../advokat-cases-calendar");
const server=fs.readFileSync(path.join(__dirname,"..","server.js"),"utf8");
function sample(){return {v:1,type:"debt",fields:{Client:"Test mijoz",Opponent:"Test qarzdor",Subject:"Qarz undirish",Facts:"Shartli qarz",Demand:"Qaytarish",Address:"Shartli sud",Date:"2026-11-17",Law:"LexUZ hujjatini tekshirish",Amount:"100000"},attachments:["Tilxat"],checks:["Shartnoma yoki tilxat"],draft:"HUJJAT LOYIHASI — shartli test"}}
test("draft import is explicit, validated, ownership-bound and idempotent",()=>{
 const source=JSON.stringify(sample()),db={documents:[],cases:[{id:"CAS-A",userId:"u1",title:"Mening ishim"},{id:"CAS-B",userId:"u2",title:"Begona ish"}]};
 const p=drafts.importPlan(db,"u1",source,"CAS-B");
 assert.equal(p.record.caseId,null,"cannot attach another person's case");
 assert.equal(p.record.userId,"u1");
 assert.equal(p.record.source,"advokat-pro-json");
 assert.equal(p.record.sourcePayload.fields.Client,"Test mijoz");
 db.documents.push({...p.record,id:"DOC1"});
 assert.equal(drafts.importPlan(db,"u1",source).existing.id,"DOC1");
 assert.equal(drafts.importPlan(db,"u2",source,"CAS-B").record.caseId,"CAS-B");
 const linked=drafts.importPlan(db,"u1",JSON.stringify({...sample(),draft:"Yangi tahrir"}),"CAS-A");
 assert.equal(linked.record.caseId,"CAS-A");
 assert.equal(db.documents.length,1,"planning must not mutate the database");
});
test("draft validation rejects wrong format, wrong type, huge data and empty documents",()=>{
 for(const bad of ["invalid",JSON.stringify({v:1,type:"wrong",fields:{}}),JSON.stringify({...sample(),draft:"X".repeat(50001)}),JSON.stringify({...sample(),fields:{},draft:""}),"x".repeat(100001)]){
  assert.throws(()=>drafts.parseDraft(bad));
 }
});
test("import form never uploads without explicit checkbox and links only passed cases",()=>{
 const html=drafts.importPanel("uz",[{id:"CAS-A",caseNo:"CASE-2026-0001",title:"Test"}]);
 assert.match(html,/name="consent"/);
 assert.match(html,/name="caseId"/);
 assert.match(html,/CAS-A/);
 assert.match(html,/advokatImportForm/);
 assert.doesNotMatch(html,/type="file"[^>]+name="payload"/);
 assert.doesNotMatch(html,/CAS-B/);
});
test("workspace JSON import preserves existing records even with ID collisions",()=>{
 const current=normalizedAdvokatWorkspace({v:1,cases:[{id:"aaaaaaaa",title:"Eski ish"}],tasks:[{id:"bbbbbbbb",title:"Eski vazifa",date:"2026-11-17",caseId:"aaaaaaaa",done:false}]});
 const imported=normalizedAdvokatWorkspace({v:1,cases:[{id:"aaaaaaaa",title:"Yangi ish"}],tasks:[{id:"bbbbbbbb",title:"Yangi vazifa",date:"2026-11-18",caseId:"aaaaaaaa",done:false}]});
 let idNo=0;const merged=normalizedAdvokatWorkspace(mergeAdvokatWorkspaces(current,imported,()=>["cccccccc","dddddddd"][idNo++]));
 assert.equal(merged.cases.length,2);
 assert.equal(merged.cases[0].title,"Eski ish");
 assert.equal(merged.tasks[0].title,"Eski vazifa");
 assert.equal(merged.tasks[1].caseId,merged.cases[1].id);
 assert.equal(current.cases.length,1,"original must not mutate");
});
test("duplicate workspace import stays idempotent, capacity rejects without mutation",()=>{
 const a={v:1,cases:[{id:"aaaaaaaa",title:"Qarz"}],tasks:[]};
 assert.deepEqual(mergeAdvokatWorkspaces(a,a,()=>{throw Error("unneeded")}),a);
 const full={v:1,cases:Array.from({length:60},(_,i)=>({id:"case"+String(i).padStart(4,"0"),title:"Ish "+i})),tasks:[]};
 assert.throws(()=>mergeAdvokatWorkspaces(full,a,()=>{throw Error("wrong")}),/IMPORT_CAPACITY/);
 assert.equal(full.cases.length,60);
});
test("professional preflight differentiates missing fields and unverified legal sources",()=>{
 const base=sample();
 const bad=quality.reviewAdvokatDraft("debt",{...base.fields,Date:"",Law:"",Amount:""},[],[]);
 assert.ok(bad.blocking.some(t=>t.includes("Sana")));
 assert.ok(bad.review.some(t=>t.includes("Talab summasi")));
 assert.ok(bad.review.some(t=>t.includes("LexUZ")));
 assert.ok(bad.review.some(t=>t.includes("Shartnoma yoki tilxat")));
 const good=quality.reviewAdvokatDraft("request",base.fields,["Adresat tashkilot","Vakolat hujjatlari","So‘raladigan ma’lumotlar"],["Order nusxasi"]);
 assert.ok(!good.blocking.some(t=>t.includes("Qarshi taraf")));
 assert.ok(good.review.some(t=>t.includes("avtomatik tasdiqlanmagan")));
 assert.ok(!good.review.some(t=>t.includes("to‘liq tasdiqlandi")));
 assert.equal(Object.keys(quality.RULES).length,10);
});
test("existing Advocate document interface and privacy controls preserved",()=>{
 const page=lawyerPage("uz",(_lang,_active,html)=>html);
 assert.match(page,/id="apCloud"/);
 assert.match(page,/id="apCloudConsent"/);
 assert.match(page,/reviewAdvokatDraft/);
 assert.match(page,/https:\/\/lex\.uz\/docs\/-54503/);
 assert.match(page,/\/account\/documents\/import/);
 assert.match(page,/id="apSave"/);
 assert.match(page,/id="apWord"/);
 const calendar=calendarPage("uz","cases");
 assert.match(calendar,/mergeAdvokatWorkspaces/);
 assert.match(calendar,/serverVersion/);
 assert.match(calendar,/Import mavjud ishlarni o‘chirmaydi/);
});
test("server protects imported drafts and versioned workspace edits",()=>{
 assert.match(server,/pathname==="\/account\/documents\/import"/);
 assert.match(server,/pathname==="\/account\/document\/export"/);
 assert.match(server,/f\.consent!=="yes"/);
 assert.match(server,/db\.cases\.filter\(c=>c\.userId===user\.id\)/);
 assert.match(server,/x\.id===url\.searchParams\.get\("id"\)&&x\.userId===user\.id/);
 assert.match(server,/advokatWorkspaceVersions/);
 assert.match(server,/input\.version!==undefined/);
 assert.match(server,/QOMUS_PG_WRITE_CONFLICT/);
});
