"""Tenant provisioning (stub, implementation planned Phase 2 week 5).

Provisions a fresh tenant: creates the Postgres schema, runs Alembic on it,
seeds country holidays, creates the owner user, and returns an invitation
link. Per ADR-001, this is a pure DDL + seed operation behind the operator
console API.
"""

from __future__ import annotations

from typing import Any

from gamma_ops.logging import get_logger

log = get_logger(__name__, component="tenants.provision")


def provision_tenant(
    name: str,
    residency_region: str,
    legal_jurisdiction: str,
    base_currency: str,
    primary_locale: str,
    owner_email: str,
    supported_locales: list[str] | None = None,
) -> dict[str, Any]:
    """Provision a fresh tenant end-to-end. Idempotent by slug.

    Purpose:
        Full tenant bootstrap: (1) create `public.tenants` row, (2) create
        Postgres schema `tenant_<slug>`, (3) run every Alembic migration
        against it, (4) seed country-specific holidays, (5) create the owner
        user, (6) generate an invitation link with a short-lived token.

    Parameters:
        name: Tenant display name (will be slugified).
        residency_region: `eu` for v1.0 (ADR-008 Org Policy lock).
        legal_jurisdiction: Country code, e.g. `FR`, `UK`.
        base_currency: ISO 4217 code, e.g. `EUR`, `GBP`.
        primary_locale: BCP-47 code, e.g. `fr-FR`, `en-GB`.
        owner_email: Email for the owner user.
        supported_locales: Optional list of additional locales.

    Returns:
        Dict with `tenant_id`, `slug`, `schema`, `invitation_url`.

    Raises:
        TenantError: on failure.
        NotImplementedError: Phase 2 week 5.

    Idempotency notes:
        Running twice with the same name is safe: the existing tenant is
        returned instead of being re-created. Partial failures (schema
        created but migrations failed) are handled by the Alembic runner
        tracking table `public.alembic_runs` per ADR-001.

    Example:
        >>> provision_tenant(
        ...     name="Acme Consulting",
        ...     residency_region="eu",
        ...     legal_jurisdiction="FR",
        ...     base_currency="EUR",
        ...     primary_locale="fr-FR",
        ...     owner_email="ceo@acme.example",
        ... )
    """
    raise NotImplementedError("tenants.provision_tenant planned for Phase 2 week 5")
