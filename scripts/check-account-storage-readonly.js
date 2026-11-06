"use strict";
// Non-destructive storage readiness diagnostic. Does not read personal data or write files.
// Run inside the target Render instance; result describes configuration and metadata only.
const fs=require("node:fs"),path=require("node:path");
const configured=process.env.ACCOUNT_DATA_FILE||path.join(process.cwd(),"QOMUS-data.json");
const mount="/var/data";
function inspect(target){
 try{
  const s=fs.statSync(target);
  return {exists:true,isDirectory:s.isDirectory(),isFile:s.isFile(),ownerWritable:!!(s.mode&0o200),
    processWritable:fs.constants.W_OK&&(()=>{try{fs.accessSync(target,fs.constants.W_OK);return true;}catch{return false;}})()};
 }catch(e){return {exists:false,errorCode:e.code||"UNKNOWN"};}
}
const directory=path.dirname(configured);
const folder=inspect(directory);
const disk=inspect(mount);
const file=inspect(configured);
const onPersistentDisk=configured.startsWith(mount+path.sep);
const ok=onPersistentDisk&&disk.exists&&disk.isDirectory&&folder.exists&&folder.processWritable&&(!file.exists||file.processWritable);
console.log(JSON.stringify({check:"QOMUS_ACCOUNT_STORAGE",configuredFile:"[REDACTED]",targetIsPersistentMount:onPersistentDisk,
  diskMountExists:disk.exists,diskMountDirectory:!!disk.isDirectory,
  targetDirectoryExists:folder.exists,targetDirectoryWritable:!!folder.processWritable,
  targetFileExists:file.exists,targetFileWritable:file.exists?!!file.processWritable:null,
  ready:ok},null,2));
if(!ok)process.exitCode=1;
