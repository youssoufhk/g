# CRITIC_UNITY.md — GammaHR v2 Design Consistency Audit
Generated: 2026-04-13

---

## SECTION 1: ISSUES

---

### ISSUE 1
**[PAGES: insights.html]** | **Page title missing from page-content area** | **insights.html has no `<h1 class="page-title">` inside the page-content area.** Every other page (timesheets, leaves, approvals, gantt, expenses, employees, clients, invoices, hr, planning, calendar, account, admin) has both an `<h2 class="page-title">` in the top-header AND an `<h1 class="page-title">` in the page-content div. Insights only has the `<h2>` in the top-header. The content area jumps straight to the NL query bar. **Correct version: add `<h1 class="page-title">` + `<p class="page-subtitle">` before the NL query bar.**

---

### ISSUE 2
**[PAGES: gantt.html]** | **Top-header missing page title h2; search bar is inside header-left instead of being a sibling** | **The gantt.html top-header puts `<div class="header-search">` inside `<div class="header-left">` alongside the mobile-menu-btn.** Every other page puts header-search as a direct sibling of header-left and header-right (three-child layout). Gantt's structure is: `header-left [menu-btn + header-search]` then `header-right`. As a result, the page name `Gantt Chart` never appears in the top-header at all — the user sees no breadcrumb-level indicator in the sticky bar. **Correct version: give gantt.html the same three-section top-header structure as all other pages, with `<h2 class="page-title">Gantt Chart</h2>` inside header-left.**

---

### ISSUE 3
**[PAGES: gantt.html]** | **User role in header shows "Project Manager" instead of "Admin"** | **`gantt.html` renders `<div class="user-role">Project Manager</div>` in the header-user widget.** Every other page shows "Admin". This is a seed-data inconsistency that breaks the illusion of a single signed-in identity. **Correct version: "Admin" everywhere.**

---

### ISSUE 4
**[PAGES: gantt.html, projects.html, calendar.html]** | **`<body>` tag has no `class="show-populated"`** | **gantt.html, projects.html, and calendar.html open with `<body>` (no class).** Every other page that has the populated/empty toggle pattern uses `<body class="show-populated">` to show content by default. Without this, the empty-state toggle JS logic may not initialize correctly and the empty-state class pairing `populated-content/empty-content` breaks. **Correct version: `<body class="show-populated">` on all pages with this pattern.**

---

### ISSUE 5
**[PAGES: invoices.html, clients.html]** | **Breadcrumb uses `.breadcrumbs` with `&rsaquo;` separator; all other pages use `.breadcrumb` with `/` separator** | **invoices.html and clients.html use `<nav class="breadcrumbs">` with `<span class="separator">&rsaquo;</span>` and `.current` class.** All other pages (timesheets, leaves, expenses, hr, approvals, planning, gantt) use `<nav class="breadcrumb">` with `/` as a plain `<span>` and `color:var(--color-text-2)` styling inline. The class name, element structure, and separator character all differ. **Correct version: canonical `.breadcrumb` with `/` separator, styled inline as used on timesheets/leaves/planning.**

---

### ISSUE 6
**[PAGES: all pages with tables: invoices, admin, hr, expenses, timesheets, approvals]** | **Triple-dot (more-vertical) menus appear only on invoices.html and employees.html list-view tables; absent from admin users table, hr offboarding table, expenses table rows** | **`data-lucide="more-vertical"` appears in invoices.html (11 occurrences) and employees.html table (15 occurrences). Expenses items have action buttons rendered directly inline (btn btn-ghost per row). Admin users table has no row-level action menu at all — actions are implied by clicking the row.** For any table row where 2+ actions exist, the pattern must be consistent. **Correct version: triple-dot menu on every table row with multiple actions; inline buttons only when there is exactly one action.**

---

### ISSUE 7
**[PAGES: timesheets.html KPI strip, leaves.html KPI strip]** | **KPI stat cards use `card-3d` + `perspective-container` + inline styles; dashboard uses `.stat-card` component class** | **Dashboard KPI cards are `.stat-card card-interactive card-3d` with the component class managing layout. Timesheets and leaves KPI cards are `<div class="card-3d card-interactive" style="background:...; border:...; border-radius:...; padding:var(--space-4);">` — they replicate the card appearance with inline styles instead of using the `.stat-card` class.** This is redundant CSS and diverges from the system. Approvals KPI cards use yet a third approach: `<div class="card card-interactive card-3d" style="padding:var(--space-4);text-align:center;">`. **Correct version: all KPI cards should use `<div class="stat-card card-interactive">`, relying on the component class for box/border/padding.**

---

### ISSUE 8
**[PAGES: timesheets.html, leaves.html, expenses.html]** | **Page-header action button sizes are inconsistent** | **Timesheets page-header uses `btn-md` for Export and has no size class on "Submit". Leaves page-header uses `btn-md` for Export and Request Leave. Expenses page-header uses `btn-sm` for both Export and New Expense. Approvals uses `btn-md`. Planning uses `btn-md`.** Primary and secondary actions in page-header-actions must be a single standardized size. **Correct version: `btn-md` for all page-header CTA buttons.**

---

### ISSUE 9
**[PAGES: index.html (dashboard)]** | **Dashboard has no `<h1 class="page-title">` in page-content; it uses a custom `.greeting` h1 instead** | **The dashboard page-content area starts with `<div class="greeting"><h1>Good morning, Sarah.</h1>` with `font-size: var(--text-display-xl)`, not a `.page-title` h1.** All other pages use the `.page-header` → `.page-header-left` → `h1.page-title` pattern. The greeting is intentional but means the dashboard has no canonical page header block, no subtitle line, and no page-header-actions slot — it just has the greeting and then jumps to KPI cards. This is a structural deviation from the page skeleton. **Open question logged in Section 2.**

---

### ISSUE 10
**[PAGES: employees.html]** | **Work time displayed as horizontal bar with colored `.worktime-fill` using `.green/.yellow/.red` class names; elsewhere the same concept uses `.high/.mid/.low`** | **employees.html CSS defines `.worktime-fill.green`, `.worktime-fill.yellow`, `.worktime-fill.red` AND `.worktime-fill.high`, `.worktime-fill.mid`, `.worktime-fill.low` as synonyms (both sets exist in the same stylesheet).** On other pages (dashboard presence items, approvals) work time is shown as a plain percentage number or a badge, not a bar. The HTML in employees.html card grid uses `.high`/`.mid`/`.low` classes while inline timesheets uses a raw inline style. This alias duplication is a code smell and the semantics are split. **Correct version: standardize on `.high/.mid/.low` and remove the `.green/.yellow/.red` aliases.**

---

### ISSUE 11
**[PAGES: gantt.html]** | **Work time shown as a colored badge (`.worktime-badge`, `.worktime-high/.mid/.low/.over`) instead of a horizontal bar** | **Gantt renders work time as a pill badge: `<span class="worktime-badge worktime-high">87%</span>`.** The employee card grid and planning bench table show work time as a horizontal progress bar. Timesheets shows it as an inline donut SVG. Three different visual treatments for the same concept within the same prototype. **Correct version: horizontal bar is the designated work-time component per project patterns; the gantt exception is acceptable only if width-constrained, but should be noted as a deliberate exception, not an oversight.**

---

### ISSUE 12
**[PAGES: timesheets.html KPI cards]** | **Work time shown as SVG donut inside a KPI card alongside sparkline; nowhere else is a donut used for work time** | **timesheets.html "Hours This Week" stat card embeds `<circle cx="22" cy="22" r="18" ... stroke-dasharray="96.3 16.8">` — a mini SVG donut — in the top-right corner of the KPI card.** No other page uses a donut for work time display. Approvals KPI "Total Pending" card also has a donut but it's for breakdown (timesheets/leaves/expenses), not work time. The mixing of donut + bar + badge + plain number for equivalent work-time data is a clear component divergence. **Correct version: horizontal bar for work time everywhere in tables/cards; donuts reserved for breakdown/composition data only.**

---

### ISSUE 13
**[PAGES: index.html, timesheets.html, leaves.html, expenses.html, insights.html]** | **Sparkline SVGs embedded inline with duplicate `<linearGradient id>` values that will collide across pages** | **Each stat card on timesheets.html defines gradient IDs like `id="tsSparkHours"`, `id="sparkFill1"`, `id="leaveSparkFill"` etc. Dashboard defines `id="sparkGreen"`, `id="sparkPrimary"`, `id="sparkWarning"`. These are unique within each page but the pattern is entirely ad-hoc.** There is no shared sparkline component. SVG gradient IDs are globally scoped in the DOM, so if the same page were to include two of these sections, IDs would collide. **Correct version: establish one canonical inline-sparkline pattern with a consistent ID-scoping approach (e.g., using `url(#<unique-page-prefix>sparkline)`).**

---

### ISSUE 14
**[PAGES: invoices.html vs. clients.html vs. projects.html]** | **The `<div class="header-user">` on invoices and clients is missing `avatar-status online`** | **Most pages render the header user avatar as `<div class="avatar avatar-sm avatar-status online">SC</div>`. invoices.html and clients.html use `<div class="avatar avatar-sm">SC</div>` — no status indicator.** Gantt uses `<div class="avatar avatar-sm avatar-1">SC</div>` (color variant, no status). Three distinct avatar states for the same signed-in user across header widgets. **Correct version: `avatar avatar-sm avatar-status online` on every page header.**

---

### ISSUE 15
**[PAGES: gantt.html]** | **`<kbd>Cmd+K</kbd>` vs `<kbd>&#8984;K</kbd>` in search bar** | **gantt.html renders the command palette keyboard hint as `Cmd+K` in plain text. Every other page uses the Unicode symbol `&#8984;K` (⌘K).** This is a small but visible inconsistency in the persistent header element seen on every page. **Correct version: `&#8984;K` everywhere.**

---

### ISSUE 16
**[PAGES: approvals.html]** | **KPI cards use inline `style="font-size:var(--text-heading-1)..."` for the number value; all other pages use `.stat-value` class** | **approvals.html KPI cards render values as `<div style="font-size:var(--text-heading-1);font-weight:var(--weight-bold);color:var(--color-text-1);font-family:var(--font-mono);">12</div>`.** Dashboard uses `<div class="stat-value font-mono">12</div>`. Invoices uses `<div class="stat-value">&euro;33,400</div>`. Using `.stat-value` applies the design-system class; inline styles bypass it and will be out of sync if the token changes. **Correct version: `.stat-value` component class on all KPI number values.**

---

### ISSUE 17
**[PAGES: timesheets.html (admin view)]** | **The "Approval Queue" tab in timesheets uses a custom `.aq-filter-bar` class; all other filter bars use `.filter-bar-standard` or `.filter-bar-approvals`** | **timesheets.html defines and uses `.aq-filter-bar` (styled nearly identically to `.filter-bar-standard`) for the Approval Queue sub-tab.** approvals.html uses `.filter-bar-approvals`. clients.html, invoices.html, projects.html, employees.html all reference `.filter-bar-standard`. There are now three distinct filter-bar classes doing the same layout. **Correct version: consolidate to `.filter-bar-standard` everywhere; delete `.aq-filter-bar` and `.filter-bar-approvals` as separate classes.**

---

### ISSUE 18
**[PAGES: admin.html]** | **Status badges in admin users table rendered as plain colored text (`.status-active { color: var(--color-success); }`) instead of pill badges** | **admin.html styles `.status-active` and `.status-inactive` as raw color overrides on text, not as the canonical `.badge` pill component.** approvals.html, hr.html, projects.html, employees.html all use `<span class="badge badge-success">Active</span>` or equivalent pill. The admin table shows "Active" / "Inactive" as unstyled colored text with no background, no border-radius, no padding. **Correct version: `<span class="badge badge-success">Active</span>` / `<span class="badge badge-default">Inactive</span>` everywhere.**

---

### ISSUE 19
**[PAGES: projects.html — view-toggle; employees.html — view-toggle; calendar.html — cal-view-toggle]** | **Three separate implementations of the view-toggle segmented control** | **projects.html defines `.view-toggle-btn.active { background: var(--color-primary); color: var(--color-text-inv); }` — filled primary on active. employees.html defines `.view-toggle-btn.active { background: var(--color-primary-muted); color: var(--color-primary); }` — muted tint on active. calendar.html defines `.cal-view-toggle button.active { background: var(--color-primary); color: var(--color-text-inv); }` — matches projects.** Three CSS class names (`.view-toggle`, `.view-toggle`, `.cal-view-toggle`) for the identical UI component, with different active-state treatments. **Correct version: one shared class (e.g., `.seg-control`) in `_components.css`; projects and calendar active = filled primary; employees active = muted (possibly intentional — open question).**

---

### ISSUE 20
**[PAGES: planning.html]** | **KPI strip is absent; page jumps from page-header directly to capacity month cards** | **planning.html page-content goes: page-header → immediately into a 3-column `.capacity-grid` with no numeric KPI strip.** All comparable data-heavy pages (timesheets, leaves, expenses, approvals, employees, insights, projects) open with a row of 4 KPI stat cards before showing primary content. Planning's capacity month cards serve a different purpose (forecasting, not current state) but there is no at-a-glance KPI row summarizing current capacity utilization, bench count, or open roles. **Correct version: add a 4-card KPI strip (e.g., Total Capacity, Bench Count, Forecast Gap, Open Roles) before the capacity-grid.**

---

### ISSUE 21
**[PAGES: leaves.html — calendar section]** | **Leave calendar mini-grid uses `.calendar-days/.calendar-day/.calendar-event` class names; calendar.html uses `.cal-days/.cal-day/.cal-event`** | **leaves.html defines its own mini-calendar with `.calendar-days`, `.calendar-day`, `.day-number` (min-width 24px). calendar.html uses `.cal-days`, `.cal-day`, `.day-num` (min-width 26px/38px).** Two implementations of the same month-grid calendar component with different class names, different cell sizes, and different day-number sizing. This means any shared fix must be applied in two places. **Correct version: extract the month-grid calendar into a single shared component class (`.cal-grid`, `.cal-day`, `.cal-day-num`) and reference it from both pages.**

---

### ISSUE 22
**[PAGES: expenses.html]** | **Expense amount displayed in `--text-heading-2` font size, which is significantly larger than amounts on invoices/projects** | **expenses.html `.expense-amount` uses `font-size: var(--text-heading-2); font-weight: var(--weight-bold)` making each expense row's amount very visually dominant.** invoices.html stat card amounts use `.stat-value` (heading-level). But in the invoices detail table, line-item amounts use `font-family: var(--font-mono)` at body size. projects.html budget amounts are in `.card-budget-pct` at caption size. Money values are not displayed at a consistent relative scale — expense rows feel heavier than invoice line items. **Correct version: standardize money value sizing in list/table contexts to `var(--text-body)` mono, with `var(--text-heading-*)` only for KPI cards.**

---

### ISSUE 23
**[PAGES: hr.html — onboarding section]** | **Progress bars use a custom `.progress-label` class and no shared bar component; projects.html uses `.progress-bar/.progress-bar-fill`; leaves.html uses `.balance-bar/.balance-bar-fill`; timesheets.html uses `.ts-progress-bar/.ts-progress-fill`** | **Four separate progress-bar implementations across four pages, each with its own class names and slightly different heights: ts-progress-bar is 8px, projects progress-bar is 4px, leaves balance-bar is 6px, planning gap-bar is 6px.** The bar is one of the most reused visual elements in the system. **Correct version: one canonical `.progress-bar` (6px height, `border-radius: var(--radius-full)`, `overflow: hidden`) and `.progress-bar-fill` with modifier classes for color. All pages use it.**

---

### ISSUE 24
**[PAGES: index.html]** | **Dashboard has two separate revenue chart implementations (`.revenue-bars` and `.rev-bar-col/.rev-bar`) within the same page** | **index.html defines `.revenue-bars/.revenue-bar-col/.revenue-bar` for one chart component, then defines `.revenue-snapshot-chart/.rev-bar-col/.rev-bar` for a second chart section — two different class name sets for visually identical bar chart columns.** clients.html also defines `.revenue-bars/.revenue-bar-col/.revenue-bar` with a `height: 140px` container (vs dashboard's `120px`). The same revenue-bar component is implemented three times across two files with slight variations. **Correct version: one `.rev-bar-chart` component class at a consistent height; both dashboard and client detail pages reference it.**

---

### ISSUE 25
**[PAGES: account.html]** | **`account.html` uses `.account-page-header h1` (text-display-lg, weight-bold) instead of `.page-header` → `h1.page-title` skeleton** | **account.html page-content begins with `<div class="account-page-header"><h1>Account Settings</h1>...` using its own custom header class with custom font sizing.** Every other page uses `<div class="page-header"><div class="page-header-left"><h1 class="page-title">` which is handled by the `.page-header` component in `_components.css`. The account page bypasses the shared skeleton entirely. **Correct version: replace `.account-page-header` with the canonical `.page-header` + `.page-header-left` + `h1.page-title` structure.**

---

### ISSUE 26
**[PAGES: timesheets.html — custom `.saved-views-menu`; gantt.html — `.saved-views` section in filter panel]** | **"Saved Views" implemented three different ways: ghost button + raw inline dropdown on timesheets/leaves, select element on invoices/clients/projects, and a panel section on gantt** | **timesheets.html and leaves.html use a ghost button that toggles a custom dropdown div (inline `position:absolute` menu with custom `.saved-view-item` rows). invoices.html and clients.html use a `<select class="form-select form-input-sm">` as the Saved Views control in the filter bar. gantt.html puts saved views as buttons inside the collapsible filter panel body.** One interaction pattern, three different components. **Correct version: Saved Views should be a consistent ghost-button + dropdown everywhere it appears, not mixed with native `<select>` elements.**

---

### ISSUE 27
**[PAGES: hr.html — Kanban vs. projects.html — Kanban]** | **Two Kanban board implementations with structural and styling differences** | **hr.html kanban: `.kanban-column` with `.kanban-header` containing a bottom-border accent, `.kanban-body` as a separate styled div below the header, candidates in `.candidate-card`.** projects.html kanban: `.kanban-column` with `.kanban-column-header` using a bottom-border on the header element directly, cards directly in `.kanban-cards` (no `.kanban-body` wrapper). The column-count badge uses the same markup but `.kanban-header` vs `.kanban-column-header` differ. The gap color logic differs (hr uses per-stage class selectors; projects uses nth-child). **Correct version: one shared Kanban column structure (`kanban-column`, `kanban-col-header`, `kanban-col-body`) in `_components.css`.**

---

### ISSUE 28
**[PAGES: index.html (presence list), planning.html (bench list)]** | **Employee display in list items is name-only (plain text or link) with no avatar** | **The dashboard "Who's In / Out" presence list renders `<div class="presence-name"><a>Alice Wang</a></div>` — name only, no avatar.** planning.html bench list renders `<div class="bench-name"><a data-hovercard ...>Bob Taylor</a></div>` — name only with hovercard. But approvals.html, timesheets admin queue, hr kanban cards, and expenses all show `avatar + name` pairs. The rule that employee references should always be avatar + name is broken in two prominent places. **Correct version: every employee reference in a list context must show a 24px avatar + name, with hovercard on the name link.**

---

### ISSUE 29
**[PAGES: invoices.html]** | **Invoice detail title uses `font-family: var(--font-mono)` at `text-display-lg` — the only case where mono is used at display scale for a heading** | **`.invoice-detail-title { font-size: var(--text-display-lg); font-weight: var(--weight-bold); font-family: var(--font-mono); }`** This makes the invoice number (e.g., "INV-2026-041") render in monospaced display size. No other page title/heading uses mono at this scale. It's arguably correct for an invoice number but is not part of any stated typography rule. **Open question logged in Section 2.**

---

### ISSUE 30
**[PAGES: admin.html]** | **`admin-tabs` margin-bottom is `var(--space-8)` (32px); all other tab bars use `var(--space-4)` (16px)** | **admin.html: `.admin-tabs { margin-bottom: var(--space-8); }`. hr.html: `.hr-tabs { margin-bottom: var(--space-4); }`. approvals.html: `.approval-tabs { margin-bottom: var(--space-4); }`. expenses.html uses `.tabs` with no explicit margin-bottom override (inherits the component default).** The admin page has double the tab-to-content gap of every other tabbed page, making the content feel pushed down. **Correct version: standardize tab-to-content gap at `var(--space-4)` or `var(--space-6)` across all tab pages.**

---

### ISSUE 31
**[PAGES: account.html, admin.html]** | **`.settings-section-title` defined differently on each page** | **admin.html: `.settings-section-title { font-size: var(--text-heading-3); font-weight: var(--weight-semibold); padding-bottom: var(--space-3); border-bottom: 1px solid var(--color-border-subtle); }`. account.html: `.settings-section-title { font-size: var(--text-body); font-weight: var(--weight-semibold); }` — no border, smaller font.** Both pages are "settings" contexts but one uses heading-3 with a divider line and the other uses body text with no divider. **Correct version: account.html section titles should use heading-3 with a bottom border to match admin.html, since they are semantically equivalent.**

---

### ISSUE 32
**[PAGES: timesheets.html — admin queue table; employees.html — list table; admin.html — users/roles tables]** | **Table column headers inconsistently styled: some uppercase, some sentence-case** | **timesheets.html `<th>` uses `font-size: var(--text-caption); font-weight: var(--weight-medium); text-transform: uppercase; letter-spacing: 0.5px;` — pure caps.** employees.html list-view table headers (injected by JS but styled by component CSS) appear as sentence-case at the same caption size. admin.html audit log table headers use the shared `.data-table th` class. gantt filter-group labels are sentence-case at caption size. **Correct version: all `<th>` elements in data tables must use uppercase + 0.5px letter-spacing, which is the existing pattern on timesheets and calendar weekday headers.**

---

### ISSUE 33
**[PAGES: leaves.html — balance cards vs. expenses.html — category icons]** | **Leave balance card accent color system uses `--color-chart-5` and `--color-wfh` which are undefined in most other pages' color vocabulary** | **leaves.html references `var(--color-chart-5)` for sick leave color and `var(--color-wfh)` for WFH. These tokens are not used anywhere else in the prototype.** All other pages use `--color-primary`, `--color-success`, `--color-warning`, `--color-error`, `--color-info`, `--color-accent`, and `--color-gold`. The leave type color system is a silo. **Correct version: map leave type colors to the shared semantic palette: annual → `--color-info`, sick → `--color-warning`, personal → `--color-accent`, WFH → `--color-success`. Remove `--color-chart-5` and `--color-wfh` from leave page usage.**

---

### ISSUE 34
**[PAGES: calendar.html]** | **Calendar legend dots are 10×10px border-radius-sm; leaves.html balance-bar legend uses 12×12px border-radius-sm; insights tab pane has no color legend at all** | **cal-legend-dot: 10px×10px rounded square. leave heatmap legend dot: 12px×12px rounded square. These are the same conceptual element (a color key dot) at different sizes.** gantt.html legend uses 16×10px rectangular swatches. There is no single "legend dot" standard. **Correct version: 10×10px `.legend-dot` with `border-radius: var(--radius-sm)` as the canonical legend indicator across calendar, leaves, and gantt.**

---

### ISSUE 35
**[PAGES: approvals.html]** | **Visual weight: the KPI strip uses `card-3d` with `perspective-container` wrapping each card, creating a 3D tilt effect on hover** | **approvals.html wraps each KPI card in `<div class="perspective-container"><div class="card card-interactive card-3d">`.** Most other pages use card-3d without the perspective-container wrapper (or use it inconsistently: timesheets uses it on the grid container, not individual cards). The approvals page also embeds a mini donut SVG inside the "Total Pending" KPI card — this makes it the heaviest, most visually complex KPI strip in the entire product. Combined with the urgency section labels and the colored left-border on urgent cards, approvals.html feels significantly heavier than any other page. **Correct version: remove the perspective-container wrapper from individual cards; use the same flat card style as timesheets/leaves KPI cards.**

---

## SECTION 2: OPEN QUESTIONS

---

### OQ-1: Dashboard greeting h1 vs. canonical page-header h1
The dashboard intentionally uses a personalized greeting ("Good morning, Sarah") at display-xl scale instead of a dry "Dashboard" h1. This creates warmth and is arguably correct for a home page. The open question: should the dashboard also have a `.page-header` div with a hidden or absent `.page-header-actions` slot to maintain DOM skeleton consistency, even if the greeting is the visual focus? Or is the dashboard explicitly exempt from the page-header skeleton? **Product owner input required.**

---

### OQ-2: Invoice number displayed in monospaced font at display scale
`invoice-detail-title` renders the invoice reference (e.g., "INV-2026-041") in `var(--font-mono)` at `var(--text-display-lg)`. This is defensible for a document reference number but is not part of any stated typography system rule. The question: is mono-at-display the canonical treatment for document/reference IDs everywhere (invoice numbers, project codes, contract references)? If yes, this should be documented as a system rule and applied consistently. If no, the invoice detail title should revert to `var(--font-sans)`. **Product owner input required.**

---

### OQ-3: Employee display in constrained contexts — avatar required or optional?
The hovercard system (`data-hovercard`) is present on name links across planning, employees, expenses, approvals, and more. But some list contexts (dashboard presence list, planning bench list) show name-only with no avatar due to space constraints. The question: is the "avatar + name + hovercard" rule absolute, or is "name + hovercard" (no avatar) acceptable in dense list contexts where row height is tight? **Product owner input required.**

---

### OQ-4: View-toggle active state — filled primary vs. muted primary
projects.html and calendar.html use filled primary (white text on primary background) for the active view-toggle button. employees.html uses muted primary (primary text on primary-muted background). Both feel coherent within their contexts. The question: which should be the standard? Filled primary is more emphatic and matches how tabs active state works. Muted is softer and matches badge-primary. **Product owner input required.**

---

### OQ-5: Saved Views — select element vs. button+dropdown
invoices.html and clients.html use a `<select>` element for Saved Views in the filter bar, which is a native browser control and mobile-friendly but visually inconsistent with the rest of the filter bar. timesheets.html and leaves.html use a custom ghost-button+dropdown for the same feature. The select approach degrades gracefully on mobile; the custom dropdown is more consistent visually. **Product owner input required before standardizing.**

---

### OQ-6: planning.html — absence of KPI strip
The planning page has no 4-card KPI strip (Issue 20). However, the capacity month cards that open the page already show quantitative forecasts at a glance. There is a real argument that the capacity cards ARE the KPI strip for planning, just formatted differently for their monthly nature. The question: should planning add a separate 4-card KPI row above the capacity cards, or should the capacity cards themselves be redesigned to serve that role? **Product owner input required.**

---
*End of CRITIC_UNITY.md*
