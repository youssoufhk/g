import json
from functools import lru_cache
from typing import Annotated, Any

from pydantic import BeforeValidator, Field
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


def _split_cors_origins(value: Any) -> Any:
    """Accept CORS_ORIGINS as a comma-separated string, a JSON array, or a list.

    Pydantic-settings v2 tries ``json.loads()`` on any env var destined for a
    list field, which blows up on ``http://a,http://b``. Combining
    ``NoDecode`` (skip the JSON parse) with this ``BeforeValidator`` lets us
    accept any of: a bare URL, a comma-separated list, a JSON array, or a
    Python list. Keeps compose files and .env files readable.
    """
    if isinstance(value, str):
        stripped = value.strip()
        if not stripped:
            return []
        if stripped.startswith("["):
            return json.loads(stripped)
        return [item.strip() for item in stripped.split(",") if item.strip()]
    return value


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_env: str = "dev"
    app_name: str = "gamma"
    log_level: str = "info"

    database_url: str = (
        "postgresql+asyncpg://gamma:gamma_dev_password@localhost:5432/gamma_dev"
    )
    redis_url: str = "redis://localhost:6379/0"

    jwt_secret_key: str = "dev-only-not-a-real-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_access_ttl_seconds: int = 900
    jwt_refresh_ttl_seconds: int = 2_592_000

    cors_origins: Annotated[list[str], NoDecode, BeforeValidator(_split_cors_origins)] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
    )

    smtp_host: str = "localhost"
    smtp_port: int = 1025
    smtp_from: str = "noreply@gamma.local"

    # Vendor wrapper selection. See backend/app/{ai,storage,email,...}/.
    # Dev defaults use stubs or local-only backends; staging + prod flip via
    # env vars at section 16 Deploy Track.
    ai_backend: str = "mock"          # mock | ollama | vertex
    blob_backend: str = "local"       # local | gcs
    email_backend: str = "mailpit"    # mailpit | workspace
    ocr_backend: str = "mock"         # mock | gemini
    telemetry_backend: str = "stdout" # stdout | cloudmonitoring

    local_blob_root: str = "./tmp/dev-blobs"

    # Ollama (self-hosted LLM, default AI backend under dev).
    # In Docker the backend container reaches the host's ollama via
    # host.docker.internal. On the host directly, use localhost.
    ollama_host: str = "http://host.docker.internal:11434"
    ollama_model: str = "gemma3"
    ollama_timeout_seconds: int = 120


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
