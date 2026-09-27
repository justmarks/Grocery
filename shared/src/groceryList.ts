// SOURCE: RecipeTracker/shared/src/mealPlan.ts
//
// Vendored copy of the GroceryItem / GroceryList shape that RecipeTracker
// emits when a meal plan is converted into a shopping list. Keep this in
// sync via versioned import payloads (`schemaVersion`), NOT by linking
// the upstream package — see PLAN.md § "Should `shared/` be cross-repo?"
//
// Grocery's categories have diverged from RecipeTracker's canonical 10
// (see GROCERY_CATEGORIES below); imported categories are normalized
// on parse. Imported items never carry `freezer`; the user reassigns at
// import-preview time if needed.

import { z } from "zod";

/**
 * The eleven aisle categories.
 *
 * Grocery started with RecipeTracker's ten categories + `freezer`, then
 * diverged: `fruits` + `vegetables` merged into `produce`, and
 * `bread-and-crackers` split into `bread` + `chips-and-crackers`.
 * Documents written before that change still carry the old slugs —
 * run every stored / imported category through `normalizeCategory`
 * (and household orders through `normalizeCategoryOrder`) on read.
 *
 * Order here is the **canonical store-walk order** — perishables
 * first, pantry + paper + freezer + misc last. This array doubles as
 * the seeded default for `households/{id}.categoryOrder` on creation.
 *
 * Aligned with the design system's `CATEGORIES` array in
 * `design-system/project/components/grocery/categories.js`.
 */
export const GROCERY_CATEGORIES = [
  "produce",
  "meats",
  "dairy",
  "cheeses",
  "baking-and-dry-goods",
  "bread",
  "chips-and-crackers",
  "beverages",
  "paper-goods",
  "freezer",
  "misc",
] as const;

export type GroceryCategory = (typeof GROCERY_CATEGORIES)[number];

/**
 * Retired slugs → their replacement. Existing Firestore docs and
 * RecipeTracker meal-plan payloads (which still emit its original ten
 * categories) use these.
 */
export const LEGACY_CATEGORY_ALIASES = {
  "fruits": "produce",
  "vegetables": "produce",
  "bread-and-crackers": "bread",
} as const satisfies Record<string, GroceryCategory>;

export type LegacyGroceryCategory = keyof typeof LEGACY_CATEGORY_ALIASES;

const CATEGORY_SET: ReadonlySet<string> = new Set(GROCERY_CATEGORIES);

export function isGroceryCategory(value: unknown): value is GroceryCategory {
  return typeof value === "string" && CATEGORY_SET.has(value);
}

/**
 * Map any stored / imported category to a current slug. Legacy slugs
 * resolve via `LEGACY_CATEGORY_ALIASES`; anything unrecognized falls
 * back to `misc`.
 */
export function normalizeCategory(value: unknown): GroceryCategory {
  if (isGroceryCategory(value)) return value;
  if (typeof value === "string" && Object.hasOwn(LEGACY_CATEGORY_ALIASES, value)) {
    return LEGACY_CATEGORY_ALIASES[value as LegacyGroceryCategory];
  }
  return "misc";
}

/**
 * Normalize a household's saved `categoryOrder`: legacy slugs are
 * mapped (merged categories collapse to the first occurrence), unknown
 * entries are dropped, and any current category missing from the saved
 * order is inserted right after its nearest canonical predecessor —
 * so a new aisle lands where the default order would put it without
 * disturbing the user's customizations.
 */
export function normalizeCategoryOrder(
  order: readonly unknown[] | null | undefined,
): GroceryCategory[] {
  const result: GroceryCategory[] = [];
  for (const raw of order ?? []) {
    if (!isGroceryCategory(raw)
      && !(typeof raw === "string" && Object.hasOwn(LEGACY_CATEGORY_ALIASES, raw))) {
      continue;
    }
    const c = normalizeCategory(raw);
    if (!result.includes(c)) result.push(c);
  }
  GROCERY_CATEGORIES.forEach((c, canonicalIdx) => {
    if (result.includes(c)) return;
    let insertAt = 0;
    for (let i = canonicalIdx - 1; i >= 0; i--) {
      const at = result.indexOf(GROCERY_CATEGORIES[i]!);
      if (at !== -1) {
        insertAt = at + 1;
        break;
      }
    }
    result.splice(insertAt, 0, c);
  });
  return result;
}

/**
 * Categories accepted on a RecipeTracker meal-plan import. RecipeTracker
 * still emits its original ten (including the legacy `fruits`,
 * `vegetables`, `bread-and-crackers`); current slugs are accepted too
 * so either side can move first. `freezer` is intentionally excluded —
 * the upstream meal-plan generator doesn't know about it. Parsed values
 * are normalized to current slugs.
 */
export const RecipeTrackerCategorySchema = z
  .enum([
    "fruits",
    "vegetables",
    "produce",
    "meats",
    "dairy",
    "cheeses",
    "baking-and-dry-goods",
    "bread-and-crackers",
    "bread",
    "chips-and-crackers",
    "beverages",
    "paper-goods",
    "misc",
  ])
  .transform((c) => normalizeCategory(c));

export const GroceryCategorySchema = z.enum(GROCERY_CATEGORIES);

/**
 * Human-readable category labels — kept aligned with the design
 * system's `CATEGORIES` array. Display via CSS `text-transform`
 * stays unset — these strings are already cased for the eye.
 */
export const GROCERY_CATEGORY_LABELS: Record<GroceryCategory, string> = {
  "produce": "Produce",
  "meats": "Meats",
  "dairy": "Dairy",
  "cheeses": "Cheeses",
  "baking-and-dry-goods": "Baking & Dry Goods",
  "bread": "Bread",
  "chips-and-crackers": "Chips & Crackers",
  "beverages": "Beverages",
  "paper-goods": "Paper Goods",
  "freezer": "Freezer",
  "misc": "Misc",
};

/**
 * A single line on an imported grocery list. `text` is a
 * shopper-friendly string already combining quantity + item
 * ("Yellow onions (3 medium)") — don't parse it apart at import
 * time. The Grocery app's separate numeric `quantity` field is for
 * manually-entered items; imports default it to 1.
 */
export const GroceryItemSchema = z.object({
  text: z.string().min(1).max(280),
  category: RecipeTrackerCategorySchema,
});
export type GroceryItem = z.infer<typeof GroceryItemSchema>;

export const GroceryListSchema = z.object({
  items: z.array(GroceryItemSchema),
});
export type GroceryList = z.infer<typeof GroceryListSchema>;
