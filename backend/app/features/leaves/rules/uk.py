"""UK leave rules skeleton.

Phase 5 fills in:
    * Statutory minimum 28 days including bank holidays (Working Time
      Regulations 1998, as amended)
    * Pro-rata accrual for part-time
    * Bank holidays typically included in the 28 days
"""

from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True)
class UKLeaveRule:
    country_code: str = "GB"
    annual_days: Decimal = Decimal("28")
    accrual_per_month: Decimal = Decimal("2.33")
    uses_working_days: bool = True
    counts_public_holidays_as_worked: bool = True
