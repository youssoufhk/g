"use client";
import { useQuery } from "@tanstack/react-query";
import type { Employee, EmployeeListFilters, EmployeeListResponse } from "./types";
import { EMPLOYEES as ALL_EMPLOYEES } from "@/lib/mock-data";

const MOCK_EMPLOYEES: Employee[] = ALL_EMPLOYEES;

export function useEmployees(filters: EmployeeListFilters = {}) {
  return useQuery<EmployeeListResponse>({
    queryKey: ["employees", filters],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      let items = MOCK_EMPLOYEES;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        items = items.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.title.toLowerCase().includes(q) ||
            e.department.toLowerCase().includes(q),
        );
      }
      if (filters.department && filters.department !== "all") {
        items = items.filter((e) => e.department === filters.department);
      }
      if (filters.status && filters.status !== "all") {
        items = items.filter((e) => e.status === filters.status);
      }
      const total = items.length;
      // Show first 50 in the table; total reflects full count for KPI strips
      const displayItems = items.slice(0, 50);
      return { items: displayItems, total };
    },
    staleTime: 30_000,
  });
}

export function useEmployee(id: string) {
  return useQuery<Employee>({
    queryKey: ["employee", id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      const emp = MOCK_EMPLOYEES.find((e) => e.id === id);
      if (!emp) throw new Error("Employee not found");
      return emp;
    },
    staleTime: 60_000,
  });
}
