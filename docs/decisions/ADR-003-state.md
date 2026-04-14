# ADR-003: Frontend state

**Status:** Accepted

## Decision

TanStack Query for server state + Zustand for client UI state + URL for filter/pagination state.

| Use case | Tool |
|----------|------|
| API calls, caching, mutations, invalidation | TanStack Query |
| UI state (modals, drawers, selected rows, active filters) | Zustand (per-domain stores) |
| Stable singletons (theme, locale, auth claims) | React Context |
| Filters, pagination, sorting | URL search params |

Query keys are tuples: `['employees', filters]`. Default stale time 30 s. Mutations declare invalidation targets.

## Rationale

- TanStack Query solves 80% of state problems with near-zero ceremony.
- Zustand is minimal, TypeScript-first, no provider hell.
- URL as state gives free deep-linking + back/forward support.

## Rejected

- **Redux Toolkit:** boilerplate; server state better solved by TanStack Query.
- **MobX/Jotai:** fine but Zustand has smaller cognitive load.
- **RSC only:** fine for initial loads, not for interactive pages.

## Consequences

- Every API call has a query key contract (enforced in review).
- No global mega-store; one small store per domain.
