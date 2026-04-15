"""Database backup operations (stub, implementation planned Phase 2 week 2).

Owns full-instance backups, per-tenant logical dumps, and PITR restore.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from gamma_ops.logging import get_logger

log = get_logger(__name__, component="db.backup")


def create_backup(instance: str, project_id: str | None = None) -> dict[str, Any]:
    """Create a Cloud SQL on-demand backup. Idempotent-ish.

    Purpose:
        Pre-deploy safety net. Each backup is tagged with a description
        derived from the git SHA so re-runs at the same SHA return the
        existing backup instead of stacking duplicates.

    Parameters:
        instance: Cloud SQL instance name.
        project_id: Override config project.

    Returns:
        Dict with `backup_id`, `start_time`, `status`.

    Raises:
        NotImplementedError: Phase 2 week 2.
    """
    raise NotImplementedError("db.backup.create_backup planned for Phase 2 week 2")


def pitr_restore(
    instance: str,
    timestamp: datetime,
    target_instance: str,
    project_id: str | None = None,
) -> dict[str, Any]:
    """Restore a Cloud SQL instance to a point-in-time into a new target.

    See `gamma_ops.gcp.cloudsql.pitr_restore` for the full contract.
    This wrapper is a convenience that also exports the restored tenant
    schemas to the backup bucket for offline analysis.

    Raises:
        NotImplementedError: Phase 2 week 2.
    """
    raise NotImplementedError("db.backup.pitr_restore planned for Phase 2 week 2")
