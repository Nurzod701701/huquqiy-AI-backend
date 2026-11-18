"use strict";
// GEMINI_API_KEY_2: quota (429) or auth problems on the first key move to the
// backup key; model overload (503) moves to the fallback model instead.
const test = require("node:test"), assert = require("node:assert/strict");
const http = require("node:http");
const crypto = require("node:crypto");
const { spawn } = require("node:child_process");
const { setTimeout: delay } = require("node:timers/promises");
const { sanitizeText } = require("../ai-egress-consent");

test("backup Gemini key takes over when the first key is out of quota", { timeout: 40000 }, async () => {
  let mode = "quota";
  const seen = [];
  const mock = http.createServer((req, res) => {
    let body = "";
    req.on("data", c => (body += c));
    req.on("end", () => {
      const json = JSON.parse(body || "{}");
      const key = String(req.headers.authorization || "").replace("Bearer ", "");
      seen.push(key + "|" + json.model);
      const send = (s, o) => { res.writeHead(s, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
      if (mode === "quota" && key === "key-one") return send(429, { error: { message: "quota", status: "RESOURCE_EXHAUSTED" } });
      if (mode === "badkey" && key === "key-one") return send(400, [{ error: { message: "API key not valid.", status: "INVALID_ARGUMENT" } }]);
      if (mode === "overload" && json.model === "gemini-3.8-flash") return send(503, { error: { message: "high demand", status: "UNAVAILABLE" } });
      if (mode === "allquota") return send(429, { error: { message: "quota", status: "RESOURCE_EXHAUSTED" } });
      send(200, { choices: [{ message: { content: "ANSWER " + key + " " + json.model } }] });
    });
  });
  await new Promise(r => mock.listen(0, "127.0.0.1", r));
  const port = 47000 + crypto.randomInt(1, 2000);
  const child = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(), stdio: "ignore",
    env: { ...process.env, PORT: String(port), NODE_ENV: "test", GEMINI_API_KEY: "key-one", GEMINI_API_KEY_2: "key-two",
      GEMINI_MODEL: "", GEMINI_FALLBACK_MODEL: "", GEMINI_API_BASE: "http://127.0.0.1:" + mock.address().port,
      ACCOUNT_DATA_FILE: "/tmp/verius-backup-key-" + port + ".json" }
  });
  const host = "http://127.0.0.1:" + port;
  const post = (route, body) => fetch(host + route, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded", origin: host }, body: new URLSearchParams(body) });
  async function ask(q) {
    seen.length = 0;
    const ph = await (await post("/ai-preview", { question: q })).text();
    const token = ph.match(/name="aiConsentToken" value="([^"]+)"/)[1];
    return (await post("/ai-result", { question: sanitizeText(q), aiConsentToken: token, aiConsent: "yes" })).text();
  }
  try {
    let up = false;
    for (let i = 0; i < 80; i++) { try { if ((await fetch(host + "/ai")).ok) { up = true; break; } } catch (_) {} await delay(150); }
    assert.ok(up);

    let html = await ask("Ish haqi bo‘yicha savol bor, nima qilaman?");
    assert.match(html, /ANSWER key-two gemini-3\.8-flash/);
    assert.deepEqual(seen, ["key-one|gemini-3.8-flash", "key-two|gemini-3.8-flash"]);
    assert.doesNotMatch(html, /zaxira Gemini modeli/, "same model, only the key changed");

    mode = "badkey";
    html = await ask("Aliment bo‘yicha savol bor, nima qilaman?");
    assert.match(html, /ANSWER key-two gemini-3\.8-flash/);

    mode = "overload";
    html = await ask("Meros bo‘yicha savol bor, nima qilaman?");
    assert.match(html, /ANSWER key-one gemini-3\.5-flash-lite/);
    assert.deepEqual(seen, ["key-one|gemini-3.8-flash", "key-one|gemini-3.5-flash-lite"], "503 is model-level: no key retry");

    mode = "allquota";
    html = await ask("Ijara bo‘yicha savol bor, nima qilaman?");
    assert.match(html, /Gemini so‘rovlar limiti/);
    assert.equal(seen.length, 4);
  } finally {
    child.kill("SIGTERM");
    mock.close();
  }
});
