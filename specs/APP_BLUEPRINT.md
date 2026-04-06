# GammaHR v2 — Complete App Blueprint

> Every page. Every click. Every connection. Every state.
> This is the plot of the app before a single line of code is written.

> **Design System:** Earth & Sage palette — locked. See `specs/DESIGN_SYSTEM.md §2` for all color tokens.
> Primary: soft sage `hsl(155,26%,46%)` · Accent: terracotta `hsl(30,58%,50%)` · Gold: aged gold `hsl(38,60%,48%)` · Text: parchment cream `hsl(40,28%,90%)` · Base: warm charcoal `hsl(35,16%,5%)`

> **Prototype Reference:** Every section below maps to an approved HTML prototype in `/prototype/`. Before implementing any feature, open the corresponding prototype file in a browser to see the approved visual design, data, and interactions. The prototype is the source of truth for the frontend — Next.js simply re-implements what is already validated there.

---

## Table of Contents

1. [Global Patterns](#1-global-patterns)
2. [Authentication & Onboarding](#2-authentication--onboarding)
3. [Dashboard (Command Center)](#3-dashboard-command-center)
4. [Employee Directory & Profiles](#4-employee-directory--profiles)
5. [Resource Gantt Chart](#5-resource-gantt-chart)
6. [Leave Management](#6-leave-management)
7. [Expense Management](#7-expense-management)
8. [Timesheet Management](#8-timesheet-management)
9. [Project Management](#9-project-management)
10. [Client Management & Portal](#10-client-management--portal)
11. [Invoicing](#11-invoicing)
12. [Calendar](#12-calendar)
13. [Approvals Hub](#13-approvals-hub)
14. [Admin & Configuration](#14-admin--configuration)
15. [AI Insights & Analytics](#15-ai-insights--analytics)
16. [Resource Planning & Forecasting](#16-resource-planning--forecasting)
17. [Notifications & Real-time](#17-notifications--real-time)
18. [Search & Command Palette](#18-search--command-palette)
19. [Account & Settings](#19-account--settings)
20. [Navigation & Information Architecture](#20-navigation--information-architecture)
21. [Human Resources Module](#21-human-resources-module)

---

## 0. Architecture Overview

> **Quick Reference:** A full codebase map (file purposes, page index, tech stack, design tokens, patterns) is saved in `.claude/memory/project_architecture.md`. Every new Claude session should read that file first.

### 0.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │ Web App  │  │ Mobile   │  │ Client   │  │ Slack/Teams  │ │
│  │ (Next.js)│  │  (PWA)   │  │ Portal   │  │ Integration  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘ │
│       └──────────────┴──────────────┴───────────────┘        │
│                          │                                    │
│                    ┌─────┴──────┐                             │
│                    │  API GW /  │                             │
│                    │  Load Bal  │                             │
│                    └─────┬──────┘                             │
│                          │                                    │
│  ┌───────────────────────┴────────────────────────────┐      │
│  │              RUST BACKEND (Axum)                    │      │
│  │  ┌──────────┐ ┌───────────┐ ┌──────────────────┐  │      │
│  │  │ REST API │ │ WebSocket │ │ Background Jobs  │  │      │
│  │  │ Handlers │ │  Server   │ │ (Tokio + Redis)  │  │      │
│  │  └────┬─────┘ └─────┬─────┘ └────────┬─────────┘  │      │
│  │       └──────────────┴────────────────┘            │      │
│  │  ┌──────────────────────────────────────────────┐  │      │
│  │  │  Domain Services │ Auth │ RBAC │ Audit Trail  │  │      │
│  │  └──────────────────────────────────────────────┘  │      │
│  └───────────────────────┬────────────────────────────┘      │
│                          │                                    │
│  ┌───────┐  ┌───────┐  ┌┴──────┐  ┌──────────┐  ┌───────┐  │
│  │Postgres│  │ Redis │  │ Meili │  │ S3/MinIO │  │Claude │  │
│  │  (DB)  │  │(Cache)│  │Search │  │ (Files)  │  │ (AI)  │  │
│  └───────┘  └───────┘  └───────┘  └──────────┘  └───────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 0.2 Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Backend API** | Rust (Axum) | Memory-safe, blazing fast |
| **Database** | PostgreSQL 16 | Schema-per-tenant isolation |
| **Cache / Real-time** | Redis 7 | Pub/sub, sessions, rate limiting |
| **Search** | Meilisearch | Typo-tolerant instant search |
| **Frontend** | Next.js 15 (App Router, React 19) | Server components, streaming |
| **3D / Visuals** | Three.js + React Three Fiber | 3D icons, data viz, depth effects |
| **Styling** | Tailwind CSS 4 + custom tokens | Tokens from `_tokens.css` |
| **State** | Zustand + TanStack Query | Client + server state |
| **Forms** | React Hook Form + Zod | Type-safe end-to-end validation |
| **Charts** | D3.js | Custom premium visualizations |
| **Auth** | JWT + refresh tokens + WebAuthn | Passkey / passwordless support |
| **File Storage** | S3-compatible (MinIO / AWS) | Receipts, documents, photos |
| **PDF** | Typst (via Rust) | Native Rust PDF generation |
| **Email** | Resend or SMTP | Transactional emails |
| **AI** | Claude API | Expense OCR, insights, NL queries |
| **i18n** | next-intl + Rust fluent | English and French |

### 0.3 Multi-Tenancy Model

```
PostgreSQL Instance
├── public schema           → shared (tenants, billing, system_config)
├── tenant_acme schema      → Acme Corp's complete isolated data
├── tenant_globex schema    → Globex Corp's complete isolated data
└── tenant_initech schema   → Initech's complete isolated data
```

JWT carries `tenant_id` → middleware sets `search_path` → all queries auto-scoped. Full schema isolation; no row-level security needed.

### 0.4 File Map

#### Specs & Planning
| File | Purpose |
|------|---------|
| `MASTER_PLAN.md` | Project vision, tech stack decisions, agent team, phase plan |
| `AGENT_TEAM.md` | 12 specialized agent roles and their deliverables |
| `AGENT_WORKFLOW.md` | Orchestration, critic system, quality gates |
| `FINAL_CHECKLIST.md` | 213 prototype issues resolved — full audit trail |
| `specs/APP_BLUEPRINT.md` | This file — every page, click, connection, state |
| `specs/DATA_ARCHITECTURE.md` | Entity models (SQL), API design, seed data |
| `specs/DESIGN_SYSTEM.md` | Colors, typography, spacing, components, motion |

#### Prototype (Source of Truth for Visual Design)
| File | Purpose |
|------|---------|
| `prototype/_tokens.css` | All CSS custom properties — colors, spacing, typography, shadows |
| `prototype/_components.css` | Full component CSS library — copy styles directly into Next.js |
| `prototype/_layout.css` | App shell — sidebar, top bar, mobile nav, filter bars |
| `prototype/_shared.js` | Shared JS — hover cards, presence, role switcher, keyboard nav, toasts |

### 0.5 Page Index

| Prototype File | Page | Next.js Route (planned) |
|---------------|------|------------------------|
| `prototype/index.html` | Dashboard | `/[locale]/(app)/dashboard` |
| `prototype/employees.html` | Team Directory | `/[locale]/(app)/employees/[id]` |
| `prototype/timesheets.html` | Timesheet Management | `/[locale]/(app)/timesheets` |
| `prototype/leaves.html` | Leave Management | `/[locale]/(app)/leaves` |
| `prototype/expenses.html` | Expense Management | `/[locale]/(app)/expenses` |
| `prototype/projects.html` | Projects | `/[locale]/(app)/projects/[id]` |
| `prototype/clients.html` | Clients | `/[locale]/(app)/clients/[id]` |
| `prototype/invoices.html` | Invoices | `/[locale]/(app)/invoices` |
| `prototype/calendar.html` | Calendar | `/[locale]/(app)/calendar` |
| `prototype/gantt.html` | Gantt Chart | `/[locale]/(app)/gantt` |
| `prototype/planning.html` | Resource Planning | `/[locale]/(app)/planning` |
| `prototype/approvals.html` | Approvals Hub | `/[locale]/(app)/approvals` |
| `prototype/insights.html` | AI Insights & Analytics | `/[locale]/(app)/insights` |
| `prototype/hr.html` | Human Resources | `/[locale]/(app)/hr` |
| `prototype/admin.html` | Administration | `/[locale]/(app)/admin` |
| `prototype/account.html` | Account & Settings | `/[locale]/(app)/account` |
| `prototype/auth.html` | Auth (login, register, MFA) | `/[locale]/(auth)/login` |
| `prototype/portal/index.html` | Client Portal | `/[locale]/(portal)` |
| `prototype/portal/auth.html` | Client Portal Auth | `/[locale]/(portal)/login` |

### 0.6 Sidebar Navigation Structure

```
MAIN
  Dashboard         (index.html)
  Calendar          (calendar.html)
  Timesheets        (timesheets.html)
  Leaves            (leaves.html)

WORK
  Expenses          (expenses.html)
  Projects          (projects.html)
  Gantt Chart       (gantt.html)
  Resource Planning (planning.html)
  Clients           (clients.html)
  Invoices          (invoices.html)

HR
  Team Directory    (employees.html)
  Human Resources   (hr.html)

AI
  AI Insights       (insights.html)

ADMIN (admin-only)
  Administration    (admin.html)

FOOTER
  Approvals         (approvals.html)  ← live pending count badge
  Account           (account.html)
  Help & Shortcuts
```

### 0.7 Prototype Seed Data

**8 employees:** Sarah Chen (PM/Engineering, 87%), John Smith (Full-Stack/Engineering, 82%), Marco Rossi (Operations Lead/Operations, 88%), Carol Williams (Design Lead/Design, 90%), Alice Wang (On Leave Apr 14–18, 45%), David Park (Finance Lead/Finance, 45%), Emma Laurent (HR/HR, 78%), Bob Taylor (bench/Engineering, 0%)

**4 clients:** Acme Corp, Globex Corp, Initech, Umbrella Corp

**7 active projects** | **12 total employees in admin counts** | **Dashboard KPIs: 12 employees, 394h/week, 7 open projects, 82% team work time**

---

## 1. Global Patterns

> **Design System Files:** `prototype/_tokens.css` defines all design tokens (colors, spacing, typography, shadows). `prototype/_components.css` is the live implementation of every reusable component (buttons, badges, cards, tables, modals). `prototype/_shared.js` contains shared JS utilities for notifications, dropdowns, and real-time patterns. Consult these files for component specs before building any UI element.

### 1.1 Universal Clickable Identity

**RULE: Every employee name, avatar, or mention ANYWHERE in the app is a clickable link to their profile page.**

This applies to:
- Table cells showing employee names
- Approval queue items
- Gantt chart rows
- Calendar event labels
- Notification mentions
- Invoice line items ("Submitted by X")
- Project team member lists
- Comment/note authors
- Dashboard widget items
- Breadcrumbs mentioning an employee
- Search results

**Implementation:** A global `<EmployeeLink>` component that wraps any employee reference. Hover shows a mini-profile card (name, role, department, avatar, current status). Click navigates to full profile.

### 1.2 Universal Entity Linking

Beyond employees, every entity is deeply linked:

| Entity | Clicking it goes to... | Hover shows... |
|--------|----------------------|----------------|
| **Employee** | Employee profile page | Mini-card: name, role, dept, status |
| **Project** | Project detail page | Mini-card: name, client, status, team size |
| **Client** | Client detail page | Mini-card: name, active projects count, total revenue |
| **Leave Request** | Leave detail modal | Status, dates, approver, balance impact |
| **Expense** | Expense detail modal | Amount, receipt preview, approval status |
| **Timesheet** | Timesheet detail modal | Hours breakdown, period, approval status |
| **Invoice** | Invoice detail page | Amount, status, client, project |
| **Department** | Department view (filtered employee list) | Name, head count, manager |

### 1.3 Universal Filtering Pattern

Every list/table in the app supports:

```
┌─────────────────────────────────────────────────────┐
│ 🔍 Search...  │ Filter ▾ │ Sort ▾ │ View ▾ │ Export │
├─────────────────────────────────────────────────────┤
│ Active filters: [Client: Acme ✕] [Status: Active ✕] │
│                 [Clear all filters]                   │
└─────────────────────────────────────────────────────┘
```

- **Search:** Instant, fuzzy, across all visible columns
- **Filters:** Multi-select dropdowns with search inside them
- **Sort:** Click column headers, multi-column sort with Shift+Click
- **Views:** Saved filter+sort combinations ("My billable projects", "Pending approvals this week")
- **Export:** CSV, PDF, or clipboard
- **Saved Views:** Users can save filter combinations as named views, share with team

### 1.4 Universal Empty States

Every view has a purposeful empty state with:
- Relevant 3D illustration
- Explanation of what this section is for
- Primary CTA to create the first item
- Secondary link to documentation/help

### 1.5 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Command palette (search anything) |
| `Cmd/Ctrl + N` | New item (context-aware: new expense on expenses page, etc.) |
| `Cmd/Ctrl + /` | Show keyboard shortcuts |
| `G then D` | Go to Dashboard |
| `G then T` | Go to Timesheets |
| `G then E` | Go to Expenses |
| `G then L` | Go to Leaves |
| `G then P` | Go to Projects |
| `G then G` | Go to Gantt |
| `G then C` | Go to Calendar |
| `Esc` | Close modal/panel/palette |
| `?` | Show help |

### 1.6 Real-time Indicators

- **Green dot** on avatars = online now
- **Yellow dot** = away (idle > 5 min)
- **Gray dot** = offline
- **"X is viewing this"** banner when someone else is on the same page
- **Live counter badges** on sidebar nav items (pending approvals count updates in real-time)

---

## 2. Authentication & Onboarding

> **Prototype:** `prototype/auth.html` — see this file for the approved visual design and all implemented interactions.

### 2.1 Login Page

```
┌──────────────────────────────────────────┐
│                                          │
│     [3D GammaHR Logo — floating,         │
│      subtle rotation animation]          │
│                                          │
│     ┌─────────────────────────┐          │
│     │ Email                   │          │
│     └─────────────────────────┘          │
│     ┌─────────────────────────┐          │
│     │ Password           👁    │          │
│     └─────────────────────────┘          │
│                                          │
│     [Sign In ▸▸▸▸▸▸▸▸▸▸▸▸▸▸▸]          │
│                                          │
│     ─── or ───                           │
│                                          │
│     [🔑 Sign in with Passkey]            │
│     [🏢 Sign in with SSO]               │
│                                          │
│     Forgot password?                     │
│                                          │
│     ───────────────────────              │
│     Don't have an account?               │
│     Contact your administrator           │
│                                          │
└──────────────────────────────────────────┘
```

**Interactions:**
- Email field: Auto-focus on page load
- Password: Toggle visibility icon (eye)
- Sign In button: Loading state with progress animation
- After successful login: Smooth transition to dashboard (no flash)
- MFA prompt: Slides in below password field if user has TOTP enabled
- Passkey: WebAuthn browser prompt
- SSO: Redirects to identity provider
- Error: Shake animation on form + red error message below
- Rate limit: After 5 failures, show "Too many attempts. Try again in X minutes."

### 2.2 First-Time Setup (Company Registration)

```
Step 1: Company Details
├── Company name
├── Industry (select)
├── Size (select: 10-50, 50-200, 200-500, 500+)
└── Country

Step 2: Admin Account
├── First name, Last name
├── Email
├── Password (strength meter with real-time feedback)
└── Confirm password

Step 3: Initial Configuration
├── Fiscal year start month
├── Default work hours per day (default: 8)
├── Default work days per week (default: Mon-Fri)
├── Currency (EUR, USD, GBP, etc.)
└── Language (EN, FR)

Step 4: Invite Team (Optional)
├── Bulk email input (comma-separated or paste from spreadsheet)
├── Default role for invitees (Employee)
└── Skip → do it later
```

**Each step has a progress indicator (stepper with 3D pill shape, filled segments glow)**

### 2.3 Employee Onboarding (Invited User)

```
Step 1: Set Password
├── Create password (strength meter)
├── Confirm password
└── Optional: Set up passkey now

Step 2: Complete Profile
├── Profile photo (upload or take with camera)
├── Job title
├── Phone (optional)
└── Preferred language

Step 3: Quick Tour
├── Interactive walkthrough of key features
├── Highlight: How to submit timesheets
├── Highlight: How to request leave
├── Highlight: How to submit expenses
└── "Get Started" → Dashboard
```

---

## 3. Dashboard (Command Center)

> **Prototype:** `prototype/index.html` — see this file for the approved visual design and all implemented interactions.

The dashboard is NOT a boring set of cards. It's a **command center** — information-dense, visually stunning, and immediately actionable.

### 3.1 Layout

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER: Good morning, Sarah │ Mon, 5 Apr 2026 │ 🔔 │ 👤    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ HERO SECTION (full width) ─────────────────────────────┐ │
│  │                                                         │ │
│  │  "Your Week at a Glance"                                │ │
│  │  ┌─────┬─────┬─────┬─────┬─────┐                      │ │
│  │  │ Mon │ Tue │ Wed │ Thu │ Fri │  ← Mini week timeline │ │
│  │  │ 8h  │ 7h  │ --  │ --  │ --  │  Filled = logged     │ │
│  │  │ ██  │ ██  │ ░░  │ ░░  │ ░░  │  Empty = needs entry  │ │
│  │  └─────┴─────┴─────┴─────┴─────┘                      │ │
│  │  [Quick Log Today's Time ▸]                             │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ STAT CARDS (4-column grid) ──────────────────────────┐  │
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │ │Billable  │ │Utiliz.   │ │Pending   │ │Leave     │  │  │
│  │ │Hours     │ │Rate      │ │Approvals │ │Balance   │  │  │
│  │ │ 142.5h   │ │ 87%      │ │ 12       │ │ 18 days  │  │  │
│  │ │ ▲ +12%   │ │ ▲ +3%    │ │ ● urgent │ │ ▼ -2     │  │  │
│  │ │ [spark]  │ │ [spark]  │ │          │ │ [bar]    │  │  │
│  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ LEFT COLUMN (60%) ────┐ ┌─ RIGHT COLUMN (40%) ───────┐ │
│  │                        │ │                             │ │
│  │ ACTION REQUIRED        │ │ TEAM PRESENCE              │ │
│  │ ┌────────────────────┐ │ │ ┌─────────────────────────┐│ │
│  │ │⚡ 3 timesheets to  │ │ │ │ 🟢 Sarah (you) - Dash  ││ │
│  │ │  approve            │ │ │ │ 🟢 John - Timesheets   ││ │
│  │ │⚡ 2 leave requests  │ │ │ │ 🟡 Alice - Away        ││ │
│  │ │⚡ 1 expense > $500  │ │ │ │ 🔴 Bob - On leave      ││ │
│  │ │  [Review All ▸]     │ │ │ │ ⚫ Carol - Offline      ││ │
│  │ └────────────────────┘ │ │ └─────────────────────────┘│ │
│  │                        │ │                             │ │
│  │ UTILIZATION HEATMAP    │ │ UPCOMING                   │ │
│  │ ┌────────────────────┐ │ │ ┌─────────────────────────┐│ │
│  │ │ [12-week calendar  │ │ │ │ Today: Sprint review 2pm││ │
│  │ │  heatmap showing   │ │ │ │ Tomorrow: Alice OOO     ││ │
│  │ │  team utilization   │ │ │ │ Thu: Invoice due Acme   ││ │
│  │ │  green=good,       │ │ │ │ Fri: Timesheet deadline ││ │
│  │ │  yellow=risk,      │ │ │ │ Next Mon: Bob returns   ││ │
│  │ │  red=over/under]   │ │ │ └─────────────────────────┘│ │
│  │ └────────────────────┘ │ │                             │ │
│  │                        │ │ REVENUE SNAPSHOT            │ │
│  │ RECENT ACTIVITY        │ │ ┌─────────────────────────┐│ │
│  │ ┌────────────────────┐ │ │ │ This month: €45,200     ││ │
│  │ │ [Live activity feed│ │ │ │ Target: €60,000         ││ │
│  │ │  with avatars,     │ │ │ │ [progress bar: 75%]     ││ │
│  │ │  timestamps,       │ │ │ │                         ││ │
│  │ │  entity links]     │ │ │ │ [mini bar chart:        ││ │
│  │ └────────────────────┘ │ │ │  last 6 months revenue] ││ │
│  │                        │ │ └─────────────────────────┘│ │
│  └────────────────────────┘ └─────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Dashboard Widgets Detail

**Hero: Week at a Glance**
- Shows current work week (Mon-Fri)
- Each day: progress bar of hours logged vs. target
- Today highlighted with glow effect
- Click any day → opens timesheet entry for that day
- If current day has no hours → amber warning pulse

**Stat Cards (3D depth effect, glass morphism)**
- Hover: card lifts with shadow deepening (translateY(-2px))
- Click: navigates to relevant detail page
- Sparkline: 30-day mini chart
- Trend indicator: ▲ green (improving), ▼ red (declining)
- Cards are role-aware:
  - Employee sees: My hours, My utilization, My pending, My leave balance
  - PM sees: Team hours, Team utilization, Pending approvals, Active projects
  - Admin sees: Company hours, Company utilization, All pending, Revenue

**Action Required Panel**
- Sorted by urgency (overdue first, then due-today, then upcoming)
- Each item: icon + description + entity link + quick action button
- "Review All" → navigates to Approvals Hub
- Items disappear with smooth animation when resolved
- Real-time: new items slide in from top

**Team Presence**
- Live WebSocket-powered
- Shows all team members with online status
- Click any name → employee profile
- Shows what page they're currently on
- Grouped: Online (sorted by activity), Away, On Leave, Offline
- PM/Admin only (employees see simplified version)

**Utilization Heatmap**
- 12-week grid (rows = weeks, columns = days)
- Color: green (75-100% utilized), yellow (50-75%), red (<50% or >110%)
- Click a cell → shows who was underutilized that day
- Tooltip: date, utilization %, breakdown

**Revenue Snapshot (PM/Admin)**
- Current month actual vs. target
- Animated progress bar
- 6-month trend bar chart
- Click → detailed revenue analytics

**Upcoming**
- Next 7 days of events: leaves, holidays, deadlines, meetings
- Click any item → relevant detail page
- Color-coded by type

**Recent Activity Feed**
- Live-updating stream of team activity
- "Sarah approved John's timesheet for March" with clickable names
- "Alice submitted an expense for €340 (Acme project)" with links
- Infinite scroll, loads more on demand
- Real-time: new activities slide in from top

---

## 4. Employee Directory & Profiles

> **Prototype:** `prototype/employees.html` — see this file for the approved visual design and all implemented interactions.

### 4.1 Employee Directory Page (`/team`)

```
┌──────────────────────────────────────────────────────────────┐
│ Team Directory                           [+ Invite] [Export] │
├──────────────────────────────────────────────────────────────┤
│ 🔍 Search team members...  │ Dept ▾ │ Role ▾ │ Status ▾    │
│ View: [Grid] [List] [Org Chart]                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Grid View:                                                    │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│ │ 🟢          │ │ 🟢          │ │ 🔴          │             │
│ │  [Avatar]   │ │  [Avatar]   │ │  [Avatar]   │             │
│ │ Sarah Chen  │ │ John Smith  │ │ Alice Wang  │             │
│ │ Sr Engineer │ │ PM          │ │ Designer    │             │
│ │ Engineering │ │ Operations  │ │ Design      │             │
│ │             │ │             │ │ On leave    │             │
│ │ Working on: │ │ Working on: │ │ Returns:    │             │
│ │ Acme v2     │ │ Globex API  │ │ Apr 12      │             │
│ │ + 1 more    │ │             │ │             │             │
│ └─────────────┘ └─────────────┘ └─────────────┘             │
│                                                              │
│ List View:                                                    │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ 🟢 [Avatar] Sarah Chen │ Sr Engineer │ Engineering │    │   │
│ │    Acme v2, Initech Portal │ 87% utilized │ [View ▸]   │   │
│ ├────────────────────────────────────────────────────────┤   │
│ │ 🟢 [Avatar] John Smith │ PM │ Operations │             │   │
│ │    Globex API │ 92% utilized │ [View ▸]                │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                              │
│ Org Chart View:                                               │
│         ┌──────────┐                                         │
│         │ CEO      │                                         │
│         │ Marie D. │                                         │
│         └────┬─────┘                                         │
│    ┌─────────┼─────────┐                                     │
│ ┌──┴───┐ ┌──┴───┐ ┌──┴───┐                                 │
│ │ Eng  │ │ Ops  │ │Design│                                  │
│ │ VP   │ │ VP   │ │ VP   │                                  │
│ └──┬───┘ └──┬───┘ └──┬───┘                                 │
│  ┌─┴──┐  ┌─┴──┐  ┌──┴─┐                                   │
│  │Team│  │Team│  │Team│                                     │
│  └────┘  └────┘  └────┘                                     │
└──────────────────────────────────────────────────────────────┘
```

**Three views:**
1. **Grid View** — Card-based, visual, shows avatar + key info + current work
2. **List View** — Compact, information-dense, more columns visible
3. **Org Chart View** — Hierarchical tree showing reporting structure

**Each employee card/row shows:**
- Avatar (with online status dot)
- Full name (CLICKABLE → profile)
- Job title
- Department
- Current project(s)
- Utilization rate (colored: green > 75%, yellow 50-75%, red < 50%)
- Status: Active, On leave (with return date), Away

### 4.2 Employee Profile Page (`/team/:id`)

This is THE most important page in the app. It must tell the complete story of an employee.

```
┌──────────────────────────────────────────────────────────────┐
│ ← Back to Team │ Sarah Chen │ [Edit] [More ▾]               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─ HERO HEADER ──────────────────────────────────────────┐  │
│ │                                                         │  │
│ │  [Large Avatar]  Sarah Chen                             │  │
│ │  🟢 Online      Senior Software Engineer                │  │
│ │                  Engineering Department                  │  │
│ │                  Joined: March 2023 (2 years, 1 month)  │  │
│ │                  Reports to: Marie Dubois                │  │
│ │                  📧 sarah@company.com │ 📱 +33 6...     │  │
│ │                                                         │  │
│ │  ┌────────────┐ ┌────────────┐ ┌────────────┐          │  │
│ │  │ Utilization│ │ Billable   │ │ Leave      │          │  │
│ │  │ This Month │ │ This Month │ │ Remaining  │          │  │
│ │  │   87%      │ │   134h     │ │   18 days  │          │  │
│ │  │ [radial]   │ │ [bar]      │ │ [progress] │          │  │
│ │  └────────────┘ └────────────┘ └────────────┘          │  │
│ │                                                         │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌─ TABS ──────────────────────────────────────────────────┐  │
│ │ [Timeline] [Projects] [Leaves] [Timesheets] [Expenses]  │  │
│ │ [Skills] [Documents]                                     │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                              │
│ ═══ TIMELINE TAB (default) ════════════════════════════════  │
│                                                              │
│ A chronological story of this employee's work:               │
│                                                              │
│  2026 ───────────────────────────────────────                │
│  │                                                           │
│  │ Apr 5   Currently working on:                             │
│  │         ┌──────────────────────────────────┐              │
│  │         │ 🔵 Acme Corp — Website Redesign  │              │
│  │         │    Role: Lead Developer           │              │
│  │         │    Since: Feb 1, 2026              │              │
│  │         │    Rate: €85/h │ 120h logged      │              │
│  │         └──────────────────────────────────┘              │
│  │         ┌──────────────────────────────────┐              │
│  │         │ 🟢 Initech — API Integration     │              │
│  │         │    Role: Contributor               │              │
│  │         │    Since: Mar 15, 2026             │              │
│  │         │    Rate: €85/h │ 45h logged       │              │
│  │         └──────────────────────────────────┘              │
│  │                                                           │
│  │ Mar 22  🏖️ Annual Leave (5 days)                         │
│  │                                                           │
│  │ Mar 1   📋 Timesheet approved — 168h total               │
│  │         Acme: 120h │ Initech: 32h │ Internal: 16h        │
│  │                                                           │
│  │ Feb 15  💰 Expense submitted — €450 (Travel to client)   │
│  │         Project: Acme Corp │ Status: Approved             │
│  │                                                           │
│  │ Feb 1   🚀 Assigned to: Acme Corp — Website Redesign     │
│  │         Assigned by: John Smith (PM)                      │
│  │                                                           │
│  │ Jan 15  🏖️ Sick Leave (2 days)                           │
│  │                                                           │
│  2025 ───────────────────────────────────────                │
│  │                                                           │
│  │ Dec 20  🎄 Holiday: Christmas Break (company-wide)       │
│  │                                                           │
│  │ Nov 1   ✅ Completed: Globex — Data Migration            │
│  │         Duration: 6 months │ Total hours: 840h            │
│  │         Client satisfaction: ⭐⭐⭐⭐⭐                 │
│  │                                                           │
│  │ Oct 10  🏆 Skill added: React Three Fiber                │
│  │                                                           │
│  │ May 1   🚀 Assigned to: Globex — Data Migration          │
│  │                                                           │
│  │ Mar 15  👋 Joined GammaHR                                │
│  │                                                           │
│  └───────────────────────────────────────                    │
│                                                              │
│ ═══ PROJECTS TAB ══════════════════════════════════════════  │
│                                                              │
│  Active Projects:                                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Project        │ Client  │ Role     │ Rate  │ Hours   │  │
│  │ Website Redes. │ Acme    │ Lead Dev │ €85/h │ 120h    │  │
│  │ API Integr.    │ Initech │ Contrib. │ €85/h │ 45h     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Past Projects:                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Project        │ Client │ Duration     │ Total Hours   │  │
│  │ Data Migration │ Globex │ May-Nov 2025 │ 840h          │  │
│  │ CRM Setup      │ Acme   │ Jan-Apr 2025 │ 520h          │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Project History Timeline (visual):                          │
│  2025 Mar ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 2026 Apr        │
│  │▒▒▒▒▒▒▒▒▒│ CRM Setup      │                               │
│  │         │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ Data Migration │               │
│  │                    │▒▒▒▒▒▒▒▒▒▒▒▒▒▓▓▓│ Website Redesign│ │
│  │                              │▓▓▓│ API Integration  │     │
│                                                              │
│ ═══ LEAVES TAB ════════════════════════════════════════════  │
│                                                              │
│  Leave Balances (current year):                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Type        │ Total │ Used │ Pending │ Remaining       │  │
│  │ Annual      │ 25    │ 5    │ 2       │ ████████ 18     │  │
│  │ Sick        │ 12    │ 2    │ 0       │ ██████████ 10   │  │
│  │ Personal    │ 3     │ 0    │ 0       │ ███████████ 3   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Leave History:                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Date Range       │ Type    │ Days │ Status   │ Approver│  │
│  │ Mar 22-26, 2026  │ Annual  │ 5    │ Approved │ John S. │  │
│  │ Jan 15-16, 2026  │ Sick    │ 2    │ Approved │ John S. │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Leave Calendar (mini year view):                            │
│  [52-week heatmap showing all leave days colored by type]    │
│                                                              │
│ ═══ TIMESHEETS TAB ════════════════════════════════════════  │
│                                                              │
│  Monthly summary view with drill-down:                       │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Month     │ Billable │ Non-Bill │ Total │ Target │ Gap │  │
│  │ Mar 2026  │ 152h     │ 16h      │ 168h  │ 176h   │ -8h│  │
│  │ Feb 2026  │ 144h     │ 16h      │ 160h  │ 168h   │ -8h│  │
│  │ Jan 2026  │ 160h     │ 8h       │ 168h  │ 176h   │ -8h│  │
│  └────────────────────────────────────────────────────────┘  │
│  Click month → expands to show daily breakdown by project    │
│                                                              │
│ ═══ EXPENSES TAB ══════════════════════════════════════════  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Date     │ Type     │ Amount │ Project │ Status       │  │
│  │ Feb 15   │ Travel   │ €450   │ Acme    │ ✓ Approved   │  │
│  │ Jan 20   │ Software │ €120   │ —       │ ✓ Approved   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Total this year: €570 │ Billable: €450 │ Non-billable: €120│
│                                                              │
│ ═══ SKILLS TAB ════════════════════════════════════════════  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ [React] [TypeScript] [Rust] [PostgreSQL] [Three.js]   │  │
│  │ [Docker] [AWS] [GraphQL]                               │  │
│  │                                                        │  │
│  │ [+ Add Skill]                                          │  │
│  └────────────────────────────────────────────────────────┘  │
│  Skills are used for: project matching, resource planning     │
│                                                              │
│ ═══ DOCUMENTS TAB ═════════════════════════════════════════  │
│                                                              │
│  Employment contract, ID copies, certifications, etc.        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📄 Employment Contract.pdf │ Uploaded: Mar 2023        │  │
│  │ 📄 ID Copy.pdf │ Uploaded: Mar 2023                    │  │
│  │ 📄 AWS Certification.pdf │ Uploaded: Oct 2025          │  │
│  │ [+ Upload Document]                                    │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 4.3 Mini Profile Card (Hover on any employee name)

```
┌────────────────────────────────┐
│ 🟢 [Avatar] Sarah Chen        │
│ Senior Software Engineer       │
│ Engineering                    │
│ ─────────────────────────────  │
│ Working on: Acme v2, Initech   │
│ Utilization: 87%               │
│ ─────────────────────────────  │
│ [View Profile] [Send Message]  │
└────────────────────────────────┘
```

Appears on hover with 200ms delay. Stays visible while mouse is over it. Dismisses on mouse leave or Esc.

---

## 5. Resource Gantt Chart

> **Prototype:** `prototype/gantt.html` — see this file for the approved visual design and all implemented interactions.

The Gantt chart is the CENTERPIECE of GammaHR v2. It should be the most powerful, filterable, and visually stunning resource planning tool on the market.

### 5.1 Layout

```
┌──────────────────────────────────────────────────────────────┐
│ Resource Planning                                    [Help]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ FILTER BAR (always visible, collapsible):                    │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 🔍 Search...                                             │ │
│ │ Department: [All ▾] Client: [All ▾] Project: [All ▾]    │ │
│ │ Billing: [All ▾] Status: [All ▾] Skills: [All ▾]        │ │
│ │ Utilization: [All ▾]                                     │ │
│ │                                                          │ │
│ │ Quick Filters:                                           │ │
│ │ [Unbilled] [On Leave] [Bench] [Over-allocated]           │ │
│ │ [Available Next Week] [Ending Soon]                      │ │
│ │                                                          │ │
│ │ Saved Views: [My Team ▾] [+ Save Current View]          │ │
│ │ Active: [Client: Acme ✕] [Dept: Engineering ✕]          │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ZOOM: [1W] [2W] [1M] [3M] [6M] [1Y] │ ◀ │ Today │ ▶      │
│                                                              │
│ ┌─────────────┬──────────────────────────────────────────┐  │
│ │ TEAM        │ Apr 2026                                  │  │
│ │ (sticky)    │ 1  2  3  4  5  6  7  8  9  10 11 12 ... │  │
│ │             │ M  T  W  T  F  S  S  M  T  W  T  F  ... │  │
│ ├─────────────┼──────────────────────────────────────────┤  │
│ │             │          ║                                │  │
│ │ 🟢 Sarah C. │ ████████████████████ Acme - Web Redesign │  │
│ │ Sr Engineer │          ║  ▒▒▒▒▒▒▒▒▒ Initech - API     │  │
│ │ 87% util.   │          ║                                │  │
│ │             │          ║  ░░ Annual Leave (Mar 22-26)   │  │
│ ├─────────────┼──────────────────────────────────────────┤  │
│ │ 🟢 John S.  │ ████████████████████████ Globex - Phase 2│  │
│ │ PM          │          ║                                │  │
│ │ 92% util.   │          ║                                │  │
│ ├─────────────┼──────────────────────────────────────────┤  │
│ │ 🔴 Alice W. │ ░░░░░░░░░░░░░░ Annual Leave (Apr 1-14)  │  │
│ │ Designer    │          ║  ████████ Acme - Web Redesign  │  │
│ │ 45% util.   │          ║                                │  │
│ │             │  ████ WARNING: Unassigned Apr 15-30       │  │
│ ├─────────────┼──────────────────────────────────────────┤  │
│ │ ⚫ Bob T.   │  BENCH   ║  █ Starting: Initech May 1    │  │
│ │ Backend Dev │ ⚠️ No    ║                                │  │
│ │ 0% util.    │ project! ║                                │  │
│ └─────────────┴──────────────────────────────────────────┘  │
│                                                              │
│ LEGEND:                                                      │
│ ████ Billable project  ▒▒▒▒ Non-billable project            │
│ ░░░░ Leave (approved)  ░░░░ Leave (pending) [lighter]       │
│ ⚠️ Bench / Unassigned  │║│ Today line                       │
│                                                              │
│ SUMMARY BAR:                                                 │
│ Showing 48/52 team members │ Avg utilization: 78%           │
│ On bench: 3 │ On leave: 5 │ Over-allocated: 2              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Filter Dimensions

| Filter | Options | Purpose |
|--------|---------|---------|
| **Search** | Free text | Find by name, project, client |
| **Department** | Multi-select all departments | Filter by org unit |
| **Client** | Multi-select all clients | "Show me everyone working for Acme" |
| **Project** | Multi-select all projects | "Show me the Acme Website team" |
| **Billing Status** | Billable / Non-billable / Mixed / Bench | "Who's not earning?" |
| **Employee Status** | Active / On Leave / Away / Bench | "Who's available?" |
| **Skills** | Multi-select skill tags | "Who knows React Three Fiber?" |
| **Utilization Range** | Slider: 0% - 150%+ | "Who's under 50% utilized?" |
| **Role** | Admin / PM / Employee | Filter by role |
| **Availability** | Available this week / Available next month | "Who can take a new project?" |

### 5.3 Quick Filters (One-Click)

| Quick Filter | What it shows |
|-------------|---------------|
| **Unbilled** | Employees with < 50% billable time this month |
| **On Leave** | All employees currently on approved leave |
| **Bench** | Employees with no active project assignments |
| **Over-allocated** | Employees assigned > 100% capacity |
| **Available Next Week** | Employees with < 80% allocation next week |
| **Ending Soon** | Employees whose current project ends within 2 weeks |

### 5.4 Gantt Interactions

| Interaction | Result |
|------------|--------|
| **Click employee name** | Navigate to employee profile |
| **Hover employee name** | Show mini profile card |
| **Click project bar** | Open project detail panel (slide-in from right) |
| **Hover project bar** | Tooltip: project name, client, dates, hours logged |
| **Click leave bar** | Open leave detail modal |
| **Drag project bar edge** | Extend/shorten assignment dates |
| **Drag project bar** | Move assignment to different dates |
| **Right-click bar** | Context menu: Edit, Remove, View Project, View Employee |
| **Click empty space** | Quick-assign dialog: pick project for that employee + date range |
| **Click bench/warning area** | "Assign to project" dialog |
| **Scroll** | Smooth horizontal scrolling with momentum |
| **Pinch/zoom** | Change time scale |
| **Double-click day header** | Zoom into that day |
| **Shift+Click column headers** | Multi-sort |

### 5.5 Saved Views

Users can save their current filter + zoom + sort combination as a named view:
- "My Direct Reports" — filters to their managed team
- "Acme Team" — all employees on Acme projects
- "Bench Report" — quick filter: bench only
- "Next Quarter Planning" — 3M zoom, all employees, sorted by availability

Saved views are shareable with other team members.

---

## 6. Leave Management

> **Prototype:** `prototype/leaves.html` — see this file for the approved visual design and all implemented interactions.

### 6.1 Leave Dashboard (`/leaves`)

```
┌──────────────────────────────────────────────────────────────┐
│ Leaves                              [+ Request Leave] [Export]│
├──────────────────────────────────────────────────────────────┤
│ [My Leaves] [Team Leaves] [Leave Calendar]                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ MY BALANCE CARDS:                                            │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ Annual   │ │ Sick     │ │ Personal │ │ WFH      │       │
│ │ 18 left  │ │ 10 left  │ │ 3 left   │ │ 5 left   │       │
│ │ of 25    │ │ of 12    │ │ of 3     │ │ of 5     │       │
│ │ [██░░░]  │ │ [████░]  │ │ [█████]  │ │ [█████]  │       │
│ │ 5 used   │ │ 2 used   │ │ 0 used   │ │ 0 used   │       │
│ │ 2 pending│ │ 0 pending│ │ 0 pending│ │ 0 pending│       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│ FILTER: Status [All ▾] │ Type [All ▾] │ Date Range [▾]     │
│                                                              │
│ MY REQUESTS:                                                 │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ 📅 Mar 22-26, 2026 │ Annual │ 5 days │ ✅ Approved     │   │
│ │    Approved by John Smith on Mar 15                     │   │
│ │    Note: "Family vacation"                              │   │
│ ├────────────────────────────────────────────────────────┤   │
│ │ 📅 Apr 28-29, 2026 │ Annual │ 2 days │ ⏳ Pending      │   │
│ │    Submitted on Apr 3 │ Awaiting: John Smith            │   │
│ │    Note: "Moving day"                                   │   │
│ │    [Cancel Request]                                     │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                              │
│ LEAVE CALENDAR (mini):                                       │
│ [Year view: 12 months × 31 days grid, colored dots for      │
│  each leave day. Click any day to request leave for it.]     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Leave Request Flow

```
1. Click "+ Request Leave" or click a day on the calendar
   └─ Opens: Leave Request Modal

2. Leave Request Modal:
   ┌─────────────────────────────────────────┐
   │ Request Leave                     [✕]   │
   │                                         │
   │ Type: [Annual Leave ▾]                  │
   │ Start: [Apr 28, 2026 📅]               │
   │ End:   [Apr 29, 2026 📅]               │
   │                                         │
   │ Working days: 2 (auto-calculated)       │
   │ Balance after: 16 days remaining        │
   │                                         │
   │ ⚠️ Conflicts: None detected             │
   │ ⚠️ Team: 2 others off that week         │
   │                                         │
   │ Notes: [Moving to new apartment     ]   │
   │                                         │
   │ [Cancel]              [Submit Request]  │
   └─────────────────────────────────────────┘

3. On submit:
   - Optimistic UI: request appears immediately as "Pending"
   - WebSocket notification to approver(s)
   - Email notification to approver(s)
   - Calendar updates in real-time

4. Approval flow:
   - Approver gets notification → clicks → sees request with context
   - Context: who else is off, project impact, leave balance
   - [Approve] or [Reject with reason]
   - Employee gets real-time notification of decision
```

### 6.3 Team Leaves View (PM/Admin)

Shows all team leave requests with:
- Filter by status, department, date range
- Calendar overlay showing team availability
- Conflict detection: warns if too many people from same project/department are off
- Bulk approve/reject for multiple pending requests

---

## 7. Expense Management

> **Prototype:** `prototype/expenses.html` — see this file for the approved visual design and all implemented interactions.

### 7.1 Expense Dashboard (`/expenses`)

```
┌──────────────────────────────────────────────────────────────┐
│ Expenses                         [+ New Expense] [Export]    │
├──────────────────────────────────────────────────────────────┤
│ [My Expenses] [Team Expenses] [Analytics]                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ SUMMARY CARDS:                                               │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │This Month│ │ Pending  │ │ Billable │ │ Top      │       │
│ │ €1,240   │ │ €340     │ │ 78%      │ │ Category │       │
│ │ ▲ vs last│ │ 2 items  │ │ of total │ │ Travel   │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│ FILTER: Status [All ▾] │ Type [All ▾] │ Project [All ▾]    │
│         Billable [All ▾] │ Date Range [▾]                   │
│                                                              │
│ EXPENSE LIST:                                                │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ 💰 €450.00 │ Travel │ Feb 15 │ Acme - Web Redesign    │   │
│ │    ✅ Approved │ Billable │ 📎 receipt.pdf             │   │
│ │    "Flight to client site Paris → Lyon"                 │   │
│ ├────────────────────────────────────────────────────────┤   │
│ │ 💰 €340.00 │ Hotel │ Apr 2 │ Acme - Web Redesign      │   │
│ │    ⏳ Pending │ Billable │ 📎 receipt.jpg              │   │
│ │    "Hotel for 2-night client workshop"                  │   │
│ │    [Edit] [Cancel]                                      │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                              │
│ ANALYTICS TAB:                                               │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ [Expense by Category — Donut Chart]                     │   │
│ │ [Monthly Trend — Bar Chart]                             │   │
│ │ [Top Spenders — Horizontal Bar]                         │   │
│ │ [Billable vs Non-billable — Stacked Bar]               │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 7.2 Expense Submission Flow

```
1. Click "+ New Expense" or drag-and-drop a receipt anywhere
   └─ Opens: Expense Form (full-page slide-in or modal)

2. Smart Receipt Processing (AI-powered):
   ┌─────────────────────────────────────────────┐
   │ New Expense                           [✕]   │
   │                                             │
   │ ┌─────────────────────────────────────────┐ │
   │ │                                         │ │
   │ │  Drop receipt here or click to upload   │ │
   │ │  📷 Take photo │ 📎 Browse files        │ │
   │ │                                         │ │
   │ └─────────────────────────────────────────┘ │
   │                                             │
   │ ✨ AI detected:                             │
   │    Vendor: Marriott Hotel Lyon              │
   │    Amount: €340.00                          │
   │    Date: April 2, 2026                      │
   │    Category: Hotel (suggested)              │
   │                                             │
   │ ─── Confirm or edit: ───                    │
   │                                             │
   │ Type: [Hotel ▾]                (AI filled)  │
   │ Amount: [340.00] EUR ▾         (AI filled)  │
   │ Date: [Apr 2, 2026 📅]        (AI filled)  │
   │ Project: [Acme - Web Redesign ▾]           │
   │ Billable: [✓]                               │
   │ Description: [Hotel for 2-night client  ]   │
   │              [workshop in Lyon          ]   │
   │                                             │
   │ Policy check: ✅ Within €500 daily limit    │
   │ Receipt: ✅ Required and attached           │
   │                                             │
   │ [Cancel]                  [Submit Expense]  │
   └─────────────────────────────────────────────┘

3. On submit:
   - Optimistic UI: expense appears as "Pending"
   - AI verifies: amount matches receipt, date matches
   - Policy engine: checks spending limits, duplicate detection
   - Notification to approver
```

---

## 8. Timesheet Management

> **Prototype:** `prototype/timesheets.html` — see this file for the approved visual design and all implemented interactions.

### 8.1 Timesheet Page (`/timesheets`)

```
┌──────────────────────────────────────────────────────────────┐
│ Timesheets                                    [Export]        │
├──────────────────────────────────────────────────────────────┤
│ [Week View] [Month View] [Approval Queue]                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ◀ Week of Mar 30 - Apr 5, 2026 ▶        [Today] [Copy ▾]   │
│                                                              │
│ ┌──────────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬────┐│
│ │ Project  │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun │Total││
│ │          │ 30  │ 31  │  1  │  2  │  3  │  4  │  5  │    ││
│ ├──────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼────┤│
│ │ Acme     │     │     │     │     │     │     │     │    ││
│ │ Web Rede │ 6   │ 7   │ 8   │ 6   │ 4   │     │     │ 31 ││
│ ├──────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼────┤│
│ │ Initech  │     │     │     │     │     │     │     │    ││
│ │ API Intg │ 2   │ 1   │     │ 2   │ 4   │     │     │  9 ││
│ ├──────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼────┤│
│ │ [+ Add Project Row]                                      ││
│ ├──────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼────┤│
│ │ TOTAL    │ 8   │ 8   │ 8   │ 8   │ 8   │ 0   │ 0   │ 40 ││
│ │ Target   │ 8   │ 8   │ 8   │ 8   │ 8   │ 0   │ 0   │ 40 ││
│ │ Status   │ ✅  │ ✅  │ ✅  │ ✅  │ ✅  │ —   │ —   │ ✅ ││
│ └──────────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴────┘│
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Weekly Total: 40h │ Target: 40h │ ████████████████ 100%  │ │
│ │ Billable: 40h (100%) │ Non-billable: 0h (0%)            │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ [Save Draft]                              [Submit for Review]│
│                                                              │
│ MONTH VIEW:                                                  │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ Heatmap calendar: 31 days × projects                    │   │
│ │ Colors indicate hours logged per day                    │   │
│ │ Click any cell to edit that day's hours                 │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 8.2 Timesheet Interactions

| Interaction | Result |
|------------|--------|
| **Tab between cells** | Navigate left/right/up/down in grid |
| **Type number** | Enters hours (auto-select on focus) |
| **Click project name** | Navigate to project detail |
| **Hover cell** | Show tooltip: "Acme Web Redesign — 6 hours" |
| **Click "+ Add Row"** | Dropdown of assigned projects to add |
| **Copy ▾** | Copy from: last week, same week last month, template |
| **Save Draft** | Saves without submitting; auto-saves every 30 seconds |
| **Submit** | Submits for approval; locks editing |
| **Day exceeds target** | Cell turns amber; > 12h turns red |
| **Day < target** | Cell shows subtle warning (lighter shade) |
| **Weekend cells** | Darker background; warn if entering hours |
| **Holiday** | Cell shows holiday name; grey out; warn if entering hours |
| **Leave day** | Cell shows "On leave"; blocked from entry |

### 8.3 Smart Features

- **Auto-save:** Every 30 seconds, saved as draft
- **Copy forward:** Copy last week's structure (projects + hours pattern)
- **Templates:** Save a week as a template; apply to future weeks
- **Conflict detection:** If someone else is editing your timesheet (admin), show warning
- **Overtime alerts:** Warn when exceeding daily/weekly limits
- **Quick entry:** Type "8" to fill entire day for one project; "4/4" to split
- **Leave integration:** Shows leave days inline, blocks entry
- **Holiday integration:** Shows company holidays, warns on entry

---

## 9. Project Management

> **Prototype:** `prototype/projects.html` — see this file for the approved visual design and all implemented interactions.

### 9.1 Projects List (`/projects`)

```
┌──────────────────────────────────────────────────────────────┐
│ Projects                             [+ New Project] [Export]│
├──────────────────────────────────────────────────────────────┤
│ View: [Board] [List] [Timeline]                              │
│ Filter: Status [All ▾] │ Client [All ▾] │ Billing [All ▾]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ BOARD VIEW (Kanban-style):                                   │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         │
│ │ Planning (3)  │ │ Active (8)   │ │ Completed (5)│         │
│ │              │ │              │ │              │         │
│ │ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌──────────┐ │         │
│ │ │Initech   │ │ │ │Acme Web  │ │ │ │Globex DM │ │         │
│ │ │Portal    │ │ │ │Redesign  │ │ │ │          │ │         │
│ │ │Client:   │ │ │ │Client:   │ │ │ │€120k rev │ │         │
│ │ │Initech   │ │ │ │Acme Corp │ │ │ │⭐⭐⭐⭐⭐│ │         │
│ │ │€85/h     │ │ │ │€85/h     │ │ │ │          │ │         │
│ │ │3 members │ │ │ │5 members │ │ │ └──────────┘ │         │
│ │ │🟢 On track│ │ │ │🟢 On track│ │ │              │         │
│ │ └──────────┘ │ │ └──────────┘ │ │              │         │
│ └──────────────┘ └──────────────┘ └──────────────┘         │
│                                                              │
│ LIST VIEW:                                                    │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │Project     │Client  │Billing│Team│Budget │Health│Status │  │
│ │Acme Web    │Acme    │€85/h  │ 5  │72%    │ 🟢  │Active │  │
│ │Initech API │Initech │€95/h  │ 3  │45%    │ 🟡  │Active │  │
│ │Globex DM   │Globex  │Fixed  │ 0  │100%   │ ✅  │Done   │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 9.2 Project Detail Page (`/projects/:id`)

```
┌──────────────────────────────────────────────────────────────┐
│ ← Projects │ Acme Corp — Website Redesign │ [Edit] [More ▾] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─ PROJECT HEADER ───────────────────────────────────────┐  │
│ │ Client: Acme Corp (clickable)                           │  │
│ │ Status: 🟢 Active │ Billing: €85/hour │ Start: Feb 1   │  │
│ │ Budget consumed: €24,500 / €50,000 │ ███████░░░ 49%    │  │
│ │ Timeline: Feb 1 — Jul 31, 2026 │ ████████░░░░░ 55%     │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                              │
│ [Overview] [Team] [Timesheets] [Expenses] [Invoices]         │
│ [Milestones] [Activity]                                      │
│                                                              │
│ ═══ OVERVIEW ══════════════════════════════════════════════  │
│                                                              │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │
│ │Total Hours│ │ Budget    │ │ Revenue   │ │ Margin    │   │
│ │  288h     │ │ 49% used  │ │ €24,500   │ │ 32%       │   │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘   │
│                                                              │
│ [Hours Trend — Area Chart: weekly hours over project life]   │
│ [Budget Burndown — Line Chart: budget remaining vs time]     │
│                                                              │
│ ═══ TEAM ══════════════════════════════════════════════════  │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ [Avatar] Sarah Chen │ Lead Dev │ €85/h │ 120h logged   │   │
│ │ [Avatar] John Smith │ PM       │ €95/h │ 80h logged    │   │
│ ��� [Avatar] Alice Wang │ Designer │ €75/h │ 88h logged    │   │
│ │ [+ Add Team Member]                                    │   │
│ └────────────────────────────────────────────────────────┘   │
│ All names clickable → employee profile                       │
│                                                              │
│ ═══ MILESTONES ════════════════════════════════════════════  │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ ✅ Discovery & Requirements │ Feb 1-14 │ Complete       │   │
│ │ ✅ Design Phase │ Feb 15 - Mar 15 │ Complete             │   │
│ │ 🔵 Development Sprint 1 │ Mar 16 - Apr 15 │ In Progress │   │
│ │ ⬜ Development Sprint 2 │ Apr 16 - May 15 │ Upcoming     │   │
│ │ ⬜ Testing & QA │ May 16 - Jun 15 │ Upcoming             │   │
│ │ ⬜ Launch │ Jul 1 │ Upcoming                              │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 10. Client Management & Portal

> **Prototype:** `prototype/clients.html` (client management) and `prototype/portal/index.html` (client-facing portal) — see these files for the approved visual design and all implemented interactions.

### 10.1 Client List (`/clients`)

```
┌──────────────────────────────────────────────────────────────┐
│ Clients                              [+ New Client] [Export] │
├──────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────┐   │
│ │ [Logo] Acme Corp                                        │   │
│ │ 3 active projects │ 12 team members │ €145,000 YTD     │   │
│ │ Contact: Jane Doe (jane@acme.com)                       │   │
│ │ Status: 🟢 Active │ Since: Jan 2024                     │   │
│ ├────────────────────────────────────────────────────────┤   │
│ │ [Logo] Globex Corporation                               │   │
│ │ 1 active project │ 4 team members │ €67,000 YTD        │   │
│ │ Contact: Bob Smith (bob@globex.com)                     │   │
│ │ Status: 🟢 Active │ Since: May 2025                     │   │
│ └────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### 10.2 Client Detail (`/clients/:id`)

Shows:
- Client info (name, contacts, address, notes)
- All projects (active + past) — clickable to project detail
- All assigned employees — clickable to employee profile
- Revenue history (chart)
- Outstanding invoices
- Satisfaction score (if tracked)

### 10.3 Client Portal (`/portal` — separate auth)

Clients get their own login to a simplified view:

```
┌──────────────────────────────────────────────────────────────┐
│ [Client Logo] Acme Corp Portal        │ Jane Doe │ [Logout] │
├──────────────────────────────────────────────────────────────┤
│ [Dashboard] [Projects] [Timesheets] [Invoices] [Messages]   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Dashboard:                                                    │
│ - Active projects overview with health status                │
│ - Hours logged this month (by team member)                   │
│ - Outstanding invoices                                       │
│ - Recent activity                                            │
│                                                              │
│ Projects:                                                     │
│ - View project progress, milestones, team                    │
│ - See burndown charts and budget consumption                 │
│ - Read-only (clients can't modify)                           │
│                                                              │
│ Timesheets:                                                   │
│ - View hours logged per project per week                     │
│ - Approve/flag timesheet entries                             │
│ - Export reports                                             │
│                                                              │
│ Invoices:                                                     │
│ - View all invoices (draft/sent/paid)                        │
│ - Download PDF                                               │
│ - Mark as paid (triggers notification)                       │
│                                                              │
│ Messages:                                                     │
│ - Threaded communication with project team                   │
│ - Attach files                                               │
│ - @mention team members                                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 11. Invoicing

> **Prototype:** `prototype/invoices.html` — see this file for the approved visual design and all implemented interactions.

### 11.1 Invoice List (`/invoices`)

Filter by: Status, Client, Project, Date Range, Amount Range

### 11.2 Invoice Generation

```
1. Click "Generate Invoice"
2. Select: Client, Project, Date Range
3. System auto-calculates:
   - Timesheet hours × rates per employee
   - Daily rates × days
   - Approved billable expenses
   - Fixed monthly fees
   - Lump sum milestones
4. Preview line items — user can edit/add/remove
5. Add notes, payment terms, due date
6. Generate → PDF created (Typst)
7. Status: Draft → Sent → Paid
```

### 11.3 Invoice Detail

- Full breakdown: line items with employee names (clickable), hours, rates
- PDF preview embedded
- Status history timeline
- Payment tracking
- Client portal link (one-click share)

---

## 12. Calendar

> **Prototype:** `prototype/calendar.html` — see this file for the approved visual design and all implemented interactions.

### 12.1 Team Calendar (`/calendar`)

```
┌──────────────────────────────────────────────────────────────┐
│ Calendar                                 [+ Quick Leave]     │
├──────────────────────────────────────────────────────────────┤
│ [Day] [Week] [Month] [Year]    │ ◀ April 2026 ▶ │ [Today] │
│ Filter: Dept [All ▾] │ Type [All ▾] │ Show: ☑Leaves         │
│         ☑Projects ☑Holidays ☑Milestones                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Month View:                                                   │
│ ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐               │
│ │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │ Sun │               │
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤               │
│ │  1  │  2  │  3  │  4  │  5  │  6  │  7  │               │
│ │Alice│     │     │     │     │     │     │               │
│ │Leave│     │     │     │     │     │     │               │
│ │ +2  │     │     │Sprint│    │     │     │               │
│ │     │     │     │Review│    │     │     │               │
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤               │
│ │  8  │  9  │ ... │     │     │     │     │               │
│ └─────┴─────┴─────┴─────┴─────┴─────┴─────┘               │
│                                                              │
│ Color legend:                                                 │
│ 🔵 Annual Leave  🟣 Sick Leave  🟠 Project Milestone         │
│ 🟢 Holiday       🔴 Deadline    ⚪ WFH                       │
│                                                              │
│ Click any day → Quick actions: Request leave, Add event      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 13. Approvals Hub

> **Prototype:** `prototype/approvals.html` — see this file for the approved visual design and all implemented interactions.

### 13.1 Unified Approval Dashboard (`/admin/approvals`)

```
┌──────────────────────────────────────────────────────────────┐
│ Approvals                              [Bulk Actions ▾]      │
├──────────────────────────────────────────────────────────────┤
│ [All (12)] [Leaves (3)] [Timesheets (7)] [Expenses (2)]     │
│ Sort: [Urgency ▾] │ Filter: Dept [All ▾] │ Employee [All ▾]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ ⚡ URGENT (overdue):                                         │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ ☐ 🕐 Timesheet │ John Smith │ Mar 23-29 │ 42h │ 3d ago│   │
│ │    Projects: Acme (32h), Initech (10h)                  │   │
│ │    [Approve ✓] [Reject ✕] [View Details]                │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                              │
│ 📋 PENDING:                                                  │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ ☐ 🏖️ Leave │ Alice Wang │ Apr 28-29 │ 2 days │ Today  │   │
│ │    Type: Annual │ Balance after: 16 days                │   │
│ │    Team impact: No conflicts detected                   │   │
│ │    [Approve ✓] [Reject ✕] [View Details]                │   │
│ ├────────────────────────────────────────────────────────┤   │
│ │ ☐ 💰 Expense │ Bob Taylor │ €340 │ Hotel │ Yesterday   │   │
│ │    Project: Acme │ Billable │ Receipt: ✅ Attached      │   │
│ │    Policy: ✅ Within limits                              │   │
│ │    [Approve ✓] [Reject ✕] [View Details]                │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                              │
│ BULK: [Select All] → [Approve Selected (3)] [Reject Sel.]  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Key features:**
- Sorted by urgency (overdue first)
- Rich context inline (no need to open details for simple approvals)
- One-click approve/reject
- Bulk actions for batch processing
- Real-time: new items appear automatically
- Keyboard shortcuts: `A` = approve selected, `R` = reject (opens reason modal)

---

## 14. Admin & Configuration

> **Prototype:** `prototype/admin.html` — see this file for the approved visual design and all implemented interactions.

### 14.1 Admin Dashboard

- User management (CRUD, invite, deactivate, role assignment)
- Department management (create, assign managers, hierarchy)
- Leave type configuration (name, balance, carryover rules, accrual)
- Expense type configuration (categories, limits, receipt rules)
- Company settings (fiscal year, work hours, holidays, currency)
- Audit log viewer (filterable, searchable)
- System health monitoring

### 14.2 Company Holidays

```
┌──────────────────────────────────────────────────────────────┐
│ Company Holidays                         [+ Add Holiday]     │
├──────────────────────────────────────────────────────────────┤
│ Year: [2026 ▾]                                               │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ Jan 1  │ New Year's Day │ Full day │ [Edit] [Delete]    │   │
│ │ Apr 6  │ Easter Monday │ Full day │ [Edit] [Delete]     │   │
│ │ May 1  │ Labour Day │ Full day │ [Edit] [Delete]        │   │
│ │ Jul 14 │ Bastille Day │ Full day │ [Edit] [Delete]      │   │
│ │ Dec 25 │ Christmas │ Full day │ [Edit] [Delete]         │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                              │
│ [Import standard holidays: France ▾]                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 15. AI Insights & Analytics

> **Prototype:** `prototype/insights.html` — see this file for the approved visual design and all implemented interactions.

### 15.1 AI Insights Dashboard (`/insights`)

```
┌──────────────────────────────────────────────────────────────┐
│ AI Insights                                    [Ask AI ▾]    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ 🤖 SMART ALERTS:                                             │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ ⚠️ Bob Taylor has been on bench for 3 weeks.           │   │
│ │   Suggestion: Assign to Initech API (skills match)     │   │
│ │   [Assign ▸] [Dismiss]                                 │   │
│ ├────────────────────────────────────────────────────────┤   │
│ │ 📈 Acme project is trending 15% over budget.           │   │
│ │   At current rate, budget exhausted by May 20.          │   │
│ │   [View Burndown ▸] [Notify PM ▸]                      │   │
│ ├────────────────────────────────────────────────────────┤   │
│ │ 🔍 Anomaly: Sarah's expense on Apr 2 (€340) is 2x     │   │
│ │   her average hotel expense.                            │   │
│ │   [Review Expense ▸] [Mark as OK ▸]                    │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                              │
│ 💬 ASK AI (Natural Language):                                │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ "Who worked the most billable hours last quarter?"      │   │
│ │                                                        │   │
│ │ Answer: Sarah Chen logged 480 billable hours in Q1      │   │
│ │ 2026, the highest on the team. Next closest was John    │   │
│ │ Smith with 420 hours.                                   │   │
│ │                                                        │   │
│ │ [Show chart ▸] [Export data ▸]                         │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                              │
│ ANALYTICS DASHBOARDS:                                         │
│ [Utilization] [Revenue] [Expenses] [Leave Patterns]          │
│ [Team Performance] [Client Health]                           │
│                                                              │
│ Each analytics view: interactive charts, drill-down,          │
│ date range selection, comparison mode (vs. last period),     │
│ export to PDF/CSV                                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 15.2 AI Features

| Feature | Description |
|---------|------------|
| **Expense OCR** | Auto-extract vendor, amount, date from receipt photo |
| **Expense Categorization** | Suggest expense type based on description/vendor |
| **Anomaly Detection** | Flag unusual expenses, hours, leave patterns |
| **Natural Language Queries** | "Show me all employees on Acme projects who logged < 30h last week" |
| **Budget Forecasting** | Predict budget exhaustion date based on burn rate |
| **Resource Suggestions** | Recommend which bench employee to assign based on skills + availability |
| **Duplicate Detection** | Flag potential duplicate expense submissions |
| **Smart Notifications** | Only notify about things that need attention (reduce noise) |

---

## 16. Resource Planning & Forecasting

> **Prototype:** `prototype/planning.html` — see this file for the approved visual design and all implemented interactions.

### 16.1 Capacity Planning (`/planning`)

```
┌──────────────────────────────────────────────────────────────┐
│ Resource Planning                              [Scenarios ▾] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ CAPACITY OVERVIEW (next 3 months):                           │
│ ┌────────────────────────────────────────────────────────┐   │
│ │            Apr        May        Jun                    │   │
│ │ Available: 2,080h    2,160h     2,080h                 │   │
│ │ Allocated: 1,872h    1,944h     1,664h                 │   │
│ │ Gap:       +208h     +216h      +416h  ← growing gap   │   │
│ │                                                        │   │
│ │ [Stacked bar chart showing allocated vs available]     │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                              │
│ BENCH FORECAST:                                              │
│ ┌────────────────────────────────────────────────────────┐   │
│ │ Currently on bench: 3 employees                         │   │
│ │ Ending projects this month: 2 employees (Alice, Carol)  │   │
│ │ Starting projects: 1 employee (Bob → Initech, May 1)    │   │
│ │                                                        │   │
│ │ Net bench in 30 days: 4 employees                      │   │
│ │ Revenue at risk: €32,000/month                         │   │
│ │                                                        │   │
│ │ Recommended actions:                                   │   │
│ │ 🤖 Alice Wang has skills matching Globex Phase 3        │   │
│ │ 🤖 Carol Kim could support Acme Web Redesign           │   │
│ └────────────────────────────────────────────────────────┘   │
│                                                              │
│ WHAT-IF SCENARIOS:                                           │
│ "What if we win the Contoso deal? (8 FTEs needed)"          │
│ → Shows: who's available, who needs to be reallocated,       │
│   hiring gap, revenue projection                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 17. Notifications & Real-time

> **Prototype:** `prototype/_shared.js` implements the notification and real-time patterns used across all pages — see this file for the approved interaction model.

### 17.1 Notification Center

```
┌─────────────────────────────────┐
│ Notifications           [⚙️]    │
│ [All] [Unread (5)] [Mentions]  │
├─────────────────────────────────┤
│ TODAY                           │
│ ┌─────────────────────────────┐ │
│ │ 🟢 John approved your leave │ │
│ │    Apr 28-29 │ 2 min ago    │ │
│ ├─────────────────────────────┤ │
│ │ 🟢 New timesheet to review  │ │
│ │    From: Bob T. │ 15 min ago│ │
│ ├─────────────────────────────┤ │
│ │ 🔴 Invoice #INV-042 overdue│ │
│ │    Acme Corp │ 1 hour ago   │ │
│ └─────────────────────────────┘ │
│ YESTERDAY                       │
│ └─────────────────────────────┘ │
│ [Mark All Read] [Settings]     │
└─────────────────────────────────┘
```

### 17.2 Real-time Events

| Event | WebSocket Channel | UI Update |
|-------|------------------|-----------|
| Leave approved/rejected | `user:{id}` | Toast + badge + dashboard |
| New approval needed | `role:{role}:approvals` | Badge counter + push |
| Timesheet submitted | `project:{id}` | Dashboard widget update |
| Expense submitted | `team:{dept_id}` | Dashboard widget update |
| Employee goes online/offline | `tenant:{id}:presence` | Avatar dot color |
| Invoice paid | `project:{id}` | Toast + dashboard |
| AI insight generated | `user:{id}:insights` | Insights panel update |
| Someone viewing same page | `page:{path}` | "X is also viewing" banner |

---

## 18. Search & Command Palette

> **Prototype:** The command palette and search interactions are implemented across all prototype pages via `prototype/_shared.js` — see that file for the approved behavior.

### 18.1 Command Palette (`Cmd/Ctrl + K`)

```
┌──────────────────────────────────────────────────────────────┐
│ 🔍 Search anything...                                        │
├──────────────────────────────────────────────────────────────┤
│ RECENT:                                                      │
│   🕐 Sarah Chen — viewed 5 min ago                           │
│   🕐 Acme Web Redesign — viewed 1h ago                       │
│                                                              │
│ QUICK ACTIONS:                                               │
│   ⚡ New leave request                                       │
│   ⚡ New expense                                             │
│   ⚡ Submit timesheet                                        │
│   ⚡ Generate invoice                                        │
│                                                              │
│ NAVIGATION:                                                  │
│   📄 Dashboard                                               │
│   📄 Timesheets                                              │
│   📄 Expenses                                                │
│   📄 Projects                                                │
│   📄 Gantt Chart                                             │
├──────────────────────────────────────────────────────────────┤
│ Typing "sarah" shows:                                        │
│   👤 Sarah Chen — Senior Engineer, Engineering               │
│   📋 Sarah's Timesheet — March 2026                          │
│   💰 Sarah's Expense — €450 Travel                           │
│   📅 Sarah's Leave — Apr 28-29                               │
├──────────────────────────────────────────────────────────────┤
│ Typing "acme" shows:                                         │
│   🏢 Acme Corp — Client                                      │
│   📁 Acme Web Redesign — Project (Active)                    │
│   📁 Acme CRM Setup — Project (Completed)                    │
│   📄 Invoice #INV-042 — Acme Corp                            │
└──────────────────────────────────────────────────────────────┘
```

**Powered by Meilisearch:** Instant (<50ms), typo-tolerant, searches across ALL entities.

---

## 19. Account & Settings

> **Prototype:** `prototype/account.html` — see this file for the approved visual design and all implemented interactions.

### 19.1 User Account (`/account`)

- Profile editing (name, photo, phone, bio)
- Password change
- MFA setup (TOTP + WebAuthn passkey)
- Notification preferences (email, in-app, per event type)
- Locale preference (EN/FR)
- Theme preference (dark/light/auto)
- Active sessions (view and revoke)
- Data export (GDPR: download all your data)

---

## 20. Navigation & Information Architecture

> **Prototype:** The navigation and information architecture is implemented consistently across all prototype pages — see any prototype HTML file for the approved sidebar, topbar, and mobile nav patterns. `prototype/_layout.css` defines the layout system.

### 20.1 Complete Sidebar

```
MAIN
├── Dashboard
├── Timesheets
├── Expenses
├── Leaves
├── Calendar

WORK
├── Projects
├── Clients (PM/Admin)
├── Resource Planning (PM/Admin)
├── Gantt Chart (PM/Admin)

FINANCE
├── Invoices (PM/Admin)
├── Analytics (PM/Admin)

ADMIN (Admin only)
├── Team Directory
├── Approvals
├── Departments
├── Configuration
├── Audit Log

AI
├── Insights
├── Ask AI

BOTTOM
├── Account & Settings
├── Help & Shortcuts
├── Collapse Sidebar
```

### 20.2 Breadcrumb Patterns

```
Dashboard
Team > Sarah Chen
Team > Sarah Chen > Timesheets
Projects > Acme Web Redesign > Team
Clients > Acme Corp > Projects
Invoices > INV-042
Admin > Configuration > Leave Types
```

### 20.3 URL Structure

```
/[locale]/dashboard
/[locale]/timesheets
/[locale]/timesheets/:batchId
/[locale]/expenses
/[locale]/expenses/:id
/[locale]/leaves
/[locale]/leaves/:id
/[locale]/calendar
/[locale]/projects
/[locale]/projects/:id
/[locale]/projects/:id/team
/[locale]/projects/:id/timesheets
/[locale]/projects/:id/expenses
/[locale]/projects/:id/invoices
/[locale]/projects/:id/milestones
/[locale]/clients
/[locale]/clients/:id
/[locale]/clients/:id/projects
/[locale]/planning
/[locale]/gantt
/[locale]/invoices
/[locale]/invoices/:id
/[locale]/team
/[locale]/team/:id
/[locale]/team/:id/timeline
/[locale]/team/:id/projects
/[locale]/team/:id/leaves
/[locale]/team/:id/timesheets
/[locale]/team/:id/expenses
/[locale]/team/:id/skills
/[locale]/team/:id/documents
/[locale]/insights
/[locale]/analytics
/[locale]/admin/approvals
/[locale]/admin/departments
/[locale]/admin/configuration
/[locale]/admin/audit-log
/[locale]/account
/[locale]/account/security
/[locale]/account/notifications
/[locale]/account/sessions
/[locale]/hr
/[locale]/hr?tab=recruitment
/[locale]/hr?tab=onboarding
/[locale]/hr?tab=offboarding
/[locale]/hr?tab=records

CLIENT PORTAL (separate app):
/portal/dashboard
/portal/projects
/portal/projects/:id
/portal/timesheets
/portal/invoices
/portal/invoices/:id
/portal/messages
```

---

## 21. Human Resources Module

> **Prototype:** `prototype/hr.html` — This page was added after the initial blueprint was written and covers the full employee lifecycle beyond the directory. It must NOT be skipped in any future implementation sprint.

### 21.1 Overview

**Route:** `/[locale]/hr`
**Access:** Admin, HR role
**Primary CTA:** "New Job Posting"
**Subtitle:** "Manage recruitment, onboarding, offboarding, and employee lifecycle"

The HR module is a 4-tab page covering every stage of an employee's lifecycle from candidate to alumni.

```
┌──────────────────────────────────────────────────────────────┐
│ Human Resources                          [New Job Posting]   │
├──────────────────────────────────────────────────────────────┤
│ [Briefcase Recruitment 47] [UserPlus Onboarding 3]           │
│ [UserMinus Offboarding 2]  [FileText Employee Records]       │
├──────────────────────────────────────────────────────────────┤
│  (tab content below)                                         │
└──────────────────────────────────────────────────────────────┘
```

---

### 21.2 Tab 1 — Recruitment

**KPI row (3 stat cards):**
| Stat | Value | Trend |
|------|-------|-------|
| Open Positions | 8 | +2 this month |
| Active Candidates | 47 | 12 in interview stage |
| Avg. Time to Hire | 28 days | -3 days vs last quarter |

**Recruitment Pipeline — Kanban board (5 columns):**

```
Applied (15) → Screening (8) → Interview (12) → Offer (4) → Hired (8)
```

Each candidate card shows:
- Avatar (initials) + name
- Position applied for
- Application date
- Source tag: `LinkedIn` / `Referral: [name]` / `Website`
- In Screening/Interview: AI score badge (e.g. `★ 85/100`)
- In Interview: next interview date + interviewer name + round badge (1st Round / 2nd Round / Final Round)
- In Offer: salary offered + status badge (Pending / Accepted)
- In Hired: start date + department

**Toolbar:** Filter button + Export button above the Kanban.

**Candidate sources:** LinkedIn (blue), Referral (green with referrer name), Website (gray)

**Seed data candidates:**
- Applied: Maria Santos (Senior Frontend Dev, LinkedIn, Apr 1), James Wilson (DevOps, Referral: Sarah Chen, Mar 28), Aisha Patel (UX Designer, Website, Mar 25)
- Screening: Thomas Mueller (Backend Dev, LinkedIn, ★85/100), Lucia Sanchez (Marketing Mgr, Referral, ★72/100)
- Interview: Elena Kowalski (PM, 2nd Round, Apr 7 with John Smith), Nina Karlsson (Sr Backend Dev, 1st Round, Apr 8 with David Park), Pierre Martin (Data Engineer, Final Round, Apr 9 with Sarah Chen)
- Offer: Raj Krishnan (Data Analyst, €55k/yr, Pending), Sofia Oliveira (Product Designer, €62k/yr, Accepted)
- Hired: Yuki Tanaka (QA Engineer, starts May 5, Engineering), Ahmed Hassan (Sales Executive, starts Apr 14, Sales)

---

### 21.3 Tab 2 — Onboarding

**Active onboardings — 3-column card grid:**

Each onboarding card shows:
- Avatar + name + role + department
- Start date
- Progress bar with "X of 8 tasks complete" + percentage
- Checklist of 8 standard tasks (checkable):
  1. Contract signed
  2. Equipment ordered
  3. IT access created
  4. Welcome email sent
  5. Buddy assigned: [buddy name]
  6. First day orientation scheduled
  7. Week 1 check-in scheduled
  8. 30-day review scheduled

Progress bar color: green (>50%), warning/amber (<50%)

**Seed data — 3 active onboardings:**
| Person | Role | Start | Progress |
|--------|------|-------|---------|
| Yuki Tanaka | QA Engineer — Engineering | Apr 1, 2026 | 5/8 (62%) — buddy: Sophie Dubois |
| Ahmed Hassan | Sales Executive — Sales | Apr 14, 2026 | 2/8 (25%) |
| Clara Bergmann | Junior Developer — Engineering | Apr 21, 2026 | 0/8 (0%) |

**Onboarding Templates section** (below active onboardings):
- Engineering Onboarding — 12 tasks, used 23 times
- Sales Onboarding — 10 tasks, used 15 times
- General Onboarding — 8 tasks, used 45 times
- "New Template" ghost button

---

### 21.4 Tab 3 — Offboarding

**Active offboardings** — card list, each with:
- Employee name, role, last working day
- Status badge: "In Progress" (warning)
- Checklist grouped into 3 categories:
  - **IT & Access:** Revoke system access, Return company laptop, Archive email & transfer contacts
  - **HR & Payroll:** Process final payroll, Issue reference letter, Exit interview completed
  - **Knowledge Transfer:** Document ongoing projects, Handover to replacement
- Live progress bar (updates as checkboxes ticked)

**Seed data — 2 active offboardings:**
| Person | Role | Last Day | Progress |
|--------|------|---------|---------|
| James Wilson | DevOps Engineer | Apr 30, 2026 | 4/8 tasks (50%) |
| Marc Lefevre | Senior Consultant | Apr 15, 2026 | 3/5 tasks (60%) |

**Completed Offboardings table** (below active):
| Employee | Department | Last Day | Reason | Status |
|----------|-----------|---------|--------|--------|
| Karl Nielsen | Engineering | Mar 15, 2026 | Resignation | Complete |
| Irene Li | Design | Feb 28, 2026 | Contract End | Complete |
| Pavel Volkov | Sales | Jan 31, 2026 | Relocation | Complete |

**Start Offboarding** primary button — opens wizard.

---

### 21.5 Tab 4 — Employee Records

**KPI row (4 stat cards):**
| Stat | Value | Detail |
|------|-------|--------|
| Total Employees | 48 | +3 this quarter |
| Active Contracts | 45 | 93.8% of total |
| On Probation | 3 | 1 ending this month |
| Upcoming Renewals | 2 | Within 30 days |

**Recent Lifecycle Events table:**
Columns: Employee | Event | Details | Date | Status

Event types (with icons/badges): Promotion, Contract Renewal, Department Transfer, Probation End, Work Anniversary, Role Change

Table is filterable. Mobile: collapses to `mobile-cards` pattern.

---

### 21.6 Implementation Notes

- Tab state persists in URL query param: `?tab=recruitment`
- Deep-link `hr.html#tab-onboarding` anchors work (validated in prototype)
- The sidebar "Human Resources" nav item links here (active state on `hr.html`)
- From `employees.html`, "Onboarding" and "Recruitment" links go to `hr.html?tab=onboarding` and `hr.html?tab=recruitment`
- All candidate names are NOT employees yet — they do not appear in the employee directory
- Once Hired + Onboarding complete, employee moves to `employees.html` directory
