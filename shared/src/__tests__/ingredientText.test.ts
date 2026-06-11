import { describe, it, expect } from "vitest";
import { isPrepPhrase, stripPrepDirections } from "../ingredientText";

describe("isPrepPhrase", () => {
  it("accepts bare prep words", () => {
    expect(isPrepPhrase("minced")).toBe(true);
    expect(isPrepPhrase("Chopped")).toBe(true);
  });

  it("accepts adverb + prep and connected pairs", () => {
    expect(isPrepPhrase("finely chopped")).toBe(true);
    expect(isPrepPhrase("peeled and diced")).toBe(true);
    expect(isPrepPhrase("rinsed, drained")).toBe(true);
  });

  it("rejects phrases with item words", () => {
    expect(isPrepPhrase("minced garlic")).toBe(false);
    expect(isPrepPhrase("3 medium")).toBe(false);
    expect(isPrepPhrase("room temperature")).toBe(false);
  });

  it("rejects adverbs alone and empty strings", () => {
    expect(isPrepPhrase("finely")).toBe(false);
    expect(isPrepPhrase("")).toBe(false);
  });
});

describe("stripPrepDirections", () => {
  it("drops a trailing comma direction", () => {
    expect(stripPrepDirections("Garlic, minced")).toBe("Garlic");
    expect(stripPrepDirections("Yellow onions (3 medium), chopped")).toBe(
      "Yellow onions (3 medium)",
    );
  });

  it("drops compound trailing directions", () => {
    expect(stripPrepDirections("Carrots, peeled and diced")).toBe("Carrots");
    expect(stripPrepDirections("Cilantro, rinsed, finely chopped")).toBe(
      "Cilantro",
    );
  });

  it("drops spaced-dash directions but keeps hyphenated names", () => {
    expect(stripPrepDirections("Garlic - minced")).toBe("Garlic");
    expect(stripPrepDirections("Half-and-half")).toBe("Half-and-half");
  });

  it("drops prep-only parentheticals, keeps quantity ones", () => {
    expect(stripPrepDirections("Onion (diced)")).toBe("Onion");
    expect(stripPrepDirections("Limes (2)")).toBe("Limes (2)");
    expect(stripPrepDirections("Butter (softened)")).toBe("Butter");
  });

  it("keeps leading prep/form words — often part of the product name", () => {
    expect(stripPrepDirections("Minced garlic")).toBe("Minced garlic");
    expect(stripPrepDirections("Crushed tomatoes")).toBe("Crushed tomatoes");
    expect(stripPrepDirections("Shredded cheese, divided")).toBe(
      "Shredded cheese",
    );
  });

  it("leaves ordinary lines untouched", () => {
    expect(stripPrepDirections("Carne asada")).toBe("Carne asada");
    expect(stripPrepDirections("Fresh basil")).toBe("Fresh basil");
    expect(stripPrepDirections("Roma tomatoes (4)")).toBe("Roma tomatoes (4)");
  });

  it("never empties a line that is pure prep", () => {
    expect(stripPrepDirections("Chopped")).toBe("Chopped");
    expect(stripPrepDirections("finely chopped")).toBe("finely chopped");
  });
});
