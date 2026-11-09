"use strict";

// Defense-in-depth redaction for ALL outbound OpenRouter text content.
// Heuristic PII redaction does not replace consent, DLP, legal review or source inspection.
const MASK = Object.freeze({
 JSHSHIR:"[JSHSHIR_YASHIRILDI]", PASPORT:"[PASPORT_YASHIRILDI]",
 EMAIL:"[EMAIL_YASHIRILDI]", TELEFON:"[TELEFON_YASHIRILDI]",
 MANZIL:"[MANZIL_YASHIRILDI]", BANK_KARTA:"[BANK_KARTA_YASHIRILDI]"
});
function redactForAI(input) {
 let text=String(input ?? ""), categories=new Set();
 const mask=(regex,label)=>{text=text.replace(regex,()=>{categories.add(label);return MASK[label];});};
 // Recognize labeled and standalone Uzbek 14-digit personal identifiers.
 mask(/\b(?:JSHSHIR|PINFL|ПИНФЛ)\s*[:№#-]?\s*\d{14}\b/giu,"JSHSHIR");
 mask(/\b\d{14}\b/g,"JSHSHIR");
 // Passport series/number can be separated by a space, with or without a label.
 mask(/(?:pasport(?:\s+(?:raqami|seriyasi|number))?|passport(?:\s+number)?|паспорт(?:\s+(?:серия|номер))?)\s*[:№#-]?\s*[A-Z]{2}\s*\d{7}\b/giu,"PASPORT");
 mask(/\b[A-Z]{2}\s?\d{7}\b/g,"PASPORT");
 mask(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu,"EMAIL");
 mask(/(?<!\d)(?:\+?998[\s().-]*)?(?:\d{2}[\s().-]*)\d{3}[\s().-]*\d{2}[\s().-]*\d{2}(?!\d)/g,"TELEFON");
 // Addresses explicitly labeled on their own line or following ordinary punctuation.
 mask(/(?:^|[\n\r;])\s*(?:yashash\s+manzil(?:im|i)?|doimiy\s+manzil(?:im|i)?|manzil(?:im|i)?|yashash\s+joy(?:im|i)?|address|residential\s+address|адрес(?:\s+проживания)?)\s*[:：]\s*[^\n\r;]{4,160}/gimu,"MANZIL");
 // 13–19 digit PAN-like sequences, including grouped spaces and dashes.
 mask(/(?<!\d)(?:\d[ -]?){12,18}\d(?!\d)/g,"BANK_KARTA");
 return {text,categories:[...categories]};
}
function minimizeMessages(messages) {
 if(!Array.isArray(messages))return [];
 return messages.map(message=>{
   if(!message || typeof message!=="object")return {role:"user",content:"[XABAR_TEKSHiRILMAGAN]"};
   if(typeof message.content==="string")return {...message,content:redactForAI(message.content).text};
   if(Array.isArray(message.content))return {...message,content:message.content.map(item=>{
     if(item && item.type==="text" && typeof item.text==="string")
       return {...item,text:redactForAI(item.text).text};
     return {type:"text",text:"[FAYL_TARKIBI_TEKSHIRILMAGAN]"};
   })};
   return {...message,content:"[XABAR_TARKIBI_TEKSHIRILMAGAN]"};
 });
}
module.exports={redactForAI,minimizeMessages};
