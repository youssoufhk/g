# Design System

> Status: LOCKED. Do not modify values. Source of truth for visual design.
> If it is not in this document, it does not exist in the app.

---

## 1. Foundation

Consistency comes from atoms, not templates:

1. Shell (sidebar, topbar, bottom nav) is pixel-identical on every page.
2. Every atom has fixed dimensions. No "flexible" variants.
3. Every page uses exactly one of 5 content patterns composed from existing atoms.
4. No props like "change my height" or "move my search bar". No improvisation.

The user's brain stops reading the chrome and only reads the content.

---

## 2. Design Tokens

**LOCKED. DO NOT MODIFY.** All tokens live in `prototype/_tokens.css` and are imported unchanged into `frontend/styles/tokens.css`. Tailwind references these CSS variables in `tailwind.config.ts`. Any agent that edits these values must stop immediately; the Earth & Sage palette is founder-approved and frozen.

This section is a human-readable mirror of `prototype/_tokens.css`. If the two ever drift, the prototype file is the source of truth.

### 2.1 Color System - Earth & Sage (LOCKED)

```css
/* Backgrounds & Surfaces (dark mode default) */
--color-bg:             hsl(35, 16%, 5%);   /* Page background */
--color-surface-0:      hsl(35, 13%, 8%);   /* Base surface */
--color-surface-1:      hsl(35, 11%, 11%);  /* Card surface */
--color-surface-2:      hsl(35, 9%, 15%);   /* Elevated surface */
--color-surface-3:      hsl(35, 7%, 19%);   /* Hover / active surface */

/* Primary - Soft Sage */
--color-primary:        hsl(155, 26%, 46%);
--color-primary-hover:  hsl(155, 26%, 52%);
--color-primary-active: hsl(155, 26%, 40%);
--color-primary-muted:  hsla(155, 26%, 46%, 0.14);

/* Accent - Terracotta */
--color-accent:         hsl(30, 58%, 50%);
--color-accent-hover:   hsl(30, 58%, 56%);
--color-accent-active:  hsl(30, 58%, 44%);
--color-accent-muted:   hsla(30, 58%, 50%, 0.14);

/* Semantic */
--color-success:        hsl(152, 22%, 44%);
--color-success-muted:  hsla(152, 22%, 44%, 0.15);
--color-warning:        hsl(38, 65%, 50%);
--color-warning-muted:  hsla(38, 65%, 50%, 0.15);
--color-error:          hsl(5, 65%, 52%);
--color-error-muted:    hsla(5, 65%, 52%, 0.15);
--color-error-hover:    hsl(5, 65%, 58%);
--color-info:           hsl(200, 40%, 52%);
--color-info-muted:     hsla(200, 40%, 52%, 0.15);

/* Financial - Gold */
--color-gold:           hsl(38, 60%, 48%);
--color-gold-hover:     hsl(38, 60%, 54%);
--color-gold-muted:     hsla(38, 60%, 48%, 0.15);

/* Text */
--color-text-1:         hsl(40, 28%, 90%);  /* Primary text - parchment cream */
--color-text-2:         hsl(35, 10%, 55%);  /* Secondary text */
--color-text-3:         hsl(35, 8%, 38%);   /* Tertiary / meta */
--color-text-inv:       hsl(35, 16%, 5%);   /* Text on light surfaces */

/* On-Color (text on filled backgrounds) */
--color-white:              #fff;
--color-text-on-primary:    #fff;
--color-text-on-error:      #fff;
--color-text-on-accent:     #fff;

/* Borders */
--color-border:         hsl(35, 10%, 14%);
--color-border-subtle:  hsl(35, 8%, 10%);
--color-border-strong:  hsl(35, 12%, 22%);

/* Chart Colors (6-series, colorblind-safe) */
--color-chart-1:        hsl(155, 26%, 46%);
--color-chart-2:        hsl(38, 60%, 48%);
--color-chart-3:        hsl(30, 58%, 50%);
--color-chart-4:        hsl(200, 40%, 52%);
--color-chart-5:        hsl(270, 45%, 58%);
--color-chart-6:        hsl(5, 65%, 52%);
--color-chart-5-muted:  hsla(270, 45%, 58%, 0.15);

/* Gantt / Planning Bar Colors */
--color-bar-billable:   hsla(155, 26%, 46%, 0.3);
--color-bar-nonbillable:hsla(200, 40%, 52%, 0.25);
--color-bar-leave:      hsla(200, 40%, 52%, 0.08);
--color-bar-bench:      hsla(38, 65%, 50%, 0.08);
--color-surface-weekend:hsla(35, 10%, 8%, 0.6);
--color-row-hover:      hsla(35, 10%, 11%, 0.4);
--color-internal:       var(--color-bar-nonbillable);

/* WFH / Remote */
--color-wfh:            hsl(175, 35%, 45%);
--color-wfh-muted:      hsla(175, 35%, 45%, 0.15);
```

**Light mode** overrides via `[data-theme="light"]`: surfaces flip to `hsl(40, 20%, 97%)` family, primary deepens to `hsl(155, 30%, 34%)`, accent deepens to `hsl(30, 60%, 42%)`, text flips to `hsl(35, 12%, 10%)`. Dark mode is default per core principle 9 in `MASTER_PLAN.md`. Full light-mode token set is in `prototype/_tokens.css` lines 177-256.

### 2.2 Typography

```css
--font-sans:  'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono:  'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;

/* Type Scale */
--text-display-xl:  2.25rem;   /* 36px */
--text-display-lg:  1.875rem;  /* 30px */
--text-heading-1:   1.5rem;    /* 24px */
--text-heading-2:   1.25rem;   /* 20px */
--text-heading-3:   1rem;      /* 16px */
--text-body-lg:     1rem;      /* 16px */
--text-body:        0.875rem;  /* 14px - default */
--text-body-sm:     0.8125rem; /* 13px */
--text-caption:     0.75rem;   /* 12px */
--text-overline:    0.75rem;   /* 12px */
--text-mono:        0.8125rem; /* 13px */

/* Font Weights */
--weight-regular:   400;
--weight-medium:    500;
--weight-semibold:  600;
--weight-bold:      700;

--letter-spacing-caps: 0.05em;
```

Body font-size base is 16px html root with default body text at 14px (`--text-body`). Line height is 1.5 for body, tighter for headings.

### 2.3 Spacing Scale (4px base)

```css
--space-0:   0px;
--space-0-5: 2px;
--space-1:   4px;
--space-1-5: 6px;
--space-2:   8px;
--space-3:   12px;
--space-4:   16px;
--space-5:   20px;
--space-6:   24px;
--space-7:   28px;
--space-8:   32px;
--space-9:   36px;
--space-10:  40px;
--space-11:  44px;
--space-12:  48px;
--space-14:  56px;
--space-16:  64px;
--space-18:  72px;
--space-20:  80px;
```

### 2.4 Border Radius

```css
--radius-none: 0px;
--radius-sm:   4px;    /* Inputs, badges */
--radius-md:   8px;    /* Buttons, tags */
--radius-lg:   12px;   /* Cards */
--radius-xl:   16px;   /* Modals, large containers */
--radius-2xl:  24px;   /* Feature cards */
--radius-full: 9999px; /* Pills, avatars */
```

### 2.5 Shadows (Dark Mode)

```css
--shadow-0: none;
--shadow-1: 0 1px 2px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.15);
--shadow-2: 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2);
--shadow-3: 0 4px 8px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.2);
--shadow-4: 0 8px 16px rgba(0,0,0,0.3), 0 16px 32px rgba(0,0,0,0.25);
--shadow-5: 0 16px 32px rgba(0,0,0,0.35), 0 32px 64px rgba(0,0,0,0.3);
--shadow-md: var(--shadow-3);
```

Light mode shadows are lighter (`rgba(0,0,0,0.05-0.12)`).

### 2.6 Overlay & Glassmorphism

```css
--overlay-bg:      rgba(0,0,0,0.6);
--overlay-bg-soft: rgba(0,0,0,0.5);

--glass-bg:     rgba(23, 21, 18, 0.75);
--glass-border: rgba(255, 248, 235, 0.06);
--glass-blur:   blur(20px) saturate(1.2);
```

### 2.7 Motion

```css
--motion-instant: 0ms;
--motion-fast:    100ms;
--motion-normal:  200ms;
--motion-slow:    300ms;
--motion-gentle:  500ms;

--ease-out:       ease-out;
--ease-in-out:    ease-in-out;
--ease-gentle:    cubic-bezier(0.4, 0, 0.2, 1);
```

All animations respect `prefers-reduced-motion`. Functional transitions (modals, panels, dropdowns) remain active even under reduced motion; only decorative animation is suppressed.

### 2.8 Layout Tokens

```css
--sidebar-width:      224px;  /* Expanded sidebar */
--sidebar-wide:       256px;  /* Wide variant (rare) */
--sidebar-collapsed:  56px;   /* Collapsed icon rail */
--header-height:      56px;   /* Topbar */
--drawer-width:       480px;  /* Side drawer */
```

These are the exact dimensions in the prototype. Do not substitute rounded values.

---

## 3. The Shell (Invariant)

Pixel-identical on every page. Three states by viewport width.

### 3.1 Sidebar states

| State | Trigger | Width | Contents |
|-------|---------|-------|----------|
| Expanded | >= 1280px OR user pinned | 224px | Icons + labels + section headers |
| Collapsed | 1024-1279px OR user collapsed | 56px | Icons only, tooltip on hover |
| Hidden | < 1024px | 0 | Replaced by bottom nav |

Nav item height 40px. Selected: background `--color-surface-2`, 3px left border `--color-primary`.

### 3.2 Sidebar sections

| Section | Items |
|---------|-------|
| MAIN | Dashboard, Calendar, Timesheets, Leaves |
| WORK | Expenses, Projects, Gantt, Planning, Clients, Invoices |
| HR | Team Directory, Human Resources |
| AI | Insights |
| ADMIN (admin only) | Administration |
| Footer | Approvals (badge), Account, Help & Shortcuts |

Header row: 56px, logo + collapse toggle.

### 3.3 Topbar (56px, all breakpoints)

| Position | Element | Notes |
|----------|---------|-------|
| Left | Breadcrumb (desktop) or Menu button + Page title (mobile) | - |
| Right | `Ask` AI button | 88px desktop / 40px mobile. Opens command palette, Cmd+K |
| Right | Notifications bell | 40px, opens drawer |
| Right | User avatar + presence | 40px, opens account menu |

### 3.4 Bottom nav (< 1024px only)

Fixed 64px, safe-area-inset aware. Exactly 5 items: Dashboard, Timesheets, Leaves, Approvals (badge), More. Active: `--color-primary`. Inactive: `--color-text-3`.

---

## 4. Content Patterns

Every page uses exactly one of five patterns. Structure is fixed; content varies.

| Pattern | Stacked components (top to bottom) | Used by |
|---------|------------------------------------|---------|
| **List** | PageHeader (64px) → FilterBar (52px) → StatStrip (96px, optional, 4 cards) → DataTable (desktop) / CardGrid (mobile) | Employees, Timesheets, Leaves, Expenses, Projects, Clients, Invoices |
| **Detail** | BackBreadcrumb (40px) → EntityHeader (120px) → TabBar (48px) → Tab content | Employee, Project, Client, Invoice detail |
| **Board** | PageHeader (64px) → Toolbar (52px) → VisualCanvas (full width, scrolls horizontally) | Gantt, Planning, Calendar, HR Kanban |
| **Dashboard** | GreetingHeader (80px) → KPIStrip (exactly 4 cards, 96px) → DashboardSection x N | Dashboard, Insights, Approvals |
| **Settings** | PageHeader (64px) → SectionNav (220px left) + FormContent (720px max) | Auth wizard, Onboarding, Account, Admin |

Rules:
- KPIStrip has exactly 4 cards. Extras go in an "Overview" section below.
- Settings wizards replace SectionNav with a top StepIndicator.
- Content max-width: 1400px (data pages), 720px (forms/settings).

---

## 5. Atoms (Fixed Dimensions)

One canonical size per atom. No growing, no shrinking. Overflow truncates with ellipsis. Mobile (< 1024px) has a minimum 44x44px touch target applied via invisible padding.

### 5.1 Buttons

| Variant | Height | Padding | Font | Border Radius |
|---------|--------|---------|------|---------------|
| `primary` | 40px | 16px horizontal | 14px/500 | 8px |
| `secondary` | 40px | 16px horizontal | 14px/500 | 8px |
| `ghost` | 40px | 12px horizontal | 14px/500 | 8px |
| `small` | 32px | 12px horizontal | 13px/500 | 6px |
| `icon` | 40px × 40px | - | - | 8px |
| `icon-sm` | 32px × 32px | - | - | 6px |
| `cta-large` | 48px | 20px horizontal | 15px/600 | 8px |

### 5.2 Inputs

| Variant | Height | Padding | Font |
|---------|--------|---------|------|
| `default` | 40px | 12px horizontal | 14px/400 |
| `small` | 32px | 10px horizontal | 13px/400 |
| `large` | 48px | 16px horizontal | 15px/400 |
| `textarea` | auto (min 80px) | 12px all | 14px/400 |

### 5.3 Cards

| Variant | Min Height | Padding | Radius |
|---------|-----------|---------|--------|
| `stat-card` | **96px** (88px mobile) | 20px (16px mobile) | 12px |
| `standard-card` | auto | 20px (16px mobile) | 12px |
| `compact-card` | auto | 16px | 12px |
| `mobile-row-card` | **80px min** | 16px | 12px |

### 5.4 Tables

| Element | Height |
|---------|--------|
| Table header | 44px |
| Table row | **56px** |
| Table footer (pagination) | 56px |

### 5.5 Modals & Drawers

| Element | Desktop | Mobile |
|---------|---------|--------|
| Modal width | 560px centered | Full-width bottom sheet |
| Modal max-height | 80vh | 90vh |
| Drawer width | 480px from right | Full-screen |
| Modal header | 56px | 56px |
| Modal footer (actions) | 64px | 64px |
| Backdrop | `rgba(0,0,0,0.6)` | Same |
| Animation | Fade + scale 200ms | Slide up 250ms |

### 5.6 Other Atoms

| Atom | Dimension |
|------|-----------|
| Badge | 22px height, 8px horizontal padding, 11px font |
| Pill | 28px height, 12px horizontal padding, 12px font |
| Tag (removable) | 28px height, 10px horizontal padding, 12px font |
| Avatar sizes | 24px / 32px / 40px / 56px / 80px |
| Tooltip | 32px height (single line), 10px horizontal padding |
| Tab bar height | 48px |
| Tab item height | 48px |
| Breadcrumb height | 40px |

---

## 6. Component Library

Exactly these components. No custom variants. Each one has a Storybook entry.

| Group | Components |
|-------|------------|
| Shell | `AppShell`, `Sidebar`, `Topbar`, `BottomNav`, `CommandPalette`, `NotificationsDrawer` |
| Layout | `PageHeader`, `FilterBar`, `StatStrip`, `StatCard`, `SectionHeader`, `EmptyState` |
| Data display | `DataTable`, `CardGrid`, `MobileRowCard`, `Badge`, `Pill`, `Avatar`, `AvatarGroup`, `EmployeeLink`, `HoverCard` |
| Inputs | `TextInput`, `Textarea`, `Select`, `Combobox`, `DatePicker`, `Checkbox`, `RadioGroup`, `Switch`, `FileUpload`, `Form`, `FormField` |
| Feedback | `Button`, `IconButton`, `Modal`, `Drawer`, `BottomSheet`, `Toast`, `ConfirmDialog`, `Skeleton`, `Spinner`, `ProgressBar` |
| Navigation | `Breadcrumb`, `TabBar`, `Pagination`, `BackLink` |
| AI | `AICommandPalette`, `AISuggestionChip`, `AIConfidenceBadge`, `AIReviewRow`, `AIInsightCard` |
| Charts | `BarChart`, `LineChart`, `DonutChart`, `HeatmapGrid`, `GanttCanvas`, `CalendarGrid` |

Forms use React Hook Form + Zod. Charts use Visx.

---

## 7. Responsive Behavior

### 7.1 Breakpoints (Tailwind)

| Token | Min width | Device |
|-------|-----------|--------|
| (none) | 0 | Small phone |
| `sm` | 640px | Phone |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Laptop / tablet landscape |
| `xl` | 1280px | Desktop (primary target) |
| `2xl` | 1440px | External monitor |

### 7.2 Shell per viewport

| Viewport | Sidebar | Nav |
|----------|---------|-----|
| < 1024px | Hidden | Bottom nav 64px |
| 1024-1279px | Collapsed 56px | Sidebar icons |
| >= 1280px | Expanded 224px | Full sidebar |

### 7.3 Content transformations (< 768px)

| Feature | Mobile behavior |
|---------|-----------------|
| DataTable | Replaced by CardGrid of MobileRowCards |
| KPIStrip | 4 cols -> 2 cols |
| Modal | Bottom sheet slides up (90vh max) |
| Drawer | Full-screen overlay |
| PageHeader actions | Primary only + kebab menu |
| FilterBar | Search visible + `Filter` button opens drawer |
| Gantt / Planning | Read-only week view with "use desktop" banner |
| Hover cards | Open on tap; long-press preview |

### 7.4 Zoom and units

Zoom = viewport reduction. No special zoom code. Use `rem` for typography, `px` for structural dimensions and media queries. Test at 100/125/150% zoom on 1280 and 1440.

---

## 8. AI Integration Layers

AI lives in the shell, not pages. Three layers:

| Layer | Where | Trigger | Purpose |
|-------|-------|---------|---------|
| **1. Command palette** | Topbar `Ask` button, Cmd+K, mobile FAB | User-initiated | NL input with current page context. Returns answer, action, or navigation |
| **2. Inline suggestions** | Inside page content, never modal | Proactive | Anomaly hints, OCR confidence, autofill preview. See `AI_FEATURES.md` |
| **3. Insights page** | `/insights` (Dashboard pattern) | User-visited | Conversational analytics, anomalies, trend reports |

---

## 9. Iconography

Lucide React, stroke 1.5. Default 20px. Navigation items filled when selected, outline when not. Actions always outline. Status icons filled + colored.

| Token | Size |
|-------|------|
| `icon-xs` | 14px |
| `icon-sm` | 16px |
| `icon-md` | 20px (default) |
| `icon-lg` | 24px |
| `icon-xl` | 32px |

---

## 10. Accessibility

WCAG 2.2 AA is the floor.

- Semantic HTML (button, nav, main, article)
- Full keyboard navigation
- `:focus-visible` ring: 3px `--color-primary`, 2px offset
- ARIA labels on icon-only buttons
- Contrast >= 4.5:1 body, >= 3:1 large text
- Screen reader verified (VoiceOver, NVDA)
- `prefers-reduced-motion` respected (decorative motion only; functional transitions stay)
- Dark mode default; `prefers-color-scheme` respected

---

## 11. Prototype Reference

`prototype/*.html` is the approved visual spec. Every Next.js page must match its counterpart pixel-perfect at the `xl` breakpoint. Deviations require written justification.

| Prototype file | Pattern |
|----------------|---------|
| `index.html` | Dashboard |
| `employees.html` | List |
| `timesheets.html` | List (custom TimesheetGrid) |
| `leaves.html` | List |
| `expenses.html` | List |
| `projects.html` | List + Kanban |
| `clients.html` | List |
| `invoices.html` | List |
| `calendar.html` | Board |
| `gantt.html` | Board |
| `planning.html` | Board |
| `approvals.html` | Dashboard |
| `insights.html` | Dashboard |
| `hr.html` | Detail + Tabs |
| `admin.html` | Settings |
| `account.html` | Settings |
| `auth.html` | Settings wizard |
| `portal/index.html` | Dashboard (separate client-portal shell) |

---

## 12. Enforcement

1. Component library is built before any page (Phase 2).
2. Pages import from `@/components`. No custom layouts.
3. Every page picks one pattern and uses its components as-is.
4. Storybook is the canonical reference. Not in Storybook = does not exist.
5. The flawless gate (`docs/FLAWLESS_GATE.md`) runs before any page is marked complete.
6. PR review rejects any custom CSS overriding atom dimensions.

If an agent needs something not in the system: **stop and ask the founder.** Never create a custom variant. The founder decides add-to-library (rare) vs. fit-the-content (usual).
