import type { HTMLAttributes, ReactNode } from "react";
import type { GroceryCategory } from "@grocery/shared";
import { Checkbox } from "../forms/Checkbox";
import { CategoryTag } from "./CategoryTag";

export interface GroceryItemRowProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onToggle"> {
  /** Shopper-friendly line, e.g. "Yellow onions (3 medium)". */
  text: string;
  /** Manual count; the ×N badge only shows when > 1. Default 1. */
  quantity?: number;
  /** Aisle category — only rendered as a chip when `showCategory`. */
  category?: GroceryCategory;
  /** Store names that carry this item. */
  stores?: string[];
  /** Checked (bought) state. Default false. */
  checked?: boolean;
  /** Fired when the checkoff is tapped. */
  onToggle?: () => void;
  /** Show the category chip — for store-grouped views. Default false. */
  showCategory?: boolean;
  /** Optional trailing node (e.g. an edit IconButton in plan mode). */
  trailing?: ReactNode;
}

/**
 * One row on the grocery list. A big checkoff, the shopper-friendly
 * item text, an optional ×N count badge, and a meta line of store
 * names (+ an optional category chip in store-grouped views). When
 * checked, the text strikes through in olive and the row tints.
 *
 * Stateless: the parent owns `checked` and handles `onToggle`. Pass
 * `showCategory` in store-grouped views where the section header
 * isn't already the category.
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
}: GroceryItemRowProps) {
  return (
    <div
      className={[
        "gr-item",
        checked ? "gr-item--checked" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <Checkbox checked={checked} onChange={() => onToggle && onToggle()} />
      <div className="gr-item__body">
        <span className="gr-item__text">{text}</span>
        <span className="gr-item__meta">
          {showCategory && category && <CategoryTag category={category} />}
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
