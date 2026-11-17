"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),os=require("node:os"),path=require("node:path"),net=require("node:net"),{spawn}=require("node:child_process");
const {setTimeout:delay}=require("node:timers/promises"),vm=require("node:vm");
const advocate=require("../advokat-pro"),calendar=require("../advokat-cases-calendar");
function randomPort(){return new Promise((resolve,reject)=>{const s=net.createServer();s.once("error",reject);s.listen(0,"127.0.0.1",()=>{const n=s.address().port;s.close(()=>resolve(n));})})}
const TOKEN1="a".repeat(64),TOKEN2="b".repeat(64);
function snapshot(){return {v:1,type:"debt",fields:{Client:"Shartli mijoz",Opponent:"Shartli qarzdor",Address:"Tuman sudi",Case:"CASE-U1",Subject:"Shartli qarz",Facts:"Tilxat mavjud",Demand:"Qaytarish",Amount:"12000",Date:"2026-11-17",Law:"LexUZdagi tahrirni tekshirish",Notes:"QA"},attachments:["Tilxat"],checks:["Shartnoma yoki tilxat"],draft:"HUJJAT LOYIHASI — SINOV"}}
test("generated Advokat PRO in-browser code parses without JavaScript syntax errors",()=>{
 for(const html of [advocate("uz",(_lang,_page,body)=>body),calendar("uz","cases"),calendar("uz","calendar")]){
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  assert.ok(scripts.length>0);
  for(const [,script] of scripts)new vm.Script(script);
 }
});
test("real HTTP: explicit document import, ownership, dedup, export and workspace conflict", {timeout:80000},async()=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),"verius-advokat-e2e-")),n=await randomPort(),base="http://127.0.0.1:"+n,file=path.join(directory,"db.json");
 const data={users:[
  {id:"u1",firstName:"Test",lastName:"Advokat",email:"advokat1@example.invalid",role:"user",status:"active",emailVerified:true},
  {id:"u2",firstName:"Other",lastName:"Advokat",email:"advokat2@example.invalid",role:"user",status:"active",emailVerified:true}],
  sessions:[{id:"SES1",userId:"u1",token:TOKEN1,expiresAt:new Date(Date.now()+600000).toISOString()},
            {id:"SES2",userId:"u2",token:TOKEN2,expiresAt:new Date(Date.now()+600000).toISOString()}],
  cases:[{id:"CASE-U1",userId:"u1",caseNo:"CASE-2026-0001",title:"Shartli ish",area:"civil",createdAt:new Date().toISOString()},
         {id:"CASE-U2",userId:"u2",caseNo:"CASE-2026-0002",title:"Begona ish",area:"civil",createdAt:new Date().toISOString()}],
  documents:[],conversations:[],notifications:[],consents:[],auditLogs:[],settings:{createdAt:new Date().toISOString()}};
 fs.writeFileSync(file,JSON.stringify(data),"utf8");
 const child=spawn(process.execPath,["server.js"],{cwd:path.join(__dirname,".."),env:{...process.env,
  PORT:String(n),NODE_ENV:"test",QOMUS_ACCOUNT_STORE:"",DATABASE_URL:"",QOMUS_LOGIN_LIMIT_DATABASE_URL:"",SECURITY_AUDIT_DATABASE_URL:"",ACCOUNT_DATA_FILE:file,QOMUS_LOGIN_LIMIT_FILE:path.join(directory,"limits.json"),SECURITY_AUDIT_FILE:path.join(directory,"security.jsonl")},stdio:"ignore"});
 const get=async(pathname,token=TOKEN1)=>fetch(base+pathname,{headers:{Cookie:"hq_session="+token},redirect:"manual",signal:AbortSignal.timeout(8000)});
 const post=async(pathname,obj,token=TOKEN1)=>fetch(base+pathname,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded",Origin:base,Cookie:"hq_session="+token},body:new URLSearchParams(obj),redirect:"manual",signal:AbortSignal.timeout(8000)});
 const saved=()=>JSON.parse(fs.readFileSync(file,"utf8"));
 try{
  let started=false;for(let i=0;i<90;i++){try{if((await fetch(base+"/health")).ok){started=true;break}}catch(_){}await delay(120)}
  assert.ok(started,"HTTP test server failed to start");
  const page=await get("/account/documents?lang=uz");
  assert.equal(page.status,200);
  const html=await page.text();
  assert.match(html,/name="caseId"/);
  assert.match(html,/CASE-U1/);
  assert.doesNotMatch(html,/CASE-U2/);
  const payload=JSON.stringify(snapshot());
  let r=await post("/account/documents/import?lang=uz",{payload,caseId:"CASE-U1"});
  assert.equal(r.status,403,"explicit consent required");
  r=await post("/account/documents/import?lang=uz",{payload,consent:"yes",caseId:"CASE-U1"});
  assert.equal(r.status,302);
  let records=saved().documents;
  assert.equal(records.length,1);
  assert.equal(records[0].userId,"u1");
  assert.equal(records[0].caseId,"CASE-U1");
  assert.equal(records[0].sourcePayload.fields.Client,"Shartli mijoz");
  const docId=records[0].id;
  r=await post("/account/documents/import?lang=uz",{payload,consent:"yes",caseId:"CASE-U1"});
  assert.equal(r.status,302);
  assert.equal(saved().documents.length,1,"duplicate import must be idempotent");
  r=await get("/account/document/export?id="+encodeURIComponent(docId),TOKEN2);
  assert.equal(r.status,404,"other user cannot download another user's JSON");
  r=await get("/account/document/export?id="+encodeURIComponent(docId));
  assert.equal(r.status,200);
  assert.equal((await r.json()).draft,snapshot().draft);
  r=await post("/account/documents/import?lang=uz",{payload:JSON.stringify({...snapshot(),draft:"Boshqa loyihasi"}),consent:"yes",caseId:"CASE-U2"});
  assert.equal(r.status,302);
  assert.equal(saved().documents[1].caseId,null,"foreign case ID must not attach");
  r=await get("/advokat-pro/workspace");
  assert.equal(r.status,200);
  assert.equal((await r.json()).version,0);
  const workspace=JSON.stringify({v:1,cases:[{id:"aaaaaaaa",title:"Ish A"}],tasks:[]});
  r=await post("/advokat-pro/workspace",{data:workspace,version:"0"});
  assert.equal(r.status,200);
  assert.equal((await r.json()).version,1);
  r=await post("/advokat-pro/workspace",{data:JSON.stringify({v:1,cases:[],tasks:[]}),version:"0"});
  assert.equal(r.status,409,"stale tab cannot overwrite an updated workspace");
  const after=saved().settings.advokatWorkspaces.u1;
  assert.equal(after.cases.length,1);
  assert.equal(after.cases[0].title,"Ish A");
 }finally{child.kill("SIGTERM");fs.rmSync(directory,{recursive:true,force:true});}
});
