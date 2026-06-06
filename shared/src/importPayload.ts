// Versioned import payload from RecipeTracker meal plans. Transported
// via deep link (`/import?source=mealplan&payload=<base64url>`).
//
// schemaVersion: 1 is the initial release. Bump it on any breaking
// change to the items shape; the Grocery app refuses unknown versions
// and shows "RecipeTracker is newer, update Grocery."

import { z } from "zod";
import { GroceryItemSchema } from "./groceryList";

export const IMPORT_SCHEMA_VERSION = 1 as const;

export const MealPlanImportPayloadSchema = z.object({
  schemaVersion: z.literal(IMPORT_SCHEMA_VERSION),
  mealPlanId: z.string().min(1),
  mealPlanName: z.string().min(1).max(200),
  items: z.array(GroceryItemSchema),
});
export type MealPlanImportPayload = z.infer<typeof MealPlanImportPayloadSchema>;

/**
 * Base64url encode a UTF-8 string. Used to embed the payload in the
 * import deep link. Browser-safe (no Buffer required).
 */
export function base64urlEncode(input: string): string {
  const utf8 = new TextEncoder().encode(input);
  let binary = "";
  for (const byte of utf8) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64urlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    input.length + ((4 - (input.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/**
 * Decode + validate a payload from the `?payload=` query parameter.
 * Returns `{ ok: true, payload }` or `{ ok: false, reason }`. Distinct
 * reasons let the UI surface different messages (parse failure vs.
 * schema mismatch vs. unsupported version).
 */
export type DecodeResult =
  | { ok: true; payload: MealPlanImportPayload }
  | { ok: false; reason: "decode-failed" | "json-invalid" | "schema-mismatch" | "unsupported-version" };

export function decodeMealPlanPayload(raw: string): DecodeResult {
  let json: string;
  try {
    json = base64urlDecode(raw);
  } catch {
    return { ok: false, reason: "decode-failed" };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, reason: "json-invalid" };
  }
  // Check version BEFORE full schema parse so we can give the right error.
  const versionGuess = (parsed as { schemaVersion?: unknown })?.schemaVersion;
  if (typeof versionGuess === "number" && versionGuess !== IMPORT_SCHEMA_VERSION) {
    return { ok: false, reason: "unsupported-version" };
  }
  const result = MealPlanImportPayloadSchema.safeParse(parsed);
  if (!result.success) return { ok: false, reason: "schema-mismatch" };
  return { ok: true, payload: result.data };
}
