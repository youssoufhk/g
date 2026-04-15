"""Unit tests for backend/app/features/auth/service.py.

These tests mock the session/db layer so they run offline without a real
Postgres. Integration tests hitting a live DB live in
tests/integration/test_auth_flow.py and run inside the backend container.
"""

from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.core.errors import Conflict, NotFound, Unauthorized
from app.core.security import hash_password
from app.features.auth import service
from app.features.auth.models import AppUser


def _make_user(*, email: str, password: str, user_id: int = 1) -> AppUser:
    user = AppUser()
    user.id = user_id
    user.email = email
    user.password_hash = hash_password(password)
    user.display_name = "Test User"
    user.locale = "en-GB"
    user.status = "active"
    user.created_at = datetime.now(UTC)
    user.last_login_at = None
    user.memberships = []
    return user


def _session_returning(*scalar_results: object) -> AsyncMock:
    """Build an AsyncMock session whose execute() returns pre-shaped results.

    Each positional arg becomes the next ``scalar_one_or_none()`` result.
    """
    session = AsyncMock()
    results: list[MagicMock] = []
    for value in scalar_results:
        result = MagicMock()
        result.scalar_one_or_none = MagicMock(return_value=value)
        scalars_mock = MagicMock()
        scalars_mock.all = MagicMock(
            return_value=value if isinstance(value, list) else []
        )
        result.scalars = MagicMock(return_value=scalars_mock)
        results.append(result)
    session.execute = AsyncMock(side_effect=results)
    session.add = MagicMock()
    session.flush = AsyncMock()
    session.commit = AsyncMock()
    return session


@pytest.mark.asyncio
async def test_authenticate_user_rejects_unknown_email() -> None:
    session = _session_returning(None)
    with pytest.raises(Unauthorized):
        await service.authenticate_user(
            session, email="ghost@gamma.local", password="whatever"
        )


@pytest.mark.asyncio
async def test_authenticate_user_rejects_wrong_password() -> None:
    user = _make_user(email="claire@gamma.local", password="correct-horse")
    session = _session_returning(user)
    with pytest.raises(Unauthorized):
        await service.authenticate_user(
            session, email="claire@gamma.local", password="wrong-password"
        )


@pytest.mark.asyncio
async def test_authenticate_user_rejects_suspended_account() -> None:
    user = _make_user(email="blocked@gamma.local", password="hunter22!")
    user.status = "suspended"
    session = _session_returning(user)
    with pytest.raises(Unauthorized):
        await service.authenticate_user(
            session, email="blocked@gamma.local", password="hunter22!"
        )


@pytest.mark.asyncio
async def test_authenticate_user_success_updates_last_login() -> None:
    user = _make_user(email="claire@gamma.local", password="correct-horse")
    before = user.last_login_at
    session = _session_returning(user)
    result = await service.authenticate_user(
        session, email="claire@gamma.local", password="correct-horse"
    )
    assert result is user
    assert result.last_login_at is not None
    assert result.last_login_at != before


@pytest.mark.asyncio
async def test_register_user_rejects_duplicate_email() -> None:
    existing = _make_user(email="dup@gamma.local", password="anything1!")
    session = _session_returning(existing)
    with pytest.raises(Conflict):
        await service.register_user(
            session,
            email="dup@gamma.local",
            password="anythingelse1!",
            display_name="Dup",
            tenant_schema="t_acme",
            locale="en-GB",
        )


@pytest.mark.asyncio
async def test_register_user_rejects_missing_tenant() -> None:
    session = _session_returning(None, None)
    with pytest.raises(NotFound):
        await service.register_user(
            session,
            email="new@gamma.local",
            password="safe-pass-1",
            display_name="New User",
            tenant_schema="t_nonexistent",
            locale="en-GB",
        )


def test_issue_tokens_contains_expected_claims() -> None:
    user = _make_user(email="a@b.c", password="secret-pass-1")
    tokens = service.issue_tokens_for_user(user=user, tenant_schema="t_acme")
    assert tokens.access_token
    assert tokens.refresh_token
    assert tokens.expires_in_seconds > 0
    claims = service.claims_from_access_token(tokens.access_token)
    assert claims.id == 1
    assert claims.email == "a@b.c"
    assert claims.tenant_schema == "t_acme"


def test_claims_from_access_token_rejects_wrong_audience() -> None:
    from app.core.security import issue_access_token

    ops_token = issue_access_token(
        subject="999",
        audience="ops",
        tenant_schema="t_acme",
    )
    with pytest.raises(Unauthorized):
        service.claims_from_access_token(ops_token)


def test_resolve_tenant_for_user_returns_none_if_no_memberships() -> None:
    import asyncio

    user = _make_user(email="solo@gamma.local", password="pw-123456")
    session = _session_returning([])
    result = asyncio.run(
        service.resolve_tenant_for_user(
            session, user=user, requested_schema=None
        )
    )
    assert result is None
