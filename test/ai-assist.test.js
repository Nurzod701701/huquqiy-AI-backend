"use strict";
// Gemini integration: AI panel on tool pages, consent/privacy gates, rate limit,
// long-task mode and timeout fallback — against a local mock Gemini API.
const test = require("node:test"), assert = require("node:assert/strict");
const http = require("node:http");
const crypto = require("node:crypto");
const { spawn } = require("node:child_process");
const { setTimeout: delay } = require("node:timers/promises");
const { sanitizeText } = require("../ai-egress-consent");
const assist = require("../ai-assist");

test("every AI tool route maps to a panel and the panel is injected inside <main>", () => {
  const routes = Object.keys(assist.ROUTE_TO_TOOL);
  assert.equal(routes.length, 8);
  for (const route of routes) {
    const html = assist.inject("<html><body><main><p>x</p></main><footer>f</footer></body></html>", route, "uz");
    assert.match(html, /<section class="vai-root" id="vai-[a-z-]+"/);
    assert.ok(html.indexOf("vai-root") < html.indexOf("</main>"), "panel before </main> on " + route);
  }
  assert.equal(assist.inject("<main></main>", "/pension", "uz"), "<main></main>", "calculators keep no AI panel");
});

test("panel script cannot be broken out of by page language strings", () => {
  const html = assist.widget("doc-check", "en");
  assert.doesNotMatch(html.split("<script>")[1].split("</script>")[0], /<\/script/i);
});

test("error codes map Gemini failures to user-facing categories", () => {
  assert.equal(assist.errorCode(new Error("AI_RATE_LIMIT")), "rate");
  assert.equal(assist.errorCode(new Error("AI_AUTH_FAILED")), "auth");
  assert.equal(assist.errorCode(new Error("GEMINI_API_KEY topilmadi.")), "auth");
  assert.equal(assist.errorCode(new Error("AI_TIMEOUT")), "timeout");
  assert.equal(assist.errorCode(new Error("AI_HTTP_500")), "failed");
});

test("Gemini panel end to end: pages, consent, privacy, long mode, fallback, limits", { timeout: 60000 }, async () => {
  let mode = "ok";
  const seen = [];
  const mock = http.createServer((req, res) => {
    let body = "";
    req.on("data", c => (body += c));
    req.on("end", async () => {
      const json = body ? JSON.parse(body) : {};
      seen.push(json);
      const send = (s, o) => { res.writeHead(s, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
      if (mode === "slowPrimary" && json.model === "gemini-3.8-flash") await delay(2500);
      send(200, { choices: [{ message: { content: "**JIDDIY KAMCHILIKLAR**\nMOCK_GEMINI from " + json.model } }] });
    });
  });
  await new Promise(r => mock.listen(0, "127.0.0.1", r));
  const port = 44000 + crypto.randomInt(1, 2000);
  const child = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port), NODE_ENV: "test", GEMINI_API_KEY: "test-key", GEMINI_MODEL: "",
      GEMINI_FALLBACK_MODEL: "", GEMINI_API_BASE: "http://127.0.0.1:" + mock.address().port,
      GEMINI_PRIMARY_TIMEOUT_MS: "1200", ACCOUNT_DATA_FILE: "/tmp/verius-ai-assist-" + port + ".json" },
    stdio: "ignore"
  });
  const host = "http://127.0.0.1:" + port;
  const post = (route, body) => fetch(host + route, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded", origin: host }, body: new URLSearchParams(body) });
  try {
    let up = false;
    for (let i = 0; i < 80; i++) { try { if ((await fetch(host + "/ai")).ok) { up = true; break; } } catch (_) {} await delay(150); }
    assert.ok(up, "server did not start");

    for (const route of Object.keys(assist.ROUTE_TO_TOOL)) {
      const html = await (await fetch(host + route + "?lang=uz")).text();
      assert.match(html, new RegExp('id="vai-' + assist.ROUTE_TO_TOOL[route] + '"'), "panel on " + route);
    }
    assert.doesNotMatch(await (await fetch(host + "/pension?lang=uz")).text(), /vai-root/);

    // Privacy gate: secrets are refused before anything reaches Gemini.
    let r = await post("/ai-assist-preview", { tool: "doc-check", text: "Shartnoma matni. password: SuperSecret123 bilan kiring" });
    assert.equal(r.status, 422);
    // Unknown tool and empty text are rejected.
    assert.equal((await post("/ai-assist-preview", { tool: "nope", text: "x".repeat(50) })).status, 400);
    assert.equal((await post("/ai-assist-preview", { tool: "doc-check", text: "qisqa" })).status, 400);

    const raw = "Hujjat matni: Da’vo arizasi. Javobgar pasport AA1234567. Talab: qarzni undirish 5 000 000 so‘m.";
    r = await post("/ai-assist-preview", { tool: "doc-check", text: raw });
    assert.equal(r.status, 200);
    const preview = await r.json();
    assert.ok(preview.ok && preview.token);
    assert.doesNotMatch(preview.redacted, /AA1234567/, "passport must be redacted before preview");
    assert.equal(preview.redacted, sanitizeText(raw));

    const before = seen.length;
    assert.equal((await post("/ai-assist-result", { tool: "doc-check", text: preview.redacted, aiConsentToken: preview.token })).status, 403, "no opt-in");
    assert.equal((await post("/ai-assist-result", { tool: "doc-check", text: preview.redacted + " o‘zgardi", aiConsentToken: preview.token, aiConsent: "yes" })).status, 403, "tampered text");
    assert.equal((await post("/ai-assist-result", { tool: "evidence-review", text: preview.redacted, aiConsentToken: preview.token, aiConsent: "yes" })).status, 403, "token bound to tool");
    assert.equal(seen.length, before, "nothing sent to Gemini without valid consent");

    r = await post("/ai-assist-result", { tool: "doc-check", text: preview.redacted, aiConsentToken: preview.token, aiConsent: "yes" });
    assert.equal(r.status, 200);
    const result = await r.json();
    assert.ok(result.ok);
    assert.match(result.html, /MOCK_GEMINI from gemini-3\.8-flash/);
    assert.doesNotMatch(result.html, /\*\*/, "markdown bold is cleaned");
    const sent = seen.at(-1);
    assert.equal(sent.max_tokens, 8192, "tool panels use the long output budget");
    assert.match(sent.messages[0].content, /DOCUMENT TASK/);
    assert.match(sent.messages.at(-1).content, /JIDDIY KAMCHILIKLAR/);
    assert.doesNotMatch(JSON.stringify(sent), /AA1234567/);

    // Primary model times out -> fallback model answers.
    mode = "slowPrimary";
    const p2 = await (await post("/ai-assist-preview", { tool: "grounded", text: "Faktlar: ishchi ishdan noqonuniy bo‘shatildi, buyruq berilmagan." })).json();
    const r2 = await (await post("/ai-assist-result", { tool: "grounded", text: p2.redacted, aiConsentToken: p2.token, aiConsent: "yes" })).json();
    assert.ok(r2.ok);
    assert.match(r2.html, /MOCK_GEMINI from gemini-3\.5-flash-lite/);
    assert.match(r2.html, /zaxira Gemini modeli/);
    mode = "ok";

    // Short Q&A keeps the short budget.
    const q = "Ishdan ketmoqchiman, necha kun oldin ariza beraman?";
    const ph = await (await post("/ai-preview", { question: q })).text();
    const token = ph.match(/name="aiConsentToken" value="([^"]+)"/)[1];
    assert.equal((await post("/ai-result", { question: sanitizeText(q), aiConsentToken: token, aiConsent: "yes" })).status, 200);
    assert.equal(seen.at(-1).max_tokens, 2048);
    assert.doesNotMatch(seen.at(-1).messages[0].content, /DOCUMENT TASK/);

    // Per-client limit: 8 AI panel calls per 10 minutes (2 used above).
    let last;
    for (let i = 0; i < 7; i++) {
      const p = await (await post("/ai-assist-preview", { tool: "criminal-advisor", text: "Vaziyat: meni guvoh sifatida chaqirishdi, nima qilaman? " + i })).json();
      last = await post("/ai-assist-result", { tool: "criminal-advisor", text: p.redacted, aiConsentToken: p.token, aiConsent: "yes" });
      if (i < 6) assert.equal(last.status, 200, "call " + i);
    }
    assert.equal(last.status, 429);
    assert.equal((await last.json()).error, "busy");
  } finally {
    child.kill("SIGTERM");
    mock.close();
  }
});
