"""Schema fingerprinting (stub, implementation planned Phase 2 week 5).

Computes a stable hash of a Postgres schema (tables, columns, indexes,
constraints, sequences) suitable for drift detection. Used by
`tenants.drift` and by CI tenant baseline assertions.
"""

from __future__ import annotations

from typing import Any

from gamma_ops.logging import get_logger

log = get_logger(__name__, component="db.fingerprint")


def fingerprint_schema(db_url: str, schema: str) -> dict[str, Any]:
    """Compute a structured fingerprint for a Postgres schema.

    Purpose:
        Deterministic hash of every DDL object in a schema. Used as the
        canonical drift signal. Two schemas with identical DDL produce
        identical fingerprints.

    Parameters:
        db_url: Postgres connection string.
        schema: Schema name (e.g. `tenant_acme`).

    Returns:
        Dict with `hash`, `tables`, `columns`, `indexes`, `constraints`,
        `sequences`, each as a sorted list for stable comparison.

    Raises:
        NotImplementedError: Phase 2 week 5.

    Idempotency notes:
        Read-only; trivially idempotent.
    """
    raise NotImplementedError("db.fingerprint.fingerprint_schema planned for Phase 2 week 5")


def compare(
    fp1: dict[str, Any],
    fp2: dict[str, Any],
) -> list[dict[str, Any]]:
    """Diff two schema fingerprints. Returns a list of diff entries.

    Purpose:
        Human-readable diff for drift reconciliation.

    Parameters:
        fp1: First fingerprint (usually canonical baseline).
        fp2: Second fingerprint (usually a tenant schema).

    Returns:
        List of diff dicts, each with `kind` (MISSING / EXTRA / CHANGED),
        `object_type`, `object_name`, `detail`.

    Raises:
        NotImplementedError: Phase 2 week 5.

    Idempotency notes:
        Pure function; trivially idempotent.
    """
    raise NotImplementedError("db.fingerprint.compare planned for Phase 2 week 5")
