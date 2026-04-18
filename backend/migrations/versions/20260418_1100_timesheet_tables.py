"""phase 5a timesheets: timesheet_weeks + timesheet_entries

Revision ID: 20260418_1100
Revises: 20260418_1000
Create Date: 2026-04-18 11:00:00

Creates the two-table time-tracking core per `specs/DATA_ARCHITECTURE.md`
section 2.8.

* `timesheet_weeks` - parent entity, state machine
  draft -> submitted -> {approved, rejected}, `version`-locked,
  UNIQUE(employee_id, iso_year, iso_week).
* `timesheet_entries` - child of `timesheet_weeks`, ON DELETE CASCADE.
  Duration stored in minutes (source-of-truth unit), UI converts to
  days via `tenants.hours_per_day`. Indexed by (project_id, work_date)
  and (employee_id, work_date) for the approvals hub and reports.

Tenancy follows the Phase 4 pattern (public schema + `tenant_id`
column). ADR-001 schema-per-tenant graduation is tracked separately
under the D15 rework.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260418_1100"
down_revision: str | Sequence[str] | None = "20260418_1000"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "timesheet_weeks",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column(
            "tenant_id",
            sa.BigInteger,
            sa.ForeignKey("public.tenants.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "employee_id",
            sa.BigInteger,
            sa.ForeignKey("public.employees.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("iso_year", sa.Integer, nullable=False),
        sa.Column("iso_week", sa.Integer, nullable=False),
        sa.Column("status", sa.Text, nullable=False, server_default="draft"),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "approved_by",
            sa.BigInteger,
            sa.ForeignKey("public.employees.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("rejection_reason", sa.Text, nullable=True),
        sa.Column("version", sa.Integer, nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.UniqueConstraint(
            "employee_id",
            "iso_year",
            "iso_week",
            name="uq_timesheet_weeks_employee_year_week",
        ),
        sa.CheckConstraint(
            "status IN ('draft','submitted','approved','rejected')",
            name="ck_timesheet_weeks_status",
        ),
        sa.CheckConstraint(
            "iso_week >= 1 AND iso_week <= 53",
            name="ck_timesheet_weeks_iso_week",
        ),
        schema="public",
    )
    op.create_index(
        "ix_timesheet_weeks_tenant",
        "timesheet_weeks",
        ["tenant_id"],
        schema="public",
    )
    op.create_index(
        "ix_timesheet_weeks_status",
        "timesheet_weeks",
        ["tenant_id", "status"],
        schema="public",
    )
    op.create_index(
        "ix_timesheet_weeks_year_week",
        "timesheet_weeks",
        ["iso_year", "iso_week"],
        schema="public",
    )

    op.create_table(
        "timesheet_entries",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column(
            "tenant_id",
            sa.BigInteger,
            sa.ForeignKey("public.tenants.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "timesheet_week_id",
            sa.BigInteger,
            sa.ForeignKey("public.timesheet_weeks.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "employee_id",
            sa.BigInteger,
            sa.ForeignKey("public.employees.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "project_id",
            sa.BigInteger,
            sa.ForeignKey("public.projects.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("task_id", sa.BigInteger, nullable=True),
        sa.Column("work_date", sa.Date, nullable=False),
        sa.Column("duration_minutes", sa.Integer, nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("billable", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("version", sa.Integer, nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.CheckConstraint(
            "duration_minutes > 0",
            name="ck_timesheet_entries_duration_positive",
        ),
        schema="public",
    )
    op.create_index(
        "ix_timesheet_entries_tenant",
        "timesheet_entries",
        ["tenant_id"],
        schema="public",
    )
    op.create_index(
        "ix_timesheet_entries_project_date",
        "timesheet_entries",
        ["project_id", "work_date"],
        schema="public",
    )
    op.create_index(
        "ix_timesheet_entries_employee_date",
        "timesheet_entries",
        ["employee_id", "work_date"],
        schema="public",
    )
    op.create_index(
        "ix_timesheet_entries_week",
        "timesheet_entries",
        ["timesheet_week_id"],
        schema="public",
    )


def downgrade() -> None:
    op.drop_index(
        "ix_timesheet_entries_week",
        table_name="timesheet_entries",
        schema="public",
    )
    op.drop_index(
        "ix_timesheet_entries_employee_date",
        table_name="timesheet_entries",
        schema="public",
    )
    op.drop_index(
        "ix_timesheet_entries_project_date",
        table_name="timesheet_entries",
        schema="public",
    )
    op.drop_index(
        "ix_timesheet_entries_tenant",
        table_name="timesheet_entries",
        schema="public",
    )
    op.drop_table("timesheet_entries", schema="public")

    op.drop_index(
        "ix_timesheet_weeks_year_week",
        table_name="timesheet_weeks",
        schema="public",
    )
    op.drop_index(
        "ix_timesheet_weeks_status",
        table_name="timesheet_weeks",
        schema="public",
    )
    op.drop_index(
        "ix_timesheet_weeks_tenant",
        table_name="timesheet_weeks",
        schema="public",
    )
    op.drop_table("timesheet_weeks", schema="public")
