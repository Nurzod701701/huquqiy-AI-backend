"use strict";
// Four-step password recovery over real HTTP: email → code → new password → done.
const test = require("node:test"), assert = require("node:assert/strict");
const { spawn } = require("node:child_process"), fs = require("node:fs"), os = require("node:os"), path = require("node:path"), net = require("node:net"), crypto = require("node:crypto");
const { setTimeout: delay } = require("node:timers/promises");
const ui = require("../reset-flow-ui");
function port() { return new Promise((resolve, reject) => { const s = net.createServer(); s.once("error", reject); s.listen(0, "127.0.0.1", () => { const n = s.address().port; s.close(() => resolve(n)); }); }); }
const hash = (v, salt = crypto.randomBytes(16).toString("hex")) => salt + ":" + crypto.scryptSync(String(v), salt, 64).toString("hex");

test("step pages exist in uz/ru/en, show progress and never offer a password hint", () => {
  for (const lang of ["uz", "ru", "en"]) {
    const pages = [ui.stepEmail(lang), ui.stepCode(lang, { email: "ab@example.invalid" }), ui.stepPassword(lang, { token: "a".repeat(64) }), ui.stepDone(lang)];
    pages.forEach((html, i) => {
      assert.match(html, new RegExp('data-reset-step="' + (i + 1) + '"'));
      assert.match(html, /aria-current="step"/);
      assert.doesNotMatch(html, /name="(hint|reminder|eslatma)"/i);
    });
    assert.match(pages[1], /autocomplete="one-time-code"/);
    assert.match(pages[2], /autocomplete="new-password"/);
    assert.match(pages[3], new RegExp('location\\.href="/login\\?lang=' + lang + '"'));
  }
  assert.equal(ui.maskEmail("sardor@example.invalid"), "sa****@example.invalid");
  assert.doesNotMatch(ui.stepCode("uz", { email: '"><script>x</script>@a.b' }), /<script>x/);
});

test("password recovery runs as four separate steps with a single-use reset token", { timeout: 90000 }, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "verius-reset-steps-")), n = await port(), base = "http://127.0.0.1:" + n;
  const sessionToken = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(path.join(dir, "data.json"), JSON.stringify({
    users: [{ id: "USR-R", firstName: "Reset", lastName: "User", email: "reset@example.invalid", passwordHash: hash("Old-Password-1"), role: "user", status: "active", emailVerified: true,
      resetCodeHash: hash("123456"), resetExpiresAt: new Date(Date.now() + 600000).toISOString(), resetSentAt: new Date(Date.now() - 120000).toISOString() }],
    sessions: [{ id: "SES-R", tokenHash: crypto.createHash("sha256").update(sessionToken).digest("hex"), userId: "USR-R", createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 3600000).toISOString() }],
    cases: [], documents: [], conversations: [], notifications: [], consents: [], auditLogs: [], settings: {} }));
  const child = spawn(process.execPath, ["server.js"], { cwd: path.resolve(__dirname, ".."), stdio: "ignore",
    env: { ...process.env, PORT: String(n), NODE_ENV: "test", DATABASE_URL: "", QOMUS_LOGIN_LIMIT_DATABASE_URL: "", SECURITY_AUDIT_DATABASE_URL: "", QOMUS_ACCOUNT_STORE: "",
      ACCOUNT_DATA_FILE: path.join(dir, "data.json"), QOMUS_LOGIN_LIMIT_FILE: path.join(dir, "limits.json"), RESEND_API_KEY: "", SMTP_HOST: "" } });
  const req = (p, body) => fetch(base + p, body ? { method: "POST", redirect: "manual", headers: { "Content-Type": "application/x-www-form-urlencoded", Origin: base }, body: new URLSearchParams(body), signal: AbortSignal.timeout(30000) } : { redirect: "manual", signal: AbortSignal.timeout(30000) });
  const db = () => JSON.parse(fs.readFileSync(path.join(dir, "data.json"), "utf8"));
  try {
    let up = false;
    for (let i = 0; i < 200; i++) { try { if ((await req("/health")).ok) { up = true; break; } } catch (_) {} await delay(150); }
    assert.ok(up, "server did not start");

    // Step 1
    let r = await req("/forgot-password?lang=ru");
    assert.equal(r.status, 200); assert.match(await r.text(), /data-reset-step="1"[\s\S]*Восстановление пароля/);
    r = await req("/forgot-password?lang=uz", { email: "not-an-email" });
    assert.equal(r.status, 400); assert.match(await r.text(), /data-reset-step="1"[\s\S]*Email to‘g‘ri formatda emas/);
    r = await req("/forgot-password?lang=uz", { email: "nobody@example.invalid" });
    assert.equal(r.status, 302, "unknown email gets the same answer (no enumeration)");
    assert.equal(r.headers.get("location"), "/reset-password?lang=uz&email=nobody%40example.invalid");

    // Step 2
    r = await req("/reset-password?lang=uz");
    assert.equal(r.status, 302, "step 2 without an email goes back to step 1");
    r = await req("/reset-password?lang=uz&email=reset%40example.invalid");
    assert.equal(r.status, 200); assert.match(await r.text(), /data-reset-step="2"[\s\S]*re\*+@example\.invalid/);
    r = await req("/reset-password?lang=uz", { email: "reset@example.invalid", code: "000000" });
    assert.equal(r.status, 400); assert.match(await r.text(), /data-reset-step="2"[\s\S]*Kod noto‘g‘ri/);

    // Step 3 cannot be reached without a verified code
    r = await req("/reset-password/new?lang=uz", { token: "f".repeat(64), password: "New-Password-9", password2: "New-Password-9" });
    assert.equal(r.status, 400); assert.match(await r.text(), /Tiklash sessiyasi tugagan/);

    r = await req("/reset-password?lang=uz", { email: "reset@example.invalid", code: "123456" });
    assert.equal(r.status, 200);
    const step3 = await r.text();
    assert.match(step3, /data-reset-step="3"/);
    const token = (step3.match(/name="token" value="([a-f0-9]{64})"/) || [])[1];
    assert.ok(token, "reset token issued after the code is verified");
    let u = db().users[0];
    assert.ok(!u.resetCodeHash, "code is single-use");
    assert.notEqual(u.resetTokenHash, token, "token stored only as a hash");
    r = await req("/reset-password?lang=uz", { email: "reset@example.invalid", code: "123456" });
    assert.equal(r.status, 400, "the same code cannot be used twice");

    r = await req("/reset-password/new?lang=uz", { token, password: "New-Password-9", password2: "Different-9" });
    assert.equal(r.status, 400); assert.match(await r.text(), /data-reset-step="3"[\s\S]*mos emas/);
    r = await req("/reset-password/new?lang=uz", { token, password: "reset@example.invalid", password2: "reset@example.invalid" });
    assert.equal(r.status, 400); assert.match(await r.text(), /emailingiz bilan bir xil/);

    // Step 4
    r = await req("/reset-password/new?lang=uz", { token, password: "New-Password-9", password2: "New-Password-9" });
    assert.equal(r.status, 200);
    const done = await r.text();
    assert.match(done, /data-reset-step="4"[\s\S]*Parol tiklandi/);
    assert.match(done, /location\.href="\/login\?lang=uz"/);
    u = db().users[0];
    assert.ok(!u.resetTokenHash, "token consumed");
    assert.equal(db().sessions.filter(s => s.userId === "USR-R").length, 0, "all sessions signed out");
    r = await req("/reset-password/new?lang=uz", { token, password: "Another-Pass-1", password2: "Another-Pass-1" });
    assert.equal(r.status, 400, "token cannot be reused");

    r = await req("/login?lang=uz", { email: "reset@example.invalid", password: "Old-Password-1" });
    assert.equal(r.status, 401, "old password no longer works");
    r = await req("/login?lang=uz", { email: "reset@example.invalid", password: "New-Password-9" });
    assert.equal(r.status, 302, "new password works");
  } finally {
    child.kill("SIGTERM");
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
