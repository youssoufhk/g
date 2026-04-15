---
name: run-flawless-gate
description: Use this skill whenever the user wants to verify a GammaHR page or feature against the 15-item quality gate before shipping. Trigger phrases include "is this ready to ship", "run the gate on X", "flawless gate check", "check this page", "verify this feature", "quality check", "qa this", "review before merge", or any pre-merge/pre-ship verification request. Produces a structured pass/fail report item-by-item with specific fix recommendations for any red items. Delegates Playwright work to the global webapp-testing skill rather than duplicating browser automation logic.
---

# run-flawless-gate: verify a feature against the 15-item quality checklist

This skill runs the 15-item flawless gate from `docs/FLAWLESS_GATE.md` against a specific GammaHR page or feature. It does not build anything; it only verifies. Use it when a feature is finished and you want to know if it's ready to ship, or when reviewing a PR before merge.

## Before you do anything

This skill is the standalone quality gate. The `build-page` skill includes a Step 6 self-check using the same 15 items, but that self-check is quick-and-dirty; when the stakes are real (shipping to staging, shipping to prod, pre-merge review, pre-first-customer audit), use THIS skill instead.

If the user also appears to be asking for a deeper security/performance audit, ask before proceeding. The 15-item gate is the daily bar; the expanded audit (WCAG compliance, SQL injection fuzzing, real-device smoke tests, etc.) is the pre-launch bar and costs hours rather than minutes.

## Inputs you need from the user

Before running the gate, confirm:

1. **The target**: a specific page (e.g., "3.2 Employee profile") OR a specific feature branch OR a specific PR. If ambiguous, ask.
2. **The scope**: is this a pre-merge check (CI-equivalent), a pre-ship check (staging → prod), or a pre-first-customer audit (expanded audit also)? Different scopes, different rigor.
3. **The server state**: is a local dev server running? The gate needs a running app to test items 1, 2, 3, 6, and 12. If no server is running, use the global `webapp-testing` skill's `scripts/with_server.py` helper to spin one up.

## The 15 items (with how to verify each)

| # | Item | How to verify | Agent-verifiable? |
|---|------|---------------|-------------------|
| 1 | Matches `prototype/<page>.html` at 1440px | Capture a screenshot via the global `webapp-testing` skill at 1440x900, diff against the prototype HTML file. Flag any visual delta greater than a few pixels. | Yes (with `webapp-testing`) |
| 2 | No horizontal scroll at 320px width | Set viewport to 320x568, reload, check `document.documentElement.scrollWidth <= window.innerWidth`. Also visually inspect for elements that break the layout. | Yes (with `webapp-testing`) |
| 3 | Dark and light mode both polished | Toggle `[data-theme="light"]` on `<html>`, capture screenshots in both modes, compare each against its respective prototype rendering. | Yes (with `webapp-testing`) |
| 4 | Empty, loading, error states all designed | Trigger each path manually: empty state by filtering to a query that matches nothing, loading state by throttling network in devtools or using `page.route` to delay, error state by returning a 500 from the API. Verify each renders a real designed state, not a default browser fallback. | Yes (with `webapp-testing`) |
| 5 | Keyboard reachable, focus ring visible | Programmatically tab through all interactive elements, verify focus order matches visual order, verify focus ring appears with the correct color (`hsl(155, 26%, 46%)` at 2px offset). | Yes (with `webapp-testing`) |
| 6 | Cmd+K command palette opens | Only for `(app)` route group pages. Press Cmd+K via `page.keyboard.press`, verify the palette dialog appears and is focus-trapped. `(ops)` and `(portal)` pages are exempt. | Yes (with `webapp-testing`) |
| 7 | Every employee/client/project reference is a link | Parse the rendered DOM, find every text node that looks like an entity name, verify each is wrapped in an `<a>` or `<Link>` tag that navigates to the detail page. | Yes (with `webapp-testing`) |
| 8 | No hardcoded strings, EN + FR both complete | Grep `frontend/features/<domain>/` for string literals that look like user-visible text (capital letter followed by lowercase). Each should be wrapped in `t('key')`. Switch locale to FR, verify every string changes. | Yes (grep + locale switch) |
| 9 | Every mutation emits an audit log entry | Run the page's mutations (create, update, delete) via the E2E, then query `public.audit_log` and assert each mutation produced one row with the correct `entity_type`, `entity_id`, `action`, `actor_id`. | Yes (backend test + DB query) |
| 10 | Every API call enforces RBAC and tenant scoping | Run the backend test suite's cross-tenant tests: log in as tenant A, attempt to access tenant B's resource via the API, expect HTTP 403 or 404. Log in as an unauthorized role (employee instead of admin), attempt a mutation, expect 403. | Yes (backend tests) |
| 11 | Every query has an index, no N+1 | Run the page's backend tests with query count assertions enabled. For a list endpoint returning 50 rows, expect ~2 queries (list + count). If >5, there is likely an N+1. Check that every `WHERE` column and `JOIN` key has an index. | Yes (backend tests + EXPLAIN) |
| 12 | Playwright E2E covers the golden path | Delegate to the global `webapp-testing` skill. Verify a Playwright test exists under `frontend/tests/e2e/<page-name>.spec.ts` and that it passes. | Yes (with `webapp-testing`) |
| 13 | No new atoms introduced | Diff `frontend/components/ui/` against `main` or the last known good commit. If any new files exist, flag them; new atoms require founder approval. | Yes (git diff) |
| 14 | No em dashes, no "utilisation", no decorative flourishes | `grep -rn "—" frontend/ backend/ docs/ specs/ .claude/` should return nothing. `grep -rni "utilisation" frontend/ backend/ docs/ specs/ .claude/` should return nothing. Visual inspection for animations, sparklines, 3D, decorative borders not in the prototype. | Yes (grep + visual) |
| 15 | The founder can look at it and say "this feels like GammaHR" | **Subjective founder gate.** This cannot be verified by an agent. Present the built page to the founder, they look at it, they say yes or no. | **No** (human gate) |

## The procedure

### Step 1: Gather the context

- Confirm the target page/feature from the user.
- Read the relevant APP_BLUEPRINT row and prototype HTML file.
- Check if a local dev server is running (`curl http://localhost:3000/` or similar). If not, use `webapp-testing`'s `scripts/with_server.py` to spin one up.

### Step 2: Run items 14 and 13 first (cheapest)

Items 13 and 14 are grep/diff-based and cost seconds, not minutes. Run them first to fail fast if the feature has obvious violations.

```bash
# Item 14
grep -rn "—" frontend/ backend/ docs/ specs/ .claude/ || echo "PASS: no em dashes"
grep -rni "utilisation" frontend/ backend/ docs/ specs/ .claude/ || echo "PASS: no utilisation"

# Item 13
git diff main -- frontend/components/ui/ | grep "^+++" || echo "PASS: no new atoms"
```

If either fails, STOP, report the failures, and do not continue. The rest of the gate is worthless until these are fixed.

### Step 3: Run backend-verifiable items (9, 10, 11)

These require running the backend test suite for the specific feature:

```bash
cd backend && pytest app/features/<domain>/tests/ -v --query-count
```

Capture the output. If any test fails, flag the specific item (9, 10, or 11) with the failing test name.

### Step 4: Run frontend-verifiable items (1, 2, 3, 4, 5, 6, 7, 12)

Delegate to the global `webapp-testing` skill. Do not duplicate its Playwright logic. Ask `webapp-testing` to:

- Navigate to the page URL in the running dev server
- Capture screenshots at 1440x900, 768x1024, and 320x568
- Toggle dark/light mode, capture screenshots in each
- Press Tab through every focusable element, record focus order
- Press Cmd+K on `(app)` pages, verify the palette opens
- Extract every entity name from the DOM, verify each is a link
- Trigger empty, loading, and error states, verify each renders
- Run the existing Playwright E2E test for the feature

Collect the results. Compare screenshots against the prototype HTML file for item 1.

### Step 5: Run item 8 (grep + locale)

```bash
# Item 8: no hardcoded strings
grep -rn "\"[A-Z][a-z]" frontend/features/<domain>/components/ | grep -v 't(' | grep -v '//'
```

And verify that switching the locale to FR changes all strings (visual check).

### Step 6: Report

Structure the report as a 15-row table, one row per gate item, with columns: `#`, `Item`, `Status (pass/fail/n/a)`, `Evidence`, `Fix recommendation if red`.

Example:

```
# | Item                               | Status | Evidence                      | Fix
1 | Prototype match at 1440px         | PASS   | screenshot diff 0.02%         | -
2 | No horizontal scroll at 320px     | FAIL   | <Table> breaks at 360px       | Use <CardList> below 768px
3 | Dark and light mode polished      | PASS   | both screenshots match        | -
...
15| Founder gate: "feels like GammaHR"| PENDING| awaits founder review         | Present built page to founder
```

Report size: as long as it needs to be (a 15-row table). Do NOT add commentary beyond the Evidence and Fix columns. The founder wants facts, not opinions.

### Step 7: If any agent-verifiable item failed

Stop. Do not sign off the gate. List the failures clearly. Recommend a specific next action for each failure. Do not attempt to fix the failures in this skill; that is a `build-page` task or a manual fix task.

## When this skill should not be used

- **During development** of a half-built feature. The gate is a ship-ready check, not a continuous linter. Use `build-page`'s Step 6 self-check for in-progress work.
- **For pre-launch security audit**. That needs the expanded audit covered in `docs/FLAWLESS_GATE.md` at the bottom, not this skill.
- **For performance profiling**. Performance targets (Lighthouse, bundle size, FCP/TTI) are in the expanded audit, not in the 15-item gate.

## Delegate to webapp-testing, do not duplicate

The global `webapp-testing` skill owns Playwright automation. This skill owns the 15-item checklist. When you need to capture a screenshot, run an E2E, inspect a DOM, or automate any browser interaction, invoke `webapp-testing` explicitly. Do NOT re-implement Playwright patterns here. Skills compose; they should not duplicate.

## Shared references with build-page

The 15-item checklist is also in `.claude/skills/build-page/references/flawless-gate.md` because `build-page`'s Step 6 self-check uses it. Both skills reference the same underlying rules. If the 15 items change, update both files or better yet move the shared content to one place and have both skills reference it.
