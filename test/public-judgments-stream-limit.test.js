"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {ReadableStream}=require("node:stream/web");
const {readBoundedHtml}=require("../public-judgments");

function makeResponse(chunks){
 const data=chunks.map(x=>new TextEncoder().encode(x));
 return {body:new ReadableStream({start(controller){data.forEach(x=>controller.enqueue(x));controller.close()}})};
}

test("public judgment reader accepts bounded stream and preserves UTF-8",async()=>{
 const html="<table><tr><td>Qaror</td><td>O‘zbekiston</td></tr></table>";
 const text=await readBoundedHtml(makeResponse([html.slice(0,12),html.slice(12)]),200);
 assert.equal(text,html);
});

test("public judgment reader rejects streaming oversized body",async()=>{
 await assert.rejects(()=>readBoundedHtml(makeResponse(["x".repeat(50),"y".repeat(50)]),80),/Response too large/);
});

test("public judgment reader rejects large fallback nonstreaming body",async()=>{
 await assert.rejects(()=>readBoundedHtml({text:async()=> "z".repeat(99)},70),/Response too large/);
});
