"""Gamma operations library.

A standalone package that wraps GCP, Cloudflare, and tenant operations in
deterministic, idempotent, typed Python functions. Skills, agents, and humans
all call these functions instead of re-implementing vendor SDK calls.

This package is intentionally decoupled from the Gamma backend (`backend/app/`).
It never imports from the app, and the app never imports from it. Both read
the same environment variables (or `.env` files) for configuration.

See README.md for the full operation catalog and design principles.
"""

__version__ = "0.1.0"
__all__ = ["__version__"]
