# GammaHR v2 — Data Architecture & API Design

> Every entity. Every relationship. Every endpoint. Every real-time channel.

> **Prototype:** The canonical seed data below maps exactly to the data shown in `/prototype/` HTML files.

---

## 1. Multi-Tenancy: Schema-Per-Tenant

### How it Works

```
HTTP Request
  └─ JWT contains: { tenant_id: "acme", user_id: "...", role: "admin" }
      └─ Middleware extracts tenant_id
          └─ Sets PostgreSQL search_path = "tenant_acme, public"
              └─ All queries automatically scoped to tenant schema

Public Schema (shared):
  ├── tenants           — Tenant registry
  ├── tenant_configs    — Per-tenant feature flags, plan limits
  ├── billing           — Subscription, invoices (for SaaS billing)
  └── system_config     — Global settings

Tenant Schema (per company):
  ├── users
  ├── departments
  ├── department_managers
  ├── leave_types
  ├── leave_balances
  ├── leave_requests
  ├── expense_types
  ├── expenses
  ├── clients
  ├── projects
  ├── project_assignments
  ├── project_milestones
  ├── project_join_requests
  ├── timesheet_batches
  ├── timesheet_entries
  ├── invoices
  ├── invoice_line_items
  ├── notifications
  ├── audit_logs
  ├── comments
  ├── documents
  ├── skills
  ├── user_skills
  ├── saved_views
  ├── company_holidays
  └── user_preferences
```

### Tenant Lifecycle

```
1. Company Registration
   └─ Create row in public.tenants
   └─ CREATE SCHEMA tenant_{slug}
   └─ Run all migrations on new schema
   └─ Create admin user in tenant schema
   └─ Seed default data (leave types, expense types, holidays)

2. Tenant Migration
   └─ For each tenant in public.tenants:
       └─ SET search_path = tenant_{slug}
       └─ Run pending migrations

3. Tenant Deletion (GDPR)
   └─ Mark tenant as "deleting" in public.tenants
   └─ Export all data (GDPR data portability)
   └─ DROP SCHEMA tenant_{slug} CASCADE
   └─ Remove row from public.tenants
```

---

## 2. Complete Entity Model

### 2.1 Core Entities

```sql
-- public schema
CREATE TABLE tenants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(64) UNIQUE NOT NULL,  -- "acme" → schema "tenant_acme"
    name            VARCHAR(255) NOT NULL,
    industry        VARCHAR(100),
    size_tier       VARCHAR(20),  -- 'small', 'medium', 'large', 'enterprise'
    country         VARCHAR(3),   -- ISO 3166-1 alpha-3
    plan            VARCHAR(20) DEFAULT 'trial',  -- 'trial', 'starter', 'pro', 'enterprise'
    status          VARCHAR(20) DEFAULT 'active',  -- 'active', 'suspended', 'deleting'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.2 Users & Organization

```sql
-- tenant schema
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(255) UNIQUE NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,  -- Argon2id
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    role                VARCHAR(20) NOT NULL DEFAULT 'employee',
                        -- 'admin', 'project_manager', 'employee'
    department_id       UUID REFERENCES departments(id),
    job_title           VARCHAR(200),
    phone               VARCHAR(50),
    bio                 TEXT,
    profile_photo_url   VARCHAR(500),
    start_date          DATE,
    locale              VARCHAR(5) DEFAULT 'en',  -- 'en', 'fr'
    timezone            VARCHAR(50) DEFAULT 'Europe/Paris',
    is_active           BOOLEAN DEFAULT true,
    is_billable         BOOLEAN DEFAULT true,     -- NEW: default billing status
    default_hourly_rate DECIMAL(10,2),            -- NEW: default rate
    default_daily_rate  DECIMAL(10,2),            -- NEW: default daily rate

    -- MFA
    mfa_enabled         BOOLEAN DEFAULT false,
    mfa_secret_enc      BYTEA,

    -- WebAuthn
    webauthn_credentials JSONB DEFAULT '[]',

    -- Metadata
    last_login_at       TIMESTAMPTZ,
    last_active_at      TIMESTAMPTZ,             -- NEW: for presence
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ              -- Soft delete
);

CREATE TABLE departments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    parent_id       UUID REFERENCES departments(id),  -- NEW: hierarchy
    head_id         UUID REFERENCES users(id),        -- NEW: department head
    cost_center     VARCHAR(50),                      -- NEW: financial tracking
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE department_managers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id   UUID NOT NULL REFERENCES departments(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(department_id, user_id)
);

-- NEW: Skills system
CREATE TABLE skills (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) UNIQUE NOT NULL,
    category        VARCHAR(100),  -- 'programming', 'design', 'management', etc.
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_skills (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    skill_id        UUID NOT NULL REFERENCES skills(id),
    proficiency     VARCHAR(20) DEFAULT 'intermediate',
                    -- 'beginner', 'intermediate', 'advanced', 'expert'
    added_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, skill_id)
);

-- NEW: User documents
CREATE TABLE documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    name            VARCHAR(255) NOT NULL,
    file_url        VARCHAR(500) NOT NULL,
    file_type       VARCHAR(50),  -- 'pdf', 'jpg', etc.
    file_size       BIGINT,       -- bytes
    category        VARCHAR(100), -- 'contract', 'id', 'certification', etc.
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.3 Leave Management

```sql
CREATE TABLE leave_types (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    VARCHAR(100) NOT NULL,
    color                   VARCHAR(7),        -- Hex color for calendar
    icon                    VARCHAR(50),       -- Lucide icon name
    default_annual_balance  DECIMAL(5,1),      -- e.g., 25.0 days
    deducts_balance         BOOLEAN DEFAULT true,
    requires_approval       BOOLEAN DEFAULT true,
    max_consecutive_days    INTEGER,           -- NEW: policy enforcement
    min_advance_days        INTEGER,           -- NEW: must request N days ahead
    carryover_max           DECIMAL(5,1),      -- NEW: max days to carry over
    accrual_rate            DECIMAL(5,2),      -- NEW: days accrued per month
    is_active               BOOLEAN DEFAULT true,
    sort_order              INTEGER DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE leave_balances (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    leave_type_id   UUID NOT NULL REFERENCES leave_types(id),
    year            INTEGER NOT NULL,
    total           DECIMAL(5,1) NOT NULL,
    used            DECIMAL(5,1) NOT NULL DEFAULT 0,
    pending         DECIMAL(5,1) NOT NULL DEFAULT 0,  -- NEW: pending requests
    carried_over    DECIMAL(5,1) NOT NULL DEFAULT 0,  -- NEW: from last year
    UNIQUE(user_id, leave_type_id, year)
);

CREATE TABLE leave_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    leave_type_id   UUID NOT NULL REFERENCES leave_types(id),
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    working_days    DECIMAL(5,1) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
                    -- 'pending', 'approved', 'rejected', 'cancelled'
    notes           TEXT,
    rejection_reason TEXT,
    approved_by     UUID REFERENCES users(id),
    approved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT no_self_approval CHECK (approved_by IS NULL OR approved_by != user_id)
);
```

### 2.4 Expense Management

```sql
CREATE TABLE expense_types (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                     VARCHAR(100) NOT NULL,
    icon                     VARCHAR(50),
    max_amount               DECIMAL(10,2),       -- Policy: max per expense
    daily_limit              DECIMAL(10,2),        -- NEW: daily spending cap
    requires_receipt         BOOLEAN DEFAULT false,
    receipt_threshold_amount DECIMAL(10,2),
    requires_project         BOOLEAN DEFAULT false, -- NEW: must link to project
    is_active                BOOLEAN DEFAULT true,
    sort_order               INTEGER DEFAULT 0,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE expenses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    expense_type_id UUID NOT NULL REFERENCES expense_types(id),
    project_id      UUID REFERENCES projects(id),
    amount_cents    BIGINT NOT NULL,             -- Store in cents for precision
    currency        VARCHAR(3) NOT NULL DEFAULT 'EUR',
    expense_date    DATE NOT NULL,
    description     TEXT,
    is_billable     BOOLEAN DEFAULT false,
    receipt_url     VARCHAR(500),
    receipt_ocr     JSONB,                       -- NEW: AI-extracted data
    status          VARCHAR(20) NOT NULL DEFAULT 'submitted',
                    -- 'draft', 'submitted', 'approved', 'rejected'
    rejection_reason TEXT,
    approved_by     UUID REFERENCES users(id),
    approved_at     TIMESTAMPTZ,

    -- AI features
    ai_category_suggestion  VARCHAR(100),        -- NEW: AI suggested category
    ai_anomaly_score        DECIMAL(3,2),        -- NEW: 0.0-1.0 anomaly probability
    ai_duplicate_of         UUID REFERENCES expenses(id), -- NEW: potential duplicate

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT no_self_approval CHECK (approved_by IS NULL OR approved_by != user_id)
);
```

### 2.5 Projects & Clients

```sql
CREATE TABLE clients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    logo_url        VARCHAR(500),               -- NEW: client logo
    industry        VARCHAR(100),               -- NEW
    website         VARCHAR(500),               -- NEW
    address         TEXT,                        -- NEW
    notes           TEXT,                        -- NEW
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ
);

-- NEW: Client contacts
CREATE TABLE client_contacts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID NOT NULL REFERENCES clients(id),
    name            VARCHAR(200) NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(50),
    role            VARCHAR(100),  -- "CTO", "Project Sponsor", etc.
    is_primary      BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NEW: Client portal users
CREATE TABLE client_portal_users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID NOT NULL REFERENCES clients(id),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(200) NOT NULL,
    is_active       BOOLEAN DEFAULT true,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projects (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id           UUID REFERENCES clients(id),
    name                VARCHAR(255) NOT NULL,
    description         TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'planning',
                        -- 'planning', 'active', 'on_hold', 'completed', 'archived'
    billing_model       VARCHAR(20) NOT NULL DEFAULT 'hourly',
                        -- 'hourly', 'daily', 'fixed', 'lump_sum', 'retainer'
    hourly_rate         DECIMAL(10,2),           -- Default for project
    daily_rate          DECIMAL(10,2),
    fixed_monthly_fee   DECIMAL(10,2),
    lump_sum_amount     DECIMAL(10,2),
    retainer_hours      DECIMAL(5,1),            -- NEW: monthly retainer hours
    budget_amount       DECIMAL(12,2),           -- NEW: total budget
    budget_consumed     DECIMAL(12,2) DEFAULT 0, -- NEW: running total
    currency            VARCHAR(3) DEFAULT 'EUR',
    start_date          DATE NOT NULL,
    end_date            DATE,
    health              VARCHAR(20) DEFAULT 'on_track',
                        -- 'on_track', 'at_risk', 'off_track'
    color               VARCHAR(7),              -- Hex for Gantt chart
    is_billable         BOOLEAN DEFAULT true,    -- NEW
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ
);

CREATE TABLE project_assignments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    role            VARCHAR(100),               -- "Lead Developer", "Contributor"
    hourly_rate     DECIMAL(10,2),              -- Override user's default
    daily_rate      DECIMAL(10,2),
    allocation_pct  DECIMAL(5,2) DEFAULT 100,   -- NEW: 50% = half-time
    start_date      DATE NOT NULL,
    end_date        DATE,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(project_id, user_id, start_date)     -- Prevent duplicate overlapping
);

-- NEW: Project milestones
CREATE TABLE project_milestones (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    due_date        DATE,
    status          VARCHAR(20) DEFAULT 'upcoming',
                    -- 'upcoming', 'in_progress', 'completed', 'overdue'
    completed_at    TIMESTAMPTZ,
    amount          DECIMAL(10,2),              -- For milestone-based billing
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE project_join_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    request_type    VARCHAR(10) NOT NULL,  -- 'join', 'leave'
    status          VARCHAR(20) DEFAULT 'pending',
    message         TEXT,
    decided_by      UUID REFERENCES users(id),
    decided_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.6 Timesheets

```sql
CREATE TABLE timesheet_batches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    period_start    DATE NOT NULL,
    period_end      DATE NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'draft',
                    -- 'draft', 'submitted', 'approved', 'rejected'
    total_hours     DECIMAL(6,1) NOT NULL DEFAULT 0,
    billable_hours  DECIMAL(6,1) NOT NULL DEFAULT 0,  -- NEW
    notes           TEXT,
    rejection_reason TEXT,
    submitted_at    TIMESTAMPTZ,
    approved_by     UUID REFERENCES users(id),
    approved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT no_self_approval CHECK (approved_by IS NULL OR approved_by != user_id)
);

CREATE TABLE timesheet_entries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id        UUID NOT NULL REFERENCES timesheet_batches(id) ON DELETE CASCADE,
    project_id      UUID NOT NULL REFERENCES projects(id),
    entry_date      DATE NOT NULL,
    hours           DECIMAL(4,1) NOT NULL,
    description     TEXT,                       -- NEW: daily note
    is_billable     BOOLEAN DEFAULT true,       -- NEW: per-entry billable flag
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT valid_hours CHECK (hours >= 0 AND hours <= 24),
    UNIQUE(batch_id, project_id, entry_date)
);
```

### 2.7 Invoicing

```sql
CREATE TABLE invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number  VARCHAR(50) UNIQUE NOT NULL,  -- "INV-2026-042"
    client_id       UUID NOT NULL REFERENCES clients(id),
    project_id      UUID REFERENCES projects(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'draft',
                    -- 'generating', 'draft', 'sent', 'paid', 'overdue', 'cancelled'
    amount_cents    BIGINT NOT NULL DEFAULT 0,
    tax_rate        DECIMAL(5,2) DEFAULT 0,       -- NEW: tax
    tax_amount_cents BIGINT DEFAULT 0,
    total_cents     BIGINT NOT NULL DEFAULT 0,    -- amount + tax
    currency        VARCHAR(3) DEFAULT 'EUR',
    issue_date      DATE,
    due_date        DATE,
    paid_at         TIMESTAMPTZ,
    payment_terms   VARCHAR(100),                 -- "Net 30", "Due on receipt"
    notes           TEXT,
    pdf_url         VARCHAR(500),
    sent_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE invoice_line_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    type            VARCHAR(20) NOT NULL,
                    -- 'timesheet', 'daily', 'expense', 'fixed', 'milestone', 'adjustment'
    description     TEXT NOT NULL,
    quantity        DECIMAL(8,2),               -- Hours or days
    unit_price_cents BIGINT,                     -- Rate per unit
    amount_cents    BIGINT NOT NULL,
    employee_id     UUID REFERENCES users(id),  -- Who did the work
    project_id      UUID REFERENCES projects(id),
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.8 Notifications & Activity

```sql
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    type            VARCHAR(50) NOT NULL,
                    -- 'leave_approved', 'leave_rejected', 'expense_approved',
                    -- 'timesheet_submitted', 'assignment_added', 'invoice_paid',
                    -- 'mention', 'ai_insight', 'system'
    title           VARCHAR(255) NOT NULL,
    body            TEXT,
    entity_type     VARCHAR(50),  -- 'leave_request', 'expense', 'project', etc.
    entity_id       UUID,         -- ID of related entity
    action_url      VARCHAR(500), -- Deep link to relevant page
    is_read         BOOLEAN DEFAULT false,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast unread count
CREATE INDEX idx_notifications_user_unread
    ON notifications(user_id, is_read) WHERE is_read = false;

CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),  -- NULL for system actions
    action          VARCHAR(50) NOT NULL,         -- 'create', 'update', 'delete', 'approve'
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       UUID NOT NULL,
    changes         JSONB,                        -- { "field": { "old": X, "new": Y } }
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Partitioned by month for performance
-- CREATE TABLE audit_logs ... PARTITION BY RANGE (created_at);

-- NEW: Comments (on any entity)
CREATE TABLE comments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    entity_type     VARCHAR(50) NOT NULL,  -- 'project', 'leave_request', 'expense', etc.
    entity_id       UUID NOT NULL,
    body            TEXT NOT NULL,
    parent_id       UUID REFERENCES comments(id),  -- Threaded replies
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 2.9 Configuration & Preferences

```sql
-- NEW: Company holidays
CREATE TABLE company_holidays (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    date            DATE NOT NULL,
    is_half_day     BOOLEAN DEFAULT false,
    recurring       BOOLEAN DEFAULT true,  -- Same date every year
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(date)
);

-- NEW: Company settings
CREATE TABLE company_settings (
    key             VARCHAR(100) PRIMARY KEY,
    value           JSONB NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Keys: 'fiscal_year_start', 'work_hours_per_day', 'work_days',
--        'default_currency', 'overtime_rules', 'approval_chain', etc.

-- NEW: Saved filter views
CREATE TABLE saved_views (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    name            VARCHAR(200) NOT NULL,
    view_type       VARCHAR(50) NOT NULL,  -- 'gantt', 'employees', 'projects', etc.
    filters         JSONB NOT NULL,         -- Serialized filter state
    is_shared       BOOLEAN DEFAULT false,
    is_default      BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NEW: User notification preferences
CREATE TABLE user_preferences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID UNIQUE NOT NULL REFERENCES users(id),
    theme           VARCHAR(10) DEFAULT 'dark',  -- 'dark', 'light', 'auto'
    notifications   JSONB DEFAULT '{
        "email_leave_approved": true,
        "email_leave_rejected": true,
        "email_expense_approved": true,
        "email_timesheet_reminder": true,
        "email_assignment": true,
        "push_all": true,
        "digest_weekly": false
    }',
    dashboard_layout JSONB,  -- Custom widget arrangement
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 3. Entity Relationship Diagram

```
                        ┌──────────────┐
                        │   tenants    │ (public schema)
                        └──────┬───────┘
                               │ 1:many schemas
                               ▼
    ┌──────────────────────────────────────────────────────┐
    │                  TENANT SCHEMA                        │
    │                                                      │
    │  ┌────────────┐     ┌──────────────┐                │
    │  │departments │◄────│dept_managers  │                │
    │  │ (tree)     │     └──────┬───────┘                │
    │  └─────┬──────┘            │                         │
    │        │ 1:many            │ many:many               │
    │        ▼                   ▼                         │
    │  ┌──────────┐    ┌──────────────┐                   │
    │  │  users   │◄───│ user_skills  │──►┌────────┐     │
    │  └──┬───────┘    └──────────────┘   │ skills │     │
    │     │                                └────────┘     │
    │     │ 1:many for each arrow below                   │
    │     │                                                │
    │     ├──►┌────────────────┐                          │
    │     │   │leave_requests  │◄── leave_types            │
    │     │   └────────────────┘    leave_balances         │
    │     │                                                │
    │     ├──►┌────────────┐                              │
    │     │   │ expenses   │◄── expense_types              │
    │     │   └────────────┘                              │
    │     │                                                │
    │     ├──►┌──────────────────┐                        │
    │     │   │timesheet_batches │                         │
    │     │   └───────┬──────────┘                        │
    │     │           │ 1:many                             │
    │     │           ▼                                    │
    │     │   ┌──────────────────┐                        │
    │     │   │timesheet_entries │──►┐                    │
    │     │   └──────────────────┘   │                    │
    │     │                          ▼                    │
    │     ├──►┌─────────────────────────┐                 │
    │     │   │ project_assignments     │                  │
    │     │   └────────┬────────────────┘                 │
    │     │            │ many:1                            │
    │     │            ▼                                   │
    │     │   ┌──────────┐     ┌──────────┐              │
    │     │   │ projects │◄────│ clients  │              │
    │     │   └────┬─────┘     └────┬─────┘              │
    │     │        │                │                      │
    │     │        │ 1:many         │ 1:many               │
    │     │        ▼                ▼                      │
    │     │   ┌──────────┐  ┌──────────────────┐         │
    │     │   │milestones│  │client_contacts   │         │
    │     │   └──────────┘  │client_portal_usrs│         │
    │     │                  └──────────────────┘         │
    │     │                                                │
    │     ├──►┌──────────────┐                            │
    │     │   │notifications │                             │
    │     │   └──────────────┘                            │
    │     │                                                │
    │     ├──►┌──────────────┐                            │
    │     │   │ audit_logs   │                             │
    │     │   └──────────────┘                            │
    │     │                                                │
    │     ├──►┌──────────────┐                            │
    │     │   │  comments    │ (polymorphic: any entity)  │
    │     │   └──────────────┘                            │
    │     │                                                │
    │     ├──►┌──────────────┐                            │
    │     │   │  documents   │                             │
    │     │   └──────────────┘                            │
    │     │                                                │
    │     └──►┌──────────────┐                            │
    │         │ saved_views  │                             │
    │         └──────────────┘                            │
    │                                                      │
    │  ┌────────────────────┐                             │
    │  │invoices            │◄── clients, projects        │
    │  └───────┬────────────┘                             │
    │          │ 1:many                                    │
    │          ▼                                           │
    │  ┌────────────────────┐                             │
    │  │invoice_line_items  │◄── users (employee_id)      │
    │  └────────────────────┘                             │
    │                                                      │
    │  ┌────────────────────┐                             │
    │  │company_holidays    │                              │
    │  │company_settings    │                              │
    │  │user_preferences    │                              │
    │  └────────────────────┘                             │
    └──────────────────────────────────────────────────────┘
```

---

## 4. API Design (REST + WebSocket)

### 4.1 API Conventions

```
Base URL: /api/v2

Authentication: Bearer token (JWT) in Authorization header
Tenant: Extracted from JWT claims (no tenant in URL)

Request format: JSON
Response format: JSON

Pagination:
  ?page=1&per_page=25           (offset-based)
  ?cursor=abc123&per_page=25    (cursor-based for real-time lists)

Filtering:
  ?filter[status]=active,pending
  ?filter[department_id]=uuid
  ?filter[date_from]=2026-01-01
  ?filter[date_to]=2026-03-31

Sorting:
  ?sort=name              (ascending)
  ?sort=-created_at       (descending)
  ?sort=department,-name  (multi-sort)

Searching:
  ?search=sarah+chen

Including related data:
  ?include=department,skills,active_projects

Sparse fields:
  ?fields[users]=id,name,email,role
```

### 4.2 Complete Endpoint Catalog

#### Authentication (`/api/v2/auth`)

```
POST   /auth/register          — Create company + admin (public)
POST   /auth/login             — Email + password → JWT + refresh
POST   /auth/login/webauthn    — WebAuthn passwordless login
POST   /auth/refresh           — Rotate refresh token
POST   /auth/logout            — Revoke refresh token
POST   /auth/forgot-password   — Request password reset email
POST   /auth/reset-password    — Reset with token
POST   /auth/change-password   — Authenticated password change
POST   /auth/mfa/setup         — Generate TOTP secret + QR
POST   /auth/mfa/verify        — Verify TOTP code → enable MFA
DELETE /auth/mfa               — Disable MFA
POST   /auth/webauthn/register — Register new passkey
DELETE /auth/webauthn/:id      — Remove passkey
GET    /auth/sessions          — List active sessions
DELETE /auth/sessions/:id      — Revoke specific session
```

#### Users (`/api/v2/users`)

```
GET    /users/me               — Current user profile
PATCH  /users/me               — Update own profile
GET    /users/me/preferences   — Notification & UI preferences
PATCH  /users/me/preferences   — Update preferences
GET    /users                  — List users (filterable, searchable)
POST   /users                  — Create user (admin invite)
GET    /users/:id              — User detail (+ include: department, skills, projects)
PATCH  /users/:id              — Update user (admin)
DELETE /users/:id              — Soft delete (admin)
POST   /users/:id/reactivate  — Reactivate soft-deleted user
POST   /users/invite           — Send invite email (bulk)
GET    /users/:id/timeline     — Employee timeline events
GET    /users/:id/availability — Availability for date range
```

#### Departments (`/api/v2/departments`)

```
GET    /departments            — List (tree structure)
POST   /departments            — Create
PATCH  /departments/:id        — Update
DELETE /departments/:id        — Delete (if empty)
GET    /departments/:id/members — List department members
POST   /departments/:id/managers — Add manager
DELETE /departments/:id/managers/:user_id — Remove manager
```

#### Skills (`/api/v2/skills`)

```
GET    /skills                 — List all skills (with usage count)
POST   /skills                 — Create skill
DELETE /skills/:id             — Delete skill
POST   /users/:id/skills      — Add skill to user
DELETE /users/:id/skills/:skill_id — Remove skill from user
GET    /skills/:id/users       — Find users with this skill
```

#### Leaves (`/api/v2/leaves`)

```
GET    /leaves/types           — Leave type list
POST   /leaves/types           — Create type (admin)
PATCH  /leaves/types/:id       — Update type (admin)
GET    /leaves/balances        — Current user's balances
GET    /leaves/balances/:user_id — Specific user's balances (PM/Admin)
GET    /leaves/requests        — List requests (scoped by role)
POST   /leaves/requests        — Create request
GET    /leaves/requests/:id    — Request detail
PATCH  /leaves/requests/:id    — Update status (approve/reject/cancel)
GET    /leaves/conflicts       — Check for team conflicts on date range
GET    /leaves/calendar        — Team leave calendar (date range)
```

#### Expenses (`/api/v2/expenses`)

```
GET    /expenses/types         — Expense type list
POST   /expenses/types         — Create type (admin)
PATCH  /expenses/types/:id     — Update type
GET    /expenses               — List expenses (scoped by role)
POST   /expenses               — Create expense
GET    /expenses/:id           — Expense detail
PATCH  /expenses/:id           — Update (if draft/submitted)
DELETE /expenses/:id           — Delete (if draft)
PATCH  /expenses/:id/status    — Approve/reject
POST   /expenses/:id/upload-url — Get S3 presigned URL for receipt
POST   /expenses/:id/ocr       — Trigger AI receipt processing
GET    /expenses/analytics     — Expense analytics (charts data)
GET    /expenses/duplicates    — AI-detected potential duplicates
```

#### Projects (`/api/v2/projects`)

```
GET    /projects               — List projects (filterable)
POST   /projects               — Create project
GET    /projects/:id           — Project detail (+ include: team, milestones)
PATCH  /projects/:id           — Update project
DELETE /projects/:id           — Archive/soft delete
GET    /projects/:id/team      — Team assignments
POST   /projects/:id/team      — Add assignment
PATCH  /projects/:id/team/:assignment_id — Update assignment
DELETE /projects/:id/team/:assignment_id — Remove assignment
GET    /projects/:id/timesheets — Project timesheet entries
GET    /projects/:id/expenses  — Project expenses
GET    /projects/:id/invoices  — Project invoices
GET    /projects/:id/burndown  — Budget burndown data
GET    /projects/:id/milestones — Project milestones
POST   /projects/:id/milestones — Create milestone
PATCH  /projects/:id/milestones/:mid — Update milestone
DELETE /projects/:id/milestones/:mid — Delete milestone
POST   /projects/:id/join      — Request to join (employee)
GET    /projects/:id/join-requests — Pending join requests
PATCH  /projects/:id/join-requests/:rid — Approve/reject
```

#### Timesheets (`/api/v2/timesheets`)

```
GET    /timesheets             — List batches (filterable)
POST   /timesheets             — Create batch (draft or submitted)
GET    /timesheets/:id         — Batch detail with entries
PATCH  /timesheets/:id         — Update batch (if draft)
PATCH  /timesheets/:id/status  — Submit/approve/reject
POST   /timesheets/:id/copy    — Copy from previous period
GET    /timesheets/week        — Get current week's entries (create if needed)
PUT    /timesheets/week/:date  — Upsert entry for specific date+project
GET    /timesheets/summary     — Monthly summary for current user
```

#### Clients (`/api/v2/clients`)

```
GET    /clients                — List clients
POST   /clients                — Create client
GET    /clients/:id            — Client detail (+ include: projects, contacts)
PATCH  /clients/:id            — Update client
DELETE /clients/:id            — Soft delete
GET    /clients/:id/contacts   — Client contacts
POST   /clients/:id/contacts   — Add contact
PATCH  /clients/:id/contacts/:cid — Update contact
DELETE /clients/:id/contacts/:cid — Delete contact
GET    /clients/:id/revenue    — Revenue analytics for client
POST   /clients/:id/portal-users — Create portal user
```

#### Invoices (`/api/v2/invoices`)

```
GET    /invoices               — List invoices
POST   /invoices/generate      — Generate from timesheets + expenses
GET    /invoices/:id           — Invoice detail with line items
PATCH  /invoices/:id           — Update (draft only: edit lines, notes)
PATCH  /invoices/:id/status    — Send/mark paid/cancel
GET    /invoices/:id/pdf       — Download PDF
POST   /invoices/:id/send      — Send to client (email + portal)
GET    /invoices/overdue       — Overdue invoices list
```

#### Calendar (`/api/v2/calendar`)

```
GET    /calendar               — Unified calendar events
                               ?from=2026-04-01&to=2026-04-30
                               &types=leaves,assignments,holidays,milestones
```

#### Gantt / Resource Planning (`/api/v2/planning`)

```
GET    /planning/gantt         — Resource Gantt data
                               ?from=2026-04-01&to=2026-06-30
                               &department_id=...
                               &client_id=...
                               &project_id=...
                               &billing_status=billable
                               &availability=bench
                               &skills=react,rust
GET    /planning/capacity      — Capacity overview (date range)
GET    /planning/bench         — Current bench employees
GET    /planning/forecast      — Staffing forecast
POST   /planning/scenarios     — What-if scenario calculation
```

#### AI Insights (`/api/v2/insights`)

```
GET    /insights               — Active AI insights/alerts
POST   /insights/dismiss/:id   — Dismiss insight
POST   /insights/query         — Natural language query
                               { "query": "Who has the most overtime this month?" }
GET    /insights/analytics/:type — Analytics data
                               Types: utilization, revenue, expenses, leave_patterns,
                                      team_performance, client_health
```

#### Search (`/api/v2/search`)

```
GET    /search?q=sarah&types=users,projects,clients,invoices
```

#### Notifications (`/api/v2/notifications`)

```
GET    /notifications          — List (paginated, filterable)
GET    /notifications/unread-count — Count of unread
PATCH  /notifications/:id/read — Mark as read
POST   /notifications/read-all — Mark all as read
```

#### Audit (`/api/v2/audit-logs`)

```
GET    /audit-logs             — List (admin, filterable by entity, user, date)
```

#### Documents (`/api/v2/documents`)

```
POST   /users/:id/documents/upload-url — Get presigned URL
POST   /users/:id/documents    — Register uploaded document
GET    /users/:id/documents    — List user's documents
DELETE /documents/:id          — Delete document
```

#### Company Settings (`/api/v2/settings`)

```
GET    /settings               — All company settings
PATCH  /settings               — Update settings
GET    /settings/holidays      — Company holidays
POST   /settings/holidays      — Add holiday
PATCH  /settings/holidays/:id  — Update holiday
DELETE /settings/holidays/:id  — Delete holiday
POST   /settings/holidays/import — Import standard holidays by country
```

#### Health (`/api/v2/health`)

```
GET    /health                 — System health check
GET    /health/ready           — Readiness check (DB, Redis, S3, Meilisearch)
```

---

## 5. WebSocket Protocol

### Connection

```
ws://api.gammahr.com/ws?token=<JWT>

On connect:
  Server: { "type": "connected", "user_id": "...", "tenant_id": "..." }
  Server: { "type": "presence_snapshot", "users": [...] }
```

### Message Types

```typescript
// Client → Server
type ClientMessage =
  | { type: "subscribe", channel: string }
  | { type: "unsubscribe", channel: string }
  | { type: "presence_update", status: "online" | "away" | "busy", page: string }
  | { type: "heartbeat" }
  | { type: "typing", channel: string, entity_type: string, entity_id: string }

// Server → Client
type ServerMessage =
  | { type: "connected", user_id: string, tenant_id: string }
  | { type: "presence_snapshot", users: PresenceUser[] }
  | { type: "presence_update", user_id: string, status: string, page: string }
  | { type: "presence_left", user_id: string }
  | { type: "entity_created", entity_type: string, entity_id: string, data: any }
  | { type: "entity_updated", entity_type: string, entity_id: string, changes: any }
  | { type: "entity_deleted", entity_type: string, entity_id: string }
  | { type: "notification", notification: Notification }
  | { type: "typing", user_id: string, entity_type: string, entity_id: string }
  | { type: "counter_update", counter: string, value: number }
  | { type: "ai_insight", insight: Insight }
  | { type: "heartbeat_ack" }
  | { type: "error", code: string, message: string }
```

### Channels

```
tenant:{tenant_id}:presence       — All presence updates for tenant
user:{user_id}                    — Personal notifications, approvals
entity:leave_request:{id}         — Updates to specific leave request
entity:project:{id}               — Project updates (team, milestones)
entity:timesheet:{id}             — Timesheet collaborative editing
page:/team/{user_id}              — "Who else is viewing this page"
role:admin:approvals              — New approval items for admins
role:pm:approvals                 — New approval items for PMs
counter:approvals:{user_id}       — Live pending approval count
```

### Presence System

```
1. Client connects → sends presence_update with status="online" and current page
2. Every 30 seconds → client sends heartbeat
3. Server marks user as "away" after 5 minutes without heartbeat
4. Server marks user as "offline" after 2 minutes without any message
5. Page navigation → client sends presence_update with new page
6. "X is also viewing this page" → server tracks page viewers, broadcasts to channel
```

---

## 6. AI Integration Architecture

```
┌────────────────────────────────────────────────┐
│              AI Feature Pipeline                │
│                                                │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│  │ Receipt  │    │  Claude  │    │ Result   │ │
│  │ Upload   │───►│   API    │───►│ Storage  │ │
│  │          │    │          │    │          │ │
│  │ Expense  │    │ OCR      │    │ expense  │ │
│  │ Image    │    │ Extract  │    │.receipt  │ │
│  └──────────┘    │ Vendor   │    │_ocr JSONB│ │
│                  │ Amount   │    └──────────┘ │
│  ┌──────────┐    │ Date     │                 │
│  │ NL Query │───►│ Category │    ┌──────────┐ │
│  │ "Who had │    └──────────┘───►│ Response │ │
│  │  most    │                    │ to user  │ │
│  │  hours?" │                    └──────────┘ │
│  └──────────┘                                 │
│                                                │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│  │ Nightly  │    │ Anomaly  │    │ Insights │ │
│  │ Batch    │───►│ Detection│───►│ Table    │ │
│  │ Job      │    │ Budget   │    │          │ │
│  │          │    │ Forecast │    │ Push via │ │
│  │ Expenses │    │ Bench    │    │ WebSocket│ │
│  │ Projects │    │ Alert    │    └──────────┘ │
│  │ Timeshts │    └──────────┘                 │
│  └──────────┘                                 │
└────────────────────────────────────────────────┘
```

### AI Features Breakdown

| Feature | Trigger | Claude Model | Input | Output |
|---------|---------|-------------|-------|--------|
| Receipt OCR | Expense upload | Haiku 4.5 | Image | { vendor, amount, date, category } |
| Expense Categorization | Expense creation | Haiku 4.5 | Description + vendor | Suggested category |
| Anomaly Detection | Nightly batch | Sonnet 4.6 | Last 90 days expenses | Anomaly scores |
| Budget Forecasting | Daily batch | Sonnet 4.6 | Project hours + budget | Exhaustion date |
| NL Queries | User request | Sonnet 4.6 | Question + schema context | SQL → results → narrative |
| Resource Suggestions | Bench alert | Sonnet 4.6 | Skills + availability + projects | Assignment recommendations |
| Duplicate Detection | Expense creation | Haiku 4.5 | New expense + recent expenses | Potential duplicate flag |
| Smart Notifications | Continuous | Haiku 4.5 | Activity stream | Priority-filtered alerts |

---

## 7. Security Architecture

### Authentication Flow

```
Login with Password:
  Client → POST /auth/login { email, password }
  Server → Verify Argon2id hash
  Server → If MFA enabled: return { requires_mfa: true, session_token: "temp..." }
  Client → POST /auth/login { session_token, totp_code }
  Server → Verify TOTP
  Server → Return { access_token: JWT(15min), set-cookie: refresh_token(7d, httpOnly) }

Login with Passkey (WebAuthn):
  Client → POST /auth/login/webauthn/begin { email }
  Server → Return challenge + credential options
  Client → Browser WebAuthn API → sign challenge
  Client → POST /auth/login/webauthn/finish { response }
  Server → Verify → Return tokens

Token Refresh:
  Client → POST /auth/refresh (cookie: refresh_token)
  Server → Verify refresh token, rotate (old revoked, new issued)
  Server → Return new access_token + set new refresh cookie
```

### RBAC Rules (Abridged)

```
Admin:        ALL actions
PM:           Own data + managed department + managed project data
Employee:     Own data only (submit, view, cancel own items)
Client Portal: Read-only project/timesheet/invoice for their projects

Cross-cutting rules:
  - No self-approval (enforced at DB constraint + API layer)
  - Tenant isolation (schema-per-tenant + middleware)
  - Rate limiting: 100 req/min (auth), 1000 req/min (API), 10 req/min (AI)
```

---

## 8. Indexing Strategy

### PostgreSQL Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department ON users(department_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE is_active = true;
CREATE INDEX idx_users_active ON users(is_active) WHERE deleted_at IS NULL;

-- Leave requests
CREATE INDEX idx_leave_requests_user ON leave_requests(user_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_leave_requests_pending ON leave_requests(status) WHERE status = 'pending';

-- Expenses
CREATE INDEX idx_expenses_user ON expenses(user_id);
CREATE INDEX idx_expenses_project ON expenses(project_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_date ON expenses(expense_date);

-- Timesheets
CREATE INDEX idx_timesheet_batches_user ON timesheet_batches(user_id);
CREATE INDEX idx_timesheet_batches_period ON timesheet_batches(period_start, period_end);
CREATE INDEX idx_timesheet_entries_date ON timesheet_entries(entry_date);
CREATE INDEX idx_timesheet_entries_project ON timesheet_entries(project_id);

-- Projects
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_project_assignments_user ON project_assignments(user_id);
CREATE INDEX idx_project_assignments_active ON project_assignments(project_id)
    WHERE is_active = true;

-- Audit (partitioned)
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);

-- Full-text search (backup for Meilisearch)
CREATE INDEX idx_users_search ON users USING gin(
    to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(email, ''))
);
```

### Meilisearch Indexes

```
Index: users      — id, name, email, role, department, skills, job_title
Index: projects   — id, name, client_name, status, billing_model
Index: clients    — id, name, industry, contacts
Index: invoices   — id, number, client_name, project_name, status, amount
Index: expenses   — id, description, type, user_name, project_name
```

Sync: After every create/update/delete, background job pushes to Meilisearch.

---

## 9. Seed Data

This section defines the canonical prototype dataset. All development and staging environments must be seeded with exactly this data so the UI matches the approved prototype design. These values are sourced directly from the `/prototype/` HTML files.

> This seed data is referenced in `/prototype/` HTML files. When developing or testing, these exact values must appear in the UI to match the approved prototype design.

> A migration file at `migrations/seed_data.sql` should insert this data into the development tenant schema using `tenant_gamma_demo` as the schema name.

### 9.1 Company (Tenant)

| Field | Value |
|-------|-------|
| Name | GammaHR Demo Company |
| Subdomain / Slug | gamma-demo |
| Plan | Enterprise |
| Country | France (FRA) |
| Locale | en-FR |
| Fiscal Year | January – December |
| Schema Name | `tenant_gamma_demo` |

### 9.2 Employees (8 total)

All 8 employees report to Alex Morrison (CEO/Owner). Alex Morrison is the tenant admin user and is not counted in the 8-person team list below.

| ID | Name | Role | Department | Work Time | Status |
|----|------|------|------------|-----------|--------|
| 1 | Sarah Chen | Senior Developer | Engineering | 87% | Active |
| 2 | John Smith | Project Manager | Management | 82% | Active |
| 3 | Marco Rossi | Operations Lead | Operations | 88% | Active |
| 4 | Carol White | Senior Designer | Design | 90% | Active |
| 5 | Alice Wang | Business Analyst | Analysis | On Leave (Apr 14–18) | On Leave |
| 6 | David Park | Finance Lead | Finance | 45% | Active |
| 7 | Emma Laurent | HR Specialist | HR | 78% | Active |
| 8 | Bob Taylor | Developer | Engineering | 0% | Bench |

**Notes:**
- "Work Time" maps to `allocation_pct` across active project assignments (replaces "Utilisation" — banned term).
- Alice Wang's leave dates are 2026-04-14 to 2026-04-18.
- Bob Taylor is on the bench (no active assignments, `allocation_pct` = 0).

### 9.3 Clients (4 total)

| ID | Name | Primary Contact | Contact Role | Active Projects |
|----|------|-----------------|--------------|-----------------|
| 1 | Acme Corp | James Wilson | CFO | 3 |
| 2 | Globex Corp | Maria Santos | PM | 2 |
| 3 | Initech | Robert Chen | CTO | 1 |
| 4 | Umbrella Inc | Diana Prince | VP | 1 |

### 9.4 Projects (7 total)

| ID | Name | Client | Status | Budget (EUR) | Budget Burn |
|----|------|--------|--------|-------------|-------------|
| 1 | E-Commerce Platform | Acme Corp | Active | 120,000 | 68% |
| 2 | Mobile App Redesign | Globex Corp | Active | 85,000 | 45% |
| 3 | ERP Integration | Initech | Active | 200,000 | 69% |
| 4 | API Gateway Build | Acme Corp | Active | 60,000 | 30% |
| 5 | Data Analytics Dashboard | Umbrella Inc | Active | 95,000 | 55% |
| 6 | Legacy Migration | Acme Corp | Completed | 150,000 | 100% |
| 7 | Cloud Infrastructure | Globex Corp | On Hold | 75,000 | 22% |

**Budget burn** maps to `(budget_consumed / budget_amount) * 100` rounded to the nearest integer.

### 9.5 Invoices (key invoices)

| Invoice Number | Client | Amount (EUR) | Status |
|----------------|--------|-------------|--------|
| INV-2026-041 | Acme Corp | 24,500 | Sent |
| INV-2026-043 | Initech | 5,000 | Overdue |
| INV-2026-048 | Umbrella Inc | 12,400 | Overdue |
| INV-2026-049 | Globex Corp | 18,200 | Draft |

**Outstanding total (client portal):** €17,400 — sum of overdue invoices INV-2026-043 (€5,000) and INV-2026-048 (€12,400).

### 9.6 Leave Balances (example: Sarah Chen, year 2026)

| Leave Type | Remaining | Total |
|------------|-----------|-------|
| Annual | 18 days | 25 days |
| Sick | 8 days | 10 days |
| Parental | 90 days | 90 days |
| Training | 3 days | 5 days |

`used = total - remaining` (e.g. Annual: 7 days used).

### 9.7 Expenses (key expense)

| Employee | Description | Vendor | Amount (EUR) | Category |
|----------|-------------|--------|-------------|----------|
| Bob Taylor | Hotel stay | Marriott Lyon | 340 | Business Travel |
