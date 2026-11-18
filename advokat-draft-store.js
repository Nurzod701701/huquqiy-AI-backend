"use strict";
const crypto=require("node:crypto");
// Stored only after an explicit account-owner action. Never silently uploads browser documents.
const TYPES=new Set(["debt","property","damage","divorce","alimony","labor","complaint","motion","objection","request"]);
const KEYS=["Client","Opponent","Address","Case","Subject","Facts","Demand","Amount","Date","Law","Notes"];
function parseDraft(raw){
 if(typeof raw!=="string"||Buffer.byteLength(raw,"utf8")>100000)throw Error("DRAFT_TOO_LARGE");
 let x;try{x=JSON.parse(raw)}catch(_){throw Error("BAD_JSON")}
 if(!x||Array.isArray(x)||typeof x!=="object"||x.v!==1||!TYPES.has(x.type)||!x.fields||Array.isArray(x.fields)||typeof x.fields!=="object")throw Error("INVALID_DRAFT");
 const fields={};
 for(const key of KEYS){const value=x.fields[key]===undefined?"":x.fields[key];if(typeof value!=="string"||value.length>15000||/[\u0000-\u0008]/.test(value))throw Error("INVALID_FIELD");fields[key]=value}
 function texts(value,max,count){if(!Array.isArray(value)||value.length>count||value.some(t=>typeof t!=="string"||t.length>max))throw Error("INVALID_LIST");return [...new Set(value)]}
 const attachments=texts(x.attachments||[],180,40),checks=texts(x.checks||[],180,30);
 const draft=x.draft===undefined?"":x.draft;
 if(typeof draft!=="string"||draft.length>50000)throw Error("INVALID_TEXT");
 if(!draft.trim()&&!KEYS.some(k=>fields[k].trim()))throw Error("EMPTY_DRAFT");
 return {v:1,type:x.type,fields,attachments,checks,draft};
}
function digestOf(x){return crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex")}
function importPlan(db,userId,raw,requestedCaseId=""){
 const value=parseDraft(raw),digest=digestOf(value);
 const docs=db.documents.filter(d=>d.userId===userId&&d.source==="advokat-pro-json");
 const existing=docs.find(d=>d.importDigest===digest);
 if(existing)return {existing,record:null};
 if(docs.length>=250)throw Error("DRAFT_LIMIT");
 const requested=String(requestedCaseId||"");
 const owned=db.cases.find(c=>c.userId===userId&&c.id===requested);
 const title=(value.fields.Subject||value.fields.Case||"Advokat PRO hujjat loyihasi").trim().slice(0,140)||"Advokat PRO hujjat loyihasi";
 const text=value.draft.trim()||["HUJJAT LOYIHASI — ADVOKAT TEKSHIRUVI TALAB ETILADI","Turi: "+value.type,...KEYS.filter(k=>value.fields[k].trim()).map(k=>k+": "+value.fields[k])].join("\n\n");
 return {existing:null,record:{userId,caseId:owned?owned.id:null,type:"Advokat PRO loyihasi",source:"advokat-pro-json",importDigest:digest,title,text,sourcePayload:value}};
}
function importPanel(lang,cases=[]){
 const t={uz:["Eski Advokat PRO loyihasini import qilish","Oldingi JSON faylni tanlang. Faqat tasdiqlaganingizdan keyin shaxsiy kabinetingizga yuboriladi.","JSON fayl","Hujjatda maxfiy ma’lumotlar bo‘lishi mumkinligini tushundim va uni o‘z VERIUS akkauntimda saqlashga roziman.","Hujjatni import qilish","100 KB dan kichik to‘g‘ri JSON fayl tanlang.","Eski faylni importdan keyin tekshirmasdan o‘chirmang."],ru:["Импорт старого проекта Адвокат PRO","Выберите JSON-файл. Он отправляется только после вашего согласия.","Файл JSON","Согласен сохранить документ и содержащиеся в нём личные данные в своём аккаунте VERIUS.","Импортировать","Выберите корректный JSON до 100 КБ.","Не удаляйте резервный файл до проверки."],en:["Import an existing Advocate PRO draft","Choose a JSON file; it is only uploaded after your consent.","JSON file","I agree to store this document and its personal information in my VERIUS account.","Import draft","Select a valid JSON under 100 KB.","Keep your original file until you have verified the import."]}[["uz","ru","en"].includes(lang)?lang:"uz"];
 const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,'"'.charAt(0)?"&quot;":"&quot;");
 const caseOptions=(Array.isArray(cases)?cases:[]).slice(0,150).map(c=>'<option value="'+esc(c.id)+'">'+esc(c.caseNo||c.title||c.id)+' — '+esc(c.title||"")+'</option>').join("");
 const caseSelect=caseOptions?'<label>'+(lang==="ru"?"Связать с делом":lang==="en"?"Link to existing case":"Mavjud ishga biriktirish")+'<select name="caseId"><option value="">—</option>'+caseOptions+'</select></label>':"";
 return '<section class="accountPanel" id="advokatImport"><h2>'+esc(t[0])+'</h2><p class="accountMuted">'+esc(t[1])+'</p><form id="advokatImportForm" method="POST" action="/account/documents/import?lang='+encodeURIComponent(lang)+'" class="accountForm"><label>'+esc(t[2])+'<input type="file" id="advokatImportFile" accept=".json,application/json" required></label><textarea id="advokatImportPayload" name="payload" hidden></textarea>'+caseSelect+'<label style="display:flex;gap:10px;align-items:flex-start"><input name="consent" value="yes" type="checkbox" required style="width:auto;margin-top:4px"><span>'+esc(t[3])+'</span></label><button type="submit" class="accountButton gold">'+esc(t[4])+'</button><span id="advokatImportStatus" role="status" class="accountMuted"></span></form><p class="accountMuted">'+esc(t[6])+'</p><script>(function(){var f=document.getElementById("advokatImportForm");if(!f)return;f.addEventListener("submit",async function(e){e.preventDefault();if(!f.reportValidity())return;var file=document.getElementById("advokatImportFile").files[0];var status=document.getElementById("advokatImportStatus");if(!file||file.size>100000){status.textContent='+JSON.stringify(t[5])+';return;}try{var data=await file.text();JSON.parse(data);document.getElementById("advokatImportPayload").value=data;f.submit();}catch(_){status.textContent='+JSON.stringify(t[5])+';}})})();</script></section>';
}
module.exports={parseDraft,digestOf,importPlan,importPanel,TYPES};
