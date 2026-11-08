"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const source = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");

test("profile changes validate required names and 60-character limits on the server", () => {
  const route = source.slice(source.indexOf('if(req.method==="POST" && pathname==="/account/profile")'), source.indexOf('if(req.method==="GET" && pathname==="/account/security")'));
  assert.match(route, /!firstName\|\|!lastName\|\|firstName.length>60\|\|lastName.length>60/);
  assert.match(route, /accountProfilePage\(lang,u,[^\n]*true\),400/);
  assert.match(route, /u.firstName=firstName;u.lastName=lastName/);
});

test("new cases reject unsupported areas, blank titles, or overlong content", () => {
  const route = source.slice(source.indexOf('if(req.method==="POST" && pathname==="/account/cases/new")'), source.indexOf('if(req.method==="GET" && pathname==="/account/case")'));
  assert.match(route, /\["Oila huquqi","Mehnat huquqi","Biznes huquqi","Fuqarolik huquqi","Boshqa"\]\.includes\(area\)/);
  assert.match(route, /!title\|\|title.length>140\|\|description.length>1500/);
  assert.match(route, /area,title,description,status:"started"/);
});

test("case updates reject arbitrary statuses and out-of-range or non-finite progress", () => {
  const route = source.slice(source.indexOf('if(req.method==="POST" && pathname==="/account/case/update")'), source.indexOf('if(req.method==="GET" && pathname==="/account/documents")'));
  assert.match(route, /\["started","collecting","analysis","document_ready","completed"\]\.includes\(status\)/);
  assert.match(route, /!Number.isFinite\(progress\)\|\|progress<0\|\|progress>100/);
});
