"""phase 4 core data: employees, clients, projects, team_allocations

Revision ID: 20260416_1000
Revises: 20260416_0910
Create Date: 2026-04-16 10:00:00

Creates the core domain tables for Phase 4 + the hooks Phase 5a
timesheets/invoices will read from.

MVP design note on tenancy:
Per ADR-001 the v1.0 aspiration is schema-per-tenant (t_<slug>.employees,
etc.). For the MVP demo path these tables live in the ``public`` schema
with a ``tenant_id`` foreign key and application-layer filtering. This
is strictly simpler: one migration track, no per-tenant schema creation,
one ORM model per table, and SQL injection at the tenancy layer is still
impossible because the tenant_id comes from the JWT claim via
``TenancyMiddleware``.

Migrating to true schema-per-tenant is a Phase 6 hardening option if
pilot data volumes or compliance reviews demand it. The tenancy
middleware and ``SET LOCAL search_path`` plumbing is already in place
so the move is mechanical.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260416_1000"
down_revision: str | Sequence[str] | None = "20260416_0910"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # ----- employees -------------------------------------------------------
    op.create_table(
        "employees",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column(
            "tenant_id",
            sa.BigInteger,
            sa.ForeignKey("public.tenants.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("first_name", sa.Text, nullable=False),
        sa.Column("last_name", sa.Text, nullable=False),
        sa.Column("email", sa.Text, nullable=False),
        sa.Column("role", sa.Text, nullable=False),
        sa.Column("team", sa.Text, nullable=True),
        sa.Column("hire_date", sa.Date, nullable=True),
        sa.Column(
            "manager_employee_id",
            sa.BigInteger,
            sa.ForeignKey("public.employees.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("base_currency", sa.Text, nullable=False, server_default="EUR"),
        sa.Column("status", sa.Text, nullable=False, server_default="active"),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.UniqueConstraint(
            "tenant_id", "email", name="employees_tenant_email_unique"
        ),
        sa.CheckConstraint(
            "status IN ('active','terminated','on_leave')",
            name="employees_status_values",
        ),
        schema="public",
    )
    op.create_index(
        "ix_employees_tenant", "employees", ["tenant_id"], schema="public"
    )

    # ----- clients ---------------------------------------------------------
    op.create_table(
        "clients",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column(
            "tenant_id",
            sa.BigInteger,
            sa.ForeignKey("public.tenants.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.Text, nullable=False),
        sa.Column("country_code", sa.Text, nullable=False),
        sa.Column("currency", sa.Text, nullable=False),
        sa.Column("primary_contact_name", sa.Text, nullable=True),
        sa.Column("primary_contact_email", sa.Text, nullable=True),
        sa.Column(
            "size_band",
            sa.Text,
            nullable=False,
            server_default="mid",
        ),
        sa.Column("status", sa.Text, nullable=False, server_default="active"),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.UniqueConstraint(
            "tenant_id", "name", name="clients_tenant_name_unique"
        ),
        sa.CheckConstraint(
            "size_band IN ('large','mid','small')",
            name="clients_size_band_values",
        ),
        sa.CheckConstraint(
            "status IN ('active','archived','on_hold')",
            name="clients_status_values",
        ),
        schema="public",
    )
    op.create_index(
        "ix_clients_tenant", "clients", ["tenant_id"], schema="public"
    )

    # ----- projects --------------------------------------------------------
    op.create_table(
        "projects",
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
            sa.ForeignKey("public.clients.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.Text, nullable=False),
        sa.Column("status", sa.Text, nullable=False),
        sa.Column("budget_minor_units", sa.BigInteger, nullable=True),
        sa.Column("currency", sa.Text, nullable=False),
        sa.Column("start_date", sa.Date, nullable=True),
        sa.Column("end_date", sa.Date, nullable=True),
        sa.Column(
            "owner_employee_id",
            sa.BigInteger,
            sa.ForeignKey("public.employees.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.CheckConstraint(
            "status IN ('active','completed','pipeline','on_hold')",
            name="projects_status_values",
        ),
        schema="public",
    )
    op.create_index(
        "ix_projects_tenant", "projects", ["tenant_id"], schema="public"
    )
    op.create_index(
        "ix_projects_client", "projects", ["client_id"], schema="public"
    )

    # ----- team_allocations -----------------------------------------------
    op.create_table(
        "team_allocations",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column(
            "tenant_id",
            sa.BigInteger,
            sa.ForeignKey("public.tenants.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "project_id",
            sa.BigInteger,
            sa.ForeignKey("public.projects.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "employee_id",
            sa.BigInteger,
            sa.ForeignKey("public.employees.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("allocation_pct", sa.Integer, nullable=False),
        sa.Column("start_date", sa.Date, nullable=False),
        sa.Column("end_date", sa.Date, nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.CheckConstraint(
            "allocation_pct >= 0 AND allocation_pct <= 100",
            name="team_allocations_pct_range",
        ),
        schema="public",
    )
    op.create_index(
        "ix_team_allocations_project",
        "team_allocations",
        ["project_id"],
        schema="public",
    )
    op.create_index(
        "ix_team_allocations_employee",
        "team_allocations",
        ["employee_id"],
        schema="public",
    )


def downgrade() -> None:
    op.drop_index(
        "ix_team_allocations_employee",
        table_name="team_allocations",
        schema="public",
    )
    op.drop_index(
        "ix_team_allocations_project",
        table_name="team_allocations",
        schema="public",
    )
    op.drop_table("team_allocations", schema="public")

    op.drop_index("ix_projects_client", table_name="projects", schema="public")
    op.drop_index("ix_projects_tenant", table_name="projects", schema="public")
    op.drop_table("projects", schema="public")

    op.drop_index("ix_clients_tenant", table_name="clients", schema="public")
    op.drop_table("clients", schema="public")

    op.drop_index("ix_employees_tenant", table_name="employees", schema="public")
    op.drop_table("employees", schema="public")
