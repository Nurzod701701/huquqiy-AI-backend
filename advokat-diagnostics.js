"use strict";
// No network calls or user files. Reproducible examples for diagnostic transparency.
const tests=[
 {name:"To‘liq ariza belgilarini aniqlash",input:"Da’vogar: Aliyev. Javobgar: Karimov. Talab: qarzni undirish. Ilova: tilxat. 2026-yil. Fuqarolik kodeksi modda 1.",expected:6},
 {name:"Bo‘sh hujjatni rad etish",input:"",expected:0},
 {name:"Yetishmaydigan rekvizitlar",input:"Qarz nizosi bo‘yicha murojaat",expected:0},
 {name:"Rus tilidagi asosiy belgilar",input:"Истец, ответчик, прошу, приложение, 2026 год, статья 12",expected:6},
 {name:"Ingliz tilidagi asosiy belgilar",input:"Claimant, respondent, request, attachment, 2026, article 12",expected:6}
];
const patterns=[
 /(?:da.vogar|da.?vogar|arizachi|истец|claimant)/i,
 /(?:javobgar|ответчик|respondent)/i,
 /(?:talab|so.rayman|просим|прошу|request|relief)/i,
 /(?:ilova|приложени|attachment|enclosed)/i,
 /20\d{2}/,
 /(?:modda|kodeks|закон|статья|article|code)/i
];
function count(text){return patterns.reduce((n,p)=>n+Number(p.test(text)),0)}
function run(){
 const results=tests.map(t=>({name:t.name,pass:count(t.input)===t.expected,matched:count(t.input),expected:t.expected}));
 return {total:results.length,passed:results.filter(x=>x.pass).length,results};
}
function capabilities(){
 return [
 {name:"Brauzer qoidalari",status:"active",details:"6 ta matn belgisi bo‘yicha dastlabki qidiruv; huquqiy tasdiq emas"},
 {name:"PDF/DOCX matn ajratish",status:"implemented",details:"Mavjud /legal-review yo‘nalishida; skanerlangan PDF matni OCRsiz o‘qilmaydi"},
 {name:"OpenRouter AI hujjat tahlili",status:process.env.OPENROUTER_API_KEY?"configured":"not_configured",details:"/legal-review natija sahifasi callAI funksiyasidan foydalanadi. Kalit borligi chaqiruv muvaffaqiyatini tasdiqlamaydi"},
 {name:"LexUZ",status:"link_only",details:"Rasmiy manba havolasi; norma/tahrirni avtomatik qiyoslash yo‘q"},
 {name:"Advice.uz",status:"link_only",details:"Huquqiy tushuntirishlarga havola; API tekshiruvi yo‘q"},
 {name:"Oliy sud",status:"link_only",details:"Sud tizimi rasmiy saytiga havola; sud ma’lumotlarini avtomatik tekshirish yo‘q"},
 {name:"Adliya vazirligi",status:"link_only",details:"Rasmiy sayt havolasi; real-time API integratsiyasi yo‘q"}
 ];
}
module.exports={run,capabilities,count};
