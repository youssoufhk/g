from fastapi.testclient import TestClient


def test_list_features_returns_registered(client: TestClient) -> None:
    response = client.get("/api/v1/ops/features")
    assert response.status_code == 200
    flags = response.json()
    keys = {flag["key"] for flag in flags}
    assert "auth" in keys
    assert "admin" in keys


def test_kill_switch_round_trip(client: TestClient) -> None:
    # Activate kill switch on auth (this is a unit test; auth is not actually
    # served, we just toggle the registry entry).
    response = client.post(
        "/api/v1/ops/features/auth/kill-switch",
        json={"killed": True},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["kill_switch"] is True

    # Turn it back off so subsequent tests see a clean state.
    response = client.post(
        "/api/v1/ops/features/auth/kill-switch",
        json={"killed": False},
    )
    assert response.status_code == 200
    assert response.json()["kill_switch"] is False


def test_kill_switch_unknown_feature_returns_404(client: TestClient) -> None:
    response = client.post(
        "/api/v1/ops/features/not_a_feature/kill-switch",
        json={"killed": True},
    )
    assert response.status_code == 404


def test_tenant_override_round_trip(client: TestClient) -> None:
    response = client.post(
        "/api/v1/ops/features/auth/overrides",
        json={"tenant_schema": "t_acme", "enabled": False},
    )
    assert response.status_code == 200
    assert response.json()["tenant_overrides"]["t_acme"] is False


def test_tenant_override_rejects_invalid_schema(client: TestClient) -> None:
    response = client.post(
        "/api/v1/ops/features/auth/overrides",
        json={"tenant_schema": "bad schema", "enabled": False},
    )
    assert response.status_code == 422
