"""auth tables: app_users, tenant_memberships, app_user_sessions

Revision ID: 20260416_0900
Revises: 20260415_1905
Create Date: 2026-04-16 09:00:00

Creates the identity tables for the main app (ADR-010 audience="app"):

* public.app_users          global account, one row per unique email
* public.tenant_memberships user to tenant role assignments
* public.app_user_sessions  refresh token tracking + session invalidation

Identity is NOT schema-per-tenant. A single user can belong to multiple
tenants (a consultant working at two firms, a founder at their own firm
plus a client's firm). Per-tenant DATA (employees, clients, projects,
invoices, ...) lives in t_<slug> schemas and ships with the feature
modules in Phase 4 and 5. Identity stays global so login works before
the user has a tenant context.

ops_users + operator_sessions ship in a later migration alongside the
passkey/MFA work (Phase 3b). portal_contacts ships in Phase 6 when the
client portal lands.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260416_0900"
down_revision: str | Sequence[str] | None = "20260415_1905"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "app_users",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column("email", sa.Text, nullable=False),
        sa.Column("password_hash", sa.Text, nullable=False),
        sa.Column("display_name", sa.Text, nullable=False),
        sa.Column("locale", sa.Text, nullable=False, server_default="en-GB"),
        sa.Column("oidc_subject", sa.Text, nullable=True),
        sa.Column("oidc_provider", sa.Text, nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "last_login_at",
            sa.TIMESTAMP(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "status",
            sa.Text,
            nullable=False,
            server_default="active",
        ),
        sa.CheckConstraint(
            "status IN ('active','suspended','deleted')",
            name="app_users_status_values",
        ),
        sa.UniqueConstraint("email", name="app_users_email_unique"),
        sa.UniqueConstraint(
            "oidc_provider",
            "oidc_subject",
            name="app_users_oidc_unique",
        ),
        schema="public",
    )
    op.create_index(
        "ix_app_users_email",
        "app_users",
        ["email"],
        schema="public",
    )

    op.create_table(
        "tenant_memberships",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column(
            "user_id",
            sa.BigInteger,
            sa.ForeignKey("public.app_users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "tenant_id",
            sa.BigInteger,
            sa.ForeignKey("public.tenants.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("role", sa.Text, nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.CheckConstraint(
            "role IN ('owner','admin','finance','manager','employee','readonly')",
            name="tenant_memberships_role_values",
        ),
        sa.UniqueConstraint(
            "user_id", "tenant_id", name="tenant_memberships_unique"
        ),
        schema="public",
    )
    op.create_index(
        "ix_tenant_memberships_user_id",
        "tenant_memberships",
        ["user_id"],
        schema="public",
    )
    op.create_index(
        "ix_tenant_memberships_tenant_id",
        "tenant_memberships",
        ["tenant_id"],
        schema="public",
    )

    op.create_table(
        "app_user_sessions",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column(
            "user_id",
            sa.BigInteger,
            sa.ForeignKey("public.app_users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("refresh_token_hash", sa.Text, nullable=False),
        sa.Column("user_agent", sa.Text, nullable=True),
        sa.Column("ip_address", sa.Text, nullable=True),
        sa.Column(
            "issued_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column(
            "expires_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
        ),
        sa.Column(
            "revoked_at",
            sa.TIMESTAMP(timezone=True),
            nullable=True,
        ),
        sa.UniqueConstraint(
            "refresh_token_hash", name="app_user_sessions_refresh_unique"
        ),
        schema="public",
    )
    op.create_index(
        "ix_app_user_sessions_user_id",
        "app_user_sessions",
        ["user_id"],
        schema="public",
    )
    op.create_index(
        "ix_app_user_sessions_expires_at",
        "app_user_sessions",
        ["expires_at"],
        schema="public",
    )


def downgrade() -> None:
    op.drop_index(
        "ix_app_user_sessions_expires_at",
        table_name="app_user_sessions",
        schema="public",
    )
    op.drop_index(
        "ix_app_user_sessions_user_id",
        table_name="app_user_sessions",
        schema="public",
    )
    op.drop_table("app_user_sessions", schema="public")

    op.drop_index(
        "ix_tenant_memberships_tenant_id",
        table_name="tenant_memberships",
        schema="public",
    )
    op.drop_index(
        "ix_tenant_memberships_user_id",
        table_name="tenant_memberships",
        schema="public",
    )
    op.drop_table("tenant_memberships", schema="public")

    op.drop_index("ix_app_users_email", table_name="app_users", schema="public")
    op.drop_table("app_users", schema="public")
