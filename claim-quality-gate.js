"use strict";
// Advisory checks only. No source is claimed verified automatically.
function reviewClaim(form = {}, answer = "") {
  const value = key => String(form[key] ?? "").trim();
  const warnings = [];
  const problems = [];
  const add = (message,blocking=false) => { warnings.push(message); if (blocking) problems.push(message); };
  for (const [key,name] of [["claimant","Da’vogar"],["defendant","Javobgar"],["facts","Ish holatlari"],["request","Sudga qo‘yilgan talab"]]) {
    if (!value(key)) add(name+" kiritilmagan.",true);
  }
  if (!value("claimant_contact")) add("Da’vogarning manzili va aloqa ma’lumotlarini aniqlang.",true);
  if (!value("defendant_contact")) add("Javobgarning ma’lum manzili va aloqa ma’lumotlarini aniqlang.",true);
  if (!value("evidence")) add("Talabni tasdiqlovchi dalillar va ilovalar ro‘yxati to‘liq emas.",true);
  const facts = [value("facts"),value("request"),value("evidence")].join(" ");
  const penalty = /penya|неустойк|jarima|neustoyka/i.test(value("request"));
  if (penalty) {
    add("Penya/jarima uchun huquqiy asos, stavka, hisob davri va aniq hisob-kitob advokat tomonidan tasdiqlanishi kerak.",true);
    if (!/(?:penya|jarima|neustoyka).{0,130}(?:shartnoma|tilxat|band|modda|qonun|hisob|foiz)|(?:shartnoma|tilxat|band|qonun).{0,130}(?:penya|jarima|neustoyka)/i.test([value("facts"),value("evidence")].join(" "))) {
      add("Penya/jarimaning shartnomaviy yoki qonuniy asosi kiritilmagan.",true);
    }
  }
  if (/qarz|tilxat/i.test(facts) && !/tilxat|shartnoma|to.lov hujjat/i.test(value("evidence"))) {
    add("Qarz tilxati yoki shartnomasi mavjudligi hamda asl nusxa qayerdaligini aniqlang.",true);
  }
  if (/ish raqami\s*[:№#]\s*\S+/i.test(answer) && !/ish raqami/i.test(value("facts"))) {
    add("Ish raqami kiritilgan; sud tomonidan haqiqatan berilganini tekshiring.",true);
  }
  if (/davlat boji to.langani|boj to.langani|kvitansiya ilova/i.test(answer) && !/kvitansiya|davlat boji to.langani|to.lov hujjati/i.test(value("evidence"))) {
    add("Davlat boji to‘langanligi yoki kvitansiya mavjudligi dalillar bilan tasdiqlanmagan.",true);
  }
  add("Da’vo bahosi va davlat boji/sud xarajatlari alohida ko‘rsatilishi, raqamlar qayta hisoblanishi kerak.");
  add("Sudga tegishlilik, muddatlar va LexUZdagi moddalarning amaldagi tahriri advokat tomonidan tekshiriladi.");
  const status = !value("claimant")||!value("defendant")||!value("facts")||!value("request") ? "QORALAMA"
    : problems.length ? "MA’LUMOTLARNI TO‘LDIRISH ZARUR"
    : "ADVOKATNING YAKUNIY TEKSHIRUVIGA TAYYOR";
  return {status,warnings,problems,verifiedByLawyer:false};
}
function renderReviewHtml(review,escapeHtml){
  return '<section class="notice noticeGold" style="margin-top:16px"><strong>HUJJAT HOLATI: '+escapeHtml(review.status)+'</strong><ul style="margin:12px 0 0;padding-left:22px">'+review.warnings.map(x=>'<li>'+escapeHtml(x)+'</li>').join("")+'</ul><p style="margin-top:12px">Avtomatik tekshiruv huquqiy ekspertiza yoki sudga topshirish uchun tasdiq emas.</p></section>';
}
module.exports={reviewClaim,renderReviewHtml};
