# CRITIC_FEEL.md — UX Feeling Audit
**Auditor:** Harsh UX Director
**Date:** 2026-04-10
**Scope:** All 19 prototype HTML files evaluated against the GammaHR UX philosophy (Ease, Calm, Completeness, Anticipation)

---

## Previously Reported Issues — Verification

| Issue | Status |
|-------|--------|
| Dashboard too packed (progressive disclosure) | FIXED. "Details" section is collapsed by default. Overview is visible. Collapsible toggles on heatmap and revenue. |
| "Work Days" duplicated | FIXED. Appears only once, in admin.html settings. |
| "Colleague is viewing" notification | FIXED. No "is viewing" banners anywhere. Presence is dots only. |

---

## New Findings

### [CRITICAL] EASE | leaves.html | Leave request form has no date intelligence

The leave request modal opens with **blank date fields**. The app knows the user's project schedule, the team calendar, and upcoming holidays. It should suggest the next available window (e.g., "Next gap: Apr 21-25, no team conflicts"). Instead, the user must manually pick dates, then wait for the conflict checker to react. This is Tempolia behavior — the user is doing work the app should have done.

**Fix:** Pre-fill start/end dates with the next recommended leave window. Show a "Suggested dates" chip above the inputs. Conflict detection should be instant and visible before the user touches the form.

---

### [CRITICAL] EASE | expenses.html | AI scan results require a manual "Apply to Form" step

After the AI scans a receipt and shows detected values (vendor, amount, date, category), the user must click "Apply to Expense Form" to transfer the data. This is an unnecessary confirmation gate. The form should be auto-filled the moment AI results are available, with the user reviewing/correcting rather than approving a transfer.

**Current flow:** Upload > AI scans > Results shown > Click "Apply" > Form fills
**Correct flow:** Upload > AI scans > Form fills automatically > Banner says "Auto-filled from receipt. Please review."

The `aiAutoFilledBanner` element exists but is hidden — the auto-fill path is built but not the default.

---

### [CRITICAL] EASE | invoices.html | Generate Invoice modal requires manual client/project selection

The "Generate Invoice" modal opens with blank Client and Project dropdowns. But the user typically arrives at this action from a specific client or project context. The app already knows which timesheets and expenses are approved and uninvoiced. The modal should pre-select the most obvious client/project and show the ready-to-bill amount immediately — user confirms, not configures.

**Fix:** Pre-select the client/project with the highest uninvoiced approved hours. Show the amount. User reviews and clicks "Generate."

---

### [HIGH] EASE | projects.html | New Project modal has no smart defaults

The "New Project" modal opens with all fields blank. No default billing model (Hourly is 80%+ of projects for consulting firms), no default rate (company standard rate), no default start date (today), no default end date (3 months from now). The "Create from Template" button is in the footer as a ghost button — it should be the primary entry point, not an afterthought.

**Fix:** Default billing model to "Hourly". Default rate to company standard. Default start date to today. Move template selection to a prominent step.

---

### [HIGH] EASE | leaves.html | Leave type defaults to "Annual Leave" but no remaining balance shown in the modal header

The modal shows "Balance after: 18 days remaining" at the bottom of the form, but the user needs to see their current balance at the top, before they start filling anything. They need context first, form second.

**Fix:** Show balance cards (Annual: 18/25, Sick: 8/10, Personal: 2/3) at the top of the modal, above the leave type selector. Selecting a type highlights the relevant card.

---

### [HIGH] COMPLETENESS | timesheets.html | "Pre-filled from active assignments" notice exists but Friday is not pre-filled

The timesheet shows a green notice: "Pre-filled from your active assignments." But Thursday shows 8h while Friday shows "Holiday" — fair enough. However, the notice implies intelligence that is not deep enough. If the user had a meeting or half-day Friday on their calendar before the holiday, the app should have known. More critically, Wednesday shows only 7h for Acme but 0 for Internal — the AI should have predicted the full 8h split based on the user's pattern.

The pre-fill is shallow (project rows only, not hour distribution). For a "the app does the work" experience, hours should be pre-filled too, not just project names.

---

### [HIGH] CALM | approvals.html | 12 approval cards with no priority guidance

The approvals page shows 12 items in a flat list. Urgent items have a red border, but there is no "Start here" guidance. The user must scan all 12 cards to decide what to do first. An AI summary like "3 urgent items need your attention. 4 routine timesheets can be bulk-approved." would reduce cognitive load dramatically.

**Fix:** Add an AI recommendation banner at the top: "4 routine timesheets match last week's pattern. Bulk-approve?" with a single action button.

---

### [HIGH] ANTICIPATION | timesheets.html | Submitted state is functional but emotionally flat

After submitting a timesheet, the user sees: a green banner "Submitted for Review — Awaiting manager approval" and the grid grays out. The toast says "Your timesheet has been sent for approval." This is correct but not rewarding. The UX philosophy demands that "completion feels like a reward" (Duolingo principle).

**Fix:** The submitted state should show "All done for the week" with a clear, celebratory completion card — total hours, billable %, and a satisfying visual (checkmark animation, confetti-free but premium). Not just a banner that sits on top of a grayed grid.

---

### [HIGH] COMPLETENESS | hr.html | Onboarding checklists are entirely manual

The onboarding tab shows 8 checklist items per new hire (contract signed, equipment ordered, IT access created, etc.). Every single one must be manually checked. The system should auto-check items it can verify: "IT access created" could be auto-detected from the admin user creation. "Equipment ordered" could be linked to a procurement workflow. "Welcome email sent" should be one-click auto-send, not a manual checkbox.

This is the most Tempolia-like flow in the entire app — a human checking boxes for things a system should track automatically.

---

### [MEDIUM] CALM | index.html | AI Alerts section has 4 alerts visible simultaneously

The dashboard's AI Alerts card shows 4 alerts stacked: Overwork Alert, Contract Expiry, Bench Alert, Expense Pattern. Each has a dismiss and action button. This creates decision fatigue. The AI should surface the single most important alert prominently, with "2 more alerts" expandable below.

**Fix:** Show top 1-2 alerts. Collapse the rest behind "View 2 more alerts." Prioritize by urgency (contract expiry > overwork > bench > expense pattern).

---

### [MEDIUM] EASE | clients.html | New Client modal has no field for billing rate or payment terms

Creating a client requires: name, industry, website, address, notes, contact info. But no billing rate and no payment terms — the two fields that actually matter for generating invoices later. The user will have to go back and configure these somewhere else, creating a disjointed flow.

**Fix:** Add default billing rate and payment terms (Net 30) to the client creation form. These are the fields that prevent friction in the invoice generation flow downstream.

---

### [MEDIUM] ANTICIPATION | expenses.html | After submitting an expense, user lands back on "My Expenses" with no celebration

The `submitExpense()` function shows a toast "Your expense of X has been submitted for approval" and switches to the My Expenses tab. The newly submitted expense appears in the list as "Pending." There is no visual acknowledgment that the user just completed something. The expense should briefly highlight (pulse animation) and the stats should update to reflect the new pending amount.

---

### [MEDIUM] COMPLETENESS | planning.html | "Assign to Project" modal has no AI suggestion

The resource planning page shows bench employees and capacity gaps. When clicking "Assign to Project," a modal opens with blank dropdowns (project, dates, allocation). The system knows which projects are understaffed and what skills the bench employee has — it should pre-select the best-fit project and suggest dates/allocation.

---

### [MEDIUM] EASE | admin.html | Invite User modal does not pre-select department or role

The admin invite modal has blank Role and Department dropdowns. If the admin just clicked "Invite" from within a department section or after viewing a team, the app should pre-select the relevant department. The most common role (Employee) should be the default.

**Fix:** Default role to "Employee." If the admin was browsing a specific department, pre-select it.

---

### [MEDIUM] CALM | account.html | No indication of profile completeness

The Account page has Profile, Security, Notifications, Preferences, and Data tabs. But there is no visual indicator of what percentage of the profile is complete or what security measures are enabled. A user returning after setup has no idea if they missed something (2FA not enabled, no profile photo, no notification preferences set).

**Fix:** Add a profile completeness indicator (e.g., "Profile 70% complete — Enable 2FA to improve security") at the top of the Account page.

---

### [MEDIUM] EASE | calendar.html | Adding an event has no flow — just a button

The calendar has an "Add Event" button but the page has no visible event creation modal or flow. The user expects to click a day cell and start creating. The calendar should support click-to-create on any day cell, pre-filling the date from where the user clicked.

---

### [MEDIUM] COMPLETENESS | portal/index.html | Client portal AI query box gives canned responses

The client portal has an AI query box, but it returns keyword-matched canned responses. The portal philosophy says the AI should know the client's context (their projects, invoices, team assignments). The canned responses feel like a FAQ, not an intelligent assistant.

---

### [MEDIUM] ANTICIPATION | approvals.html | After clearing all approvals, empty state is functional but not rewarding

The approvals page has a `celebratePulse` animation keyframe defined but the empty state after clearing all items likely just shows a static "No pending approvals" message. Clearing a queue of 12 items should feel like an achievement — "All caught up! 12 items processed today" with a clean, satisfying visual state.

---

### [MEDIUM] EASE | leaves.html | Half-day selector is radio buttons instead of a smarter control

The leave request form has three radio buttons: "Full day", "Half day (morning)", "Half day (afternoon)." For multi-day requests, the half-day option only makes sense for the first or last day — not the entire range. The current UI implies all selected days would be half-days, which is confusing.

**Fix:** Show the half-day option only when the date range is 1 day. For multi-day ranges, offer "Half day on first day" and "Half day on last day" toggles instead.

---

## Summary — Round 1

| Severity | Count |
|----------|-------|
| CRITICAL | 3 |
| HIGH | 5 |
| MEDIUM | 11 |
| **Total** | **19** |

---

## Round 2 Findings — 2026-04-11

---

### [CRITICAL] EASE | expenses.html | Date field in Submit Expense form has no default value

The date field (`<input type="date" id="formDate">`) in the Submit Expense form has no `value` attribute. Every user must manually click the date picker and select today's date for every expense. The app knows today is April 11, 2026. This is the most common date for an expense — the day you're submitting. The field should default to today (`value="2026-04-11"`), and only require user input when the expense was on a different date. Forcing the user to fill in "today" every single time is textbook Tempolia.

---

### [CRITICAL] EASE | invoices.html | Overdue invoices (2 items, €17,800) have no one-click "Send Reminder" action

Two invoices are overdue: INV-2026-046 (Contoso, overdue since Apr 14) and INV-2026-043 (Acme, overdue since Mar 15). Neither has a direct "Send Reminder" button in the table row — only a generic "more" (ellipsis) action button. Finding the chase/reminder action requires: click more → find reminder option → confirm → send. An overdue invoice is the single most urgent action in the finance module. The reminder action should be a visible, one-click button directly on each overdue row.

---

### [HIGH] COMPLETENESS | approvals.html | Approval detail panel shows "No details available" for leaves

The "View Details" button on leave approval cards opens a detail modal (`id="detailModal"`). For leave requests, the detail content should show the employee's remaining leave balance, the requested dates on a mini-calendar, any team members also on leave during those dates, and the approval history. Instead, the detail panel appears to use generic content. An approver is expected to make a decision without the context they need, forcing them to navigate away to the leaves page or the employee profile.

---

### [HIGH] EASE | timesheets.html | "Add Project Row" has no AI suggestion for which project to add

When an employee clicks "Add Project Row," they get a blank dropdown — a list of all projects. The app already knows which projects the employee is assigned to. The dropdown should show assigned projects first (pre-filtered), with unassigned projects in a secondary group below. Better yet: the AI should suggest "Add Globex Phase 2?" based on the employee's current assignments — one click to add the row with correct project name already set.

---

### [HIGH] EASE | hr.html | Adding a candidate to the pipeline has no structured form — no position/role pre-selection

The "Add Candidate" button in the recruitment Kanban shows no form in the prototype. Candidates appear in the "Applied" column but there is no visible flow for creating one. Even if a form exists, when the user is looking at a specific job posting's pipeline column, clicking "Add Candidate" should pre-fill the position field with the currently viewed role — not start from a blank form.

---

### [HIGH] CALM | index.html | Dashboard "Pending Approvals" stat card shows 12 but clicking it goes to all of approvals — not the urgent queue

The dashboard KPI card "Pending Approvals: 12" with "3 urgent" is a link to `approvals.html`. But it navigates to the default All tab showing all 12 items in submission-date order — not filtered by urgency. A user who clicked the card because they saw "3 urgent" now has to re-filter to find those 3 items. The link should navigate to `approvals.html` with urgency sort pre-applied, or jump directly to an "Urgent" filtered view.

---

### [HIGH] COMPLETENESS | clients.html | Client detail page shows "No documents uploaded yet" with no upload affordance in that tab

The Documents tab in the client detail panel shows an empty state with message "No documents uploaded yet" and a generic "Upload First Document" button. But when the user clicks it, there is no upload modal or file picker — the button calls `showToast('info','Upload','Document upload coming soon')`. This is a dead-end. The user does work (navigates to the tab, finds the action, clicks it) and gets nothing. A placeholder is acceptable, but the empty state should set expectations ("Document management coming in v1.2") rather than presenting a fake affordance.

---

### [HIGH] EASE | planning.html | "Assign to Project" modal for bench employees opens with blank project dropdown

When clicking "Assign to Project" from the bench roster in planning.html, the modal (`id="assignModal"`) opens with empty dropdowns for project, start date, end date, and allocation. The planning page already knows: (1) which projects are understaffed (shown in the capacity section above), (2) the skill profile of the bench employee being assigned, (3) the date range when the project needs resources. The modal should pre-fill the best-matching project based on skill overlap and capacity gap. Showing blank dropdowns forces the planner to mentally cross-reference information the app already has.

---

### [MEDIUM] CALM | admin.html | Company Settings tab has no "Save Changes" button — auto-save is not indicated

The Company Settings form (General, Regional, Work Rules sections) has multiple editable fields but no visible Save button in the tab. Looking at the form, there is a Save button somewhere in the footer or the user must scroll — but the page does not communicate whether changes are auto-saved or require manual save. If changes are NOT auto-saved and the user navigates away, their work is lost silently. If they ARE auto-saved, there is no feedback indicating this. This creates anxiety every time an admin edits a setting.

---

### [MEDIUM] EASE | account.html | Profile photo upload shows "coming soon" toast — but it's the first action in profile setup

When a new user opens their Account page, the "Change Photo" button shows a `showToast('info', 'Coming soon', ...)` response. Profile photo is typically the first thing users want to set — it personalizes their presence across the app. Presenting it as "coming soon" at the primary CTA of the profile setup flow breaks trust. Either implement it (even a basic file picker) or don't show the button at all until it's functional.

---

### [MEDIUM] COMPLETENESS | leaves.html | Leave balance cards on "My Leaves" tab don't update after submitting a leave request

When a leave request is submitted via the modal, the `updateBalanceAfter()` function updates the number inside the modal's form-calc section. But the four balance cards visible on the "My Leaves" tab (Annual: 18 days remaining, Sick: 10 days, Personal: 3 days, WFH: 5 days) do not update. The user submits a 3-day leave, closes the modal, and sees "18 days remaining" — unchanged. The app appears to ignore their submission, creating doubt about whether it worked.

---

### [MEDIUM] CALM | hr.html | Recruitment pipeline shows 47 active candidates in the tab badge but "Applied" column shows "15" candidates, "Screening" shows 2, etc. — total across all columns is 12, not 47

The HR tab shows `Recruitment <span class="tab-count">47</span>`. The KPI card says "47 Active Candidates." But the Kanban pipeline summary bar shows: Applied 3, Screening 2, Interview 3, Offer 2, Hired 2 — totaling only 12 visible candidates. This is a data contradiction that will alarm any user: "Where are the other 35 candidates?" The Applied column header even says 15 but only 3 cards are visible. This creates confusion and distrust about the data. The numbers need to be consistent or pagination/filtering must be clearly indicated.

---

### [MEDIUM] EASE | calendar.html | Clicking a calendar day cell does NOT open the event creation form

The calendar page philosophy is "click to create." But clicking a day cell in the monthly or weekly view does not open the New Event modal with the date pre-filled. The only way to add an event is the "+ Add Event" button in the page header, which opens the modal with today's date as default. The click-on-day flow is the most natural interaction pattern for any calendar app (iPhone, Google Calendar, Notion). Not supporting it means the most intuitive action fails silently.

---

### [MEDIUM] ANTICIPATION | portal/index.html | Client portal has no "What's new since your last visit" surface

When a client returns to the portal, there is no indication of what changed since they last logged in (new invoices generated, timesheet entries submitted for approval, messages received, project milestones hit). The portal simply shows the same static overview. A returning client should see "Since your last visit: 1 new invoice sent, 3 timesheets submitted" — exactly like how a good banking app shows what changed overnight. This is the anticipation principle: make returning feel worthwhile.

---

### [MEDIUM] EASE | timesheets.html | Summary progress bar shows 67% fill (27h/40h) but label says "80%"

In the Weekly Summary bar below the timesheet grid, the progress fill is set to `style="width: 67%; background: var(--color-primary);"` but the percentage label `id="summaryProgressPct"` shows "80%". These are inconsistent. The actual logged hours are 32h (per `id="summaryTotal"`), which is 80% of 40h target. The bar width at 67% corresponds to approximately 27h. This is a data rendering bug that directly contradicts the "completion is always visible" principle — the user cannot trust the progress indicator.

---

## Summary — Round 2

| Severity | Count |
|----------|-------|
| CRITICAL | 2 |
| HIGH | 6 |
| MEDIUM | 7 |
| **Round 2 Total** | **15** |

---

## Grand Total (Both Rounds)

| Severity | Count |
|----------|-------|
| CRITICAL | 5 |
| HIGH | 11 |
| MEDIUM | 18 |
| **Grand Total** | **34** |
