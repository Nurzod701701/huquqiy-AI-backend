"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {Pool}=require("pg");
const {createAccountPgStore}=require("../account-pg-store");
const url=process.env.QOMUS_TEST_DATABASE_URL;
test("actual PostgreSQL round-trip and optimistic concurrency in disposable CI instance", {skip:!url},async()=>{
 const pool=new Pool({connectionString:url,max:3});
 await pool.query("CREATE TABLE IF NOT EXISTS qomus_account_state(id smallint PRIMARY KEY, revision bigint NOT NULL DEFAULT 0, data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())");
 await pool.query("INSERT INTO qomus_account_state(id,revision,data) VALUES (1,0,'{}'::jsonb) ON CONFLICT(id) DO UPDATE SET revision=0,data='{}'::jsonb");
 const store=createAccountPgStore({pool});
 try{
  const a=await store.load(),b=await store.load();
  a.users.push({id:"QA1",email:"synthetic@example.invalid",passwordHash:"hash"});
  await store.save(a);
  b.users.push({id:"QA2"});
  await assert.rejects(store.save(b),/QOMUS_PG_WRITE_CONFLICT/);
  const persisted=await store.load();
  assert.equal(persisted.users.length,1);
  assert.equal(persisted.users[0].id,"QA1");
  assert.equal(persisted.users[0].passwordHash,"hash");
 }finally{await pool.end();}
});
