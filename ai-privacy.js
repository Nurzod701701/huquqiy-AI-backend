"use strict";

// Minimize PII before transmitting prompts to external AI providers.
// Heuristic rules are NOT a substitute for user consent, legal review,
// a PII classifier or provider data-processing guarantees.
function redactForAI(input) {
  let text = String(input ?? "");
  const findings = [];
  const replace = (regex, label) => {
    text = text.replace(regex, () => {findings.push(label); return "[" + label + "_YASHIRILDI]";});
  };
  // Uzbekistan JSHSHIR / PINFL should be matched before general numbers.
  replace(/\b(?:JSHSHIR|PINFL|ПИНФЛ)\s*[:№#-]?\s*\d{14}\b/giu,"JSHSHIR");
  // Standalone 14-digit identifiers: may include unrelated numbers; record this for review.
  replace(/\b\d{14}\b/g,"14_RAQAM");
  // Passport identifiers preceded by an explicit label.
  replace(/\b(?:pasport|passport|паспорт)\s*(?:raqami|number|серия|№|:)?\s*[A-Z]{2}\s*\d{7}\b/giu,"PASPORT");
  // Unlabelled Uzbek passport series also appear in copied case materials.
  replace(/\b[A-Z]{2}\s?\d{7}\b/giu,"PASPORT");
  // Financial identifiers may appear in uploaded legal documents.
  replace(/(?<!\d)(?:\d[ -]?){15}\d(?!\d)/g,"KARTA");
  replace(/(?<!\d)\d{20}(?!\d)/g,"HISOB");
  // Email and Uzbek-format phone numbers.
  replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu,"EMAIL");
  replace(/(?<!\d)(?:\+?998[\s().-]*)?(?:\d{2}[\s().-]*)\d{3}[\s().-]*\d{2}[\s().-]*\d{2}(?!\d)/g,"TELEFON");
  return {text, categories:[...new Set(findings)]};
}
function minimizeMessages(messages) {
  return messages.map(message => {
    if (!message || typeof message.content !== "string") return message;
    if (message.role !== "user" && !message.content.startsWith("Collected case information:")) return message;
    return {...message, content:redactForAI(message.content).text};
  });
}
module.exports = {redactForAI,minimizeMessages};
