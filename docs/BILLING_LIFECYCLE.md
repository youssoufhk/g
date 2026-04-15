# Billing Lifecycle

> **Who this is for.** The founder running billing operations in Phase 2-5. The engineer writing the state-transition code or the dunning Celery tasks. The auditor asking how a paid invoice becomes a refund.
> **Scope.** Subscription invoice state machine, tenant lifecycle states, dunning schedule, refund policy, custom contracts, Phase 2 manual invoicing path, Phase 5+ automated path, audit and compliance hooks.
> **Not in scope.** Tenant-to-client invoices (those are in `specs/DATA_ARCHITECTURE.md` §2.11 and ADR-006). Customer VAT handling for tenant-side invoicing (same).
> **Authority.** This runbook is the single source of truth for how a Gamma subscription invoice flows from draft to paid, and how a tenant flows from trial to terminated. If anything in `specs/DATA_ARCHITECTURE.md` §7, `docs/GO_TO_MARKET.md` §7, or ADR-006 conflicts with this doc, this doc wins and the other gets fixed.
> **Cross-references.** `specs/DATA_ARCHITECTURE.md` §7 (billing), §8.2 (retention), ADR-006 (PDF), ADR-001 (tenancy), `docs/DATA_RETENTION.md`, `docs/DEFERRED_DECISIONS.md` DEF-029 + DEF-030 + DEF-031 + DEF-059, `docs/GO_TO_MARKET.md` §7, `docs/runbooks/secrets-management.md` §5, `docs/COMPLIANCE.md` §2.

---

## 1. Scope and vocabulary

Two classes of invoice exist in Gamma. Do not confuse them.

1. **Subscription invoices.** Gamma bills the tenant. Stored in `public.subscription_invoices`. EUR only in v1.0 (DEF-030). Operated by the founder in the operator console. This doc covers this class only.
2. **Tenant invoices.** The tenant bills its own clients. Stored in `tenant_<slug>.invoices`. Multi-currency. Operated by the tenant admin in the main app. Covered by `specs/DATA_ARCHITECTURE.md` §2.11 and ADR-006.

"Invoice" in the rest of this doc means subscription invoice unless stated otherwise.

Actor vocabulary:

- **Operator.** A Gamma employee (founder or co-founder) with access to the operator console at `ops.gammahr.com`. Can create, send, and transition most invoices.
- **Founder.** The DPO and commercial lead. Holds exclusive authority over refunds and custom-contract countersignature. Refund authority does not pass to the co-founder; this is deliberate.
- **Tenant admin.** The customer-side user. Can view billing status. Cannot transition invoices.

---

## 2. The subscription invoice state machine

States on `public.subscription_invoices.status`:

```
    draft
      |
      | operator sends
      v
    sent ----------------+
      |                  |
      | payment          | operator voids
      v                  v
    paid             voided
      |                  ^
      | refund           |
      v                  |
    refunded ------------+
```

### 2.1 State definitions

| State | Meaning | Created by | Mutable by |
|---|---|---|---|
| `draft` | Line items and totals entered. PDF not yet rendered. Not sent to customer. | Operator (manual Phase 2) or month-end close agent (auto-draft) | Operator |
| `sent` | PDF rendered, email dispatched, awaiting payment. | Operator | Operator |
| `paid` | Payment recorded in the operator console. | Operator | Founder only (7-day dispute window) |
| `voided` | Cancelled. Number is not reused. | Operator | Nobody (immutable) |
| `refunded` | Previously paid, money returned. Linked to a credit note. | Founder | Nobody (immutable) |

### 2.2 Allowed transitions

| From | To | Who | Triggers |
|---|---|---|---|
| `draft` | `sent` | Operator | WeasyPrint render, email via Workspace SMTP Relay, audit row, `sent_at` set |
| `draft` | (hard delete) | Operator | Allowed only while in draft. Logged. |
| `sent` | `paid` | Operator | Record `payment_method`, `payment_reference`, `paid_at`, audit row, notification to tenant admin |
| `sent` | `voided` | Operator | Reason required, audit row, tenant admin notified, customer never owes |
| `paid` | `voided` | Founder | Refund scenario. Written customer request. Two audit rows: void + new credit note. Funds must be returned in the same week. |
| `paid` | `refunded` | Founder | Alternative terminal state when a credit note is issued instead of a void. Written customer request. Audit row. Funds returned. |

Every other transition is forbidden at the service layer and blocked at the database level by a check constraint. Any attempt raises HTTP 409 with body `{"error": {"code": "INVALID_INVOICE_TRANSITION", "from": "...", "to": "..."}}`.

### 2.3 Immutability window

`paid` and `voided` rows are immutable for 7 days (dispute grace period). Within 7 days the operator can correct a typo in `payment_reference` or `notes` via an operator-console edit that writes a second audit row. After 7 days, only the founder can edit, and only via the break-glass flow documented in `docs/runbooks/secrets-management.md` §7.

### 2.4 Side effects per transition

- **`draft -> sent`:** render PDF via WeasyPrint, store in GCS `gammahr-prod-subscription-invoices/`, email customer billing contact, write `audit_log` row `subscription_invoice.sent`, increment `public.invoice_sequences` for Gamma's own issuer entity (Global Gamma Ltd), post a row to the accounting ledger (Phase 2: an OpenBSD/ledger CSV export; Phase 5+: automated accounting API).
- **`sent -> paid`:** record payment, notify tenant admin by email, write `audit_log` row `subscription_invoice.paid`, update tenant `lifecycle_state` from `past_due` back to `active` if applicable.
- **`sent -> voided`:** notify tenant admin, write `audit_log` row `subscription_invoice.voided` with reason string, leave the invoice number in place (French legal requirement, sequential gap-free).
- **`paid -> voided`:** issue credit note with a new invoice number referencing `parent_invoice_id`, refund the customer via the original payment method, write two `audit_log` rows (void + credit note issuance), founder signs the credit-note PDF.
- **`paid -> refunded`:** same as `paid -> voided` except the terminal state is `refunded` (indicates money was returned without disputing the original sale).

### 2.5 Sequential numbering

Subscription invoices use the gapless sequential numbering scheme defined in ADR-006 and enforced by `public.invoice_sequences`. Voided numbers are never reused. Refunded rows keep their original number and are linked via `parent_invoice_id` to the credit note's number. The sequence is per-year, resetting every January 1.

---

## 3. Tenant lifecycle states

Canonical source: `specs/DATA_ARCHITECTURE.md` §7.4 (`tenants.lifecycle_state` enum). Do not invent new states in application code.

```
trial -> active -> past_due -> read_only -> suspended -> deleted
            ^          |           |           |
            |          |           |           |
            +----------+-----------+-----------+   (payment resolved restores to active)
```

### 3.1 State table

| State | Meaning | UI shown to customer | App allows | App blocks |
|---|---|---|---|---|
| `trial` | Pilot window, 60 days. No money changed hands yet. | Blue banner "Pilot, X days remaining" | Everything | Nothing |
| `active` | Paying customer, invoice up to date. | No banner | Everything | Nothing |
| `past_due` | Invoice issued but not paid within due-date + 1 day. | Yellow banner "Invoice #NNN unpaid, please pay by <date>" | Everything | Nothing (full access during days 1-7) |
| `read_only` | Invoice unpaid 8+ days past due. | Red banner "Read-only mode, contact billing" | Reads, exports, downloads | All writes return HTTP 503 with `BILLING_READONLY` |
| `suspended` | Invoice unpaid 30+ days past due. | Login blocked, message "Account suspended, contact billing" | Owner login only, for payment + export | All tenant-user logins, all API calls |
| `deleted` | 60+ days past due. `DROP SCHEMA tenant_<slug> CASCADE` executed. Legal-hold archive keeps invoice headers for 10 years. | Login error "Account does not exist" | Nothing | Everything |

A sixth conceptual state, **exported**, is not a `lifecycle_state` enum value. It is a flag on the operator console tenant detail page indicating that a data export zip was delivered to the customer before deletion. Retention of the exported zip is 30 days in a signed-URL GCS bucket, then hard delete.

### 3.2 Transition triggers

| From | To | Trigger | Actor |
|---|---|---|---|
| `trial` | `active` | First subscription invoice marked paid | Operator |
| `trial` | `deleted` | Trial expires without payment. 30-day grace, then hard delete. | System (Celery) |
| `active` | `past_due` | Invoice due date passes without payment | System (daily Celery job) |
| `past_due` | `read_only` | 8 days past due | System (daily Celery job) |
| `read_only` | `suspended` | 30 days past due | System (daily Celery job) |
| `suspended` | `deleted` | 60 days past due. 30-day export window handled between day 60 and day 90. | System (daily Celery job) |
| `past_due` / `read_only` / `suspended` | `active` | Payment recorded on any outstanding invoice | Operator |

Every transition writes `audit_log` with `event_type = 'tenant.lifecycle_state_change'` and the before/after state. Transitions are idempotent: running the daily job twice gives the same result.

### 3.3 Grace periods (locked, do not change without founder approval)

- **Trial to deletion:** 30 days grace after trial ends.
- **Past due to read-only:** 7 days.
- **Read-only to suspended:** 22 days (day 30 from due date).
- **Suspended to deletion:** 30 days (day 60 from due date).
- **Deletion to hard purge:** 30 days during which the data export zip is available to the customer. Day 90 the tenant schema is dropped and the GCS zip is deleted.

Total window from missed payment to irreversible data loss: **90 days**. Customers are notified at every transition.

### 3.4 Middleware enforcement

Every backend write path calls `check_lifecycle_state(tenant_id)` at the start of the request. The middleware reads `tenants.lifecycle_state` from a 30-second cached lookup (Redis). A write against a `read_only` tenant returns HTTP 503 with `{"error": {"code": "BILLING_READONLY", "tenant_state": "read_only", "resolve_at": "billing.gammahr.com"}}`. A write against a `suspended` tenant returns HTTP 403 with `BILLING_SUSPENDED`. Background jobs check the same flag and skip suspended tenants with a structured log entry.

---

## 4. Dunning schedule

Every stage runs automatically via a daily Celery task `dunning.run_cycle()` at 09:00 Europe/Paris. The task reads `public.subscription_invoices` where `status = 'sent'`, computes days past due, and dispatches emails through Workspace SMTP Relay.

### 4.1 The schedule

| Day | Stage | Action | Template | CC |
|---|---|---|---|---|
| Due date | Reminder 0 | Friendly payment reminder sent same day the invoice is due. | `dunning-0.friendly-reminder` | None |
| +1 | Reminder 1 | Tenant enters `past_due`. Friendly second notice. | `dunning-1.first-notice` | None |
| +7 | Reminder 2 | Firm notice. Mentions read-only mode coming in 1 day. | `dunning-2.firm-notice` | founder@gammahr.com |
| +8 | Read-only triggered | Tenant flips to `read_only`. Banner appears in app. System email, not dunning email. | `tenant.readonly-enabled` | founder@gammahr.com |
| +14 | Reminder 3 | Final notice with legal language. Payment deadline stated. | `dunning-3.final-notice` | founder@gammahr.com, legal@gammahr.com |
| +30 | Suspension triggered | Tenant flips to `suspended`. Login blocked. | `tenant.suspended` | founder@gammahr.com |
| +60 | Deletion notice | Tenant flips to `deleted`. Export zip prepared. 30-day export window begins. | `tenant.deletion-notice` | founder@gammahr.com |
| +90 | Export window ends | Data export zip hard-deleted. Tenant schema dropped. Final `audit_log` row written to `public` schema. | `tenant.data-purged` | founder@gammahr.com, legal@gammahr.com |

### 4.2 Template storage

All dunning email templates live in `backend/app/features/billing/templates/` as Jinja files. Each template has an EN and FR version. Rendering uses the customer's `billing_contact_language` field, defaulting to EN if unset. Templates comply with the CLAUDE.md style rules (no em dashes, no banned terminology).

### 4.3 Delivery path

**Phase 2 (customers 1-5):** Workspace SMTP Relay. Founder monitors bounces manually in the operator console. Failed deliveries raise an alert to ops@gammahr.com within 15 minutes.

**Phase 5+ (DEF-029, customers 6+):** Stripe or Revolut webhook events replace the Celery-based dunning. `invoice.payment_failed` webhook triggers the same template pipeline via a new event handler in `backend/app/features/billing/webhooks.py`. The Celery fallback stays in place for non-automated customers until full migration.

### 4.4 Pause and resume

Dunning can be paused for a specific tenant (e.g., dispute under negotiation) by setting `tenants.dunning_paused_until = <date>` in the operator console. All dunning emails and lifecycle-state transitions skip the tenant during the pause. The pause is capped at 30 days; longer pauses require founder sign-off and a second pause. Every pause writes an audit row.

---

## 5. Refund policy

Two rules, in priority order.

1. **14-day refund window.** From the date the initial annual invoice is paid. Full refund, no questions asked, within 14 days. Same as the standard trial period. Covered by the terms of service and published on the pricing page.
2. **Beyond 14 days: pro-rated credit only.** No cash refunds on annual contracts. If a customer leaves mid-year, they may request a pro-rated credit toward a future invoice in writing. The founder may approve at discretion. The credit has no expiry but is non-transferable and non-assignable.

### 5.1 Who can approve

**Founder only.** Refund authority does not pass to the co-founder, the ops engineer, or anyone else. If the founder is unreachable for more than 5 business days and a refund is in flight, the co-founder can extend the customer's subscription by the disputed amount as an interim concession, but the cash refund waits for the founder.

### 5.2 Procedure

1. **Customer submits request in writing** to billing@gammahr.com. Verbal requests are not accepted.
2. **Operator logs the request** in the operator console as a `refund_request` row. Status starts `pending`.
3. **Founder reviews** within 5 business days. Approval or decline. Decline requires a written reason to the customer.
4. **On approval:**
   a. Operator marks the original invoice `paid -> voided` (or `paid -> refunded` if the customer wants a credit note without disputing the original sale).
   b. Operator issues a credit note via the operator console. The credit note is a new `subscription_invoices` row with a negative total, its own sequential number, and `parent_invoice_id` set to the refunded invoice.
   c. Operator executes the refund via the original payment rail. Wire or SEPA refunds go through Revolut Business; card refunds (Phase 5+) go through the payment processor's refund API.
   d. Operator emails the customer with the credit note PDF and the refund reference.
5. **Audit:** every step writes an `audit_log` row. The final audit row links the original invoice, the void, the credit note, and the payment refund reference in one bundle for traceability.
6. **Accounting:** a month-end reconciliation matches every voided or refunded invoice against the bank statement. Discrepancies are escalated to the founder.

### 5.3 What refunds do not do

- They do not automatically close the customer account. Account closure is a separate transition requested by the customer or triggered by unpaid follow-up invoices.
- They do not automatically prorate future invoices. Future invoices are generated from `tenant_custom_contracts` or `list_tier` fields; a refund does not alter either.
- They do not free up grandfathered pricing. A customer who gets a refund and returns later signs a new contract at then-current list pricing.

---

## 6. Custom contracts

Canonical source: `specs/DATA_ARCHITECTURE.md` §7.2 and the `public.tenant_custom_contracts` schema.

Custom contracts are the override path for tenants whose pricing does not match the list card. Three scenarios:

1. **Grandfathered pilots.** The first 5 paying customers are locked at Phase 2 rate-card pricing for 3 years, regardless of seat growth. See `docs/GO_TO_MARKET.md` §2.
2. **Enterprise tier.** Negotiated annual lump sum with custom SSO, custom SLA, dedicated support engineer, early access to v1.1 features. Typical deal size starts at €100k ACV.
3. **Non-EUR billing (DEF-030).** Deferred in v1.0. When it ships, GBP and USD contracts use `tenant_custom_contracts.currency`, and the subscription invoice is rendered in the contract currency.

### 6.1 Creation procedure

1. **Founder negotiates the deal** in written form (email trail or countersigned PDF).
2. **Both founders countersign.** This is a hard requirement. A custom contract without both signatures is void.
3. **Operator creates the row** in `public.tenant_custom_contracts`. Fields: `annual_fee_cents`, `currency`, `billing_interval`, `included_seats`, `overage_rate_cents`, `contract_start`, `contract_end`, `signed_pdf_url`.
4. **Signed PDF is uploaded** to `gammahr-legal-archive/contracts/<tenant_slug>/<contract_id>.pdf` with retention lock.
5. **Audit row** is written with event type `custom_contract.created`, actor_id of both founders.
6. **Tenant `pricing_model` is flipped** to `custom`. The subscription invoice calculation now branches on this flag and reads from `tenant_custom_contracts` instead of list pricing.

### 6.2 Amendment procedure

Amendments to an existing custom contract follow the same countersignature rule. A new row replaces the old (the old is not deleted; `contract_end` is set). The operator console surfaces the amendment history on the tenant detail page.

### 6.3 What custom contracts cannot override

- **Legal retention windows.** A custom 15-year retention override is allowed (financial-services customers routinely require this) but a retention window shorter than the legal minimum is not. The retention sweep job enforces `MAX(default, contract)`, never MIN.
- **GDPR DSR obligations.** No custom contract can waive a data subject's rights under Articles 15-21.
- **Invoice legal fields.** French and UK invoices still carry the mandatory fields in `docs/COMPLIANCE.md` §5 regardless of custom-contract terms.

---

## 7. Phase 2 manual invoicing path

For customers 1-5 before DEF-029 (payment processor integration) ships. Budgeted at 1 hour per invoice.

### 7.1 The sequence

1. **Month-end close agent drafts the invoice** from the tenant's seat count, pricing tier, and any custom-contract overrides. Draft row created in `public.subscription_invoices` with `status = 'draft'`. See `specs/AI_FEATURES.md` §2.
2. **Founder reviews the draft** in the operator console review queue. Edits line items, totals, due date, notes if needed.
3. **Founder clicks Send.** Backend triggers `subscription_invoice.send(invoice_id)` which:
   a. Renders the PDF via WeasyPrint using the Jinja template in `backend/app/features/billing/templates/subscription_invoice.jinja`.
   b. Stores the PDF in `gammahr-prod-subscription-invoices/` GCS bucket (CMEK-encrypted per ADR-005).
   c. Emails the customer billing contact via Workspace SMTP Relay with the PDF attached.
   d. Writes `audit_log` row `subscription_invoice.sent`.
   e. Transitions the row to `status = 'sent'`.
4. **Customer pays** via wire transfer or SEPA Direct Debit. The customer uses the payment reference printed on the invoice (format: `GAMMA-YYYY-NNNNNN`).
5. **Founder marks paid** in the operator console after confirming the bank statement match. Backend transitions the row to `status = 'paid'`, notifies the tenant admin, and triggers `tenants.lifecycle_state = 'active'` if the tenant was in `past_due` or `read_only`.

### 7.2 Target timing

- Draft to send: under 15 minutes for a routine renewal, up to 1 hour for a custom-contract first-year invoice.
- Send to paid: 30 days net (standard B2B payment term). French customers average 21 days, UK customers average 28 days. Track the average in the operator console dashboard.

### 7.3 Known limitations

- **No self-serve billing portal.** Customers cannot update payment method online, view past invoices online, or download receipts online. They get PDFs via email. Self-serve portal is deferred per DEF-059.
- **No automated bank reconciliation.** The founder eyeballs the bank statement and marks invoices paid. Tolerable at 5 customers, painful at 10.
- **No card payment.** Wire and SEPA only. Card payment arrives with DEF-029.
- **No automatic dunning escalation via Stripe/Revolut webhooks.** The Celery-based dunning runs daily and dispatches emails, but the underlying bank rail does not notify Gamma on payment success; the founder confirms manually.

---

## 8. Phase 5+ automated path

Triggered when customer 5 to 10 signs OR when manual billing exceeds 2 hours per week for the founder, whichever comes first. The choice between Stripe, Revolut, and Paddle is deferred to DEF-029 and reassessed at trigger time.

### 8.1 Candidate comparison (at trigger time, re-evaluate)

| Candidate | Pros | Cons | Fee ballpark |
|---|---|---|---|
| **Stripe Billing** | Full subscription product, mature DPA, EU-resident, best developer tooling, strong webhook reliability | Per-transaction fees, requires OSS VAT registration via Stripe Tax add-on | 1.5% EU card + €0.25 per transaction |
| **Revolut Business Merchant Acquiring** | Founder already has a Revolut business account, lower fees on EU cards, same banking relationship | No native subscription product, requires custom subscription logic in Gamma or a thin wrapper | ~1% EU card |
| **Paddle** | Merchant of record (eliminates EU VAT handling for Gamma entirely), handles chargebacks, handles dunning | Higher fees, some customers resist the merchant-of-record model | ~5% + €0.50 per transaction |

Do not pick before the trigger. Do not re-discuss before the trigger.

### 8.2 Webhook handling

When the automated path ships, the backend exposes `POST /api/v1/billing/webhooks/<provider>` endpoints. Each provider has its own verifier (HMAC signature check on the request body).

Events handled:

| Event | Action |
|---|---|
| `invoice.payment_succeeded` | Transition `subscription_invoices.status` from `sent` to `paid`, update `tenants.lifecycle_state` to `active` if applicable, write audit row, notify tenant admin. |
| `invoice.payment_failed` | Start or advance the dunning cycle. Write audit row. Email tenant billing contact via branded Workspace SMTP Relay template (not the provider's generic template). |
| `customer.subscription.deleted` | Transition `tenants.lifecycle_state` to `read_only` immediately, start the 60-day deletion countdown, email tenant admin with export instructions. |
| `charge.refunded` | Transition the linked invoice to `refunded`, write audit row, notify tenant admin. |
| `customer.updated` | Sync billing contact email to `tenants.billing_contact_email`. Write audit row. |

Every webhook handler is idempotent: the same event delivered twice produces the same final state. Idempotency keys are stored in `public.idempotency_keys`.

### 8.3 Migration plan for customers 1-5

At trigger time, the founder migrates each Phase 2 customer in sequence:

1. **Communication.** Email the customer two weeks in advance with the new billing flow, the new payment methods (card added), and a link to update their billing contact.
2. **Create the provider customer record** with existing invoice history imported (metadata only, no PDFs re-sent).
3. **Flip `tenants.billing_provider` from `manual` to `<stripe|revolut|paddle>`.** Next invoice generation uses the provider path.
4. **Grandfathered pricing is preserved** via the custom-contract table. The provider sees the negotiated amount, not the list tier.
5. **Verify** with a small test charge (1 EUR refundable) before the first real invoice.

### 8.4 Fallback

Even after migration, the manual path stays operational indefinitely as a break-glass fallback. If the provider has an outage during a billing run, the founder can switch the tenant back to `billing_provider = 'manual'` and run one invoice cycle by hand. The fallback path is drilled semi-annually on staging.

---

## 9. Audit and compliance

Every subscription invoice transition writes exactly one `audit_log` row with:

- `actor_type = 'operator'` or `'founder'`
- `actor_id`
- `entity_type = 'subscription_invoice'`
- `entity_id = <invoice_id>`
- `event_type` (one of `draft`, `sent`, `paid`, `voided`, `refunded`, `draft_deleted`, `edit_after_send`)
- `before_json` and `after_json` holding the row state
- `created_at` in UTC
- `ip_address` and `user_agent` of the operator

Every refund writes two audit rows: the `void` of the original and the new credit-note `issued` event. The two rows share a `correlation_id` so they can be joined for reconciliation.

### 9.1 Retention

Subscription invoice rows and their PDFs are retained **10 years** per French Code général des impôts article L.102 B LPF, applied to Gamma as a French (or UK-registered, see below) legal entity. Audit log rows for billing events are retained 10 years (the same window) to keep the audit trail complete.

Gamma's legal entity is Global Gamma Ltd (UK) per `docs/GO_TO_MARKET.md` §11. UK fiscal retention is 6 years per HMRC, but Gamma chooses the longer 10-year window to stay compatible with French customers and French-originated audit requirements. The retention window is stored as a constant in `backend/app/features/billing/retention.py` and referenced by `docs/DATA_RETENTION.md`.

### 9.2 Legal hold

A subscription invoice can be placed on legal hold via the operator console break-glass flow. Placed rows are copied to `gammahr-legal-archive/` GCS bucket with retention lock, and `subscription_invoices.legal_hold = true` is set on the source. The retention sweep job skips held rows. See `docs/COMPLIANCE.md` §8 and `docs/DATA_RETENTION.md` §4 for the full procedure.

### 9.3 Cross-tenant operator actions

When an operator runs billing actions that span multiple tenants (e.g., a bulk dunning cycle), each tenant gets its own audit row. There is no aggregated "bulk" row. This preserves per-tenant traceability for GDPR DSR exports.

### 9.4 Reconciliation with the bank

A monthly job runs on the first business day of the month. It reads the Revolut Business transaction export and matches every incoming payment against a `subscription_invoices` row by `payment_reference`. Unmatched incoming payments raise an alert to ops@gammahr.com within 15 minutes. Matched payments that were already marked paid manually are no-ops.

---

## 10. Cross-references

- `specs/DATA_ARCHITECTURE.md` §7 (subscription invoices, custom contracts, tenant lifecycle state machine, dunning)
- `specs/DATA_ARCHITECTURE.md` §8.2 (retention; legal citations)
- `specs/AI_FEATURES.md` §2 (month-end close agent that drafts subscription invoices)
- `specs/APP_BLUEPRINT.md` §8 (month-end close UX)
- `docs/GO_TO_MARKET.md` §2 (pricing, grandfathered pilots), §7 (billing infrastructure two-phase)
- `docs/decisions/ADR-001-tenancy.md` (tenant schema, `DROP SCHEMA` on deletion)
- `docs/decisions/ADR-005-storage.md` (CMEK on `gammahr-prod-subscription-invoices`, legal-hold bucket)
- `docs/decisions/ADR-006-pdf.md` (WeasyPrint, PDF/A-1b, sequential numbering, invoice legal fields)
- `docs/decisions/ADR-008-deployment.md` (Cloud Run, webhook exposure, Secret Manager for provider keys)
- `docs/COMPLIANCE.md` §2 (retention table), §5 (invoice legal fields), §8 (legal hold)
- `docs/DATA_RETENTION.md` (per-entity retention matrix, sweep job)
- `docs/DEFERRED_DECISIONS.md` DEF-029 (payment processor), DEF-030 (multi-currency), DEF-031 (multi-year contracts), DEF-059 (self-serve billing portal)
- `docs/ROLLBACK_RUNBOOK.md` (incident procedures for billing webhook outages)
- `docs/runbooks/secrets-management.md` §5 (runtime secret handling for provider API keys)
