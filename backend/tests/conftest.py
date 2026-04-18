from collections.abc import AsyncIterator, Iterator
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.core.database import get_session
from app.main import app


class _StubAsyncSession:
    """No-op async session for unit tests.

    The @audited decorator writes an INSERT to the session on every
    mutating route; without a stub, unit tests would need a real DB.
    Tests that need real DB coverage should register their own
    ``app.dependency_overrides[get_session]``. This stub applies only
    when no test-level override is in place.
    """

    async def execute(self, *args: Any, **kwargs: Any) -> None:
        return None

    async def commit(self) -> None:
        return None

    async def rollback(self) -> None:
        return None

    async def close(self) -> None:
        return None


async def _stub_session() -> AsyncIterator[_StubAsyncSession]:
    yield _StubAsyncSession()


@pytest.fixture(autouse=True)
def _install_stub_session_override() -> Iterator[None]:
    previous = app.dependency_overrides.get(get_session)
    app.dependency_overrides[get_session] = _stub_session
    yield
    if previous is None:
        app.dependency_overrides.pop(get_session, None)
    else:
        app.dependency_overrides[get_session] = previous


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
