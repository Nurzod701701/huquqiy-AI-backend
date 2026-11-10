"use strict";
const {analyzeEvidenceText,RULES,TYPES,FLAGS,linkFor}=require("./criminal-evidence-analyzer");
const COPY={
 uz:{title:"Dalillarni avtomatik dastlabki tekshirish",desc:"Bayonnoma, ekspertiza, guvoh ko‘rsatuvi va raqamli dalilga oid hujjatlardan tekshirish kerak bo‘lgan belgilarni avtomatik ajrating.",back:"Advokat ish markazi",file:"PDF, DOCX yoki TXT hujjat",paste:"Yoki hujjat matnini kiriting",fileHelp:"Faylni tanlasangiz, «Tahlil qilish» bosilganda u faqat VERIUS serveriga vaqtincha matn ajratish uchun yuboriladi (5 MB gacha). Fayl saqlanmaydi va tashqi AI xizmatiga uzatilmaydi. Maxfiy ma’lumotlarni avval yashiring.",consent:"Faylni o‘zimizning VERIUS serverida vaqtincha o‘qishga roziman; hujjatdagi maxfiy ma’lumotlarni tekshirdim.",button:"Tahlil qilish",clear:"Tozalash",heading:"Dastlabki avtomatik tekshiruv natijasi",types:"Aniqlangan ehtimoliy hujjat turi",found:"Matnda qayd etilgan",missing:"Matndan topilmadi — qo‘lda tekshiring",alerts:"Alohida tekshiriladigan iboralar",source:"JPK moddasi",report:"TXT hisobotni olish",hint:"Bu kalit so‘zlarga asoslangan dastlabki tahlil. Algoritm dalilning maqbulligi, jinoyat mavjudligi yoki shaxs aybdorligi haqida xulosa chiqarmaydi.",noOCR:"Skan hujjatlardagi tasvirlar o‘qilmaydi; matnli PDF/DOCX yoki qo‘lda kiritilgan matndan foydalaning.",load:"Hujjat matni ajratilmoqda...",prompt:"Avval matn kiriting yoki fayl tanlang.",none:"Hujjat turini aniq ajratib bo‘lmadi",flagNone:"Alohida xavf iboralari topilmadi; bu qonuniylikni isbotlamaydi.",privacy:"Hisobot va tekshiruv natijalari brauzerda shakllanadi. Neon hisobiga saqlanmaydi.",error:"Tekshiruvda xatolik yuz berdi."},
 ru:{title:"Автоматическая первичная проверка доказательств",desc:"Выявляйте признаки, требующие проверки в протоколах, экспертизах, показаниях и цифровых материалах.",back:"К рабочему кабинету",file:"Документ PDF, DOCX или TXT",paste:"Или вставьте текст",fileHelp:"При анализе файл временно отправляется только на сервер VERIUS для извлечения текста (до 5 МБ). Файлы не хранятся и не передаются внешнему AI. Предварительно удалите конфиденциальные сведения.",consent:"Я согласен на временную обработку файла сервером VERIUS и проверил конфиденциальные данные.",button:"Проверить документ",clear:"Очистить",heading:"Результат предварительной проверки",types:"Предполагаемый тип документа",found:"Упоминается в тексте",missing:"Не найдено в тексте — проверить вручную",alerts:"Фразы, требующие внимания",source:"Статья УПК",report:"Скачать TXT-отчёт",hint:"Проверка по ключевым словам не устанавливает допустимость доказательства и виновность.",noOCR:"Сканированные изображения не распознаются без OCR.",load:"Извлекаем текст...",prompt:"Добавьте текст или файл.",none:"Тип документа не определён",flagNone:"Специальных индикаторов не найдено; это не доказывает законность.",privacy:"Отчёт формируется в браузере и не записывается в Neon.",error:"Ошибка обработки."},
 en:{title:"Automated preliminary evidence review",desc:"Flag documentation gaps and review indicators in investigation records, expert reports, witness statements and digital evidence.",back:"Advocate workbench",file:"PDF, DOCX or TXT document",paste:"Or paste document text",fileHelp:"On analysis, the file is sent temporarily to your VERIUS server to extract text (up to 5 MB). It is not stored or sent to an external AI provider. Redact confidential data first.",consent:"I consent to temporary file processing on the VERIUS server and have reviewed sensitive data.",button:"Analyze document",clear:"Clear",heading:"Automated preliminary findings",types:"Potential document type",found:"Mentioned in extracted text",missing:"Not found in text — check manually",alerts:"Phrases requiring review",source:"CPC article",report:"Download TXT report",hint:"Keyword-based preflight does not determine admissibility, criminal liability or guilt.",noOCR:"Scanned image-only PDFs require OCR or a text copy.",load:"Extracting document text...",prompt:"Provide text or choose a file.",none:"Document type not identified",flagNone:"No specific flags found; this does not establish legality.",privacy:"Results are produced in your browser and are not stored in Neon.",error:"Processing error."}
};
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
function evidenceReviewPage(lang="uz"){
 lang=Object.prototype.hasOwnProperty.call(COPY,lang)?lang:"uz";
 const t=COPY[lang];const q="?lang="+lang;
 const rules=JSON.stringify(RULES).replace(/</g,"\\u003c");
 const types=JSON.stringify(TYPES).replace(/</g,"\\u003c");
 const flags=JSON.stringify(FLAGS).replace(/</g,"\\u003c");
 const labels=JSON.stringify(t).replace(/</g,"\\u003c");
 const script=`(()=>{"use strict";
 const RULES=${rules},TYPES=${types},FLAGS=${flags},LAW_URL="https://lex.uz/docs/-111460",t=${labels};
 const linkFor=${linkFor.toString()};
 const analyzeEvidenceText=${analyzeEvidenceText.toString()};
 const $=id=>document.getElementById(id);
 const safe=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;/g,"&quot;");
 let last=null;
 function render(result){
  last=result;
  const root=$("results");root.hidden=false;
  if(!result.ok){root.textContent=result.message;return;}
  const checks=result.checks.map(c=>'<li class="check"><span class="'+(c.status==="mentioned"?"positive":"caution")+'">'+safe(c.status==="mentioned"?t.found:t.missing)+'</span><strong>'+safe(c.label)+'</strong><div>'+c.refs.map(n=>'<a target="_blank" rel="noopener noreferrer" href="'+linkFor(n)+'">'+safe(t.source)+' '+safe(n)+' ↗</a>').join(" ")+'</div></li>').join("");
  const alerts=result.flags.length?result.flags.map(f=>'<li>'+safe(f.label)+' ('+f.refs.map(n=>'<a href="'+linkFor(n)+'" target="_blank" rel="noopener noreferrer">'+safe(n)+'</a>').join(", ")+')</li>').join(""):'<li>'+safe(t.flagNone)+'</li>';
  root.innerHTML='<h2>'+safe(t.heading)+'</h2><p><strong>'+safe(t.types)+':</strong> '+safe(result.detectedTypes.join(", ")||t.none)+'</p><p>'+safe(t.found)+': '+result.mentioned+' · '+safe(t.missing)+': '+result.needsReview+'</p><ul class="checks">'+checks+'</ul><h3>'+safe(t.alerts)+'</h3><ul>'+alerts+'</ul><p class="hint">'+safe(t.hint)+'</p><p class="hint">'+safe(result.caveat)+'</p>';
  $("download").disabled=false;
 }
 async function run(){
  $("download").disabled=true;$("results").hidden=true;last=null;
  let value=$("evidenceText").value.trim();
  const file=$("evidenceFile").files[0];
  if(file){
    if(!$("consent").checked){$("status").textContent=t.consent;return;}
    if(!/\\.(pdf|docx|txt)$/i.test(file.name)||file.size>5*1024*1024){$("status").textContent="PDF/DOCX/TXT · 5 MB";return;}
    $("status").textContent=t.load;
    try{
      const form=new FormData();form.append("documentFile",file,file.name);
      const response=await fetch("/claim-evidence-extract",{method:"POST",body:form,credentials:"same-origin"});
      if(!response.ok)throw Error("HTTP "+response.status);
      const data=await response.json();
      if(!Array.isArray(data.files)||!data.files.length||data.files[0].error)throw Error(data.files?.[0]?.error||t.error);
      value=data.files[0].text||"";
    }catch(e){$("status").textContent=t.error;return;}
  }
  if(!value){$("status").textContent=t.prompt;return;}
  $("status").textContent="";render(analyzeEvidenceText(value));
 }
 $("analyze").addEventListener("click",run);
 $("clear").addEventListener("click",()=>{$("evidenceText").value="";$("evidenceFile").value="";$("consent").checked=false;$("results").hidden=true;$("status").textContent="";$("download").disabled=true;last=null});
 $("download").addEventListener("click",()=>{if(!last?.ok)return;
 const lines=[t.heading,t.types+": "+(last.detectedTypes.join(", ")||t.none),"",...last.checks.map(c=>(c.status==="mentioned"?"[mentioned] ":"[review] ")+c.label+" — "+c.refs.map(n=>"JPK "+n+" "+linkFor(n)).join(", ")),"",t.alerts,...last.flags.map(f=>f.label),t.hint,last.caveat];
 const blob=new Blob([lines.join(String.fromCharCode(10))],{type:"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="verius-evidence-preflight.txt";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 })();`;
 const css='*{box-sizing:border-box}body{margin:0;background:#f3f6f8;font-family:Inter,system-ui,Arial,sans-serif;color:#163149}.bar{background:#06111f;padding:18px;color:#fff}.wrap{max-width:1050px;margin:auto}.bar .wrap{display:flex;justify-content:space-between;align-items:center;gap:16px}.bar a{color:#e7ca88}.hero{padding:50px 18px;background:linear-gradient(130deg,#06111f,#1b4761);color:white}.hero h1{font:normal clamp(31px,5vw,49px) Georgia,serif;margin:0 0 15px}.hero p{max-width:830px;color:#dbe7ef;line-height:1.7}.main{padding:25px 18px 65px}.card{background:white;border:1px solid #dae5ed;border-radius:15px;padding:24px;margin-bottom:20px}.card label{display:block;font-weight:750;margin:13px 0}.card textarea,.card input[type=file]{width:100%;border:1px solid #c1d1da;padding:12px;border-radius:9px;font:inherit}.card textarea{min-height:140px}.hint{color:#587083;line-height:1.65;font-size:13px}.buttons{display:flex;gap:10px;flex-wrap:wrap;margin:19px 0}.buttons button{border:0;background:#16425e;color:white;padding:13px 17px;border-radius:9px;cursor:pointer;font-weight:750}.buttons button.secondary{background:#edf1f5;color:#163149}.buttons button:disabled{opacity:.45;cursor:not-allowed}.check{border-bottom:1px solid #e6edf0;padding:15px 0;line-height:1.7;list-style:none}.checks{padding:0}.check strong{display:block}.check a{display:inline-block;margin:6px 10px 0 0;color:#155e87}.positive,.caution{display:inline-block;padding:3px 9px;font-size:12px;border-radius:8px;margin-bottom:6px}.positive{background:#dcefe3;color:#205c3e}.caution{background:#fff0d5;color:#7a5320}.note{background:#fff7e8;border-left:4px solid #c9a86a;padding:18px;line-height:1.65;margin-bottom:20px}button:focus-visible,a:focus-visible,input:focus-visible,textarea:focus-visible{outline:3px solid #c9a86a;outline-offset:3px}@media(max-width:600px){.main{padding:14px}.card{padding:17px}.hero{padding:34px 16px}}';
 return '<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>VERIUS — '+esc(t.title)+'</title><style>'+css+'</style></head><body><header class="bar"><div class="wrap"><strong>§ VERIUS PRO</strong><a href="/advokat-pro/criminal/workbench'+q+'">← '+esc(t.back)+'</a></div></header><section class="hero"><div class="wrap"><h1>'+esc(t.title)+'</h1><p>'+esc(t.desc)+'</p></div></section><main class="main"><div class="wrap"><section class="card"><label for="evidenceFile">'+esc(t.file)+'</label><input id="evidenceFile" type="file" accept=".pdf,.docx,.txt"><p class="hint">'+esc(t.fileHelp)+'</p><label><input type="checkbox" id="consent"> '+esc(t.consent)+'</label><label for="evidenceText">'+esc(t.paste)+'</label><textarea id="evidenceText" maxlength="30000" spellcheck="false"></textarea><div class="buttons"><button id="analyze" type="button">'+esc(t.button)+'</button><button type="button" class="secondary" id="clear">'+esc(t.clear)+'</button><button type="button" id="download" disabled>'+esc(t.report)+'</button></div><p role="status" id="status"></p><p class="hint">'+esc(t.noOCR)+'</p></section><section id="results" class="card" aria-live="polite" hidden></section><aside class="note">'+esc(t.hint)+' '+esc(t.privacy)+'</aside></div></main><script>'+script+'</script></body></html>';
}
module.exports={evidenceReviewPage};
