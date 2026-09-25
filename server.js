
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
        "Da’vo arizasi tayyorlash",

      description:
        "Huquq sohasini va da’vo turini tanlang, ma’lumotlarni kiriting va platformaning o‘zida da’vo arizasi loyihasini tayyorlang.",

      info:
        "Tayyorlangan hujjat loyiha hisoblanadi. Sudga yoki boshqa organga topshirishdan oldin faktlar, talablar, rekvizitlar va amaldagi qonunchilikni tekshirish kerak.",

      create:
        "Da’vo arizasini tayyorlash"
    },


    ru: {
      title:
        "Подготовка искового заявления",

      description:
        "Выберите отрасль права и вид иска, введите сведения и подготовьте проект искового заявления прямо на платформе.",

      info:
        "Созданный документ является проектом. Перед подачей необходимо проверить факты, требования, реквизиты и действующее законодательство.",

      create:
        "Подготовить иск"
    },


    en: {
      title:
        "Claim preparation",

      description:
        "Choose the legal area and claim type, enter the facts, and prepare a claim draft directly on the platform.",

      info:
        "The generated document is a draft. Verify facts, claims, details and current law before filing.",

      create:
        "Prepare claim"
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


      <div class="surface surfacePad" style="margin-bottom:18px;">
        <div class="resultLabel">
          ${lang === "uz" ? "DA’VO ARIZASI MARKAZI" : lang === "ru" ? "ЦЕНТР ИСКОВЫХ ЗАЯВЛЕНИЙ" : "CLAIM CENTER"}
        </div>
        <h2 style="margin:8px 0 8px;color:var(--navy);font-size:26px;">
          ${lang === "uz" ? "Da’vo turini tanlang" : lang === "ru" ? "Выберите вид иска" : "Choose a claim type"}
        </h2>
        <p class="cardDescription">
          ${lang === "uz"
            ? "Oila yoki mehnat huquqi bo‘yicha kerakli da’voni tanlang. Keyingi sahifada sud, taraflar, faktlar, talablar va dalillar kiritiladi."
            : lang === "ru"
            ? "Выберите нужный иск по семейному или трудовому праву. На следующем шаге указываются суд, стороны, факты, требования и доказательства."
            : "Choose the required family-law or employment-law claim. On the next step, enter the court, parties, facts, requests and evidence."}
        </p>
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


      <div class="notice noticeGold" style="margin-top:18px;">
        <span class="noticeIcon">⚖</span>
        <span>
          ${lang === "uz"
            ? "Arizani tekshirgach, rasmiy elektron sud xizmatiga o‘tib topshirishingiz mumkin. Platforma hozircha sud tizimiga arizani avtomatik yubormaydi."
            : lang === "ru"
            ? "После проверки заявления вы можете перейти в официальный электронный судебный сервис для подачи. Платформа пока не отправляет заявление в судебную систему автоматически."
            : "After reviewing the claim, you can continue to the official electronic court service for filing. The platform does not yet submit it automatically to the court system."}
        </span>
      </div>

      <div class="formActions">

        <a class="btn btnGold" href="https://cabinet.sud.uz/" target="_blank" rel="noopener noreferrer">
          ⚖ ${lang === "uz" ? "Da’vo arizasini sudga topshirish" : lang === "ru" ? "Подать иск в суд" : "Submit claim to court"}
        </a>

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
// MEHNAT HUQUQI — VAZIYAT TAHLILI VA DA’VO
// ======================================================


function familyPage(lang) {
  lang = getLang(lang);

  const L = {
    uz: {
      title: "Oila huquqi",
      desc: "Oila huquqi bo‘yicha amaliy xizmatlar, da’vo arizalari, hisob-kitoblar va talabalar uchun rasmiy o‘quv manbalari.",
      practice: "Amaliy xizmatlar",
      study: "Talabalar uchun o‘quv va qonunchilik manbalari",
      note: "Tashqi manbalar yangi oynada ochiladi. Qonunchilik uchun birinchi navbatda rasmiy LexUZ va Hukumat portalidan foydalaning."
    },
    ru: {
      title: "Семейное право",
      desc: "Практические сервисы, иски, расчёты и официальные учебно-правовые источники по семейному праву.",
      practice: "Практические сервисы",
      study: "Учебные и законодательные источники",
      note: "Внешние источники открываются в новой вкладке. Для актуального законодательства используйте прежде всего LexUZ и Правительственный портал."
    },
    en: {
      title: "Family law",
      desc: "Practical services, claim preparation, calculations and official study resources for family law.",
      practice: "Practical services",
      study: "Study and legislation resources",
      note: "External resources open in a new tab. Use official LexUZ and Government sources for current legislation."
    }
  }[lang];

  return appLayout(
    lang,
    "family",
    `
      <div class="notice noticeGold">
        <span class="noticeIcon">§</span><span>${esc(L.note)}</span>
      </div>

      <div class="surface surfacePad">
        <div class="resultLabel">${esc(L.practice)}</div>
        <div class="serviceGrid" style="margin-top:16px;">
          <a class="serviceCard" href="/ai${q(lang)}&area=family">
            <div class="serviceIcon">AI</div>
            <h3>${lang === "uz" ? "Oila huquqi bo‘yicha AI yurist" : lang === "ru" ? "AI-юрист по семейному праву" : "Family-law AI lawyer"}</h3>
            <p>${lang === "uz" ? "Vaziyatni savol-javob orqali tahlil qiling." : lang === "ru" ? "Разберите ситуацию через пошаговые вопросы." : "Analyze a situation through guided questions."}</p>
          </a>
          <a class="serviceCard" href="/documents${q(lang)}">
            <div class="serviceIcon">▤</div>
            <h3>${lang === "uz" ? "Oila bo‘yicha da’vo arizasi" : lang === "ru" ? "Иск по семейному спору" : "Family-law claim"}</h3>
            <p>${lang === "uz" ? "Nikohdan ajratish, aliment va mol-mulk bo‘yicha da’vo loyihasi." : lang === "ru" ? "Проект иска о разводе, алиментах или разделе имущества." : "Prepare divorce, alimony or property claims."}</p>
          </a>
          <a class="serviceCard" href="/calculators${q(lang)}">
            <div class="serviceIcon">%</div>
            <h3>${lang === "uz" ? "Aliment va mol-mulk tahlili" : lang === "ru" ? "Алименты и имущество" : "Alimony and property"}</h3>
            <p>${lang === "uz" ? "Savol-javobli hisob-kitob va dastlabki huquqiy tahlil." : lang === "ru" ? "Расчёт и предварительный правовой анализ." : "Question-based calculations and preliminary analysis."}</p>
          </a>
        </div>
      </div>

      <div class="surface surfacePad" style="margin-top:18px;">
        <div class="resultLabel">${esc(L.study)}</div>
        <div class="serviceGrid" style="margin-top:16px;">
          <a class="serviceCard" href="https://lex.uz/docs/-104720" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">§</div>
            <h3>${lang === "uz" ? "Oila kodeksi — LexUZ" : lang === "ru" ? "Семейный кодекс — LexUZ" : "Family Code — LexUZ"}</h3>
            <p>${lang === "uz" ? "Oila kodeksining amaldagi rasmiy matnini to‘g‘ridan-to‘g‘ri o‘qing." : lang === "ru" ? "Откройте актуальный официальный текст Семейного кодекса." : "Read the current official Family Code."}</p>
          </a>
          <a class="serviceCard" href="https://gov.uz/oz/advice/728/document/3585" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">O</div>
            <h3>${lang === "uz" ? "Oila huquqi asoslari" : lang === "ru" ? "Основы семейного права" : "Family-law basics"}</h3>
            <p>${lang === "uz" ? "Hukumat portalidagi tushuntiruvchi o‘quv materiali." : lang === "ru" ? "Разъяснительный материал Правительственного портала." : "Government explanatory study material."}</p>
          </a>
          <a class="serviceCard" href="https://gov.uz/oz/advice/58/document/2857" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">⚖</div>
            <h3>${lang === "uz" ? "Nikohni sud tartibida bekor qilish" : lang === "ru" ? "Расторжение брака через суд" : "Court divorce procedure"}</h3>
            <p>${lang === "uz" ? "Sudga murojaat, hujjatlar va tartib bo‘yicha rasmiy ma’lumot." : lang === "ru" ? "Официальная информация о порядке и документах." : "Official filing and document guidance."}</p>
          </a>
          <a class="serviceCard" href="https://gov.uz/oz/advice/72/document/2598" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">₿</div>
            <h3>${lang === "uz" ? "Aliment kelishuvi" : lang === "ru" ? "Соглашение об алиментах" : "Alimony agreement"}</h3>
            <p>${lang === "uz" ? "Aliment to‘lash to‘g‘risidagi kelishuv bo‘yicha rasmiy tushuntirish." : lang === "ru" ? "Официальное разъяснение по соглашению об алиментах." : "Official guidance on alimony agreements."}</p>
          </a>
          <a class="serviceCard" href="https://gov.uz/oz/advice/58/document/583" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">▤</div>
            <h3>${lang === "uz" ? "Nikoh shartnomasi" : lang === "ru" ? "Брачный договор" : "Marriage contract"}</h3>
            <p>${lang === "uz" ? "Nikoh shartnomasining mazmuni, shakli va huquqiy talablari." : lang === "ru" ? "Содержание, форма и правовые требования." : "Content, form and legal requirements."}</p>
          </a>
          <a class="serviceCard" href="https://gov.uz/oz/advice/58/document/577" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">⌂</div>
            <h3>${lang === "uz" ? "Er-xotinning umumiy mulki" : lang === "ru" ? "Общее имущество супругов" : "Marital property"}</h3>
            <p>${lang === "uz" ? "Umumiy mol-mulk rejimi bo‘yicha rasmiy material." : lang === "ru" ? "Официальный материал об общем имуществе супругов." : "Official material on marital property."}</p>
          </a>
        </div>
      </div>
    `,
    L.title,
    L.desc
  );
}





const BUSINESS_KNOWLEDGE_TOPICS = [
  { title: 'Shartnomaviy majburiyatlar', description: 'Shartnoma tuzilishi, bajarilishi, o‘zgartirilishi va bekor qilinishi.' },
  { title: 'Qarzdorlikni undirish', description: 'Qarz hujjatlari, hisob-kitob, talabnoma, dalillar va da’vo.' },
  { title: 'Yetkazib berish', description: 'Tovar, miqdor, sifat, muddat, qabul qilish va javobgarlik.' },
  { title: 'Xizmatlar', description: 'Xizmat hajmi, natija, akt, to‘lov va kamchiliklar.' },
  { title: 'Pudrat', description: 'Ish hajmi, smeta, topshirish-qabul qilish va nuqsonlar.' },
  { title: 'Ijara', description: 'Obyekt, muddat, ijara haqi, qaytarish va zarar.' },
  { title: 'Korporativ boshqaruv', description: 'Ta’sischilar, yig‘ilish, direktor vakolati va qarorlar.' },
  { title: 'Ulushlar', description: 'Ulush o‘tishi, sotilishi, rozilik va qayta ro‘yxatdan o‘tish.' },
  { title: 'Davlat ro‘yxati', description: 'Yangi biznes va o‘zgarishlarni ro‘yxatdan o‘tkazish.' },
  { title: 'Litsenziya', description: 'Faoliyat uchun litsenziya/ruxsat talablari.' },
  { title: 'Soliq', description: 'Soliq majburiyatlari, tekshiruv va e’tirozlar.' },
  { title: 'Bojxona', description: 'Import/eksport va bojxona rasmiylashtiruvi.' },
  { title: 'Davlat xaridlari', description: 'Tender, shartlar, shikoyat va shartnoma.' },
  { title: 'Raqobat', description: 'Raqobat va monopoliyaga qarshi cheklovlar.' },
  { title: 'Intellektual mulk', description: 'Tovar belgisi, mualliflik va litsenziyalash.' },
  { title: 'Bank va to‘lovlar', description: 'Hisobvaraq, to‘lov topshiriqlari va bank munosabatlari.' },
  { title: 'Sug‘urta', description: 'Sug‘urta hodisasi, to‘lov va nizolar.' },
  { title: 'To‘lovga qobiliyatsizlik', description: 'Kreditor, qarzdor va to‘lovga qobiliyatsizlik tartibi.' },
  { title: 'Hakamlik', description: 'Hakamlik kelishuvi va muqobil nizo hal qilish.' },
  { title: 'Xalqaro arbitraj', description: 'Xalqaro tijorat nizolari va arbitraj bandlari.' },
  { title: 'Tashqi savdo', description: 'Eksport/import kontraktlari va valyuta/to‘lov shartlari.' },
  { title: 'Ijro', description: 'Sud hujjati va ijro jarayoni.' },
  { title: 'Tadbirkor huquqlarini himoya qilish', description: 'Palata, Biznes-ombudsman va davlat organlariga murojaat.' },
  { title: 'Due diligence', description: 'Kontragent va bitim xavfini huquqiy tekshirish.' },
];

const BUSINESS_GUIDED_CHECKLISTS = {
  debt: [
    'Shartnoma yoki qarz asosini aniqlash',
    'Majburiyat bajarilish muddatini aniqlash',
    'Hisob-kitob va qarz summasini tekshirish',
    'Akt, hisob-faktura va to‘lov hujjatlarini yig‘ish',
    'Yozishmalar va qarzni tan olish holatini tekshirish',
    'Sudgacha talab tartibini tekshirish',
    'Da’vo talabi va ilovalarni shakllantirish',
  ],
  contract: [
    'Tomonlar va vakolatni tekshirish',
    'Shartnoma predmeti',
    'Narx va to‘lov',
    'Muddat va ijro',
    'Qabul qilish tartibi',
    'Javobgarlik',
    'Bekor qilish',
    'Nizo hal qilish',
    'Rekvizit va imzo',
  ],
  corporate: [
    'Ta’sis hujjatlari',
    'Ta’sischilar tarkibi',
    'Ulushlar',
    'Ustav kapitali',
    'Yig‘ilish vakolati',
    'Kvorum/ovoz',
    'Direktor vakolati',
    'Qarorni rasmiylashtirish',
    'Davlat ro‘yxati zarurati',
  ],
  court: [
    'Sudga taalluqlilik',
    'Hududiy sudlov',
    'Sudgacha tartib',
    'Da’vo muddati/deadline tekshiruvi',
    'Da’vo bahosi',
    'Davlat boji tekshiruvi',
    'Dalillar',
    'Talablar',
    'Ilovalar',
    'Vakolat',
    'Elektron topshirish',
  ],
  contract_review: [
    'Predmet',
    'Muhim shartlar',
    'To‘lov',
    'Ijro',
    'Qabul qilish',
    'Kafolat',
    'Javobgarlik',
    'Neustoyka',
    'Zarar',
    'Force majeure',
    'Maxfiylik',
    'IP',
    'Bekor qilish',
    'Nizo hal qilish',
    'Bildirishnomalar',
    'Vakolat',
    'Rekvizitlar',
  ],
};
const BUSINESS_DISPUTE_TYPES = [
  ["debt","Qarzdorlikni undirish","Взыскание задолженности","Debt recovery"],
  ["supply","Tovar yetkazib berish nizosi","Спор по поставке","Supply dispute"],
  ["services","Xizmat ko‘rsatish nizosi","Спор по услугам","Services dispute"],
  ["works","Pudrat / bajarilgan ishlar nizosi","Подряд / выполненные работы","Works / construction dispute"],
  ["lease","Ijara nizosi","Арендный спор","Lease dispute"],
  ["sale","Oldi-sotdi nizosi","Спор купли-продажи","Sale dispute"],
  ["loan","Qarz / kredit majburiyati","Заем / кредитное обязательство","Loan / credit obligation"],
  ["penalty","Neustoyka, penya va zarar","Неустойка, пеня и убытки","Penalty and damages"],
  ["termination","Shartnomani bekor qilish / o‘zgartirish","Расторжение / изменение договора","Contract termination / amendment"],
  ["invalid_transaction","Bitimni haqiqiy emas deb topish","Недействительность сделки","Invalid transaction"],
  ["corporate","Korporativ / ta’sischilar nizosi","Корпоративный спор","Corporate / shareholder dispute"],
  ["share","Ulush / hissa bilan bog‘liq nizo","Спор по доле","Share / participation interest dispute"],
  ["director","Direktor / boshqaruv organi nizosi","Спор с директором / органом управления","Director / governance dispute"],
  ["dividend","Dividend / foydani taqsimlash nizosi","Дивиденды / распределение прибыли","Dividend / profit distribution dispute"],
  ["registration","Davlat ro‘yxatidan o‘tkazish masalasi","Государственная регистрация","State registration issue"],
  ["license","Litsenziya / ruxsatnoma","Лицензия / разрешение","License / permit"],
  ["tax","Soliq masalasi","Налоговый вопрос","Tax issue"],
  ["customs","Bojxona masalasi","Таможенный вопрос","Customs issue"],
  ["inspection","Tekshiruv / davlat organi harakati","Проверка / действие госоргана","Inspection / public authority action"],
  ["procurement","Davlat xaridlari","Государственные закупки","Public procurement"],
  ["competition","Raqobat / monopoliyaga qarshi masala","Конкуренция / антимонопольный вопрос","Competition / antitrust"],
  ["ip","Tovar belgisi / intellektual mulk","Товарный знак / интеллектуальная собственность","Trademark / intellectual property"],
  ["bank","Bank / hisobvaraq / to‘lov nizosi","Банк / счет / платежный спор","Bank / account / payment dispute"],
  ["insurance","Sug‘urta nizosi","Страховой спор","Insurance dispute"],
  ["insolvency","To‘lovga qobiliyatsizlik","Неплатежеспособность","Insolvency"],
  ["foreign_trade","Tashqi savdo / xalqaro shartnoma","Внешняя торговля / международный договор","Foreign trade / international contract"],
  ["arbitration","Hakamlik / arbitraj","Третейский суд / арбитраж","Arbitration"],
  ["enforcement","Sud hujjatini ijro etish","Исполнение судебного акта","Enforcement"],
  ["other","Boshqa biznes-huquqiy masala","Другой бизнес-правовой вопрос","Other business-law issue"]
];

const BUSINESS_DOCUMENT_TYPES = [
  ["claim","Iqtisodiy sudga da’vo arizasi","Иск в экономический суд","Economic court claim"],
  ["demand","Sudgacha talabnoma / pretenziya","Досудебная претензия","Pre-action demand"],
  ["response","Da’voga fikr / e’tiroz","Отзыв / возражение на иск","Response / objection to claim"],
  ["counterclaim","Qarshi da’vo arizasi","Встречный иск","Counterclaim"],
  ["appeal","Apellyatsiya shikoyati","Апелляционная жалоба","Appeal"],
  ["cassation","Kassatsiya shikoyati","Кассационная жалоба","Cassation complaint"],
  ["motion","Sudga iltimosnoma","Ходатайство в суд","Court motion"],
  ["evidence_motion","Dalil talab qilib olish haqida iltimosnoma","Ходатайство об истребовании доказательств","Motion to obtain evidence"],
  ["security_motion","Da’voni ta’minlash haqida ariza","Заявление об обеспечении иска","Interim relief application"],
  ["enforcement_application","Ijro bo‘yicha ariza","Заявление по исполнению","Enforcement application"],
  ["chamber_appeal","Savdo-sanoat palatasiga murojaat","Обращение в ТПП","Chamber of Commerce appeal"],
  ["ombudsman_appeal","Biznes-ombudsmanga murojaat","Обращение к Бизнес-омбудсману","Business Ombudsman appeal"],
  ["authority_complaint","Davlat organiga shikoyat","Жалоба в государственный орган","Complaint to public authority"],
  ["tax_objection","Soliq masalasi bo‘yicha e’tiroz / murojaat","Возражение / обращение по налогу","Tax objection / appeal"],
  ["license_application","Litsenziya/ruxsatnoma bo‘yicha murojaat","Обращение по лицензии/разрешению","License / permit application"],
  ["notice","Rasmiy bildirishnoma","Официальное уведомление","Formal notice"],
  ["guarantee","Kafolat xati","Гарантийное письмо","Guarantee letter"],
  ["reconciliation","Solishtirma / qarzdorlikni tan olish hujjati","Акт сверки / признание долга","Reconciliation / debt acknowledgement"],
  ["protocol","Bayonnoma / qaror","Протокол / решение","Minutes / resolution"],
  ["power_of_attorney","Ishonchnoma","Доверенность","Power of attorney"],
  ["custom","Boshqa hujjat","Другой документ","Other document"]
];

const BUSINESS_CONTRACT_TYPES = [
  ["supply","Tovar yetkazib berish shartnomasi","Договор поставки","Supply agreement"],
  ["sale","Oldi-sotdi shartnomasi","Договор купли-продажи","Sale agreement"],
  ["services","Xizmat ko‘rsatish shartnomasi","Договор оказания услуг","Services agreement"],
  ["works","Pudrat shartnomasi","Договор подряда","Works contract"],
  ["construction","Qurilish pudrati","Договор строительного подряда","Construction contract"],
  ["lease","Ijara shartnomasi","Договор аренды","Lease agreement"],
  ["loan","Qarz shartnomasi","Договор займа","Loan agreement"],
  ["agency","Agentlik shartnomasi","Агентский договор","Agency agreement"],
  ["commission","Komissiya shartnomasi","Договор комиссии","Commission agreement"],
  ["transport","Tashish / transport shartnomasi","Договор перевозки","Transportation agreement"],
  ["storage","Saqlash shartnomasi","Договор хранения","Storage agreement"],
  ["license_ip","Litsenziya / IP foydalanish shartnomasi","Лицензионный договор / ИС","IP license agreement"],
  ["nda","Maxfiylik (NDA) kelishuvi","Соглашение о конфиденциальности (NDA)","NDA"],
  ["cooperation","Hamkorlik shartnomasi","Договор о сотрудничестве","Cooperation agreement"],
  ["investment","Investitsiya kelishuvi","Инвестиционное соглашение","Investment agreement"],
  ["founders","Ta’sischilar kelishuvi","Соглашение учредителей","Founders agreement"],
  ["share_transfer","Ulushni o‘tkazish / sotish hujjati","Передача / продажа доли","Share transfer agreement"],
  ["settlement","Kelishuv bitimi","Мировое соглашение","Settlement agreement"],
  ["debt_restructuring","Qarzni restrukturizatsiya qilish kelishuvi","Соглашение о реструктуризации долга","Debt restructuring agreement"],
  ["foreign_trade","Tashqi savdo shartnomasi","Внешнеторговый контракт","Foreign trade contract"],
  ["custom","Boshqa turdagi shartnoma","Другой договор","Other contract"]
];

const BUSINESS_CORPORATE_DOCS = [
  ["charter","Ustav loyihasi","Проект устава","Charter draft"],
  ["founder_decision","Yagona ta’sischi qarori","Решение единственного учредителя","Sole founder decision"],
  ["meeting_minutes","Umumiy yig‘ilish bayonnomasi","Протокол общего собрания","General meeting minutes"],
  ["director_appointment","Direktor tayinlash qarori","Решение о назначении директора","Director appointment resolution"],
  ["share_change","Ulush/hissa o‘zgarishi bo‘yicha hujjat","Документ об изменении доли","Share change document"],
  ["capital_change","Ustav kapitalini o‘zgartirish qarori","Решение об изменении уставного капитала","Capital change resolution"],
  ["address_change","Yuridik manzilni o‘zgartirish qarori","Решение об изменении адреса","Registered address change"],
  ["activity_change","Faoliyat turini o‘zgartirish qarori","Решение об изменении вида деятельности","Activity change resolution"],
  ["reorganization","Qayta tashkil etish hujjati","Документ о реорганизации","Reorganization document"],
  ["liquidation","Tugatish bo‘yicha qaror","Решение о ликвидации","Liquidation resolution"],
  ["internal_policy","Ichki nizom / siyosat","Внутреннее положение / политика","Internal policy"],
  ["custom","Boshqa korporativ hujjat","Другой корпоративный документ","Other corporate document"]
];

function businessOptions(list, lang){
  const ix = lang === "ru" ? 2 : lang === "en" ? 3 : 1;
  return list.map(x => `<option value="${esc(x[0])}">${esc(x[ix])}</option>`).join("");
}

function businessPanel(title, text, href, icon="§"){
  return `<a class="serviceCard" href="${esc(href)}">
    <div class="serviceIcon">${esc(icon)}</div>
    <h3>${esc(title)}</h3>
    <p>${esc(text)}</p>
    <span class="serviceLink">Ochish →</span>
  </a>`;
}



function businessPage(lang="uz"){
  const t=(uz,ru,en)=>lang==="ru"?ru:lang==="en"?en:uz;

  const lawCards = [
    ["Fuqarolik kodeksi — I qism","Yuridik shaxslar, bitimlar, mulk, majburiyatlarning umumiy qoidalari.","https://lex.uz/docs/-111189","FK I"],
    ["Fuqarolik kodeksi — II qism","Oldi-sotdi, ijara, pudrat, xizmat, qarz va boshqa shartnomalar.","https://lex.uz/docs/-180552","FK II"],
    ["Iqtisodiy protsessual kodeks","Iqtisodiy sudda da’vo, dalillar va protsessual tartib.","https://lex.uz/docs/-3523891","IPK"],
    ["Soliq kodeksi","Tadbirkorlik subyektlarining soliq majburiyatlari.","https://lex.uz/docs/-4674902","SK"],
    ["Litsenziyalash va ruxsat berish","Litsenziya, ruxsatnoma va xabardor qilish tartib-taomillari.","https://lex.uz/docs/-5511879","L"],
    ["Davlat xaridlari to‘g‘risida","Davlat xaridlari, ishtirokchilar va shartnomalar.","https://lex.uz/docs/-5382974","DX"],
    ["Tadbirkorlik erkinligi kafolatlari","Tadbirkorlik faoliyati erkinligi va huquqiy kafolatlar.","https://lex.uz/docs/-2006789","TE"],
    ["MChJ to‘g‘risida","Mas’uliyati cheklangan jamiyatlar bo‘yicha korporativ qoidalar.","https://lex.uz/docs/-8151376","MChJ"]
  ];

  const laws = lawCards.map(x=>`<a class="bLaw" href="${x[2]}" target="_blank" rel="noopener noreferrer">
      <div class="bLawCode">${x[3]}</div><div><strong>${x[0]}</strong><p>${x[1]}</p></div><span>↗</span>
    </a>`).join("");

  const contractTypes=[
    ["supply","Tovar yetkazib berish"],["sale","Oldi-sotdi"],["services","Xizmat ko‘rsatish"],["lease","Ijara"],
    ["works","Pudrat"],["loan","Qarz"],["nda","NDA / maxfiylik"],["cooperation","Hamkorlik"]
  ].map(x=>`<button class="bAction" onclick="bizOpen('contract','${x[0]}','${x[1]} shartnomasi')"><span class="bDot">S</span><b>${x[1]}</b><i>→</i></button>`).join("");

  const claims=[
    ["debt","Qarzdorlikni undirish"],["performance","Majburiyatni bajarish"],["damages","Zarar undirish"],["termination","Shartnomani bekor qilish"],
    ["invalid","Bitimni haqiqiy emas deb topish"],["corporate","Korporativ nizo"],["counterclaim","Qarshi da’vo"],["custom","Boshqa biznes nizosi"]
  ].map(x=>`<button class="bAction" onclick="bizOpen('document','${x[0]}','${x[1]}')"><span class="bDot">D</span><b>${x[1]}</b><i>→</i></button>`).join("");

  return appLayout(lang,"business",`
  <style>
    .bWrap{max-width:1280px;margin:0 auto}
    .bTop{position:relative;overflow:hidden;border-radius:24px;padding:34px 38px;background:#071f36;color:#fff;box-shadow:0 18px 48px rgba(5,31,54,.14)}
    .bTop:before{content:"";position:absolute;width:360px;height:360px;border:1px solid rgba(213,174,101,.20);border-radius:50%;right:-100px;top:-210px}
    .bTop:after{content:"";position:absolute;width:260px;height:260px;border:1px solid rgba(213,174,101,.14);border-radius:50%;right:35px;top:-160px}
    .bKicker{font-size:11px;letter-spacing:2px;color:#d6ae65;font-weight:900}.bTop h1{font-size:38px;margin:9px 0 8px}.bTop p{max-width:720px;color:#c9d5df;margin:0;line-height:1.6}
    .bTopBtns{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.bTopBtn{border:1px solid rgba(255,255,255,.17);background:rgba(255,255,255,.07);color:#fff;border-radius:11px;padding:11px 15px;text-decoration:none;font-size:13px;font-weight:800}.bTopBtn.gold{background:#d4aa60;color:#082139;border-color:#d4aa60}
    .bStats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:14px}.bStat{background:#fff;border:1px solid #e6ebef;border-radius:16px;padding:17px 18px}.bStat small{display:block;color:#778594;font-size:10px;text-transform:uppercase;letter-spacing:.8px}.bStat strong{display:block;color:#0a2843;font-size:17px;margin-top:5px}
    .bLayout{display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:18px;margin-top:20px}.bPanel{background:#fff;border:1px solid #e5eaee;border-radius:18px;padding:21px;box-shadow:0 7px 22px rgba(8,38,62,.035)}
    .bHead{display:flex;justify-content:space-between;align-items:end;gap:15px;margin-bottom:15px}.bHead h2{font-size:20px;color:#092742;margin:0}.bHead p{font-size:11px;color:#788795;margin:4px 0 0}.bTag{font-size:10px;color:#98702f;background:#fbf5e9;border:1px solid #efe0c3;border-radius:20px;padding:6px 9px;font-weight:900}
    .bTools{display:grid;grid-template-columns:repeat(2,1fr);gap:11px}.bTool{border:1px solid #e4e9ed;border-radius:15px;padding:17px;background:#fff;text-align:left;cursor:pointer;min-height:118px;transition:.18s}.bTool:hover{border-color:#d5b675;box-shadow:0 9px 24px rgba(11,40,65,.07);transform:translateY(-2px)}.bToolIcon{width:38px;height:38px;border-radius:10px;background:#f6f1e7;color:#9b722f;display:grid;place-items:center;font-weight:900}.bTool h3{font-size:14px;margin:12px 0 4px;color:#0b2944}.bTool p{font-size:11px;color:#758492;line-height:1.45;margin:0}
    .bSideTitle{font-size:13px;color:#0b2944;font-weight:900;margin-bottom:12px}.bSideLink{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #edf0f2;text-decoration:none;color:#153650;font-size:12px;font-weight:750}.bSideLink:last-child{border-bottom:0}.bSideLink span{color:#b1843b}
    .bSection{margin-top:20px}.bActionGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.bAction{border:1px solid #e4e9ed;background:#fff;border-radius:13px;padding:13px 14px;display:flex;align-items:center;gap:10px;cursor:pointer;text-align:left;color:#102f49}.bAction:hover{border-color:#d6b776}.bAction b{font-size:12px;flex:1}.bAction i{font-style:normal;color:#aa7b2f}.bDot{width:29px;height:29px;border-radius:8px;background:#f5f0e7;color:#9c7130;display:grid;place-items:center;font-size:10px;font-weight:900}
    .bLawGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.bLaw{display:grid;grid-template-columns:47px 1fr 18px;gap:12px;align-items:center;border:1px solid #e3e8ec;border-radius:14px;padding:14px;text-decoration:none;background:#fff;color:#0a2944}.bLaw:hover{border-color:#cfae70;box-shadow:0 7px 18px rgba(7,37,61,.05)}.bLawCode{height:42px;border-radius:10px;background:#092a47;color:#e3bd76;display:grid;place-items:center;font-size:10px;font-weight:900}.bLaw strong{font-size:12px}.bLaw p{font-size:10px;color:#788692;margin:4px 0 0;line-height:1.4}.bLaw>span{color:#ad8037}
    .bOfficial{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.bOfficial a{border:1px solid #e4e9ed;border-radius:13px;padding:15px;text-decoration:none;color:#0d2e49;background:#fff}.bOfficial strong{font-size:12px;display:block}.bOfficial small{display:block;color:#7b8996;margin-top:5px;font-size:10px}
    .bModal{position:fixed;inset:0;background:rgba(3,19,32,.62);z-index:9999;display:none;align-items:center;justify-content:center;padding:20px}.bModal.open{display:flex}.bModalCard{background:#fff;width:min(820px,96vw);max-height:90vh;overflow:auto;border-radius:20px;padding:25px}.bModalTop{display:flex;justify-content:space-between;align-items:center}.bModalTop h2{margin:0}.bClose{border:0;width:38px;height:38px;border-radius:50%;font-size:20px;cursor:pointer}
    @media(max-width:980px){.bLayout{grid-template-columns:1fr}.bStats,.bActionGrid,.bOfficial{grid-template-columns:repeat(2,1fr)}}@media(max-width:620px){.bStats,.bTools,.bActionGrid,.bOfficial,.bLawGrid{grid-template-columns:1fr}.bTop{padding:26px 22px}.bTop h1{font-size:30px}}
  </style>

  <div class="bWrap">
    <section class="bTop">
      <div class="bKicker">HUQUQIY AI · BUSINESS DESK</div>
      <h1>${t("Biznes huquqi","Бизнес-право","Business Law")}</h1>
      <p>${t("Tadbirkor va kompaniya uchun huquqiy ish stoli: AI tahlil, shartnoma, da’vo, korporativ hujjatlar, qonunchilik va rasmiy davlat xizmatlari.","Юридическое рабочее пространство для бизнеса.","A legal workspace for entrepreneurs and companies.")}</p>
      <div class="bTopBtns"><a class="bTopBtn gold" href="#b-ai">${t("AI biznes yuristi","AI бизнес-юрист","AI business lawyer")}</a><a class="bTopBtn" href="#b-laws">${t("Qonun manbalari","Источники права","Legal sources")}</a><a class="bTopBtn" href="https://cabinet.sud.uz/" target="_blank" rel="noopener noreferrer">${t("Sud kabineti ↗","Судебный кабинет ↗","Court cabinet ↗")}</a></div>
    </section>

    <div class="bStats">
      <div class="bStat"><small>${t("Yo‘nalish","Направление","Area")}</small><strong>${t("Shartnomalar","Договоры","Contracts")}</strong></div>
      <div class="bStat"><small>${t("Yo‘nalish","Направление","Area")}</small><strong>${t("Biznes nizolari","Бизнес-споры","Disputes")}</strong></div>
      <div class="bStat"><small>${t("Yo‘nalish","Направление","Area")}</small><strong>${t("Korporativ huquq","Корпоративное право","Corporate")}</strong></div>
      <div class="bStat"><small>${t("Manbalar","Источники","Sources")}</small><strong>${t("Bevosita rasmiy","Прямые официальные","Direct official")}</strong></div>
    </div>

    <div class="bLayout">
      <div>
        <section id="b-ai" class="bPanel">
          <div class="bHead"><div><h2>${t("Nima qilmoqchisiz?","Что вы хотите сделать?","What do you want to do?")}</h2><p>${t("Xizmatni tanlang — kerakli AI forma ochiladi.","Выберите сервис — откроется нужная AI-форма.","Choose a service to open its AI form.")}</p></div><span class="bTag">AI LEGAL WORKFLOW</span></div>
          <div class="bTools">
            <button class="bTool" onclick="bizOpen('analysis','business','${t("Biznes muammosini tahlil qilish","Анализ бизнес-проблемы","Analyze business issue")}')"><div class="bToolIcon">AI</div><h3>${t("Huquqiy tahlil","Правовой анализ","Legal analysis")}</h3><p>${t("Muammo → huquqiy masala → dalillar → variantlar → keyingi qadam.","Проблема → право → доказательства → решение.","Problem → law → evidence → options → next step.")}</p></button>
            <button class="bTool" onclick="bizOpen('contract','custom','${t("Shartnoma tayyorlash","Подготовить договор","Draft contract")}')"><div class="bToolIcon">S</div><h3>${t("Shartnoma tayyorlash","Подготовить договор","Draft a contract")}</h3><p>${t("Istalgan biznes shartnomasi uchun moslashuvchan generator.","Гибкий генератор бизнес-договоров.","Flexible business contract generator.")}</p></button>
            <button class="bTool" onclick="bizOpen('document','claim','${t("Da’vo yoki ariza tayyorlash","Подготовить иск или заявление","Draft claim/application")}')"><div class="bToolIcon">D</div><h3>${t("Da’vo va arizalar","Иски и заявления","Claims & applications")}</h3><p>${t("Da’vo, talabnoma, e’tiroz, shikoyat va boshqa hujjatlar.","Иски, претензии, отзывы и жалобы.","Claims, demands, responses and appeals.")}</p></button>
            <button class="bTool" onclick="bizOpen('contract_review','review','${t("Shartnomani tekshirish","Проверить договор","Review contract")}')"><div class="bToolIcon">✓</div><h3>${t("Shartnomani tekshirish","Проверка договора","Contract review")}</h3><p>${t("Xavfli bandlar, yetishmayotgan shartlar va tavsiya etiladigan tuzatishlar.","Риски и рекомендуемые правки.","Risks, missing terms and suggested edits.")}</p></button>
          </div>
        </section>
      </div>

      <aside class="bPanel">
        <div class="bSideTitle">${t("Tezkor rasmiy xizmatlar","Быстрые официальные сервисы","Official quick links")}</div>
        <a class="bSideLink" href="https://my.gov.uz/uz/service/57" target="_blank" rel="noopener noreferrer">${t("Biznesni ro‘yxatdan o‘tkazish","Регистрация бизнеса","Business registration")}<span>↗</span></a>
        <a class="bSideLink" href="https://my.gov.uz/uz/service/58" target="_blank" rel="noopener noreferrer">${t("Qayta ro‘yxatdan o‘tkazish","Перерегистрация","Re-registration")}<span>↗</span></a>
        <a class="bSideLink" href="https://my.gov.uz/uz/service/77" target="_blank" rel="noopener noreferrer">${t("Kontragentni tekshirish","Проверить контрагента","Check counterparty")}<span>↗</span></a>
        <a class="bSideLink" href="https://license.gov.uz/" target="_blank" rel="noopener noreferrer">${t("Litsenziya va ruxsatlar","Лицензии и разрешения","Licenses & permits")}<span>↗</span></a>
        <a class="bSideLink" href="https://soliq.uz/" target="_blank" rel="noopener noreferrer">${t("Soliq xizmatlari","Налоговые сервисы","Tax services")}<span>↗</span></a>
        <a class="bSideLink" href="https://murojaat.chamber.uz/oz/appeals" target="_blank" rel="noopener noreferrer">${t("Palataga murojaat","Обращение в ТПП","Chamber appeal")}<span>↗</span></a>
        <a class="bSideLink" href="https://biznesvakil.uz/" target="_blank" rel="noopener noreferrer">${t("Biznes-ombudsman","Бизнес-омбудсман","Business Ombudsman")}<span>↗</span></a>
      </aside>
    </div>

    <section class="bPanel bSection">
      <div class="bHead"><div><h2>${t("Shartnomalar","Договоры","Contracts")}</h2><p>${t("Turini tanlang va AI bilan individual loyiha tayyorlang.","Выберите тип и создайте индивидуальный проект.","Choose a type and create a tailored draft.")}</p></div><span class="bTag">${t("NAMUNA + GENERATOR","ШАБЛОН + ГЕНЕРАТОР","TEMPLATE + GENERATOR")}</span></div>
      <div class="bActionGrid">${contractTypes}</div>
    </section>

    <section class="bPanel bSection">
      <div class="bHead"><div><h2>${t("Biznes nizolari va da’volar","Бизнес-споры и иски","Business disputes & claims")}</h2><p>${t("Sudgacha hujjatdan iqtisodiy sud da’vosigacha.","От претензии до экономического суда.","From pre-action demand to economic court claim.")}</p></div></div>
      <div class="bActionGrid">${claims}</div>
    </section>

    <section id="b-laws" class="bPanel bSection">
      <div class="bHead"><div><h2>${t("Biznes huquqi — to‘g‘ridan-to‘g‘ri qonun manbalari","Бизнес-право — прямые источники","Business law — direct legal sources")}</h2><p>${t("Kartani bossangiz LexUZ bosh sahifasi emas, aynan hujjatning o‘zi ochiladi.","Открывается сам документ, а не главная LexUZ.","Each card opens the exact official document, not the LexUZ homepage.")}</p></div><span class="bTag">LEXUZ DIRECT</span></div>
      <div class="bLawGrid">${laws}</div>
    </section>

    <section class="bPanel bSection">
      <div class="bHead"><div><h2>${t("Korporativ va tadbirkorni himoya qilish","Корпоративные документы и защита бизнеса","Corporate & business protection")}</h2></div></div>
      <div class="bActionGrid">
        <button class="bAction" onclick="bizOpen('corporate','charter','Ustav loyihasi')"><span class="bDot">K</span><b>${t("Ustav loyihasi","Проект устава","Charter draft")}</b><i>→</i></button>
        <button class="bAction" onclick="bizOpen('corporate','founder_decision','Ta’sischi qarori')"><span class="bDot">K</span><b>${t("Ta’sischi qarori","Решение учредителя","Founder resolution")}</b><i>→</i></button>
        <button class="bAction" onclick="bizOpen('protection','chamber','Savdo-sanoat palatasiga murojaat')"><span class="bDot">H</span><b>${t("Palataga murojaat","Обращение в ТПП","Chamber appeal")}</b><i>→</i></button>
        <button class="bAction" onclick="bizOpen('protection','ombudsman','Biznes-ombudsmanga murojaat')"><span class="bDot">H</span><b>${t("Biznes-ombudsmanga murojaat","Обращение к Бизнес-омбудсману","Business Ombudsman appeal")}</b><i>→</i></button>
      </div>
    </section>

    <section class="bPanel bSection">
      <div class="bHead"><div><h2>${t("Rasmiy platformalar","Официальные платформы","Official platforms")}</h2><p>${t("Har biri tegishli xizmatning o‘ziga olib boradi.","Каждая ссылка ведет прямо к нужному сервису.","Each link goes directly to the relevant service.")}</p></div></div>
      <div class="bOfficial">
        <a href="https://cabinet.sud.uz/" target="_blank" rel="noopener noreferrer"><strong>ADOLAT</strong><small>${t("Sudga elektron murojaat","Электронное обращение в суд","Electronic court filing")}</small></a>
        <a href="https://chamber.uz/" target="_blank" rel="noopener noreferrer"><strong>${t("Savdo-sanoat palatasi","Торгово-промышленная палата","Chamber of Commerce")}</strong><small>${t("Tadbirkorlikni qo‘llab-quvvatlash","Поддержка бизнеса","Business support")}</small></a>
        <a href="https://license.gov.uz/" target="_blank" rel="noopener noreferrer"><strong>License</strong><small>${t("Litsenziya va ruxsatlar","Лицензии и разрешения","Licenses & permits")}</small></a>
        <a href="https://soliq.uz/" target="_blank" rel="noopener noreferrer"><strong>Soliq</strong><small>${t("Soliq xizmatlari","Налоговые сервисы","Tax services")}</small></a>
      </div>
    </section>
  </div>

  <div id="bizModal" class="bModal" onclick="if(event.target===this)bizClose()"><div class="bModalCard">
    <div class="bModalTop"><div><div class="resultLabel">HUQUQIY AI · BUSINESS</div><h2 id="bizModalTitle">${t("AI biznes yuristi","AI бизнес-юрист","AI business lawyer")}</h2></div><button class="bClose" onclick="bizClose()">×</button></div>
    <form method="POST" action="/business-result${q(lang)}">
      <input id="bizMode" type="hidden" name="mode" value="analysis"><input id="bizIssue" type="hidden" name="issue"><input id="bizDocType" type="hidden" name="document_type"><input id="bizContractType" type="hidden" name="contract_type">
      <div class="formGrid"><div class="formGroup"><label>${t("Sizning tomoningiz / korxona","Ваша сторона / компания","Your side / company")}</label><input name="party1"></div><div class="formGroup"><label>${t("Kontragent / qarshi tomon","Контрагент","Counterparty")}</label><input name="counterparty"></div><div class="formGroup"><label>${t("Summa / narx","Сумма / цена","Amount / price")}</label><input name="amount"></div><div class="formGroup"><label>${t("Shartnoma yoki hujjat","Договор или документ","Contract/document")}</label><input name="contract"></div></div>
      <div class="formGroup"><label>${t("Vaziyat, faktlar va muhim shartlar","Ситуация и факты","Situation, facts and key terms")}</label><textarea name="facts" rows="7" required></textarea></div>
      <div class="formGrid"><div class="formGroup"><label>${t("Dalillar / ilovalar","Доказательства","Evidence")}</label><textarea name="evidence" rows="4"></textarea></div><div class="formGroup"><label>${t("Siz xohlayotgan natija","Желаемый результат","Desired result")}</label><textarea name="goal" rows="4"></textarea></div></div>
      <button class="btn btnPrimary" type="submit">${t("AI bilan tayyorlash","Подготовить с AI","Prepare with AI")}</button>
    </form>
  </div></div>
  <script>
    function bizOpen(mode,type,title){document.getElementById("bizMode").value=mode;document.getElementById("bizIssue").value=type||"";document.getElementById("bizDocType").value=(mode==="document"||mode==="protection"||mode==="corporate")?type:"";document.getElementById("bizContractType").value=mode==="contract"?type:"";document.getElementById("bizModalTitle").textContent=title||"AI Biznes yuristi";document.getElementById("bizModal").classList.add("open");document.body.style.overflow="hidden";}
    function bizClose(){document.getElementById("bizModal").classList.remove("open");document.body.style.overflow="";}
  </script>
  `);
}

function businessLinkCard(title,desc,url){
  return `<a class="sourceCard" href="${esc(url)}" target="_blank" rel="noopener noreferrer">
    <div class="serviceIcon">§</div>
    <h3>${esc(title)}</h3>
    <p>${esc(desc)}</p>
    <span class="serviceLink">Rasmiy sayt ↗</span>
  </a>`;
}

async function businessResultPage(lang, body){
  const get = (k,n=8000) => String((body && body[k]) || "").trim().slice(0,n);
  const mode = get("mode",80) || "analysis";
  const issue = get("issue",160);
  const documentType = get("document_type",160);
  const contractType = get("contract_type",160);
  const customType = get("custom_type",300);
  const counterparty = get("counterparty",400);
  const party1 = get("party1",400);
  const party2 = get("party2",400);
  const company = get("company",400);
  const addressee = get("addressee",400);
  const amount = get("amount",2000);
  const contract = get("contract",1000);
  const facts = get("facts",12000);
  const evidence = get("evidence",8000);
  const goal = get("goal",6000);

  const languageName = lang==="ru" ? "Russian" : lang==="en" ? "English" : "Uzbek (Latin)";
  const modeInstruction = {
    analysis: "Provide a structured business-law analysis: facts, missing facts, legal issues, applicable legal framework, evidence, pre-action options, dispute-resolution route, risks, next steps and documents to prepare.",
    document: "Draft the requested business legal document in professional form. Include addressee, parties, factual basis, legal basis where verified, requests/relief, attachments and signature/date placeholders as appropriate.",
    contract: "Draft the requested business contract. Include parties, definitions if needed, subject, quantity/quality/specification where relevant, price/payment, delivery/performance/acceptance, rights and duties, warranties, liability, penalties only if supplied or clearly marked, force majeure, confidentiality if relevant, dispute resolution, term/termination, notices, details and signatures.",
    contract_review: "Review the supplied contract. Separate: unclear/missing essential terms, one-sided clauses, payment/performance risk, liability risk, termination risk, dispute-resolution risk, evidence/documentation risk, suggested edits, and questions before signing. Do not pretend the text contains clauses that are absent.",
    corporate: "Draft the requested corporate document for an Uzbekistan business. Use placeholders for missing company, founder, share, capital, address, director, date and registration details. Flag matters requiring notarization, registration or official verification instead of guessing.",
    protection: "Draft a concise but strong entrepreneur-rights appeal for the selected institution. State facts, challenged act/omission if any, supporting documents, requested action and attachments. Do not claim that the institution has jurisdiction unless verified from the facts.",
    due_diligence: "Create a practical legal due-diligence checklist for this counterparty and transaction. Distinguish what can be checked in official registries from what must be requested from the counterparty. Include authority/signature, registration, licenses, ownership/asset, litigation/enforcement, tax/compliance, contract and payment risks where relevant.",
    court_readiness: "Assess readiness for an economic-court case. Check parties/status, subject-matter jurisdiction, territorial jurisdiction questions, pre-action requirements, limitation/deadline issues to verify, claim amount, state duty/cost items to verify, evidence, calculation, requested relief, attachments and filing steps."
  }[mode] || "Provide a structured Uzbekistan business-law response.";

  const prompt = `
You are HUQUQIY AI's BUSINESS LAW module for Uzbekistan.
Respond in ${languageName}.

CORE RULES:
- Use only facts supplied by the user. Never invent a company name, STIR, address, bank details, dates, sums, contract numbers, evidence, court name, procedural deadline, state duty, statutory article, government decision or case law.
- For every missing factual field in a draft write [TO‘LDIRILADI].
- Clearly distinguish USER FACTS, MISSING INFORMATION, LEGAL ISSUES, LEGAL BASIS, EVIDENCE, OPTIONS/RISKS, NEXT STEPS and DRAFT DOCUMENT when relevant.
- Uzbekistan law changes. Cite an exact article only when confident it is current; otherwise say the current official LexUZ text must be verified.
- Do not guarantee an outcome.
- Do not automatically send every dispute to court. Consider negotiation, pre-action demand, mediation, Chamber mechanisms, arbitration/hakamlik if contractually applicable, competent state body, Business Ombudsman, and economic court depending on the facts.
- Before an economic-court claim, identify questions of jurisdiction, pre-action procedure, claim calculation and evidence that need verification.
- For a contract, identify essential/commercial terms that are missing before presenting the draft.
- For a corporate document, do not invent founder/share/capital data.
- For tax, customs, licensing, competition, procurement, insolvency, IP or other specialized matters, state which official source/authority should be checked.

TASK:
${modeInstruction}

INPUT:
Mode: ${mode}
Issue: ${issue}
Document type: ${documentType}
Contract type: ${contractType}
Custom type/title: ${customType}
Company: ${company}
Party 1: ${party1}
Party 2: ${party2}
Counterparty: ${counterparty}
Addressee: ${addressee}
Amount/payment/term: ${amount}
Contract/reference: ${contract}
Facts: ${facts}
Evidence: ${evidence}
Goal/request: ${goal}
`;

  let result;
  try{
    result = await callAI(prompt, lang);
  }catch(err){
    result = lang==="ru"
      ? "AI-сервис временно недоступен. Проверьте API-настройки и повторите попытку."
      : lang==="en"
      ? "The AI service is temporarily unavailable. Check the API configuration and try again."
      : "AI xizmati vaqtincha ishlamayapti. API sozlamalarini tekshirib, qayta urinib ko‘ring.";
  }

  const title = mode==="contract" ? (lang==="ru"?"Проект договора":lang==="en"?"Contract draft":"Shartnoma loyihasi")
    : mode==="document" ? (lang==="ru"?"Проект документа":lang==="en"?"Document draft":"Hujjat loyihasi")
    : mode==="corporate" ? (lang==="ru"?"Корпоративный документ":lang==="en"?"Corporate document":"Korporativ hujjat")
    : mode==="contract_review" ? (lang==="ru"?"Анализ договора":lang==="en"?"Contract review":"Shartnoma tahlili")
    : (lang==="ru"?"Результат бизнес-юриста":lang==="en"?"Business lawyer result":"AI biznes yuristi natijasi");

  return appLayout(lang,"business",`
    <div class="appHeader">
      <div class="resultLabel">${lang==="ru"?"БИЗНЕС-ПРАВО":lang==="en"?"BUSINESS LAW":"BIZNES HUQUQI"}</div>
      <h1>${esc(title)}</h1>
      <p>${lang==="uz"?"Natijani amaldagi rasmiy qonunchilik va ish hujjatlari bilan tekshiring.":"AI legal output should be verified against current official law and case documents."}</p>
    </div>
    <div class="surface surfacePad">
      <div style="white-space:pre-wrap;line-height:1.75">${esc(result)}</div>
      <div class="formActions" style="margin-top:22px;">
        <a class="btn btnOutline" href="/business${q(lang)}">← ${lang==="uz"?"Biznes huquqiga qaytish":"Back"}</a>
        <a class="btn btnOutline" href="https://lex.uz/" target="_blank" rel="noopener noreferrer">LexUZ ↗</a>
        <a class="btn btnPrimary" href="https://cabinet.sud.uz/" target="_blank" rel="noopener noreferrer">${lang==="uz"?"Sud kabineti":"Court cabinet"} ↗</a>
      </div>
    </div>
  `);
}


function employmentPage(lang) {

  lang = getLang(lang);

  const t = {
    uz: {
      title: "Mehnat huquqi",
      description: "Mehnat nizosini sodda savollar orqali aniqlang. Tizim vaziyatga qarab huquqiy xulosa yoki da’vo arizasi loyihasini tayyorlaydi.",
      issue: "Muammo turi",
      issueOptions: [
        ["dismissal", "Ishdan bo‘shatish / ishga tiklash"],
        ["wage", "Ish haqi yoki boshqa to‘lov undirilmagan"],
        ["contract", "Mehnat shartnomasi bilan bog‘liq nizo"],
        ["leave", "Ta’til yoki ish vaqti bilan bog‘liq nizo"],
        ["other", "Boshqa mehnat nizosi"]
      ],
      employer: "Ish beruvchi / tashkilot nomi",
      position: "Lavozimingiz",
      start: "Ish boshlagan sana",
      end: "Ishdan bo‘shatilgan sana (agar mavjud bo‘lsa)",
      order: "Buyruq yoki mehnat shartnomasi haqidagi ma’lumot",
      facts: "Vaziyatni qisqacha bayon qiling",
      factsPh: "Nima sodir bo‘lganini sana va muhim holatlar bilan yozing...",
      evidence: "Mavjud hujjatlar va dalillar",
      evidencePh: "Mehnat shartnomasi, buyruq, hisob-kitob, yozishmalar va boshqalar...",
      goal: "Natija turi",
      conclusion: "Huquqiy xulosa",
      claim: "Da’vo arizasi loyihasi",
      submit: "Tahlil qilish",
      note: "Tizim yetishmayotgan faktlarni o‘zi to‘ldirmaydi. Hujjatni topshirishdan oldin amaldagi qonunchilik va rekvizitlarni tekshiring."
    },
    ru: {
      title: "Трудовое право",
      description: "Опишите трудовой спор через простые вопросы. Система подготовит правовое заключение или проект иска в зависимости от ситуации.",
      issue: "Тип проблемы",
      issueOptions: [
        ["dismissal", "Увольнение / восстановление на работе"],
        ["wage", "Невыплата заработной платы или иных выплат"],
        ["contract", "Спор по трудовому договору"],
        ["leave", "Спор об отпуске или рабочем времени"],
        ["other", "Другой трудовой спор"]
      ],
      employer: "Работодатель / организация",
      position: "Должность",
      start: "Дата начала работы",
      end: "Дата увольнения (если имеется)",
      order: "Сведения о приказе или трудовом договоре",
      facts: "Кратко опишите ситуацию",
      factsPh: "Опишите, что произошло, с датами и важными обстоятельствами...",
      evidence: "Документы и доказательства",
      evidencePh: "Трудовой договор, приказ, расчёты, переписка и т.д.",
      goal: "Тип результата",
      conclusion: "Правовое заключение",
      claim: "Проект искового заявления",
      submit: "Провести анализ",
      note: "Система не заполняет отсутствующие факты предположениями. Перед подачей документа проверьте действующее законодательство и реквизиты."
    },
    en: {
      title: "Employment law",
      description: "Describe an employment dispute through simple questions. The system will prepare a legal conclusion or a claim draft depending on the situation.",
      issue: "Issue type",
      issueOptions: [
        ["dismissal", "Dismissal / reinstatement"],
        ["wage", "Unpaid wages or other payments"],
        ["contract", "Employment-contract dispute"],
        ["leave", "Leave or working-time dispute"],
        ["other", "Other employment dispute"]
      ],
      employer: "Employer / organization",
      position: "Position",
      start: "Employment start date",
      end: "Dismissal date (if applicable)",
      order: "Information about the order or employment contract",
      facts: "Briefly describe the situation",
      factsPh: "Describe what happened, including dates and important facts...",
      evidence: "Available documents and evidence",
      evidencePh: "Employment contract, order, calculations, correspondence, etc.",
      goal: "Result type",
      conclusion: "Legal conclusion",
      claim: "Claim draft",
      submit: "Analyze",
      note: "The system does not invent missing facts. Verify current law and filing details before submitting a document."
    }
  }[lang];

  const options = t.issueOptions
    .map(([value, label]) => `<option value="${esc(value)}">${esc(label)}</option>`)
    .join("");

  return appLayout(
    lang,
    "employment",
    `
      <div class="notice noticeGold">
        <span class="noticeIcon">!</span>
        <span>${esc(t.note)}</span>
      </div>

      <div class="surface surfacePad">
        <form method="POST" action="/employment-result${q(lang)}">
          <div class="formGrid">

            <div class="formGroup full">
              <label>${esc(t.issue)}</label>
              <select name="issue_type" required>${options}</select>
            </div>

            <div class="formGroup">
              <label>${esc(t.employer)}</label>
              <input name="employer" required>
            </div>

            <div class="formGroup">
              <label>${esc(t.position)}</label>
              <input name="position">
            </div>

            <div class="formGroup">
              <label>${esc(t.start)}</label>
              <input type="date" name="employment_start">
            </div>

            <div class="formGroup">
              <label>${esc(t.end)}</label>
              <input type="date" name="employment_end">
            </div>

            <div class="formGroup full">
              <label>${esc(t.order)}</label>
              <input name="order_info">
            </div>

            <div class="formGroup full">
              <label>${esc(t.facts)}</label>
              <textarea name="facts" required placeholder="${esc(t.factsPh)}"></textarea>
            </div>

            <div class="formGroup full">
              <label>${esc(t.evidence)}</label>
              <textarea name="evidence" placeholder="${esc(t.evidencePh)}"></textarea>
            </div>

            <div class="formGroup full">
              <label>${esc(t.goal)}</label>
              <select name="result_type" required>
                <option value="conclusion">${esc(t.conclusion)}</option>
                <option value="claim">${esc(t.claim)}</option>
              </select>
            </div>

          </div>

          <div class="formActions">
            <button class="btn btnPrimary" type="submit">§ ${esc(t.submit)}</button>
          </div>
        </form>
      </div>

      <div class="surface surfacePad" style="margin-top:18px;">
        <div class="resultLabel">
          ${lang === "uz" ? "MEHNAT SHARTNOMASI NAMUNALARI" : lang === "ru" ? "ОБРАЗЦЫ ТРУДОВЫХ ДОГОВОРОВ" : "EMPLOYMENT CONTRACT SAMPLES"}
        </div>
        <div class="serviceGrid" style="margin-top:16px;">
          <a class="serviceCard" href="https://gov.uz/oz/madaniymeros/sections/view/37231" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">▤</div>
            <h3>${lang === "uz" ? "Mehnat shartnomasi namunasi" : lang === "ru" ? "Образец трудового договора" : "Employment contract sample"}</h3>
            <p>${lang === "uz" ? "Gov.uz saytida e’lon qilingan mehnat shartnomasi namunasi." : lang === "ru" ? "Образец трудового договора на Gov.uz." : "Employment contract sample published on Gov.uz."}</p>
          </a>
          <a class="serviceCard" href="https://gov.uz/oz/advice/673/document/3012" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">⌂</div>
            <h3>${lang === "uz" ? "Kasanachi bilan mehnat shartnomasi" : lang === "ru" ? "Договор с надомником" : "Homeworker employment contract"}</h3>
            <p>${lang === "uz" ? "Kasanachilik uchun maxsus shartlar va namunaviy shakl bo‘yicha rasmiy material." : lang === "ru" ? "Официальный материал о специальных условиях договора." : "Official guidance on special contract terms."}</p>
          </a>
          <a class="serviceCard" href="https://my.gov.uz/uz/service/1235" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">✓</div>
            <h3>${lang === "uz" ? "Elektron mehnat shartnomasi" : lang === "ru" ? "Электронный трудовой договор" : "Electronic employment contract"}</h3>
            <p>${lang === "uz" ? "my.gov.uz orqali elektron mehnat shartnomasi xizmatiga o‘ting." : lang === "ru" ? "Перейдите к услуге электронного трудового договора на my.gov.uz." : "Open the electronic employment-contract service on my.gov.uz."}</p>
          </a>
        </div>
      </div>


      <div class="surface surfacePad" style="margin-top:18px;">
        <div class="resultLabel">${lang==="uz"?"MEHNAT SHARTNOMALARI":lang==="ru"?"ТРУДОВЫЕ ДОГОВОРЫ":"EMPLOYMENT CONTRACTS"}</div>
        <h2>${lang==="uz"?"Shartnoma namunalari va AI generator":lang==="ru"?"Шаблоны и AI-генератор договоров":"Contract templates & AI generator"}</h2>
        <p>${lang==="uz"?"Kerakli mehnat shartnomasi turini tanlang. Yetishmayotgan rekvizitlar [TO‘LDIRILADI] deb qoldiriladi.":lang==="ru"?"Выберите нужный тип трудового договора. Недостающие реквизиты будут отмечены.":"Choose the required employment contract type. Missing details will be marked."}</p>
        <form method="POST" action="/employment-result${q(lang)}">
          <input type="hidden" name="result_type" value="contract">
          <div class="formGrid">
            <div class="formGroup"><label>${lang==="uz"?"Shartnoma turi":lang==="ru"?"Тип договора":"Contract type"}</label>
              <select name="issue_type">
                <option value="nomuayyan muddatli">Nomuayyan muddatli</option>
                <option value="muddatli">Muddatli</option>
                <option value="o‘rindoshlik">O‘rindoshlik asosida</option>
                <option value="masofaviy">Masofadan ishlash</option>
                <option value="kasanachilik">Kasanachilik / uyda ishlash</option>
                <option value="mikrofirma">Mikrofirma xodimi</option>
                <option value="YTT xodimi">YTTda ishlovchi xodim</option>
                <option value="rahbar">Tashkilot rahbari</option>
                <option value="mavsumiy">Mavsumiy ish</option>
                <option value="vaqtinchalik">Vaqtinchalik ish</option>
                <option value="boshqa">Boshqa turdagi mehnat shartnomasi</option>
              </select>
            </div>
            <div class="formGroup"><label>${lang==="uz"?"Lavozim / kasb":lang==="ru"?"Должность":"Position"}</label><input name="position"></div>
          </div>
          <div class="formGroup"><label>${lang==="uz"?"Ish beruvchi":lang==="ru"?"Работодатель":"Employer"}</label><input name="employer"></div>
          <div class="formGroup"><label>${lang==="uz"?"Tomonlar va asosiy shartlar":lang==="ru"?"Стороны и основные условия":"Parties and key terms"}</label>
            <textarea name="facts" rows="6" placeholder="${lang==="uz"?"Ish joyi, vazifa, ish haqi, ish vaqti, muddat va boshqa kelishilgan shartlarni yozing...":lang==="ru"?"Укажите место работы, обязанности, зарплату, режим, срок...":"Enter workplace, duties, salary, hours, term and other agreed terms..."}"></textarea>
          </div>
          <button class="btn btnPrimary" type="submit">${lang==="uz"?"Shartnoma namunasini tayyorlash":lang==="ru"?"Подготовить договор":"Prepare contract"}</button>
        </form>
        <div class="formActions" style="margin-top:16px">
          <a class="btn btnOutline" href="https://gov.uz/oz/advice/554/document/2234" target="_blank" rel="noopener noreferrer">${lang==="uz"?"Rasmiy namunaviy shakl":lang==="ru"?"Официальный образец":"Official template"} ↗</a>
          <a class="btn btnOutline" href="https://my.gov.uz/uz/service/1235" target="_blank" rel="noopener noreferrer">${lang==="uz"?"Elektron mehnat shartnomasi":lang==="ru"?"Электронный договор":"Electronic contract"} ↗</a>
        </div>
      </div>

      <div class="surface surfacePad" style="margin-top:18px;">
        <div class="resultLabel">${lang==="uz"?"MEHNAT NIZOLARI BO‘YICHA DA’VOLAR":lang==="ru"?"ИСКИ ПО ТРУДОВЫМ СПОРАМ":"EMPLOYMENT DISPUTE CLAIMS"}</div>
        <h2>${lang==="uz"?"Har qanday mehnat nizosi uchun da’vo arizasi":lang==="ru"?"Иск по любому трудовому спору":"Claim for any employment dispute"}</h2>
        <p>${lang==="uz"?"Nizo turini tanlang yoki “Boshqa mehnat nizosi”ni tanlab o‘zingiz yozing.":lang==="ru"?"Выберите вид спора или опишите другой.":"Choose a dispute type or describe another dispute."}</p>
        <form method="POST" action="/employment-result${q(lang)}">
          <input type="hidden" name="result_type" value="claim">
          <div class="formGrid">
            <div class="formGroup"><label>${lang==="uz"?"Da’vo turi":lang==="ru"?"Вид иска":"Claim type"}</label>
              <select name="issue_type">
                <option value="ishga tiklash">Ishga tiklash</option>
                <option value="bo‘shatish asosini yoki sanasini o‘zgartirish">Bo‘shatish sanasi/asosini o‘zgartirish</option>
                <option value="majburiy progul haqini undirish">Majburiy progul uchun haq undirish</option>
                <option value="ish haqi va boshqa to‘lovlarni undirish">Ish haqi va boshqa to‘lovlarni undirish</option>
                <option value="g‘ayriqonuniy boshqa ishga o‘tkazish">G‘ayriqonuniy boshqa ishga o‘tkazish</option>
                <option value="ishga qabul qilishni noqonuniy rad etish">Ishga qabul qilishni noqonuniy rad etish</option>
                <option value="moddiy zarar">Moddiy zarar undirish</option>
                <option value="ma’naviy zarar">Ma’naviy zarar kompensatsiyasi</option>
                <option value="mehnatda mayib bo‘lish yoki kasb kasalligi">Mehnatda mayib bo‘lish / kasb kasalligi</option>
                <option value="ish vaqti dam olish ta’til">Ish vaqti / dam olish / ta’til</option>
                <option value="intizomiy jazo">Intizomiy jazo</option>
                <option value="mehnat shartlari">Mehnat shartlari / shartnoma nizosi</option>
                <option value="boshqa mehnat nizosi">Boshqa mehnat nizosi</option>
              </select>
            </div>
            <div class="formGroup"><label>${lang==="uz"?"Ish beruvchi":lang==="ru"?"Работодатель":"Employer"}</label><input name="employer"></div>
          </div>
          <div class="formGroup"><label>${lang==="uz"?"Nizo holatlari":lang==="ru"?"Обстоятельства":"Dispute facts"}</label><textarea name="facts" rows="7" required></textarea></div>
          <div class="formGroup"><label>${lang==="uz"?"Dalillar":lang==="ru"?"Доказательства":"Evidence"}</label><textarea name="evidence" rows="4"></textarea></div>
          <button class="btn btnPrimary" type="submit">${lang==="uz"?"Da’vo arizasini tayyorlash":lang==="ru"?"Подготовить иск":"Prepare claim"}</button>
        </form>
        <div class="formActions" style="margin-top:16px">
          <a class="btn btnOutline" href="https://gov.uz/oz/advice/673/document/3031" target="_blank" rel="noopener noreferrer">${lang==="uz"?"Mehnat nizolari — rasmiy":lang==="ru"?"Трудовые споры":"Employment disputes"} ↗</a>
          <a class="btn btnPrimary" href="https://cabinet.sud.uz/" target="_blank" rel="noopener noreferrer">${lang==="uz"?"Sudga elektron topshirish":lang==="ru"?"Подать в суд":"File with court"} ↗</a>
        </div>
      </div>

      <div class="surface surfacePad" style="margin-top:18px;">
        <div class="resultLabel">
          ${lang === "uz" ? "QONUNCHILIK VA O‘QUV MANBALARI" : lang === "ru" ? "ЗАКОНОДАТЕЛЬСТВО И УЧЕБНЫЕ ИСТОЧНИКИ" : "LEGISLATION AND STUDY RESOURCES"}
        </div>
        <div class="serviceGrid" style="margin-top:16px;">
          <a class="serviceCard" href="https://lex.uz/docs/-6257288" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">§</div>
            <h3>${lang === "uz" ? "Mehnat kodeksi — LexUZ" : lang === "ru" ? "Трудовой кодекс — LexUZ" : "Labour Code — LexUZ"}</h3>
            <p>${lang === "uz" ? "Mehnat kodeksining amaldagi rasmiy matnini to‘g‘ridan-to‘g‘ri o‘qing." : lang === "ru" ? "Откройте актуальный официальный текст Трудового кодекса." : "Read the current official Labour Code."}</p>
          </a>
          <a class="serviceCard" href="https://gov.uz/oz/advice/673/document/2915" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">i</div>
            <h3>${lang === "uz" ? "Mehnat shartnomasi bo‘yicha qo‘llanma" : lang === "ru" ? "Руководство по трудовому договору" : "Employment-contract guide"}</h3>
            <p>${lang === "uz" ? "Shartnoma mazmuni, shakli, muddati va asosiy talablar." : lang === "ru" ? "Содержание, форма, срок и основные требования." : "Content, form, term and core requirements."}</p>
          </a>
          <a class="serviceCard" href="https://gov.uz/oz/advice/554/document/2253" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">J</div>
            <h3>${lang === "uz" ? "Jamoa shartnomasi" : lang === "ru" ? "Коллективный договор" : "Collective agreement"}</h3>
            <p>${lang === "uz" ? "Jamoa shartnomasi va uning mazmuni bo‘yicha rasmiy material." : lang === "ru" ? "Официальный материал о коллективном договоре." : "Official material on collective agreements."}</p>
          </a>
        </div>
      </div>
    `,
    t.title,
    t.description
  );
}


async function employmentResultPage(lang, form = {}) {

  lang = getLang(lang);

  const resultType = String(form.result_type || "");
  const wantsClaim = resultType === "claim";
  const wantsContract = resultType === "contract";

  const labels = {
    uz: {
      title: wantsContract ? "Mehnat shartnomasi namunasi" : (wantsClaim ? "Mehnat nizosi bo‘yicha da’vo arizasi loyihasi" : "Mehnat nizosi bo‘yicha huquqiy xulosa"),
      description: "Siz kiritgan ma’lumotlar asosida tayyorlangan dastlabki natija.",
      back: "Ma’lumotlarni o‘zgartirish",
      instructionConclusion: `O‘zbekiston mehnat qonunchiligi bo‘yicha professional huquqiy xulosa tayyorlang.
Faktlarni alohida, huquqiy masalalarni alohida ko‘rsating.
Amaldagi Mehnat kodeksiga tayangan holda huquqiy imkoniyatlar va keyingi qadamlarni tushuntiring.
Modda raqamiga ishonchingiz komil bo‘lmasa uni o‘ylab topmang va rasmiy LexUZ matnini tekshirish zarurligini ayting.
Yetishmayotgan faktlarni taxmin qilmang.`,
      instructionClaim: `O‘zbekiston mehnat qonunchiligi bo‘yicha sudga taqdim etish uchun dastlabki da’vo arizasi loyihasini tayyorlang.
Rasmiy uslubdan foydalaning.
Sud, taraflar yoki boshqa rekvizitlar yetishmasa [TO‘LDIRILADI] deb belgilang.
Faktlarni o‘ylab topmang.
Talablar, ish holatlari, huquqiy asos va ilovalar bo‘limlarini ajrating.
Modda raqamiga ishonchingiz komil bo‘lmasa uni o‘ylab topmang va amaldagi LexUZ matnini tekshirish kerakligini ko‘rsating.`
    },
    ru: {
      title: wantsContract ? "Проект трудового договора" : (wantsClaim ? "Проект иска по трудовому спору" : "Правовое заключение по трудовому спору"),
      description: "Предварительный результат на основе введённых данных.",
      back: "Изменить данные",
      instructionConclusion: `Подготовьте профессиональное правовое заключение по трудовому законодательству Узбекистана. Отделите факты от правовых вопросов, объясните возможные правовые варианты и дальнейшие шаги. Не придумывайте номера статей и отсутствующие факты; при необходимости укажите на необходимость проверки актуального текста на LexUZ.`,
      instructionClaim: `Подготовьте первоначальный проект искового заявления по трудовому спору в Узбекистане. Используйте официальный стиль. Недостающие реквизиты обозначьте [ЗАПОЛНИТЬ]. Не придумывайте факты или статьи. Отдельно укажите обстоятельства, требования, правовое основание и приложения.`
    },
    en: {
      title: wantsContract ? "Employment contract draft" : (wantsClaim ? "Employment dispute claim draft" : "Employment-law conclusion"),
      description: "Preliminary result based on the information entered.",
      back: "Change information",
      instructionConclusion: `Prepare a professional legal conclusion under Uzbekistan employment law. Separate facts from legal issues, explain possible legal options and next steps. Do not invent statutory article numbers or missing facts; where needed, state that the current LexUZ text should be verified.`,
      instructionClaim: `Prepare an initial court claim draft for an employment dispute in Uzbekistan. Use formal style. Mark missing filing details as [TO BE COMPLETED]. Do not invent facts or statutory provisions. Separate facts, requests, legal basis and attachments.`
    }
  }[lang];

  const contractInstruction = lang === "uz"
    ? `O‘zbekiston mehnat qonunchiligiga mos mehnat shartnomasi loyihasini tayyorlang. Tanlangan shartnoma turiga mos bo‘limlarni kiriting: taraflar, ish joyi va mehnat vazifasi, ish boshlanishi va muddat, ish haqi, ish vaqti va dam olish, huquq va majburiyatlar, mehnatni muhofaza qilish, javobgarlik, shartnomani o‘zgartirish va bekor qilish, yakuniy qoidalar, rekvizit va imzolar. Yetishmayotgan har qanday shaxsiy yoki faktik ma’lumotni [TO‘LDIRILADI] deb belgilang. Fakt, modda, summa yoki rekvizitni o‘ylab topmang.`
    : lang === "ru"
    ? `Подготовьте проект трудового договора по законодательству Узбекистана с необходимыми разделами. Все отсутствующие фактические данные обозначьте [ЗАПОЛНИТЬ]. Не придумывайте факты, суммы, реквизиты или статьи.`
    : `Prepare an Uzbekistan employment contract draft with the necessary sections. Mark every missing factual detail [TO BE COMPLETED]. Do not invent facts, amounts, identifiers or statutory provisions.`;

  const context = `
ISSUE TYPE: ${String(form.issue_type || "")}
EMPLOYER: ${String(form.employer || "")}
POSITION: ${String(form.position || "")}
EMPLOYMENT START: ${String(form.employment_start || "")}
EMPLOYMENT END: ${String(form.employment_end || "")}
ORDER / CONTRACT INFO: ${String(form.order_info || "")}
FACTS: ${String(form.facts || "")}
EVIDENCE: ${String(form.evidence || "")}
REQUESTED OUTPUT: ${wantsContract ? "EMPLOYMENT CONTRACT DRAFT" : (wantsClaim ? "CLAIM DRAFT" : "LEGAL CONCLUSION")}
  `.trim();

  let answer = "";

  try {
    answer = await callAI(
      wantsContract ? contractInstruction : (wantsClaim ? labels.instructionClaim : labels.instructionConclusion),
      lang,
      context
    );
  } catch (error) {
    console.error("EMPLOYMENT AI ERROR:", error);
    answer =
      lang === "uz"
        ? "Mehnat huquqi bo‘yicha natijani yaratishda xatolik yuz berdi. OPENROUTER_API_KEY sozlamasini tekshiring."
        : lang === "ru"
        ? "Не удалось сформировать результат. Проверьте OPENROUTER_API_KEY."
        : "The result could not be generated. Check OPENROUTER_API_KEY.";
  }

  return appLayout(
    lang,
    "employment",
    `
      <div class="resultBox">
        <div class="resultLabel">HUQUQIY AI • EMPLOYMENT</div>
        ${esc(answer)}
      </div>

      <div class="formActions">
        <a class="btn btnOutline" href="/employment${q(lang)}">← ${esc(labels.back)}</a>
        ${(wantsClaim || wantsContract) ? `<a class="btn btnPrimary" href="/employment${q(lang)}">↺ ${esc(labels.back)}</a>` : ""}
      </div>
    `,
    labels.title,
    labels.description
  );
}


// ======================================================
// CALCULATORS PAGE
// ======================================================

function calculatorsPage(lang) {

  lang = getLang(lang);

  const t = {
    uz: {
      title: "Aliment va huquqiy hisob-kitoblar",
      description: "Farzandlar soni va oylik daromad asosida alimentning dastlabki hisobini ko‘ring.",
      aliment: "Aliment hisoblash",
      alimentText: "Savollarga javob bering. Hisob O‘zbekiston Respublikasi Oila kodeksining 99-moddasidagi umumiy ulushlar asosida ko‘rsatiladi.",
      children: "Voyaga yetmagan farzandlar soni",
      income: "Aliment to‘lovchining oylik ish haqi va (yoki) boshqa daromadi",
      incomeStatus: "Daromad holati",
      official: "Rasmiy va barqaror daromad",
      variable: "O‘zgaruvchan yoki to‘liq tasdiqlanmagan daromad",
      agreement: "Aliment bo‘yicha kelishuv mavjudmi?",
      no: "Yo‘q",
      yes: "Ha",
      calculate: "Hisoblash",
      result: "Dastlabki hisob",
      legal: "Huquqiy asos",
      legalText: "Oila kodeksi 99-moddasi: kelishuv bo‘lmasa, odatda bir bola uchun daromadning 1/4 qismi, ikki bola uchun 1/3 qismi, uch va undan ortiq bola uchun 1/2 qismi undiriladi. Sud taraflarning moddiy yoki oilaviy ahvoli va boshqa e’tiborga loyiq holatlarni hisobga olib miqdorni kamaytirishi yoki ko‘paytirishi mumkin.",
      minText: "Shuningdek, har bir bola uchun qonunda belgilangan eng kam miqdor talabi mavjud. Aniq yakuniy miqdor uchun amaldagi MHEKM va ish holatini tekshirish kerak.",
      property: "Mol-mulk ulushi",
      propertyText: "Mol-mulk qiymatidan matematik ulushni hisoblash uchun yordamchi vosita.",
      value: "Mol-mulk qiymati",
      share: "Ulush (%)",
      warning: "Natija dastlabki ma’lumot uchun. Alimentning yakuniy miqdori sud hujjati, notarial kelishuv va ishning aniq holatlariga bog‘liq."
    },
    ru: {
      title: "Алименты и юридические расчёты",
      description: "Получите предварительный расчёт алиментов по количеству детей и ежемесячному доходу.",
      aliment: "Расчёт алиментов",
      alimentText: "Ответьте на вопросы. Расчёт основан на общих долях, предусмотренных статьёй 99 Семейного кодекса Республики Узбекистан.",
      children: "Количество несовершеннолетних детей",
      income: "Ежемесячная заработная плата и (или) иной доход плательщика",
      incomeStatus: "Характер дохода",
      official: "Официальный и стабильный доход",
      variable: "Переменный или не полностью подтверждённый доход",
      agreement: "Есть соглашение об алиментах?",
      no: "Нет",
      yes: "Да",
      calculate: "Рассчитать",
      result: "Предварительный расчёт",
      legal: "Правовое основание",
      legalText: "Статья 99 Семейного кодекса: при отсутствии соглашения обычно взыскивается 1/4 дохода на одного ребёнка, 1/3 — на двух, 1/2 — на трёх и более детей. Суд может уменьшить или увеличить размер с учётом материального и семейного положения и иных заслуживающих внимания обстоятельств.",
      minText: "Закон также предусматривает минимальный размер на каждого ребёнка. Для точного итогового расчёта необходимо проверить действующий МРОТ/МРЗП и обстоятельства дела.",
      property: "Доля имущества",
      propertyText: "Вспомогательный математический расчёт доли от стоимости имущества.",
      value: "Стоимость имущества",
      share: "Доля (%)",
      warning: "Результат носит предварительный характер. Окончательный размер зависит от судебного акта, нотариального соглашения и конкретных обстоятельств."
    },
    en: {
      title: "Child support and legal calculations",
      description: "See a preliminary child-support calculation based on the number of children and monthly income.",
      aliment: "Child-support calculation",
      alimentText: "Answer the questions. The calculation uses the general shares in Article 99 of the Family Code of Uzbekistan.",
      children: "Number of minor children",
      income: "Payer's monthly salary and/or other income",
      incomeStatus: "Income status",
      official: "Official and stable income",
      variable: "Variable or not fully documented income",
      agreement: "Is there a child-support agreement?",
      no: "No",
      yes: "Yes",
      calculate: "Calculate",
      result: "Preliminary calculation",
      legal: "Legal basis",
      legalText: "Family Code Article 99: where there is no agreement, the general shares are 1/4 of income for one child, 1/3 for two children, and 1/2 for three or more children. A court may decrease or increase the amount considering the parties' financial or family circumstances and other relevant factors.",
      minText: "The law also provides a minimum amount per child. The current statutory minimum and case facts should be checked for a final figure.",
      property: "Property share",
      propertyText: "A supporting mathematical tool for calculating a percentage share of property value.",
      value: "Property value",
      share: "Share (%)",
      warning: "This is a preliminary result. The final amount depends on the court order, notarized agreement and specific circumstances."
    }
  }[lang];

  return appLayout(
    lang,
    "calculators",
    `
      <div class="notice noticeGold">
        <span class="noticeIcon">!</span>
        <span>${esc(t.warning)}</span>
      </div>

      <div class="calculatorGrid">

        <section class="calcCard">
          <h3>${esc(t.aliment)}</h3>
          <p>${esc(t.alimentText)}</p>

          <div class="formGroup">
            <label>${esc(t.children)}</label>
            <input id="childrenCount" type="number" min="1" step="1" value="1">
          </div>

          <div class="formGroup" style="margin-top:12px;">
            <label>${esc(t.income)}</label>
            <input id="alimentIncome" type="number" min="0" step="any" placeholder="0">
          </div>

          <div class="formGroup" style="margin-top:12px;">
            <label>${esc(t.incomeStatus)}</label>
            <select id="incomeStatus">
              <option value="official">${esc(t.official)}</option>
              <option value="variable">${esc(t.variable)}</option>
            </select>
          </div>

          <div class="formGroup" style="margin-top:12px;">
            <label>${esc(t.agreement)}</label>
            <select id="alimentAgreement">
              <option value="no">${esc(t.no)}</option>
              <option value="yes">${esc(t.yes)}</option>
            </select>
          </div>

          <button type="button" class="btn btnPrimary" style="margin-top:15px;" onclick="calculateAliment()">
            ∑ ${esc(t.calculate)}
          </button>

          <div id="alimentResult" class="calcResult">${esc(t.result)}: —</div>

          <div class="notice noticeGold" style="margin-top:16px;">
            <span class="noticeIcon">§</span>
            <span><strong>${esc(t.legal)}.</strong> ${esc(t.legalText)} ${esc(t.minText)}</span>
          </div>
        </section>

        <section class="calcCard">
          <h3>${esc(t.property)}</h3>
          <p>
            ${lang === "uz"
              ? "Mol-mulkning huquqiy maqomini savol-javob orqali aniqlang. Natija Oila kodeksining 23, 25, 27 va 28-moddalariga tayangan dastlabki tahlildir."
              : lang === "ru"
              ? "Определите правовой режим имущества через вопросы. Предварительный анализ опирается на статьи 23, 25, 27 и 28 Семейного кодекса."
              : "Assess the legal status of property through questions. The preliminary analysis is based on Articles 23, 25, 27 and 28 of the Family Code."}
          </p>

          <div class="formGroup">
            <label>${lang === "uz" ? "Mol-mulk turi" : lang === "ru" ? "Вид имущества" : "Property type"}</label>
            <select id="propertyType">
              <option value="home">${lang === "uz" ? "Uy / kvartira" : lang === "ru" ? "Дом / квартира" : "House / apartment"}</option>
              <option value="car">${lang === "uz" ? "Avtomobil" : lang === "ru" ? "Автомобиль" : "Vehicle"}</option>
              <option value="business">${lang === "uz" ? "Biznes / ulush" : lang === "ru" ? "Бизнес / доля" : "Business / share"}</option>
              <option value="other">${lang === "uz" ? "Boshqa mol-mulk" : lang === "ru" ? "Другое имущество" : "Other property"}</option>
            </select>
          </div>

          <div class="formGroup" style="margin-top:12px;">
            <label>${lang === "uz" ? "Mol-mulk qiymati" : lang === "ru" ? "Стоимость имущества" : "Property value"}</label>
            <input id="propertyValue" type="number" min="0" step="any" placeholder="0">
          </div>

          <div class="formGroup" style="margin-top:12px;">
            <label>${lang === "uz" ? "Mol-mulk qachon olingan?" : lang === "ru" ? "Когда приобретено имущество?" : "When was it acquired?"}</label>
            <select id="propertyWhen">
              <option value="marriage">${lang === "uz" ? "Nikoh davomida" : lang === "ru" ? "Во время брака" : "During marriage"}</option>
              <option value="before">${lang === "uz" ? "Nikohdan oldin" : lang === "ru" ? "До брака" : "Before marriage"}</option>
              <option value="separate">${lang === "uz" ? "Oilaviy munosabatlar tugagach, alohida yashash davrida" : lang === "ru" ? "После прекращения семейных отношений, при раздельном проживании" : "After family relations ended, while living separately"}</option>
            </select>
          </div>

          <div class="formGroup" style="margin-top:12px;">
            <label>${lang === "uz" ? "Hadya, meros yoki boshqa bepul bitim orqali olinganmi?" : lang === "ru" ? "Получено в дар, по наследству или иной безвозмездной сделке?" : "Was it received by gift, inheritance or another gratuitous transaction?"}</label>
            <select id="propertyGift">
              <option value="no">${lang === "uz" ? "Yo‘q" : lang === "ru" ? "Нет" : "No"}</option>
              <option value="yes">${lang === "uz" ? "Ha" : lang === "ru" ? "Да" : "Yes"}</option>
            </select>
          </div>

          <div class="formGroup" style="margin-top:12px;">
            <label>${lang === "uz" ? "Nikoh shartnomasi bormi?" : lang === "ru" ? "Есть брачный договор?" : "Is there a marriage contract?"}</label>
            <select id="propertyPrenup">
              <option value="no">${lang === "uz" ? "Yo‘q" : lang === "ru" ? "Нет" : "No"}</option>
              <option value="yes">${lang === "uz" ? "Ha" : lang === "ru" ? "Да" : "Yes"}</option>
            </select>
          </div>

          <div class="formGroup" style="margin-top:12px;">
            <label>${lang === "uz" ? "Mol-mulk qiymatini sezilarli oshirgan umumiy mablag‘ yoki kapital ta’mir bo‘lganmi?" : lang === "ru" ? "Были общие вложения или капитальный ремонт, существенно увеличившие стоимость?" : "Were there common investments or major renovations that substantially increased value?"}</label>
            <select id="propertyInvestment">
              <option value="no">${lang === "uz" ? "Yo‘q / aniq emas" : lang === "ru" ? "Нет / неизвестно" : "No / unknown"}</option>
              <option value="yes">${lang === "uz" ? "Ha" : lang === "ru" ? "Да" : "Yes"}</option>
            </select>
          </div>

          <button type="button" class="btn btnPrimary" style="margin-top:15px;" onclick="analyzeProperty()">
            § ${lang === "uz" ? "Huquqiy tahlil" : lang === "ru" ? "Правовой анализ" : "Legal analysis"}
          </button>

          <div id="propertyResult" class="calcResult" style="white-space:pre-line;">
            ${lang === "uz" ? "Natija: —" : lang === "ru" ? "Результат: —" : "Result: —"}
          </div>

          <div class="formActions" style="margin-top:12px;">
            <a class="btn btnOutline" href="/claim${q(lang)}&type=property_claim">
              ▤ ${lang === "uz" ? "Mol-mulk bo‘yicha da’vo tayyorlash" : lang === "ru" ? "Подготовить иск о разделе имущества" : "Prepare a property claim"}
            </a>
          </div>

          <div class="notice noticeGold" style="margin-top:16px;">
            <span class="noticeIcon">§</span>
            <span>
              ${lang === "uz"
                ? "Huquqiy asos: Oila kodeksi 23-modda — umumiy mulk; 25-modda — har bir er-xotinning alohida mulki va qiymat sezilarli oshirilgan holatlar; 27-modda — umumiy mol-mulkni bo‘lish; 28-modda — ulushlar, odatda teng, lekin qonunda nazarda tutilgan holatlarda sud tenglikdan chekinishi mumkin."
                : lang === "ru"
                ? "Правовая основа: статьи 23, 25, 27 и 28 Семейного кодекса — общее имущество, личное имущество, раздел и определение долей."
                : "Legal basis: Family Code Articles 23, 25, 27 and 28 on common property, separate property, division and determination of shares."}
            </span>
          </div>
        </section>

      </div>

      <script>
        function formatNumber(value){
          if(!Number.isFinite(value)){ return "0"; }
          return new Intl.NumberFormat(
            "${lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uz-UZ"}",
            { maximumFractionDigits:2 }
          ).format(value);
        }

        function calculateAliment(){
          const children = Math.max(1, Number(document.getElementById("childrenCount").value || 1));
          const income = Math.max(0, Number(document.getElementById("alimentIncome").value || 0));
          const status = document.getElementById("incomeStatus").value;
          const agreement = document.getElementById("alimentAgreement").value;

          let share = children === 1 ? 0.25 : children === 2 ? (1/3) : 0.50;
          const result = income * share;
          const percent = share * 100;

          let extra = "";
          if(status === "variable"){
            extra += " ${lang === "uz" ? "Daromad o‘zgaruvchan bo‘lsa, aniq undirish tartibi ish holatiga qarab alohida baholanishi kerak." : lang === "ru" ? "При переменном доходе порядок взыскания требует отдельной оценки обстоятельств дела." : "Where income is variable, the method of recovery requires separate assessment of the case."}";
          }
          if(agreement === "yes"){
            extra += " ${lang === "uz" ? "Aliment bo‘yicha mavjud kelishuv shartlari ham tekshirilishi kerak." : lang === "ru" ? "Также необходимо проверить условия существующего соглашения об алиментах." : "The terms of any existing child-support agreement should also be checked."}";
          }

          document.getElementById("alimentResult").textContent =
            "${t.result}: " + formatNumber(result) +
            " (${lang === "uz" ? "daromadning" : lang === "ru" ? "от дохода" : "of income"} " +
            formatNumber(percent) + "%)." + extra;
        }

        function analyzeProperty(){
          const value = Math.max(0, Number(document.getElementById("propertyValue").value || 0));
          const when = document.getElementById("propertyWhen").value;
          const gift = document.getElementById("propertyGift").value;
          const prenup = document.getElementById("propertyPrenup").value;
          const investment = document.getElementById("propertyInvestment").value;

          let status = "";
          let article = "";
          let shareText = "";

          if(prenup === "yes"){
            status = "${lang === "uz" ? "Nikoh shartnomasi mavjud. Mol-mulk rejimi va ulushlar avvalo uning amaldagi shartlari bilan birga tekshirilishi kerak." : lang === "ru" ? "Имеется брачный договор. Режим имущества и доли необходимо оценивать с учётом его действующих условий." : "A marriage contract exists. Property status and shares should first be assessed together with its applicable terms."}";
            article = "${lang === "uz" ? "Oila kodeksi 29–31-moddalari ham tekshiriladi." : lang === "ru" ? "Следует также проверить статьи 29–31 Семейного кодекса." : "Family Code Articles 29–31 should also be checked."}";
          } else if(gift === "yes"){
            status = "${lang === "uz" ? "Hadya, meros yoki boshqa bepul bitim orqali olingan mol-mulk, odatda, uni olgan er yoki xotinning o‘z mulki hisoblanadi." : lang === "ru" ? "Имущество, полученное в дар, по наследству или иной безвозмездной сделке, как правило, является личным имуществом супруга." : "Property received by gift, inheritance or another gratuitous transaction is generally separate property of the receiving spouse."}";
            article = "${lang === "uz" ? "Huquqiy asos: Oila kodeksi 25-modda." : lang === "ru" ? "Правовая основа: статья 25 Семейного кодекса." : "Legal basis: Family Code Article 25."}";
          } else if(when === "before"){
            status = "${lang === "uz" ? "Nikohdan oldin tegishli bo‘lgan mol-mulk, odatda, o‘sha shaxsning o‘z mulki hisoblanadi." : lang === "ru" ? "Имущество, принадлежавшее супругу до брака, как правило, является его личным имуществом." : "Property owned before marriage is generally separate property."}";
            article = "${lang === "uz" ? "Huquqiy asos: Oila kodeksi 25-modda." : lang === "ru" ? "Правовая основа: статья 25 Семейного кодекса." : "Legal basis: Family Code Article 25."}";
          } else if(when === "separate"){
            status = "${lang === "uz" ? "Oilaviy munosabatlar tugab, er-xotin alohida yashagan davrda olingan mol-mulkni sud ayrim holatlarda har birining o‘z mulki deb topishi mumkin." : lang === "ru" ? "Имущество, приобретённое после прекращения семейных отношений при раздельном проживании, суд в отдельных случаях может признать личным." : "A court may in some circumstances treat property acquired while spouses lived separately after family relations ended as separate property."}";
            article = "${lang === "uz" ? "Huquqiy asos: Oila kodeksi 27-modda." : lang === "ru" ? "Правовая основа: статья 27 Семейного кодекса." : "Legal basis: Family Code Article 27."}";
          } else {
            status = "${lang === "uz" ? "Nikoh davomida orttirilgan mol-mulk, qoida tariqasida, er-xotinning birgalikdagi umumiy mulki hisoblanadi; kimning nomiga rasmiylashtirilgani o‘zi hal qiluvchi emas." : lang === "ru" ? "Имущество, приобретённое во время брака, как правило, является общей совместной собственностью супругов; само по себе оформление на одного из супругов не является решающим." : "Property acquired during marriage is generally common marital property; registration in one spouse's name alone is not decisive."}";
            article = "${lang === "uz" ? "Huquqiy asos: Oila kodeksi 23-modda." : lang === "ru" ? "Правовая основа: статья 23 Семейного кодекса." : "Legal basis: Family Code Article 23."}";
            if(value > 0){
              shareText = "\\n${lang === "uz" ? "Teng ulush boshlang‘ich hisobida har bir tomon uchun: " : lang === "ru" ? "При исходном равенстве долей каждому: " : "At an initial equal-share calculation, each side: "}" + formatNumber(value / 2) + ".";
            }
          }

          if(investment === "yes" && (when === "before" || gift === "yes")){
            status += " ${lang === "uz" ? "Biroq nikoh davomida umumiy mablag‘ yoki mehnat hisobiga mol-mulk qiymati ancha oshgan bo‘lsa, u birgalikdagi mulk deb topilishi mumkin." : lang === "ru" ? "Однако если во время брака за счёт общих средств или труда стоимость имущества существенно увеличилась, оно может быть признано совместным." : "However, if common funds or labor during marriage substantially increased its value, it may be recognized as common property."}";
            article += " ${lang === "uz" ? "Bu holat ham 25-modda doirasida baholanadi." : lang === "ru" ? "Это также оценивается по статье 25." : "This is also assessed under Article 25."}";
          }

          if(when === "marriage" && prenup !== "yes" && gift !== "yes"){
            shareText += "\\n${lang === "uz" ? "Ulushlar, odatda, teng deb hisoblanadi, ammo 28-modda bo‘yicha sud ayrim e’tiborga loyiq holatlarda tenglikdan chekinishi mumkin." : lang === "ru" ? "Доли, как правило, признаются равными, однако по статье 28 суд в предусмотренных случаях может отступить от равенства." : "Shares are generally presumed equal, but Article 28 permits a court to depart from equality in specified circumstances."}";
          }

          document.getElementById("propertyResult").textContent =
            "${lang === "uz" ? "Dastlabki huquqiy baho:" : lang === "ru" ? "Предварительная правовая оценка:" : "Preliminary legal assessment:"} " +
            status + "\\n" + article + shareText;
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
        "Da’vo arizasini tayyorlash",

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
        "Подготовить иск",

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
        "Prepare claim",

      official:
        "Open court system"

    }

  }[lang];



// ======================================================
// DAVLAT ORGANLARI — SERVER TOMONIDA
// ======================================================
          // ======================================================
// DAVLAT ORGANLARI MA'LUMOTLARI
// BU BLOK internalAffairsCards DAN OLDIN TURISHI SHART
// ======================================================

const STATE_ORGANIZATIONS = [

  // ====================================================
  // OLIY SUD
  // ====================================================

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


  // ====================================================
  // TOSHKENT SHAHAR SUDI
  // ====================================================

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


  // ====================================================
  // QOLGAN JINOYAT SUDLARI
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
        .replace(/[‘’']/g, "")
        .replace(/\s+/g, "-") +
      "-criminal",

    category: "court",
    type: "criminal",
    region: "Toshkent shahri",
    district,

    name:
      `Jinoyat ishlari bo‘yicha ${district} tuman sudi`,

    phone: null,

    verification:
      "Telefon raqami rasmiy manbadan yangilanmoqda"
  })),


  // ====================================================
  // SUD DEPARTAMENTI
  // ====================================================

  {
    id: "court-department-tashkent",
    category: "court_department",
    region: "Toshkent shahri",
    district: "Yakkasaroy",
    name:
      "Oliy sud huzuridagi Sudlar faoliyatini ta’minlash departamentining Toshkent shahar hududiy bo‘limi",
    address: "Shota Rustaveli ko‘chasi, 62-uy",
    phone: "+998 55 501-00-04",
    extension: "03142",
    source: "sud.uz"
  },


  // ====================================================
  // TOSHKENT SHAHAR IIBB
  // ====================================================

  {
    id: "tashkent-iibb",
    category: "internal_affairs",
    type: "regional",
    region: "Toshkent shahri",
    district: "Toshkent shahri",
    name: "Toshkent shahar Ichki ishlar bosh boshqarmasi",
    address: "S. Azimov ko‘chasi, 87-uy",
    phone: "+998 71 206-41-65",
    appealsPhone: "+998 71 206-43-34",
    emergencyPhone: "102",
    hotline: "1102",
    source: "iibb.uz"
  },


  // ====================================================
  // ICHKI ISHLAR TEZKOR / ISHONCH RAQAMLARI
  // ====================================================

  {
    id: "police-emergency-102",
    category: "internal_affairs",
    type: "emergency",
    region: "O‘zbekiston",
    district: "O‘zbekiston",
    name: "Ichki ishlar organlari tezkor va ishonch telefonlari",
    phone: "102",
    emergencyPhone: "102",
    hotline: "1102",
    description:
      "Huquqbuzarlik, jinoyat yoki tezkor ichki ishlar yordami zarur bo‘lgan holatlar uchun.",
    source: "iibb.uz"
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
        .replace(/[‘’']/g, "")
        .replace(/\s+/g, "-") +
      "-iio-fmb",

    category: "internal_affairs",
    type: "district",

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

 const courtCards =
  TASHKENT_COURTS
    .map(court => {

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
          (court.district || "") +
          " " +
          (court.type || "") +
          " " +
          (court.keywords || "")
        )
          .toLowerCase()
          .replace(/"/g, "&quot;");

      return `

        <article
          class="courtCard"
          data-type="${esc(court.type || "court")}"
          data-search="${esc(searchable)}"
          data-name="${esc(name)}"
          data-district="${esc(court.district || "")}"
          data-map="${esc(mapsUrl)}"
        >

          <div class="courtCardTop">

            <span class="courtType">
              ⚖ SUD
            </span>

            <span class="courtDistrict">
              ${esc(court.district || "Toshkent")}
            </span>

          </div>

          <h3>
            ${esc(name)}
          </h3>

          ${
            court.address
              ? `
                <p>
                  📍 ${esc(court.address)}
                </p>
              `
              : ""
          }

          ${
            court.phone
              ? `
                <p>
                  ☎
                  <a href="tel:${esc(court.phone.replace(/\s/g, ""))}">
                    ${esc(court.phone)}
                  </a>
                </p>
              `
              : ""
          }

          <div class="courtCardActions">

            <button
              type="button"
              class="courtMapButton"
              data-map="${esc(mapsUrl)}"
              data-name="${esc(name)}"
              onclick="showCourtMap(this)"
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

    })
    .join("");


// ======================================================
// ICHKI ISHLAR KARTALARI
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
        "Toshkent shahri";

      const address =
        organization.address || "";

      const phone =
        organization.phone ||
        organization.localPhone ||
        "";

      const appealsPhone =
        organization.appealsPhone ||
        "";

      const emergencyPhone =
        organization.emergencyPhone ||
        "102";

      const hotline =
        organization.hotline ||
        "1102";

      const touristPhone =
        organization.touristPhone ||
        "";

      const mapsUrl =
        googleMapsSearch(
          name,
          district
        );

      const directionUrl =
        googleMapsDirections(
          name,
          district
        );

      const searchable =
        (
          name +
          " " +
          district +
          " " +
          address +
          " ichki ishlar iib iio fmb 102 1102"
        )
          .toLowerCase()
          .replace(/"/g, "&quot;");

      return `

        <article
          class="courtCard"
          data-type="internal_affairs"
          data-search="${esc(searchable)}"
          data-name="${esc(name)}"
          data-district="${esc(district)}"
          data-map="${esc(mapsUrl)}"
        >

          <div class="courtCardTop">

            <span class="courtType">
              👮 ICHKI ISHLAR
            </span>

            <span class="courtDistrict">
              ${esc(district)}
            </span>

          </div>


          <h3>
            ${esc(name)}
          </h3>


          ${
            address
              ? `
                <p>
                  📍
                  <strong>Manzil:</strong>
                  ${esc(address)}
                </p>
              `
              : ""
          }


          ${
            phone
              ? `
                <p>
                  ☎
                  <strong>Telefon:</strong>

                  <a
                    href="tel:${esc(phone.replace(/\s/g, ""))}"
                  >
                    ${esc(phone)}
                  </a>
                </p>
              `
              : ""
          }


          ${
            appealsPhone
              ? `
                <p>
                  ☎
                  <strong>Murojaatlar:</strong>

                  <a
                    href="tel:${esc(appealsPhone.replace(/\s/g, ""))}"
                  >
                    ${esc(appealsPhone)}
                  </a>
                </p>
              `
              : ""
          }


          <p>
            🚨
            <strong>Tezkor raqam:</strong>

            <a href="tel:${esc(emergencyPhone)}">
              ${esc(emergencyPhone)}
            </a>
          </p>


          <p>
            ☎
            <strong>Ishonch telefoni:</strong>

            <a href="tel:${esc(hotline)}">
              ${esc(hotline)}
            </a>
          </p>


          ${
            touristPhone
              ? `
                <p>
                  🌐
                  <strong>Turistlar uchun:</strong>

                  <a href="tel:${esc(touristPhone)}">
                    ${esc(touristPhone)}
                  </a>
                </p>
              `
              : ""
          }


          <div class="courtCardActions">

            <button
              type="button"
              class="courtMapButton"
              data-map="${esc(mapsUrl)}"
              data-name="${esc(name)}"
              onclick="showCourtMap(this)"
            >
              📍 Xaritada ko‘rish
            </button>


            <a
              class="courtMapButton primary"
              href="${directionUrl}"
              target="_blank"
              rel="noopener noreferrer"
            >
              🧭 Yo‘nalish
            </a>

          </div>

        </article>

      `;

    })
    .join("");



// ======================================================
// MIB — MAJBURIY IJRO BYUROSI (ALOHIDA BO'LIM)
// ======================================================
const MIB_ORGANIZATIONS = [
  "MIB Toshkent shahar boshqarmasi",
  "MIB Bektemir tuman bo‘limi",
  "MIB Chilonzor tuman bo‘limi",
  "MIB Mirobod tuman bo‘limi",
  "MIB Mirzo Ulug‘bek tuman bo‘limi",
  "MIB Olmazor tuman bo‘limi",
  "MIB Sergeli tuman bo‘limi",
  "MIB Shayxontohur tuman bo‘limi",
  "MIB Uchtepa tuman bo‘limi",
  "MIB Yakkasaroy tuman bo‘limi",
  "MIB Yashnobod tuman bo‘limi",
  "MIB Yunusobod tuman bo‘limi",
  "MIB Yangihayot tuman bo‘limi"
];

const mibCards = MIB_ORGANIZATIONS.map(name => {
  const mapsUrl = googleMapsSearch(name + ", Tashkent, Uzbekistan");
  const directionUrl = googleMapsDirections(name + ", Tashkent, Uzbekistan");
  const searchable = (name + " MIB majburiy ijro byurosi ijro aliment qarzdorlik").toLowerCase();

  return `
    <article
      class="courtCard premiumAgencyCard"
      data-type="mib"
      data-category="mib"
      data-search="${esc(searchable)}"
      data-name="${esc(name)}"
      data-district="Toshkent"
      data-map="${esc(mapsUrl)}"
    >
      <div class="courtCardTop">
        <span class="courtType">⚡ MIB</span>
        <span class="courtDistrict">Toshkent</span>
      </div>
      <h3>${esc(name)}</h3>
      <p>Ijro hujjatlari, aliment, qarzdorlik va majburiy ijro masalalari bo‘yicha hududiy bo‘lim.</p>
      <div class="courtCardActions">
        <button type="button" class="courtMapButton" data-map="${esc(mapsUrl)}"
          data-name="${esc(name)}" onclick="showCourtMap(this)">📍 Xaritada ko‘rish</button>
        <a class="courtMapButton primary" href="${directionUrl}" target="_blank"
          rel="noopener noreferrer">🧭 Yo‘nalish</a>
      </div>
    </article>
  `;
}).join("");

// SUD + ICHKI ISHLAR
const cards =
  courtCards +
  internalAffairsCards +
  mibCards;


  const initialMap =
    "https://www.google.com/maps?q=" +
    encodeURIComponent(
      "Toshkent shahar sudlari, Tashkent, Uzbekistan"
    ) +
    "&output=embed";


  const content = `

    <style>
      ${COURT_CSS}

      .agencySection{
        margin:18px 0 28px;
        padding:18px;
        border:1px solid rgba(255,255,255,.10);
        border-radius:24px;
        background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025));
        box-shadow:0 18px 50px rgba(0,0,0,.16);
        backdrop-filter:blur(14px);
      }
      .agencySectionTitle{
        display:flex;
        align-items:center;
        gap:14px;
        margin-bottom:16px;
        padding:14px 16px;
        border-radius:18px;
        background:rgba(255,255,255,.055);
        border:1px solid rgba(255,255,255,.08);
      }
      .agencySectionTitle strong{display:block;font-size:15px;letter-spacing:.08em}
      .agencySectionTitle small{display:block;margin-top:4px;opacity:.72;line-height:1.4}
      .agencySectionIcon{
        width:46px;height:46px;display:grid;place-items:center;border-radius:15px;
        background:rgba(255,255,255,.09);font-size:21px;flex:0 0 auto;
      }
      .agencyCards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
      .agencyMibSection{box-shadow:0 18px 55px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.08)}
      .premiumAgencyCard{position:relative;overflow:hidden}
      .premiumAgencyCard:before{
        content:"";position:absolute;inset:0 0 auto 0;height:2px;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.65),transparent);
      }
      @media(max-width:800px){.agencyCards{grid-template-columns:1fr}.agencySection{padding:12px}}
    
/* PREMIUM LEGALTECH UI */
body{background:radial-gradient(circle at 90% 2%,rgba(185,149,79,.09),transparent 28rem),linear-gradient(180deg,#fbfaf7,#f3f5f6);color:#14232f;font-size:17px;line-height:1.68}
.container{max-width:1240px}
.navbar,.appTopbar{background:rgba(7,24,39,.97)!important;border-bottom:1px solid rgba(217,192,131,.18);box-shadow:0 12px 38px rgba(2,15,25,.16);backdrop-filter:blur(18px)}
.brand strong,.appBrand strong{font-size:23px;font-weight:850;letter-spacing:-.035em}
.navlinks a{padding:10px 13px;border-radius:12px;font-size:14px;font-weight:650}
.navlinks a:hover{background:rgba(255,255,255,.07)}
.hero{position:relative;overflow:hidden;background:radial-gradient(circle at 80% 20%,rgba(217,192,131,.15),transparent 22rem),linear-gradient(135deg,#061521,#0b2538 55%,#103149)!important}
.hero:after{content:"§";position:absolute;right:5vw;top:50%;transform:translateY(-50%);font-family:Georgia,serif;font-size:290px;color:rgba(217,192,131,.045);pointer-events:none}
.heroInner{position:relative;z-index:1;padding-top:88px;padding-bottom:92px}
.hero h1,.heroTitle{font-family:Georgia,"Times New Roman",serif;font-size:clamp(43px,5.4vw,72px);line-height:1.02;letter-spacing:-.045em}
.heroDescription{max-width:720px;font-size:18px;line-height:1.75}
.btn{min-height:48px;padding:12px 18px;border-radius:13px;font-size:14px;font-weight:780;transition:.2s ease}
.btn:hover{transform:translateY(-2px)}
.btnGold{color:#0b1e2e;background:linear-gradient(135deg,#e1c98d,#b9954f)!important;box-shadow:0 12px 28px rgba(185,149,79,.22)}
.section,.servicesSection{padding-top:72px;padding-bottom:72px}
.sectionTitle,.appHeader h1{font-family:Georgia,"Times New Roman",serif;letter-spacing:-.035em}
.sectionTitle{font-size:clamp(31px,4vw,47px);line-height:1.08}
.serviceGrid,.documentGrid,.sourceGrid,.coreGrid{gap:18px}
.serviceCard,.sourceCard,.coreItem,.documentCard,.calcCard,.surface{position:relative;overflow:hidden;border:1px solid rgba(12,36,56,.12);border-radius:22px;background:rgba(255,255,255,.9);box-shadow:0 10px 35px rgba(7,24,39,.055)}
.serviceCard,.sourceCard,.documentCard{padding:25px;transition:.22s ease}
.serviceCard:before,.documentCard:before,.sourceCard:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,#d9c083,#b9954f);opacity:.72}
.serviceCard:hover,.sourceCard:hover,.documentCard:hover{transform:translateY(-5px);box-shadow:0 18px 55px rgba(5,24,39,.10);border-color:rgba(185,149,79,.38)}
.serviceIcon{width:48px;height:48px;display:grid;place-items:center;margin-bottom:20px;border-radius:14px;color:#f1dfb2;background:linear-gradient(145deg,#0b2335,#153d59);border:1px solid rgba(217,192,131,.25);box-shadow:0 10px 25px rgba(7,24,39,.15);font-weight:850}
.serviceCard h3,.sourceCard h3,.documentCard h3{color:#071827;font-size:20px;line-height:1.25;letter-spacing:-.025em}
.serviceCard p,.sourceCard p,.documentCard p,.cardDescription{color:#66737d;font-size:14px;line-height:1.65}
.serviceLink{color:#8a6b2f;font-weight:800}
.surfacePad{padding:28px}
.appShell{max-width:1280px;gap:24px}
.appSidebar{border:1px solid rgba(12,36,56,.09);border-radius:20px;background:rgba(255,255,255,.84);box-shadow:0 14px 45px rgba(7,24,39,.06)}
.sideLink{border-radius:12px;font-weight:670}.sideLink.active{box-shadow:inset 3px 0 0 #b9954f}
.appHeader{margin-bottom:22px;padding:26px 28px;border-radius:20px;color:#fff;background:radial-gradient(circle at 90% 10%,rgba(217,192,131,.13),transparent 18rem),linear-gradient(135deg,#081b2b,#0d3048)!important;box-shadow:0 20px 55px rgba(5,24,39,.15)}
.appHeader h1{color:#fff;font-size:34px}.appHeader p{color:rgba(255,255,255,.7);font-size:15px}
.resultLabel{color:#98783a;font-size:11px;font-weight:850;letter-spacing:.12em}
.formGroup label{font-size:13px;font-weight:780}
.formGroup input,.formGroup textarea,.formGroup select{border-radius:13px!important;background:#fbfcfc;font-size:15px}
.formGroup input:focus,.formGroup textarea:focus,.formGroup select:focus{outline:none;border-color:rgba(185,149,79,.72)!important;box-shadow:0 0 0 4px rgba(185,149,79,.10)}
.notice{border-radius:15px}.noticeGold{background:#fbf7ed}
.calcResult{margin-top:16px;padding:20px;border-radius:15px;color:#eaf2f6;background:linear-gradient(135deg,#0b2335,#123b57)!important}
.footer{margin-top:70px;background:#061521!important;border-top:1px solid rgba(217,192,131,.16)}
@media(max-width:900px){.heroInner{padding-top:65px;padding-bottom:68px}.hero:after{font-size:190px;right:-30px}.surfacePad{padding:21px}.section,.servicesSection{padding-top:52px;padding-bottom:52px}}
@media(max-width:640px){body{font-size:16px}.hero h1,.heroTitle{font-size:40px}.serviceCard,.sourceCard,.documentCard{padding:21px}.btn{width:100%;justify-content:center}}

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
        data-filter="mib"
      >
        MIB
      </button>

      <button
        class="courtFilter"
        type="button"
        data-filter="internal_affairs"
      >
        Ichki ishlar
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

          <div class="agencySection agencyCourtSection">
            <div class="agencySectionTitle">
              <span class="agencySectionIcon">⚖</span>
              <div><strong>SUDLAR</strong><small>Fuqarolik, jinoyat, ma’muriy va iqtisodiy sudlar</small></div>
            </div>
            <div class="agencyCards">${courtCards}</div>
          </div>

          <div class="agencySection agencyMibSection">
            <div class="agencySectionTitle">
              <span class="agencySectionIcon">⚡</span>
              <div><strong>MAJBURIY IJRO BYUROSI — MIB</strong><small>Ijro hujjatlari, aliment va qarzdorlik bo‘yicha bo‘limlar</small></div>
            </div>
            <div class="agencyCards">${mibCards}</div>
          </div>

          <div class="agencySection agencyIibSection">
            <div class="agencySectionTitle">
              <span class="agencySectionIcon">👮</span>
              <div><strong>ICHKI ISHLAR BO‘LIMLARI</strong><small>IIBB va hududiy ichki ishlar organlari</small></div>
            </div>
            <div class="agencyCards">${internalAffairsCards}</div>
          </div>


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
        href="https://cabinet.sud.uz/"
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
// ACCOUNT + PERSONAL CABINET + ADMIN MANAGEMENT SYSTEM
// ======================================================

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
let nodemailer = null;
try { nodemailer = require("nodemailer"); } catch (_) {}

const ACCOUNT_DATA_FILE = process.env.ACCOUNT_DATA_FILE || path.join(process.cwd(), "huquqiy-ai-data.json");
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const VERIFY_TTL_MS = 1000 * 60 * 15;
const RESET_TTL_MS = 1000 * 60 * 20;
const OWNER_EMAIL = String(process.env.OWNER_EMAIL || "").trim().toLowerCase();

function accountEmptyDb(){
  return { users:[], sessions:[], cases:[], documents:[], conversations:[], notifications:[], consents:[], auditLogs:[], settings:{ createdAt:new Date().toISOString() } };
}
function accountLoadDb(){
  try {
    if(!fs.existsSync(ACCOUNT_DATA_FILE)) return accountEmptyDb();
    const parsed = JSON.parse(fs.readFileSync(ACCOUNT_DATA_FILE,"utf8"));
    return Object.assign(accountEmptyDb(), parsed || {});
  } catch(err){ console.error("ACCOUNT DB LOAD ERROR",err); return accountEmptyDb(); }
}
function accountSaveDb(db){
  const temp = ACCOUNT_DATA_FILE + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(db,null,2), "utf8");
  fs.renameSync(temp, ACCOUNT_DATA_FILE);
}
function accountId(prefix="ID"){
  return prefix + "-" + Date.now().toString(36).toUpperCase() + "-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}
function accountEmail(v){ return String(v||"").trim().toLowerCase(); }
function accountNow(){ return new Date().toISOString(); }
function accountHashPassword(password, salt=crypto.randomBytes(16).toString("hex")){
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return salt + ":" + hash;
}
function accountVerifyPassword(password, stored){
  try {
    const [salt,hash] = String(stored||"").split(":");
    const test = crypto.scryptSync(String(password), salt, 64);
    return crypto.timingSafeEqual(Buffer.from(hash,"hex"),test);
  } catch(_){ return false; }
}
function accountCookies(req){
  const out={}; String(req.headers.cookie||"").split(";").forEach(x=>{ const i=x.indexOf("="); if(i>0) out[x.slice(0,i).trim()]=decodeURIComponent(x.slice(i+1).trim()); }); return out;
}
function accountSession(req){
  const token=accountCookies(req).hq_session; if(!token) return null;
  const db=accountLoadDb(); const s=db.sessions.find(x=>x.token===token && new Date(x.expiresAt)>new Date());
  if(!s) return null; const user=db.users.find(x=>x.id===s.userId && x.status!=="blocked");
  return user ? {db,session:s,user} : null;
}
function accountSetSession(res,userId){
  const db=accountLoadDb();
  const token=crypto.randomBytes(32).toString("hex");
  db.sessions=db.sessions.filter(s=>new Date(s.expiresAt)>new Date() && s.userId!==userId);
  db.sessions.push({id:accountId("SES"),token,userId,createdAt:accountNow(),expiresAt:new Date(Date.now()+SESSION_TTL_MS).toISOString()});
  accountSaveDb(db);
  res.setHeader("Set-Cookie",`hq_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS/1000)}${process.env.NODE_ENV==="production"?"; Secure":""}`);
}
function accountClearSession(req,res){
  const token=accountCookies(req).hq_session; const db=accountLoadDb(); db.sessions=db.sessions.filter(s=>s.token!==token); accountSaveDb(db);
  res.setHeader("Set-Cookie","hq_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
}
function accountAudit(db,userId,action,meta={}){
  db.auditLogs.unshift({id:accountId("LOG"),userId:userId||null,action,meta,createdAt:accountNow()});
  db.auditLogs=db.auditLogs.slice(0,5000);
}
function accountCaseNo(db){ return `CASE-${new Date().getFullYear()}-${String(db.cases.length+1).padStart(5,"0")}`; }
function accountSafeUser(u){ return {id:u.id,firstName:u.firstName,lastName:u.lastName,email:u.email,role:u.role,status:u.status,emailVerified:!!u.emailVerified,createdAt:u.createdAt,lastLoginAt:u.lastLoginAt||null}; }
function accountRedirect(res,to){ res.writeHead(302,{Location:to}); return res.end(); }
function accountMessage(text,type="info"){ return `<div class="accountAlert ${type}">${esc(text)}</div>`; }

async function accountSendEmail(to,subject,text){
  if(nodemailer && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS){
    const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:String(process.env.SMTP_SECURE||"")==="true",auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
    await transport.sendMail({from:process.env.SMTP_FROM||process.env.SMTP_USER,to,subject,text});
    return true;
  }
  console.log(`[HUQUQIY AI EMAIL DEV] TO=${to} SUBJECT=${subject}\n${text}`);
  return false;
}

const ACCOUNT_CSS = `
.accountWrap{min-height:78vh;padding:42px 4%;background:linear-gradient(180deg,#f7f8f8,#eef2f3)}
.accountAuth{width:min(520px,100%);margin:0 auto;background:#fff;border:1px solid #dde5e8;border-radius:24px;padding:30px;box-shadow:0 24px 70px rgba(7,24,39,.10)}
.accountAuth h1,.accountPanel h1{font-family:Georgia,serif;color:#071827;margin:0 0 8px}.accountMuted{color:#70808b;font-size:14px}.accountForm{display:grid;gap:15px;margin-top:22px}.accountForm label{font-size:13px;font-weight:800;color:#263b4a}.accountForm input,.accountForm select,.accountForm textarea{width:100%;box-sizing:border-box;padding:13px 14px;border:1px solid #ced9de;border-radius:12px;background:#fbfcfc;font:inherit}.accountForm input:focus,.accountForm select:focus,.accountForm textarea:focus{outline:none;border-color:#b9954f;box-shadow:0 0 0 4px rgba(185,149,79,.12)}
.accountButton{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:11px 17px;border:0;border-radius:12px;background:#0a2639;color:#fff;font-weight:800;text-decoration:none;cursor:pointer}.accountButton.gold{background:linear-gradient(135deg,#d8bf7f,#b9954f);color:#071827}.accountButton.light{background:#eef2f4;color:#173044}.accountButton.danger{background:#8d2f36}.accountButton.small{min-height:36px;padding:7px 11px;font-size:12px}
.accountAlert{padding:12px 14px;border-radius:12px;margin:12px 0;font-size:14px;background:#edf4f8;color:#24465d}.accountAlert.error{background:#fff0f0;color:#8a3036}.accountAlert.success{background:#edf8f1;color:#25613d}
.accountShell{display:grid;grid-template-columns:260px 1fr;min-height:100vh;background:#f3f5f6}.accountSide{background:#071827;color:#dce6eb;padding:25px 16px;position:sticky;top:0;height:100vh;box-sizing:border-box}.accountSideBrand{display:flex;gap:10px;align-items:center;font-weight:900;font-size:20px;padding:8px 10px 24px}.accountSide a{display:flex;gap:10px;align-items:center;color:#bfcbd2;text-decoration:none;padding:11px 12px;border-radius:11px;margin:4px 0;font-size:14px;font-weight:700}.accountSide a:hover,.accountSide a.active{background:#123249;color:#fff}.accountSide .accountSideBottom{position:absolute;left:16px;right:16px;bottom:22px}.accountMain{padding:28px;min-width:0}.accountTop{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:22px}.accountIdentity{display:flex;align-items:center;gap:10px}.accountAvatar{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#d8bf7f,#a8813e);color:#071827;font-weight:900}.accountPanel{background:#fff;border:1px solid #dde5e8;border-radius:20px;padding:22px;box-shadow:0 8px 30px rgba(7,24,39,.045);margin-bottom:18px}.accountStats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px}.accountStat{background:#fff;border:1px solid #dde5e8;border-radius:18px;padding:18px}.accountStat strong{display:block;font-size:30px;color:#071827}.accountStat span{font-size:12px;color:#71808a;font-weight:800;text-transform:uppercase;letter-spacing:.06em}.accountGrid{display:grid;grid-template-columns:1.5fr 1fr;gap:18px}.accountTableWrap{overflow:auto}.accountTable{width:100%;border-collapse:collapse;min-width:680px}.accountTable th,.accountTable td{text-align:left;padding:12px;border-bottom:1px solid #edf0f2;font-size:13px}.accountTable th{font-size:11px;text-transform:uppercase;color:#71808a;letter-spacing:.06em}.accountBadge{display:inline-flex;padding:5px 9px;border-radius:999px;background:#edf4f8;color:#31576e;font-size:11px;font-weight:850}.accountBadge.good{background:#eaf7ef;color:#28603e}.accountBadge.warn{background:#fff6df;color:#805e17}.accountBadge.bad{background:#fff0f0;color:#8a3036}.accountActions{display:flex;gap:8px;flex-wrap:wrap}.accountProgress{height:8px;background:#e8edef;border-radius:999px;overflow:hidden}.accountProgress i{display:block;height:100%;background:linear-gradient(90deg,#b9954f,#d8bf7f)}.accountHero{padding:24px;border-radius:20px;background:radial-gradient(circle at 90% 10%,rgba(217,192,131,.16),transparent 18rem),linear-gradient(135deg,#081b2b,#0d3048);color:#fff;margin-bottom:18px}.accountHero h1{color:#fff;margin:0 0 8px}.accountHero p{color:#b9c8d1;margin:0}.accountCards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.accountCard{padding:18px;border:1px solid #dde5e8;border-radius:16px;background:#fff}.accountCard h3{margin:0 0 8px}.accountCode{font-family:ui-monospace,monospace;background:#f3f6f7;padding:2px 6px;border-radius:6px}
@media(max-width:980px){.accountShell{grid-template-columns:1fr}.accountSide{position:relative;height:auto}.accountSideBottom{position:static!important;margin-top:18px}.accountStats{grid-template-columns:repeat(2,1fr)}.accountGrid{grid-template-columns:1fr}.accountCards{grid-template-columns:1fr 1fr}}
@media(max-width:620px){.accountMain{padding:16px}.accountStats{grid-template-columns:1fr 1fr}.accountCards{grid-template-columns:1fr}.accountAuth{padding:22px}.accountTop{align-items:flex-start;flex-direction:column}}
`;

function accountPublicPage(lang,title,body){
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} — Huquqiy AI</title><style>${CSS}${ACCOUNT_CSS}</style></head><body>${navigation(lang)}<main class="accountWrap">${body}</main>${footer(lang)}</body></html>`;
}
function accountSidebar(lang,user,active){
  const admin=user.role==="owner"||user.role==="admin";
  const item=(key,icon,label,href)=>`<a class="${active===key?"active":""}" href="${href}${href.includes("?")?"&":"?"}lang=${lang}"><span>${icon}</span>${label}</a>`;
  return `<aside class="accountSide"><div class="accountSideBrand"><span>§</span><span>Huquqiy AI</span></div>
  ${item("dashboard","▦","Dashboard","/account")}${item("cases","⚖","Mening ishlarim","/account/cases")}${item("new","＋","Yangi huquqiy ish","/account/cases/new")}${item("chats","💬","AI suhbatlarim","/account/chats")}${item("documents","▤","Hujjatlarim","/account/documents")}${item("notifications","●","Bildirishnomalar","/account/notifications")}${item("profile","◉","Profil","/account/profile")}${item("security","⌾","Xavfsizlik","/account/security")}${item("settings","⚙","Sozlamalar","/account/settings")}${admin?item("admin","◆","ADMIN PANEL","/admin"):""}
  <div class="accountSideBottom"><a href="/logout?lang=${lang}">↪ Chiqish</a></div></aside>`;
}
function accountAppPage(lang,user,active,title,body){
  const initials=(user.firstName?.[0]||"U")+(user.lastName?.[0]||"");
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} — Huquqiy AI</title><style>${CSS}${ACCOUNT_CSS}</style></head><body><div class="accountShell">${accountSidebar(lang,user,active)}<main class="accountMain"><div class="accountTop"><div><b>${esc(title)}</b><div class="accountMuted">Huquqiy AI shaxsiy ish maydoni</div></div><div class="accountIdentity"><div><b>${esc(user.firstName)} ${esc(user.lastName)}</b><div class="accountMuted">${esc(user.email)}</div></div><div class="accountAvatar">${esc(initials)}</div></div></div>${body}</main></div></body></html>`;
}
function accountRequire(req,res,lang,roles=null){
  const auth=accountSession(req);
  if(!auth){ accountRedirect(res,`/login?lang=${lang}&next=${encodeURIComponent(getUrl(req).pathname)}`); return null; }
  if(roles && !roles.includes(auth.user.role)){ sendHtml(res,accountAppPage(lang,auth.user,"","Ruxsat yo‘q",accountMessage("Bu bo‘lim uchun ruxsatingiz yo‘q.","error")),403); return null; }
  return auth;
}

function accountLoginPage(lang,msg=""){
  return accountPublicPage(lang,"Kirish",`<section class="accountAuth"><h1>Shaxsiy kabinetga kirish</h1><p class="accountMuted">Email va parolingiz orqali Huquqiy AI profilingizga kiring.</p>${msg?accountMessage(msg,msg.includes("xato")||msg.includes("noto")?"error":"info"):""}<form class="accountForm" method="post" action="/login?lang=${lang}"><label>Email<input name="email" type="email" required autocomplete="email"></label><label>Parol<input name="password" type="password" required autocomplete="current-password"></label><button class="accountButton gold">Kirish</button></form><div class="accountActions" style="margin-top:16px"><a href="/register?lang=${lang}">Ro‘yxatdan o‘tish</a><a href="/forgot-password?lang=${lang}">Parolni unutdingizmi?</a></div></section>`);
}
function accountRegisterPage(lang,msg=""){
  return accountPublicPage(lang,"Ro‘yxatdan o‘tish",`<section class="accountAuth"><h1>Akkaunt yaratish</h1><p class="accountMuted">Huquqiy ishlaringiz, AI suhbatlari va hujjatlaringizni bitta profilga bog‘lang.</p>${msg?accountMessage(msg,"error"):""}<form class="accountForm" method="post" action="/register?lang=${lang}"><label>Ism<input name="firstName" required maxlength="60"></label><label>Familiya<input name="lastName" required maxlength="60"></label><label>Email<input name="email" type="email" required autocomplete="email"></label><label>Parol<input name="password" type="password" minlength="8" required autocomplete="new-password"></label><label>Parolni takrorlang<input name="password2" type="password" minlength="8" required></label><label style="display:flex;gap:10px;align-items:flex-start"><input style="width:auto;margin-top:4px" name="terms" value="yes" type="checkbox" required><span>Foydalanish shartlari va maxfiylik siyosatini o‘qidim.</span></label><button class="accountButton gold">Akkaunt yaratish</button></form><p class="accountMuted">Akkauntingiz bormi? <a href="/login?lang=${lang}">Kirish</a></p></section>`);
}
function accountVerifyPage(lang,email,msg=""){
  return accountPublicPage(lang,"Emailni tasdiqlash",`<section class="accountAuth"><h1>Emailni tasdiqlash</h1><p class="accountMuted"><b>${esc(email)}</b> manziliga yuborilgan 6 xonali kodni kiriting.</p>${msg?accountMessage(msg,msg.includes("Tasdiqlandi")?"success":"error"):""}<form class="accountForm" method="post" action="/verify-email?lang=${lang}"><input type="hidden" name="email" value="${esc(email)}"><label>Tasdiqlash kodi<input name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required></label><button class="accountButton gold">Tasdiqlash</button></form></section>`);
}
function accountDashboard(lang,user,db){
  const cases=db.cases.filter(x=>x.userId===user.id), docs=db.documents.filter(x=>x.userId===user.id), chats=db.conversations.filter(x=>x.userId===user.id), done=cases.filter(x=>x.status==="completed").length;
  const recent=[...cases].sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))).slice(0,6);
  return accountAppPage(lang,user,"dashboard","Shaxsiy kabinet",`<section class="accountHero"><h1>Xush kelibsiz, ${esc(user.firstName)}!</h1><p>Huquqiy ishlaringiz, hujjatlaringiz va AI maslahatlaringiz shu yerda boshqariladi.</p></section><section class="accountStats"><div class="accountStat"><strong>${cases.filter(x=>x.status!=="completed").length}</strong><span>Faol ishlar</span></div><div class="accountStat"><strong>${docs.length}</strong><span>Hujjatlar</span></div><div class="accountStat"><strong>${chats.length}</strong><span>AI suhbatlar</span></div><div class="accountStat"><strong>${done}</strong><span>Yakunlangan</span></div></section><section class="accountPanel"><div class="accountTop"><div><h2>Oxirgi huquqiy ishlar</h2><div class="accountMuted">Davom ettirish uchun ishni tanlang.</div></div><a class="accountButton gold" href="/account/cases/new?lang=${lang}">＋ Yangi ish</a></div>${recent.length?`<div class="accountTableWrap"><table class="accountTable"><thead><tr><th>Case ID</th><th>Yo‘nalish</th><th>Masala</th><th>Status</th><th>Progress</th><th></th></tr></thead><tbody>${recent.map(c=>`<tr><td><b>${esc(c.caseNo)}</b></td><td>${esc(c.area)}</td><td>${esc(c.title)}</td><td><span class="accountBadge">${esc(c.status)}</span></td><td><div class="accountProgress"><i style="width:${Number(c.progress||0)}%"></i></div> ${Number(c.progress||0)}%</td><td><a href="/account/case?id=${encodeURIComponent(c.id)}&lang=${lang}">Ochish</a></td></tr>`).join("")}</tbody></table></div>`:`<p class="accountMuted">Hali huquqiy ish ochilmagan.</p>`}</section>`);
}
function accountCasesPage(lang,user,db){
  const cases=db.cases.filter(x=>x.userId===user.id);
  return accountAppPage(lang,user,"cases","Mening ishlarim",`<section class="accountPanel"><div class="accountTop"><div><h1>Mening huquqiy ishlarim</h1><p class="accountMuted">Har bir masala alohida Case ID bilan saqlanadi.</p></div><a class="accountButton gold" href="/account/cases/new?lang=${lang}">＋ Yangi ish</a></div><div class="accountTableWrap"><table class="accountTable"><thead><tr><th>Case ID</th><th>Yo‘nalish</th><th>Nomi</th><th>Status</th><th>Progress</th><th>Sana</th><th></th></tr></thead><tbody>${cases.map(c=>`<tr><td>${esc(c.caseNo)}</td><td>${esc(c.area)}</td><td><b>${esc(c.title)}</b></td><td><span class="accountBadge">${esc(c.status)}</span></td><td>${Number(c.progress||0)}%</td><td>${esc(String(c.createdAt).slice(0,10))}</td><td><a href="/account/case?id=${encodeURIComponent(c.id)}&lang=${lang}">Ochish</a></td></tr>`).join("")||`<tr><td colspan="7">Hali ish yo‘q.</td></tr>`}</tbody></table></div></section>`);
}
function accountNewCasePage(lang,user,msg=""){
  return accountAppPage(lang,user,"new","Yangi huquqiy ish",`<section class="accountPanel"><h1>Yangi ish ochish</h1><p class="accountMuted">Muammoni tanlang. Keyin mavjud Huquqiy AI modullaridan davom etishingiz mumkin.</p>${msg?accountMessage(msg,"error"):""}<form class="accountForm" method="post" action="/account/cases/new?lang=${lang}"><label>Huquq sohasi<select name="area" required><option value="Oila huquqi">Oila huquqi</option><option value="Mehnat huquqi">Mehnat huquqi</option><option value="Biznes huquqi">Biznes huquqi</option><option value="Fuqarolik huquqi">Fuqarolik huquqi</option><option value="Boshqa">Boshqa</option></select></label><label>Masala nomi<input name="title" placeholder="Masalan: Nikohdan ajratish" required maxlength="140"></label><label>Qisqa tavsif<textarea name="description" rows="5" maxlength="1500" placeholder="Vaziyatni qisqacha yozing"></textarea></label><button class="accountButton gold">Ishni yaratish</button></form></section>`);
}
function accountCasePage(lang,user,db,id){
  const c=db.cases.find(x=>x.id===id && (x.userId===user.id || ["owner","admin"].includes(user.role))); if(!c) return accountAppPage(lang,user,"cases","Ish topilmadi",accountMessage("Bu ish topilmadi.","error"));
  const docs=db.documents.filter(x=>x.caseId===c.id), chats=db.conversations.filter(x=>x.caseId===c.id);
  const moduleLink=c.area==="Oila huquqi"?"/family":c.area==="Mehnat huquqi"?"/employment":c.area==="Biznes huquqi"?"/business":"/ai";
  return accountAppPage(lang,user,"cases",c.caseNo,`<section class="accountHero"><div class="accountBadge good">${esc(c.status)}</div><h1>${esc(c.title)}</h1><p>${esc(c.area)} · ${esc(c.caseNo)}</p></section><section class="accountGrid"><div><section class="accountPanel"><h2>Ish tafsilotlari</h2><p>${esc(c.description||"Tavsif kiritilmagan.")}</p><div class="accountProgress"><i style="width:${Number(c.progress||0)}%"></i></div><p class="accountMuted">Progress: ${Number(c.progress||0)}%</p><div class="accountActions"><a class="accountButton gold" href="${moduleLink}?lang=${lang}&case=${encodeURIComponent(c.id)}">Huquqiy modulni ochish</a><a class="accountButton" href="/ai?lang=${lang}&case=${encodeURIComponent(c.id)}">AI maslahat</a><a class="accountButton light" href="/documents?lang=${lang}&case=${encodeURIComponent(c.id)}">Hujjat yaratish</a></div></section><section class="accountPanel"><h2>Case hujjatlari</h2>${docs.map(d=>`<div class="accountCard"><b>${esc(d.title)}</b><div class="accountMuted">${esc(d.type)} · ${esc(String(d.createdAt).slice(0,10))}</div></div>`).join("")||`<p class="accountMuted">Hali hujjat biriktirilmagan.</p>`}</section></div><div><section class="accountPanel"><h2>Statusni yangilash</h2><form class="accountForm" method="post" action="/account/case/update?lang=${lang}"><input type="hidden" name="id" value="${esc(c.id)}"><label>Status<select name="status"><option ${c.status==="started"?"selected":""} value="started">started</option><option ${c.status==="collecting"?"selected":""} value="collecting">collecting</option><option ${c.status==="analysis"?"selected":""} value="analysis">analysis</option><option ${c.status==="document_ready"?"selected":""} value="document_ready">document_ready</option><option ${c.status==="completed"?"selected":""} value="completed">completed</option></select></label><label>Progress %<input name="progress" type="number" min="0" max="100" value="${Number(c.progress||0)}"></label><button class="accountButton">Saqlash</button></form></section><section class="accountPanel"><h2>AI faoliyati</h2><strong>${chats.length}</strong><div class="accountMuted">shu ishga bog‘langan suhbat</div></section></div></section>`);
}
function accountSimpleListPage(lang,user,active,title,items,render,empty){ return accountAppPage(lang,user,active,title,`<section class="accountPanel"><h1>${esc(title)}</h1><p class="accountMuted">Shaxsiy profilingizga bog‘langan ma’lumotlar.</p>${items.length?items.map(render).join(""):`<p class="accountMuted">${esc(empty)}</p>`}</section>`); }
function accountProfilePage(lang,user,msg=""){
  return accountAppPage(lang,user,"profile","Profil",`<section class="accountPanel"><h1>Profil ma’lumotlari</h1>${msg?accountMessage(msg,"success"):""}<form class="accountForm" method="post" action="/account/profile?lang=${lang}"><label>Ism<input name="firstName" value="${esc(user.firstName)}" required></label><label>Familiya<input name="lastName" value="${esc(user.lastName)}" required></label><label>Email<input value="${esc(user.email)}" disabled></label><label>Rol<input value="${esc(user.role)}" disabled></label><label>Email holati<input value="${user.emailVerified?"Tasdiqlangan":"Tasdiqlanmagan"}" disabled></label><button class="accountButton gold">Profilni saqlash</button></form></section>`);
}
function accountSecurityPage(lang,user,msg=""){
  return accountAppPage(lang,user,"security","Xavfsizlik",`<section class="accountPanel"><h1>Parol va sessiyalar</h1>${msg?accountMessage(msg,msg.includes("xato")?"error":"success"):""}<form class="accountForm" method="post" action="/account/security?lang=${lang}"><label>Joriy parol<input name="currentPassword" type="password" required></label><label>Yangi parol<input name="newPassword" type="password" minlength="8" required></label><label>Yangi parolni takrorlang<input name="newPassword2" type="password" minlength="8" required></label><button class="accountButton">Parolni almashtirish</button></form></section>`);
}
function accountSettingsPage(lang,user){ return accountAppPage(lang,user,"settings","Sozlamalar",`<section class="accountPanel"><h1>Sozlamalar</h1><div class="accountCards"><div class="accountCard"><h3>Til</h3><p class="accountMuted">Interfeys tili URL orqali UZ/RU/EN ishlaydi.</p></div><div class="accountCard"><h3>Maxfiylik</h3><p class="accountMuted">Rozilik va account faoliyati audit jurnalida qayd etiladi.</p></div><div class="accountCard"><h3>Account ID</h3><span class="accountCode">${esc(user.id)}</span></div></div></section>`); }

function adminDashboardPage(lang,user,db){
  const active=db.users.filter(x=>x.status==="active").length;
  return accountAppPage(lang,user,"admin","Owner / Admin panel",`<section class="accountHero"><h1>Huquqiy AI boshqaruv markazi</h1><p>Foydalanuvchilar, huquqiy ishlar, hujjatlar va audit faoliyatini boshqaring.</p></section><section class="accountStats"><div class="accountStat"><strong>${db.users.length}</strong><span>Foydalanuvchilar</span></div><div class="accountStat"><strong>${active}</strong><span>Faol account</span></div><div class="accountStat"><strong>${db.cases.length}</strong><span>Huquqiy ishlar</span></div><div class="accountStat"><strong>${db.documents.length}</strong><span>Hujjatlar</span></div></section><section class="accountCards"><a class="accountCard" href="/admin/users?lang=${lang}"><h3>Foydalanuvchilar</h3><p class="accountMuted">Accountlar va statuslarni boshqarish.</p></a><a class="accountCard" href="/admin/cases?lang=${lang}"><h3>Cases</h3><p class="accountMuted">Platformadagi huquqiy ishlar metadata-si.</p></a><a class="accountCard" href="/admin/audit?lang=${lang}"><h3>Audit log</h3><p class="accountMuted">Muhim boshqaruv va account hodisalari.</p></a></section>`);
}
function adminUsersPage(lang,user,db){
  return accountAppPage(lang,user,"admin","Foydalanuvchilar",`<section class="accountPanel"><div class="accountTop"><div><h1>Foydalanuvchilar</h1><p class="accountMuted">Admin uchun zarur account metadata. Maxfiy AI matnlari bu jadvalda ko‘rsatilmaydi.</p></div><a class="accountButton light" href="/admin?lang=${lang}">← Admin</a></div><div class="accountTableWrap"><table class="accountTable"><thead><tr><th>Ism</th><th>Email</th><th>Rol</th><th>Verified</th><th>Status</th><th>Cases</th><th>Ro‘yxat</th><th>Amal</th></tr></thead><tbody>${db.users.map(u=>`<tr><td><b>${esc(u.firstName)} ${esc(u.lastName)}</b></td><td>${esc(u.email)}</td><td>${esc(u.role)}</td><td>${u.emailVerified?"Ha":"Yo‘q"}</td><td><span class="accountBadge ${u.status==="blocked"?"bad":"good"}">${esc(u.status)}</span></td><td>${db.cases.filter(c=>c.userId===u.id).length}</td><td>${esc(String(u.createdAt).slice(0,10))}</td><td>${u.id===user.id?"Owner":`<form method="post" action="/admin/user-status?lang=${lang}" style="display:flex;gap:6px"><input type="hidden" name="id" value="${esc(u.id)}"><select name="status"><option value="active">active</option><option value="suspended">suspended</option><option value="blocked">blocked</option></select><button class="accountButton small">Saqlash</button></form>`}</td></tr>`).join("")}</tbody></table></div></section>`);
}
function adminCasesPage(lang,user,db){
  return accountAppPage(lang,user,"admin","Barcha huquqiy ishlar",`<section class="accountPanel"><h1>Cases</h1><p class="accountMuted">Boshqaruv metadata-si. Foydalanuvchining maxfiy AI yozishmasi avtomatik ochilmaydi.</p><div class="accountTableWrap"><table class="accountTable"><thead><tr><th>Case ID</th><th>Foydalanuvchi</th><th>Yo‘nalish</th><th>Nomi</th><th>Status</th><th>Progress</th></tr></thead><tbody>${db.cases.map(c=>{const u=db.users.find(x=>x.id===c.userId);return `<tr><td>${esc(c.caseNo)}</td><td>${esc(u?u.email:"-")}</td><td>${esc(c.area)}</td><td>${esc(c.title)}</td><td>${esc(c.status)}</td><td>${Number(c.progress||0)}%</td></tr>`}).join("")||`<tr><td colspan="6">Case yo‘q.</td></tr>`}</tbody></table></div></section>`);
}
function adminAuditPage(lang,user,db){
  return accountAppPage(lang,user,"admin","Audit log",`<section class="accountPanel"><h1>Audit log</h1><div class="accountTableWrap"><table class="accountTable"><thead><tr><th>Vaqt</th><th>User</th><th>Hodisa</th><th>Metadata</th></tr></thead><tbody>${db.auditLogs.slice(0,300).map(l=>`<tr><td>${esc(l.createdAt)}</td><td>${esc(l.userId||"system")}</td><td>${esc(l.action)}</td><td>${esc(JSON.stringify(l.meta||{}).slice(0,180))}</td></tr>`).join("")}</tbody></table></div></section>`);
}

async function accountHandleRoutes(req,res,url,pathname,lang){
  if(req.method==="GET" && pathname==="/login"){ sendHtml(res,accountLoginPage(lang)); return true; }
  if(req.method==="POST" && pathname==="/login"){
    const f=await readForm(req), email=accountEmail(f.email), db=accountLoadDb(), user=db.users.find(u=>u.email===email);
    if(!user || !accountVerifyPassword(f.password,user.passwordHash) || user.status!=="active"){ sendHtml(res,accountLoginPage(lang,"Email yoki parol noto‘g‘ri, yoki account faol emas."),401); return true; }
    if(!user.emailVerified){ accountRedirect(res,`/verify-email?lang=${lang}&email=${encodeURIComponent(email)}`); return true; }
    user.lastLoginAt=accountNow(); accountAudit(db,user.id,"login",{}); accountSaveDb(db); accountSetSession(res,user.id); accountRedirect(res,`/account?lang=${lang}`); return true;
  }
  if(req.method==="GET" && pathname==="/register"){ sendHtml(res,accountRegisterPage(lang)); return true; }
  if(req.method==="POST" && pathname==="/register"){
    const f=await readForm(req), email=accountEmail(f.email); const db=accountLoadDb();
    if(!f.firstName||!f.lastName||!email.includes("@")||String(f.password||"").length<8||f.password!==f.password2||f.terms!=="yes"){ sendHtml(res,accountRegisterPage(lang,"Ma’lumotlarni tekshiring. Parol kamida 8 belgi va ikki parol bir xil bo‘lishi kerak."),400); return true; }
    if(db.users.some(u=>u.email===email)){ sendHtml(res,accountRegisterPage(lang,"Bu email bilan account mavjud."),409); return true; }
    const code=String(Math.floor(100000+Math.random()*900000)); const role=OWNER_EMAIL && email===OWNER_EMAIL?"owner":"user";
    const user={id:accountId("USR"),firstName:String(f.firstName).trim(),lastName:String(f.lastName).trim(),email,passwordHash:accountHashPassword(f.password),role,status:"active",emailVerified:false,verificationCodeHash:accountHashPassword(code),verificationExpiresAt:new Date(Date.now()+VERIFY_TTL_MS).toISOString(),createdAt:accountNow(),updatedAt:accountNow()};
    db.users.push(user); db.consents.push({id:accountId("CNS"),userId:user.id,type:"terms_privacy",version:"2026-09-25-v1",acceptedAt:accountNow()}); accountAudit(db,user.id,"register",{email}); accountSaveDb(db);
    await accountSendEmail(email,"Huquqiy AI — emailni tasdiqlash",`Tasdiqlash kodingiz: ${code}. Kod 15 daqiqa amal qiladi.`);
    accountRedirect(res,`/verify-email?lang=${lang}&email=${encodeURIComponent(email)}`); return true;
  }
  if(req.method==="GET" && pathname==="/verify-email"){ sendHtml(res,accountVerifyPage(lang,accountEmail(url.searchParams.get("email")))); return true; }
  if(req.method==="POST" && pathname==="/verify-email"){
    const f=await readForm(req), email=accountEmail(f.email), db=accountLoadDb(), user=db.users.find(u=>u.email===email);
    if(!user||!user.verificationCodeHash||new Date(user.verificationExpiresAt)<new Date()||!accountVerifyPassword(f.code,user.verificationCodeHash)){ sendHtml(res,accountVerifyPage(lang,email,"Kod noto‘g‘ri yoki muddati tugagan."),400); return true; }
    user.emailVerified=true; delete user.verificationCodeHash; delete user.verificationExpiresAt; user.updatedAt=accountNow(); accountAudit(db,user.id,"email_verified",{}); accountSaveDb(db); accountSetSession(res,user.id); accountRedirect(res,`/account?lang=${lang}`); return true;
  }
  if(req.method==="GET" && pathname==="/forgot-password"){
    sendHtml(res,accountPublicPage(lang,"Parolni tiklash",`<section class="accountAuth"><h1>Parolni tiklash</h1><p class="accountMuted">Emailingizni kiriting.</p><form class="accountForm" method="post" action="/forgot-password?lang=${lang}"><label>Email<input name="email" type="email" required></label><button class="accountButton">Tiklash kodini yuborish</button></form></section>`)); return true;
  }
  if(req.method==="POST" && pathname==="/forgot-password"){
    const f=await readForm(req), email=accountEmail(f.email), db=accountLoadDb(), user=db.users.find(u=>u.email===email); if(user){const code=String(Math.floor(100000+Math.random()*900000));user.resetCodeHash=accountHashPassword(code);user.resetExpiresAt=new Date(Date.now()+RESET_TTL_MS).toISOString();accountAudit(db,user.id,"password_reset_requested",{});accountSaveDb(db);await accountSendEmail(email,"Huquqiy AI — parolni tiklash",`Parolni tiklash kodingiz: ${code}`);} accountRedirect(res,`/reset-password?lang=${lang}&email=${encodeURIComponent(email)}`); return true;
  }
  if(req.method==="GET" && pathname==="/reset-password"){
    const email=accountEmail(url.searchParams.get("email")); sendHtml(res,accountPublicPage(lang,"Yangi parol",`<section class="accountAuth"><h1>Yangi parol</h1><form class="accountForm" method="post" action="/reset-password?lang=${lang}"><input type="hidden" name="email" value="${esc(email)}"><label>Kod<input name="code" required maxlength="6"></label><label>Yangi parol<input name="password" type="password" minlength="8" required></label><label>Takrorlang<input name="password2" type="password" minlength="8" required></label><button class="accountButton">Parolni yangilash</button></form></section>`)); return true;
  }
  if(req.method==="POST" && pathname==="/reset-password"){
    const f=await readForm(req), email=accountEmail(f.email), db=accountLoadDb(), user=db.users.find(u=>u.email===email);
    if(!user||!user.resetCodeHash||new Date(user.resetExpiresAt)<new Date()||!accountVerifyPassword(f.code,user.resetCodeHash)||String(f.password||"").length<8||f.password!==f.password2){ sendHtml(res,accountPublicPage(lang,"Xato",`<section class="accountAuth">${accountMessage("Kod yoki yangi parol ma’lumotlari noto‘g‘ri.","error")}<a href="/forgot-password?lang=${lang}">Qayta urinish</a></section>`),400); return true; }
    user.passwordHash=accountHashPassword(f.password); delete user.resetCodeHash; delete user.resetExpiresAt; db.sessions=db.sessions.filter(s=>s.userId!==user.id); accountAudit(db,user.id,"password_reset_completed",{}); accountSaveDb(db); accountRedirect(res,`/login?lang=${lang}`); return true;
  }
  if(req.method==="GET" && pathname==="/logout"){ accountClearSession(req,res); accountRedirect(res,`/login?lang=${lang}`); return true; }

  if(pathname.startsWith("/account")){
    const auth=accountRequire(req,res,lang); if(!auth) return true; const {user}=auth;
    if(req.method==="GET" && pathname==="/account"){ sendHtml(res,accountDashboard(lang,user,accountLoadDb())); return true; }
    if(req.method==="GET" && pathname==="/account/cases"){ sendHtml(res,accountCasesPage(lang,user,accountLoadDb())); return true; }
    if(req.method==="GET" && pathname==="/account/cases/new"){ sendHtml(res,accountNewCasePage(lang,user)); return true; }
    if(req.method==="POST" && pathname==="/account/cases/new"){
      const f=await readForm(req), db=accountLoadDb(); if(!f.area||!f.title){sendHtml(res,accountNewCasePage(lang,user,"Yo‘nalish va masala nomini kiriting."),400);return true;}
      const c={id:accountId("CAS"),caseNo:accountCaseNo(db),userId:user.id,area:String(f.area),title:String(f.title).trim(),description:String(f.description||"").trim(),status:"started",progress:10,createdAt:accountNow(),updatedAt:accountNow()}; db.cases.push(c); accountAudit(db,user.id,"case_created",{caseId:c.id,caseNo:c.caseNo}); accountSaveDb(db); accountRedirect(res,`/account/case?lang=${lang}&id=${encodeURIComponent(c.id)}`); return true;
    }
    if(req.method==="GET" && pathname==="/account/case"){ sendHtml(res,accountCasePage(lang,user,accountLoadDb(),url.searchParams.get("id"))); return true; }
    if(req.method==="POST" && pathname==="/account/case/update"){
      const f=await readForm(req),db=accountLoadDb(),c=db.cases.find(x=>x.id===f.id&&x.userId===user.id); if(c){c.status=String(f.status||c.status);c.progress=Math.max(0,Math.min(100,Number(f.progress||0)));c.updatedAt=accountNow();accountAudit(db,user.id,"case_updated",{caseId:c.id,status:c.status,progress:c.progress});accountSaveDb(db);} accountRedirect(res,`/account/case?lang=${lang}&id=${encodeURIComponent(f.id||"")}`); return true;
    }
    if(req.method==="GET" && pathname==="/account/documents"){const db=accountLoadDb(),items=db.documents.filter(x=>x.userId===user.id);sendHtml(res,accountSimpleListPage(lang,user,"documents","Hujjatlarim",items,d=>`<div class="accountCard"><h3>${esc(d.title)}</h3><p class="accountMuted">${esc(d.type)} · ${esc(String(d.createdAt).slice(0,10))}</p></div>`,"Hali saqlangan hujjat yo‘q."));return true;}
    if(req.method==="GET" && pathname==="/account/chats"){const db=accountLoadDb(),items=db.conversations.filter(x=>x.userId===user.id);sendHtml(res,accountSimpleListPage(lang,user,"chats","AI suhbatlarim",items,c=>`<div class="accountCard"><h3>${esc(c.title||"AI suhbat")}</h3><p class="accountMuted">${esc(String(c.updatedAt||c.createdAt).slice(0,10))}</p></div>`,"Hali saqlangan AI suhbat yo‘q."));return true;}
    if(req.method==="GET" && pathname==="/account/notifications"){const db=accountLoadDb(),items=db.notifications.filter(x=>x.userId===user.id);sendHtml(res,accountSimpleListPage(lang,user,"notifications","Bildirishnomalar",items,n=>`<div class="accountCard"><b>${esc(n.title)}</b><p>${esc(n.text||"")}</p></div>`,"Yangi bildirishnoma yo‘q."));return true;}
    if(req.method==="GET" && pathname==="/account/profile"){sendHtml(res,accountProfilePage(lang,user));return true;}
    if(req.method==="POST" && pathname==="/account/profile"){const f=await readForm(req),db=accountLoadDb(),u=db.users.find(x=>x.id===user.id);u.firstName=String(f.firstName||u.firstName).trim();u.lastName=String(f.lastName||u.lastName).trim();u.updatedAt=accountNow();accountAudit(db,u.id,"profile_updated",{});accountSaveDb(db);sendHtml(res,accountProfilePage(lang,u,"Profil saqlandi."));return true;}
    if(req.method==="GET" && pathname==="/account/security"){sendHtml(res,accountSecurityPage(lang,user));return true;}
    if(req.method==="POST" && pathname==="/account/security"){const f=await readForm(req),db=accountLoadDb(),u=db.users.find(x=>x.id===user.id);let msg="Parol yangilandi.";if(!accountVerifyPassword(f.currentPassword,u.passwordHash)||String(f.newPassword||"").length<8||f.newPassword!==f.newPassword2){msg="Joriy parol yoki yangi parol ma’lumotlarida xato.";}else{u.passwordHash=accountHashPassword(f.newPassword);db.sessions=db.sessions.filter(s=>s.userId===u.id);accountAudit(db,u.id,"password_changed",{});accountSaveDb(db);accountSetSession(res,u.id);}sendHtml(res,accountSecurityPage(lang,u,msg));return true;}
    if(req.method==="GET" && pathname==="/account/settings"){sendHtml(res,accountSettingsPage(lang,user));return true;}
  }

  if(pathname.startsWith("/admin")){
    const auth=accountRequire(req,res,lang,["owner","admin"]); if(!auth) return true; const user=auth.user;
    if(req.method==="GET" && pathname==="/admin"){sendHtml(res,adminDashboardPage(lang,user,accountLoadDb()));return true;}
    if(req.method==="GET" && pathname==="/admin/users"){sendHtml(res,adminUsersPage(lang,user,accountLoadDb()));return true;}
    if(req.method==="GET" && pathname==="/admin/cases"){sendHtml(res,adminCasesPage(lang,user,accountLoadDb()));return true;}
    if(req.method==="GET" && pathname==="/admin/audit"){sendHtml(res,adminAuditPage(lang,user,accountLoadDb()));return true;}
    if(req.method==="POST" && pathname==="/admin/user-status"){const f=await readForm(req),db=accountLoadDb(),target=db.users.find(x=>x.id===f.id);if(target&&target.id!==user.id&&["active","suspended","blocked"].includes(f.status)){target.status=f.status;accountAudit(db,user.id,"admin_user_status_changed",{targetUserId:target.id,status:f.status});accountSaveDb(db);}accountRedirect(res,`/admin/users?lang=${lang}`);return true;}
  }
  return false;
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
        // ACCOUNT / PERSONAL CABINET / ADMIN ROUTES
        // ------------------------------------------------

        if(await accountHandleRoutes(req,res,url,pathname,lang)){
          return;
        }


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
        // FAMILY LAW
        // ------------------------------------------------

        if(
          req.method === "GET" &&
          pathname === "/family"
        ){

          return sendHtml(
            res,
            familyPage(lang)
          );

        }


        // ------------------------------------------------
        // BUSINESS LAW
        // ------------------------------------------------

        if(
          req.method === "GET" &&
          pathname === "/business"
        ){
          return sendHtml(
            res,
            businessPage(lang)
          );
        }

        if(
          req.method === "POST" &&
          pathname === "/business-result"
        ){
          const body = await readForm(req);
          return sendHtml(
            res,
            await businessResultPage(lang, body)
          );
        }


        // ------------------------------------------------
        // EMPLOYMENT LAW
        // ------------------------------------------------

        if(
          req.method === "GET" &&
          pathname === "/employment"
        ){

          return sendHtml(
            res,
            employmentPage(lang)
          );

        }


        if(
          req.method === "POST" &&
          pathname === "/employment-result"
        ){

          const form =
            await readForm(req);

          const html =
            await employmentResultPage(
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

/* BUSINESS MODULE EXPANSION ROADMAP
  1. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  2. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  3. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  4. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  5. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  6. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  7. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  8. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  9. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  10. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  11. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  12. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  13. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  14. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  15. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  16. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  17. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  18. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  19. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  20. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  21. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  22. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  23. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  24. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  25. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  26. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  27. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  28. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  29. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  30. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  31. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  32. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  33. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  34. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  35. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  36. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  37. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  38. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  39. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  40. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  41. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  42. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  43. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  44. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  45. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  46. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  47. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  48. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  49. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  50. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  51. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  52. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  53. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  54. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  55. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  56. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  57. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  58. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  59. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  60. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  61. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  62. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  63. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  64. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  65. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  66. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  67. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  68. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  69. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  70. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  71. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  72. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  73. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  74. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  75. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  76. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  77. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  78. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  79. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  80. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  81. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  82. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  83. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  84. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  85. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  86. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  87. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  88. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  89. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  90. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  91. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  92. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  93. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  94. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  95. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  96. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  97. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  98. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  99. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  100. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  101. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  102. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  103. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  104. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  105. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  106. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  107. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  108. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  109. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  110. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  111. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  112. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  113. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  114. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  115. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  116. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  117. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  118. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  119. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  120. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  121. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  122. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  123. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  124. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  125. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  126. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  127. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  128. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  129. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  130. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  131. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  132. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  133. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  134. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  135. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  136. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  137. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  138. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  139. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  140. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  141. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  142. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  143. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  144. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  145. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  146. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  147. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  148. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  149. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  150. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  151. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  152. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  153. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  154. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  155. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  156. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  157. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  158. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  159. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  160. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  161. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  162. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  163. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  164. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  165. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  166. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  167. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  168. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  169. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  170. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  171. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  172. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  173. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  174. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  175. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  176. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  177. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  178. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  179. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  180. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  181. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  182. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  183. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  184. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  185. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  186. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  187. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  188. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  189. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  190. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  191. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  192. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  193. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  194. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  195. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  196. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  197. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  198. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  199. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  200. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  201. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  202. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  203. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  204. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  205. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  206. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  207. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  208. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  209. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  210. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  211. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  212. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  213. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  214. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  215. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  216. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  217. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  218. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  219. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  220. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  221. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  222. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  223. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  224. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  225. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  226. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  227. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  228. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  229. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  230. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  231. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  232. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  233. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  234. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  235. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  236. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  237. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  238. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  239. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  240. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  241. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  242. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  243. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  244. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  245. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  246. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  247. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  248. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  249. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  250. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  251. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  252. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  253. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  254. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  255. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  256. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  257. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  258. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  259. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  260. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  261. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  262. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  263. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  264. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  265. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  266. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  267. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  268. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  269. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  270. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  271. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  272. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  273. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  274. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  275. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  276. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  277. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  278. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  279. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  280. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  281. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  282. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  283. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  284. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  285. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  286. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  287. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  288. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  289. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  290. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  291. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  292. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  293. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  294. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  295. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  296. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  297. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  298. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  299. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  300. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  301. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  302. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  303. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  304. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  305. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  306. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  307. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  308. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  309. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  310. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  311. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  312. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  313. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  314. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  315. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  316. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  317. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  318. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  319. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  320. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  321. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  322. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  323. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  324. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  325. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  326. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  327. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  328. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  329. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  330. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  331. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  332. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  333. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  334. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  335. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  336. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  337. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  338. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  339. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  340. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  341. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  342. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  343. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  344. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  345. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  346. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  347. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  348. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  349. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  350. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  351. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  352. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  353. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  354. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  355. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  356. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  357. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  358. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  359. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  360. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  361. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  362. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  363. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  364. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  365. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  366. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  367. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  368. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  369. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  370. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  371. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  372. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  373. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  374. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  375. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  376. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  377. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  378. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  379. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  380. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  381. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  382. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  383. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  384. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  385. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  386. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  387. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  388. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  389. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  390. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  391. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  392. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  393. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  394. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  395. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  396. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  397. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  398. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  399. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  400. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  401. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  402. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  403. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  404. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  405. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  406. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  407. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  408. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  409. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  410. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  411. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  412. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  413. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  414. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  415. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  416. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  417. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  418. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  419. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  420. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  421. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  422. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  423. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  424. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  425. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  426. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  427. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  428. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  429. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  430. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  431. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  432. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  433. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  434. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  435. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  436. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  437. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  438. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  439. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  440. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  441. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  442. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  443. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  444. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  445. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  446. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  447. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  448. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  449. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  450. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  451. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  452. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  453. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  454. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  455. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  456. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  457. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  458. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  459. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  460. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  461. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  462. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  463. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  464. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  465. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  466. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  467. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  468. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  469. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  470. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  471. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  472. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  473. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  474. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  475. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  476. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  477. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  478. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  479. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  480. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  481. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  482. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  483. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  484. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  485. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  486. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  487. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  488. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  489. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  490. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  491. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  492. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  493. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  494. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  495. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  496. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  497. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  498. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  499. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  500. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  501. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  502. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  503. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  504. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  505. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  506. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  507. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  508. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  509. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  510. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  511. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  512. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  513. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  514. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  515. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  516. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  517. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  518. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  519. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  520. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  521. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  522. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  523. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  524. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  525. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  526. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  527. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  528. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  529. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  530. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  531. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  532. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  533. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  534. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  535. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  536. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  537. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  538. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  539. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  540. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  541. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  542. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  543. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  544. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  545. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  546. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  547. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  548. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  549. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  550. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  551. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  552. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  553. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  554. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  555. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  556. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  557. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  558. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  559. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  560. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  561. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  562. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  563. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  564. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  565. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  566. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  567. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  568. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  569. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  570. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  571. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  572. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  573. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  574. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  575. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  576. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  577. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  578. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  579. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  580. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  581. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  582. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  583. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  584. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  585. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  586. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  587. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  588. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  589. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  590. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  591. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  592. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  593. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  594. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  595. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  596. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  597. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  598. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  599. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  600. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  601. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  602. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  603. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  604. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  605. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  606. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  607. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  608. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  609. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  610. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  611. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  612. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  613. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  614. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  615. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  616. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  617. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  618. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  619. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  620. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  621. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  622. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  623. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  624. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  625. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  626. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  627. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  628. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  629. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  630. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  631. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  632. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  633. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  634. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  635. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  636. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  637. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  638. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  639. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  640. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  641. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  642. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  643. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  644. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  645. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  646. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  647. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  648. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  649. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  650. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  651. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  652. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  653. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  654. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  655. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  656. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  657. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  658. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  659. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  660. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  661. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  662. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  663. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  664. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  665. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  666. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  667. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  668. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  669. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  670. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  671. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  672. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  673. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  674. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  675. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  676. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  677. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  678. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  679. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  680. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  681. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  682. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  683. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  684. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  685. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  686. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  687. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  688. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  689. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  690. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  691. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  692. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  693. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  694. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  695. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  696. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  697. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  698. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  699. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  700. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  701. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  702. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  703. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  704. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  705. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  706. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  707. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  708. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  709. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  710. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  711. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  712. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  713. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  714. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  715. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  716. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  717. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  718. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  719. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  720. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  721. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  722. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  723. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  724. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  725. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  726. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  727. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  728. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  729. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  730. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  731. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  732. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  733. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  734. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  735. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  736. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  737. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  738. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  739. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  740. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  741. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  742. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  743. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  744. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  745. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  746. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  747. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  748. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  749. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  750. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  751. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  752. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  753. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  754. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  755. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  756. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  757. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  758. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  759. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  760. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  761. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  762. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  763. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  764. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  765. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  766. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  767. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  768. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  769. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  770. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  771. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  772. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  773. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  774. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  775. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  776. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  777. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  778. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  779. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  780. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  781. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  782. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  783. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  784. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  785. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  786. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  787. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  788. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  789. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  790. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  791. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  792. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  793. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  794. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  795. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  796. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  797. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  798. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  799. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  800. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  801. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  802. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  803. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  804. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  805. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  806. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  807. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  808. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  809. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  810. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  811. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  812. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  813. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  814. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  815. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  816. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  817. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  818. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  819. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  820. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  821. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  822. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  823. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  824. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  825. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  826. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  827. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  828. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  829. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  830. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  831. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  832. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  833. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  834. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  835. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  836. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  837. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  838. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  839. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  840. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  841. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  842. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  843. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  844. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  845. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  846. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  847. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  848. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  849. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  850. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  851. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  852. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  853. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  854. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  855. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  856. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  857. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  858. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  859. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  860. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  861. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  862. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  863. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  864. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  865. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  866. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  867. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  868. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  869. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  870. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  871. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  872. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  873. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  874. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  875. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  876. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  877. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  878. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  879. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  880. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  881. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  882. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  883. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  884. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  885. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  886. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  887. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  888. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  889. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  890. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  891. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  892. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  893. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  894. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  895. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  896. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  897. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  898. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  899. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  900. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  901. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  902. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  903. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  904. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  905. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  906. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  907. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  908. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  909. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  910. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  911. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  912. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  913. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  914. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  915. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  916. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  917. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  918. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  919. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  920. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  921. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  922. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  923. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  924. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  925. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  926. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  927. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  928. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  929. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  930. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  931. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  932. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
*/

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
        "Da’vo arizasi tayyorlash",

      description:
        "Huquq sohasini va da’vo turini tanlang, ma’lumotlarni kiriting va platformaning o‘zida da’vo arizasi loyihasini tayyorlang.",

      info:
        "Tayyorlangan hujjat loyiha hisoblanadi. Sudga yoki boshqa organga topshirishdan oldin faktlar, talablar, rekvizitlar va amaldagi qonunchilikni tekshirish kerak.",

      create:
        "Da’vo arizasini tayyorlash"
    },


    ru: {
      title:
        "Подготовка искового заявления",

      description:
        "Выберите отрасль права и вид иска, введите сведения и подготовьте проект искового заявления прямо на платформе.",

      info:
        "Созданный документ является проектом. Перед подачей необходимо проверить факты, требования, реквизиты и действующее законодательство.",

      create:
        "Подготовить иск"
    },


    en: {
      title:
        "Claim preparation",

      description:
        "Choose the legal area and claim type, enter the facts, and prepare a claim draft directly on the platform.",

      info:
        "The generated document is a draft. Verify facts, claims, details and current law before filing.",

      create:
        "Prepare claim"
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


      <div class="surface surfacePad" style="margin-bottom:18px;">
        <div class="resultLabel">
          ${lang === "uz" ? "DA’VO ARIZASI MARKAZI" : lang === "ru" ? "ЦЕНТР ИСКОВЫХ ЗАЯВЛЕНИЙ" : "CLAIM CENTER"}
        </div>
        <h2 style="margin:8px 0 8px;color:var(--navy);font-size:26px;">
          ${lang === "uz" ? "Da’vo turini tanlang" : lang === "ru" ? "Выберите вид иска" : "Choose a claim type"}
        </h2>
        <p class="cardDescription">
          ${lang === "uz"
            ? "Oila yoki mehnat huquqi bo‘yicha kerakli da’voni tanlang. Keyingi sahifada sud, taraflar, faktlar, talablar va dalillar kiritiladi."
            : lang === "ru"
            ? "Выберите нужный иск по семейному или трудовому праву. На следующем шаге указываются суд, стороны, факты, требования и доказательства."
            : "Choose the required family-law or employment-law claim. On the next step, enter the court, parties, facts, requests and evidence."}
        </p>
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


      <div class="notice noticeGold" style="margin-top:18px;">
        <span class="noticeIcon">⚖</span>
        <span>
          ${lang === "uz"
            ? "Arizani tekshirgach, rasmiy elektron sud xizmatiga o‘tib topshirishingiz mumkin. Platforma hozircha sud tizimiga arizani avtomatik yubormaydi."
            : lang === "ru"
            ? "После проверки заявления вы можете перейти в официальный электронный судебный сервис для подачи. Платформа пока не отправляет заявление в судебную систему автоматически."
            : "After reviewing the claim, you can continue to the official electronic court service for filing. The platform does not yet submit it automatically to the court system."}
        </span>
      </div>

      <div class="formActions">

        <a class="btn btnGold" href="https://cabinet.sud.uz/" target="_blank" rel="noopener noreferrer">
          ⚖ ${lang === "uz" ? "Da’vo arizasini sudga topshirish" : lang === "ru" ? "Подать иск в суд" : "Submit claim to court"}
        </a>

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
// MEHNAT HUQUQI — VAZIYAT TAHLILI VA DA’VO
// ======================================================


function familyPage(lang) {
  lang = getLang(lang);

  const L = {
    uz: {
      title: "Oila huquqi",
      desc: "Oila huquqi bo‘yicha amaliy xizmatlar, da’vo arizalari, hisob-kitoblar va talabalar uchun rasmiy o‘quv manbalari.",
      practice: "Amaliy xizmatlar",
      study: "Talabalar uchun o‘quv va qonunchilik manbalari",
      note: "Tashqi manbalar yangi oynada ochiladi. Qonunchilik uchun birinchi navbatda rasmiy LexUZ va Hukumat portalidan foydalaning."
    },
    ru: {
      title: "Семейное право",
      desc: "Практические сервисы, иски, расчёты и официальные учебно-правовые источники по семейному праву.",
      practice: "Практические сервисы",
      study: "Учебные и законодательные источники",
      note: "Внешние источники открываются в новой вкладке. Для актуального законодательства используйте прежде всего LexUZ и Правительственный портал."
    },
    en: {
      title: "Family law",
      desc: "Practical services, claim preparation, calculations and official study resources for family law.",
      practice: "Practical services",
      study: "Study and legislation resources",
      note: "External resources open in a new tab. Use official LexUZ and Government sources for current legislation."
    }
  }[lang];

  return appLayout(
    lang,
    "family",
    `
      <div class="notice noticeGold">
        <span class="noticeIcon">§</span><span>${esc(L.note)}</span>
      </div>

      <div class="surface surfacePad">
        <div class="resultLabel">${esc(L.practice)}</div>
        <div class="serviceGrid" style="margin-top:16px;">
          <a class="serviceCard" href="/ai${q(lang)}&area=family">
            <div class="serviceIcon">AI</div>
            <h3>${lang === "uz" ? "Oila huquqi bo‘yicha AI yurist" : lang === "ru" ? "AI-юрист по семейному праву" : "Family-law AI lawyer"}</h3>
            <p>${lang === "uz" ? "Vaziyatni savol-javob orqali tahlil qiling." : lang === "ru" ? "Разберите ситуацию через пошаговые вопросы." : "Analyze a situation through guided questions."}</p>
          </a>
          <a class="serviceCard" href="/documents${q(lang)}">
            <div class="serviceIcon">▤</div>
            <h3>${lang === "uz" ? "Oila bo‘yicha da’vo arizasi" : lang === "ru" ? "Иск по семейному спору" : "Family-law claim"}</h3>
            <p>${lang === "uz" ? "Nikohdan ajratish, aliment va mol-mulk bo‘yicha da’vo loyihasi." : lang === "ru" ? "Проект иска о разводе, алиментах или разделе имущества." : "Prepare divorce, alimony or property claims."}</p>
          </a>
          <a class="serviceCard" href="/calculators${q(lang)}">
            <div class="serviceIcon">%</div>
            <h3>${lang === "uz" ? "Aliment va mol-mulk tahlili" : lang === "ru" ? "Алименты и имущество" : "Alimony and property"}</h3>
            <p>${lang === "uz" ? "Savol-javobli hisob-kitob va dastlabki huquqiy tahlil." : lang === "ru" ? "Расчёт и предварительный правовой анализ." : "Question-based calculations and preliminary analysis."}</p>
          </a>
        </div>
      </div>

      <div class="surface surfacePad" style="margin-top:18px;">
        <div class="resultLabel">${esc(L.study)}</div>
        <div class="serviceGrid" style="margin-top:16px;">
          <a class="serviceCard" href="https://lex.uz/docs/-104720" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">§</div>
            <h3>${lang === "uz" ? "Oila kodeksi — LexUZ" : lang === "ru" ? "Семейный кодекс — LexUZ" : "Family Code — LexUZ"}</h3>
            <p>${lang === "uz" ? "Oila kodeksining amaldagi rasmiy matnini to‘g‘ridan-to‘g‘ri o‘qing." : lang === "ru" ? "Откройте актуальный официальный текст Семейного кодекса." : "Read the current official Family Code."}</p>
          </a>
          <a class="serviceCard" href="https://gov.uz/oz/advice/728/document/3585" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">O</div>
            <h3>${lang === "uz" ? "Oila huquqi asoslari" : lang === "ru" ? "Основы семейного права" : "Family-law basics"}</h3>
            <p>${lang === "uz" ? "Hukumat portalidagi tushuntiruvchi o‘quv materiali." : lang === "ru" ? "Разъяснительный материал Правительственного портала." : "Government explanatory study material."}</p>
          </a>
          <a class="serviceCard" href="https://gov.uz/oz/advice/58/document/2857" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">⚖</div>
            <h3>${lang === "uz" ? "Nikohni sud tartibida bekor qilish" : lang === "ru" ? "Расторжение брака через суд" : "Court divorce procedure"}</h3>
            <p>${lang === "uz" ? "Sudga murojaat, hujjatlar va tartib bo‘yicha rasmiy ma’lumot." : lang === "ru" ? "Официальная информация о порядке и документах." : "Official filing and document guidance."}</p>
          </a>
          <a class="serviceCard" href="https://gov.uz/oz/advice/72/document/2598" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">₿</div>
            <h3>${lang === "uz" ? "Aliment kelishuvi" : lang === "ru" ? "Соглашение об алиментах" : "Alimony agreement"}</h3>
            <p>${lang === "uz" ? "Aliment to‘lash to‘g‘risidagi kelishuv bo‘yicha rasmiy tushuntirish." : lang === "ru" ? "Официальное разъяснение по соглашению об алиментах." : "Official guidance on alimony agreements."}</p>
          </a>
          <a class="serviceCard" href="https://gov.uz/oz/advice/58/document/583" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">▤</div>
            <h3>${lang === "uz" ? "Nikoh shartnomasi" : lang === "ru" ? "Брачный договор" : "Marriage contract"}</h3>
            <p>${lang === "uz" ? "Nikoh shartnomasining mazmuni, shakli va huquqiy talablari." : lang === "ru" ? "Содержание, форма и правовые требования." : "Content, form and legal requirements."}</p>
          </a>
          <a class="serviceCard" href="https://gov.uz/oz/advice/58/document/577" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">⌂</div>
            <h3>${lang === "uz" ? "Er-xotinning umumiy mulki" : lang === "ru" ? "Общее имущество супругов" : "Marital property"}</h3>
            <p>${lang === "uz" ? "Umumiy mol-mulk rejimi bo‘yicha rasmiy material." : lang === "ru" ? "Официальный материал об общем имуществе супругов." : "Official material on marital property."}</p>
          </a>
        </div>
      </div>
    `,
    L.title,
    L.desc
  );
}





const BUSINESS_KNOWLEDGE_TOPICS = [
  { title: 'Shartnomaviy majburiyatlar', description: 'Shartnoma tuzilishi, bajarilishi, o‘zgartirilishi va bekor qilinishi.' },
  { title: 'Qarzdorlikni undirish', description: 'Qarz hujjatlari, hisob-kitob, talabnoma, dalillar va da’vo.' },
  { title: 'Yetkazib berish', description: 'Tovar, miqdor, sifat, muddat, qabul qilish va javobgarlik.' },
  { title: 'Xizmatlar', description: 'Xizmat hajmi, natija, akt, to‘lov va kamchiliklar.' },
  { title: 'Pudrat', description: 'Ish hajmi, smeta, topshirish-qabul qilish va nuqsonlar.' },
  { title: 'Ijara', description: 'Obyekt, muddat, ijara haqi, qaytarish va zarar.' },
  { title: 'Korporativ boshqaruv', description: 'Ta’sischilar, yig‘ilish, direktor vakolati va qarorlar.' },
  { title: 'Ulushlar', description: 'Ulush o‘tishi, sotilishi, rozilik va qayta ro‘yxatdan o‘tish.' },
  { title: 'Davlat ro‘yxati', description: 'Yangi biznes va o‘zgarishlarni ro‘yxatdan o‘tkazish.' },
  { title: 'Litsenziya', description: 'Faoliyat uchun litsenziya/ruxsat talablari.' },
  { title: 'Soliq', description: 'Soliq majburiyatlari, tekshiruv va e’tirozlar.' },
  { title: 'Bojxona', description: 'Import/eksport va bojxona rasmiylashtiruvi.' },
  { title: 'Davlat xaridlari', description: 'Tender, shartlar, shikoyat va shartnoma.' },
  { title: 'Raqobat', description: 'Raqobat va monopoliyaga qarshi cheklovlar.' },
  { title: 'Intellektual mulk', description: 'Tovar belgisi, mualliflik va litsenziyalash.' },
  { title: 'Bank va to‘lovlar', description: 'Hisobvaraq, to‘lov topshiriqlari va bank munosabatlari.' },
  { title: 'Sug‘urta', description: 'Sug‘urta hodisasi, to‘lov va nizolar.' },
  { title: 'To‘lovga qobiliyatsizlik', description: 'Kreditor, qarzdor va to‘lovga qobiliyatsizlik tartibi.' },
  { title: 'Hakamlik', description: 'Hakamlik kelishuvi va muqobil nizo hal qilish.' },
  { title: 'Xalqaro arbitraj', description: 'Xalqaro tijorat nizolari va arbitraj bandlari.' },
  { title: 'Tashqi savdo', description: 'Eksport/import kontraktlari va valyuta/to‘lov shartlari.' },
  { title: 'Ijro', description: 'Sud hujjati va ijro jarayoni.' },
  { title: 'Tadbirkor huquqlarini himoya qilish', description: 'Palata, Biznes-ombudsman va davlat organlariga murojaat.' },
  { title: 'Due diligence', description: 'Kontragent va bitim xavfini huquqiy tekshirish.' },
];

const BUSINESS_GUIDED_CHECKLISTS = {
  debt: [
    'Shartnoma yoki qarz asosini aniqlash',
    'Majburiyat bajarilish muddatini aniqlash',
    'Hisob-kitob va qarz summasini tekshirish',
    'Akt, hisob-faktura va to‘lov hujjatlarini yig‘ish',
    'Yozishmalar va qarzni tan olish holatini tekshirish',
    'Sudgacha talab tartibini tekshirish',
    'Da’vo talabi va ilovalarni shakllantirish',
  ],
  contract: [
    'Tomonlar va vakolatni tekshirish',
    'Shartnoma predmeti',
    'Narx va to‘lov',
    'Muddat va ijro',
    'Qabul qilish tartibi',
    'Javobgarlik',
    'Bekor qilish',
    'Nizo hal qilish',
    'Rekvizit va imzo',
  ],
  corporate: [
    'Ta’sis hujjatlari',
    'Ta’sischilar tarkibi',
    'Ulushlar',
    'Ustav kapitali',
    'Yig‘ilish vakolati',
    'Kvorum/ovoz',
    'Direktor vakolati',
    'Qarorni rasmiylashtirish',
    'Davlat ro‘yxati zarurati',
  ],
  court: [
    'Sudga taalluqlilik',
    'Hududiy sudlov',
    'Sudgacha tartib',
    'Da’vo muddati/deadline tekshiruvi',
    'Da’vo bahosi',
    'Davlat boji tekshiruvi',
    'Dalillar',
    'Talablar',
    'Ilovalar',
    'Vakolat',
    'Elektron topshirish',
  ],
  contract_review: [
    'Predmet',
    'Muhim shartlar',
    'To‘lov',
    'Ijro',
    'Qabul qilish',
    'Kafolat',
    'Javobgarlik',
    'Neustoyka',
    'Zarar',
    'Force majeure',
    'Maxfiylik',
    'IP',
    'Bekor qilish',
    'Nizo hal qilish',
    'Bildirishnomalar',
    'Vakolat',
    'Rekvizitlar',
  ],
};
const BUSINESS_DISPUTE_TYPES = [
  ["debt","Qarzdorlikni undirish","Взыскание задолженности","Debt recovery"],
  ["supply","Tovar yetkazib berish nizosi","Спор по поставке","Supply dispute"],
  ["services","Xizmat ko‘rsatish nizosi","Спор по услугам","Services dispute"],
  ["works","Pudrat / bajarilgan ishlar nizosi","Подряд / выполненные работы","Works / construction dispute"],
  ["lease","Ijara nizosi","Арендный спор","Lease dispute"],
  ["sale","Oldi-sotdi nizosi","Спор купли-продажи","Sale dispute"],
  ["loan","Qarz / kredit majburiyati","Заем / кредитное обязательство","Loan / credit obligation"],
  ["penalty","Neustoyka, penya va zarar","Неустойка, пеня и убытки","Penalty and damages"],
  ["termination","Shartnomani bekor qilish / o‘zgartirish","Расторжение / изменение договора","Contract termination / amendment"],
  ["invalid_transaction","Bitimni haqiqiy emas deb topish","Недействительность сделки","Invalid transaction"],
  ["corporate","Korporativ / ta’sischilar nizosi","Корпоративный спор","Corporate / shareholder dispute"],
  ["share","Ulush / hissa bilan bog‘liq nizo","Спор по доле","Share / participation interest dispute"],
  ["director","Direktor / boshqaruv organi nizosi","Спор с директором / органом управления","Director / governance dispute"],
  ["dividend","Dividend / foydani taqsimlash nizosi","Дивиденды / распределение прибыли","Dividend / profit distribution dispute"],
  ["registration","Davlat ro‘yxatidan o‘tkazish masalasi","Государственная регистрация","State registration issue"],
  ["license","Litsenziya / ruxsatnoma","Лицензия / разрешение","License / permit"],
  ["tax","Soliq masalasi","Налоговый вопрос","Tax issue"],
  ["customs","Bojxona masalasi","Таможенный вопрос","Customs issue"],
  ["inspection","Tekshiruv / davlat organi harakati","Проверка / действие госоргана","Inspection / public authority action"],
  ["procurement","Davlat xaridlari","Государственные закупки","Public procurement"],
  ["competition","Raqobat / monopoliyaga qarshi masala","Конкуренция / антимонопольный вопрос","Competition / antitrust"],
  ["ip","Tovar belgisi / intellektual mulk","Товарный знак / интеллектуальная собственность","Trademark / intellectual property"],
  ["bank","Bank / hisobvaraq / to‘lov nizosi","Банк / счет / платежный спор","Bank / account / payment dispute"],
  ["insurance","Sug‘urta nizosi","Страховой спор","Insurance dispute"],
  ["insolvency","To‘lovga qobiliyatsizlik","Неплатежеспособность","Insolvency"],
  ["foreign_trade","Tashqi savdo / xalqaro shartnoma","Внешняя торговля / международный договор","Foreign trade / international contract"],
  ["arbitration","Hakamlik / arbitraj","Третейский суд / арбитраж","Arbitration"],
  ["enforcement","Sud hujjatini ijro etish","Исполнение судебного акта","Enforcement"],
  ["other","Boshqa biznes-huquqiy masala","Другой бизнес-правовой вопрос","Other business-law issue"]
];

const BUSINESS_DOCUMENT_TYPES = [
  ["claim","Iqtisodiy sudga da’vo arizasi","Иск в экономический суд","Economic court claim"],
  ["demand","Sudgacha talabnoma / pretenziya","Досудебная претензия","Pre-action demand"],
  ["response","Da’voga fikr / e’tiroz","Отзыв / возражение на иск","Response / objection to claim"],
  ["counterclaim","Qarshi da’vo arizasi","Встречный иск","Counterclaim"],
  ["appeal","Apellyatsiya shikoyati","Апелляционная жалоба","Appeal"],
  ["cassation","Kassatsiya shikoyati","Кассационная жалоба","Cassation complaint"],
  ["motion","Sudga iltimosnoma","Ходатайство в суд","Court motion"],
  ["evidence_motion","Dalil talab qilib olish haqida iltimosnoma","Ходатайство об истребовании доказательств","Motion to obtain evidence"],
  ["security_motion","Da’voni ta’minlash haqida ariza","Заявление об обеспечении иска","Interim relief application"],
  ["enforcement_application","Ijro bo‘yicha ariza","Заявление по исполнению","Enforcement application"],
  ["chamber_appeal","Savdo-sanoat palatasiga murojaat","Обращение в ТПП","Chamber of Commerce appeal"],
  ["ombudsman_appeal","Biznes-ombudsmanga murojaat","Обращение к Бизнес-омбудсману","Business Ombudsman appeal"],
  ["authority_complaint","Davlat organiga shikoyat","Жалоба в государственный орган","Complaint to public authority"],
  ["tax_objection","Soliq masalasi bo‘yicha e’tiroz / murojaat","Возражение / обращение по налогу","Tax objection / appeal"],
  ["license_application","Litsenziya/ruxsatnoma bo‘yicha murojaat","Обращение по лицензии/разрешению","License / permit application"],
  ["notice","Rasmiy bildirishnoma","Официальное уведомление","Formal notice"],
  ["guarantee","Kafolat xati","Гарантийное письмо","Guarantee letter"],
  ["reconciliation","Solishtirma / qarzdorlikni tan olish hujjati","Акт сверки / признание долга","Reconciliation / debt acknowledgement"],
  ["protocol","Bayonnoma / qaror","Протокол / решение","Minutes / resolution"],
  ["power_of_attorney","Ishonchnoma","Доверенность","Power of attorney"],
  ["custom","Boshqa hujjat","Другой документ","Other document"]
];

const BUSINESS_CONTRACT_TYPES = [
  ["supply","Tovar yetkazib berish shartnomasi","Договор поставки","Supply agreement"],
  ["sale","Oldi-sotdi shartnomasi","Договор купли-продажи","Sale agreement"],
  ["services","Xizmat ko‘rsatish shartnomasi","Договор оказания услуг","Services agreement"],
  ["works","Pudrat shartnomasi","Договор подряда","Works contract"],
  ["construction","Qurilish pudrati","Договор строительного подряда","Construction contract"],
  ["lease","Ijara shartnomasi","Договор аренды","Lease agreement"],
  ["loan","Qarz shartnomasi","Договор займа","Loan agreement"],
  ["agency","Agentlik shartnomasi","Агентский договор","Agency agreement"],
  ["commission","Komissiya shartnomasi","Договор комиссии","Commission agreement"],
  ["transport","Tashish / transport shartnomasi","Договор перевозки","Transportation agreement"],
  ["storage","Saqlash shartnomasi","Договор хранения","Storage agreement"],
  ["license_ip","Litsenziya / IP foydalanish shartnomasi","Лицензионный договор / ИС","IP license agreement"],
  ["nda","Maxfiylik (NDA) kelishuvi","Соглашение о конфиденциальности (NDA)","NDA"],
  ["cooperation","Hamkorlik shartnomasi","Договор о сотрудничестве","Cooperation agreement"],
  ["investment","Investitsiya kelishuvi","Инвестиционное соглашение","Investment agreement"],
  ["founders","Ta’sischilar kelishuvi","Соглашение учредителей","Founders agreement"],
  ["share_transfer","Ulushni o‘tkazish / sotish hujjati","Передача / продажа доли","Share transfer agreement"],
  ["settlement","Kelishuv bitimi","Мировое соглашение","Settlement agreement"],
  ["debt_restructuring","Qarzni restrukturizatsiya qilish kelishuvi","Соглашение о реструктуризации долга","Debt restructuring agreement"],
  ["foreign_trade","Tashqi savdo shartnomasi","Внешнеторговый контракт","Foreign trade contract"],
  ["custom","Boshqa turdagi shartnoma","Другой договор","Other contract"]
];

const BUSINESS_CORPORATE_DOCS = [
  ["charter","Ustav loyihasi","Проект устава","Charter draft"],
  ["founder_decision","Yagona ta’sischi qarori","Решение единственного учредителя","Sole founder decision"],
  ["meeting_minutes","Umumiy yig‘ilish bayonnomasi","Протокол общего собрания","General meeting minutes"],
  ["director_appointment","Direktor tayinlash qarori","Решение о назначении директора","Director appointment resolution"],
  ["share_change","Ulush/hissa o‘zgarishi bo‘yicha hujjat","Документ об изменении доли","Share change document"],
  ["capital_change","Ustav kapitalini o‘zgartirish qarori","Решение об изменении уставного капитала","Capital change resolution"],
  ["address_change","Yuridik manzilni o‘zgartirish qarori","Решение об изменении адреса","Registered address change"],
  ["activity_change","Faoliyat turini o‘zgartirish qarori","Решение об изменении вида деятельности","Activity change resolution"],
  ["reorganization","Qayta tashkil etish hujjati","Документ о реорганизации","Reorganization document"],
  ["liquidation","Tugatish bo‘yicha qaror","Решение о ликвидации","Liquidation resolution"],
  ["internal_policy","Ichki nizom / siyosat","Внутреннее положение / политика","Internal policy"],
  ["custom","Boshqa korporativ hujjat","Другой корпоративный документ","Other corporate document"]
];

function businessOptions(list, lang){
  const ix = lang === "ru" ? 2 : lang === "en" ? 3 : 1;
  return list.map(x => `<option value="${esc(x[0])}">${esc(x[ix])}</option>`).join("");
}

function businessPanel(title, text, href, icon="§"){
  return `<a class="serviceCard" href="${esc(href)}">
    <div class="serviceIcon">${esc(icon)}</div>
    <h3>${esc(title)}</h3>
    <p>${esc(text)}</p>
    <span class="serviceLink">Ochish →</span>
  </a>`;
}



function businessPage(lang="uz"){
  const t=(uz,ru,en)=>lang==="ru"?ru:lang==="en"?en:uz;

  const lawCards = [
    ["Fuqarolik kodeksi — I qism","Yuridik shaxslar, bitimlar, mulk, majburiyatlarning umumiy qoidalari.","https://lex.uz/docs/-111189","FK I"],
    ["Fuqarolik kodeksi — II qism","Oldi-sotdi, ijara, pudrat, xizmat, qarz va boshqa shartnomalar.","https://lex.uz/docs/-180552","FK II"],
    ["Iqtisodiy protsessual kodeks","Iqtisodiy sudda da’vo, dalillar va protsessual tartib.","https://lex.uz/docs/-3523891","IPK"],
    ["Soliq kodeksi","Tadbirkorlik subyektlarining soliq majburiyatlari.","https://lex.uz/docs/-4674902","SK"],
    ["Litsenziyalash va ruxsat berish","Litsenziya, ruxsatnoma va xabardor qilish tartib-taomillari.","https://lex.uz/docs/-5511879","L"],
    ["Davlat xaridlari to‘g‘risida","Davlat xaridlari, ishtirokchilar va shartnomalar.","https://lex.uz/docs/-5382974","DX"],
    ["Tadbirkorlik erkinligi kafolatlari","Tadbirkorlik faoliyati erkinligi va huquqiy kafolatlar.","https://lex.uz/docs/-2006789","TE"],
    ["MChJ to‘g‘risida","Mas’uliyati cheklangan jamiyatlar bo‘yicha korporativ qoidalar.","https://lex.uz/docs/-8151376","MChJ"]
  ];

  const laws = lawCards.map(x=>`<a class="bLaw" href="${x[2]}" target="_blank" rel="noopener noreferrer">
      <div class="bLawCode">${x[3]}</div><div><strong>${x[0]}</strong><p>${x[1]}</p></div><span>↗</span>
    </a>`).join("");

  const contractTypes=[
    ["supply","Tovar yetkazib berish"],["sale","Oldi-sotdi"],["services","Xizmat ko‘rsatish"],["lease","Ijara"],
    ["works","Pudrat"],["loan","Qarz"],["nda","NDA / maxfiylik"],["cooperation","Hamkorlik"]
  ].map(x=>`<button class="bAction" onclick="bizOpen('contract','${x[0]}','${x[1]} shartnomasi')"><span class="bDot">S</span><b>${x[1]}</b><i>→</i></button>`).join("");

  const claims=[
    ["debt","Qarzdorlikni undirish"],["performance","Majburiyatni bajarish"],["damages","Zarar undirish"],["termination","Shartnomani bekor qilish"],
    ["invalid","Bitimni haqiqiy emas deb topish"],["corporate","Korporativ nizo"],["counterclaim","Qarshi da’vo"],["custom","Boshqa biznes nizosi"]
  ].map(x=>`<button class="bAction" onclick="bizOpen('document','${x[0]}','${x[1]}')"><span class="bDot">D</span><b>${x[1]}</b><i>→</i></button>`).join("");

  return appLayout(lang,"business",`
  <style>
    .bWrap{max-width:1280px;margin:0 auto}
    .bTop{position:relative;overflow:hidden;border-radius:24px;padding:34px 38px;background:#071f36;color:#fff;box-shadow:0 18px 48px rgba(5,31,54,.14)}
    .bTop:before{content:"";position:absolute;width:360px;height:360px;border:1px solid rgba(213,174,101,.20);border-radius:50%;right:-100px;top:-210px}
    .bTop:after{content:"";position:absolute;width:260px;height:260px;border:1px solid rgba(213,174,101,.14);border-radius:50%;right:35px;top:-160px}
    .bKicker{font-size:11px;letter-spacing:2px;color:#d6ae65;font-weight:900}.bTop h1{font-size:38px;margin:9px 0 8px}.bTop p{max-width:720px;color:#c9d5df;margin:0;line-height:1.6}
    .bTopBtns{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.bTopBtn{border:1px solid rgba(255,255,255,.17);background:rgba(255,255,255,.07);color:#fff;border-radius:11px;padding:11px 15px;text-decoration:none;font-size:13px;font-weight:800}.bTopBtn.gold{background:#d4aa60;color:#082139;border-color:#d4aa60}
    .bStats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:14px}.bStat{background:#fff;border:1px solid #e6ebef;border-radius:16px;padding:17px 18px}.bStat small{display:block;color:#778594;font-size:10px;text-transform:uppercase;letter-spacing:.8px}.bStat strong{display:block;color:#0a2843;font-size:17px;margin-top:5px}
    .bLayout{display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:18px;margin-top:20px}.bPanel{background:#fff;border:1px solid #e5eaee;border-radius:18px;padding:21px;box-shadow:0 7px 22px rgba(8,38,62,.035)}
    .bHead{display:flex;justify-content:space-between;align-items:end;gap:15px;margin-bottom:15px}.bHead h2{font-size:20px;color:#092742;margin:0}.bHead p{font-size:11px;color:#788795;margin:4px 0 0}.bTag{font-size:10px;color:#98702f;background:#fbf5e9;border:1px solid #efe0c3;border-radius:20px;padding:6px 9px;font-weight:900}
    .bTools{display:grid;grid-template-columns:repeat(2,1fr);gap:11px}.bTool{border:1px solid #e4e9ed;border-radius:15px;padding:17px;background:#fff;text-align:left;cursor:pointer;min-height:118px;transition:.18s}.bTool:hover{border-color:#d5b675;box-shadow:0 9px 24px rgba(11,40,65,.07);transform:translateY(-2px)}.bToolIcon{width:38px;height:38px;border-radius:10px;background:#f6f1e7;color:#9b722f;display:grid;place-items:center;font-weight:900}.bTool h3{font-size:14px;margin:12px 0 4px;color:#0b2944}.bTool p{font-size:11px;color:#758492;line-height:1.45;margin:0}
    .bSideTitle{font-size:13px;color:#0b2944;font-weight:900;margin-bottom:12px}.bSideLink{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #edf0f2;text-decoration:none;color:#153650;font-size:12px;font-weight:750}.bSideLink:last-child{border-bottom:0}.bSideLink span{color:#b1843b}
    .bSection{margin-top:20px}.bActionGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.bAction{border:1px solid #e4e9ed;background:#fff;border-radius:13px;padding:13px 14px;display:flex;align-items:center;gap:10px;cursor:pointer;text-align:left;color:#102f49}.bAction:hover{border-color:#d6b776}.bAction b{font-size:12px;flex:1}.bAction i{font-style:normal;color:#aa7b2f}.bDot{width:29px;height:29px;border-radius:8px;background:#f5f0e7;color:#9c7130;display:grid;place-items:center;font-size:10px;font-weight:900}
    .bLawGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.bLaw{display:grid;grid-template-columns:47px 1fr 18px;gap:12px;align-items:center;border:1px solid #e3e8ec;border-radius:14px;padding:14px;text-decoration:none;background:#fff;color:#0a2944}.bLaw:hover{border-color:#cfae70;box-shadow:0 7px 18px rgba(7,37,61,.05)}.bLawCode{height:42px;border-radius:10px;background:#092a47;color:#e3bd76;display:grid;place-items:center;font-size:10px;font-weight:900}.bLaw strong{font-size:12px}.bLaw p{font-size:10px;color:#788692;margin:4px 0 0;line-height:1.4}.bLaw>span{color:#ad8037}
    .bOfficial{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.bOfficial a{border:1px solid #e4e9ed;border-radius:13px;padding:15px;text-decoration:none;color:#0d2e49;background:#fff}.bOfficial strong{font-size:12px;display:block}.bOfficial small{display:block;color:#7b8996;margin-top:5px;font-size:10px}
    .bModal{position:fixed;inset:0;background:rgba(3,19,32,.62);z-index:9999;display:none;align-items:center;justify-content:center;padding:20px}.bModal.open{display:flex}.bModalCard{background:#fff;width:min(820px,96vw);max-height:90vh;overflow:auto;border-radius:20px;padding:25px}.bModalTop{display:flex;justify-content:space-between;align-items:center}.bModalTop h2{margin:0}.bClose{border:0;width:38px;height:38px;border-radius:50%;font-size:20px;cursor:pointer}
    @media(max-width:980px){.bLayout{grid-template-columns:1fr}.bStats,.bActionGrid,.bOfficial{grid-template-columns:repeat(2,1fr)}}@media(max-width:620px){.bStats,.bTools,.bActionGrid,.bOfficial,.bLawGrid{grid-template-columns:1fr}.bTop{padding:26px 22px}.bTop h1{font-size:30px}}
  </style>

  <div class="bWrap">
    <section class="bTop">
      <div class="bKicker">HUQUQIY AI · BUSINESS DESK</div>
      <h1>${t("Biznes huquqi","Бизнес-право","Business Law")}</h1>
      <p>${t("Tadbirkor va kompaniya uchun huquqiy ish stoli: AI tahlil, shartnoma, da’vo, korporativ hujjatlar, qonunchilik va rasmiy davlat xizmatlari.","Юридическое рабочее пространство для бизнеса.","A legal workspace for entrepreneurs and companies.")}</p>
      <div class="bTopBtns"><a class="bTopBtn gold" href="#b-ai">${t("AI biznes yuristi","AI бизнес-юрист","AI business lawyer")}</a><a class="bTopBtn" href="#b-laws">${t("Qonun manbalari","Источники права","Legal sources")}</a><a class="bTopBtn" href="https://cabinet.sud.uz/" target="_blank" rel="noopener noreferrer">${t("Sud kabineti ↗","Судебный кабинет ↗","Court cabinet ↗")}</a></div>
    </section>

    <div class="bStats">
      <div class="bStat"><small>${t("Yo‘nalish","Направление","Area")}</small><strong>${t("Shartnomalar","Договоры","Contracts")}</strong></div>
      <div class="bStat"><small>${t("Yo‘nalish","Направление","Area")}</small><strong>${t("Biznes nizolari","Бизнес-споры","Disputes")}</strong></div>
      <div class="bStat"><small>${t("Yo‘nalish","Направление","Area")}</small><strong>${t("Korporativ huquq","Корпоративное право","Corporate")}</strong></div>
      <div class="bStat"><small>${t("Manbalar","Источники","Sources")}</small><strong>${t("Bevosita rasmiy","Прямые официальные","Direct official")}</strong></div>
    </div>

    <div class="bLayout">
      <div>
        <section id="b-ai" class="bPanel">
          <div class="bHead"><div><h2>${t("Nima qilmoqchisiz?","Что вы хотите сделать?","What do you want to do?")}</h2><p>${t("Xizmatni tanlang — kerakli AI forma ochiladi.","Выберите сервис — откроется нужная AI-форма.","Choose a service to open its AI form.")}</p></div><span class="bTag">AI LEGAL WORKFLOW</span></div>
          <div class="bTools">
            <button class="bTool" onclick="bizOpen('analysis','business','${t("Biznes muammosini tahlil qilish","Анализ бизнес-проблемы","Analyze business issue")}')"><div class="bToolIcon">AI</div><h3>${t("Huquqiy tahlil","Правовой анализ","Legal analysis")}</h3><p>${t("Muammo → huquqiy masala → dalillar → variantlar → keyingi qadam.","Проблема → право → доказательства → решение.","Problem → law → evidence → options → next step.")}</p></button>
            <button class="bTool" onclick="bizOpen('contract','custom','${t("Shartnoma tayyorlash","Подготовить договор","Draft contract")}')"><div class="bToolIcon">S</div><h3>${t("Shartnoma tayyorlash","Подготовить договор","Draft a contract")}</h3><p>${t("Istalgan biznes shartnomasi uchun moslashuvchan generator.","Гибкий генератор бизнес-договоров.","Flexible business contract generator.")}</p></button>
            <button class="bTool" onclick="bizOpen('document','claim','${t("Da’vo yoki ariza tayyorlash","Подготовить иск или заявление","Draft claim/application")}')"><div class="bToolIcon">D</div><h3>${t("Da’vo va arizalar","Иски и заявления","Claims & applications")}</h3><p>${t("Da’vo, talabnoma, e’tiroz, shikoyat va boshqa hujjatlar.","Иски, претензии, отзывы и жалобы.","Claims, demands, responses and appeals.")}</p></button>
            <button class="bTool" onclick="bizOpen('contract_review','review','${t("Shartnomani tekshirish","Проверить договор","Review contract")}')"><div class="bToolIcon">✓</div><h3>${t("Shartnomani tekshirish","Проверка договора","Contract review")}</h3><p>${t("Xavfli bandlar, yetishmayotgan shartlar va tavsiya etiladigan tuzatishlar.","Риски и рекомендуемые правки.","Risks, missing terms and suggested edits.")}</p></button>
          </div>
        </section>
      </div>

      <aside class="bPanel">
        <div class="bSideTitle">${t("Tezkor rasmiy xizmatlar","Быстрые официальные сервисы","Official quick links")}</div>
        <a class="bSideLink" href="https://my.gov.uz/uz/service/57" target="_blank" rel="noopener noreferrer">${t("Biznesni ro‘yxatdan o‘tkazish","Регистрация бизнеса","Business registration")}<span>↗</span></a>
        <a class="bSideLink" href="https://my.gov.uz/uz/service/58" target="_blank" rel="noopener noreferrer">${t("Qayta ro‘yxatdan o‘tkazish","Перерегистрация","Re-registration")}<span>↗</span></a>
        <a class="bSideLink" href="https://my.gov.uz/uz/service/77" target="_blank" rel="noopener noreferrer">${t("Kontragentni tekshirish","Проверить контрагента","Check counterparty")}<span>↗</span></a>
        <a class="bSideLink" href="https://license.gov.uz/" target="_blank" rel="noopener noreferrer">${t("Litsenziya va ruxsatlar","Лицензии и разрешения","Licenses & permits")}<span>↗</span></a>
        <a class="bSideLink" href="https://soliq.uz/" target="_blank" rel="noopener noreferrer">${t("Soliq xizmatlari","Налоговые сервисы","Tax services")}<span>↗</span></a>
        <a class="bSideLink" href="https://murojaat.chamber.uz/oz/appeals" target="_blank" rel="noopener noreferrer">${t("Palataga murojaat","Обращение в ТПП","Chamber appeal")}<span>↗</span></a>
        <a class="bSideLink" href="https://biznesvakil.uz/" target="_blank" rel="noopener noreferrer">${t("Biznes-ombudsman","Бизнес-омбудсман","Business Ombudsman")}<span>↗</span></a>
      </aside>
    </div>

    <section class="bPanel bSection">
      <div class="bHead"><div><h2>${t("Shartnomalar","Договоры","Contracts")}</h2><p>${t("Turini tanlang va AI bilan individual loyiha tayyorlang.","Выберите тип и создайте индивидуальный проект.","Choose a type and create a tailored draft.")}</p></div><span class="bTag">${t("NAMUNA + GENERATOR","ШАБЛОН + ГЕНЕРАТОР","TEMPLATE + GENERATOR")}</span></div>
      <div class="bActionGrid">${contractTypes}</div>
    </section>

    <section class="bPanel bSection">
      <div class="bHead"><div><h2>${t("Biznes nizolari va da’volar","Бизнес-споры и иски","Business disputes & claims")}</h2><p>${t("Sudgacha hujjatdan iqtisodiy sud da’vosigacha.","От претензии до экономического суда.","From pre-action demand to economic court claim.")}</p></div></div>
      <div class="bActionGrid">${claims}</div>
    </section>

    <section id="b-laws" class="bPanel bSection">
      <div class="bHead"><div><h2>${t("Biznes huquqi — to‘g‘ridan-to‘g‘ri qonun manbalari","Бизнес-право — прямые источники","Business law — direct legal sources")}</h2><p>${t("Kartani bossangiz LexUZ bosh sahifasi emas, aynan hujjatning o‘zi ochiladi.","Открывается сам документ, а не главная LexUZ.","Each card opens the exact official document, not the LexUZ homepage.")}</p></div><span class="bTag">LEXUZ DIRECT</span></div>
      <div class="bLawGrid">${laws}</div>
    </section>

    <section class="bPanel bSection">
      <div class="bHead"><div><h2>${t("Korporativ va tadbirkorni himoya qilish","Корпоративные документы и защита бизнеса","Corporate & business protection")}</h2></div></div>
      <div class="bActionGrid">
        <button class="bAction" onclick="bizOpen('corporate','charter','Ustav loyihasi')"><span class="bDot">K</span><b>${t("Ustav loyihasi","Проект устава","Charter draft")}</b><i>→</i></button>
        <button class="bAction" onclick="bizOpen('corporate','founder_decision','Ta’sischi qarori')"><span class="bDot">K</span><b>${t("Ta’sischi qarori","Решение учредителя","Founder resolution")}</b><i>→</i></button>
        <button class="bAction" onclick="bizOpen('protection','chamber','Savdo-sanoat palatasiga murojaat')"><span class="bDot">H</span><b>${t("Palataga murojaat","Обращение в ТПП","Chamber appeal")}</b><i>→</i></button>
        <button class="bAction" onclick="bizOpen('protection','ombudsman','Biznes-ombudsmanga murojaat')"><span class="bDot">H</span><b>${t("Biznes-ombudsmanga murojaat","Обращение к Бизнес-омбудсману","Business Ombudsman appeal")}</b><i>→</i></button>
      </div>
    </section>

    <section class="bPanel bSection">
      <div class="bHead"><div><h2>${t("Rasmiy platformalar","Официальные платформы","Official platforms")}</h2><p>${t("Har biri tegishli xizmatning o‘ziga olib boradi.","Каждая ссылка ведет прямо к нужному сервису.","Each link goes directly to the relevant service.")}</p></div></div>
      <div class="bOfficial">
        <a href="https://cabinet.sud.uz/" target="_blank" rel="noopener noreferrer"><strong>ADOLAT</strong><small>${t("Sudga elektron murojaat","Электронное обращение в суд","Electronic court filing")}</small></a>
        <a href="https://chamber.uz/" target="_blank" rel="noopener noreferrer"><strong>${t("Savdo-sanoat palatasi","Торгово-промышленная палата","Chamber of Commerce")}</strong><small>${t("Tadbirkorlikni qo‘llab-quvvatlash","Поддержка бизнеса","Business support")}</small></a>
        <a href="https://license.gov.uz/" target="_blank" rel="noopener noreferrer"><strong>License</strong><small>${t("Litsenziya va ruxsatlar","Лицензии и разрешения","Licenses & permits")}</small></a>
        <a href="https://soliq.uz/" target="_blank" rel="noopener noreferrer"><strong>Soliq</strong><small>${t("Soliq xizmatlari","Налоговые сервисы","Tax services")}</small></a>
      </div>
    </section>
  </div>

  <div id="bizModal" class="bModal" onclick="if(event.target===this)bizClose()"><div class="bModalCard">
    <div class="bModalTop"><div><div class="resultLabel">HUQUQIY AI · BUSINESS</div><h2 id="bizModalTitle">${t("AI biznes yuristi","AI бизнес-юрист","AI business lawyer")}</h2></div><button class="bClose" onclick="bizClose()">×</button></div>
    <form method="POST" action="/business-result${q(lang)}">
      <input id="bizMode" type="hidden" name="mode" value="analysis"><input id="bizIssue" type="hidden" name="issue"><input id="bizDocType" type="hidden" name="document_type"><input id="bizContractType" type="hidden" name="contract_type">
      <div class="formGrid"><div class="formGroup"><label>${t("Sizning tomoningiz / korxona","Ваша сторона / компания","Your side / company")}</label><input name="party1"></div><div class="formGroup"><label>${t("Kontragent / qarshi tomon","Контрагент","Counterparty")}</label><input name="counterparty"></div><div class="formGroup"><label>${t("Summa / narx","Сумма / цена","Amount / price")}</label><input name="amount"></div><div class="formGroup"><label>${t("Shartnoma yoki hujjat","Договор или документ","Contract/document")}</label><input name="contract"></div></div>
      <div class="formGroup"><label>${t("Vaziyat, faktlar va muhim shartlar","Ситуация и факты","Situation, facts and key terms")}</label><textarea name="facts" rows="7" required></textarea></div>
      <div class="formGrid"><div class="formGroup"><label>${t("Dalillar / ilovalar","Доказательства","Evidence")}</label><textarea name="evidence" rows="4"></textarea></div><div class="formGroup"><label>${t("Siz xohlayotgan natija","Желаемый результат","Desired result")}</label><textarea name="goal" rows="4"></textarea></div></div>
      <button class="btn btnPrimary" type="submit">${t("AI bilan tayyorlash","Подготовить с AI","Prepare with AI")}</button>
    </form>
  </div></div>
  <script>
    function bizOpen(mode,type,title){document.getElementById("bizMode").value=mode;document.getElementById("bizIssue").value=type||"";document.getElementById("bizDocType").value=(mode==="document"||mode==="protection"||mode==="corporate")?type:"";document.getElementById("bizContractType").value=mode==="contract"?type:"";document.getElementById("bizModalTitle").textContent=title||"AI Biznes yuristi";document.getElementById("bizModal").classList.add("open");document.body.style.overflow="hidden";}
    function bizClose(){document.getElementById("bizModal").classList.remove("open");document.body.style.overflow="";}
  </script>
  `);
}

function businessLinkCard(title,desc,url){
  return `<a class="sourceCard" href="${esc(url)}" target="_blank" rel="noopener noreferrer">
    <div class="serviceIcon">§</div>
    <h3>${esc(title)}</h3>
    <p>${esc(desc)}</p>
    <span class="serviceLink">Rasmiy sayt ↗</span>
  </a>`;
}

async function businessResultPage(lang, body){
  const get = (k,n=8000) => String((body && body[k]) || "").trim().slice(0,n);
  const mode = get("mode",80) || "analysis";
  const issue = get("issue",160);
  const documentType = get("document_type",160);
  const contractType = get("contract_type",160);
  const customType = get("custom_type",300);
  const counterparty = get("counterparty",400);
  const party1 = get("party1",400);
  const party2 = get("party2",400);
  const company = get("company",400);
  const addressee = get("addressee",400);
  const amount = get("amount",2000);
  const contract = get("contract",1000);
  const facts = get("facts",12000);
  const evidence = get("evidence",8000);
  const goal = get("goal",6000);

  const languageName = lang==="ru" ? "Russian" : lang==="en" ? "English" : "Uzbek (Latin)";
  const modeInstruction = {
    analysis: "Provide a structured business-law analysis: facts, missing facts, legal issues, applicable legal framework, evidence, pre-action options, dispute-resolution route, risks, next steps and documents to prepare.",
    document: "Draft the requested business legal document in professional form. Include addressee, parties, factual basis, legal basis where verified, requests/relief, attachments and signature/date placeholders as appropriate.",
    contract: "Draft the requested business contract. Include parties, definitions if needed, subject, quantity/quality/specification where relevant, price/payment, delivery/performance/acceptance, rights and duties, warranties, liability, penalties only if supplied or clearly marked, force majeure, confidentiality if relevant, dispute resolution, term/termination, notices, details and signatures.",
    contract_review: "Review the supplied contract. Separate: unclear/missing essential terms, one-sided clauses, payment/performance risk, liability risk, termination risk, dispute-resolution risk, evidence/documentation risk, suggested edits, and questions before signing. Do not pretend the text contains clauses that are absent.",
    corporate: "Draft the requested corporate document for an Uzbekistan business. Use placeholders for missing company, founder, share, capital, address, director, date and registration details. Flag matters requiring notarization, registration or official verification instead of guessing.",
    protection: "Draft a concise but strong entrepreneur-rights appeal for the selected institution. State facts, challenged act/omission if any, supporting documents, requested action and attachments. Do not claim that the institution has jurisdiction unless verified from the facts.",
    due_diligence: "Create a practical legal due-diligence checklist for this counterparty and transaction. Distinguish what can be checked in official registries from what must be requested from the counterparty. Include authority/signature, registration, licenses, ownership/asset, litigation/enforcement, tax/compliance, contract and payment risks where relevant.",
    court_readiness: "Assess readiness for an economic-court case. Check parties/status, subject-matter jurisdiction, territorial jurisdiction questions, pre-action requirements, limitation/deadline issues to verify, claim amount, state duty/cost items to verify, evidence, calculation, requested relief, attachments and filing steps."
  }[mode] || "Provide a structured Uzbekistan business-law response.";

  const prompt = `
You are HUQUQIY AI's BUSINESS LAW module for Uzbekistan.
Respond in ${languageName}.

CORE RULES:
- Use only facts supplied by the user. Never invent a company name, STIR, address, bank details, dates, sums, contract numbers, evidence, court name, procedural deadline, state duty, statutory article, government decision or case law.
- For every missing factual field in a draft write [TO‘LDIRILADI].
- Clearly distinguish USER FACTS, MISSING INFORMATION, LEGAL ISSUES, LEGAL BASIS, EVIDENCE, OPTIONS/RISKS, NEXT STEPS and DRAFT DOCUMENT when relevant.
- Uzbekistan law changes. Cite an exact article only when confident it is current; otherwise say the current official LexUZ text must be verified.
- Do not guarantee an outcome.
- Do not automatically send every dispute to court. Consider negotiation, pre-action demand, mediation, Chamber mechanisms, arbitration/hakamlik if contractually applicable, competent state body, Business Ombudsman, and economic court depending on the facts.
- Before an economic-court claim, identify questions of jurisdiction, pre-action procedure, claim calculation and evidence that need verification.
- For a contract, identify essential/commercial terms that are missing before presenting the draft.
- For a corporate document, do not invent founder/share/capital data.
- For tax, customs, licensing, competition, procurement, insolvency, IP or other specialized matters, state which official source/authority should be checked.

TASK:
${modeInstruction}

INPUT:
Mode: ${mode}
Issue: ${issue}
Document type: ${documentType}
Contract type: ${contractType}
Custom type/title: ${customType}
Company: ${company}
Party 1: ${party1}
Party 2: ${party2}
Counterparty: ${counterparty}
Addressee: ${addressee}
Amount/payment/term: ${amount}
Contract/reference: ${contract}
Facts: ${facts}
Evidence: ${evidence}
Goal/request: ${goal}
`;

  let result;
  try{
    result = await callAI(prompt, lang);
  }catch(err){
    result = lang==="ru"
      ? "AI-сервис временно недоступен. Проверьте API-настройки и повторите попытку."
      : lang==="en"
      ? "The AI service is temporarily unavailable. Check the API configuration and try again."
      : "AI xizmati vaqtincha ishlamayapti. API sozlamalarini tekshirib, qayta urinib ko‘ring.";
  }

  const title = mode==="contract" ? (lang==="ru"?"Проект договора":lang==="en"?"Contract draft":"Shartnoma loyihasi")
    : mode==="document" ? (lang==="ru"?"Проект документа":lang==="en"?"Document draft":"Hujjat loyihasi")
    : mode==="corporate" ? (lang==="ru"?"Корпоративный документ":lang==="en"?"Corporate document":"Korporativ hujjat")
    : mode==="contract_review" ? (lang==="ru"?"Анализ договора":lang==="en"?"Contract review":"Shartnoma tahlili")
    : (lang==="ru"?"Результат бизнес-юриста":lang==="en"?"Business lawyer result":"AI biznes yuristi natijasi");

  return appLayout(lang,"business",`
    <div class="appHeader">
      <div class="resultLabel">${lang==="ru"?"БИЗНЕС-ПРАВО":lang==="en"?"BUSINESS LAW":"BIZNES HUQUQI"}</div>
      <h1>${esc(title)}</h1>
      <p>${lang==="uz"?"Natijani amaldagi rasmiy qonunchilik va ish hujjatlari bilan tekshiring.":"AI legal output should be verified against current official law and case documents."}</p>
    </div>
    <div class="surface surfacePad">
      <div style="white-space:pre-wrap;line-height:1.75">${esc(result)}</div>
      <div class="formActions" style="margin-top:22px;">
        <a class="btn btnOutline" href="/business${q(lang)}">← ${lang==="uz"?"Biznes huquqiga qaytish":"Back"}</a>
        <a class="btn btnOutline" href="https://lex.uz/" target="_blank" rel="noopener noreferrer">LexUZ ↗</a>
        <a class="btn btnPrimary" href="https://cabinet.sud.uz/" target="_blank" rel="noopener noreferrer">${lang==="uz"?"Sud kabineti":"Court cabinet"} ↗</a>
      </div>
    </div>
  `);
}


function employmentPage(lang) {

  lang = getLang(lang);

  const t = {
    uz: {
      title: "Mehnat huquqi",
      description: "Mehnat nizosini sodda savollar orqali aniqlang. Tizim vaziyatga qarab huquqiy xulosa yoki da’vo arizasi loyihasini tayyorlaydi.",
      issue: "Muammo turi",
      issueOptions: [
        ["dismissal", "Ishdan bo‘shatish / ishga tiklash"],
        ["wage", "Ish haqi yoki boshqa to‘lov undirilmagan"],
        ["contract", "Mehnat shartnomasi bilan bog‘liq nizo"],
        ["leave", "Ta’til yoki ish vaqti bilan bog‘liq nizo"],
        ["other", "Boshqa mehnat nizosi"]
      ],
      employer: "Ish beruvchi / tashkilot nomi",
      position: "Lavozimingiz",
      start: "Ish boshlagan sana",
      end: "Ishdan bo‘shatilgan sana (agar mavjud bo‘lsa)",
      order: "Buyruq yoki mehnat shartnomasi haqidagi ma’lumot",
      facts: "Vaziyatni qisqacha bayon qiling",
      factsPh: "Nima sodir bo‘lganini sana va muhim holatlar bilan yozing...",
      evidence: "Mavjud hujjatlar va dalillar",
      evidencePh: "Mehnat shartnomasi, buyruq, hisob-kitob, yozishmalar va boshqalar...",
      goal: "Natija turi",
      conclusion: "Huquqiy xulosa",
      claim: "Da’vo arizasi loyihasi",
      submit: "Tahlil qilish",
      note: "Tizim yetishmayotgan faktlarni o‘zi to‘ldirmaydi. Hujjatni topshirishdan oldin amaldagi qonunchilik va rekvizitlarni tekshiring."
    },
    ru: {
      title: "Трудовое право",
      description: "Опишите трудовой спор через простые вопросы. Система подготовит правовое заключение или проект иска в зависимости от ситуации.",
      issue: "Тип проблемы",
      issueOptions: [
        ["dismissal", "Увольнение / восстановление на работе"],
        ["wage", "Невыплата заработной платы или иных выплат"],
        ["contract", "Спор по трудовому договору"],
        ["leave", "Спор об отпуске или рабочем времени"],
        ["other", "Другой трудовой спор"]
      ],
      employer: "Работодатель / организация",
      position: "Должность",
      start: "Дата начала работы",
      end: "Дата увольнения (если имеется)",
      order: "Сведения о приказе или трудовом договоре",
      facts: "Кратко опишите ситуацию",
      factsPh: "Опишите, что произошло, с датами и важными обстоятельствами...",
      evidence: "Документы и доказательства",
      evidencePh: "Трудовой договор, приказ, расчёты, переписка и т.д.",
      goal: "Тип результата",
      conclusion: "Правовое заключение",
      claim: "Проект искового заявления",
      submit: "Провести анализ",
      note: "Система не заполняет отсутствующие факты предположениями. Перед подачей документа проверьте действующее законодательство и реквизиты."
    },
    en: {
      title: "Employment law",
      description: "Describe an employment dispute through simple questions. The system will prepare a legal conclusion or a claim draft depending on the situation.",
      issue: "Issue type",
      issueOptions: [
        ["dismissal", "Dismissal / reinstatement"],
        ["wage", "Unpaid wages or other payments"],
        ["contract", "Employment-contract dispute"],
        ["leave", "Leave or working-time dispute"],
        ["other", "Other employment dispute"]
      ],
      employer: "Employer / organization",
      position: "Position",
      start: "Employment start date",
      end: "Dismissal date (if applicable)",
      order: "Information about the order or employment contract",
      facts: "Briefly describe the situation",
      factsPh: "Describe what happened, including dates and important facts...",
      evidence: "Available documents and evidence",
      evidencePh: "Employment contract, order, calculations, correspondence, etc.",
      goal: "Result type",
      conclusion: "Legal conclusion",
      claim: "Claim draft",
      submit: "Analyze",
      note: "The system does not invent missing facts. Verify current law and filing details before submitting a document."
    }
  }[lang];

  const options = t.issueOptions
    .map(([value, label]) => `<option value="${esc(value)}">${esc(label)}</option>`)
    .join("");

  return appLayout(
    lang,
    "employment",
    `
      <div class="notice noticeGold">
        <span class="noticeIcon">!</span>
        <span>${esc(t.note)}</span>
      </div>

      <div class="surface surfacePad">
        <form method="POST" action="/employment-result${q(lang)}">
          <div class="formGrid">

            <div class="formGroup full">
              <label>${esc(t.issue)}</label>
              <select name="issue_type" required>${options}</select>
            </div>

            <div class="formGroup">
              <label>${esc(t.employer)}</label>
              <input name="employer" required>
            </div>

            <div class="formGroup">
              <label>${esc(t.position)}</label>
              <input name="position">
            </div>

            <div class="formGroup">
              <label>${esc(t.start)}</label>
              <input type="date" name="employment_start">
            </div>

            <div class="formGroup">
              <label>${esc(t.end)}</label>
              <input type="date" name="employment_end">
            </div>

            <div class="formGroup full">
              <label>${esc(t.order)}</label>
              <input name="order_info">
            </div>

            <div class="formGroup full">
              <label>${esc(t.facts)}</label>
              <textarea name="facts" required placeholder="${esc(t.factsPh)}"></textarea>
            </div>

            <div class="formGroup full">
              <label>${esc(t.evidence)}</label>
              <textarea name="evidence" placeholder="${esc(t.evidencePh)}"></textarea>
            </div>

            <div class="formGroup full">
              <label>${esc(t.goal)}</label>
              <select name="result_type" required>
                <option value="conclusion">${esc(t.conclusion)}</option>
                <option value="claim">${esc(t.claim)}</option>
              </select>
            </div>

          </div>

          <div class="formActions">
            <button class="btn btnPrimary" type="submit">§ ${esc(t.submit)}</button>
          </div>
        </form>
      </div>

      <div class="surface surfacePad" style="margin-top:18px;">
        <div class="resultLabel">
          ${lang === "uz" ? "MEHNAT SHARTNOMASI NAMUNALARI" : lang === "ru" ? "ОБРАЗЦЫ ТРУДОВЫХ ДОГОВОРОВ" : "EMPLOYMENT CONTRACT SAMPLES"}
        </div>
        <div class="serviceGrid" style="margin-top:16px;">
          <a class="serviceCard" href="https://gov.uz/oz/madaniymeros/sections/view/37231" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">▤</div>
            <h3>${lang === "uz" ? "Mehnat shartnomasi namunasi" : lang === "ru" ? "Образец трудового договора" : "Employment contract sample"}</h3>
            <p>${lang === "uz" ? "Gov.uz saytida e’lon qilingan mehnat shartnomasi namunasi." : lang === "ru" ? "Образец трудового договора на Gov.uz." : "Employment contract sample published on Gov.uz."}</p>
          </a>
          <a class="serviceCard" href="https://gov.uz/oz/advice/673/document/3012" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">⌂</div>
            <h3>${lang === "uz" ? "Kasanachi bilan mehnat shartnomasi" : lang === "ru" ? "Договор с надомником" : "Homeworker employment contract"}</h3>
            <p>${lang === "uz" ? "Kasanachilik uchun maxsus shartlar va namunaviy shakl bo‘yicha rasmiy material." : lang === "ru" ? "Официальный материал о специальных условиях договора." : "Official guidance on special contract terms."}</p>
          </a>
          <a class="serviceCard" href="https://my.gov.uz/uz/service/1235" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">✓</div>
            <h3>${lang === "uz" ? "Elektron mehnat shartnomasi" : lang === "ru" ? "Электронный трудовой договор" : "Electronic employment contract"}</h3>
            <p>${lang === "uz" ? "my.gov.uz orqali elektron mehnat shartnomasi xizmatiga o‘ting." : lang === "ru" ? "Перейдите к услуге электронного трудового договора на my.gov.uz." : "Open the electronic employment-contract service on my.gov.uz."}</p>
          </a>
        </div>
      </div>


      <div class="surface surfacePad" style="margin-top:18px;">
        <div class="resultLabel">${lang==="uz"?"MEHNAT SHARTNOMALARI":lang==="ru"?"ТРУДОВЫЕ ДОГОВОРЫ":"EMPLOYMENT CONTRACTS"}</div>
        <h2>${lang==="uz"?"Shartnoma namunalari va AI generator":lang==="ru"?"Шаблоны и AI-генератор договоров":"Contract templates & AI generator"}</h2>
        <p>${lang==="uz"?"Kerakli mehnat shartnomasi turini tanlang. Yetishmayotgan rekvizitlar [TO‘LDIRILADI] deb qoldiriladi.":lang==="ru"?"Выберите нужный тип трудового договора. Недостающие реквизиты будут отмечены.":"Choose the required employment contract type. Missing details will be marked."}</p>
        <form method="POST" action="/employment-result${q(lang)}">
          <input type="hidden" name="result_type" value="contract">
          <div class="formGrid">
            <div class="formGroup"><label>${lang==="uz"?"Shartnoma turi":lang==="ru"?"Тип договора":"Contract type"}</label>
              <select name="issue_type">
                <option value="nomuayyan muddatli">Nomuayyan muddatli</option>
                <option value="muddatli">Muddatli</option>
                <option value="o‘rindoshlik">O‘rindoshlik asosida</option>
                <option value="masofaviy">Masofadan ishlash</option>
                <option value="kasanachilik">Kasanachilik / uyda ishlash</option>
                <option value="mikrofirma">Mikrofirma xodimi</option>
                <option value="YTT xodimi">YTTda ishlovchi xodim</option>
                <option value="rahbar">Tashkilot rahbari</option>
                <option value="mavsumiy">Mavsumiy ish</option>
                <option value="vaqtinchalik">Vaqtinchalik ish</option>
                <option value="boshqa">Boshqa turdagi mehnat shartnomasi</option>
              </select>
            </div>
            <div class="formGroup"><label>${lang==="uz"?"Lavozim / kasb":lang==="ru"?"Должность":"Position"}</label><input name="position"></div>
          </div>
          <div class="formGroup"><label>${lang==="uz"?"Ish beruvchi":lang==="ru"?"Работодатель":"Employer"}</label><input name="employer"></div>
          <div class="formGroup"><label>${lang==="uz"?"Tomonlar va asosiy shartlar":lang==="ru"?"Стороны и основные условия":"Parties and key terms"}</label>
            <textarea name="facts" rows="6" placeholder="${lang==="uz"?"Ish joyi, vazifa, ish haqi, ish vaqti, muddat va boshqa kelishilgan shartlarni yozing...":lang==="ru"?"Укажите место работы, обязанности, зарплату, режим, срок...":"Enter workplace, duties, salary, hours, term and other agreed terms..."}"></textarea>
          </div>
          <button class="btn btnPrimary" type="submit">${lang==="uz"?"Shartnoma namunasini tayyorlash":lang==="ru"?"Подготовить договор":"Prepare contract"}</button>
        </form>
        <div class="formActions" style="margin-top:16px">
          <a class="btn btnOutline" href="https://gov.uz/oz/advice/554/document/2234" target="_blank" rel="noopener noreferrer">${lang==="uz"?"Rasmiy namunaviy shakl":lang==="ru"?"Официальный образец":"Official template"} ↗</a>
          <a class="btn btnOutline" href="https://my.gov.uz/uz/service/1235" target="_blank" rel="noopener noreferrer">${lang==="uz"?"Elektron mehnat shartnomasi":lang==="ru"?"Электронный договор":"Electronic contract"} ↗</a>
        </div>
      </div>

      <div class="surface surfacePad" style="margin-top:18px;">
        <div class="resultLabel">${lang==="uz"?"MEHNAT NIZOLARI BO‘YICHA DA’VOLAR":lang==="ru"?"ИСКИ ПО ТРУДОВЫМ СПОРАМ":"EMPLOYMENT DISPUTE CLAIMS"}</div>
        <h2>${lang==="uz"?"Har qanday mehnat nizosi uchun da’vo arizasi":lang==="ru"?"Иск по любому трудовому спору":"Claim for any employment dispute"}</h2>
        <p>${lang==="uz"?"Nizo turini tanlang yoki “Boshqa mehnat nizosi”ni tanlab o‘zingiz yozing.":lang==="ru"?"Выберите вид спора или опишите другой.":"Choose a dispute type or describe another dispute."}</p>
        <form method="POST" action="/employment-result${q(lang)}">
          <input type="hidden" name="result_type" value="claim">
          <div class="formGrid">
            <div class="formGroup"><label>${lang==="uz"?"Da’vo turi":lang==="ru"?"Вид иска":"Claim type"}</label>
              <select name="issue_type">
                <option value="ishga tiklash">Ishga tiklash</option>
                <option value="bo‘shatish asosini yoki sanasini o‘zgartirish">Bo‘shatish sanasi/asosini o‘zgartirish</option>
                <option value="majburiy progul haqini undirish">Majburiy progul uchun haq undirish</option>
                <option value="ish haqi va boshqa to‘lovlarni undirish">Ish haqi va boshqa to‘lovlarni undirish</option>
                <option value="g‘ayriqonuniy boshqa ishga o‘tkazish">G‘ayriqonuniy boshqa ishga o‘tkazish</option>
                <option value="ishga qabul qilishni noqonuniy rad etish">Ishga qabul qilishni noqonuniy rad etish</option>
                <option value="moddiy zarar">Moddiy zarar undirish</option>
                <option value="ma’naviy zarar">Ma’naviy zarar kompensatsiyasi</option>
                <option value="mehnatda mayib bo‘lish yoki kasb kasalligi">Mehnatda mayib bo‘lish / kasb kasalligi</option>
                <option value="ish vaqti dam olish ta’til">Ish vaqti / dam olish / ta’til</option>
                <option value="intizomiy jazo">Intizomiy jazo</option>
                <option value="mehnat shartlari">Mehnat shartlari / shartnoma nizosi</option>
                <option value="boshqa mehnat nizosi">Boshqa mehnat nizosi</option>
              </select>
            </div>
            <div class="formGroup"><label>${lang==="uz"?"Ish beruvchi":lang==="ru"?"Работодатель":"Employer"}</label><input name="employer"></div>
          </div>
          <div class="formGroup"><label>${lang==="uz"?"Nizo holatlari":lang==="ru"?"Обстоятельства":"Dispute facts"}</label><textarea name="facts" rows="7" required></textarea></div>
          <div class="formGroup"><label>${lang==="uz"?"Dalillar":lang==="ru"?"Доказательства":"Evidence"}</label><textarea name="evidence" rows="4"></textarea></div>
          <button class="btn btnPrimary" type="submit">${lang==="uz"?"Da’vo arizasini tayyorlash":lang==="ru"?"Подготовить иск":"Prepare claim"}</button>
        </form>
        <div class="formActions" style="margin-top:16px">
          <a class="btn btnOutline" href="https://gov.uz/oz/advice/673/document/3031" target="_blank" rel="noopener noreferrer">${lang==="uz"?"Mehnat nizolari — rasmiy":lang==="ru"?"Трудовые споры":"Employment disputes"} ↗</a>
          <a class="btn btnPrimary" href="https://cabinet.sud.uz/" target="_blank" rel="noopener noreferrer">${lang==="uz"?"Sudga elektron topshirish":lang==="ru"?"Подать в суд":"File with court"} ↗</a>
        </div>
      </div>

      <div class="surface surfacePad" style="margin-top:18px;">
        <div class="resultLabel">
          ${lang === "uz" ? "QONUNCHILIK VA O‘QUV MANBALARI" : lang === "ru" ? "ЗАКОНОДАТЕЛЬСТВО И УЧЕБНЫЕ ИСТОЧНИКИ" : "LEGISLATION AND STUDY RESOURCES"}
        </div>
        <div class="serviceGrid" style="margin-top:16px;">
          <a class="serviceCard" href="https://lex.uz/docs/-6257288" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">§</div>
            <h3>${lang === "uz" ? "Mehnat kodeksi — LexUZ" : lang === "ru" ? "Трудовой кодекс — LexUZ" : "Labour Code — LexUZ"}</h3>
            <p>${lang === "uz" ? "Mehnat kodeksining amaldagi rasmiy matnini to‘g‘ridan-to‘g‘ri o‘qing." : lang === "ru" ? "Откройте актуальный официальный текст Трудового кодекса." : "Read the current official Labour Code."}</p>
          </a>
          <a class="serviceCard" href="https://gov.uz/oz/advice/673/document/2915" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">i</div>
            <h3>${lang === "uz" ? "Mehnat shartnomasi bo‘yicha qo‘llanma" : lang === "ru" ? "Руководство по трудовому договору" : "Employment-contract guide"}</h3>
            <p>${lang === "uz" ? "Shartnoma mazmuni, shakli, muddati va asosiy talablar." : lang === "ru" ? "Содержание, форма, срок и основные требования." : "Content, form, term and core requirements."}</p>
          </a>
          <a class="serviceCard" href="https://gov.uz/oz/advice/554/document/2253" target="_blank" rel="noopener noreferrer">
            <div class="serviceIcon">J</div>
            <h3>${lang === "uz" ? "Jamoa shartnomasi" : lang === "ru" ? "Коллективный договор" : "Collective agreement"}</h3>
            <p>${lang === "uz" ? "Jamoa shartnomasi va uning mazmuni bo‘yicha rasmiy material." : lang === "ru" ? "Официальный материал о коллективном договоре." : "Official material on collective agreements."}</p>
          </a>
        </div>
      </div>
    `,
    t.title,
    t.description
  );
}


async function employmentResultPage(lang, form = {}) {

  lang = getLang(lang);

  const resultType = String(form.result_type || "");
  const wantsClaim = resultType === "claim";
  const wantsContract = resultType === "contract";

  const labels = {
    uz: {
      title: wantsContract ? "Mehnat shartnomasi namunasi" : (wantsClaim ? "Mehnat nizosi bo‘yicha da’vo arizasi loyihasi" : "Mehnat nizosi bo‘yicha huquqiy xulosa"),
      description: "Siz kiritgan ma’lumotlar asosida tayyorlangan dastlabki natija.",
      back: "Ma’lumotlarni o‘zgartirish",
      instructionConclusion: `O‘zbekiston mehnat qonunchiligi bo‘yicha professional huquqiy xulosa tayyorlang.
Faktlarni alohida, huquqiy masalalarni alohida ko‘rsating.
Amaldagi Mehnat kodeksiga tayangan holda huquqiy imkoniyatlar va keyingi qadamlarni tushuntiring.
Modda raqamiga ishonchingiz komil bo‘lmasa uni o‘ylab topmang va rasmiy LexUZ matnini tekshirish zarurligini ayting.
Yetishmayotgan faktlarni taxmin qilmang.`,
      instructionClaim: `O‘zbekiston mehnat qonunchiligi bo‘yicha sudga taqdim etish uchun dastlabki da’vo arizasi loyihasini tayyorlang.
Rasmiy uslubdan foydalaning.
Sud, taraflar yoki boshqa rekvizitlar yetishmasa [TO‘LDIRILADI] deb belgilang.
Faktlarni o‘ylab topmang.
Talablar, ish holatlari, huquqiy asos va ilovalar bo‘limlarini ajrating.
Modda raqamiga ishonchingiz komil bo‘lmasa uni o‘ylab topmang va amaldagi LexUZ matnini tekshirish kerakligini ko‘rsating.`
    },
    ru: {
      title: wantsContract ? "Проект трудового договора" : (wantsClaim ? "Проект иска по трудовому спору" : "Правовое заключение по трудовому спору"),
      description: "Предварительный результат на основе введённых данных.",
      back: "Изменить данные",
      instructionConclusion: `Подготовьте профессиональное правовое заключение по трудовому законодательству Узбекистана. Отделите факты от правовых вопросов, объясните возможные правовые варианты и дальнейшие шаги. Не придумывайте номера статей и отсутствующие факты; при необходимости укажите на необходимость проверки актуального текста на LexUZ.`,
      instructionClaim: `Подготовьте первоначальный проект искового заявления по трудовому спору в Узбекистане. Используйте официальный стиль. Недостающие реквизиты обозначьте [ЗАПОЛНИТЬ]. Не придумывайте факты или статьи. Отдельно укажите обстоятельства, требования, правовое основание и приложения.`
    },
    en: {
      title: wantsContract ? "Employment contract draft" : (wantsClaim ? "Employment dispute claim draft" : "Employment-law conclusion"),
      description: "Preliminary result based on the information entered.",
      back: "Change information",
      instructionConclusion: `Prepare a professional legal conclusion under Uzbekistan employment law. Separate facts from legal issues, explain possible legal options and next steps. Do not invent statutory article numbers or missing facts; where needed, state that the current LexUZ text should be verified.`,
      instructionClaim: `Prepare an initial court claim draft for an employment dispute in Uzbekistan. Use formal style. Mark missing filing details as [TO BE COMPLETED]. Do not invent facts or statutory provisions. Separate facts, requests, legal basis and attachments.`
    }
  }[lang];

  const contractInstruction = lang === "uz"
    ? `O‘zbekiston mehnat qonunchiligiga mos mehnat shartnomasi loyihasini tayyorlang. Tanlangan shartnoma turiga mos bo‘limlarni kiriting: taraflar, ish joyi va mehnat vazifasi, ish boshlanishi va muddat, ish haqi, ish vaqti va dam olish, huquq va majburiyatlar, mehnatni muhofaza qilish, javobgarlik, shartnomani o‘zgartirish va bekor qilish, yakuniy qoidalar, rekvizit va imzolar. Yetishmayotgan har qanday shaxsiy yoki faktik ma’lumotni [TO‘LDIRILADI] deb belgilang. Fakt, modda, summa yoki rekvizitni o‘ylab topmang.`
    : lang === "ru"
    ? `Подготовьте проект трудового договора по законодательству Узбекистана с необходимыми разделами. Все отсутствующие фактические данные обозначьте [ЗАПОЛНИТЬ]. Не придумывайте факты, суммы, реквизиты или статьи.`
    : `Prepare an Uzbekistan employment contract draft with the necessary sections. Mark every missing factual detail [TO BE COMPLETED]. Do not invent facts, amounts, identifiers or statutory provisions.`;

  const context = `
ISSUE TYPE: ${String(form.issue_type || "")}
EMPLOYER: ${String(form.employer || "")}
POSITION: ${String(form.position || "")}
EMPLOYMENT START: ${String(form.employment_start || "")}
EMPLOYMENT END: ${String(form.employment_end || "")}
ORDER / CONTRACT INFO: ${String(form.order_info || "")}
FACTS: ${String(form.facts || "")}
EVIDENCE: ${String(form.evidence || "")}
REQUESTED OUTPUT: ${wantsContract ? "EMPLOYMENT CONTRACT DRAFT" : (wantsClaim ? "CLAIM DRAFT" : "LEGAL CONCLUSION")}
  `.trim();

  let answer = "";

  try {
    answer = await callAI(
      wantsContract ? contractInstruction : (wantsClaim ? labels.instructionClaim : labels.instructionConclusion),
      lang,
      context
    );
  } catch (error) {
    console.error("EMPLOYMENT AI ERROR:", error);
    answer =
      lang === "uz"
        ? "Mehnat huquqi bo‘yicha natijani yaratishda xatolik yuz berdi. OPENROUTER_API_KEY sozlamasini tekshiring."
        : lang === "ru"
        ? "Не удалось сформировать результат. Проверьте OPENROUTER_API_KEY."
        : "The result could not be generated. Check OPENROUTER_API_KEY.";
  }

  return appLayout(
    lang,
    "employment",
    `
      <div class="resultBox">
        <div class="resultLabel">HUQUQIY AI • EMPLOYMENT</div>
        ${esc(answer)}
      </div>

      <div class="formActions">
        <a class="btn btnOutline" href="/employment${q(lang)}">← ${esc(labels.back)}</a>
        ${(wantsClaim || wantsContract) ? `<a class="btn btnPrimary" href="/employment${q(lang)}">↺ ${esc(labels.back)}</a>` : ""}
      </div>
    `,
    labels.title,
    labels.description
  );
}


// ======================================================
// CALCULATORS PAGE
// ======================================================

function calculatorsPage(lang) {

  lang = getLang(lang);

  const t = {
    uz: {
      title: "Aliment va huquqiy hisob-kitoblar",
      description: "Farzandlar soni va oylik daromad asosida alimentning dastlabki hisobini ko‘ring.",
      aliment: "Aliment hisoblash",
      alimentText: "Savollarga javob bering. Hisob O‘zbekiston Respublikasi Oila kodeksining 99-moddasidagi umumiy ulushlar asosida ko‘rsatiladi.",
      children: "Voyaga yetmagan farzandlar soni",
      income: "Aliment to‘lovchining oylik ish haqi va (yoki) boshqa daromadi",
      incomeStatus: "Daromad holati",
      official: "Rasmiy va barqaror daromad",
      variable: "O‘zgaruvchan yoki to‘liq tasdiqlanmagan daromad",
      agreement: "Aliment bo‘yicha kelishuv mavjudmi?",
      no: "Yo‘q",
      yes: "Ha",
      calculate: "Hisoblash",
      result: "Dastlabki hisob",
      legal: "Huquqiy asos",
      legalText: "Oila kodeksi 99-moddasi: kelishuv bo‘lmasa, odatda bir bola uchun daromadning 1/4 qismi, ikki bola uchun 1/3 qismi, uch va undan ortiq bola uchun 1/2 qismi undiriladi. Sud taraflarning moddiy yoki oilaviy ahvoli va boshqa e’tiborga loyiq holatlarni hisobga olib miqdorni kamaytirishi yoki ko‘paytirishi mumkin.",
      minText: "Shuningdek, har bir bola uchun qonunda belgilangan eng kam miqdor talabi mavjud. Aniq yakuniy miqdor uchun amaldagi MHEKM va ish holatini tekshirish kerak.",
      property: "Mol-mulk ulushi",
      propertyText: "Mol-mulk qiymatidan matematik ulushni hisoblash uchun yordamchi vosita.",
      value: "Mol-mulk qiymati",
      share: "Ulush (%)",
      warning: "Natija dastlabki ma’lumot uchun. Alimentning yakuniy miqdori sud hujjati, notarial kelishuv va ishning aniq holatlariga bog‘liq."
    },
    ru: {
      title: "Алименты и юридические расчёты",
      description: "Получите предварительный расчёт алиментов по количеству детей и ежемесячному доходу.",
      aliment: "Расчёт алиментов",
      alimentText: "Ответьте на вопросы. Расчёт основан на общих долях, предусмотренных статьёй 99 Семейного кодекса Республики Узбекистан.",
      children: "Количество несовершеннолетних детей",
      income: "Ежемесячная заработная плата и (или) иной доход плательщика",
      incomeStatus: "Характер дохода",
      official: "Официальный и стабильный доход",
      variable: "Переменный или не полностью подтверждённый доход",
      agreement: "Есть соглашение об алиментах?",
      no: "Нет",
      yes: "Да",
      calculate: "Рассчитать",
      result: "Предварительный расчёт",
      legal: "Правовое основание",
      legalText: "Статья 99 Семейного кодекса: при отсутствии соглашения обычно взыскивается 1/4 дохода на одного ребёнка, 1/3 — на двух, 1/2 — на трёх и более детей. Суд может уменьшить или увеличить размер с учётом материального и семейного положения и иных заслуживающих внимания обстоятельств.",
      minText: "Закон также предусматривает минимальный размер на каждого ребёнка. Для точного итогового расчёта необходимо проверить действующий МРОТ/МРЗП и обстоятельства дела.",
      property: "Доля имущества",
      propertyText: "Вспомогательный математический расчёт доли от стоимости имущества.",
      value: "Стоимость имущества",
      share: "Доля (%)",
      warning: "Результат носит предварительный характер. Окончательный размер зависит от судебного акта, нотариального соглашения и конкретных обстоятельств."
    },
    en: {
      title: "Child support and legal calculations",
      description: "See a preliminary child-support calculation based on the number of children and monthly income.",
      aliment: "Child-support calculation",
      alimentText: "Answer the questions. The calculation uses the general shares in Article 99 of the Family Code of Uzbekistan.",
      children: "Number of minor children",
      income: "Payer's monthly salary and/or other income",
      incomeStatus: "Income status",
      official: "Official and stable income",
      variable: "Variable or not fully documented income",
      agreement: "Is there a child-support agreement?",
      no: "No",
      yes: "Yes",
      calculate: "Calculate",
      result: "Preliminary calculation",
      legal: "Legal basis",
      legalText: "Family Code Article 99: where there is no agreement, the general shares are 1/4 of income for one child, 1/3 for two children, and 1/2 for three or more children. A court may decrease or increase the amount considering the parties' financial or family circumstances and other relevant factors.",
      minText: "The law also provides a minimum amount per child. The current statutory minimum and case facts should be checked for a final figure.",
      property: "Property share",
      propertyText: "A supporting mathematical tool for calculating a percentage share of property value.",
      value: "Property value",
      share: "Share (%)",
      warning: "This is a preliminary result. The final amount depends on the court order, notarized agreement and specific circumstances."
    }
  }[lang];

  return appLayout(
    lang,
    "calculators",
    `
      <div class="notice noticeGold">
        <span class="noticeIcon">!</span>
        <span>${esc(t.warning)}</span>
      </div>

      <div class="calculatorGrid">

        <section class="calcCard">
          <h3>${esc(t.aliment)}</h3>
          <p>${esc(t.alimentText)}</p>

          <div class="formGroup">
            <label>${esc(t.children)}</label>
            <input id="childrenCount" type="number" min="1" step="1" value="1">
          </div>

          <div class="formGroup" style="margin-top:12px;">
            <label>${esc(t.income)}</label>
            <input id="alimentIncome" type="number" min="0" step="any" placeholder="0">
          </div>

          <div class="formGroup" style="margin-top:12px;">
            <label>${esc(t.incomeStatus)}</label>
            <select id="incomeStatus">
              <option value="official">${esc(t.official)}</option>
              <option value="variable">${esc(t.variable)}</option>
            </select>
          </div>

          <div class="formGroup" style="margin-top:12px;">
            <label>${esc(t.agreement)}</label>
            <select id="alimentAgreement">
              <option value="no">${esc(t.no)}</option>
              <option value="yes">${esc(t.yes)}</option>
            </select>
          </div>

          <button type="button" class="btn btnPrimary" style="margin-top:15px;" onclick="calculateAliment()">
            ∑ ${esc(t.calculate)}
          </button>

          <div id="alimentResult" class="calcResult">${esc(t.result)}: —</div>

          <div class="notice noticeGold" style="margin-top:16px;">
            <span class="noticeIcon">§</span>
            <span><strong>${esc(t.legal)}.</strong> ${esc(t.legalText)} ${esc(t.minText)}</span>
          </div>
        </section>

        <section class="calcCard">
          <h3>${esc(t.property)}</h3>
          <p>
            ${lang === "uz"
              ? "Mol-mulkning huquqiy maqomini savol-javob orqali aniqlang. Natija Oila kodeksining 23, 25, 27 va 28-moddalariga tayangan dastlabki tahlildir."
              : lang === "ru"
              ? "Определите правовой режим имущества через вопросы. Предварительный анализ опирается на статьи 23, 25, 27 и 28 Семейного кодекса."
              : "Assess the legal status of property through questions. The preliminary analysis is based on Articles 23, 25, 27 and 28 of the Family Code."}
          </p>

          <div class="formGroup">
            <label>${lang === "uz" ? "Mol-mulk turi" : lang === "ru" ? "Вид имущества" : "Property type"}</label>
            <select id="propertyType">
              <option value="home">${lang === "uz" ? "Uy / kvartira" : lang === "ru" ? "Дом / квартира" : "House / apartment"}</option>
              <option value="car">${lang === "uz" ? "Avtomobil" : lang === "ru" ? "Автомобиль" : "Vehicle"}</option>
              <option value="business">${lang === "uz" ? "Biznes / ulush" : lang === "ru" ? "Бизнес / доля" : "Business / share"}</option>
              <option value="other">${lang === "uz" ? "Boshqa mol-mulk" : lang === "ru" ? "Другое имущество" : "Other property"}</option>
            </select>
          </div>

          <div class="formGroup" style="margin-top:12px;">
            <label>${lang === "uz" ? "Mol-mulk qiymati" : lang === "ru" ? "Стоимость имущества" : "Property value"}</label>
            <input id="propertyValue" type="number" min="0" step="any" placeholder="0">
          </div>

          <div class="formGroup" style="margin-top:12px;">
            <label>${lang === "uz" ? "Mol-mulk qachon olingan?" : lang === "ru" ? "Когда приобретено имущество?" : "When was it acquired?"}</label>
            <select id="propertyWhen">
              <option value="marriage">${lang === "uz" ? "Nikoh davomida" : lang === "ru" ? "Во время брака" : "During marriage"}</option>
              <option value="before">${lang === "uz" ? "Nikohdan oldin" : lang === "ru" ? "До брака" : "Before marriage"}</option>
              <option value="separate">${lang === "uz" ? "Oilaviy munosabatlar tugagach, alohida yashash davrida" : lang === "ru" ? "После прекращения семейных отношений, при раздельном проживании" : "After family relations ended, while living separately"}</option>
            </select>
          </div>

          <div class="formGroup" style="margin-top:12px;">
            <label>${lang === "uz" ? "Hadya, meros yoki boshqa bepul bitim orqali olinganmi?" : lang === "ru" ? "Получено в дар, по наследству или иной безвозмездной сделке?" : "Was it received by gift, inheritance or another gratuitous transaction?"}</label>
            <select id="propertyGift">
              <option value="no">${lang === "uz" ? "Yo‘q" : lang === "ru" ? "Нет" : "No"}</option>
              <option value="yes">${lang === "uz" ? "Ha" : lang === "ru" ? "Да" : "Yes"}</option>
            </select>
          </div>

          <div class="formGroup" style="margin-top:12px;">
            <label>${lang === "uz" ? "Nikoh shartnomasi bormi?" : lang === "ru" ? "Есть брачный договор?" : "Is there a marriage contract?"}</label>
            <select id="propertyPrenup">
              <option value="no">${lang === "uz" ? "Yo‘q" : lang === "ru" ? "Нет" : "No"}</option>
              <option value="yes">${lang === "uz" ? "Ha" : lang === "ru" ? "Да" : "Yes"}</option>
            </select>
          </div>

          <div class="formGroup" style="margin-top:12px;">
            <label>${lang === "uz" ? "Mol-mulk qiymatini sezilarli oshirgan umumiy mablag‘ yoki kapital ta’mir bo‘lganmi?" : lang === "ru" ? "Были общие вложения или капитальный ремонт, существенно увеличившие стоимость?" : "Were there common investments or major renovations that substantially increased value?"}</label>
            <select id="propertyInvestment">
              <option value="no">${lang === "uz" ? "Yo‘q / aniq emas" : lang === "ru" ? "Нет / неизвестно" : "No / unknown"}</option>
              <option value="yes">${lang === "uz" ? "Ha" : lang === "ru" ? "Да" : "Yes"}</option>
            </select>
          </div>

          <button type="button" class="btn btnPrimary" style="margin-top:15px;" onclick="analyzeProperty()">
            § ${lang === "uz" ? "Huquqiy tahlil" : lang === "ru" ? "Правовой анализ" : "Legal analysis"}
          </button>

          <div id="propertyResult" class="calcResult" style="white-space:pre-line;">
            ${lang === "uz" ? "Natija: —" : lang === "ru" ? "Результат: —" : "Result: —"}
          </div>

          <div class="formActions" style="margin-top:12px;">
            <a class="btn btnOutline" href="/claim${q(lang)}&type=property_claim">
              ▤ ${lang === "uz" ? "Mol-mulk bo‘yicha da’vo tayyorlash" : lang === "ru" ? "Подготовить иск о разделе имущества" : "Prepare a property claim"}
            </a>
          </div>

          <div class="notice noticeGold" style="margin-top:16px;">
            <span class="noticeIcon">§</span>
            <span>
              ${lang === "uz"
                ? "Huquqiy asos: Oila kodeksi 23-modda — umumiy mulk; 25-modda — har bir er-xotinning alohida mulki va qiymat sezilarli oshirilgan holatlar; 27-modda — umumiy mol-mulkni bo‘lish; 28-modda — ulushlar, odatda teng, lekin qonunda nazarda tutilgan holatlarda sud tenglikdan chekinishi mumkin."
                : lang === "ru"
                ? "Правовая основа: статьи 23, 25, 27 и 28 Семейного кодекса — общее имущество, личное имущество, раздел и определение долей."
                : "Legal basis: Family Code Articles 23, 25, 27 and 28 on common property, separate property, division and determination of shares."}
            </span>
          </div>
        </section>

      </div>

      <script>
        function formatNumber(value){
          if(!Number.isFinite(value)){ return "0"; }
          return new Intl.NumberFormat(
            "${lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uz-UZ"}",
            { maximumFractionDigits:2 }
          ).format(value);
        }

        function calculateAliment(){
          const children = Math.max(1, Number(document.getElementById("childrenCount").value || 1));
          const income = Math.max(0, Number(document.getElementById("alimentIncome").value || 0));
          const status = document.getElementById("incomeStatus").value;
          const agreement = document.getElementById("alimentAgreement").value;

          let share = children === 1 ? 0.25 : children === 2 ? (1/3) : 0.50;
          const result = income * share;
          const percent = share * 100;

          let extra = "";
          if(status === "variable"){
            extra += " ${lang === "uz" ? "Daromad o‘zgaruvchan bo‘lsa, aniq undirish tartibi ish holatiga qarab alohida baholanishi kerak." : lang === "ru" ? "При переменном доходе порядок взыскания требует отдельной оценки обстоятельств дела." : "Where income is variable, the method of recovery requires separate assessment of the case."}";
          }
          if(agreement === "yes"){
            extra += " ${lang === "uz" ? "Aliment bo‘yicha mavjud kelishuv shartlari ham tekshirilishi kerak." : lang === "ru" ? "Также необходимо проверить условия существующего соглашения об алиментах." : "The terms of any existing child-support agreement should also be checked."}";
          }

          document.getElementById("alimentResult").textContent =
            "${t.result}: " + formatNumber(result) +
            " (${lang === "uz" ? "daromadning" : lang === "ru" ? "от дохода" : "of income"} " +
            formatNumber(percent) + "%)." + extra;
        }

        function analyzeProperty(){
          const value = Math.max(0, Number(document.getElementById("propertyValue").value || 0));
          const when = document.getElementById("propertyWhen").value;
          const gift = document.getElementById("propertyGift").value;
          const prenup = document.getElementById("propertyPrenup").value;
          const investment = document.getElementById("propertyInvestment").value;

          let status = "";
          let article = "";
          let shareText = "";

          if(prenup === "yes"){
            status = "${lang === "uz" ? "Nikoh shartnomasi mavjud. Mol-mulk rejimi va ulushlar avvalo uning amaldagi shartlari bilan birga tekshirilishi kerak." : lang === "ru" ? "Имеется брачный договор. Режим имущества и доли необходимо оценивать с учётом его действующих условий." : "A marriage contract exists. Property status and shares should first be assessed together with its applicable terms."}";
            article = "${lang === "uz" ? "Oila kodeksi 29–31-moddalari ham tekshiriladi." : lang === "ru" ? "Следует также проверить статьи 29–31 Семейного кодекса." : "Family Code Articles 29–31 should also be checked."}";
          } else if(gift === "yes"){
            status = "${lang === "uz" ? "Hadya, meros yoki boshqa bepul bitim orqali olingan mol-mulk, odatda, uni olgan er yoki xotinning o‘z mulki hisoblanadi." : lang === "ru" ? "Имущество, полученное в дар, по наследству или иной безвозмездной сделке, как правило, является личным имуществом супруга." : "Property received by gift, inheritance or another gratuitous transaction is generally separate property of the receiving spouse."}";
            article = "${lang === "uz" ? "Huquqiy asos: Oila kodeksi 25-modda." : lang === "ru" ? "Правовая основа: статья 25 Семейного кодекса." : "Legal basis: Family Code Article 25."}";
          } else if(when === "before"){
            status = "${lang === "uz" ? "Nikohdan oldin tegishli bo‘lgan mol-mulk, odatda, o‘sha shaxsning o‘z mulki hisoblanadi." : lang === "ru" ? "Имущество, принадлежавшее супругу до брака, как правило, является его личным имуществом." : "Property owned before marriage is generally separate property."}";
            article = "${lang === "uz" ? "Huquqiy asos: Oila kodeksi 25-modda." : lang === "ru" ? "Правовая основа: статья 25 Семейного кодекса." : "Legal basis: Family Code Article 25."}";
          } else if(when === "separate"){
            status = "${lang === "uz" ? "Oilaviy munosabatlar tugab, er-xotin alohida yashagan davrda olingan mol-mulkni sud ayrim holatlarda har birining o‘z mulki deb topishi mumkin." : lang === "ru" ? "Имущество, приобретённое после прекращения семейных отношений при раздельном проживании, суд в отдельных случаях может признать личным." : "A court may in some circumstances treat property acquired while spouses lived separately after family relations ended as separate property."}";
            article = "${lang === "uz" ? "Huquqiy asos: Oila kodeksi 27-modda." : lang === "ru" ? "Правовая основа: статья 27 Семейного кодекса." : "Legal basis: Family Code Article 27."}";
          } else {
            status = "${lang === "uz" ? "Nikoh davomida orttirilgan mol-mulk, qoida tariqasida, er-xotinning birgalikdagi umumiy mulki hisoblanadi; kimning nomiga rasmiylashtirilgani o‘zi hal qiluvchi emas." : lang === "ru" ? "Имущество, приобретённое во время брака, как правило, является общей совместной собственностью супругов; само по себе оформление на одного из супругов не является решающим." : "Property acquired during marriage is generally common marital property; registration in one spouse's name alone is not decisive."}";
            article = "${lang === "uz" ? "Huquqiy asos: Oila kodeksi 23-modda." : lang === "ru" ? "Правовая основа: статья 23 Семейного кодекса." : "Legal basis: Family Code Article 23."}";
            if(value > 0){
              shareText = "\\n${lang === "uz" ? "Teng ulush boshlang‘ich hisobida har bir tomon uchun: " : lang === "ru" ? "При исходном равенстве долей каждому: " : "At an initial equal-share calculation, each side: "}" + formatNumber(value / 2) + ".";
            }
          }

          if(investment === "yes" && (when === "before" || gift === "yes")){
            status += " ${lang === "uz" ? "Biroq nikoh davomida umumiy mablag‘ yoki mehnat hisobiga mol-mulk qiymati ancha oshgan bo‘lsa, u birgalikdagi mulk deb topilishi mumkin." : lang === "ru" ? "Однако если во время брака за счёт общих средств или труда стоимость имущества существенно увеличилась, оно может быть признано совместным." : "However, if common funds or labor during marriage substantially increased its value, it may be recognized as common property."}";
            article += " ${lang === "uz" ? "Bu holat ham 25-modda doirasida baholanadi." : lang === "ru" ? "Это также оценивается по статье 25." : "This is also assessed under Article 25."}";
          }

          if(when === "marriage" && prenup !== "yes" && gift !== "yes"){
            shareText += "\\n${lang === "uz" ? "Ulushlar, odatda, teng deb hisoblanadi, ammo 28-modda bo‘yicha sud ayrim e’tiborga loyiq holatlarda tenglikdan chekinishi mumkin." : lang === "ru" ? "Доли, как правило, признаются равными, однако по статье 28 суд в предусмотренных случаях может отступить от равенства." : "Shares are generally presumed equal, but Article 28 permits a court to depart from equality in specified circumstances."}";
          }

          document.getElementById("propertyResult").textContent =
            "${lang === "uz" ? "Dastlabki huquqiy baho:" : lang === "ru" ? "Предварительная правовая оценка:" : "Preliminary legal assessment:"} " +
            status + "\\n" + article + shareText;
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
        "Da’vo arizasini tayyorlash",

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
        "Подготовить иск",

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
        "Prepare claim",

      official:
        "Open court system"

    }

  }[lang];



// ======================================================
// DAVLAT ORGANLARI — SERVER TOMONIDA
// ======================================================
          // ======================================================
// DAVLAT ORGANLARI MA'LUMOTLARI
// BU BLOK internalAffairsCards DAN OLDIN TURISHI SHART
// ======================================================

const STATE_ORGANIZATIONS = [

  // ====================================================
  // OLIY SUD
  // ====================================================

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


  // ====================================================
  // TOSHKENT SHAHAR SUDI
  // ====================================================

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


  // ====================================================
  // QOLGAN JINOYAT SUDLARI
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
        .replace(/[‘’']/g, "")
        .replace(/\s+/g, "-") +
      "-criminal",

    category: "court",
    type: "criminal",
    region: "Toshkent shahri",
    district,

    name:
      `Jinoyat ishlari bo‘yicha ${district} tuman sudi`,

    phone: null,

    verification:
      "Telefon raqami rasmiy manbadan yangilanmoqda"
  })),


  // ====================================================
  // SUD DEPARTAMENTI
  // ====================================================

  {
    id: "court-department-tashkent",
    category: "court_department",
    region: "Toshkent shahri",
    district: "Yakkasaroy",
    name:
      "Oliy sud huzuridagi Sudlar faoliyatini ta’minlash departamentining Toshkent shahar hududiy bo‘limi",
    address: "Shota Rustaveli ko‘chasi, 62-uy",
    phone: "+998 55 501-00-04",
    extension: "03142",
    source: "sud.uz"
  },


  // ====================================================
  // TOSHKENT SHAHAR IIBB
  // ====================================================

  {
    id: "tashkent-iibb",
    category: "internal_affairs",
    type: "regional",
    region: "Toshkent shahri",
    district: "Toshkent shahri",
    name: "Toshkent shahar Ichki ishlar bosh boshqarmasi",
    address: "S. Azimov ko‘chasi, 87-uy",
    phone: "+998 71 206-41-65",
    appealsPhone: "+998 71 206-43-34",
    emergencyPhone: "102",
    hotline: "1102",
    source: "iibb.uz"
  },


  // ====================================================
  // ICHKI ISHLAR TEZKOR / ISHONCH RAQAMLARI
  // ====================================================

  {
    id: "police-emergency-102",
    category: "internal_affairs",
    type: "emergency",
    region: "O‘zbekiston",
    district: "O‘zbekiston",
    name: "Ichki ishlar organlari tezkor va ishonch telefonlari",
    phone: "102",
    emergencyPhone: "102",
    hotline: "1102",
    description:
      "Huquqbuzarlik, jinoyat yoki tezkor ichki ishlar yordami zarur bo‘lgan holatlar uchun.",
    source: "iibb.uz"
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
        .replace(/[‘’']/g, "")
        .replace(/\s+/g, "-") +
      "-iio-fmb",

    category: "internal_affairs",
    type: "district",

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

 const courtCards =
  TASHKENT_COURTS
    .map(court => {

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
          (court.district || "") +
          " " +
          (court.type || "") +
          " " +
          (court.keywords || "")
        )
          .toLowerCase()
          .replace(/"/g, "&quot;");

      return `

        <article
          class="courtCard"
          data-type="${esc(court.type || "court")}"
          data-search="${esc(searchable)}"
          data-name="${esc(name)}"
          data-district="${esc(court.district || "")}"
          data-map="${esc(mapsUrl)}"
        >

          <div class="courtCardTop">

            <span class="courtType">
              ⚖ SUD
            </span>

            <span class="courtDistrict">
              ${esc(court.district || "Toshkent")}
            </span>

          </div>

          <h3>
            ${esc(name)}
          </h3>

          ${
            court.address
              ? `
                <p>
                  📍 ${esc(court.address)}
                </p>
              `
              : ""
          }

          ${
            court.phone
              ? `
                <p>
                  ☎
                  <a href="tel:${esc(court.phone.replace(/\s/g, ""))}">
                    ${esc(court.phone)}
                  </a>
                </p>
              `
              : ""
          }

          <div class="courtCardActions">

            <button
              type="button"
              class="courtMapButton"
              data-map="${esc(mapsUrl)}"
              data-name="${esc(name)}"
              onclick="showCourtMap(this)"
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

    })
    .join("");


// ======================================================
// ICHKI ISHLAR KARTALARI
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
        "Toshkent shahri";

      const address =
        organization.address || "";

      const phone =
        organization.phone ||
        organization.localPhone ||
        "";

      const appealsPhone =
        organization.appealsPhone ||
        "";

      const emergencyPhone =
        organization.emergencyPhone ||
        "102";

      const hotline =
        organization.hotline ||
        "1102";

      const touristPhone =
        organization.touristPhone ||
        "";

      const mapsUrl =
        googleMapsSearch(
          name,
          district
        );

      const directionUrl =
        googleMapsDirections(
          name,
          district
        );

      const searchable =
        (
          name +
          " " +
          district +
          " " +
          address +
          " ichki ishlar iib iio fmb 102 1102"
        )
          .toLowerCase()
          .replace(/"/g, "&quot;");

      return `

        <article
          class="courtCard"
          data-type="internal_affairs"
          data-search="${esc(searchable)}"
          data-name="${esc(name)}"
          data-district="${esc(district)}"
          data-map="${esc(mapsUrl)}"
        >

          <div class="courtCardTop">

            <span class="courtType">
              👮 ICHKI ISHLAR
            </span>

            <span class="courtDistrict">
              ${esc(district)}
            </span>

          </div>


          <h3>
            ${esc(name)}
          </h3>


          ${
            address
              ? `
                <p>
                  📍
                  <strong>Manzil:</strong>
                  ${esc(address)}
                </p>
              `
              : ""
          }


          ${
            phone
              ? `
                <p>
                  ☎
                  <strong>Telefon:</strong>

                  <a
                    href="tel:${esc(phone.replace(/\s/g, ""))}"
                  >
                    ${esc(phone)}
                  </a>
                </p>
              `
              : ""
          }


          ${
            appealsPhone
              ? `
                <p>
                  ☎
                  <strong>Murojaatlar:</strong>

                  <a
                    href="tel:${esc(appealsPhone.replace(/\s/g, ""))}"
                  >
                    ${esc(appealsPhone)}
                  </a>
                </p>
              `
              : ""
          }


          <p>
            🚨
            <strong>Tezkor raqam:</strong>

            <a href="tel:${esc(emergencyPhone)}">
              ${esc(emergencyPhone)}
            </a>
          </p>


          <p>
            ☎
            <strong>Ishonch telefoni:</strong>

            <a href="tel:${esc(hotline)}">
              ${esc(hotline)}
            </a>
          </p>


          ${
            touristPhone
              ? `
                <p>
                  🌐
                  <strong>Turistlar uchun:</strong>

                  <a href="tel:${esc(touristPhone)}">
                    ${esc(touristPhone)}
                  </a>
                </p>
              `
              : ""
          }


          <div class="courtCardActions">

            <button
              type="button"
              class="courtMapButton"
              data-map="${esc(mapsUrl)}"
              data-name="${esc(name)}"
              onclick="showCourtMap(this)"
            >
              📍 Xaritada ko‘rish
            </button>


            <a
              class="courtMapButton primary"
              href="${directionUrl}"
              target="_blank"
              rel="noopener noreferrer"
            >
              🧭 Yo‘nalish
            </a>

          </div>

        </article>

      `;

    })
    .join("");



// ======================================================
// MIB — MAJBURIY IJRO BYUROSI (ALOHIDA BO'LIM)
// ======================================================
const MIB_ORGANIZATIONS = [
  "MIB Toshkent shahar boshqarmasi",
  "MIB Bektemir tuman bo‘limi",
  "MIB Chilonzor tuman bo‘limi",
  "MIB Mirobod tuman bo‘limi",
  "MIB Mirzo Ulug‘bek tuman bo‘limi",
  "MIB Olmazor tuman bo‘limi",
  "MIB Sergeli tuman bo‘limi",
  "MIB Shayxontohur tuman bo‘limi",
  "MIB Uchtepa tuman bo‘limi",
  "MIB Yakkasaroy tuman bo‘limi",
  "MIB Yashnobod tuman bo‘limi",
  "MIB Yunusobod tuman bo‘limi",
  "MIB Yangihayot tuman bo‘limi"
];

const mibCards = MIB_ORGANIZATIONS.map(name => {
  const mapsUrl = googleMapsSearch(name + ", Tashkent, Uzbekistan");
  const directionUrl = googleMapsDirections(name + ", Tashkent, Uzbekistan");
  const searchable = (name + " MIB majburiy ijro byurosi ijro aliment qarzdorlik").toLowerCase();

  return `
    <article
      class="courtCard premiumAgencyCard"
      data-type="mib"
      data-category="mib"
      data-search="${esc(searchable)}"
      data-name="${esc(name)}"
      data-district="Toshkent"
      data-map="${esc(mapsUrl)}"
    >
      <div class="courtCardTop">
        <span class="courtType">⚡ MIB</span>
        <span class="courtDistrict">Toshkent</span>
      </div>
      <h3>${esc(name)}</h3>
      <p>Ijro hujjatlari, aliment, qarzdorlik va majburiy ijro masalalari bo‘yicha hududiy bo‘lim.</p>
      <div class="courtCardActions">
        <button type="button" class="courtMapButton" data-map="${esc(mapsUrl)}"
          data-name="${esc(name)}" onclick="showCourtMap(this)">📍 Xaritada ko‘rish</button>
        <a class="courtMapButton primary" href="${directionUrl}" target="_blank"
          rel="noopener noreferrer">🧭 Yo‘nalish</a>
      </div>
    </article>
  `;
}).join("");

// SUD + ICHKI ISHLAR
const cards =
  courtCards +
  internalAffairsCards +
  mibCards;


  const initialMap =
    "https://www.google.com/maps?q=" +
    encodeURIComponent(
      "Toshkent shahar sudlari, Tashkent, Uzbekistan"
    ) +
    "&output=embed";


  const content = `

    <style>
      ${COURT_CSS}

      .agencySection{
        margin:18px 0 28px;
        padding:18px;
        border:1px solid rgba(255,255,255,.10);
        border-radius:24px;
        background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025));
        box-shadow:0 18px 50px rgba(0,0,0,.16);
        backdrop-filter:blur(14px);
      }
      .agencySectionTitle{
        display:flex;
        align-items:center;
        gap:14px;
        margin-bottom:16px;
        padding:14px 16px;
        border-radius:18px;
        background:rgba(255,255,255,.055);
        border:1px solid rgba(255,255,255,.08);
      }
      .agencySectionTitle strong{display:block;font-size:15px;letter-spacing:.08em}
      .agencySectionTitle small{display:block;margin-top:4px;opacity:.72;line-height:1.4}
      .agencySectionIcon{
        width:46px;height:46px;display:grid;place-items:center;border-radius:15px;
        background:rgba(255,255,255,.09);font-size:21px;flex:0 0 auto;
      }
      .agencyCards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
      .agencyMibSection{box-shadow:0 18px 55px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.08)}
      .premiumAgencyCard{position:relative;overflow:hidden}
      .premiumAgencyCard:before{
        content:"";position:absolute;inset:0 0 auto 0;height:2px;
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.65),transparent);
      }
      @media(max-width:800px){.agencyCards{grid-template-columns:1fr}.agencySection{padding:12px}}
    
/* PREMIUM LEGALTECH UI */
body{background:radial-gradient(circle at 90% 2%,rgba(185,149,79,.09),transparent 28rem),linear-gradient(180deg,#fbfaf7,#f3f5f6);color:#14232f;font-size:17px;line-height:1.68}
.container{max-width:1240px}
.navbar,.appTopbar{background:rgba(7,24,39,.97)!important;border-bottom:1px solid rgba(217,192,131,.18);box-shadow:0 12px 38px rgba(2,15,25,.16);backdrop-filter:blur(18px)}
.brand strong,.appBrand strong{font-size:23px;font-weight:850;letter-spacing:-.035em}
.navlinks a{padding:10px 13px;border-radius:12px;font-size:14px;font-weight:650}
.navlinks a:hover{background:rgba(255,255,255,.07)}
.hero{position:relative;overflow:hidden;background:radial-gradient(circle at 80% 20%,rgba(217,192,131,.15),transparent 22rem),linear-gradient(135deg,#061521,#0b2538 55%,#103149)!important}
.hero:after{content:"§";position:absolute;right:5vw;top:50%;transform:translateY(-50%);font-family:Georgia,serif;font-size:290px;color:rgba(217,192,131,.045);pointer-events:none}
.heroInner{position:relative;z-index:1;padding-top:88px;padding-bottom:92px}
.hero h1,.heroTitle{font-family:Georgia,"Times New Roman",serif;font-size:clamp(43px,5.4vw,72px);line-height:1.02;letter-spacing:-.045em}
.heroDescription{max-width:720px;font-size:18px;line-height:1.75}
.btn{min-height:48px;padding:12px 18px;border-radius:13px;font-size:14px;font-weight:780;transition:.2s ease}
.btn:hover{transform:translateY(-2px)}
.btnGold{color:#0b1e2e;background:linear-gradient(135deg,#e1c98d,#b9954f)!important;box-shadow:0 12px 28px rgba(185,149,79,.22)}
.section,.servicesSection{padding-top:72px;padding-bottom:72px}
.sectionTitle,.appHeader h1{font-family:Georgia,"Times New Roman",serif;letter-spacing:-.035em}
.sectionTitle{font-size:clamp(31px,4vw,47px);line-height:1.08}
.serviceGrid,.documentGrid,.sourceGrid,.coreGrid{gap:18px}
.serviceCard,.sourceCard,.coreItem,.documentCard,.calcCard,.surface{position:relative;overflow:hidden;border:1px solid rgba(12,36,56,.12);border-radius:22px;background:rgba(255,255,255,.9);box-shadow:0 10px 35px rgba(7,24,39,.055)}
.serviceCard,.sourceCard,.documentCard{padding:25px;transition:.22s ease}
.serviceCard:before,.documentCard:before,.sourceCard:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,#d9c083,#b9954f);opacity:.72}
.serviceCard:hover,.sourceCard:hover,.documentCard:hover{transform:translateY(-5px);box-shadow:0 18px 55px rgba(5,24,39,.10);border-color:rgba(185,149,79,.38)}
.serviceIcon{width:48px;height:48px;display:grid;place-items:center;margin-bottom:20px;border-radius:14px;color:#f1dfb2;background:linear-gradient(145deg,#0b2335,#153d59);border:1px solid rgba(217,192,131,.25);box-shadow:0 10px 25px rgba(7,24,39,.15);font-weight:850}
.serviceCard h3,.sourceCard h3,.documentCard h3{color:#071827;font-size:20px;line-height:1.25;letter-spacing:-.025em}
.serviceCard p,.sourceCard p,.documentCard p,.cardDescription{color:#66737d;font-size:14px;line-height:1.65}
.serviceLink{color:#8a6b2f;font-weight:800}
.surfacePad{padding:28px}
.appShell{max-width:1280px;gap:24px}
.appSidebar{border:1px solid rgba(12,36,56,.09);border-radius:20px;background:rgba(255,255,255,.84);box-shadow:0 14px 45px rgba(7,24,39,.06)}
.sideLink{border-radius:12px;font-weight:670}.sideLink.active{box-shadow:inset 3px 0 0 #b9954f}
.appHeader{margin-bottom:22px;padding:26px 28px;border-radius:20px;color:#fff;background:radial-gradient(circle at 90% 10%,rgba(217,192,131,.13),transparent 18rem),linear-gradient(135deg,#081b2b,#0d3048)!important;box-shadow:0 20px 55px rgba(5,24,39,.15)}
.appHeader h1{color:#fff;font-size:34px}.appHeader p{color:rgba(255,255,255,.7);font-size:15px}
.resultLabel{color:#98783a;font-size:11px;font-weight:850;letter-spacing:.12em}
.formGroup label{font-size:13px;font-weight:780}
.formGroup input,.formGroup textarea,.formGroup select{border-radius:13px!important;background:#fbfcfc;font-size:15px}
.formGroup input:focus,.formGroup textarea:focus,.formGroup select:focus{outline:none;border-color:rgba(185,149,79,.72)!important;box-shadow:0 0 0 4px rgba(185,149,79,.10)}
.notice{border-radius:15px}.noticeGold{background:#fbf7ed}
.calcResult{margin-top:16px;padding:20px;border-radius:15px;color:#eaf2f6;background:linear-gradient(135deg,#0b2335,#123b57)!important}
.footer{margin-top:70px;background:#061521!important;border-top:1px solid rgba(217,192,131,.16)}
@media(max-width:900px){.heroInner{padding-top:65px;padding-bottom:68px}.hero:after{font-size:190px;right:-30px}.surfacePad{padding:21px}.section,.servicesSection{padding-top:52px;padding-bottom:52px}}
@media(max-width:640px){body{font-size:16px}.hero h1,.heroTitle{font-size:40px}.serviceCard,.sourceCard,.documentCard{padding:21px}.btn{width:100%;justify-content:center}}

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
        data-filter="mib"
      >
        MIB
      </button>

      <button
        class="courtFilter"
        type="button"
        data-filter="internal_affairs"
      >
        Ichki ishlar
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

          <div class="agencySection agencyCourtSection">
            <div class="agencySectionTitle">
              <span class="agencySectionIcon">⚖</span>
              <div><strong>SUDLAR</strong><small>Fuqarolik, jinoyat, ma’muriy va iqtisodiy sudlar</small></div>
            </div>
            <div class="agencyCards">${courtCards}</div>
          </div>

          <div class="agencySection agencyMibSection">
            <div class="agencySectionTitle">
              <span class="agencySectionIcon">⚡</span>
              <div><strong>MAJBURIY IJRO BYUROSI — MIB</strong><small>Ijro hujjatlari, aliment va qarzdorlik bo‘yicha bo‘limlar</small></div>
            </div>
            <div class="agencyCards">${mibCards}</div>
          </div>

          <div class="agencySection agencyIibSection">
            <div class="agencySectionTitle">
              <span class="agencySectionIcon">👮</span>
              <div><strong>ICHKI ISHLAR BO‘LIMLARI</strong><small>IIBB va hududiy ichki ishlar organlari</small></div>
            </div>
            <div class="agencyCards">${internalAffairsCards}</div>
          </div>


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
        href="https://cabinet.sud.uz/"
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
// ACCOUNT + PERSONAL CABINET + ADMIN MANAGEMENT SYSTEM
// ======================================================

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
let nodemailer = null;
try { nodemailer = require("nodemailer"); } catch (_) {}

const ACCOUNT_DATA_FILE = process.env.ACCOUNT_DATA_FILE || path.join(process.cwd(), "huquqiy-ai-data.json");
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const VERIFY_TTL_MS = 1000 * 60 * 15;
const RESET_TTL_MS = 1000 * 60 * 20;
const OWNER_EMAIL = String(process.env.OWNER_EMAIL || "nurzodziyodullayev799@gmail.com").trim().toLowerCase();
const OWNER_SETUP_KEY = String(process.env.OWNER_SETUP_KEY || "").trim();

function accountEmptyDb(){
  return { users:[], sessions:[], cases:[], documents:[], conversations:[], notifications:[], consents:[], auditLogs:[], settings:{ createdAt:new Date().toISOString() } };
}
function accountLoadDb(){
  try {
    if(!fs.existsSync(ACCOUNT_DATA_FILE)) return accountEmptyDb();
    const parsed = JSON.parse(fs.readFileSync(ACCOUNT_DATA_FILE,"utf8"));
    return Object.assign(accountEmptyDb(), parsed || {});
  } catch(err){ console.error("ACCOUNT DB LOAD ERROR",err); return accountEmptyDb(); }
}
function accountSaveDb(db){
  const temp = ACCOUNT_DATA_FILE + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(db,null,2), "utf8");
  fs.renameSync(temp, ACCOUNT_DATA_FILE);
}
function accountId(prefix="ID"){
  return prefix + "-" + Date.now().toString(36).toUpperCase() + "-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}
function accountEmail(v){ return String(v||"").trim().toLowerCase(); }
function accountNow(){ return new Date().toISOString(); }
function accountHashPassword(password, salt=crypto.randomBytes(16).toString("hex")){
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return salt + ":" + hash;
}
function accountVerifyPassword(password, stored){
  try {
    const [salt,hash] = String(stored||"").split(":");
    const test = crypto.scryptSync(String(password), salt, 64);
    return crypto.timingSafeEqual(Buffer.from(hash,"hex"),test);
  } catch(_){ return false; }
}
function accountCookies(req){
  const out={}; String(req.headers.cookie||"").split(";").forEach(x=>{ const i=x.indexOf("="); if(i>0) out[x.slice(0,i).trim()]=decodeURIComponent(x.slice(i+1).trim()); }); return out;
}
function accountSession(req){
  const token=accountCookies(req).hq_session; if(!token) return null;
  const db=accountLoadDb(); const s=db.sessions.find(x=>x.token===token && new Date(x.expiresAt)>new Date());
  if(!s) return null; const user=db.users.find(x=>x.id===s.userId && x.status!=="blocked");
  return user ? {db,session:s,user} : null;
}
function accountSetSession(res,userId){
  const db=accountLoadDb();
  const token=crypto.randomBytes(32).toString("hex");
  db.sessions=db.sessions.filter(s=>new Date(s.expiresAt)>new Date() && s.userId!==userId);
  db.sessions.push({id:accountId("SES"),token,userId,createdAt:accountNow(),expiresAt:new Date(Date.now()+SESSION_TTL_MS).toISOString()});
  accountSaveDb(db);
  res.setHeader("Set-Cookie",`hq_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS/1000)}${process.env.NODE_ENV==="production"?"; Secure":""}`);
}
function accountClearSession(req,res){
  const token=accountCookies(req).hq_session; const db=accountLoadDb(); db.sessions=db.sessions.filter(s=>s.token!==token); accountSaveDb(db);
  res.setHeader("Set-Cookie","hq_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
}
function accountAudit(db,userId,action,meta={}){
  db.auditLogs.unshift({id:accountId("LOG"),userId:userId||null,action,meta,createdAt:accountNow()});
  db.auditLogs=db.auditLogs.slice(0,5000);
}
function accountCaseNo(db){ return `CASE-${new Date().getFullYear()}-${String(db.cases.length+1).padStart(5,"0")}`; }
function accountSafeUser(u){ return {id:u.id,firstName:u.firstName,lastName:u.lastName,email:u.email,role:u.role,status:u.status,emailVerified:!!u.emailVerified,createdAt:u.createdAt,lastLoginAt:u.lastLoginAt||null}; }
function accountRedirect(res,to){ res.writeHead(302,{Location:to}); return res.end(); }
function accountMessage(text,type="info"){ return `<div class="accountAlert ${type}">${esc(text)}</div>`; }

async function accountSendEmail(to,subject,text){
  if(nodemailer && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS){
    const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:String(process.env.SMTP_SECURE||"")==="true",auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
    await transport.sendMail({from:process.env.SMTP_FROM||process.env.SMTP_USER,to,subject,text});
    return true;
  }
  console.log(`[HUQUQIY AI EMAIL DEV] TO=${to} SUBJECT=${subject}\n${text}`);
  return false;
}

const ACCOUNT_CSS = `
.accountWrap{min-height:78vh;padding:42px 4%;background:linear-gradient(180deg,#f7f8f8,#eef2f3)}
.accountAuth{width:min(520px,100%);margin:0 auto;background:#fff;border:1px solid #dde5e8;border-radius:24px;padding:30px;box-shadow:0 24px 70px rgba(7,24,39,.10)}
.accountAuth h1,.accountPanel h1{font-family:Georgia,serif;color:#071827;margin:0 0 8px}.accountMuted{color:#70808b;font-size:14px}.accountForm{display:grid;gap:15px;margin-top:22px}.accountForm label{font-size:13px;font-weight:800;color:#263b4a}.accountForm input,.accountForm select,.accountForm textarea{width:100%;box-sizing:border-box;padding:13px 14px;border:1px solid #ced9de;border-radius:12px;background:#fbfcfc;font:inherit}.accountForm input:focus,.accountForm select:focus,.accountForm textarea:focus{outline:none;border-color:#b9954f;box-shadow:0 0 0 4px rgba(185,149,79,.12)}
.accountButton{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:11px 17px;border:0;border-radius:12px;background:#0a2639;color:#fff;font-weight:800;text-decoration:none;cursor:pointer}.accountButton.gold{background:linear-gradient(135deg,#d8bf7f,#b9954f);color:#071827}.accountButton.light{background:#eef2f4;color:#173044}.accountButton.danger{background:#8d2f36}.accountButton.small{min-height:36px;padding:7px 11px;font-size:12px}
.accountAlert{padding:12px 14px;border-radius:12px;margin:12px 0;font-size:14px;background:#edf4f8;color:#24465d}.accountAlert.error{background:#fff0f0;color:#8a3036}.accountAlert.success{background:#edf8f1;color:#25613d}
.accountShell{display:grid;grid-template-columns:260px 1fr;min-height:100vh;background:#f3f5f6}.accountSide{background:#071827;color:#dce6eb;padding:25px 16px;position:sticky;top:0;height:100vh;box-sizing:border-box}.accountSideBrand{display:flex;gap:10px;align-items:center;font-weight:900;font-size:20px;padding:8px 10px 24px}.accountSide a{display:flex;gap:10px;align-items:center;color:#bfcbd2;text-decoration:none;padding:11px 12px;border-radius:11px;margin:4px 0;font-size:14px;font-weight:700}.accountSide a:hover,.accountSide a.active{background:#123249;color:#fff}.accountSide .accountSideBottom{position:absolute;left:16px;right:16px;bottom:22px}.accountMain{padding:28px;min-width:0}.accountTop{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:22px}.accountIdentity{display:flex;align-items:center;gap:10px}.accountAvatar{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#d8bf7f,#a8813e);color:#071827;font-weight:900}.accountPanel{background:#fff;border:1px solid #dde5e8;border-radius:20px;padding:22px;box-shadow:0 8px 30px rgba(7,24,39,.045);margin-bottom:18px}.accountStats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px}.accountStat{background:#fff;border:1px solid #dde5e8;border-radius:18px;padding:18px}.accountStat strong{display:block;font-size:30px;color:#071827}.accountStat span{font-size:12px;color:#71808a;font-weight:800;text-transform:uppercase;letter-spacing:.06em}.accountGrid{display:grid;grid-template-columns:1.5fr 1fr;gap:18px}.accountTableWrap{overflow:auto}.accountTable{width:100%;border-collapse:collapse;min-width:680px}.accountTable th,.accountTable td{text-align:left;padding:12px;border-bottom:1px solid #edf0f2;font-size:13px}.accountTable th{font-size:11px;text-transform:uppercase;color:#71808a;letter-spacing:.06em}.accountBadge{display:inline-flex;padding:5px 9px;border-radius:999px;background:#edf4f8;color:#31576e;font-size:11px;font-weight:850}.accountBadge.good{background:#eaf7ef;color:#28603e}.accountBadge.warn{background:#fff6df;color:#805e17}.accountBadge.bad{background:#fff0f0;color:#8a3036}.accountActions{display:flex;gap:8px;flex-wrap:wrap}.accountProgress{height:8px;background:#e8edef;border-radius:999px;overflow:hidden}.accountProgress i{display:block;height:100%;background:linear-gradient(90deg,#b9954f,#d8bf7f)}.accountHero{padding:24px;border-radius:20px;background:radial-gradient(circle at 90% 10%,rgba(217,192,131,.16),transparent 18rem),linear-gradient(135deg,#081b2b,#0d3048);color:#fff;margin-bottom:18px}.accountHero h1{color:#fff;margin:0 0 8px}.accountHero p{color:#b9c8d1;margin:0}.accountCards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.accountCard{padding:18px;border:1px solid #dde5e8;border-radius:16px;background:#fff}.accountCard h3{margin:0 0 8px}.accountCode{font-family:ui-monospace,monospace;background:#f3f6f7;padding:2px 6px;border-radius:6px}
@media(max-width:980px){.accountShell{grid-template-columns:1fr}.accountSide{position:relative;height:auto}.accountSideBottom{position:static!important;margin-top:18px}.accountStats{grid-template-columns:repeat(2,1fr)}.accountGrid{grid-template-columns:1fr}.accountCards{grid-template-columns:1fr 1fr}}
@media(max-width:620px){.accountMain{padding:16px}.accountStats{grid-template-columns:1fr 1fr}.accountCards{grid-template-columns:1fr}.accountAuth{padding:22px}.accountTop{align-items:flex-start;flex-direction:column}}
`;

function accountPublicPage(lang,title,body){
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} — Huquqiy AI</title><style>${CSS}${ACCOUNT_CSS}</style></head><body>${navigation(lang)}<main class="accountWrap">${body}</main>${footer(lang)}</body></html>`;
}
function accountSidebar(lang,user,active){
  const admin=user.role==="owner"||user.role==="admin";
  const item=(key,icon,label,href)=>`<a class="${active===key?"active":""}" href="${href}${href.includes("?")?"&":"?"}lang=${lang}"><span>${icon}</span>${label}</a>`;
  return `<aside class="accountSide"><div class="accountSideBrand"><span>§</span><span>Huquqiy AI</span></div>
  ${item("dashboard","▦","Dashboard","/account")}${item("cases","⚖","Mening ishlarim","/account/cases")}${item("new","＋","Yangi huquqiy ish","/account/cases/new")}${item("chats","💬","AI suhbatlarim","/account/chats")}${item("documents","▤","Hujjatlarim","/account/documents")}${item("notifications","●","Bildirishnomalar","/account/notifications")}${item("profile","◉","Profil","/account/profile")}${item("security","⌾","Xavfsizlik","/account/security")}${item("settings","⚙","Sozlamalar","/account/settings")}${admin?item("admin","◆","ADMIN PANEL","/admin"):""}
  <div class="accountSideBottom"><a href="/logout?lang=${lang}">↪ Chiqish</a></div></aside>`;
}
function accountAppPage(lang,user,active,title,body){
  const initials=(user.firstName?.[0]||"U")+(user.lastName?.[0]||"");
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} — Huquqiy AI</title><style>${CSS}${ACCOUNT_CSS}</style></head><body><div class="accountShell">${accountSidebar(lang,user,active)}<main class="accountMain"><div class="accountTop"><div><b>${esc(title)}</b><div class="accountMuted">Huquqiy AI shaxsiy ish maydoni</div></div><div class="accountIdentity"><div><b>${esc(user.firstName)} ${esc(user.lastName)}</b><div class="accountMuted">${esc(user.email)}</div></div><div class="accountAvatar">${esc(initials)}</div></div></div>${body}</main></div></body></html>`;
}
function accountRequire(req,res,lang,roles=null){
  const auth=accountSession(req);
  if(!auth){ accountRedirect(res,`/login?lang=${lang}&next=${encodeURIComponent(getUrl(req).pathname)}`); return null; }
  if(roles && !roles.includes(auth.user.role)){ sendHtml(res,accountAppPage(lang,auth.user,"","Ruxsat yo‘q",accountMessage("Bu bo‘lim uchun ruxsatingiz yo‘q.","error")),403); return null; }
  return auth;
}

function accountLoginPage(lang,msg=""){
  return accountPublicPage(lang,"Kirish",`<section class="accountAuth"><h1>Shaxsiy kabinetga kirish</h1><p class="accountMuted">Email va parolingiz orqali Huquqiy AI profilingizga kiring.</p>${msg?accountMessage(msg,msg.includes("xato")||msg.includes("noto")?"error":"info"):""}<form class="accountForm" method="post" action="/login?lang=${lang}"><label>Email<input name="email" type="email" required autocomplete="email"></label><label>Parol<input name="password" type="password" required autocomplete="current-password"></label><button class="accountButton gold">Kirish</button></form><div class="accountActions" style="margin-top:16px"><a href="/register?lang=${lang}">Ro‘yxatdan o‘tish</a><a href="/forgot-password?lang=${lang}">Parolni unutdingizmi?</a></div></section>`);
}
function accountRegisterPage(lang,msg=""){
  return accountPublicPage(lang,"Ro‘yxatdan o‘tish",`<section class="accountAuth"><h1>Akkaunt yaratish</h1><p class="accountMuted">Huquqiy ishlaringiz, AI suhbatlari va hujjatlaringizni bitta profilga bog‘lang.</p>${msg?accountMessage(msg,"error"):""}<form class="accountForm" method="post" action="/register?lang=${lang}"><label>Ism<input name="firstName" required maxlength="60"></label><label>Familiya<input name="lastName" required maxlength="60"></label><label>Email<input name="email" type="email" required autocomplete="email"></label><label>Parol<input name="password" type="password" minlength="8" required autocomplete="new-password"></label><label>Parolni takrorlang<input name="password2" type="password" minlength="8" required></label><label style="display:flex;gap:10px;align-items:flex-start"><input style="width:auto;margin-top:4px" name="terms" value="yes" type="checkbox" required><span>Foydalanish shartlari va maxfiylik siyosatini o‘qidim.</span></label><button class="accountButton gold">Akkaunt yaratish</button></form><p class="accountMuted">Akkauntingiz bormi? <a href="/login?lang=${lang}">Kirish</a></p></section>`);
}
function accountVerifyPage(lang,email,msg=""){
  return accountPublicPage(lang,"Emailni tasdiqlash",`<section class="accountAuth"><h1>Emailni tasdiqlash</h1><p class="accountMuted"><b>${esc(email)}</b> manziliga yuborilgan 6 xonali kodni kiriting.</p>${msg?accountMessage(msg,msg.includes("Tasdiqlandi")?"success":"error"):""}<form class="accountForm" method="post" action="/verify-email?lang=${lang}"><input type="hidden" name="email" value="${esc(email)}"><label>Tasdiqlash kodi<input name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required></label><button class="accountButton gold">Tasdiqlash</button></form></section>`);
}
function accountDashboard(lang,user,db){
  const cases=db.cases.filter(x=>x.userId===user.id), docs=db.documents.filter(x=>x.userId===user.id), chats=db.conversations.filter(x=>x.userId===user.id), done=cases.filter(x=>x.status==="completed").length;
  const recent=[...cases].sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))).slice(0,6);
  return accountAppPage(lang,user,"dashboard","Shaxsiy kabinet",`<section class="accountHero"><h1>Xush kelibsiz, ${esc(user.firstName)}!</h1><p>Huquqiy ishlaringiz, hujjatlaringiz va AI maslahatlaringiz shu yerda boshqariladi.</p></section><section class="accountStats"><div class="accountStat"><strong>${cases.filter(x=>x.status!=="completed").length}</strong><span>Faol ishlar</span></div><div class="accountStat"><strong>${docs.length}</strong><span>Hujjatlar</span></div><div class="accountStat"><strong>${chats.length}</strong><span>AI suhbatlar</span></div><div class="accountStat"><strong>${done}</strong><span>Yakunlangan</span></div></section><section class="accountPanel"><div class="accountTop"><div><h2>Oxirgi huquqiy ishlar</h2><div class="accountMuted">Davom ettirish uchun ishni tanlang.</div></div><a class="accountButton gold" href="/account/cases/new?lang=${lang}">＋ Yangi ish</a></div>${recent.length?`<div class="accountTableWrap"><table class="accountTable"><thead><tr><th>Case ID</th><th>Yo‘nalish</th><th>Masala</th><th>Status</th><th>Progress</th><th></th></tr></thead><tbody>${recent.map(c=>`<tr><td><b>${esc(c.caseNo)}</b></td><td>${esc(c.area)}</td><td>${esc(c.title)}</td><td><span class="accountBadge">${esc(c.status)}</span></td><td><div class="accountProgress"><i style="width:${Number(c.progress||0)}%"></i></div> ${Number(c.progress||0)}%</td><td><a href="/account/case?id=${encodeURIComponent(c.id)}&lang=${lang}">Ochish</a></td></tr>`).join("")}</tbody></table></div>`:`<p class="accountMuted">Hali huquqiy ish ochilmagan.</p>`}</section>`);
}
function accountCasesPage(lang,user,db){
  const cases=db.cases.filter(x=>x.userId===user.id);
  return accountAppPage(lang,user,"cases","Mening ishlarim",`<section class="accountPanel"><div class="accountTop"><div><h1>Mening huquqiy ishlarim</h1><p class="accountMuted">Har bir masala alohida Case ID bilan saqlanadi.</p></div><a class="accountButton gold" href="/account/cases/new?lang=${lang}">＋ Yangi ish</a></div><div class="accountTableWrap"><table class="accountTable"><thead><tr><th>Case ID</th><th>Yo‘nalish</th><th>Nomi</th><th>Status</th><th>Progress</th><th>Sana</th><th></th></tr></thead><tbody>${cases.map(c=>`<tr><td>${esc(c.caseNo)}</td><td>${esc(c.area)}</td><td><b>${esc(c.title)}</b></td><td><span class="accountBadge">${esc(c.status)}</span></td><td>${Number(c.progress||0)}%</td><td>${esc(String(c.createdAt).slice(0,10))}</td><td><a href="/account/case?id=${encodeURIComponent(c.id)}&lang=${lang}">Ochish</a></td></tr>`).join("")||`<tr><td colspan="7">Hali ish yo‘q.</td></tr>`}</tbody></table></div></section>`);
}
function accountNewCasePage(lang,user,msg=""){
  return accountAppPage(lang,user,"new","Yangi huquqiy ish",`<section class="accountPanel"><h1>Yangi ish ochish</h1><p class="accountMuted">Muammoni tanlang. Keyin mavjud Huquqiy AI modullaridan davom etishingiz mumkin.</p>${msg?accountMessage(msg,"error"):""}<form class="accountForm" method="post" action="/account/cases/new?lang=${lang}"><label>Huquq sohasi<select name="area" required><option value="Oila huquqi">Oila huquqi</option><option value="Mehnat huquqi">Mehnat huquqi</option><option value="Biznes huquqi">Biznes huquqi</option><option value="Fuqarolik huquqi">Fuqarolik huquqi</option><option value="Boshqa">Boshqa</option></select></label><label>Masala nomi<input name="title" placeholder="Masalan: Nikohdan ajratish" required maxlength="140"></label><label>Qisqa tavsif<textarea name="description" rows="5" maxlength="1500" placeholder="Vaziyatni qisqacha yozing"></textarea></label><button class="accountButton gold">Ishni yaratish</button></form></section>`);
}
function accountCasePage(lang,user,db,id){
  const c=db.cases.find(x=>x.id===id && (x.userId===user.id || ["owner","admin"].includes(user.role))); if(!c) return accountAppPage(lang,user,"cases","Ish topilmadi",accountMessage("Bu ish topilmadi.","error"));
  const docs=db.documents.filter(x=>x.caseId===c.id), chats=db.conversations.filter(x=>x.caseId===c.id);
  const moduleLink=c.area==="Oila huquqi"?"/family":c.area==="Mehnat huquqi"?"/employment":c.area==="Biznes huquqi"?"/business":"/ai";
  return accountAppPage(lang,user,"cases",c.caseNo,`<section class="accountHero"><div class="accountBadge good">${esc(c.status)}</div><h1>${esc(c.title)}</h1><p>${esc(c.area)} · ${esc(c.caseNo)}</p></section><section class="accountGrid"><div><section class="accountPanel"><h2>Ish tafsilotlari</h2><p>${esc(c.description||"Tavsif kiritilmagan.")}</p><div class="accountProgress"><i style="width:${Number(c.progress||0)}%"></i></div><p class="accountMuted">Progress: ${Number(c.progress||0)}%</p><div class="accountActions"><a class="accountButton gold" href="${moduleLink}?lang=${lang}&case=${encodeURIComponent(c.id)}">Huquqiy modulni ochish</a><a class="accountButton" href="/ai?lang=${lang}&case=${encodeURIComponent(c.id)}">AI maslahat</a><a class="accountButton light" href="/documents?lang=${lang}&case=${encodeURIComponent(c.id)}">Hujjat yaratish</a></div></section><section class="accountPanel"><h2>Case hujjatlari</h2>${docs.map(d=>`<div class="accountCard"><b>${esc(d.title)}</b><div class="accountMuted">${esc(d.type)} · ${esc(String(d.createdAt).slice(0,10))}</div></div>`).join("")||`<p class="accountMuted">Hali hujjat biriktirilmagan.</p>`}</section></div><div><section class="accountPanel"><h2>Statusni yangilash</h2><form class="accountForm" method="post" action="/account/case/update?lang=${lang}"><input type="hidden" name="id" value="${esc(c.id)}"><label>Status<select name="status"><option ${c.status==="started"?"selected":""} value="started">started</option><option ${c.status==="collecting"?"selected":""} value="collecting">collecting</option><option ${c.status==="analysis"?"selected":""} value="analysis">analysis</option><option ${c.status==="document_ready"?"selected":""} value="document_ready">document_ready</option><option ${c.status==="completed"?"selected":""} value="completed">completed</option></select></label><label>Progress %<input name="progress" type="number" min="0" max="100" value="${Number(c.progress||0)}"></label><button class="accountButton">Saqlash</button></form></section><section class="accountPanel"><h2>AI faoliyati</h2><strong>${chats.length}</strong><div class="accountMuted">shu ishga bog‘langan suhbat</div></section></div></section>`);
}
function accountSimpleListPage(lang,user,active,title,items,render,empty){ return accountAppPage(lang,user,active,title,`<section class="accountPanel"><h1>${esc(title)}</h1><p class="accountMuted">Shaxsiy profilingizga bog‘langan ma’lumotlar.</p>${items.length?items.map(render).join(""):`<p class="accountMuted">${esc(empty)}</p>`}</section>`); }
function accountProfilePage(lang,user,msg=""){
  return accountAppPage(lang,user,"profile","Profil",`<section class="accountPanel"><h1>Profil ma’lumotlari</h1>${msg?accountMessage(msg,"success"):""}<form class="accountForm" method="post" action="/account/profile?lang=${lang}"><label>Ism<input name="firstName" value="${esc(user.firstName)}" required></label><label>Familiya<input name="lastName" value="${esc(user.lastName)}" required></label><label>Email<input value="${esc(user.email)}" disabled></label><label>Rol<input value="${esc(user.role)}" disabled></label><label>Email holati<input value="${user.emailVerified?"Tasdiqlangan":"Tasdiqlanmagan"}" disabled></label><button class="accountButton gold">Profilni saqlash</button></form></section>`);
}
function accountSecurityPage(lang,user,msg=""){
  return accountAppPage(lang,user,"security","Xavfsizlik",`<section class="accountPanel"><h1>Parol va sessiyalar</h1>${msg?accountMessage(msg,msg.includes("xato")?"error":"success"):""}<form class="accountForm" method="post" action="/account/security?lang=${lang}"><label>Joriy parol<input name="currentPassword" type="password" required></label><label>Yangi parol<input name="newPassword" type="password" minlength="8" required></label><label>Yangi parolni takrorlang<input name="newPassword2" type="password" minlength="8" required></label><button class="accountButton">Parolni almashtirish</button></form></section>`);
}
function accountSettingsPage(lang,user){ return accountAppPage(lang,user,"settings","Sozlamalar",`<section class="accountPanel"><h1>Sozlamalar</h1><div class="accountCards"><div class="accountCard"><h3>Til</h3><p class="accountMuted">Interfeys tili URL orqali UZ/RU/EN ishlaydi.</p></div><div class="accountCard"><h3>Maxfiylik</h3><p class="accountMuted">Rozilik va account faoliyati audit jurnalida qayd etiladi.</p></div><div class="accountCard"><h3>Account ID</h3><span class="accountCode">${esc(user.id)}</span></div></div></section>`); }

function adminDashboardPage(lang,user,db){
  const active=db.users.filter(x=>x.status==="active").length;
  return accountAppPage(lang,user,"admin","Owner / Admin panel",`<section class="accountHero"><h1>Huquqiy AI boshqaruv markazi</h1><p>Foydalanuvchilar, huquqiy ishlar, hujjatlar va audit faoliyatini boshqaring.</p></section><section class="accountStats"><div class="accountStat"><strong>${db.users.length}</strong><span>Foydalanuvchilar</span></div><div class="accountStat"><strong>${active}</strong><span>Faol account</span></div><div class="accountStat"><strong>${db.cases.length}</strong><span>Huquqiy ishlar</span></div><div class="accountStat"><strong>${db.documents.length}</strong><span>Hujjatlar</span></div></section><section class="accountCards"><a class="accountCard" href="/admin/users?lang=${lang}"><h3>Foydalanuvchilar</h3><p class="accountMuted">Accountlar va statuslarni boshqarish.</p></a><a class="accountCard" href="/admin/cases?lang=${lang}"><h3>Cases</h3><p class="accountMuted">Platformadagi huquqiy ishlar metadata-si.</p></a><a class="accountCard" href="/admin/audit?lang=${lang}"><h3>Audit log</h3><p class="accountMuted">Muhim boshqaruv va account hodisalari.</p></a></section>`);
}
function adminUsersPage(lang,user,db){
  return accountAppPage(lang,user,"admin","Foydalanuvchilar",`<section class="accountPanel"><div class="accountTop"><div><h1>Foydalanuvchilar</h1><p class="accountMuted">Admin uchun zarur account metadata. Maxfiy AI matnlari bu jadvalda ko‘rsatilmaydi.</p></div><a class="accountButton light" href="/admin?lang=${lang}">← Admin</a></div><div class="accountTableWrap"><table class="accountTable"><thead><tr><th>Ism</th><th>Email</th><th>Rol</th><th>Verified</th><th>Status</th><th>Cases</th><th>Ro‘yxat</th><th>Amal</th></tr></thead><tbody>${db.users.map(u=>`<tr><td><b>${esc(u.firstName)} ${esc(u.lastName)}</b></td><td>${esc(u.email)}</td><td>${esc(u.role)}</td><td>${u.emailVerified?"Ha":"Yo‘q"}</td><td><span class="accountBadge ${u.status==="blocked"?"bad":"good"}">${esc(u.status)}</span></td><td>${db.cases.filter(c=>c.userId===u.id).length}</td><td>${esc(String(u.createdAt).slice(0,10))}</td><td>${u.id===user.id?"Owner":`<form method="post" action="/admin/user-status?lang=${lang}" style="display:flex;gap:6px"><input type="hidden" name="id" value="${esc(u.id)}"><select name="status"><option value="active">active</option><option value="suspended">suspended</option><option value="blocked">blocked</option></select><button class="accountButton small">Saqlash</button></form>`}</td></tr>`).join("")}</tbody></table></div></section>`);
}
function adminCasesPage(lang,user,db){
  return accountAppPage(lang,user,"admin","Barcha huquqiy ishlar",`<section class="accountPanel"><h1>Cases</h1><p class="accountMuted">Boshqaruv metadata-si. Foydalanuvchining maxfiy AI yozishmasi avtomatik ochilmaydi.</p><div class="accountTableWrap"><table class="accountTable"><thead><tr><th>Case ID</th><th>Foydalanuvchi</th><th>Yo‘nalish</th><th>Nomi</th><th>Status</th><th>Progress</th></tr></thead><tbody>${db.cases.map(c=>{const u=db.users.find(x=>x.id===c.userId);return `<tr><td>${esc(c.caseNo)}</td><td>${esc(u?u.email:"-")}</td><td>${esc(c.area)}</td><td>${esc(c.title)}</td><td>${esc(c.status)}</td><td>${Number(c.progress||0)}%</td></tr>`}).join("")||`<tr><td colspan="6">Case yo‘q.</td></tr>`}</tbody></table></div></section>`);
}
function adminAuditPage(lang,user,db){
  return accountAppPage(lang,user,"admin","Audit log",`<section class="accountPanel"><h1>Audit log</h1><div class="accountTableWrap"><table class="accountTable"><thead><tr><th>Vaqt</th><th>User</th><th>Hodisa</th><th>Metadata</th></tr></thead><tbody>${db.auditLogs.slice(0,300).map(l=>`<tr><td>${esc(l.createdAt)}</td><td>${esc(l.userId||"system")}</td><td>${esc(l.action)}</td><td>${esc(JSON.stringify(l.meta||{}).slice(0,180))}</td></tr>`).join("")}</tbody></table></div></section>`);
}

function ownerSetupPage(lang,msg=""){
  const db=accountLoadDb();
  const exists=db.users.some(u=>u.role==="owner" || u.email===OWNER_EMAIL);
  return accountPublicPage(lang,"Owner sozlash",`<section class="accountAuth"><h1>Huquqiy AI — Owner sozlash</h1><p class="accountMuted">Bu sahifa faqat platforma egasining birinchi akkauntini yaratish uchun. Owner email o‘zgarmaydi.</p>${msg?accountMessage(msg,"error"):""}${exists?accountMessage("Owner akkaunti allaqachon yaratilgan.","info"):`<form class="accountForm" method="post" action="/admin/setup?lang=${lang}"><label>Owner email<input value="${esc(OWNER_EMAIL)}" disabled></label><label>OWNER_SETUP_KEY<input name="setupKey" type="password" required autocomplete="off"></label><label>Yangi Owner paroli<input name="password" type="password" minlength="10" required autocomplete="new-password"></label><label>Parolni takrorlang<input name="password2" type="password" minlength="10" required></label><button class="accountButton gold">OWNER AKKAUNTINI YARATISH</button></form>`}<p class="accountMuted" style="margin-top:16px"><a href="/admin/login?lang=${lang}">Admin kirish →</a></p></section>`);
}
function ownerLoginPage(lang,msg=""){
  return accountPublicPage(lang,"Admin kirish",`<section class="accountAuth"><h1>Owner / Admin kirish</h1><p class="accountMuted">Bu kirish Huquqiy AI boshqaruv paneli uchun. Oddiy foydalanuvchilar <a href="/login?lang=${lang}">foydalanuvchi kirishi</a> orqali kiradi.</p>${msg?accountMessage(msg,"error"):""}<form class="accountForm" method="post" action="/admin/login?lang=${lang}"><label>Owner email<input name="email" type="email" value="${esc(OWNER_EMAIL)}" readonly></label><label>Parol<input name="password" type="password" required autocomplete="current-password"></label><button class="accountButton gold">ADMIN PANELGA KIRISH</button></form></section>`);
}

async function accountHandleRoutes(req,res,url,pathname,lang){
  if(req.method==="GET" && pathname==="/admin/setup"){
    sendHtml(res,ownerSetupPage(lang)); return true;
  }
  if(req.method==="POST" && pathname==="/admin/setup"){
    const f=await readForm(req), db=accountLoadDb();
    if(db.users.some(u=>u.role==="owner" || u.email===OWNER_EMAIL)){ accountRedirect(res,`/admin/login?lang=${lang}`); return true; }
    if(!OWNER_SETUP_KEY || String(f.setupKey||"")!==OWNER_SETUP_KEY){ sendHtml(res,ownerSetupPage(lang,"OWNER_SETUP_KEY noto‘g‘ri yoki Render Environment’da o‘rnatilmagan."),403); return true; }
    if(String(f.password||"").length<10 || f.password!==f.password2){ sendHtml(res,ownerSetupPage(lang,"Parol kamida 10 belgi bo‘lsin va ikkala parol bir xil bo‘lsin."),400); return true; }
    const owner={id:accountId("OWN"),firstName:"Nurzod",lastName:"Ziyodullayev",email:OWNER_EMAIL,passwordHash:accountHashPassword(f.password),role:"owner",status:"active",emailVerified:true,createdAt:accountNow(),updatedAt:accountNow(),ownerCreated:true};
    db.users.push(owner); accountAudit(db,owner.id,"owner_bootstrapped",{email:OWNER_EMAIL}); accountSaveDb(db); accountSetSession(res,owner.id); accountRedirect(res,`/admin?lang=${lang}`); return true;
  }
  if(req.method==="GET" && pathname==="/admin/login"){
    const auth=accountSession(req); if(auth && ["owner","admin"].includes(auth.user.role)){ accountRedirect(res,`/admin?lang=${lang}`); return true; }
    sendHtml(res,ownerLoginPage(lang)); return true;
  }
  if(req.method==="POST" && pathname==="/admin/login"){
    const f=await readForm(req), email=accountEmail(f.email), db=accountLoadDb(), user=db.users.find(u=>u.email===email && ["owner","admin"].includes(u.role));
    if(!user || email!==OWNER_EMAIL || !accountVerifyPassword(f.password,user.passwordHash) || user.status!=="active"){ sendHtml(res,ownerLoginPage(lang,"Admin email yoki parol noto‘g‘ri."),401); return true; }
    user.lastLoginAt=accountNow(); accountAudit(db,user.id,"admin_login",{}); accountSaveDb(db); accountSetSession(res,user.id); accountRedirect(res,`/admin?lang=${lang}`); return true;
  }
  if(req.method==="GET" && pathname==="/login"){ sendHtml(res,accountLoginPage(lang)); return true; }
  if(req.method==="POST" && pathname==="/login"){
    const f=await readForm(req), email=accountEmail(f.email), db=accountLoadDb(), user=db.users.find(u=>u.email===email);
    if(email===OWNER_EMAIL){ accountRedirect(res,`/admin/login?lang=${lang}`); return true; }
    if(!user || user.role!=="user" || !accountVerifyPassword(f.password,user.passwordHash) || user.status!=="active"){ sendHtml(res,accountLoginPage(lang,"Email yoki parol noto‘g‘ri, yoki account faol emas."),401); return true; }
    if(!user.emailVerified){ accountRedirect(res,`/verify-email?lang=${lang}&email=${encodeURIComponent(email)}`); return true; }
    user.lastLoginAt=accountNow(); accountAudit(db,user.id,"login",{}); accountSaveDb(db); accountSetSession(res,user.id); accountRedirect(res,`/account?lang=${lang}`); return true;
  }
  if(req.method==="GET" && pathname==="/register"){ sendHtml(res,accountRegisterPage(lang)); return true; }
  if(req.method==="POST" && pathname==="/register"){
    const f=await readForm(req), email=accountEmail(f.email); const db=accountLoadDb();
    if(!f.firstName||!f.lastName||!email.includes("@")||String(f.password||"").length<8||f.password!==f.password2||f.terms!=="yes"){ sendHtml(res,accountRegisterPage(lang,"Ma’lumotlarni tekshiring. Parol kamida 8 belgi va ikki parol bir xil bo‘lishi kerak."),400); return true; }
    if(email===OWNER_EMAIL){ sendHtml(res,accountRegisterPage(lang,"Bu email platforma OWNER akkaunti uchun ajratilgan. /admin/login orqali kiring."),403); return true; }
    if(db.users.some(u=>u.email===email)){ sendHtml(res,accountRegisterPage(lang,"Bu email bilan account mavjud."),409); return true; }
    const code=String(Math.floor(100000+Math.random()*900000)); const role="user";
    const user={id:accountId("USR"),firstName:String(f.firstName).trim(),lastName:String(f.lastName).trim(),email,passwordHash:accountHashPassword(f.password),role,status:"active",emailVerified:false,verificationCodeHash:accountHashPassword(code),verificationExpiresAt:new Date(Date.now()+VERIFY_TTL_MS).toISOString(),createdAt:accountNow(),updatedAt:accountNow()};
    db.users.push(user); db.consents.push({id:accountId("CNS"),userId:user.id,type:"terms_privacy",version:"2026-09-25-v1",acceptedAt:accountNow()}); accountAudit(db,user.id,"register",{email}); accountSaveDb(db);
    await accountSendEmail(email,"Huquqiy AI — emailni tasdiqlash",`Tasdiqlash kodingiz: ${code}. Kod 15 daqiqa amal qiladi.`);
    accountRedirect(res,`/verify-email?lang=${lang}&email=${encodeURIComponent(email)}`); return true;
  }
  if(req.method==="GET" && pathname==="/verify-email"){ sendHtml(res,accountVerifyPage(lang,accountEmail(url.searchParams.get("email")))); return true; }
  if(req.method==="POST" && pathname==="/verify-email"){
    const f=await readForm(req), email=accountEmail(f.email), db=accountLoadDb(), user=db.users.find(u=>u.email===email);
    if(!user||!user.verificationCodeHash||new Date(user.verificationExpiresAt)<new Date()||!accountVerifyPassword(f.code,user.verificationCodeHash)){ sendHtml(res,accountVerifyPage(lang,email,"Kod noto‘g‘ri yoki muddati tugagan."),400); return true; }
    user.emailVerified=true; delete user.verificationCodeHash; delete user.verificationExpiresAt; user.updatedAt=accountNow(); accountAudit(db,user.id,"email_verified",{}); accountSaveDb(db); accountSetSession(res,user.id); accountRedirect(res,`/account?lang=${lang}`); return true;
  }
  if(req.method==="GET" && pathname==="/forgot-password"){
    sendHtml(res,accountPublicPage(lang,"Parolni tiklash",`<section class="accountAuth"><h1>Parolni tiklash</h1><p class="accountMuted">Emailingizni kiriting.</p><form class="accountForm" method="post" action="/forgot-password?lang=${lang}"><label>Email<input name="email" type="email" required></label><button class="accountButton">Tiklash kodini yuborish</button></form></section>`)); return true;
  }
  if(req.method==="POST" && pathname==="/forgot-password"){
    const f=await readForm(req), email=accountEmail(f.email), db=accountLoadDb(), user=db.users.find(u=>u.email===email); if(user){const code=String(Math.floor(100000+Math.random()*900000));user.resetCodeHash=accountHashPassword(code);user.resetExpiresAt=new Date(Date.now()+RESET_TTL_MS).toISOString();accountAudit(db,user.id,"password_reset_requested",{});accountSaveDb(db);await accountSendEmail(email,"Huquqiy AI — parolni tiklash",`Parolni tiklash kodingiz: ${code}`);} accountRedirect(res,`/reset-password?lang=${lang}&email=${encodeURIComponent(email)}`); return true;
  }
  if(req.method==="GET" && pathname==="/reset-password"){
    const email=accountEmail(url.searchParams.get("email")); sendHtml(res,accountPublicPage(lang,"Yangi parol",`<section class="accountAuth"><h1>Yangi parol</h1><form class="accountForm" method="post" action="/reset-password?lang=${lang}"><input type="hidden" name="email" value="${esc(email)}"><label>Kod<input name="code" required maxlength="6"></label><label>Yangi parol<input name="password" type="password" minlength="8" required></label><label>Takrorlang<input name="password2" type="password" minlength="8" required></label><button class="accountButton">Parolni yangilash</button></form></section>`)); return true;
  }
  if(req.method==="POST" && pathname==="/reset-password"){
    const f=await readForm(req), email=accountEmail(f.email), db=accountLoadDb(), user=db.users.find(u=>u.email===email);
    if(!user||!user.resetCodeHash||new Date(user.resetExpiresAt)<new Date()||!accountVerifyPassword(f.code,user.resetCodeHash)||String(f.password||"").length<8||f.password!==f.password2){ sendHtml(res,accountPublicPage(lang,"Xato",`<section class="accountAuth">${accountMessage("Kod yoki yangi parol ma’lumotlari noto‘g‘ri.","error")}<a href="/forgot-password?lang=${lang}">Qayta urinish</a></section>`),400); return true; }
    user.passwordHash=accountHashPassword(f.password); delete user.resetCodeHash; delete user.resetExpiresAt; db.sessions=db.sessions.filter(s=>s.userId!==user.id); accountAudit(db,user.id,"password_reset_completed",{}); accountSaveDb(db); accountRedirect(res,`/login?lang=${lang}`); return true;
  }
  if(req.method==="GET" && pathname==="/logout"){ accountClearSession(req,res); accountRedirect(res,`/login?lang=${lang}`); return true; }

  if(pathname.startsWith("/account")){
    const auth=accountRequire(req,res,lang); if(!auth) return true; const {user}=auth;
    if(req.method==="GET" && pathname==="/account"){ sendHtml(res,accountDashboard(lang,user,accountLoadDb())); return true; }
    if(req.method==="GET" && pathname==="/account/cases"){ sendHtml(res,accountCasesPage(lang,user,accountLoadDb())); return true; }
    if(req.method==="GET" && pathname==="/account/cases/new"){ sendHtml(res,accountNewCasePage(lang,user)); return true; }
    if(req.method==="POST" && pathname==="/account/cases/new"){
      const f=await readForm(req), db=accountLoadDb(); if(!f.area||!f.title){sendHtml(res,accountNewCasePage(lang,user,"Yo‘nalish va masala nomini kiriting."),400);return true;}
      const c={id:accountId("CAS"),caseNo:accountCaseNo(db),userId:user.id,area:String(f.area),title:String(f.title).trim(),description:String(f.description||"").trim(),status:"started",progress:10,createdAt:accountNow(),updatedAt:accountNow()}; db.cases.push(c); accountAudit(db,user.id,"case_created",{caseId:c.id,caseNo:c.caseNo}); accountSaveDb(db); accountRedirect(res,`/account/case?lang=${lang}&id=${encodeURIComponent(c.id)}`); return true;
    }
    if(req.method==="GET" && pathname==="/account/case"){ sendHtml(res,accountCasePage(lang,user,accountLoadDb(),url.searchParams.get("id"))); return true; }
    if(req.method==="POST" && pathname==="/account/case/update"){
      const f=await readForm(req),db=accountLoadDb(),c=db.cases.find(x=>x.id===f.id&&x.userId===user.id); if(c){c.status=String(f.status||c.status);c.progress=Math.max(0,Math.min(100,Number(f.progress||0)));c.updatedAt=accountNow();accountAudit(db,user.id,"case_updated",{caseId:c.id,status:c.status,progress:c.progress});accountSaveDb(db);} accountRedirect(res,`/account/case?lang=${lang}&id=${encodeURIComponent(f.id||"")}`); return true;
    }
    if(req.method==="GET" && pathname==="/account/documents"){const db=accountLoadDb(),items=db.documents.filter(x=>x.userId===user.id);sendHtml(res,accountSimpleListPage(lang,user,"documents","Hujjatlarim",items,d=>`<div class="accountCard"><h3>${esc(d.title)}</h3><p class="accountMuted">${esc(d.type)} · ${esc(String(d.createdAt).slice(0,10))}</p></div>`,"Hali saqlangan hujjat yo‘q."));return true;}
    if(req.method==="GET" && pathname==="/account/chats"){const db=accountLoadDb(),items=db.conversations.filter(x=>x.userId===user.id);sendHtml(res,accountSimpleListPage(lang,user,"chats","AI suhbatlarim",items,c=>`<div class="accountCard"><h3>${esc(c.title||"AI suhbat")}</h3><p class="accountMuted">${esc(String(c.updatedAt||c.createdAt).slice(0,10))}</p></div>`,"Hali saqlangan AI suhbat yo‘q."));return true;}
    if(req.method==="GET" && pathname==="/account/notifications"){const db=accountLoadDb(),items=db.notifications.filter(x=>x.userId===user.id);sendHtml(res,accountSimpleListPage(lang,user,"notifications","Bildirishnomalar",items,n=>`<div class="accountCard"><b>${esc(n.title)}</b><p>${esc(n.text||"")}</p></div>`,"Yangi bildirishnoma yo‘q."));return true;}
    if(req.method==="GET" && pathname==="/account/profile"){sendHtml(res,accountProfilePage(lang,user));return true;}
    if(req.method==="POST" && pathname==="/account/profile"){const f=await readForm(req),db=accountLoadDb(),u=db.users.find(x=>x.id===user.id);u.firstName=String(f.firstName||u.firstName).trim();u.lastName=String(f.lastName||u.lastName).trim();u.updatedAt=accountNow();accountAudit(db,u.id,"profile_updated",{});accountSaveDb(db);sendHtml(res,accountProfilePage(lang,u,"Profil saqlandi."));return true;}
    if(req.method==="GET" && pathname==="/account/security"){sendHtml(res,accountSecurityPage(lang,user));return true;}
    if(req.method==="POST" && pathname==="/account/security"){const f=await readForm(req),db=accountLoadDb(),u=db.users.find(x=>x.id===user.id);let msg="Parol yangilandi.";if(!accountVerifyPassword(f.currentPassword,u.passwordHash)||String(f.newPassword||"").length<8||f.newPassword!==f.newPassword2){msg="Joriy parol yoki yangi parol ma’lumotlarida xato.";}else{u.passwordHash=accountHashPassword(f.newPassword);db.sessions=db.sessions.filter(s=>s.userId===u.id);accountAudit(db,u.id,"password_changed",{});accountSaveDb(db);accountSetSession(res,u.id);}sendHtml(res,accountSecurityPage(lang,u,msg));return true;}
    if(req.method==="GET" && pathname==="/account/settings"){sendHtml(res,accountSettingsPage(lang,user));return true;}
  }

  if(pathname.startsWith("/admin")){
    const auth=accountRequire(req,res,lang,["owner","admin"]); if(!auth) return true; const user=auth.user;
    if(req.method==="GET" && pathname==="/admin"){sendHtml(res,adminDashboardPage(lang,user,accountLoadDb()));return true;}
    if(req.method==="GET" && pathname==="/admin/users"){sendHtml(res,adminUsersPage(lang,user,accountLoadDb()));return true;}
    if(req.method==="GET" && pathname==="/admin/cases"){sendHtml(res,adminCasesPage(lang,user,accountLoadDb()));return true;}
    if(req.method==="GET" && pathname==="/admin/audit"){sendHtml(res,adminAuditPage(lang,user,accountLoadDb()));return true;}
    if(req.method==="POST" && pathname==="/admin/user-status"){const f=await readForm(req),db=accountLoadDb(),target=db.users.find(x=>x.id===f.id);if(target&&target.id!==user.id&&["active","suspended","blocked"].includes(f.status)){target.status=f.status;accountAudit(db,user.id,"admin_user_status_changed",{targetUserId:target.id,status:f.status});accountSaveDb(db);}accountRedirect(res,`/admin/users?lang=${lang}`);return true;}
  }
  return false;
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
        // ACCOUNT / PERSONAL CABINET / ADMIN ROUTES
        // ------------------------------------------------

        if(await accountHandleRoutes(req,res,url,pathname,lang)){
          return;
        }


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
        // FAMILY LAW
        // ------------------------------------------------

        if(
          req.method === "GET" &&
          pathname === "/family"
        ){

          return sendHtml(
            res,
            familyPage(lang)
          );

        }


        // ------------------------------------------------
        // BUSINESS LAW
        // ------------------------------------------------

        if(
          req.method === "GET" &&
          pathname === "/business"
        ){
          return sendHtml(
            res,
            businessPage(lang)
          );
        }

        if(
          req.method === "POST" &&
          pathname === "/business-result"
        ){
          const body = await readForm(req);
          return sendHtml(
            res,
            await businessResultPage(lang, body)
          );
        }


        // ------------------------------------------------
        // EMPLOYMENT LAW
        // ------------------------------------------------

        if(
          req.method === "GET" &&
          pathname === "/employment"
        ){

          return sendHtml(
            res,
            employmentPage(lang)
          );

        }


        if(
          req.method === "POST" &&
          pathname === "/employment-result"
        ){

          const form =
            await readForm(req);

          const html =
            await employmentResultPage(
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

/* BUSINESS MODULE EXPANSION ROADMAP
  1. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  2. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  3. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  4. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  5. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  6. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  7. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  8. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  9. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  10. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  11. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  12. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  13. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  14. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  15. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  16. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  17. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  18. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  19. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  20. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  21. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  22. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  23. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  24. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  25. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  26. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  27. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  28. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  29. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  30. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  31. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  32. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  33. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  34. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  35. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  36. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  37. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  38. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  39. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  40. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  41. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  42. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  43. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  44. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  45. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  46. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  47. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  48. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  49. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  50. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  51. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  52. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  53. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  54. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  55. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  56. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  57. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  58. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  59. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  60. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  61. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  62. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  63. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  64. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  65. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  66. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  67. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  68. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  69. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  70. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  71. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  72. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  73. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  74. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  75. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  76. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  77. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  78. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  79. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  80. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  81. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  82. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  83. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  84. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  85. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  86. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  87. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  88. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  89. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  90. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  91. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  92. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  93. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  94. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  95. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  96. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  97. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  98. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  99. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  100. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  101. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  102. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  103. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  104. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  105. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  106. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  107. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  108. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  109. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  110. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  111. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  112. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  113. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  114. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  115. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  116. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  117. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  118. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  119. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  120. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  121. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  122. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  123. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  124. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  125. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  126. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  127. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  128. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  129. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  130. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  131. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  132. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  133. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  134. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  135. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  136. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  137. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  138. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  139. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  140. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  141. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  142. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  143. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  144. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  145. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  146. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  147. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  148. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  149. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  150. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  151. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  152. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  153. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  154. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  155. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  156. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  157. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  158. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  159. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  160. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  161. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  162. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  163. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  164. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  165. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  166. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  167. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  168. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  169. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  170. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  171. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  172. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  173. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  174. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  175. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  176. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  177. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  178. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  179. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  180. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  181. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  182. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  183. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  184. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  185. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  186. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  187. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  188. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  189. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  190. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  191. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  192. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  193. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  194. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  195. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  196. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  197. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  198. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  199. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  200. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  201. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  202. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  203. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  204. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  205. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  206. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  207. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  208. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  209. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  210. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  211. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  212. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  213. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  214. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  215. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  216. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  217. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  218. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  219. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  220. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  221. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  222. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  223. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  224. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  225. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  226. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  227. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  228. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  229. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  230. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  231. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  232. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  233. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  234. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  235. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  236. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  237. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  238. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  239. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  240. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  241. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  242. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  243. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  244. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  245. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  246. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  247. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  248. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  249. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  250. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  251. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  252. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  253. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  254. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  255. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  256. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  257. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  258. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  259. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  260. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  261. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  262. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  263. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  264. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  265. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  266. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  267. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  268. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  269. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  270. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  271. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  272. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  273. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  274. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  275. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  276. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  277. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  278. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  279. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  280. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  281. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  282. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  283. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  284. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  285. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  286. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  287. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  288. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  289. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  290. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  291. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  292. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  293. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  294. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  295. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  296. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  297. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  298. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  299. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  300. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  301. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  302. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  303. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  304. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  305. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  306. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  307. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  308. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  309. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  310. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  311. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  312. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  313. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  314. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  315. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  316. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  317. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  318. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  319. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  320. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  321. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  322. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  323. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  324. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  325. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  326. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  327. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  328. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  329. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  330. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  331. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  332. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  333. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  334. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  335. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  336. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  337. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  338. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  339. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  340. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  341. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  342. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  343. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  344. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  345. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  346. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  347. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  348. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  349. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  350. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  351. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  352. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  353. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  354. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  355. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  356. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  357. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  358. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  359. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  360. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  361. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  362. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  363. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  364. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  365. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  366. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  367. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  368. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  369. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  370. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  371. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  372. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  373. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  374. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  375. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  376. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  377. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  378. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  379. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  380. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  381. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  382. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  383. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  384. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  385. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  386. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  387. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  388. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  389. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  390. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  391. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  392. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  393. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  394. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  395. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  396. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  397. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  398. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  399. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  400. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  401. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  402. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  403. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  404. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  405. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  406. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  407. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  408. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  409. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  410. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  411. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  412. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  413. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  414. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  415. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  416. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  417. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  418. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  419. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  420. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  421. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  422. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  423. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  424. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  425. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  426. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  427. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  428. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  429. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  430. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  431. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  432. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  433. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  434. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  435. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  436. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  437. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  438. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  439. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  440. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  441. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  442. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  443. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  444. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  445. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  446. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  447. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  448. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  449. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  450. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  451. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  452. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  453. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  454. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  455. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  456. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  457. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  458. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  459. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  460. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  461. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  462. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  463. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  464. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  465. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  466. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  467. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  468. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  469. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  470. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  471. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  472. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  473. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  474. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  475. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  476. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  477. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  478. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  479. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  480. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  481. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  482. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  483. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  484. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  485. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  486. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  487. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  488. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  489. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  490. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  491. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  492. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  493. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  494. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  495. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  496. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  497. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  498. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  499. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  500. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  501. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  502. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  503. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  504. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  505. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  506. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  507. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  508. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  509. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  510. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  511. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  512. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  513. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  514. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  515. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  516. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  517. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  518. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  519. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  520. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  521. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  522. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  523. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  524. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  525. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  526. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  527. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  528. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  529. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  530. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  531. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  532. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  533. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  534. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  535. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  536. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  537. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  538. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  539. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  540. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  541. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  542. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  543. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  544. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  545. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  546. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  547. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  548. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  549. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  550. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  551. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  552. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  553. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  554. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  555. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  556. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  557. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  558. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  559. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  560. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  561. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  562. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  563. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  564. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  565. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  566. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  567. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  568. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  569. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  570. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  571. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  572. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  573. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  574. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  575. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  576. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  577. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  578. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  579. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  580. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  581. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  582. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  583. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  584. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  585. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  586. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  587. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  588. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  589. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  590. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  591. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  592. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  593. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  594. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  595. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  596. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  597. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  598. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  599. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  600. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  601. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  602. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  603. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  604. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  605. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  606. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  607. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  608. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  609. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  610. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  611. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  612. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  613. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  614. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  615. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  616. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  617. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  618. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  619. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  620. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  621. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  622. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  623. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  624. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  625. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  626. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  627. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  628. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  629. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  630. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  631. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  632. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  633. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  634. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  635. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  636. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  637. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  638. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  639. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  640. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  641. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  642. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  643. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  644. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  645. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  646. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  647. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  648. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  649. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  650. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  651. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  652. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  653. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  654. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  655. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  656. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  657. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  658. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  659. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  660. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  661. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  662. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  663. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  664. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  665. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  666. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  667. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  668. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  669. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  670. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  671. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  672. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  673. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  674. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  675. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  676. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  677. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  678. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  679. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  680. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  681. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  682. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  683. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  684. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  685. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  686. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  687. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  688. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  689. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  690. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  691. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  692. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  693. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  694. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  695. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  696. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  697. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  698. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  699. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  700. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  701. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  702. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  703. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  704. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  705. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  706. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  707. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  708. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  709. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  710. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  711. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  712. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  713. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  714. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  715. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  716. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  717. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  718. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  719. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  720. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  721. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  722. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  723. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  724. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  725. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  726. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  727. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  728. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  729. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  730. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  731. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  732. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  733. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  734. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  735. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  736. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  737. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  738. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  739. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  740. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  741. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  742. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  743. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  744. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  745. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  746. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  747. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  748. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  749. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  750. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  751. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  752. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  753. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  754. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  755. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  756. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  757. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  758. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  759. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  760. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  761. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  762. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  763. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  764. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  765. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  766. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  767. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  768. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  769. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  770. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  771. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  772. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  773. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  774. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  775. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  776. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  777. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  778. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  779. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  780. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  781. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  782. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  783. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  784. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  785. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  786. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  787. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  788. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  789. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  790. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  791. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  792. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  793. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  794. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  795. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  796. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  797. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  798. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  799. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  800. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  801. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  802. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  803. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  804. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  805. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  806. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  807. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  808. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  809. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  810. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  811. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  812. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  813. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  814. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  815. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  816. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  817. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  818. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  819. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  820. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  821. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  822. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  823. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  824. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  825. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  826. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  827. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  828. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  829. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  830. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  831. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  832. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  833. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  834. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  835. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  836. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  837. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  838. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  839. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  840. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  841. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  842. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  843. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  844. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  845. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  846. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  847. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  848. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  849. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  850. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  851. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  852. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  853. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  854. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  855. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  856. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  857. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  858. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  859. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  860. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  861. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  862. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  863. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  864. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  865. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  866. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  867. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  868. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  869. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  870. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  871. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  872. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  873. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  874. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  875. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  876. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  877. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  878. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  879. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  880. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  881. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  882. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  883. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  884. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  885. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  886. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  887. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  888. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  889. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  890. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  891. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  892. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  893. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  894. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  895. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  896. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  897. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  898. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  899. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  900. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  901. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  902. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  903. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  904. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  905. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  906. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  907. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  908. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  909. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  910. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  911. Qurilish va ruxsatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  912. Energetika shartnomalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  913. Transport va logistika: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  914. Eksport-import: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  915. Valyuta operatsiyalari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  916. Investitsiya nizolari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  917. Kreditorlar bilan kelishuv: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  918. Mediatsiya: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  919. Hakamlik bitimi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  920. Xalqaro arbitraj bandi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  921. Korporativ compliance: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  922. Manfaatlar to‘qnashuvi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  923. Ichki siyosatlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  924. Direktor javobgarligi: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  925. Bank kafolati va ta’minotlar: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  926. Garov va kafillik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  927. Franshiza: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  928. Distribyutorlik: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  929. Elektron tijorat: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  930. Shaxsga doir ma’lumotlar biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  931. Reklama talablari: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
  932. Yer va ko‘chmas mulk biznesda: guided intake, evidence checklist, legal-source verification, document output, official-service handoff.
*/
