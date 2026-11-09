"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const {setTimeout:delay}=require("node:timers/promises");

test("security alert sends redacted payload through configured Resend HTTPS API (mock only)",async()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"qomus-mail-qa-"));
  const envKeys=["SECURITY_AUDIT_FILE","SECURITY_ALERT_EMAIL","EMAIL_FROM","RESEND_API_KEY","SECURITY_ALERT_WEBHOOK"];
  const original=Object.fromEntries(envKeys.map(k=>[k,process.env[k]]));
  const originalFetch=global.fetch;
  try{
    process.env.SECURITY_AUDIT_FILE=path.join(dir,"security.jsonl");
    process.env.SECURITY_ALERT_EMAIL="security-recipient@example.invalid";
    process.env.EMAIL_FROM="QOMUS <security@verius.uz>";
    process.env.RESEND_API_KEY="synthetic-mock-only";
    delete process.env.SECURITY_ALERT_WEBHOOK;
    let request;
    global.fetch=async(url,opts)=>{request={url,opts};return {ok:true,status:202}};
    const {alertEvent}=require("../security-alerts");
    alertEvent("FAILED_ADMIN_LOGIN","192.0.2.250","/admin/login?password=secret");
    await delay(20);
    assert.ok(request,"Expected mocked outbound Resend request");
    assert.equal(request.url,"https://api.resend.com/emails");
    const body=JSON.parse(request.opts.body);
    assert.equal(body.to[0],process.env.SECURITY_ALERT_EMAIL);
    assert.equal(body.subject,"QOMUS xavfsizlik ogohlantirishi: FAILED_ADMIN_LOGIN");
    assert.equal(body.text.includes("192.0.2.250"),false);
    assert.equal(body.text.includes("password=secret"),false);
    assert.equal(body.text.includes("/admin/login"),true);
    assert.equal(request.opts.headers.Authorization,"Bearer synthetic-mock-only");
    assert.match(fs.readFileSync(process.env.SECURITY_AUDIT_FILE,"utf8"),/FAILED_ADMIN_LOGIN/);
  } finally {
    global.fetch=originalFetch;
    for(const k of envKeys)if(original[k]===undefined)delete process.env[k];else process.env[k]=original[k];
  }
});
