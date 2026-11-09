# QOMUS — LexUZ manba tekshiruvi QA (2026-11-09)

## Chegara
- Faqat `qa/qomus-lexuz-evidence-20261109` branch; `main`, production Render, Neon va foydalanuvchi ma'lumotlariga tegilmadi.
- `server.js` dagi LexUZ matnlarini olish funksiyasi `lexuz-evidence.js` moduliga ajratildi.
- Bu LexUZ rasmiy API ulanishi emas. Faqat rasmiy veb-sahifadan parcha olishni tekshiruvchi best-effort bosqich.

## Xavfsizlik va aniqlik
- HTTPS va faqat `lex.uz`/`www.lex.uz` hosti; redirectdan keyin hujjat ID si dastlabki tasdiqlangan hujjat ID siga mos kelishi shart.
- Boshqa sayt, boshqa hujjat, yuklash qobig'i, HTML ichidagi script, huquqiy mavzuga aloqasi bo'lmagan matn va moddalar mundarijasi dalil deb olinmaydi.
- Modda sarlavhasi mavzuga mos olingan parchada bo'lishi talab etiladi. Sahifada boshqa joyda modda uchrashi yetarli emas.
- `verified:true` faqat rasmiy hujjat sahifasidan mavzuga mos modda parchasi olishga muvaffaq bo'lganini anglatadi; tegishli moddaning to'liq talqini, qonunning amaldagi tahriri, norma kuchi yoki foydalanuvchi ishi uchun to'g'rilikni kafolatlamaydi. `editionVerified:false`.
- Mavjud AI ogohlantirishlari va qo'lda LexUZ havolasini tekshirish talabi saqlanadi.

## Tekshirilganlar
- 13/13 izolyatsiyalangan mantiqiy tekshiruv (sun'iy fetch javoblari bilan, JS bajarish muhitida).
- `lexuz-evidence.js`, `test/lexuz-evidence.test.js` va yangilangan `server.js` JavaScript sintaksisidan o'tdi.
- GitHub'ga mustaqil Node testlar `test/lexuz-evidence.test.js` sifatida saqlandi; `npm run test:lexuz` buyrug'i qo'shildi.

## Tasdiqlanmaganlar va keyingi qabul shartlari
1. Node test runner bilan `npm run test:lexuz` sinovini mahalliy/izolyatsiyalangan QA muhitida bajarish.
2. Rasmiy LexUZ'ga haqiqiy HTTP GET so'rovlari va redirect holatlarini izolyatsiyalangan QA'da sinash; serverning sahifa formatiga mosligini tekshirish.
3. QOMUS AI haqiqiy foydalanuvchi so'rovlariga izoh berayotganda tasdiqlanmagan modda raqamlarini chiqarib yubormasligini alohida testlash.
4. Qonun tahriri, kuchga kirish muddati, modda to'liq matni va o'zgartishlarni aniqlash bo'yicha mustaqil ishonchli jarayon yaratish.
5. Productionga o'tishdan oldin umumiy `node --test` xavfsizlik va regressiya testlari, QA brauzer sinovlari hamda backupdan keyingi integratsiya.

## Buyruqlar
```powershell
cd C:\Users\user
git clone --branch qa/qomus-lexuz-evidence-20261109 https://github.com/Nurzod701701/huquqiy-AI-backend.git qomus-lexuz-qa
cd .\qomus-lexuz-qa
npm.cmd install --no-package-lock --no-audit --no-fund
npm.cmd run test:lexuz
```
