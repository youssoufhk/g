from app.core.feature_registry import registry

registry.register(
    "employees",
    description="employees feature module (skeleton; implemented in later phase).",
    default_enabled=True,
)
