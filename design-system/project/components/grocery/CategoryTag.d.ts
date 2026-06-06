import type { HTMLAttributes, ReactNode } from "react";

export type GroceryCategory =
  | "fruits"
  | "vegetables"
  | "meats"
  | "dairy"
  | "cheeses"
  | "baking-and-dry-goods"
  | "bread-and-crackers"
  | "beverages"
  | "paper-goods"
  | "freezer"
  | "misc";

/** A flat color chip marking an item's aisle category. */
export interface CategoryTagProps extends HTMLAttributes<HTMLSpanElement> {
  /** Aisle slug — drives both the label and the chip color. */
  category: GroceryCategory;
  /** Show the leading color dot. Default true. */
  dot?: boolean;
  /** Override the label text (defaults to the category's display name). */
  children?: ReactNode;
}

export function CategoryTag(props: CategoryTagProps): JSX.Element;
