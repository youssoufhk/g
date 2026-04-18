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
    EXPENSE_CATEGORY_CATALOGUE,
    EXPENSE_TOTAL,
    LEAVE_STATUS_MIX,
    LEAVE_TOTAL,
    LEAVE_TYPE_CATALOGUE,
    TIMESHEET_BILLABLE_EMPLOYEE_COUNT,
    TIMESHEET_ENTRIES_PER_BILLABLE_WEEK,
    TIMESHEET_WEEKS_PER_EMPLOYEE,
    TIMESHEET_YEAR,
    generate_expense_rows,
    generate_leave_rows,
    generate_timesheet_entry_rows,
    generate_timesheet_week_rows,
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


# ---------------------------------------------------------------------------
# Timesheets (DATA_ARCHITECTURE section 12.10)
#   - 10,400 weeks  = 52 x 200 active employees
#   - 39,000 entries = 150 billable x 5 days x 52 weeks
# ---------------------------------------------------------------------------


def _active_employee_ids(n: int = 200) -> list[int]:
    # 200 active seats = 201 total minus the owner.
    return list(range(2, n + 2))


def _billable_employee_ids() -> list[int]:
    # 150 billable consultants; ids are arbitrary as long as the count holds.
    return list(range(2, 2 + TIMESHEET_BILLABLE_EMPLOYEE_COUNT))


def _project_ids(n: int = 160) -> list[int]:
    # 160 active projects (per section 12.10 "260 projects (160 active, ...)").
    return list(range(1, n + 1))


def test_timesheet_constants_match_canonical_spec() -> None:
    assert TIMESHEET_YEAR == 2026
    assert TIMESHEET_WEEKS_PER_EMPLOYEE == 52
    assert TIMESHEET_ENTRIES_PER_BILLABLE_WEEK == 5
    assert TIMESHEET_BILLABLE_EMPLOYEE_COUNT == 150


def test_generate_timesheet_week_rows_produces_10400_for_200_employees() -> None:
    rows = generate_timesheet_week_rows(employee_ids=_active_employee_ids(200))
    assert len(rows) == 10_400


def test_generate_timesheet_week_rows_is_deterministic() -> None:
    ids = _active_employee_ids(200)
    first = generate_timesheet_week_rows(employee_ids=ids)
    second = generate_timesheet_week_rows(employee_ids=ids)
    assert first == second


def test_generate_timesheet_week_rows_status_values_are_valid() -> None:
    rows = generate_timesheet_week_rows(employee_ids=_active_employee_ids(20))
    statuses = {str(r["status"]) for r in rows}
    assert statuses <= {"draft", "submitted", "approved", "rejected"}


def test_generate_timesheet_week_rows_covers_all_52_iso_weeks() -> None:
    rows = generate_timesheet_week_rows(employee_ids=_active_employee_ids(5))
    weeks = {int(r["iso_week"]) for r in rows}
    assert weeks == set(range(1, 53))


def test_generate_timesheet_entry_rows_produces_39000_for_150_billable() -> None:
    rows = generate_timesheet_entry_rows(
        billable_employee_ids=_billable_employee_ids(),
        project_ids=_project_ids(),
    )
    assert len(rows) == 39_000


def test_generate_timesheet_entry_rows_durations_are_full_workdays() -> None:
    rows = generate_timesheet_entry_rows(
        billable_employee_ids=_billable_employee_ids()[:5],
        project_ids=_project_ids()[:10],
    )
    assert all(int(r["duration_minutes"]) == 480 for r in rows)
    assert all(bool(r["billable"]) for r in rows)


def test_generate_timesheet_entry_rows_is_deterministic() -> None:
    emps = _billable_employee_ids()[:10]
    projs = _project_ids()[:20]
    first = generate_timesheet_entry_rows(billable_employee_ids=emps, project_ids=projs)
    second = generate_timesheet_entry_rows(billable_employee_ids=emps, project_ids=projs)
    assert first == second


def test_generate_timesheet_entry_rows_references_only_provided_projects() -> None:
    projs = _project_ids()[:20]
    rows = generate_timesheet_entry_rows(
        billable_employee_ids=_billable_employee_ids()[:5],
        project_ids=projs,
    )
    referenced = {int(r["project_id"]) for r in rows}
    assert referenced <= set(projs)


def test_generate_timesheet_rows_reject_empty_inputs() -> None:
    import pytest

    with pytest.raises(ValueError):
        generate_timesheet_week_rows(employee_ids=[])
    with pytest.raises(ValueError):
        generate_timesheet_entry_rows(
            billable_employee_ids=[], project_ids=_project_ids()
        )
    with pytest.raises(ValueError):
        generate_timesheet_entry_rows(
            billable_employee_ids=_billable_employee_ids()[:5], project_ids=[]
        )


# ---------------------------------------------------------------------------
# Expenses (DATA_ARCHITECTURE section 12.10)
#   - 8,400 expenses total (published figure; raw arithmetic is 8,432)
#   - Monthly buckets: 201 employees * 12 months * 3 categories = 7,236
#   - Senior buckets: 46 senior/manager * (15+8+3) = 1,196
#   - Trim: 32 rows dropped from CLIENT_GIFTS tail -> 138 becomes 106
# Status mix: 60 approved / 25 submitted / 10 approved+paid / 5 rejected
# ---------------------------------------------------------------------------

ALL_EMP_COUNT = 201
SENIOR_EMP_COUNT = 46


def _all_employee_ids() -> list[int]:
    return list(range(1, ALL_EMP_COUNT + 1))


def _senior_employee_ids() -> list[int]:
    # 46 seniors (15 managers + 25 senior consultants + 4 finance + 2 admin = 46).
    return list(range(1, SENIOR_EMP_COUNT + 1))


def _expense_category_codes() -> list[str]:
    return sorted(str(c["code"]) for c in EXPENSE_CATEGORY_CATALOGUE)


def test_expense_constants_match_canonical_spec() -> None:
    assert EXPENSE_TOTAL == 8_400
    codes = {str(c["code"]) for c in EXPENSE_CATEGORY_CATALOGUE}
    assert codes == {
        "FOOD",
        "TRANSPORT",
        "OVERHEAD",
        "CLIENT_TRAVEL",
        "CLIENT_MEALS",
        "CLIENT_GIFTS",
    }


def test_generate_expense_rows_produces_8400() -> None:
    rows = generate_expense_rows(
        all_employee_ids=_all_employee_ids(),
        senior_employee_ids=_senior_employee_ids(),
        category_codes=_expense_category_codes(),
    )
    assert len(rows) == 8_400


def test_generate_expense_rows_is_deterministic() -> None:
    first = generate_expense_rows(
        all_employee_ids=_all_employee_ids(),
        senior_employee_ids=_senior_employee_ids(),
        category_codes=_expense_category_codes(),
    )
    second = generate_expense_rows(
        all_employee_ids=_all_employee_ids(),
        senior_employee_ids=_senior_employee_ids(),
        category_codes=_expense_category_codes(),
    )
    assert first == second


def test_generate_expense_rows_category_mix_matches_spec() -> None:
    rows = generate_expense_rows(
        all_employee_ids=_all_employee_ids(),
        senior_employee_ids=_senior_employee_ids(),
        category_codes=_expense_category_codes(),
    )
    by_cat = Counter(str(r["category_code"]) for r in rows)
    assert by_cat["FOOD"] == 2_412
    assert by_cat["TRANSPORT"] == 2_412
    assert by_cat["OVERHEAD"] == 2_412
    assert by_cat["CLIENT_TRAVEL"] == 690
    assert by_cat["CLIENT_MEALS"] == 368
    # 138 raw - 32 trimmed = 106 for the gifts tail.
    assert by_cat["CLIENT_GIFTS"] == 106


def test_generate_expense_rows_status_values_are_valid() -> None:
    rows = generate_expense_rows(
        all_employee_ids=_all_employee_ids(),
        senior_employee_ids=_senior_employee_ids(),
        category_codes=_expense_category_codes(),
    )
    statuses = {str(r["status"]) for r in rows}
    reimbs = {str(r["reimbursement_status"]) for r in rows}
    assert statuses <= {"draft", "submitted", "approved", "rejected"}
    assert reimbs <= {"pending", "paid", "na"}


def test_generate_expense_rows_dates_land_in_canonical_year() -> None:
    rows = generate_expense_rows(
        all_employee_ids=_all_employee_ids(),
        senior_employee_ids=_senior_employee_ids(),
        category_codes=_expense_category_codes(),
    )
    years = {r["expense_date"].year for r in rows}  # type: ignore[union-attr]
    assert years == {2026}


def test_generate_expense_rows_rejects_empty_or_missing_categories() -> None:
    import pytest

    with pytest.raises(ValueError):
        generate_expense_rows(
            all_employee_ids=[],
            senior_employee_ids=_senior_employee_ids(),
            category_codes=_expense_category_codes(),
        )
    with pytest.raises(ValueError):
        generate_expense_rows(
            all_employee_ids=_all_employee_ids(),
            senior_employee_ids=[],
            category_codes=_expense_category_codes(),
        )
    with pytest.raises(ValueError):
        generate_expense_rows(
            all_employee_ids=_all_employee_ids(),
            senior_employee_ids=_senior_employee_ids(),
            category_codes=["FOOD", "TRANSPORT"],
        )
