import type { ReactNode } from "react";
import { Icon, type IconName } from "../core/Icon";

export interface EmptyStateProps {
  /** Icon in the paper disc. Default "shopping-cart". */
  icon?: IconName;
  /** Serif headline. */
  title: string;
  /** Body copy below the headline. */
  children?: ReactNode;
  /** Optional action node (usually a Button). */
  action?: ReactNode;
  className?: string;
}

/**
 * Centered empty state — an outlined icon in a paper disc, a serif
 * headline, a line of body copy, and an optional action slot. Used
 * for the fresh list, a fully-checked store, an empty import, etc.
 */
export function EmptyState({
  icon = "shopping-cart",
  title,
  children,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={["gr-empty", className].filter(Boolean).join(" ")}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "var(--space-12) var(--space-6)",
        gap: "var(--space-3)",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 64,
          height: 64,
          borderRadius: "var(--radius-pill)",
          background: "var(--paper-200)",
          color: "var(--ink-500)",
          marginBottom: "var(--space-1)",
        }}
      >
        <Icon name={icon} size={28} />
      </span>
      <h3 style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
      {children && (
        <p style={{ maxWidth: 320, margin: 0, color: "var(--ink-500)" }}>
          {children}
        </p>
      )}
      {action && <div style={{ marginTop: "var(--space-3)" }}>{action}</div>}
    </div>
  );
}
