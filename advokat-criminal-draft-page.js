"use strict";
const {DOC_TYPES,draftDocument,validateDraft,normalize,REQUIRED,articleLink}=require("./criminal-procedural-drafts");
const {correctSpelling,correctNarrativeFields,NARRATIVE_FIELDS,REPLACEMENTS}=require("./criminal-motion-spelling");
const COPY={
 uz:{title:"Jinoyat ishi — iltimosnoma va e’tiroz konstruktori",subtitle:"Ish bo‘yicha faktlarni kiriting, JPKga tayangan tahrirlanadigan hujjat loyihasini tayyorlang.",back:"Advokat ish markazi",type:"Hujjat turi",authority:"Kimga (tergovchi, prokuror yoki sudning aniq nomi)",lawyer:"Advokat F.I.Sh. va rekvizitlari",caseReference:"Ish raqami yoki shartli identifikator",proceduralRole:"Himoya qilinayotgan shaxsning maqomi",facts:"Ish holatlari: faqat ishonchli faktlarni yozing",evidence:"Talab qilinadigan yoki tekshiriladigan dalil/hujjat",relevance:"Dalilning ish uchun ahamiyati",issue:"Jarayonda aniqlangan ehtimoliy muammo (tasdiqlanmagan bo‘lsa, shunday yozing)",action:"Aniq nimani so‘raysiz?",attachments:"Ilovalar",date:"Sana",make:"Hujjat loyihasini tuzish",preview:"Tahrirlanadigan hujjat",download:"Word (.doc) faylini yuklash",copy:"Matnni nusxalash",missing:"Majburiy maydonlar to‘ldirilmagan",warning:"Maxfiy ma’lumotlar brauzerda qoladi; hech narsa serverga yoki AI’ga yuborilmaydi. Faqat nazorat ostida, ish uchun zarur ma’lumotni kiriting.",note:"Hujjat avtomatik tarzda sudga yoki tergov organiga yuborilmaydi. Advokat rekvizitlar, moddalar, amal qiluvchi qonun tahriri, vakolat va protsessual muddatlarni tekshirishi shart.",link:"JK/JPK manbalarini tekshirish",placeholder:"Zarur bo‘lsa o‘zingiz to‘ldiring"},
 ru:{title:"Конструктор ходатайств и возражений",subtitle:"Заполните обстоятельства дела и получите редактируемый проект процессуального документа.",back:"К рабочему кабинету",type:"Тип документа",authority:"Адресат",lawyer:"Ф.И.О. адвоката и реквизиты",caseReference:"Номер дела или условный код",proceduralRole:"Процессуальный статус",facts:"Проверенные обстоятельства дела",evidence:"Запрашиваемые или проверяемые материалы",relevance:"Значение доказательства",issue:"Предполагаемая процессуальная проблема",action:"Конкретное процессуальное требование",attachments:"Приложения",date:"Дата",make:"Составить проект",preview:"Редактируемый документ",download:"Скачать Word (.doc)",copy:"Копировать текст",missing:"Заполните обязательные поля",warning:"Информация остаётся в браузере, не передаётся на сервер и во внешний AI.",note:"Проект не направляется в государственные органы. Адвокат обязан проверить все реквизиты, статьи и процессуальные сроки.",link:"Проверить УПК",placeholder:"Заполните по необходимости"},
 en:{title:"Criminal-case motion and objection builder",subtitle:"Enter case facts and produce an editable procedural document draft.",back:"Back to advocate workbench",type:"Document type",authority:"Addressee / competent authority",lawyer:"Counsel identification and credentials",caseReference:"Case number or reference",proceduralRole:"Procedural status",facts:"Verified case circumstances",evidence:"Evidence or document requested/reviewed",relevance:"Relevance to the case",issue:"Potential procedural issue (distinguish unverified allegations)",action:"Specific remedy requested",attachments:"Attachments",date:"Date",make:"Generate draft",preview:"Editable document",download:"Download Word (.doc)",copy:"Copy text",missing:"Required fields are missing",warning:"All typed information remains in your browser. No server or external AI submission.",note:"This draft is not submitted to any authority. Counsel must check addressee, law, applicable edition, deadline and procedural grounds.",link:"Check Criminal Procedure Code",placeholder:"Enter as needed"}
};
const FIELDS_EXTRA={
 uz:{stage:"Ish bosqichi (tergov yoki sud muhokamasi)",accused:"Himoya qilinayotgan shaxs F.I.Sh.",charge:"JK bo‘yicha ayblov moddasi va qismi",orderNumber:"Advokat orderi raqami",expertQuestions:"Ekspert oldiga qo‘yiladigan savollar (ixtiyoriy)",digitalProvenance:"Elektron yozishmalar kelib chiqishi va yaxlitligini qanday tekshirish kerak?",signature:"Tasdiqlovchi imzo / advokat F.I.Sh.",warn:"Sudga taqdim etishdan oldin tekshiring",confirmed:"Tekshirish uchun ochiq masalalar ko‘rsatilmagan. Baribir advokat imzosi va protsessual hujjatlar tekshirilsin.",approval:"Men hujjatning faktlari, qonun normalari, ish bosqichi, ilovalari va vakolat rekvizitlarini tekshirdim",confirm:"Advokat tasdig‘i"},
 ru:{stage:"Стадия процесса",accused:"Ф.И.О. подзащитного",charge:"Статья и часть УК",orderNumber:"Номер ордера адвоката",expertQuestions:"Вопросы для эксперта (при необходимости)",digitalProvenance:"Проверка происхождения электронных сообщений",signature:"Подпись / Ф.И.О. адвоката",warn:"Проверить перед подачей в суд",confirmed:"Не обнаружены незаполненные контрольные поля. Проверьте подписание и документы.",approval:"Я проверил обстоятельства дела, нормы права, реквизиты, приложения и процессуальные сроки",confirm:"Подтверждение адвоката"},
 en:{stage:"Case stage",accused:"Client's full name",charge:"Criminal Code charge and section",orderNumber:"Counsel order number",expertQuestions:"Expert questions (optional)",digitalProvenance:"Electronic records provenance and integrity review",signature:"Signing counsel / signature",warn:"Verify before court submission",confirmed:"No outstanding completeness warnings. Counsel must still sign and check procedural validity.",approval:"I have verified the facts, legal grounds, stage, exhibits, credentials and deadlines",confirm:"Counsel confirmation"}
};
const SPELLING_UI={
 uz:{info:"Imlo yordamchisi: yozayotganingizda aniq imlo xatolari tuzatiladi. Ismlar, ish raqamlari va qonun moddalari o‘zgarmaydi.",fixed:"Imlo tuzatildi",review:"Tuzatilgan matnni tekshiring."},
 ru:{info:"Помощник узбекского правописания исправляет только известные опечатки. Имена, номера дела и статьи не меняются.",fixed:"Опечатки исправлены",review:"Проверьте текст перед подачей."},
 en:{info:"Known Uzbek typos are corrected while typing. Names, case numbers and legal references remain unchanged.",fixed:"Spelling corrected",review:"Please review the resulting text."}
};
const TYPE_LABELS={
 uz:{evidence_request:"Dalillarni talab qilib olish haqida iltimosnoma",admissibility:"Dalil maqbulligi bo‘yicha e’tiroz / iltimosnoma",additional_check:"Qo‘shimcha tekshiruv harakati haqida iltimosnoma"},
 ru:{evidence_request:"Ходатайство об истребовании доказательств",admissibility:"Возражение о допустимости доказательств",additional_check:"Ходатайство о дополнительном процессуальном действии"},
 en:{evidence_request:"Motion to obtain evidence",admissibility:"Admissibility objection / motion",additional_check:"Motion for further procedural review"}
};
function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function criminalDraftPage(lang="uz"){
 lang=Object.hasOwn(COPY,lang)?lang:"uz";
 const t={...COPY[lang],...FIELDS_EXTRA[lang],...SPELLING_UI[lang]},q="?lang="+lang;
 const spec={authority:true,lawyer:true,orderNumber:false,caseReference:true,stage:false,accused:false,proceduralRole:false,charge:false,facts:true,evidence:true,relevance:true,issue:false,digitalProvenance:false,expertQuestions:false,action:true,attachments:false,date:false,signature:false};
 const fields=Object.entries(spec).map(([k,required])=>'<label for="f-'+k+'">'+esc(t[k])+(required?' *':'')+'</label>'+(["facts","evidence","relevance","issue","digitalProvenance","expertQuestions","action","attachments"].includes(k)?'<textarea id="f-'+k+'" data-field="'+k+'" maxlength="3500" '+(required?'required':'')+'></textarea>':'<input id="f-'+k+'" data-field="'+k+'" maxlength="3500" '+(required?'required':'')+' type="'+(k==="date"?"date":"text")+'">')).join("");
 const options=Object.keys(DOC_TYPES).map(k=>'<option value="'+k+'">'+esc(TYPE_LABELS[lang][k])+'</option>').join("");
 const js=`(()=>{"use strict";
 const draftDocument=${draftDocument.toString()};
 const specs=${JSON.stringify(DOC_TYPES).replace(/</g,"\\u003c")};
 const ui=${JSON.stringify(t).replace(/</g,"\\u003c")};
 const correctSpelling=${correctSpelling.toString()};
 const correctNarrativeFields=${correctNarrativeFields.toString()};
 const REPLACEMENTS=${JSON.stringify(REPLACEMENTS).replace(/</g,"\\u003c")};
 const NARRATIVE_FIELDS=${JSON.stringify(NARRATIVE_FIELDS)};
 let latest=null;
 const $=id=>document.getElementById(id);
 let correctedCount=0;
 const correctField=el=>{
  if(!NARRATIVE_FIELDS.includes(el.dataset.field))return 0;
  const result=correctSpelling(el.value);
  if(!result.changed)return 0;
  const caret=typeof el.selectionStart==="number"?el.selectionStart:null;
  const newCaret=caret===null?null:correctSpelling(el.value.slice(0,caret)).text.length;
  el.value=result.text;
  if(newCaret!==null && typeof el.setSelectionRange==="function" && document.activeElement===el)el.setSelectionRange(newCaret,newCaret);
  correctedCount+=result.count;
  $("spellingStatus").textContent=ui.fixed+": "+correctedCount+". "+ui.review;
  return result.count;
 };
 document.querySelectorAll("[data-field]").forEach(el=>{
  if(!NARRATIVE_FIELDS.includes(el.dataset.field))return;
  el.addEventListener("input",event=>{
   if(event?.isComposing || event?.inputType==="insertCompositionText")return;
   if(/[\\s.,;:!?)]$/.test(el.value))correctField(el);
  });
  el.addEventListener("blur",()=>correctField(el));
 });
 $("generate").addEventListener("click",()=>{
  const form={type:$("type").value};
  for(const input of document.querySelectorAll("[data-field]")){
    if(NARRATIVE_FIELDS.includes(input.dataset.field))correctField(input);
    form[input.dataset.field]=input.value;
  }
  const corrected=correctNarrativeFields(form);
  for(const input of document.querySelectorAll("[data-field]")){
    if(NARRATIVE_FIELDS.includes(input.dataset.field))input.value=corrected.form[input.dataset.field];
  }
  correctedCount+=corrected.count;
  if(correctedCount)$("spellingStatus").textContent=ui.fixed+": "+correctedCount+". "+ui.review;
  const r=draftDocument.call(null,corrected.form);
  if(!r.ok){$("status").textContent=ui.missing+": "+r.missing.join(", ");return;}
  $("status").textContent=r.warnings?.length ? ui.warn+": "+r.warnings.join(" · ") : ui.confirmed;
  $("approval").checked=false;
  $("word").disabled=true;
  latest=r;
  $("preview").hidden=false;
  $("editable").value=r.text;
 });
 $("approval").addEventListener("change",()=>{$("word").disabled=!$("approval").checked});
 $("copy").addEventListener("click",()=>{if(!$("preview").hidden && $("editable").value)navigator.clipboard?.writeText($("editable").value)});
 $("word").addEventListener("click",()=>{
  if($("preview").hidden||!$("editable").value||!$("approval").checked)return;
  const safe=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  const html='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>body{font-family:Times New Roman,serif;font-size:14pt;line-height:1.5;white-space:pre-wrap}</style></head><body>'+safe($("editable").value).replace(/\\n/g,"<br>")+'</body></html>';
  const blob=new Blob(["\\ufeff",html],{type:"application/msword"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="verius-jinoyat-iltimosnoma.doc";a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 })();`;
 // Embed the same vetted draft validation functions in this browser-only page.
 const dependencies='const DOC_TYPES='+JSON.stringify(DOC_TYPES).replace(/</g,"\\u003c")+
 ';const CODE_URL="https://lex.uz/docs/-111460";'+
 'const REQUIRED='+JSON.stringify(REQUIRED)+';'+
 'const normalize='+normalize.toString()+';'+
 'const articleLink='+articleLink.toString()+';'+
 'const validateDraft='+validateDraft.toString()+';';
 const script=js.replace('const draftDocument=',dependencies+'const draftDocument=').replace('const specs='+JSON.stringify(DOC_TYPES).replace(/</g,"\\u003c")+';','');
 const style='*{box-sizing:border-box}body{margin:0;background:#f3f6f8;color:#173248;font-family:Inter,system-ui,Arial,sans-serif}a{color:inherit}header{background:#06111f;color:white;padding:20px}.wrap{max-width:1000px;margin:auto}header a{color:#edcf92}.hero{padding:42px 18px;background:linear-gradient(115deg,#06111f,#1a4560);color:white}.hero h1{font:normal clamp(30px,5vw,46px) Georgia,serif;margin:0 0 15px}.hero p{color:#d4e6ef;line-height:1.6}.main{padding:25px 18px 65px}.card{padding:23px;background:white;border:1px solid #d9e4ea;border-radius:16px;margin-bottom:20px}.card label{font-weight:750;display:block;margin:16px 0 7px}.card select,.card input,.card textarea{width:100%;border:1px solid #b8cbd7;border-radius:9px;padding:12px;font:inherit}.card textarea{min-height:92px;resize:vertical}.card textarea#editable{min-height:460px;line-height:1.65;font-family:Georgia,serif}.actions{display:flex;gap:11px;flex-wrap:wrap;margin-top:20px}button{border:0;background:#15415b;color:white;border-radius:9px;padding:12px 17px;cursor:pointer;font-weight:750}button:disabled{opacity:.45;cursor:not-allowed}.spell-help{background:#edf5f8;padding:12px 14px;border-left:3px solid #6594ac;border-radius:9px;color:#234a64;line-height:1.6;font-size:13px}.spell-status{color:#1b5c42;font-size:13px;font-weight:650;min-height:18px}button.secondary{background:#eaf0f3;color:#183b54}.notice{border-left:4px solid #cba96c;background:#fff5e3;padding:16px;line-height:1.7;margin:18px 0}p{line-height:1.6}button:focus-visible,a:focus-visible,input:focus-visible,textarea:focus-visible{outline:3px solid #c9a86a;outline-offset:3px}@media(max-width:620px){.main{padding:13px}.card{padding:16px}}';
 return '<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>VERIUS — '+esc(t.title)+'</title><style>'+style+'</style></head><body><header><div class="wrap"><strong>§ VERIUS PRO</strong> · <a href="/advokat-pro/criminal/workbench'+q+'">'+esc(t.back)+'</a></div></header><section class="hero"><div class="wrap"><h1>'+esc(t.title)+'</h1><p>'+esc(t.subtitle)+'</p></div></section><main class="main"><div class="wrap"><section class="card"><label for="type">'+esc(t.type)+'</label><select id="type">'+options+'</select>'+fields+'<p class="spell-help">'+esc(t.info)+'</p><p class="spell-status" id="spellingStatus" aria-live="polite"></p><div class="actions"><button type="button" id="generate">'+esc(t.make)+'</button></div><p role="status" id="status"></p></section><section class="card" id="preview" hidden><h2>'+esc(t.preview)+'</h2><textarea id="editable" spellcheck="false"></textarea><label for="approval"><input type="checkbox" id="approval"> '+esc(t.approval)+'</label><div class="actions"><button type="button" id="word" disabled>'+esc(t.download)+'</button><button type="button" class="secondary" id="copy">'+esc(t.copy)+'</button></div></section><div class="notice">'+esc(t.warning)+'</div><div class="notice">'+esc(t.note)+'</div><p><a target="_blank" rel="noopener noreferrer" href="https://lex.uz/docs/-111460">'+esc(t.link)+' ↗</a></p></div></main><script>'+script+'</script></body></html>';
}
module.exports={criminalDraftPage};
