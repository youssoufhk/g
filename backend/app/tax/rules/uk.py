"""UK VAT rules.

Skeleton only. The Phase 5 invoicing feature fills in:
    * standard rate 20%, reduced 5%, zero 0%
    * reverse charge for services supplied to EU businesses (post-Brexit)
    * Making Tax Digital (MTD) flag for HMRC submissions
"""

from decimal import Decimal

from app.tax.calculator import TaxComputation, TaxLine


class UKTaxRule:
    country_code = "GB"

    def compute(
        self,
        *,
        subtotal_minor_units: int,
        currency: str,
        seller_country: str,
        buyer_country: str,
        buyer_vat_registered: bool,
    ) -> TaxComputation:
        if buyer_country.upper() != "GB":
            return TaxComputation(
                subtotal_minor_units=subtotal_minor_units,
                lines=[
                    TaxLine(
                        name="VAT (reverse charge, place of supply outside UK)",
                        rate=Decimal("0.00"),
                        amount_minor_units=0,
                        reverse_charge=True,
                    )
                ],
            )
        vat = int(round(subtotal_minor_units * 0.20))
        return TaxComputation(
            subtotal_minor_units=subtotal_minor_units,
            lines=[TaxLine(name="VAT 20%", rate=Decimal("0.20"), amount_minor_units=vat)],
        )
