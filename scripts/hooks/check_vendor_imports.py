#!/usr/bin/env python3
"""M1 modularity lint.

Forbid vendor SDK imports outside the wrapper modules that own them.
See docs/MODULARITY.md M1 for the full rule.

The wrappers live at:
    backend/app/ai/client.py           AI SDKs (vertex, anthropic, openai)
    backend/app/storage/blob.py        object storage SDKs
    backend/app/email/sender.py        email SDKs (sendgrid, mailgun, postmark)
    backend/app/pdf/renderer.py        PDF rendering (weasyprint, gotenberg)
    backend/app/billing/provider.py    payment SDKs (stripe, paddle)
    backend/app/ocr/vision.py          OCR vendors
    backend/app/monitoring/telemetry.py  telemetry SDKs

Usage (pre-commit wires this up):
    python3 scripts/hooks/check_vendor_imports.py <file>...
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

# (module prefix, list of allowed wrapper paths)
VENDOR_RULES: list[tuple[str, tuple[str, ...]]] = [
    ("google.cloud.aiplatform", ("backend/app/ai/",)),
    ("vertexai", ("backend/app/ai/",)),
    ("anthropic", ("backend/app/ai/",)),
    ("openai", ("backend/app/ai/",)),
    ("google.cloud.storage", ("backend/app/storage/",)),
    ("boto3", ("backend/app/storage/",)),
    ("azure.storage.blob", ("backend/app/storage/",)),
    ("weasyprint", ("backend/app/pdf/",)),
    ("reportlab", ("backend/app/pdf/",)),
    ("stripe", ("backend/app/billing/",)),
    ("paddle", ("backend/app/billing/",)),
    ("sendgrid", ("backend/app/email/",)),
    ("mailgun", ("backend/app/email/",)),
    ("postmark", ("backend/app/email/",)),
    ("google.cloud.vision", ("backend/app/ocr/",)),
    ("google.cloud.documentai", ("backend/app/ocr/",)),
    ("datadog", ("backend/app/monitoring/",)),
    ("newrelic", ("backend/app/monitoring/",)),
    ("google.cloud.pubsub", ("backend/app/notifications/", "backend/app/events/")),
]

IMPORT_RE = re.compile(
    r"^\s*(?:from|import)\s+(?P<mod>[\w\.]+)",
    re.MULTILINE,
)


def rel(path: Path) -> str:
    try:
        return str(path.resolve().relative_to(REPO_ROOT))
    except ValueError:
        return str(path)


def check_file(path: Path) -> list[str]:
    if not path.suffix == ".py":
        return []
    rel_path = rel(path)
    if not rel_path.startswith("backend/"):
        return []
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return []

    errors: list[str] = []
    for match in IMPORT_RE.finditer(text):
        module = match.group("mod")
        for vendor, allowed_prefixes in VENDOR_RULES:
            if module == vendor or module.startswith(vendor + "."):
                if not any(rel_path.startswith(p) for p in allowed_prefixes):
                    errors.append(
                        f"{rel_path}: forbidden vendor import "
                        f"{module!r} (M1; allowed only in "
                        f"{', '.join(allowed_prefixes)})"
                    )
    return errors


def main(argv: list[str]) -> int:
    failures: list[str] = []
    for raw in argv:
        failures.extend(check_file(Path(raw)))

    if failures:
        print("M1 modularity violation (see docs/MODULARITY.md):", file=sys.stderr)
        for failure in failures:
            print(f"  {failure}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
