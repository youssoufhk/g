# ADR-010: Three-app model

**Status:** Accepted

## Decision

Gamma serves three distinct audiences from one codebase, three subdomains, three Next.js route groups, three API surfaces, and three independent identity tables. There is **no crossover** between the three identity spaces.

| Audience | Subdomain | Purpose |
|---|---|---|
| **Operator** (founder's team) | `ops.gammahr.com` | Manage tenants, lifecycle, subscription invoices, custom contracts, feature flags, kill switches, migration status, residency audit artifacts, DPA versions. |
| **User** (customer employee) | `app.gammahr.com` | The main product. Time, clients, projects, invoices, expenses, leaves, approvals, dashboards, AI command palette. |
| **Portal user** (customer's client) | `portal.gammahr.com` | Read-only access for the customer's clients: view invoices, project status, basic communication. Ships late Phase 6. |

**Single wildcard cert** `*.gammahr.com` covers all three subdomains. Per-tenant vanity subdomains (`acme.gammahr.com`) are deferred to Tier 2 (DEF-005).

### Identity model

Three completely separate tables. A real person who is both an operator and an employee at a customer would need two accounts (never the case in practice since operators are founder's team, not customers).

```
public.operators         -- Founder's team. Passkey-only auth. No password, no TOTP fallback.
public.users             -- Customer employees. Tenant-scoped. OIDC-first, passkey, password fallback.
public.portal_users      -- Customers' clients. Tenant-scoped via recorded client_id.
                            Passkey-first, password fallback, TOTP available.
```

Each has its own session table: `operator_sessions`, `sessions`, `portal_sessions`. WebAuthn credentials are shared via `public.webauthn_credentials` with `subject_type ∈ {operator, user, portal_user}`.

### Auth strategies per audience

| Audience | Primary | Secondary | Fallback | Deferrals |
|---|---|---|---|---|
| Operator | WebAuthn passkey | None | None | No password ever. No TOTP fallback. Hardware key or platform authenticator required. |
| User | OIDC (Google Workspace, Microsoft Entra) via `authlib` | WebAuthn passkey | bcrypt password (rate-limited) | SCIM deferred (DEF-024), SAML deferred (DEF-025) |
| Portal user | WebAuthn passkey | bcrypt password | TOTP available | OIDC deferred (DEF-008) |

### API surfaces

| Route prefix | Audience | Notes |
|---|---|---|
| `/api/v1/ops/*` | Operator | Tenant management, feature flags, kill switches, subscription invoices, custom contracts, DPA versions, migration status, residency audit. |
| `/api/v1/*` | User (tenant employee) | The main product API. Tenant inferred from JWT. |
| `/api/v1/portal/*` | Portal user | Read-only for v1.0. Tenant and client inferred from JWT. |

### Next.js route groups

```
frontend/app/
  (ops)/       ← ops.gammahr.com
  (app)/       ← app.gammahr.com (the main product)
  (portal)/    ← portal.gammahr.com
```

Each group has its own layout (different sidebar, topbar, theme variant), its own middleware for auth routing, and its own set of components from the shared `components/ui/`, `components/patterns/`, and `components/shell/`.

### Impersonation

Operator → user is allowed, audited, and time-limited. Never the reverse.

Flow:
1. Operator clicks "Impersonate" on a tenant in the operator console.
2. Operator's passkey authenticator re-challenges (hardware touch required).
3. Backend mints a short-lived JWT tagged `actor_type=operator, impersonated_user_id=X, expires_in=30min`.
4. Operator is redirected to `app.gammahr.com` with the JWT, sees the UI exactly as the impersonated user.
5. Every mutation during the impersonated session is logged to `public.audit_log` with BOTH `actor_id = operator_id` and `on_behalf_of_id = impersonated_user_id`.
6. Session auto-expires after 30 minutes. Operator must re-challenge to extend.

**Per-tenant re-challenge.** When an operator starts impersonating a user in tenant T, the issued impersonation JWT carries `impersonated_user_id`, `impersonated_tenant_id=T`, and `expires_at = now + 30 minutes`. Switching to a different tenant T2 requires a fresh impersonation challenge (re-auth via passkey). This prevents a single impersonation session from leaking across tenant boundaries. Audit log entries during impersonation carry `actor_type=operator, on_behalf_of_user_id, on_behalf_of_tenant_id`.

**Impersonation tooling itself is deferred (DEF-002).** The JWT shape, audit contract, and auth flow are defined now so that the feature addition later is purely additive, not a refactor.

## Rationale

### Why three separate identity tables instead of one with roles

- **Security boundary.** An operator's compromised credential cannot be used to log into a customer tenant, and vice versa. Because the tables are physically separate, an attacker who gains `SELECT` on `public.users` cannot pivot to operator privileges.
- **Different auth stacks per audience.** Operators need passkey-only (zero-phish). Tenant users need SSO-first (because enterprise customers demand it). Portal users need password fallback (because random B2B2B clients cannot be expected to have SSO). A single users table would force the lowest-common-denominator auth posture, which is insecure for operators.
- **Different session semantics.** Operator sessions should be short (30 min) with frequent re-auth because the blast radius of a compromised operator session is the entire customer base. User sessions are 7 days (reasonable for daily use). Portal sessions are in between. Separate tables make the differences explicit rather than buried in role logic.
- **Different lifecycle.** Tenant users are created by the tenant admin (or via SSO auto-provisioning). Portal users are created by tenant users inviting their clients. Operators are created by the founder manually, with explicit founder approval per addition. The three lifecycles do not share much code and benefit from being separate.
- **Operator count is tiny.** At most 3-5 rows for the foreseeable future. The "benefit" of a unified table (fewer tables, fewer joins) is meaningless at that scale.
- **Audit clarity.** `audit_log.actor_type` values directly correspond to identity tables. Reporting "who did what" by audience is a trivial filter rather than a role-unwind.

### Why three subdomains on one apex instead of per-tenant subdomains

Per-tenant vanity URLs (`acme.gammahr.com`) add DNS automation, cert provisioning, routing complexity, and a real developer-experience tax. They are a recognized Tier 2 / Enterprise feature that customers ask for but almost never actually need. DEF-005 tracks them for later.

Three fixed subdomains (`ops`, `app`, `portal`) cover the three audiences with one wildcard cert, zero per-tenant DNS automation, and clean route-group isolation.

### Why three route groups in one codebase instead of three separate repos

- **Shared components** (`ui/`, `patterns/`, `shell/`) are the expensive part. Splitting repos means either duplicating them (version skew hell) or publishing them as a private npm package (tooling overhead without benefit).
- **Shared API layer.** All three audiences hit the same FastAPI backend. A separate frontend repo would still need the same OpenAPI client.
- **Deploy as one app.** Cloud Run runs one container, Cloudflare routes the three subdomains to it, Next.js middleware directs by hostname to the right route group. One deploy, three audiences.
- **Shared eval suite, shared test infra, shared feature flag system.** Splitting breaks all of this.

## Alternatives considered and rejected

- **Single `users` table with `user_type ∈ {operator, tenant_user, portal_user}`.** Rejected for the security-boundary and auth-stack reasons above.
- **Three separate Gamma deployments.** Rejected because it triples the hosting cost and ops burden for no product benefit. Three subdomains sharing one Cloud Run service solve the isolation problem at the routing layer, not the infrastructure layer.
- **Use a vendor IdP (Auth0, Clerk, WorkOS) to handle identity and skip the three-table split.** Rejected because it adds a hard external dependency for the most security-critical part of the stack, costs ongoing money, and locks us into their data model. The in-house implementation is 1-2 weeks of work with well-known libraries (`authlib`, `webauthn`, `argon2-cffi`) and gives full control.
- **Merge operator and tenant-user into one table with a superuser role.** Rejected because a compromised founder account would automatically have tenant data access, violating the GDPR processor/controller boundary where Gamma (processor) should never have direct access to customer data without an audited impersonation trail.

## Consequences

- **Three login routes** to build in Phase 2: `ops.gammahr.com/login` (passkey challenge), `app.gammahr.com/login` (OIDC selector → passkey → password), `portal.gammahr.com/login` (passkey → password → TOTP, ships Phase 6).
- **Three middleware chains** in Next.js, one per route group. Each handles its own auth redirect, tenant resolution, and theme.
- **Three API middleware chains** in FastAPI, one per route prefix. Each checks the matching identity and session tables.
- **Three JWT shapes**, all signed with the same key but with different `actor_type` claims and different expiry defaults.
- **Impersonation audit contract** must be defined and tested in Phase 2, even if the impersonation UI itself ships later (DEF-002).
- **Wildcard cert management** via Cloudflare. Set once, forget. Certificate renewal is Cloudflare's problem.
- **Per-app login pages cost more design time** than a single login page would. Acceptable tradeoff. Each login page matches its audience: ops is utilitarian and passkey-only, app is welcoming and offers SSO buttons, portal is minimal and friendly.
- **Session invalidation on role change.** Role mutations: demotion (admin to employee, employee to read-only) triggers `sessions.invalidate_where(user_id=?, previous_role=<old>)` in the same transaction. The user's active sessions across all devices are killed; their next request returns 401 and UI redirects to login, where they re-authenticate with the new role. Promotions do not invalidate sessions (the new role is merged on next token refresh). Operator role changes follow the same pattern. All transitions audited.
- **Cookie scoping and audience claim.** The access token cookie is set with `Domain=*.gammahr.com, Path=/, SameSite=Strict, Secure, HttpOnly`. Cookies are sent on any `*.gammahr.com` subdomain request, but each JWT carries an `audience` claim in `{ops, app, portal}`. Backend middleware enforces:
  - `/api/v1/ops/*` requires `audience=ops`
  - `/api/v1/*` (non-ops, non-portal) requires `audience=app`
  - `/api/v1/portal/*` requires `audience=portal`

  Any mismatch returns HTTP 403 Forbidden with `error=invalid_audience`. The middleware runs before routing. Refresh tokens are bound to the same audience at issue-time.
- **RBAC return code on privilege violation.** RBAC enforcement returns HTTP 403 Forbidden (not 404) on privilege violations, both for clarity and to simplify debugging. Tenant-scoping violations (user in tenant A trying to access tenant B data) also return 403. The trade-off: 403 vs 404 leaks endpoint existence to attackers, but obscurity-by-404 is not worth the debugging cost given the app's small, documented API surface.

## Follow-ups (required in Phase 2)

1. `public.operators` + `public.operator_sessions` tables (migration in Phase 2 public-schema migration).
2. `public.portal_users` + `public.portal_sessions` tables (tables exist from Phase 1, UI ships Phase 6).
3. `public.oidc_providers` table for per-tenant OIDC config.
4. `users.oidc_subject` column for federated identity linking.
5. FastAPI auth middleware for `/api/v1/ops/*`, `/api/v1/*`, `/api/v1/portal/*` with correct identity-table lookups.
6. Next.js route groups `(ops)`, `(app)`, `(portal)` with separate `layout.tsx`, `middleware.ts`, login pages.
7. JWT factory with `actor_type` claim and audience-specific expiry defaults.
8. Impersonation audit contract: `audit_log.actor_type`, `audit_log.on_behalf_of_id`, and a pytest metatest that asserts every impersonated mutation lands in the log.
9. Cloudflare DNS records for `ops`, `app`, `portal`, `mail` subdomains and the wildcard cert.
10. A readme in `backend/app/core/auth.py` documenting the three-stack decision tree for reviewers.

## Related decisions

- **ADR-001** (schema-per-tenant): identity tables live in `public`, business data in `tenant_<slug>`.
- **ADR-002** (authentication): supersedes JWT + session + passkey base rules with the three-audience refinement.
- **SSO-first auth for tenant users**: OIDC (Google Workspace, Microsoft Entra) is the primary path for `public.users`, with WebAuthn passkey as secondary and bcrypt password as fallback. Supersedes the passkey-first default from ADR-002 for this audience only.
- **Tenant user role model**: `users.role ∈ {owner, admin, manager, finance, employee, readonly}`, exactly one owner per tenant (transferable), owner is a strict superset of admin. Operators have no equivalent role enum (operators are binary: they are or they are not).
- **DSR fulfillment**: tenant admin handles most DSRs via self-service in the tenant admin console; operator has a manual escape hatch via `privacy@gammahr.com` for direct-to-Gamma inquiries.
- **DEF-002**: operator impersonation UI (JWT contract defined now, UI later).
- **DEF-008**: portal SSO (portal_users uses local auth only in v1.0).
- **DEF-024, DEF-025**: SCIM and SAML federation for tenant users.
