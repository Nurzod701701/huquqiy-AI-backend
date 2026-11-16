"use strict";
// Conservative, source-independent preflight. Never marks a draft legally approved.
function reviewClaim(form = {}, answer = "") {
  const value = k => String(form[k] ?? "").trim();
  const warnings = [];
  const needs = (ok, msg) => { if (!ok) warnings.push(msg); };
  needs(value("claimant_contact"), "Da’vogarning manzili va aloqa ma’lumotlarini aniqlang.");
  needs(value("defendant_contact"), "Javobgarning ma’lum manzili va aloqa ma’lumotlarini aniqlang.");
  needs(value("evidence"), "Har bir talabni tasdiqlovchi dalillar va ilovalar ro‘yxatini kiriting.");
  const facts = [value("facts"), value("request"), value("evidence")].join(" ");
  const penaltyClaimed = /penya|неустойк|jarima|neustoyka/i.test(value("request"));
  if (penaltyClaimed) {
    const hasBasis = /(?:penya|jarima|neustoyka).{0,130}(?:shartnoma|tilxat|band|modda|qonun|hisob|foiz)|(?:shartnoma|tilxat|band|qonun).{0,130}(?:penya|jarima|neustoyka)/i.test([value("facts"),value("evidence")].join(" "));
    needs(hasBasis, "Penya/jarimaning shartnomaviy yoki qonuniy asosi, stavkasi, davri va hisob-kitobini tasdiqlang.");
    warnings.push("Penya alohida talab sifatida faqat huquqiy asosi va hisob-kitobi tekshirilgandan keyin kiritiladi.");
  }
  if (/qarz|tilxat/i.test(facts)) needs(/tilxat|shartnoma|to.lov hujjat/i.test(value("evidence")), "Qarzga oid tilxat yoki shartnoma ilova qilinadimi, asl nusxa qayerda ekanini aniqlang.");
  if (/\b(?:ish raqami|дело №|case number)\b/i.test(answer)) warnings.push("Yangi da’vo arizasiga sud tomonidan berilmagan ish raqamini kiritmang.");
  if (/\b(?:davlat boji to.langani|boj to.langani|kvitansiya ilova)\b/i.test(answer) && !/kvitansiya|davlat boji to.langani|to.lov hujjati/i.test(value("evidence"))) {
    warnings.push("Davlat boji to‘langanligi yoki kvitansiya mavjudligi tasdiqlanmagan; ilova sifatida tasdiqlamaslik kerak.");
  }
  warnings.push("Sudga tegishlilik, protsessual muddatlar, qonun moddalarining amaldagi tahriri va davlat boji advokat tomonidan tekshiriladi.");
  const status = warnings.length > 1 ? "MA’LUMOTLARNI TO‘LDIRISH ZARUR" : "ADVOKATNING YAKUNIY TEKSHIRUVIGA TAYYOR";
  return { status, warnings, verifiedByLawyer: false };
}
function renderReviewHtml(review, escapeHtml) {
  return '<section class="notice noticeGold" style="margin-top:16px"><strong>HUJJAT HOLATI: '+escapeHtml(review.status)+'</strong><ul style="margin:12px 0 0;padding-left:22px">'+review.warnings.map(x=>'<li>'+escapeHtml(x)+'</li>').join("")+'</ul><p style="margin-top:12px">Bu avtomatik tekshiruv huquqiy ekspertiza yoki sudga topshirish uchun tasdiq emas.</p></section>';
}
module.exports = { reviewClaim, renderReviewHtml };
