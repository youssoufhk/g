# GO TO MARKET

> Commercial plan. Most numbers below are **targets / TBD** until we have real customer conversations. Do not treat as facts.
> Timeline week numbers live only in `ROADMAP.md`.

---

## 1. Positioning

- **Category:** Premium HR operations platform for consulting firms and agencies.
- **Sweet spot:** 50 to 500 employees, time-and-materials billing, multi-client.
- **One-liner:** GammaHR runs HR operations the way Revolut runs your finances: the app does the work, you confirm.
- **Differentiator:** Flagship-quality UX + AI throughout + one design language.
- **Not for:** tiny teams (use Notion), payroll-first buyers (use Gusto), enterprises (use Workday).

---

## 2. Pricing (targets, TBD)

All prices below are **proposed**, subject to validation during discovery calls.

| Tier | Target price | Audience | Features |
|------|--------------|----------|----------|
| Starter | €30/user/mo, annual | 50-150 employees | All Tier 1 |
| Growth | €40/user/mo, annual | 150-350 employees | Starter + AI OCR + Insights + API |
| Scale | €50-60/user/mo, annual | 350-500 employees | Growth + SSO + advanced audit + priority support |

Monthly billing available at 20% premium.
First 3 paying customers get grandfathered pricing (Starter rate regardless of size) for 3 years.

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

- Stripe subscription billing, cards + SEPA
- Annual invoices issued at signup, 60-day renewal notice
- Upgrades/downgrades prorated
- Failed payments: Stripe Smart Retries, 14-day dunning
- Self-serve billing portal in Admin console

Target go-live: per `ROADMAP.md` milestone "Stripe billing live" (week 35 target, TBD).

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
