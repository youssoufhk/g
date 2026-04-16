export type LeaveType = "annual" | "sick" | "parental" | "unpaid" | "public_holiday" | "compassionate";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export type LeaveRequest = {
  id: string;
  employee_id: string;
  employee_name: string;
  type: LeaveType;
  start_date: string; // ISO
  end_date: string;   // ISO
  days: number;       // total calendar days requested
  status: LeaveStatus;
  reason?: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewer_note?: string;
};

export type LeaveBalance = {
  annual_total: number;     // days entitled
  annual_taken: number;
  annual_remaining: number;
  sick_taken: number;
  pending_requests: number;
};

export type LeaveListFilters = {
  status?: LeaveStatus;
  type?: LeaveType;
  employee_id?: string;
};
