#!/usr/bin/env python3
"""M3 modularity lint.

Forbid cross-feature ``.models`` imports. A file under
``backend/app/features/<feature>/`` may import from its OWN feature's
``models`` module, but never from another feature's models.

Cross-feature integration goes through the service layer:

    # WRONG (M3 violation)
    from app.features.employees.models import Employee

    # RIGHT
    from app.features.employees.service import get_employee_by_id

See docs/MODULARITY.md M3 for the full rule and rationale.

Scope:
    - Files INSIDE ``backend/app/features/<feature>/`` are checked.
    - Files outside features (e.g. ``backend/app/main.py``, ``backend/tests/``,
      ``backend/migrations/``) are allowed to import any feature's models;
      they are not part of a feature, so M3 does not apply to them.

Usage (pre-commit wires this up):
    python3 scripts/hooks/check_cross_feature_models.py <file>...
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
FEATURES_PREFIX = "backend/app/features/"

# Three import forms that cross-reference a feature module:
#   from app.features.<other>.models import X
#   from app.features.<other> import models
#   import app.features.<other>.models
_FORM_FROM_MODELS = re.compile(
    r"^\s*from\s+app\.features\.(?P<other>\w+)\.models\b",
    re.MULTILINE,
)
_FORM_FROM_IMPORT_MODELS = re.compile(
    r"^\s*from\s+app\.features\.(?P<other>\w+)\s+import\s+[\w,\s]*\bmodels\b",
    re.MULTILINE,
)
_FORM_IMPORT_MODELS = re.compile(
    r"^\s*import\s+app\.features\.(?P<other>\w+)\.models\b",
    re.MULTILINE,
)


def rel(path: Path) -> str:
    try:
        return str(path.resolve().relative_to(REPO_ROOT))
    except ValueError:
        return str(path)


def own_feature(rel_path: str) -> str | None:
    """Return the feature name if the file lives inside features/<feature>/.

    Return None if the file is outside ``backend/app/features/`` (e.g. main.py,
    tests, migrations). Those files are exempt from M3.
    """
    if not rel_path.startswith(FEATURES_PREFIX):
        return None
    tail = rel_path[len(FEATURES_PREFIX) :]
    parts = tail.split("/", 1)
    if len(parts) < 2:
        return None
    feature = parts[0]
    if feature in {"__init__.py", "__pycache__"}:
        return None
    return feature


def check_file(path: Path) -> list[str]:
    if path.suffix != ".py":
        return []
    rel_path = rel(path)
    if not rel_path.startswith("backend/"):
        return []
    own = own_feature(rel_path)
    if own is None:
        return []

    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return []

    errors: list[str] = []
    for pattern in (_FORM_FROM_MODELS, _FORM_FROM_IMPORT_MODELS, _FORM_IMPORT_MODELS):
        for match in pattern.finditer(text):
            other = match.group("other")
            if other != own:
                line_no = text[: match.start()].count("\n") + 1
                errors.append(
                    f"{rel_path}:{line_no}: forbidden cross-feature models "
                    f"import from {other!r} (feature {own!r} may not reach into "
                    f"another feature's models; go through "
                    f"app.features.{other}.service)"
                )
    return errors


def main(argv: list[str]) -> int:
    failures: list[str] = []
    for raw in argv:
        failures.extend(check_file(Path(raw)))

    if failures:
        print("M3 modularity violation (see docs/MODULARITY.md):", file=sys.stderr)
        for failure in failures:
            print(f"  {failure}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
