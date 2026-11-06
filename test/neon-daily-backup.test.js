"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const {backupKey,writeBackup,verifyEncryptedBackup,nextUtcHour}=require("../backup/neon-daily");

function fakePool(){
 const calls=[];
 const user={id:"USR-QA",email:"private@example.invalid",passwordHash:"synthetic-hash"};
 const state={id:1,revision:0,data:{users:[user],sessions:[],cases:[],documents:[],conversations:[],notifications:[],consents:[],auditLogs:[],settings:{}}};
 return {calls, async connect(){return {async query(sql){
  calls.push(sql);
  if(sql.startsWith("BEGIN")||sql==="COMMIT"||sql==="ROLLBACK")return {rows:[],rowCount:0};
  if(sql.includes("FROM pg_tables"))return {rows:[{schemaname:"public",tablename:"qomus_account_state"}],rowCount:1};
  if(sql.includes("information_schema.columns"))return {rows:[{table_name:"qomus_account_state",column_name:"id",data_type:"smallint",udt_name:"int2",is_nullable:"NO",column_default:null}],rowCount:1};
  if(sql.includes("count(*)"))return {rows:[{n:1}],rowCount:1};
  if(sql.includes("row_to_json"))return {rows:[{record:state}],rowCount:1};
  throw Error("Unexpected SQL in backup test");
 },release(){}};}};
}
test("daily backup writes encrypted private data, authenticates, and rejects tampering",async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),"qomus-backup-"));
 const key=crypto.randomBytes(32),now=new Date("2026-11-06T02:00:00Z");
 try{
  const result=await writeBackup({pool:fakePool(),dir,key,now});
  assert.ok(result.verified);assert.equal(result.tableCount,1);assert.equal(result.totalRows,1);
  const file=path.join(dir,result.filename);
  const bytes=fs.readFileSync(file);
  assert.ok(bytes.subarray(0,8).equals(Buffer.from("QOMUSBK1")));
  assert.ok(!bytes.includes(Buffer.from("private@example.invalid")));
  assert.ok(!bytes.includes(Buffer.from("synthetic-hash")));
  assert.deepEqual(verifyEncryptedBackup(file,key),{tableCount:1,totalRows:1});
  assert.throws(()=>verifyEncryptedBackup(file,crypto.randomBytes(32)));
  bytes[24]^=1;fs.writeFileSync(file,bytes);
  assert.throws(()=>verifyEncryptedBackup(file,key));
 }finally{fs.rmSync(dir,{force:true,recursive:true});}
});
test("key must be 256 bits and base64",()=>{
 const k=crypto.randomBytes(32);
 assert.equal(backupKey(k.toString("base64")).length,32);
 assert.throws(()=>backupKey("hello"),/BACKUP_KEY_INVALID/);
 assert.throws(()=>backupKey(Buffer.alloc(16).toString("base64")),/BACKUP_KEY_INVALID/);
});
test("UTC 02:00 scheduler crosses day boundary",()=>{
 assert.equal(nextUtcHour(new Date("2026-11-06T01:30:00Z")).toISOString(),"2026-11-06T02:00:00.000Z");
 assert.equal(nextUtcHour(new Date("2026-11-06T02:00:00Z")).toISOString(),"2026-11-07T02:00:00.000Z");
});
