"""Cloud SQL operations (stub, implementation planned Phase 2 week 2).

This module will own Cloud SQL Postgres 16 Regional HA provisioning,
per-tenant database creation, user management, failover drills, and
point-in-time recovery restores.

Every function in this file currently raises NotImplementedError. Signatures,
docstrings, and idempotency contracts are stable so callers (skills, agents,
CLI) can already import them and the implementation can be filled in without
breaking API.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import SecretStr

from gamma_ops.logging import get_logger

log = get_logger(__name__, component="gcp.cloudsql")


def create_instance(
    name: str,
    region: str,
    tier: str = "db-custom-2-7680",
    ha: bool = True,
    postgres_version: str = "POSTGRES_16",
    storage_gb: int = 100,
    deletion_protection: bool = True,
    project_id: str | None = None,
) -> dict[str, Any]:
    """Create a Cloud SQL Postgres instance with Gamma defaults. Idempotent.

    Purpose:
        Provision the shared Postgres 16 instance for one environment.

    Parameters:
        name: Instance name, e.g. `gamma-prod-pg`.
        region: GCP region. Must be europe-west9 per Org Policy.
        tier: Machine tier. Default `db-custom-2-7680` (2 vCPU, 7.5 GB RAM).
        ha: Regional HA (primary + standby in different zones).
        postgres_version: Postgres major version.
        storage_gb: Initial storage allocation.
        deletion_protection: Block accidental delete.
        project_id: Override config project.

    Returns:
        Dict with instance metadata.

    Raises:
        GCPError: on API failure.
        NotImplementedError: Phase 2 week 2.

    Idempotency notes:
        Will be idempotent: returns existing instance if name matches.
    """
    raise NotImplementedError("cloudsql.create_instance planned for Phase 2 week 2")


def create_database(
    instance: str,
    db_name: str,
    project_id: str | None = None,
) -> dict[str, Any]:
    """Create a logical database inside an existing Cloud SQL instance. Idempotent.

    Purpose:
        Each environment uses one logical database (schema-per-tenant lives
        inside that database per ADR-001).

    Parameters:
        instance: Cloud SQL instance name.
        db_name: Logical database name (e.g. `gamma`).
        project_id: Override config project.

    Returns:
        Dict with database metadata.

    Raises:
        GCPError: on API failure.
        NotImplementedError: Phase 2 week 2.

    Idempotency notes:
        Will return existing database if present.
    """
    raise NotImplementedError("cloudsql.create_database planned for Phase 2 week 2")


def create_user(
    instance: str,
    username: str,
    password: SecretStr,
    project_id: str | None = None,
) -> dict[str, Any]:
    """Create a Postgres user on a Cloud SQL instance. Idempotent.

    Purpose:
        Create application roles (app_rw, app_ro, migration_runner).

    Parameters:
        instance: Cloud SQL instance name.
        username: Postgres role name.
        password: Role password (SecretStr).
        project_id: Override config project.

    Returns:
        Dict with user metadata.

    Raises:
        GCPError: on API failure.
        NotImplementedError: Phase 2 week 2.

    Idempotency notes:
        Will return existing user without updating password. Use rotate
        operation (planned) to change password.
    """
    raise NotImplementedError("cloudsql.create_user planned for Phase 2 week 2")


def failover(instance: str, project_id: str | None = None) -> None:
    """Trigger manual failover from primary to standby.

    Purpose:
        Monthly HA drill per ADR-008. Failover SLO: RTO < 120 s, RPO < 1 tx.

    Parameters:
        instance: Cloud SQL instance name.
        project_id: Override config project.

    Raises:
        GCPError: on API failure.
        NotImplementedError: Phase 2 week 2.

    Idempotency notes:
        NOT idempotent. Each call triggers a failover, which flips the
        primary zone. Running twice lands in the original zone.
    """
    raise NotImplementedError("cloudsql.failover planned for Phase 2 week 2")


def pitr_restore(
    source_instance: str,
    target_instance: str,
    timestamp: datetime,
    project_id: str | None = None,
) -> dict[str, Any]:
    """Restore a Cloud SQL instance to a point-in-time into a new target instance.

    Purpose:
        Full-cluster PITR recovery per `docs/ROLLBACK_RUNBOOK.md`. Always
        restores into a NEW instance so the original is preserved for
        forensics.

    Parameters:
        source_instance: Source instance name.
        target_instance: New instance name to create.
        timestamp: UTC timestamp to restore to.
        project_id: Override config project.

    Returns:
        Dict with target instance metadata.

    Raises:
        GCPError: on API failure.
        NotImplementedError: Phase 2 week 2.

    Idempotency notes:
        If target_instance already exists, raises ResourceAlreadyExists
        rather than silently doing nothing. This matches human operator
        expectation in incident response.
    """
    raise NotImplementedError("cloudsql.pitr_restore planned for Phase 2 week 2")
