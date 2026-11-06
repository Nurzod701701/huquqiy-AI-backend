# QOMUS PostgreSQL migration readiness — 2026-11-06

## Verified completed
- Neon project `divine-boat-26942482`, database `qomus`, PostgreSQL 18, Oregon.
- Actual database schema created in Neon, ten tables, including users, sessions, cases, documents, conversations, notifications, consents, audits, settings and schema migrations.
- Current Neon production DB data: 0 users, 0 cases, 0 documents at last inspection.
- GitHub draft PR #41 has non-destructive storage inspection, database migration preflight and tests.
- Migration script `scripts/migrate-qomus-json-to-neon.js` defaults to DRY RUN, checks references, preserves original user IDs and password hashes, uses transactional INSERT and never outputs sensitive content. It skips active sessions to require fresh authentication. It migrates settings as key/value records.

## Why production cutover is blocked
1. Render connector does not expose shell/files or a read endpoint for environment variable values. Historical Render logs recorded persistent storage EACCES and fallback to /tmp.
2. Existing application `server.js` still reads/writes JSON synchronously; adding DATABASE_URL alone does **not** switch it to Neon.
3. A verified full backup of actual production JSON is not yet available. Switching storage paths or deploying before that could lose existing accounts/data.

## Safe migration flow (no steps skipped)
1. Authorized Render Shell: inventory `/var/data/huquqiy-ai-data.json`, `/tmp/QOMUS-data.json` and working directory `QOMUS-data.json`, logging only existence/file size/hash—not contents. Select authoritative source by record counts and modification times; make protected copies of all candidates FIRST.
2. Securely export the selected verified backup; do NOT commit it to GitHub or email it.
3. Run isolated DRY RUN:
   `node scripts/audit-account-data-readonly.js /absolute/path/to/isolated-backup.json`
   `node scripts/migrate-qomus-json-to-neon.js /absolute/path/to/isolated-backup.json`
4. In restricted environment, execute migration against the new DB only after verified backup and trial rollback:
   `QOMUS_MIGRATION_APPROVED=yes DATABASE_URL=... node scripts/migrate-qomus-json-to-neon.js --apply /absolute/path/to/isolated-backup.json`
   Do not paste DATABASE_URL into chat, terminal history or logs. Obtain from Neon secret manager.
5. Compare collection counts and user IDs; separately test auth/permissions. Original session tokens intentionally not migrated.
6. Implement PostgreSQL data access for all account routes with transactions, backup-aware cutover and tested rollback. Do not merely set DATABASE_URL.
7. Test full account flows on isolated environment; stop writes briefly, take final incremental export, import changes, switch Render only after confirmed migration and rollback readiness.

## Current status
- Neon real DB provisioned: DONE.
- Isolated migration tool/test code: DONE.
- Actual source extraction and backup: BLOCKED by lack of Render shell/file access.
- Actual data migration: NOT DONE.
- Runtime PostgreSQL backend implementation/production connection: NOT DONE.
- Safe cutover: NOT DONE.

**Production server, environment variables, disk files, domains and main branch are deliberately untouched.**
