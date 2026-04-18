"""phase 3a.4 alembic_runs tracking table for fan-out migration runner

Revision ID: 20260418_1600
Revises: 20260418_1500
Create Date: 2026-04-18 16:00:00

Creates ``public.alembic_runs``: the tracking table that the
fan-out migration runner writes to whenever it upgrades or
downgrades a tenant schema. One row per (schema, revision, run
started). See ``backend/migrations/runner.py`` for the Celery
fan-out that writes these rows, and ADR-001 Correction 2026-04-18
for the amendment that ratifies the template-runner approach.

The row lifecycle is:

    1. pending  - task enqueued on the runner, nothing touched yet.
    2. running  - task grabbed a connection, SET search_path done,
                  ``alembic upgrade`` in flight.
    3. success  - upgrade finished without exception.
    4. failed   - upgrade raised; ``error`` holds the repr.

Ops queries this table to answer "did revision X deploy to every
tenant?" without having to poll every schema's alembic_version
row. Also feeds the per-tenant rollback runbook
(``docs/ROLLBACK_RUNBOOK.md``, owed in Phase 2).
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260418_1600"
down_revision: str | Sequence[str] | None = "20260418_1500"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "alembic_runs",
        sa.Column(
            "id",
            sa.BigInteger,
            sa.Identity(always=False),
            primary_key=True,
        ),
        sa.Column("schema_name", sa.Text, nullable=False),
        sa.Column("revision", sa.Text, nullable=False),
        sa.Column(
            "direction",
            sa.Text,
            nullable=False,
            server_default="upgrade",
        ),
        sa.Column(
            "status",
            sa.Text,
            nullable=False,
            server_default="pending",
        ),
        sa.Column(
            "started_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "finished_at",
            sa.TIMESTAMP(timezone=True),
            nullable=True,
        ),
        sa.Column("error", sa.Text, nullable=True),
        sa.Column(
            "triggered_by",
            sa.Text,
            nullable=False,
            server_default="deploy",
        ),
        sa.CheckConstraint(
            "status IN ('pending','running','success','failed')",
            name="alembic_runs_status_values",
        ),
        sa.CheckConstraint(
            "direction IN ('upgrade','downgrade')",
            name="alembic_runs_direction_values",
        ),
        sa.CheckConstraint(
            "triggered_by IN ('deploy','manual','retry','provisioning')",
            name="alembic_runs_triggered_by_values",
        ),
        schema="public",
    )
    op.create_index(
        "ix_alembic_runs_schema_revision",
        "alembic_runs",
        ["schema_name", "revision"],
        schema="public",
    )
    op.create_index(
        "ix_alembic_runs_status_started",
        "alembic_runs",
        ["status", "started_at"],
        schema="public",
    )


def downgrade() -> None:
    op.drop_index(
        "ix_alembic_runs_status_started",
        table_name="alembic_runs",
        schema="public",
    )
    op.drop_index(
        "ix_alembic_runs_schema_revision",
        table_name="alembic_runs",
        schema="public",
    )
    op.drop_table("alembic_runs", schema="public")
