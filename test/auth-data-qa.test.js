"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const {guardSensitiveRequest,applySecurityHeaders} = require("../security-hardening");
function req(route, {method="POST",host="qomus.test",origin,site,cookie}={}){
  const headers={host}; if(origin!==undefined)headers.origin=origin;
  if(site!==undefined)headers["sec-fetch-site"]=site;
  if(cookie!==undefined)headers.cookie=cookie;
  return {url:route,method,headers,socket:{remoteAddress:"qa-" + route,encrypted:true}};
}
function response(){
  let code=200;const headers={};
  return {headers,setHeader(k,v){headers[k]=v;},writeHead(c,h){code=c;Object.assign(headers,h);},end(){},
  get status(){return code;}};
}
test("authenticated profile POST without verifiable origin is rejected",()=>{
 const res=response();assert.equal(guardSensitiveRequest(req("/account/profile",{cookie:"hq_session=test"}),res),true);
 assert.equal(res.status,403);
});
test("cross-site admin POST without cookie is rejected",()=>{
 const res=response();assert.equal(guardSensitiveRequest(req("/admin/user-status",{site:"cross-site"}),res),true);
 assert.equal(res.status,403);
});
test("cross-site requests to public register are not accidentally denied by account guard",()=>{
 const res=response();assert.equal(guardSensitiveRequest(req("/register",{site:"cross-site"}),res),false);
});
test("HTTPS responses include HSTS and baseline browser headers",()=>{
 const res=response();applySecurityHeaders(req("/login"),res);
 assert.equal(res.headers["Strict-Transport-Security"],"max-age=31536000");
 assert.equal(res.headers["X-Content-Type-Options"],"nosniff");
});
test("cross-site GET is unaffected by POST-only guard",()=>{
 const res=response();assert.equal(guardSensitiveRequest(req("/account/profile",{method:"GET",site:"cross-site"}),res),false);
});
