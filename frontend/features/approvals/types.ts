export type ApprovalType = "timesheet" | "expense" | "leave";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export type ApprovalRequest = {
  id: string;
  type: ApprovalType;
  requester_id: string;
  requester_name: string;
  requester_avatar_color_index?: number;
  subject: string;       // e.g. "Week 15 timesheet" or "Eurostar receipt - £287"
  amount?: number;       // for expense approvals
  currency?: string;
  period?: string;       // for timesheet/leave: "Apr 14 - 20" or "Apr 21 - 25"
  project_name?: string;
  status: ApprovalStatus;
  submitted_at: string;  // ISO datetime
  reviewed_at?: string;
  reviewer_note?: string;
  urgency: "normal" | "high";
};

export type ApprovalListFilters = {
  status?: ApprovalStatus;
  type?: ApprovalType;
  search?: string;
};
