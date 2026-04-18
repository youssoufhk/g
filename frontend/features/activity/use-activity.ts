"use client";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { USE_API } from "@/lib/api-mode";

import type { AuditEntry } from "./types";

type AuditEntryDto = {
  id: number;
  actor_id: string;
  actor_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  occurred_at: string;
  diff: Array<{ field: string; before: unknown; after: unknown }>;
};

type AuditListDto = {
  items: AuditEntryDto[];
  total: number;
};

function adaptEntry(dto: AuditEntryDto): AuditEntry {
  return {
    id: String(dto.id),
    actor_id: dto.actor_id,
    actor_name: dto.actor_name ?? dto.actor_id,
    action: dto.action,
    entity_type: dto.entity_type,
    entity_id: dto.entity_id,
    occurred_at: dto.occurred_at,
    diff: dto.diff.map((d) => ({
      field: d.field,
      before: d.before as string | number | null,
      after: d.after as string | number | null,
    })),
  };
}

/**
 * Seed entries for the mock arm. The same shape as the backend endpoint
 * will return once it lands (CRITIC_PLAN C11 + D5). One entry per common
 * mutation so the UI exercises every diff kind: status change, profile
 * edit, and a role grant.
 */
const MOCK_ENTRIES: AuditEntry[] = [
  {
    id: "a1",
    actor_id: "u-102",
    actor_name: "Alice Martin",
    action: "employee.update",
    entity_type: "employee",
    entity_id: "",
    occurred_at: "2026-04-17T14:32:00Z",
    diff: [
      { field: "job_title", before: "Consultant", after: "Senior Consultant" },
      { field: "daily_rate", before: 520, after: 620 },
    ],
  },
  {
    id: "a2",
    actor_id: "u-001",
    actor_name: "Youssouf Kerzika",
    action: "employee.role.grant",
    entity_type: "employee",
    entity_id: "",
    occurred_at: "2026-04-10T09:05:00Z",
    diff: [{ field: "roles", before: "employee", after: "employee, manager" }],
  },
  {
    id: "a3",
    actor_id: "u-102",
    actor_name: "Alice Martin",
    action: "employee.update",
    entity_type: "employee",
    entity_id: "",
    occurred_at: "2026-03-28T11:14:00Z",
    diff: [{ field: "office_location", before: "Paris", after: "London" }],
  },
];

export function useRecentActivity(entity_type: string, entity_id: string) {
  return useQuery<AuditEntry[]>({
    queryKey: ["activity", USE_API ? "api" : "mock", entity_type, entity_id],
    queryFn: async () => {
      if (USE_API) {
        const data = await apiFetch<AuditListDto>(
          `/audit/entries?entity_type=${encodeURIComponent(entity_type)}&entity_id=${encodeURIComponent(entity_id)}&limit=20`,
        );
        return data.items.map(adaptEntry);
      }
      await new Promise((r) => setTimeout(r, 150));
      return MOCK_ENTRIES.map((e) => ({ ...e, entity_id }));
    },
    staleTime: 30_000,
  });
}
