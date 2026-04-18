#!/usr/bin/env python3
"""Pre-commit hook: ban non-canonical raw icon size props.

CRITIC_PLAN item B6. Icons render at five canonical pixel sizes
anchored to the design system: xs=12, sm=16, md=20, lg=24, xl=32.
Any other raw `size={N}` literal on an icon is off-grid and drifts
the visual rhythm.

Use the `Icon` atom from `components/ui/icon.tsx`, which enforces
both the five canonical sizes and strokeWidth 1.5, or pass one of
the canonical numeric values directly if wrapping is infeasible.

Rejected:
    <X size={14} />
    <ChevronDown size={18} />

Allowed:
    <X size={16} />
    <Icon icon={X} size="sm" />
"""
from __future__ import annotations

import re
import sys

SKIP_PREFIXES = (
    "frontend/tests/",
    "frontend/components/design-system/",
    "frontend/node_modules/",
)

# Non-canonical pixel sizes seen in the wild that this hook rejects.
# Canonical sizes (12, 16, 20, 24, 32) are always allowed.
BANNED = {10, 11, 14, 15, 18, 22, 28, 40}

SIZE_RE = re.compile(r"\bsize=\{(\d+)\}")


def check_file(path: str) -> list[str]:
    errors: list[str] = []
    try:
        with open(path, encoding="utf-8") as f:
            for lineno, line in enumerate(f, 1):
                for match in SIZE_RE.finditer(line):
                    value = int(match.group(1))
                    if value in BANNED:
                        errors.append(
                            f"{path}:{lineno}: non-canonical size={{{value}}}; "
                            f"use 12/16/20/24/32 or the Icon atom"
                        )
    except (OSError, UnicodeDecodeError):
        return []
    return errors


def main(argv: list[str]) -> int:
    errors: list[str] = []
    for path in argv[1:]:
        if any(path.startswith(prefix) for prefix in SKIP_PREFIXES):
            continue
        if not path.endswith((".tsx", ".jsx", ".ts", ".js")):
            continue
        errors.extend(check_file(path))
    if errors:
        print("Non-canonical icon sizes (CRITIC_PLAN B6):", file=sys.stderr)
        for err in errors:
            print(f"  {err}", file=sys.stderr)
        print(
            "\nCanonical sizes: xs=12, sm=16, md=20, lg=24, xl=32.",
            file=sys.stderr,
        )
        print(
            "Prefer `<Icon icon={X} size=\"sm\" />` from components/ui/icon.tsx.",
            file=sys.stderr,
        )
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
