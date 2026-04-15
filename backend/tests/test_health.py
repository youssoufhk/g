from fastapi.testclient import TestClient


def test_health_ok(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["name"] == "gamma"


def test_openapi_is_versioned_under_v1(client: TestClient) -> None:
    """M8: every endpoint lives under /api/v1/*. Enforced here."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    paths = response.json()["paths"].keys()
    non_meta = [p for p in paths if not p.startswith(("/health", "/docs", "/redoc", "/openapi"))]
    for path in non_meta:
        assert path.startswith("/api/v1/"), f"{path} is not under /api/v1/"
