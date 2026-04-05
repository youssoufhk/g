# GammaHR v2 Prototype -- Architecture Audit (Phase 2)

**Auditor:** Senior Software Architect
**Date:** 2026-04-05
**Scope:** All 15 prototype HTML pages, 3 shared CSS files, spec documents
**Methodology:** Full source read of every prototype file, cross-referencing all data points, tracing entity flows across pages

---

## Executive Summary

This prototype is a visually polished UI mockup that conceals deep structural rot. Every page is a self-contained island: it tells its own story with its own cast of characters, its own financial numbers, and its own copy of the sidebar template. There is no shared data model, no shared JavaScript, no shared HTML template. The result is a prototype where **nothing adds up across pages**.

The numbers are fabricated independently per page. Revenue figures contradict between dashboard, clients, invoices, and insights. Employee roles, titles, and project assignments mutate between pages. Invoice numbers collide. Pending approval counts are hardcoded identically on every page regardless of what would have changed. At scale, multiple pages show zero evidence of pagination, virtual scrolling, or load-more patterns -- they will break at 200+ employees.

This is not a foundation for production code. It is a visual comp that must be treated as disposable reference material, not as an implementation guide. Every data point in this prototype should be assumed wrong.

**Critical findings:** 27 | **High findings:** 19 | **Medium findings:** 14

---

## 1. Data Integrity Failures

### 1.1 Invoice Number Collision [CRITICAL]

`INV-2026-042` appears in **two completely different contexts**:
- **invoices.html:** INV-2026-042 = Initech / Security Audit / EUR 30,000 / Paid / Issued Feb 1
- **projects.html** (Acme project detail tab): INV-2026-042 = Acme Corp / Draft / EUR 8,500

Same invoice number. Different client. Different project. Different amount. Different status. Different date. The DB schema defines `invoice_number VARCHAR(50) UNIQUE NOT NULL` -- this collision would violate the constraint.

### 1.2 INV-2026-041 Identity Crisis [CRITICAL]

`INV-2026-041` appears in three places with conflicting data:
- **invoices.html:** INV-2026-041 = Acme Corp / CRM Setup / EUR 8,500 / Paid / Jan 15
- **index.html** (notification): "Invoice INV-2026-0041 generated for Meridian Corp (EUR 12,400)" -- note the extra zero in the number AND a completely different client and amount
- **index.html** (activity feed): "Invoice INV-2026-041 generated for Meridian Corp" -- Meridian Corp does not appear as a client anywhere else in the prototype
- **clients.html** (Acme detail): INV-2026-041 appears in the Acme invoice history
- **portal/index.html:** INV-2026-041 also appears in the client portal

"Meridian Corp" appears in the dashboard activity feed and notification panel but is **not listed as a client** on clients.html. The clients page shows only Acme Corp, Globex Corporation, Initech, Contoso Inc, and Umbrella Ltd. Meridian Corp is a ghost entity.

### 1.3 Revenue Numbers Don't Reconcile [CRITICAL]

| Source | Figure | Context |
|--------|--------|---------|
| index.html (dashboard) | EUR 45k | "Apr" revenue bar; also "Revenue snapshot this month: EUR 45,200" in the donut context |
| invoices.html stat card | EUR 45,200 | "Paid This Month" |
| invoices.html stat card | EUR 28,400 | "Total Outstanding" (3 invoices pending) |
| invoices.html stat card | EUR 12,800 | "Overdue" (2 invoices overdue) |

The outstanding invoices (sent but not paid) from the invoice table: INV-2026-048 (EUR 12,400 Sent) + INV-2026-047 (EUR 8,200 Sent) = EUR 20,600. But the card says EUR 28,400 outstanding. That is EUR 7,800 unaccounted for -- unless the overdue amounts (EUR 7,800 + EUR 5,000 = EUR 12,800) are included in "outstanding", in which case 20,600 + 12,800 = EUR 33,400, still not EUR 28,400.

### 1.4 Dashboard Hours vs. Donut Chart [HIGH]

- Dashboard stat card: "Hours This Week: **1,842h**"
- Dashboard donut chart: Billable 1,602h + Internal 240h = **1,842h** (matches)
- But the donut says "this month" while the stat card says "this week"

48 employees working 40h/week = 1,920h maximum. Having 1,842h "this week" implies 96% capacity across all 48 employees. The same 1,842h being "this month" would imply dramatically different utilization. The prototype uses the same number for both "week" and "month" -- one of them is wrong.

### 1.5 Client Revenue vs. Invoice Sum [CRITICAL]

**Acme Corp** on clients.html: YTD Revenue = **EUR 95,900**

Sum of all Acme invoices on invoices.html:
- INV-2026-048: EUR 12,400 (Sent)
- INV-2026-045: EUR 11,200 (Paid)
- INV-2026-043: EUR 5,000 (Overdue)
- INV-2026-041: EUR 8,500 (Paid)
- INV-2026-039: EUR 8,600 (Paid)
Total: **EUR 45,700**

That is EUR 50,200 short of the claimed EUR 95,900. Even if we assume some invoices from before the visible window, the 6-month revenue chart on the client detail page shows: 18k+22k+28k+25k+33k+19k = EUR 145,000 total in the chart -- which is also different from EUR 95,900.

**Globex Corp** on clients.html: YTD Revenue = **EUR 89,000**

Globex invoices on invoices.html:
- INV-2026-047: EUR 8,200 (Sent)
- INV-2026-044: EUR 9,400 (Paid)
- INV-2026-040: EUR 15,000 (Paid)
Total: **EUR 32,600** -- a EUR 56,400 gap from the claimed EUR 89,000.

### 1.6 Acme Project on insights.html vs. Elsewhere [HIGH]

insights.html refers to "Acme Corp Redesign" with a budget of EUR 142,000 of EUR 180,000 consumed. But projects.html calls it "Acme Web Redesign" and no budget figure matches EUR 180,000 anywhere on the projects page.

### 1.7 Dashboard Revenue Trend vs. Invoice Payments [HIGH]

Dashboard revenue bar chart shows: Nov EUR 42k, Dec EUR 45k, Jan EUR 38k, Feb EUR 51k, Mar EUR 47k, Apr EUR 45k.

The invoice list only shows 10 invoices totaling approximately EUR 116,100 across the entire visible history (some spanning Jan-Apr). The monthly revenue bars imply roughly EUR 268k in 6 months. These numbers are fabricated independently.

### 1.8 Pending Approvals Count Contradiction [HIGH]

- Dashboard stat card: 12 pending approvals
- Approvals page shows: 12 total (2 urgent + 10 pending), broken into 7 timesheets, 3 leaves, 2 expenses
- Dashboard pending approvals widget shows: 7 timesheets + 3 leaves + 2 expenses = 12 (matches)
- But the dashboard only shows **4** timesheet approvals in the widget, claiming 7 in the tab count. Only 3 are visible.

---

## 2. Scale Blockers

### 2.1 No Pagination on Critical Lists [CRITICAL]

| Page | List/Table | Items Shown | Pagination? | Scale Impact |
|------|-----------|-------------|-------------|--------------|
| employees.html | Employee grid | 12 cards | **NO** | 200+ employees = massive DOM, unusable scroll |
| employees.html | Employee list view | 12 rows | **NO** | Same |
| gantt.html | Gantt chart rows | 10 rows | **NO** | 200+ rows = browser freeze |
| approvals.html | Approval cards | 12 items | **NO** | 4000 entries/day at scale = page death |
| leaves.html | Calendar view | All events inline | **NO** | No virtual scrolling on calendar |
| timesheets.html | Approval queue | ~7 items | **NO** | PM with 50 direct reports = unmanageable |
| invoices.html | Invoice table | 10 rows | Pagination shown | Only page with pagination controls |
| admin.html | User management | 10 rows | Pagination shown | Has pagination |
| admin.html | Audit log | Shows pagination | "1-10 of 47" | But 47 entries is toy scale |
| projects.html | Project cards | ~10 cards | **NO** | Kanban with 100+ projects = death |
| clients.html | Client cards | 5 cards | **NO** | Not a major issue (few clients typically) |
| insights.html | Data tables | ~8 rows | **NO** | Tables need pagination |
| planning.html | Capacity view | ~10 rows | **NO** | Scales poorly |

Of 15 pages, only **3** show pagination controls. The rest will collapse at scale.

### 2.2 Gantt Chart Has No Virtualization [CRITICAL]

The Gantt chart renders all 10 employees x 30 days = 300 cells with absolute-positioned bars in the DOM. At 200 employees, this becomes 6,000 cells with hundreds of absolutely-positioned bars. There is no:
- Row virtualization
- Column virtualization (for scrolling through months)
- Lazy loading of timeline segments
- Any indication these patterns were considered

### 2.3 Audit Log UI is Fantasy at Scale [HIGH]

The spec says audit_logs are partitioned by month. At 200 users x 20 actions/day = 4,000 entries/day = 120,000/month. The admin page shows a simple table with "Showing 1-10 of 47 entries". There is:
- No date range filter on the audit log
- No entity type filter
- No user filter
- No export mechanism for compliance
- No search within logs

At production scale this UI is useless for compliance or debugging.

### 2.4 Calendar View Cannot Scale [HIGH]

The leaves calendar renders all leave events as inline DOM elements within each calendar day cell. At 200 employees with overlapping leaves, a single day cell could contain 10-20 event elements. The calendar shows no:
- Event stacking ("+ 5 more" overflow)
- List view alternative for high-density days
- Lazy loading of months

### 2.5 Employee Directory Has No Server-Side Search Indication [MEDIUM]

The search input fires client-side JS filtering only. At 200+ employees, the prototype gives no indication of debounced API calls, loading states during search, or paginated search results.

---

## 3. Permission Model Failures

### 3.1 No Role-Based View Differentiation [CRITICAL]

The entire prototype shows exclusively the **Admin** view. Sarah Chen is logged in as "Admin" on every page. There is **zero demonstration** of:
- What an **Employee** sees (should not see Approvals, Admin, or other people's timesheets/expenses)
- What a **Project Manager** sees (should see only their team's data)
- What a **Client Portal** user sees (portal/index.html exists but is disconnected)

The APP_BLUEPRINT.md spec explicitly states:
> "Cards are role-aware: Employee sees: My hours, My utilization, My pending, My leave balance. PM sees: Team hours, Team utilization, Pending approvals, Active projects."

None of this is demonstrated. The prototype shows admin-level data everywhere with no attempt to show what would be hidden or modified for other roles.

### 3.2 Self-Approval Not Prevented in UI [HIGH]

The DB schema has `CONSTRAINT no_self_approval CHECK (approved_by IS NULL OR approved_by != user_id)`. However, the prototype shows Sarah Chen (the logged-in admin) as having pending items in the approval queue. If Sarah submits her own timesheet, the prototype UI shows her own approve/reject buttons -- there is no UI indication that self-approval is blocked.

### 3.3 Client Portal Is Disconnected [HIGH]

portal/index.html exists and shows a client-facing view, but:
- It shares no data with the main prototype (project names partially overlap but data does not match)
- The portal shows John Smith as "Project Manager" for Acme, but John Smith is "Senior Developer" on the dashboard, "Project Manager" on employees.html, and "Backend Engineer" on gantt.html (see Section 4.2)
- No indication of how portal access is gated or what clients can vs. cannot see

---

## 4. Cross-Page Entity Consistency Failures

### 4.1 Sarah Chen's Email [CRITICAL]

| Page | Email |
|------|-------|
| index.html | sarah.chen@gammahr.io |
| employees.html | sarah.chen@gamma.io |
| clients.html | sarah.chen@gammahr.com |
| invoices.html | sarah.chen@gammahr.com |
| timesheets.html | sarah.chen@gammahr.io |
| expenses.html | sarah.chen@gammahr.io |
| leaves.html | sarah.chen@gammahr.io |
| insights.html | sarah.chen@gammahr.io |
| approvals.html | sarah.chen@gammahr.io |
| admin.html | sarah.chen@gammahr.io |
| planning.html | sarah.chen@gammahr.io |
| projects.html | sarah.chen@gammahr.io |

Three different domains. This makes it impossible to define a single source of truth for the user record.

### 4.2 Employee Role/Title Mutations [CRITICAL]

| Employee | index.html | employees.html | gantt.html | projects.html | clients.html |
|----------|-----------|---------------|-----------|--------------|-------------|
| Sarah Chen | Engineering Lead | Sr. Software Engineer | (various) | Senior Developer | Senior Developer |
| John Smith | Senior Developer | Project Manager | Backend Engineer | (not specific) | (not specific) |
| Bob Taylor | Project Manager | Backend Developer | Backend Engineer / Full Stack Dev | -- | -- |
| Emma Laurent | QA Lead | HR Manager | QA Engineer / Project Manager | -- | QA Engineer |
| Carol Kim | Backend Developer | Data Analyst | Backend Engineer | -- | -- |

**Emma Laurent** has the worst identity crisis: she is simultaneously an HR Manager (employees.html card), a QA Lead (index.html), a QA Engineer (gantt.html, employees.html list view, clients.html), and a Project Manager (gantt.html Globex panel). Four different roles for one person.

**Bob Taylor** is a "Project Manager" on the dashboard, a "Backend Developer" on the employee directory, a "Backend Engineer" on the Gantt chart, and a "Full Stack Dev" in the Gantt chart data. He is also shown as "BENCH" on employees.html but is actively assigned to "Helix Migration" on the dashboard.

### 4.3 Project Name Inconsistencies [HIGH]

The dashboard (index.html) uses a completely different project namespace than the rest of the prototype:

| Dashboard | Employees/Invoices/Timesheets |
|-----------|-------------------------------|
| Quantum Platform | Acme Web Redesign |
| Meridian Portal | Globex Phase 2 |
| Helix Migration | (no equivalent) |
| Atlas Redesign | (partially matches) |
| Infra Overhaul | (partially matches) |

The dashboard shows Sarah Chen on "Quantum Platform" while employees.html shows her on "Acme Web Redesign" and "Initech API". The dashboard shows John Smith on "Meridian Portal" while employees.html shows him on "Globex Phase 2".

### 4.4 Employee Count Mismatch [HIGH]

| Source | Count |
|--------|-------|
| index.html stat card | 48 Active Employees |
| employees.html subtitle | "12 team members across 6 departments" |
| employees.html grid | 12 employee cards visible |
| gantt.html | "Showing 10/48 team members" |
| insights.html AI response | "team of 48 members" |

The prototype oscillates between 12 (what is shown) and 48 (what is claimed). If there are 48 employees, where are the other 36? No pagination, no "load more", no indication they exist.

---

## 5. Impossible Business States

### 5.1 Pending Expense on Dashboard, No Matching Expense Page Entry [HIGH]

The dashboard shows Bob Taylor's EUR 340 hotel expense as pending approval with an AI flag for anomaly. The expenses page shows an approval queue but the specific EUR 340 entry details are inconsistent with what would be on a "sent" invoice.

### 5.2 Emma Laurent: On Leave AND Online [CRITICAL]

- index.html Live Presence: Emma Laurent shows as **"on-leave"** (red dot), with detail "On leave until Apr 7"
- index.html notification: "Leave approved: Emma Laurent's vacation (Apr 14-18) approved"
- Dashboard date: "Monday, April 6, 2026"

If today is April 6, Emma is "on leave until Apr 7" (plausible, she returns tomorrow). But the notification says her **vacation** Apr 14-18 was just "approved" -- that is a future leave, not the current one. So she has TWO leave periods but only one is shown in presence. Meanwhile on employees.html, Emma Laurent is shown as **Online** (green dot) with 100% utilization. She cannot be simultaneously on leave AND online at 100% utilization.

### 5.3 Alice Wang: Conflicting Leave States [HIGH]

- index.html dashboard: Shows Alice Wang's leave request "Apr 21-25" as **pending** approval
- index.html activity feed: "John Smith approved Alice Wang's leave (Apr 14-18)" -- already approved, different dates
- employees.html: Alice Wang shows "On Leave (returns Apr 12)" -- yet another date range
- approvals.html: Alice Wang has a pending leave "Apr 28-29, 2 days"
- leaves.html: Alice Wang has leave events on different dates

Alice Wang has at least 3-4 different leave date ranges across pages with conflicting statuses.

### 5.4 Bob Taylor: On Bench AND Assigned [HIGH]

- employees.html: Bob Taylor shows **BENCH** badge with 0% utilization
- index.html dashboard: Bob Taylor is working on "Helix Migration" with 68% utilization
- insights.html: "Bob has been on bench 3 weeks" with recommendation to assign to Initech

He cannot be simultaneously on bench and working Helix Migration at 68% utilization.

### 5.5 Overdue Invoice on Sent Status [MEDIUM]

INV-2026-043 (Acme, EUR 5,000) is marked "Overdue" with due date Mar 15. This is plausible (it is past due). However, the dashboard revenue chart shows EUR 45k for April as actual revenue -- if EUR 12,800 is still overdue/outstanding, the "Paid This Month: EUR 45,200" figure on invoices.html cannot include these overdue amounts, yet the dashboard seems to.

---

## 6. Architecture Debt

### 6.1 Zero Shared JavaScript [CRITICAL]

Every single HTML file contains its own `<script>` block at the bottom. There is no shared JS file. The following patterns are duplicated across **all 13+ pages**:

| Pattern | Approx Lines Per Page | Total Duplication |
|---------|----------------------|-------------------|
| Sidebar collapse toggle | ~10 | ~130 lines |
| Mobile menu open/close | ~8 | ~104 lines |
| Command palette open/close/keyboard | ~25 | ~325 lines |
| Notification panel toggle | ~15 | ~195 lines |
| User dropdown toggle | ~12 | ~156 lines |
| Tab switching logic | ~20 | ~260 lines |
| Toast notification creation | ~15 | ~195 lines |
| Click-outside-to-close | ~10 | ~130 lines |
| Lucide icon initialization | ~1 | ~13 lines |
| State toggle (empty/populated) | ~10 | ~130 lines |

**Estimated total: ~1,500+ lines of duplicated JavaScript** across the prototype. Each page reimplements the same sidebar, command palette, notification panel, and dropdown behaviors.

### 6.2 Sidebar Template Drift [CRITICAL]

Every page has a copy-pasted sidebar. While the **nav items and structure are consistent** across most pages (same sections, same links, same badge counts), the HTML formatting varies:

- **insights.html** uses a compressed single-line format per nav item
- All other pages use multi-line format with full indentation
- Badge counts are **hardcoded identically** everywhere: Timesheets=7, Expenses=2, Leaves=3, Approvals=12

The badge counts are frozen. If a user approves a timesheet, the count stays at 7. If a leave request is resolved, it stays at 3. In production this would need real-time badge updates via WebSocket or polling -- the prototype gives no indication of how this would work.

### 6.3 Massive Inline CSS [CRITICAL]

Every HTML file contains a `<style>` block with page-specific CSS. The scale of inline CSS:

| Page | Approx Inline CSS Lines |
|------|------------------------|
| index.html | ~300 lines |
| employees.html | ~420 lines |
| gantt.html | ~500+ lines |
| timesheets.html | ~530 lines |
| expenses.html | ~470 lines |
| leaves.html | ~500 lines |
| projects.html | ~450 lines |
| clients.html | ~300 lines |
| invoices.html | ~225 lines |
| approvals.html | ~350 lines |
| insights.html | ~300 lines |
| planning.html | ~350 lines |
| admin.html | ~400 lines |
| auth.html | ~200 lines |
| portal/index.html | ~350 lines |

**Estimated total: ~5,200+ lines of inline CSS.** Many patterns are duplicated across pages:
- `.filter-bar` styles reimplemented on employees, invoices, expenses, approvals, clients
- `.empty-state` styles reimplemented on 8+ pages with slight variations
- `.approval-item` / `.approval-card` styles duplicated between dashboard, approvals, timesheets, expenses
- Revenue bar chart CSS duplicated between index.html and clients.html

Meanwhile the shared `_components.css` already defines a `.filter-bar-standard` class (added in Phase 1 Round 2) that most pages do not use -- they each roll their own.

### 6.4 No Component Extraction [HIGH]

There is no `include`, `partial`, or component system. In production (Next.js), these would be components:
- `<Sidebar>` -- currently 80+ lines of HTML duplicated 15 times
- `<TopHeader>` -- currently 30+ lines duplicated 15 times
- `<NotificationPanel>` -- currently 30+ lines duplicated 15 times (with different notifications per page)
- `<UserDropdown>` -- currently 15+ lines duplicated 15 times
- `<CommandPalette>` -- currently 50+ lines duplicated on most pages
- `<FilterBar>` -- reimplemented differently on every page
- `<StatCard>` -- reimplemented differently on every page
- `<EmptyState>` -- reimplemented differently on every page

### 6.5 State Management is URL Hash Only [HIGH]

All pages use `window.location.hash` for in-page navigation (list view vs detail view, tab switching). There is:
- No localStorage for persisting filter states, sidebar collapse state, or view preferences
- No sessionStorage for anything
- No URL query parameters for shareable filtered views
- No state synchronization between pages
- No indication of how the real app would manage client-side state (Redux, Zustand, URL state, etc.)

The spec mentions "Saved Views" (`saved_views` table) but the prototype has no mechanism to persist or restore view state.

---

## 7. Search/Filter Inconsistency

### 7.1 Filter Bar Patterns Vary Per Page [HIGH]

| Page | Filter Pattern |
|------|---------------|
| employees.html | Custom `.filter-bar` with search + 3 dropdowns + view toggle |
| invoices.html | Different `.filter-bar` with 2 dropdowns + date range |
| expenses.html | Stats grid + table with inline filters |
| approvals.html | Tabs + sort dropdown + department dropdown + employee dropdown |
| clients.html | Status dropdown + industry dropdown + search (different order) |
| projects.html | Tabs (kanban/table/completed) act as primary filter |
| timesheets.html | Week navigation as primary filter (no search) |
| leaves.html | Calendar view toggle + month navigation |
| gantt.html | Custom toolbar with filter dropdowns |
| insights.html | Natural language query bar (unique) |
| planning.html | Scenario dropdowns |
| admin.html | Tab-based sections |

The APP_BLUEPRINT spec (Section 1.3) prescribes a **universal filtering pattern** with search + filter + sort + view + export + saved views + active filter chips. None of the pages fully implement this spec. The `_layout.css` file defines `.filter-bar-standard` but it is used by **zero pages**.

### 7.2 No Active Filter Chips Anywhere [MEDIUM]

The `_components.css` defines `.active-filters` and `.filter-chip` classes. Not a single page uses them. The spec requires showing active filters with removable chips -- this pattern is entirely missing from the prototype.

### 7.3 No Export Button Consistency [MEDIUM]

Some pages have Export buttons (employees, invoices), others do not (timesheets, leaves, approvals). The spec requires every list to support CSV/PDF/clipboard export.

---

## 8. Cross-Page Consistency Matrix

### 8.1 Entity Names

| Entity | index.html | employees.html | gantt.html | projects.html | invoices.html | clients.html | insights.html |
|--------|-----------|---------------|-----------|--------------|--------------|-------------|--------------|
| Sarah Chen role | Engineering Lead | Sr. Software Engineer | -- | -- | -- | Senior Developer | -- |
| John Smith role | Senior Developer | Project Manager | Backend Engineer | -- | -- | -- | -- |
| Bob Taylor role | Project Manager | Backend Developer | Backend Eng / Full Stack | -- | -- | -- | -- |
| Emma Laurent role | QA Lead | HR Manager / QA Engineer | QA Eng / Project Manager | -- | QA Engineer | QA Engineer | -- |
| Carol Kim role | Backend Developer | Data Analyst | Backend Engineer | -- | -- | -- | -- |
| Sarah's project | Quantum Platform | Acme Web Redesign | Acme Web Redesign | -- | Acme Web Redesign | -- | -- |
| John's project | Meridian Portal | Globex Phase 2 | Globex Phase 2 | -- | -- | -- | -- |
| Bob status | Travel/68% util | BENCH/0% util | Bench | -- | -- | -- | Bench 3 weeks |
| Emma status | On leave | Online/100% util | -- | -- | -- | -- | -- |
| Employee count | 48 | 12 | 10 shown / 48 claimed | -- | -- | -- | 48 |

### 8.2 Financial Amounts

| Entity | invoices.html | clients.html | index.html | insights.html |
|--------|--------------|-------------|-----------|--------------|
| Acme YTD Revenue | EUR 45,700 (sum of visible invoices) | EUR 95,900 | -- | EUR 142,000 (budget consumed, not revenue) |
| Globex YTD Revenue | EUR 32,600 (sum of visible) | EUR 89,000 | -- | -- |
| Monthly revenue Apr | -- | EUR 19k (Acme chart) | EUR 45k (total) | -- |
| Total Outstanding | EUR 28,400 | -- | -- | -- |
| Overdue | EUR 12,800 | -- | -- | -- |
| Expenses This Month | -- | -- | EUR 24,380 | -- |

### 8.3 Approval Counts

| Entity | index.html sidebar | All other sidebars | index.html widget | approvals.html |
|--------|-------------------|-------------------|-------------------|----------------|
| Timesheets pending | 7 | 7 | 7 (but only 4 shown) | 7 |
| Leaves pending | 3 | 3 | 3 | 3 |
| Expenses pending | 2 | 2 | 2 | 2 |
| Total | 12 | 12 | 12 | 12 |

Counts are consistent because they are hardcoded. They never change. No page demonstrates what happens when an approval is resolved.

---

## 9. Specific Technical Issues

### 9.1 Header Structure Inconsistency [MEDIUM]

Most pages have `<h2 class="page-title">` in the top header bar. However:
- **projects.html** has NO page title in the header (the mobile menu button is immediately followed by the search bar)
- **employees.html** has NO page title in the header (search bar in header-left, which is a different pattern)

### 9.2 Notification Content Varies Per Page [MEDIUM]

Each page has different hardcoded notifications in the notification panel -- they are "contextual" to the page, which is actually a good design decision. But in production, notifications would come from a single API endpoint, not be page-specific. The prototype does not demonstrate this.

### 9.3 No Error States Anywhere [HIGH]

Zero pages show:
- Network error states
- Form validation errors (inline or summary)
- 404 / not found states
- Permission denied states
- Rate limit / too many requests states
- Server error / degraded mode states

The spec mentions many of these. The prototype pretends everything always works.

### 9.4 No Loading States [HIGH]

Zero pages show:
- Skeleton loaders for table/card content
- Loading spinners on data fetch
- Progress indicators on long operations (invoice generation, bulk approval)
- Optimistic UI patterns

The `_components.css` defines `.btn-loading` with a spinner animation, but no page uses it.

### 9.5 Bottom Navigation Bar Exists in CSS But Not in HTML [MEDIUM]

`_layout.css` defines `.bottom-nav` and `.bottom-nav-item` for mobile navigation. However, only a few pages actually include the `<nav class="bottom-nav">` HTML. This mobile-critical element is inconsistently implemented.

### 9.6 Auth Page is Minimal [MEDIUM]

auth.html exists with a login form, but:
- No SSO flow demonstration
- No MFA flow (spec requires TOTP)
- No passkey flow (spec requires WebAuthn)
- No password reset flow
- No onboarding wizard (spec describes 4-step setup)

---

## 10. Impossible State Summary Table

| # | State | Page(s) | Severity |
|---|-------|---------|----------|
| 1 | INV-2026-042 for both Initech (EUR 30k, Paid) and Acme (EUR 8.5k, Draft) | invoices.html, projects.html | CRITICAL |
| 2 | Emma Laurent: On Leave + Online + 100% utilization simultaneously | index.html, employees.html | CRITICAL |
| 3 | Bob Taylor: BENCH/0% + Helix Migration/68% simultaneously | employees.html, index.html | CRITICAL |
| 4 | Alice Wang: 3+ conflicting leave date ranges with conflicting statuses | index.html, employees.html, approvals.html | HIGH |
| 5 | "Meridian Corp" referenced but does not exist as a client | index.html | HIGH |
| 6 | 48 employees claimed, 12 shown, no pagination | index.html, employees.html | HIGH |
| 7 | EUR 95,900 YTD revenue for Acme but only EUR 45,700 in invoices | clients.html, invoices.html | CRITICAL |
| 8 | "Hours This Week" and "Billable % This Month" use same 1,842h figure | index.html | HIGH |
| 9 | Outstanding EUR 28,400 does not match sum of sent/overdue invoices | invoices.html | HIGH |
| 10 | Sarah Chen has 3 different email domains across pages | All pages | CRITICAL |
| 11 | 5 employees have different job titles on different pages | index.html, employees.html, gantt.html | CRITICAL |
| 12 | Dashboard projects do not match rest of prototype | index.html vs all others | CRITICAL |

---

## 11. Recommendations

### 11.1 For Production Architecture

1. **Shared data fixture:** Create a single JSON/TypeScript data file that ALL pages reference. Never hardcode entity data in HTML.
2. **Component library:** Extract sidebar, header, notification panel, command palette, filter bar, stat card, empty state, and toast into shared components before any page work begins.
3. **Pagination on everything:** Every list/table must support pagination from day one. Design the API with cursor-based pagination.
4. **Role-based rendering:** Create 3 prototype variants (Admin, PM, Employee) or use a role switcher to demonstrate permission differences.
5. **Real financial chain:** Build the prototype with numbers that add up: timesheet hours x rates = invoice line items, sum of line items = invoice total, sum of paid invoices = revenue figures.

### 11.2 For Prototype Iteration

1. **Fix the data:** Reconcile ALL numbers before showing this to stakeholders. The current prototype will erode trust if anyone cross-references pages.
2. **Add pagination indicators:** Even if non-functional, show "Showing 1-20 of 248" on every list.
3. **Standardize roles:** Pick one title per employee and use it everywhere.
4. **Kill the phantom entities:** Remove "Meridian Corp" from the dashboard or add it to clients.
5. **Fix the email:** Pick one domain (gammahr.io) and use it everywhere.

---

## Appendix: Files Audited

| File | Lines (approx) | Inline CSS | Inline JS |
|------|----------------|-----------|-----------|
| index.html | 1700+ | ~300 | ~200 |
| employees.html | 1900+ | ~420 | ~350 |
| gantt.html | 1800+ | ~500 | ~200 |
| timesheets.html | 2000+ | ~530 | ~300 |
| expenses.html | 1700+ | ~470 | ~300 |
| leaves.html | 1700+ | ~500 | ~250 |
| projects.html | 2200+ | ~450 | ~300 |
| clients.html | 1500+ | ~300 | ~200 |
| invoices.html | 1200+ | ~225 | ~150 |
| approvals.html | 1400+ | ~350 | ~250 |
| insights.html | 1400+ | ~300 | ~200 |
| planning.html | 1200+ | ~350 | ~150 |
| admin.html | 1700+ | ~400 | ~300 |
| auth.html | 400+ | ~200 | ~50 |
| portal/index.html | 900+ | ~350 | ~100 |
| _tokens.css | 226 | N/A | N/A |
| _components.css | 600+ | N/A | N/A |
| _layout.css | 730+ | N/A | N/A |

**Total prototype code: approximately 23,000+ lines of HTML/CSS/JS with roughly 5,200 lines of inline CSS and 3,300 lines of inline JS, nearly all duplicated.**
