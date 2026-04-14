import re

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

# Schema-per-tenant: every request sets search_path to the active tenant schema.
# The schema name must come from a trusted source (JWT claim resolved to a tenant row).
# Identifiers cannot be bound as parameters in PostgreSQL, so we validate the shape
# before interpolating. Anything outside [a-z0-9_] is rejected.

_SCHEMA_RE = re.compile(r"^[a-z][a-z0-9_]{0,62}$")


class InvalidSchemaName(ValueError):
    pass


async def set_tenant_schema(session: AsyncSession, schema: str) -> None:
    if not _SCHEMA_RE.match(schema):
        raise InvalidSchemaName(schema)
    await session.execute(text(f'SET LOCAL search_path TO "{schema}", public'))
