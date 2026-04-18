"use client";
import { useQuery, useMutation } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { USE_API } from "@/lib/api-mode";

import type { TimesheetWeek } from "./types";

/**
 * Returns the 7 ISO date strings (Mon-Sun) for the week beginning on weekStart.
 */
export function getWeekDates(weekStart: string): string[] {
  const dates: string[] = [];
  const base = new Date(weekStart);
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

/**
 * ISO-8601 week number for a given YYYY-MM-DD Monday.
 * The backend keys weeks by (iso_year, iso_week), so we compute both
 * to look up the matching envelope from /timesheets/weeks.
 */
function isoYearWeek(mondayIso: string): { iso_year: number; iso_week: number } {
  const d = new Date(mondayIso + "T00:00:00Z");
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const iso_week = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
  return { iso_year: d.getUTCFullYear(), iso_week };
}

function buildMockWeek(weekStart: string): TimesheetWeek {
  const allDates = getWeekDates(weekStart);
  const mon = allDates[0] as string;
  const tue = allDates[1] as string;
  const wed = allDates[2] as string;
  const thu = allDates[3] as string;
  const fri = allDates[4] as string;
  const sun = allDates[6] as string;

  const entries = [
    {
      id: "e1",
      project_id: "p1",
      project_name: "HSBC Digital Transformation",
      client_name: "HSBC UK",
      hours: {
        [mon]: 8,
        [tue]: 7.5,
        [wed]: 8,
        [thu]: 6,
        [fri]: 7.5,
      } as Record<string, number>,
      total_hours: 37,
    },
    {
      id: "e2",
      project_id: "p2",
      project_name: "BNP Risk Model",
      client_name: "BNP Paribas",
      hours: {
        [wed]: 2,
        [thu]: 4,
      } as Record<string, number>,
      total_hours: 6,
    },
    {
      id: "e3",
      project_id: "p3",
      project_name: "Internal",
      client_name: "Gamma",
      hours: {
        [fri]: 1,
      } as Record<string, number>,
      total_hours: 1,
    },
  ];

  const daily_totals: Record<string, number> = {};
  for (const date of allDates) {
    daily_totals[date] = entries.reduce((sum, e) => sum + (e.hours[date] ?? 0), 0);
  }

  const week_total = entries.reduce((sum, e) => sum + e.total_hours, 0);

  return {
    week_start: weekStart,
    week_end: sun,
    entries,
    daily_totals,
    week_total,
    target_hours: 40,
    status: "draft",
  };
}

type TimesheetWeekEnvelopeDto = {
  id: number;
  employee_id: number;
  iso_year: number;
  iso_week: number;
  status: "draft" | "submitted" | "approved" | string;
  submitted_at: string | null;
  approved_at: string | null;
  created_at: string;
};

type TimesheetWeeksListDto = {
  items: TimesheetWeekEnvelopeDto[];
  total: number;
};

/**
 * One-off feature flag for the timesheet grid: even in USE_API mode the
 * grid cells (entries + daily totals) are generated client-side because
 * the backend only exposes the week envelope today. Pages consume this
 * so they can surface a "mock data" degraded banner until the write
 * endpoints land. See CRITIC_PLAN A2 and D5.
 */
export const TIMESHEET_BUILDER_MODE: "mock" | "api" = "mock";

export function useTimesheetWeek(weekStart: string) {
  return useQuery<TimesheetWeek>({
    queryKey: ["timesheet-week", USE_API ? "api" : "mock", weekStart],
    queryFn: async () => {
      const base = buildMockWeek(weekStart);
      if (!USE_API) {
        await new Promise((r) => setTimeout(r, 200));
        return base;
      }
      // Live arm: read the week envelope list and overlay status onto
      // the mock-built grid. Entries + daily totals stay mock until the
      // write endpoint lands (CRITIC_PLAN D5).
      const { iso_year, iso_week } = isoYearWeek(weekStart);
      const data = await apiFetch<TimesheetWeeksListDto>(
        `/timesheets/weeks?limit=500&offset=0`,
      );
      const envelope = data.items.find(
        (w) => w.iso_year === iso_year && w.iso_week === iso_week,
      );
      if (!envelope) return base;
      const status: TimesheetWeek["status"] =
        envelope.status === "submitted" ||
        envelope.status === "approved" ||
        envelope.status === "draft"
          ? envelope.status
          : "draft";
      return { ...base, status };
    },
    staleTime: 30_000,
  });
}

export function useSubmitTimesheet() {
  return useMutation({
    mutationFn: async (_weekStart: string) => {
      // Write path is mock-only: the backend /timesheets/weeks endpoint
      // is read-only today. Flipping this arm to apiFetch is a one-line
      // change once the submit endpoint lands (CRITIC_PLAN D5).
      await new Promise((r) => setTimeout(r, 200));
      return { success: true };
    },
  });
}
