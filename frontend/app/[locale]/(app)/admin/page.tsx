"use client";

import { useState } from "react";
import {
  Users,
  Plus,
  MoreHorizontal,
  Settings,
  Shield,
  Mail,
  Download,
  CreditCard,
  Lock,
  ToggleLeft,
  ClipboardList,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useEffect } from "react";

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
    name: "Youssouf Kerzika",
    email: "youssouf.kerzika@globalg.consulting",
    role: "Owner",
    status: "active",
    lastSeen: "Just now",
    avatarColorIndex: 0,
  },
  {
    id: "u2",
    name: "Marie Dubois",
    email: "marie.dubois@globalg.consulting",
    role: "Admin",
    status: "active",
    lastSeen: "2h ago",
    avatarColorIndex: 1,
  },
  {
    id: "u3",
    name: "Pierre Leclerc",
    email: "pierre.leclerc@globalg.consulting",
    role: "Finance Manager",
    status: "active",
    lastSeen: "Yesterday",
    avatarColorIndex: 2,
  },
  {
    id: "u4",
    name: "Anna Schmidt",
    email: "anna.schmidt@globalg.consulting",
    role: "Project Manager",
    status: "active",
    lastSeen: "3 days ago",
    avatarColorIndex: 3,
  },
  {
    id: "u5",
    name: "Tom Baker",
    email: "tom.baker@globalg.consulting",
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
    user: "Youssouf Kerzika",
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
    user: "Youssouf Kerzika",
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
    user: "Youssouf Kerzika",
    action: "INVITE",
    resource: "user:invite@company.com",
    ip: "82.65.12.4",
  },
];

// ---------------------------------------------------------------------------
// Shared helpers
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
// Card header shared component
// ---------------------------------------------------------------------------

function CardHeader({
  icon,
  title,
  action,
  expanded,
  onToggle,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
  count?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--space-4) var(--space-5)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <span style={{ color: "var(--color-text-3)" }}>{icon}</span>
        <span
          style={{
            fontWeight: "var(--weight-semibold)",
            fontSize: "var(--text-body-sm)",
            color: "var(--color-text-1)",
          }}
        >
          {title}
        </span>
        {count !== undefined && (
          <span
            style={{
              fontSize: "var(--text-caption)",
              color: "var(--color-text-3)",
              background: "var(--color-surface-2)",
              borderRadius: "var(--radius-full)",
              padding: "1px 8px",
            }}
          >
            {count}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        {action}
        {onToggle && (
          <Button variant="ghost" size="xs" iconOnly onClick={onToggle} aria-label={expanded ? "Collapse" : "Expand"}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Invite Modal
// ---------------------------------------------------------------------------

function InviteModal({
  open,
  onClose,
  onInvite,
}: {
  open: boolean;
  onClose: () => void;
  onInvite: (email: string, role: UserRole) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Employee");
  const [sending, setSending] = useState(false);

  function handleSend() {
    if (!email.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      onInvite(email.trim(), role);
      setEmail("");
      setRole("Employee");
      onClose();
    }, 800);
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
          <Button variant="primary" size="sm" onClick={handleSend} disabled={sending || !email.trim()}>
            {sending ? "Sending..." : "Send invite"}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div>
          <label
            htmlFor="invite-email"
            style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}
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
            style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}
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

function EditRoleModal({
  user,
  onClose,
  onSave,
}: {
  user: AdminUser | null;
  onClose: () => void;
  onSave: (id: string, role: UserRole) => void;
}) {
  const [role, setRole] = useState<UserRole>(user?.role ?? "Employee");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setRole(user.role);
  }, [user?.id]);

  function handleSave() {
    if (!user) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSave(user.id, role);
      onClose();
    }, 800);
  }

  return (
    <Modal
      open={!!user}
      onClose={onClose}
      title="Edit role"
      size="sm"
      footer={
        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      }
    >
      <div>
        <label
          htmlFor="edit-role-select"
          style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}
        >
          Role for {user?.name}
        </label>
        <Select
          id="edit-role-select"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
        >
          <option value="Admin">Admin</option>
          <option value="Finance Manager">Finance Manager</option>
          <option value="Project Manager">Project Manager</option>
          <option value="Employee">Employee</option>
        </Select>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Users & Roles card
// ---------------------------------------------------------------------------

function UsersCard() {
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editRoleUser, setEditRoleUser] = useState<AdminUser | null>(null);
  const [expanded, setExpanded] = useState(true);

  function handleUpdateRole(id: string, role: UserRole) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  }
  function handleDeactivate(id: string) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "inactive" as UserStatus } : u)));
  }
  function handleRemove(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }
  function handleInvite(email: string, role: UserRole) {
    setUsers((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        name: email.split("@")[0] ?? email,
        email,
        role,
        status: "pending",
        lastSeen: "-",
        avatarColorIndex: prev.length % 8,
      },
    ]);
  }

  const activeCount = users.filter((u) => u.status === "active").length;
  const pendingCount = users.filter((u) => u.status === "pending").length;
  const previewUsers = expanded ? users : users.slice(0, 3);

  return (
    <>
      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <CardHeader
          icon={<Users size={16} />}
          title="Users & Roles"
          count={users.length}
          action={
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<Plus size={14} />}
              onClick={() => setInviteOpen(true)}
            >
              Invite user
            </Button>
          }
          expanded={expanded}
          onToggle={() => setExpanded((v) => !v)}
        />

        {/* Summary row - always visible */}
        <div
          style={{
            display: "flex",
            gap: "var(--space-4)",
            padding: "var(--space-4) var(--space-5)",
            borderBottom: "1px solid var(--color-border)",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>
            <span style={{ fontWeight: "var(--weight-semibold)", color: "var(--color-text-1)" }}>{activeCount}</span> active
          </span>
          <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>
            <span style={{ fontWeight: "var(--weight-semibold)", color: "var(--color-text-1)" }}>{pendingCount}</span> pending invite{pendingCount !== 1 ? "s" : ""}
          </span>
          <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>
            <span style={{ fontWeight: "var(--weight-semibold)", color: "var(--color-text-1)" }}>{users.filter((u) => u.role === "Admin" || u.role === "Owner").length}</span> admins
          </span>
        </div>

        {/* Table */}
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
            {previewUsers.map((user) => (
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
                      <div style={{ fontWeight: "var(--weight-medium)", fontSize: "var(--text-body-sm)", color: "var(--color-text-1)" }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>
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
                    <DropdownItem icon={<Settings size={14} />} onClick={() => setEditRoleUser(user)}>
                      Edit role
                    </DropdownItem>
                    {user.status === "active" && (
                      <DropdownItem icon={<Shield size={14} />} destructive onClick={() => handleDeactivate(user.id)}>
                        Deactivate
                      </DropdownItem>
                    )}
                    {user.status === "pending" && (
                      <DropdownItem icon={<Mail size={14} />} onClick={() => {}}>
                        Resend invite
                      </DropdownItem>
                    )}
                    <DropdownDivider />
                    <DropdownItem destructive onClick={() => handleRemove(user.id)}>
                      Remove
                    </DropdownItem>
                  </Dropdown>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>

        {/* Show more toggle when collapsed */}
        {!expanded && users.length > 3 && (
          <div style={{ padding: "var(--space-3) var(--space-5)", borderTop: "1px solid var(--color-border)" }}>
            <Button variant="ghost" size="sm" onClick={() => setExpanded(true)}>
              Show all {users.length} users
            </Button>
          </div>
        )}
      </div>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} onInvite={handleInvite} />
      <EditRoleModal user={editRoleUser} onClose={() => setEditRoleUser(null)} onSave={handleUpdateRole} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Feature Flags card
// ---------------------------------------------------------------------------

function FeatureFlagsCard() {
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FLAGS);
  const [expanded, setExpanded] = useState(false);

  function toggleFlag(id: string) {
    setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)));
  }

  const enabledCount = flags.filter((f) => f.enabled).length;
  const visibleFlags = expanded ? flags : flags.slice(0, 4);

  return (
    <div className="card">
      <CardHeader
        icon={<ToggleLeft size={16} />}
        title="Feature Flags"
        count={flags.length}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
      />

      <div style={{ padding: "var(--space-3) var(--space-5)", borderBottom: "1px solid var(--color-border)" }}>
        <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>
          <span style={{ fontWeight: "var(--weight-semibold)", color: "var(--color-text-1)" }}>{enabledCount}</span> of {flags.length} enabled
        </span>
      </div>

      <div style={{ padding: "var(--space-2) 0" }}>
        {visibleFlags.map((flag) => (
          <div
            key={flag.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "var(--space-3) var(--space-5)",
              gap: "var(--space-4)",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: "var(--weight-medium)", fontSize: "var(--text-body-sm)", color: "var(--color-text-1)", marginBottom: "2px" }}>
                {flag.name}
              </div>
              <div style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>
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

      {!expanded && flags.length > 4 && (
        <div style={{ padding: "var(--space-3) var(--space-5)", borderTop: "1px solid var(--color-border)" }}>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(true)}>
            Show {flags.length - 4} more flags
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Audit Log card
// ---------------------------------------------------------------------------

function AuditLogCard() {
  const [expanded, setExpanded] = useState(false);
  const [exporting, setExporting] = useState(false);

  function handleExport() {
    setExporting(true);
    setTimeout(() => setExporting(false), 1200);
  }

  const visibleEntries = expanded ? AUDIT_LOG : AUDIT_LOG.slice(0, 3);

  return (
    <div className="card">
      <CardHeader
        icon={<ClipboardList size={16} />}
        title="Audit Log"
        action={
          <Button variant="secondary" size="sm" leadingIcon={<Download size={14} />} onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>
        }
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
      />

      <div style={{ padding: "var(--space-3) var(--space-5)", borderBottom: "1px solid var(--color-border)" }}>
        <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>
          <span style={{ fontWeight: "var(--weight-semibold)", color: "var(--color-text-1)" }}>{AUDIT_LOG.length}</span> events in the last 7 days
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <Table>
          <THead>
            <TR>
              <TH>When</TH>
              <TH>User</TH>
              <TH>Action</TH>
              <TH>Resource</TH>
            </TR>
          </THead>
          <TBody>
            {visibleEntries.map((entry) => (
              <TR key={entry.id}>
                <TD muted style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", fontSize: "var(--text-caption)" }}>
                  {entry.timestamp}
                </TD>
                <TD style={{ fontSize: "var(--text-body-sm)" }}>{entry.user}</TD>
                <TD><ActionBadge action={entry.action} /></TD>
                <TD muted style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "var(--text-caption)" }}>
                  {entry.resource}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>

      {!expanded && AUDIT_LOG.length > 3 && (
        <div style={{ padding: "var(--space-3) var(--space-5)", borderTop: "1px solid var(--color-border)" }}>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(true)}>
            Show all {AUDIT_LOG.length} events
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Billing card
// ---------------------------------------------------------------------------

function BillingCard() {
  const rows: { label: string; value: string }[] = [
    { label: "Plan", value: "Gamma Pro - Pilot" },
    { label: "Billing period", value: "Active pilot (until Jun 30, 2026)" },
    { label: "Seats", value: "6 / 200" },
    { label: "Monthly cost", value: "\u20AC0 (pilot)" },
    { label: "Contact", value: "billing@gammahr.com" },
  ];

  return (
    <div className="card">
      <CardHeader icon={<CreditCard size={16} />} title="Billing" />

      <div style={{ padding: "var(--space-2) 0" }}>
        {rows.map((row, i) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "var(--space-3) var(--space-5)",
              borderBottom: i < rows.length - 1 ? "1px solid var(--color-border)" : undefined,
              gap: "var(--space-4)",
            }}
          >
            <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-3)" }}>
              {row.label}
            </span>
            <span style={{ fontWeight: "var(--weight-medium)", fontSize: "var(--text-body-sm)", color: "var(--color-text-1)", textAlign: "right" }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Security card
// ---------------------------------------------------------------------------

function SecurityCard() {
  const [mfaEnforced, setMfaEnforced] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(true);

  const securityItems: { id: string; label: string; description: string; enabled: boolean; onChange: () => void }[] = [
    {
      id: "mfa",
      label: "Enforce MFA for all users",
      description: "All users must set up 2FA to log in",
      enabled: mfaEnforced,
      onChange: () => setMfaEnforced((v) => !v),
    },
    {
      id: "session",
      label: "Session timeout (8h)",
      description: "Users are logged out after 8 hours of inactivity",
      enabled: sessionTimeout,
      onChange: () => setSessionTimeout((v) => !v),
    },
  ];

  return (
    <div className="card">
      <CardHeader icon={<Lock size={16} />} title="Security" />

      <div style={{ padding: "var(--space-3) var(--space-5)", borderBottom: "1px solid var(--color-border)" }}>
        <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>
          <span style={{ fontWeight: "var(--weight-semibold)", color: mfaEnforced ? "var(--color-success)" : "var(--color-warning)" }}>
            {mfaEnforced ? "MFA on" : "MFA off"}
          </span>
          {" - "}{mfaEnforced ? "All users require 2FA" : "2FA is optional"}
        </span>
      </div>

      <div style={{ padding: "var(--space-2) 0" }}>
        {securityItems.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "var(--space-3) var(--space-5)",
              gap: "var(--space-4)",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: "var(--weight-medium)", fontSize: "var(--text-body-sm)", color: "var(--color-text-1)", marginBottom: "2px" }}>
                {item.label}
              </div>
              <div style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>
                {item.description}
              </div>
            </div>
            <Toggle checked={item.enabled} onCheckedChange={item.onChange} label={item.label} />
          </div>
        ))}
      </div>

      <div style={{ padding: "var(--space-3) var(--space-5)", borderTop: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>Active sessions</span>
          <span style={{ fontWeight: "var(--weight-semibold)", fontSize: "var(--text-body-sm)", color: "var(--color-text-1)" }}>3</span>
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

      {/* Stats row */}
      <div className="kpi-grid" style={{ marginBottom: "var(--space-5)" }}>
        <StatPill label="Total users" value={201} />
        <StatPill label="Active sessions" value={3} accent="success" />
        <StatPill label="Pending invites" value={1} accent="warning" />
        <StatPill label="Flags enabled" value={5} accent="info" />
      </div>

      {/* Card grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "var(--space-4)",
        }}
        className="admin-card-grid"
      >
        {/* Users & Roles - full width */}
        <UsersCard />

        {/* Feature Flags + Audit Log - 2 col */}
        <FeatureFlagsCard />
        <AuditLogCard />

        {/* Billing + Security - 2 col */}
        <BillingCard />
        <SecurityCard />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-card-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
