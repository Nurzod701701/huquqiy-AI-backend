# QOMUS: zero-cost dedicated Neon PostgreSQL pilot

**Status:** source code only. No Neon project has been created, no credentials have
been entered, no production data has been copied, and no existing Render service
has been changed.

## Why Neon
Neon offers a $0 PostgreSQL Free tier suitable for development and synthetic
testing. Free tier resource limits and recovery windows change: check the vendor
dashboard before relying on them. It is NOT a substitute for independent backups,
privacy-law compliance, incident response or an uptime guarantee.

## Provisioning (only after approving a specific provider and jurisdiction)
1. Create a completely separate Neon project called QOMUS (not the Academy DB).
2. Select an appropriate region after evaluating residency/legal requirements.
3. Create a restricted database role for the application and grant only:
   USAGE on schema `qomus_secure` and SELECT/INSERT/UPDATE/DELETE on
   `qomus_secure.documents_v1`.
4. Run `database/neon-schema.sql` via the Neon SQL editor as the database owner.
5. In a **TEST-only** Render instance set:
   - `QOMUS_DATABASE_URL`: restricted role's PostgreSQL connection URL,
     SSL enforced; never post the URL in chat or commit it.
   - `QOMUS_DATA_KEY_B64`: cryptographically random 32-byte base64 encryption key.
     Keep an independent secure recovery copy outside the database and backups.
6. Install dependencies with `npm install` and run `npm run test:security`.
7. Integrate authenticated session-derived `ownerId` with the adapter. **Never
   trust ownerId supplied by the browser, query string, or client JSON**.
8. Run synthetic two-user isolation, deletion, rollback, outage and encrypted
   backup/restore tests on the TEST service. Audit all existing account routes.
9. Create independent encrypted off-provider backups, verify restore, and
   establish monitoring before accepting real personal data.

## Components
- `database/neon-encrypted-store.js`: optional server-only data API;
  encrypts JSON documents using AES-256-GCM and binds ciphertext to both
  ownerId and recordId using authenticated additional data.
- `database/neon-schema.sql`: database schema, public grants revoked.
- `test/neon-encrypted-store.test.js`: local encryption/tamper tests.

## IMPORTANT limitations
- This is a **staged encrypted documents adapter**, NOT a completed migration
  for users, sessions, cases, consents or AI history.
- RLS policies and distinct DB roles must be thoroughly verified before
  production use. Ownership filtering in code does not replace full database
  isolation or least privilege.
- The QOMUS API server still sees plaintext when handling a user's document.
  Server compromise or key theft can expose plaintext despite encrypted storage.
- This adapter stores only small JSON documents (128 KiB maximum). Larger
  original PDFs/DOCX need a separate private encrypted object store.
- No free cloud database alone guarantees high-assurance protection of citizens'
  identity or court documents.
- Existing QOMUS JSON store must remain untouched until all records are safely
  backed up, migrated and reconciled.
