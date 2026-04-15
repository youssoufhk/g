from app.core.feature_registry import registry

registry.register(
    "expenses",
    description="expenses feature module (skeleton; implemented in later phase).",
    default_enabled=True,
)
