"use strict";
/**
 * QOMUS PostgreSQL account-state adapter.
 * Compatibility step: preserves existing account JSON shape, persists a single
 * versioned JSONB document atomically in Neon. No plaintext session logs.
 * Never falls back to ephemeral JSON when PostgreSQL is requested.
 */

const empty=()=>({users:[],sessions:[],cases:[],documents:[],conversations:[],notifications:[],consents:[],auditLogs:[],settings:{createdAt:new Date().toISOString()}});
function createAccountPgStore(opts={}){
 const pool=opts.pool||new (require("pg").Pool)({
   connectionString:process.env.DATABASE_URL,
   ssl: {rejectUnauthorized:true},
   max:4, connectionTimeoutMillis:7000, idleTimeoutMillis:30000
 });
 const versions=new WeakMap();
 let initialized=false;
 async function init(){
   if(initialized)return;
   // Main schema provisioned separately. Readiness check is fail-closed.
   const rs=await pool.query("SELECT to_regclass('public.qomus_account_state') AS table_name");
   if(!rs.rows[0]?.table_name)throw Error("QOMUS_PG_SCHEMA_MISSING");
   initialized=true;
 }
 async function load(){
   await init();
   const r=await pool.query("SELECT revision,data FROM qomus_account_state WHERE id=1");
   if(r.rowCount!==1)throw Error("QOMUS_PG_STATE_MISSING");
   const payload=r.rows[0].data;
   if(!payload||typeof payload!=="object"||Array.isArray(payload))throw Error("QOMUS_PG_STATE_CORRUPT");
   const db=Object.assign(empty(),payload);
   versions.set(db,Number(r.rows[0].revision));
   return db;
 }
 async function save(db){
   await init();
   if(!versions.has(db))throw Error("QOMUS_PG_UNVERSIONED_WRITE");
   const v=versions.get(db);
   const rs=await pool.query("UPDATE qomus_account_state SET revision=revision+1,data=$1::jsonb,updated_at=now() WHERE id=1 AND revision=$2 RETURNING revision",[JSON.stringify(db),v]);
   if(rs.rowCount!==1)throw Error("QOMUS_PG_WRITE_CONFLICT");
   versions.set(db,Number(rs.rows[0].revision));
 }
 async function close(){if(!opts.pool)await pool.end();}
 return {init,load,save,close};
}
module.exports={createAccountPgStore};
