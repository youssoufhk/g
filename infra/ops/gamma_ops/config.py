"""Configuration loader for the Gamma ops library.

Loads non-secret identifiers and the Cloudflare API token from environment
variables (or a local `.env` file). GCP credentials are NEVER loaded from
this file; the Google SDKs use Application Default Credentials (ADC).

Usage:
    from gamma_ops.config import get_config

    cfg = get_config()
    print(cfg.gcp_project_id, cfg.gcp_region)
"""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class OpsConfig(BaseSettings):
    """Gamma ops library configuration, loaded from environment or `.env`.

    Purpose:
        Provide a single typed configuration surface for every operation in
        the library. No module reads os.environ directly; they all go through
        `get_config()`.

    Idempotency notes:
        Config loading is cached via lru_cache at the module level, so
        calling `get_config()` repeatedly is free and returns the same
        instance for the lifetime of the process.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    gcp_project_id: str = Field(
        default="gamma-staging",
        description="Default GCP project ID for operations.",
    )
    gcp_region: str = Field(
        default="europe-west9",
        description="Default GCP region. Locked to europe-west9 by Org Policy.",
    )
    gcp_billing_account_id: str | None = Field(
        default=None,
        description="Billing account ID for create_project linking.",
    )

    cloudflare_api_token: SecretStr | None = Field(
        default=None,
        description="Cloudflare scoped API token.",
    )
    cloudflare_zone_id: str | None = Field(
        default=None,
        description="Cloudflare zone ID for gammahr.com.",
    )

    gamma_env: Literal["dev", "staging", "prod"] = Field(
        default="staging",
        description="Environment label, also used for resource tagging.",
    )
    log_level: str = Field(
        default="INFO",
        description="Logging level: DEBUG, INFO, WARNING, ERROR.",
    )


@lru_cache(maxsize=1)
def get_config() -> OpsConfig:
    """Return the singleton OpsConfig for this process.

    Purpose:
        Cached accessor for the library configuration. Every module that
        needs config imports this function rather than constructing its own
        OpsConfig instance.

    Returns:
        The OpsConfig singleton.

    Example:
        >>> from gamma_ops.config import get_config
        >>> cfg = get_config()
        >>> cfg.gcp_region
        'europe-west9'
    """
    return OpsConfig()


def reset_config_cache() -> None:
    """Clear the OpsConfig singleton. Intended for tests only."""
    get_config.cache_clear()
