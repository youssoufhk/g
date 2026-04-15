# Data Retention

> **Who this is for.** The Phase 5 engineer writing a Celery sweep task and asking "how long do I keep this row?". The founder answering a DPA clause question from a customer's legal team. The auditor walking the retention chain from a row to its legal basis.
> **Scope.** Per-entity, per-country retention matrix. Anonymization vs hard delete semantics. Legal holds. GDPR Article 15 and Article 17 procedures. Celery enforcement schedule. Year 2+ country placeholders.
> **Not in scope.** Invoice legal fields (see `docs/COMPLIANCE.md` §5). Sub-processor DPAs (see `docs/COMPLIANCE.md` §11). Residency enforcement at the GCP org-policy level (see `specs/DATA_ARCHITECTURE.md` §8.4).
> **Authority.** This doc is the operational extraction of `docs/COMPLIANCE.md` §2 for engineers. If the two ever disagree, `docs/COMPLIANCE.md` wins (it carries the legal citations reviewed by counsel); this doc gets a follow-up to sync.
> **Cross-references.** `docs/COMPLIANCE.md` §2 (retention table with legal citations), §3 (GDPR DSR procedures), §8 (legal hold); `specs/DATA_ARCHITECTURE.md` §8.2; `docs/decisions/ADR-005-storage.md` (CMEK, GCS lifecycle, legal-hold bucket); `docs/COUNTRY_PLAYBOOKS.md` (year 2 countries); `docs/DEFERRED_DECISIONS.md` DEF-071 to DEF-074.

---

## 1. How to use this doc

Every row in a Gamma table has a retention window, a legal basis, and a path out (anonymize, hard-delete, or both in sequence). The engineer writing retention-aware code picks the row in section 2, reads the column for the tenant's country, and calls the matching Celery job. The founder answering a legal question finds the row, reads the "Legal basis" column, and quotes it.

Three reading rules:

1. **The country with the longest window wins.** A customer tenant with `legal_jurisdiction = 'FR'` uses the FR column. A multi-country tenant (rare in v1.0) uses the max of all applicable countries.
2. **Custom contracts override defaults upward only.** A 15-year-retention clause in `public.tenant_custom_contracts` extends the window. A 2-year clause is rejected at contract creation time.
3. **Legal holds override everything.** A row flagged `legal_hold = true` is skipped by every retention job until the hold is released. See section 4.

---

## 2. The master retention matrix

**v1.0 markets: France and United Kingdom only.** Year 2 countries (Germany, Canada, Morocco, Niger, WAEMU) are placeholders and must not be relied on before the first customer in each jurisdiction signs. See section 9.

Windows are from **event date** (e.g., invoice issue date, employee termination date, session end date) unless stated otherwise. All sweep jobs live in `backend/app/features/retention/jobs.py`.

| Entity | FR default | UK default | Legal basis | Anonymization path | Hard delete path | Enforcing Celery job |
|---|---|---|---|---|---|---|
| `public.users` (active) | While tenant active | While tenant active | GDPR Art. 6(1)(b) (contract) | N/A | On tenant deletion (§7 tenant lifecycle) | `retention.users.sweep` |
| `public.users` (terminated) | 5 years from termination | 6 years from termination | FR: Code du travail, 5 years post-termination. UK: HMRC PAYE, 3 years + current year. | Replace email to `deleted-<uuid>@gammahr.invalid`, name to `Deleted User`, set `deleted_at`. | After retention window. | `retention.users.sweep` |
| `tenant_<slug>.employees` (active) | While employed | While employed | Contract | N/A | On employment end transition | `retention.employees.sweep` |
| `tenant_<slug>.employees` (terminated) | 5 years | 6 years | FR: Code du travail art. L.1221-1 + paiement des salaires. UK: HMRC. | Replace name, email, phone, address, banking with hashed tokens. Keep `employee_id`, hire date, termination date, role, department. | After retention window. Hard delete only if no remaining foreign-key dependencies on audit-bearing rows. | `retention.employees.sweep` |
| `tenant_<slug>.timesheet_weeks` | 5 years | 6 years | FR: Code du travail art. L.3171-3 (3 years) extended to 5 years for payroll. UK: Working Time Regulations 2 years; HMRC 6 years. | Replace `employee_id` reference with tokenized `deleted_employee_<n>`, keep hours and project allocations for aggregate reporting. | After retention window. | `retention.timesheets.sweep` |
| `tenant_<slug>.timesheet_entries` | 5 years | 6 years | Same as timesheet_weeks | Cascade from parent timesheet_week anonymization. | Cascade from parent. | `retention.timesheets.sweep` |
| `tenant_<slug>.leave_requests` | 5 years | 6 years | Same as timesheet (payroll tie-in) | Replace requester + approver with tokens. Keep dates, type, status. Reason text (Art. 9 medical) is CMEK-encrypted and purged at window end regardless. | After retention window. | `retention.leaves.sweep` |
| `tenant_<slug>.expenses` | 10 years | 6 years | FR: CGI art. L.102 B LPF. UK: HMRC VAT Notice 700/21. | Replace submitter with token. Keep amount, vendor, date, currency, VAT fields. | After retention window. | `retention.expenses.sweep` |
| `tenant_<slug>.expense_receipts` (GCS files) | 10 years | 6 years | Same as expenses | N/A (file is the legal document) | GCS lifecycle rule with retention lock in `gammahr-prod-expense-receipts/`. Deleted at window end by GCS itself. | GCS lifecycle (no Celery) |
| `tenant_<slug>.invoices` (issued to clients) | 10 years | 6 years | FR: Code de commerce art. L.123-22 + CGI L.102 B. UK: HMRC 6 years from end of VAT period. | N/A (kept verbatim; removing data invalidates the legal document) | After retention window. Hard delete is a schema DELETE, not a scrub. | `retention.tenant_invoices.sweep` |
| `tenant_<slug>.invoices` (void) | 10 years | 6 years | Same as above (void invoices remain legal documents) | N/A | After retention window. | `retention.tenant_invoices.sweep` |
| `public.subscription_invoices` | 10 years | 10 years | FR: Code de commerce art. L.123-22 applies to Gamma as issuer (Global Gamma Ltd UK, but tracks FR window for longest-applicable-law). See `docs/BILLING_LIFECYCLE.md` §9. | N/A (legal document, kept verbatim) | After retention window. | `retention.subscription_invoices.sweep` |
| `tenant_<slug>.clients` | Contract end + 10 years | Contract end + 6 years | Tied to invoice retention (every client appears on invoices). | Tokenize contact names, emails, phone numbers. Keep company legal name, VAT ID, billing address, invoice history. | After retention window. | `retention.clients.sweep` |
| `tenant_<slug>.projects` | Contract end + 10 years | Contract end + 6 years | Same as client (projects are billable work). | Tokenize notes and internal descriptions. Keep project name, code, client reference, date range, budget. | After retention window. | `retention.projects.sweep` |
| `public.files` (CSV imports, raw) | 30 days | 30 days | FR: none, operational only. UK: none. | N/A (file is purged in full) | GCS lifecycle rule on `gammahr-prod-imports-raw/`, daily. | GCS lifecycle |
| `public.files` (avatars) | Until user explicit delete | Until user explicit delete | Consent (GDPR Art. 6(1)(a)) | N/A | User account settings "delete avatar" triggers immediate purge. | User-initiated |
| `public.audit_log` | 7 years active + 3 years cold | 6 years active + 4 years cold | FR: Code de commerce art. L.123-22. UK: Companies Act 2006 s.388. | Immutable, never anonymized on write. Sensitive-column masking applied on read per RBAC. | After 10 years total (cold archive). | `retention.audit_log.archive` + `retention.audit_log.purge` |
| `public.ai_events` | 90 days | 90 days | Operational and billing (no PII logged) | N/A (no PII, nothing to anonymize) | Monthly partition drop. | `retention.ai_events.drop_partition` |
| `public.notifications` | 90 days after read | 90 days after read | GDPR storage limitation (Art. 5(1)(e)) | N/A (payload is operational) | After 90 days. | `retention.notifications.sweep` |
| `public.portal_users` | 2 years after last login | 2 years after last login | GDPR storage limitation | Replace email and name with tokens. Keep client reference for invoice history. | After 2 years + 30-day grace. | `retention.portal_users.sweep` |
| `public.portal_sessions` | 30 days after expiry | 30 days after expiry | GDPR storage limitation | N/A (tokens are opaque) | After 30 days. | `retention.sessions.sweep` |
| `public.refresh_tokens` | Until revoked or 90 days idle | Until revoked or 90 days idle | Technical lifecycle | N/A | On revoke or 90-day idle. | `retention.refresh_tokens.sweep` |
| `public.auth_events` (authentication log) | 2 years | 2 years | FR: CNIL guidance. UK: ICO guidance 1-2 years. | Immutable while live. | After 2 years. | `retention.auth_events.sweep` |
| `tenant_<slug>.feedback` | 2 years | 2 years | Operational only | Anonymize submitter (user_id, email). | After 2 years. | `retention.feedback.sweep` |
| `tenant_<slug>.user_searches` | 90 days | 90 days | GDPR storage limitation | N/A (anonymized at write: tenant + query + latency, no user_id) | After 90 days. | `retention.user_searches.sweep` |
| `public.holidays` (system rows) | Indefinite | Indefinite | Operational (public holiday calendars) | N/A | Never (non-PII reference data) | None |
| `public.holidays` (tenant custom rows) | While tenant active | While tenant active | Operational | N/A | On tenant deletion | Cascade from tenant DROP |
| `public.tenant_custom_contracts` | 10 years after `contract_end` | 10 years after `contract_end` | FR: Code de commerce (Gamma as issuer, longest-law rule). | N/A (legal document) | After retention window. | `retention.custom_contracts.sweep` |

### 2.1 How to add an entity

Every new table added by a Phase 3+ feature MUST be added to this matrix in the same PR that creates the table. CI blocks merge if a new tenant-schema or public-schema table is created without a matching row here. The check lives in `backend/tests/retention_matrix_coverage.py` and runs against both Postgres catalogs and this Markdown file.

If a new entity has no PII and no financial relevance, its retention row may read "Indefinite" with legal basis "Operational reference data" and `None` for the enforcing job. The row still has to exist so the auditor knows it was considered.

---

## 3. Anonymization vs hard delete

Two distinct operations that must never be conflated.

### 3.1 Anonymization

**Definition.** Irreversibly scrub PII fields from a row while keeping the row itself, its ID, its foreign-key relationships, and its audit chain intact.

**When to use.** Any row that (a) participates in a legally-required audit trail (e.g., a timesheet entry that was invoiced) or (b) is the subject of a GDPR Article 17 erasure request but is still within its retention window.

**What to scrub.** Field-by-field, per entity, per the "Anonymization path" column in section 2. The rule of thumb: scrub anything that points to a natural person. Keep anything that describes the transaction.

**Common scrub patterns:**

| Field type | Scrubbed to |
|---|---|
| Email | `deleted-<uuid>@gammahr.invalid` |
| Full name | `Deleted User` |
| Phone | `null` |
| Postal address | `null` |
| Banking details | `null` (CMEK-encrypted; purged from KMS on the same sweep) |
| IP address | `null` |
| User-agent string | `null` |
| Free-text notes | `null` (if a free-text note exists it is treated as PII until proven otherwise) |
| FK to `employees.id` | Tokenized to `deleted_employee_<N>` where N is a per-tenant counter, preserving joins for aggregate reports |

**Irreversibility.** Anonymization is a one-way door. There is no unscrub. The operator console does not offer an undo. A mistake costs a PITR (see `docs/ROLLBACK_RUNBOOK.md` §4).

### 3.2 Hard delete

**Definition.** Row removal. The row no longer exists. Foreign keys referencing it are either cascaded, set to null, or the deletion is blocked depending on the FK `ON DELETE` rule.

**When to use.** Only after the retention window has fully expired AND the row is not on legal hold AND no outstanding GDPR DSR export references it.

**Never use hard delete for a GDPR Article 17 request if the retention window has not expired.** Anonymize instead. The audit row stays with the tokenized actor. This preserves the legal audit trail while fulfilling the subject's right to be forgotten.

**Cascade semantics.** Hard deletes that would orphan child rows (e.g., deleting a terminated employee that still has invoiced timesheets) are blocked at the sweep job level. The job logs a warning and moves on. The founder reviews blocked rows in the operator console weekly.

---

## 4. Legal holds

### 4.1 Placement

A row enters legal hold when any of the following triggers fire:

1. **Court order** served on Global Gamma Ltd or a Gamma founder.
2. **Regulator investigation notice** from CNIL (FR), ICO (UK), BfDI (Y2 DE), or equivalent.
3. **Lawsuit notification** from a counterparty or employee.
4. **Customer request** with a documented legal basis (e.g., the customer's own litigation).

The operator creates the hold via the operator console:

1. Target selection: entity type, ID range, tenant scope. Can be a single invoice, a set of employees, or a full tenant.
2. Reason: free-text legal justification, stored verbatim.
3. Supporting document: a PDF (court order, subpoena, regulator letter) uploaded to `gammahr-legal-archive/holds/<hold_id>.pdf`.
4. Sign-off: founder and co-founder both click "Confirm hold". A hold with one signature is rejected.

On confirmation the system:

- Sets `legal_hold = true` on every matching source row.
- Copies the data to `gammahr-legal-archive/` GCS bucket under a retention-locked path `holds/<hold_id>/<entity_type>/<entity_id>.json`.
- Writes an `audit_log` row `legal_hold.placed` with the hold_id, reason, and source documents.
- Surfaces a red badge on the tenant detail page in the operator console.

### 4.2 Enforcement

Every Celery retention job reads `legal_hold` as its first filter:

```python
def sweep(tenant_id, entity_type, retention_window):
    rows = query_expired_rows(tenant_id, entity_type, retention_window)
    held = [r for r in rows if r.legal_hold]
    not_held = [r for r in rows if not r.legal_hold]
    for r in held:
        log_skip_due_to_hold(r)
    for r in not_held:
        anonymize_or_delete(r)
```

Held rows are never touched by retention jobs. Held rows are also skipped by GDPR Article 17 erasure jobs; the subject receives a response citing the legal hold and its expected release date.

### 4.3 Release

Holds are released when the underlying reason is resolved:

1. Court ruling lifts the order.
2. Regulator closes the investigation.
3. Lawsuit settles.
4. Customer rescinds the request.

Release procedure:

1. Founder files a release request in the operator console with written justification.
2. Co-founder reviews and approves.
3. System clears `legal_hold = false` on every affected row.
4. Writes `audit_log` row `legal_hold.released` with release reason.
5. Normal retention resumes. Rows already past their window are swept on the next nightly cycle.

The archive bucket copy is retained per the tenant's standard retention, not deleted early. The archive is the immutable record of what was held and why.

### 4.4 Break-glass deletion of held data

Rare. Only when a court specifically orders deletion of held data. Procedure is in `docs/decisions/ADR-005-storage.md` section "Legal-hold break-glass": 2-hour cool-off, second-party approval, 15-minute time-bound personal GCP override, fully audited. Cross-reference `docs/ROLLBACK_RUNBOOK.md` §7 for the post-incident template applied to these rare events.

### 4.5 Quarterly drill

The founder runs a legal-hold drill on a staging tenant once per quarter. Steps: place a hold on a test invoice, attempt deletion via the retention job, verify the job skipped, release the hold, verify the row is swept on the next run. Log the drill result in `docs/incidents/drills/YYYY-Q<n>.md`. A failed drill blocks Phase 5 launch.

---

## 5. GDPR right of erasure (Article 17)

The data subject (an employee of a tenant, or a portal user) requests deletion of their personal data.

### 5.1 Procedure

1. **Request intake.** The tenant admin (controller) receives the request from their employee and forwards it via the operator DSR form in the admin console. Portal users request directly via `privacy@gammahr.com` (self-serve DSR form deferred per DEF-034).
2. **Identity verification.** The tenant admin verifies the subject is who they claim (photo ID match or work-email challenge). For portal users, the founder verifies via a matching-email challenge plus a second factor.
3. **Legal hold check.** The founder queries `legal_hold = true` across every table referencing the subject. If any row is held, the erasure for that row is deferred with a written explanation to the subject citing the legal hold and expected release date.
4. **Anonymization plan.** Backend enqueues `evaluate_erasure(tenant_id, subject_user_id)`. The job walks every entity and tags each as:
   - **Eligible now:** profile, avatar, feedback, non-financial notifications, search history, notification preferences.
   - **Anonymize in place (within retention window):** employee profile fields, timesheet entries, leave requests, expenses, approvals, invoice metadata the subject created.
   - **Legal hold:** row is flagged, skipped, explained in the response.
5. **Admin review.** The admin sees the proposed plan in the operator console: what will be anonymized, what cannot, why. Admin approves.
6. **Execution.** A single Celery job runs the plan in a transaction. Every anonymized row writes one `audit_log` entry with `event_type = 'dsr.erasure'` and `subject_user_id` set to the tokenized value. The audit trail stays intact; the actor is tokenized.
7. **Confirmation.** Admin sends a compliance response to the subject: "We have anonymized X rows, retained Y rows due to legal obligation Z (retention window ends YYYY-MM-DD), and deleted W files."
8. **SLA.** 30 days from request receipt. Complex requests extendable to 60 days under Art. 12(3), with a notice to the subject within the first 30 days.

### 5.2 Special cases

- **Tenant-level erasure (customer cancels).** At day 60 of the `suspended` lifecycle state, the tenant schema is dropped (`DROP SCHEMA tenant_<slug> CASCADE`). All per-tenant data is gone atomically. `public` tables referencing the tenant (subscription invoices, audit log) retain per the retention rules; the tenant name and metadata are replaced with tokenized placeholders.
- **Subject is still an active employee.** The request is forwarded to the tenant admin who is the actual controller. Gamma does not unilaterally anonymize active employment records.
- **Subject is deceased.** Next-of-kin request is honored if the admin has verified the relationship. The same Article 17 flow applies.

---

## 6. GDPR right of access (Article 15)

The data subject requests a copy of all their personal data held by Gamma.

### 6.1 Procedure

1. **Request intake.** Same channels as erasure (admin DSR form for tenant employees, `privacy@gammahr.com` for portal users).
2. **Identity verification.** Same as erasure.
3. **Export job.** Backend enqueues `generate_dsr_export(tenant_id, subject_user_id)`. The job iterates every table in section 2 that references the subject, plus `public.audit_log` entries where the subject is actor or subject. Results are packaged into a ZIP with one CSV per table, a JSON manifest describing schemas and column semantics, and a human-readable cover letter.
4. **Delivery.** Job uploads to GCS under `gammahr-prod-dsr-exports/<tenant_slug>/<export_id>.zip` with a 7-day signed URL. Admin receives the URL by email. Admin delivers to the subject via their secure channel (email, in-person, encrypted file share).
5. **SLA.** 30 days from request receipt. The Celery job itself typically completes in under 10 minutes for a typical user; the 30-day SLA accommodates identity verification and admin review.

### 6.2 Format

- **Structured data:** one `.csv` per table. Header row names the columns per `specs/DATA_ARCHITECTURE.md`. Encoding UTF-8, comma-separated.
- **Attachments:** expense receipts and other uploaded files are copied into the ZIP under `files/<entity_type>/<entity_id>/<filename>`.
- **Manifest:** `manifest.json` listing every CSV, its row count, the table's retention window, the legal basis for processing, and the generation timestamp.
- **Cover letter:** `README.txt` in plain English and French explaining what is in the bundle and how to read it.

Cross-reference `docs/COMPLIANCE.md` §3.1 for the full DSR export flow.

---

## 7. Celery enforcement schedule

### 7.1 Weekly retention sweep

The retention orchestrator runs **every Sunday at 02:00 UTC** via a Celery beat schedule. One orchestrator task per tenant. Tasks fan out in batches of 5 concurrent to stay within Cloud SQL connection limits.

For each tenant, the orchestrator walks the matrix in section 2 in this order:

1. `public.refresh_tokens`
2. `public.portal_sessions`
3. `public.auth_events`
4. `public.user_searches`
5. `public.notifications`
6. `public.feedback`
7. `public.portal_users`
8. `tenant_<slug>.timesheet_entries`
9. `tenant_<slug>.timesheet_weeks`
10. `tenant_<slug>.leave_requests`
11. `tenant_<slug>.expenses`
12. `tenant_<slug>.employees`
13. `tenant_<slug>.clients`
14. `tenant_<slug>.projects`
15. `tenant_<slug>.invoices` (tenant side)
16. `public.subscription_invoices`
17. `public.tenant_custom_contracts`
18. `public.audit_log` (archive + purge)

The order matters: child tables before parents to avoid FK violations. The job holds no row locks and commits after every batch of 1000 rows.

### 7.2 Idempotency

Every sweep is idempotent. Running it twice produces the same final state. The job reads the current row, compares against retention rules, and only acts on rows that are past their window AND not on legal hold AND not already anonymized (tracked via a `anonymized_at` timestamp column on every anonymization-eligible table).

### 7.3 Anomaly alarm

If a nightly run would anonymize or delete more than 10x the 7-day moving average of its own past runs, the job aborts, alerts ops@gammahr.com, and leaves a `retention.sweep.aborted` audit row. This catches bugs (e.g., a migration that reset `created_at` to `now()` and made every row look expired). The founder reviews and re-runs with `--override-anomaly` after confirming.

### 7.4 Daily GCS lifecycle

GCS buckets (`gammahr-prod-imports-raw`, `gammahr-prod-expense-receipts`, `gammahr-prod-subscription-invoices`) have object lifecycle rules applied by GCS itself, not Celery. These run daily at 03:00 UTC and are defined in `infra/gcp/gcs_lifecycle.yaml`. Celery jobs are only for Postgres rows.

### 7.5 Monthly partition drops

`public.ai_events` and `public.audit_log` are partitioned monthly. A Celery beat job on the first day of each month drops partitions older than the retention window (90 days for ai_events, 7 years for audit_log active storage).

### 7.6 Archive to GCS Cold Line

`public.audit_log` rows older than the active-storage window (7 years FR, 6 years UK) are exported to `gammahr-legal-archive/audit-cold/` in Parquet format via a nightly job, verified with SHA-256 checksums, then deleted from Postgres. Cold storage retention is then 3 additional years for FR (total 10) and 4 additional years for UK (total 10). After 10 years total, the cold archive entry is deleted.

---

## 8. Audit trail for retention actions

Every retention action writes exactly one `audit_log` row per affected entity:

- **`retention.anonymize`** - row state before and after, actor `system:retention_sweep:<tenant_id>`, entity reference, timestamp.
- **`retention.purge`** - row state before (last snapshot), actor same, entity reference, timestamp.
- **`retention.skip_due_to_hold`** - written once per row skipped, with `hold_id` reference.
- **`retention.sweep.aborted`** - written when the anomaly alarm fires. Includes the expected vs observed row count delta.
- **`dsr.erasure`** - written by GDPR Article 17 flows, separate from routine retention.
- **`dsr.export`** - written by GDPR Article 15 flows.
- **`legal_hold.placed` / `legal_hold.released`** - written by hold lifecycle.

The audit log for retention actions is itself retained **10 years** (French fiscal requirement, longest applicable). Retention audit rows are never themselves retention-swept; the sweep job skips `audit_log` entirely (audit_log has its own archive + purge path above).

---

## 9. Year 2+ country placeholders

The following jurisdictions are **not in scope for v1.0** and must not be relied on until the first customer in each jurisdiction signs AND a country playbook is filed in `docs/COUNTRY_PLAYBOOKS.md`.

| Country | Likely retention defaults (to be verified) | Legal basis to research | DEF |
|---|---|---|---|
| Germany | 10 years (§147 AO, §14b UStG) for financial records; employee records 3 years from termination per employment law | BDSG §31 for auth events (may require shorter) | DEF-071 |
| Canada (QC) | 7 years (Loi 25 + Quebec Civil Code art. 2925); federal PIPEDA non-specific | PIPEDA, Loi 25 | DEF-072 |
| Morocco | 10 years (Loi 09-08 + Code général des impôts) | Loi 09-08, CGI Morocco | DEF-073 |
| Niger | 10 years (Loi 2017-28 + WAEMU harmonized rules) | Loi 2017-28, WAEMU Uniform Act | DEF-074 |

None of the above are live. The Celery sweep job rejects any tenant with `legal_jurisdiction` not in `{'FR', 'GB'}` and raises a configuration error. Adding a country to the allowed set requires a PR against `backend/app/features/retention/jurisdictions.py` AND a corresponding row in section 2 with real legal citations, not placeholders.

Year 2 expansion procedure is documented in `docs/COUNTRY_PLAYBOOKS.md`.

---

## 10. Cross-references

- `docs/COMPLIANCE.md` §2 (retention table with full legal citations, reviewed by counsel)
- `docs/COMPLIANCE.md` §3 (GDPR DSR procedures, full process detail)
- `docs/COMPLIANCE.md` §8 (legal hold, break-glass)
- `docs/COMPLIANCE.md` §4 (audit log coverage and retention)
- `specs/DATA_ARCHITECTURE.md` §8.2 (retention summary, canonical source)
- `specs/DATA_ARCHITECTURE.md` §8.3 (DSR fulfillment in code)
- `specs/DATA_ARCHITECTURE.md` §7.4 (tenant lifecycle state machine, `DROP SCHEMA` path)
- `docs/decisions/ADR-005-storage.md` (CMEK, GCS lifecycle rules, legal-hold bucket)
- `docs/decisions/ADR-001-tenancy.md` (schema-per-tenant, `DROP SCHEMA` on deletion)
- `docs/BILLING_LIFECYCLE.md` §9 (subscription invoice retention)
- `docs/ROLLBACK_RUNBOOK.md` §5 (drift reconciliation, interacts with retention sweeps)
- `docs/COUNTRY_PLAYBOOKS.md` (year 2 country expansion procedure)
- `docs/DEFERRED_DECISIONS.md` DEF-034 (self-serve DSR form), DEF-071 to DEF-074 (year 2 retention rules)
