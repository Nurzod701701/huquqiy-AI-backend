"use strict";
// QOMUS Academy-inspired redesign: production-safe static regression tests.
// Run: node --test test/qomus-academy-design.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const js = fs.readFileSync(path.join(root, "server.js"), "utf8");
const css = fs.readFileSync(path.join(root, "qomus-academy-theme.css"), "utf8");

test("QOMUS theme file is loaded in HTML send helper", () => {
  assert.match(js, /const QOMUS_ACADEMY_THEME =/);
  assert.match(js, /qomus-academy-theme\.css/);
  assert.match(js, /resultHtml\.slice\(0, headEnd\) \+ QOMUS_ACADEMY_THEME/);
});
test("Theme is injected only once", () => {
  assert.ok(js.includes("!resultHtml.includes('id=\"qomus-academy-liquid-glass\"')"));
});
test("CSS blocks are balanced", () => {
  assert.equal((css.match(/\{/g)||[]).length, (css.match(/\}/g)||[]).length);
});
test("Core QOMUS routes remain in code", () => {
  for (const route of ["/fuqarolar","/advokat-pro","/ai","/documents","/login"]) {
    assert.ok(js.includes(route), route);
  }
});
test("Responsive layout, focus visibility, and reduced motion are provided", () => {
  assert.match(css, /max-width:760px/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
});
test("Theme is a visual-only CSS layer", () => {
  assert.ok(!/<script\b/i.test(css));
  assert.ok(!/@import\b/i.test(css));
});
