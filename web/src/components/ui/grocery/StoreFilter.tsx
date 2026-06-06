import type { HTMLAttributes } from "react";
import { Icon, type IconName } from "../core/Icon";

export interface StoreFilterProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Household store names. */
  stores: string[];
  /** Active key — "all" or one of `stores`. Default "all". */
  value?: string;
  /** Called with the newly-selected key. */
  onChange?: (value: string) => void;
}

/**
 * Sticky single-store filter for shopping mode. A horizontal row of
 * pills — "All stores" plus one per household store — where exactly
 * one is active. Selection is meant to persist in local storage so
 * reopening the app at the store keeps the filter (the parent owns
 * `value`; this is presentational).
 */
export function StoreFilter({
  stores = [],
  value = "all",
  onChange,
  className = "",
  ...rest
}: StoreFilterProps) {
  const options: { key: string; label: string; icon: IconName }[] = [
    { key: "all", label: "All stores", icon: "filter" },
    ...stores.map((s) => ({ key: s, label: s, icon: "store" as IconName })),
  ];
  return (
    <div
      className={["gr-storefilter", className].filter(Boolean).join(" ")}
      style={{ display: "flex", gap: "var(--space-2)", overflowX: "auto" }}
      {...rest}
    >
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          className="gr-chip"
          aria-pressed={value === opt.key}
          onClick={() => onChange && onChange(opt.key)}
        >
          <Icon name={opt.icon} size={15} />
          {opt.label}
        </button>
      ))}
    </div>
  );
}
