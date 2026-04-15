# Country Playbooks

> **Who this is for.** The founder when a lead from a non-v1.0 country lands in the pipeline and you need to estimate the work to serve them.
> **What this is.** A one-page-per-country cheat sheet covering data residency, legal basis, tax, currency, language, payment rails, holidays, and the known quirks. Not operational. Just reference material to estimate year-2 expansion effort.
> **Scope.** v1.0 supports FR and UK (documented here as the live baseline). Year 2 candidates: Canada, Morocco, Niger. Other countries are placeholders.

---

## France (FR) - v1.0

- **GCP region:** `europe-west9` (Paris). Residency match.
- **Legal:** GDPR + CNIL supervisory authority. Code du travail (35-hour week, RTT, strict overtime). Code général des impôts (TVA 20%, reduced rates 10 / 5.5 / 2.1). Commercial Code art. L.123-22 (10-year retention for invoices).
- **Currency:** EUR.
- **Language:** fr-FR. Invoices MUST be in French for French counterparties.
- **Payment rails:** Stripe, GoCardless SEPA, Lemonway. Manual wire in v1.0 until DEF-029.
- **Invoice rules:** sequential numbering no gaps, VAT ID on sender side, intracommunity B2B zero-VAT with reverse-charge mention. PDF/A-1b for >5000 EUR invoices per DGFIP (Gamma renders all invoices as PDF/A-1b regardless of amount).
- **Holidays:** 11 public holidays + regional (Alsace-Moselle has 13). Load both.
- **Labor:** 35-hour week, RTT days accrue for employees on 39-hour contracts, 5 weeks paid vacation, specific leave types (maternity, paternity, family).
- **Known quirks:** Chorus Pro required for B2G e-invoicing (deferred, new DEF entry if ever needed). Silae is the dominant payroll provider to integrate with (post-launch).

---

## United Kingdom (GB) - v1.0

- **GCP region:** `europe-west9` (Paris). Cross-border EU-UK is lawful under the adequacy decision renewed in 2025. `europe-west2` (London) is available if a customer explicitly requires UK residency.
- **Legal:** UK-GDPR + ICO supervisory authority. Employment Rights Act 1996. Post-Brexit VAT rules (HMRC). 6-year retention for tax records (shorter than France).
- **Currency:** GBP.
- **Language:** en-GB. Keep British spelling conventions (colour, organisation, etc.). Note: the forbidden word "utilisation" is a British spelling; follow `CLAUDE.md` and use "work time" or "capacity" instead.
- **Payment rails:** Stripe, GoCardless BACS direct debit. Manual wire in v1.0.
- **Invoice rules:** VAT number if registered, simplified rules for <250 GBP, sequential invoice numbering. 6-year retention.
- **Holidays:** 8 bank holidays in England+Wales, 9 in Scotland, 10 in Northern Ireland. Load by sub-region (GB-ENG, GB-SCT, GB-NIR).
- **Labor:** 48-hour opt-out week, 28 days statutory leave (including public holidays), simpler overtime rules than France.
- **Known quirks:** HSBC UK is the canonical first customer profile (see `CLAUDE.md`). They bill clients in GBP and pay Gamma in EUR. Multi-currency is load-bearing for this customer.

---

## Canada (CA) - year 2 (DEF-071)

- **GCP region:** `northamerica-northeast1` (Montreal) or `northamerica-northeast2` (Toronto). Montreal preferred for Quebec customers.
- **Legal:** PIPEDA federal + Quebec Law 25 (strict) + provincial privacy acts.
- **Currency:** CAD.
- **Languages:** en-CA, fr-CA. Quebec Law 25 mandates French-first service; invoices in Quebec MUST be in French.
- **Payment rails:** Stripe, Moneris, Interac e-Transfer.
- **Invoice rules:** GST 5% federal + PST / HST / QST provincial (varies). Complex per-province dispatch.
- **Holidays:** federal + provincial. Quebec has Saint-Jean-Baptiste (June 24). Load per province.
- **Known quirks:** Quebec Law 25 requires appointing a local data protection officer for companies above a size threshold. Check threshold at expansion time. Cross-border transfer requires contractual safeguards (SCC-equivalent).

---

## Morocco (MA) - year 2 (DEF-072)

- **GCP region:** NONE. Served from `europe-west9` (Paris) under CNDP cross-border transfer filing.
- **Legal:** Loi 09-08 (Commission Nationale de Contrôle de la Protection des Données à caractère Personnel, CNDP). Modeled on the 1995 EU directive, not GDPR, so slightly different DSR procedures. Cross-border transfer requires CNDP authorization filing.
- **Currency:** MAD (Moroccan Dirham).
- **Languages:** fr (widely used in business), ar (Modern Standard Arabic, often required for government and some B2B). Arabic rendering must be RTL in PDFs.
- **Payment rails:** Stripe (supports MA since 2024), CMI (Centre Monétique Interbancaire, local network), PayZone.
- **Invoice rules:** TVA 20%, bilingual French + Arabic in some contexts, CNSS social security withholdings.
- **Holidays:** public holidays + Islamic calendar holidays (Eid al-Fitr, Eid al-Adha, Mawlid, Ramadan) with dates that shift yearly per Hijri calendar.
- **Known quirks:** Arabic RTL PDF rendering is NOT a trivial tweak; budget 3-5 days to build the template variant. Islamic calendar holidays require a reference data feed.

---

## Niger (NE) - year 2 (DEF-073)

- **GCP region:** NONE. Served from `europe-west9` (Paris) under CNPDCP safeguards.
- **Legal:** Loi 2017-28 (Commission Nationale de Protection des Données à Caractère Personnel, CNPDCP). Younger law, fewer precedents. Cross-border transfer permitted with appropriate contractual safeguards.
- **Currency:** XOF (West African CFA franc, pegged to EUR at 655.957). Shared with 7 other WAEMU member states.
- **Languages:** fr (official, primary for business). Hausa and Zarma are common but not typically used for formal B2B communication.
- **Payment rails:** MOBILE MONEY DOMINATES. Orange Money and MTN Mobile Money are the de facto payment rails for businesses. Card acceptance is low. Integration via Flutterwave, CinetPay, HUB2, or direct carrier APIs. Expect 4-6 engineering weeks for a first mobile money adapter.
- **Invoice rules:** VAT (TVA) 19%, WAEMU framework.
- **Holidays:** Nigerien public holidays + Islamic calendar holidays.
- **Known quirks:** internet reliability varies by region. PWA offline queue for timesheets and expenses is essential (already in v1.0). Niger shares most labor law with WAEMU peers (Senegal, Côte d'Ivoire, Burkina Faso), so after Niger, adding the other WAEMU countries is much cheaper (see DEF-074).

---

## Placeholder countries (post-year-2)

- **Germany (DE):** EU-resident, similar to France in complexity. Would reuse most of the GDPR + EU invoicing stack. Tax regime has §147 AO with 10-year retention. GCP `europe-west3` (Frankfurt) available for local residency.
- **United States (US):** California Consumer Privacy Act (CCPA), per-state complexity. Stripe covers payment. GCP `us-central1` or `us-east4`. Enterprise sales motion required.
- **Senegal (SN), Côte d'Ivoire (CI), Burkina Faso (BF):** shared WAEMU framework with Niger. Covered by DEF-074 trigger.
- **Kenya (KE), Nigeria (NG), South Africa (ZA):** Africa expansion anchors. Kenya has a strict Data Protection Act (similar to GDPR). Nigeria has NDPR. South Africa has POPIA. GCP `africa-south1` (Johannesburg) available for ZA.
- **UAE, Saudi Arabia:** `me-central1` (Doha) or `me-central2` (Dammam). Different legal frameworks, cash-friendly culture, Arabic-first.

---

## Cross-references

- `specs/DATA_ARCHITECTURE.md` section 2.3 - `tenants.residency_region`, `tenants.legal_jurisdiction`, per-country strategy modules pattern
- `specs/DATA_ARCHITECTURE.md` section 15 - `public.country_holidays` reference table and seed rules
- `docs/COMPLIANCE.md` section 1 - data residency and cross-border transfer posture
- `docs/COMPLIANCE.md` section 2 - retention table (FR + UK live, year 2 placeholders)
- `docs/DEFERRED_DECISIONS.md` DEF-071 through DEF-074 - triggers and work items for each year-2 country
- `CLAUDE.md` - hard rules and forbidden-word list
