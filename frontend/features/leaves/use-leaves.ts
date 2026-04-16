"use client";
import { useQuery } from "@tanstack/react-query";
import type { LeaveRequest, LeaveBalance, LeaveListFilters } from "./types";
import { LEAVES } from "@/lib/mock-data";

const MOCK_BALANCE: LeaveBalance = {
  annual_total: 25,
  annual_taken: 10,
  annual_remaining: 15,
  sick_taken: 3,
  pending_requests: LEAVES.filter((l) => l.status === "pending").length,
};

export function useLeaveRequests(filters: LeaveListFilters = {}) {
  return useQuery<LeaveRequest[]>({
    queryKey: ["leave-requests", filters],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      let items = LEAVES;
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
