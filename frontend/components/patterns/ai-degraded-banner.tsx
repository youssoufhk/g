"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { useAiKillSwitch } from "@/lib/ai-kill-switch";

/**
 * Renders a yellow degraded-mode banner when the AI kill-switch is on.
 * Mounted on dashboard, expenses, and invoices (CRITIC_PLAN C9 /
 * OPUS_CRITICS §E37). Degraded scope documented in
 * docs/DEGRADED_MODE.md section 2.
 */
export function AiDegradedBanner({ surface }: { surface: "dashboard" | "expenses" | "invoices" }) {
  const t = useTranslations("degraded");
  const off = useAiKillSwitch();
  if (!off) return null;
  return (
    <div role="status" aria-live="polite" className="degraded-banner" data-testid={`ai-degraded-${surface}`}>
      <AlertTriangle size={16} aria-hidden />
      <span className="degraded-banner-text">{t(`ai_off_${surface}`)}</span>
    </div>
  );
}
