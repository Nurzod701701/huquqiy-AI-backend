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
 const toolbar='<nav class="advokatLanguageBar" aria-label="'+label+'"><span>'+label+':</span>'+links+'</nav>';
 const output=String(html);
 const headAt=output.toLowerCase().lastIndexOf("</head>");
 const withStyle=headAt<0?output:output.slice(0,headAt)+style+output.slice(headAt);
 const bodyAt=withStyle.toLowerCase().lastIndexOf("</body>");
 return bodyAt<0?withStyle:withStyle.slice(0,bodyAt)+toolbar+withStyle.slice(bodyAt);
};