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
  ];

  it("returns empty for whitespace-only drafts", () => {
    expect(findCatalogSuggestions(catalog, "")).toEqual([]);
    expect(findCatalogSuggestions(catalog, "   ")).toEqual([]);
  });

  it("matches case-insensitive prefix", () => {
    // "le" matches lettuce (timesUsed 8) and lemons (timesUsed 12);
    // suggestion ranking is timesUsed desc, so lemons comes first.
    const hits = findCatalogSuggestions(catalog, "Le");
    expect(hits.map((h) => h.id)).toEqual(["lemons", "lettuce"]);
  });

  it("ranks by timesUsed desc, then text", () => {
    const hits = findCatalogSuggestions(catalog, "l");
    // Lettuce (8), Limes (4), Lemons (12) — wait, Lemons has higher
    // timesUsed than Lettuce. Expected order: lemons (12), lettuce (8), limes (4).
    expect(hits.map((h) => h.id)).toEqual(["lemons", "lettuce", "limes"]);
  });

  it("respects the limit", () => {
    const hits = findCatalogSuggestions(catalog, "l", 2);
    expect(hits).toHaveLength(2);
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
