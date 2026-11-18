"use strict";
// Header block for the public home pages: the signed-in person (name, avatar,
// cabinet link, sign-out) or, for visitors, sign-in / register buttons.
// Only first/last name and role are used; everything is escaped.
const esc = v => String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

const T = {
  uz: { login: "Kirish", register: "Ro‘yxatdan o‘tish", cabinet: "Shaxsiy kabinet", admin: "Admin panel", logout: "Chiqish", hello: "Xush kelibsiz", account: "Akkaunt" },
  ru: { login: "Войти", register: "Регистрация", cabinet: "Личный кабинет", admin: "Админ-панель", logout: "Выйти", hello: "Добро пожаловать", account: "Аккаунт" },
  en: { login: "Sign in", register: "Register", cabinet: "My account", admin: "Admin panel", logout: "Sign out", hello: "Welcome", account: "Account" }
};

const CSS = ".vacc{display:flex;align-items:center;gap:10px;flex-wrap:wrap}" +
  ".vacc a,.vacc button{font:inherit;font-size:13px;font-weight:700;border-radius:999px;padding:8px 14px;line-height:1.2;cursor:pointer;text-decoration:none}" +
  ".vacc .in{border:1px solid #c9a86a;color:#c9a86a;background:transparent}.vacc .reg{border:1px solid #c9a86a;background:#c9a86a;color:#06111f}" +
  ".vacc .who{display:flex;align-items:center;gap:9px;padding:4px 14px 4px 4px;border:1px solid rgba(201,168,106,.55);border-radius:999px;background:rgba(201,168,106,.10);color:inherit}" +
  ".vacc .av{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:#c9a86a;color:#06111f;font-weight:800;font-size:13px;letter-spacing:.02em}" +
  ".vacc .nm{display:flex;flex-direction:column;line-height:1.15}.vacc .nm small{font-size:11px;font-weight:600;opacity:.75}" +
  ".vacc form{margin:0}.vacc .out{border:1px solid rgba(201,168,106,.55);background:transparent;color:inherit}" +
  "@media(max-width:650px){.vacc .nm small{display:none}.vacc a,.vacc button{padding:7px 11px}}";

function initials(user) {
  const a = String(user.firstName || "").trim().charAt(0), b = String(user.lastName || "").trim().charAt(0);
  return (a + b).toUpperCase() || "U";
}

function accountChip(user, lang) {
  const t = T[lang] || T.uz, q = "?lang=" + encodeURIComponent(T[lang] ? lang : "uz");
  if (!user) {
    return '<div class="vacc" data-account="guest"><a class="in" href="/login' + q + '">' + esc(t.login) + '</a><a class="reg" href="/register' + q + '">' + esc(t.register) + '</a></div>';
  }
  const privileged = user.role === "owner" || user.role === "admin";
  const href = (privileged ? "/admin" : "/account") + q;
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || t.account;
  return '<div class="vacc" data-account="signed-in">' +
    '<a class="who" href="' + href + '" title="' + esc(privileged ? t.admin : t.cabinet) + '"><span class="av" aria-hidden="true">' + esc(initials(user)) + '</span>' +
    '<span class="nm"><span>' + esc(name) + '</span><small>' + esc(privileged ? t.admin : t.cabinet) + '</small></span></a>' +
    '<form method="post" action="/logout' + q + '"><button class="out" type="submit">' + esc(t.logout) + '</button></form></div>';
}

function greeting(user, lang) {
  if (!user || !user.firstName) return "";
  const t = T[lang] || T.uz;
  return t.hello + ", " + String(user.firstName).trim() + "!";
}

module.exports = { accountChip, greeting, CSS, esc };
