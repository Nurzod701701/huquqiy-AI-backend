"use strict";
// VERIUS AI chat (/ai): a messenger-style conversation with Gemini.
// No separate consent step: every message (and the history sent back) is
// redacted on the server with sanitizeText, and secrets are refused by
// auditOutbound inside callAI. The notice under the input tells users that
// messages go to Google Gemini. History lives only in the visitor's browser.
const { sanitizeText } = require("./ai-egress-consent");
const { splitNotices } = require("./claim-helpers");

const MAX_MESSAGE = 4000, MAX_HISTORY = 12, MAX_HISTORY_CHARS = 16000;

const T = {
  uz: {
    title: "VERIUS yordamchi", description: "Huquqiy savolingizni yozing — VERIUS suhbat tarzida javob beradi.",
    hello: "Assalomu alaykum! Men VERIUS huquqiy yordamchisiman.",
    helloText: "Vaziyatingizni oddiy tilda yozing — savol bering, aniqlashtiring, davom ettiring. Oldingi xabarlaringizni eslab qolaman.",
    placeholder: "Savolingizni yozing…", send: "Yuborish", newChat: "Yangi suhbat", copy: "Nusxa", copied: "Nusxa olindi",
    typing: "VERIUS yozmoqda", retry: "Qayta yuborish", you: "Siz",
    privacy: "Xabarlar Google Gemini AI’ga yuboriladi. Pasport, telefon, karta kabi shaxsiy ma’lumotlar avtomatik yashiriladi. AI javobi dastlabki huquqiy yo‘naltirish — muhim qarordan oldin LexUZ va mutaxassis bilan tekshiring.",
    enterHint: "Enter — yuborish, Shift+Enter — yangi qator",
    chips: ["Nikohdan ajratish tartibi qanday?", "Aliment qancha undiriladi?", "Ish haqim kechiktirilyapti, nima qilay?", "Merosni qanday rasmiylashtiraman?", "Qarzni qanday undiraman?", "Ijara shartnomasini bekor qilsam bo‘ladimi?"],
    errors: { privacy: "Xabaringizda parol, kalit yoki karta ma’lumoti kabi maxfiy ma’lumot bor. Uni olib tashlab, qayta yozing.", busy: "Juda ko‘p xabar yuborildi. Bir necha daqiqadan keyin davom eting.", rate: "Gemini hozir band (limit). Birozdan keyin qayta yuboring.", timeout: "Gemini hozir juda band, javob kechikdi. Qayta yuborib ko‘ring.", auth: "AI xizmati sozlamasida muammo bor. Administratorga xabar bering.", empty: "Xabar bo‘sh.", failed: "Javob olib bo‘lmadi. Qayta yuborib ko‘ring.", network: "Internet aloqasini tekshiring va qayta yuboring." }
  },
  ru: {
    title: "Юридический AI-помощник", description: "Задайте правовой вопрос — VERIUS ответит в формате чата.",
    hello: "Здравствуйте! Я юридический помощник VERIUS.",
    helloText: "Опишите ситуацию простыми словами — задавайте вопросы, уточняйте, продолжайте. Я помню предыдущие сообщения.",
    placeholder: "Напишите вопрос…", send: "Отправить", newChat: "Новый чат", copy: "Копировать", copied: "Скопировано",
    typing: "VERIUS печатает", retry: "Отправить снова", you: "Вы",
    privacy: "Сообщения отправляются в Google Gemini AI. Паспорт, телефон, данные карт и т.п. скрываются автоматически. Ответ AI — первичная правовая навигация: перед важным решением сверьтесь с LexUZ и специалистом.",
    enterHint: "Enter — отправить, Shift+Enter — новая строка",
    chips: ["Как расторгнуть брак?", "Сколько взыскивают алиментов?", "Задерживают зарплату, что делать?", "Как оформить наследство?", "Как взыскать долг?", "Можно ли расторгнуть договор аренды?"],
    errors: { privacy: "В сообщении есть пароль, ключ или данные карты. Удалите их и напишите снова.", busy: "Слишком много сообщений. Продолжите через несколько минут.", rate: "Gemini сейчас занят (лимит). Повторите немного позже.", timeout: "Gemini перегружен, ответ задержался. Попробуйте снова.", auth: "Проблема с настройкой AI. Сообщите администратору.", empty: "Пустое сообщение.", failed: "Не удалось получить ответ. Попробуйте снова.", network: "Проверьте интернет и отправьте снова." }
  },
  en: {
    title: "Legal AI Assistant", description: "Ask a legal question — VERIUS answers like a chat.",
    hello: "Hello! I am the VERIUS legal assistant.",
    helloText: "Describe your situation in plain words — ask, clarify, continue. I remember the earlier messages.",
    placeholder: "Type your question…", send: "Send", newChat: "New chat", copy: "Copy", copied: "Copied",
    typing: "VERIUS is typing", retry: "Send again", you: "You",
    privacy: "Messages are sent to Google Gemini AI. Passport, phone and card details are redacted automatically. AI answers are initial legal guidance — check LexUZ and a professional before important decisions.",
    enterHint: "Enter to send, Shift+Enter for a new line",
    chips: ["How do I file for divorce?", "How much child support can be claimed?", "My salary is delayed — what can I do?", "How do I register an inheritance?", "How do I recover a debt?", "Can I terminate a lease early?"],
    errors: { privacy: "Your message contains a password, key or card data. Remove it and try again.", busy: "Too many messages. Please continue in a few minutes.", rate: "Gemini is busy (limit). Please resend shortly.", timeout: "Gemini is overloaded and timed out. Please resend.", auth: "The AI service is misconfigured. Please notify the administrator.", empty: "The message is empty.", failed: "Could not get an answer. Please resend.", network: "Check your connection and resend." }
  }
};

const CSS = `
.vc-wrap{max-width:980px;margin:0 auto;display:flex;flex-direction:column;height:calc(100vh - 190px);height:calc(100dvh - 190px);min-height:480px;background:#fff;border:1px solid #e2e7eb;border-radius:22px;box-shadow:0 14px 44px rgba(6,17,31,.07);overflow:hidden}
.vc-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 20px;background:linear-gradient(120deg,#06111f,#0d3150);color:#fff}
.vc-brand{display:flex;align-items:center;gap:12px;min-width:0}
.vc-logo{position:relative;flex:none;display:grid;place-items:center;width:40px;height:40px;border-radius:11px;background:linear-gradient(145deg,#e6c98e,#c9a86a);color:#06111f;font:22px Georgia,serif}
.vc-logo:after{content:"";position:absolute;right:-2px;bottom:-2px;width:11px;height:11px;border-radius:50%;background:#2ecc71;border:2px solid #0a223a}
.vc-brand b{display:block;font:500 19px Georgia,serif;letter-spacing:.02em}
.vc-brand small{display:block;font-size:11px;color:#c9d6e2;margin-top:2px}
.vc-new{flex:none;border:1px solid rgba(230,201,142,.5);background:transparent;color:#e6c98e;border-radius:10px;padding:9px 14px;font-weight:700;font-size:13px;cursor:pointer}
.vc-new:hover{background:rgba(230,201,142,.12)}
.vc-log{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:22px 20px 10px;background:#f6f8fa;scroll-behavior:smooth}
.vc-welcome{max-width:640px;margin:18px auto 8px;text-align:center}
.vc-welcome .vc-logo{width:56px;height:56px;margin:0 auto 14px;font-size:30px;border-radius:15px}
.vc-welcome h2{font:500 clamp(22px,3vw,28px) Georgia,serif;color:#06111f;margin:0 0 8px}
.vc-welcome p{color:#5d6f82;line-height:1.7;margin:0 0 18px}
.vc-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.vc-chip{border:1px solid #e3d5b8;background:#fff;color:#12263a;border-radius:99px;padding:9px 14px;font-size:13.5px;cursor:pointer;transition:background .15s,border-color .15s}
.vc-chip:hover{background:#fff8ec;border-color:#c9a86a}
.vc-row{display:flex;gap:10px;margin:0 0 16px;align-items:flex-end}
.vc-row.vc-user{justify-content:flex-end}
.vc-av{flex:none;display:grid;place-items:center;width:32px;height:32px;border-radius:9px;background:linear-gradient(145deg,#e6c98e,#c9a86a);color:#06111f;font:17px Georgia,serif}
.vc-bubble{max-width:min(78%,680px);padding:12px 16px;border-radius:18px;line-height:1.65;font-size:15px;overflow-wrap:anywhere;white-space:pre-wrap}
.vc-user .vc-bubble{background:#0d3150;color:#fff;border-bottom-right-radius:6px}
.vc-bot .vc-bubble{background:#fff;color:#12263a;border:1px solid #e2e7eb;border-bottom-left-radius:6px;box-shadow:0 4px 14px rgba(6,17,31,.04)}
.vc-bot .vc-bubble a{color:#1763aa;text-decoration:underline}
.vc-bot .vc-bubble strong{color:#06111f}
.vc-err .vc-bubble{background:#fff4f2;border-color:#f3c7c2;color:#8a2a1f}
.vc-meta{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:8px}
.vc-mini{border:0;background:none;color:#6f7f91;font-size:12px;cursor:pointer;padding:2px 0}
.vc-mini:hover{color:#12263a}
.vc-note{display:block;margin-top:8px;font-size:11.5px;line-height:1.5;color:#7a8a9b;white-space:normal}
.vc-dots{display:inline-flex;gap:4px;margin-left:6px;vertical-align:middle}
.vc-dots i{width:6px;height:6px;border-radius:50%;background:#c9a86a;animation:vc-b 1.2s infinite ease-in-out}
.vc-dots i:nth-child(2){animation-delay:.15s}.vc-dots i:nth-child(3){animation-delay:.3s}
@keyframes vc-b{0%,80%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
.vc-compose{padding:12px 16px 14px;border-top:1px solid #e8edf1;background:#fff}
.vc-box{display:flex;gap:10px;align-items:flex-end;border:1.5px solid #d9c49a;border-radius:16px;padding:8px 8px 8px 14px;background:#fff;transition:border-color .15s,box-shadow .15s}
.vc-box:focus-within{border-color:#c9a86a;box-shadow:0 0 0 4px rgba(201,168,106,.15)}
.vc-wrap .vc-input{flex:1;width:auto!important;border:0!important;outline:0!important;box-shadow:none!important;border-radius:0!important;resize:none;font:15px/1.55 Inter,system-ui,"Segoe UI",Arial,sans-serif;color:#12263a;max-height:200px;min-height:24px!important;height:auto;overflow-y:hidden;-webkit-appearance:none;appearance:none;margin:0!important;padding:6px 0!important;background:transparent!important}
.vc-send{flex:none;display:grid;place-items:center;width:42px;height:42px;border:0;border-radius:12px;background:linear-gradient(135deg,#c9a86a,#e6c98e);color:#06111f;cursor:pointer;font-size:18px;font-weight:900}
.vc-send[disabled]{opacity:.45;cursor:not-allowed}
.vc-foot{display:flex;justify-content:space-between;gap:12px;margin-top:8px;font-size:11.5px;line-height:1.5;color:#7a8a9b}
.vc-foot span:last-child{flex:none}
/* On phones the section grid pushes the chat below the fold; the header ☰ menu still navigates. */
/* The chat has its own title bar; the generic page hero would push the input below the fold. */
.appMain:has(.vc-wrap)>.appHeader{display:none}
@media(max-width:980px){.appLayout:has(.vc-wrap)>.sidebar{display:none}}
@media(max-width:640px){.vc-wrap{border-radius:0;border-left:0;border-right:0;height:calc(100vh - 130px);height:calc(100dvh - 130px);min-height:420px}.vc-log{padding:16px 12px 8px}.vc-bubble{max-width:86%;font-size:14.5px}.vc-head{padding:12px 14px}.vc-foot span:last-child{display:none}.vc-av{display:none}}
`;

// Runs in the browser (ES5-compatible).
function clientMain(C) {
  var T = C.t, log = document.getElementById("vc-log"), input = document.getElementById("vc-input"), send = document.getElementById("vc-send");
  var KEY = "verius-chat-v1", history = [], busy = false;
  try { history = JSON.parse(localStorage.getItem(KEY) || "[]") || []; } catch (e) { history = []; }
  if (!Array.isArray(history)) history = [];
  function save() { try { localStorage.setItem(KEY, JSON.stringify(history.slice(-40))); } catch (e) {} }
  function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
  function scroll() { log.scrollTop = log.scrollHeight; }
  function welcome() {
    var w = document.createElement("div"); w.className = "vc-welcome"; w.id = "vc-welcome";
    w.innerHTML = '<div class="vc-logo">§</div><h2>' + esc(T.hello) + "</h2><p>" + esc(T.helloText) + '</p><div class="vc-chips"></div>';
    T.chips.forEach(function (c) {
      var b = document.createElement("button"); b.type = "button"; b.className = "vc-chip"; b.textContent = c;
      b.onclick = function () { ask(c); }; w.querySelector(".vc-chips").appendChild(b);
    });
    log.appendChild(w);
  }
  function row(cls) { var r = document.createElement("div"); r.className = "vc-row " + cls; return r; }
  function addUser(text) {
    var r = row("vc-user"); r.innerHTML = '<div class="vc-bubble"></div>'; r.firstChild.textContent = text; log.appendChild(r); scroll();
  }
  function addBot(html, notes, isError, retryText) {
    var r = row("vc-bot" + (isError ? " vc-err" : ""));
    r.innerHTML = '<div class="vc-av">§</div><div class="vc-bubble"></div>';
    var b = r.querySelector(".vc-bubble"); b.innerHTML = html;
    if (notes && notes.length) notes.forEach(function (n) { var s = document.createElement("small"); s.className = "vc-note"; s.textContent = n; b.appendChild(s); });
    var meta = document.createElement("div"); meta.className = "vc-meta";
    if (isError && retryText) {
      var rb = document.createElement("button"); rb.type = "button"; rb.className = "vc-mini"; rb.textContent = "↻ " + T.retry;
      rb.onclick = function () { r.remove(); ask(retryText, true); }; meta.appendChild(rb);
    } else if (!isError) {
      var cb = document.createElement("button"); cb.type = "button"; cb.className = "vc-mini"; cb.textContent = "⧉ " + T.copy;
      cb.onclick = function () {
        var clone = b.cloneNode(true); Array.prototype.forEach.call(clone.querySelectorAll(".vc-note,.vc-meta"), function (x) { x.remove(); });
        if (navigator.clipboard) navigator.clipboard.writeText(clone.innerText.trim()).then(function () { cb.textContent = "✓ " + T.copied; });
      }; meta.appendChild(cb);
    }
    b.appendChild(meta); log.appendChild(r); scroll();
  }
  function render() {
    log.innerHTML = "";
    if (!history.length) { welcome(); return; }
    history.forEach(function (m) { if (m.role === "user") addUser(m.text); else addBot(m.html || esc(m.text), (m.notes || []).filter(function (n) { return /^⚠/.test(n); })); });
  }
  function grow() { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 200) + "px"; input.style.overflowY = input.scrollHeight > 200 ? "auto" : "hidden"; send.disabled = busy || !input.value.trim(); }
  function ask(text, isRetry) {
    text = String(text || "").trim();
    if (!text || busy) return;
    var w = document.getElementById("vc-welcome"); if (w) w.remove();
    var past = history.map(function (m) { return { role: m.role, content: m.text }; }).slice(-12);
    if (!isRetry || !history.length || history[history.length - 1].text !== text || history[history.length - 1].role !== "user") {
      addUser(text); history.push({ role: "user", text: text }); save();
    } else { past = past.slice(0, -1); }
    input.value = ""; busy = true; grow();
    var t = row("vc-bot"); t.innerHTML = '<div class="vc-av">§</div><div class="vc-bubble">' + esc(T.typing) + '<span class="vc-dots"><i></i><i></i><i></i></span></div>';
    log.appendChild(t); scroll();
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 115000) : null;
    fetch("/ai-chat?lang=" + encodeURIComponent(C.lang), {
      method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ message: text, history: JSON.stringify(past) }).toString(), signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) { return r.json().catch(function () { return { ok: false, error: "failed" }; }); })
      .then(function (res) {
        t.remove();
        if (res && res.ok) {
          history.push({ role: "assistant", text: res.text, html: res.html, notes: res.notes || [] }); save();
          addBot(res.html, res.notes);
        } else addBot(esc(T.errors[(res && res.error) || "failed"] || T.errors.failed), null, true, text);
      }, function () { t.remove(); addBot(esc(T.errors.network), null, true, text); })
      .then(function () { if (timer) clearTimeout(timer); busy = false; grow(); input.focus(); });
  }
  input.addEventListener("input", grow);
  input.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); ask(input.value); } });
  send.addEventListener("click", function () { ask(input.value); });
  document.getElementById("vc-new").addEventListener("click", function () { if (busy) return; history = []; save(); render(); input.focus(); });
  var pre = new URLSearchParams(location.search).get("q");
  render(); grow();
  if (pre && !history.length) { input.value = pre; grow(); }
  // Phones: bring the whole chat window right under the sticky site header and
  // do not pop the keyboard; desktops: focus the input without jumping.
  if (window.innerWidth <= 980) {
    var hdr = document.querySelector(".huquqiyMainNav, header.nav"), wrap = document.querySelector(".vc-wrap");
    var off = (hdr ? hdr.getBoundingClientRect().bottom : 0) + 6;
    if (wrap) window.scrollTo(0, Math.max(0, wrap.getBoundingClientRect().top + window.pageYOffset - off));
  } else {
    try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); }
  }
}

function page(lang, appLayout) {
  const t = T[lang] || T.uz;
  lang = T[lang] ? lang : "uz";
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const config = JSON.stringify({ lang, t: { hello: t.hello, helloText: t.helloText, chips: t.chips, copy: t.copy, copied: t.copied, typing: t.typing, retry: t.retry, errors: t.errors } }).replace(/</g, "\\u003c");
  const content = `<style>${CSS}</style>
<section class="vc-wrap" aria-label="${esc(t.title)}">
  <header class="vc-head"><div class="vc-brand"><div class="vc-logo">§</div><div><b>VERIUS</b><small>${esc(t.description)}</small></div></div>
  <button type="button" class="vc-new" id="vc-new">＋ ${esc(t.newChat)}</button></header>
  <div class="vc-log" id="vc-log" aria-live="polite"></div>
  <div class="vc-compose">
    <div class="vc-box"><textarea id="vc-input" class="vc-input" rows="1" maxlength="${MAX_MESSAGE}" placeholder="${esc(t.placeholder)}" aria-label="${esc(t.placeholder)}"></textarea>
    <button type="button" class="vc-send" id="vc-send" aria-label="${esc(t.send)}" title="${esc(t.send)}">➤</button></div>
    <div class="vc-foot"><span>${esc(t.privacy)}</span><span>${esc(t.enterHint)}</span></div>
  </div>
</section>
<script>(${clientMain.toString()})(${config});</script>`;
  return appLayout(lang, "ai", content, t.title, t.description);
}

// Minimal Markdown → HTML on top of the already-escaped, link-aware renderer.
function toChatHtml(answer, renderLegalAnswer) {
  let html = renderLegalAnswer(String(answer || "").replace(/^#{1,6}\s*/gm, "").replace(/```[a-z]*|```/gi, ""));
  html = html.replace(/\*\*([^*\n][^*\n]*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/^(\s*)[-*•]\s+/gm, "$1• ");
  return html.replace(/\n{3,}/g, "\n\n").trim();
}

const WINDOW_MS = 10 * 60 * 1000, PER_CLIENT = 20, GLOBAL = 200;
const hits = new Map(); let globalHits = [];
function clientKey(req) {
  const cf = String(req.headers["cf-connecting-ip"] || "").trim();
  if (cf) return cf;
  const xff = String(req.headers["x-forwarded-for"] || "").split(",").map(s => s.trim()).filter(Boolean);
  return xff.length ? xff[xff.length - 1] : String(req.socket && req.socket.remoteAddress || "unknown");
}
function limited(req, now = Date.now()) {
  globalHits = globalHits.filter(x => now - x < WINDOW_MS);
  const key = clientKey(req), list = (hits.get(key) || []).filter(x => now - x < WINDOW_MS);
  if (list.length >= PER_CLIENT || globalHits.length >= GLOBAL) { hits.set(key, list); return true; }
  list.push(now); globalHits.push(now); hits.set(key, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some(x => now - x < WINDOW_MS)) hits.delete(k);
  return false;
}

function parseHistory(raw) {
  let list;
  try { list = JSON.parse(String(raw || "[]")); } catch (_) { return []; }
  if (!Array.isArray(list)) return [];
  const out = [];
  let total = 0;
  for (const m of list.slice(-MAX_HISTORY).reverse()) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") continue;
    const content = sanitizeText(m.content.slice(0, MAX_MESSAGE)).trim();
    if (!content) continue;
    total += content.length;
    if (total > MAX_HISTORY_CHARS) break;
    out.unshift({ role: m.role, content });
  }
  while (out.length && out[0].role !== "user") out.shift();
  return out;
}

function errorCode(error) {
  const m = String(error && error.message || "");
  if (m === "AI_PRIVACY_UNVERIFIED_CONTENT") return "privacy";
  if (m === "AI_RATE_LIMIT") return "rate";
  if (m === "AI_AUTH_FAILED" || /GEMINI_API_KEY/.test(m)) return "auth";
  if (m === "AI_TIMEOUT") return "timeout";
  return "failed";
}

async function handle(req, res, pathname, lang, deps) {
  if (pathname !== "/ai-chat") return false;
  const { readForm, sendJson, callAI, renderLegalAnswer } = deps;
  if (req.method !== "POST") { sendJson(res, { ok: false, error: "failed" }, 405); return true; }
  const form = await readForm(req);
  const message = sanitizeText(String(form.message || "").slice(0, MAX_MESSAGE)).trim();
  if (!message) { sendJson(res, { ok: false, error: "empty" }, 400); return true; }
  if (limited(req)) { sendJson(res, { ok: false, error: "busy" }, 429); return true; }
  const history = parseHistory(form.history);
  try {
    const hint = history.filter(m => m.role === "user").map(m => m.content).join(" ");
    const raw = await callAI(message, lang, "", { chat: true, history, retrievalHint: hint });
    const { body, notices } = splitNotices(raw);
    const text = body.replace(/\*\*/g, "").trim();
    // In a chat only real warnings are shown (live LexUZ check failed, accuracy
    // warning); routine status lines would repeat under every message.
    const notes = notices.filter(n => /^⚠️/u.test(n));
    sendJson(res, { ok: true, text, html: toChatHtml(body, renderLegalAnswer), notes });
  } catch (error) {
    console.error("AI CHAT ERROR:", error && error.message);
    const code = errorCode(error);
    sendJson(res, { ok: false, error: code }, code === "privacy" ? 422 : code === "rate" ? 429 : 502);
  }
  return true;
}

module.exports = { page, handle, parseHistory, toChatHtml, errorCode, _reset: () => { hits.clear(); globalHits = []; } };
