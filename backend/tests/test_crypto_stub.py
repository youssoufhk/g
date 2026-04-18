"""Unit tests for the Confidential-tier envelope-encryption stub.

The goal is not to audit the crypto (LocalCryptoBackend is a dev
stub, not a real AEAD). The goal is to lock the contract so Phase 7
can swap in the Cloud KMS backend with zero call-site changes:

  * round-trip: decrypt(encrypt(p)) == p
  * tenant isolation: ciphertext for tenant A is gibberish for
    tenant B (same plaintext, different tenant -> different output)
  * empty plaintext stays empty
  * backend swap is observable via set_backend() / get_backend()
"""

from __future__ import annotations

from app.core.crypto import (
    CryptoBackend,
    LocalCryptoBackend,
    decrypt_column,
    encrypt_column,
    get_backend,
    set_backend,
)


def test_round_trip_preserves_plaintext() -> None:
    backend = LocalCryptoBackend(master_key=b"test-master-key")
    set_backend(backend)
    try:
        plain = b"FR7612345678901234567890123"
        cipher = encrypt_column("t_acme", plain)
        assert cipher != plain
        assert decrypt_column("t_acme", cipher) == plain
    finally:
        set_backend(LocalCryptoBackend(master_key=b"dev-only-not-a-real-key-change-me"))


def test_tenant_isolation_changes_stream() -> None:
    """Same plaintext, same key, different tenant -> different bytes.
    This is what keeps a cross-tenant SQL dump from revealing that
    two tenants share the same employee's IBAN."""
    backend = LocalCryptoBackend(master_key=b"test-master-key")
    set_backend(backend)
    try:
        plain = b"some-sensitive-value"
        cipher_a = encrypt_column("t_acme", plain)
        cipher_b = encrypt_column("t_other", plain)
        assert cipher_a != cipher_b
        # And a decrypt with the wrong tenant produces different
        # bytes (stub has no auth tag so it does not raise; the
        # assertion is only about isolation).
        assert decrypt_column("t_other", cipher_a) != plain
    finally:
        set_backend(LocalCryptoBackend(master_key=b"dev-only-not-a-real-key-change-me"))


def test_empty_plaintext_stays_empty() -> None:
    """Callers should not have to branch on nullable confidential
    columns: encrypt(b'') == b''."""
    assert encrypt_column("t_acme", b"") == b""
    assert decrypt_column("t_acme", b"") == b""


def test_set_backend_swaps_process_wide_default() -> None:
    """Phase 7 wiring flips the default backend at app startup; the
    swap is observable via get_backend()."""

    class _Fake(CryptoBackend):
        def encrypt(self, tenant_schema: str, plaintext: bytes) -> bytes:
            return b"FAKE:" + plaintext

        def decrypt(self, tenant_schema: str, ciphertext: bytes) -> bytes:
            assert ciphertext.startswith(b"FAKE:")
            return ciphertext[5:]

    previous = get_backend()
    set_backend(_Fake())
    try:
        assert encrypt_column("t_acme", b"hello") == b"FAKE:hello"
        assert decrypt_column("t_acme", b"FAKE:hello") == b"hello"
    finally:
        set_backend(previous)


def test_confidential_migration_shape() -> None:
    """The 20260418_1500 migration adds three confidential-tier
    pieces per DATA_ARCHITECTURE §6.9. Catch accidental removals
    before they reach Alembic."""
    import importlib.util
    from pathlib import Path

    path = (
        Path(__file__).resolve().parents[1]
        / "migrations"
        / "versions"
        / "20260418_1500_confidential_tier.py"
    )
    spec = importlib.util.spec_from_file_location("m", path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    assert module.revision == "20260418_1500"
    assert module.down_revision == "20260418_1400"
    src = path.read_text()
    assert "employee_compensation" in src
    assert "employee_banking" in src
    assert "protected_status_encrypted" in src
    assert "iban_encrypted" in src
    assert "bic_encrypted" in src
