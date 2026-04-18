"""Idempotency-Key middleware + integration-level checks for the
three concerns the §8.5 founder answer calls out:

  * audit row written (the @audited decorator runs session.execute
    on every success);
  * 402 on disabled feature (the @gated_feature decorator raises
    EntitlementLocked when the kill switch flips);
  * 200 -> 200 replay on the same Idempotency-Key header (the
    middleware caches the first response and returns it verbatim).

All three use the in-memory stub session + in-memory idempotency
store from :mod:`backend.tests.conftest`, so the suite still runs
offline.
"""

from __future__ import annotations

import io
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.core.database import get_session
from app.core.feature_registry import registry
from app.core.idempotency import (
    InMemoryIdempotencyStore,
    get_store,
    set_store,
)
from app.main import app


@pytest.fixture(autouse=True)
def _fresh_idempotency_store() -> None:
    store = InMemoryIdempotencyStore()
    set_store(store)
    yield
    # Restore a clean default so the next test starts empty.
    set_store(InMemoryIdempotencyStore())


def _csv_bytes(rows: list[dict[str, str]], headers: list[str]) -> bytes:
    buf = io.StringIO()
    buf.write(",".join(headers) + "\n")
    for row in rows:
        buf.write(",".join(row.get(h, "") for h in headers) + "\n")
    return buf.getvalue().encode("utf-8")


def test_audit_row_written_on_successful_mutation(
    client: TestClient,
) -> None:
    """The @audited decorator calls session.execute(INSERT INTO
    audit_log ...) after a successful mutation. With the stub
    session in conftest, we swap in a spy that captures the call
    and assert an INSERT was issued."""

    calls: list[Any] = []

    class _SpySession:
        async def execute(self, *args: Any, **kwargs: Any) -> None:
            calls.append(args[0] if args else None)

        async def commit(self) -> None:
            pass

        async def rollback(self) -> None:
            pass

        async def close(self) -> None:
            pass

    async def _spy_dep():
        yield _SpySession()

    previous = app.dependency_overrides.get(get_session)
    app.dependency_overrides[get_session] = _spy_dep
    try:
        response = client.post(
            "/api/v1/ops/features/auth/kill-switch",
            json={"killed": False},
        )
    finally:
        if previous is None:
            app.dependency_overrides.pop(get_session, None)
        else:
            app.dependency_overrides[get_session] = previous

    assert response.status_code == 200
    audit_inserts = [
        str(stmt) for stmt in calls
        if stmt is not None and "INSERT INTO audit_log" in str(stmt)
    ]
    assert audit_inserts, (
        "expected at least one INSERT INTO audit_log from the "
        "@audited decorator; saw: " + repr(calls)
    )


def test_gated_feature_returns_402_when_killed(
    client: TestClient,
) -> None:
    """Flipping the kill switch on the `imports` feature disables
    every `@gated_feature('imports')` route. The /preview endpoint
    should then reject with HTTP 402 entitlement_locked."""

    registry.set_kill_switch("imports", killed=True)
    try:
        csv = _csv_bytes(
            [{"first_name": "x", "last_name": "y", "email": "z@z.eu", "role": "pm"}],
            headers=["first_name", "last_name", "email", "role"],
        )
        response = client.post(
            "/api/v1/imports/preview",
            data={"entity_type": "employees"},
            files={"file": ("e.csv", csv, "text/csv")},
        )
    finally:
        registry.set_kill_switch("imports", killed=False)

    assert response.status_code == 402
    body = response.json()
    assert body["code"] == "entitlement_locked"


def test_idempotency_key_replay_returns_identical_response(
    client: TestClient,
) -> None:
    """Two POSTs carrying the same Idempotency-Key and body should
    return byte-identical responses. The second call gets the
    `Idempotency-Replayed: true` response header stamped by the
    middleware."""
    payload = {"killed": False}
    headers = {"Idempotency-Key": "test-replay-001"}

    first = client.post(
        "/api/v1/ops/features/auth/kill-switch",
        json=payload,
        headers=headers,
    )
    assert first.status_code == 200
    assert first.headers.get("idempotency-replayed") is None

    second = client.post(
        "/api/v1/ops/features/auth/kill-switch",
        json=payload,
        headers=headers,
    )
    assert second.status_code == 200
    assert second.headers.get("idempotency-replayed") == "true"
    assert second.content == first.content


def test_idempotency_key_rejects_body_mismatch(
    client: TestClient,
) -> None:
    """Same key, different body: 409 so the client notices the
    reuse-with-different-payload bug instead of silently getting
    the first response."""
    headers = {"Idempotency-Key": "test-mismatch-001"}
    first = client.post(
        "/api/v1/ops/features/auth/kill-switch",
        json={"killed": False},
        headers=headers,
    )
    assert first.status_code == 200

    second = client.post(
        "/api/v1/ops/features/auth/kill-switch",
        json={"killed": True},
        headers=headers,
    )
    assert second.status_code == 409
    assert second.json()["code"] == "idempotency_key_reused"


def test_idempotency_key_header_missing_is_pass_through(
    client: TestClient,
) -> None:
    """Without the header, the middleware does not cache anything
    and the route runs normally for every call."""
    first = client.post(
        "/api/v1/ops/features/auth/kill-switch",
        json={"killed": False},
    )
    assert first.status_code == 200
    assert "idempotency-replayed" not in {
        k.lower() for k in first.headers
    }
    # A second call should not see a cached response either.
    second = client.post(
        "/api/v1/ops/features/auth/kill-switch",
        json={"killed": False},
    )
    assert second.status_code == 200
    assert "idempotency-replayed" not in {
        k.lower() for k in second.headers
    }


def test_idempotency_non_mutating_method_is_pass_through(
    client: TestClient,
) -> None:
    """GET should never consult the idempotency store even when
    the client forwards the header (some wrappers do this
    accidentally)."""
    response = client.get(
        "/api/v1/ops/features",
        headers={"Idempotency-Key": "test-get-001"},
    )
    assert response.status_code == 200
    assert response.headers.get("idempotency-replayed") is None
    # The store should still be empty since GET never writes.
    store = get_store()
    assert isinstance(store, InMemoryIdempotencyStore)
    # Implementation detail: the in-memory store's _store dict is
    # empty. We poke at it to prove no accidental write happened.
    assert store._store == {}  # type: ignore[attr-defined]
