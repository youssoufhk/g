# CRITIC_DATA.md — Data Consistency Audit
**Auditor:** Claude Opus 4.6 (harsh mode)
**Date:** 2026-04-10
**Scope:** All 19 HTML files in prototype/, plus _shared.js
**Method:** Cross-referenced every name, role, department, work time %, invoice number, client name, and status across all pages against the canonical data contract.

---

## CRITICAL (breaks user trust — contradictory data visible in normal use)

### 1. [CRITICAL] employees.html | Liam O'Brien has WRONG role and WRONG department
In employees.html (both card view line 1270 and table view line 1418), Liam O'Brien is listed as **"Logistics Coordinator"** in **"Operations"** department. Every other page (admin.html:469, projects.html:1452, approvals.html:595, invoices.html:829, portal/index.html:1743) says **"Junior Developer"** in **"Engineering"**. This is a glaring contradiction on the main employee directory page.

### 2. [CRITICAL] employees.html, admin.html, approvals.html | Liam O'Brien work time is inconsistent across 4 different values
- employees.html: **88%** (card + table)
- admin.html:469: **76%**
- projects.html:1452, invoices.html:829: **95%**
- approvals.html:595,817: **88%**
Pick ONE canonical value and use it everywhere. Four different numbers for the same person is unacceptable.

### 3. [CRITICAL] employees.html, admin.html | Sophie Dubois has inconsistent role
- employees.html (card line 1198, table line 1388): **"Operations Manager"**
- admin.html:479, gantt.html:1728, approvals.html:855, projects.html AI insight: **"Business Analyst"**
Two different job titles for the same person. Must pick one.

### 4. [CRITICAL] admin.html, employees.html | Sophie Dubois work time is inconsistent
- employees.html: **82%** (card + table)
- admin.html:479: **84%**
- approvals.html:855: **82%**
Admin page disagrees with every other page.

### 5. [CRITICAL] index.html | Bob Taylor timesheet shows 34h on Globex Phase 2 — contradicts bench status
index.html:973 shows Bob Taylor's pending timesheet as "34h logged - Globex Phase 2 - EUR 2,720." But Bob Taylor is on BENCH with 0% work time — he should not be logging 34h on a client project. Approvals.html:780 correctly shows him at only 8h on Internal. The dashboard widget is wrong.

### 6. [CRITICAL] planning.html, gantt.html | James Wilson has inconsistent role
- planning.html:540: **"DevOps Engineer"**
- gantt.html:1721: **"QA Engineer"**
Two different roles for the same person on two different pages.

### 7. [CRITICAL] insights.html:2002 | INV-2026-041 amount stated as EUR 12,400 — same amount as INV-2026-048
insights.html AI response says "INV-2026-041 (Acme Corp, EUR 12,400) is paid." The invoices.html page (line 612) also shows INV-2026-041 at EUR 12,400. Meanwhile INV-2026-048 is ALSO EUR 12,400 (portal, invoices). Two completely different invoices for different projects (CRM Setup vs Website Redesign) having the exact same amount is suspicious and likely a copy-paste error in the seed data.

### 8. [CRITICAL] Contoso client name is inconsistent across pages
The contract says "pick ONE name." Currently:
- clients.html:552, projects.html (multiple), invoices.html:1015: **"Contoso Inc"**
- insights.html:1234,1668,1715, gantt.html:1725, approvals.html:863: **"Contoso Ltd"**
Two different legal entity suffixes. Must be unified.

---

## HIGH (data contradiction, less immediately visible)

### 9. [HIGH] _shared.js:803 | Notification uses wrong invoice format and wrong currency
_shared.js line 803: `'Invoice #2847 overdue — Acme Corp ($12,400)'`. This notification violates THREE rules: (a) invoice number should be INV-2026-XXX format, not #2847; (b) currency should be EUR/euro, not USD ($); (c) the amount EUR 12,400 matches INV-2026-048 which is "Sent" status not "Overdue."

### 10. [HIGH] leaves.html:664 | Bob Taylor leave calendar dot says "Apr 14-18"
leaves.html line 664 shows a calendar dot with title "Bob Taylor - Apr 14-18". But Apr 14-18 is Alice Wang's leave period. Bob Taylor's leave in calendar.html:1076 is Apr 21-25 (Personal Leave). The tooltip date is wrong.

### 11. [HIGH] leaves.html:2182 | Bob Taylor leave event data has wrong dates
leaves.html line 2182: `{ name: 'Bob Taylor', type: 'annual', startDay: 14, endDay: 18, month: 3 }`. This is April 14-18, which is Alice Wang's leave dates. Bob Taylor's actual leave should be Apr 21-25 per calendar.html. Also type should be 'personal' not 'annual' per calendar.html:1076.

### 12. [HIGH] calendar.html:1071 | Emma Laurent leave Apr 14-18 conflicts with her own page data
calendar.html line 1071: Emma Laurent has "Annual Leave" Apr 14-18. But leaves.html:2180 shows Emma Laurent with "sick leave" on Apr 7-8. The calendar.html notification (line 586) says "Emma Laurent's annual leave (Apr 14-18) starts next week." Meanwhile insights.html:2005 says "2 employees are on leave this week (Sarah Chen - annual, Alice Wang - on leave Apr 14-18)" and does NOT mention Emma being on leave Apr 14-18. If Emma is on leave Apr 14-18, insights.html should mention 3 employees, not 2.

### 13. [HIGH] portal/index.html:1743 | AI says "All members are currently active" — Alice Wang is on leave
portal/index.html line 1743 lists Alice Wang as a team member then says "All members are currently active." Alice Wang is on leave Apr 14-18. This contradicts her canonical status.

### 14. [HIGH] admin.html:511 | Shows "1-10 of 12 users" but only 10 rows, no page 2
The table contains exactly 10 users (SC, JS, AW, MR, CW, BT, LO, SD, DP, EL). Missing: Yuki Tanaka and Marie Dupont (both shown in employees.html). The pagination button for page 2 is disabled (`<button disabled>&raquo;</button>`), so the remaining 2 users are inaccessible.

### 15. [HIGH] admin.html dept headcounts | Engineering=4 but 6 people are in Engineering
Admin.html shows Engineering headcount as 4. But in admin.html's own user table, Engineering has: Sarah Chen, John Smith, Alice Wang, Bob Taylor, Liam O'Brien = 5. And employees.html adds Yuki Tanaka to Engineering = 6. The headcount of 4 is wrong regardless of which source you trust.
- Engineering should be 5 or 6 (not 4)
- Operations=2 (Marco Rossi + Sophie Dubois) -- correct
- Design=2 -- but only Carol Williams is in Design across all pages. Who is the second?
- HR=2 -- but only Emma Laurent is in HR. Who is the second?
- Finance=1 (David Park) -- correct
- Executive=1 (Marie Dupont) -- correct
Sum of displayed headcounts: 4+2+2+1+2+1 = 12. But Engineering is undercounted and Design/HR are overcounted.

---

## MEDIUM (inconsistency in secondary data)

### 16. [MEDIUM] employees.html | Carol Williams data-project says "Acme Web Redesign" but planning.html says she's allocated 90% to Initech API
employees.html card (line 1102) and org chart (line 1542) both say Carol Williams' current project is "Acme Web Redesign." But planning.html:750 shows Carol at 0% on Acme and 90% on Initech API. Either employees.html or planning.html is wrong about her current project.

### 17. [MEDIUM] insights.html:2005 | Says Sarah Chen is on leave this week — no canonical basis
insights.html AI response: "2 employees are on leave this week (Sarah Chen - annual, Alice Wang - on leave Apr 14-18)." Sarah Chen's canonical status is "Online" with 87% work time. She is NOT on leave. Her leave in leaves.html:2179 is Apr 28-29 (future, pending), not this week.

### 18. [MEDIUM] leaves.html:2181,2183,2184 | Calendar events contain unknown employees
The leave calendar JS data includes "Yuki Tanaka", "Maria Rodriguez", and "James Kim." Maria Rodriguez and James Kim do not appear in the 12-employee roster or anywhere else in the prototype. If they are part of the 12, they should be in admin.html and employees.html. If they are not, they should not appear in leave data.

### 19. [MEDIUM] index.html:1088 | Calendar widget shows "Alice Wang OOO" on what appears to be a current-week widget
If the current date is Apr 10, Alice Wang's leave starts Apr 14. Showing her as OOO in the current week's calendar could be misleading depending on which week is displayed.

### 20. [MEDIUM] gantt.html:2284 | Tooltip says "Contoso Deal - Sophie Dubois" but Contoso project detail shows David Park + Marco Rossi
gantt.html:2284 says the Contoso Deal bar belongs to Sophie Dubois. But projects.html:2546-2549 lists only David Park and Marco Rossi on the Contoso Deal project. Sophie Dubois is not in the team array.

### 21. [MEDIUM] projects.html | John Smith has 5+ different role titles across project detail views
- Acme Web Redesign: "Senior Developer" (line 2423)
- Globex Phase 2: "Senior Developer" (line 2458), then "Lead Architect" (line 2488)
- Acme CRM Setup: "Lead Developer" (line 2617)
- Contoso CRM: "Technical Lead" (line 2646)
- Security Audit: "Security Lead" (line 2675)
While project-specific roles can vary, having 5 different titles for the same person undermines the "Senior Developer" canonical role.

---

## Summary
| Severity | Count |
|----------|-------|
| CRITICAL | 8     |
| HIGH     | 7     |
| MEDIUM   | 6     |
| **Total** | **21** |

The most systemic issue is **Liam O'Brien**: wrong role, wrong department, and 4 different work time percentages across the prototype. The second most systemic is **Contoso Inc vs Contoso Ltd** — split across at least 6 files. The Bob Taylor bench contradiction on the dashboard is the most user-visible error.
