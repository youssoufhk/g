"""Wire format for topbar search results."""

from pydantic import BaseModel


class SearchHit(BaseModel):
    """One entity hit. `kind` is the stable URL path segment for the
    detail page (employees | clients | projects). `subtitle` is a short
    context string (role, primary contact, client name)."""

    kind: str
    id: int
    title: str
    subtitle: str | None = None


class SearchGroupedResponse(BaseModel):
    """Grouped response per `specs/APP_BLUEPRINT.md §13.9`."""

    employees: list[SearchHit]
    clients: list[SearchHit]
    projects: list[SearchHit]
    total: int
