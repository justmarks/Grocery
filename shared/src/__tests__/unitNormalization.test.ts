import { describe, it, expect } from "vitest";
import {
  parseIngredientAmount,
  extractPreferredUnit,
  aggregateAndNormalizeItems,
  ingredientSlug,
} from "../unitNormalization";

describe("parseIngredientAmount", () => {
  it("parses integer + unit", () => {
    expect(parseIngredientAmount("18 tbsp butter")).toEqual({ qty: 18, unit: "tbsp", ingredient: "butter" });
    expect(parseIngredientAmount("2 cups flour")).toEqual({ qty: 2, unit: "cups", ingredient: "flour" });
    expect(parseIngredientAmount("3 oz cream cheese")).toEqual({ qty: 3, unit: "oz", ingredient: "cream cheese" });
  });

  it("parses slash fractions", () => {
    expect(parseIngredientAmount("1/4 tsp cumin")).toEqual({ qty: 0.25, unit: "tsp", ingredient: "cumin" });
    expect(parseIngredientAmount("3/4 cup sugar")).toEqual({ qty: 0.75, unit: "cup", ingredient: "sugar" });
  });

  it("parses mixed numbers", () => {
    const r = parseIngredientAmount("1 1/2 cups milk");
    expect(r?.qty).toBe(1.5);
    expect(r?.unit).toBe("cups");
    expect(r?.ingredient).toBe("milk");
  });

  it("parses unicode fractions", () => {
    expect(parseIngredientAmount("¾ cup sugar")).toEqual({ qty: 0.75, unit: "cup", ingredient: "sugar" });
    expect(parseIngredientAmount("½ tsp salt")).toEqual({ qty: 0.5, unit: "tsp", ingredient: "salt" });
  });

  it("parses shopping units", () => {
    expect(parseIngredientAmount("2 sticks butter")).toEqual({ qty: 2, unit: "sticks", ingredient: "butter" });
    expect(parseIngredientAmount("1 stick butter")).toEqual({ qty: 1, unit: "stick", ingredient: "butter" });
  });

  it("parses unitless counts", () => {
    expect(parseIngredientAmount("3 eggs")).toEqual({ qty: 3, unit: null, ingredient: "eggs" });
    expect(parseIngredientAmount("2 lemons")).toEqual({ qty: 2, unit: null, ingredient: "lemons" });
  });

  it("handles 'c' abbreviation for cup without capturing ingredient first letter", () => {
    expect(parseIngredientAmount("1 c flour")).toEqual({ qty: 1, unit: "c", ingredient: "flour" });
    // "c" should not eat the first letter of "cumin"
    expect(parseIngredientAmount("2 cumin powder")).toEqual({ qty: 2, unit: null, ingredient: "cumin powder" });
  });

  it("returns null when no leading quantity", () => {
    expect(parseIngredientAmount("Salt to taste")).toBeNull();
    expect(parseIngredientAmount("Pepper")).toBeNull();
    expect(parseIngredientAmount("")).toBeNull();
  });

  it("is case-insensitive for unit matching", () => {
    const r = parseIngredientAmount("2 CUPS flour");
    expect(r?.unit).toBe("cups");
  });
});

describe("extractPreferredUnit", () => {
  it("extracts unit from normalized strings", () => {
    expect(extractPreferredUnit("2¼ sticks Butter")).toBe("sticks");
    expect(extractPreferredUnit("1 cup 2 tbsp Butter")).toBe("cup");
    expect(extractPreferredUnit("1½ cups Milk")).toBe("cups");
    expect(extractPreferredUnit("8 oz Cream Cheese")).toBe("oz");
  });

  it("returns null when no unit", () => {
    expect(extractPreferredUnit("Butter")).toBeNull();
    expect(extractPreferredUnit("Salt")).toBeNull();
    expect(extractPreferredUnit("")).toBeNull();
  });
});

describe("ingredientSlug", () => {
  it("lowercases and normalizes whitespace", () => {
    expect(ingredientSlug("Butter")).toBe("butter");
    expect(ingredientSlug("Unsalted  Butter")).toBe("unsalted butter");
    expect(ingredientSlug("  garlic  ")).toBe("garlic");
  });
});

describe("aggregateAndNormalizeItems", () => {
  const noPreference = () => undefined;

  it("rationalizes 18 tbsp butter to sticks", () => {
    const result = aggregateAndNormalizeItems(
      [{ text: "18 tbsp butter", category: "dairy" }],
      noPreference,
    );
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("2¼ sticks Butter");
    expect(result[0].ingredientName).toBe("Butter");
  });

  it("aggregates butter from three recipes", () => {
    const result = aggregateAndNormalizeItems(
      [
        { text: "4 tbsp butter", category: "dairy" },
        { text: "8 tbsp butter", category: "dairy" },
        { text: "6 tbsp butter", category: "dairy" },
      ],
      noPreference,
    );
    expect(result).toHaveLength(1);
    // 18 tbsp = 54 tsp / 24 tsp per stick = 2.25 sticks
    expect(result[0].text).toBe("2¼ sticks Butter");
  });

  it("strips spice-level amounts (< 1 tbsp)", () => {
    const result = aggregateAndNormalizeItems(
      [
        { text: "1/4 tsp cumin", category: "baking-and-dry-goods" },
        { text: "1/2 tsp cumin", category: "baking-and-dry-goods" },
      ],
      noPreference,
    );
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("Cumin");
  });

  it("keeps amounts at exactly 1 tbsp (spice threshold boundary)", () => {
    const result = aggregateAndNormalizeItems(
      [{ text: "1 tbsp olive oil", category: "baking-and-dry-goods" }],
      noPreference,
    );
    expect(result[0].text).toBe("1 tbsp Olive oil");
  });

  it("aggregates egg counts", () => {
    const result = aggregateAndNormalizeItems(
      [
        { text: "3 eggs", category: "dairy" },
        { text: "2 eggs", category: "dairy" },
      ],
      noPreference,
    );
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("5 Eggs");
  });

  it("rationalizes volume: 18 tbsp flour to 1 cup 2 tbsp", () => {
    const result = aggregateAndNormalizeItems(
      [{ text: "18 tbsp flour", category: "baking-and-dry-goods" }],
      noPreference,
    );
    expect(result[0].text).toBe("1 cup 2 tbsp Flour");
  });

  it("passes through opaque strings (no leading number)", () => {
    const result = aggregateAndNormalizeItems(
      [{ text: "Salt to taste", category: "baking-and-dry-goods" }],
      noPreference,
    );
    expect(result[0].text).toBe("Salt to taste");
  });

  it("deduplicates opaque items with the same text", () => {
    const result = aggregateAndNormalizeItems(
      [
        { text: "Salt to taste", category: "baking-and-dry-goods" },
        { text: "Salt to taste", category: "baking-and-dry-goods" },
      ],
      noPreference,
    );
    expect(result).toHaveLength(1);
  });

  it("respects user preferred unit from catalog", () => {
    const result = aggregateAndNormalizeItems(
      [{ text: "18 tbsp butter", category: "dairy" }],
      (slug) => slug === "butter" ? "cups" : undefined,
    );
    // 18 tbsp = 54 tsp / 48 tsp per cup = 1.125 cups → "1⅛ cups"
    expect(result[0].text).toBe("1⅛ cups Butter");
  });

  it("preferred unit overrides the built-in shopping unit", () => {
    const result = aggregateAndNormalizeItems(
      [{ text: "2 cups butter", category: "dairy" }],
      (slug) => slug === "butter" ? "cups" : undefined,
    );
    expect(result[0].text).toBe("2 cups Butter");
  });

  it("handles cup input already in cups without double-converting", () => {
    const result = aggregateAndNormalizeItems(
      [{ text: "2 cups flour", category: "baking-and-dry-goods" }],
      noPreference,
    );
    expect(result[0].text).toBe("2 cups Flour");
  });

  it("rationalizes weight: 24 oz to 1 lb 8 oz", () => {
    const result = aggregateAndNormalizeItems(
      [{ text: "24 oz beef", category: "meats" }],
      noPreference,
    );
    expect(result[0].text).toBe("1 lb 8 oz Beef");
  });

  it("aggregates weight amounts", () => {
    const result = aggregateAndNormalizeItems(
      [
        { text: "8 oz chicken", category: "meats" },
        { text: "8 oz chicken", category: "meats" },
      ],
      noPreference,
    );
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("1 lb Chicken");
  });

  it("keeps volume and weight for same ingredient separate", () => {
    const result = aggregateAndNormalizeItems(
      [
        { text: "2 oz cheddar", category: "cheeses" },
        { text: "½ cup cheddar", category: "cheeses" },
      ],
      noPreference,
    );
    // Different measurement kinds can't be summed → two rows
    expect(result).toHaveLength(2);
  });

  it("preserves insertion order for display", () => {
    const result = aggregateAndNormalizeItems(
      [
        { text: "2 cups flour", category: "baking-and-dry-goods" },
        { text: "3 eggs", category: "dairy" },
        { text: "1 cup butter", category: "dairy" },
      ],
      noPreference,
    );
    expect(result.map((r) => r.ingredientName)).toEqual(["Flour", "Eggs", "Butter"]);
  });
});
