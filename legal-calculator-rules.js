"use strict";
// Date-bound official rate; re-check after changes to the minimum wage.
// Oila kodeksi, 99-modda. Output is indicative, not a court decision.
const MHTEKM=Object.freeze({amount:1360000,effectiveFrom:"2026-09-01",source:"https://advice.adliya.uz/oz/document/2934"});
const FAMILY_CODE_URL="https://lex.uz/docs/-104720";

function requiredNumber(value) {
  // Number("") / Number(null) are zero: silently accepting empty fields
  // produces misleading legal calculations.
  if(value===null || value===undefined || typeof value==="boolean" ||
     typeof value==="object" || (typeof value==="string" && !value.trim())) {
    throw Error("INVALID_ALIMENT_INPUT");
  }
  const parsed=Number(value);
  if(!Number.isFinite(parsed))throw Error("INVALID_ALIMENT_INPUT");
  return parsed;
}
function calculateAliment({children,income}={}) {
 const n=requiredNumber(children), money=requiredNumber(income);
 if(!Number.isInteger(n)||n<1||n>30||money<0||money>1e12)throw Error("INVALID_ALIMENT_INPUT");
 const share=n===1?1/4:n===2?1/3:1/2;
 const proportional=money*share,minimumPerChild=MHTEKM.amount*.265;
 const minimumTotal=n*minimumPerChild;
 return {children:n,share,proportional,minimumPerChild,minimumTotal,
   indicative:Math.max(proportional,minimumTotal),mhtEKM:MHTEKM.amount,
   effectiveFrom:MHTEKM.effectiveFrom,source:MHTEKM.source,
   legalSource:FAMILY_CODE_URL,preliminary:true};
}
module.exports={calculateAliment,MHTEKM,FAMILY_CODE_URL};
