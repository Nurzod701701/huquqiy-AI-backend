"use strict";

// Presentation only: never reads, stores or transmits secrets.
// Works on existing login, registration, reset, admin and verification forms.
const content=String.raw`<style id="verius-secret-visibility-style">
.verius-secret-wrap{display:block;position:relative;width:100%;min-width:0}
.verius-secret-wrap>input{width:100%;box-sizing:border-box;padding-right:54px!important}
.verius-secret-eye{position:absolute!important;top:50%;right:5px;transform:translateY(-50%);display:flex!important;align-items:center;justify-content:center;min-width:42px!important;width:42px!important;height:42px!important;min-height:42px!important;margin:0!important;padding:0!important;border:0!important;border-radius:8px;background:transparent!important;color:#405b70!important;cursor:pointer;box-shadow:none!important;touch-action:manipulation;z-index:1}
.verius-secret-eye:hover{background:rgba(150,163,175,.14)!important}
.verius-secret-eye:focus-visible{outline:2px solid #c9a86a;outline-offset:1px}
.verius-secret-eye svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}
</style>
<script id="verius-secret-visibility-script">
(function(){
 "use strict";
 const eye='<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
 const crossed='<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m3 3 18 18"/><path d="M10.6 5.1A11.6 11.6 0 0 1 12 5c6.4 0 10 7 10 7a15.8 15.8 0 0 1-3.1 3.9"/><path d="M6.2 6.2C3.4 8.3 2 12 2 12s3.6 7 10 7a10.1 10.1 0 0 0 4.7-1.2"/><path d="M10.5 10.5a3 3 0 0 0 4 4"/></svg>';
 const lang=document.documentElement.lang==="ru"?"ru":document.documentElement.lang==="en"?"en":"uz";
 const labels={uz:["Ko‘rsatish","Yashirish"],ru:["Показать","Скрыть"],en:["Show","Hide"]}[lang];
 function enhance(){
  const fields=document.querySelectorAll('input[type="password"], form[action*="/verify-email"] input[name="code"], form[action*="/reset-password"] input[name="code"]');
  fields.forEach(function(input){
   if(input.dataset.veriusEyeReady==="1" || input.type==="hidden" || input.disabled)return;
   input.dataset.veriusEyeReady="1";
   const originalType=input.type==="password"?"password":"text";
   // The OTP is six digits. Mask by default, but preserve numeric mobile keyboard.
   if(originalType==="text")input.type="password";
   const wrap=document.createElement("span");
   wrap.className="verius-secret-wrap";
   input.parentNode.insertBefore(wrap,input);
   wrap.appendChild(input);
   const button=document.createElement("button");
   button.type="button";
   button.className="verius-secret-eye";
   button.setAttribute("aria-label",labels[0]);
   button.setAttribute("title",labels[0]);
   button.setAttribute("aria-pressed","false");
   button.innerHTML=eye;
   button.addEventListener("click",function(){
    const reveal=input.type==="password";
    input.type=reveal?"text":"password";
    button.innerHTML=reveal?crossed:eye;
    button.setAttribute("aria-label",reveal?labels[1]:labels[0]);
    button.setAttribute("title",reveal?labels[1]:labels[0]);
    button.setAttribute("aria-pressed",String(reveal));
   });
   wrap.appendChild(button);
  });
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",enhance,{once:true});
 else enhance();
})();
</script>`;
module.exports=content;
