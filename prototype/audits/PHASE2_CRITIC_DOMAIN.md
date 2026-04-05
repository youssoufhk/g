# GammaHR v2 Prototype -- Domain Expert Audit

**Auditor:** Senior HR Director, 200-person consulting firm
**Date:** 2026-04-05
**Scope:** Full prototype review (15 HTML pages + specs + data architecture)
**Verdict:** NOT READY FOR PURCHASE -- significant gaps prevent adoption

---

## Executive Summary

I spent two days reviewing every screen, every spec document, and every data model in this prototype. My assessment is blunt: **GammaHR is a consulting operations tool that has been incorrectly named an HR system.** The product does exactly three things well -- time tracking, project billing, and resource allocation -- but has essentially zero HR functionality. The name "GammaHR" sets a purchasing expectation that the product cannot meet.

For a 200-person consulting firm, this tool would cover roughly 30% of what we need from an HR platform. The timesheet-to-invoice pipeline is genuinely impressive and better than most competitors. The Gantt resource view is best-in-class for the prototype stage. But I cannot present this to my CFO, CPO, or legal counsel as an "HR system" when it lacks recruitment, onboarding, offboarding, performance management, payroll integration, contract management, and compliance features.

**Bottom line:** If this were marketed as "GammaOps" or "GammaPSA" (Professional Services Automation), I would rate the prototype 7/10 and consider it for a pilot. As "GammaHR," it is a 3/10 and I would immediately disqualify it.

---

## Would I Buy This?

**No. Not in its current state.**

Here is exactly what would happen if I tried to procure this:

1. **My CHRO would reject it** -- no recruitment pipeline, no performance review cycles, no employee lifecycle management. She would ask why we are evaluating a timesheet tool when she needs an HRIS.

2. **My CFO would be interested** in the timesheet-to-invoice pipeline and utilization tracking, but would reject it because: no revenue recognition model, no cost allocation to cost centers, no margin analysis per project that accounts for employee cost (salary + overhead), and financial numbers that are inconsistent across pages.

3. **My Legal/DPO would flag it** -- the prototype shows an audit log in admin but has no data retention policy configuration, no right-to-erasure workflow, no data export for GDPR Article 20, and no consent management.

4. **My IT team would ask** about SSO integration (mentioned in auth but not configurable in admin), API access for integration with our existing payroll (ADP/Personio), and whether the 48-person demo scales to 200+.

What I WOULD buy: the Gantt chart + resource planning module as a standalone add-on to our existing HRIS. That piece is genuinely differentiated.

---

## Deal-Breaker Gaps

These are features whose absence would prevent purchase. Each one is non-negotiable for a firm our size.

### 1. No HR Module Whatsoever [CRITICAL]

The app is called "GammaHR" but contains zero HR functionality:

- **No recruitment/ATS pipeline** -- We process 400+ applications per year. We need job posting, candidate tracking, interview scheduling, offer management, and rejection workflows. Every competitor (BambooHR, Personio, HiBob) has this.
- **No onboarding workflow** -- The spec mentions a 3-step "invited user" flow (set password, complete profile, quick tour). That is account activation, not onboarding. Real onboarding requires: equipment provisioning checklists, IT access requests, policy acknowledgment tracking, buddy/mentor assignment, probation period tracking, first-week/first-month check-in scheduling.
- **No offboarding** -- Zero. No exit interview tracking, no equipment return checklist, no access revocation workflow, no final paycheck calculation, no knowledge transfer tracking, no alumni network management.
- **No performance management** -- No goal setting (OKRs/KPIs), no 360-degree feedback, no performance review cycles, no calibration workflow, no performance improvement plans (PIPs), no compensation review tied to performance.
- **No employee lifecycle management** -- No probation tracking, no contract renewal alerts, no promotion/transfer workflow, no compensation change history, no employment status changes.

### 2. No Payroll Integration [CRITICAL]

Not mentioned anywhere. A 200-person consulting firm runs payroll monthly. We need: gross-to-net calculation or export, tax withholding, social security contributions (critical in France where the prototype is configured), overtime pay calculation, expense reimbursement integration into payroll, and payslip generation/distribution.

### 3. No Contract Management [CRITICAL]

The data model has a `documents` table with generic file upload, but there is no contract lifecycle management. We need: contract templates, e-signature integration (DocuSign/HelloSign), contract expiry alerts, amendment tracking, and contract-to-project linking.

### 4. No Compensation Management [HIGH]

No salary bands, no compensation benchmarking, no bonus calculation, no equity/stock tracking, no total compensation statements. The `users` table has `default_hourly_rate` and `default_daily_rate` (billing rates), but nothing about employee cost (salary, benefits, overhead).

### 5. Financial Numbers Are Not Trustworthy [CRITICAL]

See detailed section below. When a CFO sees inconsistent numbers between the dashboard and the invoice page, trust is broken immediately. This is a billing tool -- the numbers must be perfect.

---

## HR Module Requirements

If GammaHR wants to justify its name, it needs at minimum:

### Tier 1: Must Have (blocks purchase)

| Module | Key Features | Severity |
|--------|-------------|----------|
| **Recruitment** | Job posts, application tracking, interview scheduling, offer management, candidate portal, pipeline analytics | CRITICAL |
| **Onboarding** | Configurable checklists per role/department, document collection, policy acknowledgment, equipment requests, buddy assignment, progress tracking | CRITICAL |
| **Offboarding** | Exit interview, asset return checklist, access revocation, knowledge transfer, final settlement calculation | CRITICAL |
| **Performance** | Review cycles (annual, quarterly), goal setting, 360 feedback, calibration, PIP tracking | CRITICAL |
| **Employee Lifecycle** | Probation tracking, contract renewals, promotions, transfers, compensation changes, employment status | CRITICAL |
| **Payroll Integration** | Export to common payroll providers, payslip distribution, tax document management | CRITICAL |
| **Contract Management** | Templates, e-signatures, renewals, amendments, expiry alerts | HIGH |

### Tier 2: Expected (causes friction without)

| Module | Key Features | Severity |
|--------|-------------|----------|
| **Learning & Development** | Training catalog, course assignment, completion tracking, certification management | HIGH |
| **Compensation** | Salary bands, benchmarking, bonus rules, total compensation statements | HIGH |
| **Benefits Administration** | Enrollment, eligibility rules, provider integration, open enrollment periods | MEDIUM |
| **Employee Self-Service** | Personal info updates, payslip downloads, tax document access, org chart browse | HIGH |
| **Surveys & Engagement** | Pulse surveys, eNPS, engagement analytics, anonymous feedback | MEDIUM |

---

## Financial Accuracy Concerns

Every number inconsistency I found across the prototype:

### 1. Dashboard vs. Invoice Revenue Mismatch [CRITICAL]

- Dashboard "Revenue Trend" bar chart shows: Nov=42k, Dec=45k, Jan=38k, Feb=51k, Mar=48k, Apr=47k (partial).
- Invoice list shows total paid invoices for visible period: INV-040=15k, INV-041=8.5k, INV-042=30k, INV-043=5k(overdue), INV-044=9.4k, INV-045=11.2k. That is 79.1k paid total across Jan-Mar.
- The dashboard shows Jan+Feb+Mar = 38k+51k+48k = 137k. But the invoice table only accounts for 79.1k of that. Where is the remaining 57.9k? Are there invoices not shown? This is the kind of discrepancy that makes a CFO lose trust instantly.

### 2. "Utilization" Percentage Meaning Is Unclear [HIGH]

- Dashboard shows Sarah Chen at 95% utilization, but on the same page her "Week at a Glance" shows 4h logged out of 40h target (10%).
- If utilization is calculated on a monthly rolling basis, the weekly view should not contradict it this sharply without explanation.
- Employee cards show utilization percentages (95%, 82%, 75%, 68%, 90%, 45%, 78%, 88%) but there is no indication whether this is: billable hours / available hours, or billable hours / total hours logged, or allocated hours / capacity. The definition matters enormously for consulting firms.

### 3. Timesheet Rate Calculations [HIGH]

- Pending approval for John Smith: "40h logged - Meridian Portal - 3,200." That implies 80/h.
- Carol Kim: "38h logged - Quantum Platform - 2,850." That implies 75/h.
- Marco Rossi: "42h logged - Atlas Redesign - 3,360." That implies 80/h.
- David Park: "36h logged - Infra Overhaul - 2,880." That implies 80/h.
- But the invoice detail for INV-2026-048 shows Sarah at 85/h, John at 95/h, Alice at 75/h, Marco at 85/h, Liam at 65/h. John is shown at 95/h on the invoice but 80/h implied by the approval widget. Marco is 85/h on the invoice but 80/h in the approval widget.
- These are different projects, which could explain rate differences -- but nothing in the UI explains this. An approver seeing "3,200 for 40h" needs to know the rate and verify it.

### 4. Invoice Overdue Amount Mismatch [MEDIUM]

- Invoice stat card shows "Overdue: 12,800" with "2 invoices overdue."
- The two overdue invoices in the table are: INV-2026-046 (7,800) and INV-2026-043 (5,000). That is 12,800 -- correct.
- However, the "Total Outstanding: 28,400" stat should include all unpaid invoices (sent + overdue). Sent invoices: INV-048 (12,400) + INV-047 (8,200) = 20,600. Plus overdue: 12,800. Total = 33,400, not 28,400. The outstanding number is wrong by 5,000.

### 5. Fixed-Fee Project Budget Display [HIGH]

- Projects page shows "budget as percentage" (e.g., 72%, 45%) for all projects including fixed-fee ones.
- For hourly projects, percentage of budget consumed is meaningful.
- For fixed-fee projects, what a PM needs to see is: contract value, earned-to-date (based on milestone completion), cost-to-date (hours x internal cost rate), and margin. A percentage bar tells you almost nothing about fixed-fee project health.

### 6. No Margin/Profitability Calculation [CRITICAL]

- Revenue per project is shown (hours x billing rate), but cost is never shown.
- For a consulting firm, the critical metric is: Revenue minus Cost = Margin. Cost = (hours x employee cost rate) + expenses.
- The data model has billing rates but no cost rates. There is no field for employee salary, overhead rate, or blended cost rate.
- Without this, the tool cannot answer the most basic question a consulting firm asks: "Is this project profitable?"

---

## Leave Management Completeness

| Feature | Present? | Notes | Severity |
|---------|----------|-------|----------|
| Leave balance display | Yes | 4 types shown with used/pending/remaining | -- |
| Accrual rules | Partial | Admin shows "accrual rate" column in leave types table but no accrual calculation visible to employees | MEDIUM |
| Carryover rules | Partial | Admin shows "carryover max" column but no year-end carryover workflow | MEDIUM |
| Half-day booking | No | Leave request modal has start/end date but no AM/PM or half-day toggle | HIGH |
| Multi-day range selection | Yes | Date range picker in leave request form | -- |
| Team conflict detection | Yes | "2 others off that week" warning in leave request modal (per spec) | -- |
| Manager delegation | No | No mechanism to delegate approval authority when manager is on leave | HIGH |
| Public holiday integration | Partial | Admin has a "Holidays" tab, and spec mentions holiday detection in timesheets. Leave calendar shows holidays. But no automatic deduction of holidays from leave calculations. | MEDIUM |
| Leave encashment | No | No mechanism to cash out unused leave days | MEDIUM |
| Parental leave tracking | Partial | Admin shows "Parental Leave" as a leave type (90 days) but no special workflows for statutory parental leave (phased return, keep-in-touch days) | HIGH |
| Worked-days count in history | No | Leave history shows date range and total days but does not show which specific working days are included | HIGH |
| Pro-rata calculation for joiners/leavers | No | No visible mechanism to calculate partial-year entitlements | HIGH |
| Leave year configuration | No | No option to set leave year different from calendar year (some firms use fiscal year) | MEDIUM |
| Medical certificate requirement | No | Sick leave has no mechanism to flag when a medical certificate is required (e.g., after 3 consecutive days in France) | HIGH |

---

## Expense Workflow Realism

| Feature | Present? | Notes | Severity |
|---------|----------|-------|----------|
| Receipt upload + OCR | Yes | AI-powered receipt scanning with auto-fill -- impressive | -- |
| Expense policies | Partial | Admin has expense types with max amounts, but no per-department or per-role policies | MEDIUM |
| Daily/monthly limits | Partial | `daily_limit` in data model, "within 500 daily limit" shown in expense form, but no monthly cap | MEDIUM |
| Multi-currency | Partial | Currency dropdown in expense form, but no exchange rate management, no automatic conversion | HIGH |
| Recurring expenses | No | No mechanism for monthly recurring expenses (e.g., software subscriptions, parking) | MEDIUM |
| Per diem rates | No | No per-country per diem configuration | HIGH |
| Mileage tracking | No | No distance-based expense calculation (critical for consultants traveling to client sites) | HIGH |
| Credit card reconciliation | No | No corporate card feed integration | MEDIUM |
| Expense reports (grouped submissions) | No | Each expense is submitted individually. No mechanism to group expenses into a trip report | HIGH |
| Tax-deductible flag | No | No mechanism to flag tax-deductible expenses | MEDIUM |
| Budget warnings by project | Partial | Billable expenses linked to projects, but no warning when project expense budget is near limit | MEDIUM |

---

## Timesheet Model for Consulting

| Feature | Present? | Notes | Severity |
|---------|----------|-------|----------|
| Billable/non-billable distinction | Partial | Data model has `is_billable` per entry, but the timesheet UI grid does not show this distinction. The weekly summary says "Billable: 40h (100%)" as a static number. | HIGH |
| Internal project time | Partial | Can add internal projects as rows, but no separate "internal" category -- it is mixed with client projects | MEDIUM |
| Overtime rules | Partial | Admin shows "French Labour Law (35h/week)" selector, and spec mentions overtime alerts, but no actual overtime calculation or premium rate application | HIGH |
| Weekend/holiday entry warnings | Yes | Spec says cells show warnings; timesheet grid has weekend styling | -- |
| Project-based vs client-based time | Yes | Time is logged per project per day, and projects are linked to clients | -- |
| Minimum billing increments | No | Grid accepts any decimal. No configuration for 15-minute or 30-minute minimum increments. Time entries use 0.1 hour precision (DECIMAL(4,1)) but consulting firms bill in 15-min (0.25h) increments. | HIGH |
| Time rounding rules | No | No rounding up to nearest increment (e.g., 2h15m billed as 2h30m) | HIGH |
| Timer/stopwatch | No | No live timer for tracking time as you work | MEDIUM |
| Batch timesheet approval | Yes | Timesheet batches exist in data model; approval queue in UI | -- |
| Copy from previous week | Yes | "Copy" dropdown with "from last week" option | -- |
| Monthly view | Yes | Spec describes monthly heatmap view | -- |
| Daily notes/descriptions | Yes | Data model has `description` per entry | -- |
| Lock after approval | Yes | "Submitted" state shown with locked grid overlay | -- |

---

## Approval Chain Realism

| Feature | Present? | Notes | Severity |
|---------|----------|-------|----------|
| Single-level approval | Yes | Approve/reject buttons on each item | -- |
| Multi-level approval | No | Admin shows single approver per type (leaves=Direct Manager, expenses=Dept Manager, timesheets=PM). No second-level approval for high-value items. | HIGH |
| Delegation when manager is on leave | No | No delegation mechanism visible anywhere | HIGH |
| Escalation after N days | No | No auto-escalation configuration | HIGH |
| Auto-approve rules | No | No rules like "auto-approve sick leave under 2 days" or "auto-approve expenses under 50" | MEDIUM |
| Approval thresholds | No | No amount-based thresholds (e.g., expenses over 1000 need director approval) | HIGH |
| Bulk approve | Yes | Checkboxes + bulk action bar on approvals page | -- |
| Approval history/audit | Partial | Each approved item shows approver and timestamp, but no full approval chain history | MEDIUM |
| Rejection with mandatory reason | Yes | Rejection reason field shown in data model constraints | -- |
| No self-approval | Yes | Database constraint: `approved_by != user_id` | -- |

---

## Compliance Gaps

| Requirement | Status | Notes | Severity |
|-------------|--------|-------|----------|
| **GDPR: Right to erasure** | Missing | Data model mentions tenant deletion with `DROP SCHEMA CASCADE`, but no individual employee data erasure workflow. When an employee leaves, their personal data must be deletable while retaining anonymized business records. | CRITICAL |
| **GDPR: Data portability** | Missing | No employee data export (Article 20). No "download my data" button anywhere in the employee self-service. | CRITICAL |
| **GDPR: Consent management** | Missing | No consent tracking for data processing. No cookie consent. No privacy policy acceptance tracking. | CRITICAL |
| **GDPR: Data retention policies** | Missing | No configurable retention periods. How long are audit logs kept? Expense receipts? Old timesheets? The `audit_logs` table is partitioned by month (good for performance) but no retention/purge policy. | HIGH |
| **GDPR: DPO contact** | Missing | No Data Protection Officer contact information anywhere. | MEDIUM |
| **Working Time Directive** | Partial | Admin has overtime rules selector with "French Labour Law (35h/week)," but no enforcement mechanism. The WTD requires: max 48h/week average, 11h minimum daily rest, records kept for 2 years. | HIGH |
| **Audit trail completeness** | Partial | `audit_logs` table captures create/update/delete with JSONB changes. This is good architecture. But the admin UI only shows a simple log viewer with no export and no search-by-entity. | MEDIUM |
| **SOC 2 / ISO 27001** | Unknown | No security certifications mentioned. No information security policy. No access control matrix. | HIGH |
| **Electronic signature compliance** | Missing | Invoice PDFs are "generated" but not digitally signed. In many EU jurisdictions, B2B invoices must meet e-invoicing standards (ZUGFeRD, Factur-X). | HIGH |
| **Payroll compliance** | Missing | No payroll features = no compliance with local labor law requirements for pay calculations, tax withholding, social contributions. | CRITICAL |

---

## Terminology Review

Every label that uses wrong or problematic industry terminology:

| Current Term | Issue | Correct Term | Severity |
|-------------|-------|-------------|----------|
| **"Utilization"** / **"Utilized"** | Widely considered dehumanizing in modern consulting. People are not machines that get "utilized." Also ambiguous -- does it mean billable utilization, total utilization, or allocation? | **"Chargeability"** or **"Billable rate"** for the billable-hours metric. **"Allocation"** for planned capacity. **"Productive hours"** as a neutral alternative. | HIGH |
| **"Bench"** | Correct consulting term but displayed negatively (red warnings, skull-and-crossbones energy). Bench time is normal and necessary -- people need time between projects for training, business development, internal work. | Keep "Bench" but reframe: **"Available for assignment"** or **"Between engagements"**. Remove the alarm-bell styling. | MEDIUM |
| **"AI Insights"** | The nav label "AI Insights" conflates analytics with AI. Most of what is shown (revenue trends, utilization charts) is standard BI, not AI. The few AI features (expense anomaly detection, natural language query) should be labeled differently. | **"Analytics & Reports"** for the main section. Label genuinely AI-powered features with a distinct marker (e.g., a sparkle icon next to specific cards). | MEDIUM |
| **"Leave"** (as a nav label) | In consulting, "Leave" is understood, but "Time Off" is more inclusive and covers the WFH type shown. Having a "WFH" leave type is an oxymoron -- WFH is not leave. | **"Time Off & Absence"** for the section. Remove WFH from leave types -- it belongs in a separate "Work Location" or "Hybrid Schedule" feature. | HIGH |
| **"Team Directory"** | Acceptable, but in an HR system this should be **"People"** or **"Employees"** to reflect the HR function, not just a directory. A directory implies a phone book; an HR system manages the full employee record. | **"People"** (as used by BambooHR, HiBob, Personio) | MEDIUM |
| **"Configuration"** | Overly technical for an HR admin. | **"Settings"** or **"Company Settings"** | LOW |
| **"Resource Planning"** | The word "resource" for people is debated. In consulting firms it is standard, but some organizations find it objectifying. The prototype actually has both "Resource Planning" and a separate "Gantt Chart" which is confusing -- they seem to be the same thing split across two pages. | Merge into one section: **"Workforce Planning"** or keep **"Resource Planning"** (acceptable in consulting) but consolidate with Gantt. | MEDIUM |
| **"Quantum"** in page titles | Every page title says "GammaHR Quantum." This is a marketing code name that means nothing to users. It adds noise. | Remove "Quantum" from page titles. Use just "GammaHR" or the page name. | LOW |

---

## Invoice Workflow Assessment

| Feature | Present? | Notes | Severity |
|---------|----------|-------|----------|
| Timesheet-to-invoice pipeline | Yes | Generate modal lets you select client, project, date range; auto-calculates hours x rates + expenses. This is the strongest feature in the product. | -- |
| Credit notes | No | No mechanism to issue credit notes for disputed amounts or corrections. This is legally required in most EU jurisdictions. | CRITICAL |
| Partial payments | No | Invoice can only be "Mark as Paid" in full. No mechanism for partial payment tracking. Consulting clients frequently pay invoices in installments. | HIGH |
| Payment terms | Yes | Net 15/30/45/60 options in generate modal. | -- |
| Late payment interest | No | No automatic calculation of late payment interest (legally mandated in EU for B2B after 60 days). | HIGH |
| Tax handling | Partial | "0% - B2B reverse charge" shown. But no configuration for different tax rates, no VAT ID validation, no tax regime selection. | HIGH |
| Multi-currency invoicing | No | All invoices in EUR. No multi-currency support visible despite expense form having currency dropdown. | HIGH |
| Invoice numbering | Yes | Sequential numbering (INV-2026-0XX). But no gap detection and no guarantee of sequential compliance (required in some jurisdictions). | MEDIUM |
| PDF generation | Yes | "Download PDF" button, Typst mentioned in spec for PDF rendering. | -- |
| Recurring invoices | No | No mechanism for monthly retainer billing automation. The data model has `fixed_monthly_fee` and `retainer_hours` on projects but no auto-generation. | HIGH |
| Client portal invoice view | Yes | Portal shows invoices with status and download. Client can "Mark as Paid." | -- |
| Aging analysis | No | No accounts receivable aging report (30/60/90 day buckets). | HIGH |
| Write-off mechanism | No | No way to write off uncollectable invoices. | MEDIUM |

---

## Employee Self-Service Assessment

| Feature | Present? | Notes | Severity |
|---------|----------|-------|----------|
| View own profile | Partial | Employee profile page exists but only shown from admin perspective. No clear "My Profile" with edit capability for the logged-in user. | HIGH |
| Update personal info | No | No visible mechanism for employees to update their own phone, address, emergency contact, etc. | HIGH |
| Download payslips | No | No payslip feature exists. | CRITICAL |
| View org chart | Yes | Employee directory has an Org Chart view toggle. | -- |
| Team calendar | Partial | Leave calendar exists but only shows leave events. No view of team members' general availability, meetings, or client commitments. | MEDIUM |
| Submit requests (leave, expense, timesheet) | Yes | All three submission workflows are present. | -- |
| View own leave balance | Yes | Leave balance cards shown on leave page. | -- |
| View own timesheet history | Partial | "Previous weeks" section in timesheets, but no way to see monthly/annual summary of own hours. | MEDIUM |
| Document upload | Partial | Employee profile has a "Documents" tab (contract, ID, certifications) but no clear self-upload capability. | MEDIUM |
| Emergency contacts | No | Not in the data model or UI. | HIGH |
| Bank details for reimbursement | No | Not in the data model or UI. | HIGH |

---

## Scaling Concerns for 200+ Employees

| Concern | Details | Severity |
|---------|---------|----------|
| **Team calendar at scale** | The leave calendar renders every employee's leave as colored event bars in a month grid. At 200 employees, this becomes a wall of color with no readability. Need department/team filtering as the default view. | HIGH |
| **Gantt chart at scale** | The Gantt chart is gorgeous at 10 employees. At 200, scrolling through all rows becomes unwieldy even with filters. Need virtual scrolling and the ability to "pin" certain employees. | MEDIUM |
| **Approval queue at scale** | With 200 employees, managers could have 30-50 pending approvals per week. The current card-based layout is too sparse -- need a compact list view option. | MEDIUM |
| **Live presence panel** | Dashboard presence panel shows 10 people. At 200, this needs major redesign -- department grouping, search, or collapse to just "X online." | MEDIUM |
| **Notification volume** | Admins at 200-person firms receive hundreds of notifications weekly. No notification batching, digest mode, or priority filtering visible. | HIGH |

---

## What Would Make Me Choose BambooHR/Personio Instead

1. **BambooHR** has: full employee lifecycle, ATS, onboarding, offboarding, performance reviews, e-signatures, employee self-service, payroll (US), benefits administration, and a mobile app. GammaHR has none of these.

2. **Personio** has: all of the above plus European payroll compliance, GDPR tools, audit-ready reporting, document management with e-signatures, and an API marketplace. GammaHR would need 18+ months of development to match this.

3. **What GammaHR has that they don't:** the Gantt resource chart, the timesheet-to-invoice pipeline, project-based billing, client portal, and AI expense scanning. These are genuinely differentiated consulting-specific features.

4. **My recommendation:** GammaHR should position itself as a **PSA (Professional Services Automation) tool** that integrates with a real HRIS, not as a replacement for one. Build a Personio/BambooHR integration, let the HRIS handle people management, and let GammaHR handle project delivery and billing. This is the path to market.

---

## Summary of All Findings by Severity

### CRITICAL (13 findings -- blocks purchase)

1. No recruitment/ATS module
2. No onboarding workflow
3. No offboarding workflow
4. No performance management
5. No employee lifecycle management
6. No payroll integration or compliance
7. No GDPR right to erasure workflow
8. No GDPR data portability (employee data export)
9. No GDPR consent management
10. No credit note mechanism for invoices
11. No margin/profitability calculation (revenue without cost is meaningless)
12. Dashboard-to-invoice revenue figures inconsistent
13. Outstanding invoice total is arithmetically wrong (28,400 vs calculated 33,400)

### HIGH (28 findings -- causes significant friction)

1. No half-day leave booking
2. No manager delegation for approvals when on leave
3. No medical certificate workflow for extended sick leave
4. No pro-rata leave calculation for joiners/leavers
5. No worked-days count in leave history
6. No multi-currency expense management with exchange rates
7. No per diem rate configuration
8. No mileage tracking for expenses
9. No expense reports (grouped submissions)
10. Billable vs non-billable not visible in timesheet grid
11. No minimum billing increment configuration (15/30 min)
12. No time rounding rules
13. No overtime calculation with premium rates
14. No multi-level approval chain
15. No approval escalation after N days
16. No approval amount thresholds
17. No partial payment tracking on invoices
18. No late payment interest calculation
19. No multi-currency invoicing
20. No recurring invoice automation
21. No aging analysis report
22. No tax rate configuration beyond reverse charge
23. Utilization percentage definition ambiguous and inconsistent
24. Fixed-fee project budget shown as percentage, not contract value
25. Working Time Directive compliance not enforced
26. No employee self-service for personal info updates
27. No emergency contact management
28. "Utilization" terminology considered dehumanizing -- needs renaming
29. WFH classified as "Leave" type -- fundamentally wrong categorization
30. Notification system will not scale to 200+ employees

### MEDIUM (18 findings -- inconvenient but workable)

1. Accrual rules visible in admin but not to employees
2. Carryover year-end workflow missing
3. Leave encashment not supported
4. Leave year configuration (fiscal vs calendar) missing
5. Public holiday auto-deduction not visible
6. No monthly expense cap
7. No recurring expense tracking
8. No credit card reconciliation
9. No tax-deductible expense flag
10. No project expense budget warnings
11. No internal time category separate from client projects
12. No auto-approve rules for low-value items
13. Audit trail UI lacks search and export
14. No SOC 2 / ISO 27001 information
15. No e-invoicing standards compliance (ZUGFeRD/Factur-X)
16. Invoice write-off mechanism missing
17. Team calendar will not render at scale
18. Gantt and Resource Planning are two separate pages that should be one

---

*This audit was conducted as a good-faith evaluation from the perspective of a purchasing decision-maker at a mid-size consulting firm. The prototype demonstrates strong product design instincts and excellent UX craft. The gap is not in quality but in scope -- the product solves 30% of what an HR director needs and calls itself 100%.*
