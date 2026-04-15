"""Cloudflare DNS operations (stub, implementation planned Phase 2 week 1 end).

Owns DNS record creation, listing, and deletion on the gammahr.com zone.
Uses the Cloudflare REST API v4 with httpx and the scoped token from
OpsConfig.
"""

from __future__ import annotations

from typing import Any, Literal

from gamma_ops.logging import get_logger

log = get_logger(__name__, component="cloudflare.dns")

RecordType = Literal["A", "AAAA", "CNAME", "TXT", "MX", "NS", "SRV", "CAA"]


def create_record(
    name: str,
    record_type: RecordType,
    content: str,
    ttl: int = 1,  # 1 = automatic in CF
    proxied: bool = True,
    zone_id: str | None = None,
) -> dict[str, Any]:
    """Create or update a DNS record. Idempotent.

    Purpose:
        Provision subdomain records for ops, app, portal, and any API
        endpoints. Defaults to proxied so Cloudflare CDN and WAF sit in front.

    Parameters:
        name: Record name (full subdomain, e.g. `app.gammahr.com`).
        record_type: DNS record type.
        content: Record value (IP address, hostname, or text).
        ttl: TTL in seconds. 1 means automatic.
        proxied: Whether Cloudflare proxies the record (orange cloud).
        zone_id: Cloudflare zone ID. Defaults to OpsConfig.cloudflare_zone_id.

    Returns:
        Dict with record id and metadata.

    Raises:
        CloudflareError: on API failure.
        ConfigError: if no token or zone is configured.
        NotImplementedError: Phase 2 week 1 end.

    Idempotency notes:
        If a record with the same name + type already exists, it is updated
        in place rather than duplicated.
    """
    raise NotImplementedError("cloudflare.dns.create_record planned for Phase 2 week 1 end")


def list_records(
    name_contains: str | None = None,
    zone_id: str | None = None,
) -> list[dict[str, Any]]:
    """List DNS records on the zone, optionally filtered by name substring.

    Parameters:
        name_contains: Optional filter.
        zone_id: Cloudflare zone ID.

    Returns:
        List of record dicts.

    Raises:
        NotImplementedError: Phase 2 week 1 end.
    """
    raise NotImplementedError("cloudflare.dns.list_records planned for Phase 2 week 1 end")


def delete_record(
    record_id: str,
    zone_id: str | None = None,
) -> None:
    """Delete a DNS record by id.

    Parameters:
        record_id: Cloudflare record id.
        zone_id: Cloudflare zone ID.

    Raises:
        NotImplementedError: Phase 2 week 1 end.

    Idempotency notes:
        Deleting a non-existent record raises ResourceNotFound.
    """
    raise NotImplementedError("cloudflare.dns.delete_record planned for Phase 2 week 1 end")
