"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const MAGIC = "QOMUS_VAULT_V1";
const ALLOWED_BASE = "/var/data";

// Opt-in encrypted storage adapter. NOT activated in the live database flow.
// Install a Render Persistent Disk at /var/data, set QOMUS_VAULT_KEY_B64
// (32 random bytes encoded as base64), and validate a backup/restore first.
// Avoid exporting the encryption key with backups; hold an offline recovery copy.
function config() {
  const root = process.env.QOMUS_VAULT_DIR;
  const encoded = process.env.QOMUS_VAULT_KEY_B64;
  if (!root || !encoded) throw new Error("VAULT_NOT_CONFIGURED");
  const resolved = path.resolve(root);
  if (resolved !== ALLOWED_BASE && !resolved.startsWith(ALLOWED_BASE + path.sep)) {
    throw new Error("VAULT_PATH_NOT_ISOLATED");
  }
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32 || key.toString("base64") !== encoded) throw new Error("VAULT_INVALID_KEY");
  return {resolved, key};
}
function safeName(name) {
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(name)) throw new Error("INVALID_VAULT_RECORD");
  return name;
}
function filePath(root, name) { return path.join(root, safeName(name) + ".enc"); }

function encrypt(value, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const payload = Buffer.from(JSON.stringify(value), "utf8");
  const data = Buffer.concat([cipher.update(payload), cipher.final()]);
  return JSON.stringify({type:MAGIC, iv:iv.toString("base64"),tag:cipher.getAuthTag().toString("base64"), data:data.toString("base64")});
}
function decrypt(raw,key) {
  const box = JSON.parse(raw);
  if(box.type !== MAGIC) throw new Error("UNKNOWN_VAULT_FORMAT");
  const iv = Buffer.from(box.iv,"base64");
  const tag = Buffer.from(box.tag,"base64");
  if(iv.length !== 12 || tag.length !== 16) throw new Error("INVALID_VAULT_RECORD");
  const decipher = crypto.createDecipheriv("aes-256-gcm",key,iv);
  decipher.setAuthTag(tag);
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(box.data,"base64")),decipher.final()]).toString("utf8"));
}
function saveRecord(name, value) {
  const {resolved,key} = config();
  fs.mkdirSync(resolved,{recursive:true,mode:0o700});
  const file = filePath(resolved,name);
  const temporary = file + "." + crypto.randomBytes(8).toString("hex") + ".tmp";
  try {
    fs.writeFileSync(temporary,encrypt(value,key),{encoding:"utf8",flag:"wx",mode:0o600});
    fs.renameSync(temporary,file);
  } finally { try { fs.unlinkSync(temporary); } catch (_) {} }
}
function loadRecord(name) {
  const {resolved,key} = config();
  return decrypt(fs.readFileSync(filePath(resolved,name),"utf8"),key);
}
module.exports = {saveRecord,loadRecord,encrypt,decrypt};
