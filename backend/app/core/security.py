"""JWT issuance and verification with audience binding (ADR-010)."""

from datetime import UTC, datetime, timedelta
from typing import Any, Literal

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.core.errors import Unauthorized

_pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

Audience = Literal["ops", "app", "portal"]


def hash_password(raw: str) -> str:
    return _pwd_ctx.hash(raw)


def verify_password(raw: str, hashed: str) -> bool:
    return _pwd_ctx.verify(raw, hashed)


def issue_access_token(
    *,
    subject: str,
    audience: Audience,
    tenant_schema: str | None,
    extra: dict[str, Any] | None = None,
) -> str:
    now = datetime.now(UTC)
    claims: dict[str, Any] = {
        "sub": subject,
        "aud": audience,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=settings.jwt_access_ttl_seconds)).timestamp()),
        "tenant_schema": tenant_schema,
    }
    if extra:
        claims.update(extra)
    return jwt.encode(claims, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str, *, audience: Audience) -> dict[str, Any]:
    try:
        return jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
            audience=audience,
        )
    except JWTError as exc:
        raise Unauthorized(f"invalid token: {exc}") from exc
