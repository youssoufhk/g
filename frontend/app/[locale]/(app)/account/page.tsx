"use client";

import { useState } from "react";
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Key,
  Shield,
  Camera,
  Bell,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ProfileForm = {
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  timezone: string;
  language: string;
};

type NotificationPref = {
  id: string;
  label: string;
  description: string;
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
  { id: "ts-approved", label: "Timesheet approved", description: "When your timesheet is approved or rejected", enabled: true },
  { id: "exp-approved", label: "Expense approved", description: "When an expense claim is approved or rejected", enabled: true },
  { id: "inv-paid", label: "Invoice paid", description: "When a client invoice is marked as paid", enabled: true },
  { id: "weekly-summary", label: "Weekly summary", description: "Monday morning digest of last week", enabled: true },
  { id: "ai-insights", label: "AI insights", description: "Anomaly alerts from the AI agent", enabled: false },
  { id: "team-digest", label: "Team digest", description: "Daily activity summary from your team", enabled: false },
];

const SESSIONS: Session[] = [
  { id: "s1", device: "MacBook Pro", deviceIcon: "desktop", browser: "Chrome 123", location: "Paris, France", lastActive: "Active now", isCurrent: true },
  { id: "s2", device: "iPhone 15", deviceIcon: "mobile", browser: "Safari 17", location: "London, UK", lastActive: "2 hours ago", isCurrent: false },
  { id: "s3", device: "iPad", deviceIcon: "tablet", browser: "Chrome 120", location: "Paris, France", lastActive: "5 days ago", isCurrent: false },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return (parts[0] ?? "").slice(0, 2).toUpperCase();
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

function DeviceIcon({ type }: { type: Session["deviceIcon"] }) {
  const size = 15;
  switch (type) {
    case "mobile": return <Smartphone size={size} />;
    case "tablet": return <Tablet size={size} />;
    default: return <Monitor size={size} />;
  }
}

// ---------------------------------------------------------------------------
// Change Password Modal
// ---------------------------------------------------------------------------

function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    if (!current || !next || !confirm) { setError("All fields are required."); return; }
    if (next !== confirm) { setError("New passwords do not match."); return; }
    if (next.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError(null);
    setSaving(true);
    setTimeout(() => { setSaving(false); setCurrent(""); setNext(""); setConfirm(""); onClose(); }, 800);
  }

  const label = (text: string, htmlFor: string) => (
    <label htmlFor={htmlFor} style={{ display: "block", marginBottom: "var(--space-2)", fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}>
      {text}
    </label>
  );

  return (
    <Modal open={open} onClose={onClose} title="Change password" size="sm"
      footer={
        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save password"}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div>{label("Current password", "pwd-current")}<Input id="pwd-current" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" /></div>
        <div>{label("New password", "pwd-new")}<Input id="pwd-new" type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" /></div>
        <div>
          {label("Confirm new password", "pwd-confirm")}
          <Input id="pwd-confirm" type="password" value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(null); }} autoComplete="new-password" />
        </div>
        {error && (
          <div style={{ fontSize: "var(--text-body-sm)", color: "var(--color-error)", padding: "var(--space-2) var(--space-3)", background: "var(--color-error-muted)", borderRadius: "var(--radius-md)" }}>
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Section heading (shared across all setting sections)
// ---------------------------------------------------------------------------

function SectionHeading({ icon, title, description }: { icon: React.ReactNode; title: string; description?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
      <div style={{
        width: 32, height: 32, borderRadius: "var(--radius-md)",
        backgroundColor: "var(--color-surface-2)", display: "flex", alignItems: "center",
        justifyContent: "center", flexShrink: 0, color: "var(--color-text-2)",
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: "var(--weight-semibold)", fontSize: "var(--text-body-sm)", color: "var(--color-text-1)" }}>
          {title}
        </div>
        {description && (
          <div style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)", marginTop: 2 }}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AccountPage() {
  const [form, setForm] = useState<ProfileForm>({
    name: "Youssouf Kerzika",
    email: "youssouf.kerzika@globalg.consulting",
    jobTitle: "Founding Director",
    department: "Leadership",
    timezone: "Europe/Paris",
    language: "English",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaToggling, setMfaToggling] = useState(false);

  const [sessions, setSessions] = useState<Session[]>(SESSIONS);
  const [prefs, setPrefs] = useState<NotificationPref[]>(INITIAL_PREFS);

  function handleChange(field: keyof ProfileForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setProfileSaved(false);
  }

  function handleSave() {
    setProfileSaving(true);
    setTimeout(() => { setProfileSaving(false); setProfileSaved(true); }, 800);
  }

  function handleToggleMfa() {
    setMfaToggling(true);
    setTimeout(() => { setMfaToggling(false); setMfaEnabled((v) => !v); }, 800);
  }

  const label = (text: string, htmlFor: string, hint?: string) => (
    <div style={{ marginBottom: "var(--space-2)" }}>
      <label htmlFor={htmlFor} style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-2)" }}>
        {text}
      </label>
      {hint && <span style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)", marginLeft: "var(--space-2)" }}>{hint}</span>}
    </div>
  );

  return (
    <>
      <ChangePasswordModal open={pwdModalOpen} onClose={() => setPwdModalOpen(false)} />

      {/* Profile identity hero - part of the page, not a card */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-5)",
        padding: "var(--space-6) 0 var(--space-6)",
        borderBottom: "1px solid var(--color-border)",
        marginBottom: "var(--space-6)",
        flexWrap: "wrap",
      }}>
        {/* Avatar with photo change overlay */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            backgroundColor: "var(--color-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "var(--text-heading-2)", fontWeight: "bold", color: "#fff",
          }}>
            {getInitials(form.name)}
          </div>
          <button
            onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.click(); }}
            title="Change photo"
            style={{
              position: "absolute", bottom: 0, right: 0,
              width: 24, height: 24, borderRadius: "50%",
              backgroundColor: "var(--color-surface-0)",
              border: "2px solid var(--color-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--color-text-2)",
            }}
          >
            <Camera size={11} />
          </button>
        </div>

        {/* Identity text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "var(--text-heading-2)", fontWeight: "var(--weight-bold)", color: "var(--color-text-1)", lineHeight: 1.2 }}>
            {form.name}
          </div>
          <div style={{ fontSize: "var(--text-body-sm)", color: "var(--color-text-3)", marginTop: "var(--space-1)" }}>
            {form.jobTitle}
            {form.department ? <span style={{ color: "var(--color-text-3)" }}> &middot; {form.department}</span> : null}
          </div>
          <div style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)", marginTop: "var(--space-1)" }}>
            {form.email}
          </div>
        </div>

        {/* Role badge + owner pill */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexShrink: 0 }}>
          <Badge tone="primary">Owner</Badge>
          <Badge tone="success" dot>Active</Badge>
        </div>
      </div>

      {/* Settings cards - 2 column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--space-5)" }} className="account-grid">

        {/* Profile card - full width */}
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="card-body">
            <SectionHeading icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>} title="Profile" description="Your name, title, and regional preferences" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--space-4)" }} className="profile-form-grid">
              <div>
                {label("Full name", "profile-name")}
                <Input id="profile-name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
              </div>
              <div>
                {label("Email address", "profile-email", "Contact support to change")}
                <Input id="profile-email" type="email" value={form.email} readOnly style={{ opacity: 0.55, cursor: "not-allowed" }} onChange={() => {}} />
              </div>
              <div>
                {label("Job title", "profile-title")}
                <Input id="profile-title" value={form.jobTitle} onChange={(e) => handleChange("jobTitle", e.target.value)} />
              </div>
              <div>
                {label("Department", "profile-dept")}
                <Input id="profile-dept" value={form.department} onChange={(e) => handleChange("department", e.target.value)} />
              </div>
              <div>
                {label("Timezone", "profile-tz")}
                <Select id="profile-tz" value={form.timezone} onChange={(e) => handleChange("timezone", e.target.value)}>
                  <option value="Europe/Paris">Europe/Paris (CET)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="America/New_York">America/New_York (ET)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                </Select>
              </div>
              <div>
                {label("Language", "profile-lang")}
                <Select id="profile-lang" value={form.language} onChange={(e) => handleChange("language", e.target.value)}>
                  <option value="English">English</option>
                  <option value="French">French</option>
                </Select>
              </div>
            </div>
            <div style={{ paddingTop: "var(--space-5)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "var(--space-3)", borderTop: "1px solid var(--color-border)", marginTop: "var(--space-5)" }}>
              {profileSaved && <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-success)" }}>Saved</span>}
              <Button variant="primary" size="sm" onClick={handleSave} disabled={profileSaving}>
                {profileSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </div>

        {/* Security card */}
        <div className="card">
          <div className="card-body">
            <SectionHeading icon={<Key size={15} />} title="Security" description="Password and two-factor authentication" />

            {/* Password row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "var(--space-4)", borderBottom: "1px solid var(--color-border)", gap: "var(--space-4)" }}>
              <div>
                <div style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-1)" }}>Password</div>
                <div style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)", marginTop: 2 }}>Last changed 30 days ago</div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setPwdModalOpen(true)}>Change</Button>
            </div>

            {/* 2FA row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "var(--space-4)", gap: "var(--space-4)" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <Shield size={14} style={{ color: "var(--color-text-3)" }} />
                  <span style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-1)" }}>Two-factor auth</span>
                  <Badge tone={mfaEnabled ? "success" : "default"}>{mfaEnabled ? "On" : "Off"}</Badge>
                </div>
                <div style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)", marginTop: 2 }}>
                  {mfaEnabled ? "Your account is protected with 2FA." : "Add a second layer of protection."}
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={handleToggleMfa} disabled={mfaToggling}>
                {mfaToggling ? (mfaEnabled ? "Disabling..." : "Enabling...") : (mfaEnabled ? "Disable" : "Enable")}
              </Button>
            </div>
          </div>
        </div>

        {/* Active sessions card */}
        <div className="card">
          <div className="card-body" style={{ paddingBottom: 0 }}>
            <SectionHeading icon={<Monitor size={15} />} title="Active sessions" description="Devices currently signed in to your account" />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {sessions.map((session, i) => (
              <div key={session.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "var(--space-3) var(--space-5)",
                borderTop: i === 0 ? "none" : "1px solid var(--color-border)",
                gap: "var(--space-4)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                  <span style={{ color: "var(--color-text-3)" }}><DeviceIcon type={session.deviceIcon} /></span>
                  <div>
                    <div style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-1)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                      {session.device}
                      {session.isCurrent && <Badge tone="success" dot>Now</Badge>}
                    </div>
                    <div style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)", display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                      <Globe size={10} />
                      {session.browser} &middot; {session.location}
                      {!session.isCurrent && <span style={{ marginLeft: "var(--space-1)" }}>&middot; {session.lastActive}</span>}
                    </div>
                  </div>
                </div>
                {!session.isCurrent && (
                  <Button variant="ghost" size="sm" onClick={() => setSessions((prev) => prev.filter((s) => s.id !== session.id))}>
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div style={{ padding: "var(--space-3) var(--space-5)", borderTop: "1px solid var(--color-border)" }}>
            <Button variant="ghost" size="sm" onClick={() => setSessions((prev) => prev.filter((s) => s.isCurrent))}>
              Revoke all other sessions
            </Button>
          </div>
        </div>

        {/* Notifications card - full width */}
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="card-body" style={{ paddingBottom: "var(--space-4)" }}>
            <SectionHeading icon={<Bell size={15} />} title="Notifications" description="Choose which emails Gamma sends you" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 0, borderTop: "1px solid var(--color-border)" }} className="notif-grid">
            {prefs.map((pref, i) => (
              <div
                key={pref.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "var(--space-4) var(--space-5)", gap: "var(--space-4)",
                  borderBottom: i < prefs.length - 2 ? "1px solid var(--color-border)" : undefined,
                  borderRight: i % 2 === 0 ? "1px solid var(--color-border)" : undefined,
                }}
              >
                <div>
                  <div style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-1)" }}>{pref.label}</div>
                  <div style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)", marginTop: 2 }}>{pref.description}</div>
                </div>
                <Toggle checked={pref.enabled} onCheckedChange={() => setPrefs((prev) => prev.map((p) => p.id === pref.id ? { ...p, enabled: !p.enabled } : p))} label={pref.label} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .account-grid { grid-template-columns: 1fr !important; }
          .account-grid > * { grid-column: 1 !important; }
          .profile-form-grid { grid-template-columns: 1fr !important; }
          .notif-grid { grid-template-columns: 1fr !important; }
          .notif-grid > * { border-right: none !important; }
        }
      `}</style>
    </>
  );
}
