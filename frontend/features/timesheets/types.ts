export type TimesheetEntry = {
  id: string;
  project_id: string;
  project_name: string;
  client_name: string;
  // hours per day, keyed by ISO date string "YYYY-MM-DD"
  hours: Record<string, number>;
  // computed
  total_hours: number;
};

export type TimesheetWeek = {
  week_start: string; // ISO date of Monday
  week_end: string;   // ISO date of Sunday
  entries: TimesheetEntry[];
  daily_totals: Record<string, number>; // date -> total hours
  week_total: number;
  target_hours: number; // e.g. 40 for a full-time week
  status: "draft" | "submitted" | "approved";
};

export type TimesheetFilters = {
  week_start?: string;
};
