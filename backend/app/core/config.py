from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


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

    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
    )

    smtp_host: str = "localhost"
    smtp_port: int = 1025
    smtp_from: str = "noreply@gamma.local"

    ai_backend: str = "mock"
    blob_backend: str = "local"
    email_backend: str = "mailhog"
    ocr_backend: str = "mock"
    telemetry_backend: str = "stdout"

    local_blob_root: str = "./tmp/dev-blobs"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
