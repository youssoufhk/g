"""Contract test: every API endpoint matches the published OpenAPI shape.

The real frontend contract harness uses openapi-typescript to check that
the frontend types still compile against a new backend build. This test
enforces the minimum backend-side invariants.
"""

from fastapi.testclient import TestClient


def test_openapi_includes_health_and_auth(client: TestClient) -> None:
    response = client.get("/openapi.json")
    assert response.status_code == 200
    spec = response.json()
    assert spec["openapi"].startswith("3."), spec["openapi"]
    assert "/health" in spec["paths"]
    assert "/api/v1/auth/login" in spec["paths"]
    assert "/api/v1/auth/register" in spec["paths"]
    assert "/api/v1/auth/me" in spec["paths"]


def test_openapi_components_schemas_are_stable(client: TestClient) -> None:
    spec = client.get("/openapi.json").json()
    schemas = spec.get("components", {}).get("schemas", {})
    assert "LoginRequest" in schemas
    assert "RegisterRequest" in schemas
    assert "TokenPair" in schemas
    assert "MeResponse" in schemas
    assert "UserOut" in schemas
    assert "MembershipOut" in schemas
