# ADR-008: Deployment

**Status:** Accepted (rewritten 2026-04-15 to the GCP + Cloudflare + GitHub hosting anchor, superseding the original Fly.io + Vercel + Neon plan)

## Decision

**Google Cloud Platform (GCP) in `europe-west9` (Paris) + Cloudflare in front + GitHub for repo and CI.**

All services run inside one of two GCP projects (`gammahr-staging`, `gammahr-prod`) for blast-radius isolation. One wildcard cert (`*.gammahr.com`) covers three audience subdomains (`ops`, `app`, `portal`).

### Service mapping

| Service | Host | Phase 2-5 | Upgrade path |
|---|---|---|---|
| Frontend (Next.js 15) | Cloud Run | Container served from same Cloud Run service as backend, Next.js handles route-group routing per hostname | Unchanged |
| Backend API (FastAPI) | Cloud Run | Autoscale to zero, pay per request | Unchanged |
| Celery workers | Compute Engine VM (small always-on) | Cloud Run request-duration model does not fit long-running workers | Stay on VM; consider Cloud Run Jobs if worker scaling patterns get complex (DEF-020) |
| Database (Postgres 16) | Cloud SQL PostgreSQL Regional HA | Schema-per-tenant, direct connection from Cloud Run via Cloud SQL Auth Proxy | Add PgBouncer on Compute Engine VM at Year 2-3 when connection count is a problem (DEF-013) |
| Redis 7 | Compute Engine `e2-micro` VM (~€7/mo) | Used as Celery broker + cache + session store | Memorystore Redis when HA failover matters or memory exceeds 500 MB (DEF-019) |
| Object storage | Google Cloud Storage | Bucket `gammahr-<env>-files` in `europe-west9`, object versioning on, retention policy lock on legal-hold bucket | Unchanged |
| Secrets | Google Secret Manager | All runtime secrets (DB creds, Vertex AI SA key, WebAuthn keys, Workspace SMTP Relay creds) | Unchanged; GitHub Actions Environment secrets for CI-time credentials |
| Logs | Cloud Logging | Structured JSON via `structlog`, log-based metrics for alerts | Unchanged |
| Metrics | Cloud Monitoring | Dashboards, alerts on error rate, latency, AI cost | Unchanged |
| Tracing | None (request_id correlation via structlog) | Cloud Trace deferred (DEF-015) | OpenTelemetry export to Cloud Trace when a slowness bug demands it |
| Error grouping | None (raw structured logs) | Sentry-style dashboard deferred (DEF-014) | Cloud Function that fingerprints stack traces, when debugging pain appears |
| DNS / WAF / CDN / Access | Cloudflare | Free tier, proxying all three subdomains, EU-only routing enforced for auth'd `app.*` paths via `Cache-Control: private, no-store` | Unchanged |
| Transactional email | Google Workspace SMTP Relay | `smtp-relay.gmail.com` via service user `mailer@gammahr.com`, Business Starter tier (~$6/user/mo) | Dedicated provider (SES, Postmark, Resend) when daily volume exceeds 80% of quota (DEF-021) |
| Repo + CI | GitHub + GitHub Actions | Auto-deploy `main` branch to staging, manual promotion to prod | Unchanged |
| AI inference | Vertex AI Gemini 2.5 Flash | `europe-west9`, same GCP project, zero-retention | Swap to another vendor via `ai/client.py` single-file change (DEF-046) |

### Environments

| Env | GCP project | Purpose |
|---|---|---|
| `local` | None (docker-compose on founder laptop) | Postgres + Redis + MinIO containers |
| `staging` | `gammahr-staging` | Cloud Run + Cloud SQL db-f1-micro + small Redis VM. Behind Cloudflare Access so only founder IP can reach it. Auto-deploys from `main` branch via GitHub Actions. |
| `prod` | `gammahr-prod` | Larger instances. Manual promotion from staging after smoke tests. Two-project split is blast-radius isolation. |

### Data residency

**EU only, hard-enforced.** GCP Organization Policy `constraints/gcp.resourceLocations` blocks resource creation outside `europe-west9` at the API level. `europe-west1` (Belgium) allowed as backup-only target. Quarterly Cloud Function generates a signed residency audit PDF to a dedicated GCS bucket as a customer-facing artifact.

### Cost targets (goals, not measured)

| Stage | Target monthly cost |
|---|---|
| Phase 2-3 (0-5 tenants) | ~€80-150 all-in |
| Year 3 (20-50 tenants) | ~€500-800 |
| Year 5 (100-300 tenants) | ~€1800-3800 |

These estimates exclude Google Workspace ($6/user/month, already budgeted separately) and professional services (legal, DPA review).

## Rationale

- **Cloud Run is structurally better than ECS Fargate or Fly.io machines for FastAPI:** scales to zero, pay per request, zero always-on minimum. Compared to Fly.io specifically, Cloud Run has stronger IAM integration with the rest of GCP and a longer track record at scale.
- **GCP pricing is 15-40% cheaper than AWS at the Phase 2-3 stage** (single-tenant on Cloud Run vs ECS Fargate minimum instance cost). Matters for a bootstrapped solo founder.
- **Cloudflare is the boring correct choice** for DNS, WAF, CDN, DDoS absorption, and Access. Free tier covers Phase 2-3. Cert management is handled automatically.
- **GitHub + GitHub Actions** is already in every developer's mental model. Zero onboarding cost.
- **EU residency is hard-enforced via Org Policy**, not soft-enforced via deployment discipline. A misconfigured resource literally cannot be created outside the allowed regions.
- **Workspace SMTP Relay** is free inside a Workspace subscription the founder needs anyway for professional email. Zero new vendor.
- **Vertex AI Gemini in the same GCP project** means zero cross-region data movement, same DPA as the rest of the stack, Anthropic removed from the sub-processor list.

## Alternatives considered and rejected

- **AWS (ECS Fargate + RDS + S3 + SES):** equally viable but materially more expensive at Phase 2-3, IAM is more complex, and the founder has existing GCP familiarity. Would be the right choice if scale hits the 300+ tenants range faster than expected (DEF-046 is the single-file AI vendor swap; a full cloud migration to AWS is the theoretical right-to-re-evaluate but not planned).
- **Cloudflare end-to-end (Workers + D1 + R2):** Workers is TypeScript-shaped, does not fit the locked Python + FastAPI backend stack.
- **Fly.io + Vercel + Neon (the original ADR-008 choice):** multi-vendor stack with overlapping concerns. Fly.io is fine but vendor-by-vendor smaller than GCP, Vercel is great but splits the deploy pipeline, Neon is a Postgres vendor, not a full stack. GCP consolidates all of it.
- **Kubernetes (GKE or self-hosted):** operational overhead not worth it for solo founder.
- **Serverless Lambda-style per-function deployment:** WebSockets awkward, cold starts hurt the UX feel, and the ai/client.py central abstraction is harder to maintain across functions.

## Consequences

- **One cloud provider dependency.** GCP outage or billing issue would affect the entire stack. Mitigation: Cloud SQL PITR backups are exported weekly to a separate GCS bucket, object versioning protects against accidental deletion, the Cloud SQL logical dump pattern means a full cluster export is straightforward if migration is ever needed.
- **Connection pooling is schema-aware.** PgBouncer is not a managed product on GCP. Tracked as DEF-013 for Year 2-3. Until then, Cloud Run instances talk directly to Cloud SQL over the Auth Proxy.
- **Cold starts on Cloud Run** affect the first request of an idle period by ~2-4 seconds. Acceptable for a B2B tool where users log in and stay active. Mitigation: minimum instances = 1 in prod during business hours.
- **Deployment is one command per environment:** `gcloud run deploy` from GitHub Actions. No infrastructure code until the team grows (no Terraform in Phase 2).
- **Stack is portable.** Core services (Postgres, Redis, Python, Next.js, GCS-compatible S3) are all industry-standard. Migration to AWS or Hetzner + Cloudflare is real work (2-4 weeks) but not an architectural rewrite.

## Follow-ups (required in Phase 2)

1. Two GCP projects created with correct billing accounts and Org Policy enforcement
2. Cloud SQL PostgreSQL 16 Regional HA instance provisioned in each project
3. Cloud Run service created with deploy pipeline from GitHub Actions
4. Cloud Storage buckets created (`gammahr-<env>-files`, `gammahr-legal-archive`)
5. Cloudflare zone configured with DNS records for `ops`, `app`, `portal`, `mail` subdomains and wildcard cert
6. Google Workspace Business Starter subscription on `gammahr.com` with SMTP Relay enabled
7. Vertex AI Gemini API enabled in each project with zero-retention settings
8. Cloud Monitoring dashboards for the internal SLO targets (99.5% availability, API p95 < 500ms on reads, invoice generation p95 < 3s, OCR p95 < 15s)
9. Secret Manager entries for all runtime credentials
10. GitHub Actions workflows for staging auto-deploy and prod manual promotion

## Related decisions

- **ADR-001** (schema-per-tenant) - the database shape the deployment is sized for
- **ADR-005** (file storage) - now GCS, not R2/S3
- **ADR-010** (three-app model) - the three subdomains this deployment serves
- `specs/DATA_ARCHITECTURE.md` section 11 - full hosting table
- `docs/DEFERRED_DECISIONS.md` DEF-013, DEF-019, DEF-020, DEF-021, DEF-046
