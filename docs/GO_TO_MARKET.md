# GO TO MARKET

> Commercial plan. Most numbers below are **targets / TBD** until we have real customer conversations. Do not treat as facts.
> Timeline week numbers live only in `THE_PLAN.md`.

---

## 1. Positioning

- **Category:** Premium HR operations platform for consulting firms and agencies.
- **Sweet spot:** 50 to 500 employees, time-and-materials billing, multi-client.
- **One-liner:** GammaHR runs HR operations the way Revolut runs your finances: the app does the work, you confirm.
- **Differentiator:** Flagship-quality UX + AI throughout + one design language.
- **Not for:** tiny teams (use Notion), payroll-first buyers (use Gusto), enterprises (use Workday).

---

## 2. Pricing (per-seat with volume bands, locked)

**Per-seat volume-band pricing** (band pricing, not cliff pricing: a 75-seat tenant pays first 50 at rate A and next 25 at rate B). **Seat = active user in last 30 days.** Reference users who appear in data but never log in are NOT billable.

### Published list pricing

| Tier | 1-50 seats | 51-100 seats | 101-200 seats | >200 seats |
|---|---|---|---|---|
| **Starter** | €9/seat/mo | €8/seat/mo | €7/seat/mo | custom contract |
| **Pro** | €15/seat/mo | €13/seat/mo | €11/seat/mo | custom contract |
| **Enterprise** | custom contract |

### What's in each tier

| Tier | Includes |
|---|---|
| Starter | Core: time, clients, projects, invoices, expenses, leaves, basic dashboards, email support. All Tier 1 features. |
| Pro | Starter + AI command palette + AI OCR + AI insight cards + resource planning + custom fields + advanced reports + priority support |
| Enterprise | Pro + SSO/SAML/SCIM (post-deferral) + audit exports + negotiated DPA + dedicated support + uptime SLA |

### Custom contracts (Enterprise and >200 seats)

Above 200 seats OR for any deal the founder wants to negotiate specially, a custom contract in `public.tenant_custom_contracts` overrides the volume-band pricing with a negotiated annual lump sum, included seat cap, and overage rate. Founder-created in the operator console. Fully decoupled from feature entitlements: a custom-contract tenant can still be on list-price Pro features but pay a custom lump sum.

### Monthly vs annual

Monthly billing available. **Annual pays ~10 months for 12** (roughly 15% discount). No multi-year contracts in v1.0 (DEF-031). No refunds on annual contracts except within the first 14 days (same as trial period).

### Currency and VAT

All prices ex-VAT, EUR only. Multi-currency subscription billing (GBP, USD) deferred (DEF-030). EU intra-community B2B invoices emit zero-VAT lines with the reverse-charge legal mention (single VAT rate per tenant + reverse-charge boolean on client, multi-rate VAT deferred in DEF-007). Non-EU billing not in v1.0 scope.

### Grandfathered pricing for pilots

First 5 paying customers get grandfathered at the Phase 2 rate card for 3 years, regardless of seat count growth. Written into their custom contract.

---

## 3. Target customer profile

- Consulting firm or agency
- Based in FR / CH / BE / LU / DE (founder geography)
- 50-300 employees currently
- Using Excel + BambooHR, or Personio, or Tempo + Jira, or Harvest + something
- Pain point: 10+ hours per week of manager time on approvals and rebalancing

---

## 4. Pipeline stages

| Stage | Definition |
|-------|------------|
| Curious | Aware of GammaHR, saw a demo video |
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

**Phase 5+ (customer #6+):** migrate to an automated payment processor.
- Leading candidate: **Revolut Business Merchant Acquiring** (founder has existing banking relationship, lower fees on EU cards, BUT Revolut lacks a full subscription product so requires custom subscription logic or a thin wrapper)
- Alternative: **Stripe Billing** (full subscription product, more expensive per-transaction fees, requires OSS VAT registration)
- Alternative: **Paddle** (merchant-of-record, ~5% fees, eliminates EU VAT handling entirely, best for founder wanting zero accounting operations burden)
- Final choice deferred to DEF-029 implementation time
- Existing Phase 2 customers are grandfathered or migrated at that time

**Dunning (at automation time):** Stripe/Revolut webhook `invoice.payment_failed` triggers GammaHR's own branded emails via Workspace SMTP Relay. Three-email escalation (day 1, 7, 14). Templates part of the Phase 2 email template set.

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
- [ ] Onboarding wizard tested with customer's real data
- [ ] Stripe billing live
- [ ] ToS + Privacy + DPA published
- [ ] Security whitepaper drafted
- [ ] Support email + docs live
- [ ] Backup + restore drilled
- [ ] Monitoring + alerting live
- [ ] Incident response runbook drafted

---

## 11. Risks

| Risk | Mitigation |
|------|-----------|
| First customer churns after 30 days | 60-day pilot, weekly check-ins, founder onboarding |
| CSV imports fail on their data shape | AI mapper + manual mapper + test with real data before pilot |
| AI feature failure embarrasses us | Kill switches, non-AI fallback, conservative thresholds |
| GDPR gap | DPA ready, right-of-access endpoint, deletion tested |
| Pricing too high | Grandfathered pricing for first 3, ongoing interviews |
| Feature-request firehose | Hard scope doc, monthly review |

---

## 12. v1.0 success definition

- 1 paying customer at annual price
- At least 10 firms at Interested stage
- No P0 bugs in production for 30 consecutive days
- Customer advocate willing to give a testimonial
- Founder comfortable taking a week off without everything breaking
