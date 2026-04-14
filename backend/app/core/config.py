from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "dev"
    app_secret_key: str = "change-me"

    database_url: str = "postgresql+asyncpg://gammahr:gammahr@localhost:5432/gammahr"
    redis_url: str = "redis://localhost:6379/0"

    jwt_algorithm: str = "HS256"
    jwt_access_ttl_minutes: int = 15
    jwt_refresh_ttl_days: int = 7

    anthropic_api_key: str = ""

    s3_endpoint: str = ""
    s3_bucket: str = "gammahr-dev"
    s3_access_key: str = ""
    s3_secret_key: str = ""
    s3_region: str = "eu-west-3"

    meili_url: str = "http://localhost:7700"
    meili_master_key: str = ""

    resend_api_key: str = ""
    log_level: str = "info"

    cors_origins: list[str] = ["http://localhost:3000"]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
