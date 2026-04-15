# Co-founder agreement (decisions + signing checklist)

> **Chosen path:** SeedLegals UK (online, ~€1,200, 2-3 days end-to-end). Alternative: French bilingual lawyer (~€1,500-3,000, slower). SeedLegals is the default because Global Gamma Ltd is UK-incorporated and SeedLegals' templates match UK company law.
>
> **Status.** Not yet drafted. Lock all decisions in §2 before starting the SeedLegals flow.
>
> **Real signed agreement reference:** see `cofounder-agreement.local.md` (gitignored) for storage locations, signed date, and any confidential amendments.

---

## 1. Why this must happen before the first line of product code

A co-founder agreement is not a legal formality, it is the single biggest risk mitigation in the whole plan. If it does not exist:

- Either founder can walk away in month 3 with an equal claim on the product, the code, the trademark, and the customer list
- No clear IP assignment means the UK Ltd does not legally own what you are building
- Equity disputes at fundraise time kill seed rounds. Investors will not wire money into a company with unclear founder ownership
- If Global Gamma Ltd is acquired or wound down, there is no agreed distribution of proceeds
- Tax authorities in both UK and France will ask for the founder agreement to prove the legitimacy of the company structure

**Sign before any Phase 2 code commit.** Non-negotiable.

---

## 2. Decisions to lock in this week (BEFORE starting SeedLegals)

These are the questions SeedLegals will ask you. Answering them in a spreadsheet takes 3 hours. Answering them in a live form wastes 2 weeks of back-and-forth. Lock them first.

### 2.1 Equity split

- [ ] Decision: __/__ (e.g., 50/50, 55/45, 60/40)
- [ ] Reasoning in one sentence: (e.g., "both founders contribute full-time from day 0, 50/50 default")
- [ ] Written in the agreement: yes

**Default recommendation for peer co-founders starting simultaneously:** 50/50. Any deviation should be explicitly justified (one founder brought the idea, one founder brought prior IP, one founder is taking larger financial risk).

**What NOT to do:** leave it ambiguous ("we will sort it out later"), or use a formula ("based on contribution"). Lock a number.

### 2.2 Share class

- [ ] Decision: ordinary shares (default for UK Ltd with two founders)
- [ ] Any preferred shares reserved for future investors: yes (SeedLegals will set this up automatically)
- [ ] Voting rights: 1 share = 1 vote, ordinary shares carry voting rights

### 2.3 Vesting schedule

- [ ] Total vesting period: **4 years** (standard)
- [ ] Cliff: **1 year** (no shares vest before month 12; at month 12, 25% vests in one lump)
- [ ] Post-cliff vesting: monthly, 1/48 per month from month 13 to month 48
- [ ] Acceleration on sale (change of control): double-trigger (50% acceleration on sale, full acceleration on sale + termination within 12 months of sale)

**Why this matters:** if one founder leaves in month 9, they get zero shares. If one founder leaves in month 15, they keep 25% + 3 months of vested shares = ~31% of their allocation. This is the single biggest protection against a co-founder ghost.

### 2.4 IP assignment

- [ ] All IP created by either founder before, during, and (for a defined period) after their engagement assigns to **Global Gamma Ltd**
- [ ] Pre-existing IP (if any): listed in a schedule attached to the agreement, licensed to the company (not assigned)
- [ ] Confidentiality: perpetual, survives termination

**Critical for Gamma:** the prototype HTML, the specs, the ops library, the testing strategy, every doc in this repo. All of it needs to be formally owned by Global Gamma Ltd, not by the founders personally. Without this clause, a founder leaving could claim the code is theirs.

### 2.5 Bad leaver / good leaver definitions

- [ ] **Bad leaver:** resignation within 12 months of the agreement without cause, gross misconduct, material breach of the agreement, criminal conviction. Bad leaver forfeits unvested shares AND 50% of vested shares (buy-back by company at nominal value).
- [ ] **Good leaver:** death, disability, mutual-agreement exit after 12 months, retirement. Good leaver keeps vested shares, forfeits unvested.
- [ ] **Neutral leaver (resignation after 12 months without cause):** keeps vested shares minus a 12-month non-compete; unvested forfeited.

**What NOT to do:** skip the bad leaver clause. Without it, a resigning co-founder walks with 100% of their vested shares and nothing stops them from joining a competitor the next week.

### 2.6 Transfer restrictions

- [ ] Right of first refusal: any founder wishing to sell shares must first offer them to the other founder(s) at the proposed price
- [ ] Drag-along: if 50%+ of shareholders agree to sell the company, minority shareholders must sell on the same terms
- [ ] Tag-along: if any shareholder receives an offer to sell, minority shareholders can demand to be included on the same terms
- [ ] Lock-up: no founder can sell any shares within the first 3 years without the other founder's consent

### 2.7 Minimum time commitment

- [ ] Both founders are "full-time", defined as **32 hours per week minimum** on Gamma, documented by a shared calendar or time log
- [ ] If a founder drops below 32 hours for more than 4 consecutive weeks without the other founder's written consent, they are deemed part-time and their equity vesting is reduced pro-rata to hours worked
- [ ] Exceptions: up to 4 weeks per year of unpaid leave (vacation, medical, personal), pre-communicated

### 2.8 Non-compete

- [ ] Duration: **12 months** after departure
- [ ] Geographic scope: European Union + UK
- [ ] Industry scope: operations platforms, PSA software, consulting firm tooling in the 50-500 employee segment
- [ ] Carve-out: working for a customer or a supplier is allowed; working for a direct competitor is not

**Note:** non-competes are hard to enforce in France (French labour law does not favour broad restrictions). A UK-law non-compete in a UK Ltd agreement has more teeth, but if a French court is asked to enforce it, they may narrow or void it. The clause is still worth having as a deterrent.

### 2.9 Decision-making and governance

- [ ] Day-to-day decisions: each founder has authority in their functional area (product/design/frontend vs backend/infra/AI)
- [ ] Strategic decisions requiring both-founder approval: hiring, firing, fundraise, pricing changes, M&A, change of business model, share transfers, new co-founders, tax/legal/compliance decisions
- [ ] Deadlock resolution: independent mediator (named in advance, or selected via the Chartered Institute of Arbitrators) before any legal action
- [ ] Board composition: both founders are directors of Global Gamma Ltd

### 2.10 Founder salaries / compensation

- [ ] Both founders paid via monthly invoices (auto-entrepreneur in France) at €3,500/month gross each (see `runway.md`)
- [ ] Invoice amount can be reduced by mutual agreement (e.g., lean mode at €2,000/month)
- [ ] Dividends: paid only by board decision once profitable; not a guarantee
- [ ] Expense reimbursement: each founder submits expenses monthly for legitimate business costs; reimbursed within 14 days

### 2.11 Confidentiality and data protection

- [ ] Founders agree to keep confidential all customer data, pricing, strategic plans, investor conversations, source code, specs
- [ ] GDPR: both founders are designated data controllers for Global Gamma Ltd, with shared responsibility for compliance
- [ ] Access to customer data is logged via `public.audit_log` (see `specs/DATA_ARCHITECTURE.md` §8)

### 2.12 Dispute resolution

- [ ] Governing law: English law (UK Ltd jurisdiction)
- [ ] Venue: English courts for matters of UK company law; mediation in France for operational disputes between the founders
- [ ] Mediator: Chartered Institute of Arbitrators (CIArb) panel or a named independent mediator agreed in advance

---

## 3. The SeedLegals flow (2-3 days end-to-end)

### Day 1: Setup (2 hours)

- [ ] Founder 1 creates a SeedLegals UK account at `seedlegals.com`
- [ ] Add Global Gamma Ltd as the company (SeedLegals will pull Companies House data automatically)
- [ ] Add both founders with their full legal names, dates of birth, addresses, share allocations
- [ ] Buy the "Founder Agreement + Shareholder Agreement" bundle (~£800-1,200 depending on current pricing)

### Day 1-2: Fill the form (2-3 hours)

- [ ] Open the Founder Agreement wizard
- [ ] Answer each question using the decisions locked in §2 above
- [ ] Review the generated draft clause-by-clause (1 hour)
- [ ] Flag any clause that does not match the §2 decisions and edit the underlying answer

### Day 2: Co-founder review (1 day for the other founder)

- [ ] Share the draft with the co-founder
- [ ] Co-founder reviews, raises any objections or questions
- [ ] Resolve any disagreements via discussion (not via edits; the resolution must be agreed, then committed to the draft)
- [ ] If any clause cannot be agreed: STOP. Do not sign. Have the conversation. A forced signature is worse than no signature.

### Day 3: Sign and file

- [ ] Both founders sign electronically via SeedLegals
- [ ] Download the signed PDF
- [ ] Store copies in: (1) a password manager shared with both founders (1Password Business or Bitwarden Family), (2) Google Drive folder shared with both founders, (3) a printed copy in each founder's home filing cabinet, (4) emailed to the UK accountant for their records
- [ ] Update `cofounder-agreement.local.md` with: signed date, document hash, storage locations
- [ ] Notify the UK accountant that the agreement is in place (they may need it for future filings)

---

## 4. What to do if the co-founder hesitates on any clause

Hesitation on vesting, IP assignment, bad leaver, or minimum hours is a **signal**, not a negotiating position.

- [ ] If they hesitate on vesting: ask why. The reason matters. If they want to front-load, that is risky. If they want to skip the cliff entirely, that is a red flag.
- [ ] If they hesitate on IP assignment: ask why. Pre-existing IP is fine to carve out. Unwillingness to assign future IP is a dealbreaker.
- [ ] If they hesitate on bad leaver: ask why. Bad leaver only triggers on actual bad behavior; hesitation suggests they are planning for it.
- [ ] If they hesitate on minimum hours: ask why. 32 hours is already lenient for "full-time". Hesitation suggests they expect to be part-time.

**If after discussion any of the above cannot be resolved**, do NOT sign. Have the hard conversation. This is cheaper now than at month 6 when one founder has ghosted and the other is trying to fundraise a company with 50% ownership locked.

---

## 5. Cross-references

- `legal-structure.md` - why Global Gamma Ltd is UK-based while founders are France-resident
- `runway.md` - monthly invoice amounts, lean mode, cost reduction levers
- `EXECUTION_CHECKLIST.md` §2 Phase 0 kickoff - this agreement is a prerequisite for any code commit
- `FOUNDER_CHECKLIST.md` §2.2 - the Phase 0 prerequisite
- `docs/COMPLIANCE.md` §10 - founder DPO designation under GDPR

---

## 6. Sign-off (only after the signed agreement exists)

- [ ] Co-founder agreement signed: YYYY-MM-DD
- [ ] Stored in 1Password Business: YYYY-MM-DD
- [ ] Stored in Google Drive: YYYY-MM-DD
- [ ] Printed copies filed: YYYY-MM-DD
- [ ] UK accountant notified: YYYY-MM-DD
- [ ] Notes in `cofounder-agreement.local.md`: YYYY-MM-DD
