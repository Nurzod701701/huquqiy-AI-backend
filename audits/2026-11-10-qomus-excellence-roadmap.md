# QOMUS — yuqori sifatga olib chiqish dasturi (2026-11-10)

> Status: reja va qabul mezonlari. Bu ro'yxatdagi bandlar bajarilgan deb hisoblanmaydi; har biri dalil, avtomatik test va production smoke bilan yopiladi.
> Ishlash prinsipi: Fuqarolar bo'limi funksiyalari va joriy dizayn saqlanadi; SUD alohida top-level bo'lim sifatida qo'shilmaydi. `main`, Render production, Neon foydalanuvchi ma'lumotlari tekshirilmagan o'zgarishlardan himoyalanadi.

## P0 — taqdimotdan oldin (bloklovchi)
| Modullar | Qabul mezonlari | Hozirgi dalil / xavf |
|---|---|---|
| Login, email verifikatsiya, parol tiklash | Synthetic QA account: register → email code → login → logout → reset → login; rate limiting; boshqa user yozuvini ko'rmaslik | GitHub isolated auth/security CI PASS, real Resend delivery va production sessiya E2E tasdiqlanmagan |
| AI yordamchi | 10 ta anonim huquqiy kazus × UZ/RU/EN; manba, norma sanasi, noto'g'ri modda rad etish, 429/402 holati, maxfiy ma'lumotni maskalash, foydalanuvchi roziligi | OpenRouter provider jonli javoblar tasdiqlanmagan |
| Aliment | 1, 2, 3+ farzand, minimal chegara, nol/yaroqsiz daromad, o'zgaruvchan daromad, kelishuv; 2026 stavka va normaning rasmiy asosini tekshirish | Izolyatsiyalangan 1/3 farzand JS smoke PASS, 2 farzand va huquqiy audit qolgan |
| Pensiya va nafaqa | Barcha to'lov turlari bo'yicha yosh/staj, imtiyoz, to'liqsiz staj, qo'llanadigan limitlar; mutaxassis tasdiqlamagan summa chiqmasin | Reset UI fix QA'da, barcha formulalar ekspertizasi qolgan |
| Hujjatlar/da'vo | 10 namunadan foydalanuvchi faktlariga mos tahrirlanuvchi matn, DOCX/PDF, bo'sh rekvizit rad etilsin; huquqiy asosni asossiz to'ldirmaslik | HTTP DOCX ZIP smoke PASS; browser PDF va to'liq 10 shablon E2E qolgan |
| Neon/ma'lumot xavfsizligi | 2 synthetic user, CRUD, resync, restart, backup/restore, tenant isolation, audit no PII | Isolated Neon CI mavjud; production backup va haqiqiy dual-user test tasdiqlanmagan |

## P1 — ishonchlilik va professional kuch
| Modul | Qabul mezonlari |
|---|---|
| Advokat ishlar/kalendar | yaratish/tahrirlash/o'chirish, moslashgan sana/muddat, import/export, login/restart, qo'shni user ma'lumotiga kirishni rad etish |
| Hujjat ekspertizasi | PDF/DOCX o'qish, scan PDF uchun aniq cheklov, tekshiruv izi, LexUZ norma/vaqt, rozilik bilan AI, noto'g'ri xulosa yo'q |
| Sud amaliyoti | rasmiy ommaviy qaror metadata; manba link; bo'sh portaldan yolg'on natija chiqarmaslik; rasmiy API bo'lmasa qo'lda manba solishtirish |
| Oila, mehnat, biznes | har bir mashhur ish ssenariysi uchun kamida 5 fixture; hujjat tayyorlash va yo'naltirish |
| Tillar | UZ/RU/EN saytdagi bo'lim, xato, forma, mobil nav va eksportda izchil |
| Mobil/accessibility | Android/iPhone viewport, ekran klaviaturasi, fokus, xabarlar, 200% zoom, a11y tekshiruvi |
| Tezlik/observability | p95 javob va sahifa yuklash ko'rsatkichlari, error logs, xizmatlar metrikasi, tashqi AI uchun timeout va fallback |

## P2 — mustahkam platforma
- Qoida va tariflar uchun versiyalangan rasmiy manba registri; norma o'zgarsa kalkulyator qayta audit qilinadi.
- Security: CSP'ga o'tish uchun inline-script migratsiya, secrets rotatsiya, CSRF/session, uploads, dependency audit, zaxira va tiklash mashqi.
- Admin: anonymized audit, email alert, servis diagnostikasi, test-status dashboard, ruxsatlar.
- AI quality: qonun manbasiz javob bermaslik siyosati, structured citations va red-team kazuslar.

## Release darvozasi
1. `main`dan QA branch va o'zgarish diffi; production DB va disk backup tekshirilsin.
2. Syntax/unit/security/functional/isolated HTTP testlar yashil.
3. Real UI E2E + dual-user Neon + Resend deliverability + OpenRouter real provider xulosasi.
4. Huquqiy ekspert kalkulyator natijasi va norma amal qilish sanasini tasdiqlaydi.
5. Render deploy oldidan rollback commit/release yoziladi; deploy keyin domen, login, AI, kalkulyator, eksport smoke; xato bo'lsa rollback.
6. Bajarilgan bandga test URL, sana, commit SHA va muallif/ekspert tasdig'i qo'shilsin.

## Tekshirilgan qisman natijalar
- PR #60: pensiya reset UI, advokat adresat rekviziti, hujjat eksport tekshiruvi, sud portaliga xavfsiz fallback.
- GitHub CI: 23 ta HTTP route ochilishi, DOCX javobi va ba'zi aliment sintetik ssenariylar.
- To'liq production E2E yoki barcha xizmatlar 100% tasdiqlangan deb yozilmaydi.
