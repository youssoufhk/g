# CROSS-CRITIQUE 3: Dashboard/Nav Audit vs Mobile Audit

**Cross-Critique Agent:** Agent 3
**Date:** 2026-04-05
**Audits Reviewed:**
- AUDIT_DASHBOARD_NAV.md (Critique Agent 1)
- AUDIT_MOBILE.md (Critique Agent 3 -- Mobile & Responsiveness)
**Primary Focus:** Dashboard-on-mobile intersection, navigation coherence on mobile, blind spots in each audit

---

## Blind Spots in AUDIT_DASHBOARD_NAV

### DN-1. Dashboard Never Considered Mobile Viewport [CRITICAL -- MISSING]

The dashboard audit evaluates information hierarchy, widget placement, and the 60/40 column split purely from a desktop perspective. It never asks: "What does a manager see when they open the dashboard on their phone at 7am?" This is the most important blind spot because the dashboard is the landing page for every user session.

On mobile (< 640px), the dashboard experience is:

1. The `grid-60-40` collapses to `1fr` (single column), which means the left column stacks on top of the right column. The order becomes: Team Availability table (horizontal scroll) -> AI Alerts -> Mini Gantt -> Live Presence -> Approvals -> Revenue -> Donut. The most actionable widget for a mobile manager (Pending Approvals) is buried 4th from the top, after three widgets that display poorly on mobile.
2. The KPI grid collapses to single-column, meaning 6 stat cards stacked vertically consume roughly 900-1000px of vertical scroll before the user reaches any actionable content.
3. The greeting (`text-display-lg`) is even more wasteful on a 390px screen where viewport real estate is at an extreme premium.

The dashboard audit correctly notes that Pending Approvals is in the 40% column and should be more prominent (Section 2.2), but frames this only as a desktop layout concern. On mobile, this problem is dramatically worse: the widget is pushed below the entire left column worth of content.

### DN-2. KPI Cards Not Being Clickable Is Worse on Mobile [SEVERITY ADJUSTMENT]

The dashboard audit rates KPI card interactivity at 7/10 and notes the cards are not clickable (Section 2.3). On mobile, this problem escalates. Mobile users expect tap targets to navigate. A mobile user tapping "12 Pending Approvals" expects to land on the approvals page. There is no affordance, no cursor change, no `<a>` wrapping. On desktop, users can find the sidebar link. On mobile, they must open the hamburger menu, find Approvals, and tap it. The KPI card being a dead tap target on mobile should be rated CRITICAL, not just "7/10 with a note."

### DN-3. Greeting Date Is Wrong [LOW -- MISSED]

The dashboard shows "Saturday, April 5, 2026" (`index.html:517`). April 5, 2026 is a **Sunday**, not a Saturday. Neither audit caught this. A static prototype with a hardcoded wrong day-of-week undermines credibility.

### DN-4. No Accessibility Audit of Dashboard [MEDIUM -- MISSING]

The dashboard audit covers navigation, widgets, and blueprint compliance but never examines accessibility. Verified against the source:

- Only 1 `aria-label` exists in the entire `index.html` file (on the notification bell button). None of the other interactive widgets (approval tabs, approve/reject buttons, sort headers, command palette, state toggle) have ARIA attributes.
- No `role` attributes on any widget (the tab system uses `.tab` class divs but no `role="tablist"`, `role="tab"`, or `role="tabpanel"`).
- No skip-to-content link.
- No `aria-live` region for the toast notifications, meaning screen readers will not announce approval confirmations.
- The sort headers announce via toast only -- no `aria-sort` attribute on `<th>` elements.

This is not a mobile-specific issue, but it has mobile implications: mobile screen readers (VoiceOver, TalkBack) are a primary assistive technology on phones, and the dashboard is completely opaque to them.

### DN-5. Sidebar Mobile Close Behavior Not Audited [MEDIUM -- MISSING]

The dashboard audit verifies that the sidebar opens/closes and the overlay exists. But it does not test what happens when a user taps a nav item with the sidebar open on mobile. Verified in the JS: clicking a nav `<a>` tag on mobile will navigate to the new page via normal `href`, but the sidebar does NOT close first. There is no click handler on `.nav-item` elements that calls `sidebar.classList.remove('mobile-open')`. This means:
1. The sidebar transition animates during page navigation, creating a flash.
2. If the link is to the current page (e.g., tapping Dashboard while on Dashboard), the sidebar stays open with no way to close except tapping the overlay. This is because `<a href="index.html">` will reload the page, but on a slow connection, the user sees the sidebar stuck open.

### DN-6. User Dropdown Is Invisible on Mobile [HIGH -- MISSING]

The dashboard audit (Section 3.3) details user dropdown inconsistencies across pages but never notes that **on mobile, the user's name and role are hidden** (`_layout.css:388-389`). The dropdown trigger becomes just a bare avatar circle with a tiny chevron. The audit never asks: "Can the user still access Profile/Settings/Logout on mobile?" The answer is yes (the avatar is still tappable), but the affordance is degraded -- users may not realize the avatar is a dropdown trigger when it has no name label.

Additionally, the `.user-dropdown` has `width: 240px` and `position: absolute; right: 0`. On mobile, with `padding: 0 var(--space-4)` on the header, the dropdown's right edge aligns with the header's right padding, but its left edge may be very close to or overlap the left edge of the viewport on a 390px screen (390 - 16 padding - 240 = 134px left margin -- workable but tight). This was never tested.

### DN-7. Command Palette Results Have No Mobile Scroll Handling [LOW -- MISSING]

The dashboard audit notes the command palette is static (Section 3.1) but misses that the palette has no `max-height` or scroll on mobile. At 390px, the palette takes nearly the full viewport width, and if the results list grows beyond the visible area, there is no overflow handling specified in the CSS. This is less critical for a static prototype but relevant for the pattern.

---

## Blind Spots in AUDIT_MOBILE

### MOB-1. Dashboard Widget Stacking Order on Mobile Is Actively Harmful [CRITICAL -- MISSING]

The mobile audit gives the dashboard a 4/10 and lists what breaks (table scroll, small buttons, donut layout), but does not analyze the **stacking order problem**. When `grid-60-40` collapses to single column on mobile, CSS grid places the left column above the right column in source order. This means:

**Mobile stacking order (top to bottom):**
1. Greeting (low value)
2. 6 KPI cards stacked vertically (~900px)
3. Team Availability table (requires horizontal scroll)
4. AI Alerts (actionable but secondary)
5. Mini Gantt (barely usable at 390px)
6. Live Presence (moderate value)
7. **Pending Approvals (highest-priority action item)**
8. Revenue Trend (low priority)
9. Donut Chart (decorative)

The single most important mobile action -- approving timesheets/leaves/expenses -- requires scrolling past ~2500px of content. The mobile audit correctly notes "no bottom nav bar" and that navigation requires 3+ interactions, but it does not flag that the dashboard's content order itself is hostile to mobile task completion.

A remediation the mobile audit should have recommended: use CSS `order` property within a `@media (max-width: 639px)` query to reorder the grid children so Pending Approvals appears immediately after the KPI cards.

### MOB-2. The Empty State Toggle Overlaps Mobile Content [LOW -- MISSING]

The mobile audit identifies that the "status toggle button (bottom-right) will overlap content on mobile" but does not specify what it overlaps. The `.state-toggle` is `position: fixed; bottom: var(--space-4); right: var(--space-4)` with `z-index: 800`. On mobile, this will:
1. Overlap the last card's content in the scrollable area.
2. If a bottom nav bar were added (as the mobile audit recommends), the toggle would overlap the bottom nav since both compete for the bottom-right corner.

This is a prototype-review tool, not a production element, but it is worth noting the conflict with the recommended bottom nav.

### MOB-3. Sidebar Badges Are Unreadable at Mobile Collapsed Size [MEDIUM -- MISSING]

The mobile audit notes the sidebar opens as a full-width overlay on mobile. But at tablet breakpoint (640-1023px), the sidebar auto-collapses and badges become `14px` height with `8px` font-size (`_layout.css:77-83`). The mobile audit defines its scope as 390px (iPhone 15 Pro) but does not test the tablet breakpoint where badges shrink to near-illegibility. This matters because iPad and Android tablet usage is common for managers reviewing dashboards.

More importantly: on mobile (<640px), when the sidebar is opened via hamburger, it opens at `var(--sidebar-width)` (full width). But the _layout.css has no rule to UN-collapse the badges/labels for the mobile-open state vs the tablet collapsed state. The mobile sidebar opens at full width with labels visible (correct), but this relies on the mobile rules overriding the tablet rules by cascade order, not by specificity. If a user on a 639px-wide device opens the sidebar, they get the mobile rules. If on a 640px device, they get the tablet collapsed rules with no hamburger. There is a 1px boundary where the UX changes drastically with no graceful transition.

### MOB-4. Touch Target Audit Missing the Dashboard Approval Actions [SEVERITY CONFIRMATION]

The mobile audit correctly identifies that `.btn-xs` is 28px (Section G6 table). It mentions "Approval items: approve/reject buttons are `btn-icon btn-xs` (28x28px)" in the dashboard section. However, looking at the actual markup (`index.html:1015`), the approve buttons are `btn btn-primary btn-xs` (not `btn-icon btn-xs`). They are text buttons, not icon-only buttons. A text button with `btn-xs` class is 28px in height but wider due to text content. The height violation is correct (28px vs 44px minimum), but the width is likely 60-80px, not 28px. The mobile audit should distinguish: the **height** is the violation, not the overall touch area. The width may be adequate.

The reject buttons are `btn btn-destructive-ghost btn-xs` -- same height issue. Confirmed.

### MOB-5. Dashboard Donut Chart SVG Sizing on Mobile [LOW -- PARTIALLY COVERED]

The mobile audit notes the `.donut-wrap` flex layout has no mobile stacking. But it does not note that the SVG donut has a fixed `width="140" height="140"` attribute. On a 390px viewport, after card padding (~16px * 2 + 16px * 2 = 64px), the available card content width is ~326px. A 140px SVG + the legend (which has no `min-width`) will fit side-by-side, but barely. At 320px viewports (iPhone SE), the flex wrap will cause issues since there is no `flex-wrap: wrap` on `.donut-wrap`. The legend will be forced into ~180px (326 - 140 - 24 gap) on a 390px device, which is tight but usable. On 320px it breaks to ~116px for the legend.

---

## Cross-Cutting Issues

### CC-1. Dashboard Is Simultaneously the Most Important Page and the Worst Mobile Experience [CRITICAL]

The dashboard audit rates the overall prototype at 5.5/10. The mobile audit gives the dashboard 4/10 for mobile. The intersection of these two assessments reveals a compounding problem neither audit fully articulates:

**The dashboard is the first thing every user sees, and on mobile it is the page with the worst content-to-action ratio.** A manager opening GammaHR on their phone encounters:
1. A large greeting (not actionable)
2. Six vertically stacked KPI cards (not tappable)
3. A horizontally scrolling table (hostile on mobile)
4. AI alerts with 28px buttons (hard to tap)
5. A mini gantt (barely legible)
6. A presence list (informational but not actionable)
7. Pending Approvals with 28px approve/reject buttons (the actual task they came to do)

The blueprint specifies "Hero: Week at a Glance" as the first widget below the greeting -- a personal timesheet widget with a "Quick Log Today's Time" CTA. This was designed to make the dashboard immediately actionable from the first fold. Its absence (noted by the dashboard audit, Section 2.1) is doubly harmful on mobile where every pixel of scroll matters.

**Neither audit connects these dots:** the missing hero widget + non-clickable KPIs + hostile mobile ordering + no bottom nav bar = a mobile manager cannot accomplish their primary task (approve timesheets) without extensive scrolling through non-actionable content and hunting for tiny buttons.

### CC-2. Navigation on Mobile Is a Three-System Failure [CRITICAL]

The dashboard audit covers sidebar navigation coherence (ordering, icons, badges, active states). The mobile audit covers the missing bottom nav bar. Neither connects the three navigation systems that a mobile user must use:

1. **Hamburger sidebar:** Works but is 3 interactions to reach any page. No close-on-navigate behavior. Touch targets for nav items are adequate (they are `<a>` tags with padding), but the badge text at 8px inside the overlay is very small.

2. **Search / Command Palette:** Hidden on mobile (`header-search { display: none }`). The Cmd+K shortcut is desktop-only. There is NO mobile trigger for the command palette. The dashboard audit (Section 3.1) notes this, the mobile audit (G9) notes this, but neither says the obvious: **the command palette is the fastest way to navigate, and it is 100% inaccessible on mobile.**

3. **Bottom Nav Bar:** Does not exist. The design system specifies it. Both audits note its absence independently. But together: the hamburger is slow, search is hidden, and bottom nav is missing. A mobile user has exactly ONE navigation method: the 3-interaction hamburger menu. This is unacceptable for a frequently-used mobile app.

### CC-3. "employees.html" Link Problem Amplifies on Mobile [HIGH]

The dashboard audit (Sections 2.4, 2.5, 2.6, 2.7) repeatedly flags that all employee name links point to `employees.html` (the team directory list page) instead of individual profile pages. The mobile audit does not mention this at all.

On mobile, this problem is worse: tapping "Sarah Chen" in the Team Availability table navigates to the full team directory on a 390px screen, where the user must then search for Sarah Chen in a list that may require scrolling. On desktop, the user can at least see more of the list at once. On mobile, it is a dead-end navigation that wastes the user's time and context.

This pattern repeats across the dashboard: AI Alerts employee links, Presence panel names, Mini Gantt names -- at least 20+ links on the dashboard all go to the generic list page. On mobile, every one of these is a worse experience than on desktop.

### CC-4. Notification Panel Width vs Mobile [MEDIUM]

Both audits flag the notification panel width issue but with different severity. The dashboard audit (Section 5.1) says "the notification panel is `position: absolute` with a fixed width of 380px. On mobile, this will overflow the viewport." The mobile audit (G8) says the panel is 380px on a 390px viewport, leaving "only 10px of margin."

Verified: the `.notif-panel` has `width: 380px` and is positioned `right: 0` inside a `position: relative` wrapper in the header. The header has `padding: 0 var(--space-4)` (16px) on mobile. The panel's right edge aligns with the relative parent's right edge, which is inside the header padding. So the panel's left edge is at: viewport_right - header_right_padding - 380px. On a 390px screen, the right edge of the relative parent is approximately 390 - 16 = 374px from viewport left. The panel extends 380px to the left from there, reaching -6px -- **it overflows the viewport by about 6px on the left side.** This is confirmed overflow, not "10px of margin." The mobile audit underestimated the overflow.

### CC-5. The Dashboard Date Says Saturday but April 5, 2026 Is a Sunday [LOW]

As verified against a calendar calculation, the dashboard greeting (`index.html:517`) says "Saturday, April 5, 2026." April 5, 2026 is a Sunday. This is a factual error in the static prototype data. Neither audit caught this. Minor in isolation, but it undermines prototype credibility during stakeholder review.

---

## Severity Adjustments

| Original Audit | Issue | Original Severity | Adjusted Severity | Rationale |
|---|---|---|---|---|
| Dashboard | KPI cards not clickable (2.3) | 7/10 rating, implied LOW | **HIGH** | On mobile, non-tappable KPI cards are actively frustrating -- users expect tap targets. The dashboard audit only considered this from a desktop "nice to have" perspective. |
| Dashboard | Approvals in 40% right column (2.2) | 5/10 rating, implied MEDIUM | **CRITICAL on mobile** | On mobile single-column collapse, approvals are not just in a "narrower column" -- they are 4th from the bottom after ~2500px of scroll. This is the primary mobile task. |
| Dashboard | Live Presence badge count wrong (2.7) | HIGH (bug #6) | **Confirm HIGH** | 6 online vs badge saying 8 -- correct finding. No adjustment needed. |
| Mobile | Dashboard score 4/10 (Page 1) | 4/10 | **3/10** | The mobile audit did not account for the stacking order problem (approvals buried under 2500px of scroll) or the donut chart having no flex-wrap. |
| Mobile | Missing bottom nav bar (G1) | CRITICAL | **BLOCKER** | Given that search is also hidden on mobile, the bottom nav bar is not just "critical" -- it is the difference between having 1 navigation method and having 2. Combined with the buried approvals widget, the prototype is non-functional for mobile managers without it. |
| Mobile | Table-to-card transform missing (G2) | CRITICAL | **Confirm CRITICAL** | The dashboard's Team Availability table at 700px on a 390px screen is exactly the case this was designed to solve. |
| Dashboard | Command palette search hidden on mobile (5.1) | LOW (mentioned in passing) | **HIGH** | The dashboard audit buries this in a CSS layout sub-bullet. Combined with missing bottom nav, mobile users have no fast navigation at all. |
| Dashboard | Sidebar collapse `~` combinator fragility (5.1) | LOW (noted) | **LOW -- Confirm** | The `~` sibling combinator does work with the sidebar-overlay in between. The audit is correct that it is fragile but it is not broken. |
| Mobile | Dashboard donut mobile layout (Page 1) | Noted but no severity | **LOW** | The SVG at 140px plus legend can technically fit at 390px. It only breaks at 320px (iPhone SE). Low priority. |
| Neither | Greeting date wrong (Sunday not Saturday) | Not found | **LOW** | Factual error in prototype data. Easy fix, but undermines credibility. |
| Neither | No ARIA attributes on dashboard widgets | Not found | **MEDIUM** | The dashboard has 1 aria-label across the entire page. Tab widgets, approve buttons, sort headers, toasts -- all lack ARIA. Mobile screen reader users (VoiceOver/TalkBack) cannot use the dashboard. |
| Neither | Sidebar does not close on mobile nav click | Not found | **MEDIUM** | Navigation via hamburger menu works but is not clean -- sidebar stays open during page transition. |
