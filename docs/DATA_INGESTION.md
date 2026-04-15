# Data Ingestion

> How customer data gets INTO Gamma: bulk onboarding, ongoing imports, single-entity creation, and the reverse path (payroll export).
> Addresses a gap the founder identified after the data-architecture planning session: "I don't see anything on how the client's data is uploaded to the app."
> Cross-references: `specs/DATA_ARCHITECTURE.md` section 2 and 10, `specs/APP_BLUEPRINT.md` section 1.8, `docs/DEFERRED_DECISIONS.md` DEF-010, DEF-011, DEF-024, DEF-060.

---

## 1. What this document covers

Everything about getting data INTO the app for a new or existing tenant, plus the one reverse direction (payroll CSV export) that v1.0 supports. Four ingestion paths:

| Path | When | Entry point | Scope |
|---|---|---|---|
| Bulk onboarding import | Once, when a tenant first signs up | Onboarding wizard (`/onboarding`, APP_BLUEPRINT 1.8) | Employees, clients, projects, optionally historical timesheets |
| Ongoing CSV imports | Continuously, as the business evolves | Admin console import page | Employees (batch), clients (batch), projects (batch) |
| Manual single-entity creation | Continuously, for individual additions | Feature pages (Add Employee, Add Client, etc.) | One entity at a time |
| OCR receipt ingestion | Per expense | Expenses page, mobile camera | One expense at a time via Gemini vision |

Plus one reverse-direction:

| Path | When | Entry point | Scope |
|---|---|---|---|
| Payroll CSV export | Monthly, per tenant | Admin → Integrations page | One-way export of approved timesheets + leave balances + expense reimbursements, matching payroll provider format |

External HRIS sync (Workday, Personio, BambooHR, Rippling auto-sync) is **not** in v1.0. See DEF-060.

---

## 2. Bulk onboarding import (the first-day story)

This is the single most important data-entry moment in Gamma's life. The canonical first customer (per `specs/DATA_ARCHITECTURE.md` section 12.10) is a consulting firm with 201 employees, 120 clients, 260 projects, and one year of historical timesheets (52 weeks). They need to be up and running within an hour.

### 2.1 Pipeline overview

```
1. Upload CSV file(s) via drag-drop
2. Backend streams file to GCS (via presigned URL, 20 MB limit per file)
3. Backend parses headers + first 5 data rows, returns a preview
4. AI column mapper (Gemini tool call) suggests header→schema mapping
5. User reviews, corrects, and confirms the mapping
6. Backend validates all rows, produces an error report
7. User reviews preview: "187 rows ready, 13 rows have errors"
8. User clicks "Import" to commit, or downloads error CSV to fix
9. Celery job runs the import in batches of 500 rows per transaction
10. Progress streamed to the UI via WebSocket (on `/ws/notifications`) OR SSE job stream
11. Final report: N imported, M failed, download links for (a) error CSV and (b) audit log of what was created
```

This diagram is the golden path. Error branches: validation errors -> user downloads error CSV, fixes, re-uploads; Celery crash -> import resumes from the last committed batch; user cancellation mid-import -> in-flight batches complete, later batches skipped, report shows partial result.

### 2.2 Supported CSV entity types

In order of import dependency (some entities reference others, so import in this order):

| Order | Entity | CSV columns (required *) | Dependencies |
|---|---|---|---|
| 1 | **employees** | `first_name*`, `last_name*`, `email*`, `employment_type*`, `role_title`, `manager_email`, `team_name`, `country_code`, `start_date`, `hours_per_day`, `is_billable` | None |
| 2 | **teams** | `name*`, `lead_email`, `description` | Employees (for lead reference) |
| 3 | **clients** | `name*`, `legal_name`, `vat_number`, `vat_reverse_charge`, `industry`, `country_code`, `billing_email`, `account_manager_email` | Employees (for account manager reference) |
| 4 | **client_contacts** | `client_name*`, `first_name*`, `last_name*`, `email*`, `role`, `is_primary` | Clients |
| 5 | **projects** | `client_name*`, `name*`, `code*`, `start_date*`, `billing_type*`, `budget_amount_cents`, `fixed_amount_cents`, `project_manager_email` | Clients, Employees |
| 6 | **project_allocations** | `project_code*`, `employee_email*`, `valid_from*`, `valid_to`, `allocation_pct*` | Projects, Employees |
| 7 | **employee_rates** (optional) | `employee_email*`, `daily_rate*`, `currency*`, `valid_from*`, `valid_to` | Employees |
| 8 | **project_rates** (optional) | `project_code*`, `employee_email*`, `daily_rate*`, `currency*`, `valid_from*`, `valid_to` | Projects, Employees |
| 9 | **historical_timesheets** (optional) | `employee_email*`, `work_date*`, `project_code*`, `duration_minutes*`, `description` | Everything above |

**Not imported in bulk:** leaves, expenses, invoices. These are prospective-only in v1.0; historical leaves, expenses, and invoices remain in the customer's prior system for audit purposes. Adding historical imports for these is deferred (see DEF-061 in section 8).

### 2.3 AI column mapping (the Gemini tool call)

The column mapper is one of the locked AI tools (`onboarding_column_mapper` or similar, registered via `backend/app/features/imports/ai_tools.py`). It:

1. Receives the CSV headers (e.g., `Employee ID, Name, Email Address, Job Title, Start Date`)
2. Receives the target schema for the entity type being imported
3. Returns a mapping dictionary: `{"Email Address": "email", "Job Title": "role_title", ...}` with confidence scores
4. Also returns a `warnings` list for headers it can't confidently map or schema fields that appear missing
5. Output validated against a Pydantic schema before use

Cost: roughly €0.001 per call (one call per CSV upload, tiny footprint). Runs through the same `ai/client.py` budget enforcement and kill-switch gates as every other AI call.

**Fallback:** the UI always shows a manual column mapper that the user can override. If the AI kill switch is active, manual is the default.

### 2.4 Validation pipeline

Before any row is written:

1. **Schema validation** via Pydantic: types, required fields, enum values
2. **Business rules:** dates are dates, emails are valid, employment_type is in the enum, country_code is ISO 3166-1
3. **Cross-entity references:** if a CSV mentions `manager_email`, that email must match an already-imported employee (from an earlier CSV in the same import session)
4. **Dedupe within CSV:** one row per email for employees, one row per (client_name, project_code) for projects, etc.
5. **Dedupe against existing tenant data:** if the email already exists in `employees` for this tenant, skip and mark as "already exists" in the report (not an error, just a no-op)

Errors are collected into a per-row diagnostics list. The user sees:
- `ERROR` rows: cannot import, flagged with reason and row number
- `WARNING` rows: will import but something unusual (e.g., unknown manager_email, fallback to no manager)
- `SKIP` rows: already exist, no action taken

**Timesheet-specific validations.** For `historical_timesheets` imports:
- `work_date` must be in the past and >= the employee's `start_date`
- No duplicate `(employee_email, work_date, project_code)` rows within one import file
- Daily total per employee: warning if > 8 h, error if > 12 h
- Project code must match an existing project (or be mapped to 'unknown' with a warning)

### 2.5 Idempotency

Every import session has an `import_id` UUID. The operation writes to `public.idempotency_keys` with TTL 24h. Re-uploading the same CSV with the same `import_id` is a no-op (replay returns the cached result). Different `import_id`, same content = the dedupe-against-existing logic skips existing rows transparently.

**Duplicate-file detection.** On upload, the server computes SHA256 of the raw CSV bytes and checks `imports.file_hash` for any import from the same user in the last 24 hours. On match, the UI offers two paths: (a) replay the cached result (show the original validation report), or (b) start a fresh import (new `import_id`, dedup against existing data still applies row-wise). A banner tells the user "This file matches [import from 2 hours ago]."

### 2.6 Progress streaming

Two transports, user's choice based on how the import is triggered:

- **WebSocket** via the existing `/ws/notifications` channel: import progress events fire as `notification.kind = 'import_progress'` with `payload.percent` and `payload.current_row`. The UI auto-updates the progress bar and toast.
- **SSE** via `/api/v1/jobs/{import_id}/stream`: cleaner for one-off imports, browser shows a determinate progress bar directly from the stream.

Phase 2 ships with WebSocket only (reuses the notifications channel). SSE for imports can be added in Phase 4 if the WebSocket approach is noisy.

### 2.7 Performance targets (goals, not baselines)

| Tenant size | Target time |
|---|---|
| **Canonical seed:** 201 employees + 120 clients + 260 projects + 52 weeks of timesheets + 700 leaves + ~8,400 expenses + 900 invoices | Under 60 seconds end-to-end |
| 1,000 employees + 500 clients + 1,000 projects + 100k timesheet rows | Under 5 minutes |
| 5,000 employees + 2,000 clients + 5,000 projects + 500k timesheet rows | Under 15 minutes |

The canonical-seed target is the **first-customer must-have** from `docs/SCOPE.md`. The numbers match `specs/DATA_ARCHITECTURE.md` section 12.10 exactly. If this is not hit reliably, the first pilot fails.

### 2.8 Error recovery

**Partial success is allowed and the default.** If 187 out of 200 rows succeed, the 187 are committed (in batches), the 13 errors are reported, and the user downloads an error CSV to fix and re-upload. On re-upload, the dedupe-against-existing logic means the 187 already-imported rows are skipped automatically.

**Transaction boundary:** each batch of 500 rows is one transaction. A single bad row does NOT roll back the whole batch; only that row's insert fails and it's moved to the error report. This uses `ON CONFLICT DO NOTHING` + per-row savepoints.

**Total failure recovery:** if the Celery worker crashes mid-import, the worker's checkpoint is in `public.alembic_backfills`-equivalent `public.import_checkpoints(import_id, last_processed_row, status)`, and the import is resumable from the last checkpoint.

---

## 3. Ongoing CSV imports (the day-to-day story)

After the initial onboarding, customers continue to add data in bulk occasionally:

- A new cohort of interns joins in September: import 20 employees at once
- A sales team closes 10 new clients in a quarter: import 10 clients at once
- A new project wave starts: import 50 projects with their allocations

### 3.1 Entry point

Admin console page `/admin/imports` (new page in the (app) route group, slot under section 9.1 of APP_BLUEPRINT.md as a subsection). Tenant admin clicks "New Import", picks an entity type, drops a CSV, goes through the same pipeline as onboarding.

### 3.2 Differences from onboarding

- **Scope:** one entity type per import (onboarding supports multi-file). Employees or clients or projects, not a bundle.
- **No wizard chrome:** the onboarding wizard has a "welcome to Gamma" framing; the ongoing import page is a utilitarian admin tool.
- **Same pipeline:** same AI column mapper, same validation, same Celery runner, same progress UI. Code is 100% shared; the onboarding wizard and the admin imports page both invoke the same `imports.service.run_import(tenant_id, import_id, entity_type, file_id)` service method. Note: "same backend pipeline" does NOT mean the same UI. Onboarding wizard has intro text, multi-file bundling, and walkthrough UX; admin imports page has a compact single-entity-type UI. Two frontend components, one shared `features/imports/service.py`.
- **Rate limit:** one import running at a time per tenant, queued if a second is triggered.

### 3.3 Supported ongoing entity types

Same list as onboarding (section 2.2), minus `historical_timesheets` (prospective-only in v1.0). All nine entity types are importable both at onboarding and ongoing.

---

## 4. Manual single-entity creation (the normal CRUD path)

Every feature page has an "Add X" button that opens a form. Normal CRUD flows through the corresponding feature's service layer and follows the optimistic-locking pattern (version column + three-layer 409 resolution) like any other mutation.

Not covered in depth here because it's not an "ingestion" story, it's normal product CRUD. See `specs/APP_BLUEPRINT.md` for the feature pages and `specs/DATA_ARCHITECTURE.md` for the entity schemas.

---

## 5. OCR receipt ingestion (per-expense)

**Not a bulk path**, but listed here because it's another way data flows INTO the app: each time a user uploads a receipt, Gemini vision extracts structured data and pre-fills the expense form.

Pipeline:
1. User uploads receipt image via web or mobile camera (`<input capture="environment">`)
2. File uploaded to GCS via presigned URL
3. ClamAV Celery task scans, sets `files.status = 'ready'`
4. `extract_receipt_data` tool (in `backend/app/features/expenses/ai_tools.py`) calls Gemini vision with the file URL
5. Gemini returns structured JSON: merchant, date, amount, tax, currency, category suggestion, confidence score
6. Output validated against Pydantic schema
7. `expenses` row created in `draft` status with the AI values
8. User reviews, corrects, submits

Entire pipeline runs in Celery; the HTTP request that triggered the upload returns immediately with a pending reference. The user sees the pre-fill appear in the form after 5-15 seconds (within the OCR p95 < 15s internal SLO target).

### 5.1 Resilience and error handling

OCR jobs run in Celery with exponential backoff: 3 retries at 30 s, 2 min, 5 min. If Vertex AI Gemini vision is still unavailable after 3 retries, the expense is created in `draft` status with empty pre-fill fields (amount, date, vendor, category blank), a yellow banner "Receipt scan is temporarily unavailable. Please enter details manually.", and the receipt image is still stored in GCS and attached. When the service recovers, a background sweep re-OCRs the draft expenses that are still missing fields and notifies the user; the user can accept the suggested values with one click.

On sustained failure (>5 minutes p95 latency on the OCR tool), the operator may flip `kill_switch.ocr` (see `docs/DEGRADED_MODE.md`) to short-circuit retries and surface the manual-entry banner immediately.

---

## 6. Payroll CSV export (the one reverse-direction)

Gamma supports a one-way payroll export per month, generating a CSV in the format expected by the customer's payroll provider. This is deliberately a file handoff, not a bidirectional sync.

### 6.1 Provider adapter scope

**Provider adapter scope.** Phase 5 implements one adapter at launch: the provider used by the first pilot customer. The spec for each CSV shape must be confirmed with the provider documentation + a real sample file from the customer before the adapter is written. Do not implement on assumption. Candidates for Phase 5 (in priority order, pending first pilot choice):

- **Silae (FR)**: columns TBD per their export template. Used by many French consulting firms.
- **Payfit (FR/EU)**: columns TBD per Payfit documentation.
- **SAP SuccessFactors Employee Central (EU multi-country)**: EC CSV interface.
- **Generic CSV**: fallback shape for any provider, columns documented in 6.4 below.

Each adapter has: (1) documentation of provider's expected columns, (2) a sample input file under `backend/tests/fixtures/payroll/<provider>.csv`, (3) a snapshot test asserting byte-stable output, (4) a smoke test with the customer before first real export. Adding a second adapter is a separate scoped work item, not a drive-by.

More providers deferred (see DEF-062 section 8).

### 6.2 Export content

One row per employee per period, containing:
- Employee identifier (email + employee_id)
- Period (month + year)
- Worked days (from approved timesheets in the period)
- Leave days taken (from approved leave_requests)
- Expense reimbursement total (from approved expenses)
- Leave balance remaining (optional, per provider)

### 6.3 Trigger

Admin → Integrations page → "Payroll Export" → pick provider + period → download. Can also be scheduled monthly via a Celery beat job that writes the file to GCS and emails the admin a download link.

### 6.4 Not a sync

This is a one-way file export. Gamma does NOT push to the payroll provider's API. It does NOT receive data back from them. It is deliberately a file handoff so that the customer's finance/HR workflow stays in their payroll system, and Gamma is just the time+expense source of truth.

Bidirectional payroll sync is deferred (DEF-062).

---

## 7. Security, audit, and compliance

- **All uploads** go through the ClamAV virus scan Celery task before being marked `public.files.status = 'ready'`. Files with `status != 'ready'` cannot be linked to any parent entity.
- **Every import** emits audit log entries: one for the import session itself (`action = 'import.started'` / `import.finished`), one per batch (`action = 'import.batch_committed'`), and optionally one per row for destructive operations.
- **PII handling:** column mapping calls send headers and sample rows to Vertex AI Gemini in `europe-west9`. Sample rows may contain PII (names, emails). This data is Internal-tier in the data classification scheme and is acceptable because Vertex AI zero-retention is configured and the data never leaves EU. Confidential-tier columns (compensation, banking, Art. 9 medical) are never present in CSV imports.
- **Idempotency keys** on every import session prevent duplicate commits under Celery retries. CSV imports are on the mandatory-idempotency endpoint list.
- **Rate limiting:** one concurrent import per tenant. Additional imports queue until the previous one completes. Import queue is FIFO per tenant, max 1 concurrent import per tenant. Large imports (>10k rows) are split into Celery sub-tasks that run on separate workers, but a single tenant never runs >1 top-level import at a time. Operator can kill a stalled import from the operator console (Phase 2 deliverable); default hard timeout 30 minutes.
- **Kill switch:** `kill_switch.imports` (to add to the initial kill switch set) lets the operator disable CSV imports tenant-wide during an incident. The founder should add this row to `public.feature_flags` in Phase 2.

---

## 8. Deferrals

Five deferrals are tracked in `docs/DEFERRED_DECISIONS.md` for data ingestion: DEF-060 HRIS sync, DEF-061 historical leaves/expenses/invoices imports, DEF-062 payroll provider sync (write path), DEF-063 Excel (.xlsx) import, DEF-064 Google Sheets import. See the registry for trigger conditions. Do not duplicate the list here.

---

## 9. Implementation checklist for Phase 2-4

Tracked against the phases in `THE_PLAN.md`:

**Phase 2 (Foundation):**
- [ ] `backend/app/features/imports/routes.py` + `service.py` + `validators.py` scaffolded
- [ ] `public.import_checkpoints` table added (for resumable imports)
- [ ] CSV parsing via `pandas.read_csv` with chunked iteration for large files
- [ ] Presigned upload to GCS with 20 MB limit enforced
- [ ] ClamAV Celery integration

**Phase 3 (Auth + onboarding):**
- [ ] Onboarding wizard (APP_BLUEPRINT 1.8) consuming the import service
- [ ] AI column mapper tool registered in `features/imports/ai_tools.py`
- [ ] Manual column mapper UI as fallback
- [ ] Validation + error report UI
- [ ] WebSocket progress integration on `/ws/notifications`
- [ ] End-to-end test: import a 200-employee synthetic CSV in under 60 seconds

**Phase 4 (Core data):**
- [ ] Admin → Imports page for ongoing imports
- [ ] Per-entity importers wired for employees, teams, clients, client_contacts, projects, project_allocations, employee_rates, project_rates
- [ ] Historical timesheets importer (onboarding-only)

**Phase 5 (Core modules):**
- [ ] Payroll export page + Silae adapter + Payfit adapter + generic adapter
- [ ] Monthly Celery beat job for scheduled payroll exports (optional)

---

## 10. Cross-references

- `specs/DATA_ARCHITECTURE.md` section 2.5 (public.files, import_checkpoints), section 10 (Celery fan-out patterns)
- `specs/APP_BLUEPRINT.md` section 1.8 (onboarding wizard), section 9 (admin console)
- `docs/DEFERRED_DECISIONS.md` DEF-010, DEF-011, DEF-024, and the new DEF-060 through DEF-064
- `docs/SCOPE.md` first-customer must-have #1 (bulk CSV onboarding for the canonical seed dataset in under 60 s)
- `docs/FLAWLESS_GATE.md` (imports pages must pass all 15 items before shipping)

---

**End of DATA_INGESTION.md.**
