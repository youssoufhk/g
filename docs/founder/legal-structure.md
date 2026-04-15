# Legal structure: UK Ltd with France-resident founders

> **Status.** Working setup, not yet validated by a French tax advisor. MUST be reviewed with a qualified professional before the first customer invoice goes out (target: before month 6).
>
> **Who this is for.** The two founders, their accountant, their lawyer. Also the founders' spouses and families who will ask "what are you even doing legally".
>
> **Not for.** Claude Code agents. Never loaded into an agent context. Founder reads this, agent does not.

---

## 1. The situation in one paragraph

Global Gamma Ltd is incorporated in the United Kingdom. Both co-founders are French tax residents (living in France, spending > 183 days per year in France, centre of vital interests in France). Gamma's customers will be based in France, the UK, and eventually across the EU. Billing is in EUR by default, in GBP or other currencies where the client requires it. This document answers: how do the founders get paid, who pays what taxes, and what must be done before the first revenue arrives to avoid surprises.

## 2. The chosen setup (default, defensible, widely used)

**Each founder registers in France as a `micro-entrepreneur`** (also called `auto-entrepreneur`, régime BNC for professional services). Each founder invoices Global Gamma Ltd monthly for "consulting services" (product design, software engineering, operations), as an independent contractor, not as an employee. Global Gamma Ltd pays the invoices in EUR from a UK bank account to the founders' French personal or professional bank accounts.

**Why this works:**

- Zero French payroll complexity. No URSSAF employer filings, no DSN, no bulletin de paie, no expensive French CDI employment contracts.
- Flat social charges in France (21.4% under BNC régime micro) applied to gross invoices. The founder handles declarations quarterly via the URSSAF auto-entrepreneur portal.
- UK Ltd treats the invoices as a cost of services. Standard expense line in the UK accounts, deductible against corporation tax.
- Invoices are in EUR, which matches your preference and simplifies bookkeeping.
- Legal and common. Thousands of French founders run UK or US holdings this way. French tax authorities understand the pattern.

**Annual ceiling per founder (2026):** €77,700 for BNC services. Each founder can invoice up to this amount before being forced out of the micro régime. Typical founder salary of €3,500/month x 12 = €42,000/year stays well under the ceiling for the first 18-24 months.

**What happens if a founder exceeds €77,700/year:** they move to the régime réel (real expenses and depreciation) and likely incorporate a French entity to employ themselves. Not urgent pre-revenue; plan for it once customer 2 or 3 is signed and the founder salary is funded by real ARR.

## 3. The real risk: permanent establishment (PE) in France

If both founders operate Global Gamma Ltd entirely from France - make strategic decisions in France, hold board meetings in France, sign contracts in France, receive customers in France - the French tax administration can argue that Global Gamma Ltd has a "permanent establishment" in France. If they win that argument, Global Gamma Ltd owes French corporation tax (25%) on profits attributable to the French PE, not just UK corporation tax. Double-taxation relief under the UK-FR tax treaty softens the blow but does not eliminate the administrative pain and the risk of back-taxes with penalties.

**Mitigation discipline** (do all of these from day 1):

- [ ] Global Gamma Ltd maintains a UK registered office (use an accountant-provided service address if no physical office)
- [ ] Strategic decisions are documented in board minutes dated as held at the UK registered office (virtual board meetings count, per UK company law, as long as they are documented with UK jurisdiction)
- [ ] UK corporation tax filings (CT600) are done annually by a UK-qualified accountant
- [ ] UK Confirmation Statement filed annually with Companies House (~£13/year)
- [ ] UK bank account in the company name (Wise Business UK, Revolut Business UK, or a UK high-street bank)
- [ ] Customer contracts are signed under English law where possible (standard boilerplate choice of law clause)
- [ ] Founders keep documentary evidence that strategic decisions are UK-jurisdictional (board resolutions, calendar invites tagged UK, signature blocks with UK registered office)
- [ ] Avoid publicly describing Global Gamma Ltd as "a French startup". It is a UK company with French-resident founders. The distinction matters to tax authorities.

**What does NOT mitigate PE risk:**
- Using a UK VPN (cosmetic, no weight)
- Taking one annual trip to London (insufficient)
- "My co-founder does the UK side" (if both of you are in France, this is not believable)

**When to re-evaluate:** at customer 2 or customer 3, when ARR exceeds €200k and you are hiring your first employee. At that point, either (a) formally incorporate a French SAS subsidiary of Global Gamma Ltd to employ the founders and first hires in France, or (b) unwind the UK Ltd and re-incorporate as a French SAS directly. Option (a) preserves the Global Gamma Ltd legal entity (and the trademark, and any investor relationship you have built). Option (b) simplifies the tax story long-term. A French tax advisor decides between them at that trigger point.

## 4. Mandatory tax advisor engagement

**Before month 6, book 1 hour with a French tax advisor specialized in international / cross-border structures.** Cost: €150-300 for the consultation. What to ask:

- Is the auto-entrepreneur + UK Ltd setup defensible for our specific facts?
- What documentation do we need to maintain to survive a French tax audit?
- At what ARR or hire count should we create a French subsidiary?
- How do we handle VAT on intra-community services (UK -> FR) correctly?
- How do we handle UK dividends to French-resident shareholders (if and when profits emerge)?
- What is the PE risk score for our specific pattern?

**Candidate advisors** (research, do not book without checking recent reviews):

- [ ] Independent French tax advisor with cross-border experience (search "conseil fiscal international français UK")
- [ ] Dougs (online French accounting service, handles UK-France structures)
- [ ] French Business Advice / EuroDev (boutique advisory firms)
- [ ] Personal referral from another French founder running a UK/US holding (highest quality, ask in your network)

**After the consultation**, update this document with the advisor's recommendations. If they disagree with the auto-entrepreneur + UK Ltd pattern, follow their recommendation, not this document.

## 5. VAT handling (the other thing to not forget)

Global Gamma Ltd is a UK company. It will need UK VAT registration once UK taxable turnover exceeds £90,000 (~€105,000) in a 12-month rolling period. Until then, VAT-registered is optional.

**Intra-community services (UK seller to FR customer after Brexit):** UK is outside the EU, so the old "reverse charge" B2B intra-community regime no longer applies directly. A UK Ltd selling services to a French customer treats it as an export of services outside the EU. The French customer self-assesses French VAT if VAT-registered in France.

**French customer invoices:** the founder-contractors under micro-entrepreneur régime are typically VAT-exempt below €36,800/year for services (`franchise en base de TVA`). Above the threshold, they must charge VAT on their invoices to Global Gamma Ltd. Adds a layer of paperwork but is not a blocker.

**This is where a tax advisor's input is non-negotiable.** Do not guess VAT rules.

## 6. Contracts in EUR (the founder's explicit preference)

**Customer contracts** are signed in EUR by default, regardless of the customer's country. EUR is the default currency on `docs/GO_TO_MARKET.md` pricing, on the landing page, and in all contractual documents. Exceptions (GBP for UK customers who insist, USD never in v1.0) are handled on a per-contract basis with explicit note in the contract and the billing system (see `specs/DATA_ARCHITECTURE.md` §4.3 FX handling).

**Founder invoices to Global Gamma Ltd** are in EUR. Global Gamma Ltd pays in EUR from a EUR-denominated UK bank account (Wise Business supports this with zero conversion fees; Revolut Business UK also supports EUR).

**UK bank account** should be EUR-denominated for the operating account. A GBP sub-account is fine for UK-specific expenses (Companies House filings, UK accountant, UK VAT if applicable).

## 7. Banking setup checklist

- [ ] Open Wise Business account for Global Gamma Ltd (10 minutes online, free, supports EUR and GBP sub-accounts, issues IBAN and BIC). Alternatives: Revolut Business UK, Monzo Business, Starling Business.
- [ ] Fund the account with initial capital (minimum £1 for a UK Ltd, realistic minimum £5,000-10,000 for operating headroom)
- [ ] Set up accounts payable workflow: each founder's monthly invoice lands via email, founder-2 approves, founder-1 pays via Wise
- [ ] Each founder opens a French personal or professional bank account (if not already) to receive the invoices
- [ ] Each founder registers as auto-entrepreneur via `autoentrepreneur.urssaf.fr` (free, 15 minutes)
- [ ] Each founder sets up the quarterly URSSAF declaration reminder (quarterly frequency by default, can be monthly if preferred)

## 8. UK accounting

Global Gamma Ltd needs a UK accountant for:
- Annual CT600 corporation tax return
- Annual Companies House confirmation statement
- Annual accounts filing (abbreviated for micro-entity)
- VAT registration and returns if applicable
- Payroll if you ever add UK-based employees

**Cost estimate:** £100-250/month for a small Ltd with a handful of transactions. Recommended providers:

- [ ] Crunch (online, bundled packages)
- [ ] Mazuma (low-cost, good for small Ltds)
- [ ] A local UK accountant via referral (preferred if possible)

Do not skip this. Filing deadlines in the UK are strict and late-filing penalties start at £100 and escalate quickly.

## 9. Decisions to lock in this week

- [ ] Both founders register as auto-entrepreneur (15 min each via URSSAF portal)
- [ ] Global Gamma Ltd bank account opened (Wise Business recommended)
- [ ] UK accountant selected and engaged (1 hour call)
- [ ] French tax advisor consultation booked for a date within the next 6 weeks
- [ ] Initial equity split decision locked (see `cofounder-agreement.md` §2)
- [ ] Monthly founder invoice amount agreed in writing (€3,500/month each as default per `runway.md`)
- [ ] This document reviewed by both founders and signed-off below

## 10. Sign-off

- [ ] Founder 1 (name): read and accepted, YYYY-MM-DD
- [ ] Founder 2 (name): read and accepted, YYYY-MM-DD
- [ ] First tax advisor consultation: scheduled YYYY-MM-DD
- [ ] First tax advisor consultation: completed YYYY-MM-DD, notes added below

## 11. Tax advisor notes (fill after consultation)

(blank until the consultation happens)

## 12. Revision log

- 2026-04-15: initial draft, auto-entrepreneur + UK Ltd pattern, pending tax advisor validation
