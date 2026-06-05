import React from "react";
import { Icon } from "../core/Icon";
import { categoryColors, categoryLabel } from "./categories.js";

/**
 * The serif header above each aisle section. Shows a category color
 * dot, the aisle name, and an optional item count on the right.
 */
export function AisleHeader({ category, count, className = "", ...rest }) {
  const colors = categoryColors(category);
  const isFreezer = category === "freezer";
  return (
    <div className={["gr-aisle", className].join(" ")} {...rest}>
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
