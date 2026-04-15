"""GCP operation modules for the Gamma ops library.

Each submodule wraps one GCP product area with deterministic, idempotent
functions. Callers import the function they need, never the underlying
google-cloud-* client.
"""

from __future__ import annotations

__all__ = [
    "projects",
    "storage",
    "kms",
    "secrets",
    "cloudsql",
    "cloudrun",
    "iam",
    "monitoring",
    "scheduler",
    "pubsub",
]
