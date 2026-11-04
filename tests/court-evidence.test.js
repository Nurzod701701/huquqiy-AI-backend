"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const {parseRecords,saveReviewed}=require("../scripts/import-reviewed-courts");
const {load,retrieve}=require("../court-practice-reasoning");
const dir=fs.mkdtempSync(path.join(os.tmpdir(),"qomus-court-test-"));
const input=path.join(dir,"incoming.json"),destination=path.join(dir,"reviewed.json");
function write(items){fs.writeFileSync(input,JSON.stringify({version:1,items}));}
const record={
 reviewStatus:"approved",caseNumber:"TEST-123",court:"Example test court",
 decisionDate:"2026-01-10",sourceUrl:"https://public.sud.uz/report/TEST",
 facts:"This is a fictional test scenario with enough detail for checking validation behavior only.",
 legalReasoning:"This is a fictional test reasoning paragraph. It is not a real judgment and must never be deployed as legal evidence. It only exercises code validation.",
 outcome:"Fictional test outcome",legalNorms:"Example"
};
try{
 write([record]);assert.equal(parseRecords(input).items.length,1);
 write([{...record,reviewStatus:"pending"}]);assert.throws(()=>parseRecords(input),/Unapproved/);
 write([{...record,sourceUrl:"https://example.org/decision"}]);assert.throws(()=>parseRecords(input),/Unapproved/);
 write([record,record]);assert.throws(()=>parseRecords(input),/Duplicate/);
 write([record]);assert.equal(saveReviewed(input,destination),1);
 process.env.QOMUS_COURT_CORPUS_PATH=destination;
 assert.equal(load().items.length,1);
 assert.equal(retrieve("fictional test scenario checking validation").length,1);
 process.env.QOMUS_COURT_CORPUS_PATH=path.join(dir,"missing.json");
 assert.equal(load().items.length,0);
 console.log("Court evidence import tests passed (fictional fixtures only)");
}finally{fs.rmSync(dir,{recursive:true,force:true});}
