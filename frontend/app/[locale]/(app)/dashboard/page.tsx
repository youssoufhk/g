import { StatPill } from "@/components/patterns/stat-pill";
import { AIInsightCard } from "@/components/ui/ai-insight-card";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Dashboard pass 1 placeholder.
 *
 * Phase 4 fills in:
 *   - live KPI strip (Revenue YTD, Billable days this week, Approvals pending,
 *     Team capacity) via /api/v1/dashboard/kpis
 *   - AI insight cards from the 24-analyzer library (AI_FEATURES.md section 6.1a)
 *   - degraded-mode banner when any kill switch is on
 *
 * The static content here is intentional: the shell should render dark and
 * light cleanly on day 1, and the smoke E2E scenario at
 * frontend/tests/e2e/smoke-shell.spec.ts asserts the page loads.
 */

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <Card padded>
        <CardHeader>
          <div>
            <CardTitle>Welcome to Gamma</CardTitle>
            <CardDescription>
              The operations OS for modern consulting firms. Your AI analyst is
              warming up.
            </CardDescription>
          </div>
          <Button variant="secondary" size="sm">Take a tour</Button>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatPill label="Revenue YTD" value="-" delta="Phase 4" deltaTone="neutral" />
        <StatPill label="Billable days" value="-" delta="this week" deltaTone="neutral" />
        <StatPill label="Approvals pending" value="-" delta="all queues" deltaTone="neutral" />
        <StatPill label="Team capacity" value="-" delta="this week" deltaTone="neutral" />
      </div>

      <AIInsightCard
        title="Month end close is 12 days away"
        severity="info"
        summary="The month end close agent will prepare invoice drafts on day 28, explain each line, and wait for your confirmation. No action from you needed today."
        evidence={[
          "Draft preparation: day 28",
          "Founder review window: 48 hours",
          "Batch send: after review",
        ]}
      />
    </div>
  );
}
