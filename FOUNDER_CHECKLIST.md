# Gamma Founder Checklist

> **This is YOUR checklist. Not the agent's.** Read it every Monday for 10 minutes. Update it every Friday. Close the tab during build hours.
>
> **What belongs here:** runway, paperwork, co-founder, pipeline, discovery calls, customer interviews, pricing, positioning, legal, burnout watch, fundraise, founder-review gates, anything that cannot be delegated to Claude Code.
>
> **What does NOT belong here:** Docker Compose, Python code, atoms, migrations, tests, deploys. Those are in `THE_PLAN.md` §4 and §5 (per-task file paths, acceptance criteria, tests).
>
> **Rule:** the agent never writes to this file. If you see Claude Code propose an edit to `FOUNDER_CHECKLIST.md`, refuse it and move the item to `THE_PLAN.md` instead.
>
> **Last rewrite:** 2026-04-18. Aligned to the new `THE_PLAN.md` (tiered pricing + 75 DEFs inline + 12-week path to revenue).

---

## 0. How to use this document

- **Monday, 09:00, 10 minutes.** Read top to bottom. Identify the 3 things you will personally complete this week. Write them at the top of your physical notebook.
- **Friday, 17:00, 15 minutes.** Check off what you did, write a one-line retro per incomplete item in §4.5, commit.
- **Never during build hours.** Read-only during focused coding time. Check it only during the two rituals above.
- **Mark tasks done** with `[x]` and `(YYYY-MM-DD)`. Commit message like `founder: §4.2 messages sent week 1`.

---

## 1. The 80/20 rule (the ONE page to re-read every Monday)

**20 percent of your time determines 80 percent of the outcome. That 20 percent is, in order of leverage:**

1. **Customer discovery calls.** The single predictor of whether Gamma becomes a real business. Not optional. Not later. This week.
2. **Founder-review of every shipped feature** against prototype fidelity and the 70-item `docs/FLAWLESS_GATE.md` "feel proxy checklist." Non-delegable human judgment. See §8.
3. **Pipeline and sales conversations.** You personally. Not the co-founder. Not an agent. You.
4. **Strategic decisions** (pricing, positioning, scope cuts, fundraise, DEF triggers from `THE_PLAN.md §6`). One per week max. Decide and move on.

**Everything else you do is the 80 percent that can slide a week without killing the project.** When overwhelmed, ask "is this in the top 4 or not?" and cut if not.

Cross-reference: the agent has the same 80/20 rule baked into `THE_PLAN.md §4.0` as "rules for every week."

---

## 2. Parallel admin track (NOT a build blocker)

These run in parallel with `THE_PLAN.md` §4 build weeks. The agent is told in `CLAUDE.md` NOT to block on or ask about these.

**Zero-salary POC mode is locked.** Both founders work without salary until Gamma is profitable AND both founders agree to start paying themselves. The "runway" conversation is about company admin costs only, not personal income.

### 2.1 Company admin budget (monthly, 30 minutes)

Template at `docs/founder/runway.md`. Only COMPANY costs tracked (GCP, SaaS, UK accountant, domain, insurance from customer 1 on). Personal finances NOT in repo.

- [ ] Copy `docs/founder/runway.md` to `docs/founder/runway.local.md` (gitignored) and fill in actual company cash
- [ ] Sign off in section 8 of the template
- [ ] Review monthly on the first Monday

### 2.2 Co-founder paperwork (when the founders decide, not a build blocker)

- [ ] Draft or commission a founder agreement. Options: SeedLegals UK (~£500), Stripe Atlas template (free, lower quality), local UK lawyer (~£1-3k)
- [ ] Required clauses: equity split (e.g., 50/50 or 60/40 with reasoning), 4-year vesting with 1-year cliff, full IP assignment to Global Gamma Ltd, bad-leaver protection, exit clause (ROFR, tag-along, drag-along), minimum weekly hours (32+ for "full-time"), confidentiality, narrow non-compete
- [ ] Both founders sign and file. Copy in password manager + Google Drive + fireproof safe
- [ ] If co-founder hesitates at any clause: **that is the answer.** Fix it now or reconsider the partnership
- [ ] Record: "co-founder agreement signed YYYY-MM-DD, filed at <location>"

### 2.3 Customer discovery messages (parallel to build, founder-paced)

- [ ] Identify 50 warm-intro targets on LinkedIn: COOs, finance leads, HR operations managers at 50-500 employee consulting firms in France and UK. Store at `docs/founder/pipeline.md` (founder-only)
- [ ] Draft ONE outreach message template. 3 sentences: who you are, what Gamma is, one-line ask for a 30-minute call. No product pitch, no feature list
- [ ] Send the first 10 messages. Not "prepare to send". Send
- [ ] Track responses in the pipeline doc: Curious / Interested / Evaluating / Committed / Live
- [ ] Target week 1: 10 sent. Week 2: 10 more. Week 4: 30 more. Week 20: 3+ at Committed

Cross-reference: `THE_PLAN.md §4 Weeks 5-6 Task 3.1 and 3.2` list the agent-visible side of this (the 50-lead list format + outreach cadence).

---

## 3. Weekly rhythms

### 3.1 Monday morning (09:00, 30 minutes)

- [ ] **09:00-09:10:** read this file. Identify the 3 tasks you will complete this week.
- [ ] **09:10-09:20:** read `THE_PLAN.md §4` (or §5 after Q1). Confirm the agent's current-week tasks match. If not, re-order.
- [ ] **09:20-09:30:** plan the founder-review sessions for the week. Block 1 hour for each feature that will hit "ready to ship" during the week. These are the 70-item gate + feel-proxy reviews and they are not negotiable.

### 3.2 Friday afternoon (17:00, 45 minutes)

- [ ] **17:00-17:15:** check off what you did in this file. Move incomplete items to next Monday's top 3.
- [ ] **17:15-17:30:** write the weekly log at `docs/weekly/YYYY-MM-DD.md`. Fields: discovery calls booked, completed, runway months remaining, blockers, one lesson, one decision to escalate.
- [ ] **17:30-17:45:** demo + retro with co-founder. Each shows what shipped, names one thing that slowed them down, names one thing they will do differently next week. 15 minutes max.
- [ ] Commit both files (`FOUNDER_CHECKLIST.md` + `docs/weekly/YYYY-MM-DD.md`) via `/commit`.

### 3.3 Monthly (first Monday, 90 minutes)

- [ ] Review runway. Did burn match budget? Update the runway one-pager. If <12 months, escalate to fundraise.
- [ ] Review the pipeline. Count by stage. Retention rate (Curious → Interested → Evaluating). Decide whether to increase outreach volume.
- [ ] Review the DEF triggers in `THE_PLAN.md §6`. Did any fire this month? If yes, lift to `Resolved` and plan the work into the current quarter in §5.
- [ ] Review the pricing triggers in `THE_PLAN.md §2.3`. Did any fire? Move the SKU ladder if yes.
- [ ] Review pricing signals. Any pilots complaining about price? Any asking for enterprise features we do not have?
- [ ] Review personal health. Weeks >40 hours? Sleep <6 hours/night? Weight change >3 kg? Burnout starts here, not at the breakdown.

---

## 4. Customer discovery and pipeline

### 4.1 Pipeline tracking

- [ ] Maintain `docs/founder/pipeline.md` with every named lead, stage, last contact, next action
- [ ] Update weekly during the Friday ritual
- [ ] Stage definitions (mirrors `docs/GO_TO_MARKET.md §4`): Curious, Interested, Evaluating, Committed, Live
- [ ] Target: 10 at Interested by week 8, 3+ at Committed by week 12, 1 Live by week 20

### 4.2 Discovery call preparation (per call)

- [ ] 15 min before: read the lead's LinkedIn profile, their firm's website, their last 3 LinkedIn posts
- [ ] 10 min before: refresh the canonical one-liner, the pricing (`THE_PLAN.md §2`), the month-end close demo video (`docs/sales/demo_month_end_close_v1.mp4` after `THE_PLAN.md §4 Task 2.6`)
- [ ] During: 70% listening, 30% talking. Ask "what is the worst part of your month-end close today?" and shut up until they stop talking
- [ ] Within 2 hours: write notes at `docs/founder/discovery-notes/YYYY-MM-DD-<name>.md`. Fields: firm size, current tooling, pain points, buying signals, objections, next action

### 4.3 The 3 questions every discovery call must answer

- [ ] What does their current month-end close look like? (hours, people, failure rate)
- [ ] What tool would they replace if Gamma did the job? (competitive set + willingness to pay)
- [ ] If Gamma saved them 4 hours/month, what would that be worth? (pricing anchor)

### 4.4 Early GTM content (parallel to build, not on the critical path)

Each artifact unblocks a conversation with a prospect.

- [ ] Blog post #1: "The 10-hour month-end close problem in consulting firms" (1000 words, LinkedIn or own domain)
- [ ] Blog post #2: "Why Kantata is still winning (and how we will change that)" (positioning)
- [ ] Blog post #3: "Agentic AI for consulting ops: drafts, not decisions" (differentiation)
- [ ] Landing page placeholder (Framer or Next.js) with email capture + 3-minute founder video. No pricing, no feature list, one CTA
- [ ] Record the 3-minute founder intro video. Raw, authentic, one take. No agency
- [ ] LinkedIn presence: 2 posts/week on consulting ops pain, starting day 1
- [ ] Set up `support@<domain>` and `hello@<domain>` inboxes once domain bought
- [ ] Email list on MailerLite or Buttondown free tier
- [ ] Target 10 discovery calls by week 8, 30+ by week 12

**Budget:** ~4 hours/week across all of §4. Agent never touches any of this.

### 4.5 Friday log template (copy into each weekly file)

```markdown
# Weekly log YYYY-MM-DD

## Discovery
- Sent this week: X messages
- Booked this week: X calls
- Completed this week: X calls
- Pipeline stage changes: [list]

## Build (from THE_PLAN §4 or §5)
- Tasks shipped: [list]
- Tasks blocked: [list]

## DEF triggers (from THE_PLAN §6)
- Triggers fired this week: [list of DEF-NNN or "none"]

## Runway
- Cash remaining: €X
- Months at current burn: X

## Blockers
- [one line each]

## Lesson learned
- [one sentence]

## Decision to escalate
- [one sentence, or "none"]
```

---

## 5. Money: runway and fundraising

- [ ] `docs/founder/runway.md` exists and is current (updated monthly)
- [ ] Burn rate tracked monthly; target ≤ forecast; variance investigated if >10%
- [ ] Bank balance logged monthly (password manager, not in repo)
- [ ] If <12 months runway: book 5 fundraise calls/week until closed
- [ ] If <6 months runway: STOP `THE_PLAN §5 Q3-Q4` work and go full-time on fundraise. No exceptions
- [ ] Fundraise deck drafted and ready at customer 3
- [ ] Seed round target: €1.5-2M on €8-12M pre-money valuation at customer 5
- [ ] Keep a list of 40 EU seed VCs (Partech, Kima, Daphni, Frst, Ventech, Elaia, Serena, Alven, Breega, Seedcamp, Kindred, LocalGlobe, Hoxton, Octopus, etc.) at `docs/founder/investors.md`, update monthly

---

## 6. Legal and compliance

Ordered by when each gate fires relative to `THE_PLAN.md §4 and §5`.

- [ ] Global Gamma Ltd (UK) incorporated with correct SIC codes
- [ ] VAT registered (UK) when trading threshold approaches
- [ ] Professional indemnity insurance in place before first paying customer (`THE_PLAN §4 Weeks 5-6`)
- [ ] Cyber liability insurance in place before first paying customer
- [ ] DPA template ready for first pilot. Matches `THE_PLAN §4 Task 3.5 procurement pack v1`
- [ ] ICO (UK) registration for data controller status before handling customer data
- [ ] CNIL registration OR cross-border notification for first FR customer
- [ ] Trademark clearance search for "Gamma" done (class 42). Full filing at customer 3
- [ ] Terms of Service + Privacy Policy drafted before first pilot (Iubenda or TermsFeed template acceptable for v1.0)
- [ ] GDPR Record of Processing Activities (ROPA) drafted by customer 1 go-live
- [ ] SOC 2 Type 1 auditor engaged when `THE_PLAN §5 Q2 Task E` fires (customers 2-5)
- [ ] Pen-test engaged when `THE_PLAN §5 Q3 Task E` fires (DEF-077 resolved)
- [ ] Source-code escrow agreement signed with first Enterprise customer per `THE_PLAN §5 Q3 Task F` (DEF-076 resolved)
- [ ] SOC 2 Type 2 observation window opens per `THE_PLAN §5 Q4 Task C`

---

## 7. Strategic decisions (one per week max)

Log strategic decisions as you make them. Decide, write it down, move on. Do not re-open.

| Date | Decision | Reasoning (one line) | Reversibility |
|---|---|---|---|
| 2026-04-15 | Drop HR from product name, become Gamma | EU HR category is crowded, operations is ownable | Mostly reversible (rename) |
| 2026-04-15 | Month-end close as the v1.0 agentic feature | Direct cash impact, demo-able, leverages existing infra | Irreversible within v1.0 |
| 2026-04-15 | FR + UK year 1, rest year 2+ | Founder knows the market, pipeline feasibility | Reversible per-country (DEF-071..074) |
| 2026-04-18 | Pricing locked at Pilot €8k / Essential €17 / Business €29 / Enterprise €45 | Three tiers let SMB say yes while Enterprise is a lever we pull after gates clear | Reviewable per `THE_PLAN §2.3` triggers |
| 2026-04-18 | 75 DEFs folded into `THE_PLAN §6`, separate registry deleted | One roadmap, one direction | Fully reversible via git |
| (next) | | | |

---

## 8. Founder review gates (`docs/FLAWLESS_GATE.md` feel proxy checklist)

Non-delegable human judgment. Claude Code cannot do this. You review every shipped feature against the prototype at 1440px desktop AND 320px mobile AND in dark mode AND in light mode.

- [ ] Block 1 hour per Tier 1 feature for founder review. Put it in the calendar when the agent says "ready for review"
- [ ] Open the feature in a real browser on your laptop. Not screenshots. Not Storybook alone. Real running app
- [ ] Run the five-item feel proxy checklist at the bottom of `docs/FLAWLESS_GATE.md`:
  - Calm (whitespace parity with prototype)
  - Ease (next action in 0 or 1 clicks)
  - Completeness (empty + loading + error designed)
  - Anticipation (one pre-filled thing minimum)
  - Consistency (no one-off variants)
- [ ] If yes across all five, ship. If no, say specifically what is wrong and send it back
- [ ] Never approve a feature you have not personally used for at least 10 minutes with real-ish data
- [ ] Record approval in the feature's PR or commit message: "founder review passed YYYY-MM-DD"

---

## 9. Health and burnout watch

This is the section you will want to skip. Do not skip it.

- [ ] Weekly sleep average logged in your head. Target 7+ hours. Red flag at <6
- [ ] Weekly hours worked. Target ≤40 for sustainability. Red flag at >50 for 3 consecutive weeks
- [ ] Monthly weight check. Red flag at >3 kg change in either direction
- [ ] Weekly exercise: 3 x 30 minutes minimum. Non-negotiable. Productivity work, not a luxury
- [ ] Monthly social life check: did you see humans other than the co-founder? Red flag at zero
- [ ] Quarterly vacation: minimum 1 full week off per quarter, no Slack, no email, no repo access
- [ ] If 2+ red flags fire in the same month: STOP and talk to someone. Co-founder, partner, therapist, GP. Founder burnout is the silent killer of bootstrapped SaaS

---

## 10. Cross-reference to `THE_PLAN.md`

`THE_PLAN.md` is the only agent-readable roadmap. It contains:
- §0-§3: reality check + tiered pricing + honest state
- §4: 12-week path to €1 of revenue (per-task file paths, acceptance, tests)
- §5: Q2-Q4 roadmap (Business tier → Enterprise tier → public launch)
- §6: all 75 deferred decisions inline, grouped by trigger type
- §7: kill list
- §8: documents that stay vs die
- §9: weekly rhythm for agents
- §10: emergency manual
- §11: v1.0 ship criteria
- §12: final word

The agent reads `THE_PLAN.md`, not this file. You read this file, not `THE_PLAN.md` (unless you want to see what the agent is working on this week).

**Items that appear in both files:**
- The 80/20 rule (§1 here, §4.0 there)
- The pre-customer-2 measurement commitment (`THE_PLAN §4 Task 5.1`, enforced by you here)
- The monthly DEF trigger review (§3.3 here, §9 there)

**Items that appear ONLY here (never in the agent plan):**
- Runway, fundraise, bank accounts
- Co-founder paperwork, equity, legal
- Pipeline, discovery calls, customer interviews
- Pricing decisions (agent reads them; founder makes them)
- Founder health and burnout watch
- Trademark, insurance, DPA, ROPA signing

**Items that appear ONLY in `THE_PLAN.md` (never here):**
- File paths, acceptance criteria, tests
- M1-M10 modularity, six-layer testing, the 70-item gate
- DEF resolutions and their implementation tasks
- Docker Compose, FastAPI, Next.js, atoms
- Any code or commit

---

## 11. Final word

Every week you will be tempted to spend your time on the agent plan because it feels productive and measurable. Resist. The 4 items in §1 (discovery, founder review, pipeline, strategic decisions) are worth more than 100 hours of code. They are the ones only you can do. Everything else scales with Claude Code and the co-founder.

Read this file every Monday. Close it every Friday. Ship the top 3 every week.

If you miss a week, do not catch up. Start fresh the next Monday. Catching up encourages lying to yourself about completion.

If you miss two consecutive weeks, that is a signal, not a failure. Ask yourself why and write the answer in `docs/weekly/YYYY-MM-DD.md`. Then restart.
