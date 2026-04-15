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
    timesheets,
)
from app.features.admin.routes import router as admin_router
from app.features.auth.routes import router as auth_router
from app.features.imports.routes import router as imports_router

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
