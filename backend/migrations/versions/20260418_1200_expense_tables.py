"""phase 5a expenses: expense_categories + expenses

Revision ID: 20260418_1200
Revises: 20260418_1100
Create Date: 2026-04-18 12:00:00

Creates the two-table expenses core per `specs/DATA_ARCHITECTURE.md`
section 2.10. The receipts sidecar (`expense_receipts`) is deferred
until `public.files` lands so the OCR pipeline has a parent row to
point at. The core approval+reimbursement state machines are covered
by the columns shipped here.

Tenancy follows the Phase 4 pattern (public schema + `tenant_id`
column). ADR-001 schema-per-tenant graduation is tracked separately
under the D15 rework.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260418_1200"
down_revision: str | Sequence[str] | None = "20260418_1100"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "expense_categories",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column(
            "tenant_id",
            sa.BigInteger,
            sa.ForeignKey("public.tenants.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.Text, nullable=False),
        sa.Column("code", sa.Text, nullable=False),
        sa.Column("gl_account", sa.Text, nullable=True),
        sa.Column("tax_rate", sa.Numeric(5, 4), nullable=False, server_default="0"),
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
            "tenant_id", "code", name="uq_expense_categories_tenant_code"
        ),
        schema="public",
    )
    op.create_index(
        "ix_expense_categories_tenant",
        "expense_categories",
        ["tenant_id"],
        schema="public",
    )

    op.create_table(
        "expenses",
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
            "category_id",
            sa.BigInteger,
            sa.ForeignKey("public.expense_categories.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column(
            "project_id",
            sa.BigInteger,
            sa.ForeignKey("public.projects.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "client_id",
            sa.BigInteger,
            sa.ForeignKey("public.clients.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("expense_date", sa.Date, nullable=False),
        sa.Column("merchant", sa.Text, nullable=True),
        sa.Column("amount_cents", sa.BigInteger, nullable=False),
        sa.Column("currency", sa.Text, nullable=False, server_default="EUR"),
        sa.Column("tax_amount_cents", sa.BigInteger, nullable=False, server_default="0"),
        sa.Column("exchange_rate", sa.Numeric(18, 8), nullable=True),
        sa.Column("status", sa.Text, nullable=False, server_default="draft"),
        sa.Column(
            "approved_by",
            sa.BigInteger,
            sa.ForeignKey("public.employees.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("rejection_reason", sa.Text, nullable=True),
        sa.Column(
            "reimbursement_status",
            sa.Text,
            nullable=False,
            server_default="pending",
        ),
        sa.Column("reimbursed_at", sa.DateTime(timezone=True), nullable=True),
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
            name="ck_expenses_status",
        ),
        sa.CheckConstraint(
            "reimbursement_status IN ('pending','paid','na')",
            name="ck_expenses_reimbursement_status",
        ),
        sa.CheckConstraint("amount_cents >= 0", name="ck_expenses_amount_nonnegative"),
        schema="public",
    )
    op.create_index(
        "ix_expenses_tenant", "expenses", ["tenant_id"], schema="public"
    )
    op.create_index(
        "ix_expenses_employee_date",
        "expenses",
        ["employee_id", "expense_date"],
        schema="public",
    )
    op.create_index(
        "ix_expenses_status",
        "expenses",
        ["tenant_id", "status"],
        schema="public",
    )
    op.create_index(
        "ix_expenses_project",
        "expenses",
        ["project_id"],
        schema="public",
    )


def downgrade() -> None:
    op.drop_index("ix_expenses_project", table_name="expenses", schema="public")
    op.drop_index("ix_expenses_status", table_name="expenses", schema="public")
    op.drop_index(
        "ix_expenses_employee_date", table_name="expenses", schema="public"
    )
    op.drop_index("ix_expenses_tenant", table_name="expenses", schema="public")
    op.drop_table("expenses", schema="public")

    op.drop_index(
        "ix_expense_categories_tenant",
        table_name="expense_categories",
        schema="public",
    )
    op.drop_table("expense_categories", schema="public")
