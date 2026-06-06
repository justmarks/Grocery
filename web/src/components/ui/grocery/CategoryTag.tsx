import type { HTMLAttributes, ReactNode } from "react";
import type { GroceryCategory } from "@grocery/shared";
import { categoryColors, categoryLabel } from "./categories";

export interface CategoryTagProps extends HTMLAttributes<HTMLSpanElement> {
  /** Aisle slug — drives both the label and the chip color. */
  category: GroceryCategory;
  /** Show the leading color dot. Default true. */
  dot?: boolean;
  /** Override the label text (defaults to the category's display name). */
  children?: ReactNode;
}

/**
 * A flat color chip marking an item's aisle category. A leading color
 * dot anchors the shopper's eye to the section color even when chips
 * wrap.
 */
export function CategoryTag({
  category,
  children,
  dot = true,
  className = "",
  style,
  ...rest
}: CategoryTagProps) {
  const colors = categoryColors(category);
  return (
    <span
      className={["gr-tag", className].filter(Boolean).join(" ")}
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
