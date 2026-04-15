"""seed dev tenant + admin user

Revision ID: 20260416_0910
Revises: 20260416_0900
Create Date: 2026-04-16 09:10:00

Dev-only seed: creates the ``t_dev`` tenant row + an initial admin user
so that immediately after ``make mvp-up`` the founder can curl
/api/v1/auth/login and get a working token.

Credentials (dev only, never ship to staging or prod):
    email:    admin@gamma.local
    password: gamma_dev_password
    tenant:   t_dev
    role:     owner

The password hash is pre-computed with passlib's bcrypt so the
migration runs without importing any part of the app. If you re-hash,
run inside the backend container:
    from passlib.context import CryptContext
    CryptContext(schemes=['bcrypt']).hash('gamma_dev_password')

This migration is idempotent. It will not overwrite a row that already
exists with the same email or schema name.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260416_0910"
down_revision: str | Sequence[str] | None = "20260416_0900"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# pre-computed bcrypt hash of 'gamma_dev_password' with a low cost factor
# (rounds=10). Regenerate locally if you change the dev password.
DEV_ADMIN_PASSWORD_HASH = (
    "$2b$10$U9Mbo2rT8dhSWzARx3tZnOT0DGRBU/fKZYxi0Ad1JzdrMEfyVjvBW"
)


def upgrade() -> None:
    conn = op.get_bind()

    # Insert the dev tenant. ON CONFLICT on schema_name is safe since that
    # column is UNIQUE.
    conn.execute(
        sa.text(
            """
            INSERT INTO public.tenants (
                schema_name, display_name, residency_region,
                legal_jurisdiction, base_currency, primary_locale,
                supported_locales, status
            ) VALUES (
                't_dev', 'Gamma Dev Tenant', 'eu-west9',
                'FR', 'EUR', 'en-GB',
                ARRAY['en-GB','fr-FR']::text[], 'active'
            )
            ON CONFLICT (schema_name) DO NOTHING
            """
        )
    )

    # Create the tenant schema so tenant-scoped migrations (Phase 4+) can
    # target it via ``alembic -x tenant=t_dev upgrade head``.
    conn.execute(sa.text('CREATE SCHEMA IF NOT EXISTS "t_dev"'))

    # Insert the dev admin user.
    conn.execute(
        sa.text(
            """
            INSERT INTO public.app_users (
                email, password_hash, display_name, locale, status
            ) VALUES (
                'admin@gamma.local', :password_hash, 'Dev Admin',
                'en-GB', 'active'
            )
            ON CONFLICT (email) DO NOTHING
            """
        ),
        {"password_hash": DEV_ADMIN_PASSWORD_HASH},
    )

    # Link the admin to the dev tenant as owner.
    conn.execute(
        sa.text(
            """
            INSERT INTO public.tenant_memberships (user_id, tenant_id, role)
            SELECT u.id, t.id, 'owner'
            FROM public.app_users u
            CROSS JOIN public.tenants t
            WHERE u.email = 'admin@gamma.local'
              AND t.schema_name = 't_dev'
            ON CONFLICT (user_id, tenant_id) DO NOTHING
            """
        )
    )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        sa.text(
            """
            DELETE FROM public.tenant_memberships
            WHERE user_id IN (SELECT id FROM public.app_users WHERE email = 'admin@gamma.local')
            """
        )
    )
    conn.execute(
        sa.text("DELETE FROM public.app_users WHERE email = 'admin@gamma.local'")
    )
    conn.execute(sa.text('DROP SCHEMA IF EXISTS "t_dev" CASCADE'))
    conn.execute(sa.text("DELETE FROM public.tenants WHERE schema_name = 't_dev'"))
