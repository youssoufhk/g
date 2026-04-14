# FLAWLESS GATE

> The 15 items every Tier 1 feature must pass before shipping. If you only run one checklist, run this one.
> A feature either passes all 15 or it does not ship. No partial gates.

---

## The 15

| # | Item | How to verify |
|---|------|---------------|
| 1 | Matches `prototype/<page>.html` at 1440px | Side-by-side screenshot |
| 2 | No horizontal scroll at 320px width | Playwright + manual on real mobile |
| 3 | Dark and light mode both polished | Storybook + live toggle |
| 4 | Empty, loading, error states all designed | Trigger each path |
| 5 | Keyboard reachable, focus ring visible | Tab through every interactive element |
| 6 | Cmd+K command palette opens from this page | Manual |
| 7 | Every employee, client, project reference is a link | Click each entity reference |
| 8 | No hardcoded strings; EN and FR complete | Grep for literals; switch locale |
| 9 | Every mutation emits an audit log entry | Inspect `audit_log` after action |
| 10 | Every API call enforces RBAC and tenant scoping | Cross-tenant test + unauthorized-role test |
| 11 | Every query has an index; no N+1 | Query count assertion in test |
| 12 | Playwright E2E covers the golden path | CI green |
| 13 | No new atoms introduced | Diff `components/ui/` |
| 14 | No em dashes, no "utilisation", no decorative flourishes | Grep |
| 15 | Founder says "this feels like GammaHR" | Founder session |

---

## Rules

- Run all 15, not a subset. Partial gates lie.
- Any red item means the feature stops and returns to the builder.
- On re-run, run all 15 again, not just the failed item. Fixes often regress other items.
- Screenshots and test reports are saved to `docs/gate-reports/<feature>/`.
- Only the founder can sign off on item 15. Every other item can be verified by an agent.

---

## What this gate deliberately omits

The original `FLAWLESS_GATE.md` had 100+ items across visual, states, interaction, mobile, a11y, performance, data/API, tests, i18n, security, AI, observability, docs, feeling. That list was aspirational; no one runs 100 items per feature. This file is the real gate.

If a deeper audit is needed (e.g., before a v1.0 security review), run the expanded checklist below manually.

---

## Expanded audit (only on demand)

Run these only when the founder explicitly asks for a deep pass (e.g., pre-launch security review).

- **A11y:** WCAG 2.2 AA compliance, screen reader announcements, `prefers-reduced-motion`, zoom to 200%
- **Perf:** First Contentful Paint < 1.5s on 4G, TTI < 3s, route JS bundle < 150kb gzipped
- **Security:** SQL injection attempts, XSS in user-generated content, CSRF on mutations, rate limit stress
- **Observability:** Metrics, traces, structured logs, error tracker integration
- **Mobile devices:** Real iPhone SE, iPhone 14, Pixel 7, iPad Mini
- **Offline:** Service worker cache, IndexedDB persistence, background sync
- **PDF:** WeasyPrint output matches HTML preview pixel-for-pixel at print DPI
- **AI:** Cost per event, latency p95, kill switch, non-AI fallback path

Agents do not run this list unless told to.
