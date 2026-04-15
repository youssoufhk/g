"""France VAT rules (TVA).

Skeleton only. The Phase 5 invoicing feature fills in:
    * intra-EU reverse charge for B2B outside France
    * standard rate 20%, reduced 10%, super-reduced 5.5% and 2.1%
    * TVA non applicable art. 293B (auto-entrepreneur exemption)
"""

from decimal import Decimal

from app.tax.calculator import TaxComputation, TaxLine


class FranceTaxRule:
    country_code = "FR"

    def compute(
        self,
        *,
        subtotal_minor_units: int,
        currency: str,
        seller_country: str,
        buyer_country: str,
        buyer_vat_registered: bool,
    ) -> TaxComputation:
        is_intra_eu_b2b = (
            buyer_country.upper() != "FR"
            and buyer_country.upper() in _EU_COUNTRIES
            and buyer_vat_registered
        )

        if is_intra_eu_b2b:
            return TaxComputation(
                subtotal_minor_units=subtotal_minor_units,
                lines=[
                    TaxLine(
                        name="TVA (autoliquidation, art. 283-2 CGI)",
                        rate=Decimal("0.20"),
                        amount_minor_units=0,
                        reverse_charge=True,
                    )
                ],
            )

        vat = int(round(subtotal_minor_units * 0.20))
        return TaxComputation(
            subtotal_minor_units=subtotal_minor_units,
            lines=[TaxLine(name="TVA 20%", rate=Decimal("0.20"), amount_minor_units=vat)],
        )


_EU_COUNTRIES = frozenset(
    {
        "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR",
        "GR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL",
        "PT", "RO", "SE", "SI", "SK",
    }
)
