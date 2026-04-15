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
# Step 1/6: System packages
# ------------------------------------------------------------------------------
say "Step 1/6: System packages (apt)"
sudo apt-get update
sudo apt-get install -y \
  python3 python3-venv python3-pip \
  pre-commit \
  curl wget git make gcc \
  ca-certificates gnupg lsb-release \
  apt-transport-https software-properties-common

# ------------------------------------------------------------------------------
# Step 2/6: Ensure Python 3.12+ (the infra/ops library requires it)
# ------------------------------------------------------------------------------
say "Step 2/6: Python ${REQUIRED_PY_MAJOR}.${REQUIRED_PY_MINOR}+ check"
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
# Step 3/6: Pre-commit hooks (secrets + em dashes + utilisation)
# ------------------------------------------------------------------------------
say "Step 3/6: Pre-commit hooks"
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
# Step 4/6: Install infra/ops library in its own venv
# ------------------------------------------------------------------------------
say "Step 4/6: Install gamma-ops library"
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
# Step 5/6: Unit tests
# ------------------------------------------------------------------------------
say "Step 5/6: gamma-ops unit tests"
.venv/bin/pytest tests/ -v

# ------------------------------------------------------------------------------
# Step 6/6: Google Cloud SDK
# ------------------------------------------------------------------------------
say "Step 6/6: Google Cloud SDK"
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
# Done
# ------------------------------------------------------------------------------
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}Bootstrap complete. All automated steps passed.${NC}"
echo -e "${GREEN}============================================================${NC}"

cat <<EOF

NEXT STEPS (interactive, run these manually in order):

  1. Authenticate with Google:
       gcloud auth login
       gcloud auth application-default login

  2. Find your GCP billing account ID:
       gcloud billing accounts list
     Copy the ID (format: ABCDEF-123456-GHIJKL).

  3. Set up the local .env for the ops library:
       cd $REPO_ROOT/infra/ops
       cp .env.example .env
       # Open .env in your editor and set:
       #   GCP_PROJECT_ID=gamma-staging-001
       #   GCP_BILLING_ACCOUNT_ID=<the ID from step 2>
       #   GCP_REGION=europe-west9

  4. Activate the venv in your shell (add to .bashrc / .zshrc for convenience):
       source $REPO_ROOT/infra/ops/.venv/bin/activate

  5. Create the staging GCP project:
       cd $REPO_ROOT/infra/ops
       gamma-ops gcp projects create gamma-staging-001 \\
         --display-name 'Gamma Staging'

  6. Follow docs/runbooks/gcp-bootstrap.md for the full environment bootstrap
     (enable APIs, link billing, create KMS keyring, create buckets, etc.).

When you hit any error, stop and check docs/runbooks/dev-machine-bootstrap.md
troubleshooting section. Do not improvise.

EOF
