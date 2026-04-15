"""Click CLI for the Gamma ops library.

Run `gamma-ops --help` for the full command tree. Subcommands mirror the
package layout:

    gamma-ops gcp projects create PROJECT_ID
    gamma-ops gcp storage create-bucket NAME [--cmek-key ...]
    gamma-ops gcp kms create-keyring NAME
    gamma-ops gcp kms create-key NAME --keyring KEYRING
    gamma-ops gcp secrets create NAME --value-file FILE

Other subcommands exist but print "not yet implemented" until the
underlying modules ship in later Phase 2 weeks.
"""

from __future__ import annotations

import sys
from pathlib import Path

import click

from gamma_ops import __version__
from gamma_ops.config import get_config
from gamma_ops.errors import OpsError
from gamma_ops.logging import get_logger, setup_logging


def _init(ctx: click.Context) -> None:
    """Initialize logging and attach config to the click context."""
    cfg = get_config()
    setup_logging(cfg.log_level)
    ctx.ensure_object(dict)
    ctx.obj["config"] = cfg
    ctx.obj["log"] = get_logger("gamma_ops.cli")


@click.group()
@click.version_option(version=__version__, prog_name="gamma-ops")
@click.pass_context
def main(ctx: click.Context) -> None:
    """Gamma operations CLI.

    Deterministic, idempotent wrappers around GCP, Cloudflare, and tenant
    operations. Every command is safe to re-run: already-existing resources
    are returned, not recreated.
    """
    _init(ctx)


# ---------------------------------------------------------------------------
# gcp group
# ---------------------------------------------------------------------------


@main.group()
def gcp() -> None:
    """GCP operations (projects, storage, kms, secrets, ...)."""


# -- gcp projects -----------------------------------------------------------


@gcp.group("projects")
def gcp_projects() -> None:
    """GCP project lifecycle."""


@gcp_projects.command("create")
@click.argument("project_id")
@click.option("--display-name", required=False, help="Human-readable display name.")
@click.option("--org-id", default=None, help="GCP organization ID.")
@click.pass_context
def gcp_projects_create(
    ctx: click.Context,
    project_id: str,
    display_name: str | None,
    org_id: str | None,
) -> None:
    """Create a GCP project. Idempotent."""
    from gamma_ops.gcp.projects import create_project

    try:
        result = create_project(
            project_id=project_id,
            display_name=display_name or project_id,
            org_id=org_id,
        )
    except OpsError as exc:
        click.echo(f"error: {exc}", err=True)
        sys.exit(2)

    click.echo(f"project: {result['project_id']} ({result['state']})")


@gcp_projects.command("list")
@click.option("--parent", default=None, help="Parent resource (organizations/... or folders/...).")
def gcp_projects_list(parent: str | None) -> None:
    """List GCP projects."""
    from gamma_ops.gcp.projects import list_projects

    try:
        projects = list_projects(parent=parent)
    except OpsError as exc:
        click.echo(f"error: {exc}", err=True)
        sys.exit(2)

    for p in projects:
        click.echo(f"{p['project_id']:30} {p['state']:15} {p['display_name']}")


# -- gcp storage ------------------------------------------------------------


@gcp.group("storage")
def gcp_storage() -> None:
    """Cloud Storage lifecycle."""


@gcp_storage.command("create-bucket")
@click.argument("name")
@click.option("--region", default=None, help="GCP region (default: config).")
@click.option("--storage-class", default="STANDARD", help="Storage class.")
@click.option("--cmek-key", default=None, help="KMS key full resource path.")
@click.option("--retention-seconds", type=int, default=None, help="Retention seconds.")
@click.option("--no-versioning", is_flag=True, default=False, help="Disable object versioning.")
@click.pass_context
def gcp_storage_create_bucket(
    ctx: click.Context,
    name: str,
    region: str | None,
    storage_class: str,
    cmek_key: str | None,
    retention_seconds: int | None,
    no_versioning: bool,
) -> None:
    """Create a GCS bucket with Gamma defaults. Idempotent."""
    from gamma_ops.gcp.storage import create_bucket

    try:
        result = create_bucket(
            name=name,
            location=region,
            storage_class=storage_class,
            cmek_key=cmek_key,
            retention_seconds=retention_seconds,
            versioning=not no_versioning,
        )
    except OpsError as exc:
        click.echo(f"error: {exc}", err=True)
        sys.exit(2)

    status = "created" if result["created"] else "already exists"
    click.echo(f"bucket {result['name']} ({result['location']}, {result['storage_class']}): {status}")


@gcp_storage.command("list-buckets")
@click.option("--project-id", default=None, help="Override project.")
def gcp_storage_list_buckets(project_id: str | None) -> None:
    """List GCS buckets."""
    from gamma_ops.gcp.storage import list_buckets

    try:
        buckets = list_buckets(project_id=project_id)
    except OpsError as exc:
        click.echo(f"error: {exc}", err=True)
        sys.exit(2)

    for b in buckets:
        click.echo(f"{b['name']:40} {b['location']:20} {b['storage_class']}")


# -- gcp kms ----------------------------------------------------------------


@gcp.group("kms")
def gcp_kms() -> None:
    """Cloud KMS keyrings and keys."""


@gcp_kms.command("create-keyring")
@click.argument("name")
@click.option("--location", default=None, help="GCP region.")
@click.option("--project-id", default=None, help="Override project.")
def gcp_kms_create_keyring(
    name: str,
    location: str | None,
    project_id: str | None,
) -> None:
    """Create a KMS keyring. Idempotent."""
    from gamma_ops.gcp.kms import create_keyring

    try:
        result = create_keyring(name=name, location=location, project_id=project_id)
    except OpsError as exc:
        click.echo(f"error: {exc}", err=True)
        sys.exit(2)

    click.echo(f"keyring: {result['name']}")


@gcp_kms.command("create-key")
@click.argument("name")
@click.option("--keyring", required=True, help="Keyring short name.")
@click.option("--location", default=None, help="GCP region.")
@click.option("--rotation-days", default=365, type=int, help="Rotation period in days.")
@click.option("--project-id", default=None, help="Override project.")
def gcp_kms_create_key(
    name: str,
    keyring: str,
    location: str | None,
    rotation_days: int,
    project_id: str | None,
) -> None:
    """Create a CryptoKey in a keyring. Idempotent."""
    from gamma_ops.gcp.kms import create_crypto_key

    try:
        result = create_crypto_key(
            name=name,
            keyring=keyring,
            location=location,
            rotation_period_seconds=rotation_days * 86_400,
            project_id=project_id,
        )
    except OpsError as exc:
        click.echo(f"error: {exc}", err=True)
        sys.exit(2)

    click.echo(f"key: {result['name']}")


# -- gcp secrets ------------------------------------------------------------


@gcp.group("secrets")
def gcp_secrets() -> None:
    """Secret Manager operations."""


@gcp_secrets.command("create")
@click.argument("name")
@click.option(
    "--value-file",
    type=click.Path(exists=True, dir_okay=False, path_type=Path),
    required=True,
    help="Path to a file whose contents are the secret payload.",
)
@click.option("--project-id", default=None, help="Override project.")
def gcp_secrets_create(
    name: str,
    value_file: Path,
    project_id: str | None,
) -> None:
    """Create a secret and its first version from a file. Idempotent."""
    from gamma_ops.gcp.secrets import create_secret

    payload = value_file.read_bytes()

    try:
        result = create_secret(name=name, payload=payload, project_id=project_id)
    except OpsError as exc:
        click.echo(f"error: {exc}", err=True)
        sys.exit(2)

    status = "created" if result["created"] else "version added"
    click.echo(f"secret {result['name']}: {status}")


# ---------------------------------------------------------------------------
# Placeholder groups for commands whose underlying modules are stubs
# ---------------------------------------------------------------------------


def _not_yet_implemented(name: str) -> None:
    click.echo(f"{name}: not yet implemented", err=True)
    sys.exit(1)


@gcp.command("bootstrap")
@click.option("--env", type=click.Choice(["staging", "prod"]), required=True)
def gcp_bootstrap(env: str) -> None:
    """Bootstrap a full GCP environment. Not yet implemented."""
    _not_yet_implemented(f"gcp bootstrap --env {env}")


@main.group()
def cloudflare() -> None:
    """Cloudflare operations."""


@cloudflare.command("dns-record")
def cloudflare_dns_record() -> None:
    """Create or update a DNS record. Not yet implemented."""
    _not_yet_implemented("cloudflare dns-record")


@cloudflare.command("waf-rule")
def cloudflare_waf_rule() -> None:
    """Create a WAF rule. Not yet implemented."""
    _not_yet_implemented("cloudflare waf-rule")


@main.group()
def tenants() -> None:
    """Tenant lifecycle operations."""


@tenants.command("provision")
@click.option("--test", is_flag=True, default=False, help="Provision a throwaway test tenant.")
def tenants_provision(test: bool) -> None:
    """Provision a tenant. Not yet implemented."""
    _not_yet_implemented(f"tenants provision{' --test' if test else ''}")


@tenants.command("drill")
def tenants_drill() -> None:
    """Run the disaster recovery drill. Not yet implemented."""
    _not_yet_implemented("tenants drill")


@main.group()
def db() -> None:
    """Database operations."""


@db.command("backup")
def db_backup() -> None:
    """Create a Cloud SQL backup. Not yet implemented."""
    _not_yet_implemented("db backup")


@main.group()
def testing() -> None:
    """Testing support operations."""


@testing.command("seed")
def testing_seed() -> None:
    """Seed the canonical test tenant. Not yet implemented."""
    _not_yet_implemented("testing seed")


@testing.command("flawless-gate")
@click.argument("url")
def testing_flawless_gate(url: str) -> None:
    """Run the flawless gate against a URL. Not yet implemented."""
    _not_yet_implemented(f"testing flawless-gate {url}")


if __name__ == "__main__":
    main()
