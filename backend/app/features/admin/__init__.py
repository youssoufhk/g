from app.core.feature_registry import registry

registry.register(
    "admin",
    description="Operator console and admin surface. Always enabled.",
    default_enabled=True,
)
