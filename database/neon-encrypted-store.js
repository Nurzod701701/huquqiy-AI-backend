"use strict";
const crypto = require("node:crypto");

// Optional Neon/PostgreSQL encrypted document store.
// NOT connected to the existing QOMUS account routes.
// Configure QOMUS_DATABASE_URL and QOMUS_DATA_KEY_B64 on a TEST service only.
// Never commit secrets or log connection strings.
const TABLE = "qomus_secure.documents_v1";
const MAX_BODY_BYTES = 128 * 1024;
let pool;
function getConfig() {
  const connectionString = process.env.QOMUS_DATABASE_URL;
  const encoded = process.env.QOMUS_DATA_KEY_B64;
  if (!connectionString || !encoded) throw new Error("PRIVATE_DATABASE_NOT_CONFIGURED");
  const url = new URL(connectionString);
  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") throw new Error("INVALID_DATABASE_PROTOCOL");
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32 || key.toString("base64") !== encoded) throw new Error("INVALID_ENCRYPTION_KEY");
  return {connectionString,key};
}
function getPool() {
  if (!pool) {
    const {connectionString} = getConfig();
    const {Pool} = require("pg");
    pool = new Pool({connectionString, max: 5, idleTimeoutMillis: 10000, connectionTimeoutMillis: 5000,
      ssl: {rejectUnauthorized: true}});
    pool.on("error",()=>console.error("QOMUS_PRIVATE_DB_CONNECTION_ERROR"));
  }
  return pool;
}
function validateId(value, label) {
  if (typeof value !== "string" || !/^[a-zA-Z0-9_-]{5,100}$/.test(value)) throw new Error("INVALID_" + label);
  return value;
}
function seal(document, key, ownerId, recordId) {
  const plain = Buffer.from(JSON.stringify(document),"utf8");
  if (plain.length > MAX_BODY_BYTES) throw new Error("DOCUMENT_TOO_LARGE");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm",key,iv);
  cipher.setAAD(Buffer.from(ownerId + ":" + recordId));
  const ciphertext = Buffer.concat([cipher.update(plain),cipher.final()]);
  return {iv,ciphertext,tag:cipher.getAuthTag()};
}
function unseal(row,key,ownerId,recordId) {
  const decipher = crypto.createDecipheriv("aes-256-gcm",key,row.iv);
  decipher.setAAD(Buffer.from(ownerId + ":" + recordId));
  decipher.setAuthTag(row.auth_tag);
  return JSON.parse(Buffer.concat([decipher.update(row.ciphertext),decipher.final()]).toString("utf8"));
}
async function saveDocument(ownerId, recordId, document) {
  ownerId=validateId(ownerId,"OWNER"); recordId=validateId(recordId,"RECORD");
  const {key}=getConfig();
  const encrypted=seal(document,key,ownerId,recordId);
  const sql = `INSERT INTO ${TABLE} (owner_id,record_id,iv,auth_tag,ciphertext)
    VALUES ($1,$2,$3,$4,$5)
    ON CONFLICT (owner_id,record_id) DO UPDATE SET
      iv=EXCLUDED.iv,auth_tag=EXCLUDED.auth_tag,ciphertext=EXCLUDED.ciphertext,updated_at=now()`;
  await getPool().query(sql,[ownerId,recordId,encrypted.iv,encrypted.tag,encrypted.ciphertext]);
  return {recordId,saved:true};
}
async function readDocument(ownerId, recordId) {
  ownerId=validateId(ownerId,"OWNER");recordId=validateId(recordId,"RECORD");
  const {key}=getConfig();
  const result=await getPool().query(
    `SELECT iv,auth_tag,ciphertext FROM ${TABLE} WHERE owner_id=$1 AND record_id=$2`,
    [ownerId,recordId]);
  if (!result.rows.length) return null;
  return unseal(result.rows[0],key,ownerId,recordId);
}
async function deleteDocument(ownerId,recordId) {
  ownerId=validateId(ownerId,"OWNER");recordId=validateId(recordId,"RECORD");
  const result=await getPool().query(
    `DELETE FROM ${TABLE} WHERE owner_id=$1 AND record_id=$2`,[ownerId,recordId]);
  return result.rowCount===1;
}
async function closePool() {if(pool) {const old=pool;pool=undefined;await old.end();}}
module.exports={saveDocument,readDocument,deleteDocument,closePool,seal,unseal};
