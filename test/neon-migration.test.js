"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {inspect,tables}=require("../scripts/migrate-qomus-json-to-neon.js");
const blank=()=>({users:[],sessions:[],cases:[],documents:[],conversations:[],notifications:[],consents:[],auditLogs:[]});
test("valid empty snapshot accepted",()=>{
 const r=inspect(blank());assert.deepEqual(r.errors,[]);assert.equal(r.counts.users,0);
});
test("ownership checks reject orphan cases",()=>{
 const d=blank();d.cases.push({id:"CASE1",userId:"DOES_NOT_EXIST"});assert.ok(inspect(d).errors.some(e=>e.includes("orphan")));
});
test("duplicate user ids rejected before database connection",()=>{
 const d=blank();d.users.push({id:"u1",email:"a@test.invalid"},{id:"u1",email:"b@test.invalid"});
 assert.ok(inspect(d).errors.some(e=>e.includes("Duplicate")));
});
test("sessions not in migration tables: users must reauthenticate",()=>{
 assert.ok(!tables.some(t=>t.source==="sessions"));const d=blank();d.sessions.push({id:"s1",token:"not-for-database"});assert.equal(inspect(d).sessionsSkipped,1);
});
test("document case ownership and references mapped with original ids",()=>{
 const d=blank();d.users.push({id:"USR1",email:"a@test.invalid",passwordHash:"salt:hash"});
 d.cases.push({id:"CAS1",userId:"USR1",title:"sample"});
 d.documents.push({id:"DOC1",userId:"USR1",caseId:"CAS1",title:"sample",text:"confidential"});
 assert.equal(inspect(d).errors.length,0);
 const mapped=tables.find(t=>t.source==="documents").map(d.documents[0]);
 assert.equal(mapped[0],"DOC1");assert.equal(mapped[1],"USR1");assert.equal(mapped[2],"CAS1");
});
test("missing required collection rejected",()=>{
 const d=blank();delete d.users;assert.throws(()=>inspect(d),/Invalid collection/);
});
