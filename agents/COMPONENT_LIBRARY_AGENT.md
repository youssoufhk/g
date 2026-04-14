# COMPONENT LIBRARY AGENT

> One-shot brief for Phase 2: build the design system before any feature work begins.
> Owner: Design System Guardian.

---

## 1. Mandate

Build every atom in `specs/DESIGN_SYSTEM.md` into a Next.js 15 + Tailwind 4 component library with one Storybook story per atom and visual regression against `prototype/*.html` at all breakpoints.

**Exit condition:** any page in `APP_BLUEPRINT.md` can be built using only existing atoms.

---

## 2. Deliverables

1. `frontend/` scaffolded: Next.js 15 App Router, Tailwind 4, TypeScript strict
2. `frontend/styles/tokens.css` importing `prototype/_tokens.css` values as CSS variables (exact copy, locked)
3. `tailwind.config.ts` referencing the CSS variables (no hardcoded colors)
4. `frontend/components/ui/` with every atom
5. `frontend/components/shell/` with Sidebar, Topbar, BottomNav, CommandPalette
6. Storybook set up with one story file per atom (all variants + states + dark/light)
7. `prototype-parity/` Storybook section with side-by-side renders
8. Playwright visual regression at 320, 768, 1024, 1440, 1920 widths

---

## 3. Build order (strictly sequential)

1. Scaffolding (Next.js, Tailwind, tokens, Storybook)
2. Shell atoms: Sidebar (224 px), Topbar (56 px), BottomNav (64 px)
3. Typography + layout atoms (Heading, Text, Stack, Grid)
4. Button variants (primary, secondary, ghost, destructive, icon)
5. Input atoms (Input, Textarea, Select, DatePicker, FileDrop, Checkbox, Radio, Toggle)
6. Data display (Table, Row, Card, Badge, Avatar, ProgressBar, StatCard)
7. Feedback (Toast, InlineAlert, Skeleton, EmptyState)
8. Navigation (TabBar, Breadcrumb, Pagination)
9. Overlay (Modal, Drawer, Popover, Tooltip, BottomSheet)
10. Chart atoms (BarChart, LineChart, DonutChart via Visx)
11. AI atoms (CommandPalette, InsightCard, AIExplainButton, SuggestionChip)

Each step must pass side-by-side prototype parity before moving to the next.

---

## 4. Rules

- Never invent an atom. If not in the spec, stop and ask.
- Never modify tokens. `prototype/_tokens.css` is locked.
- Every atom has fixed dimensions per the spec. No "flexible" variants.
- Accessible by default: ARIA, keyboard, focus management.
- Dark mode default. Light mode verified in parallel.
- Storybook is the spec. If not in Storybook, the variant does not exist.
- No em dashes in source files, docs, or UI text.

---

## 5. Done

- [ ] Every atom from `DESIGN_SYSTEM.md` has a Storybook entry
- [ ] Every entry shows variants, states, dark + light
- [ ] Prototype parity section shows side-by-side renders
- [ ] Playwright visual regression suite green
- [ ] Lighthouse a11y >= 95 on Storybook
- [ ] Shell renders pixel-identical across all breakpoints
- [ ] Founder approves visually

Phase 2 ends only when all boxes are checked.
