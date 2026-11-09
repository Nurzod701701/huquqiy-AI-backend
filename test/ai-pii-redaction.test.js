"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {redactForAI,minimizeMessages}=require("../ai-privacy");
test("sensitive personal data masked before external LLM request",()=>{
 const input="PINFL: 12345678901234, passport AA1234567, email test.person@example.com, phone +998 90 123 45 67\nmanzil: Toshkent shahar Chilonzor 12-uy";
 const out=redactForAI(input);
 for(const marker of ["JSHSHIR","PASPORT","EMAIL","TELEFON","MANZIL"])assert.ok(out.categories.includes(marker),marker);
 for(const secret of ["12345678901234","AA1234567","test.person@example.com","+998 90 123 45 67","Chilonzor 12-uy"])assert.equal(out.text.includes(secret),false,secret);
});
test("outbound user AND assistant content and collected-case notes redacted",()=>{
 const source=[{role:"user",content:"passport AB7654321"},{role:"assistant",content:"Repeat +998 91 456 78 90"},{role:"system",content:"Collected case information: email a@b.uz"}];
 const outgoing=minimizeMessages(source);
 assert.ok(outgoing.every(v=>!v.content.includes("7654321")&&!v.content.includes("+998 91")&&!v.content.includes("a@b.uz")));
 assert.equal(source[0].content,"passport AB7654321","original chat data must not be modified");
});
test("multimodal external content fails closed for unreviewed image parts",()=>{
 const result=minimizeMessages([{role:"user",content:[{type:"text",text:"PINFL: 12345678901234"},{type:"image_url",image_url:{url:"data:image/png;base64,secret"}}]}]);
 assert.equal(result[0].content[0].text.includes("12345678901234"),false);
 assert.equal(result[0].content[1].type,"text");
 assert.equal(JSON.stringify(result).includes("base64,secret"),false);
});
test("legal article IDs and laws remain readable",()=>{
 const out=redactForAI("Fuqarolik kodeksi 353-modda. Qaror 2026/157.");
 assert.match(out.text,/353-modda/);assert.match(out.text,/2026\/157/);
});
