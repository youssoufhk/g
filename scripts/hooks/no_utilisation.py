#!/usr/bin/env python3
"""Pre-commit hook: ban the word "utilisation".

Enforces CLAUDE.md rule 6: never use the word "utilisation". Use
"work time", "capacity", or "contribution".

Usage (invoked by pre-commit):
    python3 scripts/hooks/no_utilisation.py <file> [<file> ...]

Exits 0 if no forbidden word found, 1 otherwise. Case-insensitive
match on the bare word; does not flag words that merely contain
"utilisation" as a substring of a longer token.
"""
from __future__ import annotations

import re
import sys

PATTERN = re.compile(r"\butilisation\b", re.IGNORECASE)


def scan(path: str) -> list[str]:
    findings: list[str] = []
    try:
        with open(path, encoding="utf-8", errors="replace") as fh:
            for lineno, line in enumerate(fh, start=1):
                if PATTERN.search(line):
                    findings.append(f"{path}:{lineno}: banned word utilisation: {line.rstrip()}")
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
        print(f"Found {len(all_findings)} occurrence(s) of the banned word utilisation. "
              "Use work time, capacity, or contribution. See CLAUDE.md rule 6.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
