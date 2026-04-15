# Compliance

> **Who this is for.** The founder when a pilot customer's legal team asks "how do you handle X". Also the agent building GDPR flows. Also the auditor, some day.
> **Scope.** Retention, GDPR DSR procedures, audit trail coverage, invoice legal fields (FR + UK in v1.0; DE/CA/MA/NE deferred to year 2, see `docs/COUNTRY_PLAYBOOKS.md` and DEF-071 through DEF-074), data residency, subprocessors, breach notification.
> **Authoritative source.** This doc is the single source of truth for compliance claims. Every ADR that touches retention, storage, or audit references this doc and MUST match it. If the two disagree, this doc wins and the ADR gets a follow-up to fix.

Gamma is a data processor under GDPR. The tenant (the consulting firm) is the data controller. This doc specifies what the processor does and does not do. It is written in plain language so a non-lawyer founder can answer a legal review, and in precise enough language to survive a data protection audit.

Entries marked `[CHECK]` are founder-flagged for legal review before the first pilot signs. Every `[CHECK]` must be resolved before go-live.

---

## 1. Data residency

All customer data lives in the European Union at rest and in transit.

| Layer | Region | Notes |
|---|---|---|
| Cloud SQL (Postgres 16) | `europe-west9` (Paris) | Primary + HA replica in the same region |
| Cloud Storage (GCS) | `europe-west9` (Paris) | `gammahr-prod-files`, `gammahr-staging-files`, `gammahr-legal-archive` |
| Cloud Run workloads | `europe-west9` (Paris) | Backend, Celery workers, migration runner |
| Vertex AI Gemini inference | `europe-west1` (Belgium) | EU-resident endpoint. No data transits outside the EU. |
| Backup storage (logical dumps) | `europe-west4` (Amsterdam) | Cross-region redundancy, still EU. |
| Email delivery (Workspace SMTP Relay) | Google global (EU routing) | Transactional only. Recipient and content leave the tenant schema for delivery but not the EU. |
| Cloudflare edge | Cloudflare EU PoPs | Request metadata only. No content cached for authenticated routes. |
| CI (GitHub Actions) | GitHub EU runners where available | No production data in CI. Staging only. |

**No data leaves the EU.** The architecture makes it technically impossible to route production content to a non-EU region because Cloud Run and Cloud SQL are region-locked and Vertex AI is configured with the `europe-west1` endpoint explicitly. If a Google service proposes to move a workload out-of-region, the founder is notified 30 days in advance and the move is blocked until reviewed.

**Personal data of EU residents** is processed under GDPR. **Personal data of UK residents** is processed under UK GDPR and the Data Protection Act 2018 (the UK's post-Brexit equivalent).

**v1.0 serves FR and UK customers from `europe-west9` (Paris).** UK-GDPR adequacy with the EU was renewed in 2025, so cross-border EU-UK data transfer is lawful under the adequacy decision without SCCs. Year 2 expansion to Canada, Morocco, Niger, or other jurisdictions triggers new data-transfer impact assessments (DTIAs) filed before the first customer in that country signs. See `docs/COUNTRY_PLAYBOOKS.md` and DEF-071 through DEF-074.

---

## 2. Retention table

**How to read this table.** For each entity, the country columns show the mandatory minimum retention. The "Legal basis" column cites the law. The "Anonymization" column describes what we strip. The "Purge" column is the date the full row is deleted. Tenant-specific overrides (stored in `public.custom_contracts`) win over defaults. Financial-services customers frequently require 15-year retention; this is fine and supported.

**Year 1 markets are FR and UK only.** Year 2 retention defaults for CA, MA, NE, DE, and others will be added when the first customer in each jurisdiction signs. Current `[Y2]` cells are placeholders and must not be relied on before legal review at expansion time.

| Entity | FR default | UK default | Year 2 (DE/CA/MA/NE) | Legal basis (per country) | Anonymization path | Purge path |
|---|---|---|---|---|---|---|
| CSV import files (raw) | 30 days | 30 days | [Y2] | FR: none (operational only). UK: none. | N/A (file purged in full) | GCS lifecycle rule, daily |
| Expense receipts (attachments) | 10 years | 6 years | [Y2] | FR: CGI art. L.102 B LPF. UK: HMRC VAT Notice 700/21. | Remove employee name, keep amount + vendor + date + tenant_id | Celery nightly GDPR sweep |
| Invoices issued (customer-facing, PDF + row) | 10 years | 6 years | [Y2] | FR: Code de commerce art. L.123-22. UK: HMRC, 6 years after end of VAT period. | N/A (kept verbatim; removing data invalidates the legal document) | Celery nightly GDPR sweep after retention expiry |
| Subscription invoices (operator-side, ours to the tenant) | 10 years | 10 years | [Y2] | FR: Code de commerce art. L.123-22 applies to us as a French SAS. | N/A | Operator console purge on expiry |
| Timesheets | 5 years | 6 years | [Y2] | FR: Code du travail art. L.3171-3 (3 years) + paiement des salaires (5 years max). UK: Working Time Regulations 1998, 2 years; HMRC, 6 years. | Anonymize user: replace `employee_id` with `deleted_employee_N`, keep hours and project allocations | Celery nightly GDPR sweep |
| Leave requests | 5 years | 6 years | [Y2] | Same as timesheets (payroll tie-in). | Same as timesheets. | Celery nightly GDPR sweep |
| Approval records (approver + timestamp + decision) | 5 years | 6 years | [Y2] | FR: mirrors timesheet retention. UK: HMRC 6 years. | Replace approver user reference with `deleted_user_N`, keep decision + timestamp. | Celery nightly GDPR sweep |
| Audit log | 7 years active, 3 years cold | 6 years active, 4 years cold | [Y2] | FR: Code de commerce art. L.123-22. UK: Companies Act 2006 s.388, 6 years. | Immutable, not anonymized. Sensitive-column masking on read per RBAC. | After 10 years total, purged from cold archive |
| Employee PII (active) | Active + consent | Active + consent | [Y2] | Contract with employer is the legal basis (GDPR Art. 6(1)(b)). | N/A while active | Employee termination triggers transition to terminated row |
| Employee PII (terminated) | 5 years (end of employment contract) | 6 years (HMRC PAYE, 3 years + current) | [Y2] | FR: Code du travail, 5 years post-termination. UK: HMRC. | Replace name, email, phone, address, banking with hashed tokens. Keep `employee_id`, hire date, termination date, role, department (for workforce analytics aggregates). | Celery nightly GDPR sweep after retention expiry |
| Portal users (client-side login accounts) | 2 years after last login | 2 years after last login | [Y2] | GDPR Art. 5(1)(e) (storage limitation). Not financial. | Replace email + name with hashed tokens. Keep client reference for the invoice history. | Celery nightly GDPR sweep |
| Feedback submissions | 2 years | 2 years | [Y2] | Operational only, not financial or HR. | Anonymize submitter (email + user_id). | Celery nightly GDPR sweep |
| Search telemetry | 90 days | 90 days | [Y2] | GDPR storage limitation. | N/A (anonymized at write: tenant + query + latency, no user_id) | Celery nightly sweep |
| Session records | 30 days after expiry | 30 days after expiry | [Y2] | GDPR storage limitation + security investigation. | N/A (session tokens are already opaque) | Celery nightly sweep |
| Refresh tokens | Until revoked or 90 days idle | Until revoked or 90 days idle | [Y2] | Technical lifecycle. | N/A | Auth service on revoke |
| Authentication logs (login attempts, MFA events, password changes) | 2 years | 2 years | [Y2] | FR: CNIL guidance for auth logs, 2 years. UK: ICO guidance 1-2 years. | Immutable, not anonymized while live. | After 2 years, purged. |
| Kill-switch event logs | 2 years | 2 years | [Y2] | Operational and audit. | N/A (actor is operator, not tenant user). | After 2 years, purged. |
| AI prompt meter logs (costs only, no PII) | 90 days | 90 days | [Y2] | Operational and billing. | N/A (no PII logged; see section 7) | Monthly partition drop |
| Avatars | Until user explicit delete | Until user explicit delete | [Y2] | Consent. | N/A (file purge on delete) | User account settings |
| Client records | Retained until contract ends + 10 years | Retained until contract ends + 6 years | [Y2] | FR: Code de commerce. UK: HMRC. | Tokenize contact names + emails post-retention. Keep company legal name, VAT ID, invoice history. | Celery nightly sweep |
| Project records | Same as client | Same as client | [Y2] | Same as client (tied to invoiced work). | Same as client. | Celery nightly sweep |

`[CHECK]` FR timesheet retention is either 3 years (Code du travail art. L.3171-3) or 5 years (paiement des salaires). Using 5 years as the safe upper bound. Confirm with the first pilot's labour counsel.
`[CHECK]` UK employee PII retention blends HMRC (3 years + current tax year) and broader employment law. Using 6 years as the conservative upper bound. Confirm with the first UK pilot.
`[Y2]` DE §147 AO (10 years), CA PIPEDA + Quebec Law 25, MA Loi 09-08, NE Loi 2017-28 retention defaults are deferred until the first customer in each jurisdiction signs. See `docs/DEFERRED_DECISIONS.md` DEF-071 through DEF-074 and `docs/COUNTRY_PLAYBOOKS.md`.

**Custom contracts override defaults.** A financial-services customer (e.g., HSBC UK) may require 15 years for everything. The override is a row in `public.custom_contracts(tenant_id, entity_type, retention_years)`, applied at sweep time via a lookup that always picks `MAX(default, contract)`.

**The GDPR sweep job** runs nightly per-schema per-entity. It identifies rows older than retention, anonymizes or purges per the entity's contract, and writes to `audit_log` with event type `retention.purge` or `retention.anonymize`. The job is idempotent: re-running it is safe.

---

## 3. GDPR Data Subject Requests (DSR)

A data subject is a natural person whose personal data we process. In Gamma, data subjects are: employees (tenant users), portal users (client-side users), and occasionally client contact persons stored in the `clients` table. The tenant admin receives DSRs from their employees and forwards them to us; we fulfil them through the admin's operator portal. For portal users, requests come to us directly.

### 3.1 Right of access (Article 15)

The data subject has the right to receive all their personal data we hold, plus metadata about processing (purpose, retention, recipients).

**Procedure:**
1. Tenant admin (or data subject directly, if portal user) opens the DSR form in the admin console.
2. Admin verifies identity: photo ID cross-check, or matching work email confirmation.
3. Admin submits the request. Backend enqueues a Celery job `generate_dsr_export(tenant_id, subject_user_id)`.
4. Job iterates every table in the tenant schema that references the subject, plus `public.audit_log` entries where the subject is actor or subject. Packages results into a ZIP with per-table CSV files + a JSON manifest.
5. Job uploads ZIP to GCS in a temporary bucket with a 7-day signed URL.
6. Job notifies the admin by email with the signed URL.
7. Admin delivers to the data subject via their secure channel.

**Endpoint:** `POST /api/v1/admin/dsr/export`, returns a job_id. `GET /api/v1/admin/dsr/export/{job_id}` to poll status.

**Format:** ZIP containing one CSV per table (`employees.csv`, `timesheet_entries.csv`, `expenses.csv`, ...) plus `manifest.json` describing schemas, column semantics, retention, and the generation timestamp.

**SLA:** 30 days from request to delivery. Celery job completes in under 10 minutes for a typical user; the 30-day SLA accommodates identity verification.

### 3.2 Right to erasure (Article 17)

The "right to be forgotten". The data subject asks us to delete their data. We must delete unless a legal obligation forces us to retain.

**Procedure:**
1. Tenant admin (or portal user) submits an erasure request in the admin console.
2. Admin verifies identity (same as 3.1).
3. Backend enqueues `evaluate_erasure(tenant_id, subject_user_id)`.
4. Job walks every entity referencing the subject and tags each as:
   - **Eligible** (can be anonymized now): profile fields, avatars, feedback submissions, non-financial audit entries.
   - **Legal hold** (cannot be deleted): invoices, timesheets within retention, expense receipts within retention, audit log within retention.
   - **Partial** (anonymize the subject's identity but retain the row): approval records (keep decision, anonymize approver name).
5. Job produces a "proposed plan": what will be anonymized, what cannot be. Admin reviews and approves.
6. On approval, job executes: eligible rows are anonymized or deleted; partial rows are anonymized in place; legal-hold rows are flagged but untouched. A single transaction writes to `audit_log` with event `dsr.erasure`.
7. Admin sends a compliance response to the data subject: "We have deleted X, anonymized Y, and retained Z because of legal obligation A (retention Y years)."

**SLA:** 30 days. Complex requests (financial-services customers with 15-year holds) may take 60 days under Art. 12(3).

**Full tenant erasure** (the customer cancels): at day 60 of the suspended-account lifecycle (per ADR-001), we run `DROP SCHEMA tenant_<slug> CASCADE`. All per-tenant data is atomically gone. `public` tables referencing the tenant (invoices, audit log) retain per retention rules; tenant name and metadata are replaced with tokenized placeholders.

### 3.3 Right to rectification (Article 16)

User self-service for most fields: name, email, phone, address, language preferences, notification settings. Admin-mediated for locked fields: employee ID, hire date, termination date (these feed payroll and have audit consequences).

For audit-log corrections: the audit log is immutable. If a row is factually wrong, the correction is a new audit row with event type `rectification` that references the original. Original row is never modified or deleted.

**SLA:** immediate for self-service; 30 days for admin-mediated.

### 3.4 Right to portability (Article 20)

The data subject has the right to receive their personal data in a structured, commonly used, machine-readable format.

**Procedure:** same as 3.1, but the format is explicitly CSV + JSON (machine-readable) and scoped to data the subject "provided" (under Art. 20 the obligation is narrower than Art. 15).

**Scope:** timesheets, expenses, leaves, approvals they submitted, profile fields. Not audit log entries, not aggregates, not data generated by the system about them (e.g., capacity calculations).

### 3.5 Right to object (Article 21)

Object to a specific processing purpose. In Gamma, the relevant purposes are:

- **Notifications.** User-facing flag in account settings: per-channel, per-category (e.g., "do not email me approval reminders"). Honored immediately.
- **AI insights dashboard.** Tenant-level flag in admin settings: the dashboard insight card generator can be disabled. No AI processing of the tenant's data beyond what the user explicitly invokes (command palette, OCR).
- **Marketing.** We do not do marketing emails from the tenant data. N/A.

### 3.6 Timeframes and DPO notification

- **Standard:** 30 days from receipt of the request.
- **Complex:** 60 days for requests requiring coordination across multiple legal holds. Must notify the data subject of the extension within the first 30 days.
- **DPO notification:** the founder (DPO) is notified via Slack webhook on every DSR submission. For erasure requests against the first pilot's data, the founder is notified by email and phone.
- **Customer notification:** the tenant admin receives a weekly summary of DSR requests fulfilled and pending.

---

## 4. Audit trail coverage

Every mutation in the system writes exactly one `audit_log` row. The audit log is the compliance backbone: it provides non-repudiation for contract-relevant actions (invoice issue, expense approval, timesheet submission) and evidence for breach investigation.

### 4.1 What is logged

Row schema (simplified, full schema in `specs/DATA_ARCHITECTURE.md` section 2.9):

```
tenant_id           (the tenant schema)
actor_type          ('user' | 'system' | 'operator')
actor_id            (uuid of the actor)
on_behalf_of_user_id    (set when an operator is impersonating, nullable)
on_behalf_of_tenant_id  (set on cross-tenant operator actions, nullable)
entity_type         ('employee', 'invoice', 'expense', ...)
entity_id           (uuid)
event_type          ('create' | 'update' | 'delete' | 'approve' | 'reject' | 'login' | ...)
before_json         (nullable; the row before the change, or null on create)
after_json          (nullable; the row after the change, or null on delete)
created_at          (timestamptz, server clock)
ip_address          (from request headers)
user_agent          (from request headers)
```

### 4.2 Coverage requirements

- **Every route that mutates data** goes through a decorator that writes the audit row. Routes without the decorator fail a CI lint check.
- **Background jobs** (Celery tasks) that mutate also write audit rows with `actor_type = 'system'` and `actor_id = '<job_name>:<task_id>'`.
- **Operator actions** on a tenant (impersonation, manual intervention) write with `actor_type = 'operator'` and always set `on_behalf_of_*` fields.

### 4.3 Immutability

- The `audit_log` table has no UPDATE or DELETE triggers. A database trigger `prevent_audit_log_mutation` raises an exception on any UPDATE or DELETE attempt.
- The `migrator` role cannot alter the trigger (it is owned by `gammahr_audit_owner`, a separate role).
- Re-reading is unrestricted; RBAC filters by tenant scope + user role.

### 4.4 Retention

- **Active storage:** 7 years in Postgres (per FR Code de commerce art. L.123-22 plus a buffer for payroll-linked audit entries).
- **Cold archive:** years 8-10 in GCS Cold Line, written by a nightly archive job that exports to Parquet, verifies checksums, then deletes from Postgres.
- **Hard purge:** after 10 years total, the cold archive entry is deleted.

### 4.5 Queries

- **DSR:** the DSR export endpoint filters audit log by `actor_id = subject OR entity references subject`.
- **Breach investigation:** operator console has a read-only audit log search by tenant, entity, time range.
- **Customer admin:** tenant admins can query their own audit log via the audit page, filtered by RBAC.
- **Cross-tenant:** forbidden except via operator actions, which themselves are audited.

---

## 5. Invoice legal fields

Invoices are regulated documents. Every issued invoice must carry the fields required by the recipient's country (for EU B2B, the issuer's and the recipient's country both matter). Cross-reference `docs/decisions/ADR-006-pdf.md` and `specs/DATA_ARCHITECTURE.md` section 2.11.

### 5.1 France

- Sequential numbering: gapless, ascending, per issuer entity. Void invoices keep their number; a new replacement invoice gets a new number and cites the void.
- Issuer VAT ID on every invoice if issuer is VAT-registered.
- Recipient VAT ID for B2B within the EU (intracommunity VAT reverse charge).
- Specific mentions:
  - "TVA non applicable, art. 293 B du CGI" if issuer is on franchise en base.
  - "Autoliquidation" if the reverse-charge mechanism applies.
  - Penalty mention for late payment (Code de commerce art. L.441-10).
  - Fixed recovery fee for late payment (40 EUR minimum per Décret 2012-1115).
- Issue date, delivery date (if different), due date.
- Invoice number, SIRET of issuer, RCS registration, share capital.
- Description of goods or services, unit price, quantity, subtotal, VAT rate, VAT amount, total TTC.
- PDF/A-1b required for invoices >= 5,000 EUR under French DGFIP archival rules. Gamma renders all invoices as PDF/A-1b via WeasyPrint regardless of amount (simpler; no per-invoice branching).
- Retention: 10 years (Code de commerce L.123-22).

### 5.2 United Kingdom

- VAT number if VAT-registered.
- Invoice number (sequential, unique).
- Issue date and time of supply.
- Issuer name, address, and (if VAT-registered) VAT registration number.
- Recipient name and address.
- Description of goods or services.
- Unit price (excluding VAT), quantity, subtotal, VAT rate, VAT amount, total inc VAT.
- Simplified invoice rules for totals under 250 GBP (fewer mandatory fields). Gamma renders the full format for all invoices for simplicity.
- Currency: GBP for UK customers. Multi-currency is supported per `specs/DATA_ARCHITECTURE.md` (HSBC UK is billed in GBP day one).
- Retention: 6 years (HMRC VAT Notice 700/21) from the end of the VAT period.

### 5.3 Germany

- Sequential numbering (§14 UStG) gapless and unique.
- Issuer full name and address.
- Issuer tax number (Steuernummer) or VAT ID (USt-IdNr).
- Recipient full name and address.
- Recipient VAT ID for B2B within the EU.
- Issue date, date of supply.
- Quantity, description, net amount, VAT rate, VAT amount, gross total.
- If a reduced-rate or exemption applies, a textual reference to the law (e.g., "§4 Nr. 1 UStG").
- Retention: 10 years (§147 AO, §14b UStG).

### 5.4 Voided invoices

Voiding an invoice does not delete the number. The void invoice stays in the database and in the PDF archive with `status = 'voided'`. A replacement invoice (if applicable) receives a new number and the `parent_invoice_id` field references the void. The audit log captures the void event with actor, reason, and timestamp.

### 5.5 E-invoicing URNs (deferred)

EU Directive 2014/55/EU (Peppol BIS Billing 3.0) and national mandates (e.g., France's Factur-X, Italy's FatturaPA, Germany's XRechnung for B2G) are not in v1.0. Deferred per DEF entry in `docs/DEFERRED_DECISIONS.md`. Trigger to revisit: first customer requires Peppol or national e-invoicing portal integration.

---

## 6. Authentication and security logs

**What is logged:**
- Login attempts: success + fail, with IP, user agent, MFA state, timestamp, tenant scope.
- Password changes: who changed (self vs admin-initiated reset), when, from where.
- MFA events: enrolment, disablement, recovery code use, challenge success, challenge fail.
- Session issuance: new JWT issued, refresh token issued, device fingerprint (if available).
- Session invalidation: logout, token revocation, admin-initiated kick.
- Operator impersonation sessions: start, end, scope of impersonation, reason string provided by operator.

**Where it lives:** a dedicated `public.auth_events` table, schema includes `tenant_id, user_id, event_type, ip, user_agent, success, details_json, created_at`.

**Retention:** 2 years (CNIL guidance and ICO guidance). After 2 years, rows are deleted by the nightly sweep. `[CHECK]` DE §31 BDSG may require shorter retention for some auth events; confirm with first DE pilot.

**Who can query:**
- Tenant admin: their own tenant's auth events, read-only.
- Operator: any tenant's auth events for breach investigation, read-only, logged as an operator action in `audit_log`.
- User: their own auth events via the account security page.

**Use cases:**
- Breach investigation ("who logged in as X between time A and B?")
- Compliance audit ("show all password changes in the last year")
- User dispute resolution ("I did not log in at 3am")
- Anomaly detection (repeated failures, impossible travel)

---

## 7. AI prompt logs (cost and safety)

Vertex AI Gemini calls are metered for cost and safety monitoring. To avoid a PII liability, **we do not log prompt or response content.**

**What is logged** (in `public.ai_events`):
- `tenant_id, user_id` (who invoked)
- `feature` (e.g., `command_palette`, `ocr_expense`, `insight_card`)
- `prompt_version` (the filename hash of the Jinja template used)
- `tool_name` (which feature tool was invoked by the router)
- `model_id` (e.g., `gemini-2.5-flash`)
- `input_token_count, output_token_count`
- `latency_ms`
- `cost_eur` (derived from token counts)
- `status` (`success`, `error`, `budget_blocked`, `kill_switch_blocked`)
- `error_class` (if status != success)
- `request_id` (opaque, for correlation with Cloud Run trace)
- `created_at`

**What is NOT logged:**
- The prompt text itself (could contain PII from user entries: employee names, client company names, financial data).
- The response text.
- The tool arguments (could contain filtered-but-retrievable PII; e.g., a tool call to `search_employees(name='Alice Doe')`).

This gives observability and billing without a PII liability. Prompt text is transient: it exists only in the HTTP request to Vertex AI and is discarded after the response.

**Retention:** 90 days. Partitioned monthly; old partitions dropped.

**Access:** tenant admin reads their own tenant's usage; operator reads global aggregate. Audit entries for `ai_events` writes are not created (too noisy), but budget alerts, kill-switch events, and errors do trigger `audit_log` entries.

---

## 8. Legal hold

When a lawsuit, regulatory investigation, or customer request places a hold on specific data, the named records are moved (or flagged) into a retention-locked bucket where they cannot be deleted even by service accounts.

**Placement:**
- Request source: court order, regulator (CNIL, ICO, BfDI), customer request with legal basis.
- Founder files a hold request via the operator console (to be built Phase 2): target (entity type + id range + tenant), reason, supporting documents.
- System copies the targeted data to `gammahr-legal-archive` GCS bucket (retention policy lock) and sets a `legal_hold = true` flag on the source row.
- The GDPR sweep job skips any row with `legal_hold = true`.

**Break-glass deletion:**
- The archive bucket has no delete permission, even for service accounts.
- In the rare event of a justified deletion (e.g., the court releases the hold and a DSR is pending), the procedure is in ADR-005 section "Legal-hold break-glass": 2-hour cool-off, second-party approval, 15-minute time-bound personal GCP override, all logged.
- The full runbook lives in `docs/LEGAL_HOLD_RUNBOOK.md` (Phase 2 deliverable).

**Release:**
- When the hold ends (court ruling, investigation closed), the founder files a release via operator console.
- The `legal_hold = false` flag is cleared.
- Normal retention resumes.
- The archive bucket copy is kept per the tenant's standard retention, not deleted early.

**Quarterly drill:** the founder runs a legal-hold drill on a staging tenant (place hold, attempt deletion, verify blocked, release hold). Logged in `docs/incidents/drills/YYYY-Q<n>.md`.

---

## 9. Incident reporting

GDPR Article 33 requires the controller to notify the supervisory authority within **72 hours** of becoming aware of a personal data breach. As a processor, Gamma must notify the controller (tenant admin) without undue delay, which practically means within hours.

**Authorities by tenant location:**
- France: CNIL (https://www.cnil.fr)
- United Kingdom: ICO (https://ico.org.uk)
- Germany: BfDI plus the relevant Landesbeauftragte for the federal state

**Process:**
1. **Detect.** A breach can be: unauthorized access, unauthorized disclosure, loss of data (e.g., irreversible corruption), accidental deletion. Detection comes from: intrusion detection alerts, audit log anomaly detection, customer report, employee report, third-party report (security researcher).
2. **Contain.** Stop the active breach. Examples: revoke compromised credentials, rotate API keys, pull down the leaking endpoint, pause the vulnerable Celery task.
3. **Assess scope.** Which tenants, which users, which data categories, how many records, what is the severity. Write these down. Timestamp every finding. Assume you will testify to them.
4. **Notify DPO.** The founder is always the first to know.
5. **Notify affected customers.** Email tenant admins with: what happened, what data was affected, what they should do, who to contact.
6. **Notify authority.** Within 72 hours. The notification includes: nature of the breach, categories and approximate number of data subjects, categories and approximate number of records, name and contact of DPO, likely consequences, measures taken.
7. **Notify affected data subjects.** If the breach is likely to result in a high risk to their rights and freedoms (Art. 34). Not every breach requires this; consult the pilot's DPA.
8. **Document.** Every breach (reportable or not) is logged in `docs/incidents/` per the post-incident template.

**72-hour clock** starts when we become aware of the breach with sufficient confidence. "Aware" means confirmed, not suspected. Document carefully when the clock started and why.

---

## 10. DPO and responsibility

- **Data Protection Officer:** the founder is the designated DPO during Phase 2-5. Contact: founder@gammahr.com.
- **DPA:** every pilot signing requires a Data Processing Agreement per GDPR Article 28. A template DPA is stored at `docs/legal/DPA_TEMPLATE.md` (to be drafted before the first pilot).
- **Sub-processor consent:** the DPA grants general authorization for the sub-processors listed in section 11, with 30-day prior notice of any changes.
- **Appointment of a formal DPO:** `[CHECK]` Formal DPO appointment (external or dedicated staff) is required under GDPR Art. 37 when the core activities consist of regular and systematic monitoring of data subjects on a large scale. For a processor with <10 customers and <5,000 users, this is likely not yet triggered. Confirm before second pilot.
- **Supervisory authority of record:** CNIL (because the controller of the service is a French SAS). This does not change even if pilots are in the UK or Germany; tenant-local supervisory authorities are relevant for tenants' own controller obligations.

---

## 11. Third-party subprocessors

Every third-party service that processes customer data is a subprocessor. The DPA signed with each tenant lists them. Changes are announced 30 days in advance with an opt-out clause.

| Subprocessor | Role | Data scope | DPA in place | Region |
|---|---|---|---|---|
| Google Cloud Platform | Hosting, Cloud SQL, GCS, Vertex AI Gemini, Workspace SMTP Relay | All customer data (hosted) + transactional email content | Yes (Google Cloud DPA, SCCs where needed) | EU only |
| Cloudflare | Edge, DNS, WAF, Access, status page | Request metadata, IPs, headers. No content cached for authenticated routes. | Yes (Cloudflare Customer DPA) | EU PoPs |
| GitHub | Source code, CI | No customer data. Code and staging fixtures only. | Yes (GitHub DPA) | EU runners |
| Google Workspace SMTP Relay | Transactional email delivery | Recipient emails + email content (subject, body) | Yes (part of Google Workspace DPA) | EU routing |
| Stripe or Revolut (Phase 5+) | Subscription billing payments | Billing contact + payment method. No HR data. | To sign before Phase 5 | EU |

`[CHECK]` Stripe vs Revolut decision for subscription billing is not made. Revolut is a French IBAN and matches the company bank; Stripe has better developer tooling and a mature DPA. Decide before Phase 5 and update this table.

**Announcement channel:** any change to this list is announced 30 days in advance via: (1) email to every tenant admin, (2) the operator status page, (3) a banner in the admin console of affected tenants. Tenants may object within the 30-day window.

**Sub-sub-processors:** Google and Cloudflare have their own sub-processors. These are disclosed in their respective DPAs and inherited through the chain.

---

## 12. Cross-references

- `docs/decisions/ADR-001-tenancy.md` - schema-per-tenant isolation, tenant deletion procedure
- `docs/decisions/ADR-005-storage.md` - GCS retention rules, legal-hold bucket, CMEK
- `docs/decisions/ADR-006-pdf.md` - invoice rendering, PDF/A-1b, sequential numbering
- `specs/DATA_ARCHITECTURE.md` sections 2.5, 2.9, 2.11, 8.1, 8.2, 10, 11
- `specs/AI_FEATURES.md` section 7 (AI budget, cost enforcement) and section 8 (privacy of prompt data)
- `docs/DEGRADED_MODE.md` - kill switches including AI disable
- `docs/ROLLBACK_RUNBOOK.md` section 7 (post-incident template)
- `docs/LEGAL_HOLD_RUNBOOK.md` (Phase 2 deliverable)
- `docs/legal/DPA_TEMPLATE.md` (Phase 2 deliverable)
