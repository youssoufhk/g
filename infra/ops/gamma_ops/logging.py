"""Structured JSON logging for the Gamma ops library.

Every operation logs entry, success, and failure to stdout in JSON. The log
stream is designed to be piped into Cloud Logging or any log aggregator that
understands JSON lines.
"""

from __future__ import annotations

import logging
import sys
from typing import Any

import structlog


def setup_logging(level: str = "INFO") -> None:
    """Configure stdlib logging and structlog for JSON output.

    Purpose:
        One-call setup for the whole library. Called once at process start
        from `cli.main` or from tests via a fixture.

    Parameters:
        level: One of DEBUG, INFO, WARNING, ERROR, CRITICAL.

    Idempotency notes:
        Safe to call multiple times; the stdlib handler is reset each call.

    Example:
        >>> from gamma_ops.logging import setup_logging, get_logger
        >>> setup_logging("DEBUG")
        >>> log = get_logger(__name__)
        >>> log.info("starting", operation="create_bucket", name="gamma-prod-files")
    """
    log_level = getattr(logging, level.upper(), logging.INFO)

    # Reset stdlib root handlers so repeated calls do not duplicate output.
    root = logging.getLogger()
    for handler in list(root.handlers):
        root.removeHandler(handler)

    stream_handler = logging.StreamHandler(stream=sys.stdout)
    stream_handler.setLevel(log_level)
    root.setLevel(log_level)
    root.addHandler(stream_handler)

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso", utc=True),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(log_level),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str, **initial_values: Any) -> structlog.BoundLogger:
    """Return a bound structlog logger scoped to `name`.

    Parameters:
        name: Usually `__name__` of the calling module.
        initial_values: Optional key-value pairs bound to every event.

    Returns:
        A BoundLogger ready for structured calls.

    Example:
        >>> log = get_logger("gamma_ops.gcp.storage", component="storage")
        >>> log.info("bucket created", name="gamma-prod-files", region="europe-west9")
    """
    return structlog.get_logger(name).bind(**initial_values)
