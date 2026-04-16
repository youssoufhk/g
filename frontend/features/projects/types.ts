export type ProjectPhase =
  | "discovery"
  | "proposal"
  | "delivery"
  | "review"
  | "complete"
  | "at_risk"
  | "on_hold";

export type ProjectStatus = "active" | "complete" | "on_hold" | "cancelled";

export type Project = {
  id: string;
  name: string;
  client_id: string;
  client_name: string;
  manager_id: string;
  manager_name: string;
  status: ProjectStatus;
  phase: ProjectPhase;
  start_date: string;
  end_date?: string;
  budget_eur: number;
  budget_consumed_eur: number;
  team_size: number;
  team_members?: { id: string; name: string; role: string; avatar_color?: number }[];
  description?: string;
  milestones?: { name: string; date: string; complete: boolean }[];
};

export type ProjectListFilters = {
  search?: string;
  status?: string;
  client_id?: string;
  phase?: string;
};

export type ProjectListResponse = {
  items: Project[];
  total: number;
};
