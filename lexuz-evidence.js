'use strict';

// QA: retrieve excerpts only from the expected public LexUZ document pages.
// "verified" below means a relevant excerpt was obtained from the expected
// official page, NOT that the law's edition or every article was validated.
const LEXUZ_DOCS=Object.freeze([
 {name:'Mehnat kodeksi',url:'https://lex.uz/docs/-6257288',test:/mehnat|ishdan|xodim|ish beruvchi|ish haqi|ta.til|employment|labou?r|dismiss|увольнен|труд|зарплат/i},
 {name:'Oila kodeksi',url:'https://lex.uz/docs/-104720',test:/oila|nikoh|aliment|ajra|farzand|bola|divorc|marriage|family|семь|брак/i},
 {name:'Fuqarolik kodeksi I',url:'https://lex.uz/docs/-111189',test:/mulk|qarz|meros|shartnoma|fuqarolik|contract|property|debt|наслед|договор|имуществ/i},
 {name:'Fuqarolik kodeksi II',url:'https://lex.uz/docs/-180552',test:/ijara|oldi.sotdi|pudrat|xizmat ko.rsatish|lease|sale|аренд|купл/i},
 {name:'Iqtisodiy protsessual kodeks',url:'https://lex.uz/docs/-3523891',test:/iqtisodiy sud|economic court|экономическ.{0,20}суд/i}
]);
const ARTICLE_RE=/(?:\d{1,4}\s*[-–.]?\s*(?:modda|модда|статья)|(?:modda|модда|статья)\s*\d{1,4})/iu;
function isExpectedLexuzDocument(actualUrl,expectedUrl){
 try{
  const actual=new URL(actualUrl),expected=new URL(expectedUrl);
  if(actual.protocol!=='https:'||!['lex.uz','www.lex.uz'].includes(actual.hostname))return false;
  const path=actual.pathname.match(/^\/(?:(?:uz|ru|en)\/)?docs\/(-\d+)\/?$/i);
  const required=expected.pathname.match(/^\/docs\/(-\d+)\/?$/i);
  return Boolean(path&&required&&path[1]===required[1]);
 }catch{return false}
}
function legalTextFromHtml(html){
 return String(html)
  .replace(/<!--[\s\S]*?-->/g,' ')
  .replace(/<(script|style|noscript|svg|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,' ')
  .replace(/<[^>]+>/g,' ')
  .replace(/&nbsp;|&#160;/gi,' ').replace(/&quot;/gi,'"')
  .replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>')
  .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Math.min(Number(n),0x10ffff)))
  .replace(/\s+/g,' ').trim();
}
function relevantExcerpts(text,question){
 if(text.length<4000||!ARTICLE_RE.test(text))return [];
 const terms=String(question).toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(s=>s.length>=5).slice(0,12);
 const lower=text.toLowerCase(),sections=[],locations=[];
 for(const term of terms){
  let from=0;
  for(let count=0;count<8;count++){
   const idx=lower.indexOf(term,from);
   if(idx<0)break;
   from=idx+term.length;
   if(locations.some(x=>Math.abs(idx-x)<500))continue;
   const excerpt=text.slice(Math.max(0,idx-1000),Math.min(text.length,idx+1600));
   if(!ARTICLE_RE.test(excerpt))continue;
   sections.push(excerpt);locations.push(idx);
   if(sections.length>=3)return sections;
  }
 }
 return sections;
}
async function getLexuzEvidence(question,{fetchImpl=globalThis.fetch,timeoutMs=9000}={}){
 const matched=LEXUZ_DOCS.filter(doc=>doc.test.test(String(question))).slice(0,2);
 if(!matched.length)return {verified:false,notes:'No matching legal document was selected.',documents:[]};
 const documents=[];
 for(const doc of matched){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
   const response=await fetchImpl(doc.url,{
    signal:controller.signal,
    headers:{Accept:'text/html','User-Agent':'QOMUS-LegalResearch/1.0'},
    redirect:'follow'
   });
   if(!response.ok||!/text\/html/i.test(response.headers.get('content-type')||''))continue;
   // Validate the final URL AFTER redirects: same official document ID, not merely a similar title.
   if(!isExpectedLexuzDocument(response.url,doc.url))continue;
   const html=(await response.text()).slice(0,1800000);
   const text=legalTextFromHtml(html);
   const sections=relevantExcerpts(text,question);
   if(!sections.length)continue;
   documents.push({name:doc.name,url:doc.url,excerpts:sections.join('\n---\n').slice(0,5500)});
  }catch(e){
   if(process.env.QOMUS_LEXUZ_DEBUG==='true')console.warn('LexUZ excerpt retrieval failed:',doc.name,e?.name||'error');
  }finally{clearTimeout(timer)}
 }
 return documents.length
  ? {verified:true,notes:documents.map(d=>d.name+': '+d.url+'\n'+d.excerpts).join('\n\n'),documents:documents.map(d=>({name:d.name,url:d.url})),editionVerified:false}
  : {verified:false,notes:'LexUZ document text could not be retrieved or validated.',documents:[],editionVerified:false};
}
module.exports={getLexuzEvidence,isExpectedLexuzDocument,legalTextFromHtml,relevantExcerpts,LEXUZ_DOCS};
