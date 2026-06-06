// Pure catalog helpers — id slugging, prefix matching, exact-match
// lookup, and the suggestion ranking used by the plan-mode composer.
// All firestore-free so vitest can exercise the logic without mocks.

import { normalizeText, tokenize } from "./searchTokens";
import type { CatalogEntry } from "./household";

/**
 * Deterministic doc id for a catalog entry. Lowercase, dashed slug
 * of the item text. Two writes for the same conceptual item ("Lemons"
 * and "lemons") land on the same doc so timesUsed / defaults merge.
 */
export function catalogIdForText(text: string): string {
  const normalized = normalizeText(text);
  const slug = normalized
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
  return slug;
}

/**
 * Build the searchTokens array a catalog entry needs at write time.
 * Same generator as the items list (shared/src/searchTokens.ts) so
 * runtime queries always agree with what was indexed.
 */
export function catalogSearchTokens(text: string): string[] {
  return tokenize(text);
}

export type CatalogEntryWithId = CatalogEntry & { id: string };

/** Comparator that ranks suggestions by usage, lastUsed, then text. */
function rankSuggestion(a: CatalogEntryWithId, b: CatalogEntryWithId): number {
  if (a.timesUsed !== b.timesUsed) return b.timesUsed - a.timesUsed;
  const aMillis = readMillis(a.lastUsedAt);
  const bMillis = readMillis(b.lastUsedAt);
  if (aMillis !== bMillis) return bMillis - aMillis;
  return a.textLower.localeCompare(b.textLower);
}

function readMillis(raw: unknown): number {
  if (raw && typeof raw === "object") {
    const t = raw as { toMillis?: () => number; seconds?: number };
    if (typeof t.toMillis === "function") return t.toMillis();
    if (typeof t.seconds === "number") return t.seconds * 1000;
  }
  if (typeof raw === "number") return raw;
  return 0;
}

/**
 * Suggestions matching a draft input string. Matches against
 * `textLower` with case-insensitive prefix semantics. Returns at
 * most `limit` entries, sorted by usage.
 *
 * The empty-draft and whitespace-only-draft cases return [] — the
 * UI shouldn't surface unsolicited memory entries when the user
 * hasn't started typing.
 */
export function findCatalogSuggestions(
  catalog: readonly CatalogEntryWithId[],
  draft: string,
  limit: number = 5,
): CatalogEntryWithId[] {
  const q = normalizeText(draft);
  if (!q) return [];
  const hits = catalog.filter((c) => c.textLower.startsWith(q));
  hits.sort(rankSuggestion);
  return hits.slice(0, limit);
}

/**
 * Exact-text match in the catalog, regardless of case. Used at
 * add-time to apply remembered defaults (category, stores, qty).
 * Returns null when there's no match.
 */
export function findExactCatalogMatch(
  catalog: readonly CatalogEntryWithId[],
  text: string,
): CatalogEntryWithId | null {
  const q = normalizeText(text);
  if (!q) return null;
  return catalog.find((c) => c.textLower === q) ?? null;
}
