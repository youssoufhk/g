# CRITIC_INT — Interaction & JS Handler Audit
**Auditor:** Harsh QA — every interactive element checked
**Date:** 2026-04-11
**Files checked:** All 17 prototype/*.html + prototype/portal/index.html

---

## CRITICAL

---

**INT-001** | CRITICAL | `prototype/gantt.html`
**"Keyboard Shortcuts" button references non-existent element**
Line 937: `onclick="document.getElementById('shortcutsPanel')?.classList.toggle('open')"` — the element `#shortcutsPanel` does not exist anywhere in gantt.html. Clicking this button silently does nothing. No panel appears. No error visible to user, but the entire button is dead.

---

**INT-002** | CRITICAL | `prototype/timesheets.html`
**Empty state "Start Logging Time" button has no handler**
Line 1613–1616: `<button class="btn btn-primary btn-md">Start Logging Time</button>` — no `onclick`, no `id`, no event listener attached anywhere in the script. This is the primary CTA on the empty state. Clicking it does absolutely nothing. The user is completely stuck.

---

**INT-003** | CRITICAL | `prototype/employees.html`
**"Send Invite" button in Invite Employee modal has no handler**
Line 2528: `<button class="btn btn-primary btn-md">Send Invite</button>` — no `id`, no `onclick`, no `addEventListener` targeting it. The modal open/close works, but the primary action (sending the invite) is a completely dead button. Admin clicks it, nothing happens.

---

**INT-004** | CRITICAL | `prototype/auth.html`
**"Use a recovery code" link has no handler**
Line 455: `<a href="#">Use a recovery code</a>` — bare `href="#"` with no `onclick`, no `addEventListener`. Clicking it scrolls to page top. No recovery code input view is shown. This is a security-critical flow: users locked out of MFA with no recovery path.

---

**INT-005** | CRITICAL | `prototype/admin.html`
**Approval workflow "Edit" pencil buttons have no handlers**
Lines 373–376: Four `<button class="btn btn-ghost btn-xs"><svg data-lucide="pencil">` buttons in the Approval Workflow table (for Timesheets, Expenses, Leave Requests, Invoices) have no `onclick`, no `id`, and no `addEventListener` attached anywhere in the script. Admin cannot edit any approval workflow rules.

---

## HIGH

---

**INT-006** | HIGH | `prototype/clients.html`
**AI insight "Helpful" and "Share" buttons have no handlers**
Lines 742–743: `<button class="btn btn-ghost btn-xs"><svg data-lucide="thumbs-up"> Helpful</button>` and `<button class="btn btn-ghost btn-xs"><svg data-lucide="share-2"> Share</button>` — no `onclick`, no `id`, no event listeners. Both are completely dead. The invoices.html version of the "Helpful" button (line 755) has the same problem.

---

**INT-007** | HIGH | `prototype/projects.html`
**Timeline view zoom buttons (6M / 1Y / 2Y) have no handlers**
Lines 958–960: Three zoom range buttons in the Timeline view have no `onclick`, no `id`, and no `addEventListener`. Clicking 6M or 2Y does nothing — the timeline does not change range. Only a cosmetic active state is baked into the 1Y button's inline style, but clicking any button does nothing.

---

**INT-008** | HIGH | `prototype/expenses.html`
**"Camera" and "Browse" upload buttons have no handlers**
Lines 876–883: `<button class="btn btn-secondary btn-sm">Camera</button>` and `<button class="btn btn-secondary btn-sm">Browse</button>` inside the upload zone have no `onclick`, no `id`, no `addEventListener`. The surrounding `uploadZone` div has a click handler, but these explicit labeled buttons inside it do not trigger the file input or camera API — both are dead.

---

**INT-009** | HIGH | `prototype/portal/index.html`
**Footer "GammaHR", "Privacy Policy", and "Terms" links are bare `href="#"`**
Line 1375: Three `<a href="#">` links in the portal footer — "GammaHR", "Privacy Policy", "Terms" — have no handlers. These are presented to external clients in a professional client portal. Clicking them scrolls to page top.

---

**INT-010** | HIGH | `prototype/invoices.html`
**AI insight "Helpful" button has no handler**
Line 755: `<button class="btn btn-ghost btn-xs"><svg data-lucide="thumbs-up"> Helpful</button>` — no `onclick`, no `id`, no event listener. Dead button inside the invoice detail AI insight card.

---

**INT-011** | HIGH | `prototype/employees.html`
**"Reports to: Marie Dupont" link navigates to wrong profile**
Line 1674: `<a href="#" data-employee="marie-dupont" style="margin-left:4px">Marie Dupont</a>` — the `[data-employee]` click handler at line 2750 always navigates to `#profile/timeline` (which loads the Sarah Chen profile, whichever is shown), NOT to Marie Dupont. The "Reports to" link does not navigate to Marie Dupont's profile. It navigates to Sarah Chen's profile regardless.

---

**INT-012** | HIGH | `prototype/admin.html`
**Audit Log pagination next (»), page 2, 3, ..., 243 buttons have no handlers**
Lines 1106–1110: `<button>2</button>`, `<button>3</button>`, `<button>...</button>`, `<button>243</button>`, `<button>»</button>` — the next/forward button is NOT disabled and has no handler. The existing `querySelectorAll('#tab-audit .pagination-buttons button:not([disabled]):not(.active)')` listener at line 1749 should catch these, but the `»` button renders as `&raquo;` text content so the selector does match it — however clicking it calls `showToast` only. Pages 2–243 show a toast but do not load any new data or scroll the table. Non-functional pagination for a 243-page audit log.

---

**INT-013** | HIGH | `prototype/planning.html`
**Scenario dropdown "New Scenario" item does nothing**
Line 408: `<button class="dropdown-item"><svg data-lucide="plus"> New Scenario</button>` — This item has no `data-scenario` attribute. The querySelectorAll handler at line 1368 iterates items and calls `loadScenario(item.dataset.scenario)` — `undefined` is passed. No modal opens, no new scenario is created. Clicking "New Scenario" is a dead action.

---

**INT-014** | HIGH | `prototype/auth.html`
**"Terms of Service" and "Privacy Policy" links in employee onboarding are bare `href="#"`**
Line 1119: Both links inside the "I agree to..." checkbox label are `href="#"` with no handlers. In a legal consent context, users should be able to read these documents before agreeing. Clicking either scrolls to page top.

---

**INT-015** | HIGH | `prototype/hr.html`
**"Start Offboarding" button shows only a toast, does not open any modal or flow**
Line 1162: `onclick="showToast('info','Start Offboarding','Offboarding wizard will open here.')"` — The offboarding tab is a core HR feature. Clicking this primary action button produces a toast saying "will open here" — no modal, no wizard, no form. This is a dead stub masquerading as a live feature.

---

**INT-016** | HIGH | `prototype/insights.html`
**Period buttons (7D, 3M, 6M, 1Y) toggle active CSS but do not update any chart data**
Lines 529–533: The `.period-btn` handler at line 2207 sets the active class only — no chart re-render, no data swap. Clicking "7D" or "1Y" changes only button highlight; all charts remain showing the same static data regardless of period selected.

---

**INT-017** | HIGH | `prototype/clients.html`
**Documents tab download buttons have no handlers**
Lines 1358, 1366, 1374: Three `<button class="btn btn-ghost btn-xs"><svg data-lucide="download">` buttons in the Documents tab have no `onclick` and no event listeners. Clicking download on any client document does nothing.

---

**INT-018** | HIGH | `prototype/expenses.html`
**Team Expenses "View" (eye icon) buttons show generic toast, not a real expense detail**
Lines 1086, 1107, 1151, 1195: `onclick="showToast('info','View','Viewing expense')"` — all eye buttons show the same generic toast message. No detail panel opens, no receipt is displayed, no data specific to that expense row is shown.

---

## MEDIUM

---

**INT-019** | MEDIUM | `prototype/account.html`
**"Delete Account" button is permanently disabled and onclick never fires**
Line 1392: `<button ... id="deleteAccountBtn" disabled onclick="confirmDeleteAccount()">` — A `disabled` button's onclick does NOT fire. The handler at line 1830 checks for a `#deleteConfirmCheck` checkbox before enabling the button, but no such checkbox exists in the HTML. The delete account flow is permanently broken — the button can never be enabled.

---

**INT-020** | MEDIUM | `prototype/hr.html`
**Records tab "Filter" button permanently shows "coming soon" toast**
Line 1378: `onclick="showToast('info','Filter','Filter by event type, date range, or department — coming soon.')"` — No filter UI exists. The HR lifecycle records table cannot be filtered or searched at all.

---

**INT-021** | MEDIUM | `prototype/hr.html`
**Onboarding tab "Start New Onboarding" button shows only a generic toast, no wizard opens**
Line 999: `onclick="showToast('info','Start Onboarding','Onboarding wizard would open here — select a new hire to begin.')"` — No onboarding wizard modal exists. Stub masquerading as a live feature, same pattern as INT-015.

---

**INT-022** | MEDIUM | `prototype/insights.html`
**Scheduled Reports "Edit" buttons open a blank create-modal, not a pre-populated edit form**
Lines 1833, 1845: `onclick="openScheduleModal()"` — The edit buttons open the schedule modal in create mode with a blank form. No existing report data is loaded. User clicking "Edit" on "Weekly Work Time Summary" sees an empty form.

---

**INT-023** | MEDIUM | `prototype/projects.html`
**"Undo" link inside status-change toast does not actually revert the status**
Lines 2916–2918: `window.undoStatusChange = function() { showToast(...'Status change undone'...) }` — The function only shows a confirmation toast. The status badge in the project card is not restored to its previous value. Undo is a lie.

---

**INT-024** | MEDIUM | `prototype/timesheets.html`
**Approval Queue tab has no "View Details" button per row — PM cannot inspect a timesheet before approving**
The Approval Queue tab (visible to PMs) has approve/reject buttons for each of 7 timesheet rows but no detail/eye button. A PM approving timesheets blind, with no way to see the full timesheet grid, is a critical workflow gap. Compare with `approvals.html` which has a full detail modal.

---

**INT-025** | MEDIUM | `prototype/portal/index.html`
**Messages tab "Attach file" button shows permanent "coming soon" toast**
Line 1282: `onclick="showToast('info', 'Attach File', 'File attachment coming soon')"` — No file picker is created or triggered. External clients cannot attach files to portal messages.

---

**INT-026** | MEDIUM | `prototype/employees.html`
**Org Chart view employee nodes have no click handlers to navigate to profiles**
The org chart renders nodes but the resulting node elements have no click handlers attached. Users can see the org chart but cannot click any node to open an employee profile — the primary expected interaction.

---

**INT-027** | MEDIUM | `prototype/insights.html`
**"Compare to Prior Period" buttons toggle a toast but do not overlay prior-period data on charts**
Multiple instances (lines 844, 992, 1130, 1233, 1341, 1545, 1686): `onclick="GHR.showToast('success','Compare Mode Active','Overlay loaded...')"` — A success toast fires saying the overlay is loaded, but no visual change occurs on the chart. Charts do not show prior-period data overlaid in grey. The button lies about activating a feature.

---

**INT-028** | MEDIUM | `prototype/clients.html`
**Client detail tab "Team" tab has no actions — team member rows have no click-through to employee profiles**
Lines 1053+: The Team tab in client detail shows 8 team members but none of the member rows have click handlers or links to employee profiles. The member avatars and names are plain text, not interactive.

---

**INT-029** | MEDIUM | `prototype/planning.html`
**What-If Scenario "Save Scenario" and "Reset" buttons are wired but show a toast only — no actual save/reset occurs**
Lines 1273–1275: `runBtn`, `saveBtn`, `resetBtn` — The save button shows a toast "Scenario saved". The reset button shows a toast. Neither modifies any persistent data or resets the sliders/inputs to baseline values. Reset in particular does not restore any changed allocation percentages.

---

**INT-030** | MEDIUM | `prototype/invoices.html`
**Invoice detail "Issue Credit Note" button calls `issueCreditNote()` but the function only shows a confirm toast — no credit note is generated, no new invoice entry is added**
Line 781: `onclick="issueCreditNote()"` — The function shows a toast "Credit note issued for INV-2026-041". No new credit note line item appears in the invoice list. No new document is created. The invoice status does not change. The action is cosmetic only.

---

*Total issues: 30 (5 CRITICAL, 13 HIGH, 12 MEDIUM)*
