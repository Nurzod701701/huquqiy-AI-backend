"use strict";
// QOMUS Advokat PRO — read-only public court publication gateway.
// Only publicly published HTML; no authentication, hidden endpoints or bulk scraping.
const BASE="https://public.sud.uz";
const PAGES=Object.freeze({civil:"/report/CIVIL_OLD",administrative:"/report/ADMINISTRATIVE_NEW",criminal:"/report/CRIMINAL"});
const CACHE=new Map();
const CACHE_MS=5*60*1000;
const MAX_HTML=1500000;
const MAX_ROWS=150;
const MAX_ITEMS=30;
function decode(s){return String(s||"").replace(/&(?:nbsp|#160);/gi," ").replace(/&amp;/gi,"&").replace(/&quot;/gi,'"').replace(/&#(?:39|x27);/gi,"'").replace(/&lt;/gi,"<").replace(/&gt;/gi,">");}
function clean(s){return decode(String(s||"").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ").replace(/<[^>]*>/g," ")).replace(/\s+/g," ").trim().slice(0,800);}
function safePdfLink(html){
 const links=String(html||"").match(/<a\b[^>]*href\s*=\s*["'][^"']+["'][^>]*>/gi)||[];
 for(const link of links){
  const match=link.match(/href\s*=\s*["']([^"']+)["']/i);if(!match)continue;
  try{const u=new URL(decode(match[1]),BASE);if(u.protocol==="https:"&&u.hostname==="public.sud.uz"&&u.pathname!=="/"&&(/\.pdf$/i.test(u.pathname)||/\b(pdf|download|document|file)\b/i.test(u.pathname)))return u.href;}catch(_){}
 }
 return null;
}
function parse(html,category){
 const rows=String(html||"").match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)||[];
 const items=[];
 for(const row of rows.slice(0,MAX_ROWS)){
  const fields=(row.match(/<td\b[^>]*>[\s\S]*?<\/td>/gi)||[]).map(clean);
  if(fields.length<7)continue;
  const index=fields.findIndex(v=>/\b\d-\d{3,5}-\d{3,5}\/\d{1,6}\b/.test(v));
  if(index<0)continue;
  // The public portal's column order is court, instance, case, subject, judge, date, outcome, document type, PDF.
  // Some tables include a leading ordinal column. Anchor all positions to the case-number column.
  const caseNumber=(fields[index].match(/\b\d-\d{3,5}-\d{3,5}\/\d{1,6}\b/)||[])[0];
  if(!caseNumber)continue;
  const court=fields[index-2]||"";
  const instance=fields[index-1]||"";
  const subject=fields[index+1]||"";
  const date=fields[index+3]||"";
  const outcome=fields[index+4]||"";
  const documentType=fields[index+5]||"";
  // These are public metadata only, NOT validation of the judgment itself.
  items.push({caseNumber,court,instance,subject,date,outcome,documentType,category,
    sourcePage:BASE+PAGES[category],pdfUrl:safePdfLink(row)});
  if(items.length>=MAX_ROWS)break;
 }
 return items;
}
// Stream with an enforced byte bound: Content-Length can be absent or misleading.
async function readBoundedHtml(response,limit=MAX_HTML){
 const reader=response.body?.getReader?.();
 if(!reader){const body=await response.text();if(Buffer.byteLength(body,"utf8")>limit)throw Error("Response too large");return body;}
 const decoder=new TextDecoder("utf-8",{fatal:false}),parts=[];
 let size=0;
 try{
  while(true){
   const {done,value}=await reader.read();if(done)break;
   size+=value.byteLength;
   if(size>limit)throw Error("Response too large");
   parts.push(decoder.decode(value,{stream:true}));
  }
  parts.push(decoder.decode());
  return parts.join("");
 }catch(err){try{await reader.cancel()}catch(_){}throw err}
 finally{reader.releaseLock()}
}
function normalizeSearch(value){return String(value||"").trim().slice(0,120).toLocaleLowerCase("uz");}
function filter(items,search){const term=normalizeSearch(search);if(!term)return items.slice(0,MAX_ITEMS);
 return items.filter(x=>[x.caseNumber,x.court,x.instance,x.subject,x.date,x.outcome,x.documentType].some(v=>String(v).toLocaleLowerCase("uz").includes(term))).slice(0,MAX_ITEMS);}
async function fetchPublic(category){
 const cached=CACHE.get(category);if(cached&&Date.now()-cached.at<CACHE_MS)return cached.value;
 const sourceUrl=BASE+PAGES[category];
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8000);
 let value;
 try{
  const response=await fetch(sourceUrl,{signal:controller.signal,redirect:"error",headers:{Accept:"text/html","User-Agent":"QOMUS-PublicCourt-Reader/1.1 (public HTML only)"}});
  if(!response.ok)throw new Error("HTTP "+response.status);
  const type=response.headers.get("content-type")||"";
  if(!/text\/html/i.test(type))throw new Error("Unexpected content type");
  const len=Number(response.headers.get("content-length")||0);
  if(len>MAX_HTML)throw new Error("Response too large");
  const body=await readBoundedHtml(response);
  const rows=parse(body,category);
  value={ok:true,state:rows.length?"public_rows_found":"public_rows_not_in_html",rows,sourceUrl};
 }catch(_){value={ok:false,state:"source_unavailable",rows:[],sourceUrl};}
 finally{clearTimeout(timeout);}
 CACHE.set(category,{at:Date.now(),value});return value;
}
async function list(category,search=""){
 if(!Object.prototype.hasOwnProperty.call(PAGES,category))
  return {ok:false,state:"invalid_category",items:[],note:"Ish toifasi noto‘g‘ri."};
 const result=await fetchPublic(category);
 const items=filter(result.rows,search);
 const note=result.state==="source_unavailable"
  ?"Rasmiy portalning ochiq sahifasini hozir serverdan o‘qib bo‘lmadi. Portalda bevosita qidiring."
  :result.state==="public_rows_not_in_html"
   ?"Portal jadvalini JavaScript orqali yuklayotgan bo‘lishi mumkin. Natija bo‘shligi sud qarori yo‘qligini anglatmaydi."
   :items.length?"Faqat ochiq HTML sahifaning boshlang‘ich yozuvlaridan metadata olindi. PDF va qarorning qonuniy kuchi tasdiqlanmagan."
   :"Boshlang‘ich HTML yozuvlarida mos natija topilmadi. To‘liq qidiruv uchun rasmiy portalga o‘ting.";
 return {ok:result.ok,state:result.state,items,search:normalizeSearch(search),sourceUrl:result.sourceUrl,
  scannedRows:result.rows.length,limitedToFirstPage:true,note};
}
module.exports={list,parse,PAGES,filter,readBoundedHtml};
