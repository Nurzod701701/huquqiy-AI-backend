"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const h = require("../claim-helpers");

test("signature initials come from the claimant's full name, not the model", () => {
  assert.equal(h.signatureName("Aliyev Sardor Baxtiyorovich, Toshkent shahri"), "S.B. Aliyev");
  assert.equal(h.signatureName("Shodiyev O‘tkir Shavkatovich"), "O‘.Sh. Shodiyev");
  assert.equal(h.signatureName("Иванов Иван Иванович"), "И.И. Иванов");
  assert.equal(h.signatureName("\"Alfa Savdo\" MChJ"), null, "organisations are left to the model");
  assert.equal(h.fixSignature("Sana: —\nImzo: _ A.B. Aliyev", "Aliyev Sardor Baxtiyorovich"), "Sana: —\nImzo: ____________ S.B. Aliyev");
  assert.match(h.fixSignature("Matn", "Aliyev Sardor Baxtiyorovich"), /\nImzo: ____________ S\.B\. Aliyev$/);
});

test("state fee is added only for a single unambiguous sum on monetary claims", () => {
  const fee = h.stateFee("debt_recovery_claim", { request: "Javobgardan 20 000 000 so‘m qarzni undirish" });
  assert.equal(fee.amount, 20000000);
  assert.equal(fee.fee, 800000);
  assert.equal(h.stateFee("debt_recovery_claim", { request: "5 000 000 so‘m va 1 000 000 so‘m" }), null);
  assert.equal(h.stateFee("moral_damage_claim", { request: "10 000 000 so‘m" }), null);
  assert.equal(h.stateFee("debt_recovery_claim", { request: "qarzni undirish" }), null);
  assert.match(h.stateFeeInstruction(fee, "uz"), /Davlat boji: 800 000 so‘m/);
});

test("legal bases cite only LexUZ-checked Civil Code articles with official links", () => {
  for (const [type, rows] of Object.entries(h.BASES)) {
    assert.ok(rows.length >= 2, type);
    for (const [code, n, title, url] of rows) {
      assert.equal(code, "FK");
      assert.ok(Number.isInteger(n) && title.length > 3, type + " " + n);
      assert.match(url, /^https:\/\/lex\.uz\/docs\/-(111189|180552)$/);
    }
  }
  const text = h.legalBasisFor("debt_recovery_claim", "uz");
  assert.match(text, /735-modda — Qarz oluvchining qarz summasini qaytarish majburiyati/);
  assert.equal(h.legalBasisFor("unknown_type", "uz"), "");
});

test("service notices are split off so they never reach the court document", () => {
  const ai = "DA’VO ARIZASI\nMatn ⚠️ ichida qoladi\nImzo: x\n\n📚 LexUZ: parchalar olindi.\n\nℹ️ Zaxira model ishlatildi.\n\n⚖️ Sud amaliyoti: topilmadi.";
  const { body, notices } = h.splitNotices(ai);
  assert.equal(body, "DA’VO ARIZASI\nMatn ⚠️ ichida qoladi\nImzo: x");
  assert.equal(notices.length, 3);
  assert.match(notices[0], /^📚 LexUZ/);
  assert.deepEqual(h.splitNotices("Faqat matn").notices, []);
});
