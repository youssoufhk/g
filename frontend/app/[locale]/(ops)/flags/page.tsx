"use client";

import { Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { EmptyState } from "@/components/patterns/empty-state";
import { useOpsFeatures, useToggleKillSwitch } from "@/features/ops/use-ops";

export default function OpsFlagsPage() {
  const { data, isLoading, error } = useOpsFeatures();
  const toggle = useToggleKillSwitch();

  return (
    <div className="space-y-4">
      <Card padded>
        <CardHeader>
          <div>
            <CardTitle>Feature flags</CardTitle>
            <CardDescription>
              Toggle kill switches. Every change lands in the audit log
              automatically.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {isLoading && (
        <Card padded>
          <p className="text-sm text-[var(--color-text-3)]">Loading features...</p>
        </Card>
      )}

      {error && (
        <Card padded className="border-[var(--color-error-muted)]">
          <p className="text-sm text-[var(--color-error)]">
            Failed to load features. {(error as Error).message}
          </p>
        </Card>
      )}

      {data && data.length === 0 && (
        <EmptyState
          icon={Shield}
          title="No features registered"
          description="Feature modules self-register on backend startup. If this list is empty, the backend has not imported any feature package."
        />
      )}

      {data && data.length > 0 && (
        <Card padded>
          <ul className="divide-y divide-[var(--color-border-subtle)]">
            {data.map((flag) => (
              <li
                key={flag.key}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--color-text-1)]">
                      {flag.key}
                    </span>
                    {flag.kill_switch && <Badge tone="error">killed</Badge>}
                    {!flag.default_enabled && !flag.kill_switch && (
                      <Badge tone="warning">disabled default</Badge>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-text-3)] mt-0.5">
                    {flag.description}
                  </p>
                  {Object.keys(flag.tenant_overrides).length > 0 && (
                    <p className="text-[11px] text-[var(--color-text-3)] mt-1">
                      {Object.entries(flag.tenant_overrides)
                        .map(([schema, enabled]) => `${schema}=${enabled ? "on" : "off"}`)
                        .join(", ")}
                    </p>
                  )}
                </div>
                <Toggle
                  checked={!flag.kill_switch}
                  onCheckedChange={(next) =>
                    toggle.mutate({ key: flag.key, killed: !next })
                  }
                  label={`toggle ${flag.key}`}
                />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
