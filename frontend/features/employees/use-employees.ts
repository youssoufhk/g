"use client";
import { useQuery } from "@tanstack/react-query";
import type { Employee, EmployeeListFilters, EmployeeListResponse } from "./types";

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "1",
    name: "Amara Diallo",
    title: "Senior Consultant",
    department: "Strategy",
    email: "amara.diallo@example.com",
    status: "active",
    start_date: "2022-03-01",
    work_time_pct: 87,
    avatar_color_index: 2,
    location: "Paris",
    manager_name: "Hassan K.",
    skills: ["Strategy", "Change Management"],
    current_projects: [{ id: "p1", name: "HSBC Transformation" }],
    leave_balance_days: 12.5,
    pending_expenses_eur: 1240,
    hours_this_month: 142,
    capacity_hours: 176,
  },
  {
    id: "2",
    name: "Lucas Ferreira",
    title: "Project Manager",
    department: "Operations",
    email: "lucas.ferreira@example.com",
    status: "active",
    start_date: "2021-06-15",
    work_time_pct: 95,
    avatar_color_index: 4,
    location: "London",
    skills: ["Agile", "Stakeholder Mgmt"],
    current_projects: [
      { id: "p2", name: "BNP Digital" },
      { id: "p3", name: "TotalEnergies" },
    ],
    leave_balance_days: 8,
    pending_expenses_eur: 320,
    hours_this_month: 168,
    capacity_hours: 176,
  },
  {
    id: "3",
    name: "Sophie Martin",
    title: "Junior Analyst",
    department: "Finance",
    email: "sophie.martin@example.com",
    status: "active",
    start_date: "2023-09-01",
    work_time_pct: 72,
    avatar_color_index: 1,
    location: "Paris",
    skills: ["Financial Modeling", "Excel"],
    leave_balance_days: 20,
    hours_this_month: 126,
    capacity_hours: 176,
  },
  {
    id: "4",
    name: "Omar Hassan",
    title: "Principal Consultant",
    department: "Strategy",
    email: "omar.hassan@example.com",
    status: "on_leave",
    start_date: "2019-01-10",
    work_time_pct: 0,
    avatar_color_index: 3,
    location: "London",
    skills: ["M&A", "Due Diligence"],
    current_projects: [],
    leave_balance_days: 3,
    hours_this_month: 0,
    capacity_hours: 0,
  },
  {
    id: "5",
    name: "Chiara Rossi",
    title: "Data Analyst",
    department: "Technology",
    email: "chiara.rossi@example.com",
    status: "active",
    start_date: "2022-11-01",
    work_time_pct: 60,
    avatar_color_index: 5,
    location: "Paris",
    skills: ["Python", "SQL", "Tableau"],
    current_projects: [{ id: "p4", name: "Renault Analytics" }],
    leave_balance_days: 15,
    hours_this_month: 104,
    capacity_hours: 176,
  },
  {
    id: "6",
    name: "James Morel",
    title: "Managing Consultant",
    department: "Operations",
    email: "james.morel@example.com",
    status: "active",
    start_date: "2018-05-07",
    work_time_pct: 100,
    avatar_color_index: 0,
    location: "London",
    skills: ["Program Mgmt", "Risk"],
    current_projects: [],
    leave_balance_days: 4,
    pending_expenses_eur: 2800,
    hours_this_month: 176,
    capacity_hours: 176,
  },
];

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
      return { items, total: items.length };
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
