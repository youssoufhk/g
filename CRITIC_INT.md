# GammaHR v2 -- Interactive QA Critic Report
**Auditor:** Harsh QA Engineer  
**Date:** 2026-04-10  
**Scope:** Every interactive element across 19 HTML files + _shared.js  

---

## USER-REPORTED ISSUES -- VERIFICATION

| Issue | Status | Notes |
|---|---|---|
| Admin stat cards must be clickable | PASS | All 4 cards (Total Users, Departments, Pending Invites, System Health) have working onclick handlers that navigate to tabs or show toasts (admin.html lines 207-226) |
| "Colleague is viewing" notification must be gone | PASS | No trace of "is viewing" string found in any file |
| Capacity vs Allocation chart removed from planning.html | PASS | Only a comment remains: "Capacity chart removed -- replaced with compact summary" (line 1363) |
| Project detail must show real data for ALL projects | PASS | projectData object contains full data for acme-web, initech-api, globex-phase2, globex-crm, initech-audit, umbrella-onboard, internal-infra (7 projects). Generic renderer functions populate team, timesheets, expenses, milestones, activity tabs dynamically. |

---

## FINDINGS

### CRITICAL -- Dead Buttons (no handler, no feedback)

[CRITICAL] admin.html | "Deactivate" buttons on each user row (lines 425, 435, 445, 455, 465, 475, 485, 495, 505) | 9 buttons have NO onclick handler. `<button class="btn btn-destructive-ghost btn-xs">Deactivate</button>` -- clicking does absolutely nothing. The deactivate button inside the Edit User modal (line 1194) works, but the per-row ones are completely dead.

[CRITICAL] clients.html | "Edit" button in client detail header (line 681) | `<button class="btn btn-secondary btn-sm"><svg data-lucide="pencil">` -- no onclick, no id, no JS listener. Dead button in the most prominent position of the client detail view.

[CRITICAL] clients.html | Triple-dot "More" button in client detail header (line 682) | `<button class="btn btn-secondary btn-sm"><svg data-lucide="more-horizontal">` -- same problem, no handler at all. Should open a context menu (archive client, deactivate, export, etc.).

[CRITICAL] expenses.html | "Edit" and "Cancel" buttons on dynamically-created expense items (lines 1804-1805) | When a new expense is submitted, the JS generates inline HTML with `<button class="btn btn-ghost btn-xs">Edit</button>` and `<button class="btn btn-destructive-ghost btn-xs">Cancel</button>` -- neither has an onclick handler or event delegation. Dead on arrival.

[CRITICAL] expenses.html | Upload zone click handler is empty (line 1723-1725) | `uploadZone.addEventListener('click', () => { // Simulate file picker });` -- the handler body is a comment. Clicking the receipt upload zone in the "Submit Expense" tab does nothing. The drag-and-drop path and the AI scan button work, but the primary click-to-browse path is broken.

### HIGH -- Non-functional Filters

[HIGH] expenses.html | "All Status", "All Types", "All Projects" filter selects in My Expenses tab (lines 678-699) | Three `<select class="form-select">` elements with no id, no onchange, and no JS reference. They render as dropdowns you can change, but nothing filters. The Team Expenses tab filters work (they have ids and onchange handlers), but My Expenses filters are completely decorative.

[HIGH] clients.html | "All Statuses" and "All Industries" filter selects (lines 440, 446) | `filterStatus` and `filterIndustry` have ids but ZERO JavaScript references anywhere in the script. No addEventListener, no onchange. Changing them does nothing. Client list never filters.

[HIGH] timesheets.html | Approval queue "Status" and "Department" filters (filterApprovalQueue function, lines 1931-1943) | The filter function exists but the comment says `// For demo: always show all (real impl would check data attrs)` -- all cards are always shown regardless of filter selection. The function runs but produces no visible change, which is worse than not running at all because the user thinks they are filtering.

### MEDIUM -- Missing Functionality

[MEDIUM] index.html | Dashboard "More" nav button (#moreNavBtn) | The "More" bottom nav item has `href="#"` but its click handler only toggles the sidebar. On the dashboard page, the sidebar toggle works, but there is no `onclick="return false"` in the HTML so on some browsers the page may scroll to top due to the `href="#"`.

[MEDIUM] projects.html | closeModal() global scope conflict | `window.closeModal` is redefined on line 2938 as `function() { newProjectModal.classList.remove('active'); }`. This overwrites the generic `closeModal(id)` pattern used elsewhere. If any other modal on the page tried to use `closeModal('someId')` it would break because the redefined version takes no arguments.

[MEDIUM] projects.html | Kanban status change buttons | The `showUndoToast` function (line 2907) generates an Undo button inside a toast, but `undoStatusChange` (line 2910) only shows another toast saying "reverted" -- it does not actually revert any visual change. The card is not moved back.

[MEDIUM] admin.html | "Add Department" modal submit | The `addDeptModal` is opened by `addDeptBtn` (line 1582) but there is no "Create" or "Submit" button handler inside the modal. The modal opens but has no way to submit/save a new department.

[MEDIUM] admin.html | "Add Leave Type" modal submit | Same issue -- `addLeaveTypeModal` opens (line 1587) but no submit handler exists for the modal content.

[MEDIUM] admin.html | "Add Expense Type" modal submit | Same issue -- `addExpenseTypeModal` opens (line 1592) but no submit handler.

[MEDIUM] admin.html | "Add Holiday" modal submit | Same issue -- `addHolidayModal` opens (line 1597) but no submit handler.

[MEDIUM] hr.html | "New Job Posting" button (line 1712-1714) | The handler just shows a toast saying "The job posting form would open here in the full application." This is a stub that should at least open a modal form in a prototype. Compare to every other "new" button in the app which opens a real modal.

[MEDIUM] insights.html | No search/filter for any table on the Insights page | Unlike every other list page which has a filter bar with working search, Insights has no search functionality for its data tables.

### LOW -- Minor Issues

[LOW] portal/auth.html | Password field has value="password123" pre-filled | Minor security concern for prototype sharing -- anyone opening the portal sees a pre-filled password. Not a functional bug but could confuse demo viewers.

[LOW] index.html | Sortable table headers toggle class but do not actually sort rows | The handler on line 1826-1838 adds/removes `.sorted .asc .desc` CSS classes and shows a toast, but the table rows never reorder. Every sortable header on the dashboard is cosmetic-only.

[LOW] planning.html | "Compare Scenarios" button | Shows toast "Side-by-side comparison view is coming in the full product" -- this is an explicit "coming soon" stub, not a bug, but it is a clickable button that does nothing useful.

[LOW] all pages | Duplicate `aria-label` on bottom nav | Every page has `<nav class="bottom-nav" aria-label="Bottom navigation" aria-label="Mobile navigation">` with the attribute declared twice. Only the last value is used by screen readers.

[LOW] all pages | Lucide CDN dependency (unpkg.com) | All pages load `https://unpkg.com/lucide@latest/dist/umd/lucide.js`. If unpkg goes down or rate-limits, every icon in the prototype breaks. Not a functionality bug per se, but a single point of failure.

---

## SUMMARY

| Severity | Count |
|---|---|
| CRITICAL | 5 |
| HIGH | 3 |
| MEDIUM | 7 |
| LOW | 5 |
| **Total** | **20** |

### Top 3 Priorities
1. **Admin Deactivate buttons** -- 9 dead buttons on the most sensitive page in the app
2. **Expenses filter bar** -- 3 filter selects that do nothing on the primary expenses tab
3. **Client detail Edit/More buttons** -- Dead buttons in the hero section of client detail view
