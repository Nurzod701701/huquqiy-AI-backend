# QOMUS Render Neon automatic backup — verified live 2026-11-06

## Implemented
- Pull request #44 merged into main: commit aa17b148f3c46d0630bf5bce82991538bc8f0af4.
- Existing Render web service only; no new server.
- Render encrypted secret env: QOMUS_BACKUP_KEY (generated 256-bit key), QOMUS_BACKUP_ENABLED=yes, QOMUS_BACKUP_DIR=/var/data/backups.
- Daily 02:00 UTC = 07:00 Asia/Tashkent, 7-day retention logic, opportunistic 15-second after-start initial backup.
- AES-256-GCM encryption, authenticated integrity check, 32 MiB per-file hard cap, 96 MiB free-disk guard. All public schema table rows and column metadata captured as logical JSON. This is NOT pg_dump or complete DDL / grants / extensions; full automated restore-to-Postgres remains unimplemented.
- Actual Render deployment dep-dbmu0hts25qs739veoug reached LIVE.
- Verified Render logs:
  * 2026-11-06 14:13:26 UTC: QOMUS_POSTGRES_READY
  * 2026-11-06 14:13:26 UTC: QOMUS_BACKUP_SCHEDULED {\"utcHour\":2,\"retentionDays\":7}
  * 2026-11-06 14:13:42 UTC: QOMUS_BACKUP_OK {\"tables\":11,\"rows\":3,\"bytes\":12046,\"verified\":true}
- CI suite includes backup encryption, tamper rejection, key validity and UTC date scheduling and all earlier account/security tests; succeeded before merge.

## Limitations / next steps
- Because encrypted backups reside on the same Render persistent disk and the encryption key is in Render Environment, this is not independent off-site disaster recovery. Configure an off-site copy to separate object storage and securely escrow/recover the encryption key independent of Render.
- Restore-from-file to an isolated PostgreSQL instance must be implemented and tested before claiming full backup/restore readiness. Earlier Neon-native snapshot restore was tested separately.
- Backup timer operates only when Node process is running. Render paid Starter normally stays on, but outages/deploy restarts near 02:00 UTC might skip a day's scheduled run. Monitor QOMUS_BACKUP_OK timestamp and alert on missing backups.
- Capture currently limited to <=32 MiB encrypted snapshot; increase guard/storage or migrate to streaming pg_dump as data grows.
- Seven-day rotation runs after successful backup; time-based retention is approximate and may keep up to seven recent backups.
- No AHOST changes.
