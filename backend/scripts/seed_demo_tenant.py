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
# Fixtures path differs between local venv runs (REPO_ROOT/backend/fixtures)
# and docker dev runs (/app/fixtures, because the backend/ folder is the
# container WORKDIR). GAMMA_FIXTURES_DIR overrides both; otherwise try the
# repo path first and fall back to the backend-root path.
_env_fixtures = os.environ.get("GAMMA_FIXTURES_DIR")
if _env_fixtures:
    FIXTURES = Path(_env_fixtures)
elif (REPO_ROOT / "backend" / "fixtures" / "demo").exists():
    FIXTURES = REPO_ROOT / "backend" / "fixtures" / "demo"
else:
    FIXTURES = REPO_ROOT / "fixtures" / "demo"
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


async def seed_teams(
    conn, tenant_id: int, rows: list[dict[str, str]], employee_map: dict[int, int]
) -> dict[int, int]:
    """Insert teams. Returns {csv_team_id: db_id}.

    Two-pass to avoid FK issues: first INSERT without lead, then UPDATE
    lead_employee_id so a CSV-id order that prepends teams before leads
    still lands.
    """
    mapping: dict[int, int] = {}
    for row in rows:
        csv_id = int(row["team_id"])
        db_id = await conn.fetchval(
            """
            INSERT INTO public.teams (tenant_id, name)
            VALUES ($1, $2)
            ON CONFLICT (tenant_id, name) DO NOTHING
            RETURNING id
            """,
            tenant_id,
            row["name"],
        )
        if db_id is None:
            db_id = await conn.fetchval(
                "SELECT id FROM public.teams WHERE tenant_id=$1 AND name=$2",
                tenant_id,
                row["name"],
            )
        mapping[csv_id] = db_id

    # Backfill lead_employee_id now that both teams and employees exist.
    for row in rows:
        csv_lead = _parse_int(row.get("lead_employee_id"))
        if not csv_lead:
            continue
        db_lead = employee_map.get(csv_lead)
        if db_lead is None:
            continue
        await conn.execute(
            """
            UPDATE public.teams
               SET lead_employee_id = $1
             WHERE id = $2 AND lead_employee_id IS DISTINCT FROM $1
            """,
            db_lead,
            mapping[int(row["team_id"])],
        )

    return mapping


async def backfill_employee_team_ids(
    conn,
    tenant_id: int,
    employee_rows: list[dict[str, str]],
    employee_map: dict[int, int],
    team_map: dict[int, int],
    team_name_map: dict[str, int],
) -> int:
    """Populate employees.team_id by looking up team name -> db team id."""
    updated = 0
    for row in employee_rows:
        csv_emp = int(row["employee_id"])
        team_name = row.get("team")
        if not team_name:
            continue
        db_team = team_name_map.get(team_name)
        db_emp = employee_map.get(csv_emp)
        if db_team is None or db_emp is None:
            continue
        await conn.execute(
            """
            UPDATE public.employees
               SET team_id = $1
             WHERE id = $2 AND team_id IS DISTINCT FROM $1
            """,
            db_team,
            db_emp,
        )
        updated += 1
    return updated


async def seed_projects(
    conn,
    tenant_id: int,
    rows: list[dict[str, str]],
    client_map: dict[int, int],
    employee_map: dict[int, int],
    team_map: dict[int, int],
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
        csv_team = _parse_int(row.get("team_id"))
        db_team = team_map.get(csv_team or 0) if csv_team else None

        db_id = await conn.fetchval(
            """
            INSERT INTO public.projects (
                tenant_id, client_id, name, status,
                budget_minor_units, currency,
                start_date, end_date, owner_employee_id, team_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
            db_team,
        )
        if db_id is None:
            db_id = await conn.fetchval(
                "SELECT id FROM public.projects WHERE tenant_id=$1 AND name=$2",
                tenant_id, row["name"],
            )
            # Existing row: backfill team_id if it is null.
            if db_id is not None and db_team is not None:
                await conn.execute(
                    """
                    UPDATE public.projects
                       SET team_id = $1
                     WHERE id = $2 AND team_id IS NULL
                    """,
                    db_team,
                    db_id,
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
# Expenses (Phase 5a, stage 3)
# ---------------------------------------------------------------------------

# Canonical volume per DATA_ARCHITECTURE.md section 12.10:
#   - 2,412 food/lunch  (201 employees * 12 months)
#   - 2,412 transport   (201 employees * 12 months)
#   - 2,412 overhead    (201 employees * 12 months)
#   - 690 client travel       (46 senior/manager * ~15/year)
#   - 368 client meals        (46 senior/manager * 8/year)
#   - 138 client gifts/misc   (46 senior/manager * 3/year)
# Total: 8,432 -> trimmed to 8,400 with a deterministic drop of
# 32 rows from the gifts bucket (138 -> 106). The published figure
# 8,400 is the contract; 8,432 was section 12.10's raw arithmetic.
EXPENSE_CATEGORY_CATALOGUE: tuple[dict[str, object], ...] = (
    {"code": "FOOD", "name": "Food & Lunch Allowance", "tax_rate": 0.1},
    {"code": "TRANSPORT", "name": "Transport (50%)", "tax_rate": 0.2},
    {"code": "OVERHEAD", "name": "Operator Overhead Share", "tax_rate": 0.2},
    {"code": "CLIENT_TRAVEL", "name": "Client Travel", "tax_rate": 0.2},
    {"code": "CLIENT_MEALS", "name": "Client Meals & Entertainment", "tax_rate": 0.1},
    {"code": "CLIENT_GIFTS", "name": "Client Gifts & Misc", "tax_rate": 0.2},
)

EXPENSE_YEAR = 2026
EXPENSE_MONTHLY_PER_EMPLOYEE = 12  # 12 months per year
EXPENSE_SENIOR_TRAVEL_PER_YEAR = 15
EXPENSE_SENIOR_MEALS_PER_YEAR = 8
EXPENSE_SENIOR_GIFTS_PER_YEAR = 3
EXPENSE_TOTAL = 8_400

# Status mix per section 12.10: 60% approved, 25% pending (=submitted),
# 10% reimbursed (=approved + reimbursement_status=paid), 5% rejected.
EXPENSE_STATUS_MIX: tuple[tuple[str, str, float], ...] = (
    ("approved", "pending", 0.60),
    ("submitted", "pending", 0.25),
    ("approved", "paid", 0.10),
    ("rejected", "pending", 0.05),
)


def generate_expense_rows(
    all_employee_ids: list[int],
    senior_employee_ids: list[int],
    category_codes: list[str],
    *,
    year: int = EXPENSE_YEAR,
    seed: int = 31,
) -> list[dict[str, object]]:
    """Pure deterministic generator for the 8,400 demo expenses.

    Returns a list of row-shaped dicts with no DB dependency. Counts
    are pinned by test_seed_counts.py.
    """
    if not all_employee_ids:
        raise ValueError("all_employee_ids must not be empty")
    if not senior_employee_ids:
        raise ValueError("senior_employee_ids must not be empty")
    required_codes = {
        "FOOD",
        "TRANSPORT",
        "OVERHEAD",
        "CLIENT_TRAVEL",
        "CLIENT_MEALS",
        "CLIENT_GIFTS",
    }
    if not required_codes.issubset(category_codes):
        raise ValueError(
            f"category_codes missing required entries: "
            f"{required_codes - set(category_codes)}"
        )

    rng = random.Random(seed)
    rows: list[dict[str, object]] = []

    # ---- Monthly buckets (FOOD / TRANSPORT / OVERHEAD) --------------------
    monthly_codes = ("FOOD", "TRANSPORT", "OVERHEAD")
    monthly_amounts = {"FOOD": 15_00, "TRANSPORT": 45_00, "OVERHEAD": 80_00}
    for code in monthly_codes:
        for emp_id in sorted(all_employee_ids):
            for month in range(1, EXPENSE_MONTHLY_PER_EMPLOYEE + 1):
                day = min(28, 1 + rng.randint(0, 27))
                rows.append(
                    {
                        "employee_id": emp_id,
                        "category_code": code,
                        "expense_date": date(year, month, day),
                        "amount_cents": monthly_amounts[code],
                        "merchant": f"{code.lower()}-vendor",
                    }
                )

    # ---- Senior buckets (CLIENT_*) ---------------------------------------
    for emp_id in sorted(senior_employee_ids):
        for _ in range(EXPENSE_SENIOR_TRAVEL_PER_YEAR):
            rows.append(_senior_row(emp_id, "CLIENT_TRAVEL", 180_00, year, rng))
        for _ in range(EXPENSE_SENIOR_MEALS_PER_YEAR):
            rows.append(_senior_row(emp_id, "CLIENT_MEALS", 75_00, year, rng))
        for _ in range(EXPENSE_SENIOR_GIFTS_PER_YEAR):
            rows.append(_senior_row(emp_id, "CLIENT_GIFTS", 40_00, year, rng))

    # ---- Trim to the canonical 8,400 -------------------------------------
    # Drop the tail of CLIENT_GIFTS rows deterministically; they are the
    # smallest bucket and the published figure rounds the published 8,400.
    if len(rows) > EXPENSE_TOTAL:
        overflow = len(rows) - EXPENSE_TOTAL
        # Find indices of CLIENT_GIFTS rows from the end and drop them.
        drop_indices: list[int] = []
        for idx in range(len(rows) - 1, -1, -1):
            if rows[idx]["category_code"] == "CLIENT_GIFTS":
                drop_indices.append(idx)
                if len(drop_indices) == overflow:
                    break
        for idx in sorted(drop_indices, reverse=True):
            rows.pop(idx)

    # ---- Status + reimbursement assignment -------------------------------
    cum_mix: list[tuple[str, str, float]] = []
    running = 0.0
    for status, reimb, weight in EXPENSE_STATUS_MIX:
        running += weight
        cum_mix.append((status, reimb, running))

    for row in rows:
        roll = rng.random()
        chosen_status = cum_mix[-1][0]
        chosen_reimb = cum_mix[-1][1]
        for status, reimb, cutoff in cum_mix:
            if roll <= cutoff:
                chosen_status = status
                chosen_reimb = reimb
                break
        row["status"] = chosen_status
        row["reimbursement_status"] = chosen_reimb

    return rows


def _senior_row(
    emp_id: int,
    code: str,
    amount_cents: int,
    year: int,
    rng: random.Random,
) -> dict[str, object]:
    month = rng.randint(1, 12)
    day = min(28, 1 + rng.randint(0, 27))
    return {
        "employee_id": emp_id,
        "category_code": code,
        "expense_date": date(year, month, day),
        "amount_cents": amount_cents,
        "merchant": f"{code.lower()}-vendor",
    }


async def seed_expense_categories(conn, tenant_id: int) -> dict[str, int]:
    """Insert canonical expense categories. Returns {code: db_id}."""
    mapping: dict[str, int] = {}
    for spec in EXPENSE_CATEGORY_CATALOGUE:
        db_id = await conn.fetchval(
            """
            INSERT INTO public.expense_categories (
                tenant_id, name, code, tax_rate
            ) VALUES ($1, $2, $3, $4)
            ON CONFLICT (tenant_id, code) DO NOTHING
            RETURNING id
            """,
            tenant_id,
            spec["name"],
            spec["code"],
            spec["tax_rate"],
        )
        if db_id is None:
            db_id = await conn.fetchval(
                "SELECT id FROM public.expense_categories WHERE tenant_id=$1 AND code=$2",
                tenant_id,
                spec["code"],
            )
        mapping[str(spec["code"])] = db_id
    return mapping


async def seed_expenses(
    conn,
    tenant_id: int,
    employee_map: dict[int, int],
    category_map: dict[str, int],
    *,
    senior_csv_ids: list[int],
) -> int:
    """Insert the 8,400 deterministic demo expenses. Returns row count."""
    if not employee_map or not category_map:
        return 0

    all_db_ids = sorted(employee_map.values())
    senior_db_ids = sorted(employee_map[c] for c in senior_csv_ids if c in employee_map)
    rows = generate_expense_rows(
        all_employee_ids=all_db_ids,
        senior_employee_ids=senior_db_ids,
        category_codes=sorted(category_map.keys()),
    )

    inserted = 0
    for row in rows:
        cat_id = category_map[str(row["category_code"])]
        await conn.execute(
            """
            INSERT INTO public.expenses (
                tenant_id, employee_id, category_id,
                expense_date, merchant, amount_cents, currency,
                status, reimbursement_status, version
            ) VALUES ($1, $2, $3, $4, $5, $6, 'EUR', $7, $8, 0)
            """,
            tenant_id,
            row["employee_id"],
            cat_id,
            row["expense_date"],
            row["merchant"],
            row["amount_cents"],
            row["status"],
            row["reimbursement_status"],
        )
        inserted += 1
    return inserted


# ---------------------------------------------------------------------------
# Invoices (Phase 5a, stage 4)
# ---------------------------------------------------------------------------

# Canonical volume per DATA_ARCHITECTURE.md section 12.10:
#   - 900 invoices/year = 75/month * 12 months
#   - Status mix: 50 draft + 200 sent + 600 paid + 50 overdue = 900
#   - Each invoice has ~10 line items (pinned as exactly 10 for
#     determinism; real generation will vary once the invoice
#     algorithm in section 4.4.1 ships).
INVOICE_YEAR = 2026
INVOICES_PER_MONTH = 75
INVOICES_PER_YEAR = INVOICES_PER_MONTH * 12  # 900
INVOICE_LINES_PER_INVOICE = 10
INVOICE_TOTAL = INVOICES_PER_YEAR
INVOICE_LINES_TOTAL = INVOICE_TOTAL * INVOICE_LINES_PER_INVOICE  # 9,000

INVOICE_STATUS_MIX: tuple[tuple[str, int], ...] = (
    ("draft", 50),
    ("sent", 200),
    ("paid", 600),
    ("overdue", 50),
)


def generate_invoice_rows(
    client_ids: list[int],
    *,
    year: int = INVOICE_YEAR,
    seed: int = 53,
) -> list[dict[str, object]]:
    """Emit exactly 900 invoices spread across the 12 months.

    Pure. Uses (client_id, sequence) tuples to guarantee uniqueness
    without needing the DB sequence table. The status mix is assigned
    by position so the test can pin totals without running the RNG.
    """
    if not client_ids:
        raise ValueError("client_ids must not be empty")

    rng = random.Random(seed)
    clients = sorted(client_ids)
    rows: list[dict[str, object]] = []
    status_plan = [s for s, count in INVOICE_STATUS_MIX for _ in range(count)]
    if len(status_plan) != INVOICE_TOTAL:
        raise AssertionError(
            f"status mix sum ({len(status_plan)}) must equal {INVOICE_TOTAL}"
        )

    sequence = 0
    for month in range(1, 13):
        for _ in range(INVOICES_PER_MONTH):
            sequence += 1
            client_id = rng.choice(clients)
            issue_day = min(28, 1 + rng.randint(0, 27))
            issue = date(year, month, issue_day)
            due = issue + timedelta(days=30)
            status = status_plan[sequence - 1]
            subtotal = 10_000_00 + rng.randint(0, 50_000_00)  # cents
            tax_total = subtotal * 20 // 100  # flat 20% to keep totals CHECK-clean
            rows.append(
                {
                    "client_id": client_id,
                    "number": f"GAMMA-{year}-{sequence:04d}",
                    "issue_date": issue,
                    "due_date": due,
                    "status": status,
                    "currency": "EUR",
                    "subtotal_cents": subtotal,
                    "tax_total_cents": tax_total,
                    "total_cents": subtotal + tax_total,
                    "sequence": sequence,
                }
            )
    return rows


def generate_invoice_line_rows(
    invoice_rows: list[dict[str, object]],
    project_ids: list[int],
    *,
    seed: int = 59,
) -> list[dict[str, object]]:
    """Emit exactly 10 lines per invoice against a rotating project set."""
    if not invoice_rows:
        raise ValueError("invoice_rows must not be empty")
    if not project_ids:
        raise ValueError("project_ids must not be empty")

    rng = random.Random(seed)
    projs = sorted(project_ids)
    lines: list[dict[str, object]] = []

    for inv in invoice_rows:
        # Split the subtotal across 10 lines deterministically (integer cents).
        total_cents = int(inv["subtotal_cents"])  # type: ignore[arg-type]
        per_line = total_cents // INVOICE_LINES_PER_INVOICE
        remainder = total_cents - per_line * INVOICE_LINES_PER_INVOICE
        picked = [projs[i % len(projs)] for i in range(INVOICE_LINES_PER_INVOICE)]
        rng.shuffle(picked)
        for idx in range(INVOICE_LINES_PER_INVOICE):
            amount = per_line + (remainder if idx == 0 else 0)
            lines.append(
                {
                    "invoice_sequence": int(inv["sequence"]),  # type: ignore[arg-type]
                    "description": f"Consulting services - line {idx + 1}",
                    "quantity": "1.0000",
                    "unit": "day",
                    "unit_price_cents": amount,
                    "amount_cents": amount,
                    "tax_rate": "0.2000",
                    "tax_amount_cents": amount * 20 // 100,
                    "project_id": picked[idx],
                }
            )
    return lines


async def seed_invoices(
    conn,
    tenant_id: int,
    client_map: dict[int, int],
    project_map: dict[int, int],
    *,
    year: int = INVOICE_YEAR,
) -> tuple[int, int]:
    """Insert 900 invoices + 9,000 lines. Returns (invoices, lines)."""
    if not client_map or not project_map:
        return (0, 0)

    invoices = generate_invoice_rows(
        client_ids=sorted(client_map.values()), year=year
    )
    lines = generate_invoice_line_rows(
        invoice_rows=invoices, project_ids=sorted(project_map.values())
    )

    # Bootstrap the sequence counter so the real invoice-generation flow
    # picks up from 901 the first time it runs against this tenant.
    await conn.execute(
        """
        INSERT INTO public.invoice_sequences (tenant_id, year, next_value)
        VALUES ($1, $2, $3)
        ON CONFLICT (tenant_id, year)
          DO UPDATE SET next_value = EXCLUDED.next_value
        """,
        tenant_id,
        year,
        INVOICES_PER_YEAR + 1,
    )

    inv_db_ids: dict[int, int] = {}
    inv_inserted = 0
    for inv in invoices:
        db_id = await conn.fetchval(
            """
            INSERT INTO public.invoices (
                tenant_id, client_id, number, issue_date, due_date,
                status, currency, subtotal_cents, tax_total_cents,
                total_cents, pdf_status, version
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', 0)
            ON CONFLICT (tenant_id, number) DO NOTHING
            RETURNING id
            """,
            tenant_id,
            inv["client_id"],
            inv["number"],
            inv["issue_date"],
            inv["due_date"],
            inv["status"],
            inv["currency"],
            inv["subtotal_cents"],
            inv["tax_total_cents"],
            inv["total_cents"],
        )
        if db_id is None:
            db_id = await conn.fetchval(
                "SELECT id FROM public.invoices WHERE tenant_id=$1 AND number=$2",
                tenant_id,
                inv["number"],
            )
        inv_db_ids[int(inv["sequence"])] = db_id  # type: ignore[arg-type]
        inv_inserted += 1

    line_inserted = 0
    for line in lines:
        invoice_db_id = inv_db_ids.get(int(line["invoice_sequence"]))  # type: ignore[arg-type]
        if invoice_db_id is None:
            continue
        await conn.execute(
            """
            INSERT INTO public.invoice_lines (
                tenant_id, invoice_id, description, quantity, unit,
                unit_price_cents, amount_cents, tax_rate, tax_amount_cents,
                project_id, version
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0)
            """,
            tenant_id,
            invoice_db_id,
            line["description"],
            line["quantity"],
            line["unit"],
            line["unit_price_cents"],
            line["amount_cents"],
            line["tax_rate"],
            line["tax_amount_cents"],
            line["project_id"],
        )
        line_inserted += 1

    return (inv_inserted, line_inserted)


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

        print("[seed] Seeding teams...")
        team_rows = _read_csv("teams.csv")
        team_map = await seed_teams(conn, tenant_id, team_rows, emp_map)
        team_name_map = {
            row["name"]: team_map[int(row["team_id"])]
            for row in team_rows
            if int(row["team_id"]) in team_map
        }
        print(f"[seed]   {len(team_map)} teams ready")

        print("[seed] Backfilling employee team_id...")
        updated = await backfill_employee_team_ids(
            conn, tenant_id, emp_rows, emp_map, team_map, team_name_map
        )
        print(f"[seed]   {updated} employees linked to teams")

        print("[seed] Seeding projects...")
        proj_rows = _read_csv("projects.csv")
        proj_map = await seed_projects(
            conn, tenant_id, proj_rows, cli_map, emp_map, team_map
        )
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
        # Billable roles are the consultant + PM tracks. "employee" is the
        # legacy label from an earlier seed generator; the current generator
        # emits specific role codes, so we match against that set.
        _BILLABLE_ROLES = {
            "junior_consultant",
            "mid_consultant",
            "senior_consultant",
            "pm",
            "senior_pm",
            "delivery_director",
            "employee",
        }
        billable_csv_ids = [
            int(r["employee_id"])
            for r in emp_rows
            if r.get("role") in _BILLABLE_ROLES
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

        # Expenses: monthly per-employee buckets + senior-only client buckets.
        senior_csv_ids = [
            int(r["employee_id"])
            for r in emp_rows
            if r.get("role") in ("manager", "admin", "owner")
        ]

        print("[seed] Seeding expense categories...")
        cat_map = await seed_expense_categories(conn, tenant_id)
        print(f"[seed]   {len(cat_map)} expense categories ready")

        print("[seed] Seeding expenses (8,400 deterministic rows)...")
        exp_count = await seed_expenses(
            conn,
            tenant_id,
            emp_map,
            cat_map,
            senior_csv_ids=senior_csv_ids,
        )
        print(f"[seed]   {exp_count} expenses inserted")

        print("[seed] Seeding invoices (900) + lines (9,000)...")
        inv_count, line_count = await seed_invoices(
            conn, tenant_id, cli_map, proj_map
        )
        print(
            f"[seed]   {inv_count} invoices + {line_count} lines inserted"
        )

    finally:
        await conn.close()

    print("[seed] Done.")
    print(
        "[seed] All §8.4 seed stages complete. 201 employees + 120 clients + "
        "260 projects + 700 leaves + 10,400 ts weeks + 39,000 ts entries + "
        "8,400 expenses + 900 invoices (+ 9,000 lines)."
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
