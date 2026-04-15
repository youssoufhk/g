# 5. Common tasks (cookbook)

Pick the recipe that matches what you are trying to do. All commands assume you are at the repo root.

## I want to add a page to the app

1. Open `specs/APP_BLUEPRINT.md` and find the row for the page. The blueprint defines the layout, atoms, and data shape.
2. Open `prototype/<page>.html` to see the target visual.
3. Create `frontend/app/[locale]/(app)/<page-slug>/page.tsx`. Import atoms from `@/components/ui/*` and patterns from `@/components/patterns/*`. Never invent atoms (CLAUDE.md rule 4).
4. If the page needs data, create or extend a feature module at `frontend/features/<feature>/` with TanStack Query hooks.
5. Save. The Next.js dev server Fast-Refreshes.
6. Verify in the browser at `http://localhost:3000/en/<page-slug>`.
7. Check both dark and light mode. Check at 1440px and 320px.
8. If the page uses AI, write the 5 AI eval examples under `backend/app/ai/evals/<feature>/` BEFORE the feature (test-first per `docs/TESTING_STRATEGY.md`).

## I want to add a backend API endpoint

1. Find the feature module at `backend/app/features/<feature>/`. If it does not exist, scaffold it (see next recipe).
2. Add the route to `backend/app/features/<feature>/routes.py`:
   ```python
   @router.get("/my-endpoint", response_model=MyResponse)
   async def my_endpoint(session: Annotated[AsyncSession, Depends(get_session)]) -> MyResponse:
       return await service.do_the_thing(session)
   ```
3. Add the Pydantic schema to `schemas.py`.
4. Add the business logic to `service.py` (never put it in `routes.py`).
5. If you need a new DB column, write an Alembic migration (next recipe).
6. Add tests to `backend/tests/test_<feature>.py`. Use `TestClient` from `fastapi.testclient`.
7. Save. uvicorn hot-reloads. Curl it: `curl http://localhost:8000/api/v1/<feature>/my-endpoint`.

## I want to scaffold a new feature module

Feature modules are self-contained folders. Use the agent skill:

```
/scaffold-feature <feature-name>
```

Or do it manually:

```bash
mkdir -p backend/app/features/<feature>
touch backend/app/features/<feature>/{__init__.py,routes.py,schemas.py,service.py,models.py}
mkdir -p frontend/features/<feature>
```

Register the feature in `backend/app/features/<feature>/__init__.py`:

```python
from app.core.feature_registry import registry

registry.register(
    "<feature>",
    description="<one-line description>",
    default_enabled=True,
)
```

Import the module side-effect in `backend/app/main.py` so the registry sees it:

```python
from app.features import <feature>  # noqa: F401
```

Mount the router:

```python
from app.features.<feature>.routes import router as <feature>_router
app.include_router(<feature>_router, prefix="/api/v1/<feature>", tags=["<feature>"])
```

## I want to change the database schema

Never edit an existing migration that has been run. Always create a new one:

```bash
make dev-shell-backend
alembic revision --autogenerate -m "add foo column to bar"
exit
```

Alembic scans your SQLAlchemy models vs the current DB and writes a migration file under `backend/migrations/versions/YYYYMMDD_HHMM_add_foo_column_to_bar.py`. **Read it** before running it. Autogenerate is good but not perfect; check the upgrade and downgrade paths.

Apply the migration:

```bash
make dev-migrate
```

Verify the schema changed:

```bash
make dev-psql
\d bar
```

If you need to roll back during dev:

```bash
make dev-shell-backend
alembic downgrade -1
```

## I want to wipe the database and start fresh

```bash
make dev-reset       # stops + deletes volumes + restarts (takes ~20 sec)
make dev-migrate     # re-apply migrations on the fresh DB
```

## I want to run one specific test

**Backend:**

```bash
make dev-shell-backend
pytest backend/tests/test_admin_routes.py::test_list_features_returns_registered -v
# or to watch for changes:
pytest backend/tests/test_admin_routes.py -v --lf
```

**Frontend:**

```bash
make dev-shell-frontend
npm test -- --run lib/api-client.test.ts
```

## I want to see the Postgres data

```bash
make dev-psql
```

You are now in a psql shell connected to `gamma_dev`. Try:

```
\dt                                   # list tables
\d tenants                            # describe tenants table
SELECT * FROM tenants;                # read rows
SELECT * FROM country_holidays LIMIT 5;
\q                                    # quit
```

## I want to add a Python dependency

1. Open `backend/pyproject.toml`.
2. Add the package to the `dependencies` list (or `dev` optional-dependencies if it is a dev tool).
3. `make dev-reset` to rebuild the image. The `pip install` happens inside the Dockerfile.
4. If you want it in your local venv too: `make backend-install-local`.

Remember M1: if the dep is a vendor SDK (Google Cloud, Stripe, Anthropic, etc.), it may only be imported inside the matching wrapper under `backend/app/ai/`, `backend/app/storage/`, etc. CI will block commits that import vendor SDKs from anywhere else.

## I want to add a JavaScript dependency

1. Open `frontend/package.json`.
2. Add the package to `dependencies` or `devDependencies`.
3. `make dev-reset` to rebuild and re-install.
4. Alternatively, inside the container:
   ```bash
   make dev-shell-frontend
   npm install <package>
   ```
   Then copy the updated `package.json` and `package-lock.json` out of the container (or just edit on your host).

## I want to send a test email

1. `make dev-up` if not running.
2. Open a backend shell:
   ```bash
   make dev-shell-backend
   python -c "
   import asyncio
   from app.email.sender import get_sender, OutgoingEmail
   sender = get_sender()
   asyncio.run(sender.send(OutgoingEmail(
       to=['test@example.com'],
       subject='hello from gamma',
       text_body='it works',
   )))
   "
   ```
3. Open http://localhost:8025. You should see the email in the Mailpit inbox.

## I want to see which AI backend is active

```bash
make dev-shell-backend
python -c "from app.ai.client import get_client; print(type(get_client()).__name__)"
```

If it prints `MockAIClient`, unit tests are in control. If it prints `OllamaAIClient`, the real LLM is wired and will be called. Switch by setting `AI_BACKEND=mock` or `AI_BACKEND=ollama` in the compose env or a local `.env`.

## I want to test against Ollama from the host

1. Make sure Ollama is running on the host: `ollama serve` (or via systemd, depending on install).
2. Make sure it listens on all interfaces so the backend container can reach it: set `OLLAMA_HOST=0.0.0.0:11434` before starting.
3. Pull the model: `ollama pull gemma3` (or `gemma2`, whatever you have).
4. Curl from inside the backend container:
   ```bash
   make dev-shell-backend
   curl http://host.docker.internal:11434/api/tags
   ```
   You should see a JSON list of installed models.

## I want to commit my work

```bash
git add <files you changed>
/commit "<one-line message>"
```

The `/commit` skill runs all 9 pre-commit hooks on the staged files, reports failures, and creates the commit only when everything passes. Never use `git commit --no-verify`.

## I want to check the CI locally before pushing

```bash
make lint       # runs ruff + pre-commit on every file
make test       # runs backend pytest + frontend vitest
```

If both pass, your commit will pass CI. If one fails, fix it first.

## I want to reset everything (nuclear option)

```bash
make dev-reset                        # stops + wipes volumes
rm -rf backend/.venv                  # remove local Python venv (optional)
rm -rf frontend/node_modules          # remove local node_modules (optional)
rm -rf frontend/.next                 # remove Next build cache (optional)
make mvp-up                           # rebuild from scratch
```

Takes ~5 minutes. Use this when you are confused about why something is not working and you want a known-clean state.
