from app.core.feature_registry import registry

registry.register(
    "clients",
    description="clients feature module (skeleton; implemented in later phase).",
    default_enabled=True,
)
