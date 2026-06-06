import { describe, it, expect } from "vitest";
import { tokenize, normalizeText } from "../searchTokens";

describe("tokenize", () => {
  it("emits prefixes of length 2..n for each word", () => {
    expect(tokenize("Lemons")).toEqual(["le", "lem", "lemo", "lemon", "lemons"]);
  });

  it("lowercases and strips apostrophes", () => {
    const tokens = tokenize("Trader Joe's");
    expect(tokens).toContain("joes");
    expect(tokens).not.toContain("joe's");
  });

  it("drops short words and common stopwords", () => {
    const tokens = tokenize("a bag of flour");
    expect(tokens).not.toContain("a");
    expect(tokens).not.toContain("of");
    expect(tokens).toContain("flour");
  });

  it("dedupes across overlapping prefixes", () => {
    const tokens = tokenize("milk milk");
    const milkPrefixes = tokens.filter((t) => t.startsWith("mi"));
    // 2 prefixes each from two identical words = 4 raw, deduped to 3 unique.
    expect(new Set(milkPrefixes).size).toBe(milkPrefixes.length);
  });

  it("returns sorted output for stable Firestore writes", () => {
    const tokens = tokenize("Yellow onions");
    expect([...tokens].sort()).toEqual(tokens);
  });

  it("returns empty array for whitespace-only input", () => {
    expect(tokenize("   ")).toEqual([]);
  });
});

describe("normalizeText", () => {
  it("lowercases and collapses whitespace", () => {
    expect(normalizeText("  Yellow   Onions  ")).toBe("yellow onions");
  });
});
