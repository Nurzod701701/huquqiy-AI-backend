"use strict";
/**
 * Offline QOMUS JSON -> Neon PostgreSQL migration (append-only / idempotent).
 * DEFAULT IS DRY RUN. Apply requires --apply AND QOMUS_MIGRATION_APPROVED=yes,
 * DB URL is read only from DATABASE_URL environment; never logged.
 * Do NOT migrate without a verified and separately stored source backup.
 * Existing sessions are intentionally NOT migrated (force safe re-login).
 */
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
function assert(ok,message){if(!ok)throw new Error(message);}
function ts(v){if(!v)return null;const d=new Date(v);return Number.isFinite(d.valueOf())?d.toISOString():null;}
function text(v){return v==null?"":String(v);}
const tables=[
 {source:"users",table:"app_users",fields:["id","email","first_name","last_name","password_hash","role","status","email_verified","verification_code_hash","verification_expires_at","verification_sent_at","reset_code_hash","reset_expires_at","reset_sent_at","owner_created","last_login_at","created_at","updated_at"],map:u=>[u.id,text(u.email).toLowerCase(),text(u.firstName),text(u.lastName),u.passwordHash||null,u.role||"user",u.status||"active",!!u.emailVerified,u.verificationCodeHash||null,ts(u.verificationExpiresAt),ts(u.verificationSentAt),u.resetCodeHash||null,ts(u.resetExpiresAt),ts(u.resetSentAt),!!u.ownerCreated,ts(u.lastLoginAt),ts(u.createdAt)||new Date(0).toISOString(),ts(u.updatedAt)||ts(u.createdAt)||new Date(0).toISOString()]},
 {source:"cases",table:"app_cases",fields:["id","user_id","case_no","area","title","description","status","progress","created_at","updated_at"],map:c=>[c.id,c.userId,c.caseNo||c.id,text(c.area),text(c.title),text(c.description),c.status||"started",Math.max(0,Math.min(100,Number(c.progress)||0)),ts(c.createdAt)||new Date(0).toISOString(),ts(c.updatedAt)||ts(c.createdAt)||new Date(0).toISOString()]},
 {source:"documents",table:"app_documents",fields:["id","user_id","case_id","title","type","content","created_at","updated_at"],map:d=>[d.id,d.userId,d.caseId||null,text(d.title),text(d.type),text(d.text),ts(d.createdAt)||new Date(0).toISOString(),ts(d.updatedAt)||ts(d.createdAt)||new Date(0).toISOString()]},
 {source:"conversations",table:"app_conversations",fields:["id","user_id","case_id","title","question","answer","created_at","updated_at"],map:c=>[c.id,c.userId,c.caseId||null,text(c.title),text(c.question),text(c.answer),ts(c.createdAt)||new Date(0).toISOString(),ts(c.updatedAt)||ts(c.createdAt)||new Date(0).toISOString()]},
 {source:"notifications",table:"app_notifications",fields:["id","user_id","title","message","created_at"],map:n=>[n.id,n.userId,text(n.title),text(n.text),ts(n.createdAt)||new Date(0).toISOString()]},
 {source:"consents",table:"app_consents",fields:["id","user_id","type","version","accepted_at"],map:c=>[c.id,c.userId,text(c.type),text(c.version),ts(c.acceptedAt)||new Date(0).toISOString()]},
 {source:"auditLogs",table:"app_audit_logs",fields:["id","user_id","action","metadata","created_at"],map:a=>[a.id,a.userId||null,text(a.action),JSON.stringify(a.meta||{}),ts(a.createdAt)||new Date(0).toISOString()]}
];
function inspect(data){
 assert(data&&typeof data==="object"&&!Array.isArray(data),"Invalid JSON root");
 for(const name of ["users","sessions",...tables.map(t=>t.source)]) assert(Array.isArray(data[name]),"Invalid collection: "+name);
 const users=new Set();const cases=new Set();
 const errors=[];
 for(const u of data.users){if(!u||!u.id||!u.email)errors.push("User ID/email missing");else if(users.has(u.id))errors.push("Duplicate user ID");else users.add(u.id);}
 for(const c of data.cases){if(!c||!c.id||!c.userId)errors.push("Case ID/userID missing");else{if(cases.has(c.id))errors.push("Duplicate case ID");cases.add(c.id);}}
 for(const table of tables){
  const ids=new Set();
  for(const record of data[table.source]){
   if(!record||!record.id||ids.has(record.id))errors.push(table.source+" invalid/duplicate ID");
   else ids.add(record.id);
   if(record&&table.source!=="users"&&record.userId&&!users.has(record.userId))errors.push(table.source+" orphan user");
   if(record&&["documents","conversations"].includes(table.source)&&record.caseId&&!cases.has(record.caseId))errors.push(table.source+" orphan case");
  }
 }
 return {counts:Object.fromEntries(tables.map(t=>[t.source,data[t.source].length])),sessionsSkipped:data.sessions.length,errors};
}
async function run(argv=process.argv.slice(2)){
 const source=argv.find(x=>x!=="--apply");
 assert(source&&path.isAbsolute(source),"Use absolute source JSON backup path");
 const st=fs.lstatSync(source);
 assert(st.isFile()&&!st.isSymbolicLink()&&st.size<=100*1024*1024,"Source must be regular file <=100MiB");
 const data=JSON.parse(fs.readFileSync(source,"utf8"));
 const report=inspect(data);
 // Never print personal data, tokens, email, document texts, DB credentials, or paths.
 console.log(JSON.stringify({mode:argv.includes("--apply")?"apply":"dry-run",counts:report.counts,
   sessionsSkipped:report.sessionsSkipped,preflightErrors:report.errors.slice(0,30)},null,2));
 assert(report.errors.length===0,"Preflight failed, database unchanged");
 if(!argv.includes("--apply"))return;
 assert(process.env.QOMUS_MIGRATION_APPROVED==="yes","Explicit migration gate not set");
 assert(process.env.DATABASE_URL,"DATABASE_URL not set");
 const {Client}=require("pg");
 const client=new Client({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:true}});
 await client.connect();
 try{
  await client.query("BEGIN");
  for(const def of tables){
   const columns=def.fields.map(n=>'"'+n+'"').join(",");
   const vals=def.fields.map((_,i)=>"$"+(i+1)).join(",");
   for(const record of data[def.source]){
    await client.query("INSERT INTO "+def.table+" ("+columns+") VALUES ("+vals+") ON CONFLICT (id) DO NOTHING",def.map(record));
   }
  }
  await client.query("COMMIT");
  console.log(JSON.stringify({migrationCommitted:true,countsAttempted:report.counts,sessionsSkipped:report.sessionsSkipped}));
 }catch(error){
  await client.query("ROLLBACK");
  console.error("Migration rolled back:",error.code||"DATABASE_ERROR");
  throw new Error("Transaction failed; no partial import");
 }finally{await client.end();}
}
if(require.main===module)run().catch(e=>{console.error("QOMUS migration:",e.message);process.exitCode=1;});
module.exports={inspect,tables,run};
