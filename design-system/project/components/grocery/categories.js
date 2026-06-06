/**
 * Grocery aisle categories — the eleven GROCERY_CATEGORIES (ten
 * inherited from RecipeTracker's meal-plan schema, plus the
 * Grocery-only `freezer`). Each maps to a human label, a CSS-var
 * token prefix (resolving to --cat-<key>-bg / -mid / -fg), and an
 * icon. Kept in canonical store-walk order: perishables first,
 * pantry + paper last.
 *
 * Imported by category-aware components (CategoryTag, AisleHeader)
 * and any UI kit screen that renders the list.
 */
export const CATEGORIES = [
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
];

export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
);

/** Resolve a category's three color tokens to CSS var() expressions. */
export function categoryColors(slug) {
  const c = CATEGORY_BY_SLUG[slug] ?? CATEGORY_BY_SLUG.misc;
  return {
    bg: `var(--cat-${c.token}-bg)`,
    mid: `var(--cat-${c.token}-mid)`,
    fg: `var(--cat-${c.token}-fg)`,
  };
}

export function categoryLabel(slug) {
  return (CATEGORY_BY_SLUG[slug] ?? CATEGORY_BY_SLUG.misc).label;
}
