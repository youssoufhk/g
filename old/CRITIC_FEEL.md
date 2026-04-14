# CRITIC_FEEL.md — GammaHR v2 UX Feeling Audit
**Critic type:** FEEL (Ease · Calm · Completeness · Anticipation)
**Date:** 2026-04-13
**Auditor:** Harsh UX Director

---

## --- SECTION 1: ISSUES ---

---

### EASE — The app is doing the work / The user is doing the work

**[CRITICAL] | expenses.html | Receipt Scan → Form Apply | Two-step AI scan is a broken promise**
The AI scans the receipt and shows detected fields (vendor, amount, date, category) in a preview panel — but then requires the user to click a second button "Re-apply AI Results" to actually fill the form. The AI did the work but then stopped halfway and waited for permission. After scanning, the form should be auto-filled immediately. The user should only confirm.
*Should feel like:* Upload receipt → form fills itself → user reviews and adjusts → submit. Zero extra clicks.

**[CRITICAL] | timesheets.html | Adding a project row | User must manually select a project from a blank dropdown**
The "Add Row" button in the week view opens an empty project selector. The app already knows which projects the user is actively assigned to this week. There should be no blank rows. The app should pre-populate one row per active assignment automatically. The user's only job is filling in hours.
*Should feel like:* Open the week → all your projects are already there, ready for hours to be entered.

**[CRITICAL] | expenses.html | Date field | Defaults to empty, not today**
The expense submission form has an empty date field requiring the user to pick a date. Every expense being submitted today happened today or very recently. The app knows the current date. This field should always default to today. The user changes it only for past expenses.
*Should feel like:* Date is always today. User touches it only for exceptions.

**[HIGH] | invoices.html | Generate Invoice modal | User fills client, project, and date range from scratch even with context**
The "Generate Invoice" button opens a modal starting from empty. But when a user arrives from a project page or has been filtering invoices by client, the context is clear. The modal should pre-populate client, project, and date range from that context. Starting from zero every time adds unnecessary steps to the billable cycle.
*Should feel like:* Click "Generate Invoice" while viewing a project → client and project are pre-selected, period defaults to last unbilled month. User confirms and generates.

**[HIGH] | leaves.html | Leave type not pre-selected when clicking balance card**
The leave balance cards (Annual Leave, Sick Leave, etc.) are tappable and call `openLeaveModalWithType()`. If this pre-selects the type correctly, it is good. But if the modal opens to "Select type..." the affordance is broken — the card click promised "I'll request this type" and the modal did not deliver. This must be verified and enforced.
*Should feel like:* Click "Annual Leave" card → modal opens with Annual Leave pre-selected and remaining balance visible.

**[HIGH] | approvals.html | Rejection reason is optional with no examples | Managers reject without context**
The rejection modal requires the manager to write a reason, but the textarea has only a generic placeholder and the field appears optional. Employees receiving rejections with no reason ("") or vague reasons are left without guidance. The field should be required, with suggested quick-reasons to remove the blank-page problem.
*Should feel like:* Rejection reason field is required, pre-loaded with common options ("Hours don't match schedule," "Missing receipt," "Wrong project allocation") so a reason takes one click, not three sentences.

**[HIGH] | timesheets.html | "Copy Last Week" requires two clicks | Most common recurring action is buried in a dropdown**
The most-used weekly timesheet action after week one is "copy last week." It lives inside a dropdown behind a "Copy" button with a chevron — two clicks. For the single most repeated action in the app, one click is the ceiling.
*Should feel like:* A visible "Copy from Last Week" primary button. The dropdown hides less-common options.

**[HIGH] | auth.html | Onboarding step 3 — photo upload | No obvious skip with strong visual priority**
The onboarding wizard requests a profile photo in step 3. This is high friction at the worst moment (the user just signed up and wants to see the app). A "Skip for now" link exists but competes visually with the upload controls. The skip should be the primary option, with upload as secondary.
*Should feel like:* "Set photo later" is the large, obvious option. Upload is available but not blocking.

**[MEDIUM] | account.html | Notification toggles | Require a separate Save action**
The notification preferences page has toggle switches, but changes are not saved until the user scrolls to a Save button. Toggle = instant save is the 2026 standard. A Save button on toggle preferences creates anxiety ("did it save?") and extra steps.
*Should feel like:* Toggle flips → saved instantly → a subtle "Saved" label appears next to the toggle for 2 seconds.

**[MEDIUM] | admin.html | Company Settings | One Save button covers all sections — changes lost on navigation**
The entire Company Settings tab has a single Save button at the bottom. If a user edits fields at the top and navigates away before scrolling to Save, all changes are lost silently. Each section needs either its own save or a sticky "Unsaved changes" bar that appears when changes are detected.
*Should feel like:* A sticky "You have unsaved changes — Save now" bar appears when any field changes. Navigating away prompts confirmation.

---

### CALM — Does anything create anxiety or confusion?

**[CRITICAL] | approvals.html | Reject button is an unlabeled X icon | Destructive action with no label**
The Reject button on every approval row is an `<X>` icon with `btn-ghost text-error` — no text label, no confirmation. On a screen where approving or rejecting affects paychecks and time off for real people, a ghosted icon is not acceptable. "Approve" has a label. Reject must too. And rejecting must require confirmation.
*Should feel like:* "Reject" label next to the X icon. Clicking opens a confirmation modal with a required reason field.

**[CRITICAL] | admin.html | Deactivate user button | No confirmation before irreversible action**
The Users tab has a "Deactivate" button inline on every user row. Clicking it fires `deactivateUser(this)` with no visible confirmation modal in the prototype. Deactivating a user cuts their access immediately. This is an irreversible real-world action that must have a hard stop.
*Should feel like:* Click Deactivate → modal: "Deactivate John Smith? They will immediately lose access and their pending approvals will be reassigned." User types name or clicks Confirm.

**[HIGH] | timesheets.html | Submitted timesheet grid | Opacity 0.6 with pointer-events disabled = ambiguous limbo state**
After submission, the timesheet grid renders at 60% opacity with interactions disabled. The user sees their data but cannot touch it. This is neither "done" nor "editable" — it is visual purgatory. The submitted state should cleanly replace the grid with the completion card, or clearly label every row as "Locked — Awaiting Approval."
*Should feel like:* Submit → grid is fully replaced by the completion card. No grayed-out ghost of the form.

**[HIGH] | leaves.html | Leave conflict warning | "1 conflict" visible but conflict detail requires a full detail view**
In the approval queue, Marco Rossi's leave shows "1 conflict" inline. The manager can see a conflict exists but not who or what it is — they must navigate to the detail view to learn more. For a time-sensitive approval decision, the conflict name should be visible inline.
*Should feel like:* Hovering or expanding the conflict tag shows: "Alice Wang is also on leave Apr 14–18."

**[HIGH] | invoices.html | Overdue invoices in list | No "Send Reminder" action on overdue rows**
Two invoices are Overdue in the list. The action buttons on overdue rows are only "View" and "More." The most urgent and obvious next action — sending a payment reminder — requires clicking into the detail view first. For overdue invoices specifically, "Send Reminder" must surface in the list row.
*Should feel like:* Overdue invoice row shows: View · Send Reminder · More. The highest-urgency action is one click from the list.

**[HIGH] | timesheets.html | Rejection callout | Shows a reason but does not guide the user to the problematic cell**
The rejection callout ("Hours for Friday don't match project schedule") correctly shows a rejection reason. But the timesheet grid shows all cells identically — there is no visual link between the rejection reason and the cell that needs fixing. The user must guess.
*Should feel like:* Rejection callout highlights the specific cell in red and says "Expected 8h, You logged 10h on Friday — Acme Corp." The fix is obvious.

**[HIGH] | calendar.html | Day cell click | No visible action or feedback**
Calendar day cells are `cursor: pointer` with a hover effect, clearly communicating "I am clickable." But in the prototype, clicking a day produces no result. Even in a prototype context, this creates confusion about whether the interaction is missing or broken.
*Should feel like:* Clicking a day opens a minimal quick-view panel: who's out, any events, an "Add leave" shortcut.

**[MEDIUM] | insights.html | NL query submission | No loading state between submit and AI response**
The natural language query bar has a submit button. If the AI response is not instant, there is a moment of silence with no loading indicator — the user doesn't know if their query registered. Even a 300ms spinner should exist between submit and response.
*Should feel like:* Submit → loading spinner or skeleton for the response area → AI response slides in.

**[MEDIUM] | expenses.html | Rejected expense resubmit | Opens a blank form, not the original data**
The "Resubmit" button on a rejected expense navigates to the Submit Expense tab. If the form is blank, the user must re-enter all original data from memory — the amount, the date, the project, the description — while referencing the rejection reason. This is maximum friction at minimum motivation.
*Should feel like:* Resubmit pre-fills the form with original expense data. The rejection reason appears at the top of the form. The user only edits what's wrong.

---

### COMPLETENESS — Does the app feel like it's working for you?

**[HIGH] | approvals.html | Empty queue after all items approved | No "all clear" state**
After a manager approves or rejects all items in the queue (individually or via bulk actions), the list becomes empty, but there is no designed "all done" state — no message, no satisfaction, no context about when more items will arrive. The most important manager moment in the app ends in a void.
*Should feel like:* Last item approved → the queue area shows: "You're all caught up. 12 items processed today. Next review expected Monday morning."

**[HIGH] | projects.html | Kanban board | "Completed" column shows nothing for a company with no completed projects**
The kanban board "Completed" column renders as an empty box with a header. For any new or early-stage company, this column will be empty with no guidance. Empty kanban columns must have empty states.
*Should feel like:* Empty "Completed" column shows: "Projects you complete will appear here. Keep going."

**[HIGH] | hr.html | Recruitment kanban | Empty stage columns have min-height but no message**
Each kanban stage column has `min-height: 200px`, creating visible empty boxes with no content. Empty columns without guidance feel broken, not intentional.
*Should feel like:* Each empty stage shows a quiet message: "No candidates in Screening yet — drag from Applied or add a new applicant."

**[HIGH] | timesheets.html | Previous Weeks tab | No empty state for new users who have never submitted**
A new employee opening the "Previous Weeks" tab sees an empty table with no explanation. There is no designed empty state for first-time users.
*Should feel like:* "Your submitted timesheets will appear here. Complete your first week to start your history."

**[HIGH] | employees.html | Org chart tab | No empty state when no reporting relationships are configured**
The org chart renders a built hierarchy. If a new company hasn't set up manager/report relationships, the chart will be blank or broken. There is no empty state guiding the admin to set it up.
*Should feel like:* "No org structure defined yet. Go to Admin → Users to assign reporting lines."

**[MEDIUM] | index.html (dashboard) | AI Alerts section | Disappears entirely when no alerts exist**
When the AI monitoring system has no alerts to show, the section is simply not rendered. A well-run company might never see the AI alerts feature. The absence of the section gives no signal that the system is monitoring anything.
*Should feel like:* When no alerts: a quiet "All clear — AI detected no anomalies this week" message confirms the system is active.

**[MEDIUM] | leaves.html | Team Leaves tab | No empty state when no pending team leaves exist**
The Team Leaves tab shows a requests list. When there are no pending requests, the tab renders an empty table with no message. This is especially jarring if a manager checks the tab expecting to see something.
*Should feel like:* "No pending leave requests from your team. Your team is fully available this week."

---

### ANTICIPATION — Does completing something feel satisfying?

**[CRITICAL] | timesheets.html | Timesheet submission | Two competing post-submit elements, unclear which fires**
The prototype defines both a `tsCompletionCard` ("All done for the week!") and a `tsSubmittedBanner` ("Submitted for Review"). Both are `display:none` by default. The prototype JS presumably shows one of them — but if both show simultaneously, or if neither fires due to a state conflict, the user submits their timesheet and sees nothing change. The submission moment must be singular, definitive, and warm.
*Should feel like:* Submit → single, beautiful completion card replaces the form. "All done for the week, Sarah. 34h logged across 2 projects. John Smith will review by Monday."

**[HIGH] | expenses.html | Expense submitted | Toast notification is the only feedback**
After submitting an expense, the user gets a toast that vanishes in 3 seconds. For a financial action that may take days to be approved, the only persistent confirmation is gone in moments. The expense must immediately appear in the "My Expenses" list with a "Pending" status so the user can see their submission is in the system.
*Should feel like:* Submit → land on My Expenses → new expense appears at the top with a "Pending" badge. The list is the receipt.

**[HIGH] | leaves.html | Cancel approved leave | No confirmation before cancellation**
The "Cancel" button on leave request cards has no confirmation modal. Cancelling an approved leave that has been communicated to the team is a real-world impact (the manager must be notified, team availability changes). This needs a confirmation step.
*Should feel like:* Cancel → modal: "Cancel your Annual Leave (Apr 14–18)? Your manager will be notified." → User confirms.

**[HIGH] | invoices.html | "Record Payment" | Marks invoice paid immediately with no confirmation of amount/date**
The "Record Payment" button presumably marks the invoice paid on click. There is no modal confirming which amount was received, on what date, or asking for a payment reference. Financial records must be deliberate.
*Should feel like:* Click "Record Payment" → modal: "Record payment of €12,400 received on [today]? Payment reference: _____" → Confirm → invoice moves to Paid.

**[HIGH] | approvals.html | Approve an item | Queue count and KPI cards do not update after each approval**
When a manager approves an item, it fades out — but the tab count badge ("All 12") and the KPI cards at the top (Total Pending: 12) remain unchanged. The progress of working through the queue is invisible. Every approval should be felt.
*Should feel like:* Item approved → badge count decrements (12 → 11 → 10) → KPI cards update in real time. Progress is visible and satisfying.

**[MEDIUM] | auth.html | Onboarding completion | First CTA is "Download the mobile app" not "Go to dashboard"**
After completing the setup wizard, the success screen features app store download badges prominently. The user just set up their company and has not yet seen the dashboard. Asking them to download a mobile app before they've experienced the desktop product is the wrong priority.
*Should feel like:* Completion screen: primary CTA "Go to your dashboard →". App download is a secondary mention or deferred to an onboarding email.

**[MEDIUM] | hr.html | Candidate stage change | No toast or visual confirmation of stage move**
Moving a candidate through the recruitment kanban stages (if draggable or via a stage button) produces no visible feedback that the action succeeded — no toast, no animation completing.
*Should feel like:* Stage change → brief toast "Emma Laurent moved to Interview." Card settles in new column with a momentary success highlight.

**[MEDIUM] | planning.html | AI "Assign" recommendation | List does not update after assigning a bench employee**
The AI recommendation cards in the bench forecast have "Assign" buttons. After clicking, a toast fires but the bench list still shows the same employee. The list must update to reflect that the assignment was acted upon.
*Should feel like:* Assign → employee is removed from the bench list immediately → toast: "Bob Taylor assigned to Globex Phase 2."

---

## --- SECTION 2: OPEN QUESTIONS ---

These issues require a product decision before they can be resolved in design.

**1. timesheets.html — Auto-submit vs. always-manual submit**
Should the app auto-submit a timesheet when the weekly hour target is exactly met and all days are filled? Or is "Submit" always a conscious user action? Auto-submit could deliver a delightful "You're done" moment, but could also catch users who still need to adjust entries. The entire submission UX (button visibility, completion state) depends on this.

**2. approvals.html — What criteria define "routine" timesheets for the AI bulk-approve banner?**
The AI banner offers to "bulk-approve 4 routine timesheets matching last week's pattern." The criteria for "routine" are invisible to the manager. Without understanding the logic (same hours, same projects, within ±10% variance?), managers may distrust the recommendation. The banner needs to either explain the criteria inline or link to a settings page where the threshold is configurable.

**3. leaves.html — Should sick leave require manager approval, or be self-declared with notification only?**
Currently all leave types go through the same approval queue. In many jurisdictions and HR cultures, sick leave is self-declared — the employee marks themselves sick and the manager is informed, not asked. If sick leave was auto-approved with notification only, it would remove a meaningless approval step and feel far more respectful of the employee. This is a product/HR policy decision that changes the entire leaves flow.

**4. timesheets.html + invoices.html — Should approved timesheets auto-stage invoice drafts at period close?**
The current flow: approve timesheets → manually generate invoice. But if approved timesheets for a billing period could automatically create an invoice draft (editable before sending), the most tedious step in the billable cycle disappears. This requires a product decision about automation boundaries and whether PMs want to always review before drafting.

**5. expenses.html — Who classifies billable vs. non-billable — the employee or the approver?**
The expense form asks employees to check "Billable expense." But employees may not know their contract billing terms well enough to classify correctly. If approvers routinely override this field, the employee classification is noise. Consider: should the billable flag be set by the approver only, with employees simply describing the expense? Or is employee classification accurate and important enough to keep?

**6. admin.html — What cascades when a user is deactivated mid-cycle?**
If a user is deactivated while they have pending timesheet submissions or are currently an approver for others' requests, what happens? Do pending submissions get auto-rejected? Do approvals get reassigned to their manager? This system behavior must be designed before the deactivation confirmation modal can be written accurately — the modal must tell the admin exactly what will happen.

**7. hr.html — Should onboarding checklists be auto-generated from role/department templates?**
Currently, onboarding cards appear to be manually created per new hire. If the app could generate a default checklist from the assigned role (e.g., "Senior Developer" → standard list including GitHub access, Slack invite, equipment order), the HR admin would only need to confirm, not create from scratch. This would change the feature from a task tracker to a genuine onboarding accelerator. Is role-based auto-generation in scope?
