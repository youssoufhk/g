# CRITIC: Data Integrity & Cross-Page Consistency

## Verdict: FAIL — Would a real user trust this data? NO

Every named employee has at least one wrong numeric value somewhere in the prototype. Work-time percentages are inconsistent across pages, leave dates are wrong in Approvals, a non-canonical client and a fictional employee appear in AI responses, and two invoices for the same ID carry different amounts across pages. This data layer is not demo-safe.

---

## Critical data violations (wrong numbers, wrong people)

1. **index.html — KPI card label "Billable Hours %" = 87%** — Canonical KPI is "Team Work Time" = 82%, not "Billable Hours %" at 87%. Both the label and the value are wrong.

2. **index.html — Active Employees sub-label reads "7 active · 1 bench · 1 on leave"** — That sums to 9, not 12. With 12 employees on the roster (including Marie Dupont/CEO, Yuki Tanaka, Sophie Dubois, Liam O'Brien), the breakdown is arithmetically impossible.

3. **timesheets.html — John Smith billable hours: "32h billable + 10h internal = 105%"** — Canonical is 40h billable + 5h internal = 112.5%. Wrong on all three figures.

4. **timesheets.html — Carol Williams billable hours: "36h billable + 4h internal"** — Canonical is 38h billable + 2h internal. Both sub-figures wrong (off by 2h each way); total work time (100%) accidentally matches.

5. **timesheets.html — Emma Laurent billable hours: "24h billable + 16h internal = 100%"** — Canonical is 18h billable + 18h internal = 90%. All three figures wrong.

6. **timesheets.html — Marco Rossi billable hours: "40h billable + 4h internal = 110%"** — Canonical is 36h billable + 7h internal = 107.5%. Billable 4h too high, internal 3h too low, percentage wrong.

7. **timesheets.html — David Park billable hours: "30h billable + 5h internal = 87%"** — Canonical is 28h billable + 6h internal = 85%. All three figures wrong.

8. **timesheets.html — Alice Wang timesheet row comment says "38h billable + 2h internal = 95% + 5% = 100%"** — Canonical is 16h billable + 2h internal = 45% work time. Billable hours off by 22h; resulting work-time percentage 100% vs canonical 45%. This is the most extreme individual discrepancy in the prototype.

9. **approvals.html — Alice Wang leave shown as "Annual Leave Apr 28–29"** — Canonical leave is Apr 14–18. This is a completely different date range. The correct Apr 14–18 appears in leaves.html, calendar.html, and gantt.html, making approvals.html the sole outlier.

10. **calendar.html — Emma Laurent assigned "Annual Leave Apr 14–18" (data object line 1091)** — Apr 14–18 is Alice Wang's canonical leave. Emma Laurent has no canonical leave in that period. The calendar adds a spurious EL leave block on the same dates as AW, creating a phantom conflict.

11. **portal/index.html — INV-2026-041 amount shown as "€8,200.00"** — invoices.html shows INV-2026-041 at €9,800 (122h @ €80/h). A €1,600 discrepancy for the same invoice ID across two pages.

12. **portal/index.html — INV-2026-041 project shown as "CRM Integration"** — invoices.html shows "Acme CRM Setup". Different project names for the same invoice on the same screen.

13. **insights.html AI response — mentions "James Wilson (80% free after offboarding task)"** — James Wilson does not exist anywhere in the canonical 12-employee list. A ghost employee appears in an AI-generated data narrative.

14. **insights.html AI response — states "David Park (60% available from Apr 8)"** — Canonical David Park work time is 85%, meaning roughly 15% spare capacity, not 60%. The AI copy directly contradicts the displayed table value.

15. **David Park hovercard data-worktime="45" on every page** — Appears on employees.html, timesheets.html, admin.html, planning.html, and all other hovercards. Canonical work time is 85%. The value 45% is Alice Wang's work time; this looks like a copy-paste error from Alice Wang's card.

16. **Sarah Chen hovercard data-worktime="87" on every page** — Appears on employees.html, admin.html, planning.html, timesheets.html, insights.html. Canonical work time is 100% (34h billable + 6h internal). Should be 100.

17. **John Smith hovercard data-worktime="82" on every page** — Appears on employees.html, timesheets.html, admin.html, planning.html, approvals.html. Canonical work time is 112.5% (overwork). Should be 113 (or flagged overwork).

18. **Emma Laurent hovercard data-worktime="78" on every page** — Appears on admin.html, employees.html, timesheets.html, planning.html, insights.html. Canonical work time is 90%. Should be 90.

19. **Marco Rossi hovercard data-worktime="88" on every page** — Appears on employees.html, timesheets.html, approvals.html, planning.html, insights.html. Canonical work time is 107.5% (overwork). Should be 108.

20. **Carol Williams hovercard data-worktime="90" on every page** — Appears on employees.html, planning.html, insights.html. Canonical work time is 100% (38h billable + 2h internal). Should be 100.

21. **clients.html — "Contoso Inc" appears as a client card** — Canonical client list is: Acme Corp, Globex Corp, Initech, Umbrella Corp. Contoso Inc is not in the canonical list. It also proliferates into projects.html ("Contoso Deal") and planning.html, making it systemic.

22. **timesheets.html — Bob Taylor timesheet shows "8h internal = 20% work time"** — Canonical is 0h / 0% (Bench). The 8h figure is fabricated and contradicts every other page where Bob Taylor shows 0h and 0%.

---

## Cross-page inconsistencies (same entity, different values)

23. **INV-2026-041 amount: €9,800 (invoices.html) vs €8,200 (portal/index.html)** — Same invoice, €1,600 difference. The €8,200 belongs to INV-2026-047 in invoices.html, indicating a row confusion.

24. **Alice Wang leave status: "Pending" (leaves.html team table) vs approved (gantt.html, calendar.html)** — The same leave is simultaneously pending on one page and approved on two others.

25. **Alice Wang leave dates: Apr 14–18 (leaves.html, calendar.html, gantt.html) vs Apr 28–29 (approvals.html item 3)** — Two completely different date ranges for what is supposed to be the same leave request.

26. **Carol Williams work time: 90% (insights.html table, all hovercards) vs 100% (timesheets.html total label)** — Two different values on two pages for the same week.

27. **Emma Laurent work time: 78% (insights.html table, all hovercards) vs 100% (timesheets.html total label) vs 90% (canonical)** — Three different values across three surfaces.

28. **Marco Rossi work time: 88% (all hovercards) vs 110% (timesheets.html badge) vs 107.5% (canonical)** — Three different values.

29. **John Smith work time: 82% (all hovercards) vs 105% (timesheets.html badge) vs 112.5% (canonical)** — Three different values. The most overworked employee's overwork percentage is wrong on every surface.

30. **David Park work time: 45% (all hovercards) vs 87% (timesheets.html displayed) vs 85% (canonical)** — Three different values. The hovercard value (45%) is Alice Wang's, not David Park's.

31. **index.html greeting date static fallback: "Thursday, 10 April 2026"** — JavaScript attempts to override this with the real date, but the static DOM value is Apr 10. If JS fails, users see a stale date. The portal chatbot at lines 1806 and 1808 hardcodes "today (Apr 10)" with no dynamic override at all.

32. **Sarah Chen's nav header role shows "Admin" (account.html, timesheets.html, all nav bars)** — Her job title in account.html Profile tab shows "Project Manager". Two different role identifiers co-exist; "Admin" is an access level, not a job title, but no page disambiguates them.

33. **INV-2026-043 project: "Acme Web Redesign" (invoices.html) vs "Mobile App" (portal/index.html chatbot response)** — The chatbot calls INV-2026-043 the "Mobile App" invoice; the invoices list shows it as Acme Web Redesign. Different project attribution for the same invoice.

---

## Missing canonical data (should appear, doesn't)

34. **Monthly capacity KPI (2,076h) absent from index.html dashboard** — Appears correctly in planning.html but is not one of the six KPI cards on the main dashboard, despite being a canonical KPI.

35. **Team work time KPI (82%) absent as a dedicated dashboard card** — The canonical "Team work time: 82%" is replaced entirely by the non-canonical "Billable Hours %: 87%".

36. **Alice Wang's canonical leave (Apr 14–18) is missing from the approvals queue** — A user reviewing the approvals list sees Apr 28–29, not Apr 14–18. The leave that defines her "On Leave" status across the app cannot be found in approvals.

37. **Sarah Chen correct work time (100%) never displayed anywhere** — Every surface shows 87% via hovercard. The correct figure 100% appears on no page.

38. **John Smith overwork flag (112.5%) never displayed correctly** — timesheets.html shows 105%, hovercards show 82%. The 112.5% canonical value appears on no page.

39. **"Executive" department surfaced as a 7th department** — Marie Dupont (CEO) is assigned data-dept="Executive" in employees.html, yielding 7 departments. Canonical specifies 6 departments with no Executive listed.

---

## Pages with clean data

- **clients.html** — Acme Corp, Globex Corp, Initech, Umbrella Corp spelled correctly; no canonical client name misspellings (Contoso Inc is an unlisted extra, not a misspelling of a canonical client).
- **leaves.html** — Alice Wang Apr 14–18 dates and all related data (5 days, approver Sarah Chen) are internally consistent and match canonical.
- **gantt.html** — Alice Wang leave Apr 14–18 marked correctly and approved; Marco Rossi status "Away" displayed correctly.
- **invoices.html** — INV-2026-048 (€12,400 · Acme Corp), INV-2026-043 (€5,000 · Acme Corp) amounts and clients match canonical; 3-digit invoice suffix format used consistently throughout.
- **portal/index.html** — Outstanding total €17,400 = €12,400 + €5,000 arithmetic is correct; both invoice IDs and the outstanding sum match canonical. (The amount of INV-2026-041 and the hardcoded "Apr 10" date are separate violations noted above.)
