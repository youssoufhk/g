"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
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

export function useTimesheetWeek(weekStart: string) {
  return useQuery<TimesheetWeek>({
    queryKey: ["timesheet-week", weekStart],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      return buildMockWeek(weekStart);
    },
    staleTime: 30_000,
  });
}

export function useSubmitTimesheet() {
  return useMutation({
    mutationFn: async (_weekStart: string) => {
      await new Promise((r) => setTimeout(r, 200));
      return { success: true };
    },
  });
}
