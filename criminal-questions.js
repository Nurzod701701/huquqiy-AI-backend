"use strict";
/**
 * Source-linked general criminal-law question guides.
 * No case facts are uploaded, no AI request is made, no automated accusation
 * or prediction of guilt/sentence is generated.
 */
const SOURCES=Object.freeze({
 jk:"https://lex.uz/docs/-111453",
 jpk:"https://lex.uz/docs/-111460"
});
const data={
 uz:{
  citizen:{title:"Jinoyat huquqi: savollar va huquqlar",intro:"Jabrlanuvchi, guvoh, gumon qilinuvchi yoki yaqin inson sifatida umumiy huquqiy yo‘l-yo‘riqlarni ko‘ring.",role:"Fuqarolar",questions:[
   ["Meni ichki ishlar organiga chaqirishsa nima qilaman?","Chaqiruv sababini va protsessual maqomingizni aniqlashtiring. Qachon va qayerga borishingizni tekshiring, kerak bo‘lsa advokat bilan oldindan maslahatlashing.","jpk"],
   ["Ushlab turish holatida qanday huquqlar bor?","Ushlab turishning huquqiy asosini so‘rang. Himoyachi yordami, huquqlar tushuntirilishi va protsessual hujjatlar masalasida Jinoyat-protsessual kodeksini tekshiring.","jpk"],
   ["Jabrlanuvchi sifatida qayerga murojaat qilaman?","Hodisa haqida tegishli huquqni muhofaza qiluvchi organga xabar bering. Mavjud dalillarni qonuniy saqlang va ariza qabul qilinganini tasdiqlovchi ma’lumotni oling.","jpk"],
   ["Guvoh sifatida so‘roq qilinsam nima muhim?","Protsessual maqomingizni va huquqlaringizni aniqlang. Ko‘rmagan yoki bilmagan holatni taxmin sifatida ko‘rsatmang; bayonnomani o‘qib chiqing.","jpk"],
   ["Internet firibgarligidan shikoyat qilish mumkinmi?","Tranzaksiya hujjatlari va yozishmalarni asl holida saqlang, xizmat ko‘rsatuvchi tashkilot hamda tegishli organlarga xabar bering. Jinoyat tarkibini faqat vakolatli organ belgilaydi.","jk"],
   ["Jinoyat va ma’muriy huquqbuzarlikning farqi nimada?","Aniq qilmishning huquqiy bahosi uning belgilari va amaldagi normalarga bog‘liq. Jinoyat kodeksini tekshirmasdan jinoyat deb qat’iy xulosa chiqarmang.","jk"],
   ["Advokat qachon kerak bo‘lishi mumkin?","Jinoyat ishi yuzasidan savol tug‘ilgandayoq maslahat olish mumkin. Ayniqsa ushlab turish, so‘roq va protsessual hujjat bilan tanishishdan oldin professional yordam muhim.","jpk"],
   ["Tergovchi harakatidan shikoyat qilish mumkinmi?","Protsessual qaror yoki harakat yuzasidan tegishli shikoyat tartibi va muddatlarini tekshiring. Ish raqami, qaror sanasi va mavjud hujjatlarni saqlang.","jpk"]
  ]},
  advocate:{title:"Jinoyat ishlari: advokat uchun savollar",intro:"Himoya pozitsiyasini ishlab chiqishda tekshiriladigan protsessual savollar ro‘yxati. Huquqiy xulosa yoki sud natijasini avtomatik belgilamaydi.",role:"Advokatlar",questions:[
   ["Himoya ostidagi shaxsning protsessual maqomi tasdiqlanganmi?","Maqom, hujjatlar va huquqlar tushuntirilganligini tekshiring; vaqt va qarorlarni alohida qayd qiling.","jpk"],
   ["Ushlab turish qonuniyligi qanday tekshiriladi?","Asos, vaqt, qayd etish va himoyachi ishtiroki kabi talablarni amaldagi JPK asosida alohida tekshiring.","jpk"],
   ["Dalillarning maqbulligini qanday baholash kerak?","Olish manbasi va tartibi, protsessual rasmiylashtirish hamda ehtimoliy buzilishlarni alohida tekshiring. Dalilni faqat algoritm bilan nomaqbul deb e’lon qilmang.","jpk"],
   ["Jinoyat tarkibi qanday aniqlanadi?","Qilmishning obyektiv va subyektiv belgilari, ayb shakli, subyekt va vaqt bo‘yicha amal qiluvchi JK tahririni alohida tahlil qiling.","jk"],
   ["Kvalifikatsiya bo‘yicha qaysi savollar muhim?","JK normasining dispozitsiyasi, zarur elementlari, boshqa normalar bilan chegaralanishi va faktik dalillar mosligini hujjatlashtiring.","jk"],
   ["Himoya iltimosnomasi uchun qanday asoslar kerak?","So‘ralayotgan protsessual harakat, uning ish uchun ahamiyati va dalillarga aloqasini ko‘rsating; tegishli JPK tartibini tekshiring.","jpk"],
   ["Ehtiyot chorasi ustidan qanday ishlanadi?","Asoslantirish, muqobil choralar, muddatlar va shikoyat tartibini JPKning amaldagi tahririda tekshiring.","jpk"],
   ["Apellyatsiyaga tayyorgarlikda nimalar tekshiriladi?","Hukm va bayonnomalar, protsessual muddatlar, dalillar bahosi hamda aniq e’tirozlarni tekshirib, tegishli JPK tartibiga tayangan holda hujjat tuzing.","jpk"]
  ]}
 },
 ru:{
  citizen:{title:"Уголовное право: вопросы и права",intro:"Общая информация для потерпевших, свидетелей, подозреваемых и их близких.",role:"Граждане",questions:[
   ["Что делать, если меня вызывают в орган внутренних дел?","Уточните основание вызова и процессуальный статус, проверьте дату и место, при необходимости заранее обратитесь к адвокату.","jpk"],
   ["Какие права существуют при задержании?","Уточните основания задержания и правила разъяснения прав, оформления документов и участия защитника.","jpk"],
   ["Куда обращаться потерпевшему?","Сообщите о происшествии компетентному органу, законно сохраните доказательства и подтверждение регистрации обращения.","jpk"],
   ["Что важно при допросе свидетеля?","Уточните статус и права, не выдавайте предположения за известные факты, внимательно прочитайте протокол.","jpk"],
   ["Как сообщить об интернет-мошенничестве?","Сохраните переписку и платежные документы, обратитесь в организацию платежа и компетентные органы. Состав преступления устанавливают уполномоченные лица.","jk"],
   ["Чем преступление отличается от административного правонарушения?","Квалификация зависит от обстоятельств и действующих норм. Не делайте окончательный вывод без проверки закона.","jk"],
   ["Когда стоит обратиться к адвокату?","За советом можно обратиться при возникновении вопроса; особенно важно до допроса и подписания процессуальных документов.","jpk"],
   ["Можно ли жаловаться на действия следователя?","Проверьте порядок и сроки обжалования, сохраните дату и копии решений и документов.","jpk"]
  ]},
  advocate:{title:"Уголовные дела: вопросы адвоката",intro:"Контрольные вопросы для правовой проверки, а не автоматическая оценка виновности.",role:"Адвокаты",questions:[
   ["Установлен ли процессуальный статус подзащитного?","Проверьте решения, разъяснение прав, даты и процессуальные основания.","jpk"],
   ["Как проверить законность задержания?","Проверьте основания, время, регистрацию и участие защитника по действующему УПК.","jpk"],
   ["Как проверить допустимость доказательств?","Оцените происхождение, порядок получения, оформление и возможные процессуальные нарушения.","jpk"],
   ["Какие элементы состава преступления существенны?","Разберите признаки деяния, форму вины, субъект и редакцию УК, действовавшую в релевантное время.","jk"],
   ["Как анализировать квалификацию?","Сопоставьте элементы статьи УК с доказанными фактами и разграничением смежных составов.","jk"],
   ["Что включать в ходатайство?","Укажите действие, его значение для дела, связь с доказательствами и применимую процедуру УПК.","jpk"],
   ["Как проверить меру пресечения?","Проверьте основания, альтернативы, сроки и порядок обжалования по УПК.","jpk"],
   ["Что важно для апелляции?","Проверьте решение, протоколы, сроки, оценку доказательств и конкретные доводы жалобы.","jpk"]
  ]}
 },
 en:{
  citizen:{title:"Criminal law: questions and rights",intro:"General guidance for victims, witnesses, suspects and family members.",role:"Citizens",questions:[
   ["What if law enforcement summons me?","Clarify the reason, your procedural status, the time and place, and seek a lawyer where appropriate.","jpk"],
   ["What rights matter during detention?","Ask about the legal grounds, procedural records, explanation of rights and access to defence counsel.","jpk"],
   ["How can a victim report an incident?","Contact the competent authority, preserve available evidence lawfully and retain confirmation of your report.","jpk"],
   ["What should a witness remember?","Clarify your rights and status; distinguish direct knowledge from assumptions and review the record carefully.","jpk"],
   ["What if I encounter online fraud?","Preserve messages and transaction records, notify relevant providers and authorities. Only competent bodies determine criminal qualification.","jk"],
   ["Crime or administrative offence?","The classification depends on the facts and applicable law; do not assume an offence is criminal without verification.","jk"],
   ["When should I consult a lawyer?","Seek advice early, particularly before questioning or signing procedural documents.","jpk"],
   ["Can an investigator's action be challenged?","Check the applicable appeal procedure and deadlines; preserve copies and dates of documents.","jpk"]
  ]},
  advocate:{title:"Criminal cases: advocate checklist",intro:"Source-linked review questions, not an automated verdict or defence opinion.",role:"Advocates",questions:[
   ["Is the client's procedural status confirmed?","Check decisions, notice of rights, dates and grounds.","jpk"],
   ["Was detention lawful?","Review grounds, timing, recordkeeping and counsel access against the applicable procedure.","jpk"],
   ["Is evidence admissible?","Review its source, collection method, documentation and any procedural defects.","jpk"],
   ["Which elements of the offence matter?","Assess conduct, fault, subject and the Criminal Code version applicable to the events.","jk"],
   ["How should legal classification be checked?","Compare the statutory elements, available evidence and neighbouring offences.","jk"],
   ["What should a procedural motion include?","Identify the requested action, relevance to the case and legal grounds.","jpk"],
   ["How should pretrial restrictions be reviewed?","Check the grounds, alternatives, deadlines and available challenges.","jpk"],
   ["What should be reviewed for appeal?","Check judgments, records, deadlines, evidence assessment and specific objections.","jpk"]
  ]}
 }
};
const ui={
 uz:{back:"Bo‘limga qaytish",sources:"Rasmiy qonunchilik",jk:"Jinoyat kodeksi",jpk:"Jinoyat-protsessual kodeksi",source:"Manbani ko‘rish",notice:"Bu umumiy ma’lumot. Ishning faktlari, qonunning tegishli sanada amalda bo‘lgan tahriri va protsessual maqomni advokat bilan tekshiring. Hech qanday javob aybdorlikni yoki jazoni aniqlamaydi.",warning:"Maxfiy ish ma’lumotlarini bu bo‘limga kiritish talab qilinmaydi.",count:"ta asosiy savol"},
 ru:{back:"Вернуться в раздел",sources:"Официальные законы",jk:"Уголовный кодекс",jpk:"Уголовно-процессуальный кодекс",source:"Открыть источник",notice:"Это общая информация. Факты дела, редакцию закона на нужную дату и процессуальный статус следует проверять с адвокатом. Ответы не устанавливают виновность или наказание.",warning:"Не требуется вводить конфиденциальные материалы дела.",count:"основных вопросов"},
 en:{back:"Back to section",sources:"Official legal sources",jk:"Criminal Code",jpk:"Criminal Procedure Code",source:"View source",notice:"General information only. Verify the facts, the applicable dated law and procedural status with qualified counsel. No answer determines guilt or sentence.",warning:"No confidential case information is requested.",count:"core questions"}
};
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const HELP={
 uz:{citizen:{heading:"Vaziyatingizni 3 qadamda tushuning",steps:[["1. Maqomingizni aniqlang","Siz guvohmisiz, jabrlanuvchimisiz yoki gumon qilinuvchimisiz? Rasmiy hujjatdagi maqomni tekshiring."],["2. Hujjat va sanalarni saqlang","Chaqiruv, bayonnoma yoki qarorning sanasi va nusxasini qonuniy tartibda saqlang."],["3. Keyingi qadamni belgilang","O‘zingizga mos savolni oching, rasmiy kodeksni tekshiring va zarur bo‘lsa advokatga murojaat qiling."]],answer:"Oddiy tushuntirish",verify:"Rasmiy JK/JPK hujjatidan tegishli modda va amaldagi tahrirni tekshiring.",prompt:"Quyidagi savollardan sizga mosini oching"},
 advocate:{heading:"Jinoyat ishini 3 bosqichda tekshiring",steps:[["1. Protsessual holat","Maqom, tergov bosqichi, himoyachi vakolati, qaror sanasi va muddatlarni qayd eting."],["2. Fakt va dalillar","Ayblov elementlarini har bir dalil manbasi, olish tartibi va protsessual hujjatlar bilan solishtiring."],["3. Himoya harakati","JK/JPKning tegishli sanadagi tahririni tekshirib, asoslangan iltimosnoma yoki e’tiroz tayyorlang."]],answer:"Professional tekshiruv mezoni",verify:"Normaning modda, qism, bandi va ish sanasiga mos tahririni tasdiqlang.",prompt:"Quyidagi tekshiruv savollaridan boshlang"}},
 ru:{citizen:{heading:"Разберитесь в ситуации за 3 шага",steps:[["1. Уточните статус","Проверьте, указаны ли вы как свидетель, потерпевший или подозреваемый."],["2. Сохраните документы и даты","Проверьте дату вызова, протокола или решения, законно сохраните копии."],["3. Выберите следующий шаг","Откройте подходящий вопрос, проверьте официальный кодекс и при необходимости обратитесь к адвокату."]],answer:"Простое объяснение",verify:"Проверьте точную статью и применимую редакцию УК/УПК.",prompt:"Выберите подходящий вопрос"},
 advocate:{heading:"Проверьте уголовное дело за 3 шага",steps:[["1. Процессуальный статус","Проверьте решения, сроки, стадию производства и полномочия защитника."],["2. Факты и доказательства","Сопоставьте элементы обвинения с происхождением и оформлением каждого доказательства."],["3. Позиция защиты","Проверьте редакцию УК/УПК, сроки и подготовьте обоснованное ходатайство или возражение."]],answer:"Критерии профессиональной проверки",verify:"Сверьте статью, часть, пункт и редакцию на нужную дату.",prompt:"Начните с контрольных вопросов"}},
 en:{citizen:{heading:"Understand your situation in 3 steps",steps:[["1. Check your status","Confirm whether you are a witness, victim or suspect in official records."],["2. Keep records and dates","Review the summons, interview record or decision date, and preserve copies lawfully."],["3. Choose your next step","Open a relevant question, check the official code and contact a lawyer where needed."]],answer:"Plain-language explanation",verify:"Check the exact article and applicable version in the official code.",prompt:"Open a relevant question"},
 advocate:{heading:"Review a criminal case in 3 steps",steps:[["1. Procedural status","Confirm legal status, counsel authority, decision dates and procedural deadlines."],["2. Facts and evidence","Match elements of the alleged offence against evidence origins and collection records."],["3. Defence action","Check applicable Criminal and Procedure Code versions before preparing a motion or objection."]],answer:"Professional review criteria",verify:"Check the exact article, paragraph and applicable dated version.",prompt:"Start with a review question"}}
};
function criminalQuestionsPage(lang="uz",role="citizen"){
 lang=Object.hasOwn(data,lang)?lang:"uz";
 role=role==="advocate"?"advocate":"citizen";
 const t=data[lang][role], u=ui[lang],q="?lang="+lang;
 const help=HELP[lang][role];
 const steps=help.steps.map(x=>'<li class="guideStep"><strong>'+esc(x[0])+'</strong><span>'+esc(x[1])+'</span></li>').join("");
 const guide='<section class="quickGuide" aria-label="'+esc(help.heading)+'"><h2>'+esc(help.heading)+'</h2><ol class="guideSteps">'+steps+'</ol><p class="guidePrompt">'+esc(help.prompt)+' ↓</p></section>';
 const back=role==="advocate"?"/advokat-pro":"/fuqarolar";
 const cards=t.questions.map((item,i)=>{
   const law=item[2];
   return '<details class="qa"><summary><span class="num">'+String(i+1).padStart(2,"0")+'</span><span>'+esc(item[0])+'</span></summary><div class="answer"><strong class="answerLabel">'+esc(help.answer)+'</strong><p>'+esc(item[1])+'</p><a target="_blank" rel="noopener noreferrer" href="'+SOURCES[law]+'">'+esc(u[law])+' ↗</a><p class="sourceHint">'+esc(help.verify)+'</p></div></details>';
 }).join("");
 const css=':root{--navy:#06111f;--gold:#c9a86a;--ink:#173349}*{box-sizing:border-box}body{margin:0;background:#f4f6f8;color:var(--ink);font-family:Inter,system-ui,Arial,sans-serif}a{color:inherit}a:focus-visible,summary:focus-visible{outline:3px solid var(--gold);outline-offset:3px}.top{background:#06111f;color:#fff;padding:18px 20px}.topin,.wrap{max-width:1050px;margin:auto}.topin{display:flex;justify-content:space-between;align-items:center;gap:15px;flex-wrap:wrap}.brand{font-weight:800;color:#f0d69b;text-decoration:none;letter-spacing:.07em}.links{display:flex;gap:12px;flex-wrap:wrap}.links a{color:#e2edf4;font-size:13px}.hero{background:linear-gradient(130deg,#06111f,#163c56);color:white;padding:58px 20px 64px}.hero h1{font:normal clamp(32px,5vw,52px) Georgia,serif;max-width:860px;margin:12px 0}.hero p{color:#dbe7ee;max-width:780px;line-height:1.7}.eyebrow{color:#e4c88a;font-size:12px;font-weight:750;letter-spacing:.1em;text-transform:uppercase}.main{padding:38px 20px 64px}.muted{color:#5f7384;line-height:1.65}.qa{background:white;border:1px solid #dfe6ea;border-radius:13px;margin:12px 0;overflow:hidden}.qa[open]{border-color:#c7ac7b;box-shadow:0 10px 28px #06111f0c}.qa summary{list-style:none;display:flex;align-items:center;gap:17px;padding:19px;cursor:pointer;font-weight:750}.qa summary::-webkit-details-marker{display:none}.qa summary:after{content:"+";margin-left:auto;font-size:23px;color:#9a793e}.qa[open] summary:after{content:"−"}.num{color:#a27d44;font-size:12px;flex-shrink:0}.answer{padding:0 22px 22px 55px}.answer p{line-height:1.7;margin:0 0 15px}.answer a,.sources a{color:#175783;font-weight:750}.sources{margin-top:25px;padding:24px;background:#fff;border:1px solid #dfe6ea;border-radius:14px}.sources a{display:inline-block;margin:9px 20px 3px 0}.notice{background:#f7eddc;padding:20px;border:1px solid #e6cf9f;border-radius:12px;line-height:1.6;margin-top:23px}footer{text-align:center;padding:25px;background:#06111f;color:#abc1d0;font-size:12px}.quickGuide{background:#fff;border:1px solid #dce5ea;border-radius:14px;padding:23px;margin-bottom:22px;box-shadow:0 9px 28px #071f2c0a}.quickGuide h2{font:normal clamp(22px,3vw,29px) Georgia,serif;margin:0 0 18px;color:#0b2d44}.guideSteps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));list-style:none;gap:13px;margin:0;padding:0}.guideStep{border-left:3px solid #c9a86a;background:#f3f7f8;padding:13px;border-radius:0 9px 9px 0;min-width:0;overflow-wrap:anywhere}.guideStep strong{display:block;font-size:14px;color:#153c53;margin-bottom:8px}.guideStep span{display:block;font-size:13px;line-height:1.7;color:#536b7b}.guidePrompt{font-weight:750;font-size:13px;color:#215371;margin:17px 0 0}.answerLabel{display:block;margin:3px 0 8px;color:#133c59}.sourceHint{font-size:12px;line-height:1.6;color:#5d7080;margin-top:10px!important}.qa summary{min-height:52px}@media(max-width:750px){.guideSteps{grid-template-columns:1fr}}@media(max-width:600px){.quickGuide{padding:17px}.hero{padding:42px 18px}.main{padding:24px 15px 45px}.qa summary{padding:17px 14px;gap:12px}.answer{padding:0 16px 18px 40px}}';
 return '<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#06111f"><title>VERIUS — '+esc(t.title)+'</title><style>'+css+'</style></head><body>'+
 '<header class="top"><div class="topin"><a class="brand" href="'+back+q+'">§ VERIUS</a><div class="links"><a href="'+back+q+'">← '+esc(u.back)+'</a><a href="'+(role==="advocate"?"/criminal":"/advokat-pro/criminal")+q+'">'+(role==="advocate"?(lang==="ru"?"Граждане":lang==="en"?"Citizens":"Fuqarolar"):(lang==="ru"?"Адвокатам":lang==="en"?"Advocates":"Advokatlar"))+'</a>'+["uz","ru","en"].map(l=>'<a href="'+(role==="advocate"?"/advokat-pro/criminal":"/criminal")+'?lang='+l+'"'+(lang===l?' aria-current="page"':'')+'>'+l.toUpperCase()+'</a>').join("")+'</div></div></header>'+
 '<section class="hero"><div class="wrap"><div class="eyebrow">VERIUS · '+esc(t.role)+'</div><h1>'+esc(t.title)+'</h1><p>'+esc(t.intro)+'</p></div></section>'+
 '<main class="main"><div class="wrap">'+guide+'<div class="notice" style="margin:0 0 18px;background:#f0f5f8;border-color:#bed5e4;color:#183749"><strong>'+ (role==='advocate'?(lang==='ru'?'Профессиональный разбор уголовного дела':lang==='en'?'Criminal case professional workbench':'Jinoyat ishi bo‘yicha professional tahlil'):(lang==='ru'?'Подбор рекомендаций по ситуации':lang==='en'?'Situation-based legal guidance':'Vaziyat bo‘yicha tavsiya olish')) +'</strong><p>'+ (role==='advocate'?(lang==='ru'?'Проверяйте доказательства, квалификацию, процессуальные документы и сроки в отдельном рабочем кабинете.':lang==='en'?'Review evidence, legal classification, procedure and deadlines with dedicated professional tools.':'Dalillar, kvalifikatsiya, protsessual hujjatlar va muddatlarni professional ish markazida tekshiring.'):(lang==='ru'?'Выберите ситуацию и получите шаги с проверенными статьями УК и УПК.':lang==='en'?'Choose a situation for practical steps linked to the Criminal and Criminal Procedure Codes.':'Vaziyatingizni tanlang: tizim nima qilish kerakligini va tegishli JK/JPK moddalarini ko‘rsatadi.')) +'</p><a class="advisor-link" style="display:inline-block;padding:12px 16px;background:#123e5c;color:white;text-decoration:none;border-radius:9px;font-weight:750" href="'+(role==='advocate'?'/advokat-pro/criminal/workbench':'/criminal/advisor')+q+'">'+(role==='advocate'?(lang==='ru'?'Открыть рабочий кабинет':lang==='en'?'Open professional workbench':'Ish markazini ochish'):(lang==='ru'?'Открыть помощник':lang==='en'?'Open situation guide':'Vaziyat yordamchisini ochish'))+' →</a></div><p class="muted">'+t.questions.length+' '+esc(u.count)+'. '+esc(u.warning)+'</p>'+cards+
 '<section class="sources"><strong>'+esc(u.sources)+'</strong><div><a href="'+SOURCES.jk+'" target="_blank" rel="noopener noreferrer">'+esc(u.jk)+' ↗</a><a href="'+SOURCES.jpk+'" target="_blank" rel="noopener noreferrer">'+esc(u.jpk)+' ↗</a></div></section><div class="notice">'+esc(u.notice)+'</div></div></main><footer>© VERIUS</footer></body></html>';
}
module.exports={criminalQuestionsPage,SOURCES};
