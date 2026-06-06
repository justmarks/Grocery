import type { SelectHTMLAttributes } from "react";
import { Icon } from "../core/Icon";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

/**
 * Standard select. Matches Input's border / radius / type so paired
 * fields align, with the native arrow hidden in favor of a chevron.
 */
export function Select({ className = "", children, ...rest }: SelectProps) {
  return (
    <div className="gr-select-wrap">
      <select
        className={["gr-select", className].filter(Boolean).join(" ")}
        {...rest}
      >
        {children}
      </select>
      <span aria-hidden="true" className="gr-select-chevron">
        <Icon name="chevron-down" size={16} />
      </span>
    </div>
  );
}
