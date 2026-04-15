"""UK timesheet rules skeleton.

Phase 5 fills in:
    * Working Time Regulations: 48h/week cap (opt-out allowed)
    * Daily rest: 11 consecutive hours
    * Weekly rest: 24 consecutive hours per 7 days
    * No legal maximum for salaried staff beyond the 48h cap
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class UKTimesheetRule:
    country_code: str = "GB"
    max_weekly_hours: float = 48.0
    daily_rest_hours: float = 11.0
    weekly_rest_hours: float = 24.0
    default_unit: str = "day"
