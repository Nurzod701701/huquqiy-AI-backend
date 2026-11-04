"use strict";
// Shared Advokat PRO language switcher. Links deliberately point to the SAME subpage.
// No script, API, cookies, storage, or changes to Citizens pages.
module.exports=function(language,pathname,html){
 const lang=["uz","ru","en"].includes(language)?language:"uz";
 const routes=new Set(["/advokat-pro/documents","/advokat-pro/check","/advokat-pro/grounded","/advokat-pro/court-practice"]);
 if(!routes.has(pathname))return html;
 const label={uz:"Til",ru:"Язык",en:"Language"}[lang];
 const links=["uz","ru","en"].map(l=>
  '<a href="'+pathname+'?lang='+l+'"'+(l===lang?' aria-current="page"':'')+' lang="'+l+'">'+l.toUpperCase()+'</a>'
 ).join("");
 const style='<style id="advokat-language-style">'+
 '.advokatLanguageBar{position:fixed;bottom:18px;right:18px;z-index:150;display:flex;align-items:center;gap:8px;padding:7px 9px;border:1px solid #d8c9b3;border-radius:14px;background:rgba(255,253,250,.97);box-shadow:0 12px 33px rgba(11,25,43,.15);font:700 12px Inter,system-ui,Arial,sans-serif;color:#314b5f;backdrop-filter:blur(12px)}'+
 '.advokatLanguageBar a{padding:6px 9px;border-radius:8px;text-decoration:none;color:#31506a;font-weight:800}'+
 '.advokatLanguageBar a[aria-current="page"]{background:#142c40;color:#fff}'+
 '.advokatLanguageBar a:focus-visible{outline:2px solid #c5a16a;outline-offset:2px}'+
 '@media(max-width:600px){.advokatLanguageBar{bottom:9px;right:9px;padding:5px;gap:3px}.advokatLanguageBar span{position:absolute;width:1px;height:1px;clip-path:inset(50%);overflow:hidden}.advokatLanguageBar a{padding:7px 8px}}'+
 '</style>';
 const smoothStyle='<style id="advokat-motion-style">'+"\n/* Advokat internal views: motion consistency across controls. */\n:root{--ap-motion-ease:cubic-bezier(.22,1,.36,1)}\nbutton,.btn,.actions a,#advokatWorkspace .ap-load,#advokatWorkspace .ap-side a,.advokatLanguageBar a{\n transition:transform .38s var(--ap-motion-ease),box-shadow .38s var(--ap-motion-ease),border-color .28s ease,background-color .28s ease,color .28s ease;\n}\nbutton:hover:not(:disabled),.btn:hover,#advokatWorkspace .ap-load:hover{transform:translate3d(0,-2px,0)}\nbutton:active:not(:disabled),.btn:active,#advokatWorkspace .ap-load:active{transform:translate3d(0,0,0) scale(.99)}\n#advokatWorkspace .ap-side a{border-left:2px solid transparent}\n#advokatWorkspace .ap-side a:hover{transform:translate3d(2px,0,0)}\n#advokatWorkspace .ap-card{transition:border-color .38s ease,box-shadow .45s var(--ap-motion-ease)}\n#advokatWorkspace .ap-card:hover{box-shadow:0 19px 42px rgba(11,25,43,.095)}\n.advokatLanguageBar a:hover:not([aria-current=\"page\"]){background:#efe9de}\n:where(button,a,input,textarea,select):focus-visible{outline:2px solid #bd9356;outline-offset:3px}\n@media(hover:none),(pointer:coarse){\n button:hover:not(:disabled),.btn:hover,#advokatWorkspace .ap-load:hover,#advokatWorkspace .ap-side a:hover{transform:none}\n}\n@media(prefers-reduced-motion:reduce){\n button,.btn,.actions a,#advokatWorkspace .ap-load,#advokatWorkspace .ap-side a,#advokatWorkspace .ap-card,.advokatLanguageBar a{transition:none!important;transform:none!important}\n}\n"+'</style>';
 const toolbar='<nav class="advokatLanguageBar" aria-label="'+label+'"><span>'+label+':</span>'+links+'</nav>';
 const output=String(html);
 const headAt=output.toLowerCase().indexOf("</head>");
 const withStyle=headAt<0?output:output.slice(0,headAt)+style+smoothStyle+output.slice(headAt);
 const bodyAt=withStyle.toLowerCase().lastIndexOf("</body>");
 return bodyAt<0?withStyle:withStyle.slice(0,bodyAt)+toolbar+withStyle.slice(bodyAt);
};