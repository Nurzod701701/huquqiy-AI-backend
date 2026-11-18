"use strict";
// Untrusted PDF/DOCX text extraction, isolated from the web server process.
//
// - DOCX is a ZIP: a 150 KB upload can expand to 50+ MB of XML and exhaust the
//   heap inside mammoth. The ZIP directory is inspected first and oversized
//   archives are refused before anything is decompressed.
// - Parsing runs in a worker thread with its own small heap and a hard
//   timeout. If a crafted file still blows up, only the worker dies.
// - PDF extraction is capped by page count.
// - At most MAX_CONCURRENT parses run at once; extra requests are refused.
const { Worker, isMainThread, parentPort, workerData } = require("node:worker_threads");

const LIMITS = Object.freeze({
  DOCX_MAX_ENTRIES: 400,
  DOCX_MAX_DOCUMENT_XML: 6 * 1024 * 1024,   // word/document.xml, uncompressed
  DOCX_MAX_TOTAL: 25 * 1024 * 1024,         // all entries, uncompressed
  DOCX_MAX_RATIO: 120,                      // uncompressed / compressed per entry
  PDF_MAX_PAGES: 60,
  WORKER_HEAP_MB: 256,
  TIMEOUT_MS: 20000,
  MAX_CONCURRENT: 2,
  MAX_TEXT: 60000
});

async function inspectDocx(buffer) {
  const JSZip = require("jszip");
  const zip = await JSZip.loadAsync(buffer, { createFolders: false });
  const entries = Object.values(zip.files).filter(f => !f.dir);
  if (entries.length > LIMITS.DOCX_MAX_ENTRIES) throw new Error("DOCX_TOO_COMPLEX");
  let total = 0;
  for (const f of entries) {
    const meta = f._data || {};
    const size = Number(meta.uncompressedSize);
    const packed = Number(meta.compressedSize);
    if (!Number.isFinite(size) || size < 0) throw new Error("DOCX_UNREADABLE");
    total += size;
    // Ratio check only for large entries: small, repetitive real documents compress very well.
    if (packed > 0 && size > 2 * 1024 * 1024 && size / packed > LIMITS.DOCX_MAX_RATIO) throw new Error("DOCX_TOO_LARGE_UNCOMPRESSED");
    if (/^word\/document\.xml$/i.test(f.name) && size > LIMITS.DOCX_MAX_DOCUMENT_XML) throw new Error("DOCX_TOO_LARGE_UNCOMPRESSED");
  }
  if (total > LIMITS.DOCX_MAX_TOTAL) throw new Error("DOCX_TOO_LARGE_UNCOMPRESSED");
  if (!zip.file("word/document.xml")) throw new Error("DOCX_UNREADABLE");
}

async function extractInWorker(ext, buffer) {
  if (ext === "docx") {
    await inspectDocx(buffer);
    const mammoth = require("mammoth");
    return (await mammoth.extractRawText({ buffer })).value || "";
  }
  if (ext === "pdf") {
    // Maintained pdf.js (replaces pdf-parse, which bundled pdf.js 1.10 from 2017).
    // Eval and font loading are disabled: text extraction needs neither.
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const task = pdfjs.getDocument({
      data: new Uint8Array(buffer), isEvalSupported: false, disableFontFace: true,
      useSystemFonts: false, stopAtErrors: false, verbosity: 0
    });
    const doc = await task.promise;
    try {
      const pages = Math.min(doc.numPages, LIMITS.PDF_MAX_PAGES);
      const out = [];
      let length = 0;
      for (let i = 1; i <= pages && length < LIMITS.MAX_TEXT; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map(item => (item.str || "") + (item.hasEOL ? "\n" : "")).join("");
        out.push(text); length += text.length;
        page.cleanup();
      }
      return out.join("\n\n");
    } finally { await doc.destroy(); }
  }
  throw new Error("UNSUPPORTED_FORMAT");
}

if (!isMainThread && workerData && workerData.__safeDocParse) {
  extractInWorker(workerData.ext, Buffer.from(workerData.buffer))
    .then(text => parentPort.postMessage({ ok: true, text: String(text).replace(/\u0000/g, "").slice(0, LIMITS.MAX_TEXT) }))
    .catch(err => parentPort.postMessage({ ok: false, code: /^[A-Z_]+$/.test(String(err && err.message)) ? err.message : "PARSE_FAILED" }));
}

let running = 0;
function extractText(ext, buffer, opts = {}) {
  const kind = String(ext || "").toLowerCase().replace(/^\./, "");
  if (kind === "txt") return Promise.resolve(Buffer.from(buffer).toString("utf8").replace(/\u0000/g, "").slice(0, LIMITS.MAX_TEXT));
  if (kind !== "pdf" && kind !== "docx") return Promise.reject(new Error("UNSUPPORTED_FORMAT"));
  if (running >= LIMITS.MAX_CONCURRENT) return Promise.reject(new Error("PARSER_BUSY"));
  running += 1;
  return new Promise((resolve, reject) => {
    let settled = false;
    const worker = new Worker(__filename, {
      workerData: { __safeDocParse: true, ext: kind, buffer },
      resourceLimits: { maxOldGenerationSizeMb: opts.heapMb || LIMITS.WORKER_HEAP_MB, maxYoungGenerationSizeMb: 32 }
    });
    const finish = (fn, value) => { if (settled) return; settled = true; clearTimeout(timer); running -= 1; worker.terminate().catch(() => {}); fn(value); };
    const timer = setTimeout(() => finish(reject, new Error("PARSE_TIMEOUT")), opts.timeoutMs || LIMITS.TIMEOUT_MS);
    worker.once("message", m => m && m.ok ? finish(resolve, m.text) : finish(reject, new Error((m && m.code) || "PARSE_FAILED")));
    worker.once("error", err => finish(reject, new Error(err && err.code === "ERR_WORKER_OUT_OF_MEMORY" ? "DOCX_TOO_LARGE_UNCOMPRESSED" : "PARSE_FAILED")));
    worker.once("exit", code => finish(reject, new Error(code === 0 ? "PARSE_FAILED" : "PARSE_FAILED")));
  });
}

const MESSAGES = {
  DOCX_TOO_LARGE_UNCOMPRESSED: "Hujjat ichki tarkibi juda katta. Faylni qisqartiring yoki matnni qo‘lda kiriting.",
  DOCX_TOO_COMPLEX: "Hujjat tuzilishi juda murakkab. Matnni qo‘lda kiriting.",
  DOCX_UNREADABLE: "DOCX fayli buzilgan yoki Word hujjati emas.",
  PARSE_TIMEOUT: "Hujjatni o‘qish juda uzoq davom etdi. Kichikroq fayl yuklang yoki matnni qo‘lda kiriting.",
  PARSER_BUSY: "Server hozir boshqa hujjatlarni o‘qiyapti. Bir daqiqadan so‘ng qayta urinib ko‘ring.",
  UNSUPPORTED_FORMAT: "Faqat PDF, DOCX yoki TXT qabul qilinadi.",
  PARSE_FAILED: "Hujjatni o‘qib bo‘lmadi. Fayl buzilgan yoki qo‘llab-quvvatlanmaydi."
};
function userMessage(code) { return MESSAGES[code] || MESSAGES.PARSE_FAILED; }

module.exports = { extractText, userMessage, LIMITS, _inspectDocx: inspectDocx };
