from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.core.tenancy import is_valid_tenant_schema


class TenantOut(BaseModel):
    id: int
    schema_name: str
    display_name: str
    residency_region: str
    legal_jurisdiction: str
    base_currency: str
    primary_locale: str
    supported_locales: list[str]
    status: str
    created_at: datetime


class CreateTenantRequest(BaseModel):
    schema_name: str = Field(min_length=3, max_length=50)
    display_name: str = Field(min_length=1, max_length=200)
    legal_jurisdiction: str = Field(min_length=2, max_length=2)
    base_currency: str = Field(min_length=3, max_length=3)
    primary_locale: str = "en-GB"
    residency_region: str = "eu-west9"

    @field_validator("schema_name")
    @classmethod
    def schema_name_shape(cls, value: str) -> str:
        if not is_valid_tenant_schema(value):
            raise ValueError(
                "schema_name must match pattern t_[a-z0-9_]{1,48}"
            )
        return value

    @field_validator("legal_jurisdiction")
    @classmethod
    def jurisdiction_upper(cls, value: str) -> str:
        return value.upper()

    @field_validator("base_currency")
    @classmethod
    def currency_upper(cls, value: str) -> str:
        return value.upper()


class FeatureFlagOut(BaseModel):
    key: str
    description: str
    default_enabled: bool
    kill_switch: bool
    tenant_overrides: dict[str, bool]


class SetFeatureOverrideRequest(BaseModel):
    tenant_schema: str
    enabled: bool

    @field_validator("tenant_schema")
    @classmethod
    def tenant_shape(cls, value: str) -> str:
        if not is_valid_tenant_schema(value):
            raise ValueError("tenant_schema must match pattern t_[a-z0-9_]{1,48}")
        return value


class SetKillSwitchRequest(BaseModel):
    killed: bool
