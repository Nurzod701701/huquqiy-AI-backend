"use strict";
// Exact LexUZ article links. data/lexuz-article-anchors.json maps each article
// number to the element id LexUZ uses on the official document page
// (e.g. Oila kodeksi 38-modda -> https://lex.uz/docs/-104720#-158836).
// Built from the official pages; every id was checked to exist on the page.
const DATA = require("./data/lexuz-article-anchors.json");

const BASE = {
  oila: "https://lex.uz/docs/-104720",
  mehnat: "https://lex.uz/docs/-6257288",
  fuqarolik: "https://lex.uz/docs/-111189",
  iqtisodiy: "https://lex.uz/docs/-3523891",
  jinoyat: "https://lex.uz/docs/-111453",
  fpk: "https://lex.uz/docs/-3517337"
};

// Exact article URL, or null when the article is unknown.
function articleUrl(law, number) {
  const ref = DATA.laws[String(law)] && DATA.laws[String(law)][String(Number(number))];
  if (!ref) return null;
  const [doc, anchor] = ref.split("#");
  return `https://lex.uz/docs/-${doc}#${anchor}`;
}

// GET /lexuz/<law>/<number> -> 302 to the exact article (or the code page).
function handle(req, res, pathname) {
  const m = /^\/lexuz\/([a-z]+)\/(\d{1,4})$/.exec(pathname);
  if (!m || req.method !== "GET") return false;
  const target = articleUrl(m[1], m[2]) || BASE[m[1]];
  if (!target) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); res.end("Not found"); return true; }
  res.writeHead(302, { Location: target, "Cache-Control": "public, max-age=86400" });
  res.end();
  return true;
}

module.exports = { articleUrl, handle, BASE, checked: DATA.checked };
