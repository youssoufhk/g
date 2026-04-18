# SCOPE

> What v1.0 contains. Three lists. Hard line.
> **Last updated:** 2026-04-15 (cross-references corrected, command palette reclassified to shell infrastructure).

---

## Tier 1 (flagship, gate-enforced)

Every item passes `docs/FLAWLESS_GATE.md` before the next starts. **Command palette is not in this table. It is shell infrastructure S1 (see "Shell infrastructure" below). This table has 13 features (not 14).**

| # | Feature | Blueprint section |
|---|---------|-------------------|
| 1 | Authentication (login, OIDC, passkey, password, MFA, password reset) | 1.1-1.7 |
| 2 | Tenant onboarding with bulk CSV import | 1.8 |
| 3 | Employees directory + profile | 3.1-3.2 |
| 4 | Clients directory + profile | 7.1-7.2 |
| 5 | Projects list + detail + assignment | 7.3-7.4 |
| 6 | Timesheets (week-as-entity, weekly entry + team list) + bulk actions | 4.1-4.2 |
| 7 | Leaves (request + approve + balance) + bulk approve/reject | 5.1-5.2 |
| 8 | Expenses (submission with OCR + list + approval) + bulk approve/reject | 6.1-6.2 |
| 9 | Approvals hub + bulk approve/reject across all entity types | 4.3 |
| 10 | Invoices (generate + PDF + send) + bulk mark-paid | 8.1-8.2 |
| 11 | Admin console | 9.1 |
| 12 | Account settings | 9.2 |
| 13 | Dashboard (pass 1 + pass 2) | 2.1 |

## Shell infrastructure (always-on, not a Tier 1 feature)

These are not standalone features; they are infrastructure that every page in `(app)` consumes. They have no flawless gate of their own; the gate is verified in-line on every Tier 1 page that uses them. **Phase 2 ships them as part of the foundation build, before any Tier 1 page work begins.**

| # | Component | Blueprint section | Built in | Frontend owner | Backend owner | Notes |
|---|-----------|-------------------|----------|----------------|---------------|-------|
| S1 | Cmd+K command palette (LLM-as-router) | 13.1 | Phase 2 foundation | `features/command-palette/` | `backend/app/ai/client.py` + per-feature `ai_tools.py` registrations | Reachable from every (app) page. Hard dependency on `kill_switch.ai`; degraded-mode behavior per `specs/AI_FEATURES.md` section 7. |
| S2 | Notifications drawer + WebSocket feed | 13.2 | Phase 2 | `components/shell/notifications-drawer.tsx` + `lib/realtime.ts` | `backend/app/features/notifications/` + `backend/app/events/websocket.py` | Single `/ws/notifications` per user, in-app + PWA Web Push. |
| S3 | Conflict resolver pattern | 13.4 | Phase 2 | `components/patterns/conflict-resolver.tsx` + `lib/optimistic.ts` | N/A (pure frontend; server 409s trigger it) | Triggered by HTTP 409 on any optimistic mutation via `useOptimisticMutation`. |
| S4 | Entitlement lock UI + degraded-mode banners | 13.5, 13.6 | Phase 2 | `components/ui/entitlement-lock.tsx` + `components/ui/degraded-banner.tsx` | `backend/app/features/admin/entitlements.py` | Locked features show "Upgrade to Pro"; AI degraded mode shows a yellow banner. |

Every Tier 1 feature's flawless-gate run verifies the S-items it uses, in-line. See `docs/FLAWLESS_GATE.md`.

---

## Tier 1.1 (committed for v1.1, positioned in v1.0)

These features are promised on the Gamma landing page and in sales conversations but NOT built in v1.0. They are reserved in the domain model (`specs/DATA_ARCHITECTURE.md` §14) so v1.1 can ship them without a schema rewrite. The three enterprise-gate rows (SCIM, SAML, multi-rate VAT) are **committed** for v1.1 rather than demand-triggered, because the COO/CFO teardown established that enterprise procurement cannot sign without them; they are the trigger for the year-2 price step-up in `docs/GO_TO_MARKET.md §2`. Prior DEF-024 (SCIM), DEF-025 (SAML), and DEF-007 (multi-rate VAT) are marked resolved in `docs/DEFERRED_DECISIONS.md` and lifted into this table.

| Feature | Why reserved, not built | Trigger |
|---|---|---|
| **SCIM provisioning** from Google Workspace and Microsoft Entra directories | Enterprise procurement gate. Lifted from DEF-024. | Committed for v1.1. Ship before first enterprise-tier renewal. |
| **SAML federation** beyond OIDC | Enterprise procurement gate. Lifted from DEF-025. | Committed for v1.1. Ship before first enterprise-tier renewal. |
| **Multi-rate VAT** (different tax rates per invoice line, regional splits, goods + services on one invoice) | Enterprise procurement gate for cross-border and goods-and-services buyers. Lifted from DEF-007. | Committed for v1.1. Ship before first enterprise-tier renewal. |
| Recruitment / Applicant Tracking (ATS) | A full recruitment module is its own product category (Greenhouse, Lever, Ashby, Workable, Recruitee). Shipping it half-baked in v1.0 would hurt the Gamma brand more than deferring. Consulting firms hire in cycles, not continuously; the urgency asymmetry favors shipping timesheets, invoicing, and resource planning first. | Demand-triggered: (a) 3 paying customers live, AND (b) at least 2 customers explicitly ask for it in writing, AND (c) v1.0 is stable for 90 days. |
| Performance reviews + 1:1s | Same reasoning. Reserve `employee_reviews` + `one_on_ones` tables in v1.1. | Demand-triggered. |
| Expense policy engine (rules-based auto-approval) | v1.0 ships manual approval only. Rule engine is v1.1 once we see real approval patterns. | Demand-triggered. |

**Positioning rule:** these features are promised in marketing copy ("Gamma runs your entire consulting firm: time, projects, billing, people, hiring, reviews, enterprise SSO, multi-rate VAT") but the landing page feature matrix marks each with "v1.1 - Q3 2027" (placeholder date; update when Phase 7 ends). Buyers who need the non-committed rows now are filtered out in the first discovery call. Buyers who need the three committed rows for v1.1 are told "committed, ships before year-2 renewal", on the record.

---

## Tier 2 (functional, polished in v1.1)

Present in v1.0. Works reliably. Not held to the flawless gate.

| # | Feature | v1.0 scope | v1.1 polish |
|---|---------|------------|-------------|
| 1 | Calendar: month view only, read-only. Shows allocated projects and approved leaves as colored blocks. No drag-edit or conflict resolution in v1.0. | Month view read-only | Week and day views and drag-edit |
| 2 | Gantt | Read-only pan/zoom | Drag-reschedule, dependencies |
| 3 | Resource planning | Read-only heatmap | Rebalance suggestions |
| 4 | HR module | Recruitment list, onboarding checklists | Full ATS |
| 5 | AI Insights page | Ranked list, dismiss | Act on insights inline |
| 6 | Client portal | Read-only status + invoices | Document exchange |
| 7 | Real-time | Approval + OCR + import notifications | Presence, collab edit |

---

## Deferred to v1.1 or later

- Native iOS/Android apps (PWA covers mobile in v1.0)
- Languages beyond EN and FR
- SSO beyond Google/Microsoft OIDC
- Custom dashboard builder
- Advanced reporting
- Payroll integrations
- Multi-currency consolidated reporting
- Public API for third-parties
- Webhooks for external systems
- Marketplace / plugin system
- AI learned per-user preferences
- Collaborative editing (multiple cursors)

---

## Anti-scope (forbidden without founder approval)

Never ship silently. Ask first.

- New atoms in the design system
- New content patterns
- New routes beyond `APP_BLUEPRINT.md`
- New third-party dependencies
- New database tables **outside the locked set in `specs/DATA_ARCHITECTURE.md` section 13** are anti-scope. Adding a new column to a locked table to implement a Tier 1 feature is normal migration work and does not require founder approval. Adding a new table for a Tier 2 feature or a drive-by optimisation does require founder approval.
- Sparklines, animations, 3D, decorative flourishes
- Em dashes anywhere
- The word "utilisation"
- Integrations (Slack, Teams, Zapier, calendar sync)

---

## First-customer must-haves

The 200-employee / 100-client EU customer blocks launch unless these are Tier 1 flawless:

1. Bulk CSV onboarding for the canonical seed dataset (201 employees + 120 clients + 260 projects + 52 weeks of timesheets + 700 leaves + ~8,400 expenses + 900 invoices) in under 60 s. 52 weeks of historical timesheets means one full fiscal year preceding the pilot start; 900 invoices means 900 distinct invoice rows averaging ~10 line items each.
2. Weekly timesheet submission + manager approval
3. Leave request + approval with balance enforcement
4. Expense submission with OCR + approval
5. Invoice generation from approved timesheets with PDF export. Rate precedence: project_employee_rate > project_rate > employee_default_rate > tenant_default_rate. Partial approvals: only `approved` timesheet rows are included; `pending` or `rejected` rows are excluded. See `specs/DATA_ARCHITECTURE.md` section 4.4.1 for the full algorithm.
6. Dashboard wired to real data across all modules
7. Mobile PWA installable and usable for quick approvals
8. Admin console with user management + audit log
9. Dark + light mode both complete
10. EN + FR both complete

Everything else can be Tier 2 or deferred.

---

## Tier 1 cross-cutting requirements

These are not standalone Tier 1 features but required infrastructure for a usable pilot. Each must pass the flawless gate as part of the Tier 1 feature that owns it. Every row must ship with v1.0.

| Add-on | Where it lives | Scope |
|---|---|---|
| **Bulk row actions** on lists with selectable rows | Approvals hub (4.3), expenses list (6.1), leaves list (5.1), invoices list (8.1), timesheets list (4.1) | Multi-select via checkbox column, bulk-approve / bulk-reject / bulk-mark-paid actions through the same service-layer code as single actions, audited per-row. |
| **Global non-AI search** for entities | Topbar, next to the Cmd+K button | A `<GlobalSearch>` atom that hits a `GET /api/v1/search?q=...&types=employees,clients,projects` endpoint with cached results. Global search is non-AI by design and always available. It complements the AI command palette (which is routed through Vertex Gemini) for users who prefer keyword search over natural-language queries, and it is the canonical fallback path when `kill_switch.ai` is flipped on. |
| **In-app feedback button** | Topbar overflow menu, bottom of every page footer | Opens a small modal that POSTs to `/api/v1/feedback` and emails the founder via Workspace SMTP Relay. The button is what `docs/GO_TO_MARKET.md` section 8 already promises. |
| **Notifications inbox page** at `/notifications` | (app) route group | Beyond the topbar drawer (13.2). Filterable by kind, paginated. Required for any pilot that has more than ~15 unread notifications, which is "after one week." Must load in <500 ms warm and <2 s cold, and remain responsive with 10k+ historical rows via cursor pagination. |

These add-ons are owned by the relevant feature module (search routes through the employees/clients/projects services; feedback through a tiny `features/feedback/` module). Each one must pass the flawless gate as part of its host feature's gate run.
