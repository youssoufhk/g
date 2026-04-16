"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Building2, TrendingUp, TrendingDown, Minus, MoreHorizontal, Pencil, LayoutList, GanttChartSquare } from "lucide-react";

import { PageHeader } from "@/components/patterns/page-header";
import { FilterBar } from "@/components/patterns/filter-bar";
import { StatPill } from "@/components/patterns/stat-pill";
import { EmptyState } from "@/components/patterns/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { SegControl, type SegOption } from "@/components/ui/seg-control";
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
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useClients } from "@/features/clients/use-clients";
import type { Client } from "@/features/clients/types";
import { CLIENTS, PROJECTS } from "@/lib/mock-data";
import type { Project } from "@/features/projects/types";

// ── constants ──────────────────────────────────────────────────────────────────

const GANTT_LEFT = 240;
// Timeline right column uses flex: 1; conceptual width is 760px

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

// ── Gantt helpers ─────────────────────────────────────────────────────────────

type GanttRange = "3m" | "6m" | "12m";

function getRangeDates(range: GanttRange): { start: Date; end: Date } {
  const start = new Date("2026-01-01");
  const end =
    range === "3m"
      ? new Date("2026-03-31")
      : range === "6m"
        ? new Date("2026-06-30")
        : new Date("2026-12-31");
  return { start, end };
}

function dateToMs(d: string | Date): number {
  return typeof d === "string" ? new Date(d).getTime() : d.getTime();
}

const STATUS_COLOR: Record<string, string> = {
  active: "var(--color-primary)",
  complete: "var(--color-success)",
  on_hold: "var(--color-info)",
  cancelled: "var(--color-warning)",
};

// Deterministic project dates reused from projects page spec
function getProjectDates(
  project: Project,
  idx: number,
): { startDate: string; endDate: string; progress: number } {
  const startMonths = [1, 1, 2, 2, 3, 3, 4, 1, 2, 3, 4, 5, 1, 2, 6, 7, 1, 3, 2, 4];
  const endMonths   = [9, 6, 8, 7, 7, 9, 12, 5, 6, 8, 10, 9, 4, 5, 11, 12, 3, 6, 4, 7];
  const sm = startMonths[idx % startMonths.length] ?? 1;
  const em = endMonths[idx % endMonths.length] ?? 6;
  const progress =
    project.status === "complete"
      ? 100
      : project.status === "on_hold"
        ? Math.floor((idx % 3) * 5)
        : 20 + ((idx * 13) % 65);
  return {
    startDate: `2026-${String(sm).padStart(2, "0")}-01`,
    endDate: `2026-${String(em).padStart(2, "0")}-28`,
    progress,
  };
}

// ── view toggle ───────────────────────────────────────────────────────────────

type ViewMode = "list" | "gantt";

const VIEW_OPTIONS: Array<SegOption<ViewMode>> = [
  { value: "list", label: "List", icon: <LayoutList size={14} /> },
  { value: "gantt", label: "Gantt", icon: <GanttChartSquare size={14} /> },
];

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

// ── Gantt view ────────────────────────────────────────────────────────────────

const COUNTRY_FLAGS: Record<string, string> = {
  "United Kingdom": "🇬🇧",
  "France": "🇫🇷",
  "Germany": "🇩🇪",
  "United States": "🇺🇸",
  "Netherlands": "🇳🇱",
  "Belgium": "🇧🇪",
  "Spain": "🇪🇸",
  "Italy": "🇮🇹",
  "Switzerland": "🇨🇭",
  "Luxembourg": "🇱🇺",
};

function countryFlag(country: string): string {
  return COUNTRY_FLAGS[country] ?? "🌍";
}

function GanttClientView({
  clients,
  range,
}: {
  clients: Client[];
  range: GanttRange;
}) {
  const { start: rangeStart, end: rangeEnd } = getRangeDates(range);
  const rangeMs = dateToMs(rangeEnd) - dateToMs(rangeStart);
  const today = new Date("2026-04-16");
  const todayPct = Math.min(
    100,
    Math.max(
      0,
      ((dateToMs(today) - dateToMs(rangeStart)) / rangeMs) * 100,
    ),
  );

  const ganttClients = clients.slice(0, 25);

  // Month labels
  const monthLabels: { label: string; leftPct: number }[] = [];
  const cursor = new Date(rangeStart);
  cursor.setDate(1);
  while (cursor <= rangeEnd) {
    const pct =
      ((dateToMs(cursor) - dateToMs(rangeStart)) / rangeMs) * 100;
    if (pct >= 0 && pct <= 100) {
      monthLabels.push({
        label: cursor.toLocaleString("en-GB", { month: "short" }),
        leftPct: pct,
      });
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }

  if (ganttClients.length === 0) {
    return (
      <div
        style={{
          background: "var(--color-surface-1)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-12)",
          textAlign: "center",
          color: "var(--color-text-3)",
          fontSize: "var(--text-body-sm)",
        }}
      >
        No clients to display.
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--color-surface-1)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      {/* Header row with month labels */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface-2)",
        }}
      >
        <div
          style={{
            width: GANTT_LEFT,
            flexShrink: 0,
            padding: "var(--space-2) var(--space-4)",
            fontSize: "var(--text-caption)",
            color: "var(--color-text-3)",
            fontWeight: "var(--weight-medium)",
            borderRight: "1px solid var(--color-border)",
          }}
        >
          Client
        </div>
        <div
          style={{
            flex: 1,
            position: "relative",
            height: 32,
            minWidth: 0,
          }}
        >
          {monthLabels.map((m) => (
            <span
              key={m.label + m.leftPct}
              style={{
                position: "absolute",
                left: `${m.leftPct}%`,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "var(--text-caption)",
                color: "var(--color-text-3)",
                fontWeight: "var(--weight-medium)",
                paddingLeft: "var(--space-1)",
                whiteSpace: "nowrap",
              }}
            >
              {m.label}
            </span>
          ))}
          {todayPct >= 0 && todayPct <= 100 && (
            <div
              style={{
                position: "absolute",
                left: `${todayPct}%`,
                top: 0,
                bottom: 0,
                width: 1,
                borderLeft: "2px dashed var(--color-primary)",
                opacity: 0.6,
              }}
            />
          )}
        </div>
      </div>

      {/* Client rows */}
      {ganttClients.map((client, clientIdx) => {
        // Find client's projects: by client_id, fall back to slice
        let clientProjects = PROJECTS.filter((p) => p.client_id === client.id);
        if (clientProjects.length === 0) {
          clientProjects = PROJECTS.slice(clientIdx * 2, clientIdx * 2 + 3);
        }
        // Limit to 3 bars
        const barProjects = clientProjects.slice(0, 3);
        const numBars = barProjects.length;

        // Row height: max(56, 14 * numBars + 3 * (numBars - 1) + 20)
        const rowHeight = Math.max(56, 14 * numBars + 3 * Math.max(0, numBars - 1) + 20);

        return (
          <div
            key={client.id}
            style={{
              display: "flex",
              borderBottom: "1px solid var(--color-border-subtle)",
              minHeight: rowHeight,
            }}
          >
            {/* Left: client info */}
            <div
              style={{
                width: GANTT_LEFT,
                flexShrink: 0,
                padding: "var(--space-2) var(--space-4)",
                borderRight: "1px solid var(--color-border)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "var(--space-0-5)",
                minWidth: 0,
              }}
            >
              <Link
                href={`/clients/${client.id}`}
                style={{
                  fontWeight: "var(--weight-semibold)",
                  fontSize: "var(--text-body-sm)",
                  color: "var(--color-text-1)",
                  textDecoration: "none",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                className="hover-primary"
              >
                {client.name}
              </Link>
              <div
                style={{
                  fontSize: "var(--text-caption)",
                  color: "var(--color-text-3)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {client.industry}
              </div>
              <div
                style={{
                  fontSize: "var(--text-caption)",
                  color: "var(--color-text-3)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {countryFlag(client.country)} {client.country}
              </div>
            </div>

            {/* Right: stacked project bars */}
            <div
              style={{
                flex: 1,
                position: "relative",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 3,
                padding: "var(--space-2) 0",
              }}
            >
              {/* Today marker */}
              {todayPct >= 0 && todayPct <= 100 && (
                <div
                  style={{
                    position: "absolute",
                    left: `${todayPct}%`,
                    top: 0,
                    bottom: 0,
                    width: 1,
                    borderLeft: "2px dashed var(--color-primary)",
                    opacity: 0.4,
                    zIndex: 1,
                  }}
                />
              )}

              {numBars === 0 ? (
                <span
                  style={{
                    fontSize: "var(--text-caption)",
                    color: "var(--color-text-3)",
                    paddingLeft: "var(--space-3)",
                  }}
                >
                  No active engagements
                </span>
              ) : (
                barProjects.map((project, barIdx) => {
                  const { startDate, endDate, progress } = getProjectDates(
                    project,
                    barIdx + clientIdx,
                  );
                  const barStart = dateToMs(startDate);
                  const barEnd = dateToMs(endDate);
                  const color =
                    STATUS_COLOR[project.status] ?? "var(--color-primary)";

                  const leftPct = Math.max(
                    0,
                    ((barStart - dateToMs(rangeStart)) / rangeMs) * 100,
                  );
                  const rightPct = Math.min(
                    100,
                    ((barEnd - dateToMs(rangeStart)) / rangeMs) * 100,
                  );
                  const widthPct = Math.max(0, rightPct - leftPct);

                  return (
                    <div
                      key={project.id}
                      style={{ position: "relative", height: 14, flexShrink: 0 }}
                    >
                      {widthPct > 0 && (
                        <div
                          title={`${project.name} - ${progress}% complete`}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                            height: 14,
                            borderRadius: "var(--radius-sm)",
                            background: `${color}30`,
                            overflow: "hidden",
                            cursor: "default",
                          }}
                        >
                          <div
                            style={{
                              width: `${progress}%`,
                              height: "100%",
                              background: color,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const [view, setView] = useState<ViewMode>("list");
  const [ganttRange, setGanttRange] = useState<GanttRange>("6m");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [industry, setIndustry] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addIndustry, setAddIndustry] = useState("");
  const [addCountry, setAddCountry] = useState("");
  const [addSaving, setAddSaving] = useState(false);

  function handleAddSave() {
    if (!addName.trim()) return;
    setAddSaving(true);
    setTimeout(() => {
      setAddSaving(false);
      setShowAddModal(false);
      setAddName("");
      setAddIndustry("");
      setAddCountry("");
    }, 800);
  }

  const { data, isLoading, error } = useClients({
    search: search || undefined,
    status: status !== "all" ? status : undefined,
    industry: industry !== "all" ? industry : undefined,
  });

  const clients = data?.items ?? [];
  const total = data?.total ?? 0;
  const activeCount = clients.filter((c) => c.status === "active").length;
  const totalRevenue = clients.length > 0 ? formatTotalRevenue(clients) : "-";

  // Gantt: filter CLIENTS from mock data
  const ganttClients = CLIENTS.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q)) return false;
    }
    if (status !== "all" && c.status !== status) return false;
    if (industry !== "all" && c.industry !== industry) return false;
    return true;
  });

  const RANGE_OPTIONS: Array<{ value: GanttRange; label: string }> = [
    { value: "3m", label: "3m" },
    { value: "6m", label: "6m" },
    { value: "12m", label: "12m" },
  ];

  return (
    <>
      <PageHeader
        title="Clients"
        count={total}
        actions={
          <>
            <SegControl
              value={view}
              onChange={setView}
              options={VIEW_OPTIONS}
              showLabel
            />
            <Button
              variant="primary"
              size="md"
              leadingIcon={<Plus size={16} aria-hidden />}
              onClick={() => setShowAddModal(true)}
            >
              Add client
            </Button>
          </>
        }
      />

      <FilterBar
        actions={
          <>
            <StatPill label="Revenue YTD" value={totalRevenue} accent="gold" />
            {view === "gantt" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-1)",
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-0-5)",
                }}
              >
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setGanttRange(opt.value)}
                    style={{
                      padding: "var(--space-1) var(--space-2)",
                      borderRadius: "var(--radius-sm)",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "var(--text-body-sm)",
                      fontWeight:
                        ganttRange === opt.value
                          ? "var(--weight-semibold)"
                          : "var(--weight-regular)",
                      background:
                        ganttRange === opt.value
                          ? "var(--color-surface-0)"
                          : "transparent",
                      color:
                        ganttRange === opt.value
                          ? "var(--color-text-1)"
                          : "var(--color-text-3)",
                      boxShadow:
                        ganttRange === opt.value ? "var(--shadow-sm)" : "none",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </>
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

      {/* Gantt view */}
      {!error && view === "gantt" && (
        <GanttClientView clients={ganttClients} range={ganttRange} />
      )}

      {/* Desktop table - list view only */}
      {!error && view === "list" && (
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
                          <Button
                            variant="primary"
                            size="sm"
                            leadingIcon={<Plus size={14} aria-hidden />}
                            onClick={() => setShowAddModal(true)}
                          >
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
                        <Button
                          variant="ghost"
                          size="xs"
                          iconOnly
                          aria-label={`Actions for ${client.name}`}
                          onClick={toggle}
                        >
                          <MoreHorizontal size={16} aria-hidden />
                        </Button>
                      )}
                    >
                      <Link href={`/clients/${client.id}`} style={{ textDecoration: "none" }}>
                        <DropdownItem>View profile</DropdownItem>
                      </Link>
                      <DropdownItem icon={<Pencil size={14} />} onClick={() => setShowAddModal(true)}>
                        Edit client
                      </DropdownItem>
                      <Link href="/invoices" style={{ textDecoration: "none" }}>
                        <DropdownItem>View invoices</DropdownItem>
                      </Link>
                    </Dropdown>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </DataTableWrapper>
      )}

      {/* Mobile cards - list view only, hidden on md+ */}
      {!error && view === "list" && !isLoading && clients.length > 0 && (
        <div className="md:hidden" style={{ marginTop: "var(--space-4)" }}>
          {clients.map((client) => (
            <ClientMobileCard key={client.id} client={client} />
          ))}
        </div>
      )}

      {/* Summary row */}
      {view === "list" && !isLoading && clients.length > 0 && (
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

      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add client"
        description="Fill in the details to create a new client record."
        footer={
          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
            <Button variant="secondary" size="sm" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddSave}
              disabled={addSaving || !addName.trim()}
            >
              {addSaving ? "Saving..." : "Add client"}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label className="form-label" htmlFor="add-client-name">Company name</label>
            <Input
              id="add-client-name"
              placeholder="e.g. HSBC UK"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label" htmlFor="add-client-industry">Industry</label>
            <Input
              id="add-client-industry"
              placeholder="e.g. Financial Services"
              value={addIndustry}
              onChange={(e) => setAddIndustry(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label" htmlFor="add-client-country">Country</label>
            <Input
              id="add-client-country"
              placeholder="e.g. United Kingdom"
              value={addCountry}
              onChange={(e) => setAddCountry(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
