# Gamma root Makefile
#
# Convenience wrappers around the local dev stack and common repo tasks.
# Reference:
#   docs/runbooks/dev-machine-bootstrap.md section 4.6
#   EXECUTION_CHECKLIST.md section 3.1

SHELL := /bin/bash
COMPOSE := docker compose -f infra/docker/docker-compose.dev.yml
BACKEND_VENV := backend/.venv

.PHONY: help \
        dev-up dev-down dev-reset dev-logs dev-ps dev-psql \
        backend-install backend-test backend-lint backend-run \
        backend-migrate backend-seed-admin \
        frontend-install frontend-dev frontend-test frontend-e2e \
        setup mvp-up mvp-down \
        test lint

help:
	@echo "Gamma dev targets:"
	@echo ""
	@echo "  local dev stack:"
	@echo "    make dev-up             Start Postgres, Redis, Mailhog (healthcheck wait)"
	@echo "    make dev-down           Stop, preserve volumes"
	@echo "    make dev-reset          Stop + destroy volumes + restart"
	@echo "    make dev-logs           Tail logs"
	@echo "    make dev-ps             Show running services"
	@echo "    make dev-psql           psql shell inside postgres container"
	@echo ""
	@echo "  backend:"
	@echo "    make backend-install    Create .venv and install dev deps"
	@echo "    make backend-migrate    Run Alembic upgrade head against local Postgres"
	@echo "    make backend-seed-admin Insert a dev admin user (run after first migrate)"
	@echo "    make backend-test       Run pytest"
	@echo "    make backend-lint       Run ruff check"
	@echo "    make backend-run        Run FastAPI dev server (uvicorn + reload)"
	@echo ""
	@echo "  frontend:"
	@echo "    make frontend-install   Install npm dependencies (first time ~5 min)"
	@echo "    make frontend-dev       Run Next.js dev server"
	@echo "    make frontend-test      Run vitest unit tests"
	@echo "    make frontend-e2e       Run Playwright E2E tests"
	@echo ""
	@echo "  one-shot:"
	@echo "    make setup              backend-install + frontend-install"
	@echo "    make mvp-up             dev-up + setup + backend-migrate + seed admin"
	@echo "    make mvp-down           dev-down (volumes preserved)"
	@echo "    make test               Run every test suite"
	@echo "    make lint               Run every lint check"

# ----- local dev stack --------------------------------------------------------
dev-up:
	$(COMPOSE) up -d --wait
	@echo ""
	@echo "Dev stack ready:"
	@echo "  Postgres:  postgresql://gamma:gamma_dev_password@localhost:5432/gamma_dev"
	@echo "  Redis:     redis://localhost:6379"
	@echo "  Mailhog:   smtp://localhost:1025  ui http://localhost:8025"

dev-down:
	$(COMPOSE) down

dev-reset:
	$(COMPOSE) down --volumes --remove-orphans
	$(COMPOSE) up -d --wait

dev-logs:
	$(COMPOSE) logs -f

dev-ps:
	$(COMPOSE) ps

dev-psql:
	$(COMPOSE) exec postgres psql -U gamma -d gamma_dev

# ----- backend ----------------------------------------------------------------
backend-install:
	@if [[ ! -d $(BACKEND_VENV) ]]; then cd backend && python3 -m venv .venv; fi
	$(BACKEND_VENV)/bin/pip install --upgrade pip --quiet
	cd backend && ../$(BACKEND_VENV)/bin/pip install -e ".[dev]" --quiet
	@echo "backend .venv ready."

backend-migrate:
	cd backend && ../$(BACKEND_VENV)/bin/alembic upgrade head

backend-seed-admin:
	@cd backend && ../$(BACKEND_VENV)/bin/python -c "\
	from app.core.database import session_scope; \
	from sqlalchemy import text; \
	import asyncio; \
	async def run(): \
	    async with session_scope() as s: \
	        await s.execute(text(\"INSERT INTO public.tenants (schema_name, display_name, residency_region, legal_jurisdiction, base_currency, primary_locale, supported_locales, status) VALUES ('t_dev', 'Dev Tenant', 'eu-west9', 'FR', 'EUR', 'en-GB', ARRAY['en-GB','fr-FR'], 'active') ON CONFLICT (schema_name) DO NOTHING\")); \
	        print('dev tenant ensured'); \
	asyncio.run(run())"

backend-test:
	$(BACKEND_VENV)/bin/pytest backend -q

backend-lint:
	$(BACKEND_VENV)/bin/ruff check backend/app backend/tests backend/migrations

backend-run:
	cd backend && ../$(BACKEND_VENV)/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# ----- frontend ---------------------------------------------------------------
frontend-install:
	cd frontend && npm install

frontend-dev:
	cd frontend && npm run dev

frontend-test:
	cd frontend && npm test -- --run

frontend-e2e:
	cd frontend && npx playwright test

# ----- one-shot ---------------------------------------------------------------
setup: backend-install frontend-install
	@echo ""
	@echo "Setup complete. Next: make mvp-up"

mvp-up: dev-up backend-install backend-migrate backend-seed-admin
	@echo ""
	@echo "MVP stack live. Now in separate terminals run:"
	@echo "  make backend-run      # FastAPI at http://localhost:8000"
	@echo "  make frontend-dev     # Next.js at http://localhost:3000"
	@echo ""
	@echo "Then browse http://localhost:3000/en"

mvp-down: dev-down

# ----- aggregate --------------------------------------------------------------
test: backend-test
	@echo "(frontend test suite skipped; run 'make frontend-test' after 'make frontend-install')"

lint: backend-lint
	@pre-commit run --all-files
