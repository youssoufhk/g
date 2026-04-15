"""Auth service skeleton.

Real password verification, OIDC, passkey, MFA ship in Phase 3. The
skeleton exists so other features can import ``require_user`` today
without Phase 3 being done yet.
"""

from dataclasses import dataclass


@dataclass
class AuthenticatedUser:
    subject: str
    audience: str
    tenant_schema: str | None
    roles: list[str]
