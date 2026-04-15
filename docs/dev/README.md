# Gamma dev documentation

> **New to the repo? Start with [`01-quickstart.md`](01-quickstart.md).** It gets you from a clean machine to a running Gamma app in 5 commands.

This folder is the onboarding guide for anyone touching the codebase: founders, co-founders, hires, contractors, your future self three months from now. It assumes nothing beyond "you know git and a terminal". If a term is confusing, check [`07-glossary.md`](07-glossary.md).

## When to read what

| File | Read this when... |
|---|---|
| [`01-quickstart.md`](01-quickstart.md) | It's your first time and you want to see the app run |
| [`02-mental-model.md`](02-mental-model.md) | You want to understand what's actually happening under `make dev-up` |
| [`03-daily-workflow.md`](03-daily-workflow.md) | You're editing code and need the day-to-day commands |
| [`04-repo-layout.md`](04-repo-layout.md) | You're looking for a file and don't know where it lives |
| [`05-common-tasks.md`](05-common-tasks.md) | You have a specific task: add an endpoint, reset the DB, run one test |
| [`06-debugging.md`](06-debugging.md) | Something is broken and you need to unblock yourself |
| [`07-glossary.md`](07-glossary.md) | You hit a term you do not recognize (tenant, wrapper, atom, flawless gate) |

## Where else to look

- **Hard rules** (things you must never do): `CLAUDE.md` at the repo root. Read it once on day 1, then refer to it when a decision feels tempting.
- **Phase plan** (what we ship next): `THE_PLAN.md` and `EXECUTION_CHECKLIST.md` at the repo root. The plan is two tracks: an agent-facing execution checklist and a strategic week-by-week plan.
- **Specs** (what we are building): `specs/*.md`. These are the source of truth for features, data model, design system, AI, mobile.
- **Decisions** (why we chose X over Y): `docs/decisions/ADR-*.md`.
- **Runbooks** (operational procedures): `docs/runbooks/*.md`.

## This folder is editable

Everyone on the team is welcome to fix or expand these docs. If something was confusing to you, it will be confusing to the next person. Open the file, fix it, commit. No approval needed for docs changes that clarify things already in place.

What you should NOT change without a discussion: the hard rules in `CLAUDE.md`, the locked specs under `specs/`, or the frozen visual reference under `prototype/`. Those are architectural contracts.
