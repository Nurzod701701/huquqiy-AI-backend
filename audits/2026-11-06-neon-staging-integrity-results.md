# QOMUS Neon migration staged integrity test — 2026-11-06

## Verified
- Neon production database: project divine-boat-26942482, qomus on main. Its tables exist. At last count: users 0, cases 0, documents 0, audit logs 0. Production database is NOT connected to the live Render app.
- Isolated Neon test branch `qa-qomus-migration-20261106` (br-broad-smoke-bfp0jzrp) created from main.
- In QA branch ONLY, inserted four synthetic records: one fake user, one fake case, one fake document, one fake audit log. Counts verified as 1 each.
- Main remained at 0 for all four, verifying isolation.
- Added composite `app_cases(id,user_id)` UNIQUE and document/conversation composite foreign keys ensuring linked case belongs to the same owner. First validated with existing synthetic test rows, then applied to the empty main database. Migration marker: `2026-11-06-owner-case-integrity`.
- GitHub isolated migration code and CI from PR #41 passed before this step.

## BLOCKED, DO NOT MISREPRESENT AS COMPLETE
- Render Web Shell manual investigation on Nov 6: /var/data mounted but directory empty; /tmp has node cache only; configured ACCOUNT_DATA_FILE=/var/data/huquqiy-ai-data.json but file missing. Old accounts not present on this live instance according to shown commands. Historical log EACCES/fallback to /tmp on older instances.
- Render snapshots for Nov 5 and Nov 6 are visible but not inspected; restoring is destructive to live disk and MUST NOT be initiated casually. Do not restart, redeploy or change ACCOUNT_DATA_FILE before recovery decision.
- Existing server.js uses synchronous JSON accountLoadDb/accountSaveDb in many routes. Simply adding DATABASE_URL would NOT activate Postgres. An async data access refactor and login/account/case/document flow tests remain required.
- Migration cannot safely import old users without verified source data and backup; neither is available via the connected Render plugin.
- No old real users or personal data were transferred. No Render production settings/deploy changed.

## Next safe technical milestones
1. Seek source recoverability through authorized protected backups/old instance exports; never restore snapshots onto the only live disk without backup and impact analysis.
2. Implement async PG adapter in isolated branch and integration suite, using the Neon QA branch and synthetic data.
3. Verify migration mapping and full restore in staging before deciding to switch existing Render service.
4. Capture authoritative snapshot, apply migration, verify user IDs/document counts, controlled cutover and rollback.
