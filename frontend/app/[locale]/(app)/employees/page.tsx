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
import { useEmployees } from "@/features/employees/use-employees";
import type { Employee } from "@/features/employees/types";

const DEPARTMENTS = ["Strategy", "Operations", "Finance", "Technology", "HR"];

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

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useEmployees({ search, department, status });
  const employees = data?.items ?? [];
  const total = data?.total ?? 0;

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

  return (
    <>
      <PageHeader
        title="Team Directory"
        subtitle={isLoading ? undefined : `${total} ${total === 1 ? "employee" : "employees"}`}
        actions={
          <Button variant="primary" size="sm" leadingIcon={<Plus size={16} />}>
            Invite employee
          </Button>
        }
      />

      <DataTableWrapper>
        <FilterBar
          embedded
          actions={
            !isLoading && total > 0 ? (
              <span className="text-3" style={{ fontSize: "var(--text-caption)", whiteSpace: "nowrap" }}>
                {total} {total === 1 ? "person" : "people"}
              </span>
            ) : undefined
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
                          <Button variant="primary" size="sm" leadingIcon={<Plus size={14} />}>
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
                          <span className={`worktime-pct text-2`}>
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
                        <DropdownItem icon={<Eye size={14} />}>View profile</DropdownItem>
                        <DropdownItem icon={<Pencil size={14} />}>Edit employee</DropdownItem>
                        <DropdownDivider />
                        <DropdownItem icon={<UserMinus size={14} />} destructive>
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

      {/* Mobile card list */}
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
    </>
  );
}
