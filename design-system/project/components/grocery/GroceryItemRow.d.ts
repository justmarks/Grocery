import type { HTMLAttributes, ReactNode } from "react";
import type { GroceryCategory } from "./CategoryTag";

/**
 * One row on the grocery list — checkoff, item text, count, stores.
 *
 * @startingPoint section="Grocery" subtitle="A single checkoff list row with stores + count" viewport="700x88"
 */
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

export function GroceryItemRow(props: GroceryItemRowProps): JSX.Element;
