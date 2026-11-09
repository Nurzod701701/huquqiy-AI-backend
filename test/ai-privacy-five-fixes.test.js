"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {redactForAI,minimizeMessages}=require("../ai-privacy");
test("redacts passport numbers with labels, without labels, and with a series gap",()=>{
 for(const v of ["pasport AA1234567","Passport number AB 7654321","паспорт: AC1234567","AD1234567"]) {
   const r=redactForAI(v);
   assert.ok(r.categories.includes("PASPORT"),v);
   assert.doesNotMatch(r.text,/[A-Z]{2}\s?\d{7}/i);
 }
});
test("redacts common labeled addresses including Manzilim and Yashash joyim",()=>{
 for(const v of ["Manzilim: Toshkent shahri, Chilonzor tumani, 5-uy","Yashash manzili: Samarqand viloyati, 8-uy","Address: 12 Main Street, Tashkent"]) {
  const r=redactForAI(v);
  assert.ok(r.categories.includes("MANZIL"),v);
  assert.ok(r.text.includes("[MANZIL_YASHIRILDI]"));
  assert.equal(/Chilonzor|Samarqand|Main Street/.test(r.text),false);
 }
});
test("redacts PAN-like bank card numbers without leaking card details",()=>{
 for(const v of ["8600 1234 5678 9012","9860123456789012","4111-1111-1111-1111"]) {
  const r=redactForAI("Karta: "+v);
  assert.ok(r.categories.includes("BANK_KARTA"),v);
  assert.equal(r.text.includes(v),false);
 }
});
test("masks JSHSHIR, Uzbek phone and email while preserving legal article number",()=>{
 const r=redactForAI("PINFL: 12345678901234; +998 90 123 45 67; test@example.com; FK 353-modda");
 for(const v of ["12345678901234","+998 90 123 45 67","test@example.com"])assert.equal(r.text.includes(v),false,v);
 assert.match(r.text,/353-modda/);
});
test("redacts all outbound roles, including system and assistant content, without modifying inputs",()=>{
 const source=[{role:"system",content:"Collected case information: AA1234567"},{role:"assistant",content:"Karta: 8600 1234 5678 9012"},{role:"user",content:"Manzilim: Toshkent, 9-uy"}];
 const result=minimizeMessages(source);
 assert.equal(JSON.stringify(result).includes("AA1234567"),false);
 assert.equal(JSON.stringify(result).includes("8600 1234"),false);
 assert.equal(JSON.stringify(result).includes("Toshkent"),false);
 assert.match(source[0].content,/AA1234567/);
});
test("blocks unreviewed images, documents, and unsupported structured content from the LLM",()=>{
 const source=[{role:"user",content:[{type:"text",text:"AB1234567"},{type:"image_url",image_url:{url:"data:image/png;base64,VERY_PRIVATE"}}]},{role:"user",content:{file:"HIDDEN_DOCUMENT"}}];
 const result=minimizeMessages(source);
 assert.equal(JSON.stringify(result).includes("VERY_PRIVATE"),false);
 assert.equal(JSON.stringify(result).includes("HIDDEN_DOCUMENT"),false);
 assert.equal(JSON.stringify(result).includes("AB1234567"),false);
 assert.match(JSON.stringify(result),/FAYL_TARKIBI_TEKSHIRILMAGAN/);
});
