"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {models,freeOnly,offlineAnswer,publicLookup}=require("../ai-cost-control");
const cache=require("../lexuz-public-cache");
test("free-only is the default and excludes all priced model IDs",()=>{
 assert.equal(freeOnly({AI_MODEL:"gpt-4.1-mini"}),true);
 assert.deepEqual(models({AI_MODEL:"gpt-4.1-mini"}),["openrouter/free"]);
 assert.deepEqual(models({QOMUS_AI_COST_MODE:"free_only",AI_MODEL:"anthropic/claude-sonnet-4"}),["openrouter/free"]);
 assert.deepEqual(models({QOMUS_AI_COST_MODE:"paid_opt_in",AI_MODEL:"gpt-4.1-mini"}),["gpt-4.1-mini","openrouter/free"]);
});
test("offline fallback offers official sources without claiming verified articles",()=>{
 const out=offlineAnswer("Ish haqi to‘lanmadi, qanday huquqlarim bor?","uz");
 assert.match(out,/https:\/\/lex\.uz\/docs\/-6257288/);
 assert.match(out,/AI xizmati hozir javob bera olmadi/);
 assert.doesNotMatch(out,/160-moddasi|14 kalendar kun/);
 assert.deepEqual(publicLookup("unknown random question"),[]);
});
test("public document cache reuses only public URLs and does not cache failed fetches",async()=>{
 cache.clear();let calls=0;
 const first=await cache.publicDocument("https://lex.uz/docs/-6257288",async()=>{calls++;return "public official html";});
 const second=await cache.publicDocument("https://lex.uz/docs/-6257288",async()=>{calls++;return "different";});
 assert.equal(first,"public official html");assert.equal(second,first);assert.equal(calls,1);
 await assert.rejects(cache.publicDocument("https://lex.uz/docs/-999",async()=>{throw Error("unavailable")}),/unavailable/);
 assert.equal(await cache.publicDocument("https://lex.uz/docs/-999",async()=>{calls++;return "retried";}),"retried");
 cache.clear();
});
