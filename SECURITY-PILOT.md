# QOMUS defence-in-depth pilot (not production-ready)

This branch is isolated from `main`. Nothing here has been deployed or migrated.

## Layer 1: suspicious traffic detection and blocking
- `security-hardening.js` denies cross-site authenticated POST requests and supplies baseline security headers.
- Authentication rate limiting is **opt-in** through `QOMUS_PILOT_AUTH_LIMIT=enabled`; this in-memory prototype is **not suitable for production** behind Render's reverse proxy or multiple instances. Before deployment, replace IP identity with a trusted-proxy implementation plus Redis/shared storage. Otherwise real users could share a rate limit.
- `security-alerts.js` sends reduced, pseudonymous incident metadata to `SECURITY_ALERT_WEBHOOK` (HTTPS), if a strong independent `SECURITY_EVENT_HASH_KEY` is set. Configure an endpoint belonging to the owner; never include API tokens in the URL. Delivery is best effort, not guaranteed. Never log or send document contents, passwords, or session tokens.
- Authentication failures should be monitored with tested thresholds, not interpreted as proof that an attacker has broken in.
- CSRF origin checks are only an initial defence. Introduce server-verified CSRF tokens before declaring complete CSRF protection.

## Layer 2: isolated confidential storage
- `secure-vault.js` is a **staged adapter, not wired into QOMUS's live accounts/database**.
- It requires Render Persistent Disk mounted under `/var/data`, `QOMUS_VAULT_DIR` there, and a separately held 32-byte `QOMUS_VAULT_KEY_B64`. Data is encrypted using AES-256-GCM.
- Before migration: verify Render storage, provision off-site encrypted backups, test restore, implement key rotation, verify ownership controls, and design a database migration without dropping old records.
- Encrypted files on the **same server disk** do not provide the same isolation as a separate, private managed database; the target architecture is a private Postgres service + private object storage, least-privilege service identities, encrypted backups, and audit trails.
- Never move or delete the existing JSON data until a backup, consistency checks and restore dry run succeed.

## Privacy and AI
- `callAI` now passes its outbound messages through a first-pass `ai-privacy.js` redaction filter (JSHSHIR/14-digit IDs, explicitly labeled passports, phones, emails). This is **heuristic and incomplete**: names, addresses, documents, alternate formats and AI instructions can still contain sensitive content. Do not consider third-party AI privacy solved.
- Do not submit real citizen identity documents during the pilot. Implement explicit consent, minimization, redaction and model-provider retention verification first.

## Validation and rollout gate
1. Run `npm run check` and `npm run test:security` in a clean checkout of this branch. A GitHub Actions workflow is staged for syntax and unit checks; check its results before relying on it.
2. Add proxy-aware rate limiting tests, webhook delivery tests and integration tests for every protected form.
3. Use synthetic test accounts and fake documents in a separately configured Render preview.
4. Verify that successful login, registration, admin controls and download flows still work.
5. Confirm incident alert routing, backup/restore and safe rollback.
6. Only after independent review should changes be considered for a production merge.

## Immediate open security decisions
- Replace JSON file persistence with a private, backed-up database; existing data has not been moved.
- Protect AI input with consent, document classification, stronger detection and an option not to transmit sensitive cases.
- Configure a trusted HTTPS alert endpoint and incident-response escalation. Until then alerts are not delivered.
- The working main site remains unchanged and is NOT certified secure by this pilot.
