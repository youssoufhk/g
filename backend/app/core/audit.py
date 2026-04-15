"""Audit log writer (append-only).

Every mutation goes through ``record_audit`` which inserts a row into the
per-tenant ``audit_log`` table. A Postgres trigger on that table rejects
any UPDATE or DELETE, so the log is append-only at the database level.

The trigger is created by the first Alembic migration in §3.2.
"""

from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any

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
