"""Global topbar search feature (Phase Z.6).

Non-AI entity search across employees, clients, projects. Used by the
topbar SearchInput (Cmd+/ on every (app) page) as the non-AI fallback
when `kill_switch.ai` is on, and as the "jump to an entity" path
alongside the Cmd+K command palette.

The AI command palette with the 16-tool LLM-as-router lives in
`features/command_palette/` (Phase Z.5 deliverable) and is an
independent surface.

Search registers itself with the feature flag registry (M6) so the
operator console lists it alongside every other feature module. Per
``docs/DEGRADED_MODE.md`` row 59 it is the non-AI fallback for the
command palette, so it defaults to enabled and has no kill-switch
of its own; the registration is for operator visibility and for the
metatest that asserts catalog completeness.
"""

from app.core.feature_registry import registry

registry.register(
    "search",
    description=(
        "Global topbar keyword search. Non-AI fallback for the command "
        "palette per DEGRADED_MODE row 59; always enabled."
    ),
    default_enabled=True,
)
