from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.tenant_ctx import get_tenant_id
from app.features.approvals import service
from app.features.approvals.schemas import ApprovalOut, ApprovalsListResponse
from app.features.employees import service as employees_service

router = APIRouter()


@router.get("/pending", response_model=ApprovalsListResponse)
async def list_pending(
    session: Annotated[AsyncSession, Depends(get_session)],
    tenant_id: Annotated[int, Depends(get_tenant_id)],
    limit: int = Query(default=200, ge=1, le=500),
) -> ApprovalsListResponse:
    pending = await service.list_pending(session, tenant_id=tenant_id, limit=limit)
    emp_names = await employees_service.get_names_by_ids(
        session, tenant_id=tenant_id, ids=[a.requester_id for a in pending]
    )
    return ApprovalsListResponse(
        items=[
            ApprovalOut(
                id=a.id,
                type=a.type,
                requester_id=a.requester_id,
                requester_name=emp_names.get(a.requester_id),
                subject=a.subject,
                submitted_at=a.submitted_at,
                period=a.period,
                amount_cents=a.amount_cents,
                currency=a.currency,
            )
            for a in pending
        ],
        total=len(pending),
    )
