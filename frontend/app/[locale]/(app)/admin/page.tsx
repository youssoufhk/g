"use client";

import { useMemo, useState, useEffect } from "react";
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
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/patterns/page-header";
import { AiRecommendations, type AiRecommendation } from "@/components/patterns/ai-recommendations";
import {
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
import { AdminKpis } from "@/features/admin/admin-kpis";
import { formatDate } from "@/lib/format";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UserStatus = "active" | "inactive" | "pending";
type UserRole =
  | "owner"
  | "admin"
  | "finance_manager"
  | "project_manager"
  | "employee";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastSeenIso: string | null;
  avatarColorIndex: number;
};

type FeatureFlag = {
  id: string;
  nameKey: string;
  descKey: string;
  enabled: boolean;
};

type AuditAction = "LOGIN" | "UPDATE" | "CREATE" | "APPROVE" | "INVITE" | "DELETE";

type AuditEntry = {
  id: string;
  timestampIso: string;
  user: string;
  action: AuditAction;
  resource: string;
  ip: string;
};

// ---------------------------------------------------------------------------
// Mock data (ISO dates only; labels come from i18n)
// ---------------------------------------------------------------------------

const NOW_ISO = "2026-04-18T09:30:00Z";

const INITIAL_USERS: AdminUser[] = [
  { id: "u1", name: "Youssouf Kerzika", email: "youssouf.kerzika@globalg.consulting", role: "owner", status: "active", lastSeenIso: "2026-04-18T09:15:00Z", avatarColorIndex: 0 },
  { id: "u2", name: "Marie Dubois", email: "marie.dubois@globalg.consulting", role: "admin", status: "active", lastSeenIso: "2026-04-18T07:30:00Z", avatarColorIndex: 1 },
  { id: "u3", name: "Pierre Leclerc", email: "pierre.leclerc@globalg.consulting", role: "finance_manager", status: "active", lastSeenIso: "2026-04-17T16:00:00Z", avatarColorIndex: 2 },
  { id: "u4", name: "Anna Schmidt", email: "anna.schmidt@globalg.consulting", role: "project_manager", status: "active", lastSeenIso: "2026-04-15T12:00:00Z", avatarColorIndex: 3 },
  { id: "u5", name: "Tom Baker", email: "tom.baker@globalg.consulting", role: "employee", status: "inactive", lastSeenIso: "2026-04-04T09:00:00Z", avatarColorIndex: 4 },
  { id: "u6", name: "Invited User", email: "invite@company.com", role: "employee", status: "pending", lastSeenIso: null, avatarColorIndex: 5 },
];

const INITIAL_FLAGS: FeatureFlag[] = [
  { id: "ai-invoice", nameKey: "flag_ai_invoice_name", descKey: "flag_ai_invoice_desc", enabled: true },
  { id: "ai-mapper", nameKey: "flag_ai_mapper_name", descKey: "flag_ai_mapper_desc", enabled: true },
  { id: "ocr", nameKey: "flag_ocr_name", descKey: "flag_ocr_desc", enabled: true },
  { id: "month-end", nameKey: "flag_month_end_name", descKey: "flag_month_end_desc", enabled: true },
  { id: "multi-currency", nameKey: "flag_multi_currency_name", descKey: "flag_multi_currency_desc", enabled: true },
  { id: "client-portal", nameKey: "flag_client_portal_name", descKey: "flag_client_portal_desc", enabled: false },
  { id: "resource-planning", nameKey: "flag_resource_planning_name", descKey: "flag_resource_planning_desc", enabled: false },
  { id: "payroll-export", nameKey: "flag_payroll_export_name", descKey: "flag_payroll_export_desc", enabled: false },
  { id: "mfa", nameKey: "flag_mfa_name", descKey: "flag_mfa_desc", enabled: false },
];

const AUDIT_LOG: AuditEntry[] = [
  { id: "a1", timestampIso: "2026-04-18T09:15:00Z", user: "Youssouf Kerzika", action: "LOGIN", resource: "auth", ip: "82.65.12.4" },
  { id: "a2", timestampIso: "2026-04-18T08:30:00Z", user: "Marie Dubois", action: "UPDATE", resource: "employee:amara-diallo", ip: "91.23.45.6" },
  { id: "a3", timestampIso: "2026-04-17T17:00:00Z", user: "Youssouf Kerzika", action: "CREATE", resource: "invoice:INV-2026-0042", ip: "82.65.12.4" },
  { id: "a4", timestampIso: "2026-04-17T14:00:00Z", user: "Pierre Leclerc", action: "APPROVE", resource: "expense:e2", ip: "77.32.11.8" },
  { id: "a5", timestampIso: "2026-04-13T11:20:00Z", user: "Anna Schmidt", action: "CREATE", resource: "timesheet:week-15", ip: "88.44.22.1" },
  { id: "a6", timestampIso: "2026-04-13T09:00:00Z", user: "Youssouf Kerzika", action: "INVITE", resource: "user:invite@company.com", ip: "82.65.12.4" },
];

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function RoleBadge({ role }: { role: UserRole }) {
  const t = useTranslations("admin");
  const label = t(`role_${role}`);
  switch (role) {
    case "owner":
      return <Badge tone="primary">{label}</Badge>;
    case "admin":
      return <Badge tone="info">{label}</Badge>;
    case "finance_manager":
      return <Badge tone="warning">{label}</Badge>;
    default:
      return <Badge tone="default">{label}</Badge>;
  }
}

function StatusBadge({ status }: { status: UserStatus }) {
  const t = useTranslations("admin");
  switch (status) {
    case "active":
      return <Badge tone="success" dot>{t("status_active")}</Badge>;
    case "pending":
      return <Badge tone="warning">{t("status_pending")}</Badge>;
    default:
      return <Badge tone="default">{t("status_inactive")}</Badge>;
  }
}

function ActionBadge({ action }: { action: AuditAction }) {
  const t = useTranslations("admin");
  const label = t(`action_${action}`);
  switch (action) {
    case "LOGIN":
      return <Badge tone="default">{label}</Badge>;
    case "UPDATE":
      return <Badge tone="info">{label}</Badge>;
    case "CREATE":
      return <Badge tone="success">{label}</Badge>;
    case "APPROVE":
      return <Badge tone="primary">{label}</Badge>;
    case "INVITE":
      return <Badge tone="warning">{label}</Badge>;
    case "DELETE":
      return <Badge tone="error">{label}</Badge>;
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
  toggleLabels,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
  count?: number;
  toggleLabels?: { expand: string; collapse: string };
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
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {count}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        {action}
        {onToggle && (
          <Button
            variant="ghost"
            size="xs"
            iconOnly
            onClick={onToggle}
            aria-label={expanded ? toggleLabels?.collapse ?? "" : toggleLabels?.expand ?? ""}
          >
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
  const t = useTranslations("admin");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("employee");
  const [sending, setSending] = useState(false);

  function handleSend() {
    if (!email.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      onInvite(email.trim(), role);
      setEmail("");
      setRole("employee");
      onClose();
    }, 800);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("invite_title")}
      description={t("invite_desc")}
      size="sm"
      footer={
        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {t("action_cancel")}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSend} disabled={sending || !email.trim()} aria-busy={sending}>
            {sending ? t("invite_sending") : t("invite_send")}
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
            {t("invite_email_label")}
          </label>
          <Input
            id="invite-email"
            type="email"
            placeholder={t("invite_email_placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="invite-role"
            style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}
          >
            {t("invite_role_label")}
          </label>
          <Select
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <option value="admin">{t("role_admin")}</option>
            <option value="finance_manager">{t("role_finance_manager")}</option>
            <option value="project_manager">{t("role_project_manager")}</option>
            <option value="employee">{t("role_employee")}</option>
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
  const t = useTranslations("admin");
  const [role, setRole] = useState<UserRole>(user?.role ?? "employee");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setRole(user.role);
  }, [user]);

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
      title={t("edit_role_title")}
      size="sm"
      footer={
        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {t("action_cancel")}
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving} aria-busy={saving}>
            {saving ? t("action_saving") : t("action_save")}
          </Button>
        </div>
      }
    >
      <div>
        <label
          htmlFor="edit-role-select"
          style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}
        >
          {t("edit_role_for", { name: user?.name ?? "" })}
        </label>
        <Select
          id="edit-role-select"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
        >
          <option value="admin">{t("role_admin")}</option>
          <option value="finance_manager">{t("role_finance_manager")}</option>
          <option value="project_manager">{t("role_project_manager")}</option>
          <option value="employee">{t("role_employee")}</option>
        </Select>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Users & Roles card
// ---------------------------------------------------------------------------

function UsersCard({
  users,
  setUsers,
  activeFilter,
}: {
  users: AdminUser[];
  setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>;
  activeFilter: "all" | "pending";
}) {
  const t = useTranslations("admin");
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
        lastSeenIso: null,
        avatarColorIndex: prev.length % 8,
      },
    ]);
  }

  const filtered = activeFilter === "pending" ? users.filter((u) => u.status === "pending") : users;
  const activeCount = users.filter((u) => u.status === "active").length;
  const pendingCount = users.filter((u) => u.status === "pending").length;
  const adminCount = users.filter((u) => u.role === "admin" || u.role === "owner").length;
  const previewUsers = expanded ? filtered : filtered.slice(0, 3);

  return (
    <>
      <div className="card" style={{ gridColumn: "1 / -1" }} id="admin-users-card">
        <CardHeader
          icon={<Users size={16} />}
          title={t("card_users_title")}
          count={users.length}
          action={
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<Plus size={14} />}
              onClick={() => setInviteOpen(true)}
            >
              {t("invite_user")}
            </Button>
          }
          expanded={expanded}
          onToggle={() => setExpanded((v) => !v)}
          toggleLabels={{ expand: t("action_expand"), collapse: t("action_collapse") }}
        />

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
            <span style={{ fontWeight: "var(--weight-semibold)", color: "var(--color-text-1)", fontVariantNumeric: "tabular-nums" }}>{activeCount}</span> {t("summary_active")}
          </span>
          <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>
            <span style={{ fontWeight: "var(--weight-semibold)", color: "var(--color-text-1)", fontVariantNumeric: "tabular-nums" }}>{pendingCount}</span> {t("summary_pending")}
          </span>
          <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>
            <span style={{ fontWeight: "var(--weight-semibold)", color: "var(--color-text-1)", fontVariantNumeric: "tabular-nums" }}>{adminCount}</span> {t("summary_admins")}
          </span>
        </div>

        <Table>
          <THead>
            <TR>
              <TH>{t("col_user")}</TH>
              <TH>{t("col_role")}</TH>
              <TH>{t("col_status")}</TH>
              <TH>{t("col_last_seen")}</TH>
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
                  {user.lastSeenIso ? formatDate(user.lastSeenIso, "medium") : t("never_signed_in")}
                </TD>
                <TD style={{ width: 40 }}>
                  <Dropdown
                    align="right"
                    trigger={({ toggle, open }) => (
                      <Button
                        variant="ghost"
                        size="xs"
                        iconOnly
                        aria-label={t("action_more")}
                        aria-expanded={open}
                        onClick={toggle}
                      >
                        <MoreHorizontal size={14} />
                      </Button>
                    )}
                  >
                    <DropdownItem icon={<Settings size={14} />} onClick={() => setEditRoleUser(user)}>
                      {t("action_edit_role")}
                    </DropdownItem>
                    {user.status === "active" && (
                      <DropdownItem icon={<Shield size={14} />} destructive onClick={() => handleDeactivate(user.id)}>
                        {t("action_deactivate")}
                      </DropdownItem>
                    )}
                    {user.status === "pending" && (
                      <DropdownItem icon={<Mail size={14} />} onClick={() => {}}>
                        {t("action_resend_invite")}
                      </DropdownItem>
                    )}
                    <DropdownDivider />
                    <DropdownItem destructive onClick={() => handleRemove(user.id)}>
                      {t("action_remove")}
                    </DropdownItem>
                  </Dropdown>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>

        {!expanded && filtered.length > 3 && (
          <div style={{ padding: "var(--space-3) var(--space-5)", borderTop: "1px solid var(--color-border)" }}>
            <Button variant="ghost" size="sm" onClick={() => setExpanded(true)}>
              {t("show_all_users", { count: filtered.length })}
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

function FeatureFlagsCard({
  flags,
  setFlags,
}: {
  flags: FeatureFlag[];
  setFlags: React.Dispatch<React.SetStateAction<FeatureFlag[]>>;
}) {
  const t = useTranslations("admin");
  const [expanded, setExpanded] = useState(false);

  function toggleFlag(id: string) {
    setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)));
  }

  const enabledCount = flags.filter((f) => f.enabled).length;
  const visibleFlags = expanded ? flags : flags.slice(0, 4);

  return (
    <div className="card" id="admin-flags-card">
      <CardHeader
        icon={<ToggleLeft size={16} />}
        title={t("card_flags_title")}
        count={flags.length}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        toggleLabels={{ expand: t("action_expand"), collapse: t("action_collapse") }}
      />

      <div style={{ padding: "var(--space-3) var(--space-5)", borderBottom: "1px solid var(--color-border)" }}>
        <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>
          <span style={{ fontWeight: "var(--weight-semibold)", color: "var(--color-text-1)", fontVariantNumeric: "tabular-nums" }}>{enabledCount}</span> {t("flags_of", { total: flags.length })}
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
                {t(flag.nameKey)}
              </div>
              <div style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>
                {t(flag.descKey)}
              </div>
            </div>
            <Toggle
              checked={flag.enabled}
              onCheckedChange={() => toggleFlag(flag.id)}
              label={t("toggle_flag", { name: t(flag.nameKey) })}
            />
          </div>
        ))}
      </div>

      {!expanded && flags.length > 4 && (
        <div style={{ padding: "var(--space-3) var(--space-5)", borderTop: "1px solid var(--color-border)" }}>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(true)}>
            {t("show_more_flags", { count: flags.length - 4 })}
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
  const t = useTranslations("admin");
  const [expanded, setExpanded] = useState(false);
  const [exporting, setExporting] = useState(false);

  function handleExport() {
    setExporting(true);
    setTimeout(() => setExporting(false), 1200);
  }

  const visibleEntries = expanded ? AUDIT_LOG : AUDIT_LOG.slice(0, 3);

  return (
    <div className="card" id="admin-audit-card">
      <CardHeader
        icon={<ClipboardList size={16} />}
        title={t("card_audit_title")}
        action={
          <Button variant="secondary" size="sm" leadingIcon={<Download size={14} />} onClick={handleExport} disabled={exporting} aria-busy={exporting}>
            {exporting ? t("audit_exporting") : t("audit_export")}
          </Button>
        }
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        toggleLabels={{ expand: t("action_expand"), collapse: t("action_collapse") }}
      />

      <div style={{ padding: "var(--space-3) var(--space-5)", borderBottom: "1px solid var(--color-border)" }}>
        <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>
          <span style={{ fontWeight: "var(--weight-semibold)", color: "var(--color-text-1)", fontVariantNumeric: "tabular-nums" }}>{AUDIT_LOG.length}</span> {t("audit_events_7d")}
        </span>
      </div>

      <div style={{ overflowX: "auto" }} aria-live="polite">
        <Table>
          <THead>
            <TR>
              <TH>{t("col_when")}</TH>
              <TH>{t("col_user")}</TH>
              <TH>{t("col_action")}</TH>
              <TH>{t("col_resource")}</TH>
            </TR>
          </THead>
          <TBody>
            {visibleEntries.map((entry) => (
              <TR key={entry.id}>
                <TD muted style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", fontSize: "var(--text-caption)" }}>
                  {formatDate(entry.timestampIso, "withTime")}
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
            {t("show_all_events", { count: AUDIT_LOG.length })}
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
  const t = useTranslations("admin");
  const rows: { label: string; value: string; numeric?: boolean }[] = [
    { label: t("billing_plan"), value: t("billing_plan_value") },
    { label: t("billing_period"), value: t("billing_period_value") },
    { label: t("billing_seats"), value: "6 / 200", numeric: true },
    { label: t("billing_cost"), value: t("billing_cost_value") },
    { label: t("billing_contact"), value: "billing@gammahr.com" },
  ];

  return (
    <div className="card" id="admin-billing-card">
      <CardHeader icon={<CreditCard size={16} />} title={t("card_billing_title")} />

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
            <span
              style={{
                fontWeight: "var(--weight-medium)",
                fontSize: "var(--text-body-sm)",
                color: "var(--color-text-1)",
                textAlign: "right",
                fontVariantNumeric: row.numeric ? "tabular-nums" : undefined,
              }}
            >
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
  const t = useTranslations("admin");
  const [mfaEnforced, setMfaEnforced] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(true);

  const securityItems: { id: string; label: string; description: string; enabled: boolean; onChange: () => void }[] = [
    {
      id: "mfa",
      label: t("security_mfa_label"),
      description: t("security_mfa_desc"),
      enabled: mfaEnforced,
      onChange: () => setMfaEnforced((v) => !v),
    },
    {
      id: "session",
      label: t("security_session_label"),
      description: t("security_session_desc"),
      enabled: sessionTimeout,
      onChange: () => setSessionTimeout((v) => !v),
    },
  ];

  return (
    <div className="card">
      <CardHeader icon={<Lock size={16} />} title={t("card_security_title")} />

      <div style={{ padding: "var(--space-3) var(--space-5)", borderBottom: "1px solid var(--color-border)" }}>
        <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>
          <span style={{ fontWeight: "var(--weight-semibold)", color: mfaEnforced ? "var(--color-success)" : "var(--color-warning)" }}>
            {mfaEnforced ? t("security_mfa_on") : t("security_mfa_off")}
          </span>
          {" - "}{mfaEnforced ? t("security_mfa_on_hint") : t("security_mfa_off_hint")}
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
          <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>{t("security_active_sessions")}</span>
          <span style={{ fontWeight: "var(--weight-semibold)", fontSize: "var(--text-body-sm)", color: "var(--color-text-1)", fontVariantNumeric: "tabular-nums" }}>3</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminPage() {
  const t = useTranslations("admin");
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FLAGS);
  const [activeKpi, setActiveKpi] = useState<"users" | "flags" | "billing" | "audit" | undefined>();
  const [userFilter, setUserFilter] = useState<"all" | "pending">("all");

  const pendingInvites = users.filter((u) => u.status === "pending").length;
  const flagsEnabled = flags.filter((f) => f.enabled).length;

  // audit "today" = events on 2026-04-18 per seed
  const auditToday = useMemo(() => {
    const today = NOW_ISO.slice(0, 10);
    return AUDIT_LOG.filter((e) => e.timestampIso.slice(0, 10) === today).length;
  }, []);

  // Real data-backed recommendations only
  const staleUsers = users.filter((u) => {
    if (!u.lastSeenIso || u.status !== "active") return false;
    const diffDays = (new Date(NOW_ISO).getTime() - new Date(u.lastSeenIso).getTime()) / 86400000;
    return diffDays > 90;
  }).length;

  const disabledSecurityFlags = flags.filter((f) => f.id === "mfa" && !f.enabled).length;

  const recommendations: AiRecommendation[] = [
    ...(pendingInvites > 0
      ? [
          {
            id: "rec-pending-invites",
            icon: Mail,
            tone: "gold" as const,
            title: t("rec_pending_invites_title"),
            detail: t("rec_pending_invites_detail", { count: pendingInvites }),
            applyLabel: t("rec_review"),
            onApply: () => {
              setUserFilter("pending");
              setActiveKpi("users");
              document.getElementById("admin-users-card")?.scrollIntoView({ block: "start" });
            },
          },
        ]
      : []),
    ...(staleUsers > 0
      ? [
          {
            id: "rec-stale-users",
            icon: Sparkles,
            tone: "accent" as const,
            title: t("rec_stale_users_title"),
            detail: t("rec_stale_users_detail", { count: staleUsers }),
          },
        ]
      : []),
    ...(disabledSecurityFlags > 0
      ? [
          {
            id: "rec-mfa-off",
            icon: Shield,
            tone: "primary" as const,
            title: t("rec_mfa_off_title"),
            detail: t("rec_mfa_off_detail"),
            applyLabel: t("rec_configure"),
            onApply: () => {
              setActiveKpi("flags");
              document.getElementById("admin-flags-card")?.scrollIntoView({ block: "start" });
            },
          },
        ]
      : []),
  ];

  function handleSelectKpi(key: "users" | "flags" | "billing" | "audit") {
    const next = activeKpi === key ? undefined : key;
    setActiveKpi(next);
    if (key === "users" && next) setUserFilter("all");
    const targetId =
      key === "users"
        ? "admin-users-card"
        : key === "flags"
        ? "admin-flags-card"
        : key === "billing"
        ? "admin-billing-card"
        : "admin-audit-card";
    if (next) document.getElementById(targetId)?.scrollIntoView({ block: "start", behavior: "auto" });
  }

  return (
    <>
      <div className="app-aura" aria-hidden>
        <div className="app-aura-accent" />
      </div>
      <div className="flex flex-col" style={{ gap: "var(--space-6)" }}>
        <PageHeader title={t("page_title")} />

        <AiRecommendations
          items={recommendations}
          title={t("ai_recs_title")}
          overline={t("ai_recs_overline")}
        />

        <AdminKpis
          usersCount={users.length}
          pendingInvites={pendingInvites}
          flagsEnabled={flagsEnabled}
          flagsTotal={flags.length}
          billingStatus={t("kpi_billing_value")}
          billingHint={t("kpi_billing_hint")}
          auditToday={auditToday}
          activeKey={activeKpi}
          onSelectUsers={() => handleSelectKpi("users")}
          onSelectFlags={() => handleSelectKpi("flags")}
          onSelectBilling={() => handleSelectKpi("billing")}
          onSelectAudit={() => handleSelectKpi("audit")}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "var(--space-4)",
          }}
          className="admin-card-grid"
        >
          <UsersCard users={users} setUsers={setUsers} activeFilter={userFilter} />
          <FeatureFlagsCard flags={flags} setFlags={setFlags} />
          <AuditLogCard />
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
      </div>
    </>
  );
}
