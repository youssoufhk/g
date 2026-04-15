"""AI client wrapper (M1).

Every call to an LLM goes through ``AIClient``. No file outside this
module imports a vendor SDK. Swapping Ollama for Vertex Gemini for
Claude for a local Mistral is a single-file change.

Dev stack ships with two concrete clients:

* ``MockAIClient`` - deterministic canned responses via prefix match.
  Used by unit tests and CI so no network call is needed.
* ``OllamaAIClient`` - real self-hosted LLM via Ollama (local runtime
  the founder already has installed). Reaches Ollama over HTTP at
  ``settings.ollama_host``, default ``http://host.docker.internal:11434``
  so the backend container can see the host's ollama daemon.

Real ``VertexGeminiClient`` ships only in §16 Deploy Track when the
founder calls for production deployment.
"""

from dataclasses import dataclass
from typing import Any, Protocol

import httpx


@dataclass
class ToolCall:
    name: str
    arguments: dict[str, Any]


@dataclass
class AIResponse:
    text: str
    tool_calls: list[ToolCall]
    tokens_in: int
    tokens_out: int


class AIClient(Protocol):
    async def run_tool(
        self,
        *,
        prompt: str,
        tools: list[dict[str, Any]],
        tenant_schema: str | None,
        budget_tokens: int = 4_000,
    ) -> AIResponse: ...


class MockAIClient:
    """In-process stub. Used in dev and unit tests.

    The mock dispatches on the first characters of the prompt so
    feature tests can register canned responses per scenario.
    """

    def __init__(self) -> None:
        self._canned: dict[str, AIResponse] = {}

    def register(self, prompt_prefix: str, response: AIResponse) -> None:
        self._canned[prompt_prefix] = response

    async def run_tool(
        self,
        *,
        prompt: str,
        tools: list[dict[str, Any]],
        tenant_schema: str | None,
        budget_tokens: int = 4_000,
    ) -> AIResponse:
        for prefix, response in self._canned.items():
            if prompt.startswith(prefix):
                return response
        return AIResponse(
            text="[mock] no canned response for prompt",
            tool_calls=[],
            tokens_in=len(prompt) // 4,
            tokens_out=8,
        )


class OllamaAIClient:
    """Self-hosted LLM via Ollama.

    Ollama runs outside the container on the host and exposes an HTTP
    API at ``http://host:11434``. The ``/api/chat`` endpoint returns the
    model's reply; Gemma-family models do not support tool calling, so
    the ``tools`` argument is ignored and the caller is expected to run
    deterministic analyzers (Phase 5a) before asking Ollama to explain
    results in natural language.

    Setup: install Ollama on the host, pull the model, and make sure
    the daemon listens on 0.0.0.0 so the container can reach it::

        ollama pull gemma3
        OLLAMA_HOST=0.0.0.0:11434 ollama serve &

    Configure the backend via env vars ``OLLAMA_HOST`` and
    ``OLLAMA_MODEL`` (see ``backend/.env.example``).
    """

    def __init__(
        self,
        host: str,
        model: str,
        timeout_seconds: int = 120,
    ) -> None:
        self._host = host.rstrip("/")
        self._model = model
        self._timeout = timeout_seconds

    async def run_tool(
        self,
        *,
        prompt: str,
        tools: list[dict[str, Any]],
        tenant_schema: str | None,
        budget_tokens: int = 4_000,
    ) -> AIResponse:
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            response = await client.post(
                f"{self._host}/api/chat",
                json={
                    "model": self._model,
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": False,
                    "options": {"num_predict": budget_tokens},
                },
            )
            response.raise_for_status()
            data = response.json()

        message = data.get("message", {}) or {}
        content = message.get("content", "") or ""
        return AIResponse(
            text=content,
            tool_calls=[],
            tokens_in=int(data.get("prompt_eval_count", 0) or 0),
            tokens_out=int(data.get("eval_count", 0) or 0),
        )


def get_client() -> AIClient:
    from app.core.config import settings

    if settings.ai_backend == "mock":
        return MockAIClient()
    if settings.ai_backend == "ollama":
        return OllamaAIClient(
            host=settings.ollama_host,
            model=settings.ollama_model,
            timeout_seconds=settings.ollama_timeout_seconds,
        )
    raise RuntimeError(
        f"AI backend {settings.ai_backend!r} not wired yet. "
        f"Valid options in dev: 'mock', 'ollama'. Vertex Gemini lands in §16."
    )
