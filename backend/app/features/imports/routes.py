import json
from typing import Annotated

from fastapi import APIRouter, Depends, Form, HTTPException, Request, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.audit import audited
from app.core.database import get_session
from app.core.rbac import gated_feature
from app.core.tenancy import get_current_tenant
from app.features.admin import service as admin_service
from app.features.imports import service
from app.features.imports.schemas import (
    ColumnMapping,
    CommitResponse,
    EntityType,
    PreviewResponse,
)

router = APIRouter()

MAX_CSV_BYTES = 10 * 1024 * 1024  # 10 MiB


@router.post("/preview", response_model=PreviewResponse)
@gated_feature("imports")
@audited("import.preview", "imports")
async def preview(
    request: Request,
    entity_type: Annotated[EntityType, Form()],
    file: UploadFile,
    session: Annotated[AsyncSession, Depends(get_session)],
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

    from app.ai.client import get_client
    ai_client = get_client()
    return await service.preview_csv(
        raw_bytes=raw_bytes,
        entity_type=entity_type,
        ai_client=ai_client,
    )


@router.post("/commit", response_model=CommitResponse)
@gated_feature("imports")
@audited("import.commit", "imports")
async def commit(
    request: Request,
    entity_type: Annotated[EntityType, Form()],
    file: UploadFile,
    confirmed_mapping: Annotated[str, Form()],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> CommitResponse:
    """Persist a CSV to the target tenant tables using the confirmed mapping.

    ``confirmed_mapping`` is a JSON array of ColumnMapping objects matching
    the shape returned by /preview, after the user has optionally edited the
    target_field selections.
    """
    tenant_schema = get_current_tenant()
    if not tenant_schema:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="tenant context required",
        )

    tenant_record = await admin_service.get_tenant_by_schema(session, tenant_schema)
    if tenant_record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"tenant not found: {tenant_schema}",
        )

    try:
        mapping_dicts = json.loads(confirmed_mapping)
        mapping = [ColumnMapping.model_validate(m) for m in mapping_dicts]
    except (json.JSONDecodeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"invalid confirmed_mapping: {exc}",
        ) from exc

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

    return await service.commit_csv(
        session=session,
        tenant_id=tenant_record.id,
        raw_bytes=raw_bytes,
        entity_type=entity_type,
        confirmed_mapping=mapping,
    )
