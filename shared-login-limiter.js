"use strict";
const crypto=require("node:crypto");
const WINDOW_MS=15*60*1000;
let pool=null;
function enabled(){return !!process.env.QOMUS_LOGIN_LIMIT_DATABASE_URL;}
function accountHash(kind,identity){
 const secret=process.env.QOMUS_LOGIN_HASH_KEY;
 if(!secret || Buffer.byteLength(secret,"utf8")<32)throw Error("QOMUS_LOGIN_HASH_KEY_REQUIRED");
 return crypto.createHmac("sha256",secret).update(kind+":"+String(identity||"").trim().toLowerCase().slice(0,254)).digest("hex");
}
function db(){
 if(!enabled())return null;
 if(!pool){
  const uri=process.env.QOMUS_LOGIN_LIMIT_DATABASE_URL;
  const local=process.env.NODE_ENV==="test"&&process.env.QOMUS_PG_INSECURE_LOCAL_TEST==="yes"&&
    /^postgres(?:ql)?:\/\/[^@]+@(?:localhost|127\.0\.0\.1):/.test(uri);
  pool=new (require("pg").Pool)({connectionString:uri,ssl:local?false:{rejectUnauthorized:true},max:2,connectionTimeoutMillis:3000,statement_timeout:3500});
 }
 return pool;
}
async function blockSeconds(kind,identity){
 const hash=accountHash(kind,identity);
 const r=await db().query("SELECT failures, GREATEST(0,CEIL(EXTRACT(EPOCH FROM (expires_at - NOW())))) AS remaining FROM public.qomus_auth_rate_limit WHERE identity_hash=$1 AND expires_at>NOW()",[hash]);
 const row=r.rows[0];if(!row)return 0;
 return Number(row.failures)>=(kind==="admin"?6:8)?Number(row.remaining):0;
}
async function failure(kind,identity){
 const hash=accountHash(kind,identity);
 await db().query(`INSERT INTO public.qomus_auth_rate_limit(identity_hash,failures,expires_at)
 VALUES ($1,1,NOW()+interval '15 minutes')
 ON CONFLICT(identity_hash) DO UPDATE SET
 failures=CASE WHEN qomus_auth_rate_limit.expires_at<=NOW() THEN 1 ELSE qomus_auth_rate_limit.failures+1 END,
 expires_at=CASE WHEN qomus_auth_rate_limit.expires_at<=NOW() THEN NOW()+interval '15 minutes' ELSE qomus_auth_rate_limit.expires_at END`,[hash]);
}
async function clear(kind,identity){
 await db().query("DELETE FROM public.qomus_auth_rate_limit WHERE identity_hash=$1",[accountHash(kind,identity)]);
}
module.exports={enabled,accountHash,blockSeconds,failure,clear,WINDOW_MS};
