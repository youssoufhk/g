"use client";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { USE_API } from "@/lib/api-mode";
import { PROJECTS as ALL_PROJECTS } from "@/lib/mock-data";

import type { Project, ProjectListFilters, ProjectPhase, ProjectStatus } from "./types";

const MOCK_PROJECTS: Project[] = ALL_PROJECTS;

type ProjectOutDto = {
  id: number;
  name: string;
  client_id: number;
  status: string;
  budget_minor_units: number | null;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  owner_employee_id: number | null;
  created_at: string;
};

type ProjectsListResponseDto = {
  items: ProjectOutDto[];
  total: number;
};

const VALID_STATUSES: ProjectStatus[] = ["active", "complete", "on_hold", "cancelled"];
const VALID_PHASES: ProjectPhase[] = [
  "discovery",
  "proposal",
  "delivery",
  "review",
  "complete",
  "at_risk",
  "on_hold",
];

function adaptProject(dto: ProjectOutDto): Project {
  const status: ProjectStatus = (VALID_STATUSES as string[]).includes(dto.status)
    ? (dto.status as ProjectStatus)
    : "active";
  const phase: ProjectPhase = (VALID_PHASES as string[]).includes(dto.status)
    ? (dto.status as ProjectPhase)
    : "delivery";
  const budgetEur = dto.budget_minor_units != null ? dto.budget_minor_units / 100 : 0;
  return {
    id: String(dto.id),
    name: dto.name,
    client_id: String(dto.client_id),
    client_name: `Client #${dto.client_id}`,
    manager_id: dto.owner_employee_id != null ? String(dto.owner_employee_id) : "",
    manager_name: dto.owner_employee_id != null ? `Manager #${dto.owner_employee_id}` : "Unassigned",
    status,
    phase,
    start_date: dto.start_date ?? dto.created_at.slice(0, 10),
    end_date: dto.end_date ?? undefined,
    budget_eur: budgetEur,
    budget_consumed_eur: 0,
    team_size: 0,
  };
}

function filterProjects(items: Project[], filters: ProjectListFilters): Project[] {
  let next = items;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    next = next.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.client_name.toLowerCase().includes(q) ||
        p.manager_name.toLowerCase().includes(q),
    );
  }
  if (filters.status) {
    next = next.filter((p) => p.status === filters.status);
  }
  if (filters.client_id) {
    next = next.filter((p) => p.client_id === filters.client_id);
  }
  if (filters.phase) {
    next = next.filter((p) => p.phase === filters.phase);
  }
  return next;
}

export function useProjects(filters: ProjectListFilters = {}) {
  return useQuery<Project[]>({
    queryKey: ["projects", USE_API ? "api" : "mock", filters],
    queryFn: async () => {
      if (USE_API) {
        const data = await apiFetch<ProjectsListResponseDto>(`/projects?limit=500&offset=0`);
        return filterProjects(data.items.map(adaptProject), filters);
      }
      await new Promise((r) => setTimeout(r, 200));
      return filterProjects(MOCK_PROJECTS, filters);
    },
    staleTime: 30_000,
  });
}

export function useProject(id: string) {
  return useQuery<Project>({
    queryKey: ["project", USE_API ? "api" : "mock", id],
    queryFn: async () => {
      if (USE_API) {
        const data = await apiFetch<ProjectsListResponseDto>(`/projects?limit=500&offset=0`);
        const dto = data.items.find((p) => String(p.id) === id);
        if (!dto) throw new Error("Project not found");
        return adaptProject(dto);
      }
      await new Promise((r) => setTimeout(r, 150));
      const project = MOCK_PROJECTS.find((p) => p.id === id);
      if (!project) throw new Error("Project not found");
      return project;
    },
    staleTime: 60_000,
  });
}
