# Secrets Management

> **Who this is for.** Every person (and every agent) who touches Gamma infrastructure or runtime config.
> **When to read.** Before the first commit. Before adding any new credential. Before rotating. Before onboarding a new hire.
> **Scope.** Developer machine setup, CI credentials, runtime app secrets, disaster recovery, rotation, incident response.
> **Authoritative reference.** This runbook is the single source of truth for secrets. If anything in `infra/ops/`, `backend/app/`, or any ADR conflicts with this doc, this doc wins and the other gets fixed.
> **Cross-references.** ADR-002 (auth), ADR-005 (storage + CMEK), ADR-008 (deployment), `infra/ops/README.md`, `docs/ROLLBACK_RUNBOOK.md`, `.pre-commit-config.yaml`.

---

## 1. The seven rules (non-negotiable)

1. **Never commit anything sensitive.** `.env`, JSON key files, TLS private keys, JWT signing keys, passwords, API tokens, OAuth refresh tokens, personal data. The pre-commit hook in `.pre-commit-config.yaml` (gitleaks) catches accidental commits before they reach origin. Do not bypass it with `--no-verify`.
2. **Never use GCP service account JSON key files.** They are the number one source of GCP credential leaks on GitHub. Use Application Default Credentials (ADC) locally and Workload Identity Federation (WIF) in CI. The `gamma-ops` library refuses to load credentials from JSON files in the repo by design.
3. **Never paste a secret into a chat, email, ticket, or doc.** If a secret leaks into a communication channel, rotate immediately (see section 7). Screenshots count.
4. **Never hardcode a secret in source code.** If you see `password = "abc"` in a PR, block the merge. Read from GCP Secret Manager at startup or from `.env` in dev.
5. **Never reuse a secret across environments.** Staging and prod have independent secrets. Dev has its own. Rotating prod must never affect staging. One secret, one environment, one purpose.
6. **Never store recovery info in plain files.** Use a password manager with team sharing (1Password Business or Bitwarden Business). Offline kits go in a fireproof safe, not on a laptop.
7. **Rotate on a schedule, not only on incident.** Quarterly for human tokens (Cloudflare API, GitHub PAT, password manager master passwords), annually for machine tokens where not auto-rotated. KMS keys auto-rotate per ADR-005; Secret Manager secrets rotate manually per section 6.

---

## 2. Where each secret lives

This table is the map. Every secret Gamma uses must appear here. Add a row whenever you introduce a new one.

| Secret | Dev (local) | Staging | Production | Rotation cadence | Rotation procedure |
|---|---|---|---|---|---|
| GCP project access | ADC file `~/.config/gcloud/application_default_credentials.json` | Workload Identity Federation (CI) | Cloud Run default service account (WIF, no key file) | Quarterly or on role change | Re-run `gcloud auth application-default login` |
| DB password (app) | `.env` (local Postgres) | Secret Manager `gamma-staging-db-password` | Secret Manager `gamma-prod-db-password` | 90 days | `gamma-ops gcp secrets rotate` (section 6.1) |
| DB password (migrator role) | `.env` | Secret Manager `gamma-staging-migrator-password` | Secret Manager `gamma-prod-migrator-password` | 90 days | Same as app DB password |
| JWT signing key | `.env` (generated once, random) | Secret Manager `gamma-staging-jwt-signing-key` | Secret Manager `gamma-prod-jwt-signing-key` | 180 days | Rolling rotation (section 6.3) |
| Vertex AI access | ADC via Cloud Run service account | Same (WIF) | Same (WIF) | N/A (no API key) | N/A |
| Cloudflare API token | `.env` with scoped token | GitHub Actions secret `CLOUDFLARE_API_TOKEN_STAGING` | GitHub Actions secret `CLOUDFLARE_API_TOKEN_PROD` | Quarterly | Section 6.2 |
| Workspace SMTP Relay | IP allowlist only | IP allowlist only | IP allowlist only | N/A (no password) | Update IPs in Workspace admin |
| Stripe (DEF-029, future) | `.env` | Secret Manager `gamma-staging-stripe-test-key` | Secret Manager `gamma-prod-stripe-live-key` | Only on incident | Stripe dashboard rotate + `gamma-ops gcp secrets rotate` |
| Founder passkey recovery codes | N/A | N/A | Printed once, stored offline in fireproof safe AND in password manager | Regenerated after any recovery use | Operator console regenerate flow |
| Co-founder passkey recovery codes | N/A | N/A | Same as founder | Regenerated after any recovery use | Same |
| GitHub Personal Access Token | Password manager | N/A (use WIF for CI) | N/A (use WIF for CI) | Quarterly or on role change | GitHub UI + password manager update |
| 1Password / Bitwarden master password | In founders' heads + sealed offline recovery kit | N/A | N/A | Annual | Password manager vendor flow |
| GCP billing account owner credential | Google Workspace admin password + 2FA hardware key | N/A | N/A | On hardware key loss | Google Workspace recovery kit |

If a row is missing from this table, the secret does not exist yet. Add the row before adding the secret.

---

## 3. Local developer setup

Run this sequence on a new laptop. Target time: 20 minutes.

1. Install the gcloud CLI (`brew install --cask google-cloud-sdk` on macOS, or the Debian package on Linux).
2. Authenticate the human identity: `gcloud auth login`. Use your founder Google account.
3. Authenticate Application Default Credentials: `gcloud auth application-default login`. This stores ADC in `~/.config/gcloud/application_default_credentials.json`, which every Google SDK picks up automatically. You do not need any JSON key file, ever.
4. Clone the repo: `git clone git@github.com:Kerzika/gamma.git && cd gamma`.
5. Install pre-commit: `pipx install pre-commit && pre-commit install`. This writes `.git/hooks/pre-commit`, which runs the hooks defined in `.pre-commit-config.yaml` on every commit (gitleaks, trailing whitespace, em dash ban, "utilisation" ban).
6. Copy the example env file: `cp infra/ops/.env.example infra/ops/.env`. Fill in non-secret config (project ID, region `europe-west9`). Leave SecretStr fields blank; ADC handles GCP auth automatically.
7. Cloudflare dev access: create a scoped API token in the Cloudflare dashboard with `Zone:Read` and `Zone:Edit` on the Gamma zone only. Paste it into `infra/ops/.env` as `CLOUDFLARE_API_TOKEN`. The `infra/ops/.env` file is gitignored; verify with `git check-ignore infra/ops/.env`.
8. Verify the toolchain: `cd infra/ops && gamma-ops --help` must print the command tree with no credential errors. If it errors on ADC, re-run step 3.
9. Run the first commit on a junk branch to exercise the pre-commit hooks. Make a trivial edit, commit, and confirm gitleaks runs. If it does not, re-run `pre-commit install` at the repo root.

Any deviation from this sequence is a bug in the onboarding. Fix the runbook, not the local workaround.

---

## 4. CI/CD credentials (GitHub Actions to GCP)

**Use Workload Identity Federation. Do NOT use service account JSON in GitHub secrets.** This is the single most important rule in this section. JSON keys in GitHub secrets are recoverable by anyone with workflow edit rights and have no audit trail for the key value itself.

One-time setup per environment (run once for staging, once for prod):

1. Create a Workload Identity Pool:
   ```
   gcloud iam workload-identity-pools create github-pool \
     --location=global \
     --project=gamma-staging-001 \
     --display-name="GitHub Actions pool"
   ```
2. Create a Workload Identity Provider for GitHub:
   ```
   gcloud iam workload-identity-pools providers create-oidc github-provider \
     --location=global \
     --workload-identity-pool=github-pool \
     --issuer-uri=https://token.actions.githubusercontent.com \
     --attribute-mapping=google.subject=assertion.sub,attribute.repository=assertion.repository
   ```
3. Create a dedicated CI service account (never reuse a human-owned one):
   ```
   gcloud iam service-accounts create gamma-ci-deployer \
     --display-name="Gamma CI deployer" \
     --project=gamma-staging-001
   ```
4. Bind the CI service account to the provider, constrained to the Gamma repo:
   ```
   gcloud iam service-accounts add-iam-policy-binding \
     gamma-ci-deployer@gamma-staging-001.iam.gserviceaccount.com \
     --role=roles/iam.workloadIdentityUser \
     --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/attribute.repository/Kerzika/gamma"
   ```
5. Grant the CI service account the minimum deploy roles (`roles/run.admin`, `roles/cloudsql.client`, `roles/secretmanager.secretAccessor`, `roles/storage.admin` scoped to the deploy bucket only). No `Editor` and no `Owner`.
6. In the GitHub Action workflow, use `google-github-actions/auth@v2` with `workload_identity_provider` and `service_account` inputs. No JSON file, no static secret:
   ```yaml
   - uses: google-github-actions/auth@v2
     with:
       workload_identity_provider: projects/NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-provider
       service_account: gamma-ci-deployer@gamma-staging-001.iam.gserviceaccount.com
   ```
7. Store the provider resource path and service account email as GitHub Actions **variables** (not secrets). They are derivable from the project config and storing them as vars makes CI logs debuggable without leaking sensitive material.

For Cloudflare in CI: Cloudflare has no OIDC federation. Store the API token as a GitHub Actions secret (`CLOUDFLARE_API_TOKEN_STAGING` or `CLOUDFLARE_API_TOKEN_PROD`), scope it to the Gamma zone only, and rotate quarterly per section 6.2.

Verification: push a no-op workflow to a PR branch and confirm the deploy job prints `Authenticated as gamma-ci-deployer@...` with no JSON path visible.

---

## 5. Runtime secrets (app reads from Secret Manager)

At Cloud Run runtime, the app authenticates to Secret Manager via the default service account (Workload Identity, not a JSON key). The app reads a secret at startup and caches it in memory for the lifetime of the container:

```python
from gamma_ops.gcp.secrets import read_secret

db_password = read_secret("gamma-prod-db-password").decode("utf-8")
jwt_signing_key = read_secret("gamma-prod-jwt-signing-key")
```

Rules for runtime secret handling:

- **Read once at startup.** Do not read Secret Manager per request. It is rate-limited and adds ~30ms to every call.
- **Cache in memory, not on disk.** Never write a secret to `/tmp` or any volume. Memory evaporates on container termination; disk does not.
- **Do not log the value.** Log the secret name, the version, and the timestamp, never the bytes. `structlog` is configured with a redaction processor in `backend/app/core/logging.py`; keep it that way.
- **Never pass secrets via Cloud Run env vars set at deploy time.** The value leaks into deploy logs, `gcloud run services describe` output, and any error trace that includes env dumps. Use Secret Manager references instead:
  ```
  gcloud run services update gamma-app \
    --set-secrets=DB_PASSWORD=gamma-prod-db-password:latest,JWT_KEY=gamma-prod-jwt-signing-key:latest
  ```
  Cloud Run injects the value at container start via the metadata server; it never appears in the revision spec.
- **Handle rotation gracefully.** When a secret rotates to a new version, the app reads the new version on next container start. Cloud Run rotates containers on every deploy and on autoscaling events; a manual redeploy after rotation picks up the new value.

For local dev, `.env` is read via Pydantic Settings and holds the dev-only values directly. The `.env` file is gitignored and must never be copied to staging or prod.

---

## 6. Rotation procedures

### 6.1 Rotating a GCP Secret Manager secret

```
gamma-ops gcp secrets rotate gamma-prod-db-password --value-file new-password.txt
```

What this does under the hood:

1. Adds a new version of the secret with the new value.
2. Disables (not destroys) the previous version with a 7-day grace for rollback.
3. Logs `rotate_secret:success` with the new version ID.
4. A nightly sweep job (Cloud Scheduler, see ADR-008) destroys disabled versions older than 7 days.

After rotation:

1. Trigger a Cloud Run redeploy so running containers pick up the new value (`gamma-ops gcp cloudrun deploy-revision gamma-app`).
2. Verify the app is healthy: `gamma-ops gcp cloudrun health-check gamma-app`.
3. Delete the local `new-password.txt` file immediately: `shred -u new-password.txt` on Linux or `rm -P` on macOS.

### 6.2 Rotating the Cloudflare API token

Cloudflare does not support rolling rotation of a single token. You must create a new one and delete the old one in sequence:

1. In the Cloudflare dashboard, create a new API token with the same scope (`Zone:Read + Zone:Edit` on the Gamma zone only). Give it a name with the rotation date, e.g. `gamma-ci-2026-Q2`.
2. Update the GitHub Actions secret (`CLOUDFLARE_API_TOKEN_STAGING` or `_PROD`) with the new value.
3. Update developer `infra/ops/.env` files out-of-band via the password manager. Do not paste in chat.
4. Run a no-op CI job on a staging branch to confirm the new token works.
5. Delete the old token in the Cloudflare dashboard.
6. Run one more CI job on a prod branch to confirm nothing references the deleted token.

### 6.3 Rotating a JWT signing key

Rolling rotation: the app validates tokens with BOTH the old and the new key for 30 days, so active sessions stay valid across rotation.

1. Add the new key as a new Secret Manager version:
   ```
   gamma-ops gcp secrets rotate gamma-prod-jwt-signing-key --value-file new-jwt-key.bin
   ```
2. Update `backend/app/core/security.py` config to accept `JWT_KEY_CURRENT` and `JWT_KEY_PREVIOUS` as separate values; the auth middleware tries current first, previous second.
3. Redeploy the app. New tokens are signed with the new key. Old tokens continue to validate against the previous key.
4. Wait 30 days (token TTL is 14 days + 16 days buffer).
5. Remove `JWT_KEY_PREVIOUS` from config and redeploy. Old tokens now fail and clients re-authenticate.
6. Run `gamma-ops gcp secrets` to disable the old version.

Never hot-rotate a JWT key without the dual-key window. You will invalidate every active session.

---

## 7. Incident response

If a secret is suspected to have leaked (committed to git, pasted in Slack, visible in a screenshot, copied into a ticket, attached to an email):

1. **Immediate (within 5 minutes): rotate the secret via the procedure in section 6.** Do not wait to assess impact. Assume exploitation and act. The cost of an unnecessary rotation is one deploy; the cost of a delayed rotation is unbounded.
2. **Within 1 hour: audit recent access logs** for the affected resource. Cloud SQL audit logs for DB passwords, Secret Manager audit logs for Secret Manager values, Cloudflare audit logs for Cloudflare tokens, GitHub audit logs for GitHub PATs. Confirm the leak was not yet exploited. Document findings in the incident doc started in step 4.
3. **Within 1 day: retroactively scrub the leak from every channel.** Git history via `git filter-repo` (not BFG, which is deprecated), Slack message deletion plus DLP scan, email thread deletion, any docs site that republished the content. Git history scrubbing is painful but necessary for prod credentials because the old value is forever in clones.
4. **Within 1 week: write an incident post-mortem** in `docs/incidents/YYYY-MM-DD-secret-leak.md`. Sections: what happened, how it was detected, blast radius, recovery steps taken, preventive measures (did a tool fail, did a process fail, did a rule need to be written). The post-mortem is blameless but specific.
5. **Share with co-founder within 24 hours of detection** even if the leak was yours. Two pairs of eyes on impact assessment. No solo containment.

---

## 8. Disaster recovery (what to do when GCP locks out both founders)

Unlikely but possible scenarios: primary Google account compromised, GCP organization policy misconfigured, billing account suspended, hardware key lost, Google Workspace tenant revoked.

The offline recovery kit (per founder):

1. Printed copy of Google Workspace recovery codes for each admin.
2. Printed copy of GCP billing account recovery contact info (account number, billing support phone number, escalation email).
3. Printed copy of the password manager master password recovery kit (1Password Emergency Kit or Bitwarden equivalent).
4. Printed list of phone numbers: Google Workspace support, GCP enterprise support, the registered domain registrar, Cloudflare support.
5. A spare FIDO2 hardware key in a sealed tamper-evident envelope.
6. A printed copy of this runbook.

Kit storage: a fireproof safe at each founder's home. Not in a single location. If one house burns down, the other kit still works.

Kit maintenance:

- **Updated annually** (first Monday of January) and after any credential rotation that touches the recovery path.
- **Quarterly drill:** one founder "loses" access and the other walks through recovery using only the kit. Write the drill result to `docs/incidents/YYYY-QN-recovery-drill.md`. Target: full recovery in under 2 hours.
- **After any drill failure, update the kit or the procedure.** If the drill uncovered a gap, the gap is a bug, not a rehearsal remark.

---

## 9. Pre-commit hook: gitleaks

The repo uses `.pre-commit-config.yaml` with `gitleaks` as the primary secret scanner. On every commit the hook runs `gitleaks protect --staged` against the staged diff. If a secret is found, the commit is blocked with an explicit error pointing at the file and line.

Supplementary pre-commit hooks (all enforced in the same config):

- `trailing-whitespace` and `end-of-file-fixer` from `pre-commit/pre-commit-hooks`.
- `check-added-large-files` with a 500 KB cap (except the `prototype/` path, which holds the frozen HTML reference).
- `check-yaml`, `check-json`, `check-merge-conflict`.
- A custom local hook that bans em dashes (U+2014) and en dashes (U+2013) per CLAUDE.md rule 5.
- A custom local hook that bans the word "utilisation" per CLAUDE.md rule 6, with an explicit allowlist for the files that document the ban itself (this runbook, CLAUDE.md, SCOPE, FLAWLESS_GATE, AGENTS).

False positives in gitleaks are handled via `.gitleaks.toml` at the repo root with allowlist entries reviewed by the co-founder. Never add a blanket allowlist. Every entry names the exact file, the exact rule, and the reason.

Install the hook locally with:

```
pipx install pre-commit
cd <gamma repo>
pre-commit install
```

Verify with a deliberate test commit containing the string `AKIAIOSFODNN7EXAMPLE` on a throwaway branch. Gitleaks must block the commit. If it does not, the install is broken; re-run `pre-commit install`.

---

## 10. Cross-references

- `infra/ops/README.md` section 6 on design principles (idempotent, deterministic, typed, logged, ADC-only).
- `docs/decisions/ADR-002-auth.md` for passkey + JWT auth architecture that produces the signing key rotation requirement in section 6.3.
- `docs/decisions/ADR-005-storage.md` for CMEK key rotation cadence tied to the KMS keys referenced in section 2.
- `docs/decisions/ADR-008-deployment.md` for the deployment pipeline that reads Secret Manager at runtime per section 5.
- `docs/COMPLIANCE.md` section 6 for authentication and security log retention, which the incident response timelines in section 7 depend on.
- `docs/ROLLBACK_RUNBOOK.md` for incident procedures that complement section 7 in the case of a deploy-related secret leak.
- `CLAUDE.md` rules 5 and 6 for the em dash and "utilisation" bans enforced by the pre-commit hooks in section 9.
- `EXECUTION_CHECKLIST.md` Phase 0 and §3.1 for the install-pre-commit task and the Workload Identity Federation task that reference this runbook.
