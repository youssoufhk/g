from app.core.feature_registry import registry

registry.register(
    "auth",
    description="Authentication (password, OIDC, passkey, MFA). Cannot be disabled.",
    default_enabled=True,
)
