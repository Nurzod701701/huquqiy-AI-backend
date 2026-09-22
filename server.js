require("dotenv").config();

const http = require("http");
const querystring = require("querystring");

const PORT = process.env.PORT || 3000;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const AI_MODEL = process.env.AI_MODEL || "openrouter/free";


// ======================================================
// HUQUQIY AI — ASOSIY YORDAMCHI FUNKSIYALAR
// ======================================================

function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getLang(value) {
  return ["uz", "ru", "en"].includes(value) ? value : "uz";
}

function q(lang) {
  return "?lang=" + encodeURIComponent(getLang(lang));
}

function getUrl(req) {
  return new URL(req.url, "http://localhost");
}

function sendHtml(res, html, status = 200) {
  res.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store"
  });

  res.end(html);
}

function sendJson(res, data, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });

  res.end(JSON.stringify(data));
}

function redirect(res, location) {
  res.writeHead(302, {
    Location: location
  });

  res.end();
}

async function readBody(req, maxBytes = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let body = "";
    let size = 0;

    req.on("data", chunk => {
      size += chunk.length;

      if (size > maxBytes) {
        reject(new Error("REQUEST_TOO_LARGE"));
        req.destroy();
        return;
      }

      body += chunk.toString("utf8");
    });

    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function readForm(req) {
  const raw = await readBody(req);
  return querystring.parse(raw);
}

async function readJson(req) {
  const raw = await readBody(req);

  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("INVALID_JSON");
  }
}


// ======================================================
// TILLAR — UZ / RU / EN
// ======================================================

const UI = {
  uz: {
    brand: "Huquqiy AI",
    home: "Bosh sahifa",
    assistant: "Huquqiy yordamchi",
    questionnaire: "Savol-javob",
    sources: "Qonun manbalari",
    documents: "Hujjatlar",
    court: "Sudlar",
    calculators: "Hisob-kitob",
    start: "Boshlash",
    analyze: "Huquqiy tahlil qilish",
    back: "Orqaga",
    next: "Davom etish",
    search: "Qidirish",
    open: "Ochish",
    map: "Xaritada ko‘rish",
    route: "Yo‘lni ko‘rsatish"
  },

  ru: {
    brand: "Huquqiy AI",
    home: "Главная",
    assistant: "Юридический помощник",
    questionnaire: "Вопросы",
    sources: "Правовые источники",
    documents: "Документы",
    court: "Суды",
    calculators: "Расчёты",
    start: "Начать",
    analyze: "Провести правовой анализ",
    back: "Назад",
    next: "Продолжить",
    search: "Поиск",
    open: "Открыть",
    map: "Открыть на карте",
    route: "Показать маршрут"
  },

  en: {
    brand: "Huquqiy AI",
    home: "Home",
    assistant: "Legal assistant",
    questionnaire: "Questionnaire",
    sources: "Legal sources",
    documents: "Documents",
    court: "Courts",
    calculators: "Calculators",
    start: "Start",
    analyze: "Analyze legal situation",
    back: "Back",
    next: "Continue",
    search: "Search",
    open: "Open",
    map: "Open map",
    route: "Directions"
  }
};

function tr(lang, key) {
  lang = getLang(lang);

  return (
    UI[lang][key] ||
    UI.uz[key] ||
    key
  );
}


// ======================================================
// LOCALIZED TEXT
// ======================================================

function localized(object, lang) {
  lang = getLang(lang);

  if (!object) return "";

  return (
    object[lang] ||
    object.uz ||
    object.en ||
    ""
  );
}


// ======================================================
// AI
// ======================================================

async function callAI(question, lang = "uz", context = "") {
  if (!OPENROUTER_API_KEY) {
    throw new Error(
      "OPENROUTER_API_KEY topilmadi."
    );
  }

  lang = getLang(lang);

  const languageInstruction = {
    uz: "Faqat o‘zbek tilida javob ber.",
    ru: "Отвечай только на русском языке.",
    en: "Answer only in English."
  }[lang];

  const systemPrompt = `
You are Huquqiy AI, a legal information assistant focused on Uzbekistan.

${languageInstruction}

IMPORTANT RULES:

1. Do not invent laws, article numbers, court decisions or facts.

2. If information is insufficient, say which facts are missing.

3. Separate:
   - established facts from the user,
   - legal issues,
   - possible legal options,
   - information that needs verification.

4. Do not promise a court outcome.

5. When appropriate, recommend checking the current official text
   through LexUZ or the relevant official court resource.

6. Use simple language understandable to an ordinary citizen.

7. When the question concerns family law, pay particular attention to:
   - official marriage registration;
   - consent to divorce;
   - minor children;
   - children's ages;
   - children's residence;
   - child support;
   - employment and income;
   - marital property;
   - property ownership;
   - acquisition dates;
   - prenuptial agreement;
   - reconciliation;
   - safety or domestic violence issues where relevant.

8. Do not replace missing facts with assumptions.

9. The system's central method is:

   PROBLEM
   → QUESTIONS
   → FACTS
   → LEGAL ANALYSIS
   → SOURCES
   → OPTIONS
   → NEXT STEPS
   → DOCUMENTS.

10. Clearly state when current law should be verified before reliance.

11. If the user asks for a document, first identify the legally
    important facts and then prepare a structured draft.

12. Never claim that a predicted court outcome is guaranteed.
`;

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",

      headers: {
        Authorization:
          "Bearer " + OPENROUTER_API_KEY,

        "Content-Type":
          "application/json",

        "HTTP-Referer":
          process.env.SITE_URL ||
          "https://huquqiy-ai-backend.onrender.com",

        "X-Title":
          "Huquqiy AI"
      },

      body: JSON.stringify({
        model: AI_MODEL,

        messages: [
          {
            role: "system",
            content: systemPrompt
          },

          ...(context
            ? [
                {
                  role: "system",

                  content:
                    "Collected case information:\n" +
                    context
                }
              ]
            : []),

          {
            role: "user",
            content: question
          }
        ],

        temperature: 0.2
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(
      "OpenRouter error:",
      data
    );

    throw new Error(
      data?.error?.message ||
      "AI xizmatiga ulanishda xatolik."
    );
  }

  return (
    data?.choices?.[0]?.message?.content ||
    "Javob olinmadi."
  );
}


// ======================================================
// OVOZLI FUNKSIYA
// ======================================================
//
// HOZIRCHA OLIB QO‘YILDI.
//
// Sabab:
// foydalanuvchi hozircha voice/STT uchun
// qo‘shimcha xarajat qilishni xohlamaydi.
//
// Keyinchalik:
// microphone + speech-to-text funksiyasini
// shu joydan qayta qo‘shish mumkin.
//
// ======================================================


// ======================================================
// RASMIY HUQUQIY MANBALAR
// ======================================================

const LEGAL_SOURCES = [
  {
    id: "lexuz",

    name: "LexUZ",

    url: "https://lex.uz",

    description: {
      uz:
        "O‘zbekiston Respublikasi qonunchilik ma’lumotlari milliy bazasi.",

      ru:
        "Национальная база данных законодательства Республики Узбекистан.",

      en:
        "National legislation database of the Republic of Uzbekistan."
    }
  },

  {
    id: "supreme-court",

    name:
      "O‘zbekiston Respublikasi Oliy sudi",

    url:
      "https://sud.uz",

    description: {
      uz:
        "Sud amaliyoti, Plenum qarorlari va sud tizimiga oid rasmiy ma’lumotlar.",

      ru:
        "Официальная информация о судебной системе, судебной практике и постановлениях Пленума.",

      en:
        "Official information on the judiciary, court practice and Plenum resolutions."
    }
  },

  {
    id: "mysud",

    name:
      "my.sud.uz",

    url:
      "https://my.sud.uz",

    description: {
      uz:
        "Sudlarga elektron murojaat qilish va sud xizmatlari.",

      ru:
        "Электронное обращение в суд и судебные сервисы.",

      en:
        "Electronic court applications and court services."
    }
  }
];


// ======================================================
// HUQUQIY YO‘NALISHLAR
// ======================================================

const LEGAL_AREAS = [

  {
    id: "divorce",

    icon: "⚖",

    title: {
      uz:
        "Nikohdan ajratish",

      ru:
        "Расторжение брака",

      en:
        "Divorce"
    },

    description: {
      uz:
        "Nikoh, rozilik, yarashish, farzandlar va ajrashish tartibi.",

      ru:
        "Брак, согласие, примирение, дети и порядок развода.",

      en:
        "Marriage, consent, reconciliation, children and divorce procedure."
    }
  },


  {
    id: "aliment",

    icon: "₽",

    title: {
      uz:
        "Aliment",

      ru:
        "Алименты",

      en:
        "Child support"
    },

    description: {
      uz:
        "Farzandlar, ota-onaning daromadi va aliment bilan bog‘liq huquqiy masalalar.",

      ru:
        "Дети, доход родителей и вопросы выплаты алиментов.",

      en:
        "Children, parental income and child-support issues."
    }
  },


  {
    id: "children",

    icon:
      "👨‍👩‍👧",

    title: {
      uz:
        "Farzandlar",

      ru:
        "Дети",

      en:
        "Children"
    },

    description: {
      uz:
        "Bolaning yashash joyi, ota-ona huquqlari va bolaning manfaatlari.",

      ru:
        "Место проживания ребёнка, права родителей и интересы ребёнка.",

      en:
        "Child residence, parental rights and the child's interests."
    }
  },


  {
    id: "property",

    icon: "◇",

    title: {
      uz:
        "Mol-mulk",

      ru:
        "Имущество",

      en:
        "Property"
    },

    description: {
      uz:
        "Nikoh davrida orttirilgan mol-mulk va uni bo‘lish masalalari.",

      ru:
        "Совместное имущество супругов и вопросы его раздела.",

      en:
        "Marital property and property division issues."
    }
  },


  {
    id: "inheritance",

    icon: "§",

    title: {
      uz:
        "Meros",

      ru:
        "Наследство",

      en:
        "Inheritance"
    },

    description: {
      uz:
        "Meros olish, merosxo‘rlar va meros bilan bog‘liq nizolar.",

      ru:
        "Наследование, наследники и наследственные споры.",

      en:
        "Inheritance, heirs and inheritance disputes."
    }
  },


  {
    id: "employment",

    icon: "▣",

    title: {
      uz:
        "Mehnat huquqi",

      ru:
        "Трудовое право",

      en:
        "Employment"
    },

    description: {
      uz:
        "Ishdan bo‘shatish, ish haqi va mehnat nizolari.",

      ru:
        "Увольнение, заработная плата и трудовые споры.",

      en:
        "Dismissal, salary and employment disputes."
    }
  },


  {
    id: "housing",

    icon: "⌂",

    title: {
      uz:
        "Uy-joy",

      ru:
        "Жилищные вопросы",

      en:
        "Housing"
    },

    description: {
      uz:
        "Uy-joydan foydalanish, mulk huquqi va boshqa uy-joy nizolari.",

      ru:
        "Пользование жильём, право собственности и жилищные споры.",

      en:
        "Housing use, ownership and housing disputes."
    }
  },


  {
    id: "consumer",

    icon: "✓",

    title: {
      uz:
        "Iste’molchi huquqlari",

      ru:
        "Права потребителей",

      en:
        "Consumer rights"
    },

    description: {
      uz:
        "Tovar, xizmat, kafolat, nuqson va iste’molchi talablari.",

      ru:
        "Товары, услуги, гарантии, недостатки и требования потребителей.",

      en:
        "Goods, services, warranties, defects and consumer claims."
    }
  }

];


// ======================================================
// PREMIUM GLOBAL CSS
// ======================================================

const CSS = `

:root{
  --navy:#071522;
  --navy2:#0b2946;
  --gold:#c9a86a;
  --gold2:#a77b3c;
  --paper:#f4f6f8;
  --white:#ffffff;
  --text:#263d55;
  --muted:#748395;
  --line:#dfe5ea;
  --success:#2f7d65;
  --danger:#a74444;
  --shadow:0 18px 50px rgba(6,17,31,.08);
}

*{
  box-sizing:border-box;
}

html{
  scroll-behavior:smooth;
}

body{
  margin:0;
  color:var(--text);
  background:var(--paper);
  font-family:
    Inter,
    Arial,
    Helvetica,
    sans-serif;
}

a{
  color:inherit;
  text-decoration:none;
}

button,
input,
textarea,
select{
  font:inherit;
}

button{
  cursor:pointer;
}

img{
  max-width:100%;
}

.container{
  width:min(1440px,94%);
  margin:0 auto;
}

.nav{
  position:sticky;
  top:0;
  z-index:1000;

  background:
    rgba(6,17,31,.97);

  border-bottom:
    1px solid rgba(201,168,106,.18);

  backdrop-filter:
    blur(18px);
}

.navin{
  width:min(1480px,96%);
  min-height:72px;
  margin:0 auto;

  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:24px;
}

.brand{
  display:flex;
  align-items:center;
  gap:11px;
  flex:0 0 auto;
}

.brandMark{
  width:38px;
  height:38px;

  display:grid;
  place-items:center;

  color:#06111f;

  background:
    linear-gradient(
      145deg,
      #efd69e,
      #b88a47
    );

  border-radius:9px;

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.5);

  font-family:Georgia,serif;
  font-size:19px;
}

.brandText strong{
  display:block;
  color:#fff;
  font-family:Georgia,serif;
  font-size:17px;
  font-weight:500;
}

.brandText small{
  display:block;
  margin-top:2px;
  color:#6f8296;
  font-size:7px;
  font-weight:800;
  letter-spacing:1.5px;
}

.navlinks{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:4px;
  flex:1;
}

.navlinks a{
  position:relative;
  padding:27px 10px 24px;
  color:#a9b5c1;
  font-size:9px;
  font-weight:700;
  transition:.18s ease;
}

.navlinks a:hover{
  color:#fff;
}

.navlinks a.active{
  color:#fff;
}

.navlinks a.active::after{
  content:"";
  position:absolute;
  left:10px;
  right:10px;
  bottom:0;
  height:2px;
  background:var(--gold);
}

.navRight{
  display:flex;
  align-items:center;
  gap:12px;
  flex:0 0 auto;
}

.languages{
  display:flex;
  align-items:center;
  gap:4px;
}

.languages a{
  min-width:31px;
  height:28px;

  display:grid;
  place-items:center;

  color:#718397;

  border:
    1px solid rgba(255,255,255,.08);

  border-radius:5px;

  font-size:7px;
  font-weight:900;

  transition:.18s ease;
}

.languages a:hover,
.languages a.active{
  color:#071522;
  background:var(--gold);
  border-color:var(--gold);
}

.mobileMenu{
  width:35px;
  height:35px;
  display:none;
  color:#d6dde4;
  background:transparent;
  border:1px solid rgba(255,255,255,.12);
  border-radius:7px;
}

.hero{
  position:relative;
  overflow:hidden;

  background:
    radial-gradient(
      circle at 82% 25%,
      rgba(201,168,106,.16),
      transparent 23%
    ),
    radial-gradient(
      circle at 10% 90%,
      rgba(29,76,119,.14),
      transparent 28%
    ),
    linear-gradient(
      135deg,
      #06111f 0%,
      #0a2036 58%,
      #071522 100%
    );
}

.hero::before{
  content:"";
  position:absolute;
  inset:0;

  background-image:
    linear-gradient(
      rgba(255,255,255,.018) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(255,255,255,.018) 1px,
      transparent 1px
    );

  background-size:
    46px 46px;

  pointer-events:none;
}

.heroInner{
  position:relative;
  z-index:2;

  min-height:610px;

  display:grid;

  grid-template-columns:
    1.12fr .88fr;

  align-items:center;

  gap:70px;

  padding:
    65px 0;
}

.eyebrow{
  display:inline-flex;

  align-items:center;

  gap:8px;

  color:#caa968;

  font-size:8px;

  font-weight:900;

  letter-spacing:1.8px;
}

.eyebrow::before{
  content:"";

  width:27px;
  height:1px;

  background:#caa968;
}

.hero h1{
  max-width:780px;

  margin:
    15px 0 18px;

  color:#fff;

  font-family:
    Georgia,
    "Times New Roman",
    serif;

  font-size:
    clamp(47px,5.3vw,78px);

  font-weight:400;

  line-height:.99;

  letter-spacing:-2.8px;
}

.hero h1 span{
  display:block;

  margin-top:8px;

  color:#e3c486;

  font-style:italic;
}

.heroDescription{
  max-width:680px;

  margin:0;

  color:#9dacbb;

  font-size:13px;

  line-height:1.8;
}

.heroActions{
  display:flex;

  flex-wrap:wrap;

  gap:10px;

  margin-top:29px;
}

.btn{
  min-height:44px;

  padding:
    11px 17px;

  display:inline-flex;

  align-items:center;

  justify-content:center;

  gap:8px;

  border-radius:7px;

  border:
    1px solid transparent;

  font-size:9px;

  font-weight:850;

  letter-spacing:.15px;

  transition:
    transform .18s ease,
    box-shadow .18s ease,
    border-color .18s ease;
}

.btn:hover{
  transform:
    translateY(-1px);
}

.btnPrimary{
  color:#071522;

  background:
    linear-gradient(
      145deg,
      #e5c786,
      #b88946
    );

  border-color:
    rgba(255,255,255,.15);

  box-shadow:
    0 10px 24px rgba(184,137,70,.18);
}

.btnOutline{
  color:#c9d2dc;

  background:
    rgba(255,255,255,.025);

  border-color:
    rgba(255,255,255,.14);
}

.btnOutline:hover{
  border-color:
    rgba(201,168,106,.5);
}

.btnGold{
  color:#071522;
  background:#d8b66f;
}

.heroTrust{
  display:flex;

  flex-wrap:wrap;

  gap:18px;

  margin-top:28px;

  color:#718397;

  font-size:8px;

  font-weight:700;
}

.heroTrust span{
  display:flex;

  align-items:center;

  gap:6px;
}

.heroTrust i{
  width:15px;
  height:15px;

  display:grid;

  place-items:center;

  color:#d7b66f;

  border:
    1px solid rgba(201,168,106,.32);

  border-radius:50%;

  font-size:7px;

  font-style:normal;
}

.roadmap{
  position:relative;

  padding:
    28px;

  background:
    linear-gradient(
      160deg,
      rgba(255,255,255,.97),
      rgba(245,248,250,.94)
    );

  border:
    1px solid rgba(255,255,255,.65);

  border-radius:18px;

  box-shadow:
    0 30px 70px rgba(0,0,0,.25);
}

.roadmap::before{
  content:"";

  position:absolute;

  top:0;
  left:28px;
  right:28px;

  height:2px;

  background:
    linear-gradient(
      90deg,
      transparent,
      var(--gold),
      transparent
    );
}

.roadmapHeader{
  display:flex;

  align-items:center;

  justify-content:
    space-between;

  gap:20px;

  padding-bottom:19px;

  border-bottom:
    1px solid #e9edf1;
}

.roadmapHeader small{
  display:block;

  margin-bottom:4px;

  color:#a17c40;

  font-size:8px;

  font-weight:900;

  letter-spacing:1.3px;
}

.roadmapHeader strong{
  color:var(--navy);

  font-family:
    Georgia,
    serif;

  font-size:22px;

  font-weight:500;
}

.roadmapBadge{
  padding:
    6px 9px;

  color:#31725f;

  background:#edf8f4;

  border-radius:6px;

  font-size:8px;

  font-weight:850;
}

.roadStep{
  position:relative;

  display:grid;

  grid-template-columns:
    40px 1fr;

  gap:16px;

  padding:
    19px 0;

  border-bottom:
    1px solid #edf0f3;
}

.roadStep:last-child{
  padding-bottom:0;

  border-bottom:0;
}

.roadNumber{
  width:38px;
  height:38px;

  display:grid;

  place-items:center;

  background:
    linear-gradient(
      145deg,
      #f5f7f9,
      #eef2f5
    );

  border:
    1px solid #e1e6eb;

  border-radius:50%;

  color:#46617e;

  font-family:
    Georgia,
    serif;

  font-size:11px;
}

.roadStep strong{
  display:block;

  margin-bottom:5px;

  color:#20364f;

  font-size:12px;
}

.roadStep p{
  margin:0;

  color:#7a8796;

  font-size:10px;

  line-height:1.6;
}


/* =====================================================
   QUICK START
===================================================== */

.quickSection{
  padding:
    80px 0 35px;
}

.quickBox{
  position:relative;

  overflow:hidden;

  display:grid;

  grid-template-columns:
    1fr auto;

  align-items:center;

  gap:30px;

  padding:
    32px 36px;

  background:
    radial-gradient(
      circle at 90% 0%,
      rgba(201,168,106,.15),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      #06111f,
      #0b2946
    );

  border:
    1px solid rgba(201,168,106,.18);

  border-radius:17px;

  box-shadow:
    0 22px 55px rgba(6,17,31,.15);
}

.quickBox small{
  color:#d7b66f;

  font-size:8px;

  font-weight:900;

  letter-spacing:1.3px;
}

.quickBox h2{
  margin:
    8px 0;

  color:#fff;

  font-family:
    Georgia,
    serif;

  font-size:29px;

  font-weight:500;
}

.quickBox p{
  max-width:690px;

  margin:0;

  color:#b9c5d2;

  font-size:12px;

  line-height:1.7;
}


/* =====================================================
   SERVICES
===================================================== */

.services{
  padding:
    75px 0 85px;
}

.serviceGrid{
  display:grid;

  grid-template-columns:
    repeat(4,1fr);

  gap:15px;
}

.serviceCard{
  position:relative;

  min-height:240px;

  padding:24px;

  overflow:hidden;

  background:#fff;

  border:
    1px solid var(--line);

  border-radius:14px;

  box-shadow:
    0 10px 30px rgba(6,17,31,.035);

  transition:
    transform .22s ease,
    border-color .22s ease,
    box-shadow .22s ease;
}

.serviceCard:hover{
  transform:
    translateY(-5px);

  border-color:
    rgba(201,168,106,.48);

  box-shadow:
    0 22px 48px rgba(6,17,31,.09);
}

.serviceNo{
  position:absolute;

  top:15px;
  right:18px;

  color:
    rgba(9,29,51,.06);

  font-family:
    Georgia,
    serif;

  font-size:35px;
}

.serviceIcon{
  width:46px;
  height:46px;

  display:grid;

  place-items:center;

  margin-bottom:25px;

  color:#173b60;

  background:
    linear-gradient(
      145deg,
      #fffaf0,
      #f5f7f9
    );

  border:
    1px solid #e2e7eb;

  border-radius:10px;

  font-family:
    Georgia,
    serif;

  font-size:18px;
}

.serviceCard h3{
  margin:
    0 0 10px;

  color:var(--navy);

  font-family:
    Georgia,
    serif;

  font-size:19px;

  font-weight:600;
}

.serviceCard p{
  margin:0;

  color:#788696;

  font-size:11px;

  line-height:1.7;
}

.serviceArrow{
  position:absolute;

  right:21px;
  bottom:19px;

  color:#a27b3e;

  font-size:19px;
}


/* =====================================================
   CORE SYSTEM
===================================================== */

.coreSection{
  padding:
    80px 0;

  background:#eef1f4;

  border-top:
    1px solid #e0e5e9;

  border-bottom:
    1px solid #e0e5e9;
}

.coreGrid{
  display:grid;

  grid-template-columns:
    repeat(4,1fr);

  gap:1px;

  overflow:hidden;

  background:#dce2e7;

  border:
    1px solid #dce2e7;

  border-radius:14px;
}

.coreItem{
  min-height:205px;

  padding:27px;

  background:#fff;
}

.coreItem span{
  display:block;

  margin-bottom:30px;

  color:#aa8346;

  font-family:
    Georgia,
    serif;

  font-size:21px;
}

.coreItem strong{
  display:block;

  margin-bottom:8px;

  color:var(--navy);

  font-size:12px;
}

.coreItem p{
  margin:0;

  color:#7b8998;

  font-size:11px;

  line-height:1.65;
}


/* =====================================================
   OFFICIAL SOURCES
===================================================== */

.sourcesSection{
  padding:
    85px 0;
}

.sourcesGrid{
  display:grid;

  grid-template-columns:
    repeat(3,1fr);

  gap:15px;
}

`;
// ======================================================
// PART 2/4
// PREMIUM APP / SIDEBAR / LAYOUT / HOME PAGE
// ======================================================

const CSS_APP = `

/* =====================================================
   APP SHELL
===================================================== */

.appLayout{
  width:min(1500px,96%);
  margin:0 auto;

  display:grid;

  grid-template-columns:
    245px minmax(0,1fr);

  gap:18px;

  padding:
    18px 0 45px;
}


/* =====================================================
   SIDEBAR
===================================================== */

.sidebar{
  position:sticky;

  top:90px;

  height:
    calc(100vh - 108px);

  display:flex;

  flex-direction:column;

  overflow:hidden;

  background:
    linear-gradient(
      180deg,
      #071522,
      #0a2138
    );

  border:
    1px solid rgba(201,168,106,.12);

  border-radius:15px;

  box-shadow:
    0 18px 45px rgba(6,17,31,.12);
}

.sidebarTop{
  padding:
    21px 17px 16px;

  border-bottom:
    1px solid rgba(255,255,255,.06);
}

.sidebarBrand{
  display:flex;

  align-items:center;

  gap:10px;
}

.sidebarBrandMark{
  width:36px;
  height:36px;

  display:grid;

  place-items:center;

  flex:0 0 auto;

  color:#071522;

  background:
    linear-gradient(
      145deg,
      #efd69e,
      #b88a47
    );

  border-radius:9px;

  font-family:
    Georgia,
    serif;

  font-size:17px;
}

.sidebarBrand strong{
  display:block;

  color:#fff;

  font-family:
    Georgia,
    serif;

  font-size:15px;

  font-weight:500;
}

.sidebarBrand small{
  display:block;

  margin-top:2px;

  color:#6e8297;

  font-size:7px;

  font-weight:850;

  letter-spacing:1.2px;
}

.sidebarNav{
  flex:1;

  padding:
    15px 11px;

  overflow-y:auto;
}

.sidebarLabel{
  margin:
    8px 10px 9px;

  color:#526a82;

  font-size:7px;

  font-weight:900;

  letter-spacing:1.3px;
}

.sideLink{
  display:flex;

  align-items:center;

  gap:11px;

  min-height:44px;

  margin-bottom:3px;

  padding:
    10px 12px;

  color:#9daab8;

  border-radius:9px;

  font-size:10px;

  font-weight:700;

  transition:.18s ease;
}

.sideLink:hover{
  color:#fff;

  background:
    rgba(255,255,255,.055);
}

.sideLink.active{
  color:#fff;

  background:
    linear-gradient(
      90deg,
      rgba(201,168,106,.17),
      rgba(201,168,106,.045)
    );

  box-shadow:
    inset 2px 0 var(--gold);
}

.sideIcon{
  width:26px;
  height:26px;

  display:grid;

  place-items:center;

  flex:0 0 auto;

  color:#b8985d;

  background:
    rgba(255,255,255,.04);

  border:
    1px solid rgba(255,255,255,.055);

  border-radius:7px;

  font-size:11px;
}

.sideLink.active .sideIcon{
  color:#efd59b;

  border-color:
    rgba(201,168,106,.18);

  background:
    rgba(201,168,106,.08);
}

.sidebarBottom{
  padding:
    16px 17px 20px;

  border-top:
    1px solid rgba(255,255,255,.06);
}

.sidebarSecurity{
  display:flex;

  align-items:flex-start;

  gap:9px;

  color:#708298;

  font-size:8px;

  line-height:1.55;
}

.sidebarSecurity span:first-child{
  color:#c4a15f;

  font-size:13px;
}


/* =====================================================
   APP MAIN
===================================================== */

.appMain{
  min-width:0;

  padding-bottom:40px;
}

.appTop{
  min-height:66px;

  margin-bottom:17px;

  padding:
    12px 18px;

  display:flex;

  align-items:center;

  justify-content:space-between;

  gap:20px;

  background:
    rgba(255,255,255,.9);

  border:
    1px solid var(--line);

  border-radius:13px;

  box-shadow:
    0 7px 25px rgba(6,17,31,.035);

  backdrop-filter:
    blur(14px);
}

.appBreadcrumb{
  display:flex;

  align-items:center;

  gap:8px;

  color:#8794a2;

  font-size:9px;

  font-weight:750;
}

.appBreadcrumb strong{
  color:#263d55;

  font-weight:800;
}

.appTopRight{
  display:flex;

  align-items:center;

  gap:9px;
}

.appLang{
  display:flex;

  padding:3px;

  background:#f3f5f7;

  border:
    1px solid #e0e5e9;

  border-radius:8px;
}

.appLang a{
  padding:
    6px 8px;

  color:#81909f;

  border-radius:5px;

  font-size:8px;

  font-weight:850;
}

.appLang a.active{
  color:#fff;

  background:#0a223a;
}

.appHomeButton{
  width:34px;
  height:34px;

  display:grid;

  place-items:center;

  color:#314a63;

  background:#fff;

  border:
    1px solid #e0e5e9;

  border-radius:8px;

  font-size:12px;
}


/* =====================================================
   APP HEADER
===================================================== */

.appHeader{
  position:relative;

  overflow:hidden;

  margin-bottom:20px;

  padding:
    31px 34px;

  color:#fff;

  background:
    radial-gradient(
      circle at 90% 0%,
      rgba(201,168,106,.16),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      #071522,
      #0a2946
    );

  border:
    1px solid rgba(201,168,106,.17);

  border-radius:17px;

  box-shadow:
    0 20px 55px rgba(6,17,31,.12);
}

.appHeader::after{
  content:"§";

  position:absolute;

  right:28px;
  top:50%;

  transform:
    translateY(-50%);

  color:
    rgba(201,168,106,.055);

  font-family:
    Georgia,
    serif;

  font-size:125px;
}

.appHeaderSmall{
  position:relative;

  z-index:2;

  margin-bottom:8px;

  color:#d4b570;

  font-size:8px;

  font-weight:900;

  letter-spacing:1.8px;
}

.appHeader h1{
  position:relative;

  z-index:2;

  max-width:800px;

  margin:0 0 8px;

  color:#fff;

  font-family:
    Georgia,
    serif;

  font-size:
    clamp(29px,4vw,41px);

  font-weight:500;

  letter-spacing:-.8px;
}

.appHeader p{
  position:relative;

  z-index:2;

  max-width:760px;

  margin:0;

  color:#aebdca;

  font-size:11px;

  line-height:1.7;
}


/* =====================================================
   SURFACES
===================================================== */

.surface{
  background:#fff;

  border:
    1px solid var(--line);

  border-radius:14px;

  box-shadow:
    0 12px 35px rgba(6,17,31,.045);
}

.surfacePad{
  padding:27px;
}

.surface + .surface{
  margin-top:15px;
}

.cardTitle{
  margin:
    0 0 7px;

  color:var(--navy);

  font-family:
    Georgia,
    serif;

  font-size:21px;

  font-weight:550;
}

.cardDescription{
  margin:
    0 0 22px;

  color:#7c8998;

  font-size:11px;

  line-height:1.7;
}


/* =====================================================
   FORMS
===================================================== */

.formGrid{
  display:grid;

  grid-template-columns:
    repeat(2,minmax(0,1fr));

  gap:15px;
}

.formGroup{
  display:flex;

  flex-direction:column;

  gap:7px;
}

.formGroup.full{
  grid-column:
    1 / -1;
}

.formGroup label{
  color:#2b4259;

  font-size:10px;

  font-weight:800;
}

.formGroup small{
  color:#8a97a4;

  font-size:8px;

  line-height:1.5;
}

.input,
.formGroup input,
.formGroup textarea,
.formGroup select{
  width:100%;

  min-height:48px;

  padding:
    11px 13px;

  color:#1d334a;

  background:#fbfcfd;

  border:
    1px solid #dfe5ea;

  border-radius:9px;

  outline:none;

  font-size:11px;

  transition:
    border-color .18s ease,
    box-shadow .18s ease,
    background .18s ease;
}

.formGroup textarea{
  min-height:125px;

  resize:vertical;

  line-height:1.65;
}

.input:focus,
.formGroup input:focus,
.formGroup textarea:focus,
.formGroup select:focus{
  background:#fff;

  border-color:
    rgba(166,125,66,.65);

  box-shadow:
    0 0 0 3px rgba(201,168,106,.09);
}

.formActions{
  display:flex;

  align-items:center;

  justify-content:flex-end;

  flex-wrap:wrap;

  gap:9px;

  margin-top:22px;

  padding-top:19px;

  border-top:
    1px solid #edf0f2;
}


/* =====================================================
   ALERTS
===================================================== */

.notice{
  display:flex;

  gap:11px;

  margin-bottom:15px;

  padding:
    14px 16px;

  border-radius:10px;

  font-size:10px;

  line-height:1.65;
}

.noticeInfo{
  color:#38526d;

  background:#f0f5f9;

  border:
    1px solid #dbe6ee;
}

.noticeGold{
  color:#6e572d;

  background:#fff8eb;

  border:
    1px solid #ead9b7;
}

.noticeDanger{
  color:#754343;

  background:#fff4f4;

  border:
    1px solid #edd5d5;
}

.noticeIcon{
  flex:0 0 auto;

  font-size:14px;
}


/* =====================================================
   AI INTERFACE
===================================================== */

.aiShell{
  overflow:hidden;

  background:#fff;

  border:
    1px solid var(--line);

  border-radius:16px;

  box-shadow:
    0 18px 50px rgba(6,17,31,.07);
}

.aiTopBar{
  padding:
    17px 20px;

  display:flex;

  align-items:center;

  justify-content:space-between;

  gap:20px;

  color:#fff;

  background:
    linear-gradient(
      135deg,
      #071522,
      #0a2946
    );

  border-bottom:
    1px solid rgba(201,168,106,.15);
}

.aiIdentity{
  display:flex;

  align-items:center;

  gap:11px;
}

.aiOrb{
  position:relative;

  width:39px;
  height:39px;

  display:grid;

  place-items:center;

  flex:0 0 auto;

  color:#071522;

  background:
    linear-gradient(
      145deg,
      #efd69e,
      #bd914e
    );

  border-radius:10px;

  font-family:
    Georgia,
    serif;

  font-size:17px;
}

.aiOrb::after{
  content:"";

  position:absolute;

  right:-2px;
  bottom:-2px;

  width:8px;
  height:8px;

  background:#4bd18b;

  border:
    2px solid #081c30;

  border-radius:50%;
}

.aiIdentity strong{
  display:block;

  font-family:
    Georgia,
    serif;

  font-size:16px;

  font-weight:500;
}

.aiIdentity small{
  display:block;

  margin-top:2px;

  color:#8497a9;

  font-size:7px;

  font-weight:800;

  letter-spacing:1.1px;
}

.aiStatus{
  display:flex;

  align-items:center;

  gap:6px;

  color:#d4b672;

  font-size:8px;

  font-weight:850;

  letter-spacing:.8px;
}

.aiStatus::before{
  content:"";

  width:6px;
  height:6px;

  background:#4bd18b;

  border-radius:50%;

  box-shadow:
    0 0 8px rgba(75,209,139,.5);
}

.aiBody{
  padding:27px;
}

.aiIntro{
  margin-bottom:20px;
}

.aiIntro h2{
  margin:
    0 0 7px;

  color:var(--navy);

  font-family:
    Georgia,
    serif;

  font-size:25px;

  font-weight:550;
}

.aiIntro p{
  max-width:720px;

  margin:0;

  color:#798797;

  font-size:11px;

  line-height:1.7;
}

.aiInputWrap{
  padding:5px;

  background:
    linear-gradient(
      135deg,
      rgba(201,168,106,.35),
      rgba(6,17,31,.08)
    );

  border-radius:13px;
}

.aiInputInner{
  padding:14px;

  background:#fff;

  border-radius:9px;
}

.aiInputInner textarea{
  width:100%;

  min-height:170px;

  padding:5px;

  color:#243b52;

  background:transparent;

  border:0;

  outline:0;

  resize:vertical;

  font-size:12px;

  line-height:1.75;
}

.aiInputBottom{
  margin-top:10px;

  padding-top:11px;

  display:flex;

  align-items:center;

  justify-content:space-between;

  gap:15px;

  border-top:
    1px solid #edf0f2;
}

.aiHint{
  color:#8d99a6;

  font-size:8px;
}

.aiSuggestions{
  display:flex;

  flex-wrap:wrap;

  gap:7px;

  margin-top:13px;
}

.aiChip{
  padding:
    8px 10px;

  color:#657587;

  background:#f7f9fa;

  border:
    1px solid #e2e7eb;

  border-radius:999px;

  cursor:pointer;

  font-size:9px;

  transition:.18s ease;
}

.aiChip:hover{
  color:#866332;

  background:#fffaf0;

  border-color:
    rgba(201,168,106,.45);
}


/* =====================================================
   RESULT
===================================================== */

.resultBox{
  white-space:pre-wrap;

  padding:27px;

  color:#2a4057;

  background:#fff;

  border:
    1px solid var(--line);

  border-radius:14px;

  box-shadow:
    0 15px 40px rgba(6,17,31,.055);

  font-size:11px;

  line-height:1.85;
}

.resultLabel{
  margin-bottom:16px;

  padding-bottom:11px;

  color:#9a743d;

  border-bottom:
    1px solid #edf0f2;

  font-size:8px;

  font-weight:900;

  letter-spacing:1.7px;
}


/* =====================================================
   QUESTIONNAIRE
===================================================== */

.questionnaireGrid{
  display:grid;

  gap:13px;
}

.questionCard{
  padding:19px;

  background:#fff;

  border:
    1px solid #e2e7eb;

  border-radius:11px;

  transition:.18s ease;
}

.questionCard:focus-within{
  border-color:
    rgba(201,168,106,.55);

  box-shadow:
    0 10px 28px rgba(6,17,31,.05);
}

.questionNumber{
  display:inline-flex;

  margin-bottom:8px;

  color:#a47c3f;

  font-size:8px;

  font-weight:900;

  letter-spacing:1px;
}

.questionCard label{
  display:block;

  margin-bottom:9px;

  color:#233b53;

  font-size:11px;

  font-weight:750;

  line-height:1.5;
}

.questionCard input,
.questionCard select,
.questionCard textarea{
  width:100%;

  min-height:45px;

  padding:
    10px 12px;

  color:#263d55;

  background:#f9fafb;

  border:
    1px solid #e0e5e9;

  border-radius:8px;

  outline:0;

  font-size:10px;
}

.questionCard textarea{
  min-height:105px;

  resize:vertical;
}

.questionCard input:focus,
.questionCard select:focus,
.questionCard textarea:focus{
  background:#fff;

  border-color:
    rgba(201,168,106,.65);

  box-shadow:
    0 0 0 3px rgba(201,168,106,.08);
}


/* =====================================================
   RESULT / ANALYSIS
===================================================== */

.analysisBox{
  padding:25px;

  background:#fff;

  border:
    1px solid var(--line);

  border-radius:14px;

  box-shadow:
    0 14px 35px rgba(6,17,31,.05);
}

.analysisBox h2{
  margin:
    0 0 15px;

  color:var(--navy);

  font-family:
    Georgia,
    serif;

  font-size:25px;

  font-weight:500;
}

.analysisContent{
  color:#465a70;

  font-size:12px;

  line-height:1.8;

  white-space:pre-wrap;
}


/* =====================================================
   DOCUMENT CARDS
===================================================== */

.documentGrid{
  display:grid;

  grid-template-columns:
    repeat(3,1fr);

  gap:15px;
}

.documentCard{
  position:relative;

  min-height:220px;

  padding:24px;

  background:#fff;

  border:
    1px solid var(--line);

  border-radius:14px;

  box-shadow:
    0 10px 30px rgba(6,17,31,.04);

  transition:.2s ease;
}

.documentCard:hover{
  transform:
    translateY(-4px);

  border-color:
    rgba(201,168,106,.5);

  box-shadow:
    0 20px 45px rgba(6,17,31,.08);
}

.documentCard h3{
  margin:
    0 0 10px;

  color:var(--navy);

  font-family:
    Georgia,
    serif;

  font-size:19px;
}

.documentCard p{
  margin:0;

  color:#788696;

  font-size:11px;

  line-height:1.7;
}


/* =====================================================
   COURT PAGE
===================================================== */

.courtPage{
  min-height:100vh;

  background:
    linear-gradient(
      180deg,
      #f6f8fa,
      #eef2f5
    );
}

.courtHero{
  padding:
    55px 0 35px;
}

.courtHero h1{
  margin:
    10px 0 12px;

  color:var(--navy);

  font-family:
    Georgia,
    serif;

  font-size:
    clamp(35px,4vw,50px);

  font-weight:500;
}

.courtHero p{
  max-width:720px;

  margin:0;

  color:#718093;

  font-size:12px;

  line-height:1.8;
}

.courtTools{
  display:flex;

  flex-wrap:wrap;

  align-items:center;

  justify-content:
    space-between;

  gap:15px;

  margin:
    20px 0 25px;
}

.courtSearch{
  flex:1;

  min-width:260px;

  position:relative;
}

.courtSearch input{
  width:100%;

  height:48px;

  padding:
    0 16px;

  color:#263d55;

  background:#fff;

  border:
    1px solid #dce3e8;

  border-radius:10px;

  outline:0;

  box-shadow:
    0 8px 25px rgba(6,17,31,.035);
}

.courtSearch input:focus{
  border-color:
    rgba(201,168,106,.7);

  box-shadow:
    0 0 0 3px rgba(201,168,106,.08);
}

.courtFilters{
  display:flex;

  flex-wrap:wrap;

  gap:7px;
}

.courtFilter{
  padding:
    9px 12px;

  color:#667789;

  background:#fff;

  border:
    1px solid #dde4e9;

  border-radius:8px;

  cursor:pointer;

  font-size:9px;

  font-weight:800;
}

.courtFilter:hover{
  color:var(--navy);

  border-color:
    rgba(201,168,106,.5);
}

.courtFilter.active{
  color:#fff;

  background:
    linear-gradient(
      145deg,
      #06111f,
      #0b2946
    );

  border-color:#06111f;
}

.courtGrid{
  display:grid;

  grid-template-columns:
    repeat(3,minmax(0,1fr));

  gap:16px;

  padding-bottom:60px;
}

.courtCard{
  position:relative;

  display:flex;

  flex-direction:column;

  min-height:300px;

  padding:22px;

  overflow:hidden;

  background:#fff;

  border:
    1px solid #dfe5ea;

  border-radius:14px;

  box-shadow:
    0 10px 30px rgba(6,17,31,.04);

  transition:
    transform .2s ease,
    border-color .2s ease,
    box-shadow .2s ease;
}

.courtCard:hover{
  transform:
    translateY(-4px);

  border-color:
    rgba(201,168,106,.55);

  box-shadow:
    0 20px 45px rgba(6,17,31,.09);
}

.courtCard::before{
  content:"";

  position:absolute;

  top:0;
  left:0;

  width:100%;
  height:2px;

  background:
    linear-gradient(
      90deg,
      transparent,
      var(--gold),
      transparent
    );
}

.courtCardTop{
  display:flex;

  align-items:center;

  justify-content:
    space-between;

  gap:10px;

  margin-bottom:15px;
}

.courtType{
  display:inline-flex;

  padding:
    6px 8px;

  color:#87652e;

  background:#fff7e8;

  border:
    1px solid #ead9b9;

  border-radius:6px;

  font-size:8px;

  font-weight:900;
}

.courtDistrict{
  color:#8290a0;

  font-size:8px;

  font-weight:800;
}

.courtCard h3{
  margin:
    0 0 14px;

  color:#142b43;

  font-family:
    Georgia,
    serif;

  font-size:18px;

  font-weight:600;

  line-height:1.35;
}

.courtCard p{
  margin:
    0 0 8px;

  color:#69798a;

  font-size:10px;

  line-height:1.65;
}

.courtCard p strong{
  color:#3d5268;
}

.courtCard p a{
  color:#315d8b;

  font-weight:700;
}

.courtCardActions{
  display:flex;

  flex-wrap:wrap;

  gap:8px;

  margin-top:auto;

  padding-top:17px;
}

.courtMapButton{
  min-height:38px;

  padding:
    9px 11px;

  display:inline-flex;

  align-items:center;

  justify-content:center;

  border:
    1px solid #dce3e8;

  border-radius:8px;

  color:#294966;

  background:#fff;

  cursor:pointer;

  font-size:9px;

  font-weight:800;
}

.courtMapButton:hover{
  border-color:
    rgba(201,168,106,.65);

  background:#fffaf1;
}

.courtMapButton.primary{
  color:#fff;

  background:
    linear-gradient(
      145deg,
      #06111f,
      #0b2946
    );

  border-color:#06111f;
}

.courtCounter{
  margin-bottom:15px;

  color:#778697;

  font-size:10px;

  font-weight:700;
}

.courtEmpty{
  display:none;

  padding:35px;

  text-align:center;

  color:#7a8998;

  background:#fff;

  border:
    1px dashed #d6dde3;

  border-radius:13px;
}


/* =====================================================
   RESPONSIVE
===================================================== */

@media(max-width:1100px){

  .serviceGrid,
  .coreGrid{
    grid-template-columns:
      repeat(2,1fr);
  }

  .courtGrid{
    grid-template-columns:
      repeat(2,minmax(0,1fr));
  }

  .documentGrid{
    grid-template-columns:
      repeat(2,1fr);
  }

}

@media(max-width:850px){

  .navlinks{
    display:none;
  }

  .mobileMenu{
    display:grid;

    place-items:center;
  }

  .heroInner{
    grid-template-columns:
      1fr;

    gap:40px;
  }

  .appLayout{
    grid-template-columns:
      1fr;
  }

  .sidebar{
    position:relative;

    top:0;
  }

  .footerGrid{
    grid-template-columns:
      1fr;
  }

}

@media(max-width:650px){

  .serviceGrid,
  .coreGrid,
  .documentGrid,
  .courtGrid{
    grid-template-columns:
      1fr;
  }

  .sectionHead{
    align-items:flex-start;

    flex-direction:column;
  }

  .courtTools{
    align-items:stretch;

    flex-direction:column;
  }

  .courtSearch{
    width:100%;
  }

  .heroInner{
    min-height:auto;

    padding:
      50px 0;
  }

  .hero h1{
    font-size:42px;
  }

}

`;


// ======================================================
// STATE ORGANIZATIONS
// SERVER TOMONDA TURADI
// ======================================================

const STATE_ORGANIZATIONS = [

  // ====================================================
  // OLIY SUD
  // ====================================================

  {
    id:"supreme-court",
    category:"court",
    type:"supreme",
    region:"Toshkent shahri",
    district:"Shayxontohur",

    name:
      "O‘zbekiston Respublikasi Oliy sudi",

    address:
      "Abdulla Qodiriy ko‘chasi, 1-uy, 100186",

    phone:
      "+998 71 207-73-77",

    extension:
      "01613",

    email:
      "info@supcourt.uz",

    source:
      "sud.uz"
  },


  // ====================================================
  // TOSHKENT SHAHAR SUDI
  // ====================================================

  {
    id:"tashkent-city-court",
    category:"court",
    type:"general",
    region:"Toshkent shahri",

    name:
      "Toshkent shahar sudi",

    address:
      "A. Navoiy ko‘chasi, 23A-uy",

    phone:
      "+998 55 501-11-15",

    source:
      "sud.uz"
  },

  {
    id:"tashkent-criminal-panel",
    category:"court",
    type:"criminal",
    region:"Toshkent shahri",

    name:
      "Toshkent shahar sudi — Jinoyat ishlari bo‘yicha sudlov hay’ati",

    address:
      "A. Navoiy ko‘chasi, 23A-uy",

    phone:
      "+998 55 501-11-15",

    extension:
      "02001",

    source:
      "sud.uz"
  },

  {
    id:"tashkent-civil-panel",
    category:"court",
    type:"civil",
    region:"Toshkent shahri",
    district:"Yakkasaroy",

    name:
      "Toshkent shahar sudi — Fuqarolik ishlari bo‘yicha sudlov hay’ati",

    address:
      "Shota Rustaveli ko‘chasi, 93-uy",

    phone:
      "+998 55 501-00-23",

    extension:
      "02629",

    source:
      "sud.uz"
  },

  {
    id:"tashkent-economic-panel",
    category:"court",
    type:"economic",
    region:"Toshkent shahri",
    district:"Yakkasaroy",

    name:
      "Toshkent shahar sudi — Iqtisodiy ishlar bo‘yicha sudlov hay’ati",

    address:
      "Shota Rustaveli ko‘chasi, 93-uy",

    phone:
      "+998 55 501-00-16",

    extension:
      "03124",

    source:
      "sud.uz"
  },

  {
    id:"tashkent-administrative",
    category:"court",
    type:"administrative",
    region:"Toshkent shahri",
    district:"Yunusobod",

    name:
      "Toshkent shahar ma’muriy sudi",

    address:
      "Amir Temur ko‘chasi, 118A-uy",

    phone:
      "+998 55 501-11-14",

    extension:
      "03001",

    source:
      "sud.uz"
  },

  {
    id:"tashkent-economic-interdistrict",
    category:"court",
    type:"economic",
    region:"Toshkent shahri",
    district:"Chilonzor",

    name:
      "Toshkent tumanlararo iqtisodiy sudi",

    address:
      "Cho‘pon-ota ko‘chasi, 6-uy",

    phone:
      "+998 55 501-05-04",

    extension:
      "03165",

    source:
      "sud.uz"
  },


  // ====================================================
  // MIROBOD JINOYAT SUDI
  // ====================================================

  {
    id:"mirobod-criminal-court",
    category:"court",
    type:"criminal",
    region:"Toshkent shahri",
    district:"Mirobod",

    name:
      "Jinoyat ishlari bo‘yicha Mirobod tuman sudi",

    address:
      "Fidokor ko‘chasi, 38-uy, 100015",

    phone:
      "+998 71 252-00-03",

    email:
      "j.mirobod@sud.uz",

    source:
      "sud.uz"
  },


  // ====================================================
  // TOSHKENT TUMAN JINOYAT SUDLARI
  // ====================================================

  ...[
    "Bektemir",
    "Chilonzor",
    "Mirzo Ulug‘bek",
    "Olmazor",
    "Sergeli",
    "Shayxontohur",
    "Uchtepa",
    "Yakkasaroy",
    "Yashnobod",
    "Yunusobod",
    "Yangihayot"
  ].map(district => ({

    id:
      district
        .toLowerCase()
        .replace(/[‘’']/g,"")
        .replace(/\s+/g,"-") +
      "-criminal",

    category:
      "court",

    type:
      "criminal",

    region:
      "Toshkent shahri",

    district,

    name:
      `Jinoyat ishlari bo‘yicha ${district} tuman sudi`,

    phone:
      null,

    verification:
      "Telefon raqami rasmiy manbadan yangilanmoqda"

  })),


  // ====================================================
  // SUD DEPARTAMENTI
  // ====================================================

  {
    id:
      "court-department-tashkent",

    category:
      "court_department",

    type:
      "department",

    region:
      "Toshkent shahri",

    district:
      "Yakkasaroy",

    name:
      "Oliy sud huzuridagi Sudlar faoliyatini ta’minlash departamentining Toshkent shahar hududiy bo‘limi",

    address:
      "Shota Rustaveli ko‘chasi, 62-uy",

    phone:
      "+998 55 501-00-04",

    extension:
      "03142",

    source:
      "sud.uz"
  },


  // ====================================================
  // TOSHKENT SHAHAR IIBB
  // ====================================================

  {
    id:
      "tashkent-iibb",

    category:
      "internal_affairs",

    type:
      "regional",

    region:
      "Toshkent shahri",

    district:
      "Toshkent shahri",

    name:
      "Toshkent shahar Ichki ishlar bosh boshqarmasi",

    address:
      "S. Azimov ko‘chasi, 87-uy",

    phone:
      "+998 71 206-41-65",

    appealsPhone:
      "+998 71 206-43-34",

    emergencyPhone:
      "102",

    hotline:
      "1102",

    source:
      "iibb.uz"
  },


  // ====================================================
  // ICHKI ISHLAR TEZKOR RAQAMI
  // ====================================================

  {
    id:
      "police-emergency-102",

    category:
      "internal_affairs",

    type:
      "emergency",

    region:
      "O‘zbekiston",

    district:
      "O‘zbekiston",

    name:
      "Ichki ishlar organlari tezkor raqami",

    phone:
      "102",

    emergencyPhone:
      "102",

    hotline:
      "1102",

    description:
      "Huquqbuzarlik, jinoyat yoki tezkor ichki ishlar yordami zarur bo‘lgan holatlar uchun.",

    source:
      "iibb.uz"
  },


  // ====================================================
  // TOSHKENT SHAHRI — TUMAN IIO FMB
  // ====================================================

  ...[
    "Bektemir",
    "Chilonzor",
    "Mirobod",
    "Mirzo Ulug‘bek",
    "Olmazor",
    "Sergeli",
    "Shayxontohur",
    "Uchtepa",
    "Yakkasaroy",
    "Yashnobod",
    "Yunusobod",
    "Yangihayot"
  ].map(district => ({

    id:
      district
        .toLowerCase()
        .replace(/[‘’']/g,"")
        .replace(/\s+/g,"-") +
      "-iio-fmb",

    category:
      "internal_affairs",

    type:
      "district",

    region:
      "Toshkent shahri",

    district,

    name:
      `${district} tumani IIO FMB`,

    emergencyPhone:
      "102",

    hotline:
      "1102",

    source:
      "iibb.uz"

  }))

];


// ======================================================
// STATE_ORGANIZATIONS TUGADI
// MUHIM: BU HTML <script> ICHIDA EMAS.
// SERVER SCOPE'DA TURIBDI.
// ======================================================


// ======================================================
// GOOGLE MAPS YORDAMCHI FUNKSIYALAR
// ======================================================

function googleMapsSearch(
  name = "",
  district = ""
) {

  const query = [
    name,
    district,
    "Toshkent"
  ]
    .filter(Boolean)
    .join(", ");

  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(query)
  );
}


function googleMapsDirections(
  name = "",
  district = ""
) {

  const destination = [
    name,
    district,
    "Toshkent"
  ]
    .filter(Boolean)
    .join(", ");

  return (
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent(destination)
  );
}


// ======================================================
// COURT TYPE LABEL
// ======================================================

function courtTypeLabel(
  type,
  lang = "uz"
) {

  lang =
    getLang(lang);

  const labels = {

    uz:{
      supreme:"Oliy sud",
      general:"Shahar sudi",
      criminal:"Jinoyat sudi",
      civil:"Fuqarolik sudi",
      economic:"Iqtisodiy sud",
      administrative:"Ma’muriy sud",
      department:"Sud departamenti"
    },

    ru:{
      supreme:"Верховный суд",
      general:"Городской суд",
      criminal:"Уголовный суд",
      civil:"Гражданский суд",
      economic:"Экономический суд",
      administrative:"Административный суд",
      department:"Судебный департамент"
    },

    en:{
      supreme:"Supreme Court",
      general:"City Court",
      criminal:"Criminal Court",
      civil:"Civil Court",
      economic:"Economic Court",
      administrative:"Administrative Court",
      department:"Court Department"
    }

  };

  return (
    labels[lang]?.[type] ||
    labels.uz[type] ||
    type ||
    "Sud"
  );
}


// ======================================================
// NAVIGATION
// ======================================================

function nav(
  lang = "uz",
  active = ""
) {

  lang =
    getLang(lang);

  const navLink = (
    href,
    key,
    id
  ) => {

    const className =
      active === id
        ? "active"
        : "";

    return `
      <a
        class="${className}"
        href="${href}${q(lang)}"
      >
        ${esc(tr(lang,key))}
      </a>
    `;
  };


  return `

    <header class="nav">

      <div class="navin">

        <a
          class="brand"
          href="/${q(lang)}"
        >

          <span class="brandMark">
            §
          </span>

          <span class="brandText">

            <strong>
              Huquqiy AI
            </strong>

            <small>
              LEGAL INTELLIGENCE
            </small>

          </span>

        </a>


        <nav class="navlinks">

          ${navLink(
            "/",
            "home",
            "home"
          )}

          ${navLink(
            "/assistant",
            "assistant",
            "assistant"
          )}

          ${navLink(
            "/questionnaire",
            "questionnaire",
            "questionnaire"
          )}

          ${navLink(
            "/sources",
            "sources",
            "sources"
          )}

          ${navLink(
            "/documents",
            "documents",
            "documents"
          )}

          ${navLink(
            "/court",
            "court",
            "court"
          )}

          ${navLink(
            "/calculators",
            "calculators",
            "calculators"
          )}

        </nav>


        <div class="navRight">

          <div class="languages">

            <a
              class="${
                lang === "uz"
                  ? "active"
                  : ""
              }"
              href="?lang=uz"
            >
              UZ
            </a>

            <a
              class="${
                lang === "ru"
                  ? "active"
                  : ""
              }"
              href="?lang=ru"
            >
              RU
            </a>

            <a
              class="${
                lang === "en"
                  ? "active"
                  : ""
              }"
              href="?lang=en"
            >
              EN
            </a>

          </div>

          <button
            class="mobileMenu"
            type="button"
            aria-label="Menu"
          >
            ☰
          </button>

        </div>

      </div>

    </header>

  `;
}


// ======================================================
// HTML LAYOUT
// ======================================================

function layout({
  lang = "uz",
  title = "Huquqiy AI",
  active = "",
  body = "",
  extraCss = "",
  extraJs = ""
}) {

  lang =
    getLang(lang);

  return `
<!DOCTYPE html>

<html lang="${esc(lang)}">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <meta
    name="description"
    content="Huquqiy AI — O‘zbekiston fuqarolari uchun huquqiy axborot va hujjat tayyorlash yordamchisi."
  >

  <title>
    ${esc(title)}
  </title>

  <style>
    ${CSS}
    ${CSS_APP}
    ${extraCss}
  </style>

</head>

<body>

  ${nav(lang,active)}

  ${body}

  ${extraJs}

</body>

</html>
  `;
}


// ======================================================
// HOME PAGE
// ======================================================

function homePage(
  lang = "uz"
) {

  lang =
    getLang(lang);

  const content = {

    uz:{
      eyebrow:
        "HUQUQIY YORDAMNING YANGI FORMATI",

      title:
        "Huquqiy muammoni tushuning.",

      title2:
        "Keyingi qadamni biling.",

      description:
        "Huquqiy AI vaziyatingizni tizimli savollar orqali o‘rganadi, muhim faktlarni ajratadi va keyingi huquqiy qadamlarni tushunarli shaklda ko‘rsatadi.",

      start:
        "Huquqiy tahlilni boshlash",

      questionnaire:
        "Savolnomani ochish",

      quickSmall:
        "TEZKOR BOSHLASH",

      quickTitle:
        "Muammoingizni bir necha jumlada yozing",

      quickText:
        "AI vaziyatni dastlabki tahlil qiladi. Zarur bo‘lsa, keyingi bosqichda aniqlashtiruvchi savollar beradi.",

      services:
        "Huquqiy yo‘nalishlar",

      servicesText:
        "Kerakli yo‘nalishni tanlang yoki huquqiy yordamchiga to‘g‘ridan-to‘g‘ri savol bering."
    },

    ru:{
      eyebrow:
        "НОВЫЙ ФОРМАТ ЮРИДИЧЕСКОЙ ПОМОЩИ",

      title:
        "Разберитесь в правовой проблеме.",

      title2:
        "Узнайте следующий шаг.",

      description:
        "Huquqiy AI изучает ситуацию через последовательные вопросы, выделяет важные факты и объясняет возможные дальнейшие действия.",

      start:
        "Начать правовой анализ",

      questionnaire:
        "Открыть вопросы",

      quickSmall:
        "БЫСТРЫЙ СТАРТ",

      quickTitle:
        "Опишите проблему несколькими предложениями",

      quickText:
        "AI выполнит первоначальный анализ и при необходимости предложит уточняющие вопросы.",

      services:
        "Правовые направления",

      servicesText:
        "Выберите направление или задайте вопрос юридическому помощнику."
    },

    en:{
      eyebrow:
        "A NEW FORMAT OF LEGAL ASSISTANCE",

      title:
        "Understand the legal problem.",

      title2:
        "Know the next step.",

      description:
        "Huquqiy AI examines your situation through structured questions, identifies important facts and explains possible next legal steps.",

      start:
        "Start legal analysis",

      questionnaire:
        "Open questionnaire",

      quickSmall:
        "QUICK START",

      quickTitle:
        "Describe your problem in a few sentences",

      quickText:
        "AI will perform an initial analysis and ask clarifying questions when necessary.",

      services:
        "Legal areas",

      servicesText:
        "Choose an area or ask the legal assistant directly."
    }

  }[lang];


  const serviceCards =
    LEGAL_AREAS
      .map(
        (area,index) => `

          <a
            class="serviceCard"
            href="/assistant${q(lang)}&area=${encodeURIComponent(area.id)}"
          >

            <span class="serviceNo">
              ${String(index + 1).padStart(2,"0")}
            </span>

            <div class="serviceIcon">
              ${esc(area.icon)}
            </div>

            <h3>
              ${esc(
                localized(
                  area.title,
                  lang
                )
              )}
            </h3>

            <p>
              ${esc(
                localized(
                  area.description,
                  lang
                )
              )}
            </p>

            <span class="serviceArrow">
              →
            </span>

          </a>

        `
      )
      .join("");


  return layout({

    lang,

    title:
      "Huquqiy AI",

    active:
      "home",

    body:`

      <main>

        <section class="hero">

          <div class="container heroInner">

            <div class="heroCopy">

              <span class="eyebrow">
                ${esc(content.eyebrow)}
              </span>

              <h1>

                ${esc(content.title)}

                <span>
                  ${esc(content.title2)}
                </span>

              </h1>

              <p class="heroDescription">
                ${esc(content.description)}
              </p>

              <div class="heroActions">

                <a
                  class="btn btnPrimary"
                  href="/assistant${q(lang)}"
                >
                  ${esc(content.start)}
                </a>

                <a
                  class="btn btnOutline"
                  href="/questionnaire${q(lang)}"
                >
                  ${esc(content.questionnaire)}
                </a>

              </div>

              <div class="heroTrust">

                <span>
                  <i>✓</i>
                  O‘zbekiston huquqi
                </span>

                <span>
                  <i>✓</i>
                  Rasmiy manbalar
                </span>

                <span>
                  <i>✓</i>
                  UZ / RU / EN
                </span>

              </div>

            </div>


            <div class="roadmap">

              <div class="roadmapHeader">

                <div>

                  <small>
                    HUQUQIY YO‘L XARITASI
                  </small>

                  <strong>
                    Vaziyatdan yechimgacha
                  </strong>

                </div>

                <span class="roadmapBadge">
                  AI
                </span>

              </div>


              <div class="roadStep">

                <div class="roadNumber">
                  01
                </div>

                <div>

                  <strong>
                    Muammo
                  </strong>

                  <p>
                    Foydalanuvchi huquqiy vaziyatini bayon qiladi.
                  </p>

                </div>

              </div>


              <div class="roadStep">

                <div class="roadNumber">
                  02
                </div>

                <div>

                  <strong>
                    Aniqlashtiruvchi savollar
                  </strong>

                  <p>
                    Huquqiy ahamiyatga ega faktlar aniqlanadi.
                  </p>

                </div>

              </div>


              <div class="roadStep">

                <div class="roadNumber">
                  03
                </div>

                <div>

                  <strong>
                    Huquqiy tahlil
                  </strong>

                  <p>
                    Vaziyat, huquqiy masalalar va mumkin bo‘lgan variantlar ajratiladi.
                  </p>

                </div>

              </div>


              <div class="roadStep">

                <div class="roadNumber">
                  04
                </div>

                <div>

                  <strong>
                    Keyingi qadam
                  </strong>

                  <p>
                    Murojaat, kelishuv yoki hujjat tayyorlash bo‘yicha yo‘l ko‘rsatiladi.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>


        <section class="quickSection">

          <div class="container">

            <div class="quickBox">

              <div>

                <small>
                  ${esc(content.quickSmall)}
                </small>

                <h2>
                  ${esc(content.quickTitle)}
                </h2>

                <p>
                  ${esc(content.quickText)}
                </p>

              </div>

              <a
                class="btn btnGold"
                href="/assistant${q(lang)}"
              >
                ${esc(tr(lang,"start"))}
              </a>

            </div>

          </div>

        </section>


        <section class="services">

          <div class="container">

            <div class="sectionHead">

              <div>

                <span class="eyebrow">
                  HUQUQIY XIZMATLAR
                </span>

                <h2 class="sectionTitle">
                  ${esc(content.services)}
                </h2>

              </div>

              <p class="sectionText">
                ${esc(content.servicesText)}
              </p>

            </div>

            <div class="serviceGrid">
              ${serviceCards}
            </div>

          </div>

        </section>

      </main>

    `
  });
}


// ======================================================
// ASSISTANT PAGE
// ======================================================

function assistantPage(
  lang = "uz",
  area = ""
) {

  lang =
    getLang(lang);

  const selectedArea =
    LEGAL_AREAS.find(
      item =>
        item.id === area
    );


  const intro = {

    uz:
      "Huquqiy vaziyatingizni yozing. Shaxsiy ma’lumotlarni imkon qadar kiritmaslik tavsiya etiladi.",

    ru:
      "Опишите вашу правовую ситуацию. По возможности не указывайте лишние персональные данные.",

    en:
      "Describe your legal situation. Avoid unnecessary personal information where possible."

  }[lang];


  const selectedTitle =
    selectedArea
      ? localized(
          selectedArea.title,
          lang
        )
      : "";


  return layout({

    lang,

    title:
      tr(lang,"assistant"),

    active:
      "assistant",

    body:`

      <main class="appLayout">

        <aside class="sidebar">

          <div class="sidebarTop">

            <div class="sidebarBrand">

              <span class="sidebarBrandMark">
                §
              </span>

              <div>

                <strong>
                  Huquqiy AI
                </strong>

                <small>
                  LEGAL ASSISTANT
                </small>

              </div>

            </div>

          </div>


          <div class="sidebarNav">

            <div class="sidebarLabel">
              HUQUQIY XIZMATLAR
            </div>

            <a
              class="sideLink active"
              href="/assistant${q(lang)}"
            >
              <span class="sideIcon">
                ✦
              </span>

              ${esc(tr(lang,"assistant"))}
            </a>


            <a
              class="sideLink"
              href="/questionnaire${q(lang)}"
            >
              <span class="sideIcon">
                ✓
              </span>

              ${esc(tr(lang,"questionnaire"))}
            </a>


            <a
              class="sideLink"
              href="/documents${q(lang)}"
            >
              <span class="sideIcon">
                ▤
              </span>

              ${esc(tr(lang,"documents"))}
            </a>


            <a
              class="sideLink"
              href="/court${q(lang)}"
            >
              <span class="sideIcon">
                ⚖
              </span>

              ${esc(tr(lang,"court"))}
            </a>


            <a
              class="sideLink"
              href="/calculators${q(lang)}"
            >
              <span class="sideIcon">
                ∑
              </span>

              ${esc(tr(lang,"calculators"))}
            </a>


            <a
              class="sideLink"
              href="/sources${q(lang)}"
            >
              <span class="sideIcon">
                §
              </span>

              ${esc(tr(lang,"sources"))}
            </a>

          </div>


          <div class="sidebarBottom">

            <div class="sidebarSecurity">

              <span>
                ◈
              </span>

              <span>
                ${
                  lang === "uz"
                    ? "Shaxsiy ma’lumotlarni faqat zarur bo‘lganda kiriting."
                    : lang === "ru"
                    ? "Указывайте персональные данные только при необходимости."
                    : "Enter personal information only when necessary."
                }
              </span>

            </div>

          </div>

        </aside>


        <section class="appMain">

          <div class="appTop">

            <div class="appBreadcrumb">

              <span>
                Huquqiy AI
              </span>

              <span>
                /
              </span>

              <strong>
                ${esc(tr(lang,"assistant"))}
              </strong>

            </div>


            <div class="appTopRight">

              <div class="appLang">

                <a
                  class="${lang === "uz" ? "active" : ""}"
                  href="/assistant?lang=uz${area ? "&area=" + encodeURIComponent(area) : ""}"
                >
                  UZ
                </a>

                <a
                  class="${lang === "ru" ? "active" : ""}"
                  href="/assistant?lang=ru${area ? "&area=" + encodeURIComponent(area) : ""}"
                >
                  RU
                </a>

                <a
                  class="${lang === "en" ? "active" : ""}"
                  href="/assistant?lang=en${area ? "&area=" + encodeURIComponent(area) : ""}"
                >
                  EN
                </a>

              </div>


              <a
                class="appHomeButton"
                href="/${q(lang)}"
                title="${esc(tr(lang,"home"))}"
              >
                ⌂
              </a>

            </div>

          </div>


          <div class="appHeader">

            <div class="appHeaderSmall">
              HUQUQIY AI
            </div>

            <h1>
              ${esc(tr(lang,"assistant"))}
            </h1>

            <p>
              ${esc(intro)}
            </p>

          </div>


          <div class="aiShell">

            <div class="aiTopBar">

              <div class="aiIdentity">

                <span class="aiOrb">
                  §
                </span>

                <div>

                  <strong>
                    Huquqiy AI
                  </strong>

                  <small>
                    UZBEKISTAN LEGAL ASSISTANT
                  </small>

                </div>

              </div>


              <div class="aiStatus">
                ONLINE
              </div>

            </div>


            <div class="aiBody">

              <div class="aiIntro">

                <h2>
                  ${
                    selectedTitle
                      ? esc(selectedTitle)
                      : esc(tr(lang,"assistant"))
                  }
                </h2>

                <p>
                  ${esc(intro)}
                </p>

              </div>


              <form
                method="POST"
                action="/ai-result${q(lang)}"
              >

                <input
                  type="hidden"
                  name="area"
                  value="${esc(area)}"
                >


                <div class="aiInputWrap">

                  <div class="aiInputInner">

                    <textarea
                      name="question"
                      required
                      placeholder="${
                        lang === "uz"
                          ? "Masalan: Turmush o‘rtog‘im bilan ajrashmoqchiman. Ikki nafar farzandimiz bor..."
                          : lang === "ru"
                          ? "Например: Я хочу развестись. У нас двое детей..."
                          : "For example: I want to get divorced. We have two children..."
                      }"
                    ></textarea>


                    <div class="aiInputBottom">

                      <span class="aiHint">

                        ${
                          lang === "uz"
                            ? "Ism, pasport yoki aniq manzil kabi ortiqcha ma’lumotlarni yozmang."
                            : lang === "ru"
                            ? "Не указывайте лишние данные, такие как паспорт или точный адрес."
                            : "Avoid unnecessary details such as passport information or exact address."
                        }

                      </span>


                      <button
                        class="btn btnPrimary"
                        type="submit"
                      >
                        ✦ ${esc(tr(lang,"analyze"))}
                      </button>

                    </div>

                  </div>

                </div>

              </form>


              <div class="aiSuggestions">

                ${
                  LEGAL_AREAS
                    .slice(0,6)
                    .map(
                      item => `

                        <a
                          class="aiChip"
                          href="/assistant${q(lang)}&area=${encodeURIComponent(item.id)}"
                        >
                          ${esc(
                            localized(
                              item.title,
                              lang
                            )
                          )}
                        </a>

                      `
                    )
                    .join("")
                }

              </div>

            </div>

          </div>

        </section>

      </main>

    `
  });
}
// ======================================================
// AI RESULT
// ======================================================

async function aiResultPage(
  lang,
  form
) {

  lang = getLang(lang);


  const t = {

    uz: {
      title:
        "Huquqiy tahlil natijasi",

      description:
        "Siz taqdim etgan ma’lumotlar asosidagi dastlabki huquqiy tahlil.",

      label:
        "HUQUQIY AI • TAHLIL NATIJASI",

      newQuestion:
        "Yangi savol",

      questionnaire:
        "Batafsil savolnoma",

      empty:
        "Huquqiy vaziyat kiritilmagan."
    },


    ru: {
      title:
        "Результат правового анализа",

      description:
        "Первичный правовой анализ на основе предоставленной информации.",

      label:
        "HUQUQIY AI • РЕЗУЛЬТАТ АНАЛИЗА",

      newQuestion:
        "Новый вопрос",

      questionnaire:
        "Подробный опрос",

      empty:
        "Правовая ситуация не указана."
    },


    en: {
      title:
        "Legal analysis result",

      description:
        "Initial legal analysis based on the information provided.",

      label:
        "HUQUQIY AI • ANALYSIS RESULT",

      newQuestion:
        "New question",

      questionnaire:
        "Detailed questionnaire",

      empty:
        "No legal situation was provided."
    }

  }[lang];


  const question =
    String(
      form.question || ""
    ).trim();


  if (!question) {

    return appLayout(

      lang,

      "ai",

      `
        <div class="notice noticeDanger">

          <span class="noticeIcon">
            !
          </span>

          <span>
            ${t.empty}
          </span>

        </div>

        <a
          class="btn btnPrimary"
          href="/ai${q(lang)}"
        >
          ← ${t.newQuestion}
        </a>
      `,

      t.title,

      t.description

    );

  }


  let answer = "";


  try {

    answer =
      await callAI(
        question,
        lang
      );

  } catch (error) {

    console.error(
      "AI RESULT ERROR:",
      error
    );


    answer =
      lang === "uz"
        ? "AI xizmatiga ulanishda xatolik yuz berdi. OPENROUTER_API_KEY va server sozlamalarini tekshiring."
        : lang === "ru"
        ? "Произошла ошибка подключения к AI. Проверьте OPENROUTER_API_KEY и настройки сервера."
        : "An error occurred while connecting to the AI service. Check OPENROUTER_API_KEY and the server configuration.";

  }


  return appLayout(

    lang,

    "ai",

    `

      <div class="resultBox">

        <div class="resultLabel">
          ${t.label}
        </div>

        ${esc(answer)}

      </div>


      <div class="formActions">

        <a
          class="btn btnOutline"
          href="/ai${q(lang)}"
        >
          ← ${t.newQuestion}
        </a>


        <a
          class="btn btnPrimary"
          href="/questionnaire${q(lang)}"
        >
          ✓ ${t.questionnaire}
        </a>

      </div>

    `,

    t.title,

    t.description

  );

}


// ======================================================
// QUESTION FIELD RENDERER
// ======================================================

function renderQuestionField(
  question,
  lang,
  index
) {

  lang = getLang(lang);

  const label =
    localized(
      question.label,
      lang
    );


  let field = "";


  if (question.type === "select") {

    const options =
      question.options?.[lang] ||
      question.options?.uz ||
      [];


    field = `

      <select
        name="${esc(question.id)}"
      >

        ${options
          .map(
            option => `

              <option
                value="${esc(option[0])}"
              >
                ${esc(option[1])}
              </option>

            `
          )
          .join("")}

      </select>

    `;

  } else if (
    question.type === "textarea"
  ) {

    field = `

      <textarea
        name="${esc(question.id)}"
        placeholder="${esc(label)}"
      ></textarea>

    `;

  } else {

    field = `

      <input
        type="${esc(question.type || "text")}"
        name="${esc(question.id)}"
        placeholder="${esc(label)}"
      >

    `;

  }


  return `

    <div class="questionCard">

      <span class="questionNumber">
        ${String(index + 1).padStart(2, "0")}
      </span>

      <label>
        ${esc(label)}
      </label>

      ${field}

    </div>

  `;

}


// ======================================================
// QUESTIONNAIRE PAGE
// ======================================================

function questionnairePage(lang) {

  lang = getLang(lang);


  const t = {

    uz: {
      title:
        "Oilaviy huquq savolnomasi",

      description:
        "Nikohdan ajratish, farzandlar, aliment va mol-mulk masalalarini tizimli aniqlash uchun savollarga javob bering.",

      info:
        "Savolnoma sizning vaziyatingizdagi huquqiy ahamiyatga ega faktlarni tartibga solishga yordam beradi.",

      privacy:
        "Keraksiz pasport ma’lumotlari, PINFL, bank karta raqamlari yoki boshqa maxfiy ma’lumotlarni kiritmang.",

      submit:
        "Javoblarni tahlil qilish"
    },


    ru: {
      title:
        "Опрос по семейному праву",

      description:
        "Ответьте на вопросы для системного определения обстоятельств развода, детей, алиментов и имущества.",

      info:
        "Опрос помогает структурировать юридически значимые обстоятельства вашей ситуации.",

      privacy:
        "Не указывайте лишние паспортные данные, ПИНФЛ, номера банковских карт и другие конфиденциальные сведения.",

      submit:
        "Проанализировать ответы"
    },


    en: {
      title:
        "Family law questionnaire",

      description:
        "Answer the questions to structure issues concerning divorce, children, child support and property.",

      info:
        "The questionnaire helps organize legally significant facts in your situation.",

      privacy:
        "Do not provide unnecessary passport details, personal identification numbers, bank-card numbers or other confidential information.",

      submit:
        "Analyze answers"
    }

  }[lang];


  const questions =
    FAMILY_QUESTIONS
      .map(
        (question, index) =>
          renderQuestionField(
            question,
            lang,
            index
          )
      )
      .join("");


  return appLayout(

    lang,

    "questionnaire",

    `

      <div class="notice noticeInfo">

        <span class="noticeIcon">
          ✓
        </span>

        <span>
          ${t.info}
        </span>

      </div>


      <div class="notice noticeGold">

        <span class="noticeIcon">
          ◈
        </span>

        <span>
          ${t.privacy}
        </span>

      </div>


      <form
        method="POST"
        action="/questionnaire-result${q(lang)}"
      >

        <div class="questionnaireGrid">

          ${questions}

        </div>


        <div class="formActions">

          <button
            type="submit"
            class="btn btnGold"
          >
            ✦ ${t.submit}
          </button>

        </div>

      </form>

    `,

    t.title,

    t.description

  );

}


// ======================================================
// QUESTIONNAIRE RESULT
// ======================================================

async function questionnaireResultPage(
  lang,
  form
) {

  lang = getLang(lang);


  const t = {

    uz: {
      title:
        "Oilaviy vaziyat tahlili",

      description:
        "Savolnoma javoblari asosidagi dastlabki huquqiy yo‘naltirish.",

      label:
        "HUQUQIY AI • OILAVIY HUQUQ TAHLILI",

      back:
        "Savolnomaga qaytish",

      document:
        "Hujjatlar bo‘limi",

      prompt:
        `Quyidagi oilaviy-huquqiy vaziyatni tahlil qiling.

Tahlilni quyidagi tartibda bering:

1. Aniqlangan faktlar.
2. Yetishmayotgan muhim ma’lumotlar.
3. Asosiy huquqiy masalalar.
4. Farzandlar bo‘yicha masalalar.
5. Aliment bo‘yicha masalalar.
6. Mol-mulk bo‘yicha masalalar.
7. Yarashish yoki kelishuv imkoniyati.
8. Rasmiy manbalardan tekshirilishi kerak bo‘lgan masalalar.
9. Keyingi amaliy qadamlar.
10. Kerak bo‘lishi mumkin bo‘lgan hujjatlar.

Sud natijasini kafolatlamang va mavjud bo‘lmagan qonun moddalarini uydirmang.`
    },


    ru: {
      title:
        "Анализ семейной ситуации",

      description:
        "Первичная правовая навигация на основе ответов анкеты.",

      label:
        "HUQUQIY AI • АНАЛИЗ СЕМЕЙНОГО ПРАВА",

      back:
        "Вернуться к анкете",

      document:
        "Раздел документов",

      prompt:
        `Проанализируйте следующую семейно-правовую ситуацию.

Структура ответа:

1. Установленные факты.
2. Недостающая важная информация.
3. Основные правовые вопросы.
4. Вопросы детей.
5. Вопросы алиментов.
6. Вопросы имущества.
7. Возможность примирения или соглашения.
8. Что необходимо проверить по официальным источникам.
9. Практические дальнейшие действия.
10. Возможные необходимые документы.

Не гарантируйте результат судебного дела и не придумывайте нормы законодательства.`
    },


    en: {
      title:
        "Family situation analysis",

      description:
        "Initial legal guidance based on the questionnaire answers.",

      label:
        "HUQUQIY AI • FAMILY LAW ANALYSIS",

      back:
        "Return to questionnaire",

      document:
        "Documents section",

      prompt:
        `Analyze the following family-law situation.

Structure the answer as follows:

1. Established facts.
2. Important missing information.
3. Main legal issues.
4. Issues concerning children.
5. Child-support issues.
6. Property issues.
7. Possibility of reconciliation or settlement.
8. Matters that should be verified through official sources.
9. Practical next steps.
10. Documents that may be required.

Do not guarantee a court outcome and do not invent legislation.`
    }

  }[lang];


  const context =
    buildFamilyContext(form);


  let answer = "";


  try {

    answer =
      await callAI(
        t.prompt,
        lang,
        context
      );

  } catch (error) {

    console.error(
      "QUESTIONNAIRE AI ERROR:",
      error
    );


    answer =
      lang === "uz"
        ? "Tahlilni yaratishda xatolik yuz berdi. OPENROUTER_API_KEY va server sozlamalarini tekshiring."
        : lang === "ru"
        ? "Не удалось выполнить анализ. Проверьте OPENROUTER_API_KEY и настройки сервера."
        : "The analysis could not be generated. Check OPENROUTER_API_KEY and server configuration.";

  }


  return appLayout(

    lang,

    "questionnaire",

    `

      <div class="resultBox">

        <div class="resultLabel">
          ${t.label}
        </div>

        ${esc(answer)}

      </div>


      <div class="formActions">

        <a
          class="btn btnOutline"
          href="/questionnaire${q(lang)}"
        >
          ← ${t.back}
        </a>


        <a
          class="btn btnPrimary"
          href="/documents${q(lang)}"
        >
          ▤ ${t.document}
        </a>

      </div>

    `,

    t.title,

    t.description

  );

}


// ======================================================
// SOURCES PAGE
// ======================================================

function sourcesPage(lang) {

  lang = getLang(lang);


  const t = {

    uz: {
      title:
        "Rasmiy huquqiy manbalar",

      description:
        "Huquqiy ma’lumotlarni tekshirish uchun rasmiy va ishonchli manbalardan foydalaning.",

      warning:
        "Qonunchilik o‘zgarishi mumkin. Muhim qaror qabul qilishdan oldin amaldagi tahrirni rasmiy manbadan tekshiring.",

      open:
        "Rasmiy saytni ochish"
    },


    ru: {
      title:
        "Официальные правовые источники",

      description:
        "Используйте официальные и надёжные источники для проверки правовой информации.",

      warning:
        "Законодательство может изменяться. Перед принятием важного решения проверьте действующую редакцию в официальном источнике.",

      open:
        "Открыть официальный сайт"
    },


    en: {
      title:
        "Official legal sources",

      description:
        "Use official and reliable sources to verify legal information.",

      warning:
        "Legislation may change. Verify the current version through an official source before making an important decision.",

      open:
        "Open official website"
    }

  }[lang];


  const cards =
    LEGAL_SOURCES
      .map(
        source => `

          <article class="documentCard">

            <span class="eyebrow">
              RASMIY MANBA
            </span>

            <h3>
              ${esc(source.name)}
            </h3>

            <p>
              ${esc(
                localized(
                  source.description,
                  lang
                )
              )}
            </p>


            <div class="formActions">

              <a
                class="btn btnPrimary"
                href="${esc(source.url)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                ${t.open} ↗
              </a>

            </div>

          </article>

        `
      )
      .join("");


  return appLayout(

    lang,

    "sources",

    `

      <div class="notice noticeGold">

        <span class="noticeIcon">
          !
        </span>

        <span>
          ${t.warning}
        </span>

      </div>


      <div class="documentGrid">

        ${cards}

      </div>

    `,

    t.title,

    t.description

  );

}


// ======================================================
// DOCUMENTS PAGE
// ======================================================

function documentsPage(lang) {

  lang = getLang(lang);


  const t = {

    uz: {
      title:
        "Huquqiy hujjatlar",

      description:
        "Vaziyatingizga mos hujjat turini tanlang va kerakli ma’lumotlarni kiriting.",

      start:
        "Hujjat tayyorlash",

      note:
        "AI tayyorlagan hujjat loyihasini topshirishdan oldin faktlar, rekvizitlar va amaldagi qonunchilik bo‘yicha tekshirish tavsiya etiladi."
    },


    ru: {
      title:
        "Юридические документы",

      description:
        "Выберите тип документа и укажите необходимые сведения.",

      start:
        "Подготовить документ",

      note:
        "Перед подачей документа, подготовленного AI, рекомендуется проверить факты, реквизиты и действующее законодательство."
    },


    en: {
      title:
        "Legal documents",

      description:
        "Choose a document type and provide the necessary information.",

      start:
        "Prepare document",

      note:
        "Before filing an AI-generated document, verify the facts, details and current law."
    }

  }[lang];


  const cards =
    DOCUMENT_TYPES
      .map(
        item => `

          <article class="documentCard">

            <span class="eyebrow">
              HUJJAT
            </span>

            <h3>
              ${esc(
                localized(
                  item.title,
                  lang
                )
              )}
            </h3>

            <p>
              ${esc(
                localized(
                  item.description,
                  lang
                )
              )}
            </p>


            <div class="formActions">

              <a
                class="btn btnPrimary"
                href="/claim${q(lang)}&type=${encodeURIComponent(item.id)}"
              >
                ${t.start} →
              </a>

            </div>

          </article>

        `
      )
      .join("");


  return appLayout(

    lang,

    "documents",

    `

      <div class="notice noticeInfo">

        <span class="noticeIcon">
          ✓
        </span>

        <span>
          ${t.note}
        </span>

      </div>


      <div class="documentGrid">

        ${cards}

      </div>

    `,

    t.title,

    t.description

  );

}


// ======================================================
// CLAIM / DOCUMENT FORM
// ======================================================

function claimPage(
  lang,
  type = ""
) {

  lang = getLang(lang);


  const documentType =
    DOCUMENT_TYPES.find(
      item =>
        item.id === type
    ) ||
    DOCUMENT_TYPES[0];


  const t = {

    uz: {
      title:
        "Hujjat ma’lumotlari",

      description:
        "Hujjat loyihasini tayyorlash uchun asosiy ma’lumotlarni kiriting.",

      type:
        "Hujjat turi",

      court:
        "Sud yoki tashkilot nomi",

      claimant:
        "Arizachi / da’vogar",

      defendant:
        "Javobgar / ikkinchi tomon",

      address:
        "Manzil va aloqa ma’lumotlari",

      facts:
        "Vaziyat va muhim faktlar",

      request:
        "Talab yoki so‘rov",

      evidence:
        "Dalillar va ilovalar",

      submit:
        "Hujjat loyihasini yaratish",

      privacy:
        "Hujjat yaratish uchun zarur bo‘lmagan maxfiy ma’lumotlarni kiritmang."
    },


    ru: {
      title:
        "Данные документа",

      description:
        "Введите основные сведения для подготовки проекта документа.",

      type:
        "Тип документа",

      court:
        "Наименование суда или организации",

      claimant:
        "Заявитель / истец",

      defendant:
        "Ответчик / другая сторона",

      address:
        "Адрес и контактные данные",

      facts:
        "Обстоятельства и важные факты",

      request:
        "Требование или просьба",

      evidence:
        "Доказательства и приложения",

      submit:
        "Создать проект документа",

      privacy:
        "Не указывайте конфиденциальные данные, которые не нужны для подготовки документа."
    },


    en: {
      title:
        "Document information",

      description:
        "Provide the main information needed to prepare the document draft.",

      type:
        "Document type",

      court:
        "Court or organization",

      claimant:
        "Applicant / claimant",

      defendant:
        "Defendant / other party",

      address:
        "Address and contact information",

      facts:
        "Situation and important facts",

      request:
        "Request or relief sought",

      evidence:
        "Evidence and attachments",

      submit:
        "Generate document draft",

      privacy:
        "Do not provide confidential information that is unnecessary for preparing the document."
    }

  }[lang];


  return appLayout(

    lang,

    "documents",

    `

      <div class="notice noticeGold">

        <span class="noticeIcon">
          ◈
        </span>

        <span>
          ${t.privacy}
        </span>

      </div>


      <div class="surface surfacePad">

        <h2 class="cardTitle">
          ${esc(
            localized(
              documentType.title,
              lang
            )
          )}
        </h2>

        <p class="cardDescription">
          ${esc(
            localized(
              documentType.description,
              lang
            )
          )}
        </p>


        <form
          method="POST"
          action="/claim-result${q(lang)}"
        >

          <input
            type="hidden"
            name="type"
            value="${esc(documentType.id)}"
          >


          <div class="formGrid">


            <div class="formGroup full">

              <label>
                ${t.type}
              </label>

              <input
                value="${esc(
                  localized(
                    documentType.title,
                    lang
                  )
                )}"
                readonly
              >

            </div>


            <div class="formGroup full">

              <label>
                ${t.court}
              </label>

              <input
                name="court"
                type="text"
              >

            </div>


            <div class="formGroup">

              <label>
                ${t.claimant}
              </label>

              <input
                name="claimant"
                type="text"
              >

            </div>


            <div class="formGroup">

              <label>
                ${t.defendant}
              </label>

              <input
                name="defendant"
                type="text"
              >

            </div>


            <div class="formGroup full">

              <label>
                ${t.address}
              </label>

              <textarea
                name="address"
              ></textarea>

            </div>


            <div class="formGroup full">

              <label>
                ${t.facts}
              </label>

              <textarea
                name="facts"
                required
              ></textarea>

            </div>


            <div class="formGroup full">

              <label>
                ${t.request}
              </label>

              <textarea
                name="request"
              ></textarea>

            </div>


            <div class="formGroup full">

              <label>
                ${t.evidence}
              </label>

              <textarea
                name="evidence"
              ></textarea>

            </div>


          </div>


          <div class="formActions">

            <button
              type="submit"
              class="btn btnGold"
            >
              ✦ ${t.submit}
            </button>

          </div>

        </form>

      </div>

    `,

    t.title,

    t.description

  );

}


// ======================================================
// CLAIM RESULT PAGE
// ======================================================

async function claimResultPage(
  lang,
  form
) {

  lang = getLang(lang);


  const documentType =
    DOCUMENT_TYPES.find(
      item =>
        item.id ===
        String(form.type || "")
    ) ||
    DOCUMENT_TYPES[0];


  const t = {

    uz: {
      title:
        "Hujjat loyihasi",

      description:
        "Kiritilgan ma’lumotlar asosida shakllantirilgan dastlabki hujjat loyihasi.",

      label:
        "HUQUQIY AI • HUJJAT LOYIHASI",

      edit:
        "Ma’lumotlarni o‘zgartirish",

      documents:
        "Hujjatlar bo‘limi",

      instruction:
        `Kiritilgan ma’lumotlar asosida professional huquqiy hujjat loyihasini tayyorlang.

Muhim talablar:
- mavjud bo‘lmagan faktlarni uydirmang;
- mavjud bo‘lmagan qonun moddalarini uydirmang;
- yetishmayotgan rekvizitlar uchun [TO‘LDIRILADI] deb yozing;
- rasmiy va professional uslubdan foydalaning;
- hujjatning tegishli tuzilishini saqlang;
- ilovalar bo‘limini kiriting;
- zarur hollarda topshirishdan oldin amaldagi qonunchilikni tekshirish kerakligini ko‘rsating.`
    },


    ru: {
      title:
        "Проект документа",

      description:
        "Предварительный проект документа на основе введённых данных.",

      label:
        "HUQUQIY AI • ПРОЕКТ ДОКУМЕНТА",

      edit:
        "Изменить данные",

      documents:
        "Раздел документов",

      instruction:
        `Подготовьте профессиональный проект юридического документа на основе предоставленных данных.

Важно:
- не придумывайте отсутствующие факты;
- не придумывайте нормы законодательства;
- для недостающих реквизитов используйте [ЗАПОЛНИТЬ];
- используйте официальный профессиональный стиль;
- соблюдайте соответствующую структуру документа;
- добавьте раздел приложений;
- при необходимости укажите, что перед подачей необходимо проверить действующее законодательство.`
    },


    en: {
      title:
        "Document draft",

      description:
        "A preliminary document draft generated from the information provided.",

      label:
        "HUQUQIY AI • DOCUMENT DRAFT",

      edit:
        "Edit information",

      documents:
        "Documents section",

      instruction:
        `Prepare a professional legal-document draft using the information provided.

Important:
- do not invent missing facts;
- do not invent statutory provisions;
- use [TO BE COMPLETED] for missing details;
- use a formal professional style;
- preserve appropriate document structure;
- include an attachments section;
- where necessary, state that current law should be verified before filing.`
    }

  }[lang];


  const context = `

DOCUMENT TYPE:
${localized(documentType.title, lang)}

COURT:
${String(form.court || "")}

CLAIMANT:
${String(form.claimant || "")}

DEFENDANT:
${String(form.defendant || "")}

ADDRESS / CONTACT:
${String(form.address || "")}

FACTS:
${String(form.facts || "")}

REQUEST:
${String(form.request || "")}

EVIDENCE / ATTACHMENTS:
${String(form.evidence || "")}

  `.trim();


  let answer = "";


  try {

    answer =
      await callAI(
        t.instruction,
        lang,
        context
      );

  } catch (error) {

    console.error(
      "DOCUMENT AI ERROR:",
      error
    );


    answer =
      lang === "uz"
        ? "Hujjat loyihasini yaratishda xatolik yuz berdi. OPENROUTER_API_KEY sozlamasini tekshiring."
        : lang === "ru"
        ? "Не удалось создать проект документа. Проверьте OPENROUTER_API_KEY."
        : "The document draft could not be generated. Check OPENROUTER_API_KEY.";

  }


  return appLayout(

    lang,

    "documents",

    `

      <div class="resultBox">

        <div class="resultLabel">
          ${t.label}
        </div>

        ${esc(answer)}

      </div>


      <div class="formActions">

        <a
          class="btn btnOutline"
          href="/claim${q(lang)}&type=${encodeURIComponent(documentType.id)}"
        >
          ← ${t.edit}
        </a>


        <a
          class="btn btnPrimary"
          href="/documents${q(lang)}"
        >
          ▤ ${t.documents}
        </a>

      </div>

    `,

    t.title,

    t.description

  );

}


// ======================================================
// CALCULATORS PAGE
// ======================================================

function calculatorsPage(lang) {

  lang = getLang(lang);


  const t = {

    uz: {
      title:
        "Huquqiy hisob-kitoblar",

      description:
        "Dastlabki hisob-kitob va vaziyatni tushunishga yordam beruvchi vositalar.",

      income:
        "Daromad bo‘yicha hisob",

      incomeText:
        "Oylik daromadning foiz yoki ulush bo‘yicha taxminiy qiymatini hisoblang.",

      monthly:
        "Oylik daromad",

      percent:
        "Foiz",

      calculate:
        "Hisoblash",

      result:
        "Taxminiy natija",

      property:
        "Mol-mulk ulushi",

      propertyText:
        "Mol-mulk qiymatidan matematik ulushni hisoblash uchun oddiy vosita.",

      value:
        "Mol-mulk qiymati",

      share:
        "Ulush (%)",

      warning:
        "Bu kalkulyatorlar faqat matematik hisob-kitob uchun. Ular sud qarori yoki qonun bo‘yicha aniq majburiyatni oldindan belgilamaydi."
    },


    ru: {
      title:
        "Юридические расчёты",

      description:
        "Инструменты для предварительных расчётов и понимания ситуации.",

      income:
        "Расчёт от дохода",

      incomeText:
        "Рассчитайте примерное значение в процентах от ежемесячного дохода.",

      monthly:
        "Ежемесячный доход",

      percent:
        "Процент",

      calculate:
        "Рассчитать",

      result:
        "Примерный результат",

      property:
        "Доля имущества",

      propertyText:
        "Простой математический расчёт доли от стоимости имущества.",

      value:
        "Стоимость имущества",

      share:
        "Доля (%)",

      warning:
        "Калькуляторы выполняют только математический расчёт и не определяют заранее решение суда или точный размер юридического обязательства."
    },


    en: {
      title:
        "Legal calculations",

      description:
        "Tools for preliminary mathematical calculations and understanding a situation.",

      income:
        "Income calculation",

      incomeText:
        "Calculate an approximate percentage of monthly income.",

      monthly:
        "Monthly income",

      percent:
        "Percentage",

      calculate:
        "Calculate",

      result:
        "Approximate result",

      property:
        "Property share",

      propertyText:
        "A simple mathematical tool for calculating a percentage share of property value.",

      value:
        "Property value",

      share:
        "Share (%)",

      warning:
        "These calculators perform mathematical calculations only. They do not predict a court decision or establish a legal obligation."
    }

  }[lang];


  return appLayout(

    lang,

    "calculators",

    `

      <div class="notice noticeGold">

        <span class="noticeIcon">
          !
        </span>

        <span>
          ${t.warning}
        </span>

      </div>


      <div class="calculatorGrid">


        <section class="calcCard">

          <h3>
            ${t.income}
          </h3>

          <p>
            ${t.incomeText}
          </p>


          <div class="formGroup">

            <label>
              ${t.monthly}
            </label>

            <input
              id="incomeValue"
              type="number"
              min="0"
              step="any"
              placeholder="0"
            >

          </div>


          <div
            class="formGroup"
            style="margin-top:12px;"
          >

            <label>
              ${t.percent}
            </label>

            <input
              id="incomePercent"
              type="number"
              min="0"
              max="100"
              step="any"
              placeholder="25"
            >

          </div>


          <button
            type="button"
            class="btn btnPrimary"
            style="margin-top:15px;"
            onclick="calculateIncome()"
          >
            ∑ ${t.calculate}
          </button>


          <div
            id="incomeResult"
            class="calcResult"
          >
            ${t.result}: —
          </div>

        </section>



        <section class="calcCard">

          <h3>
            ${t.property}
          </h3>

          <p>
            ${t.propertyText}
          </p>


          <div class="formGroup">

            <label>
              ${t.value}
            </label>

            <input
              id="propertyValue"
              type="number"
              min="0"
              step="any"
              placeholder="0"
            >

          </div>


          <div
            class="formGroup"
            style="margin-top:12px;"
          >

            <label>
              ${t.share}
            </label>

            <input
              id="propertyPercent"
              type="number"
              min="0"
              max="100"
              step="any"
              placeholder="50"
            >

          </div>


          <button
            type="button"
            class="btn btnPrimary"
            style="margin-top:15px;"
            onclick="calculateProperty()"
          >
            ∑ ${t.calculate}
          </button>


          <div
            id="propertyResult"
            class="calcResult"
          >
            ${t.result}: —
          </div>

        </section>


      </div>


      <script>

        function formatNumber(value){

          if(
            !Number.isFinite(value)
          ){
            return "0";
          }

          return new Intl.NumberFormat(
            "${lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uz-UZ"}",
            {
              maximumFractionDigits:2
            }
          ).format(value);

        }


        function calculateIncome(){

          const income =
            Number(
              document.getElementById(
                "incomeValue"
              ).value
            );

          const percent =
            Number(
              document.getElementById(
                "incomePercent"
              ).value
            );


          const result =
            income *
            percent /
            100;


          document.getElementById(
            "incomeResult"
          ).textContent =
            "${t.result}: " +
            formatNumber(result);

        }


        function calculateProperty(){

          const value =
            Number(
              document.getElementById(
                "propertyValue"
              ).value
            );

          const percent =
            Number(
              document.getElementById(
                "propertyPercent"
              ).value
            );


          const result =
            value *
            percent /
            100;


          document.getElementById(
            "propertyResult"
          ).textContent =
            "${t.result}: " +
            formatNumber(result);

        }

      </script>

    `,

    t.title,

    t.description

  );

}


// ======================================================
// 404 PAGE
// ======================================================

function notFoundPage(lang) {

  lang = getLang(lang);


  const t = {

    uz: {
      title:
        "Sahifa topilmadi",

      text:
        "Siz izlayotgan sahifa mavjud emas.",

      home:
        "Bosh sahifaga qaytish"
    },


    ru: {
      title:
        "Страница не найдена",

      text:
        "Запрашиваемая страница не существует.",

      home:
        "Вернуться на главную"
    },


    en: {
      title:
        "Page not found",

      text:
        "The page you are looking for does not exist.",

      home:
        "Return home"
    }

  }[lang];


  return page({

    lang,

    title:
      t.title,

    content: `

      <section
        style="
          min-height:65vh;
          display:grid;
          place-items:center;
          padding:60px 0;
        "
      >

        <div
                  class="surface surfacePad"
          style="
            width:min(600px,92%);
            text-align:center;
          "
        >

          <div
            style="
              color:#c9a86a;
              font-family:Georgia,serif;
              font-size:70px;
            "
          >
            §
          </div>


          <h1
            style="
              margin:5px 0 10px;
              color:#06111f;
              font-family:Georgia,serif;
              font-size:35px;
            "
          >
            404
          </h1>


          <h2 class="cardTitle">
            ${t.title}
          </h2>


          <p class="cardDescription">
            ${t.text}
          </p>


          <a
            class="btn btnPrimary"
            href="/${q(lang)}"
          >
            ← ${t.home}
          </a>

        </div>

      </section>

    `

  });

}


// ======================================================
// END OF PART 3/4
// ======================================================
// ======================================================
// PART 4/4 — FINAL
// COURT FINDER / GOOGLE MAPS / ROUTES / SERVER
// ======================================================


// ======================================================
// TASHKENT COURTS
// ======================================================
//
// Eslatma:
// Sud manzillari o'zgarishi mumkin.
// Shu sabab Google Maps sud nomi bo'yicha real qidiruv qiladi.
// Keyinchalik rasmiy manzil bazasini API orqali ulash mumkin.
//
// ======================================================

const TASHKENT_COURTS = [

  // ----------------------------------------------------
  // CITY LEVEL
  // ----------------------------------------------------

  {
    id: "tashkent-city-court",

    type: "general",

    district: "Toshkent shahri",

    name: {
      uz: "Toshkent shahar sudi",
      ru: "Ташкентский городской суд",
      en: "Tashkent City Court"
    },

    keywords:
      "toshkent shahar sudi city court апелляция"
  },


  {
    id: "tashkent-administrative",

    type: "administrative",

    district: "Toshkent shahri",

    name: {
      uz: "Toshkent shahar ma’muriy sudi",
      ru: "Ташкентский городской административный суд",
      en: "Tashkent City Administrative Court"
    },

    keywords:
      "toshkent shahar ma'muriy sudi administrative court"
  },


  {
    id: "tashkent-economic",

    type: "economic",

    district: "Toshkent shahri",

    name: {
      uz: "Toshkent shahar iqtisodiy sudi",
      ru: "Ташкентский городской экономический суд",
      en: "Tashkent City Economic Court"
    },

    keywords:
      "toshkent shahar iqtisodiy sudi economic court"
  },


  // ----------------------------------------------------
  // CIVIL COURTS
  // ----------------------------------------------------

  {
    id: "civil-mirobod",

    type: "civil",

    district: "Mirobod",

    name: {
      uz:
        "Fuqarolik ishlari bo‘yicha Mirobod tumanlararo sudi",

      ru:
        "Мирабадский межрайонный суд по гражданским делам",

      en:
        "Mirobod Interdistrict Civil Court"
    },

    keywords:
      "fuqarolik mirobod tumanlararo sudi civil"
  },


  {
    id: "civil-shaykhontohur",

    type: "civil",

    district: "Shayxontohur",

    name: {
      uz:
        "Fuqarolik ishlari bo‘yicha Shayxontohur tumanlararo sudi",

      ru:
        "Шайхантахурский межрайонный суд по гражданским делам",

      en:
        "Shaykhontohur Interdistrict Civil Court"
    },

    keywords:
      "fuqarolik shayxontohur tumanlararo sudi civil"
  },


  {
    id: "civil-yunusobod",

    type: "civil",

    district: "Yunusobod",

    name: {
      uz:
        "Fuqarolik ishlari bo‘yicha Yunusobod tumanlararo sudi",

      ru:
        "Юнусабадский межрайонный суд по гражданским делам",

      en:
        "Yunusobod Interdistrict Civil Court"
    },

    keywords:
      "fuqarolik yunusobod tumanlararo sudi civil"
  },


  {
    id: "civil-uchtepa",

    type: "civil",

    district: "Uchtepa",

    name: {
      uz:
        "Fuqarolik ishlari bo‘yicha Uchtepa tumanlararo sudi",

      ru:
        "Учтепинский межрайонный суд по гражданским делам",

      en:
        "Uchtepa Interdistrict Civil Court"
    },

    keywords:
      "fuqarolik uchtepa tumanlararo sudi civil"
  },


  {
    id: "civil-yakkasaroy",

    type: "civil",

    district: "Yakkasaroy",

    name: {
      uz:
        "Fuqarolik ishlari bo‘yicha Yakkasaroy tumanlararo sudi",

      ru:
        "Яккасарайский межрайонный суд по гражданским делам",

      en:
        "Yakkasaroy Interdistrict Civil Court"
    },

    keywords:
      "fuqarolik yakkasaroy tumanlararo sudi civil"
  },


  {
    id: "civil-chilonzor",

    type: "civil",

    district: "Chilonzor",

    name: {
      uz:
        "Fuqarolik ishlari bo‘yicha Chilonzor tumanlararo sudi",

      ru:
        "Чиланзарский межрайонный суд по гражданским делам",

      en:
        "Chilonzor Interdistrict Civil Court"
    },

    keywords:
      "fuqarolik chilonzor tumanlararo sudi civil"
  },


  {
    id: "civil-mirzo-ulugbek",

    type: "civil",

    district: "Mirzo Ulug‘bek",

    name: {
      uz:
        "Fuqarolik ishlari bo‘yicha Mirzo Ulug‘bek tumanlararo sudi",

      ru:
        "Мирзо-Улугбекский межрайонный суд по гражданским делам",

      en:
        "Mirzo Ulugbek Interdistrict Civil Court"
    },

    keywords:
      "fuqarolik mirzo ulugbek tumanlararo sudi civil"
  },


  {
    id: "civil-sergeli",

    type: "civil",

    district: "Sergeli",

    name: {
      uz:
        "Fuqarolik ishlari bo‘yicha Sergeli tumanlararo sudi",

      ru:
        "Сергелийский межрайонный суд по гражданским делам",

      en:
        "Sergeli Interdistrict Civil Court"
    },

    keywords:
      "fuqarolik sergeli tumanlararo sudi civil"
  },


  {
    id: "civil-yashnobod",

    type: "civil",

    district: "Yashnobod",

    name: {
      uz:
        "Fuqarolik ishlari bo‘yicha Yashnobod tumanlararo sudi",

      ru:
        "Яшнабадский межрайонный суд по гражданским делам",

      en:
        "Yashnobod Interdistrict Civil Court"
    },

    keywords:
      "fuqarolik yashnobod tumanlararo sudi civil"
  },


  {
    id: "civil-olmazor",

    type: "civil",

    district: "Olmazor",

    name: {
      uz:
        "Fuqarolik ishlari bo‘yicha Olmazor tumanlararo sudi",

      ru:
        "Алмазарский межрайонный суд по гражданским делам",

      en:
        "Olmazor Interdistrict Civil Court"
    },

    keywords:
      "fuqarolik olmazor tumanlararo sudi civil"
  },


  {
    id: "civil-bektemir",

    type: "civil",

    district: "Bektemir",

    name: {
      uz:
        "Fuqarolik ishlari bo‘yicha Bektemir tumanlararo sudi",

      ru:
        "Бектемирский межрайонный суд по гражданским делам",

      en:
        "Bektemir Interdistrict Civil Court"
    },

    keywords:
      "fuqarolik bektemir tumanlararo sudi civil"
  },


  {
    id: "civil-yangihayot",

    type: "civil",

    district: "Yangihayot",

    name: {
      uz:
        "Fuqarolik ishlari bo‘yicha Yangihayot tumanlararo sudi",

      ru:
        "Янгиҳаётский межрайонный суд по гражданским делам",

      en:
        "Yangihayot Interdistrict Civil Court"
    },

    keywords:
      "fuqarolik yangihayot tumanlararo sudi civil"
  },


  // ----------------------------------------------------
  // CRIMINAL COURTS
  // ----------------------------------------------------

  {
    id: "criminal-bektemir",

    type: "criminal",

    district: "Bektemir",

    name: {
      uz:
        "Jinoyat ishlari bo‘yicha Bektemir tuman sudi",

      ru:
        "Бектемирский районный суд по уголовным делам",

      en:
        "Bektemir District Criminal Court"
    },

    keywords:
      "jinoyat bektemir tuman sudi criminal"
  },


  {
    id: "criminal-chilonzor",

    type: "criminal",

    district: "Chilonzor",

    name: {
      uz:
        "Jinoyat ishlari bo‘yicha Chilonzor tuman sudi",

      ru:
        "Чиланзарский районный суд по уголовным делам",

      en:
        "Chilonzor District Criminal Court"
    },

    keywords:
      "jinoyat chilonzor tuman sudi criminal"
  },


  {
    id: "criminal-mirobod",

    type: "criminal",

    district: "Mirobod",

    name: {
      uz:
        "Jinoyat ishlari bo‘yicha Mirobod tuman sudi",

      ru:
        "Мирабадский районный суд по уголовным делам",

      en:
        "Mirobod District Criminal Court"
    },

    keywords:
      "jinoyat mirobod tuman sudi criminal"
  },


  {
    id: "criminal-mirzo-ulugbek",

    type: "criminal",

    district: "Mirzo Ulug‘bek",

    name: {
      uz:
        "Jinoyat ishlari bo‘yicha Mirzo Ulug‘bek tuman sudi",

      ru:
        "Мирзо-Улугбекский районный суд по уголовным делам",

      en:
        "Mirzo Ulugbek District Criminal Court"
    },

    keywords:
      "jinoyat mirzo ulugbek tuman sudi criminal"
  },


  {
    id: "criminal-olmazor",

    type: "criminal",

    district: "Olmazor",

    name: {
      uz:
        "Jinoyat ishlari bo‘yicha Olmazor tuman sudi",

      ru:
        "Алмазарский районный суд по уголовным делам",

      en:
        "Olmazor District Criminal Court"
    },

    keywords:
      "jinoyat olmazor tuman sudi criminal"
  },


  {
    id: "criminal-sergeli",

    type: "criminal",

    district: "Sergeli",

    name: {
      uz:
        "Jinoyat ishlari bo‘yicha Sergeli tuman sudi",

      ru:
        "Сергелийский районный суд по уголовным делам",

      en:
        "Sergeli District Criminal Court"
    },

    keywords:
      "jinoyat sergeli tuman sudi criminal"
  },


  {
    id: "criminal-shaykhontohur",

    type: "criminal",

    district: "Shayxontohur",

    name: {
      uz:
        "Jinoyat ishlari bo‘yicha Shayxontohur tuman sudi",

      ru:
        "Шайхантахурский районный суд по уголовным делам",

      en:
        "Shaykhontohur District Criminal Court"
    },

    keywords:
      "jinoyat shayxontohur tuman sudi criminal"
  },


  {
    id: "criminal-uchtepa",

    type: "criminal",

    district: "Uchtepa",

    name: {
      uz:
        "Jinoyat ishlari bo‘yicha Uchtepa tuman sudi",

      ru:
        "Учтепинский районный суд по уголовным делам",

      en:
        "Uchtepa District Criminal Court"
    },

    keywords:
      "jinoyat uchtepa tuman sudi criminal"
  },


  {
    id: "criminal-yakkasaroy",

    type: "criminal",

    district: "Yakkasaroy",

    name: {
      uz:
        "Jinoyat ishlari bo‘yicha Yakkasaroy tuman sudi",

      ru:
        "Яккасарайский районный суд по уголовным делам",

      en:
        "Yakkasaroy District Criminal Court"
    },

    keywords:
      "jinoyat yakkasaroy tuman sudi criminal"
  },


  {
    id: "criminal-yashnobod",

    type: "criminal",

    district: "Yashnobod",

    name: {
      uz:
        "Jinoyat ishlari bo‘yicha Yashnobod tuman sudi",

      ru:
        "Яшнабадский районный суд по уголовным делам",

      en:
        "Yashnobod District Criminal Court"
    },

    keywords:
      "jinoyat yashnobod tuman sudi criminal"
  },


  {
    id: "criminal-yunusobod",

    type: "criminal",

    district: "Yunusobod",

    name: {
      uz:
        "Jinoyat ishlari bo‘yicha Yunusobod tuman sudi",

      ru:
        "Юнусабадский районный суд по уголовным делам",

      en:
        "Yunusobod District Criminal Court"
    },

    keywords:
      "jinoyat yunusobod tuman sudi criminal"
  },


  {
    id: "criminal-yangihayot",

    type: "criminal",

    district: "Yangihayot",

    name: {
      uz:
        "Jinoyat ishlari bo‘yicha Yangihayot tuman sudi",

      ru:
        "Янгиҳаётский районный суд по уголовным делам",

      en:
        "Yangihayot District Criminal Court"
    },

    keywords:
      "jinoyat yangihayot tuman sudi criminal"
  }

];


// ======================================================
// GOOGLE MAPS
// ======================================================

function googleMapsSearch(
  name,
  district
) {

  const query =
    [
      name,
      district,
      "Toshkent",
      "Uzbekistan"
    ]
      .filter(Boolean)
      .join(", ");


  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(query)
  );

}


function googleMapsDirections(
  name,
  district
) {

  const destination =
    [
      name,
      district,
      "Toshkent",
      "Uzbekistan"
    ]
      .filter(Boolean)
      .join(", ");


  return (
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent(destination)
  );

}


// ======================================================
// COURT PAGE CSS
// ======================================================

const COURT_CSS = `

.courtHero{
  position:relative;
  overflow:hidden;

  padding:
    58px 0 38px;

  color:#fff;

  background:
    radial-gradient(
      circle at 85% 15%,
      rgba(201,168,106,.17),
      transparent 28%
    ),
    linear-gradient(
      135deg,
      #06111f,
      #0b2946
    );

  border-bottom:
    1px solid rgba(201,168,106,.16);
}


.courtHero::after{
  content:"⚖";

  position:absolute;

  right:6%;
  top:50%;

  transform:
    translateY(-50%);

  color:
    rgba(201,168,106,.06);

  font-size:
    clamp(120px,18vw,220px);
}


.courtHeroInner{
  position:relative;
  z-index:2;
}


.courtHero .eyebrow{
  color:#d7b972;
}


.courtHero h1{
  max-width:850px;

  margin:
    12px 0 12px;

  color:#fff;

  font-family:
    Georgia,
    serif;

  font-size:
    clamp(34px,5vw,54px);

  font-weight:500;

  line-height:1.06;
}


.courtHero p{
  max-width:760px;

  margin:0;

  color:#aebdca;

  font-size:12px;

  line-height:1.8;
}


.courtMain{
  padding:
    28px 0 65px;
}


.courtInfoGrid{
  display:grid;

  grid-template-columns:
    repeat(4,minmax(0,1fr));

  gap:12px;

  margin-bottom:22px;
}


.courtInfoCard{
  padding:17px;

  background:#fff;

  border:
    1px solid #e0e5e9;

  border-radius:11px;

  box-shadow:
    0 8px 25px rgba(6,17,31,.035);
}


.courtInfoCard small{
  display:block;

  margin-bottom:6px;

  color:#a27a3f;

  font-size:7px;

  font-weight:900;

  letter-spacing:1.2px;
}


.courtInfoCard strong{
  display:block;

  color:#1e354c;

  font-size:11px;

  line-height:1.45;
}


.courtToolbar{
  display:flex;

  align-items:center;

  justify-content:space-between;

  gap:15px;

  margin-bottom:18px;
}


.courtSearch{
  position:relative;

  flex:1;
}


.courtSearch input{
  width:100%;

  height:50px;

  padding:
    0 16px 0 42px;

  color:#263d55;

  background:#fff;

  border:
    1px solid #dde4e9;

  border-radius:10px;

  outline:0;

  box-shadow:
    0 8px 25px rgba(6,17,31,.035);
}


.courtSearch input:focus{
  border-color:
    rgba(201,168,106,.7);

  box-shadow:
    0 0 0 3px rgba(201,168,106,.09);
}


.courtSearchIcon{
  position:absolute;

  left:15px;
  top:50%;

  transform:
    translateY(-50%);

  color:#a58047;

  font-size:15px;

  pointer-events:none;
}


.courtCount{
  min-width:105px;

  padding:
    11px 14px;

  text-align:center;

  color:#40566d;

  background:#fff;

  border:
    1px solid #dde4e9;

  border-radius:9px;

  font-size:9px;

  font-weight:800;
}


.courtFilters{
  display:flex;

  flex-wrap:wrap;

  gap:7px;

  margin-bottom:20px;
}


.courtFilter{
  padding:
    9px 12px;

  color:#68798a;

  background:#fff;

  border:
    1px solid #dde4e9;

  border-radius:8px;

  cursor:pointer;

  font-size:9px;

  font-weight:800;

  transition:.18s ease;
}


.courtFilter:hover{
  color:#172e45;

  border-color:
    rgba(201,168,106,.55);
}


.courtFilter.active{
  color:#fff;

  background:
    linear-gradient(
      145deg,
      #06111f,
      #0b2946
    );

  border-color:#06111f;
}


.courtGrid{
  display:grid;

  grid-template-columns:
    repeat(3,minmax(0,1fr));

  gap:15px;
}


.courtCard{
  position:relative;

  min-height:310px;

  padding:21px;

  display:flex;

  flex-direction:column;

  overflow:hidden;

  background:#fff;

  border:
    1px solid #dfe5ea;

  border-radius:13px;

  box-shadow:
    0 10px 30px rgba(6,17,31,.04);

  transition:.2s ease;
}


.courtCard:hover{
  transform:
    translateY(-4px);

  border-color:
    rgba(201,168,106,.55);

  box-shadow:
    0 20px 45px rgba(6,17,31,.085);
}


.courtCard::before{
  content:"";

  position:absolute;

  top:0;
  left:0;

  width:100%;
  height:2px;

  background:
    linear-gradient(
      90deg,
      transparent,
      #c9a86a,
      transparent
    );
}


.courtCardTop{
  display:flex;

  align-items:center;

  justify-content:space-between;

  gap:8px;

  margin-bottom:14px;
}


.courtType{
  display:inline-flex;

  padding:
    6px 8px;

  color:#8b6832;

  background:#fff8ea;

  border:
    1px solid #ead9b8;

  border-radius:6px;

  font-size:7px;

  font-weight:900;

  letter-spacing:.6px;
}


.courtDistrict{
  color:#8492a1;

  font-size:8px;

  font-weight:800;
}


.courtCard h3{
  margin:
    0 0 13px;

  color:#172e45;

  font-family:
    Georgia,
    serif;

  font-size:17px;

  font-weight:600;

  line-height:1.4;
}


.courtCard p{
  margin:
    0 0 7px;

  color:#6e7e8e;

  font-size:9px;

  line-height:1.6;
}


.courtCard p strong{
  color:#3c5268;
}


.courtCardActions{
  display:flex;

  flex-wrap:wrap;

  gap:7px;

  margin-top:auto;

  padding-top:15px;
}


.courtMapButton{
  min-height:37px;

  padding:
    9px 11px;

  display:inline-flex;

  align-items:center;

  justify-content:center;

  color:#294a68;

  background:#fff;

  border:
    1px solid #dce3e8;

  border-radius:7px;

  font-size:8px;

  font-weight:850;

  transition:.18s ease;
}


.courtMapButton:hover{
  background:#fffaf0;

  border-color:
    rgba(201,168,106,.6);
}


.courtMapButton.primary{
  color:#fff;

  background:
    linear-gradient(
      145deg,
      #06111f,
      #0b2946
    );

  border-color:#06111f;
}


.courtEmpty{
  display:none;

  margin-top:15px;

  padding:35px;

  text-align:center;

  color:#788797;

  background:#fff;

  border:
    1px dashed #d8dfe5;

  border-radius:12px;
}


.courtGuide{
  margin-top:30px;

  padding:27px;

  background:
    linear-gradient(
      135deg,
      #071522,
      #0a2946
    );

  border:
    1px solid rgba(201,168,106,.15);

  border-radius:15px;

  box-shadow:
    0 17px 45px rgba(6,17,31,.11);
}


.courtGuideHeader{
  margin-bottom:20px;
}


.courtGuideHeader small{
  display:block;

  margin-bottom:6px;

  color:#d3b36d;

  font-size:7px;

  font-weight:900;

  letter-spacing:1.4px;
}


.courtGuideHeader h2{
  margin:0;

  color:#fff;

  font-family:
    Georgia,
    serif;

  font-size:24px;

  font-weight:500;
}


.courtSteps{
  display:grid;

  grid-template-columns:
    repeat(4,minmax(0,1fr));

  gap:12px;
}


.courtStep{
  padding:17px;

  background:
    rgba(255,255,255,.045);

  border:
    1px solid rgba(255,255,255,.07);

  border-radius:9px;
}


.courtStep span{
  display:block;

  margin-bottom:8px;

  color:#d3b36d;

  font-size:9px;

  font-weight:900;
}


.courtStep strong{
  display:block;

  margin-bottom:6px;

  color:#fff;

  font-size:10px;
}


.courtStep p{
  margin:0;

  color:#899caf;

  font-size:8px;

  line-height:1.6;
}


@media(max-width:1000px){

  .courtGrid{
    grid-template-columns:
      repeat(2,minmax(0,1fr));
  }

  .courtInfoGrid,
  .courtSteps{
    grid-template-columns:
      repeat(2,minmax(0,1fr));
  }

}


@media(max-width:650px){

  .courtGrid,
  .courtInfoGrid,
  .courtSteps{
    grid-template-columns:
      1fr;
  }

  .courtToolbar{
    align-items:stretch;

    flex-direction:column;
  }

  .courtCount{
    width:100%;
  }

}

`;


// ======================================================
// COURT TYPE LABEL
// ======================================================

function courtTypeLabel(
  type,
  lang
) {

  const labels = {

    uz: {
      general:
        "Shahar sudi",

      civil:
        "Fuqarolik sudi",

      criminal:
        "Jinoyat sudi",

      administrative:
        "Ma’muriy sud",

      economic:
        "Iqtisodiy sud"
    },


    ru: {
      general:
        "Городской суд",

      civil:
        "Гражданский суд",

      criminal:
        "Уголовный суд",

      administrative:
        "Административный суд",

      economic:
        "Экономический суд"
    },


    en: {
      general:
        "City Court",

      civil:
        "Civil Court",

      criminal:
        "Criminal Court",

      administrative:
        "Administrative Court",

      economic:
        "Economic Court"
    }

  };


  return (
    labels[lang]?.[type] ||
    labels.uz[type] ||
    type
  );

}
// ======================================================
// COURT PAGE
// ======================================================

function courtPage(lang) {

  lang = getLang(lang);


  const t = {

    uz: {

      eyebrow:
        "SUD VA DAVLAT ORGANLARI",

      title:
        "Kerakli sud yoki davlat organini toping",

      description:
        "Toshkent shahridagi sudlar va ayrim davlat organlari bo‘yicha ma’lumotlarni qidiring. Tashkilot nomi, tuman yoki sud turi orqali filtrlashingiz mumkin.",

      searchPlaceholder:
        "Sud, tuman yoki tashkilot nomini yozing...",

      all:
        "Barchasi",

      civil:
        "Fuqarolik",

      criminal:
        "Jinoyat",

      administrative:
        "Ma’muriy",

      economic:
        "Iqtisodiy",

      internalAffairs:
        "Ichki ishlar",

      courtsFound:
        "ta tashkilot",

      district:
        "Hudud",

      address:
        "Manzil",

      phone:
        "Telefon",

      email:
        "Elektron pochta",

      map:
        "Xaritada ko‘rish",

      route:
        "Yo‘nalish",

      noResults:
        "Qidiruv bo‘yicha tashkilot topilmadi.",

      guideSmall:
        "AMALIY YO‘L XARITASI",

      guideTitle:
        "Sudga murojaat qilishdan oldin",

      step1:
        "Vakolatni aniqlang",

      step1Text:
        "Nizo qaysi sud yoki davlat organi vakolatiga kirishini aniqlang.",

      step2:
        "Hududni tekshiring",

      step2Text:
        "Ariza qaysi hududdagi sudga berilishi kerakligini aniqlang.",

      step3:
        "Hujjatlarni tayyorlang",

      step3Text:
        "Ariza, da’vo va mavjud dalillarni tartibga soling.",

      step4:
        "Rasmiy ma’lumotni tekshiring",

      step4Text:
        "Topshirishdan oldin sudning amaldagi manzili va aloqa ma’lumotlarini rasmiy manbadan tekshiring."
    },


    ru: {

      eyebrow:
        "СУДЫ И ГОСУДАРСТВЕННЫЕ ОРГАНЫ",

      title:
        "Найдите нужный суд или государственный орган",

      description:
        "Поиск судов Ташкента и отдельных государственных органов. Можно фильтровать по названию, району или типу суда.",

      searchPlaceholder:
        "Введите название суда, района или организации...",

      all:
        "Все",

      civil:
        "Гражданские",

      criminal:
        "Уголовные",

      administrative:
        "Административные",

      economic:
        "Экономические",

      internalAffairs:
        "Органы внутренних дел",

      courtsFound:
        "организаций",

      district:
        "Район",

      address:
        "Адрес",

      phone:
        "Телефон",

      email:
        "Электронная почта",

      map:
        "Открыть карту",

      route:
        "Маршрут",

      noResults:
        "По вашему запросу организации не найдены.",

      guideSmall:
        "ПРАКТИЧЕСКАЯ СХЕМА",

      guideTitle:
        "Перед обращением в суд",

      step1:
        "Определите компетенцию",

      step1Text:
        "Определите, какой суд или государственный орган компетентен рассматривать вопрос.",

      step2:
        "Проверьте территорию",

      step2Text:
        "Определите, в какой территориальный суд необходимо подать заявление.",

      step3:
        "Подготовьте документы",

      step3Text:
        "Подготовьте заявление, иск и имеющиеся доказательства.",

      step4:
        "Проверьте официальные данные",

      step4Text:
        "Перед подачей проверьте актуальный адрес и контактные данные суда в официальном источнике."
    },


    en: {

      eyebrow:
        "COURTS AND STATE AUTHORITIES",

      title:
        "Find the appropriate court or state authority",

      description:
        "Search courts in Tashkent and selected state authorities by organization name, district or court type.",

      searchPlaceholder:
        "Enter court, district or organization name...",

      all:
        "All",

      civil:
        "Civil",

      criminal:
        "Criminal",

      administrative:
        "Administrative",

      economic:
        "Economic",

      internalAffairs:
        "Internal affairs",

      courtsFound:
        "organizations",

      district:
        "District",

      address:
        "Address",

      phone:
        "Phone",

      email:
        "Email",

      map:
        "Open map",

      route:
        "Directions",

      noResults:
        "No organizations matched your search.",

      guideSmall:
        "PRACTICAL ROADMAP",

      guideTitle:
        "Before applying to court",

      step1:
        "Determine jurisdiction",

      step1Text:
        "Identify which court or state authority has jurisdiction over the matter.",

      step2:
        "Check territorial jurisdiction",

      step2Text:
        "Determine which territorial court should receive the application.",

      step3:
        "Prepare documents",

      step3Text:
        "Organize the application, claim and available evidence.",

      step4:
        "Verify official information",

      step4Text:
        "Before filing, verify the court's current address and contact information through an official source."
    }

  }[lang];


// ======================================================
// COURT CARDS
// ======================================================

  const courtCards =

    TASHKENT_COURTS
      .map(court => {

        const name =
          localized(
            court.name,
            lang
          );


        const mapUrl =
          googleMapsSearch(
            name,
            court.district
          );


        const routeUrl =
          googleMapsDirections(
            name,
            court.district
          );


        return `

          <article
            class="courtCard"
            data-category="court"
            data-type="${esc(court.type)}"
            data-search="${esc(
              (
                name +
                " " +
                court.district +
                " " +
                court.keywords
              ).toLowerCase()
            )}"
          >

            <div class="courtCardTop">

              <span class="courtType">
                ${esc(
                  courtTypeLabel(
                    court.type,
                    lang
                  )
                )}
              </span>

              <span class="courtDistrict">
                ${esc(court.district)}
              </span>

            </div>


            <h3>
              ${esc(name)}
            </h3>


            <p>

              <strong>
                ${t.district}:
              </strong>

              ${esc(court.district)}

            </p>


            <div class="courtCardActions">

              <a
                class="courtMapButton primary"
                href="${esc(mapUrl)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                ⌖ ${t.map}
              </a>


              <a
                class="courtMapButton"
                href="${esc(routeUrl)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                → ${t.route}
              </a>

            </div>

          </article>

        `;

      })
      .join("");


// ======================================================
// INTERNAL AFFAIRS + OTHER STATE ORGANIZATIONS
// ======================================================
//
// MUHIM:
// STATE_ORGANIZATIONS server scope'da yuqorida e'lon qilingan.
// Uni pastdagi browser <script> ichiga ko'chirmang.
//
// ======================================================

  const internalAffairsCards =

    STATE_ORGANIZATIONS
      .filter(
        organization =>
          organization.category ===
          "internal_affairs"
      )
      .map(organization => {

        const name =
          organization.name || "";


        const district =
          organization.district ||
          organization.region ||
          "";


        const mapUrl =
          googleMapsSearch(
            name,
            district
          );


        const routeUrl =
          googleMapsDirections(
            name,
            district
          );


        const phone =
          organization.phone ||
          organization.emergencyPhone ||
          organization.hotline ||
          "";


        const searchText = [

          name,

          district,

          organization.region,

          organization.address,

          organization.phone,

          organization.emergencyPhone,

          organization.hotline,

          "ichki ishlar",

          "iib",

          "iibb",

          "iio fmb",

          "police",

          "102"

        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();


        return `

          <article
            class="courtCard"
            data-category="internal_affairs"
            data-type="internal_affairs"
            data-search="${esc(searchText)}"
          >

            <div class="courtCardTop">

              <span class="courtType">

                ${
                  lang === "uz"
                    ? "Ichki ishlar"
                    : lang === "ru"
                    ? "Внутренние дела"
                    : "Internal affairs"
                }

              </span>


              <span class="courtDistrict">
                ${esc(district)}
              </span>

            </div>


            <h3>
              ${esc(name)}
            </h3>


            ${
              district
                ? `

                  <p>

                    <strong>
                      ${t.district}:
                    </strong>

                    ${esc(district)}

                  </p>

                `
                : ""
            }


            ${
              organization.address
                ? `

                  <p>

                    <strong>
                      ${t.address}:
                    </strong>

                    ${esc(
                      organization.address
                    )}

                  </p>

                `
                : ""
            }


            ${
              phone
                ? `

                  <p>

                    <strong>
                      ${t.phone}:
                    </strong>

                    <a
                      href="tel:${esc(
                        String(phone)
                          .replace(/\s+/g, "")
                      )}"
                    >
                      ${esc(phone)}
                    </a>

                  </p>

                `
                : ""
            }


            ${
              organization.appealsPhone
                ? `

                  <p>

                    <strong>
                      ${
                        lang === "uz"
                          ? "Murojaatlar"
                          : lang === "ru"
                          ? "Обращения"
                          : "Appeals"
                      }:
                    </strong>

                    <a
                      href="tel:${esc(
                        String(
                          organization.appealsPhone
                        ).replace(/\s+/g, "")
                      )}"
                    >
                      ${esc(
                        organization.appealsPhone
                      )}
                    </a>

                  </p>

                `
                : ""
            }


            ${
              organization.hotline
                ? `

                  <p>

                    <strong>
                      ${
                        lang === "uz"
                          ? "Ishonch telefoni"
                          : lang === "ru"
                          ? "Телефон доверия"
                          : "Hotline"
                      }:
                    </strong>

                    ${esc(
                      organization.hotline
                    )}

                  </p>

                `
                : ""
            }


            ${
              organization.email
                ? `

                  <p>

                    <strong>
                      ${t.email}:
                    </strong>

                    <a
                      href="mailto:${esc(
                        organization.email
                      )}"
                    >
                      ${esc(
                        organization.email
                      )}
                    </a>

                  </p>

                `
                : ""
            }


            ${
              organization.description
                ? `

                  <p>
                    ${esc(
                      organization.description
                    )}
                  </p>

                `
                : ""
            }


            <div class="courtCardActions">

              <a
                class="courtMapButton primary"
                href="${esc(mapUrl)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                ⌖ ${t.map}
              </a>


              <a
                class="courtMapButton"
                href="${esc(routeUrl)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                → ${t.route}
              </a>

            </div>

          </article>

        `;

      })
      .join("");


// ======================================================
// COURT PAGE HTML
// ======================================================

  const totalOrganizations =

    TASHKENT_COURTS.length +

    STATE_ORGANIZATIONS.filter(
      organization =>
        organization.category ===
        "internal_affairs"
    ).length;


  return layout({

    lang,

    title:
      t.title,

    active:
      "court",

    extraCss:
      COURT_CSS,

    body: `

      <main class="courtPage">


        <section class="courtHero">

          <div
            class="container courtHeroInner"
          >

            <span class="eyebrow">
              ${t.eyebrow}
            </span>


            <h1>
              ${t.title}
            </h1>


            <p>
              ${t.description}
            </p>

          </div>

        </section>


        <section class="courtMain">

          <div class="container">


            <div class="courtInfoGrid">


              <div class="courtInfoCard">

                <small>
                  HUQUQIY AI
                </small>

                <strong>

                  ${
                    lang === "uz"
                      ? "Sud va tashkilotlarni bitta joydan qidiring"
                      : lang === "ru"
                      ? "Ищите суды и организации в одном месте"
                      : "Search courts and organizations in one place"
                  }

                </strong>

              </div>


              <div class="courtInfoCard">

                <small>
                  GOOGLE MAPS
                </small>

                <strong>

                  ${
                    lang === "uz"
                      ? "Xaritada ochish va yo‘nalish olish"
                      : lang === "ru"
                      ? "Открытие на карте и построение маршрута"
                      : "Open the map and get directions"
                  }

                </strong>

              </div>


              <div class="courtInfoCard">

                <small>
                  FILTER
                </small>

                <strong>

                  ${
                    lang === "uz"
                      ? "Sud turi yoki ichki ishlar bo‘yicha saralash"
                      : lang === "ru"
                      ? "Фильтрация по типу суда или органам внутренних дел"
                      : "Filter by court type or internal affairs"
                  }

                </strong>

              </div>


              <div class="courtInfoCard">

                <small>
                  MUHIM
                </small>

                <strong>

                  ${
                    lang === "uz"
                      ? "Murojaatdan oldin rasmiy ma’lumotni tekshiring"
                      : lang === "ru"
                      ? "Проверьте официальные данные перед обращением"
                      : "Verify official information before applying"
                  }

                </strong>

              </div>


            </div>


            <div class="courtToolbar">


              <div class="courtSearch">

                <span class="courtSearchIcon">
                  ⌕
                </span>

                <input
                  id="courtSearchInput"
                  type="search"
                  autocomplete="off"
                  placeholder="${esc(
                    t.searchPlaceholder
                  )}"
                >

              </div>


              <div
                id="courtCount"
                class="courtCount"
              >

                ${totalOrganizations}
                ${t.courtsFound}

              </div>


            </div>


            <div class="courtFilters">


              <button
                class="courtFilter active"
                type="button"
                data-filter="all"
              >
                ${t.all}
              </button>


              <button
                class="courtFilter"
                type="button"
                data-filter="civil"
              >
                ${t.civil}
              </button>


              <button
                class="courtFilter"
                type="button"
                data-filter="criminal"
              >
                ${t.criminal}
              </button>


              <button
                class="courtFilter"
                type="button"
                data-filter="administrative"
              >
                ${t.administrative}
              </button>


              <button
                class="courtFilter"
                type="button"
                data-filter="economic"
              >
                ${t.economic}
              </button>


              <button
                class="courtFilter"
                type="button"
                data-filter="internal_affairs"
              >
                ${t.internalAffairs}
              </button>


            </div>


            <div
              id="courtGrid"
              class="courtGrid"
            >

              ${courtCards}

              ${internalAffairsCards}

            </div>


            <div
              id="courtEmpty"
              class="courtEmpty"
            >
              ${t.noResults}
            </div>


            <section class="courtGuide">


              <div class="courtGuideHeader">

                <small>
                  ${t.guideSmall}
                </small>

                <h2>
                  ${t.guideTitle}
                </h2>

              </div>


              <div class="courtSteps">


                <article class="courtStep">

                  <span>
                    01
                  </span>

                  <strong>
                    ${t.step1}
                  </strong>

                  <p>
                    ${t.step1Text}
                  </p>

                </article>


                <article class="courtStep">

                  <span>
                    02
                  </span>

                  <strong>
                    ${t.step2}
                  </strong>

                  <p>
                    ${t.step2Text}
                  </p>

                </article>


                <article class="courtStep">

                  <span>
                    03
                  </span>

                  <strong>
                    ${t.step3}
                  </strong>

                  <p>
                    ${t.step3Text}
                  </p>

                </article>


                <article class="courtStep">

                  <span>
                    04
                  </span>

                  <strong>
                    ${t.step4}
                  </strong>

                  <p>
                    ${t.step4Text}
                  </p>

                </article>


              </div>

            </section>


          </div>

        </section>

      </main>


      <script>

        (() => {


          const searchInput =
            document.getElementById(
              "courtSearchInput"
            );


          const cards =
            Array.from(
              document.querySelectorAll(
                ".courtCard"
              )
            );


          const filters =
            Array.from(
              document.querySelectorAll(
                ".courtFilter"
              )
            );


          const counter =
            document.getElementById(
              "courtCount"
            );


          const empty =
            document.getElementById(
              "courtEmpty"
            );


          let currentFilter =
            "all";


// ======================================================
// NORMALIZE SEARCH TEXT
// ======================================================

          function normalize(value) {

            return String(
              value || ""
            )
              .toLowerCase()

              .replace(
                /[ʻʼ‘’']/g,
                ""
              )

              .replace(
                /\\s+/g,
                " "
              )

              .trim();

          }


// ======================================================
// APPLY FILTERS
// ======================================================

          function applyFilters() {

            const query =
              normalize(
                searchInput
                  ? searchInput.value
                  : ""
              );


            let visibleCount = 0;


            cards.forEach(card => {

              const type =
                card.dataset.type || "";


              const category =
                card.dataset.category || "";


              const searchable =
                normalize(
                  card.dataset.search || ""
                );


              let filterMatch =
                false;


              if (
                currentFilter === "all"
              ) {

                filterMatch = true;

              } else if (
                currentFilter ===
                "internal_affairs"
              ) {

                filterMatch =
                  category ===
                  "internal_affairs";

              } else {

                filterMatch =
                  type ===
                  currentFilter;

              }


              const searchMatch =
                !query ||
                searchable.includes(
                  query
                );


              const visible =
                filterMatch &&
                searchMatch;


              card.style.display =
                visible
                  ? ""
                  : "none";


              if (visible) {
                visibleCount++;
              }

            });


            if (counter) {

              counter.textContent =
                visibleCount +
                " ${t.courtsFound}";

            }


            if (empty) {

              empty.style.display =
                visibleCount === 0
                  ? "block"
                  : "none";

            }

          }


// ======================================================
// SEARCH
// ======================================================

          if (searchInput) {

            searchInput.addEventListener(
              "input",
              applyFilters
            );

          }


// ======================================================
// FILTER BUTTONS
// ======================================================

          filters.forEach(button => {

            button.addEventListener(
              "click",
              () => {

                currentFilter =
                  button.dataset.filter ||
                  "all";


                filters.forEach(
                  item =>
                    item.classList.remove(
                      "active"
                    )
                );


                button.classList.add(
                  "active"
                );


                applyFilters();

              }
            );

          });


          applyFilters();


        })();

      </script>

    `

  });

}


// ======================================================
// SERVER
// ======================================================

const server =
  http.createServer(
    async (req, res) => {

      try {

        const url =
          getUrl(req);


        const pathname =
          url.pathname;


        const lang =
          getLang(
            url.searchParams.get(
              "lang"
            )
          );


// ======================================================
// GET ROUTES
// ======================================================

        if (
          req.method === "GET" &&
          pathname === "/"
        ) {

          return sendHtml(
            res,
            homePage(lang)
          );

        }


        if (
          req.method === "GET" &&
          (
            pathname === "/assistant" ||
            pathname === "/ai"
          )
        ) {

          const area =
            url.searchParams.get(
              "area"
            ) || "";


          return sendHtml(
            res,
            assistantPage(
              lang,
              area
            )
          );

        }


        if (
          req.method === "GET" &&
          pathname === "/questionnaire"
        ) {

          return sendHtml(
            res,
            questionnairePage(
              lang
            )
          );

        }


        if (
          req.method === "GET" &&
          pathname === "/sources"
        ) {

          return sendHtml(
            res,
            sourcesPage(
              lang
            )
          );

        }


        if (
          req.method === "GET" &&
          pathname === "/documents"
        ) {

          return sendHtml(
            res,
            documentsPage(
              lang
            )
          );

        }


        if (
          req.method === "GET" &&
          pathname === "/claim"
        ) {

          const type =
            url.searchParams.get(
              "type"
            ) || "";


          return sendHtml(
            res,
            claimPage(
              lang,
              type
            )
          );

        }


        if (
          req.method === "GET" &&
          pathname === "/calculators"
        ) {

          return sendHtml(
            res,
            calculatorsPage(
              lang
            )
          );

        }


        if (
          req.method === "GET" &&
          pathname === "/court"
        ) {

          return sendHtml(
            res,
            courtPage(
              lang
            )
          );

        }


// ======================================================
// POST — AI RESULT
// ======================================================

        if (
          req.method === "POST" &&
          pathname === "/ai-result"
        ) {

          const form =
            await readForm(req);


          const html =
            await aiResultPage(
              lang,
              form
            );


          return sendHtml(
            res,
            html
          );

        }


// ======================================================
// POST — QUESTIONNAIRE RESULT
// ======================================================

        if (
          req.method === "POST" &&
          pathname ===
            "/questionnaire-result"
        ) {

          const form =
            await readForm(req);


          const html =
            await questionnaireResultPage(
              lang,
              form
            );


          return sendHtml(
            res,
            html
          );

        }


// ======================================================
// POST — DOCUMENT RESULT
// ======================================================

        if (
          req.method === "POST" &&
          pathname ===
            "/claim-result"
        ) {

          const form =
            await readForm(req);


          const html =
            await claimResultPage(
              lang,
              form
            );


          return sendHtml(
            res,
            html
          );

        }


// ======================================================
// API — AI
// ======================================================

        if (
          req.method === "POST" &&
          pathname === "/api/ai"
        ) {

          const data =
            await readJson(req);


          const question =
            String(
              data.question || ""
            ).trim();


          const context =
            String(
              data.context || ""
            ).trim();


          if (!question) {

            return sendJson(
              res,
              {
                ok: false,
                error:
                  "QUESTION_REQUIRED"
              },
              400
            );

          }


          const answer =
            await callAI(
              question,
              lang,
              context
            );


          return sendJson(
            res,
            {
              ok: true,
              answer
            }
          );

        }


// ======================================================
// HEALTH CHECK
// ======================================================

        if (
          req.method === "GET" &&
          pathname === "/health"
        ) {

          return sendJson(
            res,
            {
              ok: true,
              service:
                "Huquqiy AI",

              timestamp:
                new Date()
                  .toISOString()
            }
          );

        }


// ======================================================
// 404
// ======================================================

        return sendHtml(
          res,
          notFoundPage(lang),
          404
        );


      } catch (error) {

        console.error(
          "SERVER ERROR:",
          error
        );


        const status =
          error?.message ===
          "REQUEST_TOO_LARGE"
            ? 413
            : 500;


        return sendHtml(
          res,
          `
            <!DOCTYPE html>

            <html lang="uz">

            <head>

              <meta charset="UTF-8">

              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
              >

              <title>
                Huquqiy AI — Server xatosi
              </title>

              <style>

                body{
                  margin:0;
                  min-height:100vh;
                  display:grid;
                  place-items:center;
                  padding:25px;
                  box-sizing:border-box;
                  background:#f4f6f8;
                  color:#263d55;
                  font-family:Arial,sans-serif;
                }

                .errorBox{
                  width:min(600px,100%);
                  padding:30px;
                  box-sizing:border-box;
                  background:#fff;
                  border:1px solid #dfe5ea;
                  border-radius:15px;
                  box-shadow:
                    0 18px 50px
                    rgba(6,17,31,.08);
                }

                h1{
                  margin:
                    0 0 10px;
                  color:#071522;
                  font-family:Georgia,serif;
                }

                p{
                  line-height:1.7;
                }

              </style>

            </head>

            <body>

              <div class="errorBox">

                <h1>
                  Serverda xatolik yuz berdi
                </h1>

                <p>
                  ${
                    status === 413
                      ? "Yuborilgan ma’lumot hajmi juda katta."
                      : "So‘rovni bajarishda server xatosi yuz berdi."
                  }
                </p>

              </div>

            </body>

            </html>
          `,
          status
        );

      }

    }
  );


// ======================================================
// START SERVER
// ======================================================

server.listen(
  PORT,
  () => {

    console.log(
      `Huquqiy AI server running on port ${PORT}`
    );

  }
);


// ======================================================
// END OF HUQUQIY AI
// ======================================================
