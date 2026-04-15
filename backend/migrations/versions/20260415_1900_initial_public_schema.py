"""initial public schema: tenants, country_holidays, audit_log, append-only trigger

Revision ID: 20260415_1900
Revises:
Create Date: 2026-04-15 19:00:00

This migration creates the shared ``public`` tables that every tenant
schema references:

    * ``tenants``           - tenant registry (ADR-001, spec section 2)
    * ``country_holidays``  - shared holiday calendar (spec section 15)
    * ``audit_log``         - append-only audit log with a trigger that
                              rejects UPDATE and DELETE at the DB level (M4)

Tenant-specific tables are created by later migrations run with
``alembic -x tenant=<schema> upgrade head`` (§3.2 tenant provisioning).
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260415_1900"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "tenants",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column("schema_name", sa.Text, nullable=False, unique=True),
        sa.Column("display_name", sa.Text, nullable=False),
        sa.Column("residency_region", sa.Text, nullable=False, server_default="eu-west9"),
        sa.Column("legal_jurisdiction", sa.Text, nullable=False),
        sa.Column("base_currency", sa.Text, nullable=False),
        sa.Column("primary_locale", sa.Text, nullable=False, server_default="en-GB"),
        sa.Column(
            "supported_locales",
            sa.ARRAY(sa.Text),
            nullable=False,
            server_default=sa.text("ARRAY['en-GB']::text[]"),
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "status",
            sa.Text,
            nullable=False,
            server_default="active",
        ),
        sa.CheckConstraint(
            "schema_name ~ '^t_[a-z0-9_]{1,48}$'",
            name="tenants_schema_name_shape",
        ),
        sa.CheckConstraint(
            "status IN ('provisioning','active','suspended','legal_hold','offboarded')",
            name="tenants_status_values",
        ),
        schema="public",
    )

    op.create_table(
        "country_holidays",
        sa.Column("country_code", sa.Text, nullable=False),
        sa.Column("date", sa.Date, nullable=False),
        sa.Column("name", sa.Text, nullable=False),
        sa.Column("kind", sa.Text, nullable=False),
        sa.PrimaryKeyConstraint("country_code", "date", name="country_holidays_pk"),
        sa.CheckConstraint(
            "kind IN ('public','bank','regional')",
            name="country_holidays_kind_values",
        ),
        schema="public",
    )

    op.create_table(
        "audit_log",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("actor_id", sa.Text, nullable=False),
        sa.Column("actor_audience", sa.Text, nullable=False),
        sa.Column("action", sa.Text, nullable=False),
        sa.Column("entity_type", sa.Text, nullable=False),
        sa.Column("entity_id", sa.Text, nullable=True),
        sa.Column("payload", sa.JSON, nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column(
            "occurred_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.CheckConstraint(
            "actor_audience IN ('ops','app','portal','system')",
            name="audit_log_audience_values",
        ),
        schema="public",
    )
    op.create_index(
        "ix_audit_log_entity",
        "audit_log",
        ["entity_type", "entity_id"],
        schema="public",
    )
    op.create_index(
        "ix_audit_log_occurred_at",
        "audit_log",
        ["occurred_at"],
        schema="public",
    )

    # Append-only trigger: reject UPDATE and DELETE at the database level (M4).
    op.execute(
        """
        CREATE OR REPLACE FUNCTION public.audit_log_reject_mutation()
        RETURNS trigger AS $$
        BEGIN
            RAISE EXCEPTION 'audit_log is append-only: % is forbidden', TG_OP;
        END;
        $$ LANGUAGE plpgsql;
        """
    )
    op.execute(
        """
        CREATE TRIGGER audit_log_no_update
            BEFORE UPDATE ON public.audit_log
            FOR EACH ROW EXECUTE FUNCTION public.audit_log_reject_mutation();
        """
    )
    op.execute(
        """
        CREATE TRIGGER audit_log_no_delete
            BEFORE DELETE ON public.audit_log
            FOR EACH ROW EXECUTE FUNCTION public.audit_log_reject_mutation();
        """
    )


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS audit_log_no_delete ON public.audit_log")
    op.execute("DROP TRIGGER IF EXISTS audit_log_no_update ON public.audit_log")
    op.execute("DROP FUNCTION IF EXISTS public.audit_log_reject_mutation()")
    op.drop_index("ix_audit_log_occurred_at", table_name="audit_log", schema="public")
    op.drop_index("ix_audit_log_entity", table_name="audit_log", schema="public")
    op.drop_table("audit_log", schema="public")
    op.drop_table("country_holidays", schema="public")
    op.drop_table("tenants", schema="public")
