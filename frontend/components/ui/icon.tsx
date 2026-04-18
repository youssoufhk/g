import * as React from "react";
import type { LucideIcon, LucideProps } from "lucide-react";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export type IconProps = Omit<LucideProps, "size" | "strokeWidth"> & {
  icon: LucideIcon;
  size?: IconSize;
};

export function Icon({
  icon: Component,
  size = "sm",
  ...rest
}: IconProps) {
  return <Component size={SIZE_MAP[size]} strokeWidth={1.5} {...rest} />;
}
