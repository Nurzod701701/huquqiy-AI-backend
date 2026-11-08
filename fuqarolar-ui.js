"use strict";
/* QOMUS Fuqarolar: shared navy/gold visual language with Advokat PRO.
 * Presentation-only module; no changes to calculations, auth, or persistence.
 */
const text = {
  uz: {
    over:"QOMUS • FUQAROLAR", title:"Huquqiy yordam, bir joyda",
    lead:"Vaziyatingizni tushuning, kerakli hujjat va hisob-kitobni toping, rasmiy manbalar orqali keyingi qadamni aniqlang.",
    start:"AI yordamchidan boshlash", guide:"Savolnomani boshlash",
    section:"HUQUQIY XIZMATLAR", choose:"O‘zingizga kerakli xizmatni tanlang",
    note:"Hisob-kitoblar dastlabki ma’lumot uchun. Yakuniy qarordan oldin qonunchilikni va mutaxassis maslahatini tekshiring.",
    cards:[
      ["✦","AI huquqiy yordamchi","Muammoingizni oddiy tilda tushuntiring.","/ai"],
      ["☷","Huquqiy savolnoma","Muhim faktlarni ketma-ket aniqlang.","/questionnaire"],
      ["=","Kalkulyatorlar","Aliment, pensiya va boshqa hisob-kitoblar.","/calculators"],
      ["⚖","Oila huquqi","Nikoh, aliment va oilaviy munosabatlar.","/family"],
      ["▤","Mehnat huquqi","Ishga kirish, ish haqi va mehnat nizolari.","/employment"],
      ["▣","Hujjatlar markazi","Da’vo va ariza namunalaridan foydalaning.","/documents"],
      ["✓","Hujjatni tekshirish","Hujjatni dastlabki huquqiy ko‘rikdan o‘tkazing.","/legal-review"],
      ["§","Qonunchilik manbalari","Rasmiy huquqiy manbalarga o‘ting.","/sources"],
      ["⌖","Sudga murojaat","Sudlar bo‘yicha ma’lumot va murojaat yo‘li.","/court"],
      ["◇","Biznes huquqi","Tadbirkorlikka oid huquqiy masalalar.","/business"]
    ]
  },
  ru:{
    over:"QOMUS • ГРАЖДАНАМ",title:"Юридическая помощь в одном месте",
    lead:"Разберитесь в ситуации, найдите документы и калькуляторы, определите следующие шаги по официальным источникам.",
    start:"Открыть AI помощника",guide:"Начать анкету",section:"ЮРИДИЧЕСКИЕ УСЛУГИ",choose:"Выберите нужную услугу",
    note:"Расчёты предварительные. Перед важным решением проверьте закон и проконсультируйтесь со специалистом.",
    cards:[
      ["✦","AI помощник","Опишите ситуацию обычными словами.","/ai"],
      ["☷","Правовая анкета","Уточните важные факты шаг за шагом.","/questionnaire"],
      ["=","Калькуляторы","Алименты, пенсии и другие расчёты.","/calculators"],
      ["⚖","Семейное право","Брак, алименты и семейные споры.","/family"],
      ["▤","Трудовое право","Работа, зарплата и трудовые споры.","/employment"],
      ["▣","Документы","Шаблоны заявлений и исков.","/documents"],
      ["✓","Проверка документа","Предварительный анализ документа.","/legal-review"],
      ["§","Источники права","Официальные правовые источники.","/sources"],
      ["⌖","Обращение в суд","Сведения о судах и подаче заявлений.","/court"],
      ["◇","Бизнес-право","Правовые вопросы предпринимательства.","/business"]
    ]
  },
  en:{
    over:"QOMUS • CITIZENS",title:"Legal help in one place",
    lead:"Understand your situation, find documents and calculators, and plan your next steps using official sources.",
    start:"Open AI assistant",guide:"Start questionnaire",section:"LEGAL SERVICES",choose:"Choose the service you need",
    note:"Calculations are preliminary. Verify current laws and seek professional advice before important decisions.",
    cards:[
      ["✦","AI legal assistant","Explain your situation in plain language.","/ai"],
      ["☷","Legal questionnaire","Identify key facts step by step.","/questionnaire"],
      ["=","Calculators","Child support, pensions and other estimates.","/calculators"],
      ["⚖","Family law","Marriage, support and family disputes.","/family"],
      ["▤","Employment law","Work, wages and employment disputes.","/employment"],
      ["▣","Documents center","Find draft claims and applications.","/documents"],
      ["✓","Document review","Check a document before using it.","/legal-review"],
      ["§","Legal sources","Explore official legal references.","/sources"],
      ["⌖","Court guidance","Find court information and next steps.","/court"],
      ["◇","Business law","Legal questions for entrepreneurs.","/business"]
    ]
  }
};
const styles = `
/* Citizen shell: align with QOMUS home navigation and Advokat PRO navy/gold UI */
.appPage{background:radial-gradient(circle at 90% 0%,rgba(201,168,106,.10),transparent 34rem),linear-gradient(180deg,#f7f9fb,#eff3f6);min-height:75vh}
.appPage .appLayout{max-width:1460px;gap:22px}
.appPage .sidebar{background:linear-gradient(165deg,#06111f,#102f49 80%,#071725);border:1px solid rgba(201,168,106,.24);border-radius:22px;box-shadow:0 18px 46px rgba(6,17,31,.13)}
.appPage .sidebarBrand{border-bottom:1px solid rgba(230,201,142,.16)}
.appPage .sidebarBrandMark{color:#e6c98e}
.appPage .sidebarLabel{color:#e6c98e;font-size:11px;letter-spacing:.13em}
.appPage .sideLink{border-radius:12px;min-height:46px;color:#dce7ef;transition:background .18s ease,transform .18s ease}
.appPage .sideLink:hover{background:rgba(255,255,255,.10);transform:translateX(2px)}
.appPage .sideLink.active{background:linear-gradient(110deg,rgba(201,168,106,.22),rgba(201,168,106,.06));color:#f8e4b6;border-left:3px solid #e6c98e}
.appPage .appMain{min-width:0}
.appPage .appTop{border-radius:15px;background:rgba(255,255,255,.9);border:1px solid #dbe5eb;padding:14px 18px}
.appPage .appHeader{border-radius:20px;background:radial-gradient(circle at 90% 10%,rgba(230,201,142,.16),transparent 24rem),linear-gradient(120deg,#06111f,#123752);padding:34px;margin:20px 0;color:#fff;border:1px solid rgba(201,168,106,.3);box-shadow:0 18px 38px rgba(6,17,31,.12)}
.appPage .appHeader h1{font-family:Georgia,serif;color:#fff;line-height:1.17;font-size:clamp(28px,3.4vw,43px)}
.appPage .appHeader p{color:#d7e4ec;line-height:1.7}
.appPage .appHeaderSmall{color:#e6c98e;letter-spacing:.14em}
.appPage .surface,.appPage .documentCard,.appPage .serviceCard,.appPage .calculatorCard{border-radius:18px;border-color:#dce5eb;box-shadow:0 8px 24px rgba(6,17,31,.045)}
.appPage :is(a,button,input,select,textarea):focus-visible{outline:3px solid #b9903d;outline-offset:3px}
.citizenHero{position:relative;overflow:hidden;display:flex;justify-content:space-between;gap:20px;align-items:center;background:radial-gradient(circle at 90% 15%,rgba(201,168,106,.17),transparent 28rem),linear-gradient(125deg,#06111f,#103b58 76%,#071625);border:1px solid rgba(201,168,106,.34);box-shadow:0 22px 50px rgba(6,17,31,.16);padding:clamp(25px,4vw,48px);border-radius:23px;color:#fff}
.citizenHero small,.citizenEyebrow{display:block;color:#e6c98e;font-size:11px;font-weight:800;letter-spacing:.17em}
.citizenHero h1{font:normal clamp(31px,4.4vw,55px)/1.12 Georgia,serif;color:#fff;max-width:750px;margin:14px 0}
.citizenHero p{max-width:720px;color:#d8e6ee;font-size:16px;line-height:1.8}
.citizenMark{font:normal 140px Georgia,serif;color:rgba(230,201,142,.23);padding-right:20px}
.citizenActions{display:flex;gap:11px;flex-wrap:wrap;margin-top:25px}
.citizenActions a{display:inline-flex;min-height:46px;align-items:center;justify-content:center;padding:11px 18px;border-radius:12px;font-weight:750;text-decoration:none}
.citizenPrimary{background:linear-gradient(125deg,#e6cd94,#bd9850);color:#091e2e}
.citizenSecondary{border:1px solid rgba(230,201,142,.55);color:#fff;background:rgba(255,255,255,.07)}
.citizenSection{margin-top:30px}
.citizenSection h2{font:normal clamp(24px,3vw,34px)/1.22 Georgia,serif;color:#102c42;margin:8px 0 19px}
.citizenGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}
.citizenTile{display:flex;flex-direction:column;gap:9px;min-height:170px;padding:22px;border:1px solid #d9e4eb;background:#fff;border-radius:18px;text-decoration:none;color:#173247;box-shadow:0 10px 28px rgba(6,17,31,.045);transition:transform .18s,box-shadow .18s}
.citizenTile:hover{transform:translateY(-3px);box-shadow:0 18px 32px rgba(6,17,31,.1)}
.citizenTileIcon{display:grid;place-items:center;width:43px;height:43px;border-radius:12px;color:#c29b54;background:#0f3048;font-size:20px}
.citizenTile strong{font-size:17px;color:#102c42}
.citizenTile span:last-child{color:#637b8c;font-size:13px;line-height:1.55}
.citizenNotice{margin-top:20px;padding:16px 19px;background:#fff9eb;border:1px solid #e5d2a6;border-left:4px solid #c9a86a;border-radius:13px;color:#66512c;font-size:13px;line-height:1.65}
@media(max-width:1050px){.citizenGrid{grid-template-columns:repeat(2,minmax(0,1fr))}.citizenMark{display:none}}
@media(max-width:720px){.citizenGrid{grid-template-columns:1fr}.citizenHero{padding:25px 20px}.citizenHero p{font-size:14px}.citizenTile{min-height:0}.appPage .appHeader{padding:24px 19px}.appPage .sidebar{border-radius:17px}.appPage .sideLink:hover{transform:none}}
@media(prefers-reduced-motion:reduce){.citizenTile,.appPage .sideLink{transition:none}}
`;
function render(lang, page, appLayout) {
  lang=["uz","ru","en"].includes(lang)?lang:"uz";
  const t=text[lang],q="?lang="+lang;
  const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  const cards=t.cards.map(([icon,title,desc,path])=>`<a class="citizenTile" href="${path}${q}"><span class="citizenTileIcon" aria-hidden="true">${icon}</span><strong>${esc(title)}</strong><span>${esc(desc)}</span></a>`).join("");
  const html=`<section class="citizenHero"><div><small>${t.over}</small><h1>${t.title}</h1><p>${t.lead}</p><div class="citizenActions"><a class="citizenPrimary" href="/ai${q}">${t.start}</a><a class="citizenSecondary" href="/questionnaire${q}">${t.guide}</a></div></div><span class="citizenMark" aria-hidden="true">§</span></section><section class="citizenSection"><small class="citizenEyebrow">${t.section}</small><h2>${t.choose}</h2><div class="citizenGrid">${cards}</div></section><aside class="citizenNotice" role="note">${t.note}</aside>`;
  return appLayout(lang,"citizens",html,"","");
}
module.exports={styles,render};
