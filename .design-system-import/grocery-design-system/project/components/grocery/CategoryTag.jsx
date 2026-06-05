import React from "react";
import { categoryColors, categoryLabel } from "./categories.js";

/**
 * A small flat chip marking an item's aisle category. Pass a
 * `category` slug to auto-resolve label + color, or override `tone`
 * colors / `children` directly. A leading color dot anchors the
 * shopper's eye to the section color even when chips wrap.
 */
export function CategoryTag({
  category,
  children,
  dot = true,
  className = "",
  style,
  ...rest
}) {
  const colors = categoryColors(category);
  return (
    <span
      className={["gr-tag", className].join(" ")}
      style={{ background: colors.bg, color: colors.fg, ...style }}
      {...rest}
    >
      {dot && (
        <span className="gr-tag__dot" style={{ background: colors.mid }} />
      )}
      {children ?? categoryLabel(category)}
    </span>
  );
}
