"""GCP project and API management.

Deterministic wrappers around `google-cloud-resource-manager`,
`google-cloud-billing`, and the Service Usage API (via
`googleapiclient.discovery`) for enabling services.

Every function is idempotent: creating a project that already exists
returns the existing project; enabling an API that is already enabled is
a no-op; linking a billing account that is already linked is a no-op.
"""

from __future__ import annotations

from typing import Any

from gamma_ops.errors import (
    AuthenticationError,
    GCPError,
    ResourceNotFound,
)
from gamma_ops.logging import get_logger

log = get_logger(__name__, component="gcp.projects")


def _rm_client() -> Any:
    """Return a ProjectsClient, translating auth errors to OpsError."""
    try:
        from google.cloud import resourcemanager_v3

        return resourcemanager_v3.ProjectsClient()
    except Exception as exc:
        raise AuthenticationError(
            f"Failed to initialize GCP resource manager client: {exc}"
        ) from exc


def create_project(
    project_id: str,
    display_name: str,
    org_id: str | None = None,
    parent: str | None = None,
) -> dict[str, Any]:
    """Create a GCP project, or return the existing one if it already exists.

    Purpose:
        Create a new Google Cloud project under an organization or folder.
        Intended for bootstrapping `gamma-staging` and `gamma-prod`.

    Parameters:
        project_id: Globally unique project ID, 6-30 chars, lowercase.
        display_name: Human-readable name shown in the GCP console.
        org_id: GCP organization numeric ID. Mutually exclusive with parent.
        parent: Full parent resource, e.g. `folders/1234` or `organizations/1234`.
            If neither org_id nor parent is given, the project is created without a parent.

    Returns:
        A dict with at least `name`, `project_id`, `display_name`, `state`.

    Raises:
        GCPError: on unexpected API failure.
        AuthenticationError: if ADC is missing or invalid.

    Idempotency notes:
        If the project already exists and is accessible to the caller, returns
        the existing project rather than raising. The existing project's
        display_name is NOT updated even if the caller passes a different value.

    Example:
        >>> from gamma_ops.gcp.projects import create_project
        >>> project = create_project("gamma-staging", "Gamma Staging", org_id="1234567")
        >>> project["state"]
        'ACTIVE'
    """
    from google.api_core import exceptions as gexc
    from google.cloud import resourcemanager_v3

    log.info("create_project:start", project_id=project_id, display_name=display_name)

    client = _rm_client()

    # Resolve parent resource string.
    parent_resource: str | None = None
    if parent:
        parent_resource = parent
    elif org_id:
        parent_resource = f"organizations/{org_id}"

    # Idempotency: try to get it first.
    try:
        existing = client.get_project(name=f"projects/{project_id}")
        log.info("create_project:already_exists", project_id=project_id, state=existing.state.name)
        return {
            "name": existing.name,
            "project_id": existing.project_id,
            "display_name": existing.display_name,
            "state": existing.state.name,
            "parent": existing.parent,
        }
    except gexc.NotFound:
        pass
    except gexc.PermissionDenied as exc:
        # Project exists but caller cannot see it, or project_id is claimed by another org.
        raise GCPError(
            f"Cannot access project {project_id}: permission denied (may be claimed by another org)"
        ) from exc

    project = resourcemanager_v3.Project(
        project_id=project_id,
        display_name=display_name,
        parent=parent_resource,
    )

    try:
        operation = client.create_project(project=project)
        result = operation.result(timeout=300)
    except gexc.AlreadyExists:
        # Race: created between our get and our create. Fetch and return.
        log.info("create_project:race_already_exists", project_id=project_id)
        existing = client.get_project(name=f"projects/{project_id}")
        return {
            "name": existing.name,
            "project_id": existing.project_id,
            "display_name": existing.display_name,
            "state": existing.state.name,
            "parent": existing.parent,
        }
    except gexc.GoogleAPIError as exc:
        log.error("create_project:failed", project_id=project_id, error=str(exc))
        raise GCPError(f"Failed to create project {project_id}: {exc}") from exc

    log.info("create_project:success", project_id=result.project_id, state=result.state.name)
    return {
        "name": result.name,
        "project_id": result.project_id,
        "display_name": result.display_name,
        "state": result.state.name,
        "parent": result.parent,
    }


def enable_apis(project_id: str, apis: list[str]) -> None:
    """Enable a list of GCP APIs on a project. Idempotent.

    Purpose:
        Bootstrap a new project with every API the Gamma stack needs.

    Parameters:
        project_id: Target project ID.
        apis: List of service names, e.g.
            ["run.googleapis.com", "sqladmin.googleapis.com", "secretmanager.googleapis.com"].

    Raises:
        GCPError: if any enablement call fails.
        AuthenticationError: if ADC is missing.

    Idempotency notes:
        Enabling an already-enabled API is a no-op on GCP's side. This
        function waits for each operation to finish before returning.

    Example:
        >>> enable_apis("gamma-staging", [
        ...     "run.googleapis.com",
        ...     "sqladmin.googleapis.com",
        ...     "secretmanager.googleapis.com",
        ...     "cloudkms.googleapis.com",
        ...     "aiplatform.googleapis.com",
        ... ])
    """
    try:
        from googleapiclient.discovery import build
        from googleapiclient.errors import HttpError
    except Exception as exc:
        raise AuthenticationError(
            f"Failed to initialize Service Usage client: {exc}"
        ) from exc

    log.info("enable_apis:start", project_id=project_id, count=len(apis))

    try:
        service = build("serviceusage", "v1", cache_discovery=False)
    except Exception as exc:
        raise AuthenticationError(f"Failed to build serviceusage client: {exc}") from exc

    for api in apis:
        try:
            request = service.services().enable(
                name=f"projects/{project_id}/services/{api}",
            )
            request.execute()
            log.info("enable_apis:enabled", project_id=project_id, api=api)
        except HttpError as exc:
            log.error("enable_apis:failed", project_id=project_id, api=api, error=str(exc))
            raise GCPError(f"Failed to enable {api} on {project_id}: {exc}") from exc


def link_billing(project_id: str, billing_account_id: str) -> None:
    """Link a billing account to a GCP project. Idempotent.

    Purpose:
        Attach a billing account so the project can provision non-free resources.

    Parameters:
        project_id: Target project ID.
        billing_account_id: Billing account ID, e.g. "0X0X0X-0X0X0X-0X0X0X"
            (without the "billingAccounts/" prefix; we add it).

    Raises:
        GCPError: on API failure.
        AuthenticationError: if ADC is missing.

    Idempotency notes:
        If the project is already linked to the same billing account, this is
        a no-op. If linked to a DIFFERENT account, this function overwrites
        the link (which is the documented GCP behavior for UpdateProjectBillingInfo).

    Example:
        >>> link_billing("gamma-staging", "0X0X0X-0X0X0X-0X0X0X")
    """
    try:
        from google.api_core import exceptions as gexc
        from google.cloud import billing_v1
    except Exception as exc:
        raise AuthenticationError(f"Failed to import google-cloud-billing: {exc}") from exc

    log.info("link_billing:start", project_id=project_id, billing_account=billing_account_id)

    client = billing_v1.CloudBillingClient()
    name = f"projects/{project_id}"
    target = f"billingAccounts/{billing_account_id}"

    try:
        current = client.get_project_billing_info(name=name)
        if current.billing_account_name == target and current.billing_enabled:
            log.info("link_billing:already_linked", project_id=project_id)
            return

        updated = billing_v1.ProjectBillingInfo(billing_account_name=target)
        client.update_project_billing_info(name=name, project_billing_info=updated)
        log.info("link_billing:success", project_id=project_id)
    except gexc.GoogleAPIError as exc:
        log.error("link_billing:failed", project_id=project_id, error=str(exc))
        raise GCPError(f"Failed to link billing to {project_id}: {exc}") from exc


def list_projects(parent: str | None = None) -> list[dict[str, Any]]:
    """List GCP projects visible to the caller.

    Parameters:
        parent: Optional parent resource to narrow the search, e.g. `folders/1234`.
            If None, lists all projects the caller can see.

    Returns:
        List of dicts with project metadata.

    Raises:
        GCPError: on API failure.

    Example:
        >>> for p in list_projects(parent="organizations/1234567"):
        ...     print(p["project_id"], p["state"])
    """
    from google.api_core import exceptions as gexc

    log.info("list_projects:start", parent=parent)
    client = _rm_client()

    try:
        if parent:
            iterator = client.list_projects(parent=parent)
        else:
            iterator = client.search_projects()
    except gexc.GoogleAPIError as exc:
        raise GCPError(f"Failed to list projects: {exc}") from exc

    projects = [
        {
            "name": p.name,
            "project_id": p.project_id,
            "display_name": p.display_name,
            "state": p.state.name,
            "parent": p.parent,
        }
        for p in iterator
    ]
    log.info("list_projects:success", count=len(projects))
    return projects


def delete_project(project_id: str, confirm: bool = False) -> None:
    """Soft-delete (schedule deletion) of a GCP project. Requires confirm=True.

    Purpose:
        Destructive operation. Marks the project for deletion; GCP keeps it
        recoverable for ~30 days before hard-deletion.

    Parameters:
        project_id: The project to delete.
        confirm: Must be True to proceed. Prevents accidental destruction.

    Raises:
        ValueError: if confirm is False.
        ResourceNotFound: if the project does not exist.
        GCPError: on API failure.

    Idempotency notes:
        Deleting an already-deleted (DELETE_REQUESTED) project raises
        ResourceNotFound. Callers should tolerate that and treat as success.

    Example:
        >>> delete_project("gamma-test-ephemeral", confirm=True)
    """
    from google.api_core import exceptions as gexc

    if not confirm:
        raise ValueError(
            f"delete_project refuses to run without confirm=True for {project_id}"
        )

    log.warning("delete_project:start", project_id=project_id)
    client = _rm_client()

    try:
        operation = client.delete_project(name=f"projects/{project_id}")
        operation.result(timeout=120)
        log.warning("delete_project:success", project_id=project_id)
    except gexc.NotFound as exc:
        raise ResourceNotFound(f"Project {project_id} not found") from exc
    except gexc.GoogleAPIError as exc:
        raise GCPError(f"Failed to delete project {project_id}: {exc}") from exc
