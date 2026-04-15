# Runbooks

> **What this is.** One-page practical procedures for one-off or rare operations the founders run on Gamma's infrastructure and data. Runbooks are NOT skills (skills are for repeating knowledge work with context). Runbooks are for "I need to do this specific thing right now, walk me through it".
> **When to add a runbook.** Any operation that: (a) is run manually by a human, (b) has authorization implications (GCP billing, DNS, production data), (c) is rare enough to forget between runs, and (d) would be dangerous to automate without human confirmation.

## Runbook index

| Runbook | When | Time | Rollback? |
|---|---|---|---|
| [GCP bootstrap](gcp-bootstrap.md) | Phase 2 week 1, once per environment (prod + staging) | 2-3 hours | Partial (delete project is soft, 30-day grace) |
| [Cloudflare bootstrap](cloudflare-bootstrap.md) | Phase 2 week 1, after GCP bootstrap | 45-60 minutes | Yes (DNS changes are propagating, allow 24h) |
| [Tenant provisioning](tenant-provisioning.md) | Every new customer tenant (test or real) | 15-20 minutes | Yes (delete tenant procedure in docs/ROLLBACK_RUNBOOK.md) |
| [Rollback (schema migration failure)](../ROLLBACK_RUNBOOK.md) | When a migration fails mid-deploy | 30 minutes to 3 hours | N/A (the rollback IS the recovery) |
| [Secrets management](secrets-management.md) | Read before first commit; reference when adding a credential | ongoing reference, not a procedure | N/A (rules, not steps) |

## How these relate to the ops library

Wherever a runbook step says "run this command", prefer the `gamma-ops` CLI from `infra/ops/` over raw gcloud or raw Cloudflare API calls. The ops library wraps vendor SDKs in deterministic, idempotent, tested functions with consistent error handling and structured logging. Runbook steps that mention `gamma-ops` commands assume you have already installed the library per `infra/ops/README.md`.

When a function is not yet implemented in the ops library (marked [STUB] in the catalog), the runbook provides the raw gcloud or API call as a fallback. Replace the raw call with the ops library call when the function is implemented.

## How these relate to skills

Skills are invoked by the agent or the founder via `/skill-name` inside a Claude Code session. Runbooks are read by a human in a terminal. Some runbook steps are assisted by agents (e.g., "spawn an agent to review the config"), but the runbook is the source of truth for the operation, not the agent's improvisation.

## Adding a new runbook

1. Copy the template section from `docs/ROLLBACK_RUNBOOK.md` section header
2. Use the 5-section structure (pre-flight, procedure, verification, rollback, follow-ups)
3. Add a row to the index above
4. Commit
