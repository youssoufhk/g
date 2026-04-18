#!/usr/bin/env python3
"""Pre-commit hook: ban locale-less ``toLocaleDateString`` /
``toLocaleTimeString`` calls in shipped frontend code.

Calling ``d.toLocaleDateString()`` (no args) or
``d.toLocaleDateString(undefined, { ... })`` formats dates using the
**browser's** default locale, which is not the same as the user's Gamma
locale. The user sees "April 2026" on an English browser and "avril
2026" on a French browser regardless of what they picked in the app.
This broke the `RangeCalendar` month label on 2026-04-18 (a French user
logged into a French account saw English month names because the host
Chrome was English).

``opus_plan_v2.md`` section 1 rule: "Dates/currencies go through
``lib/format.ts``, never inline ``Intl.DateTimeFormat``." This hook
enforces the date half of that rule for the specific bug class that
produces wrong output without erroring: a missing or ``undefined``
locale argument.

Scope (shipped code):
    frontend/components/**/*.{tsx,jsx,ts,js}
    frontend/features/**/*.{tsx,jsx,ts,js}
    frontend/app/**/*.{tsx,jsx,ts,js}
    frontend/lib/**/*.{tsx,jsx,ts,js}
    frontend/hooks/**/*.{tsx,jsx,ts,js}
    frontend/stores/**/*.{tsx,jsx,ts,js}

Skipped:
    frontend/tests/**         -- Playwright / vitest fixtures may use
                                 test-time locales
    frontend/node_modules/**  -- vendor
    frontend/scripts/**       -- build / dev-only scripts
    frontend/styles/**        -- CSS, not JS

Banned patterns::

    d.toLocaleDateString()
    d.toLocaleDateString(undefined, { ... })
    d.toLocaleTimeString()
    d.toLocaleTimeString(undefined, { ... })

Allowed patterns::

    d.toLocaleDateString(locale, { ... })   // any identifier / literal
    d.toLocaleDateString("en-GB", { ... })  // explicit locale tag

The explicit-tag variant is still suspect (hardcoded locale ignores the
user pick) but that is a separate discipline question; this hook owns
only the "you did not think about locale at all" bug class.

Exits 0 if clean, 1 with per-finding output otherwise.
"""
from __future__ import annotations

import re
import sys

# ``.toLocaleDateString(`` followed by either the immediate ``)`` (zero
# args) or the literal ``undefined`` as the first argument. Same for
# ``toLocaleTimeString``. Whitespace tolerant.
UNSCOPED_LOCALE = re.compile(
    r"""(?x)
    \.
    (?P<method> toLocaleDateString | toLocaleTimeString )
    \s* \(
    \s*
    (?:                       # either...
        \)                    # (a) no arguments at all
        |
        undefined \b          # (b) explicit undefined as first arg
    )
    """
)

SHIPPED_PREFIXES = (
    "frontend/components/",
    "frontend/features/",
    "frontend/app/",
    "frontend/lib/",
    "frontend/hooks/",
    "frontend/stores/",
)

SKIP_PREFIXES = (
    "frontend/tests/",
    "frontend/node_modules/",
    "frontend/scripts/",
    "frontend/styles/",
)


def _norm(path: str) -> str:
    return path.replace("\\", "/")


def _should_scan(path: str) -> bool:
    p = _norm(path)
    if any(p.startswith(prefix) for prefix in SKIP_PREFIXES):
        return False
    return any(p.startswith(prefix) for prefix in SHIPPED_PREFIXES)


def scan(path: str) -> list[str]:
    findings: list[str] = []
    if not _should_scan(path):
        return findings
    try:
        with open(path, encoding="utf-8", errors="replace") as fh:
            for lineno, line in enumerate(fh, start=1):
                stripped = line.lstrip()
                if stripped.startswith("//"):
                    continue
                for match in UNSCOPED_LOCALE.finditer(line):
                    method = match.group("method")
                    findings.append(
                        f"{path}:{lineno}: unscoped {method}(...) call: "
                        f"{match.group(0).strip()}"
                    )
    except FileNotFoundError:
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
            f"Found {len(all_findings)} unscoped toLocaleDateString / "
            "toLocaleTimeString call(s) in shipped code. Pass an "
            "explicit locale: use "
            "`intlLocale(useLocale())` from `@/lib/format` (or "
            "`formatDate(iso, format, intlLocale(useLocale()))`) so "
            "output matches the user's Gamma locale, not the browser's "
            "default."
        )
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
