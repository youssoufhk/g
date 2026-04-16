"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Building2, TrendingUp, TrendingDown, Minus, MoreHorizontal } from "lucide-react";

import { PageHeader } from "@/components/patterns/page-header";
import { FilterBar } from "@/components/patterns/filter-bar";
import { StatPill } from "@/components/patterns/stat-pill";
import { EmptyState } from "@/components/patterns/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DataTableWrapper,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "@/components/ui/table";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { useClients } from "@/features/clients/use-clients";
import type { Client } from "@/features/clients/types";

// ── Helpers ──────────────────────────────────────────────────────────────────

const CURRENCY_SYMBOL: Record<Client["currency"], string> = {
  GBP: "£",
  EUR: "€",
  USD: "$",
};

function formatRevenue(amount: number, currency: Client["currency"]): string {
  if (amount === 0) return "-";
  const symbol = CURRENCY_SYMBOL[currency];
  const formatted = new Intl.NumberFormat("en-GB", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${symbol}${formatted}`;
}

function formatTotalRevenue(clients: Client[]): string {
  // Sum all EUR-denominated revenue for the stat pill label
  const total = clients.reduce((acc, c) => acc + c.revenue_ytd, 0);
  const formatted = new Intl.NumberFormat("en-GB", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(total);
  return `€${formatted}`;
}

function RevenueDelta({ ytd, prev }: { ytd: number; prev: number }) {
  if (prev === 0 || ytd === 0) return null;
  const pct = ((ytd - prev) / prev) * 100;
  const up = pct > 0;
  const flat = Math.abs(pct) < 0.5;

  if (flat) {
    return (
      <span className="text-3 text-sm" style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
        <Minus size={12} aria-hidden /> 0%
      </span>
    );
  }

  return (
    <span
      className={up ? "text-success text-sm" : "text-error text-sm"}
      style={{ display: "inline-flex", alignItems: "center", gap: 2, whiteSpace: "nowrap" }}
    >
      {up ? <TrendingUp size={12} aria-hidden /> : <TrendingDown size={12} aria-hidden />}
      {up ? "+" : ""}{pct.toFixed(1)}%
    </span>
  );
}

function statusTone(status: Client["status"]): "success" | "default" | "warning" {
  if (status === "active") return "success";
  if (status === "prospect") return "warning";
  return "default";
}

function statusLabel(status: Client["status"]): string {
  if (status === "active") return "Active";
  if (status === "inactive") return "Inactive";
  return "Prospect";
}

function currencyTone(currency: Client["currency"]): "gold" | "info" | "default" {
  if (currency === "GBP") return "gold";
  if (currency === "EUR") return "info";
  return "default";
}

// ── Skeleton rows ─────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TR key={i}>
          <TD>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <Skeleton variant="avatar" width={36} height={36} />
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                <Skeleton variant="title" width={120} />
                <Skeleton variant="text" width={80} />
              </div>
            </div>
          </TD>
          <TD><Skeleton variant="text" width={100} /></TD>
          <TD><Skeleton variant="text" width={60} /></TD>
          <TD><Skeleton variant="text" width={40} /></TD>
          <TD><Skeleton variant="text" width={90} /></TD>
          <TD><Skeleton variant="text" width={60} /></TD>
          <TD><Skeleton variant="text" width={32} /></TD>
        </TR>
      ))}
    </>
  );
}

// ── Mobile card ───────────────────────────────────────────────────────────────

function ClientMobileCard({ client }: { client: Client }) {
  return (
    <Link
      href={`/clients/${client.id}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-4)",
        background: "var(--color-surface-0)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        marginBottom: "var(--space-3)",
        textDecoration: "none",
      }}
    >
      <Avatar name={client.name} colorIndex={client.logo_color_index} size="md" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: "var(--weight-semibold)", color: "var(--color-text-1)", marginBottom: "var(--space-1)", fontSize: "var(--text-body)" }}>
          {client.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>{client.industry}</span>
          <Badge tone={statusTone(client.status)} dot>{statusLabel(client.status)}</Badge>
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontWeight: "var(--weight-semibold)", color: "var(--color-gold)", fontSize: "var(--text-body-sm)" }}>
          {formatRevenue(client.revenue_ytd, client.currency)}
        </div>
        <div style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>YTD</div>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [industry, setIndustry] = useState("all");

  const { data, isLoading, error } = useClients({
    search: search || undefined,
    status: status !== "all" ? status : undefined,
    industry: industry !== "all" ? industry : undefined,
  });

  const clients = data?.items ?? [];
  const total = data?.total ?? 0;
  const activeCount = clients.filter((c) => c.status === "active").length;
  const totalRevenue = clients.length > 0 ? formatTotalRevenue(clients) : "-";

  return (
    <>
      <PageHeader
        title="Clients"
        count={total}
        actions={
          <Button variant="primary" size="md" leadingIcon={<Plus size={16} aria-hidden />}>
            Add client
          </Button>
        }
      />

      <FilterBar
        actions={
          <StatPill
            label="Revenue YTD"
            value={totalRevenue}
            accent="gold"
          />
        }
      >
        <SearchInput
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ minWidth: 140 }}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="prospect">Prospect</option>
        </Select>
        <Select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          style={{ minWidth: 160 }}
        >
          <option value="all">All industries</option>
          <option value="Financial Services">Financial Services</option>
          <option value="Energy">Energy</option>
          <option value="Automotive">Automotive</option>
          <option value="Consulting">Consulting</option>
        </Select>
      </FilterBar>

      {/* Error state */}
      {error && (
        <div
          style={{
            padding: "var(--space-4)",
            background: "var(--color-error-muted)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-error)",
            fontSize: "var(--text-body-sm)",
            marginTop: "var(--space-4)",
          }}
        >
          Failed to load clients. {(error as Error).message}
        </div>
      )}

      {/* Desktop table */}
      {!error && (
        <DataTableWrapper>
          <Table>
            <THead>
              <TR>
                <TH style={{ minWidth: 200 }}>Client</TH>
                <TH>Industry</TH>
                <TH>Projects</TH>
                <TH>Currency</TH>
                <TH numeric sorted sortDirection="desc" style={{ minWidth: 140 }}>Revenue YTD</TH>
                <TH>Status</TH>
                <TH style={{ width: 44 }} />
              </TR>
            </THead>
            <TBody>
              {isLoading && <SkeletonRows />}

              {!isLoading && clients.length === 0 && (
                <TR>
                  <TD colSpan={7} style={{ textAlign: "center", padding: "var(--space-16) var(--space-6)" }}>
                    <EmptyState
                      icon={Building2}
                      title={search || status !== "all" || industry !== "all" ? "No clients match your filters" : "No clients yet"}
                      description={
                        search || status !== "all" || industry !== "all"
                          ? "Try adjusting your search or filters."
                          : "Add your first client to start tracking projects and revenue."
                      }
                      action={
                        search || status !== "all" || industry !== "all" ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => { setSearch(""); setStatus("all"); setIndustry("all"); }}
                          >
                            Clear filters
                          </Button>
                        ) : (
                          <Button variant="primary" size="sm" leadingIcon={<Plus size={14} aria-hidden />}>
                            Add client
                          </Button>
                        )
                      }
                    />
                  </TD>
                </TR>
              )}

              {!isLoading && clients.map((client) => (
                <TR key={client.id}>
                  <TD>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                      <Avatar name={client.name} colorIndex={client.logo_color_index} size="sm" />
                      <div>
                        <Link
                          href={`/clients/${client.id}`}
                          style={{ fontWeight: "var(--weight-medium)", color: "var(--color-text-1)", textDecoration: "none" }}
                          className="hover-primary"
                        >
                          {client.name}
                        </Link>
                        <div style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>
                          {client.country}
                        </div>
                      </div>
                    </div>
                  </TD>
                  <TD muted>{client.industry}</TD>
                  <TD>
                    <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--color-text-1)" }}>
                      {client.active_projects}
                    </span>
                    <span style={{ color: "var(--color-text-3)", fontSize: "var(--text-caption)" }}>
                      /{client.total_projects}
                    </span>
                  </TD>
                  <TD>
                    <Badge tone={currencyTone(client.currency)}>{client.currency}</Badge>
                  </TD>
                  <TD numeric>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "var(--space-0-5)" }}>
                      <span style={{ fontWeight: "var(--weight-semibold)", color: "var(--color-gold)" }}>
                        {formatRevenue(client.revenue_ytd, client.currency)}
                      </span>
                      <RevenueDelta ytd={client.revenue_ytd} prev={client.revenue_prev_year} />
                    </div>
                  </TD>
                  <TD>
                    <Badge tone={statusTone(client.status)} dot>
                      {statusLabel(client.status)}
                    </Badge>
                  </TD>
                  <TD>
                    <Dropdown
                      align="right"
                      trigger={({ toggle }) => (
                        <Button variant="ghost" size="xs" iconOnly aria-label={`Actions for ${client.name}`} onClick={toggle}>
                          <MoreHorizontal size={16} aria-hidden />
                        </Button>
                      )}
                    >
                      <DropdownItem>View profile</DropdownItem>
                      <DropdownItem>Edit client</DropdownItem>
                      <DropdownItem>View invoices</DropdownItem>
                    </Dropdown>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </DataTableWrapper>
      )}

      {/* Mobile cards - hidden on md+ */}
      {!error && !isLoading && clients.length > 0 && (
        <div className="md:hidden" style={{ marginTop: "var(--space-4)" }}>
          {clients.map((client) => (
            <ClientMobileCard key={client.id} client={client} />
          ))}
        </div>
      )}

      {/* Summary row */}
      {!isLoading && clients.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-4)",
            padding: "var(--space-3) 0",
            fontSize: "var(--text-body-sm)",
            color: "var(--color-text-3)",
            borderTop: "1px solid var(--color-border-subtle)",
            marginTop: "var(--space-2)",
          }}
        >
          <span>{total} clients</span>
          <span>{activeCount} active</span>
        </div>
      )}
    </>
  );
}
