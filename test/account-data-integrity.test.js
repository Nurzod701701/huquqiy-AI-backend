"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const source = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");
const start = source.indexOf("async function accountLoadDb(){");
const end = source.indexOf("async function accountSaveDb", start);
test("account load fails closed on unreadable or corrupt data", () => {
  assert.ok(start >= 0 && end > start, "account load function is present");
  const block = source.slice(start, end);
  assert.match(block, /if\(!fs\.existsSync\(ACCOUNT_DATA_FILE\)\) return accountEmptyDb\(\)/);
  assert.match(block, /catch\(err\)\{ console\.error\("ACCOUNT DB LOAD ERROR",err\); throw err; \}/);
  assert.doesNotMatch(block, /catch\(err\)[^}]+return accountEmptyDb/);
});
