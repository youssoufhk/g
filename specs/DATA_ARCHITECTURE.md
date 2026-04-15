# DATA ARCHITECTURE

> Entities, tenancy, API conventions, and operational contracts.
> Source of truth for the data model.
> Derived from the Q&A planning session that locked 102 decisions across 15 rounds.
> If this file conflicts with any other doc, this file wins for data/schema questions.
> If this file is silent, consult `docs/DEFERRED_DECISIONS.md` or ask.

---

## 0. Quick map

- Section 1: Multi-tenancy shape and the three-audience identity model
- Section 2: Entity catalog organized by schema (public vs per-tenant)
- Section 3: Versioning, conflict resolution, idempotency, audit
- Section 4: Money, time, rates, currencies, unit conventions
- Section 5: AI layer data model
- Section 6: Feature gating (entitlements, flags, kill switches)
- Section 7: Billing and subscription lifecycle
- Section 8: GDPR, retention, encryption classification
- Section 9: API conventions
- Section 10: Migrations, backfills, operational plumbing
- Section 11: Backup, DR, environments
- Section 12: Known gaps and operational follow-ups

---

## 1. Multi-tenancy and identity

### 1.1 Schema-per-tenant PostgreSQL 16

**One cluster, one logical database per environment (`staging`, `prod`).**

- **`public` schema** holds global tables: identity tables for all three audiences, lookup tables, telemetry, billing, and the operational plumbing tables.
- **Per-tenant schema** `tenant_<slug>` holds every business entity for that tenant. Schemas created on tenant provisioning via `CREATE SCHEMA`, dropped on hard-delete via `DROP SCHEMA CASCADE`.
- **FastAPI middleware** extracts `tenant_id` from the JWT, looks up the tenant's schema name, and sets `SET search_path = tenant_<slug>, public` for the duration of the request.
- **Connection pooling:** PgBouncer in transaction mode fronts Cloud SQL from Year 2-3 onward (DEF-013). Until then, Cloud Run instances talk directly to Cloud SQL over the Cloud SQL Auth Proxy.

**Rationale and alternatives:** see `docs/decisions/ADR-001-tenancy.md`.

### 1.2 The three-audience identity model

GammaHR serves three distinct audiences from one codebase, three subdomains, three route groups, three API surfaces, and three identity tables. **There is no crossover between these identity spaces.** See `docs/decisions/ADR-010-three-app-model.md` for the full rationale.

| Audience | Subdomain | Identity table | Session table | Auth strategy |
|---|---|---|---|---|
| Founder's team (operator) | `ops.gammahr.com` | `public.operators` | `public.operator_sessions` | WebAuthn passkey only. No password, no TOTP fallback. |
| Customer employees (tenant users) | `app.gammahr.com` | `public.users` (FK to `tenants`) | `public.sessions` | OIDC (Google Workspace, Microsoft Entra) → WebAuthn passkey → bcrypt password. Phase 2 ships OIDC + passkey; SCIM and SAML deferred (DEF-024, DEF-025). |
| Customers' clients (portal users) | `portal.gammahr.com` | `public.portal_users` (FK to `tenants`) | `public.portal_sessions` | WebAuthn passkey → password → TOTP. No SSO in v1.0 (DEF-008). |

**Impersonation** (operator → tenant user): operator mints a short-lived JWT tagged `actor_type = operator, impersonated_user_id = X`, every mutation during the impersonated session is logged to `public.audit_log` with both the operator and the impersonated user recorded. Never allowed in the reverse direction (tenant user → operator). Impersonation tooling itself is deferred (DEF-002); the JWT shape and audit contract are defined now so the later addition is additive.

### 1.3 User-tenant binding

Strict: one `public.users` row per (email, tenant_id). A real person who works for two GammaHR tenants has two rows. No cross-tenant user profile. This keeps `search_path` tenant isolation clean and avoids the entire class of "does this user have access to tenant X" bugs.

---

## 2. Entity catalog

### 2.1 Conventions that apply to every table

- Primary key: `id UUID` (v7 for time-ordered clustering), unless stated.
- Timestamps: `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()` (updated via trigger), `created_by UUID NULL`, `updated_by UUID NULL` (references the identity table appropriate for the schema).
- Soft delete: only the explicit whitelist `{employees, clients, projects, invoices}` has `deleted_at TIMESTAMPTZ NULL`. All other tables hard-delete. Soft-deleted rows are auto-purged 90 days after `deleted_at` via a nightly Celery job.
- Version column: every mutable row on the conflict-resolution whitelist `{projects, invoices, invoice_lines, clients, employees, timesheet_entries, timesheet_weeks, expenses, leave_requests}` has `version INTEGER NOT NULL DEFAULT 0`. Every UPDATE uses `WHERE id = ? AND version = ?` and increments on success; 0 rows affected means HTTP 409 and the three-layer conflict resolution flow kicks in (optimistic lock, field-level diff modal, revision history). See section 3.1.
- Foreign keys: `ON DELETE RESTRICT` by default. `ON DELETE CASCADE` only for audit/telemetry child rows and for `tenant_*` schema drops.

### 2.2 Global identity tables (public schema)

```
public.operators
  id, email (unique), full_name, status,
  last_login_at, created_at, updated_at

public.operator_sessions
  id, operator_id, refresh_token_hash, user_agent, ip,
  expires_at, created_at, revoked_at

public.users
  id, tenant_id (FK public.tenants), email (unique per tenant),
  full_name, role ∈ {owner, admin, manager, finance, employee, readonly},
  password_hash NULL, email_status ∈ {ok, bounced_soft, bounced_hard, complained, unsubscribed},
  email_status_updated_at, email_verified_at, mfa_enabled,
  oidc_subject NULL, oidc_provider NULL,
  ai_enabled BOOL DEFAULT TRUE, timezone NULL,
  status, version, created_at, updated_at, deleted_at NULL
  -- Exactly one user per tenant has role='owner' (enforced at application layer, transferable).
  -- Anonymize-in-place on GDPR deletion: email='deleted-{uuid}@gammahr.invalid', full_name='Deleted User'.

public.sessions
  id, user_id, refresh_token_hash, user_agent, ip,
  expires_at, created_at, revoked_at

public.portal_users
  id, tenant_id (FK), client_id (FK to tenant_<slug>.clients via recorded ref, not DB FK),
  email (unique per tenant), full_name,
  password_hash NULL, mfa_totp_enabled BOOL,
  email_verified_at, last_login_at, status, created_at, updated_at

public.portal_sessions
  id, portal_user_id, refresh_token_hash, user_agent, ip,
  expires_at, created_at, revoked_at

public.webauthn_credentials
  id, subject_type ∈ {operator, user, portal_user}, subject_id,
  credential_id, public_key, sign_count, transports, label,
  created_at, last_used_at

public.mfa_totp
  id, subject_type ∈ {user, portal_user}, subject_id,
  secret_encrypted, recovery_codes_hashed (text[]),
  created_at, enabled_at

public.oidc_providers
  id, tenant_id (FK), provider_type ∈ {google_workspace, microsoft_entra},
  client_id, client_secret_encrypted, discovery_url, enabled,
  created_at, updated_at
  -- Per-tenant SSO provider configuration. Tenant users authenticate via OIDC first (Google Workspace and Microsoft Entra), with WebAuthn passkey as the secondary path and bcrypt password as the fallback. See ADR-010 three-app model.

public.invitations
  id, tenant_id, email, role, token_hash, expires_at, accepted_at
```

### 2.3 Tenants and billing (public schema)

```
public.tenants
  id, slug (unique), name,
  country_code,                    -- ISO 3166-1 alpha-2, default for employees
  default_timezone,                -- IANA zone. UTC storage everywhere; reports aggregate in tenant TZ.
  currency,                        -- ISO 4217, tenant base currency
  hours_per_day NUMERIC(3,1) DEFAULT 8.0,  -- for day-to-minute conversion; employees.hours_per_day overrides per-employee
  fiscal_year_start DATE,
  default_tax_rate NUMERIC(5,4),  -- decimal fraction 0.2000 = 20%
  expense_approval_threshold_cents BIGINT,  -- finance co-approval gate: expenses above this amount need direct manager + finance sign-off
  invoice_number_format TEXT,      -- e.g. "INV-{YYYY}-{SEQ:05}"
  invoice_number_prefix TEXT,
  invoice_sequence_reset ∈ {yearly, never},
  branding_json JSONB,             -- logo_url, primary_color, etc. Used in email template rendering at Celery task time.
  lifecycle_state ∈ {trial, active, past_due, read_only, suspended, deleted}  DEFAULT 'trial',
  lifecycle_state_changed_at,
  pricing_model ∈ {list, custom} DEFAULT 'list',
  list_tier ∈ {starter, pro} NULL,  -- set when pricing_model = 'list'
  plan TEXT,                        -- legacy alias for list_tier, kept for admin display
  ai_enabled BOOL DEFAULT TRUE,     -- tenant opt-out flag. When false, the UI hides AI surfaces and OCR falls back to manual entry.
  created_at, updated_at

public.fx_rates
  id, date DATE, from_ccy, to_ccy, rate NUMERIC(18,8),
  source, created_at
  -- Multi-currency support: each tenant has a base currency, but invoices can be issued in any currency.
  -- Populated daily from ECB or similar. Invoice generator and reporting looks up the rate by invoice issue date.

public.invoice_sequences
  tenant_id, year, next_value,
  updated_at
  PRIMARY KEY (tenant_id, year)
  -- Invoice number generation: SELECT ... FOR UPDATE on the row during invoice creation in a single transaction.
  -- Entire invoice creation (sequence bump + invoices insert + invoice_lines + PDF job enqueue) runs in one transaction.
  -- Locks held milliseconds. A nightly gap-detection job checks for missing numbers (French legal requirement).

public.subscription_invoices
  id, tenant_id, number, issue_date, due_date,
  subtotal_cents, tax_cents, total_cents, currency,
  status ∈ {draft, sent, paid, void},
  pdf_url, sent_at, paid_at, payment_method ∈ {wire, sepa, card} NULL,
  payment_reference NULL, notes,
  created_at, updated_at
  -- GammaHR's own invoices to tenants (Phase 2 manual, Phase 5+ automated via DEF-029).
  -- Separate from the `invoices` table in tenant schema (which is tenants invoicing their clients).

public.tenant_custom_contracts
  id, tenant_id, annual_fee_cents, currency,
  billing_interval ∈ {monthly, annual},
  included_seats INTEGER NULL,
  overage_rate_cents INTEGER NULL,
  contract_start DATE, contract_end DATE NULL,
  notes TEXT, signed_pdf_url NULL,
  created_by, created_at, updated_at
  -- Custom-pricing contracts for enterprise and negotiated deals.
  -- Override for tenants on pricing_model='custom'. Drives manual subscription_invoices in Phase 2.

public.tenant_entitlements
  tenant_id, feature_key, enabled BOOL DEFAULT TRUE,
  quota_int NULL, metadata_jsonb NULL,
  created_at, updated_at
  PRIMARY KEY (tenant_id, feature_key)
  -- Entitlements system (answering "did they PAY for it?"). Populated from the tenant's list_tier by a background task,
  -- overridable row-by-row for sales concessions. Separate from feature_flags.
  -- Checked via entitlements.require(key, tenant_id) inside every gated feature action.

public.sub_processors
  id, name, purpose, data_categories JSONB, region,
  is_active BOOL, added_at, notified_at, retired_at NULL,
  created_at, updated_at
  -- Public sub-processor list rendered on gammahr.com/legal/sub-processors.
  -- Initial rows: Google Cloud, Google Workspace, Cloudflare, GitHub/Microsoft.
  -- Vertex AI Gemini is part of the Google Cloud row (same DPA), not a separate entry.

public.dpa_versions
  id, version_number, effective_date, pdf_url, content_html,
  changelog, created_by, created_at
  -- Data Processing Agreement versioning. Customers sign a specific version; rotation is rare.
  -- Hosted at gammahr.com/legal/dpa; based on EU SCC 2021 clauses and GDPR Art. 28.
```

### 2.4 Audit and telemetry (public schema, partitioned)

```
public.audit_log  (partitioned monthly by occurred_at)
  id, tenant_id NULL,             -- NULL for operator-level global actions
  actor_type ∈ {user, operator, portal_user, system},
  actor_id, on_behalf_of_id NULL,  -- set when delegation or operator impersonation is active
  entity_type, entity_id, action,
  metadata JSONB, ip, user_agent, request_id,
  occurred_at TIMESTAMPTZ NOT NULL
  -- Every mutation emits an audit entry. Retained 7 years per French accounting law (see section 8.2 Retention).
  -- Partition rotation via pg_partman or hand-rolled Celery job.

public.ai_events  (partitioned monthly by created_at)
  id, tenant_id, user_id, feature,
  tool,                             -- which ai_tools.py function was called
  model,                            -- model ID string, e.g. 'gemini-2.5-flash'
  input_tokens, output_tokens, cost_cents,
  latency_ms, request_id, created_at
  -- AI metering table. Logs only token counts, cost, tool name, latency. NEVER logs prompt content.
  -- Retained 6 months hot, archived 6-18 months, then hard-deleted. See section 5.4 PII in prompts.

public.entity_revisions
  id, tenant_id, entity_type, entity_id, version,
  actor_type, actor_id, diff_jsonb, created_at
  INDEX (tenant_id, entity_type, entity_id, version DESC)
  -- Per-entity revision history. One row per edit on whitelisted tables. Stores the diff, not a full snapshot.
  -- Third layer of the conflict resolution flow: viewable and restorable via the feature's History tab.
  -- Partitioning not needed at Phase 2 volume.
```

### 2.5 Operational plumbing (public schema)

```
public.idempotency_keys
  id, tenant_id, key, request_hash,
  response_status, response_body JSONB,
  created_at, expires_at
  UNIQUE (tenant_id, key)
  -- Idempotency keys on high-value mutating endpoints only: invoice generation, expense submission,
  -- payment recording, CSV imports. Header `Idempotency-Key: <uuid>`. 24h TTL. Replay returns cached response.
  -- Everything else relies on optimistic locking via the version column (see section 3.1).

public.alembic_runs
  id, version, tenant_id NULL,     -- NULL for public-schema migrations
  status ∈ {pending, running, succeeded, failed},
  error TEXT, started_at, finished_at, attempt
  -- Tracking table for the Celery fan-out migration runner.
  -- The operator console surfaces "tenants behind on schema version" from this table.
  -- Single most important piece of operational plumbing in the project. See section 10.2.

public.alembic_backfills
  id, version, tenant_id, last_id UUID NULL,
  batch_size INTEGER, done BOOL, error TEXT,
  created_at, updated_at
  -- Resumable chunked backfill checkpoint table. See section 10.4.

public.import_checkpoints
  id, import_id UUID, tenant_id, entity_type, file_id,
  last_processed_row INTEGER, total_rows INTEGER,
  status ∈ {pending, running, succeeded, failed, partial},
  error TEXT, started_at, updated_at
  -- CSV import resumability. The onboarding wizard and ongoing imports page both write here.
  -- See docs/DATA_INGESTION.md section 2.8 for recovery semantics.

public.feature_flags
  id, key, scope_type ∈ {global, tenant, user}, scope_id NULL,
  description, enabled BOOL, rules_jsonb NULL,
  created_at, updated_at
  -- In-house feature flag implementation, ~200 lines of code. Used for two things:
  -- (1) regular feature flags with scope_type ∈ {global, tenant, user}
  -- (2) global kill switches as rows with key LIKE 'kill_switch.*' and scope_type = 'global'
  -- Redis cache with 30s TTL for hot lookups. See section 6.

public.push_subscriptions
  id, user_id, endpoint, p256dh_key, auth_key,
  created_at, last_seen_at, revoked_at NULL
  -- Web Push PWA subscription per user. In-app notifications + PWA Web Push are the primary channels;
  -- email is only a fallback for auth flows, invoice delivery to clients, opt-in daily digest, and legal notices.

public.notifications
  id, tenant_id, user_id, kind,
  payload_jsonb, read_at NULL,
  created_at
  INDEX (user_id, read_at, created_at DESC)
  -- Kinds enum (extensible): approval_requested, approval_decided, import_finished,
  --   invoice_sent, mention, payment_failed, payment_succeeded, trial_ending, tenant_suspended,
  --   security_alert, digest_daily.
  -- is_essential is a property of the kind, not a column: defined in the notifications service layer.
  -- Essential kinds (auth flows, invoice delivery, legal) bypass the users.email_status suppression.

public.notification_preferences
  user_id, kind, in_app BOOL, push BOOL, email BOOL,
  updated_at
  PRIMARY KEY (user_id, kind)
  -- Per-kind channel preferences per user. Default channels per kind live in code,
  -- rows exist only when the user has overridden the default (RFC 8058 signed-token unsubscribe link creates them).

public.holidays
  id, tenant_id NULL,               -- NULL for system rows from python-holidays library
  country_code, date, name,
  is_custom BOOL, created_at
  UNIQUE (tenant_id, country_code, date)
  -- Holiday calendar seeded from the python-holidays library on tenant create, keyed off employees.country_code.
  -- System rows refreshed annually via a Celery beat job; tenant-custom rows added by the admin.

public.files
  id, tenant_id, key,               -- GCS object path in bucket gammahr-<env>-files
  size_bytes, mime, sha256,
  uploaded_by, status ∈ {pending, scanning, ready, infected, orphaned},
  linked_entity_type NULL, linked_entity_id NULL,
  created_at, ready_at NULL
  UNIQUE (tenant_id, sha256)        -- Per-tenant dedup, never cross-tenant. Same SHA256 from two different tenants = two rows.
  -- Presigned upload to GCS, ClamAV Celery scan sets status=ready before the file is linked to a parent entity.
  -- Orphaned files (no linked_entity after 24h) are hard-deleted by a nightly cleanup job.
```

### 2.6 People (tenant schema)

```
employees   [soft-delete, version]
  id, user_id NULL (FK public.users),
  first_name, last_name, email, phone,
  role_title, team_id (FK teams), manager_id (FK employees self),
  start_date, end_date NULL, status ∈ {active, on_leave, terminated},
  employment_type ∈ {fte, contractor, intern, freelance},
  country_code,                     -- ISO 3166-1 alpha-2, defaults from tenants.country_code. Leave accrual and public holidays key off this column.
  hours_per_day NUMERIC(3,1) NULL,  -- override for tenants.hours_per_day when present (e.g., France 7.0, Germany 8.0)
  is_billable BOOL DEFAULT TRUE,    -- derivable per project but tracked here for quick queries
  location, created_at, updated_at, deleted_at NULL, version

teams
  id, name, description, lead_id (FK employees), created_at, updated_at

employee_compensation   [Confidential-tier, physically split, finance/admin role only, CMEK encrypted]
  id, employee_id (FK), effective_from DATE,
  salary_cents BIGINT, currency, pay_period ∈ {monthly, annual},
  bonus_cents BIGINT, notes,
  created_at, created_by
  -- Access is logged to audit_log with action='compensation.read' at the service layer.
  -- Encrypted at rest via Cloud KMS customer-managed encryption keys with a per-tenant keyring.
  -- Never included in any AI prompt (enforced by a pytest metatest).

employee_banking   [Confidential-tier, physically split, finance/admin role only, CMEK encrypted]
  id, employee_id (FK), iban_encrypted, bic_encrypted,
  bank_name, account_holder, currency,
  created_at, updated_at

employee_rates   [effective-dated, for invoice generation by rate period]
  id, employee_id, daily_rate NUMERIC(14,4), currency,
  valid_from DATE, valid_to DATE NULL,
  created_at, created_by
  -- Invoice generator groups timesheet entries by the active rate period for each entry's work_date.
  -- A mid-month rate change produces two separate invoice lines for clarity (e.g., "Jan 1-14 at rate A", "Jan 15-31 at rate B").

employee_documents
  id, employee_id, type, name, file_id (FK public.files),
  expires_at NULL, created_at

approval_delegations
  id, user_id, delegate_user_id, valid_from, valid_to,
  reason, created_at
  -- Vacation cover for approvals. Full inheritance: the delegate acts as the delegator for all approvals during the window.
  -- Every action logged with actor_id=delegate, on_behalf_of_id=delegator.

employee_visibility   (MATERIALIZED VIEW)
  viewer_employee_id, visible_employee_id
  -- Precomputed transitive reports + managed teams for fast manager-scope queries.
  -- Refreshed on org-change events (writes to employees.manager_id or team_id) via a Celery task
  -- using REFRESH MATERIALIZED VIEW CONCURRENTLY so queries do not block.
```

### 2.7 Clients and projects (tenant schema)

```
clients   [soft-delete, version]
  id, name, legal_name, vat_number, vat_reverse_charge BOOL,
  industry, status, account_manager_id (FK employees),
  country_code, billing_address JSONB, billing_email,
  created_at, updated_at, deleted_at, version

client_contacts
  id, client_id, first_name, last_name, email, phone, role,
  is_primary BOOL, created_at, updated_at

projects   [soft-delete, version]
  id, client_id, name, code UNIQUE,
  status ∈ {draft, active, paused, completed, cancelled},
  start_date, end_date NULL,
  budget_amount_cents BIGINT NULL, budget_days INTEGER NULL,
  billing_type ∈ {tm, fixed},
  fixed_amount_cents BIGINT NULL,   -- for billing_type='fixed'
  fixed_billed_cents BIGINT DEFAULT 0,
  allow_hourly_entry BOOL DEFAULT FALSE,  -- default is day/half-day entries only. When true, sub-day entries allowed with a 1-hour minimum floor.
  project_manager_id (FK employees),
  created_at, updated_at, deleted_at, version

project_rates   [effective-dated, per project per employee override of employee_rates]
  id, project_id, employee_id, daily_rate NUMERIC(14,4),
  valid_from DATE, valid_to DATE NULL, created_at

project_allocations   [time-varying]
  id, project_id, employee_id,
  valid_from DATE, valid_to DATE NULL,
  allocation_pct INTEGER,            -- 0-100
  created_at
  -- Capacity views use JOIN LATERAL by date. UI can expand a team into individual rows.

project_milestones   [for billing_type='fixed']
  id, project_id, name, amount_cents, due_date,
  billed_at NULL, invoice_id NULL (FK invoices),
  created_at, updated_at

project_tasks
  id, project_id, name, status, parent_task_id NULL,
  due_date NULL, assignee_id (FK employees) NULL,
  created_at, updated_at
```

### 2.8 Time tracking (tenant schema)

```
timesheet_weeks   [parent entity, version-locked]
  id, employee_id, iso_year, iso_week,
  status ∈ {draft, submitted, approved, rejected},
  submitted_at NULL, approved_at NULL,
  approved_by NULL (FK employees), rejection_reason NULL,
  version, created_at, updated_at
  UNIQUE (employee_id, iso_year, iso_week)
  -- Week start is ISO Monday, fixed, not configurable. Submit/approve/reject operate on the week, never a single day.
  -- State machine: draft → submitted → {approved, rejected}; rejected loops back to draft.
  -- "Recall submission" button available only while status = 'submitted' AND no approval action has happened yet.
  -- This entity was introduced to solve the approval-race condition: entries become immutable once the parent week is submitted.

timesheet_entries   [child of timesheet_weeks]
  id, timesheet_week_id (FK timesheet_weeks ON DELETE CASCADE),
  employee_id, project_id, task_id NULL,
  work_date DATE,                    -- employee-local calendar date; no timestamps, no DST bug class
  duration_minutes INTEGER,          -- source-of-truth storage unit; UI converts to days via tenants.hours_per_day
  description,
  billable BOOL DEFAULT TRUE,
  version, created_at, updated_at
  INDEX (project_id, work_date)
  INDEX (employee_id, work_date)
  -- Immutable once parent timesheet_week.status = 'submitted'. Version lock enforced during draft.
  -- 1-hour minimum floor for sub-day entries on projects with allow_hourly_entry = true. Day-based billing, never sub-hour.
```

### 2.9 Leaves (tenant schema)

```
leave_types
  id, name, code, accrual_rate NUMERIC(5,2),  -- days per month
  max_balance NUMERIC(5,2) NULL, paid BOOL, color, is_medical BOOL,
  created_at, updated_at

leave_requests   [version]
  id, employee_id, leave_type_id,
  start_date, end_date, days NUMERIC(5,2),
  status ∈ {draft, submitted, approved, rejected},
  reason TEXT NULL,                  -- non-sensitive free text for normal leaves (vacation, personal, training)
  reason_encrypted BYTEA NULL,       -- Art. 9 sensitive data (medical-implied leaves), Confidential-tier, CMEK encrypted, never in any AI prompt
  approved_by, approved_at, rejection_reason,
  version, created_at, updated_at

leave_balances
  employee_id, leave_type_id, year,
  accrued NUMERIC(5,2), used NUMERIC(5,2), pending NUMERIC(5,2), balance NUMERIC(5,2),
  updated_at
  PRIMARY KEY (employee_id, leave_type_id, year)

-- The holidays table lives in public schema (Section 2.5), seeded from the python-holidays
-- library on tenant create and keyed off employees.country_code. Leave accrual and holiday
-- display both use the employee's country, defaulting from tenants.country_code when the
-- employee row has no override.
```

### 2.10 Expenses (tenant schema)

```
expense_categories
  id, name, code, gl_account, tax_rate NUMERIC(5,4),
  created_at, updated_at

expenses   [version]
  id, employee_id, category_id, project_id NULL, client_id NULL,
  date, merchant, amount_cents BIGINT, currency,
  tax_amount_cents BIGINT, exchange_rate NUMERIC(18,8) NULL,
  status ∈ {draft, submitted, approved, rejected},
  approved_by, approved_at, rejection_reason,
  reimbursement_status ∈ {pending, paid, na},
  reimbursed_at NULL, version, created_at, updated_at
  -- Approval routing: direct manager always; plus finance co-approval when amount > tenants.expense_approval_threshold_cents.

expense_receipts
  id, expense_id, file_id (FK public.files),
  ocr_json JSONB, ocr_confidence NUMERIC(3,2),
  ocr_run_id NULL,                   -- links to the ai_events row that produced the OCR
  uploaded_at
  -- Hard-blocked duplicates: enforced at public.files level via the (tenant_id, sha256) unique constraint.
  -- Soft-duplicate warning on the (merchant, date, amount) tuple shown as a banner at review time, user decides.
```

### 2.11 Invoices to clients (tenant schema)

```
invoices   [soft-delete, version]
  id, client_id, number,
  issue_date, due_date, status ∈ {draft, sent, viewed, paid, overdue, void},
  currency, fx_rate_to_base NUMERIC(18,8) NULL,
  subtotal_cents, tax_total_cents, total_cents,
  tax_mention TEXT NULL,             -- legal mention for EU reverse-charge invoices: "Reverse charge - Article 196 of Council Directive 2006/112/EC"
  sent_at NULL, paid_at NULL,
  pdf_status ∈ {pending, ready, failed}, pdf_url NULL,
  version, created_at, updated_at, deleted_at
  UNIQUE (number)                   -- number is already per-tenant via schema isolation

invoice_lines   [version]
  id, invoice_id, description,
  quantity NUMERIC(12,4), unit ∈ {day, half_day, hour, fixed, expense},
  unit_price_cents BIGINT, amount_cents BIGINT,
  tax_rate NUMERIC(5,4), tax_amount_cents BIGINT,
  project_id NULL, timesheet_entry_id NULL, expense_id NULL, milestone_id NULL,
  version, created_at, updated_at

invoice_payments
  id, invoice_id, amount_cents, currency,
  method ∈ {wire, sepa, card, cash, other},
  reference, paid_at, created_at
```

### 2.12 AI layer (tenant schema)

```
ai_budgets
  tenant_id, year, month,
  limit_cents INTEGER, used_cents INTEGER DEFAULT 0,
  updated_at
  PRIMARY KEY (tenant_id, year, month)
  -- Per-tenant monthly AI budget, enforced inside backend/app/ai/client.py via atomic reservation
  -- (SELECT ... FOR UPDATE on the row during each AI call to prevent races).
  -- Defaults: Starter €10/mo, Pro €30/mo, Enterprise custom (metered but no default cutoff).
  -- 80% triggers a warning banner; 100% disables AI features until next month or admin raises the limit.

ai_command_history
  id, tenant_id, user_id,
  query_text,                        -- the natural-language query the user typed
  resolved_tool,                     -- which ai_tools.py function was chosen
  result_summary JSONB,              -- minimal data to rebuild the UI, NOT the full response
  created_at
  -- Retained 90 days, then hard-deleted by the nightly retention job.
  -- This is the ONE AI data store that holds user-scoped content. Everything else (prompts, model outputs) is transient.

ai_insights
  id, module, severity, title, body_markdown,
  entity_type, entity_id, generated_at,
  dismissed_at NULL, acted_on_at NULL,
  cached_until TIMESTAMPTZ           -- insight cards live 24h then regenerate; yesterday's cards remain visible if nightly run fails
  -- Generated by a nightly Celery job per tenant. Deterministic analyzers produce candidate signals;
  -- Gemini ranks them and writes one-paragraph explanations.
```

---

## 3. Versioning, conflict resolution, idempotency, audit

### 3.1 Optimistic concurrency (version column + three-layer resolution)

Every row on the whitelist carries a `version INTEGER NOT NULL DEFAULT 0`. All updates go through:

```sql
UPDATE <table> SET ..., version = version + 1, updated_at = now()
WHERE id = $id AND version = $expected_version;
```

If `cursor.rowcount = 0`, the service layer raises `ConflictError`, the API returns HTTP 409, and the frontend triggers the three-layer resolution:

1. **Optimistic lock** catches the race at the DB level.
2. **Field-level diff modal** (`<ConflictResolver>` in `components/patterns/`) compares base/yours/theirs, auto-merges disjoint fields silently, forces manual pick on overlap.
3. **Revision history** (`public.entity_revisions`) lets the user scroll back to any prior version of the record and restore.

Whitelist: `projects, invoices, invoice_lines, clients, employees, timesheet_weeks, timesheet_entries, expenses, leave_requests`. Everything else hard-writes.

### 3.2 Idempotency keys on high-value endpoints

Required only on high-value mutating endpoints where a duplicate would be expensive:

- Invoice generation (`POST /api/v1/invoices`)
- Expense submission (`POST /api/v1/expenses/{id}/submit`)
- Payment recording (`POST /api/v1/invoices/{id}/payments`)
- CSV imports (`POST /api/v1/imports`)

Client sends `Idempotency-Key: <uuid>` header. Server stores (tenant_id, key, request_hash, response) in `public.idempotency_keys` with 24h TTL. Replay returns the cached response. OpenAPI spec flags these endpoints with `requiresIdempotency: true` and the shared frontend fetch wrapper auto-generates the UUID per call.

Everything else relies on the optimistic lock (not idempotency keys) because it is already version-protected via the version column from section 3.1.

### 3.3 Invoice sequence concurrency under concurrent writes

Invoice generation runs inside a single transaction:

1. `SELECT ... FOR UPDATE` on `public.invoice_sequences(tenant_id, year)`
2. INSERT into `invoices` with `number` built from `tenants.invoice_number_format`
3. INSERT `invoice_lines`
4. INSERT audit_log entry
5. Enqueue Celery task `render_invoice_pdf(invoice_id)` with `pdf_status = 'pending'`
6. COMMIT

The PDF render happens **out of band** in Celery via WeasyPrint, flips `pdf_status = 'ready'` when done. The sequence lock is held for milliseconds, not seconds.

A nightly `invoice_gap_check` Celery job scans for missing numbers per (tenant_id, year). If a gap appears (e.g., a rolled-back transaction), the job alerts the founder. This is the safety net for French legal compliance.

### 3.4 Audit trail

Every mutation via service layer emits one `public.audit_log` row. `actor_type` distinguishes user/operator/portal_user/system. `on_behalf_of_id` is set when approval delegation or operator impersonation is active. `metadata` holds a JSONB summary of the change (diff keys, not full before/after; diffs live in `entity_revisions`).

Partitioned monthly via `pg_partman` or a hand-rolled Celery job. Retained 7 years per French accounting law (see section 8.2 Retention), then partitions dropped.

---

## 4. Money, time, rates, currencies

### 4.1 Unit conventions

| Thing | Storage | Rationale |
|---|---|---|
| Monetary amount | `BIGINT` integer minor units (cents) | Exact, no float bugs, no rounding drift. |
| Rate | `NUMERIC(14,4)` | Higher precision than amounts because rates multiply and accumulate rounding error. |
| Time worked | `INTEGER` minutes | Duration is the source of truth. Day unit is a UI concept derived from `hours_per_day`. No `started_at`/`ended_at` timestamps, which kills the entire DST bug class. |
| Date comparisons | `DATE` | Rate effective-dating, work_date, holidays all use DATE, compared in tenant local time. |
| Allocation percent | `INTEGER` 0-100 | Simple integer, no fractional allocation at v1.0. |
| FX rate | `NUMERIC(18,8)` | Exchange rates need more precision than business rates. |

### 4.2 Day-based billing primitive

Consulting firms bill days. The UI presents days and half-days. The storage is integer minutes. Conversion is:

```
display_days = duration_minutes / (hours_per_day * 60)
```

`hours_per_day` resolves in this order (first non-null wins): `employees.hours_per_day`, `tenants.hours_per_day`, 8.0 (default).

Half-day = `hours_per_day * 30`. Sub-day entries must be at least 60 minutes (1-hour minimum floor, per the billing units memory lock). Projects opt in to sub-day entries via `projects.allow_hourly_entry = true`.

### 4.3 Multi-currency

- Each tenant has a base currency (`tenants.currency`).
- Invoices can be issued in any currency (`invoices.currency`).
- `invoices.fx_rate_to_base` records the rate used for margin/budget reporting in base currency.
- GammaHR's own subscription billing to tenants is EUR-only in v1.0 (DEF-030); the multi-currency story applies only to tenants billing their own clients.
- FX rates live in `public.fx_rates`, populated daily from a free source (ECB or similar). The invoice generator looks up the rate by invoice issue_date.

### 4.4 Historical rates via effective-dated rate tables

`employee_rates` and `project_rates` are effective-dated. When an invoice is generated from timesheet entries, the generator groups entries by the active rate period for that entry's work_date. A mid-month rate change produces two separate invoice lines for clarity ("Jan 1-14 at rate A", "Jan 15-31 at rate B"). Rates changes are logged to audit_log, not stored on the rate row itself.

---

## 5. AI layer data model

### 5.1 LLM-as-router architecture

The AI layer is thin. The LLM's only job is to parse a user query (or a prepared context) and call a deterministic Python tool. All business logic, tenant scoping, RBAC, and rate limits live in the tool, which calls into the same feature `service.py` that HTTP routes use.

Tool set for v1.0 (each is a file in `backend/app/features/*/ai_tools.py`):

- `filter_timesheets`, `filter_invoices`, `filter_expenses`, `filter_leaves`, `filter_approvals`
- `get_project_summary`, `get_client_summary`, `get_employee_summary`
- `compute_budget_burn`, `compute_contribution`, `compute_capacity`
- `find_overdue_items`
- `extract_receipt_data` (vision, for OCR)
- `navigate_to` (command palette UX helper)

Expansion = one new file per tool, not a new prompt family. Tools are auto-discovered at startup by scanning `features/*/ai_tools.py` and registering.

### 5.2 Vendor: Vertex AI Gemini

- **Model:** Gemini 2.5 Flash (or current Flash-tier at implementation time). Same model for OCR, command palette, and insight cards.
- **Region:** `europe-west9` (Paris), same GCP project as the rest of the stack. No cross-region data movement.
- **Zero-retention** configured via Vertex AI settings.
- **Single abstraction:** `backend/app/ai/client.py` wraps the Vertex AI SDK. Swapping vendors is a one-file change (DEF-046).
- **Model IDs** centralized in `backend/app/ai/models.py` as constants (`MODELS.DEFAULT`, `MODELS.VISION`). Never hardcoded in feature code.

### 5.3 Budget and rate limiting

**Per-tenant monthly budget** in `ai_budgets` table. Defaults (scaled to Gemini Flash pricing): Starter €10/month, Pro €30/month, Enterprise custom. Warning at 80%, cutoff at 100%. Tenant admin can raise the limit up to 3x the tier default; above that requires operator console approval.

**Enforcement** happens inside `ai/client.py`, atomic via `SELECT ... FOR UPDATE` on the budget row. Check budget, reserve estimated cost, make call, reconcile actual cost on the return path.

**Per-user rate limits** in Redis (sliding window): 20 command palette queries/hour, 100 OCR calls/hour. Exceed = friendly toast.

**Degraded mode** kicks in when budget hits 80% OR hourly spend exceeds 10x the 7-day average (runaway detection). In degraded mode:
- OCR stays on (essential for expense workflow).
- Command palette returns "AI is busy, try again in a few minutes."
- Insight card generation skipped for the day.
- User-visible banner explains why.
- Operator console has override to unpause a tenant manually.

### 5.4 PII rules for AI prompts

Raw data goes to Vertex AI, with controls:

- **Never in any prompt:** `employee_compensation.*`, `employee_banking.*`, `leave_requests.reason_encrypted`, `employees.protected_status_encrypted`. Pytest metatest greps all tool definitions and prompt templates for references and blocks merge on violation.
- **Tenant opt-out:** `tenants.ai_enabled`. When false, UI hides AI surfaces, OCR falls back to manual entry.
- **Per-user opt-out:** `users.ai_enabled`. Disabled users never have their data in any prompt even when tenant has AI enabled. Implements GDPR Art. 21 right to object.
- **`ai_events` logs only meter data** (tokens, cost, tool, latency). Never logs prompt content. Prompts are transient.

### 5.5 Prompt versioning and evaluation harness

- Jinja2 templates in `backend/app/ai/prompts/*.jinja` with versioned filenames (e.g., `palette_router_v1.jinja`).
- `backend/app/ai/evals/` holds 10-20 hand-curated synthetic examples per tool family.
- CI runs evals on every prompt or tool-schema change, blocks merge if pass rate drops below threshold: router tool selection 90%, OCR extraction 95%, insight card coherence 75%.
- Evals use synthetic data only, never real customer data.

---

## 6. Feature gating: three independent systems

Any "can this user use feature X" check is three gates:

```python
can_use_feature(user, tenant, feature_key) = (
    entitlements.is_entitled(tenant, feature_key)   # did they PAY for it? (tenant_entitlements table)
    and flags.is_enabled(feature_key, tenant, user)  # is it rolled out to them? (feature_flags table, scope_type global/tenant/user)
    and not kill_switches.active(feature_key)        # is it emergency-disabled? (feature_flags with key LIKE 'kill_switch.*', scope_type = 'global')
)
```

All three must be green. Each answers a different question with a different control lifetime.

### 6.1 Entitlements (what the customer has purchased)

`public.tenant_entitlements` rows populated from the tenant's pricing tier via a background task. Overridable row-by-row for sales concessions. Feature modules call `entitlements.require(key, tenant_id)` before any action; returns HTTP 402 "upgrade required" if not entitled. Frontend reads `/api/v1/me/entitlements` and grays out locked features.

### 6.2 Feature flags (rollout and experimentation)

`public.feature_flags` with `scope_type ∈ {global, tenant, user}`. In-house implementation, ~200 lines of code. Python decorator `@requires_flag("key")`, service call `flags.is_enabled(key, tenant_id, user_id)`. Redis cache with 30s TTL. Operator console has a Feature Flags page with per-scope toggles, audit-logged. Percentage rollouts deferred (DEF-057) but schema supports via `rules_jsonb`.

### 6.3 Kill switches (emergency shutoff)

Rows in `public.feature_flags` with `key LIKE 'kill_switch.*'` and `scope_type = 'global'`. Initial set:

- `kill_switch.ai`
- `kill_switch.signups`
- `kill_switch.invoicing`
- `kill_switch.email`
- `kill_switch.ocr_uploads`
- `kill_switch.webhooks` (reserved, webhooks deferred DEF-009)
- `kill_switch.payment_processing`

Each toggle via operator console requires a "reason" text written to the audit log. **Every AI call site handles the killed state via try/except fallback** so killing AI does not crash the app; enforced by a pytest metatest.

### 6.4 The unified helper

Build `@gated_feature("ai_command_palette")` decorator in Phase 2 that calls all three gates in one place. Every new feature uses it. Do not sprinkle the three checks separately around the codebase.

---

## 7. Billing and subscription lifecycle

### 7.1 Pricing model: per-seat with volume bands

Three feature tiers:

- **Starter:** core time, clients, projects, invoices, expenses, leaves, basic dashboards, email support
- **Pro:** everything in Starter plus AI command palette, AI OCR, AI insights, resource planning, custom fields, advanced reports, priority support
- **Enterprise:** everything in Pro plus SSO/SAML/SCIM (post-deferral), audit exports, DPA negotiation, dedicated support, uptime SLA

**Volume-band per-seat pricing** (band pricing, not cliff pricing: a 75-seat tenant pays first 50 at rate A and the next 25 at rate B):

| Tier | 1-50 seats | 51-100 | 101-200 | >200 |
|---|---|---|---|---|
| Starter | €9/mo | €8/mo | €7/mo | custom |
| Pro | €15/mo | €13/mo | €11/mo | custom |

**Seat = active user in last 30 days.** Reference users (appear in data, never log in) are NOT billable. HR/Finance/PM users ARE billable at full seat rate. Prices ex-VAT, round numbers only.

### 7.2 Custom contracts (enterprise and negotiated deals)

`tenants.pricing_model = 'custom'` switches the tenant off list pricing. `public.tenant_custom_contracts` holds the negotiated deal: annual lump sum, included seats, overage rate, contract period. Founder creates these in the operator console. The monthly subscription_invoice calculation branches on pricing_model.

### 7.3 Billing operations: two-phase

**Phase 2 (customers 1-5):**
- Manual PDF invoicing. Founder generates `public.subscription_invoices`, WeasyPrint renders the PDF, Workspace SMTP Relay sends it.
- Customers pay via wire transfer or SEPA. Founder marks paid in the operator console.
- No Stripe, no Revolut, no webhooks. Zero integration surface.

**Phase 5+ (customer #6+):**
- Migrate to Stripe Billing or Revolut Business Merchant Acquiring (DEF-029). Founder's current lean is Revolut due to existing banking relationship; final choice deferred to implementation time.
- EU OSS VAT registration handled by accountant.
- Existing manual customers grandfathered or migrated.

### 7.4 Tenant lifecycle state machine

`tenants.lifecycle_state` enum:

```
trial → active → past_due → read_only → suspended → deleted
         ↑           ↓           ↓
         └───────────┴───────────┘  (payment resolved at any stage restores to active)
```

Timeline from card decline or trial end:

- **Day 0:** notification + banner, full access.
- **Day 1, 3, 7:** retry attempts, escalating branded dunning emails (three templates: day 1, 7, 14).
- **Day 8:** `lifecycle_state = 'read_only'`. Writes return 503, reads continue.
- **Day 15:** features disabled (invoicing, AI, exports off; core read still works).
- **Day 30:** `lifecycle_state = 'suspended'`. Cannot log in. Owner gets final notice with one-click restore.
- **Day 60:** hard-delete. `DROP SCHEMA tenant_<slug> CASCADE`. Legal-hold export (invoice headers, amounts, dates, counterparty) moved to `gammahr-legal-archive` GCS bucket for 10 years from invoice date. Everything else is gone.

Every backend write path checks `lifecycle_state` via middleware. Background jobs skip suspended tenants. Operator console surfaces the state prominently on the tenant detail page.

### 7.5 Dunning (payment failure communication)

Stripe/Revolut webhook `invoice.payment_failed` triggers GammaHR's own branded emails via Workspace SMTP Relay. Three templates escalating: day 1 ("we couldn't charge your card"), day 7 ("action needed"), day 14 ("read-only tomorrow"). Each links to update-payment-method. Full template list post-Round-10: auth invite, domain verification, invoice delivery, daily digest, security alert, dunning-1, dunning-2, dunning-3.

---

## 8. GDPR, retention, encryption

### 8.1 Data classification (three tiers plus Art. 9 flag)

**Three tiers plus Art. 9 flag:**

| Tier | Data | Handling |
|---|---|---|
| Public | Marketing copy, pricing | No PII. |
| Internal | Business entities, regular timesheets, names, emails | Standard RBAC + tenant scoping + audit log. |
| Confidential (physically split, CMEK encrypted) | `employee_compensation`, `employee_banking`, `leave_requests.reason_encrypted` (Art. 9 medical), `employees.protected_status_encrypted` (Art. 9) | Per-tenant Cloud KMS keyring, finance/admin role-only, every access logged. |

BYOK (customer-held keys) deferred (DEF-033).

### 8.2 Retention (per-entity policies with legal citations)

Per-entity retention policies, automated via nightly Celery retention jobs. Full citations in `docs/DATA_RETENTION.md` (to be written in Phase 2).

| Data | Retention | Legal basis |
|---|---|---|
| Active tenant data | Until tenant deletion | contract |
| Audit log | 7 years | French accounting law |
| Invoices + PDFs | 10 years | French law art. L.102 B LPF |
| Timesheets | 5 years | EU labor law |
| Expense receipts | 10 years from submission year | French fiscal law |
| User sessions | 90 days after logout | minimization |
| AI command history | 90 days | minimization, Anthropic TOS hedge |
| Deleted tenant data | 60-day grace then hard-delete, EXCEPT invoice metadata to legal-hold archive for 10 years | fiscal + GDPR |

Retention job anomaly alarm: if a nightly run would delete more than 10x the 7-day moving average, abort and alert the founder (catches bugs).

### 8.3 DSR (Data Subject Rights) fulfillment

**Tenant-admin self-service** in v1.0:
- "Export Employee Data" button calls `export_employee_data(tenant_id, employee_id) -> bytes`. Each feature module contributes its personal data to the bundle via a registry pattern. Returns JSON + PDF bundle.
- "Delete Employee" button triggers anonymize-in-place (email replaced with `deleted-{uuid}@gammahr.invalid`, name replaced with `Deleted User`, `deleted_at = now()`) with a 30-day admin-cancel grace. Cascades to hard-delete of expense receipts, notifications, and `ai_command_history`. Audit log entries are left intact on the lawful basis of legitimate interest under GDPR Art. 6(1)(f).

Manual handling for direct-to-GammaHR DSR emails via `privacy@gammahr.com`. Self-service form `gammahr.com/privacy/dsr` deferred (DEF-034).

30-day fulfillment SLA, extendable to 60 with justification per GDPR Art. 12(3).

### 8.4 Residency enforcement (hard policy + quarterly audit)

GCP Organization Policy `constraints/gcp.resourceLocations` blocks resource creation outside `europe-west9` (Paris) at the API level. `europe-west1` (Belgium) allowed as backup-only target. Cloudflare routes configured EU-only for authenticated `app.gammahr.com` paths via `Cache-Control: private, no-store` middleware header.

**Quarterly signed residency audit:** Cloud Function queries Cloud Asset Inventory, generates a signed PDF, uploads to a dedicated GCS bucket. Downloadable as a customer-facing artifact at `gammahr.com/legal/residency`.

### 8.5 Sub-processors (public page + 30-day change notice)

Public page at `gammahr.com/legal/sub-processors` backed by `public.sub_processors`. Initial list:

- Google Cloud (includes Vertex AI Gemini in the same DPA, region `europe-west9`)
- Google Workspace (EU region)
- Cloudflare (global edge with EU-only routing for authenticated routes)
- GitHub/Microsoft (code and CI only, no customer data)

Payment processor (Stripe or Revolut, TBD via DEF-029) added when it ships. 30-day change notice via email to all tenant owners on list changes (GDPR Art. 28(2)).

### 8.6 DPA (Data Processing Agreement)

Pre-drafted at `gammahr.com/legal/dpa`, based on EU SCC 2021 clauses and GDPR Art. 28. `public.dpa_versions` tracks versions; customer signatures bind to a specific version. E-signature flow deferred (DEF-036).

---

## 9. API conventions

- **REST** under `/api/v1/*` for tenant users (app.gammahr.com), `/api/v1/ops/*` for operators, `/api/v1/portal/*` for portal users.
- **JSON only.** ISO 8601 dates. Amounts in integer minor units (cents).
- **Auth:** `Authorization: Bearer <jwt>`. Tenant inferred from JWT.
- **Pagination:** cursor-based for large collections (`?cursor=<opaque>&limit=50`), offset-based for small bounded lists.
- **Filtering:** `?status=pending&project_id=abc`. Sorting: `?sort=-date,name`.
- **Rate limits:** 600/min per user, 60/min on mutations, 10/min on auth.
- **Idempotency:** `Idempotency-Key: <uuid>` header required on high-value mutating endpoints (invoice generation, expense submission, payment recording, CSV imports); optional elsewhere.
- **Conflict responses:** HTTP 409 with body `{"error": {"code": "VERSION_CONFLICT", "current_version": N, "your_version": M, "diff": [...]}}`, triggering the three-layer conflict resolution flow from section 3.1.
- **Entitlement responses:** HTTP 402 with body `{"error": {"code": "UPGRADE_REQUIRED", "feature_key": "...", "current_plan": "starter"}}`.
- **Errors (generic):**
  ```json
  {"error": {"code": "VALIDATION_FAILED", "message": "...", "details": [{"field": "email", "reason": "invalid"}]}}
  ```
- **Every mutation** returns the updated entity including the new `version`, so the client can immediately set up the next optimistic mutation.

### 9.1 Real-time transports (per-feature)

| Feature | Transport | Notes |
|---|---|---|
| Notifications feed | WebSocket | Single `/ws/notifications` per user, reconnect w/ exponential backoff. |
| Background job progress | SSE | `/api/v1/jobs/{job_id}/stream`, short-lived one stream per job. |
| Dashboard live numbers | TanStack Query polling | `refetchInterval: 30s` + `refetchOnWindowFocus`. |
| Everything else | Refetch on focus only | Zero push infrastructure. |

WebSocket uses FastAPI's `starlette.websockets`. Horizontal scale via Redis pub/sub deferred (DEF-048); single backend instance is fine for Phase 2-3.

---

## 10. Migrations, backfills, operational plumbing

### 10.1 Migration tool: Alembic

Alembic, standard Python/SQLAlchemy. Migration files in `backend/migrations/versions/`. Every migration requires a tested downgrade script; CI blocks merge on missing or broken downgrade.

### 10.2 N-schema orchestration: Celery fan-out

Migrations against N tenant schemas run via Celery fan-out, tracked in `public.alembic_runs`:

1. Deploy pipeline calls top-level task `run_migration(alembic_version)`.
2. Task fans out one Celery subtask per tenant schema.
3. Each subtask sets `search_path` to the tenant schema and runs Alembic.
4. Status written to `public.alembic_runs` row.
5. Deploy pipeline polls until all tenants report `succeeded` or any report `failed`.
6. Per-tenant failure is isolated and retryable individually via the operator console.

Designed to evolve into expand-migrate-contract (DEF-052) without rewriting the execution layer. Budget 2-3 days in Phase 2 for the runner + a fake-tenant test harness (spin up 10 fake schemas, run migration, verify all at new version).

### 10.3 Online DDL patterns (Postgres-native)

Written playbook in `docs/MIGRATION_PATTERNS.md` (to be written in Phase 2). Summary:

- Add column: `ADD COLUMN x NULL` (instant). Backfill chunked via a companion Celery task (see section 10.4). Then `ALTER COLUMN x SET NOT NULL` with validation.
- Add index: `CREATE INDEX CONCURRENTLY`.
- Drop column: two-deploy pattern. First deploy stops writing. Second deploy drops.
- Rename column: never. Add new, backfill, drop old.
- Change type: add new, backfill, swap, drop.

All patterns use Postgres features present since PG11. Zero extensions, zero vendor.

### 10.4 Backfills (chunked resumable Celery)

`public.alembic_backfills` tracks resumable chunked backfill progress. Each big-data migration gets a companion Celery task that processes 1000 rows per chunk, checkpoints `last_id` after each. Application code tolerates both null and populated values during the backfill window. DDL runs at deploy time (instant), backfill runs in background over hours.

### 10.5 Zero-downtime deploys (Cloud Run rolling)

Cloud Run native rolling deploy with gradual traffic shift (10% → 25% → 50% → 100%). Phase 3 adds automatic rollback on error-rate spike (DEF-053) once Cloud Monitoring metrics are baseline-calibrated.

### 10.6 Rollback plan (combined approach)

Documented in `docs/ROLLBACK_RUNBOOK.md` (to be written in Phase 2):

- **Code bugs:** Cloud Run traffic shift to previous revision (~30s).
- **Schema bugs caught fast:** Alembic downgrade + per-tenant Celery fan-out (reuses the same migration runner from section 10.2).
- **Schema bugs caught late:** two-deploy expand-contract pattern prevents this class by design.
- **Data loss:** Cloud SQL PITR within 7-day window.

Runbook tested once in Phase 3 by deliberately breaking a deploy in staging.

### 10.7 Schema drift detection

Cross-tenant schema drift is tracked via DEF-054. Phase 2 mitigation: weekly Celery job compares each tenant's schema fingerprint against the expected `alembic_version` from `public.alembic_runs`, alerts the founder on any drift.

---

## 11. Backup, DR, environments

### 11.1 Environments (three total, two GCP projects)

Three environments, two GCP projects:

- **local:** docker-compose on founder laptop. Postgres + Redis + MinIO (S3-compatible) containers.
- **staging:** dedicated GCP project (`gammahr-staging`). Cloud Run + Cloud SQL `db-f1-micro` + small Redis VM. Behind Cloudflare Access so only founder IP can reach it. Auto-deploys from `main` branch via GitHub Actions.
- **prod:** separate GCP project (`gammahr-prod`). Larger instances. Manual promotion from staging after smoke tests. Two-project split is blast-radius isolation.

### 11.2 Hosting infrastructure

| Component | Phase 2-5 | Phase 5+ upgrade path |
|---|---|---|
| Web tier | Cloud Run (autoscale to zero) | Unchanged |
| Database | Cloud SQL PostgreSQL 16 Regional HA | PgBouncer on Compute Engine VM (DEF-013) |
| Background workers | Celery on small Compute Engine VM | Unchanged |
| Cache/queue | Redis on Compute Engine `e2-micro` VM (€7/mo) | Memorystore when traffic justifies (DEF-019) |
| Object storage | Google Cloud Storage, `europe-west9` | Unchanged |
| Secrets | Google Secret Manager | Unchanged |
| Logs/metrics | Cloud Logging + Cloud Monitoring | Error fingerprint grouping (DEF-014) |
| Tracing | `request_id` correlation in logs | Cloud Trace when pain demands (DEF-015) |
| DNS/WAF/CDN | Cloudflare (free tier) | Unchanged |
| Repo/CI | GitHub + GitHub Actions | Unchanged |
| Email sending | Google Workspace SMTP Relay | Dedicated transactional provider (DEF-021) |
| AI | Vertex AI Gemini 2.5 Flash, EU region | Potential swap to Claude Haiku (DEF-046) |

Total monthly cost estimate Phase 2-3 (5 tenants): ~€80-150 all-in.

### 11.3 Backup and DR

- Cloud SQL automated backups + point-in-time recovery (7-day window).
- Weekly logical dumps per tenant schema to a separate GCS bucket with 30-day retention.
- Quarterly restore drill.
- RPO target: 5 minutes. RTO target: 1 hour. **These are goals, not measured baselines.**
- Legal-hold cold archive in `gammahr-legal-archive` GCS bucket with Object Versioning and retention policy lock. No delete permission even for service accounts. Only accessible via documented break-glass in the operator console.

---

## 12. Known gaps and operational follow-ups

These are work items that the locked plan depends on but that are not in the schema itself. They must be completed in Phase 2:

1. **Write `docs/MIGRATION_PATTERNS.md`** covering the Postgres-native online DDL playbook with worked examples (the patterns from section 10.3).
2. **Write `docs/ROLLBACK_RUNBOOK.md`** covering the rollback scenarios from section 10.6 (code bugs via Cloud Run revision revert, schema bugs via Alembic downgrade, late-caught bugs via expand-contract, data loss via PITR).
3. **Write `docs/DATA_RETENTION.md`** with the per-entity retention table from section 8.2 and the full legal citations (French accounting law L.102 B LPF for invoices, EU labor law for timesheets, etc.).
4. **Write `docs/BILLING_LIFECYCLE.md`** documenting the state transitions from section 7.4 and the middleware checks that enforce read-only / suspended / deleted states.
5. **Write `frontend/lib/optimistic.ts`** with the `useOptimisticMutation` wrapper that centralizes the three-layer 409 reconciliation (rollback, diff modal, retry) from section 3.1.
6. **Write `frontend/components/patterns/ConflictResolver.tsx`** used by every feature with optimistic mutations.
7. **Write `backend/app/ai/client.py`** as the single Vertex AI abstraction, with budget enforcement and rate limit gates from section 5.3.
8. **Write the migration runner** in `backend/migrations/runner.py` with the Celery fan-out and fake-tenant test harness from section 10.2.
9. **Write the `@gated_feature(key)` decorator** that calls entitlements + flags + kill switches in one place.
10. **Build the seed data** deterministic generator for the following structure:

    **People (201 total):**
      - 1 Owner (founding director)
      - 2 Admins (COO + Systems admin)
      - 4 Finance (CFO, Finance director, Accountant, Billing specialist)
      - 15 Managers (2 Delivery directors + 5 Senior PMs + 8 PMs)
      - 177 Employees (3 HR + 2 Recruiting + 25 Senior consultants + 80 Mid consultants + 60 Junior consultants + 7 Ops/support)
      - 2 Readonly (Auditor + Intern)

    **Clients and projects:**
      - 120 clients (30 large with 5+ projects each, 50 mid with 2-3, 40 small with 1)
        - At least one is HSBC UK (country_code='GB', currency='GBP') to exercise multi-currency billing
      - 260 projects (160 active, 70 completed, 30 pipeline)
      - 40 portal users (1 per large client contact)

    **Time:**
      - 52 weeks of timesheet data (1 full year)
      - ~28,000 timesheet entries (150 billable employees x 5 days x 52 weeks, mix billable/non-billable)
      - 700 leaves (450 approved, 150 pending, 100 rejected)
        Leave types: paid vacation, sick, personal, RTT (France), maternity/paternity

    **Expenses (~8,400 total):**
      All 201 employees, monthly:
        - Food/lunch allowance: 201 x 12 = 2,412 records
        - Transport at 50%: 201 x 12 = 2,412 records
        - Operator overhead (rent/utilities/internet share): 201 x 12 = 2,412 records
      Managers + seniors only (46 people):
        - Client travel (taxi, train, hotels): ~15 items/person/year = 690 records
        - Client meals/entertainment: ~8 items/person/year = 368 records
        - Client gifts/misc: ~3 items/person/year = 138 records
      Status mix: 60% approved, 25% pending, 10% reimbursed, 5% rejected

    **Invoices:**
      - 900/year (75/month): 50 draft, 200 sent, 600 paid, 50 overdue
      - HSBC UK invoices denominated in GBP; all others in EUR

    **Supporting data:**
      - 12 teams (by practice: Finance, Tech, Strategy, etc.)
      - 30 public holidays (FR + EU calendar, 1 year)
      - ~50,000 audit log entries (auto-generated from mutations)
      - 365 FX rate rows (EUR/USD/GBP/CHF daily)
      - ~500 notifications (unread, across all users)

All of these carry explicit references from sections above. None of them are blockers for starting Phase 2, but each one needs a dedicated half-day to full day of work.

---

## 13. Reference: full table list

For quick search during implementation. Tables marked **[PG_PARTMAN]** are partitioned monthly.

**Public schema (global):**

```
operators, operator_sessions, users, sessions, portal_users, portal_sessions,
webauthn_credentials, mfa_totp, oidc_providers, invitations,
tenants, fx_rates, invoice_sequences, subscription_invoices,
tenant_custom_contracts, tenant_entitlements, sub_processors, dpa_versions,
audit_log [PG_PARTMAN], ai_events [PG_PARTMAN], entity_revisions,
idempotency_keys, alembic_runs, alembic_backfills, feature_flags,
push_subscriptions, notifications, notification_preferences,
holidays, files
```

**Per-tenant schema:**

```
employees, teams, employee_compensation, employee_banking, employee_rates,
employee_documents, approval_delegations, employee_visibility (matview),
clients, client_contacts, projects, project_rates, project_allocations,
project_milestones, project_tasks, timesheet_weeks, timesheet_entries,
leave_types, leave_requests, leave_balances,
expense_categories, expenses, expense_receipts,
invoices, invoice_lines, invoice_payments,
ai_budgets, ai_command_history, ai_insights
```

---

**End of spec.** Cross-references:

- `docs/decisions/ADR-001-tenancy.md` - Schema-per-tenant rationale
- `docs/decisions/ADR-010-three-app-model.md` - Three-audience architecture
- `docs/DEFERRED_DECISIONS.md` - Items consciously deferred with DEF-NNN IDs
- `CLAUDE.md` - Project-wide hard rules and feel guide
- `specs/APP_BLUEPRINT.md` - Page-level feature inventory
