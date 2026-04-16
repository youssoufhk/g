import type { CSSProperties } from "react";
import clsx from "clsx";

/**
 * Wraps the prototype's `.skeleton-{text,title,avatar,card}` shimmer
 * classes. The CSS drives the animation and color.
 */
export type SkeletonVariant = "text" | "title" | "avatar" | "card";

export type SkeletonProps = {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: CSSProperties;
};

export function Skeleton({
  variant = "text",
  width,
  height,
  className,
  style,
}: SkeletonProps) {
  return (
    <div
      className={clsx(`skeleton-${variant}`, className)}
      aria-hidden="true"
      style={{
        ...(width !== undefined ? { width } : null),
        ...(height !== undefined ? { height } : null),
        ...style,
      }}
    />
  );
}
