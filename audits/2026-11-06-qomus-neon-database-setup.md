# QOMUS Neon PostgreSQL — initial database setup (2026-11-06)

## Real infrastructure created
- Neon project: `qomus-production-data`
- Project ID: `divine-boat-26942482`
- Region: `aws-us-west-2` (near Render Oregon)
- PostgreSQL: 18
- Database: `qomus`
- Migration marker: `2026-11-06-qomus-v1`
- Ten tables created and verified in the actual Neon service, including `schema_migrations`.

## Tables
1. `app_users`: email UNIQUE, scrypt password hash, role/status, email verification and reset state.
2. `app_sessions`: user ID, token SHA-256 digest only, expiry, indexed.
3. `app_cases`: per-user case ownership, case_no UNIQUE, status/progress.
4. `app_documents`: owner/case references, content.
5. `app_conversations`: owner/case references, question/answer.
6. `app_notifications`: per-user notifications, read timestamp.
7. `app_consents`: user consent and version.
8. `app_audit_logs`: action, JSONB metadata, time index.
9. `app_settings`: JSONB application settings.
10. `schema_migrations`: migration tracking.

All user-owned data tables have FOREIGN KEY references. The database is real, not a mock. It currently has 0 users, 0 sessions, 0 cases; 1 schema migration marker.

## Safety and cutover gates
- **Not connected to live QOMUS Render service.** No DATABASE_URL secret was copied into GitHub or chat.
- Source currently uses local JSON ACCOUNT_DATA_FILE, and historical Render logs showed EACCES writing to /var/data, with fallback /tmp.
- First verify and safeguard both /var/data and any surviving /tmp or project-local JSON; no path change or restart until backup inventory.
- Design and test an idempotent JSON -> PostgreSQL migration in isolated context; map camelCase fields to snake_case; preserve user ids, scrypt hashes, ownership, timestamps. Never log passwords, password hashes, reset codes, session tokens, or document text.
- Live sessions should be intentionally reissued on migration; DB stores token hashes only.
- Build PostgreSQL repository/data-access adapter and integration tests before connecting production. Unit and schema smoke tests alone are insufficient.
- Roles: deploy a least-privilege application role, keep owner connection credentials only in Neon; use SSL, protected secrets, planned credential rotation.
- Verify transactional updates, unique conflict handling, consent/audit records, and one-user-cannot-access-another-user's records.
- Validate backup and isolated restore; then maintenance/dual-read strategy, controlled cutover and rollback plan.
- Do not merge draft PR #41 to main, do not redeploy production, and do not remove JSON data until approved successful cutover.

## Current statuses
- Neon database and schema: COMPLETE.
- Actual live users migrated: NOT STARTED.
- Render production DB connection: NOT DONE.
- Backup/restore: NOT VERIFIED.
- New database integration tests: NOT DONE.
