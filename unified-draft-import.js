"use strict";
const crypto=require("node:crypto");
// Legacy Advokat PRO JSON draft validation; never silently upload local files.
const TYPES=new Set(["debt","property","damage","divorce","alimony","labor","complaint","motion","objection","request"]);
const FIELDS=["Client","Opponent","Address","Case","Subject","Facts","Demand","Amount","Date","Law","Notes"];
function validate(raw){
 if(typeof raw!=="string"||raw.length>100000)throw Error("INVALID_SIZE");
 let data;try{data=JSON.parse(raw)}catch(_){throw Error("INVALID_JSON")}
 if(!data||typeof data!=="object"||Array.isArray(data)||data.v!==1||!TYPES.has(data.type)||
  !data.fields||typeof data.fields!=="object"||Array.isArray(data.fields))throw Error("INVALID_FORMAT");
 const fields={};
 for(const key of FIELDS){
  const value=data.fields[key]===undefined?"":data.fields[key];
  if(typeof value!=="string"||value.length>20000)throw Error("INVALID_FIELD");
  fields[key]=value;
 }
 const draft=data.draft===undefined?"":data.draft;
 if(typeof draft!=="string"||draft.length>50000)throw Error("INVALID_DRAFT");
 const cleanArray=(xs,max)=>{if(!Array.isArray(xs)||xs.length>max||xs.some(v=>typeof v!=="string"||v.length>180))throw Error("INVALID_ARRAY");return xs.slice()};
 const attachments=cleanArray(data.attachments||[],80);
 const checks=cleanArray(data.checks||[],30);
 if(!draft.trim()&&!FIELDS.some(key=>fields[key].trim()))throw Error("EMPTY_DRAFT");
 return {v:1,type:data.type,fields,attachments,checks,draft};
}
function fingerprint(draft){return crypto.createHash("sha256").update(JSON.stringify(draft)).digest("hex")}
function titleOf(draft){return (draft.fields.Subject||draft.fields.Case||"Advokat PRO hujjat loyihasi").trim().slice(0,140)}
function bodyOf(draft){return draft.draft.trim()||[
 "HUJJAT LOYIHASI — ADVOKAT TEKSHIRUVI TALAB ETILADI",
 "Turi: "+draft.type,
 ...FIELDS.filter(k=>draft.fields[k].trim()).map(k=>k+": "+draft.fields[k])
 ].join("\n\n").slice(0,50000)}
function planImport(db,userId,raw){
 const draft=validate(raw),digest=fingerprint(draft);
 const existing=db.documents.find(x=>x.userId===userId&&x.importDigest===digest&&x.source==="advokat-pro-json");
 if(existing)return {duplicate:true,draft,digest,document:existing};
 if(db.documents.filter(x=>x.userId===userId&&x.source==="advokat-pro-json").length>=200)throw Error("IMPORT_LIMIT");
 return {duplicate:false,draft,digest,document:null};
}
module.exports={validate,fingerprint,planImport,titleOf,bodyOf};
