# QOMUS — DNS, Resend va ichki xavfsizlik ish rejasi
Sana: 2026-11-06. Holat: ishchi audit/backlog. Bu fayl asosiy saytni o'zgartirmaydi.

## O'zgarmas talablar
- QOMUS asosiy serveri: Render huquqiy-AI-backend (srv-danam8jtqb8s73b8c5mg), branch main. Yangi server ochilmasin.
- Fuqarolar bo'limi dizayni va funksiyalari saqlansin. Advokatlar oqimida ishlansin; alohida SUD top-level modul yaratilmasin.
- Foydalanuvchi bazasi, persistent disk, GitHub main, domen DNS yozuvlari va mavjud secrets ruxsatsiz o'zgartirilmasin.
- Kod o'zgarishlari isolated branch + test + review bilan; prod deploydan avval tasdiq va backup.

## verius.uz / AHOST
- Domen 2026-11-06 kuni ro'yxatga olingan; amal muddati 2027-11-06.
- AHOST DNS menejer skrinshotidagi yozuvlar: A @ -> 216.24.57.1; CNAME www -> huquqiy-ai-backend.onrender.com; TTL 14400.
- AHOST'dagi boshqa MX / mail / ftp / SPF / DKIM / DMARC yozuvlarini o'chirmang.
- Render Custom Domains: verius.uz va www.verius.uz qo'shilgan; www -> root redirect. Ikkalasida Verification Error, certificate Waiting for Verification (2026-11-06 skrinshot).
- DNSChecker foydalanuvchi tekshiruvida A va NS uchun barcha belgilarda X. Bu nameserver delegatsiyasi yoki DNS tarqalishiga bog'liq bo'lishi mumkin; yakuniy tashxis emas.
- AHOST yordam murojaati #092046, 2026-11-06. Rashid javobi: DNS tarqalish 2–72 soat, ko'pincha <=24 soat; kutishni so'rashgan. DNS delegatsiyasi haqiqatan to'g'riligini javobda mustaqil tasdiqlashmagan.
- Keyingi: 2026-11-07 DNS A, NS, www CNAME, authoritative delegatsiya va DNSSEC ni qayta tekshirish; Render verify + HTTPS. 2026-11-09 ham ishlamasa, #092046 ticketga dalillar bilan yana yozish.
- DNS ishlamas ekan, o'zgartirishlarni takrorlash, mavjud yozuvlarni o'chirish yoki certificate Verified deb xabar berish mumkin emas.

## Resend (2026-11-06 bevosita plugin audit)
- Resend bog'langan. Bitta domen: qomus.uz, verification status FAILED. DKIM TXT resend._domainkey = failed; SPF CNAME rsend/send = failed.
- Ikkita API key nomi Huquqiy-AI (faqat metadata tekshirildi; secrets olinmadi).
- list_emails: No emails found. API POST /emails uchta HTTP 403: 2026-10-22 (2), 2026-10-28 (1).
- QOMUS kodida security-alerts.js: SECURITY_ALERT_EMAIL + EMAIL_FROM + RESEND_API_KEY bo'lsa Resendga outbound alerts; event categories AUTH_RATE_LIMIT, CROSS_SITE_POST, INVALID_ORIGIN. Ammo prod env va haqiqiy delivery tekshirilmagan.
- Keyingi: verius.uz DNS hal bo'lgach Resend'da verius.uz ni yuboruvchi domen sifatida qo'shish (oldingi qomus.uz ni o'chirmasdan); DKIM/SPF DNS qo'shish va verify; security@verius.uz -> foydalanuvchi oldin belgilagan emailiga nazoratli test xat. Secrets chatga/logga yozilmasin.
- Keyin kalitlarning scope va ishlatilishini tekshirish, aktiv kalitni uzmasdan rotatsiya rejasi.

## GitHub/Render tekshiruv dalillari
- Prod main deployment 2026-11-05: commit b69384452cb5ed3325f078b5c452ba04861f9cca, PR #40 'Security: safe rollout of browser guards, incident logging and AI redaction', Render status live.
- Kod: security-hardening.js, security-alerts.js, ai-privacy.js, server.js; test/security-hardening.test.js (5 unit test).
- Headers: nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, HTTPS bo'lganda HSTS. CSP yo'q (inline scripts).
- CSRF: ayrim account/admin POST cross-site check; to'liq CSRF route coverage hali tekshirilmagan.
- Rate limiter: QOMUS_PILOT_AUTH_LIMIT=enabled flagga bog'liq, memory Map + socket.remoteAddress. Proxy sabab umumiy IP va multi-instance nuqsoni ehtimoli; default enabled emas.
- AI privacy: ba'zi JSHSHIR/pasport/email/telefon naqshlari redact. Ism/manzil va barcha formatlar kafolatlanmagan.
- Account: scrypt password, session token 32 random bytes, HttpOnly/SameSite=Lax; Secure cookie NODE_ENV=production ga bog'liq. SESSION TTL 7 kun.
- account storage: ACCOUNT_DATA_FILE env /var/data ga sozlanmagan bo'lsa project cwd yoki /tmp ga tushishi mumkin. Render persistent disk /var/data mavjud, ammo env'dagi haqiqiy storage path/backup va restore tekshirilmagan.
- Hujjat yuklash: Busboy pdf/docx, ayrim endpointlarda txt; 8MB va 5MB chegaralari; MIME/content/file processing va resource exhaustion xavflarini chuqurroq ko'rish kerak.
- Admin role enforcement, individual owner authorization, secrets exposure, logging PII, brute force va password reset enumeration, transport, CSP, security-alert delivery, backup restore, dependency audits bo'yicha qolgan sinovlar zarur.

## Prioritet va tugallash mezoni
P0 1. Prod ma'lumotlarini xavfsiz backup + alohida restore sinovi; saqlash joyi va ruxsatlarini tekshirish. Main'ga bevosita yozmaslik.
P0 2. Auth/role/API huquqlarini o'qish rejimida audit; xususan admin/user route, session cookie, tenant/record ownership.
P1 3. Proxyga mos rate limiting va CSRF testlarini isolated branchda yaxshilash, login/regression test; prod switchga alohida approval.
P1 4. Resend xavfsizlik xati real yetkazilishini DNS verified bo'lgandan keyin tasdiqlash; failure monitoring.
P1 5. AI data minimization va file upload validation; maxfiy ma'lumotlar tashqi provayderga chiqishini sinash.
P2 6. CSP report-only -> nonce rollout, dependency scan, log redaction, system alerts.
P2 7. verius.uz DNS/SSL domain verification; 2026-11-07 va zarur bo'lsa 2026-11-09 qayta tekshirish.

## Holat qoidasi
- 'Code integrated' != 'production protection proven'.
- 'DNS saved' != 'internet verified'.
- 'Resend connected' != 'sending verified'.
- Productiondagi o'zgarish va haqiqiy email yuborishdan avval konfiguratsiya va xavfsiz test rejasini tasdiqlash.
