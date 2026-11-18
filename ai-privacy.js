"use strict";

// Defense-in-depth redaction for ALL outbound Gemini (AI) text content.
// Heuristic PII redaction does not replace consent, DLP, legal review or source inspection.
const MASK = Object.freeze({
 JSHSHIR:"[JSHSHIR_YASHIRILDI]", PASPORT:"[PASPORT_YASHIRILDI]",
 EMAIL:"[EMAIL_YASHIRILDI]", TELEFON:"[TELEFON_YASHIRILDI]",
 MANZIL:"[MANZIL_YASHIRILDI]", BANK_KARTA:"[BANK_KARTA_YASHIRILDI]"
});
// "150000000 so‘m" or "№123456789" are money / document numbers, not phones.
const MONEY_AFTER = /^\s*(?:so[‘'’`ʻ]?m|sum\b|uzs\b|сум)/i;
const NUMBER_BEFORE = /(?:№|#|\bN\.?)\s*$/;

// tokenFor(label, original) returns the placeholder that replaces a match.
function redactCore(input, tokenFor) {
 let text=String(input ?? ""), categories=new Set();
 const mask=(regex,label,keep)=>{text=text.replace(regex,(...args)=>{
   const match=args[0], offset=args[args.length-2], whole=args[args.length-1];
   if(keep && keep(match,offset,whole)) return match;
   categories.add(label); return tokenFor(label,match);
 });};
 // Recognize labeled and standalone Uzbek 14-digit personal identifiers.
 mask(/\b(?:JSHSHIR|PINFL|ПИНФЛ)\s*[:№#-]?\s*\d{14}\b/giu,"JSHSHIR");
 mask(/\b\d{14}\b/g,"JSHSHIR");
 // Passport series/number can be separated by a space, with or without a label.
 mask(/(?:pasport(?:\s+(?:raqami|seriyasi|number))?|passport(?:\s+number)?|паспорт(?:\s+(?:серия|номер))?)\s*[:№#-]?\s*[A-Z]{2}\s*\d{7}\b/giu,"PASPORT");
 mask(/\b[A-Z]{2}\s?\d{7}\b/g,"PASPORT");
 mask(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu,"EMAIL");
 mask(/(?<!\d)(?:\+?998[\s().-]*)?(?:\d{2}[\s().-]*)\d{3}[\s().-]*\d{2}[\s().-]*\d{2}(?!\d)/g,"TELEFON",
   (m,offset,whole)=>!/^\+?998/.test(m.trim()) && (MONEY_AFTER.test(whole.slice(offset+m.length,offset+m.length+8)) || NUMBER_BEFORE.test(whole.slice(Math.max(0,offset-4),offset))));
 // Addresses explicitly labeled on their own line or following ordinary punctuation.
 mask(/(?:^|[\n\r;])\s*(?:yashash\s+manzil(?:im|i)?|doimiy\s+manzil(?:im|i)?|manzil(?:im|i)?|yashash\s+joy(?:im|i)?|address|residential\s+address|адрес(?:\s+проживания)?)\s*[:：]\s*[^\n\r;]{4,160}/gimu,"MANZIL");
 // 13–19 digit PAN-like sequences, including grouped spaces and dashes.
 mask(/(?<!\d)(?:\d[ -]?){12,18}\d(?!\d)/g,"BANK_KARTA");
 return {text,categories:[...categories]};
}

function redactForAI(input) {
 return redactCore(input, label => MASK[label]);
}

// Reversible variant for documents the user will file: every value gets a
// numbered placeholder ([TELEFON_1], [MANZIL_2]); the originals stay with
// VERIUS (state.map) and are put back into the AI's draft afterwards, so the
// external AI never sees them but the court document keeps them.
function newRestoreState(){ return {map:{},count:{}}; }
function redactReversible(input, state) {
 const byValue=new Map(Object.entries(state.map).map(([k,v])=>[v,k]));
 return redactCore(input,(label,original)=>{
   if(byValue.has(original)) return byValue.get(original);
   state.count[label]=(state.count[label]||0)+1;
   const token="["+label+"_"+state.count[label]+"]";
   state.map[token]=original; byValue.set(original,token);
   return token;
 });
}
const TOKEN_RE=/\[(?:JSHSHIR|PASPORT|EMAIL|TELEFON|MANZIL|BANK_KARTA)_\d{1,4}\]/g;
function restoreText(text, map) {
 if(!map || typeof map!=="object") return String(text ?? "");
 return String(text ?? "").replace(TOKEN_RE,t=>Object.prototype.hasOwnProperty.call(map,t)?String(map[t]):t);
}
function remainingPlaceholders(text) {
 const re=/\[(?:JSHSHIR|PASPORT|EMAIL|TELEFON|MANZIL|BANK_KARTA)_(?:\d{1,4}|YASHIRILDI)\]/g;
 return [...new Set(String(text ?? "").match(re)||[])];
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
module.exports={redactForAI,minimizeMessages,redactReversible,newRestoreState,restoreText,remainingPlaceholders,MASK};
