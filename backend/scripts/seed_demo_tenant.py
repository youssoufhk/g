"""Seed the demo tenant with canonical fixture data (Z.3).

Reads ``backend/fixtures/demo/{employees,clients,projects}.csv`` and
inserts the rows under the ``t_dev`` tenant (or any tenant schema passed
via ``--tenant``). All inserts are ``ON CONFLICT DO NOTHING`` so the
script is safe to re-run.

Phase 5a will extend this script with timesheet_weeks, leave_requests,
expenses, and invoices once those tables exist.

Usage (from repo root with a running Postgres):
    python -m scripts.seed_demo_tenant
    python -m scripts.seed_demo_tenant --tenant t_acme

Makefile target: ``make seed-demo-tenant``

Environment:
    DATABASE_URL  postgresql+asyncpg://... (defaults to local dev URL)
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import os
import random
import sys
from datetime import date
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
FIXTURES = REPO_ROOT / "backend" / "fixtures" / "demo"
DEFAULT_DATABASE_URL = (
    "postgresql+asyncpg://gamma:gamma_dev_password@localhost:5432/gamma_dev"
)


# ---------------------------------------------------------------------------
# CSV helpers
# ---------------------------------------------------------------------------

def _read_csv(name: str) -> list[dict[str, str]]:
    path = FIXTURES / name
    if not path.exists():
        print(f"[seed] ERROR: fixture not found: {path}", file=sys.stderr)
        print(
            "[seed] Run `make dev-seed-demo` first to generate CSV fixtures.",
            file=sys.stderr,
        )
        sys.exit(1)
    with path.open(encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


# ---------------------------------------------------------------------------
# DB helpers
# ---------------------------------------------------------------------------

async def _get_tenant_id(conn, tenant_schema: str) -> int:
    row = await conn.fetchrow(
        "SELECT id FROM public.tenants WHERE schema_name = $1", tenant_schema
    )
    if row is None:
        raise SystemExit(
            f"[seed] Tenant '{tenant_schema}' not found in public.tenants. "
            "Run `make mvp-up` first, or create the tenant via the admin API."
        )
    return row["id"]


# ---------------------------------------------------------------------------
# Seeding functions
# ---------------------------------------------------------------------------

async def seed_employees(
    conn, tenant_id: int, rows: list[dict[str, str]]
) -> dict[int, int]:
    """Insert employees. Returns {csv_employee_id: db_id}."""
    mapping: dict[int, int] = {}

    # Two-pass: first insert without manager_employee_id (avoid FK cycle),
    # then update with manager references.
    for row in rows:
        csv_id = int(row["employee_id"])
        hire_date = _parse_date(row.get("hire_date"))
        db_id = await conn.fetchval(
            """
            INSERT INTO public.employees (
                tenant_id, first_name, last_name, email, role, team,
                hire_date, base_currency, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (tenant_id, email) DO NOTHING
            RETURNING id
            """,
            tenant_id,
            row["first_name"],
            row["last_name"],
            row["email"],
            row["role"],
            row.get("team") or None,
            hire_date,
            row.get("base_currency") or "EUR",
            "active",
        )
        if db_id is None:
            # Conflict: look up existing row.
            db_id = await conn.fetchval(
                "SELECT id FROM public.employees WHERE tenant_id=$1 AND email=$2",
                tenant_id, row["email"],
            )
        mapping[csv_id] = db_id

    # Apply manager references.
    for row in rows:
        mgr_csv = _parse_int(row.get("manager_id"))
        if mgr_csv is None:
            continue
        mgr_db = mapping.get(mgr_csv)
        if mgr_db is None:
            continue
        await conn.execute(
            """
            UPDATE public.employees
               SET manager_employee_id = $1
             WHERE id = $2 AND manager_employee_id IS DISTINCT FROM $1
            """,
            mgr_db,
            mapping[int(row["employee_id"])],
        )

    return mapping


async def seed_clients(
    conn, tenant_id: int, rows: list[dict[str, str]]
) -> dict[int, int]:
    """Insert clients. Returns {csv_client_id: db_id}."""
    mapping: dict[int, int] = {}
    for row in rows:
        csv_id = int(row["client_id"])
        db_id = await conn.fetchval(
            """
            INSERT INTO public.clients (
                tenant_id, name, country_code, currency,
                primary_contact_name, primary_contact_email, size_band, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
            ON CONFLICT DO NOTHING
            RETURNING id
            """,
            tenant_id,
            row["name"],
            (row.get("country_code") or "FR").upper()[:2],
            (row.get("currency") or "EUR").upper()[:3],
            row.get("primary_contact_name") or None,
            row.get("primary_contact_email") or None,
            row.get("size_band") or "mid",
        )
        if db_id is None:
            db_id = await conn.fetchval(
                "SELECT id FROM public.clients WHERE tenant_id=$1 AND name=$2",
                tenant_id, row["name"],
            )
        mapping[csv_id] = db_id
    return mapping


async def seed_projects(
    conn,
    tenant_id: int,
    rows: list[dict[str, str]],
    client_map: dict[int, int],
    employee_map: dict[int, int],
) -> dict[int, int]:
    """Insert projects. Returns {csv_project_id: db_id}."""
    mapping: dict[int, int] = {}
    for row in rows:
        csv_id = int(row["project_id"])
        csv_client = _parse_int(row.get("client_id"))
        db_client = client_map.get(csv_client or 0)
        if db_client is None:
            continue

        csv_owner = _parse_int(row.get("owner_employee_id"))
        db_owner = employee_map.get(csv_owner or 0) if csv_owner else None

        db_id = await conn.fetchval(
            """
            INSERT INTO public.projects (
                tenant_id, client_id, name, status,
                budget_minor_units, currency,
                start_date, end_date, owner_employee_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT DO NOTHING
            RETURNING id
            """,
            tenant_id,
            db_client,
            row["name"],
            row.get("status") or "active",
            _parse_int(row.get("budget_minor_units")),
            (row.get("currency") or "EUR").upper()[:3],
            _parse_date(row.get("start_date")),
            _parse_date(row.get("end_date")),
            db_owner,
        )
        if db_id is None:
            db_id = await conn.fetchval(
                "SELECT id FROM public.projects WHERE tenant_id=$1 AND name=$2",
                tenant_id, row["name"],
            )
        mapping[csv_id] = db_id
    return mapping


async def seed_team_allocations(
    conn,
    tenant_id: int,
    employee_rows: list[dict[str, str]],
    project_rows: list[dict[str, str]],
    employee_map: dict[int, int],
    project_map: dict[int, int],
) -> int:
    """Generate plausible team allocations: each active project gets 3-8 members.

    Deterministic: seeded RNG so the same allocations appear every run.
    """
    rng = random.Random(42)
    inserted = 0

    active_emp_csv_ids = [
        int(r["employee_id"])
        for r in employee_rows
        if r.get("role") not in ("owner", "admin")
    ]
    active_project_csv_ids = [
        int(r["project_id"])
        for r in project_rows
        if r.get("status") == "active"
    ]

    today = date.today()
    start_of_year = date(today.year, 1, 1)

    for proj_csv_id in active_project_csv_ids:
        proj_db_id = project_map.get(proj_csv_id)
        if proj_db_id is None:
            continue
        team_size = rng.randint(3, 8)
        members = rng.sample(active_emp_csv_ids, min(team_size, len(active_emp_csv_ids)))
        for emp_csv_id in members:
            emp_db_id = employee_map.get(emp_csv_id)
            if emp_db_id is None:
                continue
            alloc_pct = rng.choice([25, 50, 75, 100])
            await conn.execute(
                """
                INSERT INTO public.team_allocations (
                    tenant_id, project_id, employee_id,
                    allocation_pct, start_date
                ) VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT DO NOTHING
                """,
                tenant_id, proj_db_id, emp_db_id, alloc_pct, start_of_year,
            )
            inserted += 1

    return inserted


# ---------------------------------------------------------------------------
# Parse helpers
# ---------------------------------------------------------------------------

def _parse_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def _parse_int(value: str | None) -> int | None:
    if not value:
        return None
    try:
        return int(value)
    except (ValueError, TypeError):
        return None


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

async def main(tenant_schema: str) -> None:
    try:
        import asyncpg  # type: ignore[import-untyped]
    except ImportError:
        sys.exit("[seed] asyncpg not installed. Run `pip install asyncpg`.")

    raw_url = os.environ.get("DATABASE_URL", DEFAULT_DATABASE_URL)
    # asyncpg expects postgresql:// not postgresql+asyncpg://
    dsn = raw_url.replace("postgresql+asyncpg://", "postgresql://").replace(
        "postgresql+psycopg2://", "postgresql://"
    )

    print(f"[seed] Connecting to {dsn!r}...")
    conn = await asyncpg.connect(dsn)

    try:
        tenant_id = await _get_tenant_id(conn, tenant_schema)
        print(f"[seed] Tenant '{tenant_schema}' id={tenant_id}")

        print("[seed] Seeding employees...")
        emp_rows = _read_csv("employees.csv")
        emp_map = await seed_employees(conn, tenant_id, emp_rows)
        print(f"[seed]   {len(emp_map)} employees ready")

        print("[seed] Seeding clients...")
        cli_rows = _read_csv("clients.csv")
        cli_map = await seed_clients(conn, tenant_id, cli_rows)
        print(f"[seed]   {len(cli_map)} clients ready")

        print("[seed] Seeding projects...")
        proj_rows = _read_csv("projects.csv")
        proj_map = await seed_projects(conn, tenant_id, proj_rows, cli_map, emp_map)
        print(f"[seed]   {len(proj_map)} projects ready")

        print("[seed] Seeding team allocations...")
        alloc_count = await seed_team_allocations(
            conn, tenant_id, emp_rows, proj_rows, emp_map, proj_map
        )
        print(f"[seed]   {alloc_count} allocations ready")

    finally:
        await conn.close()

    print("[seed] Done.")
    print(
        "[seed] Timesheets, leaves, expenses, invoices seed in Phase 5a once "
        "those tables exist."
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed demo tenant fixture data")
    parser.add_argument(
        "--tenant",
        default="t_dev",
        help="Target tenant schema (default: t_dev)",
    )
    args = parser.parse_args()
    asyncio.run(main(args.tenant))
