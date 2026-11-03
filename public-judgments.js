"use strict";
// Bounded, read-only fetch of public pages. No login, hidden API, or private records.
const pages=Object.freeze({civil:"/report/CIVIL_OLD",administrative:"/report/ADMINISTRATIVE_NEW"});
const cache=new Map();
function clean(html){return String(html||"").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ").replace(/<[^>]*>/g," ").replace(/&nbsp;|&#160;/gi," ").replace(/&amp;/gi,"&").replace(/&quot;/gi,'"').replace(/&#39;/gi,"\u0027").replace(/\s+/g," ").trim().slice(0,800)}
function parse(html,cat){
 const rows=String(html).match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)||[];const items=[];
 for(const row of rows.slice(0,150)){const fields=(row.match(/<td\b[^>]*>[\s\S]*?<\/td>/gi)||[]).map(clean);
 if(fields.length<8)continue;
 const caseNo=fields.find(v=>/[1-9]-\d{3,5}-\d{3,5}\/\d{1,6}/.test(v));if(!caseNo)continue;
 items.push({caseNumber:caseNo,court:fields[1]||"",instance:fields[2]||"",subject:fields[4]||"",date:fields[6]||"",outcome:fields[7]||"",category:cat,sourcePage:"https://public.sud.uz"+pages[cat]});if(items.length>=30)break;
 }return items;
}
async function list(cat){
 if(!Object.prototype.hasOwnProperty.call(pages,cat))return {ok:false,state:"invalid_category",items:[]};
 const cached=cache.get(cat);if(cached&&Date.now()-cached.at<300000)return cached.result;
 const url="https://public.sud.uz"+pages[cat];const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8000);
 let result;
 try{const response=await fetch(url,{signal:controller.signal,redirect:"error",headers:{"Accept":"text/html"}});
  if(!response.ok)throw new Error("HTTP "+response.status);const type=response.headers.get("content-type")||"";if(!type.includes("text/html"))throw new Error("Unexpected content type");
  const len=Number(response.headers.get("content-length")||0);if(len>1500000)throw new Error("Large response");
  const body=(await response.text()).slice(0,1500000);const items=parse(body,cat);
  result={ok:true,state:items.length?"public_rows_found":"public_rows_not_in_html",items,sourceUrl:url,note:items.length?"Ochiq HTML jadvalidan olingan metadata; qaror PDF mazmuni tekshirilmagan.":"Portal JavaScript orqali ma’lumot yuklayotgan bo‘lishi mumkin. Bu nol sud qarori mavjud degani emas."};
 }catch(err){result={ok:false,state:"source_unavailable",items:[],sourceUrl:url,note:"Rasmiy ochiq sahifani serverdan o‘qib bo‘lmadi; portalni bevosita oching."};}
 finally{clearTimeout(timeout)}cache.set(cat,{at:Date.now(),result});return result;
}
module.exports={list,parse,pages};