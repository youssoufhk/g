"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Key,
  Shield,
  Camera,
  Bell,
  User,
  Settings,
} from "lucide-react";

import { PageHeader } from "@/components/patterns/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { formatDate } from "@/lib/format";

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

type NotificationPrefId =
  | "ts-approved"
  | "exp-approved"
  | "inv-paid"
  | "weekly-summary"
  | "ai-insights"
  | "team-digest";

type NotificationPref = {
  id: NotificationPrefId;
  enabled: boolean;
};

type Session = {
  id: string;
  device: string;
  deviceIcon: "desktop" | "mobile" | "tablet";
  browser: string;
  location: string;
  lastActiveIso: string | null;
  isCurrent: boolean;
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const INITIAL_PREFS: NotificationPref[] = [
  { id: "ts-approved", enabled: true },
  { id: "exp-approved", enabled: true },
  { id: "inv-paid", enabled: true },
  { id: "weekly-summary", enabled: true },
  { id: "ai-insights", enabled: false },
  { id: "team-digest", enabled: false },
];

const SESSIONS: Session[] = [
  { id: "s1", device: "MacBook Pro", deviceIcon: "desktop", browser: "Chrome 123", location: "Paris, France", lastActiveIso: null, isCurrent: true },
  { id: "s2", device: "iPhone 15", deviceIcon: "mobile", browser: "Safari 17", location: "London, UK", lastActiveIso: "2026-04-18T08:00:00Z", isCurrent: false },
  { id: "s3", device: "iPad", deviceIcon: "tablet", browser: "Chrome 120", location: "Paris, France", lastActiveIso: "2026-04-13T10:00:00Z", isCurrent: false },
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
    case "mobile": return <Smartphone size={size} aria-hidden />;
    case "tablet": return <Tablet size={size} aria-hidden />;
    default: return <Monitor size={size} aria-hidden />;
  }
}

// ---------------------------------------------------------------------------
// Change Password Modal
// ---------------------------------------------------------------------------

function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("account");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    if (!current || !next || !confirm) { setError(t("pwd_error_required")); return; }
    if (next !== confirm) { setError(t("pwd_error_mismatch")); return; }
    if (next.length < 8) { setError(t("pwd_error_length")); return; }
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
    <Modal open={open} onClose={onClose} title={t("pwd_modal_title")} size="sm"
      footer={
        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
          <Button variant="ghost" size="sm" onClick={onClose}>{t("action_cancel")}</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? t("pwd_saving") : t("pwd_save")}
          </Button>
        </div>
      }
    >
      <div aria-busy={saving} aria-live="polite" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div>{label(t("pwd_current"), "pwd-current")}<Input id="pwd-current" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" /></div>
        <div>{label(t("pwd_new"), "pwd-new")}<Input id="pwd-new" type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" /></div>
        <div>
          {label(t("pwd_confirm"), "pwd-confirm")}
          <Input id="pwd-confirm" type="password" value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(null); }} autoComplete="new-password" />
        </div>
        {error && (
          <div role="alert" style={{ fontSize: "var(--text-body-sm)", color: "var(--color-error)", padding: "var(--space-2) var(--space-3)", background: "var(--color-error-muted)", borderRadius: "var(--radius-md)" }}>
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Section heading
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
  const t = useTranslations("account");

  const [form, setForm] = useState<ProfileForm>({
    name: "Youssouf Kerzika",
    email: "youssouf.kerzika@globalg.consulting",
    jobTitle: "Founding Director",
    department: "Leadership",
    timezone: "Europe/Paris",
    language: "en",
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
      <div className="app-aura" aria-hidden>
        <div className="app-aura-accent" />
      </div>

      <ChangePasswordModal open={pwdModalOpen} onClose={() => setPwdModalOpen(false)} />

      <div className="flex flex-col" style={{ gap: "var(--space-6)" }}>
        <PageHeader title={t("page_title")} subtitle={t("page_subtitle")} />

        {/* Profile hero card with gradient stripe */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              height: 4,
              background: "linear-gradient(90deg, var(--color-primary), var(--color-accent))",
            }}
          />
          <div className="card-body">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-5)",
                flexWrap: "wrap",
              }}
            >
              {/* Avatar with photo change overlay */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  backgroundColor: "var(--color-primary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "var(--text-heading-2)", fontWeight: "var(--weight-bold)",
                  color: "var(--color-text-on-primary)",
                }}>
                  {getInitials(form.name)}
                </div>
                <button
                  type="button"
                  onClick={() => { const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.click(); }}
                  title={t("change_photo")}
                  aria-label={t("change_photo")}
                  style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: 24, height: 24, borderRadius: "50%",
                    backgroundColor: "var(--color-surface-0)",
                    border: "1px solid var(--color-border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "var(--color-text-2)",
                  }}
                >
                  <Camera size={11} aria-hidden />
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

              {/* Badges + header actions */}
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexShrink: 0, flexWrap: "wrap" }}>
                <Badge tone="primary">{t("badge_owner")}</Badge>
                <Badge tone="success" dot>{t("badge_active")}</Badge>
                <Button variant="secondary" size="sm" onClick={() => setPwdModalOpen(true)}>
                  {t("hero_change_password")}
                </Button>
                <Button variant="primary" size="sm" onClick={handleSave} disabled={profileSaving}>
                  {profileSaving ? t("profile_saving") : t("profile_save")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--space-5)" }} className="account-grid">

          {/* Profile card - full width */}
          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <div className="card-body" aria-busy={profileSaving} aria-live="polite">
              <SectionHeading icon={<User size={15} aria-hidden />} title={t("profile_title")} description={t("profile_desc")} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--space-4)" }} className="profile-form-grid">
                <div>
                  {label(t("field_name"), "profile-name")}
                  <Input id="profile-name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
                </div>
                <div>
                  {label(t("field_email"), "profile-email", t("field_email_hint"))}
                  <Input id="profile-email" type="email" value={form.email} readOnly style={{ opacity: 0.55, cursor: "not-allowed" }} onChange={() => {}} />
                </div>
                <div>
                  {label(t("field_job_title"), "profile-title")}
                  <Input id="profile-title" value={form.jobTitle} onChange={(e) => handleChange("jobTitle", e.target.value)} />
                </div>
                <div>
                  {label(t("field_department"), "profile-dept")}
                  <Input id="profile-dept" value={form.department} onChange={(e) => handleChange("department", e.target.value)} />
                </div>
                <div>
                  {label(t("field_timezone"), "profile-tz")}
                  <Select id="profile-tz" value={form.timezone} onChange={(e) => handleChange("timezone", e.target.value)}>
                    <option value="Europe/Paris">{t("tz_paris")}</option>
                    <option value="Europe/London">{t("tz_london")}</option>
                    <option value="America/New_York">{t("tz_new_york")}</option>
                    <option value="Asia/Tokyo">{t("tz_tokyo")}</option>
                  </Select>
                </div>
                <div>
                  {label(t("field_language"), "profile-lang")}
                  <Select id="profile-lang" value={form.language} onChange={(e) => handleChange("language", e.target.value)}>
                    <option value="en">{t("lang_en")}</option>
                    <option value="fr">{t("lang_fr")}</option>
                  </Select>
                </div>
              </div>
              <div style={{ paddingTop: "var(--space-5)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "var(--space-3)", borderTop: "1px solid var(--color-border)", marginTop: "var(--space-5)" }}>
                {profileSaved && <span style={{ fontSize: "var(--text-body-sm)", color: "var(--color-success)" }}>{t("profile_saved")}</span>}
                <Button variant="primary" size="sm" onClick={handleSave} disabled={profileSaving}>
                  {profileSaving ? t("profile_saving") : t("profile_save")}
                </Button>
              </div>
            </div>
          </div>

          {/* Security card */}
          <div className="card">
            <div className="card-body" aria-busy={mfaToggling} aria-live="polite">
              <SectionHeading icon={<Key size={15} aria-hidden />} title={t("security_title")} description={t("security_desc")} />

              {/* Password row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "var(--space-4)", borderBottom: "1px solid var(--color-border)", gap: "var(--space-4)" }}>
                <div>
                  <div style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-1)" }}>{t("security_password")}</div>
                  <div style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)", marginTop: 2 }}>{t("security_password_age", { days: 30 })}</div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setPwdModalOpen(true)}>{t("security_change")}</Button>
              </div>

              {/* 2FA row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "var(--space-4)", gap: "var(--space-4)" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    <Shield size={14} style={{ color: "var(--color-text-3)" }} aria-hidden />
                    <span style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-1)" }}>{t("security_mfa")}</span>
                    <Badge tone={mfaEnabled ? "success" : "default"}>{mfaEnabled ? t("security_mfa_on") : t("security_mfa_off")}</Badge>
                  </div>
                  <div style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)", marginTop: 2 }}>
                    {mfaEnabled ? t("security_mfa_on_hint") : t("security_mfa_off_hint")}
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={handleToggleMfa} disabled={mfaToggling}>
                  {mfaToggling ? (mfaEnabled ? t("security_disabling") : t("security_enabling")) : (mfaEnabled ? t("security_disable") : t("security_enable"))}
                </Button>
              </div>
            </div>
          </div>

          {/* Active sessions card (preferences slot: sessions) */}
          <div className="card">
            <div className="card-body" style={{ paddingBottom: 0 }}>
              <SectionHeading icon={<Settings size={15} aria-hidden />} title={t("sessions_title")} description={t("sessions_desc")} />
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
                        {session.isCurrent && <Badge tone="success" dot>{t("session_now")}</Badge>}
                      </div>
                      <div style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)", display: "flex", alignItems: "center", gap: "var(--space-1)", fontVariantNumeric: "tabular-nums" }}>
                        <Globe size={10} aria-hidden />
                        {session.browser} &middot; {session.location}
                        {!session.isCurrent && session.lastActiveIso && (
                          <span style={{ marginLeft: "var(--space-1)" }}>&middot; {formatDate(session.lastActiveIso)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <Button variant="ghost" size="sm" onClick={() => setSessions((prev) => prev.filter((s) => s.id !== session.id))}>
                      {t("session_revoke")}
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div style={{ padding: "var(--space-3) var(--space-5)", borderTop: "1px solid var(--color-border)" }}>
              <Button variant="ghost" size="sm" onClick={() => setSessions((prev) => prev.filter((s) => s.isCurrent))}>
                {t("session_revoke_all")}
              </Button>
            </div>
          </div>

          {/* Notifications card - full width */}
          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <div className="card-body" style={{ paddingBottom: "var(--space-4)" }}>
              <SectionHeading icon={<Bell size={15} aria-hidden />} title={t("notifications_title")} description={t("notifications_desc")} />
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
                    <div style={{ fontSize: "var(--text-body-sm)", fontWeight: "var(--weight-medium)", color: "var(--color-text-1)" }}>{t(`pref_${pref.id}_label`)}</div>
                    <div style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)", marginTop: 2 }}>{t(`pref_${pref.id}_desc`)}</div>
                  </div>
                  <Toggle checked={pref.enabled} onCheckedChange={() => setPrefs((prev) => prev.map((p) => p.id === pref.id ? { ...p, enabled: !p.enabled } : p))} label={t(`pref_${pref.id}_label`)} />
                </div>
              ))}
            </div>
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
