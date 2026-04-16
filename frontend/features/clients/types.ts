export type Client = {
  id: string;
  name: string;
  industry: string;
  country: string;
  currency: "EUR" | "GBP" | "USD";
  status: "active" | "inactive" | "prospect";
  billing_contact?: string;
  active_projects: number;
  total_projects: number;
  revenue_ytd: number;      // actual amount (not cents)
  revenue_prev_year: number; // previous year for delta
  team_size: number;
  logo_color_index: number; // for avatar-style logo placeholder
  since_date: string; // ISO date
  contacts?: { name: string; role: string; email: string }[];
  notes?: string;
};

export type ClientListFilters = {
  search?: string;
  status?: string;
  industry?: string;
};

export type ClientListResponse = {
  items: Client[];
  total: number;
};
