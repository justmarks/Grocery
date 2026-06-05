import type { HTMLAttributes } from "react";
import type { GroceryCategory } from "./CategoryTag";

/** Serif section header above each aisle group of items. */
export interface AisleHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Aisle slug — drives the label, color dot, and (for freezer) icon. */
  category: GroceryCategory;
  /** Optional item count shown right-aligned. */
  count?: number;
}

export function AisleHeader(props: AisleHeaderProps): JSX.Element;
