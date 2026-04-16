"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  MoreHorizontal,
  Pencil,
  Eye,
  UserMinus,
  List,
  BarChart2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";

import { PageHeader } from "@/components/patterns/page-header";
import { FilterBar } from "@/components/patterns/filter-bar";
import { EmptyState } from "@/components/patterns/empty-state";
import {
  DataTableWrapper,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui/dropdown";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useEmployees } from "@/features/employees/use-employees";
import type { Employee } from "@/features/employees/types";
import { EMPLOYEES, PROJECTS } from "@/lib/mock-data";

// ── Constants ─────────────────────────────────────────────────────────────────

const DEPARTMENTS = ["Strategy", "Operations", "Finance", "Technology", "HR"];

const GANTT_LEFT = 240;
const GANTT_RIGHT = 760;

type GanttRange = "1m" | "3m" | "6m";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getWorktimeClass(pct: number): string {
  if (pct >= 80) return "high";
  if (pct >= 50) return "mid";
  return "low";
}

function StatusBadge({ status }: { status: Employee["status"] }) {
  switch (status) {
    case "active":
      return <Badge tone="success" dot>Active</Badge>;
    case "on_leave":
      return <Badge tone="warning" dot>On leave</Badge>;
    default:
      return <Badge tone="default">Inactive</Badge>;
  }
}

function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

// ── Gantt allocation generator ────────────────────────────────────────────────

type Allocation = {
  projectId: string;
  projectName: string;
  clientName: string;
  startDate: string;
  endDate: string;
  color: string;
};

function getEmployeeAllocations(employeeId: string, employeeIndex: number): Allocation[] {
  void employeeId;
  if (employeeIndex === 0 || employeeIndex > 25) return [];

  const colors = [
    "var(--color-primary)",
    "var(--color-info)",
    "var(--color-accent)",
    "var(--color-warning)",
    "var(--color-success)",
  ];

  const numProjects = employeeIndex % 3 === 0 ? 1 : employeeIndex % 3 === 1 ? 2 : 1;
  const allocs: Allocation[] = [];

  for (let i = 0; i < numProjects; i++) {
    const projIdx = (employeeIndex * 3 + i * 7) % Math.min(PROJECTS.length, 20);
    const project = PROJECTS[projIdx];
    if (!project) continue;
    const monthOffset = (employeeIndex + i) % 4;
    const startMonth = String(Math.max(1, Math.min(12, 3 + monthOffset))).padStart(2, "0");
    const endMonth = String(Math.max(1, Math.min(12, 5 + monthOffset))).padStart(2, "0");
    allocs.push({
      projectId: project.id,
      projectName: project.name,
      clientName: project.client_name ?? "Client",
      startDate: `2026-${startMonth}-01`,
      endDate: `2026-${endMonth}-28`,
      color: colors[(employeeIndex + i) % colors.length] ?? "var(--color-primary)",
    });
  }
  return allocs;
}

// ── Gantt date helpers ────────────────────────────────────────────────────────

function ganttBounds(range: GanttRange): { start: Date; end: Date } {
  const start = new Date("2026-04-01");
  const end = new Date(start);
  if (range === "1m") end.setMonth(end.getMonth() + 1);
  else if (range === "3m") end.setMonth(end.getMonth() + 3);
  else end.setMonth(end.getMonth() + 6);
  return { start, end };
}

function ganttMonthLabels(range: GanttRange): string[] {
  const { start, end } = ganttBounds(range);
  const labels: string[] = [];
  const cur = new Date(start);
  while (cur < end) {
    labels.push(cur.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }));
    cur.setMonth(cur.getMonth() + 1);
  }
  return labels;
}

function dateToPct(date: Date, start: Date, end: Date): number {
  const total = end.getTime() - start.getTime();
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, ((date.getTime() - start.getTime()) / total) * 100));
}

// ── Gantt sub-components ──────────────────────────────────────────────────────

function GanttMonthHeader({ monthLabels }: { monthLabels: string[] }) {
  const colPct = 100 / monthLabels.length;
  return (
    <div style={{ display: "flex", borderBottom: "1px solid var(--color-border-subtle)" }}>
      <div style={{ width: GANTT_LEFT, flexShrink: 0 }} />
      <div style={{ width: GANTT_RIGHT, flexShrink: 0, display: "flex" }}>
        {monthLabels.map((m) => (
          <div
            key={m}
            style={{
              width: `${colPct}%`,
              padding: "var(--space-2)",
              fontSize: "var(--text-caption)",
              fontWeight: "var(--weight-medium)",
              color: "var(--color-text-3)",
              textAlign: "center",
              borderLeft: "1px solid var(--color-border-subtle)",
            }}
          >
            {m}
          </div>
        ))}
      </div>
    </div>
  );
}

type GanttRowProps = {
  employee: Employee;
  employeeIndex: number;
  range: GanttRange;
  monthLabels: string[];
};

function GanttRow({ employee, employeeIndex, range, monthLabels }: GanttRowProps) {
  const { start: rangeStart, end: rangeEnd } = ganttBounds(range);
  const allocations = getEmployeeAllocations(employee.id, employeeIndex);
  const colPct = 100 / monthLabels.length;
  const today = new Date("2026-04-16");
  const todayPct = dateToPct(today, rangeStart, rangeEnd);
  const isUnassigned = allocations.length === 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid var(--color-border-subtle)",
        minHeight: 48,
      }}
    >
      {/* Left info column */}
      <div
        style={{
          width: GANTT_LEFT,
          flexShrink: 0,
          padding: "var(--space-2) var(--space-3)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
        }}
      >
        <Avatar
          name={employee.name}
          colorIndex={employee.avatar_color_index}
          size="sm"
        />
        <div style={{ minWidth: 0 }}>
          <Link
            href={`/employees/${employee.id}`}
            style={{
              display: "block",
              fontWeight: "var(--weight-medium)",
              fontSize: "var(--text-sm)",
              color: "var(--color-text-1)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {employee.name}
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
            {employee.title}
          </div>
        </div>
        {isUnassigned && (
          <Badge tone="warning" style={{ flexShrink: 0, marginLeft: "auto" }}>Unassigned</Badge>
        )}
      </div>

      {/* Timeline column */}
      <div
        style={{
          width: GANTT_RIGHT,
          flexShrink: 0,
          position: "relative",
          height: 48,
        }}
      >
        {/* Month grid lines */}
        {monthLabels.map((m, idx) => (
          <div
            key={m}
            style={{
              position: "absolute",
              left: `${colPct * idx}%`,
              top: 0,
              bottom: 0,
              width: 1,
              background: "var(--color-border-subtle)",
            }}
          />
        ))}

        {/* Today marker */}
        {todayPct >= 0 && todayPct <= 100 && (
          <div
            style={{
              position: "absolute",
              left: `${todayPct}%`,
              top: 0,
              bottom: 0,
              width: 1,
              background: "var(--color-primary)",
              borderLeft: "1px dashed var(--color-primary)",
              zIndex: 2,
            }}
          />
        )}

        {/* Allocation bars */}
        {allocations.map((alloc) => {
          const barStart = dateToPct(new Date(alloc.startDate), rangeStart, rangeEnd);
          const barEnd = dateToPct(new Date(alloc.endDate), rangeStart, rangeEnd);
          const barWidth = barEnd - barStart;
          if (barWidth <= 0) return null;
          const barPx = (barWidth / 100) * GANTT_RIGHT;
          return (
            <div
              key={alloc.projectId}
              title={`${alloc.projectName} - ${alloc.clientName}`}
              style={{
                position: "absolute",
                left: `${barStart}%`,
                width: `${barWidth}%`,
                top: "50%",
                transform: "translateY(-50%)",
                height: 20,
                borderRadius: "var(--radius-sm)",
                background: alloc.color,
                opacity: 0.85,
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
                paddingLeft: 4,
                paddingRight: 4,
                zIndex: 1,
              }}
            >
              {barPx > 80 && (
                <span
                  style={{
                    fontSize: "var(--text-caption)",
                    color: "var(--color-surface-0)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontWeight: "var(--weight-medium)",
                  }}
                >
                  {alloc.projectName}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Skeleton rows ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <TR>
      <TD style={{ width: 40 }}>
        <Skeleton variant="text" width={16} height={16} />
      </TD>
      <TD>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <Skeleton variant="avatar" width={32} height={32} />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <Skeleton variant="title" width={140} />
            <Skeleton variant="text" width={100} />
          </div>
        </div>
      </TD>
      <TD><Skeleton variant="text" width={80} /></TD>
      <TD><Skeleton variant="text" width={100} /></TD>
      <TD><Skeleton variant="text" width={72} /></TD>
      <TD><Skeleton variant="text" width={120} /></TD>
      <TD><Skeleton variant="text" width={60} /></TD>
      <TD style={{ width: 40 }} />
    </TR>
  );
}

// ── Mobile card ───────────────────────────────────────────────────────────────

function EmployeeMobileCard({ employee }: { employee: Employee }) {
  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="card-body">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            marginBottom: "var(--space-3)",
          }}
        >
          <Avatar
            name={employee.name}
            colorIndex={employee.avatar_color_index}
            size="md"
            status={
              employee.status === "active"
                ? "online"
                : employee.status === "on_leave"
                  ? "away"
                  : undefined
            }
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link
              href={`/employees/${employee.id}`}
              className="font-medium text-sm"
              style={{ display: "block", color: "var(--color-text-1)" }}
            >
              {employee.name}
            </Link>
            <span className="text-3 text-sm">{employee.title}</span>
          </div>
          <StatusBadge status={employee.status} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-2)",
            fontSize: "var(--text-caption)",
          }}
        >
          <div>
            <span className="text-3">Department</span>
            <div className="text-2" style={{ marginTop: 2 }}>{employee.department}</div>
          </div>
          <div>
            <span className="text-3">Since</span>
            <div className="text-2" style={{ marginTop: 2 }}>{formatMonthYear(employee.start_date)}</div>
          </div>
        </div>

        {employee.status !== "on_leave" && (
          <div style={{ marginTop: "var(--space-3)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "var(--space-1)",
              }}
            >
              <span className="text-3" style={{ fontSize: "var(--text-caption)" }}>Work time</span>
              <span className={`worktime-pct ${getWorktimeClass(employee.work_time_pct)}`}>
                {employee.work_time_pct}%
              </span>
            </div>
            <div className="worktime-bar">
              <div
                className={`worktime-fill ${getWorktimeClass(employee.work_time_pct)}`}
                style={{ width: `${Math.min(employee.work_time_pct, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Calendar view ─────────────────────────────────────────────────────────────

type CalEventType = "project" | "leave" | "private" | "holiday";

type CalEvent = {
  type: CalEventType;
  label: string;
};

type BookingEntry = {
  date: string; // "2026-04-15"
  employeeId: string;
  type: CalEventType;
  label: string;
};

const CAL_LEFT = 188;
const DAY_W = 28;

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

function dayOfWeekAbbr(year: number, month: number, day: number): string {
  return new Date(year, month, day).toLocaleDateString("en-GB", { weekday: "short" }).slice(0, 2);
}

function isWeekend(year: number, month: number, day: number): boolean {
  const d = new Date(year, month, day).getDay();
  return d === 0 || d === 6;
}

// Deterministic mock events per employee per month
function getEmployeeCalEvents(
  employeeId: string,
  employeeIndex: number,
  status: Employee["status"],
  year: number,
  month: number,
  bookings: BookingEntry[],
): Record<number, CalEvent> {
  const map: Record<number, CalEvent> = {};
  const days = getDaysInMonth(year, month);

  // On-leave employees: mark several days this month
  if (status === "on_leave") {
    const leaveStart = 10 + (employeeIndex % 5);
    const leaveEnd = Math.min(leaveStart + 4, days);
    for (let d = leaveStart; d <= leaveEnd; d++) {
      map[d] = { type: "leave", label: "On leave" };
    }
  } else if (employeeIndex > 0) {
    // Active employees: assign some project days deterministically
    const seed = employeeIndex;
    const projStart = 1 + (seed % 10);
    const projLen = 8 + (seed % 6);
    for (let i = 0; i < projLen; i++) {
      const d = projStart + i;
      if (d <= days && !isWeekend(year, month, d)) {
        const projIdx = (seed * 3 + i * 7) % Math.min(PROJECTS.length, 20);
        const proj = PROJECTS[projIdx];
        map[d] = { type: "project", label: proj?.name ?? "Project" };
      }
    }
    // A second project block if senior employee
    if (seed % 3 === 0) {
      const start2 = 16 + (seed % 8);
      for (let i = 0; i < 5; i++) {
        const d = start2 + i;
        if (d <= days && !map[d] && !isWeekend(year, month, d)) {
          const projIdx2 = (seed * 5 + i * 3) % Math.min(PROJECTS.length, 20);
          const proj2 = PROJECTS[projIdx2];
          map[d] = { type: "project", label: proj2?.name ?? "Project" };
        }
      }
    }
  }

  // Apply user bookings on top
  for (const b of bookings) {
    if (b.employeeId !== employeeId) continue;
    const bDate = new Date(b.date);
    if (bDate.getFullYear() !== year || bDate.getMonth() !== month) continue;
    map[bDate.getDate()] = { type: b.type, label: b.label };
  }

  return map;
}

function calEventColor(type: CalEventType): { bg: string; text: string } {
  switch (type) {
    case "project": return { bg: "var(--color-primary)", text: "#fff" };
    case "leave": return { bg: "var(--color-warning)", text: "#fff" };
    case "private": return { bg: "var(--color-surface-3)", text: "var(--color-text-2)" };
    case "holiday": return { bg: "var(--color-info)", text: "#fff" };
  }
}

type BookingModalState = { open: false } | { open: true; employeeId: string; employeeName: string; date: string };

function CalendarBookingModal({
  state,
  onClose,
  onSave,
}: {
  state: BookingModalState;
  onClose: () => void;
  onSave: (entry: BookingEntry) => void;
}) {
  const [eventType, setEventType] = useState<CalEventType>("project");
  const [projectId, setProjectId] = useState(PROJECTS[0]?.id ?? "");
  const [leaveNotes, setLeaveNotes] = useState("");
  const [privateLabel, setPrivateLabel] = useState("");
  const [saving, setSaving] = useState(false);

  if (!state.open) return null;
  const openState = state;

  const dateLabel = new Date(openState.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  function handleSave() {
    setSaving(true);
    let label = "";
    if (eventType === "project") {
      label = PROJECTS.find((p) => p.id === projectId)?.name ?? "Project";
    } else if (eventType === "leave") {
      label = leaveNotes.trim() || "Leave";
    } else {
      label = privateLabel.trim() || "Private";
    }
    setTimeout(() => {
      setSaving(false);
      onSave({ date: openState.date, employeeId: openState.employeeId, type: eventType, label });
      onClose();
    }, 600);
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Book ${dateLabel}`}
      description={`For: ${openState.employeeName}`}
      size="sm"
      footer={
        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Book"}</Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div>
          <label style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}>
            Event type
          </label>
          <Select value={eventType} onChange={(e) => setEventType(e.target.value as CalEventType)}>
            <option value="project">Project day</option>
            <option value="leave">Leave request</option>
            <option value="private">Private (shows as busy)</option>
          </Select>
        </div>
        {eventType === "project" && (
          <div>
            <label style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}>Project</label>
            <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              {PROJECTS.slice(0, 30).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </div>
        )}
        {eventType === "leave" && (
          <div>
            <label style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}>Notes (optional)</label>
            <Input placeholder="e.g. Annual leave, medical..." value={leaveNotes} onChange={(e) => setLeaveNotes(e.target.value)} />
          </div>
        )}
        {eventType === "private" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", padding: "var(--space-3)", background: "var(--color-surface-1)", borderRadius: "var(--radius-md)", fontSize: "var(--text-body-sm)", color: "var(--color-text-3)" }}>
              <Lock size={13} />
              Others will only see this day as busy, with no details.
            </div>
            <div style={{ marginTop: "var(--space-3)" }}>
              <label style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}>Label (private)</label>
              <Input placeholder="e.g. Doctor, Personal..." value={privateLabel} onChange={(e) => setPrivateLabel(e.target.value)} />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

type EmployeesCalendarViewProps = {
  search: string;
  department: string;
};

function EmployeesCalendarView({ search, department }: EmployeesCalendarViewProps) {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(3); // 0-indexed, April=3
  const [bookings, setBookings] = useState<BookingEntry[]>([]);
  const [bookingModal, setBookingModal] = useState<BookingModalState>({ open: false });

  const today = new Date("2026-04-16");
  const days = getDaysInMonth(year, month);
  const dayNumbers = Array.from({ length: days }, (_, i) => i + 1);

  const monthName = new Date(year, month, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  // Filter employees
  const source = EMPLOYEES.slice(0, 40);
  const filtered = source.filter((emp) => {
    if (search && !emp.name.toLowerCase().includes(search.toLowerCase()) && !emp.department.toLowerCase().includes(search.toLowerCase())) return false;
    if (department !== "all" && emp.department !== department) return false;
    return true;
  });

  function handleCellClick(emp: Employee, day: number) {
    if (isWeekend(year, month, day)) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setBookingModal({ open: true, employeeId: emp.id, employeeName: emp.name, date: dateStr });
  }

  return (
    <>
      <CalendarBookingModal
        state={bookingModal}
        onClose={() => setBookingModal({ open: false })}
        onSave={(entry) => setBookings((prev) => [...prev.filter(b => !(b.employeeId === entry.employeeId && b.date === entry.date)), entry])}
      />

      {/* Month navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-3)" }}>
        <Button variant="ghost" size="sm" iconOnly onClick={prevMonth} aria-label="Previous month"><ChevronLeft size={14} /></Button>
        <span style={{ fontWeight: "var(--weight-semibold)", fontSize: "var(--text-body-sm)", minWidth: 120, textAlign: "center", color: "var(--color-text-1)" }}>
          {monthName}
        </span>
        <Button variant="ghost" size="sm" iconOnly onClick={nextMonth} aria-label="Next month"><ChevronRight size={14} /></Button>
        <Button variant="ghost" size="sm" onClick={() => { setYear(2026); setMonth(3); }} style={{ fontSize: "var(--text-caption)", marginLeft: "var(--space-2)" }}>Today</Button>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginLeft: "auto", flexWrap: "wrap" }}>
          {(["project", "leave", "private"] as CalEventType[]).map((t) => {
            const { bg } = calEventColor(t);
            const labels: Record<CalEventType, string> = { project: "On project", leave: "On leave", private: "Busy (private)", holiday: "Holiday" };
            return (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: bg }} />
                {labels[t]}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflowX: "auto" }}>
        <div style={{ minWidth: CAL_LEFT + DAY_W * days }}>

          {/* Day header */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", position: "sticky", top: 0, zIndex: 10, background: "var(--color-surface-1)" }}>
            {/* Employee column header */}
            <div style={{ width: CAL_LEFT, flexShrink: 0, padding: "var(--space-2) var(--space-3)", fontSize: "var(--text-caption)", color: "var(--color-text-3)", borderRight: "1px solid var(--color-border)", fontWeight: "var(--weight-medium)" }}>
              {filtered.length} {filtered.length === 1 ? "employee" : "employees"}
            </div>
            {/* Day columns */}
            {dayNumbers.map((d) => {
              const weekend = isWeekend(year, month, d);
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
              return (
                <div
                  key={d}
                  style={{
                    width: DAY_W, flexShrink: 0,
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", padding: "var(--space-1) 0",
                    background: weekend ? "var(--color-surface-2)" : undefined,
                    borderLeft: "1px solid var(--color-border-subtle)",
                  }}
                >
                  <span style={{ fontSize: 9, color: "var(--color-text-3)", lineHeight: 1 }}>
                    {dayOfWeekAbbr(year, month, d)}
                  </span>
                  <span style={{
                    fontSize: "var(--text-caption)", lineHeight: 1.5,
                    fontWeight: isToday ? "var(--weight-bold)" : undefined,
                    color: isToday ? "var(--color-primary)" : weekend ? "var(--color-text-3)" : "var(--color-text-2)",
                    width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: "50%",
                    background: isToday ? "color-mix(in srgb, var(--color-primary) 12%, transparent)" : undefined,
                  }}>
                    {d}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Employee rows */}
          {filtered.length === 0 && (
            <div style={{ padding: "var(--space-8)", textAlign: "center" }}>
              <EmptyState icon={Users} title="No employees found" description="Try adjusting your search or filters." />
            </div>
          )}
          {filtered.map((emp, empIdx) => {
            const events = getEmployeeCalEvents(emp.id, empIdx, emp.status, year, month, bookings);
            return (
              <div key={emp.id} style={{ display: "flex", alignItems: "stretch", borderBottom: "1px solid var(--color-border-subtle)", minHeight: 36 }}>
                {/* Employee label */}
                <div style={{ width: CAL_LEFT, flexShrink: 0, padding: "var(--space-2) var(--space-3)", display: "flex", alignItems: "center", gap: "var(--space-2)", borderRight: "1px solid var(--color-border)" }}>
                  <Avatar name={emp.name} colorIndex={emp.avatar_color_index} size="xs" />
                  <Link href={`/employees/${emp.id}`} style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: "var(--weight-medium)" }}>
                    {emp.name}
                  </Link>
                </div>
                {/* Day cells */}
                {dayNumbers.map((d) => {
                  const weekend = isWeekend(year, month, d);
                  const event = events[d];
                  const colors = event ? calEventColor(event.type) : null;
                  const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
                  return (
                    <div
                      key={d}
                      title={event ? `${emp.name} - ${event.label}` : weekend ? "Weekend" : "Click to book"}
                      onClick={() => !weekend && handleCellClick(emp, d)}
                      style={{
                        width: DAY_W, flexShrink: 0,
                        background: weekend
                          ? "var(--color-surface-2)"
                          : colors
                            ? colors.bg
                            : isToday
                              ? "color-mix(in srgb, var(--color-primary) 6%, transparent)"
                              : undefined,
                        borderLeft: "1px solid var(--color-border-subtle)",
                        cursor: weekend ? "default" : "pointer",
                        transition: "opacity 0.1s",
                        opacity: weekend ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => { if (!weekend && !event) (e.currentTarget as HTMLElement).style.background = "var(--color-surface-2)"; }}
                      onMouseLeave={(e) => { if (!weekend && !event) (e.currentTarget as HTMLElement).style.background = isToday ? "color-mix(in srgb, var(--color-primary) 6%, transparent)" : ""; }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type ViewMode = "list" | "gantt" | "calendar";
type GanttStatus = "all" | "assigned" | "unassigned" | "on_leave";

export default function EmployeesPage() {
  const [view, setView] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState("all");
  const [ganttStatus, setGanttStatus] = useState<GanttStatus>("all");
  const [ganttRange, setGanttRange] = useState<GanttRange>("3m");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Employee");
  const [inviteSaving, setInviteSaving] = useState(false);
  const [deactivatedIds, setDeactivatedIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useEmployees({ search, department, status });
  const employees = (data?.items ?? []).filter((e) => !deactivatedIds.has(e.id));
  const total = data?.total ?? 0;

  function handleInviteSave() {
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    setInviteSaving(true);
    setTimeout(() => {
      setInviteSaving(false);
      setShowInviteModal(false);
      setInviteName("");
      setInviteEmail("");
      setInviteRole("Employee");
    }, 800);
  }

  function handleDeactivate(id: string) {
    setDeactivatedIds((prev) => new Set([...prev, id]));
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === employees.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(employees.map((e) => e.id)));
    }
  }

  const allSelected = employees.length > 0 && selectedIds.size === employees.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < employees.length;

  // Gantt data: slice first 30 employees from mock data, apply search + dept filter
  const ganttSource = EMPLOYEES.slice(0, 30);
  const ganttFiltered = ganttSource.filter((emp) => {
    if (search && !emp.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (department !== "all" && emp.department !== department) return false;
    if (ganttStatus === "on_leave" && emp.status !== "on_leave") return false;
    if (ganttStatus === "assigned") {
      const idx = ganttSource.indexOf(emp);
      if (getEmployeeAllocations(emp.id, idx).length === 0) return false;
    }
    if (ganttStatus === "unassigned") {
      const idx = ganttSource.indexOf(emp);
      if (getEmployeeAllocations(emp.id, idx).length > 0) return false;
    }
    return true;
  });

  // Sort: unassigned rows to top
  const ganttSorted = [...ganttFiltered].sort((a, b) => {
    const idxA = ganttSource.indexOf(a);
    const idxB = ganttSource.indexOf(b);
    const allocsA = getEmployeeAllocations(a.id, idxA).length;
    const allocsB = getEmployeeAllocations(b.id, idxB).length;
    if (allocsA === 0 && allocsB > 0) return -1;
    if (allocsA > 0 && allocsB === 0) return 1;
    return 0;
  });

  const monthLabels = ganttMonthLabels(ganttRange);

  const toggleStyle = (active: boolean): React.CSSProperties => ({
    background: active ? "var(--color-surface-2)" : "transparent",
  });

  // Pre-compute toggle styles to avoid TypeScript narrowing issues inside conditional branches
  const listToggleStyle = toggleStyle(view === "list");
  const ganttToggleStyle = toggleStyle(view === "gantt");
  const calToggleStyle = toggleStyle(view === "calendar");

  return (
    <>
      <PageHeader
        title="Team Directory"
        subtitle={isLoading ? undefined : `${total} ${total === 1 ? "employee" : "employees"}`}
        actions={
          <Button variant="primary" size="sm" leadingIcon={<Plus size={16} />} onClick={() => setShowInviteModal(true)}>
            Invite employee
          </Button>
        }
      />

      {/* ── List view ── */}
      {view === "list" && (
        <DataTableWrapper>
          <FilterBar
            embedded
            actions={
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                {!isLoading && total > 0 && (
                  <span className="text-3" style={{ fontSize: "var(--text-caption)", whiteSpace: "nowrap", marginRight: "var(--space-2)" }}>
                    {total} {total === 1 ? "person" : "people"}
                  </span>
                )}
                <Button variant="ghost" size="sm" iconOnly aria-label="List view" style={listToggleStyle} onClick={() => setView("list")}><List size={14} /></Button>
                <Button variant="ghost" size="sm" iconOnly aria-label="Gantt view" style={ganttToggleStyle} onClick={() => setView("gantt")}><BarChart2 size={14} /></Button>
                <Button variant="ghost" size="sm" iconOnly aria-label="Calendar view" style={calToggleStyle} onClick={() => setView("calendar")}><CalendarDays size={14} /></Button>
              </div>
            }
          >
            <SearchInput
              placeholder="Search by name, title, department"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={{ minWidth: 150 }}
            >
              <option value="all">All departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ minWidth: 130 }}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="on_leave">On leave</option>
              <option value="inactive">Inactive</option>
            </Select>
          </FilterBar>

          {/* Desktop table */}
          <div className="hidden md:block">
            <Table>
              <THead>
                <TR>
                  <TH style={{ width: 40 }}>
                    <Checkbox
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected;
                      }}
                      onChange={toggleAll}
                      aria-label="Select all"
                    />
                  </TH>
                  <TH>Employee</TH>
                  <TH>Department</TH>
                  <TH>Manager</TH>
                  <TH>Since</TH>
                  <TH>Work time</TH>
                  <TH>Status</TH>
                  <TH style={{ width: 40 }} />
                </TR>
              </THead>
              <TBody>
                {isLoading &&
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

                {!isLoading && employees.length === 0 && (
                  <TR>
                    <TD colSpan={8}>
                      <EmptyState
                        icon={Users}
                        title="No employees found"
                        description={
                          search || department !== "all" || status !== "all"
                            ? "No employees match your current filters. Try adjusting the search or filters."
                            : "Your team directory is empty. Invite your first employee to get started."
                        }
                        action={
                          !search && department === "all" && status === "all" ? (
                            <Button variant="primary" size="sm" leadingIcon={<Plus size={14} />} onClick={() => setShowInviteModal(true)}>
                              Invite employee
                            </Button>
                          ) : undefined
                        }
                      />
                    </TD>
                  </TR>
                )}

                {!isLoading &&
                  employees.map((emp) => (
                    <TR key={emp.id}>
                      <TD style={{ width: 40 }}>
                        <Checkbox
                          checked={selectedIds.has(emp.id)}
                          onChange={() => toggleSelect(emp.id)}
                          aria-label={`Select ${emp.name}`}
                        />
                      </TD>

                      <TD>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                          <Avatar
                            name={emp.name}
                            colorIndex={emp.avatar_color_index}
                            size="sm"
                            status={
                              emp.status === "active"
                                ? "online"
                                : emp.status === "on_leave"
                                  ? "away"
                                  : undefined
                            }
                          />
                          <div style={{ minWidth: 0 }}>
                            <Link
                              href={`/employees/${emp.id}`}
                              className="font-medium text-sm"
                              style={{ display: "block", color: "var(--color-text-1)" }}
                            >
                              {emp.name}
                            </Link>
                            <div className="text-3 text-sm">{emp.title}</div>
                          </div>
                        </div>
                      </TD>

                      <TD muted>{emp.department}</TD>

                      <TD>
                        {emp.manager_id ? (
                          <Link
                            href={`/employees/${emp.manager_id}`}
                            className="text-2 text-sm"
                          >
                            {emp.manager_name ?? "-"}
                          </Link>
                        ) : emp.manager_name ? (
                          <span className="text-2 text-sm">{emp.manager_name}</span>
                        ) : (
                          <span className="text-3">-</span>
                        )}
                      </TD>

                      <TD muted>
                        <span style={{ fontVariantNumeric: "tabular-nums" }}>
                          {formatMonthYear(emp.start_date)}
                        </span>
                      </TD>

                      <TD style={{ minWidth: 140 }}>
                        {emp.status === "on_leave" ? (
                          <span className="text-3" style={{ fontSize: "var(--text-caption)" }}>-</span>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                            <div className="worktime-bar" style={{ width: 80 }}>
                              <div
                                className={`worktime-fill ${getWorktimeClass(emp.work_time_pct)}`}
                                style={{ width: `${Math.min(emp.work_time_pct, 100)}%` }}
                              />
                            </div>
                            <span className="worktime-pct text-2">
                              {emp.work_time_pct}%
                            </span>
                          </div>
                        )}
                      </TD>

                      <TD><StatusBadge status={emp.status} /></TD>

                      <TD style={{ width: 40 }}>
                        <Dropdown
                          align="right"
                          trigger={({ toggle, open }) => (
                            <Button
                              variant="ghost"
                              size="xs"
                              iconOnly
                              aria-label="More actions"
                              aria-expanded={open}
                              onClick={toggle}
                            >
                              <MoreHorizontal size={14} />
                            </Button>
                          )}
                        >
                          <Link href={`/employees/${emp.id}`} style={{ textDecoration: "none" }}>
                            <DropdownItem icon={<Eye size={14} />}>View profile</DropdownItem>
                          </Link>
                          <DropdownItem icon={<Pencil size={14} />} onClick={() => setShowInviteModal(true)}>Edit employee</DropdownItem>
                          <DropdownDivider />
                          <DropdownItem icon={<UserMinus size={14} />} destructive onClick={() => handleDeactivate(emp.id)}>
                            Deactivate
                          </DropdownItem>
                        </Dropdown>
                      </TD>
                    </TR>
                  ))}
              </TBody>
            </Table>
          </div>
        </DataTableWrapper>
      )}

      {/* ── Gantt view ── */}
      {view === "gantt" && (
        <div style={{ marginTop: "var(--space-4)" }}>
          {/* Controls */}
          <FilterBar
            embedded
            actions={
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                <Button variant="ghost" size="sm" iconOnly aria-label="List view" style={listToggleStyle} onClick={() => setView("list")}><List size={14} /></Button>
                <Button variant="ghost" size="sm" iconOnly aria-label="Gantt view" style={ganttToggleStyle} onClick={() => setView("gantt")}><BarChart2 size={14} /></Button>
                <Button variant="ghost" size="sm" iconOnly aria-label="Calendar view" style={calToggleStyle} onClick={() => setView("calendar")}><CalendarDays size={14} /></Button>
              </div>
            }
          >
            <SearchInput
              placeholder="Search by name, title, department"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={{ minWidth: 150 }}
            >
              <option value="all">All departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
            <Select
              value={ganttStatus}
              onChange={(e) => setGanttStatus(e.target.value as GanttStatus)}
              style={{ minWidth: 140 }}
            >
              <option value="all">All statuses</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
              <option value="on_leave">On leave</option>
            </Select>
          </FilterBar>

          {/* Range toggle + chart */}
          <div style={{ marginTop: "var(--space-3)", display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
            <span className="text-3" style={{ fontSize: "var(--text-caption)" }}>Range:</span>
            {(["1m", "3m", "6m"] as GanttRange[]).map((r) => (
              <Button
                key={r}
                variant="ghost"
                size="sm"
                style={toggleStyle(ganttRange === r)}
                onClick={() => setGanttRange(r)}
              >
                {r === "1m" ? "1 month" : r === "3m" ? "3 months" : "6 months"}
              </Button>
            ))}
          </div>

          <div className="card" style={{ padding: 0, overflowX: "auto" }}>
            <div style={{ minWidth: GANTT_LEFT + GANTT_RIGHT }}>
              <GanttMonthHeader monthLabels={monthLabels} />

              {ganttSorted.length === 0 && (
                <div style={{ padding: "var(--space-8)", textAlign: "center" }}>
                  <EmptyState
                    icon={Users}
                    title="No employees found"
                    description="No employees match your current filters. Try adjusting the search or filters."
                  />
                </div>
              )}

              {ganttSorted.map((emp) => {
                const empIdx = ganttSource.indexOf(emp);
                return (
                  <GanttRow
                    key={emp.id}
                    employee={emp}
                    employeeIndex={empIdx}
                    range={ganttRange}
                    monthLabels={monthLabels}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Calendar view ── */}
      {view === "calendar" && (
        <div style={{ marginTop: "var(--space-4)" }}>
          <FilterBar embedded actions={
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
              <Button variant="ghost" size="sm" iconOnly aria-label="List view" style={listToggleStyle} onClick={() => setView("list")}><List size={14} /></Button>
              <Button variant="ghost" size="sm" iconOnly aria-label="Gantt view" style={ganttToggleStyle} onClick={() => setView("gantt")}><BarChart2 size={14} /></Button>
              <Button variant="ghost" size="sm" iconOnly aria-label="Calendar view" style={calToggleStyle} onClick={() => setView("calendar")}><CalendarDays size={14} /></Button>
            </div>
          }>
            <SearchInput placeholder="Search by name or department" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select value={department} onChange={(e) => setDepartment(e.target.value)} style={{ minWidth: 150 }}>
              <option value="all">All departments</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
          </FilterBar>
          <div style={{ marginTop: "var(--space-3)" }}>
            <EmployeesCalendarView search={search} department={department} />
          </div>
        </div>
      )}

      {/* Mobile card list (list view only) */}
      {view === "list" && (
        <div className="md:hidden" style={{ marginTop: "var(--space-4)" }}>
          <FilterBar>
            <SearchInput
              placeholder="Search employees"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </FilterBar>

          {isLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", marginTop: "var(--space-3)" }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div className="card" key={i}>
                  <div className="card-body">
                    <Skeleton variant="card" height={80} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && employees.length === 0 && (
            <EmptyState
              icon={Users}
              title="No employees found"
              description="Try adjusting your filters or invite your first employee."
            />
          )}

          {!isLoading && employees.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", marginTop: "var(--space-3)" }}>
              {employees.map((emp) => (
                <EmployeeMobileCard key={emp.id} employee={emp} />
              ))}
            </div>
          )}
        </div>
      )}

      <Modal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite employee"
        description="Send an invitation to a new team member."
        footer={
          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
            <Button variant="secondary" size="sm" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleInviteSave}
              disabled={inviteSaving || !inviteName.trim() || !inviteEmail.trim()}
            >
              {inviteSaving ? "Sending..." : "Send invite"}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label className="form-label" htmlFor="invite-name">Full name</label>
            <Input
              id="invite-name"
              placeholder="e.g. Amara Diallo"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label" htmlFor="invite-email">Work email</label>
            <Input
              id="invite-email"
              type="email"
              placeholder="e.g. amara@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label" htmlFor="invite-role">Role</label>
            <select
              id="invite-role"
              className="form-input"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
            >
              <option>Employee</option>
              <option>Manager</option>
              <option>Finance</option>
              <option>Admin</option>
            </select>
          </div>
        </div>
      </Modal>
    </>
  );
}
