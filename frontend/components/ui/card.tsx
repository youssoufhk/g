import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * When true (default) the card children are wrapped in a `.card-body` so
   * you can pass plain content without composing header / footer. Set false
   * when you are composing with `<CardHeader>`, `<CardBody>`, `<CardFooter>`
   * yourself - the wrapper would otherwise double-pad the content.
   */
  padded?: boolean;
  interactive?: boolean;
  glass?: boolean;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, padded = true, interactive = false, glass = false, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={clsx(
        "card",
        interactive && "card-interactive",
        glass && "card-glass",
        className,
      )}
      {...rest}
    >
      {padded ? <div className="card-body">{children}</div> : children}
    </div>
  );
});

export function CardHeader({ children }: { children: ReactNode }) {
  return <div className="card-header">{children}</div>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <div className="card-title">{children}</div>;
}

export function CardDescription({ children }: { children: ReactNode }) {
  return (
    <p
      className="text-2 text-sm"
      style={{ marginTop: "var(--space-1)" }}
    >
      {children}
    </p>
  );
}

export function CardBody({ children }: { children: ReactNode }) {
  return <div className="card-body">{children}</div>;
}

export function CardFooter({ children }: { children: ReactNode }) {
  return <div className="card-footer">{children}</div>;
}
