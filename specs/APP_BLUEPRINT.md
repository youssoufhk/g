# APP BLUEPRINT

> Every page in GammaHR v1.0. One table row per page.
> `specs/DESIGN_SYSTEM.md` defines the atoms. `prototype/*.html` is the visual spec. This file is the feature index.

---

## Global rules (apply to every page, not repeated per row)

- Shell (sidebar + topbar + bottom nav) is identical on every page.
- Cmd+K command palette is reachable from every page.
- Every employee/client/project reference is a clickable link.
- Every mutation emits an audit log entry.
- Every page must pass `docs/FLAWLESS_GATE.md`.
- Dark mode default, light mode variant. Both verified.
- EN + FR strings via next-intl. No hardcoded text.

---

## 1. Auth + onboarding (Tier 1)

| # | Page | Route | Prototype | Pattern | Key atoms | AI |
|---|------|-------|-----------|---------|-----------|----|
| 1.1 | Login | `/login` | `prototype/auth.html` | Centered card | Input, Button, Link, InlineAlert | None |
| 1.2 | Register | `/register` | `prototype/auth.html` | Centered wizard | Input, Select, Button, ProgressSteps | Suggest currency/timezone from IP |
| 1.3 | MFA setup + challenge | `/mfa/setup`, `/mfa/challenge` | New | Centered card | QRCode, Input(OTP), Button | None |
| 1.4 | Password reset | `/password/reset` | New | Centered card | Input, Button, InlineAlert | None |
| 1.5 | Onboarding wizard | `/onboarding` | `prototype/auth.html` (wizard) | Wizard | StepList, FileDrop, Table, Button | CSV column mapper, duplicate detection, holiday suggester |

### Notable constraints
- 1.1: rate limit 5/15min per IP, 10/email. Generic error on bad credentials.
- 1.3: TOTP secret never logged. Recovery codes hashed. 10 single-use codes.
- 1.4: always 200 on request (no user enumeration). Token single-use, 30 min.
- 1.5: bulk import target 200 employees in < 60 s. Resumable wizard. Idempotent imports.

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

| # | Page | Route | Prototype | Pattern |
|---|------|-------|-----------|---------|
| 4.1 | Timesheets list | `/timesheets` | `prototype/timesheets.html` | List |
| 4.2 | Weekly entry | `/timesheets/[week]` | `prototype/timesheets.html` (grid) | Detail + grid |
| 4.3 | Approvals hub | `/approvals` | `prototype/approvals.html` | Board |

### Constraints
- 4.2: autosave every 5 s. Keyboard-navigable grid. Max 24h/day validation.
- 4.3: undo window 5 s after approve/reject. Decisions idempotent.

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

## 10. Tier 2 pages

| # | Page | Route | Prototype | Pattern | v1.0 scope |
|---|------|-------|-----------|---------|------------|
| 10.1 | Calendar | `/calendar` | `prototype/calendar.html` | Board | Month view only, read-only overlays |
| 10.2 | Gantt | `/gantt` | `prototype/gantt.html` | Board | Read-only pan/zoom |
| 10.3 | Planning | `/planning` | `prototype/planning.html` | Board | Read-only heatmap |
| 10.4 | HR | `/hr` | `prototype/hr.html` | Dashboard + list | Recruitment pipeline read-only |
| 10.5 | Insights | `/insights` | `prototype/insights.html` | Dashboard | Ranked AI insights list |
| 10.6 | Client portal | `/portal` (separate subdomain) | `prototype/portal/` | Dashboard | Read-only status + invoices |

---

## 11. Cross-cutting

| # | Feature | Notes |
|---|---------|-------|
| 11.1 | Command palette | Cmd+K, global, via shell |
| 11.2 | Notifications | Bell in topbar, WebSocket push |
| 11.3 | Audit log | Admin section, filterable |

---

## 12. Phase mapping

| Phase | Delivers |
|-------|----------|
| 3 | 1.1, 1.2, 1.3, 1.4, 1.5 |
| 4 | 3.x, 7.1-7.4, 2.1 pass 1 |
| 5 | 4.x, 5.x, 6.x, 8.x, 9.x, 2.1 pass 2 |
| 6 | 10.x |
| 7 | Hardening across all |

Each row in Tier 1 must pass the flawless gate before the next begins.
