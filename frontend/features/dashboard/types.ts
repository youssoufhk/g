/**
 * Shape returned by `GET /api/v1/dashboard/kpis`. Must match
 * `backend/app/features/dashboard/schemas.py::DashboardKpisResponse`
 * exactly. Optional fields are reserved for future Phase 5a additions
 * (hours, expenses, invoices, approvals counts) and may be undefined
 * until the corresponding backend service functions land.
 */
export type DashboardKpis = {
  employees_total: number;
  clients_total: number;
  projects_total: number;
  projects_active: number;
  /** Phase 5a: total approved hours this week across the tenant. */
  timesheets_hours_this_week?: number;
  /** Phase 5a: tenant weekly target (default 37.5 or 40). */
  timesheets_target_hours?: number;
  /** Phase 5a: expenses in "submitted" state awaiting any approval. */
  expenses_pending_count?: number;
  expenses_pending_eur?: number;
  /** Phase 5a: invoices with status=sent and due_date>=today. */
  invoices_outstanding_count?: number;
  invoices_outstanding_amount?: number;
  invoices_overdue_count?: number;
  /** Phase 5a: union of timesheets/leaves/expenses awaiting approval. */
  pending_approvals?: number;
};
