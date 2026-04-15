# Gamma root Makefile
#
# Convenience wrappers around the local dev stack and common repo tasks.
# Reference:
#   docs/runbooks/dev-machine-bootstrap.md section 4.6
#   EXECUTION_CHECKLIST.md section 3.1

SHELL := /bin/bash
COMPOSE := docker compose -f infra/docker/docker-compose.dev.yml

.PHONY: help dev-up dev-down dev-reset dev-logs dev-ps dev-psql

help:
	@echo "Gamma dev targets:"
	@echo "  make dev-up      Start the local dev stack (Postgres, Redis, Mailhog)"
	@echo "  make dev-down    Stop the local dev stack (volumes preserved)"
	@echo "  make dev-reset   Stop and destroy volumes, then start fresh"
	@echo "  make dev-logs    Tail logs from the dev stack"
	@echo "  make dev-ps      Show running dev services"
	@echo "  make dev-psql    Open a psql shell against gamma_dev"

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
