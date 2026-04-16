"use client";
import { useQuery } from "@tanstack/react-query";
import type { Client, ClientListFilters, ClientListResponse } from "./types";

const MOCK_CLIENTS: Client[] = [
  {
    id: "c1",
    name: "HSBC UK",
    industry: "Financial Services",
    country: "United Kingdom",
    currency: "GBP",
    status: "active",
    active_projects: 3,
    total_projects: 12,
    revenue_ytd: 847200,
    revenue_prev_year: 723000,
    team_size: 8,
    logo_color_index: 0,
    since_date: "2021-03-15",
    contacts: [
      { name: "Sarah Chen", role: "Engagement Director", email: "s.chen@hsbc.com" },
      { name: "Tom Bradley", role: "Finance Lead", email: "t.bradley@hsbc.com" },
    ],
  },
  {
    id: "c2",
    name: "BNP Paribas",
    industry: "Financial Services",
    country: "France",
    currency: "EUR",
    status: "active",
    active_projects: 2,
    total_projects: 8,
    revenue_ytd: 624000,
    revenue_prev_year: 580000,
    team_size: 5,
    logo_color_index: 2,
    since_date: "2020-09-01",
    contacts: [
      { name: "Marie Dubois", role: "Head of Projects", email: "m.dubois@bnp.com" },
    ],
  },
  {
    id: "c3",
    name: "TotalEnergies",
    industry: "Energy",
    country: "France",
    currency: "EUR",
    status: "active",
    active_projects: 1,
    total_projects: 5,
    revenue_ytd: 395000,
    revenue_prev_year: 420000,
    team_size: 4,
    logo_color_index: 4,
    since_date: "2022-01-10",
  },
  {
    id: "c4",
    name: "Renault Group",
    industry: "Automotive",
    country: "France",
    currency: "EUR",
    status: "active",
    active_projects: 1,
    total_projects: 3,
    revenue_ytd: 281000,
    revenue_prev_year: 245000,
    team_size: 3,
    logo_color_index: 1,
    since_date: "2023-04-01",
  },
  {
    id: "c5",
    name: "McKinsey & Co",
    industry: "Consulting",
    country: "United States",
    currency: "USD",
    status: "inactive",
    active_projects: 0,
    total_projects: 2,
    revenue_ytd: 0,
    revenue_prev_year: 312000,
    team_size: 0,
    logo_color_index: 3,
    since_date: "2019-11-01",
  },
];

export function useClients(filters: ClientListFilters = {}) {
  return useQuery<ClientListResponse>({
    queryKey: ["clients", filters],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      let items = MOCK_CLIENTS;

      if (filters.search) {
        const q = filters.search.toLowerCase();
        items = items.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.industry.toLowerCase().includes(q) ||
            c.country.toLowerCase().includes(q),
        );
      }

      if (filters.status && filters.status !== "all") {
        items = items.filter((c) => c.status === filters.status);
      }

      if (filters.industry && filters.industry !== "all") {
        items = items.filter((c) => c.industry === filters.industry);
      }

      return { items, total: items.length };
    },
    staleTime: 30_000,
  });
}

export function useClient(id: string) {
  return useQuery<Client>({
    queryKey: ["client", id],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      const client = MOCK_CLIENTS.find((c) => c.id === id);
      if (!client) throw new Error("Client not found");
      return client;
    },
    staleTime: 60_000,
  });
}
