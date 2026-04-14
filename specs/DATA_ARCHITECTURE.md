# DATA ARCHITECTURE

> Entities, tenancy, API conventions. Source of truth for the data model.

---

## 1. Multi-tenancy

**Schema-per-tenant in PostgreSQL 16.**

- One cluster, one logical DB per environment.
- Shared `public` schema: `tenants`, `users`, `sessions`, `invitations`, `webauthn_credentials`, `mfa_totp`, `audit_log` (partitioned monthly), billing tables.
- Per-tenant schema (`tenant_<slug>`): every business entity below.
- FastAPI middleware extracts `tenant_id` from JWT, sets `SET search_path = tenant_<slug>, public` per request.
- Alembic runs public migrations once and tenant migrations per schema via a custom runner.

Rationale and alternatives: see `docs/decisions/ADR-001-tenancy.md`.

---

## 2. Entity catalog

All entities have `id uuid pk`, `created_at`, `updated_at`, `created_by`, `updated_by`. Soft delete via `deleted_at` only where stated.

### 2.1 Identity (public schema)

| Table | Key columns |
|-------|-------------|
| `tenants` | `slug` unique, `name`, `timezone`, `currency`, `fiscal_year_start`, `country`, `plan`, `status` |
| `users` | `tenant_id`, `email` (unique per tenant), `password_hash` nullable, `email_verified_at`, `mfa_enabled`, `status` |
| `sessions` | `user_id`, `refresh_token_hash`, `user_agent`, `ip`, `expires_at` |
| `invitations` | `tenant_id`, `email`, `role`, `token_hash`, `expires_at`, `accepted_at` |
| `webauthn_credentials` | `user_id`, `credential_id`, `public_key`, `sign_count`, `transports`, `label` |
| `mfa_totp` | `user_id`, `secret_encrypted`, `recovery_codes_hashed[]` |
| `audit_log` (partitioned monthly) | `tenant_id`, `actor_user_id`, `entity_type`, `entity_id`, `action`, `metadata jsonb`, `ip`, `occurred_at` |

### 2.2 People (tenant schema)

| Table | Key columns |
|-------|-------------|
| `employees` (soft-delete) | `user_id` nullable, `first_name`, `last_name`, `email`, `role_title`, `team_id`, `manager_id`, `start_date`, `end_date`, `status`, `employment_type`, `cost_per_hour`, `billable_rate`, `location`, `country` |
| `teams` | `name`, `description`, `lead_id` |
| `employee_documents` | `employee_id`, `type`, `name`, `file_url`, `expires_at` nullable |

### 2.3 Clients + projects (tenant schema)

| Table | Key columns |
|-------|-------------|
| `clients` (soft-delete) | `name`, `legal_name`, `vat_number`, `industry`, `status`, `account_manager_id`, `country`, `billing_address`, `billing_email` |
| `client_contacts` | `client_id`, `first_name`, `last_name`, `email`, `role` |
| `projects` (soft-delete) | `client_id`, `name`, `code`, `status`, `start_date`, `end_date`, `budget_amount`, `budget_hours`, `billing_type`, `billing_rate`, `project_manager_id` |
| `project_members` | `project_id`, `employee_id`, `role`, `allocation_pct`, `start_date`, `end_date` |
| `project_tasks` | `project_id`, `name`, `status`, `parent_task_id`, `due_date`, `assignee_id` |

### 2.4 Time (tenant schema)

| Table | Key columns |
|-------|-------------|
| `timesheets` | `employee_id`, `week_start_date`, `status`, `submitted_at`, `approved_at`, `approver_id`, `rejection_reason` |
| `timesheet_entries` | `timesheet_id`, `date`, `project_id`, `task_id`, `hours`, `description`, `billable` |

### 2.5 Leaves (tenant schema)

| Table | Key columns |
|-------|-------------|
| `leave_types` | `name`, `code`, `accrual_rate`, `max_balance`, `paid`, `color` |
| `leave_requests` | `employee_id`, `leave_type_id`, `start_date`, `end_date`, `days`, `status`, `reason`, `approver_id` |
| `leave_balances` | `employee_id`, `leave_type_id`, `year`, `accrued`, `used`, `pending`, `balance` |
| `public_holidays` | `country`, `date`, `name` |

### 2.6 Expenses (tenant schema)

| Table | Key columns |
|-------|-------------|
| `expense_categories` | `name`, `code`, `gl_account`, `tax_rate` |
| `expenses` | `employee_id`, `category_id`, `project_id` nullable, `client_id` nullable, `date`, `merchant`, `amount`, `currency`, `tax_amount`, `status`, `approver_id`, `reimbursement_status` |
| `expense_receipts` | `expense_id`, `file_url`, `ocr_json jsonb`, `ocr_confidence`, `uploaded_at` |

### 2.7 Invoices (tenant schema)

| Table | Key columns |
|-------|-------------|
| `invoices` | `client_id`, `number` unique per tenant, `issue_date`, `due_date`, `status`, `currency`, `subtotal`, `tax_total`, `total`, `sent_at`, `paid_at`, `pdf_url` |
| `invoice_lines` | `invoice_id`, `description`, `quantity`, `unit`, `unit_price`, `amount`, `project_id` nullable, `timesheet_entry_id` nullable, `expense_id` nullable |
| `invoice_payments` | `invoice_id`, `amount`, `method`, `reference`, `paid_at` |

### 2.8 AI (tenant schema)

| Table | Key columns |
|-------|-------------|
| `ai_insights` | `module`, `severity`, `title`, `body`, `entity_type`, `entity_id`, `generated_at`, `dismissed_at`, `acted_on_at` |
| `ai_events` | `user_id`, `feature`, `prompt_tokens`, `completion_tokens`, `latency_ms`, `cost_cents`, `occurred_at` |

---

## 3. Keys, indexes, integrity

- FKs `ON DELETE RESTRICT` except audit/telemetry (`CASCADE`).
- Composite indexes: `timesheet_entries(project_id, date)`, `expenses(employee_id, date)`, `invoices(client_id, status)`, `audit_log(tenant_id, occurred_at DESC)`.
- Partial indexes on `status` for hot filter paths.
- Timesheets, leaves, expenses, invoices are never hard-deleted once submitted.

---

## 4. RBAC

Role hierarchy (tenant-scoped):

| Role | Can do |
|------|--------|
| `admin` | Everything within tenant. Manage users, billing, settings. |
| `manager` | Approve time/leave/expense for direct reports. Read all projects. |
| `employee` | Submit own time/leave/expense. Read own profile + assigned projects. |
| `finance` | Read/write invoices. Read all time/expense. |
| `readonly` | Read-only access to dashboards and own data. |

Enforced via FastAPI dependency on every route. Row-level checks in service layer (e.g., manager can only approve items where `manager_id = current_user.employee_id` transitively).

---

## 5. API conventions

- REST under `/api/v1`. JSON only. ISO-8601 dates. Amounts in minor units (integer cents).
- Pagination: cursor-based for large collections, offset-based for short lists.
- Filtering: `?status=pending&project_id=abc`
- Sorting: `?sort=-date,name`
- Auth: `Authorization: Bearer <jwt>`. Tenant inferred from JWT.
- Rate limits: 600/min per user, 60/min on mutations, 10/min on auth.
- Idempotency: every POST creating a resource accepts `Idempotency-Key` header.
- Errors:
  ```json
  {"error": {"code": "VALIDATION_FAILED", "message": "...", "details": [{"field": "email", "reason": "invalid"}]}}
  ```

---

## 6. Migrations

- Alembic with a custom runner that iterates tenant schemas.
- Additive first: add column, backfill, flip, remove in a later migration.
- Tested against seed dataset (200 employees + 100 clients + 2000 projects + 50k timesheet entries) before merging.
- Public schema migrations run once; tenant migrations run per schema with a progress log.

---

## 7. Bulk onboarding pipeline

Target: 200 employees + 100 clients imported in under 1 hour end-to-end.

1. Upload CSV (streamed, up to 20 MB) -> stored at `s3://imports/{tenant_id}/{import_id}.csv`.
2. Backend parses first 5 rows, returns headers + sample.
3. Frontend shows AI-suggested column mapping. User confirms.
4. Celery job `imports.run` validates each row, collects errors.
5. On success, commits in batches of 500 rows per transaction.
6. Progress emitted via WebSocket.
7. Final report: N imported, M failed, error CSV download link.

**Performance targets (goals, not baselines):** 200 employees < 60 s; 1000 employees < 5 min; 5000 employees < 15 min.

**Idempotency:** entity dedupe by `email` (employees), `name` (clients), `client+code` (projects). Re-uploading the same CSV with the same `import_id` is a no-op.

---

## 8. Seed data

Deterministic seed for dev + tests + perf baselines:
- 1 admin, 5 managers, 195 employees
- 100 clients, 200 projects
- 40 weeks of timesheets
- 500 leave requests, 1000 expenses, 50 invoices

Used for query count assertions and perf regression tests.

---

## 9. Retention + deletion

- Tenant deletion: `DROP SCHEMA tenant_<slug> CASCADE`, audit log retained 90 days archived then purged.
- GDPR export: single endpoint returns a zip of all user-scoped data.
- Row-level export per entity available in Admin console.

---

## 10. Backup + DR

- Managed PostgreSQL with PITR (7 days).
- Nightly logical dump per tenant schema to S3, 30-day retention.
- Quarterly restore drill.
- RPO 5 min. RTO 1 hour.
