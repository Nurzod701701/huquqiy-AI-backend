"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {createAccountPgStore}=require("../account-pg-store");
function fakePool(){
 let revision=0, data={users:[],sessions:[],cases:[],documents:[],conversations:[],notifications:[],consents:[],auditLogs:[],settings:{}};
 return {async query(sql,params=[]){
  if(sql.includes("to_regclass"))return {rows:[{table_name:"qomus_account_state"}],rowCount:1};
  if(sql.startsWith("SELECT revision"))return {rows:[{revision,data:structuredClone(data)}],rowCount:1};
  if(sql.startsWith("UPDATE qomus_account_state")){
   if(params[1]!==revision)return {rows:[],rowCount:0};
   revision++;data=JSON.parse(params[0]);return {rows:[{revision}],rowCount:1};
  }
  throw Error("Unexpected mock query");
 },state(){return structuredClone(data);}};
}
test("PostgreSQL stores and reloads JSON account data",async()=>{
 const p=fakePool(),store=createAccountPgStore({pool:p});
 const db=await store.load();db.users.push({id:"USR-1",email:"test@example.invalid"});
 await store.save(db);const read=await store.load();
 assert.equal(read.users[0].id,"USR-1");assert.equal(read.users[0].email,"test@example.invalid");
});
test("stale concurrent update is refused, not overwritten",async()=>{
 const p=fakePool(),store=createAccountPgStore({pool:p});
 const first=await store.load(),second=await store.load();
 first.users.push({id:"USR-1"});await store.save(first);
 second.users.push({id:"USR-2"});
 await assert.rejects(store.save(second),/QOMUS_PG_WRITE_CONFLICT/);
 assert.deepEqual(p.state().users.map(u=>u.id),["USR-1"]);
});
test("unversioned account object cannot be persisted",async()=>{
 const store=createAccountPgStore({pool:fakePool()});
 await assert.rejects(store.save({users:[]}),/QOMUS_PG_UNVERSIONED_WRITE/);
});
test("DB failure is surfaced; no JSON fallback",async()=>{
 const store=createAccountPgStore({pool:{query:async()=>{throw Error("database offline");}}});
 await assert.rejects(store.load(),/database offline/);
});
test("missing schema is rejected before use",async()=>{
 const store=createAccountPgStore({pool:{query:async()=>({rows:[{table_name:null}]})}});
 await assert.rejects(store.load(),/QOMUS_PG_SCHEMA_MISSING/);
});
