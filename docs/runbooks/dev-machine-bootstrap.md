# Dev Machine Bootstrap

> **Who this is for.** A new co-founder, hire, or contributor setting up their first Gamma development environment on a fresh laptop. Also the founder re-bootstrapping after a machine wipe.
> **When to run.** Once per laptop. Re-run safely any time the script changes.
> **Time estimate.** 10-15 minutes on a clean WSL Ubuntu; ~30 seconds on re-runs once everything is installed.
> **Authorization.** None needed for the automated part. The manual follow-up steps require a Google account with billing admin on the Global Gamma Ltd GCP organization.
> **Reversibility.** Safe. The script only installs packages and creates a Python venv at `infra/ops/.venv/`. Removing the venv and re-running starts fresh.
> **Cross-references.** `scripts/setup/bootstrap-dev.sh` (the script itself), `docs/runbooks/gcp-bootstrap.md` (next step after this one), `docs/runbooks/secrets-management.md` (credentials), `EXECUTION_CHECKLIST.md` §2 (Phase 0 kickoff).

---

## 1. Prerequisites

Before running the script, verify:

- [ ] You are on **WSL2 Ubuntu 22.04+**, native Ubuntu 22.04+, or Debian 12+. Other Linux distributions may work but are not tested.
- [ ] You have **sudo access** on your user account. The script calls `sudo apt-get` several times.
- [ ] **git** is already installed (`git --version`).
- [ ] You have **cloned the gammahr_v2 repo** to disk. Typical path: `~/ai-workspace/claude-projects/gammahr_v2`.
- [ ] You have a stable **internet connection** for the apt + pip downloads (~250 MB total).
- [ ] You are NOT running the script as root. Use your normal user account.

## 2. Run the script

From inside the repo root:

```bash
cd ~/ai-workspace/claude-projects/gammahr_v2
bash scripts/setup/bootstrap-dev.sh
```

You will be prompted for your sudo password at least once (apt install).

Expected output:

- Six `==>` section markers, one per step
- `pre-commit run --all-files` shows nine green checks
- `pytest tests/` shows `13 passed in <1s`
- A final `Bootstrap complete` banner with the manual next steps

Expected wall time:

- First run on a clean machine: **5-10 minutes** (Python + ~60 pip packages + gcloud install)
- Re-run after everything is installed: **~30 seconds** (skips what is already done)

## 3. What the script does, step by step

### Step 1: System packages
Installs python3, python3-venv, python3-pip, pre-commit, curl, wget, git, make, gcc, and the apt tooling needed to add a third-party repository (ca-certificates, gnupg, lsb-release, apt-transport-https, software-properties-common).

### Step 2: Python 3.12 check
The `infra/ops/` library requires Python 3.12 or newer. Ubuntu 24.04 ships with Python 3.12 as the default `python3`. Ubuntu 22.04 ships with Python 3.10, so the script adds the deadsnakes PPA and installs Python 3.12 explicitly. Either way, you end up with a `python3.12` binary available.

### Step 3: Pre-commit hooks
Installs the git pre-commit hook (`.git/hooks/pre-commit`) and runs all hooks on every file in the repo as a smoke test. The nine hooks are:

1. **gitleaks** (secret scanning)
2. **trailing-whitespace** (style)
3. **end-of-file-fixer** (style)
4. **check-added-large-files** (max 500 KB, prototype/ excluded)
5. **check-yaml** (syntax)
6. **check-json** (syntax)
7. **check-merge-conflict** (no stray `<<<<<<<` markers)
8. **no-em-dashes** (CLAUDE.md rule 5)
9. **no-utilisation** (CLAUDE.md rule 6)

The script unsets the redundant `core.hooksPath` git config if it was explicitly set, because pre-commit cowardly refuses to install when it is.

### Step 4: Install gamma-ops library
Creates `infra/ops/.venv/` with Python 3.12, installs the library in editable mode (`pip install -e ".[dev]"`) with all dev dependencies. Pulls ~60 Google Cloud SDK packages and dev tools (pytest, mypy, ruff, hypothesis). The venv is local to `infra/ops/` and gitignored.

### Step 5: Unit tests
Runs the 13-test unit suite. These tests mock the Google Cloud SDK clients, so they run offline without any GCP credentials. Expected result: `13 passed in <1s`.

### Step 6: Google Cloud SDK
Installs `gcloud` via Google's official apt repository. NOT via snap, NOT via curl-pipe-bash. After install, `gcloud --version` prints the installed version.

## 4. Next steps after the script finishes

These are interactive and require real credentials, so they are NOT automated in the script. Do them in order:

### 4.1 Authenticate with Google

```bash
gcloud auth login
gcloud auth application-default login
```

The first command opens a browser and authenticates your Google account for `gcloud` commands. The second command stores Application Default Credentials (ADC) that the `gamma-ops` Python library reads automatically.

See `docs/runbooks/secrets-management.md` §3 for why we use ADC instead of service account JSON key files.

### 4.2 Find your GCP billing account ID

```bash
gcloud billing accounts list
```

Copy the ID (format: `ABCDEF-123456-GHIJKL`). You will paste it into the `.env` file in the next step.

### 4.3 Create the local .env file

```bash
cd ~/ai-workspace/claude-projects/gammahr_v2/infra/ops
cp .env.example .env
```

Open `.env` in your editor and set at minimum:

```
GCP_PROJECT_ID=gamma-staging-001
GCP_BILLING_ACCOUNT_ID=<paste the ID from step 4.2>
GCP_REGION=europe-west9
GAMMA_ENV=staging
```

The `.env` file is gitignored and never committed. Do not share its contents.

### 4.4 Activate the venv

```bash
source ~/ai-workspace/claude-projects/gammahr_v2/infra/ops/.venv/bin/activate
```

Optional convenience: add this line to your `~/.bashrc` so the venv is always active when you open a terminal.

After activation, `gamma-ops --help` works directly without the venv path prefix.

### 4.5 Create the first GCP project

```bash
cd ~/ai-workspace/claude-projects/gammahr_v2/infra/ops
gamma-ops gcp projects create gamma-staging-001 \
  --display-name 'Gamma Staging'
```

This is Phase 2 Task 1 from `EXECUTION_CHECKLIST.md` §3.1. After it succeeds, continue with the full environment bootstrap in `docs/runbooks/gcp-bootstrap.md` (enable APIs, link billing, create KMS keyring, create buckets with CMEK, create secrets, etc.).

### 4.6 Start the local development stack

The local dev stack runs Postgres 16, Redis 7, and Mailhog in Docker. You need it up before any backend or frontend feature work (`EXECUTION_CHECKLIST.md` §3.2 onward).

**One-time: put your user in the docker group so `docker` runs without sudo.**

```bash
sudo usermod -aG docker $USER
# Log out and back in, OR run `newgrp docker` in the current shell.
docker ps    # should succeed without sudo
```

**Start the stack:**

```bash
cd ~/ai-workspace/claude-projects/gammahr_v2
make dev-up
```

`make dev-up` starts all three services and waits for healthchecks. On a first run it will pull ~200 MB of images (30-90 seconds on a normal connection). On subsequent runs it takes 3-5 seconds.

Expected final output:

```
Dev stack ready:
  Postgres:  postgresql://gamma:gamma_dev_password@localhost:5432/gamma_dev
  Redis:     redis://localhost:6379
  Mailhog:   smtp://localhost:1025  ui http://localhost:8025
```

**Verify each service:**

```bash
# Postgres: connect and list extensions + dev bootstrap marker
psql postgresql://gamma:gamma_dev_password@localhost:5432/gamma_dev \
  -c "SELECT name FROM _dev_bootstrap; SELECT extname FROM pg_extension ORDER BY extname;"

# Redis: ping
redis-cli -h localhost ping    # PONG

# Mailhog UI
xdg-open http://localhost:8025 2>/dev/null || echo "Open http://localhost:8025 in a browser"
```

**Other make targets:**

| Target | What it does |
|---|---|
| `make dev-up` | Start the stack, wait for healthchecks |
| `make dev-down` | Stop the stack, preserve data volumes |
| `make dev-reset` | Stop and destroy volumes, start fresh (use after a broken migration) |
| `make dev-logs` | Tail logs from all services |
| `make dev-ps` | Show running services |
| `make dev-psql` | Open a psql shell inside the postgres container |

**Data lives in named Docker volumes** (`gamma_dev_postgres_data`, `gamma_dev_redis_data`). `make dev-down` preserves them; only `make dev-reset` nukes them.

**Port conflicts?** If 5432, 6379, 1025, or 8025 are already in use on your machine, `make dev-up` will fail with "port is already allocated". Stop the conflicting service or change the host-side ports in `infra/docker/docker-compose.dev.yml` (the container-side ports stay the same). Do not commit the port change; use `docker-compose.override.yml` instead.

## 5. Troubleshooting

### Script fails at Step 1 with "Unable to locate package"

Your apt cache is stale. Run `sudo apt-get update` manually and re-run the script.

### Script fails at Step 2 with "Could not add PPA"

You are likely on a non-Ubuntu distribution (Debian, Mint, Pop OS). The deadsnakes PPA is Ubuntu-only. Options:

1. Install Python 3.12 from your distribution's package manager
2. Use pyenv to install Python 3.12 locally: `curl https://pyenv.run | bash`
3. Switch to Ubuntu 22.04+ or 24.04+ in WSL

### Step 3 fails with "Cowardly refusing to install hooks with core.hooksPath set"

The script should unset this automatically. If you see the error, it means the unset failed (usually because of a different error earlier in the script). Manually run:

```bash
cd ~/ai-workspace/claude-projects/gammahr_v2
git config --unset core.hooksPath
```

Then re-run the bootstrap script.

### Step 3 fails with "Executable `python` not found"

You are running an old version of `.pre-commit-config.yaml` that invokes `python` instead of `python3`. Pull the latest `main` branch and re-run.

### Step 3 fails with "Failed: Ban em dashes" or "Failed: Ban the word utilisation"

Someone committed a file that contains a forbidden character or word. The hook prints the exact file path and line number. Two cases:

- **Legitimate rule reference** (e.g., a new runbook that mentions the forbidden word while explaining the rule): add the file to the allowlist in `.pre-commit-config.yaml`. Precedent exists for CLAUDE.md, SCOPE.md, docs/FLAWLESS_GATE.md, and everything in `.claude/skills/`.
- **Accidental use** in real prose: edit the file to replace the word (utilisation -> work time / capacity / contribution; em dash -> hyphen or restructure). Commit the fix.

Do NOT disable the hook to bypass the error. The hook is a guardrail.

### Step 4 fails with "pip install -e" error about missing dependency

The most common cause is a transient PyPI mirror issue. Re-run the script. If it keeps failing on the same package, check your network or retry later. Do NOT pin older versions of dependencies to work around a mirror hiccup.

### Step 5 (pytest) fails with "ModuleNotFoundError"

The venv was not activated or the editable install did not succeed. Delete `infra/ops/.venv/` and re-run the script. The script will rebuild the venv from scratch.

### Step 6 fails with "curl: Could not resolve host"

You do not have internet access. Fix the network and re-run. WSL users: try `wsl --shutdown` from Windows PowerShell, then re-launch WSL and re-run.

### gcloud auth opens a browser that cannot load

WSL users: `gcloud auth login --no-launch-browser` prints a URL you copy into your Windows browser manually. Then paste the resulting auth code back into WSL.

### gcloud billing accounts list returns nothing

You are authenticated as an account without billing access to Global Gamma Ltd. Switch accounts:

```bash
gcloud auth login <your-global-gamma-email>
```

If you have no billing access, talk to the founder. Do not create projects in your personal GCP account by accident.

## 6. What to do when you are done

After all the steps in §4 succeed and you have created `gamma-staging-001`:

1. Tell the founder "staging project live"
2. Follow `docs/runbooks/gcp-bootstrap.md` §2 for the rest of the environment bootstrap (APIs, billing link, KMS, buckets, etc.)
3. When the full environment bootstrap is done, you are ready to start Phase 2 backend or frontend work per `EXECUTION_CHECKLIST.md` §3.

## 7. Re-running the script later

The script is idempotent. You can re-run it any time:

- When the script itself is updated (pull main, re-run)
- When `.pre-commit-config.yaml` is updated (re-run to pick up new hooks)
- After wiping `infra/ops/.venv/` (re-run to rebuild the venv)
- On a brand new machine (full fresh install)

Re-runs are fast (~30 seconds) because apt, pre-commit, and gcloud all check "already installed" and skip.
