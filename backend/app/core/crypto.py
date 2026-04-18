"""Envelope-encryption stub for Confidential-tier columns.

``specs/DATA_ARCHITECTURE.md`` section 8.1 specifies CMEK (Cloud KMS
customer-managed encryption keys) with a per-tenant keyring. That
lands in Phase 7. Until then this module provides a deterministic
pgcrypto-backed fallback so:

* the column shape is right (``BYTEA`` everywhere),
* the service layer already calls ``encrypt_column()`` /
  ``decrypt_column()``, so the Phase 7 rollout is a provider swap
  with zero call-site changes,
* tests can round-trip values without a Postgres server.

The dev backend is the ``LocalCryptoBackend`` below which XORs
against a per-tenant HMAC key. It is NOT a real AEAD and MUST NOT be
deployed to production. ``Settings.crypto_backend`` gates the swap in
Phase 7 the same way ``ai_backend`` and ``blob_backend`` do.

Call contract:

    ciphertext = encrypt_column(tenant_schema, plaintext)
    plaintext  = decrypt_column(tenant_schema, ciphertext)

``plaintext`` is ``bytes``; callers that want to encrypt strings
encode to UTF-8 first. Empty plaintext returns ``b""`` unchanged so
callers do not have to branch on nullable columns.
"""

from __future__ import annotations

import hashlib
import hmac
from typing import Protocol


class CryptoBackend(Protocol):
    def encrypt(self, tenant_schema: str, plaintext: bytes) -> bytes: ...

    def decrypt(self, tenant_schema: str, ciphertext: bytes) -> bytes: ...


class LocalCryptoBackend:
    """Dev-only backend. XOR + HMAC-SHA256 streamed key. Not
    authenticated encryption; good enough to keep Confidential-tier
    bytes out of plain SQL reads on a dev laptop.

    The master key comes from ``Settings.crypto_dev_master_key`` so the
    same dev seed is reproducible across machines. Rotating the key
    makes previously encrypted blobs unreadable, which is the intended
    semantics of this stub.
    """

    def __init__(self, master_key: bytes) -> None:
        self._master = master_key

    def _stream(self, tenant_schema: str, length: int) -> bytes:
        out = bytearray()
        counter = 0
        while len(out) < length:
            block = hmac.new(
                self._master,
                tenant_schema.encode("utf-8") + counter.to_bytes(8, "big"),
                hashlib.sha256,
            ).digest()
            out.extend(block)
            counter += 1
        return bytes(out[:length])

    def encrypt(self, tenant_schema: str, plaintext: bytes) -> bytes:
        if not plaintext:
            return b""
        stream = self._stream(tenant_schema, len(plaintext))
        return bytes(p ^ s for p, s in zip(plaintext, stream, strict=True))

    def decrypt(self, tenant_schema: str, ciphertext: bytes) -> bytes:
        # XOR is its own inverse.
        return self.encrypt(tenant_schema, ciphertext)


_default_backend: CryptoBackend = LocalCryptoBackend(
    master_key=b"dev-only-not-a-real-key-change-me"
)


def get_backend() -> CryptoBackend:
    return _default_backend


def set_backend(backend: CryptoBackend) -> None:
    """Tests and Phase 7 deploy wiring use this to swap the backend."""
    global _default_backend
    _default_backend = backend


def encrypt_column(tenant_schema: str, plaintext: bytes) -> bytes:
    return get_backend().encrypt(tenant_schema, plaintext)


def decrypt_column(tenant_schema: str, ciphertext: bytes) -> bytes:
    return get_backend().decrypt(tenant_schema, ciphertext)
