"""Email sender wrapper (M1).

Dev uses Mailhog (SMTP on localhost:1025, UI on localhost:8025). Staging
and production will swap to the Workspace SMTP Relay when §3.11 runs.
"""

from dataclasses import dataclass
from email.message import EmailMessage
from typing import Protocol

import aiosmtplib


@dataclass
class OutgoingEmail:
    to: list[str]
    subject: str
    text_body: str
    html_body: str | None = None
    from_address: str | None = None


class EmailSender(Protocol):
    async def send(self, email: OutgoingEmail) -> None: ...


class MailhogEmailSender:
    """Sends via SMTP without authentication (Mailhog)."""

    def __init__(self, host: str, port: int, default_from: str) -> None:
        self._host = host
        self._port = port
        self._default_from = default_from

    async def send(self, email: OutgoingEmail) -> None:
        msg = EmailMessage()
        msg["From"] = email.from_address or self._default_from
        msg["To"] = ", ".join(email.to)
        msg["Subject"] = email.subject
        msg.set_content(email.text_body)
        if email.html_body is not None:
            msg.add_alternative(email.html_body, subtype="html")
        await aiosmtplib.send(msg, hostname=self._host, port=self._port)


class InMemoryEmailSender:
    """Unit-test stub. Stores sent emails on the instance for assertions."""

    def __init__(self) -> None:
        self.sent: list[OutgoingEmail] = []

    async def send(self, email: OutgoingEmail) -> None:
        self.sent.append(email)


def get_sender() -> EmailSender:
    from app.core.config import settings

    if settings.email_backend == "mailhog":
        return MailhogEmailSender(
            settings.smtp_host, settings.smtp_port, settings.smtp_from
        )
    if settings.email_backend == "memory":
        return InMemoryEmailSender()
    raise RuntimeError(
        f"real email backend not wired yet (§3.11): {settings.email_backend!r}"
    )
