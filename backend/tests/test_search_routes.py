"""Topbar search route (Phase Z.6).

The route depends on a session (Postgres) and a resolved tenant id.
These tests override both dependencies so the unit coverage does not
require a running DB, and exercises the schema + query validator
contract.
"""

from __future__ import annotations

from typing import Any
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient

from app.core.database import get_session
from app.core.tenant_ctx import get_tenant_id
from app.features.search import service as search_service
from app.main import app


@pytest.fixture
def override_deps():
    async def _session() -> Any:
        return object()

    def _tenant_id() -> int:
        return 1

    app.dependency_overrides[get_session] = _session
    app.dependency_overrides[get_tenant_id] = _tenant_id
    yield
    app.dependency_overrides.pop(get_session, None)
    app.dependency_overrides.pop(get_tenant_id, None)


def test_search_validates_query_length(
    override_deps: None,
    client: TestClient,
) -> None:
    """`q` is capped at 120 chars to prevent accidental query bombs."""
    long_q = "a" * 500
    response = client.get("/api/v1/search", params={"q": long_q})
    assert response.status_code == 422


def test_search_empty_query_returns_empty_groups(
    override_deps: None,
    monkeypatch: pytest.MonkeyPatch,
    client: TestClient,
) -> None:
    """An empty query is valid. The service is called with the empty
    string and returns all-empty groups; the route wraps them in the
    grouped schema."""
    mock_search = AsyncMock(
        return_value={"employees": [], "clients": [], "projects": []}
    )
    monkeypatch.setattr(search_service, "search_entities", mock_search)

    response = client.get("/api/v1/search?q=")
    assert response.status_code == 200
    body = response.json()
    assert body["employees"] == []
    assert body["clients"] == []
    assert body["projects"] == []
    assert body["total"] == 0


def test_search_restricts_to_requested_types(
    override_deps: None,
    monkeypatch: pytest.MonkeyPatch,
    client: TestClient,
) -> None:
    """`types=employees` should narrow the search scope to that kind."""
    captured: dict[str, Any] = {}

    async def fake_search(
        session, *, tenant_id, query, types, limit_per_kind=5
    ):
        captured["types"] = types
        captured["query"] = query
        return {"employees": [(42, "Alice Andersen", "senior_consultant")], "clients": [], "projects": []}

    monkeypatch.setattr(search_service, "search_entities", fake_search)

    response = client.get("/api/v1/search?q=alice&types=employees")
    assert response.status_code == 200
    body = response.json()
    assert captured["types"] == {"employees"}
    assert captured["query"] == "alice"
    assert len(body["employees"]) == 1
    assert body["employees"][0]["title"] == "Alice Andersen"
    assert body["employees"][0]["kind"] == "employees"
    assert body["employees"][0]["subtitle"] == "senior_consultant"
    assert body["total"] == 1


def test_search_invalid_types_falls_back_to_all(
    override_deps: None,
    monkeypatch: pytest.MonkeyPatch,
    client: TestClient,
) -> None:
    """If the caller passes a garbage `types` value, the route still
    serves a useful response (falls back to all three kinds) rather than
    returning a cryptic 422."""
    captured: dict[str, Any] = {}

    async def fake_search(
        session, *, tenant_id, query, types, limit_per_kind=5
    ):
        captured["types"] = types
        return {"employees": [], "clients": [], "projects": []}

    monkeypatch.setattr(search_service, "search_entities", fake_search)

    response = client.get("/api/v1/search?q=foo&types=bogus,alsobogus")
    assert response.status_code == 200
    assert captured["types"] == {"employees", "clients", "projects"}
