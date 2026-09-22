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

    icon: "👨‍👩‍👧",

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
// OILAVIY HUQUQ SAVOLNOMASI
// ======================================================

const FAMILY_QUESTIONS = [

  {
    id:
      "marriage_registered",

    label: {
      uz:
        "Nikoh FHDYO organida rasman qayd etilganmi?",

      ru:
        "Брак официально зарегистрирован в органах ЗАГС?",

      en:
        "Is the marriage officially registered?"
    },

    type:
      "select",

    options: {
      uz: [
        ["", "Tanlang"],
        ["yes", "Ha"],
        ["no", "Yo‘q"]
      ],

      ru: [
        ["", "Выберите"],
        ["yes", "Да"],
        ["no", "Нет"]
      ],

      en: [
        ["", "Select"],
        ["yes", "Yes"],
        ["no", "No"]
      ]
    }
  },


  {
    id:
      "marriage_date",

    label: {
      uz:
        "Nikoh qachon qayd etilgan?",

      ru:
        "Когда был зарегистрирован брак?",

      en:
        "When was the marriage registered?"
    },

    type:
      "date"
  },


  {
    id:
      "marriage_place",

    label: {
      uz:
        "Nikoh qayerda qayd etilgan?",

      ru:
        "Где был зарегистрирован брак?",

      en:
        "Where was the marriage registered?"
    },

    type:
      "text"
  },


  {
    id:
      "mutual_consent",

    label: {
      uz:
        "Er-xotinning ikkalasi ham ajrashishga rozimi?",

      ru:
        "Оба супруга согласны на развод?",

      en:
        "Do both spouses consent to divorce?"
    },

    type:
      "select",

    options: {
      uz: [
        ["", "Tanlang"],
        ["yes", "Ha"],
        ["no", "Yo‘q"],
        ["unknown", "Aniq emas"]
      ],

      ru: [
        ["", "Выберите"],
        ["yes", "Да"],
        ["no", "Нет"],
        ["unknown", "Неизвестно"]
      ],

      en: [
        ["", "Select"],
        ["yes", "Yes"],
        ["no", "No"],
        ["unknown", "Unknown"]
      ]
    }
  },


  {
    id:
      "reason",

    label: {
      uz:
        "Ajrashishning asosiy sababi nima?",

      ru:
        "Какова основная причина развода?",

      en:
        "What is the main reason for divorce?"
    },

    type:
      "textarea"
  },


  {
    id:
      "children_count",

    label: {
      uz:
        "Voyaga yetmagan farzandlar soni nechta?",

      ru:
        "Сколько несовершеннолетних детей?",

      en:
        "How many minor children are there?"
    },

    type:
      "number"
  },


  {
    id:
      "children_ages",

    label: {
      uz:
        "Farzandlarning yoshlarini kiriting.",

      ru:
        "Укажите возраст детей.",

      en:
        "Enter the children's ages."
    },

    type:
      "text"
  },


  {
    id:
      "children_residence",

    label: {
      uz:
        "Farzandlar kim bilan yashashi rejalashtirilmoqda?",

      ru:
        "С кем планируется проживание детей?",

      en:
        "Who are the children expected to live with?"
    },

    type:
      "select",

    options: {
      uz: [
        ["", "Tanlang"],
        ["mother", "Ona bilan"],
        ["father", "Ota bilan"],
        ["dispute", "Nizo mavjud"],
        ["unknown", "Hali aniqlanmagan"]
      ],

      ru: [
        ["", "Выберите"],
        ["mother", "С матерью"],
        ["father", "С отцом"],
        ["dispute", "Есть спор"],
        ["unknown", "Не определено"]
      ],

      en: [
        ["", "Select"],
        ["mother", "With mother"],
        ["father", "With father"],
        ["dispute", "There is a dispute"],
        ["unknown", "Not determined"]
      ]
    }
  },


  {
    id:
      "aliment_needed",

    label: {
      uz:
        "Aliment masalasi mavjudmi?",

      ru:
        "Есть вопрос об алиментах?",

      en:
        "Is child support an issue?"
    },

    type:
      "select",

    options: {
      uz: [
        ["", "Tanlang"],
        ["yes", "Ha"],
        ["no", "Yo‘q"],
        ["agreement", "Kelishuv mavjud"]
      ],

      ru: [
        ["", "Выберите"],
        ["yes", "Да"],
        ["no", "Нет"],
        ["agreement", "Есть соглашение"]
      ],

      en: [
        ["", "Select"],
        ["yes", "Yes"],
        ["no", "No"],
        ["agreement", "There is an agreement"]
      ]
    }
  },


  {
    id:
      "employment",

    label: {
      uz:
        "Aliment to‘lashi mumkin bo‘lgan shaxsning ish joyi qanday?",

      ru:
        "Где работает лицо, которое может выплачивать алименты?",

      en:
        "What is the employment status of the potential child-support payer?"
    },

    type:
      "text"
  },


  {
    id:
      "income",

    label: {
      uz:
        "Taxminiy oylik daromadi qancha?",

      ru:
        "Каков примерный ежемесячный доход?",

      en:
        "What is the approximate monthly income?"
    },

    type:
      "text"
  },


  {
    id:
      "property_exists",

    label: {
      uz:
        "Nikoh davrida olingan umumiy mol-mulk bormi?",

      ru:
        "Есть совместное имущество, приобретённое в браке?",

      en:
        "Is there marital property acquired during the marriage?"
    },

    type:
      "select",

    options: {
      uz: [
        ["", "Tanlang"],
        ["yes", "Ha"],
        ["no", "Yo‘q"],
        ["unknown", "Aniq emas"]
      ],

      ru: [
        ["", "Выберите"],
        ["yes", "Да"],
        ["no", "Нет"],
        ["unknown", "Неизвестно"]
      ],

      en: [
        ["", "Select"],
        ["yes", "Yes"],
        ["no", "No"],
        ["unknown", "Unknown"]
      ]
    }
  },


  {
    id:
      "property_list",

    label: {
      uz:
        "Mol-mulklarni sanab chiqing.",

      ru:
        "Перечислите имущество.",

      en:
        "List the property."
    },

    type:
      "textarea"
  },


  {
    id:
      "property_owner",

    label: {
      uz:
        "Mol-mulklar kimning nomiga rasmiylashtirilgan?",

      ru:
        "На чьё имя зарегистрировано имущество?",

      en:
        "In whose name is the property registered?"
    },

    type:
      "text"
  },


  {
    id:
      "property_acquisition",

    label: {
      uz:
        "Mol-mulk qachon va qanday mablag‘ hisobidan olingan?",

      ru:
        "Когда и за счёт каких средств было приобретено имущество?",

      en:
        "When was the property acquired and from what source of funds?"
    },

    type:
      "textarea"
  },


  {
    id:
      "renovation",

    label: {
      uz:
        "Mol-mulkka ta’mirlash yoki katta mablag‘ sarflanganmi?",

      ru:
        "Проводился ли ремонт или вкладывались значительные средства в имущество?",

      en:
        "Were renovations or significant funds invested in the property?"
    },

    type:
      "textarea"
  },


  {
    id:
      "prenup",

    label: {
      uz:
        "Nikoh shartnomasi mavjudmi?",

      ru:
        "Есть брачный договор?",

      en:
        "Is there a prenuptial agreement?"
    },

    type:
      "select",

    options: {
      uz: [
        ["", "Tanlang"],
        ["yes", "Ha"],
        ["no", "Yo‘q"]
      ],

      ru: [
        ["", "Выберите"],
        ["yes", "Да"],
        ["no", "Нет"]
      ],

      en: [
        ["", "Select"],
        ["yes", "Yes"],
        ["no", "No"]
      ]
    }
  },


  {
    id:
      "prenup_terms",

    label: {
      uz:
        "Nikoh shartnomasida qanday muhim shartlar bor?",

      ru:
        "Какие важные условия предусмотрены брачным договором?",

      en:
        "What important terms are contained in the prenuptial agreement?"
    },

    type:
      "textarea"
  },


  {
    id:
      "reconciliation",

    label: {
      uz:
        "Yarashish imkoniyati mavjud deb hisoblaysizmi?",

      ru:
        "Считаете ли вы примирение возможным?",

      en:
        "Do you believe reconciliation may be possible?"
    },

    type:
      "select",

    options: {
      uz: [
        ["", "Tanlang"],
        ["yes", "Ha"],
        ["no", "Yo‘q"],
        ["unknown", "Aniq emas"]
      ],

      ru: [
        ["", "Выберите"],
        ["yes", "Да"],
        ["no", "Нет"],
        ["unknown", "Неизвестно"]
      ],

      en: [
        ["", "Select"],
        ["yes", "Yes"],
        ["no", "No"],
        ["unknown", "Unknown"]
      ]
    }
  }

];


// ======================================================
// SAVOLNOMA JAVOBLARINI AI CONTEXTGA AYLANTIRISH
// ======================================================

function buildFamilyContext(form = {}) {
  const lines = [];

  FAMILY_QUESTIONS.forEach(question => {
    const value = form[question.id];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim()
    ) {
      lines.push(
        `${question.id}: ${String(value).trim()}`
      );
    }
  });

  return lines.join("\n");
}


// ======================================================
// HUJJAT TURLARI
// ======================================================

const DOCUMENT_TYPES = [

  {
    id:
      "divorce_claim",

    title: {
      uz:
        "Nikohdan ajratish to‘g‘risida da’vo arizasi",

      ru:
        "Исковое заявление о расторжении брака",

      en:
        "Statement of claim for divorce"
    },

    description: {
      uz:
        "Nikohni sud tartibida bekor qilish uchun dastlabki hujjat loyihasi.",

      ru:
        "Первичный проект документа для расторжения брака в судебном порядке.",

      en:
        "Initial draft for judicial dissolution of marriage."
    }
  },


  {
    id:
      "aliment_claim",

    title: {
      uz:
        "Aliment undirish bo‘yicha ariza",

      ru:
        "Заявление о взыскании алиментов",

      en:
        "Child-support application"
    },

    description: {
      uz:
        "Voyaga yetmagan farzand ta’minoti bo‘yicha hujjat tayyorlash.",

      ru:
        "Подготовка документа по содержанию несовершеннолетнего ребёнка.",

      en:
        "Document preparation concerning support of a minor child."
    }
  },


  {
    id:
      "property_claim",

    title: {
      uz:
        "Mol-mulkni bo‘lish bo‘yicha da’vo",

      ru:
        "Иск о разделе имущества",

      en:
        "Property division claim"
    },

    description: {
      uz:
        "Nikoh davrida orttirilgan mol-mulk bo‘yicha dastlabki da’vo loyihasi.",

      ru:
        "Первичный проект иска по разделу имущества супругов.",

      en:
        "Initial claim draft concerning division of marital property."
    }
  }

];


// ======================================================
// PREMIUM DESIGN — ASOSIY CSS BOSHLANISHI
// ======================================================

const CSS = `

:root{
  --navy:#06111f;
  --navy2:#0a223a;
  --navy3:#0d3150;

  --gold:#c9a86a;
  --gold2:#e6c98e;
  --gold3:#a67d42;
  --goldSoft:#fff7e8;

  --ink:#12263a;
  --muted:#6f7f91;

  --bg:#f4f6f8;
  --surface:#ffffff;

  --line:#e2e7eb;
  --line2:#d5dde4;

  --shadow:
    0 18px 50px rgba(6,17,31,.08);

  --shadowStrong:
    0 30px 80px rgba(6,17,31,.13);
}


*{
  box-sizing:border-box;
}


html{
  scroll-behavior:smooth;
}


body{
  margin:0;

  color:var(--ink);

  background:
    #f4f6f8;

  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Arial,
    sans-serif;

  -webkit-font-smoothing:
    antialiased;
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
  -webkit-tap-highlight-color:
    transparent;
}


/* =====================================================
   NAVIGATION
===================================================== */

.nav{
  position:sticky;

  top:0;

  z-index:1000;

  height:78px;

  background:
    rgba(255,255,255,.94);

  backdrop-filter:
    blur(18px);

  border-bottom:
    1px solid rgba(213,221,228,.85);

  box-shadow:
    0 3px 20px rgba(6,17,31,.025);
}


.navin{
  width:min(1320px,94%);

  height:100%;

  margin:auto;

  display:flex;

  align-items:center;

  justify-content:
    space-between;

  gap:25px;
}


.brand{
  display:flex;

  align-items:center;

  gap:12px;
}


.brandMark{
  position:relative;

  width:42px;
  height:42px;

  display:grid;

  place-items:center;

  overflow:hidden;

  border-radius:11px;

  color:var(--gold2);

  background:
    linear-gradient(
      145deg,
      #06111f,
      #0d3150
    );

  border:
    1px solid rgba(201,168,106,.25);

  box-shadow:
    0 8px 25px rgba(6,17,31,.12);

  font-family:
    Georgia,
    "Times New Roman",
    serif;

  font-size:21px;
}


.brandMark::after{
  content:"";

  position:absolute;

  width:25px;
  height:25px;

  right:-12px;
  bottom:-12px;

  border-radius:50%;

  background:
    rgba(201,168,106,.22);
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

  font-size:20px;

  font-weight:600;

  letter-spacing:-.4px;
}


.brandText small{
  margin-top:2px;

  color:#8c98a5;

  font-size:8px;

  font-weight:800;

  letter-spacing:1.6px;
}


.navlinks{
  display:flex;

  align-items:center;

  gap:4px;
}


.navlinks a{
  position:relative;

  padding:
    10px 12px;

  color:#526276;

  border-radius:8px;

  font-size:11px;

  font-weight:700;

  transition:.18s ease;
}


.navlinks a:hover{
  color:var(--navy);

  background:#f1f4f6;
}


.navlinks a::after{
  content:"";

  position:absolute;

  left:12px;
  right:12px;
  bottom:4px;

  height:1px;

  transform:
    scaleX(0);

  background:
    var(--gold);

  transition:
    transform .18s ease;
}


.navlinks a:hover::after{
  transform:
    scaleX(1);
}


.navRight{
  display:flex;

  align-items:center;

  gap:10px;
}


.languages{
  display:flex;

  padding:3px;

  border:
    1px solid var(--line);

  border-radius:9px;

  background:#f7f9fa;
}


.languages a{
  padding:
    7px 9px;

  color:#7a8795;

  border-radius:6px;

  font-size:9px;

  font-weight:850;

  transition:.18s ease;
}


.languages a:hover{
  color:var(--navy);
}


.languages a.active{
  color:#fff;

  background:
    linear-gradient(
      145deg,
      #06111f,
      #0b2946
    );

  box-shadow:
    0 4px 12px rgba(6,17,31,.12);
}


.mobileMenu{
  display:none;

  width:40px;
  height:40px;

  border:
    1px solid var(--line);

  border-radius:9px;

  background:#fff;

  color:var(--navy);

  cursor:pointer;
}


/* =====================================================
   GENERAL
===================================================== */

.container{
  width:min(1260px,92%);

  margin:auto;
}


.eyebrow{
  display:inline-flex;

  align-items:center;

  gap:7px;

  padding:
    8px 11px;

  color:#88662f;

  background:
    var(--goldSoft);

  border:
    1px solid #ead9b9;

  border-radius:7px;

  font-size:9px;

  font-weight:900;

  letter-spacing:1.3px;
}


.sectionTitle{
  margin:
    9px 0 0;

  color:var(--navy);

  font-family:
    Georgia,
    "Times New Roman",
    serif;

  font-size:
    clamp(32px,4vw,44px);

  font-weight:500;

  letter-spacing:-1.1px;
}


.sectionText{
  max-width:570px;

  color:var(--muted);

  font-size:13px;

  line-height:1.75;
}


.sectionHead{
  display:flex;

  align-items:flex-end;

  justify-content:
    space-between;

  gap:30px;

  margin-bottom:32px;
}


/* =====================================================
   BUTTONS
===================================================== */

.btn{
  min-height:49px;

  padding:
    12px 20px;

  display:inline-flex;

  align-items:center;

  justify-content:center;

  gap:8px;

  border:0;

  border-radius:10px;

  cursor:pointer;

  font-size:11px;

  font-weight:800;

  transition:
    transform .18s ease,
    box-shadow .18s ease,
    background .18s ease;
}


.btn:hover{
  transform:
    translateY(-2px);
}


.btnPrimary{
  color:#fff;

  background:
    linear-gradient(
      145deg,
      #06111f,
      #0b2946
    );

  border:
    1px solid rgba(201,168,106,.16);

  box-shadow:
    0 12px 30px rgba(6,17,31,.16);
}


.btnPrimary:hover{
  box-shadow:
    0 17px 35px rgba(6,17,31,.21);
}


.btnOutline{
  color:var(--navy);

  background:#fff;

  border:
    1px solid var(--line2);
}


.btnOutline:hover{
  border-color:
    rgba(201,168,106,.6);

  box-shadow:
    0 10px 25px rgba(6,17,31,.07);
}


.btnGold{
  color:#071728;

  background:
    linear-gradient(
      145deg,
      #efd69e,
      #c09551
    );

  border:
    1px solid rgba(166,125,66,.35);

  box-shadow:
    0 10px 25px rgba(201,168,106,.18);
}


/* =====================================================
   HERO
===================================================== */

.hero{
  position:relative;

  overflow:hidden;

  background:
    radial-gradient(
      circle at 85% 15%,
      rgba(201,168,106,.09),
      transparent 28%
    ),
    linear-gradient(
      180deg,
      #ffffff 0%,
      #f5f7f9 100%
    );
}


.hero::before{
  content:"";

  position:absolute;

  width:620px;
  height:620px;

  top:-340px;
  right:-180px;

  border:
    1px solid rgba(184,145,80,.14);

  border-radius:50%;
}


.hero::after{
  content:"";

  position:absolute;

  width:420px;
  height:420px;

  top:-245px;
  right:-80px;

  border:
    1px solid rgba(184,145,80,.09);

  border-radius:50%;
}


.heroInner{
  min-height:650px;

  display:grid;

  grid-template-columns:
    1.08fr .92fr;

  align-items:center;

  gap:80px;

  padding:
    70px 0 80px;
}


.heroCopy{
  position:relative;

  z-index:2;
}


.hero h1{
  max-width:760px;

  margin:
    22px 0 22px;

  color:var(--navy);

  font-family:
    Georgia,
    "Times New Roman",
    serif;

  font-size:
    clamp(46px,5.5vw,70px);

  line-height:1.02;

  font-weight:500;

  letter-spacing:-2.4px;
}


.hero h1 span{
  display:block;

  margin-top:7px;

  color:#315d8b;
}


.heroDescription{
  max-width:680px;

  margin:0;

  color:#68798c;

  font-size:15px;

  line-height:1.85;
}


.heroActions{
  display:flex;

  flex-wrap:wrap;

  gap:11px;

  margin-top:31px;
}


.heroTrust{
  display:flex;

  flex-wrap:wrap;

  gap:19px;

  margin-top:32px;
}


.heroTrust span{
  display:flex;

  align-items:center;

  gap:7px;

  color:#748295;

  font-size:10px;

  font-weight:700;
}


.heroTrust i{
  width:20px;
  height:20px;

  display:grid;

  place-items:center;

  color:#97743d;

  background:#faf5eb;

  border-radius:50%;

  font-style:normal;
}


/* =====================================================
   LEGAL ROADMAP
===================================================== */

.roadmap{
  position:relative;

  z-index:2;

  padding:30px;

  background:
    rgba(255,255,255,.96);

  border:
    1px solid var(--line);

  border-radius:18px;

  box-shadow:
    var(--shadowStrong);
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
   SOURCE CARDS
===================================================== */

.sourceCard{
  position:relative;

  min-height:185px;

  padding:25px;

  overflow:hidden;

  background:#fff;

  border:1px solid var(--line);

  border-radius:14px;

  box-shadow:
    0 10px 30px rgba(6,17,31,.035);

  transition:
    transform .2s ease,
    border-color .2s ease,
    box-shadow .2s ease;
}

.sourceCard:hover{
  transform:translateY(-4px);

  border-color:
    rgba(201,168,106,.5);

  box-shadow:
    0 20px 45px rgba(6,17,31,.08);
}

.sourceCard::before{
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

.sourceTop{
  display:flex;

  align-items:center;

  justify-content:space-between;

  gap:15px;

  margin-bottom:19px;
}

.sourceIcon{
  width:42px;
  height:42px;

  display:grid;

  place-items:center;

  color:#9b763d;

  background:#fff8ec;

  border:1px solid #ead9b8;

  border-radius:10px;

  font-family:Georgia,serif;

  font-size:17px;
}

.sourceExternal{
  color:#a5afb9;

  font-size:16px;
}

.sourceCard h3{
  margin:0 0 8px;

  color:var(--navy);

  font-family:Georgia,serif;

  font-size:18px;

  font-weight:600;
}

.sourceCard p{
  margin:0;

  color:#7a8998;

  font-size:11px;

  line-height:1.7;
}


/* =====================================================
   FOOTER
===================================================== */

.footer{
  padding:
    50px 0 25px;

  color:#9eacba;

  background:
    linear-gradient(
      135deg,
      #06111f,
      #081c30
    );

  border-top:
    1px solid rgba(201,168,106,.16);
}

.footerGrid{
  display:grid;

  grid-template-columns:
    1.4fr 1fr 1fr;

  gap:50px;

  padding-bottom:40px;
}

.footerBrand{
  max-width:420px;
}

.footerBrand h3{
  margin:
    16px 0 9px;

  color:#fff;

  font-family:Georgia,serif;

  font-size:23px;

  font-weight:500;
}

.footerBrand p{
  margin:0;

  color:#8191a2;

  font-size:11px;

  line-height:1.75;
}

.footerTitle{
  margin-bottom:15px;

  color:#d9bd83;

  font-size:9px;

  font-weight:900;

  letter-spacing:1.4px;
}

.footerLinks{
  display:grid;

  gap:9px;
}

.footerLinks a{
  color:#92a0ae;

  font-size:11px;

  transition:.18s ease;
}

.footerLinks a:hover{
  color:#fff;
}

.footerBottom{
  padding-top:20px;

  display:flex;

  align-items:center;

  justify-content:space-between;

  gap:20px;

  border-top:
    1px solid rgba(255,255,255,.07);

  color:#657587;

  font-size:9px;
}


/* =====================================================
   APP LAYOUT
===================================================== */

.appPage{
  min-height:100vh;

  background:
    linear-gradient(
      180deg,
      #f5f7f9 0%,
      #eef2f5 100%
    );
}

.appLayout{
  width:min(1480px,96%);

  margin:
    24px auto 50px;

  display:grid;

  grid-template-columns:
    255px minmax(0,1fr);

  gap:22px;

  align-items:start;
}


/* =====================================================
   SIDEBAR
===================================================== */

.sidebar{
  position:sticky;

  top:100px;

  overflow:hidden;

  background:
    linear-gradient(
      180deg,
      #071522,
      #081c30
    );

  border:
    1px solid rgba(201,168,106,.15);

  border-radius:17px;

  box-shadow:
    0 20px 55px rgba(6,17,31,.14);
}

.sidebarBrand{
  position:relative;

  padding:
    25px 22px 22px;

  border-bottom:
    1px solid rgba(255,255,255,.07);
}

.sidebarBrand::after{
  content:"";

  position:absolute;

  left:22px;
  right:22px;
  bottom:-1px;

  height:1px;

  background:
    linear-gradient(
      90deg,
      var(--gold),
      transparent
    );
}

.sidebarBrandTop{
  display:flex;

  align-items:center;

  gap:11px;
}

.sidebarBrandMark{
  width:38px;
  height:38px;

  display:grid;

  place-items:center;

  flex:0 0 auto;

  border-radius:10px;

  color:#071522;

  background:
    linear-gradient(
      145deg,
      #efd69e,
      #b88a47
    );

  font-family:Georgia,serif;

  font-size:18px;
}

.sidebarBrand strong{
  display:block;

  color:#fff;

  font-family:Georgia,serif;

  font-size:17px;

  font-weight:500;
}

.sidebarBrand small{
  display:block;

  margin-top:3px;

  color:#718398;

  font-size:7px;

  font-weight:850;

  letter-spacing:1.3px;
}

.sidebarMenu{
  padding:15px 10px;
}

.sidebarLabel{
  padding:
    10px 12px 7px;

  color:#66798e;

  font-size:7px;

  font-weight:900;

  letter-spacing:1.6px;
}

.sideLink{
  position:relative;

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

  font-family:Georgia,serif;

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

  font-family:Georgia,serif;

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

  font-family:Georgia,serif;

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

  font-family:Georgia,serif;

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

  font-family:Georgia,serif;

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

  font-family:Georgia,serif;

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
  min-height:100px;

  resize:vertical;
}


/* =====================================================
   DOCUMENT CARDS
===================================================== */

.documentGrid{
  display:grid;

  grid-template-columns:
    repeat(3,minmax(0,1fr));

  gap:14px;
}

.documentCard{
  position:relative;

  min-height:215px;

  padding:22px;

  overflow:hidden;

  background:#fff;

  border:
    1px solid var(--line);

  border-radius:13px;

  box-shadow:
    0 10px 30px rgba(6,17,31,.035);

  transition:.2s ease;
}

.documentCard:hover{
  transform:
    translateY(-4px);

  border-color:
    rgba(201,168,106,.48);

  box-shadow:
    0 20px 45px rgba(6,17,31,.08);
}

.documentCardIcon{
  width:42px;
  height:42px;

  margin-bottom:21px;

  display:grid;

  place-items:center;

  color:#9c773e;

  background:#fff8eb;

  border:
    1px solid #ead9b8;

  border-radius:9px;

  font-family:Georgia,serif;

  font-size:17px;
}

.documentCard h3{
  margin:
    0 0 8px;

  color:var(--navy);

  font-family:Georgia,serif;

  font-size:17px;

  font-weight:550;
}

.documentCard p{
  margin:0;

  color:#7b8997;

  font-size:10px;

  line-height:1.7;
}

.documentCard .serviceArrow{
  bottom:17px;
}


/* =====================================================
   CALCULATOR
===================================================== */

.calculatorGrid{
  display:grid;

  grid-template-columns:
    repeat(2,minmax(0,1fr));

  gap:15px;
}

.calcCard{
  padding:23px;

  background:#fff;

  border:
    1px solid var(--line);

  border-radius:13px;

  box-shadow:
    0 10px 30px rgba(6,17,31,.035);
}

.calcCard h3{
  margin:
    0 0 7px;

  color:var(--navy);

  font-family:Georgia,serif;

  font-size:19px;

  font-weight:550;
}

.calcCard p{
  margin:
    0 0 19px;

  color:#7b8998;

  font-size:10px;

  line-height:1.65;
}

.calcResult{
  margin-top:15px;

  padding:16px;

  color:#29415a;

  background:#f5f8fa;

  border:
    1px solid #e1e7eb;

  border-radius:9px;

  font-size:11px;

  line-height:1.65;
}


/* =====================================================
   RESPONSIVE
===================================================== */

@media(max-width:1150px){

  .navlinks{
    display:none;
  }

  .mobileMenu{
    display:grid;
    place-items:center;
  }

  .heroInner{
    grid-template-columns:1fr;

    gap:45px;
  }

  .heroCopy{
    padding-top:25px;
  }

  .serviceGrid{
    grid-template-columns:
      repeat(2,1fr);
  }

  .coreGrid{
    grid-template-columns:
      repeat(2,1fr);
  }

  .sourcesGrid{
    grid-template-columns:
      repeat(2,1fr);
  }

  .appLayout{
    grid-template-columns:
      220px minmax(0,1fr);
  }

}


@media(max-width:900px){

  .appLayout{
    width:min(94%,900px);

    grid-template-columns:1fr;
  }

  .sidebar{
    position:relative;

    top:auto;
  }

  .sidebarMenu{
    display:grid;

    grid-template-columns:
      repeat(3,1fr);

    gap:4px;
  }

  .sidebarLabel{
    display:none;
  }

  .sideLink{
    justify-content:center;

    flex-direction:column;

    gap:5px;

    text-align:center;
  }

  .sidebarBottom{
    display:none;
  }

  .formGrid,
  .calculatorGrid{
    grid-template-columns:1fr;
  }

  .documentGrid{
    grid-template-columns:
      repeat(2,1fr);
  }

}


@media(max-width:720px){

  .nav{
    height:68px;
  }

  .brandText small{
    display:none;
  }

  .languages{
    display:none;
  }

  .heroInner{
    min-height:auto;

    padding:
      65px 0;
  }

  .hero h1{
    font-size:
      clamp(40px,12vw,58px);
  }

  .quickBox{
    grid-template-columns:1fr;
  }

  .serviceGrid,
  .coreGrid,
  .sourcesGrid,
  .documentGrid{
    grid-template-columns:1fr;
  }

  .sectionHead{
    align-items:flex-start;

    flex-direction:column;
  }

  .footerGrid{
    grid-template-columns:1fr;

    gap:30px;
  }

  .footerBottom{
    align-items:flex-start;

    flex-direction:column;
  }

  .sidebarMenu{
    grid-template-columns:
      repeat(2,1fr);
  }

  .appTop{
    align-items:flex-start;
  }

  .appBreadcrumb{
    display:none;
  }

  .appHeader{
    padding:
      25px 22px;
  }

  .appHeader::after{
    font-size:90px;
  }

  .aiBody{
    padding:19px;
  }

  .aiInputBottom{
    align-items:stretch;

    flex-direction:column;
  }

  .aiInputBottom .btn{
    width:100%;
  }

}


@media(max-width:450px){

  .container{
    width:91%;
  }

  .brandText strong{
    font-size:17px;
  }

  .heroActions{
    flex-direction:column;
  }

  .heroActions .btn{
    width:100%;
  }

  .heroTrust{
    display:grid;

    grid-template-columns:1fr;
  }

  .roadmap{
    padding:22px;
  }

  .sidebarMenu{
    grid-template-columns:1fr 1fr;
  }

  .sideLink{
    font-size:8px;
  }

  .appLayout{
    width:94%;
  }

  .appTop{
    padding:10px;
  }

  .appLang a{
    padding:6px;
  }

  .formActions{
    align-items:stretch;

    flex-direction:column;
  }

  .formActions .btn{
    width:100%;
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
// APP LANGUAGE MENU
// ======================================================

function appLanguageMenu(lang, path = "/") {

  lang = getLang(lang);

  return `
    <div class="appLang">

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
// MAIN NAVIGATION
// ======================================================

function navigation(lang) {

  lang = getLang(lang);

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
              ${tr(lang, "brand")}
            </strong>

            <small>
              LEGAL INTELLIGENCE PLATFORM
            </small>

          </span>

        </a>


        <nav class="navlinks">

          <a href="/${q(lang)}">
            ${tr(lang, "home")}
          </a>

          <a href="/ai${q(lang)}">
            ${tr(lang, "assistant")}
          </a>

          <a href="/questionnaire${q(lang)}">
            ${tr(lang, "questionnaire")}
          </a>

          <a href="/sources${q(lang)}">
            ${tr(lang, "sources")}
          </a>

          <a href="/documents${q(lang)}">
            ${tr(lang, "documents")}
          </a>

          <a href="/court${q(lang)}">
            ${tr(lang, "court")}
          </a>

          <a href="/calculators${q(lang)}">
            ${tr(lang, "calculators")}
          </a>

        </nav>


        <div class="navRight">

          ${languageMenu(lang, "/")}

          <button
            class="mobileMenu"
            type="button"
            onclick="document.getElementById('mobileNav').classList.toggle('show')"
            aria-label="Menu"
          >
            ☰
          </button>

        </div>

      </div>


      <div
        id="mobileNav"
        style="
          display:none;
          width:92%;
          margin:auto;
          padding:10px 0 15px;
          gap:7px;
        "
      >

        <a href="/${q(lang)}">
          ${tr(lang, "home")}
        </a>

        <a href="/ai${q(lang)}">
          ${tr(lang, "assistant")}
        </a>

        <a href="/questionnaire${q(lang)}">
          ${tr(lang, "questionnaire")}
        </a>

        <a href="/sources${q(lang)}">
          ${tr(lang, "sources")}
        </a>

        <a href="/documents${q(lang)}">
          ${tr(lang, "documents")}
        </a>

        <a href="/court${q(lang)}">
          ${tr(lang, "court")}
        </a>

        <a href="/calculators${q(lang)}">
          ${tr(lang, "calculators")}
        </a>

      </div>

    </header>

    <style>

      #mobileNav.show{
        display:grid !important;
      }

      #mobileNav a{
        padding:10px 12px;

        color:#526276;

        background:#fff;

        border:1px solid #e3e8ec;

        border-radius:8px;

        font-size:10px;

        font-weight:750;
      }

      @media(min-width:1151px){

        #mobileNav{
          display:none !important;
        }

      }

    </style>

  `;
}


// ======================================================
// FOOTER
// ======================================================

function footer(lang) {

  lang = getLang(lang);

  const t = {

    uz: {
      text:
        "O‘zbekiston huquqiy tizimida yo‘l topishga yordam beruvchi raqamli huquqiy platforma.",

      platform:
        "PLATFORMA",

      official:
        "RASMIY MANBALAR",

      disclaimer:
        "Huquqiy AI advokat yoki sudning o‘rnini bosmaydi.",

      privacy:
        "Maxfiylik va shaxsiy ma’lumotlarni himoya qilish muhim tamoyildir."
    },

    ru: {
      text:
        "Цифровая юридическая платформа для навигации в правовой системе Узбекистана.",

      platform:
        "ПЛАТФОРМА",

      official:
        "ОФИЦИАЛЬНЫЕ ИСТОЧНИКИ",

      disclaimer:
        "Huquqiy AI не заменяет адвоката или суд.",

      privacy:
        "Конфиденциальность и защита персональных данных являются важными принципами."
    },

    en: {
      text:
        "A digital legal platform designed to help navigate the legal system of Uzbekistan.",

      platform:
        "PLATFORM",

      official:
        "OFFICIAL SOURCES",

      disclaimer:
        "Huquqiy AI does not replace a lawyer or a court.",

      privacy:
        "Privacy and personal-data protection are important principles."
    }

  }[lang];


  return `

    <footer class="footer">

      <div class="container">

        <div class="footerGrid">

          <div class="footerBrand">

            <span class="brandMark">
              §
            </span>

            <h3>
              Huquqiy AI
            </h3>

            <p>
              ${t.text}
            </p>

          </div>


          <div>

            <div class="footerTitle">
              ${t.platform}
            </div>

            <div class="footerLinks">

              <a href="/ai${q(lang)}">
                ${tr(lang, "assistant")}
              </a>

              <a href="/questionnaire${q(lang)}">
                ${tr(lang, "questionnaire")}
              </a>

              <a href="/documents${q(lang)}">
                ${tr(lang, "documents")}
              </a>

              <a href="/court${q(lang)}">
                ${tr(lang, "court")}
              </a>

            </div>

          </div>


          <div>

            <div class="footerTitle">
              ${t.official}
            </div>

            <div class="footerLinks">

              <a
                href="https://lex.uz"
                target="_blank"
                rel="noopener noreferrer"
              >
                LexUZ ↗
              </a>

              <a
                href="https://sud.uz"
                target="_blank"
                rel="noopener noreferrer"
              >
                sud.uz ↗
              </a>

              <a
                href="https://my.sud.uz"
                target="_blank"
                rel="noopener noreferrer"
              >
                my.sud.uz ↗
              </a>

            </div>

          </div>

        </div>


        <div class="footerBottom">

          <span>
            © ${new Date().getFullYear()} Huquqiy AI
          </span>

          <span>
            ${t.disclaimer}
          </span>

          <span>
            ${t.privacy}
          </span>

        </div>

      </div>

    </footer>

  `;
}


// ======================================================
// STANDARD PAGE
// ======================================================

function page({
  lang = "uz",
  title = "Huquqiy AI",
  content = ""
}) {

  lang = getLang(lang);

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
    content="#06111f"
  >

  <title>
    ${esc(title)}
  </title>

  <style>
    ${CSS}
    ${CSS_APP}
  </style>

</head>


<body>

  ${navigation(lang)}

  ${content}

  ${footer(lang)}

</body>

</html>
  `;
}


// ======================================================
// SIDEBAR
// ======================================================

function sidebar(lang, active = "") {

  lang = getLang(lang);

  function link(
    id,
    href,
    icon,
    label
  ) {

    return `

      <a
        class="sideLink ${active === id ? "active" : ""}"
        href="${href}${q(lang)}"
      >

        <span class="sideIcon">
          ${icon}
        </span>

        <span>
          ${label}
        </span>

      </a>

    `;
  }


  const security = {

    uz:
      "Shaxsiy ma’lumotlaringizni ochiq maydonga kiritishda ehtiyot bo‘ling.",

    ru:
      "Будьте осторожны при вводе персональных данных.",

    en:
      "Be careful when entering personal information."

  }[lang];


  return `

    <aside class="sidebar">

      <div class="sidebarBrand">

        <div class="sidebarBrandTop">

          <span class="sidebarBrandMark">
            §
          </span>

          <div>

            <strong>
              Huquqiy AI
            </strong>

            <small>
              LEGAL WORKSPACE
            </small>

          </div>

        </div>

      </div>


      <div class="sidebarMenu">

        <div class="sidebarLabel">
          WORKSPACE
        </div>

        ${link(
          "ai",
          "/ai",
          "✦",
          tr(lang, "assistant")
        )}

        ${link(
          "questionnaire",
          "/questionnaire",
          "✓",
          tr(lang, "questionnaire")
        )}

        ${link(
          "documents",
          "/documents",
          "▤",
          tr(lang, "documents")
        )}


        <div class="sidebarLabel">
          LEGAL TOOLS
        </div>

        ${link(
          "sources",
          "/sources",
          "§",
          tr(lang, "sources")
        )}

        ${link(
          "court",
          "/court",
          "⚖",
          tr(lang, "court")
        )}

        ${link(
          "calculators",
          "/calculators",
          "∑",
          tr(lang, "calculators")
        )}

      </div>


      <div class="sidebarBottom">

        <div class="sidebarSecurity">

          <span>
            ◈
          </span>

          <span>
            ${security}
          </span>

        </div>

      </div>

    </aside>

  `;
}


// ======================================================
// APP LAYOUT
// ======================================================

function appLayout(
  lang,
  active,
  content,
  title,
  description = ""
) {

  lang = getLang(lang);

  const pathMap = {
    ai: "/ai",
    questionnaire: "/questionnaire",
    sources: "/sources",
    documents: "/documents",
    court: "/court",
    calculators: "/calculators"
  };


  const currentPath =
    pathMap[active] ||
    "/";


  const workspaceText = {

    uz:
      "HUQUQIY ISH MAYDONI",

    ru:
      "ЮРИДИЧЕСКОЕ ПРОСТРАНСТВО",

    en:
      "LEGAL WORKSPACE"

  }[lang];


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
    content="#06111f"
  >

  <title>
    ${esc(title)} — Huquqiy AI
  </title>


  <style>
    ${CSS}
    ${CSS_APP}
  </style>

</head>


<body class="appPage">

  ${navigation(lang)}


  <div class="appLayout">

    ${sidebar(lang, active)}


    <main class="appMain">


      <div class="appTop">

        <div class="appBreadcrumb">

          <span>
            Huquqiy AI
          </span>

          <span>
            /
          </span>

          <strong>
            ${esc(title)}
          </strong>

        </div>


        <div class="appTopRight">

          ${appLanguageMenu(
            lang,
            currentPath
          )}

          <a
            class="appHomeButton"
            href="/${q(lang)}"
            title="${tr(lang, "home")}"
          >
            ⌂
          </a>

        </div>

      </div>


      <section class="appHeader">

        <div class="appHeaderSmall">
          ${workspaceText}
        </div>

        <h1>
          ${esc(title)}
        </h1>

        ${
          description
            ? `
              <p>
                ${esc(description)}
              </p>
            `
            : ""
        }

      </section>


      ${content}


    </main>

  </div>

</body>

</html>
  `;
}


// ======================================================
// HOME PAGE
// ======================================================

function homePage(lang) {

  lang = getLang(lang);


  const t = {

    uz: {

      eyebrow:
        "O‘ZBEKISTON UCHUN RAQAMLI HUQUQIY YORDAMCHI",

      hero1:
        "Huquqiy muammoingizni",

      hero2:
        "tushunishdan boshlang.",

      heroText:
        "Huquqiy AI vaziyatingizni bosqichma-bosqich tahlil qilish, muhim faktlarni aniqlash, rasmiy manbalarni tekshirish va keyingi huquqiy qadamlarni tushunishga yordam beradi.",

      ai:
        "AI yordamchini ochish",

      questionnaire:
        "Savolnomani boshlash",

      trust1:
        "O‘zbekiston huquq tizimiga yo‘naltirilgan",

      trust2:
        "Rasmiy manbalar bilan ishlash",

      trust3:
        "3 tilda ishlaydi",

      roadmapSmall:
        "HUQUQIY TAHLIL TIZIMI",

      roadmap:
        "Vaziyatdan yechimgacha",

      active:
        "FAOL",

      r1:
        "Muammo",

      r1t:
        "Foydalanuvchining asosiy huquqiy muammosini aniqlash.",

      r2:
        "Muhim savollar",

      r2t:
        "Huquqiy ahamiyatga ega faktlarni aniqlashtirish.",

      r3:
        "Huquqiy tahlil",

      r3t:
        "Vaziyatni huquqiy yo‘nalishlar va manbalar asosida tahlil qilish.",

      r4:
        "Keyingi qadam",

      r4t:
        "Hujjat, rasmiy manba yoki sudga murojaat yo‘lini ko‘rsatish.",

      quickSmall:
        "TEZKOR BOSHLASH",

      quickTitle:
        "Muammoingizni oddiy tilda yozing.",

      quickText:
        "Murakkab yuridik terminlardan foydalanishingiz shart emas. Vaziyatni qanday bo‘lgan bo‘lsa, shunday tushuntiring.",

      quickButton:
        "Tahlilni boshlash",

      areasSmall:
        "HUQUQIY YO‘NALISHLAR",

      areasTitle:
        "Asosiy huquqiy masalalar",

      areasText:
        "Platforma bir nechta huquqiy yo‘nalish bo‘yicha dastlabki tahlil va yo‘naltirish imkonini beradi.",

      coreSmall:
        "HUQUQIY AI METODI",

      coreTitle:
        "Tizimli huquqiy tahlil",

      coreText:
        "Javob faqat bitta umumiy matndan iborat emas. Vaziyat faktlardan keyingi amaliy qadamgacha tizimli ravishda ko‘rib chiqiladi.",

      sourceSmall:
        "RASMIY MANBALAR",

      sourceTitle:
        "Ishonchli huquqiy manbalar",

      sourceText:
        "Muhim huquqiy ma’lumotlarni rasmiy manbalardan tekshirish tavsiya etiladi."

    },


    ru: {

      eyebrow:
        "ЦИФРОВОЙ ЮРИДИЧЕСКИЙ ПОМОЩНИК ДЛЯ УЗБЕКИСТАНА",

      hero1:
        "Начните с понимания",

      hero2:
        "вашей правовой ситуации.",

      heroText:
        "Huquqiy AI помогает поэтапно анализировать ситуацию, выявлять важные факты, проверять официальные источники и понимать дальнейшие юридические действия.",

      ai:
        "Открыть AI-помощника",

      questionnaire:
        "Начать опрос",

      trust1:
        "Ориентирован на право Узбекистана",

      trust2:
        "Работа с официальными источниками",

      trust3:
        "Работает на 3 языках",

      roadmapSmall:
        "СИСТЕМА ПРАВОВОГО АНАЛИЗА",

      roadmap:
        "От ситуации к решению",

      active:
        "АКТИВНО",

      r1:
        "Проблема",

      r1t:
        "Определение основной правовой проблемы пользователя.",

      r2:
        "Важные вопросы",

      r2t:
        "Уточнение юридически значимых фактов.",

      r3:
        "Правовой анализ",

      r3t:
        "Анализ ситуации с учётом правовых направлений и источников.",

      r4:
        "Следующий шаг",

      r4t:
        "Переход к документу, официальному источнику или суду.",

      quickSmall:
        "БЫСТРЫЙ СТАРТ",

      quickTitle:
        "Опишите проблему простыми словами.",

      quickText:
        "Вам не обязательно использовать сложные юридические термины. Просто расскажите, что произошло.",

      quickButton:
        "Начать анализ",

      areasSmall:
        "НАПРАВЛЕНИЯ ПРАВА",

      areasTitle:
        "Основные правовые вопросы",

      areasText:
        "Платформа предоставляет первичный анализ и навигацию по нескольким правовым направлениям.",

      coreSmall:
        "МЕТОД HUQUQIY AI",

      coreTitle:
        "Системный правовой анализ",

      coreText:
        "Ответ строится от фактов и правового вопроса до возможных дальнейших действий.",

      sourceSmall:
        "ОФИЦИАЛЬНЫЕ ИСТОЧНИКИ",

      sourceTitle:
        "Надёжные правовые источники",

      sourceText:
        "Важную юридическую информацию рекомендуется проверять по официальным источникам."

    },


    en: {

      eyebrow:
        "DIGITAL LEGAL ASSISTANT FOR UZBEKISTAN",

      hero1:
        "Start by understanding",

      hero2:
        "your legal situation.",

      heroText:
        "Huquqiy AI helps analyze your situation step by step, identify important facts, check official sources and understand possible next legal steps.",

      ai:
        "Open AI assistant",

      questionnaire:
        "Start questionnaire",

      trust1:
        "Focused on Uzbekistan law",

      trust2:
        "Official-source oriented",

      trust3:
        "Available in 3 languages",

      roadmapSmall:
        "LEGAL ANALYSIS SYSTEM",

      roadmap:
        "From situation to next step",

      active:
        "ACTIVE",

      r1:
        "Problem",

      r1t:
        "Identify the user's central legal issue.",

      r2:
        "Key questions",

      r2t:
        "Clarify legally important facts.",

      r3:
        "Legal analysis",

      r3t:
        "Analyze the situation using relevant legal areas and sources.",

      r4:
        "Next step",

      r4t:
        "Move toward a document, official source or court process.",

      quickSmall:
        "QUICK START",

      quickTitle:
        "Describe your problem in plain language.",

      quickText:
        "You do not need complicated legal terminology. Simply explain what happened.",

      quickButton:
        "Start analysis",

      areasSmall:
        "LEGAL AREAS",

      areasTitle:
        "Key legal matters",

      areasText:
        "The platform provides initial analysis and navigation across several legal areas.",

      coreSmall:
        "HUQUQIY AI METHOD",

      coreTitle:
        "Structured legal analysis",

      coreText:
        "The response is structured from facts and legal issues through possible next steps.",

      sourceSmall:
        "OFFICIAL SOURCES",

      sourceTitle:
        "Reliable legal sources",

      sourceText:
        "Important legal information should be verified through official sources."

    }

  }[lang];


  const areaCards =
    LEGAL_AREAS
      .map(
        (area, index) => `

          <a
            class="serviceCard"
            href="/ai${q(lang)}&area=${encodeURIComponent(area.id)}"
          >

            <span class="serviceNo">
              ${String(index + 1).padStart(2, "0")}
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

            <span class="serviceArrow">
              →
            </span>

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

            <div class="sourceTop">

              <span class="sourceIcon">
                §
              </span>

              <span class="sourceExternal">
                ↗
              </span>

            </div>

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

          </a>

        `
      )
      .join("");


  return page({

    lang,

    title:
      "Huquqiy AI",

    content: `

      <!-- HERO -->

      <section class="hero">

        <div class="container heroInner">


          <div class="heroCopy">

            <span class="eyebrow">
              § ${t.eyebrow}
            </span>


            <h1>

              ${t.hero1}

              <span>
                ${t.hero2}
              </span>

            </h1>


            <p class="heroDescription">
              ${t.heroText}
            </p>


            <div class="heroActions">

              <a
                class="btn btnPrimary"
                href="/ai${q(lang)}"
              >
                ✦ ${t.ai}
              </a>

              <a
                class="btn btnOutline"
                href="/questionnaire${q(lang)}"
              >
                ✓ ${t.questionnaire}
              </a>

            </div>


            <div class="heroTrust">

              <span>
                <i>✓</i>
                ${t.trust1}
              </span>

              <span>
                <i>✓</i>
                ${t.trust2}
              </span>

              <span>
                <i>✓</i>
                ${t.trust3}
              </span>

            </div>

          </div>



          <div class="roadmap">

            <div class="roadmapHeader">

              <div>

                <small>
                  ${t.roadmapSmall}
                </small>

                <strong>
                  ${t.roadmap}
                </strong>

              </div>

              <span class="roadmapBadge">
                ● ${t.active}
              </span>

            </div>


            <div class="roadStep">

              <span class="roadNumber">
                01
              </span>

              <div>

                <strong>
                  ${t.r1}
                </strong>

                <p>
                  ${t.r1t}
                </p>

              </div>

            </div>


            <div class="roadStep">

              <span class="roadNumber">
                02
              </span>

              <div>

                <strong>
                  ${t.r2}
                </strong>

                <p>
                  ${t.r2t}
                </p>

              </div>

            </div>


            <div class="roadStep">

              <span class="roadNumber">
                03
              </span>

              <div>

                <strong>
                  ${t.r3}
                </strong>

                <p>
                  ${t.r3t}
                </p>

              </div>

            </div>


            <div class="roadStep">

              <span class="roadNumber">
                04
              </span>

              <div>

                <strong>
                  ${t.r4}
                </strong>

                <p>
                  ${t.r4t}
                </p>

              </div>

            </div>

          </div>


        </div>

      </section>



      <!-- QUICK START -->

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
                ${t.quickText}
              </p>

            </div>


            <a
              class="btn btnGold"
              href="/ai${q(lang)}"
            >
              ${t.quickButton} →
            </a>

          </div>

        </div>

      </section>



      <!-- LEGAL AREAS -->

      <section class="services">

        <div class="container">

          <div class="sectionHead">

            <div>

              <span class="eyebrow">
                ${t.areasSmall}
              </span>

              <h2 class="sectionTitle">
                ${t.areasTitle}
              </h2>

            </div>

            <p class="sectionText">
              ${t.areasText}
            </p>

          </div>


          <div class="serviceGrid">

            ${areaCards}

          </div>

        </div>

      </section>



      <!-- CORE METHOD -->

      <section class="coreSection">

        <div class="container">

          <div class="sectionHead">

            <div>

              <span class="eyebrow">
                ${t.coreSmall}
              </span>

              <h2 class="sectionTitle">
                ${t.coreTitle}
              </h2>

            </div>

            <p class="sectionText">
              ${t.coreText}
            </p>

          </div>


          <div class="coreGrid">

            <div class="coreItem">

              <span>
                01
              </span>

              <strong>
                PROBLEM
              </strong>

              <p>
                ${
                  lang === "uz"
                    ? "Huquqiy muammo aniqlanadi."
                    : lang === "ru"
                    ? "Определяется правовая проблема."
                    : "The legal problem is identified."
                }
              </p>

            </div>


            <div class="coreItem">

              <span>
                02
              </span>

              <strong>
                FACTS
              </strong>

              <p>
                ${
                  lang === "uz"
                    ? "Huquqiy ahamiyatga ega faktlar ajratiladi."
                    : lang === "ru"
                    ? "Выделяются юридически значимые факты."
                    : "Legally significant facts are identified."
                }
              </p>

            </div>


            <div class="coreItem">

              <span>
                03
              </span>

              <strong>
                ANALYSIS
              </strong>

              <p>
                ${
                  lang === "uz"
                    ? "Vaziyat huquqiy jihatdan tahlil qilinadi."
                    : lang === "ru"
                    ? "Ситуация анализируется с правовой точки зрения."
                    : "The situation is legally analyzed."
                }
              </p>

            </div>


            <div class="coreItem">

              <span>
                04
              </span>

              <strong>
                NEXT STEP
              </strong>

              <p>
                ${
                  lang === "uz"
                    ? "Keyingi amaliy qadamlar tushuntiriladi."
                    : lang === "ru"
                    ? "Объясняются дальнейшие практические шаги."
                    : "Practical next steps are explained."
                }
              </p>

            </div>

          </div>

        </div>

      </section>



      <!-- SOURCES -->

      <section class="sourcesSection">

        <div class="container">

          <div class="sectionHead">

            <div>

              <span class="eyebrow">
                ${t.sourceSmall}
              </span>

              <h2 class="sectionTitle">
                ${t.sourceTitle}
              </h2>

            </div>

            <p class="sectionText">
              ${t.sourceText}
            </p>

          </div>


          <div class="sourcesGrid">

            ${sourceCards}

          </div>

        </div>

      </section>

    `

  });

}


// ======================================================
// END OF PART 2/4
// ======================================================
// ======================================================
// PART 3/4
// AI / QUESTIONNAIRE / DOCUMENTS / SOURCES / CALCULATORS
// ======================================================


// ======================================================
// AI PAGE
// ======================================================

function aiPage(lang) {

  lang = getLang(lang);

  const t = {

    uz: {
      title: "Huquqiy AI yordamchi",
      description:
        "Huquqiy vaziyatingizni oddiy tilda yozing. Tizim muammoni, muhim faktlarni va keyingi qadamlarni tahlil qiladi.",

      status: "TIZIM TAYYOR",

      heading:
        "Huquqiy vaziyatingizni yozing",

      text:
        "Muammoni imkon qadar aniq tushuntiring. Ismlar, pasport ma’lumotlari yoki boshqa ortiqcha shaxsiy ma’lumotlarni kiritishingiz shart emas.",

      placeholder:
        "Masalan: Turmush o‘rtog‘im bilan ajrashmoqchimiz. Ikki nafar voyaga yetmagan farzandimiz bor. Uy nikoh davomida sotib olingan...",

      hint:
        "Huquqiy vaziyatni matn orqali kiriting.",

      button:
        "Huquqiy tahlil qilish",

      chip1:
        "Nikohdan ajratish",

      chip2:
        "Aliment",

      chip3:
        "Mol-mulkni bo‘lish",

      chip4:
        "Farzandlar masalasi",

      chip5:
        "Meros",

      notice:
        "AI javobi dastlabki huquqiy yo‘naltirish hisoblanadi. Muhim qaror qabul qilishdan oldin amaldagi qonunchilik va rasmiy manbalarni tekshiring."
    },


    ru: {
      title: "Юридический AI-помощник",

      description:
        "Опишите правовую ситуацию простыми словами. Система поможет определить проблему, важные факты и возможные дальнейшие действия.",

      status: "СИСТЕМА ГОТОВА",

      heading:
        "Опишите вашу правовую ситуацию",

      text:
        "Постарайтесь описать ситуацию точно. Не обязательно указывать Ф.И.О., паспортные данные и лишние персональные сведения.",

      placeholder:
        "Например: Мы с супругом хотим развестись. У нас двое несовершеннолетних детей. Квартира была приобретена в период брака...",

      hint:
        "Введите правовую ситуацию текстом.",

      button:
        "Провести правовой анализ",

      chip1:
        "Развод",

      chip2:
        "Алименты",

      chip3:
        "Раздел имущества",

      chip4:
        "Вопросы детей",

      chip5:
        "Наследство",

      notice:
        "Ответ AI является первичной юридической навигацией. Перед принятием важных решений проверьте действующее законодательство и официальные источники."
    },


    en: {
      title: "Legal AI Assistant",

      description:
        "Describe your legal situation in plain language. The system helps identify the problem, important facts and possible next steps.",

      status: "SYSTEM READY",

      heading:
        "Describe your legal situation",

      text:
        "Describe the situation as accurately as possible. You do not need to provide names, passport details or unnecessary personal information.",

      placeholder:
        "Example: My spouse and I are considering divorce. We have two minor children. The apartment was purchased during the marriage...",

      hint:
        "Enter your legal situation as text.",

      button:
        "Analyze legal situation",

      chip1:
        "Divorce",

      chip2:
        "Child support",

      chip3:
        "Property division",

      chip4:
        "Children",

      chip5:
        "Inheritance",

      notice:
        "The AI response provides initial legal guidance. Verify current law and official sources before making important decisions."
    }

  }[lang];


  return appLayout(

    lang,

    "ai",

    `

      <div class="notice noticeGold">

        <span class="noticeIcon">
          ◈
        </span>

        <span>
          ${t.notice}
        </span>

      </div>


      <section class="aiShell">

        <div class="aiTopBar">

          <div class="aiIdentity">

            <div class="aiOrb">
              §
            </div>

            <div>

              <strong>
                Huquqiy AI
              </strong>

              <small>
                LEGAL INTELLIGENCE
              </small>

            </div>

          </div>


          <div class="aiStatus">
            ${t.status}
          </div>

        </div>


        <div class="aiBody">

          <div class="aiIntro">

            <h2>
              ${t.heading}
            </h2>

            <p>
              ${t.text}
            </p>

          </div>


          <form
            method="POST"
            action="/ai-result${q(lang)}"
          >

            <div class="aiInputWrap">

              <div class="aiInputInner">

                <textarea
                  id="legalQuestion"
                  name="question"
                  required
                  maxlength="12000"
                  placeholder="${esc(t.placeholder)}"
                ></textarea>


                <div class="aiInputBottom">

                  <span class="aiHint">
                    ✎ ${t.hint}
                  </span>

                  <button
                    type="submit"
                    class="btn btnGold"
                  >
                    ✦ ${t.button}
                  </button>

                </div>

              </div>

            </div>


            <div class="aiSuggestions">

              <button
                type="button"
                class="aiChip"
                data-ai-example="${esc(t.chip1)}"
              >
                ⚖ ${t.chip1}
              </button>


              <button
                type="button"
                class="aiChip"
                data-ai-example="${esc(t.chip2)}"
              >
                ◇ ${t.chip2}
              </button>


              <button
                type="button"
                class="aiChip"
                data-ai-example="${esc(t.chip3)}"
              >
                ⌂ ${t.chip3}
              </button>


              <button
                type="button"
                class="aiChip"
                data-ai-example="${esc(t.chip4)}"
              >
                ✓ ${t.chip4}
              </button>


              <button
                type="button"
                class="aiChip"
                data-ai-example="${esc(t.chip5)}"
              >
                § ${t.chip5}
              </button>

            </div>

          </form>

        </div>

      </section>


      <script>

        (() => {

          const textarea =
            document.getElementById(
              "legalQuestion"
            );

          document
            .querySelectorAll(
              "[data-ai-example]"
            )
            .forEach(button => {

              button.addEventListener(
                "click",
                () => {

                  if (!textarea) return;

                  const value =
                    button.dataset.aiExample || "";

                  textarea.value =
                    value + ": ";

                  textarea.focus();

                }
              );

            });

        })();

      </script>

    `,

    t.title,

    t.description

  );

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
        ? "AI tahlilini olishda xatolik yuz berdi. Serverdagi OPENROUTER_API_KEY sozlamasini tekshiring."
        : lang === "ru"
        ? "Не удалось получить AI-анализ. Проверьте OPENROUTER_API_KEY на сервере."
        : "The AI analysis could not be generated. Check OPENROUTER_API_KEY on the server.";

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
        "Huquqiy ma’lumotlarni tekshirish uchun asosiy rasmiy resurslar.",

      info:
        "AI tomonidan berilgan muhim huquqiy ma’lumotni amaldagi rasmiy matn bilan solishtirish tavsiya etiladi.",

      open:
        "Rasmiy saytni ochish"
    },


    ru: {
      title:
        "Официальные правовые источники",

      description:
        "Основные официальные ресурсы для проверки правовой информации.",

      info:
        "Важную правовую информацию, полученную от AI, рекомендуется сверять с действующим официальным текстом.",

      open:
        "Открыть официальный сайт"
    },


    en: {
      title:
        "Official legal sources",

      description:
        "Key official resources for verifying legal information.",

      info:
        "Important legal information provided by AI should be checked against the current official text.",

      open:
        "Open official website"
    }

  }[lang];


  const cards =
    LEGAL_SOURCES
      .map(
        source => `

          <a
            class="sourceCard"
            href="${source.url}"
            target="_blank"
            rel="noopener noreferrer"
          >

            <div class="sourceTop">

              <span class="sourceIcon">
                §
              </span>

              <span class="sourceExternal">
                ↗
              </span>

            </div>


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


            <div
              style="
                margin-top:18px;
                color:#99733b;
                font-size:9px;
                font-weight:850;
              "
            >
              ${t.open} →
            </div>

          </a>

        `
      )
      .join("");


  return appLayout(

    lang,

    "sources",

    `

      <div class="notice noticeGold">

        <span class="noticeIcon">
          §
        </span>

        <span>
          ${t.info}
        </span>

      </div>


      <div class="sourcesGrid">

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
        "Vaziyatingizga mos dastlabki huquqiy hujjat loyihasini tayyorlang.",

      info:
        "Tayyorlangan hujjat loyiha hisoblanadi. Sudga yoki boshqa organga topshirishdan oldin faktlar, talablar, rekvizitlar va amaldagi qonunchilikni tekshirish kerak.",

      create:
        "Hujjat tayyorlash"
    },


    ru: {
      title:
        "Юридические документы",

      description:
        "Подготовьте первичный проект юридического документа с учётом вашей ситуации.",

      info:
        "Созданный документ является проектом. Перед подачей необходимо проверить факты, требования, реквизиты и действующее законодательство.",

      create:
        "Подготовить документ"
    },


    en: {
      title:
        "Legal documents",

      description:
        "Prepare an initial legal-document draft based on your situation.",

      info:
        "The generated document is a draft. Verify facts, claims, details and current law before filing.",

      create:
        "Prepare document"
    }

  }[lang];


  const cards =
    DOCUMENT_TYPES
      .map(
        document => `

          <a
            class="documentCard"
            href="/claim${q(lang)}&type=${encodeURIComponent(document.id)}"
          >

            <div class="documentCardIcon">
              ▤
            </div>

            <h3>
              ${esc(
                localized(
                  document.title,
                  lang
                )
              )}
            </h3>

            <p>
              ${esc(
                localized(
                  document.description,
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


  return appLayout(

    lang,

    "documents",

    `

      <div class="notice noticeGold">

        <span class="noticeIcon">
          !
        </span>

        <span>
          ${t.info}
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
  type = "divorce_claim"
) {

  lang = getLang(lang);


  const selectedType =
    DOCUMENT_TYPES.find(
      item => item.id === type
    ) ||
    DOCUMENT_TYPES[0];


  const t = {

    uz: {
      title:
        "Hujjat loyihasini tayyorlash",

      description:
        "Quyidagi ma’lumotlarni kiriting. AI ularni huquqiy hujjat loyihasiga aylantiradi.",

      documentType:
        "Hujjat turi",

      court:
        "Sud nomi",

      courtPlaceholder:
        "Masalan: Fuqarolik ishlari bo‘yicha ... sudi",

      claimant:
        "Arizachi / da’vogar",

      claimantPlaceholder:
        "F.I.Sh. yoki keyin to‘ldirish uchun belgi",

      defendant:
        "Ikkinchi taraf / javobgar",

      defendantPlaceholder:
        "F.I.Sh. yoki keyin to‘ldirish uchun belgi",

      address:
        "Manzil va aloqa ma’lumotlari",

      facts:
        "Ish holatlari",

      factsPlaceholder:
        "Vaziyatni xronologik va aniq bayon qiling...",

      request:
        "Suddan yoki organdan nima so‘ralmoqda?",

      requestPlaceholder:
        "Talablaringizni yozing...",

      evidence:
        "Mavjud dalillar va ilovalar",

      evidencePlaceholder:
        "Guvohnoma, shartnoma, to‘lov hujjati va boshqalar...",

      create:
        "Hujjat loyihasini yaratish",

      warning:
        "Maxfiy ma’lumotlarni zarurat bo‘lmasa kiritmang."
    },


    ru: {
      title:
        "Подготовка проекта документа",

      description:
        "Введите данные ниже. AI сформирует первичный проект юридического документа.",

      documentType:
        "Тип документа",

      court:
        "Наименование суда",

      courtPlaceholder:
        "Например: Межрайонный суд по гражданским делам...",

      claimant:
        "Заявитель / истец",

      claimantPlaceholder:
        "Ф.И.О. или отметка для последующего заполнения",

      defendant:
        "Вторая сторона / ответчик",

      defendantPlaceholder:
        "Ф.И.О. или отметка для последующего заполнения",

      address:
        "Адрес и контактные данные",

      facts:
        "Обстоятельства дела",

      factsPlaceholder:
        "Изложите ситуацию последовательно и точно...",

      request:
        "Что вы просите у суда или органа?",

      requestPlaceholder:
        "Укажите требования...",

      evidence:
        "Имеющиеся доказательства и приложения",

      evidencePlaceholder:
        "Свидетельство, договор, платежные документы и т.д.",

      create:
        "Создать проект документа",

      warning:
        "Не указывайте конфиденциальные сведения без необходимости."
    },


    en: {
      title:
        "Prepare document draft",

      description:
        "Enter the information below. AI will turn it into an initial legal-document draft.",

      documentType:
        "Document type",

      court:
        "Court name",

      courtPlaceholder:
        "Example: Interdistrict Civil Court...",

      claimant:
        "Applicant / claimant",

      claimantPlaceholder:
        "Full name or placeholder",

      defendant:
        "Other party / defendant",

      defendantPlaceholder:
        "Full name or placeholder",

      address:
        "Address and contact information",

      facts:
        "Facts of the case",

      factsPlaceholder:
        "Describe the situation chronologically and accurately...",

      request:
        "What are you asking the court or authority to do?",

      requestPlaceholder:
        "State the requested relief...",

      evidence:
        "Available evidence and attachments",

      evidencePlaceholder:
        "Certificate, agreement, payment records, etc.",

      create:
        "Create document draft",

      warning:
        "Do not provide confidential information unless necessary."
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
          ${t.warning}
        </span>

      </div>


      <div class="surface surfacePad">

        <h2 class="cardTitle">
          ${esc(
            localized(
              selectedType.title,
              lang
            )
          )}
        </h2>


        <p class="cardDescription">
          ${esc(
            localized(
              selectedType.description,
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
            value="${esc(selectedType.id)}"
          >


          <div class="formGrid">


            <div class="formGroup full">

              <label>
                ${t.documentType}
              </label>

              <select
                name="document_type"
              >

                ${DOCUMENT_TYPES
                  .map(
                    item => `

                      <option
                        value="${esc(item.id)}"
                        ${
                          item.id === selectedType.id
                            ? "selected"
                            : ""
                        }
                      >
                        ${esc(
                          localized(
                            item.title,
                            lang
                          )
                        )}
                      </option>

                    `
                  )
                  .join("")}

              </select>

            </div>


            <div class="formGroup full">

              <label>
                ${t.court}
              </label>

              <input
                name="court"
                placeholder="${esc(t.courtPlaceholder)}"
              >

            </div>


            <div class="formGroup">

              <label>
                ${t.claimant}
              </label>

              <input
                name="claimant"
                placeholder="${esc(t.claimantPlaceholder)}"
              >

            </div>


            <div class="formGroup">

              <label>
                ${t.defendant}
              </label>

              <input
                name="defendant"
                placeholder="${esc(t.defendantPlaceholder)}"
              >

            </div>


            <div class="formGroup full">

              <label>
                ${t.address}
              </label>

              <input
                name="address"
              >

            </div>


            <div class="formGroup full">

              <label>
                ${t.facts}
              </label>

              <textarea
                name="facts"
                required
                placeholder="${esc(t.factsPlaceholder)}"
              ></textarea>

            </div>


            <div class="formGroup full">

              <label>
                ${t.request}
              </label>

              <textarea
                name="request"
                placeholder="${esc(t.requestPlaceholder)}"
              ></textarea>

            </div>


            <div class="formGroup full">

              <label>
                ${t.evidence}
              </label>

              <textarea
                name="evidence"
                placeholder="${esc(t.evidencePlaceholder)}"
              ></textarea>

            </div>

          </div>


          <div class="formActions">

            <button
              type="submit"
              class="btn btnGold"
            >
              ✦ ${t.create}
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
// CLAIM RESULT
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
        String(
          form.document_type ||
          form.type ||
          ""
        )
    ) ||
    DOCUMENT_TYPES[0];


  const t = {

    uz: {
      title:
        "Hujjat loyihasi",

      description:
        "Taqdim etilgan ma’lumotlar asosida yaratilgan dastlabki huquqiy hujjat.",

      label:
        "HUQUQIY AI • HUJJAT LOYIHASI",

      edit:
        "Qayta tayyorlash",

      documents:
        "Hujjatlar",

      instruction:
        `Quyidagi ma’lumotlar asosida professional huquqiy hujjat loyihasini tayyorlang.

Muhim:
- mavjud bo‘lmagan faktlarni uydirmang;
- mavjud bo‘lmagan qonun moddalarini uydirmang;
- yetishmayotgan rekvizitlar uchun [TO‘LDIRING] belgisi qo‘ying;
- rasmiy va professional uslubdan foydalaning;
- hujjat tuzilishini saqlang;
- ilovalar bo‘limini kiriting;
- zarur bo‘lsa, topshirishdan oldin amaldagi qonunchilikni tekshirish kerakligini qayd eting.`
    },


    ru: {
      title:
        "Проект документа",

      description:
        "Первичный юридический документ, сформированный на основе предоставленных данных.",

      label:
        "HUQUQIY AI • ПРОЕКТ ДОКУМЕНТА",

      edit:
        "Подготовить заново",

      documents:
        "Документы",

      instruction:
        `Подготовьте профессиональный проект юридического документа на основе предоставленной информации.

Важно:
- не придумывайте отсутствующие факты;
- не придумывайте статьи законодательства;
- для недостающих реквизитов используйте [ЗАПОЛНИТЬ];
- используйте официальный профессиональный стиль;
- соблюдайте структуру документа;
- добавьте раздел приложений;
- при необходимости укажите, что перед подачей следует проверить действующее законодательство.`
    },


    en: {
      title:
        "Document draft",

      description:
        "Initial legal document generated from the information provided.",

      label:
        "HUQUQIY AI • DOCUMENT DRAFT",

      edit:
        "Prepare again",

      documents:
        "Documents",

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


  // ----------------------------------------------------
  // CRIMINAL DISTRICT COURTS
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
      "jinoyat bektemir criminal court"
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
      "jinoyat chilonzor criminal court"
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
      "jinoyat mirobod criminal court"
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
      "jinoyat mirzo ulugbek criminal court"
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
      "jinoyat olmazor criminal court"
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
      "jinoyat sergeli criminal court"
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
      "jinoyat shayxontohur criminal court"
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
      "jinoyat uchtepa criminal court"
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
      "jinoyat yakkasaroy criminal court"
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
      "jinoyat yashnobod criminal court"
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
      "jinoyat yunusobod criminal court"
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
      "jinoyat yangihayot criminal court"
  }

];


// ======================================================
// GOOGLE MAPS HELPERS
// ======================================================

function googleMapsSearch(
  name,
  district = ""
) {

  const query =
    `${name}, ${district}, Toshkent, Uzbekistan`;


  return (
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(query)
  );

}


function googleMapsDirections(
  name,
  district = ""
) {

  const destination =
    `${name}, ${district}, Toshkent, Uzbekistan`;


  return (
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent(destination) +
    "&travelmode=driving"
  );

}


// ======================================================
// COURT FINDER CSS
// ======================================================

const COURT_CSS = `

.courtToolbar{
  display:flex;

  align-items:center;

  justify-content:space-between;

  gap:15px;

  margin-bottom:15px;

  padding:15px;

  background:#fff;

  border:
    1px solid #e0e6eb;

  border-radius:13px;

  box-shadow:
    0 9px 28px rgba(6,17,31,.04);
}


.courtSearch{
  position:relative;

  flex:1;
}


.courtSearch span{
  position:absolute;

  left:14px;

  top:50%;

  transform:
    translateY(-50%);

  color:#a27b40;

  font-size:14px;
}


.courtSearch input{
  width:100%;

  height:47px;

  padding:
    10px 14px 10px 40px;

  color:#263d55;

  background:#f8fafb;

  border:
    1px solid #dde4e9;

  border-radius:9px;

  outline:0;

  font-size:10px;
}


.courtSearch input:focus{
  background:#fff;

  border-color:
    rgba(201,168,106,.65);

  box-shadow:
    0 0 0 3px rgba(201,168,106,.09);
}


.courtCount{
  min-width:110px;

  padding:
    10px 13px;

  text-align:center;

  color:#617183;

  background:#f6f8f9;

  border:
    1px solid #e0e6ea;

  border-radius:8px;

  font-size:9px;

  font-weight:800;
}


.courtFilters{
  display:flex;

  flex-wrap:wrap;

  gap:7px;

  margin-bottom:15px;
}


.courtFilter{
  padding:
    9px 12px;

  color:#6f7e8e;

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
  color:#8e6a33;

  border-color:
    rgba(201,168,106,.5);
}


.courtFilter.active{
  color:#fff;

  background:
    linear-gradient(
      145deg,
      #071522,
      #0a2946
    );

  border-color:#0a2946;

  box-shadow:
    0 7px 18px rgba(6,17,31,.13);
}


.courtFinderGrid{
  display:grid;

  grid-template-columns:
    minmax(360px,.82fr)
    minmax(450px,1.18fr);

  gap:15px;

  align-items:start;
}


.courtListPanel{
  overflow:hidden;

  background:#fff;

  border:
    1px solid #e0e6eb;

  border-radius:14px;

  box-shadow:
    0 12px 35px rgba(6,17,31,.045);
}


.courtListHeader{
  padding:
    17px 19px;

  display:flex;

  align-items:center;

  justify-content:space-between;

  gap:15px;

  border-bottom:
    1px solid #edf0f2;
}


.courtListHeader strong{
  color:#172f47;

  font-family:Georgia,serif;

  font-size:17px;

  font-weight:550;
}


.courtListHeader span{
  color:#9b7840;

  font-size:8px;

  font-weight:850;

  letter-spacing:1px;
}


.courtList{
  max-height:650px;

  padding:10px;

  overflow:auto;
}


.courtList::-webkit-scrollbar{
  width:5px;
}


.courtList::-webkit-scrollbar-thumb{
  background:#d4dce3;

  border-radius:20px;
}


.courtCard{
  margin-bottom:8px;

  padding:15px;

  background:#fbfcfd;

  border:
    1px solid #e6eaee;

  border-radius:10px;

  transition:.18s ease;
}


.courtCard:hover{
  background:#fff;

  border-color:
    rgba(201,168,106,.5);

  box-shadow:
    0 10px 25px rgba(6,17,31,.06);
}


.courtCardTop{
  display:flex;

  align-items:flex-start;

  justify-content:space-between;

  gap:12px;
}


.courtTypeIcon{
  width:36px;
  height:36px;

  display:grid;

  place-items:center;

  flex:0 0 auto;

  color:#94703a;

  background:#fff7e8;

  border:
    1px solid #ead9b8;

  border-radius:8px;

  font-family:Georgia,serif;

  font-size:14px;
}


.courtCardContent{
  flex:1;

  min-width:0;
}


.courtCard h3{
  margin:0;

  color:#19324b;

  font-family:Georgia,serif;

  font-size:14px;

  line-height:1.4;

  font-weight:550;
}


.courtMeta{
  display:flex;

  flex-wrap:wrap;

  gap:6px;

  margin-top:8px;
}


.courtTag{
  padding:
    5px 7px;

  color:#718090;

  background:#f1f4f6;

  border-radius:5px;

  font-size:7px;

  font-weight:800;
}


.courtTag.gold{
  color:#86632f;

  background:#fff6e6;
}


.courtActions{
  display:grid;

  grid-template-columns:
    1fr 1fr;

  gap:7px;

  margin-top:12px;
}


.courtMapButton{
  min-height:37px;

  padding:
    8px 9px;

  display:flex;

  align-items:center;

  justify-content:center;

  gap:6px;

  color:#314960;

  background:#fff;

  border:
    1px solid #dde4e9;

  border-radius:7px;

  font-size:8px;

  font-weight:800;

  transition:.18s ease;
}


.courtMapButton:hover{
  color:#805f2f;

  border-color:
    rgba(201,168,106,.55);
}


.courtMapButton.primary{
  color:#fff;

  background:#0a223a;

  border-color:#0a223a;
}


.courtMapPanel{
  position:sticky;

  top:100px;

  overflow:hidden;

  min-height:650px;

  background:#fff;

  border:
    1px solid #e0e6eb;

  border-radius:14px;

  box-shadow:
    0 12px 35px rgba(6,17,31,.045);
}


.courtMapHeader{
  padding:
    17px 19px;

  display:flex;

  align-items:center;

  justify-content:space-between;

  gap:20px;

  border-bottom:
    1px solid #edf0f2;
}


.courtMapHeader strong{
  color:#19324b;

  font-family:Georgia,serif;

  font-size:17px;

  font-weight:550;
}


.courtMapHeader span{
  color:#8996a4;

  font-size:8px;
}


.courtMapFrame{
  width:100%;

  height:590px;

  border:0;

  display:block;

  background:#eef2f5;
}


.courtEmpty{
  padding:35px 20px;

  text-align:center;

  color:#84919f;

  font-size:10px;
}


.courtSteps{
  display:grid;

  grid-template-columns:
    repeat(4,1fr);

  gap:10px;

  margin-top:15px;
}


.courtStep{
  padding:18px;

  background:#fff;

  border:
    1px solid #e0e6eb;

  border-radius:11px;
}


.courtStep span{
  display:block;

  margin-bottom:11px;

  color:#ad874a;

  font-family:Georgia,serif;

  font-size:17px;
}


.courtStep strong{
  display:block;

  margin-bottom:6px;

  color:#1c354e;

  font-size:10px;
}


.courtStep p{
  margin:0;

  color:#7e8c9b;

  font-size:9px;

  line-height:1.6;
}


@media(max-width:1100px){

  .courtFinderGrid{
    grid-template-columns:1fr;
  }

  .courtMapPanel{
    position:relative;

    top:auto;
  }

  .courtSteps{
    grid-template-columns:
      repeat(2,1fr);
  }

}


@media(max-width:600px){

  .courtToolbar{
    align-items:stretch;

    flex-direction:column;
  }

  .courtCount{
    width:100%;
  }

  .courtActions{
    grid-template-columns:1fr;
  }

  .courtMapFrame{
    height:420px;
  }

  .courtMapPanel{
    min-height:auto;
  }

  .courtSteps{
    grid-template-columns:1fr;
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
      general: "Shahar sudi",
      civil: "Fuqarolik",
      criminal: "Jinoyat",
      administrative: "Ma’muriy",
      economic: "Iqtisodiy"
    },

    ru: {
      general: "Городской суд",
      civil: "Гражданский",
      criminal: "Уголовный",
      administrative: "Административный",
      economic: "Экономический"
    },

    en: {
      general: "City court",
      civil: "Civil",
      criminal: "Criminal",
      administrative: "Administrative",
      economic: "Economic"
    }

  };


  return (
    labels[getLang(lang)][type] ||
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

      title:
        "Sudlar va xarita",

      description:
        "Toshkent shahridagi sudni yo‘nalishi yoki nomi bo‘yicha toping va Google Maps orqali manzil hamda yo‘nalishni oching.",

      warning:
        "Sudga borishdan oldin sudning amaldagi nomi, hududiy sudlovga tegishliligi va manzilini rasmiy sud resurslaridan tekshirish tavsiya etiladi.",

      search:
        "Sud nomi yoki tumanni yozing...",

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

      city:
        "Shahar sudi",

      list:
        "Toshkent sudlari",

      finder:
        "COURT FINDER",

      map:
        "Google Maps",

      mapHint:
        "Sudni tanlang",

      maps:
        "Google Maps’da ochish",

      direction:
        "Yo‘lni ko‘rsatish",

      found:
        "ta sud topildi",

      empty:
        "Qidiruv bo‘yicha sud topilmadi.",

      step1:
        "Vaziyatni aniqlang",

      step1Text:
        "Nizo qaysi huquqiy yo‘nalishga tegishli ekanini aniqlang.",

      step2:
        "Tegishli sudni aniqlang",

      step2Text:
        "Ishning turi va hududiy sudlovga tegishliligini tekshiring.",

      step3:
        "Hujjatlarni tayyorlang",

      step3Text:
        "Ariza, da’vo va mavjud dalillarni tartibga keltiring.",

      step4:
        "Rasmiy ma’lumotni tekshiring",

      step4Text:
        "Sud manzili va murojaat tartibini rasmiy sud tizimidan tekshiring.",

      documents:
        "Hujjat tayyorlash",

      official:
        "Sud tizimini ochish"

    },


    ru: {

      title:
        "Суды и карта",

      description:
        "Найдите суд в Ташкенте по названию или направлению и откройте местоположение и маршрут через Google Maps.",

      warning:
        "Перед посещением суда рекомендуется проверить актуальное наименование, территориальную подсудность и адрес по официальным судебным ресурсам.",

      search:
        "Введите название суда или район...",

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

      city:
        "Городской суд",

      list:
        "Суды Ташкента",

      finder:
        "COURT FINDER",

      map:
        "Google Maps",

      mapHint:
        "Выберите суд",

      maps:
        "Открыть в Google Maps",

      direction:
        "Построить маршрут",

      found:
        "судов найдено",

      empty:
        "По вашему запросу суд не найден.",

      step1:
        "Определите ситуацию",

      step1Text:
        "Определите, к какой категории права относится спор.",

      step2:
        "Определите суд",

      step2Text:
        "Проверьте вид дела и территориальную подсудность.",

      step3:
        "Подготовьте документы",

      step3Text:
        "Подготовьте заявление, иск и имеющиеся доказательства.",

      step4:
        "Проверьте официальные данные",

      step4Text:
        "Проверьте адрес суда и порядок обращения на официальном судебном ресурсе.",

      documents:
        "Подготовить документ",

      official:
        "Открыть судебную систему"

    },


    en: {

      title:
        "Courts and map",

      description:
        "Find a court in Tashkent by name or legal category and open its location or directions through Google Maps.",

      warning:
        "Before visiting a court, verify its current name, territorial jurisdiction and address through official judicial resources.",

      search:
        "Enter court name or district...",

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

      city:
        "City court",

      list:
        "Tashkent courts",

      finder:
        "COURT FINDER",

      map:
        "Google Maps",

      mapHint:
        "Select a court",

      maps:
        "Open in Google Maps",

      direction:
        "Get directions",

      found:
        "courts found",

      empty:
        "No court matches your search.",

      step1:
        "Identify the situation",

      step1Text:
        "Determine the legal category of the dispute.",

      step2:
        "Identify the court",

      step2Text:
        "Check the case type and territorial jurisdiction.",

      step3:
        "Prepare documents",

      step3Text:
        "Organize the application, claim and available evidence.",

      step4:
        "Verify official information",

      step4Text:
        "Verify the court address and filing procedure through official judicial resources.",

      documents:
        "Prepare document",

      official:
        "Open court system"

    }

  }[lang];


  const cards =
    TASHKENT_COURTS
      .map(
        court => {

          const name =
            localized(
              court.name,
              lang
            );


          const mapsUrl =
            googleMapsSearch(
              name,
              court.district
            );


          const directionUrl =
            googleMapsDirections(
              name,
              court.district
            );


          const searchable =
            (
              name +
              " " +
              court.district +
              " " +
              court.type +
              " " +
              court.keywords
            )
              .toLowerCase()
              .replace(/"/g, "&quot;");


          return `

            <article
              class="courtCard"
              data-type="${esc(court.type)}"
              data-search="${esc(searchable)}"
              data-name="${esc(name)}"
              data-district="${esc(court.district)}"
              data-map="${esc(mapsUrl)}"
            >

              <div class="courtCardTop">

                <span class="courtTypeIcon">
                  ⚖
                </span>


                <div class="courtCardContent">

                  <h3>
                    ${esc(name)}
                  </h3>


                  <div class="courtMeta">

                    <span class="courtTag gold">
                      ${esc(
                        courtTypeLabel(
                          court.type,
                          lang
                        )
                      )}
                    </span>

                    <span class="courtTag">
                      ${esc(court.district)}
                    </span>

                  </div>

                </div>

              </div>


              <div class="courtActions">

                <button
                  type="button"
                  class="courtMapButton"
                  onclick="showCourtMap(this)"
                  data-map="${esc(mapsUrl)}"
                  data-name="${esc(name)}"
                >
                  📍 ${t.maps}
                </button>


                <a
                  class="courtMapButton primary"
                  href="${directionUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🧭 ${t.direction}
                </a>

              </div>

            </article>

          `;

        }
      )
      .join("");


  const initialMap =
    "https://www.google.com/maps?q=" +
    encodeURIComponent(
      "Toshkent shahar sudlari, Tashkent, Uzbekistan"
    ) +
    "&output=embed";


  const content = `

    <style>
      ${COURT_CSS}
    </style>


    <div class="notice noticeGold">

      <span class="noticeIcon">
        ⚖
      </span>

      <span>
        ${t.warning}
      </span>

    </div>


    <div class="courtToolbar">

      <div class="courtSearch">

        <span>
          ⌕
        </span>

        <input
          id="courtSearch"
          type="search"
          placeholder="${esc(t.search)}"
          autocomplete="off"
        >

      </div>


      <div
        class="courtCount"
        id="courtCount"
      >
        ${TASHKENT_COURTS.length}
        ${t.found}
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
        data-filter="general"
      >
        ${t.city}
      </button>

    </div>



    <div class="courtFinderGrid">


      <section class="courtListPanel">

        <div class="courtListHeader">

          <strong>
            ${t.list}
          </strong>

          <span>
            ${t.finder}
          </span>

        </div>


        <div
          class="courtList"
          id="courtList"
        >

          ${cards}


          <div
            class="courtEmpty"
            id="courtEmpty"
            style="display:none;"
          >
            ${t.empty}
          </div>

        </div>

      </section>



      <section class="courtMapPanel">

        <div class="courtMapHeader">

          <strong
            id="courtMapTitle"
          >
            ${t.map}
          </strong>

          <span>
            ${t.mapHint}
          </span>

        </div>


        <iframe
          id="courtMap"
          class="courtMapFrame"
          src="${initialMap}"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          title="Court map"
        ></iframe>

      </section>


    </div>



    <div class="courtSteps">


      <div class="courtStep">

        <span>
          01
        </span>

        <strong>
          ${t.step1}
        </strong>

        <p>
          ${t.step1Text}
        </p>

      </div>


      <div class="courtStep">

        <span>
          02
        </span>

        <strong>
          ${t.step2}
        </strong>

        <p>
          ${t.step2Text}
        </p>

      </div>


      <div class="courtStep">

        <span>
          03
        </span>

        <strong>
          ${t.step3}
        </strong>

        <p>
          ${t.step3Text}
        </p>

      </div>


      <div class="courtStep">

        <span>
          04
        </span>

        <strong>
          ${t.step4}
        </strong>

        <p>
          ${t.step4Text}
        </p>

      </div>


    </div>



    <div class="formActions">

      <a
        class="btn btnPrimary"
        href="/documents${q(lang)}"
      >
        ▤ ${t.documents}
      </a>


      <a
        class="btn btnOutline"
        href="https://my.sud.uz"
        target="_blank"
        rel="noopener noreferrer"
      >
        ⚖ ${t.official} ↗
      </a>

    </div>



    <script>

      (() => {

        const searchInput =
          document.getElementById(
            "courtSearch"
          );


        const cards =
          Array.from(
            document.querySelectorAll(
              ".courtCard"
            )
          );


        const filterButtons =
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
          const STATE_ORGANIZATIONS = [
  // =========================
  // OLIY SUD
  // =========================
  {
    id: "supreme-court",
    category: "court",
    type: "supreme",
    region: "Toshkent shahri",
    district: "Shayxontohur",
    name: "O‘zbekiston Respublikasi Oliy sudi",
    address: "Abdulla Qodiriy ko‘chasi, 1-uy, 100186",
    phone: "+998 71 207-73-77",
    extension: "01613",
    email: "info@supcourt.uz",
    source: "sud.uz"
  },

  // =========================
  // TOSHKENT SHAHAR SUDI
  // =========================
  {
    id: "tashkent-city-court",
    category: "court",
    type: "general",
    region: "Toshkent shahri",
    name: "Toshkent shahar sudi",
    address: "A. Navoiy ko‘chasi, 23A-uy",
    phone: "+998 55 501-11-15",
    source: "sud.uz"
  },

  {
    id: "tashkent-criminal-panel",
    category: "court",
    type: "criminal",
    region: "Toshkent shahri",
    name: "Toshkent shahar sudi — Jinoyat ishlari bo‘yicha sudlov hay’ati",
    address: "A. Navoiy ko‘chasi, 23A-uy",
    phone: "+998 55 501-11-15",
    extension: "02001",
    source: "sud.uz"
  },

  {
    id: "tashkent-civil-panel",
    category: "court",
    type: "civil",
    region: "Toshkent shahri",
    district: "Yakkasaroy",
    name: "Toshkent shahar sudi — Fuqarolik ishlari bo‘yicha sudlov hay’ati",
    address: "Shota Rustaveli ko‘chasi, 93-uy",
    phone: "+998 55 501-00-23",
    extension: "02629",
    source: "sud.uz"
  },

  {
    id: "tashkent-economic-panel",
    category: "court",
    type: "economic",
    region: "Toshkent shahri",
    district: "Yakkasaroy",
    name: "Toshkent shahar sudi — Iqtisodiy ishlar bo‘yicha sudlov hay’ati",
    address: "Shota Rustaveli ko‘chasi, 93-uy",
    phone: "+998 55 501-00-16",
    extension: "03124",
    source: "sud.uz"
  },

  // =========================
  // MA'MURIY SUD
  // =========================
  {
    id: "tashkent-administrative",
    category: "court",
    type: "administrative",
    region: "Toshkent shahri",
    district: "Yunusobod",
    name: "Toshkent shahar ma’muriy sudi",
    address: "Amir Temur ko‘chasi, 118A-uy",
    phone: "+998 55 501-11-14",
    extension: "03001",
    source: "sud.uz"
  },

  // =========================
  // IQTISODIY SUD
  // =========================
  {
    id: "tashkent-economic-interdistrict",
    category: "court",
    type: "economic",
    region: "Toshkent shahri",
    district: "Chilonzor",
    name: "Toshkent tumanlararo iqtisodiy sudi",
    address: "Cho‘pon-ota ko‘chasi, 6-uy",
    phone: "+998 55 501-05-04",
    extension: "03165",
    source: "sud.uz"
  },

  // =========================
  // MIROBOD TUMAN SUDI
  // =========================
  {
    id: "mirobod-criminal-court",
    category: "court",
    type: "criminal",
    region: "Toshkent shahri",
    district: "Mirobod",
    name: "Jinoyat ishlari bo‘yicha Mirobod tuman sudi",
    address: "Fidokor ko‘chasi, 38-uy, 100015",
    phone: "+998 71 252-00-03",
    email: "j.mirobod@sud.uz",
    source: "sud.uz"
  },

  // =========================
  // TOSHKENTDAGI QOLGAN
  // JINOYAT SUDLARI
  // =========================

  {
    id: "bektemir-criminal",
    category: "court",
    type: "criminal",
    region: "Toshkent shahri",
    district: "Bektemir",
    name: "Jinoyat ishlari bo‘yicha Bektemir tuman sudi",
    phone: null,
    verification: "Telefon raqami rasmiy manbadan yangilanmoqda"
  },

  {
    id: "chilonzor-criminal",
    category: "court",
    type: "criminal",
    region: "Toshkent shahri",
    district: "Chilonzor",
    name: "Jinoyat ishlari bo‘yicha Chilonzor tuman sudi",
    phone: null,
    verification: "Telefon raqami rasmiy manbadan yangilanmoqda"
  },

  {
    id: "mirzo-ulugbek-criminal",
    category: "court",
    type: "criminal",
    region: "Toshkent shahri",
    district: "Mirzo Ulug‘bek",
    name: "Jinoyat ishlari bo‘yicha Mirzo Ulug‘bek tuman sudi",
    phone: null,
    verification: "Telefon raqami rasmiy manbadan yangilanmoqda"
  },

  {
    id: "olmazor-criminal",
    category: "court",
    type: "criminal",
    region: "Toshkent shahri",
    district: "Olmazor",
    name: "Jinoyat ishlari bo‘yicha Olmazor tuman sudi",
    phone: null,
    verification: "Telefon raqami rasmiy manbadan yangilanmoqda"
  },

  {
    id: "sergeli-criminal",
    category: "court",
    type: "criminal",
    region: "Toshkent shahri",
    district: "Sergeli",
    name: "Jinoyat ishlari bo‘yicha Sergeli tuman sudi",
    phone: null,
    verification: "Telefon raqami rasmiy manbadan yangilanmoqda"
  },

  {
    id: "shayxontohur-criminal",
    category: "court",
    type: "criminal",
    region: "Toshkent shahri",
    district: "Shayxontohur",
    name: "Jinoyat ishlari bo‘yicha Shayxontohur tuman sudi",
    phone: null,
    verification: "Telefon raqami rasmiy manbadan yangilanmoqda"
  },

  {
    id: "uchtepa-criminal",
    category: "court",
    type: "criminal",
    region: "Toshkent shahri",
    district: "Uchtepa",
    name: "Jinoyat ishlari bo‘yicha Uchtepa tuman sudi",
    phone: null,
    verification: "Telefon raqami rasmiy manbadan yangilanmoqda"
  },

  {
    id: "yakkasaroy-criminal",
    category: "court",
    type: "criminal",
    region: "Toshkent shahri",
    district: "Yakkasaroy",
    name: "Jinoyat ishlari bo‘yicha Yakkasaroy tuman sudi",
    phone: null,
    verification: "Telefon raqami rasmiy manbadan yangilanmoqda"
  },

  {
    id: "yashnobod-criminal",
    category: "court",
    type: "criminal",
    region: "Toshkent shahri",
    district: "Yashnobod",
    name: "Jinoyat ishlari bo‘yicha Yashnobod tuman sudi",
    phone: null,
    verification: "Telefon raqami rasmiy manbadan yangilanmoqda"
  },

  {
    id: "yunusobod-criminal",
    category: "court",
    type: "criminal",
    region: "Toshkent shahri",
    district: "Yunusobod",
    name: "Jinoyat ishlari bo‘yicha Yunusobod tuman sudi",
    phone: null,
    verification: "Telefon raqami rasmiy manbadan yangilanmoqda"
  },

  {
    id: "yangihayot-criminal",
    category: "court",
    type: "criminal",
    region: "Toshkent shahri",
    district: "Yangihayot",
    name: "Jinoyat ishlari bo‘yicha Yangihayot tuman sudi",
    phone: null,
    verification: "Telefon raqami rasmiy manbadan yangilanmoqda"
  },

  // =========================
  // SUD DEPARTAMENTI
  // =========================
  {
    id: "court-department-tashkent",
    category: "court_department",
    region: "Toshkent shahri",
    district: "Yakkasaroy",
    name: "Oliy sud huzuridagi Sudlar faoliyatini ta’minlash departamentining Toshkent shahar hududiy bo‘limi",
    address: "Shota Rustaveli ko‘chasi, 62-uy",
    phone: "+998 55 501-00-04",
    extension: "03142",
    source: "sud.uz"
  }
  ,
{
  id: "tashkent-iibb",
  category: "internal_affairs",
  type: "regional",
  region: "Toshkent shahri",
  name: "Toshkent shahar Ichki ishlar bosh boshqarmasi",
  address: "S. Azimov ko‘chasi, 87-uy",
  phone: "+998 71 206-41-65",
  appealsPhone: "+998 71 206-43-34",
  emergencyPhone: "102",
  source: "iibb.uz"
},

{
  id: "police-emergency-102",
  category: "internal_affairs",
  type: "emergency",
  region: "O‘zbekiston",
  name: "Ichki ishlar organlari tezkor raqami",
  phone: "102",
  description: "Huquqbuzarlik, jinoyat yoki tezkor ichki ishlar yordami zarur bo‘lgan holatlar uchun.",
  source: "iibb.uz"
}
,

// ======================================================
// TOSHKENT SHAHRI — BARCHA TUMAN IIO FMB
// ======================================================

{
  id: "bektemir-iio-fmb",
  category: "internal_affairs",
  type: "district",
  region: "Toshkent shahri",
  district: "Bektemir",
  name: "Bektemir tumani IIO FMB",
  emergencyPhone: "102",
  hotline: "1102",
  source: "iibb.uz"
},

{
  id: "chilonzor-iio-fmb",
  category: "internal_affairs",
  type: "district",
  region: "Toshkent shahri",
  district: "Chilonzor",
  name: "Chilonzor tumani IIO FMB",
  emergencyPhone: "102",
  hotline: "1102",
  source: "iibb.uz"
},

{
  id: "mirobod-iio-fmb",
  category: "internal_affairs",
  type: "district",
  region: "Toshkent shahri",
  district: "Mirobod",
  name: "Mirobod tumani IIO FMB",
  emergencyPhone: "102",
  hotline: "1102",
  source: "iibb.uz"
},

{
  id: "mirzo-ulugbek-iio-fmb",
  category: "internal_affairs",
  type: "district",
  region: "Toshkent shahri",
  district: "Mirzo Ulug‘bek",
  name: "Mirzo Ulug‘bek tumani IIO FMB",
  emergencyPhone: "102",
  hotline: "1102",
  source: "iibb.uz"
},

{
  id: "olmazor-iio-fmb",
  category: "internal_affairs",
  type: "district",
  region: "Toshkent shahri",
  district: "Olmazor",
  name: "Olmazor tumani IIO FMB",
  emergencyPhone: "102",
  hotline: "1102",
  source: "iibb.uz"
},

{
  id: "sergeli-iio-fmb",
  category: "internal_affairs",
  type: "district",
  region: "Toshkent shahri",
  district: "Sergeli",
  name: "Sergeli tumani IIO FMB",
  emergencyPhone: "102",
  hotline: "1102",
  source: "iibb.uz"
},

{
  id: "shayxontohur-iio-fmb",
  category: "internal_affairs",
  type: "district",
  region: "Toshkent shahri",
  district: "Shayxontohur",
  name: "Shayxontohur tumani IIO FMB",
  emergencyPhone: "102",
  hotline: "1102",
  source: "iibb.uz"
},

{
  id: "uchtepa-iio-fmb",
  category: "internal_affairs",
  type: "district",
  region: "Toshkent shahri",
  district: "Uchtepa",
  name: "Uchtepa tumani IIO FMB",
  emergencyPhone: "102",
  hotline: "1102",
  source: "iibb.uz"
},

{
  id: "yakkasaroy-iio-fmb",
  category: "internal_affairs",
  type: "district",
  region: "Toshkent shahri",
  district: "Yakkasaroy",
  name: "Yakkasaroy tumani IIO FMB",
  emergencyPhone: "102",
  hotline: "1102",
  source: "iibb.uz"
},

{
  id: "yashnobod-iio-fmb",
  category: "internal_affairs",
  type: "district",
  region: "Toshkent shahri",
  district: "Yashnobod",
  name: "Yashnobod tumani IIO FMB",
  emergencyPhone: "102",
  hotline: "1102",
  source: "iibb.uz"
},

{
  id: "yunusobod-iio-fmb",
  category: "internal_affairs",
  type: "district",
  region: "Toshkent shahri",
  district: "Yunusobod",
  name: "Yunusobod tumani IIO FMB",
  emergencyPhone: "102",
  hotline: "1102",
  source: "iibb.uz"
},

{
  id: "yangihayot-iio-fmb",
  category: "internal_affairs",
  type: "district",
  region: "Toshkent shahri",
  district: "Yangihayot",
  name: "Yangihayot tumani IIO FMB",
  phone: "+998 71 258-03-11",
  emergencyPhone: "102",
  hotline: "1102",
  source: "iibb.uz"
}

]; // STATE_ORGANIZATIONS TUGADI


        function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/['‘’ʻ\u0060]/g, "")
    .trim();
}

        function applyFilters(){

          const query =
            normalize(
              searchInput.value
            );


          let visibleCount =
            0;


          cards.forEach(card => {

            const type =
              card.dataset.type;


            const text =
              normalize(
                card.dataset.search
              );


            const filterMatch =
              currentFilter === "all" ||
              type === currentFilter;


            const searchMatch =
              !query ||
              text.includes(query);


            const visible =
              filterMatch &&
              searchMatch;


            card.style.display =
              visible
                ? ""
                : "none";


            if(visible){
              visibleCount++;
            }

          });


          counter.textContent =
            visibleCount +
            " ${t.found}";


          empty.style.display =
            visibleCount === 0
              ? "block"
              : "none";

        }


        searchInput.addEventListener(
          "input",
          applyFilters
        );


        filterButtons.forEach(
          button => {

            button.addEventListener(
              "click",
              () => {

                filterButtons.forEach(
                  item =>
                    item.classList.remove(
                      "active"
                    )
                );


                button.classList.add(
                  "active"
                );


                currentFilter =
                  button.dataset.filter ||
                  "all";


                applyFilters();

              }
            );

          }
        );


        window.showCourtMap =
          function(button){

            const mapUrl =
              button.dataset.map;


            const courtName =
              button.dataset.name;


            const frame =
              document.getElementById(
                "courtMap"
              );


            const title =
              document.getElementById(
                "courtMapTitle"
              );


            if(courtName){

              title.textContent =
                courtName;

            }


            if(!mapUrl){
              return;
            }


            /*
             * Google Maps search URL'ni
             * embed URL'ga aylantiramiz.
             */

            try{

              const parsed =
                new URL(mapUrl);


              const query =
                parsed.searchParams.get(
                  "query"
                );


              if(query){

                frame.src =
                  "https://www.google.com/maps?q=" +
                  encodeURIComponent(query) +
                  "&output=embed";

              }


            }catch(error){

              console.error(
                "Map error:",
                error
              );

            }

          };


        /*
         * Agar foydalanuvchi qidiruvdan
         * Enter bossa, birinchi ko'rinayotgan
         * sud xaritada ochiladi.
         */

        searchInput.addEventListener(
          "keydown",
          event => {

            if(
              event.key !== "Enter"
            ){
              return;
            }


            event.preventDefault();


            const firstVisible =
              cards.find(
                card =>
                  card.style.display !==
                  "none"
              );


            if(!firstVisible){
              return;
            }


            const button =
              firstVisible.querySelector(
                "[data-map]"
              );


            if(button){

              showCourtMap(button);

            }

          }
        );


      })();

    </script>

  `;


  return appLayout(

    lang,

    "court",

    content,

    t.title,

    t.description

  );

}


// ======================================================
// HEALTH RESPONSE
// ======================================================

function healthResponse(){

  return {
    ok: true,
    service: "Huquqiy AI",
    timestamp:
      new Date().toISOString()
  };

}


// ======================================================
// SERVER
// ======================================================

const server =
  http.createServer(
    async (
      req,
      res
    ) => {

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


        // ------------------------------------------------
        // HOME
        // ------------------------------------------------

        if(
          req.method === "GET" &&
          pathname === "/"
        ){

          return sendHtml(
            res,
            homePage(lang)
          );

        }


        // ------------------------------------------------
        // AI
        // ------------------------------------------------

        if(
          req.method === "GET" &&
          pathname === "/ai"
        ){

          return sendHtml(
            res,
            aiPage(lang)
          );

        }


        if(
          req.method === "POST" &&
          pathname === "/ai-result"
        ){

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


        // ------------------------------------------------
        // QUESTIONNAIRE
        // ------------------------------------------------

        if(
          req.method === "GET" &&
          pathname === "/questionnaire"
        ){

          return sendHtml(
            res,
            questionnairePage(lang)
          );

        }


        if(
          req.method === "POST" &&
          pathname === "/questionnaire-result"
        ){

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


        // ------------------------------------------------
        // SOURCES
        // ------------------------------------------------

        if(
          req.method === "GET" &&
          pathname === "/sources"
        ){

          return sendHtml(
            res,
            sourcesPage(lang)
          );

        }


        // ------------------------------------------------
        // DOCUMENTS
        // ------------------------------------------------

        if(
          req.method === "GET" &&
          pathname === "/documents"
        ){

          return sendHtml(
            res,
            documentsPage(lang)
          );

        }


        // ------------------------------------------------
        // CLAIM FORM
        // ------------------------------------------------

        if(
          req.method === "GET" &&
          pathname === "/claim"
        ){

          const type =
            url.searchParams.get(
              "type"
            ) ||
            "divorce_claim";


          return sendHtml(
            res,
            claimPage(
              lang,
              type
            )
          );

        }


        // ------------------------------------------------
        // CLAIM RESULT
        // ------------------------------------------------

        if(
          req.method === "POST" &&
          pathname === "/claim-result"
        ){

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


        // ------------------------------------------------
        // CALCULATORS
        // ------------------------------------------------

        if(
          req.method === "GET" &&
          pathname === "/calculators"
        ){

          return sendHtml(
            res,
            calculatorsPage(lang)
          );

        }


        // ------------------------------------------------
        // COURTS
        // ------------------------------------------------

        if(
          req.method === "GET" &&
          pathname === "/court"
        ){

          return sendHtml(
            res,
            courtPage(lang)
          );

        }


        // ------------------------------------------------
        // HEALTH
        // ------------------------------------------------

        if(
          req.method === "GET" &&
          pathname === "/health"
        ){

          return sendJson(
            res,
            healthResponse()
          );

        }


        // ------------------------------------------------
        // FAVICON
        // ------------------------------------------------

        if(
          req.method === "GET" &&
          pathname === "/favicon.ico"
        ){

          res.writeHead(
            204
          );

          return res.end();

        }


        // ------------------------------------------------
        // 404
        // ------------------------------------------------

        return sendHtml(
          res,
          notFoundPage(lang),
          404
        );


      } catch(error){


        console.error(
          "SERVER ERROR:",
          error
        );


        const lang = "uz";


        const message =
          process.env.NODE_ENV ===
          "production"
            ? "Serverda xatolik yuz berdi."
            : String(
                error?.stack ||
                error?.message ||
                error
              );


        return sendHtml(
          res,
          page({

            lang,

            title:
              "Server xatosi",

            content: `

              <section
                style="
                  min-height:70vh;
                  display:grid;
                  place-items:center;
                  padding:50px 0;
                "
              >

                <div
                  class="surface surfacePad"
                  style="
                    width:min(800px,92%);
                  "
                >

                  <div
                    class="notice noticeDanger"
                  >

                    <span class="noticeIcon">
                      !
                    </span>

                    <span>
                      Serverda xatolik yuz berdi.
                    </span>

                  </div>


                  ${
                    process.env.NODE_ENV !==
                    "production"
                      ? `

                        <pre
                          style="
                            white-space:pre-wrap;
                            overflow:auto;
                            padding:15px;
                            background:#f5f7f9;
                            border:1px solid #e1e6ea;
                            border-radius:9px;
                            color:#40556b;
                            font-size:10px;
                            line-height:1.6;
                          "
                        >${esc(message)}</pre>

                      `
                      : ""
                  }


                  <a
                    class="btn btnPrimary"
                    href="/${q(lang)}"
                  >
                    ← Bosh sahifa
                  </a>

                </div>

              </section>

            `

          }),
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
      "===================================="
    );

    console.log(
      " HUQUQIY AI SERVER ISHLADI"
    );

    console.log(
      " PORT:",
      PORT
    );

    console.log(
      " AI MODEL:",
      AI_MODEL
    );

    console.log(
      " VOICE:",
      "OFF"
    );

    console.log(
      " LANGUAGES:",
      "UZ / RU / EN"
    );

    console.log(
      " COURT FINDER:",
      "ON"
    );

    console.log(
      "===================================="
    );

  }
);


// ======================================================
// END OF HUQUQIY AI
// ======================================================
