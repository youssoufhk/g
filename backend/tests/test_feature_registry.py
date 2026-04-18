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
