"""Payment provider wrapper (M1).

v1.0 ships a manual invoicing path. Stripe is registered but not
activated until DEF-029 triggers at customer 5-10. ``NullPaymentProvider``
records intents in memory so the invoice lifecycle tests can run.
"""

from dataclasses import dataclass, field
from typing import Protocol


@dataclass
class PaymentIntent:
    id: str
    amount_minor_units: int
    currency: str
    status: str


class PaymentProvider(Protocol):
    async def create_intent(
        self,
        *,
        amount_minor_units: int,
        currency: str,
        customer_ref: str,
        metadata: dict[str, str],
    ) -> PaymentIntent: ...

    async def capture(self, *, intent_id: str) -> PaymentIntent: ...


class NullPaymentProvider:
    _next_id: int = 0
    intents: dict[str, PaymentIntent] = field(default_factory=dict)  # type: ignore[assignment]

    def __init__(self) -> None:
        self.intents = {}

    async def create_intent(
        self,
        *,
        amount_minor_units: int,
        currency: str,
        customer_ref: str,
        metadata: dict[str, str],
    ) -> PaymentIntent:
        NullPaymentProvider._next_id += 1
        intent = PaymentIntent(
            id=f"null_pi_{NullPaymentProvider._next_id}",
            amount_minor_units=amount_minor_units,
            currency=currency,
            status="requires_capture",
        )
        self.intents[intent.id] = intent
        return intent

    async def capture(self, *, intent_id: str) -> PaymentIntent:
        intent = self.intents[intent_id]
        intent.status = "succeeded"
        return intent


def get_provider() -> PaymentProvider:
    return NullPaymentProvider()
