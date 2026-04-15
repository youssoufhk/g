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

## 7. Offline (v1.0 = narrow: timesheet entry only)

Offline scope is deliberately narrow. **Only timesheet entry works offline.** Everything else (approvals, dashboards, invoices, expenses, clients, projects) requires network. Rationale: consultants at client sites with bad wifi need to log hours without the app crashing, but full offline support for every feature is a 2-3 month product feature of its own with its own bug class (see DEF-047 + DEF-050 in `docs/DEFERRED_DECISIONS.md`).

| Component | Behavior |
|-----------|----------|
| Service worker | Caches shell (HTML/CSS/JS/fonts) after first load |
| TanStack Query | Persists cache in IndexedDB, 7-day TTL, read-only fallback when offline |
| Offline banner | Shown on connection drop, explains which features are unavailable |
| Read offline (fallback) | Last-cached version of any page the user previously viewed, but with a "stale, reconnecting..." badge |
| **Timesheet entry offline** | IndexedDB queue scoped by `tenant_id` in `lib/offline.ts`. User taps to add a timesheet entry, entry is written to the local queue, green "Saved locally" badge appears. Service Worker Background Sync API flushes the queue when online. |
| All other mutations offline | Disabled with "you are offline, this action will be available when you reconnect" message |

**Conflict resolution on sync:** offline timesheet entries sync using the same three-layer optimistic lock mechanism as every other mutation (version column + field-level diff modal + revision history). If a 409 fires (unlikely for new entries, more likely for edits), the shared `<ConflictResolver>` modal handles the resolution. Most offline writes are creates, not edits, so conflicts are rare.

**Version semantics for offline entries.** Locally-created offline entries are tagged with a client-generated `local_id` (UUID) and `version = -1` (never-synced sentinel). When the PWA comes back online:

1. Client calls `POST /api/v1/timesheets/sync-offline` with a batch: `[{local_id, work_date, project_id, duration_minutes, description, version: -1}, ...]`.
2. Server validates and inserts each row with `version = 0`, returns the server-assigned `id` and `version` keyed by `local_id`.
3. Client updates its IndexedDB rows with the server ids and sets `version = 0`.

Subsequent edits to a server-acknowledged row follow the normal three-layer optimistic mutation pattern: `PATCH /api/v1/timesheets/{id}` with the last-seen server version; server returns 409 on mismatch; client opens `<ConflictResolver>` (see `specs/DESIGN_SYSTEM.md` section 5.10).

If two offline devices create rows with distinct `local_id` values for the same `work_date` + `project_id` pair, both sync as two separate entries. The user sees duplicate rows in the timesheet grid and can merge manually. This is intentional: automatic merging on identity fields would lose data.

**Autosave cadence on mobile** is 10 seconds (vs 5 on desktop) to reduce sync collisions on slower networks.

**Offline read cache.** The service worker caches the last 30 days of pages the user viewed across employees, clients, projects, timesheets, leaves, expenses, and invoices. Strategy: `Cache-First` for `GET /api/v1/*` with a `stale-while-revalidate` refresh on the next network request.

When offline, cached data renders normally with an "Offline" badge pinned to the topbar. Write actions are disabled except for timesheet entry (which uses the offline queue above). Search is disabled when offline (depends on the server).

Cache size cap: 50 MB per origin. LRU eviction when cap reached. Cache busts on app version upgrade or on explicit sign-out.

**Tenant isolation:** if a user switches tenants offline, the local queue must NOT leak across tenants. IndexedDB keys are scoped by `tenant_id`.

**Full offline support** for approvals, dashboards, invoices, expense drafts, and other features is deferred (DEF-047). Native mobile wrapper beyond PWA is deferred (DEF-051). Offline-first full state sync with conflict resolution (Linear/Notion style) is deferred (DEF-050).

---

## 8. Push notifications

**In-app notifications + PWA Web Push are the primary channels.** Email is the fallback ONLY for specific kinds (auth flows, invoice delivery to clients, opt-in daily digest, legal notices). Not a general fallback.

- Web Push via service worker, `pywebpush` on the backend
- Subscriptions stored in `public.push_subscriptions(user_id, endpoint, p256dh_key, auth_key, created_at, last_seen_at)`
- User opts in from account settings; browser-native permission prompt
- Per-kind preferences in `public.notification_preferences` (user can mute specific kinds)
- Notification kinds (Phase 2 locked): `approval_requested`, `approval_decided`, `import_finished`, `invoice_sent`, `mention`, `payment_failed`, `payment_succeeded`, `trial_ending`, `tenant_suspended`, `security_alert`, `digest_daily`
- iOS 16.4+ supports Web Push in PWAs. Phase 2 ships with Chrome/Edge/Firefox/Android; iOS Safari tested before launch.

---

## 9. PWA manifest

- Path: `/manifest.webmanifest`
- Name: "Gamma", short name: "Gamma"
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
