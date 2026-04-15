from app.core.feature_registry import registry

registry.register(
    "imports",
    description="CSV import pipeline for onboarding + ongoing data ingestion.",
    default_enabled=True,
)
