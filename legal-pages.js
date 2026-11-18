"use strict";
// Privacy policy and terms of use (uz / ru / en). The text describes what the
// code actually does (fields stored, cookies, AI processing, hosting,
// retention). Any change to data handling must update this text and bump
// CONSENT_VERSION so new registrations record the version they accepted.
// The documents must be reviewed by a lawyer before being relied upon.
const CONSENT_VERSION = "2026-11-18-v1";
const EFFECTIVE_DATE = "2026-11-18";

const esc = v => String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

function contactLine(lang) {
  const email = String(process.env.PRIVACY_CONTACT_EMAIL || "").trim();
  const valid = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(email);
  if (valid) return { uz: "Murojaat uchun: ", ru: "Для обращений: ", en: "Contact: " }[lang] + email;
  return { uz: "Murojaat uchun: shaxsiy kabinetdagi bildirishnomalar yoki platforma administratori orqali.", ru: "Для обращений: через уведомления в личном кабинете или администратора платформы.", en: "Contact: through your account notifications or the platform administrator." }[lang];
}

const PRIVACY = {
  uz: { title: "Maxfiylik siyosati", sections: [
    ["1. Kim ma’lumotlarni qayta ishlaydi", ["VERIUS — huquqiy ma’lumot va AI yordamchi platformasi (keyingi o‘rinlarda — Platforma). Ushbu siyosat O‘zbekiston Respublikasining “Shaxsga doir ma’lumotlar to‘g‘risida”gi Qonuniga muvofiq tuzilgan."]],
    ["2. Qanday ma’lumotlar to‘planadi", ["Akkaunt: ism, familiya, email, parolning xeshi (parolning o‘zi saqlanmaydi), rol va holat, ro‘yxatdan o‘tgan va oxirgi kirgan vaqt.", "Siz kiritgan ma’lumotlar: ishlar (masalalar), saqlangan hujjatlar, AI suhbatlari, Advokat PRO ish maydoni (ishlar, vazifalar).", "Rozilik yozuvlari: qaysi hujjat versiyasiga qachon rozilik berganingiz.", "Xavfsizlik jurnali: kirish urinishlari va xavfsizlik hodisalari. IP manzil ochiq holda saqlanmaydi — faqat bir tomonlama xesh.", "Yuklangan fayllar (PDF, DOCX): faqat matnni ajratish uchun xotirada o‘qiladi va diskka saqlanmaydi."]],
    ["3. Maqsadlar", ["Akkauntni yuritish, kirish va parolni tiklash; siz so‘ragan huquqiy ma’lumot, hisob-kitob va hujjat loyihalarini tayyorlash; xavfsizlik va suiiste’molning oldini olish."]],
    ["4. Sun’iy intellekt (Google Gemini)", ["AI funksiyalaridan foydalansangiz, matn Google Gemini xizmatiga yuboriladi. Yuborishdan oldin JSHSHIR, pasport, telefon, email, manzil va karta raqamlari avtomatik yashiriladi va siz yuboriladigan matnni ko‘rib, alohida rozilik berasiz.", "Da’vo arizasida yashirilgan ma’lumotlar AI'ga berilmaydi va tayyor hujjatga Platformaning o‘zida qaytarib qo‘yiladi.", "Avtomatik yashirish barcha shaxsiy ma’lumotlarni aniqlashni kafolatlamaydi — yuborishdan oldin matnni tekshiring."]],
    ["5. Kimga uzatiladi", ["Xosting va ma’lumotlar bazasi provayderlari (Render, Neon PostgreSQL), email yuborish xizmati (Resend yoki SMTP), AI xizmati (Google Gemini). Bu provayderlarning serverlari O‘zbekiston hududidan tashqarida joylashgan bo‘lishi mumkin.", "Ma’lumotlar sotilmaydi va reklama maqsadida berilmaydi. Qonunda nazarda tutilgan hollarda vakolatli organlarga berilishi mumkin."]],
    ["6. Cookie", ["Faqat bitta zarur cookie ishlatiladi: hq_session (kirgan holatni saqlaydi, 7 kun, HttpOnly). Reklama yoki kuzatuv cookie'lari yo‘q."]],
    ["7. Saqlash muddati", ["Sessiyalar — 7 kun yoki chiqishgacha. Tasdiqlash va tiklash kodlari — 15–20 daqiqa. Akkaunt ma’lumotlari — akkaunt o‘chirilguncha. Shifrlangan zaxira nusxalar — 7 kun."]],
    ["8. Huquqlaringiz", ["Ma’lumotlaringiz bilan tanishish, tuzatish, o‘chirishni va qayta ishlashni to‘xtatishni talab qilish, rozilikni qaytarib olish. Profil va parolni shaxsiy kabinetda o‘zgartirishingiz mumkin; boshqa so‘rovlar uchun quyidagi manzilga murojaat qiling."]],
    ["9. Himoya choralari", ["Parollar scrypt bilan xeshlanadi, sessiya tokenlari xesh sifatida saqlanadi, ulanishlar HTTPS orqali, zaxira nusxalar shifrlangan. Hech bir tizim 100% xavfsiz emas."]],
    ["10. O‘zgarishlar", ["Siyosat o‘zgarsa, yangi versiya shu sahifada e’lon qilinadi va versiya raqami yangilanadi."]]
  ] },
  ru: { title: "Политика конфиденциальности", sections: [
    ["1. Кто обрабатывает данные", ["VERIUS — платформа правовой информации и AI-помощника (далее — Платформа). Политика составлена в соответствии с Законом Республики Узбекистан «О персональных данных»."]],
    ["2. Какие данные собираются", ["Аккаунт: имя, фамилия, email, хеш пароля (сам пароль не хранится), роль и статус, время регистрации и последнего входа.", "Введённые вами данные: дела, сохранённые документы, AI-диалоги, рабочее пространство Advokat PRO.", "Записи о согласии: на какую версию документа и когда вы согласились.", "Журнал безопасности: попытки входа и события безопасности. IP-адрес не хранится в открытом виде — только односторонний хеш.", "Загруженные файлы (PDF, DOCX): читаются в памяти только для извлечения текста и не сохраняются на диск."]],
    ["3. Цели", ["Ведение аккаунта, вход и восстановление пароля; подготовка запрошенной правовой информации, расчётов и проектов документов; безопасность и предотвращение злоупотреблений."]],
    ["4. Искусственный интеллект (Google Gemini)", ["При использовании AI текст отправляется в Google Gemini. Перед отправкой ПИНФЛ, паспорт, телефон, email, адрес и номера карт автоматически скрываются, вы видите отправляемый текст и даёте отдельное согласие.", "В исковом заявлении скрытые данные не передаются AI и возвращаются в готовый документ на стороне Платформы.", "Автоматическое скрытие не гарантирует обнаружение всех персональных данных — проверяйте текст перед отправкой."]],
    ["5. Кому передаются", ["Провайдеры хостинга и базы данных (Render, Neon PostgreSQL), сервис отправки email (Resend или SMTP), AI-сервис (Google Gemini). Их серверы могут находиться за пределами Узбекистана.", "Данные не продаются и не передаются для рекламы. В случаях, предусмотренных законом, могут быть переданы уполномоченным органам."]],
    ["6. Cookie", ["Используется только один необходимый cookie: hq_session (сохраняет вход, 7 дней, HttpOnly). Рекламных и отслеживающих cookie нет."]],
    ["7. Сроки хранения", ["Сессии — 7 дней или до выхода. Коды подтверждения и восстановления — 15–20 минут. Данные аккаунта — до удаления аккаунта. Зашифрованные резервные копии — 7 дней."]],
    ["8. Ваши права", ["Ознакомиться с данными, исправить их, потребовать удаления и прекращения обработки, отозвать согласие. Профиль и пароль можно изменить в личном кабинете; по остальным вопросам обращайтесь по адресу ниже."]],
    ["9. Меры защиты", ["Пароли хешируются scrypt, токены сессий хранятся в виде хеша, соединения — по HTTPS, резервные копии зашифрованы. Ни одна система не защищена на 100%."]],
    ["10. Изменения", ["При изменении политики новая версия публикуется на этой странице с новым номером версии."]]
  ] },
  en: { title: "Privacy policy", sections: [
    ["1. Who processes the data", ["VERIUS is a legal information and AI assistant platform (the Platform). This policy follows the Law of the Republic of Uzbekistan “On Personal Data”."]],
    ["2. What is collected", ["Account: first and last name, email, a password hash (the password itself is never stored), role and status, sign-up and last sign-in time.", "What you enter: cases, saved documents, AI conversations, the Advokat PRO workspace.", "Consent records: which document version you accepted and when.", "Security log: sign-in attempts and security events. IP addresses are not stored in clear text — only a one-way hash.", "Uploaded files (PDF, DOCX): read in memory only to extract text and never written to disk."]],
    ["3. Purposes", ["Running your account, sign-in and password recovery; preparing the legal information, calculations and draft documents you request; security and abuse prevention."]],
    ["4. Artificial intelligence (Google Gemini)", ["When you use AI features, text is sent to Google Gemini. Before sending, personal ID numbers, passports, phones, emails, addresses and card numbers are masked automatically; you see the exact text and give separate consent.", "For statements of claim, masked data is never given to the AI and is put back into the final document by the Platform.", "Automatic masking cannot guarantee that all personal data is detected — review the text before sending."]],
    ["5. Who receives data", ["Hosting and database providers (Render, Neon PostgreSQL), the email service (Resend or SMTP) and the AI service (Google Gemini). Their servers may be located outside Uzbekistan.", "Data is not sold or shared for advertising. It may be disclosed to competent authorities where the law requires."]],
    ["6. Cookies", ["Only one essential cookie is used: hq_session (keeps you signed in, 7 days, HttpOnly). No advertising or tracking cookies."]],
    ["7. Retention", ["Sessions — 7 days or until sign-out. Verification and reset codes — 15–20 minutes. Account data — until the account is deleted. Encrypted backups — 7 days."]],
    ["8. Your rights", ["Access, correct, request deletion of and restrict processing of your data, and withdraw consent. You can change your profile and password in your account; for anything else use the contact below."]],
    ["9. Safeguards", ["Passwords are hashed with scrypt, session tokens are stored as hashes, connections use HTTPS and backups are encrypted. No system is 100% secure."]],
    ["10. Changes", ["If this policy changes, the new version is published on this page with a new version number."]]
  ] }
};

const TERMS = {
  uz: { title: "Foydalanish shartlari", sections: [
    ["1. Xizmat mohiyati", ["VERIUS huquqiy ma’lumot, kalkulyatorlar va hujjat loyihalarini taqdim etadi. Bu advokat yoki yurist maslahati emas va advokat–mijoz munosabatini yuzaga keltirmaydi."]],
    ["2. AI va hujjatlar", ["AI javoblari va hujjat loyihalarida xato bo‘lishi mumkin. Sudga yoki davlat organiga topshirishdan oldin faktlar, rekvizitlar, sudga tegishlilik, muddatlar, davlat boji va qonunning amaldagi tahririni o‘zingiz tekshirasiz yoki advokat bilan maslahatlashasiz.", "Hisob-kitoblar (aliment, boj, pensiya va boshqalar) taxminiy bo‘lib, rasmiy hisob o‘rnini bosmaydi."]],
    ["3. Akkaunt", ["Ro‘yxatdan o‘tishda haqiqiy ma’lumot kiritasiz va parolingizni sir saqlaysiz. Akkauntingizdagi harakatlar uchun siz javobgarsiz."]],
    ["4. Taqiqlanadi", ["Boshqa shaxsning ma’lumotlarini uning roziligisiz kiritish, soxta hujjat tayyorlash, xizmatni buzishga yoki ortiqcha yuklashga urinish, avtomatlashtirilgan ommaviy so‘rovlar yuborish."]],
    ["5. Javobgarlikni cheklash", ["Platforma xizmatni “boricha” taqdim etadi. Qonun yo‘l qo‘ygan darajada, Platforma ma’lumotlardan foydalanish natijasida yuzaga kelgan zarar uchun javobgar emas."]],
    ["6. Akkauntni cheklash", ["Ushbu shartlar buzilsa, akkaunt to‘xtatilishi yoki bloklanishi mumkin."]],
    ["7. Amaldagi huquq", ["Ushbu shartlarga O‘zbekiston Respublikasi qonunchiligi qo‘llaniladi."]],
    ["8. O‘zgarishlar", ["Shartlar o‘zgarsa, yangi versiya shu sahifada e’lon qilinadi."]]
  ] },
  ru: { title: "Условия использования", sections: [
    ["1. Суть сервиса", ["VERIUS предоставляет правовую информацию, калькуляторы и проекты документов. Это не консультация адвоката или юриста и не создаёт отношений «адвокат–клиент»."]],
    ["2. AI и документы", ["Ответы AI и проекты документов могут содержать ошибки. Перед подачей в суд или госорган вы сами проверяете факты, реквизиты, подсудность, сроки, госпошлину и действующую редакцию закона либо консультируетесь с адвокатом.", "Расчёты (алименты, пошлина, пенсия и др.) являются ориентировочными и не заменяют официальный расчёт."]],
    ["3. Аккаунт", ["При регистрации вы указываете достоверные данные и храните пароль в тайне. Вы отвечаете за действия в своём аккаунте."]],
    ["4. Запрещается", ["Вводить чужие данные без согласия, готовить поддельные документы, пытаться нарушить работу или перегрузить сервис, отправлять автоматизированные массовые запросы."]],
    ["5. Ограничение ответственности", ["Сервис предоставляется «как есть». В пределах, допускаемых законом, Платформа не несёт ответственности за ущерб от использования информации."]],
    ["6. Ограничение аккаунта", ["При нарушении условий аккаунт может быть приостановлен или заблокирован."]],
    ["7. Применимое право", ["К условиям применяется законодательство Республики Узбекистан."]],
    ["8. Изменения", ["При изменении условий новая версия публикуется на этой странице."]]
  ] },
  en: { title: "Terms of use", sections: [
    ["1. What the service is", ["VERIUS provides legal information, calculators and draft documents. It is not advice from an advocate or lawyer and creates no advocate–client relationship."]],
    ["2. AI and documents", ["AI answers and draft documents may contain errors. Before filing with a court or authority you verify the facts, details, jurisdiction, deadlines, court fees and the current law yourself or consult an advocate.", "Calculations (maintenance, fees, pensions, etc.) are estimates and do not replace an official calculation."]],
    ["3. Account", ["You provide accurate details when registering and keep your password secret. You are responsible for activity in your account."]],
    ["4. Not allowed", ["Entering another person’s data without consent, preparing forged documents, attempting to disrupt or overload the service, sending automated bulk requests."]],
    ["5. Limitation of liability", ["The service is provided “as is”. To the extent permitted by law, the Platform is not liable for damage resulting from use of the information."]],
    ["6. Account restrictions", ["Accounts that breach these terms may be suspended or blocked."]],
    ["7. Governing law", ["These terms are governed by the law of the Republic of Uzbekistan."]],
    ["8. Changes", ["If the terms change, the new version is published on this page."]]
  ] }
};

function render(doc, lang) {
  const meta = { uz: ["Versiya", "Kuchga kirgan sana"], ru: ["Версия", "Действует с"], en: ["Version", "Effective"] }[lang];
  const other = doc === PRIVACY
    ? { href: "/terms", label: TERMS[lang].title } : { href: "/privacy", label: PRIVACY[lang].title };
  const d = doc[lang];
  const body = d.sections.map(([h, ps]) => '<h2 style="font-size:20px;margin:26px 0 8px">' + esc(h) + "</h2>" + ps.map(p => '<p style="line-height:1.7;margin:0 0 10px">' + esc(p) + "</p>").join("")).join("");
  return '<article class="accountPanel" style="max-width:860px;margin:24px auto"><h1>' + esc(d.title) + '</h1><p class="accountMuted">' + esc(meta[0]) + ": " + esc(CONSENT_VERSION) + " · " + esc(meta[1]) + ": " + esc(EFFECTIVE_DATE) + "</p>" + body +
    '<p class="accountMuted" style="margin-top:24px">' + esc(contactLine(lang)) + '</p><p><a href="' + other.href + "?lang=" + lang + '">' + esc(other.label) + " →</a></p></article>";
}

function page(kind, lang) {
  lang = ["uz", "ru", "en"].includes(lang) ? lang : "uz";
  const doc = kind === "terms" ? TERMS : PRIVACY;
  return { title: doc[lang].title, body: render(doc, lang) };
}

function links(lang) {
  lang = ["uz", "ru", "en"].includes(lang) ? lang : "uz";
  return { privacy: { href: "/privacy?lang=" + lang, label: PRIVACY[lang].title }, terms: { href: "/terms?lang=" + lang, label: TERMS[lang].title } };
}

module.exports = { page, links, CONSENT_VERSION, EFFECTIVE_DATE };
