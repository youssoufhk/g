# Migration Patterns

> **Who this is for.** The Phase 3-5 engineer writing Alembic migrations against the schema-per-tenant cluster. The reviewer blocking a PR that will brick 200 tenants on deploy. The founder running the orchestrator at 02:00 UTC when one tenant fails.
> **Scope.** Alembic patterns in a Postgres 16 schema-per-tenant cluster. Concrete recipes per operation type. Orchestrator semantics. Schema fingerprinting. Partial failure recovery. Zero-downtime migration checklist.
> **Not in scope.** Data migrations that are not schema changes (those are Celery tasks with their own runbook). Rollback procedures (see `docs/ROLLBACK_RUNBOOK.md`). DR / PITR (same doc). Onboarding new tenants (that is a provisioning flow, not a migration).
> **Authority.** This doc is the cookbook. If the cookbook conflicts with `specs/DATA_ARCHITECTURE.md` §10 or ADR-001, the spec wins and this doc gets a follow-up to sync.
> **Cross-references.** ADR-001 (schema-per-tenant tenancy), ADR-008 (Cloud Run deployment and rolling deploys), `docs/ROLLBACK_RUNBOOK.md` §2 + §3 + §5, `specs/DATA_ARCHITECTURE.md` §10, `backend/migrations/runner.py` (the code this runbook drives).

---

## 1. The schema-per-tenant model in one paragraph

Gamma runs one PostgreSQL 16 logical database per environment. One `public` schema holds cross-tenant data (identity, billing, audit, operational plumbing). N tenant schemas (`tenant_<slug>`) hold every business entity per customer. Alembic migrations run against each tenant schema via `search_path` rewriting: the runner sets `SET search_path = tenant_<slug>, public` before every Alembic `upgrade` or `downgrade`, then executes the migration. The orchestrator lives at `backend/migrations/runner.py` and uses Celery fan-out to run migrations across all tenant schemas in parallel, tracked in the `public.alembic_runs` table. See `docs/decisions/ADR-001-tenancy.md` for the full architectural rationale.

Every migration has two dimensions that must be clearly annotated:

- **Target schema:** `public` (runs once, cluster-wide) or `tenant` (runs N times, once per tenant).
- **Blast radius:** does it lock a table, write new indexes, rewrite data, or just touch metadata.

Every migration file declares these in a header comment so the reviewer can immediately see the surface area.

---

## 2. Writing a migration (the canonical recipe)

### 2.1 Create the file

```bash
cd backend
alembic revision -m "add country_code to employees"
```

This creates a new file in `backend/migrations/versions/` with a random revision ID prefix. Edit it immediately and fill in:

1. **Header comment.** Target schema, blast radius, reversibility note.
2. **`upgrade()`.** The change itself.
3. **`downgrade()`.** The exact inverse. Every migration must have a working downgrade. CI blocks merge on a `pass` stub.

### 2.2 Header comment template

```python
"""add country_code to employees

Target schema: tenant
Blast radius: instant (nullable column add, no rewrite, no lock)
Reversible: yes (downgrade drops the column; data loss acceptable because
            this migration is paired with a backfill in v0046)
Related backfill: v0046_backfill_country_code.py
Related contract: v0047_set_country_code_not_null.py

Revision ID: v0045
Revises: v0044
Create Date: 2026-06-01 09:00:00+00:00
"""
```

Reviewers reject any migration without this header.

### 2.3 The two functions

```python
from alembic import op
import sqlalchemy as sa


def upgrade() -> None:
    op.add_column(
        "employees",
        sa.Column("country_code", sa.String(length=2), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("employees", "country_code")
```

Rules:

- **Use Alembic ops, not raw SQL.** `op.add_column`, `op.create_index`, `op.alter_column`. Raw SQL is reserved for cases where Alembic has no equivalent (enum value add, concurrent index, certain `ALTER TYPE` operations).
- **Always annotate the target table.** `op.add_column("employees", ...)` is correct. Do not rely on the search_path to infer the schema silently.
- **Idempotency guards where possible.** For cases where a re-run against a partially-migrated tenant is plausible, add `IF NOT EXISTS` / `IF EXISTS` at the SQL level. Alembic does not support this natively, so use `op.execute("ALTER TABLE IF EXISTS ...")` on the raw path.
- **Every migration writes to `public.alembic_runs`.** The runner handles this; the migration file does not.

### 2.4 The test

Every migration PR includes at least one unit test that runs `upgrade -> downgrade -> upgrade` against a disposable test schema. The test lives in `backend/tests/migrations/test_v<NNNN>.py`:

```python
def test_v0045_round_trip(disposable_tenant_schema):
    schema = disposable_tenant_schema
    run_alembic(schema, "upgrade", "v0045")
    assert has_column(schema, "employees", "country_code")
    run_alembic(schema, "downgrade", "v0044")
    assert not has_column(schema, "employees", "country_code")
    run_alembic(schema, "upgrade", "v0045")
    assert has_column(schema, "employees", "country_code")
```

The `disposable_tenant_schema` pytest fixture provisions a throwaway schema on the local test Postgres, runs the migration, and tears it down at end of test. Fixture lives in `backend/tests/conftest.py`.

### 2.5 Data migrations are Celery, not Alembic

Any migration whose `upgrade()` rewrites more than ~1000 rows must not do it inline. Alembic holds a transaction on the target schema, and a large `UPDATE` inside that transaction blocks writes for as long as the update runs. Instead:

1. Alembic migration adds the column nullable (instant, section 3.1).
2. Alembic migration exits.
3. A separate Celery task backfills in chunks of 1000 rows, committing between chunks. Progress stored in `public.alembic_backfills`.
4. A later Alembic migration applies `NOT NULL` once the backfill reports done.

See section 3.7 for the full backfill pattern.

---

## 3. Patterns by operation type

Each subsection gives the pattern, a snippet, and the gotcha. Match the pattern to the recipe; do not improvise.

### 3.1 Adding a column

Target schema: `public` or `tenant`. Blast radius: instant if nullable with no default. Not instant if default is a non-constant expression.

```python
def upgrade() -> None:
    op.add_column(
        "employees",
        sa.Column("country_code", sa.String(length=2), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("employees", "country_code")
```

**Gotcha.** A default value that requires a row rewrite (e.g., `default=func.uuid_generate_v4()`) holds `ACCESS EXCLUSIVE` on the table for the duration of the rewrite. For any table over 10k rows, never ship a default in the same migration as the column add. Instead:

1. Migration 1: add column nullable, no default.
2. Celery backfill: populate the column in chunks.
3. Migration 2: `ALTER COLUMN ... SET DEFAULT ...` (metadata only, instant).
4. Migration 3: `ALTER COLUMN ... SET NOT NULL` (validates existing data, fast if backfill is complete).

### 3.2 Adding an index

Always use `CREATE INDEX CONCURRENTLY`. Never a plain `CREATE INDEX` on a table with >10k rows.

```python
def upgrade() -> None:
    op.create_index(
        "ix_employees_country_code",
        "employees",
        ["country_code"],
        unique=False,
        postgresql_concurrently=True,
        if_not_exists=True,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_employees_country_code",
        table_name="employees",
        postgresql_concurrently=True,
        if_exists=True,
    )
```

**Critical gotcha.** `CREATE INDEX CONCURRENTLY` cannot run inside a transaction block. Alembic runs migrations inside a transaction by default. Add this at the top of the migration file:

```python
def upgrade() -> None:
    # CREATE INDEX CONCURRENTLY cannot run in a transaction; commit here.
    with op.get_context().autocommit_block():
        op.create_index(...)
```

**Second gotcha.** A concurrent index can fail and leave an invalid index behind. The index exists but is unusable. After deploy, verify with:

```sql
SELECT indexrelid::regclass, indisvalid
  FROM pg_index
  WHERE indisvalid = false;
```

If any row is returned, drop the invalid index and re-create it. The runner's post-migration hook does this check automatically and fails the deploy on any invalid index.

### 3.3 Renaming a column

Never in one step in a schema-per-tenant deployment. A rename requires the old name and the new name to coexist for at least one deploy cycle, because old code and new code run concurrently during a Cloud Run rolling deploy.

The three-step pattern:

1. **Migration N:** add the new column, backfill from the old column (if the source is the old column itself, this is a Celery task).
2. **Deploy code** that reads and writes both columns. Writes go to both for the duration of the migration window.
3. **Migration N+1:** drop the old column (at least one deploy cycle later).

For schema-per-tenant, "one deploy cycle" means all tenants have reached N. The runner blocks N+1 until all tenants are on N successfully.

```python
# Migration N
def upgrade() -> None:
    op.add_column("employees", sa.Column("legal_name", sa.String(), nullable=True))
    # Note: backfill happens in a Celery task, not here.
    # See backend/migrations/backfills/v0050_backfill_legal_name.py.
```

```python
# Migration N+1, at least one release later
def upgrade() -> None:
    op.drop_column("employees", "display_name")
```

**Gotcha.** If you rename in one step, rollback is impossible. The old name is gone, the new name has the data, and downgrade would have to invent the reverse. Do not do it.

### 3.4 Adding a foreign key

Adding an FK to an existing table locks the table while Postgres validates every existing row against the new constraint. For a large table, this can take minutes. The safe pattern:

1. **Migration N:** add the FK with `NOT VALID`. This skips validation of existing rows and takes effect immediately. New inserts and updates are validated.
2. **Data fix:** a Celery task or one-off script cleans up any existing rows that would violate the constraint.
3. **Migration N+1:** `VALIDATE CONSTRAINT`. This scans existing rows but does not block writes.

```python
# Migration N
def upgrade() -> None:
    op.execute("""
        ALTER TABLE timesheet_entries
        ADD CONSTRAINT fk_timesheet_entries_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        NOT VALID
    """)


def downgrade() -> None:
    op.execute("""
        ALTER TABLE timesheet_entries
        DROP CONSTRAINT IF EXISTS fk_timesheet_entries_project
    """)
```

```python
# Migration N+1, after data cleanup
def upgrade() -> None:
    op.execute("""
        ALTER TABLE timesheet_entries
        VALIDATE CONSTRAINT fk_timesheet_entries_project
    """)
```

### 3.5 Adding an enum value

PostgreSQL supports `ALTER TYPE ... ADD VALUE` but **only outside a transaction**. Alembic needs explicit autocommit:

```python
def upgrade() -> None:
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE invoice_status ADD VALUE IF NOT EXISTS 'refunded'")


def downgrade() -> None:
    # Postgres does not support removing an enum value without recreating the type.
    # For downgrade safety, the recipe is: create a new type, migrate the column, drop the old type.
    raise NotImplementedError(
        "Removing an enum value requires recreating the type. "
        "Write a dedicated downgrade migration if rollback is planned."
    )
```

**Gotcha 1.** Enum value removal is genuinely destructive and not supported by Postgres. If there is any chance of rollback, do not add the enum value; instead, use a `CHECK` constraint on a text column.

**Gotcha 2.** `ADD VALUE IF NOT EXISTS` is a Postgres 9.6+ feature. Gamma runs Postgres 16, so it is available. Do not omit the `IF NOT EXISTS` because it protects against re-run against a partially-migrated tenant.

### 3.6 Dropping a column

Two-deploy pattern. First the application code stops referencing the column; then in a later migration the column is dropped.

```python
# Release N: deploy code that does not read or write `legacy_field`.
# No migration in this release.

# Release N+1:
def upgrade() -> None:
    op.drop_column("employees", "legacy_field")


def downgrade() -> None:
    op.add_column(
        "employees",
        sa.Column("legacy_field", sa.String(), nullable=True),
    )
    # Note: downgrade adds the column back empty. Original values are lost.
```

**Gotcha.** If you drop and deploy in the same cycle, a rolling deploy has old containers still reading the dropped column. They crash with `column does not exist` errors during the deploy window. Always split.

### 3.7 Data migrations (backfills)

Large data changes never run inside Alembic. They run as resumable Celery tasks tracked in `public.alembic_backfills`.

Pattern:

```python
# backend/migrations/backfills/v0046_backfill_country_code.py
from gamma_ops.celery import app
from backend.app.features.employees.models import Employee

@app.task(bind=True, max_retries=5)
def backfill_country_code(self, tenant_slug: str, chunk_size: int = 1000):
    from backend.migrations.backfills._runner import run_chunked_backfill

    def apply_chunk(session, last_id):
        rows = (
            session.query(Employee)
            .filter(Employee.id > last_id)
            .filter(Employee.country_code.is_(None))
            .order_by(Employee.id)
            .limit(chunk_size)
            .all()
        )
        for r in rows:
            r.country_code = derive_country_from_tenant(tenant_slug)
        session.commit()
        return rows[-1].id if rows else None

    run_chunked_backfill(
        tenant_slug=tenant_slug,
        version="v0046",
        apply_chunk=apply_chunk,
    )
```

The shared `run_chunked_backfill` helper:

- Reads `public.alembic_backfills` to find the checkpoint (`last_id`).
- Calls `apply_chunk` until it returns None (no more rows).
- Commits after every chunk. Never holds a transaction across chunks.
- Updates `last_id` and `done` in `public.alembic_backfills` after every chunk.
- On exception, updates `error` in `alembic_backfills` and retries via Celery's backoff.
- Logs chunk progress to Cloud Logging for observability.

**Gotcha.** The application code must tolerate both null and populated values during the backfill window. The Phase 2 migration that adds the column with nullable=true is correct; the Phase 2 code that reads the column must use `IS NULL` fallbacks, not raise.

---

## 4. The orchestrator

`backend/migrations/runner.py` is the process that runs Alembic against N tenant schemas. Phase 2 deliverable per ADR-001 follow-ups.

### 4.1 What it does

The orchestrator exposes a CLI:

```bash
python -m backend.migrations.runner upgrade --to=head
python -m backend.migrations.runner upgrade --to=head --tenant=tenant_acme
python -m backend.migrations.runner downgrade --tenant=tenant_acme --to=v0044
python -m backend.migrations.runner fingerprint --tenant=tenant_acme --expected=head
python -m backend.migrations.runner reconcile --tenant=tenant_acme --dry-run
```

### 4.2 Parallelism

Default parallelism is **5 concurrent tenants**. This keeps the Cloud SQL connection count manageable and leaves headroom for application traffic during the deploy window. Raise via `--parallel=N` if the Cloud SQL instance has headroom; never lower without good reason because serial migrations extend the deploy window linearly.

Inside Celery, parallelism is achieved by one Celery task per tenant schema, with a concurrency limit on the `migrations` queue.

### 4.3 Failure isolation

When one tenant fails, the orchestrator:

1. Writes `status = 'failed'` to `public.alembic_runs` with the full `error_message`.
2. **Does not abort the other tenants.** The orchestrator continues running all tenants so that the blast radius is clear at the end of the run.
3. At end-of-run, the orchestrator exits with code 1 if any tenant failed.
4. The Cloud Run deploy job reads the exit code and halts the deploy (does not advance traffic to the new revision).

Exception: if **more than 20% of tenants fail** in the first 10 tenants attempted, the orchestrator halts immediately and pages the founder. This catches catastrophic bugs (e.g., a migration that fails universally) from running against all 200 tenants.

### 4.4 Retry logic

Each tenant gets **up to 3 retries** on transient errors (connection reset, statement timeout, lock not available). Permanent errors (constraint violation, syntax error) do not retry. The classification lives in `backend/migrations/runner/error_policy.py` and must be kept in sync with new error classes as they arise.

### 4.5 Quarantine list

If a tenant fails 3 times in a row on the same migration, it is added to the quarantine list: `public.alembic_runs.quarantined = true`. Future runs skip quarantined tenants and print them at the end of each run so the founder can reconcile manually. The quarantine flag is cleared once the tenant passes a fingerprint check.

### 4.6 Progress reporting

The orchestrator writes a progress line to stdout every 10 seconds:

```
[v0045] 142/200 tenants complete, 3 failed, 55 running, average 2.3s per tenant
```

For the operator console, it also publishes progress to a Pub/Sub topic `alembic_runs.progress` consumed by the operator dashboard. Phase 2 deliverable.

---

## 5. Schema fingerprinting and drift detection

Weekly Celery job runs every **Sunday at 02:00 UTC**. Same window as the retention sweep. Computes a hash of each tenant's schema and compares against the canonical fingerprint.

### 5.1 What is fingerprinted

The fingerprint is a deterministic hash of:

- Every table name in the tenant schema.
- Every column (name, type, nullable, default).
- Every index (name, column list, uniqueness, partial predicate).
- Every constraint (primary key, foreign key, check constraint body, unique constraint).
- Every trigger (name, event, function body).

Query path via `pg_catalog`: the helper in `backend/migrations/fingerprint.py` reads `pg_class`, `pg_attribute`, `pg_index`, `pg_constraint`, `pg_trigger` and emits a stable JSON representation. The hash is SHA-256 of the JSON bytes, canonicalized (sorted keys, no trailing whitespace).

### 5.2 Canonical fingerprint

The canonical fingerprint is computed from the `public` schema pattern-tenant (a reference schema provisioned during deploy) after each successful migration. Stored in `backend/migrations/fingerprints/<version>.json` and checked into the repo. Every version has one fingerprint.

### 5.3 Drift detection job

The weekly job reads every tenant's current schema, computes the fingerprint, compares against the expected canonical (from `alembic_runs.version`). Any mismatch triggers an alert to ops@gammahr.com and writes the diff to `gs://gammahr-drift-reports/<date>/report.json`.

### 5.4 On drift

Reconciliation is never automatic in production. The founder reads the drift report, decides whether to reconcile the tenant or update the canonical, and runs the reconciliation command manually. Full procedure in `docs/ROLLBACK_RUNBOOK.md` §5.

### 5.5 Related files

- `backend/migrations/fingerprint.py` - fingerprint computation
- `backend/migrations/fingerprints/v<NNNN>.json` - canonical per version
- `infra/ops/gamma_ops/tenants/drift.py` - drift detection job entry point
- ADR-001 follow-ups - drift detection is a Phase 2 deliverable

---

## 6. Partial failure recovery

The scenario: the orchestrator is running migration v0045 against 200 tenants. Tenants 1 through 4 succeed. Tenant 5 fails with a constraint violation. Tenants 6 through 200 have not yet been attempted.

### 6.1 Step-by-step recovery

1. **Halt the orchestrator.** The orchestrator already stopped or is still running the remaining tenants (section 4.3). Either way, pause new work:
   ```bash
   celery control cancel_consumer migrations
   ```

2. **Inspect tenant 5's state.** Connect via Cloud SQL Auth Proxy and check what v0045 got as far as applying:
   ```sql
   SET search_path = tenant_5_slug, public;
   \d+ employees
   SELECT * FROM public.alembic_runs WHERE tenant_id = 'tenant_5_id' ORDER BY started_at DESC LIMIT 5;
   ```

3. **Decide: downgrade or fix-forward.**

   - **Fix-forward (preferred):** write a one-off fix script that cleans up the data blocking the migration (e.g., backfill NULLs to a default). Commit the script under `backend/migrations/fixes/v0045_tenant_5.sql`. Then re-run the migration for tenant 5 only:
     ```bash
     python -m backend.migrations.runner upgrade --tenant=tenant_5_slug --to=v0045
     ```
   - **Downgrade:** if the migration is genuinely buggy, downgrade tenant 5 manually to the last good version:
     ```bash
     python -m backend.migrations.runner downgrade --tenant=tenant_5_slug --to=v0044
     ```
     The runner writes a new `alembic_runs` row with `status = 'rolled_back'`. Full per-tenant rollback procedure in `docs/ROLLBACK_RUNBOOK.md` §3.

4. **Re-run the orchestrator with tenant 5 skipped** for the remaining 195 tenants:
   ```bash
   python -m backend.migrations.runner upgrade --skip=tenant_5_slug --to=head
   ```
   Tenants 1-4 are no-ops (already at head). Tenants 6-200 proceed.

5. **Manually re-apply on tenant 5 once the fix is verified.** After the fix script has run and the offending data is clean:
   ```bash
   python -m backend.migrations.runner upgrade --tenant=tenant_5_slug --to=head
   ```

6. **Verify the final state.** Every tenant should now be at the target version:
   ```sql
   SELECT tenant_id, version, status
     FROM public.alembic_runs
     WHERE version = 'v0045' AND status = 'succeeded'
     ORDER BY tenant_id;
   ```

7. **Resume Cloud Run deploy.** Advance traffic to the new revision via the CI deploy job's resume hook.

8. **Post-incident write-up** per `docs/ROLLBACK_RUNBOOK.md` §7. Even a one-tenant failure gets a one-page write-up.

### 6.2 Do not

- **Do not `DROP SCHEMA` during an incident.** Even for a drifted test tenant. See `docs/ROLLBACK_RUNBOOK.md` rule 1.5.
- **Do not manually edit `public.alembic_runs`.** Use the runner's `--force-status` flag if you absolutely must, and expect the drift detector to yell at you.
- **Do not skip the fingerprint verification.** After any manual intervention on a tenant, run `fingerprint --expected=head` before marking the recovery complete.

---

## 7. Long-running migrations

Any migration expected to take **more than 30 seconds per tenant** must be broken into smaller steps. The orchestrator's default `statement_timeout` is 60 seconds.

### 7.1 Why

- A 30-second migration per tenant across 200 tenants is 6000 seconds of cumulative DB work (100 minutes). Even with parallelism of 5, that is 20 minutes of wall-clock deploy time, which is outside the acceptable Cloud Run deploy window.
- Long migrations hold locks or generate WAL that spikes the replica lag alarm.
- Long migrations are hard to cancel safely if the orchestrator needs to halt.

### 7.2 When long is unavoidable

If a migration genuinely must take longer than 30 seconds (rare, e.g., an index rebuild on a multi-million-row table), it is allowed but requires:

1. **Explicit statement_timeout override** in the migration file:
   ```python
   def upgrade() -> None:
       op.execute("SET LOCAL statement_timeout = '600s'")
       op.execute("REINDEX TABLE CONCURRENTLY employees")
   ```
2. **Documentation in the header** stating the expected duration and the reason.
3. **Scheduled during the quiet window** (02:00 to 04:00 Europe/Paris). Run via `--window=quiet` flag on the orchestrator.
4. **Founder sign-off** recorded in the PR description.
5. **Celery task split** if possible: most long-running operations fit better as Celery tasks outside Alembic.

### 7.3 The 30-second rule is a soft rule

A migration that takes 35 seconds on a typical tenant is fine. A migration that takes 2 minutes on an outlier tenant (one with 500k rows in one table while others have 50k) is also fine as long as the outlier is known in advance. The rule exists to force awareness. Surprises are what hurt.

---

## 8. Zero-downtime migration checklist

Before merging any migration PR, the reviewer and author both verify every item. CI enforces the mechanical checks; the reviewer enforces the judgment calls.

### 8.1 The checklist

1. **Reversible.** `downgrade()` is implemented and works against a disposable test schema.
2. **Idempotent.** Running `upgrade -> downgrade -> upgrade` against a disposable test schema leaves the schema in the expected final state.
3. **No long-held locks.** The migration does not hold `ACCESS EXCLUSIVE` or `SHARE ROW EXCLUSIVE` for more than 30 seconds per tenant (section 7).
4. **Backwards compatible with the previous code version.** During a rolling deploy, old containers read the new schema. They must not crash. This is enforced by the expand-migrate-contract pattern (add new things first, remove old things later).
5. **Tested against the canonical 201-employee test tenant.** The Phase 2 test harness provisions a tenant schema matching the seed in `specs/DATA_ARCHITECTURE.md` §12.10. Every migration runs against this tenant in CI.
6. **Fingerprint updated.** If the migration changes the schema, the canonical fingerprint file in `backend/migrations/fingerprints/v<NNNN>.json` is regenerated and checked in.
7. **Header comment complete.** Target schema, blast radius, reversibility note, related backfills, related contracts.
8. **No raw SQL where Alembic ops exist.** Exceptions: concurrent index, enum value add, `NOT VALID` FK constraints. Every raw SQL is accompanied by a comment explaining why Alembic ops do not suffice.
9. **Backfill is a Celery task, not inline.** Any migration rewriting more than 1000 rows uses the pattern in section 3.7.
10. **The test file exists.** `backend/tests/migrations/test_v<NNNN>.py` exists and is passing locally.

CI enforces:

- Items 1 via `backend/tests/migrations/test_every_migration_has_downgrade.py`
- Items 2, 5, 10 via the migration round-trip test suite
- Item 6 via a fingerprint-regeneration check
- Item 7 via a regex check for the required header fields

The reviewer enforces: items 3, 4, 8, 9.

### 8.2 When the checklist says no

If any item fails, the PR is blocked until it is fixed. Exceptions require an ADR, not a reviewer override.

---

## 9. Cross-references

- `docs/decisions/ADR-001-tenancy.md` - schema-per-tenant architecture, `alembic_runs` tracking table, drift detection follow-up
- `docs/decisions/ADR-008-deployment.md` - Cloud Run rolling deploy, migration runner integration with the CI deploy job
- `docs/ROLLBACK_RUNBOOK.md` §2 (migration failure modes), §3 (per-tenant rollback), §5 (drift reconciliation), §7 (post-incident template)
- `specs/DATA_ARCHITECTURE.md` §10 (migrations, backfills, operational plumbing) - the canonical summary that this doc expands
- `backend/migrations/runner.py` - the orchestrator code this runbook drives (Phase 2 deliverable)
- `backend/migrations/fingerprint.py` - schema fingerprint computation
- `infra/ops/gamma_ops/tenants/migrate.py` - ops wrapper around the runner (Phase 2 deliverable)
- `infra/ops/gamma_ops/tenants/drift.py` - drift detection Celery job (Phase 2 deliverable)
- `backend/tests/conftest.py` - `disposable_tenant_schema` fixture used by every migration unit test
