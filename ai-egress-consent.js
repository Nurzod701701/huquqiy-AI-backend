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
// Originals of reversibly masked values travel back to VERIUS sealed with
// AES-256-GCM (key never leaves this process), bound to the consent token.
// Gemini never receives them; the court document gets them back.
const restoreKey=crypto.createHmac("sha256",processSecret).update("verius-restore-v1").digest();
function sealRestore(map,token) {
 const iv=crypto.randomBytes(12);
 const c=crypto.createCipheriv("aes-256-gcm",restoreKey,iv);c.setAAD(Buffer.from(String(token)));
 const body=Buffer.concat([c.update(JSON.stringify(map||{}),"utf8"),c.final()]);
 return [iv,c.getAuthTag(),body].map(b=>b.toString("base64url")).join(".");
}
function openRestore(sealed,token) {
 try {
  const [iv,tag,body]=String(sealed||"").split(".").map(x=>Buffer.from(x||"","base64url"));
  if(!iv||iv.length!==12||!tag||tag.length!==16||!body||body.length>200000)return null;
  const d=crypto.createDecipheriv("aes-256-gcm",restoreKey,iv);d.setAAD(Buffer.from(String(token)));d.setAuthTag(tag);
  const map=JSON.parse(Buffer.concat([d.update(body),d.final()]).toString("utf8"));
  if(!map||typeof map!=="object"||Array.isArray(map))return null;
  const out={};for(const [k,v] of Object.entries(map))if(/^\[[A-Z_]+_\d{1,4}\]$/.test(k)&&typeof v==="string")out[k]=v.slice(0,500);
  return out;
 } catch(_) {return null;}
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
   if(/(?:api[_ -]?key|authorization\s*:\s*bearer|private[_ -]?key|password|parol|cvv|cvc|pin\s*code)\s*[:=]\s*\S{3,}/i.test(message.content))throw Error("AI_PRIVACY_UNVERIFIED_CONTENT");
 }
 return sanitized.map(message=>({role:["system","user","assistant"].includes(message.role)?message.role:"user",content:message.content}));
}
function consentPanel(lang,route,payload,description,opts={}) {
 const t={
  uz:{title:"AI'ga yuboriladigan matnni tekshiring",description:"Quyida yashirilgan nusxa ko'rsatilgan. Shaxsiy ma'lumotlar to'liq aniqlanishi kafolatlanmaydi. To'g'ri bo'lmasa, orqaga qayting.",consent:"Ko'rsatilgan matn tashqi Google Gemini AI xizmatiga yuborilishiga roziman.",send:"Tasdiqlash va AI'ga yuborish",back:"Orqaga qaytish"},
  ru:{title:"Проверьте текст для ИИ",description:"Показана скрытая копия. Автоматическая очистка может пропустить данные. При сомнениях вернитесь назад.",consent:"Я согласен отправить показанный текст внешнему сервису Google Gemini.",send:"Подтвердить и отправить",back:"Назад"},
  en:{title:"Review text before external AI",description:"This is the redacted copy. Automated detection can miss private information. Go back if anything sensitive remains.",consent:"I agree to send the displayed content to the external Google Gemini AI service.",send:"Confirm and send",back:"Go back"}
 }[lang]||null;
 const tt=t||{
  title:"AI'ga yuboriladigan matnni tekshiring",
  description:"Shaxsiy ma'lumotlarni tekshiring.",
  consent:"Yuborishga roziman.",send:"Yuborish",back:"Orqaga"
 };
 const hidden=Object.entries(payload).map(([name,value])=>'<input type="hidden" name="'+esc(name)+'" value="'+esc(value)+'">').join("");
 const preview=description||Object.values(payload).filter(x=>typeof x==="string").join("\n\n");
 const guard=require("./prompt-guard");
 const injectionNote=guard.injectionWarning(lang,guard.detectInjection(Object.values(payload).join("\n")));
 const token=tokenFor(payload);
 const restore=opts&&opts.restoreMap&&Object.keys(opts.restoreMap).length?opts.restoreMap:null;
 const restoreNote=restore?({uz:"Shaxsiy ma’lumotlar AI'ga [MANZIL_1], [TELEFON_1] kabi belgilar bilan yuboriladi. Asl qiymatlar AI'ga berilmaydi va tayyor hujjatga avtomatik qaytarib qo‘yiladi.",ru:"Личные данные отправляются ИИ в виде меток [MANZIL_1], [TELEFON_1]. Исходные значения ИИ не получает; они автоматически возвращаются в готовый документ.",en:"Personal data is sent to the AI as placeholders like [MANZIL_1], [TELEFON_1]. The AI never receives the originals; they are put back into the final document automatically."}[lang]||""):"";
 return '<section class="panel" style="max-width:900px;margin:20px auto;padding:24px">'+
  '<h2>'+esc(tt.title)+'</h2><p>'+esc(tt.description)+'</p>'+
  (restoreNote?'<p style="padding:12px 14px;border:1px solid #c9a86a;border-radius:10px;background:#fbf6ea">'+esc(restoreNote)+'</p>':'')+
  (injectionNote?'<p role="alert" style="padding:12px 14px;border:1px solid #c0392b;border-radius:10px;background:#fdecea;color:#7b1d12">'+esc(injectionNote)+'</p>':'')+
  '<pre style="white-space:pre-wrap;overflow-wrap:anywhere;max-height:420px;overflow:auto;padding:16px;background:#f6f7f8;color:#142536;border-radius:12px">'+esc(preview)+'</pre>'+
  '<form method="POST" action="'+esc(route)+'?lang='+esc(lang)+'">'+hidden+
  '<input type="hidden" name="aiConsentToken" value="'+esc(token)+'">'+
  (restore?'<input type="hidden" name="aiRestore" value="'+esc(sealRestore(restore,token))+'">':'')+
  '<label style="display:block;margin:18px 0"><input type="checkbox" required name="aiConsent" value="yes"> '+esc(tt.consent)+'</label>'+
  '<button class="btn btnGold" type="submit">'+esc(tt.send)+'</button> '+
  '<button type="button" class="btn" onclick="history.back()">'+esc(tt.back)+'</button></form></section>';
}
module.exports={sanitizeText,auditOutbound,tokenFor,checkToken,consentPanel,sealRestore,openRestore};
