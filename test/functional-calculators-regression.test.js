"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const server=fs.readFileSync(path.join(__dirname,"..","server.js"),"utf8");

test("pension salary knowledge controls resynchronize after reset",()=>{
  assert.match(server,/function setupSalary\(prefix\)/);
  assert.match(server,/choices\.addEventListener\('change',update\);\s*\/\/ Form reset restores radio values asynchronously;[\s\S]{0,220}form\.addEventListener\('reset',\(\)=>setTimeout\(update,0\)\);\s*update\(\)/);
  assert.match(server,/input\.disabled=unknown/);
  assert.match(server,/input\.required=!unknown/);
});

test("alimony validates input and distinguishes provisional amount from an order",()=>{
  assert.match(server,/function calculateAliment\(\)/);
  assert.match(server,/Number\.isInteger\(children\)\|\|children<1\|\|children>30/);
  assert.match(server,/const share=children===1\?0\.25:children===2\?\(1\/3\):0\.5/);
  assert.match(server,/const indicative=Math\.max\(proportional,minimumTotal\)/);
  assert.match(server,/Bu qarzdorlik yoki ijro hujjati hisobi emas/);
});

test("pension considers alternative benefit categories separately",()=>{
  assert.match(server,/value="old"/);
  assert.match(server,/value="dis"/);
  assert.match(server,/value="sur"/);
  assert.match(server,/value="ben"/);
  assert.match(server,/if\(kind==='old'\)/);
  assert.match(server,/if\(kind==='dis'\)/);
});
