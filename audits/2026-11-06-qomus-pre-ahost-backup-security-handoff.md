# QOMUS: backup, security and domain handoff (before AHOST)
Date: 2026-11-06

## 1. Real Neon backup and restore — DONE, manually
- Project: divine-boat-26942482, main branch br-frosty-haze-bf5opspy.
- Manual snapshot created: snap-sparkling-dream-bfrolimr ("qomus-before-security-hardening-2026-11-06").
- Snapshot restored to NEW isolated test branch br-proud-bread-bf420qw8 ("qomus-backup-restore-qa-20261106").
- Test-branch SQL verified 0 users and 0 cases at restore point.
- Added synthetic record on the RESTORED TEST branch only, verified branch revision 1 and 1 synthetic user; independently checked production main remains at revision 0, 0 users. This confirms functional restore, write isolation, and original unchanged.
- The snapshot remains available (confirmed via list_snapshots).
- Automatic schedule: attempted daily at 02:00 UTC with 7-day retention. Neon API rejected with "backup schedule creation is not enabled for this project" (HTTP 404). Current project history window is 6 hours; this is not a replacement for durable automated backups. Current subscription entitlement must change or an independently secret-managed external pg_dump/storage pipeline must be provisioned. Do not claim automatic daily backups are active.

## 2. Security audit — VERIFIED CONTROLS and remaining risk
- PR #43 tested actual HTTP and PostgreSQL for:
  * ordinary user's /admin/users access returns 403;
  * cross-site profile POST with valid session returns 403;
  * unauthenticated /admin and case page access redirect to login;
  * rejected cross-site POST did not alter stored profile data.
- CI: GitHub Actions "QOMUS Neon PostgreSQL Integration QA" completed SUCCESS for commit 74220909...; PR #43 merged into main as 4db754e57656e8aa33aefff71cffec6877fd973f.
- Existing controls: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy and HSTS for HTTPS requests; cookie HttpOnly/SameSite, role checks; sensitive account POST Origin checks; basic PII redaction on AI outbound, session storage and audit logging.
- Known remaining issues: CSP is not enforced (inline JS/CSS); rate limiting is currently opt-in and process-local and unsafe to enable for all users without trusted proxy identity/shared limiter; production email delivery and outbound security alerts not independently validated; Neon connection currently uses project owner credential (least-privilege role recommended); account data uses single versioned JSONB document (optimistic conflict rejection, not scalable per-user transactional tables); real user E2E on production not performed; security review cannot guarantee no vulnerabilities.
- Recent Render filtered logs after Neon launch show TLS compatibility warning from Node pg about sslmode, but no account-postgres startup error in earlier startup review. Certificate validation needs a targeted check before claiming comprehensive transport hardening.

## 3. AHOST/domain handoff — PREPARED, NOT MODIFIED
- Primary Render service is existing huquqiy-AI-backend in Oregon; render URL: https://huquqiy-ai-backend.onrender.com.
- Intended custom domains: verius.uz and www.verius.uz, not yet verified on Render.
- Render official general DNS guidance: if provider supports ALIAS/ANAME, apex @ -> huquqiy-ai-backend.onrender.com, otherwise A @ -> 216.24.57.1; CNAME www -> huquqiy-ai-backend.onrender.com; avoid conflicting A/CNAME/AAAA. Confirm exact domain target in Render Custom Domains before changing DNS.
- Render custom-domain settings aren't exposed by the connected Render plugin, and AHOST isn't connected. No claim of adding Render custom domains or changing AHOST DNS, HTTPS certificate or domain verification. No AHOST action taken.
- SSL/TLS certificate issuance is by Render after DNS and custom domain verification; don't buy a separate cert.
- Resend qomus.uz failed sender domain verification in a prior connected app check. Email DKIM/SPF records for verius.uz require Resend sender-domain setup and AHOST DNS updates. Do not assume Resend verified.

## Execution safety
- Existing Render web service and project retained; no AHOST action.
- Snapshot restore was to isolated branch, not production; no real users were copied, overwritten or erased.
- GitHub added security regression tests only and did not change application UI; merge auto-deploys a new commit due Render autoDeploy=yes.
- Final live status after this merge must be reconfirmed through Render deploy and app readiness logs.

## Unfinished / blocking
1. Daily automatic backup is not provisioned on current Neon entitlement; upgrade Neon or configure credential-safe external scheduled backups with external retention and verified restores.
2. Render Custom Domains UI must be used or a custom-domain-specific API integration supplied; current Render connector has no domain actions.
3. AHOST DNS not touched by request; pending domain setup and real HTTPS verification.
4. Resend sender verification still pending DNS.
5. Full production penetration test, recovery drills, vulnerability remediation and 100% security guarantees not completed.
