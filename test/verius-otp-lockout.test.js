"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),os=require("node:os"),path=require("node:path"),net=require("node:net"),{spawn}=require("node:child_process");
const {setTimeout:delay}=require("node:timers/promises");
const server=fs.readFileSync(path.join(__dirname,"..","server.js"),"utf8");
const port=()=>new Promise((resolve,reject)=>{const socket=net.createServer();socket.once("error",reject);socket.listen(0,"127.0.0.1",()=>{const n=socket.address().port;socket.close(()=>resolve(n))})});
test("OTP lockouts are separate from login and from each other",()=>{
 for(const kind of ["verify","reset"]){
  assert.match(server,new RegExp('getEffectiveLoginBlockSeconds\\("'+kind+'",email\\)'));
  assert.match(server,new RegExp('recordEffectiveLoginFailure\\("'+kind+'",email\\)'));
  assert.match(server,new RegExp('clearEffectiveLoginFailures\\("'+kind+'",email\\)'));
 }
});
test("repeated bad codes are limited in real HTTP and no account information leaks",{timeout:55000},async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),"verius-otp-qa-")),n=await port(),base="http://127.0.0.1:"+n;
 const p=spawn(process.execPath,["server.js"],{cwd:path.join(__dirname,".."),env:{...process.env,PORT:String(n),NODE_ENV:"test",DATABASE_URL:"",QOMUS_LOGIN_LIMIT_DATABASE_URL:"",SECURITY_AUDIT_DATABASE_URL:"",ACCOUNT_DATA_FILE:path.join(dir,"data.json"),QOMUS_LOGIN_LIMIT_FILE:path.join(dir,"login.json"),SECURITY_AUDIT_FILE:path.join(dir,"security.log")},stdio:"ignore"});
 const post=async(route,body)=>fetch(base+route,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded",Origin:base},body:new URLSearchParams(body),redirect:"manual",signal:AbortSignal.timeout(8000)});
 try{
  let up=false;for(let i=0;i<70;i++){try{if((await fetch(base+"/health")).ok){up=true;break}}catch(_){}await delay(150);}
  assert.ok(up);
  for(const [route,email] of [["/verify-email","qa-verify@example.invalid"],["/reset-password","qa-reset@example.invalid"]]){
   const fields=route==="/verify-email"?{email,code:"000000"}:{email,code:"000000",password:"SecurePassword123",password2:"SecurePassword123"};
   for(let i=0;i<8;i++){
    const r=await post(route,fields);assert.equal(r.status,400,route+" failure "+i);
   }
   const limited=await post(route,fields);
   assert.equal(limited.status,429,route+" ninth attempt");
   assert.ok(Number(limited.headers.get("retry-after"))>0);
  }
  const login=await post("/login",{email:"qa-verify@example.invalid",password:"wrong"});
  assert.equal(login.status,401,"OTP lockouts must not lock ordinary login");
 }finally{p.kill("SIGTERM");fs.rmSync(dir,{recursive:true,force:true});}
});
