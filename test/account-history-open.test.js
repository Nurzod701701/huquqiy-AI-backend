"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// Guard against calling .find() on a Promise instead of the loaded account DB.
// This is a source-level regression test; authenticated browser QA remains separate.
const source = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");

for (const [route, collection, item] of [
  ["/account/document", "documents", "d"],
  ["/account/chat", "conversations", "c"]
]) {
  test(route + " loads account database before accessing the personal record", () => {
    const start = source.indexOf('if(req.method==="GET" && pathname==="' + route + '")');
    assert.ok(start >= 0, route + " route must exist");
    const block = source.slice(start, start + 900);
    assert.match(block, /const db=await accountLoadDb\(\);/);
    assert.ok(block.includes("const " + item + "=db." + collection + ".find("));
    assert.ok(block.includes("x.userId===user.id"), "record must be scoped to authenticated user");
    assert.ok(!block.includes("await accountLoadDb()." + collection + ".find("));
  });
}
