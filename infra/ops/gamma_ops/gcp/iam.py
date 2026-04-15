"""GCP IAM operations (stub, implementation planned Phase 2 week 2).

Owns service account creation, role binding, audit, and drift detection
against a declarative baseline.
"""

from __future__ import annotations

from typing import Any

from gamma_ops.logging import get_logger

log = get_logger(__name__, component="gcp.iam")


def create_service_account(
    name: str,
    display_name: str,
    project_id: str,
) -> dict[str, Any]:
    """Create a service account. Idempotent.

    Purpose:
        Each Gamma workload (ops, app, portal, worker) has its own SA so
        IAM audit logs attribute calls correctly.

    Parameters:
        name: Short SA name (becomes `name@project.iam.gserviceaccount.com`).
        display_name: Console display name.
        project_id: Host project.

    Returns:
        Dict with `email`, `unique_id`.

    Raises:
        NotImplementedError: Phase 2 week 2.

    Idempotency notes:
        Will return existing SA if present.
    """
    raise NotImplementedError("iam.create_service_account planned for Phase 2 week 2")


def bind_role(
    member: str,
    role: str,
    resource: str,
) -> None:
    """Bind a role to a member on a resource. Idempotent.

    Parameters:
        member: Member string, e.g. `serviceAccount:x@y.iam.gserviceaccount.com`.
        role: Role name, e.g. `roles/storage.objectViewer`.
        resource: Resource full name (project, bucket, secret, etc.).

    Raises:
        NotImplementedError: Phase 2 week 2.

    Idempotency notes:
        Adding an already-present binding is a no-op.
    """
    raise NotImplementedError("iam.bind_role planned for Phase 2 week 2")


def audit_bindings(project_id: str) -> list[dict[str, Any]]:
    """Return every IAM binding on a project for auditing.

    Parameters:
        project_id: Host project.

    Returns:
        List of binding dicts.

    Raises:
        NotImplementedError: Phase 2 week 2.

    Idempotency notes:
        Read-only; idempotent.
    """
    raise NotImplementedError("iam.audit_bindings planned for Phase 2 week 2")


def drift_check(
    project_id: str,
    expected_bindings: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Compare live IAM to an expected baseline and return drifts.

    Purpose:
        Weekly compliance check. Any new binding not in the baseline is flagged.

    Parameters:
        project_id: Host project.
        expected_bindings: Baseline to diff against.

    Returns:
        List of drift dicts, each with `kind` (ADDED / REMOVED / CHANGED),
        `member`, `role`, `resource`.

    Raises:
        NotImplementedError: Phase 2 week 2.
    """
    raise NotImplementedError("iam.drift_check planned for Phase 2 week 2")
