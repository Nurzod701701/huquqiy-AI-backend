"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const {applySecurityHeaders, guardSensitiveRequest} = require("../security-hardening");

function request(path, ip, options={}) {
  return {
    method: "POST", url: path, socket: {remoteAddress: ip, encrypted: false},
    headers: {host: "qomus.test", ...options}
  };
}
function response() {
  const headers = {}; let status = 200; let ended = false;
  return {
    headers,
    setHeader(k,v) {headers[k.toLowerCase()]=v;},
    writeHead(code, extra) {status=code;Object.assign(headers,extra);},
    end() {ended=true;},
    get status(){return status;}, get ended(){return ended;}
  };
}

test("sets browser hardening headers",()=>{
  const req=request("/login","unit-headers");
  const res=response();
  applySecurityHeaders(req,res);
  assert.equal(res.headers["x-content-type-options"],"nosniff");
  assert.equal(res.headers["x-frame-options"],"DENY");
  assert.equal(res.headers["referrer-policy"],"strict-origin-when-cross-origin");
});

test("blocks cross-site authenticated account changes",()=>{
  const req=request("/account/profile","unit-csrf",{
    origin:"https://attacker.example",cookie:"hq_session=anything","sec-fetch-site":"cross-site"
  });
  const res=response();
  assert.equal(guardSensitiveRequest(req,res),true);
  assert.equal(res.status,403);
});

test("permits same-origin authenticated form submission",()=>{
  const req=request("/account/profile","unit-same",{
    origin:"https://qomus.test",cookie:"hq_session=anything","sec-fetch-site":"same-origin"
  });
  const res=response();
  assert.equal(guardSensitiveRequest(req,res),false);
  assert.equal(res.ended,false);
});

test("rate limits repeated authentication requests",()=>{
  process.env.QOMUS_PILOT_AUTH_LIMIT="enabled";
  const ip="unit-rate-" + process.pid;
  for(let i=0;i<12;i++){
    const res=response();
    assert.equal(guardSensitiveRequest(request("/login",ip),res),false);
  }
  const res=response();
  assert.equal(guardSensitiveRequest(request("/login",ip),res),true);
  assert.equal(res.status,429);
  assert.ok(Number(res.headers["Retry-After"])>0);
  delete process.env.QOMUS_PILOT_AUTH_LIMIT;
});

test("removes common personal identifiers from outbound AI prompts",()=>{
  const {redactForAI,minimizeMessages}=require("../ai-privacy");
  const input="JSHSHIR: 12345678901234, passport AA1234567; Email: user@example.com";
  const sanitized=redactForAI(input);
  assert.ok(!sanitized.text.includes("12345678901234"));
  assert.ok(!sanitized.text.includes("AA1234567"));
  assert.ok(!sanitized.text.includes("user@example.com"));
  const messages=minimizeMessages([{role:"user",content:input},{role:"system",content:"Public source"}]);
  assert.ok(!messages[0].content.includes("12345678901234"));
  assert.equal(messages[1].content,"Public source");
});
