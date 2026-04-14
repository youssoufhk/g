# MOBILE STRATEGY

> PWA, not native. Breakpoints, shell transformations, offline rules.
> Mobile is first-class. Every feature works at 320 px. Primary actions are thumb-reachable.

---

## 1. Platform decision

**PWA built from the same Next.js codebase.** No React Native, no Swift, no Kotlin. Rationale: `docs/decisions/ADR-009-mobile.md`.

---

## 2. Breakpoints

| Name | Min width | Device | Shell state |
|------|-----------|--------|-------------|
| xs | 320 px | Small phone | Hidden sidebar + bottom nav |
| sm | 640 px | Large phone | Hidden sidebar + bottom nav |
| md | 768 px | Tablet portrait | Collapsed sidebar 56 px |
| lg | 1024 px | Tablet landscape | Collapsed sidebar 56 px |
| xl | 1280 px | Laptop | Expanded sidebar 224 px |
| 2xl | 1440 px+ | Desktop | Expanded sidebar 224 px |

Minimum supported viewport: 320 x 568 px.

---

## 3. Shell transformations

| Width | Sidebar | Topbar | Bottom nav | Content |
|-------|---------|--------|------------|---------|
| < 768 | Hidden | Logo + search icon + avatar | Visible, 5 items, safe-area-inset aware | `100vw - 32px` gutter |
| 768 - 1279 | Collapsed 56 px icon rail | Full | Hidden | Fills available |
| >= 1280 | Expanded 224 px | Full | Hidden | Max 1440 px, auto margins |

Bottom nav items: Home, Time, Approvals, Insights, More. Active state uses `--color-primary`.

---

## 4. Content pattern transformations

| Pattern | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| List | FilterBar + Table + Pagination | Same, fewer columns | FilterBar as sticky button -> sheet. Table -> card list. |
| Detail | Header + Tabs + content + right rail | Drop right rail | Header stacked. Tabs = horizontal scroll snap. Right rail at end. |
| Board | Multi-column kanban, drag-drop | Same, narrower | Columns = swipe tabs with dots. No drag. Long-press = "move to" menu. |
| Dashboard | Widget grid | 2-column | Single column. KPIs = 2x2 mini-grid. |
| Settings | Side nav + content | Narrower nav | Nav = top select or master-detail push |

**Rule:** the `<Table>` atom automatically renders as `<CardList>` at width < 768 px. Never render a desktop table below 768 px.

---

## 5. Input + touch rules

- Inputs 48 px tall on mobile
- Touch targets >= 44 x 44 px with 8 px spacing
- Numeric: `inputmode="decimal"`
- Dates: native date picker
- No hover-only interactions
- Forms with 3+ fields render as bottom sheets
- Submit button sticky above the keyboard via dvh units

---

## 6. Camera + file capture

- Expense submission uses `<input capture="environment">` to open camera directly
- Supports multi-image selection
- Client-side compression: max 2048 px wide, JPEG 85
- Determinate upload progress bar

---

## 7. Offline (v1.0 = read-only)

| Component | Behavior |
|-----------|----------|
| Service worker | Caches shell (HTML/CSS/JS/fonts) after first load |
| TanStack Query | Persists cache in IndexedDB, 7-day TTL |
| Offline banner | Shown on connection drop |
| Read offline | Dashboard, employees, clients, projects, recent timesheets, recent expenses |
| Mutations offline | Disabled with "will retry when online" message |
| Timesheet drafts | Saved locally, background sync on reconnect |

v1.1 adds optimistic offline mutations with conflict resolution.

---

## 8. Push notifications

- Web Push via service worker, `pywebpush` on the backend
- User opts in from account settings
- Categories: Approvals, Mentions, System
- Fallback to email if push unavailable

---

## 9. PWA manifest

- Path: `/manifest.webmanifest`
- Name: "GammaHR", short name: "GammaHR"
- Theme color: `--color-primary`
- Icons: 192, 512, maskable
- Display: `standalone`
- Start URL: `/dashboard`
- Shortcuts: Submit Time, Log Expense, Request Leave

Install prompt on mobile after 3 sessions, dismissible forever.

---

## 10. Performance targets (goals, not baselines)

| Metric | Target |
|--------|--------|
| FCP on 4G | < 1.5 s |
| TTI | < 3 s |
| Route JS bundle | < 150 kb gzipped |
| Lighthouse PWA score | >= 95 |

Fonts preloaded with `font-display: swap`. Images lazy-loaded below fold. Skeleton loaders match final layout dimensions.

---

## 11. Testing

- Playwright projects: iPhone SE, iPhone 14 Pro, Pixel 7, iPad Mini
- Visual regression per breakpoint
- Real-device smoke test on iPhone + Android before each release

---

## 12. Not on mobile in v1.0

These stay desktop-only:
- Gantt editing (read-only simplified timeline only)
- Bulk CSV import (notice directs to desktop)
- Invoice PDF editing (preview only)
- Kanban drag-drop
- Complex multi-select tables

Acceptable because primary mobile flows are: submit expense with photo, quick approvals, check schedule, request leave. All four flawless at 320 px.
