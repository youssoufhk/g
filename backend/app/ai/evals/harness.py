"""AI eval harness (layer 4 of docs/TESTING_STRATEGY.md).

Each feature that uses AI (month-end close, command palette, receipt OCR,
insight cards) ships with a JSONL file of golden examples. The harness
runs each example against the current ``AIClient``, scores the response
with a per-feature validator, and fails the build if the pass rate drops
below the threshold.

Usage:
    pytest backend/tests/ai_evals -q --runslow

This skeleton provides the shape only. Real validators and golden
examples land per feature in Phase 3-5.
"""

import json
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass
class EvalExample:
    name: str
    prompt: str
    expected: dict[str, Any]


@dataclass
class EvalResult:
    passed: int
    failed: int
    total: int
    failures: list[str]

    @property
    def pass_rate(self) -> float:
        return self.passed / self.total if self.total else 0.0


def load_examples(path: Path) -> list[EvalExample]:
    examples: list[EvalExample] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        data = json.loads(line)
        examples.append(
            EvalExample(
                name=data["name"],
                prompt=data["prompt"],
                expected=data.get("expected", {}),
            )
        )
    return examples


async def run_evals(
    examples: list[EvalExample],
    run_one: Callable[[EvalExample], Any],
    validate: Callable[[EvalExample, Any], bool],
) -> EvalResult:
    passed = 0
    failures: list[str] = []
    for example in examples:
        result = await run_one(example)
        if validate(example, result):
            passed += 1
        else:
            failures.append(example.name)
    total = len(examples)
    return EvalResult(
        passed=passed, failed=total - passed, total=total, failures=failures
    )
