"use strict";
const fs = require("node:fs");
const path = require("node:path");
// Load pg only when an independent PostgreSQL audit sink is configured.

// Separate append-only evidence file on Render Persistent Disk.
// Optional independent PostgreSQL sink is enabled with SECURITY_AUDIT_DATABASE_URL.
const localPath = process.env.SECURITY_AUDIT_FILE || "/var/data/qomus-security-events.jsonl";
const connectionString = process.env.SECURITY_AUDIT_DATABASE_URL;
let pool;
let schemaReady;
let warned = false;
function sanitize(event) {
  return {
    category:String(event.category||"").slice(0,40),
    sourceId:String(event.sourceId||"").replace(/[^a-f0-9]/g,"").slice(0,16),
    path:String(event.path||"/").replace(/[^a-zA-Z0-9/_-]/g,"").slice(0,120),
    at:String(event.at||new Date().toISOString()).slice(0,32)
  };
}
function saveEvent(event) {
  const safe = sanitize(event);
  try {
    fs.mkdirSync(path.dirname(localPath),{recursive:true,mode:0o700});
    fs.appendFileSync(localPath,JSON.stringify(safe)+"\n",{encoding:"utf8",mode:0o600});
  } catch(error) {
    console.error("SECURITY_AUDIT_LOCAL_WRITE_FAILED",error.code||"IO_ERROR");
  }
  if (!connectionString) return;
  if (!pool) {
    const {Pool} = require("pg");
    pool = new Pool({connectionString,ssl:{rejectUnauthorized:true},max:2,connectionTimeoutMillis:5000});
    schemaReady = pool.query(`CREATE TABLE IF NOT EXISTS qomus_security_events (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      event_time TIMESTAMPTZ NOT NULL,
      category VARCHAR(40) NOT NULL,
      source_id VARCHAR(16) NOT NULL,
      route VARCHAR(120) NOT NULL
    )`);
  }
  Promise.resolve(schemaReady).then(()=>pool.query(
    "INSERT INTO qomus_security_events (event_time,category,source_id,route) VALUES ($1,$2,$3,$4)",
    [safe.at,safe.category,safe.sourceId,safe.path]
  )).catch(error=>{
    if (!warned) console.error("SECURITY_AUDIT_REMOTE_WRITE_FAILED",error.code||"DB_ERROR");
    warned=true;
  });
}
function readRecentEvents(limit=100) {
  try {
    const rows=fs.readFileSync(localPath,"utf8").trim().split("\n");
    return rows.slice(-Math.max(1,Math.min(1000,limit))).reverse().map(x=>sanitize(JSON.parse(x)));
  } catch(error) {
    if(error.code!=="ENOENT") console.error("SECURITY_AUDIT_LOCAL_READ_FAILED",error.code||"IO_ERROR");
    return [];
  }
}
module.exports={saveEvent,readRecentEvents,sanitize};
