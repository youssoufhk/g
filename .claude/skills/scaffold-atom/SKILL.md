---
name: scaffold-atom
description: Use this skill whenever the user wants to create a new Gamma design-system atom. Triggers include "create a new atom", "scaffold the Badge atom", "add a Checkbox to the design system", "add the SearchInput to components/ui". Generates the atom file, the Storybook story, and the variant catalog following the locked prototype tokens. Never invents new tokens, never adds animations, and follows CLAUDE.md rule 4 (never invent atoms without founder approval, which this skill assumes the caller already obtained).
---

# scaffold-atom: the deterministic recipe for a new Gamma design-system atom

This skill produces one new atom under `frontend/components/ui/` plus its Storybook story. It is used 20+ times during the Phase 2 atom layer build. Every atom follows the same recipe, so the skill bakes it in and you do not have to reload the full design system each time.

## Before you do anything

If you also see a skill called `frontend-design`, `brand-guidelines`, `theme-factory`, `canvas-design`, or `algorithmic-art` appear to match this task, **ignore them**. Those skills promote creative, maximalist, novel aesthetics. Gamma has a locked design system where inventing new atoms, fonts, colors, or animations is forbidden. This skill assumes the founder has already approved that this atom is needed and belongs in the design system.

If the founder has NOT approved the atom yet, stop and ask. CLAUDE.md rule 4: "Never invent atoms. If it is not in `specs/DESIGN_SYSTEM.md`, stop and ask. New atoms go through the founder."

## Hard rules from CLAUDE.md

These are quoted because they are load-bearing for this skill:

- **Rule 3, design tokens are locked.** `prototype/_tokens.css` is the source of truth. Sidebar is 224px. Primary is `hsl(155, 26%, 46%)`. Surfaces are `--color-surface-0..3`, not `--color-bg-0..3`. Never rename, never rewrite, never add new token keys.
- **Rule 4, never invent atoms.** If the atom is not already approved for the design system, stop.
- **Rule 8, no decorative flourishes.** No animations, no transitions beyond focus-ring show/hide, no sparklines, no 3D, no hover glows. Fix what is broken; do not beautify.
- **Rule 5, no em dashes.** Anywhere. Use hyphens or restructure.
- **Rule 6, no "utilisation".** Use "work time", "capacity", or "contribution".
- **Dark mode is home, light mode is the variant.** Every atom must work in both, verified via `[data-theme="light"]` on `<html>`.

## Inputs you need from the user

Confirm all five before writing any code. If anything is missing, stop and ask.

1. **Atom name in PascalCase.** Examples: `Checkbox`, `SearchInput`, `Badge`, `Avatar`, `Tag`.
2. **Purpose in one sentence.** What role does this atom play? "A binary selector for forms and filter menus" is good. "Generic wrapper" is not.
3. **Variants required.** Example for `Button`: `primary`, `secondary`, `ghost`, `danger`. Example for `Badge`: `neutral`, `success`, `warning`, `danger`, `info`.
4. **States required.** The union of `default`, `hover`, `focus`, `active`, `disabled`, `loading`, `error`, `read-only`. Only the subset that applies to this atom.
5. **Which pages will use it.** At least one concrete page from `specs/APP_BLUEPRINT.md`. If the atom has no consumer yet, it should not exist yet.

## Files you will create

Two, sometimes three:

- `frontend/components/ui/<atom-name>.tsx` - the component itself. PascalCase export, kebab-case filename.
- `frontend/components/ui/<atom-name>.stories.tsx` - the Storybook story with one story per variant and one story per state.
- (Optional) `frontend/components/ui/<atom-name>.types.ts` - only if the Props interface is large enough (>10 fields) or shared with other files. Otherwise keep the interface inline in the TSX file.

## Workflow, step by step

### Step 1: Read the tokens file

Open `prototype/_tokens.css`. Find the token group that matches the atom:

- Color atoms (Badge, StatPill, Tag): `--color-surface-*`, `--color-text-*`, `--color-brand-*`, plus the semantic `--color-success-*`, `--color-warning-*`, `--color-danger-*`, `--color-info-*`.
- Form atoms (Input, Checkbox, Select, Radio): `--color-border-*`, `--color-surface-1`, `--color-focus-ring`, `--radius-sm`, `--radius-md`.
- Sizing: `--space-*`, `--size-row-*`, `--size-control-*`, `--radius-*`.
- Typography: `--font-sans`, `--font-mono`, `--text-*`, `--leading-*`, `--weight-*`.

Never hard-code a hex color or a px value that has a token. Never add a new token. If something you need is missing, stop and ask the founder.

### Step 2: Read the nearest existing atom for shape consistency

Open one atom that already exists in `frontend/components/ui/` and is closest in function to the one you are building. If you are building `Checkbox`, read `Input` or `Switch`. If you are building `Badge`, read `Tag` or `StatPill`. Match its shape: import order, prop naming style, className composition, forwardRef usage, default export vs named export.

If no atoms exist yet (very early Phase 2), read `specs/DESIGN_SYSTEM.md` section 5 "Atoms (Fixed Dimensions)" and use its shape conventions.

### Step 3: Sketch the variants and states as a header comment

At the top of the TSX file, before imports, write a comment block listing every variant and every state the atom supports. This is the contract. The Storybook story will exercise every row in this list. Example:

```tsx
// Badge atom
// Variants: neutral, success, warning, danger, info
// States: default, hover (color-shift only, no animation), focus (visible ring), disabled
// Sizes: sm (20px row), md (24px row)
// Used in: 3.1 Employees list (status column), 4.2 Weekly entry grid (approval badge),
//          7.3 Invoice detail (status pill)
```

### Step 4: Implement the TSX component

- Define a TypeScript `Props` interface with JSDoc on every field.
- Use `React.forwardRef` when the atom is a form control or needs to be focusable from a parent.
- Compose classNames via `clsx` or the equivalent helper already used by adjacent atoms. Do not introduce a new utility.
- Reference tokens via CSS variables or Tailwind 4 theme classes only. Never inline styles.
- Set a fixed height from `--size-control-sm` / `--size-control-md`. Atoms have fixed dimensions (spec section 5).
- Default size is `md`. Default variant is the most neutral one (`primary` for actions, `neutral` for status).

### Step 5: Verify both themes

Both dark and light must look polished. Because the atom uses CSS variables, flipping `[data-theme="light"]` on `<html>` must change colors automatically with zero code changes. Do NOT add a second style block. If the variables are not enough, a token is missing and you should stop and ask.

### Step 6: Keyboard focus ring

Every interactive atom has a visible focus ring: 2px offset, `hsl(155, 26%, 46%)` (the `--color-focus-ring` token), visible in both themes. Use `:focus-visible`, not `:focus` (no ring on mouse click). Non-interactive atoms (Badge, StatPill as display) do not need a focus ring but must not trap focus either.

### Step 7: WCAG 2.1 AA contrast note

Add a comment after the Props interface listing the expected text-on-background contrast ratio for each variant in both themes. Example:

```tsx
// WCAG 2.1 AA contrast (target >= 4.5:1 for body, >= 3:1 for large text):
// neutral:  dark mode 12.4:1, light mode 11.8:1
// success:  dark mode 6.2:1,  light mode 5.7:1
// warning:  dark mode 7.1:1,  light mode 6.4:1
// danger:   dark mode 8.3:1,  light mode 7.9:1
// info:     dark mode 5.9:1,  light mode 5.4:1
```

You do not have to measure during scaffolding. Leave placeholder numbers and mark them `TODO: measure` only if the tokens are locked and the ratio is known to pass. For new variants, measure before the atom ships.

### Step 8: Storybook story

Create one story per variant and one story per state. Structure:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Neutral: Story = { args: { variant: "neutral", children: "Active" } };
export const Success: Story = { args: { variant: "success", children: "Approved" } };
// ... one per variant
export const Disabled: Story = { args: { variant: "neutral", disabled: true, children: "Locked" } };
// ... one per state
```

Every story uses realistic copy from the consuming page, not "Hello world". If the atom is a status badge, use real statuses from `specs/DATA_ARCHITECTURE.md`.

### Step 9: Lint the file

Before reporting back, check the file for:

- No em dash (U+2014) and no en dash (U+2013) in any string, comment, or JSX child.
- No "utilisation" in any form.
- No new token introduced via CSS custom property (grep `--color-`, `--space-`, `--radius-` against `prototype/_tokens.css`).
- No animation, transition, transform, or keyframe beyond the focus-ring reveal.
- No inline hex color, no inline px value where a token exists.

### Step 10: Report back

Return a short summary:

- Files created (two or three paths).
- Variants and states the atom supports.
- Which tokens the atom references.
- Which page from APP_BLUEPRINT is the first consumer.
- Any note for the founder (e.g., "the focus ring is verified dark only, light mode contrast needs measurement before ship").

## Validation checklist

Run through this before the final report. Any red item means you stop and fix.

- [ ] File paths match conventions (`<atom-name>.tsx`, `<atom-name>.stories.tsx`, kebab-case).
- [ ] No new tokens introduced.
- [ ] Dark mode verified via existing CSS variables.
- [ ] Light mode verified via `[data-theme="light"]` with zero extra code.
- [ ] Keyboard focus ring is visible and uses `--color-focus-ring`.
- [ ] Storybook story covers every variant and every state listed in the header comment.
- [ ] No em dashes, no "utilisation", no animations.
- [ ] Filename matches adjacent atoms in style.
- [ ] Contrast comment is present (numbers or TODO).
- [ ] The header comment lists the first consumer page from APP_BLUEPRINT.

## Naming conventions

- Component name: PascalCase (`Checkbox`, `SearchInput`, `StatPill`).
- File name: kebab-case (`checkbox.tsx`, `search-input.tsx`, `stat-pill.tsx`).
- Story file: same kebab-case base plus `.stories.tsx`.
- Prop interface: `<ComponentName>Props` (e.g., `CheckboxProps`).
- Export: named export, not default. Matches the rest of `components/ui/`.

## What this skill does NOT do

- It does not edit `specs/DESIGN_SYSTEM.md`. Adding the atom to the design system documentation is a founder task.
- It does not write unit tests or E2E tests. The Storybook story is the only test artifact this skill produces. Unit tests for interactive atoms are added separately.
- It does not modify any existing atom.
- It does not modify `prototype/_tokens.css`. Ever.
- It does not add the atom to the Tailwind 4 theme bridge in `frontend/styles/globals.css` (that file references tokens; individual atoms reference the theme).
- It does not invent new tokens. If you think you need one, stop and ask the founder.

## Example invocation

```
/scaffold-atom Checkbox
```

The skill will then ask for:

1. Purpose in one sentence
2. Variants required (likely `default`, `indeterminate` for `Checkbox`)
3. States required (`default`, `hover`, `focus`, `disabled`, `error`)
4. First consuming page from APP_BLUEPRINT

Another example:

```
/scaffold-atom SearchInput
```

Inputs: purpose ("single-line search box for list filter bars"), variants (`default`, `compact`), states (`default`, `focus`, `loading`, `disabled`), first consumer (`3.1 Employees list`).

## Cross-references

- `specs/DESIGN_SYSTEM.md` section 5 for atom catalog and fixed dimensions.
- `prototype/_tokens.css` for every token the atom may reference.
- `CLAUDE.md` rules 3, 4, 5, 6, 8 for the hard constraints this skill enforces.
- `frontend/components/ui/` for existing atoms used as shape references.
- `.claude/skills/build-page/SKILL.md` for how pages compose atoms (the downstream consumer of this skill).
