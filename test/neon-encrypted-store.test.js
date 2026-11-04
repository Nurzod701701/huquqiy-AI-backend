"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const {seal,unseal}=require("../database/neon-encrypted-store");

test("encrypted records restore only with correct owner and id",()=>{
  const key=crypto.randomBytes(32), doc={title:"Test case",data:"FAKE DATA ONLY"};
  const e=seal(doc,key,"USR-TEST1","DOC-TEST1");
  assert.ok(!e.ciphertext.toString("utf8").includes("FAKE DATA"));
  assert.deepEqual(unseal({iv:e.iv,auth_tag:e.tag,ciphertext:e.ciphertext},key,"USR-TEST1","DOC-TEST1"),doc);
  assert.throws(()=>unseal({iv:e.iv,auth_tag:e.tag,ciphertext:e.ciphertext},key,"USR-OTHER","DOC-TEST1"));
});
test("tampering with ciphertext is detected",()=>{
  const key=crypto.randomBytes(32),e=seal({hello:"world"},key,"USR-TEST1","DOC-TEST1");
  const altered=Buffer.from(e.ciphertext);altered[0]^=1;
  assert.throws(()=>unseal({iv:e.iv,auth_tag:e.tag,ciphertext:altered},key,"USR-TEST1","DOC-TEST1"));
});
test("oversized documents rejected",()=>{
  const key=crypto.randomBytes(32);
  assert.throws(()=>seal({content:"A".repeat(200000)},key,"USR-TEST1","DOC-TEST1"),/DOCUMENT_TOO_LARGE/);
});
