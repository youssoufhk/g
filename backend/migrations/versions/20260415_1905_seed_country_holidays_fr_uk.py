"""seed country holidays for FR and UK (2026 and 2027)

Revision ID: 20260415_1905
Revises: 20260415_1900
Create Date: 2026-04-15 19:05:00
"""

from collections.abc import Sequence
from datetime import date

import sqlalchemy as sa
from alembic import op

revision: str = "20260415_1905"
down_revision: str | Sequence[str] | None = "20260415_1900"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


# (country_code, date, name, kind)
HOLIDAYS: list[tuple[str, date, str, str]] = [
    ("FR", date(2026, 1, 1), "Jour de l'An", "public"),
    ("FR", date(2026, 4, 6), "Lundi de Paques", "public"),
    ("FR", date(2026, 5, 1), "Fete du Travail", "public"),
    ("FR", date(2026, 5, 8), "Victoire 1945", "public"),
    ("FR", date(2026, 5, 14), "Ascension", "public"),
    ("FR", date(2026, 5, 25), "Lundi de Pentecote", "public"),
    ("FR", date(2026, 7, 14), "Fete Nationale", "public"),
    ("FR", date(2026, 8, 15), "Assomption", "public"),
    ("FR", date(2026, 11, 1), "Toussaint", "public"),
    ("FR", date(2026, 11, 11), "Armistice 1918", "public"),
    ("FR", date(2026, 12, 25), "Noel", "public"),
    ("FR", date(2027, 1, 1), "Jour de l'An", "public"),
    ("FR", date(2027, 3, 29), "Lundi de Paques", "public"),
    ("FR", date(2027, 5, 1), "Fete du Travail", "public"),
    ("FR", date(2027, 5, 6), "Ascension", "public"),
    ("FR", date(2027, 5, 8), "Victoire 1945", "public"),
    ("FR", date(2027, 5, 17), "Lundi de Pentecote", "public"),
    ("FR", date(2027, 7, 14), "Fete Nationale", "public"),
    ("FR", date(2027, 8, 15), "Assomption", "public"),
    ("FR", date(2027, 11, 1), "Toussaint", "public"),
    ("FR", date(2027, 11, 11), "Armistice 1918", "public"),
    ("FR", date(2027, 12, 25), "Noel", "public"),
    ("GB", date(2026, 1, 1), "New Year's Day", "bank"),
    ("GB", date(2026, 4, 3), "Good Friday", "bank"),
    ("GB", date(2026, 4, 6), "Easter Monday", "bank"),
    ("GB", date(2026, 5, 4), "Early May Bank Holiday", "bank"),
    ("GB", date(2026, 5, 25), "Spring Bank Holiday", "bank"),
    ("GB", date(2026, 8, 31), "Summer Bank Holiday", "bank"),
    ("GB", date(2026, 12, 25), "Christmas Day", "bank"),
    ("GB", date(2026, 12, 28), "Boxing Day (substitute)", "bank"),
    ("GB", date(2027, 1, 1), "New Year's Day", "bank"),
    ("GB", date(2027, 3, 26), "Good Friday", "bank"),
    ("GB", date(2027, 3, 29), "Easter Monday", "bank"),
    ("GB", date(2027, 5, 3), "Early May Bank Holiday", "bank"),
    ("GB", date(2027, 5, 31), "Spring Bank Holiday", "bank"),
    ("GB", date(2027, 8, 30), "Summer Bank Holiday", "bank"),
    ("GB", date(2027, 12, 27), "Christmas Day (substitute)", "bank"),
    ("GB", date(2027, 12, 28), "Boxing Day (substitute)", "bank"),
]


def upgrade() -> None:
    conn = op.get_bind()
    for country, holiday_date, name, kind in HOLIDAYS:
        conn.execute(
            sa.text(
                "INSERT INTO public.country_holidays (country_code, date, name, kind) "
                "VALUES (:country, :date, :name, :kind) "
                "ON CONFLICT DO NOTHING"
            ),
            {"country": country, "date": holiday_date, "name": name, "kind": kind},
        )


def downgrade() -> None:
    conn = op.get_bind()
    for country, holiday_date, _name, _kind in HOLIDAYS:
        conn.execute(
            sa.text(
                "DELETE FROM public.country_holidays "
                "WHERE country_code = :country AND date = :date"
            ),
            {"country": country, "date": holiday_date},
        )
