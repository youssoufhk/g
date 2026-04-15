import { Sparkles } from "lucide-react";

export type AIInvoiceExplanationProps = {
  rationale: string;
  sourceDocumentCount?: number;
  confidence?: "low" | "medium" | "high";
};

const confidenceLabel: Record<NonNullable<AIInvoiceExplanationProps["confidence"]>, string> = {
  low: "Low confidence",
  medium: "Medium confidence",
  high: "High confidence",
};

export function AIInvoiceExplanation({
  rationale,
  sourceDocumentCount,
  confidence = "medium",
}: AIInvoiceExplanationProps) {
  return (
    <aside className="rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-0)] p-3">
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-3)]">
        <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" aria-hidden />
        <span>Why this amount</span>
        <span aria-hidden>-</span>
        <span>{confidenceLabel[confidence]}</span>
      </div>
      <p className="mt-2 text-sm text-[var(--color-text-2)]">{rationale}</p>
      {typeof sourceDocumentCount === "number" && (
        <p className="mt-2 text-xs text-[var(--color-text-3)]">
          Based on {sourceDocumentCount} source documents.
        </p>
      )}
    </aside>
  );
}
