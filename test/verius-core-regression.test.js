"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {calculateAliment,MHTEKM}=require("../legal-calculator-rules");
const {calculateCourtFee,BHM}=require("../court-fee-rules");
const {auditOutbound}=require("../ai-egress-consent");
const advocate=require("../advokat-pro");
const citizen=require("../citizen-home");
const portal=require("../portal-choice");

test("2026 rates are dated, source-linked, and immutable",()=>{
  assert.equal(MHTEKM.amount,1360000);
  assert.equal(MHTEKM.effectiveFrom,"2026-09-01");
  assert.equal(BHM.amount,440000);
  assert.equal(BHM.effectiveFrom,"2026-09-01");
  assert.ok(MHTEKM.source.startsWith("https://"));
  assert.ok(BHM.source.startsWith("https://"));
  assert.ok(Object.isFrozen(MHTEKM));
});

test("aliment shares and per-child statutory minimum are computed explicitly",()=>{
  const min=MHTEKM.amount*.265;
  for(const [children,share] of [[1,.25],[2,1/3],[3,.5],[4,.5]]){
    const low=calculateAliment({children,income:0});
    assert.equal(low.share,share);
    assert.equal(low.minimumTotal,children*min);
    assert.equal(low.indicative,children*min);
    assert.equal(low.preliminary,true);
    const high=calculateAliment({children,income:100000000});
    assert.equal(high.proportional,100000000*share);
    assert.equal(high.indicative,high.proportional);
  }
});
test("aliment refuses incomplete, infinite or malformed fields",()=>{
  const invalid=[undefined,null,""," ",false,true,{},[],NaN,Infinity,"x"];
  for(const value of invalid){
    assert.throws(()=>calculateAliment({children:1,income:value}),/INVALID_ALIMENT_INPUT/);
    assert.throws(()=>calculateAliment({children:value,income:1000000}),/INVALID_ALIMENT_INPUT/);
  }
  for(const n of [0,-1,1.2,31])assert.throws(()=>calculateAliment({children:n,income:10}),/INVALID_ALIMENT_INPUT/);
});
test("court fee clearly distinguishes exemptions, pending review, and calculations",()=>{
  assert.equal(calculateCourtFee({claim:"alimony"}).fee,0);
  assert.equal(calculateCourtFee({claim:"labor"}).fee,0);
  assert.equal(calculateCourtFee({claim:"property",amount:1000000,exemption:"no"}).fee,BHM.amount);
  assert.equal(calculateCourtFee({claim:"property",amount:50000000,exemption:"no"}).fee,2000000);
  assert.equal(calculateCourtFee({claim:"divorce",exemption:"no"}).fee,BHM.amount*2);
  assert.equal(calculateCourtFee({claim:"divorce",exemption:"no",repeatDivorce:true}).fee,BHM.amount*4);
  assert.equal(calculateCourtFee({claim:"property",amount:50000000,exemption:"unknown"}).fee,null);
  assert.equal(calculateCourtFee({claim:"business",businessParties:"unknown",exemption:"no"}).fee,null);
});
test("court fee rejects malformed numeric inputs and never calculates an invented sum",()=>{
  for(const bad of [null,""," ",false,true,{},[],Infinity,"ten"]){
    assert.throws(()=>calculateCourtFee({claim:"property",amount:bad,exemption:"no"}),/INVALID_FEE_INPUT/);
  }
  assert.equal(calculateCourtFee({claim:"property",amount:0,exemption:"no"}).fee,null);
});
test("AI outbound preflight still prevents private material from being sent",()=>{
  const safe=auditOutbound([{role:"user",content:"Pasport AA1234567 bo‘yicha savol"}]);
  assert.doesNotMatch(JSON.stringify(safe),/AA1234567/);
  assert.throws(()=>auditOutbound([{role:"user",content:"-----BEGIN PRIVATE KEY-----"}]),/AI_PRIVACY_UNVERIFIED_CONTENT/);
});
test("advocate documents render all export actions without hiding legal disclaimers",()=>{
  for(const lang of ["uz","ru","en"]){
    const html=advocate(lang,(_lang,_area,body)=>body);
    for(const id of ["apGenerate","apSave","apLoad","apWord","apPrint","apTxt","apSource"]){
      assert.ok(html.includes('id="'+id+'"'),lang+":"+id);
    }
    assert.match(html,/VERIUS PROFESSIONAL/);
    assert.match(html,/Hujjatni topshirishdan oldin advokat tekshiradi/);
    assert.match(html,/claim-download/);
    assert.doesNotMatch(html,/QOMUS/);
  }
});
test("citizen and entry routes still show VERIUS in all languages",()=>{
  for(const lang of ["uz","ru","en"]){
    const citizenHtml=citizen(lang);
    assert.match(citizenHtml,/VERIUS/);
    assert.doesNotMatch(citizenHtml,/QOMUS/);
    const entryHtml=portal(lang);
    assert.match(entryHtml,/VERIUS/);
    assert.doesNotMatch(entryHtml,/QOMUS/);
  }
});
