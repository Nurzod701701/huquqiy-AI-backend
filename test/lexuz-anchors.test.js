"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const crypto = require("node:crypto");
const { setTimeout: delay } = require("node:timers/promises");
const ax = require("../lexuz-anchors");

test("article numbers map to exact LexUZ anchors", () => {
  assert.equal(ax.articleUrl("oila", 38), "https://lex.uz/docs/-104720#-158836");
  assert.match(ax.articleUrl("mehnat", 160), /^https:\/\/lex\.uz\/docs\/-6257288#-\d+$/);
  assert.match(ax.articleUrl("fuqarolik", 735), /^https:\/\/lex\.uz\/docs\/-180552#-\d+$/, "Civil Code part II");
  assert.match(ax.articleUrl("fuqarolik", 236), /^https:\/\/lex\.uz\/docs\/-111189#-\d+$/, "Civil Code part I");
  assert.equal(ax.articleUrl("oila", 9999), null);
  assert.equal(ax.articleUrl("unknown", 1), null);
});

test("guides and AI answers link to the exact article; /lexuz redirects", { timeout: 30000 }, async () => {
  assert.match(require("../legal-guides").render("/family", "uz"), /href="https:\/\/lex\.uz\/docs\/-104720#-158836"/);
  const port = 50000 + crypto.randomInt(1, 900);
  const child = spawn(process.execPath, ["server.js"], { cwd: process.cwd(), stdio: "ignore",
    env: { ...process.env, PORT: String(port), NODE_ENV: "test", GEMINI_API_KEY: "", ACCOUNT_DATA_FILE: "/tmp/verius-anchors-" + port + ".json" } });
  const host = "http://127.0.0.1:" + port;
  try {
    let up = false;
    for (let i = 0; i < 80; i++) { try { if ((await fetch(host + "/ai")).ok) { up = true; break; } } catch (_) {} await delay(150); }
    assert.ok(up);
    let r = await fetch(host + "/lexuz/oila/38", { redirect: "manual" });
    assert.equal(r.status, 302);
    assert.equal(r.headers.get("location"), "https://lex.uz/docs/-104720#-158836");
    r = await fetch(host + "/lexuz/mehnat/9999", { redirect: "manual" });
    assert.equal(r.headers.get("location"), "https://lex.uz/docs/-6257288", "unknown article falls back to the code");
    assert.equal((await fetch(host + "/lexuz/nope/1", { redirect: "manual" })).status, 404);
  } finally { child.kill("SIGTERM"); }
});
