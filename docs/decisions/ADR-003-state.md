# ADR-003: Frontend state

**Status:** Accepted

## Decision

TanStack Query for server state + Zustand for client UI state + URL for filter/pagination state. **Strict boundary:** never duplicate server data into Zustand.

| Use case | Tool |
|----------|------|
| API calls, caching, mutations, invalidation | TanStack Query |
| Auth'd user profile | TanStack Query `/me` endpoint, never mirrored into Zustand |
| UI state (modals, drawers, selected rows, active filters, command palette open/closed, theme preference) | Zustand (per-domain stores, small slices) |
| Stable singletons (locale) | React Context |
| Filters, pagination, sorting (shareable view state) | URL search params via `useSearchParams` |
| Form drafts that survive tab close | Zustand with `persist` middleware to sessionStorage |
| Mutations with optimistic UI + 409 reconciliation | `useOptimisticMutation` wrapper in `lib/optimistic.ts` centralizing the three-layer conflict handling (rollback + field diff modal + retry) |

Query keys are tuples: `['employees', filters]`. Default stale time 30 s. Mutations declare invalidation targets.

**The one rule that catches most bugs:** if data comes from an API, it lives in TanStack Query, period. Components subscribe to the TanStack query directly, never to a Zustand mirror.

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
