# 7. Glossary

Terms you will hit in the codebase, specs, and checklists, in alphabetical order. Short definitions with pointers to the authoritative file.

**ADR** - Architectural Decision Record. One file per major design decision with the reasoning. Lives under `docs/decisions/ADR-*.md`. When you wonder "why did we pick X?", an ADR should answer it.

**Alembic** - Python library that manages database schema migrations. Each migration is a file under `backend/migrations/versions/` with an `upgrade()` and `downgrade()` function. We run `alembic upgrade head` to apply all pending migrations.

**Atom** - a single-concept UI component from the design system. Lives under `frontend/components/ui/`. Examples: Button, Input, Card, Modal, Table. You are **not** allowed to invent new atoms; if you think you need one, ask the founder first (CLAUDE.md rule 4).

**Audience-bound JWT** - our JWT tokens carry an `aud` claim that is one of `ops`, `app`, `portal`. A token for one audience cannot be used on another (ADR-010). This prevents an operator token from accessing the main app and vice versa.

**Backend** - the FastAPI Python service under `backend/`. Serves `/api/v1/*` endpoints, talks to Postgres + Redis, runs Celery workers.

**Celery** - a Python task queue. We use it for background jobs (email sending, OCR, month-end close drafting, etc.) so the API does not block. Wired in `backend/app/tasks/celery_app.py`.

**CMEK** - Customer-Managed Encryption Key. We encrypt GCS buckets with our own KMS keys so the platform (Google) cannot decrypt customer data. Phase 2 of the deploy track sets this up. Details in ADR-005.

**Compose** - short for `docker compose`. The tool that starts many containers at once using a YAML recipe. Our recipe is at `infra/docker/docker-compose.dev.yml`.

**Container** - a running instance of a Docker image. Think of it as a booted-up copy of a tiny, throwaway Linux box with exactly the files and binaries needed to run one program.

**CORS** - Cross-Origin Resource Sharing. A browser security rule that says "a page from origin A cannot call an API on origin B unless B explicitly allows it". The backend has a `cors_origins` setting that lists which origins can hit `/api/v1/*`. Dev default: `http://localhost:3000`.

**DEF-NNN** - Deferred Decision. A feature or capability we consciously chose NOT to build in v1.0, with a written trigger for when to reconsider. Registry at `docs/DEFERRED_DECISIONS.md`. Example: DEF-029 = "no automated payment processor until customer 5-10".

**DPA** - Data Processing Agreement. A legal contract we sign with each customer under GDPR. Template referenced in `docs/COMPLIANCE.md`.

**Event bus** - our in-process publish/subscribe system at `backend/app/events/bus.py`. Feature A publishes an event, feature B subscribes. Neither imports the other (M5 rule). Swaps to Cloud Pub/Sub at scale without caller changes.

**Feature flag** - a toggle that enables or disables a feature globally or per-tenant. Registered in `backend/app/core/feature_registry.py`. Operator console has routes at `/api/v1/ops/features/*` to flip them.

**Feature module** - a self-contained folder under `backend/app/features/<feature>/` that owns `routes.py`, `schemas.py`, `service.py`, `models.py`, `tests/`. The M2 rule says dropping a feature folder must leave the rest of the app functional.

**Flawless gate** - our 15-item per-feature quality checklist. Every Tier 1 feature must pass it before we ship the next feature. Lives at `docs/FLAWLESS_GATE.md` and is mirrored in `CLAUDE.md` section 7.

**Frontend** - the Next.js TypeScript app under `frontend/`. Runs in your browser, calls `/api/v1/*` endpoints on the backend.

**GCS** - Google Cloud Storage. Object storage service. The deploy track uses it for file uploads, audit log archives, and legal-hold buckets.

**Ollama** - a self-hosted LLM runtime. We use it in dev to run Gemma (or any other local model) so our month-end close agent can generate real natural-language explanations without paying for API calls or depending on the internet.

**Operator console** - the admin surface at `ops.gammahr.com` (or `http://localhost:3000/en/tenants` in dev). Founders use it to create tenants, toggle kill switches, review audit logs. Has its own JWT audience (`ops`) that is not valid on the main app.

**Pattern** - a composition of atoms. Examples: EmptyState, FilterBar, StatPill. Lives at `frontend/components/patterns/`. Built by combining existing atoms; never invents new ones.

**Pre-commit** - a tool that runs checks on your staged files before creating a commit. Our 9 hooks: gitleaks (secrets), trailing whitespace, EOF newline, large files, YAML/JSON syntax, merge conflict markers, em dash ban, "utilisation" ban, M1 vendor-SDK import ban. Configured at `.pre-commit-config.yaml`.

**Prototype** - the frozen HTML/CSS visual reference under `prototype/`. Every page in the app must match its prototype at 1440px desktop and 320px mobile. The prototype is locked (CLAUDE.md rule 2); only the founder changes it.

**Schema-per-tenant** - our multi-tenant isolation strategy. Each tenant gets its own Postgres schema (`t_<slug>`) inside one database. Queries set `search_path` to the active tenant's schema so SQL cannot leak across tenants. ADR-001 has the full rationale.

**Service layer** - `backend/app/features/<feature>/service.py`. The public contract of a feature. Other features may import service functions but not models. Rule M3.

**Tenancy middleware** - `backend/app/core/tenancy.py`. A FastAPI middleware that resolves the current tenant from a JWT claim or header, stores it in a `ContextVar`, and tells the session dependency to issue `SET LOCAL search_path`.

**Tenant** - one customer of Gamma. Each tenant is identified by a schema name like `t_acme`, has its own data (employees, clients, projects, etc.), and its users can only see their own tenant's data.

**Tier 1 feature** - one of the 13 core features we commit to shipping in v1.0 per `docs/SCOPE.md`. Timesheets, invoices, month-end close agent, etc. Tier 2 features (calendar, gantt, HR module, client portal) ship after v1.0.

**Three-app model** - the separation of `ops.gammahr.com` (operator console), `app.gammahr.com` (main tenant app), and `portal.gammahr.com` (client portal for read-only access). Three separate identity tables, three JWT audiences, three route groups in the frontend. ADR-010.

**uvicorn** - an ASGI server that runs FastAPI. `uvicorn app.main:app --reload` is what our backend container launches. The `--reload` flag watches for file changes and restarts.

**Vendor wrapper** - our abstraction over external services (AI, storage, email, PDF, billing, tax, OCR, telemetry, notifications). Each wrapper defines a Protocol in `backend/app/<wrapper>/` and provides a dev-friendly stub implementation. No file outside a wrapper may import the vendor SDK directly (M1 rule). This lets us swap Ollama for Vertex, Mailpit for Workspace SMTP, LocalFilesystemBlobStorage for GCS, all with one-file changes.

**Volume (Docker)** - named storage that outlives containers. Postgres data lives in `gamma_dev_postgres_data`. `make dev-down` keeps volumes; `make dev-reset` deletes them.

**WeasyPrint** - a Python library that renders HTML+CSS into PDFs. We use it for invoice generation. Needs system libraries (libpango, cairo, gdk-pixbuf) which are pre-installed in the backend Dockerfile.

**WSL2** - Windows Subsystem for Linux version 2. A real Linux kernel running in a lightweight VM on Windows 11. Where the founder's dev environment lives.

---

## Gamma-specific terms you will hear

**The feel** - the five qualities Gamma must have on every page: calm, ease, completeness, anticipation, consistency. Defined in CLAUDE.md section 3.1. If a page does not feel right, it does not ship, regardless of whether it functionally works.

**The ten core principles** - the time-less design rules in CLAUDE.md section 3.2. "Design first, code never until the blueprint is perfect", "The app does the work, the user confirms", "Zero dead ends", etc.

**80/20** - our prioritization rule. Per phase, 20% of tasks deliver 80% of the value. Do those first. The 80/20 list per phase is in EXECUTION_CHECKLIST.md section 1.0.

**M1 through M10** - the 10 modularity rules in `docs/MODULARITY.md`. Enforced in CI. M1 = vendor wrappers, M2 = self-contained feature folders, M3 = service-layer calls only (no cross-feature model imports), M4 = ON DELETE set everywhere, M5 = event bus for cross-feature signaling, M6 = feature flag registry, M7 = reversible migrations, M8 = API versioning, M9 = frontend/features mirrors backend, M10 = one concept per file.

**MVP acceptance test** - the 13-point checklist at the end of Phase 5a that defines "the demo works end to end locally". Listed in EXECUTION_CHECKLIST.md section 6.2. When all 13 are green, the agent stops and the founder calls the shots on next steps.
