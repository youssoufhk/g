# GammaHR v2 Prototype -- UX Flows & Completeness Audit

**Auditor:** Critique Agent 4 -- UX Flows & Completeness  
**Date:** 2026-04-05  
**Scope:** All core daily workflows (Leave, Expense, Timesheet, Approvals)  
**Files Reviewed:** leaves.html, expenses.html, timesheets.html, approvals.html, index.html, employees.html, APP_BLUEPRINT.md (sections 6-8, 13)

---

## Executive Summary

The prototype demonstrates strong visual polish and a clearly thought-out information architecture. The "Earth & Sage" dark-mode design is applied consistently, and every page shares a common shell (sidebar, header, notifications, command palette). However, **the flows are presentation-ready, not task-completion-ready**. Multiple critical gaps exist that would leave a real user stranded mid-task: missing form validation feedback, absent post-submission confirmation states, phantom "View Details" buttons, and a disconnect between the individual module approval queues and the central Approvals Hub. The prototype earns high marks for layout and visual fidelity, but it needs serious work before anyone can walk a user test from end to end without the facilitator saying "pretend this happened."

**Overall Score: 6.5 / 10** -- Good skeleton, needs the connective tissue.

---

## Flow 1: Leave Request

### Rating: 7 / 10

### Walkthrough

**1. Entry Point -- GOOD**

Multiple clear entry points exist:
- Prominent "+ Request Leave" button in the page header (top-right, primary button).
- Clicking a day on the Leave Calendar tab triggers the modal with a prefilled date.
- Command palette includes a "Request Leave" action.
- Empty state has a CTA that triggers the same modal.
- Dashboard does NOT have a direct "request leave" shortcut, but that is acceptable since the sidebar link is always visible.

**2. Form/Input -- GOOD, with gaps**

The modal form includes:
- Leave type dropdown (Annual, Sick, Personal, WFH) -- correct.
- Start date and end date pickers -- correct.
- Live "working days" calculator that excludes weekends -- excellent touch.
- "Balance after" calculator -- excellent, updates on type change.
- Conflict detection banner ("No conflicts detected" / warning) -- excellent.
- Optional notes field -- correct.

**Issues:**
- **No half-day option.** The blueprint (section 6.2) specifies half-day support. The form only allows full days. A user who needs a half-day morning off cannot express this.
- **No date validation visual.** If the user picks an end date before the start date, the JS catches it and shows a toast error, which is good, but the form fields themselves do not turn red or show an inline error. The toast disappears after 4 seconds. If the user missed it, they have no idea what went wrong.
- **No pre-population of leave type.** If the user clicks from the "Sick Leave" balance card, the modal does not pre-select "Sick Leave." It always defaults to "Annual Leave." This is a missed affordance.

**3. Submission -- GOOD**

Clicking "Submit Request" creates a new leave-request-card dynamically inserted into the "My Leaves" list with a "Pending" badge. The balance card updates (remaining days decrease, pending count increases). A success toast fires: "X day(s) of Annual Leave submitted for approval." The modal closes automatically.

This is one of the better-implemented submission flows in the prototype.

**4. Status Tracking -- GOOD**

My Leaves tab shows every request with clear status badges (Approved/Pending/Rejected/Cancelled). Each card shows:
- Date range and duration.
- Leave type.
- Approver name and approval date (for approved requests).
- Notes in italics.
- A "Cancel Request" button on pending requests.

**5. Approval Side -- GOOD**

The Team Leaves tab provides:
- A filterable data table with checkbox selection.
- Per-row Approve/Reject buttons.
- Bulk Approve/Reject Selected buttons.
- Conflict warning indicators ("2 others off that week").
- Department and date range filters.

The approval actions fire toasts and animate rows out. Rejection does not prompt for a reason -- this is a gap. A manager who rejects a leave request should be required to provide a reason (the expense rejection modal does this, but leave rejection does not).

**6. Completion -- ACCEPTABLE**

After approval, the row updates its status badge. After rejection, same. The leave calendar reflects approved leaves. The heatmap section shows historical leave days.

**7. Edge Cases**

| Scenario | Handled? | Notes |
|----------|----------|-------|
| Cancel pending request | YES | Confirmation modal with "Are you sure?" -- well done. |
| Edit pending request | NO | There is no edit button. A user would need to cancel and re-submit. This is a real frustration point. |
| Reject with reason | NO | Team reject just fires immediately with no reason prompt. |
| Insufficient balance | PARTIALLY | The "Balance after" shows negative if you overbook, but there is no hard block or warning banner. A user could submit a request for 20 days when they have 3 remaining. |
| Overlapping requests | NO | No validation prevents submitting a leave request that overlaps with an existing one. |
| Half-day requests | NO | Per blueprint spec, half-days should be supported. |

### Critical Gaps
1. **No rejection reason prompt** on Team Leaves tab.
2. **No edit flow** for pending requests.
3. **No half-day support** per spec.
4. **No hard block** when balance would go negative.
5. **No overlap validation** between existing requests.

---

## Flow 2: Expense Submission

### Rating: 6.5 / 10

### Walkthrough

**1. Entry Point -- GOOD**

- "+ New Expense" button in page header switches to the Submit Expense tab.
- The tab itself is clearly labeled "Submit Expense" with a plus-circle icon.
- Command palette does NOT have a "New Expense" action (unlike leaves). This is an inconsistency.

**2. Form/Input -- GOOD layout, weak interaction**

The form has a two-column layout:
- Left: Receipt upload zone + AI scan + policy compliance checks.
- Right: Expense form fields.

Form fields present:
- Type (dropdown, required) -- Travel, Hotel, Meals, Software, Equipment, Transport, Office Supplies.
- Amount + currency (EUR, USD, GBP, CHF) -- correct.
- Date (date picker) -- correct.
- Project (dropdown, optional) -- correct.
- Billable checkbox -- correct.
- Description (textarea) -- correct.

**AI/OCR flow:**
- "Scan with AI" button triggers a simulated scan (spinner overlay, 2-second delay).
- After scan, an "AI detected" result card appears showing vendor, amount, date, and suggested category.
- Policy compliance section shows "Within EUR500 daily limit" and "Receipt: Required and attached."

**Issues:**
- **AI results do not auto-fill the form.** The AI scan result shows "Marriott Hotel Lyon, EUR340, April 2, Hotel" but the form fields remain empty. The user is expected to manually copy values from the AI result card into the form. This defeats the entire purpose of OCR. The blueprint (section 7.2) explicitly states the form should be "auto-populated from OCR data" with the user only needing to "verify and tweak."
- **No actual file upload handling.** The upload zone has drag-and-drop event listeners and click handler, but clicking "Browse" or "Camera" does nothing functional. The dragover/drop events just toggle the "drag-active" CSS class. No file input is created. For a prototype, at minimum the UI should show a "receipt.pdf attached" state after simulating an upload.
- **No required-field validation.** The `submitExpense()` function just fires a success toast immediately regardless of whether any fields are filled in. A user could submit a completely empty expense. No inline validation, no error toasts, nothing.
- **Policy checks are static.** The policy compliance section always shows "Within limits" regardless of what amount the user enters. It should dynamically update based on the amount field.

**3. Submission -- WEAK**

`submitExpense()` does exactly one thing:
```javascript
showToast('success', 'Expense submitted', 'Your expense has been submitted for approval.');
switchTab('my-expenses');
```

No new expense item appears in the "My Expenses" list. No form clearing. No loading state. The user switches back to My Expenses and sees the same static list. They have zero visual confirmation that their expense was actually recorded. This is a broken flow.

**4. Status Tracking -- GOOD (static)**

The My Expenses tab shows a well-designed list of expenses with:
- Amount prominently displayed in mono font.
- Category icon and type.
- Date, project link, description.
- Billable/Non-billable tags.
- Receipt attachment indicators.
- Status badges (Approved, Pending, Rejected).
- Rejection reason display (for rejected items) -- nice touch.
- Edit/Cancel buttons on pending items (but Edit does not open any form).

Filter bar includes status, type, project, billable toggle, and date range. Good.

**5. Approval Side -- GOOD**

The Approval Queue tab (tab 3) shows:
- Employee avatar and name (linked to profile).
- Amount, category, date, project.
- Receipt attachment indicator.
- Policy compliance status (within limits / OVER LIMIT).
- Approve and Reject buttons.
- Comment input field per item -- nice touch that leaves and timesheets lack.

The approval flow:
- Approve: item fades out with animation, toast fires, count decreases. Good.
- Reject: opens a modal with a required reason textarea. Good. This is better than the leave rejection flow.

**6. Completion -- ACCEPTABLE (static)**

Approved items stay in My Expenses with updated badge. Rejected items show the rejection reason. No automatic resubmission flow exists.

**7. Edge Cases**

| Scenario | Handled? | Notes |
|----------|----------|-------|
| Edit pending expense | PARTIALLY | Button exists but does nothing. |
| Cancel pending expense | PARTIALLY | Button exists but has no handler. |
| Resubmit rejected expense | NO | No affordance. User would need to create a new expense. |
| Duplicate detection | NO | Blueprint mentions AI duplicate detection. Not prototyped. |
| Receipt-required policy | STATIC | Always shows "required and attached" regardless of actual state. |
| Multi-currency conversion | NO | Currency selector exists but no conversion display. |

### Critical Gaps
1. **AI scan does not auto-fill the form** -- defeats the OCR value proposition entirely.
2. **Submission produces no visible result** -- the most serious flow break in the prototype.
3. **No form validation whatsoever** -- empty submissions succeed silently.
4. **Edit and Cancel buttons on pending items are non-functional.**
5. **Upload zone is purely decorative** -- no simulated file attachment state.
6. **No command palette action** for "New Expense" (inconsistent with Leaves).

---

## Flow 3: Timesheet Entry & Submission

### Rating: 8 / 10

### Walkthrough

This is the strongest flow in the prototype.

**1. Entry Point -- EXCELLENT**

- Timesheets is the second item in the sidebar, prominent under "Main."
- The Week View tab opens by default showing the current week.
- Status bar immediately tells you: "32.5h logged, 7.5h remaining to reach 40h" with a progress bar.
- Week navigation (prev/next/today) is clear.
- "Copy" dropdown (Last Week, Template) for rapid pre-fill.

**2. Form/Input -- EXCELLENT**

The timesheet grid is a proper spreadsheet-like interface:
- Rows = projects (Acme Web Redesign, Initech API).
- Columns = days of the week (Mon-Sun with weekend columns grayed out).
- Click any cell to edit inline (input appears with focused border and box-shadow).
- Tab/Enter navigation between cells -- keyboard users can fill an entire row without touching the mouse.
- Arrow key navigation (left/right moves between cells in a row) -- nice.
- Blur on cell commits the edit.
- Row totals, column totals, and grand total all recalculate live.
- Target row and status row (checkmark/warning icons per day).
- "Add Project Row" button with a project dropdown (populated with available projects).
- Under-target cells get a warning background color.
- Progress bar and percentage update as you type.

**Issues:**
- **Weekend cells are non-editable** but this is not explicitly communicated. The cursor changes to default, but there is no tooltip saying "Weekend -- no entry." A user might click repeatedly thinking it is broken.
- **No per-cell notes or task descriptions.** The blueprint mentions "Click cell to expand with task notes." The prototype only allows hour values. For a consulting firm, knowing WHAT was done, not just hours, is often required.
- **No leave-day integration.** If a user is on approved leave on Wednesday, the cell should show "On leave" and be blocked. Currently, leave days have no representation in the timesheet grid.
- **The initial status bar says 32.5h but the grid actually sums to 40h.** The static HTML status bar text ("32.5h logged") does not match the actual grid values (Acme: 6+7+8+6+4=31, Initech: 2+1+0+2+4=9, total=40). The JS recalculate function updates it correctly when you interact, but on first load there is a visual data mismatch. This would confuse QA and demo attendees.

**3. Submission -- GOOD**

- "Save Draft" button: fires a success toast "Your timesheet draft has been saved." No other state changes. Acceptable for a prototype.
- "Submit for Review" button: checks if total < 40h and shows a warning toast if so ("You have only logged Xh. Target is 40h."). If >= 40h, fires a success toast "Your timesheet has been submitted for review."

**Issue:** After submission, the grid does not lock or change state. It should become read-only with an "Editing locked -- submitted for review" banner. The user can keep editing after submitting, which in production would be a data integrity issue.

**4. Status Tracking -- GOOD**

The Previous Weeks tab shows a table with:
- Week range.
- Total hours and billable hours.
- Status (all Approved in the demo data).
- Submission date.
- Approver link.

Clean and useful. Missing: no way to click into a past week to view its full grid breakdown.

**5. Approval Side -- GOOD**

The Approval Queue tab (tab 3) shows:
- Employee avatar and name.
- Week period.
- Project breakdown with hours.
- Total hours (with warning badge if under target, e.g., "Only 8h logged").
- Submitted timestamp.
- Approve/Reject buttons.

Approve: card fades out, toast fires, count decreases.
Reject: opens a modal with required reason textarea, then fades out the card. This is well done.

**6. Completion -- GOOD**

After approval, the item disappears from the queue. Count updates. The rejected item fires a toast with the employee name.

**7. Edge Cases**

| Scenario | Handled? | Notes |
|----------|----------|-------|
| Edit after submission | PROBLEM | Grid remains editable after submitting. Should lock. |
| Undo submission | NO | No "Recall" button exists. Once submitted, no take-back. |
| Overtime detection | PARTIAL | The status bar shows >40h is possible but no explicit overtime warning. Blueprint mentions overtime flagging. |
| Delete project row | NO | You can add rows but not remove them. |
| Copy last week | YES (simulated) | Fires a toast. Actual hours are not copied into the grid. |
| Week navigation | YES | Prev/next/today buttons work and update the label. Grid data is static though. |

### Critical Gaps
1. **Grid does not lock after submission** -- users can edit "submitted" timesheets.
2. **No leave-day integration in the grid** per blueprint spec.
3. **No per-cell notes/descriptions** per blueprint spec.
4. **Static status bar mismatch** on initial load (32.5h text vs 40h actual).
5. **Copy last week does not actually copy values** into the grid.
6. **Cannot delete a project row** once added.

---

## Flow 4: Approvals Hub (Unified)

### Rating: 7.5 / 10

### Walkthrough

**1. Entry Point -- EXCELLENT**

- Dedicated "Approvals" item in sidebar under Admin, with a badge showing "12."
- Badge count is visible on every page via the shared sidebar.
- Dashboard has a "Pending Approvals" widget with tabbed sub-views (Timesheets/Leaves/Expenses) and inline Approve/Reject buttons.
- Notifications panel on every page shows approval-related items.

**2. Unified View -- GOOD**

The Approvals Hub page shows ALL three types in a single stream:
- 7 timesheets, 3 leaves, 2 expenses = 12 total.
- Type tabs: All (12), Leaves (3), Timesheets (7), Expenses (2) -- with counts.
- Each card has a clear type badge (Timesheet/Leave/Expense) with color-coded icon.
- Urgency grouping: "URGENT - Overdue (2)" section with red left-border cards, then "PENDING (10)" section.

Card content is type-appropriate:
- Timesheets show: week period, hours, project breakdown.
- Leaves show: date range, type, duration, balance-after, team impact.
- Expenses show: amount, category, project, receipt status, policy compliance.

**Excellent features:**
- Checkbox per item for bulk selection.
- Fixed-position bulk action bar that slides up when items are selected (count + Approve/Reject buttons).
- Filter bar: sort by urgency/date/name/type, department filter, employee filter.
- "Bulk Actions" dropdown: Approve All Visible, Export CSV, Reject All Selected.
- "View Details" button per card (opens a detail modal).

**3. Approval Actions -- GOOD**

- Approve: card gets `removing-item` class (fade+slide animation), then removed from DOM. Toast fires. Count updates.
- Reject: opens a modal requiring a reason text. Confirm rejects and removes the card with animation.
- Bulk approve/reject: works on all checked items simultaneously.

**4. Problems**

- **"View Details" modal is a placeholder.** It opens with the text: "Detailed view of the request including full breakdown, history, and comments would appear here in the full application." For a prototype meant to demonstrate the flow, this is a significant hole. A manager reviewing a timesheet needs to see the full hour breakdown. A manager reviewing an expense needs to see the receipt. Without this, the "View Details" button is a dead end.
- **No comment/note field per approval.** The expenses page approval queue has an inline comment input per item. The central Approvals Hub does NOT. A manager should be able to add a note when approving ("Looks good, approved for March travel").
- **Urgency grouping is not dynamic.** The "URGENT" and "PENDING" labels are static HTML. When you approve the two urgent items, the "URGENT" label and header remain visible as empty sections. They should disappear.
- **No "Send Back" or "Request More Info" action.** Sometimes a manager does not want to approve OR reject -- they need more information. There is no third action for this.
- **Tab filtering is not wired.** The Leaves/Timesheets/Expenses filter tabs have `data-filter` attributes but no JS handler to actually filter the list. All tabs show the same "All" list.

**5. Dashboard Widget Integration -- GOOD**

The dashboard "Pending Approvals" card shows:
- Tabbed sub-views for Timesheets, Leaves, Expenses.
- Compact approval items with Approve/Reject buttons.
- Links to employee profiles.

This widget works as a quick-action triage for the most common case (approve an obvious timesheet). For anything requiring investigation, the user navigates to the full Approvals Hub.

**6. Edge Cases**

| Scenario | Handled? | Notes |
|----------|----------|-------|
| View request details | PLACEHOLDER | Modal is empty. Critical gap. |
| Add comment on approval | NO (Hub) / YES (Expenses page) | Inconsistent. |
| Filter by type | NOT WIRED | Tab data attributes exist but no JS. |
| Bulk approve | YES | Works well with animation. |
| Send back for revision | NO | No "Request Info" action. |
| Empty state | YES | "All caught up!" message with a check icon. |
| Urgent items cleared | PARTIALLY | Cards disappear but section label persists. |

### Critical Gaps
1. **Detail modal is empty** -- the most important feature for thoughtful approval is missing.
2. **Tab filtering is not wired** -- clicking "Leaves" does not filter to only leave items.
3. **No inline comment field** in the Approvals Hub (present in Expenses page, absent here).
4. **No "Request More Info" action** -- binary approve/reject is too limiting.
5. **Section labels persist** after their contents are emptied.

---

## Flow 5: Dashboard Entry Points

### Rating: 7 / 10

The dashboard (index.html) serves as the hub. It does this well:

**What works:**
- KPI cards: Active Employees, Hours This Week, Pending Approvals (with "3 urgent" warning), Billable %, Open Projects, Expenses This Month.
- Team Availability table with utilization bars and status badges.
- AI Alerts widget (unusual expense, timesheet gap, resource conflict).
- Mini Gantt chart (this week at a glance).
- Live Presence panel (online/away/on-leave/offline status per employee).
- Pending Approvals widget with inline approve/reject.
- Revenue chart.

**What is missing:**
- **No "My Timesheet This Week" widget.** The single most common action for a non-manager user is logging their own hours. The dashboard provides zero shortcut for this. There should be a prominent "Log your hours for this week" card showing current progress toward the 40h target.
- **No "My Pending Requests" widget.** If I submitted a leave request or expense, I want to see its status on the dashboard without navigating away. The dashboard only shows things to approve, not things I am waiting on.
- **AI Alerts "Investigate" buttons do nothing.** They have no onclick handler.
- **Approve buttons in the dashboard widget have no JS handler.** The `.approve-btn` class buttons inside the dashboard approval items are not wired to any event listener. Clicking them does nothing.

---

## Flow 6: Employee Profile (Cross-Flow Data)

### Rating: 6 / 10

The employee profile (employees.html) has tabs for Timeline, Projects, Leaves, Timesheets, Expenses, Skills, and Documents.

**What works:**
- Timeline tab shows a chronological activity feed mixing leave events, timesheet approvals, expense submissions, project assignments, and skill additions. This is excellent for manager context.
- Leaves tab shows balance cards and a full leave history table.
- Timesheets tab shows monthly summaries (billable/non-billable/total/target/gap).
- Mini stat cards show utilization, billable hours, and leave remaining.

**What is missing:**
- **Expenses tab content is not present in the portion reviewed.** The tab exists but no expenses data table was rendered (may be further down in the file, but based on the leave and timesheet tabs pattern, it likely exists as static HTML).
- **No action buttons from the profile.** If I am a manager viewing an employee's leave history, I cannot approve or reject their pending request from this view. I have to navigate to the Leaves page or Approvals Hub. The blueprint suggests deep linking: clicking a leave entry should open the leave detail modal.
- **No link from leave/timesheet/expense items to the originating page.** The profile shows "Timesheet approved for W13" but you cannot click to view that specific timesheet.

---

## Cross-Cutting Issues (All Flows)

### 1. Inconsistent Rejection Flows
- **Expense rejection:** Opens a modal requiring a reason. Correct.
- **Leave rejection (Team Leaves):** Instant rejection, no reason required. Wrong.
- **Timesheet rejection (Timesheet Approval Queue):** Opens a modal requiring a reason. Correct.
- **Timesheet rejection (Approvals Hub):** Opens a modal requiring a reason. Correct.

Leaves is the outlier. Fix it.

### 2. No Loading/Saving States
No button anywhere shows a spinner or "Submitting..." state. Every action is instant. In production, network latency exists. The prototype should demonstrate optimistic UI patterns or at minimum show that loading states have been considered.

### 3. No Error States
What happens when something goes wrong? No form shows inline validation errors with red borders. No "something went wrong, try again" state exists anywhere. The only error toasts are for date validation in the leave modal and for empty rejection reasons. For a premium HR platform, error handling is not optional.

### 4. No Undo
No action in the entire prototype supports undo. Approved something by accident? No take-back. This is especially dangerous with the bulk approve feature in the Approvals Hub.

### 5. Filter Controls Are Decorative
In every page (Leaves, Expenses, Approvals), the filter dropdowns (status, type, department, project, date range) exist in the HTML but have NO JavaScript handlers. Changing a filter does nothing. The list does not filter. For a prototype meant to demonstrate usability, this makes it impossible to test the "can a manager find what they need" question.

### 6. Notifications Are Static
Every page has a notification panel with contextually appropriate items (timesheet reminders, expense alerts, leave approvals). But:
- Clicking a notification does not navigate anywhere.
- "Mark all read" does nothing.
- No indication of which page/entity a notification relates to.

### 7. Data Inconsistencies Between Pages
- The dashboard says "12 pending approvals" and the sidebar badge says "12." The Approvals Hub shows 12 items. GOOD -- this is consistent.
- However, the Leaves page sidebar badge says "3" (pending leaves), but the Team Leaves tab shows 3 pending AND 5 approved = 8 total. The badge likely means "pending," but this is ambiguous.
- The timesheet status bar says "32.5h" on load but the grid sums to 40h. Data mismatch.

### 8. Keyboard Accessibility
- Timesheet grid has excellent keyboard navigation (Tab, Enter, Arrow keys).
- Modal forms have no keyboard shortcut to submit (Enter does not submit the leave modal).
- Command palette exists but does not support keyboard navigation of results (no arrow-key selection working on cmd-palette-items).
- No skip-to-content link for screen readers.
- Toast notifications have no ARIA live region announcement.

---

## Completely Missing Flows

1. **Expense editing flow.** Edit button exists but opens nothing. A user who made a typo in an expense amount cannot fix it.
2. **Leave editing flow.** No edit button at all. Must cancel and re-create.
3. **Timesheet recall/revert.** Once submitted, no way to pull it back.
4. **Expense resubmission after rejection.** Rejected expenses have no "Resubmit" or "Clone and edit" action.
5. **Multi-step approval chain.** Blueprint mentions approval chains (manager then finance). Prototype only shows single-level approval.
6. **Batch expense submission.** For a consultant returning from a trip with 10 receipts, there is no multi-receipt upload flow.
7. **Delegation/proxy approval.** What if the manager is on vacation? No delegation UI.
8. **Audit trail / history view.** Who approved what, when, with what comment? No history log on any entity.
9. **Print / email receipt for approved expenses.** No output format.
10. **Timesheet template management.** The "Copy > Template" option fires a toast but there is no way to save or manage templates.

---

## Score Summary

| Flow | Score | One-Line Verdict |
|------|-------|-----------------|
| Leave Request | 7/10 | Strongest form flow; needs half-day support, edit capability, and rejection reasons. |
| Expense Submission | 6.5/10 | Beautiful layout, broken completion -- AI scan does not fill form, submit produces no visible result. |
| Timesheet Entry | 8/10 | Best interactive prototype in the set; needs post-submit lock and leave-day integration. |
| Approvals Hub | 7.5/10 | Excellent unified concept; detail modal is empty, tab filtering not wired. |
| Dashboard Entry Points | 7/10 | Rich manager view; missing employee self-service shortcuts. |
| Employee Profile | 6/10 | Good cross-referencing; no actionable links from profile data to source flows. |

**Weighted Average (core flows only): 7.0 / 10**

---

## Priority Fixes (Ranked by User Impact)

### P0 -- Flow Breakers (fix before any user testing)

1. **Expense submit must produce a visible result.** At minimum, add the new expense to the My Expenses list and clear the form.
2. **AI scan must auto-fill the expense form fields.** Otherwise the OCR feature is useless.
3. **Approvals Hub tab filtering must work.** Clicking "Leaves" must hide non-leave items.
4. **Approvals Hub detail modal must show real content** (timesheet grid breakdown, expense receipt, leave details).
5. **Leave rejection must require a reason** (add the same modal pattern used for expenses and timesheets).

### P1 -- Serious Gaps (fix before demo to stakeholders)

6. Wire expense form validation (required fields, non-empty amount).
7. Lock the timesheet grid after submission with a "Submitted" banner.
8. Fix the status bar / grid data mismatch on timesheet initial load.
9. Add an inline comment field to Approvals Hub cards (matching the expense approval queue).
10. Wire dashboard approval buttons so they actually approve items.

### P2 -- Completeness (fix before development handoff)

11. Add half-day toggle to leave request modal.
12. Add edit flow for pending expenses (re-open form with pre-filled data).
13. Add "Request More Info" as a third action on the Approvals Hub.
14. Clean up empty section labels when all items in a group are resolved.
15. Add simulated file attachment state to the expense upload zone.
16. Make filter dropdowns functional across all pages.
17. Wire notification items to navigate to the relevant page/entity.
18. Add a "My Timesheet This Week" shortcut widget to the dashboard.
19. Add leave-day markers to the timesheet grid.
20. Add keyboard submit (Enter) to all modal forms.

---

*End of audit. Every gap listed above is a point where a real user would pause, frown, and reach for Slack to ask "is this broken?" Fix the P0s and this prototype will be compelling. Leave them in and every user test will be derailed by the same five issues.*
