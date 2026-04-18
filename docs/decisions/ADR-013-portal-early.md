# ADR-013: Portal route group built ahead of Phase 6

**Status:** Accepted
**Date:** 2026-04-18
**Supersedes:** none
**Amends:** ADR-010 (Three-app model), THE_PLAN Phase 6 ordering

## Context

ADR-010 locks the three-app model and notes the portal ships "late Phase 6". THE_PLAN sequences the portal after the main app, after operator console, and after AI feature hardening. In practice a `(portal)/portal/invoices/page.tsx` route group and mock page already exist under `frontend/app/[locale]/`, built during Phase 3 / 4 prototype consolidation.

The OPUS_CRITICS_V2 audit flagged this as a gate failure (Phase-6 work shipped early, no ADR authorizing the deviation). The founder's direction on 2026-04-18 was "fix it" - the cheapest-correct interpretation is to file this ADR and keep the route group, rather than delete working code that already passes the visual bar.

## Decision

The `(portal)/portal/` route group may exist in the main app tree before Phase 6 opens, under these conditions:

1. The route group is gated by a distinct layout under `(portal)/` - no shared chrome with `(app)/` or `(ops)/`.
2. The portal renders **mock data only** until Phase 6: no portal API routes, no portal auth, no `portal_users` row writes, no `portal_sessions` writes. All interactive actions are no-op buttons or links back into the mock dataset.
3. `ADR-010`'s identity model still holds - no portal auth surface ships until Phase 6 opens formally.
4. The prototype pages are allowed to call mock-data helpers from `lib/mock-data.ts` directly. Adding a portal-feature folder under `features/` is deferred to Phase 6.
5. Before Phase 6 opens: run `docs/FLAWLESS_GATE.md` against the portal routes, file a second ADR closing this one, and migrate off mocks.

## Consequences

- The portal shell exists and can be iterated visually alongside the main app, keeping design-system drift low.
- No real portal user data exists before Phase 6; the route is effectively a design sandbox.
- Portal-only backend work (portal API prefix, `portal_users` provisioning, `portal_sessions` issuance, authz) remains Phase 6.

## Follow-ups

- Remove placeholder `console.log` calls in `frontend/app/[locale]/(portal)/portal/invoices/page.tsx` (done in opus bar sweep batch E).
- When Phase 6 opens, replace mock data with a read-only portal API and add an `ADR-014` ratifying the graduation.
