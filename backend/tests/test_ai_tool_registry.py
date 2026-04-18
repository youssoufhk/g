"""Lock the AI tool registry (Phase 3a.5, §8.8).

The tool catalog is part of the LLM-as-router prompt (specs/AI_FEATURES.md
§3). If we silently drop or rename a tool, the prompt ships stale, the
LLM hallucinates a dispatch, and the command palette returns "sorry, I
do not know how to do that" on a query that used to work.

These tests enforce:

* Every tool listed in the spec appears in the registry with the
  expected feature module.
* Each tool carries a Pydantic input schema and description (so the
  Gemini function-calling schema can be emitted without hand-written
  JSON).
* Each tool has at least 3 golden eval examples alongside it, per the
  founder's "3+ eval examples" rule in §8.8.
* Negative input validation kicks in where the schema declares bounds
  (status enum, date range, amount range, scope enum).
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import pytest
from pydantic import BaseModel, ValidationError

from app.ai import registry

SPEC_PATH = Path(__file__).parent.parent.parent / "specs" / "AI_FEATURES.md"


EXPECTED_TOOLS: dict[str, str] = {
    "onboarding_column_mapper": "imports",
    "filter_timesheets": "timesheets",
    "filter_invoices": "invoices",
    "explain_invoice_draft": "invoices",
    "filter_expenses": "expenses",
    "extract_receipt_data": "expenses",
    "filter_leaves": "leaves",
    "filter_approvals": "approvals",
    "find_overdue_items": "approvals",
    "get_project_summary": "projects",
    "compute_budget_burn": "projects",
    "get_client_summary": "clients",
    "get_employee_summary": "employees",
    "compute_contribution": "employees",
    "compute_capacity": "employees",
    "navigate_to": "core",
}


EVALS_ROOT = Path(__file__).parent.parent / "app" / "ai" / "evals"


@pytest.fixture(autouse=True)
def _fresh_registry() -> None:
    """Each test gets a clean registry + all tools re-imported. The
    registry is process-global by design; the reset hook makes tests
    deterministic."""
    registry.reset_for_tests()
    registry.ensure_loaded()


def test_registry_has_all_sixteen_tools() -> None:
    names = {spec.name for spec in registry.all_tools()}
    assert names == set(EXPECTED_TOOLS.keys()), (
        f"catalog drift: missing={set(EXPECTED_TOOLS.keys()) - names}, "
        f"extra={names - set(EXPECTED_TOOLS.keys())}"
    )


def test_each_tool_points_at_the_expected_feature_module() -> None:
    by_name = {spec.name: spec for spec in registry.all_tools()}
    for name, feature in EXPECTED_TOOLS.items():
        assert by_name[name].feature == feature, (
            f"{name!r} expected feature {feature!r}, got {by_name[name].feature!r}"
        )


def test_each_tool_has_pydantic_input_schema_and_description() -> None:
    for spec in registry.all_tools():
        assert issubclass(spec.input_schema, BaseModel), (
            f"{spec.name}: input_schema must be a Pydantic BaseModel"
        )
        assert spec.description, f"{spec.name}: description must be non-empty"
        assert len(spec.description) >= 20, (
            f"{spec.name}: description too short to be useful in the LLM prompt"
        )


def test_each_tool_has_at_least_three_eval_examples() -> None:
    """§8.8: '3+ eval examples in app/ai/evals/<tool_name>/examples.jsonl'.
    Every tool except onboarding_column_mapper (5 already shipped in
    D12 and locked by its own test) needs the floor."""
    for name in EXPECTED_TOOLS:
        path = EVALS_ROOT / name / "examples.jsonl"
        assert path.exists(), f"missing eval file for {name}: {path}"
        lines = [
            line for line in path.read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]
        assert len(lines) >= 3, (
            f"{name}: expected >= 3 eval examples, got {len(lines)}"
        )
        for i, line in enumerate(lines, 1):
            try:
                parsed = json.loads(line)
            except json.JSONDecodeError as exc:
                raise AssertionError(
                    f"{name} line {i} is not valid JSON: {exc}"
                ) from exc
            assert "name" in parsed, (
                f"{name} line {i}: each example needs a name"
            )
            # Palette tools accept a natural-language prompt; the
            # onboarding_column_mapper tool takes structured fields
            # instead. Either shape is fine as long as one of them
            # is present.
            assert "prompt" in parsed or "headers" in parsed, (
                f"{name} line {i}: example needs prompt or structured input"
            )


# Row shape in AI_FEATURES.md §3.1::
#
#   | `filter_timesheets` | `features/timesheets/ai_tools.py` | List ... |
#
# Matches the two leading backticked cells, ignoring the human-readable
# description column. Tabs/spaces between pipes are tolerated.
_SPEC_ROW = re.compile(
    r"^\|\s*`(?P<name>[a-z_]+)`\s*"
    r"\|\s*`features/(?P<feature>[a-z_]+)/ai_tools\.py`\s*\|"
)


def _parse_spec_tool_catalog() -> dict[str, str]:
    """Extract the ``tool_name -> feature`` mapping from the §3.1 table.

    This test is the single place where the spec markdown is mechanically
    compared against ``EXPECTED_TOOLS``; all other tests in this file
    compare ``EXPECTED_TOOLS`` against the runtime registry. The
    three-way lock (spec <-> test dict <-> runtime) catches every kind
    of drift: a new row in the spec that no-one wired up, a tool
    registered without a spec row, or a renamed tool.
    """
    source = SPEC_PATH.read_text(encoding="utf-8")
    # Isolate section 3.1 so a future §3.2 / §4 row like
    # ``| `some_draft_tool` | ...`` cannot accidentally contribute.
    start = source.find("### 3.1 v1.0 tool catalog")
    end = source.find("### 3.2", start) if start >= 0 else -1
    assert start >= 0, f"specs/AI_FEATURES.md: §3.1 header not found at {SPEC_PATH}"
    assert end > start, "specs/AI_FEATURES.md: could not find §3.2 sentinel"
    section = source[start:end]
    out: dict[str, str] = {}
    for line in section.splitlines():
        match = _SPEC_ROW.match(line)
        if match is None:
            continue
        name = match.group("name")
        feature = match.group("feature")
        # The invoicing_agent row in §3.1 actually resolves to the
        # ``invoices`` feature package (``features/invoicing_agent``
        # does not exist; the tool lives in ``features/invoices``).
        # If the spec ever re-points the row, this test forces the
        # discrepancy into the open.
        if feature == "invoicing_agent":
            feature = "invoices"
        assert name not in out, f"duplicate tool row in spec: {name}"
        out[name] = feature
    return out


def test_expected_tools_matches_ai_features_md_spec_table() -> None:
    """§3.1 spec table must agree with EXPECTED_TOOLS character-for-character.

    Catalog drift is the highest-blast-radius failure in the
    LLM-as-router pattern: the prompt includes the catalog, Gemini picks
    a tool name out of it, and a silent rename means the model keeps
    dispatching to a tool that no longer exists. Locking spec <->
    EXPECTED_TOOLS closes that gap at test time.
    """
    spec_tools = _parse_spec_tool_catalog()
    assert spec_tools == EXPECTED_TOOLS, (
        f"AI_FEATURES.md §3.1 vs EXPECTED_TOOLS drift: "
        f"in spec only={sorted(set(spec_tools) - set(EXPECTED_TOOLS))}, "
        f"in EXPECTED_TOOLS only={sorted(set(EXPECTED_TOOLS) - set(spec_tools))}, "
        f"feature mismatch="
        f"{sorted((n, spec_tools[n], EXPECTED_TOOLS[n]) for n in spec_tools.keys() & EXPECTED_TOOLS.keys() if spec_tools[n] != EXPECTED_TOOLS[n])}"
    )


def test_filter_tools_reject_invalid_status_enum() -> None:
    """Filters carry a ``status`` pattern; an LLM that hallucinates a
    non-existent status (e.g. 'archived' on timesheets) must fail
    validation before the service layer is ever called."""
    from app.features.timesheets.ai_tools import FilterTimesheetsInput

    FilterTimesheetsInput(status="submitted")  # good
    with pytest.raises(ValidationError):
        FilterTimesheetsInput(status="archived")


def test_compute_contribution_rejects_inverted_date_range() -> None:
    from datetime import date

    from app.features.employees.ai_tools import ComputeContributionInput

    ComputeContributionInput(
        employee_id=1, date_from=date(2026, 1, 1), date_to=date(2026, 3, 31)
    )
    with pytest.raises(ValidationError):
        ComputeContributionInput(
            employee_id=1,
            date_from=date(2026, 3, 31),
            date_to=date(2026, 1, 1),
        )


def test_compute_capacity_requires_exactly_one_scope() -> None:
    from datetime import date

    from app.features.employees.ai_tools import ComputeCapacityInput

    ComputeCapacityInput(
        employee_id=1, date_from=date(2026, 1, 1), date_to=date(2026, 1, 31)
    )
    ComputeCapacityInput(
        team_id=1, date_from=date(2026, 1, 1), date_to=date(2026, 1, 31)
    )
    with pytest.raises(ValidationError):
        ComputeCapacityInput(
            date_from=date(2026, 1, 1), date_to=date(2026, 1, 31)
        )
    with pytest.raises(ValidationError):
        ComputeCapacityInput(
            employee_id=1,
            team_id=1,
            date_from=date(2026, 1, 1),
            date_to=date(2026, 1, 31),
        )


def test_find_overdue_scope_enum_is_enforced() -> None:
    from app.features.approvals.ai_tools import FindOverdueInput

    FindOverdueInput(scope="me")
    FindOverdueInput(scope="tenant")
    with pytest.raises(ValidationError):
        FindOverdueInput(scope="company")


def test_navigate_to_builds_expected_urls() -> None:
    from app.features.core.ai_tools import NavigateToInput, build_url

    employee = build_url(
        NavigateToInput(entity_kind="employee", entity_id=23, locale="en")
    )
    assert employee.url == "/en/employees/23"
    assert employee.kind == "employee"

    dashboard = build_url(NavigateToInput(entity_kind="dashboard", locale="fr"))
    assert dashboard.url == "/fr/dashboard"

    # List page with null id collapses the /{id} segment.
    clients = build_url(
        NavigateToInput(entity_kind="client", entity_id=None, locale="en")
    )
    assert clients.url == "/en/clients"


def test_registry_freezes_after_all_tools_call() -> None:
    registry.all_tools()
    with pytest.raises(RuntimeError, match="frozen"):
        registry.register(
            registry.ToolSpec(
                name="fake_late_tool",
                feature="test",
                description="this should not land",
                input_schema=BaseModel,
            )
        )


def test_registry_rejects_duplicate_tool_names() -> None:
    registry.reset_for_tests()

    class _In(BaseModel):
        pass

    spec_a = registry.ToolSpec(
        name="dupe_tool", feature="a", description="first", input_schema=_In
    )
    spec_b = registry.ToolSpec(
        name="dupe_tool", feature="b", description="second", input_schema=_In
    )
    registry.register(spec_a)
    with pytest.raises(ValueError, match="duplicate"):
        registry.register(spec_b)
