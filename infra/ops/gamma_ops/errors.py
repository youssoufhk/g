"""Typed exception hierarchy for the Gamma ops library.

Every SDK call inside a gamma_ops function is wrapped in try-except that
translates vendor errors into one of these OpsError subclasses. Callers
handle only gamma_ops exceptions and never have to import
google.api_core.exceptions directly.
"""

from __future__ import annotations


class OpsError(Exception):
    """Base class for every error raised by gamma_ops operations."""


class ConfigError(OpsError):
    """Raised when required configuration is missing or invalid."""


class AuthenticationError(OpsError):
    """Raised when Application Default Credentials fail or are missing."""


class GCPError(OpsError):
    """Base class for errors coming from a Google Cloud SDK call."""


class ResourceAlreadyExists(OpsError):
    """Raised by strict create functions when a resource exists.

    Idempotent create functions generally CATCH this internally and return
    the existing resource. It is still raised to callers that asked for
    strict (non-idempotent) behavior via a `strict=True` flag.
    """


class ResourceNotFound(OpsError):
    """Raised when a lookup by name or id returns no result."""


class PreconditionFailed(OpsError):
    """Raised when an operation's preconditions are not met.

    Example: asking to rotate a CryptoKey that has no active primary version,
    or creating a bucket in a region that Org Policy forbids.
    """


class CloudflareError(OpsError):
    """Base class for errors from the Cloudflare REST API."""


class TenantError(OpsError):
    """Base class for errors in tenant provisioning, deletion, or migration."""


class MigrationError(TenantError):
    """Raised when an Alembic migration fails on a tenant schema."""


class DriftDetected(TenantError):
    """Raised when a tenant schema diverges from the canonical baseline."""
