// Header-row + optional content wrapper that flips open/closed when
// the header is clicked. The whole header is a button so keyboard
// focus + activation are free. The toggle chevron mirrors the rest
// of the design system's icon set (1.5px stroke, currentColor).

import type { ReactNode } from "react";
import { Icon } from "./ui";

export type CollapsibleSectionProps = {
  /** Content of the header row — usually an AisleHeader or a store label. */
  header: ReactNode;
  /** When `false`, children are hidden. */
  open: boolean;
  /** Called when the header is tapped to flip the state. */
  onToggle: () => void;
  /** Accessible label for the toggle, e.g. "Collapse Fruits". */
  toggleLabel: string;
  children: ReactNode;
};

export function CollapsibleSection({
  header,
  open,
  onToggle,
  toggleLabel,
  children,
}: CollapsibleSectionProps) {
  return (
    <section>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={toggleLabel}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          width: "100%",
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ flex: 1, minWidth: 0 }}>{header}</span>
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            color: "var(--ink-500)",
            transition: "transform var(--dur-fast) var(--ease-out)",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        >
          <Icon name="chevron-down" size={18} />
        </span>
      </button>
      {open && children}
    </section>
  );
}
