"use client";
import { useQuery } from "@tanstack/react-query";
import type { Project, ProjectListFilters } from "./types";
import { PROJECTS as ALL_PROJECTS } from "@/lib/mock-data";

const MOCK_PROJECTS: Project[] = ALL_PROJECTS;

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
