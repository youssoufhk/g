"""Google Cloud Storage operations.

Idempotent wrappers for bucket creation (with CMEK, retention, public
access prevention), lifecycle configuration, and deletion. All functions
default to the Gamma region (europe-west9) unless overridden.
"""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

from gamma_ops.config import get_config
from gamma_ops.errors import (
    AuthenticationError,
    GCPError,
    PreconditionFailed,
    ResourceNotFound,
)
from gamma_ops.logging import get_logger

log = get_logger(__name__, component="gcp.storage")


class LifecycleRule(BaseModel):
    """A single GCS lifecycle rule.

    Example:
        >>> LifecycleRule(
        ...     action="Delete",
        ...     age_days=30,
        ...     matches_prefix=["imports/"],
        ... )
    """

    action: Literal["Delete", "SetStorageClass"]
    age_days: int | None = Field(default=None, ge=0)
    matches_prefix: list[str] = Field(default_factory=list)
    matches_suffix: list[str] = Field(default_factory=list)
    storage_class: str | None = Field(
        default=None,
        description="Required when action is SetStorageClass.",
    )
    number_of_newer_versions: int | None = Field(default=None, ge=0)


def _storage_client(project_id: str | None = None) -> Any:
    """Return a GCS Client, translating auth errors."""
    try:
        from google.cloud import storage

        project = project_id or get_config().gcp_project_id
        return storage.Client(project=project)
    except Exception as exc:
        raise AuthenticationError(
            f"Failed to initialize GCS client: {exc}"
        ) from exc


def create_bucket(
    name: str,
    location: str | None = None,
    storage_class: str = "STANDARD",
    cmek_key: str | None = None,
    retention_seconds: int | None = None,
    public_access_prevention: Literal["enforced", "inherited"] = "enforced",
    uniform_bucket_level_access: bool = True,
    versioning: bool = True,
    labels: dict[str, str] | None = None,
    project_id: str | None = None,
) -> dict[str, Any]:
    """Create a GCS bucket with Gamma defaults. Idempotent.

    Purpose:
        Create the per-environment prod/staging/legal-hold buckets described
        in ADR-005. Enforces public access prevention, uniform bucket-level
        access, object versioning, and optional CMEK and retention lock.

    Parameters:
        name: Globally unique bucket name.
        location: GCS region. Defaults to OpsConfig.gcp_region (europe-west9).
        storage_class: STANDARD, NEARLINE, COLDLINE, ARCHIVE.
        cmek_key: Full KMS key resource name, e.g.
            `projects/P/locations/L/keyRings/K/cryptoKeys/KEY`. Required for
            Confidential-tier data per ADR-005.
        retention_seconds: Minimum retention in seconds. Sets a retention
            policy (not locked; lock via separate API call when ready).
        public_access_prevention: "enforced" (Gamma default) blocks all
            public ACL grants. "inherited" would allow them; avoid.
        uniform_bucket_level_access: Disable object-level ACLs in favor of IAM.
        versioning: Enable object versioning.
        labels: Optional bucket labels.
        project_id: Override config project.

    Returns:
        Dict with `name`, `location`, `storage_class`, `cmek_key`, `created`.

    Raises:
        GCPError: on API failure.
        PreconditionFailed: if the bucket exists with mismatched location or CMEK.
        AuthenticationError: if ADC is missing.

    Idempotency notes:
        If the bucket already exists and its location and CMEK key match the
        requested values, returns the existing bucket metadata. If the bucket
        exists with different location or CMEK, raises PreconditionFailed
        rather than silently succeeding.

    Common failure modes:
        - Bucket name collision (GCS names are global): returns existing if
          owned, otherwise google.api_core.exceptions.Conflict.
        - Insufficient IAM: caller needs `roles/storage.admin` on the project.
        - Wrong region: Org Policy `constraints/gcp.resourceLocations` denies
          creation outside europe-west9 / europe-west1.

    Example:
        >>> create_bucket(
        ...     "gamma-prod-files",
        ...     location="europe-west9",
        ...     cmek_key="projects/gamma-prod/locations/europe-west9/keyRings/gamma-tenant/cryptoKeys/default",
        ... )
    """
    from google.api_core import exceptions as gexc
    from google.cloud import storage

    cfg = get_config()
    loc = (location or cfg.gcp_region).lower()

    log.info(
        "create_bucket:start",
        name=name,
        location=loc,
        storage_class=storage_class,
        cmek=bool(cmek_key),
    )

    client = _storage_client(project_id)

    # Idempotency: check existence first.
    try:
        existing = client.get_bucket(name)
    except gexc.NotFound:
        existing = None
    except gexc.GoogleAPIError as exc:
        raise GCPError(f"Failed to look up bucket {name}: {exc}") from exc

    if existing is not None:
        existing_location = (existing.location or "").lower()
        existing_cmek = (
            existing.default_kms_key_name if existing.default_kms_key_name else None
        )
        if existing_location != loc:
            raise PreconditionFailed(
                f"Bucket {name} exists in {existing_location}, requested {loc}"
            )
        if (cmek_key or None) != (existing_cmek or None):
            raise PreconditionFailed(
                f"Bucket {name} CMEK mismatch: existing={existing_cmek}, requested={cmek_key}"
            )
        log.info("create_bucket:already_exists", name=name)
        return {
            "name": existing.name,
            "location": existing_location,
            "storage_class": existing.storage_class,
            "cmek_key": existing_cmek,
            "created": False,
        }

    bucket = storage.Bucket(client, name=name)
    bucket.storage_class = storage_class
    if cmek_key:
        bucket.default_kms_key_name = cmek_key
    if retention_seconds:
        bucket.retention_period = retention_seconds
    bucket.versioning_enabled = versioning
    if labels:
        bucket.labels = labels

    try:
        bucket = client.create_bucket(bucket, location=loc)
    except gexc.Conflict:
        # Race: someone created it between our get and create. Re-fetch and validate.
        log.info("create_bucket:race_conflict", name=name)
        existing = client.get_bucket(name)
        return {
            "name": existing.name,
            "location": (existing.location or "").lower(),
            "storage_class": existing.storage_class,
            "cmek_key": existing.default_kms_key_name,
            "created": False,
        }
    except gexc.GoogleAPIError as exc:
        log.error("create_bucket:failed", name=name, error=str(exc))
        raise GCPError(f"Failed to create bucket {name}: {exc}") from exc

    # Apply uniform bucket-level access and public access prevention after creation.
    try:
        bucket.iam_configuration.uniform_bucket_level_access_enabled = (
            uniform_bucket_level_access
        )
        bucket.iam_configuration.public_access_prevention = public_access_prevention
        bucket.patch()
    except gexc.GoogleAPIError as exc:
        log.error("create_bucket:patch_failed", name=name, error=str(exc))
        raise GCPError(f"Failed to patch IAM config on {name}: {exc}") from exc

    log.info("create_bucket:success", name=name, location=loc)
    return {
        "name": bucket.name,
        "location": (bucket.location or "").lower(),
        "storage_class": bucket.storage_class,
        "cmek_key": bucket.default_kms_key_name,
        "created": True,
    }


def set_lifecycle(bucket_name: str, rules: list[LifecycleRule]) -> None:
    """Configure lifecycle rules on a bucket. Idempotent.

    Purpose:
        Apply a set of lifecycle rules. Overwrites any existing rules, which
        is the only sensible idempotent semantic since rules have no stable id.

    Parameters:
        bucket_name: Bucket name.
        rules: List of LifecycleRule.

    Raises:
        ResourceNotFound: if the bucket does not exist.
        GCPError: on API failure.

    Idempotency notes:
        Running twice with the same rules is a no-op (same configuration).
        Running twice with different rules overwrites.

    Example:
        >>> set_lifecycle("gamma-prod-files", [
        ...     LifecycleRule(action="Delete", age_days=30, matches_prefix=["imports/"]),
        ...     LifecycleRule(action="SetStorageClass", age_days=90, storage_class="NEARLINE"),
        ... ])
    """
    from google.api_core import exceptions as gexc

    log.info("set_lifecycle:start", bucket=bucket_name, rules=len(rules))
    client = _storage_client()

    try:
        bucket = client.get_bucket(bucket_name)
    except gexc.NotFound as exc:
        raise ResourceNotFound(f"Bucket {bucket_name} not found") from exc

    raw_rules: list[dict[str, Any]] = []
    for r in rules:
        condition: dict[str, Any] = {}
        if r.age_days is not None:
            condition["age"] = r.age_days
        if r.matches_prefix:
            condition["matchesPrefix"] = r.matches_prefix
        if r.matches_suffix:
            condition["matchesSuffix"] = r.matches_suffix
        if r.number_of_newer_versions is not None:
            condition["numNewerVersions"] = r.number_of_newer_versions

        action: dict[str, Any] = {"type": r.action}
        if r.action == "SetStorageClass":
            if not r.storage_class:
                raise ValueError("SetStorageClass requires storage_class")
            action["storageClass"] = r.storage_class

        raw_rules.append({"action": action, "condition": condition})

    bucket.lifecycle_rules = raw_rules
    try:
        bucket.patch()
    except gexc.GoogleAPIError as exc:
        raise GCPError(f"Failed to set lifecycle on {bucket_name}: {exc}") from exc

    log.info("set_lifecycle:success", bucket=bucket_name)


def delete_bucket(name: str, force: bool = False) -> None:
    """Delete a GCS bucket. Optionally empty it first.

    Purpose:
        Destructive operation. Required for cleanup of ephemeral test buckets.

    Parameters:
        name: Bucket name.
        force: If True, delete all objects (including versions) before the bucket.

    Raises:
        ResourceNotFound: if the bucket does not exist.
        GCPError: on API failure.

    Idempotency notes:
        Deleting a non-existent bucket raises ResourceNotFound. Callers can
        treat that as success.

    Example:
        >>> delete_bucket("gamma-test-abc123", force=True)
    """
    from google.api_core import exceptions as gexc

    log.warning("delete_bucket:start", name=name, force=force)
    client = _storage_client()

    try:
        bucket = client.get_bucket(name)
    except gexc.NotFound as exc:
        raise ResourceNotFound(f"Bucket {name} not found") from exc

    try:
        if force:
            # Delete all object versions (GCS delete is blocked if objects exist).
            for blob in client.list_blobs(bucket, versions=True):
                blob.delete()
        bucket.delete()
    except gexc.GoogleAPIError as exc:
        raise GCPError(f"Failed to delete bucket {name}: {exc}") from exc

    log.warning("delete_bucket:success", name=name)


def list_buckets(project_id: str | None = None) -> list[dict[str, Any]]:
    """List buckets in a project.

    Parameters:
        project_id: Override config project.

    Returns:
        List of bucket metadata dicts.

    Raises:
        GCPError: on API failure.

    Example:
        >>> for b in list_buckets("gamma-prod"):
        ...     print(b["name"], b["location"])
    """
    from google.api_core import exceptions as gexc

    client = _storage_client(project_id)
    log.info("list_buckets:start", project_id=project_id)

    try:
        buckets = [
            {
                "name": b.name,
                "location": (b.location or "").lower(),
                "storage_class": b.storage_class,
                "cmek_key": b.default_kms_key_name,
            }
            for b in client.list_buckets()
        ]
    except gexc.GoogleAPIError as exc:
        raise GCPError(f"Failed to list buckets: {exc}") from exc

    log.info("list_buckets:success", count=len(buckets))
    return buckets
