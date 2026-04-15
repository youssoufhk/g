# ADR-001: Multi-tenancy

**Status:** Accepted

## Decision

**Schema-per-tenant in PostgreSQL 16**, one cluster, one logical database per environment.

- **`public` schema** holds global tables: identity (operators, users, portal_users), tenants, billing (subscription_invoices, fx_rates, invoice_sequences, tenant_entitlements, tenant_custom_contracts), audit (audit_log, ai_events, entity_revisions), operational plumbing (alembic_runs, alembic_backfills, feature_flags, idempotency_keys, files, notifications, holidays).
- **Per-tenant schema** `tenant_<slug>` holds every business entity (employees, clients, projects, timesheet_weeks, timesheet_entries, leaves, expenses, invoices, AI per-tenant tables).
- **FastAPI middleware** extracts `tenant_id` from the JWT, looks up `tenants.slug`, and sets `SET search_path = tenant_<slug>, public` for the duration of the request.
- **Strict user-tenant binding:** one `public.users` row per (email, tenant_id). A real person working for two tenants has two rows. No cross-tenant profile.

## Rationale

- **Strong isolation on a single cluster.** A missed `WHERE tenant_id = ?` in row-level tenancy silently leaks data across customers. With schema-per-tenant, only a missed `search_path` call would cause a leak, and that is easier to audit via one piece of middleware plus a CI test.
- **`CREATE SCHEMA` is instant and cheap.** Tenant provisioning is a single DDL statement.
- **`DROP SCHEMA tenant_<slug> CASCADE` is one command.** GDPR tenant deletion at day 60 of the suspended-account lifecycle is atomic.
- **Per-tenant logical backup** via `pg_dump -n tenant_<slug>`. Per-tenant restore is straightforward.
- **Clear sharding path** if ever needed: move heavy tenants to their own cluster by pointing the tenant record at a different connection string.

## Alternatives considered and rejected

- **Row-level tenancy with `tenant_id` column on every table.** Rejected. One missed `WHERE` leaks everything. Postgres RLS policies help but fight the ORM and do not catch enough of the bug class. The bug class is existential for a B2B SaaS selling to 200-employee consulting firms with competitor customers.
- **Database-per-tenant (separate logical DB per customer).** Rejected. Breaks connection pooling at 100+ tenants because PgBouncer holds one pool per database. Also complicates failover, backups, and cross-tenant operator queries.
- **Hybrid (row-level with occasional schema split).** Rejected as worst-of-both: inherits row-level's leak risk AND schema-per-tenant's migration complexity.

## Consequences

- **Migration pipeline is more complex.** Alembic must run against N schemas. Addressed by a Celery fan-out runner with a `public.alembic_runs` tracking table: one task per tenant schema, deploy waits until all report success, per-tenant failure is isolated and retryable. Budget 2-3 days in Phase 2 for the custom migration runner + fake-tenant test harness.
- **Connection pooling is schema-aware.** `search_path` must be reset on every connection borrow from the pool. Addressed by PgBouncer in transaction mode at Year 2-3 (~20-30 tenants), with the middleware explicitly issuing `SET search_path` at the start of every request. Tracked as DEF-013 (managed PgBouncer is not a GCP product; founder self-hosts on a Compute Engine VM when the time comes).
- **Catalog bloat must be monitored** as tenant count grows. Postgres handles thousands of schemas fine; watch `pg_class` size and `pg_statistic` statistics.
- **Cross-tenant schema drift detection:** weekly Celery job runs Sundays at 02:00 UTC, fingerprints each tenant schema (tables, columns, indexes, constraints) against the canonical schema, and alerts ops@gammahr.com on any divergence. On drift, deploys to the drifted tenant are halted at the migration runner until the founder manually reconciles via `docs/ROLLBACK_RUNBOOK.md` (to be created in Phase 2). The reconciliation endpoint is operator-only and audited. Drift detection is idempotent: running it twice gives the same result. Full auto-reconciliation UI deferred (DEF-054).
- **Connection pooling:** Phase 2-3 (up to 5 tenants) uses direct Cloud SQL connections via Cloud SQL Auth Proxy, each Cloud Run instance holds 1 connection per active tenant lazily. Phase 4-5 (up to 50 tenants): monitor `pg_stat_activity` weekly; if total connections exceed 500 or p95 connection wait time exceeds 100 ms, enable connection reuse in the search_path reset logic. Phase 6 onward (50+ tenants): adopt PgBouncer on Compute Engine (transaction mode) per DEF-013 before connections reach 80% of Cloud SQL's hard limit (default 4000).
- **At ~10k tenants**, reconsider sharding into multiple clusters. Not a Year 2-3 concern.
- **At 300-500 tenants**, migration fan-out duration starts to hurt deploy windows. Transition to expand-migrate-contract pattern (DEF-052). The current runner's `alembic_runs` tracking table already supports this evolution without rewriting the execution layer.

## Follow-ups (required in Phase 2)

- **Migration runner** in `backend/migrations/runner.py` with Celery fan-out and the fake-tenant test harness (spin up 10 fake schemas, run migration, verify all at new version).
- **Cross-tenant query test** in CI that deliberately forgets `search_path` and asserts the test fails (sanity check against middleware regression).
- **Schema fingerprint job** comparing tenant schemas to baseline weekly.
- **Recovery runbook** at `docs/ROLLBACK_RUNBOOK.md` covering per-tenant rollback and full-cluster PITR. **Required in Phase 2, not Phase 7** (moved forward: migration failures during Phase 5 feature build are high-risk and need the runbook before Phase 5 begins, not after launch).

## Related decisions

- ADR-010 (three-app model) depends on this for the identity-table split.
- The optimistic-concurrency flow (version column on the mutable-row whitelist, HTTP 409 on conflict, three-layer resolution) assumes per-schema isolation plus per-row version columns.
- GDPR erasure uses `DROP SCHEMA` for full tenant deletion and per-row anonymize-in-place for user deletion within a tenant.
- Retention jobs run nightly per-schema per-entity.

See `specs/DATA_ARCHITECTURE.md` sections 1, 10, and 11 for the operational details.
