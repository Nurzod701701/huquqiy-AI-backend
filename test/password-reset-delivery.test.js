"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const src = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");
const between = (start, end) => {
  const i = src.indexOf(start);
  assert.ok(i >= 0, "missing start anchor " + start);
  const j = src.indexOf(end, i + start.length);
  assert.ok(j > i, "missing end anchor " + end);
  return src.slice(i, j);
};
test("regular recovery keeps sending the six-digit OTP via accountSendEmail", () => {
  const route = between('if(req.method==="POST" && pathname==="/forgot-password")',
                        'if(req.method==="GET" && pathname==="/reset-password")');
  assert.match(route, /user\.role==="user" && user\.status==="active"/);
  assert.match(route, /accountSixDigitCode\(\)/);
  assert.match(route, /await accountSendEmail\(email,"VERIUS — parolni tiklash"/);
  assert.match(route, /resetCodeHash=accountHashPassword\(code\)/);
  assert.match(route, /resetExpiresAt=/);
});
test("recovery must not claim sending for owner, unknown or inactive addresses", () => {
  const route = between('if(req.method==="POST" && pathname==="/forgot-password")',
                        'if(req.method==="GET" && pathname==="/reset-password")');
  assert.match(route, /if\(user && user\.role==="user" && user\.status==="active"\)/);
  assert.match(route, /accountRedirect\(res,/);
});
test("recovery has a 60 second cooldown and an email resend button", () => {
  assert.match(src, /Date\.now\(\)-Date\.parse\(user\.resetSentAt\)<60000/);
  assert.match(src, /Kodni qayta yuborish \(60 soniyadan keyin\)/);
  assert.match(src, /action="\/forgot-password\?lang=\$\{lang\}"/);
});
test("owner recovery warns that OWNER_PASSWORD is an environment credential", () => {
  assert.match(src, /Admin parolini unutdingizmi\?/);
  assert.match(src, /OWNER_PASSWORD qiymatini yangilang/);
  assert.match(src, /Admin hisobining paroli bu sahifa orqali tiklanmaydi/);
});
