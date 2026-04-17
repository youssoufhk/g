# Gamma root Makefile
#
# Dev architecture: backend + frontend run as compose services so they reach
# Postgres and Redis via Docker DNS (postgres:5432 / redis:6379). This works
# under WSL2 where host<->container port publishing can be unreliable.
#
# Two execution paths:
#   1. Docker path (default, what the founder uses): make mvp-up.
#   2. Local venv path (agent + CI without Docker): make backend-test-local.
#
# Reference: docs/runbooks/dev-machine-bootstrap.md section 4.6
#            EXECUTION_CHECKLIST.md section 3.1

SHELL := /bin/bash
COMPOSE := docker compose -f infra/docker/docker-compose.dev.yml
BACKEND_EXEC := $(COMPOSE) exec -T backend
FRONTEND_EXEC := $(COMPOSE) exec -T frontend
BACKEND_VENV := backend/.venv

.PHONY: help \
        dev-up dev-down dev-reset dev-logs dev-ps dev-psql \
        dev-logs-backend dev-logs-frontend \
        dev-shell-backend dev-shell-frontend \
        dev-migrate dev-seed-demo dev-test-backend dev-test-frontend \
        backend-install-local backend-test-local backend-lint-local \
        backend-seed-demo-local \
        mvp-up mvp-down mvp-reset \
        test lint

help:
	@echo "Gamma dev targets:"
	@echo ""
	@echo "  one-shot (start here):"
	@echo "    make mvp-up             Build + start full stack + run Alembic"
	@echo "    make mvp-down           Stop stack (volumes preserved)"
	@echo "    make mvp-reset          Stop + destroy volumes + mvp-up"
	@echo ""
	@echo "  stack control:"
	@echo "    make dev-up             Build + start Postgres + Redis + Mailhog + backend + frontend"
	@echo "    make dev-down           Stop, preserve volumes"
	@echo "    make dev-reset          Stop + destroy volumes + restart"
	@echo "    make dev-ps             Show running services"
	@echo ""
	@echo "  logs + shells:"
	@echo "    make dev-logs           Tail all service logs"
	@echo "    make dev-logs-backend   Tail backend logs"
	@echo "    make dev-logs-frontend  Tail frontend logs"
	@echo "    make dev-psql           psql shell inside postgres container"
	@echo "    make dev-shell-backend  bash shell inside backend container"
	@echo "    make dev-shell-frontend sh shell inside frontend container"
	@echo ""
	@echo "  one-off backend ops (run inside backend container):"
	@echo "    make dev-migrate        Run alembic upgrade head"
	@echo "    make dev-seed-demo      Regenerate backend/fixtures/demo/*.csv (201 employees, 120 clients, 260 projects)"
	@echo "    make dev-test-backend   Run pytest"
	@echo "    make dev-test-frontend  Run vitest"
	@echo ""
	@echo "  aggregate:"
	@echo "    make test               Run every test suite (docker if up else local)"
	@echo "    make lint               Run every lint check"
	@echo ""
	@echo "  local venv path (no Docker, for agent + CI):"
	@echo "    make backend-install-local  Create backend/.venv and install dev deps"
	@echo "    make backend-test-local     Run pytest against backend/.venv"
	@echo "    make backend-lint-local     Run ruff against backend/.venv"

# ----- stack control ---------------------------------------------------------
dev-up:
	$(COMPOSE) up -d --build --wait
	@echo ""
	@echo "Dev stack ready:"
	@echo "  Backend:   http://localhost:8000  (/health, /docs)"
	@echo "  Frontend:  http://localhost:3000/en"
	@echo "  Postgres:  postgresql://gamma:gamma_dev_password@localhost:5432/gamma_dev"
	@echo "  Redis:     redis://localhost:6379"
	@echo "  Mailhog:   smtp://localhost:1025  ui http://localhost:8025"

dev-down:
	$(COMPOSE) down

dev-reset:
	$(COMPOSE) down --volumes --remove-orphans
	$(COMPOSE) up -d --build --wait

dev-logs:
	$(COMPOSE) logs -f

dev-logs-backend:
	$(COMPOSE) logs -f backend

dev-logs-frontend:
	$(COMPOSE) logs -f frontend

dev-ps:
	$(COMPOSE) ps

# ----- shells ----------------------------------------------------------------
dev-psql:
	$(COMPOSE) exec postgres psql -U gamma -d gamma_dev

dev-shell-backend:
	$(COMPOSE) exec backend bash

dev-shell-frontend:
	$(COMPOSE) exec frontend sh

# ----- one-off backend ops (inside the backend container) -------------------
dev-migrate:
	$(BACKEND_EXEC) alembic upgrade head

dev-seed-demo:
	$(BACKEND_EXEC) python -m scripts.generate_demo_seed

dev-test-backend:
	$(BACKEND_EXEC) pytest -q

dev-test-frontend:
	$(FRONTEND_EXEC) npm test -- --run

# ----- local venv path (no Docker) -------------------------------------------
backend-install-local:
	@if [ ! -d $(BACKEND_VENV) ]; then cd backend && python3 -m venv .venv; fi
	$(BACKEND_VENV)/bin/pip install --upgrade pip --quiet
	cd backend && ../$(BACKEND_VENV)/bin/pip install -e ".[dev]" --quiet
	@echo "backend .venv ready (no Docker, no DB)."

backend-test-local:
	$(BACKEND_VENV)/bin/pytest backend -q

backend-lint-local:
	$(BACKEND_VENV)/bin/ruff check backend/app backend/tests backend/migrations

backend-seed-demo-local:
	cd backend && ../$(BACKEND_VENV)/bin/python -m scripts.generate_demo_seed

seed-demo-tenant:
	$(BACKEND_EXEC) python -m scripts.seed_demo_tenant --tenant t_dev

seed-demo-tenant-local:
	cd backend && ../$(BACKEND_VENV)/bin/python -m scripts.seed_demo_tenant --tenant t_dev

# ----- one-shot --------------------------------------------------------------
mvp-up: dev-up dev-migrate
	@echo ""
	@echo "MVP stack live:"
	@echo "  App:       http://localhost:3000/en"
	@echo "  Ops API:   http://localhost:8000/api/v1/ops/features"
	@echo "  Mailhog:   http://localhost:8025"
	@echo ""
	@echo "Seed admin user ships with Phase 3a (backend/app/features/auth)."

mvp-down: dev-down

mvp-reset:
	$(COMPOSE) down --volumes --remove-orphans
	$(MAKE) mvp-up

# ----- aggregate -------------------------------------------------------------
test:
	@if $(COMPOSE) ps backend 2>/dev/null | grep -q "Up"; then \
	  $(BACKEND_EXEC) pytest -q; \
	else \
	  $(BACKEND_VENV)/bin/pytest backend -q; \
	fi

lint:
	@if [ -d $(BACKEND_VENV) ]; then \
	  $(BACKEND_VENV)/bin/ruff check backend/app backend/tests backend/migrations; \
	fi
	@pre-commit run --all-files
