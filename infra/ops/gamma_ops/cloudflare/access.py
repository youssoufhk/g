"""Cloudflare Access operations (stub, implementation planned Phase 2 week 1 end).

Owns Access application and policy creation for the operator console and
staging environment protection.
"""

from __future__ import annotations

from typing import Any

from gamma_ops.logging import get_logger

log = get_logger(__name__, component="cloudflare.access")


def create_policy(
    application_id: str,
    name: str,
    decision: str,  # allow, deny, non_identity, bypass
    include: list[dict[str, Any]],
    require: list[dict[str, Any]] | None = None,
    exclude: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Create a Cloudflare Access policy. Idempotent.

    Purpose:
        Restrict staging and operator console access to founder identities
        (Google Workspace SSO) and optionally to a specific IP allowlist.

    Parameters:
        application_id: Access application ID.
        name: Policy name.
        decision: allow, deny, non_identity, bypass.
        include: Include rules (e.g. email domain, Google group).
        require: Optional require rules.
        exclude: Optional exclude rules.

    Returns:
        Dict with policy metadata.

    Raises:
        NotImplementedError: Phase 2 week 1 end.

    Idempotency notes:
        Policies are deduplicated by name within the same application.
    """
    raise NotImplementedError("cloudflare.access.create_policy planned for Phase 2 week 1 end")


def list_policies(application_id: str) -> list[dict[str, Any]]:
    """List policies on an Access application.

    Parameters:
        application_id: Access application ID.

    Returns:
        List of policy dicts.

    Raises:
        NotImplementedError: Phase 2 week 1 end.
    """
    raise NotImplementedError("cloudflare.access.list_policies planned for Phase 2 week 1 end")


def delete_policy(application_id: str, policy_id: str) -> None:
    """Delete an Access policy by id.

    Raises:
        NotImplementedError: Phase 2 week 1 end.
    """
    raise NotImplementedError("cloudflare.access.delete_policy planned for Phase 2 week 1 end")
