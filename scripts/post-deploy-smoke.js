"use strict";
// Read-only production smoke check (GET requests only, no sign-in, no data).
// Usage: node scripts/post-deploy-smoke.js https://verius.uz
// Exit code 0 = all checks passed, 1 = something failed (see the FAIL lines).
const vm = require("node:vm");
const base = String(process.argv[2] || "https://verius.uz").replace(/\/+$/, "");
const PAGES = ["/", "/fuqarolar", "/ai", "/claim", "/claim?type=debt_recovery_claim", "/documents", "/legal-review", "/family",
  "/business", "/employment", "/calculators", "/pension", "/court", "/sources", "/criminal", "/advokat-pro", "/advokat-pro/check",
  "/advokat-pro/court-practice", "/login", "/register", "/forgot-password", "/reset-password?email=smoke%40example.invalid",
  "/privacy", "/terms", "/admin/login"];
let failed = 0;
const ok = (name, cond, extra = "") => { if (!cond) failed++; console.log((cond ? "PASS " : "FAIL ") + name + (extra ? " — " + extra : "")); };
const get = (p, headers = {}) => fetch(base + p, { redirect: "manual", headers, signal: AbortSignal.timeout(30000) });
function brokenScripts(html) {
  const out = [], re = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi; let m, i = 0;
  while ((m = re.exec(html))) { i++; if (/type=["']?(?!text\/javascript|module)[a-z]/i.test(m[1])) continue; try { new vm.Script(m[2]); } catch (e) { out.push("#" + i + " " + e.message); } }
  return out;
}
(async () => {
  console.log("Smoke check: " + base);
  const health = await get("/health");
  ok("/health responds", health.status === 200, "HTTP " + health.status);
  let pageFailures = 0, pages = 0;
  for (const lang of ["uz", "ru", "en"]) {
    for (const p of PAGES) {
      const url = p + (p.includes("?") ? "&" : "?") + "lang=" + lang;
      const r = await get(url, { "Accept-Encoding": "br, gzip" });
      const html = await r.text();
      const broken = r.status === 200 ? brokenScripts(html) : [];
      pages++;
      if (r.status !== 200 || broken.length) { pageFailures++; ok(url, false, "HTTP " + r.status + (broken.length ? " broken JS " + broken.join("; ") : "")); }
    }
  }
  ok(pages + " pages return 200 with valid inline JS (uz/ru/en)", pageFailures === 0, pageFailures ? pageFailures + " failed" : "");
  const home = await get("/?lang=uz", { "Accept-Encoding": "br, gzip" });
  ok("responses are compressed", /br|gzip/.test(home.headers.get("content-encoding") || ""), home.headers.get("content-encoding") || "none");
  ok("CSP header present", /object-src 'none'/.test(home.headers.get("content-security-policy") || ""));
  const homeHtml = await (await get("/?lang=uz")).text();
  const theme = (homeHtml.match(/\/assets\/qomus-academy-theme\.[a-f0-9]+\.css/) || [])[0];
  ok("theme stylesheet linked", !!theme);
  if (theme) { const t = await get(theme); ok("theme stylesheet cached immutable", t.status === 200 && /immutable/.test(t.headers.get("cache-control") || ""), "HTTP " + t.status); }
  ok("footer links privacy/terms", /href="\/privacy\?lang=uz"/.test(homeHtml) && /href="\/terms\?lang=uz"/.test(homeHtml));
  const admin = await (await get("/admin/login?lang=uz")).text();
  ok("admin login does not pre-fill an email", !/name="email" type="email" value="[^"]+"/.test(admin));
  const reset = await (await get("/forgot-password?lang=uz")).text();
  ok("password recovery is the four-step flow", /data-reset-step="1"/.test(reset));
  const robots = await get("/robots.txt");
  ok("robots.txt", robots.status === 200 && /Disallow: \/admin/.test(await robots.text()));
  const acc = await get("/account?lang=uz");
  ok("cabinet requires sign-in", acc.status === 302 && /\/login/.test(acc.headers.get("location") || ""), "HTTP " + acc.status);
  console.log(failed ? "\n" + failed + " check(s) FAILED — consider rolling back (docs/DEPLOY_ROLLBACK.md)." : "\nAll checks passed.");
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error("FAIL smoke script error:", e.message); process.exit(1); });
