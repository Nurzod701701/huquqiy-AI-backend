# VERIUS — da'vo arizasi va hujjat oqimlari auditi (2026-11-13, 2-bosqich)

Qamrov: `/claim`, `/claim-result`, `/claim-download` (DOCX), PDF chop etish, `/claim-evidence-extract`,
`/legal-review-*` yuklash, `claim-helpers.js`, `court-fee-rules.js`, `legal-calculator-rules.js`,
mehnat shartnomalari kutubxonasi, Advokat PRO / jinoyat ishlari sahifalaridagi brauzer kodi, hujjatni akkauntga saqlash.
Branch: `fix/security-audit-2026-11` (1-bosqich tuzatishlaridan keyin). Kod o'zgartirilmagan.

Usul: kodni o'qish + lokal server va soxta Gemini bilan sinov (`/claim-result` ga haqiqiy so'rov, Gemini'ga ketgan
matn va tayyor hujjat solishtirildi) + parserlarga maxsus fayl bilan yuk sinovi.

## Tuzatish holati

| # | Holat | Nima qilindi |
|---|---|---|
| D-1 | ✅ | Yangi `safe-doc-parse.js`: DOCX ichki hajmi ochishdan oldin tekshiriladi (`document.xml` ≤ 6 MB, jami ≤ 25 MB, ≤ 400 fayl); parsing alohida worker'da (256 MB heap, 20 s timeout, bir vaqtda ≤ 2 ta). Sinov: 146 KB bomba → `DOCX_TOO_LARGE_UNCOMPRESSED`, server ishlab turibdi |
| D-2 | ✅ | Da'vo uchun qaytariladigan maskalash: `[MANZIL_1]`, `[TELEFON_1]`; asl qiymatlar AES-256-GCM bilan muhrlanib rozilik tokeniga bog'lanadi, Gemini ularni ko'rmaydi, tayyor hujjatga qaytariladi. Telefon regex'i `so‘m` oldidagi summalar va `№` dan keyingi raqamlarni endi telefon demaydi. Qolgan belgilar bo'lsa ogohlantirish chiqadi |
| D-3 | ✅ | `pdf-parse` (pdf.js 1.10, 2017) olib tashlandi → `pdfjs-dist` 4.10.38, `isEvalSupported:false`, ≤ 60 bet, worker ichida. 20 000 betli PDF: 34,5 s → 0,55 s |
| D-4 | ✅ | "Da’vo bahosi" va "Bojdan ozodmisiz?" maydonlari; boj faqat da'vo bahosi yoki talabdagi summadan (faktlardan emas); hujjatga faqat "boj to'layman" tanlansa yoziladi, aks holda sahifada taxmin sifatida |
| D-5 | ✅ | Iqtisodiy/ma'muriy turlar ro'yxatdan yashirildi; to'g'ridan-to'g'ri havola yoki POST AI roziligidan **oldin** tushunarli xabar bilan rad etiladi |
| D-6 | ✅ | `request-limits.js`: yuklash 12 ta / 10 daq., DOCX eksport 40 ta / 10 daq. (mijoz IP bo'yicha) |
| D-7 | ✅ | `ALIYEV SARDOR` → `S. Aliyev`; xizmat xabarlari faqat matn oxiridan ajratiladi |

Tekshiruv: `node --test` — 191 o'tdi, 0 xato, 2 skip; yangi `test/claim-documents-audit.test.js`;
lokal serverda end-to-end: Gemini'ga manzil/telefon bormadi, hujjatda manzil, telefon, 150 000 000 summa va №123456789 tiklandi,
boj 6 000 000 so'm, iqtisodiy da'vo 400 bilan rad etildi, DOCX bomba yuklangandan keyin server tirik.
Huquqiy qiymatlar (BHM, stavkalar, moddalar) hali yurist tomonidan tasdiqlanishi kerak.

## Topilmalar

### D-1. KRITIK — 146 KB DOCX serverni butunlay to'xtatadi (login shart emas)
`/claim-evidence-extract` (`server.js:8375`) va `/legal-review-preview` / `-result` (`readLegalUpload`, `server.js:8003`).
Limitlar faqat **siqilgan** fayl hajmini tekshiradi (5–8 MB). DOCX — bu ZIP: 146 KB fayl ichida ~50 MB XML bor,
`mammoth` uni to'liq xotiraga yoyadi.

Sinov: lokal server (`--max-old-space-size=512`, Render kichik instansiyasiga yaqin) → bitta so'rov →
`JavaScript heap out of memory`, jarayon `exit 134`, `/health` javob bermaydi. 4 GB heap bilan ham alohida sinovda xotira tugadi.
Bitta anonim so'rov butun saytni (barcha foydalanuvchilar uchun) o'chiradi.

Tuzatish:
- `mammoth` dan oldin JSZip bilan ochib, har bir fayl va jami **ochilgan** hajmni tekshirish (masalan `word/document.xml` ≤ 15 MB, jami ≤ 30 MB, fayllar soni ≤ 200) — oshsa rad etish.
- Parsingni `worker_threads` da `resourceLimits: {maxOldGenerationSizeMb: 256}` va 15–20 s timeout bilan bajarish: worker yiqilsa, server yiqilmaydi.
- Yuklash yo'llariga IP limiti (masalan 10 daqiqada 10 ta).

### D-2. YUQORI — PII maskalash tayyor sud hujjatini buzadi
Rozilikdan keyin `/claim-result` forma **maskalangan** nusxa bilan qayta o'qiladi (`req._aiPreparedBody`), shuning uchun
AI ham, davlat boji hisob-kitobi ham asl ma'lumotni ko'rmaydi. Sinovda tayyor hujjatga quyidagilar tushdi:

| Kiritilgan | Hujjatda |
|---|---|
| `Manzil: Toshkent sh., Chilonzor 5-uy` (da'vogar va javobgar) | `[MANZIL_YASHIRILDI]` |
| `+998 90 123 45 67` | `[TELEFON_YASHIRILDI]` |
| `150000000 so‘m` (qarz summasi) | `[TELEFON_YASHIRILDI] so‘m` |
| `shartnoma №123456789` | `№[TELEFON_YASHIRILDI]` |

Sabablar: telefon regex'i (`ai-privacy.js`) har qanday 9 xonali ketma-ket raqamni telefon deb biladi
(100 000 000 – 999 999 999 so'mlik summalar, hujjat raqamlari); manzil qatorlari to'liq o'chiriladi.
Natija: sudga topshiriladigan arizada taraflar manzili, summa va dalil raqami yo'q; summa yo'qolgani uchun
davlat boji ham hisoblanmaydi (sinovda `DAVLAT BOJI` bloki yuborilmadi). Foydalanuvchi buni sezmasligi mumkin.

Tuzatish:
- Qaytariladigan psevdonimlash: `[TELEFON_1]`, `[MANZIL_2]` kabi noyob belgilar, asl qiymatlar xaritasi serverda (so'rov ichida yoki imzolangan tokenda shifrlangan) saqlanadi va AI javobidan keyin **qaytarib qo'yiladi**.
- Rekvizitlar (sud, taraflar, manzillar, telefon, imzo) bloki AI'siz, to'g'ridan-to'g'ri formadan yig'ilsin; AI faqat "Ishning holatlari", "Huquqiy asos", "Suddan so'raladi" qismlarini yozsin.
- Telefon regex'i: `so‘m`/`sum`/`UZS` oldidan, `№` dan keyin va `+998`/operator kodisiz 9 xonali raqamlarni telefon deb hisoblamasin.
- Davlat boji asl (maskalanmagan) formadan hisoblansin.

### D-3. O'RTA — PDF parsing: CPU yuklamasi va eskirgan pdf.js
- 2 MB, 20 000 betli PDF `pdf-parse` da **34,5 soniya** CPU oldi; bitta so'rovda 5 ta fayl, limit va timeout yo'q, login shart emas.
- `pdf-parse@1.1.4` 2018-yildan beri yangilanmagan, ichida **pdf.js 1.10.100 (2017)**. Keyingi pdf.js versiyalarida ko'plab xavfsizlik
  tuzatishlari bor (masalan CVE-2024-4367 — shrift orqali kod bajarish; matn ajratishda bu yo'l ishlashi tasdiqlanmadi, lekin eski parserga ishonch yo'q).

Tuzatish: `pdf-parse` ga `max` (masalan 50 bet) berish, worker + timeout (D-1 bilan bir xil), `pdfjs-dist` ≥ 4.2.67 ga
`isEvalSupported:false` bilan o'tish.

### D-4. O'RTA — Davlat boji noto'g'ri bazadan hisoblanishi va imtiyoz e'tiborsiz
`claim-helpers.js:77-84`:
- Talabda summa bo'lmasa, **faktlar matnidagi yagona summa** olinadi. Sinov: faktlarda faqat "Oylik maoshim 6 000 000 so‘m" →
  `Da’vo bahosi: 6 000 000`, `Davlat boji: 440 000` deb sud hujjatiga yozish ko'rsatmasi beriladi.
- `exemption: "no"` qattiq yozilgan — da'vogar bojdan ozod bo'lgan holatlar (masalan sog'liqqa zarar bo'yicha da'volar) so'ralmaydi,
  boj baribir hujjatga kiritiladi.

Tuzatish: alohida majburiy raqamli "Da'vo bahosi" maydoni; boj faqat shundan hisoblansin; "Bojdan ozodmisiz?" savoli;
aniq bo'lmasa bojni hujjatga yozmay, sahifada "tekshiring" deb ko'rsatish.

### D-5. O'RTA (funksional) — 20 ta hujjat turidan 5 tasi hech qachon yaratilmaydi
`server.js:8621`: `validCourtRecord` faqat `civil` uchun `true` bo'lishi mumkin. `economic_debt_claim`, `economic_contract_claim`,
`economic_damages_claim`, `administrative_decision_application`, `administrative_inaction_application` formada taklif qilinadi,
foydalanuvchi hammasini to'ldiradi, AI roziligini beradi — keyin "Sudni aniqlash imkoni bo'lmadi" deb rad etiladi.
Tuzatish: katalog tayyor bo'lguncha bu turlarni formadan yashirish yoki birinchi qadamdayoq ogohlantirish.

### D-6. PAST — Yuklash va DOCX eksport yo'llarida limit yo'q
`/claim-evidence-extract`, `/legal-review-preview`, `/claim-download` — login va so'rov limiti yo'q. D-1/D-3 tuzatilgandan keyin ham
IP limiti qo'yish tavsiya etiladi.

### D-7. PAST — Kichik sifat masalalari
- `signatureName("ALIYEV SARDOR")` → `S. ALIYEV` (katta harfli familiya o'zgarmaydi).
- `splitNotices` AI matnidagi `⚠️`/`ℹ️` bilan boshlanuvchi qatorni xizmat xabari deb hujjatdan olib tashlaydi.

## Tekshirildi — muammo topilmadi
- XSS: tayyor hujjat `esc()` bilan chiqariladi; PDF oynasi ekranlangan `innerHTML` dan quriladi; Advokat PRO, jinoyat ishlari, mol-mulk kalkulyatori `innerHTML` larida faqat statik yoki `esc/safe` qilingan qiymat.
- DOCX eksport (`docx` kutubxonasi) matnni `TextRun` sifatida yozadi — formula/makro kiritib bo'lmaydi.
- `/claim?type=` ro'yxat bo'yicha tekshiriladi; hujjat akkauntga saqlanganda `caseId` egasi tekshiriladi; boshqa foydalanuvchi hujjatini ochib bo'lmaydi.
- Mehnat shartnomalari kutubxonasi statik; tahrir faqat brauzerda.
- Prompt injection himoyasi (1-bosqich) da'vo oqimida ishlayapti: barcha foydalanuvchi maydonlari `<case_data>` ichida.

## Huquqiy mazmun (alohida tekshirish kerak)
Kodda qattiq yozilgan qiymatlar: BHM = 440 000 so'm (2026-09-01 dan), MHTEKM = 1 360 000 so'm, mulkiy da'vo boji 4% (kamida 1 BHM),
tadbirkorlar 2%, ajrashish 2/4 BHM, Fuqarolik kodeksi moddalari ro'yxati. Bular bu auditda LexUZ bilan qayta solishtirilmadi —
yurist tomonidan tasdiqlanishi kerak.

## Tuzatish tartibi (tavsiya)
1. D-1 — ochilgan hajm tekshiruvi + worker/timeout (bitta so'rov saytni o'chiradi).
2. D-2 — qaytariladigan psevdonimlash va rekvizitlarni AI'siz yig'ish; telefon regex'ini tuzatish.
3. D-3 — PDF bet limiti, pdfjs-dist ga o'tish.
4. D-4, D-5 — da'vo bahosi maydoni, imtiyoz savoli, ishlamaydigan turlarni yashirish.
5. D-6, D-7.
