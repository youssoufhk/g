# AI FEATURES

> Every place AI appears, how it is wired, and how it fails safely.
> Provider: Anthropic Claude API via `anthropic` Python SDK. All code in `backend/app/ai/`.
> All numbers (cost, accuracy, latency) are **targets**, not measured baselines. Marked TBD where real data is needed.

---

## 1. Principles

1. AI augments, never gates. Every AI-assisted flow has a non-AI fallback.
2. User confirms before write. AI proposes, user approves. No silent mutations.
3. Prompt caching on system prompts + tenant context (static per request).
4. Every call logged to `ai_events` with tokens, latency, cost.
5. Tenants can opt out per feature. Kill switches in Admin console.
6. No PII in logs by default. Raw bodies only in debug mode per tenant.
7. Structured outputs only (tool-use with Pydantic schemas). Never parse free-form text for finance-impacting fields.
8. Prompt injection defense: user input always as a user turn, never concatenated into system prompt.

---

## 2. Three layers

| Layer | Where | Features |
|-------|-------|----------|
| 1. Command palette | Shell (Cmd+K) from every page | Navigate, search, create actions |
| 2. Inline | Within module pages | OCR, autofill, anomaly badges, AI explain |
| 3. Insights page | `/insights` + dashboard widget | Ranked cross-module insights |

---

## 3. Feature catalog

### 3.1 Expense OCR (layer 2)

| Field | Value |
|-------|-------|
| Trigger | Upload receipt image or PDF at `/expenses` submission |
| Model | `claude-haiku-4-5` |
| Temperature | 0 |
| Output | Tool-use `extract_receipt` with Pydantic schema (merchant, date, amount, tax, currency, category_id, description, confidence) |
| Cached | System prompt + tenant category list |
| Retry | 3x exponential backoff on 5xx |
| Cost target | TBD (est. < $0.01/event) |
| Accuracy target | TBD (est. merchant 90%, amount 98%, date 95%, category 80%) |
| Latency target | p95 < 8 s end-to-end |
| Fallback | Manual form always available |

### 3.2 Timesheet autofill (layer 2)

| Field | Value |
|-------|-------|
| Trigger | "AI fill" button on weekly timesheet |
| Model | `claude-sonnet-4-6` |
| Inputs | User's last 4 weeks + active project list + calendar if integrated |
| Output | Tool-use `propose_week` with schema |
| Safeguards | Max 12 h/day, never propose unassigned projects, tagged `ai_suggested` |
| Cost target | TBD (est. < $0.02/proposal) |

### 3.3 Approval autopilot (layer 2)

| Field | Value |
|-------|-------|
| Trigger | "Approve safe items" button on approvals hub |
| Model | `claude-sonnet-4-6` with few-shot examples |
| Scoring | Probability an item matches previously-approved patterns |
| Threshold | Items scoring > 0.9 shown as "safe to approve" |
| Caps | Never auto-approve items > $500 or first-time vendors/employees |
| Explainability | One-line reason per item ("Similar to 18 items you approved last month") |
| User action | User clicks "approve all safe"; no silent batch |

### 3.4 Onboarding CSV mapper (layer 2)

| Field | Value |
|-------|-------|
| Trigger | CSV upload in onboarding wizard |
| Model | `claude-haiku-4-5` |
| Inputs | CSV headers + 5 sample rows + target schema |
| Output | Column mapping + transformation rules + warnings |
| Cost target | TBD (est. < $0.01/import) |
| Fallback | Manual column mapper always available |

### 3.5 Command palette (layer 1)

| Field | Value |
|-------|-------|
| Trigger | Cmd+K from anywhere |
| Model | `claude-sonnet-4-6` |
| Cached | System context with schemas, available actions, user role |
| Tool bindings | `navigate(page)`, `search(entity, filters)`, `create(entity, fields)`, `fetch_data(query)` |
| Security | Every action runs through the same RBAC middleware as regular UI. Destructive actions blocked from the palette. |
| Rate limit | 30 queries/min/user |
| Cost target | TBD (est. < $0.01/query) |

### 3.6 Insights (layer 3)

| Field | Value |
|-------|-------|
| Schedule | Nightly Celery job per tenant |
| Detection | Deterministic analyzers produce candidate signals (anomalies, thresholds, trends). No AI math. |
| Claude role | Summarize + rank candidate signals, produce short explanation |
| Storage | Top N stored in `ai_insights` |
| Surface | `/insights` page + top 3 on dashboard |
| Cost target | TBD (est. < $0.50/tenant/night) |

### 3.7 Inline explain

On-demand "why is this number unusual" info icon. Sends surrounding context to Claude, returns one-paragraph explanation. Not precomputed.

---

## 4. Prompt engineering rules

- All system prompts live in `backend/app/ai/prompts/*.jinja`, versioned.
- Every prompt has a unit test that snapshots the rendered output.
- Every tool schema is a Pydantic model. JSON Schema generated, not handwritten.
- System prompts begin with tenant name, user role, current date.
- Banned words: "utilisation" (use "work time", "capacity", "contribution"), em dashes.

---

## 5. Cost model (estimates, per 200-employee tenant per month)

All numbers are **estimates** pending real usage data. Review monthly.

| Feature | Events/mo | $/event | Total |
|---------|-----------|---------|-------|
| Expense OCR | 1500 | $0.005 | $7.50 |
| Timesheet autofill | 800 | $0.015 | $12.00 |
| Approval triage | 200 | $0.010 | $2.00 |
| Command palette | 2000 | $0.008 | $16.00 |
| Onboarding mapper | 10 | $0.005 | $0.05 |
| Nightly insights | 30 | $0.500 | $15.00 |
| **Total** | | | **~$52.50** |

Alerts fire at 2x baseline. Per-feature kill switches in Admin.

---

## 6. Observability

- Every Claude call logged: feature, user, prompt hash, input/output tokens, latency, cost.
- Grafana Cloud dashboards per feature.
- Alerts: error rate > 5%/5min, p95 latency > 10 s, daily cost > 2x 7-day baseline.

---

## 7. Security

- Secrets never in prompts. Only tenant ID and user ID as context.
- PII hashed in logs by default.
- Tool-use outputs validated against Pydantic before execution.

---

## 8. Kill switches

Per-tenant toggles in Admin console:
- Disable OCR
- Disable timesheet autofill
- Disable approval autopilot
- Disable command palette
- Disable insights
- Disable all AI

Default: all on. Opt-out, not opt-in.
