"use strict";
// Cross-module HTTP audit: tests real server navigation and account guards with disposable local storage.
const test=require("node:test"),assert=require("node:assert/strict");
const {spawn}=require("node:child_process"),fs=require("node:fs"),os=require("node:os"),path=require("node:path"),net=require("node:net");
const {setTimeout:delay}=require("node:timers/promises");
function port(){return new Promise((resolve,reject)=>{const server=net.createServer();server.once("error",reject);server.listen(0,"127.0.0.1",()=>{const n=server.address().port;server.close(()=>resolve(n));});});}
test("VERIUS public services and privileged routes: cross-module real HTTP smoke", {timeout:90000},async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),"verius-cross-module-")),n=await port(),base="http://127.0.0.1:"+n;
 const child=spawn(process.execPath,["server.js"],{cwd:path.resolve(__dirname,".."),env:{...process.env,PORT:String(n),NODE_ENV:"test",DATABASE_URL:"",QOMUS_LOGIN_LIMIT_DATABASE_URL:"",SECURITY_AUDIT_DATABASE_URL:"",ACCOUNT_DATA_FILE:path.join(dir,"accounts.json"),QOMUS_LOGIN_LIMIT_FILE:path.join(dir,"login.json"),SECURITY_AUDIT_FILE:path.join(dir,"security.jsonl")},stdio:"ignore"});
 const get=async(p)=>fetch(base+p,{redirect:"manual",signal:AbortSignal.timeout(8000)});
 try {
  let ready=false;
  for(let i=0;i<70;i++){if(child.exitCode!==null)break;try{const r=await get("/health");if(r.status===200){ready=true;break;}}catch(_){}await delay(150);}
  assert.ok(ready,"server did not become ready");
  const publicRoutes=[
   ["/","Bosh sahifa"],["/fuqarolar","Fuqarolar"],["/advokat-pro","Advokat PRO"],
   ["/advokat-pro/documents","Advokat hujjatlar"],["/advokat-pro/cases","Ishlar"],
   ["/advokat-pro/calendar","Kalendar"],["/ai","AI yordamchi"],
   ["/claim","Da’vo konstruktori"],["/documents","Hujjatlar"],
   ["/calculators","Kalkulyatorlar"],["/pension","Pensiya"],
   ["/sources","Huquqiy manbalar"],["/questionnaire","Savolnoma"],
   ["/login","Login"],["/register","Ro‘yxatdan o‘tish"],["/forgot-password","Parolni tiklash"],
   ["/admin/login","Admin login"]
  ];
  for(const [route,label] of publicRoutes){
   const response=await get(route+"?lang=uz"),body=await response.text();
   assert.equal(response.status,200,label+" "+route+" returned "+response.status);
   assert.match(response.headers.get("content-type")||"",/text\/html/);
   assert.match(body,/<html/i,label+" produced no HTML");
   assert.doesNotMatch(body,/Cannot GET|Internal Server Error/i,label+" returned a server error");
  }
  for(const lang of ["uz","ru","en"]){
   const response=await get("/?lang="+lang),html=await response.text();
   assert.equal(response.status,200);
   assert.ok(html.includes('href="/account?lang='+lang+'"'));
   assert.ok(html.includes('href="/fuqarolar?lang='+lang+'"'));
   assert.ok(html.includes('href="/advokat-pro?lang='+lang+'"'));
  }
  for(const route of ["/account","/account/documents","/account/advokat","/account/security","/admin","/admin/users","/admin/security","/admin/audit"]){
   const response=await get(route+"?lang=uz");
   assert.equal(response.status,302,"unauthenticated "+route+" must redirect to login");
   assert.match(response.headers.get("location")||"",/\/login\?/);
  }
  const missing=await get("/invalid-verius-route-for-qa");
  assert.ok([404,302].includes(missing.status),"unknown paths must not return a successful page");
 }finally{
  child.kill("SIGTERM");
  fs.rmSync(dir,{recursive:true,force:true});
 }
});
