"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {spawn}=require("node:child_process");
const crypto=require("node:crypto");
const {setTimeout:delay}=require("node:timers/promises");
const {Pool}=require("pg");
const uri=process.env.QOMUS_TEST_DATABASE_URL;
test("QOMUS actual HTTP admin login creates durable PostgreSQL session", {skip:!uri,timeout:30000},async()=>{
 const port=43871, owner="owner-qa@example.invalid",pass="OnlySynthetic!QA2026";
 const pool=new Pool({connectionString:uri});
 await pool.query("CREATE TABLE IF NOT EXISTS qomus_account_state(id smallint PRIMARY KEY, revision bigint NOT NULL DEFAULT 0, data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())");
 await pool.query("INSERT INTO qomus_account_state(id,revision,data) VALUES (1,0,'{}'::jsonb) ON CONFLICT(id) DO UPDATE SET revision=0,data='{}'::jsonb");
 const child=spawn(process.execPath,["server.js"],{cwd:process.cwd(),env:{...process.env,PORT:String(port),NODE_ENV:"test",QOMUS_PG_INSECURE_LOCAL_TEST:"yes",DATABASE_URL:uri,QOMUS_ACCOUNT_STORE:"postgres",OWNER_EMAIL:owner,OWNER_PASSWORD:pass},stdio:"ignore"});
 try{
  let ok=false;
  for(let i=0;i<50;i++){
   if(child.exitCode!==null)break;
   try {const r=await fetch("http://127.0.0.1:"+port+"/admin/login");if(r.ok){ok=true;break;}}catch(_){}
   await delay(200);
  }
  assert.ok(ok,"Server did not start in QA mode");
  const result=await fetch("http://127.0.0.1:"+port+"/admin/login",{method:"POST",redirect:"manual",headers:{"content-type":"application/x-www-form-urlencoded","origin":"http://127.0.0.1:"+port},body:new URLSearchParams({email:owner,password:pass})});
  assert.equal(result.status,302,"Owner login should redirect after database commit");
  const cookie=result.headers.get("set-cookie")||"";
  assert.match(cookie,/hq_session=/);
  const dashboard=await fetch("http://127.0.0.1:"+port+"/admin",{headers:{cookie:cookie.split(";")[0]}});
  assert.equal(dashboard.status,200);
  const snapshot=await pool.query("SELECT revision,data FROM qomus_account_state WHERE id=1");
  assert.ok(Number(snapshot.rows[0].revision)>=2);
  assert.equal(snapshot.rows[0].data.users.length,1);
  assert.equal(snapshot.rows[0].data.sessions.length,1);
  assert.equal(snapshot.rows[0].data.users[0].email,owner);
  // Real HTTP registration/login-compatible data flow using a fully synthetic verified user.
  const salt=crypto.randomBytes(16).toString("hex");
  const passHash=salt+":"+crypto.scryptSync("SyntheticPass-2026!",salt,64).toString("hex");
  const fakeUser={id:"USR-QA-HTTP",email:"qa-user@example.invalid",firstName:"QA",lastName:"User",
    passwordHash:passHash,role:"user",status:"active",emailVerified:true,
    createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
  await pool.query("UPDATE qomus_account_state SET revision=revision+1,data=jsonb_set(data,'{users}',(data->'users') || $1::jsonb) WHERE id=1",[JSON.stringify([fakeUser])]);
  const ulogin=await fetch("http://127.0.0.1:"+port+"/login",{method:"POST",redirect:"manual",
    headers:{"content-type":"application/x-www-form-urlencoded","origin":"http://127.0.0.1:"+port},
    body:new URLSearchParams({email:fakeUser.email,password:"SyntheticPass-2026!"})});
  assert.equal(ulogin.status,302);
  const uCookie=(ulogin.headers.get("set-cookie")||"").split(";")[0];assert.match(uCookie,/hq_session=/);
  const profile=await fetch("http://127.0.0.1:"+port+"/account/profile",{method:"POST",redirect:"manual",
    headers:{"content-type":"application/x-www-form-urlencoded","origin":"http://127.0.0.1:"+port,cookie:uCookie},
    body:new URLSearchParams({firstName:"Updated QA",lastName:"User"})});
  assert.equal(profile.status,200);
  const newCase=await fetch("http://127.0.0.1:"+port+"/account/cases/new",{method:"POST",redirect:"manual",
    headers:{"content-type":"application/x-www-form-urlencoded","origin":"http://127.0.0.1:"+port,cookie:uCookie},
    body:new URLSearchParams({area:"civil",title:"Synthetic QA case"})});
  assert.equal(newCase.status,302);
  const committed=await pool.query("SELECT data FROM qomus_account_state WHERE id=1");
  assert.equal(committed.rows[0].data.users.find(x=>x.id===fakeUser.id).firstName,"Updated QA");
  assert.ok(committed.rows[0].data.cases.some(x=>x.userId===fakeUser.id&&x.title==="Synthetic QA case"));
  const ownerRead=await fetch("http://127.0.0.1:"+port+"/account/cases",{headers:{cookie:uCookie}});
  assert.equal(ownerRead.status,200);
  // A regular user must never gain administrative privileges.
  const forbiddenAdmin=await fetch("http://127.0.0.1:"+port+"/admin/users",
    {headers:{cookie:uCookie},redirect:"manual"});
  assert.equal(forbiddenAdmin.status,403);
  // Reject cross-site state-changing requests even with a valid session cookie.
  const crossSite=await fetch("http://127.0.0.1:"+port+"/account/profile",
    {method:"POST",headers:{"content-type":"application/x-www-form-urlencoded",
      origin:"https://malicious.invalid","sec-fetch-site":"cross-site",cookie:uCookie},
      body:new URLSearchParams({firstName:"Malicious",lastName:"Tamper"})});
  assert.equal(crossSite.status,403);
  const afterAttack=await pool.query("SELECT data FROM qomus_account_state WHERE id=1");
  assert.equal(afterAttack.rows[0].data.users.find(x=>x.id===fakeUser.id).firstName,"Updated QA");
  const anonAdmin=await fetch("http://127.0.0.1:"+port+"/admin",
    {redirect:"manual"});
  assert.equal(anonAdmin.status,302);
  // User's confidential case must not be exposed to an unauthenticated browser.
  const privateCaseId=committed.rows[0].data.cases.find(x=>x.userId===fakeUser.id).id;
  const anonymousCase=await fetch("http://127.0.0.1:"+port+"/account/case?id="+encodeURIComponent(privateCaseId),
    {redirect:"manual"});
  assert.equal(anonymousCase.status,302);
 } finally {
  child.kill("SIGTERM");await pool.end();
 }
});
