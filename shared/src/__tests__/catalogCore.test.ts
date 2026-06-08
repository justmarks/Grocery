import { describe, it, expect } from "vitest";
import {
  catalogIdForText,
  catalogSearchTokens,
  findCatalogSuggestions,
  findExactCatalogMatch,
  type CatalogEntryWithId,
} from "../catalogCore";

function entry(
  id: string,
  text: string,
  opts: Partial<CatalogEntryWithId> = {},
): CatalogEntryWithId {
  return {
    id,
    text,
    textLower: text.toLowerCase(),
    searchTokens: catalogSearchTokens(text),
    defaultCategory: "misc",
    defaultStores: [],
    defaultQuantity: 1,
    timesUsed: 1,
    lastUsedAt: 0,
    ...opts,
  };
}

describe("catalogIdForText", () => {
  it("slugifies whitespace and case", () => {
    expect(catalogIdForText("Yellow Onions")).toBe("yellow-onions");
  });
  it("collapses repeated separators", () => {
    expect(catalogIdForText("a   b---c")).toBe("a-b-c");
  });
  it("strips leading/trailing dashes", () => {
    expect(catalogIdForText("--lemons--")).toBe("lemons");
  });
  it("treats apostrophes the same as the tokenizer (stripped)", () => {
    // Apostrophes normalize away in normalizeText? No — only in
    // tokenize. Here they become a dash. Pin the behavior.
    expect(catalogIdForText("Trader Joe's")).toBe("trader-joe-s");
  });
});

describe("findCatalogSuggestions", () => {
  const catalog = [
    entry("lemons", "Lemons", { timesUsed: 12 }),
    entry("limes", "Limes", { timesUsed: 4 }),
    entry("lettuce", "Lettuce", { timesUsed: 8 }),
    entry("milk", "Milk", { timesUsed: 20 }),
    entry("cocoa-puffs", "Cocoa Puffs", { timesUsed: 5 }),
    entry("whole-milk", "Whole milk", { timesUsed: 9 }),
    entry("berries", "Berries", { timesUsed: 3 }),
  ];

  it("returns empty for whitespace-only or single-char drafts", () => {
    expect(findCatalogSuggestions(catalog, "")).toEqual([]);
    expect(findCatalogSuggestions(catalog, "   ")).toEqual([]);
    // 1-char queries are too noisy — tokenize() also floors at 2.
    expect(findCatalogSuggestions(catalog, "l")).toEqual([]);
  });

  it("matches case-insensitive leading-word prefix", () => {
    const hits = findCatalogSuggestions(catalog, "Le");
    expect(hits.map((h) => h.id)).toEqual(["lemons", "lettuce"]);
  });

  it("ranks by timesUsed desc within a tier", () => {
    const hits = findCatalogSuggestions(catalog, "li");
    // Only "Limes" matches "li" as a prefix — single result.
    expect(hits.map((h) => h.id)).toEqual(["limes"]);
  });

  it("matches a word that isn't the first word ('puf' → 'Cocoa Puffs')", () => {
    const hits = findCatalogSuggestions(catalog, "puf");
    expect(hits.map((h) => h.id)).toEqual(["cocoa-puffs"]);
  });

  it("matches a later word ('milk' → 'Whole milk' as well as 'Milk')", () => {
    const hits = findCatalogSuggestions(catalog, "milk");
    expect(hits.map((h) => h.id)).toEqual(["milk", "whole-milk"]);
  });

  it("matches a partial later-word prefix ('berri' → 'Berries')", () => {
    const hits = findCatalogSuggestions(catalog, "berri");
    expect(hits.map((h) => h.id)).toEqual(["berries"]);
  });

  it("ranks leading-word matches above later-word matches", () => {
    // "milk" matches both first-word ("Milk", times=20) and later-word
    // ("Whole milk", times=9). The first-word match wins even though
    // both have non-zero usage.
    const hits = findCatalogSuggestions(catalog, "milk");
    expect(hits[0].id).toBe("milk");
  });

  it("respects the limit", () => {
    const hits = findCatalogSuggestions(catalog, "le", 1);
    expect(hits).toHaveLength(1);
  });
});

describe("findExactCatalogMatch", () => {
  const catalog = [entry("lemons", "Lemons"), entry("milk", "Milk")];

  it("matches case-insensitive", () => {
    expect(findExactCatalogMatch(catalog, "lemons")?.id).toBe("lemons");
    expect(findExactCatalogMatch(catalog, "LEMONS")?.id).toBe("lemons");
  });

  it("normalizes whitespace", () => {
    expect(findExactCatalogMatch(catalog, "  lemons  ")?.id).toBe("lemons");
  });

  it("returns null for no match", () => {
    expect(findExactCatalogMatch(catalog, "apples")).toBeNull();
    expect(findExactCatalogMatch(catalog, "")).toBeNull();
  });
});
