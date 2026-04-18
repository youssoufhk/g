"""phase 3b confidential tier: employee_compensation + employee_banking
+ employees.protected_status_encrypted

Revision ID: 20260418_1500
Revises: 20260418_1400
Create Date: 2026-04-18 15:00:00

Creates the Confidential-tier tables and columns per
``specs/DATA_ARCHITECTURE.md`` section 2.6 + section 8.1. Four pieces:

* ``public.employee_compensation`` - salary / bonus / pay_period history.
  Physically split from ``employees`` so a rogue SQL read of the core
  table cannot leak money. Every service-layer read writes a
  ``compensation.read`` audit row.
* ``public.employee_banking`` - iban + bic + account_holder. Encrypted
  columns are ``BYTEA`` so the app layer can wrap them with
  ``pgp_sym_encrypt`` in Phase 7 without an ALTER.
* ``employees.protected_status_encrypted`` ``BYTEA`` - Art. 9 sensitive
  data (disability, trade-union membership, etc.). Added as a nullable
  column so the rollout is non-breaking.
* ``leave_requests.reason_encrypted`` already shipped in
  ``20260418_1000_leave_tables.py``; no change here.

Encryption: CMEK lands in Phase 7 with the Cloud KMS keyring. Until
then the column type is in place so the shape is forwards-compatible;
a pgcrypto-backed stub ``encrypt_column()`` wrapper will follow in a
sibling commit in ``backend/app/core/crypto.py``.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260418_1500"
down_revision: str | Sequence[str] | None = "20260418_1400"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # ----- employees.protected_status_encrypted ---------------------------
    op.add_column(
        "employees",
        sa.Column("protected_status_encrypted", sa.LargeBinary, nullable=True),
        schema="public",
    )

    # ----- employee_compensation ------------------------------------------
    op.create_table(
        "employee_compensation",
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
        sa.Column("effective_from", sa.Date, nullable=False),
        sa.Column("salary_cents", sa.BigInteger, nullable=False),
        sa.Column("currency", sa.String(3), nullable=False),
        sa.Column("pay_period", sa.Text, nullable=False),
        sa.Column(
            "bonus_cents",
            sa.BigInteger,
            nullable=False,
            server_default="0",
        ),
        sa.Column("notes_encrypted", sa.LargeBinary, nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "created_by",
            sa.BigInteger,
            sa.ForeignKey("public.employees.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.CheckConstraint(
            "pay_period IN ('monthly','annual')",
            name="ck_employee_compensation_pay_period",
        ),
        sa.CheckConstraint(
            "salary_cents >= 0",
            name="ck_employee_compensation_salary_nonneg",
        ),
        sa.CheckConstraint(
            "bonus_cents >= 0",
            name="ck_employee_compensation_bonus_nonneg",
        ),
        schema="public",
    )
    op.create_index(
        "ix_employee_compensation_employee",
        "employee_compensation",
        ["employee_id", "effective_from"],
        schema="public",
    )
    op.create_index(
        "ix_employee_compensation_tenant",
        "employee_compensation",
        ["tenant_id"],
        schema="public",
    )

    # ----- employee_banking -----------------------------------------------
    op.create_table(
        "employee_banking",
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
        sa.Column("iban_encrypted", sa.LargeBinary, nullable=False),
        sa.Column("bic_encrypted", sa.LargeBinary, nullable=False),
        sa.Column("account_holder_encrypted", sa.LargeBinary, nullable=False),
        sa.Column("bank_name", sa.Text, nullable=True),
        sa.Column("currency", sa.String(3), nullable=False),
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
            "tenant_id", "employee_id", name="uq_employee_banking_tenant_employee"
        ),
        schema="public",
    )
    op.create_index(
        "ix_employee_banking_tenant",
        "employee_banking",
        ["tenant_id"],
        schema="public",
    )


def downgrade() -> None:
    op.drop_index(
        "ix_employee_banking_tenant",
        table_name="employee_banking",
        schema="public",
    )
    op.drop_table("employee_banking", schema="public")

    op.drop_index(
        "ix_employee_compensation_tenant",
        table_name="employee_compensation",
        schema="public",
    )
    op.drop_index(
        "ix_employee_compensation_employee",
        table_name="employee_compensation",
        schema="public",
    )
    op.drop_table("employee_compensation", schema="public")

    op.drop_column(
        "employees", "protected_status_encrypted", schema="public"
    )
