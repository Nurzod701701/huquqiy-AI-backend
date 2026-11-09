"use strict";
const crypto=require("node:crypto");
const {redactForAI,minimizeMessages}=require("./ai-privacy");
const processSecret=crypto.randomBytes(32);
const TOKEN_TTL_MS=10*60*1000;
function esc(v) {return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");}
function payloadFingerprint(payload) {return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");}
function tokenFor(payload,time=Date.now()) {
 const stamp=String(Math.floor(time/1000));
 const mac=crypto.createHmac("sha256",processSecret).update(stamp+":"+payloadFingerprint(payload)).digest("hex");
 return stamp+"."+mac;
}
function checkToken(payload,token,now=Date.now()) {
 const parts=String(token||"").split(".");
 if(parts.length!==2||!/^\d{10}$/.test(parts[0])||!/^[a-f0-9]{64}$/.test(parts[1]))return false;
 const date=Number(parts[0])*1000;
 if(date>now+30000||now-date>TOKEN_TTL_MS)return false;
 const expected=tokenFor(payload,date).split(".")[1];
 return crypto.timingSafeEqual(Buffer.from(expected,"hex"),Buffer.from(parts[1],"hex"));
}
function sanitizeText(value) {return redactForAI(String(value||"")).text;}
// Fail closed for credentials and bearer-style tokens not covered by PII masking.
// This protects the outbound boundary; it does not replace document classification.
function containsUnreviewedSecret(text) {
 const value=String(text||"");
 // Allow separators commonly pasted from forms, including line breaks and em dashes.
 if(/\b(?:api[\\s_-]*key|authorization|private[\\s_-]*key|password|passphrase|parol|cvv|cvc|pin[\\s_-]*code|secret[\\s_-]*key|access[\\s_-]*token|refresh[\\s_-]*token)\\b[\\s:：=–—-]*(?:bearer\\s+)?\\S{3,}/iu.test(value))return true;
 // Credential formats may appear without a descriptive label.
 if(/\b(?:sk-or-v1-[a-f0-9]{20,}|github_pat_[a-zA-Z0-9_]{20,}|gh[pousr]_[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16})\b/.test(value))return true;
 // JWT strings can carry authorization and user data even without a label.
 if(/\beyJ[A-Za-z0-9_-]{16,}\\.eyJ[A-Za-z0-9_-]{16,}\\.[A-Za-z0-9_-]{8,}\b/.test(value))return true;
 return false;
}
function auditOutbound(messages) {
 const sanitized=minimizeMessages(messages);
 // Refuse any unknown/opaque binary and references instead of sending raw data.
 for(const message of sanitized) {
   if(!message || typeof message.content!=="string")throw Error("AI_PRIVACY_UNVERIFIED_CONTENT");
   if(message.content.includes("[FAYL_TARKIBI_TEKSHIRILMAGAN]") ||
      message.content.includes("[XABAR_TARKIBI_TEKSHIRILMAGAN]") ||
      message.content.includes("[XABAR_TEKSHiRILMAGAN]"))throw Error("AI_PRIVACY_UNVERIFIED_CONTENT");
   // Do not send raw data URIs, PEM keys, or large opaque binary strings.
   if(/data:(?:image|application)\/[^\s;,]+;base64,|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i.test(message.content) ||
      /(?:^|[^A-Za-z0-9+/])[A-Za-z0-9+/]{500,}={0,2}(?:$|[^A-Za-z0-9+/])/m.test(message.content))
     throw Error("AI_PRIVACY_UNVERIFIED_CONTENT");
   // These are not validated by pattern-based redaction. Reject high-risk secret fields.
   if(containsUnreviewedSecret(message.content))throw Error("AI_PRIVACY_UNVERIFIED_CONTENT");
 }
 return sanitized.map(message=>({role:["system","user","assistant"].includes(message.role)?message.role:"user",content:message.content}));
}
function consentPanel(lang,route,payload,description) {
 const t={
  uz:{title:"AI'ga yuboriladigan matnni tekshiring",description:"Quyida yashirilgan nusxa ko'rsatilgan. Shaxsiy ma'lumotlar to'liq aniqlanishi kafolatlanmaydi. To'g'ri bo'lmasa, orqaga qayting.",consent:"Ko'rsatilgan matn tashqi OpenRouter AI xizmatiga yuborilishiga roziman.",send:"Tasdiqlash va AI'ga yuborish",back:"Orqaga qaytish"},
  ru:{title:"Проверьте текст для ИИ",description:"Показана скрытая копия. Автоматическая очистка может пропустить данные. При сомнениях вернитесь назад.",consent:"Я согласен отправить показанный текст внешнему сервису OpenRouter.",send:"Подтвердить и отправить",back:"Назад"},
  en:{title:"Review text before external AI",description:"This is the redacted copy. Automated detection can miss private information. Go back if anything sensitive remains.",consent:"I agree to send the displayed content to the external OpenRouter AI service.",send:"Confirm and send",back:"Go back"}
 }[lang]||null;
 const tt=t||{
  title:"AI'ga yuboriladigan matnni tekshiring",
  description:"Shaxsiy ma'lumotlarni tekshiring.",
  consent:"Yuborishga roziman.",send:"Yuborish",back:"Orqaga"
 };
 const hidden=Object.entries(payload).map(([name,value])=>'<input type="hidden" name="'+esc(name)+'" value="'+esc(value)+'">').join("");
 const preview=description||Object.values(payload).filter(x=>typeof x==="string").join("\n\n");
 return '<section class="panel" style="max-width:900px;margin:20px auto;padding:24px">'+
  '<h2>'+esc(tt.title)+'</h2><p>'+esc(tt.description)+'</p>'+
  '<pre style="white-space:pre-wrap;overflow-wrap:anywhere;max-height:420px;overflow:auto;padding:16px;background:#f6f7f8;color:#142536;border-radius:12px">'+esc(preview)+'</pre>'+
  '<form method="POST" action="'+esc(route)+'?lang='+esc(lang)+'">'+hidden+
  '<input type="hidden" name="aiConsentToken" value="'+esc(tokenFor(payload))+'">'+
  '<label style="display:block;margin:18px 0"><input type="checkbox" required name="aiConsent" value="yes"> '+esc(tt.consent)+'</label>'+
  '<button class="btn btnGold" type="submit">'+esc(tt.send)+'</button> '+
  '<button type="button" class="btn" onclick="history.back()">'+esc(tt.back)+'</button></form></section>';
}
module.exports={sanitizeText,auditOutbound,tokenFor,checkToken,consentPanel};
