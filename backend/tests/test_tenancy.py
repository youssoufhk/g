from app.core.tenancy import (
    get_current_tenant,
    is_valid_tenant_schema,
    set_current_tenant,
)


def test_valid_tenant_schema_shapes() -> None:
    assert is_valid_tenant_schema("t_acme")
    assert is_valid_tenant_schema("t_firm_001")
    assert is_valid_tenant_schema("t_a")


def test_invalid_tenant_schema_shapes() -> None:
    for bad in [
        "public",
        "acme",
        "T_ACME",
        "t-acme",
        "t_" + "a" * 49,
        "t_acme; drop table tenants",
        "",
    ]:
        assert not is_valid_tenant_schema(bad), bad


def test_context_var_round_trip() -> None:
    assert get_current_tenant() is None
    set_current_tenant("t_acme")
    assert get_current_tenant() == "t_acme"
    set_current_tenant(None)
    assert get_current_tenant() is None
