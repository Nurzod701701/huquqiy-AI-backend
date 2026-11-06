"use strict";
/**
 * QOMUS account storage read-only safety audit.
 * Never modifies, exports, uploads or prints personal data or session tokens.
 * Run against a verified local/isolated backup, not a live production data file.
 * Usage: node scripts/audit-account-data-readonly.js /absolute/path/to/backup.json
 */
const fs = require("node:fs");
const path = require("node:path");
const filename = process.argv[2];
if (!filename || !path.isAbsolute(filename)) {
  console.error("Usage: node scripts/audit-account-data-readonly.js /absolute/path/to/isolated-backup.json");
  process.exit(2);
}
try {
  const stat = fs.lstatSync(filename);
  if (!stat.isFile() || stat.isSymbolicLink()) throw Error("Expected a regular file, not a symlink");
  if (stat.size > 100 * 1024 * 1024) throw Error("Refusing file larger than 100 MiB");
  const data = JSON.parse(fs.readFileSync(filename, "utf8"));
  if (!data || typeof data !== "object" || Array.isArray(data)) throw Error("Backup root must be a JSON object");
  const collections = ["users","sessions","cases","documents","conversations","notifications","consents","auditLogs"];
  const failures = [], warnings = [];
  for (const key of collections) if (!Array.isArray(data[key])) failures.push(key + " collection missing or invalid");
  const users = Array.isArray(data.users) ? data.users : [];
  const ids = new Set(users.map(u => u && u.id));
  for (const key of ["sessions","cases","documents","conversations","notifications","consents"]) {
    if (!Array.isArray(data[key])) continue;
    const broken = data[key].filter(row => row && row.userId && !ids.has(row.userId)).length;
    if (broken) failures.push(key + " has " + broken + " orphaned user references");
  }
  const mode = stat.mode & 0o777;
  if (mode & 0o077) warnings.push("Backup file is readable/writable by group or others; restrict to mode 0600");
  if (Array.isArray(data.sessions) && data.sessions.some(s=>s && typeof s.token === "string"))
    warnings.push("Session tokens are present in backup; treat it as a secret and do not share/export publicly");
  console.log(JSON.stringify({file:"[REDACTED]",readOnly:true,collectionsChecked:collections.length,
    checksPassed:failures.length===0,failures,warnings},null,2));
  process.exitCode = failures.length ? 1 : 0;
} catch (error) {
  console.error("Account backup verification failed:", error.message);
  process.exitCode = 1;
}
