"""Alembic environment.

Gamma uses schema-per-tenant (ADR-001). This env runs migrations against
either the ``public`` schema (shared tables: tenants, country_holidays,
etc.) or a specific tenant schema selected via the ``-x tenant=<schema>``
command-line flag.

Usage:
    alembic upgrade head                    # migrate public schema
    alembic -x tenant=t_acme upgrade head   # migrate tenant schema
"""

from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.core.config import settings
from app.core.database import Base

# Import every feature's models so Base.metadata sees them.
# Add new imports as feature modules land.

config = context.config
config.set_main_option(
    "sqlalchemy.url",
    settings.database_url.replace("+asyncpg", "+psycopg2"),
)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def _get_tenant_schema() -> str | None:
    x_args = context.get_x_argument(as_dictionary=True)
    return x_args.get("tenant")


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


def run_migrations_online() -> None:
    schema = _get_tenant_schema() or "public"
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        if schema != "public":
            connection.execute(
                # type: ignore[arg-type]
                __import__("sqlalchemy").text(
                    f'CREATE SCHEMA IF NOT EXISTS "{schema}"'
                )
            )
            connection.execute(
                __import__("sqlalchemy").text(f'SET search_path TO "{schema}", public')
            )
            connection.commit()

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_schemas=True,
            version_table_schema=schema,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
