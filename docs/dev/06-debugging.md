# 6. Debugging

When things break. Each recipe has a symptom, a likely cause, and a fix.

## `docker ps` says permission denied

**Symptom:**

```
permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock
```

**Cause:** your user is not in the `docker` group in the current shell. Either the bootstrap script has not added you yet, or it added you but you opened the shell before the change took effect.

**Fix:**

```bash
# Quick: applies only to this shell
newgrp docker
docker ps                             # should work now

# Permanent: log out of WSL and back in
# Run from Windows PowerShell:
wsl --shutdown
# then reopen WSL
```

If `docker ps` still fails after `wsl --shutdown`, verify you were actually added to the group:

```bash
id | grep docker
```

If you see no `docker` in the groups list, the bootstrap script did not run the `sudo usermod -aG docker` step. Run it manually:

```bash
sudo usermod -aG docker $USER
wsl --shutdown         # from PowerShell
```

## Container is unhealthy

**Symptom:**

```
container gamma-backend is unhealthy
make: *** [Makefile:83: dev-reset] Error 1
```

**First: look at the logs.**

```bash
make dev-logs-backend | tail -80
```

Read from the top down. The first error is almost always the cause. The most common ones:

- **`SettingsError: error parsing value for field "cors_origins"`**: the compose env var is malformed. Should not happen after the NoDecode fix, but if it does, restart with `make dev-reset`.
- **`ModuleNotFoundError`**: you added a Python dependency to `pyproject.toml` but did not rebuild the image. Fix: `make dev-reset`.
- **`sqlalchemy.exc.OperationalError: could not translate host name "postgres"`**: you are running the backend outside the container (local venv) but pointing DATABASE_URL at `postgres:5432` (which only resolves inside Docker). Fix: set `DATABASE_URL=postgresql+asyncpg://gamma:gamma_dev_password@localhost:5432/gamma_dev` in your local `.env` file.
- **`ImportError: cannot import name 'X' from 'Y'`**: code bug. Search for the line in your editor; fix the import.

**If the logs show a clean startup but the container is still unhealthy**, the healthcheck is flaky. Wait 30 seconds and `make dev-ps` again. First boot can exceed the start-period on slow machines.

## Port already in use

**Symptom:**

```
Error response from daemon: driver failed programming external connectivity ... port 5432 already allocated
```

**Cause:** another process on your host already binds that port.

**Fix:** find and stop the conflicting process:

```bash
sudo lsof -i :5432                   # find who holds port 5432
sudo systemctl stop postgresql       # common: a local Postgres service
# or for port 3000:
sudo lsof -i :3000
# or for port 6379:
sudo lsof -i :6379
```

## Backend code changes do not reload

**Symptom:** you saved `backend/app/main.py` but the container still serves the old code.

**Cause:** uvicorn `--reload` uses watchfiles, which polls because inotify does not work reliably across WSL bind mounts. The polling should catch your change within 1 to 3 seconds.

**Fix:**

1. Check `make dev-logs-backend` for a message like `Will watch for changes in these directories: ['/app']`. If missing, uvicorn did not start with `--reload`.
2. Verify `WATCHFILES_FORCE_POLLING=true` is set in the container:
   ```bash
   make dev-shell-backend
   echo $WATCHFILES_FORCE_POLLING     # should print: true
   ```
3. If all looks correct, try saving the file twice with a 2-second gap. Some editors write in two phases (atomic replace) and the first event is swallowed.
4. If nothing works, restart the backend container:
   ```bash
   docker compose -f infra/docker/docker-compose.dev.yml restart backend
   ```

## Frontend code changes do not reload

Same cause (WSL2 inotify). Environment variables `WATCHPACK_POLLING=true` and `CHOKIDAR_USEPOLLING=true` should handle it.

**Fix:**

```bash
docker compose -f infra/docker/docker-compose.dev.yml restart frontend
```

If that does not work:

```bash
make dev-reset                        # nuke and restart
```

## Frontend build fails with React/peer dep errors

**Symptom:**

```
npm error ERESOLVE unable to resolve dependency tree
npm error peer react@"^18.2.0" from next@15.0.0
```

**Cause:** a dep is pinned to an older major than Next.js or React expects.

**Fix:** bump `next` to `^15.1.6+` (supports React 19 stable) in `package.json`. Remove `@visx/visx` until we have a v19-compatible version (or use individual `@visx/*` packages). Rerun `npm install` by way of `make dev-reset`.

## Alembic migration fails

**Symptom:**

```
sqlalchemy.exc.ProgrammingError: syntax error at or near "{"
```

**Cause:** an invalid `server_default` value. Common with ARRAY defaults.

**Fix:** use `sa.text("ARRAY['a','b']::text[]")` instead of a raw Python string.

---

**Symptom:**

```
psycopg2.errors.SyntaxError: syntax error at or near "DO"
```

**Cause:** `ON CONFLICT DO NOTHING` without a conflict target.

**Fix:** add the column list: `ON CONFLICT (col1, col2) DO NOTHING`.

---

**Symptom:**

```
alembic.util.exc.CommandError: Target database is not up to date
```

**Cause:** you added a migration revision but did not run it yet.

**Fix:**

```bash
make dev-migrate
```

## Pytest fails with "Cannot connect to database"

**Symptom:** a test fails with `sqlalchemy.exc.OperationalError`.

**Cause:** the test is trying to hit a real Postgres but the stack is down, or you are running `backend-test-local` for a test that needs the DB.

**Fix 1:** run the local path for unit tests that do not need a DB:

```bash
make backend-test-local               # mocks + in-memory
```

**Fix 2:** start the stack first for integration tests:

```bash
make dev-up
make dev-test-backend                 # runs inside the container
```

## Ollama connection errors

**Symptom:**

```
httpx.ConnectError: [Errno 111] Connection refused
```

from inside the backend container when it tries to call Ollama.

**Cause:** Ollama is not running on the host OR it binds to 127.0.0.1 only (not 0.0.0.0).

**Fix:**

```bash
# On the host (not in a container):
ollama serve                         # or use systemd if you installed that way

# If it is running but still refused, bind to all interfaces:
OLLAMA_HOST=0.0.0.0:11434 ollama serve

# Verify the container can reach it:
make dev-shell-backend
curl http://host.docker.internal:11434/api/tags
```

If `curl` works but your Python code still fails, the AI backend might be set to `vertex` or some other value. Check:

```bash
echo $AI_BACKEND                     # should be 'ollama' or 'mock'
```

## Pre-commit hook blocks the commit

**Symptom:**

```
Ban em dashes and en dashes..............................................Failed
- hook id: no-em-dashes
- exit code: 1
```

**Cause:** you typed an em dash (-) or en dash (-) somewhere. CLAUDE.md rule 5 bans them.

**Fix:** replace with a hyphen (`-`), a parenthesis, or restructure the sentence. The hook output tells you the file and line.

---

**Symptom:**

```
Ban the word utilisation.................................................Failed
```

**Fix:** replace "utilisation" with "work time", "capacity", or "contribution" depending on meaning. CLAUDE.md rule 6.

## Everything is confused and I want to start over

```bash
make dev-reset                        # wipes containers + volumes
rm -rf backend/.venv frontend/node_modules frontend/.next
make mvp-up                           # rebuild from scratch (5 min)
```

If even THAT does not work, nuke Docker entirely:

```bash
docker system prune -a --volumes      # DANGEROUS: deletes every Docker image, container, volume on your machine
make mvp-up
```

**Only use `docker system prune -a --volumes` if you are sure no other project on your laptop depends on Docker state.** It deletes everything.
