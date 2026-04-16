"use client";
import { useQuery } from "@tanstack/react-query";
import type { Client, ClientListFilters, ClientListResponse } from "./types";
import { CLIENTS as ALL_CLIENTS } from "@/lib/mock-data";

const MOCK_CLIENTS: Client[] = ALL_CLIENTS;

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
