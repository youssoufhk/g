"use client";

import { Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { EmptyState } from "@/components/patterns/empty-state";
import { useOpsFeatures, useToggleKillSwitch } from "@/features/ops/use-ops";

export default function OpsFlagsPage() {
  const { data, isLoading, error } = useOpsFeatures();
  const toggle = useToggleKillSwitch();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div>
        <h1
          style={{
            fontSize: "var(--text-display-lg)",
            fontWeight: "var(--weight-bold)",
            color: "var(--color-text-1)",
            marginBottom: "var(--space-1)",
          }}
        >
          Feature flags
        </h1>
        <p className="text-2">
          Toggle kill switches. Every change lands in the audit log automatically.
        </p>
      </div>

      {isLoading && (
        <div className="card">
          <div className="card-body">
            <p className="text-sm text-3">Loading features...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="card" style={{ borderColor: "var(--color-error-muted)" }}>
          <div className="card-body">
            <p className="text-error text-sm">
              Failed to load features. {(error as Error).message}
            </p>
          </div>
        </div>
      )}

      {data && data.length === 0 && (
        <div className="card">
          <EmptyState
            icon={Shield}
            title="No features registered"
            description="Feature modules self-register on backend startup. If this list is empty, the backend has not imported any feature package."
          />
        </div>
      )}

      {data && data.length > 0 && (
        <div className="card">
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
          >
            {data.map((flag, idx) => (
              <li
                key={flag.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "var(--space-4)",
                  padding: "var(--space-4)",
                  borderBottom:
                    idx < data.length - 1
                      ? "1px solid var(--color-border-subtle)"
                      : "none",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-2)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--text-body)",
                        fontWeight: "var(--weight-semibold)",
                        color: "var(--color-text-1)",
                      }}
                    >
                      {flag.key}
                    </span>
                    {flag.kill_switch && <Badge tone="error">killed</Badge>}
                    {!flag.default_enabled && !flag.kill_switch && (
                      <Badge tone="warning">disabled default</Badge>
                    )}
                  </div>
                  <p
                    className="text-sm text-2"
                    style={{ marginTop: "var(--space-1)" }}
                  >
                    {flag.description}
                  </p>
                  {Object.keys(flag.tenant_overrides).length > 0 && (
                    <p className="text-caption text-3" style={{ marginTop: "var(--space-1)" }}>
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
        </div>
      )}
    </div>
  );
}
