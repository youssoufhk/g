# Gamma Founder Checklist

> **This is YOUR checklist. Not the agent's.** Read it every Monday morning for 10 minutes. Update it every Friday afternoon. Close the tab during build hours.
>
> **What belongs here:** runway, paperwork, co-founder, pipeline, discovery calls, customer interviews, pricing, positioning, legal, burnout watch, fundraise, founder-review gates, anything that cannot be delegated to Claude Code.
>
> **What does NOT belong here:** Docker Compose, Python code, atoms, migrations, tests, deploys. Those are in `EXECUTION_CHECKLIST.md` and the agent reads that file, not this one.
>
> **Rule:** the agent never touches this file. If you see Claude Code propose an edit to `FOUNDER_CHECKLIST.md`, refuse it and move the item to `EXECUTION_CHECKLIST.md` instead.

---

## 0. How to use this document

- **Monday, 09:00, 10 minutes.** Read this file top to bottom. Identify the 3 things you will personally complete this week. Write them at the top of your physical notebook.
- **Friday, 17:00, 15 minutes.** Check off what you did, write a one-line retro per incomplete item in the Friday log (section 4.4), commit the file.
- **Never during build hours.** This file is read-only during focused coding time. Check it only during the two rituals above.
- **Mark tasks done** with `[x]` and `(YYYY-MM-DD)`. Commit the change with message like `founder: phase 0 prereq 1 done`.

---

## 1. The 80/20 rule (the ONE page to re-read every Monday)

Same rule as `EXECUTION_CHECKLIST.md` section 1.0, restated for you:

**20 percent of your time determines 80 percent of the outcome. That 20 percent is, in order of leverage:**

1. **Customer discovery calls.** The single predictor of whether Gamma becomes a real business. Not optional. Not later. This week.
2. **Founder-review of every shipped feature** against prototype fidelity (flawless gate item 15). Non-delegable human judgment.
3. **Pipeline and sales conversations.** You personally. Not the co-founder. Not an agent. You.
4. **Strategic decisions** (pricing, positioning, scope cuts, fundraise). One per week max. Decide and move on.

**Everything else you do is the 80 percent that can slide a week without killing the project.** Build work, meetings, admin, emails, research, reading: all lower priority than the 4 above. When you feel overwhelmed, ask "is this in the top 4 or not?" and cut if not.

---

## 2. Parallel admin track (NOT a build blocker)

The founder runs these in parallel with Phase 2 build. They are not prerequisites. The build agent is explicitly told in `PROMPT.md` NOT to block on them and NOT to ask about them. Do them in parallel to §3.1, §3.2, §3.3, etc. Do them on evenings, weekends, or between build sessions.

**Zero-salary POC mode is locked.** Both founders work without salary until Gamma is profitable AND both founders agree to start paying themselves. This means the "runway" conversation is about company admin costs only, not personal income. See `docs/founder/runway.md`.

### 2.1 Company admin budget (whenever, 30 minutes)

Template already exists at `docs/founder/runway.md`. Zero-salary POC mode is locked. Only COMPANY admin costs (GCP, SaaS tools, UK accountant, domain, insurance from customer 1 on) are tracked here. Personal finances are NOT in this file and NOT in this repo.

- [ ] Copy `docs/founder/runway.md` to `docs/founder/runway.local.md` (gitignored) and fill in actual company cash balance
- [ ] Sign off in section 8 of the template
- [ ] Review monthly on the first Monday of each month

### 2.2 Co-founder paperwork (when the founders decide to, not a build blocker)

- [ ] Draft or commission a founder agreement. Options: SeedLegals UK (~£500), Stripe Atlas template (free, lower quality), local UK lawyer (~£1-3k)
- [ ] Required clauses: equity split (e.g., 50/50 or 60/40 with reasoning), 4-year vesting with 1-year cliff, full IP assignment to Global Gamma Ltd, bad-leaver protection (forfeiture on material breach), exit clause (right of first refusal, tag-along, drag-along), minimum weekly hours commitment (32+ for "full-time"), confidentiality, non-compete (narrow, defensible)
- [ ] Both founders sign and file. Keep a copy in a password manager, a copy in Google Drive, a printed copy in a fireproof safe
- [ ] If co-founder hesitates at any clause: **that is the answer.** Do not rationalize. Do not "sort it out later". Fix it now or reconsider the partnership
- [ ] Record in a founder log: "co-founder agreement signed on YYYY-MM-DD, filed at <location>"

### 2.3 Customer discovery messages (parallel to build, founder-paced)

- [ ] Identify 50 warm-intro targets on LinkedIn: COOs, finance leads, HR operations managers at 50-500 employee consulting firms in France and UK. Store the list at `docs/founder/pipeline.md` (new file, founder-only)
- [ ] Draft ONE outreach message template. Not long. 3 sentences: who you are, what Gamma is, one-line ask for a 30-minute call. No product pitch, no feature list
- [ ] Send the first 10 messages. Not "prepare to send". Send
- [ ] Track responses in the pipeline doc: Curious / Interested / Evaluating / Committed / Live
- [ ] Target for week 1: 10 sent. Target for week 2: 10 more. Target for week 4: 30 more. Target for week 20 (validated-lead gate): 3+ at Committed

---

## 3. Weekly rhythms

### 3.1 Monday morning (09:00, 30 minutes total)

- [ ] **09:00-09:10:** read this file. Identify the 3 tasks you will complete this week (the 20 percent).
- [ ] **09:10-09:20:** read `EXECUTION_CHECKLIST.md` section 1.0 (the 80/20 rule). Confirm that week's agent tasks match it. If not, re-order.
- [ ] **09:20-09:30:** plan the founder-review sessions for the week. Block 1 hour for each feature that will hit "ready to ship" during the week. These are the flawless-gate item-15 reviews and they are not negotiable.

### 3.2 Friday afternoon (17:00, 45 minutes total)

- [ ] **17:00-17:15:** check off what you did this week in this file. Move incomplete items to next Monday's top 3.
- [ ] **17:15-17:30:** write the weekly log at `docs/weekly/YYYY-MM-DD.md` (new weekly file). Fields: discovery calls booked this week, discovery calls completed this week, runway months remaining (budget burn / cash), blockers, one lesson learned, one decision to escalate next week.
- [ ] **17:30-17:45:** the demo + retro with co-founder. Each founder shows what they shipped, each founder names one thing that slowed them down, each founder names one thing they will do differently next week. 15 minutes maximum.
- [ ] Commit both files (`FOUNDER_CHECKLIST.md` updates + `docs/weekly/YYYY-MM-DD.md`) via `/commit` skill.

### 3.3 Monthly (first Monday of the month, 90 minutes)

- [ ] Review runway. Did burn match budget? Update the runway one-pager. If trending below 12 months remaining, escalate to fundraise.
- [ ] Review the pipeline. Count by stage. Retention rate (Curious -> Interested -> Evaluating). Average time-to-committed. Decide whether to increase outreach volume.
- [ ] Review the `docs/DEFERRED_DECISIONS.md` registry. Did any triggers fire this month? Promote to a phase if yes.
- [ ] Review pricing signals. Are any pilots complaining about price? Are any pilots asking about enterprise features we do not have?
- [ ] Review personal health. Weeks > 40 hours? Sleep under 6 hours per night? Weight change > 3 kg? Burn out starts here, not at the breakdown.

---

## 4. Customer discovery and pipeline

### 4.1 Pipeline tracking

- [ ] Maintain `docs/founder/pipeline.md` with every named lead, their stage, last contact date, next action
- [ ] Update weekly during the Friday ritual
- [ ] Stage definitions (same as `docs/GO_TO_MARKET.md` section 4): Curious, Interested, Evaluating, Committed, Live
- [ ] Target: 10 at Interested by Phase 3 exit (week 13), 3+ at Committed by validated-lead gate (week 20), 1 Live by Phase 7 (week 42-54)

### 4.2 Discovery call preparation (per call)

- [ ] 15 minutes before: read the lead's LinkedIn profile, their firm's website, their last 3 LinkedIn posts
- [ ] 10 minutes before: refresh the canonical one-liner, the pricing, the month-end close demo video (when it exists)
- [ ] During: 70 percent listening, 30 percent talking. Ask "what is the worst part of your month-end close today?" and shut up until they stop talking
- [ ] Within 2 hours after: write notes in `docs/founder/discovery-notes/YYYY-MM-DD-<name>.md`. Fields: firm size, current tooling, pain points, buying signals, objections, next action

### 4.3 The 3 questions every discovery call must answer

- [ ] What does their current month-end close look like? (how many hours, how many people, how often it goes wrong)
- [ ] What tool would they replace if Gamma did the job? (reveals competitive set and willingness to pay)
- [ ] If Gamma saved them 4 hours per month, what would that be worth to them? (reveals pricing anchor)

### 4.4 Early GTM content (absorbed from the old §3.9)

These are the low-cost, high-signal artifacts you should produce in parallel with the agent's MVP build. Each unblocks a conversation with a prospect. None of them is on the critical path for the agent.

- [ ] Blog post #1: "The 10-hour month-end close problem in consulting firms" (1000 words, publish on your own domain or LinkedIn)
- [ ] Blog post #2: "Why Kantata is still winning (and how we will change that)" (positioning piece)
- [ ] Blog post #3: "Agentic AI for consulting ops: drafts, not decisions" (differentiation piece)
- [ ] Landing page placeholder (Framer or Next.js) with an email-capture form + a 3-minute founder video. No pricing, no feature list, just the tagline and one call-to-action.
- [ ] Record the 3-minute founder intro video: raw, authentic, shot in one take. No agency.
- [ ] LinkedIn presence: 2 posts per week on consulting ops pain, starting from day 1. Build the audience before the product exists.
- [ ] Set up `support@<domain>` and `hello@<domain>` inboxes once you have a domain
- [ ] Email list on MailerLite or Buttondown free tier (newsletter sign-ups from the landing page)
- [ ] Target 10 discovery calls completed by week 13 (Phase 3 exit, if you follow the plan), 30+ by week 20 (validated-lead gate)

**Budget:** ~4 hours per week across all of §4. Less than half a day of founder time should produce the first blog post + landing page + video + 10 LinkedIn posts by end of week 8. The agent never touches any of this.

### 4.5 Friday log template (copy into each weekly file)

```markdown
# Weekly log YYYY-MM-DD

## Discovery
- Sent this week: X messages
- Booked this week: X calls
- Completed this week: X calls
- Pipeline stage changes: [list]

## Build
- Features shipped: [list]
- Features blocked: [list]

## Runway
- Cash remaining: €X
- Months remaining at current burn: X

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
- [ ] Burn rate tracked monthly; target <= forecast; variance investigated if > 10 percent
- [ ] Bank account balance logged monthly (not in repo; in the password manager)
- [ ] If < 12 months runway: book 5 fundraise calls per week until closed
- [ ] If < 6 months runway: STOP Phase 5 work and go full-time on fundraise. No exceptions
- [ ] Fundraise deck drafted and ready at customer 3 (per `EXECUTION_CHECKLIST.md` §9)
- [ ] Seed round target: €1.5-2M on €8-12M pre-money valuation at customer 5
- [ ] Keep a list of 40 EU seed VCs (Partech, Kima, Daphni, Frst, Ventech, Elaia, Serena, Alven, Breega, Seedcamp, Kindred, LocalGlobe, Hoxton, Octopus, etc.) in `docs/founder/investors.md` and update it monthly

---

## 6. Legal and compliance

- [ ] Global Gamma Ltd (UK) incorporated with correct SIC codes
- [ ] VAT registered (UK) once trading threshold approaches
- [ ] Professional indemnity insurance in place before first paying customer
- [ ] Cyber liability insurance in place before first paying customer
- [ ] DPA template ready for first pilot (see `docs/COMPLIANCE.md` section 10)
- [ ] ICO (UK) registration for data controller status before handling customer data
- [ ] CNIL registration OR cross-border notification for first FR customer
- [ ] Trademark clearance search for "Gamma" done (class 42). Full filing at customer 3
- [ ] Terms of Service and Privacy Policy drafted before first pilot (template from Iubenda or TermsFeed acceptable for v1.0)
- [ ] GDPR record of processing activities (ROPA) drafted by customer 1 go-live

---

## 7. Strategic decisions (one per week max)

Use this section to log strategic decisions as you make them. Limit yourself to one per week. Decide, write it down, move on. Do not re-open.

| Date | Decision | Reasoning (one line) | Reversibility |
|---|---|---|---|
| 2026-04-15 | Drop HR from product name, become Gamma | EU HR category is crowded, operations is ownable | Mostly reversible (rename) |
| 2026-04-15 | Pricing: €35/€26/custom, annual only | Charm pricing + premium anchor + 2.8x prior ACV | Reversible per customer |
| 2026-04-15 | Month-end close as the v1.0 agentic feature | Direct cash impact, demo-able, leverages existing infra | Irreversible within v1.0 |
| 2026-04-15 | FR + UK year 1, rest year 2+ | Founder knows the market, pipeline feasibility | Reversible per-country |
| (next) | | | |

---

## 8. Founder review gates (flawless gate item 15)

This is non-delegable human judgment. Claude Code cannot do it. You review every shipped feature against the prototype at 1440px desktop AND 320px mobile AND in dark mode AND in light mode.

- [ ] Block 1 hour per Tier 1 feature for founder review. Put it in the calendar when the agent says "ready for review"
- [ ] Open the feature in a real browser on your laptop. Not on screenshots. Not on Storybook alone. Real running app
- [ ] Ask: does this feel like `prototype/dashboard.html`? If yes, ship. If no, say specifically what is wrong and send it back
- [ ] Never approve a feature you have not personally used for at least 10 minutes with real-ish data
- [ ] Record approval in the feature's PR or commit message: "founder review passed YYYY-MM-DD"

---

## 9. Health and burnout watch

This is the one section you will want to skip. Do not skip it.

- [ ] Weekly sleep average logged in your head. Target 7+ hours. Red flag at < 6
- [ ] Weekly hours worked logged. Target <= 40 for sustainability. Red flag at > 50 for 3 consecutive weeks
- [ ] Monthly weight check. Red flag at > 3 kg change in either direction
- [ ] Weekly exercise: 3 x 30 minutes minimum. Non-negotiable. This is productivity work, not a luxury
- [ ] Monthly social life check: did you see humans other than the co-founder? Red flag at zero
- [ ] Quarterly vacation: minimum 1 full week off per quarter, no Slack, no email, no repo access. Burnout prevention is cheaper than recovery
- [ ] If 2+ red flags fire in the same month: STOP and talk to someone. Co-founder, partner, therapist, GP. Founder burnout is the silent killer of bootstrapped SaaS. It is more common than technical failure and harder to recover from

---

## 10. Cross-reference to `EXECUTION_CHECKLIST.md`

The agent-facing checklist lives at `EXECUTION_CHECKLIST.md`. It contains:
- Phase 0 kickoff (mostly done)
- Phase 2 through 7 technical tasks
- Section 1.1 the ten-step quality chain
- Section 1.3 skills to use (and forbid)
- Section 17 operations automation

The agent reads that file, not this one. You read this file, not that one (unless you want to see what the agent is working on this week). The two files cross-reference each other at section boundaries.

**Items that appear in both files:**
- The 80/20 rule (section 1.0 in agent checklist, section 1 here)
- The validated lead gate (section 2.3 in agent checklist, section 4 here; the agent cannot enforce the gate, you can)
- The pre-customer-2 measurement commitment (section in `THE_PLAN.md`, repeated in `docs/GO_TO_MARKET.md` section 12, enforced by you)

**Items that appear ONLY here (never in the agent checklist):**
- Runway, fundraise, bank accounts
- Co-founder paperwork, equity, legal
- Pipeline, discovery calls, customer interviews
- Pricing decisions and strategic pivots
- Founder health and burnout watch
- Trademark, insurance, DPA, ROPA

**Items that appear ONLY in the agent checklist (never here):**
- Docker Compose, FastAPI, Next.js, atoms, tests
- Deploys, Cloud Run, Cloud SQL
- M1-M10 modularity, six-layer testing
- Any code or commit

---

## 11. Final word

Every week you will be tempted to spend your time on the agent checklist because it feels productive and measurable. Resist. The 4 items in section 1 (customer discovery, founder review, pipeline, strategic decisions) are worth more than 100 hours of code. They are the ones only you can do. Everything else scales with Claude Code and the co-founder.

Read this file every Monday. Close it every Friday. Ship the top 3 every week.

If you miss a week, do not catch up. Start fresh the next Monday. Catching up encourages lying to yourself about completion.

If you miss two consecutive weeks, that is a signal, not a failure. Ask yourself why and write the answer in `docs/weekly/YYYY-MM-DD.md`. Then restart.
