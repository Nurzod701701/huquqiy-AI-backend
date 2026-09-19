require('dotenv').config();

const http = require('http');
const querystring = require('querystring');

const PORT = process.env.PORT || 8080;

// ======================================================
// YORDAMCHI FUNKSIYALAR
// ======================================================

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();

      if (body.length > 2000000) {
        reject(new Error('So‘rov juda katta.'));
        req.destroy();
      }
    });

    req.on('end', () => {
      resolve(querystring.parse(body));
    });

    req.on('error', reject);
  });
}

function money(value) {
  const number = Number(value || 0);

  if (!number) return '—';

  return number.toLocaleString('uz-UZ') + ' so‘m';
}

function alimentRate(count) {
  count = Number(count || 0);

  if (count === 1) {
    return {
      text: '1/4 (25%)',
      value: 1 / 4,
    };
  }

  if (count === 2) {
    return {
      text: '1/3 (33,3%)',
      value: 1 / 3,
    };
  }

  if (count >= 3) {
    return {
      text: '1/2 (50%)',
      value: 1 / 2,
    };
  }

  return null;
}

function alimentAmount(count, income) {
  const rate = alimentRate(count);

  if (!rate || !Number(income)) return null;

  return Math.round(Number(income) * rate.value);
}

function detectTopics(text) {
  const value = String(text || '').toLowerCase();
  const result = [];

  if (value.includes('ajrash') || value.includes('nikoh')) {
    result.push('Nikohdan ajratish');
  }

  if (
    value.includes('aliment') ||
    value.includes('ta’minot') ||
    value.includes("ta'minot")
  ) {
    result.push('Aliment');
  }

  if (
    value.includes('mulk') ||
    value.includes('uy') ||
    value.includes('kvartira') ||
    value.includes('mashina')
  ) {
    result.push('Mol-mulk');
  }

  if (value.includes('farzand') || value.includes('bola')) {
    result.push('Farzandlar');
  }

  return result;
}

// ======================================================
// AI
// ======================================================

async function callAI(question) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY topilmadi. .env faylni tekshiring.');
  }

  const systemPrompt = `
Sen "Huquqiy AI" nomli O‘zbekiston oilaviy huquqi bo‘yicha
raqamli huquqiy yordamchisan.

Faqat o‘zbek tilida javob ber.

Qoidalar:
1. Foydalanuvchi aytmagan faktni o‘ylab topma.
2. Ishonching komil bo‘lmagan modda raqamini yozma.
3. Sud natijasini kafolatlama.
4. Bir nechta huquqiy masala bo‘lsa, ularni alohida ajrat.
5. Ma’lumot yetishmasa, aynan qaysi ma’lumot kerakligini yoz.
6. Javob sodda, professional va tushunarli bo‘lsin.
7. Zarur hollarda amaldagi qonunchilikni LexUZ orqali tekshirish
   kerakligini ko‘rsat.
8. Aliment bo‘yicha foydalanuvchi bergan farzandlar soni va
   daromad ma’lumotlarini hisobga ol.

Javob tuzilishi:

QISQA XULOSA

ANIQLANGAN HUQUQIY MASALALAR

HUQUQIY TAHLIL

YETISHMAYOTGAN MA’LUMOTLAR

KEYINGI QADAMLAR

HUQUQIY MANBALAR
`;

  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',

      headers: {
        Authorization: 'Bearer ' + process.env.OPENROUTER_API_KEY,

        'Content-Type': 'application/json',

        'X-Title': 'Huquqiy AI',
      },

      body: JSON.stringify({
        model: 'openrouter/free',
        temperature: 0.1,
        max_tokens: 2000,

        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: question,
          },
        ],
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'AI xizmatida xatolik.');
  }

  return data?.choices?.[0]?.message?.content || 'AI javob qaytarmadi.';
}

// ======================================================
// DIZAYN
// ======================================================

const CSS = `
*{box-sizing:border-box}
:root{
--navy:#081b36;
--navy2:#112b50;
--blue:#315eea;
--green:#0ea978;
--purple:#7653e8;
--bg:#f5f7fb;
--text:#17243c;
--muted:#78859a;
--line:#e2e7ef;
}
body{
margin:0;
font-family:Arial,"Segoe UI",sans-serif;
background:#f5f7fb;
color:var(--text);
}
a{text-decoration:none;color:inherit}
button,input,select,textarea{font:inherit}
button{cursor:pointer}
.nav{
height:72px;
background:#081b36;
color:white;
display:flex;
align-items:center;
position:sticky;
top:0;
z-index:100;
}
.navin{
width:min(1200px,92%);
margin:auto;
display:flex;
align-items:center;
justify-content:space-between;
gap:20px;
}
.logo{font-size:20px;font-weight:900}
.logo span{color:#e5bd6b}
.links{display:flex;gap:8px}
.links a{
padding:10px 13px;
border-radius:9px;
font-size:12px;
color:#b6c3d6;
font-weight:700;
}
.links a:hover{background:#ffffff12;color:white}
.wrap{width:min(1200px,92%);margin:auto}
.hero{
padding:70px 0 50px;
display:grid;
grid-template-columns:1.1fr .9fr;
gap:40px;
align-items:center;
}
.hero h1{
font-size:58px;
line-height:1;
letter-spacing:-3px;
margin:15px 0;
color:var(--navy);
}
.hero h1 span{color:var(--blue)}
.hero p{
color:var(--muted);
line-height:1.7;
font-size:15px;
max-width:650px;
}
.badge{
display:inline-block;
padding:8px 12px;
border-radius:999px;
background:#eaf0ff;
color:#315eea;
font-size:10px;
font-weight:900;
}
.btn{
border:0;
border-radius:11px;
padding:13px 18px;
display:inline-flex;
align-items:center;
justify-content:center;
font-size:12px;
font-weight:900;
}
.blue{background:var(--blue);color:white}
.dark{background:var(--navy);color:white}
.purple{background:var(--purple);color:white}
.white{
background:white;
border:1px solid var(--line);
color:var(--navy);
}
.heroButtons{display:flex;gap:10px;margin-top:25px}
.demo{
background:white;
border:1px solid var(--line);
border-radius:22px;
padding:25px;
box-shadow:0 25px 60px #1d315018;
}
.demoTop{
display:flex;
align-items:center;
gap:10px;
margin-bottom:20px;
font-weight:900;
}
.avatar{
width:42px;height:42px;
border-radius:12px;
display:grid;
place-items:center;
background:var(--blue);
color:white;
font-weight:900;
}
.bubble{
padding:15px;
border-radius:13px;
background:#f4f6fa;
color:#526079;
font-size:12px;
line-height:1.6;
margin-bottom:12px;
}
.aiBubble{
padding:15px;
border-radius:13px;
background:#edf3ff;
color:#38599f;
font-size:12px;
line-height:1.6;
}
.section{padding:45px 0 80px}
.section h2{
font-size:32px;
color:var(--navy);
margin:7px 0;
}
.cards{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:18px;
margin-top:28px;
}
.card{
min-height:330px;
padding:27px;
border-radius:22px;
display:flex;
flex-direction:column;
position:relative;
overflow:hidden;
transition:.2s;
}
.card:hover{transform:translateY(-5px)}
.c1{
background:linear-gradient(145deg,#fff,#f1f5ff);
border:2px solid #dbe5ff;
}
.c2{
background:linear-gradient(145deg,#fff,#eefbf6);
border:2px solid #d5eee5;
}
.c3{
background:linear-gradient(145deg,#0b1e3b,#17355e);
border:2px solid #6046bc;
color:white;
}
.number{
position:absolute;
right:22px;
top:17px;
font-size:42px;
font-weight:900;
opacity:.1;
}
.icon{
width:52px;height:52px;
display:grid;place-items:center;
border-radius:15px;
font-size:22px;
margin-bottom:25px;
background:#e9efff;
}
.c2 .icon{background:#e1f7ef}
.c3 .icon{background:#7653e8}
.card h3{font-size:21px;margin:0 0 10px}
.c1 h3,.c2 h3{color:var(--navy)}
.card p{
font-size:12px;
line-height:1.7;
color:#7a879a;
}
.c3 p{color:#b4c0d2}
.go{
margin-top:auto;
padding-top:20px;
font-size:11px;
font-weight:900;
border-top:1px solid #e3e8ef;
}
.c1 .go{color:var(--blue)}
.c2 .go{color:var(--green)}
.c3 .go{
color:#d6caff;
border-color:#ffffff18;
}
.app{
width:min(1200px,94%);
margin:30px auto 70px;
display:grid;
grid-template-columns:210px minmax(0,1fr);
gap:20px;
}
.side{
background:#0c2141;
padding:15px;
border-radius:18px;
height:fit-content;
position:sticky;
top:90px;
}
.side a{
display:block;
padding:12px;
margin:3px 0;
border-radius:9px;
color:#aebdd1;
font-size:11px;
font-weight:800;
}
.side a:hover,.side a.on{
background:#ffffff12;
color:white;
}
.side .court{
color:#d0c3ff;
border:1px solid #795de52b;
}
.head{margin-bottom:20px}
.head small{color:#8793a6;font-weight:800}
.head h1{
font-size:31px;
color:var(--navy);
margin:8px 0;
}
.head p{
color:var(--muted);
font-size:12px;
line-height:1.6;
}
.surface{
background:white;
border:1px solid var(--line);
border-radius:18px;
box-shadow:0 10px 35px #182c4c0a;
}
.pad{padding:26px}
.field{margin-bottom:16px}
.field label{
display:block;
font-size:11px;
font-weight:850;
color:#44516a;
margin-bottom:7px;
}
input,select,textarea{
width:100%;
border:1.5px solid #dfe5ee;
border-radius:10px;
padding:12px;
outline:0;
background:white;
}
input:focus,select:focus,textarea:focus{
border-color:#7190eb;
}
textarea{
min-height:105px;
resize:vertical;
line-height:1.5;
}
.grid2{
display:grid;
grid-template-columns:1fr 1fr;
gap:13px;
}
.steps{
display:flex;
gap:5px;
margin:15px 0 25px;
}
.steps i{
height:6px;
flex:1;
background:#e6eaf1;
border-radius:20px;
}
.steps i.on{background:var(--blue)}
.step{display:none}
.step.on{display:block}
.step h2{
font-size:22px;
color:var(--navy);
margin:0 0 7px;
}
.step>p{
font-size:11px;
color:#8390a3;
margin:0 0 24px;
}
.actions{
display:flex;
justify-content:space-between;
gap:10px;
padding:18px 26px;
border-top:1px solid var(--line);
background:#fafbfe;
}
.types{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:10px;
}
.type{
border:2px solid var(--line);
border-radius:13px;
padding:18px;
cursor:pointer;
}
.type:has(input:checked){
border-color:var(--blue);
background:#f2f6ff;
}
.type input{width:auto}
.type strong{
display:block;
margin:12px 0 5px;
font-size:12px;
}
.type small{
font-size:9px;
color:#8390a3;
line-height:1.4;
}
.result{
white-space:pre-wrap;
font-size:13px;
line-height:1.8;
}
.doc{
background:white;
padding:45px;
border:1px solid #ddd;
font-family:Georgia,serif;
white-space:pre-wrap;
line-height:1.8;
}
.tools{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:15px;
}
.tool{
padding:24px;
min-height:230px;
}
.tool h3{color:var(--navy)}
.tool p{
color:var(--muted);
font-size:11px;
line-height:1.6;
}
@media(max-width:850px){

  .hero,
  .cards,
  .app,
  .tools{
    grid-template-columns:1fr;
  }
  
  .app{
    margin-top:15px;
  }
  
  /* Chap menyuni yo‘qotmaymiz */
  .side{
    display:flex;
    position:static;
    width:100%;
    overflow-x:auto;
    gap:6px;
    padding:8px;
    border-radius:12px;
    background:#0c2141;
  }
  
  .side a{
    flex:0 0 auto;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    white-space:nowrap;
    margin:0;
    padding:10px 12px;
    font-size:10px;
  }
  
  .hero h1{
    font-size:43px;
  }
  
  .grid2,
  .types{
    grid-template-columns:1fr;
  }
  
  .links{
    display:none;
  }
  
  }
`;

function layout(content, title = 'Huquqiy AI') {
  return `<!doctype html>
<html lang="uz">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>${CSS}</style>
</head>
<body>

<header class="nav">
<div class="navin">
<a class="logo" href="/">Huquqiy <span>AI</span></a>

<nav class="links">
<a href="/ai">AI huquqiy tahlil</a>
<a href="/questionnaire">Savol-javob</a>
<a href="/court">Sud yo‘nalishi</a>
</nav>

<div style="font-size:10px;color:#87dcbf">● Tizim faol</div>
</div>
</header>

${content}

<footer style="text-align:center;padding:30px;color:#9aa5b4;font-size:10px">
Huquqiy AI · Raqamli huquqiy yordamchi
</footer>

</body>
</html>`;
}

function sidebar(active) {
  return `<aside class="side">
<a href="/" class="${active === 'home' ? 'on' : ''}">⌂ Bosh sahifa</a>
<a href="/ai" class="${active === 'ai' ? 'on' : ''}">✦ AI huquqiy tahlil</a>
<a href="/questionnaire" class="${active === 'q' ? 'on' : ''}">☷ Savol-javob</a>
<a href="/court" class="court ${
    active === 'court' ? 'on' : ''
  }">⚖ Sud yo‘nalishi</a>
</aside>`;
}

// ======================================================
// BOSH SAHIFA
// ======================================================

function homePage() {
  return layout(`
<main>

<section class="wrap hero">

<div>
<span class="badge">O‘ZBEKISTON HUQUQI BO‘YICHA AI</span>

<h1>
Huquqiy masalani
<span>tushunishdan</span>
yechimgacha.
</h1>

<p>
Huquqiy vaziyatingizni AI yordamida tahlil qiling,
savollar orqali muhim faktlarni aniqlang yoki
Sud yo‘nalishi orqali da’vo arizasi tayyorlashni boshlang.
</p>

<div class="heroButtons">
<a class="btn blue" href="/ai">AI tahlilni boshlash</a>
<a class="btn purple" href="/court">⚖ Sud yo‘nalishi</a>
</div>
</div>

<div class="demo">
<div class="demoTop">
<div class="avatar">AI</div>
Huquqiy AI
</div>

<div class="bubble">
2 ta farzandim bor. Ajrashmoqchimiz.
Nikoh davrida uy olganmiz. Aliment va uy masalasi qanday bo‘ladi?
</div>

<div class="aiBubble">
<strong>3 ta huquqiy masala aniqlandi</strong><br><br>
Nikohdan ajratish, aliment va nikoh davomida
orttirilgan mol-mulk masalalarini alohida tahlil qilish kerak.
</div>
</div>

</section>

<section class="wrap section">

<span class="badge">3 ASOSIY YO‘NALISH</span>

<h2>Kerakli yo‘nalishni tanlang</h2>

<div class="cards">

<a href="/ai" class="card c1">
<span class="number">01</span>
<div class="icon">✦</div>
<h3>AI huquqiy tahlil</h3>
<p>
Vaziyatingizni erkin yozing. AI undagi huquqiy
masalalarni aniqlab, dastlabki tahlil beradi.
</p>
<div class="go">TAHLILNI BOSHLASH →</div>
</a>

<a href="/questionnaire" class="card c2">
<span class="number">02</span>
<div class="icon">☷</div>
<h3>Savol-javob orqali tahlil</h3>
<p>
Tizim muhim ma’lumotlarni bosqichma-bosqich so‘raydi
va yakunda javoblarni bitta huquqiy vaziyatga birlashtiradi.
</p>
<div class="go">SAVOLLARNI BOSHLASH →</div>
</a>

<a href="/court" class="card c3">
<span class="number">03</span>
<div class="icon">⚖</div>
<h3>Sud yo‘nalishi</h3>
<p>
Sudga murojaat qilish uchun alohida modul.
Da’vo arizasi konstruktori orqali hujjat loyihasini tayyorlang.
</p>
<div class="go">SUD YO‘NALISHIGA KIRISH →</div>
</a>

</div>
</section>

</main>
`);
}

// ======================================================
// AI SAHIFA
// ======================================================

function aiPage() {
  return layout(
    `
<div class="app">

${sidebar('ai')}

<main>

<div class="head">

<a
  href="/"
  class="btn white"
  style="margin-bottom:18px"
>
  ← Bosh sahifaga qaytish
</a>

<small style="display:block">
  BOSH SAHIFA / AI TAHLIL
</small>

<h1>AI huquqiy tahlil</h1>

<p>
  Huquqiy vaziyatingizni imkon qadar batafsil yozing.
</p>

</div>

<section class="surface pad">

<div style="text-align:center;padding:30px 10px">
<div class="avatar" style="margin:auto">AI</div>
<h2 style="color:var(--navy)">Vaziyatingizni yozing</h2>
<p style="color:var(--muted);font-size:11px">
Nikoh, aliment, farzand yoki mol-mulk bilan bog‘liq vaziyatni yozishingiz mumkin.
</p>
</div>

<form action="/ai-result" method="POST">

<div class="field">
<textarea
name="question"
required
style="min-height:180px"
placeholder="Masalan: 2 ta farzandim bor. Turmush o‘rtog‘im bilan ajrashmoqchimiz..."
></textarea>
</div>

<button class="btn blue" type="submit">
✦ Huquqiy tahlil qilish
</button>

</form>

</section>
</main>
</div>
`,
    'AI huquqiy tahlil'
  );
}

function aiResultPage(question, answer) {
  const topics = detectTopics(question);

  const tags = topics.length
    ? topics
        .map(
          (x) => '<span class="badge" style="margin:3px">' + esc(x) + '</span>'
        )
        .join('')
    : '<span class="badge">Umumiy huquqiy masala</span>';

  return layout(
    `
<div class="app">

${sidebar('ai')}

<main>

<div class="head">
<small>AI TAHLIL / NATIJA</small>
<h1>Huquqiy tahlil natijasi</h1>
</div>

<section class="surface pad" style="margin-bottom:16px">
<strong>Siz kiritgan vaziyat</strong>
<p style="color:var(--muted);line-height:1.7;font-size:12px">
${esc(question)}
</p>
<div>${tags}</div>
</section>

<section class="surface pad">
<div style="display:flex;gap:10px;align-items:center;margin-bottom:20px">
<div class="avatar">AI</div>
<strong>Huquqiy AI tahlili</strong>
</div>

<div class="result">${esc(answer)}</div>

<div style="margin-top:25px">
<a class="btn purple" href="/court">⚖ Sud yo‘nalishiga o‘tish</a>
</div>
</section>

</main>
</div>
`,
    'Huquqiy tahlil'
  );
}

// ======================================================
// SAVOL-JAVOB
// ======================================================

function questionnairePage() {
  return layout(
    `
<div class="app">

${sidebar('q')}

<main>

<div class="head">
<small>BOSH SAHIFA / SAVOL-JAVOB</small>
<h1>Savol-javob orqali tahlil</h1>
<p>Muhim ma’lumotlarni 5 bosqichda kiriting.</p>
</div>

<section class="surface">

<div style="padding:25px 25px 0">
<div class="steps" id="qProgress">
<i class="on"></i><i></i><i></i><i></i><i></i>
</div>
</div>

<form id="qForm" action="/questionnaire-result" method="POST">

<div class="pad">

<section class="step on" data-q="0">
<h2>1. Asosiy vaziyat</h2>
<p>Huquqiy muammo haqida qisqacha ma’lumot bering.</p>

<div class="field">
<label>Muammo turi *</label>
<select name="problemType" required>
<option value="">Tanlang</option>
<option>Nikohdan ajratish</option>
<option>Aliment</option>
<option>Farzand masalasi</option>
<option>Mol-mulk</option>
<option>Bir nechta masala</option>
</select>
</div>

<div class="field">
<label>Vaziyat tavsifi</label>
<textarea name="description"></textarea>
</div>
</section>

<section class="step" data-q="1">
<h2>2. Nikoh</h2>
<p>Nikoh va ajrashish holati.</p>

<div class="grid2">
<div class="field">
<label>Nikoh sanasi</label>
<input type="date" name="marriageDate">
</div>

<div class="field">
<label>Nikoh qayd etilgan joy</label>
<input name="marriagePlace">
</div>
</div>

<div class="field">
<label>Ikki taraf ajrashishga rozimi?</label>
<select name="mutualConsent">
<option value="">Tanlang</option>
<option>Ha</option>
<option>Yo‘q</option>
<option>Aniq emas</option>
</select>
</div>

<div class="field">
<label>Ajrashish sababi</label>
<textarea name="reason"></textarea>
</div>
</section>

<section class="step" data-q="2">
<h2>3. Farzandlar va aliment</h2>
<p>Farzandlar hamda daromad haqidagi ma’lumotlar.</p>

<div class="grid2">
<div class="field">
<label>Farzandlar soni</label>
<input type="number" min="0" name="childrenCount">
</div>

<div class="field">
<label>Farzandlar kim bilan yashaydi?</label>
<select name="childrenLiving">
<option value="">Tanlang</option>
<option>Ona bilan</option>
<option>Ota bilan</option>
<option>Ota-ona bilan birga</option>
</select>
</div>
</div>

<div class="field">
<label>Farzandlarning yoshi va ma’lumotlari</label>
<textarea name="childrenDetails"></textarea>
</div>

<div class="grid2">
<div class="field">
<label>Ish joyi</label>
<input name="workplace">
</div>

<div class="field">
<label>Oylik daromad</label>
<input type="number" min="0" name="income">
</div>
</div>
</section>

<section class="step" data-q="3">
<h2>4. Mol-mulk</h2>
<p>Nikoh davrida orttirilgan mol-mulk bo‘lsa kiriting.</p>

<div class="field">
<label>Mol-mulk haqida</label>
<textarea name="propertyDetails"></textarea>
</div>

<div class="grid2">
<div class="field">
<label>Kimning nomida?</label>
<input name="propertyOwner">
</div>

<div class="field">
<label>Qachon olingan?</label>
<input name="propertyDate">
</div>
</div>

<div class="field">
<label>Mablag‘ manbasi</label>
<textarea name="propertySource"></textarea>
</div>

<div class="field">
<label>Nikoh shartnomasi bormi?</label>
<select name="contract">
<option value="">Tanlang</option>
<option>Ha</option>
<option>Yo‘q</option>
</select>
</div>
</section>

<section class="step" data-q="4">
<h2>5. Yakuniy ma’lumot</h2>
<p>Boshqa muhim holatlarni yozing.</p>

<div class="field">
<label>Qo‘shimcha faktlar</label>
<textarea name="additional" style="min-height:160px"></textarea>
</div>

<div style="background:#eef4ff;padding:15px;border-radius:10px;font-size:11px;color:#536781">
Barcha javoblaringiz AI tomonidan bitta huquqiy vaziyat sifatida tahlil qilinadi.
</div>
</section>

</div>

<div class="actions">
<button type="button" class="btn white" id="qBack">← Orqaga</button>
<button type="button" class="btn blue" id="qNext">Davom etish →</button>
<button type="submit" class="btn blue" id="qSubmit" style="display:none">
Huquqiy tahlil qilish
</button>
</div>

</form>
</section>
</main>
</div>

<script>
(function(){
var index=0;
var steps=Array.from(document.querySelectorAll('[data-q]'));
var bars=Array.from(document.querySelectorAll('#qProgress i'));
var back=document.getElementById('qBack');
var next=document.getElementById('qNext');
var submit=document.getElementById('qSubmit');

function show(){
steps.forEach(function(s,i){
s.classList.toggle('on',i===index);
});
bars.forEach(function(b,i){
b.classList.toggle('on',i<=index);
});
back.style.visibility=index===0?'hidden':'visible';
next.style.display=index===steps.length-1?'none':'inline-flex';
submit.style.display=index===steps.length-1?'inline-flex':'none';
}

next.addEventListener('click',function(){
var required=steps[index].querySelectorAll('[required]');
for(var i=0;i<required.length;i++){
if(!required[i].checkValidity()){
required[i].reportValidity();
return;
}
}
if(index<steps.length-1){
index++;
show();
}
});

back.addEventListener('click',function(){
if(index>0){
index--;
show();
}
});

show();
})();
</script>
`,
    'Savol-javob'
  );
}

function questionnaireText(data) {
  return [
    'Asosiy muammo: ' + (data.problemType || 'ko‘rsatilmagan'),
    'Vaziyat: ' + (data.description || 'ko‘rsatilmagan'),
    'Nikoh sanasi: ' + (data.marriageDate || 'ko‘rsatilmagan'),
    'Nikoh joyi: ' + (data.marriagePlace || 'ko‘rsatilmagan'),
    'O‘zaro rozilik: ' + (data.mutualConsent || 'ko‘rsatilmagan'),
    'Ajrashish sababi: ' + (data.reason || 'ko‘rsatilmagan'),
    'Farzandlar soni: ' + (data.childrenCount || 'ko‘rsatilmagan'),
    'Farzandlar haqida: ' + (data.childrenDetails || 'ko‘rsatilmagan'),
    'Farzandlar yashashi: ' + (data.childrenLiving || 'ko‘rsatilmagan'),
    'Ish joyi: ' + (data.workplace || 'ko‘rsatilmagan'),
    'Daromad: ' + (data.income || 'ko‘rsatilmagan'),
    'Mol-mulk: ' + (data.propertyDetails || 'ko‘rsatilmagan'),
    'Mol-mulk egasi: ' + (data.propertyOwner || 'ko‘rsatilmagan'),
    'Mol-mulk olingan vaqt: ' + (data.propertyDate || 'ko‘rsatilmagan'),
    'Mablag‘ manbasi: ' + (data.propertySource || 'ko‘rsatilmagan'),
    'Nikoh shartnomasi: ' + (data.contract || 'ko‘rsatilmagan'),
    'Qo‘shimcha faktlar: ' + (data.additional || 'ko‘rsatilmagan'),
  ].join('\n');
}

// ======================================================
// SUD YO‘NALISHI
// ======================================================

function courtPage() {
  return layout(
    `
<div class="app">

${sidebar('court')}

<main>

<div class="head">
<small>BOSH SAHIFA / SUD YO‘NALISHI</small>
<h1>Sud yo‘nalishi</h1>
<p>Sudga murojaat qilish bilan bog‘liq alohida ish muhiti.</p>
</div>

<section style="
padding:32px;
border-radius:22px;
background:linear-gradient(145deg,#091d3a,#193861);
color:white;
margin-bottom:20px">

<span style="color:#c6b7ff;font-size:10px;font-weight:900">
03 — SUD YO‘NALISHI
</span>

<h2 style="font-size:28px;margin:10px 0">
Sudga murojaat qilish jarayonini boshlang
</h2>

<p style="color:#b3bfd1;font-size:12px;line-height:1.7">
Kerakli faktlarni kiriting va da’vo arizasi loyihasini shakllantiring.
</p>
</section>

<div class="tools">

<a href="/claim" class="surface tool" style="border:2px solid #d9d0ff">
<div class="icon" style="background:#eee9ff">📄</div>
<strong style="color:#7653e8;font-size:9px">FAOL</strong>
<h3>Da’vo arizasi</h3>
<p>
Nikohdan ajratish, aliment va mol-mulk masalalari bo‘yicha
da’vo arizasi konstruktori.
</p>
<b style="color:#7653e8;font-size:11px">KONSTRUKTORGA KIRISH →</b>
</a>

<div class="surface tool" style="opacity:.6">
<div class="icon">📑</div>
<strong style="font-size:9px">TEZ ORADA</strong>
<h3>E’tiroz va tushuntirish</h3>
<p>Sudga taqdim etiladigan boshqa hujjatlar moduli.</p>
</div>

<div class="surface tool" style="opacity:.6">
<div class="icon">⚖</div>
<strong style="font-size:9px">TEZ ORADA</strong>
<h3>Apellyatsiya va iltimosnoma</h3>
<p>Keyingi bosqichlarda qo‘shiladigan sud hujjatlari.</p>
</div>

</div>
</main>
</div>
`,
    'Sud yo‘nalishi'
  );
}

// ======================================================
// DA'VO KONSTRUKTORI
// ======================================================

function claimPage() {
  return layout(
    `
<div class="app">

${sidebar('court')}

<main>

<div class="head">
<small>SUD YO‘NALISHI / DA’VO ARIZASI</small>
<h1>Da’vo arizasi konstruktori</h1>
<p>Ma’lumotlarni 6 bosqichda kiriting.</p>
</div>

<section class="surface">

<div style="padding:25px 25px 0">
<div class="steps" id="claimProgress">
<i class="on"></i><i></i><i></i><i></i><i></i><i></i>
</div>
</div>

<form id="claimForm" action="/claim-result" method="POST">

<div class="pad">

<section class="step on" data-c="0">
<h2>1. Da’vo turi</h2>
<p>Sudga qaysi talab bilan murojaat qilmoqchisiz?</p>

<div class="types">

<label class="type">
<input type="radio" name="claimType" value="divorce" required>
<strong>Nikohdan ajratish</strong>
<small>Faqat nikohdan ajratish.</small>
</label>

<label class="type">
<input type="radio" name="claimType" value="divorce_aliment" required>
<strong>Ajrashish + aliment</strong>
<small>Nikohdan ajratish va aliment.</small>
</label>

<label class="type">
<input type="radio" name="claimType" value="divorce_property" required>
<strong>Ajrashish + mol-mulk</strong>
<small>Nikohdan ajratish va mol-mulk masalasi.</small>
</label>

</div>
</section>

<section class="step" data-c="1">
<h2>2. Sud va taraflar</h2>
<p>Sud, da’vogar va javobgar ma’lumotlari.</p>

<div class="field">
<label>Sud nomi *</label>
<input name="courtName" required placeholder="Fuqarolik ishlari bo‘yicha ... sudiga">
</div>

<div class="grid2">
<div class="field">
<label>Da’vogar F.I.Sh. *</label>
<input name="plaintiffName" required>
</div>

<div class="field">
<label>Da’vogar telefoni</label>
<input name="plaintiffPhone">
</div>
</div>

<div class="field">
<label>Da’vogar manzili *</label>
<input name="plaintiffAddress" required>
</div>

<div class="grid2">
<div class="field">
<label>Javobgar F.I.Sh. *</label>
<input name="defendantName" required>
</div>

<div class="field">
<label>Javobgar ish joyi</label>
<input name="defendantWork">
</div>
</div>

<div class="field">
<label>Javobgar manzili</label>
<input name="defendantAddress">
</div>
</section>

<section class="step" data-c="2">
<h2>3. Nikoh va farzandlar</h2>
<p>Nikoh va farzandlar haqidagi ma’lumotlar.</p>

<div class="grid2">
<div class="field">
<label>Nikoh sanasi *</label>
<input type="date" name="marriageDate" required>
</div>

<div class="field">
<label>Nikoh qayd etilgan joy *</label>
<input name="marriagePlace" required>
</div>
</div>

<div class="grid2">
<div class="field">
<label>Farzandlar soni</label>
<input id="claimChildren" type="number" min="0" name="childrenCount">
</div>

<div class="field">
<label>Farzandlar kim bilan yashaydi?</label>
<select name="childrenLiving">
<option value="">Tanlang</option>
<option>Da’vogar bilan</option>
<option>Javobgar bilan</option>
<option>Taraflar bilan birga</option>
</select>
</div>
</div>

<div class="field">
<label>Farzandlar F.I.Sh. va yoshi</label>
<textarea name="childrenDetails"></textarea>
</div>
</section>

<section class="step" data-c="3">
<h2>4. Faktik holatlar</h2>
<p>Oilaviy munosabatlar bilan bog‘liq faktlarni kiriting.</p>

<div class="field">
<label>Ajrashish sababi *</label>
<textarea name="divorceReason" required></textarea>
</div>

<div class="grid2">
<div class="field">
<label>Hozir birga yashaysizmi?</label>
<select name="livingTogether">
<option value="">Tanlang</option>
<option>Ha</option>
<option>Yo‘q</option>
</select>
</div>

<div class="field">
<label>Alohida yashash boshlangan vaqt</label>
<input name="separationDate">
</div>
</div>

<div class="field">
<label>Yarashish bo‘yicha harakatlar</label>
<textarea name="reconciliation"></textarea>
</div>
</section>

<section class="step" data-c="4">
<h2>5. Talablar</h2>
<p>Aliment va mol-mulk haqidagi ma’lumotlar.</p>

<div class="grid2">
<div class="field">
<label>Aliment uchun farzandlar soni</label>
<input id="alimentChildren" type="number" min="0" name="alimentChildren">
</div>

<div class="field">
<label>To‘lovchining oylik daromadi</label>
<input id="payerIncome" type="number" min="0" name="payerIncome">
</div>
</div>

<div id="alimentPreview" style="
padding:14px;
background:#eef4ff;
border-radius:11px;
margin-bottom:18px;
font-size:11px;
color:#3158b5">
Farzandlar soni va daromadni kiriting.
</div>

<div class="field">
<label>Mol-mulk tavsifi</label>
<textarea name="propertyDetails"></textarea>
</div>

<div class="grid2">
<div class="field">
<label>Mol-mulk kimning nomida?</label>
<input name="propertyOwner">
</div>

<div class="field">
<label>Qachon olingan?</label>
<input name="propertyDate">
</div>
</div>

<div class="field">
<label>Mablag‘ manbasi</label>
<textarea name="propertySource"></textarea>
</div>

<div class="field">
<label>Boshqa talablar</label>
<textarea name="additionalRequests"></textarea>
</div>
</section>

<section class="step" data-c="5">
<h2>6. Dalillar va ilovalar</h2>
<p>Sudga taqdim etiladigan hujjatlarni ko‘rsating.</p>

<div class="field">
<label>Dalillar</label>
<textarea name="evidence"></textarea>
</div>

<div class="field">
<label>Ilovalar</label>
<textarea name="attachments" placeholder="Nikoh guvohnomasi, tug‘ilganlik guvohnomasi va boshqalar..."></textarea>
</div>

<div style="
padding:15px;
background:#effbf6;
border:1px solid #ccefe1;
border-radius:11px;
font-size:11px;
line-height:1.6;
color:#496c61">
Ma’lumotlarni tekshiring. Keyingi tugma da’vo arizasi loyihasini shakllantiradi.
</div>
</section>

</div>

<div class="actions">

<button type="button" class="btn white" id="claimBack">
← Orqaga
</button>

<div style="display:flex;gap:8px">

<button type="button" class="btn blue" id="claimNext">
Davom etish →
</button>

<button type="submit" class="btn purple" id="claimSubmit" style="display:none">
Da’vo arizasini shakllantirish
</button>

</div>

</div>

</form>
</section>

</main>
</div>

<script>
(function(){

var index=0;

var steps=
Array.from(
document.querySelectorAll('[data-c]')
);

var bars=
Array.from(
document.querySelectorAll('#claimProgress i')
);

var back=
document.getElementById('claimBack');

var next=
document.getElementById('claimNext');

var submit=
document.getElementById('claimSubmit');

function show(){

steps.forEach(function(step,i){
step.classList.toggle('on',i===index);
});

bars.forEach(function(bar,i){
bar.classList.toggle('on',i<=index);
});

back.style.visibility=
index===0?'hidden':'visible';

next.style.display=
index===steps.length-1?'none':'inline-flex';

submit.style.display=
index===steps.length-1?'inline-flex':'none';
}

function valid(){

if(index===0){

var radio=
document.querySelector(
'input[name="claimType"]:checked'
);

if(!radio){
alert('Da’vo turini tanlang.');
return false;
}

}

var required=
steps[index].querySelectorAll('[required]');

for(var i=0;i<required.length;i++){

if(!required[i].checkValidity()){
required[i].reportValidity();
return false;
}

}

return true;
}

next.addEventListener(
'click',
function(){

if(!valid()) return;

if(index<steps.length-1){
index++;
show();
window.scrollTo(0,80);
}

}
);

back.addEventListener(
'click',
function(){

if(index>0){
index--;
show();
window.scrollTo(0,80);
}

}
);

var children=
document.getElementById('claimChildren');

var alimentChildren=
document.getElementById('alimentChildren');

var income=
document.getElementById('payerIncome');

var preview=
document.getElementById('alimentPreview');

function calc(){

var c=
Number(alimentChildren.value);

var inc=
Number(income.value);

var rate=0;
var fraction='';

if(c===1){
rate=1/4;
fraction='1/4';
}else if(c===2){
rate=1/3;
fraction='1/3';
}else if(c>=3){
rate=1/2;
fraction='1/2';
}

if(rate && inc){

var amount=
Math.round(inc*rate);

preview.textContent=
fraction+
' ≈ '+
amount.toLocaleString('uz-UZ')+
' so‘m';

}else{

preview.textContent=
'Farzandlar soni va daromadni kiriting.';

}

}

children.addEventListener(
'input',
function(){

if(!alimentChildren.value){
alimentChildren.value=children.value;
calc();
}

}
);

alimentChildren.addEventListener('input',calc);
income.addEventListener('input',calc);

show();

})();
</script>
`,
    'Da’vo arizasi'
  );
}

// ======================================================
// DA'VO MATNI
// ======================================================

function buildClaim(data) {
  const typeNames = {
    divorce: 'NIKOHDAN AJRATISH TO‘G‘RISIDA',
    divorce_aliment: 'NIKOHDAN AJRATISH VA ALIMENT UNDIRISH TO‘G‘RISIDA',
    divorce_property: 'NIKOHDAN AJRATISH VA MOL-MULK MASALASI TO‘G‘RISIDA',
  };

  const type = typeNames[data.claimType] || 'NIKOHDAN AJRATISH TO‘G‘RISIDA';

  let children = '';

  if (data.childrenCount) {
    children += '\nTaraflarning farzandlari soni: ' + data.childrenCount + '.';
  }

  if (data.childrenDetails) {
    children += '\nFarzandlar haqida ma’lumot: ' + data.childrenDetails + '.';
  }

  if (data.childrenLiving) {
    children +=
      '\nFarzandlarning hozirgi yashash holati: ' + data.childrenLiving + '.';
  }

  let facts = '';

  if (data.divorceReason) {
    facts +=
      'Oilaviy munosabatlarning buzilish sababi: ' + data.divorceReason + '.\n';
  }

  if (data.livingTogether) {
    facts +=
      'Taraflarning hozir birga yashash holati: ' + data.livingTogether + '.\n';
  }

  if (data.separationDate) {
    facts += 'Alohida yashash boshlangan vaqt: ' + data.separationDate + '.\n';
  }

  if (data.reconciliation) {
    facts += 'Yarashish bo‘yicha holatlar: ' + data.reconciliation + '.\n';
  }

  let requests = [];
  requests.push('Taraflar o‘rtasidagi nikohdan ajratish.');

  if (data.claimType === 'divorce_aliment') {
    requests.push(
      'Voyaga yetmagan farzand(lar) ta’minoti uchun aliment undirish.'
    );
  }

  if (data.claimType === 'divorce_property') {
    requests.push(
      'Nikoh davomida orttirilgan mol-mulk bilan bog‘liq talabni ko‘rib chiqish.'
    );
  }

  if (data.additionalRequests) {
    requests.push(data.additionalRequests);
  }

  let extra = '';

  if (data.claimType === 'divorce_aliment') {
    const count = Number(data.alimentChildren || data.childrenCount || 0);

    const income = Number(data.payerIncome || 0);

    const rate = alimentRate(count);

    const amount = alimentAmount(count, income);

    extra += '\n\nALIMENT MASALASI:\n';

    if (count) {
      extra += 'Farzandlar soni: ' + count + '.\n';
    }

    if (rate) {
      extra += 'Dastlabki ulush: ' + rate.text + '.\n';
    }

    if (income) {
      extra += 'Ko‘rsatilgan daromad: ' + money(income) + '.\n';
    }

    if (amount) {
      extra += 'Dastlabki matematik hisob: ' + money(amount) + '.\n';
    }
  }

  if (data.claimType === 'divorce_property' || data.propertyDetails) {
    extra += '\n\nMOL-MULK MASALASI:\n';

    if (data.propertyDetails) {
      extra += 'Mol-mulk: ' + data.propertyDetails + '.\n';
    }

    if (data.propertyOwner) {
      extra += 'Mol-mulk kimning nomida: ' + data.propertyOwner + '.\n';
    }

    if (data.propertyDate) {
      extra += 'Olingan vaqt: ' + data.propertyDate + '.\n';
    }

    if (data.propertySource) {
      extra += 'Mablag‘ manbasi: ' + data.propertySource + '.\n';
    }
  }

  const requestText = requests.map((x, i) => i + 1 + '. ' + x).join('\n');

  const attachments =
    data.attachments ||
    `1. Nikoh qayd etilganligini tasdiqlovchi hujjat.
2. Mavjud bo‘lsa, farzandlarga oid hujjatlar.
3. Da’vo talablarini tasdiqlovchi boshqa hujjatlar.`;

  return `${data.courtName}

Da’vogar:
${data.plaintiffName}
Manzil: ${data.plaintiffAddress}
Telefon: ${data.plaintiffPhone || '________________'}

Javobgar:
${data.defendantName}
Manzil: ${data.defendantAddress || '________________'}
Ish joyi: ${data.defendantWork || '________________'}


DA’VO ARIZASI

${type}


Men, ${data.plaintiffName}, javobgar ${data.defendantName} bilan ${
    data.marriageDate
  } sanada nikohdan o‘tganman.

Nikoh ${data.marriagePlace}da qayd etilgan.
${children}

ISHNING FAKTIK HOLATLARI:

${facts}
${extra}

Yuqoridagi holatlardan kelib chiqib, suddan quyidagilarni so‘rayman:

${requestText}


DALILLAR:

${data.evidence || 'Mavjud dalillar sudga taqdim etiladi.'}


ILOVALAR:

${attachments}


Sana: __________________

Da’vogar: __________________

Imzo: __________________


ESLATMA:
Ushbu hujjat kiritilgan ma’lumotlar asosida avtomatik shakllantirilgan loyiha hisoblanadi. Sudga topshirishdan oldin sud rekvizitlari, talablar, dalillar, ilovalar, to‘lovlar va amaldagi protsessual talablar tekshirilishi lozim.`;
}

// ======================================================
// DA'VO NATIJASI
// ======================================================

function claimResultPage(text) {
  return layout(
    `
<div class="app">

${sidebar('court')}

<main>

<div class="head">
<small>SUD YO‘NALISHI / NATIJA</small>
<h1>Da’vo arizasi loyihasi tayyor</h1>
<p>Kiritilgan ma’lumotlar asosida hujjat shakllantirildi.</p>
</div>

<section class="surface">

<div style="
padding:17px 22px;
border-bottom:1px solid var(--line);
display:flex;
justify-content:space-between;
gap:10px;
align-items:center">

<strong>Da’vo arizasi</strong>

<div style="display:flex;gap:8px">
<button class="btn white" id="copyBtn">Nusxa olish</button>
<button class="btn dark" id="printBtn">Chop etish</button>
</div>

</div>

<div style="padding:25px;background:#f1f3f6">
<article class="doc" id="document">${esc(text)}</article>
</div>

</section>

<div style="margin-top:15px">
<a href="/claim" class="btn white">← Yangi ariza</a>
<a href="/court" class="btn purple">Sud yo‘nalishi</a>
</div>

</main>
</div>

<script>
(function(){

var copy=
document.getElementById('copyBtn');

var print=
document.getElementById('printBtn');

var doc=
document.getElementById('document');

copy.addEventListener(
'click',
function(){

navigator.clipboard
.writeText(doc.innerText)
.then(function(){
copy.textContent='Nusxa olindi ✓';
});

}
);

print.addEventListener(
'click',
function(){
window.print();
}
);

})();
</script>

<style>
@media print{
.nav,.side,.head,footer,.btn{display:none!important}
.app{display:block;width:100%;margin:0}
.surface{border:0;box-shadow:none}
.doc{border:0;padding:0}
}
</style>
`,
    'Da’vo arizasi'
  );
}

// ======================================================
// XATO SAHIFASI
// ======================================================

function errorPage(message) {
  return layout(
    `
<div class="wrap" style="max-width:700px;padding:70px 0">

<div class="surface pad" style="text-align:center">

<div style="
width:55px;
height:55px;
display:grid;
place-items:center;
margin:auto;
border-radius:15px;
background:#fff0f0;
color:#d44;
font-size:25px">
!
</div>

<h1 style="color:var(--navy)">Xatolik yuz berdi</h1>

<p style="color:var(--muted);line-height:1.7">
${esc(message)}
</p>

<a class="btn blue" href="/">Bosh sahifa</a>

</div>
</div>
`,
    'Xatolik'
  );
}

// ======================================================
// SERVER
// ======================================================

function send(res, html, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',

    'Cache-Control': 'no-store',
  });

  res.end(html);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));

    const path = url.pathname;

    // BOSH SAHIFA

    if (req.method === 'GET' && path === '/') {
      return send(res, homePage());
    }

    // AI

    if (req.method === 'GET' && path === '/ai') {
      return send(res, aiPage());
    }

    // SAVOL-JAVOB

    if (req.method === 'GET' && path === '/questionnaire') {
      return send(res, questionnairePage());
    }

    // SUD YO'NALISHI

    if (req.method === 'GET' && path === '/court') {
      return send(res, courtPage());
    }

    // DA'VO

    if (req.method === 'GET' && path === '/claim') {
      return send(res, claimPage());
    }

    // AI RESULT

    if (req.method === 'POST' && path === '/ai-result') {
      const body = await readBody(req);

      const question = String(body.question || '').trim();

      if (!question) {
        return send(res, errorPage('Huquqiy vaziyat kiritilmagan.'), 400);
      }

      let answer;

      try {
        answer = await callAI(question);
      } catch (error) {
        console.error('AI xatosi:', error.message);

        answer =
          'AI xizmatiga ulanishda xatolik yuz berdi.\n\n' + error.message;
      }

      return send(res, aiResultPage(question, answer));
    }

    // QUESTIONNAIRE RESULT

    if (req.method === 'POST' && path === '/questionnaire-result') {
      const body = await readBody(req);

      const question = questionnaireText(body);

      let answer;

      try {
        answer = await callAI(question);
      } catch (error) {
        console.error('AI xatosi:', error.message);

        answer =
          'AI xizmatiga ulanishda xatolik yuz berdi.\n\n' + error.message;
      }

      return send(res, aiResultPage(question, answer));
    }

    // CLAIM RESULT

    if (req.method === 'POST' && path === '/claim-result') {
      const body = await readBody(req);

      if (
        !body.claimType ||
        !body.courtName ||
        !body.plaintiffName ||
        !body.plaintiffAddress ||
        !body.defendantName ||
        !body.marriageDate ||
        !body.marriagePlace ||
        !body.divorceReason
      ) {
        return send(
          res,
          errorPage(
            'Da’vo arizasining majburiy maydonlari to‘liq kiritilmagan.'
          ),
          400
        );
      }

      const text = buildClaim(body);

      return send(res, claimResultPage(text));
    }

    // FAVICON

    if (path === '/favicon.ico') {
      res.writeHead(204);
      return res.end();
    }

    // 404

    return send(res, errorPage('Sahifa topilmadi.'), 404);
  } catch (error) {
    console.error('SERVER XATOSI:', error);

    return send(
      res,
      errorPage(error.message || 'Noma’lum server xatosi.'),
      500
    );
  }
});

// ======================================================
// ISHGA TUSHIRISH
// ======================================================

server.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('       HUQUQIY AI ISHGA TUSHDI');
  console.log('========================================');
  console.log('Manzil: http://localhost:' + PORT);
  console.log(
    'OpenRouter API: ' +
      (process.env.OPENROUTER_API_KEY ? 'ulandi ✓' : 'kalit topilmadi ✗')
  );
  console.log('----------------------------------------');
  console.log('1. AI huquqiy tahlil');
  console.log('2. Savol-javob orqali tahlil');
  console.log('3. Sud yo‘nalishi');
  console.log('   └─ Da’vo arizasi konstruktori');
  console.log('========================================');
  console.log('');
});

server.on('error', (error) => {
  console.error('SERVER XATOSI:', error);
});
