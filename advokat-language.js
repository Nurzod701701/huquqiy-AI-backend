"use strict";
// Existing routes only: keep the original forms and all handlers unchanged.
const shell=require("./advokat-ui-shell");
module.exports=function(language,pathname,html){
 return shell.enhance(language,pathname,html);
};
