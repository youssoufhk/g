# ADR-002: Authentication

**Status:** Accepted

## Decision

JWT (15 min) access + opaque rotating refresh (7 days) + WebAuthn passkeys + TOTP MFA.

| Element | Detail |
|---------|--------|
| Access token | Signed JWT with `tenant_id`, `user_id`, `role`, `iat`, `exp`. 15 min expiry. HttpOnly cookie + memory. |
| Refresh token | Opaque 256-bit random, stored hashed in `sessions`, rotated on every use. 7 day expiry. HttpOnly SameSite=Strict cookie. |
| Passkey | WebAuthn, preferred path. |
| Password fallback | bcrypt cost 12, zxcvbn min score 3. Optional if user has a passkey. |
| MFA | TOTP mandatory for admins, optional for others, enforceable per tenant. 10 single-use recovery codes, hashed. |

## Rationale

- Short-lived access tokens limit blast radius.
- Refresh rotation detects theft (reuse = invalidate family).
- WebAuthn eliminates phishing entirely for passkey users.
- HttpOnly + SameSite defeats XSS cookie theft.

## Rejected

- **Opaque bearer only:** more DB round-trips per request.
- **Magic links as primary:** friction for daily users.
- **SMS MFA:** SIM swap attacks.

## Consequences

- Must implement refresh rotation + reuse detection.
- Cross-platform WebAuthn support required (iOS/Android/desktop).
- Recovery flow for lost devices.
- SSO (Google/Microsoft OIDC) deferred to v1.1.
