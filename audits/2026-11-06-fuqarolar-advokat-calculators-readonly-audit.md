# QOMUS Fuqarolar / Advokat PRO / Calculators — pre-ministry source audit (2026-11-06)

Scope: read-only GitHub main commit and Render logs; no live browser screenshots. Direct external website access to https://huquqiy-ai-backend.onrender.com/ failed in audit environment, so this is NOT end-to-end browser QA.

## Confirmed implementation
- server.js root '/' portal selector; '/fuqarolar' serves unchanged homePage.
- '/calculators' JS aliment and property analysis; '/pension' multi-type preliminary calculator.
- '/court-costs' + POST '/court-costs-result' backend fee estimate, BHM constant 440000 from 2026-09-01; 2026 current value matched official advice.adliya.uz document 2934. Do not call this live sourced BHM.
- '/advokat-pro' landing, '/advokat-pro/documents' export workspace, '/advokat-pro/check', '/advokat-pro/grounded', '/advokat-pro/court-practice', '/advokat-pro/cases', '/advokat-pro/calendar'; '/advokat-pro/public-judgments' API.
- Neon account backend holds own authenticated account state, separate from /advokat-pro/cases browser-local session pilot.

## Risks and priority
1. HIGH/legal correctness: front-end calculateAliment() computes 1/4,1/3,1/2 of provided income without applying the statutory minimum per child (26.5% of minimum wage) or forcing a case-specific caution in the numeric result. Oila kodeksi 99 and PF-115 require legal QA. Do not present result as binding amount.
2. HIGH/data persistence expectation: advokat-cases-calendar.js uses sessionStorage key qomus-advokat-pilot-cases-calendar-v1; cases/calendar records are NOT Neon persisted and disappear on session close. UI explicitly calls it an anonymized pilot. Needs authenticated durable Neon integration before real case management claim.
3. MEDIUM: COURT_FEE_BHM is hardcoded constant, not live updated by LexUZ/Neon. Current 440000 matches advice.adliya.uz but change monitoring necessary. Court costs are illustrative; not all court categories/formulas verified against current legislation.
4. MEDIUM: pension benefit pages have several conditional flows and official-source links; no automated browser interactions or exhaustive benefits amount validations carried out. Do not claim perfect pension payouts.
5. MEDIUM: Advokat PRO document workspace has client-side form/exports, and backend /claim path; functionality is implemented but no browser-generated Word/PDF artifacts inspected in this audit.
6. MEDIUM: Render showed historical OpenRouter 402 exhausted credits on 2026-11-04, not proof of present outage. A real AI prompt must be checked before ministry demo.
7. MEDIUM: public judgments / AI grounded source flow hasn't been externally verified to return real current decisions.
8. BROWSER BLOCKER: web fetch of site inaccessible in this audit environment, container DNS also failed. Cannot assert link clicks, mobile rendering, JS runtime, actual successful calculations, authenticated production flow, or full accessibility.
9. Render status latest deployed live, no matching 4xx/5xx samples on queried request filters; lack of sampled logs is not positive endpoint proof.

## Demo gates
- Run live desktop+Android+iPhone click-through tests for Fuqarolar and Advokat portal, calculators, pension, court costs and every export action.
- Have jurist verify aliment and court-fee expected values using 5-10 legal cases including low income.
- Label Advokat calendar as session pilot unless persistent Neon integration built.
- Test OpenRouter credits and API response before presenting real AI output.
- Avoid claiming a full end-to-end QA pass until screenshots, interactions, expected/actual calculation outputs, and legal expert signoff are captured.

No production code modified during audit.
