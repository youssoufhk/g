from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.tenant_ctx import get_tenant_id
from app.features.invoices import service
from app.features.invoices.models import Invoice
from app.features.invoices.schemas import InvoiceOut, InvoicesListResponse

router = APIRouter()


@router.get("", response_model=InvoicesListResponse)
async def list_invoices(
    session: Annotated[AsyncSession, Depends(get_session)],
    tenant_id: Annotated[int, Depends(get_tenant_id)],
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> InvoicesListResponse:
    items, total = await service.list_invoices(
        session, tenant_id=tenant_id, limit=limit, offset=offset
    )
    return InvoicesListResponse(
        items=[_to_out(i) for i in items],
        total=total,
    )


def _to_out(i: Invoice) -> InvoiceOut:
    return InvoiceOut(
        id=i.id,
        client_id=i.client_id,
        number=i.number,
        issue_date=i.issue_date,
        due_date=i.due_date,
        status=i.status,
        currency=i.currency,
        subtotal_cents=i.subtotal_cents,
        tax_total_cents=i.tax_total_cents,
        total_cents=i.total_cents,
        sent_at=i.sent_at,
        paid_at=i.paid_at,
        pdf_status=i.pdf_status,
        created_at=i.created_at,
    )
