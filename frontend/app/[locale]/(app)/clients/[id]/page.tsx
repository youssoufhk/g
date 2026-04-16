"use client";

import Link from "next/link";
import { use, useState } from "react";
import {
  ArrowLeft,
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

// ── Helpers ───────────────────────────────────────────────────────────────────

const CURRENCY_SYMBOL: Record<Client["currency"], string> = {
  GBP: "£",
  EUR: "€",
  USD: "$",
};

function formatRevenue(amount: number, currency: Client["currency"]): string {
  if (amount === 0) return "-";
  const symbol = CURRENCY_SYMBOL[currency];
  const formatted = new Intl.NumberFormat("en-GB", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${symbol}${formatted}`;
}

function formatSinceDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

function statusTone(status: Client["status"]): "success" | "default" | "warning" {
  if (status === "active") return "success";
  if (status === "prospect") return "warning";
  return "default";
}

function statusLabel(status: Client["status"]): string {
  if (status === "active") return "Active";
  if (status === "inactive") return "Inactive";
  return "Prospect";
}

function currencyTone(currency: Client["currency"]): "gold" | "info" | "default" {
  if (currency === "GBP") return "gold";
  if (currency === "EUR") return "info";
  return "default";
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
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
          <CardTitle>Active projects</CardTitle>
        </CardHeader>
        <CardBody>
          {!hasProjects ? (
            <EmptyState
              icon={FolderKanban}
              title="No active projects"
              description="This client has no active projects right now."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  padding: "var(--space-4)",
                  background: "var(--color-surface-1)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <FolderKanban size={16} style={{ color: "var(--color-primary)", flexShrink: 0 }} aria-hidden />
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontWeight: "var(--weight-medium)",
                      fontSize: "var(--text-body-sm)",
                      color: "var(--color-text-1)",
                    }}
                  >
                    {client.active_projects} active {client.active_projects === 1 ? "project" : "projects"}
                  </span>
                  <div style={{ fontSize: "var(--text-caption)", color: "var(--color-text-3)", marginTop: 2 }}>
                    See Projects tab for full details
                  </div>
                </div>
                <Badge tone="success">{client.active_projects}</Badge>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Contacts</CardTitle>
        </CardHeader>
        <CardBody>
          {!hasContacts ? (
            <EmptyState
              icon={Users}
              title="No contacts"
              description="Add billing and project contacts for this client."
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
            <CardTitle>Notes</CardTitle>
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

const PLACEHOLDER_DESCRIPTIONS: Record<string, string> = {
  Projects: "All projects for this client will appear here. Go to Projects to create one.",
  Invoices: "All invoices for this client will appear here. Use the New Invoice button to create one.",
  Team: "Team members allocated to this client will appear here once projects are assigned.",
  Documents: "Contracts and signed documents for this client will appear here once uploaded.",
};

function PlaceholderTab({ icon: Icon, label }: { icon: typeof FileText; label: string }) {
  return (
    <EmptyState
      icon={Icon}
      title={`No ${label.toLowerCase()} yet`}
      description={PLACEHOLDER_DESCRIPTIONS[label] ?? `${label} will appear here once available.`}
    />
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = use(params);
  const { data: client, isLoading, error } = useClient(id);
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

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        <Link
          href="/clients"
          style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", color: "var(--color-text-2)", textDecoration: "none", fontSize: "var(--text-body)", fontWeight: "var(--weight-medium)" }}
        >
          <ArrowLeft size={18} aria-hidden /> Back to clients
        </Link>
        <ProfileSkeleton />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        <Link
          href="/clients"
          style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", color: "var(--color-text-2)", textDecoration: "none", fontSize: "var(--text-body)", fontWeight: "var(--weight-medium)" }}
        >
          <ArrowLeft size={18} aria-hidden /> Back to clients
        </Link>
        <EmptyState
          icon={Building2}
          title="Client not found"
          description="This client does not exist or you do not have access."
          action={
            <Link href="/clients">
              <Button variant="secondary" size="sm">Back to clients</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Back link */}
      <Link
        href="/clients"
        style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", color: "var(--color-text-2)", textDecoration: "none", fontSize: "var(--text-body)", fontWeight: "var(--weight-medium)" }}
      >
        <ArrowLeft size={18} aria-hidden /> Back to clients
      </Link>

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
                  Client since {formatSinceDate(client.since_date)}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
                <Badge tone={statusTone(client.status)} dot>{statusLabel(client.status)}</Badge>
                <Badge tone={currencyTone(client.currency)}>{client.currency}</Badge>
                {client.team_size > 0 && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "var(--space-1)",
                      fontSize: "var(--text-body-sm)",
                      color: "var(--color-text-3)",
                    }}
                  >
                    <Users size={14} aria-hidden />
                    {client.team_size} team members
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "var(--space-2)", flexShrink: 0 }}>
              <Button variant="secondary" size="sm" onClick={openEdit}>Edit</Button>
              <Button variant="primary" size="sm" leadingIcon={<Receipt size={14} aria-hidden />} onClick={() => setShowInvoiceModal(true)}>
                New invoice
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
          label="Active projects"
          value={client.active_projects}
          secondary={`/ ${client.total_projects} total`}
          accent="primary"
        />
        <StatPill
          label="Revenue YTD"
          value={formatRevenue(client.revenue_ytd, client.currency)}
          accent="gold"
        />
        <StatPill
          label="Open invoices"
          value="-"
          accent="warning"
        />
        <StatPill
          label="Team members"
          value={client.team_size}
          accent="info"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects" count={client.total_projects}>Projects</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="team" count={client.team_size}>Team</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab client={client} />
        </TabsContent>

        <TabsContent value="projects">
          <PlaceholderTab icon={FolderKanban} label="Projects" />
        </TabsContent>

        <TabsContent value="invoices">
          <PlaceholderTab icon={Receipt} label="Invoices" />
        </TabsContent>

        <TabsContent value="team">
          <PlaceholderTab icon={Users} label="Team" />
        </TabsContent>

        <TabsContent value="documents">
          <PlaceholderTab icon={FileText} label="Documents" />
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
        title="Edit client"
        footer={
          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
            <Button variant="secondary" size="sm" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleEditSave} disabled={editSaving}>
              {editSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label className="form-label" htmlFor="edit-client-name">Company name</label>
            <Input id="edit-client-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <div>
            <label className="form-label" htmlFor="edit-client-industry">Industry</label>
            <Input id="edit-client-industry" value={editIndustry} onChange={(e) => setEditIndustry(e.target.value)} />
          </div>
        </div>
      </Modal>

      <Modal
        open={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title="New invoice"
        description={client ? `Create a new invoice for ${client.name}.` : "Create a new invoice."}
        footer={
          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
            <Button variant="secondary" size="sm" onClick={() => setShowInvoiceModal(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleInvoiceSave} disabled={invoiceSaving || !invoiceAmount.trim()}>
              {invoiceSaving ? "Creating..." : "Create invoice"}
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label className="form-label" htmlFor="invoice-amount">Amount ({client?.currency ?? "EUR"})</label>
            <Input id="invoice-amount" type="number" placeholder="0.00" value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} />
          </div>
          <div>
            <label className="form-label" htmlFor="invoice-desc">Description</label>
            <Input id="invoice-desc" placeholder="e.g. Consulting services - April 2026" value={invoiceDesc} onChange={(e) => setInvoiceDesc(e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
