# VERIUS — to'liq audit va xolis baho (2026-11-18)

Holat: `fix/security-audit-2026-11` (PR #89, main bilan birlashtirilgan). Kod o'zgartirilmagan.
Usul: kodni o'qish, lokal serverda sahifalarni ochib skriptlarni kompilyatsiya qilish, o'lchovlar, CI natijalari.

## 0. Qisqa xulosa
Loyiha funksional jihatdan boy (97 ta marshrut, fuqarolar + Advokat PRO + AI + hujjatlar) va so'nggi ikki auditdan keyin
xavfsizlik darajasi ancha oshgan. Asosiy xavflar endi **arxitektura** (16 000 qatorli bitta `server.js`, butun baza bitta JSON),
**huquqiy muvofiqlik** (maxfiylik siyosati sahifasi yo'q, shaxsiy ma'lumot chet elda) va **sifat nazorati**
(testlarning yarmi manba kodni regex bilan tekshiradi, CI to'liq testlarni ishga tushirmaydi).

## Tuzatish holati (F-1 … F-6)

| # | Holat | Nima qilindi |
|---|---|---|
| F-1 | ✅ | `'\n'` → `'\\n'`; yangi `test/page-scripts-compile.test.js` serverni ishga tushirib, 44 ta ochiq sahifa (3 tilda) va 11 ta kabinet sahifasidagi **har bir inline skriptni kompilyatsiya qiladi** — bunday xato endi CI'da ushlanadi |
| F-2 | ✅ | `legal-pages.js`: `/privacy` va `/terms` (uz/ru/en), kod haqiqatda nima qilishiga asoslangan matn; ro'yxatdan o'tishda havolalar; rozilik versiyasi `2026-11-18-v1`; footer'larda havolalar; `PRIVACY_CONTACT_EMAIL` ixtiyoriy. **Matnni yurist ko'rib chiqishi shart** |
| F-3 | ✅ | Admin login sahifasidan owner emaili, Render xizmat ID'li havola olib tashlandi; `/login` owner emailiga oddiy xato beradi (yo'naltirmaydi), `/register` "OWNER akkaunti" demaydi |
| F-4 | ✅ | `.github/workflows/verius-full-test-suite.yml` — har PR va `main` push'da `npm ci`, `npm audit --audit-level=high`, **barcha testlar** (`npm test`). Eski branch-trigger'lar tozalanmadi (zararsiz, alohida ish) |
| F-5 | ✅ qisman | Baza bo'shligida har javobga "sud qarori yo'q" xabari qo'shilmaydi (model baribir uydirmaslik haqida ko'rsatma oladi); sud amaliyoti sahifasida "baza to'ldirilmoqda" banneri. **Bazani to'ldirish — tekshirilgan sud qarorlarini yurist kiritishi kerak** |
| F-6 | ✅ | brotli/gzip: `/court` 171 KB → 22 KB (−87%), `/claim` 102 → 22 KB; tema CSS kontent-xeshli faylga chiqarildi (`immutable`, 1 yil kesh); `robots.txt` (`/account`, `/admin` yopiq) |

Tekshiruv: `npm test` — 273 o'tdi, 0 xato, 2 skip (ikki marta); `npm audit` — 0.

## 1. Darhol tuzatish kerak (yangi topilmalar)

| # | Daraja | Muammo | Dalil |
|---|---|---|---|
| F-1 | **Yuqori (funksional)** | Da'vo sahifasidagi **dalil yuklash umuman ishlamaydi**. `server.js:8520` da `'\n\n'` backtick template ichida — brauzerga haqiqiy qator ko'chishi bo'lib boradi, butun skript `SyntaxError` bilan yiqiladi | `/claim` dagi 6 ta inline skriptdan 1 tasi kompilyatsiya bo'lmaydi; `025d971` dan beri |
| F-2 | **Yuqori (huquqiy)** | Ro'yxatdan o'tishda "Foydalanish shartlari va maxfiylik siyosatini o'qidim" belgisi talab qilinadi, lekin **bunday sahifa yo'q** (havola ham, marshrut ham) | `server.js:13858`; `/privacy`, `/terms` marshrutlari yo'q |
| F-3 | O'rta | Ochiq `/admin/login` sahifasi **owner emailini** `value="..." readonly` bilan ko'rsatadi — maqsadli hujum uchun tayyor login | `server.js:13944` |
| F-4 | O'rta | CI'da **to'liq test to'plamini** ishga tushiradigan workflow yo'q: 21 ta workflow har biri 1–3 ta faylni ishlatadi. PR #89 dagi 3 ta yangi test fayli CI'da umuman ishlamaydi. Ko'p workflow eski feature-branch'larga `push` trigger bilan bog'langan | `.github/workflows/*` |
| F-5 | O'rta | **Sud amaliyoti bazasi bo'sh** (`data/court-decisions-reviewed.json` → `items: []`). Har bir AI javobiga "tekshirilgan sud qarori yo'q" xabari qo'shiladi; "Sud amaliyoti" funksiyasi amalda ishlamaydi | fayl tarkibi |
| F-6 | O'rta | Hech bir sahifa **siqilmaydi** (gzip/brotli yo'q) va hamma narsa `Cache-Control: no-store`. `/court` 178 KB, shundan 70 KB inline CSS — har sahifada qayta yuklanadi | `curl -I` |

## 2. Xavfsizlik va maxfiylik — qolgan ishlar
- **Shaxsiy ma'lumotlarni lokalizatsiya qilish:** O'zbekiston "Shaxsga doir ma'lumotlar to'g'risida"gi qonuni (2021 o'zgartirishlari) fuqarolar ma'lumotini O'zbekistondagi serverlarda saqlashni talab qiladi. Hozir Render + Neon (chet el) — **yurist bilan tekshirish shart**. Gemini'ga yuborish uchun rozilik bor, lekin bu ham transchegaraviy uzatish.
- **Admin uchun 2FA yo'q;** owner paroli env'da ochiq, har kirishda qayta xeshlanadi. TOTP yoki emailga kod qo'shish tavsiya etiladi.
- **IP bo'yicha login limiti standart o'chiq** (`QOMUS_PILOT_AUTH_LIMIT`). Email bo'yicha limit bor, lekin ko'p emaillarni sinab ko'rish (credential stuffing) cheklanmaydi.
- **Foydalanuvchi huquqlari:** akkauntni o'chirish va ma'lumotlarni yuklab olish funksiyasi yo'q; "barcha qurilmalardan chiqish" faqat adminda.
- Parol siyosati: faqat ≥ 8 belgi; sizib chiqqan parollar ro'yxati bilan tekshirilmaydi.
- CSP'da `'unsafe-inline'`; prompt-injection himoyasi evristik (chegaralovchi teglar + ogohlantirish), AI javobi qonun matni bilan avtomatik solishtirilmaydi.
- Limiterlar xotirada: restartda nolga tushadi, bir nechta instansiyada ishlamaydi.
- Ro'yxatdan o'tishda "Bu email ro'yxatdan o'tgan" (409) — emaillarni aniqlash (enumeration) mumkin. Past.

## 3. Arxitektura va kod sifati
- `server.js` — **15 990 qator**: marshrutlar, HTML, CSS, brauzer JS, AI promptlari, biznes mantiq bir faylda. F-1 kabi xatolar aynan shu uslubdan (JS ichidagi template ichidagi JS) kelib chiqadi.
- Butun akkaunt bazasi bitta JSON/JSONB hujjat: har sahifada to'liq o'qiladi, istalgan ikki yozuv to'qnashadi. Foydalanuvchilar ko'paysa birinchi bo'lib shu sinadi.
- `esc()` va shunga o'xshash yordamchilar har bir faylda qayta yozilgan.
- 40 ta muhit o'zgaruvchisi, lekin **README va `.env.example` yo'q** — yangi dasturchi yoki qayta deploy qilish qiyin.
- `/health` faqat `ok:true` qaytaradi — baza, email va Gemini holatini tekshirmaydi.
- Monitoring/xatolarni yig'ish (Sentry va h.k.) yo'q; loglar faqat `console`.
- Zaxira nusxa: shifrlangan va 7 kun saqlanadi (yaxshi), lekin **o'sha Render diskida** — server yo'qolsa, zaxira ham yo'qoladi; tiklash mashqi hujjatlashtirilmagan.
- `robots.txt`, `sitemap.xml`, favicon yo'q; maxsus 404 sahifa yo'q.

## 4. Test va sifat nazorati
- 52 ta test fayli, 265 ta test — yaxshi. Lekin **23 tasi `server.js` manba matnini regex bilan tekshiradi**: kod qayta yozilsa yiqiladi, xato bo'lsa ham o'tib ketishi mumkin. Real HTTP orqali ishlaydigani faqat 6 ta.
- Brauzer testlari yo'q (F-1 shuning uchun aniqlanmagan). Playwright bilan asosiy 10 ta sahifani ochib, konsolda xato yo'qligini tekshiradigan bitta test F-1 ni darhol topgan bo'lardi.
- PostgreSQL integratsiya testlari lokal sharoitda o'tkazib yuboriladi (faqat CI'da).

## 5. Huquqiy aniqlik
- Kodda qattiq yozilgan qiymatlar: BHM 440 000 so'm, MHTEKM 1 360 000, boj stavkalari, Fuqarolik kodeksi moddalari, sud katalogi — **yurist tasdig'i va yangilanish jarayoni yo'q** (kim, qachon, qaysi manbadan).
- LexUZ sahifalari skreyping orqali olinadi — sayt tuzilishi o'zgarsa jim ishlamay qoladi.
- Iqtisodiy/ma'muriy sudlar katalogi yo'q (5 ta hujjat turi yopiq).

## 6. Nimalar qo'shish kerak (ustuvorlik bo'yicha)
1. F-1 tuzatish (`\\n`) + brauzerda konsol xatosini tekshiruvchi smoke test.
2. Maxfiylik siyosati va foydalanish shartlari sahifalari, registratsiyada havola, versiya bilan rozilik (allaqachon `consents` jadvali bor).
3. CI: bitta `npm test` workflow (barcha testlar, har PR'da); eski branch-trigger'larni tozalash.
4. Owner emailini admin login sahifasidan olib tashlash; admin uchun 2FA.
5. README + `.env.example` (40 ta o'zgaruvchi, qaysi biri majburiy).
6. gzip/brotli va statik CSS'ni alohida faylga chiqarib keshlash.
7. `/health` da baza tekshiruvi; xatolarni yig'ish tizimi.
8. Zaxirani boshqa joyga (masalan S3-mos saqlash) ko'chirish va tiklash mashqi.
9. Akkauntni o'chirish / ma'lumotlarni eksport qilish.
10. Sud amaliyoti bazasini to'ldirish yoki funksiyani vaqtincha yashirish.
11. Uzoq muddat: `server.js` ni modullarga bo'lish (marshrutlar, sahifalar, AI), bazani jadvallarga ajratish, inline JS'ni fayllarga chiqarib CSP'dan `'unsafe-inline'` ni olib tashlash.
12. Ma'lumotlar lokalizatsiyasi bo'yicha yuridik xulosa.

## 7. Xolis baho: bizning ishimiz (PR #89)

### Yaxshi tomonlari
- **Taxmin emas, isbot:** har bir jiddiy topilma lokal serverda haqiqiy so'rov bilan tasdiqlandi (Gemini'ga ketgan xabarni ushlash, zip-bomba bilan serverni yiqitish, reset kodini qulflash).
- Eng xavfli muammolar yopildi: bitta so'rov bilan saytni o'chirish (D-1), reset kodini brute-force (#1), foydalanuvchi matnining system rolida bo'lishi (PI-1), sud hujjatidagi ma'lumotlarning yo'qolishi (D-2).
- **Orqaga moslik:** eski sessiyalar xeshga avtomatik ko'chadi, foydalanuvchilar chiqib ketmaydi; eski formalar ishlaydi.
- Main bilan birlashtirishda `await` yo'qligi tufayli **parol tekshiruvi butunlay buzilishi** mumkin bo'lgan xato oldindan topildi va tuzatildi.
- Har bir tuzatish uchun regression test va audit hisobotlari (`audits/`) — keyingi dasturchi nima, nega qilinganini ko'radi.
- `npm audit` 0 zaiflik; eskirgan `pdf-parse` olib tashlandi.

### Kamchiliklari (o'zimizga tanqid)
- **F-1 ni oldinroq topmadik:** birinchi auditda `SyntaxError` ni ko'rib, "asl kodda ham bor" deb qoldirdik, sababini hozir aniqladik. Bu dalil yuklash funksiyasi butunlay ishlamasligini anglatardi.
- **Yangi testlarimiz ham asosan manba-regex** uslubida — mavjud zaif uslubni kuchaytirdik. Va ular **CI'da ishlamaydi**.
- `server.js` ni kichraytirmadik, aksincha yana kod qo'shdik (inline HTML/JS bilan).
- Qisman yechimlar: CSP `'unsafe-inline'`, baza normallashtirilmagan (faqat to'qnashuv aniqlanadi — foydalanuvchi 409 "qayta urinib ko'ring" oladi, yuklama ostida sinalmagan), hujjatdagi ko'rinmas matn aniqlanmaydi.
- Injection himoyasi va PII maskalash **evristik**: aniqlanmagan ibora yoki format o'tib ketadi; qaytariladigan maskalash modelning belgilarni to'g'ri ko'chirishiga bog'liq (yo'qolsa faqat ogohlantirish chiqadi).
- AI limiti (IP uchun 10 daqiqada 8 ta) bitta IP ortidagi ofislar (advokatlik byurosi, NAT) uchun juda qattiq bo'lishi mumkin — real yuklama bilan sozlanmagan.
- Login'dan keyin bosh sahifaga o'tish — bu mahsulot qarori; jamoa bilan kelishilmagan.
- `nodemailer` 6→10 katta versiya yangilanishi haqiqiy SMTP bilan sinalmagan; `pdfjs-dist` 4.10 (Node 20 tufayli) eng yangi 6.x dan orqada.
- Vizual tekshiruv deyarli bo'lmadi (brauzer oynasi chizilmadi): yangi tugmalar va maydonlarning mobil ko'rinishi ko'z bilan tasdiqlanmagan.
- Huquqiy qiymatlarni (BHM, boj, moddalar) tekshirmadik — faqat belgilab qo'ydik.
