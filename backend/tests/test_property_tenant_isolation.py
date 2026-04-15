"""Property test for tenant isolation shape rules."""

import re

from hypothesis import given, settings
from hypothesis import strategies as st

from app.core.tenancy import is_valid_tenant_schema

_VALID = st.from_regex(re.compile(r"^t_[a-z0-9_]{1,48}$"), fullmatch=True)


@given(schema=_VALID)
@settings(max_examples=200)
def test_generated_valid_schemas_are_accepted(schema: str) -> None:
    assert is_valid_tenant_schema(schema)


_DANGEROUS_CHARS = "'\";- \n\r\t"


@given(
    suffix=st.text(alphabet=_DANGEROUS_CHARS, min_size=1, max_size=16),
)
@settings(max_examples=200)
def test_sql_injection_attempts_are_rejected(suffix: str) -> None:
    # Only a char set strictly outside [a-z0-9_] can reach this assertion,
    # so the regex must reject the concatenation.
    assert any(c in _DANGEROUS_CHARS for c in suffix)
    assert not is_valid_tenant_schema(f"t_acme{suffix}")
    assert not is_valid_tenant_schema(f"t_{suffix}abc")
