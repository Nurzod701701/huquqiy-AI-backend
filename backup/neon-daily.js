"use strict";
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {Pool}=require("pg");

const MAGIC=Buffer.from("QOMUSBK1");
const CHUNK=100;
const MAX_BYTES=32*1024*1024; // keep <=32 MiB per snapshot on the 1 GiB Render disk
const MIN_FREE_BYTES=96*1024*1024;
const KEEP_DAYS=7;
const BACKUP_REGEX=/^qomus-neon-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}Z\.qbk$/;

function backupKey(raw){
  if(typeof raw!=="string"||!/^[A-Za-z0-9+/]{43}=$/.test(raw))throw new Error("BACKUP_KEY_INVALID");
  const key=Buffer.from(raw,"base64");
  if(key.length!==32)throw new Error("BACKUP_KEY_INVALID");
  return key;
}
function quote(v){return '"'+String(v).replace(/"/g,'""')+'"';}
function backupDirectory(){
  const dir=process.env.QOMUS_BACKUP_DIR||"/var/data/backups";
  if(!path.isAbsolute(dir)||!dir.startsWith("/var/data/"))throw new Error("BACKUP_DIR_UNSAFE");
  return dir;
}
function checkDisk(dir){
  const stats=fs.statfsSync(dir);
  const free=Number(stats.bavail)*Number(stats.bsize);
  if(!Number.isFinite(free)||free<MIN_FREE_BYTES)throw new Error("BACKUP_DISK_LOW");
}
function cleanup(dir,now){
  const deadline=now.getTime()-KEEP_DAYS*86400000;
  const all=fs.readdirSync(dir).filter(x=>BACKUP_REGEX.test(x)).sort().reverse();
  for(const [i,name] of all.entries()){
    const when=Date.parse(name.slice("qomus-neon-".length,-4).replace(/T(\d\d)-(\d\d)-(\d\d)Z/,"T$1:$2:$3Z"));
    if(i<7 && when>=deadline)continue;
    fs.unlinkSync(path.join(dir,name));
  }
}
function verifyEncryptedBackup(file,key){
  const buf=fs.readFileSync(file);
  if(buf.length<36||!buf.subarray(0,8).equals(MAGIC))throw new Error("BACKUP_FORMAT_INVALID");
  const nonce=buf.subarray(8,20);
  const tag=buf.subarray(buf.length-16);
  const decryptor=crypto.createDecipheriv("aes-256-gcm",key,nonce);
  decryptor.setAuthTag(tag);
  const clear=Buffer.concat([decryptor.update(buf.subarray(20,-16)),decryptor.final()]);
  const data=JSON.parse(clear.toString("utf8"));
  if(data.format!=="qomus-neon-logical-v1"||!Array.isArray(data.tables)||
      !data.tables.every(t=>t&&typeof t.name==="string"&&Array.isArray(t.columns)&&Array.isArray(t.rows)&&t.rows.length===t.count))
    throw new Error("BACKUP_CONTENT_INVALID");
  return {tableCount:data.tables.length,totalRows:data.tables.reduce((n,t)=>n+t.count,0)};
}
async function writeBackup({pool,url,key,dir=backupDirectory(),now=new Date()}={}){
  if(!pool && !url)throw new Error("BACKUP_DATABASE_MISSING");
  fs.mkdirSync(dir,{recursive:true,mode:0o700});
  fs.chmodSync(dir,0o700);
  checkDisk(dir);
  const name="qomus-neon-"+now.toISOString().slice(0,19).replace(/:/g,"-")+"Z.qbk";
  const dest=path.join(dir,name);
  const temp=dest+".pending";
  const nonce=crypto.randomBytes(12);
  const cipher=crypto.createCipheriv("aes-256-gcm",key,nonce);
  const ownPool=!pool;
  const activePool=pool||new Pool({connectionString:url,ssl:{rejectUnauthorized:true},max:1,connectionTimeoutMillis:12000});
  let fd,client,bytes=20,committed=false,totalRows=0,tableCount=0;
  function append(input){
    const data=cipher.update(input,"utf8");
    bytes+=data.length;
    if(bytes+16>MAX_BYTES)throw new Error("BACKUP_TOO_LARGE");
    fs.writeSync(fd,data);
  }
  try{
    client=await activePool.connect();
    await client.query("BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
    const r=await client.query("SELECT schemaname,tablename FROM pg_tables WHERE schemaname='public' ORDER BY schemaname,tablename");
    if(r.rowCount<1)throw new Error("BACKUP_NO_TABLES");
    const cols=await client.query("SELECT table_name,column_name,data_type,udt_name,is_nullable,column_default FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name,ordinal_position");
    fd=fs.openSync(temp,"wx",0o600);
    fs.writeSync(fd,MAGIC);fs.writeSync(fd,nonce);
    append(JSON.stringify({format:"qomus-neon-logical-v1",createdAt:now.toISOString(),database:"qomus",note:"Logical data and column metadata, not a complete pg_dump."}).slice(0,-1)+',"tables":[');
    for(const [i,t] of r.rows.entries()){
      const columnMeta=cols.rows.filter(c=>c.table_name===t.tablename);
      if(!columnMeta.length)throw new Error("BACKUP_SCHEMA_INCOMPLETE");
      let offset=0;
      const count=(await client.query("SELECT count(*)::int AS n FROM "+quote(t.schemaname)+"."+quote(t.tablename))).rows[0].n;
      if(i)append(",");
      append('{"name":'+JSON.stringify(t.tablename)+',"columns":'+JSON.stringify(columnMeta)+',"count":'+count+',"rows":[');
      let first=true;
      while(offset<count){
        const batch=await client.query("SELECT row_to_json(x) AS record FROM (SELECT * FROM "+quote(t.schemaname)+"."+quote(t.tablename)+" LIMIT $1 OFFSET $2) x",[CHUNK,offset]);
        if(!batch.rows.length)throw new Error("BACKUP_INCONSISTENT");
        for(const row of batch.rows){
          if(!first)append(",");first=false;
          append(JSON.stringify(row.record));
        }
        offset+=batch.rows.length;
      }
      append("]}");
      totalRows+=count;tableCount++;
    }
    append("]}");
    await client.query("COMMIT");
    const last=cipher.final();bytes+=last.length+16;if(bytes>MAX_BYTES)throw new Error("BACKUP_TOO_LARGE");
    fs.writeSync(fd,last);fs.writeSync(fd,cipher.getAuthTag());fs.fsyncSync(fd);fs.closeSync(fd);fd=null;
    const verified=verifyEncryptedBackup(temp,key);
    if(verified.tableCount!==tableCount||verified.totalRows!==totalRows)throw new Error("BACKUP_VERIFY_FAILED");
    fs.renameSync(temp,dest);committed=true;
    try{cleanup(dir,now);}catch(_){/* valid backup must not be marked failed because pruning failed */ }
    return {filename:name,tableCount,totalRows,bytes:fs.statSync(dest).size,verified:true};
  }catch(err){
    if(client)await client.query("ROLLBACK").catch(()=>{});
    throw err;
  }finally{
    if(fd!==undefined&&fd!==null)fs.closeSync(fd);
    if(!committed)try{fs.unlinkSync(temp);}catch(_){}
    client?.release();
    if(ownPool)await activePool.end();
  }
}
function nextUtcHour(now,hour=2){
  const next=new Date(now);next.setUTCHours(hour,0,0,0);
  if(next<=now)next.setUTCDate(next.getUTCDate()+1);
  return next;
}
function startDailyBackup({initialDelayMs=15000}={}){
  if(process.env.QOMUS_BACKUP_ENABLED!=="yes")return;
  if(process.env.QOMUS_ACCOUNT_STORE!=="postgres")throw new Error("BACKUP_REQUIRES_POSTGRES");
  const key=backupKey(process.env.QOMUS_BACKUP_KEY);
  let running=false;
  async function run(){
    if(running)return;
    running=true;
    try{
      const result=await writeBackup({url:process.env.DATABASE_URL,key});
      console.log("QOMUS_BACKUP_OK",JSON.stringify({tables:result.tableCount,rows:result.totalRows,bytes:result.bytes,verified:result.verified}));
    }catch(err){
      // Do not log database passwords, SQL contents, PII or file payload.
      console.error("QOMUS_BACKUP_FAILED",err.code||(/BACKUP_|^E(?:ACCES|NOSPC|XIST)/.test(err.message||"")?err.message:"INTERNAL_ERROR"));
    }finally{running=false;}
  }
  const first=setTimeout(()=>{void run();},initialDelayMs);first.unref();
  function schedule(){
    const ms=nextUtcHour(new Date()).getTime()-Date.now();
    const timer=setTimeout(()=>{void run();schedule();},Math.max(1000,ms));
    timer.unref();
  }
  schedule();
  console.log("QOMUS_BACKUP_SCHEDULED",JSON.stringify({utcHour:2,retentionDays:KEEP_DAYS}));
}
if(require.main===module){
  const mode=process.argv[2];
  try{
    const key=backupKey(process.env.QOMUS_BACKUP_KEY);
    if(mode==="verify"){
      const file=process.argv[3];
      if(!file||!path.resolve(file).startsWith(path.resolve(backupDirectory())+path.sep))throw new Error("BACKUP_PATH_UNSAFE");
      console.log("QOMUS_BACKUP_VERIFIED",JSON.stringify(verifyEncryptedBackup(file,key)));
    }else if(mode==="run"){
      writeBackup({url:process.env.DATABASE_URL,key}).then(x=>console.log("QOMUS_BACKUP_OK",JSON.stringify(x))).catch(e=>{console.error("QOMUS_BACKUP_FAILED",e.code||e.message);process.exitCode=1;});
    }else throw new Error("USAGE: run|verify");
  }catch(err){console.error("QOMUS_BACKUP_ERROR",err.code||err.message);process.exitCode=1;}
}
module.exports={backupKey,writeBackup,verifyEncryptedBackup,nextUtcHour,startDailyBackup};
