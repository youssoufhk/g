# Runway budget (zero-salary POC mode)

> **Decision (2026-04-15):** both founders receive NO SALARY until Gamma is profitable AND both founders agree to start paying themselves. This is a founder-owned decision and is not up for debate from any agent.
>
> **Currency:** EUR for everything.
>
> **Scope of this file:** the minimum monthly admin costs to keep Global Gamma Ltd alive while we build the POC. Personal financial arrangements (savings, other income, spouses, bank accounts) are NOT in this file and NOT in this repo.
>
> **Real numbers live in `runway.local.md`** (gitignored). This file is the committed structure with placeholders.

---

## 1. Burn scope

Everything below is COMPANY burn, not founder personal burn. Founder personal expenses are the founders' private business and are not tracked in the repo.

## 2. Monthly company burn forecast

| Line | Month 1-3 | Month 4-9 | Month 10-18 | Notes |
|---|---:|---:|---:|---|
| GCP infrastructure (europe-west9) | €0-50 | €100-200 | €300-600 | Cloud Run free tier covers early dev |
| SaaS tools (GitHub free, Linear free, Figma free, Wise Business free) | €0-50 | €100-200 | €200-300 | Free tiers aggressive until customer 1 |
| UK accountant (Companies House, CT600, filings) | €100-200 | €100-200 | €150-250 | Required for Global Gamma Ltd |
| French tax advisor (1-hour consultation) | €0 | €200-300 once | €0 | Month 4 one-time |
| Domain registration + landing page hosting | €20 | €20 | €20 | Netlify/Vercel free tier |
| Miscellaneous (notary, shipping, small filings) | €50 | €50 | €100 | Buffer |
| Insurance (PI + cyber, from customer 1 only) | €0 | €0 | €100-150 | Deferred until signed customer |
| **Monthly total** | **€170-370** | **€520-720** | **€870-1,420** | |

**Realistic average: ~€400/month early, ~€1,000/month late.**

## 3. One-time costs (month 0 to month 2)

| Item | Cost |
|---|---:|
| Co-founder agreement via SeedLegals UK | ~€1,200 |
| UK accountant initial engagement | ~€300 |
| Wise Business account setup | €0 (free) |
| French tax advisor first consultation | ~€250 |
| EU trademark filing (class 42) | ~€850 (deferrable to customer 1) |
| Domain registration (3 candidates) | ~€150 |
| **One-time total** | **~€2,750** |

## 4. 18-month total company burn

| Period | Months | Average monthly | Subtotal |
|---|---:|---:|---:|
| Early (month 1-3) | 3 | €300 | €900 |
| Mid (month 4-9) | 6 | €600 | €3,600 |
| Late (month 10-18) | 9 | €1,100 | €9,900 |
| One-time costs | | | €2,750 |
| Buffer (unforeseen) | | | €2,850 |
| **Grand total** | | | **~€20,000** |

**This is the COMPANY burn, not personal burn.** Both founders work without salary during POC. Personal expenses are handled by each founder privately.

## 5. When this changes

- [ ] When Gamma makes its first profit: founders may, by mutual written agreement, begin receiving compensation. Until then, zero salary.
- [ ] When the first pilot customer signs: insurance (professional indemnity + cyber liability) is added, ~€100-150/month.
- [ ] When customer 1 goes live: GCP costs begin to ramp meaningfully.
- [ ] When customer 5 signs: seed round conversation begins per `EXECUTION_CHECKLIST.md` §9.

## 6. Current state (fill in `runway.local.md`, not this file)

- Company cash balance in the Wise Business EUR account
- Monthly burn actuals vs forecast
- Variance notes

## 7. Cost triggers

- [ ] If company cash < 12 months of projected burn: accelerate customer discovery (tracked in `pipeline.md`)
- [ ] If company cash < 6 months of projected burn: pause non-critical tools, defer trademark, consider founder personal top-up
- [ ] If company cash < 3 months: stop and decide (raise, loan, pause)

## 8. Sign-off

- [ ] Founder 1: read and accepted, YYYY-MM-DD
- [ ] Founder 2: read and accepted, YYYY-MM-DD

## 9. Revision log

- 2026-04-15: initial draft with zero-salary POC assumption; salaries out of scope until profits + founder agreement
