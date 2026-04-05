# AUDIT: Dashboard & Navigation Coherence

**Auditor:** Critique Agent 1 — Dashboard & Navigation Coherence
**Date:** 2026-04-05
**Scope:** `index.html` (Dashboard), `_layout.css`, sidebar nav across all 14 HTML pages, portal
**Verdict:** Structurally sound prototype with serious copy-paste drift and an identity crisis on the Analytics/Insights page. Multiple broken links and inconsistent badge counts will confuse anyone who actually clicks around.

---

## SECTION 1: NAVIGATION AUDIT

### 1.1 The Analytics / Insights Identity Crisis — SEVERITY: CRITICAL

The single worst problem in this entire prototype. There is a page called `insights.html`. It appears in the sidebar **twice** under two different labels in two different sections:

| Section   | Label      | href            | Icon            |
|-----------|------------|-----------------|-----------------|
| Finance   | Analytics  | insights.html   | bar-chart-3     |
| AI        | Insights   | insights.html   | sparkles        |

Both point to the exact same file. The page title says "Insights", the header says "AI Insights & Analytics", and the active state is only set on the AI section's "Insights" item. The Finance section's "Analytics" item is **never** active on any page — it's a ghost nav item.

The blueprint (section 20.1) specifies these as conceptually separate:
- **Finance > Analytics** — revenue/financial analytics
- **AI > Insights** — AI-powered predictions

The prototype collapsed them into one page. Either split them or kill the duplicate nav entry. Right now a user clicking "Analytics" under Finance lands on an AI page with sparkle icons. That is confusing.

**Rating: 2/10**

### 1.2 Broken Link: `analytics.html` on employees.html — SEVERITY: CRITICAL

`employees.html` line 483: the Finance section links to `href="analytics.html"` — a file that **does not exist**. Every other page links to `insights.html` for this same item. This is a 404 in the prototype. Pure copy-paste mistake.

**Affected file:** `employees.html:483`
**Rating: 0/10** — a broken link is a broken link.

### 1.3 Approvals Icon Inconsistency — SEVERITY: HIGH

The Approvals nav item uses two different Lucide icons across pages:

| Icon              | Used on                                                      |
|-------------------|--------------------------------------------------------------|
| `check-square`    | index.html, expenses.html, leaves.html, projects.html, clients.html, invoices.html, approvals.html, admin.html, timesheets.html, insights.html, planning.html |
| `check-circle`    | employees.html, gantt.html                                   |

`check-square` is the correct one per the majority. `employees.html:497` and `gantt.html:776` are the outliers. Users with icon familiarity (and there are many) will notice the difference in collapsed sidebar mode where icons are the only affordance.

**Rating: 3/10**

### 1.4 Badge Count Inconsistency — SEVERITY: HIGH

Badge counts are supposed to represent live pending items. In a static prototype, they should at least be consistent. They are not.

**Approvals badge:**
| Badge Value | Pages |
|-------------|-------|
| `12`        | index.html, timesheets.html, expenses.html, leaves.html, projects.html, clients.html, invoices.html, approvals.html, admin.html, insights.html, planning.html |
| `3`         | employees.html, gantt.html |

The employees and gantt pages show "3" pending approvals while every other page shows "12". This instantly breaks the illusion of a coherent prototype. A reviewer clicking from Dashboard (12) to Gantt (3) will think data is being filtered by context, when actually it's just a copy error.

**Timesheets/Expenses/Leaves badges:**
| Nav Item    | Expected | employees.html | gantt.html |
|-------------|----------|----------------|------------|
| Timesheets  | 7        | **missing**    | **missing** |
| Expenses    | 2        | **missing**    | **missing** |
| Leaves      | 3        | **missing**    | **missing** |

`employees.html` and `gantt.html` have NO badges on Timesheets, Expenses, or Leaves nav items. Every other page has them. This is a clear indicator these two pages were built from a different template version and never synced.

**Rating: 2/10**

### 1.5 Missing Nav Items per Blueprint — SEVERITY: MEDIUM

The blueprint (section 20.1) specifies these nav items that are completely absent from the prototype sidebar:

1. **Calendar** — listed under MAIN in the blueprint. Not in any page's sidebar.
2. **Departments** — listed under ADMIN. Not in any page's sidebar.
3. **Audit Log** — listed under ADMIN. Not in any page's sidebar.
4. **Ask AI** — listed under AI. Not in any page's sidebar.
5. **Account & Settings** — listed under BOTTOM. Not in any page's sidebar.
6. **Help & Shortcuts** — listed under BOTTOM. Not in any page's sidebar.

The sidebar footer only has a collapse button. No account settings, no help. This is a significant gap from the spec.

**Rating: 4/10** — acceptable for a first prototype pass, but the Calendar is a core feature for an HR app and its absence is glaring.

### 1.6 Active State Correctness

Every page correctly sets `class="nav-item active"` on its own sidebar entry. I verified all 13 pages:

| Page              | Active item set on    | Correct? |
|-------------------|-----------------------|----------|
| index.html        | Dashboard             | Yes      |
| timesheets.html   | Timesheets            | Yes      |
| expenses.html     | Expenses              | Yes      |
| leaves.html       | Leaves                | Yes      |
| projects.html     | Projects              | Yes      |
| clients.html      | Clients               | Yes      |
| planning.html     | Resource Planning     | Yes      |
| gantt.html        | Gantt Chart           | Yes      |
| invoices.html     | Invoices              | Yes      |
| insights.html     | Insights (AI section) | Partially* |
| employees.html    | Team Directory        | Yes      |
| approvals.html    | Approvals             | Yes      |
| admin.html        | Configuration         | Yes      |

*`insights.html` sets active on the AI > Insights item but NOT on the Finance > Analytics item, even though both point to the same page. This means navigating via Finance > Analytics will show the page but the Finance nav item won't highlight — only the AI one will. Disorienting.

**Rating: 7/10** — the active states themselves are correctly implemented, the problem is the dual-entry architecture.

### 1.7 Nav Item Order Consistency

The ordering is identical across all pages: Main (Dashboard, Timesheets, Expenses, Leaves) > Work (Projects, Clients, Resource Planning, Gantt Chart) > Finance (Invoices, Analytics) > Admin (Team Directory, Approvals, Configuration) > AI (Insights).

**Rating: 9/10** — order is consistent everywhere.

### 1.8 Icon-to-Label Consistency

All icon-label pairings are consistent across pages (excluding the Approvals icon issue in 1.3):

| Label             | Icon               | Consistent? |
|-------------------|--------------------|-------------|
| Dashboard         | layout-dashboard   | Yes         |
| Timesheets        | clock              | Yes         |
| Expenses          | receipt            | Yes         |
| Leaves            | palm-tree          | Yes         |
| Projects          | folder-kanban      | Yes         |
| Clients           | building-2         | Yes         |
| Resource Planning | calendar-range     | Yes         |
| Gantt Chart       | gantt-chart        | Yes         |
| Invoices          | file-text          | Yes         |
| Analytics         | bar-chart-3        | Yes         |
| Team Directory    | users              | Yes         |
| Approvals         | check-square/check-circle | NO (see 1.3) |
| Configuration     | settings           | Yes         |
| Insights          | sparkles           | Yes         |

**Rating: 8/10**

---

## SECTION 2: DASHBOARD AUDIT

### 2.1 Does the Dashboard Tell a Story? — RATING: 6/10

It tries. The greeting + date + KPI cards + two-column layout follows the blueprint's "command center" concept. But it falls short of the "immediately actionable" promise:

**What works:**
- The greeting with date grounds the user in time context
- KPI cards have sparklines — good information density
- The pending approvals widget with tabs is genuinely useful and actionable
- Live presence panel gives social awareness
- AI alerts surface real problems (duplicate expense, timesheet gap, overallocation)

**What fails:**
- The blueprint specifies a "Hero: Week at a Glance" section with a mini week timeline showing hours logged per day with a "Quick Log Today's Time" CTA. This is **completely missing**. The dashboard has no personal timesheet context at all. This was supposed to be the very first thing the user sees.
- There is no "Upcoming" section (next 7 days of events/deadlines) — specified in the blueprint.
- There is no "Recent Activity Feed" — specified in the blueprint.
- The "Utilization Heatmap" (12-week grid) from the blueprint is missing. Instead there's a "Team Availability" table which is useful but different.
- The story it tells is "here are some numbers and here are some people" — not "here's what needs your attention right now, here's what's coming, and here's the state of your business."

### 2.2 Information Hierarchy — RATING: 5/10

The hierarchy is:
1. Greeting (low-value, takes up space)
2. 6 KPI cards (high-value, but 6 is too many at once)
3. Two-column split: Team Availability + AI Alerts + Mini Gantt (left) vs Presence + Approvals + Revenue (right)
4. Donut chart (bottom, full width)

**Problems:**
- The greeting is massive (`text-display-lg`). "Good morning, Sarah" takes prime viewport real estate and provides zero information density. The blueprint balances this with the hero timesheet widget right below it — but that widget is missing, so the greeting is just wasted space.
- 6 KPI cards in a single row at 1440px+ is fine, but at 1024-1439px it's 3x2 which pushes the actual actionable content below the fold. The blueprint specifies 4 stat cards, not 6.
- "Active Employees" (48) and "Open Projects" (14) are status indicators, not action triggers. They belong in a secondary position, not alongside "Pending Approvals" (12) which demands immediate action.
- The pending approvals widget is in the RIGHT column (40% width). This is the single most important action item for a manager, and it's squeezed into the narrower column. It should be left column or top-row.
- The donut chart at the bottom is decorative. It repeats the "87% billable" figure already shown in the KPI cards. Redundant.

### 2.3 KPI Cards — RATING: 7/10

**What works:**
- Clean card layout with stat-value + trend indicator + sparkline
- Good use of color coding (success for up trends, warning/error for alerts)
- Sparklines give 30-day context without words
- The "3 urgent" warning indicator on Pending Approvals is attention-grabbing

**What fails:**
- No click targets. The blueprint says "Click: navigates to relevant detail page." None of the KPI cards are clickable. They're just `<div class="stat-card">`, not links. A user seeing "12 Pending Approvals" should be able to click the card to go to the approvals page. They can't.
- The blueprint specifies role-aware cards (employee sees different cards than PM/admin). The prototype shows only admin view. Acceptable for a prototype, but worth noting.
- "Expenses This Month" trend says "-8% vs last month" styled with the `down` class. Is lower expenses good or bad? The red down-arrow implies bad, but in many orgs lower expenses is positive. The visual semantics are ambiguous.

### 2.4 Team Availability Table — RATING: 7/10

**What works:**
- Utilization bars with color-coded thresholds (red at 95%, green at 75-90%)
- Status badges (Active, Travel, Gap, Leave soon) are clear
- Sortable column headers
- "View all" link goes to employees.html

**What fails:**
- Employee name links all go to `employees.html` (the directory page), not to individual employee profiles. `employees.html` is a list page. Clicking "Sarah Chen" should deep-link to her profile, not dump you on the full directory. The blueprint (section 1.1) is explicit: "Every employee name is a clickable link to their profile page."
- Project links all go to `projects.html` (list page), same problem. "Quantum Platform" should link to that project's detail page.
- The table shows 8 employees but the KPI says 48 active. There's no indication this is filtered or paginated.
- Sort is toast-only feedback, no actual reordering happens. Acceptable for a prototype, but the toast message "Table sorted by name" when nothing changes is awkward.

### 2.5 AI Alerts Widget — RATING: 8/10

Best widget on the dashboard. Actually actionable.

**What works:**
- Clear severity badges (Warning, Error)
- Specific, contextual alerts with entity links
- "Dismiss" and "Investigate" action buttons
- Ties to real business problems (duplicate expense, missing timesheet, overallocation)

**What fails:**
- "Investigate" buttons go nowhere. No click handler, no navigation target.
- Employee links (Bob Taylor, David Park, Sarah Chen) all go to `employees.html` (list page) — same problem as the team table.
- "3 new" badge on card header but no mechanism to mark them as read.

### 2.6 Mini Gantt Preview — RATING: 6/10

**What works:**
- Compact visualization showing 5 employees x 5 days
- Color-coded project legend
- "Full Gantt" link correctly goes to gantt.html

**What fails:**
- The cells are empty colored rectangles with no tooltips or interactivity. You can see colors but not what they mean until you cross-reference the legend below.
- Employee name links go to employees.html (list), not profiles.
- The gantt doesn't show hours or allocation percentages — just "colored = busy, empty = free." The blueprint specifies the hero section should show hours logged per day.
- This replaced the "Week at a Glance" hero widget from the blueprint. The blueprint's version was personal (YOUR hours this week). This is a team-level view. Different purpose.

### 2.7 Live Presence Panel — RATING: 7/10

**What works:**
- Clear status indicators (green = online, yellow = away, red = on leave, gray = offline)
- Activity descriptions ("Working on Quantum Platform", "Code review - Meridian Portal")
- Proper ordering: online first, then away, then on leave, then offline

**What fails:**
- All name links go to `employees.html` (list page). Again.
- Badge says "8 online" but counting the green dots, I see 6 online + 2 away + 1 on-leave + 1 offline = 10 total, 6 online. The badge says 8. Bad math.
- No grouping headers (Online / Away / On Leave / Offline) as specified in the blueprint.
- No "Click any name -> employee profile" as specified — all links are generic.

### 2.8 Pending Approvals Widget — RATING: 8/10

**What works:**
- Tabbed interface (Timesheets 7 / Leaves 3 / Expenses 2) is compact and useful
- Approve/Reject buttons with immediate feedback (toast + opacity fade)
- Tab counts match sidebar badge counts (7+3+2=12 = approvals badge)
- "View all approvals" link correctly goes to approvals.html
- Tab state persists via URL hash

**What fails:**
- Tab JS: the first tab doesn't get `.active` class on page load until `activateTab('tab-timesheets')` runs — momentary flash of unstyled tab content is possible
- Reject buttons have no confirmation dialog. In a real app this is dangerous; in a prototype it should still show a pattern.
- Approval count on tab (Timesheets: 7) but only 4 items displayed in the tab. The other 3 are... where?

### 2.9 Revenue Trend — RATING: 6/10

**What works:**
- 6-month bar chart with values
- Clean minimal design
- "Details" link goes to insights.html

**What fails:**
- No target/goal line for comparison. The blueprint says "Current month actual vs. target" with a progress bar. This is just bars.
- No current month total callout (the blueprint specifies "This month: X, Target: Y")
- Hovering bars has a style change (`revenue-bar:hover`) but no tooltip with actual numbers. The labels at the top are always visible but small.
- The April bar shows the full month value, but today is April 5th. Either the data is wrong or there should be a "projected" indicator.

### 2.10 Donut Chart (Billable vs Internal) — RATING: 5/10

**What works:**
- SVG donut is clean and renders well
- Legend with values is clear
- Total line with separator is a nice touch

**What fails:**
- Repeats information already in the KPI cards (87% billable)
- Full-width section for a simple donut is wasteful — this could be a sidebar widget
- Not actionable. No links, no drill-down.
- "This month" badge but no comparison to previous month or target
- No hover interactivity on the SVG segments

### 2.11 Empty States — RATING: 8/10

**What works:**
- Toggle button in bottom-right to switch populated/empty states — excellent for prototype review
- Empty states have relevant icons, clear messaging, and CTAs
- KPI empty state directs to timesheets, team empty state directs to employees page

**What fails:**
- The donut section has no empty state — it just disappears via `populated-content` class. If showing the empty view, the page ends abruptly after the single empty card.

---

## SECTION 3: HEADER AUDIT

### 3.1 Search / Command Palette — RATING: 7/10

**What works:**
- Cmd+K shortcut works (tested via JS code review)
- Click on search bar triggers palette
- Escape closes it
- Grouped results: Quick Actions, People, Pages
- Keyboard hint (Cmd+K) displayed in search bar
- Present on every page (confirmed across all 13 pages)

**What fails:**
- The palette is static HTML. No actual search filtering happens when you type. Acceptable for a prototype, but the input field is there and does nothing.
- Command palette items have no click handlers to navigate. "Dashboard" in the Pages section doesn't link anywhere. "Log Time" in Quick Actions has no handler.
- Two pages (gantt.html, employees.html) use `id="headerSearch"` instead of `id="searchTrigger"`. Internally consistent with their own JS, but this kind of naming drift causes bugs when extracting to shared code.

### 3.2 Notification Panel — RATING: 7/10

**What works:**
- Bell icon with red dot indicator
- Panel slides down with nice transition
- "Mark all read" button present
- Notifications are contextual and realistic
- Closes when clicking outside

**What fails:**
- "Mark all read" button has no click handler. Nothing happens.
- Individual notifications are not clickable — they should navigate to the relevant entity.
- No empty state for notifications.

### 3.3 User Dropdown — RATING: 4/10

This is a mess of inconsistency across pages:

| Page          | Profile link       | Settings link      | Logout label   | Element type |
|---------------|--------------------|--------------------|----------------|--------------|
| index.html    | `<a>` to employees.html | `<a>` to admin.html | "Logout"       | `<a href="#">` |
| timesheets    | `<a>` to employees.html | `<a>` to admin.html | "Logout"       | `<a href="#">` |
| expenses      | `<a>` to employees.html | `<a>` to admin.html | "Sign out"     | `<a href="#">` |
| leaves        | not verified       | not verified       | "Sign Out"     | unclear      |
| projects      | `<a>` to employees.html | `<a>` to admin.html | "Logout"       | `<a href="#">` |
| clients       | `<button>`         | `<button>`         | "Sign Out"     | `<button>`   |
| invoices      | `<button>`         | `<button>`         | "Sign Out"     | `<button>`   |
| employees     | `<button>` "My Profile" | `<button>`    | "Sign Out"     | `<button>`   |
| gantt         | In nav structure   | In nav structure   | "Sign Out"     | In nav       |
| approvals     | `<a>` to employees.html | `<a>` to admin.html | "Logout"       | `<a href="#">` |
| admin         | `<a>` to employees.html | `<a>` to admin.html | "Logout"       | `<a href="#">` |
| insights      | `<a>` to employees.html | `<a>` to admin.html | "Logout"       | `<a href="#">` |
| planning      | `<a>` to employees.html | `<a>` to admin.html | "Logout"       | `<a href="#">` |

**Issues:**
- Three different logout labels: "Logout", "Sign out", "Sign Out". Pick one.
- Some pages use `<a>` tags with actual hrefs, others use `<button>` tags with no handlers. The buttons do nothing.
- "Profile" links go to employees.html (the team directory), not to the current user's profile page. That's wrong.
- employees.html calls it "My Profile" while everyone else says "Profile". Inconsistent.
- gantt.html puts the sign out option inside the sidebar nav structure instead of the header dropdown — completely different interaction pattern.

---

## SECTION 4: PORTAL NAV AUDIT

### 4.1 Client Portal — RATING: 7/10

`portal/index.html` uses a completely different nav pattern (horizontal tab bar instead of sidebar). This is correct for a separate client-facing app. The portal has: Dashboard, Projects, Timesheets, Invoices, Documents.

**Issue:** The portal nav items use `data-tab` attributes and JS tab switching instead of separate pages. This means the entire portal is a single page with tab-swapped content. That's fine for a prototype, but the URL doesn't change, so direct linking to a specific tab (e.g., "go to your invoices") won't work.

---

## SECTION 5: LAYOUT CSS AUDIT

### 5.1 Layout System — RATING: 8/10

**What works:**
- Fixed sidebar + sticky header is standard and correct
- Responsive breakpoints at 1440px, 1023px, 639px are reasonable
- Collapsed sidebar with icon-only mode
- Mobile overlay pattern for sidebar
- Grid helpers (grid-2, grid-3, grid-4, grid-60-40, grid-70-30) are sufficient

**What fails:**
- `sidebar.collapsed ~ .main-wrapper` uses the general sibling combinator. This works only if sidebar is an immediate sibling of main-wrapper in the DOM. If any element is inserted between them (like the sidebar-overlay div, which IS between them), this selector still works because `~` means "any following sibling." However, in the actual HTML, the order is sidebar > sidebar-overlay > main-wrapper. The `~` combinator handles this, but it's fragile and undocumented.
- No print stylesheet. An HR/finance app needs printable views (invoices, timesheets, reports).
- `.header-search { display: none; }` at mobile breakpoint. This hides the command palette trigger entirely on mobile. There's no alternative way to access search on mobile. The Cmd+K shortcut doesn't exist on phones.
- The notification panel is `position: absolute` with a fixed width of 380px. On mobile, this will overflow the viewport. No responsive handling.

---

## SECTION 6: CRITICAL BUGS SUMMARY

| # | Severity | Issue | File:Line |
|---|----------|-------|-----------|
| 1 | **BLOCKER** | `analytics.html` link is a 404 — file does not exist | `employees.html:483` |
| 2 | **CRITICAL** | `insights.html` appears twice in sidebar (Finance > Analytics AND AI > Insights) creating navigation confusion | All pages, Finance + AI sections |
| 3 | **HIGH** | Approvals badge shows "3" on employees.html and gantt.html but "12" on all other pages | `employees.html:499`, `gantt.html:778` |
| 4 | **HIGH** | Timesheets/Expenses/Leaves badges missing on employees.html and gantt.html | `employees.html:441-452`, `gantt.html:723-734` |
| 5 | **HIGH** | Approvals icon is `check-circle` on employees.html and gantt.html, `check-square` everywhere else | `employees.html:497`, `gantt.html:776` |
| 6 | **HIGH** | Live Presence badge says "8 online" but only 6 green dots shown | `index.html:919` |
| 7 | **MEDIUM** | Logout label inconsistent: "Logout" vs "Sign out" vs "Sign Out" across pages | Multiple files |
| 8 | **MEDIUM** | User dropdown uses `<button>` (no-op) on some pages, `<a href>` (navigable) on others | clients.html, invoices.html, employees.html |
| 9 | **MEDIUM** | "Profile" link goes to team directory, not user profile | All pages with user dropdown |
| 10 | **MEDIUM** | Command palette items are not clickable — no navigation handlers | `index.html:1233-1287` |
| 11 | **LOW** | Sidebar collapse button ID inconsistent: `sidebarCollapseBtn` vs `sidebarToggle` | `employees.html:518`, `gantt.html:796` |
| 12 | **LOW** | gantt.html puts "Sign Out" inside sidebar nav area instead of header dropdown | `gantt.html:876-878` |

---

## SECTION 7: BLUEPRINT COMPLIANCE

### Missing Dashboard Widgets (vs Blueprint Section 3)

| Blueprint Widget | Implemented? | Notes |
|-----------------|-------------|-------|
| Hero: Week at a Glance (personal timesheet bar) | **NO** | The most important widget per the blueprint is completely absent |
| Stat Cards (4-column) | **PARTIAL** | 6 columns instead of 4, not clickable |
| Action Required Panel | **NO** | Replaced by the Pending Approvals tab widget, which is good but different |
| Team Presence | **YES** | Missing group headers |
| Utilization Heatmap (12-week) | **NO** | Replaced by Team Availability table |
| Revenue Snapshot (actual vs target) | **PARTIAL** | No target line, no progress bar |
| Upcoming (7-day events) | **NO** | Completely absent |
| Recent Activity Feed | **NO** | Completely absent |

4 out of 8 core widgets are missing. 2 are partial. 2 are present. That is 25% blueprint compliance for the dashboard content.

### Missing Sidebar Items (vs Blueprint Section 20)

| Blueprint Item       | In Prototype? |
|----------------------|---------------|
| Calendar             | **NO**        |
| Departments          | **NO**        |
| Audit Log            | **NO**        |
| Ask AI               | **NO**        |
| Account & Settings   | **NO**        |
| Help & Shortcuts     | **NO**        |

---

## SECTION 8: OVERALL SCORES

| Area | Score | Reasoning |
|------|-------|-----------|
| Navigation Structure | 5/10 | Correct ordering, but duplicate entries, broken links, and badge inconsistencies undermine trust |
| Navigation Consistency | 3/10 | employees.html and gantt.html are clearly from a different template fork. Badges, icons, and link targets diverge |
| Dashboard Storytelling | 5/10 | Has useful widgets but missing the personal context (my week, my tasks) that makes a dashboard feel like YOUR command center |
| Information Hierarchy | 5/10 | Most actionable item (approvals) is in the smaller column; greeting takes premium space; KPI cards are not clickable |
| Interactivity | 6/10 | Approve buttons work with toasts; tabs work; command palette opens/closes; but most links are generic and palette items do nothing |
| Blueprint Compliance | 4/10 | 4 of 8 dashboard widgets missing; 6 sidebar items missing; Calendar is gone; no personal timesheet hero |
| Header Behavior | 6/10 | Works on all pages but user dropdown is inconsistent across pages; search hidden on mobile with no alternative |
| CSS Layout | 8/10 | Solid responsive grid system; proper sidebar/header patterns; minor issues with mobile overflow |
| Empty States | 8/10 | Present and well-designed with CTAs; toggle mechanism is good for prototype review |
| Overall Polish | 5/10 | The template drift between pages (employees.html + gantt.html vs everyone else) is the main drag. These need to be synced from a single source of truth. |

**Aggregate: 5.5/10** — A decent first pass that needs a sync-and-fix sprint before showing to stakeholders. The foundation is there, but the copy-paste drift and missing blueprint widgets make it feel unfinished.
