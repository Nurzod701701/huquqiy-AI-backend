"use strict";
/**
 * Professional criminal procedure draft composition. All user facts are supplied
 * explicitly by counsel; never infer guilt, falsification or admissibility.
 * Output is editable and requires lawyer approval, signature and valid case-stage.
 */
const CODE_URL="https://lex.uz/docs/-111460";
const DOC_TYPES=Object.freeze({
 evidence_request:{title:"DALILLARNI TALAB QILIB OLISH VA ISH MATERIALLARIGA QO‘SHISH TO‘G‘RISIDA ILTIMOSNOMA",refs:[53,87,95],
  ask:"Ko‘rsatilgan dalillar va hujjatlarni tegishli tartibda talab qilib olish, ularning ishga aloqadorligini tekshirish hamda qonuniy asoslar mavjud bo‘lsa ish materiallariga qo‘shish masalasini hal qilishingizni so‘rayman."},
 admissibility:{title:"DALILLARNI TEKSHIRISH VA MAQBULLIGIGA E’TIROZ BILDIRISH TO‘G‘RISIDA ILTIMOSNOMA",refs:[53,87,95,"95¹"],
  ask:"E’tiroz bildirilayotgan dalilni olish, kelib chiqishi va protsessual rasmiylashtirilishi haqidagi holatlarni tekshirib, JPK talablariga muvofiq uning aloqadorligi, maqbulligi va ishonchliligi masalasiga asoslantirilgan protsessual baho berishingizni so‘rayman."},
 additional_check:{title:"QO‘SHIMCHA PROTSESSUAL HARAKATLARNI O‘TKAZISH TO‘G‘RISIDA ILTIMOSNOMA",refs:[53,87,95,172],
  ask:"Ish uchun ahamiyatli holatlarni har tomonlama tekshirish uchun zarur qo‘shimcha protsessual harakatlarni o‘tkazish, maxsus bilim talab etilsa ekspertiza tayinlash masalasini qonuniy tartibda hal etishingizni so‘rayman."}
});
const normalize=(value,max=3500)=>String(value||"").replace(/\r/g,"").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,"").trim().slice(0,max);
const articleLink=n=>CODE_URL+"#:~:text="+encodeURIComponent(String(n)+"-modda.");
const REQUIRED=["authority","lawyer","caseReference","facts","evidence","relevance","action"];
function validateDraft(f){
 const missing=REQUIRED.filter(k=>!normalize(f?.[k]));
 const stage=normalize(f?.stage);
 const warnings=[];
 if(!stage)warnings.push("Ish bosqichi (dastlabki tergov/sud muhokamasi) tasdiqlanmagan.");
 if(!normalize(f?.accused))warnings.push("Himoya qilinayotgan shaxsning F.I.Sh. ko‘rsatilmagan.");
 if(!normalize(f?.charge))warnings.push("Ayblovning aniq JK modda va qismi tekshirilishi kerak.");
 if(!normalize(f?.attachments))warnings.push("Ilovalar ro‘yxati haqiqiy mavjud hujjatlar bilan aniqlashtirilmagan.");
 if(!normalize(f?.orderNumber))warnings.push("Advokat orderi rekvizitlari tekshirilishi kerak.");
 if(!normalize(f?.signature))warnings.push("Imzo qo‘yilmagan — elektron shablon hali tasdiqlanmagan.");
 if(!normalize(f?.date))warnings.push("Hujjat sanasi ko‘rsatilmagan.");
 if(normalize(f?.date) && !/^\d{4}-\d{2}-\d{2}$/.test(normalize(f.date)))warnings.push("Sana YYYY-MM-DD shaklida qayta tekshirilishi kerak.");
 return {missing,warnings};
}
function draftDocument(raw){
 const f=raw||{},kind=Object.hasOwn(DOC_TYPES,f.type)?f.type:"evidence_request",spec=DOC_TYPES[kind];
 const {missing,warnings}=validateDraft(f);
 if(missing.length)return {ok:false,missing,warnings};
 const stage=normalize(f.stage)||"aniqlashtiriladi";
 const evidence=normalize(f.evidence),facts=normalize(f.facts),basis=normalize(f.issue);
 const lines=[
  normalize(f.authority),
  "Jinoyat ishi raqami: "+normalize(f.caseReference),
  "Himoyachi: "+normalize(f.lawyer),
  "Advokat orderi: "+(normalize(f.orderNumber)||"tasdiqlanadi"),
  "Himoya qilinayotgan shaxs: "+(normalize(f.accused)||"aniqlashtiriladi"),
  "Protsessual maqomi: "+(normalize(f.proceduralRole)||"aniqlashtiriladi"),
  "Ish bosqichi: "+stage,
  "Ayblovning JK bo‘yicha kvalifikatsiyasi: "+(normalize(f.charge)||"aniqlashtiriladi"),
  "",
  spec.title,
  "",
  "I. ILTIMOSNOMA ASOSLARI",
  "Mazkur jinoyat ishida himoya tarafining pozitsiyasiga ko‘ra quyidagi holatlar tekshirilishi zarur:",
  facts,
  "Ushbu bayon himoya tarafining pozitsiyasidir; bahsli holatlar tegishli protsessual tartibda isbotlanishi yoki rad etilishi lozim.",
  "",
  "II. TEKSHIRILISHI YOKI TALAB QILIB OLINISHI LOZIM BO‘LGAN MATERIALLAR",
  evidence,
  "",
  "III. MAZMUN VA ISH UCHUN AHAMIYATI",
  normalize(f.relevance),
  ...(basis?["","IV. E’TIROZ YOKI TEKSHIRISHGA OID ASOSLAR",basis]:[]),
  "",
  "HUQUQIY ASOS",
  "O‘zbekiston Respublikasi Jinoyat-protsessual kodeksining "+spec.refs.map(n=>n+"-moddasi").join(", ")+" bilan tartibga solinadigan himoyachi huquqlari, dalillarni to‘plash va baholash qoidalari inobatga olinishi so‘raladi.",
  "JPK 95¹-moddasi faqat dalilning maqbul emasligiga oid qonuniy asoslar aniq ko‘rsatilgan va tekshirilgan holatlarda qo‘llanishi mumkin.",
  ...(kind==="additional_check"?["JPK 172-moddasiga ko‘ra maxsus bilim zarurati mavjud bo‘lsa ekspertiza tayinlash masalasi ko‘rib chiqiladi."]:[]),
  "",
  "YUQORIDAGILARGA ASOSAN SO‘RAYMAN:",
  "1. "+spec.ask,
  "2. Himoya tarafining aniq protsessual talabi: "+normalize(f.action),
  ...(normalize(f.expertQuestions)?["3. Ekspert yoki mutaxassis oldiga qo‘yilishi taklif etilayotgan savollar: "+normalize(f.expertQuestions)]:[]),
  ...(normalize(f.digitalProvenance)?["4. Elektron ma’lumotning manbasi va yaxlitligini tekshirish masalasi: "+normalize(f.digitalProvenance)]:[]),
  "5. Qabul qilingan protsessual qaror haqida himoya tarafini tegishli tartibda xabardor qilishingizni so‘rayman.",
  "",
  "ILOVALAR:",
  normalize(f.attachments)||"Taqdim etiladigan hujjatlar alohida aniqlashtiriladi.",
  "",
  "Sana: "+(normalize(f.date)||"__________"),
  "Himoyachi imzosi: "+(normalize(f.signature)||"________________"),
 ];
 const text=lines.join("\n");
 return {ok:true,title:spec.title,refs:spec.refs,text,warnings,readyForSignature:warnings.length===0,documentType:kind,sourceLinks:spec.refs.map(n=>({article:n,url:articleLink(n)}))};
}
module.exports={DOC_TYPES,draftDocument,validateDraft,normalize,REQUIRED,articleLink};
