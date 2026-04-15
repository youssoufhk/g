# Testing Strategy

> **Who this is for.** The engineer writing new code. The agent reviewing a PR. The founder telling a prospect "we test everything before it ships". The investor asking "how do you maintain quality as you scale".
> **What this is.** The six layers of testing that make Gamma's quality regressions visible on every code change, the enforcement model, and the commercial positioning that flows from it.
> **Why this matters commercially.** "We run 45 end-to-end scenarios on every code change and we do not ship if any of them regress" is a demonstrable claim. Kantata cannot make it. Personio cannot make it. Most SaaS startups cannot make it. This is a moat you can point to in a sales call, and a prospect can verify by asking to see the CI output.

---

## 1. The six layers

### Layer 1: Unit tests (per function, per tool, per rule)

**What:** pytest unit tests for every public function in a service, every AI tool (mocking the LLM), every tax rule, every labor rule, every invoice math primitive.

**Coverage target:**
- 85% line coverage overall
- **100% on financial math** (invoice line generation, tax calculation, leave balance, FX conversion, currency math)
- 100% on authentication and RBAC path
- 100% on tenant scoping (every query has a tenant filter test)

**Running:** every commit. pytest-cov enforces the thresholds. Merge is blocked if coverage drops below target OR if any financial test fails.

**Tooling:** pytest, pytest-cov, pytest-asyncio (for async code), pytest-mock. No test framework beyond these in v1.0.

### Layer 2: Property-based tests for financial invariants

**What:** Hypothesis-library tests that generate thousands of random valid inputs and assert invariants that must hold for any valid input.

**Invariants to test (v1.0 starting set; extend as features ship):**

| Invariant | Module tested | Why it matters |
|---|---|---|
| `sum(invoice_lines.total_cents) == invoice.subtotal_cents` | invoices.line_generator | Line total must match invoice subtotal for any valid invoice |
| `invoice.subtotal_cents + invoice.tax_cents == invoice.total_cents` | invoices.service | No rounding holes between subtotal, tax, and total |
| `sum(timesheet_entries.duration_minutes) matches sum(invoice_lines.quantity_in_minutes)` | invoicing_agent | No time is billed twice or missed |
| `leave_balance.accrued - leave_balance.used - leave_balance.pending >= 0` | leaves.accrual | Balance can never go negative |
| FX conversion is transitive within 1 cent tolerance (EUR -> USD -> EUR) | core.money | FX math is reversible |
| Rate precedence chain always resolves to exactly one rate (never zero, never two) | invoices.rate_resolver | No invoice lines with null rate, no ambiguity |
| Tenant schema queries filtered by `search_path` return zero rows from other tenants | core.tenancy | Tenant isolation is structural, not per-query |
| Overlapping `project_allocations` for the same employee-project are rejected | projects.allocation_validator | DB exclusion constraint + service layer check |
| Approval delegation cannot create cycles (A to B to A) | approvals.delegation | Service-layer check detects cycles before insert |

**Running:** every commit. Hypothesis generates 100 examples per property by default, 1000 in CI nightly. Blocks merge on any invariant failure.

**Tooling:** `hypothesis` library.

### Layer 3: Contract tests between frontend and backend

**What:** the OpenAPI schema is the contract. FastAPI emits it automatically from route signatures and Pydantic models. The frontend generates TypeScript clients via `openapi-typescript`. No hand-written API clients.

**Enforcement:**
- On every PR, CI runs `openapi-typescript` and fails if the generated types differ from the committed ones without a corresponding schema change.
- On every PR, a contract test spins up the backend and hits every documented endpoint with a minimal valid request. It asserts the response schema matches the OpenAPI spec exactly.
- Breaking changes to the schema require a v2 endpoint (see `docs/MODULARITY.md` M8). v1.0 does not ship v2, but the v2 mechanism is in place for when it lands.

**Why this matters:** when a backend engineer changes a response shape, the TypeScript compilation breaks in the frontend on the next PR. Caught at type-check time, not in production.

### Layer 4: End-to-end scenario tests (the moat)

**What:** Playwright tests that run the full user journey for real, multi-step scenarios. NOT "can I log in and see a button". Real scenarios with real data and real database state at every step.

**v1.0 scenario inventory (target: 45 scenarios by Phase 5 exit):**

1. **Tenant onboarding:** a new consulting firm signs up, imports 200 employees from CSV (via the AI column mapper), the owner invites 15 managers, managers accept. Assert: all 201 users exist, the correct roles are set, the CSV import audit log is complete.
2. **Weekly timesheet cycle:** an employee submits week 42 timesheets, their manager approves, the weekly report shows 40 billable hours. Assert: the `timesheet_week.status` transitions through draft -> submitted -> approved; the audit log has 3 rows; the approval notification fires.
3. **Expense with OCR:** an employee uploads a receipt image, the OCR tool returns merchant + amount + date, the user confirms, the manager approves, the expense appears in the project budget burn. Assert: OCR values are stored; audit log is complete; project actuals update.
4. **Month-end close agent happy path:** on the 1st of the month, the agent drafts 14 invoices from the prior month's approved timesheets, the finance user reviews each, confirms all 14, batches send. Assert: 14 invoices transition draft -> ready -> sent; all have correct tax for their client's country; PDFs render byte-identical to snapshot; audit log has 42 rows (draft + confirm + send per invoice).
5. **Month-end close with kill_switch.ai on:** same as scenario 4 but the AI is disabled. Assert: draft queue still renders; analyzer signals still show; paragraph explanations are replaced with the fallback message; user still closes the month.
6. **Leave request + approve + balance update:** employee requests 5 days, manager approves, leave_balance.used increments, leave_balance.balance decrements, the period shows as unavailable on the timesheet grid. Assert: all four data changes occur in one transaction; audit log is complete.
7. **Approval delegation:** manager A delegates to manager B for one week, B approves on A's behalf, audit log shows `actor=B, on_behalf_of=A`. Assert: delegation honored; audit log correct; email notification goes to A with the on-behalf-of note.
8. **Bulk approval:** a finance user selects 12 pending expenses and bulk-approves them. Assert: 12 approval rows inserted; 12 audit rows; one service-layer transaction (not 12 round trips).
9. **Multi-currency invoice:** a UK tenant bills a GBP client; the invoice PDF shows GBP; the tenant's base_currency is EUR; the FX rate is stamped on the invoice. Assert: PDF locale is en-GB; amounts render with GBP symbols; fx_rate_to_base is set on the invoice row.
10. **Optimistic mutation with 409 conflict:** user A loads an entity at version 1, user B updates it to version 2, user A submits a change; server returns 409; user A's UI opens the ConflictResolver; A chooses "keep mine"; update goes through. Assert: the resolver flow works end to end on both "keep mine" and "take theirs".
11. **Offline timesheet entry:** PWA is taken offline, user creates 5 timesheet rows with `local_id` and `version=-1`; PWA reconnects; rows sync via `/api/v1/timesheets/sync-offline`; server assigns ids and version=0. Assert: all 5 rows land on the server; client IndexedDB is updated; no duplicate rows.
12. **GDPR DSR right-of-access:** a user requests their data; the endpoint returns a ZIP of CSVs covering timesheets, leaves, expenses, profile, audit entries. Assert: ZIP contains expected files; content matches the database state; response time under 5 minutes.
13. **GDPR DSR right-of-erasure:** a user requests deletion; the service anonymizes PII, keeps audit log for retention period, returns success. Assert: email is replaced with `deleted-<uuid>@gammahr.invalid`; audit rows still exist; no referential integrity violations.
14. **Tenant data export on offboarding:** an admin requests a full tenant export; the operator console generates a ZIP with all tenant data; the tenant is marked as closed. Assert: export includes every table; no cross-tenant leakage; export is idempotent.
15. **RBAC cross-tenant rejection:** user in tenant A tries to access tenant B endpoint (via manipulated URL). Server returns 403. Assert: response is 403 Forbidden with error `invalid_tenant`; audit log records the attempt.
16. **Operator impersonation audit trail:** operator impersonates user X in tenant A, creates an expense, logs out; the audit log shows `actor_type=operator, on_behalf_of_user_id=X, on_behalf_of_tenant_id=A`. Assert: session auto-expires in 30 minutes; no cross-tenant switching in the same session.
17. **WebSocket notification delivery and catchup:** user A connects WS; user B in the same tenant creates an approval request; user A receives the notification in real time. User A disconnects for 5 minutes; during that time 3 more notifications fire; user A reconnects and receives the backlog from the 24h Redis queue.
18. **WebSocket tenant scoping:** user A in tenant 1 connects; user B in tenant 2 performs an action that fires an event; assert user A does NOT receive B's event.
19. **Schema migration reversibility:** a test migration adds a column; alembic downgrade reverts it; alembic upgrade reapplies; all existing data is preserved. Assert: idempotent.
20. **Feature flag module drop:** the expenses module flag is turned off; the `/api/v1/expenses/*` routes return 404; the other features still function normally.

**Scenarios 21-45** (shortlist, specified during Phase 5 build as features land):
- Invoice PDF snapshot regression (one scenario per country template: FR, UK; adding per new country)
- Email template snapshot regression (per transactional template)
- Command palette tool selection accuracy (one scenario per tool in the registry)
- Insight card generation (daily job run on a fixed seed tenant, top 5 cards must match expected signals)
- Leave accrual on month boundary (timezone edge cases, leap year February)
- Approval undo within 5 seconds
- Invoice number uniqueness across years (Dec 31 -> Jan 1 transition)
- Rate change mid-period (invoice generates two lines per employee-project)
- Project overallocation warning
- Custom contract tenant billing (operator sets a custom ACV)
- Dashboard KPI cache refresh on window focus
- Command palette kill switch degradation
- Offline read cache warm on second visit
- Mobile PWA installability
- Dark mode and light mode parity on every page
- EU reverse-charge B2B invoice emission

**Running:**
- Full suite runs on every PR to `main` (blocks merge on failure)
- Parallelized to 10 minutes wall time via Playwright workers
- The 15 critical scenarios run as a smoke subset on every commit (3-minute wall time)
- Nightly runs on `main` for regression detection

**Tooling:** Playwright, pytest-playwright, a test fixtures loader that seeds the canonical 201-employee tenant.

### Layer 5: Snapshot tests for PDFs and emails

**What:** deterministic output is compared byte-for-byte (or with 1% pixel-diff tolerance for PDFs) against committed snapshots.

**What is snapshotted:**
- Invoice PDFs (FR, UK; per template variant)
- Email templates (invoice send, approval notification, expense submitted, timesheet reminder, password reset, MFA enrollment)
- JSON API responses for stable endpoints (as a supplementary check beyond contract tests)

**Running:** every commit. Snapshot changes require explicit approval in the PR (the reviewer visually inspects the rendered diff and accepts).

**Tooling:** pytest snapshot plugins, image-diff library for PDF pixel comparison, verapdf for PDF/A-1b conformance on French invoices.

### Layer 6: Chaos and load tests (scheduled, not per-commit)

**What:** resilience tests that run on a schedule, not on every commit.

**Chaos tests (quarterly):**
- Schema migration against 50 simulated tenants with random failure injection. Asserts the rollback runbook recovers cleanly.
- WebSocket infrastructure kill (stop the WS pod; clients must fall back to polling; no data loss).
- Celery worker crash mid-job (timesheet import of 10k rows; worker SIGKILL at 50% progress; restart worker; import resumes from checkpoint).
- GCP region outage simulation (Cloud SQL failover drill).

**Load tests (monthly):**
- Canonical 201-employee tenant exercised by 20 concurrent synthetic users for 30 minutes. Workload: mixed timesheet, expense, approval, invoice operations.
- Target: p50 < 200 ms, p95 < 500 ms, p99 < 2 s on every API call. Regressions tracked month-over-month; any 20% degradation triggers an investigation.
- AI cost load test: simulated burst of 100 command palette queries in 1 minute; assert the rate limiter kicks in at 20 queries; assert the hourly ceiling at 1 EUR.

**Tooling:** Locust for load, custom Python for chaos, a dedicated `staging-chaos` environment separate from `staging`.

---

## 2. AI eval harness (layer 1.5, special)

Because LLM outputs are probabilistic, AI tests are separate from strict-equality unit tests.

Every AI-assisted feature has a golden eval set of 20-50 hand-curated examples. CI runs evals on every prompt change, tool definition change, or model-version change. Failures below threshold block merge.

**v1.0 eval sets:**

| Feature | Examples | Pass threshold |
|---|---:|---|
| Command palette router (tool selection) | 50 | 90% (picks the correct tool) |
| OCR receipt extraction | 30 | 95% on amount, 90% on merchant, 95% on date |
| Insight card ranking | 20 | 75% (coherence and relevance, human-rated synthetic baseline) |
| Month-end close agent explanations | 30 | 85% severity classification, 80% top-signal ranking, 95% fluency |

**Rules:**
- Eval examples use synthetic data only. Never real customer data. Never real receipts.
- Evals are committed to the repo under `backend/app/ai/evals/`.
- Eval results are stored as artifacts for historical comparison.
- A model version bump (Gemini Flash 2.5 -> 2.6) runs the full eval suite; any regression requires approval to roll forward.

---

## 3. The commercial positioning that flows from this

"We run 45 end-to-end scenarios on every code change. We do not ship if any of them regress." This is a claim you can make in a sales call AND the prospect can verify by asking to see a recent CI run.

Competitive framing:
- Personio: does not publish its testing stack. Their bug surface is visible in G2 reviews.
- Kantata: heavy manual QA. Slow release cycles. Known for regressions.
- HiBob: better than Kantata but still integration-test light.
- Rippling: good engineering culture but broad surface means some modules are under-tested.

Gamma's pitch: "We run the same 45 scenarios as your finance team would run, every time our code changes, before any human sees the change. If a scenario breaks, the code does not ship. That is why our gate is called 'flawless'."

This claim is one of the top 3 reasons a CFO signs. Back it up with real CI output in the follow-up email.

---

## 4. Enforcement checklist

| Layer | Gate | Who enforces | Failure mode |
|---|---|---|---|
| 1. Unit | CI, every commit | pytest-cov + financial test marker | Merge blocked |
| 2. Property | CI, every commit | Hypothesis | Merge blocked |
| 3. Contract | CI, every PR | openapi-typescript diff | Merge blocked |
| 4. E2E scenarios | CI, every PR (full) + commit (smoke) | Playwright | Merge blocked on any regression |
| 5. Snapshots | CI, every commit | pytest snapshot | Merge blocked on unapproved change |
| 6. Chaos + load | Scheduled (quarterly, monthly) | Locust + custom | Alerts founder; drift fixed within 2 weeks |
| AI evals | CI, prompt/model change | custom harness | Merge blocked on threshold breach |

---

## 5. What testing does NOT replace

You cannot test your way to flawless. Tests catch regressions; they do not create quality. Quality comes from:

- **Taste and design judgment.** The flawless gate's item 15 ("feels like Gamma") is explicitly subjective, explicitly founder-judgment. No test suite can automate it.
- **Prototype parity.** Comparing a page to `prototype/<page>.html` at 1440px is a visual discipline, not a test.
- **Empathy for the user.** Knowing that the finance director will panic if the month-end close page is slow on the 1st at 9am requires human imagination, not coverage percentages.
- **Architectural discipline.** See `docs/MODULARITY.md`. Tests enforce architecture but do not create it.

Think of testing as a safety net: it catches you when you fall. It does not stop you from tripping. Both the net and the balance are required.

---

## 6. v1.0 phasing

Testing infrastructure ships in phases alongside features:

- **Phase 2 (foundation):** pytest + pytest-cov + Hypothesis + Playwright installed; CI pipelines configured; contract test harness running; first 5 E2E scenarios drafted (onboarding, timesheet, leave, expense, invoice). Eval harness skeleton with 5 month-end close examples. Snapshot test framework.
- **Phase 3 (onboarding + auth):** scenarios 1-3 (tenant onboarding, weekly timesheet, expense with OCR). RBAC tests across tenants.
- **Phase 4 (core data):** scenarios 6-10 (leave, approval delegation, bulk approval, multi-currency, optimistic mutation).
- **Phase 5 (core modules):** scenarios 4, 5, 11-20 (month-end close happy path, kill switch, GDPR DSRs, RBAC, WebSocket, migrations). Full AI eval sets for all 16 tools.
- **Phase 6 (Tier 2 + portal):** scenarios 21-35.
- **Phase 7 (hardening):** scenarios 36-45. First chaos drill. First load test. SOC 2 Type 1 audit uses the test output as evidence.

Target: 45 scenarios live by launch. 50+ by month 6 post-launch.

---

## 7. Cross-references

- `docs/FLAWLESS_GATE.md` items 11 (performance), 12 (E2E), and the expanded audit section.
- `docs/MODULARITY.md` for the architectural discipline that makes modules testable.
- `specs/AI_FEATURES.md` section 9 (evaluation harness) for AI-specific eval rules.
- `CLAUDE.md` section 7 for the quality gate summary.
