"""Per-entity target schemas for CSV import validation.

Each entity type (employees, clients, projects, teams) has a known set of
target fields. The CSV import service validates incoming rows against the
matching schema and produces structured errors the frontend can show.
"""

from dataclasses import dataclass

from app.features.imports.schemas import EntityType, RowValidationError


@dataclass(frozen=True)
class TargetField:
    name: str
    required: bool
    description: str
    examples: tuple[str, ...]


EMPLOYEE_FIELDS: tuple[TargetField, ...] = (
    TargetField("first_name", True, "Employee first name", ("Claire", "Oliver")),
    TargetField("last_name", True, "Employee last name", ("Dubois", "Smith")),
    TargetField("email", True, "Work email address", ("claire@acme.eu",)),
    TargetField(
        "role",
        True,
        "Role slug (owner, admin, finance, manager, employee, readonly, ...)",
        ("owner", "manager", "mid_consultant"),
    ),
    TargetField("team", False, "Team name", ("Finance", "Tech")),
    TargetField("hire_date", False, "ISO date the employee joined", ("2024-01-15",)),
    TargetField("manager_id", False, "Manager employee_id", ("12",)),
    TargetField("base_currency", False, "ISO 4217 currency code", ("EUR", "GBP")),
)

CLIENT_FIELDS: tuple[TargetField, ...] = (
    TargetField("name", True, "Client company name", ("HSBC UK",)),
    TargetField("country_code", True, "ISO 3166-1 alpha-2", ("FR", "GB")),
    TargetField("currency", True, "ISO 4217 currency code", ("EUR", "GBP")),
    TargetField(
        "primary_contact_name",
        False,
        "Primary contact full name",
        ("Dawn Booth",),
    ),
    TargetField(
        "primary_contact_email",
        False,
        "Primary contact email",
        ("treasury@hsbc.example",),
    ),
    TargetField("size_band", False, "large | mid | small", ("large",)),
)

PROJECT_FIELDS: tuple[TargetField, ...] = (
    TargetField("name", True, "Project name", ("HSBC UK - Compliance audit",)),
    TargetField("client_id", True, "Foreign key to clients.client_id", ("1",)),
    TargetField("status", True, "active | completed | pipeline", ("active",)),
    TargetField(
        "budget_minor_units",
        False,
        "Budget in minor units (cents, pence)",
        ("5000000",),
    ),
    TargetField("currency", False, "ISO 4217 currency code", ("EUR",)),
    TargetField("start_date", False, "ISO date", ("2024-04-03",)),
    TargetField("end_date", False, "ISO date or empty", ("2026-02-21",)),
    TargetField(
        "owner_employee_id",
        False,
        "Foreign key to employees.employee_id",
        ("13",),
    ),
)

TEAM_FIELDS: tuple[TargetField, ...] = (
    TargetField("name", True, "Team name", ("Finance", "Tech")),
    TargetField("lead_employee_id", False, "Employee id of team lead", ("1",)),
)


def target_fields(entity_type: EntityType) -> tuple[TargetField, ...]:
    match entity_type:
        case "employees":
            return EMPLOYEE_FIELDS
        case "clients":
            return CLIENT_FIELDS
        case "projects":
            return PROJECT_FIELDS
        case "teams":
            return TEAM_FIELDS


def target_field_names(entity_type: EntityType) -> list[str]:
    return [f.name for f in target_fields(entity_type)]


def validate_row(
    row_index: int,
    row: dict[str, str],
    entity_type: EntityType,
) -> list[RowValidationError]:
    errors: list[RowValidationError] = []
    schema = target_fields(entity_type)
    for field in schema:
        if field.required:
            value = row.get(field.name, "").strip()
            if not value:
                errors.append(
                    RowValidationError(
                        row_index=row_index,
                        field=field.name,
                        message=f"{field.name} is required",
                    )
                )
    return errors
