# Founder folder

> **Purpose.** Non-delegable founder documents: legal structure, runway, co-founder agreement, pipeline, investor list. Never touched by Claude Code agents. Cross-referenced from `FOUNDER_CHECKLIST.md`.

## What belongs here

- Legal entity setup, tax residency, payroll/contractor structure
- Runway budget, burn rate, fundraise triggers
- Co-founder agreement decisions and status
- Sales pipeline, discovery calls, warm-intro targets
- Investor target list and fundraise progress
- Personal strategic decision log

## What does NOT belong here

- Technical architecture, code, specs (those live in `specs/`, `docs/decisions/`, `docs/runbooks/`)
- Agent-facing checklists (those live in `EXECUTION_CHECKLIST.md`)
- Customer data or PII of any kind

## Committed vs local files

Two conventions in this folder:

1. **`<name>.md`** is committed to the repo. Safe to share. Contains the structure, decisions, and public templates. Example: `runway.md` (the budget structure with zero-value placeholders).
2. **`<name>.local.md`** is gitignored. Contains real numbers, bank balances, full names, contact details, pipeline entries. Example: `runway.local.md` (the actual cash, actual burn, actual months remaining).

Any file ending in `.local.md` under `docs/founder/` is automatically excluded from commits by `.gitignore`. Never rename a `.local.md` file to drop the suffix; that would commit sensitive data.

## Files in this folder

| File | Committed? | Purpose |
|---|---|---|
| [README.md](README.md) | yes | This file, the index. |
| [legal-structure.md](legal-structure.md) | yes | UK Ltd + France residency setup, auto-entrepreneur path, permanent-establishment risk, tax advisor engagement. |
| [runway.md](runway.md) | yes | Budget template with placeholders, 18-month burn forecast, fundraise triggers, sign-off slots. |
| [runway.local.md](runway.local.md) | **no** (gitignored) | Actual cash balance, actual burn variance, bank references. |
| [cofounder-agreement.md](cofounder-agreement.md) | yes | SeedLegals path, required clauses checklist, decisions to lock before signing. |
| [cofounder-agreement.local.md](cofounder-agreement.local.md) | **no** (gitignored) | Signed agreement reference, storage locations, equity split history. |
| [pipeline.md](pipeline.md) | yes | Outreach template, 10 target profile descriptions, stage definitions. |
| [pipeline.local.md](pipeline.local.md) | **no** (gitignored) | Real names, real firms, real messages sent, real responses. |
| [investors.md](investors.md) | yes | Seed VC target list template (empty, committed for structure). |
| [investors.local.md](investors.local.md) | **no** (gitignored) | Real investor conversations, warm intros, deal terms. |

## How to create a local file

```bash
cp docs/founder/runway.md docs/founder/runway.local.md
```

Edit `runway.local.md` in your editor. Save. It will NOT appear in `git status`. Verify with `git check-ignore docs/founder/runway.local.md` - it should echo the file name, confirming it is ignored.

## Cross-references

- `FOUNDER_CHECKLIST.md` - the weekly rhythm and top-3 tasks list
- `THE_PLAN.md` - phase exit criteria, validated lead gate, pre-customer-2 commitment
- `docs/GO_TO_MARKET.md` - pricing, pilot playbook, commercial plan
- `docs/runbooks/secrets-management.md` - never commit credentials (applies here too)
