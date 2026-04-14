# ADR-008: Deployment

**Status:** Accepted

## Decision

Vercel for frontend. Fly.io for backend, worker, and Redis. Managed PostgreSQL on Fly.io or Neon.

| Service | Host | Notes |
|---------|------|-------|
| Frontend (Next.js) | Vercel | Edge caching, best Next.js experience |
| Backend API (FastAPI) | Fly.io | 2-3 instances, LB, Paris region |
| Worker (Celery) | Fly.io | Auto-scaled on queue depth |
| Database (Postgres 16) | Fly.io managed or Neon | PITR enabled |
| Redis 7 | Fly.io managed | Persistence on |
| Object storage | Cloudflare R2 or AWS S3 | Encrypted at rest |
| Search (Meilisearch) | Fly.io container | Dedicated small box |
| Monitoring | Grafana Cloud free tier | OTel from Python SDK |
| Email | Resend | Transactional |
| Logs | Grafana Loki | Structured JSON |

### Environments

| Env | Purpose |
|-----|---------|
| `dev` | Local docker-compose |
| `preview` | Auto-deploy per PR |
| `staging` | Always-on, anonymized prod-like data |
| `prod` | Manual promotion from staging, gated |

Target total infra cost: < €300/mo at first customer, < €1000/mo at 10 customers.
Data residency: EU only in v1.0. Multi-region deferred.

## Rejected

- **Kubernetes:** ops overhead not worth it for solo founder.
- **AWS ECS/Fargate:** capable but slower iteration.
- **Serverless (Lambda):** WebSockets awkward, cold starts hurt UX.

## Consequences

- Deployment is one command per environment.
- Infra code minimal until team grows.
- Stack runs on any Docker-capable host if Fly.io terms change.
