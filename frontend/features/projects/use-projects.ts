"use client";
import { useQuery } from "@tanstack/react-query";
import type { Project, ProjectListFilters } from "./types";

const MOCK_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "HSBC Digital Transformation",
    client_id: "c1",
    client_name: "HSBC UK",
    manager_id: "1",
    manager_name: "Amara Diallo",
    status: "active",
    phase: "delivery",
    start_date: "2025-01-15",
    end_date: "2025-12-31",
    budget_eur: 480000,
    budget_consumed_eur: 302400,
    team_size: 4,
    team_members: [
      { id: "1", name: "Amara Diallo", role: "Lead Consultant" },
      { id: "2", name: "Lucas Ferreira", role: "Project Manager" },
      { id: "3", name: "Sophie Martin", role: "Analyst" },
      { id: "5", name: "Chiara Rossi", role: "Data Analyst" },
    ],
    description:
      "End-to-end digital transformation of HSBC UK's retail operations, covering process automation, data platform migration, and change management.",
    milestones: [
      { name: "Discovery workshop", date: "2025-02-01", complete: true },
      { name: "Architecture sign-off", date: "2025-03-15", complete: true },
      { name: "Pilot rollout", date: "2025-06-30", complete: true },
      { name: "Full rollout", date: "2025-10-01", complete: false },
      { name: "Hypercare exit", date: "2025-12-31", complete: false },
    ],
  },
  {
    id: "p2",
    name: "BNP Paribas Risk Model",
    client_id: "c2",
    client_name: "BNP Paribas",
    manager_id: "2",
    manager_name: "Lucas Ferreira",
    status: "active",
    phase: "delivery",
    start_date: "2025-03-01",
    end_date: "2025-10-31",
    budget_eur: 280000,
    budget_consumed_eur: 126000,
    team_size: 3,
    team_members: [
      { id: "2", name: "Lucas Ferreira", role: "Project Manager" },
      { id: "3", name: "Sophie Martin", role: "Financial Analyst" },
      { id: "5", name: "Chiara Rossi", role: "Quantitative Analyst" },
    ],
    description:
      "Credit risk model redevelopment for BNP Paribas Corporate Banking, including regulatory alignment with Basel IV and stress-testing framework.",
    milestones: [
      { name: "Regulatory scoping", date: "2025-03-20", complete: true },
      { name: "Model design review", date: "2025-05-15", complete: true },
      { name: "UAT phase 1", date: "2025-08-01", complete: false },
      { name: "Regulatory submission", date: "2025-10-15", complete: false },
    ],
  },
  {
    id: "p3",
    name: "TotalEnergies ESG Strategy",
    client_id: "c3",
    client_name: "TotalEnergies",
    manager_id: "2",
    manager_name: "Lucas Ferreira",
    status: "active",
    phase: "proposal",
    start_date: "2025-07-01",
    end_date: "2026-03-31",
    budget_eur: 195000,
    budget_consumed_eur: 23400,
    team_size: 2,
    team_members: [
      { id: "2", name: "Lucas Ferreira", role: "Engagement Lead" },
      { id: "4", name: "Omar Hassan", role: "Strategy Principal" },
    ],
    description:
      "ESG roadmap definition and reporting framework for TotalEnergies, covering Scope 1-3 emissions baseline, CSRD compliance, and investor narrative.",
    milestones: [
      { name: "Kickoff", date: "2025-07-15", complete: true },
      { name: "Baseline assessment", date: "2025-09-01", complete: false },
      { name: "Roadmap draft", date: "2025-11-30", complete: false },
      { name: "Board presentation", date: "2026-02-15", complete: false },
    ],
  },
  {
    id: "p4",
    name: "Renault Lean Analytics",
    client_id: "c4",
    client_name: "Renault",
    manager_id: "1",
    manager_name: "Amara Diallo",
    status: "active",
    phase: "review",
    start_date: "2024-10-01",
    end_date: "2025-05-31",
    budget_eur: 150000,
    budget_consumed_eur: 132000,
    team_size: 2,
    team_members: [
      { id: "1", name: "Amara Diallo", role: "Engagement Lead" },
      { id: "5", name: "Chiara Rossi", role: "Data Engineer" },
    ],
    description:
      "Lean analytics transformation for Renault's manufacturing ops, including real-time KPI dashboards, waste identification tooling, and team upskilling.",
    milestones: [
      { name: "Process mapping", date: "2024-11-01", complete: true },
      { name: "Dashboard MVP", date: "2025-01-15", complete: true },
      { name: "Pilot factory go-live", date: "2025-03-01", complete: true },
      { name: "Final handover", date: "2025-05-31", complete: false },
    ],
  },
  {
    id: "p5",
    name: "McKinsey Alliance Program",
    client_id: "c5",
    client_name: "McKinsey",
    manager_id: "4",
    manager_name: "Omar Hassan",
    status: "on_hold",
    phase: "discovery",
    start_date: "2025-09-01",
    end_date: "2026-06-30",
    budget_eur: 320000,
    budget_consumed_eur: 16000,
    team_size: 0,
    team_members: [],
    description:
      "Strategic alliance program co-developed with McKinsey, covering joint go-to-market, shared methodology licensing, and co-delivery on selected accounts.",
    milestones: [
      { name: "Alliance scoping call", date: "2025-09-15", complete: true },
      { name: "MOU signing", date: "2025-11-01", complete: false },
      { name: "Pilot engagement", date: "2026-02-01", complete: false },
    ],
  },
];

export function useProjects(filters: ProjectListFilters = {}) {
  return useQuery<Project[]>({
    queryKey: ["projects", filters],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      let items = MOCK_PROJECTS;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        items = items.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.client_name.toLowerCase().includes(q) ||
            p.manager_name.toLowerCase().includes(q),
        );
      }
      if (filters.status) {
        items = items.filter((p) => p.status === filters.status);
      }
      if (filters.client_id) {
        items = items.filter((p) => p.client_id === filters.client_id);
      }
      if (filters.phase) {
        items = items.filter((p) => p.phase === filters.phase);
      }
      return items;
    },
    staleTime: 30_000,
  });
}

export function useProject(id: string) {
  return useQuery<Project>({
    queryKey: ["project", id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 150));
      const project = MOCK_PROJECTS.find((p) => p.id === id);
      if (!project) throw new Error("Project not found");
      return project;
    },
    staleTime: 60_000,
  });
}
