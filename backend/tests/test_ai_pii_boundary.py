"""Lock Confidential-tier columns out of every AI surface.

Per ``specs/AI_FEATURES.md`` section 1 principle 7 and section 9.1,
four families of columns are Confidential-tier and MUST NEVER appear
in any AI prompt, tool schema, eval example, or prompt template:

* ``employee_compensation.*`` - salary, bonus, effective dates
* ``employee_banking.*``      - IBAN, BIC, account holder
* ``leave_requests.reason_encrypted`` - GDPR Art. 9 medical-implied data
* ``employees.protected_status_encrypted`` - GDPR Art. 9 protected categories

These tables/columns are physically split with finance/admin-only
access and CMEK-encrypted at rest. This file is the metatest that
spec 1.7 promises: it greps the tool definitions, generated JSON
schemas, prompt templates, and eval fixtures for any reference to
the banned identifiers and fails the build on the first hit.

Scope covered:
1. Raw source of every ``ai_tools.py`` file (field names, docstrings,
   descriptions, Field(description=...) blurbs).
2. Pydantic ``model_json_schema()`` output of every registered tool's
   input and output schema (the payload the LLM actually sees).
3. Every ``*.jinja`` prompt template under ``backend/app/ai/prompts/``.
4. Every ``examples.jsonl`` eval fixture under ``backend/app/ai/evals``.

What "reference" means here: the literal column/table identifiers
listed in the spec. A whole-word match on ``compensation`` or
``banking`` in any of the scanned surfaces is treated as a violation,
since the v1.0 catalog has no legitimate reason to mention either
(employees tools work with contribution and capacity, not pay). If
a future tool legitimately needs the word "banking" (e.g. a payment-
method filter), the remediation is to adjust the allow-list here with
an ADR, not to silently suppress the metatest.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import pytest

from app.ai import registry

# Banned identifiers, matched case-insensitively on word boundaries so
# a substring like "bankingfoo" still trips the guard. Each entry lines
# up with a row in specs/AI_FEATURES.md section 9.1; do not add or
# remove without updating the spec.
BANNED_PATTERNS: tuple[tuple[str, str], ...] = (
    ("employee_compensation", "Confidential-tier table: salary/bonus history"),
    ("employee_banking", "Confidential-tier table: IBAN/BIC/account holder"),
    ("compensation", "Confidential-tier concept: salary/bonus"),
    ("banking", "Confidential-tier concept: bank account"),
    ("salary", "Confidential-tier concept: pay"),
    ("bonus", "Confidential-tier concept: variable pay"),
    ("iban", "Confidential-tier field: bank account number"),
    (
        "bic",
        "Confidential-tier field: bank identifier code; only match whole word",
    ),
    ("account_holder", "Confidential-tier field: bank account owner"),
    ("reason_encrypted", "GDPR Art. 9: medical-implied leave reason"),
    ("protected_status", "GDPR Art. 9: union/health/protected category"),
    ("protected_status_encrypted", "GDPR Art. 9: encrypted category column"),
)


BACKEND_ROOT = Path(__file__).parent.parent
AI_TOOLS_GLOB = "app/features/*/ai_tools.py"
PROMPTS_ROOT = BACKEND_ROOT / "app" / "ai" / "prompts"
EVALS_ROOT = BACKEND_ROOT / "app" / "ai" / "evals"


def _compiled_patterns() -> list[tuple[re.Pattern[str], str]]:
    return [
        (re.compile(rf"\b{re.escape(needle)}\b", re.IGNORECASE), reason)
        for needle, reason in BANNED_PATTERNS
    ]


def _scan_text(label: str, text: str) -> list[str]:
    findings: list[str] = []
    for pattern, reason in _compiled_patterns():
        for match in pattern.finditer(text):
            line_no = text.count("\n", 0, match.start()) + 1
            findings.append(
                f"{label}:{line_no}: banned identifier "
                f"{match.group(0)!r} ({reason})"
            )
    return findings


@pytest.fixture(autouse=True)
def _fresh_registry() -> None:
    registry.reset_for_tests()
    registry.ensure_loaded()


def test_ai_tools_source_has_no_banned_identifiers() -> None:
    """Scan the literal source of every feature's ai_tools.py. Catches
    stray references in docstrings, Field descriptions, and dead code
    that a schema-only scan would miss."""
    findings: list[str] = []
    tool_files = sorted(BACKEND_ROOT.glob(AI_TOOLS_GLOB))
    assert tool_files, "no ai_tools.py files found; test scope is empty"
    for path in tool_files:
        findings.extend(
            _scan_text(
                str(path.relative_to(BACKEND_ROOT)),
                path.read_text(encoding="utf-8"),
            )
        )
    assert not findings, (
        "Confidential-tier identifiers leaked into AI tool source "
        f"(see specs/AI_FEATURES.md section 9.1):\n" + "\n".join(findings)
    )


def test_tool_json_schemas_have_no_banned_identifiers() -> None:
    """Pydantic ``model_json_schema`` is exactly what we feed Gemini as
    the tool-call descriptor. A field whose name or description names a
    Confidential-tier column would hand the LLM a loaded gun: it could
    request the column back, or leak the name into prompt history."""
    findings: list[str] = []
    for spec in registry.all_tools():
        in_schema = json.dumps(spec.input_schema.model_json_schema())
        findings.extend(_scan_text(f"tool:{spec.name}.input", in_schema))
        if spec.output_schema is not None:
            out_schema = json.dumps(spec.output_schema.model_json_schema())
            findings.extend(_scan_text(f"tool:{spec.name}.output", out_schema))
    assert not findings, (
        "Confidential-tier identifiers leaked into tool JSON schemas "
        f"(see specs/AI_FEATURES.md section 9.1):\n" + "\n".join(findings)
    )


def test_prompt_templates_have_no_banned_identifiers() -> None:
    """Every Jinja template under backend/app/ai/prompts is rendered
    into the system prompt before Gemini sees it. A template that
    names a Confidential-tier table is a violation even if no runtime
    data is substituted."""
    if not PROMPTS_ROOT.exists():
        pytest.skip("prompts directory not provisioned yet")
    jinja_files = sorted(PROMPTS_ROOT.rglob("*.jinja"))
    findings: list[str] = []
    for path in jinja_files:
        findings.extend(
            _scan_text(
                str(path.relative_to(BACKEND_ROOT)),
                path.read_text(encoding="utf-8"),
            )
        )
    assert not findings, (
        "Confidential-tier identifiers leaked into prompt templates "
        f"(see specs/AI_FEATURES.md section 9.1):\n" + "\n".join(findings)
    )


def test_eval_fixtures_have_no_banned_identifiers() -> None:
    """Eval examples are synthetic per spec 10.3, but the guard is
    worth running anyway: a copy-paste from a real ticket could still
    drag in a Confidential-tier column. This keeps the synthetic
    promise honest."""
    if not EVALS_ROOT.exists():
        pytest.skip("evals directory not provisioned yet")
    jsonl_files = sorted(EVALS_ROOT.rglob("*.jsonl"))
    findings: list[str] = []
    for path in jsonl_files:
        findings.extend(
            _scan_text(
                str(path.relative_to(BACKEND_ROOT)),
                path.read_text(encoding="utf-8"),
            )
        )
    assert not findings, (
        "Confidential-tier identifiers leaked into AI eval fixtures "
        f"(see specs/AI_FEATURES.md section 9.1):\n" + "\n".join(findings)
    )
