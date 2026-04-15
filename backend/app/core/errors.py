"""Typed application errors.

Every error that exits through the API goes through one of these classes.
The global exception handler in ``main.py`` maps them to HTTP responses with
the appropriate status code and a stable error code.
"""


class GammaError(Exception):
    """Base class for every application error."""

    http_status: int = 500
    code: str = "internal_error"

    def __init__(self, message: str = "") -> None:
        super().__init__(message or self.code)
        self.message = message or self.code


class ValidationFailed(GammaError):
    http_status = 422
    code = "validation_failed"


class Unauthorized(GammaError):
    http_status = 401
    code = "unauthorized"


class Forbidden(GammaError):
    http_status = 403
    code = "forbidden"


class NotFound(GammaError):
    http_status = 404
    code = "not_found"


class Conflict(GammaError):
    http_status = 409
    code = "conflict"


class PaymentRequired(GammaError):
    http_status = 402
    code = "payment_required"


class RateLimited(GammaError):
    http_status = 429
    code = "rate_limited"


class FeatureDisabled(GammaError):
    http_status = 404
    code = "feature_disabled"


class TenantResolutionError(GammaError):
    http_status = 400
    code = "invalid_tenant"
