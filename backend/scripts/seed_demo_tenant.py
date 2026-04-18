"""Seed the demo tenant with canonical fixture data (Z.3).

Reads ``backend/fixtures/demo/{employees,clients,projects}.csv`` and
inserts the rows under the ``t_dev`` tenant (or any tenant schema passed
via ``--tenant``). All inserts are ``ON CONFLICT DO NOTHING`` so the
script is safe to re-run.

Phase 5a stages this script feature-by-feature: leave_requests land in
stage 1 alongside the 20260418_1000 migration; timesheet_weeks, expenses,
and invoices arrive in later stages as their schemas ship.

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
from datetime import date, timedelta
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
# Leaves (Phase 5a)
# ---------------------------------------------------------------------------

# Canonical leave catalogue per DATA_ARCHITECTURE.md section 2.9 and
# section 12.10. Order is stable so the generator picks reproducibly.
LEAVE_TYPE_CATALOGUE: tuple[dict[str, object], ...] = (
    {
        "code": "VAC",
        "name": "Paid Vacation",
        "accrual_rate": 2.08,
        "max_balance": 60.0,
        "paid": True,
        "color": "#1b8a5a",
        "is_medical": False,
    },
    {
        "code": "SICK",
        "name": "Sick Leave",
        "accrual_rate": 0.0,
        "max_balance": None,
        "paid": True,
        "color": "#c44536",
        "is_medical": True,
    },
    {
        "code": "PERS",
        "name": "Personal",
        "accrual_rate": 0.17,
        "max_balance": 5.0,
        "paid": True,
        "color": "#6a7fdb",
        "is_medical": False,
    },
    {
        "code": "RTT",
        "name": "RTT",
        "accrual_rate": 0.83,
        "max_balance": 15.0,
        "paid": True,
        "color": "#f2a007",
        "is_medical": False,
    },
    {
        "code": "PAR",
        "name": "Parental",
        "accrual_rate": 0.0,
        "max_balance": None,
        "paid": True,
        "color": "#a35cd1",
        "is_medical": False,
    },
)


# Status mix: 450 approved + 150 pending + 100 rejected = 700 (DATA_ARCHITECTURE
# section 12.10). Pending is split into draft + submitted so all 4 statuses
# are hit (founder follow-up 8.4). 30 + 120 = 150 pending preserves the
# published total.
LEAVE_STATUS_MIX: tuple[tuple[str, int], ...] = (
    ("draft", 30),
    ("submitted", 120),
    ("approved", 450),
    ("rejected", 100),
)

LEAVE_TOTAL = sum(count for _, count in LEAVE_STATUS_MIX)  # 700


def generate_leave_rows(
    employee_ids: list[int],
    leave_type_codes: list[str],
    *,
    seed: int = 42,
) -> list[dict[str, object]]:
    """Pure deterministic generator for the 700 demo leave requests.

    Returns a list of row-shaped dicts with no DB dependency so tests can
    pin counts without running Postgres. Dates are spread across 2025-2027
    so reports for any of those years find rows.
    """
    if not employee_ids:
        raise ValueError("generate_leave_rows requires at least one employee")
    if not leave_type_codes:
        raise ValueError("generate_leave_rows requires at least one leave type")

    rng = random.Random(seed)
    rows: list[dict[str, object]] = []

    # Calendar span covers three fiscal years to give the dashboard room.
    year_floor = date(2025, 1, 1)
    year_ceiling = date(2027, 12, 15)
    span_days = (year_ceiling - year_floor).days

    for status, count in LEAVE_STATUS_MIX:
        for _ in range(count):
            emp_id = rng.choice(employee_ids)
            type_code = rng.choice(leave_type_codes)
            duration_days = rng.choice([1, 1, 2, 3, 5, 5, 7, 10])
            start_offset = rng.randint(0, max(0, span_days - duration_days))
            start = year_floor + timedelta(days=start_offset)
            end = start + timedelta(days=duration_days - 1)
            rows.append(
                {
                    "employee_id": emp_id,
                    "leave_type_code": type_code,
                    "start_date": start,
                    "end_date": end,
                    "days": float(duration_days),
                    "status": status,
                }
            )

    return rows


async def seed_leave_types(conn, tenant_id: int) -> dict[str, int]:
    """Insert the canonical leave catalogue. Returns {code: db_id}."""
    mapping: dict[str, int] = {}
    for spec in LEAVE_TYPE_CATALOGUE:
        db_id = await conn.fetchval(
            """
            INSERT INTO public.leave_types (
                tenant_id, name, code, accrual_rate, max_balance,
                paid, color, is_medical
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (tenant_id, code) DO NOTHING
            RETURNING id
            """,
            tenant_id,
            spec["name"],
            spec["code"],
            spec["accrual_rate"],
            spec["max_balance"],
            spec["paid"],
            spec["color"],
            spec["is_medical"],
        )
        if db_id is None:
            db_id = await conn.fetchval(
                "SELECT id FROM public.leave_types WHERE tenant_id=$1 AND code=$2",
                tenant_id,
                spec["code"],
            )
        mapping[str(spec["code"])] = db_id
    return mapping


async def seed_leaves(
    conn,
    tenant_id: int,
    employee_map: dict[int, int],
    type_map: dict[str, int],
) -> int:
    """Insert the 700 deterministic demo leave requests. Returns row count."""
    if not employee_map or not type_map:
        return 0

    rows = generate_leave_rows(
        employee_ids=sorted(employee_map.values()),
        leave_type_codes=sorted(type_map.keys()),
    )

    inserted = 0
    for row in rows:
        type_db_id = type_map[str(row["leave_type_code"])]
        await conn.execute(
            """
            INSERT INTO public.leave_requests (
                tenant_id, employee_id, leave_type_id,
                start_date, end_date, days, status, version
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, 0)
            """,
            tenant_id,
            row["employee_id"],
            type_db_id,
            row["start_date"],
            row["end_date"],
            row["days"],
            row["status"],
        )
        inserted += 1
    return inserted


# ---------------------------------------------------------------------------
# Timesheets (Phase 5a, stage 2)
# ---------------------------------------------------------------------------

# Canonical volume per DATA_ARCHITECTURE.md section 12.10:
#   - 10,400 timesheet_weeks = 52 weeks x 200 active employees
#   - 39,000 timesheet_entries = 150 billable x 5 workdays x 52 weeks
# The 201-seat tenant has 1 owner who does not log hours, leaving 200
# active employees. Of those, 150 are billable consultants
# (25 senior + 80 mid + 60 junior - a handful of readonly/admins).
TIMESHEET_YEAR = 2026
TIMESHEET_WEEKS_PER_EMPLOYEE = 52
TIMESHEET_ENTRIES_PER_BILLABLE_WEEK = 5  # Mon-Fri
TIMESHEET_BILLABLE_EMPLOYEE_COUNT = 150
TIMESHEET_WEEK_STATUS_MIX: tuple[tuple[str, float], ...] = (
    ("approved", 0.75),
    ("submitted", 0.15),
    ("draft", 0.07),
    ("rejected", 0.03),
)


def generate_timesheet_week_rows(
    employee_ids: list[int],
    *,
    year: int = TIMESHEET_YEAR,
    seed: int = 17,
) -> list[dict[str, object]]:
    """Emit one timesheet_week per (employee, iso_week) for the given year.

    Pure. No DB dependency. Deterministic status assignment so repeated
    runs produce the exact same counts. Returns 52 rows per employee.
    """
    if not employee_ids:
        raise ValueError("generate_timesheet_week_rows requires at least one employee")
    if year < 2000 or year > 2100:
        raise ValueError(f"year out of range: {year}")

    rng = random.Random(seed)
    rows: list[dict[str, object]] = []
    for emp_id in sorted(employee_ids):
        for iso_week in range(1, TIMESHEET_WEEKS_PER_EMPLOYEE + 1):
            roll = rng.random()
            cumulative = 0.0
            status = TIMESHEET_WEEK_STATUS_MIX[0][0]
            for candidate, weight in TIMESHEET_WEEK_STATUS_MIX:
                cumulative += weight
                if roll <= cumulative:
                    status = candidate
                    break
            rows.append(
                {
                    "employee_id": emp_id,
                    "iso_year": year,
                    "iso_week": iso_week,
                    "status": status,
                }
            )
    return rows


def generate_timesheet_entry_rows(
    billable_employee_ids: list[int],
    project_ids: list[int],
    *,
    year: int = TIMESHEET_YEAR,
    seed: int = 23,
) -> list[dict[str, object]]:
    """Emit 5 entries per (billable_employee, iso_week) for the given year.

    Pure. Each entry is a full workday (480 minutes = 8 hours). The
    project rotation is deterministic so repeat runs produce identical
    data, and the function raises if the input lists are empty.
    """
    if not billable_employee_ids:
        raise ValueError("billable_employee_ids must not be empty")
    if not project_ids:
        raise ValueError("project_ids must not be empty")

    rng = random.Random(seed)
    emps = sorted(billable_employee_ids)
    projs = sorted(project_ids)
    rows: list[dict[str, object]] = []

    # ISO week 1 Monday for any year: use date.fromisocalendar.
    for emp_id in emps:
        # Each billable employee has 1-3 "home" projects. Deterministic.
        home_projects = rng.sample(projs, k=min(3, len(projs)))
        for iso_week in range(1, TIMESHEET_WEEKS_PER_EMPLOYEE + 1):
            try:
                monday = date.fromisocalendar(year, iso_week, 1)
            except ValueError:
                # Year has no ISO week 53; skip gracefully.
                continue
            for day_offset in range(TIMESHEET_ENTRIES_PER_BILLABLE_WEEK):
                work_date = monday + timedelta(days=day_offset)
                project_id = home_projects[day_offset % len(home_projects)]
                rows.append(
                    {
                        "employee_id": emp_id,
                        "project_id": project_id,
                        "work_date": work_date,
                        "duration_minutes": 480,  # 8h standard workday
                        "billable": True,
                        "iso_year": year,
                        "iso_week": iso_week,
                    }
                )
    return rows


async def seed_timesheet_weeks(
    conn,
    tenant_id: int,
    employee_map: dict[int, int],
    *,
    active_csv_ids: list[int] | None = None,
    year: int = TIMESHEET_YEAR,
) -> dict[tuple[int, int, int], int]:
    """Insert 52 weeks per active employee. Returns {(emp_db_id, year, week): week_db_id}."""
    if active_csv_ids is None:
        employee_ids = sorted(employee_map.values())
    else:
        employee_ids = sorted(
            employee_map[c] for c in active_csv_ids if c in employee_map
        )

    rows = generate_timesheet_week_rows(employee_ids=employee_ids, year=year)
    mapping: dict[tuple[int, int, int], int] = {}
    for row in rows:
        db_id = await conn.fetchval(
            """
            INSERT INTO public.timesheet_weeks (
                tenant_id, employee_id, iso_year, iso_week, status, version
            ) VALUES ($1, $2, $3, $4, $5, 0)
            ON CONFLICT (employee_id, iso_year, iso_week) DO NOTHING
            RETURNING id
            """,
            tenant_id,
            row["employee_id"],
            row["iso_year"],
            row["iso_week"],
            row["status"],
        )
        if db_id is None:
            db_id = await conn.fetchval(
                """
                SELECT id FROM public.timesheet_weeks
                 WHERE employee_id=$1 AND iso_year=$2 AND iso_week=$3
                """,
                row["employee_id"],
                row["iso_year"],
                row["iso_week"],
            )
        mapping[(int(row["employee_id"]), int(row["iso_year"]), int(row["iso_week"]))] = db_id
    return mapping


async def seed_timesheet_entries(
    conn,
    tenant_id: int,
    week_map: dict[tuple[int, int, int], int],
    billable_employee_ids: list[int],
    project_ids: list[int],
    *,
    year: int = TIMESHEET_YEAR,
) -> int:
    """Insert 39,000 deterministic entries. Returns row count."""
    rows = generate_timesheet_entry_rows(
        billable_employee_ids=billable_employee_ids,
        project_ids=project_ids,
        year=year,
    )
    inserted = 0
    for row in rows:
        week_id = week_map.get(
            (int(row["employee_id"]), int(row["iso_year"]), int(row["iso_week"]))
        )
        if week_id is None:
            continue
        await conn.execute(
            """
            INSERT INTO public.timesheet_entries (
                tenant_id, timesheet_week_id, employee_id, project_id,
                work_date, duration_minutes, billable, version
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, 0)
            """,
            tenant_id,
            week_id,
            row["employee_id"],
            row["project_id"],
            row["work_date"],
            row["duration_minutes"],
            row["billable"],
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

        print("[seed] Seeding leave types...")
        type_map = await seed_leave_types(conn, tenant_id)
        print(f"[seed]   {len(type_map)} leave types ready")

        print("[seed] Seeding leave requests (700 deterministic rows)...")
        leave_count = await seed_leaves(conn, tenant_id, emp_map, type_map)
        print(f"[seed]   {leave_count} leave requests inserted")

        # Timesheets: 52 weeks for 200 active employees (skip the owner),
        # plus 5 daily entries for the 150 billable employees.
        active_csv_ids = [
            int(r["employee_id"])
            for r in emp_rows
            if r.get("role") != "owner"
        ]
        billable_csv_ids = [
            int(r["employee_id"])
            for r in emp_rows
            if r.get("role") in ("employee",)
        ][:TIMESHEET_BILLABLE_EMPLOYEE_COUNT]

        billable_db_ids = [emp_map[c] for c in billable_csv_ids if c in emp_map]

        print("[seed] Seeding timesheet weeks (52 weeks x active employees)...")
        week_map = await seed_timesheet_weeks(
            conn, tenant_id, emp_map, active_csv_ids=active_csv_ids
        )
        print(f"[seed]   {len(week_map)} timesheet weeks inserted")

        print("[seed] Seeding timesheet entries (5 per billable week)...")
        entries_count = await seed_timesheet_entries(
            conn,
            tenant_id,
            week_map,
            billable_employee_ids=billable_db_ids,
            project_ids=sorted(proj_map.values()),
        )
        print(f"[seed]   {entries_count} timesheet entries inserted")

    finally:
        await conn.close()

    print("[seed] Done.")
    print(
        "[seed] Expenses + invoices seed in later Phase 5a stages."
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
