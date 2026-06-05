import React from "react";
import { Icon } from "../core/Icon";

/**
 * The Plan / Shop segmented toggle that sits at the top of the list.
 * "Plan" is write mode (add + edit items); "Shop" is read mode (big
 * checkoffs, store filter). The active Shop option tints olive to
 * signal the "at the store" context.
 */
export function ModeToggle({ value = "plan", onChange, className = "", ...rest }) {
  const opts = [
    { key: "plan", label: "Plan", icon: "pencil" },
    { key: "shop", label: "Shop", icon: "shopping-cart" },
  ];
  return (
    <div className={["gr-modetoggle", className].join(" ")} role="tablist" {...rest}>
      {opts.map((o) => (
        <button
          key={o.key}
          type="button"
          role="tab"
          aria-selected={value === o.key}
          className={[
            "gr-modetoggle__opt",
            o.key === "shop" ? "gr-modetoggle__opt--shop" : "",
          ].join(" ")}
          onClick={() => onChange && onChange(o.key)}
        >
          <Icon name={o.icon} size={16} />
          {o.label}
        </button>
      ))}
    </div>
  );
}
