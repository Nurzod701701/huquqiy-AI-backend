"use strict";
// Real HTTP: every inline <script> on every public page (and the signed-in
// cabinet) must compile. Catches template-literal escaping bugs such as a
// "\n" inside a server-side `...` template turning into a raw line break in
// the browser's JS (which silently killed the claim evidence upload).
const test = require("node:test"), assert = require("node:assert/strict");
const { spawn } = require("node:child_process"), fs = require("node:fs"), os = require("node:os"), path = require("node:path"), net = require("node:net"), crypto = require("node:crypto");
const vm = require("node:vm");
const { setTimeout: delay } = require("node:timers/promises");
function port() { return new Promise((resolve, reject) => { const s = net.createServer(); s.once("error", reject); s.listen(0, "127.0.0.1", () => { const n = s.address().port; s.close(() => resolve(n)); }); }); }

const PUBLIC = ["/", "/fuqarolar", "/fuqarolar?classic=1", "/ai", "/claim", "/claim?type=debt_recovery_claim", "/claim?type=divorce_claim",
  "/documents", "/legal-review", "/family", "/business", "/employment", "/employment-contracts", "/employment-contracts?id=1",
  "/calculators", "/pension", "/court", "/court-costs", "/business-contract-costs", "/sources", "/questionnaire",
  "/criminal", "/criminal/advisor", "/advokat-pro", "/advokat-pro/check", "/advokat-pro/grounded", "/advokat-pro/court-practice",
  "/advokat-pro/documents", "/advokat-pro/cases", "/advokat-pro/calendar", "/advokat-pro/public-judgments", "/advokat-pro/criminal",
  "/advokat-pro/criminal/advisor", "/advokat-pro/criminal/draft", "/advokat-pro/criminal/evidence-review", "/advokat-pro/criminal/workbench",
  "/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/admin/login", "/privacy", "/terms"];
const SIGNED_IN = ["/account", "/account/modules", "/account/advokat", "/account/cases", "/account/cases/new", "/account/documents",
  "/account/chats", "/account/notifications", "/account/profile", "/account/security", "/account/settings"];

function brokenScripts(html) {
  const out = [], re = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi; let m, i = 0;
  while ((m = re.exec(html))) {
    i++;
    if (/type=["']?(?!text\/javascript|module)[a-z]/i.test(m[1])) continue; // JSON / templates
    try { new vm.Script(m[2], { filename: "inline-" + i }); }
    catch (e) { out.push("script #" + i + ": " + e.message); }
  }
  return out;
}

test("every inline script on every page compiles (uz/ru/en, guest and signed-in)", { timeout: 240000 }, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "verius-scripts-")), n = await port(), base = "http://127.0.0.1:" + n;
  const salt = crypto.randomBytes(16).toString("hex"), token = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(path.join(dir, "data.json"), JSON.stringify({ users: [{ id: "USR-T", firstName: "Test", lastName: "User", email: "t@example.invalid",
    passwordHash: salt + ":" + crypto.scryptSync("x-Password-1", salt, 64).toString("hex"), role: "user", status: "active", emailVerified: true }],
    sessions: [{ id: "SES-T", tokenHash: crypto.createHash("sha256").update(token).digest("hex"), userId: "USR-T", createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 3600000).toISOString() }],
    cases: [], documents: [], conversations: [], notifications: [], consents: [], auditLogs: [], settings: {} }));
  const child = spawn(process.execPath, ["server.js"], { cwd: path.resolve(__dirname, ".."), stdio: "ignore",
    env: { ...process.env, PORT: String(n), NODE_ENV: "test", DATABASE_URL: "", QOMUS_LOGIN_LIMIT_DATABASE_URL: "", SECURITY_AUDIT_DATABASE_URL: "",
      QOMUS_ACCOUNT_STORE: "", ACCOUNT_DATA_FILE: path.join(dir, "data.json"), GEMINI_API_KEY: "" } });
  const get = (p, cookie) => fetch(base + p, { redirect: "manual", headers: cookie ? { cookie } : {}, signal: AbortSignal.timeout(30000) });
  try {
    let ready = false;
    for (let i = 0; i < 200; i++) { if (child.exitCode !== null) break; try { if ((await get("/health")).status === 200) { ready = true; break; } } catch (_) {} await delay(150); }
    assert.ok(ready, "server did not become ready");
    const failures = [];
    const check = async (route, lang, cookie) => {
      const url = route + (route.includes("?") ? "&" : "?") + "lang=" + lang;
      const r = await get(url, cookie);
      if (r.status !== 200) { failures.push(url + " → HTTP " + r.status); return; }
      for (const b of brokenScripts(await r.text())) failures.push(url + " → " + b);
    };
    for (const lang of ["uz", "ru", "en"]) for (const route of PUBLIC) await check(route, lang);
    for (const route of SIGNED_IN) await check(route, "uz", "hq_session=" + token);
    assert.deepEqual(failures, [], "pages with broken inline JavaScript:\n" + failures.join("\n"));
  } finally {
    child.kill("SIGTERM");
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
