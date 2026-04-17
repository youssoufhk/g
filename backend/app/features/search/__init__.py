"""Global topbar search feature (Phase Z.6).

Non-AI entity search across employees, clients, projects. Used by the
topbar SearchInput (Cmd+/ on every (app) page) as the non-AI fallback
when `kill_switch.ai` is on, and as the "jump to an entity" path
alongside the Cmd+K command palette.

The AI command palette with the 16-tool LLM-as-router lives in
`features/command_palette/` (Phase Z.5 deliverable) and is an
independent surface.
"""
