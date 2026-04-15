from app.core.security import (
    decode_access_token,
    hash_password,
    issue_access_token,
    verify_password,
)


def test_password_hash_round_trip() -> None:
    raw = "s3cret-p4ss!"
    hashed = hash_password(raw)
    assert hashed != raw
    assert verify_password(raw, hashed)
    assert not verify_password("wrong", hashed)


def test_jwt_audience_binding() -> None:
    token = issue_access_token(
        subject="user_123",
        audience="app",
        tenant_schema="t_acme",
    )
    claims = decode_access_token(token, audience="app")
    assert claims["sub"] == "user_123"
    assert claims["tenant_schema"] == "t_acme"
    assert claims["aud"] == "app"


def test_jwt_wrong_audience_rejected() -> None:
    from app.core.errors import Unauthorized

    token = issue_access_token(
        subject="user_123",
        audience="app",
        tenant_schema="t_acme",
    )
    try:
        decode_access_token(token, audience="ops")
    except Unauthorized:
        return
    raise AssertionError("expected Unauthorized when audience mismatches")
