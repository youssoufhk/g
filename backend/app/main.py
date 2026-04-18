"""Gamma backend app entrypoint.

This file does three things:
    1. Configure logging
    2. Build the FastAPI instance with middleware
    3. Mount every feature router under /api/v1/*

Feature modules import themselves as side effects so they can register
with the feature flag registry (M6). Cross-feature coupling happens
through the event bus (M5) or service layer calls (M3), never through
direct imports of another feature's models.
"""

from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.errors import GammaError
from app.ai import registry as ai_registry
from app.core.idempotency import IdempotencyMiddleware
from app.core.logging import configure_logging, get_logger
from app.core.tenancy import TenancyMiddleware

# Feature imports (side-effect: every module registers with feature_registry).
# New feature modules must be added to this list so operators see them in
# the feature flag console on startup (M6).
from app.features import (  # noqa: F401
    approvals,
    clients,
    dashboard,
    employees,
    expenses,
    imports,
    invoices,
    leaves,
    projects,
    search,
    timesheets,
)
from app.features.admin.routes import router as admin_router
from app.features.auth.routes import router as auth_router

# Model import side effects so Base.metadata sees every Phase 4 table.
from app.features.clients import models as _clients_models  # noqa: F401
from app.features.clients.routes import router as clients_router
from app.features.dashboard.routes import router as dashboard_router
from app.features.employees import models as _employees_models  # noqa: F401
from app.features.employees.routes import router as employees_router
from app.features.expenses import models as _expenses_models  # noqa: F401
from app.features.expenses.routes import router as expenses_router
from app.features.imports.routes import router as imports_router
from app.features.invoices import models as _invoices_models  # noqa: F401
from app.features.invoices.routes import router as invoices_router
from app.features.projects import models as _projects_models  # noqa: F401
from app.features.projects.routes import router as projects_router
from app.features.search.routes import router as search_router

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    configure_logging()
    logger.info("gamma.startup", env=settings.app_env, name=settings.app_name)
    yield
    logger.info("gamma.shutdown")


app = FastAPI(
    title="Gamma API",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(TenancyMiddleware)
app.add_middleware(IdempotencyMiddleware)

# Populate the AI tool registry at import time so the LLM-as-router
# prompt sees the full catalog. Tool modules register themselves on
# import; this one call guarantees they are imported before any
# request hits the command palette.
ai_registry.ensure_loaded()


@app.exception_handler(GammaError)
async def gamma_error_handler(_: Request, exc: GammaError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.http_status,
        content={"code": exc.code, "message": exc.message},
    )


@app.get("/health", tags=["meta"])
async def health() -> dict[str, Any]:
    return {"status": "ok", "env": settings.app_env, "name": settings.app_name}


app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(admin_router, prefix="/api/v1/ops", tags=["ops"])
app.include_router(imports_router, prefix="/api/v1/imports", tags=["imports"])
app.include_router(employees_router, prefix="/api/v1/employees", tags=["employees"])
app.include_router(clients_router, prefix="/api/v1/clients", tags=["clients"])
app.include_router(projects_router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(invoices_router, prefix="/api/v1/invoices", tags=["invoices"])
app.include_router(expenses_router, prefix="/api/v1/expenses", tags=["expenses"])
app.include_router(dashboard_router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(search_router, prefix="/api/v1/search", tags=["search"])
