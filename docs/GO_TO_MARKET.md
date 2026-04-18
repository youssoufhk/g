# GO TO MARKET

> Commercial plan. Most numbers below are **targets / TBD** until we have real customer conversations. Do not treat as facts.
> Timeline week numbers live only in `THE_PLAN.md`.
> **Last updated:** 2026-04-15 (worked pricing example added, Stripe-only language replaced with the DEF-029 candidate set, validated lead gate cross-referenced).

---

## 1. Positioning

- **Category:** AI operations analyst for consulting firms and agencies.
- **Sweet spot:** 50 to 500 employees, time-and-materials billing, multi-client.
- **One-liner:** Gamma is the AI operations analyst your firm cannot afford to hire. It runs a continuous audit across your people, projects, clients, and cash, and tells you what to act on every day.
- **What this actually means:** every night Gamma runs dozens of deterministic checks across your firm (who is overworked, who has not taken PTO, which projects are over budget, which clients are overdue, which expenses are outliers, which invoices are ready for month-end close). Gemini ranks the top 3-5 findings by importance and writes a one-paragraph explanation per card. You scan the queue each morning and act. No human analyst does this proactively today because no firm can afford one.
- **Differentiator:** Flagship-quality UX + a continuous AI audit across every operational dimension + one design language. Two founders from day 0. Not a SQL wrapper, not a chatbot, not a generic HR tool.
- **Demonstrable value (measurable, provable):** Gamma customers close the month in 1 hour instead of 2 days. Gamma customers catch outlier expenses within 24 hours instead of at quarter-end. Gamma customers spot overwork before it becomes burnout. These are the numbers you quote on a sales call.
- **Not for:** tiny teams (use Notion), payroll-first buyers (use Gusto), enterprises >500 seats (use Workday or Kantata).

---

## 2. Pricing (pilot + per-seat annual, rebased 2026-04-18)

**Two-stage pricing.** A fixed-price pilot buys trust; per-seat annual buys the year. Seat = active user in last 30 days. Reference users who appear in data but never log in are NOT billable. Prices are ex-VAT, EUR only (multi-currency subscription billing deferred, DEF-030).

The prior rate card (€35/€26 per seat/month, €70,260 ACV for the canonical buyer) was rebased on 2026-04-18 after the COO/CFO teardown in `OPUS_CRITICS_V2.md §15`. The old number assumed value that had not shipped (month-end close agent, SOC 2 Type 2, SCIM, multi-rate VAT). The rebased bar reflects what the canonical 200-person EU consulting buyer would actually pay at v1.0 quality, with an explicit path to the premium number once the audit + enterprise-tier items land.

### Published list pricing

| Stage | Price | What it buys |
|---|---:|---|
| **Pilot** | **€8,000 flat** | 10-seat / 90-day pilot. Real data, real users, no production commitment. Pilot contract names the success criteria and either converts to an annual contract or closes out with the founder's help. No auto-conversion. |
| **Annual (year 1)** | **€140 - €170 / seat / year** | Per-seat list price, ex-VAT, EUR. Band depends on seat count and enterprise feature attach. Canonical 201-seat buyer lands in the €28k - €34k ACV range. |
| **Annual renewal** | negotiated | Year 2 pricing is set at the v1.0 renewal; no published number. |
| **Enterprise attach** | custom | Optional adds on top of annual: dedicated Technical Account Manager (DEF-078), third-party penetration test report (DEF-077), source-code escrow (DEF-076), uptime SLA, negotiated DPA. |

### Why the rebase

1. **The month-end close agent is not yet shipped.** The prior ACV priced in its value; until the agent is real on the buyer's data, the premium is fiction. Repricing to €140-€170/seat is the honest v1.0 bar.
2. **SOC 2 Type 2 + pen-test report + escrow are enterprise-procurement gates.** A 200-person EU buyer signs a €70k contract only after those three clear. None ship in v1.0. They are the trigger for a renewal price step-up (see "Year 2 step-up" below).
3. **Pilot price anchors on procurement-negligible.** €8k sits below the typical €10k sign-off ceiling for a COO without finance / legal sign-off. It buys a 90-day window to demonstrate the close agent and to de-risk renewal economics.

### What's in the plan

| Plan | Includes |
|---|---|
| **Gamma (pilot + annual)** | All Tier 1 features: time, clients, projects, invoices, expenses, leaves, approvals, admin, account, dashboard. Shell infrastructure: Cmd+K AI palette, notifications, conflict resolver, entitlement lock. AI surfaces: palette + receipt OCR + insight cards + **month-end close agent** (drafts monthly invoices from approved timesheets and expenses, user confirms). PWA with offline timesheets. Priority email support. SCIM + SAML + multi-rate VAT land in v1.1 (committed, see `docs/SCOPE.md` Tier 1.1). |
| **Enterprise attach** | Dedicated Technical Account Manager (DEF-078), pen-test report (DEF-077), source-code escrow (DEF-076), uptime SLA, negotiated DPA, early access to v1.1 agentic features (predictive staffing, auto-timesheet drafting). |

### Year 2 step-up

The €140-€170 band is the v1.0 floor. Renewal pricing lifts to the €170-€220 band once all three of the following clear:
1. SOC 2 Type 2 audit report available (≥6-month observation window complete).
2. SCIM + SAML + multi-rate VAT in production (lifted from DEF-024, DEF-025, DEF-007 into Tier 1.1).
3. Month-end close agent has run for ≥3 monthly closes at the customer and the customer has confirmed it in writing.

This is the honest path back toward the original premium number. It is gated on shipped value, not on positioning.

### Monthly vs annual

**Annual only in v1.0.** Pays ~10 months for 12 (~15% effective discount). Monthly billing is deferred (new DEF entry; ship when customer 6+ asks and the Stripe/Revolut integration lands). No multi-year contracts in v1.0 (DEF-031). No refunds on annual except within the first 14 days (trial window).

### Currency and VAT

All prices ex-VAT, EUR only. Multi-currency subscription billing (GBP, USD) deferred (DEF-030). EU intra-community B2B invoices emit zero-VAT lines with the reverse-charge legal mention. Multi-rate VAT (prior DEF-007) is committed to Tier 1.1; v1.0 still ships single-rate + reverse-charge. Non-EU billing not in v1.0 scope.

### Grandfathered pricing for pilots

First 5 paying customers that convert from the €8k pilot to annual get grandfathered at their pilot-year rate card for 3 years, regardless of seat count growth. Written into their custom contract.

### Worked example: the canonical first customer

The canonical first customer in `CLAUDE.md` and `specs/DATA_ARCHITECTURE.md` section 12.10 has 201 employees, all active in the canonical seed, so seat count for billing is **201**.

| Stage | Seats | Price | **Total (year 1)** |
|---|---:|---|---:|
| Pilot (90 days, 10 seats) | 10 | €8,000 flat | **€8,000** |
| Annual conversion (remaining 275 days) | 201 | €140/seat/yr (floor) | **€28,140** |
| Annual conversion (remaining 275 days) | 201 | €170/seat/yr (ceiling) | **€34,170** |

The pilot fee is **not** credited against the annual. Pilot buys trust; annual buys the year.

**This is the number to quote off in any sales call.** Do not re-derive it under pressure. Year 2 step-up is a separate conversation, gated on the three criteria above.

---

## 3. Target customer profile

- Consulting firm or agency
- Based in FR / CH / BE / LU / DE (founder geography)
- 50-300 employees currently
- Using Excel + BambooHR, or Personio, or Tempo + Jira, or Harvest + something, or Kantata/Mavenlink (too expensive, too ugly)
- Pain point: 10+ hours per week of manager time on approvals and rebalancing

---

## 4. Pipeline stages

| Stage | Definition |
|-------|------------|
| Curious | Aware of Gamma, saw a demo video |
| Interested | 30-min discovery call done, pain confirmed |
| Evaluating | Pilot kicked off with real data |
| Committed | Signed annual contract |
| Live | Production use |

**Targets (TBD, based on no data):** 10 firms at Interested by week 20. 3-5 at Committed by week 40.

---

## 5. Outreach playbook

- LinkedIn direct outreach to HR ops leads and COOs
- Founder-led 30-minute demos with real customer data imported ahead of time
- Warm intros from each customer to two more
- Product Hunt launch only after 3 paying customers
- No cold email blasts

---

## 6. Pilot program

- 60-day pilot at no cost
- Founder-led onboarding (we do the import)
- Weekly check-ins (budget: 5 hours/week of founder time for 5 pilots)
- Day 45: commit conversation
- Day 60: sign annual or offboard cleanly (export zip, delete tenant)

**Success per pilot:**
- >= 70% of employees submit at least one timesheet
- At least one manager approves an expense with OCR
- At least one invoice generated from approved timesheets
- Founder records a 15-min customer interview

---

## 7. Billing infrastructure

**Two-phase approach:**

**Phase 2 (customers 1-5):** manual PDF invoicing.
- Founder creates `public.subscription_invoices` rows in the operator console
- WeasyPrint renders the PDF
- Workspace SMTP Relay sends the PDF to the customer's billing email
- Customer pays via wire transfer or SEPA Direct Debit
- Founder marks paid in the operator console
- Zero Stripe integration, zero webhook handling, zero self-serve billing portal. Admin console has view-only billing status.
- 1 hour per new invoice is an acceptable founder time cost at this stage.

**Note:** Phase 2 invoicing is manual but the **month-end close agent is v1.0 scope** (see `specs/AI_FEATURES.md` §2 and `specs/APP_BLUEPRINT.md` §8 month-end close). The agent drafts invoices and presents a review queue; the founder still manually confirms and sends for customers 1-5 via WeasyPrint + Workspace SMTP Relay until DEF-029 payment processor ships.

**Phase 5+ (customer #6+):** migrate to an automated payment processor.
- Leading candidate: **Revolut Business Merchant Acquiring** (founder has existing banking relationship, lower fees on EU cards, BUT Revolut lacks a full subscription product so requires custom subscription logic or a thin wrapper)
- Alternative: **Stripe Billing** (full subscription product, more expensive per-transaction fees, requires OSS VAT registration)
- Alternative: **Paddle** (merchant-of-record, ~5% fees, eliminates EU VAT handling entirely, best for founder wanting zero accounting operations burden)
- Final choice deferred to DEF-029 implementation time
- Existing Phase 2 customers are grandfathered or migrated at that time

**Dunning (at automation time):** Stripe/Revolut webhook `invoice.payment_failed` triggers Gamma's own branded emails via Workspace SMTP Relay. Three-email escalation (day 1, 7, 14). Templates part of the Phase 2 email template set.

**Self-serve billing portal** in Admin console is deferred (DEF-059) until after DEF-028 (self-serve signup) and DEF-029 (payment processor integration) ship.

Target go-live for automated billing: per the target weeks in `THE_PLAN.md`, when customer #5-10 signs OR manual billing exceeds 2 hours/week.

---

## 8. Support + success

- Email support `support@gammahr.com`, 1 business day response
- In-app feedback button routes to founder
- Shared Slack channel with each pilot customer
- Public docs site (Mintlify or similar)
- Video tutorials: onboarding, timesheet, expense, invoice

**SLA target (Scale tier, TBD):** 99.9% uptime, 4-hour response on critical issues.

---

## 9. Landing page sections

1. Hero: one-liner + screenshot + "Book a demo"
2. Problem: the 10 hours of manager busywork
3. Solution: 5 flagship features with screenshots
4. AI showcase
5. Built for consulting firms
6. Security + compliance highlights
7. Pricing
8. FAQ
9. Final CTA

Built in Framer or Next.js. Same design tokens as the app.

---

## 10. Launch checklist

- [ ] All Tier 1 features pass the flawless gate
- [ ] First-contact UX hardenings live (bulk row actions, global non-AI search, in-app feedback button, notifications inbox page) per `docs/SCOPE.md`
- [ ] Onboarding wizard tested with customer's real data
- [ ] **Month-end close agent shipped and tested** end-to-end (drafts monthly invoices from approved timesheets and expenses, founder confirms in review queue)
- [ ] **Manual invoicing path live** (Phase 2 path: founder confirms agent-drafted `subscription_invoices`, WeasyPrint renders, Workspace SMTP Relay sends, customer pays via wire/SEPA, founder marks paid in operator console). Automated payment processor is post-launch (DEF-029, evaluated at customer #5-10 trigger).
- [ ] **Magic pricing set at €35 / €26 / custom** and published on the landing page pricing section
- [ ] **Two founders in place day 0** with 4-year vesting + 1-year cliff documented in the Global Gamma Ltd (UK) cap table
- [ ] **SOC 2 Type 1 audit window targeted at customer 3-4** (was customer 5); vendor selected and kickoff booked
- [ ] ToS + Privacy + DPA published
- [ ] Security whitepaper drafted
- [ ] Support email + docs live
- [ ] Backup + restore drilled
- [ ] Audit log archival pipeline live (weekly Celery export of >90-day partitions to GCS Cold Line, per `THE_PLAN.md` Phase 7 task 9)
- [ ] Monitoring + alerting live
- [ ] Public status page (`status.gammahr.com`) live (DEF-016 trigger fires here)
- [ ] Incident response runbook drafted (`docs/ROLLBACK_RUNBOOK.md`)
- [ ] Validated lead gate cleared (per `THE_PLAN.md` "Validated lead gate" section, before Phase 4 entry; this is a prerequisite, not a launch task)

---

## 11. Risks

| Risk | Mitigation |
|------|-----------|
| First customer churns after 30 days | 60-day pilot, weekly check-ins, founder-led onboarding |
| CSV imports fail on their data shape | AI mapper + manual mapper + test with real data before pilot |
| AI feature failure embarrasses us | Kill switches, non-AI fallback, conservative thresholds |
| GDPR gap | DPA ready, right-of-access endpoint, deletion tested |
| Pricing too high | Grandfathered pricing for first 5, ongoing interviews |
| Feature-request firehose | Hard scope doc, monthly review |
| Co-founder departure | 4-year vesting with 1-year cliff; legal entity Global Gamma Ltd (UK) owns all IP; founder has admin lock-out for ops console. |

---

## 12. v1.0 success definition

- 1 paying customer at annual price
- At least 10 firms at Interested stage
- No P0 bugs in production for 30 consecutive days
- Customer advocate willing to give a testimonial
- Founder comfortable taking a week off without everything breaking

---

## 12. Pre-customer-2 measurement checklist

Before signing customer 2, the founder runs this checklist against customer 1's real production data. Cross-reference: `THE_PLAN.md` "Pre-customer-2 commitment" section.

- [ ] **Measured month-end close savings.** Run the full flow on customer 1's month-end data. Start timer at "Start month-end close" click, stop at "Send all ready". Record elapsed minutes, number of drafts, number of edits, number of accepted-as-is.
- [ ] **Video of customer 1 CFO running the flow.** Face on camera, 3 minutes max, their explicit permission to share. Capture genuine reaction at queue load, at explanation render, at batch send.
- [ ] **Before/after one-pager published.** Hero number, one quote, link to the video. Format matches the customer interview template in `docs/GO_TO_MARKET.md` section 6.
- [ ] **Go/no-go decision.** If measured savings >= 90 minutes per month on a 201-employee-equivalent tenant: proceed to customer 2 at list pricing. If savings < 90 minutes: STOP, re-anchor the ACV story, potentially renegotiate the pricing down before any customer 2 commitment.

**Why this is here:** customer 1 is locked at €70,260 ACV for 3 years per the grandfathered-pilot clause in section 2. Customer 2 is where the pricing test actually happens. If the demo does not justify €35 per seat against real data, the founder has exactly one chance to re-anchor before the next contract signature. This checklist forces that chance to be taken seriously instead of rationalized past.
