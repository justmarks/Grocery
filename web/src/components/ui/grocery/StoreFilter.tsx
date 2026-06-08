import type { HTMLAttributes, ReactNode } from "react";
import { Icon } from "../core/Icon";
import { StoreLogo } from "./StoreLogo";

export interface StoreFilterProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Household store names. */
  stores: string[];
  /** Optional per-store logo data URLs, keyed by store name. */
  logos?: Record<string, string>;
  /** Active key — "all" or one of `stores`. Default "all". */
  value?: string;
  /** Called with the newly-selected key. */
  onChange?: (value: string) => void;
}

const DISC = 40; // px — + 2px ring padding clears the 44px tap floor.

/**
 * Sticky single-store filter for shopping mode. A horizontal row of
 * compact circular discs — "All stores" (a filter glyph) plus one
 * monogram per household store — where exactly one is active. Discs
 * keep the row tight on a phone where full store-name pills would
 * overflow; each carries the full name as an accessible label +
 * tooltip.
 *
 * Store monograms reuse the Avatar pattern (initials on a
 * deterministic warm disc) — the design system's sanctioned way to
 * represent an entity without a logo or photo. The active disc gets
 * a tomato ring; inactive discs dim slightly.
 *
 * Presentational: the parent owns `value` (and persists it).
 */
export function StoreFilter({
  stores = [],
  logos,
  value = "all",
  onChange,
  className = "",
  ...rest
}: StoreFilterProps) {
  return (
    <div
      className={["gr-storefilter", className].filter(Boolean).join(" ")}
      role="group"
      aria-label="Filter by store"
      style={{
        display: "flex",
        gap: "var(--space-2)",
        overflowX: "auto",
        // Pad on all sides so the active disc's 2px tomato ring (a
        // box-shadow that sits just outside the disc box) isn't
        // clipped by the scroll container — `overflow-x: auto`
        // forces `overflow-y: auto`, which would otherwise shave the
        // top of the selected ring.
        padding: "var(--space-1)",
      }}
      {...rest}
    >
      <StoreDisc
        label="All stores"
        active={value === "all"}
        onClick={() => onChange && onChange("all")}
      >
        <span
          aria-hidden="true"
          style={{
            width: DISC,
            height: DISC,
            borderRadius: "var(--radius-pill)",
            background: "var(--paper-200)",
            color: "var(--ink-500)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="filter" size={18} />
        </span>
      </StoreDisc>

      {stores.map((s) => (
        <StoreDisc
          key={s}
          label={s}
          active={value === s}
          onClick={() => onChange && onChange(s)}
        >
          <StoreLogo name={s} logo={logos?.[s]} size={DISC} />
        </StoreDisc>
      ))}
    </div>
  );
}

function StoreDisc({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      style={{
        flex: "0 0 auto",
        padding: 2,
        border: "none",
        borderRadius: "var(--radius-pill)",
        background: "transparent",
        cursor: "pointer",
        display: "inline-flex",
        opacity: active ? 1 : 0.6,
        boxShadow: active
          ? "0 0 0 2px var(--tomato-500)"
          : "0 0 0 1px var(--border-faint)",
        transition:
          "opacity var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
      }}
    >
      {children}
    </button>
  );
}
