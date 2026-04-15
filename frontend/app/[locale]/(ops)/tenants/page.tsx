import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/patterns/empty-state";
import { Users } from "lucide-react";

/**
 * Operator tenant list. Static placeholder in §3.8 because live data
 * depends on auth, which ships in Phase 3. Wiring plan:
 *   - replace the static rows with useQuery(["ops","tenants"], fetchTenants)
 *   - fetchTenants calls apiFetch("/ops/tenants") once the route exists
 *   - the route already exists in backend app.features.admin.routes
 */

type TenantRow = {
  id: number;
  schemaName: string;
  displayName: string;
  jurisdiction: string;
  currency: string;
  status: "provisioning" | "active" | "suspended" | "legal_hold" | "offboarded";
};

const placeholder: TenantRow[] = [];

export default function TenantsPage() {
  return (
    <div className="space-y-4">
      <Card padded={false} className="p-5">
        <CardHeader>
          <div>
            <CardTitle>Tenants</CardTitle>
            <CardDescription>
              Create, suspend, and inspect every tenant across residency regions.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {placeholder.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No tenants yet"
          description="The first pilot tenant is provisioned after Phase 3 onboarding lands. For now, this page is reachable once auth ships."
        />
      ) : (
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
              {placeholder.map((row) => (
                <TR key={row.id}>
                  <TD className="text-xs text-[var(--color-text-3)]">{row.id}</TD>
                  <TD className="font-mono text-xs">{row.schemaName}</TD>
                  <TD>{row.displayName}</TD>
                  <TD>{row.jurisdiction}</TD>
                  <TD>{row.currency}</TD>
                  <TD>
                    <Badge
                      tone={
                        row.status === "active"
                          ? "success"
                          : row.status === "legal_hold"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {row.status}
                    </Badge>
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
