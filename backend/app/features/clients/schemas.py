from datetime import datetime

from pydantic import BaseModel


class ClientOut(BaseModel):
    id: int
    name: str
    country_code: str
    currency: str
    primary_contact_name: str | None
    primary_contact_email: str | None
    size_band: str
    status: str
    created_at: datetime


class ClientsListResponse(BaseModel):
    items: list[ClientOut]
    total: int
