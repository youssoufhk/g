# CROSS-CRITIQUE 1: Blind Spots in AUDIT_PROJECTS_CLIENTS and AUDIT_MOBILE

**Cross-Critique Agent:** Agent 1
**Date:** 2026-04-05
**Scope:** Reviewing AUDIT_PROJECTS_CLIENTS.md (Agent 2) and AUDIT_MOBILE.md (Agent 3), with source verification against projects.html, clients.html, invoices.html

---

## Blind Spots in AUDIT_PROJECTS_CLIENTS

### Issues I Agree With

The core thesis -- that the profitability layer is hollow -- is correct and well-argued. The revenue mismatch (24,500 vs. 32,200 from hours x rates) is a real data integrity failure. The observation that all detail views are hardcoded to Acme is accurate (verified in source: projects.html line 1885 `showDetail()` simply sets `window.location.hash = '#detail'` with no content switching). The missing cost model critique is the highest-value finding in either audit.

### Missed Issues

**M1. Client detail uses fixed-width inline styles, not a table -- and the Team tab will break on narrow screens differently than expected.**

The audit says the client Team tab (lines 880-970) "shows 8 team members with columns: Name, Role, Current Project, Hours This Month." What it does not mention is that this is NOT a `<table>`. It is a series of `<div class="team-member-row">` elements with inline `style="width: 140px"`, `style="width: 180px"`, and `style="width: 120px"` on child divs. The total fixed width is: 40px (avatar) + flex(name) + 140px + 180px + 120px = 480px + name. This layout will NOT benefit from `data-table-wrapper` overflow handling because it is not a table. At narrow widths, the fixed-width columns will not shrink (inline styles override CSS), causing either content clipping or overflow without a scroll container. Neither audit caught this hybrid layout anti-pattern.

**M2. Client revenue chart data does not reconcile with the YTD stat.**

The Overview tab shows "Total Revenue: 145,000." The bar chart shows 6 months: 18k + 22k + 28k + 25k + 33k + 19k = 145k. This appears to check out. But the chart is labeled "Revenue (Last 6 Months)" covering Nov-Apr. If the client has been active since January 2024 (as shown at line 661), then "YTD Revenue" (January-April 2026) should be 28k + 25k + 33k + 19k = 105k, not 145k. The 145k figure is the 6-month total (Nov-Apr), not YTD. The audit flagged that no LTV calculation exists but missed this simpler labeling error: "YTD" and "Last 6 Months" are conflated.

**M3. Invoice numbers are inconsistent across pages.**

The audit caught the invoice total mismatch (12,400 vs. 13,044 for INV-2026-048). But it missed a second inconsistency: the project detail Invoices tab (projects.html lines 1396-1430) lists INV-2026-042 dated Apr 1 for 8,500 and INV-2026-035 dated Mar 1 for 9,200 -- but the main invoice table (invoices.html lines 478-635) shows INV-2026-042 as an Initech "Security Audit" invoice for 30,000 dated Feb 1. Same invoice number, different client, different project, different amount, different date. This is a more severe data integrity failure than the total mismatch because it breaks entity identity, not just arithmetic.

**M4. The Acme Web Redesign project detail shows 49% budget used (24,500 of 50,000), but the Client Projects tab shows 72% budget used for the same project.**

The projects.html detail header (line 1073) says "24,500 / 50,000 (49%)". The clients.html Projects tab (line 820-821) shows a 72% progress bar for "Acme Web Redesign." These are supposed to be the same project. The audit caught that revenue numbers do not reconcile but missed this budget percentage contradiction between pages. If a CTO sees 49% on the project page and 72% on the client page, they will question every number in the system.

**M5. The "Add Team Member" button on the project detail (line 1209-1212) uses `btn-sm` but has no corresponding modal or flow.**

The audit noted that the button exists but did not flag that clicking it does nothing. No modal, no dropdown, no JavaScript handler is attached to `#addTeamMemberBtn`. The New Project modal and the Generate Invoice modal both have full implementations. The "Add Team Member" button is a dead end. For a CTO evaluating project staffing workflows, this is a notable gap.

**M6. The project detail has a Timesheets tab with a "Billable" vs "Non-Billable" breakdown that actually undermines the audit's claim.**

The audit (Section 5.8) says "there is no project-level view showing: 120h billable + 18h non-billable." But the Timesheets tab (projects.html lines 1286-1344) DOES show per-week billable/non-billable/total columns. The data is there (e.g., "38h billable, 4h non-billable, 42h total"). What is missing is the aggregate summary and the write-off ratio -- the tab shows the raw data but does not compute or display the totals. This is a less severe gap than "not prototyped at all."

**M7. No empty state handling for project detail tabs.**

The project detail has 7 tabs. The prototype shows data in all of them for the Acme project. But since every project resolves to the same detail view, there is no demonstration of what empty states look like (e.g., a new project with no team, no timesheets, no invoices). The empty state pattern IS demonstrated for the list views (projects list, client list, invoices list all have empty state divs). The gap is at the detail level.

**M8. The Completed column in the Kanban board shows project cards with revenue figures (lines 851-885) but the Active/Planning columns do not.**

Active project cards show billing rate (e.g., "85/h") and budget percentage, but Completed cards show total revenue (e.g., "Revenue: 120,000"). This inconsistency in card data across columns was not mentioned. It also raises a question: why show revenue on completed projects but not on active ones? Active projects need revenue tracking more urgently.

### Severity Adjustments

**Section 2.2 "Can You Drill from Client -> Project -> Employee" -- Score 6/10 is too generous. Should be 4/10.**

The drill-down chain is not "partially" functional. The client card click handler (clients.html line 1299-1301) sets `window.location.hash = 'detail'` with no client identifier. Similarly, clicking project names in the client detail navigates to `projects.html` with no hash or parameter. The audit says "the drill-down chain is conceptually correct but practically broken." I would say it is HTML links with correct labels pointing to wrong destinations -- the concept is right but the execution is zero. The fact that the `data-client` attribute exists on cards (line 536) but is never consumed by the click handler makes this a missed opportunity, not a partial implementation.

**Section 3.1 "Does Invoicing Connect Logically" -- Score 8/10 is too generous given the dead-end Generate modal.**

The Generate Invoice modal (lines 831-915) hard-codes only Acme projects in the project dropdown regardless of which client is selected. The audit flags this correctly. But combined with the fact that there is no line-item editing (acknowledged as a spec gap), the generation flow is non-functional: you can "generate" an invoice but the result is always the same static detail view. This is closer to a 6/10.

---

## Blind Spots in AUDIT_MOBILE

### Issues I Agree With

The overall 3/10 assessment is accurate. The identification of missing bottom navigation, absent table-to-card transforms, and universally undersized touch targets are all well-documented and correct. The per-page analysis is thorough. The auth.html observation ("the team knows how to build for mobile -- apply it everywhere") is a sharp insight.

### Missed Issues

**M1. The client Team tab uses a flex-div layout with hardcoded pixel widths (not a table), which makes it WORSE on mobile than the audit predicts.**

The mobile audit says client detail "tables (projects under client, invoices) will overflow." But the Team tab specifically is NOT wrapped in `data-table-wrapper` or `overflow-x: auto`. It is a series of flex rows with inline `style="width: 140px"` / `style="width: 180px"` / `style="width: 120px"`. These fixed-width inline styles cannot be overridden by a media query without `!important`. At 390px, the row would need at minimum 40 + 140 + 180 + 120 = 480px of fixed width plus the flex name column, totaling around 600px+. With no `overflow-x: auto` wrapper, this will simply overflow the viewport with no scroll affordance. This is worse than the table overflow problem because at least tables in `data-table-wrapper` get horizontal scroll. This layout will just clip or cause page-level horizontal scroll.

**M2. The project detail 7-tab navigation is especially problematic on mobile.**

The audit gives projects.html a mobile score of 5/10 and mentions "View toggle buttons are ~28px height" and "Filter selects are 32px height." But it does not specifically call out the 7-tab strip in the project detail (Overview, Team, Timesheets, Expenses, Invoices, Milestones, Activity). At 390px, 7 tab buttons with text labels will overflow horizontally. The `_components.css` tab styling does support horizontal scroll (from the audit: "Tabs scroll horizontally"), but with 7 tabs the rightmost ones (Milestones, Activity) will be invisible without scrolling. There is no scroll indicator or visual hint that more tabs exist to the right. On mobile, a user may never discover the Milestones or Activity tabs.

**M3. The project detail Timesheets sub-tab has its own data-table inside the detail view.**

The mobile audit evaluates timesheets.html thoroughly (2/10), but does not evaluate the project-detail Timesheets tab (projects.html lines 1286-1344). This is a 5-column table (Week, Billable Hours, Non-Billable, Total, Status) displayed inside the project detail view. On mobile, a user who navigates to Project Detail -> Timesheets tab will hit another overflowing table. The audit's projects.html score of 5/10 does not account for the fact that 4 of the 7 detail tabs (Team, Timesheets, Expenses, Invoices) contain data-tables that will all overflow at 390px.

**M4. The project detail Expenses sub-tab (projects.html lines 1348-1393) also has an overflowing table.**

Same issue as M3. The Expenses tab has columns: Date, Employee, Type, Amount, Status. This 5-column table will overflow. The mobile audit does not evaluate project-internal sub-tabs at all -- it treats projects.html as if it were only the list/kanban views.

**M5. The client detail contact cards use `grid-3` with no mobile override.**

The contacts section (clients.html lines 676-701) uses `class="grid-3"`. The `_layout.css` grid classes DO have mobile collapse, but `grid-3` may collapse to 1-column only at 639px (if the pattern follows grid-4). However, the contact cards themselves contain avatar (40px) + info (flex), and at 390px in a single column, this works. But between 640px and ~900px (tablet), three contact cards side by side with avatar + name + role + email will be extremely cramped. The mobile audit does not evaluate tablet breakpoints at all -- it tests only at 390px.

**M6. The client revenue bar chart has extremely small labels at 390px.**

The revenue chart bars use `font-size: var(--text-overline)` (11px) for both value labels ("18k") and month labels ("Nov"). The chart container is 140px tall. At 390px viewport width minus page padding, the 6 bar columns share roughly 330px, giving each bar column about 55px. With an 11px label on top and an 11px label on the bottom, and the bar itself in between, this is technically readable but not comfortably so. The mobile audit mentions the dashboard chart labels being small but does not flag the client-specific revenue chart.

**M7. The invoices page has a 9-column table (the most columns of any table in the three audited pages).**

The invoice list table has columns: #, Invoice, Client, Project, Amount, Status, Issue Date, Due Date, Actions. That is 9 columns. The mobile audit gives invoices.html a 3/10 and says "multi-column data-table will overflow" but does not specifically quantify that 9 columns is the worst-case data table in these three pages. The natural width of this table is likely 900px+, requiring the user to scroll more than a full screen width to the right on a 390px device.

**M8. The Generate Invoice modal form uses `grid-2` layout with no mobile override.**

The Generate Invoice modal (invoices.html lines 839-878) uses `class="grid-2"` for its form fields. At 390px inside a modal (which becomes ~358px wide), two side-by-side form inputs would each be about 160px wide. Date inputs at 160px are barely usable. The `grid-2` class in `_layout.css` likely collapses at 639px, but inside a modal that is already narrowed, the effective width may not trigger the breakpoint correctly. The mobile audit mentions "Complex form modals will be cramped" but does not specifically audit the Generate Invoice modal form layout.

**M9. The "New Client" modal has the same grid-2 cramping issue plus a two-section form.**

The New Client modal (clients.html lines 1071-1143) has grid-2 form groups for: Client Name/Industry, Website/Address, then a separator and Contact Name/Email, Phone/Role. On mobile, this is 8 form fields across 4 rows in a non-full-screen modal. The modal body padding (24px on each side) plus the modal margin reduces usable width to roughly 298px. Two form inputs in that width would be about 140px each. This is borderline unusable for text entry.

### Severity Adjustments

**Projects page score of 5/10 should be 3/10 when accounting for the detail view.**

The mobile audit scores projects.html at 5/10, noting that "Kanban board collapses" and "Project cards are mobile-friendly." But 5/10 treats the page as if users only interact with the list view. The project detail view -- which is where users spend most of their time -- contains 4 overflowing data-tables (Team, Timesheets, Expenses, Invoices tabs), a 7-tab navigation that hides rightmost tabs, SVG charts with 9px font labels, and multiple `btn-sm` and `btn-xs` buttons. The list view is indeed a 5/10. The detail view is a 2/10. A weighted average accounting for actual user time should be closer to 3/10.

**Clients page score of 5/10 should be 3/10 for the same reason.**

The client list is card-based and mobile-friendly. But the client detail view contains: a fixed-pixel-width flex-div team layout with no overflow wrapper (worse than table overflow), data-tables in Projects and Invoices tabs, a grid-3 contacts section, action buttons that are btn-sm, and no mobile media queries at all in the page CSS. The detail view is where users drill into data. It is a 2/10 on mobile.

---

## Cross-Cutting Issues Neither Audit Caught

### CC1. The profitability gap compounds on mobile: even if cost data existed, it could not be displayed.

Audit 2 correctly identifies that the profitability stack is absent (Section 5.1). Audit 3 correctly identifies that all data tables overflow on mobile. Neither connects these findings: even if the profitability columns were added (Cost, Revenue, Margin per employee per project), the project Team table would grow from 4 columns to 7 columns. On desktop, this is feasible. On mobile, a 7-column team profitability table is completely unusable. The solution is not just "add profitability data" -- it is "design a mobile-first profitability view" (e.g., summary cards showing top-line margin, tap-to-expand per employee). Any implementation of the cost model MUST be designed for mobile consumption from the start, or the most important data in the system will be accessible only from desktops.

### CC2. The hardcoded detail view problem is worse on mobile because of navigation cost.

Audit 2 flags that all detail views resolve to Acme. Audit 3 flags that every navigation action requires 3+ taps through the hamburger menu. Neither connects: on mobile, a user who navigates to a specific client detail (3 taps) and then drills to a project (1 tap) ends up on the wrong project's detail (Acme, always). On desktop, the user can quickly click Back and try again -- low cost. On mobile, recovering from a wrong-destination navigation requires: recognize the error -> tap Back -> scroll to find the right entity -> tap again. The navigation penalty for broken drill-downs is 2-3x higher on mobile than desktop.

### CC3. The invoice total mismatch has different consequences on mobile vs. desktop.

Audit 2 identifies that INV-2026-048 shows as 12,400 in the list but 13,044 in the detail. On desktop, a user can see both the list and detail side-by-side (or quickly switch). On mobile, the user sees the list amount, taps to view detail, and now the list is off-screen. If they notice the discrepancy, they must navigate back to verify -- which on mobile means re-scrolling the list to find the row. The data inconsistency problem is less likely to be caught (user sees numbers sequentially, not simultaneously) and harder to verify (navigation cost). This means the data integrity issue is simultaneously less visible and more trust-damaging on mobile.

### CC4. Client-to-project drill-down on mobile is a dead end within the prototype.

Audit 2 rates client-to-project drill-down at 6/10 (I argued 4/10 above). Audit 3 rates the clients page at 5/10 on mobile. Neither evaluates the cross-page mobile journey: a mobile user on the client detail, Projects tab, tapping "Acme Web Redesign" would navigate to `projects.html` -- which loads the list view (no hash to trigger detail). On a 390px screen, the user now sees the kanban board (single column due to media query), must scroll to find the project, tap it, and then see the (wrong, always-Acme) detail view. This is a 5-step journey to a broken destination. On mobile, this entire flow should be flagged as non-functional, not merely "generic links."

### CC5. The project detail charts (Hours Trend, Budget Burndown) use hardcoded SVG viewBox values.

Both charts use `viewBox="0 0 400 160"` with `preserveAspectRatio="none"`. The text labels use absolute pixel positions (e.g., `<text x="390" y="155" font-size="9">`). At 390px viewport width minus padding, these SVGs scale down to roughly 330px rendering width. The labels at 9px font-size in a scaled-down SVG become approximately 7px -- below the minimum legible size for most users. Audit 2 evaluates the charts on data accuracy. Audit 3 says "Charts not simplified, tables overflow" generically. Neither specifically identifies that the project detail charts -- visible on the first tab a user sees -- have hardcoded SVG coordinates that degrade on mobile.

### CC6. Neither audit evaluates the cross-page data flow for invoice generation from the client perspective.

A consulting firm CTO often generates invoices from the client context: "I want to invoice Acme for last month's work across all their projects." The flow would be: Client Detail -> (need a "Generate Invoice" button, which does not exist on the client page) -> or, navigate to Invoices page -> click Generate -> select Acme -> select project -> set dates -> generate. But the Generate Invoice modal only allows selecting ONE project at a time (lines 852-857). There is no way to generate a consolidated multi-project invoice for a client. Audit 2 mentions missing "split invoice support" but does not flag the inverse problem: consolidation of multiple projects into one client invoice. This is a standard consulting firm workflow.

### CC7. The document download buttons on the client detail use `btn-ghost btn-xs` -- both audits' concerns collide.

Audit 2 identifies that the Rate Card is stored as a flat file (Rate Card 2026.xlsx) rather than structured data. Audit 3 identifies that `btn-xs` is 28px, well below the 44px touch target. Neither connects: the download buttons for MSA, Rate Card, and Brand Guidelines documents are 28px ghost buttons with only a 14x14px SVG icon inside. On mobile, these are functionally untappable. A mobile user cannot download the MSA or Rate Card from the client detail. For a CTO reviewing client documents on their phone before a meeting, this is a showstopper.

---

## Severity Adjustments

| Original Rating | Audit | Adjustment | Rationale |
|---|---|---|---|
| Project Detail Financial: 3/10 | Agent 2 | **Agree: 3/10** | Correctly harsh. The unverifiable margin is the prototype's worst sin. |
| Client Detail Projects: 4/10 | Agent 2 | **Adjust to 3/10** | Budget % contradiction (49% vs 72%) between pages compounds the missing revenue column. |
| Drill-down chain: 6/10 | Agent 2 | **Adjust to 4/10** | "Conceptually correct but practically broken" understates it. Links exist but function as generic navigation, delivering zero drill-down value. |
| Invoice Connection: 8/10 | Agent 2 | **Adjust to 6/10** | The Generate modal is non-functional (hardcoded projects, no line-item editing). The detail view is excellent but static. |
| Projects Mobile: 5/10 | Agent 3 | **Adjust to 3/10** | Only the list view earns a 5. The detail view (where users spend time) is a 2/10 with 4 overflowing sub-tables. |
| Clients Mobile: 5/10 | Agent 3 | **Adjust to 3/10** | List is card-friendly but detail has fixed-pixel layout, no overflow wrapper, and zero mobile CSS. |
| Cross-page Data Consistency: 3/10 | Agent 2 | **Adjust to 2/10** | Invoice number collision (INV-2026-042 different on two pages) and budget % contradiction (49% vs 72%) are additional findings beyond what was reported. |

---

## Summary

Both audits are individually strong. Agent 2 correctly identifies the hollow profitability core. Agent 3 correctly identifies the absent mobile strategy. The critical gap in both audits is the failure to evaluate the **detail views on mobile** -- which is where the two concerns intersect. A consulting firm CTO checking project margins on their phone will encounter: no cost data (Agent 2's finding) displayed in overflowing tables (Agent 3's finding) behind 7 tabs they cannot see (neither caught) with numbers that contradict other pages (partially caught by Agent 2 but not fully). The compound effect is worse than either audit individually suggests.

The prototype's overall readiness is closer to 4/10 than either audit's individual score, because the desktop UX is compromised by data integrity issues and the mobile UX is compromised by absent responsive design, and these problems multiply rather than merely adding.
