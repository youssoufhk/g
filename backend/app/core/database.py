from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    """SQLAlchemy declarative base for every model in the app."""


_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def get_engine() -> AsyncEngine:
    global _engine
    if _engine is None:
        _engine = create_async_engine(
            settings.database_url,
            echo=False,
            pool_pre_ping=True,
            future=True,
        )
    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(
            bind=get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
        )
    return _session_factory


@asynccontextmanager
async def session_scope() -> AsyncIterator[AsyncSession]:
    """Context manager for background tasks and CLI tools.

    Route handlers should use the ``get_session`` FastAPI dependency instead
    so the session is bound to the request and tenancy scoping is applied.
    """
    factory = get_session_factory()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def get_session() -> AsyncIterator[AsyncSession]:
    """FastAPI dependency. Yields a session scoped to the request's tenant.

    The tenant comes from the :class:`TenancyMiddleware` via ``ContextVar``.
    We issue ``SET LOCAL search_path`` so the per-tenant scope is transaction
    bound and does not leak to the connection pool.
    """
    from app.core.tenancy import get_current_tenant, is_valid_tenant_schema

    factory = get_session_factory()
    async with factory() as session:
        schema = get_current_tenant()
        if schema is not None and is_valid_tenant_schema(schema):
            await session.execute(
                text(f'SET LOCAL search_path TO "{schema}", public')
            )
        yield session
