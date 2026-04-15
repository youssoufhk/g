"""Schema-per-tenant middleware (ADR-001).

Every request that targets a tenant-scoped endpoint has its active tenant
resolved here. The tenant schema name is stored in a ``ContextVar`` for the
request lifetime, and the ``get_session`` dependency in ``database.py`` reads
it and issues ``SET LOCAL search_path`` on the session it just opened.

Resolution order:
    1. the ``X-Tenant-Schema`` header (operator console impersonation, audited)
    2. the ``tenant_schema`` claim in the JWT access token
    3. no tenant (public endpoints: auth, health, meta)
"""

import re
from collections.abc import Awaitable, Callable
from contextvars import ContextVar

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.errors import TenantResolutionError

_TENANT_SCHEMA_RE = re.compile(r"\At_[a-z0-9_]{1,48}\Z")
_PUBLIC_PREFIXES: tuple[str, ...] = (
    "/health",
    "/api/v1/auth",
    "/api/v1/meta",
    "/docs",
    "/openapi.json",
    "/redoc",
)

current_tenant_schema: ContextVar[str | None] = ContextVar(
    "current_tenant_schema", default=None
)


def is_valid_tenant_schema(schema: str) -> bool:
    """Tenant schemas are ``t_<slug>`` where slug is lowercase alnum+underscore."""
    return bool(_TENANT_SCHEMA_RE.match(schema))


def set_current_tenant(schema: str | None) -> None:
    current_tenant_schema.set(schema)


def get_current_tenant() -> str | None:
    return current_tenant_schema.get()


class TenancyMiddleware(BaseHTTPMiddleware):
    """Resolve the tenant for the request and expose it to the session dep."""

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        if any(request.url.path.startswith(p) for p in _PUBLIC_PREFIXES):
            set_current_tenant(None)
            return await call_next(request)

        schema = request.headers.get("x-tenant-schema")
        if not schema:
            schema = _extract_from_jwt(request)

        if schema is not None and not is_valid_tenant_schema(schema):
            raise TenantResolutionError(f"invalid tenant schema: {schema!r}")

        set_current_tenant(schema)
        try:
            response = await call_next(request)
        finally:
            set_current_tenant(None)
        return response


def _extract_from_jwt(request: Request) -> str | None:
    """Pull the tenant schema claim from a Bearer token.

    Returns None if the request has no token, the token is invalid, the
    token's audience is not accepted here, or the claim is missing. A
    returned schema is always valid-shaped (``t_<slug>``).

    Both ``app`` and ``ops`` audiences are accepted so that operators can
    impersonate tenants from the ops console. Every impersonation action
    is audited separately in the admin service; this middleware picks the
    schema, it does not authorize.
    """
    from app.core.errors import Unauthorized
    from app.core.security import decode_access_token

    auth = request.headers.get("authorization", "")
    if not auth.lower().startswith("bearer "):
        return None
    token = auth[7:].strip()
    if not token:
        return None

    for audience in ("app", "ops"):
        try:
            claims = decode_access_token(token, audience=audience)
        except Unauthorized:
            continue
        schema = claims.get("tenant_schema")
        if isinstance(schema, str) and is_valid_tenant_schema(schema):
            return schema
        return None
    return None
