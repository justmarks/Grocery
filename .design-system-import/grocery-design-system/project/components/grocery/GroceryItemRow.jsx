import React from "react";
import { Checkbox } from "../forms/Checkbox.jsx";
import { CategoryTag } from "./CategoryTag.jsx";

/**
 * One row on the grocery list. A big checkoff, the shopper-friendly
 * item text, an optional count badge, and a meta line of store names
 * (+ an optional category chip in mixed/grouped views). When checked,
 * the text strikes through in olive and the row tints.
 *
 * Stateless: the parent owns `checked` and handles `onToggle`. Pass
 * `showCategory` in store-grouped views where the section header isn't
 * already the category.
 */
export function GroceryItemRow({
  text,
  quantity = 1,
  category,
  stores = [],
  checked = false,
  onToggle,
  showCategory = false,
  trailing,
  className = "",
  ...rest
}) {
  return (
    <div
      className={[
        "gr-item",
        checked ? "gr-item--checked" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      <Checkbox checked={checked} onChange={() => onToggle && onToggle()} />
      <div className="gr-item__body">
        <span className="gr-item__text">{text}</span>
        <span className="gr-item__meta">
          {showCategory && category && (
            <CategoryTag category={category} />
          )}
          {stores.length > 0 && (
            <span className="count">{stores.join(" · ")}</span>
          )}
        </span>
      </div>
      {quantity > 1 && <span className="gr-item__qty">×{quantity}</span>}
      {trailing}
    </div>
  );
}
