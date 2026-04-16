export type Employee = {
  id: string;
  name: string;
  title: string;
  department: string;
  manager_id?: string;
  manager_name?: string;
  email: string;
  status: "active" | "inactive" | "on_leave";
  start_date: string; // ISO date
  work_time_pct: number; // 0-100
  avatar_color_index?: number;
  location?: string;
  skills?: string[];
  current_projects?: { id: string; name: string }[];
  leave_balance_days?: number;
  pending_expenses_eur?: number;
  hours_this_month?: number;
  capacity_hours?: number;
};

export type EmployeeListFilters = {
  search?: string;
  department?: string;
  status?: string;
};

export type EmployeeListResponse = {
  items: Employee[];
  total: number;
};
