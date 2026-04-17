"""Tests for @audited and @gated_feature (Phase Z.2)."""

from __future__ import annotations

from unittest.mock import AsyncMock

import pytest

from app.core.audit import audited
from app.core.errors import EntitlementLocked
from app.core.feature_registry import registry
from app.core.rbac import gated_feature


@pytest.mark.asyncio
async def test_audited_writes_one_row_per_mutation(monkeypatch) -> None:
    calls: list[tuple[str, str, str | None]] = []

    async def fake_record(session, entry):
        calls.append((entry.action, entry.entity_type, entry.entity_id))

    monkeypatch.setattr("app.core.audit.record_audit", fake_record)

    class _FakeSession:
        pass

    class _FakeRequest:
        class _State:
            pass

        state = _State()
        headers: dict[str, str] = {}
        client = None

    @audited("employee.create", "employees")
    async def handler(*, session, request, body):
        class _Entity:
            id = 42

        return _Entity()

    session = _FakeSession()
    result = await handler(session=session, request=_FakeRequest(), body={})
    assert result.id == 42
    assert calls == [("employee.create", "employees", "42")]


@pytest.mark.asyncio
async def test_audited_skips_on_handler_exception(monkeypatch) -> None:
    calls: list[str] = []

    async def fake_record(session, entry):
        calls.append(entry.action)

    monkeypatch.setattr("app.core.audit.record_audit", fake_record)

    @audited("employee.create", "employees")
    async def handler(*, session, request, body):
        raise RuntimeError("boom")

    with pytest.raises(RuntimeError):
        await handler(session=object(), request=None, body={})
    assert calls == []


@pytest.mark.asyncio
async def test_gated_feature_raises_when_disabled() -> None:
    registry.register(
        "z2.test.feature_off",
        description="test flag (off)",
        default_enabled=False,
    )

    class _FakeRequest:
        class _State:
            pass

        state = _State()
        headers: dict[str, str] = {}
        client = None

    @gated_feature("z2.test.feature_off")
    async def handler(*, request):
        return "ok"

    with pytest.raises(EntitlementLocked):
        await handler(request=_FakeRequest())


@pytest.mark.asyncio
async def test_gated_feature_allows_when_enabled() -> None:
    registry.register(
        "z2.test.feature_on",
        description="test flag (on)",
        default_enabled=True,
    )

    class _FakeRequest:
        class _State:
            pass

        state = _State()
        headers: dict[str, str] = {}
        client = None

    @gated_feature("z2.test.feature_on")
    async def handler(*, request):
        return "ok"

    out = await handler(request=_FakeRequest())
    assert out == "ok"


@pytest.mark.asyncio
async def test_gated_feature_caches_per_request() -> None:
    registry.register(
        "z2.test.cache",
        description="test flag (cache)",
        default_enabled=True,
    )

    class _FakeRequest:
        class _State:
            pass

        state = _State()
        headers: dict[str, str] = {}
        client = None

    req = _FakeRequest()

    @gated_feature("z2.test.cache")
    async def handler(*, request):
        return "ok"

    # First call populates the cache; second call hits it.
    await handler(request=req)
    cache = req.state._gated_feature_cache  # type: ignore[attr-defined]
    assert "z2.test.cache" in cache
    await handler(request=req)
    # Cache still exists and was not re-populated twice (value identity
    # check is sufficient here).
    assert req.state._gated_feature_cache is cache  # type: ignore[attr-defined]
