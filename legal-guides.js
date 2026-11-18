"use strict";
// Practical legal guides injected into the Family (/family) and Labour
// (/employment) pages. Every number and article below was checked against the
// official LexUZ texts on 2026-11-18:
//   Oila kodeksi  https://lex.uz/docs/-104720   (art. 27, 28, 38–40, 42, 99, 131, 136, 138, 139)
//   Mehnat kodeksi https://lex.uz/docs/-6257288 (art. 130, 160, 161, 165, 182, 217, 253, 254, 333, 560)
// Content is Uzbek-only for now; other languages keep the existing page.
const OK = "https://lex.uz/docs/-104720";
const MK = "https://lex.uz/docs/-6257288";

const GUIDES = {
  "/family": {
    kicker: "AMALIY QO‘LLANMA",
    title: "Oila huquqi: eng ko‘p uchraydigan vaziyatlar",
    lead: "Har bir vaziyat uchun — nima qilish kerak, qaysi hujjatlar kerak va qonunning qaysi moddasi amal qiladi. Savolingiz qolsa, VERIUS AI bilan shu yerdan suhbatni boshlang.",
    facts: [
      ["1/4 · 1/3 · 1/2", "Aliment miqdori: bir bola — daromadning to‘rtdan biri, ikki bola — uchdan biri, uch va undan ortiq — yarmi", "Oila kodeksi, 99-modda"],
      ["26,5%", "Har bir bola uchun aliment mehnatga haq to‘lash eng kam miqdorining 26,5 foizidan kam bo‘lmaydi", "Oila kodeksi, 99-modda"],
      ["6 oygacha", "Sud er-xotinga yarashish uchun ishni olti oygacha keyinga qoldirishi mumkin", "Oila kodeksi, 40-modda"],
      ["Teng ulush", "Umumiy mol-mulk bo‘linganda, nikoh shartnomasida boshqacha bo‘lmasa, ulushlar teng", "Oila kodeksi, 28-modda"]
    ],
    items: [
      {
        icon: "⚖", title: "Nikohdan ajratish",
        short: "Voyaga yetmagan farzand bo‘lmasa va ikkalangiz rozi bo‘lsangiz — FHDYo organida. Boshqa hollarda — sud orqali.",
        steps: [
          "Farzandlar yoshi va ikkala tarafning roziligini aniqlang: shunga qarab FHDYo yoki sud tanlanadi.",
          "Sud tartibida — da’vo arizasi tayyorlanadi; bola yashash joyi, aliment va mol-mulk talablarini ham bir arizada qo‘yish mumkin.",
          "Sud yarashish uchun olti oygacha muddat berishi mumkin.",
          "Xotin homiladorligi davrida va bola tug‘ilganidan keyin bir yil davomida er xotinning roziligisiz ajrashish ishini qo‘zg‘ata olmaydi."
        ],
        docs: ["Nikoh haqidagi guvohnoma", "Farzandlarning tug‘ilganlik haqidagi guvohnomalari", "Pasport nusxalari", "Davlat boji to‘langani haqida kvitansiya (sud tartibida)"],
        law: [["38-modda — Nikohdan ajratish tartibi", OK], ["39-modda — Erning talab qo‘yishini man etadigan hollar", OK], ["40-modda — Nikohdan sud tartibida ajratish", OK], ["42-modda — FHDYo organlarida o‘zaro rozilik bilan ajratish", OK]],
        ask: "Nikohdan ajratish uchun mening vaziyatimda qaysi tartib qo‘llanadi va qanday hujjatlar kerak?",
        actions: [["Da’vo arizasi tayyorlash", "/claim"], ["Savolnoma orqali tahlil", "/questionnaire"]]
      },
      {
        icon: "₿", title: "Aliment undirish",
        short: "Kelishuv bo‘lmasa, sud daromadning 1/4 (bir bola), 1/3 (ikki bola) yoki 1/2 (uch va undan ortiq) qismini undiradi.",
        steps: [
          "Avval ixtiyoriy kelishuvni ko‘rib chiqing — aliment to‘lash haqidagi kelishuv yozma tuziladi va notarial tasdiqlanishi shart.",
          "Nizo bo‘lmasa, sudga buyruq tartibida soddalashtirilgan ariza berish mumkin.",
          "Aliment olish huquqi paydo bo‘lgach, qancha vaqt o‘tganidan qat’i nazar, istalgan vaqtda sudga murojaat qilish mumkin.",
          "Sud taraflarning moddiy va oilaviy ahvoliga qarab miqdorni kamaytirishi yoki ko‘paytirishi mumkin."
        ],
        docs: ["Farzandlarning tug‘ilganlik haqidagi guvohnomalari", "Nikoh yoki ajralish haqidagi guvohnoma", "Javobgarning ish joyi va daromadi haqida ma’lumot (bo‘lsa)", "Bola siz bilan yashashini tasdiqlovchi ma’lumotnoma"],
        law: [["99-modda — Voyaga yetmagan bolalarga aliment miqdori", OK], ["131-modda — Aliment kelishuvining shakli", OK], ["136-modda — Alimentni sud tartibida undirish", OK]],
        ask: "Ikki farzandim uchun aliment undirmoqchiman. Qancha undiriladi va qanday ariza beriladi?",
        actions: [["Aliment kalkulyatori", "/calculators"], ["Aliment miqdorini o‘zgartirish arizasi", "/claim?type=alimony_change_claim"]]
      },
      {
        icon: "⌂", title: "Er-xotinning mol-mulkini bo‘lish",
        short: "Nikoh davomida orttirilgan mulk umumiy hisoblanadi; bo‘lishda ulushlar, odatda, teng.",
        steps: [
          "Mol-mulkni kelishuv asosida bo‘lish mumkin; xohishga ko‘ra kelishuv notarial tasdiqlanadi.",
          "Nizo bo‘lsa, ulushlarni sud aniqlaydi — nikohda bo‘lgan davrda ham, ajrashgandan keyin ham.",
          "Sud voyaga yetmagan bolalar manfaatini yoki tarafning uzrsiz daromad olmaganini, mulkni oila zarariga sarflaganini hisobga olib, teng ulushdan chekinishi mumkin.",
          "Har bir obyektning qiymati va qachon, kimning mablag‘iga olinganini hujjatlar bilan tayyorlang."
        ],
        docs: ["Mulkka egalik hujjatlari (kadastr, avtomobil texpasporti)", "Sotib olish shartnomalari va to‘lov hujjatlari", "Mulk qiymati bo‘yicha baholash (bo‘lsa)", "Nikoh shartnomasi (tuzilgan bo‘lsa)"],
        law: [["27-modda — Umumiy mol-mulkni bo‘lish", OK], ["28-modda — Bo‘lishda ulushlarni aniqlash", OK]],
        ask: "Nikoh davomida olingan uy va mashinani qanday bo‘lish mumkin? Mening ulushim qancha bo‘ladi?",
        actions: [["Mol-mulk ulushi kalkulyatori", "/calculators"], ["Da’vo arizasi tayyorlash", "/claim"]]
      },
      {
        icon: "⚠", title: "Aliment to‘lanmayapti — qarzni undirish",
        short: "Aliment qarzi avval ish haqi va daromaddan, yetmasa bank hisobvaraqlaridan, so‘ng mol-mulkdan undiriladi.",
        steps: [
          "Ijro hujjati (sud qarori yoki buyrug‘i) bilan majburiy ijro organiga murojaat qiling.",
          "Qarz miqdori hisob-kitobini so‘rang va tekshiring.",
          "To‘lovchi ishdan bo‘shasa yoki yangi ish, o‘qish, yashash joyi ma’lum bo‘lsa, aliment ushlab qolayotgan ish beruvchi bu haqda xabar berishi shart."
        ],
        docs: ["Sud qarori yoki sud buyrug‘i", "Ijro varaqasi", "To‘lovlar tarixi (bo‘lsa)"],
        law: [["138-modda — Ish va yashash joyi o‘zgarganligi haqida xabar qilish", OK], ["139-modda — Aliment qarzini undirish", OK]],
        ask: "Sobiq turmush o‘rtog‘im aliment to‘lamayapti. Qarzni qanday undirsam bo‘ladi?",
        actions: [["AI bilan maslahat", "/ai"]]
      }
    ]
  },
  "/employment": {
    kicker: "AMALIY QO‘LLANMA",
    title: "Mehnat huquqi: xodim nimani bilishi kerak",
    lead: "Ishga kirish, ishdan ketish, ish haqi va ta’til — eng ko‘p uchraydigan savollar bo‘yicha qadamlar, muddatlar va Mehnat kodeksining moddalari.",
    facts: [
      ["14 kun", "O‘z xohishingiz bilan ketish — ish beruvchini 14 kalendar kun oldin yozma ogohlantirasiz", "Mehnat kodeksi, 160-modda"],
      ["3 oy", "Dastlabki sinov muddati uch oydan oshmaydi (rahbarlar, bosh buxgalterlar uchun — olti oy)", "Mehnat kodeksi, 130-modda"],
      ["40 soat", "Ish vaqtining normal davomiyligi haftasiga 40 soatdan ortiq bo‘lishi mumkin emas", "Mehnat kodeksi, 182-modda"],
      ["21 kun", "Har yilgi asosiy eng kam mehnat ta’tili — 21 kalendar kun", "Mehnat kodeksi, 217-modda"]
    ],
    items: [
      {
        icon: "✎", title: "O‘z xohishim bilan ishdan ketish",
        short: "Ish beruvchini 14 kalendar kun oldin yozma ogohlantirasiz; oxirgi kuni barcha hisob-kitob to‘lanadi.",
        steps: [
          "Ariza yozing va qabul qilingani haqida belgi (sana, imzo) qo‘ydiring yoki pochta orqali yuboring.",
          "Ogohlantirish muddati — 14 kalendar kun; ayrim toifalar (rahbarlar, mavsumiy va vaqtinchalik xodimlar) uchun boshqa muddatlar bor.",
          "Mehnat shartnomasi bekor qilingan kuni barcha summalar to‘lanishi kerak.",
          "O‘sha kuni ishlamagan bo‘lsangiz — hisob-kitob talab qilganingizdan keyin uch kundan kechiktirmay to‘lanadi."
        ],
        docs: ["Ishdan bo‘shash haqida ariza (nusxasi o‘zingizda)", "Mehnat shartnomasi", "Ish haqi to‘lovlari haqida ma’lumot"],
        law: [["160-modda — Xodimning tashabbusiga ko‘ra bekor qilish", MK], ["254-modda — Hisob-kitob qilish muddatlari", MK]],
        ask: "O‘z xohishim bilan ishdan ketmoqchiman. Arizani qanday yozaman va hisob-kitob qachon to‘lanadi?",
        actions: [["AI bilan maslahat", "/ai"]]
      },
      {
        icon: "₿", title: "Ish haqi kechiktirilyapti",
        short: "Ish haqi har yarim oyda kamida bir marta to‘lanadi; kechiktirilgan har bir kun uchun ish beruvchi kompensatsiya to‘laydi.",
        steps: [
          "Mehnat shartnomasi yoki ichki hujjatda belgilangan to‘lov kunlarini aniqlang.",
          "Ish beruvchiga yozma talab yuboring (nusxasini saqlang).",
          "Kechiktirilgan har bir kun uchun Markaziy bank qayta moliyalash stavkasidan kelib chiqqan pulli kompensatsiya talab qilish mumkin.",
          "Hal bo‘lmasa — mehnat nizolari komissiyasi yoki sudga murojaat qiling (umumiy muddat — huquq buzilganini bilgan kundan olti oy)."
        ],
        docs: ["Mehnat shartnomasi", "Ish haqi hisob varaqalari yoki bank ko‘chirmalari", "Ish beruvchiga yuborilgan talab nusxasi"],
        law: [["253-modda — Ish haqini to‘lash muddatlari", MK], ["333-modda — Kechiktirganlik uchun ish beruvchining moddiy javobgarligi", MK], ["560-modda — Sudga murojaat qilish muddatlari", MK]],
        ask: "Ish haqim 2 oydan beri berilmayapti. Kompensatsiya bilan qanday undiraman?",
        actions: [["Ish haqi bo‘yicha da’vo arizasi", "/claim?type=employment_compensation_claim"]]
      },
      {
        icon: "⚖", title: "Noqonuniy ishdan bo‘shatildim",
        short: "Ishga tiklash bo‘yicha sudga buyruq nusxasi topshirilgan kundan boshlab uch oy ichida murojaat qilasiz.",
        steps: [
          "Ishdan bo‘shatish haqidagi buyruq nusxasini oling — muddat shu kundan boshlanadi.",
          "Bo‘shatish asosi va tartibi (ogohlantirish, kasaba uyushmasi bilan kelishish) buzilganini tekshiring.",
          "Uch oylik muddatni o‘tkazib yubormang — ishga tiklash nizolari uchun muddat aynan uch oy."
        ],
        docs: ["Ishdan bo‘shatish buyrug‘i nusxasi", "Mehnat shartnomasi", "Ogohlantirish xati (bo‘lsa)", "Guvohlar, yozishmalar"],
        law: [["161-modda — Ish beruvchining tashabbusiga ko‘ra bekor qilish", MK], ["165-modda — Bekor qilish haqida ogohlantirish", MK], ["560-modda — Sudga murojaat qilish muddatlari", MK]],
        ask: "Meni sababsiz ishdan bo‘shatishdi. Ishga tiklanish uchun nima qilishim kerak?",
        actions: [["AI bilan maslahat", "/ai"]]
      },
      {
        icon: "☀", title: "Ta’til va ish vaqti",
        short: "Haftasiga 40 soatdan ortiq normal ish vaqti bo‘lmaydi; yillik asosiy ta’til kamida 21 kalendar kun.",
        steps: [
          "Mehnat shartnomangizdagi ish vaqti va ta’til shartlarini tekshiring.",
          "Normal ish vaqti haftasiga 40 soatdan oshirib belgilangan bo‘lsa, bu shart qonunga zid — buni ish beruvchidan yozma so‘rang.",
          "Ta’til jadvali va ta’til puli to‘langanini nazorat qiling."
        ],
        docs: ["Mehnat shartnomasi", "Ta’til jadvali yoki buyrug‘i", "Ish vaqti hisobi (tabel)"],
        law: [["182-modda — Ish vaqtining normal davomiyligi", MK], ["217-modda — Yillik asosiy eng kam ta’til", MK]],
        ask: "Haftasiga 60 soat ishlayapman, ta’til ham berilmayapti. Bu qonuniymi?",
        actions: [["Mehnat shartnomasini tekshirish", "/legal-review"]]
      }
    ]
  }
};

const CSS = `
.lg{margin:28px 0 8px;font-family:Inter,system-ui,"Segoe UI",Arial,sans-serif;color:#12263a}
.lg-head{border-radius:22px;padding:30px;background:radial-gradient(circle at 92% 8%,rgba(201,168,106,.22),transparent 42%),linear-gradient(130deg,#0d3150,#06111f);color:#fff}
.lg-kicker{display:inline-block;font-size:10.5px;font-weight:900;letter-spacing:.18em;color:#e6c98e;border:1px solid rgba(230,201,142,.4);border-radius:99px;padding:6px 12px}
.lg-head h2{font:500 clamp(24px,3vw,34px) Georgia,"Times New Roman",serif;margin:14px 0 10px;color:#fff}
.lg-head p{margin:0;max-width:820px;color:#cfdbe6;line-height:1.75;font-size:15px}
.lg-facts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:22px}
.lg-fact{background:rgba(255,255,255,.06);border:1px solid rgba(230,201,142,.22);border-radius:15px;padding:15px}
.lg-fact b{display:block;font:600 24px Georgia,serif;color:#e6c98e;margin-bottom:6px}
.lg-fact span{display:block;font-size:13px;line-height:1.55;color:#e3ebf2}
.lg-fact small{display:block;margin-top:8px;font-size:11px;color:#9fb4c7}
.lg-list{display:grid;gap:14px;margin-top:18px}
.lg-item{background:#fff;border:1px solid #e2e7eb;border-radius:18px;box-shadow:0 10px 30px rgba(6,17,31,.05);overflow:hidden}
.lg-item[open]{border-color:rgba(201,168,106,.55)}
.lg-item summary{list-style:none;display:flex;gap:14px;align-items:flex-start;padding:20px 22px;cursor:pointer}
.lg-item summary::-webkit-details-marker{display:none}
.lg-ico{flex:none;display:grid;place-items:center;width:44px;height:44px;border-radius:12px;background:#fff8ec;border:1px solid #ead9b8;color:#9b763d;font:20px Georgia,serif}
.lg-sum{flex:1;min-width:0}
.lg-sum h3{margin:2px 0 6px;font:600 19px Georgia,serif;color:#06111f}
.lg-sum p{margin:0;color:#5d6f82;line-height:1.6;font-size:14.5px}
.lg-chev{flex:none;margin-top:10px;color:#9b763d;transition:transform .2s}
.lg-item[open] .lg-chev{transform:rotate(180deg)}
.lg-body{display:grid;grid-template-columns:1.25fr .75fr;gap:18px;padding:0 22px 22px 80px}
.lg-body h4{margin:0 0 10px;font-size:11px;letter-spacing:.14em;color:#9b763d;font-weight:900}
.lg-steps{margin:0;padding:0;list-style:none;counter-reset:s}
.lg-steps li{position:relative;padding:0 0 12px 36px;line-height:1.6;font-size:14.5px;counter-increment:s}
.lg-steps li:before{content:counter(s);position:absolute;left:0;top:0;display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#0d3150;color:#e6c98e;font-size:12px;font-weight:800}
.lg-side{display:grid;gap:14px;align-content:start}
.lg-box{background:#f6f8fa;border:1px solid #e6ebef;border-radius:14px;padding:14px 16px}
.lg-box ul{margin:0;padding-left:18px;line-height:1.6;font-size:13.5px}
.lg-law a{display:block;color:#1763aa;text-decoration:underline;font-size:13.5px;line-height:1.55;margin-bottom:6px}
.lg-acts{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:10px;padding-top:4px}
.lg-btn{display:inline-flex;align-items:center;gap:7px;border-radius:11px;padding:11px 16px;font-weight:800;font-size:13.5px;text-decoration:none;border:1px solid #d9c49a;color:#12263a;background:#fff}
.lg-btn.lg-ai{background:linear-gradient(135deg,#c9a86a,#e6c98e);border-color:transparent;color:#06111f}
.lg-note{margin-top:14px;font-size:12px;color:#6f7f91;line-height:1.6}
@media(max-width:900px){.lg-facts{grid-template-columns:repeat(2,minmax(0,1fr))}.lg-body{grid-template-columns:1fr;padding:0 18px 20px}}
@media(max-width:520px){.lg-head{padding:22px}.lg-fact b{font-size:20px}.lg-item summary{padding:16px}.lg-ico{width:38px;height:38px}.lg-btn{width:100%;justify-content:center}}
`;

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function render(pathname, lang) {
  const g = GUIDES[pathname];
  if (!g || lang !== "uz") return "";
  const q = "lang=" + lang;
  const href = p => p + (p.includes("?") ? "&" : "?") + q;
  const facts = g.facts.map(([big, text, src]) => `<div class="lg-fact"><b>${esc(big)}</b><span>${esc(text)}</span><small>${esc(src)}</small></div>`).join("");
  const items = g.items.map((it, i) => `<details class="lg-item"${i === 0 ? " open" : ""}>
<summary><span class="lg-ico">${esc(it.icon)}</span><span class="lg-sum"><h3>${esc(it.title)}</h3><p>${esc(it.short)}</p></span><span class="lg-chev">▾</span></summary>
<div class="lg-body">
<div><h4>QADAMLAR</h4><ol class="lg-steps">${it.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol></div>
<div class="lg-side"><div class="lg-box"><h4>KERAKLI HUJJATLAR</h4><ul>${it.docs.map(d => `<li>${esc(d)}</li>`).join("")}</ul></div>
<div class="lg-box lg-law"><h4>QONUN ASOSI</h4>${it.law.map(([t, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(t)} ↗</a>`).join("")}</div></div>
<div class="lg-acts"><a class="lg-btn lg-ai" href="${esc("/ai?" + q + "&q=" + encodeURIComponent(it.ask))}">✦ VERIUS AI’dan so‘rash</a>${it.actions.map(([t, u]) => `<a class="lg-btn" href="${esc(href(u))}">${esc(t)} →</a>`).join("")}</div>
</div></details>`).join("\n");
  return `<section class="lg" aria-label="${esc(g.title)}"><style>${CSS}</style>
<div class="lg-head"><span class="lg-kicker">${esc(g.kicker)}</span><h2>${esc(g.title)}</h2><p>${esc(g.lead)}</p><div class="lg-facts">${facts}</div></div>
<div class="lg-list">${items}</div>
<p class="lg-note">Ma’lumotlar Oila va Mehnat kodekslarining LexUZ’dagi amaldagi matni asosida tayyorlangan (2026-yil noyabr). Bu umumiy yo‘l-yo‘riq, yuridik xulosa emas — muhim qarordan oldin modda matnini va o‘z holatingizni tekshiring.</p>
</section>`;
}

// Put the guide right after the page hero so it is the first real content.
function inject(html, pathname, lang) {
  const block = render(pathname, lang);
  if (!block) return html;
  const source = String(html || "");
  const marker = source.indexOf('class="appHeader"');
  if (marker >= 0) {
    // end of the appHeader element: first "</div>" that closes it at depth 0
    let depth = 0, i = source.lastIndexOf("<div", marker);
    const re = /<div\b|<\/div>/g; re.lastIndex = i;
    let m;
    while ((m = re.exec(source))) {
      depth += m[0] === "</div>" ? -1 : 1;
      if (depth === 0) { const at = m.index + 6; return source.slice(0, at) + block + source.slice(at); }
    }
  }
  const at = source.toLowerCase().lastIndexOf("</main>");
  return at < 0 ? source + block : source.slice(0, at) + block + source.slice(at);
}

module.exports = { GUIDES, render, inject };
