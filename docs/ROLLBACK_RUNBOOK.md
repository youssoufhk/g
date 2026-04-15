# Rollback Runbook

> **Who this is for.** The founder (or whoever is on call) when a migration or deploy goes wrong in production. Read this before Phase 5 begins.
> **Scope.** Postgres migration failures, Cloud Run deploy failures, cross-tenant schema drift reconciliation, full-cluster PITR as a last resort.
> **Not in scope.** Application-level bugs (use normal incident response). AI kill switches and other degraded-mode toggles (see `docs/DEGRADED_MODE.md`).

This runbook is opinionated and assumes the schema-per-tenant model locked in `docs/decisions/ADR-001-tenancy.md`. Every procedure here must be runnable from a laptop with: `gcloud` CLI authenticated, Cloud SQL Auth Proxy, `psql`, and a checkout of the `gammahr_v2` repo.

---

## 1. Deploy halt policy

Rules, in order of priority:

1. **Any tenant migration failure halts the full rollout.** The migration runner (`backend/migrations/runner.py`) writes to `public.alembic_runs` per tenant. If any tenant reports `status = 'failed'`, the runner must not advance the deploy marker. Cloud Run stays on the previous revision.
2. **Alert ops@gammahr.com immediately.** The runner publishes a Pub/Sub event `migration.failed` that triggers an email and a Slack webhook to the ops channel. If Pub/Sub is also down, the runner's supervisor shell script falls back to `gcloud logging write` + a direct SMTP call via the Workspace relay.
3. **New deploys are blocked on the drifted tenant until reconciled.** The CI deploy job reads `public.alembic_runs` at start. If any tenant has a failure row newer than its last success, the job exits 1 with a list of blocked tenants.
4. **Do not manually re-run `alembic upgrade head` cluster-wide.** That bypasses the runner and creates ghost rows. Use the procedures in section 3.
5. **Never `DROP SCHEMA` during an incident.** Even for a drifted test tenant. If in doubt, pause the runner and page the founder.

### What "halted" means concretely

- Cloud Run traffic stays on the previous revision (`gcloud run services update-traffic --to-revisions=PREVIOUS=100`).
- The failing migration's Celery fan-out job is paused via `celery control cancel_consumer migrations`.
- A banner is posted on `status.gammahr.com` (Cloudflare Pages) stating "Deploy paused for investigation".
- The founder is paged (see section 6).

---

## 2. Migration failure modes

Each subsection follows the same shape: **Symptoms** (how you find out), **Immediate action** (stop the bleeding), **Root cause steps** (what to check), **Recovery** (how to get back to green).

### 2.1 Constraint violation mid-migration

Example: a migration adds `NOT NULL` to `employees.country_code`, but one tenant has a handful of legacy rows with `NULL`.

**Symptoms**
- `public.alembic_runs.status = 'failed'` for one or more tenants.
- `error_message` column contains `psycopg2.errors.NotNullViolation`.
- Cloud Run deploy job is blocked.
- Usually only 1 to 3 tenants are affected (the ones with dirty data). Clean tenants have already moved to the new version.

**How you find out**
- Slack alert from ops channel: "Migration v0045_employees_country_nn failed for tenant_acme".
- Email to ops@gammahr.com with the same content.
- The CI deploy job shows red and lists blocked tenants.

**Immediate action**
1. Do NOT re-run the migration. It will fail again.
2. Connect to the failing tenant via Cloud SQL Auth Proxy:
   ```bash
   cloud-sql-proxy gammahr-prod:europe-west9:gammahr-prod-db --port=5433 &
   psql "host=127.0.0.1 port=5433 dbname=gammahr user=migrator"
   ```
3. Inspect the offending rows:
   ```sql
   SET search_path = tenant_acme, public;
   SELECT id, legal_name, country_code FROM employees WHERE country_code IS NULL;
   ```

**Root cause steps**
- Ask: was the dirty data seeded by an old import? A pre-migration backfill that was never run? A customer edit bypassing validation?
- Check `audit_log` for recent changes on the affected rows.
- If the data is legitimate (e.g., the customer has not filled their country yet), the migration was wrong: it should have been expand-backfill-contract, not a single `NOT NULL` add.

**Recovery**
1. **Option A (preferred): backfill-then-retry.** Run a one-off script to fill the `NULL` values with a sensible default (e.g., the tenant's `tenants.country_code` from the `public` table). Commit the script under `backend/migrations/fixes/` for traceability. Then re-run the migration for that tenant only:
   ```bash
   python -m backend.migrations.runner upgrade --tenant=tenant_acme --to=head
   ```
2. **Option B: split the migration.** Revert the failed migration repo-side, split into three ordered migrations (add column nullable, backfill, add NOT NULL), ship the first two, verify all tenants are clean, then ship the third. This is the right fix for any future constraint-add and should become the pattern.
3. Mark `alembic_runs.status = 'rolled_back'` for the failed row (never delete history).
4. Unblock the deploy: re-run the runner. Clean tenants are no-ops.
5. Notify ops@gammahr.com with a one-line summary.

### 2.2 Lock timeout

Example: a migration adds a column with a default value to a large table, holding `ACCESS EXCLUSIVE` for minutes. A concurrent long query blocks it, and `statement_timeout` fires.

**Symptoms**
- `public.alembic_runs.status = 'failed'` with `error_message` containing `canceling statement due to statement timeout` or `could not obtain lock`.
- Cloud SQL metrics show a spike in `pg_locks` and `pg_stat_activity` wait states.
- The tenant's users may see 504s or `LockNotAvailable` errors during the attempt.

**How you find out**
- Same pipeline as 2.1. Additionally, Cloud SQL alerting fires if lock wait p95 > 2 s.

**Immediate action**
1. Confirm the lock is released:
   ```sql
   SELECT pid, state, wait_event_type, wait_event, query
     FROM pg_stat_activity
     WHERE datname = 'gammahr' AND state != 'idle'
     ORDER BY xact_start;
   ```
2. If a runaway query is still holding the lock, terminate it: `SELECT pg_terminate_backend(<pid>);`. Log the pid and query in the incident record.
3. Do not retry the migration during peak hours (09:00-18:00 Europe/Paris). Wait for the quiet window (02:00-04:00).

**Root cause steps**
- Was the migration using `ALTER TABLE ... ADD COLUMN ... DEFAULT <expr>` on a large table? This rewrites the table under `ACCESS EXCLUSIVE`. Fix: add the column nullable, backfill in batches, then set the default.
- Was a long-running reporting query blocking DDL? Check `audit_log` and application logs for who was querying at the time.

**Recovery**
1. Rewrite the migration to be lock-friendly:
   - `ALTER TABLE ... ADD COLUMN foo TEXT` (no default, nullable, fast)
   - Backfill via a Celery task in chunks of 10k rows with `COMMIT` between chunks
   - `ALTER TABLE ... ALTER COLUMN foo SET DEFAULT '...'` (metadata only)
   - `ALTER TABLE ... ALTER COLUMN foo SET NOT NULL` once backfill is complete
2. Re-run the runner in the quiet window.
3. If the migration must run now (security fix), schedule a 15-minute maintenance window, notify tenants via the in-app banner, and run it with `lock_timeout = 30s` so it fails fast if blocked.

### 2.3 Disk full on primary

**Symptoms**
- Cloud SQL primary returns `ERROR: could not extend file "base/..."` or `could not write to file: No space left on device`.
- All write queries fail. Read queries succeed until they need temp files.
- Cloud SQL alerting fires when disk usage exceeds 90% (the GCP metric path is `database/disk/utilization`, kept verbatim here because it is a literal metric identifier).

**How you find out**
- PagerDuty alert (if configured) or Cloud SQL email alert.
- Multiple tenants report 500 errors at once.

**Immediate action**
1. **Do not panic. Do not restart the instance.** Restart loses temp space recovery.
2. Open Cloud SQL console. Under "Storage", enable "Automatic storage increase" if not already on (this is the first-resort fix and takes effect in under a minute).
3. If automatic increase is already on and has plateaued, manually increase disk size by 20% via `gcloud sql instances patch gammahr-prod-db --storage-size=<new_gb>`. This is online and takes ~2 minutes.
4. Monitor `pg_stat_activity` for queries that will retry automatically once space is back.

**Root cause steps**
- Identify the table that grew: `SELECT relname, pg_size_pretty(pg_total_relation_size(oid)) FROM pg_class ORDER BY pg_total_relation_size(oid) DESC LIMIT 20;`
- Suspects: `audit_log`, `ai_events`, `timesheet_entries`, `expense_receipts` (BLOB-ish if mis-stored). `audit_log` is the most common cause of disk-full on well-run SaaS.
- Check for long-running idle-in-transaction sessions preventing `VACUUM`: `SELECT pid, age(now(), xact_start), query FROM pg_stat_activity WHERE state = 'idle in transaction' ORDER BY xact_start;`
- Check for bloated indexes with `pgstattuple`.

**Recovery**
1. Short-term: the disk increase already fixed the outage. Confirm writes are flowing again.
2. Medium-term: run `VACUUM (FULL, ANALYZE)` on bloated tables during the next quiet window. This takes `ACCESS EXCLUSIVE` so schedule carefully.
3. Medium-term: if `audit_log` is the cause, check that the nightly archive job (audit entries older than 7 years to GCS Cold Line) is running. See `docs/COMPLIANCE.md` section 4.
4. Long-term: add a dashboard panel for `pg_database_size('gammahr')` growth rate. Set an alert at 70% disk usage so you see the trend before it becomes an outage.

### 2.4 Migration partially applied across tenants

Example: 3 of 200 tenants succeeded, 1 failed, 196 were never attempted because the runner halted.

**Symptoms**
- `alembic_runs` shows a mix of `success`, `failed`, and `pending` rows for the same migration.
- CI deploy job blocked.

**How you find out**
- `alembic_runs` dashboard view (to be built in Phase 2) or a direct SQL query:
  ```sql
  SELECT status, count(*) FROM alembic_runs WHERE version = 'v0045' GROUP BY status;
  ```

**Immediate action**
1. Freeze the runner. `celery control cancel_consumer migrations`.
2. Do not roll back the 3 successful tenants yet. Rolling forward is almost always cheaper than rolling back.
3. Diagnose the failure per section 2.1 or 2.2.

**Root cause steps**
- Was it data-specific (the 1 failing tenant has dirty data)? Follow 2.1.
- Was it environment-specific (the 1 failing tenant's schema has a custom extension or drifted from canonical)? Follow section 5.

**Recovery**
1. Fix the failing tenant per 2.1.
2. Resume the runner with `--resume`. The runner picks up where it left off: skips successful tenants, retries failed, proceeds to pending.
3. Wait for all 200 tenants to report `success`.
4. Advance the deploy marker. Cloud Run rolls forward.
5. Post-incident: consider whether the migration should have been run against a canary tenant first. If the failing tenant is the customer-facing one, the process failed. Add a canary step to the runner.

---

## 3. Per-tenant rollback procedure

Use this when a migration landed on one tenant, the tenant is broken, and you need to get them back to the previous schema version while leaving the rest of the cluster alone.

### 3.1 Prerequisites

- Cloud SQL Auth Proxy authenticated with the `migrator` service account.
- Local checkout of `gammahr_v2` at the commit matching the **current cluster-wide deploy** (not the failing one).
- `psql` installed.
- Access to `ops@gammahr.com` for alerting.

### 3.2 Steps

1. **Identify the failed tenant and the target version.**
   ```sql
   SELECT tenant_id, version, status, started_at, error_message
     FROM public.alembic_runs
     WHERE status = 'failed'
     ORDER BY started_at DESC;
   ```
   Target version = the version the tenant was at before the failure. Look at the previous successful row for that tenant.

2. **Verify no writes are in flight for this tenant.** Pause tenant traffic by flipping `tenants.access_state = 'maintenance'`. The auth middleware returns 503 with a maintenance page for that tenant only.
   ```sql
   UPDATE public.tenants SET access_state = 'maintenance' WHERE slug = 'acme';
   ```

3. **Back up the tenant schema before touching it.**
   ```bash
   pg_dump -h 127.0.0.1 -p 5433 -U migrator -d gammahr \
     --schema=tenant_acme \
     --format=custom \
     --file=/tmp/tenant_acme_pre_rollback_$(date +%Y%m%d_%H%M%S).dump
   gsutil cp /tmp/tenant_acme_pre_rollback_*.dump gs://gammahr-incident-snapshots/
   ```

4. **Run the down-migration for that tenant only.** Alembic down-migrations are not always safe (data loss is possible) so review the migration code first. If the down-migration is destructive, skip to step 5 and use PITR instead.
   ```bash
   python -m backend.migrations.runner downgrade --tenant=tenant_acme --to=v0044
   ```
   The runner writes a new `alembic_runs` row with `status = 'rolled_back'` and the previous version.

5. **Verify the schema fingerprint matches canonical for v0044.**
   ```bash
   python -m backend.migrations.runner fingerprint --tenant=tenant_acme --expected=v0044
   ```
   The fingerprint compares `pg_catalog` (tables, columns, indexes, constraints) against a canonical fingerprint file in `backend/migrations/fingerprints/v0044.json`. Any diff is a red flag: do not proceed.

6. **Re-run the migration orchestrator with the failed tenant skipped.**
   ```bash
   python -m backend.migrations.runner upgrade --skip=tenant_acme --to=head
   ```
   This unblocks the deploy for the other 199 tenants.

7. **Restore tenant traffic.**
   ```sql
   UPDATE public.tenants SET access_state = 'active' WHERE slug = 'acme';
   ```

8. **Alert the founder** with the incident summary (section 6).

9. **Open a post-incident ticket** and write the incident note (section 7). The failing tenant is now on an older version than the rest of the cluster. This is acceptable for hours, not days. Fix the migration and ship a version that applies cleanly to the drifted tenant.

### 3.3 Gotchas

- **Down-migrations can lose data.** If the failed migration added a column and populated it, the down-migration drops the column and the data is gone. Always snapshot first (step 3) so you can restore the column contents via targeted `UPDATE ... FROM` after re-applying the up-migration.
- **`search_path` is sticky.** If you opened a `psql` session, the session's `search_path` does not auto-update when you switch tenants. Always `SET search_path = tenant_<slug>, public;` explicitly.
- **Sequences are per-schema.** Rolling back a migration that created a sequence is fine. Rolling back a migration that inserted rows using a sequence does not reset the sequence, so new inserts after rollback may skip values. This is harmless for non-customer-visible sequences and a problem for `invoice_sequences` (never roll back anything that touched `invoice_sequences`; use PITR instead).

---

## 4. Full-cluster PITR (last resort)

Point-in-time recovery of the entire Cloud SQL instance. **This is the nuclear option.** Data loss equals time between the incident and the last safe transaction. Every tenant is affected, not just the failing one. Use only when the alternatives in sections 2 and 3 cannot recover the cluster within SLO.

### 4.1 When to use

- **Corruption** that affects `public` tables (identity, tenants, billing, audit). Schema-per-tenant isolation does not protect these.
- **Silent data loss** across multiple tenants (e.g., a buggy ORM cascade that deleted rows you needed).
- **Rollback-at-scale** when more than ~20 tenants failed a migration and per-tenant rollback would take hours.
- **Cluster corruption** signaled by Cloud SQL replica lag exceeding 1 hour or the primary refusing connections.

**Do NOT use** when:
- Only 1-5 tenants failed (use section 3).
- You have not tried Cloud Run rollback first (section 4.5).
- You have not confirmed the backup exists and is readable.

### 4.2 Expected RTO

- **RTO:** 20 to 30 minutes from decision to traffic restored.
- **RPO (data loss):** from the last write before the corruption to the PITR timestamp. Pick a PITR timestamp 30 to 60 seconds before the first symptom to maximize safety.

### 4.3 Steps

1. **Pause Cloud Run traffic at Cloudflare.** In the Cloudflare dashboard, flip the `app.gammahr.com` record into "Under maintenance" mode (a pre-built Worker returns a 503 with a maintenance page). This takes 30 seconds to propagate.

2. **Capture the current (broken) instance state for forensics.**
   ```bash
   gcloud sql export sql gammahr-prod-db gs://gammahr-incident-snapshots/broken_$(date +%Y%m%d_%H%M%S).sql.gz --database=gammahr
   ```
   This can run in the background while PITR proceeds. It takes ~10 minutes for a ~50 GB database.

3. **Create a new Cloud SQL instance from PITR.**
   ```bash
   gcloud sql instances clone gammahr-prod-db gammahr-prod-db-pitr-$(date +%Y%m%d-%H%M%S) \
     --point-in-time='2026-04-15T10:23:00.000Z' \
     --region=europe-west9
   ```
   Wait for the clone to become available (~15 minutes for a 50 GB instance).

4. **Verify the PITR instance is good.** Connect via Cloud SQL Auth Proxy and run a smoke test:
   - `SELECT count(*) FROM public.tenants;`
   - `SELECT max(created_at) FROM public.audit_log;`
   - `SELECT count(*) FROM tenant_acme.employees;` (for at least 3 representative tenants)
   - `SELECT version FROM public.alembic_runs ORDER BY started_at DESC LIMIT 5;`
   If any of these look wrong, stop. Call the founder. Do not promote.

5. **Promote the new instance.** Update the Cloud Run env var `DATABASE_URL` to point at the new instance's connection string.
   ```bash
   gcloud run services update gammahr-backend \
     --region=europe-west9 \
     --update-env-vars=DATABASE_URL='postgresql://...@gammahr-prod-db-pitr-.../gammahr'
   ```
   Cloud Run rolls a new revision (~60 seconds).

6. **Resume traffic.** Flip Cloudflare back to normal.

7. **Communicate.** Post to `status.gammahr.com` immediately with: what happened (data corruption), RPO (how much data was lost), what was restored, what customers need to re-do. Email every affected tenant admin.

8. **Keep the broken instance around for 30 days** for forensic work. Rename it `gammahr-prod-db-broken-<date>`. Do not delete until a full root-cause analysis is complete.

### 4.4 After a PITR

- Tenants will have lost any data written after the PITR timestamp. This includes: new timesheet entries, expense submissions, leave requests, approvals, invoices. Customers must re-enter these.
- `invoice_sequences` is at its pre-PITR state. Any invoices issued in the lost window have "ghost numbers" that do not exist in the new instance. If a customer sent such an invoice, you must manually re-issue with the same number (and reconcile bookkeeping).
- The `ai_events` table is at its pre-PITR state. Vertex AI Gemini costs billed for the lost window are unrecoverable but also not user-visible.

### 4.5 Cloud Run rollback (prefer this first)

If the incident is a bad code deploy (not a data corruption), Cloud Run rollback is faster and loses no data:
```bash
gcloud run services update-traffic gammahr-backend \
  --region=europe-west9 \
  --to-revisions=gammahr-backend-0042-xyz=100
```
Always try this first. PITR is only for data corruption, not code bugs.

---

## 5. Cross-tenant schema drift reconciliation

Use this when the weekly drift detector (Sunday 02:00 UTC Celery job) alerts on a divergence between a tenant's schema and the canonical fingerprint.

### 5.1 How drift happens

- A migration was run manually on one tenant outside the runner (this should never happen in prod, but happens in staging).
- A migration silently failed partway (e.g., index creation timed out) but status got marked success.
- A previous incident left a tenant in a mixed state.
- A hand-run SQL repair added an ad-hoc index or column.

### 5.2 Steps

1. **Pull the drift report from GCS.**
   ```bash
   gsutil cp gs://gammahr-drift-reports/$(date -I -d 'last sunday')/report.json /tmp/drift.json
   ```

2. **Read the diff.**
   ```bash
   jq '.tenants[] | select(.drift_count > 0)' /tmp/drift.json
   ```
   The report lists per-tenant: missing tables, missing columns, extra columns, missing indexes, extra indexes, constraint differences.

3. **Decide: reconcile the tenant to canonical, or update canonical?**
   - If the drift is "this tenant has something the canonical does not" and it is legitimate (e.g., a beta feature gate), update canonical.
   - If the drift is "this tenant is missing something that canonical has", reconcile the tenant.
   - If the drift is weird (extra columns, extra indexes with weird names), reconcile the tenant AND investigate how it got there.

4. **Generate a reconciliation migration.**
   ```bash
   python -m backend.migrations.runner reconcile --tenant=tenant_acme --dry-run
   ```
   This prints a SQL diff (add the missing column, drop the extra index, etc.). Review by eye. Never run blind.

5. **Apply the reconciliation.**
   ```bash
   python -m backend.migrations.runner reconcile --tenant=tenant_acme --apply
   ```
   The runner writes a `reconciliation` row to `alembic_runs` with the SQL that was applied.

6. **Verify.**
   ```bash
   python -m backend.migrations.runner fingerprint --tenant=tenant_acme --expected=head
   ```

7. **Alert ops@gammahr.com** with the before/after diff and the reason for the drift.

### 5.3 Gotchas

- **Reconciliation is never automatic in production.** The runner supports `--apply` but the founder must run it explicitly. Full auto-reconciliation is deferred (DEF-054).
- **Check for customer-visible impact** before reconciling. Dropping an extra index is harmless. Dropping an extra column is destructive. If in doubt, snapshot first.
- **Reconciliation is idempotent.** Running `fingerprint` again after a successful reconciliation should return "match".

---

## 6. Contact tree

Page people in this order. Do not skip ahead.

| Level | Who | Contact | When |
|---|---|---|---|
| 1 | Founder (primary) | +33 (founder mobile), founder@gammahr.com | Every incident. Always first. |
| 2 | Founder backup | To confirm with founder (pilot launch deliverable) | Founder unreachable for >15 min |
| 3 | GCP support | Cloud Console > Support > Create case, severity P1 | Cloud SQL instance unhealthy, Cloud Run stuck, networking broken |
| 4 | Cloudflare support | dashboard > Support > Submit a ticket (Enterprise if on Enterprise, Pro otherwise) | Edge unreachable, DNS broken, WAF false-positives flooding |

### What to include in the page

- **One sentence** describing the symptom (e.g., "deploy v0045 failed on tenant_acme with NotNullViolation").
- **Time first noticed** in UTC.
- **Blast radius** (one tenant? multiple? all?).
- **What you already tried** (so the founder does not repeat work).
- **Link to the Cloud Run logs URL** or the `alembic_runs` query result.
- **Link to the draft incident doc** (section 7) if one exists yet.

### What NOT to include

- Speculation. Stick to what you verified.
- Em dashes.
- Marketing language ("we've had a small hiccup"). Call it what it is.

---

## 7. Post-incident

Every incident, even a small one, gets a one-page write-up. Store under `docs/incidents/YYYY-MM-DD-<slug>.md`. Link from this runbook's "Known incidents" section below. Run the write-up within 48 hours of resolution.

### Template

```markdown
# Incident: <short title>

**Date:** YYYY-MM-DD
**Duration:** HH:MM to HH:MM UTC
**Severity:** SEV-1 / SEV-2 / SEV-3
**Author:** <name>
**Status:** Draft / Final

## What happened
One paragraph. Plain language. No jargon.

## Blast radius
- Tenants affected: N (list: tenant_acme, tenant_bco)
- Users affected: ~N
- Data loss: yes / no (if yes, what)
- Customer-visible: yes / no

## Timeline
- HH:MM UTC - <event>
- HH:MM UTC - <event>

## Root cause
Why did this happen. Not "human error". The technical reason a human was able to make that error.

## How we recovered
The procedures we ran, in order. Reference section numbers from this runbook.

## What worked
What we were glad we had.

## What did not
What slowed us down. Missing alerts, missing runbook, missing access, missing tooling.

## Follow-ups
- [ ] <concrete change> (owner: <name>, due: <date>)
- [ ] <concrete change> (owner: <name>, due: <date>)

## Links
- Cloud Run logs URL:
- `alembic_runs` query:
- Slack thread:
```

### Known incidents

(This section gets appended by each post-incident write-up. Phase 2 deliverable: start it here as an empty list and keep it sorted newest first.)

- _No incidents yet. Phase 2-5 builders must keep this list up to date._

---

## 8. Drill schedule

Run these drills quarterly to keep the muscles warm. A drill that you never run is a drill that fails in production.

| Drill | Frequency | Owner | Target outcome |
|---|---|---|---|
| Per-tenant rollback on a fake-tenant schema | Quarterly | Founder | Section 3 runnable end-to-end in under 15 minutes |
| Full-cluster PITR on staging | Quarterly | Founder | Section 4 runnable end-to-end in under 30 minutes |
| Drift reconciliation on staging | Quarterly | Founder | Section 5 runnable end-to-end in under 10 minutes |
| Cloudflare maintenance flip | Quarterly | Founder | Section 4 step 1 runnable in under 60 seconds |
| Contact tree dry run | Semi-annually | Founder | Every contact reachable within target time |

Log drill results in `docs/incidents/drills/YYYY-Q<n>.md`.

---

## 9. Cross-references

- `docs/decisions/ADR-001-tenancy.md` section on drift detection and reconciliation.
- `docs/decisions/ADR-005-storage.md` section on legal-hold break-glass (related but separate runbook).
- `docs/COMPLIANCE.md` section 4 (audit log retention) and section 9 (GDPR breach notification SLA).
- `docs/DEGRADED_MODE.md` (kill switches, fallback behavior).
- `specs/DATA_ARCHITECTURE.md` section 11 (migration strategy, `alembic_runs` table schema).
- `backend/migrations/runner.py` (the actual code this runbook drives).
