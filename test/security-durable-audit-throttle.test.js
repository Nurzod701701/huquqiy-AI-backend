"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const temp=fs.mkdtempSync(path.join(os.tmpdir(),"qomus-security-qa-"));
process.env.SECURITY_AUDIT_FILE=path.join(temp,"security.jsonl");
const {saveEvent,readRecentEvents}=require("../security-event-store");
const {getLoginBlockSeconds,recordLoginFailure,clearLoginFailures}=require("../security-hardening");

test("credential-specific login throttle blocks after 8 failures, independently by account",()=>{
 const user="test-user-"+process.pid+"@example.invalid";
 const other="other-user-"+process.pid+"@example.invalid";
 for(let i=0;i<8;i++)recordLoginFailure("user",user);
 assert.ok(getLoginBlockSeconds("user",user)>0);
 assert.equal(getLoginBlockSeconds("user",other),0);
 clearLoginFailures("user",user);
 assert.equal(getLoginBlockSeconds("user",user),0);
});
test("admin login has stricter six-attempt threshold",()=>{
 const key="admin-"+process.pid+"@example.invalid";
 for(let i=0;i<6;i++)recordLoginFailure("admin",key);
 assert.ok(getLoginBlockSeconds("admin",key)>0);
 clearLoginFailures("admin",key);
});
test("audit events survive module cache removal and do not expose raw identifiers",()=>{
 saveEvent({category:"FAILED_LOGIN",sourceId:"abc123",path:"/login?email=secret@example.com",at:"2026-11-09T06:00:00.000Z",password:"not-for-storage"});
 const disk=fs.readFileSync(process.env.SECURITY_AUDIT_FILE,"utf8");
 assert.equal(disk.includes("secret@example.com"),false);
 assert.equal(disk.includes("not-for-storage"),false);
 assert.equal(readRecentEvents(2)[0].category,"FAILED_LOGIN");
 const modulePath=require.resolve("../security-event-store");
 delete require.cache[modulePath];
 assert.equal(require("../security-event-store").readRecentEvents(2)[0].category,"FAILED_LOGIN");
});
