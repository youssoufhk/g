# ADR-004: Real-time transport

**Status:** Accepted (updated 2026-04-15 to the per-feature transport model)

## Decision

**Per-feature minimal transport.** Different features use the lightest mechanism that works. Notifications are Phase 2 foundation (WebSocket), background job progress is Phase 3+ (SSE), dashboard freshness is polling. No single transport for everything.

| Feature | Transport | Phase |
|---|---|---|
| **Notifications feed** (badges, toasts, approval requests) | WebSocket via FastAPI `starlette.websockets`, single `/ws/notifications` per user | Phase 2 foundation |
| **Background job progress** (OCR, CSV import, invoice render) | Server-Sent Events on `/api/v1/jobs/{job_id}/stream`, short-lived one stream per job | Phase 3+ |
| **Dashboard live numbers** (work time this week, pending approvals count) | TanStack Query polling with `refetchInterval: 30s` and `refetchOnWindowFocus: true` | Phase 4 |
| **Lists, profiles, detail pages** | Refetch on window focus only, no push | Every phase |

### Common infrastructure

| Element | Detail |
|---|---|
| WebSocket endpoint | `/ws/notifications` on FastAPI, one persistent connection per user |
| WS auth | Short-lived ticket issued by `/api/v1/auth/ws-ticket` after JWT validation, consumed on connect |
| WS message schema | `{type, entity_type, entity_id, payload, ts}` validated with Pydantic on both ends |
| Reconnect | Exponential backoff with jitter on the client, starting at 1s, capping at 30s |
| Heartbeat | Ping frames every 30 seconds; server closes idle connections after 90s |
| Fan-out | In-process for Phase 2-3 (single backend instance). Redis pub/sub fan-out when a second backend instance is added (DEF-048). |
| SSE endpoint format | `/api/v1/jobs/{job_id}/stream`, one stream per job, closed on completion |
| SSE message format | `event: progress\ndata: {"percent": 42, "current": 840, "total": 2000}\n\n` |
| Polling cadence | 30s default, configurable per hook via `refetchInterval` |

## Rationale

- **Per-feature transport choice** is the right answer because the three feature classes (push notifications, job progress, dashboard freshness) have different latency and liveness needs.
- **WebSocket for notifications** is the standard pattern because the alternative (polling every 10s per user per page) scales terribly and feels sluggish.
- **SSE for background jobs** is simpler than WebSocket for one-way server-to-client streams: HTTP/1.1 compatible, works through any proxy, no handshake. The 6-concurrent-streams-per-origin browser cap is fine for short-lived job streams.
- **Polling for dashboards** is cheaper than push and the 30-second staleness is invisible to users.
- **FastAPI's `starlette.websockets` is the right primitive** because it's already in the stack. No separate WS framework, no extra dependency.
- **Single backend instance in Phase 2-3** means no Redis pub/sub fan-out is needed. When a second instance is added (DEF-048), the pub/sub layer is a one-file change because all WS messages already flow through a central publisher.

## Rejected alternatives

- **WebSocket for everything** (including job progress and dashboards): over-engineered for features where polling is fine.
- **Polling for notifications:** too slow, high server load at scale, bad UX for approvals.
- **Pusher / Ably / Ably SDK:** extra vendor dependency with ongoing cost, adds a sub-processor. Self-hosted WS is simple enough to own.
- **gRPC streaming:** overkill for a browser client, requires gRPC-Web gateway.
- **Long polling:** battery drain on mobile, worse UX than native WebSocket.

## Consequences

- Backend must maintain a long-lived connection per authenticated user in the notifications channel. Cloud Run supports this with session affinity and WebSocket timeouts configured up to 60 minutes.
- The notifications channel becomes a critical-path component. Outages require a graceful-degradation UX: when WS cannot reconnect after 30s, the UI falls back to a "Reconnecting..." badge and polls the notifications endpoint every 30s as a fallback.
- Redis pub/sub is NOT required in Phase 2-3 (single instance) but will be required when a second backend instance is added. The in-process fan-out is a direct method call; the Redis fan-out is a publish. The interface is identical (DEF-048 covers the migration in ~1 week).
- SSE job streams are 6-per-origin browser-capped; this is fine for one-at-a-time import/OCR/render jobs but a reason to never use SSE for long-lived feeds.
- Playwright helpers written for both WS message waiting and SSE progress waiting; same test pattern everywhere.

## Follow-ups (required)

1. `backend/app/core/websocket.py` with ticket-based auth, heartbeat, graceful reconnect handling
2. `backend/app/events/publisher.py` with a pluggable in-process vs Redis pub/sub fan-out interface
3. `backend/app/features/imports/job_stream.py` for SSE job progress (shared by expense OCR, CSV import, invoice render)
4. `frontend/lib/realtime.ts` with the WebSocket singleton, reconnect logic, and TanStack Query cache invalidation helpers
5. `frontend/components/patterns/JobProgress.tsx` as the SSE consumer pattern
6. Playwright test helpers `waitForWSMessage()` and `waitForJobComplete()`

## Related decisions

- `specs/DATA_ARCHITECTURE.md` section 9.1 (per-feature real-time transports table)
- `specs/DATA_ARCHITECTURE.md` section 2.5 (`public.notifications` table with the kinds enum)
- `specs/MOBILE_STRATEGY.md` section 8 (in-app notifications + PWA Web Push as primary channels, email as narrow fallback)
- `specs/AI_FEATURES.md` section 7 (per-user rate limits and degraded-mode triggers for AI features)
- **DEF-048** (horizontal scaling of WebSocket via Redis pub/sub fan-out)
- `specs/DATA_ARCHITECTURE.md` section 9.1 (real-time transports table)
