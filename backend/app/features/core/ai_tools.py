"""`navigate_to` command-palette helper.

Given an entity kind + id, return the deep-link URL the frontend
router uses for that page. This keeps the palette honest about
"zero dead ends" (CLAUDE.md §3.1 principle 3): "show me Alice's
profile" resolves to the same URL a user would reach by clicking
her name anywhere in the app.

The handler is pure: no DB read, no LLM roundtrip, just a lookup
in ``_ROUTES``. That means the command palette can still produce
links in degraded mode (AI budget exhausted, vision key revoked,
Ollama down): the palette falls back to a substring match on the
entity-kind list, invokes this tool locally, and returns the URL.
"""

from __future__ import annotations

from pydantic import BaseModel, Field

from app.ai.registry import ToolSpec, register


class NavigateToInput(BaseModel):
    entity_kind: str = Field(
        ...,
        pattern=(
            r"^(dashboard|employee|client|project|invoice|"
            r"timesheet|expense|leave|approval|team)$"
        ),
        description="one of the known page kinds",
    )
    entity_id: int | str | None = Field(
        default=None,
        description=(
            "id for the detail page; null for list pages (e.g. /invoices). "
            "String is accepted for slug-keyed resources."
        ),
    )
    locale: str = Field(
        default="en",
        pattern=r"^(en|fr)$",
        description="next-intl locale prefix",
    )


class NavigateToOutput(BaseModel):
    url: str
    label: str
    kind: str


_ROUTES: dict[str, tuple[str, str]] = {
    "dashboard": ("/{locale}/dashboard", "Dashboard"),
    "employee": ("/{locale}/employees/{id}", "Employee profile"),
    "client": ("/{locale}/clients/{id}", "Client profile"),
    "project": ("/{locale}/projects/{id}", "Project detail"),
    "invoice": ("/{locale}/invoices/{id}", "Invoice detail"),
    "timesheet": ("/{locale}/timesheets/{id}", "Timesheet week"),
    "expense": ("/{locale}/expenses", "Expenses"),
    "leave": ("/{locale}/leaves", "Leaves"),
    "approval": ("/{locale}/approvals", "Approvals"),
    "team": ("/{locale}/employees?team={id}", "Team"),
}


def build_url(data: NavigateToInput) -> NavigateToOutput:
    """Pure URL builder. Available to non-AI callers too."""
    template, label = _ROUTES[data.entity_kind]
    if "{id}" in template:
        if data.entity_id is None:
            # Strip the /{id} segment for list pages that accept no id.
            template = template.replace("/{id}", "")
        else:
            template = template.replace("{id}", str(data.entity_id))
    url = template.replace("{locale}", data.locale)
    return NavigateToOutput(url=url, label=label, kind=data.entity_kind)


async def navigate_to_handler(**kwargs: object) -> NavigateToOutput:
    return build_url(NavigateToInput.model_validate(kwargs))


SPEC = register(
    ToolSpec(
        name="navigate_to",
        feature="core",
        description=(
            "Generate a deep-link URL for the command palette (dashboard, "
            "employee, client, project, invoice, timesheet, etc.)."
        ),
        input_schema=NavigateToInput,
        output_schema=NavigateToOutput,
        handler=navigate_to_handler,
        tags=("palette", "pure"),
    )
)
