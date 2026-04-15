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
        frontend-install frontend-dev frontend-test frontend-e2e \
        test lint

help:
	@echo "Gamma dev targets:"
	@echo "  make dev-up             Start local stack (Postgres, Redis, Mailhog)"
	@echo "  make dev-down           Stop local stack (volumes preserved)"
	@echo "  make dev-reset          Stop + destroy volumes + restart"
	@echo "  make dev-logs           Tail local stack logs"
	@echo "  make dev-ps             Show running local services"
	@echo "  make dev-psql           psql shell inside the postgres container"
	@echo "  make backend-install    Create backend .venv and install dev deps"
	@echo "  make backend-test       Run backend pytest suite"
	@echo "  make backend-lint       Run ruff check on backend"
	@echo "  make backend-run        Run the FastAPI dev server (uvicorn)"
	@echo "  make frontend-install   Install frontend npm dependencies"
	@echo "  make frontend-dev       Run the Next.js dev server"
	@echo "  make frontend-test      Run vitest unit tests"
	@echo "  make frontend-e2e       Run playwright E2E tests"
	@echo "  make test               Run every test suite"
	@echo "  make lint               Run every lint check"

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
	cd backend && python3 -m venv .venv
	$(BACKEND_VENV)/bin/pip install --upgrade pip
	$(BACKEND_VENV)/bin/pip install -e "backend[dev]"

backend-test:
	$(BACKEND_VENV)/bin/pytest backend -q

backend-lint:
	$(BACKEND_VENV)/bin/ruff check backend/app backend/tests

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

# ----- aggregate --------------------------------------------------------------
test: backend-test
	@echo "(frontend test suite skipped; run 'make frontend-test' after 'make frontend-install')"

lint: backend-lint
	@pre-commit run --all-files
