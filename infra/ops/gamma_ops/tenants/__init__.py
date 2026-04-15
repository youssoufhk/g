"""Tenant lifecycle operations (provision, delete, migrate, drift).

Wraps the backend provisioning service via HTTPS calls to the operator
console API; does not import backend code directly.
"""

from __future__ import annotations

__all__ = ["provision", "delete", "migrate", "drift"]
