"use strict";
function normalizedAdvokatWorkspace(value){
 if(!value||value.v!==1||!Array.isArray(value.cases)||!Array.isArray(value.tasks)||
    value.cases.length>60||value.tasks.length>120)throw Error("INVALID_WORKSPACE");
 const goodTitle=x=>typeof x==="string"&&x.trim().length>0&&x.length<=100&&
    !/[\u0000-\u001F\u007F]/.test(x);
 const goodId=x=>typeof x==="string"&&/^[a-z0-9]{8,40}$/i.test(x);
 const ids=new Set(),taskIds=new Set();
 const cases=value.cases.map(c=>{
   if(!c||!goodId(c.id)||ids.has(c.id)||!goodTitle(c.title))throw Error("INVALID_CASE");
   ids.add(c.id);return {id:c.id,title:c.title.trim()};
 });
 const tasks=value.tasks.map(t=>{
   if(!t||!goodId(t.id)||ids.has(t.id)||taskIds.has(t.id)||!goodTitle(t.title)||
     typeof t.date!=="string"||!/^20\d{2}-\d{2}-\d{2}$/.test(t.date)||
     Number.isNaN(Date.parse(t.date+"T12:00:00Z"))||
     new Date(t.date+"T12:00:00Z").toISOString().slice(0,10)!==t.date||
     typeof t.caseId!=="string"||(t.caseId&&!ids.has(t.caseId))||typeof t.done!=="boolean")throw Error("INVALID_TASK");
   taskIds.add(t.id);
   return {id:t.id,title:t.title.trim(),date:t.date,caseId:t.caseId,done:t.done};
 });
 return {v:1,cases,tasks};
}
function parseAdvokatWorkspaceJson(raw){
 if(typeof raw!=="string"||raw.length>65000)throw Error("WORKSPACE_TOO_LARGE");
 return normalizedAdvokatWorkspace(JSON.parse(raw));
}
module.exports={normalizedAdvokatWorkspace,parseAdvokatWorkspaceJson};
