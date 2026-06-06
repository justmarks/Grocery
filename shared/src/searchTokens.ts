// Prefix-token generator for catalog autocomplete. Mirrors
// RecipeTracker/shared/src/searchTokens.ts in spirit — produce a
// deduped lowercase array that can be queried with Firestore's
// `array-contains-any`. The shape is intentionally pure so it lives
// in the Firestore-free testable core (see PLAN.md § Pure-helpers
// split for testability).

const STOPWORDS = new Set(["the", "a", "an", "and", "&", "of"]);

/**
 * Produce prefix-tokens for a single text string.
 *
 * - Lowercased
 * - Apostrophes stripped, then non-alnum runs replaced with spaces
 * - Tokens of length < 2 dropped
 * - Common stopwords ("the", "a", "and") dropped
 * - For each remaining word, emit every prefix of length 2..min(word, 12)
 *
 * Returns a deduped array, sorted for stable Firestore writes.
 */
export function tokenize(text: string): string[] {
  const cleaned = text
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  if (!cleaned) return [];
  const words = cleaned.split(/\s+/).filter((w) => w.length >= 2 && !STOPWORDS.has(w));
  const tokens = new Set<string>();
  for (const w of words) {
    const cap = Math.min(w.length, 12);
    for (let i = 2; i <= cap; i++) tokens.add(w.slice(0, i));
  }
  return [...tokens].sort();
}

/**
 * Normalize free-text into the catalog's `textLower` key. Used both
 * as a stable id (after slug-ifying) and as the prefix-match anchor
 * when no token search is needed.
 */
export function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}
