"use client";

import { Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui/table";
import { EmptyState } from "@/components/patterns/empty-state";
import { useOpsTenants } from "@/features/ops/use-ops";
import type { TenantOut } from "@/features/ops/types";

export default function TenantsPage() {
  const { data, isLoading, error } = useOpsTenants();

  return (
    <div className="space-y-4">
      <Card padded>
        <CardHeader>
          <div>
            <CardTitle>Tenants</CardTitle>
            <CardDescription>
              Create, suspend, and inspect every tenant across residency regions.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {isLoading && (
        <Card padded>
          <p className="text-sm text-[var(--color-text-3)]">Loading tenants...</p>
        </Card>
      )}

      {error && (
        <Card padded className="border-[var(--color-error-muted)]">
          <p className="text-sm text-[var(--color-error)]">
            Failed to load tenants. {(error as Error).message}
          </p>
        </Card>
      )}

      {data && data.length === 0 && (
        <EmptyState
          icon={Users}
          title="No tenants yet"
          description="Run `make dev-migrate` to seed the dev tenant, or create one with POST /api/v1/ops/tenants."
        />
      )}

      {data && data.length > 0 && (
        <Card padded>
          <Table>
            <THead>
              <TR>
                <TH>ID</TH>
                <TH>Schema</TH>
                <TH>Display name</TH>
                <TH>Jurisdiction</TH>
                <TH>Currency</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {data.map((row) => (
                <TR key={row.id}>
                  <TD className="text-xs text-[var(--color-text-3)]">{row.id}</TD>
                  <TD className="font-mono text-xs">{row.schema_name}</TD>
                  <TD>{row.display_name}</TD>
                  <TD>{row.legal_jurisdiction}</TD>
                  <TD>{row.base_currency}</TD>
                  <TD>
                    <Badge tone={_tone(row.status)}>{row.status}</Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

function _tone(status: TenantOut["status"]): "success" | "warning" | "neutral" {
  if (status === "active") return "success";
  if (status === "legal_hold" || status === "suspended") return "warning";
  return "neutral";
}
