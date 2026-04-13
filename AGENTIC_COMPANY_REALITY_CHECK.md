# Agentic Company — Brutal Reality Check

> "The company needs to be built by agents and managed by agents from ground 0.
>  Solo. No humans. Pure AI. The key to utmost scalability."

This document is a honest, unvarnished assessment of that thesis.
It is not a motivational document. It is a risk register.

---

## The Core Thesis (stated charitably)

You want to build a production SaaS company where:
- Product design, frontend, backend, devops, QA, and support are all done by AI agents
- You are the sole human — the orchestrator and decision-maker
- Agents handle everything that would otherwise require hiring

This is not delusional. It is directionally correct and early. The question is not
*whether* this is possible — it is *what specifically breaks today* and *how to
sequence the build so you don't fail before it works*.

---

## What Agents Can Do Today (Honestly)

| Task | Agent Capability Today | Confidence |
|------|----------------------|------------|
| Write HTML/CSS prototype from spec | High — you've proven this | ✓ Solid |
| Fix specific, well-described bugs | High — with a clear task file like AGENT_PROTOTYPE_FIX.md | ✓ Solid |
| Generate boilerplate Rust/Next.js structure | Medium — compiles, needs review | ⚠ Needs review |
| Write a REST endpoint with tests | Medium — unit tests yes; integration usually needs fixing | ⚠ Needs review |
| Design a data schema from requirements | Medium-High — good first draft, misses edge cases | ⚠ Needs review |
| Write a database migration | Medium — will do it, sometimes drops an index | ⚠ Needs review |
| Build a complex stateful UI component | Medium — functional but often not production-grade | ⚠ Needs review |
| Security audit (threat modelling) | Low-Medium — pattern matching, misses novel attack surfaces | ✗ Do not trust alone |
| Debug a production incident | Low — needs human context about what "normal" looks like | ✗ Not yet |
| Make product decisions (what to build next) | Very Low — will generate options, cannot own the decision | ✗ Always you |
| Handle a customer complaint | Low — template responses only; nuance requires human | ✗ Not yet |
| Manage infra under load (auto-scaling, incident response) | Medium — with pre-written runbooks | ⚠ Runbooks required |
| Write and run E2E tests against a live environment | Medium — with Playwright/Cypress + agent orchestration | ⚠ Needs setup |
| Review its own code for security vulnerabilities | Low — will miss class-level bugs (IDOR, timing attacks) | ✗ Do not trust alone |

**The honest summary:** Agents today are excellent junior engineers who can execute
well-specified tasks, struggle with ambiguity, cannot own cross-cutting concerns,
and will confidently produce wrong answers without flagging uncertainty.

---

## The 5 Things That Will Actually Kill You Before Agents Can Save You

### 1. The Context Collapse Problem

Every agent call starts fresh. A human engineer accumulates 6 months of implicit context:
why the auth middleware was written that way, what the schema migration that broke prod taught
us, which client's edge case required that workaround. Agents don't.

Without persistent, structured memory of every decision and its rationale, your agent team
will repeatedly re-introduce bugs you already fixed, re-invent architecture you already
rejected, and contradict earlier decisions mid-build.

**Mitigation:** You need a machine-readable decision log — an ADR (Architecture Decision
Record) system that agents are required to read before any significant change and write to
after any significant decision. This is foundational. Without it, the agent team degrades
into chaos as the codebase grows.

### 2. The Verification Gap

An agent will write a Rust endpoint, tell you it compiles and passes tests, and be wrong in
ways that matter at scale: no rate limiting, missing tenant isolation, a subtle SQL injection
in a dynamic query, an auth token that doesn't expire. Not because the agent is lazy —
because it doesn't have a human's intuition for "this feels wrong."

You will need to be the security and correctness verifier. This means you need to understand
every piece of code your agents produce at a review level, even if you didn't write it.
If you can't review it, you can't ship it.

**Mitigation:** Build a mandatory automated gate: every PR must pass linting, type checking,
a security scanner (cargo-audit, semgrep), and a test suite before you even read it. Only
what passes the gate reaches you for review.

### 3. The Scope Creep / Contradiction Spiral

Agents given large specs will over-build. They will add abstractions you didn't ask for,
create interfaces for hypothetical future requirements, and introduce dependencies that
conflict with each other. The more agents you run in parallel on the same codebase, the
more likely they produce contradictory code.

Two agents working in parallel on the backend and frontend will both decide on the API
contract independently and disagree.

**Mitigation:** Strict sequential gates. The API contract is frozen and written to a file
before any frontend agent or backend agent touches code. No agent writes code against an
unfinished spec.

### 4. The Rust Learning Curve Is Yours, Not the Agent's

Agents can write Rust. Claude Sonnet can write correct Rust. The problem is: when the agent
makes a lifetime error, a trait bound mistake, or an async executor misuse that causes a
subtle deadlock at load — can you debug it?

If the answer is "not yet," you have a critical dependency: you must understand the language
well enough to review and debug what the agent produces. Otherwise the agent's productivity
is bounded by your ability to understand the output.

**This is not an argument against Rust.** It is an argument that your Rust learning curve
is now on the critical path to shipping, because you cannot delegate debugging to an agent
that generated the bug.

### 5. The Customer Support Cliff

When you have paying customers, something will break at 2am on a Friday. An agent cannot
own that incident. It can help — draft the postmortem, query the logs, write the hotfix —
but the incident commander making the decision to roll back, inform customers, and
communicate to enterprise accounts is you.

This is not a scaling problem. It is a trust problem. Customers who pay €50/user/month
for a product that manages their employee data expect a human on the other end of a crisis.

---

## What the Agentic Company Actually Looks Like (Honest Version)

This is not a science fiction company where agents run autonomously. That doesn't exist yet
in a form that ships reliable production software. What actually works today is:

**You, the human, as the only decision-maker + agents as a multiplier of your execution.**

The multiplier is real and substantial. With well-structured agent prompts and a clean
codebase, you can do the work of 3-5 engineers. Not 20. Not 100. 3-5.

The key shift from "I use Claude sometimes" to "I run an agentic company" is:

1. **Every task is a structured spec file,** not a chat message. The agent gets the file,
   executes it, produces a diff. You review the diff, not the conversation.

2. **The codebase is designed for agents.** Small files. Explicit interfaces. ADRs for
   every significant decision. Tests before code. Clear module boundaries. An agent cannot
   reason about a 2,000-line Rust file well. 200-line files with documented contracts? Yes.

3. **You have a gated pipeline.** Code the agent writes doesn't run unless it passes:
   - Compiler (zero warnings)
   - Linter (clippy for Rust, eslint for frontend)
   - Security scanner
   - Unit + integration tests
   - Your review

4. **You own the product decisions.** The agents build. You decide what to build, in what
   order, and why. Never delegate the "what" — only the "how."

---

## Honest Timeline Estimate (Solo + Agents, Rust + Next.js)

Assuming: you, agents as 3-5x multiplier, Rust backend, no corners cut on security.

| Milestone | Realistic Timeline |
|-----------|-------------------|
| Fix prototype (P0 + P1) | 1–2 days with agents |
| Rust backend scaffold: auth, multi-tenancy, CI/CD | 3–4 weeks |
| Core modules: employees, timesheets, leaves, expenses | 6–8 weeks |
| Projects, clients, invoices, PDF | 4–6 weeks |
| Gantt, resource planning, AI features | 4–6 weeks |
| QA, security review, load testing | 3–4 weeks |
| **Total to private beta** | **~5–6 months** |
| **Total to production-ready** | **~8–10 months** |

These are not pessimistic. They account for the Rust debugging cycles, the agent review
overhead, and the inevitable rework when a security issue is found in QA.

If you use FastAPI instead: subtract 6–8 weeks from backend modules. You'd ship in 3–4 months.
That is the honest cost of the Rust choice — not impossible, not impractical, but real.

---

## What to Build First (Agentic Sequencing)

The order matters because later agents depend on earlier decisions being locked.

```
Phase 0 (now): Fix prototype → demo-ready
  Agent: AGENT_PROTOTYPE_FIX.md (already written)

Phase 1 (weeks 1-2): Lock the contracts
  Agent: API spec generator — OpenAPI schema for all 15 core endpoints
  Agent: DB schema generator — SQL migrations for all entities
  Human review gate: sign off on schema + API before any code agent runs
  Output: openapi.yaml + migrations/*.sql — frozen, no agent may change without your review

Phase 2 (weeks 3-6): Backend foundation
  Agent: Rust project scaffold (Axum, tower middleware stack, auth, tenant middleware)
  Agent: Core CRUD handlers for employees, departments
  Agent: Auth endpoints (login, refresh, WebAuthn)
  Gate: Every PR passes cargo clippy + cargo-audit + integration tests

Phase 3 (weeks 7-12): Core modules
  Agents: One module at a time (leaves, timesheets, expenses, projects, invoices)
  Gate: Each module has an E2E test before the next starts
  No parallel agents on overlapping modules

Phase 4 (weeks 13-18): Frontend
  Agent: Next.js scaffold importing the prototype design tokens
  Agent: One page at a time, API-connected, using the locked OpenAPI spec
  Gate: Storybook component renders + Playwright smoke test per page

Phase 5 (weeks 19-22): AI features + polish
  Agents: OCR pipeline, NL query endpoint, insights summaries
  Agent: Load testing scripts + performance optimization
  Human review gate: security audit before any AI feature accesses tenant data
```

---

## The Single Most Important Structural Decision

**Write ADRs (Architecture Decision Records) from day one.**

Every time you decide: "schema-per-tenant, not row-level tenancy" or "JWT not sessions" or
"Typst not WeasyPrint" — write it to `docs/decisions/ADR-001-tenant-isolation.md`.

Every agent that touches related code must be instructed to read the relevant ADRs first.

This is the only mechanism that prevents the context collapse problem from destroying your
codebase 6 months in. Without ADRs, every agent call is amnesiac. With them, you have
institutional memory that survives context windows.

---

## Final Verdict

**Is the "agents build the company" thesis viable?**

**Yes, partially, today. Fully, within 2 years.**

What is viable today:
- Agents as 3-5x execution multipliers with a human orchestrator
- Structured, gated, spec-driven workflows (not chat-driven)
- Agents handling 80% of code production with you reviewing and deciding

What is not viable today:
- Autonomous agents making product decisions
- Agents owning production incidents without human oversight
- Agents reviewing their own security output
- Running fully unsupervised agent pipelines on a multi-tenant system with paying customers' data

**The real risk is not the ambition — it is misallocation of your time.**
If you spend it managing agent chaos instead of making product decisions,
you get the worst of both worlds: slow output, fragile code, and no human leverage.

The discipline required to run an agentic company is higher than the discipline required
to run a human team — because every failure mode is invisible until it is too late,
and there is no one to catch it but you.

That is the honest reality. The vision is correct. The timeline requires discipline.
