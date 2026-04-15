# 1. Quickstart

Zero to running Gamma app in 5 commands. First run takes about 10 minutes (most of it is downloading Docker images). Subsequent runs take 30 seconds.

## What you need before you start

- **WSL2 Ubuntu** on Windows 11, OR **native Ubuntu 22.04+**, OR **Debian 12+**. Other Linux distros might work but have not been tested.
- **sudo** access on your user account. The setup script needs it to install system packages.
- **git** already installed. Check with `git --version`.
- **About 10 GB free disk space** for Docker images, Python deps, and `node_modules`.
- **A clone of the repo** on disk. Typical path: `~/ai-workspace/claude-projects/gammahr_v2`.

If you do not have sudo access or you are on macOS or raw Windows (no WSL), stop here and talk to the founder. The stack can be adapted but it is not a 5-minute fix.

## Step 1: Bootstrap your machine (one time, 5-10 minutes)

From the repo root:

```bash
bash scripts/setup/bootstrap-dev.sh
```

Expect a single sudo password prompt near the start. The script installs all of these, idempotent and safe to re-run:

- **Python 3.12** (via the deadsnakes apt repo if your distro ships something older)
- **pre-commit** hooks (checks your commits locally before they land in git)
- **Node 22 LTS** (runs the Next.js frontend)
- **Docker Engine + docker compose plugin** (runs the whole dev stack)
- **Google Cloud SDK** (for the post-MVP deploy track; unused right now)
- **The `infra/ops` Python library** (automation helpers for when deploy work starts)

At the end, the script adds your user to the `docker` group so `docker` commands work without sudo. That group membership **does not apply to your current shell**. You have to start a fresh one. Easiest way:

```bash
newgrp docker   # spawn a subshell that has the new group
```

Or close and reopen your WSL/terminal window. Or run `wsl --shutdown` from Windows PowerShell and reopen WSL (permanent, works for every new session forever).

Verify with:

```bash
docker ps
```

You should see an empty table (header row only, no error). If you see `permission denied while trying to connect to the Docker daemon`, the docker group has not taken effect yet. See `06-debugging.md`.

## Step 2: Start the stack (one command)

From the repo root:

```bash
make mvp-up
```

This command does a lot of things in one shot, in order:

1. **Builds the backend Docker image**: Python 3.12 slim + FastAPI + SQLAlchemy + WeasyPrint system libs + your source.
2. **Builds the frontend Docker image**: Node 22 alpine + Next.js + your source.
3. **Starts 5 containers**: `postgres` (the database), `redis` (cache + job queue), `mailpit` (fake SMTP server for local email), `backend` (FastAPI), `frontend` (Next.js).
4. **Waits for each container to go healthy**. First-run: 2 to 5 minutes (Docker needs to pull and build images, Next.js needs to do a cold compile). Later runs: 20 to 30 seconds.
5. **Runs `alembic upgrade head`** inside the backend container, creating the Postgres tables.

When it returns, it prints:

```
MVP stack live:
  App:       http://localhost:3000/en
  Ops API:   http://localhost:8000/api/v1/ops/features
  Mailpit:   http://localhost:8025
```

## Step 3: See the app in your browser

Open each of these in your browser:

- **http://localhost:3000/en** - the Gamma app. You should land on a dashboard with a welcome card and 4 empty KPI placeholders. Dark mode.
- **http://localhost:8000/docs** - Swagger UI for the backend API. Every endpoint is listed, typed, and runnable right there.
- **http://localhost:8000/health** - raw health check. Returns `{"status":"ok","env":"dev","name":"gamma"}`.
- **http://localhost:8025** - Mailpit web UI. Empty until something sends email; Phase 3a onboarding will put things here.

## Step 4: See what is happening (optional)

Open a second terminal and tail the logs:

```bash
make dev-logs-backend     # just the backend logs
make dev-logs-frontend    # just the frontend logs
make dev-logs             # all 5 services mixed together
```

Press `Ctrl-C` to stop tailing. That does not stop the containers, just the log stream.

## Step 5: Stop the stack when you are done

```bash
make dev-down
```

The containers stop but your Postgres data and any files in the named volumes are preserved. Next `make mvp-up` starts in ~30 seconds because images are cached and data is already on disk.

If you want to wipe everything and start fresh (including blowing away the dev database):

```bash
make dev-reset
```

## Something went wrong?

Go to [`06-debugging.md`](06-debugging.md). The common issues are there with copy-pasteable fixes.
