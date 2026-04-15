# FLAWLESS GATE

> The 15 items every Tier 1 feature must pass before shipping. If you only run one checklist, run this one.
> A feature either passes all 15 or it does not ship. No partial gates.
> **Last updated:** 2026-04-15 (item 15 split into an agent-runnable proxy plus a final founder sign-off so the founder is not a 14-feature bottleneck).

---

## The 15

| # | Item | How to verify |
|---|------|---------------|
| 1 | Matches `prototype/<page>.html` at 1440px | Side-by-side screenshot |
| 2 | No horizontal scroll at 320px width | Playwright + manual on real mobile |
| 3 | Dark and light mode both polished | Live toggle in dev (Storybook deferred per DEF-049) |
| 4 | Empty, loading, error states all designed | Trigger each path |
| 5 | Keyboard reachable, focus ring visible | Tab through every interactive element |
| 6 | **Degraded mode is fully usable.** The page must work when `kill_switch.ai` is on: all non-AI writes, reads, and navigation succeed; AI-only features show the yellow banner or hide entirely per `docs/DEGRADED_MODE.md` section 2 row for this feature. Global non-AI search via the topbar must remain functional. No dead ends: every entity reference stays a clickable link. Cmd+K command palette opens from this page. | Manual + flip the kill switch in staging, retest |
| 7 | Every employee, client, project reference is a link | Click each entity reference |
| 8 | No hardcoded strings; EN and FR complete | Grep for literals; switch locale |
| 9 | Every mutation emits an audit log entry with the correct `actor_type` (operator / user / portal_user / system) | Inspect `audit_log` after action |
| 10 | Every API call enforces RBAC and tenant scoping; cross-tenant access returns 404 not 403 (no information leak) | Cross-tenant test + unauthorized-role test |
| 11 | Every query has an index; no N+1. Feature flag evaluations (per-tenant kill switches, per-user entitlements, per-tenant plan tier) are coalesced into a single query per request, cached for the request lifetime. No N+1 on flag checks. First request to a cold worker takes at most 2 flag queries (one for tenant flags, one for user entitlements); all subsequent requests on the same worker use the cache until the next flag mutation broadcast. See `docs/TESTING_STRATEGY.md` layer 2 (property-based tests for financial invariants) and layer 6 (monthly load tests tracking p50/p95/p99 regression). | Query count assertion in test |
| 12 | Playwright E2E suite covers 45 scenarios by launch (see `docs/TESTING_STRATEGY.md` layer 4). A feature's gate run must include at least one scenario in the inventory that exercises its golden path AND at least one degraded-mode scenario when kill switches apply. The per-feature minimum: the golden path AND a 409-conflict scenario: User A loads entity at version 1. User B PATCHes the same entity, server advances to version 2. User A PATCHes with `expected_version=1`; server returns 409 with `current_version=2` and the current row. Client opens `<ConflictResolver>`; Playwright test covers both "keep mine" and "take theirs" branches. | CI green |
| 13 | No new atoms introduced (after the atom layer is locked in Phase 2) | Diff `components/ui/` against the baseline |
| 14 | No em dashes, no "utilisation", no decorative flourishes | Grep |
| 15 | Founder says "this feels like Gamma" | **Two-step:** agent runs the "feel proxy checklist" below, then founder reviews the agent's report and signs off |

---

## The feel proxy checklist (agent-runnable, fills in 80% of item 15)

The agent runs this before the founder reviews. The founder reads the agent's report instead of doing the discovery from scratch. Item 15 is **only** signed off after both halves clear.

For each Tier 1 page, the agent asserts (and reports per-item):

1. **Calm.** Whitespace ratio at 1440px is comparable to `prototype/<page>.html` at the same breakpoint (within 10%). No more than one accent color per visible region. No competing primary actions in the same viewport.
2. **Ease.** From a cold load, the next obvious action is reachable in 0 or 1 clicks. The page passes the "what would I do here?" test: opening it in a fresh browser session, the agent can name the next-action button without scanning.
3. **Completeness.** Empty state has a designed illustration or icon AND a CTA. Loading state uses a skeleton that matches the final layout (no spinner-on-blank). Error state names the error AND offers a recovery action. No "coming soon" text anywhere.
4. **Anticipation.** The page pre-fills, pre-filters, or pre-ranks at least one thing for the user. (Example: timesheet grid pre-fills last week's projects; expense form pre-fills currency from tenant; approvals hub pre-sorts oldest-first.)
5. **Consistency.** Card/row/button height, filter bar shape, sidebar item alignment all match the canonical patterns in `specs/DESIGN_SYSTEM.md` section 4 and section 5. The page does not introduce a single one-off variant.

Agent reports the checklist as 5 short paragraphs, one per quality, citing the specific elements verified. The founder then either signs off or sends back with a one-line reason.

This split exists because at 13 Tier 1 features the founder cannot afford to discover the same kinds of problems from scratch each time. The agent does the discovery; the founder does the judgment.

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

The full testing architecture across six layers is documented in `docs/TESTING_STRATEGY.md`. The flawless gate is the per-feature human-judgment layer; the testing strategy is the automated safety net. A feature that passes the gate visually but fails any layer 1-5 check cannot ship; conversely, automated tests do not substitute for the founder review item 15.

**Audit and GDPR.** Every mutation writes exactly one `audit_log` row with `actor_type, actor_id, on_behalf_of_*, event_type, before_json, after_json, ip_address, user_agent`. The log is append-only (DB trigger blocks UPDATE/DELETE). Entries are immutable. The DSR endpoint can return every audit row mentioning a user's id within 5 minutes on a test tenant. Retention matches `docs/COMPLIANCE.md` section 4. Tested: insert a mutation; verify the row is correct; try to UPDATE it; verify the trigger blocks; try to delete; verify blocked.

- **A11y:** WCAG 2.2 AA compliance, screen reader announcements, zoom to 200%. Note: `prefers-reduced-motion` is not currently tested: v1.0 has no animations per CLAUDE.md section 2 rule 8. This check is reserved for the polish pass when subtle transitions may appear.
- **Perf:** First Contentful Paint < 1.5s on 4G, TTI < 3s, route JS bundle < 150kb gzipped
- **Security:** SQL injection attempts, XSS in user-generated content, CSRF on mutations, rate limit stress
- **Observability:** Metrics, traces, structured logs, error tracker integration
- **Mobile devices:** Real iPhone SE, iPhone 14, Pixel 7, iPad Mini
- **Offline:** Service worker cache, IndexedDB persistence, background sync
- **PDF:** WeasyPrint output matches HTML preview pixel-for-pixel at print DPI
- **AI:** Cost per event, latency p95, kill switch, non-AI fallback path

Agents do not run this list unless told to.
