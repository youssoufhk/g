"""Smoke tests for the gamma-ops CLI.

These tests only invoke `--help` variants; they do not hit any real GCP
or Cloudflare endpoint.
"""

from __future__ import annotations

from click.testing import CliRunner

from gamma_ops.cli import main


def test_cli_help_exits_zero(monkeypatch_env: None) -> None:
    runner = CliRunner()
    result = runner.invoke(main, ["--help"])
    assert result.exit_code == 0
    assert "Gamma operations CLI" in result.output


def test_cli_version(monkeypatch_env: None) -> None:
    runner = CliRunner()
    result = runner.invoke(main, ["--version"])
    assert result.exit_code == 0
    assert "gamma-ops" in result.output


def test_cli_top_level_groups_present(monkeypatch_env: None) -> None:
    runner = CliRunner()
    result = runner.invoke(main, ["--help"])
    assert result.exit_code == 0
    for group in ("gcp", "cloudflare", "tenants", "db", "testing"):
        assert group in result.output


def test_gcp_help(monkeypatch_env: None) -> None:
    runner = CliRunner()
    result = runner.invoke(main, ["gcp", "--help"])
    assert result.exit_code == 0
    for sub in ("projects", "storage", "kms", "secrets", "bootstrap"):
        assert sub in result.output


def test_gcp_storage_help(monkeypatch_env: None) -> None:
    runner = CliRunner()
    result = runner.invoke(main, ["gcp", "storage", "--help"])
    assert result.exit_code == 0
    assert "create-bucket" in result.output
    assert "list-buckets" in result.output


def test_unimplemented_subcommand_exits_nonzero(monkeypatch_env: None) -> None:
    """Commands backed by stubs should print a message and exit non-zero."""
    runner = CliRunner()
    result = runner.invoke(main, ["tenants", "drill"])
    assert result.exit_code == 1
    assert "not yet implemented" in result.output
