from typing import Annotated

from fastapi import APIRouter, Form, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

from app.ai.client import get_client
from app.features.imports import service
from app.features.imports.schemas import EntityType, PreviewResponse

router = APIRouter()

MAX_CSV_BYTES = 10 * 1024 * 1024  # 10 MiB


@router.post("/preview", response_model=PreviewResponse)
async def preview(
    entity_type: Annotated[EntityType, Form()],
    file: UploadFile,
) -> PreviewResponse:
    raw_bytes = await file.read()
    if len(raw_bytes) > MAX_CSV_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"csv exceeds {MAX_CSV_BYTES} bytes",
        )
    if not raw_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="empty csv upload",
        )

    ai_client = get_client()
    return await service.preview_csv(
        raw_bytes=raw_bytes,
        entity_type=entity_type,
        ai_client=ai_client,
    )


@router.post("/commit")
async def commit() -> JSONResponse:
    """Persist a previously-previewed CSV to the target tenant tables.

    Deferred to Phase 4. Phase 3a only parses + validates + previews; the
    actual insert into employees / clients / projects / teams tables
    happens once those feature modules ship.
    """
    return JSONResponse(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        content={"code": "not_implemented", "message": "commit lands in Phase 4"},
    )
