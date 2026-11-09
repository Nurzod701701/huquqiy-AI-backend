"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const {css,script} = require("../qomus-icon-ui");

test("SVG enhancement is self-contained and JavaScript syntax is valid",()=>{
 assert.match(css,/id="qomus-service-icons-v1"/);
 assert.match(script,/id="qomus-service-icon-upgrade"/);
 const body=script.replace(/^<script[^>]*>/,"").replace(/<\/script>$/,"");
 assert.doesNotThrow(()=>new vm.Script(body));
});

test("enhancement preserves links, labels and event handlers",()=>{
 assert.match(script,/querySelectorAll\('a\.sideLink\[href\],a\.sourceCard\[href\]'\)/);
 assert.doesNotMatch(script,/\.href\s*=|\.remove\(|\.replaceWith\(|preventDefault\(/);
 assert.match(script,/mark\.classList\.add\('qomus-svg-icon'\)/);
 assert.match(script,/aria-hidden/);
});

test("desktop, mobile, keyboard and accessibility styles are included",()=>{
 assert.match(css,/@media\(max-width:600px\)/);
 assert.match(css,/:focus-visible/);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(css,/\.qomus-legal-source-status/);
});
