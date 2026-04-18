import { useTranslations } from "next-intl";
import clsx from "clsx";

/**
 * Lightweight spinner that uses the prototype's `@keyframes spin`. The
 * prototype does not expose a named `.spinner` class, so we inline the
 * rotating border. Sizes mirror the icon scale.
 */
export type SpinnerSize = "xs" | "sm" | "md" | "lg";

const SIZE_PX: Record<SpinnerSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 28,
};

export function Spinner({
  size = "sm",
  className,
  label,
}: {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}) {
  const t = useTranslations("app");
  const resolvedLabel = label ?? t("loading");
  const px = SIZE_PX[size];
  return (
    <span
      className={clsx(className)}
      role="status"
      aria-label={resolvedLabel}
      style={{
        display: "inline-block",
        width: px,
        height: px,
        borderRadius: "50%",
        border: `${Math.max(2, px / 10)}px solid var(--color-border)`,
        borderTopColor: "var(--color-primary)",
        animation: "spin 0.8s linear infinite",
      }}
    />
  );
}
