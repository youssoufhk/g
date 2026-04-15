from app.core.feature_registry import registry

registry.register(
    "imports",
    description="imports feature module (skeleton; implemented in later phase).",
    default_enabled=True,
)
