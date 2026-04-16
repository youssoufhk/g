import type { ReactNode } from "react";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--color-bg)",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--space-4) var(--space-6)",
          background: "var(--color-surface-0)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
          }}
        >
          {/* Gamma wordmark */}
          <span
            style={{
              fontSize: "var(--text-heading-2)",
              fontWeight: "var(--weight-bold)",
              color: "var(--color-primary)",
              letterSpacing: "-0.5px",
            }}
          >
            Gamma
          </span>
          <span
            style={{
              width: "1px",
              height: "20px",
              background: "var(--color-border)",
            }}
          />
          <span
            style={{
              fontSize: "var(--text-body)",
              color: "var(--color-text-2)",
            }}
          >
            Client Portal
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-body-sm)",
              color: "var(--color-text-3)",
            }}
          >
            HSBC UK
          </span>
          {/* User avatar indicator */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-full)",
              background: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "var(--text-caption)",
              fontWeight: "var(--weight-semibold)",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            H
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, padding: "var(--space-6)" }}>{children}</main>

      {/* Footer */}
      <footer
        style={{
          padding: "var(--space-4) var(--space-6)",
          borderTop: "1px solid var(--color-border)",
          textAlign: "center",
          fontSize: "var(--text-caption)",
          color: "var(--color-text-3)",
        }}
      >
        Powered by{" "}
        <span
          style={{
            color: "var(--color-primary)",
            fontWeight: "var(--weight-medium)",
          }}
        >
          Gamma
        </span>
      </footer>
    </div>
  );
}
