"""Property tests for financial math invariants.

Layer 2 of docs/TESTING_STRATEGY.md. These run on every PR.
"""

from decimal import Decimal

import pytest
from hypothesis import given, settings
from hypothesis import strategies as st

from app.tax.calculator import build_default_calculator

pytestmark = pytest.mark.financial


@given(
    subtotal=st.integers(min_value=1, max_value=1_000_000_00),
)
@settings(max_examples=200, deadline=None)
def test_fr_domestic_vat_is_always_twenty_percent(subtotal: int) -> None:
    calc = build_default_calculator()
    out = calc.compute(
        seller_country="FR",
        buyer_country="FR",
        subtotal_minor_units=subtotal,
        currency="EUR",
        buyer_vat_registered=True,
    )
    assert len(out.lines) == 1
    assert out.lines[0].rate == Decimal("0.20")
    # Rounding may produce 1-cent differences at penny boundaries.
    assert abs(out.lines[0].amount_minor_units - round(subtotal * 0.20)) <= 1
    assert out.total_minor_units >= subtotal


@given(
    subtotal=st.integers(min_value=1, max_value=1_000_000_00),
    buyer_country=st.sampled_from(["DE", "BE", "NL", "ES", "IT"]),
)
@settings(max_examples=200, deadline=None)
def test_fr_intra_eu_b2b_reverse_charges(
    subtotal: int, buyer_country: str
) -> None:
    calc = build_default_calculator()
    out = calc.compute(
        seller_country="FR",
        buyer_country=buyer_country,
        subtotal_minor_units=subtotal,
        currency="EUR",
        buyer_vat_registered=True,
    )
    # Reverse charge never adds VAT to the total owed by the seller.
    assert out.total_minor_units == subtotal
    assert out.lines[0].reverse_charge is True


@given(
    subtotal=st.integers(min_value=1, max_value=1_000_000_00),
)
def test_uk_domestic_vat_total_equals_subtotal_plus_vat(subtotal: int) -> None:
    calc = build_default_calculator()
    out = calc.compute(
        seller_country="GB",
        buyer_country="GB",
        subtotal_minor_units=subtotal,
        currency="GBP",
        buyer_vat_registered=True,
    )
    assert out.total_minor_units == subtotal + out.lines[0].amount_minor_units
