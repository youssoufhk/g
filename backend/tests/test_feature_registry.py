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
