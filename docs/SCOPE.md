# SCOPE

> What v1.0 contains. Three lists. Hard line.

---

## Tier 1 (flagship, gate-enforced)

Every item passes `docs/FLAWLESS_GATE.md` before the next starts.

| # | Feature | Blueprint section |
|---|---------|-------------------|
| 1 | Authentication (login, register, MFA, passkey, reset) | 1.1-1.4 |
| 2 | Tenant onboarding with bulk CSV import | 1.5 |
| 3 | Employees directory + profile | 3.x |
| 4 | Clients directory + profile | 7.1-7.2 |
| 5 | Projects list + detail + assignment | 7.3-7.4 |
| 6 | Timesheets (weekly entry + team list) | 4.1-4.2 |
| 7 | Leaves (request + approve + balance) | 5.x |
| 8 | Expenses (submission with OCR + list + approval) | 6.x |
| 9 | Approvals hub | 4.3 |
| 10 | Invoices (generate + PDF + send) | 8.x |
| 11 | Admin console | 9.1 |
| 12 | Account settings | 9.2 |
| 13 | Dashboard (pass 1 + pass 2) | 2.1 |
| 14 | Command palette (Cmd+K) | 11.1 |

---

## Tier 2 (functional, polished in v1.1)

Present in v1.0. Works reliably. Not held to the flawless gate.

| # | Feature | v1.0 scope | v1.1 polish |
|---|---------|------------|-------------|
| 1 | Calendar | Month view read-only | Week/day/agenda, drag-edit |
| 2 | Gantt | Read-only pan/zoom | Drag-reschedule, dependencies |
| 3 | Resource planning | Read-only heatmap | Rebalance suggestions |
| 4 | HR module | Recruitment list, onboarding checklists | Full ATS |
| 5 | AI Insights page | Ranked list, dismiss | Act on insights inline |
| 6 | Client portal | Read-only status + invoices | Document exchange |
| 7 | Real-time | Approval + OCR + import notifications | Presence, collab edit |

---

## Deferred to v1.1 or later

- Native iOS/Android apps (PWA covers mobile in v1.0)
- Languages beyond EN and FR
- SSO beyond Google/Microsoft OIDC
- Custom dashboard builder
- Advanced reporting
- Payroll integrations
- Multi-currency consolidated reporting
- Public API for third-parties
- Webhooks for external systems
- Marketplace / plugin system
- AI learned per-user preferences
- Collaborative editing (multiple cursors)

---

## Anti-scope (forbidden without founder approval)

Never ship silently. Ask first.

- New atoms in the design system
- New content patterns
- New routes beyond `APP_BLUEPRINT.md`
- New third-party dependencies
- New database tables
- Sparklines, animations, 3D, decorative flourishes
- Em dashes anywhere
- The word "utilisation"
- Integrations (Slack, Teams, Zapier, calendar sync)

---

## First-customer must-haves

The 200-employee / 100-client EU customer blocks launch unless these are Tier 1 flawless:

1. Bulk CSV onboarding for 200 employees in under 60 s
2. Weekly timesheet submission + manager approval
3. Leave request + approval with balance enforcement
4. Expense submission with OCR + approval
5. Invoice generation from approved timesheets with PDF export
6. Dashboard wired to real data across all modules
7. Mobile PWA installable and usable for quick approvals
8. Admin console with user management + audit log
9. Dark + light mode both complete
10. EN + FR both complete

Everything else can be Tier 2 or deferred.
