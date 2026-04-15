# The 15-item flawless gate

Every Tier 1 feature must pass all 15 items before shipping. No partial gates. Run the gate at the end of a page build, and if any item fails, stop, fix it, then re-run all 15 (fixes often regress other items).

## The 15 items

| # | Item | How to verify |
|---|------|---------------|
| 1 | Matches `prototype/<page>.html` at 1440px | Side-by-side visual comparison. If using the `webapp-testing` skill, capture a screenshot at 1440x900 and diff against the prototype file. |
| 2 | No horizontal scroll at 320px width | Playwright set viewport to 320x568, reload, assert no `overflow-x: scroll` anywhere. Manual check on a real mobile device before first customer. |
| 3 | Dark and light mode both polished | Storybook-style toggle between `[data-theme="dark"]` and `[data-theme="light"]`, visual comparison. Both must look like GammaHR, not just "dark mode plus inverted colors". |
| 4 | Empty state, loading state, error state all designed | Trigger each path deliberately. Empty state uses the `<EmptyState>` pattern component. Loading state uses `<Skeleton>` atoms with dimensions matching the final layout. Error state has a specific message, not "Something went wrong". |
| 5 | Keyboard reachable, focus ring visible | Tab through every interactive element in order. Focus ring is `hsl(155, 26%, 46%)` at 2px offset, never removed. `prefers-reduced-motion` respected. |
| 6 | Cmd+K command palette opens from this page | Only for `(app)` route group pages. Press Cmd+K (or Ctrl+K on Linux/Windows), the palette should open and be usable. `(ops)` and `(portal)` pages are exempt because they do not have Cmd+K. |
| 7 | Every employee, client, project reference is a link | Click every entity name on the page. Each should navigate to the detail page for that entity. Zero dead ends. |
| 8 | No hardcoded strings; EN and FR both complete | `grep -r '"[A-Z][a-z]' frontend/features/<domain>/components/ | grep -v '\.t('` should return nothing user-visible. Switch locale to FR, every string changes. |
| 9 | Every mutation emits an audit log entry | Inspect `public.audit_log` after performing each mutation. Each mutation produces one row with the right `entity_type`, `entity_id`, `action`, and `actor_id`. |
| 10 | Every API call enforces RBAC and tenant scoping | Write a cross-tenant test: log in as tenant A, try to read tenant B's resource, expect HTTP 403 or HTTP 404. Log in as an unauthorized role (employee instead of admin), try a mutation, expect HTTP 403. |
| 11 | Every query has an index; no N+1 | Query count assertion in the backend test: `assert query_count <= N`. For a list endpoint with 50 rows, N should be 1 query for the list + 1 for the count, not 51. |
| 12 | Playwright E2E covers the golden path | Delegate to the global `webapp-testing` skill. The E2E covers the main user flow for this page end-to-end (open page, do the primary action, verify result). |
| 13 | No new atoms introduced | Diff `frontend/components/ui/` against the last known good commit. If new files appeared there, stop; every atom must be in `specs/DESIGN_SYSTEM.md` and approved by the founder. |
| 14 | No em dashes, no "utilisation", no decorative flourishes | `grep -n "—" frontend/ backend/ docs/ specs/` should return nothing. `grep -ni "utilisation" frontend/ backend/ docs/ specs/` should return nothing. Visual check for animations, sparklines, 3D, decorative borders that are not in the prototype. |
| 15 | The founder can look at it and say "this feels like GammaHR" | This is the subjective founder gate. Items 1-14 can be verified by an agent; item 15 requires a human pass. If 15 fails, the feature is not done regardless of how many technical items passed. |

## Rules for running the gate

- Run all 15, not a subset. Partial gates lie.
- Any red item means the feature stops and returns to the builder.
- On re-run, run all 15 again, not just the failed item. Fixes often regress other items.
- Save screenshots and test reports to `docs/gate-reports/<feature-name>/`.
- Only the founder can sign off on item 15. Every other item can be verified by an agent.

## What the gate does NOT cover

The 15 items deliberately omit deeper audits that are only run when the founder explicitly asks for them (e.g., pre-launch security review):

- Full WCAG 2.2 AA compliance, screen reader announcements, zoom to 200%
- First Contentful Paint < 1.5s on 4G, TTI < 3s, route JS bundle < 150kb gzipped
- SQL injection fuzzing, XSS in user-generated content, CSRF on mutations, rate limit stress tests
- OpenTelemetry tracing, structured logs across the full request path, error tracker integration
- Real-device smoke tests (iPhone SE, iPhone 14, Pixel 7, iPad Mini)
- Full offline behavior (service worker cache + IndexedDB persistence + Background Sync API)
- PDF pixel parity between WeasyPrint output and HTML preview at print DPI
- Full AI cost/latency benchmarking, kill switch stress tests, non-AI fallback verification

Skip the expanded audit unless the founder explicitly asks. Do not run it every gate; it would burn hours on every feature.

## When the gate lives in a skill

The dedicated `run-flawless-gate` skill (project-scoped) is the canonical way to run this checklist. When building a page with the `build-page` skill, the Step 6 self-check is a quick sanity pass against these 15 items; it is not as rigorous as the dedicated gate skill. If a page feels risky, run `run-flawless-gate` explicitly instead of relying only on the self-check.

For Playwright items (1, 2, 3, 6, 12), delegate to the global `webapp-testing` skill rather than re-implementing Playwright patterns here.
