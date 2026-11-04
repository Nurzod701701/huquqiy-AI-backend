# QOMUS — sud amaliyoti asosida javob berish (V1)

## Nima ishlaydi
- Mavjud `callAI()` savol-javob tizimiga sud qarorlarining **tekshirilgan matnlari** asosida retrieval ulandi.
- Savolga o'xshash faktlar va sudning huquqiy asoslantirishi qidiriladi; modelga ko'pi bilan 3 ta qaror bo'lagi beriladi.
- Har bir iqtibosda sud nomi, ish raqami, sana va rasmiy havola bo'lishi shart.
- Hech bir ishonchli qaror bo'lmasa, QOMUS sud amaliyoti haqida hukm to'qimasligi uchun maxsus ko'rsatma va ochiq ogohlantirish qo'shadi.

## Muhim cheklov
Boshlang'ich `data/court-decisions-reviewed.json` ataylab **bo'sh**: real qaror matnlari hali ommaviy tartibda olinmagan va ekspert tomonidan tekshirilmagan. Demak, jonli savollarda hozircha qonunchilik asosidagi javob va sud amaliyoti mavjud emasligi haqida ogohlantirish chiqadi. `public-judgments.js` HTML jadval metadata sini olishi sudning huquqiy asosini o'qib chiqish bilan teng emas.

## Tasdiqlangan qarorni qo'shish
`items` massiviga faqat ochiq e'lon qilingan, shaxssizlantirilgan, huquqiy asoslantirishi tekshirilgan qarorlar kiritilsin. Yozuv shabloni (quyidagilar namunaviy qiymatlar, haqiqiy ish emas):
```json
{
  "caseNumber": "RASMIY-ISH-RAQAMI",
  "court": "Sudning rasmiy nomi",
  "decisionDate": "2025-01-01",
  "sourceUrl": "https://public.sud.uz/rasmiy-hujjat-havolasi",
  "facts": "Qarorda aniqlangan muhim faktlar, kamida 50 belgi; shaxssizlantirilgan.",
  "legalReasoning": "Sud tomonidan keltirilgan huquqiy asos, qo'llangan normalar va asosiy xulosalarning tekshirilgan matni, kamida 100 belgi.",
  "outcome": "Sudning haqiqiy rezolyutiv xulosasi",
  "legalNorms": "Hujjatda qayd etilgan huquqiy normalar",
  "reviewStatus": "approved"
}
```
`approved` faqat manba va matn inson tomonidan tekshirilganidan keyin qo'yiladi. Maxfiy, shaxsiy yoki ochiq e'lon qilinmagan hujjatlarni kiritmang.

## Kelgusi bosqichlar
1. Rasmiy saytdagi foydalanish shartlarini tekshirish, ochiq PDF/HTML hujjatlarni texnik tekshirish.
2. Shaxssizlantirish, PDF matnini ajratish, sud huquqiy asosini faktlar va rezolyutsiyadan ajratish.
3. Ekspert tasdig'idan so'ng xavfsiz indeksga joylash; faqat metadata emas, tasdiqlangan matn ishlatiladi.
4. Semantik embedding qidiruvi, norma sanasi va instansiya ustuvorligini baholash, xato manbalarni aniqlash va sifat auditi.
5. Huquqiy savolga dastlabki javob, analogik qarorlar, o'xshash/farqli faktlar, xatarlar va rasmiy manbalarni ko'rsatish.

## Sinov
`node --test test/court-practice-reasoning.test.js`.
`node --check server.js`.
