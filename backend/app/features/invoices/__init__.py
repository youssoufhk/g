from app.core.feature_registry import registry

registry.register(
    "invoices",
    description="invoices feature module (skeleton; implemented in later phase).",
    default_enabled=True,
)
