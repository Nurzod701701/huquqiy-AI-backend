"use strict";
// Cache ONLY public official LexUZ document HTML, never questions or AI responses.
const TTL_MS = 30 * 60 * 1000;
const LIMIT = 4;
const entries = new Map();
async function publicDocument(url, fetcher, now=Date.now()) {
 const existing=entries.get(url);
 if(existing && existing.expires > now)return existing.promise;
 const pending=Promise.resolve().then(()=>fetcher(url));
 entries.set(url,{expires:now+TTL_MS,promise:pending});
 if(entries.size>LIMIT)entries.delete(entries.keys().next().value);
 try{return await pending;}catch(e){if(entries.get(url)?.promise===pending)entries.delete(url);throw e;}
}
function clear(){entries.clear();}
module.exports={publicDocument,clear,TTL_MS};
