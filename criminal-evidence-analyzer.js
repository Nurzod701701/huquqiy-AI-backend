"use strict";
// Deterministic preflight of text extracted from documents.
// "Not mentioned" is never treated as proof of a procedural violation.
const RULES=Object.freeze([
 {id:"date",label:"Hujjat yoki protsessual harakat sanasi",pattern:"(?:\\b(?:19|20)\\d{2}[-./]\\d{1,2}[-./]\\d{1,2}\\b|\\b\\d{1,2}[-./]\\d{1,2}[-./](?:19|20)\\d{2}\\b|\\b\\d{1,2}\\s+(?:yanvar|fevral|mart|aprel|may|iyun|iyul|avgust|sentabr|sentyabr|oktabr|noyabr|dekabr)\\s+(?:19|20)\\d{2}\\b)",refs:[81,95]},
 {id:"source",label:"Dalil manbasi / kelib chiqishi",pattern:"(?:manba|kelib chiq|taqdim et|olingan|topilgan|изъят|получен|источник|source|obtained|collected)",refs:[81,95]},
 {id:"protocol",label:"Bayonnoma yoki rasmiy qayd",pattern:"(?:bayonnoma|dalolatnoma|протокол|акт|protocol|official record)",refs:[95,"95¹"]},
 {id:"authority",label:"Vakolatli organ yoki mansabdor shaxs",pattern:"(?:tergovchi|surishtiruvchi|prokuror|sud|tezkor xodim|следовател|дознавател|прокурор|суд|investigator|prosecutor|court)",refs:[95,"95¹"]},
 {id:"signature",label:"Imzo yoki tasdiqlash qaydi",pattern:"(?:imzo|imzolad|tasdiqla|подпис|утвержд|signature|signed|approved)",refs:[95]},
 {id:"witness",label:"Guvoh yoki ishtirokchilar haqida qayd",pattern:"(?:guvoh|xolis|ishtirokchi|свидетел|понят|участник|witness|participant)",refs:[81,95]},
 {id:"rights",label:"Huquqlar tushuntirilgani yoki himoyachi haqida qayd",pattern:"(?:huquq(?:lari)?\\s+tushuntir|himoyachi|advokat|tarjimon|разъяснен.{0,20}прав|защитник|адвокат|переводчик|rights explained|defen[cs]e counsel|interpreter)",refs:["95¹",95]},
 {id:"handling",label:"Dalilni olish yoki tekshirish harakati",pattern:"(?:ko.zdan kechir|olib qo.y|tintuv|ekspertiz|tekshiruv|осмотр|обыск|выемк|экспертиз|inspection|search|seizure|expert examination)",refs:[81,95]}
]);
const TYPES=Object.freeze([
 {id:"protocol",label:"Tergov harakati bayonnomasi",pattern:"(?:bayonnoma|протокол|protocol)"},
 {id:"expert",label:"Ekspertiza xulosasi",pattern:"(?:ekspertiza|ekspert xulosasi|экспертн|forensic|expert opinion)"},
 {id:"witness",label:"Guvoh ko‘rsatuvi",pattern:"(?:guvoh.{0,20}ko.rsatuv|свидетел.{0,20}показан|witness statement)"},
 {id:"digital",label:"Elektron / video dalil",pattern:"(?:videoyozuv|audioyozuv|skrinshot|elektron|видеозапис|аудиозапис|скриншот|electronic|video record|screenshot)"},
 {id:"decision",label:"Qaror yoki ajrim",pattern:"(?:qaror|ajrim|постановлен|определен|decision|ruling)"}
]);
const LAW_URL="https://lex.uz/docs/-111460";
const FLAGS=Object.freeze([
 {id:"pressure",pattern:"(?:qiynoq|zo.ravon|majburla|bosim o.tkaz|пытк|насили|принужден|coercion|torture|under duress)",label:"Matnda bosim yoki majburlashga oid ibora uchradi: holatni mustaqil tekshiring.",refs:["95¹"]},
 {id:"altered",pattern:"(?:soxtalashtir|qalbakilashtir|o.zgartirilgan|поддел|фальсифицир|tamper|fabricat)",label:"Matnda dalil o‘zgartirilishi yoki qalbakilashtirilishiga oid ibora uchradi: kontekstni tekshiring.",refs:["95¹",95]},
 {id:"denied",pattern:"(?:advokatsiz|himoyachisiz|tarjimonsiz|без защитника|без адвоката|without counsel|without interpreter)",label:"Matnda himoyachi yoki tarjimon ishtirokisiz protsessual harakat haqida ibora uchradi: bu holat qonuniyligini tekshiring.",refs:["95¹"]}
]);
function linkFor(article){
 return LAW_URL+"#:~:text="+encodeURIComponent(String(article)+"-modda.");
}
function analyzeEvidenceText(raw){
 const text=String(raw||"").slice(0,30000);
 const trimmed=text.trim();
 if(trimmed.length<40)return {ok:false,code:"TEXT_TOO_SHORT",message:"Kamida 40 belgi bo‘lgan o‘qiladigan matn zarur. Skan PDF uchun OCR yoki matnli nusxa kerak."};
 const checks=RULES.map(r=>({id:r.id,label:r.label,status:new RegExp(r.pattern,"iu").test(text)?"mentioned":"not_found",refs:r.refs}));
 const flags=FLAGS.filter(r=>new RegExp(r.pattern,"iu").test(text)).map(r=>({id:r.id,label:r.label,refs:r.refs}));
 const types=TYPES.filter(t=>new RegExp(t.pattern,"iu").test(text)).map(t=>t.label);
 return {ok:true,length:trimmed.length,detectedTypes:types,checks,flags,
  mentioned:checks.filter(c=>c.status==="mentioned").length,
  needsReview:checks.filter(c=>c.status==="not_found").length,
  sources:[81,95,"95¹"].map(number=>({number,url:linkFor(number)})),
  caveat:"'Matndan topilmadi' hujjatda band yo‘qligini yoki dalil nomaqbulligini isbotlamaydi. Matn ajratilishi va huquqiy holat advokat tomonidan tekshiriladi."};
}
module.exports={analyzeEvidenceText,RULES,TYPES,FLAGS,linkFor};
