"""Central AI tool registry (specs/AI_FEATURES.md §3).

Every tool the command-palette / month-end-close / insight-cards agents
can call is listed here. The spec (§3.1) locks the v1.0 catalog at 16
tools; adding a 17th requires an ADR per the founder's "ask first"
rule, and removing one breaks the LLM-as-router prompt that enumerates
the list.

Each registry entry bundles:

* ``name``            - the identifier Gemini / Ollama sees in the
                        tool-call JSON. Stable across versions.
* ``feature``         - the feature module that owns the tool body.
                        Matches M2 (feature folder autonomy): all the
                        code for one tool lives in one folder.
* ``input_schema``    - Pydantic model describing the tool arguments.
                        Used both for LLM function-calling schema
                        generation and for request-time validation.
* ``output_schema``   - Pydantic model or ``None``; documents the
                        shape the feature returns. Separate from the
                        actual function so tests can assert the
                        contract without hitting service.py.
* ``description``     - one-sentence summary, fed to the LLM as part
                        of the tool list.
* ``handler``         - optional awaitable. Left as ``None`` in
                        Phase 3a.5 so the scaffolding can land
                        independently of the wait for Phase 5 service
                        wiring; the registry is still useful for
                        prompt construction and schema validation.

The registry is frozen at import time - tools call ``register()`` from
their ``ai_tools.py`` on module load, and ``all_tools()`` returns the
tuple to callers. A late ``register()`` (after first ``all_tools()``
call) is a programmer error and raises.
"""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from typing import Any

from pydantic import BaseModel

ToolHandler = Callable[..., Awaitable[Any]]


@dataclass(frozen=True)
class ToolSpec:
    name: str
    feature: str
    description: str
    input_schema: type[BaseModel]
    output_schema: type[BaseModel] | None = None
    handler: ToolHandler | None = None
    tags: tuple[str, ...] = field(default_factory=tuple)


_REGISTRY: dict[str, ToolSpec] = {}
_FROZEN = False


def register(spec: ToolSpec) -> ToolSpec:
    """Register a tool. Called once per tool at import time."""
    if _FROZEN:
        raise RuntimeError(
            f"registry frozen; cannot register {spec.name!r} after "
            "all_tools() has been called"
        )
    if spec.name in _REGISTRY:
        existing = _REGISTRY[spec.name]
        if existing is spec:
            return spec
        raise ValueError(
            f"duplicate tool name {spec.name!r}: already owned by "
            f"{existing.feature!r}, cannot reassign to {spec.feature!r}"
        )
    _REGISTRY[spec.name] = spec
    return spec


def all_tools() -> tuple[ToolSpec, ...]:
    """Return the tuple of registered tools in registration order.

    Calling this freezes the registry; a late ``register()`` will
    raise. This matches the production contract: the tool catalog
    is part of the prompt, so late additions would silently ship
    under a stale catalog hash.
    """
    global _FROZEN
    _FROZEN = True
    return tuple(_REGISTRY.values())


def get(name: str) -> ToolSpec:
    """Look up a tool by name. Raises ``KeyError`` if unknown."""
    return _REGISTRY[name]


def reset_for_tests() -> None:
    """Test-only: unfreeze and clear. Production code never calls
    this; it exists so the registry-lock tests can assert fresh
    import + registration flow."""
    global _FROZEN
    _REGISTRY.clear()
    _FROZEN = False


_FEATURE_MODULES: tuple[str, ...] = (
    # Modules are listed explicitly (not auto-discovered via pkgutil)
    # because (a) the spec pins the catalog and (b) import-order
    # matters for diff review: adding a tool is a one-line addition
    # here plus one new ai_tools.py, both visible in the same PR.
    "app.features.imports.ai_tools",
    "app.features.timesheets.ai_tools",
    "app.features.invoices.ai_tools",
    "app.features.expenses.ai_tools",
    "app.features.leaves.ai_tools",
    "app.features.approvals.ai_tools",
    "app.features.projects.ai_tools",
    "app.features.clients.ai_tools",
    "app.features.employees.ai_tools",
    "app.features.core.ai_tools",
)


def _load_all_feature_tools() -> None:
    """Import every feature's ``ai_tools`` module so the registry is
    populated. Called by ``app.main`` at startup and by tests.

    Uses ``importlib.reload`` for already-imported modules so that the
    module-level ``register()`` calls fire again after a
    ``reset_for_tests()`` cleared the registry. Plain ``import_module``
    is a no-op on a cached module, which would leave the registry
    empty in test runs that already touched these modules earlier.
    """
    import importlib
    import sys

    for mod_name in _FEATURE_MODULES:
        if mod_name in sys.modules:
            importlib.reload(sys.modules[mod_name])
        else:
            importlib.import_module(mod_name)


def ensure_loaded() -> None:
    """Idempotent: load once, then no-op. Unit tests call this
    explicitly so the test does not depend on a specific import
    order in conftest."""
    if not _REGISTRY:
        _load_all_feature_tools()
