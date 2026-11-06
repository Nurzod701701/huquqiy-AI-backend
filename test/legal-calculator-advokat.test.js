"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {calculateAliment,MHTEKM}=require("../legal-calculator-rules");
const {parseAdvokatWorkspaceJson}=require("../advokat-workspace-store");
test("statutory aliment floor follows Family Code article 99",()=>{
 assert.equal(MHTEKM.amount,1360000);
 assert.equal(calculateAliment({children:1,income:1000000}).indicative,360400);
 assert.equal(calculateAliment({children:2,income:1000000}).indicative,720800);
 assert.equal(calculateAliment({children:3,income:1000000}).indicative,1081200);
 assert.equal(calculateAliment({children:1,income:4000000}).indicative,1000000);
 assert.equal(calculateAliment({children:2,income:6000000}).indicative,2000000);
 assert.equal(calculateAliment({children:1,income:0}).indicative,360400);
});
test("invalid legal calculator inputs are rejected",()=>{
 for(const v of [{children:0,income:500000},{children:1.5,income:1200000},{children:31,income:1000000},{children:1,income:-100},{children:1,income:"NaN"}])
 assert.throws(()=>calculateAliment(v),/INVALID_ALIMENT_INPUT/);
});
test("normalizes valid anonymized workspace",()=>{
 const data={v:1,cases:[{id:"case12345",title:"QA case"}],tasks:[{id:"task12345",title:"QA task",date:"2026-11-11",caseId:"case12345",done:false}]};
 assert.deepEqual(parseAdvokatWorkspaceJson(JSON.stringify(data)),data);
});
test("workspace forbids cross-case and malformed input",()=>{
 const data={v:1,cases:[{id:"case12345",title:"QA"}],tasks:[{id:"task12345",title:"QA task",date:"2026-11-11",caseId:"othercase",done:false}]};
 assert.throws(()=>parseAdvokatWorkspaceJson(JSON.stringify(data)),/INVALID_TASK/);
 assert.throws(()=>parseAdvokatWorkspaceJson("{}"),/INVALID_WORKSPACE/);
 assert.throws(()=>parseAdvokatWorkspaceJson("x".repeat(66000)),/WORKSPACE_TOO_LARGE/);
});
