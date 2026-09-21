require("dotenv").config();

const http = require("http");
const querystring = require("querystring");

const PORT = process.env.PORT || 3000;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const AI_MODEL = process.env.AI_MODEL || "openrouter/free";
const STT_MODEL = process.env.STT_MODEL || "openai/whisper-1";


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


async function readBody(req, maxBytes = 15 * 1024 * 1024) {
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
  const raw = await readBody(req, 2 * 1024 * 1024);
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
// TILLAR
// ======================================================

const UI = {
  uz: {
    brand: "Huquqiy AI",
    home: "Bosh sahifa",
    assistant: "Huquqiy yordamchi",
    questionnaire: "Savol-javob",
    sources: "Qonun manbalari",
    documents: "Hujjatlar",
    court: "Sud",
    calculators: "Hisob-kitob",
    start: "Boshlash",
    analyze: "Huquqiy tahlil qilish",
    back: "Orqaga",
    next: "Davom etish"
  },

  ru: {
    brand: "Huquqiy AI",
    home: "Главная",
    assistant: "Юридический помощник",
    questionnaire: "Вопросы",
    sources: "Правовые источники",
    documents: "Документы",
    court: "Суд",
    calculators: "Расчёты",
    start: "Начать",
    analyze: "Провести правовой анализ",
    back: "Назад",
    next: "Продолжить"
  },

  en: {
    brand: "Huquqiy AI",
    home: "Home",
    assistant: "Legal assistant",
    questionnaire: "Questionnaire",
    sources: "Legal sources",
    documents: "Documents",
    court: "Court",
    calculators: "Calculators",
    start: "Start",
    analyze: "Analyze legal situation",
    back: "Back",
    next: "Continue"
  }
};


function tr(lang, key) {
  lang = getLang(lang);
  return UI[lang][key] || UI.uz[key] || key;
}


// ======================================================
// AI
// ======================================================

async function callAI(question, lang = "uz", context = "") {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY topilmadi.");
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
   PROBLEM → QUESTIONS → FACTS → LEGAL ANALYSIS →
   SOURCES → OPTIONS → NEXT STEPS → DOCUMENTS.

10. Clearly state when current law should be verified before reliance.
`;

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",

      headers: {
        Authorization: "Bearer " + OPENROUTER_API_KEY,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.SITE_URL ||
          "https://huquqiy-ai-backend.onrender.com",
        "X-Title": "Huquqiy AI"
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
                    "Collected case information:\n" + context
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
    console.error("OpenRouter error:", data);

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
// VOICE — OPENROUTER SPEECH TO TEXT
// ======================================================

async function transcribeAudio(
  audioBase64,
  format = "webm",
  lang = "uz"
) {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY topilmadi.");
  }

  if (!audioBase64) {
    throw new Error("Audio topilmadi.");
  }

  const allowedFormats = new Set([
    "wav",
    "mp3",
    "flac",
    "m4a",
    "ogg",
    "webm",
    "aac"
  ]);

  format = String(format || "webm")
    .toLowerCase()
    .replace(".", "");

  if (!allowedFormats.has(format)) {
    format = "webm";
  }

  const body = {
    model: STT_MODEL,

    input_audio: {
      data: audioBase64,
      format
    }
  };

  // Uzbek can be auto-detected.
  // For Russian and English a hint can improve recognition.
  if (lang === "ru") body.language = "ru";
  if (lang === "en") body.language = "en";

  const response = await fetch(
    "https://openrouter.ai/api/v1/audio/transcriptions",
    {
      method: "POST",

      headers: {
        Authorization: "Bearer " + OPENROUTER_API_KEY,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.SITE_URL ||
          "https://huquqiy-ai-backend.onrender.com",
        "X-Title": "Huquqiy AI"
      },

      body: JSON.stringify(body)
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Transcription error:", data);

    throw new Error(
      data?.error?.message ||
      "Ovozni matnga aylantirib bo‘lmadi."
    );
  }

  return String(data?.text || "").trim();
}


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
    name: "O‘zbekiston Respublikasi Oliy sudi",
    url: "https://sud.uz",

    description: {
      uz:
        "Sud amaliyoti va Oliy sudga oid rasmiy ma’lumotlar.",
      ru:
        "Официальная информация Верховного суда и судебная практика.",
      en:
        "Official Supreme Court information and court practice."
    }
  },

  {
    id: "mysud",
    name: "my.sud.uz",
    url: "https://my.sud.uz",

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
      uz: "Nikohdan ajratish",
      ru: "Расторжение брака",
      en: "Divorce"
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
      uz: "Aliment",
      ru: "Алименты",
      en: "Child support"
    },

    description: {
      uz:
        "Farzandlar, daromad va aliment bilan bog‘liq vaziyat.",
      ru:
        "Дети, доход и вопросы выплаты алиментов.",
      en:
        "Children, income and child-support issues."
    }
  },

  {
    id: "children",
    icon: "◇",
    title: {
      uz: "Farzandlar",
      ru: "Дети",
      en: "Children"
    },

    description: {
      uz:
        "Yashash joyi, ota-ona huquqlari va bolaning manfaatlari.",
      ru:
        "Место проживания, права родителей и интересы ребёнка.",
      en:
        "Residence, parental rights and the child's interests."
    }
  },

  {
    id: "property",
    icon: "⌂",
    title: {
      uz: "Mol-mulk",
      ru: "Имущество",
      en: "Property"
    },

    description: {
      uz:
        "Nikoh davridagi mol-mulk va uni bo‘lish masalalari.",
      ru:
        "Совместное имущество супругов и его раздел.",
      en:
        "Marital property and division issues."
    }
  },

  {
    id: "inheritance",
    icon: "§",
    title: {
      uz: "Meros",
      ru: "Наследство",
      en: "Inheritance"
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
    id: "labour",
    icon: "▤",
    title: {
      uz: "Mehnat huquqi",
      ru: "Трудовое право",
      en: "Employment"
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
      uz: "Uy-joy",
      ru: "Жилищные вопросы",
      en: "Housing"
    },

    description: {
      uz:
        "Uy-joydan foydalanish, mulk va boshqa nizolar.",
      ru:
        "Пользование жильём, собственность и другие споры.",
      en:
        "Housing use, ownership and related disputes."
    }
  },

  {
    id: "consumer",
    icon: "✓",
    title: {
      uz: "Iste’molchi huquqlari",
      ru: "Права потребителей",
      en: "Consumer rights"
    },

    description: {
      uz:
        "Tovar, xizmat, pulni qaytarish va iste’molchi nizolari.",
      ru:
        "Товары, услуги, возврат средств и потребительские споры.",
      en:
        "Goods, services, refunds and consumer disputes."
    }
  }
];


// ======================================================
// OILAVIY HUQUQ — SAVOL-JAVOB DARAXTI
// ======================================================

const FAMILY_QUESTIONS = [
  {
    id: "marriage_registered",
    type: "yesno",

    question: {
      uz:
        "Nikohingiz FHDYO organida rasman qayd etilganmi?",
      ru:
        "Ваш брак официально зарегистрирован в органах ЗАГС?",
      en:
        "Is your marriage officially registered?"
    }
  },

  {
    id: "marriage_date",
    type: "date",

    question: {
      uz: "Nikoh qachon qayd etilgan?",
      ru: "Когда был зарегистрирован брак?",
      en: "When was the marriage registered?"
    }
  },

  {
    id: "marriage_place",
    type: "text",

    question: {
      uz:
        "Nikoh qayerda qayd etilgan? Shahar/tuman va FHDYO bo‘limini yozing.",
      ru:
        "Где был зарегистрирован брак? Укажите город/район и орган ЗАГС.",
      en:
        "Where was the marriage registered? Enter the city/district and registry office."
    }
  },

  {
    id: "divorce_consent",
    type: "select",

    options: {
      uz: [
        "Ikkalamiz ham rozimiz",
        "Faqat men roziman",
        "Turmush o‘rtog‘im rozi, men rozi emasman",
        "Hozircha noma’lum"
      ],

      ru: [
        "Мы оба согласны",
        "Согласен(на) только я",
        "Супруг(а) согласен(на), я не согласен(на)",
        "Пока неизвестно"
      ],

      en: [
        "We both agree",
        "Only I agree",
        "My spouse agrees, I do not",
        "Not known yet"
      ]
    },

    question: {
      uz:
        "Nikohdan ajralishga ikki tomonning munosabati qanday?",
      ru:
        "Как стороны относятся к расторжению брака?",
      en:
        "What is each spouse's position on divorce?"
    }
  },

  {
    id: "reason",
    type: "textarea",

    question: {
      uz:
        "Nikohdan ajralishning asosiy sababini qisqacha tushuntiring.",
      ru:
        "Кратко опишите основную причину расторжения брака.",
      en:
        "Briefly describe the main reason for the divorce."
    }
  },

  {
    id: "reconciliation",
    type: "select",

    options: {
      uz: [
        "Yarashish mumkin",
        "Yarashish ehtimoli juda kam",
        "Yarashish mumkin emas",
        "Bilmayman"
      ],

      ru: [
        "Примирение возможно",
        "Вероятность примирения мала",
        "Примирение невозможно",
        "Не знаю"
      ],

      en: [
        "Reconciliation is possible",
        "Reconciliation is unlikely",
        "Reconciliation is not possible",
        "I do not know"
      ]
    },

    question: {
      uz:
        "Sizningcha oilani saqlab qolish yoki yarashish imkoniyati bormi?",
      ru:
        "Есть ли, по вашему мнению, возможность сохранить семью или примириться?",
      en:
        "Do you believe reconciliation or preserving the family is possible?"
    }
  },

  {
    id: "children",
    type: "yesno",

    question: {
      uz:
        "Voyaga yetmagan farzandlaringiz bormi?",
      ru:
        "Есть ли у вас несовершеннолетние дети?",
      en:
        "Do you have minor children?"
    }
  },

  {
    id: "children_details",
    type: "textarea",
    showIf: {
      field: "children",
      equals: "yes"
    },

    question: {
      uz:
        "Farzandlar soni va har birining yoshini yozing.",
      ru:
        "Укажите количество детей и возраст каждого.",
      en:
        "Enter the number of children and each child's age."
    }
  },

  {
    id: "children_residence",
    type: "textarea",
    showIf: {
      field: "children",
      equals: "yes"
    },

    question: {
      uz:
        "Farzandlar hozir kim bilan yashaydi va kelajakda kim bilan yashashi bo‘yicha nizo bormi?",
      ru:
        "С кем сейчас живут дети и есть ли спор о том, с кем они будут проживать?",
      en:
        "Who do the children currently live with, and is there a dispute over their future residence?"
    }
  },

  {
    id: "aliment_needed",
    type: "yesno",
    showIf: {
      field: "children",
      equals: "yes"
    },

    question: {
      uz:
        "Aliment masalasini ham hal qilish kerakmi?",
      ru:
        "Необходимо ли также решить вопрос об алиментах?",
      en:
        "Does child support also need to be resolved?"
    }
  },

  {
    id: "payer_job",
    type: "text",
    showIf: {
      field: "aliment_needed",
      equals: "yes"
    },

    question: {
      uz:
        "Aliment to‘lashi mumkin bo‘lgan shaxsning ish joyi ma’lummi?",
      ru:
        "Известно ли место работы лица, которое может выплачивать алименты?",
      en:
        "Is the potential child-support payer's workplace known?"
    }
  },

  {
    id: "payer_income",
    type: "text",
    showIf: {
      field: "aliment_needed",
      equals: "yes"
    },

    question: {
      uz:
        "Uning taxminiy yoki rasmiy oylik daromadi qancha?",
      ru:
        "Каков его/её примерный или официальный ежемесячный доход?",
      en:
        "What is their approximate or official monthly income?"
    }
  },

  {
    id: "property_dispute",
    type: "yesno",

    question: {
      uz:
        "Nikoh davomida orttirilgan mol-mulk bo‘yicha nizo bormi?",
      ru:
        "Есть ли спор по имуществу, приобретённому в браке?",
      en:
        "Is there a dispute concerning property acquired during the marriage?"
    }
  },

  {
    id: "property_details",
    type: "textarea",
    showIf: {
      field: "property_dispute",
      equals: "yes"
    },

    question: {
      uz:
        "Mol-mulklarni sanab chiqing: uy, avtomobil, jamg‘arma yoki boshqa aktivlar. Kimning nomida ekanini ham yozing.",
      ru:
        "Перечислите имущество: жильё, автомобиль, сбережения или другие активы. Укажите, на кого они оформлены.",
      en:
        "List the property: home, vehicle, savings or other assets, and state whose name each is registered under."
    }
  },

  {
    id: "property_acquisition",
    type: "textarea",
    showIf: {
      field: "property_dispute",
      equals: "yes"
    },

    question: {
      uz:
        "Ushbu mol-mulklar qachon va qanday mablag‘ hisobidan olingan?",
      ru:
        "Когда и за счёт каких средств было приобретено это имущество?",
      en:
        "When was this property acquired and what funds were used?"
    }
  },

  {
    id: "marriage_contract",
    type: "yesno",

    question: {
      uz:
        "Nikoh shartnomasi mavjudmi?",
      ru:
        "Есть ли брачный договор?",
      en:
        "Is there a prenuptial or marital agreement?"
    }
  },

  {
    id: "marriage_contract_details",
    type: "textarea",
    showIf: {
      field: "marriage_contract",
      equals: "yes"
    },

    question: {
      uz:
        "Nikoh shartnomasining muhim shartlarini qisqacha yozing.",
      ru:
        "Кратко укажите существенные условия брачного договора.",
      en:
        "Briefly describe the important terms of the marital agreement."
    }
  },

  {
    id: "safety_issue",
    type: "yesno",

    question: {
      uz:
        "Oilada zo‘ravonlik, tahdid yoki xavfsizlik bilan bog‘liq holat mavjudmi?",
      ru:
        "Есть ли в семье насилие, угрозы или иные проблемы безопасности?",
      en:
        "Is there domestic violence, threats or another safety concern?"
    }
  }
];


// ======================================================
// SAVOLNI TILGA MOS OLISH
// ======================================================

function localized(value, lang) {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  return (
    value[getLang(lang)] ||
    value.uz ||
    ""
  );
}


// ======================================================
// ISH KARTASI
// ======================================================

function buildCaseSummary(answers, lang) {
  const lines = [];

  for (const item of FAMILY_QUESTIONS) {
    const value = answers[item.id];

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      continue;
    }

    lines.push(
      localized(item.question, lang) +
        "\nJavob: " +
        String(value)
    );
  }

  return lines.join("\n\n");
}
// ======================================================
// 2/4 — HUQUQIY AI PROFESSIONAL DIZAYN
// ======================================================

const CSS = `
*{
  box-sizing:border-box;
}

:root{
  --navy:#091d33;
  --navy2:#102a47;
  --navy3:#173a60;

  --gold:#b89150;
  --gold2:#d0ad6b;
  --goldSoft:#faf5eb;

  --blue:#2c5d9c;
  --blueSoft:#eef4fb;

  --green:#16745a;
  --greenSoft:#eef8f4;

  --red:#a94747;
  --redSoft:#fff2f2;

  --bg:#f6f7f9;
  --surface:#ffffff;

  --text:#17283b;
  --muted:#718093;

  --line:#e1e6eb;
  --line2:#d3dae2;

  --shadow:
    0 16px 45px rgba(9,29,51,.08);

  --shadowStrong:
    0 30px 75px rgba(9,29,51,.13);
}

html{
  scroll-behavior:smooth;
}

body{
  margin:0;
  background:var(--bg);
  color:var(--text);

  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Arial,
    sans-serif;

  -webkit-font-smoothing:antialiased;
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

button,
a{
  -webkit-tap-highlight-color:transparent;
}

/* ======================================================
   NAVIGATION
====================================================== */

.nav{
  position:sticky;
  top:0;
  z-index:100;

  height:72px;

  background:
    rgba(255,255,255,.96);

  backdrop-filter:
    blur(16px);

  border-bottom:
    1px solid rgba(215,222,229,.9);
}

.navin{
  width:min(1240px,92%);
  height:100%;

  margin:auto;

  display:flex;
  align-items:center;
  justify-content:space-between;

  gap:25px;
}

.brand{
  display:flex;
  align-items:center;
  gap:11px;
}

.brandMark{
  width:37px;
  height:37px;

  display:grid;
  place-items:center;

  background:var(--navy);
  color:var(--gold2);

  border-radius:8px;

  font-family:
    Georgia,
    "Times New Roman",
    serif;

  font-size:19px;
}

.brandText{
  display:flex;
  flex-direction:column;
}

.brandText strong{
  color:var(--navy);

  font-family:
    Georgia,
    "Times New Roman",
    serif;

  font-size:18px;
  font-weight:600;

  letter-spacing:-.3px;
}

.brandText small{
  margin-top:1px;

  color:#8995a2;

  font-size:8px;
  font-weight:700;

  letter-spacing:1.2px;
}

.navlinks{
  display:flex;
  align-items:center;
  gap:5px;
}

.navlinks a{
  padding:9px 11px;

  color:#526276;

  border-radius:7px;

  font-size:11px;
  font-weight:650;

  transition:.16s;
}

.navlinks a:hover{
  color:var(--navy);
  background:#f1f4f7;
}

.navRight{
  display:flex;
  align-items:center;
  gap:9px;
}

.languages{
  display:flex;

  padding:3px;

  border:
    1px solid var(--line);

  border-radius:8px;

  background:#f8f9fb;
}

.languages a{
  padding:6px 8px;

  color:#7b8795;

  border-radius:5px;

  font-size:9px;
  font-weight:800;
}

.languages a.active{
  color:white;
  background:var(--navy);
}

.mobileMenu{
  display:none;

  width:38px;
  height:38px;

  border:
    1px solid var(--line);

  border-radius:7px;

  background:white;

  color:var(--navy);

  cursor:pointer;
}


/* ======================================================
   GENERAL
====================================================== */

.container{
  width:min(1200px,92%);
  margin:auto;
}

.eyebrow{
  display:inline-flex;
  align-items:center;
  gap:7px;

  padding:7px 10px;

  color:#88662f;

  background:var(--goldSoft);

  border:
    1px solid #e8d7b6;

  border-radius:6px;

  font-size:9px;
  font-weight:800;

  letter-spacing:1.1px;
}

.sectionTitle{
  margin:8px 0 0;

  color:var(--navy);

  font-family:
    Georgia,
    "Times New Roman",
    serif;

  font-size:34px;
  font-weight:500;

  letter-spacing:-.8px;
}

.sectionText{
  max-width:520px;

  color:var(--muted);

  font-size:12px;
  line-height:1.7;
}

.sectionHead{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;

  gap:30px;

  margin-bottom:30px;
}


/* ======================================================
   BUTTONS
====================================================== */

.btn{
  min-height:47px;

  padding:11px 18px;

  display:inline-flex;
  align-items:center;
  justify-content:center;

  gap:8px;

  border:0;
  border-radius:8px;

  cursor:pointer;

  font-size:11px;
  font-weight:750;

  transition:
    transform .16s,
    box-shadow .16s,
    background .16s;
}

.btn:hover{
  transform:translateY(-1px);
}

.btnPrimary{
  color:white;
  background:var(--navy);

  box-shadow:
    0 10px 24px rgba(9,29,51,.14);
}

.btnPrimary:hover{
  background:var(--navy2);
}

.btnOutline{
  color:var(--navy);

  background:white;

  border:
    1px solid var(--line2);
}

.btnGold{
  color:#172536;

  background:#d4b270;
}


/* ======================================================
   HERO
====================================================== */

.hero{
  position:relative;

  overflow:hidden;

  background:
    linear-gradient(
      180deg,
      #ffffff 0%,
      #f7f8fa 100%
    );
}

.hero::before{
  content:"";

  position:absolute;

  width:520px;
  height:520px;

  top:-280px;
  right:-150px;

  border:
    1px solid rgba(184,145,80,.13);

  border-radius:50%;
}

.heroInner{
  min-height:620px;

  display:grid;

  grid-template-columns:
    1.05fr .95fr;

  align-items:center;

  gap:75px;

  padding:
    65px 0 75px;
}

.heroCopy{
  position:relative;
  z-index:2;
}

.hero h1{
  max-width:720px;

  margin:
    20px 0 20px;

  color:var(--navy);

  font-family:
    Georgia,
    "Times New Roman",
    serif;

  font-size:
    clamp(42px,5vw,62px);

  line-height:1.05;

  font-weight:500;

  letter-spacing:-2px;
}

.hero h1 span{
  display:block;

  margin-top:5px;

  color:#355f93;
}

.heroDescription{
  max-width:650px;

  margin:0;

  color:#68798c;

  font-size:14px;
  line-height:1.8;
}

.heroActions{
  display:flex;
  flex-wrap:wrap;

  gap:10px;

  margin-top:28px;
}

.heroTrust{
  display:flex;
  flex-wrap:wrap;

  gap:18px;

  margin-top:30px;
}

.heroTrust span{
  display:flex;
  align-items:center;

  gap:6px;

  color:#748295;

  font-size:9px;
  font-weight:650;
}

.heroTrust i{
  width:18px;
  height:18px;

  display:grid;
  place-items:center;

  color:#97743d;

  background:#faf5eb;

  border-radius:50%;

  font-style:normal;
}


/* ======================================================
   LEGAL ROADMAP
====================================================== */

.roadmap{
  position:relative;
  z-index:2;

  padding:28px;

  background:white;

  border:
    1px solid var(--line);

  border-radius:14px;

  box-shadow:var(--shadowStrong);
}

.roadmapHeader{
  display:flex;
  align-items:center;
  justify-content:space-between;

  padding-bottom:18px;

  border-bottom:
    1px solid #e9edf1;
}

.roadmapHeader small{
  display:block;

  margin-bottom:4px;

  color:#a17c40;

  font-size:8px;
  font-weight:800;

  letter-spacing:1.1px;
}

.roadmapHeader strong{
  color:var(--navy);

  font-family:
    Georgia,
    serif;

  font-size:20px;
}

.roadmapBadge{
  padding:5px 8px;

  color:#31725f;

  background:#edf8f4;

  border-radius:5px;

  font-size:8px;
  font-weight:800;
}

.roadStep{
  position:relative;

  display:grid;

  grid-template-columns:
    37px 1fr;

  gap:15px;

  padding:18px 0;

  border-bottom:
    1px solid #edf0f3;
}

.roadStep:last-child{
  padding-bottom:0;
  border-bottom:0;
}

.roadNumber{
  width:35px;
  height:35px;

  display:grid;
  place-items:center;

  background:#f2f5f8;

  border:
    1px solid #e2e7ec;

  border-radius:50%;

  color:#46617e;

  font-family:
    Georgia,
    serif;

  font-size:10px;
}

.roadStep strong{
  display:block;

  margin-bottom:4px;

  color:#20364f;

  font-size:11px;
}

.roadStep p{
  margin:0;

  color:#7a8796;

  font-size:10px;
  line-height:1.55;
}


/* ======================================================
   QUICK START
====================================================== */

.quickSection{
  padding:
    75px 0 30px;
}

.quickBox{
  display:grid;

  grid-template-columns:
    1fr auto;

  align-items:center;

  gap:30px;

  padding:28px 32px;

  background:var(--navy);

  border-radius:13px;

  box-shadow:
    0 18px 50px rgba(9,29,51,.13);
}

.quickBox small{
  color:#d0ad6b;

  font-size:8px;
  font-weight:800;

  letter-spacing:1.1px;
}

.quickBox h2{
  margin:
    7px 0 7px;

  color:white;

  font-family:
    Georgia,
    serif;

  font-size:25px;
  font-weight:500;
}

.quickBox p{
  max-width:650px;

  margin:0;

  color:#b9c5d2;

  font-size:11px;
  line-height:1.65;
}


/* ======================================================
   SERVICES
====================================================== */

.services{
  padding:
    70px 0 80px;
}

.serviceGrid{
  display:grid;

  grid-template-columns:
    repeat(4,1fr);

  gap:13px;
}

.serviceCard{
  position:relative;

  min-height:225px;

  padding:22px;

  overflow:hidden;

  background:white;

  border:
    1px solid var(--line);

  border-radius:10px;

  transition:.2s;
}

.serviceCard:hover{
  transform:
    translateY(-4px);

  border-color:#bac6d2;

  box-shadow:var(--shadow);
}

.serviceNo{
  position:absolute;

  top:14px;
  right:17px;

  color:rgba(9,29,51,.07);

  font-family:
    Georgia,
    serif;

  font-size:32px;
}

.serviceIcon{
  width:42px;
  height:42px;

  display:grid;
  place-items:center;

  margin-bottom:23px;

  color:#173b60;

  background:#f5f7f9;

  border:
    1px solid #e0e5ea;

  border-radius:7px;

  font-family:
    Georgia,
    serif;

  font-size:16px;
}

.serviceCard h3{
  margin:
    0 0 9px;

  color:var(--navy);

  font-family:
    Georgia,
    serif;

  font-size:17px;
  font-weight:600;
}

.serviceCard p{
  margin:0;

  color:#788696;

  font-size:10px;
  line-height:1.65;
}

.serviceArrow{
  position:absolute;

  right:20px;
  bottom:18px;

  color:#a27b3e;

  font-size:17px;
}


/* ======================================================
   CORE SYSTEM
====================================================== */

.coreSection{
  padding:
    75px 0;

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

  border-radius:11px;
}

.coreItem{
  min-height:190px;

  padding:24px;

  background:white;
}

.coreItem span{
  display:block;

  margin-bottom:28px;

  color:#aa8346;

  font-family:
    Georgia,
    serif;

  font-size:19px;
}

.coreItem strong{
  display:block;

  margin-bottom:7px;

  color:var(--navy);

  font-size:11px;
}

.coreItem p{
  margin:0;

  color:#7b8998;

  font-size:10px;
  line-height:1.6;
}


/* ======================================================
   OFFICIAL SOURCES
====================================================== */

.sourcesSection{
  padding:
    80px 0;
}

.sourcesGrid{
  display:grid;

  grid-template-columns:
    repeat(3,1fr);

  gap:13px;
}

.sourceCard{
  min-height:120px;

  padding:19px;

  display:grid;

  grid-template-columns:
    43px 1fr auto;

  align-items:center;

  gap:14px;

  background:white;

  border:
    1px solid var(--line);

  border-radius:9px;

  transition:.18s;
}

.sourceCard:hover{
  border-color:#b7c3cf;

  box-shadow:
    0 12px 32px rgba(9,29,51,.07);
}

.sourceIcon{
  width:43px;
  height:43px;

  display:grid;
  place-items:center;

  background:var(--navy);

  color:#d3b170;

  border-radius:7px;

  font-family:
    Georgia,
    serif;

  font-size:18px;
}

.sourceCard strong{
  display:block;

  margin-bottom:4px;

  color:var(--navy);

  font-size:11px;
}

.sourceCard p{
  margin:0;

  color:#7b8795;

  font-size:9px;
  line-height:1.55;
}

.sourceArrow{
  color:#9b773e;
}


/* ======================================================
   DISCLAIMER
====================================================== */

.legalNotice{
  margin-bottom:80px;

  padding:20px 22px;

  display:flex;

  gap:14px;

  background:#fbfaf7;

  border:
    1px solid #e8dfcf;

  border-radius:9px;
}

.legalNoticeIcon{
  width:35px;
  height:35px;

  flex:0 0 35px;

  display:grid;
  place-items:center;

  color:#8e6a31;

  background:#f6eddd;

  border-radius:7px;

  font-family:
    Georgia,
    serif;
}

.legalNotice strong{
  display:block;

  margin-bottom:4px;

  color:#584a35;

  font-size:10px;
}

.legalNotice p{
  margin:0;

  color:#837761;

  font-size:9px;
  line-height:1.55;
}


/* ======================================================
   FOOTER
====================================================== */

.footer{
  padding:
    35px 0;

  background:#07192b;

  border-top:
    1px solid #142b42;
}

.footerInner{
  display:flex;

  justify-content:space-between;
  align-items:center;

  gap:30px;
}

.footerBrand strong{
  color:white;

  font-family:
    Georgia,
    serif;

  font-size:16px;
}

.footerBrand p{
  margin:
    5px 0 0;

  color:#778a9d;

  font-size:9px;
}

.footerLinks{
  display:flex;
  gap:15px;
}

.footerLinks a{
  color:#9aa9b8;

  font-size:9px;
}

.footerLinks a:hover{
  color:white;
}


/* ======================================================
   APP PAGES
====================================================== */

.appLayout{
  width:min(1200px,94%);

  margin:
    35px auto 70px;

  display:grid;

  grid-template-columns:
    225px 1fr;

  gap:25px;
}

.sidebar{
  height:max-content;

  position:sticky;
  top:95px;

  padding:13px;

  background:white;

  border:
    1px solid var(--line);

  border-radius:10px;
}

.sideTitle{
  padding:
    10px 10px 13px;

  color:#8a96a3;

  font-size:8px;
  font-weight:800;

  letter-spacing:1px;
}

.sideLink{
  min-height:39px;

  padding:9px 10px;

  display:flex;
  align-items:center;

  gap:9px;

  color:#647488;

  border-radius:6px;

  font-size:10px;
  font-weight:650;
}

.sideLink:hover{
  color:var(--navy);
  background:#f3f5f7;
}

.sideLink.active{
  color:var(--navy);
  background:#eef2f6;
}

.pageHead{
  margin-bottom:20px;
}

.pageHead small{
  color:#9c783e;

  font-size:8px;
  font-weight:800;

  letter-spacing:1px;
}

.pageHead h1{
  margin:
    7px 0 7px;

  color:var(--navy);

  font-family:
    Georgia,
    serif;

  font-size:32px;
  font-weight:500;
}

.pageHead p{
  max-width:700px;

  margin:0;

  color:#778597;

  font-size:11px;
  line-height:1.65;
}

.surface{
  padding:26px;

  background:white;

  border:
    1px solid var(--line);

  border-radius:11px;

  box-shadow:
    0 9px 28px rgba(9,29,51,.04);
}


/* ======================================================
   FORMS
====================================================== */

.field{
  margin-bottom:18px;
}

.field label{
  display:block;

  margin-bottom:7px;

  color:#35495f;

  font-size:10px;
  font-weight:750;
}

.field input,
.field textarea,
.field select{
  width:100%;

  padding:
    12px 13px;

  color:#26384c;

  background:white;

  border:
    1px solid #d6dde5;

  border-radius:8px;

  outline:0;

  font-size:12px;

  transition:.16s;
}

.field textarea{
  min-height:130px;

  resize:vertical;

  line-height:1.65;
}

.field input:focus,
.field textarea:focus,
.field select:focus{
  border-color:#8499b0;

  box-shadow:
    0 0 0 4px rgba(42,82,126,.07);
}


/* ======================================================
   MOBILE
====================================================== */

@media(max-width:1000px){

  .navlinks{
    display:none;
  }

  .mobileMenu{
    display:block;
  }

  .heroInner{
    grid-template-columns:1fr;

    gap:40px;

    min-height:auto;

    padding:
      50px 0;
  }

  .serviceGrid{
    grid-template-columns:
      repeat(2,1fr);
  }

  .sourcesGrid{
    grid-template-columns:1fr;
  }

  .coreGrid{
    grid-template-columns:
      repeat(2,1fr);
  }

  .appLayout{
    grid-template-columns:1fr;
  }

  .sidebar{
    position:static;

    display:flex;
    overflow-x:auto;

    gap:4px;
  }

  .sideTitle{
    display:none;
  }

  .sideLink{
    white-space:nowrap;
  }
}


@media(max-width:600px){

  .nav{
    height:64px;
  }

  .navin{
    width:94%;
  }

  .brandMark{
    width:33px;
    height:33px;
  }

  .brandText strong{
    font-size:16px;
  }

  .brandText small{
    display:none;
  }

  .languages a{
    padding:6px;
    font-size:8px;
  }

  .heroInner{
    padding:
      35px 0 45px;
  }

  .hero h1{
    font-size:39px;
    letter-spacing:-1.2px;
  }

  .heroDescription{
    font-size:12px;
  }

  .heroActions{
    flex-direction:column;
  }

  .heroActions .btn{
    width:100%;
  }

  .heroTrust{
    gap:10px;
  }

  .roadmap{
    padding:20px;
  }

  .quickSection{
    padding-top:45px;
  }

  .quickBox{
    grid-template-columns:1fr;

    padding:23px;
  }

  .quickBox .btn{
    width:100%;
  }

  .services{
    padding:
      50px 0;
  }

  .sectionHead{
    display:block;
  }

  .sectionTitle{
    font-size:29px;
  }

  .sectionText{
    margin-top:10px;
  }

  .serviceGrid{
    grid-template-columns:1fr;
  }

  .serviceCard{
    min-height:195px;
  }

  .coreGrid{
    grid-template-columns:1fr;
  }

  .coreItem{
    min-height:160px;
  }

  .sourcesSection{
    padding:
      50px 0;
  }

  .footerInner{
    display:block;
  }

  .footerLinks{
    margin-top:20px;
    flex-wrap:wrap;
  }

  .appLayout{
    width:92%;

    margin-top:22px;
  }

  .surface{
    padding:18px;
  }

  .pageHead h1{
    font-size:27px;
  }
}
`;


// ======================================================
// LANGUAGE MENU
// ======================================================

function languageMenu(lang, path = "/") {
  lang = getLang(lang);

  return `
    <div class="languages">

      <a
        href="${path}?lang=uz"
        class="${lang === "uz" ? "active" : ""}"
      >
        UZ
      </a>

      <a
        href="${path}?lang=ru"
        class="${lang === "ru" ? "active" : ""}"
      >
        RU
      </a>

      <a
        href="${path}?lang=en"
        class="${lang === "en" ? "active" : ""}"
      >
        EN
      </a>

    </div>
  `;
}


// ======================================================
// NAVIGATION
// ======================================================

function navigation(lang, currentPath = "/") {
  lang = getLang(lang);

  return `
    <header class="nav">

      <div class="navin">

        <a
          href="/${q(lang)}"
          class="brand"
        >

          <div class="brandMark">
            §
          </div>

          <div class="brandText">

            <strong>
              Huquqiy AI
            </strong>

            <small>
              DIGITAL LEGAL ASSISTANCE
            </small>

          </div>

        </a>


        <nav class="navlinks">

          <a href="/${q(lang)}">
            ${tr(lang,"home")}
          </a>

          <a href="/questionnaire${q(lang)}">
            ${tr(lang,"questionnaire")}
          </a>

          <a href="/ai${q(lang)}">
            ${tr(lang,"assistant")}
          </a>

          <a href="/sources${q(lang)}">
            ${tr(lang,"sources")}
          </a>

          <a href="/claim${q(lang)}">
            ${tr(lang,"documents")}
          </a>

          <a href="/court${q(lang)}">
            ${tr(lang,"court")}
          </a>

        </nav>


        <div class="navRight">

          ${languageMenu(
            lang,
            currentPath
          )}

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
// LAYOUT
// ======================================================

function layout(
  lang,
  content,
  options = {}
) {
  lang = getLang(lang);

  const path =
    options.path || "/";

  const title =
    options.title ||
    "Huquqiy AI";

  return `
<!DOCTYPE html>

<html lang="${lang}">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <meta
    name="theme-color"
    content="#091d33"
  >

  <meta
    name="description"
    content="Huquqiy AI — raqamli huquqiy yordam platformasi."
  >

  <title>
    ${esc(title)}
  </title>

  <style>
    ${CSS}
  </style>

</head>

<body>

  ${navigation(lang,path)}

  ${content}

</body>

</html>
  `;
}


// ======================================================
// SIDEBAR
// ======================================================

function sidebar(lang, active = "") {
  lang = getLang(lang);

  const item = (
    id,
    href,
    icon,
    title
  ) => `
    <a
      href="${href}"
      class="sideLink ${
        active === id
          ? "active"
          : ""
      }"
    >
      <span>${icon}</span>
      ${title}
    </a>
  `;

  return `
    <aside class="sidebar">

      <div class="sideTitle">
        HUQUQIY XIZMATLAR
      </div>

      ${item(
        "questionnaire",
        "/questionnaire" + q(lang),
        "◇",
        tr(lang,"questionnaire")
      )}

      ${item(
        "ai",
        "/ai" + q(lang),
        "✦",
        tr(lang,"assistant")
      )}

      ${item(
        "sources",
        "/sources" + q(lang),
        "§",
        tr(lang,"sources")
      )}

      ${item(
        "documents",
        "/claim" + q(lang),
        "▤",
        tr(lang,"documents")
      )}

      ${item(
        "court",
        "/court" + q(lang),
        "⚖",
        tr(lang,"court")
      )}

    </aside>
  `;
}


// ======================================================
// HOME PAGE TEXT
// ======================================================

function homeText(lang) {
  lang = getLang(lang);

  const all = {

    uz:{
      eyebrow:
        "RAQAMLI HUQUQIY YORDAM",

      title:
        "Huquqiy vaziyatingizni tushuning.",

      title2:
        "Keyingi qadamni biling.",

      desc:
        "Muammoingizni yozing yoki ovoz orqali tushuntiring. Huquqiy AI kerakli faktlarni aniqlaydi, sizga aniq savollar beradi va vaziyatingiz bo‘yicha huquqiy yo‘lni shakllantiradi.",

      questionnaire:
        "Savol-javobni boshlash",

      freeAI:
        "Muammoni erkin yozish",

      roadmap:
        "Huquqiy yo‘l xaritasi",

      active:
        "Tizimli tahlil",

      r1:
        "Muammoni aniqlash",

      r1d:
        "Huquqiy yo‘nalish va asosiy vaziyat aniqlanadi.",

      r2:
        "Aniq savollar",

      r2d:
        "Javoblaringizga qarab keyingi savollar tanlanadi.",

      r3:
        "Faktlarni yig‘ish",

      r3d:
        "Muhim ma’lumotlardan ish kartasi shakllantiriladi.",

      r4:
        "Huquqiy yechim",

      r4d:
        "Tahlil, manbalar, keyingi qadam va hujjatlar ko‘rsatiladi.",

      quickSmall:
        "QAYERDAN BOSHLASHNI BILMAYSIZMI?",

      quickTitle:
        "Vaziyatingizni oddiy tilda ayting.",

      quickDesc:
        "Huquqiy terminlarni bilishingiz shart emas. Tizim muammoni aniqlashga yordam beradi.",

      quickBtn:
        "Huquqiy yordamchini ochish",

      services:
        "Sizga qanday yordam kerak?",

      servicesDesc:
        "Muammoingizga eng yaqin yo‘nalishni tanlang. Keyingi savollar tanlovingizga moslashadi.",

      process:
        "Oddiy chatbot emas.",

      processDesc:
        "Huquqiy AI avval faktlarni aniqlaydi, keyin huquqiy tahlilga o‘tadi.",

      sources:
        "Rasmiy huquqiy manbalar",

      sourcesDesc:
        "Muhim huquqiy ma’lumotlarni rasmiy manbalar orqali tekshirish imkoniyati.",

      notice:
        "Muhim eslatma",

      noticeText:
        "Huquqiy AI huquqiy ma’lumot va hujjat loyihalarini tayyorlashga yordam beradi. Murakkab yoki yuqori xavfli vaziyatlarda malakali advokat bilan maslahatlashish zarur bo‘lishi mumkin."
    },


    ru:{
      eyebrow:
        "ЦИФРОВАЯ ЮРИДИЧЕСКАЯ ПОМОЩЬ",

      title:
        "Разберитесь в своей правовой ситуации.",

      title2:
        "Поймите следующий шаг.",

      desc:
        "Опишите проблему текстом или голосом. Huquqiy AI уточнит необходимые факты, задаст вопросы и поможет сформировать дальнейший правовой путь.",

      questionnaire:
        "Начать вопросы",

      freeAI:
        "Описать проблему",

      roadmap:
        "Правовая дорожная карта",

      active:
        "Системный анализ",

      r1:
        "Определение проблемы",

      r1d:
        "Определяется правовое направление и основная ситуация.",

      r2:
        "Уточняющие вопросы",

      r2d:
        "Следующие вопросы зависят от ваших ответов.",

      r3:
        "Сбор фактов",

      r3d:
        "Из важных данных формируется карточка ситуации.",

      r4:
        "Правовое решение",

      r4d:
        "Анализ, источники, дальнейшие шаги и документы.",

      quickSmall:
        "НЕ ЗНАЕТЕ, С ЧЕГО НАЧАТЬ?",

      quickTitle:
        "Опишите ситуацию простыми словами.",

      quickDesc:
        "Вам не нужно знать юридические термины. Система поможет определить правовую проблему.",

      quickBtn:
        "Открыть помощника",

      services:
        "Какая помощь вам нужна?",

      servicesDesc:
        "Выберите наиболее подходящее направление. Следующие вопросы будут адаптированы к вашей ситуации.",

      process:
        "Это не просто чат-бот.",

      processDesc:
        "Сначала Huquqiy AI уточняет факты, затем переходит к правовому анализу.",

      sources:
        "Официальные правовые источники",

      sourcesDesc:
        "Возможность проверить важную правовую информацию по официальным источникам.",

      notice:
        "Важное примечание",

      noticeText:
        "Huquqiy AI помогает с правовой информацией и проектами документов. В сложных или высокорисковых ситуациях может потребоваться консультация квалифицированного адвоката."
    },


    en:{
      eyebrow:
        "DIGITAL LEGAL ASSISTANCE",

      title:
        "Understand your legal situation.",

      title2:
        "Know your next step.",

      desc:
        "Describe your problem by text or voice. Huquqiy AI identifies the relevant facts, asks focused questions and helps build a legal path for your situation.",

      questionnaire:
        "Start questionnaire",

      freeAI:
        "Describe the problem",

      roadmap:
        "Legal roadmap",

      active:
        "Structured analysis",

      r1:
        "Identify the problem",

      r1d:
        "The legal area and core situation are identified.",

      r2:
        "Focused questions",

      r2d:
        "The next questions adapt to your answers.",

      r3:
        "Collect facts",

      r3d:
        "Important information is organized into a case profile.",

      r4:
        "Legal options",

      r4d:
        "Analysis, sources, next steps and relevant documents.",

      quickSmall:
        "NOT SURE WHERE TO START?",

      quickTitle:
        "Describe the situation in your own words.",

      quickDesc:
        "You do not need to know legal terminology. The system helps identify the relevant legal issue.",

      quickBtn:
        "Open legal assistant",

      services:
        "How can we help?",

      servicesDesc:
        "Choose the area closest to your problem. The next questions adapt to your situation.",

      process:
        "More than a chatbot.",

      processDesc:
        "Huquqiy AI identifies the facts first and performs legal analysis afterwards.",

      sources:
        "Official legal sources",

      sourcesDesc:
        "Verify important legal information through official resources.",

      notice:
        "Important notice",

      noticeText:
        "Huquqiy AI assists with legal information and document drafts. Complex or high-risk situations may require advice from a qualified lawyer."
    }
  };

  return all[lang];
}


// ======================================================
// HOME PAGE
// ======================================================

function homePage(lang) {
  lang = getLang(lang);

  const t =
    homeText(lang);

  const serviceCards =
    LEGAL_AREAS
      .map(
        (area,index) => `
          <a
            class="serviceCard"
            href="/questionnaire${
              q(lang)
            }&area=${
              encodeURIComponent(
                area.id
              )
            }"
          >

            <span class="serviceNo">
              ${String(
                index + 1
              ).padStart(2,"0")}
            </span>

            <div class="serviceIcon">
              ${area.icon}
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

            <div class="serviceArrow">
              →
            </div>

          </a>
        `
      )
      .join("");


  const sourceCards =
    LEGAL_SOURCES
      .map(
        source => `
          <a
            class="sourceCard"
            href="${source.url}"
            target="_blank"
            rel="noopener noreferrer"
          >

            <div class="sourceIcon">
              §
            </div>

            <div>

              <strong>
                ${esc(source.name)}
              </strong>

              <p>
                ${esc(
                  localized(
                    source.description,
                    lang
                  )
                )}
              </p>

            </div>

            <div class="sourceArrow">
              ↗
            </div>

          </a>
        `
      )
      .join("");


  return layout(
    lang,
    `

    <main>

      <section class="hero">

        <div class="container heroInner">

          <div class="heroCopy">

            <div class="eyebrow">
              § ${t.eyebrow}
            </div>

            <h1>
              ${t.title}

              <span>
                ${t.title2}
              </span>
            </h1>

            <p class="heroDescription">
              ${t.desc}
            </p>


            <div class="heroActions">

              <a
                class="btn btnPrimary"
                href="/questionnaire${q(lang)}"
              >
                ${t.questionnaire}
                →
              </a>

              <a
                class="btn btnOutline"
                href="/ai${q(lang)}"
              >
                ✦ ${t.freeAI}
              </a>

            </div>


            <div class="heroTrust">

              <span>
                <i>✓</i>
                UZ / RU / EN
              </span>

              <span>
                <i>✓</i>
                Savol-javob
              </span>

              <span>
                <i>✓</i>
                Qonun manbalari
              </span>

              <span>
                <i>✓</i>
                Hujjat tayyorlash
              </span>

            </div>

          </div>


          <div class="roadmap">

            <div class="roadmapHeader">

              <div>

                <small>
                  HUQUQIY AI
                </small>

                <strong>
                  ${t.roadmap}
                </strong>

              </div>

              <span class="roadmapBadge">
                ${t.active}
              </span>

            </div>


            ${roadmapStep(
              "01",
              t.r1,
              t.r1d
            )}

            ${roadmapStep(
              "02",
              t.r2,
              t.r2d
            )}

            ${roadmapStep(
              "03",
              t.r3,
              t.r3d
            )}

            ${roadmapStep(
              "04",
              t.r4,
              t.r4d
            )}

          </div>

        </div>

      </section>


      <section class="quickSection">

        <div class="container">

          <div class="quickBox">

            <div>

              <small>
                ${t.quickSmall}
              </small>

              <h2>
                ${t.quickTitle}
              </h2>

              <p>
                ${t.quickDesc}
              </p>

            </div>

            <a
              class="btn btnGold"
              href="/ai${q(lang)}"
            >
              ${t.quickBtn}
              →
            </a>

          </div>

        </div>

      </section>


      <section class="services">

        <div class="container">

          <div class="sectionHead">

            <div>

              <div class="eyebrow">
                HUQUQIY XIZMATLAR
              </div>

              <h2 class="sectionTitle">
                ${t.services}
              </h2>

            </div>

            <p class="sectionText">
              ${t.servicesDesc}
            </p>

          </div>


          <div class="serviceGrid">
            ${serviceCards}
          </div>

        </div>

      </section>


      <section class="coreSection">

        <div class="container">

          <div class="sectionHead">

            <div>

              <div class="eyebrow">
                HUQUQIY AI
              </div>

              <h2 class="sectionTitle">
                ${t.process}
              </h2>

            </div>

            <p class="sectionText">
              ${t.processDesc}
            </p>

          </div>


          <div class="coreGrid">

            ${coreItem(
              "01",
              t.r1,
              t.r1d
            )}

            ${coreItem(
              "02",
              t.r2,
              t.r2d
            )}

            ${coreItem(
              "03",
              t.r3,
              t.r3d
            )}

            ${coreItem(
              "04",
              t.r4,
              t.r4d
            )}

          </div>

        </div>

      </section>


      <section class="sourcesSection">

        <div class="container">

          <div class="sectionHead">

            <div>

              <div class="eyebrow">
                § RASMIY MANBALAR
              </div>

              <h2 class="sectionTitle">
                ${t.sources}
              </h2>

            </div>

            <p class="sectionText">
              ${t.sourcesDesc}
            </p>

          </div>


          <div class="sourcesGrid">
            ${sourceCards}
          </div>

        </div>

      </section>


      <div class="container">

        <div class="legalNotice">

          <div class="legalNoticeIcon">
            !
          </div>

          <div>

            <strong>
              ${t.notice}
            </strong>

            <p>
              ${t.noticeText}
            </p>

          </div>

        </div>

      </div>

    </main>


    ${footer(lang)}

    `,
    {
      path:"/",
      title:"Huquqiy AI"
    }
  );
}


// ======================================================
// SMALL COMPONENTS
// ======================================================

function roadmapStep(
  number,
  title,
  description
) {
  return `
    <div class="roadStep">

      <div class="roadNumber">
        ${number}
      </div>

      <div>

        <strong>
          ${title}
        </strong>

        <p>
          ${description}
        </p>

      </div>

    </div>
  `;
}


function coreItem(
  number,
  title,
  description
) {
  return `
    <div class="coreItem">

      <span>
        ${number}
      </span>

      <strong>
        ${title}
      </strong>

      <p>
        ${description}
      </p>

    </div>
  `;
}


// ======================================================
// FOOTER
// ======================================================

function footer(lang) {
  lang = getLang(lang);

  return `
    <footer class="footer">

      <div class="container footerInner">

        <div class="footerBrand">

          <strong>
            Huquqiy AI
          </strong>

          <p>
            © ${new Date().getFullYear()}
            Digital Legal Assistance
          </p>

        </div>


        <div class="footerLinks">

          <a href="/questionnaire${q(lang)}">
            ${tr(lang,"questionnaire")}
          </a>

          <a href="/sources${q(lang)}">
            ${tr(lang,"sources")}
          </a>

          <a href="/claim${q(lang)}">
            ${tr(lang,"documents")}
          </a>

          <a href="/court${q(lang)}">
            ${tr(lang,"court")}
          </a>

        </div>

      </div>

    </footer>
  `;
}
// ======================================================
// 3/4 — HUQUQIY AI
// SAVOL-JAVOB + AI + MOBIL VOICE
// ======================================================


// ======================================================
// QO'SHIMCHA CSS
// ======================================================

const CSS_APP = `

.questionShell{
  max-width:820px;
}

.questionProgress{
  margin-bottom:22px;
}

.progressTop{
  display:flex;
  justify-content:space-between;
  gap:20px;
  margin-bottom:8px;
  font-size:9px;
  font-weight:750;
  color:#788697;
}

.progressTrack{
  width:100%;
  height:5px;
  overflow:hidden;
  background:#edf0f3;
  border-radius:20px;
}

.progressBar{
  height:100%;
  width:0%;
  background:#b89150;
  border-radius:20px;
  transition:.25s;
}

.questionCard{
  padding:30px;
  background:#fff;
  border:1px solid #e1e6eb;
  border-radius:12px;
  box-shadow:0 14px 40px rgba(9,29,51,.05);
}

.questionNumber{
  margin-bottom:10px;
  color:#a17b3d;
  font-size:9px;
  font-weight:800;
  letter-spacing:1px;
}

.questionTitle{
  margin:0 0 22px;
  color:#091d33;
  font-family:Georgia,serif;
  font-size:25px;
  font-weight:500;
  line-height:1.35;
}

.questionInput input,
.questionInput textarea,
.questionInput select{
  width:100%;
  padding:13px 14px;
  border:1px solid #d7dee6;
  border-radius:8px;
  background:white;
  color:#26394d;
  outline:0;
  font-size:12px;
}

.questionInput textarea{
  min-height:135px;
  resize:vertical;
  line-height:1.65;
}

.questionInput input:focus,
.questionInput textarea:focus,
.questionInput select:focus{
  border-color:#8499b0;
  box-shadow:0 0 0 4px rgba(42,82,126,.07);
}

.choiceGrid{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:10px;
}

.choiceButton{
  min-height:58px;
  padding:12px 14px;
  border:1px solid #dbe1e7;
  border-radius:8px;
  background:#fff;
  color:#405267;
  text-align:left;
  cursor:pointer;
  font-size:11px;
  font-weight:650;
  transition:.16s;
}

.choiceButton:hover{
  border-color:#a9b8c7;
  background:#f8fafb;
}

.choiceButton.selected{
  border-color:#365e88;
  background:#eef4fa;
  color:#173a60;
}

.questionActions{
  display:flex;
  justify-content:space-between;
  gap:10px;
  margin-top:25px;
}

.caseSummary{
  margin-top:20px;
  padding:18px;
  background:#f7f9fb;
  border:1px solid #e1e6eb;
  border-radius:9px;
}

.caseSummary strong{
  display:block;
  margin-bottom:9px;
  color:#0b2036;
  font-size:11px;
}

.caseSummary p{
  margin:0;
  white-space:pre-wrap;
  color:#68798c;
  font-size:10px;
  line-height:1.7;
}


/* AI */

.aiWorkspace{
  max-width:900px;
}

.aiIntro{
  margin-bottom:20px;
}

.aiEditor{
  overflow:hidden;
  background:#fff;
  border:1px solid #d6dde5;
  border-radius:11px;
  transition:.16s;
}

.aiEditor:focus-within{
  border-color:#8297ad;
  box-shadow:0 0 0 4px rgba(42,82,126,.07);
}

.aiEditor textarea{
  display:block;
  width:100%;
  min-height:230px;
  padding:20px;
  border:0;
  outline:0;
  resize:vertical;
  color:#26394c;
  font-size:13px;
  line-height:1.75;
}

.aiEditorBottom{
  min-height:59px;
  padding:10px 12px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  border-top:1px solid #edf0f3;
  background:#fafbfc;
}

.voiceButton{
  min-height:38px;
  padding:8px 13px;
  display:flex;
  align-items:center;
  gap:7px;
  border:1px solid #d7dee5;
  border-radius:7px;
  background:white;
  color:#31475f;
  cursor:pointer;
  font-size:10px;
  font-weight:750;
}

.voiceButton:hover{
  background:#f5f7f9;
}

.voiceButton.recording{
  color:#9b3434;
  border-color:#dba8a8;
  background:#fff2f2;
}

.voicePulse{
  width:9px;
  height:9px;
  border-radius:50%;
  background:#a94747;
  display:none;
}

.voiceButton.recording .voicePulse{
  display:block;
  animation:voicePulse 1s infinite;
}

@keyframes voicePulse{
  0%{
    box-shadow:0 0 0 0 rgba(169,71,71,.35);
  }

  70%{
    box-shadow:0 0 0 8px rgba(169,71,71,0);
  }

  100%{
    box-shadow:0 0 0 0 rgba(169,71,71,0);
  }
}

.voiceTimer{
  color:#9b3434;
  font-size:10px;
  font-weight:750;
}

.voiceStatus{
  min-height:22px;
  margin:11px 2px 16px;
  color:#7a8897;
  font-size:10px;
  line-height:1.5;
}

.aiSubmit{
  width:100%;
}


/* SOURCE PAGE */

.officialSourceList{
  display:grid;
  gap:12px;
}

.officialSourceItem{
  padding:20px;
  display:grid;
  grid-template-columns:45px 1fr auto;
  gap:15px;
  align-items:center;
  background:white;
  border:1px solid #e0e5ea;
  border-radius:9px;
}

.officialSourceItem:hover{
  border-color:#b7c4d0;
}

.officialSourceItem .sourceIcon{
  margin:0;
}

.officialSourceItem h3{
  margin:0 0 5px;
  color:#0b2036;
  font-family:Georgia,serif;
  font-size:16px;
}

.officialSourceItem p{
  margin:0;
  color:#788696;
  font-size:10px;
  line-height:1.6;
}

.officialSourceItem > span{
  color:#9b783e;
  font-size:18px;
}


/* RESULT */

.analysisResult{
  white-space:pre-wrap;
  color:#34485e;
  font-size:12px;
  line-height:1.8;
}

.resultHeader{
  margin-bottom:18px;
  padding-bottom:17px;
  border-bottom:1px solid #e8ecf0;
}

.resultHeader small{
  color:#a17b3d;
  font-size:8px;
  font-weight:800;
  letter-spacing:1px;
}

.resultHeader h2{
  margin:6px 0 0;
  color:#0b2036;
  font-family:Georgia,serif;
  font-size:25px;
  font-weight:500;
}


/* MOBILE */

@media(max-width:600px){

  .questionCard{
    padding:20px;
  }

  .questionTitle{
    font-size:21px;
  }

  .choiceGrid{
    grid-template-columns:1fr;
  }

  .questionActions{
    flex-direction:column-reverse;
  }

  .questionActions .btn{
    width:100%;
  }

  .aiEditor textarea{
    min-height:190px;
    padding:16px;
  }

  .officialSourceItem{
    grid-template-columns:40px 1fr auto;
    padding:15px;
  }
}
`;


// ======================================================
// CSS_APP NI LAYOUTGA QO'SHISH
// ======================================================

function appLayout(
  lang,
  active,
  body,
  title,
  description
){
  lang = getLang(lang);

  return layout(
    lang,
    `
      <style>
        ${CSS_APP}
      </style>

      <div class="appLayout">

        ${sidebar(lang, active)}

        <main>

          <div class="pageHead">

            <small>
              HUQUQIY AI
            </small>

            <h1>
              ${esc(title)}
            </h1>

            ${
              description
                ? `<p>${esc(description)}</p>`
                : ""
            }

          </div>

          ${body}

        </main>

      </div>
    `,
    {
      path:
        active === "ai"
          ? "/ai"
          : active === "sources"
            ? "/sources"
            : active === "documents"
              ? "/claim"
              : active === "court"
                ? "/court"
                : "/questionnaire",

      title:
        title + " — Huquqiy AI"
    }
  );
}


// ======================================================
// QUESTIONNAIRE TEXT
// ======================================================

function questionnaireText(lang){
  lang = getLang(lang);

  return {

    uz:{
      title:
        "Vaziyatingizni aniqlashtiramiz",

      desc:
        "Savollarga bittadan javob bering. Keyingi savollar oldingi javoblaringizga moslashadi.",

      progress:
        "Jarayon",

      back:
        "← Orqaga",

      next:
        "Davom etish →",

      finish:
        "Huquqiy tahlil qilish →",

      yes:
        "Ha",

      no:
        "Yo‘q",

      placeholder:
        "Javobingizni yozing...",

      choose:
        "Variantni tanlang",

      summary:
        "Yig‘ilgan ma’lumotlar",

      required:
        "Davom etish uchun javob kiriting."
    },

    ru:{
      title:
        "Уточним вашу ситуацию",

      desc:
        "Отвечайте на вопросы по одному. Следующие вопросы будут зависеть от ваших предыдущих ответов.",

      progress:
        "Прогресс",

      back:
        "← Назад",

      next:
        "Продолжить →",

      finish:
        "Провести правовой анализ →",

      yes:
        "Да",

      no:
        "Нет",

      placeholder:
        "Введите ответ...",

      choose:
        "Выберите вариант",

      summary:
        "Собранная информация",

      required:
        "Для продолжения необходимо ответить."
    },

    en:{
      title:
        "Let's clarify your situation",

      desc:
        "Answer one question at a time. The next questions adapt to your previous answers.",

      progress:
        "Progress",

      back:
        "← Back",

      next:
        "Continue →",

      finish:
        "Analyze legal situation →",

      yes:
        "Yes",

      no:
        "No",

      placeholder:
        "Enter your answer...",

      choose:
        "Choose an option",

      summary:
        "Collected information",

      required:
        "Please answer before continuing."
    }

  }[lang];
}


// ======================================================
// QUESTIONNAIRE PAGE
// ======================================================

function questionnairePage(
  lang,
  selectedArea = "divorce"
){
  lang = getLang(lang);

  const t =
    questionnaireText(lang);

  /*
    Hozir oilaviy huquq daraxtini ishlatamiz.
    Keyinchalik inheritance/labour/housing
    uchun alohida daraxt qo'shish mumkin.
  */

  const questions =
    FAMILY_QUESTIONS.map(item => {

      return {
        ...item,

        question:
          localized(
            item.question,
            lang
          ),

        options:
          item.options
            ? item.options[lang] ||
              item.options.uz
            : null
      };

    });


  return appLayout(
    lang,
    "questionnaire",

    `

    <div class="questionShell">

      <div class="questionProgress">

        <div class="progressTop">

          <span>
            ${t.progress}
          </span>

          <span id="progressText">
            1 / 1
          </span>

        </div>

        <div class="progressTrack">

          <div
            class="progressBar"
            id="progressBar"
          ></div>

        </div>

      </div>


      <div class="questionCard">

        <div
          class="questionNumber"
          id="questionNumber"
        >
          01
        </div>

        <h2
          class="questionTitle"
          id="questionTitle"
        ></h2>


        <div
          class="questionInput"
          id="questionInput"
        ></div>


        <div
          id="questionError"
          style="
            display:none;
            margin-top:10px;
            color:#a94747;
            font-size:10px;
          "
        >
          ${t.required}
        </div>


        <div class="questionActions">

          <button
            class="btn btnOutline"
            type="button"
            id="backButton"
          >
            ${t.back}
          </button>


          <button
            class="btn btnPrimary"
            type="button"
            id="nextButton"
          >
            ${t.next}
          </button>

        </div>

      </div>


      <div
        class="caseSummary"
        id="caseSummary"
        style="display:none"
      >

        <strong>
          ${t.summary}
        </strong>

        <p id="caseSummaryText"></p>

      </div>

    </div>


    <form
      id="questionnaireSubmit"
      method="POST"
      action="/questionnaire-result${q(lang)}"
      style="display:none"
    >

      <input
        type="hidden"
        name="answers"
        id="answersField"
      >

      <input
        type="hidden"
        name="area"
        value="${esc(selectedArea)}"
      >

    </form>


    <script>

    (function(){

      const QUESTIONS =
        ${JSON.stringify(questions)};

      const LANG =
        ${JSON.stringify(lang)};

      const TEXT =
        ${JSON.stringify(t)};


      let answers = {};

      let currentIndex = 0;

      let history = [];


      const title =
        document.getElementById(
          "questionTitle"
        );

      const input =
        document.getElementById(
          "questionInput"
        );

      const number =
        document.getElementById(
          "questionNumber"
        );

      const nextButton =
        document.getElementById(
          "nextButton"
        );

      const backButton =
        document.getElementById(
          "backButton"
        );

      const progressBar =
        document.getElementById(
          "progressBar"
        );

      const progressText =
        document.getElementById(
          "progressText"
        );

      const errorBox =
        document.getElementById(
          "questionError"
        );


      function shouldShow(question){

        if(!question.showIf){
          return true;
        }

        return (
          answers[
            question.showIf.field
          ] ===
          question.showIf.equals
        );
      }


      function visibleQuestions(){

        return QUESTIONS.filter(
          shouldShow
        );
      }


      function currentQuestion(){

        return QUESTIONS[currentIndex];
      }


      function findNextIndex(start){

        for(
          let i = start + 1;
          i < QUESTIONS.length;
          i++
        ){

          if(
            shouldShow(
              QUESTIONS[i]
            )
          ){
            return i;
          }

        }

        return -1;
      }


      function findPreviousIndex(start){

        for(
          let i = start - 1;
          i >= 0;
          i--
        ){

          if(
            shouldShow(
              QUESTIONS[i]
            )
          ){
            return i;
          }

        }

        return -1;
      }


      function render(){

        errorBox.style.display =
          "none";

        const question =
          currentQuestion();

        if(!question){
          finish();
          return;
        }


        if(!shouldShow(question)){

          const next =
            findNextIndex(
              currentIndex
            );

          if(next === -1){
            finish();
          }
          else{
            currentIndex = next;
            render();
          }

          return;
        }


        const visible =
          visibleQuestions();

        const visiblePosition =
          visible.findIndex(
            item =>
              item.id === question.id
          );


        const currentNumber =
          visiblePosition + 1;

        const total =
          visible.length;


        number.textContent =
          String(
            currentNumber
          ).padStart(2,"0");


        title.textContent =
          question.question;


        progressText.textContent =
          currentNumber +
          " / " +
          total;


        progressBar.style.width =
          Math.round(
            (
              currentNumber /
              Math.max(total,1)
            ) * 100
          ) + "%";


        backButton.style.visibility =
          findPreviousIndex(
            currentIndex
          ) === -1
            ? "hidden"
            : "visible";


        const nextIndex =
          findNextIndex(
            currentIndex
          );


        nextButton.textContent =
          nextIndex === -1
            ? TEXT.finish
            : TEXT.next;


        renderInput(question);

      }


      function renderInput(question){

        const saved =
          answers[
            question.id
          ] || "";


        if(
          question.type ===
          "yesno"
        ){

          input.innerHTML =
            '<div class="choiceGrid">' +

            choiceHtml(
              "yes",
              TEXT.yes,
              saved
            ) +

            choiceHtml(
              "no",
              TEXT.no,
              saved
            ) +

            '</div>';

          bindChoices();

          return;
        }


        if(
          question.type ===
          "select"
        ){

          let html =
            '<select id="activeInput">' +
            '<option value="">' +
            escapeHtml(TEXT.choose) +
            '</option>';


          for(
            const option
            of question.options || []
          ){

            html +=
              '<option value="' +
              escapeAttribute(option) +
              '"' +

              (
                saved === option
                  ? ' selected'
                  : ''
              ) +

              '>' +
              escapeHtml(option) +
              '</option>';
          }


          html +=
            '</select>';


          input.innerHTML =
            html;

          return;
        }


        if(
          question.type ===
          "textarea"
        ){

          input.innerHTML =
            '<textarea ' +
            'id="activeInput" ' +
            'placeholder="' +
            escapeAttribute(
              TEXT.placeholder
            ) +
            '">' +
            escapeHtml(saved) +
            '</textarea>';

          return;
        }


        if(
          question.type ===
          "date"
        ){

          input.innerHTML =
            '<input ' +
            'id="activeInput" ' +
            'type="date" ' +
            'value="' +
            escapeAttribute(saved) +
            '">';

          return;
        }


        input.innerHTML =
          '<input ' +
          'id="activeInput" ' +
          'type="text" ' +
          'placeholder="' +
          escapeAttribute(
            TEXT.placeholder
          ) +
          '" ' +
          'value="' +
          escapeAttribute(saved) +
          '">';

      }


      function choiceHtml(
        value,
        label,
        saved
      ){

        return (
          '<button ' +
          'type="button" ' +
          'class="choiceButton ' +
          (
            saved === value
              ? 'selected'
              : ''
          ) +
          '" ' +
          'data-value="' +
          value +
          '">' +
          escapeHtml(label) +
          '</button>'
        );

      }


      function bindChoices(){

        document
          .querySelectorAll(
            ".choiceButton"
          )
          .forEach(button => {

            button.addEventListener(
              "click",
              function(){

                document
                  .querySelectorAll(
                    ".choiceButton"
                  )
                  .forEach(item =>
                    item.classList
                      .remove(
                        "selected"
                      )
                  );


                button.classList.add(
                  "selected"
                );

              }
            );

          });

      }


      function getCurrentValue(){

        const selected =
          document.querySelector(
            ".choiceButton.selected"
          );

        if(selected){
          return selected.dataset.value;
        }


        const field =
          document.getElementById(
            "activeInput"
          );

        if(!field){
          return "";
        }


        return String(
          field.value || ""
        ).trim();

      }


      function saveCurrent(){

        const question =
          currentQuestion();

        const value =
          getCurrentValue();


        if(!value){

          errorBox.style.display =
            "block";

          return false;
        }


        answers[
          question.id
        ] = value;


        /*
          Agar "yo'q" tanlansa,
          unga bog'liq oldingi javoblarni
          tozalab yuboramiz.
        */

        QUESTIONS.forEach(item => {

          if(
            item.showIf &&
            item.showIf.field ===
              question.id &&
            item.showIf.equals !== value
          ){

            delete answers[item.id];

          }

        });


        return true;
      }


      nextButton.addEventListener(
        "click",
        function(){

          if(!saveCurrent()){
            return;
          }


          history.push(
            currentIndex
          );


          const next =
            findNextIndex(
              currentIndex
            );


          if(next === -1){

            finish();
            return;
          }


          currentIndex = next;

          render();

        }
      );


      backButton.addEventListener(
        "click",
        function(){

          const previous =
            findPreviousIndex(
              currentIndex
            );


          if(previous === -1){
            return;
          }


          currentIndex =
            previous;

          render();

        }
      );


      function finish(){

        const form =
          document.getElementById(
            "questionnaireSubmit"
          );

        const field =
          document.getElementById(
            "answersField"
          );


        field.value =
          JSON.stringify(
            answers
          );


        form.submit();

      }


      function escapeHtml(value){

        return String(value || "")
          .replace(/&/g,"&amp;")
          .replace(/</g,"&lt;")
          .replace(/>/g,"&gt;")
          .replace(/"/g,"&quot;")
          .replace(/'/g,"&#039;");

      }


      function escapeAttribute(value){

        return escapeHtml(value);

      }


      render();

    })();

    </script>

    `,

    t.title,
    t.desc
  );
}


// ======================================================
// AI PAGE TEXT
// ======================================================

function aiText(lang){

  lang = getLang(lang);

  return {

    uz:{
      title:
        "Huquqiy yordamchi",

      desc:
        "Vaziyatingizni yozing yoki mikrofon orqali ayting. Tizim muhim faktlarni aniqlash va keyingi huquqiy qadamlarni tushuntirishga yordam beradi.",

      placeholder:
        "Masalan: Turmush o‘rtog‘im bilan ajrashmoqchiman. Ikki nafar voyaga yetmagan farzandimiz bor. Uy nikohdan keyin olingan...",

      voice:
        "Ovoz bilan aytish",

      stop:
        "Yozishni to‘xtatish",

      listening:
        "Ovoz yozilmoqda...",

      converting:
        "Ovoz matnga aylantirilmoqda...",

      ready:
        "Ovoz matnga aylantirildi. Matnni tekshirib, tahlilni boshlashingiz mumkin.",

      denied:
        "Mikrofonga ruxsat berilmadi. Telefon yoki brauzer sozlamalarida mikrofon ruxsatini yoqing.",

      unsupported:
        "Bu brauzerda ovoz yozish funksiyasi ishlamaydi. Safari yoki Chrome'ning yangi versiyasidan foydalaning.",

      empty:
        "Ovozdan matn aniqlanmadi. Qayta urinib ko‘ring.",

      analyze:
        "Huquqiy tahlil qilish",

      tip:
        "Aniqroq natija uchun sana, farzandlar, mol-mulk, daromad va nizoning asosiy sabablarini kiriting."
    },


    ru:{
      title:
        "Юридический помощник",

      desc:
        "Опишите ситуацию текстом или голосом. Система поможет определить важные факты и дальнейшие правовые шаги.",

      placeholder:
        "Например: Мы хотим развестись. У нас двое несовершеннолетних детей. Квартира приобретена после заключения брака...",

      voice:
        "Сказать голосом",

      stop:
        "Остановить запись",

      listening:
        "Идёт запись голоса...",

      converting:
        "Преобразуем голос в текст...",

      ready:
        "Голос преобразован в текст. Проверьте текст и начните анализ.",

      denied:
        "Нет доступа к микрофону. Разрешите использование микрофона в настройках телефона или браузера.",

      unsupported:
        "Этот браузер не поддерживает запись голоса. Используйте новую версию Safari или Chrome.",

      empty:
        "Не удалось распознать речь. Попробуйте ещё раз.",

      analyze:
        "Провести правовой анализ",

      tip:
        "Для более точного результата укажите даты, детей, имущество, доход и основные обстоятельства спора."
    },


    en:{
      title:
        "Legal assistant",

      desc:
        "Describe your situation by text or voice. The system helps identify important facts and possible next legal steps.",

      placeholder:
        "Example: My spouse and I want to divorce. We have two minor children. Our home was acquired after marriage...",

      voice:
        "Speak",

      stop:
        "Stop recording",

      listening:
        "Recording voice...",

      converting:
        "Converting speech to text...",

      ready:
        "Your voice has been converted to text. Review it before starting the analysis.",

      denied:
        "Microphone access was denied. Allow microphone access in your phone or browser settings.",

      unsupported:
        "Voice recording is not supported by this browser. Use a recent version of Safari or Chrome.",

      empty:
        "No speech was detected. Please try again.",

      analyze:
        "Analyze legal situation",

      tip:
        "For a more precise result, include dates, children, property, income and the main circumstances of the dispute."
    }

  }[lang];

}


// ======================================================
// AI + VOICE PAGE
// ======================================================

function aiPage(lang){

  lang = getLang(lang);

  const t =
    aiText(lang);


  return appLayout(
    lang,
    "ai",

    `

    <div class="aiWorkspace">

      <div class="surface">

        <form
          method="POST"
          action="/ai-result${q(lang)}"
          id="aiForm"
        >

          <div class="aiEditor">

            <textarea
              id="aiQuestion"
              name="question"
              required
              placeholder="${esc(t.placeholder)}"
            ></textarea>


            <div class="aiEditorBottom">

              <button
                type="button"
                class="voiceButton"
                id="voiceButton"
              >

                <span
                  class="voicePulse"
                ></span>

                <span id="voiceIcon">
                  🎙
                </span>

                <span id="voiceLabel">
                  ${t.voice}
                </span>

              </button>


              <span
                class="voiceTimer"
                id="voiceTimer"
              ></span>

            </div>

          </div>


          <div
            class="voiceStatus"
            id="voiceStatus"
          >
            ${t.tip}
          </div>


          <button
            type="submit"
            class="btn btnPrimary aiSubmit"
            id="analyzeButton"
          >
            ✦ ${t.analyze}
          </button>

        </form>

      </div>

    </div>


    <script>

    (function(){

      const LANG =
        ${JSON.stringify(lang)};

      const TEXT =
        ${JSON.stringify(t)};


      const voiceButton =
        document.getElementById(
          "voiceButton"
        );

      const voiceLabel =
        document.getElementById(
          "voiceLabel"
        );

      const voiceIcon =
        document.getElementById(
          "voiceIcon"
        );

      const voiceStatus =
        document.getElementById(
          "voiceStatus"
        );

      const voiceTimer =
        document.getElementById(
          "voiceTimer"
        );

      const textarea =
        document.getElementById(
          "aiQuestion"
        );


      let mediaRecorder = null;

      let mediaStream = null;

      let audioChunks = [];

      let recording = false;

      let seconds = 0;

      let timerInterval = null;


      function formatTime(total){

        const minutes =
          String(
            Math.floor(
              total / 60
            )
          ).padStart(2,"0");

        const secs =
          String(
            total % 60
          ).padStart(2,"0");

        return (
          minutes +
          ":" +
          secs
        );

      }


      function startTimer(){

        seconds = 0;

        voiceTimer.textContent =
          "00:00";


        timerInterval =
          setInterval(
            function(){

              seconds++;

              voiceTimer.textContent =
                formatTime(
                  seconds
                );

            },
            1000
          );

      }


      function stopTimer(){

        if(timerInterval){

          clearInterval(
            timerInterval
          );

        }

        timerInterval = null;

      }


      function chooseMimeType(){

        if(
          typeof MediaRecorder ===
          "undefined"
        ){
          return "";
        }


        const candidates = [

          "audio/webm;codecs=opus",

          "audio/webm",

          "audio/mp4",

          "audio/ogg;codecs=opus"

        ];


        for(
          const type
          of candidates
        ){

          if(
            MediaRecorder
              .isTypeSupported &&
            MediaRecorder
              .isTypeSupported(
                type
              )
          ){

            return type;

          }

        }


        return "";

      }


      function formatFromMime(
        mime
      ){

        mime =
          String(
            mime || ""
          ).toLowerCase();


        if(
          mime.includes(
            "mp4"
          )
        ){
          return "m4a";
        }


        if(
          mime.includes(
            "ogg"
          )
        ){
          return "ogg";
        }


        if(
          mime.includes(
            "wav"
          )
        ){
          return "wav";
        }


        if(
          mime.includes(
            "mpeg"
          ) ||
          mime.includes(
            "mp3"
          )
        ){
          return "mp3";
        }


        return "webm";

      }


      function blobToBase64(blob){

        return new Promise(
          function(
            resolve,
            reject
          ){

            const reader =
              new FileReader();


            reader.onloadend =
              function(){

                const result =
                  String(
                    reader.result ||
                    ""
                  );


                const comma =
                  result.indexOf(
                    ","
                  );


                resolve(
                  comma >= 0
                    ? result.slice(
                        comma + 1
                      )
                    : result
                );

              };


            reader.onerror =
              reject;


            reader.readAsDataURL(
              blob
            );

          }
        );

      }


      async function startRecording(){

        if(
          !navigator.mediaDevices ||
          !navigator.mediaDevices
            .getUserMedia ||
          typeof MediaRecorder ===
            "undefined"
        ){

          voiceStatus.textContent =
            TEXT.unsupported;

          return;

        }


        try{

          mediaStream =
            await navigator
              .mediaDevices
              .getUserMedia({
                audio:{
                  echoCancellation:true,
                  noiseSuppression:true,
                  autoGainControl:true
                }
              });


          const mimeType =
            chooseMimeType();


          const options =
            mimeType
              ? {
                  mimeType:
                    mimeType
                }
              : undefined;


          mediaRecorder =
            options
              ? new MediaRecorder(
                  mediaStream,
                  options
                )
              : new MediaRecorder(
                  mediaStream
                );


          audioChunks = [];


          mediaRecorder
            .addEventListener(
              "dataavailable",
              function(event){

                if(
                  event.data &&
                  event.data.size > 0
                ){

                  audioChunks.push(
                    event.data
                  );

                }

              }
            );


          mediaRecorder
            .addEventListener(
              "stop",
              sendAudio
            );


          mediaRecorder.start();


          recording = true;


          voiceButton
            .classList
            .add(
              "recording"
            );


          voiceIcon.textContent =
            "■";


          voiceLabel.textContent =
            TEXT.stop;


          voiceStatus.textContent =
            TEXT.listening;


          startTimer();

        }

        catch(error){

          console.error(
            error
          );


          voiceStatus.textContent =
            TEXT.denied;

        }

      }


      function stopRecording(){

        if(
          !mediaRecorder ||
          mediaRecorder.state ===
            "inactive"
        ){
          return;
        }


        mediaRecorder.stop();


        recording = false;


        voiceButton
          .classList
          .remove(
            "recording"
          );


        voiceIcon.textContent =
          "🎙";


        voiceLabel.textContent =
          TEXT.voice;


        stopTimer();


        if(mediaStream){

          mediaStream
            .getTracks()
            .forEach(
              function(track){
                track.stop();
              }
            );

        }

      }


      async function sendAudio(){

        try{

          voiceStatus.textContent =
            TEXT.converting;


          if(
            !audioChunks.length
          ){

            voiceStatus.textContent =
              TEXT.empty;

            return;

          }


          const actualMime =
            mediaRecorder
              ?.mimeType ||
            audioChunks[0]
              ?.type ||
            "audio/webm";


          const blob =
            new Blob(
              audioChunks,
              {
                type:
                  actualMime
              }
            );


          /*
            Juda qisqa bo'sh yozuvlarni
            serverga yubormaymiz.
          */

          if(
            blob.size < 1000
          ){

            voiceStatus.textContent =
              TEXT.empty;

            return;

          }


          const base64 =
            await blobToBase64(
              blob
            );


          const response =
            await fetch(
              "/transcribe?lang=" +
              encodeURIComponent(
                LANG
              ),
              {
                method:"POST",

                headers:{
                  "Content-Type":
                    "application/json"
                },

                body:
                  JSON.stringify({
                    audio:
                      base64,

                    format:
                      formatFromMime(
                        actualMime
                      )
                  })
              }
            );


          const data =
            await response.json();


          if(
            !response.ok
          ){

            throw new Error(
              data.error ||
              "Transcription error"
            );

          }


          const transcript =
            String(
              data.text || ""
            ).trim();


          if(!transcript){

            voiceStatus.textContent =
              TEXT.empty;

            return;

          }


          const existing =
            textarea.value.trim();


          textarea.value =
            existing
              ? (
                  existing +
                  "\\n" +
                  transcript
                )
              : transcript;


          textarea.focus();


          voiceStatus.textContent =
            TEXT.ready;

        }

        catch(error){

          console.error(
            error
          );


          voiceStatus.textContent =
            error.message ||
            TEXT.empty;

        }

      }


      voiceButton
        .addEventListener(
          "click",
          function(){

            if(recording){

              stopRecording();

            }
            else{

              startRecording();

            }

          }
        );


      window.addEventListener(
        "beforeunload",
        function(){

          if(mediaStream){

            mediaStream
              .getTracks()
              .forEach(
                track =>
                  track.stop()
              );

          }

        }
      );

    })();

    </script>

    `,

    t.title,
    t.desc
  );
}


// ======================================================
// AI RESULT PAGE
// ======================================================

function aiResultPage(
  lang,
  question,
  answer
){

  lang = getLang(lang);


  const text = {

    uz:{
      title:
        "Huquqiy tahlil",

      desc:
        "Siz taqdim etgan ma’lumotlar asosida shakllantirilgan dastlabki huquqiy tahlil.",

      question:
        "Sizning vaziyatingiz",

      result:
        "Tahlil natijasi",

      again:
        "Yangi savol berish",

      questionnaire:
        "Aniq savol-javobga o‘tish"
    },


    ru:{
      title:
        "Правовой анализ",

      desc:
        "Предварительный правовой анализ на основе предоставленной вами информации.",

      question:
        "Ваша ситуация",

      result:
        "Результат анализа",

      again:
        "Задать новый вопрос",

      questionnaire:
        "Перейти к уточняющим вопросам"
    },


    en:{
      title:
        "Legal analysis",

      desc:
        "Preliminary legal analysis based on the information you provided.",

      question:
        "Your situation",

      result:
        "Analysis result",

      again:
        "Ask another question",

      questionnaire:
        "Start structured questionnaire"
    }

  }[lang];


  return appLayout(
    lang,
    "ai",

    `

    <div class="surface">

      <div class="resultHeader">

        <small>
          ${text.question}
        </small>

        <h2>
          ${esc(question)}
        </h2>

      </div>


      <div class="resultHeader">

        <small>
          ${text.result}
        </small>

      </div>


      <div class="analysisResult">
${esc(answer)}
      </div>


      <div
        style="
          display:flex;
          flex-wrap:wrap;
          gap:10px;
          margin-top:25px;
          padding-top:20px;
          border-top:1px solid #e8ecf0;
        "
      >

        <a
          href="/ai${q(lang)}"
          class="btn btnOutline"
        >
          ${text.again}
        </a>


        <a
          href="/questionnaire${q(lang)}"
          class="btn btnPrimary"
        >
          ${text.questionnaire}
          →
        </a>

      </div>

    </div>

    `,

    text.title,
    text.desc
  );
}


// ======================================================
// QUESTIONNAIRE RESULT PAGE
// ======================================================

function questionnaireResultPage(
  lang,
  answers,
  analysis
){

  lang = getLang(lang);


  const text = {

    uz:{
      title:
        "Vaziyatingiz bo‘yicha huquqiy tahlil",

      desc:
        "Savol-javob orqali yig‘ilgan faktlar asosida tayyorlangan dastlabki tahlil.",

      facts:
        "Aniqlangan faktlar",

      analysis:
        "Huquqiy tahlil",

      sources:
        "Rasmiy manbalarni ko‘rish",

      document:
        "Hujjat tayyorlash"
    },

    ru:{
      title:
        "Правовой анализ вашей ситуации",

      desc:
        "Предварительный анализ на основе фактов, собранных в ходе вопросов.",

      facts:
        "Установленные факты",

      analysis:
        "Правовой анализ",

      sources:
        "Официальные источники",

      document:
        "Подготовить документ"
    },

    en:{
      title:
        "Legal analysis of your situation",

      desc:
        "Preliminary analysis based on the facts collected through the questionnaire.",

      facts:
        "Collected facts",

      analysis:
        "Legal analysis",

      sources:
        "Official sources",

      document:
        "Prepare a document"
    }

  }[lang];


  const summary =
    buildCaseSummary(
      answers,
      lang
    );


  return appLayout(
    lang,
    "questionnaire",

    `

    <div class="surface">

      <div class="resultHeader">

        <small>
          ${text.facts}
        </small>

      </div>


      <div class="analysisResult">
${esc(summary)}
      </div>


      <div
        style="
          height:1px;
          background:#e8ecf0;
          margin:25px 0;
        "
      ></div>


      <div class="resultHeader">

        <small>
          ${text.analysis}
        </small>

      </div>


      <div class="analysisResult">
${esc(analysis)}
      </div>


      <div
        style="
          display:flex;
          flex-wrap:wrap;
          gap:10px;
          margin-top:25px;
          padding-top:20px;
          border-top:1px solid #e8ecf0;
        "
      >

        <a
          href="/sources${q(lang)}"
          class="btn btnOutline"
        >
          § ${text.sources}
        </a>


        <a
          href="/claim${q(lang)}"
          class="btn btnPrimary"
        >
          ${text.document}
          →
        </a>

      </div>

    </div>

    `,

    text.title,
    text.desc
  );
}


// ======================================================
// QONUN MANBALARI PAGE
// ======================================================

function sourcesPage(lang){

  lang = getLang(lang);


  const text = {

    uz:{
      title:
        "Qonun manbalari",

      desc:
        "Huquqiy masalangiz bo‘yicha amaldagi qonunchilik va sud ma’lumotlarini rasmiy manbalardan tekshiring.",

      note:
        "Huquqiy norma vaqt o‘tishi bilan o‘zgarishi mumkin. Muhim qaror qabul qilishdan oldin normaning amaldagi tahririni rasmiy manbadan tekshiring."
    },

    ru:{
      title:
        "Правовые источники",

      desc:
        "Проверяйте действующее законодательство и судебную информацию по официальным источникам.",

      note:
        "Правовые нормы могут изменяться. Перед принятием важного решения проверяйте действующую редакцию нормы в официальном источнике."
    },

    en:{
      title:
        "Legal sources",

      desc:
        "Check current legislation and court information through official sources.",

      note:
        "Legal rules may change over time. Verify the current version through an official source before relying on it for an important decision."
    }

  }[lang];


  const cards =
    LEGAL_SOURCES
      .map(
        source => `

        <a
          class="officialSourceItem"
          href="${source.url}"
          target="_blank"
          rel="noopener noreferrer"
        >

          <div class="sourceIcon">
            §
          </div>


          <div>

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

          </div>


          <span>
            ↗
          </span>

        </a>

        `
      )
      .join("");


  return appLayout(
    lang,
    "sources",

    `

    <div class="officialSourceList">

      ${cards}

    </div>


    <div
      class="legalNotice"
      style="margin-top:20px"
    >

      <div class="legalNoticeIcon">
        !
      </div>

      <div>

        <strong>
          Huquqiy AI
        </strong>

        <p>
          ${text.note}
        </p>

      </div>

    </div>

    `,

    text.title,
    text.desc
  );
}
// ======================================================
// 4/4 — HUQUQIY AI
// HUJJATLAR + SUD + ROUTES + SERVER
// ======================================================


// ======================================================
// HUJJAT SAHIFASI
// ======================================================

function claimPage(lang) {
  lang = getLang(lang);

  const text = {
    uz: {
      title: "Huquqiy hujjat tayyorlash",
      desc:
        "Kerakli ma’lumotlarni kiriting. Huquqiy AI ular asosida dastlabki hujjat loyihasini tayyorlaydi.",

      type: "Hujjat turi",
      divorce: "Nikohdan ajratish bo‘yicha da’vo arizasi",
      aliment: "Aliment undirish bo‘yicha ariza",
      property: "Mol-mulkni bo‘lish bo‘yicha da’vo",
      general: "Boshqa huquqiy murojaat",

      court: "Sud nomi",
      plaintiff: "Arizachi / da’vogar",
      defendant: "Javobgar",
      address: "Manzil",
      phone: "Telefon",
      facts: "Vaziyat va muhim faktlar",
      request: "Suddan nima so‘ralmoqda?",

      courtPlaceholder:
        "Masalan: Fuqarolik ishlari bo‘yicha ... tumanlararo sudi",

      plaintiffPlaceholder:
        "F.I.Sh.",

      defendantPlaceholder:
        "Javobgarning F.I.Sh.",

      addressPlaceholder:
        "Yashash manzili",

      factsPlaceholder:
        "Nikoh sanasi, farzandlar, mol-mulk, nizo sababi va boshqa muhim holatlarni yozing.",

      requestPlaceholder:
        "Talablaringizni yozing.",

      button:
        "Hujjat loyihasini tayyorlash"
    },

    ru: {
      title: "Подготовка юридического документа",
      desc:
        "Введите необходимые данные. Huquqiy AI подготовит предварительный проект документа.",

      type: "Тип документа",
      divorce: "Исковое заявление о расторжении брака",
      aliment: "Заявление о взыскании алиментов",
      property: "Иск о разделе имущества",
      general: "Другое юридическое обращение",

      court: "Наименование суда",
      plaintiff: "Заявитель / истец",
      defendant: "Ответчик",
      address: "Адрес",
      phone: "Телефон",
      facts: "Обстоятельства дела",
      request: "Что вы просите у суда?",

      courtPlaceholder:
        "Например: Межрайонный суд по гражданским делам ...",

      plaintiffPlaceholder: "Ф.И.О.",
      defendantPlaceholder: "Ф.И.О. ответчика",
      addressPlaceholder: "Адрес проживания",

      factsPlaceholder:
        "Укажите дату брака, детей, имущество, причины спора и другие важные обстоятельства.",

      requestPlaceholder:
        "Укажите ваши требования.",

      button:
        "Подготовить проект документа"
    },

    en: {
      title: "Prepare a legal document",
      desc:
        "Enter the relevant information. Huquqiy AI will prepare a preliminary document draft.",

      type: "Document type",
      divorce: "Divorce statement of claim",
      aliment: "Child support application",
      property: "Property division claim",
      general: "Other legal application",

      court: "Court",
      plaintiff: "Applicant / claimant",
      defendant: "Defendant",
      address: "Address",
      phone: "Phone",
      facts: "Facts and circumstances",
      request: "What are you asking the court to do?",

      courtPlaceholder:
        "Enter the name of the court",

      plaintiffPlaceholder: "Full name",
      defendantPlaceholder: "Defendant's full name",
      addressPlaceholder: "Residential address",

      factsPlaceholder:
        "Enter marriage date, children, property, dispute circumstances and other relevant facts.",

      requestPlaceholder:
        "Enter your requested relief.",

      button:
        "Prepare document draft"
    }
  }[lang];

  return appLayout(
    lang,
    "documents",

    `
    <div class="surface">

      <form
        method="POST"
        action="/claim-result${q(lang)}"
      >

        <div class="field">

          <label>
            ${text.type}
          </label>

          <select name="documentType" required>

            <option value="divorce">
              ${text.divorce}
            </option>

            <option value="aliment">
              ${text.aliment}
            </option>

            <option value="property">
              ${text.property}
            </option>

            <option value="general">
              ${text.general}
            </option>

          </select>

        </div>


        <div class="field">

          <label>
            ${text.court}
          </label>

          <input
            type="text"
            name="court"
            placeholder="${esc(text.courtPlaceholder)}"
          >

        </div>


        <div class="field">

          <label>
            ${text.plaintiff}
          </label>

          <input
            type="text"
            name="plaintiff"
            required
            placeholder="${esc(text.plaintiffPlaceholder)}"
          >

        </div>


        <div class="field">

          <label>
            ${text.defendant}
          </label>

          <input
            type="text"
            name="defendant"
            placeholder="${esc(text.defendantPlaceholder)}"
          >

        </div>


        <div class="field">

          <label>
            ${text.address}
          </label>

          <input
            type="text"
            name="address"
            placeholder="${esc(text.addressPlaceholder)}"
          >

        </div>


        <div class="field">

          <label>
            ${text.phone}
          </label>

          <input
            type="text"
            name="phone"
          >

        </div>


        <div class="field">

          <label>
            ${text.facts}
          </label>

          <textarea
            name="facts"
            required
            placeholder="${esc(text.factsPlaceholder)}"
          ></textarea>

        </div>


        <div class="field">

          <label>
            ${text.request}
          </label>

          <textarea
            name="request"
            required
            placeholder="${esc(text.requestPlaceholder)}"
          ></textarea>

        </div>


        <button
          class="btn btnPrimary"
          style="width:100%"
          type="submit"
        >
          ▤ ${text.button}
        </button>

      </form>

    </div>
    `,

    text.title,
    text.desc
  );
}


// ======================================================
// HUJJAT NATIJASI
// ======================================================

function claimResultPage(
  lang,
  document
) {
  lang = getLang(lang);

  const text = {
    uz: {
      title: "Hujjat loyihasi",
      desc:
        "Taqdim etilgan ma’lumotlar asosida tayyorlangan dastlabki hujjat.",
      warning:
        "Sudga topshirishdan oldin faktlar, sudlovga tegishlilik, davlat boji, ilovalar va amaldagi qonunchilik talablarini tekshiring.",
      again: "Qayta tayyorlash",
      sources: "Qonun manbalari"
    },

    ru: {
      title: "Проект документа",
      desc:
        "Предварительный документ, подготовленный на основании предоставленных данных.",
      warning:
        "Перед подачей в суд проверьте факты, подсудность, государственную пошлину, приложения и требования действующего законодательства.",
      again: "Подготовить заново",
      sources: "Правовые источники"
    },

    en: {
      title: "Document draft",
      desc:
        "A preliminary document prepared from the information provided.",
      warning:
        "Before filing, verify the facts, jurisdiction, court fee, attachments and current legal requirements.",
      again: "Prepare another",
      sources: "Legal sources"
    }
  }[lang];

  return appLayout(
    lang,
    "documents",

    `
      <div class="surface">

        <div class="legalNotice">

          <div class="legalNoticeIcon">
            !
          </div>

          <div>
            <strong>Huquqiy AI</strong>
            <p>${text.warning}</p>
          </div>

        </div>


        <div class="analysisResult">
${esc(document)}
        </div>


        <div
          style="
            display:flex;
            gap:10px;
            flex-wrap:wrap;
            margin-top:25px;
            padding-top:20px;
            border-top:1px solid #e8ecf0;
          "
        >

          <a
            href="/claim${q(lang)}"
            class="btn btnOutline"
          >
            ${text.again}
          </a>

          <a
            href="/sources${q(lang)}"
            class="btn btnPrimary"
          >
            § ${text.sources}
          </a>

        </div>

      </div>
    `,

    text.title,
    text.desc
  );
}


// ======================================================
// SUD SAHIFASI
// ======================================================

function courtPage(lang) {
  lang = getLang(lang);

  const text = {
    uz: {
      title: "Sudga murojaat",
      desc:
        "Sudga murojaat qilishdan oldin vaziyatingizni tartibga soling va kerakli hujjatlarni aniqlang.",

      one: "1. Vaziyatni aniqlang",
      oneText:
        "Nizo turi, taraflar, asosiy faktlar va talablaringizni aniqlashtiring.",

      two: "2. Dalillarni yig‘ing",
      twoText:
        "Shartnoma, guvohnoma, yozishmalar, to‘lov hujjatlari va boshqa tegishli materiallarni tayyorlang.",

      three: "3. Hujjat tayyorlang",
      threeText:
        "Murojaat turiga mos ariza yoki da’vo arizasi loyihasini tayyorlang.",

      four: "4. Rasmiy ma’lumotni tekshiring",
      fourText:
        "Sudga tegishlilik, davlat boji va topshirish tartibini amaldagi rasmiy manbalardan tekshiring.",

      document: "Hujjat tayyorlash",
      mysud: "my.sud.uz xizmatlari"
    },

    ru: {
      title: "Обращение в суд",
      desc:
        "Перед обращением в суд систематизируйте ситуацию и определите необходимые документы.",

      one: "1. Определите ситуацию",
      oneText:
        "Определите вид спора, стороны, основные факты и ваши требования.",

      two: "2. Соберите доказательства",
      twoText:
        "Подготовьте договоры, свидетельства, переписку, платёжные документы и другие материалы.",

      three: "3. Подготовьте документ",
      threeText:
        "Подготовьте заявление или иск в зависимости от вида обращения.",

      four: "4. Проверьте официальную информацию",
      fourText:
        "Проверьте подсудность, государственную пошлину и порядок подачи по действующим официальным источникам.",

      document: "Подготовить документ",
      mysud: "Сервисы my.sud.uz"
    },

    en: {
      title: "Going to court",
      desc:
        "Organize your situation and identify the required documents before filing with a court.",

      one: "1. Define the dispute",
      oneText:
        "Identify the type of dispute, parties, key facts and requested relief.",

      two: "2. Gather evidence",
      twoText:
        "Prepare agreements, certificates, correspondence, payment records and other relevant material.",

      three: "3. Prepare the filing",
      threeText:
        "Prepare the appropriate application or statement of claim.",

      four: "4. Verify official requirements",
      fourText:
        "Check jurisdiction, court fees and filing procedures through current official sources.",

      document: "Prepare document",
      mysud: "my.sud.uz services"
    }
  }[lang];

  return appLayout(
    lang,
    "court",

    `
      <div class="coreGrid">

        ${coreItem(
          "01",
          text.one,
          text.oneText
        )}

        ${coreItem(
          "02",
          text.two,
          text.twoText
        )}

        ${coreItem(
          "03",
          text.three,
          text.threeText
        )}

        ${coreItem(
          "04",
          text.four,
          text.fourText
        )}

      </div>


      <div
        style="
          display:flex;
          flex-wrap:wrap;
          gap:10px;
          margin-top:20px;
        "
      >

        <a
          href="/claim${q(lang)}"
          class="btn btnPrimary"
        >
          ▤ ${text.document}
        </a>


        <a
          href="https://my.sud.uz"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btnOutline"
        >
          ${text.mysud} ↗
        </a>

      </div>
    `,

    text.title,
    text.desc
  );
}


// ======================================================
// ERROR PAGE
// ======================================================

function errorPage(
  lang,
  message,
  status = 500
) {
  lang = getLang(lang);

  const text = {
    uz: {
      title: "Xatolik yuz berdi",
      home: "Bosh sahifaga qaytish"
    },

    ru: {
      title: "Произошла ошибка",
      home: "Вернуться на главную"
    },

    en: {
      title: "Something went wrong",
      home: "Return home"
    }
  }[lang];

  return layout(
    lang,
    `
      <div
        class="container"
        style="
          padding:80px 0;
          max-width:700px;
        "
      >

        <div class="surface">

          <div class="eyebrow">
            ERROR ${status}
          </div>

          <h1
            style="
              color:#091d33;
              font-family:Georgia,serif;
              font-weight:500;
            "
          >
            ${text.title}
          </h1>

          <p
            style="
              color:#718093;
              line-height:1.7;
            "
          >
            ${esc(message)}
          </p>

          <a
            href="/${q(lang)}"
            class="btn btnPrimary"
          >
            ${text.home}
          </a>

        </div>

      </div>
    `,
    {
      path: "/",
      title: text.title
    }
  );
}


// ======================================================
// HUJJAT UCHUN AI PROMPT
// ======================================================

async function buildLegalDocument(
  lang,
  form
) {
  lang = getLang(lang);

  const language = {
    uz: "o‘zbek",
    ru: "rus",
    en: "English"
  }[lang];

  const prompt = `
Prepare a preliminary legal document draft using ONLY
the facts provided below.

Language: ${language}

Document type:
${form.documentType || ""}

Court:
${form.court || ""}

Applicant / claimant:
${form.plaintiff || ""}

Defendant:
${form.defendant || ""}

Address:
${form.address || ""}

Phone:
${form.phone || ""}

Facts:
${form.facts || ""}

Requested relief:
${form.request || ""}

IMPORTANT:

- Do not invent names, dates, facts, evidence,
  article numbers or court information.

- If required information is missing, mark it clearly
  as [TO‘LDIRING] in Uzbek,
  [ЗАПОЛНИТЕ] in Russian,
  or [COMPLETE] in English.

- Do not guarantee that the document is ready for filing.

- Use a professional legal-document structure.

- At the end include a section for attachments.

- Where a current legal citation needs verification,
  state that it should be checked against the current
  official version before filing.
`;

  return await callAI(
    prompt,
    lang
  );
}


// ======================================================
// QUESTIONNAIRE ANALYSIS
// ======================================================

async function analyzeQuestionnaire(
  lang,
  answers
) {
  const summary =
    buildCaseSummary(
      answers,
      lang
    );

  const prompt = `
Analyze the following legal situation.

The information below was collected through
Huquqiy AI's structured questionnaire.

${summary}

Structure the response into:

1. Vaziyat / Situation
2. Aniqlangan muhim faktlar / Important facts
3. Huquqiy masalalar / Legal issues
4. Mumkin bo‘lgan yo‘llar / Possible options
5. Qo‘shimcha aniqlanishi kerak bo‘lgan ma’lumotlar
6. Keyingi qadamlar
7. Tekshirilishi kerak bo‘lgan rasmiy huquqiy manbalar

Do not invent article numbers or court outcomes.

If the information is insufficient, say exactly
which information is missing.

Where current Uzbekistan law matters,
tell the user to verify the current official text
through LexUZ and relevant official court resources.
`;

  return await callAI(
    prompt,
    lang,
    summary
  );
}


// ======================================================
// SERVER
// ======================================================

const server = http.createServer(
  async (req, res) => {

    const url =
      getUrl(req);

    const pathname =
      url.pathname;

    const lang =
      getLang(
        url.searchParams.get("lang")
      );


    try {

      // ==================================================
      // HOME
      // ==================================================

      if (
        req.method === "GET" &&
        pathname === "/"
      ) {
        return sendHtml(
          res,
          homePage(lang)
        );
      }


      // ==================================================
      // QUESTIONNAIRE
      // ==================================================

      if (
        req.method === "GET" &&
        pathname === "/questionnaire"
      ) {
        const area =
          url.searchParams.get("area") ||
          "divorce";

        return sendHtml(
          res,
          questionnairePage(
            lang,
            area
          )
        );
      }


      // ==================================================
      // QUESTIONNAIRE RESULT
      // ==================================================

      if (
        req.method === "POST" &&
        pathname ===
          "/questionnaire-result"
      ) {
        const form =
          await readForm(req);

        let answers = {};

        try {
          answers =
            JSON.parse(
              String(
                form.answers || "{}"
              )
            );
        } catch {
          answers = {};
        }


        if (
          !answers ||
          typeof answers !== "object"
        ) {
          answers = {};
        }


        const analysis =
          await analyzeQuestionnaire(
            lang,
            answers
          );


        return sendHtml(
          res,
          questionnaireResultPage(
            lang,
            answers,
            analysis
          )
        );
      }


      // ==================================================
      // AI
      // ==================================================

      if (
        req.method === "GET" &&
        pathname === "/ai"
      ) {
        return sendHtml(
          res,
          aiPage(lang)
        );
      }


      // ==================================================
      // AI RESULT
      // ==================================================

      if (
        req.method === "POST" &&
        pathname === "/ai-result"
      ) {
        const form =
          await readForm(req);

        const question =
          String(
            form.question || ""
          ).trim();


        if (!question) {
          return sendHtml(
            res,
            errorPage(
              lang,
              lang === "ru"
                ? "Введите описание ситуации."
                : lang === "en"
                  ? "Please describe your situation."
                  : "Vaziyatingizni yozing.",
              400
            ),
            400
          );
        }


        const answer =
          await callAI(
            question,
            lang
          );


        return sendHtml(
          res,
          aiResultPage(
            lang,
            question,
            answer
          )
        );
      }


      // ==================================================
      // VOICE TRANSCRIPTION
      // ==================================================

      if (
        req.method === "POST" &&
        pathname === "/transcribe"
      ) {
        const body =
          await readJson(req);


        const audio =
          String(
            body.audio || ""
          );


        const format =
          String(
            body.format ||
            "webm"
          );


        if (!audio) {
          return sendJson(
            res,
            {
              error:
                "Audio topilmadi."
            },
            400
          );
        }


        const text =
          await transcribeAudio(
            audio,
            format,
            lang
          );


        return sendJson(
          res,
          {
            text
          }
        );
      }


      // ==================================================
      // SOURCES
      // ==================================================

      if (
        req.method === "GET" &&
        pathname === "/sources"
      ) {
        return sendHtml(
          res,
          sourcesPage(lang)
        );
      }


      // ==================================================
      // CLAIM / DOCUMENT
      // ==================================================

      if (
        req.method === "GET" &&
        pathname === "/claim"
      ) {
        return sendHtml(
          res,
          claimPage(lang)
        );
      }


      // ==================================================
      // CLAIM RESULT
      // ==================================================

      if (
        req.method === "POST" &&
        pathname === "/claim-result"
      ) {
        const form =
          await readForm(req);


        if (
          !String(
            form.plaintiff || ""
          ).trim() ||
          !String(
            form.facts || ""
          ).trim() ||
          !String(
            form.request || ""
          ).trim()
        ) {
          return sendHtml(
            res,
            errorPage(
              lang,
              lang === "ru"
                ? "Заполните обязательные поля."
                : lang === "en"
                  ? "Complete the required fields."
                  : "Majburiy maydonlarni to‘ldiring.",
              400
            ),
            400
          );
        }


        const document =
          await buildLegalDocument(
            lang,
            form
          );


        return sendHtml(
          res,
          claimResultPage(
            lang,
            document
          )
        );
      }


      // ==================================================
      // COURT
      // ==================================================

      if (
        req.method === "GET" &&
        pathname === "/court"
      ) {
        return sendHtml(
          res,
          courtPage(lang)
        );
      }


      // ==================================================
      // HEALTH CHECK
      // ==================================================

      if (
        req.method === "GET" &&
        pathname === "/health"
      ) {
        return sendJson(
          res,
          {
            ok: true,
            service: "Huquqiy AI"
          }
        );
      }


      // ==================================================
      // FAVICON
      // ==================================================

      if (
        req.method === "GET" &&
        pathname === "/favicon.ico"
      ) {
        res.writeHead(204);
        return res.end();
      }


      // ==================================================
      // 404
      // ==================================================

      return sendHtml(
        res,
        errorPage(
          lang,
          lang === "ru"
            ? "Страница не найдена."
            : lang === "en"
              ? "Page not found."
              : "Sahifa topilmadi.",
          404
        ),
        404
      );

    }

    catch (error) {

      console.error(
        "SERVER ERROR:",
        error
      );


      // JSON endpoint bo'lsa JSON qaytaramiz

      if (
        pathname === "/transcribe"
      ) {
        return sendJson(
          res,
          {
            error:
              error?.message ||
              "Server error"
          },
          500
        );
      }


      return sendHtml(
        res,
        errorPage(
          lang,
          error?.message ||
          "Server error",
          500
        ),
        500
      );
    }
  }
);


// ======================================================
// START SERVER
// ======================================================

server.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      "======================================"
    );

    console.log(
      "HUQUQIY AI ISHLADI"
    );

    console.log(
      "PORT:",
      PORT
    );

    console.log(
      "AI MODEL:",
      AI_MODEL
    );

    console.log(
      "STT MODEL:",
      STT_MODEL
    );

    console.log(
      "======================================"
    );

  }
);
