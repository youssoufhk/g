from pathlib import Path

import pytest

from app.core.feature_registry import FeatureRegistry


def test_register_and_lookup() -> None:
    reg = FeatureRegistry()
    reg.register("invoices", description="Invoice generation")
    assert reg.is_enabled("invoices", tenant_schema=None)


def test_kill_switch_overrides_default() -> None:
    reg = FeatureRegistry()
    reg.register("invoices", description="Invoice generation")
    reg.set_kill_switch("invoices", killed=True)
    assert not reg.is_enabled("invoices", tenant_schema=None)
    assert not reg.is_enabled("invoices", tenant_schema="t_acme")


def test_per_tenant_override() -> None:
    reg = FeatureRegistry()
    reg.register("month_end_close", description="Month end close agent")
    reg.set_tenant_override("month_end_close", "t_acme", enabled=False)
    assert not reg.is_enabled("month_end_close", tenant_schema="t_acme")
    assert reg.is_enabled("month_end_close", tenant_schema="t_other")


def test_unknown_feature_is_disabled() -> None:
    reg = FeatureRegistry()
    assert not reg.is_enabled("nope", tenant_schema=None)


# ---------------------------------------------------------------------
# Catalog-completeness metatest (M6 + CLAUDE.md section 6)
#
# Every routable feature module under ``backend/app/features/*/`` must
# register a feature flag in the module-level registry. Without that
# entry, the operator console cannot toggle the feature, the kill-
# switch UI cannot list it, and a future ``@gated_feature("<key>")``
# decorator on a newly added mutating route would silently 402 in
# production because ``is_enabled`` returns False for unknown keys.
#
# The metatest walks the features directory and asserts, for every
# package that ships a ``routes.py`` (i.e. a real HTTP surface), a
# ``registry.register("<name>"...)`` call appears in its ``__init__.py``.
# ``core`` is a non-routable helper package (AI tool handlers only) so
# it is excluded. Any new feature module will trip this test until the
# registration line is added alongside the routes.
# ---------------------------------------------------------------------

FEATURES_ROOT = Path(__file__).parent.parent / "app" / "features"
NON_ROUTABLE_PACKAGES = {"core"}


def _feature_packages_with_routes() -> list[Path]:
    """Return every features/* package that exposes a routes.py."""
    return sorted(
        p.parent
        for p in FEATURES_ROOT.glob("*/routes.py")
        if p.parent.name not in NON_ROUTABLE_PACKAGES
    )


@pytest.mark.parametrize(
    "package_dir", _feature_packages_with_routes(), ids=lambda p: p.name
)
def test_every_routable_feature_registers_a_flag(package_dir: Path) -> None:
    init_file = package_dir / "__init__.py"
    assert init_file.exists(), (
        f"{package_dir.name}: package has routes.py but no __init__.py"
    )
    source = init_file.read_text(encoding="utf-8")
    assert "registry.register(" in source, (
        f"{package_dir.name}: routes.py is exposed but "
        f"{init_file.relative_to(FEATURES_ROOT.parent.parent)} does not "
        "call registry.register(). Add a module-level registration so "
        "the operator console can toggle the feature (see "
        "app/features/admin/__init__.py for the canonical shape)."
    )
    quoted_name = f'"{package_dir.name}"'
    assert quoted_name in source, (
        f"{package_dir.name}: __init__.py registers a feature flag but "
        f"not under the expected key {quoted_name}; a mismatch here "
        "means @gated_feature on the module's routes will 402 in "
        "production."
    )


# ---------------------------------------------------------------------
# AI-handler-to-service-layer binding metatest (OPUS_CRITICS_V2.md §0,
# first cascade diagnosis: "the DONE-lie cascade").
#
# Every feature that ships an ``ai_tools.py`` is promising an LLM-
# dispatchable handler for that domain. Per ``CLAUDE.md §6`` and M3,
# those handlers must delegate through the feature's own ``service.py``
# rather than reaching into models. An ``ai_tools.py`` without a
# sibling ``service.py`` is a broken promise: the tool passes its
# input-schema test (locked in ``test_ai_tool_registry.py``) yet has
# no business-logic layer to call, so the LLM router happily dispatches
# to a handler that will ``ImportError`` or silently return a stub.
#
# OPUS_CRITICS_V2.md §0 named five features in this state on the
# 2026-04-18 audit: ``approvals``, ``expenses``, ``invoices``,
# ``leaves``, ``timesheets``. Each was ticked "frontend done" in
# EXECUTION_CHECKLIST.md §6.2 while the backend folder contained only
# ``__init__.py`` and ``ai_tools.py``. This metatest freezes that list
# and ratchets it in both directions:
#
#   * A NEW feature added with ``ai_tools.py`` but no ``service.py``
#     trips the test (``actual`` grew beyond ``expected``).
#   * An EXISTING gap fixed (``service.py`` added to one of the five)
#     also trips the test (``actual`` shrank) and forces the cascade
#     set to be updated in the same commit that removes the gap. That
#     is the point: the cascade cannot quietly close without a commit
#     acknowledging it.
#
# ``core`` is exempt. Its only tool (``navigate_to``) is a pure URL
# builder that does no DB read (see ``features/core/ai_tools.py``
# docstring) and legitimately has no service layer. The exemption is
# named explicitly, not inferred, so adding a second pure-lookup
# feature still requires a conscious edit.
# ---------------------------------------------------------------------

AI_HANDLER_NO_SERVICE_EXEMPT = frozenset({"core"})

# OPUS_CRITICS_V2.md §0 cascade: features where ai_tools.py shipped
# before the service layer existed. Each entry must shrink the set
# when closed, not quietly disappear. When the last entry is removed,
# delete this constant and the matching assertion.
AI_HANDLER_NO_SERVICE_CASCADE = frozenset({
    "approvals",
    "timesheets",
})
# 2026-04-18: ``invoices`` closed. service.py + routes.py + models.py
# landed in a follow-up commit that wires the list endpoint to the
# Phase 5a invoice tables (migration 20260418_1300). The AI handler
# in features/invoices/ai_tools.py can now delegate to
# features/invoices/service.py instead of stubbing.


def _features_with_ai_tools_but_no_service() -> set[str]:
    violators: set[str] = set()
    for ai_tools_path in FEATURES_ROOT.glob("*/ai_tools.py"):
        feature = ai_tools_path.parent.name
        if feature in AI_HANDLER_NO_SERVICE_EXEMPT:
            continue
        service_path = ai_tools_path.parent / "service.py"
        if not service_path.exists():
            violators.add(feature)
    return violators


def test_ai_tools_features_have_service_layer_matching_cascade() -> None:
    """Every ``features/*/ai_tools.py`` has a sibling ``service.py``,
    except for the frozen OPUS_CRITICS_V2 §0 cascade. Both directions
    of drift fail: a new gap, or a silently-closed existing gap."""
    actual = _features_with_ai_tools_but_no_service()
    expected = set(AI_HANDLER_NO_SERVICE_CASCADE)
    new_gaps = actual - expected
    closed_gaps = expected - actual
    assert actual == expected, (
        f"AI handler -> service layer binding drifted. "
        f"new gaps (ai_tools.py registered against non-existent "
        f"service.py) = {sorted(new_gaps)}; "
        f"closed gaps (cascade feature now has service.py, remove it "
        f"from AI_HANDLER_NO_SERVICE_CASCADE in this file) = "
        f"{sorted(closed_gaps)}. See OPUS_CRITICS_V2.md §0 for the "
        f"diagnosis and CLAUDE.md §6 for the rule: AI tool handlers "
        f"must delegate through service.py, not models."
    )
