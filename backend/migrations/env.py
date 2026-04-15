"""Alembic environment.

Gamma uses schema-per-tenant (ADR-001). This env runs migrations against
either the ``public`` schema (shared tables: tenants, country_holidays,
audit_log) or a specific tenant schema selected via the ``-x tenant=<schema>``
command-line flag.

The env uses SQLAlchemy async (asyncpg) via ``async_engine_from_config``
and ``connection.run_sync``, so no sync driver (psycopg2) is required.
This matches the runtime app's driver choice and keeps pyproject lean.

Usage:
    alembic upgrade head                    # migrate public schema
    alembic -x tenant=t_acme upgrade head   # migrate tenant schema
"""

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool, text
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from app.core.config import settings
from app.core.database import Base

# Import every feature's models so ``Base.metadata`` sees them. Add new
# imports as feature modules land.
from app.features.admin import models as _admin_models  # noqa: F401

config = context.config
config.set_main_option("sqlalchemy.url", settings.database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def _get_tenant_schema() -> str | None:
    x_args = context.get_x_argument(as_dictionary=True)
    return x_args.get("tenant")


def _run_migrations(connection: Connection, schema: str) -> None:
    if schema != "public":
        connection.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{schema}"'))
        connection.execute(text(f'SET search_path TO "{schema}", public'))

    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        include_schemas=True,
        version_table_schema=schema,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_offline() -> None:
    schema = _get_tenant_schema() or "public"
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_schemas=True,
        version_table_schema=schema,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online_async() -> None:
    schema = _get_tenant_schema() or "public"
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(_run_migrations, schema)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_migrations_online_async())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
