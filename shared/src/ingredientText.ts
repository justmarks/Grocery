// Strips preparation directions from imported ingredient text.
// RecipeTracker lines often carry recipe-prep noise ("Garlic, minced",
// "finely chopped parsley", "Onion (diced)") that's useless on a
// shopping list — you buy garlic, not minced garlic.
//
// Deliberately conservative: only words on the curated list below are
// ever removed, and only when they form a pure prep phrase in a
// trailing comma/dash segment or a parenthetical. Leading words are
// never touched — "Crushed tomatoes" and "Shredded cheese" are
// products you buy, not directions. Anything ambiguous passes through
// untouched, and a line that is nothing but prep words is returned
// as-is rather than emptied.

/** Words that are (almost) always a prep direction, never the item. */
const PREP_WORDS = new Set([
  "beaten",
  "boiled",
  "chopped",
  "cored",
  "crumbled",
  "crushed",
  "cubed",
  "deseeded",
  "deveined",
  "diced",
  "divided",
  "drained",
  "grated",
  "halved",
  "juiced",
  "julienned",
  "melted",
  "minced",
  "peeled",
  "pitted",
  "pounded",
  "quartered",
  "rinsed",
  "scrubbed",
  "seeded",
  "shaved",
  "shredded",
  "sifted",
  "sliced",
  "slivered",
  "smashed",
  "softened",
  "stemmed",
  "thawed",
  "torn",
  "trimmed",
  "washed",
  "whisked",
  "zested",
]);

/** Adverbs/connectors that may accompany a prep word ("finely chopped",
 * "peeled and diced") but never count as prep on their own. */
const PREP_ADVERBS = new Set([
  "coarsely",
  "finely",
  "freshly",
  "lightly",
  "roughly",
  "thickly",
  "thinly",
  "very",
  "well",
]);
const PREP_CONNECTORS = new Set(["and", "or", "then"]);

/** Lowercased letters-only form of a token ("Minced," → "minced"). */
function tokenWord(token: string): string {
  return token.toLowerCase().replace(/[^a-z]/g, "");
}

/**
 * True when a phrase consists solely of prep words plus their adverbs
 * and connectors — i.e. it carries no item information at all.
 */
export function isPrepPhrase(phrase: string): boolean {
  const tokens = phrase.trim().split(/\s+/).map(tokenWord).filter(Boolean);
  if (tokens.length === 0) return false;
  let hasPrep = false;
  for (const t of tokens) {
    if (PREP_WORDS.has(t)) hasPrep = true;
    else if (!PREP_ADVERBS.has(t) && !PREP_CONNECTORS.has(t)) return false;
  }
  return hasPrep;
}

/**
 * Remove trailing prep directions from an ingredient line:
 *
 *   "Garlic, minced"                    → "Garlic"
 *   "Carrots, peeled and diced"         → "Carrots"
 *   "Onion (diced)"                     → "Onion"
 *   "Yellow onions (3 medium), chopped" → "Yellow onions (3 medium)"
 *
 * Leading words stay — "Minced garlic" and "Crushed tomatoes" pass
 * through unchanged, since a leading form word is often part of the
 * product name. Quantity parentheticals and ordinary descriptors
 * survive. If stripping would leave nothing meaningful, the original
 * text comes back unchanged.
 */
export function stripPrepDirections(text: string): string {
  const original = text.trim();
  if (!original) return original;

  // 1. Parentheticals that are purely prep: "Onion (diced)".
  let out = original.replace(/\s*\(([^()]*)\)/g, (match, inner: string) =>
    isPrepPhrase(inner) ? "" : match,
  );

  // 2. Comma/semicolon/spaced-dash segments that are purely prep:
  //    "Garlic, minced", "Garlic - minced". Hyphenated names like
  //    "half-and-half" are safe — the dash must be space-padded.
  const segments = out.split(/\s*[,;]\s*|\s+[-—–]\s+/);
  const kept = segments.filter((s) => s.trim() && !isPrepPhrase(s));
  if (kept.length > 0) out = kept.join(", ");

  const result = out.trim().replace(/^[\s,;-]+|[\s,;-]+$/g, "");

  // Nothing useful left (or the line was pure prep) → leave it alone.
  if (!result) return original;
  return result;
}
