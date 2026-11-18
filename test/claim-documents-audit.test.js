"use strict";
// Regression tests for the 2026-11-13 claim/document audit (D-1 … D-7).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const JSZip = require("jszip");
const privacy = require("../ai-privacy");
const consent = require("../ai-egress-consent");
const h = require("../claim-helpers");
const parser = require("../safe-doc-parse");
const limits = require("../request-limits");
const source = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");

async function docx(paragraphs) {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
  zip.file("_rels/.rels", '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="r1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
  zip.file("word/document.xml", '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + '<w:p><w:r><w:t>Qarz shartnomasi</w:t></w:r></w:p>'.repeat(paragraphs) + '</w:body></w:document>');
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

test("D-1: decompression-bomb DOCX is refused without touching the server heap", async () => {
  const bomb = await docx(1_500_000);
  assert.ok(bomb.length < 400 * 1024, "small upload");
  await assert.rejects(parser.extractText("docx", bomb), /DOCX_TOO_LARGE_UNCOMPRESSED/);
  const ok = await parser.extractText("docx", await docx(20));
  assert.match(ok, /Qarz shartnomasi/);
  await assert.rejects(parser.extractText("exe", Buffer.from("x")), /UNSUPPORTED_FORMAT/);
});

test("D-1/D-3: uploads go through the isolated parser, not mammoth/pdf-parse in-process", () => {
  assert.doesNotMatch(source, /require\(['"]mammoth['"]\)/);
  assert.doesNotMatch(source, /require\(['"]pdf-parse['"]\)/);
  assert.equal((source.match(/require\('\.\/safe-doc-parse'\)\.extractText/g) || []).length, 2);
  const pkg = require("../package.json");
  assert.ok(!pkg.dependencies["pdf-parse"], "outdated pdf-parse removed");
  assert.ok(pkg.dependencies["pdfjs-dist"], "maintained pdf.js");
  assert.equal(parser.LIMITS.PDF_MAX_PAGES <= 100, true);
});

test("D-2: money and document numbers are not mistaken for phone numbers", () => {
  assert.equal(privacy.redactForAI("Qarz 150000000 so‘m").text, "Qarz 150000000 so‘m");
  assert.equal(privacy.redactForAI("shartnoma №123456789").text, "shartnoma №123456789");
  assert.match(privacy.redactForAI("Tel: +998 90 123 45 67").text, /TELEFON_YASHIRILDI/);
  assert.match(privacy.redactForAI("901234567").text, /TELEFON_YASHIRILDI/);
});

test("D-2: reversible masking round-trips through a sealed, token-bound map", () => {
  const state = privacy.newRestoreState();
  const masked = privacy.redactReversible("Manzil: Toshkent, Chilonzor 5\nTel: +998 90 123 45 67", state).text;
  assert.doesNotMatch(masked, /Chilonzor|123 45 67/);
  assert.match(masked, /\[MANZIL_1\]/);
  const sealed = consent.sealRestore(state.map, "token-a");
  assert.equal(consent.openRestore(sealed, "token-b"), null, "bound to its consent token");
  const map = consent.openRestore(sealed, "token-a");
  assert.equal(privacy.restoreText("Da’vogar: " + masked, map), "Da’vogar: Manzil: Toshkent, Chilonzor 5\nTel: +998 90 123 45 67");
  assert.deepEqual(privacy.remainingPlaceholders("x [TELEFON_7] [MANZIL_YASHIRILDI]"), ["[TELEFON_7]", "[MANZIL_YASHIRILDI]"]);
});

test("D-2: claim route masks reversibly and restores fee, signature and document", () => {
  assert.match(source, /const reversible=pathname==="\/claim-result"/);
  assert.match(source, /req\._aiRestoreMap=/);
  assert.match(source, /claimHelpers\.stateFee\(documentType\.id,original\)/);
  assert.match(source, /answer=privacy\.restoreText\(answer,restoreMap\)/);
});

test("D-4: fee uses the claim value only, never sums from the facts, and respects exemption", () => {
  assert.equal(h.stateFee("debt_recovery_claim", { request: "Qarzni undirish", facts: "Oylik 6 000 000 so‘m" }), null);
  const paid = h.stateFee("debt_recovery_claim", { claim_amount: "150 000 000", fee_exemption: "no" });
  assert.equal(paid.amount, 150000000); assert.equal(paid.fee, 6000000); assert.equal(paid.confirmed, true);
  assert.equal(h.stateFee("debt_recovery_claim", { claim_amount: "150000000", fee_exemption: "yes" }), null);
  assert.equal(h.stateFee("debt_recovery_claim", { request: "20 000 000 so‘m undirish" }).confirmed, false);
  assert.match(source, /feeInfo&&feeInfo\.confirmed\?/);
});

test("D-5: economic and administrative claim types are not offered and are refused before AI consent", () => {
  assert.match(source, /\.filter\(document => claimTypeSupported\(document\.id\)\)/);
  assert.match(source, /if\(reversible && requestedClaimType && DOCUMENT_TYPES\.some\(x=>x\.id===requestedClaimType\) && !claimTypeSupported\(requestedClaimType\)\)/);
});

test("D-6: upload and export endpoints are rate limited per client", () => {
  limits._reset();
  const req = { headers: { "x-forwarded-for": "5.6.7.8" }, socket: {} };
  let blocked = 0;
  for (let i = 0; i < limits.RULES.upload.max + 3; i++) if (limits.limited(req, "upload")) blocked++;
  assert.equal(blocked, 3);
  limits._reset();
  assert.match(source, /require\("\.\/request-limits"\)\.limited\(req,bucket\)/);
});

test("D-7: signatures handle upper-case names; only trailing notices leave the document", () => {
  assert.equal(h.signatureName("ALIYEV SARDOR"), "S. Aliyev");
  assert.equal(h.signatureName("Aliyev Sardor Baxtiyorovich"), "S.B. Aliyev");
  const split = h.splitNotices("DA’VO\n\n⚠️ Javobgar ogohlantirilgan.\n\nIV. SUDDAN SO‘RAYMAN\nImzo: x\n\n📚 LexUZ: parcha.\n\n⚖️ Sud amaliyoti: yo‘q.");
  assert.match(split.body, /IV\. SUDDAN SO‘RAYMAN/);
  assert.match(split.body, /⚠️ Javobgar ogohlantirilgan/);
  assert.deepEqual(split.notices, ["📚 LexUZ: parcha.", "⚖️ Sud amaliyoti: yo‘q."]);
});
