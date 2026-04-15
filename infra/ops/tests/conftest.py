"""Pytest fixtures for gamma_ops tests.

All fixtures are designed so tests can run offline without hitting real GCP
or Cloudflare endpoints. SDK clients are mocked at the module boundary.
"""

from __future__ import annotations

import os
import uuid
from collections.abc import Iterator
from unittest.mock import MagicMock

import pytest

from gamma_ops.config import reset_config_cache
from gamma_ops.logging import setup_logging


@pytest.fixture(autouse=True)
def _configure_logging() -> None:
    """Ensure structlog is configured for every test."""
    setup_logging("DEBUG")


@pytest.fixture
def monkeypatch_env(monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    """Set safe default env vars for the ops library.

    Tests that want a specific override should set it after this fixture runs.
    """
    monkeypatch.setenv("GCP_PROJECT_ID", "gamma-test")
    monkeypatch.setenv("GCP_REGION", "europe-west9")
    monkeypatch.setenv("GAMMA_ENV", "staging")
    monkeypatch.setenv("LOG_LEVEL", "DEBUG")
    # Prevent any real Cloudflare call.
    monkeypatch.delenv("CLOUDFLARE_API_TOKEN", raising=False)
    reset_config_cache()
    yield
    reset_config_cache()


@pytest.fixture
def tmp_bucket_name() -> str:
    """Return a unique bucket name for a single test."""
    return f"gamma-test-{uuid.uuid4().hex[:12]}"


@pytest.fixture
def mock_gcs_client(monkeypatch: pytest.MonkeyPatch) -> MagicMock:
    """Patch gamma_ops.gcp.storage._storage_client to return a MagicMock.

    Tests can customize the returned client (e.g. set .get_bucket to raise
    NotFound) via mock_gcs_client.get_bucket.side_effect.
    """
    client = MagicMock(name="GCSClient")
    monkeypatch.setattr(
        "gamma_ops.gcp.storage._storage_client",
        lambda project_id=None: client,
    )
    return client
