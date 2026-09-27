import { describe, it, expect } from "vitest";
import {
  GROCERY_CATEGORIES,
  normalizeCategory,
  normalizeCategoryOrder,
} from "../groceryList";

describe("normalizeCategory", () => {
  it("passes current slugs through", () => {
    for (const c of GROCERY_CATEGORIES) expect(normalizeCategory(c)).toBe(c);
  });

  it("maps legacy slugs", () => {
    expect(normalizeCategory("fruits")).toBe("produce");
    expect(normalizeCategory("vegetables")).toBe("produce");
    expect(normalizeCategory("bread-and-crackers")).toBe("bread");
  });

  it("falls back to misc for unknown values", () => {
    expect(normalizeCategory("snacks")).toBe("misc");
    expect(normalizeCategory(undefined)).toBe("misc");
    expect(normalizeCategory("toString")).toBe("misc");
  });
});

describe("normalizeCategoryOrder", () => {
  it("migrates the old default order to the new default", () => {
    const oldDefault = [
      "fruits", "vegetables", "meats", "dairy", "cheeses",
      "baking-and-dry-goods", "bread-and-crackers", "beverages",
      "paper-goods", "freezer", "misc",
    ];
    expect(normalizeCategoryOrder(oldDefault)).toEqual([...GROCERY_CATEGORIES]);
  });

  it("keeps a customized order and slots new aisles after their canonical predecessor", () => {
    const custom = [
      "dairy", "vegetables", "meats", "fruits", "cheeses",
      "bread-and-crackers", "baking-and-dry-goods", "misc",
      "beverages", "paper-goods", "freezer",
    ];
    expect(normalizeCategoryOrder(custom)).toEqual([
      "dairy", "produce", "meats", "cheeses",
      "bread", "chips-and-crackers", "baking-and-dry-goods", "misc",
      "beverages", "paper-goods", "freezer",
    ]);
  });

  it("drops unknown entries and fills an empty order with the defaults", () => {
    expect(normalizeCategoryOrder(["bogus"])).toEqual([...GROCERY_CATEGORIES]);
    expect(normalizeCategoryOrder(undefined)).toEqual([...GROCERY_CATEGORIES]);
  });

  it("is idempotent", () => {
    const once = normalizeCategoryOrder(["misc", "fruits", "freezer"]);
    expect(normalizeCategoryOrder(once)).toEqual(once);
  });
});
