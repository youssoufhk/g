"""Deterministic demo seed generator.

Produces the canonical 201-employee fixture CSVs per
``specs/DATA_ARCHITECTURE.md`` section 12.10. Output lands under
``backend/fixtures/demo/`` and is consumed by the Phase 3a onboarding
wizard (CSV import module) or by Phase 5a feature tests.

Deterministic: ``random.seed(42)`` + Faker seeds. Re-running produces
the same CSVs byte-for-byte. Safe to regenerate and commit.

Usage (from repo root):
    python3 -m backend.scripts.generate_demo_seed
    # or inside the backend container:
    make dev-shell-backend
    python -m scripts.generate_demo_seed

What it generates in Phase 2:
    employees.csv   201 users (owner 1, admin 2, finance 4, delivery directors 2,
                    senior PMs 5, PMs 8, HR 3, recruiting 2, senior consultants 25,
                    mid consultants 80, junior consultants 60, ops/support 7,
                    auditor 1, intern 1)
    teams.csv       12 teams (Finance, Tech, Strategy, Digital, ...)
    clients.csv     120 clients (30 large + 50 mid + 40 small) including
                    HSBC UK billed in GBP, all others in EUR
    projects.csv    260 projects (160 active + 70 completed + 30 pipeline)

What it does NOT generate yet (deferred to Phase 5a):
    timesheets.csv  ~39,000 entries across 52 weeks, built per feature test
    leaves.csv      700 leave rows, built per Phase 5a leaves feature
    expenses.csv    ~8,400 expense rows, built per Phase 5a expenses feature
    invoices.csv    900 invoices, built per Phase 5a invoicing feature
"""

from __future__ import annotations

import csv
import random
from dataclasses import asdict, dataclass, field
from datetime import date
from pathlib import Path
from typing import Any

from faker import Faker

OUTPUT_DIR = Path(__file__).resolve().parents[1] / "fixtures" / "demo"

SEED = 42

# Spec section 12.10 role distribution. Order is load-bearing for email
# deterministic assignment so do not reorder lightly.
ROLE_DISTRIBUTION: list[tuple[str, int]] = [
    ("owner", 1),
    ("admin", 2),
    ("finance", 4),
    ("delivery_director", 2),
    ("senior_pm", 5),
    ("pm", 8),
    ("hr", 3),
    ("recruiting", 2),
    ("senior_consultant", 25),
    ("mid_consultant", 80),
    ("junior_consultant", 60),
    ("ops_support", 7),
    ("auditor", 1),
    ("intern", 1),
]
# Total: 1+2+4+2+5+8+3+2+25+80+60+7+1+1 = 201 (matches spec section 12.10)

TEAMS: list[str] = [
    "Finance",
    "Tech",
    "Strategy",
    "Digital",
    "People",
    "Risk",
    "Operations",
    "Legal",
    "Marketing",
    "Public Sector",
    "Healthcare",
    "Manufacturing",
]

# Client distribution: 30 large * 4 + 50 mid * 2 + 40 small * 1 = 260 projects
CLIENT_BANDS: list[tuple[str, int, int]] = [
    ("large", 30, 4),
    ("mid", 50, 2),
    ("small", 40, 1),
]

PROJECT_STATUS_DISTRIBUTION: list[tuple[str, int]] = [
    ("active", 160),
    ("completed", 70),
    ("pipeline", 30),
]


@dataclass
class Employee:
    employee_id: int
    first_name: str
    last_name: str
    email: str
    role: str
    team: str
    hire_date: str
    manager_id: int | None
    base_currency: str


@dataclass
class Team:
    team_id: int
    name: str
    lead_employee_id: int


@dataclass
class Client:
    client_id: int
    name: str
    country_code: str
    currency: str
    primary_contact_name: str
    primary_contact_email: str
    size_band: str


@dataclass
class Project:
    project_id: int
    name: str
    client_id: int
    status: str
    budget_minor_units: int
    currency: str
    start_date: str
    end_date: str | None
    owner_employee_id: int


@dataclass
class SeedContext:
    rng: random.Random
    faker_fr: Faker
    faker_uk: Faker
    teams: list[Team] = field(default_factory=list)
    employees: list[Employee] = field(default_factory=list)
    clients: list[Client] = field(default_factory=list)
    projects: list[Project] = field(default_factory=list)


def build_context() -> SeedContext:
    rng = random.Random(SEED)
    faker_fr = Faker("fr_FR")
    faker_fr.seed_instance(SEED)
    faker_uk = Faker("en_GB")
    faker_uk.seed_instance(SEED + 1)
    return SeedContext(rng=rng, faker_fr=faker_fr, faker_uk=faker_uk)


def gen_teams(ctx: SeedContext) -> list[Team]:
    return [
        Team(team_id=i + 1, name=name, lead_employee_id=0)
        for i, name in enumerate(TEAMS)
    ]


def gen_employees(ctx: SeedContext) -> list[Employee]:
    employees: list[Employee] = []
    employee_id = 1
    seen_emails: set[str] = set()

    manager_roles = {"owner", "admin", "delivery_director", "senior_pm", "pm"}
    managers_so_far: list[int] = []

    for role, count in ROLE_DISTRIBUTION:
        for _ in range(count):
            gender = ctx.rng.choice(["male", "female"])
            if gender == "male":
                first = ctx.faker_fr.first_name_male()
            else:
                first = ctx.faker_fr.first_name_female()
            last = ctx.faker_fr.last_name()
            base_email = _email_slug(first, last)
            email = base_email
            suffix = 2
            while email in seen_emails:
                email = f"{base_email.split('@')[0]}{suffix}@gamma-demo.local"
                suffix += 1
            seen_emails.add(email)

            team = ctx.rng.choice(TEAMS)
            hire_year = ctx.rng.randint(2018, 2025)
            hire_date = ctx.faker_fr.date_between(
                start_date=date(hire_year, 1, 1),
                end_date=date(hire_year, 12, 31),
            )
            manager_id = (
                ctx.rng.choice(managers_so_far) if managers_so_far and role != "owner" else None
            )
            employee = Employee(
                employee_id=employee_id,
                first_name=first,
                last_name=last,
                email=email,
                role=role,
                team=team,
                hire_date=hire_date.isoformat(),
                manager_id=manager_id,
                base_currency="EUR",
            )
            employees.append(employee)
            if role in manager_roles:
                managers_so_far.append(employee_id)
            employee_id += 1

    assert len(employees) == 201, f"expected 201 employees, got {len(employees)}"
    return employees


def _email_slug(first: str, last: str) -> str:
    first_clean = "".join(c for c in first.lower() if c.isalpha() or c == "-")
    last_clean = "".join(c for c in last.lower() if c.isalpha() or c == "-")
    return f"{first_clean}.{last_clean}@gamma-demo.local"


def gen_clients(ctx: SeedContext) -> list[Client]:
    clients: list[Client] = []
    client_id = 1

    # HSBC UK comes first so the project generator can reliably allocate it.
    hsbc = Client(
        client_id=client_id,
        name="HSBC UK",
        country_code="GB",
        currency="GBP",
        primary_contact_name=ctx.faker_uk.name(),
        primary_contact_email="treasury.ops@hsbc-demo.local",
        size_band="large",
    )
    clients.append(hsbc)
    client_id += 1

    for band_name, count, _projects_per in CLIENT_BANDS:
        needed = count if band_name != "large" else count - 1  # HSBC already counted
        for _ in range(needed):
            name = _client_name(ctx, band_name)
            clients.append(
                Client(
                    client_id=client_id,
                    name=name,
                    country_code="FR",
                    currency="EUR",
                    primary_contact_name=ctx.faker_fr.name(),
                    primary_contact_email=_client_email(name),
                    size_band=band_name,
                )
            )
            client_id += 1

    assert len(clients) == 120, f"expected 120 clients, got {len(clients)}"
    return clients


def _client_name(ctx: SeedContext, band: str) -> str:
    suffix = {
        "large": ctx.rng.choice(["SA", "Group", "SE"]),
        "mid": ctx.rng.choice(["SAS", "SARL", "SE"]),
        "small": ctx.rng.choice(["SAS", "EURL", "Studio"]),
    }[band]
    base = ctx.faker_fr.company().split(",")[0].split("&")[0].strip()
    return f"{base} {suffix}"


def _client_email(name: str) -> str:
    slug = "".join(c for c in name.lower() if c.isalnum()).strip() or "client"
    return f"finance@{slug[:18]}-demo.local"


def gen_projects(ctx: SeedContext) -> list[Project]:
    projects: list[Project] = []
    project_id = 1

    # Build status pool in deterministic order then shuffle
    status_pool: list[str] = []
    for status, count in PROJECT_STATUS_DISTRIBUTION:
        status_pool.extend([status] * count)
    ctx.rng.shuffle(status_pool)

    idx = 0
    manager_pool = [e.employee_id for e in ctx.employees if e.role in {"senior_pm", "pm"}]

    for band_name, _, projects_per in CLIENT_BANDS:
        band_clients = [c for c in ctx.clients if c.size_band == band_name]
        for client in band_clients:
            for n in range(projects_per):
                status = status_pool[idx]
                idx += 1
                name = f"{client.name} - {_project_name(ctx, n)}"
                start = ctx.faker_fr.date_between(
                    start_date=date(2024, 1, 1),
                    end_date=date(2026, 3, 31),
                )
                if status == "pipeline":
                    start = ctx.faker_fr.date_between(
                        start_date=date(2026, 4, 1),
                        end_date=date(2026, 12, 31),
                    )
                end = (
                    None
                    if status != "completed"
                    else ctx.faker_fr.date_between(
                        start_date=start,
                        end_date=date(2026, 4, 15),
                    ).isoformat()
                )
                budget_eur = ctx.rng.choice([25_000, 50_000, 120_000, 250_000, 500_000])
                if client.currency == "GBP":
                    budget_minor = int(budget_eur * 85)  # ~EUR->GBP rough
                else:
                    budget_minor = budget_eur * 100
                projects.append(
                    Project(
                        project_id=project_id,
                        name=name,
                        client_id=client.client_id,
                        status=status,
                        budget_minor_units=budget_minor,
                        currency=client.currency,
                        start_date=start.isoformat(),
                        end_date=end,
                        owner_employee_id=ctx.rng.choice(manager_pool),
                    )
                )
                project_id += 1

    assert len(projects) == 260, f"expected 260 projects, got {len(projects)}"
    return projects


def _project_name(ctx: SeedContext, index: int) -> str:
    prefixes = [
        "Operations uplift",
        "Finance transformation",
        "Data platform",
        "Cloud migration",
        "Risk review",
        "Compliance audit",
        "Org redesign",
        "Cost optimization",
    ]
    return f"{ctx.rng.choice(prefixes)} phase {index + 1}"


def write_csv(path: Path, rows: list[Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not rows:
        path.write_text("", encoding="utf-8")
        return
    fields = list(asdict(rows[0]).keys())
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow(asdict(row))


def generate() -> SeedContext:
    ctx = build_context()
    ctx.teams = gen_teams(ctx)
    ctx.employees = gen_employees(ctx)
    ctx.clients = gen_clients(ctx)
    ctx.projects = gen_projects(ctx)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    write_csv(OUTPUT_DIR / "teams.csv", ctx.teams)
    write_csv(OUTPUT_DIR / "employees.csv", ctx.employees)
    write_csv(OUTPUT_DIR / "clients.csv", ctx.clients)
    write_csv(OUTPUT_DIR / "projects.csv", ctx.projects)
    return ctx


def main() -> None:
    ctx = generate()
    print(
        f"seed generated: {len(ctx.teams)} teams, {len(ctx.employees)} employees, "
        f"{len(ctx.clients)} clients, {len(ctx.projects)} projects "
        f"-> {OUTPUT_DIR}"
    )


if __name__ == "__main__":
    main()
