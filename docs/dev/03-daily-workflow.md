# 3. Daily workflow

The commands you actually type when you are working on Gamma. Keep this file open in a tab.

## Starting + stopping

```bash
make mvp-up         # start the whole stack + run Alembic + print URLs
make dev-down       # stop the stack, keep your data
make dev-reset      # stop + wipe all volumes + restart fresh
```

First-run mvp-up takes 2 to 5 minutes. Subsequent runs take 20 to 30 seconds. If you suspect the DB is in a bad state, use `dev-reset`.

## Editing code

Just edit the files on your host. The containers watch for changes and hot-reload.

| Edit this | What happens | How long |
|---|---|---|
| `backend/app/**/*.py` | uvicorn re-imports the app | ~1-3 sec |
| `frontend/app/**/*.tsx` or `frontend/components/**/*.tsx` | Next.js Fast Refresh updates the page | ~1 sec |
| `frontend/styles/*.css` | Next.js hot-reloads the style | ~1 sec |
| `backend/pyproject.toml` | **Run `make dev-reset`** (rebuild the image) | 2-3 min |
| `frontend/package.json` | **Run `make dev-reset`** | 2-3 min |
| `backend/Dockerfile.dev` or `docker-compose.dev.yml` | **Run `make dev-reset`** | 2-3 min |
| `backend/migrations/versions/*.py` | **Run `make dev-migrate`** | ~5 sec |

## Seeing what is happening

```bash
make dev-logs              # tail every service, interleaved
make dev-logs-backend      # only backend (most common)
make dev-logs-frontend     # only frontend
make dev-ps                # list running containers with their state
```

`Ctrl-C` to exit the log tail. That does not stop the containers.

## Running tests

Two paths depending on whether the stack is up:

**With the stack running (integration-style, hits real Postgres):**

```bash
make dev-test-backend      # pytest inside the backend container
make dev-test-frontend     # vitest inside the frontend container
```

**Without the stack (local venv, mocks the DB; what the agent uses):**

```bash
make backend-install-local # one-time: create backend/.venv
make backend-test-local    # pytest against backend/.venv
make backend-lint-local    # ruff check
```

The local path is faster (no container overhead) but only runs tests that do not require a live database. CI runs the local path on every PR.

## Opening a shell inside a container

When you need to poke around:

```bash
make dev-shell-backend    # bash shell inside gamma-backend
make dev-shell-frontend   # sh shell inside gamma-frontend
make dev-psql             # psql session inside gamma-postgres, connected to gamma_dev
```

Inside the backend shell you can:

```bash
python -c "from app.main import app; print(app.routes)"   # import the app directly
alembic upgrade head                                       # run migrations
alembic current                                            # see the current revision
alembic history                                            # list revisions
pytest backend/tests/test_specific.py -v                   # run one test file
ruff check app/features/timesheets/                        # lint one directory
```

Inside the frontend shell:

```bash
npm run typecheck          # one-shot tsc --noEmit
npm run lint               # next lint
npm test -- --run          # vitest one-shot
```

## Database tasks

```bash
make dev-migrate           # alembic upgrade head (apply pending migrations)
make dev-psql              # open psql; then type: \dt  to list tables
```

To wipe and recreate the database entirely:

```bash
make dev-reset             # nukes volumes
# after dev-reset finishes:
make dev-migrate           # re-apply migrations on the fresh DB
```

## Regenerating the demo seed CSVs

The 201-employee fixture is deterministic. Any change to the generator should be followed by regeneration:

```bash
make dev-seed-demo                 # runs inside the container
# or outside:
make backend-seed-demo-local       # runs against your local venv
```

Output lands in `backend/fixtures/demo/*.csv`. Commit the CSVs along with the generator change so the team has the updated seed.

## Committing code

Use the `/commit` skill (not raw `git commit`):

```bash
git add backend/app/features/my-feature/
/commit "feature: add month-end close analyzer"
```

The skill runs every pre-commit hook (9 of them) on the staged files, asks for confirmation on the message, and creates the commit. Never pass `--no-verify`. Never push without an explicit request from the founder.

## Full command reference

Run `make help` for the short version. Everything you need:

```
make mvp-up                    # start + migrate
make mvp-down                  # stop
make mvp-reset                 # wipe + start + migrate
make dev-up                    # start without migrate
make dev-down                  # stop
make dev-reset                 # wipe + start
make dev-logs                  # tail all logs
make dev-logs-backend          # tail backend
make dev-logs-frontend         # tail frontend
make dev-ps                    # show running services
make dev-psql                  # psql shell
make dev-shell-backend         # bash in backend
make dev-shell-frontend        # sh in frontend
make dev-migrate               # alembic upgrade head
make dev-seed-demo             # regenerate demo CSVs
make dev-test-backend          # pytest in container
make dev-test-frontend         # vitest in container
make backend-install-local     # local .venv setup
make backend-test-local        # pytest against local venv (no DB needed)
make backend-lint-local        # ruff check against local venv
make test                      # run every test
make lint                      # run every lint
```
