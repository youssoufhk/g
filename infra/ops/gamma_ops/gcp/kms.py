"""Cloud KMS operations.

Idempotent wrappers for keyring and CryptoKey creation, rotation, and listing.
Per ADR-005, each tenant gets its own CryptoKey in the shared keyring for
Confidential-tier data encryption.
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

log = get_logger(__name__, component="gcp.kms")

DEFAULT_ROTATION_SECONDS = 31_536_000  # 365 days
_DEFAULT_PURPOSE = "ENCRYPT_DECRYPT"


def _kms_client() -> Any:
    """Return a KeyManagementServiceClient."""
    try:
        from google.cloud import kms

        return kms.KeyManagementServiceClient()
    except Exception as exc:
        raise AuthenticationError(f"Failed to initialize KMS client: {exc}") from exc


def create_keyring(
    name: str,
    location: str | None = None,
    project_id: str | None = None,
) -> dict[str, Any]:
    """Create a KMS keyring. Idempotent.

    Purpose:
        Keyrings group CryptoKeys by application domain. Gamma uses one
        keyring per environment per purpose (e.g. `gamma-tenant` for
        per-tenant CMEK keys, `gamma-secrets` for Secret Manager CMEK).

    Parameters:
        name: Keyring short name (not the full resource path).
        location: GCP region. Defaults to OpsConfig.gcp_region.
        project_id: Override config project.

    Returns:
        Dict with `name` (full resource path), `create_time`.

    Raises:
        GCPError: on API failure.

    Idempotency notes:
        If the keyring already exists, returns the existing one. KMS keyrings
        cannot be deleted once created, so this is permanently idempotent.

    Example:
        >>> create_keyring("gamma-tenant", location="europe-west9")
    """
    from google.api_core import exceptions as gexc
    from google.cloud import kms

    cfg = get_config()
    loc = (location or cfg.gcp_region).lower()
    project = project_id or cfg.gcp_project_id

    log.info("create_keyring:start", name=name, location=loc, project_id=project)

    client = _kms_client()
    parent = f"projects/{project}/locations/{loc}"
    full_name = f"{parent}/keyRings/{name}"

    # Idempotent check.
    try:
        existing = client.get_key_ring(name=full_name)
        log.info("create_keyring:already_exists", name=name)
        return {"name": existing.name, "create_time": existing.create_time.isoformat()}
    except gexc.NotFound:
        pass
    except gexc.GoogleAPIError as exc:
        raise GCPError(f"Failed to look up keyring {name}: {exc}") from exc

    try:
        keyring = kms.KeyRing()
        result = client.create_key_ring(
            request={"parent": parent, "key_ring_id": name, "key_ring": keyring}
        )
    except gexc.AlreadyExists:
        existing = client.get_key_ring(name=full_name)
        return {"name": existing.name, "create_time": existing.create_time.isoformat()}
    except gexc.GoogleAPIError as exc:
        raise GCPError(f"Failed to create keyring {name}: {exc}") from exc

    log.info("create_keyring:success", name=result.name)
    return {"name": result.name, "create_time": result.create_time.isoformat()}


def create_crypto_key(
    name: str,
    keyring: str,
    location: str | None = None,
    rotation_period_seconds: int = DEFAULT_ROTATION_SECONDS,
    purpose: str = _DEFAULT_PURPOSE,
    project_id: str | None = None,
) -> dict[str, Any]:
    """Create a CryptoKey inside a keyring with automatic rotation. Idempotent.

    Purpose:
        Per ADR-005, each tenant gets a dedicated CryptoKey for Confidential-
        tier data encryption. This function creates one with the Gamma
        defaults (365-day rotation, ENCRYPT_DECRYPT purpose).

    Parameters:
        name: CryptoKey short name (not the full resource path).
        keyring: Keyring short name (must already exist).
        location: GCP region. Defaults to config.
        rotation_period_seconds: Automatic rotation interval (default 1 year).
            KMS requires a minimum of 24 hours.
        purpose: KMS purpose. Default ENCRYPT_DECRYPT.
        project_id: Override config project.

    Returns:
        Dict with `name`, `purpose`, `rotation_period`, `next_rotation_time`.

    Raises:
        GCPError: on API failure.
        ResourceNotFound: if the keyring does not exist.

    Idempotency notes:
        If the key already exists, returns the existing one. Rotation period
        is NOT updated if the key already exists; use rotate_key to force
        one-off rotation and a separate UpdateCryptoKey call to change policy.

    Example:
        >>> create_crypto_key(
        ...     "tenant-acme",
        ...     keyring="gamma-tenant",
        ...     rotation_period_seconds=31_536_000,
        ... )
    """
    from datetime import datetime, timedelta, timezone

    from google.api_core import exceptions as gexc
    from google.cloud import kms

    cfg = get_config()
    loc = (location or cfg.gcp_region).lower()
    project = project_id or cfg.gcp_project_id

    log.info(
        "create_crypto_key:start",
        name=name,
        keyring=keyring,
        location=loc,
        rotation_seconds=rotation_period_seconds,
    )

    client = _kms_client()
    keyring_path = f"projects/{project}/locations/{loc}/keyRings/{keyring}"
    full_name = f"{keyring_path}/cryptoKeys/{name}"

    try:
        existing = client.get_crypto_key(name=full_name)
        log.info("create_crypto_key:already_exists", name=name)
        return {
            "name": existing.name,
            "purpose": existing.purpose.name,
            "rotation_period": existing.rotation_period.seconds
            if existing.rotation_period
            else None,
            "next_rotation_time": existing.next_rotation_time.isoformat()
            if existing.next_rotation_time
            else None,
        }
    except gexc.NotFound:
        pass
    except gexc.GoogleAPIError as exc:
        raise GCPError(f"Failed to look up crypto key {name}: {exc}") from exc

    # Ensure keyring exists.
    try:
        client.get_key_ring(name=keyring_path)
    except gexc.NotFound as exc:
        raise ResourceNotFound(f"Keyring {keyring} not found at {keyring_path}") from exc

    purpose_enum = getattr(kms.CryptoKey.CryptoKeyPurpose, purpose)
    crypto_key = kms.CryptoKey(
        purpose=purpose_enum,
        rotation_period={"seconds": rotation_period_seconds},
        next_rotation_time=datetime.now(timezone.utc) + timedelta(seconds=rotation_period_seconds),
    )

    try:
        result = client.create_crypto_key(
            request={
                "parent": keyring_path,
                "crypto_key_id": name,
                "crypto_key": crypto_key,
            }
        )
    except gexc.AlreadyExists:
        existing = client.get_crypto_key(name=full_name)
        return {
            "name": existing.name,
            "purpose": existing.purpose.name,
            "rotation_period": existing.rotation_period.seconds
            if existing.rotation_period
            else None,
            "next_rotation_time": existing.next_rotation_time.isoformat()
            if existing.next_rotation_time
            else None,
        }
    except gexc.GoogleAPIError as exc:
        raise GCPError(f"Failed to create crypto key {name}: {exc}") from exc

    log.info("create_crypto_key:success", name=result.name)
    return {
        "name": result.name,
        "purpose": result.purpose.name,
        "rotation_period": result.rotation_period.seconds if result.rotation_period else None,
        "next_rotation_time": result.next_rotation_time.isoformat()
        if result.next_rotation_time
        else None,
    }


def rotate_key(
    key_name: str,
    keyring: str,
    location: str | None = None,
    project_id: str | None = None,
) -> dict[str, Any]:
    """Force immediate rotation of a CryptoKey by creating a new primary version.

    Purpose:
        Manual rotation override. Normally keys rotate on their schedule; this
        function is called from incident response or compliance drills.

    Parameters:
        key_name: CryptoKey short name.
        keyring: Keyring short name.
        location: GCP region.
        project_id: Override config project.

    Returns:
        Dict with `version_name`, `state`.

    Raises:
        ResourceNotFound: if the key does not exist.
        GCPError: on API failure.

    Idempotency notes:
        NOT strictly idempotent: each call creates a new version. Running
        twice in a row creates two versions. This matches GCP's rotation
        semantics.

    Example:
        >>> rotate_key("tenant-acme", keyring="gamma-tenant")
    """
    from google.api_core import exceptions as gexc
    from google.cloud import kms

    cfg = get_config()
    loc = (location or cfg.gcp_region).lower()
    project = project_id or cfg.gcp_project_id

    full_name = (
        f"projects/{project}/locations/{loc}/keyRings/{keyring}/cryptoKeys/{key_name}"
    )

    log.info("rotate_key:start", name=key_name, keyring=keyring)
    client = _kms_client()

    try:
        version = client.create_crypto_key_version(
            request={"parent": full_name, "crypto_key_version": kms.CryptoKeyVersion()}
        )
        # Promote the new version to primary.
        client.update_crypto_key_primary_version(
            request={"name": full_name, "crypto_key_version_id": version.name.rsplit("/", 1)[-1]}
        )
    except gexc.NotFound as exc:
        raise ResourceNotFound(f"Crypto key {key_name} not found") from exc
    except gexc.GoogleAPIError as exc:
        raise GCPError(f"Failed to rotate {key_name}: {exc}") from exc

    log.info("rotate_key:success", name=key_name, version=version.name)
    return {"version_name": version.name, "state": version.state.name}


def list_keys(
    keyring: str,
    location: str | None = None,
    project_id: str | None = None,
) -> list[dict[str, Any]]:
    """List CryptoKeys in a keyring.

    Parameters:
        keyring: Keyring short name.
        location: GCP region.
        project_id: Override config project.

    Returns:
        List of key metadata dicts.

    Raises:
        ResourceNotFound: if the keyring does not exist.
        GCPError: on API failure.

    Example:
        >>> for k in list_keys("gamma-tenant"):
        ...     print(k["name"], k["rotation_period"])
    """
    from google.api_core import exceptions as gexc

    cfg = get_config()
    loc = (location or cfg.gcp_region).lower()
    project = project_id or cfg.gcp_project_id
    keyring_path = f"projects/{project}/locations/{loc}/keyRings/{keyring}"

    log.info("list_keys:start", keyring=keyring)
    client = _kms_client()

    try:
        keys = [
            {
                "name": k.name,
                "purpose": k.purpose.name,
                "rotation_period": k.rotation_period.seconds if k.rotation_period else None,
                "next_rotation_time": k.next_rotation_time.isoformat()
                if k.next_rotation_time
                else None,
            }
            for k in client.list_crypto_keys(request={"parent": keyring_path})
        ]
    except gexc.NotFound as exc:
        raise ResourceNotFound(f"Keyring {keyring} not found") from exc
    except gexc.GoogleAPIError as exc:
        raise GCPError(f"Failed to list keys in {keyring}: {exc}") from exc

    log.info("list_keys:success", count=len(keys))
    return keys
