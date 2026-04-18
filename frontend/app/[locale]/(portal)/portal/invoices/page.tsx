"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DataTableWrapper,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui/table";

type InvoiceStatus = "sent" | "paid" | "void";

interface PortalInvoice {
  id: string;
  number: string;
  project: string | null;
  issueDate: string;
  dueDate: string;
  amount: number | null;
  currency: string;
  status: InvoiceStatus;
}

const MOCK_INVOICES: PortalInvoice[] = [
  {
    id: "inv-2026-0042",
    number: "INV-2026-0042",
    project: "HSBC Digital Transformation",
    issueDate: "Apr 1, 2026",
    dueDate: "Apr 30, 2026",
    amount: 15120,
    currency: "GBP",
    status: "sent",
  },
  {
    id: "inv-2026-0037",
    number: "INV-2026-0037",
    project: null,
    issueDate: "Jan 15, 2026",
    dueDate: "Feb 15, 2026",
    amount: null,
    currency: "GBP",
    status: "void",
  },
  {
    id: "inv-2026-0030",
    number: "INV-2026-0030",
    project: "HSBC Phase 2",
    issueDate: "Oct 1, 2025",
    dueDate: "Oct 31, 2025",
    amount: 11340,
    currency: "GBP",
    status: "paid",
  },
];

function statusBadgeTone(
  status: InvoiceStatus,
): "info" | "success" | "default" {
  switch (status) {
    case "sent":
      return "info";
    case "paid":
      return "success";
    case "void":
      return "default";
  }
}

function formatAmount(amount: number, currency: string): string {
  const symbol = currency === "GBP" ? "\u00a3" : currency;
  return `${symbol}${amount.toLocaleString("en-GB")}`;
}

function amountColor(status: InvoiceStatus): string {
  switch (status) {
    case "sent":
      return "var(--color-gold)";
    case "paid":
      return "var(--color-success)";
    case "void":
      return "var(--color-text-3)";
  }
}

export default function PortalInvoicesPage() {
  function handleDownload(invoiceNumber: string): void {
    void invoiceNumber;
  }

  return (
    <div>
      {/* Page heading */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1
          style={{
            fontSize: "var(--text-heading-1)",
            fontWeight: "var(--weight-bold)",
            color: "var(--color-text-1)",
            margin: 0,
          }}
        >
          Your invoices
        </h1>
        <p
          style={{
            marginTop: "var(--space-1)",
            marginBottom: 0,
            fontSize: "var(--text-body)",
            color: "var(--color-text-3)",
          }}
        >
          HSBC UK · Consulting services
        </p>
      </div>

      {/* KPI strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "var(--space-4)",
          marginBottom: "var(--space-6)",
        }}
      >
        {/* Outstanding */}
        <div
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-4)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-1)",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-body-sm)",
              color: "var(--color-text-3)",
            }}
          >
            Outstanding
          </span>
          <span
            style={{
              fontSize: "var(--text-heading-1)",
              fontWeight: "var(--weight-bold)",
              color: "var(--color-gold)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {formatAmount(15120, "GBP")}
          </span>
          <span
            style={{
              fontSize: "var(--text-caption)",
              color: "var(--color-text-3)",
            }}
          >
            1 invoice pending
          </span>
        </div>

        {/* Paid YTD */}
        <div
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-4)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-1)",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-body-sm)",
              color: "var(--color-text-3)",
            }}
          >
            Paid YTD
          </span>
          <span
            style={{
              fontSize: "var(--text-heading-1)",
              fontWeight: "var(--weight-bold)",
              color: "var(--color-text-1)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {formatAmount(12600, "GBP")}
          </span>
          <span
            style={{
              fontSize: "var(--text-caption)",
              color: "var(--color-text-3)",
            }}
          >
            1 invoice paid
          </span>
        </div>

        {/* This month */}
        <div
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-4)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-1)",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-body-sm)",
              color: "var(--color-text-3)",
            }}
          >
            This month
          </span>
          <span
            style={{
              fontSize: "var(--text-heading-1)",
              fontWeight: "var(--weight-bold)",
              color: "var(--color-text-1)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {formatAmount(15120, "GBP")}
          </span>
          <span
            style={{
              fontSize: "var(--text-caption)",
              color: "var(--color-text-3)",
            }}
          >
            Due Apr 30, 2026
          </span>
        </div>
      </div>

      {/* Invoice table - overflow-x-auto for narrow screens */}
      <div style={{ overflowX: "auto" }}>
      <DataTableWrapper>
        <Table>
          <THead>
            <TR>
              <TH>Invoice #</TH>
              <TH>Project</TH>
              <TH>Issue date</TH>
              <TH>Due date</TH>
              <TH numeric>Amount</TH>
              <TH>Status</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {MOCK_INVOICES.map((invoice) => (
              <TR key={invoice.id}>
                <TD>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--text-body-sm)",
                      color: "var(--color-text-1)",
                    }}
                  >
                    {invoice.number}
                  </span>
                </TD>
                <TD muted={invoice.project === null}>
                  {invoice.project ?? "-"}
                </TD>
                <TD>{invoice.issueDate}</TD>
                <TD>{invoice.dueDate}</TD>
                <TD numeric>
                  {invoice.amount !== null ? (
                    <span style={{ color: amountColor(invoice.status) }}>
                      {formatAmount(invoice.amount, invoice.currency)}
                    </span>
                  ) : (
                    <span style={{ color: "var(--color-text-3)" }}>-</span>
                  )}
                </TD>
                <TD>
                  <Badge tone={statusBadgeTone(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </TD>
                <TD>
                  {invoice.status !== "void" ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-2)",
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        leadingIcon={
                          <svg
                            width={16}
                            height={16}
                            viewBox="0 0 16 16"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M8 10.5L4.5 7H6.5V2H9.5V7H11.5L8 10.5Z"
                              fill="currentColor"
                            />
                            <path
                              d="M2.5 12H13.5V13.5H2.5V12Z"
                              fill="currentColor"
                            />
                          </svg>
                        }
                        onClick={() => handleDownload(invoice.number)}
                      >
                        Download PDF
                      </Button>
                      {invoice.status === "sent" && (
                        <button
                          type="button"
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            fontSize: "var(--text-body-sm)",
                            color: "var(--color-primary)",
                            cursor: "pointer",
                            textDecoration: "underline",
                            textUnderlineOffset: "2px",
                          }}
                          onClick={() => {
                            void invoice.number;
                          }}
                        >
                          Contact us
                        </button>
                      )}
                    </div>
                  ) : (
                    <span style={{ color: "var(--color-text-3)" }}>-</span>
                  )}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </DataTableWrapper>
      </div>

      {/* Empty state (shown when no invoices) */}
      {MOCK_INVOICES.length === 0 && (
        <div
          style={{
            padding: "var(--space-12) var(--space-4)",
            textAlign: "center",
            color: "var(--color-text-3)",
          }}
        >
          <p style={{ fontSize: "var(--text-body-sm)" }}>No invoices found.</p>
        </div>
      )}

      {/* Footer note */}
      <p
        style={{
          marginTop: "var(--space-4)",
          fontSize: "var(--text-body-sm)",
          color: "var(--color-text-3)",
          textAlign: "center",
        }}
      >
        Questions about an invoice? Contact billing@globalid.uk
      </p>
    </div>
  );
}
