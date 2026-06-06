// SOURCE: RecipeTracker/shared/src/mealPlan.ts
//
// Vendored copy of the GroceryItem / GroceryList shape that RecipeTracker
// emits when a meal plan is converted into a shopping list. Keep this in
// sync via versioned import payloads (`schemaVersion`), NOT by linking
// the upstream package — see PLAN.md § "Should `shared/` be cross-repo?"
//
// Grocery extends the canonical 10 categories with a `freezer` slug for
// items the meal-plan model doesn't anticipate (the freezer aisle isn't
// part of the recipe domain). Imported items never carry `freezer`; the
// user reassigns at import-preview time if needed.

import { z } from "zod";

/**
 * The eleven aisle categories. Ten are inherited verbatim from
 * RecipeTracker's `GROCERY_CATEGORIES` (meal-plan imports rely on
 * exact-match strings). The eleventh, `freezer`, is Grocery-only.
 *
 * Order here is the **canonical store-walk order** — perishables
 * first, pantry + paper + freezer + misc last. This array doubles as
 * the seeded default for `households/{id}.categoryOrder` on creation.
 *
 * Aligned with the design system's `CATEGORIES` array in
 * `design-system/project/components/grocery/categories.js`.
 */
export const GROCERY_CATEGORIES = [
  "fruits",
  "vegetables",
  "meats",
  "dairy",
  "cheeses",
  "baking-and-dry-goods",
  "bread-and-crackers",
  "beverages",
  "paper-goods",
  "freezer",
  "misc",
] as const;

export type GroceryCategory = (typeof GROCERY_CATEGORIES)[number];

/**
 * The ten categories RecipeTracker is allowed to emit. Used to
 * validate the meal-plan import payload — `freezer` is intentionally
 * excluded here because the upstream meal-plan generator doesn't know
 * about it.
 */
export const RECIPETRACKER_CATEGORIES = GROCERY_CATEGORIES.filter(
  (c) => c !== "freezer",
) as readonly Exclude<GroceryCategory, "freezer">[];

export const RecipeTrackerCategorySchema = z.enum([
  "fruits",
  "vegetables",
  "meats",
  "dairy",
  "cheeses",
  "baking-and-dry-goods",
  "bread-and-crackers",
  "beverages",
  "paper-goods",
  "misc",
]);

export const GroceryCategorySchema = z.enum(GROCERY_CATEGORIES);

/**
 * Human-readable category labels — kept aligned with the design
 * system's `CATEGORIES` array. Display via CSS `text-transform`
 * stays unset — these strings are already cased for the eye.
 */
export const GROCERY_CATEGORY_LABELS: Record<GroceryCategory, string> = {
  "fruits": "Fruits",
  "vegetables": "Vegetables",
  "meats": "Meats",
  "dairy": "Dairy",
  "cheeses": "Cheeses",
  "baking-and-dry-goods": "Baking & Dry Goods",
  "bread-and-crackers": "Bread & Crackers",
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
