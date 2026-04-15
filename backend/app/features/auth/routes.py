from fastapi import APIRouter, status

from app.features.auth.schemas import LoginRequest, LoginResponse, MeResponse

router = APIRouter()


@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
)
async def login(body: LoginRequest) -> LoginResponse:
    """Password login. Real implementation ships in Phase 3."""
    raise NotImplementedError("auth.login implemented in Phase 3")


@router.get(
    "/me",
    response_model=MeResponse,
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
)
async def me() -> MeResponse:
    raise NotImplementedError("auth.me implemented in Phase 3")
