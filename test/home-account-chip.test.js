"use strict";
// Signed-in people appear on the home pages; visitors see sign-in/register.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const portal = require("../portal-choice");
const citizen = require("../citizen-home");
const source = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");

test("home page shows the signed-in user's name, cabinet link and sign-out", () => {
  const html = portal("uz", { firstName: "Sardor", lastName: "Aliyev", role: "user" });
  assert.match(html, /data-account="signed-in"/);
  assert.match(html, /Sardor Aliyev/);
  assert.match(html, /<span class="av" aria-hidden="true">SA<\/span>/);
  assert.match(html, /href="\/account\?lang=uz"/);
  assert.match(html, /<form method="post" action="\/logout\?lang=uz">/);
  assert.match(html, /Xush kelibsiz, Sardor!/);
  assert.doesNotMatch(html, /href="\/login\?lang=uz"/);
});

test("visitors see sign-in and register buttons on the home page", () => {
  const html = portal("en");
  assert.match(html, /data-account="guest"/);
  assert.match(html, /href="\/login\?lang=en">Sign in</);
  assert.match(html, /href="\/register\?lang=en">Register</);
});

test("owner/admin link goes to the admin panel; names are escaped", () => {
  const html = portal("ru", { firstName: "<img src=x onerror=alert(1)>", lastName: "Z", role: "owner" });
  assert.match(html, /href="\/admin\?lang=ru"/);
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
});

test("citizen home replaces the generic account pill when signed in", () => {
  const guest = citizen("uz");
  assert.match(guest, /<a class="pill" href="\/login\?lang=uz">Shaxsiy kabinet<\/a>/);
  const signed = citizen("uz", { firstName: "Dilnoza", lastName: "Karimova", role: "user" });
  assert.match(signed, /Dilnoza Karimova/);
  assert.doesNotMatch(signed, /<a class="pill" href="\/login/);
});

test("server passes the session user to the home pages and lands there after sign-in", () => {
  assert.match(source, /require\("\.\/portal-choice"\)\(lang,homeUser\)/);
  assert.match(source, /require\("\.\/citizen-home"\)\(lang,homeUser\)/);
  assert.match(source, /accountAudit\(db,user\.id,"login",\{\}\);[^\n]*accountRedirect\(res,`\/\?lang=\$\{lang\}`\)/);
  assert.match(source, /accountAudit\(db,user\.id,"email_verified",\{\}\);[^\n]*accountRedirect\(res,`\/\?lang=\$\{lang\}`\)/);
});
