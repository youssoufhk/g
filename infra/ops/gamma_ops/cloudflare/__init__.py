"""Cloudflare operation modules (DNS, WAF, Access).

Uses the Cloudflare REST API via httpx with the scoped token from OpsConfig.
"""

from __future__ import annotations

__all__ = ["dns", "waf", "access"]
