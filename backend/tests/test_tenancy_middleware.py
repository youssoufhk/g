"""Tests for TenancyMiddleware JWT extraction path."""

from fastapi import FastAPI, Request
from fastapi.testclient import TestClient

from app.core.security import issue_access_token
from app.core.tenancy import (
    TenancyMiddleware,
    _extract_from_jwt,
    get_current_tenant,
    is_valid_tenant_schema,
)


def _make_request(headers: dict[str, str]) -> Request:
    scope = {
        "type": "http",
        "method": "GET",
        "path": "/api/v1/foo",
        "headers": [(k.lower().encode(), v.encode()) for k, v in headers.items()],
    }
    return Request(scope)


def test_extract_returns_none_without_auth_header() -> None:
    request = _make_request({})
    assert _extract_from_jwt(request) is None


def test_extract_returns_none_for_non_bearer_scheme() -> None:
    request = _make_request({"authorization": "Basic dXNlcjpwYXNz"})
    assert _extract_from_jwt(request) is None


def test_extract_returns_none_for_invalid_token() -> None:
    request = _make_request({"authorization": "Bearer not-a-real-jwt"})
    assert _extract_from_jwt(request) is None


def test_extract_returns_schema_from_app_audience_token() -> None:
    token = issue_access_token(
        subject="42",
        audience="app",
        tenant_schema="t_acme",
    )
    request = _make_request({"authorization": f"Bearer {token}"})
    assert _extract_from_jwt(request) == "t_acme"


def test_extract_returns_schema_from_ops_audience_token() -> None:
    token = issue_access_token(
        subject="99",
        audience="ops",
        tenant_schema="t_other",
    )
    request = _make_request({"authorization": f"Bearer {token}"})
    assert _extract_from_jwt(request) == "t_other"


def test_extract_rejects_malformed_schema_claim() -> None:
    token = issue_access_token(
        subject="7",
        audience="app",
        tenant_schema="not-a-valid-schema",
    )
    request = _make_request({"authorization": f"Bearer {token}"})
    assert _extract_from_jwt(request) is None


def test_extract_returns_none_when_schema_claim_missing() -> None:
    token = issue_access_token(
        subject="7",
        audience="app",
        tenant_schema=None,
    )
    request = _make_request({"authorization": f"Bearer {token}"})
    assert _extract_from_jwt(request) is None


def test_middleware_sets_context_var_for_authenticated_request() -> None:
    app = FastAPI()
    app.add_middleware(TenancyMiddleware)

    @app.get("/api/v1/check")
    async def check() -> dict[str, str | None]:
        return {"schema": get_current_tenant()}

    token = issue_access_token(
        subject="42",
        audience="app",
        tenant_schema="t_acme",
    )
    with TestClient(app) as client:
        response = client.get(
            "/api/v1/check", headers={"authorization": f"Bearer {token}"}
        )
    assert response.status_code == 200
    assert response.json()["schema"] == "t_acme"


def test_middleware_bypasses_public_prefixes() -> None:
    app = FastAPI()
    app.add_middleware(TenancyMiddleware)

    @app.get("/health")
    async def health() -> dict[str, str | None]:
        return {"schema": get_current_tenant()}

    @app.get("/api/v1/auth/login")
    async def login() -> dict[str, str | None]:
        return {"schema": get_current_tenant()}

    with TestClient(app) as client:
        assert client.get("/health").json()["schema"] is None
        assert client.get("/api/v1/auth/login").json()["schema"] is None


def test_is_valid_tenant_schema_accepts_expected_shape() -> None:
    assert is_valid_tenant_schema("t_acme")
    assert is_valid_tenant_schema("t_firm_001")
    assert not is_valid_tenant_schema("acme")
    assert not is_valid_tenant_schema("T_ACME")
    assert not is_valid_tenant_schema("t_acme\n")
