"""phase 3a.2 idempotency_keys table

Revision ID: 20260418_1400
Revises: 20260418_1300
Create Date: 2026-04-18 14:00:00

Adds ``public.idempotency_keys`` per ``specs/DATA_ARCHITECTURE.md``
section 2.5 and section 3.2. High-value mutating endpoints (invoice
generation, expense submission, payment recording, CSV imports) accept
an ``Idempotency-Key`` header; replays return the cached response.

The UNIQUE (tenant_id, key) constraint lets a single client retry
aggressively without creating duplicate invoices or double-posting
payments. ``request_hash`` is a sha256 of (method, path, body) so a
caller who reuses a key with a different payload is told off
explicitly (HTTP 409) instead of silently receiving the first reply.

TTL: 24h is enforced by a periodic Celery sweep (Phase 3a.3), not by
a partial index. The `expires_at` column is set by the middleware.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260418_1400"
down_revision: str | Sequence[str] | None = "20260418_1300"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "idempotency_keys",
        sa.Column(
            "id",
            sa.BigInteger,
            sa.Identity(always=False),
            primary_key=True,
        ),
        sa.Column(
            "tenant_id",
            sa.BigInteger,
            sa.ForeignKey("public.tenants.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("key", sa.String(255), nullable=False),
        sa.Column("method", sa.String(10), nullable=False),
        sa.Column("path", sa.String(512), nullable=False),
        sa.Column("request_hash", sa.String(64), nullable=False),
        sa.Column("response_status", sa.Integer, nullable=False),
        sa.Column(
            "response_body",
            sa.JSON,
            nullable=False,
        ),
        sa.Column(
            "response_headers",
            sa.JSON,
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "expires_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.UniqueConstraint(
            "tenant_id", "key", name="uq_idempotency_keys_tenant_key"
        ),
        sa.CheckConstraint(
            "response_status BETWEEN 100 AND 599",
            name="ck_idempotency_keys_status_range",
        ),
        schema="public",
    )
    op.create_index(
        "ix_idempotency_keys_expires_at",
        "idempotency_keys",
        ["expires_at"],
        schema="public",
    )


def downgrade() -> None:
    op.drop_index(
        "ix_idempotency_keys_expires_at",
        table_name="idempotency_keys",
        schema="public",
    )
    op.drop_table("idempotency_keys", schema="public")
