"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const source = fs.readFileSync(path.join(__dirname,"..","server.js"),"utf8");
const alerts = fs.readFileSync(path.join(__dirname,"..","security-alerts.js"),"utf8");

test("admin security dashboard route is inside privileged admin guard", () => {
  const adminBlock = source.slice(source.indexOf('if(pathname.startsWith("/admin")){'));
  assert.match(adminBlock, /accountRequire\(req,res,lang,\["owner","admin"\]\)/);
  assert.ok(adminBlock.includes('pathname==="/admin/security"'));
  assert.ok(adminBlock.includes('pathname==="/admin/security/revoke-sessions"'));
});
test("session revocation checks target and role before modifying records", () => {
  const i=source.indexOf('pathname==="/admin/security/revoke-sessions"');
  assert.ok(i>0);
  const block=source.slice(i,i+1150);
  assert.match(block,/target\.id===user\.id/);
  assert.match(block,/user\.role!=="owner"&&target\.role!=="user"/);
  assert.match(block,/db\.sessions=db\.sessions\.filter\(x=>x\.userId!==target\.id\)/);
  assert.match(block,/admin_sessions_revoked/);
});
test("ordinary admins cannot change privileged account status", () => {
  assert.match(source,/user\.role==="owner"\|\|target\.role==="user"/);
});
test("dashboard never renders session tokens or IP addresses", () => {
  const section=source.slice(source.indexOf("function adminSecurityPage("),source.indexOf("function ownerSetupPage(",source.indexOf("function adminSecurityPage(")));
  assert.ok(section.includes("getRecentSecurityEvents()"));
  assert.doesNotMatch(section,/session\.token|\.remoteAddress|\.passwordHash/);
  assert.match(alerts,/getRecentSecurityEvents/);
  assert.match(alerts,/MAX_RECENT_EVENTS = 100/);
});
test("failed auth records redacted event categories", () => {
  assert.match(source,/alertEvent\("FAILED_LOGIN"/);
  assert.match(source,/alertEvent\("FAILED_ADMIN_LOGIN"/);
  assert.match(alerts,/FAILED_LOGIN/);
  assert.match(alerts,/FAILED_ADMIN_LOGIN/);
});
