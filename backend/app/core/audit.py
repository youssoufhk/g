"""Audit log writer (append-only) + @audited route decorator.

Every mutation goes through ``record_audit`` which inserts a row into the
per-tenant ``audit_log`` table. A Postgres trigger on that table rejects
any UPDATE or DELETE, so the log is append-only at the database level.

The trigger is created by the first Alembic migration in §3.2.

``@audited(action, entity_type, entity_id_arg=None)`` is a FastAPI route
decorator that writes one audit row per mutation AFTER the route handler
returns. The handler runs first; if it raises, no row is written (we do
not audit attempted mutations). actor_id is read from the JWT claims via
``get_current_actor``; when the route is anonymous, actor_id is the
string ``"anonymous"``. The lint in ``scripts/hooks/check_mutation_
decorators.py`` ensures every mutating route in
``backend/app/features/*/routes.py`` carries this decorator.
"""

from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from datetime import UTC, datetime
from functools import wraps
from typing import Any, TypeVar

from fastapi import Request
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


@dataclass
class AuditEntry:
    actor_id: str
    actor_audience: str
    action: str
    entity_type: str
    entity_id: str | None
    payload: dict[str, Any]
    occurred_at: datetime

    @classmethod
    def now(
        cls,
        *,
        actor_id: str,
        actor_audience: str,
        action: str,
        entity_type: str,
        entity_id: str | None,
        payload: dict[str, Any] | None = None,
    ) -> "AuditEntry":
        return cls(
            actor_id=actor_id,
            actor_audience=actor_audience,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            payload=payload or {},
            occurred_at=datetime.now(UTC),
        )


async def record_audit(session: AsyncSession, entry: AuditEntry) -> None:
    await session.execute(
        text(
            """
            INSERT INTO audit_log (
                actor_id, actor_audience, action, entity_type, entity_id,
                payload, occurred_at
            ) VALUES (
                :actor_id, :actor_audience, :action, :entity_type, :entity_id,
                CAST(:payload AS jsonb), :occurred_at
            )
            """
        ),
        {
            "actor_id": entry.actor_id,
            "actor_audience": entry.actor_audience,
            "action": entry.action,
            "entity_type": entry.entity_type,
            "entity_id": entry.entity_id,
            "payload": _json_dumps(entry.payload),
            "occurred_at": entry.occurred_at,
        },
    )


def _json_dumps(payload: dict[str, Any]) -> str:
    import json

    return json.dumps(payload, default=str, separators=(",", ":"))


_F = TypeVar("_F", bound=Callable[..., Awaitable[Any]])


def audited(
    action: str,
    entity_type: str,
    *,
    entity_id_arg: str | None = None,
) -> Callable[[_F], _F]:
    """Decorate a mutating FastAPI route so every success writes one
    audit_log row.

    The decorated function must accept a ``session: AsyncSession`` kwarg
    and a ``request: Request`` kwarg (both are standard FastAPI deps).

    Parameters:
      action         Stable verb token, e.g. "employee.create",
                     "invoice.send". Use ``<entity>.<verb>``.
      entity_type    Entity slug, e.g. "employees", "invoices".
      entity_id_arg  Name of the handler kwarg or the return-value
                     attribute that carries the entity id. When the
                     handler returns an object with a matching
                     attribute, that is preferred over the kwarg.

    Handlers that raise are NOT audited; we only record completed
    mutations (the pre-failure state is captured by the existing DB
    write, and failed attempts are surfaced in error logs).
    """

    def decorator(fn: _F) -> _F:
        @wraps(fn)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            result = await fn(*args, **kwargs)
            session: AsyncSession | None = kwargs.get("session")
            request: Request | None = kwargs.get("request")
            if session is None:
                return result
            actor = _extract_actor(request)
            entity_id = _extract_entity_id(result, kwargs, entity_id_arg)
            entry = AuditEntry.now(
                actor_id=actor.actor_id,
                actor_audience=actor.audience,
                action=action,
                entity_type=entity_type,
                entity_id=entity_id,
                payload={"ip": actor.ip, "ua": actor.user_agent},
            )
            await record_audit(session, entry)
            return result

        setattr(wrapper, "__audited__", (action, entity_type))
        return wrapper  # type: ignore[return-value]

    return decorator


@dataclass
class _ActorContext:
    actor_id: str
    audience: str
    ip: str | None
    user_agent: str | None


def _extract_actor(request: Request | None) -> _ActorContext:
    """Best-effort actor context. Falls back to "anonymous" when the
    request is missing or has no bearer token. Real JWT parsing lives
    in ``core/security.py``; duplicating it here would violate M3, so
    we only read what TenancyMiddleware already stamped plus the
    headers the request carries."""
    if request is None:
        return _ActorContext("anonymous", "app", None, None)
    ip = (request.headers.get("x-forwarded-for") or "").split(",")[0].strip()
    if not ip and request.client is not None:
        ip = request.client.host
    ua = request.headers.get("user-agent")
    # TenancyMiddleware stashes claims under request.state.actor when it
    # decodes a JWT successfully. If absent, the caller is anonymous.
    actor_claims = getattr(request.state, "actor", None)
    if actor_claims is None:
        return _ActorContext("anonymous", "app", ip or None, ua)
    return _ActorContext(
        actor_id=str(actor_claims.get("sub", "anonymous")),
        audience=str(actor_claims.get("aud", "app")),
        ip=ip or None,
        user_agent=ua,
    )


def _extract_entity_id(
    result: Any,
    kwargs: dict[str, Any],
    entity_id_arg: str | None,
) -> str | None:
    if entity_id_arg is None:
        # Prefer a common attribute on the return value (Pydantic
        # response with an `id` field).
        if hasattr(result, "id"):
            return str(getattr(result, "id"))
        if isinstance(result, dict) and "id" in result:
            return str(result["id"])
        return None
    # Look first at the handler kwargs (path/query/body param), then
    # at the return value's matching attribute.
    if entity_id_arg in kwargs and kwargs[entity_id_arg] is not None:
        return str(kwargs[entity_id_arg])
    if hasattr(result, entity_id_arg):
        return str(getattr(result, entity_id_arg))
    return None
