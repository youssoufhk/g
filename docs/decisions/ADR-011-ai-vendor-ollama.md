# ADR-011: Allow self-hosted Ollama as a dev-tier AI vendor

**Status:** Accepted
**Date:** 2026-04-18
**Amends:** `CLAUDE.md` section 1 (tech stack), `specs/AI_FEATURES.md` section 0 (provider)
**Related:** DEF-046 (provider swap reversibility), ADR-012 (unified quality gate)

## Context

`CLAUDE.md` section 1 and `specs/AI_FEATURES.md` section 0 name Vertex AI Gemini 2.5 Flash (EU-resident, `europe-west9`) as the locked AI vendor. The contract rationale is GDPR residency + the zero-retention posture the founder wants on customer data.

`backend/app/ai/client.py` ships `OllamaAIClient`, a concrete implementation that reaches a self-hosted Ollama daemon over HTTP and runs Gemma3 locally. The class has been in the tree since Phase 3 and is covered by `backend/tests/test_ollama_client.py`. It is the default in dev (`ai_backend=ollama` in `backend/.env.example`).

OPUS_CRITICS_V2 §0 flagged this as a spec/code divergence: "CLAUDE.md says one AI vendor. The backend ships another. Until the docs and the code agree, every agent will continue to read the doc and ship the lie." The V2 recommendation was: "Either delete `OllamaAIClient` or file an ADR amending CLAUDE.md §1 + AI_FEATURES.md §0 to allow self-hosted Gemma3 as a parallel option."

The founder wants to keep Ollama for local dev (no cloud account needed, offline-capable, fast iteration, zero cost per token). The cheapest-correct reading is: file the ADR, re-explain the EU-residency story for production, and restrict Ollama to non-production tiers.

## Decision

1. `AIClient` is the abstraction; `OllamaAIClient` and the future `VertexGeminiClient` are both valid concrete implementations selected by `settings.ai_backend`.
2. **Ollama is permitted in `dev` and `test` tiers only.** Production (`tier=prod`) must run the Vertex implementation. A startup check (to be wired in §16 Deploy Track) refuses boot if `tier=prod` and `ai_backend != vertex`.
3. The EU-residency guarantee applies to the **production tier** only. In dev and test, data never leaves the developer's machine (Ollama runs on localhost), so no cross-border transfer occurs.
4. `OllamaAIClient.run_tool` must compose tool schemas into the prompt text, because Gemma-family models do not support native function calling. The caller sends `tools=[{...}]`; the client formats those as a JSON schema block in the prompt so the model can emit calls in a parseable shape. The free-form / tool-only enforcement (see unified gate item 62) still lives at the feature layer: features call deterministic analyzers first, then ask the model to explain ranked results; the model never originates tool calls in production-critical paths.
5. Feature-module tool schemas (`backend/app/features/*/ai_tools.py`) are written against the abstract `AIClient` interface, not the concrete vendor. Swapping is a one-file change (DEF-046).
6. `MockAIClient` remains the default for CI and unit tests.

## Consequences

- CLAUDE.md §1 and AI_FEATURES.md §0 now honestly describe the stack: Vertex in production, Ollama in dev, Mock in test.
- The GDPR story is narrower but more defensible: customer data in dev is the developer's own; customer data in prod is resident in `europe-west9`.
- Tier-gate on boot is a Phase §16 Deploy Track item; until it lands, the policy is documented here and enforced by reviewer discipline.
- Every new feature tool continues to go through the `AIClient` protocol, not the concrete class. The vendor is a configuration detail.

## Follow-ups

- Update `CLAUDE.md §1` and `specs/AI_FEATURES.md §0` prose in the same commit as this ADR.
- Wire `OllamaAIClient.run_tool` to compose the tool schema into the prompt and add a test that asserts the schema block appears in the HTTP payload.
- §16 Deploy Track: add a startup check that refuses to boot if `tier=prod` and `ai_backend != vertex`.
- When `VertexGeminiClient` lands (§16), file a follow-up ADR ratifying the production wiring and the zero-retention configuration.
