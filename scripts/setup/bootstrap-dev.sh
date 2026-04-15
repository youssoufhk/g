#!/usr/bin/env bash
#
# Gamma dev machine bootstrap.
#
# What this script does (all automated, idempotent, safe to re-run):
#   1. Installs system packages (python3, pre-commit, build tools, gcloud deps)
#   2. Ensures Python 3.12+ is available (installs via deadsnakes PPA if not)
#   3. Unsets the redundant core.hooksPath, installs pre-commit, runs all hooks
#   4. Installs the infra/ops Python library in an isolated venv
#   5. Runs the gamma-ops unit test suite (13 tests)
#   6. Installs the Google Cloud SDK via Google's official apt repository
#   7. Installs Docker Engine + compose plugin and adds the user to the docker group
#   8. Installs Node 22 LTS via NodeSource for the Next.js frontend
#
# What you do after (interactive, manual):
#   - gcloud auth login
#   - gcloud auth application-default login
#   - Create .env from .env.example in infra/ops/
#   - Follow docs/runbooks/gcp-bootstrap.md to create your first GCP project
#
# Prerequisites:
#   - WSL2 Ubuntu 22.04+ OR native Ubuntu 22.04+ OR Debian 12+
#   - sudo access on the user account
#   - git already installed
#   - Repo already cloned anywhere on disk
#
# Usage:
#   cd /path/to/gammahr_v2
#   bash scripts/setup/bootstrap-dev.sh
#
# Reference: docs/runbooks/dev-machine-bootstrap.md for the full runbook,
#            including troubleshooting and the post-script manual steps.

set -euo pipefail

# ------------------------------------------------------------------------------
# Refuse to run if sourced. set -euo pipefail would kill the caller's shell
# on any non-zero exit, which is how you get "terminal closes unexpectedly".
# ------------------------------------------------------------------------------
if [[ "${BASH_SOURCE[0]}" != "$0" ]] 2>/dev/null || [[ -n "${ZSH_EVAL_CONTEXT:-}" && "${ZSH_EVAL_CONTEXT}" == *:file:* ]]; then
  echo "ERROR: Do not source this script. It uses 'set -e' which would kill your shell."
  echo "Run it with:   bash scripts/setup/bootstrap-dev.sh"
  return 1 2>/dev/null || exit 1
fi

# ------------------------------------------------------------------------------
# Configuration
# ------------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
REQUIRED_PY_MAJOR=3
REQUIRED_PY_MINOR=12

# ------------------------------------------------------------------------------
# Output helpers
# ------------------------------------------------------------------------------
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
RED='\033[1;31m'
NC='\033[0m'

say()  { echo -e "${GREEN}==>${NC} $1"; }
warn() { echo -e "${YELLOW}WARN:${NC} $1"; }
fail() { echo -e "${RED}FAIL:${NC} $1"; exit 1; }

# ------------------------------------------------------------------------------
# Sanity checks
# ------------------------------------------------------------------------------
if [[ "$EUID" == "0" ]]; then
  fail "Do not run this script as root. It uses sudo internally where needed."
fi

for cmd in sudo git curl; do
  command -v "$cmd" >/dev/null 2>&1 || fail "$cmd is required. Install it first."
done

if [[ ! -d "$REPO_ROOT/infra/ops" ]]; then
  fail "Repo layout looks wrong. Expected: $REPO_ROOT/infra/ops"
fi

cd "$REPO_ROOT"
say "Repo root: $REPO_ROOT"

# ------------------------------------------------------------------------------
# Prime the sudo credential cache upfront, before any apt commands.
# This avoids two failure modes:
#   1. sudo prompts for password mid-script in a non-interactive context
#      and fails with "a terminal is required to read the password"
#   2. sudo prompts from within a subshell and the user never sees it
# If sudo cannot authenticate, we fail fast here with a clear message.
# ------------------------------------------------------------------------------
say "Priming sudo credential cache (will prompt for password once)"
if ! sudo -v; then
  fail "sudo authentication failed. Run 'sudo -v' manually and re-run this script."
fi

# Keep the sudo credential cache alive for the duration of the script,
# so apt commands do not re-prompt mid-flight.
( while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null ) &
SUDO_KEEPALIVE_PID=$!
trap 'kill $SUDO_KEEPALIVE_PID 2>/dev/null || true' EXIT

# ------------------------------------------------------------------------------
# Step 1/8: System packages
# ------------------------------------------------------------------------------
say "Step 1/8: System packages (apt)"
sudo apt-get update
sudo apt-get install -y \
  python3 python3-venv python3-pip \
  pre-commit \
  curl wget git make gcc \
  ca-certificates gnupg lsb-release \
  apt-transport-https software-properties-common

# ------------------------------------------------------------------------------
# Step 2/8: Ensure Python 3.12+ (the infra/ops library requires it)
# ------------------------------------------------------------------------------
say "Step 2/8: Python ${REQUIRED_PY_MAJOR}.${REQUIRED_PY_MINOR}+ check"
if python3 -c "import sys; sys.exit(0 if sys.version_info >= (${REQUIRED_PY_MAJOR}, ${REQUIRED_PY_MINOR}) else 1)" 2>/dev/null; then
  PY=python3
  echo "    $(python3 --version) is new enough, using it"
else
  echo "    Default python3 is older than ${REQUIRED_PY_MAJOR}.${REQUIRED_PY_MINOR}, installing via deadsnakes PPA"
  sudo add-apt-repository -y ppa:deadsnakes/ppa
  sudo apt-get update
  sudo apt-get install -y python3.12 python3.12-venv python3.12-dev
  PY=python3.12
  echo "    Installed $($PY --version)"
fi

# ------------------------------------------------------------------------------
# Step 3/8: Pre-commit hooks (secrets + em dashes + utilisation)
# ------------------------------------------------------------------------------
say "Step 3/8: Pre-commit hooks"
if git config --get core.hooksPath >/dev/null 2>&1; then
  git config --unset core.hooksPath
  echo "    Unset redundant core.hooksPath (it was set to the default value)"
fi

pre-commit install
echo "    Running pre-commit on all files (may take 30-60s)..."
if ! pre-commit run --all-files; then
  warn "pre-commit reported issues. Review the output above."
  warn "If it auto-fixed trailing whitespace or missing EOF newline, stage"
  warn "the changed files (git add) and re-run this script."
  warn "If it reported a committed secret, a banned word, or a bad em dash,"
  warn "fix the offending file manually and re-run."
  exit 1
fi

# ------------------------------------------------------------------------------
# Step 4/8: Install infra/ops library in its own venv
# ------------------------------------------------------------------------------
say "Step 4/8: Install gamma-ops library"
cd "$REPO_ROOT/infra/ops"

if [[ -d .venv ]]; then
  if ! .venv/bin/python -c "import sys; sys.exit(0 if sys.version_info >= (${REQUIRED_PY_MAJOR}, ${REQUIRED_PY_MINOR}) else 1)" 2>/dev/null; then
    echo "    Existing .venv uses old Python, rebuilding"
    rm -rf .venv
  else
    echo "    .venv already uses Python ${REQUIRED_PY_MAJOR}.${REQUIRED_PY_MINOR}+, reusing"
  fi
fi

if [[ ! -d .venv ]]; then
  $PY -m venv .venv
fi

.venv/bin/pip install --upgrade pip --quiet
.venv/bin/pip install -e ".[dev]" --quiet
INSTALLED_VERSION=$(.venv/bin/python -c "import gamma_ops; print(gamma_ops.__version__)")
echo "    Installed gamma-ops $INSTALLED_VERSION"

# ------------------------------------------------------------------------------
# Step 5/8: Unit tests
# ------------------------------------------------------------------------------
say "Step 5/8: gamma-ops unit tests"
.venv/bin/pytest tests/ -v

# ------------------------------------------------------------------------------
# Step 6/8: Google Cloud SDK
# ------------------------------------------------------------------------------
say "Step 6/8: Google Cloud SDK"
cd "$REPO_ROOT"

if command -v gcloud >/dev/null 2>&1; then
  echo "    gcloud already installed: $(gcloud --version | head -1)"
else
  curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | \
    sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
  echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | \
    sudo tee /etc/apt/sources.list.d/google-cloud-sdk.list > /dev/null
  sudo apt-get update
  sudo apt-get install -y google-cloud-cli
  echo "    Installed $(gcloud --version | head -1)"
fi

# ------------------------------------------------------------------------------
# Step 7/8: Docker Engine + compose plugin (for local dev stack)
# ------------------------------------------------------------------------------
say "Step 7/8: Docker Engine + compose plugin"
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  echo "    docker already installed: $(docker --version)"
  echo "    compose plugin already installed: $(docker compose version | head -1)"
else
  sudo apt-get install -y docker.io docker-compose-v2
  echo "    Installed $(docker --version)"
fi

# Make sure the daemon is running on systems where apt does not auto-start it
if command -v systemctl >/dev/null 2>&1 && systemctl list-unit-files docker.service >/dev/null 2>&1; then
  if ! systemctl is-active --quiet docker; then
    sudo systemctl enable --now docker || warn "Could not start docker.service via systemctl (WSL without systemd is OK; the daemon starts on first use)"
  fi
fi

# Add the current user to the docker group so `docker` runs without sudo
if ! id -nG "$USER" | tr ' ' '\n' | grep -qx docker; then
  sudo usermod -aG docker "$USER"
  NEEDS_RELOGIN=1
  echo "    Added $USER to the docker group"
else
  NEEDS_RELOGIN=0
  echo "    $USER already in the docker group"
fi

# Verify daemon reachability (will fail on first run without re-login, that is expected)
if docker ps >/dev/null 2>&1; then
  echo "    docker daemon reachable without sudo"
else
  warn "docker daemon is NOT reachable without sudo yet. This is expected if the"
  warn "group membership was just added. Run 'newgrp docker' in your current shell"
  warn "OR log out and back in, then re-run 'make dev-up' from the repo root."
fi

# ------------------------------------------------------------------------------
# Step 8/8: Node 22 LTS via NodeSource (for the Next.js frontend)
# ------------------------------------------------------------------------------
say "Step 8/8: Node 22 LTS"
if command -v node >/dev/null 2>&1; then
  NODE_MAJOR=$(node --version | sed -E 's/^v([0-9]+).*/\1/')
  if [[ "$NODE_MAJOR" -ge 22 ]]; then
    echo "    Node already installed: $(node --version)"
  else
    echo "    Node $NODE_MAJOR detected; upgrading to 22 LTS via NodeSource"
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "    Installed $(node --version)"
  fi
else
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
  echo "    Installed $(node --version)"
fi

# ------------------------------------------------------------------------------
# Done
# ------------------------------------------------------------------------------
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}Bootstrap complete. All automated steps passed.${NC}"
echo -e "${GREEN}============================================================${NC}"

cat <<EOF

NEXT STEPS for the MVP build track (do these in order, all local, no GCP):

  1. If the script just added you to the docker group, either log out and back
     in OR run:
       newgrp docker
     Then verify:
       docker ps

  2. Bring the local stack up and install backend + frontend + run Alembic:
       cd $REPO_ROOT
       make mvp-up

  3. In two separate terminals, start the services:
       make backend-run      # FastAPI at http://localhost:8000
       make frontend-dev     # Next.js at http://localhost:3000

  4. Browse http://localhost:3000/en and start Phase 3a work from
     EXECUTION_CHECKLIST.md section 4.1.

DEPLOY TRACK (GCP), deferred until after Phase 5a MVP is demo-ready:

  * docs/runbooks/gcp-bootstrap.md when the founder explicitly calls for it
  * EXECUTION_CHECKLIST.md section 16 Deploy Track

When you hit any error, stop and check docs/runbooks/dev-machine-bootstrap.md
troubleshooting section. Do not improvise.

EOF
