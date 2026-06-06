// Aligned with @grocery/shared's GROCERY_CATEGORIES + the design system's
// CATEGORIES array (design-system/project/components/grocery/categories.js).
// Order here is the canonical store-walk order — perishables first,
// freezer + misc last. This is the default value for
// `households/{id}.categoryOrder` on creation.

import type { GroceryCategory } from "@grocery/shared";

type CategoryEntry = {
  slug: GroceryCategory;
  label: string;
  token: string; // suffix into --cat-<token>-{bg|mid|fg}
  icon: "snowflake" | "sparkles";
};

export const CATEGORIES: readonly CategoryEntry[] = [
  { slug: "fruits", label: "Fruits", token: "fruits", icon: "sparkles" },
  { slug: "vegetables", label: "Vegetables", token: "vegetables", icon: "sparkles" },
  { slug: "meats", label: "Meats", token: "meats", icon: "sparkles" },
  { slug: "dairy", label: "Dairy", token: "dairy", icon: "sparkles" },
  { slug: "cheeses", label: "Cheeses", token: "cheeses", icon: "sparkles" },
  { slug: "baking-and-dry-goods", label: "Baking & Dry Goods", token: "baking", icon: "sparkles" },
  { slug: "bread-and-crackers", label: "Bread & Crackers", token: "bread", icon: "sparkles" },
  { slug: "beverages", label: "Beverages", token: "beverages", icon: "sparkles" },
  { slug: "paper-goods", label: "Paper Goods", token: "paper", icon: "sparkles" },
  { slug: "freezer", label: "Freezer", token: "freezer", icon: "snowflake" },
  { slug: "misc", label: "Misc", token: "misc", icon: "sparkles" },
] as const;

export const CATEGORY_BY_SLUG: Record<GroceryCategory, CategoryEntry> =
  Object.fromEntries(CATEGORIES.map((c) => [c.slug, c])) as Record<
    GroceryCategory,
    CategoryEntry
  >;

/** Resolve a category slug into its three CSS var() color expressions. */
export function categoryColors(slug: GroceryCategory | undefined): {
  bg: string;
  mid: string;
  fg: string;
} {
  const c = (slug && CATEGORY_BY_SLUG[slug]) ?? CATEGORY_BY_SLUG.misc;
  return {
    bg: `var(--cat-${c.token}-bg)`,
    mid: `var(--cat-${c.token}-mid)`,
    fg: `var(--cat-${c.token}-fg)`,
  };
}

export function categoryLabel(slug: GroceryCategory | undefined): string {
  return (slug && CATEGORY_BY_SLUG[slug]?.label) ?? CATEGORY_BY_SLUG.misc.label;
}
