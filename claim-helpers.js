"use strict";
// Deterministic helpers for AI-drafted claims: verified legal references,
// state-fee estimate from the site's own calculator, and a correct signature.
// Article numbers/titles below were checked against the official LexUZ text
// of the Civil Code (lex.uz/docs/-111189 part I, lex.uz/docs/-180552 part II)
// on 2026-11-11. Only titles are given so the model cannot misstate content.
const { calculateCourtFee, BHM } = require("./court-fee-rules");

const FK1 = "https://lex.uz/docs/-111189";
const FK2 = "https://lex.uz/docs/-180552";
const OBLIGATIONS = [
  ["FK", 234, "Majburiyat tushunchasi va uning vujudga kelish asoslari", FK1],
  ["FK", 236, "Majburiyatlarni bajarish: umumiy qoidalar", FK1],
  ["FK", 237, "Majburiyatni bajarishdan bir tomonlama bosh tortishga yo‘l qo‘yilmasligi", FK1],
  ["FK", 333, "Majburiyatlarni buzganlik uchun javobgarlik asoslari", FK1]
];
const BASES = {
  debt_recovery_claim: [
    ["FK", 732, "Qarz shartnomasi", FK2],
    ["FK", 733, "Qarz shartnomasining shakli", FK2],
    ["FK", 735, "Qarz oluvchining qarz summasini qaytarish majburiyati", FK2],
    ["FK", 736, "Qarz oluvchi tomonidan qarz shartnomasini buzish oqibatlari", FK2],
    ["FK", 236, "Majburiyatlarni bajarish: umumiy qoidalar", FK1],
    ["FK", 237, "Majburiyatni bajarishdan bir tomonlama bosh tortishga yo‘l qo‘yilmasligi", FK1],
    ["FK", 327, "Pul majburiyatini bajarmaganlik uchun javobgarlik", FK1]
  ],
  contract_breach_claim: [...OBLIGATIONS,
    ["FK", 324, "Qarzdorning zararni to‘lash majburiyati", FK1],
    ["FK", 325, "Neustoyka va zarar", FK1],
    ["FK", 330, "Javobgarlik va majburiyatni asl holida bajarish", FK1]],
  contract_termination_claim: [
    ["FK", 382, "Shartnomani o‘zgartirish va bekor qilish asoslari", FK1],
    ["FK", 383, "Vaziyat jiddiy o‘zgarishi munosabati bilan shartnomani o‘zgartirish va bekor qilish", FK1],
    ["FK", 384, "Shartnomani o‘zgartirish va bekor qilish tartibi", FK1],
    ["FK", 385, "Shartnomani o‘zgartirish va bekor qilishning oqibatlari", FK1]],
  damages_claim: [
    ["FK", 14, "Zararni qoplash", FK1],
    ["FK", 985, "Zarar yetkazganlik uchun javobgarlikning umumiy asoslari", FK2],
    ["FK", 324, "Qarzdorning zararni to‘lash majburiyati", FK1]],
  moral_damage_claim: [
    ["FK", 1021, "Ma’naviy zararni qoplash: umumiy qoidalar", FK2],
    ["FK", 1022, "Ma’naviy zararni qoplash usuli va miqdori", FK2]],
  property_recovery_claim: [
    ["FK", 228, "Mol-mulkni boshqa shaxsning qonunsiz egaligidan talab qilib olish (vindikatsiya)", FK1],
    ["FK", 229, "Mol-mulkni insofli egallovchidan talab qilib olish", FK1]],
  inheritance_claim: [
    ["FK", 1112, "Vorislik asoslari", FK2],
    ["FK", 1113, "Meros tarkibi", FK2],
    ["FK", 1134, "Qonun bo‘yicha vorislik: umumiy qoidalar", FK2],
    ["FK", 1135, "Qonun bo‘yicha birinchi navbatdagi vorislar", FK2]]
};
BASES.economic_debt_claim = BASES.debt_recovery_claim;
BASES.economic_contract_claim = BASES.contract_breach_claim;
BASES.economic_damages_claim = BASES.damages_claim;

function legalBasisFor(type, lang) {
  const rows = BASES[type];
  if (!rows) return "";
  const head = lang === "ru" ? "Гражданский кодекс Республики Узбекистан (названия статей сверены с LexUZ):"
    : lang === "en" ? "Civil Code of Uzbekistan (article titles checked against LexUZ):"
    : "O‘zbekiston Respublikasi Fuqarolik kodeksi (modda nomlari LexUZ bilan solishtirilgan):";
  return head + "\n" + rows.map(([, n, title, url]) => `- ${n}-modda — ${title} (${url})`).join("\n") +
    "\nFaqat ushbu faktlarga haqiqatan tegishli moddalarni keltiring; ro‘yxatda yo‘q modda raqamini qo‘shmang.";
}

// One unambiguous sum in the request text, e.g. "20 000 000 so‘m".
function extractAmount(text) {
  const found = [...String(text || "").matchAll(/(\d{1,3}(?:[  .,]\d{3})+|\d{4,})\s*(?:\([^)]*\)\s*)?so[‘'’`ʻ]?m/gi)]
    .map(m => Number(m[1].replace(/[  .,]/g, ""))).filter(n => Number.isFinite(n) && n > 0);
  const unique = [...new Set(found)];
  return unique.length === 1 ? unique[0] : null;
}

const MONETARY = new Set(["debt_recovery_claim", "contract_breach_claim", "damages_claim"]);
function formatSum(n) { return Math.round(n).toLocaleString("ru-RU").replace(/ /g, " ") + " so‘m"; }

function stateFee(type, form) {
  if (!MONETARY.has(type)) return null;
  const amount = extractAmount(form.request) ?? extractAmount(form.facts);
  if (!amount) return null;
  const r = calculateCourtFee({ claim: "property", amount, exemption: "no" });
  if (r.fee === null) return null;
  return { amount, fee: r.fee, formula: r.formula, bhm: BHM.amount, source: BHM.source };
}

function stateFeeInstruction(fee, lang) {
  if (!fee) return "";
  const uz = `DAVLAT BOJI (VERIUS kalkulyatori, max(da’vo bahosi × 4%, 1 BHM = ${formatSum(fee.bhm)}); manba: ${fee.source}):
Da’vo bahosi: ${formatSum(fee.amount)}. Davlat boji: ${formatSum(fee.fee)}.
Hujjat boshida "Da’vo bahosi" qatoridan keyin "Davlat boji: ${formatSum(fee.fee)}" qatorini yozing va ilovalarda davlat boji to‘langanligini tasdiqlovchi hujjatni ko‘rsating. Boshqa boj summasini o‘ylab topmang.`;
  if (lang === "ru") return uz.replace("DAVLAT BOJI", "ГОСПОШЛИНА (DAVLAT BOJI)");
  return uz;
}

// "Aliyev Sardor Baxtiyorovich, Toshkent..." -> "S.B. Aliyev"
function signatureName(claimant) {
  const name = String(claimant || "").split(/[,\n;]/)[0].trim();
  const words = name.split(/\s+/).filter(Boolean);
  const parts = words.filter(p => /^\p{Lu}[\p{L}ʻ‘’'-]+$/u.test(p));
  if (parts.length < 2 || parts.length > 4 || parts.length !== words.length) return null;
  const [surname, first, patronymic] = parts;
  const initial = s => s ? ((s.match(/^(?:[OG][‘'’ʻ]|Sh|Ch)/u) || [s[0]])[0]) + "." : "";
  return `${initial(first)}${initial(patronymic)} ${surname}`.replace(/\s+/g, " ").trim();
}

function fixSignature(answer, claimant) {
  const sig = signatureName(claimant);
  if (!sig) return answer;
  const line = `Imzo: ____________ ${sig}`;
  const text = String(answer || "");
  return /^\s*(?:Imzo|Подпись|Signature)\s*:.*$/mi.test(text)
    ? text.replace(/^\s*(?:Imzo|Подпись|Signature)\s*:.*$/mi, line)
    : text.replace(/\s*$/, "\n" + line);
}

// callAI appends service notices (LexUZ status, backup model, court practice,
// accuracy warning). They belong on the page, not inside the court document.
const NOTICE_START = /\n\s*(?=(?:📚|⚠️|ℹ️|⚖️)\s)/u;
function splitNotices(answer) {
  const text = String(answer || "");
  const parts = text.split(NOTICE_START);
  const body = [], notices = [];
  for (const part of parts) {
    const p = part.trim();
    if (!p) continue;
    if (/^(?:📚|⚠️|ℹ️|⚖️)\s/u.test(p) && body.length) notices.push(p); else body.push(part);
  }
  return { body: body.join("\n").replace(/\s+$/, ""), notices };
}

module.exports = { splitNotices, BASES, legalBasisFor, extractAmount, stateFee, stateFeeInstruction, signatureName, fixSignature, formatSum };
