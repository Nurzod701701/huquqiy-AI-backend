"use strict";
// Preflight only: category-specific questions, NOT automatic legal certification.
const RULES=Object.freeze({
 debt:{sum:true,evidence:["Shartnoma yoki tilxat","To‘lov dalili","Talabnoma"],extra:"Qarz muddati, to‘lov isboti, penya sharti va da’vo muddatini alohida tekshiring."},
 property:{evidence:["Mulk hujjati","Mulk tavsifi","Egalik dalili"],extra:"Mulkning aniq identifikatori, mulkdorlik hujjati va mulkni egallash asosini tekshiring."},
 damage:{sum:true,evidence:["Zarar hisob-kitobi","Zarar dalili","Sababiy bog‘liqlik"],extra:"Zarar miqdori, sababiy bog‘liqlik va yetkazilgan zarar isbotini tekshiring."},
 divorce:{evidence:["Nikoh qaydi","Farzandlar hujjatlari"],extra:"Farzandlar, mulkiy talablar va sudlovga tegishlilikni aniqlashtiring."},
 alimony:{evidence:["Tug‘ilganlik guvohnomasi","Taraflar ma’lumotlari","Xarajat dalillari"],extra:"Aliment undirish davri, talab turi va daromad dalillarini ko‘rib chiqing."},
 labor:{evidence:["Mehnat shartnomasi","Bo‘shatish buyrug‘i"],extra:"Ishdan bo‘shatish sanasi, sudga murojaat muddati va ish haqiga oid hujjatlarni tekshiring."},
 complaint:{evidence:["Shikoyat hujjati","Muddatlar","Dalillar"],extra:"Shikoyat qilinayotgan qaror, uni olgan sana, vakolatli organ va murojaat muddatini tekshiring."},
 motion:{evidence:["Ish rekvizitlari","Asoslovchi dalillar"],extra:"Iltimosnomaning protsessual asosi, ish raqami va vakolatli sud/organ aniqligini tekshiring."},
 objection:{evidence:["Qarshi taraf hujjati","E’tiroz dalillari"],extra:"E’tiroz qilinayotgan hujjat va inkor etilayotgan har bir faktni dalillar bilan bog‘lang."},
 request:{evidence:["Adresat tashkilot","Vakolat hujjatlari","So‘raladigan ma’lumotlar"],extra:"Advokatura to‘g‘risidagi qonun bo‘yicha so‘rov rekvizitlari, order nusxasi va sir saqlash talablarini tekshiring."}
});
function reviewAdvokatDraft(type,fields,checked,attachments){
 const rule=RULES[type]||RULES.motion,f=fields||{},selected=Array.isArray(checked)?checked:[],files=Array.isArray(attachments)?attachments:[];
 const blocking=[],review=[];
 const missing=[["Client","Murojaat qiluvchi"],["Subject","Hujjat mavzusi"],["Facts","Faktlar"],["Demand","Talab yoki so‘rov"],["Address","Vakolatli sud yoki tashkilot"],["Date","Sana"]];
 if(type!=="request")missing.splice(1,0,["Opponent","Qarshi taraf"]);
 for(const [k,label] of missing)if(!String(f[k]||"").trim())blocking.push(label+" ko‘rsatilmagan");
 if(!String(f.Law||"").trim())review.push("Huquqiy asos va qo‘llanadigan normani amaldagi LexUZ tahriridan tekshiring.");
 else review.push("Kiritilgan modda va qonun tahriri avtomatik tasdiqlanmagan. LexUZda qo‘lda tekshirish kerak.");
 if(rule.sum&&!String(f.Amount||"").trim())review.push("Talab summasi va hisob-kitob ilovasini kiriting yoki asoslangan holda izohlang.");
 for(const name of rule.evidence)if(!selected.includes(name))review.push("Dalil toifasi tekshirilmagan: "+name);
 if(!files.length)review.push("Ilovalar ro‘yxati bo‘sh; hujjatga biriktiriladigan dalillarni ko‘rib chiqing.");
 review.push(rule.extra);
 review.push("Sudlovga tegishlilik, to‘lovlar, muddatlar va matnning huquqiy asoslarini advokat tekshirishi shart.");
 return {blocking,review};
}
module.exports={RULES,reviewAdvokatDraft};
