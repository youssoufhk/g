"""phase 5a leaves: leave_types, leave_requests, leave_balances

Revision ID: 20260418_1000
Revises: 20260416_1000
Create Date: 2026-04-18 10:00:00

Creates the three-table leaves core per `specs/DATA_ARCHITECTURE.md`
section 2.9.

* `leave_types` - per-tenant seed of vacation/sick/personal/rtt/parental.
* `leave_requests` - optimistic-locked via `version`, includes both
  non-sensitive `reason` and the confidential-tier `reason_encrypted`
  column so Art. 9 medical leaves land in the right place. CMEK is
  Phase 7; the column shape is required now by unified-gate item 64.
* `leave_balances` - composite primary key `(employee_id,
  leave_type_id, year)`.

Tenancy follows the Phase 4 pattern (public schema + `tenant_id`
column). ADR-001 schema-per-tenant graduation is tracked separately
under the D15 rework (`opus_plan_v2.md` section 8.1).
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260418_1000"
down_revision: str | Sequence[str] | None = "20260416_1000"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "leave_types",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column(
            "tenant_id",
            sa.BigInteger,
            sa.ForeignKey("public.tenants.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.Text, nullable=False),
        sa.Column("code", sa.Text, nullable=False),
        sa.Column("accrual_rate", sa.Numeric(5, 2), nullable=False, server_default="0"),
        sa.Column("max_balance", sa.Numeric(5, 2), nullable=True),
        sa.Column("paid", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("color", sa.Text, nullable=True),
        sa.Column("is_medical", sa.Boolean, nullable=False, server_default=sa.false()),
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
        sa.UniqueConstraint("tenant_id", "code", name="uq_leave_types_tenant_code"),
        schema="public",
    )
    op.create_index(
        "ix_leave_types_tenant", "leave_types", ["tenant_id"], schema="public"
    )

    op.create_table(
        "leave_requests",
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
        sa.Column(
            "leave_type_id",
            sa.BigInteger,
            sa.ForeignKey("public.leave_types.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("start_date", sa.Date, nullable=False),
        sa.Column("end_date", sa.Date, nullable=False),
        sa.Column("days", sa.Numeric(5, 2), nullable=False),
        sa.Column("status", sa.Text, nullable=False, server_default="draft"),
        sa.Column("reason", sa.Text, nullable=True),
        sa.Column("reason_encrypted", sa.LargeBinary, nullable=True),
        sa.Column(
            "approved_by",
            sa.BigInteger,
            sa.ForeignKey("public.employees.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
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
        sa.CheckConstraint(
            "status IN ('draft','submitted','approved','rejected')",
            name="ck_leave_requests_status",
        ),
        schema="public",
    )
    op.create_index(
        "ix_leave_requests_tenant",
        "leave_requests",
        ["tenant_id"],
        schema="public",
    )
    op.create_index(
        "ix_leave_requests_employee",
        "leave_requests",
        ["employee_id"],
        schema="public",
    )
    op.create_index(
        "ix_leave_requests_status",
        "leave_requests",
        ["tenant_id", "status"],
        schema="public",
    )

    op.create_table(
        "leave_balances",
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
        sa.Column(
            "leave_type_id",
            sa.BigInteger,
            sa.ForeignKey("public.leave_types.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("year", sa.Integer, nullable=False),
        sa.Column("accrued", sa.Numeric(5, 2), nullable=False, server_default="0"),
        sa.Column("used", sa.Numeric(5, 2), nullable=False, server_default="0"),
        sa.Column("pending", sa.Numeric(5, 2), nullable=False, server_default="0"),
        sa.Column("balance", sa.Numeric(5, 2), nullable=False, server_default="0"),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.PrimaryKeyConstraint(
            "employee_id", "leave_type_id", "year", name="pk_leave_balances"
        ),
        sa.CheckConstraint("balance >= 0", name="ck_leave_balances_nonnegative"),
        schema="public",
    )
    op.create_index(
        "ix_leave_balances_tenant",
        "leave_balances",
        ["tenant_id"],
        schema="public",
    )


def downgrade() -> None:
    op.drop_index(
        "ix_leave_balances_tenant",
        table_name="leave_balances",
        schema="public",
    )
    op.drop_table("leave_balances", schema="public")

    op.drop_index(
        "ix_leave_requests_status",
        table_name="leave_requests",
        schema="public",
    )
    op.drop_index(
        "ix_leave_requests_employee",
        table_name="leave_requests",
        schema="public",
    )
    op.drop_index(
        "ix_leave_requests_tenant",
        table_name="leave_requests",
        schema="public",
    )
    op.drop_table("leave_requests", schema="public")

    op.drop_index("ix_leave_types_tenant", table_name="leave_types", schema="public")
    op.drop_table("leave_types", schema="public")
