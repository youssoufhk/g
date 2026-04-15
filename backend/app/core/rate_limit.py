"""Fixed-window rate limiter backed by Redis (stub for §3.2).

Real implementation ships in Phase 3 auth hardening. For the skeleton we
keep a typed interface so callers can depend on it today without pulling
Redis into unit tests.
"""

from dataclasses import dataclass
from typing import Protocol


@dataclass
class RateLimitDecision:
    allowed: bool
    remaining: int
    reset_in_seconds: int


class RateLimiter(Protocol):
    async def check(self, *, key: str, limit: int, window_seconds: int) -> RateLimitDecision:
        ...


class NullRateLimiter:
    """Dev stub: never rate limits. Replace with Redis impl in Phase 3."""

    async def check(
        self, *, key: str, limit: int, window_seconds: int
    ) -> RateLimitDecision:
        return RateLimitDecision(allowed=True, remaining=limit, reset_in_seconds=window_seconds)
