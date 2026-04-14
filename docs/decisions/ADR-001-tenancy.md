# ADR-001: Multi-tenancy

**Status:** Accepted

## Decision

Schema-per-tenant in PostgreSQL 16.

- Shared `public` schema: `tenants`, `users`, `sessions`, `invitations`, `webauthn_credentials`, `mfa_totp`, `audit_log`, billing tables.
- Per-tenant schema (`tenant_<slug>`): all business entities.
- FastAPI middleware extracts `tenant_id` from JWT, runs `SET search_path = tenant_<slug>, public` per request.
- Alembic custom runner iterates tenant schemas for migrations.

## Rationale

- Strong isolation on a single cluster. A missed `WHERE` does not leak cross-tenant; only a missed `search_path` would, which is easier to audit.
- `CREATE SCHEMA` is seconds. `DROP SCHEMA` is one command (GDPR).
- Per-tenant backup via `pg_dump -n`.
- Clear path to sharding by region later.

## Rejected

- **Row-level tenancy:** one bad `WHERE` leaks everything.
- **Database-per-tenant:** breaks connection pooling at 100+ tenants.

## Consequences

- Migration pipeline more complex (loop over schemas).
- Catalog bloat to monitor as tenant count grows.
- At ~10k tenants, reconsider cluster sharding.

## Follow-ups

- Cross-tenant query test in CI.
- Recovery runbook.
