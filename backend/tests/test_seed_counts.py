"""Pin the canonical demo-tenant seed counts.

These tests exercise the pure row generators in
``backend/scripts/seed_demo_tenant.py`` without touching Postgres. A
regression that silently drops rows (e.g. a refactor that short-circuits
the loop) fails CI here before it reaches a developer's database.

Canonical figures come from ``specs/DATA_ARCHITECTURE.md`` section 12.10
and from founder follow-up 8.4 (`opus_plan_v2.md`). If the product
deliberately changes the headline count, update BOTH the spec and this
test in the same commit.
"""

from __future__ import annotations

from collections import Counter

from scripts.seed_demo_tenant import (
    LEAVE_STATUS_MIX,
    LEAVE_TOTAL,
    LEAVE_TYPE_CATALOGUE,
    generate_leave_rows,
)


def _sample_employee_ids(n: int = 201) -> list[int]:
    # Mirrors the 201-seat canonical tenant (DATA_ARCHITECTURE 12.10).
    return list(range(1, n + 1))


def _sample_type_codes() -> list[str]:
    return sorted(str(t["code"]) for t in LEAVE_TYPE_CATALOGUE)


def test_leave_status_mix_sums_to_canonical_700() -> None:
    assert LEAVE_TOTAL == 700
    assert sum(count for _, count in LEAVE_STATUS_MIX) == 700


def test_leave_type_catalogue_covers_five_codes() -> None:
    codes = {str(t["code"]) for t in LEAVE_TYPE_CATALOGUE}
    assert codes == {"VAC", "SICK", "PERS", "RTT", "PAR"}


def test_generate_leave_rows_produces_700_rows() -> None:
    rows = generate_leave_rows(
        employee_ids=_sample_employee_ids(),
        leave_type_codes=_sample_type_codes(),
    )
    assert len(rows) == 700


def test_generate_leave_rows_status_counts_match_spec() -> None:
    rows = generate_leave_rows(
        employee_ids=_sample_employee_ids(),
        leave_type_codes=_sample_type_codes(),
    )
    by_status = Counter(str(r["status"]) for r in rows)
    assert by_status["approved"] == 450
    assert by_status["submitted"] == 120
    assert by_status["draft"] == 30
    assert by_status["rejected"] == 100
    # Pending (draft + submitted) hits the spec's 150 published total.
    assert by_status["draft"] + by_status["submitted"] == 150


def test_generate_leave_rows_is_deterministic() -> None:
    employee_ids = _sample_employee_ids()
    codes = _sample_type_codes()
    first = generate_leave_rows(employee_ids=employee_ids, leave_type_codes=codes)
    second = generate_leave_rows(employee_ids=employee_ids, leave_type_codes=codes)
    assert first == second


def test_generate_leave_rows_references_all_leave_types() -> None:
    rows = generate_leave_rows(
        employee_ids=_sample_employee_ids(),
        leave_type_codes=_sample_type_codes(),
    )
    seen = {str(r["leave_type_code"]) for r in rows}
    assert seen == {"VAC", "SICK", "PERS", "RTT", "PAR"}


def test_generate_leave_rows_dates_land_in_2025_2027_window() -> None:
    rows = generate_leave_rows(
        employee_ids=_sample_employee_ids(),
        leave_type_codes=_sample_type_codes(),
    )
    years = {r["start_date"].year for r in rows}  # type: ignore[union-attr]
    assert years <= {2025, 2026, 2027}
    # Reports for any of the three years should find rows.
    assert years >= {2025, 2026, 2027}


def test_generate_leave_rows_end_is_never_before_start() -> None:
    rows = generate_leave_rows(
        employee_ids=_sample_employee_ids(),
        leave_type_codes=_sample_type_codes(),
    )
    for r in rows:
        assert r["end_date"] >= r["start_date"]  # type: ignore[operator]


def test_generate_leave_rows_rejects_empty_inputs() -> None:
    import pytest

    with pytest.raises(ValueError):
        generate_leave_rows(employee_ids=[], leave_type_codes=["VAC"])
    with pytest.raises(ValueError):
        generate_leave_rows(employee_ids=[1], leave_type_codes=[])
