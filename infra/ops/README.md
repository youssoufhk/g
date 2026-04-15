# gamma-ops

Deterministic, idempotent Python wrappers around GCP, Cloudflare, and tenant
operations. Skills, agents, and humans all call these functions instead of
re-implementing vendor SDK calls.

## 1. What this is

`gamma-ops` is the operations library for the Gamma platform. It lives in
`infra/ops/` as a standalone Python package, has its own `pyproject.toml`,
its own dependencies, and its own CLI entry point (`gamma-ops`). It is
intentionally separated from the Gamma backend: the app in `backend/app/`
never imports from `gamma_ops`, and `gamma_ops` never imports from the app.
Both read the same `.env` (or environment variables) for configuration.

The library exists to stop the founders, the co-founder, and every Claude
Code subagent from re-inventing vendor SDK calls on each run. If the answer
to "how do I create a KMS key with per-tenant rotation" is different each
time, you build the wrong thing. If the answer is "call
`gamma_ops.gcp.kms.create_crypto_key`", every caller gets the same,
battle-tested behavior.

The library is also educational. Every function has a docstring that says
what it does, why it exists, and what failure modes it handles. Future hires
learn the stack by reading the module tree. New operations are added by
writing a new function with the same docstring shape; no tribal knowledge.

Hard properties every operation respects:

- **Idempotent.** Running a function twice is always safe. `create_bucket`
  returns the existing bucket on the second run; `enable_apis` skips
  already-enabled services; `create_secret` adds a new version if the
  secret exists; `delete_project` tolerates already-deleted state.
- **Deterministic.** Same inputs, same outputs. No hidden global state.
- **Typed.** Python 3.12, type hints on every parameter and return,
  Pydantic v2 for config.
- **Logged.** Every operation logs entry, success, and failure as structured
  JSON via `structlog`. Pipe to Cloud Logging or any JSON-line aggregator.
- **Vendor-agnostic errors.** Every Google API exception is translated to a
  `gamma_ops.errors.OpsError` subclass. Callers do not import
  `google.api_core.exceptions`.

## 2. Install

Requires Python 3.12.

```bash
cd infra/ops
make install           # uses uv
# or
make install-pip       # uses pip
source .venv/bin/activate
```

Authenticate with Application Default Credentials before running any GCP
operation:

```bash
gcloud auth application-default login
```

Copy the example env file and fill in values:

```bash
cp .env.example .env
# edit .env
```

Never commit `.env` or any service account JSON file. The library reads
ADC from the standard Google SDK locations; it does not accept credential
JSON from the repo.

## 3. Quick start

```bash
# Smoke test
gamma-ops --version
gamma-ops --help

# Create a bucket (idempotent; safe to re-run)
gamma-ops gcp storage create-bucket gamma-staging-files --region europe-west9

# List buckets
gamma-ops gcp storage list-buckets

# Create a keyring and a key
gamma-ops gcp kms create-keyring gamma-tenant --location europe-west9
gamma-ops gcp kms create-key tenant-acme --keyring gamma-tenant --rotation-days 365

# Store a secret from a file
echo -n "hunter2" > /tmp/pw.txt
gamma-ops gcp secrets create db-password-staging --value-file /tmp/pw.txt
rm /tmp/pw.txt
```

Python usage is exactly the same surface:

```python
from gamma_ops.gcp.storage import create_bucket, LifecycleRule, set_lifecycle

result = create_bucket(
    "gamma-staging-files",
    location="europe-west9",
    cmek_key="projects/gamma-staging/locations/europe-west9/keyRings/gamma-tenant/cryptoKeys/default",
)
set_lifecycle("gamma-staging-files", [
    LifecycleRule(action="Delete", age_days=30, matches_prefix=["imports/"]),
])
```

## 4. How it fits with the app

```
gammahr_v2/
  backend/app/       <- the Gamma app (FastAPI + Celery + SQLAlchemy)
  frontend/          <- the Gamma app (Next.js)
  infra/ops/         <- this library (gamma-ops)
```

- `gamma_ops` never imports from `backend.app`.
- `backend.app` never imports from `gamma_ops`.
- Both read the same environment variables (or `.env` at the project root).
- The app uses the runtime Google SDKs for the hot path (reading objects,
  decrypting via KMS, publishing to Pub/Sub). `gamma_ops` uses the
  management Google SDKs for provisioning, drift detection, and disaster
  recovery. Different concerns, different packages.

When a skill or agent needs to provision a resource, it imports from
`gamma_ops` and calls the function. It does not shell out to `gcloud`, and
it does not re-invent the SDK call inside the prompt.

## 5. Operation catalog

Status legend: Implemented, Stub (signature + docstring, raises
`NotImplementedError`), Planned (not in the tree yet).

### GCP projects and billing

| Operation | Module | Status |
|---|---|---|
| `create_project` | `gamma_ops.gcp.projects` | Implemented |
| `enable_apis` | `gamma_ops.gcp.projects` | Implemented |
| `link_billing` | `gamma_ops.gcp.projects` | Implemented |
| `list_projects` | `gamma_ops.gcp.projects` | Implemented |
| `delete_project` | `gamma_ops.gcp.projects` | Implemented |

### GCP Cloud SQL

| Operation | Module | Status |
|---|---|---|
| `create_instance` | `gamma_ops.gcp.cloudsql` | Stub |
| `create_database` | `gamma_ops.gcp.cloudsql` | Stub |
| `create_user` | `gamma_ops.gcp.cloudsql` | Stub |
| `failover` | `gamma_ops.gcp.cloudsql` | Stub |
| `pitr_restore` | `gamma_ops.gcp.cloudsql` | Stub |

### GCP Cloud Run

| Operation | Module | Status |
|---|---|---|
| `create_service` | `gamma_ops.gcp.cloudrun` | Stub |
| `deploy_revision` | `gamma_ops.gcp.cloudrun` | Stub |
| `traffic_split` | `gamma_ops.gcp.cloudrun` | Stub |
| `rollback` | `gamma_ops.gcp.cloudrun` | Stub |
| `health_check` | `gamma_ops.gcp.cloudrun` | Stub |

### GCP Cloud Storage

| Operation | Module | Status |
|---|---|---|
| `create_bucket` (with CMEK, retention, PAP) | `gamma_ops.gcp.storage` | Implemented |
| `set_lifecycle` | `gamma_ops.gcp.storage` | Implemented |
| `delete_bucket` | `gamma_ops.gcp.storage` | Implemented |
| `list_buckets` | `gamma_ops.gcp.storage` | Implemented |

### GCP KMS

| Operation | Module | Status |
|---|---|---|
| `create_keyring` | `gamma_ops.gcp.kms` | Implemented |
| `create_crypto_key` (with rotation) | `gamma_ops.gcp.kms` | Implemented |
| `rotate_key` | `gamma_ops.gcp.kms` | Implemented |
| `list_keys` | `gamma_ops.gcp.kms` | Implemented |

### GCP Secret Manager

| Operation | Module | Status |
|---|---|---|
| `create_secret` | `gamma_ops.gcp.secrets` | Implemented |
| `read_secret` | `gamma_ops.gcp.secrets` | Implemented |
| `rotate_secret` | `gamma_ops.gcp.secrets` | Implemented |
| `delete_secret` | `gamma_ops.gcp.secrets` | Implemented |

### GCP IAM

| Operation | Module | Status |
|---|---|---|
| `create_service_account` | `gamma_ops.gcp.iam` | Stub |
| `bind_role` | `gamma_ops.gcp.iam` | Stub |
| `audit_bindings` | `gamma_ops.gcp.iam` | Stub |
| `drift_check` | `gamma_ops.gcp.iam` | Stub |

### GCP Monitoring

| Operation | Module | Status |
|---|---|---|
| `create_dashboard` | `gamma_ops.gcp.monitoring` | Stub |
| `create_alert_policy` | `gamma_ops.gcp.monitoring` | Stub |
| `list_dashboards` | `gamma_ops.gcp.monitoring` | Stub |

### GCP Scheduler

| Operation | Module | Status |
|---|---|---|
| `create_job` | `gamma_ops.gcp.scheduler` | Stub |
| `pause_job` / `resume_job` / `list_jobs` | `gamma_ops.gcp.scheduler` | Stub |

### GCP Pub/Sub

| Operation | Module | Status |
|---|---|---|
| `create_topic` | `gamma_ops.gcp.pubsub` | Stub |
| `create_subscription` | `gamma_ops.gcp.pubsub` | Stub |
| `publish` | `gamma_ops.gcp.pubsub` | Stub |
| `delete_topic` | `gamma_ops.gcp.pubsub` | Stub |

### Cloudflare DNS, WAF, Access

| Operation | Module | Status |
|---|---|---|
| `dns.create_record` / `list_records` / `delete_record` | `gamma_ops.cloudflare.dns` | Stub |
| `waf.create_rule` / `list_rules` / `enable_managed_ruleset` | `gamma_ops.cloudflare.waf` | Stub |
| `access.create_policy` / `list_policies` / `delete_policy` | `gamma_ops.cloudflare.access` | Stub |

### Tenants

| Operation | Module | Status |
|---|---|---|
| `provision_tenant` | `gamma_ops.tenants.provision` | Stub |
| `delete_tenant` | `gamma_ops.tenants.delete` | Stub |
| `migrate_tenant` / `migrate_all_tenants` | `gamma_ops.tenants.migrate` | Stub |
| `detect_drift` / `detect_drift_all` | `gamma_ops.tenants.drift` | Stub |

### Database

| Operation | Module | Status |
|---|---|---|
| `create_backup` | `gamma_ops.db.backup` | Stub |
| `pitr_restore` | `gamma_ops.db.backup` | Stub |
| `fingerprint_schema` | `gamma_ops.db.fingerprint` | Stub |
| `compare` | `gamma_ops.db.fingerprint` | Stub |

### Testing

| Operation | Module | Status |
|---|---|---|
| `seed_canonical_tenant` | `gamma_ops.testing.seed` | Stub |
| `clear_tenant` | `gamma_ops.testing.seed` | Stub |
| `run_flawless_gate` | `gamma_ops.testing.flawless_gate` | Stub |

### Observability (planned)

| Operation | Target module | Status |
|---|---|---|
| `tail_tenant_logs` | `gamma_ops.observability.logs` | Planned |
| `recent_errors` | `gamma_ops.observability.logs` | Planned |
| `export_audit_logs` | `gamma_ops.observability.logs` | Planned |
| `query_ai_spend` | `gamma_ops.observability.ai_spend` | Planned |

## 6. Design principles

- **Idempotency first.** Every create function checks for existence and
  returns the existing resource on a match. Every delete function tolerates
  not-found as success. Every rotate function documents whether re-running
  adds a new version or is a no-op.
- **One vendor import per module.** Google SDKs are imported inside
  function bodies so the package imports cheaply and tests can patch at
  the module boundary.
- **Deterministic logging.** `structlog` JSON lines with event names like
  `create_bucket:start`, `create_bucket:success`, `create_bucket:failed`.
- **No hard-coded resource names.** Resource IDs come from config or
  arguments. The library is environment-aware via `OpsConfig.gamma_env`.
- **ADC only.** Never loads credentials from JSON files in the repo.
- **Typed exceptions.** `gamma_ops.errors.OpsError` and its subclasses are
  the only exceptions callers have to handle.
- **No silent failures.** A create that fails raises; a delete that finds
  nothing raises `ResourceNotFound`; a precondition mismatch raises
  `PreconditionFailed`. Callers decide how to react.

## 7. How to add a new operation

1. Pick the module. If none fits, create a new one next to its peers.
2. Write the function. Type hints on every parameter and return. Full
   docstring with Purpose, Parameters, Returns / Raises, Idempotency notes,
   Example.
3. Write a unit test under `tests/`, patching the SDK at the gamma_ops
   module boundary.
4. Add a row to the catalog in section 5 of this README.
5. Run `make lint && make test`.
6. Open a PR. The reviewer checks idempotency, docstring quality, and that
   no SDK exception escapes `gamma_ops.errors`.

## 8. Design discipline (seven rules)

Every function added to this library follows seven rules. The rules are
enforced by code review and by the test suite; deviations block merge.

### Rule 1: Deterministic and idempotent

Every operation must be safe to run twice. `create_bucket("foo")` the second
time returns the existing bucket, not an error. `create_project("gamma-prod")`
the second time detects the existing project and returns it. `enable_apis(...)`
the second time is a no-op for already-enabled APIs.

Idempotency is the difference between an ops library you can trust and a
collection of scripts that eventually breaks production. Every function's
docstring must document its idempotency guarantee in an explicit "Idempotency"
section.

Reference: see `gamma_ops/gcp/storage.py::create_bucket` for the canonical
pattern (try-except on `AlreadyExists`, assert that the existing resource
matches the requested config, return it if so, raise if not).

### Rule 2: Fully type-hinted

Every parameter and every return value has a type hint. No `Any` unless the
SDK genuinely returns an opaque type. No untyped kwargs. `mypy --strict`
should pass on any implemented module.

Type hints are not decoration. They are how skills and agents discover what a
function expects without reading its implementation. A skill that reads
`def create_bucket(name: str, location: str, storage_class: str = "STANDARD", cmek_key: str | None = None) -> Bucket:`
knows exactly what inputs to generate.

### Rule 3: Full docstring in the standard shape

Every function has a docstring with these five sections, in this order:

```python
def create_bucket(name: str, ...) -> Bucket:
    """Create a GCS bucket with optional CMEK and retention lock.

    Purpose:
        One-paragraph explanation of why this function exists and when to use it.

    Parameters:
        name: Globally unique bucket name (letters, digits, hyphens, periods).
        location: GCP region slug (e.g. "europe-west9").
        ...

    Returns:
        The Bucket object. If a bucket with the same name already exists and
        matches the requested configuration, returns the existing bucket.

    Raises:
        ResourceAlreadyExists: The bucket exists but with a different config.
        GCPError: The GCP API call failed for a non-recoverable reason.
        ConfigError: A required config value (project_id, etc.) is missing.

    Idempotency:
        Safe to call twice. If the bucket already exists with the requested
        location and storage_class, returns it. If it exists with different
        settings, raises ResourceAlreadyExists with the drift details.

    Example:
        >>> from gamma_ops.gcp.storage import create_bucket
        >>> bucket = create_bucket(
        ...     name="gamma-prod-uploads-001",
        ...     location="europe-west9",
        ...     cmek_key="projects/.../cryptoKeys/gamma-platform-key",
        ... )
    """
```

Every stub module raises `NotImplementedError` but still has this full
docstring. The docstring is the contract; the implementation comes later.

### Rule 4: One unit test per function, mocked vendor client

Every implemented function has at least one unit test in `tests/`. The test
mocks the vendor SDK client (so tests run offline, in CI, without credentials)
and asserts:

1. The happy path returns the expected object
2. The idempotency path (resource already exists) returns the existing resource
3. At least one error path maps the vendor error to the correct `OpsError` subclass

Reference: `tests/test_gcp_storage.py` is the canonical pattern. A new
function is not IMPLEMENTED in the operation catalog until its test file
exists and passes.

### Rule 5: Map vendor errors to typed exceptions

Raw `google.api_core.exceptions.NotFound` or `httpx.HTTPStatusError` never
escape the library. Every SDK call is wrapped in a try-except that maps:

- `AlreadyExists` to `ResourceAlreadyExists` (often caught by the caller for idempotency)
- `NotFound` to `ResourceNotFound`
- `PermissionDenied` to `AuthenticationError`
- anything else to `GCPError` / `CloudflareError` / `OpsError` with the original exception chained via `raise ... from err`

The error hierarchy lives in `gamma_ops/errors.py`. See that file for the
canonical list.

Callers (skills, runbooks, other library functions) handle only the typed
exceptions. This is what makes the library composable.

### Rule 6: Structured logging, no print statements

Every function logs via `structlog.get_logger(__name__)` with structured fields:

```python
log = get_logger(__name__)

def create_bucket(name: str, ...) -> Bucket:
    log.info("creating bucket", bucket_name=name, location=location)
    try:
        bucket = client.create_bucket(...)
    except AlreadyExists:
        log.info("bucket already exists, returning existing", bucket_name=name)
        return client.get_bucket(name)
    except Exception as err:
        log.error("bucket creation failed", bucket_name=name, error=str(err))
        raise GCPError(f"failed to create bucket {name}") from err
    log.info("bucket created", bucket_name=name, location=location)
    return bucket
```

Structured logging means ops runs produce machine-readable JSON lines that
you can grep, filter, and aggregate. Print statements are not grep-friendly
and disappear in Cloud Run.

### Rule 7: No hardcoded resource names, regions, or account IDs

Project IDs, region slugs, bucket names, keyring names, billing account IDs
all come from the `OpsConfig` object (which reads from env). The library
works against any GCP project by changing config; it does not bake
Gamma-specific strings into code.

This is what makes the library reusable for a second project. When you build
app #2, you fork this library and change the env values, not the code.

One exception: Gamma-specific modules under `gamma_ops/tenants/` may encode
schema-per-tenant assumptions. Those are explicitly project-specific and are
the minority of the library. Most modules (`gcp/*`, `cloudflare/*`, `db/*`)
are generic cloud provisioning.

## 9. How skills and agents use this library

From inside a Claude Code skill or subagent prompt:

1. Import the function. Do not shell out to `gcloud`.
2. Call it with typed arguments.
3. Handle only `gamma_ops.errors.OpsError` and its subclasses.
4. Log the result (the function already logs; callers may add their own).

A well-formed skill looks like:

```python
from gamma_ops.gcp.storage import create_bucket
from gamma_ops.errors import OpsError, PreconditionFailed

try:
    result = create_bucket("gamma-prod-files", cmek_key="projects/...")
except PreconditionFailed as exc:
    # Existing bucket has wrong region or CMEK. Escalate to the founder.
    raise
except OpsError as exc:
    # Any other vendor failure.
    raise
```

A badly-formed skill re-implements the google-cloud-storage client call
inline. That code is forbidden by the Gamma modularity rules (M1 in
`docs/MODULARITY.md`).

## 10. When to extract this library to its own repo

This library is designed to be extractable to a standalone repository with
its own git history, its own PyPI release cycle, and its own CI pipeline. It
is NOT extracted yet. This section documents the decision and the trigger
conditions.

### Why not now

During the Gamma build phase (Phase 2 through Phase 7 of
`EXECUTION_CHECKLIST.md`), the library is in active co-evolution with the
app. Both founders commit to both sides constantly. Splitting the repo now
means:

- Every cross-boundary change is coordinated across two repos
- Git history is harder to search across app + ops changes
- Dependabot and CI pipelines duplicate
- A single PR that touches both the app and the ops library requires two PRs and a dance

At 60-70 productive hours per week combined, the 2-founder team cannot
afford this overhead. Monorepo wins during the build phase.

### Why the boundary is still clean

Even in the monorepo, the library is structurally isolated:

- Separate `pyproject.toml` (own dependencies, own version)
- Separate virtual environment (`infra/ops/.venv/`)
- Separate test suite (`infra/ops/tests/`)
- No imports from `backend/app/` (enforced by the M1 modularity rule in `docs/MODULARITY.md`)
- No imports into `backend/app/` (the app reads secrets at runtime via Secret Manager, not by importing `gamma_ops`)
- Lazy vendor SDK imports (installing the library does not pull the full SDK graph until a function is actually called)

This means extracting the library later is a `git subtree split` operation,
not a rewrite.

### Trigger conditions for extraction

Extract to a standalone repo when ANY of these fires:

1. **Post-Gamma launch stability.** 90 consecutive days post-launch with no library-level API changes. The library has stabilized; splitting it now locks in the stability.
2. **Second app commit.** The founders commit to building a second product that will use the same ops library. Extraction lets both products consume a versioned release.
3. **Open source decision.** The founders decide to open-source the library (likely the GCP + Cloudflare wrappers, not the Gamma-specific tenant/testing modules).
4. **Security isolation requirement.** A security review mandates that code with GCP admin credentials lives in a separate repo with stricter access controls than the app repo.
5. **First external contributor.** A hire or open-source contributor works only on the library and does not need access to the app code.

Extraction is tracked in `docs/DEFERRED_DECISIONS.md` as a DEF entry. The
trigger conditions above are the official ones; revisit them at each
monthly DEF review.

### How to extract (when the trigger fires)

One-day operation:

1. Pick the new repo name. Candidates: `gamma-ops` (keeps the name), `cloud-ops-lib` (generic), `global-gamma-ops` (legal entity aligned).
2. `git subtree split --prefix=infra/ops -b ops-standalone` in the Gamma repo to isolate the library's git history.
3. Create the new repo on GitHub, push the `ops-standalone` branch as `main`.
4. Set up CI: lint (ruff + mypy), test (pytest), publish (GitHub Release tag drives a PyPI upload or stays as a GitHub-only dependency).
5. In the Gamma repo, remove `infra/ops/` and add a dependency on the extracted library: `gamma-ops @ git+https://github.com/YourOrg/gamma-ops.git@v0.1.0` or similar.
6. Update every import in the Gamma repo that referenced `gamma_ops` (if the package name changes).
7. Verify the test suite still passes.
8. Close the extraction DEF entry with a link to the new repo.

The operation is mechanical. The decision is strategic. Do not extract
because extraction feels satisfying; extract because a trigger fires.

### Reusability posture

The library is designed to be ~70% reusable across future projects:

- `gamma_ops/gcp/*` (projects, storage, kms, secrets, cloudsql, cloudrun, iam, monitoring, scheduler, pubsub) is generic GCP provisioning. Fork and rename the package; it works for any project.
- `gamma_ops/cloudflare/*` is generic Cloudflare provisioning. Same story.
- `gamma_ops/db/*` (backup, fingerprint) is generic Postgres operations. Same.
- `gamma_ops/tenants/*` is schema-per-tenant specific. Reusable for any app that uses the schema-per-tenant pattern, not reusable for pooled tenancy.
- `gamma_ops/testing/*` has Gamma-specific seed data. Not reusable as-is; the pattern is reusable.

When you start project #2, you fork this library, delete the Gamma-specific
modules (tenants, testing), rename the package prefix, and you have a ~1-day
head start on your ops layer.

## 11. Cross-references

- `docs/decisions/ADR-001-tenancy.md` - tenancy model that drives
  `gamma_ops.tenants.*`.
- `docs/decisions/ADR-005-storage.md` - GCS buckets, CMEK, retention,
  legal hold. Implemented in `gamma_ops.gcp.storage`.
- `docs/decisions/ADR-008-deployment.md` - GCP, Cloudflare, region lock,
  Org Policy enforcement. Drives every module.
- `docs/ROLLBACK_RUNBOOK.md` - disaster recovery procedures that call
  into `gamma_ops.gcp.cloudsql.pitr_restore` and `gamma_ops.db.backup`.
- `EXECUTION_CHECKLIST.md` - every task in Phase 2 section 3 that the
  library automates.
- `CLAUDE.md` - agent contract and hard style rules (no em dashes, no
  forbidden vocabulary, no invented API endpoints, only 3 subagents at once).
