# AI FEATURES

> Every place AI appears in Gamma v1.0, how it is wired, and how it fails safely.
> **Provider: Google Vertex AI Gemini 2.5 Flash** (EU region `europe-west9`), called via the Google Cloud AI Platform Python SDK. All code in `backend/app/ai/` plus per-feature tool definitions in `backend/app/features/*/ai_tools.py`.
> Pattern: **LLM-as-router with deterministic tools**. The LLM's only job is to parse a user query or a prepared context and call a deterministic Python tool with the right arguments. All business logic lives in the tools.
> Numbers marked "target" are goals, not measured baselines.

---

## 1. Principles

1. **LLM-as-router.** The model never computes, summarizes without structure, or writes to the database directly. It picks tools and fills arguments.
2. **Deterministic tools, auditable calls.** Every AI-triggered action is a recorded tool call with structured arguments and a row in `public.ai_events`.
3. **User confirms before write.** For any action with finance or approval consequences, AI proposes and the user confirms.
4. **Structured outputs only.** Tool schemas are Pydantic models, JSON Schema generated, not hand-written.
5. **Prompt injection defense.** User input is always a user turn, never concatenated into the system prompt. Tool outputs re-validated before execution.
6. **PII rules are enforced via pytest metatest.** Confidential-tier columns (compensation, banking, Art. 9) never appear in any prompt. Metatest greps the tool definitions and blocks merge on violation.
7. **Non-AI fallback on every flow.** OCR falls back to manual entry, command palette falls back to sidebar navigation, insight cards fall back to yesterday's cache. Month-end close falls back to analyzer-only chips with no paragraph explanation.
8. **Zero-retention at Vertex AI layer.** Configured in Vertex AI settings. Prompts are transient: not logged to Cloud Logging, not included in error reports.
9. **Reversibility:** `backend/app/ai/client.py` is a single abstraction. Swapping to Claude Haiku or any other vendor is a one-file change (see DEF-046).

---

## 2. Four feature surfaces (the locked v1.0 scope)

Exactly four AI-visible surfaces ship in v1.0. Everything else is deferred.

| Surface | Where | Feature |
|---|---|---|
| 1. Command palette | Cmd+K from every (app) page | Natural-language query → LLM picks tool → tool returns structured result → frontend renders |
| 2. Receipt OCR | Expense submission form | Gemini vision reads receipt image, returns merchant/date/amount/tax/currency/category suggestion |
| 3. Insight cards | Dashboard + nightly Celery job | LLM summarizes candidate signals produced by deterministic analyzers, writes 3-5 cards per tenant per day |
| 4. Month-end close agent | /invoices/month-end | Gemini ranks and explains deterministic analyzer signals per draft invoice; the draft generation and line math are pure Python. User confirms each draft before send. See specs/APP_BLUEPRINT.md §8.3. |

---

## 3. The tool registry

Tools live in `backend/app/features/*/ai_tools.py` and are auto-discovered at startup by scanning. Each tool is a Python function with:
- A JSON schema (from a Pydantic model) describing its arguments
- A Python implementation that calls into the feature's `service.py`
- Inherited tenant scoping, RBAC, and audit logging from the service layer

### 3.1 v1.0 tool catalog

| Tool | Feature module | Purpose |
|---|---|---|
| `filter_timesheets` | `features/timesheets/ai_tools.py` | List timesheet_weeks or entries by employee, project, date range, status |
| `filter_invoices` | `features/invoices/ai_tools.py` | List invoices by client, project, status, date range |
| `filter_expenses` | `features/expenses/ai_tools.py` | List expenses by employee, status, amount range, category |
| `filter_leaves` | `features/leaves/ai_tools.py` | List leave_requests by employee, status, date range, type |
| `filter_approvals` | `features/approvals/ai_tools.py` | List pending approvals for the current user |
| `get_project_summary` | `features/projects/ai_tools.py` | Return project overview: client, status, budget, allocations, pipeline |
| `get_client_summary` | `features/clients/ai_tools.py` | Return client overview: active projects, open invoices, total revenue |
| `get_employee_summary` | `features/employees/ai_tools.py` | Return employee overview: team, manager, allocations, contribution |
| `compute_budget_burn` | `features/projects/ai_tools.py` | Calculate budget vs actuals for a project, return percent consumed + forecast |
| `compute_contribution` | `features/employees/ai_tools.py` | Calculate employee contribution over a period (billable hours / capacity) |
| `compute_capacity` | `features/employees/ai_tools.py` | Calculate team capacity for a period, accounting for allocations and leaves |
| `find_overdue_items` | `features/approvals/ai_tools.py` | Return overdue timesheets / invoices / approvals for a user or tenant |
| `extract_receipt_data` | `features/expenses/ai_tools.py` | Call Gemini vision on a receipt image, return structured expense data |
| `navigate_to` | `features/core/ai_tools.py` | Generate a URL to a specific entity for command palette UX |
| `onboarding_column_mapper` | `features/imports/ai_tools.py` | Map CSV headers to target schema during onboarding (per `docs/DATA_INGESTION.md`) |
| `explain_invoice_draft` | `features/invoicing_agent/ai_tools.py` | Given a draft invoice and its analyzer signals, return one short plain-text paragraph (2-3 sentences) and the top 3 ranked signals. Called in batches of up to 20 drafts per prompt. |

16 tools total for v1.0. Expansion = one new file per tool, not a new prompt family.

### 3.2 Tools that are NOT in v1.0

The following AI features are deliberately deferred beyond v1.0:

- AI-drafted emails and comments (DEF-038)
- Anomaly detection on expenses (DEF-039)
- Resource planning AI assist (DEF-040)
- AI-summarized weekly digest (DEF-041)
- Predictive staffing and revenue forecasting (DEF-042)
- Approval autopilot / auto-approve safe items (not in the v1.0 scope, falls under general deferrals)
- Timesheet autofill from previous weeks (not in the v1.0 scope)
- Inline "explain this number" (not in the v1.0 scope)

**Do not add any of these tools until their deferral trigger fires.** Ask the founder first.

---

## 4. Surface 1: Command palette

### 4.1 Behavior

- Trigger: Cmd+K (desktop) or a Search button in the mobile topbar
- User types a natural-language query (e.g., "show me Alice's timesheets from last week", "which projects are over budget", "when is Bob back from leave")
- Backend sends the query + tool catalog + minimal user context (tenant_id, user_id, timezone, today's date) to Gemini 2.5 Flash
- Gemini picks the right tool and fills arguments
- Backend validates arguments against the Pydantic schema, calls the tool
- Tool returns structured data (a list of entities, a number, a URL)
- Frontend renders the result directly (formatting step usually skipped)
- Response time target: under 2 seconds end-to-end

### 4.2 Guardrails

- **Rate limit:** 20 queries per user per hour (Redis sliding window counter)
- **Budget gate:** call is checked against tenant's `ai_budgets` row before firing
- **Killed state:** if `kill_switch.ai` is active, the palette returns "AI is temporarily paused" instead of calling Gemini
- **Degraded mode:** at 80% budget, the palette returns "AI is busy, try again in a few minutes" (OCR stays on because it's essential)
- **Forbidden tools:** no tool in the catalog can write to the database or send emails. All v1.0 tools are read-only. Destructive actions require a separate user confirmation UI, not a tool call.
- **RBAC inherited:** every tool call goes through the feature's `service.py`, which inherits tenant scoping + role checks from the regular HTTP path.

### 4.3 Cost target

- Input: ~500 tokens (query + tool catalog + user context)
- Output: ~200 tokens (tool name + structured arguments)
- Gemini Flash pricing (2026 estimate): ~€0.0002 per query
- At 2000 queries/month per 200-employee tenant: ~€0.40/month per tenant

Budget headroom is large; the per-tenant budget limits are primarily there to catch runaway loops, not typical usage.

---

## 5. Surface 2: Receipt OCR

### 5.1 Pipeline

See `docs/DATA_INGESTION.md` section 5 for the full pipeline. Summary:

1. User uploads receipt image via web or mobile camera
2. File goes to GCS via presigned URL
3. ClamAV Celery scan sets `files.status = 'ready'`
4. `extract_receipt_data` tool calls Gemini vision with the file reference
5. Gemini returns structured JSON validated against Pydantic schema
6. `expenses` row created in `draft` status with the AI values
7. User reviews, corrects, submits

### 5.2 Tool schema (input)

```python
class ExtractReceiptInput(BaseModel):
    file_id: UUID  # points at public.files row
    expected_currency: str | None  # tenant default if None
    expected_category_list: list[str]  # from expense_categories
```

### 5.3 Tool schema (output)

```python
class ExtractReceiptOutput(BaseModel):
    merchant: str
    date: date
    amount_cents: int
    currency: str
    tax_amount_cents: int | None
    tax_rate: Decimal | None
    suggested_category: str | None
    confidence: float  # 0.0 to 1.0
    raw_text: str | None  # for debugging, not stored
    warnings: list[str]  # e.g. "no tax line detected", "handwritten receipt"
```

### 5.4 Cost target

- Input: ~1500 tokens (receipt image + prompt)
- Output: ~300 tokens (structured JSON)
- Gemini Flash vision pricing: ~€0.003 per receipt
- At 1500 receipts/month per tenant (~7/day per user × 200 users × 5% who submit): ~€4.50/month per tenant

### 5.5 Essential mode (non-negotiable)

OCR stays on even in degraded mode because expense entry is the one AI flow where manual fallback ("type the receipt details yourself") is user-hostile and directly undermines the "app does the work" promise.

### 5.6 Accuracy targets (targets, not baselines)

| Field | Target accuracy |
|---|---|
| Merchant | 90% |
| Amount | 98% |
| Date | 95% |
| Currency | 99% |
| Suggested category | 80% |

Measured against the Phase 2 eval suite: 20 hand-curated synthetic receipts per currency/language combination.

### 5.7 Fallback

Manual expense form is always available. If `extract_receipt_data` fails or returns low confidence (< 0.6), the form is pre-filled with whatever fields Gemini did return, and the remaining fields are blank for the user to fill in.

---

## 6. Surface 3: Insight cards

### 6.1 Behavior

- Celery beat schedules the nightly insights job daily at 04:00 UTC. The job, when it fires, iterates tenants and converts 04:00 UTC to each tenant's `default_timezone`; it only generates for tenants where the local time is between 04:00 and 05:00 (quiet hours). Tenants outside that window skip this run and get picked up the next day.
- **Deterministic analyzers** (pure Python, no AI) produce candidate signals: projects over budget, employees with overdue timesheets, clients with overdue invoices, teams near capacity, leaves unapproved more than 5 days, etc.
- **Gemini's job** is to rank the signals by importance, write a one-paragraph explanation per card in the user's language, and return 3-5 top cards
- Cards stored in `ai_insights` table, cached 24 hours, displayed on the dashboard and the Insights page

### 6.2 Why LLM-as-router applies

The analyzers do the math. Gemini only writes the human-readable explanation and picks which ones are worth showing. No AI budget or approval decisions hinge on Gemini's output; the signals themselves are deterministic and reproducible.

### 6.3 Cost target

- Input: ~3000 tokens (candidate signal list + tenant context)
- Output: ~800 tokens (3-5 card explanations + ranking)
- Gemini Flash pricing: ~€0.003 per nightly run per tenant
- At 30 runs/month per tenant: ~€0.10/month per tenant

### 6.4 Cache behavior

- Cards generated at 4am are valid until 4am the next day (`cached_until` timestamp)
- If the user dismisses a card, it's never shown again
- If the user clicks "Act on this" it navigates to the relevant entity and marks the card `acted_on_at`
- If the nightly job fails, yesterday's cards stay visible with a "last updated yesterday" note

---

## 7. Surface 4: Month-end close agent

### 7.1 Why it exists

The month-end close is the single most painful manual process for a consulting finance team: 2-4 hours per month going through timesheets and expenses, matching them to clients, drafting invoices in a spreadsheet or stale tool, chasing a colleague to verify a rate, then copying into the billing system. Gamma collapses this to "review queue, confirm each". The agent is the one v1.0 AI surface where the savings are hours per month per user, directly demo-able, and directly revenue-measurable (speed of billing = speed of cash).

### 7.2 Architecture (LLM-as-router applied)

1. Celery job `tasks.invoicing_agent.generate_drafts(tenant_id, period_start, period_end)` fires deterministic analyzers against approved timesheets, approved expenses, and active rate periods.
2. Deterministic Python generates draft invoices per client using the line generation algorithm in `specs/DATA_ARCHITECTURE.md` §4.4.1. No AI involvement in the math.
3. For each draft, analyzers return a list of candidate signals (see `specs/APP_BLUEPRINT.md` §8.3).
4. The tool `explain_invoice_draft` calls Gemini Flash in batches of up to 20 drafts per prompt. Input: the draft summary (client, total, line count, signals). Output: a Pydantic-validated `InvoiceExplanation` object per draft with fields `{paragraph: str, top_signals: list[str], severity: literal["info", "warning", "action_needed"]}`.
5. Results are stored on the draft invoice row in `invoices.ai_explanation_json` and displayed via the `AIInvoiceExplanation` atom.

### 7.3 Tool schemas

```python
class InvoiceDraftSummary(BaseModel):
    invoice_id: UUID
    client_name: str
    total_cents: int
    currency: str
    line_count: int
    period_start: date
    period_end: date
    signals: list[AnalyzerSignal]

class AnalyzerSignal(BaseModel):
    code: str  # e.g. "rate_change_mid_period"
    severity: Literal["info", "warning", "action_needed"]
    reason: str  # human-readable, in user's language
    entity_refs: list[str]  # entity IDs for deep-linking

class InvoiceExplanation(BaseModel):
    invoice_id: UUID
    paragraph: str  # 2-3 sentences, plain text, no markdown
    top_signals: list[str]  # up to 3 signal codes, ranked
    severity: Literal["info", "warning", "action_needed"]
```

### 7.4 Cost target

- Input: ~4000 tokens per batch of 20 drafts (draft summaries + analyzer signals + system prompt)
- Output: ~1500 tokens per batch (20 explanations × ~75 tokens each)
- Gemini Flash pricing: ~€0.004 per batch
- A 120-client tenant runs ~6 batches per month (120 / 20): ~€0.024/month per tenant

The cost is negligible compared to the revenue impact. The v1.0 monthly Gemini budget is unchanged (~€5/month per 200-employee tenant).

### 7.5 Accuracy targets (targets, not baselines)

| Field | Target |
|---|---|
| Severity classification | 85% agreement with finance reviewer ground truth |
| Top-signal ranking | 80% relevance (top 3 signals match what reviewer would flag) |
| Paragraph fluency | 95% pass (no em dashes, no hallucinated entity names, no numbers that don't match signals) |

Evaluated against a synthetic eval set of 30 draft invoices with hand-curated signals and expected outputs, stored in `backend/app/ai/evals/invoicing_agent/`.

### 7.6 Fallback

If `kill_switch.ai` is on OR the Gemini call fails OR the per-tenant hourly AI ceiling is hit, the page still renders the draft queue. The `AIInvoiceExplanation` atom falls back to a neutral state showing just the analyzer signals as chips with no paragraph. Finance review is slower but functional. This is defined in `docs/DEGRADED_MODE.md` §2.

### 7.7 What's deferred

- Auto-send without confirmation (never; user always confirms)
- Machine learning from user edits (v1.1)
- Cross-period retroactive corrections (v1.1)
- Auto-dunning for unpaid (DEF-029 payment processor)

---

## 8. Budget and cost guardrails

### 8.1 Per-tenant monthly budget

Default per pricing tier, denominated in EUR, enforced inside `ai/client.py`:

| Tier | Monthly budget |
|---|---|
| Starter | €10/month |
| Pro | €30/month |
| Enterprise | custom (no default cutoff, but still metered) |

- **Warning at 80%:** banner to tenant admin, email notification
- **Cutoff at 100%:** `tenants.ai_enabled = false` effective until next month OR admin raises the limit (up to 3x tier default auto, above that needs operator console approval)

### 8.2 Per-user rate limits

- Command palette: 20 queries per user per hour
- OCR: 100 calls per user per hour
- Insight cards: background-only, no per-user rate limit

### 8.3 Degraded mode triggers

- Tenant budget hits 80%
- OR hourly AI spend across all users exceeds 10x the 7-day moving average (runaway detection)

In degraded mode:
- OCR stays on (essential)
- Command palette returns "AI is busy, try again in a few minutes"
- Insight card generation is skipped for the day
- Banner in the app explains why
- Operator console has an override to unpause a tenant manually

Degraded-mode behavior is defined per-feature in `docs/DEGRADED_MODE.md` (behavior matrix in section 2). Every Tier 1 feature's flawless-gate run must include one pass with `kill_switch.ai = on` to verify the row is true. Failure to handle degraded mode is a gate fail, not a polish item.

### 8.3.1 Runaway cost hard ceiling

**Primary defense: per-user rate limits** (20 palette queries/hour, 100 OCR calls/hour per tenant). These catch almost all abuse before cost spikes.

**Secondary defense: hard per-hour ceiling.** Each tenant has a hard ceiling of 1 EUR/hour of total Vertex AI spend, enforced in `backend/app/ai/client.py` before any call. Spend exceeding the ceiling returns HTTP 429 with `error=ai_rate_limited` and the user sees the degraded-mode banner. The ceiling is configurable per tenant via `tenants.ai_hourly_ceiling_cents` (default 100 = 1 EUR).

**Tertiary defense: weekly budget alert.** A nightly Celery job checks each tenant's rolling 7-day spend. If spend exceeds 200% of the prior 7-day moving average, an alert emails ops@gammahr.com; at 500%, `kill_switch.ai` is auto-flipped for that tenant (see `docs/DEGRADED_MODE.md`). A cold-start baseline of 0.01 EUR/hour is used for tenants with <7 days of history, avoiding division-by-zero.

**Never relied-upon defense: spending caps in GCP billing.** GCP billing budgets with 50/80/100% alerts are a safety net, not a primary control.

### 8.3.2 Prompt logging scope

**Prompt logging scope:** the AI client logs `tenant_id, feature, prompt_version, input_token_count, output_token_count, latency_ms, cost_eur, status, error_class` for every call. It does NOT log the prompt text or the response text (avoid PII liability). This gives cost observability without retention exposure. Retention: 90 days. See `docs/COMPLIANCE.md` section 7.

### 8.3.3 Closed tool registry

The tool registry is closed: the router cannot call tools not pre-registered per-feature. If a user request does not match any tool, the router falls back to a canned "I can help with <list>" response and does not attempt free-form completion. This is enforced in `backend/app/ai/client.py` at the dispatch layer.

### 8.4 Cost estimate, per 200-employee tenant, per month

| Feature | Events/mo | €/event | Total |
|---|---|---|---|
| Command palette | 2000 | €0.0002 | €0.40 |
| Expense OCR | 1500 | €0.003 | €4.50 |
| Insight cards | 30 | €0.003 | €0.10 |
| Onboarding column mapper | ~1 (per new CSV upload) | €0.001 | ~€0.01 |
| Month-end close agent | 6 batches/mo | €0.004 | €0.024 |
| **Total** | | | **~€5/month per tenant** |

This is an order of magnitude lower than the original Claude-based estimate because Gemini Flash is 5-10x cheaper than Claude Haiku. The €10 Starter budget gives ~2x headroom.

---

## 9. PII and compliance

### 9.1 What is NEVER in any prompt

The following columns are Confidential-tier (see `specs/DATA_ARCHITECTURE.md` section 8.1) and MUST NEVER appear in any AI prompt, even indirectly:

- `employee_compensation.*` (salary, bonus, effective dates)
- `employee_banking.*` (IBAN, BIC, account holder)
- `leave_requests.reason_encrypted` (GDPR Art. 9 sensitive data for medical-implied leaves)
- `employees.protected_status_encrypted` (GDPR Art. 9 protected categories: union membership, health, etc.)

These columns are physically split into separate tables with finance/admin-only access, and CMEK-encrypted at rest via Cloud KMS with a per-tenant keyring. A pytest metatest greps all tool definitions and prompt templates for references to these table names and blocks merge on violation.

### 9.2 What IS in prompts (classified Internal)

- Employee names, emails, role titles
- Client names, project names, project codes
- Time entries, expense amounts (non-sensitive), leave types (non-medical)
- Invoice totals and client references

This data is routed to Vertex AI in `europe-west9` within the same GCP project, same DPA, EU-only. Zero-retention configured in Vertex AI settings. This is acceptable under the Internal-tier classification in the data classification scheme.

### 9.3 Tenant and user opt-outs

- `tenants.ai_enabled` BOOL defaults TRUE. Admin can disable; UI hides AI surfaces when disabled; OCR falls back to manual entry.
- `users.ai_enabled` BOOL defaults TRUE. User profile toggle. Disabled users' data never appears in any prompt, even when tenant has AI enabled. This is the GDPR Art. 21 "right to object" implementation.

### 9.4 What is logged

`public.ai_events` stores only meter data: tokens, cost, tool, latency, request_id. **Never logs prompt content.** Prompts are transient.

---

## 10. Prompt versioning and evaluation

### 10.1 Prompt templates

- All Jinja2 templates live in `backend/app/ai/prompts/*.jinja`
- Versioned filenames: `palette_router_v1.jinja`, `insight_card_v2.jinja`, etc.
- Active version selected in code, same for all tenants (per-tenant A/B testing deferred, DEF-043)
- Every template begins with tenant name, user role, current date, user language
- Banned words enforced by linter: no em dashes, no "utilisation"

### 10.2 Tool schemas

- Every tool is a Pydantic model
- JSON Schema generated automatically via `model.model_json_schema()`
- Schemas serialized into the system prompt so Gemini knows the available tools
- Output validated against the schema before execution

### 10.3 Evaluation harness

- `backend/app/ai/evals/` directory contains 10-20 hand-curated synthetic examples per tool family
- CI runs evals on every prompt or tool-schema change
- Blocks merge if pass rate drops below threshold:
  - Router tool selection: 90%
  - OCR extraction: 95%
  - Insight card coherence: 75%
- Evals use **synthetic data only**, never real customer data

### 10.4 Kill switch for evals

If the eval suite itself is broken (CI dependency, infrastructure flake), the founder can skip it with a manual PR approval. This should be rare. Log every skip in the PR description so patterns become visible.

---

## 11. Observability

- Every Gemini call logged to `public.ai_events`: tenant, user, feature, tool, model, input_tokens, output_tokens, cost_cents, latency_ms, request_id, created_at
- `ai_events` partitioned monthly
- Cloud Monitoring dashboards: per-feature call count, cost, latency p50/p95, error rate
- Alerts: error rate > 5%/5min, p95 latency > 10s, daily cost > 2x the 7-day baseline (the same anomaly threshold that triggers degraded mode)

---

## 12. Reversibility

The entire AI stack sits behind `backend/app/ai/client.py`:

```python
class AIClient:
    def chat_with_tools(self, messages, tools, model=None) -> ToolCall: ...
    def vision_extract(self, file_url, schema) -> dict: ...
    def budget_check(self, tenant_id) -> None: ...  # raises if over budget
```

Swapping from Vertex AI Gemini to Anthropic Claude Haiku (or any other vendor) is a one-file change: rewrite the body of `AIClient` methods, keep the interface identical. Everything else in the codebase calls through this interface. The tool definitions, the Pydantic schemas, the prompts, the eval harness, and the budget enforcement all stay unchanged.

This is the DEF-046 escape hatch. It is not a planned migration; it is insurance.

---

## 13. Cross-references

- `specs/DATA_ARCHITECTURE.md` section 5 (AI layer data model), section 6 (feature gating via entitlements + flags + kill switches)
- `docs/DATA_INGESTION.md` section 5 (OCR pipeline)
- `docs/DEFERRED_DECISIONS.md` DEF-038 through DEF-046 (deferred AI features and vendor escape hatch)
- `docs/decisions/ADR-010-three-app-model.md` (command palette only exists in the (app) route group)
- `CLAUDE.md` section 1 (tech stack, now lists Vertex AI Gemini)

---

**End of AI_FEATURES.md.**
