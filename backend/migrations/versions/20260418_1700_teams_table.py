"""phase 5a teams: public.teams + employees.team_id + projects.team_id

Revision ID: 20260418_1700
Revises: 20260418_1600
Create Date: 2026-04-18 17:00:00

Introduces the `public.teams` table and links employees + projects to
it so the seed data is no longer a pile of standalone CSVs:

  * `public.teams (id, tenant_id, name, lead_employee_id, created_at)`
  * `public.employees.team_id` (nullable FK, keeps the legacy `team`
    text column populated as a label for backwards-compat with existing
    queries).
  * `public.projects.team_id` (nullable FK, the delivery team that
    owns the engagement).

Both new FKs use `ON DELETE SET NULL` so team deletion never cascades
into employees or projects.
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260418_1700"
down_revision: str | Sequence[str] | None = "20260418_1600"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "teams",
        sa.Column("id", sa.BigInteger, primary_key=True),
        sa.Column(
            "tenant_id",
            sa.BigInteger,
            sa.ForeignKey("tenants.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.Text, nullable=False),
        sa.Column(
            "lead_employee_id",
            sa.BigInteger,
            sa.ForeignKey("employees.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.UniqueConstraint("tenant_id", "name", name="teams_tenant_name_unique"),
    )
    op.create_index("ix_teams_tenant", "teams", ["tenant_id"])

    op.add_column(
        "employees",
        sa.Column(
            "team_id",
            sa.BigInteger,
            sa.ForeignKey("teams.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    op.create_index("ix_employees_team", "employees", ["team_id"])

    op.add_column(
        "projects",
        sa.Column(
            "team_id",
            sa.BigInteger,
            sa.ForeignKey("teams.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    op.create_index("ix_projects_team", "projects", ["team_id"])


def downgrade() -> None:
    op.drop_index("ix_projects_team", table_name="projects")
    op.drop_column("projects", "team_id")
    op.drop_index("ix_employees_team", table_name="employees")
    op.drop_column("employees", "team_id")
    op.drop_index("ix_teams_tenant", table_name="teams")
    op.drop_table("teams")
