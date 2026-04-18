#!/usr/bin/env python3
"""Pre-commit hook: ban hardcoded aria-label string literals.

Every aria-label in a frontend component must resolve through
`useTranslations(...)` so the French build (CLAUDE.md section 1,
first-target EU customer) hears screen-reader labels in the user's
locale, not raw English. The a11y sweep in critic loop section 12.3
wired every known aria-label through the `a11y` next-intl namespace;
this hook keeps the regression window closed.

Allowed:
    aria-label={t("close")}
    aria-label={ta("primary_navigation")}
    aria-label={title}
    aria-label={user.name}

Rejected:
    aria-label="Close"
    aria-label='Previous page'
    aria-label={`${count} items`}     (template literal with text)

The hook only scans .tsx and .jsx files and skips any file whose
path begins with:
    frontend/tests/    (test code uses hardcoded selectors)
    frontend/components/design-system/    (design atoms preview page)
    prototype/    (locked per CLAUDE.md rule 2)

Exits 0 if no offending literals, 1 otherwise. Prints every finding
with path:line so the founder can jump straight to each.
"""
from __future__ import annotations

import re
import sys

# aria-label="..." or aria-label='...'
STRING_LITERAL = re.compile(r'aria-label\s*=\s*("[^"]*"|\'[^\']*\')')

# aria-label={`...`}
# Captured body lets us strip ${...} expressions and inspect the
# surrounding literal text. Templates made only of interpolation
# (e.g. `${x} / ${y}`) are fine because the interpolated values are
# assumed to be already localized by the caller.
TEMPLATE_LITERAL = re.compile(r'aria-label\s*=\s*\{\s*`([^`]*)`\s*\}')
INTERPOLATION = re.compile(r'\$\{[^}]*\}')

SKIP_PREFIXES = (
    "frontend/tests/",
    "frontend/components/design-system/",
    "prototype/",
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
                for match in STRING_LITERAL.finditer(line):
                    findings.append(
                        f"{path}:{lineno}: hardcoded aria-label literal: "
                        f"{match.group(0).strip()}"
                    )
                for match in TEMPLATE_LITERAL.finditer(line):
                    body = match.group(1)
                    literal_text = INTERPOLATION.sub("", body)
                    if re.search(r"[A-Za-z]{2,}", literal_text):
                        findings.append(
                            f"{path}:{lineno}: template aria-label with "
                            f"hardcoded text: {match.group(0).strip()}"
                        )
    except OSError as err:
        findings.append(f"{path}: could not read file: {err}")
    return findings


def main(argv: list[str]) -> int:
    all_findings: list[str] = []
    for path in argv[1:]:
        if not (path.endswith(".tsx") or path.endswith(".jsx")):
            continue
        all_findings.extend(scan(path))
    if all_findings:
        for f in all_findings:
            print(f)
        print()
        print(
            f"Found {len(all_findings)} hardcoded aria-label(s). "
            "Route every aria-label through useTranslations (see "
            "frontend/messages/en.json a11y namespace)."
        )
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
