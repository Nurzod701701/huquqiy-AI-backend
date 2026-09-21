require('dotenv').config();

const http = require('http');
const querystring = require('querystring');

const PORT = process.env.PORT || 8080;

// ======================================================
// YORDAMCHI FUNKSIYALAR
// ======================================================

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();

      if (body.length > 2000000) {
        reject(new Error('So‘rov juda katta.'));
        req.destroy();
      }
    });

    req.on('end', () => resolve(querystring.parse(body)));
    req.on('error', reject);
  });
}

function getLang(value) {
  return ['uz', 'ru', 'en'].includes(value) ? value : 'uz';
}

function q(lang) {
  return '?lang=' + getLang(lang);
}

function money(value, lang = 'uz') {
  const number = Number(value || 0);
  if (!number) return '—';

  const locale =
    lang === 'ru' ? 'ru-RU' :
    lang === 'en' ? 'en-US' :
    'uz-UZ';

  return number.toLocaleString(locale) + ' so‘m';
}

function alimentRate(count) {
  count = Number(count || 0);

  if (count === 1) return { text: '1/4 (25%)', value: 1 / 4 };
  if (count === 2) return { text: '1/3 (33,3%)', value: 1 / 3 };
  if (count >= 3) return { text: '1/2 (50%)', value: 1 / 2 };

  return null;
}

function alimentAmount(count, income) {
  const rate = alimentRate(count);
  if (!rate || !Number(income)) return null;
  return Math.round(Number(income) * rate.value);
}

// ======================================================
// TARJIMALAR
// ======================================================

const T = {
  uz: {
    home: 'Bosh sahifa',
    ai: 'AI huquqiy tahlil',
    questionnaire: 'Savol-javob',
    court: 'Sud yo‘nalishi',
    active: 'Tizim faol',
    footer: 'Raqamli huquqiy yordamchi',

    heroBadge: 'O‘ZBEKISTON HUQUQI BO‘YICHA AI',
    hero1: 'Huquqiy masalani',
    hero2: 'tushunishdan',
    hero3: 'yechimgacha.',
    heroText:
      'Huquqiy vaziyatingizni AI yordamida tahlil qiling, savollar orqali muhim faktlarni aniqlang yoki Sud yo‘nalishi orqali da’vo arizasi tayyorlashni boshlang.',
    startAI: 'AI tahlilni boshlash',
    three: '3 ASOSIY YO‘NALISH',
    choose: 'Kerakli yo‘nalishni tanlang',

    aiCard:
      'Vaziyatingizni erkin yozing. AI undagi huquqiy masalalarni aniqlab, dastlabki tahlil beradi.',
    qCard:
      'Tizim muhim ma’lumotlarni bosqichma-bosqich so‘raydi va yakunda javoblarni bitta huquqiy vaziyatga birlashtiradi.',
    courtCard:
      'Sudga murojaat qilish uchun alohida modul. Da’vo arizasi konstruktori orqali hujjat loyihasini tayyorlang.',

    begin: 'TAHLILNI BOSHLASH →',
    beginQ: 'SAVOLLARNI BOSHLASH →',
    enterCourt: 'SUD YO‘NALISHIGA KIRISH →',

    backHome: '← Bosh sahifaga qaytish',
    writeSituation: 'Vaziyatingizni yozing',
    aiInfo:
      'Nikoh, aliment, farzand yoki mol-mulk bilan bog‘liq vaziyatni yozishingiz mumkin.',
    placeholder:
      'Masalan: 2 ta farzandim bor. Turmush o‘rtog‘im bilan ajrashmoqchimiz...',
    analyze: '✦ Huquqiy tahlil qilish',
    result: 'Huquqiy tahlil natijasi',
    yourSituation: 'Siz kiritgan vaziyat',
    aiAnalysis: 'Huquqiy AI tahlili',
    goCourt: '⚖ Sud yo‘nalishiga o‘tish',

    qTitle: 'Savol-javob orqali tahlil',
    qDesc: 'Muhim ma’lumotlarni 5 bosqichda kiriting.',
    back: '← Orqaga',
    next: 'Davom etish →',

    basicSituation: '1. Asosiy vaziyat',
    basicDesc: 'Huquqiy muammo haqida qisqacha ma’lumot bering.',
    problemType: 'Muammo turi *',
    select: 'Tanlang',
    divorce: 'Nikohdan ajratish',
    aliment: 'Aliment',
    childIssue: 'Farzand masalasi',
    property: 'Mol-mulk',
    multiple: 'Bir nechta masala',
    situationDescription: 'Vaziyat tavsifi',

    marriage: '2. Nikoh',
    marriageDesc: 'Nikoh va ajrashish holati.',
    marriageDate: 'Nikoh sanasi',
    marriagePlace: 'Nikoh qayd etilgan joy',
    consent: 'Ikki taraf ajrashishga rozimi?',
    yes: 'Ha',
    no: 'Yo‘q',
    unsure: 'Aniq emas',
    reason: 'Ajrashish sababi',

    childrenAliment: '3. Farzandlar va aliment',
    childrenDesc: 'Farzandlar hamda daromad haqidagi ma’lumotlar.',
    childrenCount: 'Farzandlar soni',
    childrenLiving: 'Farzandlar kim bilan yashaydi?',
    mother: 'Ona bilan',
    father: 'Ota bilan',
    together: 'Ota-ona bilan birga',
    childrenDetails: 'Farzandlarning yoshi va ma’lumotlari',
    workplace: 'Ish joyi',
    income: 'Oylik daromad',

    propertyStep: '4. Mol-mulk',
    propertyDesc: 'Nikoh davrida orttirilgan mol-mulk bo‘lsa kiriting.',
    propertyDetails: 'Mol-mulk haqida',
    owner: 'Kimning nomida?',
    acquired: 'Qachon olingan?',
    source: 'Mablag‘ manbasi',
    contract: 'Nikoh shartnomasi bormi?',

    finalInfo: '5. Yakuniy ma’lumot',
    finalDesc: 'Boshqa muhim holatlarni yozing.',
    additional: 'Qo‘shimcha faktlar',
    qNotice:
      'Barcha javoblaringiz AI tomonidan bitta huquqiy vaziyat sifatida tahlil qilinadi.',

    courtTitle: 'Sud yo‘nalishi',
    courtDesc: 'Sudga murojaat qilish bilan bog‘liq alohida ish muhiti.',
    courtStart: 'Sudga murojaat qilish jarayonini boshlang',
    courtText:
      'Kerakli faktlarni kiriting va da’vo arizasi loyihasini shakllantiring.',
    claim: 'Da’vo arizasi',
    claimDesc:
      'Nikohdan ajratish, aliment va mol-mulk masalalari bo‘yicha da’vo arizasi konstruktori.',
    enterConstructor: 'KONSTRUKTORGA KIRISH →',
    soon: 'TEZ ORADA',
    objection: 'E’tiroz va tushuntirish',
    objectionDesc: 'Sudga taqdim etiladigan boshqa hujjatlar moduli.',
    appeal: 'Apellyatsiya va iltimosnoma',
    appealDesc: 'Keyingi bosqichlarda qo‘shiladigan sud hujjatlari.',

    claimBuilder: 'Da’vo arizasi konstruktori',
    sixSteps: 'Ma’lumotlarni 6 bosqichda kiriting.',
    claimType: '1. Da’vo turi',
    claimTypeDesc: 'Sudga qaysi talab bilan murojaat qilmoqchisiz?',
    divorceOnly: 'Faqat nikohdan ajratish.',
    divorceAliment: 'Ajrashish + aliment',
    divorceAlimentDesc: 'Nikohdan ajratish va aliment.',
    divorceProperty: 'Ajrashish + mol-mulk',
    divorcePropertyDesc: 'Nikohdan ajratish va mol-mulk masalasi.',

    parties: '2. Sud va taraflar',
    partiesDesc: 'Sud, da’vogar va javobgar ma’lumotlari.',
    courtName: 'Sud nomi *',
    plaintiff: 'Da’vogar F.I.Sh. *',
    phone: 'Da’vogar telefoni',
    plaintiffAddress: 'Da’vogar manzili *',
    defendant: 'Javobgar F.I.Sh. *',
    defendantWork: 'Javobgar ish joyi',
    defendantAddress: 'Javobgar manzili',

    marriageChildren: '3. Nikoh va farzandlar',
    marriageChildrenDesc: 'Nikoh va farzandlar haqidagi ma’lumotlar.',
    requiredMarriageDate: 'Nikoh sanasi *',
    requiredMarriagePlace: 'Nikoh qayd etilgan joy *',
    plaintiffLiving: 'Da’vogar bilan',
    defendantLiving: 'Javobgar bilan',
    partiesLiving: 'Taraflar bilan birga',
    childrenNames: 'Farzandlar F.I.Sh. va yoshi',

    facts: '4. Faktik holatlar',
    factsDesc: 'Oilaviy munosabatlar bilan bog‘liq faktlarni kiriting.',
    requiredReason: 'Ajrashish sababi *',
    livingTogether: 'Hozir birga yashaysizmi?',
    separation: 'Alohida yashash boshlangan vaqt',
    reconciliation: 'Yarashish bo‘yicha harakatlar',

    requests: '5. Talablar',
    requestsDesc: 'Aliment va mol-mulk haqidagi ma’lumotlar.',
    alimentChildren: 'Aliment uchun farzandlar soni',
    payerIncome: 'To‘lovchining oylik daromadi',
    enterCalc: 'Farzandlar soni va daromadni kiriting.',
    propertyClaim: 'Mol-mulk tavsifi',
    propertyOwner: 'Mol-mulk kimning nomida?',
    otherRequests: 'Boshqa talablar',

    evidenceStep: '6. Dalillar va ilovalar',
    evidenceDesc: 'Sudga taqdim etiladigan hujjatlarni ko‘rsating.',
    evidence: 'Dalillar',
    attachments: 'Ilovalar',
    attachmentPlaceholder:
      'Nikoh guvohnomasi, tug‘ilganlik guvohnomasi va boshqalar...',
    checkData:
      'Ma’lumotlarni tekshiring. Keyingi tugma da’vo arizasi loyihasini shakllantiradi.',
    generate: 'Da’vo arizasini shakllantirish',

    claimReady: 'Da’vo arizasi loyihasi tayyor',
    claimReadyDesc: 'Kiritilgan ma’lumotlar asosida hujjat shakllantirildi.',
    copy: 'Nusxa olish',
    copied: 'Nusxa olindi ✓',
    print: 'Chop etish',
    newClaim: '← Yangi ariza',

    error: 'Xatolik yuz berdi',
    homeButton: 'Bosh sahifa'
  },

  ru: {
    home: 'Главная',
    ai: 'Правовой AI-анализ',
    questionnaire: 'Вопросы и ответы',
    court: 'Судебное направление',
    active: 'Система работает',
    footer: 'Цифровой юридический помощник',

    heroBadge: 'ИИ ПО ПРАВУ УЗБЕКИСТАНА',
    hero1: 'От понимания',
    hero2: 'правового вопроса',
    hero3: 'к решению.',
    heroText:
      'Проанализируйте свою правовую ситуацию с помощью ИИ, уточните важные факты через вопросы или начните подготовку искового заявления.',
    startAI: 'Начать AI-анализ',
    three: '3 ОСНОВНЫХ НАПРАВЛЕНИЯ',
    choose: 'Выберите нужное направление',

    aiCard:
      'Опишите ситуацию своими словами. ИИ определит правовые вопросы и предоставит предварительный анализ.',
    qCard:
      'Система поэтапно запросит важную информацию и объединит ответы в единую правовую ситуацию.',
    courtCard:
      'Отдельный модуль для обращения в суд и подготовки проекта искового заявления.',

    begin: 'НАЧАТЬ АНАЛИЗ →',
    beginQ: 'НАЧАТЬ ВОПРОСЫ →',
    enterCourt: 'ПЕРЕЙТИ В СУДЕБНЫЙ РАЗДЕЛ →',

    backHome: '← Вернуться на главную',
    writeSituation: 'Опишите вашу ситуацию',
    aiInfo:
      'Вы можете описать ситуацию, связанную с браком, алиментами, детьми или имуществом.',
    placeholder:
      'Например: У меня двое детей. Мы хотим развестись...',
    analyze: '✦ Провести правовой анализ',
    result: 'Результат правового анализа',
    yourSituation: 'Ваша ситуация',
    aiAnalysis: 'Анализ Huquqiy AI',
    goCourt: '⚖ Перейти в судебный раздел',

    qTitle: 'Анализ через вопросы',
    qDesc: 'Введите важную информацию за 5 шагов.',
    back: '← Назад',
    next: 'Продолжить →',

    basicSituation: '1. Основная ситуация',
    basicDesc: 'Кратко опишите правовую проблему.',
    problemType: 'Тип проблемы *',
    select: 'Выберите',
    divorce: 'Расторжение брака',
    aliment: 'Алименты',
    childIssue: 'Вопросы о детях',
    property: 'Имущество',
    multiple: 'Несколько вопросов',
    situationDescription: 'Описание ситуации',

    marriage: '2. Брак',
    marriageDesc: 'Информация о браке и разводе.',
    marriageDate: 'Дата заключения брака',
    marriagePlace: 'Место регистрации брака',
    consent: 'Обе стороны согласны на развод?',
    yes: 'Да',
    no: 'Нет',
    unsure: 'Неизвестно',
    reason: 'Причина развода',

    childrenAliment: '3. Дети и алименты',
    childrenDesc: 'Информация о детях и доходах.',
    childrenCount: 'Количество детей',
    childrenLiving: 'С кем проживают дети?',
    mother: 'С матерью',
    father: 'С отцом',
    together: 'С обоими родителями',
    childrenDetails: 'Возраст и сведения о детях',
    workplace: 'Место работы',
    income: 'Ежемесячный доход',

    propertyStep: '4. Имущество',
    propertyDesc: 'Укажите имущество, приобретённое в браке.',
    propertyDetails: 'Сведения об имуществе',
    owner: 'На кого оформлено?',
    acquired: 'Когда приобретено?',
    source: 'Источник средств',
    contract: 'Есть брачный договор?',

    finalInfo: '5. Дополнительная информация',
    finalDesc: 'Укажите другие важные обстоятельства.',
    additional: 'Дополнительные факты',
    qNotice:
      'Все ответы будут проанализированы ИИ как единая правовая ситуация.',

    courtTitle: 'Судебное направление',
    courtDesc: 'Отдельная рабочая область для обращения в суд.',
    courtStart: 'Начните подготовку обращения в суд',
    courtText:
      'Введите необходимые факты и сформируйте проект искового заявления.',
    claim: 'Исковое заявление',
    claimDesc:
      'Конструктор искового заявления по вопросам развода, алиментов и имущества.',
    enterConstructor: 'ОТКРЫТЬ КОНСТРУКТОР →',
    soon: 'СКОРО',
    objection: 'Возражение и объяснение',
    objectionDesc: 'Модуль других документов для представления в суд.',
    appeal: 'Апелляция и ходатайство',
    appealDesc: 'Судебные документы, которые будут добавлены позднее.',

    claimBuilder: 'Конструктор искового заявления',
    sixSteps: 'Введите информацию за 6 шагов.',
    claimType: '1. Тип иска',
    claimTypeDesc: 'С каким требованием вы хотите обратиться в суд?',
    divorceOnly: 'Только расторжение брака.',
    divorceAliment: 'Развод + алименты',
    divorceAlimentDesc: 'Расторжение брака и взыскание алиментов.',
    divorceProperty: 'Развод + имущество',
    divorcePropertyDesc: 'Расторжение брака и имущественный вопрос.',

    parties: '2. Суд и стороны',
    partiesDesc: 'Данные суда, истца и ответчика.',
    courtName: 'Наименование суда *',
    plaintiff: 'Ф.И.О. истца *',
    phone: 'Телефон истца',
    plaintiffAddress: 'Адрес истца *',
    defendant: 'Ф.И.О. ответчика *',
    defendantWork: 'Место работы ответчика',
    defendantAddress: 'Адрес ответчика',

    marriageChildren: '3. Брак и дети',
    marriageChildrenDesc: 'Информация о браке и детях.',
    requiredMarriageDate: 'Дата заключения брака *',
    requiredMarriagePlace: 'Место регистрации брака *',
    plaintiffLiving: 'С истцом',
    defendantLiving: 'С ответчиком',
    partiesLiving: 'Вместе со сторонами',
    childrenNames: 'Ф.И.О. и возраст детей',

    facts: '4. Фактические обстоятельства',
    factsDesc: 'Введите факты, связанные с семейными отношениями.',
    requiredReason: 'Причина развода *',
    livingTogether: 'Проживаете вместе?',
    separation: 'Когда началось раздельное проживание?',
    reconciliation: 'Попытки примирения',

    requests: '5. Требования',
    requestsDesc: 'Информация об алиментах и имуществе.',
    alimentChildren: 'Количество детей для алиментов',
    payerIncome: 'Ежемесячный доход плательщика',
    enterCalc: 'Введите количество детей и доход.',
    propertyClaim: 'Описание имущества',
    propertyOwner: 'На кого оформлено имущество?',
    otherRequests: 'Другие требования',

    evidenceStep: '6. Доказательства и приложения',
    evidenceDesc: 'Укажите документы, представляемые суду.',
    evidence: 'Доказательства',
    attachments: 'Приложения',
    attachmentPlaceholder:
      'Свидетельство о браке, свидетельства о рождении и другие документы...',
    checkData:
      'Проверьте данные. Следующая кнопка сформирует проект искового заявления.',
    generate: 'Сформировать исковое заявление',

    claimReady: 'Проект искового заявления готов',
    claimReadyDesc: 'Документ сформирован на основании введённых данных.',
    copy: 'Копировать',
    copied: 'Скопировано ✓',
    print: 'Печать',
    newClaim: '← Новый иск',

    error: 'Произошла ошибка',
    homeButton: 'Главная'
  },

  en: {
    home: 'Home',
    ai: 'AI legal analysis',
    questionnaire: 'Questionnaire',
    court: 'Court guidance',
    active: 'System online',
    footer: 'Digital legal assistant',

    heroBadge: 'AI FOR UZBEKISTAN LAW',
    hero1: 'From understanding',
    hero2: 'a legal issue',
    hero3: 'to a solution.',
    heroText:
      'Analyze your legal situation with AI, identify important facts through guided questions, or start preparing a court claim.',
    startAI: 'Start AI analysis',
    three: '3 MAIN DIRECTIONS',
    choose: 'Choose the service you need',

    aiCard:
      'Describe your situation freely. AI will identify the legal issues and provide an initial analysis.',
    qCard:
      'The system asks for important information step by step and combines your answers into one legal situation.',
    courtCard:
      'A separate module for court applications and preparing a draft statement of claim.',

    begin: 'START ANALYSIS →',
    beginQ: 'START QUESTIONS →',
    enterCourt: 'OPEN COURT GUIDANCE →',

    backHome: '← Return home',
    writeSituation: 'Describe your situation',
    aiInfo:
      'You can describe a situation involving marriage, child support, children or property.',
    placeholder:
      'Example: I have two children. My spouse and I want to divorce...',
    analyze: '✦ Analyze legal situation',
    result: 'Legal analysis result',
    yourSituation: 'Your situation',
    aiAnalysis: 'Huquqiy AI analysis',
    goCourt: '⚖ Go to court guidance',

    qTitle: 'Question-based analysis',
    qDesc: 'Enter the important information in 5 steps.',
    back: '← Back',
    next: 'Continue →',

    basicSituation: '1. Basic situation',
    basicDesc: 'Briefly describe the legal issue.',
    problemType: 'Type of issue *',
    select: 'Select',
    divorce: 'Divorce',
    aliment: 'Child support',
    childIssue: 'Child-related issue',
    property: 'Property',
    multiple: 'Multiple issues',
    situationDescription: 'Situation description',

    marriage: '2. Marriage',
    marriageDesc: 'Marriage and divorce information.',
    marriageDate: 'Marriage date',
    marriagePlace: 'Place of marriage registration',
    consent: 'Do both parties agree to divorce?',
    yes: 'Yes',
    no: 'No',
    unsure: 'Not sure',
    reason: 'Reason for divorce',

    childrenAliment: '3. Children and child support',
    childrenDesc: 'Information about children and income.',
    childrenCount: 'Number of children',
    childrenLiving: 'Who do the children live with?',
    mother: 'With mother',
    father: 'With father',
    together: 'With both parents',
    childrenDetails: 'Children’s ages and details',
    workplace: 'Workplace',
    income: 'Monthly income',

    propertyStep: '4. Property',
    propertyDesc: 'Enter property acquired during the marriage.',
    propertyDetails: 'Property details',
    owner: 'Whose name is it registered in?',
    acquired: 'When was it acquired?',
    source: 'Source of funds',
    contract: 'Is there a prenuptial agreement?',

    finalInfo: '5. Final information',
    finalDesc: 'Enter any other important circumstances.',
    additional: 'Additional facts',
    qNotice:
      'AI will analyze all your answers as one legal situation.',

    courtTitle: 'Court guidance',
    courtDesc: 'A separate workspace for matters involving court applications.',
    courtStart: 'Start preparing your court application',
    courtText:
      'Enter the necessary facts and generate a draft statement of claim.',
    claim: 'Statement of claim',
    claimDesc:
      'Claim builder for divorce, child support and property matters.',
    enterConstructor: 'OPEN CLAIM BUILDER →',
    soon: 'COMING SOON',
    objection: 'Objection and explanation',
    objectionDesc: 'Module for other documents submitted to court.',
    appeal: 'Appeal and motion',
    appealDesc: 'Additional court documents to be added later.',

    claimBuilder: 'Statement of claim builder',
    sixSteps: 'Enter the information in 6 steps.',
    claimType: '1. Type of claim',
    claimTypeDesc: 'What relief do you want to request from the court?',
    divorceOnly: 'Divorce only.',
    divorceAliment: 'Divorce + child support',
    divorceAlimentDesc: 'Divorce and child support.',
    divorceProperty: 'Divorce + property',
    divorcePropertyDesc: 'Divorce and property matters.',

    parties: '2. Court and parties',
    partiesDesc: 'Court, claimant and respondent information.',
    courtName: 'Court name *',
    plaintiff: 'Claimant’s full name *',
    phone: 'Claimant’s phone',
    plaintiffAddress: 'Claimant’s address *',
    defendant: 'Respondent’s full name *',
    defendantWork: 'Respondent’s workplace',
    defendantAddress: 'Respondent’s address',

    marriageChildren: '3. Marriage and children',
    marriageChildrenDesc: 'Information about the marriage and children.',
    requiredMarriageDate: 'Marriage date *',
    requiredMarriagePlace: 'Place of marriage registration *',
    plaintiffLiving: 'With claimant',
    defendantLiving: 'With respondent',
    partiesLiving: 'With both parties',
    childrenNames: 'Children’s full names and ages',

    facts: '4. Factual circumstances',
    factsDesc: 'Enter facts relating to the family relationship.',
    requiredReason: 'Reason for divorce *',
    livingTogether: 'Are you currently living together?',
    separation: 'When did you start living separately?',
    reconciliation: 'Reconciliation attempts',

    requests: '5. Requests',
    requestsDesc: 'Information about child support and property.',
    alimentChildren: 'Number of children for child support',
    payerIncome: 'Payer’s monthly income',
    enterCalc: 'Enter the number of children and income.',
    propertyClaim: 'Property description',
    propertyOwner: 'Whose name is the property registered in?',
    otherRequests: 'Other requests',

    evidenceStep: '6. Evidence and attachments',
    evidenceDesc: 'Specify the documents to be submitted to the court.',
    evidence: 'Evidence',
    attachments: 'Attachments',
    attachmentPlaceholder:
      'Marriage certificate, birth certificates and other documents...',
    checkData:
      'Check the information. The next button will generate a draft statement of claim.',
    generate: 'Generate statement of claim',

    claimReady: 'Draft statement of claim is ready',
    claimReadyDesc: 'The document was generated from the information provided.',
    copy: 'Copy',
    copied: 'Copied ✓',
    print: 'Print',
    newClaim: '← New claim',

    error: 'An error occurred',
    homeButton: 'Home'
  }
};

function tr(lang, key) {
  lang = getLang(lang);
  return T[lang][key] || T.uz[key] || key;
}

// ======================================================
// AI
// ======================================================

async function callAI(question, lang = 'uz') {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY topilmadi. .env faylni tekshiring.');
  }

  lang = getLang(lang);

  const languageInstruction =
    lang === 'ru'
      ? 'Отвечай только на русском языке.'
      : lang === 'en'
      ? 'Answer only in English.'
      : 'Faqat o‘zbek tilida javob ber.';

  const headings =
    lang === 'ru'
      ? `
Используй структуру:
КРАТКИЙ ВЫВОД
ВЫЯВЛЕННЫЕ ПРАВОВЫЕ ВОПРОСЫ
ПРАВОВОЙ АНАЛИЗ
НЕДОСТАЮЩАЯ ИНФОРМАЦИЯ
СЛЕДУЮЩИЕ ШАГИ
ПРАВОВЫЕ ИСТОЧНИКИ`
      : lang === 'en'
      ? `
Use this structure:
SHORT CONCLUSION
IDENTIFIED LEGAL ISSUES
LEGAL ANALYSIS
MISSING INFORMATION
NEXT STEPS
LEGAL SOURCES`
      : `
Javob tuzilishi:
QISQA XULOSA
ANIQLANGAN HUQUQIY MASALALAR
HUQUQIY TAHLIL
YETISHMAYOTGAN MA’LUMOTLAR
KEYINGI QADAMLAR
HUQUQIY MANBALAR`;

  const systemPrompt = `
You are "Huquqiy AI", a digital legal assistant focused on the law of Uzbekistan,
especially family law.

${languageInstruction}

IMPORTANT RULES:
1. Do not invent facts that the user did not provide.
2. Do not invent article numbers, laws, court decisions or legal sources.
3. Do not guarantee the outcome of a court case.
4. Separate different legal issues when there is more than one.
5. Clearly state what additional information is needed.
6. Give a clear, professional and understandable answer.
7. When current legislation needs verification, tell the user that the current
   official text should be checked through LexUZ.
8. For child support issues, consider the number of children and income
   information provided by the user.
9. The user may write in Uzbek, Russian or English. Understand the user's text,
   but your final answer MUST be in the selected language specified above.
10. Do not claim that a draft generated by this service is automatically ready
    for filing in court. Explain that procedural details should be checked.

${headings}
`;

  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.OPENROUTER_API_KEY,
        'Content-Type': 'application/json',
        'X-Title': 'Huquqiy AI'
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        temperature: 0.1,
        max_tokens: 2000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ]
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'AI xizmatida xatolik.');
  }

  return data?.choices?.[0]?.message?.content || 'AI javob qaytarmadi.';
}

// ======================================================
// CSS
// ======================================================

const CSS = `
*{
  box-sizing:border-box;
}

:root{
  --navy:#0b1f36;
  --navy2:#132b47;
  --navy3:#1b395b;

  --blue:#2457d6;
  --blueSoft:#edf3ff;

  --gold:#b8904f;
  --goldSoft:#f8f3e9;

  --green:#17815f;
  --greenSoft:#edf8f4;

  --purple:#6656b9;

  --bg:#f6f7f9;
  --surface:#ffffff;

  --text:#172335;
  --muted:#68778a;

  --line:#e2e6eb;
  --lineDark:#d4dae2;

  --shadow:
    0 12px 35px rgba(11,31,54,.07);

  --shadowStrong:
    0 22px 55px rgba(11,31,54,.11);
}


/* =========================
   BASE
========================= */

html{
  scroll-behavior:smooth;
}

body{
  margin:0;

  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Arial,
    sans-serif;

  background:var(--bg);
  color:var(--text);

  -webkit-font-smoothing:antialiased;
}

a{
  color:inherit;
  text-decoration:none;
}

button,
input,
select,
textarea{
  font:inherit;
}

button{
  cursor:pointer;
}

::selection{
  background:#dce6ff;
  color:#0b1f36;
}


/* =========================
   NAVIGATION
========================= */

.nav{
  min-height:76px;

  background:
    rgba(11,31,54,.98);

  color:white;

  display:flex;
  align-items:center;

  position:sticky;
  top:0;

  z-index:1000;

  border-bottom:
    1px solid rgba(255,255,255,.08);

  backdrop-filter:blur(16px);
}


.navin{
  width:min(1240px,94%);

  margin:auto;

  display:flex;
  align-items:center;
  justify-content:space-between;

  gap:25px;

  padding:11px 0;
}


.logo{
  display:flex;
  align-items:center;

  font-family:Georgia,"Times New Roman",serif;

  font-size:22px;
  font-weight:700;

  letter-spacing:-.4px;

  white-space:nowrap;
}


.logo:before{
  content:"§";

  width:38px;
  height:38px;

  margin-right:11px;

  border:
    1px solid rgba(184,144,79,.7);

  border-radius:8px;

  display:grid;
  place-items:center;

  color:#d7b879;

  font-family:Georgia,serif;
  font-size:21px;
}


.logo span{
  color:#d7b879;
  margin-left:5px;
}


.navright{
  display:flex;
  align-items:center;
  gap:18px;
}


.links{
  display:flex;
  align-items:center;
  gap:2px;
}


.links a{
  padding:10px 13px;

  border-radius:7px;

  font-size:12px;
  font-weight:600;

  color:#c4cfdb;

  transition:.18s;
}


.links a:hover{
  color:white;
  background:rgba(255,255,255,.07);
}


.language{
  display:flex;

  padding:3px;

  border:
    1px solid rgba(255,255,255,.10);

  border-radius:8px;

  background:
    rgba(255,255,255,.04);
}


.language a{
  padding:7px 9px;

  border-radius:6px;

  font-size:10px;
  font-weight:700;

  color:#aebdca;

  white-space:nowrap;
}


.language a:hover{
  color:white;
}


.language a.on{
  background:white;
  color:var(--navy);
}


.status{
  padding-left:12px;

  border-left:
    1px solid rgba(255,255,255,.12);

  color:#92d6bc;

  font-size:9px;
  font-weight:700;

  white-space:nowrap;
}


/* =========================
   GENERAL
========================= */

.wrap{
  width:min(1180px,92%);
  margin:auto;
}


/* =========================
   HERO
========================= */

.hero{
  min-height:570px;

  padding:85px 0 65px;

  display:grid;

  grid-template-columns:
    minmax(0,1.08fr)
    minmax(360px,.92fr);

  gap:70px;

  align-items:center;
}


.hero h1{
  max-width:720px;

  margin:19px 0 22px;

  color:var(--navy);

  font-family:
    Georgia,
    "Times New Roman",
    serif;

  font-size:59px;
  font-weight:500;

  line-height:1.06;

  letter-spacing:-2.2px;
}


.hero h1 span{
  display:block;
  color:#2855a8;
}


.hero p{
  max-width:650px;

  margin:0;

  color:var(--muted);

  font-size:15px;
  line-height:1.8;
}


.badge{
  display:inline-flex;
  align-items:center;

  padding:7px 11px;

  border:
    1px solid #e5d7bd;

  border-radius:5px;

  background:var(--goldSoft);

  color:#8c692e;

  font-size:9px;
  font-weight:800;

  letter-spacing:1.1px;
}


.heroButtons{
  display:flex;
  flex-wrap:wrap;

  gap:10px;

  margin-top:30px;
}


/* =========================
   BUTTONS
========================= */

.btn{
  min-height:44px;

  padding:11px 18px;

  border:0;
  border-radius:7px;

  display:inline-flex;
  align-items:center;
  justify-content:center;

  gap:7px;

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


.blue{
  background:var(--navy);
  color:white;

  box-shadow:
    0 7px 18px rgba(11,31,54,.13);
}


.blue:hover{
  background:#142d4b;
}


.dark{
  background:var(--navy);
  color:white;
}


.purple{
  background:#53468f;
  color:white;
}


.white{
  background:white;

  border:
    1px solid var(--lineDark);

  color:var(--navy);
}


.white:hover{
  background:#f8fafc;
}


/* =========================
   HERO LEGAL DEMO
========================= */

.demo{
  position:relative;

  background:white;

  border:
    1px solid #dde2e8;

  border-radius:12px;

  padding:27px;

  box-shadow:var(--shadowStrong);
}


.demo:before{
  content:"";

  position:absolute;

  top:0;
  left:27px;
  right:27px;

  height:3px;

  background:
    linear-gradient(
      90deg,
      var(--gold),
      #d4bb88
    );
}


.demoTop{
  display:flex;
  align-items:center;

  gap:12px;

  padding-bottom:18px;

  margin-bottom:20px;

  border-bottom:
    1px solid var(--line);

  color:var(--navy);

  font-size:13px;
  font-weight:800;
}


.avatar{
  width:42px;
  height:42px;

  border-radius:8px;

  display:grid;
  place-items:center;

  background:var(--navy);

  color:#d9bc80;

  font-family:Georgia,serif;

  font-size:13px;
  font-weight:800;
}


.bubble{
  margin-bottom:12px;

  padding:15px 17px;

  border:
    1px solid var(--line);

  border-radius:9px;

  background:#fafbfc;

  color:#536175;

  font-size:12px;
  line-height:1.7;
}


.aiBubble{
  padding:16px 17px;

  border-left:
    3px solid var(--gold);

  border-radius:6px;

  background:#f7f8fa;

  color:#43546a;

  font-size:12px;
  line-height:1.7;
}


/* =========================
   HOMEPAGE SECTIONS
========================= */

.section{
  padding:55px 0 90px;
}


.section h2{
  margin:12px 0 8px;

  color:var(--navy);

  font-family:
    Georgia,
    "Times New Roman",
    serif;

  font-size:34px;
  font-weight:500;

  letter-spacing:-.8px;
}


.cards{
  display:grid;

  grid-template-columns:
    repeat(3,1fr);

  gap:16px;

  margin-top:30px;
}


.card{
  min-height:330px;

  padding:27px;

  border-radius:10px;

  display:flex;
  flex-direction:column;

  position:relative;

  overflow:hidden;

  transition:
    transform .2s,
    box-shadow .2s,
    border-color .2s;
}


.card:hover{
  transform:translateY(-4px);
  box-shadow:var(--shadowStrong);
}


.c1,
.c2{
  background:white;

  border:
    1px solid var(--line);
}


.c1:hover,
.c2:hover{
  border-color:#c5ced9;
}


.c3{
  background:var(--navy);

  border:
    1px solid var(--navy);

  color:white;
}


.number{
  position:absolute;

  right:22px;
  top:18px;

  color:var(--navy);

  font-family:Georgia,serif;

  font-size:42px;

  opacity:.07;
}


.c3 .number{
  color:white;
  opacity:.08;
}


.icon{
  width:48px;
  height:48px;

  margin-bottom:27px;

  border:
    1px solid #dce3eb;

  border-radius:8px;

  display:grid;
  place-items:center;

  background:#f7f9fb;

  color:var(--navy);

  font-size:19px;
}


.c2 .icon{
  background:var(--greenSoft);
  color:var(--green);

  border-color:#d8ebe4;
}


.c3 .icon{
  background:rgba(184,144,79,.14);

  color:#d8b978;

  border-color:
    rgba(216,185,120,.25);
}


.card h3{
  margin:0 0 11px;

  font-family:Georgia,serif;

  font-size:20px;
  font-weight:600;
}


.c1 h3,
.c2 h3{
  color:var(--navy);
}


.card p{
  margin:0;

  color:#728094;

  font-size:12px;
  line-height:1.75;
}


.c3 p{
  color:#b8c3cf;
}


.go{
  margin-top:auto;

  padding-top:19px;

  border-top:
    1px solid var(--line);

  font-size:10px;
  font-weight:800;

  letter-spacing:.4px;
}


.c1 .go{
  color:#2855a8;
}


.c2 .go{
  color:var(--green);
}


.c3 .go{
  color:#d7b879;

  border-color:
    rgba(255,255,255,.1);
}


/* =========================
   APP LAYOUT
========================= */

.app{
  width:min(1200px,94%);

  margin:30px auto 80px;

  display:grid;

  grid-template-columns:
    225px minmax(0,1fr);

  gap:25px;
}


/* =========================
   SIDEBAR
========================= */

.side{
  height:fit-content;

  padding:10px;

  position:sticky;
  top:96px;

  background:white;

  border:
    1px solid var(--line);

  border-radius:10px;

  box-shadow:
    0 8px 24px rgba(11,31,54,.04);
}


.side:before{
  content:"HUQUQIY XIZMATLAR";

  display:block;

  padding:
    10px 11px 13px;

  color:#98a2af;

  font-size:8px;
  font-weight:800;

  letter-spacing:1.2px;
}


.side a{
  display:flex;
  align-items:center;

  min-height:43px;

  margin:2px 0;

  padding:11px 12px;

  border-radius:7px;

  color:#5d6c80;

  font-size:11px;
  font-weight:700;

  transition:.16s;
}


.side a:hover{
  background:#f5f7fa;
  color:var(--navy);
}


.side a.on{
  background:#edf2f8;

  color:var(--navy);

  box-shadow:
    inset 3px 0 0 var(--navy);
}


.side .court{
  margin-top:7px;

  border-top:
    1px solid var(--line);

  color:#735d32;
}


/* =========================
   PAGE HEADER
========================= */

.head{
  margin-bottom:23px;
}


.head small{
  color:#8995a4;

  font-size:10px;
  font-weight:700;
}


.head h1{
  margin:9px 0 7px;

  color:var(--navy);

  font-family:
    Georgia,
    "Times New Roman",
    serif;

  font-size:34px;
  font-weight:500;

  letter-spacing:-.7px;
}


.head p{
  max-width:720px;

  margin:0;

  color:var(--muted);

  font-size:12px;
  line-height:1.7;
}


/* =========================
   SURFACES
========================= */

.surface{
  background:white;

  border:
    1px solid var(--line);

  border-radius:11px;

  box-shadow:
    0 8px 28px rgba(11,31,54,.045);
}


.pad{
  padding:29px;
}


/* =========================
   FORMS
========================= */

.field{
  margin-bottom:18px;
}


.field label{
  display:block;

  margin-bottom:7px;

  color:#425268;

  font-size:11px;
  font-weight:750;
}


input,
select,
textarea{
  width:100%;

  padding:12px 13px;

  border:
    1px solid #d8dee7;

  border-radius:7px;

  outline:0;

  background:#fff;

  color:var(--text);

  transition:
    border .15s,
    box-shadow .15s;
}


input:hover,
select:hover,
textarea:hover{
  border-color:#c6cfda;
}


input:focus,
select:focus,
textarea:focus{
  border-color:#7189ac;

  box-shadow:
    0 0 0 3px rgba(58,91,139,.08);
}


textarea{
  min-height:110px;

  resize:vertical;

  line-height:1.6;
}


.grid2{
  display:grid;

  grid-template-columns:
    1fr 1fr;

  gap:14px;
}


/* =========================
   PROGRESS
========================= */

.steps{
  display:flex;

  gap:5px;

  margin:16px 0 27px;
}


.steps i{
  height:4px;

  flex:1;

  border-radius:10px;

  background:#e5e9ee;
}


.steps i.on{
  background:var(--navy);
}


/* =========================
   FORM STEPS
========================= */

.step{
  display:none;
}


.step.on{
  display:block;

  animation:
    legalFade .22s ease;
}


@keyframes legalFade{

  from{
    opacity:0;
    transform:translateY(5px);
  }

  to{
    opacity:1;
    transform:translateY(0);
  }

}


.step h2{
  margin:0 0 7px;

  color:var(--navy);

  font-family:Georgia,serif;

  font-size:23px;
  font-weight:600;
}


.step>p{
  margin:0 0 25px;

  color:#7c8999;

  font-size:11px;
  line-height:1.6;
}


.actions{
  display:flex;

  justify-content:space-between;

  gap:10px;

  padding:18px 27px;

  border-top:
    1px solid var(--line);

  background:#fafbfc;

  border-radius:
    0 0 11px 11px;
}


/* =========================
   CLAIM TYPES
========================= */

.types{
  display:grid;

  grid-template-columns:
    repeat(3,1fr);

  gap:11px;
}


.type{
  min-height:140px;

  padding:18px;

  border:
    1px solid var(--line);

  border-radius:8px;

  background:white;

  cursor:pointer;

  transition:.16s;
}


.type:hover{
  border-color:#b8c3d0;
}


.type:has(input:checked){
  border-color:#637b9e;

  background:#f4f7fb;

  box-shadow:
    inset 0 0 0 1px #637b9e;
}


.type input{
  width:auto;
}


.type strong{
  display:block;

  margin:14px 0 6px;

  color:var(--navy);

  font-size:12px;
}


.type small{
  color:#7d8998;

  font-size:9px;
  line-height:1.5;
}


/* =========================
   AI RESULT
========================= */

.result{
  white-space:pre-wrap;

  color:#33445a;

  font-size:13px;
  line-height:1.85;
}


/* =========================
   LEGAL DOCUMENT
========================= */

.doc{
  max-width:850px;

  margin:auto;

  padding:55px 60px;

  background:white;

  border:
    1px solid #d7dce2;

  box-shadow:
    0 15px 45px rgba(11,31,54,.08);

  font-family:
    Georgia,
    "Times New Roman",
    serif;

  white-space:pre-wrap;

  line-height:1.85;

  color:#1c2633;
}


/* =========================
   COURT TOOLS
========================= */

.tools{
  display:grid;

  grid-template-columns:
    repeat(3,1fr);

  gap:15px;
}


.tool{
  min-height:235px;

  padding:25px;

  position:relative;

  overflow:hidden;
}


.tool:before{
  content:"";

  position:absolute;

  top:0;
  left:0;

  width:100%;
  height:3px;

  background:var(--navy);
}


.tool h3{
  margin-top:10px;

  color:var(--navy);

  font-family:Georgia,serif;
}


.tool p{
  color:var(--muted);

  font-size:11px;
  line-height:1.7;
}


/* =========================
   SCROLLBAR
========================= */

::-webkit-scrollbar{
  width:8px;
  height:8px;
}


::-webkit-scrollbar-track{
  background:#f0f2f5;
}


::-webkit-scrollbar-thumb{
  background:#c3cad3;

  border-radius:10px;
}


/* =========================
   TABLET
========================= */

@media(max-width:950px){

  .links{
    display:none;
  }

  .status{
    display:none;
  }

  .hero{
    gap:35px;
  }

}


/* =========================
   MOBILE
========================= */

@media(max-width:850px){

  .hero,
  .cards,
  .app,
  .tools{
    grid-template-columns:1fr;
  }


  .hero{
    min-height:auto;

    padding:
      55px 0 45px;
  }


  .hero h1{
    font-size:45px;
  }


  .demo{
    max-width:620px;
  }


  .app{
    margin-top:15px;
  }


  .side{
    display:flex;

    width:100%;

    position:static;

    overflow-x:auto;

    gap:5px;

    padding:7px;
  }


  .side:before{
    display:none;
  }


  .side a{
    flex:0 0 auto;

    min-height:40px;

    margin:0;

    padding:10px 12px;

    white-space:nowrap;

    box-shadow:none !important;
  }


  .side a.on{
    background:var(--navy);
    color:white;
  }


  .side .court{
    margin:0;
    border:0;
  }


  .grid2,
  .types{
    grid-template-columns:1fr;
  }


  .navin{
    align-items:center;
  }


  .navright{
    flex-direction:column;
    align-items:flex-end;

    gap:6px;
  }


  .language a{
    padding:6px 7px;
    font-size:9px;
  }

}


/* =========================
   SMALL MOBILE
========================= */

@media(max-width:520px){

  .nav{
    min-height:68px;
  }


  .navin{
    width:94%;
  }


  .logo{
    font-size:17px;
  }


  .logo:before{
    width:32px;
    height:32px;

    margin-right:7px;

    font-size:17px;
  }


  .language a{
    padding:6px;

    font-size:0;
  }


  .language a::first-letter{
    font-size:15px;
  }


  .hero{
    padding-top:40px;
  }


  .hero h1{
    font-size:38px;
    letter-spacing:-1.3px;
  }


  .hero p{
    font-size:13px;
  }


  .heroButtons .btn{
    width:100%;
  }


  .demo{
    padding:20px;
  }


  .section{
    padding-top:35px;
  }


  .section h2{
    font-size:29px;
  }


  .card{
    min-height:285px;
  }


  .app{
    width:94%;
  }


  .pad{
    padding:20px;
  }


  .head h1{
    font-size:29px;
  }


  .doc{
    padding:28px 22px;
  }


  .actions{
    padding:15px 18px;
  }


  .actions .btn{
    padding:10px 13px;
  }

}


/* =========================
   PRINT
========================= */

@media print{

  .nav,
  .side,
  .tools,
  .actions,
  footer{
    display:none !important;
  }


  body{
    background:white;
  }


  .app{
    display:block;

    width:100%;

    margin:0;
  }


  .doc{
    border:0;

    box-shadow:none;

    max-width:none;

    padding:0;
  }

}
}
`;

// ======================================================
// UMUMIY LAYOUT
// ======================================================

function languageMenu(lang, path) {
  return `
  <div class="language">
    <a class="${lang === 'uz' ? 'on' : ''}" href="${path}?lang=uz">🇺🇿 O‘zbekcha</a>
    <a class="${lang === 'ru' ? 'on' : ''}" href="${path}?lang=ru">🇷🇺 Русский</a>
    <a class="${lang === 'en' ? 'on' : ''}" href="${path}?lang=en">🇬🇧 English</a>
  </div>`;
}

function layout(content, title = 'Huquqiy AI', lang = 'uz', path = '/') {
  lang = getLang(lang);

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · Huquqiy AI</title>
<style>${CSS}</style>
</head>
<body>

<header class="nav">
<div class="navin">

<a class="logo" href="/${q(lang)}">Huquqiy <span>AI</span></a>

<div class="navright">

<nav class="links">
<a href="/ai${q(lang)}">${tr(lang, 'ai')}</a>
<a href="/questionnaire${q(lang)}">${tr(lang, 'questionnaire')}</a>
<a href="/court${q(lang)}">${tr(lang, 'court')}</a>
</nav>

${languageMenu(lang, path)}

<div class="status">● ${tr(lang, 'active')}</div>

</div>
</div>
</header>

${content}

<footer style="text-align:center;padding:30px;color:#9aa5b4;font-size:10px">
Huquqiy AI · ${tr(lang, 'footer')}
</footer>

</body>
</html>`;
}

function sidebar(active, lang) {
  return `<aside class="side">
<a href="/${q(lang)}" class="${active === 'home' ? 'on' : ''}">⌂ ${tr(lang, 'home')}</a>
<a href="/ai${q(lang)}" class="${active === 'ai' ? 'on' : ''}">✦ ${tr(lang, 'ai')}</a>
<a href="/questionnaire${q(lang)}" class="${active === 'q' ? 'on' : ''}">☷ ${tr(lang, 'questionnaire')}</a>
<a href="/court${q(lang)}" class="court ${active === 'court' ? 'on' : ''}">⚖ ${tr(lang, 'court')}</a>
</aside>`;
}

// ======================================================
// BOSH SAHIFA
// ======================================================

function homePage(lang) {
  return layout(`
<main>

<section class="wrap hero">

<div>
<span class="badge">${tr(lang, 'heroBadge')}</span>

<h1>
${tr(lang, 'hero1')}
<span>${tr(lang, 'hero2')}</span>
${tr(lang, 'hero3')}
</h1>

<p>${tr(lang, 'heroText')}</p>

<div class="heroButtons">
<a class="btn blue" href="/ai${q(lang)}">${tr(lang, 'startAI')}</a>
<a class="btn purple" href="/court${q(lang)}">⚖ ${tr(lang, 'court')}</a>
</div>
</div>

<div class="demo">
<div class="demoTop">
<div class="avatar">AI</div>
Huquqiy AI
</div>

<div class="bubble">
${
  lang === 'ru'
    ? 'У меня двое детей. Мы хотим развестись. Во время брака купили дом. Что будет с алиментами и домом?'
    : lang === 'en'
    ? 'I have two children. We want to divorce. We bought a house during the marriage. What happens with child support and the house?'
    : '2 ta farzandim bor. Ajrashmoqchimiz. Nikoh davrida uy olganmiz. Aliment va uy masalasi qanday bo‘ladi?'
}
</div>

<div class="aiBubble">
<strong>${
  lang === 'ru'
    ? 'Выявлено несколько правовых вопросов'
    : lang === 'en'
    ? 'Several legal issues identified'
    : 'Bir nechta huquqiy masala aniqlandi'
}</strong><br><br>
${
  lang === 'ru'
    ? 'Необходимо отдельно рассмотреть расторжение брака, алименты и имущество, приобретённое во время брака.'
    : lang === 'en'
    ? 'Divorce, child support and property acquired during the marriage should be analyzed separately.'
    : 'Nikohdan ajratish, aliment va nikoh davomida orttirilgan mol-mulk masalalarini alohida tahlil qilish kerak.'
}
</div>
</div>

</section>

<section class="wrap section">

<span class="badge">${tr(lang, 'three')}</span>
<h2>${tr(lang, 'choose')}</h2>

<div class="cards">

<a href="/ai${q(lang)}" class="card c1">
<span class="number">01</span>
<div class="icon">✦</div>
<h3>${tr(lang, 'ai')}</h3>
<p>${tr(lang, 'aiCard')}</p>
<div class="go">${tr(lang, 'begin')}</div>
</a>

<a href="/questionnaire${q(lang)}" class="card c2">
<span class="number">02</span>
<div class="icon">☷</div>
<h3>${tr(lang, 'qTitle')}</h3>
<p>${tr(lang, 'qCard')}</p>
<div class="go">${tr(lang, 'beginQ')}</div>
</a>

<a href="/court${q(lang)}" class="card c3">
<span class="number">03</span>
<div class="icon">⚖</div>
<h3>${tr(lang, 'court')}</h3>
<p>${tr(lang, 'courtCard')}</p>
<div class="go">${tr(lang, 'enterCourt')}</div>
</a>

</div>
</section>
</main>
`, 'Huquqiy AI', lang, '/');
}

// ======================================================
// AI SAHIFA
// ======================================================

function aiPage(lang) {

  const voiceText =
    lang === 'ru'
      ? {
          start: '🎙 Говорить',
          stop: '■ Остановить',
          listening: 'Слушаю... говорите.',
          ready: 'Готово. Проверьте текст.',
          denied: 'Разрешите доступ к микрофону.',
          unsupported:
            'Голосовой ввод не поддерживается. Откройте сайт в Chrome или Edge.'
        }
      : lang === 'en'
      ? {
          start: '🎙 Speak',
          stop: '■ Stop',
          listening: 'Listening... speak now.',
          ready: 'Done. Review the text.',
          denied: 'Please allow microphone access.',
          unsupported:
            'Voice input is not supported. Open the site in Chrome or Edge.'
        }
      : {
          start: '🎙 Ovoz bilan aytish',
          stop: '■ To‘xtatish',
          listening: 'Eshityapman... gapiravering.',
          ready: 'Tayyor. Matnni tekshiring.',
          denied: 'Mikrofonga ruxsat bering.',
          unsupported:
            'Ovozli kiritish ishlamaydi. Saytni Chrome yoki Edge’da oching.'
        };

  const speechLang =
    lang === 'ru'
      ? 'ru-RU'
      : lang === 'en'
      ? 'en-US'
      : 'uz-UZ';

  return layout(`
<div class="app">

${sidebar('ai', lang)}

<main>

<div class="head">

<a
  href="/${q(lang)}"
  class="btn white"
  style="margin-bottom:18px"
>
${tr(lang, 'backHome')}
</a>

<small style="display:block">
${tr(lang, 'home')} / ${tr(lang, 'ai')}
</small>

<h1>${tr(lang, 'ai')}</h1>

<p>${tr(lang, 'aiInfo')}</p>

</div>


<section class="surface pad">

<div style="
  text-align:center;
  padding:30px 10px 20px;
">

<div
  class="avatar"
  style="margin:auto"
>
AI
</div>

<h2 style="color:var(--navy)">
${tr(lang, 'writeSituation')}
</h2>

<p style="
  color:var(--muted);
  font-size:11px;
">
${tr(lang, 'aiInfo')}
</p>

</div>


<form
  action="/ai-result"
  method="POST"
>

<input
  type="hidden"
  name="lang"
  value="${lang}"
>


<div class="field">

<textarea
  id="aiQuestion"
  name="question"
  required
  style="min-height:180px"
  placeholder="${esc(tr(lang, 'placeholder'))}"
></textarea>

</div>


<!-- OVOZLI KIRITISH -->

<div
  style="
    display:flex;
    align-items:center;
    gap:12px;
    flex-wrap:wrap;
    margin-bottom:15px;
  "
>

<button
  id="voiceBtn"
  type="button"
  class="btn white"
  style="
    border:1.5px solid #b9c9ef;
    color:#315eea;
    min-width:170px;
  "
>
${voiceText.start}
</button>


<span
  id="voiceStatus"
  style="
    color:var(--muted);
    font-size:11px;
  "
></span>

</div>


<!-- RECORDING STATUS -->

<div
  id="recordingBox"
  style="
    display:none;
    background:#fff2f2;
    border:1px solid #ffd3d3;
    border-radius:12px;
    padding:13px 15px;
    margin-bottom:15px;
    color:#c63f3f;
    font-size:11px;
    font-weight:800;
  "
>

<span
  id="recordDot"
  style="
    display:inline-block;
    width:9px;
    height:9px;
    background:#e5484d;
    border-radius:50%;
    margin-right:8px;
  "
></span>

${voiceText.listening}

</div>


<button
  class="btn blue"
  type="submit"
>
${tr(lang, 'analyze')}
</button>

</form>

</section>

</main>

</div>


<style>

#recordDot {
  animation: voicePulse 1s infinite;
}

@keyframes voicePulse {

  0% {
    opacity:1;
    transform:scale(1);
  }

  50% {
    opacity:.35;
    transform:scale(1.5);
  }

  100% {
    opacity:1;
    transform:scale(1);
  }

}

#voiceBtn.recording {
  background:#e5484d;
  color:white !important;
  border-color:#e5484d !important;
}

</style>


<script>

(function(){

  var button =
    document.getElementById('voiceBtn');

  var status =
    document.getElementById('voiceStatus');

  var textarea =
    document.getElementById('aiQuestion');

  var recordingBox =
    document.getElementById('recordingBox');


  var SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (!SpeechRecognition) {

    button.addEventListener(
      'click',
      function(){

        status.textContent =
          ${JSON.stringify(voiceText.unsupported)};

      }
    );

    return;

  }


  var recognition =
    new SpeechRecognition();


  recognition.lang =
    ${JSON.stringify(speechLang)};


  recognition.continuous = true;

  recognition.interimResults = true;

  recognition.maxAlternatives = 1;


  var active = false;

  var savedText = '';


  function startVoice(){

    savedText =
      textarea.value.trim();


    try {

      recognition.start();

      active = true;

      button.textContent =
        ${JSON.stringify(voiceText.stop)};

      button.classList.add(
        'recording'
      );

      recordingBox.style.display =
        'block';

      status.textContent =
        ${JSON.stringify(voiceText.listening)};

    }

    catch(error){

      console.log(error);

    }

  }


  function stopVoice(){

    try {

      recognition.stop();

    }

    catch(error){

      console.log(error);

    }

  }


  button.addEventListener(
    'click',
    function(){

      if(active){

        stopVoice();

      }

      else{

        startVoice();

      }

    }
  );


  recognition.onresult =
    function(event){

      var finalText = '';

      var interimText = '';


      for(
        var i = event.resultIndex;
        i < event.results.length;
        i++
      ){

        var transcript =
          event.results[i][0].transcript;


        if(
          event.results[i].isFinal
        ){

          finalText +=
            transcript.trim() + ' ';

        }

        else{

          interimText +=
            transcript;

        }

      }


      if(finalText){

        savedText +=
          (savedText ? ' ' : '') +
          finalText.trim();

      }


      textarea.value =
        savedText +
        (
          interimText
            ? (savedText ? ' ' : '') +
              interimText
            : ''
        );

    };


  recognition.onend =
    function(){

      active = false;


      button.textContent =
        ${JSON.stringify(voiceText.start)};


      button.classList.remove(
        'recording'
      );


      recordingBox.style.display =
        'none';


      if(
        textarea.value.trim()
      ){

        status.textContent =
          ${JSON.stringify(voiceText.ready)};

      }

    };


  recognition.onerror =
    function(event){

      active = false;


      button.textContent =
        ${JSON.stringify(voiceText.start)};


      button.classList.remove(
        'recording'
      );


      recordingBox.style.display =
        'none';


      if(
        event.error === 'not-allowed' ||
        event.error ===
          'service-not-allowed'
      ){

        status.textContent =
          ${JSON.stringify(voiceText.denied)};

      }

      else{

        status.textContent =
          ${JSON.stringify(voiceText.unsupported)};

      }

    };

})();

</script>

`, tr(lang, 'ai'), lang, '/ai');

}
  

function aiResultPage(question, answer, lang) {
  return layout(`
<div class="app">

${sidebar('ai', lang)}

<main>

<div class="head">
<small>${tr(lang, 'ai')} / ${tr(lang, 'result')}</small>
<h1>${tr(lang, 'result')}</h1>
</div>

<section class="surface pad" style="margin-bottom:16px">
<strong>${tr(lang, 'yourSituation')}</strong>
<p style="color:var(--muted);line-height:1.7;font-size:12px">
${esc(question)}
</p>
</section>

<section class="surface pad">

<div style="display:flex;gap:10px;align-items:center;margin-bottom:20px">
<div class="avatar">AI</div>
<strong>${tr(lang, 'aiAnalysis')}</strong>
</div>

<div class="result">${esc(answer)}</div>

<div style="margin-top:25px;display:flex;gap:10px;flex-wrap:wrap">
<a class="btn white" href="/ai${q(lang)}">${tr(lang, 'back')}</a>
<a class="btn purple" href="/court${q(lang)}">${tr(lang, 'goCourt')}</a>
</div>

</section>
</main>
</div>
`, tr(lang, 'result'), lang, '/ai');
}

// ======================================================
// SAVOL-JAVOB
// ======================================================

function questionnairePage(lang) {
  return layout(`
<div class="app">

${sidebar('q', lang)}

<main>

<div class="head">
<small>${tr(lang, 'home')} / ${tr(lang, 'questionnaire')}</small>
<h1>${tr(lang, 'qTitle')}</h1>
<p>${tr(lang, 'qDesc')}</p>
</div>

<section class="surface">

<div style="padding:25px 25px 0">
<div class="steps" id="qProgress">
<i class="on"></i><i></i><i></i><i></i><i></i>
</div>
</div>

<form id="qForm" action="/questionnaire-result" method="POST">
<input type="hidden" name="lang" value="${lang}">

<div class="pad">

<section class="step on" data-q="0">
<h2>${tr(lang, 'basicSituation')}</h2>
<p>${tr(lang, 'basicDesc')}</p>

<div class="field">
<label>${tr(lang, 'problemType')}</label>
<select name="problemType" required>
<option value="">${tr(lang, 'select')}</option>
<option value="divorce">${tr(lang, 'divorce')}</option>
<option value="aliment">${tr(lang, 'aliment')}</option>
<option value="child">${tr(lang, 'childIssue')}</option>
<option value="property">${tr(lang, 'property')}</option>
<option value="multiple">${tr(lang, 'multiple')}</option>
</select>
</div>

<div class="field">
<label>${tr(lang, 'situationDescription')}</label>
<textarea name="description"></textarea>
</div>
</section>

<section class="step" data-q="1">
<h2>${tr(lang, 'marriage')}</h2>
<p>${tr(lang, 'marriageDesc')}</p>

<div class="grid2">
<div class="field">
<label>${tr(lang, 'marriageDate')}</label>
<input type="date" name="marriageDate">
</div>

<div class="field">
<label>${tr(lang, 'marriagePlace')}</label>
<input name="marriagePlace">
</div>
</div>

<div class="field">
<label>${tr(lang, 'consent')}</label>
<select name="mutualConsent">
<option value="">${tr(lang, 'select')}</option>
<option value="yes">${tr(lang, 'yes')}</option>
<option value="no">${tr(lang, 'no')}</option>
<option value="unknown">${tr(lang, 'unsure')}</option>
</select>
</div>

<div class="field">
<label>${tr(lang, 'reason')}</label>
<textarea name="reason"></textarea>
</div>
</section>

<section class="step" data-q="2">
<h2>${tr(lang, 'childrenAliment')}</h2>
<p>${tr(lang, 'childrenDesc')}</p>

<div class="grid2">
<div class="field">
<label>${tr(lang, 'childrenCount')}</label>
<input type="number" min="0" name="childrenCount">
</div>

<div class="field">
<label>${tr(lang, 'childrenLiving')}</label>
<select name="childrenLiving">
<option value="">${tr(lang, 'select')}</option>
<option value="mother">${tr(lang, 'mother')}</option>
<option value="father">${tr(lang, 'father')}</option>
<option value="both">${tr(lang, 'together')}</option>
</select>
</div>
</div>

<div class="field">
<label>${tr(lang, 'childrenDetails')}</label>
<textarea name="childrenDetails"></textarea>
</div>

<div class="grid2">
<div class="field">
<label>${tr(lang, 'workplace')}</label>
<input name="workplace">
</div>

<div class="field">
<label>${tr(lang, 'income')}</label>
<input type="number" min="0" name="income">
</div>
</div>
</section>

<section class="step" data-q="3">
<h2>${tr(lang, 'propertyStep')}</h2>
<p>${tr(lang, 'propertyDesc')}</p>

<div class="field">
<label>${tr(lang, 'propertyDetails')}</label>
<textarea name="propertyDetails"></textarea>
</div>

<div class="grid2">
<div class="field">
<label>${tr(lang, 'owner')}</label>
<input name="propertyOwner">
</div>

<div class="field">
<label>${tr(lang, 'acquired')}</label>
<input name="propertyDate">
</div>
</div>

<div class="field">
<label>${tr(lang, 'source')}</label>
<textarea name="propertySource"></textarea>
</div>

<div class="field">
<label>${tr(lang, 'contract')}</label>
<select name="contract">
<option value="">${tr(lang, 'select')}</option>
<option value="yes">${tr(lang, 'yes')}</option>
<option value="no">${tr(lang, 'no')}</option>
</select>
</div>
</section>

<section class="step" data-q="4">
<h2>${tr(lang, 'finalInfo')}</h2>
<p>${tr(lang, 'finalDesc')}</p>

<div class="field">
<label>${tr(lang, 'additional')}</label>
<textarea name="additional" style="min-height:160px"></textarea>
</div>

<div style="background:#eef4ff;padding:15px;border-radius:10px;font-size:11px;color:#536781">
${tr(lang, 'qNotice')}
</div>
</section>

</div>

<div class="actions">
<button type="button" class="btn white" id="qBack">${tr(lang, 'back')}</button>
<button type="button" class="btn blue" id="qNext">${tr(lang, 'next')}</button>
<button type="submit" class="btn blue" id="qSubmit" style="display:none">
${tr(lang, 'analyze')}
</button>
</div>

</form>
</section>
</main>
</div>

<script>
(function(){
var index=0;
var steps=Array.from(document.querySelectorAll('[data-q]'));
var bars=Array.from(document.querySelectorAll('#qProgress i'));
var back=document.getElementById('qBack');
var next=document.getElementById('qNext');
var submit=document.getElementById('qSubmit');

function show(){
steps.forEach(function(s,i){s.classList.toggle('on',i===index);});
bars.forEach(function(b,i){b.classList.toggle('on',i<=index);});
back.style.visibility=index===0?'hidden':'visible';
next.style.display=index===steps.length-1?'none':'inline-flex';
submit.style.display=index===steps.length-1?'inline-flex':'none';
}

next.addEventListener('click',function(){
var required=steps[index].querySelectorAll('[required]');
for(var i=0;i<required.length;i++){
if(!required[i].checkValidity()){
required[i].reportValidity();
return;
}
}
if(index<steps.length-1){
index++;
show();
window.scrollTo(0,80);
}
});

back.addEventListener('click',function(){
if(index>0){
index--;
show();
window.scrollTo(0,80);
}
});

show();
})();
</script>
`, tr(lang, 'qTitle'), lang, '/questionnaire');
}

function questionnaireText(data, lang) {
  const labels =
    lang === 'ru'
      ? {
          problem:'Основная проблема',
          situation:'Ситуация',
          date:'Дата брака',
          place:'Место брака',
          consent:'Согласие на развод',
          reason:'Причина развода',
          children:'Количество детей',
          childInfo:'Информация о детях',
          living:'Проживание детей',
          work:'Место работы',
          income:'Доход',
          property:'Имущество',
          owner:'Владелец имущества',
          propertyDate:'Дата приобретения',
          source:'Источник средств',
          contract:'Брачный договор',
          additional:'Дополнительные факты',
          missing:'не указано'
        }
      : lang === 'en'
      ? {
          problem:'Main issue',
          situation:'Situation',
          date:'Marriage date',
          place:'Marriage place',
          consent:'Consent to divorce',
          reason:'Reason for divorce',
          children:'Number of children',
          childInfo:'Children details',
          living:'Children living with',
          work:'Workplace',
          income:'Income',
          property:'Property',
          owner:'Property owner',
          propertyDate:'Property acquisition date',
          source:'Source of funds',
          contract:'Prenuptial agreement',
          additional:'Additional facts',
          missing:'not provided'
        }
      : {
          problem:'Asosiy muammo',
          situation:'Vaziyat',
          date:'Nikoh sanasi',
          place:'Nikoh joyi',
          consent:'O‘zaro rozilik',
          reason:'Ajrashish sababi',
          children:'Farzandlar soni',
          childInfo:'Farzandlar haqida',
          living:'Farzandlar yashashi',
          work:'Ish joyi',
          income:'Daromad',
          property:'Mol-mulk',
          owner:'Mol-mulk egasi',
          propertyDate:'Mol-mulk olingan vaqt',
          source:'Mablag‘ manbasi',
          contract:'Nikoh shartnomasi',
          additional:'Qo‘shimcha faktlar',
          missing:'ko‘rsatilmagan'
        };

  const m = labels.missing;

  return [
    labels.problem + ': ' + (data.problemType || m),
    labels.situation + ': ' + (data.description || m),
    labels.date + ': ' + (data.marriageDate || m),
    labels.place + ': ' + (data.marriagePlace || m),
    labels.consent + ': ' + (data.mutualConsent || m),
    labels.reason + ': ' + (data.reason || m),
    labels.children + ': ' + (data.childrenCount || m),
    labels.childInfo + ': ' + (data.childrenDetails || m),
    labels.living + ': ' + (data.childrenLiving || m),
    labels.work + ': ' + (data.workplace || m),
    labels.income + ': ' + (data.income || m),
    labels.property + ': ' + (data.propertyDetails || m),
    labels.owner + ': ' + (data.propertyOwner || m),
    labels.propertyDate + ': ' + (data.propertyDate || m),
    labels.source + ': ' + (data.propertySource || m),
    labels.contract + ': ' + (data.contract || m),
    labels.additional + ': ' + (data.additional || m)
  ].join('\n');
}

// ======================================================
// SUD YO‘NALISHI
// ======================================================

function courtPage(lang) {
  return layout(`
<div class="app">

${sidebar('court', lang)}

<main>

<div class="head">
<small>${tr(lang, 'home')} / ${tr(lang, 'court')}</small>
<h1>${tr(lang, 'courtTitle')}</h1>
<p>${tr(lang, 'courtDesc')}</p>
</div>

<section style="
padding:32px;
border-radius:22px;
background:linear-gradient(145deg,#091d3a,#193861);
color:white;
margin-bottom:20px">

<span style="color:#c6b7ff;font-size:10px;font-weight:900">
03 — ${tr(lang, 'court').toUpperCase()}
</span>

<h2 style="font-size:28px;margin:10px 0">${tr(lang, 'courtStart')}</h2>

<p style="color:#b3bfd1;font-size:12px;line-height:1.7">
${tr(lang, 'courtText')}
</p>
</section>

<div class="tools">

<a href="/claim${q(lang)}" class="surface tool" style="border:2px solid #d9d0ff">
<div class="icon" style="background:#eee9ff">📄</div>
<strong style="color:#7653e8;font-size:9px">●</strong>
<h3>${tr(lang, 'claim')}</h3>
<p>${tr(lang, 'claimDesc')}</p>
<b style="color:#7653e8;font-size:11px">${tr(lang, 'enterConstructor')}</b>
</a>

<div class="surface tool" style="opacity:.6">
<div class="icon">📑</div>
<strong style="font-size:9px">${tr(lang, 'soon')}</strong>
<h3>${tr(lang, 'objection')}</h3>
<p>${tr(lang, 'objectionDesc')}</p>
</div>

<div class="surface tool" style="opacity:.6">
<div class="icon">⚖</div>
<strong style="font-size:9px">${tr(lang, 'soon')}</strong>
<h3>${tr(lang, 'appeal')}</h3>
<p>${tr(lang, 'appealDesc')}</p>
</div>

</div>
</main>
</div>
`, tr(lang, 'court'), lang, '/court');
}

// ======================================================
// DA’VO KONSTRUKTORI
// ======================================================

function claimPage(lang) {
  return layout(`
<div class="app">

${sidebar('court', lang)}

<main>

<div class="head">
<small>${tr(lang, 'court')} / ${tr(lang, 'claim')}</small>
<h1>${tr(lang, 'claimBuilder')}</h1>
<p>${tr(lang, 'sixSteps')}</p>
</div>

<section class="surface">

<div style="padding:25px 25px 0">
<div class="steps" id="claimProgress">
<i class="on"></i><i></i><i></i><i></i><i></i><i></i>
</div>
</div>

<form id="claimForm" action="/claim-result" method="POST">
<input type="hidden" name="lang" value="${lang}">

<div class="pad">

<section class="step on" data-c="0">
<h2>${tr(lang, 'claimType')}</h2>
<p>${tr(lang, 'claimTypeDesc')}</p>

<div class="types">

<label class="type">
<input type="radio" name="claimType" value="divorce" required>
<strong>${tr(lang, 'divorce')}</strong>
<small>${tr(lang, 'divorceOnly')}</small>
</label>

<label class="type">
<input type="radio" name="claimType" value="divorce_aliment" required>
<strong>${tr(lang, 'divorceAliment')}</strong>
<small>${tr(lang, 'divorceAlimentDesc')}</small>
</label>

<label class="type">
<input type="radio" name="claimType" value="divorce_property" required>
<strong>${tr(lang, 'divorceProperty')}</strong>
<small>${tr(lang, 'divorcePropertyDesc')}</small>
</label>

</div>
</section>

<section class="step" data-c="1">
<h2>${tr(lang, 'parties')}</h2>
<p>${tr(lang, 'partiesDesc')}</p>

<div class="field">
<label>${tr(lang, 'courtName')}</label>
<input name="courtName" required>
</div>

<div class="grid2">
<div class="field">
<label>${tr(lang, 'plaintiff')}</label>
<input name="plaintiffName" required>
</div>

<div class="field">
<label>${tr(lang, 'phone')}</label>
<input name="plaintiffPhone">
</div>
</div>

<div class="field">
<label>${tr(lang, 'plaintiffAddress')}</label>
<input name="plaintiffAddress" required>
</div>

<div class="grid2">
<div class="field">
<label>${tr(lang, 'defendant')}</label>
<input name="defendantName" required>
</div>

<div class="field">
<label>${tr(lang, 'defendantWork')}</label>
<input name="defendantWork">
</div>
</div>

<div class="field">
<label>${tr(lang, 'defendantAddress')}</label>
<input name="defendantAddress">
</div>
</section>

<section class="step" data-c="2">
<h2>${tr(lang, 'marriageChildren')}</h2>
<p>${tr(lang, 'marriageChildrenDesc')}</p>

<div class="grid2">
<div class="field">
<label>${tr(lang, 'requiredMarriageDate')}</label>
<input type="date" name="marriageDate" required>
</div>

<div class="field">
<label>${tr(lang, 'requiredMarriagePlace')}</label>
<input name="marriagePlace" required>
</div>
</div>

<div class="grid2">
<div class="field">
<label>${tr(lang, 'childrenCount')}</label>
<input id="claimChildren" type="number" min="0" name="childrenCount">
</div>

<div class="field">
<label>${tr(lang, 'childrenLiving')}</label>
<select name="childrenLiving">
<option value="">${tr(lang, 'select')}</option>
<option value="plaintiff">${tr(lang, 'plaintiffLiving')}</option>
<option value="defendant">${tr(lang, 'defendantLiving')}</option>
<option value="together">${tr(lang, 'partiesLiving')}</option>
</select>
</div>
</div>

<div class="field">
<label>${tr(lang, 'childrenNames')}</label>
<textarea name="childrenDetails"></textarea>
</div>
</section>

<section class="step" data-c="3">
<h2>${tr(lang, 'facts')}</h2>
<p>${tr(lang, 'factsDesc')}</p>

<div class="field">
<label>${tr(lang, 'requiredReason')}</label>
<textarea name="divorceReason" required></textarea>
</div>

<div class="grid2">

<div class="field">
<label>${tr(lang, 'livingTogether')}</label>
<select name="livingTogether">
<option value="">${tr(lang, 'select')}</option>
<option value="yes">${tr(lang, 'yes')}</option>
<option value="no">${tr(lang, 'no')}</option>
</select>
</div>

<div class="field">
<label>${tr(lang, 'separation')}</label>
<input name="separationDate">
</div>

</div>

<div class="field">
<label>${tr(lang, 'reconciliation')}</label>
<textarea name="reconciliation"></textarea>
</div>
</section>

<section class="step" data-c="4">
<h2>${tr(lang, 'requests')}</h2>
<p>${tr(lang, 'requestsDesc')}</p>

<div class="grid2">

<div class="field">
<label>${tr(lang, 'alimentChildren')}</label>
<input id="alimentChildren" type="number" min="0" name="alimentChildren">
</div>

<div class="field">
<label>${tr(lang, 'payerIncome')}</label>
<input id="payerIncome" type="number" min="0" name="payerIncome">
</div>

</div>

<div id="alimentPreview" style="
padding:14px;
background:#eef4ff;
border-radius:11px;
margin-bottom:18px;
font-size:11px;
color:#3158b5">
${tr(lang, 'enterCalc')}
</div>

<div class="field">
<label>${tr(lang, 'propertyClaim')}</label>
<textarea name="propertyDetails"></textarea>
</div>

<div class="grid2">

<div class="field">
<label>${tr(lang, 'propertyOwner')}</label>
<input name="propertyOwner">
</div>

<div class="field">
<label>${tr(lang, 'acquired')}</label>
<input name="propertyDate">
</div>

</div>

<div class="field">
<label>${tr(lang, 'source')}</label>
<textarea name="propertySource"></textarea>
</div>

<div class="field">
<label>${tr(lang, 'otherRequests')}</label>
<textarea name="additionalRequests"></textarea>
</div>
</section>

<section class="step" data-c="5">
<h2>${tr(lang, 'evidenceStep')}</h2>
<p>${tr(lang, 'evidenceDesc')}</p>

<div class="field">
<label>${tr(lang, 'evidence')}</label>
<textarea name="evidence"></textarea>
</div>

<div class="field">
<label>${tr(lang, 'attachments')}</label>
<textarea name="attachments" placeholder="${esc(tr(lang, 'attachmentPlaceholder'))}"></textarea>
</div>

<div style="
padding:15px;
background:#effbf6;
border:1px solid #ccefe1;
border-radius:11px;
font-size:11px;
line-height:1.6;
color:#496c61">
${tr(lang, 'checkData')}
</div>

</section>

</div>

<div class="actions">

<button type="button" class="btn white" id="claimBack">
${tr(lang, 'back')}
</button>

<div style="display:flex;gap:8px">

<button type="button" class="btn blue" id="claimNext">
${tr(lang, 'next')}
</button>

<button type="submit" class="btn purple" id="claimSubmit" style="display:none">
${tr(lang, 'generate')}
</button>

</div>
</div>

</form>
</section>

</main>
</div>

<script>
(function(){

var index=0;
var steps=Array.from(document.querySelectorAll('[data-c]'));
var bars=Array.from(document.querySelectorAll('#claimProgress i'));
var back=document.getElementById('claimBack');
var next=document.getElementById('claimNext');
var submit=document.getElementById('claimSubmit');

function show(){
steps.forEach(function(step,i){
step.classList.toggle('on',i===index);
});
bars.forEach(function(bar,i){
bar.classList.toggle('on',i<=index);
});
back.style.visibility=index===0?'hidden':'visible';
next.style.display=index===steps.length-1?'none':'inline-flex';
submit.style.display=index===steps.length-1?'inline-flex':'none';
}

function valid(){

if(index===0){
var radio=document.querySelector('input[name="claimType"]:checked');
if(!radio){
alert(${JSON.stringify(
  lang === 'ru'
    ? 'Выберите тип иска.'
    : lang === 'en'
    ? 'Select the type of claim.'
    : 'Da’vo turini tanlang.'
)});
return false;
}
}

var required=steps[index].querySelectorAll('[required]');

for(var i=0;i<required.length;i++){
if(!required[i].checkValidity()){
required[i].reportValidity();
return false;
}
}

return true;
}

next.addEventListener('click',function(){
if(!valid()) return;

if(index<steps.length-1){
index++;
show();
window.scrollTo(0,80);
}
});

back.addEventListener('click',function(){
if(index>0){
index--;
show();
window.scrollTo(0,80);
}
});

var children=document.getElementById('claimChildren');
var alimentChildren=document.getElementById('alimentChildren');
var income=document.getElementById('payerIncome');
var preview=document.getElementById('alimentPreview');

function calc(){
var c=Number(alimentChildren.value);
var inc=Number(income.value);
var rate=0;
var fraction='';

if(c===1){
rate=1/4;
fraction='1/4';
}else if(c===2){
rate=1/3;
fraction='1/3';
}else if(c>=3){
rate=1/2;
fraction='1/2';
}

if(rate && inc){
var amount=Math.round(inc*rate);
preview.textContent=fraction+' ≈ '+amount.toLocaleString('uz-UZ')+' so‘m';
}else{
preview.textContent=${JSON.stringify(tr(lang, 'enterCalc'))};
}
}

children.addEventListener('input',function(){
if(!alimentChildren.value){
alimentChildren.value=children.value;
calc();
}
});

alimentChildren.addEventListener('input',calc);
income.addEventListener('input',calc);

show();

})();
</script>
`, tr(lang, 'claimBuilder'), lang, '/claim');
}

// ======================================================
// DA’VO MATNI
// ======================================================

function buildClaim(data, lang) {
  const isRu = lang === 'ru';
  const isEn = lang === 'en';

  const typeNames = isRu
    ? {
        divorce: 'О РАСТОРЖЕНИИ БРАКА',
        divorce_aliment: 'О РАСТОРЖЕНИИ БРАКА И ВЗЫСКАНИИ АЛИМЕНТОВ',
        divorce_property: 'О РАСТОРЖЕНИИ БРАКА И ИМУЩЕСТВЕННОМ ВОПРОСЕ'
      }
    : isEn
    ? {
        divorce: 'FOR DIVORCE',
        divorce_aliment: 'FOR DIVORCE AND CHILD SUPPORT',
        divorce_property: 'FOR DIVORCE AND PROPERTY MATTERS'
      }
    : {
        divorce: 'NIKOHDAN AJRATISH TO‘G‘RISIDA',
        divorce_aliment: 'NIKOHDAN AJRATISH VA ALIMENT UNDIRISH TO‘G‘RISIDA',
        divorce_property: 'NIKOHDAN AJRATISH VA MOL-MULK MASALASI TO‘G‘RISIDA'
      };

  const type = typeNames[data.claimType] || typeNames.divorce;

  let children = '';

  if (data.childrenCount) {
    children += isRu
      ? `\nКоличество детей сторон: ${data.childrenCount}.`
      : isEn
      ? `\nNumber of children of the parties: ${data.childrenCount}.`
      : `\nTaraflarning farzandlari soni: ${data.childrenCount}.`;
  }

  if (data.childrenDetails) {
    children += isRu
      ? `\nСведения о детях: ${data.childrenDetails}.`
      : isEn
      ? `\nChildren details: ${data.childrenDetails}.`
      : `\nFarzandlar haqida ma’lumot: ${data.childrenDetails}.`;
  }

  let facts = '';

  if (data.divorceReason) {
    facts += isRu
      ? `Причина прекращения семейных отношений: ${data.divorceReason}.\n`
      : isEn
      ? `Reason for the breakdown of the family relationship: ${data.divorceReason}.\n`
      : `Oilaviy munosabatlarning buzilish sababi: ${data.divorceReason}.\n`;
  }

  if (data.separationDate) {
    facts += isRu
      ? `Раздельное проживание началось: ${data.separationDate}.\n`
      : isEn
      ? `Separate living began: ${data.separationDate}.\n`
      : `Alohida yashash boshlangan vaqt: ${data.separationDate}.\n`;
  }

  if (data.reconciliation) {
    facts += isRu
      ? `Сведения о попытках примирения: ${data.reconciliation}.\n`
      : isEn
      ? `Reconciliation attempts: ${data.reconciliation}.\n`
      : `Yarashish bo‘yicha holatlar: ${data.reconciliation}.\n`;
  }

  const requests = [];

  requests.push(
    isRu
      ? 'Расторгнуть брак между сторонами.'
      : isEn
      ? 'Dissolve the marriage between the parties.'
      : 'Taraflar o‘rtasidagi nikohdan ajratish.'
  );

  if (data.claimType === 'divorce_aliment') {
    requests.push(
      isRu
        ? 'Взыскать алименты на содержание несовершеннолетнего ребёнка (детей).'
        : isEn
        ? 'Order child support for the minor child or children.'
        : 'Voyaga yetmagan farzand(lar) ta’minoti uchun aliment undirish.'
    );
  }

  if (data.claimType === 'divorce_property') {
    requests.push(
      isRu
        ? 'Рассмотреть требование, связанное с имуществом, приобретённым во время брака.'
        : isEn
        ? 'Consider the claim relating to property acquired during the marriage.'
        : 'Nikoh davomida orttirilgan mol-mulk bilan bog‘liq talabni ko‘rib chiqish.'
    );
  }

  if (data.additionalRequests) {
    requests.push(data.additionalRequests);
  }

  let extra = '';

  if (data.claimType === 'divorce_aliment') {
    const count = Number(data.alimentChildren || data.childrenCount || 0);
    const income = Number(data.payerIncome || 0);
    const rate = alimentRate(count);
    const amount = alimentAmount(count, income);

    extra += isRu
      ? '\n\nАЛИМЕНТЫ:\n'
      : isEn
      ? '\n\nCHILD SUPPORT:\n'
      : '\n\nALIMENT MASALASI:\n';

    if (count) {
      extra +=
        (isRu
          ? 'Количество детей: '
          : isEn
          ? 'Number of children: '
          : 'Farzandlar soni: ') +
        count +
        '.\n';
    }

    if (rate) {
      extra +=
        (isRu
          ? 'Предварительная доля: '
          : isEn
          ? 'Preliminary share: '
          : 'Dastlabki ulush: ') +
        rate.text +
        '.\n';
    }

    if (income) {
      extra +=
        (isRu
          ? 'Указанный доход: '
          : isEn
          ? 'Reported income: '
          : 'Ko‘rsatilgan daromad: ') +
        money(income, lang) +
        '.\n';
    }

    if (amount) {
      extra +=
        (isRu
          ? 'Предварительный математический расчёт: '
          : isEn
          ? 'Preliminary mathematical calculation: '
          : 'Dastlabki matematik hisob: ') +
        money(amount, lang) +
        '.\n';
    }
  }

  if (data.claimType === 'divorce_property' || data.propertyDetails) {
    extra += isRu
      ? '\n\nИМУЩЕСТВО:\n'
      : isEn
      ? '\n\nPROPERTY:\n'
      : '\n\nMOL-MULK MASALASI:\n';

    if (data.propertyDetails) {
      extra +=
        (isRu ? 'Имущество: ' : isEn ? 'Property: ' : 'Mol-mulk: ') +
        data.propertyDetails +
        '.\n';
    }

    if (data.propertyOwner) {
      extra +=
        (isRu
          ? 'На кого оформлено: '
          : isEn
          ? 'Registered owner: '
          : 'Mol-mulk kimning nomida: ') +
        data.propertyOwner +
        '.\n';
    }

    if (data.propertyDate) {
      extra +=
        (isRu
          ? 'Дата приобретения: '
          : isEn
          ? 'Acquisition date: '
          : 'Olingan vaqt: ') +
        data.propertyDate +
        '.\n';
    }

    if (data.propertySource) {
      extra +=
        (isRu
          ? 'Источник средств: '
          : isEn
          ? 'Source of funds: '
          : 'Mablag‘ manbasi: ') +
        data.propertySource +
        '.\n';
    }
  }

  const requestText = requests.map((x, i) => `${i + 1}. ${x}`).join('\n');

  const attachments =
    data.attachments ||
    (isRu
      ? `1. Документ, подтверждающий регистрацию брака.
2. При наличии — документы, относящиеся к детям.
3. Иные документы, подтверждающие требования.`
      : isEn
      ? `1. Document confirming marriage registration.
2. Documents relating to the children, if applicable.
3. Other documents supporting the claims.`
      : `1. Nikoh qayd etilganligini tasdiqlovchi hujjat.
2. Mavjud bo‘lsa, farzandlarga oid hujjatlar.
3. Da’vo talablarini tasdiqlovchi boshqa hujjatlar.`);

  if (isRu) {
    return `${data.courtName}

Истец:
${data.plaintiffName}
Адрес: ${data.plaintiffAddress}
Телефон: ${data.plaintiffPhone || '________________'}

Ответчик:
${data.defendantName}
Адрес: ${data.defendantAddress || '________________'}
Место работы: ${data.defendantWork || '________________'}


ИСКОВОЕ ЗАЯВЛЕНИЕ

${type}


Я, ${data.plaintiffName}, состою в зарегистрированном браке с ${data.defendantName} с ${data.marriageDate}.

Брак зарегистрирован: ${data.marriagePlace}.
${children}

ФАКТИЧЕСКИЕ ОБСТОЯТЕЛЬСТВА:

${facts}
${extra}

На основании изложенного прошу суд:

${requestText}


ДОКАЗАТЕЛЬСТВА:

${data.evidence || 'Имеющиеся доказательства будут представлены суду.'}


ПРИЛОЖЕНИЯ:

${attachments}


Дата: __________________

Истец: __________________

Подпись: __________________


ПРИМЕЧАНИЕ:
Данный документ является автоматически сформированным проектом на основании введённых данных. Перед подачей в суд необходимо проверить реквизиты суда, требования, доказательства, приложения, платежи и действующие процессуальные требования.`;
  }

  if (isEn) {
    return `${data.courtName}

Claimant:
${data.plaintiffName}
Address: ${data.plaintiffAddress}
Phone: ${data.plaintiffPhone || '________________'}

Respondent:
${data.defendantName}
Address: ${data.defendantAddress || '________________'}
Workplace: ${data.defendantWork || '________________'}


STATEMENT OF CLAIM

${type}


I, ${data.plaintiffName}, entered into marriage with ${data.defendantName} on ${data.marriageDate}.

The marriage was registered at ${data.marriagePlace}.
${children}

FACTUAL CIRCUMSTANCES:

${facts}
${extra}

Based on the above, I request the court to:

${requestText}


EVIDENCE:

${data.evidence || 'Available evidence will be submitted to the court.'}


ATTACHMENTS:

${attachments}


Date: __________________

Claimant: __________________

Signature: __________________


NOTE:
This document is an automatically generated draft based on the information entered. Before filing it with a court, the court details, requests, evidence, attachments, fees and current procedural requirements should be checked.`;
  }

  return `${data.courtName}

Da’vogar:
${data.plaintiffName}
Manzil: ${data.plaintiffAddress}
Telefon: ${data.plaintiffPhone || '________________'}

Javobgar:
${data.defendantName}
Manzil: ${data.defendantAddress || '________________'}
Ish joyi: ${data.defendantWork || '________________'}


DA’VO ARIZASI

${type}


Men, ${data.plaintiffName}, javobgar ${data.defendantName} bilan ${data.marriageDate} sanada nikohdan o‘tganman.

Nikoh ${data.marriagePlace}da qayd etilgan.
${children}

ISHNING FAKTIK HOLATLARI:

${facts}
${extra}

Yuqoridagi holatlardan kelib chiqib, suddan quyidagilarni so‘rayman:

${requestText}


DALILLAR:

${data.evidence || 'Mavjud dalillar sudga taqdim etiladi.'}


ILOVALAR:

${attachments}


Sana: __________________

Da’vogar: __________________

Imzo: __________________


ESLATMA:
Ushbu hujjat kiritilgan ma’lumotlar asosida avtomatik shakllantirilgan loyiha hisoblanadi. Sudga topshirishdan oldin sud rekvizitlari, talablar, dalillar, ilovalar, to‘lovlar va amaldagi protsessual talablar tekshirilishi lozim.`;
}

// ======================================================
// DA’VO NATIJASI
// ======================================================

function claimResultPage(text, lang) {
  return layout(`
<div class="app">

${sidebar('court', lang)}

<main>

<div class="head">
<small>${tr(lang, 'court')} / ${tr(lang, 'claim')}</small>
<h1>${tr(lang, 'claimReady')}</h1>
<p>${tr(lang, 'claimReadyDesc')}</p>
</div>

<section class="surface">

<div style="
padding:17px 22px;
border-bottom:1px solid var(--line);
display:flex;
justify-content:space-between;
gap:10px;
align-items:center;
flex-wrap:wrap">

<strong>${tr(lang, 'claim')}</strong>

<div style="display:flex;gap:8px">
<button class="btn white" id="copyBtn">${tr(lang, 'copy')}</button>
<button class="btn dark" id="printBtn">${tr(lang, 'print')}</button>
</div>

</div>

<div style="padding:25px;background:#f1f3f6">
<article class="doc" id="document">${esc(text)}</article>
</div>

</section>

<div style="margin-top:15px;display:flex;gap:10px;flex-wrap:wrap">
<a href="/claim${q(lang)}" class="btn white">${tr(lang, 'newClaim')}</a>
<a href="/court${q(lang)}" class="btn purple">${tr(lang, 'court')}</a>
</div>

</main>
</div>

<script>
(function(){

var copy=document.getElementById('copyBtn');
var print=document.getElementById('printBtn');
var doc=document.getElementById('document');

copy.addEventListener('click',function(){
navigator.clipboard.writeText(doc.innerText).then(function(){
copy.textContent=${JSON.stringify(tr(lang, 'copied'))};
});
});

print.addEventListener('click',function(){
window.print();
});

})();
</script>

<style>
@media print{
.nav,.side,.head,footer,.btn{display:none!important}
.app{display:block;width:100%;margin:0}
.surface{border:0;box-shadow:none}
.doc{border:0;padding:0}
}
</style>
`, tr(lang, 'claim'), lang, '/claim');
}

// ======================================================
// XATO SAHIFASI
// ======================================================

function errorPage(message, lang = 'uz') {
  return layout(`
<div class="wrap" style="max-width:700px;padding:70px 0">

<div class="surface pad" style="text-align:center">

<div style="
width:55px;
height:55px;
display:grid;
place-items:center;
margin:auto;
border-radius:15px;
background:#fff0f0;
color:#d44;
font-size:25px">!</div>

<h1 style="color:var(--navy)">${tr(lang, 'error')}</h1>

<p style="color:var(--muted);line-height:1.7">
${esc(message)}
</p>

<a class="btn blue" href="/${q(lang)}">${tr(lang, 'homeButton')}</a>

</div>
</div>
`, tr(lang, 'error'), lang, '/');
}

// ======================================================
// SERVER
// ======================================================

function send(res, html, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store'
  });

  res.end(html);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(
      req.url,
      'http://' + (req.headers.host || 'localhost')
    );

    const path = url.pathname;
    const lang = getLang(url.searchParams.get('lang'));

    // BOSH SAHIFA
    if (req.method === 'GET' && path === '/') {
      return send(res, homePage(lang));
    }

    // AI
    if (req.method === 'GET' && path === '/ai') {
      return send(res, aiPage(lang));
    }

    // SAVOL-JAVOB
    if (req.method === 'GET' && path === '/questionnaire') {
      return send(res, questionnairePage(lang));
    }

    // SUD
    if (req.method === 'GET' && path === '/court') {
      return send(res, courtPage(lang));
    }

    // DA’VO
    if (req.method === 'GET' && path === '/claim') {
      return send(res, claimPage(lang));
    }

    // AI RESULT
    if (req.method === 'POST' && path === '/ai-result') {
      const body = await readBody(req);

      const postLang = getLang(body.lang);
      const question = String(body.question || '').trim();

      if (!question) {
        const message =
          postLang === 'ru'
            ? 'Правовая ситуация не введена.'
            : postLang === 'en'
            ? 'No legal situation was entered.'
            : 'Huquqiy vaziyat kiritilmagan.';

        return send(res, errorPage(message, postLang), 400);
      }

      let answer;

      try {
        answer = await callAI(question, postLang);
      } catch (error) {
        console.error('AI xatosi:', error.message);

        answer =
          postLang === 'ru'
            ? 'Ошибка подключения к сервису AI.\n\n' + error.message
            : postLang === 'en'
            ? 'An error occurred while connecting to the AI service.\n\n' +
              error.message
            : 'AI xizmatiga ulanishda xatolik yuz berdi.\n\n' +
              error.message;
      }

      return send(res, aiResultPage(question, answer, postLang));
    }

    // QUESTIONNAIRE RESULT
    if (req.method === 'POST' && path === '/questionnaire-result') {
      const body = await readBody(req);

      const postLang = getLang(body.lang);
      const question = questionnaireText(body, postLang);

      let answer;

      try {
        answer = await callAI(question, postLang);
      } catch (error) {
        console.error('AI xatosi:', error.message);

        answer =
          postLang === 'ru'
            ? 'Ошибка подключения к сервису AI.\n\n' + error.message
            : postLang === 'en'
            ? 'An error occurred while connecting to the AI service.\n\n' +
              error.message
            : 'AI xizmatiga ulanishda xatolik yuz berdi.\n\n' +
              error.message;
      }

      return send(res, aiResultPage(question, answer, postLang));
    }

    // CLAIM RESULT
    if (req.method === 'POST' && path === '/claim-result') {
      const body = await readBody(req);
      const postLang = getLang(body.lang);

      if (
        !body.claimType ||
        !body.courtName ||
        !body.plaintiffName ||
        !body.plaintiffAddress ||
        !body.defendantName ||
        !body.marriageDate ||
        !body.marriagePlace ||
        !body.divorceReason
      ) {
        const message =
          postLang === 'ru'
            ? 'Не все обязательные поля искового заявления заполнены.'
            : postLang === 'en'
            ? 'The required fields of the statement of claim are incomplete.'
            : 'Da’vo arizasining majburiy maydonlari to‘liq kiritilmagan.';

        return send(res, errorPage(message, postLang), 400);
      }

      const text = buildClaim(body, postLang);

      return send(res, claimResultPage(text, postLang));
    }

    // FAVICON
    if (path === '/favicon.ico') {
      res.writeHead(204);
      return res.end();
    }

    // 404
    const notFound =
      lang === 'ru'
        ? 'Страница не найдена.'
        : lang === 'en'
        ? 'Page not found.'
        : 'Sahifa topilmadi.';

    return send(res, errorPage(notFound, lang), 404);

  } catch (error) {
    console.error('SERVER XATOSI:', error);

    return send(
      res,
      errorPage(error.message || 'Noma’lum server xatosi.', 'uz'),
      500
    );
  }
});

// ======================================================
// ISHGA TUSHIRISH
// ======================================================

server.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('       HUQUQIY AI ISHGA TUSHDI');
  console.log('========================================');
  console.log('Manzil: http://localhost:' + PORT);
  console.log(
    'OpenRouter API: ' +
      (process.env.OPENROUTER_API_KEY
        ? 'ulandi ✓'
        : 'kalit topilmadi ✗')
  );
  console.log('----------------------------------------');
  console.log('Tillar:');
  console.log('🇺🇿 O‘zbekcha');
  console.log('🇷🇺 Русский');
  console.log('🇬🇧 English');
  console.log('----------------------------------------');
  console.log('1. AI huquqiy tahlil');
  console.log('2. Savol-javob orqali tahlil');
  console.log('3. Sud yo‘nalishi');
  console.log('   └─ Da’vo arizasi konstruktori');
  console.log('========================================');
  console.log('');
});

server.on('error', error => {
  console.error('SERVER XATOSI:', error);
});
