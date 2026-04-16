"use client";

import { useState } from "react";
import {
  Users,
  Plus,
  MoreHorizontal,
  Settings,
  Shield,
  Mail,
} from "lucide-react";

import { PageHeader } from "@/components/patterns/page-header";
import { StatPill } from "@/components/patterns/stat-pill";
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
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui/dropdown";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UserStatus = "active" | "inactive" | "pending";
type UserRole =
  | "Owner"
  | "Admin"
  | "Finance Manager"
  | "Project Manager"
  | "Employee";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastSeen: string;
  avatarColorIndex: number;
};

type FeatureFlag = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

type AuditEntry = {
  id: string;
  timestamp: string;
  user: string;
  action: "LOGIN" | "UPDATE" | "CREATE" | "APPROVE" | "INVITE" | "DELETE";
  resource: string;
  ip: string;
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const INITIAL_USERS: AdminUser[] = [
  {
    id: "u1",
    name: "Youssouf Hassan",
    email: "youssouf@globalid.uk",
    role: "Owner",
    status: "active",
    lastSeen: "Just now",
    avatarColorIndex: 0,
  },
  {
    id: "u2",
    name: "Marie Dubois",
    email: "marie@globalid.uk",
    role: "Admin",
    status: "active",
    lastSeen: "2h ago",
    avatarColorIndex: 1,
  },
  {
    id: "u3",
    name: "Pierre Leclerc",
    email: "pierre@globalid.uk",
    role: "Finance Manager",
    status: "active",
    lastSeen: "Yesterday",
    avatarColorIndex: 2,
  },
  {
    id: "u4",
    name: "Anna Schmidt",
    email: "anna@globalid.uk",
    role: "Project Manager",
    status: "active",
    lastSeen: "3 days ago",
    avatarColorIndex: 3,
  },
  {
    id: "u5",
    name: "Tom Baker",
    email: "tom@globalid.uk",
    role: "Employee",
    status: "inactive",
    lastSeen: "2 weeks ago",
    avatarColorIndex: 4,
  },
  {
    id: "u6",
    name: "Invited User",
    email: "invite@company.com",
    role: "Employee",
    status: "pending",
    lastSeen: "-",
    avatarColorIndex: 5,
  },
];

const INITIAL_FLAGS: FeatureFlag[] = [
  {
    id: "ai-invoice",
    name: "AI Invoice Drafting",
    description: "AI drafts invoices on day 28 of each month",
    enabled: true,
  },
  {
    id: "ai-mapper",
    name: "AI Column Mapper",
    description: "AI maps CSV columns during employee import",
    enabled: true,
  },
  {
    id: "ocr",
    name: "OCR Receipt Scanning",
    description: "Scan receipts with AI vision for expense auto-fill",
    enabled: true,
  },
  {
    id: "month-end",
    name: "Month-end Close Agent",
    description: "Automated month-end close workflow",
    enabled: true,
  },
  {
    id: "multi-currency",
    name: "Multi-currency Billing",
    description: "Bill clients in GBP, EUR, or USD",
    enabled: true,
  },
  {
    id: "client-portal",
    name: "Client Portal",
    description: "Self-service portal for clients to view invoices",
    enabled: false,
  },
  {
    id: "resource-planning",
    name: "Resource Planning",
    description: "Gantt + capacity planning views (Tier 2)",
    enabled: false,
  },
  {
    id: "payroll-export",
    name: "Payroll Export",
    description: "Export payroll data to external systems",
    enabled: false,
  },
  {
    id: "mfa",
    name: "MFA Enforcement",
    description: "Require 2FA for all users",
    enabled: false,
  },
];

const AUDIT_LOG: AuditEntry[] = [
  {
    id: "a1",
    timestamp: "Today 09:15",
    user: "Youssouf Hassan",
    action: "LOGIN",
    resource: "auth",
    ip: "82.65.12.4",
  },
  {
    id: "a2",
    timestamp: "Today 08:30",
    user: "Marie Dubois",
    action: "UPDATE",
    resource: "employee:amara-diallo",
    ip: "91.23.45.6",
  },
  {
    id: "a3",
    timestamp: "Yesterday 17:00",
    user: "Youssouf Hassan",
    action: "CREATE",
    resource: "invoice:INV-2026-0042",
    ip: "82.65.12.4",
  },
  {
    id: "a4",
    timestamp: "Yesterday 14:00",
    user: "Pierre Leclerc",
    action: "APPROVE",
    resource: "expense:e2",
    ip: "77.32.11.8",
  },
  {
    id: "a5",
    timestamp: "Apr 13 11:20",
    user: "Anna Schmidt",
    action: "CREATE",
    resource: "timesheet:week-15",
    ip: "88.44.22.1",
  },
  {
    id: "a6",
    timestamp: "Apr 13 09:00",
    user: "Youssouf Hassan",
    action: "INVITE",
    resource: "user:invite@company.com",
    ip: "82.65.12.4",
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RoleBadge({ role }: { role: UserRole }) {
  switch (role) {
    case "Owner":
      return <Badge tone="primary">{role}</Badge>;
    case "Admin":
      return <Badge tone="info">{role}</Badge>;
    case "Finance Manager":
      return <Badge tone="warning">{role}</Badge>;
    default:
      return <Badge tone="default">{role}</Badge>;
  }
}

function StatusBadge({ status }: { status: UserStatus }) {
  switch (status) {
    case "active":
      return <Badge tone="success" dot>Active</Badge>;
    case "pending":
      return <Badge tone="warning">Pending</Badge>;
    default:
      return <Badge tone="default">Inactive</Badge>;
  }
}

function ActionBadge({ action }: { action: AuditEntry["action"] }) {
  switch (action) {
    case "LOGIN":
      return <Badge tone="default">{action}</Badge>;
    case "UPDATE":
      return <Badge tone="info">{action}</Badge>;
    case "CREATE":
      return <Badge tone="success">{action}</Badge>;
    case "APPROVE":
      return <Badge tone="primary">{action}</Badge>;
    case "INVITE":
      return <Badge tone="warning">{action}</Badge>;
    case "DELETE":
      return <Badge tone="error">{action}</Badge>;
  }
}

// ---------------------------------------------------------------------------
// Invite Modal
// ---------------------------------------------------------------------------

function InviteModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Employee");

  function handleSend() {
    console.log("Invite sent:", { email, role });
    setEmail("");
    setRole("Employee");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite user"
      description="Send an invitation email to add a new user to your workspace."
      size="sm"
      footer={
        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSend}>
            Send invite
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div>
          <label
            htmlFor="invite-email"
            className="text-2"
            style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)" }}
          >
            Email address
          </label>
          <Input
            id="invite-email"
            type="email"
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="invite-role"
            className="text-2"
            style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)" }}
          >
            Role
          </label>
          <Select
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <option value="Admin">Admin</option>
            <option value="Finance Manager">Finance Manager</option>
            <option value="Project Manager">Project Manager</option>
            <option value="Employee">Employee</option>
          </Select>
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Users & Roles tab
// ---------------------------------------------------------------------------

function UsersTab() {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <>
      <div className="kpi-grid" style={{ marginBottom: "var(--space-5)" }}>
        <StatPill label="Total users" value={6} />
        <StatPill label="Admins" value={2} accent="info" />
        <StatPill label="Active sessions" value={4} accent="success" />
        <StatPill label="Pending invites" value={1} accent="warning" />
      </div>

      <DataTableWrapper>
        <div className="card-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-4) var(--space-5)" }}>
          <span className="card-title" style={{ margin: 0 }}>Users</span>
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<Plus size={14} />}
            onClick={() => setInviteOpen(true)}
          >
            Invite user
          </Button>
        </div>

        <Table>
          <THead>
            <TR>
              <TH>User</TH>
              <TH>Role</TH>
              <TH>Status</TH>
              <TH>Last seen</TH>
              <TH style={{ width: 40 }} />
            </TR>
          </THead>
          <TBody>
            {INITIAL_USERS.map((user) => (
              <TR key={user.id}>
                <TD>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                    <Avatar
                      name={user.name}
                      colorIndex={user.avatarColorIndex}
                      size="sm"
                      status={user.status === "active" ? "online" : undefined}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div
                        className="text-1"
                        style={{ fontWeight: "var(--weight-medium)", fontSize: "var(--text-body-sm)" }}
                      >
                        {user.name}
                      </div>
                      <div className="text-3" style={{ fontSize: "var(--text-caption)" }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                </TD>
                <TD><RoleBadge role={user.role} /></TD>
                <TD><StatusBadge status={user.status} /></TD>
                <TD muted style={{ fontVariantNumeric: "tabular-nums" }}>
                  {user.lastSeen}
                </TD>
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
                    <DropdownItem icon={<Settings size={14} />}>Edit role</DropdownItem>
                    {user.status === "active" && (
                      <DropdownItem icon={<Shield size={14} />} destructive>
                        Deactivate
                      </DropdownItem>
                    )}
                    {user.status === "pending" && (
                      <DropdownItem icon={<Mail size={14} />}>Resend invite</DropdownItem>
                    )}
                    <DropdownDivider />
                    <DropdownItem destructive>Remove</DropdownItem>
                  </Dropdown>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </DataTableWrapper>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Feature Flags tab
// ---------------------------------------------------------------------------

function FeatureFlagsTab() {
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FLAGS);

  function toggleFlag(id: string) {
    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      {flags.map((flag) => (
        <div
          key={flag.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "var(--color-surface-1)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
            gap: "var(--space-4)",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              className="text-1"
              style={{ fontWeight: "var(--weight-semibold)", fontSize: "var(--text-body-sm)", marginBottom: "var(--space-1)" }}
            >
              {flag.name}
            </div>
            <div className="text-3" style={{ fontSize: "var(--text-caption)" }}>
              {flag.description}
            </div>
          </div>
          <Toggle
            checked={flag.enabled}
            onCheckedChange={() => toggleFlag(flag.id)}
            label={`Toggle ${flag.name}`}
          />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Audit Log tab
// ---------------------------------------------------------------------------

function AuditLogTab() {
  return (
    <DataTableWrapper>
      <Table>
        <THead>
          <TR>
            <TH>Timestamp</TH>
            <TH>User</TH>
            <TH>Action</TH>
            <TH>Resource</TH>
            <TH>IP</TH>
          </TR>
        </THead>
        <TBody>
          {AUDIT_LOG.map((entry) => (
            <TR key={entry.id}>
              <TD muted style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                {entry.timestamp}
              </TD>
              <TD style={{ fontSize: "var(--text-body-sm)" }}>{entry.user}</TD>
              <TD><ActionBadge action={entry.action} /></TD>
              <TD muted style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "var(--text-caption)" }}>
                {entry.resource}
              </TD>
              <TD muted style={{ fontVariantNumeric: "tabular-nums", fontSize: "var(--text-caption)" }}>
                {entry.ip}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </DataTableWrapper>
  );
}

// ---------------------------------------------------------------------------
// Billing tab
// ---------------------------------------------------------------------------

function BillingTab() {
  const rows: { label: string; value: string }[] = [
    { label: "Plan", value: "Gamma Pro - Pilot" },
    { label: "Billing period", value: "Active pilot (until June 30, 2026)" },
    { label: "Users", value: "6 / 200 seats" },
    { label: "Monthly cost", value: "\u20AC0 (pilot)" },
    { label: "Contact", value: "billing@gammahr.com" },
  ];

  return (
    <div
      className="card"
      style={{ maxWidth: 520 }}
    >
      <div className="card-header">
        <span className="card-title">Subscription</span>
      </div>
      <div className="card-body">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {rows.map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "var(--space-3)",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <span className="text-3" style={{ fontSize: "var(--text-body-sm)" }}>
                {row.label}
              </span>
              <span
                className="text-1"
                style={{ fontWeight: "var(--weight-medium)", fontSize: "var(--text-body-sm)", textAlign: "right" }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminPage() {
  return (
    <>
      <PageHeader title="Administration" />

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users &amp; Roles</TabsTrigger>
          <TabsTrigger value="flags">Feature Flags</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div style={{ paddingTop: "var(--space-5)" }}>
            <UsersTab />
          </div>
        </TabsContent>

        <TabsContent value="flags">
          <div style={{ paddingTop: "var(--space-5)" }}>
            <FeatureFlagsTab />
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <div style={{ paddingTop: "var(--space-5)" }}>
            <AuditLogTab />
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <div style={{ paddingTop: "var(--space-5)" }}>
            <BillingTab />
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
