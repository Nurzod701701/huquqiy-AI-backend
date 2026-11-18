"use strict";
// Navigation hub for the existing authenticated VERIUS account.
// Never reads another user's data; the caller selects its own workspace by session user.id.
const words={
  uz:{heading:"Butun VERIUS — bitta kabinet",sub:"Fuqarolar va Advokat PRO, AI hamda hujjatlar uchun yagona kirish nuqtasi.",all:"Barcha modullar",citizen:"Fuqarolar",citizenDesc:"Fuqarolar uchun mavjud huquqiy xizmatlar.",advocate:"Advokat PRO",advocateDesc:"Professional hujjatlar, ishlar va kalendar.",ai:"AI yordamchi",aiDesc:"Savollar va saqlangan AI suhbatlariga qaytish.",docs:"Hujjatlar",docsDesc:"Hujjat yaratish va shaxsiy tarix.",saved:"Saqlangan Advokat PRO ishlari",tasks:"Kalendar vazifalari",account:"Sizning hisobingiz",advNotice:"Shaxsiy kabinetda faqat ushbu login bilan saqlangan anonim ish kodlari ko‘rsatiladi. Advokat maqomi avtomatik tasdiqlanmaydi.",openCases:"Advokat ishlarini ochish",openCalendar:"Kalendarni ochish",notes:"Avvalgi Fuqarolar ma’lumotlari o‘zgarmaydi. Advokatning brauzerda saqlangan mahalliy hujjatlari avtomatik serverga ko‘chirilmaydi."},
  ru:{heading:"Весь VERIUS — один кабинет",sub:"Единый вход для граждан, адвокатов, AI и документов.",all:"Все модули",citizen:"Гражданам",citizenDesc:"Доступные юридические услуги для граждан.",advocate:"Адвокат PRO",advocateDesc:"Документы, дела и календарь.",ai:"AI-помощник",aiDesc:"Вопросы и история чатов.",docs:"Документы",docsDesc:"Создание документов и история.",saved:"Сохранённые дела Адвокат PRO",tasks:"Задачи календаря",account:"Ваш аккаунт",advNotice:"Показаны только обезличенные дела текущего аккаунта. Статус адвоката не подтверждается автоматически.",openCases:"Открыть дела",openCalendar:"Открыть календарь",notes:"Данные раздела граждан сохранены. Локальные документы браузера не переносятся автоматически."},
  en:{heading:"One account for all VERIUS",sub:"Your gateway to Citizens, Advocate PRO, AI and documents.",all:"All modules",citizen:"Citizens",citizenDesc:"Existing services for citizens.",advocate:"Advocate PRO",advocateDesc:"Professional documents, matters and calendar.",ai:"AI assistant",aiDesc:"Questions and saved AI conversations.",docs:"Documents",docsDesc:"Create documents and review history.",saved:"Saved Advocate PRO matters",tasks:"Calendar tasks",account:"Your account",advNotice:"Only anonymized matters saved under this signed-in account appear here. Advocate status is not automatically verified.",openCases:"Open matters",openCalendar:"Open calendar",notes:"Existing Citizens data is preserved. Browser-local documents do not automatically migrate to the server."}
};
function escapeHtml(value){return String(value==null?"":value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function langOf(lang){return ["uz","ru","en"].includes(lang)?lang:"uz";}
function card(icon,title,desc,link){
  return '<a class="accountCard" href="'+escapeHtml(link)+'" style="display:block;text-decoration:none;min-height:148px;transition:border-color .2s"><span aria-hidden="true" style="font-size:24px;color:#b99254">'+escapeHtml(icon)+'</span><h3 style="margin:10px 0 7px">'+escapeHtml(title)+'</h3><p class="accountMuted" style="margin:0">'+escapeHtml(desc)+'</p></a>';
}
function directory(lang){
  lang=langOf(lang);const t=words[lang],q="?lang="+lang;
  return '<section class="accountPanel" id="verius-platform-hub"><h2>'+escapeHtml(t.heading)+'</h2><p class="accountMuted">'+escapeHtml(t.sub)+'</p><div class="accountCards">'
   +card("⌂",t.citizen,t.citizenDesc,"/fuqarolar"+q)
   +card("⚖",t.advocate,t.advocateDesc,"/advokat-pro"+q)
   +card("✦",t.ai,t.aiDesc,"/ai"+q)
   +card("▤",t.docs,t.docsDesc,"/account/documents"+q)
   +'</div><p class="accountMuted" style="margin-top:16px">'+escapeHtml(t.notes)+'</p></section>';
}
function counts(workspace){
 const data=workspace&&typeof workspace==="object"?workspace:{};
 const cases=Array.isArray(data.cases)?data.cases:[];
 const tasks=Array.isArray(data.tasks)?data.tasks:[];
 return {cases:cases.length,tasks:tasks.length};
}
function advocate(lang,workspace){
 lang=langOf(lang);const t=words[lang],c=counts(workspace),q="?lang="+lang;
 return '<section class="accountPanel" id="verius-advocate-account"><h2>'+escapeHtml(t.advocate)+'</h2><p class="accountMuted">'+escapeHtml(t.advNotice)+'</p>'
 +'<div class="accountStats"><div class="accountStat"><strong>'+c.cases+'</strong><span>'+escapeHtml(t.saved)+'</span></div><div class="accountStat"><strong>'+c.tasks+'</strong><span>'+escapeHtml(t.tasks)+'</span></div></div>'
 +'<div class="accountActions" style="margin-top:16px"><a class="accountButton gold" href="/advokat-pro/cases'+q+'">'+escapeHtml(t.openCases)+'</a><a class="accountButton" href="/advokat-pro/calendar'+q+'">'+escapeHtml(t.openCalendar)+'</a><a class="accountButton light" href="/advokat-pro'+q+'">'+escapeHtml(t.advocate)+'</a></div></section>';
}
function home(lang,workspace){return directory(lang)+advocate(lang,workspace);}
module.exports={directory,advocate,home,counts};
