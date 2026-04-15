# APP BLUEPRINT

> Every page in GammaHR v1.0. One table row per page.
> `specs/DESIGN_SYSTEM.md` defines the atoms. `prototype/*.html` is the visual spec. This file is the feature index.
> Three audiences, three route groups: `(ops)` for ops.gammahr.com, `(app)` for app.gammahr.com, `(portal)` for portal.gammahr.com. See `docs/decisions/ADR-010-three-app-model.md`.

---

## Global rules (apply to every page in the (app) group, not repeated per row)

- Shell (sidebar + topbar + bottom nav) is identical on every page within a route group. Each of the three route groups has its own shell variant.
- Cmd+K command palette is reachable from every page in (app). Not present in (ops) or (portal).
- Every employee/client/project reference is a clickable link.
- Every mutation emits an audit log entry with `actor_type` matching the route group.
- Every page must pass `docs/FLAWLESS_GATE.md`.
- Dark mode default, light mode variant. Both verified.
- EN + FR strings via next-intl. No hardcoded text.
- Every feature mutation must go through the `@gated_feature(key)` check (entitlements + flags + kill switches). See `specs/DATA_ARCHITECTURE.md` section 6.
- Optimistic mutations use the shared `useOptimisticMutation` wrapper and the `<ConflictResolver>` pattern component for HTTP 409 handling.

---

## 1. Auth + onboarding (Tier 1, (app) route group)

| # | Page | Route | Prototype | Pattern | Key atoms | AI |
|---|------|-------|-----------|---------|-----------|----|
| 1.1 | Login (selector) | `/login` | `prototype/auth.html` | Centered card | Button, OIDCProviderButton, Link, InlineAlert | None |
| 1.2 | OIDC callback | `/auth/callback/google`, `/auth/callback/microsoft` | New | Splash + spinner | Spinner, InlineAlert | None |
| 1.3 | Passkey challenge | `/login/passkey` | `prototype/auth.html` | Centered card | Button(Passkey), InlineAlert | None |
| 1.4 | Password fallback | `/login/password` | `prototype/auth.html` | Centered card | Input, Button, Link, InlineAlert | None |
| 1.5 | Magic-link invite accept | `/invite/[token]` | New | Centered wizard | Input, Select, Button, ProgressSteps | Suggest currency/timezone from IP |
| 1.6 | MFA setup + challenge | `/mfa/setup`, `/mfa/challenge` | New | Centered card | QRCode, Input(OTP), Button | None |
| 1.7 | Password reset | `/password/reset` | New | Centered card | Input, Button, InlineAlert | None |
| 1.8 | Onboarding wizard | `/onboarding` | `prototype/auth.html` (wizard) | Wizard | StepList, FileDrop, Table, Button | CSV column mapper, duplicate detection, holiday suggester |

### Notable constraints
- 1.1: login selector shows OIDC buttons first (Google Workspace, Microsoft Entra), passkey as secondary, password as tertiary. Respects tenant's configured `oidc_providers` rows.
- 1.2: OIDC callbacks hit `POST /api/v1/auth/oidc/callback/{provider}` which validates state, fetches id_token, upserts `users.oidc_subject`, mints session.
- 1.3: WebAuthn passkey challenge. Primary path for non-SSO tenants.
- 1.4: rate limit 5/15min per IP, 10/email. Generic error on bad credentials. bcrypt cost 12, zxcvbn min score 3.
- 1.5: magic-link invite lands new employees directly in the signup flow without password. First action is passkey enrollment or OIDC link.
- 1.6: TOTP secret never logged. Recovery codes hashed. 10 single-use codes.
- 1.7: always 200 on request (no user enumeration). Token single-use, 30 min.
- 1.8: bulk import target 201 employees + 120 clients + 260 projects + 1 year of timesheets (52 weeks) in < 60 s. Matches the canonical seed data in `specs/DATA_ARCHITECTURE.md` section 12.10. Resumable wizard. Idempotent imports.

### Deferred from the (app) auth flow
- Self-serve public signup form at `gammahr.com/register` — DEF-028, not in v1.0. Tenants are created by the founder in the operator console; new employees receive magic-link invites.
- SCIM provisioning from Google Workspace / Microsoft Entra directories — DEF-024.
- SAML federation — DEF-025.

---

## 2. Dashboard (Tier 1)

| # | Page | Route | Prototype | Pattern | AI |
|---|------|-------|-----------|---------|----|
| 2.1 | Dashboard | `/dashboard` | `prototype/index.html` | Dashboard | AI greeting, ranked insights card, anomaly badges on KPIs |

Two build passes: Pass 1 after employees/clients/projects (Phase 4). Pass 2 after all modules wired (Phase 5).

---

## 3. People (Tier 1)

| # | Page | Route | Prototype | Pattern |
|---|------|-------|-----------|---------|
| 3.1 | Employees list | `/employees` | `prototype/employees.html` | List |
| 3.2 | Employee profile | `/employees/[id]` | `prototype/employees.html` (drawer) | Detail + tabs |

Tabs on profile: Overview, Timesheets, Leaves, Expenses, Projects, Documents, Activity.

---

## 4. Time (Tier 1)

**Week-as-entity model.** A timesheet week is a parent entity (`timesheet_weeks`) with a `status` state machine. Individual time entries are children (`timesheet_entries`) and become immutable once the parent week is submitted. Submit, approve, reject, and recall all operate on the week, never on a single day. See `specs/DATA_ARCHITECTURE.md` section 2.8 for the schema.

| # | Page | Route | Prototype | Pattern |
|---|------|-------|-----------|---------|
| 4.1 | Timesheet weeks list | `/timesheets` | `prototype/timesheets.html` | List (one row per week) |
| 4.2 | Weekly entry grid | `/timesheets/[week_id]` | `prototype/timesheets.html` (grid) | Detail + grid |
| 4.3 | Approvals hub | `/approvals` | `prototype/approvals.html` | Board (approvals by entity type: timesheets, leaves, expenses) |

### State machine (per week)

```
draft ──[submit]──> submitted ──[approve]──> approved
  ↑                     ↓
  │                  [recall] while no approval action yet
  │                     ↓
  └──[reject]── submitted (same state, manager rejects)
```

- **Submit:** employee clicks "Submit Week", `timesheet_weeks.status = 'submitted'`, `submitted_at = now()`, entries become immutable. Version lock applies. Notification sent to manager.
- **Recall:** while status is `submitted` AND no approval action has happened yet, employee can click "Recall" to pull the week back to `draft`. Audited.
- **Approve:** manager clicks "Approve", `status = 'approved'`, `approved_by`, `approved_at` set. Notification to employee.
- **Reject:** manager clicks "Reject with reason", `status = 'draft'` (loops back), `rejection_reason` set. Notification to employee. Entries become mutable again.

### Constraints
- 4.2: autosave every 5 s. Keyboard-navigable grid. Max `hours_per_day * 60` minutes per day validation. Projects with `allow_hourly_entry = false` accept only full-day and half-day entries; projects with the flag true accept sub-day entries at 1-hour minimum.
- 4.2: entries are immutable once parent week `status = 'submitted'`. The grid shows a clear "week is submitted, recall to edit" banner if an employee tries to type into a submitted week.
- 4.2: version lock is on BOTH `timesheet_weeks` (parent) and `timesheet_entries` (children during draft). Conflict resolution uses the shared `<ConflictResolver>` pattern component.
- 4.3: approvals operate on whole weeks for timesheets, whole requests for leaves, whole expenses for expenses. Undo window 5 s after approve/reject. Decisions idempotent.
- 4.3: approval routing is single-hop. Direct manager for timesheets and leaves; direct manager + finance co-approval for expenses above `tenants.expense_approval_threshold_cents`. The `approval_delegations` table handles vacation cover via full inheritance.

---

## 5. Leaves (Tier 1)

| # | Page | Route | Prototype | Pattern |
|---|------|-------|-----------|---------|
| 5.1 | Leaves list | `/leaves` | `prototype/leaves.html` | List + balance cards |
| 5.2 | Request modal | - | `prototype/leaves.html` (modal) | Modal (Detail variant) |

Balance enforced at submission. Public holidays pre-seeded by country.

---

## 6. Expenses (Tier 1)

| # | Page | Route | Prototype | Pattern | AI |
|---|------|-------|-----------|---------|----|
| 6.1 | Expenses list | `/expenses` | `prototype/expenses.html` | List | None directly |
| 6.2 | Submission modal | - | `prototype/expenses.html` (modal) | Modal | OCR fills merchant/date/amount/category, duplicate detection |

OCR latency goal p95 < 8 s. End-to-end submission goal < 30 s.

---

## 7. Clients + projects (Tier 1)

| # | Page | Route | Prototype | Pattern |
|---|------|-------|-----------|---------|
| 7.1 | Clients list | `/clients` | `prototype/clients.html` | List |
| 7.2 | Client detail | `/clients/[id]` | `prototype/clients.html` (drawer) | Detail + tabs |
| 7.3 | Projects list | `/projects` | `prototype/projects.html` | List |
| 7.4 | Project detail | `/projects/[id]` | `prototype/projects.html` (drawer) | Detail + tabs |

Client tabs: Overview, Projects, Invoices, Contacts, Documents, Activity.
Project tabs: Overview, Team, Tasks, Time, Invoices, Files, Activity.

---

## 8. Invoices (Tier 1)

| # | Page | Route | Prototype | Pattern | AI |
|---|------|-------|-----------|---------|----|
| 8.1 | Invoices list | `/invoices` | `prototype/invoices.html` | List | Collections suggestions |
| 8.2 | Invoice detail | `/invoices/[id]` | `prototype/invoices.html` (detail) | Detail + document | Line item polishing |

Auto-generate from approved timesheets + expenses. PDF via WeasyPrint matching HTML preview at print DPI.

---

## 9. Admin + account (Tier 1)

| # | Page | Route | Prototype | Pattern |
|---|------|-------|-----------|---------|
| 9.1 | Admin console | `/admin` | `prototype/admin.html` | Settings |
| 9.2 | Account settings | `/account` | `prototype/account.html` | Settings |

Admin sections: Users, Roles, Teams, Integrations, Billing, Audit Log, Security.
Account sections: Profile, Security (MFA + passkeys + sessions), Notifications, Language, API tokens.

---

## 10. Tier 2 pages (still (app) route group)

| # | Page | Route | Prototype | Pattern | v1.0 scope |
|---|------|-------|-----------|---------|------------|
| 10.1 | Calendar | `/calendar` | `prototype/calendar.html` | Board | Month view only, read-only overlays |
| 10.2 | Gantt | `/gantt` | `prototype/gantt.html` | Board | Read-only pan/zoom |
| 10.3 | Planning | `/planning` | `prototype/planning.html` | Board | Read-only heatmap |
| 10.4 | HR | `/hr` | `prototype/hr.html` | Dashboard + list | Recruitment pipeline read-only |
| 10.5 | Insights | `/insights` | `prototype/insights.html` | Dashboard | Ranked AI insights list |

---

## 11. Operator console ((ops) route group, `ops.gammahr.com`)

**Audience:** founder and (eventually) founder's team. **Auth:** WebAuthn passkey only, no password, no TOTP. **Shell:** utilitarian, no command palette, dedicated left nav.

| # | Page | Route | Pattern | v1.0 scope |
|---|------|-------|---------|------------|
| 11.1 | Ops login | `/login` | Centered card | Passkey challenge only |
| 11.2 | Ops dashboard | `/` | Dashboard | Tenant count, MRR estimate, active incidents, kill switch status, residency audit last-run timestamp |
| 11.3 | Tenants list | `/tenants` | List | All tenants with lifecycle_state, list_tier or pricing_model, seat count, created_at, last_activity |
| 11.4 | Tenant detail | `/tenants/[id]` | Detail + tabs | Overview, Users, Subscription, Entitlements, Custom Contract, Lifecycle actions |
| 11.5 | Create tenant | `/tenants/new` | Wizard | Name, slug, country, timezone, currency, hours_per_day, starting tier. Creates schema via `CREATE SCHEMA`, seeds default entitlements, sends magic-link invite to owner email |
| 11.6 | Subscription invoices | `/billing/invoices` | List | GammaHR's own invoices to tenants (Phase 2 manual) |
| 11.7 | Invoice detail | `/billing/invoices/[id]` | Detail + document | Line items, status, payment method, PDF download, mark-paid action |
| 11.8 | Custom contracts | `/billing/contracts` | List | tenant_custom_contracts rows with tenant name, annual fee, period |
| 11.9 | Contract detail + edit | `/billing/contracts/[id]` | Detail + form | Fields per DATA_ARCHITECTURE.md section 2.3, signed PDF upload, audit trail |
| 11.10 | Feature flags | `/flags` | Board | All feature_flags rows grouped by scope_type. Per-row toggle, audited. Global, per-tenant, per-user. |
| 11.11 | Kill switches | `/kill-switches` | Prominent board | Named kill_switch.* rows with one-click toggle + required reason text |
| 11.12 | Migrations | `/migrations` | Table | alembic_runs rows grouped by version, per-tenant status, retry failed actions |
| 11.13 | Sub-processors | `/legal/sub-processors` | List + form | Edit the public sub_processors list, trigger 30-day notification email on changes |
| 11.14 | DPA versions | `/legal/dpa-versions` | List + form | dpa_versions rows, upload new PDF, effective date, changelog |
| 11.15 | Residency audit | `/legal/residency` | List | Quarterly audit PDFs from GCS bucket, download links, last-run timestamp |
| 11.16 | Maintenance mode | `/maintenance` | Toggle + form | system.read_only_mode toggle, full-maintenance cutover toggle, banner text editor |
| 11.17 | Audit log | `/audit` | Filtered list | Cross-tenant audit_log browser with filters by actor_type, entity_type, action, date range |
| 11.18 | Health | `/health` | Dashboard | SLO dashboards, Cloud Monitoring embeds, incident history |

### Deferred from operator console v1.0
- **Impersonation UI** to "log in as tenant admin" — DEF-002. The JWT shape and audit contract are defined now (ADR-010), the UI ships later.
- **Integrated billing UI** for Stripe/Revolut webhook handling — DEF-003. Phase 2 is manual PDF invoicing.
- **Broadcast banners, per-tenant feature flag toggles from a richer UI, maintenance drain orchestration** — DEF-004.
- **Drift auto-reconciliation** in 11.12 Migrations — DEF-054.

---

## 12. Portal ((portal) route group, `portal.gammahr.com`)

**Audience:** customers' clients (external). **Ships late Phase 6.** Tables exist from Phase 1 so tenants can start storing portal user records early, but the UI does not exist until Phase 6.

| # | Page | Route | Prototype | Pattern | v1.0 scope |
|---|------|-------|-----------|---------|------------|
| 12.1 | Portal login | `/login` | New | Centered card | Passkey → password → TOTP, no SSO (DEF-008) |
| 12.2 | Portal dashboard | `/` | `prototype/portal/` | Dashboard | Read-only project status + invoices list |
| 12.3 | Portal invoices list | `/invoices` | `prototype/portal/` | List | Client's invoices from the tenant |
| 12.4 | Portal invoice detail | `/invoices/[id]` | `prototype/portal/` | Detail + document | PDF view, payment status |

### Deferred from portal v1.0
- **Portal SSO** (clients logging in via their corporate SSO) — DEF-008.
- **Write operations** (portal users submitting anything) — not in v1.0. Read-only only.

---

## 13. Cross-cutting (all route groups)

| # | Feature | Notes |
|---|---------|-------|
| 13.1 | Command palette | Cmd+K, global, (app) only. Maps natural-language queries to `ai_tools.py` tool calls via Vertex AI Gemini LLM-as-router. |
| 13.2 | Notifications | Bell in topbar, WebSocket push on `/ws/notifications`, in-app + PWA Web Push as primary channels, email as fallback for auth flows + invoice delivery + opt-in daily digest. |
| 13.3 | Audit log viewer | Tenant admins see their own tenant's audit log in (app) under `/admin/audit`. Operators see cross-tenant audit log in (ops) under `/audit`. |
| 13.4 | Conflict resolver | `<ConflictResolver>` in `components/patterns/`, triggered by HTTP 409 responses on any optimistic mutation via the `useOptimisticMutation` wrapper. |
| 13.5 | Entitlement lock UI | Locked features show a gray lock icon and "Upgrade to Pro" CTA instead of the action. Feature gating via `@gated_feature(key)` on the backend. |
| 13.6 | Degraded mode banners | When AI kill switch is active or tenant hit 80% AI budget, a yellow banner appears at the top of (app) explaining which features are temporarily unavailable. |

---

## 14. Phase mapping

| Phase | Delivers |
|-------|----------|
| 2 | Foundation: auth infrastructure, tenancy middleware, migration runner, gated_feature decorator, ai/client.py, optimistic wrapper, ConflictResolver, operator console 11.1-11.3 minimum |
| 3 | (app) auth pages 1.1-1.8, (ops) operator console full tier 11.1-11.13 |
| 4 | People (3.x), Clients + Projects (7.1-7.4), Dashboard pass 1 (2.1), Operator console 11.14-11.18 |
| 5 | Time (4.x) with week-as-entity, Leaves (5.x), Expenses (6.x), Invoices (8.x), Admin + Account (9.x), Dashboard pass 2 (2.1) |
| 6 | Tier 2 pages (10.x), Portal (12.x) |
| 7 | Hardening, polish batches, final flawless-gate passes |

Each row in Tier 1 must pass the flawless gate before the next begins. Operator console work runs in parallel with (app) work during Phases 2-5 because it has its own route group.
