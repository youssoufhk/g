"use client";
import { useQuery } from "@tanstack/react-query";
import type { LeaveRequest, LeaveBalance, LeaveListFilters } from "./types";

const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: "l1",
    employee_id: "emp1",
    employee_name: "Amara Diallo",
    type: "annual",
    start_date: "2026-04-21",
    end_date: "2026-04-25",
    days: 5,
    status: "pending",
    submitted_at: "2026-04-13T00:00:00Z",
  },
  {
    id: "l2",
    employee_id: "emp2",
    employee_name: "Lucas Ferreira",
    type: "sick",
    start_date: "2026-04-10",
    end_date: "2026-04-11",
    days: 2,
    status: "approved",
    submitted_at: "2026-04-09T00:00:00Z",
    reviewed_at: "2026-04-09T10:00:00Z",
  },
  {
    id: "l3",
    employee_id: "emp3",
    employee_name: "Sophie Martin",
    type: "annual",
    start_date: "2026-05-05",
    end_date: "2026-05-16",
    days: 10,
    status: "pending",
    submitted_at: "2026-04-12T00:00:00Z",
  },
  {
    id: "l4",
    employee_id: "emp5",
    employee_name: "Chiara Rossi",
    type: "annual",
    start_date: "2026-03-17",
    end_date: "2026-03-21",
    days: 5,
    status: "approved",
    submitted_at: "2026-03-14T00:00:00Z",
    reviewed_at: "2026-03-14T09:00:00Z",
  },
  {
    id: "l5",
    employee_id: "emp6",
    employee_name: "Omar Hassan",
    type: "sick",
    start_date: "2026-04-14",
    end_date: "2026-04-14",
    days: 1,
    status: "approved",
    submitted_at: "2026-04-14T08:00:00Z",
    reviewed_at: "2026-04-14T08:30:00Z",
  },
];

const MOCK_BALANCE: LeaveBalance = {
  annual_total: 25,
  annual_taken: 10,
  annual_remaining: 15,
  sick_taken: 3,
  pending_requests: 2,
};

export function useLeaveRequests(filters: LeaveListFilters = {}) {
  return useQuery<LeaveRequest[]>({
    queryKey: ["leave-requests", filters],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      let items = MOCK_LEAVE_REQUESTS;
      if (filters.status) {
        items = items.filter((l) => l.status === filters.status);
      }
      if (filters.type) {
        items = items.filter((l) => l.type === filters.type);
      }
      if (filters.employee_id) {
        items = items.filter((l) => l.employee_id === filters.employee_id);
      }
      return items;
    },
    staleTime: 30_000,
  });
}

export function useLeaveBalance() {
  return useQuery<LeaveBalance>({
    queryKey: ["leave-balance"],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      return MOCK_BALANCE;
    },
    staleTime: 30_000,
  });
}
