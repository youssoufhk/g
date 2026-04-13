# CRITIC_DATA.md — Data Consistency Audit
**Auditor:** Claude Sonnet 4.6 (harsh mode)
**Date:** 2026-04-11
**Scope:** All HTML files in prototype/, plus _shared.js
**Method:** Cross-referenced every name, role, department, work time %, invoice number, client name, and status across all pages against the canonical data contract.

---

## CRITICAL (breaks user trust — contradictory data visible in normal use)

### 1. [CRITICAL] employees.html | Alex Morrison is a ghost CEO in the org chart — not one of the 12 canonical employees
employees.html org chart (lines 1441–1448) shows "Alex Morrison — CEO & Founder" as the root node. He does NOT appear in admin.html's 12-user table anywhere. Marie Dupont is the canonical CEO. The org chart has a 13th ghost employee with no corresponding admin row, no email, no department headcount contribution.
- **Fix:** Replace Alex Morrison with Marie Dupont as org chart root, or remove him entirely.

### 2. [CRITICAL] employees.html | Sarah Chen profile has TWO contradictory "Reports to" fields on the same page
employees.html line 1665: "Reports to: Alex Morrison" (ghost employee, via hovercard link).
employees.html line 1674: "Reports to: Marie Dupont" (correct canonical CEO).
Both are in the same profile hero section. One of them must be deleted. Currently both display simultaneously.
- **Fix:** Remove the Alex Morrison reference (line 1665). Keep Marie Dupont.

### 3. [CRITICAL] account.html:854 | Reports-to field shows "Alex Morrison (CEO)" — ghost employee
account.html shows `value="Alex Morrison (CEO)"` in the profile form. Alex Morrison does not exist in the 12-employee roster. The correct CEO is Marie Dupont.

### 4. [CRITICAL] David Park work time is 45% everywhere — canonical is 85%
David Park canonical: 28h billable + 6h internal = 34h total / 40h capacity = **85% work time**.
Every file shows 45%: employees.html (card line 1130, table line 1362, org chart line 1532), admin.html (user row line 509, dept manager line 618), timesheets.html (hovercard line 1578), insights.html (bar chart line 1624). The value 45% is Alice Wang's work time, not David Park's. This appears to be a copy-paste error that was never corrected.
- **Fix:** Change all `data-worktime="45"` for David Park to `data-worktime="85"` and all corresponding bar widths/displayed percentages.

### 5. [CRITICAL] Yuki Tanaka has inconsistent role AND work time across pages
- employees.html (card line 1226, table line 1402): role = **"QA Engineer"**, worktime = **70**
- admin.html (user row line 529): role = **"Software Engineer"**, worktime = **72**
Two different job titles and two different work time percentages for the same employee on pages a PM would view in the same session.

### 6. [CRITICAL] Liam O'Brien work time is 88% on most pages but 95% on two others
- employees.html (card + table), admin.html, approvals.html: **88%**
- projects.html (line 1464 + detail object line 2431), invoices.html (line 851): **95%**
Four occurrences say 88%; two say 95%. This contradicts the pattern of a single canonical value.

### 7. [CRITICAL] INV-2026-041 shows two different amounts on two different pages
- invoices.html (line 634): **€9,800** (122h @ €80/h — math: 122 × 80 = €9,760, also off by €40)
- portal/index.html detail object (line 1715): total = **€8,200**
The same invoice number shows two completely different amounts. A client viewing the portal and an admin viewing invoices.html would see irreconcilable figures.

### 8. [CRITICAL] INV-2026-043 project name contradicts between invoices.html and portal
- invoices.html (line 598): project = **"Acme Web Redesign"**
- portal/index.html (line 654 + AI response line 1806): project = **"Mobile App"**
Same invoice, two different projects named. A client would see "Mobile App"; an admin would see "Acme Web Redesign."

### 9. [CRITICAL] insights.html | AI response references INV-2026-052 which does not exist in invoices.html
insights.html line 2091: AI says "One invoice pending: Globex Corp INV-2026-052 (€8,200, 14 days)."
insights.html Client Health tab line 1715: Globex card shows "Last invoice: INV-2026-052 — Pending."
invoices.html shows no INV-2026-052. The Globex invoice is INV-2026-047 (€8,200, Sent). The AI and client health card are citing a non-existent invoice number.

### 10. [CRITICAL] Alice Wang weekly timesheet hours contradict canonical data by 2.2×
timesheets.html "Row 6: Alice Wang — 38h billable + 2h internal = 40h total, 100% work time" (lines 1536–1568).
Canonical: Alice Wang = 16h billable + 2h internal = 18h, 45% work time.
Her timesheet data is 222% of her canonical hours. Her hovercard correctly shows 45% but the timesheet detail shows a completely different reality.

---

## HIGH (data contradiction, less immediately visible but still wrong in any demo)

### 11. [HIGH] Emma Laurent weekly timesheet hours contradict canonical
timesheets.html "Row 5: Emma Laurent — 24h billable + 16h internal = 40h total, 100% work time" (lines 1502–1534).
Canonical: Emma Laurent = 18h billable + 18h internal = 36h total, 90% work time.
Both the hours and the work time percentage differ from canonical.

### 12. [HIGH] _shared.js notification says INV-2026-048 is "overdue" — it is not
_shared.js line 823: `"Invoice INV-2026-048 overdue — Acme Corp (EUR 12,400)"`.
invoices.html shows INV-2026-048 as **Sent** status, due date Apr 30, 2026. Current date is Apr 11, 2026 — 19 days before due. It is not overdue. This notification will display as stale/wrong data to any PM or admin.

### 13. [HIGH] _shared.js notification says Emma Laurent is a new hire starting Monday
_shared.js line 824: `"New hire onboarding: Emma Laurent starts Monday"`.
Emma Laurent is a fully active HR Specialist with 36h/week, existing timesheets, leave records, and expense history. She is not a new hire. This is a stale seed notification that was never updated.

### 14. [HIGH] portal/index.html | INV-2026-041 line-item math is wrong
portal/index.html lines 1712–1715: line items 64h @ €85/h = €5,440 and 32h @ €85/h = €2,720, total hours = 96h, sum = €8,160. But subtotal shows **€6,833** — which is neither the correct sum of line items (€8,160) nor consistent with any other value for this invoice.

### 15. [HIGH] INV-2026-048 invoice math does not match stated hours × rate
invoices.html line 514: "144h @ €85/h". 144 × 85 = **€12,240**, not €12,400. The displayed amount is €160 higher than the calculation. Same discrepancy propagates to portal/index.html which also states €12,400.

### 16. [HIGH] INV-2026-043 invoice math does not match stated hours × rate
invoices.html lines 600–601: "58h @ €85/h" = €4,930, but displayed amount is **€5,000** — €70 discrepancy.

### 17. [HIGH] Dashboard missing canonical KPI "Team Work Time: 82%"
The canonical data contract specifies: "Team work time: 82%". index.html KPI grid contains: Active Employees 12, Hours This Week 394h, Pending Approvals 12, Billable Hours % 87%, Open Projects 7, Expenses This Month €24,380. There is no "Team Work Time" KPI card. The canonical 82% figure appears only in insights.html, not on the main dashboard.

### 18. [HIGH] Carol Williams current project is inconsistent across 3 pages
- employees.html card (line 1106): data-project = **"Acme Web Redesign"**
- index.html team allocation gantt (line 1314): data-project = **"Umbrella Corp Portal"**
- planning.html allocation table (line 752): **90% on Initech API**, 0% on Acme
Three different pages show three different current projects for Carol Williams.

### 19. [HIGH] Marco Rossi has wrong role in two project detail views
- projects.html (Globex Phase 2 team, line 2494): role = **"DevOps Lead"**
- projects.html (Acme CRM setup team, line 2623): role = **"DevOps Engineer"**
Canonical role is **"Operations Lead"**. "DevOps" is a completely different domain. This affects at least 2 project detail views.

### 20. [HIGH] insights.html AI response says Sarah Chen is on leave — she is not
insights.html line 2005 (AI response): "2 employees are on leave this week (Sarah Chen - annual, Alice Wang)."
Canonical: Sarah Chen is **Online**, 100% work time. Her only leave (leaves.html) is Apr 28-29, which is future/pending. She is not on leave Apr 7–11.

---

## MEDIUM (secondary data inconsistency)

### 21. [MEDIUM] Marco Rossi current project inconsistent within employees.html
employees.html card (line 1178): data-project = **"Acme Web Redesign"**
employees.html org chart (line 1495): data-project = **"Initech Portal"**
Two different projects shown for the same employee on the same page in different view modes.

### 22. [MEDIUM] Lisa Martinez appears in planning.html but does not exist in admin.html or employees.html
planning.html lines 551, 620: "Lisa Martinez — Business Analyst, Operations" as a bench contractor. She appears in NO admin.html user row and NO employees.html card. If she is a contractor and not an employee, she should not appear in allocation planning, or should be marked distinctly as an external contractor not counted in headcount.
Additionally, her `data-worktime="15%"` uses a percent sign in the attribute value — invalid format (should be `data-worktime="15"`).

### 23. [MEDIUM] Carol Williams is called "UX Consultant" in one project detail view — not her canonical role
projects.html Globex Phase 2 detail object (line 2495): `role: 'UX Consultant'`. Canonical: **Design Lead**. No other page uses "UX Consultant."

### 24. [MEDIUM] employees.html org chart missing Marie Dupont — she is in card/table but not in org chart
The org chart root is Alex Morrison (ghost). Marie Dupont (CEO, canonical) appears in the card view and table view but has no node in the org chart. An org chart without the actual CEO is missing a critical node.

### 25. [MEDIUM] leaves.html calendar data contains Maria Rodriguez and James Kim — ghost employees
leaves.html line 2289: `{ name: 'Maria Rodriguez', type: 'wfh', startDay: 15 }`.
leaves.html line 2290: `{ name: 'James Kim', type: 'annual', startDay: 21, endDay: 25 }`.
Neither Maria Rodriguez nor James Kim appears in admin.html (12 users) or employees.html (12 employee cards). They are phantom employees in the leave calendar.

### 26. [MEDIUM] Sarah Chen timesheet persona shows 47h/week avg — inconsistent with canonical 40h
index.html line 913 AI alert: "Sarah Chen has averaged 47h/week for 3 consecutive weeks."
Canonical: Sarah Chen = 34h billable + 6h internal = 40h total. 47h would be extreme overwork not reflected in her 100% work time canonical or any timesheet row.

### 27. [MEDIUM] Alice Wang's canonical weekly work time (45%) contradicts her data-role tag on timesheets
timesheets.html line 1544: Alice Wang hovercard shows `data-role="On Leave Apr 14–18"`. "On Leave Apr 14-18" is her **status**, not her **role**. Her job title (Software Engineer) is missing. Every other employee in that same view shows an actual job title as data-role.

---

## Summary
| Severity | Count |
|----------|-------|
| CRITICAL | 10    |
| HIGH     | 10    |
| MEDIUM   | 7     |
| **Total** | **27** |

**Most systemic issues by impact:**
1. **Alex Morrison ghost CEO** — poisons the org chart, Sarah Chen's profile, and account.html. Three files need surgical fixes.
2. **David Park 45% work time** — appears on 6+ pages, all wrong. Should be 85%. A copy-paste of Alice Wang's value.
3. **Invoice math errors** — INV-2026-048 (€12,240 ≠ €12,400), INV-2026-043 (€4,930 ≠ €5,000), and the portal INV-2026-041 subtotal (€6,833 vs line sum €8,160). These are the kind of discrepancies that destroy client trust instantly.
4. **Yuki Tanaka role mismatch** — employees.html says QA Engineer, admin.html says Software Engineer. A PM editing users in admin.html sees a different person than on the directory page.
5. **INV-2026-052 ghost invoice** — referenced in insights.html AI text and Client Health tab but does not exist in invoices.html. Should be INV-2026-047.
