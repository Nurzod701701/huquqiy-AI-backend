"use strict";
const BHM=Object.freeze({amount:440000,effectiveFrom:"2026-09-01",source:"https://lex.uz/uz/acts/-4680944"});
function calculateCourtFee({claim,amount=0,exemption="unknown",businessParties="unknown",repeatDivorce=false},rate=BHM.amount){
 const money=Number(amount);
 if(!Number.isFinite(rate)||rate<=0||!Number.isFinite(money)||money<0||money>1e15)throw Error("INVALID_FEE_INPUT");
 if(claim==="alimony"||claim==="labor")return {fee:0,multiplier:0,formula:"exempt_plaintiff",reason:"plaintiff_exempt_only"};
 if(exemption!=="no")return {fee:null,formula:"exemption_unverified"};
 if(claim==="divorce")return {fee:rate*(repeatDivorce?4:2),formula:repeatDivorce?"BHM × 4":"BHM × 2"};
 if(claim==="property"){
   if(money<=0)return {fee:null,formula:"claim_amount_required"};
   return {fee:Math.max(money*0.04,rate),formula:"max(claim × 4%, 1 BHM)",ratePercent:4,min:rate};
 }
 if(claim==="business"&&businessParties==="entrepreneurs"){
   if(money<=0)return {fee:null,formula:"claim_amount_required"};
   return {fee:Math.max(money*0.02,rate),formula:"max(claim × 2%, 1 BHM)",ratePercent:2,min:rate};
 }
 return {fee:null,formula:"court_or_rate_requires_review"};
}
module.exports={BHM,calculateCourtFee};
