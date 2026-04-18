"use client";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { USE_API } from "@/lib/api-mode";
import { EMPLOYEES as ALL_EMPLOYEES } from "@/lib/mock-data";

import type { Employee, EmployeeListFilters, EmployeeListResponse } from "./types";

const MOCK_EMPLOYEES: Employee[] = ALL_EMPLOYEES;

/**
 * Backend shape from `backend/app/features/employees/schemas.py`
 * (EmployeeOut). Kept local to this hook so the feature module
 * stays self-contained; the frontend `Employee` type is the
 * canonical view model shared by every page.
 */
type EmployeeOutDto = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  team: string;
  hire_date: string;
  manager_employee_id: number | null;
  base_currency: string;
  status: string;
  created_at: string;
};

type EmployeesListResponseDto = {
  items: EmployeeOutDto[];
  total: number;
};

const ROLE_TO_TITLE: Record<string, string> = {
  owner: "Founder",
  admin: "Admin",
  finance: "Finance",
  manager: "Manager",
  pm: "Project Manager",
  employee: "Consultant",
  recruiting: "Recruiter",
  readonly: "Read-only",
};

function adaptEmployee(dto: EmployeeOutDto): Employee {
  const name = `${dto.first_name} ${dto.last_name}`.trim();
  const status: Employee["status"] =
    dto.status === "active" || dto.status === "inactive" || dto.status === "on_leave"
      ? dto.status
      : "active";
  return {
    id: String(dto.id),
    name,
    title: ROLE_TO_TITLE[dto.role] ?? dto.role,
    department: dto.team || "General",
    email: dto.email,
    status,
    start_date: dto.hire_date,
    work_time_pct: 100,
    manager_id: dto.manager_employee_id != null ? String(dto.manager_employee_id) : undefined,
    avatar_color_index: dto.id % 8,
  };
}

export function useEmployees(filters: EmployeeListFilters = {}) {
  return useQuery<EmployeeListResponse>({
    queryKey: ["employees", USE_API ? "api" : "mock", filters],
    queryFn: async () => {
      if (USE_API) {
        const data = await apiFetch<EmployeesListResponseDto>(`/employees?limit=500&offset=0`);
        let items = data.items.map(adaptEmployee);
        items = applyFilters(items, filters);
        const total = items.length;
        return { items: items.slice(0, 50), total };
      }
      await new Promise((r) => setTimeout(r, 200));
      const items = applyFilters(MOCK_EMPLOYEES, filters);
      const total = items.length;
      return { items: items.slice(0, 50), total };
    },
    staleTime: 30_000,
  });
}

function applyFilters(items: Employee[], filters: EmployeeListFilters): Employee[] {
  let next = items;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    next = next.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q),
    );
  }
  if (filters.department && filters.department !== "all") {
    next = next.filter((e) => e.department === filters.department);
  }
  if (filters.status && filters.status !== "all") {
    next = next.filter((e) => e.status === filters.status);
  }
  return next;
}

export function useEmployee(id: string) {
  return useQuery<Employee>({
    queryKey: ["employee", USE_API ? "api" : "mock", id],
    queryFn: async () => {
      if (USE_API) {
        const data = await apiFetch<EmployeesListResponseDto>(`/employees?limit=500&offset=0`);
        const dto = data.items.find((e) => String(e.id) === id);
        if (!dto) throw new Error("Employee not found");
        return adaptEmployee(dto);
      }
      await new Promise((r) => setTimeout(r, 200));
      const emp = MOCK_EMPLOYEES.find((e) => e.id === id);
      if (!emp) throw new Error("Employee not found");
      return emp;
    },
    staleTime: 60_000,
  });
}
