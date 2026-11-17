"use strict";
function render(lang,csrf){
 const t=lang==="ru"?{
  heading:"Перенести старый документ в единый кабинет",
  description:"Выберите JSON, ранее сохранённый в Адвокат PRO. Файл не передаётся без вашего подтверждения. Данные останутся привязанными к вашему аккаунту.",
  choose:"JSON-файл Адвокат PRO",allow:"Я подтверждаю сохранение этого документа в моём защищённом аккаунте VERIUS.",submit:"Импортировать в кабинет",error:"Нужен корректный JSON-файл до 100 КБ.",note:"После сохранения проверьте документ. Оригинал JSON сохраните до проверки переноса."
 }:lang==="en"?{
  heading:"Move a legacy document into your personal account",
  description:"Select a previously exported Advocate PRO JSON file. The file is not sent until you explicitly confirm. Only your signed-in account will own it.",
  choose:"Advocate PRO JSON file",allow:"I agree to save this document in my VERIUS personal account.",submit:"Import to my account",error:"Choose a valid JSON file under 100 KB.",note:"Check your imported document before deleting your local backup."
 }:{
  heading:"Eski hujjatni yagona kabinetga ko‘chirish",
  description:"Advokat PRO’da oldin saqlangan JSON hujjatni tanlang. Roziligingizsiz fayl serverga yuborilmaydi. Hujjat faqat sizning akkauntingizga biriktiriladi.",
  choose:"Advokat PRO JSON fayli",allow:"Ushbu hujjatni VERIUS shaxsiy kabinetimga saqlashga roziman.",submit:"Kabinetga import qilish",error:"100 KB dan kichik, to‘g‘ri JSON faylni tanlang.",note:"Hujjatni kabinetda tekshirmaguncha eski JSON nusxasini o‘chirmang."
 };
 const esc=x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
 return '<section class="accountPanel" id="veriusLegacyImport"><h2>'+esc(t.heading)+'</h2><p class="accountMuted">'+esc(t.description)+'</p>'+
 '<form id="veriusImportForm" method="POST" action="/account/documents/import?lang='+encodeURIComponent(lang)+'" class="accountForm">'+
 '<input type="hidden" name="csrf" value="'+esc(csrf)+'">'+
 '<label>'+esc(t.choose)+'<input id="veriusImportFile" type="file" accept=".json,application/json" required></label>'+
 '<textarea id="veriusImportPayload" name="payload" hidden></textarea>'+
 '<label style="display:flex;align-items:flex-start;gap:10px"><input style="width:auto;margin-top:4px" type="checkbox" name="consent" value="yes" required><span>'+esc(t.allow)+'</span></label>'+
 '<button class="accountButton gold" type="submit">'+esc(t.submit)+'</button><p id="veriusImportStatus" class="accountMuted" role="status"></p></form>'+
 '<p class="accountMuted">'+esc(t.note)+'</p>'+
 '<script>(function(){var f=document.getElementById("veriusImportForm"),file=document.getElementById("veriusImportFile"),payload=document.getElementById("veriusImportPayload"),status=document.getElementById("veriusImportStatus");if(!f)return;f.addEventListener("submit",async function(e){e.preventDefault();if(!f.reportValidity())return;var item=file.files&&file.files[0];if(!item||item.size>100000){status.textContent='+JSON.stringify(t.error)+';return;}try{var txt=await item.text();if(txt.length>100000||!JSON.parse(txt)){throw Error("INVALID");}payload.value=txt;f.submit();}catch(_){status.textContent='+JSON.stringify(t.error)+';}})})();</script></section>';
}
module.exports={render};
