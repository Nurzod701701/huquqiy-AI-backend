# QOMUS Calculators and Advocate PRO — live release audit
Date: 2026-11-06

## Release
- PR #45: https://github.com/Nurzod701701/huquqiy-AI-backend/pull/45
- Merged commit to main: b3a2960f46e0e50043d89e36eb6ec6aa56bada85
- Existing Render service: srv-danam8jtqb8s73b8c5mg
- Deployment: dep-dbmundon74is73bhtt50, status LIVE at 2026-11-06 15:02:24 UTC.
- App logs: QOMUS_POSTGRES_READY at 15:02:20 UTC; QOMUS_BACKUP_SCHEDULED 15:02:20 UTC; QOMUS_BACKUP_OK at 15:02:35 UTC (11 tables, 3 rows, 12046 bytes, verified).
- No new Render service; no AHOST DNS changes.

## Verified improvements
- Family Code Article 99 child-support calculator: applies monthly income proportion 25% / 1/3 / 50% and separate statutory floor of 26.5% of the minimum wage **per child**. MHTEKM rate 1,360,000 UZS (effective 2026-09-01, PF-115), per-child floor 360,400 UZS. Displays monthly share, floor, indicative maximum, source-rate date, and caution.
- Adds explicit 1, 3, 6 and 12 month mathematical projections. Projections are NOT an award, arrears, indexing or enforcement calculation; conditional on constant income/rates.
- Courts: BHM 440,000 as of 2026-09-01, 4% of value with 1 BHM floor in applicable civil property case; 2% with 1 BHM floor in applicable economic property case where business parties qualified. Divorce x2/x4 BHM baseline. Exemptions and unknown categories yield a caution instead of fabricated amount.
- Pensiya page shows official 2026-07-01 minimum old-age pension 983,000, minimum disability 1,083,000, pension calculation base 504,000 with an explicit not-actual-award warning, preserving conservative estimate.
- Property analyzer prevents negative, non-finite and extreme property values.
- Advokat PRO matters/calendar: signed-in users load/save anonymized case/task codes in Neon per-user settings; anonymous users retain session-only mode; failed Neon load locks form to prevent silent data loss. Server rejects excessive/invalid payload and cross-user assignments.
- CSRF same-origin controls extended to /advokat-pro/workspace POST.
- Tests include normal user vs owner isolation, anonymous 401, cross-site POST 403, economic court fee text, and public pages returning 200.

## Quality gates
- GitHub Actions for release head a5945a721e0e31b0180eb80bda025c7224b911b9: all five CI suites completed SUCCESS, including real disposable PostgreSQL HTTP integration.
- Original Fuqarolar interface layout and styling preserved; modifications are calculator calculations and advisory copy.
- New features are calculation aids, not formal legal conclusions.

## Explicit unresolved QA
- The public website URL cannot be fetched from the audit environment: web open returned inaccessible. No user-visible browser screenshots, mobile validation or real click-through with browser JavaScript have been witnessed in this turn. CI HTTP and unit tests do NOT replace manual mobile/browser test.
- Official source rates are dated constants, NOT live LexUZ/Adliya rate sync; rates must be monitored and updated when legislation changes.
- Pension complex exceptions/salary caps, exact awards, and court fees for unsupported categories remain informational-only until specialized legal expert QA; user should not represent all calculators as legally exact in all cases.
- Advokat PRO still uses anonymized pilot case code model rather than full client CRM with all legal deadlines and attachment storage; status should be disclosed.
- OpenRouter historical 402 credits issue was identified previously; not resolved in this release.
- Resend sender domain verification remains pending.

## Primary references
- Oila kodeksi article 99: https://lex.uz/docs/-104720
- PF-115 2026-06-23: https://lex.uz/docs/-8283656
- Davlat boji law: https://lex.uz/uz/acts/-4680944
- Adliya court cost guidance: https://advice.adliya.uz/oz/document/4040
