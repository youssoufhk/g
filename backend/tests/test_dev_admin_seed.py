"""Lock the dev admin password hash in the seed migration to the
documented credential ``gamma_dev_password``.

The seed migration at 20260416_0910 ships a pre-computed bcrypt hash
so the Alembic upgrade does not need to import passlib. This test runs
the hash through passlib.verify() to catch any accidental drift (hash
regenerated with a new cost factor, typo when copying, etc.).

If this test fails after intentionally changing the dev password:
  1. regenerate the hash with:
     backend/.venv/bin/python -c "
     from passlib.context import CryptContext
     print(CryptContext(schemes=['bcrypt']).hash('<new dev password>'))
     "
  2. paste it into the migration's DEV_ADMIN_PASSWORD_HASH constant
  3. update the docstring + this test's expected password
  4. rerun pytest
"""

import importlib.util
from pathlib import Path

from passlib.context import CryptContext

DEV_PASSWORD = "gamma_dev_password"
MIGRATION_PATH = (
    Path(__file__).resolve().parents[1]
    / "migrations"
    / "versions"
    / "20260416_0910_seed_dev_tenant_and_admin.py"
)


def _load_migration_module():
    spec = importlib.util.spec_from_file_location(
        "seed_dev_tenant_and_admin", MIGRATION_PATH
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_dev_admin_password_hash_matches_documented_credential() -> None:
    module = _load_migration_module()
    ctx = CryptContext(schemes=["bcrypt"])
    assert ctx.verify(DEV_PASSWORD, module.DEV_ADMIN_PASSWORD_HASH), (
        "The DEV_ADMIN_PASSWORD_HASH constant in "
        "migrations/versions/20260416_0910_seed_dev_tenant_and_admin.py does "
        f"not verify against the documented password {DEV_PASSWORD!r}. Either "
        "regenerate the hash or update the docs."
    )


def test_dev_admin_password_hash_rejects_wrong_password() -> None:
    module = _load_migration_module()
    ctx = CryptContext(schemes=["bcrypt"])
    assert not ctx.verify("not-the-dev-password", module.DEV_ADMIN_PASSWORD_HASH)
