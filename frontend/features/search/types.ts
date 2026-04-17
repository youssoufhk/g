export type SearchHitKind = "employees" | "clients" | "projects";

export type SearchHit = {
  kind: SearchHitKind;
  id: number;
  title: string;
  subtitle: string | null;
};

export type SearchGroupedResponse = {
  employees: SearchHit[];
  clients: SearchHit[];
  projects: SearchHit[];
  total: number;
};
