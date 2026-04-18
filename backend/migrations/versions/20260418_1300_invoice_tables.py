"""phase 5a invoices: invoices + invoice_lines + invoice_payments + invoice_sequences

Revision ID: 20260418_1300
Revises: 20260418_1200
Create Date: 2026-04-18 13:00:00

Creates the four-table invoicing core per `specs/DATA_ARCHITECTURE.md`
section 2.11.

* `invoices` - soft-delete + version-locked. status state machine
  draft/sent/viewed/paid/overdue/void. UNIQUE(tenant_id, number) so
  French DGFIP fiscal compliance (no gap-less reuse) is DB-enforced.
* `invoice_lines` - version-locked children, one FK per source
  (project/timesheet_entry/expense/milestone).
* `invoice_payments` - append-only partial payments, method enum.
* `invoice_sequences` - `(tenant_id, year, next_value)` counter that
  resets on January 1 in tenant-local time.

Tenancy follows the Phase 4 pattern (public schema + `tenant_id`
column). ADR-001 schema-per-tenant graduation is tracked separately
under the D15 rework.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260418_1300"
down_revision: str | Sequence[str] | None = "20260418_1200"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "invoice_sequences",
        sa.Column(
            "tenant_id",
            sa.BigInteger,
            sa.ForeignKey("public.tenants.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("year", sa.Integer, nullable=False),
        sa.Column("next_value", sa.Integer, nullable=False, server_default="1"),
        sa.PrimaryKeyConstraint("tenant_id", "year", name="pk_invoice_sequences"),
        sa.CheckConstraint("next_value >= 1", name="ck_invoice_sequences_next_value"),
        schema="public",
    )

    op.create_table(
        "invoices",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column(
            "tenant_id",
            sa.BigInteger,
            sa.ForeignKey("public.tenants.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "client_id",
            sa.BigInteger,
            sa.ForeignKey("public.clients.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("number", sa.Text, nullable=False),
        sa.Column("issue_date", sa.Date, nullable=False),
        sa.Column("due_date", sa.Date, nullable=False),
        sa.Column("status", sa.Text, nullable=False, server_default="draft"),
        sa.Column("currency", sa.Text, nullable=False, server_default="EUR"),
        sa.Column("fx_rate_to_base", sa.Numeric(18, 8), nullable=True),
        sa.Column(
            "subtotal_cents", sa.BigInteger, nullable=False, server_default="0"
        ),
        sa.Column(
            "tax_total_cents", sa.BigInteger, nullable=False, server_default="0"
        ),
        sa.Column("total_cents", sa.BigInteger, nullable=False, server_default="0"),
        sa.Column("tax_mention", sa.Text, nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "pdf_status", sa.Text, nullable=False, server_default="pending"
        ),
        sa.Column("pdf_url", sa.Text, nullable=True),
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
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("tenant_id", "number", name="uq_invoices_tenant_number"),
        sa.CheckConstraint(
            "status IN ('draft','sent','viewed','paid','overdue','void')",
            name="ck_invoices_status",
        ),
        sa.CheckConstraint(
            "pdf_status IN ('pending','ready','failed')",
            name="ck_invoices_pdf_status",
        ),
        sa.CheckConstraint(
            "total_cents = subtotal_cents + tax_total_cents",
            name="ck_invoices_total_matches_components",
        ),
        schema="public",
    )
    op.create_index(
        "ix_invoices_tenant", "invoices", ["tenant_id"], schema="public"
    )
    op.create_index(
        "ix_invoices_client", "invoices", ["client_id"], schema="public"
    )
    op.create_index(
        "ix_invoices_status",
        "invoices",
        ["tenant_id", "status"],
        schema="public",
    )
    op.create_index(
        "ix_invoices_issue_date", "invoices", ["issue_date"], schema="public"
    )

    op.create_table(
        "invoice_lines",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column(
            "tenant_id",
            sa.BigInteger,
            sa.ForeignKey("public.tenants.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "invoice_id",
            sa.BigInteger,
            sa.ForeignKey("public.invoices.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("quantity", sa.Numeric(12, 4), nullable=False),
        sa.Column("unit", sa.Text, nullable=False, server_default="day"),
        sa.Column("unit_price_cents", sa.BigInteger, nullable=False),
        sa.Column("amount_cents", sa.BigInteger, nullable=False),
        sa.Column("tax_rate", sa.Numeric(5, 4), nullable=False, server_default="0"),
        sa.Column(
            "tax_amount_cents", sa.BigInteger, nullable=False, server_default="0"
        ),
        sa.Column(
            "project_id",
            sa.BigInteger,
            sa.ForeignKey("public.projects.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "timesheet_entry_id",
            sa.BigInteger,
            sa.ForeignKey("public.timesheet_entries.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "expense_id",
            sa.BigInteger,
            sa.ForeignKey("public.expenses.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("milestone_id", sa.BigInteger, nullable=True),
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
            "unit IN ('day','half_day','hour','fixed','expense')",
            name="ck_invoice_lines_unit",
        ),
        schema="public",
    )
    op.create_index(
        "ix_invoice_lines_invoice",
        "invoice_lines",
        ["invoice_id"],
        schema="public",
    )
    op.create_index(
        "ix_invoice_lines_tenant",
        "invoice_lines",
        ["tenant_id"],
        schema="public",
    )

    op.create_table(
        "invoice_payments",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column(
            "tenant_id",
            sa.BigInteger,
            sa.ForeignKey("public.tenants.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "invoice_id",
            sa.BigInteger,
            sa.ForeignKey("public.invoices.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("amount_cents", sa.BigInteger, nullable=False),
        sa.Column("currency", sa.Text, nullable=False, server_default="EUR"),
        sa.Column("method", sa.Text, nullable=False),
        sa.Column("reference", sa.Text, nullable=True),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.CheckConstraint(
            "method IN ('wire','sepa','card','cash','other')",
            name="ck_invoice_payments_method",
        ),
        sa.CheckConstraint(
            "amount_cents > 0", name="ck_invoice_payments_amount_positive"
        ),
        schema="public",
    )
    op.create_index(
        "ix_invoice_payments_invoice",
        "invoice_payments",
        ["invoice_id"],
        schema="public",
    )


def downgrade() -> None:
    op.drop_index(
        "ix_invoice_payments_invoice",
        table_name="invoice_payments",
        schema="public",
    )
    op.drop_table("invoice_payments", schema="public")

    op.drop_index(
        "ix_invoice_lines_tenant", table_name="invoice_lines", schema="public"
    )
    op.drop_index(
        "ix_invoice_lines_invoice", table_name="invoice_lines", schema="public"
    )
    op.drop_table("invoice_lines", schema="public")

    op.drop_index(
        "ix_invoices_issue_date", table_name="invoices", schema="public"
    )
    op.drop_index("ix_invoices_status", table_name="invoices", schema="public")
    op.drop_index("ix_invoices_client", table_name="invoices", schema="public")
    op.drop_index("ix_invoices_tenant", table_name="invoices", schema="public")
    op.drop_table("invoices", schema="public")

    op.drop_table("invoice_sequences", schema="public")
