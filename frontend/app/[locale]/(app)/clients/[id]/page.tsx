"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { DetailHeaderBar } from "@/components/patterns/detail-header-bar";
import { CLIENTS } from "@/lib/mock-data";
import {
  Building2,
  Calendar,
  FolderKanban,
  Globe,
  Mail,
  Users,
  FileText,
  Receipt,
} from "lucide-react";

import { StatPill } from "@/components/patterns/stat-pill";
import { EmptyState } from "@/components/patterns/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useClient } from "@/features/clients/use-clients";
import type { Client } from "@/features/clients/types";
import { formatCurrencyCompact, formatDate } from "@/lib/format";

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusTone(status: Client["status"]): "success" | "default" | "warning" {
  if (status === "active") return "success";
  if (status === "prospect") return "warning";
  return "default";
}

function currencyTone(currency: Client["currency"]): "gold" | "info" | "default" {
  if (currency === "GBP") return "gold";
  if (currency === "EUR") return "info";
  return "default";
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }} aria-hidden="true">
      <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-5)" }}>
        <Skeleton variant="avatar" width={80} height={80} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <Skeleton variant="title" width={240} />
          <Skeleton variant="text" width={160} />
          <Skeleton variant="text" width={120} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-4)" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="card" height={80} />
        ))}
      </div>
    </div>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────

function OverviewTab({ client }: { client: Client }) {
  const t = useTranslations("clients");
  const hasProjects = client.active_projects > 0;
  const hasContacts = (client.contacts ?? []).length > 0;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "var(--space-6)",
        alignItems: "start",
      }}
      className="overview-grid"
    >
      {/* Active projects */}
      <Card>
        <CardHeader>
          <CardTitle>{t("overview_active_projects_title")}</CardTitle>
        </CardHeader>
        <CardBody>
          {!hasProjects ? (
            <EmptyState
              icon={FolderKanban}
              title={t("overview_no_projects_title")}
              description={t("overview_no_projects_desc")}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <Link
                href="/projects"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  padding: "var(--space-4)",
                  background: "var(--color-surface-1)",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <FolderKanban size={16} style={{ color: "var(--color-primary)", flexShrink: 0 }} aria-hidden />
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontWeight: "var(--weight-medium)",
                      fontSize: "var(--text-body-sm)",
                      color: "var(--color-text-1)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {t("overview_projects_summary", { count: client.active_projects })}
                  </span>
                  <div style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)", marginTop: 2 }}>
                    {t("overview_projects_hint")}
                  </div>
                </div>
                <Badge tone="success">
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>{client.active_projects}</span>
                </Badge>
              </Link>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>{t("overview_contacts_title")}</CardTitle>
        </CardHeader>
        <CardBody>
          {!hasContacts ? (
            <EmptyState
              icon={Users}
              title={t("overview_no_contacts_title")}
              description={t("overview_no_contacts_desc")}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {(client.contacts ?? []).map((contact, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-3)",
                    padding: "var(--space-3)",
                    background: "var(--color-surface-1)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border-subtle)",
                  }}
                >
                  <Avatar name={contact.name} size="sm" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "var(--weight-semibold)", fontSize: "var(--text-body)", color: "var(--color-text-1)" }}>
                      {contact.name}
                    </div>
                    <div style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)" }}>
                      {contact.role}
                    </div>
                  </div>
                  <a
                    href={`mailto:${contact.email}`}
                    style={{ color: "var(--color-primary)", fontSize: "var(--text-body-sm)", textDecoration: "none", display: "flex", alignItems: "center", gap: "var(--space-1)" }}
                  >
                    <Mail size={14} aria-hidden />
                    {contact.email}
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Notes */}
      {client.notes && (
        <Card style={{ gridColumn: "1 / -1" }}>
          <CardHeader>
            <CardTitle>{t("overview_notes_title")}</CardTitle>
          </CardHeader>
          <CardBody>
            <p style={{ fontSize: "var(--text-body)", color: "var(--color-text-2)", lineHeight: 1.6 }}>
              {client.notes}
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

// ── Placeholder tab ───────────────────────────────────────────────────────────

function PlaceholderTab({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
}) {
  return <EmptyState icon={Icon} title={title} description={description} />;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("clients");
  const { data: client, isLoading, error } = useClient(id);
  const siblings = useMemo(() => {
    const idx = CLIENTS.findIndex((c) => c.id === id);
    if (idx === -1) return { idx: -1, total: CLIENTS.length, prev: null, next: null };
    return {
      idx,
      total: CLIENTS.length,
      prev: idx > 0 ? CLIENTS[idx - 1]?.id ?? null : null,
      next: idx < CLIENTS.length - 1 ? CLIENTS[idx + 1]?.id ?? null : null,
    };
  }, [id]);
  const headerBar = (
    <DetailHeaderBar
      backHref="/clients"
      backLabel={t("detail_back")}
      title={client?.name ?? ""}
      prevHref={siblings.prev ? `/clients/${siblings.prev}` : null}
      nextHref={siblings.next ? `/clients/${siblings.next}` : null}
      prevLabel={t("detail_prev")}
      nextLabel={t("detail_next")}
      position={siblings.idx >= 0 ? siblings.idx + 1 : null}
      total={siblings.total}
      positionLabel={(p, total) => t("detail_position", { position: p, total })}
    />
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceDesc, setInvoiceDesc] = useState("");
  const [invoiceSaving, setInvoiceSaving] = useState(false);

  function openEdit() {
    setEditName(client?.name ?? "");
    setEditIndustry(client?.industry ?? "");
    setShowEditModal(true);
  }

  function handleEditSave() {
    setEditSaving(true);
    setTimeout(() => { setEditSaving(false); setShowEditModal(false); }, 800);
  }

  function handleInvoiceSave() {
    if (!invoiceAmount.trim()) return;
    setInvoiceSaving(true);
    setTimeout(() => {
      setInvoiceSaving(false);
      setShowInvoiceModal(false);
      setInvoiceAmount("");
      setInvoiceDesc("");
    }, 800);
  }

  const statusLabelKey = (status: Client["status"]): string => {
    if (status === "active") return t("status_active");
    if (status === "inactive") return t("status_inactive");
    return t("status_prospect");
  };

  if (isLoading) {
    return (
      <>
        <div className="app-aura" aria-hidden>
          <div className="app-aura-accent" />
        </div>
        <div
          aria-busy="true"
          aria-live="polite"
          style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}
        >
          {headerBar}
          <ProfileSkeleton />
        </div>
      </>
    );
  }

  if (error || !client) {
    return (
      <>
        <div className="app-aura" aria-hidden>
          <div className="app-aura-accent" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {headerBar}
          <EmptyState
            icon={Building2}
            title={t("not_found_title")}
            description={t("not_found_desc")}
            action={
              <Link href="/clients">
                <Button variant="secondary" size="sm">{t("not_found_action")}</Button>
              </Link>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="app-aura" aria-hidden>
        <div className="app-aura-accent" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        {headerBar}

      {/* Hero card */}
      <div
        style={{
          background: "var(--color-surface-0)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
      >
        {/* Top gradient stripe */}
        <div
          style={{
            height: 4,
            background: "linear-gradient(90deg, var(--color-primary), var(--color-accent))",
          }}
        />

        <div style={{ padding: "var(--space-6)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-5)", flexWrap: "wrap" }}>
            {/* Logo avatar */}
            <Avatar
              name={client.name}
              colorIndex={client.logo_color_index}
              size="2xl"
            />

            {/* Main info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1
                style={{
                  fontSize: "var(--text-display-lg)",
                  fontWeight: "var(--weight-bold)",
                  color: "var(--color-text-1)",
                  marginBottom: "var(--space-2)",
                  lineHeight: 1.2,
                }}
              >
                {client.name}
              </h1>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-4)",
                  flexWrap: "wrap",
                  fontSize: "var(--text-body)",
                  color: "var(--color-text-2)",
                  marginBottom: "var(--space-4)",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                  <Building2 size={16} style={{ color: "var(--color-text-3)" }} aria-hidden />
                  {client.industry}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                  <Globe size={16} style={{ color: "var(--color-text-3)" }} aria-hidden />
                  {client.country}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                  <Calendar size={16} style={{ color: "var(--color-text-3)" }} aria-hidden />
                  {t("detail_client_since", { date: formatDate(client.since_date, "medium") })}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
                <Badge tone={statusTone(client.status)} dot>{statusLabelKey(client.status)}</Badge>
                <Badge tone={currencyTone(client.currency)}>{client.currency}</Badge>
                {client.team_size > 0 && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "var(--space-1)",
                      fontSize: "var(--text-body-sm)",
                      color: "var(--color-text-3)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    <Users size={14} aria-hidden />
                    {t("detail_team_members", { count: client.team_size })}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "var(--space-2)", flexShrink: 0 }}>
              <Button variant="secondary" size="sm" onClick={openEdit}>{t("detail_edit")}</Button>
              <Button variant="primary" size="sm" leadingIcon={<Receipt size={14} aria-hidden />} onClick={() => setShowInvoiceModal(true)}>
                {t("detail_new_invoice")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "var(--space-4)",
        }}
        className="kpi-strip"
      >
        <StatPill
          label={t("kpi_active_projects")}
          value={<span style={{ fontVariantNumeric: "tabular-nums" }}>{client.active_projects}</span>}
          secondary={t("kpi_active_projects_secondary", { total: client.total_projects })}
          accent="primary"
        />
        <StatPill
          label={t("kpi_revenue_ytd")}
          value={
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              {client.revenue_ytd > 0 ? formatCurrencyCompact(client.revenue_ytd, client.currency) : "-"}
            </span>
          }
          accent="gold"
        />
        <StatPill
          label={t("kpi_open_invoices")}
          value="-"
          accent="warning"
        />
        <StatPill
          label={t("kpi_team_members")}
          value={<span style={{ fontVariantNumeric: "tabular-nums" }}>{client.team_size}</span>}
          accent="info"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("tab_overview")}</TabsTrigger>
          <TabsTrigger value="projects" count={client.total_projects}>{t("tab_projects")}</TabsTrigger>
          <TabsTrigger value="invoices">{t("tab_invoices")}</TabsTrigger>
          <TabsTrigger value="team" count={client.team_size}>{t("tab_team")}</TabsTrigger>
          <TabsTrigger value="documents">{t("tab_documents")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab client={client} />
        </TabsContent>

        <TabsContent value="projects">
          <PlaceholderTab icon={FolderKanban} title={t("placeholder_projects_title")} description={t("placeholder_projects_desc")} />
        </TabsContent>

        <TabsContent value="invoices">
          <PlaceholderTab icon={Receipt} title={t("placeholder_invoices_title")} description={t("placeholder_invoices_desc")} />
        </TabsContent>

        <TabsContent value="team">
          <PlaceholderTab icon={Users} title={t("placeholder_team_title")} description={t("placeholder_team_desc")} />
        </TabsContent>

        <TabsContent value="documents">
          <PlaceholderTab icon={FileText} title={t("placeholder_documents_title")} description={t("placeholder_documents_desc")} />
        </TabsContent>
      </Tabs>

      {/* Responsive grid adjustment for narrow screens */}
      <style>{`
        @media (max-width: 767px) {
          .overview-grid {
            grid-template-columns: 1fr !important;
          }
          .kpi-strip {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 479px) {
          .kpi-strip {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={t("edit_modal_title")}
        footer={
          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
            <Button variant="secondary" size="sm" onClick={() => setShowEditModal(false)}>{t("edit_cancel")}</Button>
            <Button variant="primary" size="sm" onClick={handleEditSave} disabled={editSaving}>
              {editSaving ? t("edit_saving") : t("edit_save")}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label className="form-label" htmlFor="edit-client-name">{t("edit_field_name")}</label>
            <Input id="edit-client-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <div>
            <label className="form-label" htmlFor="edit-client-industry">{t("edit_field_industry")}</label>
            <Input id="edit-client-industry" value={editIndustry} onChange={(e) => setEditIndustry(e.target.value)} />
          </div>
        </div>
      </Modal>

      <Modal
        open={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title={t("invoice_modal_title")}
        description={client ? t("invoice_modal_desc", { name: client.name }) : undefined}
        footer={
          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
            <Button variant="secondary" size="sm" onClick={() => setShowInvoiceModal(false)}>{t("edit_cancel")}</Button>
            <Button variant="primary" size="sm" onClick={handleInvoiceSave} disabled={invoiceSaving || !invoiceAmount.trim()}>
              {invoiceSaving ? t("invoice_submitting") : t("invoice_submit")}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label className="form-label" htmlFor="invoice-amount">{t("invoice_field_amount", { currency: client?.currency ?? "EUR" })}</label>
            <Input id="invoice-amount" type="number" placeholder={t("invoice_field_amount_placeholder")} value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} />
          </div>
          <div>
            <label className="form-label" htmlFor="invoice-desc">{t("invoice_field_description")}</label>
            <Input id="invoice-desc" placeholder={t("invoice_field_description_placeholder")} value={invoiceDesc} onChange={(e) => setInvoiceDesc(e.target.value)} />
          </div>
        </div>
      </Modal>
      </div>
    </>
  );
}
