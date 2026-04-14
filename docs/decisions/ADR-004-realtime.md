# ADR-004: Real-time transport

**Status:** Accepted

## Decision

WebSockets with Redis pub/sub fan-out. Tier 2 scope for v1.0.

| Element | Detail |
|---------|--------|
| Endpoint | `/ws` on FastAPI |
| Auth | Short-lived ticket issued by REST API after JWT validation |
| Fan-out | Redis pub/sub channel `tenant:{id}:events` |
| Reconnect | Exponential backoff on client |
| Message schema | `{type, entity, entity_id, data, ts}` validated with Pydantic |
| Fallback | 30 s polling if socket drops |

v1.0 uses WebSockets for: approval notifications, import progress, OCR completion. Presence and collab edit deferred to v1.1.

## Rejected

- **SSE:** one-way; awkward for client pings.
- **Long polling:** battery drain on mobile.
- **Pusher/Ably:** extra cost + dependency for features we can host.

## Consequences

- Need a container that holds long-lived connections.
- Redis becomes critical path (already in stack for Celery).
- Ticket-based auth + rate limiting on the endpoint.
- Playwright helper to wait for WS messages instead of DOM polling.
