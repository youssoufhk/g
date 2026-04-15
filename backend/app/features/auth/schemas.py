from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.core.tenancy import is_valid_tenant_schema


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=256)
    display_name: str = Field(min_length=1, max_length=200)
    tenant_schema: str
    locale: str = "en-GB"

    @field_validator("tenant_schema")
    @classmethod
    def _shape(cls, value: str) -> str:
        if not is_valid_tenant_schema(value):
            raise ValueError("tenant_schema must match t_[a-z0-9_]{1,48}")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=256)
    tenant_schema: str | None = None

    @field_validator("tenant_schema")
    @classmethod
    def _shape(cls, value: str | None) -> str | None:
        if value is None:
            return value
        if not is_valid_tenant_schema(value):
            raise ValueError("tenant_schema must match t_[a-z0-9_]{1,48}")
        return value


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in_seconds: int


class UserOut(BaseModel):
    id: int
    email: str
    display_name: str
    locale: str
    status: str
    created_at: datetime
    last_login_at: datetime | None


class MembershipOut(BaseModel):
    tenant_id: int
    tenant_schema: str
    tenant_display_name: str
    role: str


class MeResponse(BaseModel):
    user: UserOut
    memberships: list[MembershipOut]
    active_tenant_schema: str | None
