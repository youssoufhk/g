"""Tests for the OllamaAIClient wrapper.

Unit-only: we mock httpx so the test runs offline and does not depend on
a running Ollama daemon. The real integration test lives in the AI eval
harness (Phase 5a) and runs against the dev stack's live Ollama.
"""

from unittest.mock import AsyncMock, patch

import httpx
import pytest

from app.ai.client import (
    MockAIClient,
    OllamaAIClient,
    get_client,
)


def _fake_response(status: int, **kwargs: object) -> httpx.Response:
    # Attach a Request so httpx.Response.raise_for_status has something to
    # report against. Without a bound request it raises RuntimeError.
    request = httpx.Request("POST", "http://fake:11434/api/chat")
    return httpx.Response(status, request=request, **kwargs)  # type: ignore[arg-type]


@pytest.mark.asyncio
async def test_ollama_client_parses_api_chat_response() -> None:
    client = OllamaAIClient(host="http://fake:11434", model="gemma3")
    fake_response = _fake_response(
        200,
        json={
            "model": "gemma3",
            "message": {"role": "assistant", "content": "draft looks good"},
            "done": True,
            "prompt_eval_count": 42,
            "eval_count": 17,
        },
    )
    with patch("httpx.AsyncClient.post", new=AsyncMock(return_value=fake_response)):
        out = await client.run_tool(
            prompt="explain this draft",
            tools=[],
            tenant_schema="t_acme",
        )
    assert out.text == "draft looks good"
    assert out.tokens_in == 42
    assert out.tokens_out == 17
    assert out.tool_calls == []


@pytest.mark.asyncio
async def test_ollama_client_handles_empty_message_safely() -> None:
    client = OllamaAIClient(host="http://fake:11434", model="gemma3")
    fake_response = _fake_response(200, json={"model": "gemma3", "done": True})
    with patch("httpx.AsyncClient.post", new=AsyncMock(return_value=fake_response)):
        out = await client.run_tool(
            prompt="empty",
            tools=[],
            tenant_schema=None,
        )
    assert out.text == ""
    assert out.tokens_in == 0
    assert out.tokens_out == 0


@pytest.mark.asyncio
async def test_ollama_client_composes_tool_schema_into_prompt() -> None:
    client = OllamaAIClient(host="http://fake:11434", model="gemma3")
    fake_response = _fake_response(
        200,
        json={"model": "gemma3", "message": {"content": "ok"}, "done": True},
    )
    captured: dict[str, object] = {}

    async def fake_post(self: httpx.AsyncClient, url: str, *, json: dict[str, object]) -> httpx.Response:
        captured["url"] = url
        captured["json"] = json
        return fake_response

    tools = [
        {
            "name": "filter_employees",
            "description": "Filter employees by role",
            "parameters": {"type": "object", "properties": {"role": {"type": "string"}}},
        }
    ]
    with patch("httpx.AsyncClient.post", new=fake_post):
        await client.run_tool(prompt="find managers", tools=tools, tenant_schema="t_acme")

    payload = captured["json"]
    assert isinstance(payload, dict)
    sent_content = payload["messages"][0]["content"]
    assert "filter_employees" in sent_content
    assert "Filter employees by role" in sent_content
    assert "find managers" in sent_content


@pytest.mark.asyncio
async def test_ollama_client_parses_inline_tool_call() -> None:
    client = OllamaAIClient(host="http://fake:11434", model="gemma3")
    fake_response = _fake_response(
        200,
        json={
            "model": "gemma3",
            "message": {
                "role": "assistant",
                "content": '{"tool": "filter_employees", "arguments": {"role": "manager"}}',
            },
            "done": True,
        },
    )
    with patch("httpx.AsyncClient.post", new=AsyncMock(return_value=fake_response)):
        out = await client.run_tool(
            prompt="find managers",
            tools=[{"name": "filter_employees"}],
            tenant_schema="t_acme",
        )
    assert len(out.tool_calls) == 1
    assert out.tool_calls[0].name == "filter_employees"
    assert out.tool_calls[0].arguments == {"role": "manager"}


@pytest.mark.asyncio
async def test_ollama_client_raises_on_http_error() -> None:
    client = OllamaAIClient(host="http://fake:11434", model="gemma3")
    fake_response = _fake_response(500, text="boom")
    with (
        patch("httpx.AsyncClient.post", new=AsyncMock(return_value=fake_response)),
        pytest.raises(httpx.HTTPStatusError),
    ):
        await client.run_tool(
            prompt="anything",
            tools=[],
            tenant_schema=None,
        )


def test_get_client_dispatches_ollama_when_configured(monkeypatch: pytest.MonkeyPatch) -> None:
    from app.core import config as config_module

    monkeypatch.setattr(config_module.settings, "ai_backend", "ollama")
    client = get_client()
    assert isinstance(client, OllamaAIClient)


def test_get_client_returns_mock_by_default(monkeypatch: pytest.MonkeyPatch) -> None:
    from app.core import config as config_module

    monkeypatch.setattr(config_module.settings, "ai_backend", "mock")
    client = get_client()
    assert isinstance(client, MockAIClient)


def test_get_client_rejects_unknown_backend(monkeypatch: pytest.MonkeyPatch) -> None:
    from app.core import config as config_module

    monkeypatch.setattr(config_module.settings, "ai_backend", "vertex")
    with pytest.raises(RuntimeError):
        get_client()
