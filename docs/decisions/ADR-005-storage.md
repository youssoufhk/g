# ADR-005: File storage

**Status:** Accepted

## Decision

S3-compatible object storage. MinIO in dev, Cloudflare R2 or AWS S3 in prod.

| Element | Detail |
|---------|--------|
| Bucket | One per environment |
| Key | `{tenant_id}/{entity}/{uuid}` |
| Encryption | AES-256 server-side, enforced by bucket policy |
| Access | Pre-signed URLs, 15 min expiry |
| Download | `Content-Disposition` with sanitized filename |
| Virus scan | ClamAV in a Celery worker before object marked `ready` |
| Lifecycle | CSV imports deleted after 30 days; other objects retained until explicit delete |

## Rejected

- **Database BLOBs:** bloats Postgres, hurts backup speed.
- **Local disk:** breaks horizontal scaling.

## Consequences

- Backend never streams files through itself except the OCR read path.
- Pre-signed URL generation is a hot path; must be fast.
- MinIO in docker-compose for dev parity.
- Prod bucket has versioning + daily metadata snapshots.
