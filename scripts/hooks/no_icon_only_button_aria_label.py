#!/usr/bin/env python3
"""Pre-commit hook: icon-only buttons must carry an aria-label.

CRITIC_PLAN item C15. A button whose only children are SVG / icon
components (no text runs) is invisible to screen readers unless it
also carries an aria-label. This hook scans for `<button ...>` and
`<Button ...>` JSX blocks whose textual content is empty and flags
any that lack an `aria-label` attribute on the opening tag.

Allowed (has text run):
    <button>Close</button>
    <Button><Trash /> Delete</Button>

Allowed (icon-only with label):
    <button aria-label={t("close")}><X /></button>

Rejected (icon-only, no label):
    <button><X /></button>
    <Button><Trash size={14} /></Button>

Skipped paths: tests, design-system preview, prototype.
"""
from __future__ import annotations

import re
import sys

SKIP_PREFIXES = (
    "frontend/tests/",
    "frontend/components/design-system/",
    "prototype/",
)

# Match opening tag + body + closing tag across lines.
# Captures: (opening attrs, body)
BUTTON_BLOCK = re.compile(
    r"<(?:button|Button)\b([^>]*)>([\s\S]*?)</(?:button|Button)>",
    re.MULTILINE,
)

# An icon-only body is one whose trimmed content matches a single
# self-closing capitalized JSX tag (e.g. `<Trash size={14} />`) or a
# paired capitalized tag with only whitespace inside. Any other body
# (plain text, JSX expressions, nested layout, paired lowercase tags)
# is assumed to have visible text and is not flagged by this hook.
ICON_ONLY_BODY = re.compile(
    r"""^\s*
        (?:
            <[A-Z]\w*\b[^<>]*/>            # <Icon ... />
          | <([A-Z]\w*)\b[^<>]*>\s*</\1>   # <Icon ...></Icon>
        )
        \s*$
    """,
    re.VERBOSE,
)


def _has_aria_label(opening_attrs: str) -> bool:
    return bool(re.search(r"\baria-label\s*=", opening_attrs))


def _is_icon_only(body: str) -> bool:
    return bool(ICON_ONLY_BODY.match(body))


def _should_skip(path: str) -> bool:
    p = path.replace("\\", "/")
    return any(p.startswith(x) or f"/{x}" in p for x in SKIP_PREFIXES)


def scan(path: str) -> list[str]:
    if _should_skip(path):
        return []
    try:
        with open(path, encoding="utf-8", errors="replace") as fh:
            src = fh.read()
    except OSError as err:
        return [f"{path}: could not read file: {err}"]

    findings: list[str] = []
    for match in BUTTON_BLOCK.finditer(src):
        opening_attrs = match.group(1)
        body = match.group(2)
        if _has_aria_label(opening_attrs):
            continue
        if not _is_icon_only(body):
            continue
        line = src.count("\n", 0, match.start()) + 1
        findings.append(
            f"{path}:{line}: icon-only button has no aria-label "
            f"(add aria-label={{t(\"...\")}} from the a11y namespace)"
        )
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
            f"Found {len(all_findings)} icon-only button(s) without aria-label. "
            "Every icon-only control must carry an aria-label through "
            "useTranslations (frontend/messages/en.json a11y namespace)."
        )
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
