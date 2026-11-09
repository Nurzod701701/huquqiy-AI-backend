"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {guardSensitiveRequest} = require("../security-hardening");
const alertSource = fs.readFileSync(path.join(__dirname,"..","security-alerts.js"),"utf8");

function check(route, origin, fetchSite="same-site") {
  let status=200, ended=false;
  const headers={};
  const req={method:"POST",url:route,socket:{remoteAddress:"qa-admin-origin"},headers:{
    host:"verius.uz",cookie:"hq_session=example",origin,"sec-fetch-site":fetchSite
  }};
  const res={setHeader(){},writeHead(code,extra){status=code;Object.assign(headers,extra);},end(){ended=true;}};
  return {blocked:guardSensitiveRequest(req,res),status,ended};
}
test("admin session revocation rejects cross-origin mutation",()=>{
  const result=check("/admin/security/revoke-sessions","https://attacker.example");
  assert.equal(result.blocked,true);
  assert.equal(result.status,403);
});
test("admin status mutation rejects missing origin with session",()=>{
  const result=check("/admin/user-status",undefined);
  assert.equal(result.blocked,true);
  assert.equal(result.status,403);
});
test("admin same-origin mutation remains allowed",()=>{
  const result=check("/admin/security/revoke-sessions","https://verius.uz");
  assert.equal(result.blocked,false);
  assert.equal(result.status,200);
});
test("admin login is not blocked by authenticated admin origin rule",()=>{
  const result=check("/admin/login",undefined);
  assert.equal(result.blocked,false);
});
test("security delivery explicitly checks non-2xx response",()=>{
  assert.match(alertSource,/response\.ok/);
  assert.match(alertSource,/SECURITY_ALERT_DELIVERY_FAILED/);
});
