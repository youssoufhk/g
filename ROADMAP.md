# ROADMAP

> Single source of truth for phases and target weeks. Every other doc should be time-less; dates live here.
> Week 0 = production build kickoff (not prototype start).
> All week numbers are **targets**, not guarantees. Solo founder at ~20 h/week historically misses by 1.5 to 2x. Update this file when slippage happens; do not update other docs.

---

## Phases

| Phase | Weeks | Theme | Exit criteria |
|-------|-------|-------|---------------|
| 0 | done | Prototype | All 19 HTML pages approved |
| 1 | 1 to 3 | Foundation docs | All specs + ADRs in this repo final |
| 2 | 4 to 6 | Foundation build | FastAPI scaffold + Next.js scaffold + design-system atoms + auth skeleton |
| 3 | 7 to 9 | Auth + onboarding | Login, MFA, passkey, reset, bulk CSV import all pass the gate |
| 4 | 10 to 13 | Core data + Dashboard pass 1 | Employees, clients, projects modules + dashboard scaffold |
| 5 | 14 to 22 | Core modules | Timesheets, leaves, expenses, approvals, invoices, admin, account, Dashboard pass 2 |
| 6 | 23 to 32 | Tier 2 features | Calendar, Gantt, planning, HR, insights, portal, real-time |
| 7 | 33 to 40 | Hardening + launch | Security audit, perf, beta onboarding, docs, launch |

---

## Go-to-market milestones

| Week (target) | Milestone |
|--------------:|-----------|
| 9  | Auth + onboarding flawless |
| 13 | Dashboard pass 1 live with core data |
| 22 | All Tier 1 features flawless |
| 25 | First non-paying pilot kickoff |
| 32 | Tier 2 features functional |
| 35 | Stripe billing live |
| 38 | First paying customer signs |
| 40 | Public launch |

---

## Slippage policy

- Dates can move. Quality cannot.
- If we are 2+ weeks behind on a phase, drop Tier 2 scope first, never Tier 1 quality.
- If a Tier 1 feature fails its gate twice, escalate: founder decides scope cut or extra time.
- This file is the single source for dates. When you update a week here, you do not need to update any other doc.

---

## Honest caveats

- Total budget: ~720 to 880 hours at 20 h/week for 36 to 44 weeks. Realistic range is probably 14 to 18 months (1000+ hours) for a solo founder building 14 Tier 1 features to a flawless bar.
- "One Tier 1 feature per week in Phase 5" is an aspiration. Some features (invoices, approvals, timesheets grid) will take 2 to 3 weeks each.
- Pilot and commercial milestones assume customer discovery is already in progress. If no warm leads exist by week 20, the launch date slips.
