"use strict";
/**
 * Conservative, offline Uzbek Latin spelling hints for narrative motion fields.
 * Only exact known misspellings; no factual, legal, identity or numeric rewriting.
 * Does not alter quoted evidence, add facts or infer legal conclusions.
 */
const REPLACEMENTS = Object.freeze({
  "sohtalashtirish":"soxtalashtirish",
  "sohtalashtirilgan":"soxtalashtirilgan",
  "sohtalashtirgan":"soxtalashtirgan",
  "sohtalashtirishga":"soxtalashtirishga",
  "sohtalashtirishmagan":"soxtalashtirishmagan",
  "sohtalashtirilmadi":"soxtalashtirilmadi",
  "himoay":"himoya",
  "himoaymdagi":"himoyamdagi",
  "himoaym":"himoyam",
  "himoymdagi":"himoyamdagi",
  "himosidagi":"himoyasidagi",
  "tumat":"tuhmat",
  "tuxmat":"tuhmat",
  "tuhmatkilik":"tuhmatchilik",
  "komputer":"kompyuter",
  "kompyutr":"kompyuter",
  "kompyuterdgi":"kompyuterdagi",
  "yozishmalr":"yozishmalar",
  "yozishmalrni":"yozishmalarni",
  "yozishmalani":"yozishmalarni",
  "tekshrib":"tekshirib",
  "tekshirb":"tekshirib",
  "tekshirishizni":"tekshirishingizni",
  "hujjani":"hujjatni",
  "hujatni":"hujjatni",
  "hujat":"hujjat",
  "hujjatlani":"hujjatlarni",
  "hujjatlarani":"hujjatlarni",
  "holt":"holat",
  "holtni":"holatni",
  "shax":"shaxs",
  "shaxni":"shaxsni",
  "shaxning":"shaxsning",
  "malumot":"ma’lumot",
  "malumotlar":"ma’lumotlar",
  "malumotlarni":"ma’lumotlarni",
  "sorayman":"so‘rayman",
  "soraymiz":"so‘raymiz",
  "aniqlashtirsh":"aniqlashtirish",
  "aniqlashtrish":"aniqlashtirish",
  "bolmagan":"bo‘lmagan",
  "bolgan":"bo‘lgan",
  "bolishi":"bo‘lishi",
  "bogliq":"bog‘liq",
  "boyicha":"bo‘yicha",
  "shundayam":"shunday ham",
  "qoshimcha":"qo‘shimcha",
  "togrisida":"to‘g‘risida",
  "togri":"to‘g‘ri",
  "qollanilgan":"qo‘llanilgan",
  "qollash":"qo‘llash",
  "o'rganish":"o‘rganish",
  "ayiblanuvchi":"ayblanuvchi",
  "ayblanvuchi":"ayblanuvchi",
  "ayiblanuchi":"ayblanuvchi"
});
const NARRATIVE_FIELDS = Object.freeze(["facts","evidence","relevance","issue","digitalProvenance","expertQuestions","action","attachments"]);
const PRESERVE_FIELDS = Object.freeze(["authority","lawyer","orderNumber","caseReference","stage","accused","charge","proceduralRole","date","signature"]);
const TOKEN = /[A-Za-zÀ-ÖØ-öø-ÿʻʼ‘’'\u0400-\u04FF]+/gu;
function correctSpelling(text){
  let count=0;
  const original=String(text??"");
  const corrected=original.replace(TOKEN,token=>{
    const replacement=REPLACEMENTS[token.toLocaleLowerCase("uz")];
    if(!replacement || replacement===token)return token;
    // Keep uppercase abbreviations and identifiers untouched.
    if(token.length>2 && token===token.toLocaleUpperCase("uz"))return token;
    count++;
    return token[0]===token[0].toLocaleUpperCase("uz")
      ? replacement[0].toLocaleUpperCase("uz")+replacement.slice(1):replacement;
  });
  return {text:corrected,count,changed:count>0};
}
function correctNarrativeFields(form){
  const next={...form};
  let count=0;
  for(const key of NARRATIVE_FIELDS){
    if(typeof next[key]!=="string")continue;
    const result=correctSpelling(next[key]);
    next[key]=result.text;
    count+=result.count;
  }
  return {form:next,count};
}
module.exports={correctSpelling,correctNarrativeFields,NARRATIVE_FIELDS,PRESERVE_FIELDS,REPLACEMENTS};
