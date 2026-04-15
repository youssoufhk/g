"""Tests for backend/app/core/config.py settings parsing."""

import pytest

from app.core.config import Settings


def test_cors_origins_defaults_are_localhost() -> None:
    settings = Settings()
    assert "http://localhost:3000" in settings.cors_origins
    assert "http://127.0.0.1:3000" in settings.cors_origins


def test_cors_origins_accepts_comma_separated_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    settings = Settings()
    assert settings.cors_origins == [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


def test_cors_origins_accepts_json_array_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv(
        "CORS_ORIGINS",
        '["http://localhost:3000","https://app.example.com"]',
    )
    settings = Settings()
    assert settings.cors_origins == [
        "http://localhost:3000",
        "https://app.example.com",
    ]


def test_cors_origins_accepts_single_value(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("CORS_ORIGINS", "http://localhost:3000")
    settings = Settings()
    assert settings.cors_origins == ["http://localhost:3000"]


def test_cors_origins_trims_whitespace(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("CORS_ORIGINS", "  http://a , http://b  , ")
    settings = Settings()
    assert settings.cors_origins == ["http://a", "http://b"]


def test_cors_origins_empty_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("CORS_ORIGINS", "")
    settings = Settings()
    assert settings.cors_origins == []
