"""Tax calculator wrapper (M1).

Country-specific VAT, reverse charge, and withholding rules live in
``app/tax/rules/<country>.py``. The registry dispatches by ISO-3166
alpha-2 code so adding a country is a single file addition.
"""

from dataclasses import dataclass
from decimal import Decimal
from typing import Protocol


@dataclass
class TaxLine:
    name: str
    rate: Decimal
    amount_minor_units: int
    reverse_charge: bool = False


@dataclass
class TaxComputation:
    subtotal_minor_units: int
    lines: list[TaxLine]

    @property
    def total_minor_units(self) -> int:
        return self.subtotal_minor_units + sum(
            line.amount_minor_units for line in self.lines if not line.reverse_charge
        )


class CountryTaxRule(Protocol):
    country_code: str

    def compute(
        self,
        *,
        subtotal_minor_units: int,
        currency: str,
        seller_country: str,
        buyer_country: str,
        buyer_vat_registered: bool,
    ) -> TaxComputation: ...


class TaxCalculator:
    def __init__(self) -> None:
        self._rules: dict[str, CountryTaxRule] = {}

    def register(self, rule: CountryTaxRule) -> None:
        self._rules[rule.country_code.upper()] = rule

    def compute(
        self,
        *,
        seller_country: str,
        buyer_country: str,
        subtotal_minor_units: int,
        currency: str,
        buyer_vat_registered: bool,
    ) -> TaxComputation:
        rule = self._rules.get(seller_country.upper())
        if rule is None:
            raise KeyError(f"no tax rule registered for {seller_country!r}")
        return rule.compute(
            subtotal_minor_units=subtotal_minor_units,
            currency=currency,
            seller_country=seller_country,
            buyer_country=buyer_country,
            buyer_vat_registered=buyer_vat_registered,
        )


def build_default_calculator() -> TaxCalculator:
    from app.tax.rules import fr, uk

    calc = TaxCalculator()
    calc.register(fr.FranceTaxRule())
    calc.register(uk.UKTaxRule())
    return calc
