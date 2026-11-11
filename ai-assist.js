"use strict";
// Gemini AI assistant panel for tool pages that previously worked only in the
// browser (Advokat PRO tools, criminal advisor). The panel collects what the
// user typed on the page, shows the privacy-redacted copy, and sends it to
// Gemini only after explicit, signed consent — the same model as /ai-result.
const { sanitizeText, auditOutbound, tokenFor, checkToken } = require("./ai-egress-consent");

const RULES = `QAT’IY QOIDALAR:
1) Mavjud bo‘lmagan qonun, modda, sud qarori, ish raqami, sudya yoki faktni o‘ylab topmang.
2) Modda raqamiga ishonchingiz komil bo‘lmasa, raqam bermang — qaysi qonun yoki kodeksni LexUZda tekshirish kerakligini yozing.
3) Foydalanuvchi bermagan faktni fakt sifatida qo‘shmang; yetishmayotgan ma’lumotlarni alohida sanab o‘ting.
4) Sud natijasini kafolatlamang.
5) Matndagi "..._YASHIRILDI" ko‘rinishidagi belgilar yashirilgan shaxsiy ma’lumotlardir — ularni tiklashga urinmang, hujjat matnida [____] bilan qoldiring.
6) Bo‘lim sarlavhalarini katta harflar bilan yozing; markdown jadval ishlatmang.`;

const TOOLS = {
  "doc-check": {
    routes: ["/advokat-pro/check"],
    include: ["#results"],
    title: { uz: "Gemini AI hujjat ekspertizasi", ru: "Экспертиза документа — Gemini AI", en: "Gemini AI document review" },
    task: `Siz O‘zbekiston huquqi bo‘yicha tajribali advokat-ekspertsiz. Quyidagi hujjat loyihasini professional ekspertizadan o‘tkazing.
Natijani quyidagi bo‘limlarda bering:
1. HUJJAT TURI VA UMUMIY BAHO
2. JIDDIY KAMCHILIKLAR — har biri uchun: muammo, nega muhim, qanday tuzatish
3. YETISHMAYOTGAN REKVIZITLAR VA MA’LUMOTLAR
4. HUQUQIY ASOSLAR VA SUDLOVLILIK
5. DALILLAR VA ILOVALAR
6. TAHRIR TAKLIFLARI — tayyor tuzatilgan jumlalar bilan
7. LEXUZDA TEKSHIRILADIGAN MANBALAR`
  },
  "evidence-review": {
    routes: ["/advokat-pro/criminal/evidence-review"],
    include: ["#results"],
    title: { uz: "Gemini AI dalillar tahlili", ru: "Анализ доказательств — Gemini AI", en: "Gemini AI evidence analysis" },
    task: `Siz jinoyat ishlari bo‘yicha tajribali himoyachi advokatsiz. Quyidagi dalillar va ish materiallarini O‘zbekiston Jinoyat-protsessual kodeksi talablari nuqtai nazaridan tahlil qiling.
Natijani quyidagi bo‘limlarda bering:
1. DALILLAR RO‘YXATI VA QISQA BAHO
2. MAQBULLIK — ehtimoliy protsessual buzilishlar
3. ISHONCHLILIK VA QARAMA-QARSHILIKLAR
4. ALOQADORLIK VA YETARLILIK
5. YETISHMAYOTGAN DALILLAR VA TERGOV HARAKATLARI
6. HIMOYA UCHUN ILTIMOSNOMALAR
7. LEXUZDA TEKSHIRILADIGAN MANBALAR`
  },
  "documents": {
    routes: ["/advokat-pro/documents"],
    include: [],
    title: { uz: "Gemini AI hujjat tayyorlash", ru: "Подготовка документа — Gemini AI", en: "Gemini AI document drafting" },
    task: `Siz O‘zbekiston huquqi bo‘yicha tajribali advokatsiz. Advokat quyidagi ma’lumotlar asosida protsessual hujjat tayyorlamoqda.
Natijani quyidagi bo‘limlarda bering:
1. KAMCHILIKLAR VA XAVFLAR
2. TAYYOR HUJJAT MATNI — rasmiy uslubda va to‘liq: kimga, kimdan, faktlar, huquqiy asos, talab, ilovalar, sana va imzo. Yetishmayotgan joylarni [____] bilan belgilang.
3. TEKSHIRILISHI KERAK BO‘LGAN JOYLAR`
  },
  "criminal-draft": {
    routes: ["/advokat-pro/criminal/draft"],
    include: ["#preview"],
    title: { uz: "Gemini AI iltimosnoma tahriri", ru: "Редактура ходатайства — Gemini AI", en: "Gemini AI motion review" },
    task: `Siz jinoyat ishlari bo‘yicha tajribali himoyachi advokatsiz. Quyidagi ma’lumotlar va iltimosnoma/e’tiroz loyihasini tahlil qiling va kuchaytiring.
Natijani quyidagi bo‘limlarda bering:
1. LOYIHA BAHOSI
2. KUCHAYTIRISH BO‘YICHA TAVSIYALAR
3. TAKOMILLASHTIRILGAN TO‘LIQ MATN — yetishmayotgan joylarni [____] bilan belgilang
4. LEXUZDA TEKSHIRILADIGAN MANBALAR`
  },
  "grounded": {
    routes: ["/advokat-pro/grounded"],
    include: ["#out"],
    title: { uz: "Gemini AI manbali tahlil", ru: "Анализ с источниками — Gemini AI", en: "Gemini AI source-based analysis" },
    task: `Advokat ish faktlarini, qonun normasi matnini va sud qarori parchasini kiritdi. Faqat berilgan matnlarga tayangan holda tahlil qiling; ulardan tashqaridagi qonun yoki sud qarorini keltirmang, zarur bo‘lsa "qo‘shimcha tekshirish kerak" deb belgilang.
Natijani quyidagi bo‘limlarda bering:
1. FAKTLAR VA NORMA O‘RTASIDAGI MOSLIK
2. SUD QARORIDAGI MULOHAZA VA ISHGA TATBIQ ETILISHI
3. MOS VA FARQLI JIHATLAR
4. POZITSIYA UCHUN ARGUMENTLAR
5. XAVFLAR VA QARSHI ARGUMENTLAR
6. XULOSA VA KEYINGI QADAMLAR`
  },
  "court-practice": {
    routes: ["/advokat-pro/court-practice"],
    include: ["#out"],
    title: { uz: "Gemini AI sud amaliyoti tahlili", ru: "Анализ судебной практики — Gemini AI", en: "Gemini AI court practice analysis" },
    task: `Advokat ish holatini va sud qarori matnini kiritdi. Faqat berilgan qaror matniga tayaning; yangi sud qarori, ish raqami yoki sudya nomini o‘ylab topmang.
Natijani quyidagi bo‘limlarda bering:
1. VAZIYAT QISQACHA
2. SUD QANDAY MULOHAZA YURITGAN
3. O‘XSHASH VA FARQLI FAKTLAR
4. ISHGA TA’SIRI
5. QAROR MANTIG‘IDAN QANDAY FOYDALANISH MUMKIN
6. QO‘SHIMCHA TEKSHIRUV`
  },
  "criminal-advisor": {
    routes: ["/criminal/advisor"],
    include: ["#result"],
    title: { uz: "Gemini AI maslahatchi", ru: "Консультант Gemini AI", en: "Gemini AI adviser" },
    task: `Fuqaro jinoyat-huquqiy vaziyatini tasvirladi. Oddiy va tushunarli tilda tushuntiring. Jinoyat sodir etish, javobgarlikdan qochish yoki dalillarni yo‘q qilishga yordam beradigan maslahat bermang.
Natijani quyidagi bo‘limlarda bering:
1. VAZIYAT QISQACHA
2. SIZNING HUQUQLARINGIZ — faqat ushbu vaziyatga tegishlilari
3. HOZIR NIMA QILISH KERAK — aniq qadamlar
4. NIMA QILMASLIK KERAK
5. QAYSI HUJJAT VA DALILLARNI SAQLASH KERAK
6. QACHON ZUDLIK BILAN ADVOKATGA MUROJAAT QILISH KERAK`
  },
  "criminal-advisor-pro": {
    routes: ["/advokat-pro/criminal/advisor"],
    include: ["#result"],
    title: { uz: "Gemini AI himoya strategiyasi", ru: "Стратегия защиты — Gemini AI", en: "Gemini AI defence strategy" },
    task: `Siz jinoyat ishlari bo‘yicha tajribali himoyachi advokatsiz. Quyidagi ish holatini professional tahlil qiling.
Natijani quyidagi bo‘limlarda bering:
1. HUQUQIY KVALIFIKATSIYA MASALALARI
2. PROTSESSUAL HOLAT VA MUDDATLAR
3. HIMOYA STRATEGIYASI VARIANTLARI
4. DALILLAR BO‘YICHA ISH
5. ILTIMOSNOMA VA SHIKOYATLAR
6. XAVFLAR
7. LEXUZDA TEKSHIRILADIGAN MANBALAR`
  }
};

const ROUTE_TO_TOOL = {};
for (const [key, tool] of Object.entries(TOOLS)) for (const route of tool.routes) ROUTE_TO_TOOL[route] = key;

const UI = {
  uz: {
    badge: "SUN’IY INTELLEKT",
    intro: "Sahifada kiritgan ma’lumotlaringiz asosida Google Gemini professional tahlil tayyorlaydi. Yuborishdan oldin shaxsiy ma’lumotlar yashiriladi va yuboriladigan matnni o‘zingiz ko‘rib tasdiqlaysiz.",
    run: "✦ AI bilan tahlil qilish",
    previewTitle: "AI’ga yuboriladigan matn (shaxsiy ma’lumotlar yashirilgan)",
    consent: "Ko‘rsatilgan matn tashqi Google Gemini AI xizmatiga yuborilishiga roziman.",
    send: "Tasdiqlash va yuborish", cancel: "Bekor qilish", copy: "Nusxa olish", copied: "Nusxa olindi",
    loading: "Gemini tahlil qilmoqda… odatda 20–60 soniya davom etadi.",
    pageOutput: "Sahifadagi tekshiruv natijasi",
    note: "AI natijasi yuridik xulosa emas. Moddalar va muddatlarni LexUZdagi amaldagi matn bilan tekshiring.",
    errors: {
      empty: "Avval sahifadagi maydonlarni to‘ldiring (kamida bir necha jumla).",
      privacy: "Matnda maxfiy ma’lumot (parol, kalit, karta ma’lumoti va h.k.) bor. Uni olib tashlab, qayta urinib ko‘ring.",
      consent: "Rozilik belgilanmagan yoki matn o‘zgargan. Qayta urinib ko‘ring.",
      busy: "So‘rovlar juda ko‘p. Bir necha daqiqadan keyin qayta urinib ko‘ring.",
      rate: "Gemini so‘rovlar limiti vaqtincha tugadi. Birozdan keyin qayta urinib ko‘ring.",
      timeout: "Gemini hozir juda band, javob kechikdi. Bir daqiqadan keyin qayta urinib ko‘ring.",
      auth: "AI xizmati sozlamasida muammo bor. Sayt administratoriga xabar bering.",
      failed: "AI tahlilini olib bo‘lmadi. Qayta urinib ko‘ring."
    }
  },
  ru: {
    badge: "ИСКУССТВЕННЫЙ ИНТЕЛЛЕКТ",
    intro: "Google Gemini подготовит профессиональный анализ по данным, введённым на странице. Перед отправкой персональные данные скрываются, и вы сами проверяете и подтверждаете отправляемый текст.",
    run: "✦ Анализ с помощью AI",
    previewTitle: "Текст для AI (персональные данные скрыты)",
    consent: "Я согласен отправить показанный текст внешнему сервису Google Gemini.",
    send: "Подтвердить и отправить", cancel: "Отмена", copy: "Копировать", copied: "Скопировано",
    loading: "Gemini анализирует… обычно 20–60 секунд.",
    pageOutput: "Результат проверки на странице",
    note: "Результат AI не является юридическим заключением. Сверяйте статьи и сроки с действующим текстом LexUZ.",
    errors: {
      empty: "Сначала заполните поля на странице (хотя бы несколько предложений).",
      privacy: "В тексте есть конфиденциальные данные (пароль, ключ, данные карты и т.п.). Удалите их и повторите.",
      consent: "Согласие не отмечено или текст изменён. Повторите попытку.",
      busy: "Слишком много запросов. Повторите через несколько минут.",
      rate: "Временно исчерпан лимит запросов Gemini. Повторите немного позже.",
      timeout: "Gemini сейчас перегружен, ответ задержался. Повторите через минуту.",
      auth: "Проблема с настройкой AI. Сообщите администратору сайта.",
      failed: "Не удалось получить анализ AI. Повторите попытку."
    }
  },
  en: {
    badge: "ARTIFICIAL INTELLIGENCE",
    intro: "Google Gemini prepares a professional analysis from what you entered on this page. Personal data is redacted first, and you review and approve the exact text before it is sent.",
    run: "✦ Analyse with AI",
    previewTitle: "Text to be sent to AI (personal data redacted)",
    consent: "I agree to send the displayed text to the external Google Gemini AI service.",
    send: "Confirm and send", cancel: "Cancel", copy: "Copy", copied: "Copied",
    loading: "Gemini is analysing… usually 20–60 seconds.",
    pageOutput: "Page check result",
    note: "AI output is not a legal opinion. Verify articles and deadlines against the current LexUZ text.",
    errors: {
      empty: "Fill in the fields on this page first (at least a few sentences).",
      privacy: "The text contains secrets (password, key, card data, etc.). Remove them and try again.",
      consent: "Consent missing or the text changed. Please try again.",
      busy: "Too many requests. Please try again in a few minutes.",
      rate: "The Gemini request limit was temporarily reached. Please try again shortly.",
      timeout: "Gemini is busy and the answer timed out. Please try again in a minute.",
      auth: "The AI service is misconfigured. Please notify the site administrator.",
      failed: "The AI analysis could not be produced. Please try again."
    }
  }
};

const CSS = `
.vai-root{max-width:1210px;margin:28px auto 8px;padding:0 0;font-family:Inter,system-ui,"Segoe UI",Arial,sans-serif;color:#12263a}
.vai-card{position:relative;border-radius:20px;padding:26px;background:#fff;border:1px solid rgba(201,168,106,.45);box-shadow:0 14px 40px rgba(6,17,31,.07);overflow:hidden}
.vai-card:before{content:"";position:absolute;inset:0 0 auto 0;height:3px;background:linear-gradient(90deg,#a67d42,#e6c98e,#a67d42)}
.vai-badge{display:inline-flex;gap:7px;align-items:center;font-size:10px;font-weight:900;letter-spacing:.16em;color:#9b763d;background:#fff8ec;border:1px solid #ead9b8;border-radius:99px;padding:7px 12px}
.vai-card h2{font:500 26px Georgia,"Times New Roman",serif;color:#06111f;margin:14px 0 8px}
.vai-card p.vai-intro{margin:0 0 18px;color:#5d6f82;line-height:1.7;font-size:14.5px;max-width:860px}
.vai-btn{display:inline-flex;align-items:center;gap:8px;border:0;border-radius:11px;padding:13px 20px;font-weight:800;font-size:14px;cursor:pointer;background:linear-gradient(135deg,#c9a86a,#e6c98e);color:#06111f;box-shadow:0 8px 22px rgba(166,125,66,.25)}
.vai-btn[disabled]{opacity:.55;cursor:wait}
.vai-btn.vai-light{background:#eef2f5;color:#12263a;box-shadow:none}
.vai-pre{white-space:pre-wrap;overflow-wrap:anywhere;max-height:320px;overflow:auto;padding:14px;background:#f6f7f8;border:1px solid #e2e7eb;border-radius:12px;font-size:13px;line-height:1.6;color:#142536}
.vai-consent{display:flex;gap:10px;align-items:flex-start;margin:14px 0;font-size:14px;line-height:1.5}
.vai-consent input{margin-top:3px;width:18px;height:18px;flex:none}
.vai-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:6px}
.vai-msg{margin-top:14px;padding:12px 14px;border-radius:11px;font-size:14px;line-height:1.6}
.vai-msg.vai-err{background:#fff1f0;border:1px solid #f3c7c2;color:#8a2a1f}
.vai-msg.vai-wait{background:#f3f7fb;border:1px solid #d9e4ee;color:#1b3a55}
.vai-spin{display:inline-block;width:14px;height:14px;margin-right:8px;vertical-align:-2px;border:2px solid #c9a86a;border-right-color:transparent;border-radius:50%;animation:vai-r 1s linear infinite}
@keyframes vai-r{to{transform:rotate(360deg)}}
.vai-result{margin-top:18px;padding:22px;border-radius:14px;background:#fbfcfd;border:1px solid #e2e7eb;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.75;font-size:15px}
.vai-note{margin-top:10px;font-size:12px;color:#6f7f91}
@media(max-width:600px){.vai-root{margin:20px 12px 8px}.vai-card{padding:20px}.vai-card h2{font-size:22px}.vai-btn{width:100%;justify-content:center}}
`;

// Runs in the browser. Kept ES5-compatible and self-contained.
function clientMain(C) {
  var root = document.getElementById("vai-" + C.tool);
  if (!root) return;
  var T = C.t, $ = function (s) { return root.querySelector(s); };
  var run = $(".vai-run"), step = $(".vai-step"), msg = $(".vai-msgbox"), out = $(".vai-out");
  // Remember the page's untouched output blocks so static placeholder text is not sent.
  var initial = {};
  for (var k = 0; k < C.include.length; k++) {
    var n0 = document.querySelector(C.include[k]);
    initial[C.include[k]] = n0 ? String(n0.innerText || "").trim() : "";
  }
  function show(el, html) { el.innerHTML = html || ""; }
  function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
  function error(code) { show(msg, '<div class="vai-msg vai-err">' + esc(T.errors[code] || T.errors.failed) + "</div>"); }
  function label(el) {
    var l = "";
    if (el.labels && el.labels.length) l = el.labels[0].innerText || "";
    if (!l) l = el.getAttribute("aria-label") || el.getAttribute("placeholder") || el.name || el.id || "";
    return String(l).replace(/\s+/g, " ").trim().slice(0, 90);
  }
  function collect() {
    var parts = [], typed = 0;
    var fields = document.querySelectorAll("main textarea, main input, main select");
    for (var i = 0; i < fields.length; i++) {
      var el = fields[i];
      if (root.contains(el)) continue;
      var type = String(el.type || "").toLowerCase();
      if (/^(hidden|password|file|checkbox|radio|submit|button|reset|image|range|color)$/.test(type)) continue;
      if (/pass|parol|token|secret/i.test((el.name || "") + " " + (el.id || ""))) continue;
      var v = el.tagName === "SELECT" ? (el.selectedOptions && el.selectedOptions[0] ? el.selectedOptions[0].text : "") : el.value;
      v = String(v || "").trim();
      if (!v) continue;
      if (el.tagName !== "SELECT") typed += v.length;
      parts.push(label(el) + ": " + v);
    }
    for (var j = 0; j < C.include.length; j++) {
      var node = document.querySelector(C.include[j]);
      if (node && !root.contains(node)) {
        var text = String(node.innerText || "").trim();
        if (text && text !== initial[C.include[j]]) parts.push("--- " + T.pageOutput + " ---\n" + text.slice(0, 15000));
      }
    }
    return { text: parts.join("\n\n").slice(0, 45000), typed: typed };
  }
  function post(path, data, timeoutMs) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, timeoutMs) : null;
    return fetch(path + "?lang=" + encodeURIComponent(C.lang), {
      method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(data).toString(), signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      return r.json().catch(function () { return { ok: false, error: "failed" }; });
    }).finally(function () { if (timer) clearTimeout(timer); });
  }
  run.addEventListener("click", function () {
    show(msg); show(out);
    var data = collect();
    if (data.typed < 20) { error("empty"); return; }
    run.disabled = true;
    post("/ai-assist-preview", { tool: C.tool, text: data.text }, 30000).then(function (res) {
      run.disabled = false;
      if (!res || !res.ok) { error(res && res.error); return; }
      show(step,
        '<h3 style="margin:18px 0 8px;font-size:15px">' + esc(T.previewTitle) + "</h3>" +
        '<div class="vai-pre"></div>' +
        '<label class="vai-consent"><input type="checkbox" class="vai-agree"> <span>' + esc(T.consent) + "</span></label>" +
        '<div class="vai-actions"><button type="button" class="vai-btn vai-send">' + esc(T.send) + '</button><button type="button" class="vai-btn vai-light vai-cancel">' + esc(T.cancel) + "</button></div>");
      $(".vai-pre").textContent = res.redacted;
      run.style.display = "none";
      $(".vai-cancel").onclick = function () { show(step); show(msg); run.style.display = ""; };
      $(".vai-send").onclick = function () {
        if (!$(".vai-agree").checked) { error("consent"); return; }
        var send = $(".vai-send"); send.disabled = true;
        var started = Date.now();
        show(msg, '<div class="vai-msg vai-wait"><span class="vai-spin"></span>' + esc(T.loading) + ' <b class="vai-sec">0</b>s</div>');
        var tick = setInterval(function () { var s = root.querySelector(".vai-sec"); if (s) s.textContent = Math.round((Date.now() - started) / 1000); }, 1000);
        post("/ai-assist-result", { tool: C.tool, text: res.redacted, aiConsentToken: res.token, aiConsent: "yes" }, 115000).then(function (r) {
          clearInterval(tick);
          if (!r || !r.ok) { send.disabled = false; error(r && r.error); return; }
          show(msg); show(step); run.style.display = "";
          show(out, '<div class="vai-result"></div><div class="vai-actions" style="margin-top:12px"><button type="button" class="vai-btn vai-light vai-copy">' + esc(T.copy) + '</button></div><div class="vai-note">' + esc(T.note) + "</div>");
          $(".vai-result").innerHTML = r.html;
          $(".vai-copy").onclick = function () {
            var txt = $(".vai-result").innerText, btn = $(".vai-copy");
            (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { btn.textContent = T.copied; }, function () {});
          };
          $(".vai-result").scrollIntoView({ behavior: "smooth", block: "start" });
        }, function () { clearInterval(tick); send.disabled = false; error("timeout"); });
      };
    }, function () { run.disabled = false; error("failed"); });
  });
}

function widget(toolKey, lang) {
  const tool = TOOLS[toolKey];
  if (!tool) return "";
  lang = UI[lang] ? lang : "uz";
  const t = UI[lang];
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const config = JSON.stringify({ tool: toolKey, lang, include: tool.include, t }).replace(/</g, "\\u003c");
  return `<section class="vai-root" id="vai-${toolKey}" aria-label="${esc(tool.title[lang])}"><style>${CSS}</style>` +
    `<div class="vai-card"><span class="vai-badge">✦ GEMINI · ${esc(t.badge)}</span><h2>${esc(tool.title[lang])}</h2>` +
    `<p class="vai-intro">${esc(t.intro)}</p><button type="button" class="vai-btn vai-run">${esc(t.run)}</button>` +
    `<div class="vai-step"></div><div class="vai-msgbox" aria-live="polite"></div><div class="vai-out"></div></div>` +
    `<script>(${clientMain.toString()})(${config});</script></section>`;
}

// Insert the panel at the end of the page's main content.
function inject(html, pathname, lang) {
  const toolKey = ROUTE_TO_TOOL[pathname];
  if (!toolKey) return html;
  const source = String(html || "");
  const panel = widget(toolKey, lang);
  const lower = source.toLowerCase();
  const at = lower.lastIndexOf("</main>") >= 0 ? lower.lastIndexOf("</main>") : lower.lastIndexOf("</body>");
  return at < 0 ? source + panel : source.slice(0, at) + panel + source.slice(at);
}

// Simple in-memory limiter to protect the shared Gemini quota.
const WINDOW_MS = 10 * 60 * 1000, PER_CLIENT = 8, GLOBAL = 80;
const hits = new Map();
let globalHits = [];
function clientKey(req) {
  const cf = String(req.headers["cf-connecting-ip"] || "").trim();
  if (cf) return cf;
  const xff = String(req.headers["x-forwarded-for"] || "").split(",").map(s => s.trim()).filter(Boolean);
  return xff.length ? xff[xff.length - 1] : String(req.socket && req.socket.remoteAddress || "unknown");
}
function limited(req, now = Date.now()) {
  globalHits = globalHits.filter(t => now - t < WINDOW_MS);
  const key = clientKey(req);
  const list = (hits.get(key) || []).filter(t => now - t < WINDOW_MS);
  if (list.length >= PER_CLIENT || globalHits.length >= GLOBAL) { hits.set(key, list); return true; }
  list.push(now); globalHits.push(now); hits.set(key, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some(t => now - t < WINDOW_MS)) hits.delete(k);
  return false;
}

function errorCode(error) {
  const m = String(error && error.message || "");
  if (m === "AI_RATE_LIMIT") return "rate";
  if (m === "AI_AUTH_FAILED" || /GEMINI_API_KEY/.test(m)) return "auth";
  if (m === "AI_TIMEOUT") return "timeout";
  return "failed";
}

function cleanAnswer(v) {
  return String(v || "").replace(/```[a-z]*|```/gi, "").replace(/\*\*/g, "").replace(/^#{1,6}\s*/gm, "").trim();
}

// Returns true when the request was handled.
async function handle(req, res, pathname, lang, deps) {
  if (pathname !== "/ai-assist-preview" && pathname !== "/ai-assist-result") return false;
  const { readForm, sendJson, callAI, renderLegalAnswer } = deps;
  if (req.method !== "POST") { sendJson(res, { ok: false, error: "failed" }, 405); return true; }
  const form = await readForm(req);
  const toolKey = String(form.tool || "");
  const tool = TOOLS[toolKey];
  if (!tool) { sendJson(res, { ok: false, error: "failed" }, 400); return true; }
  const text = sanitizeText(String(form.text || "").slice(0, 45000));
  if (text.replace(/\s+/g, "").length < 20) { sendJson(res, { ok: false, error: "empty" }, 400); return true; }
  const payload = { tool: toolKey, text };

  if (pathname === "/ai-assist-preview") {
    try { auditOutbound([{ role: "user", content: text }]); }
    catch (_) { sendJson(res, { ok: false, error: "privacy" }, 422); return true; }
    sendJson(res, { ok: true, redacted: text, token: tokenFor(payload) });
    return true;
  }

  if (form.aiConsent !== "yes" || String(form.text || "") !== text || !checkToken(payload, form.aiConsentToken)) {
    sendJson(res, { ok: false, error: "consent" }, 403); return true;
  }
  if (limited(req)) { sendJson(res, { ok: false, error: "busy" }, 429); return true; }
  try {
    const prompt = `${tool.task}\n\n${RULES}\n\nFOYDALANUVCHI KIRITGAN MA’LUMOTLAR:\n${text}`;
    const answer = cleanAnswer(await callAI(prompt, lang, "", { long: true }));
    sendJson(res, { ok: true, html: renderLegalAnswer(answer) });
  } catch (error) {
    console.error("AI ASSIST ERROR:", toolKey, error && error.message);
    const code = errorCode(error);
    sendJson(res, { ok: false, error: code }, code === "rate" ? 429 : 502);
  }
  return true;
}

module.exports = { TOOLS, ROUTE_TO_TOOL, widget, inject, handle, limited, errorCode, _reset: () => { hits.clear(); globalHits = []; } };
