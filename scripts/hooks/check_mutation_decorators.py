#!/usr/bin/env python3
"""Enforce Phase Z.2: every mutating FastAPI route in
``backend/app/features/*/routes.py`` must be decorated with both
``@audited(...)`` and ``@gated_feature(...)``.

Mutating = methods POST, PATCH, PUT, DELETE.

The hook runs on files matching ``backend/app/features/.*/routes\\.py``.
Block the commit if any mutating route lacks either decorator. Passes
silently on non-mutating routes.

The check is text-based (re) rather than AST-parsed because the
pre-commit hook must stay fast and self-contained. A false-positive
can be silenced by adding ``# z2-lint: ok`` to the decorator stack
(very rare, used for internal/test-only routes).
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

_ROUTE_DECORATOR = re.compile(
    r"^@(?:router|app)\.(post|patch|put|delete)\s*\(",
    re.IGNORECASE,
)
_AUDITED_DECORATOR = re.compile(r"^@audited\s*\(")
_GATED_DECORATOR = re.compile(r"^@gated_feature\s*\(")
_SKIP_MARKER = re.compile(r"#\s*z2-lint:\s*ok\b")


def _scan_file(path: Path) -> list[str]:
    """Return a list of findings (one per missing-decorator route)."""
    findings: list[str] = []
    lines = path.read_text(encoding="utf-8").splitlines()

    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if _ROUTE_DECORATOR.match(line):
            # Gather every line from the route decorator up to and
            # including the `def` line. The decorator `@router.post(...)`
            # may span multiple lines; intermediate comments or extra
            # `@decorator` lines are part of the same stack.
            block: list[str] = [lines[i]]
            j = i + 1
            while j < len(lines):
                ls = lines[j].lstrip()
                if re.match(r"\b(async\s+)?def\s+\w+", ls):
                    block.append(lines[j])
                    break
                block.append(lines[j])
                j += 1
            func_line = lines[j] if j < len(lines) else ""
            func_name_match = re.search(r"\bdef\s+(\w+)\s*\(", func_line)
            func_name = func_name_match.group(1) if func_name_match else "<unknown>"

            joined = "\n".join(block)
            if _SKIP_MARKER.search(joined):
                i = j + 1
                continue

            # Only real `@audited(...)` / `@gated_feature(...)` lines
            # count as decorators (not comments that mention them).
            has_audited = any(
                _AUDITED_DECORATOR.match(ln.strip()) for ln in block
            )
            has_gated = any(
                _GATED_DECORATOR.match(ln.strip()) for ln in block
            )
            if not has_audited or not has_gated:
                missing: list[str] = []
                if not has_audited:
                    missing.append("@audited")
                if not has_gated:
                    missing.append("@gated_feature")
                findings.append(
                    f"{path}:{i + 1}: {func_name} is a mutating route "
                    f"({line.split('(')[0]}) missing {', '.join(missing)}"
                )
            i = j + 1
            continue
        i += 1
    return findings


def main(argv: list[str]) -> int:
    # `scope` is the set of files to check. pre-commit passes them as
    # positional args; if none given, scan the whole features tree.
    if argv[1:]:
        files = [Path(a) for a in argv[1:]]
    else:
        root = Path("backend/app/features")
        files = list(root.glob("*/routes.py")) if root.exists() else []

    all_findings: list[str] = []
    for f in files:
        # Only mutating-route lint applies to feature route files.
        if f.name != "routes.py":
            continue
        if not f.exists():
            continue
        all_findings.extend(_scan_file(f))

    if all_findings:
        print("Phase Z.2 mutation-decorator lint failed:\n", file=sys.stderr)
        for item in all_findings:
            print(f"  {item}", file=sys.stderr)
        print(
            "\nEvery mutating route in backend/app/features/*/routes.py "
            "must carry both @audited(...) and @gated_feature(...). See "
            "backend/app/core/audit.py and backend/app/core/rbac.py.",
            file=sys.stderr,
        )
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
