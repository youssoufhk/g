"""AI client wrapper (M1).

Every call to the AI provider goes through ``AIClient``. No file outside
this module imports ``google.cloud.aiplatform``, ``anthropic``, or any
other vendor SDK. Swapping Vertex Gemini for Claude Haiku or a local
Mistral is a single-file change here.

Dev default: ``MockAIClient`` returns fixture responses from a dict so
unit tests never need network. Real ``VertexGeminiClient`` ships when
§3.11 swaps the wrappers to production.
"""

from dataclasses import dataclass
from typing import Any, Protocol


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

    The mock dispatches on the first word of the prompt so feature-level
    tests can register canned responses per scenario.
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


def get_client() -> AIClient:
    from app.core.config import settings

    if settings.ai_backend == "mock":
        return MockAIClient()
    raise RuntimeError(
        f"real AI backend not wired yet (§3.11): {settings.ai_backend!r}"
    )
