# 2. Mental model: what is actually running

You ran `make mvp-up` and the app works. Good. Now let's understand what just happened so you can fix things when they break.

## The 30-second version

Gamma is a web app with two halves:

- **Backend**: Python code (FastAPI) that talks to a Postgres database and serves a JSON API.
- **Frontend**: TypeScript/React code (Next.js) that runs in your browser and calls the backend API.

When you open `http://localhost:3000/en`, your browser downloads the frontend, which makes calls to `http://localhost:8000/api/v1/...` on the backend, which reads from Postgres and sends the data back as JSON. The frontend turns that JSON into pixels.

Everything runs on your laptop. Nothing touches the internet unless you explicitly want it to.

## What Docker is, in three paragraphs

Docker is a way to run a program inside a **container**, which is a frozen-in-time copy of an operating system with exactly the files and binaries that program needs. Think of it as a tiny, throwaway Linux box that boots in half a second, runs your program, and deletes itself when you are done.

**Why we use containers**: the backend needs Python 3.12, Postgres 16, libpango for PDF rendering, and a dozen other system libraries. If you installed all of these directly on your machine, it would conflict with your other projects, pollute your `$PATH`, and behave differently on every developer's laptop. Containers give every dev an identical environment, regardless of whether they run Mac, Windows, WSL2, or Linux.

**What "image" and "container" mean**: an **image** is a read-only snapshot (think: a zip file of an operating system plus installed packages). A **container** is a running instance of an image (think: a booted-up copy of that zip). You can start many containers from the same image. `docker compose` is the tool that starts many containers at once using a YAML recipe (`docker-compose.dev.yml`).

## The 5 containers that make up Gamma dev

When `make mvp-up` finishes, you have 5 running containers. Each has a name (like `gamma-backend`) and listens on specific ports.

```
             ┌───────────────────────┐
             │   your host browser   │  http://localhost:3000/en
             └────────────┬──────────┘
                          │
                          ▼  (port 3000 -> frontend container)
             ┌───────────────────────┐
             │     gamma-frontend    │  Node 22 + Next.js 15
             │     (Next.js dev)     │  hot reload on your edits
             └────────────┬──────────┘
                          │
                          ▼  (port 8000 -> backend container)
             ┌───────────────────────┐
             │     gamma-backend     │  Python 3.12 + FastAPI + SQLAlchemy
             │     (uvicorn --reload)│  reads your edits from ./backend
             └────┬─────────┬────────┘
                  │         │
       postgres:5432    redis:6379        mailpit:1025
                  │         │                  │
                  ▼         ▼                  ▼
        ┌──────────┐  ┌──────────┐   ┌─────────────────┐
        │ postgres │  │  redis   │   │     mailpit     │
        │ (PG 16)  │  │  (7)     │   │ SMTP + web UI   │
        └──────────┘  └──────────┘   └─────────────────┘
```

Here is what each one does:

| Container | Image | Purpose | Ports (host -> container) |
|---|---|---|---|
| `gamma-postgres` | `postgres:16-alpine` | The database. Stores tenants, employees, invoices, everything. | 5432:5432 |
| `gamma-redis` | `redis:7-alpine` | Cache + job queue (Celery workers will read from it in Phase 5a). | 6379:6379 |
| `gamma-mailpit` | `axllent/mailpit:latest` | Fake SMTP server. Backend sends email here; you view it at http://localhost:8025. Zero external traffic. | 1025:1025 (SMTP), 8025:8025 (web UI) |
| `gamma-backend` | built from `backend/Dockerfile.dev` | FastAPI app, uvicorn with hot-reload. | 8000:8000 |
| `gamma-frontend` | built from `frontend/Dockerfile.dev` | Next.js dev server with hot-reload. | 3000:3000 |

## What does "port 3000:3000" mean

When you see `3000:3000` in the compose file, that means "publish container port 3000 as host port 3000". Your browser at `http://localhost:3000` hits the host's port 3000, which Docker forwards into the frontend container, where Next.js is listening.

If some other program on your laptop already uses port 3000 (rare, but happens), Docker will refuse to start and you have to stop the conflicting program.

## What gets hot-reloaded when you edit code

The compose file mounts your source directories into the containers as **volumes**. That means the container sees your live files, not a frozen copy. When you save `backend/app/main.py`:

1. uvicorn's file watcher notices the change (it polls every second because WSL2 inotify is unreliable across bind mounts).
2. uvicorn re-imports the app module.
3. The next API request uses the new code.

Total: 1 to 3 seconds from save to live. Same for the frontend: save a .tsx, Next.js Fast Refresh swaps it into the running page within 1 second.

**What does not auto-reload:**
- Changes to `pyproject.toml` dependencies. Run `make dev-reset` to rebuild the backend image.
- Changes to `package.json` dependencies. Run `make dev-reset` to rebuild the frontend image.
- Changes to `docker-compose.dev.yml`. Run `make dev-reset`.
- Changes to `Dockerfile.dev`. Run `make dev-reset`.
- Alembic migrations (SQL schema changes). Run `make dev-migrate`.

## Where data lives

The database and Redis cache survive container restarts because they store their files in **named Docker volumes**:

- `gamma_dev_postgres_data` (Postgres data)
- `gamma_dev_redis_data` (Redis AOF and snapshots)

`make dev-down` stops the containers but keeps the volumes. Your data is safe.

`make dev-reset` stops the containers AND deletes the volumes. Your data is gone. Use this when the DB is in an inconsistent state and you want a clean slate.

Your **source code** lives on your host filesystem (in `backend/`, `frontend/`, etc.) and is bind-mounted into the containers. Editing is always on your host. The containers do not own your files; they just execute them.

## Where Ollama lives

Ollama runs on your **host machine** (outside Docker), not in a container. The backend container reaches it via `host.docker.internal:11434`, a special DNS name that Docker maps to the host. If you see an Ollama-related error, check that `ollama serve` is running on the host and listening on 0.0.0.0 (not just 127.0.0.1).

## What you do not have

This is a dev-only setup. A production Gamma deployment has additional things that are not here:

- Real TLS certs (this dev uses plain HTTP)
- Cloudflare in front for WAF and CDN
- Real Vertex Gemini (dev uses local Ollama, or `MockAIClient` for tests)
- Real Google Workspace SMTP (dev uses Mailpit)
- Real GCS buckets (dev writes to `./tmp/dev-blobs`)
- Real Cloud SQL with backups and PITR (dev uses a single Postgres container with named volume)

All of that lives in `EXECUTION_CHECKLIST.md` section 16 "Deploy Track" and only gets set up post-MVP.
