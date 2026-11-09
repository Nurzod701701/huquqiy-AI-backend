"use strict";

// Defense-in-depth for text transmitted to external LLMs.
// Heuristic redaction is NOT a substitute for consent, DLP or document review.
const MASK = Object.freeze({
  JSHSHIR:"[JSHSHIR_YASHIRILDI]", PASPORT:"[PASPORT_YASHIRILDI]",
  EMAIL:"[EMAIL_YASHIRILDI]", TELEFON:"[TELEFON_YASHIRILDI]",
  MANZIL:"[MANZIL_YASHIRILDI]", BANK_KARTA:"[BANK_KARTA_YASHIRILDI]"
});
function redactForAI(input) {
  let text=String(input ?? "");
  const findings=new Set();
  function mask(pattern,label) {
    text=text.replace(pattern,()=>{findings.add(label);return MASK[label];});
  }
  // Avoid widening the phone regex to arbitrary 9-digit numbers such as article IDs.
  mask(/\b(?:JSHSHIR|PINFL|ПИНФЛ)\s*[:№#-]?\s*\d{14}\b/giu,"JSHSHIR");
  mask(/\b\d{14}\b/g,"JSHSHIR");
  mask(/\b(?:pasport|passport|паспорт)\s*(?:raqami|number|серия|№|:)?\s*[A-Z]{2}\s*\d{7}\b/giu,"PASPORT");
  mask(/\b[A-Z]{2}\s?\d{7}\b/gi,"PASPORT");
  mask(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu,"EMAIL");
  mask(/(?<!\d)(?:\+?998[\s().-]*)?(?:\d{2}[\s().-]*)\d{3}[\s().-]*\d{2}[\s().-]*\d{2}(?!\d)/g,"TELEFON");
  // Only mask high-confidence address fields; do not erase whole legal case narratives.
  mask(/(?:^|\n)\s*(?:yashash\s+manzil(?:i)?|doimiy\s+manzil(?:i)?|manzil(?:i)?|address|адрес(?:\s+проживания)?)\s*[:：]\s*[^\n\r;]{4,160}/gimu,"MANZIL");
  // PAN requires boundaries, and must match valid 13-19 digit card format.
  mask(/(?<!\d)(?:\d[ -]?){12,18}\d(?!\d)/g,"BANK_KARTA");
  return {text,categories:[...findings]};
}
function minimizeMessages(messages) {
  if(!Array.isArray(messages))return [];
  return messages.map(message=>{
    if(!message || typeof message!=="object")return message;
    if(typeof message.content==="string")return {...message,content:redactForAI(message.content).text};
    if(Array.isArray(message.content))return {...message,content:message.content.map(item=>{
      if(item&&typeof item.text==="string")return {...item,text:redactForAI(item.text).text};
      // Never send externally supplied raw image/document parts without a DLP review.
      if(item&&typeof item==="object"&&item.type!=="text")return {type:"text",text:"[FAYL_TARKIBI_TEKSHiRILMAGAN]"};
      return item;
    })};
    return message;
  });
}
module.exports={redactForAI,minimizeMessages};
