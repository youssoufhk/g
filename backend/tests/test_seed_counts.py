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

import re
from collections import Counter
from pathlib import Path

from scripts.seed_demo_tenant import (
    EXPENSE_CATEGORY_CATALOGUE,
    EXPENSE_TOTAL,
    INVOICE_LINES_PER_INVOICE,
    INVOICE_LINES_TOTAL,
    INVOICE_STATUS_MIX,
    INVOICE_TOTAL,
    INVOICES_PER_MONTH,
    INVOICES_PER_YEAR,
    LEAVE_STATUS_MIX,
    LEAVE_TOTAL,
    LEAVE_TYPE_CATALOGUE,
    TIMESHEET_BILLABLE_EMPLOYEE_COUNT,
    TIMESHEET_ENTRIES_PER_BILLABLE_WEEK,
    TIMESHEET_WEEKS_PER_EMPLOYEE,
    TIMESHEET_YEAR,
    generate_expense_rows,
    generate_invoice_line_rows,
    generate_invoice_rows,
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


# ---------------------------------------------------------------------------
# Invoices (DATA_ARCHITECTURE section 12.10)
#   - 900 invoices/year (75/month x 12)
#   - Status mix: 50 draft + 200 sent + 600 paid + 50 overdue
#   - Invoice lines: exactly 10 per invoice -> 9,000 lines total
# ---------------------------------------------------------------------------


def _client_ids(n: int = 120) -> list[int]:
    return list(range(1, n + 1))


def test_invoice_constants_match_canonical_spec() -> None:
    assert INVOICE_TOTAL == 900
    assert INVOICES_PER_YEAR == 900
    assert INVOICES_PER_MONTH == 75
    assert INVOICE_LINES_PER_INVOICE == 10
    assert INVOICE_LINES_TOTAL == 9_000


def test_invoice_status_mix_sums_to_900() -> None:
    assert sum(count for _, count in INVOICE_STATUS_MIX) == 900


def test_generate_invoice_rows_produces_900() -> None:
    rows = generate_invoice_rows(client_ids=_client_ids())
    assert len(rows) == 900


def test_generate_invoice_rows_is_deterministic() -> None:
    first = generate_invoice_rows(client_ids=_client_ids())
    second = generate_invoice_rows(client_ids=_client_ids())
    assert first == second


def test_generate_invoice_rows_status_counts_match_spec() -> None:
    rows = generate_invoice_rows(client_ids=_client_ids())
    by_status = Counter(str(r["status"]) for r in rows)
    assert by_status["draft"] == 50
    assert by_status["sent"] == 200
    assert by_status["paid"] == 600
    assert by_status["overdue"] == 50


def test_generate_invoice_rows_total_matches_subtotal_plus_tax() -> None:
    rows = generate_invoice_rows(client_ids=_client_ids())
    for r in rows:
        subtotal = int(r["subtotal_cents"])  # type: ignore[arg-type]
        tax = int(r["tax_total_cents"])  # type: ignore[arg-type]
        total = int(r["total_cents"])  # type: ignore[arg-type]
        assert total == subtotal + tax


def test_generate_invoice_rows_numbers_are_unique() -> None:
    rows = generate_invoice_rows(client_ids=_client_ids())
    numbers = [str(r["number"]) for r in rows]
    assert len(numbers) == len(set(numbers))


def test_generate_invoice_rows_issue_dates_in_canonical_year() -> None:
    rows = generate_invoice_rows(client_ids=_client_ids())
    years = {r["issue_date"].year for r in rows}  # type: ignore[union-attr]
    assert years == {2026}


def test_generate_invoice_line_rows_produces_9000() -> None:
    invoices = generate_invoice_rows(client_ids=_client_ids())
    lines = generate_invoice_line_rows(
        invoice_rows=invoices, project_ids=_project_ids()
    )
    assert len(lines) == 9_000


def test_generate_invoice_line_rows_exactly_10_per_invoice() -> None:
    invoices = generate_invoice_rows(client_ids=_client_ids())
    lines = generate_invoice_line_rows(
        invoice_rows=invoices, project_ids=_project_ids()
    )
    by_seq = Counter(int(line["invoice_sequence"]) for line in lines)  # type: ignore[arg-type]
    assert len(by_seq) == 900
    assert all(v == 10 for v in by_seq.values())


def test_generate_invoice_rows_rejects_empty_inputs() -> None:
    import pytest

    with pytest.raises(ValueError):
        generate_invoice_rows(client_ids=[])
    with pytest.raises(ValueError):
        generate_invoice_line_rows(
            invoice_rows=[], project_ids=_project_ids()
        )
    invoices = generate_invoice_rows(client_ids=_client_ids())
    with pytest.raises(ValueError):
        generate_invoice_line_rows(invoice_rows=invoices, project_ids=[])


# ---------------------------------------------------------------------------
# Spec <-> runtime alignment (DATA_ARCHITECTURE.md section 12, bullet 10
# "Build the seed data"). The seed-count constants above already lock
# the *runtime* generator to fixed numbers; this test closes the last
# gap by parsing the spec markdown itself and asserting the numbers in
# the prose agree with the Python constants.
#
# Without this, the spec can drift independently of the code: someone
# updates "~8,400 expenses" to "~10,000" in the markdown, the code
# still emits 8,400 rows, every existing test passes green, and the
# docs ship a lie to the first customer. Same shape as the
# test_expected_tools_matches_ai_features_md_spec_table metatest in
# test_ai_tool_registry.py.
#
# The anchors are verbatim sentences from §12 today. Any edit that
# changes the wording trips the parser with a clear "spec anchor
# missing" message so the test update is forced into the same commit
# as the spec edit.
# ---------------------------------------------------------------------------

SPEC_PATH = Path(__file__).parent.parent.parent / "specs" / "DATA_ARCHITECTURE.md"


def _parse_spec_seed_numbers() -> dict[str, int]:
    """Extract the headline seed counts from §12 bullet 10.

    Bounded by ``10. **Build the seed data**`` and ``## 12.11`` so a
    future §12.12 bullet cannot accidentally contribute.
    """
    source = SPEC_PATH.read_text(encoding="utf-8")
    start = source.find("10. **Build the seed data**")
    end = source.find("## 12.11", start) if start >= 0 else -1
    assert start >= 0, (
        f"DATA_ARCHITECTURE.md: §12 bullet 10 anchor "
        f"'10. **Build the seed data**' not found at {SPEC_PATH}"
    )
    assert end > start, (
        "DATA_ARCHITECTURE.md: could not find §12.11 sentinel after §12 bullet 10"
    )
    section = source[start:end]

    out: dict[str, int] = {}

    m = re.search(r"(?P<n>\d+) weeks of timesheet data", section)
    assert m, "spec anchor missing: '<N> weeks of timesheet data'"
    out["timesheet_weeks_sentence"] = int(m.group("n"))

    m = re.search(
        r"(?P<billable>\d+) billable employees x "
        r"(?P<days>\d+) days x "
        r"(?P<weeks>\d+) weeks",
        section,
    )
    assert m, (
        "spec anchor missing: '<N> billable employees x <N> days x "
        "<N> weeks' formula"
    )
    out["timesheet_billable"] = int(m.group("billable"))
    out["timesheet_days"] = int(m.group("days"))
    out["timesheet_weeks_formula"] = int(m.group("weeks"))

    m = re.search(r"(?P<n>\d+) leaves \(", section)
    assert m, "spec anchor missing: '<N> leaves ('"
    out["leaves"] = int(m.group("n"))

    m = re.search(r"\*\*Expenses \(~(?P<n>[\d,]+) total\)", section)
    assert m, "spec anchor missing: '**Expenses (~<N> total)**'"
    out["expenses"] = int(m.group("n").replace(",", ""))

    m = re.search(
        r"(?P<year>\d+)/year \((?P<month>\d+)/month\)", section
    )
    assert m, "spec anchor missing: '<N>/year (<N>/month)'"
    out["invoices_year"] = int(m.group("year"))
    out["invoices_month"] = int(m.group("month"))

    return out


def test_spec_internal_consistency_timesheet_weeks() -> None:
    """The spec states '52 weeks of timesheet data' AND '... x 52 weeks'
    in the formula line. Those two numbers must agree or the prose
    contradicts itself before any code is even consulted."""
    spec = _parse_spec_seed_numbers()
    assert spec["timesheet_weeks_sentence"] == spec["timesheet_weeks_formula"], (
        "DATA_ARCHITECTURE.md §12: 'N weeks of timesheet data' "
        f"({spec['timesheet_weeks_sentence']}) disagrees with 'x N weeks' "
        f"({spec['timesheet_weeks_formula']}) in the formula line. "
        "Fix the spec first; the seed generator cannot match two values."
    )


def test_seed_constants_match_data_architecture_spec() -> None:
    """Every canonical seed number from §12 agrees with its Python
    constant in seed_demo_tenant.py. Both directions are locked: a spec
    edit without a constant update fails here, and a constant change
    without a spec update also fails here."""
    spec = _parse_spec_seed_numbers()
    pairs = [
        ("timesheet weeks per employee (sentence)",
         spec["timesheet_weeks_sentence"], TIMESHEET_WEEKS_PER_EMPLOYEE),
        ("timesheet weeks per employee (formula)",
         spec["timesheet_weeks_formula"], TIMESHEET_WEEKS_PER_EMPLOYEE),
        ("timesheet entries per billable week (formula 'days')",
         spec["timesheet_days"], TIMESHEET_ENTRIES_PER_BILLABLE_WEEK),
        ("timesheet billable employee count",
         spec["timesheet_billable"], TIMESHEET_BILLABLE_EMPLOYEE_COUNT),
        ("leave total",
         spec["leaves"], LEAVE_TOTAL),
        ("expense total",
         spec["expenses"], EXPENSE_TOTAL),
        ("invoices per year",
         spec["invoices_year"], INVOICES_PER_YEAR),
        ("invoices per month",
         spec["invoices_month"], INVOICES_PER_MONTH),
    ]
    mismatches = [
        f"  {label}: spec={spec_val} vs constant={code_val}"
        for label, spec_val, code_val in pairs
        if spec_val != code_val
    ]
    assert not mismatches, (
        "DATA_ARCHITECTURE.md §12 seed numbers drifted from "
        "seed_demo_tenant.py constants:\n"
        + "\n".join(mismatches)
        + "\nFix the spec or the constant, in the same commit."
    )
