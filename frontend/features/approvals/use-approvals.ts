"use client";
import { useQuery } from "@tanstack/react-query";
import type { ApprovalRequest, ApprovalListFilters } from "./types";

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
    amount: 287.50,
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
    amount: 145.00,
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
    amount: 312.00,
    currency: "EUR",
    status: "approved",
    submitted_at: "2026-04-12T17:00:00Z",
    reviewed_at: "2026-04-12T17:00:00Z",
    urgency: "normal",
  },
];

export function useApprovals(filters: ApprovalListFilters = {}) {
  return useQuery<ApprovalRequest[]>({
    queryKey: ["approvals", filters],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      let items = MOCK_APPROVALS;
      if (filters.status) {
        items = items.filter((a) => a.status === filters.status);
      }
      if (filters.type) {
        items = items.filter((a) => a.type === filters.type);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        items = items.filter(
          (a) =>
            a.requester_name.toLowerCase().includes(q) ||
            a.subject.toLowerCase().includes(q) ||
            (a.project_name ?? "").toLowerCase().includes(q),
        );
      }
      return items;
    },
    staleTime: 30_000,
  });
}
