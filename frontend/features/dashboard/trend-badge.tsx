import { Minus, TrendingDown, TrendingUp } from "lucide-react";

export type Trend = "up" | "down" | "flat";

export function TrendBadge({ trend, label }: { trend: Trend; label: string }) {
  const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  return (
    <span className="trend-badge" data-trend={trend}>
      <Icon size={12} strokeWidth={2.25} aria-hidden />
      {label}
    </span>
  );
}
