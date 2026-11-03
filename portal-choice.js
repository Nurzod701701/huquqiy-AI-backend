"use strict";
// This entry page is independent; no changes to the original citizen page.
module.exports=function portalChoicePage(lang){
  lang=["uz","ru","en"].includes(lang)?lang:"uz";
  const translations={
    uz:["Yagona huquqiy platforma","QOMUSga xush kelibsiz","Sizga mos bo‘limni tanlang","Fuqarolar uchun","Hozirgi QOMUS: maslahatlar, kalkulyatorlar, hujjatlar va mavjud xizmatlar.","Advokatlar uchun","Advokat PRO: hujjatlar markazi, da’vo arizalari va professional ish muhiti.","Bo‘limga kirish"],
    ru:["Единая правовая платформа","Добро пожаловать в QOMUS","Выберите подходящий раздел","Для граждан","Привычный QOMUS: консультации, калькуляторы, документы и действующие услуги.","Для адвокатов","Advokat PRO: центр документов, исковые заявления и рабочие инструменты.","Перейти в раздел"],
    en:["Unified legal platform","Welcome to QOMUS","Choose your workspace","For citizens","Original QOMUS: legal advice, calculators, documents and existing services.","For advocates","Advokat PRO: document center, legal claims and professional tools.","Enter section"]
  };
  const t=translations[lang],esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  const q="?lang="+encodeURIComponent(lang);
  const css=[
    "*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at 15% 8%,#e3eef5,transparent 42%),#f3f6f8;color:#122d44;font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif}",
    ".top{max-width:1120px;margin:auto;padding:24px;display:flex;align-items:center;justify-content:space-between;gap:12px}.logo{font-size:25px;font-weight:850;letter-spacing:.08em}.logo i{font-style:normal;background:#122d44;color:#e8c77c;padding:9px 14px;border-radius:12px;margin-right:10px}",
    ".languages{display:flex;gap:6px}.languages a{padding:8px 11px;background:#fff;border:1px solid #d7e0e6;border-radius:9px;text-decoration:none;color:#536e82;font-weight:700;font-size:12px}.languages a[aria-current=page]{background:#122d44;color:#fff}",
    "main{max-width:1120px;margin:auto;padding:50px 24px 80px}.intro{text-align:center;margin:0 auto 38px;max-width:740px}.tag{color:#9d793e;font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase}h1{font-family:Georgia,serif;font-size:clamp(34px,5vw,56px);margin:13px 0;line-height:1.13;letter-spacing:-.04em}.intro p{color:#617a89;font-size:17px;line-height:1.6}",
    ".choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}.choice{display:flex;flex-direction:column;min-height:340px;position:relative;overflow:hidden;text-decoration:none;color:#122d44;background:#fff;border:1px solid #dce5eb;border-radius:23px;padding:33px;box-shadow:0 16px 40px #19394b12;transition:transform .18s,box-shadow .18s}.choice:hover,.choice:focus-visible{transform:translateY(-4px);box-shadow:0 20px 54px #19394b2b;outline:3px solid #d8b573;outline-offset:2px}.choice:before{content:'';position:absolute;right:-80px;top:-95px;width:230px;height:230px;border-radius:50%;background:#e9f0f5}",
    ".mark{position:relative;display:grid;place-items:center;width:68px;height:68px;border-radius:17px;background:#e8f0f5;font:32px Georgia,serif;margin-bottom:24px}.adv .mark{background:#14334e;color:#e8c77c}.choice h2{position:relative;font-size:26px;margin:0 0 12px}.choice p{position:relative;color:#657d8b;font-size:15px;line-height:1.7;margin:0 0 24px}.cta{position:relative;margin-top:auto;background:#edf3f7;border-radius:12px;padding:15px 17px;font-size:14px;font-weight:800;display:flex;justify-content:space-between}.adv .cta{background:#14334e;color:#fff}.foot{text-align:center;color:#7b8d9a;font-size:12px;padding:0 15px 24px}",
    "@media(max-width:720px){.choices{grid-template-columns:1fr;gap:16px}.choice{min-height:260px;padding:24px}.mark{margin-bottom:15px}main{padding:30px 18px 55px}.top{padding:18px}.intro p{font-size:15px}}@media(prefers-reduced-motion:reduce){.choice{transition:none}.choice:hover{transform:none}}"
  ].join("");
  const card=(kind,label,desc,href,symbol)=>'<a class="choice '+kind+'" href="'+href+'"><span class="mark" aria-hidden="true">'+symbol+'</span><h2>'+esc(label)+'</h2><p>'+esc(desc)+'</p><span class="cta">'+esc(t[7])+' <span aria-hidden="true">→</span></span></a>';
  const langs=["uz","ru","en"].map(x=>'<a href="/?lang='+x+'"'+(lang===x?' aria-current="page"':'')+'>'+x.toUpperCase()+'</a>').join("");
  return '<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#122d44"><title>QOMUS — '+esc(t[0])+'</title><style>'+css+'</style></head><body>'+
    '<header class="top"><div class="logo"><i>§</i>QOMUS</div><nav class="languages" aria-label="Language">'+langs+'</nav></header>'+
    '<main><div class="intro"><div class="tag">'+esc(t[0])+'</div><h1>'+esc(t[1])+'</h1><p>'+esc(t[2])+'</p></div><section class="choices" aria-label="'+esc(t[2])+'">'+
    card("citizen",t[3],t[4],"/fuqarolar"+q,"♧")+card("adv",t[5],t[6],"/advokat-pro"+q,"§")+
    '</section></main><footer class="foot">© QOMUS</footer></body></html>';
};