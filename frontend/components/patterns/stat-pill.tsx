import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export type StatPillProps = {
  label: string;
  value: ReactNode;
  delta?: string;
  deltaTone?: "success" | "warning" | "error" | "neutral";
};

const deltaTones: Record<NonNullable<StatPillProps["deltaTone"]>, string> = {
  success: "text-[var(--color-success)]",
  warning: "text-[var(--color-warning)]",
  error: "text-[var(--color-error)]",
  neutral: "text-[var(--color-text-3)]",
};

export function StatPill({ label, value, delta, deltaTone = "neutral" }: StatPillProps) {
  return (
    <Card padded>
      <p className="text-xs text-[var(--color-text-3)] uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-[var(--color-text-1)]">
        {value}
      </p>
      {delta && <p className={`mt-1 text-xs ${deltaTones[deltaTone]}`}>{delta}</p>}
    </Card>
  );
}
