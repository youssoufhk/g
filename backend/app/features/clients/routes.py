from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.tenant_ctx import get_tenant_id
from app.features.clients import service
from app.features.clients.schemas import ClientOut, ClientsListResponse

router = APIRouter()


@router.get("", response_model=ClientsListResponse)
async def list_clients(
    session: Annotated[AsyncSession, Depends(get_session)],
    tenant_id: Annotated[int, Depends(get_tenant_id)],
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> ClientsListResponse:
    items, total = await service.list_clients(
        session, tenant_id=tenant_id, limit=limit, offset=offset
    )
    return ClientsListResponse(
        items=[_to_out(c) for c in items],
        total=total,
    )


def _to_out(c) -> ClientOut:  # type: ignore[no-untyped-def]
    return ClientOut(
        id=c.id,
        name=c.name,
        country_code=c.country_code,
        currency=c.currency,
        primary_contact_name=c.primary_contact_name,
        primary_contact_email=c.primary_contact_email,
        size_band=c.size_band,
        status=c.status,
        created_at=c.created_at,
    )
