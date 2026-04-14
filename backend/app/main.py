from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.features.auth.routes import router as auth_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield


app = FastAPI(
    title="GammaHR API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["meta"])
async def health() -> dict[str, str]:
    return {"status": "ok", "env": settings.app_env}


app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
