#!/usr/bin/env python3
"""Pre-commit hook: ban hardcoded hex colors and rgba() calls in frontend
TSX / JSX / TS / JS files.

The design system pins every color to a CSS variable (see
``prototype/_tokens.css`` + ``specs/DESIGN_SYSTEM.md``). A literal
``#fff`` or ``rgba(0,0,0,0.5)`` in JSX or an inline style bypasses the
token system, breaks dark/light-mode theming (tokens swap via
``[data-theme="light"]``; hex literals do not), and fails CLAUDE.md
rule 3 ("Never modify design tokens. Mirror, never rewrite.") plus
``opus_plan_v2.md`` section 11 ("No #fff or rgba() - use var(--color-*)
tokens").

Scope:
    frontend/**/*.tsx
    frontend/**/*.jsx
    frontend/**/*.ts
    frontend/**/*.js

Skipped:
    frontend/styles/**        -- raw CSS with legitimate rgba() for
                                 shadows / overlays / glass effects
                                 (many of which are token-defined)
    frontend/tests/**         -- test data / Playwright color assertions
    frontend/node_modules/**  -- vendor code
    frontend/scripts/**       -- build / dev scripts

Allowed tokens: all var(--color-*), var(--glass-*), var(--overlay-*)
plus the three explicit token aliases ``--color-white``,
``--color-text-on-primary``, ``--color-text-on-accent`` in
``styles/tokens.css`` which legitimately map to ``#fff`` per the locked
prototype.

Rejected:
    color: "#fff"                    (hex literal)
    background: "rgba(0,0,0,0.5)"    (rgba literal)
    style={{ border: "1px solid #abc" }}
    borderTop: '2px solid #f3d382'

Exits 0 if clean, 1 with per-finding output otherwise.
"""
from __future__ import annotations

import re
import sys

# ``#`` followed by 3, 4, 6, or 8 hex digits, bounded so a colour code
# embedded in a longer token does not match. Requires the match to be
# inside a string-like context (quotes or template literal) to avoid
# flagging CSS comments quoted in JSDoc blocks.
HEX_LITERAL = re.compile(
    r'''(?x)
    (['"`])                            # opening quote
    [^'"`\n]*?                         # any non-quote chars
    \#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})
    \b
    [^'"`\n]*?
    \1                                 # matching closing quote
    '''
)

# rgba()/rgb() call with literal numeric args. Pure functions or
# variables inside the call (e.g. rgb(var(--foo))) are allowed because
# the raw numbers come from a token.
RGBA_LITERAL = re.compile(
    r'''(?x)
    \brgb a? \s* \(
    \s* [0-9.]+ \s* ,?
    \s* [0-9.]+ \s* ,?
    \s* [0-9.]+
    (?: \s* , \s* [0-9.]+ )?
    \s* \)
    '''
)

SKIP_PREFIXES = (
    "frontend/styles/",
    "frontend/tests/",
    "frontend/node_modules/",
    "frontend/scripts/",
    "frontend/app/[locale]/(app)/design-system/",  # design atoms preview
)


def _should_skip(path: str) -> bool:
    normalised = path.replace("\\", "/")
    return any(normalised.startswith(p) or f"/{p}" in normalised for p in SKIP_PREFIXES)


def scan(path: str) -> list[str]:
    findings: list[str] = []
    if _should_skip(path):
        return findings
    try:
        with open(path, encoding="utf-8", errors="replace") as fh:
            for lineno, line in enumerate(fh, start=1):
                for match in HEX_LITERAL.finditer(line):
                    findings.append(
                        f"{path}:{lineno}: hardcoded hex colour: "
                        f"{match.group(0).strip()}"
                    )
                for match in RGBA_LITERAL.finditer(line):
                    findings.append(
                        f"{path}:{lineno}: hardcoded rgba/rgb colour: "
                        f"{match.group(0).strip()}"
                    )
    except FileNotFoundError:
        # Pre-commit passes file lists staged at commit time. A deleted
        # file can still appear in a manual invocation via
        # ``git ls-files``; silently ignore so the hook does not flag a
        # phantom path on deletion.
        pass
    except OSError as err:
        findings.append(f"{path}: could not read file: {err}")
    return findings


def main(argv: list[str]) -> int:
    all_findings: list[str] = []
    for path in argv[1:]:
        if not path.endswith((".tsx", ".jsx", ".ts", ".js")):
            continue
        all_findings.extend(scan(path))
    if all_findings:
        for f in all_findings:
            print(f)
        print()
        print(
            f"Found {len(all_findings)} hardcoded colour literal(s). "
            "Replace with var(--color-*) / var(--glass-*) / "
            "var(--overlay-*) tokens (see prototype/_tokens.css + "
            "specs/DESIGN_SYSTEM.md)."
        )
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
