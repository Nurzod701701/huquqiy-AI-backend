"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const crypto = require("node:crypto");
const { setTimeout: delay } = require("node:timers/promises");
const guides = require("../legal-guides");

test("guides cite only official LexUZ codes and link actions inside the site", () => {
  for (const [path, g] of Object.entries(guides.GUIDES)) {
    assert.ok(g.items.length >= 4 && g.facts.length === 4, path);
    for (const it of g.items) {
      assert.ok(it.steps.length >= 3 && it.docs.length >= 1 && it.ask.length > 10, it.title);
      for (const [, url] of it.law) assert.match(url, /^https:\/\/lex\.uz\/docs\/-(104720|6257288)$/);
      for (const [, href] of it.actions) assert.match(href, /^\/[a-z-]/);
    }
  }
  const html = guides.render("/family", "uz");
  assert.match(html, /99-modda/);
  assert.match(html, /\/ai\?lang=uz&amp;q=/);
  assert.equal(guides.render("/family", "ru"), "", "Uzbek-only for now");
  assert.equal(guides.render("/pension", "uz"), "");
});

test("family and labour pages show the guide; phones get the compact section row", { timeout: 30000 }, async () => {
  const port = 49000 + crypto.randomInt(1, 900);
  const child = spawn(process.execPath, ["server.js"], { cwd: process.cwd(), stdio: "ignore",
    env: { ...process.env, PORT: String(port), NODE_ENV: "test", GEMINI_API_KEY: "", ACCOUNT_DATA_FILE: "/tmp/verius-guides-" + port + ".json" } });
  const host = "http://127.0.0.1:" + port;
  try {
    let up = false;
    for (let i = 0; i < 80; i++) { try { if ((await fetch(host + "/ai")).ok) { up = true; break; } } catch (_) {} await delay(150); }
    assert.ok(up);
    for (const p of ["/family", "/employment"]) {
      const html = await (await fetch(host + p + "?lang=uz")).text();
      assert.match(html, /class="lg"/, p);
      assert.ok(html.indexOf('class="lg"') > html.indexOf('class="appHeader"'), "guide follows the page hero on " + p);
      assert.match(html, /id="verius-compact-sections"/);
    }
    assert.doesNotMatch(await (await fetch(host + "/family?lang=ru")).text(), /class="lg"/);
  } finally { child.kill("SIGTERM"); }
});
