# ADR-002: Authentication (base rules)

**Status:** Accepted, **partially superseded by ADR-010** (the three-app model). Read ADR-010 alongside this file for the per-audience auth strategies.
**Last updated:** 2026-04-15

## Decision

JWT (15 min) access + opaque rotating refresh (7 days) + WebAuthn passkeys + TOTP MFA. **Per-audience strategies are defined in ADR-010, section "Auth strategies per audience"; this ADR covers the shared primitives.**

| Element | Detail |
|---------|--------|
| Access token | Signed JWT with `tenant_id`, `user_id`, `role`, `actor_type`, `iat`, `exp`. 15 min expiry. HttpOnly cookie + memory. The `actor_type` claim distinguishes operator/user/portal_user per ADR-010. |
| Refresh token | Opaque 256-bit random, stored hashed in the audience-specific session table (`operator_sessions`, `sessions`, `portal_sessions`), rotated on every use. 7 day expiry for tenant users, 30 min for operators, 7 days for portal users. HttpOnly SameSite=Strict cookie. |
| Passkey | WebAuthn (`public.webauthn_credentials`), one of the three auth paths per audience. **For tenant users, OIDC is the primary path and passkey is secondary** (per ADR-010); for operators, passkey is the only path. |
| Password fallback | bcrypt cost 12, zxcvbn min score 3. **Operators have no password path.** Tenant users and portal users have password as the last fallback. |
| OIDC (tenant users only) | Google Workspace and Microsoft Entra via `authlib`, primary path for `public.users`. Per-tenant configuration in `public.oidc_providers`. SCIM and SAML deferred (DEF-024, DEF-025). |
| MFA | TOTP mandatory for tenant admins, optional for others, enforceable per tenant. **Operators do not use TOTP**: passkey is the only factor. 10 single-use recovery codes, hashed. |

## Rationale

- Short-lived access tokens limit blast radius.
- Refresh rotation detects theft (reuse = invalidate family).
- WebAuthn eliminates phishing entirely for passkey users.
- HttpOnly + SameSite defeats XSS cookie theft.
- Three identity tables and three auth strategies (one per audience) keep the security boundary physical, not role-based. See ADR-010 for the full rationale.

## Rejected

- **Opaque bearer only:** more DB round-trips per request.
- **Magic links as primary:** friction for daily users. Magic-link invite is used only for the first-employee onboarding flow (`/invite/[token]`).
- **SMS MFA:** SIM swap attacks.
- **Passkey-only for tenant users (the original ADR-002 default):** rejected because enterprise customers demand SSO-first onboarding. ADR-010 supersedes this for `public.users`.

## Consequences

- Must implement refresh rotation + reuse detection per audience.
- Cross-platform WebAuthn support required (iOS/Android/desktop).
- Recovery flow for lost devices, separately per audience.
- **OIDC ships in Phase 3, not v1.1.** The original ADR-002 deferred OIDC; ADR-010 brought it forward because tenant-user SSO is a hard requirement for the canonical first customer.
- **Session invalidation on password mutation.** Password mutations (set new password, reset password, admin forced reset) call `sessions.invalidate_all_for_user(user_id)` within the same database transaction. All active sessions for that user across all devices are terminated; their refresh tokens are marked revoked in `public.refresh_tokens_revoked` (or the equivalent table). Next request on any terminated session returns 401, client redirects to login. The invalidation event is written to `audit_log` with `event_type = session_invalidation_on_password_change`. Tested in CI: change password, verify prior session 401s immediately.
- **Account lockout.** 5 failed password attempts within a 15-minute window triggers a 15-minute lockout on the account. During lockout, even valid credentials return a generic "Invalid credentials" error (no lockout disclosure to avoid enumeration). The user receives an email alert on first failed-attempt burst and on lockout. Lockout counter resets on successful login or after the lockout window expires. Operators can force-unlock via the operator console with an audit trail. Rate limiting is additionally enforced at the Cloudflare WAF layer for raw IP-based abuse.
- **TOTP recovery code lifecycle.** 10 single-use recovery codes generated at MFA enrollment, displayed once, hashed at rest (Argon2id). User can regenerate the set at any time from Account Settings > Security, gated by password re-confirmation; regeneration invalidates all previously-issued codes and is audited. The UI shows remaining-code count on the security page and surfaces a yellow warning banner when 3 or fewer remain. If all codes are exhausted and the device is lost, the only recovery path is operator impersonation via the operator console (founder-only during Phase 2). Operators (ops.gammahr.com users) get printed recovery codes stored offline by the founder as the escape hatch for their passkey; see ADR-010 for the founder day-0 procedure.
- **Password breach check.** On password set, the server checks the new password against the top 10,000 most-breached passwords (local bundled list; no external API call at set-time). Users picking a breached password get a soft block: "This password appears in known breaches. Pick another." Periodic background breach checks against existing user passwords are deferred (new DEF entry; requires the full HIBP database or equivalent).

## Related decisions

- **ADR-010** (three-app model) is the authoritative source for per-audience auth flows; this ADR covers the shared JWT/refresh/passkey/MFA primitives.
- **DEF-024** SCIM provisioning, **DEF-025** SAML federation, **DEF-008** portal SSO.
