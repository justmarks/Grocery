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
 * Suggestions matching a draft input string. Matches when ANY word
 * in the catalog entry's text starts with the query — so "puf"
 * surfaces "Cocoa Puffs" and "milk" surfaces "Whole milk". This
 * uses the `searchTokens` array indexed at write time (every entry
 * carries the 2..min(word, 12) prefix of each word).
 *
 * Within the matched set, entries whose text *starts* with the
 * query are ranked above word-prefix-only matches ("Cocoa" outranks
 * "Cocoa Puffs" for the query "co"). Then by `timesUsed` desc,
 * `lastUsedAt` desc, text asc.
 *
 * Empty / whitespace-only / single-char drafts return [] — single
 * characters are too noisy to surface a suggestion for, and
 * tokenize() also bottoms out at 2 chars.
 */
export function findCatalogSuggestions(
  catalog: readonly CatalogEntryWithId[],
  draft: string,
  limit: number = 5,
): CatalogEntryWithId[] {
  const q = normalizeText(draft);
  if (q.length < 2) return [];
  const hits = catalog.filter(
    (c) => c.searchTokens?.includes(q) || c.textLower.startsWith(q),
  );
  hits.sort((a, b) => {
    // First-word match wins over later-word match. Keeps "Lemons"
    // above "Yellow lemons" for the query "lem".
    const aFirst = a.textLower.startsWith(q);
    const bFirst = b.textLower.startsWith(q);
    if (aFirst !== bFirst) return aFirst ? -1 : 1;
    return rankSuggestion(a, b);
  });
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
