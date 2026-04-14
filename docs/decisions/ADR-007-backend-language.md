# ADR-007: Backend language

**Status:** Accepted
**Supersedes:** Prior exploration of Rust, TypeScript (Bun), C++

## Decision

Python 3.12 + FastAPI + SQLAlchemy 2.0 async + Pydantic v2 + Alembic + pytest + Celery.

## Rationale

| Factor | Why Python |
|--------|-----------|
| Scale | 200 employees + 100 clients = well under 200k rows/year/tenant. FastAPI + asyncpg handles 10k+ req/s on modest hardware. Instagram, Dropbox, Reddit run Python at scale orders of magnitude larger. |
| Agent productivity | Claude Code generates high-quality Python and FastAPI from training. Fastest time to working feature. |
| AI ecosystem | Anthropic Python SDK is first-class. Tool-use, prompt caching, structured outputs all straightforward. |
| Founder fit | C++ background transfers well; Python is simpler and iteration loop is faster than C++. |

## Rejected

| Option | Why not |
|--------|---------|
| Rust | Steeper curve for solo founder; velocity loss outweighs perf gain at our scale. Pays off at 100k+ req/s per instance, not v1.0 load. |
| TypeScript + Bun | Unifies stack with frontend but loses Python AI ecosystem. |
| C++ | Overkill for CRUD HR. Slower iteration. Worse agent support. |

## Consequences

- Performance ceiling not a concern at v1.0 scale.
- If a legitimate bottleneck appears, hot path can be rewritten in Rust via PyO3 without rewriting the service.
- Async discipline enforced: no sync DB calls in async handlers.
- Type safety enforced by Pydantic + mypy in CI.
