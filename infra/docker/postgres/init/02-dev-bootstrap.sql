-- Gamma dev Postgres bootstrap: stub test tenant marker.
--
-- This is a dev-only sentinel table that proves the init scripts ran. Real
-- tenant provisioning comes from the backend tenant service and its Alembic
-- migrations in section 3.2 (see specs/DATA_ARCHITECTURE.md section 3).
-- Alembic will not touch the `_dev_bootstrap` table.
--
-- Verify with:
--   psql postgresql://gamma:gamma_dev_password@localhost:5432/gamma_dev \
--     -c "SELECT * FROM _dev_bootstrap"
--
-- Reference: EXECUTION_CHECKLIST.md section 3.1

CREATE TABLE IF NOT EXISTS _dev_bootstrap (
    name        TEXT PRIMARY KEY,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO _dev_bootstrap (name) VALUES
    ('gamma_dev_tenant_stub')
ON CONFLICT (name) DO NOTHING;
