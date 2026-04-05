# GammaHR v2 — Phase 2: Complete Overhaul Sprint

You are the lead orchestrator for Phase 2 of GammaHR v2. Phase 1 produced a working
prototype with a design system, layout, and core pages. Phase 1 Round 2 fixed navigation,
mobile foundations, financial data consistency, badge icons, sidebar sync, and core UX flows.

**The human founder has now reviewed the prototype and found it deeply inadequate.**
Their feedback is below — verbatim and unfiltered. Every single issue they raised is
HIGH severity at minimum. Many are CRITICAL.

**Your job is not just to fix what they found. You must spawn critic agents that think
like a senior product manager, a senior UX/UI designer, a senior software architect,
and a senior HR/finance domain expert — agents that find what the founder DIDN'T catch.
Fix everything. Leave nothing.**

**CRITICAL RULE: No backend code. No Rust. No database. No API.
HTML + CSS + vanilla JS only. The prototype must look and feel like a finished product.**

---

## Step 0 — Read Everything First

Before any agent writes a single line, read ALL of the following:

**Spec files:**
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/MASTER_PLAN.md
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/specs/APP_BLUEPRINT.md
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/specs/DESIGN_SYSTEM.md
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/specs/DATA_ARCHITECTURE.md

**All prototype files:**
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/_tokens.css
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/_components.css
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/_layout.css
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/index.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/employees.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/gantt.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/expenses.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/timesheets.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/leaves.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/projects.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/clients.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/invoices.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/approvals.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/insights.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/planning.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/admin.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/auth.html
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/portal/index.html

**Previous audit files (for context on what was already fixed):**
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/audits/MASTER_ISSUES.md

**Phase 1 Round 2 review files (read these — they show what's STILL broken after fixes):**
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/audits/REVIEW2_UX.md (7.2/10 overall)
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/audits/REVIEW2_MOBILE.md (6.5/10 overall)
- /home/kerzika/ai-workspace/claude-projects/gammahr_v2/prototype/audits/REVIEW2_FLOWS.md (7.7/10 avg across flows)

**Key findings from Review2 Mobile (6.5/10 — framework built but not connected):**
- CRITICAL: `mobile-cards` CSS class exists in _layout.css but is applied to ZERO HTML tables. Every data table still horizontal-scrolls on mobile. The fix is to add `class="mobile-cards"` and `data-label` attributes to every `<table class="data-table">` in every HTML file.
- `mobile-search-btn` CSS defined but no HTML element uses it — search invisible on mobile
- Bulk action bar on approvals overlaps bottom nav (z-index collision)
- State-toggle button collides with bottom nav on every page
- Leaves heatmap (32 columns) unusable at 390px
- Sidebar nav items lack 44px min-height (missed by touch target enforcement)
- Five pages have zero page-specific mobile CSS: admin, insights, approvals, clients, projects
- Mobile framework is 8/10, application of framework to pages is 5/10

**Key findings from Review2 Flows (7.7/10 avg — 0 critical, 4 high, 8 medium):**
- Invoice generation: Generate Draft button does NOT add a new row to the invoice table — flow feels incomplete
- AI scan results do NOT auto-fill the expense form (contradicts the Cross-Critique 2 finding that it does — needs verification and definitive fix)
- Dashboard approval widget actions do NOT persist to the Approvals page (approving on dashboard doesn't update approvals.html)
- Dashboard approval tabs lack initial active state on page load
- Data flow between pages is thematic only (static prototype) — but the APPEARANCE of connection must be convincing
- Strongest flows: Timesheet (9/10), Approvals Hub (9/10)
- Weakest: Data flow coherence (5/10), Invoice generation (7/10)

**Key findings from Review2 UX (still broken after Phase 1 Round 2):**
- Entity links are STILL largely fake — employee/project/client links point to generic list pages, not specific detail views (deep links via #hash exist on some pages but not consistently)
- Dashboard date says April 6 but system says April 5 (minor)
- KPI numbers (48 employees) don't match directory (12 employees) — scale mismatch in sample data
- Mini profile hover cards (spec section 4.3) are completely missing — no hover popover on any employee name
- No breadcrumbs on any detail view
- Email addresses inconsistent across pages (sarah.chen@gammahr.io vs @gamma.io vs @gammahr.com)
- Command palette markup is inconsistent/simplified outside of index.html
- Utilization color thresholds inconsistent (95% shows red on one row, 90% shows yellow on another)

---

## Step 1 — The Expert Critic Panel (DO BEFORE ANY FIXES)

Spawn 4 expert critic agents in parallel. Each reads ALL prototype files and the specs,
then writes a brutal audit from their specialist perspective. They must find issues the
founder did NOT catch, in addition to validating the founder's list.

### Critic Agent A — Senior Product Manager
File: `audits/PHASE2_CRITIC_PM.md`

Think like a PM who has shipped 10+ SaaS products. Evaluate:
- Is the information architecture correct? Are features in the right place?
- Are user journeys logical? Can a new user figure out the app in 5 minutes?
- Is the feature set complete for a consulting firm HR platform?
- What features are present but shallow (checkbox features vs deep features)?
- What's the #1 thing a competitor would do better?
- Is the HR module absence a dealbreaker? What must it include at minimum?
- Are the AI insights genuine value-adds or decorative?
- Would a 300-person company actually switch to this from BambooHR/Personio?

### Critic Agent B — Senior UX/UI Designer
File: `audits/PHASE2_CRITIC_UX.md`

Think like a designer who works at Linear or Figma. Evaluate:
- Visual hierarchy on every page — what draws the eye first? Is it the right thing?
- Dashboard card layout — is the grid actually working? (Founder says it's broken)
- Graph/chart quality — are they clear, readable, useful?
- Spacing rhythm — is it consistent or chaotic?
- Color usage — is the Earth & Sage palette used effectively?
- Typography — is the hierarchy clear?
- Interactive feedback — do actions feel responsive?
- Empty states, loading states, error states — are they all present?
- Mobile — is the responsive design actually functional at 390px?
- Is every page beautiful enough to screenshot for a marketing site?

### Critic Agent C — Senior Software Architect
File: `audits/PHASE2_CRITIC_ARCH.md`

Think like an architect who cares about scalability and data integrity. Evaluate:
- Will the current page structure scale to 200+ employees? 500+?
- Are lists paginated or will they break at scale?
- Is the permission model visible in the prototype? (Admin/PM/Employee views)
- Is the data flow between pages logically sound?
- Are there any impossible states shown? (e.g., pending expense on a sent invoice)
- Is the audit log manageable at scale? What strategy is needed?
- Is the calendar view scalable for large teams?
- Is the search/filter architecture consistent and complete?

### Critic Agent D — Senior HR/Finance Domain Expert
File: `audits/PHASE2_CRITIC_DOMAIN.md`

Think like an HR director at a 200-person consulting firm. Evaluate:
- Is the leave management complete? (Accrual, carryover, half-day, multi-day booking)
- Is the expense workflow realistic? (Policies, limits, multi-currency, recurring)
- Is the timesheet model correct for consulting? (Billable/non-billable/internal, overtime)
- Are the financial reports what a CFO would need?
- Is the approval chain realistic? (Multi-level, delegation, escalation)
- Is there ANY HR functionality? (Recruitment, onboarding, offboarding, performance review)
- Would a consulting firm trust this for billing clients?
- What compliance features are missing? (GDPR, audit trail, data retention)
- Is the "utilization" → "work time" rename correct? What term do consulting firms use?

---

## Step 2 — Merge Critic Findings + Founder Issues into Master Fix Plan

After all 4 critics write their audits, the orchestrator reads all 4 files PLUS
the founder's issues below, and produces:

File: `audits/PHASE2_MASTER_PLAN.md`

Format each issue as:
```
### FIX-[N]: [Short title]
Page(s): [which files]
Priority: CRITICAL / HIGH / MEDIUM
Source: Founder / Critic-PM / Critic-UX / Critic-ARCH / Critic-DOMAIN
Description: [What is wrong]
Fix required: [Exactly what to build/change]
```

---

## Step 3 — Execute Fixes

Fix in priority order. CRITICAL first, then HIGH, then MEDIUM.
Assign agents by file ownership to avoid conflicts.

**Suggested agent split (adjust based on master plan):**

### Agent Group 1: Global CSS + Layout
Files: _tokens.css, _components.css, _layout.css
- Rename all "utilisation" CSS classes to "work-time" equivalents
- Fix dashboard grid layout (cards must be a proper responsive grid, NOT vertical stack)
- Verify and fix mobile responsive at 390px
- Add any new component CSS needed for new features

### Agent Group 2: Dashboard (index.html)
- Fix card grid layout (CRITICAL — founder says it's broken)
- Redesign graphs for clarity
- Move "Billable vs Internal" to top of dashboard
- Add leave logging to Quick Log Time widget
- Add unassigned project search to Quick Log Time
- Rename all "Utilisation" labels to "Work Time"
- Fix progress bar logic: values >100% must show overwork with warning colors
- Add AI wellbeing alerts (overwork, missing holidays)

### Agent Group 3: HR Module (NEW — hr.html)
Build from scratch:
- Add "HR" section to sidebar nav on ALL pages (between Work and Finance)
- Create hr.html with tabs: Recruitment, Onboarding, Offboarding, Directory
- Recruitment tab: job postings list, candidate pipeline (kanban), interview scheduling
- Candidate detail: profile, CV, interview comments per interviewer, offer status
- Onboarding tab: checklist template, active onboardings, document collection
- Offboarding tab: exit checklist, knowledge transfer, equipment return
- This is the MOST CRITICAL missing feature — the app is called "Gamma HR"

### Agent Group 4: Entity Views + AI Insights
Files: employees.html, projects.html, clients.html, invoices.html
- Add AI Insights section to overview of each entity:
  - Employee: work pattern analysis, wellbeing flags, skill growth, career progression
  - Project: health assessment, budget forecast, risk flags, team recommendations
  - Client: business % of total revenue, PM ownership, revenue trend, payment behavior, relationship recommendations
  - Invoice: payment prediction, follow-up recommendation, aging analysis
- Client view: add business intelligence (% of total business, revenue trends, etc.)
- Project detail: fix for ALL project types (hourly, fixed-fee, retainer)
- Fixed-fee projects: show contract value + earned-to-date, NOT percentage
- Employee directory: add org chart view, scale to 200+ with search/filter
- Add permission model indicators (show what admin/PM/employee would see)

### Agent Group 5: Resource Planning + Analytics
Files: planning.html, insights.html, gantt.html
- Redesign resource planning layout (card-based, not stacked)
- Fix "Hours with Gap/Surplus" widget — redesign entirely
- Add AI bench forecast recommendations
- Rename "Utilisation" everywhere to "Work Time"
- Fix all progress bars: >100% must show overwork
- AI Insights: add employee wellbeing section (overwork detection, holiday gaps)

### Agent Group 6: Leaves + Calendar
Files: leaves.html
- Add worked-days count summary per month in leave history
- Make leave history calendar squares smaller with compact summary row
- Team calendar: add search, department/team/project/client filters
- Team calendar: support multi-day booking via click-drag or date range selection
- Team calendar: add "More Details" popup (bottom-right) showing all employees on leave that day
- Team calendar: must scale to 100-200+ people
- Connect leave logging to the dashboard Quick Log Time widget

### Agent Group 7: Timesheets + Expenses
Files: timesheets.html, expenses.html
- Quick Log Time: support leave logging from timesheet view
- Project dropdown: show assigned projects by default, allow search for ALL projects
- Unassigned project time entries require manager approval (add visual indicator)
- Expense project dropdown: same logic as timesheets
- Rename "Utilisation" in timesheet summary to "Work Time"
- Fix progress bar logic for >100% overwork

### Agent Group 8: Configuration (admin.html)
- Company Settings: remove "Company Size" and "Industry" fields
- Company Settings: add logo upload, tax/fiscal number, VAT number, approval chain config, standard work hours/days
- Company Settings: only company-level config (no user/project/UI settings mixed in)
- Users panel: add filtering by department, role, status + sorting
- Audit Log: implement proper management (pagination, filter by user/action/date range, export, retention policy display)
- Holidays: auto-import from public holiday calendars + manual add/edit/remove

### Agent Group 9: Mobile Verification + Fix
Files: ALL HTML files, _layout.css
- Open EVERY page at 390px mental model and verify:
  - No horizontal scrolling ANYWHERE (vertical only)
  - Bottom nav bar visible and functional
  - All buttons/inputs 44px+ touch targets
  - Tables converted to cards
  - Modals full-screen
  - Graphs readable
  - Cards in proper grid (not single column stack)
- Fix any remaining mobile issues found

---

## Founder's Verbatim Issues (ALL HIGH+ severity)

### ANALYTICS
1. "Utilisation" must be removed EVERYWHERE. Replace with "Work Time", "Contribution", or "Business Impact". It is dehumanizing.
2. Employee progress bar logic is broken. 84h week (40 billable + 40 non-billable + 4 internal) should show 200%+ overwork, NOT "less than 50% billable." Wrong metric, wrong framing, wrong color.
3. AI Insights must flag overwork and wellbeing. No holidays in a long time? Consistently overworking? The AI must surface this and recommend manager review.

### DASHBOARD
4. Dashboard layout is COMPLETELY BROKEN. Cards stack vertically in one column instead of a responsive grid. Critical layout failure.
5. Dashboard graphs are bad. Redesign for clarity, readability, visual usefulness.
6. "Utilisation" on dashboard (e.g., "Team Availability: 68%") — wrong label AND wrong logic. Rename to "Work Time." Must support values above 100%.
7. "Billable vs. Internal Hours" is buried at bottom. Must be at TOP — it's strategically critical.
8. Quick Log Time must support leave logging from same widget.
9. Project search in Quick Log Time must work for unassigned projects. Default shows assigned; search shows all. Unassigned project time requires manager approval.

### RESOURCE PLANNING
10. "Hours with Gap/Surplus" widget is confusing and meaningless. Redesign entirely.
11. Resource Planning needs AI-driven bench forecast insights ("This person has had no billable hours for X weeks — recommend assigning to Project Y").
12. Resource Planning layout is too stacked and unreadable. Needs card-based layout.

### MOBILE
13. Mobile experience is 0/10. Not responsive. Horizontal scrolling is unacceptable. Only vertical scroll allowed. All buttons, cards, layouts must adapt. CRITICAL.

### CLIENT / PROJECT / EMPLOYEE / INVOICE
14. ALL entity views lack AI-powered insights. Each overview MUST include smart, context-aware AI summary. Not optional.
15. Client overview must include: % of total business, PM ownership, revenue trend %, AI relationship recommendations, payment status, outstanding/overdue invoices, reminder messages.
16. Client permissions must be granular: admin sees all, PM sees own clients/projects, team members see project list but NOT billing of other projects. Fully configurable by admin.

### EXPENSES
17. Expense project dropdown has same broken logic as timesheets. Fix identically: default assigned, search all, approval for unassigned.

### LEAVES
18. Leave logging from timesheet must be possible (see Dashboard #8). Keep dedicated Leaves view for personal analytics.
19. Leave history must show worked-days count per month (e.g., "18 days worked in November").
20. Calendar squares can be smaller with compact summary row (worked days, personal, sick, annual, WFH).

### TEAM LEAVES CALENDAR
21. Calendar won't scale to 100-200+ people. Add search, filter by department/team/project/client.
22. Multi-day leave booking directly from calendar (click-drag or range select).
23. "More Details" popup (bottom-right) showing all employees on leave that day, with filtering by leave type, WFH, and name search.
24. Same filtering available on main calendar view.

### PROJECT DETAILS
25. Clicking a project to see detail is broken/missing. Full detail page MUST exist.
26. Project detail must include: duration, health status, milestones, teammate comments, delay flags, all financials.
27. Fixed-fee projects must NOT show budget as percentage. Show contract value, revenue earned, projected timeline.

### TEAM DIRECTORY
28. Directory won't scale to 200+ people. Better filtering and layout needed.
29. Org chart (organigram) view must exist. Full hierarchy: who reports to whom, by department, by seniority. Accessible with single click.

### CONFIGURATION
30. Remove "Company Size" and "Industry" — useless fields.
31. Add: logo upload, tax number, VAT number, approval chain config, standard work hours/days.
32. Company settings must ONLY contain company-level config. No mixing.
33. Users panel: add filtering by department/role/status + sorting.
34. Audit log must be manageable at scale: pagination, filter by user/action/date, export, retention policies.
35. Holidays: auto-import public holidays + manual add/edit/remove.

### CRITICAL — MISSING HR MODULE
36. App is called "Gamma HR" but has ZERO HR functionality. Build from scratch:
    - Recruitment: job postings, candidate pipelines, interview scheduling, auto-invitations, interviewer comments/approval, CV storage, candidate profiles, offer management, hiring workflows
    - Onboarding: checklist templates, document collection, equipment provisioning
    - Offboarding: exit checklists, knowledge transfer, equipment return
    - Employee lifecycle management
    - This is THE most critical gap. Without it, the app cannot fulfill its core value proposition.

---

## Previous Round Audit Findings Still Relevant

These were identified in Phase 1 Round 2 audits and reviews:

37. Command palette items should navigate to actual pages when clicked
38. Notifications should be clickable and navigate to relevant entities
39. "Mark all read" on notifications should work
40. Calendar page (calendar.html) is still missing from the prototype — BUILD IT
41. Print stylesheet needed for invoices/timesheets/reports
42. Light mode toggle (design system defines light mode but no toggle exists)
43. Breadcrumbs should be used on detail views for navigation context
44. Entity deep links are inconsistent — some pages use #profile/#detail hashes, others don't. ALL employee/project/client name links everywhere must go to the specific entity detail view, not the generic list page. This is the #1 remaining UX issue per Review2.
45. Mini profile hover cards (popup on mouse hover over any employee name) are completely missing — spec section 4.3 requires them
46. Sample data scale mismatch: KPIs say 48 employees but directory only shows 12. Either add more employees to the directory or adjust KPI numbers. Data must be internally consistent.
47. Email addresses are inconsistent (sarah.chen@gammahr.io vs @gamma.io vs @gammahr.com) — standardize
48. Command palette should be full-featured on ALL pages, not just index.html

---

## Step 4 — Verification Round

After all fixes, spawn 3 fresh verification agents:

### Verify Agent 1 — Complete Flow Walk-Through
Walk through every user flow end-to-end. Every button must do something.
Every link must go somewhere. Every form must validate and submit.

### Verify Agent 2 — Mobile at 390px
Every page. Vertical scroll only. No horizontal overflow. 44px touch targets.
Bottom nav. Full-screen modals. Cards not tables.

### Verify Agent 3 — Data Integrity
Every number that appears in more than one place must match.
Hours x rates = revenue. Revenue - cost = profit. Invoice amounts = line item sums.
Badge counts in sidebar = actual pending items.

---

## Guiding Principles

**On "Utilisation":**
The founder is explicit: the word is dehumanizing. Use "Work Time", "Contribution",
"Business Impact", or "Capacity" instead. This is not optional. Every instance,
every label, every tooltip, every chart axis, every CSS class name.

**On Overwork:**
The progress bar / metric system must support >100%. Someone working 60h in a 40h
week is at 150% work time. The bar should overflow with a warning color (terracotta/red).
The AI should flag this. The system should protect employees, not hide overwork behind
a 100% cap.

**On Mobile:**
The founder rates it 0/10. The only acceptable scroll direction is vertical. Period.
If any content requires horizontal scrolling, it is broken and must be fixed.
Test every single page at 390px width. Cards, not tables. Large buttons. Bottom nav.

**On AI Insights:**
Every entity overview (Employee, Project, Client, Invoice) must have an AI Insights
card that provides genuinely useful, context-aware intelligence. Not decorative.
Not "This project is on track." More like: "This project is burning budget 15% faster
than planned. At current rate, budget exhausted by May 20. Recommend reducing scope
of Sprint 3 or renegotiating with client."

**On the HR Module:**
The app is called "Gamma HR." The absence of HR functionality is the equivalent of
a restaurant with no kitchen. Build it. Recruitment is the minimum viable HR feature.
Onboarding and offboarding are essential. Performance reviews can wait for Phase 3.

**On Scale:**
Design for 200-500 employees, 50+ projects, 20+ clients. If a list shows all items
without pagination or virtual scrolling, it will break. If a calendar shows all 200
people, it will be unreadable. Filter, search, paginate everything.

**On Quality:**
The founder said the previous dashboard was "completely broken." The mobile was "0/10."
The HR module absence was "unacceptable." Meet these with solutions that are undeniably
excellent. Not "fixed." Excellent. The kind of quality where the founder opens the
prototype and says "now we're talking."

---

Begin with Step 0 — read all files. Then Step 1 — spawn the 4 expert critics.
Do not skip the critic phase. Do not go straight to fixing. Understand the full
scope before writing a single line.
