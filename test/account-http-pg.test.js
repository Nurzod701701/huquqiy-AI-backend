"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {spawn}=require("node:child_process");
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
 } finally {
  child.kill("SIGTERM");await pool.end();
 }
});
