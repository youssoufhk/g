import type { ImgHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

/**
 * Wraps the prototype's `.avatar.avatar-{size}.avatar-color-{n}` classes
 * plus the optional `.avatar-status.presence-{tone}` status dot. Size and
 * color are deterministic per the prototype's 8 gradient palette.
 *
 * Naming strategy:
 *   - `size`: xs | sm | md | lg | xl | 2xl  (matches prototype scale)
 *   - `colorIndex`: 0..7, or pass `name` to hash to an index
 *   - `status`: online | away | busy | leave (renders presence dot)
 */
export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type AvatarStatus = "online" | "away" | "busy" | "leave";

export type AvatarProps = {
  name?: string;
  initials?: string;
  src?: string;
  alt?: string;
  size?: AvatarSize;
  colorIndex?: number;
  status?: AvatarStatus;
  className?: string;
  children?: ReactNode;
} & Pick<ImgHTMLAttributes<HTMLImageElement>, "loading">;

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0] ?? "";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const last = parts[parts.length - 1] ?? "";
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function hashToColor(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 8;
}

export function Avatar({
  name,
  initials,
  src,
  alt,
  size = "md",
  colorIndex,
  status,
  className,
  loading,
  children,
}: AvatarProps) {
  const resolvedInitials =
    initials ?? (name ? initialsFrom(name) : undefined) ?? "?";
  const resolvedColor =
    colorIndex ?? (name ? hashToColor(name) : 0);

  return (
    <span
      className={clsx(
        "avatar",
        `avatar-${size}`,
        `avatar-color-${resolvedColor}`,
        status && "avatar-status",
        status && `presence-${status}`,
        className,
      )}
      aria-label={alt ?? name}
    >
      {src ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={src} alt={alt ?? name ?? "avatar"} loading={loading} />
      ) : (
        (children ?? resolvedInitials)
      )}
    </span>
  );
}

/**
 * Wraps the prototype's `.avatar-group` class. Renders up to `max` avatars
 * then a count chip for the overflow.
 */
export function AvatarGroup({
  avatars,
  max = 4,
  size = "sm",
}: {
  avatars: Array<{ name?: string; src?: string }>;
  max?: number;
  size?: AvatarSize;
}) {
  const shown = avatars.slice(0, max);
  const extra = avatars.length - shown.length;
  return (
    <div className="avatar-group">
      {shown.map((a, i) => (
        <Avatar key={i} name={a.name} src={a.src} size={size} />
      ))}
      {extra > 0 && (
        <span className={clsx("avatar", `avatar-${size}`, "avatar-count")}>
          +{extra}
        </span>
      )}
    </div>
  );
}
