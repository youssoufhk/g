-- Gamma dev Postgres bootstrap: shared extensions.
--
-- Alembic migrations (coming in section 3.2) will assume these extensions
-- are present. Enabling them here keeps migrations free of superuser DDL.
--
-- Reference: EXECUTION_CHECKLIST.md section 3.1

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
