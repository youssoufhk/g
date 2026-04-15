"""Cloudflare WAF operations (stub, implementation planned Phase 2 week 1 end).

Owns custom WAF rule creation, managed ruleset enablement, and listing.
"""

from __future__ import annotations

from typing import Any

from gamma_ops.logging import get_logger

log = get_logger(__name__, component="cloudflare.waf")


def create_rule(
    description: str,
    expression: str,
    action: str = "block",
    zone_id: str | None = None,
) -> dict[str, Any]:
    """Create a custom WAF rule. Idempotent.

    Purpose:
        Implement the Gamma-specific rules: block non-EU IPs on operator
        console, rate limit /api/auth/*, block known-bad user agents.

    Parameters:
        description: Human-readable rule description.
        expression: Cloudflare rule expression (Ruleset engine syntax).
        action: block, challenge, managed_challenge, log, skip.
        zone_id: Cloudflare zone ID.

    Returns:
        Dict with rule metadata.

    Raises:
        NotImplementedError: Phase 2 week 1 end.

    Idempotency notes:
        Rules are deduplicated by description within the same phase ruleset.
    """
    raise NotImplementedError("cloudflare.waf.create_rule planned for Phase 2 week 1 end")


def list_rules(zone_id: str | None = None) -> list[dict[str, Any]]:
    """List custom WAF rules on the zone.

    Parameters:
        zone_id: Cloudflare zone ID.

    Returns:
        List of rule dicts.

    Raises:
        NotImplementedError: Phase 2 week 1 end.
    """
    raise NotImplementedError("cloudflare.waf.list_rules planned for Phase 2 week 1 end")


def enable_managed_ruleset(
    ruleset_id: str,
    zone_id: str | None = None,
) -> None:
    """Enable a Cloudflare Managed Ruleset.

    Purpose:
        Enable the Cloudflare Managed OWASP Core Ruleset and the Cloudflare
        Managed Free Ruleset on the Gamma zone.

    Parameters:
        ruleset_id: Managed ruleset ID.
        zone_id: Cloudflare zone ID.

    Raises:
        NotImplementedError: Phase 2 week 1 end.

    Idempotency notes:
        Enabling an already-enabled ruleset is a no-op.
    """
    raise NotImplementedError("cloudflare.waf.enable_managed_ruleset planned for Phase 2 week 1 end")
