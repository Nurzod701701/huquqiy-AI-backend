# VERIUS — deploy va ortga qaytarish (2026-11-18 reliz)

Reliz: PR #89 (`fix/security-audit-2026-11` → `main`) — xavfsizlik auditi, da'vo hujjatlari, xavfsiz fayl yuklash,
bosh sahifadagi foydalanuvchi, F-1…F-6, 4 bosqichli parol tiklash.
Ishlab chiqarish: https://verius.uz (Cloudflare → Render), baza: Neon PostgreSQL.

## Qaytish nuqtasi
- Git teg: **`rollback/pre-2026-11-18`** → `578dc1d` (reliz oldidagi `main`).
- Render: oldingi muvaffaqiyatli deploy (Dashboard → Deploys ro'yxatida).
- Neon: point-in-time restore yoki reliz oldidan olingan branch/snapshot.

## 1. Deploy'dan OLDIN (majburiy)
1. **Render → Environment:**
   - `TRUST_CF_CONNECTING_IP=yes` — **majburiy.** Sayt Cloudflare ortida; busiz barcha foydalanuvchilar limit uchun bir nechta Cloudflare IP'siga birlashadi va AI/yuklash limiti (10 daqiqada 8 / 12 ta) hamma uchun tez tugaydi.
   - Ixtiyoriy: `PRIVACY_CONTACT_EMAIL`, `AI_RATE_PER_CLIENT` (standart 8), `AI_RATE_GLOBAL` (standart 80).
   - Node versiyasi ≥ 20 (`package.json` → `engines`).
2. **Neon:** Console → Branches → `main` dan yangi branch (masalan `pre-release-2026-11-18`) yarating — bu bazaning bir lahzalik nusxasi. Yoki point-in-time restore saqlash muddati yetarli ekanini tekshiring.
3. Render'da **Auto-Deploy** holatini tekshiring (Settings → Build & Deploy). O'chiq bo'lsa, merge'dan keyin "Manual Deploy → Deploy latest commit".

## 2. Deploy
1. PR #89 ni **"Create a merge commit"** usuli bilan merge qiling (squash emas — ortga qaytarish uchun bitta merge commit kerak).
2. Render build loglarida `npm install` yangi paketlarni (`pdfjs-dist`, `jszip`, `nodemailer@10`) o'rnatganini va server ishga tushganini kuzating.

## 3. Deploy'dan KEYIN tekshiruv
```bash
node scripts/post-deploy-smoke.js https://verius.uz
```
Faqat GET so'rovlar; hammasi `PASS` bo'lishi kerak. So'ng qo'lda (5 daqiqa):
- ro'yxatdan o'tish → email kodi → bosh sahifada ism ko'rinadi;
- "Parolni unutdingizmi?" → 4 bosqich → yangi parol bilan kirish;
- da'vo arizasi: dalil faylini yuklash va "dalillarga qo'shish" tugmasi;
- AI chat bitta savol; admin panelga kirish.

Mavjud foydalanuvchilar chiqib ketmaydi: eski sessiyalar birinchi so'rovda xeshga ko'chiriladi.

## 4. Ortga qaytarish (muammo bo'lsa)
**A. Eng tez (1–2 daqiqa): Render rollback.** Dashboard → Deploys → reliz oldidagi deploy → **Rollback**. Kod darhol eski holatga qaytadi.
Keyin `main` ni ham qaytaring (aks holda keyingi auto-deploy yangi kodni qayta chiqaradi):
```bash
git switch main
git pull
git revert -m 1 <PR #89 merge commit SHA>
git push origin main
```
**B. Faqat git orqali:** yuqoridagi `git revert -m 1 ...` + push; Render auto-deploy eski kodni chiqaradi.

**Ma'lumotlar mosligi (eski kodga qaytilganda):**
- Sessiyalar: yangi kod tokenlarni xesh sifatida saqlaydi; eski kod ularni tanimaydi → **foydalanuvchilar bir marta qayta kirishi kerak**. Ma'lumot yo'qolmaydi.
- Yangi kod qo'shgan maydonlar (`resetTokenHash`, `resetSendLog`, `verificationSendLog`, `resetAttempts`, rozilik versiyasi) eski kod tomonidan e'tiborsiz qoldiriladi.
- Parol xeshlari formati o'zgarmagan (scrypt) — parollar ishlayveradi.
- Bazani tiklash (Neon restore) **faqat** ma'lumot buzilgani aniqlansa kerak; aks holda reliz davomida kiritilgan yangi ma'lumotlar yo'qoladi.

## 5. Qaytish nuqtasini yangilash
Reliz barqaror ishlagach (1–2 kun), keyingi reliz uchun yangi teg qo'ying:
```bash
git tag rollback/pre-<sana> <main SHA>
git push origin rollback/pre-<sana>
```
