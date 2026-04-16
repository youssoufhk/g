"use client";

import { useState } from "react";
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Key,
  Bell,
  Shield,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/patterns/page-header";
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ProfileForm = {
  name: string;
  email: string;
  jobTitle: string;
  timezone: string;
  language: string;
};

type NotificationPref = {
  id: string;
  label: string;
  enabled: boolean;
};

type Session = {
  id: string;
  device: string;
  deviceIcon: "desktop" | "mobile" | "tablet";
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const INITIAL_PREFS: NotificationPref[] = [
  { id: "ts-approved", label: "Email me when a timesheet is approved", enabled: true },
  { id: "exp-approved", label: "Email me when an expense is approved", enabled: true },
  { id: "inv-paid", label: "Email me when an invoice is paid", enabled: true },
  { id: "weekly-summary", label: "Weekly summary email every Monday", enabled: true },
  { id: "ai-insights", label: "AI insight alerts", enabled: false },
  { id: "team-digest", label: "Team activity digest", enabled: false },
];

const SESSIONS: Session[] = [
  {
    id: "s1",
    device: "MacBook Pro",
    deviceIcon: "desktop",
    browser: "Chrome 123",
    location: "Paris, France",
    lastActive: "Active now",
    isCurrent: true,
  },
  {
    id: "s2",
    device: "iPhone 15",
    deviceIcon: "mobile",
    browser: "Safari 17",
    location: "London, UK",
    lastActive: "2 hours ago",
    isCurrent: false,
  },
  {
    id: "s3",
    device: "iPad",
    deviceIcon: "tablet",
    browser: "Chrome 120",
    location: "Paris, France",
    lastActive: "5 days ago",
    isCurrent: false,
  },
];

// ---------------------------------------------------------------------------
// Change Password Modal
// ---------------------------------------------------------------------------

function ChangePasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  function handleSave() {
    console.log("Password change submitted");
    setCurrent("");
    setNext("");
    setConfirm("");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change password"
      size="sm"
      footer={
        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Save password
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div>
          <label
            htmlFor="pwd-current"
            className="text-2"
            style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)" }}
          >
            Current password
          </label>
          <Input
            id="pwd-current"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div>
          <label
            htmlFor="pwd-new"
            className="text-2"
            style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)" }}
          >
            New password
          </label>
          <Input
            id="pwd-new"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label
            htmlFor="pwd-confirm"
            className="text-2"
            style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)" }}
          >
            Confirm new password
          </label>
          <Input
            id="pwd-confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Profile tab
// ---------------------------------------------------------------------------

function ProfileTab() {
  const [form, setForm] = useState<ProfileForm>({
    name: "Youssouf Hassan",
    email: "youssouf@globalid.uk",
    jobTitle: "Founder & CEO",
    timezone: "Europe/Paris",
    language: "English",
  });

  function handleChange(field: keyof ProfileForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    console.log("Profile saved:", form);
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        gap: "var(--space-8)",
        alignItems: "start",
      }}
    >
      {/* Left: avatar block */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-3)",
          textAlign: "center",
        }}
      >
        <Avatar name={form.name} colorIndex={0} size="xl" />
        <Button variant="ghost" size="sm">
          Change photo
        </Button>
        <div>
          <h2
            className="text-1"
            style={{ fontWeight: "var(--weight-semibold)", fontSize: "var(--text-heading-3)", margin: 0 }}
          >
            {form.name}
          </h2>
          <div className="text-3" style={{ fontSize: "var(--text-body-sm)", marginTop: "var(--space-1)" }}>
            Owner
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Profile details</span>
        </div>
        <div className="card-body">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div>
              <label
                htmlFor="profile-name"
                className="text-2"
                style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)" }}
              >
                Full name
              </label>
              <Input
                id="profile-name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="profile-email"
                className="text-2"
                style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)" }}
              >
                Email address
              </label>
              <Input
                id="profile-email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="profile-title"
                className="text-2"
                style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)" }}
              >
                Job title
              </label>
              <Input
                id="profile-title"
                value={form.jobTitle}
                onChange={(e) => handleChange("jobTitle", e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="profile-timezone"
                className="text-2"
                style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)" }}
              >
                Timezone
              </label>
              <Select
                id="profile-timezone"
                value={form.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
              >
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
              </Select>
            </div>

            <div>
              <label
                htmlFor="profile-language"
                className="text-2"
                style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)" }}
              >
                Language
              </label>
              <Select
                id="profile-language"
                value={form.language}
                onChange={(e) => handleChange("language", e.target.value)}
              >
                <option value="English">English</option>
                <option value="French">French</option>
              </Select>
            </div>

            <div style={{ paddingTop: "var(--space-2)" }}>
              <Button variant="primary" size="sm" onClick={handleSave}>
                Save changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Security tab
// ---------------------------------------------------------------------------

function SecurityTab() {
  const [pwdModalOpen, setPwdModalOpen] = useState(false);

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", maxWidth: 560 }}>

        {/* Password card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <Key size={16} className="text-3" />
              <span className="card-title" style={{ margin: 0 }}>Password</span>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-4)" }}>
              <span className="text-3" style={{ fontSize: "var(--text-body-sm)" }}>
                Last changed 30 days ago
              </span>
              <Button variant="secondary" size="sm" onClick={() => setPwdModalOpen(true)}>
                Change password
              </Button>
            </div>
          </div>
        </div>

        {/* 2FA card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <Shield size={16} className="text-3" />
              <span className="card-title" style={{ margin: 0 }}>Two-factor authentication</span>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-4)" }}>
              <Badge tone="default">Inactive</Badge>
              <Button variant="secondary" size="sm">
                Enable 2FA
              </Button>
            </div>
          </div>
        </div>

        {/* Active sessions card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <Monitor size={16} className="text-3" />
              <span className="card-title" style={{ margin: 0 }}>Active sessions</span>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[
                { label: "This device", detail: "Chrome / Mac - Paris", active: true },
                { label: "iPhone", detail: "Safari - London", active: false, lastSeen: "2h ago" },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "var(--space-4) var(--space-5)",
                    borderBottom: i === 0 ? "1px solid var(--color-border)" : undefined,
                    gap: "var(--space-4)",
                  }}
                >
                  <div>
                    <div className="text-1" style={{ fontWeight: "var(--weight-medium)", fontSize: "var(--text-body-sm)" }}>
                      {s.label}
                    </div>
                    <div className="text-3" style={{ fontSize: "var(--text-caption)" }}>
                      {s.detail} {s.active ? (
                        <Badge tone="success" dot>Active now</Badge>
                      ) : (
                        <span>- {s.lastSeen}</span>
                      )}
                    </div>
                  </div>
                  {!s.active && (
                    <Button variant="ghost" size="sm">
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal open={pwdModalOpen} onClose={() => setPwdModalOpen(false)} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Notifications tab
// ---------------------------------------------------------------------------

function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotificationPref[]>(INITIAL_PREFS);

  function toggle(id: string) {
    setPrefs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", maxWidth: 560 }}>
      {prefs.map((pref) => (
        <div
          key={pref.id}
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
          <span
            className="text-2"
            style={{ fontSize: "var(--text-body-sm)" }}
          >
            {pref.label}
          </span>
          <Toggle
            checked={pref.enabled}
            onCheckedChange={() => toggle(pref.id)}
            label={pref.label}
          />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sessions tab
// ---------------------------------------------------------------------------

function DeviceIcon({ type }: { type: Session["deviceIcon"] }) {
  const size = 16;
  switch (type) {
    case "mobile":
      return <Smartphone size={size} />;
    case "tablet":
      return <Tablet size={size} />;
    default:
      return <Monitor size={size} />;
  }
}

function SessionsTab() {
  const [sessions, setSessions] = useState<Session[]>(SESSIONS);

  function revoke(id: string) {
    console.log("Revoke session:", id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  function revokeAll() {
    console.log("Revoke all other sessions");
    setSessions((prev) => prev.filter((s) => s.isCurrent));
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <DataTableWrapper>
        <Table>
          <THead>
            <TR>
              <TH>Device</TH>
              <TH>Browser</TH>
              <TH>Location</TH>
              <TH>Last active</TH>
              <TH style={{ width: 80 }} />
            </TR>
          </THead>
          <TBody>
            {sessions.map((session) => (
              <TR key={session.id}>
                <TD>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", color: "var(--color-text-3)" }}>
                    <DeviceIcon type={session.deviceIcon} />
                    <span className="text-1" style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-1)" }}>
                      {session.device}
                    </span>
                  </div>
                </TD>
                <TD muted style={{ fontSize: "var(--text-body-sm)" }}>
                  {session.browser}
                </TD>
                <TD muted style={{ fontSize: "var(--text-body-sm)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    <Globe size={12} />
                    {session.location}
                  </div>
                </TD>
                <TD muted style={{ fontSize: "var(--text-body-sm)" }}>
                  {session.isCurrent ? (
                    <Badge tone="success" dot>Active now</Badge>
                  ) : (
                    session.lastActive
                  )}
                </TD>
                <TD style={{ width: 80 }}>
                  {!session.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revoke(session.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </DataTableWrapper>

      <div style={{ marginTop: "var(--space-4)" }}>
        <Button variant="secondary" size="sm" onClick={revokeAll}>
          Revoke all other sessions
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AccountPage() {
  return (
    <>
      <PageHeader title="Account" />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div style={{ paddingTop: "var(--space-5)" }}>
            <ProfileTab />
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div style={{ paddingTop: "var(--space-5)" }}>
            <SecurityTab />
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div style={{ paddingTop: "var(--space-5)" }}>
            <NotificationsTab />
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <div style={{ paddingTop: "var(--space-5)" }}>
            <SessionsTab />
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
