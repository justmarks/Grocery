import React from "react";
import { Icon } from "../core/Icon";

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
}) {
  const options = [{ key: "all", label: "All stores", icon: "filter" }].concat(
    stores.map((s) => ({ key: s, label: s, icon: "store" })),
  );
  return (
    <div
      className={["gr-storefilter", className].join(" ")}
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
