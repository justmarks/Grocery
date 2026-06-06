import type { HTMLAttributes } from "react";
import type { GroceryCategory } from "@grocery/shared";
import { Icon } from "../core/Icon";
import { categoryColors, categoryLabel } from "./categories";

export interface AisleHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Aisle slug — drives the label, color dot, and (for freezer) icon. */
  category: GroceryCategory;
  /** Optional item count shown right-aligned. */
  count?: number;
}

/**
 * The serif header above each aisle section. Shows a category color
 * dot (or the snowflake glyph for the freezer aisle), the aisle name,
 * and an optional item count on the right.
 */
export function AisleHeader({
  category,
  count,
  className = "",
  ...rest
}: AisleHeaderProps) {
  const colors = categoryColors(category);
  const isFreezer = category === "freezer";
  return (
    <div
      className={["gr-aisle", className].filter(Boolean).join(" ")}
      {...rest}
    >
      {isFreezer ? (
        <span style={{ color: colors.fg, display: "inline-flex" }}>
          <Icon name="snowflake" size={18} />
        </span>
      ) : (
        <span
          className="gr-tag__dot"
          style={{ background: colors.mid, width: 10, height: 10 }}
        />
      )}
      <span className="gr-aisle__name">{categoryLabel(category)}</span>
      {count != null && <span className="gr-aisle__count">{count}</span>}
    </div>
  );
}
