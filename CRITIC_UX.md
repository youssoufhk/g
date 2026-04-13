# CRITIC: Interaction & UX Quality

## Verdict: CONDITIONAL — Would pay €50/user? MAYBE

The prototype has strong visual polish and a respectable set of working interactions, but contains a cluster of dead buttons, toast-only feedback that masquerades as real action, broken flows where modals open but the "confirm" has no effect, and several friction traps that would frustrate a busy PM on day two. It clears the bar for a funded demo; it does not yet clear the bar for €50/seat production trust.

---

## Dead interactions (no handler at all)

1. **invoices.html — "Download PDF" button (`id="downloadPdfBtn"`)**: Button exists in detail view. `addEventListener` is wired in JS, but the handler calls `showToast('info','Download','Downloading PDF...')` only — no actual download, no Blob, no link click. User gets a toast and nothing else.

2. **invoices.html — "Generate First Invoice" button (`id="emptyGenerateBtn"`) in empty state**: Opens the generate modal correctly, but only when the populated/empty toggle is in the empty state. In default populated mode the element is `display:none` and unreachable by users who land on an empty account without knowing about the developer toggle. The toggle itself (`state-toggle` button) is developer-only and accidentally ships visible.

3. **expenses.html — "Camera" button inside upload zone**: Renders as a `<button class="btn btn-secondary btn-sm">` with zero `onclick` and zero event listener. Clicking it does nothing whatsoever.

4. **expenses.html — "Browse" button inside upload zone**: Same problem — no handler. The upload zone div itself has a click handler that opens a file picker, but the labelled "Browse" button is a dead nested child.

5. **hr.html — "Filter" button (`id="filterCandidatesBtn"`) on Recruitment Pipeline**: Handler fires `showToast('info', 'Filter', 'Filter options coming soon.')`. No filter UI ever appears. Candidates cannot be filtered by role, stage, or date. This is broken for a PM reviewing 47 candidates.

6. **hr.html — candidate cards (`draggable="true"`)**: Cards have `draggable="true"` and a visual hover lift, but there is no `dragstart`, `dragover`, or `drop` handler anywhere. The Kanban board cannot be reordered by drag.

7. **approvals.html — "Approve with Note" button (`class="approve-note-btn"`)**: The JS wires delegation for `.approve-note-btn` but no element in the rendered HTML actually has this class — all approve buttons use `class="approve-btn"`. The approve-with-note flow is unreachable.

8. **account.html — "Delete Account" button (`id="deleteAccountBtn")**: Rendered `disabled` with `onclick="confirmDeleteAccount()"`. The function `confirmDeleteAccount` is not defined anywhere in the page script. Clicking (if enabled) would throw a JS error.

9. **account.html — "Upload photo" button** (account profile tab): Handler calls `GHR.showToast('info', 'Coming soon', 'Photo upload will be available in the production build.')` — explicitly stubbed. At €50/user, profile photos are table stakes.

10. **portal/index.html — portal nav tabs** ("Projects", "Invoices", "Time & Expenses", "Approvals", "Documents"): CSS class `portal-nav-item.active` is only applied to the first tab in HTML. Clicking other tabs has no JavaScript handler to swap `.portal-section.active`. Sections cannot be switched. The client portal is functionally a single static screen.

11. **insights.html — "Export Report" / chart data points**: Revenue trend bars and utilisation line-chart dots have cursor:pointer and hover effects but no onclick. Clicking a bar does nothing; there is no drill-down or detail view.

12. **planning.html / gantt.html — not reviewed in depth** but confirmed these pages include resource allocation bars with `cursor:pointer` and no click delegation wired.

---

## Broken flows (partial/wrong behavior)

13. **invoices.html — "Record Payment" flow does not update invoice status**: `markPaidBtn` opens `recordPaymentModal`. The confirm button inside the modal fires `showToast('success', 'Payment Recorded', ...)` and closes the modal, but the invoice status badge ("Sent") does not change to "Paid", the status timeline does not advance, and the payment history card remains showing "No payments recorded yet." User has no confirmation that anything actually changed.

14. **invoices.html — "Send to Client" — confirm button wired but invoice list row status unchanged**: `confirmSendBtn` closes the modal and shows a toast, but the invoice's badge in the list view (still showing "Draft" or "Sent") is never updated. Navigating back to the list shows the same status.

15. **invoices.html — "More" button (`data-action="more"`) on every invoice row**: Each row has an action button with `data-action="more"`. The JS wires `action-btn` delegation for `data-action="view"` only; `"more"` has no handler. Clicking the ellipsis button does nothing.

16. **leaves.html — balance cards clickable to pre-fill leave type but modal form does not pre-select type**: `onclick="openLeaveModalWithType('annual')"` is called; the function opens the modal and attempts to set the leave type select, but the modal takes a moment to render and the pre-selection is lost on first click due to the element not yet existing in DOM when `openLeaveModalWithType` runs. Users must manually select type even after clicking a card that implies it.

17. **timesheets.html — "Saved Views" dropdown does not close on outside click**: The dropdown uses `this.nextElementSibling.classList.toggle('active')` with no document-level outside-click handler. Once opened, users must click the button again to close it. Switching tabs or clicking anywhere else leaves the dropdown open.

18. **hr.html — candidate card click opens slide panel but "Schedule Interview" / "Move Stage" buttons inside the panel only show toasts**: No actual stage move occurs. The Kanban board count badges (e.g., "Applied: 15") never decrement. The pipeline is read-only despite appearing interactive.

19. **admin.html — "Add Leave Type" button (`id="addLeaveTypeBtn"`)**: Button is rendered in the Leave Types tab. Searching for an event listener in the script finds none attached to this ID. The button is dead.

20. **auth.html — "Sign in with Google" / "Sign in with Microsoft" SSO buttons**: Both buttons render as full-width `<button>` elements inside `.alt-login`. No `onclick` or event listener is attached to either. SSO is completely dead.

21. **invoices.html — "Edit Line Items" button (`id="editLineItemsBtn"`)**: Calls `toggleInvoiceEdit()`. The function exists and adds `.editing` class to the wrapper, enabling `.line-item-editable` cells. However, there is no "Save Changes" button that appears while in edit mode, and no cancel mechanism. Users can enter edit mode but cannot exit it gracefully or confirm changes.

22. **expenses.html — "Edit" button on newly submitted expense items**: When `submitExpense()` creates a new expense card, the card includes a rendered `<button class="btn btn-ghost btn-xs">Edit</button>` with zero handler. Immediate editing of a just-submitted expense is impossible.

---

## Friction points (too many steps, no feedback, confusing)

23. **Timesheets — week navigation arrows have no visible loading/transition**: Clicking previous/next week arrows swaps the week label but all cell values remain identical. There is no indicator that different data is loading. A user cannot tell if navigation worked.

24. **Expenses "Scan with AI" requires two steps unnecessarily**: User uploads a receipt, then must additionally click "Scan with AI" — even though uploading already auto-triggers `startAiScan()`. The button appears redundant and the UX contradicts itself (upload already scans).

25. **Approvals — "Reject" button has no rejection-reason form on bulk reject**: Clicking the bulk "Reject" button removes cards and shows a toast, but never asks for a rejection reason. Individual reject opens a reason modal; bulk reject skips it. Employees receive a rejection with no explanation.

26. **Leaves.html — leave calendar tab is a static SVG-like grid**: No hover state reveals which employee is on leave for a given cell. No tooltip, no click. A busy manager cannot use the calendar to understand team availability.

27. **Employees — pagination controls are rendered (Previous/Next/Page 1)**: Buttons are rendered with `disabled` state correctly, but clicking page 2, 3, etc. does nothing — there is no data load, no filter, no scroll. Pagination is decorative.

28. **Admin "Save Settings" buttons are scattered**: Each settings tab section has its own "Save Changes" button at the bottom. There is no visual feedback between clicking save and the toast appearing — no spinner, no button state change. On a slow connection a user would double-click.

29. **Account page — "Change email" is non-functional with no explanation upfront**: The email field is `readonly`. Clicking the edit icon shows a toast saying "Contact your admin." This is only discoverable after interaction. A prominent label ("Managed by admin") would eliminate confusion.

30. **Portal — no "back to admin" navigation when viewing shared invoice**: The portal header has no link back to the main GammaHR app. If opened via "Share with Client →" the internal user is stuck in the portal with no escape route except the browser back button.

31. **HR Kanban — "Applied: 15" count badge contradicts visible cards**: The column header shows count 15, but only 3 cards are visibly rendered. No "show more" or pagination exists. New users will distrust the data immediately.

32. **Insights — NL query chips do not populate the input field**: Clicking a query chip (e.g. "Which employees are near overtime?") fires an onclick handler that populates the input and triggers a query simulation — this part works. However the query results section shows a hard-coded response regardless of which chip was clicked, making it feel fake rather than intelligent.

33. **Dashboard — "View All" links on approval items and presence list link to correct pages but lose context**: Clicking "View All Approvals" correctly links to approvals.html, but the approvals page opens at the default "All" filter, not pre-filtered to show the same items. User loses context on every cross-page navigation.

---

## Empty state gaps

34. **Insights page — no empty state for zero AI insights**: The AI insight cards section has no empty-state fallback if all insights are dismissed. After dismissing all cards, the section disappears silently with no "All clear" message or call to action.

35. **Gantt / Planning pages — no empty state for new company**: A brand-new org opening the Gantt chart would see an empty SVG canvas with no guidance message, no "Add your first project" CTA, and no explanation of the view.

36. **Clients page — "Add Client" → client contact form has no empty state for contacts list**: The contacts tab in a new client detail view renders a table header with no rows and no empty-state illustration. Just a bare table.

37. **HR Offboarding tab**: The offboarding tab shows 2 cards — fine. But if a company has never offboarded anyone, there is no empty state. The tab count badge shows "2" in the tab but would show nothing meaningful for a clean account.

38. **Calendar page — no empty state for a month with zero events**: The calendar renders a full month grid regardless. A month with no leave, no projects, no deadlines shows an empty grid with no indicator that "nothing is scheduled" vs. "data failed to load."

---

## Things that genuinely work well

- **Expense submission flow** is end-to-end complete: form validation, loading spinner, optimistic insert into list, stat card update, tab switch, and success toast. This is the best flow in the prototype.
- **Approval approve/reject with animation**: Individual approve removes the card with a slide-out, updates the count, and shows a celebrate empty state when the queue is cleared. Delightful.
- **Toast system** (`GHR.showToast`) is polished: correct icon per type, auto-dismiss, pause on hover, close button. Consistent across all pages.
- **Command palette (⌘K)** opens, accepts input, filters results visibly, and navigates on click. Keyboard shortcut, ESC close, and backdrop click all work.
- **Role switcher** correctly gates UI elements behind `data-min-role` and `data-sensitive`, with live switching and toast confirmation.
- **Hover employee cards** (`data-hovercard`) are smooth, correctly positioned, show real data, and close properly. A genuinely premium detail.
- **Auth page** multi-step registration flow (login → MFA → onboarding wizard) is complete with proper step transitions, password strength meter, and rate-limit countdown simulation.
- **Timesheet inline cell editing** (click a cell, type a value, Tab/Enter/Escape) works correctly with validation and auto-save toast.
