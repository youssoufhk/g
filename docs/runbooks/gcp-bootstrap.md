# GCP Bootstrap

> **Who this is for.** The co-founder (or whoever has billing authorization on Global Gamma Ltd).
> **When to run.** Phase 2 week 1 for staging, then again for prod after staging is verified. Also run on a fresh laptop if the team adds a hire who needs independent access.
> **Time estimate.** 2-3 hours for the first run. ~1 hour for the second (prod) because you have muscle memory.
> **Authorization.** You need: (1) Google account with billing admin on Global Gamma Ltd's billing account, (2) gcloud CLI installed locally, (3) the `gamma-ops` library installed from `infra/ops/` (see its README), (4) a `.env` file with `GCP_BILLING_ACCOUNT_ID`, `GCP_PROJECT_ID`, `GCP_REGION=europe-west9`.
> **Reversibility.** Mostly reversible. Projects soft-delete with a 30-day grace. Billing links can be unlinked. KMS keys CANNOT be hard-deleted (they can be disabled). GCS buckets with retention policy lock CANNOT be deleted until retention expires (intentional for legal-hold). Plan accordingly.
> **Cross-references.** ADR-001 (schema-per-tenant), ADR-005 (storage), ADR-008 (deployment), `infra/ops/gamma_ops/gcp/`, `EXECUTION_CHECKLIST.md` §3.1.

---

## 1. Pre-flight checklist

Run through this before typing any command. If any box is unchecked, stop and fix it first.

- [ ] gcloud CLI installed (`gcloud version` prints a recent version)
- [ ] Logged in with `gcloud auth login` (your founder Google account, not a service account)
- [ ] Application Default Credentials set up with `gcloud auth application-default login`
- [ ] `gamma-ops` library installed and importable (see `infra/ops/README.md`); `gamma-ops --version` works
- [ ] `.env` file at repo root contains `GCP_BILLING_ACCOUNT_ID`, `GCP_PROJECT_ID`, `GCP_REGION=europe-west9`
- [ ] Billing admin role confirmed on the Global Gamma Ltd billing account (GCP console > Billing > Account management)
- [ ] Naming convention understood: prod projects start with `gamma-prod-`, staging with `gamma-staging-`. Use the first run's suffix `001`, bump to `002` only if you had to delete and restart
- [ ] You have an uninterrupted 2-3 hour block (Cloud SQL creation alone is ~10 minutes)
- [ ] Co-founder reachable for the billing-link step (second pair of eyes on financial operations)
- [ ] A fresh browser tab open at the GCP console so you can cross-check as you go

## 2. The procedure, step by step

All commands assume your shell has `.env` loaded (`set -a; source .env; set +a`). Each step prints structured log lines from `gamma-ops`; the "Expected output" section shows the key fields. If a step fails, follow the "Failure recovery" note for that step before moving on.

### Step 1. Create the GCP project

Intent: one project for the environment, two projects total (prod + staging) when both runs are done.

```bash
gamma-ops gcp projects create gamma-prod-001 \
  --display-name "Gamma Production"
```

Expected output: a structured log line with `event=project.created project_id=gamma-prod-001 project_number=<N>` and a final `status=ok`.

Failure recovery: if the error mentions `billing_account_required` or `permission_denied`, you are not billing admin. Re-run `gcloud auth application-default login` with the founder Google account that has billing admin and retry. If the error mentions `resource_exhausted` (quota on number of projects), open a quota increase ticket in the GCP console and wait.

### Step 2. Enable required APIs

Intent: every API the platform will ever touch, enabled in one batch so that later steps do not fail with `service_not_enabled`.

```bash
gamma-ops gcp projects enable-apis gamma-prod-001 \
  --apis sqladmin,run,storage,kms,secretmanager,aiplatform,pubsub,cloudscheduler,monitoring,logging,iamcredentials,vpcaccess,compute,artifactregistry
```

Expected output: one `event=api.enabled api=<name>` line per API, each taking 10 to 30 seconds. Final `status=ok count=14`.

Failure recovery: if one API fails with `billing_required`, wait for step 3 (link billing), then re-run this step. The command is idempotent: already-enabled APIs are no-ops.

### Step 3. Link the billing account

Intent: without this, no resources can be created (no DB, no buckets, nothing). This is the step to get a second pair of eyes on.

```bash
gamma-ops gcp projects link-billing gamma-prod-001 \
  --billing-account-id $GCP_BILLING_ACCOUNT_ID
```

Expected output: `event=billing.linked project_id=gamma-prod-001 billing_account=<masked>`.

Failure recovery: if the billing account ID is wrong, you get `billing_account_not_found`. Double-check the ID in the GCP console under Billing > Account management > "Your billing account ID is shown at the top". IDs look like `01ABCD-234EFG-567HIJ`.

### Step 4. Set the Org Policy region constraint

Intent: hard-enforce EU residency at the API level so that a stray `gcloud` command cannot accidentally create a resource in us-central1.

```bash
gamma-ops gcp org-policy set-allowed-regions gamma-prod-001 \
  --regions europe-west9,europe-west1
```

Expected output: `event=org_policy.updated constraint=gcp.resourceLocations allowed=europe-west9,europe-west1`.

Failure recovery: if you do not have the `orgpolicy.policyAdmin` role on the Global Gamma Ltd GCP organization, this will fail. The founder must grant the role, or you run this from the founder's account.

### Step 5. Create the KMS keyring for per-tenant CMEK

Intent: one keyring holds one CryptoKey per tenant plus the platform key for non-tenant-scoped encryption.

```bash
gamma-ops gcp kms create-keyring gamma-tenant-keys \
  --location europe-west9
```

Expected output: `event=kms.keyring.created keyring_uri=projects/gamma-prod-001/locations/europe-west9/keyRings/gamma-tenant-keys`.

Failure recovery: KMS keyrings cannot be deleted. If you misspell the name, you are stuck with it. Pick a new name (e.g., `gamma-tenant-keys-v2`) and update the rest of the runbook commands accordingly. Never use a keyring with a typo'd name in production.

### Step 6. Create the primary CryptoKey for non-tenant-scoped encryption

Intent: the platform key encrypts JWT signing material, OAuth client secrets, and anything not bound to a specific tenant.

```bash
gamma-ops gcp kms create-key gamma-platform-key \
  --keyring gamma-tenant-keys \
  --location europe-west9 \
  --rotation-days 365
```

Expected output: `event=kms.key.created key_uri=projects/gamma-prod-001/locations/europe-west9/keyRings/gamma-tenant-keys/cryptoKeys/gamma-platform-key rotation_period=365d`.

Failure recovery: same constraint as step 5 (no hard delete). Pick a new name if needed.

### Step 7. Create the GCS buckets with CMEK

Intent: four buckets with distinct retention and access rules, all CMEK-encrypted, all in europe-west9.

Bucket list:
- `gamma-prod-uploads-001`: tenant file uploads (receipts, CSVs, avatars). 30-day lifecycle for unlinked orphans (nightly Celery job handles this, lifecycle is a belt-and-braces).
- `gamma-prod-backups-001`: Cloud SQL export backups. 7-year retention (aligns with FR accounting 10-year retention for the underlying source data, 7 years for the backup artifacts).
- `gamma-prod-legal-hold-001`: legal-hold archive. Retention policy LOCK (permanent, cannot be deleted, cannot be shortened). This is the break-glass-only bucket per ADR-005.
- `gamma-prod-static-001`: landing page assets, public-read.

```bash
KEY=projects/gamma-prod-001/locations/europe-west9/keyRings/gamma-tenant-keys/cryptoKeys/gamma-platform-key

gamma-ops gcp storage create-bucket gamma-prod-uploads-001 \
  --region europe-west9 --cmek-key $KEY \
  --public-access-prevention enforced \
  --lifecycle-orphan-delete-days 30

gamma-ops gcp storage create-bucket gamma-prod-backups-001 \
  --region europe-west9 --cmek-key $KEY \
  --public-access-prevention enforced \
  --retention-days 2555

gamma-ops gcp storage create-bucket gamma-prod-legal-hold-001 \
  --region europe-west9 --cmek-key $KEY \
  --public-access-prevention enforced \
  --retention-days 3650 --retention-policy-lock

gamma-ops gcp storage create-bucket gamma-prod-static-001 \
  --region europe-west9 --cmek-key $KEY \
  --public-access-prevention inherited
```

Expected output: one `event=bucket.created` line per bucket with `cmek_key=<uri>` set.

Failure recovery: if a bucket name is taken globally, pick the next suffix (`002`, `003`, etc.) and update references in the rest of the runbook. If you applied the retention lock to the wrong bucket, STOP. The lock is irreversible. Accept the dead bucket, pick a different name, and move on. Document the dead bucket in the incident log so the next operator knows not to touch it.

### Step 8. Create the Cloud SQL Postgres 16 Regional HA instance

Intent: the one database cluster, Regional HA (primary + standby in different zones), private IP only.

This is currently a [STUB] in `gamma-ops`. Use gcloud directly:

```bash
gcloud sql instances create gamma-prod-db-001 \
  --database-version=POSTGRES_16 \
  --region=europe-west9 \
  --availability-type=REGIONAL \
  --tier=db-custom-2-8192 \
  --storage-type=SSD \
  --storage-size=50GB \
  --storage-auto-increase \
  --network=projects/gamma-prod-001/global/networks/default \
  --no-assign-ip \
  --backup-start-time=02:00 \
  --enable-point-in-time-recovery \
  --project=gamma-prod-001
```

Expected output: `Creating Cloud SQL instance...done.` after ~10 minutes. Instance becomes `RUNNABLE` in the console.

Failure recovery: if the private-IP network is not yet configured, the command fails with `network_not_found`. Create the VPC peering with `gcloud services vpc-peerings connect --service=servicenetworking.googleapis.com --ranges=google-managed-services-default --network=default --project=gamma-prod-001` first, then retry. Replace this raw gcloud call with `gamma-ops gcp cloudsql create-instance` once the stub ships.

### Step 9. Create the application database and user

Intent: one logical database for the whole platform (schema-per-tenant lives inside), one service-account-ish user for the app.

```bash
gcloud sql databases create gamma_app \
  --instance=gamma-prod-db-001 \
  --project=gamma-prod-001

openssl rand -base64 32 > /tmp/db-password.txt
gcloud sql users create gamma_app_user \
  --instance=gamma-prod-db-001 \
  --password="$(cat /tmp/db-password.txt)" \
  --project=gamma-prod-001
```

Expected output: `Created database [gamma_app]` and `Created user [gamma_app_user]`.

Failure recovery: if the password command fails, regenerate and retry. The password will be stored in Secret Manager in step 10; do NOT keep it on disk beyond this sequence.

### Step 10. Store the DB password in Secret Manager

```bash
gamma-ops gcp secrets create gamma-prod-db-password \
  --value-file /tmp/db-password.txt

shred -u /tmp/db-password.txt
```

Expected output: `event=secret.created secret_id=gamma-prod-db-password version=1`.

Failure recovery: if the secret already exists (re-running the runbook), use `gamma-ops gcp secrets add-version gamma-prod-db-password --value-file /tmp/db-password.txt` instead. Always shred the file after.

### Step 11. Store the JWT signing key in Secret Manager

```bash
openssl rand -hex 64 > /tmp/jwt-key.txt
gamma-ops gcp secrets create gamma-prod-jwt-signing-key \
  --value-file /tmp/jwt-key.txt
shred -u /tmp/jwt-key.txt
```

Expected output: `event=secret.created secret_id=gamma-prod-jwt-signing-key version=1`.

Failure recovery: same as step 10.

### Step 12. Store the Vertex AI service account key in Secret Manager

Intent: the backend uses the default service account to call Vertex AI, but we also store a fallback key for break-glass local testing.

```bash
gcloud iam service-accounts create gamma-ai-runtime \
  --display-name "Gamma AI runtime" \
  --project=gamma-prod-001

gcloud projects add-iam-policy-binding gamma-prod-001 \
  --member="serviceAccount:gamma-ai-runtime@gamma-prod-001.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

gcloud iam service-accounts keys create /tmp/vertex-key.json \
  --iam-account=gamma-ai-runtime@gamma-prod-001.iam.gserviceaccount.com

gamma-ops gcp secrets create gamma-prod-vertex-sa-key \
  --value-file /tmp/vertex-key.json
shred -u /tmp/vertex-key.json
```

Expected output: three success lines, then `event=secret.created secret_id=gamma-prod-vertex-sa-key version=1`.

Failure recovery: if the SA already exists, skip the create and re-run the binding plus the key create. Shred the file.

### Step 13. Create placeholder Cloud Run services

Intent: reserve the service names (`gamma-ops`, `gamma-app`, `gamma-portal`, `gamma-worker`) so the DNS step in the Cloudflare runbook can point at real URLs. The real images ship in Phase 2 week 2 once the FastAPI skeleton is containerized.

```bash
for svc in gamma-ops gamma-app gamma-portal gamma-worker; do
  gcloud run deploy $svc \
    --image=gcr.io/cloudrun/placeholder \
    --region=europe-west9 \
    --project=gamma-prod-001 \
    --min-instances=0 \
    --max-instances=10 \
    --no-allow-unauthenticated
done
```

Expected output: four `Service [<name>] revision [...] has been deployed` lines, each returning a `*.run.app` URL. Save these URLs for the Cloudflare runbook.

Failure recovery: if a service name is already taken in the project, `gcloud run services describe <svc>` confirms and you can skip it. If the placeholder image fails to pull, retry (transient). Replace the raw gcloud loop with `gamma-ops gcp cloudrun bootstrap-services` when the stub ships.

### Step 14. Create the VPC connector for Cloud Run to Cloud SQL private IP

Intent: Cloud Run is serverless but still needs a VPC connector to reach the Cloud SQL private IP.

This is a [STUB] in the ops library. gcloud fallback:

```bash
gcloud compute networks vpc-access connectors create gamma-vpc-connector \
  --region=europe-west9 \
  --network=default \
  --range=10.8.0.0/28 \
  --min-instances=2 \
  --max-instances=3 \
  --project=gamma-prod-001
```

Expected output: `Creating VPC Access connector...done.` after ~2 minutes.

Failure recovery: if the range `10.8.0.0/28` overlaps an existing subnet, pick `10.9.0.0/28` or `10.10.0.0/28` and retry.

### Step 15. Skip Cloud Monitoring dashboards and Logging sinks

Skip for now. Come back in Phase 2 week 2 when metrics are flowing from real application code. Log a note in your Phase 2 journal so this does not get forgotten.

### Step 16. Final resource inventory

Confirm everything is in place before closing the session.

```bash
gamma-ops gcp projects list-resources gamma-prod-001
```

If that helper is not yet implemented, run the verification section below by hand.

## 3. Verification

Walk through each item. Every box must be checked before moving to the Cloudflare runbook.

- [ ] `gcloud projects describe gamma-prod-001` returns the project with lifecycleState `ACTIVE`
- [ ] `gcloud billing projects describe gamma-prod-001` shows billing enabled true
- [ ] `gcloud storage buckets list --project=gamma-prod-001` shows exactly the 4 buckets created in step 7
- [ ] For each bucket, `gcloud storage buckets describe gs://<name>` shows `encryption.defaultKmsKeyName` pointing at the platform key
- [ ] `gcloud storage buckets describe gs://gamma-prod-legal-hold-001` shows `retentionPolicy.isLocked: true`
- [ ] `gcloud kms keys list --keyring=gamma-tenant-keys --location=europe-west9 --project=gamma-prod-001` shows `gamma-platform-key` with `rotationPeriod: 31536000s`
- [ ] `gcloud sql instances describe gamma-prod-db-001 --project=gamma-prod-001` shows `availabilityType: REGIONAL` and `settings.backupConfiguration.pointInTimeRecoveryEnabled: true`
- [ ] `gcloud secrets list --project=gamma-prod-001` shows `gamma-prod-db-password`, `gamma-prod-jwt-signing-key`, `gamma-prod-vertex-sa-key`
- [ ] `gcloud run services list --region=europe-west9 --project=gamma-prod-001` shows the 4 placeholder services, each with a `*.run.app` URL
- [ ] `gcloud compute networks vpc-access connectors describe gamma-vpc-connector --region=europe-west9 --project=gamma-prod-001` shows `state: READY`
- [ ] No temporary files left in `/tmp` (check with `ls /tmp/*.txt /tmp/*.json 2>/dev/null`, expect nothing)
- [ ] Billing dashboard in GCP console does not show unexpected charges for the last hour

## 4. Rollback / recovery if something goes wrong

- **Project created but billing failed.** Unlink is via `gcloud billing projects unlink gamma-prod-001`. The project stays but nothing can be created. Soft-delete with `gcloud projects delete gamma-prod-001` if you want to start over; 30-day grace.
- **Bucket created in the wrong region.** Delete immediately with `gamma-ops gcp storage delete-bucket <name>` (or `gcloud storage buckets delete gs://<name>`). Bucket names are globally unique so deleting frees the name instantly.
- **KMS keys created in the wrong keyring or with the wrong name.** Keys and keyrings cannot be hard-deleted, only disabled. Accept the dead resource and pick a new name. Document in the incident log so no one references the dead key.
- **Retention policy lock applied to the wrong bucket.** Not recoverable. The bucket is locked for the retention period (10 years for legal-hold). Accept it, document, move on. This is why the runbook says "name it right the first time".
- **DB password leaked (e.g., committed to git).** Hard reset the commit (`git reset --hard HEAD~1` before push), rotate the secret via `gamma-ops gcp secrets add-version gamma-prod-db-password --value-file <new>`, update the Cloud SQL user password via `gcloud sql users set-password`, audit git history, alert the founder.
- **Cloud SQL instance created in the wrong tier or region.** Delete with `gcloud sql instances delete gamma-prod-db-001`. ~5 minutes, then recreate. No rollback needed if no data was written yet.
- **VPC connector stuck in CREATING.** Wait up to 5 minutes, then delete and retry with a different IP range.
- **You accidentally ran against the wrong project.** Check `gcloud config get-value project` before every destructive command. If you ran `create` against the wrong project, the created resource is in the wrong place; delete it and re-run against the right project. Always set `--project=<explicit>` on gcloud commands in this runbook (the ops library handles this via `.env`).

## 5. Follow-ups

This runbook does NOT do the following. After it completes, continue with:

- **Cloudflare bootstrap.** Run `docs/runbooks/cloudflare-bootstrap.md` next. You need the four `*.run.app` URLs from step 13 as input.
- **Backend image deploy.** Phase 2 week 2, once the FastAPI skeleton is containerized and the CI pipeline is wired. The placeholder services from step 13 get replaced by real revisions.
- **Cloud Monitoring dashboards and alerts.** Phase 2 week 2, when metrics start flowing.
- **Cloud Logging sinks.** Phase 2 week 2. At a minimum: a sink to BigQuery for long-term audit-log archiving, a sink to Pub/Sub for the migration-failed alert chain described in `docs/ROLLBACK_RUNBOOK.md` section 1.
- **First DR drill.** See `EXECUTION_CHECKLIST.md` §3.9 for the quarterly drill schedule (also copied into `docs/ROLLBACK_RUNBOOK.md` section 8).
- **Staging run.** Repeat this entire runbook with `gamma-staging-001` as the project name before Phase 2 week 2. Staging is a prerequisite for the CI auto-deploy pipeline.
- **Legal-hold break-glass runbook.** `docs/LEGAL_HOLD_RUNBOOK.md` (Phase 2 deliverable, separate scope).
