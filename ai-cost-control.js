"use strict";
// Free-only AI routing: this mode NEVER sends a request to a priced model.
// OpenRouter free model availability and usage limits remain external dependencies.
const FREE_ROUTER = "openrouter/free";
const PUBLIC_TOPICS = Object.freeze([
 {key:"mehnat",terms:/mehnat|ish haqi|ishdan bo.sh|xodim|ish beruvch|labou?r|employment|salary|труд|зарплат/i,law:"Mehnat kodeksi",url:"https://lex.uz/docs/-6257288"},
 {key:"oila",terms:/oila|nikoh|aliment|ajralish|farzand|family|divorc|marriage|семь|брак|алимент/i,law:"Oila kodeksi",url:"https://lex.uz/docs/-104720"},
 {key:"fuqarolik",terms:/shartnoma|qarz|mulk|meros|contract|debt|property|inherit|договор|долг|наслед/i,law:"Fuqarolik kodeksi",url:"https://lex.uz/docs/-111189"},
 {key:"ijara",terms:/ijara|oldi.sotdi|pudrat|lease|sale|аренд|купл/i,law:"Fuqarolik kodeksi II qism",url:"https://lex.uz/docs/-180552"},
 {key:"iqtisodiy",terms:/iqtisodiy sud|economic court|экономическ.{0,15}суд/i,law:"Iqtisodiy protsessual kodeksi",url:"https://lex.uz/docs/-3523891"}
]);
function freeOnly(env=process.env) {return (env.QOMUS_AI_COST_MODE || "free_only").toLowerCase() !== "paid_opt_in";}
function models(env=process.env) {
 if(freeOnly(env))return [FREE_ROUTER];
 const primary=String(env.AI_MODEL||FREE_ROUTER).trim();
 return [...new Set([primary, FREE_ROUTER])];
}
function publicLookup(question) {
 const q=String(question||"");
 return PUBLIC_TOPICS.filter(t=>t.terms.test(q)).slice(0,3).map(t=>({key:t.key,law:t.law,url:t.url}));
}
function offlineAnswer(question, lang="uz", reason="unavailable") {
 const sources=publicLookup(question);
 const labels={
  uz:{
   head:"QOMUS — bepul manbali yordam",intro:"AI xizmati hozir javob bera olmadi. Bu avtomatik huquqiy xulosa emas; rasmiy hujjatlarni tekshirish uchun yo‘nalish.",
   action:"Holatingiz bo‘yicha shartnoma, sanalar va mavjud dalillarni aniqlang. Aniq modda, muddat yoki hisob-kitobni rasmiy matndan tekshiring.",
   docs:"Tegishli rasmiy qonunchilik",none:"Savol bo‘yicha aniq qonun tanlanmadi. LexUZ qidiruvidan foydalaning.",status:"AI javobi yaratilmagan; manba sahifasi ko‘rsatilmoqda."
  },
  ru:{
   head:"QOMUS — бесплатные правовые источники",intro:"ИИ сейчас недоступен. Это не юридическое заключение, а ссылки для проверки первоисточников.",
   action:"Уточните даты, документы и доказательства. Статьи и сроки проверяйте по актуальному официальному тексту.",
   docs:"Официальные источники",none:"Точный закон не определён. Используйте поиск LexUZ.",status:"Ответ ИИ не создан; показаны ссылки на источники."
  },
  en:{
   head:"QOMUS — free legal sources",intro:"AI is unavailable right now. This is a source directory, not a legal conclusion.",
   action:"Collect relevant dates, documents and evidence. Verify exact provisions and deadlines in the current official text.",
   docs:"Official legal sources",none:"No specific law was identified. Use LexUZ search.",status:"No AI answer was generated; source links are provided."
  }
 };
 const t=labels[lang]||labels.uz;
 const lines=sources.length ? sources.map(x=>"- "+x.law+": "+x.url).join("\n") : t.none+"\nhttps://lex.uz";
 return [t.head,t.intro,t.action,t.docs+":\n"+lines,t.status].join("\n\n");
}
// This is a static source directory, not a generated legal answer.
// No caching of user questions, identities, documents or model responses.
module.exports={FREE_ROUTER,freeOnly,models,publicLookup,offlineAnswer};
