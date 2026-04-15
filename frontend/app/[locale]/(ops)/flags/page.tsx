import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/patterns/empty-state";
import { Shield } from "lucide-react";

/**
 * Operator feature-flag console. Lists every registered feature with its
 * current kill-switch state and per-tenant overrides. Backend route is
 * ready at /api/v1/ops/features; the UI wiring goes live with Phase 3 auth.
 */

export default function OpsFlagsPage() {
  return (
    <div className="space-y-4">
      <Card padded>
        <CardHeader>
          <div>
            <CardTitle>Feature flags</CardTitle>
            <CardDescription>
              Toggle kill switches and per-tenant overrides. Every change lands
              in the audit log automatically.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <EmptyState
        icon={Shield}
        title="Wire me up"
        description="Backend route /api/v1/ops/features is live. Frontend rendering plugs in after Phase 3 auth so the page is gated behind operator audience."
      />
    </div>
  );
}
