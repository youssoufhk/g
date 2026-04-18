"use client";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import { USE_API } from "@/lib/api-mode";
import { CLIENTS as ALL_CLIENTS } from "@/lib/mock-data";

import type { Client, ClientListFilters, ClientListResponse } from "./types";

const MOCK_CLIENTS: Client[] = ALL_CLIENTS;

type ClientOutDto = {
  id: number;
  name: string;
  country_code: string;
  currency: string;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  size_band: string;
  status: string;
  created_at: string;
};

type ClientsListResponseDto = {
  items: ClientOutDto[];
  total: number;
};

function adaptClient(dto: ClientOutDto): Client {
  const status: Client["status"] =
    dto.status === "active" || dto.status === "inactive" || dto.status === "prospect"
      ? dto.status
      : "active";
  const currency: Client["currency"] =
    dto.currency === "EUR" || dto.currency === "GBP" || dto.currency === "USD" ? dto.currency : "EUR";
  return {
    id: String(dto.id),
    name: dto.name,
    industry: dto.size_band || "Other",
    country: dto.country_code,
    currency,
    status,
    billing_contact: dto.primary_contact_email ?? dto.primary_contact_name ?? undefined,
    active_projects: 0,
    total_projects: 0,
    revenue_ytd: 0,
    revenue_prev_year: 0,
    team_size: 0,
    logo_color_index: dto.id % 8,
    since_date: dto.created_at.slice(0, 10),
  };
}

function filterClients(items: Client[], filters: ClientListFilters): Client[] {
  let next = items;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    next = next.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q),
    );
  }
  if (filters.status && filters.status !== "all") {
    next = next.filter((c) => c.status === filters.status);
  }
  if (filters.industry && filters.industry !== "all") {
    next = next.filter((c) => c.industry === filters.industry);
  }
  return next;
}

export function useClients(filters: ClientListFilters = {}) {
  return useQuery<ClientListResponse>({
    queryKey: ["clients", USE_API ? "api" : "mock", filters],
    queryFn: async () => {
      if (USE_API) {
        const data = await apiFetch<ClientsListResponseDto>(`/clients?limit=500&offset=0`);
        const items = filterClients(data.items.map(adaptClient), filters);
        return { items, total: items.length };
      }
      await new Promise((r) => setTimeout(r, 200));
      const items = filterClients(MOCK_CLIENTS, filters);
      return { items, total: items.length };
    },
    staleTime: 30_000,
  });
}

export function useClient(id: string) {
  return useQuery<Client>({
    queryKey: ["client", USE_API ? "api" : "mock", id],
    queryFn: async () => {
      if (USE_API) {
        const data = await apiFetch<ClientsListResponseDto>(`/clients?limit=500&offset=0`);
        const dto = data.items.find((c) => String(c.id) === id);
        if (!dto) throw new Error("Client not found");
        return adaptClient(dto);
      }
      await new Promise((r) => setTimeout(r, 200));
      const client = MOCK_CLIENTS.find((c) => c.id === id);
      if (!client) throw new Error("Client not found");
      return client;
    },
    staleTime: 60_000,
  });
}
