"""Unit tests for gamma_ops.gcp.storage.create_bucket.

Every test mocks the google.cloud.storage.Client at the gamma_ops module
boundary so nothing touches real GCP. These tests are deterministic, fast,
and safe to run on a laptop without credentials.
"""

from __future__ import annotations

from unittest.mock import MagicMock

import pytest
from google.api_core import exceptions as gexc

from gamma_ops.errors import GCPError, PreconditionFailed
from gamma_ops.gcp.storage import create_bucket


def _make_existing_bucket(
    name: str = "gamma-test-existing",
    location: str = "europe-west9",
    storage_class: str = "STANDARD",
    cmek_key: str | None = None,
) -> MagicMock:
    """Build a fake google.cloud.storage.Bucket for use as a get_bucket result."""
    bucket = MagicMock(name=f"Bucket({name})")
    bucket.name = name
    bucket.location = location
    bucket.storage_class = storage_class
    bucket.default_kms_key_name = cmek_key
    return bucket


def test_create_bucket_happy_path(
    monkeypatch_env: None, mock_gcs_client: MagicMock
) -> None:
    """First call creates a new bucket when none exists."""
    # get_bucket raises NotFound; create_bucket returns a new MagicMock bucket.
    mock_gcs_client.get_bucket.side_effect = gexc.NotFound("missing")

    created = _make_existing_bucket(name="gamma-happy", location="europe-west9")
    mock_gcs_client.create_bucket.return_value = created

    result = create_bucket("gamma-happy", location="europe-west9")

    assert result["created"] is True
    assert result["name"] == "gamma-happy"
    assert result["location"] == "europe-west9"
    assert result["cmek_key"] is None

    mock_gcs_client.get_bucket.assert_called_once_with("gamma-happy")
    assert mock_gcs_client.create_bucket.called
    # The bucket should have been patched after creation to apply IAM config.
    assert created.patch.called


def test_create_bucket_idempotent_returns_existing(
    monkeypatch_env: None, mock_gcs_client: MagicMock
) -> None:
    """Second call returns the existing bucket without creating a new one."""
    existing = _make_existing_bucket(name="gamma-idem", location="europe-west9")
    mock_gcs_client.get_bucket.return_value = existing

    result = create_bucket("gamma-idem", location="europe-west9")

    assert result["created"] is False
    assert result["name"] == "gamma-idem"
    assert result["location"] == "europe-west9"
    mock_gcs_client.create_bucket.assert_not_called()


def test_create_bucket_applies_cmek_key(
    monkeypatch_env: None, mock_gcs_client: MagicMock
) -> None:
    """CMEK key is passed through and stored on the resulting bucket."""
    mock_gcs_client.get_bucket.side_effect = gexc.NotFound("missing")

    cmek = (
        "projects/gamma-test/locations/europe-west9/keyRings/gamma-tenant/"
        "cryptoKeys/default"
    )
    created = _make_existing_bucket(name="gamma-cmek", cmek_key=cmek)
    mock_gcs_client.create_bucket.return_value = created

    result = create_bucket("gamma-cmek", cmek_key=cmek)

    assert result["cmek_key"] == cmek
    # Verify that the Bucket() object passed to client.create_bucket had the
    # default_kms_key_name set before the call.
    call_args = mock_gcs_client.create_bucket.call_args
    passed_bucket = call_args.args[0] if call_args.args else call_args.kwargs.get("bucket")
    assert passed_bucket.default_kms_key_name == cmek


def test_create_bucket_wrong_region_raises_precondition(
    monkeypatch_env: None, mock_gcs_client: MagicMock
) -> None:
    """If the bucket exists in a different region, raise PreconditionFailed."""
    existing = _make_existing_bucket(name="gamma-region", location="us-central1")
    mock_gcs_client.get_bucket.return_value = existing

    with pytest.raises(PreconditionFailed) as excinfo:
        create_bucket("gamma-region", location="europe-west9")

    assert "us-central1" in str(excinfo.value)
    assert "europe-west9" in str(excinfo.value)
    mock_gcs_client.create_bucket.assert_not_called()


def test_create_bucket_cmek_mismatch_raises_precondition(
    monkeypatch_env: None, mock_gcs_client: MagicMock
) -> None:
    """If the bucket exists with a different CMEK, raise PreconditionFailed."""
    existing = _make_existing_bucket(
        name="gamma-cmek-mismatch",
        cmek_key="projects/X/locations/europe-west9/keyRings/old/cryptoKeys/k",
    )
    mock_gcs_client.get_bucket.return_value = existing

    with pytest.raises(PreconditionFailed):
        create_bucket(
            "gamma-cmek-mismatch",
            location="europe-west9",
            cmek_key="projects/X/locations/europe-west9/keyRings/new/cryptoKeys/k",
        )


def test_create_bucket_api_failure_wraps_in_gcp_error(
    monkeypatch_env: None, mock_gcs_client: MagicMock
) -> None:
    """Generic API errors are translated to GCPError."""
    mock_gcs_client.get_bucket.side_effect = gexc.NotFound("missing")
    mock_gcs_client.create_bucket.side_effect = gexc.ServiceUnavailable("flaky")

    with pytest.raises(GCPError):
        create_bucket("gamma-flaky", location="europe-west9")


def test_create_bucket_race_conflict_returns_existing(
    monkeypatch_env: None, mock_gcs_client: MagicMock
) -> None:
    """If create_bucket races against another caller, fetch and return existing."""
    # First get_bucket: NotFound (no pre-existing).
    # create_bucket: Conflict (race).
    # Second get_bucket: returns existing.
    existing = _make_existing_bucket(name="gamma-race", location="europe-west9")
    mock_gcs_client.get_bucket.side_effect = [
        gexc.NotFound("missing"),
        existing,
    ]
    mock_gcs_client.create_bucket.side_effect = gexc.Conflict("exists")

    result = create_bucket("gamma-race", location="europe-west9")

    assert result["created"] is False
    assert result["name"] == "gamma-race"
