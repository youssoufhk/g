# GammaHR v2 — Design System Specification

> The visual soul of GammaHR Quantum.
> Dark-mode-first. 3D depth. Premium feel. Easy on the eyes for 8+ hour workdays.

---

## 1. Design Philosophy

### Principles

1. **Dark Mode is Home** — Light mode is the variant, not the default
2. **Depth Creates Hierarchy** — Surfaces float at different elevations; z-axis communicates importance
3. **3D Enriches, Never Distracts** — 3D elements add polish, not complexity
4. **Density with Clarity** — Show maximum information without visual overload
5. **Color Communicates** — Every color has a semantic purpose; decorative color is minimal
6. **Motion is Meaningful** — Animations guide attention and confirm actions
7. **Accessibility is Non-negotiable** — WCAG 2.2 AA minimum; color is never the sole indicator

### Visual References

| Inspiration | What to take |
|------------|-------------|
| **Linear** | Information density, keyboard-first, dark theme elegance |
| **Vercel Dashboard** | Clean dark mode, neon accents, typography hierarchy |
| **Notion** | Content-first, minimal chrome, smooth interactions |
| **Apple visionOS** | 3D depth, glassmorphism, floating surfaces |
| **Stripe Dashboard** | Data visualization quality, gradient subtlety |
| **Bloomberg Terminal** | Information density, no wasted space |

---

## 2. Color System — Earth & Sage (Locked)

> **Palette locked. No alternatives.** Earth & Sage was selected after full visual validation.
> Rationale: sage/green semantics align perfectly with approval flows, active states, and healthy utilization — the core HR interaction patterns. Terracotta + aged gold provide a full semantic color language, not just aesthetics.

### 2.1 Dark Mode (Primary — Default)

```
BACKGROUNDS & SURFACES
  Background:      hsl(35, 16%, 5%)     — Warm charcoal base (page bg)
  Surface-0:       hsl(35, 13%, 8%)     — Card base, sidebar
  Surface-1:       hsl(35, 11%, 11%)    — Elevated card, table row hover
  Surface-2:       hsl(35, 9%, 15%)     — Modal/dialog, sheet
  Surface-3:       hsl(35, 7%, 19%)     — Popover, tooltip, dropdown

PRIMARY — SOFT SAGE
  Primary:         hsl(155, 26%, 46%)   — Soft sage (buttons, active nav, links)
  Primary-hover:   hsl(155, 26%, 52%)   — Lighter sage on hover
  Primary-active:  hsl(155, 26%, 40%)   — Pressed/active state
  Primary-muted:   hsla(155, 26%, 46%, 0.14) — Ghost button bg, subtle highlight

ACCENT — TERRACOTTA
  Accent:          hsl(30, 58%, 50%)    — Terracotta (secondary CTAs, highlights)
  Accent-hover:    hsl(30, 58%, 56%)    — Lighter terracotta on hover
  Accent-muted:    hsla(30, 58%, 50%, 0.14) — Subtle terracotta bg

SEMANTIC COLORS
  Success:         hsl(152, 22%, 44%)   — Soft sage (approved, complete, healthy)
  Warning:         hsl(38, 65%, 50%)    — Aged gold (pending, attention, deadline)
  Error:           hsl(5, 65%, 52%)     — Muted brick red (rejected, critical, error)
  Info:            hsl(200, 40%, 52%)   — Muted steel blue (informational)

FINANCIAL / CHART ACCENT
  Gold:            hsl(38, 60%, 48%)    — Aged gold (revenue, invoices, financial KPIs)
  Gold-hover:      hsl(38, 60%, 54%)

TEXT
  Text-primary:    hsl(40, 28%, 90%)    — Parchment cream (headings, values, body)
  Text-secondary:  hsl(35, 10%, 55%)    — Warm muted (labels, secondary info)
  Text-tertiary:   hsl(35, 8%, 38%)     — Warm dimmed (placeholders, disabled)
  Text-inverse:    hsl(35, 16%, 5%)     — Dark text on light/primary bg

BORDERS
  Border:          hsl(35, 10%, 14%)    — Standard divider, card border
  Border-subtle:   hsl(35, 8%, 10%)     — Barely-there dividers, table rows
  Border-strong:   hsl(35, 12%, 22%)    — Emphasis borders, focus rings
```

### 2.2 Light Mode (Variant)

```
  Background:      hsl(40, 20%, 97%)    — Warm cream page bg
  Surface-0:       hsl(40, 15%, 100%)   — White card (warm-tinted)
  Surface-1:       hsl(40, 12%, 97%)    — Elevated card
  Surface-2:       hsl(40, 10%, 94%)    — Modal

  Primary:         hsl(155, 30%, 34%)   — Deeper sage (legible on light bg)
  Primary-hover:   hsl(155, 30%, 28%)
  Primary-muted:   hsla(155, 30%, 34%, 0.10)

  Accent:          hsl(30, 60%, 42%)    — Deeper terracotta
  Gold:            hsl(38, 65%, 40%)    — Deeper aged gold

  Success:         hsl(152, 28%, 36%)
  Warning:         hsl(38, 70%, 42%)
  Error:           hsl(5, 68%, 44%)

  Text-primary:    hsl(35, 12%, 10%)    — Dark warm for readability
  Text-secondary:  hsl(35, 8%, 38%)
  Text-tertiary:   hsl(35, 5%, 55%)

  Border:          hsl(35, 12%, 84%)
  Border-subtle:   hsl(35, 10%, 90%)
```

### 2.3 CSS Custom Properties

```css
/* Dark mode (default) */
:root {
  /* Backgrounds */
  --color-bg:          hsl(35, 16%, 5%);
  --color-surface-0:   hsl(35, 13%, 8%);
  --color-surface-1:   hsl(35, 11%, 11%);
  --color-surface-2:   hsl(35, 9%, 15%);
  --color-surface-3:   hsl(35, 7%, 19%);

  /* Primary — Soft Sage */
  --color-primary:        hsl(155, 26%, 46%);
  --color-primary-hover:  hsl(155, 26%, 52%);
  --color-primary-active: hsl(155, 26%, 40%);
  --color-primary-muted:  hsla(155, 26%, 46%, 0.14);

  /* Accent — Terracotta */
  --color-accent:         hsl(30, 58%, 50%);
  --color-accent-hover:   hsl(30, 58%, 56%);
  --color-accent-muted:   hsla(30, 58%, 50%, 0.14);

  /* Semantic */
  --color-success:    hsl(152, 22%, 44%);
  --color-warning:    hsl(38, 65%, 50%);
  --color-error:      hsl(5, 65%, 52%);
  --color-info:       hsl(200, 40%, 52%);

  /* Financial */
  --color-gold:       hsl(38, 60%, 48%);
  --color-gold-hover: hsl(38, 60%, 54%);

  /* Text */
  --color-text-1:     hsl(40, 28%, 90%);   /* primary */
  --color-text-2:     hsl(35, 10%, 55%);   /* secondary */
  --color-text-3:     hsl(35, 8%, 38%);    /* tertiary */
  --color-text-inv:   hsl(35, 16%, 5%);    /* on-color */

  /* Borders */
  --color-border:         hsl(35, 10%, 14%);
  --color-border-subtle:  hsl(35, 8%, 10%);
  --color-border-strong:  hsl(35, 12%, 22%);
}

/* Light mode override */
[data-theme="light"] {
  --color-bg:          hsl(40, 20%, 97%);
  --color-surface-0:   hsl(40, 15%, 100%);
  --color-surface-1:   hsl(40, 12%, 97%);
  --color-surface-2:   hsl(40, 10%, 94%);
  --color-primary:     hsl(155, 30%, 34%);
  --color-primary-hover: hsl(155, 30%, 28%);
  --color-accent:      hsl(30, 60%, 42%);
  --color-gold:        hsl(38, 65%, 40%);
  --color-success:     hsl(152, 28%, 36%);
  --color-warning:     hsl(38, 70%, 42%);
  --color-error:       hsl(5, 68%, 44%);
  --color-text-1:      hsl(35, 12%, 10%);
  --color-text-2:      hsl(35, 8%, 38%);
  --color-text-3:      hsl(35, 5%, 55%);
  --color-border:      hsl(35, 12%, 84%);
  --color-border-subtle: hsl(35, 10%, 90%);
}
```

### 2.4 Semantic Color Usage Table

| Context | Color token | Example |
|---------|-------------|---------|
| Primary action buttons | `--color-primary` | "Submit Timesheet", "Approve", "Save" |
| Active nav item | `--color-primary` | Sidebar active link |
| Links | `--color-primary` | EmployeeLink, entity links |
| Success badge | `--color-success` | "Approved", "Active", "Submitted" |
| Secondary CTA | `--color-accent` | "Add Expense", "New Request" |
| Warning badge | `--color-warning` | "Pending", "Due Soon", "Nearing Limit" |
| Error/rejection | `--color-error` | "Rejected", "Overdue", "Error" |
| Revenue / financial | `--color-gold` | Revenue trend chart, invoice totals |
| Warning amount | `--color-warning` | Expense over budget |
| Utilization healthy | `--color-success` | 75–100% utilization on Gantt |
| Utilization low | `--color-warning` | 50–75% utilization on Gantt |
| Utilization critical | `--color-error` | <50% or >110% utilization |

---

## 3. Typography

### Font Stack

```css
--font-sans: 'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont,
             'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono Variable', 'JetBrains Mono', 'Fira Code',
             'Cascadia Code', monospace;
```

**Inter** — Best-in-class screen legibility, variable font for smooth weight transitions.
**JetBrains Mono** — For code, numbers in tables, currency amounts.

### Type Scale

| Token | Size | Weight | Line Height | Use |
|-------|------|--------|-------------|-----|
| `display-xl` | 36px / 2.25rem | 700 | 1.2 | Page hero titles (Dashboard greeting) |
| `display-lg` | 30px / 1.875rem | 700 | 1.2 | Section heroes |
| `heading-1` | 24px / 1.5rem | 600 | 1.3 | Page titles |
| `heading-2` | 20px / 1.25rem | 600 | 1.35 | Section titles |
| `heading-3` | 16px / 1rem | 600 | 1.4 | Card titles, widget headers |
| `body-lg` | 16px / 1rem | 400 | 1.5 | Primary body text |
| `body` | 14px / 0.875rem | 400 | 1.5 | Standard body text, table cells |
| `body-sm` | 13px / 0.8125rem | 400 | 1.45 | Secondary text, descriptions |
| `caption` | 12px / 0.75rem | 500 | 1.4 | Labels, badges, timestamps |
| `overline` | 11px / 0.6875rem | 600 | 1.3 | Section overlines, uppercase labels |
| `mono` | 13px / 0.8125rem | 400 | 1.5 | Numbers, currency, code |

### Font Weight Usage

| Weight | Token | Use |
|--------|-------|-----|
| 400 | `regular` | Body text, descriptions |
| 500 | `medium` | Labels, navigation items, captions |
| 600 | `semibold` | Headings, button text, active states |
| 700 | `bold` | Display titles, stat numbers, emphasis |

---

## 4. Spacing System

**Base unit: 4px**

| Token | Value | Common use |
|-------|-------|-----------|
| `space-0` | 0px | — |
| `space-0.5` | 2px | Tight inline spacing |
| `space-1` | 4px | Icon-to-text gap, tight padding |
| `space-1.5` | 6px | Badge padding, small gaps |
| `space-2` | 8px | Compact padding, list item gap |
| `space-3` | 12px | Standard input padding, small card padding |
| `space-4` | 16px | Card padding, section gap |
| `space-5` | 20px | Medium section gap |
| `space-6` | 24px | Large card padding, major section gap |
| `space-8` | 32px | Page section spacing |
| `space-10` | 40px | Major layout gaps |
| `space-12` | 48px | Page top/bottom padding |
| `space-16` | 64px | Hero section padding |
| `space-20` | 80px | Large hero padding |

---

## 5. Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `radius-none` | 0px | Tables, dividers |
| `radius-sm` | 4px | Tags, small badges |
| `radius-md` | 8px | Buttons, inputs, small cards |
| `radius-lg` | 12px | Cards, modals |
| `radius-xl` | 16px | Large cards, containers |
| `radius-2xl` | 24px | Hero elements, feature cards |
| `radius-full` | 9999px | Avatars, pills, toggles |

---

## 6. Elevation System (Shadows & Depth)

### Shadow Scale (Dark Mode)

```css
--shadow-0: none;
--shadow-1: 0 1px 2px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.15);
--shadow-2: 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2);
--shadow-3: 0 4px 8px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.2);
--shadow-4: 0 8px 16px rgba(0,0,0,0.3), 0 16px 32px rgba(0,0,0,0.25);
--shadow-5: 0 16px 32px rgba(0,0,0,0.35), 0 32px 64px rgba(0,0,0,0.3);
```

### Elevation Layers

| Layer | Elevation | Shadow | Use |
|-------|-----------|--------|-----|
| **Base** | 0 | shadow-0 | Page background |
| **Surface** | 1 | shadow-1 | Cards, panels, sidebar |
| **Raised** | 2 | shadow-2 | Hovered cards, stat cards |
| **Floating** | 3 | shadow-3 | Dropdowns, popovers, command palette |
| **Modal** | 4 | shadow-4 | Modals, dialogs |
| **Toast** | 5 | shadow-5 | Notifications, toasts, tooltips |

### Glassmorphism (Selective)

Used ONLY on:
- App header/toolbar
- Command palette overlay
- Modal backdrops
- Floating action panels
- Notification center

```css
.glass {
  background: rgba(23, 21, 18, 0.75); /* hsl(35,13%,8%) @ 75% opacity */
  backdrop-filter: blur(20px) saturate(1.2);
  -webkit-backdrop-filter: blur(20px) saturate(1.2);
  border: 1px solid rgba(255, 248, 235, 0.06); /* warm white tint */
}
```

---

## 7. 3D Design Integration

### What Gets 3D Treatment

| Element | 3D Treatment | Technology |
|---------|-------------|-----------|
| **App Logo** | 3D animated logo (subtle float/rotation) | React Three Fiber |
| **Empty States** | 3D illustrations (document, calendar, chart) | Pre-rendered 3D + CSS animation |
| **Dashboard Hero** | 3D scene: floating metric orbs or data landscape | React Three Fiber (lazy loaded) |
| **Stat Cards** | 3D depth on hover (translateZ + perspective) | CSS transforms |
| **Charts** | 3D bar charts, globe visualization for multi-region | React Three Fiber |
| **Onboarding** | 3D progress indicator (orbiting checkmarks) | React Three Fiber |
| **Error Page** | 3D floating "404" or broken object | Pre-rendered 3D |
| **Icons (select)** | 3D-rendered icons for sidebar navigation | Pre-rendered SVG with depth effects |

### What Stays 2D

- Tables, forms, inputs, buttons — 3D would hinder usability
- Body text, labels, badges
- Navigation items (sidebar, breadcrumbs)
- Standard UI chrome

### 3D Performance Budget

- Initial load: NO Three.js on critical path
- Lazy load: 3D canvas only when visible (IntersectionObserver)
- Fallback: CSS depth effects if WebGL unavailable
- Max canvas size: 800x600px (dashboard hero)
- Target: 60fps on M1 MacBook Air
- Reduce motion: CSS transforms only (no WebGL) when prefers-reduced-motion

### Depth Effects (CSS-only, no WebGL)

```css
/* Card depth on hover */
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-3);
}

/* Perspective container for stat cards */
.perspective-container {
  perspective: 1000px;
}
.stat-card {
  transition: transform 0.3s ease;
}
.stat-card:hover {
  transform: rotateX(2deg) rotateY(-2deg) translateZ(10px);
}

/* Layered surfaces (parallax on scroll) */
.parallax-surface {
  will-change: transform;
  transform: translateZ(0);
}
```

---

## 8. Motion & Animation

### Timing Tokens

| Token | Duration | Easing | Use |
|-------|---------|--------|-----|
| `motion-instant` | 0ms | — | Immediate feedback (active states) |
| `motion-fast` | 100ms | ease-out | Hover states, button press |
| `motion-normal` | 200ms | ease-in-out | Card transitions, menu open |
| `motion-slow` | 300ms | ease-in-out | Modal open/close, page transitions |
| `motion-gentle` | 500ms | cubic-bezier(0.4, 0, 0.2, 1) | Complex transitions, 3D movements |

### Spring Physics (for premium feel)

```css
/* Framer Motion spring presets */
--spring-snappy: { stiffness: 500, damping: 30 }
--spring-gentle: { stiffness: 200, damping: 20 }
--spring-bouncy: { stiffness: 400, damping: 15, mass: 0.5 }
```

### Animation Catalog

| Animation | Trigger | Duration | Effect |
|-----------|---------|----------|--------|
| **Card hover lift** | Mouse enter | 200ms | translateY(-2px), shadow deepen |
| **Button press** | Click | 100ms | Scale(0.97), shadow reduce |
| **Button loading** | Submit | Loop | Shimmer gradient across button |
| **Modal enter** | Open | 300ms | Fade in + scale from 0.95 |
| **Modal exit** | Close | 200ms | Fade out + scale to 0.95 |
| **Slide panel** | Open | 300ms | Slide from right + fade |
| **Toast enter** | Trigger | 300ms | Slide down from top + fade |
| **Toast exit** | Dismiss/auto | 200ms | Slide up + fade |
| **Page transition** | Navigate | 200ms | Fade + subtle translateY |
| **Sidebar expand** | Toggle | 200ms | Width transition + label fade |
| **Notification badge** | New item | 400ms | Scale pulse (1 → 1.2 → 1) |
| **Counter update** | Value change | 300ms | Number roll (digit by digit) |
| **Chart draw** | Mount | 800ms | SVG path draw-in |
| **Gantt bar** | Drag | 0ms (real-time) | Follow cursor with snap |
| **List item enter** | New item | 200ms | Fade in + slide from top |
| **List item exit** | Remove | 150ms | Fade out + slide to left |
| **Skeleton shimmer** | Loading | Loop 2s | Gradient slide left to right |
| **Status dot pulse** | Online | Loop 3s | Opacity 1 → 0.5 → 1 |
| **3D logo rotate** | Idle | Loop 20s | Gentle Y-axis rotation |
| **Command palette** | Cmd+K | 200ms | Fade + scale from center |

### Reduced Motion

When `prefers-reduced-motion: reduce`:
- All transforms → instant (no animation)
- Opacity transitions → 100ms max
- No parallax, no 3D rotation
- Shimmer → static placeholder
- Spring animations → linear

---

## 9. Component Specifications

### 9.1 Button

**Variants:**
| Variant | Background | Text | Border | Use |
|---------|-----------|------|--------|-----|
| `primary` | Primary color | White | None | Primary CTA |
| `secondary` | Surface-1 | Text-primary | Border | Secondary actions |
| `ghost` | Transparent | Primary | None | Tertiary, inline actions |
| `destructive` | Error | White | None | Delete, remove |
| `destructive-ghost` | Transparent | Error | None | Subtle destructive |
| `link` | Transparent | Primary | None + underline | Inline links |

**Sizes:**
| Size | Height | Padding X | Font | Icon | Use |
|------|--------|----------|------|------|-----|
| `xs` | 28px | 8px | caption | 14px | Inline, table actions |
| `sm` | 32px | 12px | body-sm | 16px | Compact UI |
| `md` | 36px | 16px | body | 18px | Standard (default) |
| `lg` | 44px | 20px | body-lg | 20px | Hero CTAs, forms |
| `xl` | 52px | 24px | heading-3 | 22px | Landing page, onboarding |
| `icon` | 36px | 0 | — | 18px | Icon-only buttons (square) |

**States:** Default → Hover (lighten 5%) → Active (darken 5%, scale 0.97) → Disabled (opacity 0.5) → Loading (shimmer + spinner)

### 9.2 Input

```
┌─────────────────────────────────────┐
│ Label *                              │
│ ┌─────────────────────────────────┐ │
│ │ [icon] Placeholder text         │ │
│ └─────────────────────────────────┘ │
│ Helper text or error message        │
└─────────────────────────────────────┘
```

**States:** Default → Focus (ring-2 primary) → Error (ring-2 error, red text) → Disabled → Read-only

**Sizes:** `sm` (32px), `md` (36px), `lg` (44px)

### 9.3 Card

**Variants:**
| Variant | Style | Use |
|---------|-------|-----|
| `default` | Surface-0, shadow-1, radius-lg | Standard content card |
| `stat` | Surface-0, gradient accent border-top, shadow-2 on hover | KPI stat display |
| `glass` | Glassmorphism background | Overlays, hero elements |
| `interactive` | Hover lift + shadow-2 transition | Clickable cards (project, client) |
| `gradient` | Subtle primary gradient bg | Featured/highlighted content |
| `outlined` | Transparent bg, border | Secondary content sections |

### 9.4 Badge

**Variants:**
| Variant | Background | Text | Use |
|---------|-----------|------|-----|
| `default` | Surface-2 | Text-secondary | Neutral labels |
| `primary` | Primary/15 | Primary | Active, selected |
| `success` | Success/15 | Success | Approved, complete, active |
| `warning` | Warning/15 | Warning | Pending, attention needed |
| `error` | Error/15 | Error | Rejected, overdue, critical |
| `info` | Info/15 | Info | Informational |

All badges include semantic icons (not just color).

### 9.5 Table

```
┌──────────────────────────────────────────────────────────────┐
│ [Checkbox] │ Name ▲         │ Department │ Status │ Actions  │
├──────────────────────────────────────────────────────────────┤
│ [☐] │ 🟢 Sarah Chen        │ Engineering│ Active │ [•••]    │
│ [☐] │ 🟢 John Smith        │ Operations │ Active │ [•••]    │
│ [☐] │ 🔴 Alice Wang        │ Design     │ Leave  │ [•••]    │
├──────────────────────────────────────────────────────────────┤
│                     1-10 of 48  │ ◀ 1 2 3 4 5 ▶            │
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- Sticky header on scroll
- Row hover highlight (Surface-1)
- Row selection (checkbox, shift+click for range)
- Column sorting (click header, shift+click for multi-sort)
- Column resizing (drag handle)
- Virtualized rows (1000+ rows smooth)
- Expandable rows (click to reveal details)
- Responsive: collapse to cards on mobile
- Pagination or infinite scroll (configurable)

### 9.6 Modal / Dialog

**Sizes:**
| Size | Width | Use |
|------|-------|-----|
| `sm` | 400px | Confirmations, simple forms |
| `md` | 560px | Standard forms, details |
| `lg` | 720px | Complex forms, previews |
| `xl` | 960px | Data-heavy views, comparisons |
| `full` | 100vw - 64px | Full-screen editors |

**Animation:** Backdrop fade (300ms) + content scale-up from 0.95 (200ms)

### 9.7 Avatar

```
Sizes: xs(24px) sm(32px) md(40px) lg(48px) xl(64px) 2xl(96px)

Structure:
  ┌─────┐
  │ SC  │  ← Initials (first+last name)
  │  🟢 │  ← Status dot (bottom-right)
  └─────┘

Features:
- Image (if profile_photo_url exists)
- Fallback: initials with generated gradient background
- Status dot: green(online), yellow(away), gray(offline), red(on leave)
- Group: overlapping stack with "+N" counter
```

### 9.8 Toast Notifications

```
┌──────────────────────────────────────┐
│ ✅ Leave request approved            │ [✕]
│    Apr 28-29 — by John Smith         │
│    ─────────────────────────────────  │
│    [View Details] [Dismiss]          │
└──────────────────────────────────────┘
```

**Types:** success (green), error (red), warning (amber), info (blue)
**Position:** Top-right, stacks vertically
**Auto-dismiss:** 5s (info), 8s (success), persistent (error)

### 9.9 Command Palette

```
┌──────────────────────────────────────────────────────────────┐
│ 🔍 Type to search...                               [Esc]    │
├──────────────────────────────────────────────────────────────┤
│ ▸ Sarah Chen — Employee, Engineering                         │
│   Acme Corp — Client                                         │
│   Acme Web Redesign — Project                                │
│   ⚡ Submit timesheet                                        │
│   ⚡ New expense                                             │
├──────────────────────────────────────────────────────────────┤
│ ↑↓ Navigate │ ↵ Select │ ⌘K Toggle │ Esc Close             │
└──────────────────────────────────────────────────────────────┘
```

**Glass background, sharp shadow, 560px width, centered at 20% from top**

---

## 10. Iconography

### Icon Library: Lucide React

- Consistent 24px grid, 2px stroke
- Used for: navigation, buttons, status indicators, section headers

### 3D Icon Treatment

Selected icons get a 3D-rendered version for sidebar navigation:

| Icon | Where | 3D Treatment |
|------|-------|-------------|
| Dashboard | Sidebar | 3D cube with gradient faces |
| Timesheets | Sidebar | 3D clock with ticking hand |
| Expenses | Sidebar | 3D receipt with curl |
| Leaves | Sidebar | 3D calendar with leaf |
| Projects | Sidebar | 3D folder with depth |
| Team | Sidebar | 3D people silhouettes |
| Insights | Sidebar | 3D brain/lightbulb |
| Gantt | Sidebar | 3D timeline bars |

All 3D icons: subtle idle animation (float/rotate), more pronounced hover animation.
Fallback: standard 2D Lucide icons (for reduced motion, smaller viewports).

---

## 11. Responsive Breakpoints

| Token | Width | Layout | Sidebar |
|-------|-------|--------|---------|
| `mobile` | < 640px | Single column, cards | Hidden (hamburger) |
| `tablet` | 640-1023px | 2 columns, compact | Icon-only (56px) |
| `desktop` | 1024-1439px | Full layout | Expanded (224px) |
| `wide` | 1440px+ | Full layout, extra columns | Expanded (256px) |

### Mobile-Specific Patterns

- Bottom navigation bar (5 items: Dashboard, Timesheets, Expenses, Leaves, More)
- Cards instead of tables
- Swipe gestures (swipe to approve/reject in lists)
- Pull to refresh
- Floating action button (FAB) for primary action

---

## 12. Accessibility

### WCAG 2.2 AA Requirements

- **Contrast ratios:** 4.5:1 for body text, 3:1 for large text (18px+) and UI components
- **Focus indicators:** 2px ring in primary color, visible in both light and dark modes
- **Touch targets:** Minimum 44x44px on mobile
- **Color independence:** All status uses icon + color (never color alone)
- **Keyboard navigation:** Every interactive element reachable via Tab; logical tab order
- **Screen reader:** All images have alt text; decorative images have `aria-hidden="true"`
- **Reduced motion:** All animations respect `prefers-reduced-motion`
- **High contrast:** Support `prefers-contrast: more` with increased borders and text weight
- **Zoom:** Layout works up to 200% zoom without horizontal scrolling

### Focus Styles

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-md);
}
```

---

## 13. Data Visualization Style

### Chart Design Principles

1. **Gridlines:** Subtle, dashed, low opacity (0.1)
2. **Axis labels:** caption size, text-tertiary color
3. **Tooltips:** Glass morphism, compact, with icon + label + value
4. **Colors:** Use chart color scale (6 distinct, colorblind-safe)
5. **Animation:** Draw-in on mount (800ms), smooth transitions on data change
6. **Interaction:** Hover highlights data point + crosshair, click drills down
7. **Responsive:** Auto-resize, simplified on mobile (fewer data points)

### Chart Color Scale

Derived from the locked Earth & Sage palette. All 6 series are visually distinct and colorblind-safe.

```
Chart-1: hsl(155, 26%, 46%)  — Soft sage     (primary series — matches --color-primary)
Chart-2: hsl(38, 60%, 48%)   — Aged gold     (financial, revenue — matches --color-gold)
Chart-3: hsl(30, 58%, 50%)   — Terracotta    (secondary series — matches --color-accent)
Chart-4: hsl(200, 40%, 52%)  — Steel blue    (informational series — matches --color-info)
Chart-5: hsl(270, 45%, 58%)  — Muted mauve   (quaternary — warm-toned, distinct)
Chart-6: hsl(5, 65%, 52%)    — Brick red     (alert/overdue series — matches --color-error)
```

All 6 tested for colorblind accessibility (protanopia, deuteranopia, tritanopia).
Series 1–3 (sage, gold, terracotta) carry brand identity into data visualization.
