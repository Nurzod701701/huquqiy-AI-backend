"use strict";
const PAGES=[
 ["/advokat-pro",["Bosh sahifa","Главная","Overview"]],
 ["/advokat-pro/documents",["Hujjatlar","Документы","Documents"]],
 ["/advokat-pro/cases",["Ishlar","Дела","Matters"]],
 ["/advokat-pro/calendar",["Kalendar","Календарь","Calendar"]],
 ["/advokat-pro/check",["Ekspertiza","Экспертиза","Review"]],
 ["/advokat-pro/grounded",["Manbali tahlil","Анализ норм","Source review"]],
 ["/advokat-pro/court-practice",["Sud amaliyoti","Судебная практика","Court practice"]],
 ["/advokat-pro/criminal/workbench",["Jinoyat ishlari","Уголовные дела","Criminal work"]]
];
const EXTRA_ROUTES=new Set(["/advokat-pro/criminal/evidence-review","/advokat-pro/criminal/draft","/advokat-pro/criminal/advisor","/advokat-pro/criminal"]);
const labels={
 uz:{nav:"Advokat PRO bo‘limlari",lang:"Til",account:"Shaxsiy kabinet"},
 ru:{nav:"Разделы Адвокат PRO",lang:"Язык",account:"Личный кабинет"},
 en:{nav:"Advocate PRO sections",lang:"Language",account:"Personal account"}
};
const css=".apUnifiedNav,.apUnifiedNav *{box-sizing:border-box}.apUnifiedNav{position:sticky;top:0;z-index:95;width:100%;background:#fff;border-bottom:1px solid #d8e3e8;box-shadow:0 5px 22px rgba(6,24,41,.065);font:700 13px/1.4 Inter,system-ui,\"Segoe UI\",sans-serif;color:#1b3d54}.apUnifiedNavInner{max-width:1450px;margin:auto;padding:9px 22px;display:flex;align-items:center;gap:14px;min-width:0}.apNavScroll{display:flex;flex:1 1 auto;min-width:0;align-items:center;gap:5px;overflow-x:auto;overscroll-behavior-inline:contain;scrollbar-width:thin;scrollbar-color:#bfccda transparent;padding:4px 0;-webkit-overflow-scrolling:touch}.apUnifiedNav a{color:inherit;text-decoration:none}.apUnifiedNav .apNavLink{flex:none;display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 13px;border:1px solid transparent;border-radius:10px;white-space:nowrap;font-weight:750}.apUnifiedNav .apNavLink:hover{background:#eef3f5;border-color:#d9e3e7}.apUnifiedNav .apNavLink[aria-current=\"page\"]{background:#0c2d49;color:#fff;border-color:#0c2d49;box-shadow:inset 0 -2px 0 #c8a366}.apNavTools{flex:none;display:flex;align-items:center;gap:10px}.apNavLanguages{display:flex;align-items:center;gap:2px;border:1px solid #dbe3e7;border-radius:10px;padding:3px;background:#f7f9fa}.apNavLanguages a{display:inline-flex;align-items:center;justify-content:center;min-width:34px;min-height:36px;padding:4px 5px;border-radius:7px;color:#29485f}.apNavLanguages a[aria-current=\"page\"]{color:#fff;background:#133a55}.apUnifiedNav .apNavAccount{min-height:44px;display:inline-flex;align-items:center;justify-content:center;border:1px solid #bc9659;background:#f3e2bb;color:#142b3b;padding:9px 12px;border-radius:10px;white-space:nowrap;font-weight:850}.apUnifiedNav a:focus-visible{outline:3px solid #a8752e;outline-offset:2px}body:has(.apUnifiedNav){overflow-x:clip}body:has(.apUnifiedNav) :where(input,textarea,select):not([type=checkbox]):not([type=radio]):not([type=hidden]){max-width:100%;min-width:0;box-sizing:border-box}body:has(.apUnifiedNav) :where(input,textarea,select,button,a):focus-visible{outline:3px solid #b98c4b;outline-offset:3px}body:has(.apUnifiedNav) :where(button,.btn,.actions a,.fileLabel){touch-action:manipulation}body:has(.apUnifiedNav) :where(.panel,.card) :where(p,li,small){overflow-wrap:anywhere}body:has(.apUnifiedNav) :where(.panel,.card) :where(button,.btn){min-height:44px}body:has(.apUnifiedNav) :where(.panel,.card) textarea{line-height:1.65}body:has(.apUnifiedNav) :where(button:disabled){cursor:not-allowed;opacity:.55}@media(max-width:1080px){.apUnifiedNavInner{flex-wrap:wrap;padding:9px 16px;gap:7px}.apNavScroll{flex-basis:100%;order:2}.apNavTools{order:1;width:100%;justify-content:flex-end}.apUnifiedNav{position:relative}}@media(max-width:650px){.apUnifiedNavInner{padding:8px 12px;gap:7px}.apNavScroll{margin-inline:-2px;padding:3px 2px 7px}.apUnifiedNav .apNavLink{min-height:44px;padding:9px 12px}.apNavTools{justify-content:space-between}.apUnifiedNav .apNavAccount{padding:8px 10px}.apNavLanguages a{min-width:32px;min-height:36px}body:has(.apUnifiedNav) :where(.actions,.buttons,.ap-buttons){max-width:100%;flex-wrap:wrap}body:has(.apUnifiedNav) :where(.actions,.buttons,.ap-buttons) :where(button,.btn){min-height:44px}}@media(hover:none),(pointer:coarse){.apUnifiedNav .apNavLink:hover{background:transparent;border-color:transparent}.apUnifiedNav .apNavLink[aria-current=\"page\"]:hover{background:#0c2d49;border-color:#0c2d49}}@media(prefers-reduced-motion:reduce){.apUnifiedNav *,body:has(.apUnifiedNav) :where(button,a){transition:none!important}}";
function clean(lang){return ["uz","ru","en"].includes(lang)?lang:"uz"}
function nav(lang,pathname,{includeLanguages=true,includeAccount=true}={}){
 lang=clean(lang);
 const t=labels[lang],index=["uz","ru","en"].indexOf(lang);
 const links=PAGES.map(([url,names])=>'<a class="apNavLink" href="'+url+'?lang='+lang+'"'+((pathname===url||(url==="/advokat-pro/criminal/workbench"&&pathname.startsWith("/advokat-pro/criminal/")))?' aria-current="page"':'')+'>'+names[index]+'</a>').join("");
 const languages=["uz","ru","en"].map(l=>'<a href="'+pathname+'?lang='+l+'" lang="'+l+'"'+(lang===l?' aria-current="page"':'')+'>'+l.toUpperCase()+'</a>').join("");
 return '<nav class="apUnifiedNav" aria-label="'+t.nav+'"><div class="apUnifiedNavInner"><div class="apNavScroll" role="group" aria-label="'+t.nav+'">'+links+'</div><div class="apNavTools">'+
 (includeLanguages?'<div class="apNavLanguages" role="group" aria-label="'+t.lang+'">'+languages+'</div>':'')+
 (includeAccount?'<a class="apNavAccount" href="/account?lang='+lang+'">'+t.account+'</a>':"")+'</div></div></nav>';
}
function enhance(lang,pathname,html,options={}){
 if(!PAGES.some(x=>x[0]===pathname)&&!EXTRA_ROUTES.has(pathname))return String(html);
 let out=String(html);
 if(out.includes('class="apUnifiedNav"'))return out;
 const style='<style id="advokat-unified-shell-style">'+css+'</style>';
 const head=out.toLowerCase().indexOf("</head>");
 if(head!==-1)out=out.slice(0,head)+style+out.slice(head);
 const existingAccountLink=out.includes('href="/account?lang='+clean(lang)+'"');
 const toolbar=nav(lang,pathname,{...options,includeAccount:options.includeAccount===undefined?!existingAccountLink:options.includeAccount});
 const endHeader=out.toLowerCase().indexOf("</header>");
 if(endHeader>=0)return out.slice(0,endHeader+9)+toolbar+out.slice(endHeader+9);
 const body=out.toLowerCase().indexOf("<body");
 if(body>=0){const p=out.indexOf(">",body);return out.slice(0,p+1)+toolbar+out.slice(p+1)}
 return toolbar+out;
}
module.exports={PAGES,EXTRA_ROUTES,labels,nav,css,enhance};
