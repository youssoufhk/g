# SELLABILITY_PLAN.md

> **Goal:** make Gamma sell at **€35 / seat / month list price** (annual billed, ex-VAT) to a 200-person EU consulting firm - that is **€420 / seat / year**, roughly **€84k ACV** on the canonical 201-seat buyer. Today's rebased floor is €140-170/seat/year (`docs/GO_TO_MARKET.md §2`). This plan covers the delta.
>
> **Thesis:** at €35/seat, the buyer will not pay for "operations software with AI features". They will pay for an **AI operations analyst that replaces a €70-90k junior hire** and ships governance strong enough to sign a procurement contract. Everything in this plan is subordinate to that single story.
>
> **Session:** 2026-04-18. Canonical sources: `specs/AI_FEATURES.md`, `docs/GO_TO_MARKET.md`, `CRITIC_PLAN.md`, `HAIKU_CRITICS.md`.
>
> **Handoff rule:** every item owns a file pointer and a checkbox. Future agents pick the next unchecked item in priority order and update the **Progress at a glance** block. Do not invent items; if something is ambiguous, ask the founder before building.

---

## 0. Progress at a glance

- Part A (ACV story, the pitch deck): __/6
- Part B (AI agents that replace the junior analyst): __/7
- Part C (Governance + enterprise gate clearance): __/6
- Part D (Trust instrumentation buyers can verify): __/5
- Part E (Sales proof artifacts): __/4
- Part F (Rollout phases): __/4

**Overall: __/32** items. None started at plan creation (2026-04-18).

---

## 1. The gap - why €35/seat is not a stretch IF the story is right

### 1.1 What €35/seat/month buys in the market

| Tool | List €/seat/month | What they sell |
|---|---|---|
| HubSpot Sales Hub Pro | €90 | Pipeline + AI assist for SDR teams |
| Notion Business + AI | €24 | Docs + AI writing + AI Q&A |
| Pleo (expenses) | €14-€25 | Card + expense capture + OCR |
| Float (resource planning) | €7.50 | Capacity planning, non-AI |
| Harvest + Float bundle | €18-€26 | Time + capacity, thin AI |
| Kantata (ex-Mavenlink) | €25-€39 | Full PSA with AI forecasting (enterprise only) |
| **Gamma target (v1.x)** | **€35** | AI operations analyst + full PSA stack + governance |

€35 places us above Kantata mid-tier and below Salesforce Services Cloud. It is defendable **only** if the buyer believes the AI actually replaces a person, and only if the procurement gate is passable. The rest of this plan builds both.

### 1.2 Why the current v1.0 is priced at €140-€170, not €420

Already written up in `docs/GO_TO_MARKET.md §2 ("Why the rebase")`. Short version: **month-end close agent is not yet shipped, SOC 2 / pen-test / escrow are not yet available, multi-rate VAT + SCIM + SAML are deferred.** Until those land, €35/seat is fiction. After they land, it is the natural price.

---

## 2. The sellability thesis - three sentences

1. **Gamma is the AI operations analyst your firm cannot afford to hire.** Every night it audits people, projects, clients, cash, invoices and tells you the top 3-5 things to act on in the morning.
2. **The analyst is real, not a chatbot.** Deterministic Python runs the audits; Gemini ranks and explains; the user confirms and acts. Every tool call is auditable, budget-gated, and killable.
3. **Enterprise procurement says yes because the governance stack is shipped on day one.** SOC 2 Type 2 (Y2), SCIM + SAML (Y1.1), pen-test report (Y1.1), signed DPA, EU data residency, kill-switch console, audit log the customer can export.

Everything in parts A-F below serves one of those three sentences.

---

## A. ACV story - the pitch deck (6 items)

The sales call has to close at €35/seat in one narrative. Each of these items is a deliverable the founder uses to close, not a codebase change.

1. [ ] **A1 - The €70k replacement math.** One slide, one CSV export. Junior operations analyst fully-loaded cost in Paris (~€72k), Lisbon (~€48k), London (~£65k). Show Gamma at €84k ACV covers the French hire and two months of onboarding. File: `docs/sales/REPLACEMENT_MATH.md` + `/public/sales-assets/replacement-math.pdf`.

2. [ ] **A2 - The nightly analyst report (product demo).** One screenshot of the dashboard insight strip the morning after a month-end. 5 cards, each with: (a) deterministic signal in the header, (b) one-paragraph AI explanation, (c) primary action button, (d) "why this card" expansion. Implements `specs/AI_FEATURES.md §6`. Gate: **A8 [CRITIC_PLAN]** ships first.

3. [ ] **A3 - The month-end close agent walkthrough (product demo).** 90-second screen recording on the canonical 201-seat seed data. Start from "close April 2026" click, end at 120 drafts reviewed and 118 approved in under 10 minutes. Script in `docs/sales/CLOSE_AGENT_WALKTHROUGH.md`. Requires **B1** below to be shipped.

4. [ ] **A4 - The procurement pack.** One zip: DPA template, sub-processor list, SOC 2 Type 1 + Type 2 attestation summaries, pen-test exec summary, business continuity statement, incident response runbook excerpt. File: `docs/sales/PROCUREMENT_PACK/`. Gate: **C1-C6** below.

5. [ ] **A5 - ROI calculator (customer-facing).** A single `/roi` page on `gamma.com` that takes seat count + current PSA spend + estimated finance hours/month and shows annual savings vs Gamma ACV. Hard-coded: one junior analyst saved, 8 hours/month of finance saved, expense anomaly catch rate. File: `marketing/roi-calculator/`. Not in `frontend/`; belongs to marketing site.

6. [ ] **A6 - Reference customer case study.** Pilot customer #1, 90-day close-out interview, one-page public case study with attributed quotes + before/after metrics (month-close time, expense catch latency, approval turnaround). File: `docs/sales/CASE_STUDY_001.md`. Gate: requires first pilot to close a month-end.

---

## B. AI agents that earn the €35 price (7 items)

Each of these is one specific agent, each ships as deterministic analyzer + Gemini explainer + confirmation UI. The architecture is locked in `specs/AI_FEATURES.md §1-§3` - **LLM-as-router + deterministic tools**. **No chatbot surfaces. No free-form generation.**

1. [ ] **B1 - Month-end close agent (finish v1.0 scope item).** `specs/APP_BLUEPRINT.md §8.3` + `specs/AI_FEATURES.md §7`. Nightly Celery job builds draft invoices per client from approved timesheets + billable expenses. Gemini ranks + explains each draft (3 sentences + top 3 signals). User reviews queue, confirms per draft. **This is the single biggest lever on €35 seat price.** File: `backend/app/features/invoicing_agent/` (scaffolding exists; analyzer + handler need wiring). Ship target: Phase 3 end.

2. [ ] **B2 - Overwork + PTO sentinel agent.** Nightly analyzer scans 8-week moving average of logged hours / planned capacity per employee. Flags: >110% capacity sustained, zero PTO in 6+ months, 3+ weekend days last month. Gemini writes the card. Dashboard surface + manager notification. File: `backend/app/features/insights/overwork_agent.py` (new). Replaces the "burnout detection" Kantata paid add-on (~€8/seat/month alone).

3. [ ] **B3 - Budget-burn agent.** Weekly analyzer compares timesheets + expenses against project budget + milestones. Flags: projects >80% consumed with <80% of milestones complete, scope creep candidates, at-risk fixed-price engagements. Gemini ranks + explains. Surfaces on `projects/[id]` + insight strip. File: `backend/app/features/insights/burn_agent.py`.

4. [ ] **B4 - Expense anomaly agent.** Nightly analyzer compares each approved expense against peer distribution (same category, same grade, same city/country, last 90 days). Flags >2σ outliers, duplicate receipts, split-receipt patterns. Gemini writes a one-sentence reason per flag. Action: "Review with employee" opens a pre-filled conversation. File: `backend/app/features/insights/expense_anomaly_agent.py`. Lifts prior DEF-039.

5. [ ] **B5 - Overdue cash agent.** Daily analyzer on `invoices` + `accounts_receivable`. Flags: invoices 30+ / 60+ / 90+ days overdue, clients with pattern of late pay, drafts sitting >5 days. Gemini drafts the escalation email (user confirms before send). File: `backend/app/features/insights/overdue_cash_agent.py`. Replaces a reminder-automation SKU (Chaser ~€6/seat/month).

6. [ ] **B6 - Approvals autopilot (safe scope).** Analyzer ranks each pending approval by risk (amount vs policy, project budget, requester history). Below threshold + matches policy + no conflicts → the agent pre-approves; manager sees "15 approved by Gamma, 3 need your attention" instead of 18 raw rows. Manager veto is one click with reason captured in audit. File: `backend/app/features/approvals/autopilot.py`. Gate: legal/founder review before shipping. Reverses prior deferral with explicit scope.

7. [ ] **B7 - Staffing recommender (weekly agent).** Weekly analyzer builds a capacity + pipeline heatmap per team. Gemini ranks: who is under-allocated for next 2 weeks, which incoming projects risk overrunning, which employees are a good fit for which project (skills + contribution + client history). Planner confirms allocations. File: `backend/app/features/insights/staffing_agent.py`. Lifts prior DEF-042.

**Shared architecture for B2-B7:**

- Each agent is a pair: `<agent>_analyzer.py` (deterministic SQL + Python, returns signals) + a single call to `explain_signals(signals, context)` via the LLM-as-router (no free-form generation).
- Each agent writes to `public.insights` with `(type, severity, signals_json, explanation, dismissed_at, acted_on_at)`.
- Every agent is killable per tenant via `kill_switch.ai_<agent_name>` (extends `kill_switches` table).
- Every agent is budget-gated - analyzer runs even when LLM is off; explanation falls back to "signals only, AI paused".
- Every agent's output is PII-stripped per the metatest in `backend/tests/test_feature_registry.py`.
- Every agent has a golden-example eval suite in `backend/app/ai/evals/<agent>/` that blocks merge on regression.

---

## C. Governance - clearing the procurement gate (6 items)

No €35/seat deal closes in EU consulting without these. Each item is the gate for the Year-2 step-up in `docs/GO_TO_MARKET.md §2`.

1. [ ] **C1 - SOC 2 Type 1 audit report.** 3-month observation window, auditor engaged by Phase 5. Control inventory already sketched in `docs/COMPLIANCE.md`. Deliverable: auditor letter + bridge letter.

2. [ ] **C2 - SOC 2 Type 2 audit report.** 6-month observation window, starts immediately after Type 1 issuance. Gate for Year-2 renewal step-up.

3. [ ] **C3 - SCIM 2.0 + SAML 2.0.** Lift from `docs/DEFERRED_DECISIONS.md` DEF-024 + DEF-025 into Tier 1.1. Must pass Okta + Azure AD + Google Workspace test suites. File: `backend/app/features/auth/scim/` + `backend/app/features/auth/saml/`.

4. [ ] **C4 - Independent pen-test (OWASP ASVS Level 2).** Third-party test vendor (lift DEF-077). Executive summary publicly shareable, detailed report NDA-gated. Must clear critical + high findings before first enterprise contract.

5. [ ] **C5 - Source-code escrow.** Lift DEF-076. Iron Mountain or equivalent. Document in `docs/COMPLIANCE.md §escrow`. Gate: one enterprise attach.

6. [ ] **C6 - Multi-rate VAT + reverse-charge full matrix.** Lift DEF-007 into Tier 1.1. Ship: standard rates per EU country, reduced rates for B2B goods/services categories, EU intra-community reverse-charge legal mention per invoice, UK post-Brexit handling. File: `backend/app/features/invoices/vat/`. Gate: one UK customer (HSBC in canonical seed) closes.

---

## D. Trust instrumentation - things the buyer can verify themselves (5 items)

The buyer at €35/seat does not just read the SOC 2 report - they poke the product until they believe it. Each of these is built into the app itself.

1. [ ] **D1 - AI events audit log (customer-visible).** Every tool call, every OCR extraction, every agent run writes to `public.ai_events` with tenant_id, user_id, tool_name, input hash, output hash, cost_cents, latency_ms, model_id, prompt_version. A new `/admin/ai-activity` page in the app exports the log as CSV. File: `backend/app/features/admin/ai_activity_routes.py` + `frontend/app/[locale]/(app)/admin/ai-activity/`. Gate: required for any enterprise attach.

2. [ ] **D2 - AI kill-switch console.** `/admin/flags` already has a toggle surface. Extend with per-agent switches (ai, ai_ocr, ai_palette, ai_insights, ai_close_agent, ai_overwork, ai_expense_anomaly, ai_overdue, ai_approvals_autopilot, ai_staffing) + a "pause all AI now" master switch. Document behavior in `docs/DEGRADED_MODE.md`. File: `frontend/app/[locale]/(app)/admin/flags/` (exists) + backend table extension.

3. [ ] **D3 - AI budget console.** Per-tenant daily / monthly cap, per-agent sub-cap. UI shows: spent this month, projected vs cap, rolling average cost per seat. File: `frontend/app/[locale]/(app)/admin/ai-budget/` + `backend/app/features/admin/budget_routes.py`. Backend already emits budget numbers to Cloud Monitoring.

4. [ ] **D4 - Data-subject export + delete.** Article 15 + 17 GDPR. One click in `/account/privacy` gives the user a zip of everything Gamma stores about them; another click deletes on a 30-day-clock with audit. File: `backend/app/features/auth/gdpr_routes.py` + `frontend/app/[locale]/(app)/account/privacy/`.

5. [ ] **D5 - AI transparency chip on every explanation.** Every card written by Gemini shows: model ID, prompt version, inputs used (expandable), signals used (expandable), cost in cents, latency, "why this card" button. Shared component: `components/patterns/ai-transparency-chip.tsx`. Gate: required before shipping B1-B7. Partial match with **CRITIC_PLAN.md A8** - this subsumes and extends it.

---

## E. Sales proof artifacts (4 items)

What we use to open the door, not to close it.

1. [ ] **E1 - The "90-day replacement" pilot metrics sheet.** Published at `gamma.com/proof`. Three metrics per pilot, standardized: (a) month-end close time before/after, (b) median expense-to-flag latency before/after, (c) overdue invoices by age bracket before/after. Customer logos gated on consent. File: `marketing/proof/`.

2. [ ] **E2 - The AI safety statement.** One-page document: what the AI can do, what it cannot do, every safety control in place. Published at `gamma.com/ai-safety`. Human-written, reviewed by founder + external security advisor. File: `docs/sales/AI_SAFETY_STATEMENT.md`.

3. [ ] **E3 - The "vs Kantata" comparison grid.** Honest side-by-side: PSA coverage, pricing, EU data residency, AI agents (deterministic analyzer-backed vs narrative-only), governance (SOC 2 timeline, SCIM/SAML). File: `docs/sales/COMPARISON_KANTATA.md`. Refresh quarterly.

4. [ ] **E4 - The Flawless Gate badge.** On `gamma.com/quality` publish the unified 70-item gate from `docs/FLAWLESS_GATE.md` as a live dashboard - which items are green, which are yellow, which need founder decision. Honesty beats polish here; procurement buyers reward visible discipline.

---

## F. Rollout phases (4 items)

Aligned with `THE_PLAN.md` weeks, not new scope.

1. [ ] **F1 - Phase 2 (current) - Finish the floor: CRITIC_PLAN.md closure.** All 35 in-session items in `CRITIC_PLAN.md` shipped. That is what gets us to the €140-170 v1.0 floor with a straight face. **Status as of 2026-04-18: 20/35.**

2. [ ] **F2 - Phase 3 - Ship B1 (close agent) + D1 + D2 + D3 + D5.** These four together unlock the "real AI analyst" pitch and let the first pilot customer trust us with their close. Price step: €200/seat/year mid-band. Target end of Phase 3 per `THE_PLAN.md`.

3. [ ] **F3 - Phase 4 - Ship B2 + B3 + B4 + B5 + C1 + C3 + C6.** Four more agents, Type 1 audit in, SCIM/SAML, multi-rate VAT. This is the procurement-ready bundle. Price step: €280/seat/year band. Target end of Phase 4.

4. [ ] **F4 - Phase 5 - Ship B6 + B7 + C2 + C4 + C5 + E1-E4.** Autopilot + staffing recommender, Type 2 + pen-test + escrow, full sales proof. Price step: **€420/seat/year list (= €35/seat/month)**. This is the target. Target end of Phase 5.

---

## 3. How we know it is working (KPIs)

Track weekly against the SELLABILITY thesis, not against vanity metrics.

| KPI | Target after F4 | Measurement |
|---|---|---|
| Pilot → annual conversion | ≥60% | `billing.pilot_conversions` |
| Time from demo to PO (median) | ≤21 days | CRM |
| Month-end close time at customer (median) | ≤90 min | `invoicing_agent.run_duration_seconds` p50 |
| Expense-to-flag latency (median) | ≤24 h | `expense_anomaly_agent.first_flag_at` minus `expense.submitted_at` |
| AI kill-switch trigger incidents | 0 unplanned | `kill_switch.ai.*` history |
| Customer-reported AI hallucinations | <1/month per 100 seats | `ai_events.flagged_by_user` |
| NPS at month 6 | ≥50 | survey |
| Renewal uplift YoY | ≥20% | `billing.renewal_revenue` |

If we miss three in a row, stop shipping new agents and fix the underlying trust gap before pushing price.

---

## 4. What this plan is NOT

- **Not a chatbot.** No free-text Q&A. Every AI surface is a tool call or an analyzer + ranker + explainer. See `specs/AI_FEATURES.md §1`.
- **Not "AI everywhere".** If an agent does not save ≥1 hour per week per seat at a 200-seat firm, it does not ship.
- **Not a Workday / Kantata competitor on feature count.** It is a narrower product, better at exactly the operational loop a 50-500 consulting firm runs.
- **Not a pricing-first plan.** Pricing follows shipped value. If F4 items slip, the price holds at F3 level until they land.

---

## 5. Reference to other plans

- `CRITIC_PLAN.md` - 35-item craft + UX closure for v1.0. Gate for F1.
- `HAIKU_CRITICS.md` - secondary critic audit; cross-check before each phase.
- `specs/AI_FEATURES.md` - architecture for all AI surfaces. **Do not diverge.**
- `docs/GO_TO_MARKET.md` - current published pricing + year-2 step-up trigger list.
- `docs/FLAWLESS_GATE.md` - the 70-item quality bar every feature passes before ship.
- `docs/DEFERRED_DECISIONS.md` - DEF registry. Every "lift X into Tier 1.1" above is one of those entries.

---

## 6. Execution log

- **2026-04-18** - plan created, HEAD after commit `e73d025`. No items started. Founder asked for "AI-first plan to make the app sell for €35/user". Plan pivots off existing rebased pricing in `docs/GO_TO_MARKET.md §2` and the 4-surface AI locked scope in `specs/AI_FEATURES.md §2` - **extends the AI surface from 4 to 11 (4 existing + 7 new agents) and adds a 6-item procurement gate + a 5-item trust instrumentation pack + a 4-item sales proof pack.** Path back to €35/seat is staged in F2-F4 with explicit price bands per phase, not in one bet.

---

Next agents: pick the next unchecked item in this order: **F1 → F2 → F3 → F4**, and within each phase **A before B before C before D before E**. Update §0 progress block each commit. Never skip the trust layer - shipping a new agent without its D5 transparency chip is a regression.
