"""Idempotency-Key middleware (Phase 3a.2).

High-value mutating endpoints must be replay-safe: if the client
retries a POST (network flake, UI double-click, resumed mobile
upload), the server MUST either return the exact same response as the
first attempt or reject the retry loudly. Silent duplicates would
create double-charged invoices and double-submitted expenses.

The contract is header-driven so it does not leak into route
signatures:

    Idempotency-Key: <opaque-string, client-generated uuid>

Behaviour:
  * Non-mutating methods (GET/HEAD/OPTIONS): pass through unchanged.
  * Missing header: pass through unchanged. Only high-value endpoints
    require the header; the OpenAPI contract flags them with
    ``requiresIdempotency: true`` and the frontend fetch wrapper
    auto-generates a uuid, but the server does not reject requests
    that forget the header (avoids breaking curl-based ops work).
  * Hit on (tenant, key): same request_hash → replay cached response
    with ``Idempotency-Replayed: true`` header; different
    request_hash → 409 so the client sees the reuse-with-different-
    body bug.
  * Miss: call the route, capture the response, store under the key
    with a 24h TTL (section 3.2 of ``specs/DATA_ARCHITECTURE.md``).

Store is pluggable so unit tests can use an in-memory implementation
and production swaps in the Postgres-backed store.
"""

from __future__ import annotations

import hashlib
import json
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any, Protocol

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

_MUTATING_METHODS = frozenset({"POST", "PUT", "DELETE", "PATCH"})
DEFAULT_TTL = timedelta(hours=24)


@dataclass(frozen=True)
class _CachedResponse:
    status_code: int
    body: bytes
    headers: dict[str, str]
    request_hash: str
    expires_at: datetime


class IdempotencyStore(Protocol):
    async def get(
        self, tenant_id: str | None, key: str
    ) -> _CachedResponse | None: ...

    async def put(
        self,
        tenant_id: str | None,
        key: str,
        cached: _CachedResponse,
    ) -> None: ...


class InMemoryIdempotencyStore:
    """Thread-unsafe in-memory store, good for single-worker dev and
    tests. Production should swap in the Postgres-backed store.

    Entries are not auto-evicted; callers clear the whole map with
    :meth:`clear` in between tests. A real TTL sweep lives in the
    Celery retention job added in Phase 3a.3.
    """

    def __init__(self) -> None:
        self._store: dict[tuple[str | None, str], _CachedResponse] = {}

    async def get(
        self, tenant_id: str | None, key: str
    ) -> _CachedResponse | None:
        cached = self._store.get((tenant_id, key))
        if cached is None:
            return None
        if cached.expires_at < datetime.now(UTC):
            self._store.pop((tenant_id, key), None)
            return None
        return cached

    async def put(
        self,
        tenant_id: str | None,
        key: str,
        cached: _CachedResponse,
    ) -> None:
        self._store[(tenant_id, key)] = cached

    def clear(self) -> None:
        self._store.clear()


_default_store: IdempotencyStore = InMemoryIdempotencyStore()


def get_store() -> IdempotencyStore:
    return _default_store


def set_store(store: IdempotencyStore) -> None:
    """Swap the process-wide idempotency store. Only for tests and
    deploy-time wiring (e.g. flipping in the Postgres store from
    ``main.py`` once the DB is reachable)."""
    global _default_store
    _default_store = store


class IdempotencyMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app: ASGIApp,
        *,
        store_factory: Callable[[], IdempotencyStore] | None = None,
        ttl: timedelta = DEFAULT_TTL,
    ) -> None:
        super().__init__(app)
        self._store_factory = store_factory or get_store
        self._ttl = ttl

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        if request.method not in _MUTATING_METHODS:
            return await call_next(request)
        key = request.headers.get("idempotency-key")
        if not key:
            return await call_next(request)

        body = await request.body()
        request_hash = _compute_request_hash(
            method=request.method, path=request.url.path, body=body
        )

        tenant_schema = _tenant_for_request(request)
        store = self._store_factory()
        cached = await store.get(tenant_schema, key)
        if cached is not None:
            if cached.request_hash != request_hash:
                return _json_error(
                    409,
                    code="idempotency_key_reused",
                    message=(
                        "Idempotency-Key reused with a different request "
                        "body. Pick a fresh key for the new operation."
                    ),
                )
            replay_headers = dict(cached.headers)
            replay_headers["idempotency-replayed"] = "true"
            return Response(
                content=cached.body,
                status_code=cached.status_code,
                headers=replay_headers,
            )

        # Rehydrate the body so the downstream handler can re-read it.
        request = _with_body(request, body)
        response = await call_next(request)

        # Only cache success-ish responses. Errors should be retried
        # against a fresh key so the client has a chance to recover.
        if 200 <= response.status_code < 300:
            response_body = b""
            async for chunk in response.body_iterator:  # type: ignore[attr-defined]
                response_body += chunk
            headers = {
                k: v for k, v in response.headers.items()
                if k.lower() not in {"content-length"}
            }
            cached = _CachedResponse(
                status_code=response.status_code,
                body=response_body,
                headers=headers,
                request_hash=request_hash,
                expires_at=datetime.now(UTC) + self._ttl,
            )
            await store.put(tenant_schema, key, cached)
            response = Response(
                content=response_body,
                status_code=response.status_code,
                headers=headers,
                media_type=response.media_type,
            )
        return response


def _compute_request_hash(*, method: str, path: str, body: bytes) -> str:
    h = hashlib.sha256()
    h.update(method.encode("ascii"))
    h.update(b"\x00")
    h.update(path.encode("utf-8"))
    h.update(b"\x00")
    h.update(body)
    return h.hexdigest()


def _tenant_for_request(request: Request) -> str | None:
    from app.core.tenancy import get_current_tenant

    return get_current_tenant()


def _with_body(request: Request, body: bytes) -> Request:
    """Return a Request clone whose receive() replays ``body`` once.

    Starlette reads the body from ``receive`` once and caches it on
    ``Request._body``; after our middleware reads it, the downstream
    handler would otherwise hang waiting for more chunks. We stuff
    the cached body back in and wire a fresh receive() that yields
    a single http.request event.
    """
    sent = False

    async def _receive() -> dict[str, Any]:
        nonlocal sent
        if sent:
            return {"type": "http.disconnect"}
        sent = True
        return {"type": "http.request", "body": body, "more_body": False}

    new_request = Request(request.scope, _receive)
    new_request._body = body  # type: ignore[attr-defined]
    return new_request


def _json_error(status: int, *, code: str, message: str) -> Response:
    payload = json.dumps({"code": code, "message": message}).encode("utf-8")
    return Response(
        content=payload,
        status_code=status,
        media_type="application/json",
    )
