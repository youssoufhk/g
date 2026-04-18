"use client";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { USE_API } from "@/lib/api-mode";
import { LEAVES } from "@/lib/mock-data";

import type { LeaveBalance, LeaveListFilters, LeaveRequest, LeaveStatus, LeaveType } from "./types";

type LeaveRequestOutDto = {
  id: number;
  employee_id: number;
  employee_name: string | null;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  days: number;
  status: string;
  reason: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
};

type LeaveRequestsListResponseDto = {
  items: LeaveRequestOutDto[];
  total: number;
};

function adaptStatus(raw: string): LeaveStatus {
  if (raw === "approved") return "approved";
  if (raw === "rejected") return "rejected";
  if (raw === "cancelled") return "cancelled";
  return "pending";
}

function adaptLeave(dto: LeaveRequestOutDto): LeaveRequest {
  return {
    id: String(dto.id),
    employee_id: String(dto.employee_id),
    employee_name: dto.employee_name ?? "Unknown",
    type: "annual" as LeaveType,
    start_date: dto.start_date,
    end_date: dto.end_date,
    days: Number(dto.days),
    status: adaptStatus(dto.status),
    reason: dto.reason ?? undefined,
    submitted_at: dto.created_at,
    reviewed_at: dto.approved_at ?? undefined,
    reviewer_note: dto.rejection_reason ?? undefined,
  };
}

function filterLeaves(items: LeaveRequest[], filters: LeaveListFilters): LeaveRequest[] {
  let next = items;
  if (filters.status) next = next.filter((l) => l.status === filters.status);
  if (filters.type) next = next.filter((l) => l.type === filters.type);
  if (filters.employee_id) next = next.filter((l) => l.employee_id === filters.employee_id);
  return next;
}

export function useLeaveRequests(filters: LeaveListFilters = {}) {
  return useQuery<LeaveRequest[]>({
    queryKey: ["leave-requests", USE_API ? "api" : "mock", filters],
    queryFn: async () => {
      if (USE_API) {
        const data = await apiFetch<LeaveRequestsListResponseDto>(`/leaves?limit=500&offset=0`);
        return filterLeaves(data.items.map(adaptLeave), filters);
      }
      await new Promise((r) => setTimeout(r, 200));
      return filterLeaves(LEAVES, filters);
    },
    staleTime: 30_000,
  });
}

export function useLeaveBalance() {
  return useQuery<LeaveBalance>({
    queryKey: ["leave-balance", USE_API ? "api" : "mock"],
    queryFn: async () => {
      const source = USE_API
        ? (await apiFetch<LeaveRequestsListResponseDto>(`/leaves?limit=500&offset=0`)).items.map(adaptLeave)
        : LEAVES;
      await new Promise((r) => setTimeout(r, 200));
      return {
        annual_total: 25,
        annual_taken: 10,
        annual_remaining: 15,
        sick_taken: 3,
        pending_requests: source.filter((l) => l.status === "pending").length,
      };
    },
    staleTime: 30_000,
  });
}
