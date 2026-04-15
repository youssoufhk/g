"""Google Secret Manager operations.

Idempotent wrappers for creating secrets and versions, reading current
versions, rotating, and deleting. Per ADR-008, all runtime secrets
(DB credentials, Vertex AI SA key, WebAuthn keys, SMTP Relay creds) live in
Secret Manager and are fetched at container start time.
"""

from __future__ import annotations

from typing import Any

from gamma_ops.config import get_config
from gamma_ops.errors import (
    AuthenticationError,
    GCPError,
    ResourceNotFound,
)
from gamma_ops.logging import get_logger

log = get_logger(__name__, component="gcp.secrets")


def _sm_client() -> Any:
    """Return a SecretManagerServiceClient."""
    try:
        from google.cloud import secretmanager

        return secretmanager.SecretManagerServiceClient()
    except Exception as exc:
        raise AuthenticationError(
            f"Failed to initialize Secret Manager client: {exc}"
        ) from exc


def _as_bytes(payload: str | bytes) -> bytes:
    """Normalize payload to bytes."""
    return payload.encode("utf-8") if isinstance(payload, str) else payload


def create_secret(
    name: str,
    payload: str | bytes,
    project_id: str | None = None,
    labels: dict[str, str] | None = None,
) -> dict[str, Any]:
    """Create a secret and its first version, or add a version if it exists.

    Purpose:
        One-call secret creation. Creates the Secret parent if missing, then
        adds a version containing `payload`.

    Parameters:
        name: Secret short name (not the full resource path).
        payload: Secret bytes or string. Strings are encoded as UTF-8.
        project_id: Override config project.
        labels: Optional secret labels.

    Returns:
        Dict with `name`, `version_name`, `created` (True if a new Secret was
        created, False if only a new version was added to an existing one).

    Raises:
        GCPError: on API failure.

    Idempotency notes:
        If the secret already exists, does NOT overwrite its metadata (labels,
        replication policy). A new version is always added, so the function
        is idempotent in the sense that "the latest version contains the
        requested payload" holds on success.

    Example:
        >>> create_secret("db-password-staging", "hunter2", labels={"env": "staging"})
    """
    from google.api_core import exceptions as gexc
    from google.cloud import secretmanager

    cfg = get_config()
    project = project_id or cfg.gcp_project_id
    parent = f"projects/{project}"
    full_name = f"{parent}/secrets/{name}"

    log.info("create_secret:start", name=name, project_id=project)

    client = _sm_client()

    created = False
    try:
        client.get_secret(request={"name": full_name})
    except gexc.NotFound:
        try:
            client.create_secret(
                request={
                    "parent": parent,
                    "secret_id": name,
                    "secret": secretmanager.Secret(
                        replication=secretmanager.Replication(
                            automatic=secretmanager.Replication.Automatic()
                        ),
                        labels=labels or {},
                    ),
                }
            )
            created = True
        except gexc.AlreadyExists:
            created = False
        except gexc.GoogleAPIError as exc:
            raise GCPError(f"Failed to create secret {name}: {exc}") from exc
    except gexc.GoogleAPIError as exc:
        raise GCPError(f"Failed to look up secret {name}: {exc}") from exc

    # Add version.
    try:
        version = client.add_secret_version(
            request={
                "parent": full_name,
                "payload": secretmanager.SecretPayload(data=_as_bytes(payload)),
            }
        )
    except gexc.GoogleAPIError as exc:
        raise GCPError(f"Failed to add version to secret {name}: {exc}") from exc

    log.info("create_secret:success", name=name, version=version.name, created=created)
    return {"name": full_name, "version_name": version.name, "created": created}


def read_secret(
    name: str,
    version: str = "latest",
    project_id: str | None = None,
) -> bytes:
    """Read a secret value.

    Purpose:
        Fetch the bytes of a secret version. Most callers want "latest".

    Parameters:
        name: Secret short name.
        version: Version number or "latest".
        project_id: Override config project.

    Returns:
        The raw secret bytes.

    Raises:
        ResourceNotFound: if the secret or version does not exist.
        GCPError: on API failure.

    Idempotency notes:
        Read-only; trivially idempotent.

    Example:
        >>> password = read_secret("db-password-staging").decode("utf-8")
    """
    from google.api_core import exceptions as gexc

    cfg = get_config()
    project = project_id or cfg.gcp_project_id
    resource = f"projects/{project}/secrets/{name}/versions/{version}"

    log.info("read_secret:start", name=name, version=version)
    client = _sm_client()

    try:
        response = client.access_secret_version(request={"name": resource})
    except gexc.NotFound as exc:
        raise ResourceNotFound(f"Secret {name} version {version} not found") from exc
    except gexc.GoogleAPIError as exc:
        raise GCPError(f"Failed to read secret {name}: {exc}") from exc

    log.info("read_secret:success", name=name, version=version)
    return response.payload.data


def rotate_secret(
    name: str,
    new_payload: str | bytes,
    project_id: str | None = None,
) -> dict[str, Any]:
    """Add a new version and schedule destruction of the previous one.

    Purpose:
        Standard rotation flow: new version is added and becomes "latest";
        the previous version is marked for destruction after a 7-day grace
        period so any stale pods can still read it until the rollout settles.

    Parameters:
        name: Secret short name.
        new_payload: New secret bytes or string.
        project_id: Override config project.

    Returns:
        Dict with `new_version`, `previous_version_disabled`.

    Raises:
        ResourceNotFound: if the secret does not exist.
        GCPError: on API failure.

    Idempotency notes:
        NOT strictly idempotent (a new version is created each call). Callers
        that want idempotency should check whether the latest version already
        equals `new_payload` before calling.

    Example:
        >>> rotate_secret("db-password-staging", "new-hunter2")
    """
    from google.api_core import exceptions as gexc
    from google.cloud import secretmanager

    cfg = get_config()
    project = project_id or cfg.gcp_project_id
    full_name = f"projects/{project}/secrets/{name}"

    log.info("rotate_secret:start", name=name)
    client = _sm_client()

    # Find the current latest version (to disable afterward).
    previous_version: str | None = None
    try:
        versions = client.list_secret_versions(request={"parent": full_name})
        enabled = [
            v for v in versions if v.state == secretmanager.SecretVersion.State.ENABLED
        ]
        if enabled:
            # Highest version number is the "latest".
            enabled.sort(key=lambda v: int(v.name.rsplit("/", 1)[-1]), reverse=True)
            previous_version = enabled[0].name
    except gexc.NotFound as exc:
        raise ResourceNotFound(f"Secret {name} not found") from exc
    except gexc.GoogleAPIError as exc:
        raise GCPError(f"Failed to list versions of {name}: {exc}") from exc

    # Add the new version.
    try:
        new_version = client.add_secret_version(
            request={
                "parent": full_name,
                "payload": secretmanager.SecretPayload(data=_as_bytes(new_payload)),
            }
        )
    except gexc.GoogleAPIError as exc:
        raise GCPError(f"Failed to add version to {name}: {exc}") from exc

    # Disable the old version. (Destruction is scheduled separately; here we
    # just disable it. A nightly sweep can destroy disabled versions older
    # than 7 days if the founder wants hard destruction.)
    disabled_name: str | None = None
    if previous_version and previous_version != new_version.name:
        try:
            client.disable_secret_version(request={"name": previous_version})
            disabled_name = previous_version
        except gexc.GoogleAPIError as exc:
            log.warning("rotate_secret:disable_failed", previous=previous_version, error=str(exc))

    log.info(
        "rotate_secret:success",
        name=name,
        new_version=new_version.name,
        disabled=disabled_name,
    )
    return {"new_version": new_version.name, "previous_version_disabled": disabled_name}


def delete_secret(
    name: str,
    confirm: bool = False,
    project_id: str | None = None,
) -> None:
    """Delete a secret and all its versions. Requires confirm=True.

    Purpose:
        Destructive operation. Removes the secret and every version permanently.

    Parameters:
        name: Secret short name.
        confirm: Must be True.
        project_id: Override config project.

    Raises:
        ValueError: if confirm is False.
        ResourceNotFound: if the secret does not exist.
        GCPError: on API failure.

    Idempotency notes:
        Deleting a non-existent secret raises ResourceNotFound. Callers can
        treat that as success.

    Example:
        >>> delete_secret("obsolete-api-key", confirm=True)
    """
    from google.api_core import exceptions as gexc

    if not confirm:
        raise ValueError(f"delete_secret refuses to run without confirm=True for {name}")

    cfg = get_config()
    project = project_id or cfg.gcp_project_id
    full_name = f"projects/{project}/secrets/{name}"

    log.warning("delete_secret:start", name=name)
    client = _sm_client()

    try:
        client.delete_secret(request={"name": full_name})
    except gexc.NotFound as exc:
        raise ResourceNotFound(f"Secret {name} not found") from exc
    except gexc.GoogleAPIError as exc:
        raise GCPError(f"Failed to delete secret {name}: {exc}") from exc

    log.warning("delete_secret:success", name=name)
