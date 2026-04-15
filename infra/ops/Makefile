# Gamma ops library - common targets
#
# Usage:
#   make install     # create venv and install the package in editable mode
#   make test        # run the unit test suite
#   make lint        # run ruff + mypy
#   make help        # show this message

PY ?= python3.12
UV ?= uv

.PHONY: help install install-pip test lint fmt clean \
        gcp-bootstrap gcp-bootstrap-staging test-tenant dr-drill

help:
	@echo "Gamma ops library targets:"
	@echo "  install                - create venv and install (uv)"
	@echo "  install-pip            - same, using pip instead of uv"
	@echo "  test                   - run pytest"
	@echo "  lint                   - ruff + mypy"
	@echo "  fmt                    - ruff format"
	@echo "  clean                  - remove caches"
	@echo "  gcp-bootstrap          - bootstrap prod GCP project"
	@echo "  gcp-bootstrap-staging  - bootstrap staging GCP project"
	@echo "  test-tenant            - provision a throwaway tenant"
	@echo "  dr-drill               - run the disaster-recovery drill"

install:
	$(UV) venv
	$(UV) pip install -e ".[dev]"

install-pip:
	$(PY) -m venv .venv
	.venv/bin/pip install --upgrade pip
	.venv/bin/pip install -e ".[dev]"

test:
	pytest tests/ -v

lint:
	ruff check gamma_ops/ tests/
	mypy gamma_ops/

fmt:
	ruff format gamma_ops/ tests/
	ruff check --fix gamma_ops/ tests/

clean:
	rm -rf .pytest_cache .mypy_cache .ruff_cache dist build *.egg-info
	find . -type d -name __pycache__ -prune -exec rm -rf {} +

gcp-bootstrap:
	gamma-ops gcp bootstrap --env prod

gcp-bootstrap-staging:
	gamma-ops gcp bootstrap --env staging

test-tenant:
	gamma-ops tenants provision --test

dr-drill:
	gamma-ops tenants drill
