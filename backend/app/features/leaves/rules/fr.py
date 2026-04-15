"""France leave rules skeleton.

Phase 5 fills in:
    * Congés payés (5 weeks/year, 2.5 days per month worked)
    * RTT (varies by convention collective)
    * Jours fériés non ouvrés (handled via country_holidays table)
    * Conventions collectives: specific top-ups per branch
"""

from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True)
class FranceLeaveRule:
    country_code: str = "FR"
    annual_days: Decimal = Decimal("25")
    accrual_per_month: Decimal = Decimal("2.08")
    uses_working_days: bool = True
    counts_public_holidays_as_worked: bool = False
