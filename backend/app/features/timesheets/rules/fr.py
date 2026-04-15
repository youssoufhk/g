"""France timesheet rules skeleton.

Phase 5 fills in:
    * 35-hour legal work week
    * Forfait jours (daily-count cadre) with 218 days/year cap
    * Maximum 48h/week, 44h average over 12 weeks
    * Sunday and night hours premium rates per convention collective
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class FranceTimesheetRule:
    country_code: str = "FR"
    legal_weekly_hours: float = 35.0
    max_weekly_hours: float = 48.0
    max_average_hours_12_weeks: float = 44.0
    default_unit: str = "day"
