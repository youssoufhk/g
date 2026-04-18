# ADR-012: Unified quality gate

**Status:** Accepted
**Date:** 2026-04-18
**Supersedes:** OPUS_CRITICS.md §12 (standalone 57-item bar), OPUS_CRITICS_V2.md §18 (standalone 13-item delta)
**Amends:** docs/FLAWLESS_GATE.md (expanded from 15 items to 70), CLAUDE.md §7 (pointer updated)

## Context

Three quality bars had accreted in the repo by Phase 5a:

1. The 15-item flawless gate in `docs/FLAWLESS_GATE.md`, mirrored in `CLAUDE.md §7`. Authoritative per CLAUDE.md §0 ("If something here conflicts with any other doc, this file wins").
2. `OPUS_CRITICS.md §12` - 57 items self-declared as "what DONE must mean from now on".
3. `OPUS_CRITICS_V2.md §18` - 13 net-new delta items hardening gaps the V1 audit missed (items 58-70).

OPUS_CRITICS_V2 §16 flagged this directly: "The two are not reconcilable. Today, two competing gates is a recipe for the next agent self-certifying against whichever is more lenient." The V2 recommendation was explicit: "Pick one, file the ADR, delete or rebrand the other."

The founder's direction on 2026-04-18 was "fix it". The cheapest-correct reading is: merge V1 (57) + V2 delta (13) into the 15-item gate to yield a single 70-item authoritative list, keeping the CLAUDE.md §7 summary as a pointer.

## Decision

1. `docs/FLAWLESS_GATE.md` is rewritten as the single authoritative 70-item gate. The prior 15 items are preserved as cross-references (`(was §7.N)`) so nothing implicit is lost.
2. `OPUS_CRITICS.md` and `OPUS_CRITICS_V2.md` are rebranded at their top with a supersession header pointing at `docs/FLAWLESS_GATE.md`. The audit prose stays for historical record; the gate-lists inside stop being authoritative.
3. `CLAUDE.md §7` is updated to reference the unified 70-item gate rather than list 15 items inline. CLAUDE.md §0 precedence ("this file wins") is preserved by keeping the pointer one line and having `FLAWLESS_GATE.md` be the only document that can expand the list.
4. A "feel proxy checklist" survives from the prior 15-item gate as the agent-runnable half of the founder sign-off. The founder remains the only authorized signer on the feel dimension, but the agent does the discovery so the founder is not a 13-feature bottleneck.
5. Any future bar additions happen via an ADR amending this one. No more parallel bars.

## Consequences

- One list. One bar. Agents cannot self-certify against the lenient one because the lenient one has been absorbed.
- CLAUDE.md §7 shrinks from a 15-item list to a pointer. The file wins on *conflict*, not on *length*; FLAWLESS_GATE.md can grow without rewriting CLAUDE.md each time.
- Prior commits that cited "all 15 items green" against the older gate are not retroactively invalid, but from 2026-04-18 forward, "green" means all 70.
- OPUS audit prose (V1 + V2) remains readable for context on *why* the 70 items exist. The prose is superseded for gating purposes only.
- The unified gate is still complemented by two CI-enforced documents: `docs/MODULARITY.md` (M1-M10 structural rules) and `docs/TESTING_STRATEGY.md` (six automated layers). A feature passes the gate only if it also passes those.

## Follow-ups

- Update `CLAUDE.md §7` to reference the unified gate (done in the same commit as this ADR).
- Add supersession headers to `OPUS_CRITICS.md` and `OPUS_CRITICS_V2.md` (done in the same commit).
- When any new OPUS_CRITICS_VN audit surfaces further items, file `ADR-NNN` amending this one and merge into `FLAWLESS_GATE.md`. Do not create a VN standalone bar.
- Next audit loop iterations follow the §12 critic rubric against the unified 70-item list.
