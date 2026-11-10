"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {spawn}=require("node:child_process");
const {setTimeout:delay}=require("node:timers/promises");
const crypto=require("node:crypto");
const vm=require("node:vm");

test("QOMUS HTTP functional smoke: navigation, anonymous protection and DOCX download",{timeout:45000},async()=>{
 const port=39000+crypto.randomInt(1,2000);
 const base="http://127.0.0.1:"+port;
 const child=spawn(process.execPath,["server.js"],{
  cwd:process.cwd(),
  env:{...process.env,PORT:String(port),NODE_ENV:"test",OPENROUTER_API_KEY:"",ACCOUNT_DATA_FILE:"/tmp/qomus-functional-http-"+port+".json"},
  stdio:"ignore"
 });
 try{
  let ready=false;
  for(let i=0;i<80;i++){try{const r=await fetch(base+"/");if(r.ok){ready=true;break}}catch(_){}await delay(150)}
  assert.ok(ready,"isolated QOMUS test server did not start");
  const urls=["/","/fuqarolar","/advokat-pro","/ai","/calculators","/pension","/documents","/legal-review","/questionnaire","/family","/employment","/business","/sources","/court","/advokat-pro/documents","/advokat-pro/check","/advokat-pro/cases","/advokat-pro/calendar","/advokat-pro/grounded","/advokat-pro/court-practice","/login","/register","/forgot-password"];
  for(const route of urls){
   const r=await fetch(base+route+"?lang=uz");
   assert.equal(r.status,200,route+" must return HTTP 200");
   assert.match(r.headers.get("content-type")||"",/text\/html/i,route+" must return HTML");
   assert.ok((await r.text()).length>100,route+" must render content");
  }
  // Execute the shipped calculator button logic against safe synthetic inputs.
  const calcHtml=await (await fetch(base+"/calculators?lang=uz")).text();
  const begin=calcHtml.indexOf("function calculateAliment(){");
  const finish=calcHtml.indexOf("function analyzeProperty(){",begin);
  assert.ok(begin>=0&&finish>begin,"shipped alimony calculator function must render");
  const calcScript=calcHtml.slice(begin,finish);
  const values={childrenCount:{value:"1"},alimentIncome:{value:"4000000"},incomeStatus:{value:"official"},alimentAgreement:{value:"no"},alimentMonths:{value:"1"},alimentResult:{textContent:""}};
  const docMock={getElementById:id=>{assert.ok(values[id],id);return values[id]}};
  const calculate=()=>vm.runInNewContext(calcScript+";calculateAliment();",{document:docMock,formatNumber:n=>String(Math.round(n*100)/100)}, {timeout:1000});
  calculate();
  assert.match(values.alimentResult.textContent,/1000000/,"one child at 25% of 4m");
  values.childrenCount.value="3";values.alimentMonths.value="12";
  calculate();
  assert.match(values.alimentResult.textContent,/2000000/,"three children at 50% of 4m");
  assert.match(values.alimentResult.textContent,/24000000/,"twelve-month illustrative projection");
  values.childrenCount.value="2";values.alimentMonths.value="1";calculate();
  assert.match(values.alimentResult.textContent,/1333333/,"two children at one third of 4m");
  values.childrenCount.value="0";calculate();
  assert.match(values.alimentResult.textContent,/to‘g‘ri kiriting/,"invalid child count rejected");

  const account=await fetch(base+"/account",{redirect:"manual"});
  assert.ok([302,303,401,403].includes(account.status),"anonymous account must be protected");
  const form=new URLSearchParams({claim_text:"QOMUS QA hujjat namuna\nArizachi: Anonim test\nTalab: Test uchun tayyorlangan hujjat"});
  const doc=await fetch(base+"/claim-download",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","Origin":base},body:form});
  assert.equal(doc.status,200,"Word export must work");
  assert.match(doc.headers.get("content-type")||"",/wordprocessingml.document/);
  const bytes=new Uint8Array(await doc.arrayBuffer());
  assert.ok(bytes.length>1000,"DOCX has contents");
  assert.equal(bytes[0],0x50,"DOCX zip P");
  assert.equal(bytes[1],0x4b,"DOCX zip K");
  const invalid=await fetch(base+"/claim-download",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","Origin":base},body:new URLSearchParams({claim_text:""})});
  assert.equal(invalid.status,400,"empty Word document should be rejected");
  const incomplete=await fetch(base+"/claim-download",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","Origin":base},body:new URLSearchParams({claim_text:"Da’vo arizasi — [manzil] \nTalab mavjud"})});
  assert.equal(incomplete.status,422,"placeholder document must never export");
 }finally{child.kill("SIGTERM")}
});
