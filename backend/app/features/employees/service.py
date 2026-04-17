from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.features.employees.models import Employee


async def list_employees(
    session: AsyncSession,
    *,
    tenant_id: int,
    limit: int = 100,
    offset: int = 0,
) -> tuple[list[Employee], int]:
    result = await session.execute(
        select(Employee)
        .where(Employee.tenant_id == tenant_id)
        .order_by(Employee.id)
        .limit(limit)
        .offset(offset)
    )
    items = list(result.scalars().all())

    count_result = await session.execute(
        select(func.count(Employee.id)).where(Employee.tenant_id == tenant_id)
    )
    total = int(count_result.scalar_one() or 0)
    return items, total


async def search_employees(
    session: AsyncSession,
    *,
    tenant_id: int,
    query: str,
    limit: int = 5,
) -> list[tuple[int, str, str | None]]:
    """Return (id, full_name, subtitle) tuples matching query for topbar search."""
    pattern = f"%{query}%"
    from sqlalchemy import or_
    rows = (
        await session.execute(
            select(Employee)
            .where(Employee.tenant_id == tenant_id)
            .where(
                or_(
                    Employee.first_name.ilike(pattern),
                    Employee.last_name.ilike(pattern),
                    Employee.email.ilike(pattern),
                )
            )
            .order_by(Employee.last_name, Employee.first_name)
            .limit(limit)
        )
    ).scalars().all()
    return [
        (e.id, f"{e.first_name} {e.last_name}", e.role if e.role else e.email)
        for e in rows
    ]


async def count_employees(session: AsyncSession, *, tenant_id: int) -> int:
    result = await session.execute(
        select(func.count(Employee.id)).where(Employee.tenant_id == tenant_id)
    )
    return int(result.scalar_one() or 0)


async def bulk_create_employees(
    session: AsyncSession,
    *,
    tenant_id: int,
    rows: list[dict[str, str]],
) -> int:
    """Insert validated employee rows under the given tenant.

    Skips rows that already exist (same tenant + email) via
    ON CONFLICT DO NOTHING. Returns the count of inserted rows.
    """
    if not rows:
        return 0
    payload: list[dict[str, object]] = []
    for row in rows:
        hire_date = _parse_date(row.get("hire_date"))
        manager_id = _parse_int(row.get("manager_id") or row.get("manager_employee_id"))
        payload.append(
            {
                "tenant_id": tenant_id,
                "first_name": row.get("first_name", "").strip(),
                "last_name": row.get("last_name", "").strip(),
                "email": row.get("email", "").strip().lower(),
                "role": row.get("role", "").strip() or "employee",
                "team": (row.get("team") or None),
                "hire_date": hire_date,
                "manager_employee_id": manager_id,
                "base_currency": (row.get("base_currency") or "EUR").upper(),
                "status": "active",
            }
        )
    inserted = 0
    for item in payload:
        session.add(Employee(**item))
        inserted += 1
    await session.flush()
    return inserted


def _parse_date(value: str | None) -> object:
    if value is None or value == "":
        return None
    from datetime import date as date_cls

    try:
        return date_cls.fromisoformat(value)
    except ValueError:
        return None


def _parse_int(value: str | None) -> int | None:
    if value is None or value == "":
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None
