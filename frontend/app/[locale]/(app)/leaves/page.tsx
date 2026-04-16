"use client";

import { useState } from "react";
import { Umbrella, Calendar } from "lucide-react";

import { PageHeader } from "@/components/patterns/page-header";
import { StatPill } from "@/components/patterns/stat-pill";
import { EmptyState } from "@/components/patterns/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLeaveRequests, useLeaveBalance } from "@/features/leaves/use-leaves";
import type { LeaveRequest, LeaveType, LeaveStatus } from "@/features/leaves/types";

// ── helpers ────────────────────────────────────────────────────────────────

function formatPeriod(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  if (start === end) {
    return new Date(start).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return `${s.toLocaleDateString("en-GB", opts)} - ${e.toLocaleDateString("en-GB", { ...opts, year: "numeric" })}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── type config ────────────────────────────────────────────────────────────

type BadgeTone = "default" | "primary" | "success" | "warning" | "error" | "info" | "accent" | "gold" | "ghost" | "ghost-primary" | "neutral";

const TYPE_BADGE_TONE: Record<LeaveType, BadgeTone> = {
  annual: "info",
  sick: "warning",
  parental: "primary",
  unpaid: "default",
  public_holiday: "success",
  compassionate: "error",
};

const TYPE_LABEL: Record<LeaveType, string> = {
  annual: "Annual",
  sick: "Sick",
  parental: "Parental",
  unpaid: "Unpaid",
  public_holiday: "Public holiday",
  compassionate: "Compassionate",
};

const STATUS_BADGE_TONE: Record<LeaveStatus, BadgeTone> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
  cancelled: "default",
};

// ── request leave modal ────────────────────────────────────────────────────

type RequestLeaveFormState = {
  type: LeaveType | "";
  start_date: string;
  end_date: string;
  reason: string;
};

function RequestLeaveModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<RequestLeaveFormState>({
    type: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Request leave:", form);
    onClose();
  }

  const LEAVE_TYPE_OPTIONS: Array<{ value: LeaveType | ""; label: string }> = [
    { value: "", label: "Select type" },
    { value: "annual", label: "Annual leave" },
    { value: "sick", label: "Sick leave" },
    { value: "parental", label: "Parental leave" },
    { value: "unpaid", label: "Unpaid leave" },
    { value: "compassionate", label: "Compassionate leave" },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Request leave"
      description="Submit a new leave request for approval."
      size="sm"
      footer={
        <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
          <Button variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSubmit}>
            Submit request
          </Button>
        </div>
      }
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
      >
        {/* Leave type */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <label
            style={{
              fontSize: "var(--text-body-sm)",
              fontWeight: "var(--weight-medium)",
              color: "var(--color-text-2)",
            }}
          >
            Leave type
          </label>
          <Select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as LeaveType | "" }))}
          >
            {LEAVE_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Start date */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <label
            style={{
              fontSize: "var(--text-body-sm)",
              fontWeight: "var(--weight-medium)",
              color: "var(--color-text-2)",
            }}
          >
            Start date
          </label>
          <Input
            type="date"
            value={form.start_date}
            onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
          />
        </div>

        {/* End date */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <label
            style={{
              fontSize: "var(--text-body-sm)",
              fontWeight: "var(--weight-medium)",
              color: "var(--color-text-2)",
            }}
          >
            End date
          </label>
          <Input
            type="date"
            value={form.end_date}
            onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
          />
        </div>

        {/* Reason */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <label
            style={{
              fontSize: "var(--text-body-sm)",
              fontWeight: "var(--weight-medium)",
              color: "var(--color-text-2)",
            }}
          >
            Reason (optional)
          </label>
          <Textarea
            placeholder="Add a note for your manager..."
            value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            rows={3}
          />
        </div>
      </form>
    </Modal>
  );
}

// ── my leaves table ────────────────────────────────────────────────────────

function MyLeavesTab() {
  const { data: leaves, isLoading } = useLeaveRequests({});

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} variant="card" style={{ height: 56, borderRadius: "var(--radius-lg)" }} />
        ))}
      </div>
    );
  }

  if (!leaves || leaves.length === 0) {
    return (
      <EmptyState
        icon={Umbrella}
        title="No leave requests"
        description="You have not submitted any leave requests yet."
      />
    );
  }

  return (
    <div className="data-table-wrapper">
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["Type", "Period", "Days", "Status", "Submitted", "Actions"].map((col) => (
              <th
                key={col}
                style={{
                  padding: "var(--space-2) var(--space-4)",
                  textAlign: "left",
                  fontSize: "var(--text-caption)",
                  fontWeight: "var(--weight-semibold)",
                  color: "var(--color-text-3)",
                  borderBottom: "1px solid var(--color-border)",
                  whiteSpace: "nowrap",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave) => (
            <tr
              key={leave.id}
              style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
            >
              <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                <Badge tone={TYPE_BADGE_TONE[leave.type]}>{TYPE_LABEL[leave.type]}</Badge>
              </td>
              <td
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  fontSize: "var(--text-body-sm)",
                  color: "var(--color-text-1)",
                  whiteSpace: "nowrap",
                }}
              >
                {formatPeriod(leave.start_date, leave.end_date)}
              </td>
              <td
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  fontSize: "var(--text-body-sm)",
                  color: "var(--color-text-2)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {leave.days}d
              </td>
              <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                <Badge tone={STATUS_BADGE_TONE[leave.status]} dot={leave.status === "pending"}>
                  {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                </Badge>
              </td>
              <td
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  fontSize: "var(--text-caption)",
                  color: "var(--color-text-3)",
                  whiteSpace: "nowrap",
                }}
              >
                {formatDate(leave.submitted_at)}
              </td>
              <td style={{ padding: "var(--space-3) var(--space-4)" }}>
                <div style={{ display: "flex", gap: "var(--space-1)" }}>
                  <Button variant="ghost" size="sm" onClick={() => console.log("view", leave.id)}>
                    View
                  </Button>
                  {leave.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      style={{ color: "var(--color-error)" }}
                      onClick={() => console.log("cancel", leave.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── team calendar ──────────────────────────────────────────────────────────

// Map of which employees are on leave per day in April 2026
// Lucas Ferreira: Apr 10-11 (sick), Omar Hassan: Apr 14 (sick)
const APRIL_LEAVE_MAP: Record<number, Array<{ initials: string; color: string }>> = {
  10: [{ initials: "LF", color: "var(--color-warning)" }],
  11: [{ initials: "LF", color: "var(--color-warning)" }],
  14: [{ initials: "OH", color: "var(--color-warning)" }],
};

function TeamCalendarTab() {
  const MONTH_YEAR = "April 2026";
  const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // April 2026: April 1 is a Wednesday (day index 3)
  const FIRST_DAY_OF_WEEK = 3; // Wednesday
  const DAYS_IN_MONTH = 30;

  const cells: Array<number | null> = [
    ...Array(FIRST_DAY_OF_WEEK).fill(null),
    ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
  ];

  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          paddingBottom: "var(--space-2)",
        }}
      >
        <Calendar size={16} aria-hidden style={{ color: "var(--color-text-3)" }} />
        <span
          style={{
            fontWeight: "var(--weight-semibold)",
            fontSize: "var(--text-body-sm)",
            color: "var(--color-text-1)",
          }}
        >
          {MONTH_YEAR}
        </span>
      </div>

      {/* Day headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 0,
        }}
      >
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            style={{
              padding: "var(--space-1) var(--space-2)",
              fontSize: "var(--text-caption)",
              fontWeight: "var(--weight-semibold)",
              color: "var(--color-text-3)",
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
      >
        {cells.map((day, idx) => {
          const onLeave = day ? APRIL_LEAVE_MAP[day] ?? [] : [];
          const isToday = day === 16; // April 16, 2026

          return (
            <div
              key={idx}
              style={{
                minHeight: 40,
                padding: "var(--space-1) var(--space-2)",
                background: isToday
                  ? "var(--color-primary-muted)"
                  : "var(--color-surface-0)",
                borderRight: (idx + 1) % 7 !== 0 ? "0.5px solid var(--color-border-subtle)" : undefined,
                borderBottom:
                  idx < cells.length - 7
                    ? "0.5px solid var(--color-border-subtle)"
                    : undefined,
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-1)",
              }}
            >
              {day !== null && (
                <>
                  <span
                    style={{
                      fontSize: "var(--text-caption)",
                      color: isToday ? "var(--color-primary)" : "var(--color-text-3)",
                      fontWeight: isToday ? "var(--weight-semibold)" : "var(--weight-regular)",
                      lineHeight: 1,
                    }}
                  >
                    {day}
                  </span>
                  {onLeave.map((entry, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 9,
                        fontWeight: "var(--weight-semibold)",
                        color: "#fff",
                        background: entry.color,
                        borderRadius: "var(--radius-full)",
                        padding: "1px 4px",
                        lineHeight: 1.5,
                        whiteSpace: "nowrap",
                        alignSelf: "flex-start",
                      }}
                    >
                      {entry.initials}
                    </span>
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>

      <p
        style={{
          fontSize: "var(--text-caption)",
          color: "var(--color-text-3)",
          margin: 0,
        }}
      >
        Showing approved leave for your team in April 2026. Lucas Ferreira (Apr 10 - 11), Omar Hassan (Apr 14).
      </p>
    </div>
  );
}

// ── page ────────────────────────────────────────────────────────────────────

export default function LeavesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: balance } = useLeaveBalance();

  return (
    <>
      <PageHeader
        title="Leaves"
        actions={
          <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
            Request leave
          </Button>
        }
      />

      <div className="kpi-grid" style={{ marginBottom: "var(--space-6)" }}>
        <StatPill
          label="Annual balance"
          value={`${balance?.annual_remaining ?? "-"} days`}
          secondary={`/ ${balance?.annual_total ?? "-"} total`}
          accent="info"
        />
        <StatPill
          label="Taken this year"
          value={`${balance?.annual_taken ?? "-"} days`}
          secondary={`annual + ${balance?.sick_taken ?? "-"} sick`}
        />
        <StatPill
          label="Pending approval"
          value={balance?.pending_requests ?? "-"}
          accent="warning"
        />
        <StatPill
          label="Team on leave today"
          value="1"
          secondary="Omar Hassan"
        />
      </div>

      <Tabs defaultValue="my-leaves">
        <TabsList>
          <TabsTrigger value="my-leaves">My leaves</TabsTrigger>
          <TabsTrigger value="team-calendar">Team calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="my-leaves">
          <div style={{ paddingTop: "var(--space-5)" }}>
            <MyLeavesTab />
          </div>
        </TabsContent>

        <TabsContent value="team-calendar">
          <div style={{ paddingTop: "var(--space-5)" }}>
            <TeamCalendarTab />
          </div>
        </TabsContent>
      </Tabs>

      <RequestLeaveModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
