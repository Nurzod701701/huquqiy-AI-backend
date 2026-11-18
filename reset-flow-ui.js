"use strict";
// Password recovery in four separate steps (uz / ru / en):
//   1. email  →  2. one-time code  →  3. new password  →  4. done (→ login)
// Presentation only: server.js owns every security decision (rate limits,
// code lockout, single-use reset token). No password hint is offered on
// purpose: a hint is shown to unauthenticated visitors and makes passwords
// easier to guess (NIST SP 800-63B forbids storing hints).
const esc = v => String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

const T = {
  uz: {
    title: "Parolni tiklash", steps: ["Email", "Kod", "Yangi parol", "Tayyor"], stepOf: "Bosqich",
    s1Lead: "Akkauntingizga bog‘langan emailni kiriting. Unga 6 xonali tasdiqlash kodi yuboramiz.",
    email: "Email", send: "Kod yuborish", backLogin: "Kirish sahifasiga qaytish",
    adminNote: "Admin hisobining paroli bu sahifa orqali tiklanmaydi.", adminLink: "Admin kirish",
    s2Lead: "Agar bu email ro‘yxatdan o‘tgan bo‘lsa, unga 6 xonali kod yuborildi:", s2Hint: "Kod 20 daqiqa amal qiladi. Kelmasa, Spam papkasini tekshiring.",
    code: "Tasdiqlash kodi", verify: "Kodni tasdiqlash", resend: "Kodni qayta yuborish", resendWait: "Kodni qayta yuborish (60 soniyadan keyin)",
    otherEmail: "Boshqa email kiritish",
    s3Lead: "Yangi parolni kiriting. Kamida 8 belgi; harf, raqam va belgilarni aralashtirsangiz, parol kuchliroq bo‘ladi.",
    pass: "Yangi parol", pass2: "Yangi parolni takrorlang", save: "Parolni saqlash",
    strength: ["Juda zaif", "Zaif", "O‘rtacha", "Yaxshi", "Kuchli"], match: "Parollar mos", mismatch: "Parollar mos emas",
    s4Title: "Parol tiklandi", s4Lead: "Yangi parol saqlandi. Xavfsizlik uchun barcha qurilmalardagi sessiyalar yopildi.",
    toLogin: "Kirish sahifasiga o‘tish", redirect: "soniyadan keyin kirish sahifasiga o‘tasiz…",
    errEmail: "Email to‘g‘ri formatda emas.", errCode: "Kod noto‘g‘ri yoki muddati tugagan.", errLocked: "Juda ko‘p noto‘g‘ri urinish. Yangi kod so‘rang.",
    errLimit: "Ko‘p noto‘g‘ri kod kiritildi. 15 daqiqadan keyin qayta urinib ko‘ring.", errPass: "Yangi parollar mos emas yoki 8 belgidan qisqa.",
    errSameEmail: "Parol emailingiz bilan bir xil bo‘lmasin.", errToken: "Tiklash sessiyasi tugagan yoki yaroqsiz. Iltimos, qaytadan boshlang.",
    errSend: "Kod yuborilmadi. Birozdan keyin qayta urinib ko‘ring.", startOver: "Qaytadan boshlash"
  },
  ru: {
    title: "Восстановление пароля", steps: ["Email", "Код", "Новый пароль", "Готово"], stepOf: "Шаг",
    s1Lead: "Введите email, привязанный к аккаунту. Мы отправим на него 6-значный код подтверждения.",
    email: "Email", send: "Отправить код", backLogin: "Вернуться ко входу",
    adminNote: "Пароль администратора на этой странице не восстанавливается.", adminLink: "Вход администратора",
    s2Lead: "Если этот email зарегистрирован, на него отправлен 6-значный код:", s2Hint: "Код действует 20 минут. Если письма нет, проверьте папку «Спам».",
    code: "Код подтверждения", verify: "Подтвердить код", resend: "Отправить код ещё раз", resendWait: "Отправить код ещё раз (через 60 секунд)",
    otherEmail: "Ввести другой email",
    s3Lead: "Введите новый пароль. Не менее 8 символов; сочетание букв, цифр и знаков делает его надёжнее.",
    pass: "Новый пароль", pass2: "Повторите новый пароль", save: "Сохранить пароль",
    strength: ["Очень слабый", "Слабый", "Средний", "Хороший", "Надёжный"], match: "Пароли совпадают", mismatch: "Пароли не совпадают",
    s4Title: "Пароль восстановлен", s4Lead: "Новый пароль сохранён. Для безопасности все сеансы на других устройствах завершены.",
    toLogin: "Перейти ко входу", redirect: "сек. — и вы перейдёте на страницу входа…",
    errEmail: "Неверный формат email.", errCode: "Код неверный или истёк.", errLocked: "Слишком много неверных попыток. Запросите новый код.",
    errLimit: "Слишком много неверных кодов. Повторите через 15 минут.", errPass: "Пароли не совпадают или короче 8 символов.",
    errSameEmail: "Пароль не должен совпадать с email.", errToken: "Сеанс восстановления истёк или недействителен. Начните заново.",
    errSend: "Код не отправлен. Повторите немного позже.", startOver: "Начать заново"
  },
  en: {
    title: "Reset password", steps: ["Email", "Code", "New password", "Done"], stepOf: "Step",
    s1Lead: "Enter the email linked to your account. We will send it a 6-digit verification code.",
    email: "Email", send: "Send code", backLogin: "Back to sign in",
    adminNote: "The administrator password cannot be reset on this page.", adminLink: "Admin sign-in",
    s2Lead: "If this email is registered, a 6-digit code was sent to:", s2Hint: "The code is valid for 20 minutes. If it does not arrive, check your spam folder.",
    code: "Verification code", verify: "Verify code", resend: "Resend code", resendWait: "Resend code (in 60 seconds)",
    otherEmail: "Use a different email",
    s3Lead: "Enter a new password. At least 8 characters; mixing letters, digits and symbols makes it stronger.",
    pass: "New password", pass2: "Repeat new password", save: "Save password",
    strength: ["Very weak", "Weak", "Fair", "Good", "Strong"], match: "Passwords match", mismatch: "Passwords do not match",
    s4Title: "Password reset", s4Lead: "Your new password is saved. For your security, all sessions on other devices were signed out.",
    toLogin: "Go to sign in", redirect: "seconds until you are taken to sign in…",
    errEmail: "The email format is not valid.", errCode: "The code is wrong or has expired.", errLocked: "Too many wrong attempts. Request a new code.",
    errLimit: "Too many wrong codes. Try again in 15 minutes.", errPass: "The passwords do not match or are shorter than 8 characters.",
    errSameEmail: "The password must not be the same as your email.", errToken: "The reset session has expired or is invalid. Please start again.",
    errSend: "The code was not sent. Please try again shortly.", startOver: "Start again"
  }
};
const L = lang => T[lang] || T.uz;
const q = lang => "?lang=" + encodeURIComponent(T[lang] ? lang : "uz");

const CSS = "<style>" +
  ".rfSteps{display:flex;gap:6px;list-style:none;padding:0;margin:0 0 22px;counter-reset:rf}" +
  ".rfSteps li{flex:1;text-align:center;font-size:12px;font-weight:700;color:#8193a1}" +
  ".rfSteps li:before{counter-increment:rf;content:counter(rf);display:grid;place-items:center;width:30px;height:30px;margin:0 auto 6px;border-radius:50%;border:2px solid #ced9de;background:#fff;color:#8193a1;font-size:13px}" +
  ".rfSteps li.done:before{content:'✓';background:#c9a86a;border-color:#c9a86a;color:#06111f}" +
  ".rfSteps li.now{color:#0d3150}.rfSteps li.now:before{border-color:#c9a86a;color:#0d3150;box-shadow:0 0 0 4px rgba(201,168,106,.18)}" +
  ".rfCode{font:700 28px/1.2 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace!important;letter-spacing:.55em;text-align:center;padding:14px 10px!important}" +
  ".rfMeter{height:6px;border-radius:6px;background:#e3e9ec;overflow:hidden;margin-top:6px}.rfMeter i{display:block;height:100%;width:0;background:#c0392b;transition:width .2s,background .2s}" +
  ".rfNote{font-size:12px;color:#5d7282;margin-top:4px;min-height:16px}" +
  ".rfLinks{display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;margin-top:16px;font-size:14px}" +
  ".rfDone{text-align:center}.rfDone .rfIcon{width:64px;height:64px;margin:4px auto 14px;border-radius:50%;display:grid;place-items:center;background:#e8f6ee;color:#1e7a46;font-size:32px}" +
  ".rfLinkBtn{background:none;border:0;padding:0;color:#0d5c95;font:inherit;text-decoration:underline;cursor:pointer}.rfLinkBtn[disabled]{color:#8193a1;cursor:default;text-decoration:none}" +
  "</style>";

function steps(lang, current) {
  const t = L(lang);
  return '<ol class="rfSteps" aria-label="' + esc(t.stepOf + " " + current + "/4") + '">' +
    t.steps.map((s, i) => '<li class="' + (i + 1 < current ? "done" : i + 1 === current ? "now" : "") + '"' + (i + 1 === current ? ' aria-current="step"' : "") + ">" + esc(s) + "</li>").join("") + "</ol>";
}
function shell(lang, current, inner, message, type) {
  const t = L(lang);
  return CSS + '<section class="accountAuth" data-reset-step="' + current + '"><h1>' + esc(current === 4 ? t.s4Title : t.title) + "</h1>" + steps(lang, current) +
    (message ? '<div class="accountAlert ' + (type || "error") + '" role="alert">' + esc(message) + "</div>" : "") + inner + "</section>";
}
function maskEmail(email) {
  const [user, domain] = String(email || "").split("@");
  if (!domain) return "";
  return (user.length <= 2 ? user.charAt(0) + "*" : user.slice(0, 2) + "*".repeat(Math.min(6, user.length - 2))) + "@" + domain;
}

// Step 1 — email.
function stepEmail(lang, { email = "", error = "" } = {}) {
  const t = L(lang);
  return shell(lang, 1,
    '<p class="accountMuted">' + esc(t.s1Lead) + "</p>" +
    '<form class="accountForm" method="post" action="/forgot-password' + q(lang) + '" novalidate>' +
    "<label>" + esc(t.email) + '<input name="email" type="email" required autocomplete="email" inputmode="email" autofocus value="' + esc(email) + '"></label>' +
    '<button class="accountButton gold">' + esc(t.send) + "</button></form>" +
    '<div class="rfLinks"><a href="/login' + q(lang) + '">← ' + esc(t.backLogin) + "</a></div>" +
    '<p class="accountMuted" style="font-size:13px;margin-top:14px">' + esc(t.adminNote) + ' <a href="/admin/login' + q(lang) + '">' + esc(t.adminLink) + "</a>.</p>",
    error);
}

// Step 2 — one-time code (+ resend with a 60 s countdown).
function stepCode(lang, { email = "", error = "", info = "" } = {}) {
  const t = L(lang);
  return shell(lang, 2,
    '<p class="accountMuted">' + esc(t.s2Lead) + " <strong>" + esc(maskEmail(email)) + "</strong></p>" +
    '<p class="accountMuted" style="font-size:13px">' + esc(t.s2Hint) + "</p>" +
    '<form class="accountForm" method="post" action="/reset-password' + q(lang) + '">' +
    '<input type="hidden" name="email" value="' + esc(email) + '">' +
    "<label>" + esc(t.code) + '<input class="rfCode" name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" minlength="6" autocomplete="one-time-code" required autofocus placeholder="••••••"></label>' +
    '<button class="accountButton gold">' + esc(t.verify) + "</button></form>" +
    '<div class="rfLinks"><form method="post" action="/forgot-password' + q(lang) + '" style="margin:0"><input type="hidden" name="email" value="' + esc(email) + '">' +
    '<button type="submit" class="rfLinkBtn" id="rfResend" data-ready="' + esc(t.resend) + '">' + esc(t.resendWait) + "</button></form>" +
    '<a href="/forgot-password' + q(lang) + '">' + esc(t.otherEmail) + "</a></div>" +
    "<script>(function(){var b=document.getElementById('rfResend');if(!b)return;var n=60;b.disabled=true;var w=b.textContent;" +
    "var i=setInterval(function(){n--;if(n<=0){clearInterval(i);b.disabled=false;b.textContent=b.getAttribute('data-ready');}else{b.textContent=w.replace(/60/,String(n));}},1000);" +
    "var c=document.querySelector('.rfCode');if(c)c.addEventListener('input',function(){c.value=c.value.replace(/[^0-9]/g,'').slice(0,6);});})();</script>",
    error || info, error ? "error" : "info");
}

// Step 3 — new password (token issued by the server after the code was verified).
function stepPassword(lang, { token = "", error = "" } = {}) {
  const t = L(lang);
  return shell(lang, 3,
    '<p class="accountMuted">' + esc(t.s3Lead) + "</p>" +
    '<form class="accountForm" method="post" action="/reset-password/new' + q(lang) + '" id="rfPassForm">' +
    '<input type="hidden" name="token" value="' + esc(token) + '">' +
    "<label>" + esc(t.pass) + '<input name="password" id="rfPass" type="password" minlength="8" maxlength="200" required autocomplete="new-password" autofocus></label>' +
    '<div class="rfMeter" aria-hidden="true"><i id="rfMeterBar"></i></div><div class="rfNote" id="rfStrength" aria-live="polite"></div>' +
    "<label>" + esc(t.pass2) + '<input name="password2" id="rfPass2" type="password" minlength="8" maxlength="200" required autocomplete="new-password"></label>' +
    '<div class="rfNote" id="rfMatch" aria-live="polite"></div>' +
    '<button class="accountButton gold">' + esc(t.save) + "</button></form>" +
    "<script>(function(){var p=document.getElementById('rfPass'),p2=document.getElementById('rfPass2'),bar=document.getElementById('rfMeterBar'),s=document.getElementById('rfStrength'),m=document.getElementById('rfMatch');" +
    "var labels=" + JSON.stringify(t.strength).replace(/</g, "\\u003c") + ",colors=['#c0392b','#e67e22','#d4ac0d','#58a55c','#1e7a46'];" +
    "function score(v){var n=0;if(v.length>=8)n++;if(v.length>=12)n++;if(/[a-z\\u0400-\\u04ff]/i.test(v)&&/[0-9]/.test(v))n++;if(/[^A-Za-z0-9]/.test(v))n++;if(/[A-Z]/.test(v)&&/[a-z]/.test(v))n++;return Math.min(4,v.length<8?0:n-1<0?0:n-1);}" +
    "function upd(){var v=p.value,k=v?score(v):-1;bar.style.width=k<0?'0':((k+1)*20)+'%';bar.style.background=colors[Math.max(0,k)];s.textContent=k<0?'':labels[k];" +
    "if(p2.value){var ok=p2.value===v;m.textContent=ok?" + JSON.stringify(t.match) + ":" + JSON.stringify(t.mismatch) + ";m.style.color=ok?'#1e7a46':'#c0392b';}else{m.textContent='';}}" +
    "p.addEventListener('input',upd);p2.addEventListener('input',upd);})();</script>",
    error);
}

// Step 4 — done; send the user to sign in after a short countdown.
function stepDone(lang) {
  const t = L(lang), href = "/login" + q(lang);
  return shell(lang, 4,
    '<div class="rfDone"><div class="rfIcon" aria-hidden="true">✓</div><p>' + esc(t.s4Lead) + "</p>" +
    '<p class="accountMuted" aria-live="polite"><span id="rfCount">5</span> ' + esc(t.redirect) + "</p>" +
    '<a class="accountButton gold" href="' + href + '" style="display:inline-block;text-decoration:none">' + esc(t.toLogin) + "</a></div>" +
    "<script>(function(){var n=5,e=document.getElementById('rfCount');var i=setInterval(function(){n--;if(e)e.textContent=String(Math.max(0,n));if(n<=0){clearInterval(i);location.href=" + JSON.stringify(href) + ";}},1000);})();</script>");
}

// Error with a "start over" link (expired / invalid reset session).
function stepRestart(lang, message) {
  const t = L(lang);
  return shell(lang, 1, '<div class="rfLinks"><a class="accountButton gold" style="text-decoration:none" href="/forgot-password' + q(lang) + '">' + esc(t.startOver) + "</a></div>", message);
}

module.exports = { stepEmail, stepCode, stepPassword, stepDone, stepRestart, messages: L, maskEmail, title: lang => L(lang).title };
