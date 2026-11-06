# QOMUS auth & account storage — 2026-11-06

## GitHub Actions
- Draft PR #41; main untouched.
- Run 42204806171: 10 tests passed, 0 failed, synthetic JSON integrity passed.
- Run 42205090631: passed. Additional storage diagnostic rejects ephemeral /tmp path.
- These tests do not validate production data or restore.

## Render live read-only review
- huquqiy-AI-backend, service srv-danam8jtqb8s73b8c5mg, live; 1 GB disk mounted at /var/data.
- Historical logs from Oct 31–Nov 3 contain repeated ACCOUNT STORAGE WARNING: /var/data/huquqiy-ai-data.json EACCES; fallback /tmp/QOMUS-data.json.
- No matching ACCOUNT STORAGE WARNING in queried Nov 5 00:00 UTC – Nov 6 11:00 UTC window.
- The absence of warnings does not prove correct live ACCOUNT_DATA_FILE, stored file integrity or backup.
- Available Render connector cannot read live file contents, inspect env variables, or open shell.

## Read-only diagnostic
- scripts/check-account-storage-readonly.js checks file-path location and write permissions, without reading file contents or writing user data.
- To verify production, run in authorized Render shell after review; do not deploy unreviewed code to main.
- Before making ANY live storage-path changes, preserve both persistent and possibly temporary data; changing blindly risks data loss.
- Real restore needs an isolated restricted environment; never upload production user data to GitHub Actions.

## Current conclusion
- Auth QA: PASS (10 tests).
- Synthetic backup integrity: PASS.
- Ephemeral path rejection: PASS.
- Persistent disk mount: PRESENT.
- Current live account file and actual durable persistence: UNVERIFIED.
- Real backup/restore: NOT DONE.
- No production code, data, DNS or environment changes performed.