# THE PLAN

> **Read this file before every session. It is the only roadmap that matters.**
> Last rewrite: 2026-04-18. Supersedes: `CRITIC_PLAN.md`, `SELLABILITY_PLAN.md`, `opus_plan.md`, `opus_plan_v2.md`, `OPUS_CRITICS.md`, `OPUS_CRITICS_V2.md`, `HAIKU_CRITICS.md`, `EXECUTION_CHECKLIST.md`, `PROMPT.md`, `FOUNDER_CHECKLIST.md §non-build items`, and `docs/DEFERRED_DECISIONS.md`. All 75 deferred decisions are folded inline here (§6). Those files are deleted in a follow-up commit so git revert remains clean.
> One plan. Tiered pricing (€17 / €29 / €45 + €8k pilot). Brutal priorities. Agent-executable detail.
>
> **How agents use this file.** Every task in §4 and §5 has a file path, an acceptance criterion, and a test to add. Every deferred decision in §6 has a trigger. Agents never "interpret" this plan: they pick the next unchecked task in §4, read the referenced spec + prototype, run the 70-item `docs/FLAWLESS_GATE.md`, commit, and tick the box.

---

## 0. The 30-second summary

Gamma is a PSA for 50-500 seat EU consulting firms with an agentic month-end close layered on top. Two founders, zero paying customers, Phase 2 foundation is shipped, most of the frontend reads mock data, and the one feature that justifies premium pricing (the month-end close agent) does not exist yet. **Everything in this plan is ordered by distance to €1 of revenue.**

The honest state, summarized for agents:
- Backend: 14 feature modules scaffolded, 189 tests pass, 15 of 16 AI tools built, schema-per-tenant runner live, Ollama wired, idempotency + audit + kill-switch + GDPR encryption stubs applied.
- Frontend: 19 pages built, all on the design bar, i18n EN+FR in lock-step, but **still reads `lib/mock-data.ts`**. Nothing is wired to the live API end-to-end.
- Product: zero customers. Zero pilots. Zero measured value.

**What we are shipping next is not features. It is revenue.**

Full honest state in §3. Per-task execution in §4. Quarterly roadmap in §5. Every deferred decision inline in §6.

---

## 1. The CEO/COO reality check (read in full, once per week)

### 1.1 Who pays €35/seat for what?

Nobody, at v1.0. The current published floor was €140-170/seat/year (`docs/GO_TO_MARKET.md §2`), roughly €11.67-14.17/month. The step to €35/month (€420/year) is conditional on five things clearing, in this order:

1. A working month-end close agent measured on a real customer's data with a video they let us publish.
2. SOC 2 Type 2.
3. SCIM + SAML (procurement gate for any 200+ seat buyer).
4. Third-party pen-test report.
5. A signed case study with a named hero number (e.g. "closed in 2 hours instead of 3 days").

None of the five have shipped. Pricing follows value, not ambition. Until then the list price is tiered (§2).

### 1.2 Competitive reality

| Tool | €/seat/month | What they sell |
|---|---:|---|
| Factorial | 8 | EU HR + light time tracking |
| BambooHR | 10 | HR-first, light PSA |
| Pleo | 14-25 | Expense cards + OCR |
| Float | 7.50 | Resource planning |
| Harvest + Float | 18-26 | Time + capacity |
| Kantata | 25-39 | Full PSA + AI forecasting |
| Notion Business + AI | 24 | Docs + AI Q&A |
| **Gamma Essential (target)** | **17** | PSA core, no agents |
| **Gamma Business (target)** | **29** | PSA + OCR + close agent + SSO |
| **Gamma Enterprise (target)** | **45** | Business + autopilot agents + SOC 2 + TAM |

€17 beats Factorial for a consulting firm that wants projects + invoicing (Factorial is HR-first). €29 is defendable if and only if the close agent is real. €45 is defendable only once the enterprise gates clear.

### 1.3 What would a cynical COO do this quarter?

1. **Pick one pilot target.** One named consulting firm CFO or COO, 50-200 seats, EU, warm intro. Not ten. One.
2. **Wire the frontend to the backend on three pages only:** timesheets, expenses, invoices. Drop mock data on those three. The rest can keep the mocks; nobody pays for data they cannot put in and get out.
3. **Ship a prototype of the month-end close agent** on that one pilot's data. Measure the time savings in minutes, on video, with their CFO's face on camera.
4. **Use the video as the entire pitch** for customers 2-10. Stop building features until the video exists.
5. **Delete every plan file** that is not THE_PLAN, CLAUDE, one spec per concern, and one ADR per decision.

Everything below is this COO playbook, made concrete.

---

## 2. Pricing (locked 2026-04-18, reviewed after customer 5)

Annual billed, ex-VAT, EUR. Seat = active user in last 30 days. Reference users who appear in data but never log in are not billable.

### 2.1 The tiers

| SKU | List €/seat/month | Annual €/seat | Canonical 201-seat ACV | What it buys |
|---|---:|---:|---:|---|
| **Starter (pilot)** | - | - | €8,000 flat | 90-day, 10-seat pilot. Real data, no production commitment. Converts to any tier or closes cleanly. |
| **Essential** | **17** | **204** | **€41,004** | Time, projects, clients, expenses (manual), invoices, leaves, approvals, admin, account, dashboard. PWA mobile. CSV import + export. EU data residency. Email support. |
| **Business** | **29** | **348** | **€69,948** | Essential + receipt OCR + Cmd+K AI palette + insight cards + **month-end close agent** + SCIM + SAML + multi-rate VAT + priority support. |
| **Enterprise** | **45** | **540** | **€108,540** | Business + expense anomaly agent + overdue cash agent + overwork sentinel + budget burn agent + dedicated TAM + pen-test report + source-code escrow + uptime SLA + custom DPA + SOC 2 Type 2. |

**Why three tiers, not one.** A single €35 SKU forces every buyer through the same gate. With three tiers: SMB (50-100 seats) says yes at Essential, the main pipeline (100-300) lives at Business, and Enterprise (200-500) is a lever we only pull after the gates clear. Loss of the top band does not kill the quarter.

**Why annual only.** Monthly billing doubles finance overhead and pulls procurement into a quarterly conversation. Founder time is the scarcest resource. Annual is locked for v1.0. Monthly is DEF'd (fires at customer 6 when Stripe/Revolut lands, see §6 DEF-029).

**Why no free tier.** The free tier in a 200-seat firm is the competition's foot in the door. Our free tier is the 90-day pilot at €8k, which trades cash for our own commitment to the customer's success.

### 2.2 Discounts and floors

- Early-adopter discount: first 5 annual conversions get **30% off year 1, 20% off year 2, 10% off year 3**, grandfathered on any tier the customer sits on when they convert. Written into their custom contract per `backend/app/features/admin/` tenant_custom_contracts row.
- Procurement floor: never quote below **€120/seat/year** on Essential or **€240/seat/year** on Business. Below those the unit economics break (GCP + Ollama inference + support + 20% founder margin).
- Enterprise: no published list; priced on seat count × SKU × contract term × negotiated add-ons. Minimum 200 seats.

### 2.3 Pricing review triggers

The €17 / €29 / €45 bar is reviewed when any of the following fires:
- Customer 5 signs at Business or Enterprise (anchor is proven).
- SOC 2 Type 2 lands (enterprise step-up enabled).
- Two consecutive months of pilot-to-annual conversion <50% (pricing too high or value too thin).
- Renewal churn in the first 3 cohorts >15% (price-value mismatch).

Every price change writes one row into `docs/pricing_history.md` with date, old tier, new tier, and trigger.

---

## 3. What is actually done (honest, as of 2026-04-18)

This replaces every "DONE" claim in the dead `EXECUTION_CHECKLIST.md`. A row is done only if it has code + tests + at least one user-visible path on a real browser.

### 3.1 Foundation (Phase 2) - DONE

- `make mvp-up` brings up Postgres + Redis + Mailhog + backend + frontend locally.
- 45+ property + contract + tenancy tests green.
- 9 vendor wrappers M1 with stubs. CI lint blocks vendor SDK imports outside wrappers.
- 20 atoms + 13 patterns. Dark + light. Tokens byte-exact with prototype.
- Pre-commit hooks: em-dash, banned words, console.log, `#fff`/rgba, inline Intl, hardcoded aria-labels, no-raw-icon-size, hardcoded-date-locale.

### 3.2 Backend features - SCAFFOLDED, NOT WIRED TO PRODUCTION DATA

Every feature below has `routes.py` + `service.py` + `models.py` + `schemas.py` + `ai_tools.py`. None serve the frontend yet because the frontend reads mocks.

- `auth` - OIDC scaffold, password + JWT, audience binding (ops/app/portal).
- `admin` - tenants, flags, kill switches, subscription stubs.
- `imports` - CSV pipeline, AI column mapper, tested commit endpoint.
- `employees`, `clients`, `projects` - CRUD + AI tools.
- `timesheets`, `leaves`, `expenses`, `invoices`, `approvals` - CRUD + AI tools; no business logic beyond service shape.
- `dashboard` - stub returning deterministic KPIs.
- `search` - feature-registry backed.
- `ai/` - AIClient protocol, MockAIClient, OllamaAIClient, 15 of 16 tools in `ai/registry.py`, golden-example evals per tool, PII boundary metatest.
- Schema-per-tenant: `alembic_runs` table + `migrations/runner.py` + fan-out Celery task.
- Confidential tier: `employee_compensation`, `employee_banking`, `leave_requests.reason_encrypted` with `pgcrypto` stub.
- Idempotency middleware + audit writer + `@audited` + `@gated_feature` applied to every mutating route.
- Seed script: 1 admin user + 201 employees + 120 clients + 260 projects + 700 leaves + 10,400 timesheet weeks + 39,000 entries + 8,400 expenses + 900 invoices + 9,000 invoice lines + audit log + notifications. **Pinned counts test blocks regression.**
- 189 backend tests pass.

### 3.3 Frontend - DESIGN BAR MATCHED, LIVE DATA NOT WIRED

- 19 pages all on the Leaves/Dashboard bar: PageHeader, app-aura, 3-tile KPI row, AI recommendations where real, `useUrlListState` on list pages, skeleton + empty + error branches, aria-busy + aria-live.
- i18n EN + FR in lock-step (1191 leaves each). Parity metatest prevents raw-key leaks.
- All dates and currencies via `lib/format.ts`. Tabular nums globally.
- Design system hygiene: 0 hardcoded English, 0 `#fff`/rgba in shipped code, 0 console.log, 0 em dashes, 0 banned words, 0 raw icon sizes.
- Command palette shell built; entity search works; 15 LLM-router tools registered but not wired end-to-end.

### 3.4 Governance + quality gates - STRUCTURAL

- Unified 70-item `docs/FLAWLESS_GATE.md` under ADR-012.
- M1-M10 modularity rules enforced in CI per `docs/MODULARITY.md`.
- Six testing layers defined in `docs/TESTING_STRATEGY.md`.

### 3.5 What is NOT done, bluntly

- **Month-end close agent.** Zero code. The scaffolding exists; the analyzer + handler + eval suite + UI do not. See §4 Weeks 3-4.
- **Frontend wired to live API on any page.** All 19 pages still read `lib/mock-data.ts`. See §4 Weeks 1-2.
- **First pilot customer.** No named lead committed in writing. See §4 Weeks 5-6.
- **Staging or production deployment.** `docs/ROLLBACK_RUNBOOK.md` untouched. `make mvp-up` is the only running surface. See §4 Weeks 7-10.
- **4 residual CRITIC items:** A3 (`useOptimisticMutation` retrofit), B1 (8 invented patterns ADR), C11 (real audit_log on detail pages), C13 (`ConflictResolverProvider` smoke test). Folded into §4 Weeks 7-10.
- **SOC 2, pen-test, escrow.** All deferred to §5 Q3-Q4.

---

## 4. The 12-week path to first €1 of revenue

12 calendar weeks, two-founder cadence, ~24-34 combined productive h/week. This is the only roadmap that matters. Everything else slides.

Every task below carries (**File:** absolute path in repo), (**Do:** one-sentence action), (**Accept:** pass/fail criterion), (**Test:** the test file path and assertion to add), (**DEF refs:** any deferred decisions whose triggers could fire during this task, pointing into §6). Agents do not improvise beyond these four lines.

### 4.0 Rules for every week

- **Read order before starting any task:** `CLAUDE.md` → this file §4 for current week → referenced spec (`specs/*.md`) → prototype HTML → memory (`~/.claude/projects/.../memory/MEMORY.md`) → target file.
- **Commit rhythm:** one logical task = one commit. Commit message names the task number (e.g. `week1.1: timesheets wire to /timesheets/weeks`) + `## senior-ui-critic` and `## senior-ux-critic` reports when frontend touched.
- **No `git commit` without founder ask.** CLAUDE.md rule 9. Agents stage changes and ping the founder for `/commit`.
- **No new atoms, no token edits.** CLAUDE.md rules 3 and 4. If tempted, stop and ask.
- **70-item gate before ticking box.** `docs/FLAWLESS_GATE.md`. Partial gates lie.

---

### Weeks 1-2: Close the loop on three pages

**Goal:** timesheets, expenses, invoices render live from the backend on a seeded tenant. No mock data on those three. The rest can keep mocks.

#### Task 1.1 - Wire timesheets

- **File:** `frontend/features/timesheets/use-timesheets.ts`
- **Do:** flip `USE_API` dual-arm to always-on; point week list to `GET /api/v1/timesheets/weeks`, per-week detail to `GET /api/v1/timesheets/weeks/{id}`, entry writes to `PATCH /api/v1/timesheets/weeks/{id}/entries`. Use `lib/api-client.ts` fetcher; do not write a new fetcher.
- **Do also:** delete `lib/mock-data.ts` imports from `app/[locale]/(app)/timesheets/page.tsx` and `app/[locale]/(app)/timesheets/[week_id]/page.tsx`. Replace with the hook.
- **Accept:** `make mvp-up` + a seeded browser session at `/timesheets` lists 10,400 weeks from DB, paginated. Opening a week loads its entries. Editing a cell fires a real `PATCH`. Autosave hits the API.
- **Test:** `frontend/tests/e2e/timesheets.spec.ts` - Playwright: navigate `/timesheets`, assert 1+ row with non-empty submitter name, open one week, type `8` into a draft cell, blur, assert `PATCH` response 200, assert cell persists on reload.
- **DEF refs:** none fires during this task.

#### Task 1.2 - Wire expenses

- **File:** `frontend/features/expenses/use-expenses.ts`
- **Do:** flip `USE_API`; point list to `GET /api/v1/expenses`, submit to `POST /api/v1/expenses` via existing `useSubmitExpense` mutation. Keep OCR two-stage row landed in CRITIC A4.
- **Do also:** replace `CLIENT_NAMES` lookup (if any stub) at `app/[locale]/(app)/expenses/page.tsx` with the real joined response.
- **Accept:** `/expenses` lists 8,400 seeded expenses with employee names expanded server-side. Submit modal + photo upload produces a new DB row with `status='draft'`, visible on page reload.
- **Test:** `frontend/tests/e2e/expenses.spec.ts` - Playwright: open submit modal, attach `tests/fixtures/receipt.jpg`, fill amount 42, submit, assert row appears with amount 42 and status draft.
- **DEF refs:** none.

#### Task 1.3 - Wire invoices

- **File:** `frontend/features/invoices/use-invoices.ts`
- **Do:** flip `USE_API`; list → `GET /api/v1/invoices`, detail → `GET /api/v1/invoices/{id}` + `GET /api/v1/invoices/{id}/lines`. Drop the `CLIENT_NAMES` map at `invoices/page.tsx:66`. Expand client + project names server-side via the existing `?expand=client,project` param.
- **Accept:** `/invoices` lists 900 seeded invoices with client names visible, filter by status works, opening one invoice shows its 8-12 real line items.
- **Test:** `frontend/tests/e2e/invoices.spec.ts` - Playwright: navigate `/invoices`, assert ≥100 rows, open one with `status=sent`, assert total matches sum of lines to 2 decimal places.
- **DEF refs:** none.

#### Task 1.4 - Run the 70-item gate on all three

- **Do:** for each of `/timesheets`, `/expenses`, `/invoices`, run `docs/FLAWLESS_GATE.md`. Save screenshots to `docs/gate-reports/<feature>/`. Invoke `senior-ui-critic` and `senior-ux-critic` subagents; paste reports into the commit message.
- **Accept:** 70/70 green on all three pages. Zero red items. Any red item returns the feature to the builder.

#### Task 1.5 - Delete dead mock imports

- **File:** `frontend/lib/mock-data.ts` (partial)
- **Do:** remove the three feature sections (timesheets, expenses, invoices) from the mock file. Keep the rest (employees, clients, projects, etc.) until their weeks land in §5.
- **Accept:** `grep -R "from.*mock-data" frontend/features/timesheets frontend/features/expenses frontend/features/invoices` returns zero.

**Week 2 exit criterion:** a browser session at `make mvp-up` shows 201 employees' timesheets, 8,400 expenses, 900 invoices from the database. Zero mock imports on those three pages. All three pages pass the 70-item gate.

**DEFs whose trigger could fire this fortnight:** none expected. See §6 for the full list and triggers.

---

### Weeks 3-4: Month-end close agent MVP

**Goal:** a working analyzer that drafts invoices for one month on the canonical seed. Gemma (Ollama) ranks and explains. User confirms. This is the one feature that justifies the Business tier.

Cross-reference: `specs/APP_BLUEPRINT.md §8.3` is the source of truth for this feature. Every task here anchors on a section of that spec. `specs/AI_FEATURES.md §7` names the `explain_invoice_draft` tool.

#### Task 2.1 - Feature module skeleton

- **File (new):** `backend/app/features/invoicing_agent/{routes,service,models,schemas,ai_tools,analyzers,tasks}.py` + `tests/`.
- **Do:** create one-sentence-per-file shells per M10 rule (one domain concept per file). `models.py` holds the `InvoiceDraft` row (referencing `invoices.id` and period). `service.py` owns the draft-generation algorithm. `analyzers.py` holds the deterministic analyzer functions. `tasks.py` holds the Celery fan-out. `ai_tools.py` wraps `explain_invoice_draft`.
- **Accept:** import works; `routes.py` registers `/api/v1/invoices/month-end/*`; empty tests pass.
- **Test:** `tests/test_invoicing_agent_shape.py` asserts the four routes from APP_BLUEPRINT §8.3 exist in the OpenAPI schema.
- **DEF refs:** DEF-029 (payments) does not fire; we still invoice manually in Phase 2.

#### Task 2.2 - Deterministic draft generator

- **File:** `backend/app/features/invoicing_agent/service.py`
- **Do:** implement `generate_drafts(period_start, period_end) -> list[DraftInvoice]`. For each client with ≥1 approved `timesheet_entries` or `expenses.billable=true` in the period, build one draft per the algorithm in `specs/DATA_ARCHITECTURE.md §4.4.1`. Uses `rate_periods`, `projects.billing_type`, `expenses.markup_pct`. Writes `invoices` rows with `status='draft'` and a `draft_batch_id` linking them.
- **Accept:** `POST /api/v1/invoices/month-end/start` with period=2026-03 creates N ≤ 120 drafts (one per client with billable activity), idempotent on replay (same period twice = same output byte-for-byte).
- **Test:** `tests/test_invoicing_agent_service.py::test_idempotent_snapshot` - snapshot of the draft list for period 2026-03 on the canonical seed.
- **DEF refs:** DEF-001 (full workflow engine) does not fire; drafts use single-hop finance approval. DEF-006 (retainers) does not fire; only T&M + fixed-price projects flow into drafts.

#### Task 2.3 - Nine deterministic analyzers

- **File:** `backend/app/features/invoicing_agent/analyzers.py`
- **Do:** implement the nine signals from APP_BLUEPRINT §8.3: `rate_change_mid_period`, `line_count_anomaly`, `total_value_anomaly`, `new_employee_on_project`, `fx_rate_fallback_used`, `client_on_hold`, `expense_not_matched`, `unmatched_approved_entries`, `milestone_due`. Each returns `{code, severity, human_readable_reason, entity_refs}`.
- **Accept:** each analyzer has 2+ unit tests (positive case + negative case). No analyzer touches the LLM.
- **Test:** `tests/test_analyzers.py::test_<code>_<case>` - one per case.

#### Task 2.4 - `explain_invoice_draft` AI tool

- **File:** `backend/app/features/invoicing_agent/ai_tools.py`
- **Do:** register the 16th tool per `specs/AI_FEATURES.md §3.1`. Input: draft + analyzer signals. Output: one paragraph (2-3 sentences, plain text, no markdown, no em dashes) + top 3 ranked signals. Batched at up to 20 drafts per prompt call.
- **Accept:** `ai/evals/invoicing_agent/` has 5 golden examples (clean-close, missing-timesheets, expense-outlier, FX-mixed, small-client). CI blocks on regression.
- **Test:** `backend/app/ai/evals/invoicing_agent/test_golden.py` runs the five examples through the Ollama tier locally (MockAIClient in CI) and asserts the ranker returns the expected top-1 signal.

#### Task 2.5 - Month-end close page

- **File (new):** `frontend/app/[locale]/(app)/invoices/month-end/page.tsx` + `frontend/features/invoicing_agent/use-month-end.ts`.
- **Do:** implement the six-step flow in APP_BLUEPRINT §8.3. Uses existing atoms. One new pattern only: `InvoiceDraftRow`. If a ninth invented pattern is tempting, stop and file ADR-014 per §4 week 7-10 B1.
- **Accept:** click-through: Start close → 120 drafts appear → approve 118, edit 2, reject 0 → Send batch. Undo window 5 s per `docs/FLAWLESS_GATE.md` item 25.
- **Test:** `frontend/tests/e2e/month-end-close.spec.ts` - full golden path on the canonical seed. Stopwatch assertion: end-to-end time <10 minutes.
- **DEF refs:** DEF-029 (payment processor), DEF-021 (SMTP migration), DEF-027 (Gmail OAuth) do not fire; send uses existing WeasyPrint + Workspace SMTP Relay path.

#### Task 2.6 - Record the value video

- **Do:** founder runs the golden path end-to-end on the canonical seed, screen-recorded with narration. 3 minutes maximum. Shows: seeded employees, approved timesheets, one Start click, 120 drafts appearing with AI explanations, 3 confirms, 1 edit, 1 batch send, "Month-end close complete" panel. File name `docs/sales/demo_month_end_close_v1.mp4`, with transcript at `docs/sales/demo_transcript.md`.
- **Accept:** both founders agree the video looks like a real product, not a demo. If not, iterate the UI and re-record until yes.

**Week 4 exit criterion:** a founder can run the full month-end close on the canonical 201-seat seed in under 10 minutes, recorded on video, with an AI paragraph on every draft. Video is the asset for §4 Weeks 5-6.

**DEFs whose trigger could fire this fortnight:** DEF-046 (Gemini → Claude fallback) if eval pass rate drops; unlikely on golden seed. DEF-044 (multi-vendor fallback) dormant.

---

### Weeks 5-6: Pilot sales motion

**Goal:** one named pilot signed.

#### Task 3.1 - Build the 50-lead list

- **File (new):** `docs/founder/pipeline.md` (founder-only; not agent-readable beyond read)
- **Do:** founder identifies 50 warm-intro targets on LinkedIn: COOs, finance leads, HR operations managers at 50-500 employee consulting firms in France and UK. Three columns: name + firm + intro path. Agent does not populate this.
- **Accept:** 50 named rows before Monday of week 5.

#### Task 3.2 - Outreach cadence

- **Do:** founder sends 20 first-contact messages per week. 3 sentences: who you are, what Gamma is, one-line ask for a 30-minute call + video link. No product pitch, no feature list.
- **Accept:** response tracking in `docs/founder/pipeline.md` with stages Curious / Interested / Evaluating / Committed / Live.

#### Task 3.3 - Sales pack v1

- **File (new):** `docs/sales/sales_pack_v1.md`
- **Do:** one page containing: video link (Task 2.6), €70k-junior-analyst-salary anchor math (the comparison that justifies €17-45/seat), comparison grid vs Kantata + Factorial + BambooHR + Harvest, and a pilot contract summary.
- **Accept:** founder can email it as a single PDF via `print > save as PDF`. Under 3 MB.

#### Task 3.4 - Pilot contract template

- **File (new):** `docs/sales/contracts/pilot_template.md` + `docs/sales/contracts/pilot_template.pdf`
- **Do:** draft per `docs/GO_TO_MARKET.md §3`: €8k flat, 90 days, 10 seats, real data, convertible to any tier on day 90 or cleanly closed. Clauses: EU data residency (`europe-west9`), GDPR Art. 28 DPA reference, success criteria (one month-end close run), exit terms.
- **Accept:** founder's UK solicitor signs off via email. File the solicitor's approval email at `docs/sales/contracts/pilot_template_approval.txt`.

#### Task 3.5 - Procurement pack v1 (minimum viable)

- **File (new):** `docs/sales/procurement_pack_v1/` with:
  - `dpa_template.pdf` (already referenced in `FOUNDER_CHECKLIST §6`)
  - `sub_processors.md` (mirrors the op console page)
  - `dpia_note.md` (one page, GDPR Art. 35 screening)
  - `security_summary.md` (one page: Google OIDC + passkeys + Cloud KMS at rest + TLS 1.3 in flight + `europe-west9` residency + no third-party AI)
  - `gdpr_export_demo.md` (link to Article 15 / 17 export flow already in `features/admin/`)
- **Accept:** a CFO can open the folder and read it in 20 minutes. Every claim is traceable to a spec or ADR.
- **DEF refs:** DEF-033 (BYOK) disclosed as Enterprise-tier only. DEF-034 (self-service DSR form) disclosed as "email privacy@" flow; automated form triggers at >2 DSRs/month. DEF-035 (sub-processor email subscription) disclosed as "manual blast"; automation triggers at >4 changes/year or >50 customers.

#### Task 3.6 - Close one pilot

- **File (new):** `docs/sales/contracts/pilot_001.md`
- **Do:** founder negotiates, signs, takes deposit. Deposit wired to Global Gamma Ltd's Revolut Business or HSBC UK account.
- **Accept:** €8k in the bank. Pilot kickoff date scheduled. Contract filed.

**Week 6 exit criterion:** €8k in the bank from a named consulting firm. Pilot kickoff scheduled on the calendar.

**DEFs whose trigger could fire this fortnight:** DEF-036 (DocuSign e-sign) fires if manual DPA handling exceeds 1 h/week; escalate only at customer 10. DEF-076 (source-code escrow) only if the pilot customer asks on day one; almost never for a 90-day pilot.

---

### Weeks 7-10: Pilot onboarding + ship the last 4 CRITIC items

**Goal:** pilot customer has their real data in, uses timesheets + expenses + invoices + close agent for one full month, gives us a testimonial.

#### Task 4.1 - Onboard the pilot

- **File:** operate via the operator console at `ops.gammahr.com` (built in Phase 2) or locally.
- **Do:** create the pilot tenant. Load their real employees + clients + projects via CSV through the existing `features/imports/` pipeline (see `docs/DATA_INGESTION.md`). Send magic-link invites to 10 named users. Schedule a 1 h onboarding call with their CFO.
- **Accept:** the pilot's CFO can log in via passkey, open `/timesheets`, and see their real employees.
- **DEF refs:** DEF-024 (SCIM) and DEF-025 (SAML) deliberately NOT fired here; we use manual invite + OIDC for the pilot. DEF-060 (HRIS auto-sync) not fired; CSV only. DEF-061 (historical non-timesheet import) not fired; they keep historic invoices in their prior system.

#### Task 4.2 - Retrofit `useOptimisticMutation` (residual CRITIC A3)

- **Files:** `frontend/features/approvals/use-approvals.ts`, `frontend/features/leaves/use-leaves.ts`, `frontend/features/expenses/use-expenses.ts`, `frontend/features/invoices/use-invoices.ts`.
- **Do:** for every mutation in each of the four, wrap via `lib/optimistic.ts::useOptimisticMutation`. Declare `conflictFields` per entity. 409 must open the shared `ConflictResolver`. `useSubmitExpense` already retrofitted; replicate for the other three.
- **Accept:** a Playwright test forces a 409 on each mutation path; `ConflictResolver` opens with "keep mine" and "take theirs" choices.
- **Test:** `frontend/tests/e2e/409-conflict.spec.ts` - one scenario per mutation path. The invoice status change is the spine case (see Task 4.5).

#### Task 4.3 - ADR-014: 8 invented patterns (residual CRITIC B1)

- **File (new):** `docs/decisions/ADR-014-phase4-invented-patterns.md`
- **Do:** for each of `ai-recommendations`, `detail-header-bar`, `range-calendar`, `resources-filter-bar`, `timeline-window-selector`, `multi-select-pill`, `ai-insight-card`, `ai-invoice-explanation`, write: where it is used, why no existing atom covered it, scope (which features may use it), and the lock (a ninth requires a new ADR). Mirror into `specs/DESIGN_SYSTEM.md §4.2`.
- **Accept:** founder signs off by commenting on the PR. CI guard in `scripts/check_invented_patterns.sh` validates that `components/patterns/` contains exactly those eight plus the 13 from `specs/DESIGN_SYSTEM.md`.

#### Task 4.4 - Real audit_log on detail pages (residual CRITIC C11)

- **Files:** `backend/app/features/admin/routes.py` (already has `/audit/entries`), `frontend/features/activity/use-activity.ts`, all `/employees/[id]`, `/clients/[id]`, `/projects/[id]`, `/invoices/[id]` pages.
- **Do:** flip `use-activity.ts` USE_API on. Implement the compact before→after diff renderer. Drop into the Activity tab of each detail page. Respect `actor_type` from the audit row so ops actions render "operator" with a distinct badge.
- **Accept:** editing an employee's name, reloading `/employees/[id]` Activity tab, the change is visible with old and new values. Matches `docs/FLAWLESS_GATE.md` item 26.
- **DEF refs:** none fires.

#### Task 4.5 - `ConflictResolverProvider` smoke test (residual CRITIC C13)

- **File (new):** `frontend/tests/e2e/invoice-status-conflict.spec.ts`
- **Do:** Playwright: user A and user B load the same invoice; A changes status `draft → sent`, B changes `draft → cancelled`. B's `PATCH` must 409. Resolver opens with both versions. User picks "take theirs". Assert final state is `sent` and audit row records both attempts.
- **Accept:** test passes green in CI; `ConflictResolverProvider` verified end-to-end on a real mutation path.

#### Task 4.6 - Production-grade staging

- **Files:** `infra/` (Cloud Run manifest, Cloud SQL + Cloudflare config, secrets in GCP Secret Manager).
- **Do:** provision the GCP project `gamma-prod` in `europe-west9` per `specs/DATA_ARCHITECTURE.md §1`. Deploy backend to Cloud Run, frontend to Cloud Run, Cloud SQL Postgres 16 with PITR. Cloudflare DNS + WAF + Access. One canary domain `staging.gammahr.com`. Manual promote to `app.gammahr.com` via `gcloud run services update-traffic`.
- **Accept:** `make staging-deploy` runs green. Frontend reachable at `staging.gammahr.com` over TLS. Seed script executes in under 3 minutes on Cloud SQL.
- **DEF refs:** DEF-013 (managed PgBouncer) dormant until ~20 tenants; DEF-015 (Cloud Trace) dormant until first slowness bug; DEF-016 (public status page) fires now because we have a paying customer - add a minimal status page to §4 Task 4.7 only if the pilot requests one, else defer to §5 Q2. DEF-018 (preview-URL-per-branch) dormant until second engineer.

#### Task 4.7 - First DR drill

- **File (new):** `docs/incidents/dr_drill_2026-05-XX.md`
- **Do:** exercise `docs/ROLLBACK_RUNBOOK.md` on staging. Simulate a data corruption. Recover via Cloud SQL PITR. Write the lessons learned.
- **Accept:** PITR restore time recorded (must be under 2 hours at current data volume). Runbook updated if any step failed.
- **DEF refs:** DEF-017 (legal SLA) dormant; our SLA is internal for the pilot per `docs/GO_TO_MARKET.md §11`.

**Weeks 7-10 exit criterion:** pilot customer runs a full month-end close on their real data in production, not staging. Recorded. Quoted.

**DEFs whose trigger could fire this block:** DEF-014 (error grouping) fires if founder spends >2 h/incident debugging; if it fires, swap to Cloud Logging fingerprint rules before reaching for Sentry.

---

### Weeks 11-12: Convert and prep customer 2

**Goal:** pilot converts to annual at Business tier or closes cleanly. Case study shipped. Customer 2 pipeline has 3 validated leads.

#### Task 5.1 - Pre-customer-2 measurement gate

- **File (new):** `docs/sales/pilot_001_measurement.md`
- **Do:** measure on the pilot's month-end run: elapsed time, drafts edited, drafts accepted as-is. If time saved ≥90 min/month, proceed to customer 2. If not, renegotiate pricing on any new pilot before signing.
- **Accept:** one page with three numbers: minutes saved, % drafts accepted as-is, customer NPS after close.

#### Task 5.2 - Case study

- **File (new):** `docs/sales/case_studies/pilot_001.md` + `gamma.com/case-studies/<slug>` page (if site exists).
- **Do:** one page, one hero number, one quote from the CFO, one chart. No chartjunk.
- **Accept:** founder ships the case study publicly. First customer logo on the site. Pilot customer signed a written quote-use permission.

#### Task 5.3 - Customer 2-10 outreach

- **Do:** founder uses the case study as the opener for every warm lead. Book 5 new discovery calls per week.
- **Accept:** 3 leads at "Committed" stage by end of week 12. If none, pause and re-plan pricing per §2.3 triggers.

#### Task 5.4 - Retro

- **File (new):** `docs/weekly/2026-07-XX-retro-q1.md`
- **Do:** both founders list: what worked, what didn't, what to cut from the plan. Update this file's §4 and §5 directly if any week's approach proved wrong.
- **Accept:** the retro is committed. Any plan-level changes show up as a dated diff in this file's changelog (last line at the bottom).

**Weeks 11-12 exit criterion:** first annual contract signed at Business tier (€69,948 for a 201-seat firm; likely smaller pilots land €20-40k ACV). Or pilot closes cleanly and we re-plan the next quarter before signing anything else.

**DEFs whose trigger could fire this block:** DEF-029 (payment processor) - fires at customer 5-10; during this block, pre-read the Revolut vs Stripe vs Paddle decision note but do not implement. DEF-028 (self-serve signup) - fires at customer 6; not now. DEF-031 (multi-year contract discount) - fires only if enterprise buyer demands it.

---

## 5. Quarters 2-4: toward the €45/seat Enterprise tier

Only start these after Q1 closes with the first annual contract. Slippage in Q1 defers Q2 by the same amount.

Every task carries the same four-line contract (File / Do / Accept / Test) as §4. Agents execute without improvisation.

### 5.1 Q2 (weeks 13-26): Business tier features + SOC 2 Type 1 kickoff

#### Q2 Task A - SCIM 2.0 (DEF-024 resolved, now implemented)

- **File (new):** `backend/app/features/scim/{routes,service,models,schemas,tests}.py`
- **Do:** SCIM 2.0 endpoints per RFC 7644. `/Users` and `/Groups`. Upserts into `users` and `teams`. JWT bearer auth per-tenant. Okta + Azure AD + Google Workspace provisioning suites green.
- **Accept:** Okta test plan green in `docs/tests/okta_scim_suite.md`. Same for Azure AD. Same for Google Workspace.
- **Test:** `backend/app/features/scim/tests/test_rfc7644.py` covers 20 SCIM conformance cases.
- **Business tier gate.** Lift price to €29/seat only when this lands.

#### Q2 Task B - SAML 2.0 federation (DEF-025 resolved)

- **File (new):** `backend/app/features/saml/{routes,service,schemas,tests}.py`
- **Do:** SP-initiated SAML. IdP metadata upload per-tenant. Okta, ADFS, PingFederate test flows.
- **Accept:** Okta SAML test green. ADFS test green. PingFederate test green.
- **Test:** `backend/app/features/saml/tests/test_idp_flows.py`.

#### Q2 Task C - Multi-rate VAT + intra-community reverse charge + UK post-Brexit (DEF-007 resolved)

- **Files:** `backend/app/features/tax/rules/{fr,uk,eu_intra,eu_extra}.py`, `backend/app/features/invoices/service.py` (line-level VAT).
- **Do:** per-line VAT rate selection, EU intra-community reverse charge, UK post-Brexit VAT treatment.
- **Accept:** 30 property-tested invoice cases across FR, UK, DE, NL, IT, ES, PL. Zero rounding drift.
- **Test:** `tests/test_vat_property.py` with Hypothesis.

#### Q2 Task D - AI kill-switch console + per-agent budget caps + AI events audit page

- **Files:** `frontend/app/[locale]/(app)/admin/ai/page.tsx`, `backend/app/features/admin/routes.py` extension.
- **Do:** per-tenant admin sees a page listing the 4 AI surfaces (command palette, OCR, insights, close agent) with on/off switches + monthly spend + kill-switch audit log. Mirrors `specs/AI_FEATURES.md §2`.
- **Accept:** a tenant admin can pause any surface and see the pause reflected in Cmd+K within 30 s. A "AI events" page lists the last 1000 events with actor, tool, tokens, cost.

#### Q2 Task E - SOC 2 Type 1 engagement

- **Do:** founder engages a Type 1 auditor (Prescient, AuditBoard partner, or similar EU-aware firm). Kick off 3-month observation window.
- **Accept:** auditor agreement signed and filed at `docs/compliance/soc2_type1_engagement.pdf`.
- **DEF refs:** DEF-077 (pen-test) usually bundled into the SOC 2 Type 2 step, not Type 1; defer to Q3.

#### Q2 Task F - Wire remaining pages to live API

- **Files:** all `frontend/features/*/use-*.ts` not yet wired (employees, clients, projects, leaves, approvals, admin, dashboard, calendar).
- **Do:** flip `USE_API` on each hook. Delete the feature's slice from `lib/mock-data.ts`. At the end of Q2, delete `lib/mock-data.ts` entirely.
- **Accept:** `grep -R "from.*mock-data" frontend/` returns zero (outside `tests/fixtures/`).

#### Q2 Task G - Customers 2-5

- **Do:** founder closes customers 2-5 using the case study. Annual contracts, Essential or Business tier.
- **Accept:** 4 more signatures. €160k+ total ACV committed.

**Q2 exit criterion:** Business tier is real; SCIM + SAML + multi-rate VAT live; customers 2-5 signed; SOC 2 T1 audit window running.

**DEFs fired this quarter:** DEF-007, DEF-024, DEF-025 all resolved into Tier 1.1 work. DEF-013 (managed PgBouncer) triggers near customer 5 if connection pressure appears; deploy self-hosted PgBouncer VM per the DEF note.

---

### 5.2 Q3 (weeks 27-39): Enterprise agents + SOC 2 Type 1 cert

#### Q3 Task A - Expense anomaly agent (DEF-039 resolved for Enterprise tier only)

- **File (new):** `backend/app/features/expense_anomaly/{service,analyzers,ai_tools,tests}.py`
- **Do:** per-employee + per-project historical baselines. Flags receipts that are >3σ above the baseline OR duplicate submissions within 14 days. One-paragraph explanation via the AI tool.
- **Accept:** Playwright E2E: submit a €5,000 dinner receipt on a project with a €50 mean; agent flags it; finance reviewer sees the flag + explanation + "keep / reject / ask employee" options. 5 eval examples in CI.

#### Q3 Task B - Overdue cash agent (part of Enterprise tier)

- **File (new):** `backend/app/features/cash_agent/{service,analyzers,ai_tools,tests}.py`
- **Do:** daily Celery job scans invoices where `due_date < today AND status IN (sent, overdue)`. For each, produces a suggested chase action (first email, escalation email, phone call, hold). User confirms.
- **Accept:** E2E: seed 3 overdue invoices, run the daily job, see 3 ranked suggestions in `/cash/overdue`, confirm 1, check audit_log.

#### Q3 Task C - Overwork + PTO sentinel

- **File (new):** `backend/app/features/overwork_sentinel/{analyzers,tasks,tests}.py`
- **Do:** weekly Celery job. Flags employees with >45 h billable in the last 7 days AND no leave booked in the next 90 days. Insight card on the manager's dashboard.
- **Accept:** a manager can see the sentinel card, click through to the employee, and trigger a 1:1 invitation via the existing calendar integration.

#### Q3 Task D - Budget burn agent

- **File (new):** `backend/app/features/budget_agent/{service,analyzers,tests}.py`
- **Do:** per-project, computes actual spend vs budgeted at the current burn rate and projects month-end + project-end. Flags overruns at 80% and 100%. Dashboard card.
- **Accept:** three projects at different stages of burn show three different cards with different colors.

#### Q3 Task E - Third-party pen-test (DEF-077 resolved)

- **Do:** engage Cobalt, HackerOne, NCC Group, or Bishop Fox. OWASP ASVS Level 2 scope.
- **Accept:** pen-test report filed at `docs/compliance/pentest_2026_q3.pdf`. Critical/High findings remediated within 30 days.
- **Cost:** €15-30k + 2-4 weeks founder remediation per DEF-077.

#### Q3 Task F - Source-code escrow (DEF-076 resolved, as Enterprise attach)

- **Do:** engage NCC Group, Iron Mountain, or Codekeeper. Sign the tri-party agreement with the first Enterprise customer. Monthly deposit ceremony via CI cron job uploading a tag archive.
- **Accept:** first monthly deposit verified. Annual escrow cost €2-4k per customer.
- **Cost:** paid per Enterprise customer.

#### Q3 Task G - SOC 2 Type 1 cert lands

- **Accept:** Type 1 report filed at `docs/compliance/soc2_type1_report.pdf`. Sales uses it to open Enterprise doors.

#### Q3 Task H - Customers 6-10

- **Accept:** 5 more customers. At least one at Enterprise tier (€108k+ ACV). Move the SKU ladder per §2.3 if the trigger fires.

**Q3 exit criterion:** Enterprise tier is real; 4 agents live; pen-test passed; SOC 2 T1 in sales hand.

**DEFs fired this quarter:** DEF-039 (expense anomaly) resolved as Enterprise tier. DEF-076, DEF-077 resolved. DEF-029 (payment processor) fires at customer 6 - choose Revolut (existing relationship, lower EU card fees) vs Stripe Billing (full subscription stack) vs Paddle (merchant-of-record). Founder decision. Implement chosen path in 2-4 weeks per DEF-029.

---

### 5.3 Q4 (weeks 40-52): Enterprise tier launches + public launch

#### Q4 Task A - Approvals autopilot

- **File (new):** `backend/app/features/approvals_autopilot/{analyzers,service,tests}.py`
- **Do:** for expenses under a configurable threshold with zero anomaly signals and a policy-matching employee history, auto-approve after a 24 h silent-review window. Finance sees the autopilot digest daily.
- **Accept:** 50% of trivial approvals auto-handled with zero false-approvals in the first 30 days.

#### Q4 Task B - Staffing recommender (DEF-069 resolved, Enterprise tier feature)

- **File (new):** `backend/app/features/staffing_agent/{analyzers,service,ai_tools,tests}.py`
- **Do:** per `docs/DEFERRED_DECISIONS.md` (now inlined in §6 DEF-069): calendar + leaves + allocations + skills tags + historical work-time. Proposes next-month staffing per project with confidence.
- **Accept:** a project manager sees 3 staffing options ranked; accepts one; the allocations are drafted, not committed, until the manager confirms.
- **Trigger gate:** 6 months of production history from customer 1 must exist. Do not ship earlier.

#### Q4 Task C - SOC 2 Type 2 observation starts

- **Do:** 12-month observation window kicks off. All controls from Type 1 must run continuously.
- **Accept:** monthly control evidence filed at `docs/compliance/soc2_t2_evidence/YYYY-MM/`.

#### Q4 Task D - Client portal read-only (`(portal)` route group)

- **Files:** `frontend/app/[locale]/(portal)/` (was held under ADR-013 until Phase 6).
- **Do:** implement `specs/APP_BLUEPRINT.md §12`. Passkey-first login, read-only dashboard + invoices list + invoice detail.
- **Accept:** a client portal user can log in and view their invoices. Cannot write. Matches `docs/FLAWLESS_GATE.md` item 67.

#### Q4 Task E - Public marketing site at `gamma.com`

- **Do:** build the marketing site: tagline, feature grid, pricing page with the three tiers, ROI calculator ("enter your seat count, see annual cost vs Kantata"), comparison pages.
- **Accept:** `gamma.com` loads in <1.5 s from EU, <2.5 s from US. Three case studies visible.

#### Q4 Task F - Product Hunt / LinkedIn launch

- **Do:** founder coordinates the launch on both channels. Three months of warm-up content (LinkedIn posts, case studies) before the launch day.
- **Accept:** Top-5 Product of the Day, or the founder gets 100+ DMs from founders and CFOs.

#### Q4 Task G - Customers 11-20, first Enterprise contract

- **Accept:** 10 more customers. At least 1 Enterprise contract signed (€108k+ ACV).

**Q4 exit criterion:** v1.0 ships per §10 ship criteria.

**DEFs fired this quarter:** DEF-069 (staffing agent) resolved as v1.1 Enterprise feature. DEF-044 (multi-vendor AI fallback) may fire if we see a sustained Vertex AI outage; the `ai/client.py` abstraction makes it a 1-2 week swap.

---

## 6. The 75 deferred decisions, now part of the plan

**Formerly `docs/DEFERRED_DECISIONS.md`, deleted in the next commit.** The registry is re-homed here so agents read one file. Every row has: status, ID, item, v1.0 chosen path, why deferred, trigger to revisit, rough cost. No DEF is allowed to disappear; updating means striking through here, not deleting.

**Two conventions:**
- **Status values:** `Open` = active tradeoff. `Resolved (YYYY-MM, PR #NNN)` = trigger fired and work was done. Append-only; never delete a Resolved row.
- **Stable IDs:** DEF-NNN never changes. Reference from code comments (`# DEF-021: ...`), commit messages, ADRs.

### 6.1 DEFs triggered by customer count (primary sales milestones)

| Status | ID | Item | v1.0 path | Why deferred | Trigger | Cost |
|---|---|---|---|---|---|---|
| Open | DEF-002 | Operator console impersonation ("log in as tenant admin") | No impersonation UI. JWT shape + audit contract defined now. Read-only visibility via tenant detail pages only. | Impersonation is a big audit/security surface, not needed for first 1-5 customers | First support ticket that cannot be resolved without seeing the customer's exact view | 1-2 weeks |
| Open | DEF-003 | Operator console billing UI (Stripe/manual billing management) | Founder handles billing manually via `subscription_invoices` + Workspace SMTP Relay | Billing mechanics are Phase 5+; v1.0 operator console is tenant lifecycle only | >5 paying customers OR manual billing exceeds 2 h/week | 2-3 weeks |
| Open | DEF-004 | Operator console support tools (broadcast banners, richer flag toggles, maintenance drain orchestration) | None in v1.0 | Single-tenant deployment does not need coordination tools | Second paying customer OR first production incident requiring a broadcast | 1-2 weeks |
| Open | DEF-028 | Self-serve signup flow (public form → auto provisioning → checkout) | Operator-console-only tenant creation; founder clicks "New Tenant", customer receives magic-link invite | Self-serve needs payment integration + auto-provisioning + abuse protection + email verification + legal checkboxes; 3-4 weeks not needed for manual sales | Customer 6 OR sustained inbound requests | 3-4 weeks |
| Open | DEF-029 | Payment processor integration (Stripe Billing, Revolut Merchant Acquiring, or Paddle) | Manual PDF invoicing via Workspace SMTP Relay; wire transfer or SEPA; founder marks paid in operator console | Full payment integration is 2-3 weeks; manual invoicing is 1 h per new customer, fine for 1-5 customers | Customer 5-10 OR manual billing exceeds 2 h/week. Evaluate Revolut (lower EU card fees, no full subscription product, needs thin wrapper) vs Stripe Billing (full stack) vs Paddle (merchant-of-record, ~5% fee, zero-VAT). Founder decision | 2-3 wk Stripe / 3-4 wk Revolut / 1-2 wk Paddle |
| Open | DEF-030 | Multi-currency Gamma subscription billing (GBP, USD) | EUR-only subscriptions. Tenants invoice own clients in multi-currency via `fx_rates`. | FX complexity + tax-per-currency filings + customer confusion | Customer asks to pay in GBP or USD AND is large enough to justify | 1-2 weeks |
| Open | DEF-031 | Multi-year contract discounts (2-year, 3-year) | Monthly + annual (annual ~15% discount) only | Multi-year adds contract templates, prepayment handling, refund edge cases | First enterprise deal requiring multi-year | 1 week |
| Open | DEF-032 | Paddle (merchant-of-record) billing path | Stripe or Revolut + OSS VAT registration via founder's accountant | Paddle's 5% fee is 2x Stripe/Revolut but eliminates all EU VAT compliance | Founder's accounting becomes a sustained time sink OR expands outside EU | 1-2 wk rewrite of billing |
| Open | DEF-059 | Automated volume-band calculator in self-serve billing UI | Manual calculation by founder in Phase 2 | Blocked by DEF-028 + DEF-029 | After self-serve (DEF-028) AND payment processor (DEF-029) ship | 2-3 days on top |
| Open | DEF-036 | E-signature flow for DPA signing (DocuSign or equivalent) | Founder emails DPA PDF, customer signs and returns, founder files in Google Drive | DocuSign is paid SaaS ($10-25/user/month), manual is fine <10 customers | Customer 10 OR manual DPA handling exceeds 1 h/week | 1 wk setup + SaaS |
| Open | DEF-037 | DPA version management UI in operator console | Manual tracking in `dpa_versions` table + email notifications | UI is nice but not blocking | Customer 10 OR audit/compliance inquiry | 1-2 weeks |
| Open | DEF-016 | Public status page (`status.gammahr.com`) | Internal-only SLOs in Cloud Monitoring | Needs incident-management process + historical data | Before first paying customer signs | 1 week |

### 6.2 DEFs triggered by scale thresholds (tenants, rows, volume)

| Status | ID | Item | v1.0 path | Why deferred | Trigger | Cost |
|---|---|---|---|---|---|---|
| Open | DEF-013 | Managed PgBouncer (AWS RDS Proxy equivalent on GCP) | Self-hosted PgBouncer on small Compute Engine VM | GCP has no managed PgBouncer; VM is boring ops | Year 2-3 at ~20-30 tenants; Cloud Monitoring alert on Cloud SQL connection saturation | 1 wk setup + patching |
| Open | DEF-019 | Managed Redis (GCP Memorystore) | Self-hosted Redis on `e2-micro` VM (~€7/mo) | Memorystore minimum 1GB at ~€35/mo vs €7 self-host | Year 2-3, HA matters, OR Redis memory >500MB | 2-3 days migration |
| Open | DEF-020 | Cloud Run Jobs for Celery workers | Celery workers on small Compute Engine VM | Cloud Run's request-duration model doesn't fit long-running workers | Worker auto-scaling patterns get complex | 1 wk rework |
| Open | DEF-021 | Migrate off Workspace SMTP Relay to SES/Postmark/Resend | Workspace SMTP Relay via `smtp-relay.gmail.com` | 10k/day quota fits through Year 4-5; Relay free inside Workspace sub we need anyway | Sustained daily sending >80% of quota OR bounce tracking >2 h/week | 1-2 days swap in `sender.py` |
| Open | DEF-048 | Horizontal WebSocket scaling via Redis pub/sub fan-out | Single backend instance with in-process WebSocket | Redis pub/sub adds complexity, unnecessary at 201-employee tenant | Adding a second backend instance | 1 week |
| Open | DEF-052 | Expand-migrate-contract zero-downtime migration strategy | Celery fan-out with `alembic_runs` tracking, synchronous at deploy | Adds significant op complexity; current pattern handles ~500 tenants | Tenant count >300-500 AND migration fan-out exceeds deploy window (>10 min) | 2-3 wk deploy pipeline rework |
| Open | DEF-054 | Cross-tenant schema drift auto-reconciliation UI | Weekly Celery schema-fingerprint check + alert | Drift is rare <20 tenants; manual repair works | 2nd-3rd drift incident OR tenant count >30 | 1-2 weeks |
| Open | DEF-055 | External feature flag platform (LaunchDarkly, GrowthBook, Unleash) | In-house `feature_flags` table + decorator (~200 LOC) | In-house covers Phase 2-3; external adds cost + vendor dependency | Flag count >~50 OR percentage rollouts OR 2nd frontend dev | 1 day adapter swap |
| Open | DEF-057 | Percentage-based gradual rollouts with deterministic hashing | Schema supports `rules_jsonb` but no rollout UI | Rollouts add UI + hashing + analytics complexity | Phase 5+ OR risky feature about to ship | 3-5 days |
| Open | DEF-058 | Full A/B testing and experimentation framework | In-house flags do not include experiment analytics | Experiments need per-variant analytics, cohort tracking, significance | Year 2-3 when traffic justifies statistical power | 3-4 wk (likely swap to GrowthBook) |
| Open | DEF-043 | Per-tenant AI prompt A/B testing | Single active prompt version per tool | Experiment platform needs tenant analytics + variant routing + significance | Year 2-3 when enough tenants | 3-4 weeks |
| Open | DEF-045 | Per-user AI budget limits within a tenant | Per-tenant budget only; per-user via rate limits | Per-user budgeting adds UI + storage + enforcement; rate limits cover abuse | Tenant admin explicit request OR enterprise demand | 1-2 weeks |

### 6.3 DEFs triggered by customer explicit request (feature scope)

| Status | ID | Item | v1.0 path | Why deferred | Trigger | Cost |
|---|---|---|---|---|---|---|
| Open | DEF-001 | Full approval workflow engine (multi-hop, parallel, conditional, amount-tiered) | Single-hop direct manager for timesheets/leaves; direct manager + finance co-approval above threshold for expenses; `approval_delegations` handles vacation cover | Workflow engines are 4-6 weeks; 90% of consulting firms only need direct-manager routing | Customer requests multi-hop OR conditional beyond single finance threshold | 4-6 weeks |
| Open | DEF-005 | Per-tenant subdomain (`acme.gammahr.com`) | All tenants on `app.gammahr.com`; selection via login | Subdomain adds DNS automation + cert provisioning + subdomain routing | Enterprise customer requests vanity URL; Tier 2 feature | 2-3 weeks |
| Open | DEF-006 | Retainer project billing type | T&M + fixed-price only | Retainers have complex accrual + rollover rules; two types cover 85% of consulting revenue | Customer with significant retainer revenue signs | 1-2 weeks |
| Open | DEF-008 | Portal SSO (client portal users via corporate SSO) | Passkey-first + password fallback + TOTP in `portal_users` | SSO for portal users requires per-portal OIDC client provisioning | Customer's clients request corporate SSO | 2-3 weeks |
| Open | DEF-009 | Outbound webhooks (`invoice.sent`, `timesheet.approved`) | None; reserved table shape documented; `kill_switch.webhooks` reserved | Full feature (retry, signature, dead letter, admin UI) | Customer integration request OR first enterprise deal | 2-3 weeks |
| Open | DEF-010 | Bank feed integration (PSD2 / Open Banking) | None | Per-provider PSD2 integration (Tink, GoCardless, Plaid EU) per bank per country | Customer explicitly asks OR expense volume justifies | 4-8 wk per provider |
| Open | DEF-011 | Email-to-expense ingestion (forward receipt email) | Manual upload only (PWA photo + Gemini OCR) | Inbound email + attachment extraction + OCR chaining | Phase 6 "fun things" polish batch | 1-2 weeks |
| Open | DEF-012 | Live presence indicators ("Alice is editing") | Optimistic locking + field-level conflict diff + revision history | Presence needs WebSocket channels per record + UI cost; feel polish | Phase 6 polish batch | 1-2 weeks |
| Open | DEF-023 | Per-tenant BYO sending domain (`billing@customerfirm.com`) | All outbound from `mail.gammahr.com` | Per-tenant DKIM key provisioning + DNS verification | Tier 2 premium after first paying customers | 2-3 weeks |
| Open | DEF-026 | Tenant BYO-SMTP (tenant enters own SMTP, Gamma relays) | Gamma sends from `mail.gammahr.com` | Encrypted credential storage + per-tenant SMTP error handling + support burden | Tenant requests branded sending OR deliverability complaints | 1-2 weeks |
| Open | DEF-027 | OAuth-to-tenant-Gmail for invoice delivery | Same as DEF-026 in v1.0 | Google OAuth verification requires CASA audit ($15-75k/yr) for `gmail.send` | Only realistic after incorporation + SOC 2 + audit budget | 4-8 wk + $15-75k/yr |
| Open | DEF-033 | BYOK (customer-held encryption keys) | Cloud KMS CMEK keys owned by Gamma, per-tenant keyring | BYOK requires customer-side key management + break-glass | First enterprise deal requiring | 3-4 weeks |
| Open | DEF-047 | Full PWA offline support beyond timesheets | Narrow offline scope: timesheet entry only | Full offline = 2-3 mo product feature + sync conflict class | Customer request OR field-work feedback | 2-3 months |
| Open | DEF-050 | Offline-first full state sync (Linear/Notion mode) | Narrow online-first + timesheet-only offline | Offline-first is a different product model, not a feature addition | Product pivots to offline-first | 3-6 mo rewrite |
| Open | DEF-051 | Native mobile app wrapper (React Native, Capacitor) | PWA only; installable via "Add to Home Screen" | PWA covers 95%; native wrapper adds App Store compliance, doubles maintenance | Customer requests App Store OR native-only features (geolocation clock-in) | 4-6 wk Capacitor / 3-4 mo RN |
| Open | DEF-060 | Automatic HRIS sync (Workday, Personio, BambooHR, Rippling, HiBob) | CSV bulk import for onboarding + ongoing batch adds; no auto-sync | Per-provider connector, mapping, ongoing conflict | Customer explicitly asks AND deal size justifies 2-3 wk connector | 2-3 wk per provider |
| Open | DEF-061 | Historical leaves, expenses, invoices bulk import | Only historical timesheets importable at onboarding | Legal record-keeping stays with prior system; two sources of truth risk | Customer explicitly requests AND data is clean | 1-2 wk per entity type |
| Open | DEF-062 | Bidirectional payroll sync | One-way CSV export (Silae, Payfit, generic) | File handoff is industry norm; bidirectional = multi-wk per provider | Customer explicitly requests AND specific provider demands | 3-4 wk per provider |
| Open | DEF-063 | Excel `.xlsx` import beyond CSV | CSV only; users convert Excel to CSV | `pandas.read_excel` adds `openpyxl`; CSV covers first customer | Customer complaint OR 3rd customer with Excel-only | 1-2 days |
| Open | DEF-064 | Google Sheets direct import via OAuth | CSV upload only | Google OAuth verification is multi-wk compliance process | Customer explicitly requests AND compliance tax acceptable | 2-3 wk + annual audit |
| Open | DEF-065 | E-invoicing URN support (Peppol, Chorus Pro, FatturaPA) | Standard PDF + email delivery, no portal integration | Per-country portal integration; non-trivial | First B2G contract requiring Peppol or national portal | 3-6 wk per portal |
| Open | DEF-067 | Multi-currency Gamma subscription billing (e.g. GBP for HSBC UK) | EUR-only subscriptions | Phase 2 manual invoicing is EUR-only; DEF-029 can carry later | First customer requiring non-EUR billing of the Gamma sub itself | 1-2 wk on top of DEF-029 |
| Open | DEF-068 | Second payroll provider adapter | Phase 5 ships one payroll CSV adapter tuned to first pilot + generic adapter | Each provider has own CSV shape + validation + tests | Customer 2 uses different payroll provider than customer 1 | 1-2 wk per provider |

### 6.4 DEFs triggered by compliance or security events

| Status | ID | Item | v1.0 path | Why deferred | Trigger | Cost |
|---|---|---|---|---|---|---|
| Open | DEF-017 | Legal contractual SLA (refunds on uptime breach) | Internal SLOs + eventual public status page; no legal commitment | Legal SLA requires multi-region or documented DR + contractual liability | Enterprise demands contractual uptime AND DR posture accepts risk | varies |
| Open | DEF-034 | Self-service DSR form at `gammahr.com/privacy/dsr` with 48 h SLA before Gamma takes over | Manual via `privacy@gammahr.com`; tenant-admin self-service covers common case | Direct-to-Gamma DSR volume expected very low | Sustained >2 DSR emails/month OR first regulatory inquiry | 1-2 weeks |
| Open | DEF-035 | Subscribe-to-sub-processor-changes email UX | Public sub-processor page + manual email blast | Automated flow needs email capture + double opt-in + unsubscribe; manual works <50 tenants | Sub-processor changes become frequent (>4/yr) OR customer requests | 3-5 days |
| Open | DEF-066 | Ongoing password breach check (HIBP API or equivalent) | Set-time check only against offline top-10k breached list | Ongoing needs HIBP API (or equivalent) with EU-compliant DPA | First security review after pilot 3 OR breach DB with EU-licensed terms | 1-2 weeks |
| Open | DEF-076 | Source-code escrow (NCC Group / Iron Mountain / Codekeeper) | None; Enterprise attach per `docs/GO_TO_MARKET.md §2` | Escrow needs named provider + tri-party agreement + monthly deposit ceremonies | First Enterprise deal that names escrow as signing condition OR year-2 renewal of canonical buyer | 2-3 wk + €2-4k/yr per customer |
| Open | DEF-077 | Third-party pen-test report (annual, retest on critical findings) | Internal SAST/DAST only via CI; Enterprise attach | Reputable pen-test €15-30k/cycle + remediation | First Enterprise deal naming pen-test OR SOC 2 Type 2 audit window opens | €15-30k/cycle + 2-4 wk founder remediation |
| Open | DEF-053 | Auto-rollback on error-rate spike | Manual Cloud Run revision rollback | Auto-rollback needs tuning to avoid false positives | Phase 3 after Cloud Monitoring baseline-calibrated | 2-3 days |
| Open | DEF-056 | Auto circuit breaker on metric thresholds | Manual emergency read-only via feature flag + DB read-only | Needs calibrated metrics to avoid false positives | Phase 3 after Cloud Monitoring baseline OR first false-positive manual lesson | 1 week |
| Open | DEF-015 | Distributed tracing (Cloud Trace / OpenTelemetry on FastAPI + Celery + frontend) | `request_id` correlation via structured logs | OpenTelemetry instrumentation is real work; no value until multi-hop slowness bug | First slowness bug not solvable via logs in 20 min | 3-5 days |
| Open | DEF-014 | Error fingerprint-grouping dashboard (Sentry-style top-10) | Raw structured logs in Cloud Logging + Logs Insights | Fingerprint grouping good UX, not essential for 1-2 customers | Root-cause debugging >2 h/incident sustained | 3-5 days (Cloud Function + custom metric) |

### 6.5 DEFs triggered by team growth or operational pain

| Status | ID | Item | v1.0 path | Why deferred | Trigger | Cost |
|---|---|---|---|---|---|---|
| Open | DEF-018 | Preview-URL-per-branch deployments | Three static envs (local, staging, prod) | Extra infra for marginal benefit at solo-dev velocity | First additional backend engineer hired | 1 week |
| Open | DEF-022 | Email visual regression testing (Litmus, Email on Acid, Mailosaur) | Manual visual check on test Outlook.com account | Paid SaaS premature for small template set | Template count >10 OR customer complaint | 1 day + monthly fee |
| Open | DEF-049 | Storybook for UI atoms/patterns | No Storybook; components documented via code | Storybook setup + maintenance is real; premature for solo founder | Second frontend dev OR design system >30 atoms | 1 wk setup + maintenance |
| Open | DEF-075 | Extract `infra/ops/` library to standalone repo | Lives as `infra/ops/` in monorepo; extractable (own `pyproject.toml`, no imports from app, lazy vendor SDK imports) | Cross-repo overhead while API churns | 90 consecutive days post-launch with no API change OR 2nd Global Gamma product needs it OR open-source decision OR security mandate OR first external contributor | ~1 day via `git subtree split` |

### 6.6 DEFs triggered by AI vendor or evals

| Status | ID | Item | v1.0 path | Why deferred | Trigger | Cost |
|---|---|---|---|---|---|---|
| Open | DEF-038 | AI-drafted emails and comments (reply suggestions, drafting, polishing) | Core three surfaces only | Draft-email UX needs inline editor + tone controls + per-user style learning | Phase 5-6 polish OR customer request | 2-3 weeks |
| Open | DEF-039 | Anomaly detection on expenses (AI flags unusual receipts) | Manual review via finance-admin approval. **RESOLVED Q3 Task A for Enterprise tier (§5.2).** | Anomaly needs historical baselines + model training + FP tuning | Enterprise tier launch OR customer fraud incident | 2-3 weeks |
| Open | DEF-040 | Resource planning AI assist (suggested staffing) | Manual Gantt/capacity views (Tier 2) | Requires skill taxonomy + capacity modeling + multi-objective optimization; depends on Tier 2 | After Tier 2 planning ships | 3-4 weeks |
| Open | DEF-041 | AI-summarized weekly digest (personalized per user) | Template-based daily digest only (opt-in) | AI digest cost scales linearly with user count; template is free | Phase 5+ OR customer complaint | 1-2 weeks |
| Open | DEF-042 | Predictive staffing + revenue forecasting ("this project will need 2 more seniors in 3 mo") | No forecasting in v1.0 | Needs time-series modeling + validation + confidence bands; not a Flash-tier task | Phase 6+ AI polish | 4-6 weeks |
| Open | DEF-044 | Automatic model fallback on vendor outage (Gemini → Claude Haiku hot swap) | Single-model Gemini 2.5 Flash via Vertex AI EU; no automatic fallback | Dual-vendor maintenance real cost; single-vendor outage rare; degraded mode handles partial outages | First sustained Vertex AI outage affecting customers OR enterprise demands multi-vendor | 1-2 wk (wrapper designed for it) |
| Open | DEF-046 | Migrate back to Anthropic Claude Haiku (or any other LLM vendor) | Single-model Gemini 2.5 Flash via Vertex AI EU | Reversibility escape hatch; `ai/client.py` designed for one-file swap; evals in CI catch regressions | Gemini eval pass rate drops below threshold 2 consecutive weeks OR Vertex AI EU pricing changes materially OR new Haiku tier materially cheaper | 1-2 days swap |
| Open | DEF-069 | Predictive staffing agent (calendar + leaves + allocations + skills + history) | No predictive staffing. **RESOLVED Q4 Task B (§5.3) for Enterprise tier.** | Needs 6 months production history | (a) 6 mo history from customer 1, (b) customer 3 signs, (c) ≥2 customers request forecasting in writing | 4-6 weeks |
| Open | DEF-070 | Auto-timesheet drafting from calendar + Jira + git | Manual timesheet entry only; positioned as v1.1 | Needs OAuth (Calendar, Graph, Atlassian, GitHub) + privacy review | (a) customer 3 signs, (b) pilot commits to OAuth during pilot, (c) 4-6 wk budget | 4-6 weeks |

### 6.7 DEFs triggered by geographic expansion

| Status | ID | Item | v1.0 path | Why deferred | Trigger | Cost |
|---|---|---|---|---|---|---|
| Open | DEF-071 | Canada expansion (PIPEDA + Quebec Law 25, GST/HST/PST/QST per-province, bilingual FR-first Quebec invoicing, residency in `northamerica-northeast1` Montreal) | Year 1 FR + UK only. Architecture scaffolding in place (`tenants.residency_region`, `tenants.legal_jurisdiction`, per-country strategy modules) so year 2 = config + one-file change | PIPEDA federal + Quebec Law 25 stricter, FR-first service in Quebec, local DPO threshold. GST/HST/PST/QST per-province complex. Montreal residency preferred. | (a) First Canadian lead Committed, (b) year 2+, (c) customer 5+ live. **Work items:** add `ca.py` tax rules with provincial dispatch, `ca.py` labor rules, CA holidays, register new GCP project in `northamerica-northeast1`, configure Cloud SQL cross-region replication (staying Canadian), `fr-CA` locale files | 4-6 wk + legal |
| Open | DEF-072 | Morocco expansion (CNDP cross-border filing under Loi 09-08, Arabic RTL invoice rendering, MAD currency, TVA 20%, CMI local payment network, bilingual FR + MSA) | Year 1 FR + UK only. Morocco has no GCP region; served from `europe-west9` (Paris) under CNDP safeguards | Arabic invoice must be RTL (WeasyPrint template variant, 3-5 days). MAD currency. Stripe added Morocco 2024; CMI local. Islamic calendar holidays shift yearly per Hijri | (a) First Moroccan lead Committed, (b) year 2+, (c) customer 5+ live. **Work items:** CNDP filing, `ma.py` tax rules, `ma.py` labor rules, Arabic RTL WeasyPrint templates, MAD seed, CMI adapter (if Stripe insufficient), Moroccan holidays including Islamic dates, `ar-MA` locale files with RTL | 5-7 wk + CNDP lead time |
| Open | DEF-073 | Niger expansion (CNPDCP under Loi 2017-28, XOF currency pegged to EUR at 655.957, TVA 19%, WAEMU convention collective, mobile money payment rails) | Year 1 FR + UK only. Niger has no GCP region; served from `europe-west9` under CNPDCP safeguards. Mobile money = dedicated 4-6 wk item | CNPDCP safeguards. XOF (pegged EUR, shared with 7 WAEMU states). Mobile money (Orange Money, MTN MoMo) dominates over cards. WAEMU convention collective shared with Senegal, Côte d'Ivoire, Burkina Faso. Internet reliability varies; PWA offline queue essential (already in v1.0) | (a) First Nigerien lead Committed, (b) year 2+, (c) customer 5+ live AND mobile money budget. **Work items:** CNPDCP filing, `ne.py` tax rules, `ne.py` WAEMU labor rules, XOF seed, mobile money adapter (Flutterwave, CinetPay, HUB2, or direct Orange Money API), Nigerien holidays incl Islamic, confirm `fr-NE` variant or reuse `fr-FR` | 6-8 wk incl mobile money |
| Open | DEF-074 | WAEMU shared expansion (Senegal, Côte d'Ivoire, Burkina Faso, Benin, Togo, Mali, Guinée-Bissau) | Year 1 FR + UK only. After DEF-073 Niger lives, most architecture is reusable for other WAEMU | Shared XOF, labor framework, many tax rules. New WAEMU country ≈ new `legal_jurisdiction` code + country tax deltas + local holidays + local payment provider | (a) DEF-073 Niger live ≥6 mo, (b) first lead in any WAEMU country | 1-2 wk per additional WAEMU country once Niger live |

### 6.8 DEFs resolved or absorbed 2026-04-18

| Status | ID | Item | v1.0 path (then) | Reason resolved | Reference |
|---|---|---|---|---|---|
| Resolved (2026-04-18, lifted to Tier 1.1) | DEF-007 | Multi-rate VAT (different rates per invoice line, regional splits, goods + services on one invoice) | Single-rate + reverse-charge boolean | Lifted to Tier 1.1 (committed for v1.1) per `docs/SCOPE.md`. Enterprise procurement gate for year-2 price step-up. §5.1 Q2 Task C is the implementation task. | `docs/SCOPE.md` |
| Resolved (2026-04-18, lifted to Tier 1.1) | DEF-024 | SCIM provisioning from Google Workspace + Microsoft Entra | OIDC + manual user creation | Lifted to Tier 1.1; §5.1 Q2 Task A implements | `docs/SCOPE.md` |
| Resolved (2026-04-18, lifted to Tier 1.1) | DEF-025 | SAML federation (beyond OIDC) | OIDC only | Lifted to Tier 1.1; §5.1 Q2 Task B implements | `docs/SCOPE.md` |
| Open (Enterprise attach only) | DEF-078 | Dedicated Technical Account Manager (TAM) program | Priority email support only | Real TAM is 0.2 FTE per customer; waits for post-founder engineering hire. Enterprise attach in §2.1 | First Enterprise customer naming TAM as signing condition AND first post-founder engineering hire lands | 0.2 FTE + €10-20k/yr attach |

---

## 7. The kill list (what we stop pretending to build)

Confirmed dead for v1.0 and v1.1:

- **Retainer billing** (DEF-006). Not in any tier until customer 10+ asks.
- **Multi-currency Gamma billing** (DEF-030, DEF-067). EUR only. GBP and CHF invoicing to end customers works; our own subscription stays EUR.
- **Peppol / Chorus Pro / FatturaPA** (DEF-065). Post-launch.
- **Self-serve signup** (DEF-028). Demo-to-contract motion only until customer 10.
- **Free tier.** The 90-day pilot at €8k is the free tier.
- **Gantt, resource planning, HR recruitment, insights page standalone.** Gantt + planning already absorbed into Employees/Clients/Projects list pages per `specs/APP_BLUEPRINT.md §10`. HR + insights deferred until Business tier has 5 paying customers.
- **Native mobile app** (DEF-051). PWA only.
- **Full offline** (DEF-047, DEF-050). Timesheet-only offline.
- **Chatbot surface anywhere.** Every AI is tool-call-backed per `specs/AI_FEATURES.md §1`. No free-form Q&A.
- **Any feature in DEF-038 through DEF-046** not explicitly promoted in §5.
- **Any WAEMU country beyond Niger** (DEF-074) until Niger has 6 months of production use.

---

## 8. Documents that stay, documents that die

### 8.1 Stays (single source of truth per concern)

- `CLAUDE.md` - agent contract + hard rules.
- `THE_PLAN.md` - this file. The only roadmap. Includes the 75 DEFs in §6.
- `FOUNDER_CHECKLIST.md` - founder's personal list (pipeline, legal, health). Not agent-readable except for read. Rewritten 2026-04-18 to reference this file's sections rather than the dead `EXECUTION_CHECKLIST.md`.
- `specs/DATA_ARCHITECTURE.md`, `specs/APP_BLUEPRINT.md`, `specs/AI_FEATURES.md`, `specs/DESIGN_SYSTEM.md`, `specs/MOBILE_STRATEGY.md` - the "what."
- `docs/FLAWLESS_GATE.md` - the 70-item bar. Unified.
- `docs/MODULARITY.md`, `docs/TESTING_STRATEGY.md` - CI-enforced structural rules.
- `docs/GO_TO_MARKET.md` - commercial mechanics. Update to the three-tier pricing in §2 of this plan on the next commit.
- `docs/ROLLBACK_RUNBOOK.md`, `docs/COMPLIANCE.md`, `docs/DEGRADED_MODE.md` - operational runbooks.
- `docs/DATA_INGESTION.md` - CSV + OCR + payroll pipeline.
- `docs/SCOPE.md` - Tier 1 / 1.1 / 2.
- `docs/decisions/ADR-*.md` - one ADR per locked decision.
- `prototype/*.html` - frozen visual spec.

### 8.2 Dies (delete in the follow-up commit after this plan ships)

- `CRITIC_PLAN.md` - 4 open items absorbed into §4 Weeks 7-10.
- `SELLABILITY_PLAN.md` - tiered pricing + agent roadmap absorbed into §2 and §5.
- `opus_plan.md`, `opus_plan_v2.md` - frontend bar work mostly complete; remaining work absorbed into §4 Weeks 1-2 and 7-10.
- `OPUS_CRITICS.md`, `OPUS_CRITICS_V2.md` - audit findings superseded by the unified gate (ADR-012). Historical value zero.
- `HAIKU_CRITICS.md` - same.
- `EXECUTION_CHECKLIST.md` - DONE-lies and stale phase structure. Replaced by §3 (honest state) and §4 (12-week path) and §5 (Q2-Q4 roadmap).
- `PROMPT.md` - agent prompt template. Belongs in `.claude/skills/` if anywhere.
- `docs/DEFERRED_DECISIONS.md` - 75 entries folded inline into §6 of this file.

Keeping 11 overlapping plan files is how decisions get re-opened. One plan, one direction, git history for anything we need to recover.

---

## 9. Weekly rhythm (simplified)

**Monday, 09:00, 15 minutes.**
1. Open this file. Find the current week in §4 (or §5 after Q1).
2. Pick the next unchecked task. One task.
3. Put three items on a physical note: build task, founder-review slot, discovery calls to make.

**Friday, 17:00, 30 minutes.**
1. Check off what shipped.
2. Write `docs/weekly/YYYY-MM-DD.md`: shipped, slipped, learned, decide-next-week.
3. If slippage ≥2 weeks on the current week's goal, re-plan §4 before starting next Monday.

**Monthly, first Monday.**
1. Review pricing triggers (§2.3). Move the SKU ladder if a trigger fired.
2. Review §6 DEF triggers. Resolve any that fired. Update §5 if a resolution changes the roadmap.
3. Review runway. If <12 months, book 5 investor calls this week.
4. Review health. If 2+ red flags in `FOUNDER_CHECKLIST §9`, stop and talk to someone.

---

## 10. When things go wrong (one-screen emergency manual)

- **"I don't know what to build."** Open §4. Find the current week. Build the first unchecked task.
- **"A feature I need is DEF'd."** Open §6. Check the trigger. If fired, lift it (write a new row with `Resolved` status) and plan the work into the current quarter. If not, note the customer request in `docs/weekly/` and move on.
- **"The pilot is about to churn."** Stop all feature work. Put both founders on the customer for the week. Nothing else matters.
- **"Customer 2 wants a discount below the floor."** Walk. Unit economics do not bend. We are not VC-funded discretionary revenue.
- **"An AI agent suggests rewriting the plan."** Say no. This file is the plan. Edit it explicitly with reasoning if it needs to change. Do not let the agent drift it.
- **"The app is broken in prod."** `docs/ROLLBACK_RUNBOOK.md`. Cloud Run traffic shift. If schema, Alembic downgrade + Celery fan-out. If data, Cloud SQL PITR.
- **"The AI eval pass rate dropped."** DEF-046 in §6. Swap `ai/client.py` to the fallback vendor. Re-run evals. If green, pin the fallback as new default and write the ADR.

---

## 11. Ship criteria for v1.0

v1.0 ships when:
1. One pilot signed and converted to annual at Business or Enterprise tier.
2. That customer has run a full month-end close on their real data in production.
3. Zero P0 bugs in production for 30 consecutive days.
4. Case study published with a named hero number.
5. Three more pilots in Committed stage.

Not when the 70-item gate is green on every page. Not when every DEF is promoted. Not when the docs are perfect. Revenue + stability + proof.

---

## 12. Final word

This is the fifth plan rewrite. It will not be the last. What is different this time: one plan, three pricing tiers, 75 DEFs inline, 12 weeks to revenue, nine files that die. If the next iteration of this file does not get shorter, we are doing it wrong.

Ship. Measure. Charge. Repeat.

---

## Changelog

- **2026-04-18 (this rewrite):** merged 75 DEFs inline (§6). Expanded §4 and §5 with per-task file paths + acceptance criteria + tests + DEF cross-refs. Added §4.0 rules for every week. Added §10 entry for eval-pass-rate drop (DEF-046). Kept pricing (§2), kill list (§7), weekly rhythm (§9), ship criteria (§11) from the prior rewrite.
- **2026-04-18 (prior rewrite):** replaced 594-line legacy plan with the tiered-pricing + 12-week structure.
