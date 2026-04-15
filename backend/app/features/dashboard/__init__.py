from app.core.feature_registry import registry

registry.register(
    "dashboard",
    description="dashboard feature module (skeleton; implemented in later phase).",
    default_enabled=True,
)
