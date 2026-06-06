import type { HTMLAttributes } from "react";
import { Icon, type IconName } from "../core/Icon";

export type Mode = "plan" | "shop";

export interface ModeToggleProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Active mode. Default "plan". */
  value?: Mode;
  /** Called with the newly-selected mode. */
  onChange?: (value: Mode) => void;
}

const OPTS: { key: Mode; label: string; icon: IconName }[] = [
  { key: "plan", label: "Plan", icon: "pencil" },
  { key: "shop", label: "Shop", icon: "shopping-cart" },
];

/**
 * The Plan / Shop segmented toggle that sits at the top of the list.
 * "Plan" is write mode (add + edit items); "Shop" is read mode (big
 * checkoffs, store filter). The active Shop option tints olive to
 * signal the "at the store" context.
 */
export function ModeToggle({
  value = "plan",
  onChange,
  className = "",
  ...rest
}: ModeToggleProps) {
  return (
    <div
      className={["gr-modetoggle", className].filter(Boolean).join(" ")}
      role="tablist"
      {...rest}
    >
      {OPTS.map((o) => (
        <button
          key={o.key}
          type="button"
          role="tab"
          aria-selected={value === o.key}
          className={[
            "gr-modetoggle__opt",
            o.key === "shop" ? "gr-modetoggle__opt--shop" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onChange && onChange(o.key)}
        >
          <Icon name={o.icon} size={16} />
          {o.label}
        </button>
      ))}
    </div>
  );
}
