# ADR-005: File storage

**Status:** Accepted (updated 2026-04-15 to Google Cloud Storage after the hosting anchor was locked to GCP)

## Decision

**Google Cloud Storage (GCS)** in `europe-west9` for all prod and staging. MinIO in docker-compose for local dev parity.

| Element | Detail |
|---|---|
| Bucket (prod) | `gammahr-prod-files` in `europe-west9` |
| Bucket (staging) | `gammahr-staging-files` in `europe-west9` |
| Legal-hold bucket | `gammahr-legal-archive` in `europe-west9`, Object Versioning + retention policy lock, no delete permission even for service accounts |
| Key format | `{tenant_id}/{entity_type}/{yyyy}/{mm}/{uuid}` |
| Encryption at rest | AES-256 server-side, enforced by bucket policy |
| Per-tenant CMEK | Cloud KMS customer-managed encryption key for Confidential-tier data (employee compensation, banking, Art. 9 sensitive data): separate key per tenant in the tenant keyring |
| Access | Signed URLs (V4 signatures) for uploads and downloads, 15-minute expiry |
| Upload limit | 20 MB expense receipts, 10 MB avatars, 50 MB CSV imports |
| Download | `Content-Disposition` with sanitized filename |
| Virus scan | ClamAV in a Celery worker, sets `public.files.status = 'ready'` before the file is linked to a parent entity |
| Dedup | Per-tenant SHA256 unique constraint on `public.files(tenant_id, sha256)`: two different tenants uploading the same file get two separate rows |
| Orphan cleanup | Nightly Celery job hard-deletes files older than 24 hours with no linked parent entity |
| Lifecycle | Retention policies are per-entity and per-customer-country, defined in `specs/DATA_ARCHITECTURE.md` §8.2 and centralized in `docs/COMPLIANCE.md` (Phase 2 deliverable). Defaults: expense receipts 10 years (French Code général des impôts, art. L.102 B LPF) for FR customers, 6 years (UK HMRC) for UK customers; CSV imports 30 days; avatars retained until user explicit delete. Per-country retention is enforced in the GDPR sweep Celery job by looking up `tenants.country_code`. Tenant-specific contractual overrides (e.g., 15-year retention requested by a financial-services customer) are stored in `public.custom_contracts` and win over defaults. |
| Backup | Weekly logical dump per tenant schema exported to a separate GCS bucket with 30-day retention |

## Rationale

- **Same cloud as the rest of the stack.** Using GCS keeps everything in one GCP project with one DPA, one IAM system, one audit log, one region lock. No cross-cloud data movement.
- **Cloud KMS integration is native.** Per-tenant CMEK keys for Confidential-tier encryption work seamlessly with GCS object encryption. No separate encryption layer in application code.
- **Signed URL performance is identical to S3.** GCS V4 signatures are the same pattern Cloudflare R2 and AWS S3 use.
- **MinIO in dev** keeps local-vs-prod parity. Application code uses the `google-cloud-storage` Python SDK in prod and a MinIO S3-compatible endpoint in dev via a thin abstraction.

## Rejected alternatives

- **Cloudflare R2** (the original ADR-005 choice): perfectly fine as an S3-compatible store and meaningfully cheaper on egress, but it sits outside the GCP DPA and adds a second sub-processor entry. Kept GCS for the one-vendor simplification.
- **AWS S3:** would require adding AWS as a sub-vendor. Not worth it when GCS is equivalent and already in the stack.
- **Database BLOBs:** bloats Postgres, hurts backup speed, no CMEK per-column.
- **Local disk:** breaks horizontal scaling, breaks Cloud Run's stateless container model.

## Consequences

- Backend never streams files through itself except the OCR read path (Gemini vision fetches from a signed URL).
- Signed URL generation is a hot path; must be fast (p95 < 100ms).
- MinIO in docker-compose for dev parity.
- Prod bucket has versioning + weekly metadata snapshots.
- Legal-hold archive bucket has retention policy lock and no service-account delete permission; break-glass access documented in the operator console runbook.
- **Legal-hold break-glass procedure.** The archive bucket has retention policy lock; no service account can delete objects. In the rare event of a justified legal-hold deletion (e.g., court order, GDPR erasure for a legal-hold file), the procedure is:
  1. Founder files a break-glass request via operator console (to be built Phase 2). Request requires a reason and attaches the legal document.
  2. Request triggers a 2-hour cool-off and a notification to a second-party approver (founder's designated backup: email alert + manual ack).
  3. After both approve, founder uses a personal GCP account with temporary IAM override to delete the object. The override is time-bound (15 minutes) and auto-revoked.
  4. All steps are logged to an append-only audit stream outside the tenant database.

  The full runbook lives in `docs/LEGAL_HOLD_RUNBOOK.md` (Phase 2 deliverable). CI cannot test this path; it is a manual drill performed quarterly.
- Per-tenant CMEK keys rotate annually on an automatic schedule.

## Related decisions

- **ADR-001** (schema-per-tenant) - file paths keyed by tenant_id
- **ADR-008** (deployment) - GCP-anchored stack
- `specs/DATA_ARCHITECTURE.md` section 8.1 (data classification: Confidential-tier data uses CMEK)
- `specs/DATA_ARCHITECTURE.md` section 8.2 (retention: per-entity file lifecycle rules with legal citations)
- `specs/DATA_ARCHITECTURE.md` section 2.5 (public.files table)
- `docs/DATA_INGESTION.md` section 2 (upload pipeline) and section 5 (OCR)
