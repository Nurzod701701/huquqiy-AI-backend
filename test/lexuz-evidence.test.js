'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {getLexuzEvidence,isExpectedLexuzDocument,relevantExcerpts,legalTextFromHtml}=require('../lexuz-evidence');

const law='https://lex.uz/docs/-6257288';
const fixture='<html><head><title>Mehnat kodeksi</title></head><body>'+
 '<p>Mehnat kodeksining umumiy qoidalari. '.repeat(155)+'</p>'+
 '<h2>160-modda</h2><p>Ishdan bo‘shatish bo‘yicha qoidalar va mehnat munosabatlari.</p>'+
 '<p>Qonun matni bo‘yicha qo‘shimcha sharh. '.repeat(60)+'</p></body></html>';
const stub=(url=law,html=fixture,ok=true,type='text/html')=>async()=>({
 ok,url,headers:{get:()=>type},text:async()=>html
});

test('official LexUZ same-document URL is accepted',()=>{
 assert.equal(isExpectedLexuzDocument('https://www.lex.uz/uz/docs/-6257288?lang=uz',law),true);
 assert.equal(isExpectedLexuzDocument('http://lex.uz/docs/-6257288',law),false);
 assert.equal(isExpectedLexuzDocument('https://lex.uz.evil.invalid/docs/-6257288',law),false);
 assert.equal(isExpectedLexuzDocument('https://lex.uz/docs/-111189',law),false);
});
test('relevant legal article excerpt is retrieved from expected official page',async()=>{
 const result=await getLexuzEvidence('ishdan bo‘shatish',{fetchImpl:stub()});
 assert.equal(result.verified,true);
 assert.equal(result.editionVerified,false);
 assert.match(result.notes,/160-modda/);
 assert.match(result.notes,/https:\/\/lex\.uz\/docs\/-6257288/);
});
test('HTML shell or unrelated content cannot count as verified',async()=>{
 const shell='<html><body>'+('LexUZ portal: yuklanmoqda. '.repeat(400))+'</body></html>';
 assert.equal((await getLexuzEvidence('ishdan bo‘shatish',{fetchImpl:stub(law,shell)})).verified,false);
});
test('script-embedded fake article text is not legal evidence',()=>{
 const html='<script>var a="160-modda ishdan bo‘shatish"</script><p>Bosh sahifa</p>';
 assert.doesNotMatch(legalTextFromHtml(html),/160-modda/);
});
test('redirect to other host is not accepted',async()=>{
 assert.equal((await getLexuzEvidence('ishdan bo‘shatish',{fetchImpl:stub('https://other.invalid/docs/-6257288')})).verified,false);
});
test('redirect to different official document is not accepted',async()=>{
 assert.equal((await getLexuzEvidence('ishdan bo‘shatish',{fetchImpl:stub('https://lex.uz/docs/-111189')})).verified,false);
});
test('unmatched question does not start any network request',async()=>{
 let calls=0;
 const result=await getLexuzEvidence('qiziqish',{fetchImpl:async()=>{calls++;throw Error('must not fetch')}});
 assert.equal(result.verified,false);
 assert.equal(calls,0);
});
test('non-HTML and provider errors are rejected',async()=>{
 assert.equal((await getLexuzEvidence('ishdan bo‘shatish',{fetchImpl:stub(law,fixture,true,'application/json')})).verified,false);
 assert.equal((await getLexuzEvidence('ishdan bo‘shatish',{fetchImpl:stub(law,fixture,false)})).verified,false);
});
test('large article page without relevant topic context fails closed',()=>{
 const irrelevant=('Sarlavha va boshqa mazmun. '.repeat(250))+'160-modda fuqarolik tartibi';
 assert.equal(relevantExcerpts(irrelevant,'ishdan bo‘shatish').length,0);
});
