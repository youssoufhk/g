# GammaHR v2 — Honest Review Verdict

## The One-Paragraph Verdict

GammaHR v2 is a visually credible prototype that could pass a 15-minute executive walkthrough — if you control every click. The moment a prospect deviates from the scripted path, the cracks become craters: a ghost employee ("James Wilson") appears in AI responses, the two overworked employees that define the product's core value proposition are shown as healthy at 82% and 88%, a phantom fifth client ("Contoso Inc") appears throughout, the most important page (hr.html) is mostly toast notifications, and the same invoice shows two different amounts on two different screens. At €50/user/month you are competing against BambooHR, HiBob, and Factorial — products where data is consistent and core workflows complete. Right now, GammaHR v2 does not justify that price tier. The visual shell is strong enough to fund the next development pass, but it is not stakeholder-demo-safe as-is.

---

## What this prototype does GENUINELY well

1. **Expense submission is end-to-end.** Form validation, AI receipt scan simulation, billable/non-billable toggle, new item rendered in the live list with correct icon and amount, stat card updated, toast confirmation. This is the single workflow a prospect can try unscripted without embarrassment.

2. **Leave request modal is above prototype fidelity.** Working-day calculation, half-day toggle, balance deduction that updates live on the card, date conflict detection, and a cancellation confirmation dialog. A buyer watching this demo sees a real product.

3. **Timesheet inline grid editing works correctly.** Click a cell, type, Tab/Enter/Escape all behave as expected. Approval queue with reject-with-reason modal functions. Monthly heatmap is visually distinctive.

4. **Approval queue with AI recommendation banner is a genuine differentiator.** Multi-type unified queue (timesheets, leaves, expenses, invoices), bulk-approve, reject-with-reason modal, and the AI "pre-screen" banner — this is exactly the kind of feature that wins deals in agency HR. It works.

5. **Command palette (⌘K) and role switcher work correctly.** A buyer who hits ⌘K during a demo gets a polished fuzzy-search experience. The role switcher that gates UI elements behind `data-min-role` is a strong live demo moment that most competitors can't match.

6. **Employee hover cards are a premium detail.** Smooth, correctly positioned, show real data, close properly. Rare to see this level of finish in a prototype.

7. **Auth/onboarding wizard is complete.** Four-step company setup, three-step employee onboarding with password strength meter, MFA TOTP simulation. This flow impresses in "how do I get started?" demos.

8. **Visual design system is consistent and professional.** Design token architecture, component library, dark/light theme switching, and responsive grid are all coherent. The app looks like a funded product, not a prototype.

---

## The 5 things that would kill a sale

**1. The overwork narrative — the product's core value prop — is invisible.**
John Smith is defined as 112.5% overworked and Marco Rossi at 107.5%. Every single surface in the prototype shows John at 82% and Marco at 88% — healthy numbers. No bars turn amber. No alert fires. A prospect who came specifically to see "detect overwork before burnout" leaves having seen nothing of the kind.

**2. The data is not internally consistent — at all.**
The same invoice (INV-2026-041) shows €9,800 on invoices.html and €8,200 on the client portal. Alice Wang's leave appears as Apr 14–18 on three pages and Apr 28–29 on approvals.html. David Park's work-time hovercard shows 45% (Alice Wang's value, copy-pasted in error) while his timesheet shows 87% and canonical is 85%. Three different values for the same person on three screens.

**3. hr.html — the most complex and impressive-looking page — barely functions.**
The Kanban pipeline shows 47 candidates in the header but renders 12 cards. Clicking a candidate fires a toast. "Start Onboarding" fires a toast. Drag-and-drop on Kanban cards has `draggable="true"` but zero drag event handlers. For an HR product, the HR page being a shell is fatal.

**4. A phantom client and a ghost employee are embedded in the data.**
"Contoso Inc" — not in the canonical four-client list — appears as a client card, an overdue invoice, a project, a planning column, and in the insights revenue chart. "James Wilson" — not in the 12-employee roster — appears in the Gantt and in AI query responses. Any prospect who has read the product brief will catch both immediately.

**5. Core workflow completions are fake.**
"Generate Invoice from Timesheets" fires a toast; the invoice table does not gain a row. "Create Project" fires a success toast; the project list does not update. The client portal navigation tabs have no JavaScript handlers — the portal is a single static screen regardless of which tab you click.

---

## The 10 issues to send to the dev team

| # | Issue | Why it matters | File(s) to fix |
|---|-------|---------------|----------------|
| 1 | All work-time percentages wrong across the prototype — John (112.5% → 82%), Marco (107.5% → 88%), Sarah (100% → 87%), Emma (90% → 78%), David (85% → 45%), Carol (100% → 90%) | Core value prop shows zero overworked employees | `_shared.js`, `employees.html`, `timesheets.html`, `insights.html`, `planning.html`, `gantt.html`, `admin.html` |
| 2 | "Contoso Inc" phantom client must be purged — client card, all invoice rows, "Contoso Deal" project, planning column, insights revenue entry | Phantom client breaks canonical data story | `clients.html`, `invoices.html`, `projects.html`, `planning.html`, `gantt.html`, `insights.html` |
| 3 | hr.html candidate slide panel must be built — replace toast-on-click with a real drawer: name, role, AI fit score, resume link, notes, stage-move | HR pipeline is purely decorative | `hr.html` |
| 4 | hr.html Kanban card counts must match rendered cards (47 header vs 12 rendered) | First thing any PM will notice; destroys trust in the data model | `hr.html` |
| 5 | Cross-page data discrepancies: INV-2026-041 amount (€9,800 vs €8,200), Alice Wang leave dates (Apr 14–18 vs Apr 28–29 on approvals.html), David Park hovercard (45% → 85%) | Any prospect who opens two tabs has grounds for immediate distrust | `portal/index.html`, `approvals.html`, `_shared.js` |
| 6 | "Create Project" and "Generate Invoice" flows must append a visible result — a new row/card — not just a toast | Scripted demo steps that produce no visible result are worse than no flow | `projects.html`, `timesheets.html` |
| 7 | Gantt zoom buttons and filter dropdowns must actually function | The Gantt is the visual centrepiece of the capacity story; broken zoom is the first thing a PM tests | `gantt.html` |
| 8 | Client portal tab navigation must function — tab click must swap the visible section | The portal cannot be demoed as an enterprise differentiator if it cannot navigate | `portal/index.html` |
| 9 | "James Wilson" ghost employee must be replaced with "Liam O'Brien" in Gantt data array and AI insights canned responses | Ghost employee in AI responses destroys the AI credibility story | `gantt.html`, `insights.html` |
| 10 | Dashboard KPI card "Billable Hours % 87%" must become "Team Work Time 82%"; add "Monthly Capacity 2,076h"; fix Active Employees sub-label arithmetic (sums to 9, not 12) | The first screen a prospect sees has the wrong KPI label, wrong value, and an arithmetic error | `index.html` |

---

## Quality tier assessment

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Visual design | 8/10 | Consistent design token system, polished components, distinctive heatmaps. Loses 2 for untested mobile breakpoints and prototype-visible inline styles on leaves quarter view. |
| Interaction quality | 5/10 | Expense/leave/timesheet/approvals flows are genuinely complete. But 11 dead buttons, 6 broken modal confirm flows, and a non-navigable client portal drag the score down. |
| Data coherence | 2/10 | 39 distinct data violations: wrong work-time values on every named employee, same invoice two different amounts, same leave two different dates, ghost employee in AI responses, phantom client throughout. |
| Feature completeness | 4/10 | 50 spec violations (10 critical, 20 high, 20 medium). Core flows are stubs. Gantt drag is CSS-only. |
| Mobile readiness | 3/10 | Gantt, Kanban, timesheet grid, and planning matrix are all fixed-width and unusable on phone. Pagination touch targets miss 44px minimum on every page. |
| Demo confidence | 4/10 | A controlled 20-minute demo covering expenses → leave → timesheets → approvals → auth is defensible. Any deviation fails live. |

---

## Final verdict

**NOT READY**

The prototype is not safe for a stakeholder demo with a sophisticated buyer. It is safe for an internal alignment meeting where the audience has been briefed on prototype limitations.

### Minimum work to reach READY FOR STAKEHOLDER DEMO

Estimated scope: 2–3 focused engineering days.

1. Fix all work-time percentages in `_shared.js` and every consuming page. John and Marco must show overwork (>100%) with amber bar fills.
2. Purge Contoso Inc everywhere and replace with Umbrella Corp across six files.
3. Build a minimal hr.html candidate slide panel — a right-side drawer replacing the toast-on-click.
4. Fix the five most egregious cross-page data discrepancies (INV-2026-041 amount, Alice Wang leave dates in approvals, David Park hovercard, dashboard KPI label, Active Employees arithmetic).
5. Make "Create Project" and "Generate Invoice" append a visible row — even hardcoded.
6. Fix client portal tab navigation — approximately 20 lines of JavaScript.
7. Replace "James Wilson" with "Liam O'Brien" in the Gantt data array and AI insights canned response.

These seven items directly address the five sale-killing failures. Everything else in the issue backlog can follow in the next sprint. With these fixes in place, a controlled demo becomes defensible. Without them, any technically literate buyer will walk.
