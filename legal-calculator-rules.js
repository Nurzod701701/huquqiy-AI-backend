"use strict";
// Date-bound official rates: verify when PF-115 or minimum wage changes.
// Oila kodeksi article 99: statutory minimum is 26.5% of MHTEKM per child.
const MHTEKM={amount:1360000,effectiveFrom:"2026-09-01",source:"https://advice.adliya.uz/oz/document/2934"};
const FAMILY_CODE_URL="https://lex.uz/docs/-104720";
function calculateAliment({children,income}){
 const n=Number(children),money=Number(income);
 if(!Number.isInteger(n)||n<1||n>30||!Number.isFinite(money)||money<0||money>1e12)throw Error("INVALID_ALIMENT_INPUT");
 const share=n===1?1/4:n===2?1/3:1/2;
 const proportional=money*share,minimumPerChild=MHTEKM.amount*.265;
 const minimumTotal=n*minimumPerChild;
 return {children:n,share,proportional,minimumPerChild,minimumTotal,
   indicative:Math.max(proportional,minimumTotal),mhtEKM:MHTEKM.amount,
   effectiveFrom:MHTEKM.effectiveFrom};
}
module.exports={calculateAliment,MHTEKM,FAMILY_CODE_URL};
