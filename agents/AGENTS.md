# AGENTS

> Roles + pipeline + rules. Read `CLAUDE.md` first for the hard rules.
> The roster is a mental model. In practice one general-purpose agent does most tasks; the founder is the foreman.

---

## 1. Roles

| Role | Scope | Forbidden | Gate |
|------|-------|-----------|------|
| **Design System Guardian** | `specs/DESIGN_SYSTEM.md`, `frontend/components/ui/`, Storybook | Adding atoms without founder approval; modifying tokens | Prototype parity at all breakpoints |
| **Page Builder** | `frontend/app/`, `frontend/features/<domain>/` | Creating new atoms; skipping responsive rules | Flawless gate |
| **API Engineer** | `backend/app/features/<domain>/`, `backend/migrations/` | Touching frontend; adding columns without a migration; raw SQL in business logic | Pytest coverage + RBAC + audit log |
| **AI Integration Engineer** | `backend/app/ai/` (Vertex AI client, prompts, evals), plus per-feature tool definitions in `backend/app/features/*/ai_tools.py` | Adding AI where not in `specs/AI_FEATURES.md`; sending Confidential-tier PII (compensation, banking, Art. 9); hardcoding model IDs; bypassing the `ai/client.py` abstraction; skipping structured output validation | Cost + latency + fallback + eval pass rate + kill switch |
| **QA Scout** | `docs/FLAWLESS_GATE.md` runs | Fixing issues directly (files reports only) | 15/15 gate items |
| **Security Reviewer** | Auth, session, RBAC, input validation, secrets | Touching product code | Cross-tenant test + rate limit test |

---

## 2. Pipeline

Every feature takes the same path. No shortcuts allowed except by founder.

```
Spec  ->  Design pass  ->  Build pass  ->  QA gate  ->  Founder sign-off  ->  Ship
```

| Stage | Owner | Input | Output | Exit |
|-------|-------|-------|--------|------|
| 1. Spec | Founder | `APP_BLUEPRINT.md` row | No ambiguity in the row | Founder reads and confirms |
| 2. Design pass | Design System Guardian | Spec | All required atoms exist in Storybook, prototype parity verified | Storybook green |
| 3. Build pass | Page Builder + API Engineer (+ AI Engineer if needed) | Spec + component library | API, frontend, tests | CI green (typecheck + lint + tests) |
| 4. QA gate | QA Scout + Security Reviewer | Built feature branch | `docs/FLAWLESS_GATE.md` run + screenshots | 15/15 green |
| 5. Founder sign-off | Founder | Green QA report | Ship or send back | Founder says "ship it" |
| 6. Ship | Founder | Signed-off feature | Merge + staging smoke + prod promotion | Live |

Failure at any stage returns to the previous stage. Failure in stage 4 means re-run all 15 gate items, not just the failed one.

---

## 3. Concurrency

- Tier 1 features: one at a time in the order from `APP_BLUEPRINT.md` phase mapping.
- Tier 2 features: may run in parallel with each other after Tier 1 is done.
- Within a single Tier 1 feature: backend + frontend may run in parallel once the API contract is locked first.

Never invoke more than 3 subagents concurrently (rate limits).

---

## 4. Rules for every agent

1. Read `CLAUDE.md` first.
2. Read `/home/kerzika/.claude/projects/-home-kerzika-ai-workspace-claude-projects-gammahr-v2/memory/MEMORY.md`.
3. Read the relevant `prototype/<page>.html` before any visual work.
4. Read the relevant spec row in `APP_BLUEPRINT.md`.
5. Stay in scope. Never touch files outside your role's folder.
6. No em dashes. No "utilisation". No decorative flourishes.
7. Report back in < 300 words unless the task demands more.
8. Prefer editing existing files over creating new ones.
9. Stop and ask if the task is unclear. Never guess.
10. Never commit or push without explicit founder instruction.

---

## 5. When to skip the pipeline

The pipeline is the default. Skipping is allowed in these narrow cases:

| Case | Skip |
|------|------|
| Typo fix in a string | Go straight to ship after founder review |
| Bug fix with < 10 lines changed | Skip stage 2 (design pass) |
| Adding a new test without changing code | Skip stages 2 and 4 |
| Founder explicitly waves you through | Any stage |

Otherwise, run all six stages.

---

## 6. Cadence (target)

- Stage 1-2 per feature: 1-2 days
- Stage 3 per feature: 3-7 days depending on complexity
- Stage 4 per feature: half a day
- Stage 5: founder availability
- Stage 6: hours

**Goal: one Tier 1 feature per week in Phase 5.** Actual cadence will be lower on complex features (invoices, approvals, weekly timesheet grid).

If we fall behind, drop Tier 2 scope first. Never Tier 1 quality.
