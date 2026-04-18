#!/usr/bin/env python3
"""Pre-commit hook: ban ``console.log`` (and friends) in shipped frontend
code.

``opus_plan_v2.md`` §12.1 rubric: "No ``console.log`` in shipped code."
The goal is production hygiene: every ``console.*`` call that reaches a
customer browser leaks either internal state (``console.log({ user })``)
or implementation noise (``console.debug("mounting")``) and is a tell
that debug scaffolding was shipped. Real error surfaces go through the
error boundary + toast pattern, not the devtools console.

Scope (shipped code):
    frontend/components/**/*.{tsx,jsx,ts,js}
    frontend/features/**/*.{tsx,jsx,ts,js}
    frontend/app/**/*.{tsx,jsx,ts,js}
    frontend/lib/**/*.{tsx,jsx,ts,js}
    frontend/hooks/**/*.{tsx,jsx,ts,js}
    frontend/stores/**/*.{tsx,jsx,ts,js}

Skipped (not shipped to customers):
    frontend/scripts/**        -- build / dev scripts (sync-tokens, screenshots)
    frontend/tests/**          -- Playwright specs, vitest unit tests
    frontend/node_modules/**   -- vendor
    frontend/styles/**         -- CSS, not JS

Banned calls::

    console.log(...)     // debug scaffolding
    console.debug(...)   // debug scaffolding
    console.info(...)    // debug scaffolding
    console.warn(...)    // should be surfaced via toast or error boundary

Allowed calls::

    console.error(...)   // legitimate inside the Next.js error boundary
                         // convention (``error.tsx`` / ``global-error.tsx``)
                         // where the platform requires forwarding the
                         // error to devtools.  Outside those two
                         // filenames, ``console.error`` is also banned.

Exits 0 if clean, 1 with per-finding output otherwise.
"""
from __future__ import annotations

import re
import sys
from pathlib import PurePosixPath

# ``console.`` followed by a banned method name, then ``(``. The word
# boundary on the method name stops us flagging things like
# ``console.logger`` (which does not exist in the DOM but keeps the regex
# honest).
CONSOLE_CALL = re.compile(
    r"""(?x)
    \bconsole \s* \.
    \s* (?P<method> log | debug | info | warn | error )
    \b
    \s* \(
    """
)

# Shipped-code roots: a normalised path must start with one of these to
# be scanned.  Everything else is skipped.
SHIPPED_PREFIXES = (
    "frontend/components/",
    "frontend/features/",
    "frontend/app/",
    "frontend/lib/",
    "frontend/hooks/",
    "frontend/stores/",
)

# Non-shipped-code roots live under frontend/ but are deliberately
# excluded even if a caller passes them explicitly (belt + braces: the
# pre-commit ``exclude:`` rule handles this at scheduling time, this
# list handles it at scan time).
SKIP_PREFIXES = (
    "frontend/scripts/",
    "frontend/tests/",
    "frontend/node_modules/",
    "frontend/styles/",
)

# Filenames where ``console.error`` is allowed (Next.js error boundary
# convention: the platform expects the boundary to forward the caught
# error to devtools for developer visibility).  ``console.log`` /
# ``debug`` / ``info`` / ``warn`` are still banned inside these files.
ERROR_BOUNDARY_FILENAMES = frozenset({"error.tsx", "global-error.tsx"})


def _norm(path: str) -> str:
    return path.replace("\\", "/")


def _should_scan(path: str) -> bool:
    p = _norm(path)
    if any(p.startswith(prefix) for prefix in SKIP_PREFIXES):
        return False
    return any(p.startswith(prefix) for prefix in SHIPPED_PREFIXES)


def _is_error_boundary(path: str) -> bool:
    name = PurePosixPath(_norm(path)).name
    return name in ERROR_BOUNDARY_FILENAMES


def scan(path: str) -> list[str]:
    findings: list[str] = []
    if not _should_scan(path):
        return findings
    error_boundary = _is_error_boundary(path)
    try:
        with open(path, encoding="utf-8", errors="replace") as fh:
            for lineno, line in enumerate(fh, start=1):
                stripped = line.lstrip()
                # Line-level single-line comment: skip. Block comments are
                # ignored per-line which is best-effort; a caller who
                # writes ``// console.log(...)`` is fine, and a
                # ``/* console.log(...) */`` that spans only one line is
                # also fine. A multi-line block comment containing a
                # banned call would trip; if that ever happens in a real
                # file, restructure the comment.
                if stripped.startswith("//"):
                    continue
                for match in CONSOLE_CALL.finditer(line):
                    method = match.group("method")
                    if method == "error" and error_boundary:
                        continue
                    findings.append(
                        f"{path}:{lineno}: banned console.{method}(...) "
                        f"in shipped code: {match.group(0).strip()}"
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
            f"Found {len(all_findings)} console.* call(s) in shipped "
            "code. Route user-visible errors through the error "
            "boundary + toast pattern; remove debug scaffolding "
            "before commit. Allowed: console.error inside "
            "error.tsx / global-error.tsx."
        )
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
