"use strict";
// Structured, browser-local drafts. No AI, database, or network processing.
// Counsel must verify addressee, legal grounds and wording before signing.
const DOC_TYPES={
 evidence_request:{title:"Dalillarni talab qilib olish va ishga qo‘shish haqida iltimosnoma",request:"Quyida ko‘rsatilgan dalil va hujjatlarni belgilangan protsessual tartibda talab qilib olish, tekshirish hamda ish materiallariga qo‘shish masalasini ko‘rib chiqishingizni so‘rayman.",refs:[53,87]},
 admissibility:{title:"Dalilning maqbulligini tekshirish va e’tiroz bildirish haqida iltimosnoma",request:"Ko‘rsatilgan dalilni olish va rasmiylashtirish tartibi, qonuniy manbasi hamda maqbulligi yuzasidan protsessual tekshiruv o‘tkazishni, asoslar tasdiqlansa dalildan foydalanish masalasini JPK talablariga muvofiq hal etishni so‘rayman.",refs:[53,95,"95¹"]},
 additional_check:{title:"Qo‘shimcha protsessual tekshiruv harakati haqida iltimosnoma",request:"Ko‘rsatilgan holatlarni aniqlashtirish uchun qonuniy tartibda zarur qo‘shimcha protsessual tekshiruv harakatini o‘tkazishni hamda uning natijalarini ish materiallarida aks ettirishni so‘rayman.",refs:[53,87,95]}
};
const esc=s=>String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const normalize=s=>String(s||"").replace(/\r/g,"").trim().slice(0,3500);
function draftDocument(raw){
 const f=raw||{},kind=Object.hasOwn(DOC_TYPES,f.type)?f.type:"evidence_request",spec=DOC_TYPES[kind];
 const required=["authority","lawyer","caseReference","facts","evidence","relevance","action"];
 const missing=required.filter(k=>!normalize(f[k]));
 if(missing.length)return {ok:false,missing};
 const date=normalize(f.date)||"________________";
 const lines=[
  normalize(f.authority),
  "Himoyachi (advokat): "+normalize(f.lawyer),
  "Ishning shartli raqami / identifikatori: "+normalize(f.caseReference),
  "Tegishli shaxsning protsessual maqomi: "+(normalize(f.proceduralRole)||"aniqlashtirilishi kerak"),
  "",
  "ILTIMOSNOMA",
  spec.title,
  "",
  "Ishdagi aniqlashtirilishi kerak bo‘lgan holatlar:",
  normalize(f.facts),
  "",
  "Talab qilinayotgan yoki tekshirilayotgan dalil va hujjatlar:",
  normalize(f.evidence),
  "",
  "Dalilning ish uchun ahamiyati:",
  normalize(f.relevance),
  "",
  "Aniqlashtirilishi kerak bo‘lgan protsessual masala va asoslar:",
  normalize(f.issue)||"Qo‘shimcha huquqiy asoslar advokat tomonidan aniqlashtiriladi.",
  "",
  "HUQUQIY ASOSLAR (tekshirish uchun):",
  ...spec.refs.map(n=>"O‘zbekiston Respublikasi JPK "+n+"-modda — https://lex.uz/docs/-111460#:~:text="+encodeURIComponent(String(n)+"-modda.")),
  "Eslatma: tegishli ish bosqichi, JPK tahriri, modda qismi va qo‘llanishini advokat tekshiradi.",
  "",
  "SO‘RAYMAN:",
  spec.request,
  normalize(f.action),
  "",
  "Ilovalar ro‘yxati:",
  normalize(f.attachments)||"Ilovalar bo‘lsa, alohida sanab o‘tiladi.",
  "",
  "Sana: "+date,
  "Advokat imzosi: __________________",
  "",
  "LOYIHA — ADVOKAT TEKSHIRIB TASDIQLAMAGUNCHA RASMIY HUJJAT EMAS."
 ];
 return {ok:true,title:spec.title,refs:spec.refs,text:lines.join("\n")};
}
module.exports={DOC_TYPES,draftDocument,esc};
