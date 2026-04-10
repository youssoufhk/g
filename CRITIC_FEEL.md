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

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 3 |
| HIGH | 5 |
| MEDIUM | 11 |
| **Total** | **19** |

The prototype is structurally sound and visually polished. The friction that remains is almost entirely in the **EASE** and **COMPLETENESS** dimensions: forms that should be pre-filled, AI that detects but does not auto-apply, and flows where the user configures what the app should already know. These are the exact patterns the UX philosophy identifies as Tempolia behavior. Fixing these 19 items would move GammaHR from "works well" to "feels like it works for you."
