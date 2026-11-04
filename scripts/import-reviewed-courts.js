"use strict";
/**
 * Import human-reviewed PUBLIC court decision records only.
 * Usage:
 *   node scripts/import-reviewed-courts.js ./reviewed-input.json
 *   QOMUS_COURT_CORPUS_PATH=/persistent/courts.json node scripts/import-reviewed-courts.js ./reviewed-input.json
 * The input must be {version:1,items:[...]}, with reviewStatus:"approved" on every item.
 * This tool does not download or approve decisions.
 */
const fs=require("node:fs");
const path=require("node:path");
const {validated,corpusPath}=require("../court-practice-reasoning");
const MAX_BYTES=8*1024*1024;
function parseRecords(filename){
 const stats=fs.statSync(filename);
 if(stats.size>MAX_BYTES)throw Error("Input exceeds 8 MB");
 const json=JSON.parse(fs.readFileSync(filename,"utf8"));
 if(json?.version!==1||!Array.isArray(json.items))throw Error("Expected {version:1, items:[...]}");
 if(json.items.length>10000)throw Error("Too many court decisions (maximum 10000)");
 const seen=new Set(),items=[];
 for(const [index,raw] of json.items.entries()){
  const item=validated(raw);
  if(!item)throw Error("Unapproved/invalid court decision at item "+(index+1));
  const key=[item.court.toLocaleLowerCase("uz"),item.caseNumber.toLocaleLowerCase("uz"),item.decisionDate].join("|");
  if(seen.has(key))throw Error("Duplicate court decision at item "+(index+1));
  seen.add(key);items.push(item);
 }
 return {version:1,items};
}
function saveReviewed(input,target=corpusPath()){
 if(!path.isAbsolute(target))throw Error("Destination must be an absolute path");
 const reviewed=parseRecords(input);
 const output=JSON.stringify(reviewed,null,2)+"\n";
 if(Buffer.byteLength(output)>MAX_BYTES)throw Error("Reviewed corpus exceeds 8 MB");
 fs.mkdirSync(path.dirname(target),{recursive:true,mode:0o700});
 const temp=path.join(path.dirname(target),".court-reviewed-"+process.pid+"-"+Date.now()+".tmp");
 try{
  fs.writeFileSync(temp,output,{mode:0o600,flag:"wx"});
  fs.renameSync(temp,target);
 }finally{try{fs.unlinkSync(temp)}catch(_){}}
 return reviewed.items.length;
}
if(require.main===module){
 try{
  if(process.argv.length!==3)throw Error("Usage: node scripts/import-reviewed-courts.js reviewed-input.json");
  const count=saveReviewed(path.resolve(process.argv[2]));
  console.log("Imported "+count+" human-reviewed public court decisions.");
 }catch(error){console.error("Import rejected: "+error.message);process.exitCode=1;}
}
module.exports={parseRecords,saveReviewed};
