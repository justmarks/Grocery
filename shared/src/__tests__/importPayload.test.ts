import { describe, it, expect } from "vitest";
import {
  base64urlDecode,
  base64urlEncode,
  decodeMealPlanPayload,
  IMPORT_SCHEMA_VERSION,
  MealPlanImportPayloadSchema,
} from "../importPayload";

function buildPayload(overrides: Partial<{
  schemaVersion: number;
  mealPlanId: string;
  mealPlanName: string;
  items: { text: string; category: string }[];
}> = {}) {
  return {
    schemaVersion: IMPORT_SCHEMA_VERSION,
    mealPlanId: "mp-123",
    mealPlanName: "Friday Taco Night",
    items: [
      { text: "Yellow onions (3 medium)", category: "vegetables" },
      { text: "Limes (2)", category: "fruits" },
      { text: "Carne asada", category: "meats" },
    ],
    ...overrides,
  };
}

describe("base64url codec", () => {
  it("round-trips UTF-8 strings", () => {
    const original = '{"hello":"wörld — 🍋"}';
    const encoded = base64urlEncode(original);
    expect(encoded).not.toContain("=");
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect(base64urlDecode(encoded)).toBe(original);
  });

  it("handles empty input", () => {
    expect(base64urlDecode(base64urlEncode(""))).toBe("");
  });
});

describe("decodeMealPlanPayload", () => {
  it("decodes a valid payload round-trip", () => {
    const payload = buildPayload();
    const wire = base64urlEncode(JSON.stringify(payload));
    const result = decodeMealPlanPayload(wire);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.mealPlanName).toBe("Friday Taco Night");
    expect(result.payload.items).toHaveLength(3);
  });

  it("flags decode-failed on garbage input", () => {
    const result = decodeMealPlanPayload("!!!not-base64-at-all!!!");
    // Base64 is lenient; some garbage strings decode to bytes that
    // aren't valid JSON. Both decode-failed and json-invalid are
    // acceptable failure modes here.
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(["decode-failed", "json-invalid"]).toContain(result.reason);
  });

  it("flags json-invalid on non-JSON bytes", () => {
    const wire = base64urlEncode("not valid json at all");
    const result = decodeMealPlanPayload(wire);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("json-invalid");
  });

  it("flags unsupported-version on a different schemaVersion", () => {
    const wire = base64urlEncode(
      JSON.stringify(buildPayload({ schemaVersion: 99 })),
    );
    const result = decodeMealPlanPayload(wire);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("unsupported-version");
  });

  it("flags schema-mismatch on missing fields", () => {
    const wire = base64urlEncode(
      JSON.stringify({ schemaVersion: IMPORT_SCHEMA_VERSION, items: [] }),
    );
    const result = decodeMealPlanPayload(wire);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("schema-mismatch");
  });

  it("rejects items with categories outside the RecipeTracker enum", () => {
    const wire = base64urlEncode(
      JSON.stringify(
        buildPayload({
          items: [{ text: "Frozen pizza", category: "freezer" }],
        }),
      ),
    );
    const result = decodeMealPlanPayload(wire);
    // `freezer` is Grocery-only; the upstream payload schema only
    // accepts the ten RecipeTracker categories.
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("schema-mismatch");
  });
});

describe("MealPlanImportPayloadSchema", () => {
  it("requires the literal schemaVersion 1", () => {
    expect(
      MealPlanImportPayloadSchema.safeParse({
        ...buildPayload({ schemaVersion: 2 }),
      }).success,
    ).toBe(false);
  });
});
