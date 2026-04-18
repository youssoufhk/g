"use client";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { USE_API } from "@/lib/api-mode";

import type { ApprovalListFilters, ApprovalRequest, ApprovalType } from "./types";

type ApprovalOutDto = {
  id: string;
  type: string;
  requester_id: number;
  requester_name: string | null;
  subject: string;
  submitted_at: string;
  period: string | null;
  amount_cents: number | null;
  currency: string | null;
};

type ApprovalsListResponseDto = {
  items: ApprovalOutDto[];
  total: number;
};

const VALID_TYPES: ApprovalType[] = ["timesheet", "expense", "leave"];

function adaptApproval(dto: ApprovalOutDto): ApprovalRequest {
  const type: ApprovalType = (VALID_TYPES as string[]).includes(dto.type)
    ? (dto.type as ApprovalType)
    : "timesheet";
  return {
    id: dto.id,
    type,
    requester_id: String(dto.requester_id),
    requester_name: dto.requester_name ?? "Unknown",
    subject: dto.subject,
    amount: dto.amount_cents != null ? dto.amount_cents / 100 : undefined,
    currency: dto.currency ?? undefined,
    period: dto.period ?? undefined,
    status: "pending",
    submitted_at: dto.submitted_at,
    urgency: "normal",
  };
}

const MOCK_APPROVALS: ApprovalRequest[] = [
  {
    id: "a1",
    type: "timesheet",
    requester_id: "emp1",
    requester_name: "Amara Diallo",
    requester_avatar_color_index: 2,
    subject: "Week 15 timesheet (37.5h)",
    period: "Apr 7 - 13",
    project_name: "HSBC Digital Transformation",
    status: "pending",
    submitted_at: "2026-04-14T09:15:00Z",
    urgency: "normal",
  },
  {
    id: "a2",
    type: "expense",
    requester_id: "emp2",
    requester_name: "Lucas Ferreira",
    requester_avatar_color_index: 4,
    subject: "Eurostar Paris-London",
    amount: 287.5,
    currency: "EUR",
    project_name: "BNP Risk Model",
    status: "pending",
    submitted_at: "2026-04-14T08:30:00Z",
    urgency: "high",
  },
  {
    id: "a3",
    type: "leave",
    requester_id: "emp3",
    requester_name: "Sophie Martin",
    requester_avatar_color_index: 1,
    subject: "Annual leave - 5 days",
    period: "Apr 21 - 25",
    status: "pending",
    submitted_at: "2026-04-13T16:00:00Z",
    urgency: "normal",
  },
  {
    id: "a4",
    type: "expense",
    requester_id: "emp4",
    requester_name: "James Morel",
    requester_avatar_color_index: 0,
    subject: "Team dinner",
    amount: 145.0,
    currency: "EUR",
    status: "pending",
    submitted_at: "2026-04-13T11:20:00Z",
    urgency: "normal",
  },
  {
    id: "a5",
    type: "timesheet",
    requester_id: "emp5",
    requester_name: "Chiara Rossi",
    requester_avatar_color_index: 3,
    subject: "Week 15 timesheet (32h)",
    period: "Apr 7 - 13",
    project_name: "TotalEnergies ESG",
    status: "approved",
    submitted_at: "2026-04-13T14:00:00Z",
    reviewed_at: "2026-04-13T14:00:00Z",
    reviewer_note: "Approved",
    urgency: "normal",
  },
  {
    id: "a6",
    type: "expense",
    requester_id: "emp6",
    requester_name: "Omar Hassan",
    requester_avatar_color_index: 5,
    subject: "Hotel - client site",
    amount: 312.0,
    currency: "EUR",
    status: "approved",
    submitted_at: "2026-04-12T17:00:00Z",
    reviewed_at: "2026-04-12T17:00:00Z",
    urgency: "normal",
  },
];

function filterApprovals(items: ApprovalRequest[], filters: ApprovalListFilters): ApprovalRequest[] {
  let next = items;
  if (filters.status) next = next.filter((a) => a.status === filters.status);
  if (filters.type) next = next.filter((a) => a.type === filters.type);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    next = next.filter(
      (a) =>
        a.requester_name.toLowerCase().includes(q) ||
        a.subject.toLowerCase().includes(q) ||
        (a.project_name ?? "").toLowerCase().includes(q),
    );
  }
  return next;
}

export function useApprovals(filters: ApprovalListFilters = {}) {
  return useQuery<ApprovalRequest[]>({
    queryKey: ["approvals", USE_API ? "api" : "mock", filters],
    queryFn: async () => {
      if (USE_API) {
        const data = await apiFetch<ApprovalsListResponseDto>(`/approvals/pending?limit=500`);
        return filterApprovals(data.items.map(adaptApproval), filters);
      }
      await new Promise((r) => setTimeout(r, 200));
      return filterApprovals(MOCK_APPROVALS, filters);
    },
    staleTime: 30_000,
  });
}
