"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");
const registration = source.slice(source.indexOf('if(req.method==="POST" && pathname==="/register")'), source.indexOf('if(req.method==="POST" && pathname==="/resend-verification")'));
test("registration validates trimmed names and length bounds before saving", () => {
  assert.match(registration, /const firstName=String\(f\.firstName\|\|""\)\.trim\(\), lastName=String\(f\.lastName\|\|""\)\.trim\(\)/);
  assert.match(registration, /!firstName\|\|!lastName\|\|firstName\.length>60\|\|lastName\.length>60/);
  assert.match(registration, /firstName:firstName,lastName:lastName,email,passwordHash/);
});
test("registration requires structured email and limits its size", () => {
  assert.match(registration, /email\.length>254/);
  assert.match(registration, /\^\[\^\\s@\]\+@\[\^\\s@\]\+\\\.\[\^\\s@\]\+\$/);
  assert.doesNotMatch(registration, /email\.includes\("@"\)/);
});
