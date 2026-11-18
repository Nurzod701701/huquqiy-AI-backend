"use strict";
// Regression tests for the 2026-11-18 full audit (F-1 … F-6).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "server.js"), "utf8");
const legal = require("../legal-pages");

test("F-1: claim evidence script escapes newlines for the browser", () => {
  assert.match(source, /evidence\.value\+=\(evidence\.value\.trim\(\)\?'\\\\n\\\\n':''\)\+'Hujjat: '\+f\.name\+'\\\\n'\+val;/);
});

test("F-2: privacy policy and terms exist in uz/ru/en and registration links to them", () => {
  for (const lang of ["uz", "ru", "en"]) {
    for (const kind of ["privacy", "terms"]) {
      const p = legal.page(kind, lang);
      assert.ok(p.title.length > 5, kind + " " + lang);
      assert.match(p.body, new RegExp(legal.CONSENT_VERSION));
      assert.ok(p.body.length > 1500, kind + " " + lang + " has substance");
    }
  }
  assert.match(legal.page("privacy", "uz").body, /Google Gemini/);
  assert.match(legal.page("privacy", "uz").body, /hq_session/);
  assert.match(source, /<a href="\/terms\?lang=\$\{lang\}" target="_blank" rel="noopener">Foydalanish shartlari<\/a>/);
  assert.match(source, /<a href="\/privacy\?lang=\$\{lang\}" target="_blank" rel="noopener">maxfiylik siyosati<\/a>/);
  assert.match(source, /version:require\("\.\/legal-pages"\)\.CONSENT_VERSION/);
  assert.match(source, /pathname === "\/privacy" \|\| pathname === "\/terms"/);
  assert.match(require("../portal-choice")("ru"), /href="\/privacy\?lang=ru"/);
  assert.match(require("../citizen-home")("en"), /href="\/terms\?lang=en"/);
});

test("F-2: contact line never prints an invalid or injected address", () => {
  const prev = process.env.PRIVACY_CONTACT_EMAIL;
  process.env.PRIVACY_CONTACT_EMAIL = "<script>@x";
  assert.doesNotMatch(legal.page("privacy", "uz").body, /<script>/);
  process.env.PRIVACY_CONTACT_EMAIL = "privacy@example.invalid";
  assert.match(legal.page("privacy", "en").body, /privacy@example\.invalid/);
  if (prev === undefined) delete process.env.PRIVACY_CONTACT_EMAIL; else process.env.PRIVACY_CONTACT_EMAIL = prev;
});

test("F-3: public pages never reveal the owner email", () => {
  assert.doesNotMatch(source, /value="\$\{esc\(OWNER_EMAIL\)\}"/);
  assert.doesNotMatch(source, /if\(email===OWNER_EMAIL\)\{ accountRedirect\(res,`\/admin\/login/);
  assert.doesNotMatch(source, /OWNER akkaunti uchun ajratilgan/);
  assert.doesNotMatch(source, /dashboard\.render\.com\/web\/srv-/);
});

test("F-4: one workflow runs the whole test suite on every pull request", () => {
  const wf = fs.readFileSync(path.join(root, ".github", "workflows", "verius-full-test-suite.yml"), "utf8");
  assert.match(wf, /^on:\n  pull_request:\n/m);
  assert.match(wf, /run: npm test/);
  assert.equal(require("../package.json").scripts.test, "node --test test/*.test.js *.test.js");
});

test("F-5: empty court corpus is reported, not appended as noise to every answer", () => {
  const court = require("../court-practice-reasoning");
  assert.equal(court.evidence("aliment undirish", { corpus: { version: 1, items: [] } }).corpusSize, 0);
  assert.match(source, /if \(!courtEvidence\.found && courtEvidence\.corpusSize > 0\)/);
  if (court.corpusSize() === 0) assert.match(require("../advokat-court-practice")("uz"), /data-corpus="empty"/);
});

test("F-6: responses are compressed and the theme is a cacheable file", () => {
  assert.match(source, /function sendCompressed\(res, status, headers, body\)/);
  assert.match(source, /brotliCompressSync/);
  assert.match(source, /"Cache-Control": "public, max-age=31536000, immutable"/);
  assert.match(source, /const QOMUS_ACADEMY_THEME = '<link id="qomus-academy-liquid-glass" rel="stylesheet"/);
  assert.match(source, /pathname === "\/robots\.txt"/);
});
