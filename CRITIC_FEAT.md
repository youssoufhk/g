# GammaHR v2 — Feature Completeness Audit
**Date:** 2026-04-11
**Auditor:** Product Manager Critic (Harsh Mode)
**Scope:** Every section of `specs/APP_BLUEPRINT.md` vs every HTML file in `prototype/`
**Prior issues retained, new issues appended. Re-audited from scratch.**

---

## Severity Key
- **CRITICAL** = Spec feature completely absent or broken beyond use
- **HIGH** = Core feature exists but is non-functional or severely incomplete
- **MEDIUM** = Feature present but deviates meaningfully from spec

---

## CRITICAL Issues

---

### CRIT-01 — gantt.html | Filter dropdowns are dead (§5.2)
**Spec:** "Filter Dimensions: Department, Client, Project, Billing Status, Employee Status, Skills, Utilization Range, Role, Availability" — all must filter the gantt chart.
**Reality:** The filter dropdowns (Dept, Client, Project, Billing, Status, Work Time) are static `<select>` elements with ZERO change event listeners. Changing any dropdown does nothing to the chart rows. The only JS wired to quick-filter chips is `chip.classList.toggle('active')` — purely visual. The gantt never redraws or hides rows based on any filter input. All filters are cosmetic only.

---

### CRIT-02 — gantt.html | Zoom buttons are cosmetic only (§5.1)
**Spec:** "ZOOM: [1W] [2W] [1M] [3M] [6M] [1Y]" must change the time scale of the chart.
**Reality:** Zoom buttons toggle the `.active` CSS class only. The gantt timeline grid (month header, day columns, bar positions) does not change. Clicking "1W" looks identical to "1M" because the chart is a static HTML layout.

---

### CRIT-03 — hr.html | Candidate detail panel is a toast (§21.2)
**Spec:** Clicking a candidate card should open a full candidate profile (with CV, interview notes, history, AI score, stage movement).
**Reality:** `card.addEventListener('click', ...)` fires `showToast('info', 'Candidate Profile', 'Opening [name]\'s full profile...')`. There is no candidate detail modal, slide panel, or profile page. No way to view or act on a candidate beyond seeing their Kanban card.

---

### CRIT-04 — hr.html | "Start Onboarding" and "Start Offboarding" buttons fire toasts only (§21.3, §21.4)
**Spec:** Both buttons should open wizards with multi-step flows (select new hire → assign buddy → schedule orientation, etc.).
**Reality:** "Start Onboarding" fires `showToast('info','Start Onboarding','Onboarding wizard would open here...')`. "Start Offboarding" fires `showToast('info','Start Offboarding','Offboarding wizard will open here.')`. No wizards, no modals, no multi-step flows exist.

---

### CRIT-05 — hr.html | Recruitment Kanban column counts mismatch actual cards rendered (§21.2)
**Spec:** Pipeline has 47 active candidates: Applied (15), Screening (8), Interview (12), Offer (4), Hired (8).
**Reality:** Column headers show (15), (8), (12), (4), (8) but only 3, 2, 3, 2, 2 candidate cards are actually rendered = 12 visible cards. The remaining 35 candidates are missing. The tab count badge ("47") and KPI card ("Active Candidates: 47") both contradict the visible data.

---

### CRIT-06 — portal/index.html | File attachment in Messages is a toast (§10.3)
**Spec:** Messages tab must support "Attach files" and "@mention team members".
**Reality:** The attach button fires `showToast('info', 'Attach File', 'File attachment coming soon')`. There is no file input, no drag-drop, no attached-file preview. The @mention tip text exists in the placeholder but typing `@` produces no autocomplete or mention list.

---

### CRIT-07 — insights.html | Analytics tabs missing export per chart (§15.1)
**Spec:** "Each analytics view: ...export to PDF/CSV".
**Reality:** The only export button in the entire page is `id="aiExportBtn"` which exports the AI query response. The Work Time, Revenue, Expenses, Leave Patterns, Team Performance, and Client Health analytics tabs have no per-tab export button. There is no way to export any analytics chart data.

---

### CRIT-08 — insights.html | No date range picker on any analytics tab (§15.1)
**Spec:** "Each analytics view: ...date range selection".
**Reality:** The period filter buttons (7D / 30D / 3M / 6M / 1Y) at the top of the page exist but they only update the AI smart alerts section. The analytics tab charts (Work Time bar chart, Revenue bar chart, etc.) are static SVG elements that do not respond to period filter changes. No custom date range input exists anywhere.

---

### CRIT-09 — _shared.js | "Ask AI" nav item missing from sidebar (§0.6, §20.1)
**Spec:** "AI" sidebar section should contain "AI Insights" AND "Ask AI".
**FINAL_CHECKLIST claims:** "All pages: 'Ask AI' nav item added to AI section of sidebar."
**Reality:** `_shared.js` `renderSidebar()` at line 1064–1066 generates only `navItem('insights.html', 'lightbulb', 'AI Insights')`. There is no "Ask AI" nav item. No `ask-ai.html` page exists. The claim in FINAL_CHECKLIST is incorrect.

---

### CRIT-10 — timesheets.html | Tab key navigation skips holiday cells incorrectly, ArrowKey navigation absent (§8.2)
**Spec:** "Tab between cells → Navigate left/right/up/down in grid". Arrow key navigation across rows/columns is implied as grid navigation.
**Reality:** Tab key moves to next non-weekend cell but has no handling for holiday cells (`.ts-holiday-cell`). Arrow key navigation (ArrowLeft, ArrowRight, ArrowUp, ArrowDown) has zero implementation — only Enter and Tab are handled. Users cannot keyboard-navigate the timesheet grid without a mouse.

---

## HIGH Issues

---

### HIGH-01 — employees.html | Profile page missing [Edit] and [More ▾] buttons (§4.2)
**Spec:** Profile header: `← Back to Team | Sarah Chen | [Edit] [More ▾]`.
**Reality:** No Edit button, no More dropdown with admin actions (deactivate, change role, generate report, etc.) anywhere in the profile header or the page.

---

### HIGH-02 — employees.html | Timesheets tab drill-down missing (§4.2)
**Spec:** "Click month → expands to show daily breakdown by project."
**Reality:** Monthly summary rows in the Timesheets tab are static `<tr>` elements. Clicking a month row does nothing. No expandable daily breakdown, no accordion, no modal.

---

### HIGH-03 — employees.html | Documents tab missing spec-required seed documents (§4.2)
**Spec:** "Employment Contract.pdf, ID Copy.pdf, AWS Certification.pdf" plus an upload button.
**Reality:** Has documents (Employment_Contract_SChen.pdf, NDA_GammaHR_2023.pdf, Performance_Review_2025.xlsx, ID_Scan_Passport.jpg) — no spec-required "AWS Certification.pdf". Upload button fires a toast instead of a real file input. Documents have no delete/rename actions.

---

### HIGH-04 — invoices.html | Invoice detail missing status history timeline (§11.3)
**Spec:** "Status history timeline" — visual progression Draft → Sent → Paid with timestamps.
**Reality:** A `.status-timeline` CSS class exists and a basic timeline is rendered at line 899, but it shows only the current static status with hardcoded "Awaiting Payment" text. It is not a real timeline with date stamps for each transition. Prior audit noted this; still not fully implemented.

---

### HIGH-05 — invoices.html | Invoice detail missing payment history (§11.3)
**Spec:** "Payment tracking" — log of payments received against the invoice.
**Reality:** The Payment History card at line 923 exists but contains only a single static "No payments recorded" placeholder. No partial payment recording, no payment method, no reference number storage. The "Record Payment" button changes the status badge but writes nothing to a payment log.

---

### HIGH-06 — invoices.html | Generate Invoice modal missing daily rates, fixed fees, milestones (§11.2)
**Spec:** System auto-calculates: hourly timesheet rates, daily rates × days, fixed monthly fees, lump sum milestones.
**Reality:** Generate Invoice modal only shows timesheets × hourly rate and approved expenses. No daily rate billing, no fixed fee line, no milestone-based billing.

---

### HIGH-07 — invoices.html | Invoice filter missing Amount Range (§11.1)
**Spec:** "Filter by: Status, Client, Project, Date Range, Amount Range."
**Reality:** No Amount Range filter (slider or min/max inputs) exists.

---

### HIGH-08 — invoices.html | "Issue Credit Note" button is dead (§11.3)
**Spec:** Invoice detail should support issuing credit notes.
**Reality:** The "Issue Credit Note" button at line 759 has no onclick handler, no modal, no function. Completely dead.

---

### HIGH-09 — leaves.html | WFH leave type missing from balance cards and request form (§6.1)
**Spec:** Leave balance cards: Annual, Sick, Personal, WFH (5 of 5 remaining).
**Reality:** Only 3 balance cards exist (Annual, Sick, Personal). WFH is absent from balance display and from the leave type dropdown in the request modal.

---

### HIGH-10 — calendar.html | Type filter checkboxes (Leaves / Projects / Holidays / Milestones) not functional (§12.1)
**Spec:** "Filter: Dept [All ▾] | Type [All ▾] | Show: ☑Leaves ☑Projects ☑Holidays ☑Milestones."
**Reality:** A `<select id="filterType">` exists at line 679 but has no change event listener. Selecting "Leave" or "Holiday" does not filter the calendar grid. The Show checkboxes mentioned in the spec do not exist at all — only the single select dropdown.

---

### HIGH-11 — calendar.html | Department filter missing (§12.1)
**Spec:** "Filter: Dept [All ▾]" — must filter calendar to show only selected department's leaves and events.
**Reality:** No department filter dropdown exists on the calendar page. The spec explicitly requires it.

---

### HIGH-12 — index.html | Heatmap cells not clickable to show underutilized employees (§3.2)
**Spec:** "Click a cell → shows who was underutilized that day. Tooltip: date, utilization %, breakdown."
**Reality:** Heatmap cells have CSS `.heatmap-cell:hover` tooltips and a `title` attribute showing utilization %. No click handler exists. Clicking a cell does nothing. The spec requires a popup or panel showing which employees were under/over-utilized.

---

### HIGH-13 — index.html | Recent Activity feed has no "Load More" / infinite scroll (§3.2)
**Spec:** "Infinite scroll, loads more on demand."
**Reality:** The Recent Activity section shows a fixed list of 5–6 activity items with no load-more button, no pagination, no infinite scroll trigger.

---

### HIGH-14 — hr.html | Employee Records tab missing Department Transfer and Work Anniversary event types (§21.5)
**Spec:** Event types: Promotion, Contract Renewal, Department Transfer, Probation End, Work Anniversary, Role Change.
**Reality:** The lifecycle events table shows Promotion, Contract Renewal, End of Probation, and partial Role Change. "Department Transfer" and "Work Anniversary" events are completely absent from the seed data and the table. Event badges for these types are missing.

---

### HIGH-15 — approvals.html | Keyboard shortcut `A` = approve, `R` = reject missing (§13.1)
**Spec:** "Keyboard shortcuts: `A` = approve selected, `R` = reject (opens reason modal)."
**Reality:** No `e.key === 'a'` or `e.key === 'A'` or `e.key === 'r'` handlers exist in approvals.html. The keyboard shortcut panel may list these but they are not wired.

---

### HIGH-16 — planning.html | Capacity bar chart is static HTML, not data-driven (§16.1)
**Spec:** "[Stacked bar chart showing allocated vs available]" — should respond to scenario changes.
**Reality:** The Capacity Overview section renders three static `<div>` columns (Apr, May, Jun) with hardcoded values. The What-If Scenario buttons exist and show a projection SVG chart, but the main capacity overview bars do not update when scenarios change.

---

### HIGH-17 — Multiple pages | Notification panel tabs (All / Unread / Mentions) missing (§17.1)
**FINAL_CHECKLIST claimed:** No prior fix claimed for notification tabs.
**Spec:** "`[All] [Unread (5)] [Mentions]` tabs" in the notification center.
**Reality:** The notification panel in `_shared.js` NOW has tabs at lines 862–865 (All, Unread, Mentions). However, the "Mentions" filter has no seed data with `@mention` type — tapping Mentions shows an empty list with no feedback. The tab switch works visually but "Mentions" is effectively broken (always empty).

---

### HIGH-18 — employees.html | Org Chart view is a static decoration, not functional (§4.1)
**Spec:** "Org Chart View — Hierarchical tree showing reporting structure" with clickable nodes.
**Reality:** The org chart at lines 1436–1573 renders a static HTML tree. Org chart boxes are not clickable (no onclick, no hover cards). The tree does not reflect the actual 8-employee seed data — it shows generic placeholder boxes (CEO, Eng VP, Ops VP, Design VP) not the actual team.

---

### HIGH-19 — clients.html | Client detail missing revenue history chart (§10.2)
**Spec:** "Revenue history (chart)" in client detail view.
**Reality:** Client list cards show a sparkline, and the client detail slide panel has a Revenue Trend mini-sparkline. But there is no full revenue history chart (e.g. 6-month or 12-month bar/line chart) in the client detail tab layout as specified.

---

### HIGH-20 — portal/index.html | Portal Projects section missing burndown chart (§10.3)
**Spec:** "See burndown charts and budget consumption."
**Reality:** A Burndown section exists at line 877 with a static SVG chart. However, the budget consumption bar ("Budget: 49% used") only shows as a stat number in the overview. There is no interactive burndown with hover states, no date markers, no actual vs projected lines rendered properly. The SVG burndown is drawn but has no data points labeled and no interaction.

---

## MEDIUM Issues

---

### MED-01 — Multiple pages | Department names are not clickable (§1.2)
**Spec:** Department → click → filtered employee list. Hover → name, headcount, manager mini-card.
**Reality:** Department names appear as plain text across employee cards, profile headers, admin tables, project team tabs. Not a single instance is a clickable link.

---

### MED-02 — Multiple pages | Project and Client hover cards missing (§1.2)
**Spec:** Project names should show hover card (name, client, status, team size). Client names should show hover card (name, active projects, total revenue).
**Reality:** Only Employee hover cards are implemented via `_shared.js`. Project and Client names link to their pages but show no hover cards. Leave Request, Expense, Timesheet, Invoice entity hover cards also absent.

---

### MED-03 — employees.html | Mini profile hover card missing "Send Message" CTA (§4.3)
**Spec:** Mini profile card CTAs: `[View Profile] [Send Message]`.
**Reality:** `_shared.js` hover card shows only the View Profile link. No "Send Message" button.

---

### MED-04 — leaves.html | Team Leaves missing department/project conflict warnings (§6.3)
**Spec:** "Conflict detection: warns if too many people from same project/department are off."
**Reality:** Leave request modal checks only for date overlap with Alice Wang (hardcoded). No project-level or department-level conflict analysis. Team Leaves table shows static "2 others" text with no dynamic detection.

---

### MED-05 — timesheets.html | Weekend entry warning missing (§8.2)
**Spec:** "Weekend cells → Darker background; warn if entering hours."
**Reality:** Weekend cells exist with darker styling but no warning dialog/toast appears when a user tries to enter hours in a weekend cell.

---

### MED-06 — timesheets.html | Cell hover tooltips missing (§8.2)
**Spec:** "Hover cell → Show tooltip: 'Acme Web Redesign — 6 hours'."
**Reality:** Timesheet cells have no hover tooltips showing project name + hours. The tip text at the bottom of the page documents the shorthand syntax, not cell tooltips.

---

### MED-07 — admin.html | System health card is a toast, not a monitoring page (§14.1)
**Spec:** "System health monitoring."
**Reality:** Clicking the System Health KPI card shows a toast with static text. No monitoring dashboard, no uptime history, no incident log, no real-time service status.

---

### MED-08 — admin.html | Department hierarchy view missing (§14.1)
**Spec:** "Department management (create, assign managers, **hierarchy**)."
**Reality:** Departments tab shows a flat table. No parent-child hierarchy, no org tree view, no manager reporting relationships.

---

### MED-09 — Multiple pages | Saved Views missing from timesheets, employees, leaves, approvals (§1.3)
**Spec:** "Saved Views: Users can save filter combinations...applies to every list/table."
**Reality:** Saved Views exist on gantt.html, clients.html, expenses.html, invoices.html, projects.html. Completely absent from timesheets.html, employees.html, leaves.html, and approvals.html.

---

### MED-10 — hr.html | New Job Posting modal missing fields per spec (§21.2)
**Spec:** Job postings tracked with candidate pipeline. New posting should capture: position title, department, requirements, salary range.
**Reality:** The New Job Posting modal exists with fields (title, department, experience level, description). However, there is no salary range field, no "requirements" structured input, and the posted job does not appear as a new column header in the pipeline or link to the correct position's candidates.

---

### MED-11 — hr.html | Onboarding "New Template" button is dead (§21.3)
**Spec:** Onboarding Templates section has a "New Template" ghost button.
**Reality:** The "New Template" button at line 1123 fires `showToast('info','New Template','Template builder would open here...')`. No template builder modal, no form, no wizard.

---

### MED-12 — portal/index.html | "Mark as Paid" triggers payment modal but doesn't update invoice status table (§10.3)
**Spec:** "Mark as paid (triggers notification)" — invoice table should reflect paid status immediately.
**Reality:** The `openPaymentModal` → confirm flow calls `showToast` and updates only the slide panel badge. The invoice status in the `#sec-invoices` data table row does not update from "Outstanding" to "Paid" after payment is recorded.

---

### MED-13 — gantt.html | Leave bar click shows toast instead of leave detail modal (§5.4)
**Spec:** "Click leave bar → Open leave detail modal."
**Reality:** Leave bar click at line 1866 fires `GHR.showToast('info', 'Leave Details', msg)`. No leave detail modal opens. The spec calls for a modal with status, dates, approver, and balance impact.

---

### MED-14 — gantt.html | Double-click day header to zoom absent (§5.4)
**Spec:** "Double-click day header → Zoom into that day."
**Reality:** No `dblclick` event handler exists on any day column header in the gantt.

---

### MED-15 — gantt.html | Gantt Saved Views not shareable (§5.5)
**Spec:** "Saved views are shareable with other team members."
**Reality:** The "+ Save Current View" button fires `showToast('Current view saved', 'success')` with no sharing mechanism, no link generation, no "share with team" option.

---

### MED-16 — insights.html | "Notify PM" action is a toast (§15.2)
**Spec:** AI insight "Acme project is trending 15% over budget → [Notify PM ▸]" should send a real notification.
**Reality:** `data-action="notify-pm"` maps to `GHR.showToast('success', 'PM has been notified.')`. No PM is actually selected, no notification is sent, no confirmation of who was notified.

---

### MED-17 — _shared.js | Sidebar "Ask AI" link (FINAL_CHECKLIST §Navigation) — documented as fixed, still missing
**FINAL_CHECKLIST states:** "All pages: 'Ask AI' nav item added to AI section of sidebar."
**Reality:** `renderSidebar()` in `_shared.js` contains only `navItem('insights.html', 'lightbulb', 'AI Insights')` in the AI section. No "Ask AI" nav item. No `ask-ai.html` page. This item was marked done but was never implemented.

---

### MED-18 — account.html | Theme preference (dark/light/auto) missing from Preferences tab (§19.1)
**Spec:** "Theme preference (dark/light/auto)" in account settings.
**Reality:** The `_shared.js` has theme logic and `localStorage.getItem('ghr-theme')`, and a theme toggle may exist in the topbar. However, the Preferences tab in `account.html` does not have a visible Theme selection option — verified the Preferences tab content shows language, date format, time format, currency, and notifications frequency but no theme switcher control.

---

### MED-19 — clients.html | Client satisfaction score absent from client detail (§10.2)
**Spec:** "Satisfaction score (if tracked)" in client detail.
**Reality:** A "Satisfaction Score" label appears in code (line 826) but only within a hidden/secondary section. The primary client detail overview does not surface this metric. Prior audit found this — still not remediated.

---

### MED-20 — Multiple pages | Export button fires toast on most list pages (§1.3)
**Spec:** "Export: CSV, PDF, or clipboard" on every list/table.
**Reality:** On employees.html, leaves.html, approvals.html — export buttons exist but fire only toast notifications. No actual file download, no format selection, no clipboard copy. Only invoices.html and expenses.html have partially implemented exports.

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 10 |
| HIGH | 20 |
| MEDIUM | 20 |
| **Total** | **50** |

### Top Priority Fixes
1. **CRIT-01** — Gantt filters are entirely cosmetic. Every filter dropdown must bind a `change` event that redraws the gantt rows.
2. **CRIT-05** — HR Kanban shows 12 cards but claims 47 candidates. Missing 35 candidate cards must be added.
3. **CRIT-03** — HR candidate card click fires a toast. A real candidate detail slide panel must be built.
4. **CRIT-09** — "Ask AI" nav item marked as fixed in FINAL_CHECKLIST but never implemented in `_shared.js`.
5. **CRIT-02** — Gantt zoom buttons are visual only. The timeline grid must re-render on zoom change.
6. **HIGH-12** — Dashboard heatmap cells must be clickable to drill into daily utilization detail.
7. **HIGH-15** — `A` = approve, `R` = reject keyboard shortcuts not wired in approvals.html.
8. **HIGH-18** — Org Chart is a static decoration that doesn't match actual team data.
