#!/usr/bin/env python3
"""Pre-commit hook: ban em dashes and en dashes.

Enforces CLAUDE.md rule 5: no em dashes (U+2014) or en dashes (U+2013)
anywhere in the repo. Use hyphens, parentheses, or restructure.

Usage (invoked by pre-commit):
    python3 scripts/hooks/no_em_dashes.py <file> [<file> ...]

Exits 0 if no forbidden characters found, 1 otherwise.
Prints every offending line with file path and line number so the
founder can jump straight to each location.
"""
from __future__ import annotations

import sys

EM_DASH = "\u2014"
EN_DASH = "\u2013"


def scan(path: str) -> list[str]:
    """Return a list of 'path:lineno: excerpt' strings for each offending line."""
    findings: list[str] = []
    try:
        with open(path, encoding="utf-8", errors="replace") as fh:
            for lineno, line in enumerate(fh, start=1):
                if EM_DASH in line or EN_DASH in line:
                    findings.append(f"{path}:{lineno}: em/en dash found: {line.rstrip()}")
    except OSError as err:
        findings.append(f"{path}: could not read file: {err}")
    return findings


def main(argv: list[str]) -> int:
    all_findings: list[str] = []
    for path in argv[1:]:
        all_findings.extend(scan(path))
    if all_findings:
        for f in all_findings:
            print(f)
        print()
        print(f"Found {len(all_findings)} forbidden dash(es). "
              "Replace with hyphens, parentheses, or restructure. See CLAUDE.md rule 5.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
