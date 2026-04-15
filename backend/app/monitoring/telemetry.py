"""Telemetry wrapper (M1)."""

from dataclasses import dataclass
from typing import Protocol

from app.core.logging import get_logger


@dataclass
class Metric:
    name: str
    value: float
    tags: dict[str, str]


class TelemetryClient(Protocol):
    def record(self, metric: Metric) -> None: ...


class StdoutTelemetryClient:
    def __init__(self) -> None:
        self._log = get_logger("telemetry")

    def record(self, metric: Metric) -> None:
        self._log.info("metric", name=metric.name, value=metric.value, **metric.tags)


def get_telemetry() -> TelemetryClient:
    return StdoutTelemetryClient()
