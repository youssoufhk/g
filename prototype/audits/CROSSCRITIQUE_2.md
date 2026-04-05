# Cross-Critique 2: AUDIT_WORKFLOWS vs AUDIT_COMPONENTS_VISUAL

**Reviewer:** Cross-Critique Agent 2
**Date:** 2026-04-05
**Audits Reviewed:** AUDIT_WORKFLOWS (Critique Agent 4), AUDIT_COMPONENTS_VISUAL (Critique Agent 5)
**Prototype Files Verified:** leaves.html, expenses.html, timesheets.html, approvals.html, _components.css

---

## Blind Spots in AUDIT_WORKFLOWS

### 1. FACTUAL ERROR: "AI scan does not auto-fill the form" -- WRONG

This is listed as the #2 P0 fix and called the most damaging issue in the expense flow. **It is incorrect.** The actual code in `expenses.html` lines 1524-1530 clearly shows:

```javascript
// Auto-fill form
document.getElementById('formType').value = 'hotel';
document.getElementById('formAmount').value = '340.00';
document.getElementById('formDate').value = '2026-04-02';
document.getElementById('formProject').value = 'acme';
document.getElementById('formBillable').checked = true;
document.getElementById('formDesc').value = 'Marriott Hotel Lyon - 2 nights for client workshop';
```

The `startAiScan()` function shows a 2-second loading overlay, then reveals the AI result card AND auto-fills all six form fields. The workflow audit's entire critique of the OCR feature is built on a false premise. This inflated the severity of the expense flow issues and pulled its score down. The real remaining issue is that the auto-fill values are hardcoded (always the same hotel expense), so there is no dynamic relationship between what a user uploads and what gets filled -- but that is a prototype limitation, not a broken flow.

### 2. FACTUAL ERROR: "Tab filtering is not wired" on Approvals Hub -- WRONG

The audit lists this as P0 fix #3. Inspection of `approvals.html` lines 1067-1101 reveals a fully implemented `applyFilter()` function that:
- Listens for click events on `.approval-tabs .tab` buttons.
- Reads the `data-filter` attribute.
- Shows/hides `.approval-card` elements based on their `data-type` attribute.
- Dynamically hides the "URGENT" and "PENDING" section labels when they have no visible children.

This directly contradicts two claims: (a) that tab filtering does not work, and (b) that section labels persist after their contents are emptied. The `applyFilter()` function explicitly manages label visibility (lines 1099-1100). This removes two of the five listed Critical Gaps for the Approvals Hub flow.

### 3. FACTUAL ERROR: "Section labels persist after their contents are emptied" -- PARTIALLY WRONG

The workflow audit claims this as a problem in the approval actions context (approving individual cards). The `applyFilter` function handles label visibility correctly when filtering by type. However, there may still be a legitimate issue: when individual cards are approved/rejected and removed from the DOM, the `approveCard()` and `rejectCard()` functions do NOT call `applyFilter()` or otherwise check whether the section should be hidden. So the claim is wrong for the filtering scenario but potentially valid for the approval-removal scenario. The audit should have been more precise.

### 4. Missing: Expense stat cards DO use monospace via inheritance

The workflow audit does not flag this, but neither does it credit it. The `.stat-value` class in `_components.css` (line 299) includes `font-family: var(--font-mono)`, so the `stat-value` elements on the expenses page (`expenses.html` lines 714, 722, 730) are correctly rendered in monospace without needing an explicit `font-mono` class. This is worth noting because the visual audit calls out missing `font-mono` in some contexts; the stat cards on the expense page are NOT one of those gaps.

### 5. Missing: No mention of the expenses approval queue count mismatch

The expense page tab shows "Approval Queue (4)" but the visual audit mentions only "2 expenses" in the Approvals Hub. The workflow audit does not flag this count discrepancy between the per-module approval queue and the central hub, which would confuse a user navigating between the two.

### 6. Missing: Role/persona confusion across pages

The prototype shows Sarah Chen as "Admin" in the user menu on every page. She is simultaneously the submitter of leave requests and expenses, the approver of team leaves, and the viewer of the central Approvals Hub. The workflow audit correctly identifies the lack of "My Pending Requests" on the dashboard but never names the deeper issue: the prototype conflates employee and manager personas into one user. This makes it impossible to demo a realistic two-sided flow (employee submits, then manager approves). A prototype aimed at user testing should have at least a basic persona switcher or two distinct demo accounts.

### 7. Missing: Calendar click-to-request not verified

The workflow audit states "Clicking a day on the Leave Calendar tab triggers the modal with a prefilled date." This claim was not verified against the code. If the calendar day click does not actually prefill the modal's start/end date fields, this is an incorrect credit rather than a gap -- but the audit presents it as confirmed fact without evidence.

### 8. Missing: No mention of team leave count vs sidebar badge

The workflow audit notes the Leaves sidebar badge says "3" and the Team Leaves tab shows 3 pending + 5 approved = 8 total, and calls this "ambiguous." It misses the more concrete issue: the Team Leaves tab heading has `<span class="tab-count">8</span>`, meaning the tab itself says "8" while the sidebar says "3." Users will see "3" in the sidebar, click through, see "Team Leaves (8)" in the tab header, and wonder which number to trust. The audit should have flagged the tab count vs badge inconsistency explicitly.

### 9. Missing: Expense approval queue shows 4 items in tab count but Approvals Hub shows 2

The `expenses.html` approval tab count says "4" (line 702), but the Approvals Hub says "Expenses (2)" (line 430). This data inconsistency between pages was not flagged.

---

## Blind Spots in AUDIT_COMPONENTS_VISUAL

### 1. Missing: Inline style usage in core flow templates beyond gantt.html

The visual audit dedicates an entire section (#10) to gantt.html as the "Special Disgrace" but underweights the inline style problems in core workflow pages. For example:
- `leaves.html` lines 1058, 1111, 1148 use fully inline-styled badges for Sick and WFH leave types: `style="background: hsla(270,45%,58%,0.15); color: hsl(270,45%,58%)"`. These are in the Team Leaves data table, which is the primary approval surface. The visual audit does list these but buries them in the "Hardcoded HSL" table without noting that they appear in the most mission-critical workflow -- the one where a manager processes team requests.
- `expenses.html` line 844 uses `hsla(270, 45%, 58%, 0.14)` for a software expense icon. The visual audit notes this but does not connect it to the fact that expense category icons use inconsistent color assignment methods: some use token variables (`var(--color-info-muted)`), while others use raw HSL. This means future theme changes will break some expense icons but not others.

### 2. Missing: The filter bar inconsistency has workflow consequences

The visual audit correctly identifies 4+ different filter bar implementations (Section 8). It scores this as a visual consistency issue. It does not flag the UX consequence: because the expense page filter bar has a visible card treatment (background, border, radius) while the leaves and approvals filter bars do not, users may perceive the expense filters as a more prominent, more "real" feature. This can subtly train users to expect filtering to work on the expense page while dismissing the less-visible filter bars on other pages as decorative. The workflow audit confirms that all filters across all pages are non-functional, compounding the visual inconsistency with a functional one.

**Correction:** The expense page filter bar is visually styled (`background: var(--color-surface-0)`, border, radius) but is equally non-functional as the plain bars on other pages. Both audits miss this ironic pairing: the most "polished" filter bar is equally broken.

### 3. Missing: Badge icon inconsistency within the same flow context

The visual audit provides an exhaustive list of badges missing icons (50+). However, it does not note that within a single page, some badges of the same semantic class HAVE icons while others DO NOT:
- In `leaves.html`, status badges (Approved, Pending, Rejected) consistently include SVG icons. But leave TYPE badges (Annual, Sick, Personal, WFH) in the Team Leaves table do NOT have icons. A user scanning the Team Leaves table sees icon-equipped status badges next to icon-less type badges in adjacent columns. This within-row inconsistency is more jarring than cross-page inconsistency.
- In `approvals.html`, type badges (Timesheet, Leave, Expense) lack icons, while the "Overdue" badge also lacks an icon, yet the "Under target" warning-tag DOES include an `alert-triangle` icon. Mixed signals in the same card row.

### 4. Missing: The toggle-switch in expenses.html is a custom component, not the shared `.toggle`

The visual audit notes that `.toggle` in `_components.css` has no hover state. But `expenses.html` defines its own `.toggle-switch` (lines 39-64) which is a completely separate component from the shared `.toggle`. This custom toggle uses `#fff` for its knob (line 58) and hardcoded `2px` / `16px` values. The visual audit catches the `#fff` but does not call out that this is a duplicated component that should use the shared `.toggle` from `_components.css`. Having two toggle implementations means fixes to one do not propagate to the other.

### 5. Missing: No audit of the command palette consistency across pages

The visual audit checks components against the design system spec but does not verify whether the command palette markup and actions are identical across pages. Each HTML page appears to include its own copy of the command palette. If the action items differ (the workflow audit notes "New Expense" is missing from the command palette), this is both a visual and workflow issue that neither audit connects.

### 6. Missing: Notification panel monetary values

The visual audit correctly flags that notification text contains monetary values not wrapped in `font-mono`. However, it does not note that these same notifications are replicated slightly differently on each page. The expenses page notifications mention euro amounts (lines 629, 636), and the approvals page notifications mention `euro340` (line 365). Since every page has its own copy of the notification panel, fixing the monospace issue requires touching every HTML file -- a maintenance cost that the audit should flag as a systemic concern rather than a per-instance defect.

---

## Cross-Cutting Issues

### 1. Icon-less badges degrade the approval workflow

The visual audit identifies 50+ badges without icons. The workflow audit identifies that the Approvals Hub is the central manager surface. The intersection: in `approvals.html`, the type badges ("Timesheet", "Leave", "Expense") and the "Overdue" severity badge lack icons. A manager triaging 12 items in a mixed queue relies heavily on rapid visual scanning. The color-coded type icon to the left of each card (the `.card-type-icon` element) partially compensates, but the text badges themselves should reinforce the signal. When combined with the fact that the "View Details" modal is a placeholder (per the workflow audit), the manager has fewer cues to distinguish items and no way to drill into them. The badge icon absence escalates from a design-system compliance issue to a workflow-impacting issue in this context.

### 2. Missing hover states on checkboxes impact the bulk approval flow

The visual audit notes that `.form-check` checkboxes have no hover feedback. The workflow audit praises the bulk approve/reject feature in the Approvals Hub. The intersection: the checkboxes in the approval cards (`<input type="checkbox" class="item-check">`) are the sole entry point for bulk selection. Without hover feedback, users lack visual confirmation that these tiny targets are interactive, which undermines discoverability of the entire bulk action flow. This is especially problematic given the checkboxes sit inside dense approval cards where many elements compete for attention.

### 3. Focus state gaps make keyboard approval impossible

The visual audit flags the lack of focus trapping in modals and missing ARIA attributes. The workflow audit flags that Enter does not submit the leave modal. Combined, this means: (a) the rejection reason modal (used in timesheets and expenses approval, and the Approvals Hub) cannot be reliably completed via keyboard because Tab may escape the modal, and (b) after typing a rejection reason, the user cannot press Enter to confirm -- they must mouse-click the "Confirm Reject" button. For a manager processing 12 approvals, this keyboard-hostile pattern forces constant hand movement between keyboard and mouse.

### 4. Financial typography gaps in notification panels cross all workflows

Both audits touch this from different angles. The visual audit flags that monetary values in notifications lack monospace formatting. The workflow audit flags that notifications are static and non-navigable. Combined: the notification panels serve as a cross-workflow status surface (showing expense amounts, leave submissions, timesheet reminders). Their monetary values are in the wrong font AND clicking them leads nowhere. Both issues compound to make the notification panel a doubly unreliable surface -- visually inconsistent AND functionally inert.

### 5. Inline HSL values in leaves.html directly affect the approval flow visual

The leaves page Team Leaves table is the surface where a manager approves or rejects leave requests. The Sick leave type badge and WFH type badge use fully inline HSL styles (`hsla(270,45%,58%,0.15)` and `hsla(175,35%,45%,0.15)`). If a light-mode theme is ever applied (the visual audit notes the theme toggle is missing), these hardcoded dark-mode colors will break. The manager approval surface would display invisible or unreadable type badges for Sick and WFH leave -- two categories that arguably require the most careful handling.

### 6. Duplicated component definitions create a maintenance minefield for workflow fixes

The visual audit identifies filter bar (4+ implementations) and toggle (2 implementations) duplication. The workflow audit identifies that no filters work anywhere. Fixing filter functionality will require touching 4+ separate CSS/JS implementations rather than one centralized component. This multiplies the effort for what the workflow audit rates as a P2 fix, and should probably be elevated to P1 on the grounds that standardizing the component first will make the functional fix cheaper.

---

## Severity Adjustments

### Upward Adjustments

| Item | Original Audit | Original Severity | Adjusted Severity | Reason |
|------|---------------|-------------------|-------------------|--------|
| Checkbox hover states | COMPONENTS_VISUAL | Listed but not rated high | HIGH | Directly impacts bulk approval workflow discoverability |
| Filter bar duplication | COMPONENTS_VISUAL | MEDIUM | HIGH | Multiplies cost of fixing the non-functional filters flagged by WORKFLOWS |
| Inline HSL on leave type badges | COMPONENTS_VISUAL | Listed in table | HIGH (for workflow context) | Appears on the primary manager approval surface; theme-fragile |
| Focus trapping missing | COMPONENTS_VISUAL | Listed under Section 7 | P0 (for approval flows) | Makes keyboard-driven rejection workflows impossible to complete reliably |
| No persona switcher | Neither audit | Not flagged | HIGH | Cannot demo two-sided approval flows without it; undermines all user testing |

### Downward Adjustments

| Item | Original Audit | Original Severity | Adjusted Severity | Reason |
|------|---------------|-------------------|-------------------|--------|
| "AI scan does not auto-fill form" | WORKFLOWS | P0 #2 | **INVALID -- not a real issue** | Code verifiably auto-fills all 6 fields. The entire critique is wrong. |
| "Tab filtering not wired" (Approvals Hub) | WORKFLOWS | P0 #3 | **INVALID -- not a real issue** | `applyFilter()` function exists and works, including section label management. |
| "Section labels persist" (Approvals Hub) | WORKFLOWS | Critical Gap #5 | LOW (for filter context) / MEDIUM (for card-removal context) | Labels are managed during filtering. Only potentially broken during individual card removal. |
| Expense flow overall score | WORKFLOWS | 6.5/10 | 7/10 | Two of the three "most serious" issues (AI scan and the indirect effect on approval tabs) are not real. The true remaining gap is: submit produces no visible result + no validation. |
| Approvals Hub overall score | WORKFLOWS | 7.5/10 | 8/10 | Two of five Critical Gaps are factual errors. Remaining gaps (detail modal placeholder, no comment field, no "Request Info" action) are real but the functional filtering and section management add significant value. |
| Gantt.html inline styles | COMPONENTS_VISUAL | 3/10, "Special Disgrace" | 3/10 (unchanged but de-prioritized) | Gantt is not part of any core daily workflow. The inline style issues are real but affect a secondary planning view. Leaves and expenses inline issues have higher workflow impact. |
| Title separator inconsistency | COMPONENTS_VISUAL | LOW | TRIVIAL | Affects `<title>` tags that are only visible in browser tabs. Zero user-facing workflow impact. |

### Summary of Score Impact

The two factual errors in AUDIT_WORKFLOWS significantly affect trust in its ratings. When the P0 list contains items that are not actually broken, it dilutes the urgency of the items that ARE broken (expense submit producing no result, leave rejection with no reason, detail modal being empty). The corrected P0 list should be:

1. **Expense submit must produce a visible result.** (Confirmed real.)
2. **Leave rejection must require a reason.** (Confirmed real.)
3. **Approvals Hub detail modal must show real content.** (Confirmed real.)
4. ~~AI scan must auto-fill.~~ (NOT REAL.)
5. ~~Tab filtering must work.~~ (NOT REAL.)

The visual audit's findings are overwhelmingly verified against the code. Its main weakness is not factual errors but rather a failure to connect its findings to the workflow surfaces where they matter most. The badge icon and focus-state issues are not just spec violations -- they are approval-flow degraders.
