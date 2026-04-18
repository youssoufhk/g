# FLAWLESS GATE (unified)

> The single authoritative quality gate for every Tier 1 feature. Supersedes the separate `OPUS_CRITICS.md` §12 (57-item bar) and `OPUS_CRITICS_V2.md` §18 (13-item delta). Authorized by `docs/decisions/ADR-012-unified-quality-gate.md`.
>
> **Rule:** A feature either passes all 70 items or it does not ship. No partial gate. No "minor". No "we will fix it later".
>
> **Last updated:** 2026-04-18 (unified with OPUS v1 + v2 deltas; previous 15-item list folded in as the human-judgment spine).
>
> **Reading order for agents:**
> 1. Run items 1-70 below as the per-feature bar.
> 2. Treat the six domain sections as the organizing frame; do not skip a section.
> 3. The "feel proxy checklist" at the bottom is what the agent runs before the founder signs off on the feel.

---

## Structure

- 70 items, grouped into six domains:
  - Visual + craft (items 1-12)
  - IA + interconnection (items 13-20)
  - Trust + recovery (items 21-28)
  - Backend (items 29-33)
  - Tests, test-first (items 34-40)
  - A11y + mobile (items 41-50)
  - i18n + linting (items 51-55)
  - Critic gates (items 56-57)
  - V2 delta (items 58-70)

The prior CLAUDE.md §7 15-item list maps 1:1 into this list; cross-references are shown inline as `(was §7.N)`.

---

## Visual + craft (1-12)

1. Side-by-side screenshot diff vs `prototype/<page>.html` at 1440px shows ≤1% pixel delta on layout-affecting regions. *(was §7.1)*
2. 320px mobile: zero horizontal scroll (Playwright assertion). *(was §7.2)*
3. 375px and 414px also verified (manual on real device or simulator).
4. Dark mode + light mode both pass WCAG 2.2 AA contrast on every text/background pair (automated check via `axe-core` in Playwright). *(was §7.3)*
5. Skeleton loader is the exact pixel layout of the loaded page (no jump on data load). *(was §7.4, loading)*
6. Empty state has a designed illustration or icon AND a CTA whose label names the next action. *(was §7.4, empty)*
7. Loading state uses skeleton, not spinner-on-blank.
8. Error state names the error, offers a recovery CTA, links to a help page if applicable. *(was §7.4, error)*
9. All interactive elements have `:hover`, `:focus`, `:active` states. Cursor changes to pointer on clickable rows.
10. Tabular numerals on every numeric column (`font-feature-settings: "tnum"`; apply via `[data-numeric]`).
11. Currency uses non-breaking space, right-aligned.
12. Date format follows the locale formatter. `lib/format.ts` is the only authorized formatter; `Intl.DateTimeFormat` outside `lib/format.ts` is a CI break. *(see also item 70)*

## IA + interconnection (13-20)

13. Every employee/client/project/invoice/expense/leave/approval reference on the page is a working link to the entity detail. *(was §7.7)*
14. Filter state, sort state, pagination state all serialized in URL.
15. Breadcrumb at top of every detail page.
16. Sticky header with entity name on scroll.
17. Prev/next navigation on detail pages where the parent is a list.
18. Cmd+K palette opens from this page. *(was §7.6)*
19. Topbar global search works on this page.
20. Empty-state CTA exists for both "no data ever" and "filtered to zero results" cases.

## Trust + recovery (21-28)

21. Every mutation goes through `useOptimisticMutation` with rollback on error.
22. Every concurrent-edit risk surfaces `<ConflictResolver>` on 409. *(was §7.12, 409-conflict scenario)*
23. Every mutation generates an idempotency key client-side. *(see also item 63)*
24. Every mutation writes one `audit_log` row server-side with `actor_type`, `actor_id`, `on_behalf_of_*`, `event_type`, `before_json`, `after_json`, `ip_address`, `user_agent`. Log is append-only. *(was §7.9)*
25. Every approve/send/destructive action shows a 5-second undo toast.
26. Every entity detail page has an "Activity" tab populated from `audit_log`.
27. Toasts use `role="status"` / `role="alert"` and `aria-live` correctly.
28. Network failure shows a retry banner, not silent blank.

## Backend (29-33)

29. The route exists, mutates the real DB (not local state, not mock).
30. RBAC enforced via `@gated_feature(key)` decorator. Cross-tenant request returns 404 (no information leak). *(was §7.10)*
31. Tenant scoping verified by tenancy middleware. Cross-tenant test in suite. *(was §7.10)*
32. Query plan inspected: indexes used, no N+1. Feature flag evaluations coalesced into a single query per request, cached for the request lifetime. *(was §7.11)*
33. OpenAPI schema generated, frontend types regenerated via `openapi-typescript`, contract test passes.

## Tests, test-first (34-40)

34. At least one Playwright E2E scenario covers the golden path. Authored before the implementation. *(was §7.12, golden path)*
35. At least one Playwright E2E scenario covers the 409-conflict branch ("keep mine" + "take theirs").
36. At least one Playwright E2E scenario covers the degraded mode (kill switch on). *(was §7.6, degraded mode)*
37. If financial math: property test for the invariant (`hypothesis`), 1000 generated cases pass.
38. If AI feature: 5 eval examples in `backend/app/ai/evals/<feature>/`, threshold met.
39. Snapshot test for any rendered PDF or email.
40. Unit coverage ≥85% on the feature, 100% on financial math.

## A11y + mobile (41-50)

41. Keyboard reach: every interactive element reachable by Tab. Tab order matches visual order. *(was §7.5)*
42. Visible focus ring on every focusable element, with sufficient offset to remain visible against the background. *(was §7.5)*
43. Modal has focus trap. Esc closes. First focusable inside is auto-focused.
44. All icon-only buttons have `aria-label`.
45. Active sidebar item has `aria-current="page"`.
46. Loading regions have `aria-busy="true"`.
47. Status changes announced via `aria-live`.
48. Touch targets ≥44x44px on mobile, 8px spacing.
49. Form inputs are 48px tall on mobile.
50. Native date pickers on mobile (no JS calendar overlays).

## i18n + linting (51-55)

51. No hardcoded user-facing strings. All keys present in `messages/en.json` AND `messages/fr.json` with parity (equal line counts). *(was §7.8)*
52. Grep for em dashes returns zero matches. Grep for "utilisation" returns zero matches. *(was §7.14)*
53. No new atom introduced; diff `frontend/components/ui/` against the Phase 2 baseline stays clean. New patterns/atoms cannot land without an ADR-NNN under `docs/decisions/`. *(was §7.13, also item 68)*
54. No vendor SDK import outside the M1 wrappers (lint passes).
55. No `utils.py`, `helpers.py`, or `common.py` (M10 lint passes).

## Critic gates (56-57)

56. **`senior-ui-critic` subagent invoked**, returns ZERO red items. Report pasted into the commit message under `## senior-ui-critic`. Pre-commit hook refuses the commit if the header is missing.
57. **`senior-ux-critic` subagent invoked**, returns ZERO red items. Report pasted into the commit message under `## senior-ux-critic`. Pre-commit hook refuses the commit if the header is missing.

## V2 delta (58-70)

58. ADR amendment present whenever an architectural decision in CLAUDE.md, ADR-001..010, or `specs/*.md` is overridden in code. Grep for "deviation" / "for the MVP demo path" / "phase X carryover" in source; each match must point to an ADR-NNN amendment.
59. Seed script row counts equal `specs/DATA_ARCHITECTURE.md §12.10` exactly. CI test pins counts. Regression dropping rows fails CI.
60. Tier 1 backend feature folder must contain `routes.py`, `service.py`, `models.py`, `schemas.py`, `tests/`. Empty folder = build break.
61. `EXECUTION_CHECKLIST.md` "DONE" check marks are CI-validated against the existence of (a) backend route, (b) Playwright E2E spec, (c) audit_log writer, (d) RBAC decorator. Any false check fails CI.
62. AI client: real LLM-as-router enforcement (return only registered tool calls; reject free-form completion). Test asserts the router rejects an injected free-form response.
63. Idempotency: every mutating route reads `Idempotency-Key` and stores in `idempotency_keys` table. Test sends same key twice; second response is the cached first response.
64. Confidential-tier columns exist in schema (`employee_compensation`, `employee_banking`, `leave_requests.reason_encrypted`, `employees.protected_status_encrypted`) even if encryption stub is in place; CMEK is Phase 7 but the column shapes must be present now.
65. Frontend mock data is a strict subset of what the backend seed inserts. Type drift between `features/*/types.ts` and backend Pydantic schemas is a CI break.
66. `make help` lists every Make target the contributor can run, with prerequisites named.
67. `(portal)/` route group cannot be built ahead of Phase 6 without an ADR amendment (see ADR-013).
68. New patterns/atoms cannot land without an ADR-NNN under `docs/decisions/`.
69. `console.log` in shipped frontend code is a CI break (one allowed per file via `// eslint-disable-next-line no-console` with a reason).
70. Single date-format helper in `lib/format.ts` is the only authorized formatter; `Intl.DateTimeFormat` outside `lib/format.ts` is a CI break. *(see also item 12)*

---

## The feel proxy checklist (agent-runnable, fills in the founder sign-off)

Before the founder sees the page, the agent runs the feel proxy checklist and reports the result. The founder then either signs off or sends back with a one-line reason. (This replaces the original "founder says this feels like Gamma" single-item sign-off, which made the founder a 13-feature bottleneck.)

For each Tier 1 page, the agent asserts (and reports per-item):

1. **Calm.** Whitespace ratio at 1440px is comparable to `prototype/<page>.html` at the same breakpoint (within 10%). No more than one accent color per visible region. No competing primary actions in the same viewport.
2. **Ease.** From a cold load, the next obvious action is reachable in 0 or 1 clicks. The page passes the "what would I do here?" test: opening it in a fresh browser session, the agent can name the next-action button without scanning.
3. **Completeness.** Empty state has a designed illustration or icon AND a CTA. Loading state uses a skeleton that matches the final layout (no spinner-on-blank). Error state names the error AND offers a recovery action. No "coming soon" text anywhere.
4. **Anticipation.** The page pre-fills, pre-filters, or pre-ranks at least one thing for the user. (Example: timesheet grid pre-fills last week's projects; expense form pre-fills currency from tenant; approvals hub pre-sorts oldest-first.)
5. **Consistency.** Card/row/button height, filter bar shape, sidebar item alignment all match the canonical patterns in `specs/DESIGN_SYSTEM.md` section 4 and section 5. The page does not introduce a single one-off variant.

Agent reports the checklist as 5 short paragraphs, one per quality, citing the specific elements verified. The founder then signs off or returns with a one-line reason.

---

## Rules

- Run all 70, not a subset. Partial gates lie.
- Any red item means the feature stops and returns to the builder.
- On re-run, run all 70 again, not just the failed item. Fixes often regress other items.
- Screenshots and test reports are saved to `docs/gate-reports/<feature>/`.
- Only the founder can sign off on the feel proxy checklist. Every other item can be verified by an agent.
- A feature that passes the 70 items visually but fails any automated layer in `docs/TESTING_STRATEGY.md` (layers 1-5) or any `docs/MODULARITY.md` CI check (M1-M10) cannot ship.

---

## What this gate deliberately omits

The expanded audit below is run only on demand (typically before a v1.0 security review). Agents do not run it unless told to.

**Expanded audit (on demand only):**

- **A11y:** WCAG 2.2 AA compliance, screen reader announcements, zoom to 200%. Note: `prefers-reduced-motion` is not currently tested: v1.0 has no animations per CLAUDE.md section 2 rule 8. This check is reserved for the polish pass when subtle transitions may appear.
- **Perf:** First Contentful Paint < 1.5s on 4G, TTI < 3s, route JS bundle < 150kb gzipped.
- **Security:** SQL injection attempts, XSS in user-generated content, CSRF on mutations, rate limit stress.
- **Observability:** Metrics, traces, structured logs, error tracker integration.
- **Mobile devices:** Real iPhone SE, iPhone 14, Pixel 7, iPad Mini.
- **Offline:** Service worker cache, IndexedDB persistence, background sync.
- **PDF:** WeasyPrint output matches HTML preview pixel-for-pixel at print DPI.
- **AI:** Cost per event, latency p95, kill switch, non-AI fallback path.

---

## Companion documents

- `specs/DESIGN_SYSTEM.md` - atoms, tokens, patterns.
- `docs/TESTING_STRATEGY.md` - the six automated layers that back items 34-40.
- `docs/MODULARITY.md` - M1-M10 structural rules enforced in CI.
- `docs/DEGRADED_MODE.md` - the kill-switch-on behavior that items 6 and 36 test against.
- `docs/decisions/ADR-012-unified-quality-gate.md` - the authorization for this merge.
