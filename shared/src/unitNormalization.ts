// Normalizes ingredient amounts from RecipeTracker imports:
//   - Rationalizes recipe quantities to cleaner units ("18 tbsp" → "1 cup 2 tbsp")
//   - Strips amounts below 1 tbsp — spice-level quantities → bare ingredient name
//   - Applies shopping-unit overrides for common items (butter → sticks)
//   - Aggregates duplicate ingredients across recipes by summing amounts

import type { GroceryCategory } from "./groceryList";

// ── Fraction helpers ─────────────────────────────────────────────────────────

const UNICODE_TO_DEC: Record<string, number> = {
  "½": 0.5,   "⅓": 1 / 3, "⅔": 2 / 3, "¼": 0.25,  "¾": 0.75,
  "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875,
  "⅙": 1 / 6, "⅚": 5 / 6, "⅕": 0.2,   "⅖": 0.4,   "⅗": 0.6, "⅘": 0.8,
};

const DISPLAY_FRACS: Array<[number, string]> = [
  [7 / 8, "⅞"], [3 / 4, "¾"], [2 / 3, "⅔"], [5 / 8, "⅝"],
  [1 / 2, "½"], [3 / 8, "⅜"], [1 / 3, "⅓"], [1 / 4, "¼"], [1 / 8, "⅛"],
];

function parseFraction(s: string): number | null {
  const t = s.trim();
  // Standalone unicode fraction: "½", "¼", etc.
  const uni = UNICODE_TO_DEC[t];
  if (uni !== undefined) return uni;
  // Whole + unicode fraction: "2¼", "1½"
  const wUni = /^(\d+)([½⅓⅔¼¾⅛⅜⅝⅞⅙⅚⅕⅖⅗⅘])$/.exec(t);
  if (wUni) {
    const frac = UNICODE_TO_DEC[wUni[2]];
    return frac !== undefined ? +wUni[1] + frac : null;
  }
  // Mixed number: "1 1/2"
  const mixed = /^(\d+)\s+(\d+)\/(\d+)$/.exec(t);
  if (mixed) return +mixed[1] + +mixed[2] / +mixed[3];
  // Slash fraction: "3/4"
  const slash = /^(\d+)\/(\d+)$/.exec(t);
  if (slash) return +slash[1] / +slash[2];
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

function formatNumber(n: number): string {
  if (n <= 0) return "";
  const whole = Math.floor(n);
  const frac = n - whole;
  if (frac < 0.01) return String(whole);
  for (const [val, sym] of DISPLAY_FRACS) {
    if (Math.abs(frac - val) < 0.02) return whole > 0 ? `${whole}${sym}` : sym;
  }
  return n.toFixed(2).replace(/\.?0+$/, "");
}

// ── Unit tables ───────────────────────────────────────────────────────────────

const VOL_TO_TSP: Record<string, number> = {
  tsp: 1, tsps: 1, teaspoon: 1, teaspoons: 1,
  tbsp: 3, tbsps: 3, tablespoon: 3, tablespoons: 3,
  c: 48, cup: 48, cups: 48,
  pt: 96, pint: 96, pints: 96,
  qt: 192, quart: 192, quarts: 192,
  gal: 768, gallon: 768, gallons: 768,
};

const WEIGHT_TO_OZ: Record<string, number> = {
  oz: 1, ounce: 1, ounces: 1,
  lb: 16, lbs: 16, pound: 16, pounds: 16,
};

// Shopping units with their tsp equivalent (volume-based)
// 1 stick of butter = 8 tbsp = 24 tsp
const SHOPPING_TO_TSP: Record<string, number> = {
  stick: 24, sticks: 24,
};

type UnitKind = "volume" | "weight" | "shopping-vol";

function unitKindOf(u: string): UnitKind | null {
  const l = u.toLowerCase();
  if (l in VOL_TO_TSP) return "volume";
  if (l in WEIGHT_TO_OZ) return "weight";
  if (l in SHOPPING_TO_TSP) return "shopping-vol";
  return null;
}

// ── Rationalization ───────────────────────────────────────────────────────────

// Abbreviations where singular and plural are the same
const ABBREV_UNITS = new Set(["tsp", "tbsp", "oz", "lb"]);

function unitForms(canonical: string): { singular: string; plural: string } {
  if (ABBREV_UNITS.has(canonical)) return { singular: canonical, plural: canonical };
  if (canonical.endsWith("s")) {
    return { singular: canonical.slice(0, -1), plural: canonical };
  }
  return { singular: canonical, plural: canonical + "s" };
}

// Pint is intentionally omitted: "2 cups" is more useful than "1 pint" for
// shopping, and no common grocery item is sized by the pint.
const VOL_LADDER: Array<[number, string]> = [
  [768, "gallon"], [192, "quart"],
  [48, "cup"], [3, "tbsp"], [1, "tsp"],
];

function rationalizeVolumeTsp(tsp: number): string {
  let remaining = Math.round(tsp * 1000) / 1000;
  const parts: string[] = [];
  for (const [factor, name] of VOL_LADDER) {
    if (remaining >= factor - 0.001) {
      const whole = Math.floor(remaining / factor + 0.001);
      if (whole > 0) {
        remaining = Math.round((remaining - whole * factor) * 1000) / 1000;
        const n = formatNumber(whole);
        if (n) {
          const { singular, plural } = unitForms(name);
          parts.push(`${n} ${whole === 1 ? singular : plural}`);
        }
      }
    }
  }
  return parts.join(" ") || `${formatNumber(tsp)} tsp`;
}

function rationalizeWeightOz(oz: number): string {
  const rounded = Math.round(oz * 8) / 8;
  if (rounded < 16) return `${formatNumber(rounded)} oz`;
  const lbs = Math.floor(rounded / 16);
  const remOz = Math.round((rounded - lbs * 16) * 8) / 8;
  const lbStr = `${formatNumber(lbs)} lb`;
  return remOz < 0.01 ? lbStr : `${lbStr} ${formatNumber(remOz)} oz`;
}

// ── Shopping unit lookup ───────────────────────────────────────────────────────

// Built-in lookup: normalized ingredient name → preferred shopping unit.
// Only volume-to-volume conversions are supported — cross-unit (e.g. tbsp → oz)
// would require per-ingredient densities.
const INGREDIENT_SHOPPING_UNIT: Record<string, string> = {
  butter: "sticks",
  "unsalted butter": "sticks",
  "salted butter": "sticks",
};

/** Normalize an ingredient name for map lookups and catalog keying. */
export function ingredientSlug(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Format a tsp total using a specific display unit (e.g. "sticks", "cups").
 * Falls through to standard rationalization when the unit is incompatible.
 */
function applyVolumeUnit(tsp: number, unit: string, ingredient: string): string {
  const displayIngredient = capitalize(ingredient);
  const factor = SHOPPING_TO_TSP[unit] ?? VOL_TO_TSP[unit];
  if (!factor) return `${rationalizeVolumeTsp(tsp)} ${displayIngredient}`;
  const qty = tsp / factor;
  const rounded = Math.round(qty * 8) / 8;
  const n = formatNumber(rounded);
  const { singular, plural } = unitForms(unit.toLowerCase());
  return `${n} ${rounded === 1 ? singular : plural} ${displayIngredient}`;
}

// ── Parsing ───────────────────────────────────────────────────────────────────

const UNICODE_FRAC_CHARS = "½⅓⅔¼¾⅛⅜⅝⅞⅙⅚⅕⅖⅗⅘";
// Quantity patterns, ordered most-specific first:
//   "2¼"  → whole digit followed immediately by a unicode fraction char
//   "1/2" or "1 1/2" → optional whole + slash fraction
//   "2.5" or "2" → decimal or integer
const QTY_RE_SRC = [
  `\\d+[${UNICODE_FRAC_CHARS}]`,
  `(?:\\d+\\s+)?\\d+/\\d+`,
  `\\d+(?:\\.\\d+)?`,
  `[${UNICODE_FRAC_CHARS}]`,
].join("|");

const ALL_UNIT_KEYS = [
  ...Object.keys(VOL_TO_TSP),
  ...Object.keys(WEIGHT_TO_OZ),
  ...Object.keys(SHOPPING_TO_TSP),
].sort((a, b) => b.length - a.length);

const UNIT_RE_SRC = ALL_UNIT_KEYS.map((u) =>
  u.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
).join("|");

// Matches: <qty> [<unit>] <ingredient>
// The \\s+ before the ingredient acts as an implicit word boundary — a bare
// abbreviation like "c" will only match when followed by whitespace, not when
// it's the first letter of the ingredient ("cumin").
const PARSE_RE = new RegExp(
  `^(${QTY_RE_SRC})(?:\\s+(${UNIT_RE_SRC})\\.?)?\\s+(.+)$`,
  "i",
);

export type ParsedIngredient = {
  qty: number;
  unit: string | null; // null = unitless count ("3 eggs")
  ingredient: string;
};

/**
 * Extract a leading amount from an ingredient string.
 *   "18 tbsp butter" → { qty: 18, unit: "tbsp", ingredient: "butter" }
 *   "3 eggs"         → { qty: 3,  unit: null,   ingredient: "eggs" }
 *   "Salt to taste"  → null
 */
export function parseIngredientAmount(text: string): ParsedIngredient | null {
  const m = PARSE_RE.exec(text.trim());
  if (!m) return null;
  const qty = parseFraction(m[1]);
  if (qty === null || qty <= 0) return null;
  const unit = m[2] ? m[2].toLowerCase() : null;
  const ingredient = m[3].trim();
  if (!ingredient) return null;
  return { qty, unit, ingredient };
}

/**
 * Pull the display unit out of a normalized string like "2¼ sticks Butter".
 * Returns null when there's no recognized unit (ingredient-only strings,
 * unparseable text, or cross-unit conversions we can't handle).
 */
export function extractPreferredUnit(text: string): string | null {
  const parsed = parseIngredientAmount(text);
  if (!parsed?.unit) return null;
  const kind = unitKindOf(parsed.unit);
  return kind ? parsed.unit.toLowerCase() : null;
}

// ── Aggregation + normalization ───────────────────────────────────────────────

// Volume amounts below this (in tsp) are spice-level: strip the amount and
// show only the ingredient name. 3 tsp = 1 tbsp is the crossover.
const SPICE_THRESHOLD_TSP = 3;

export type AggregatedItem = {
  /** Display/editable text shown in the import preview. */
  text: string;
  /** Auto-normalized text before any user edits. */
  normalizedText: string;
  /** Bare ingredient name used for catalog lookup and preferredUnit upserts. */
  ingredientName: string;
  category: GroceryCategory;
};

interface GroupEntry {
  ingredient: string;
  category: GroceryCategory;
  kind: "volume" | "weight" | "count" | "opaque";
  tsp: number;
  oz: number;
  qty: number;
  rawText: string;
}

/**
 * Aggregate duplicate ingredients and normalize their amounts into
 * shopper-friendly strings.
 *
 * Items with the same ingredient name and measurement kind (volume/weight/count)
 * are merged into a single row. Items with no parseable amount pass through
 * unchanged but are deduplicated by text.
 */
export function aggregateAndNormalizeItems(
  items: ReadonlyArray<{ text: string; category: GroceryCategory }>,
  getPreferredUnit: (slug: string) => string | undefined,
): AggregatedItem[] {
  const keyOrder: string[] = [];
  const groups = new Map<string, GroupEntry>();

  function ensureGroup(key: string, entry: GroupEntry): GroupEntry {
    if (!groups.has(key)) {
      keyOrder.push(key);
      groups.set(key, entry);
    }
    return groups.get(key)!;
  }

  for (const item of items) {
    const parsed = parseIngredientAmount(item.text);

    if (!parsed) {
      const key = `opaque:${item.text.toLowerCase().trim()}`;
      ensureGroup(key, {
        ingredient: item.text, category: item.category, kind: "opaque",
        tsp: 0, oz: 0, qty: 0, rawText: item.text,
      });
      continue;
    }

    const { qty, unit, ingredient } = parsed;
    const slug = ingredientSlug(ingredient);

    if (!unit) {
      const g = ensureGroup(`count:${slug}`, {
        ingredient, category: item.category, kind: "count",
        tsp: 0, oz: 0, qty: 0, rawText: "",
      });
      g.qty += qty;
      continue;
    }

    const kind = unitKindOf(unit);
    if (!kind) {
      const key = `opaque:${item.text.toLowerCase().trim()}`;
      ensureGroup(key, {
        ingredient: item.text, category: item.category, kind: "opaque",
        tsp: 0, oz: 0, qty: 0, rawText: item.text,
      });
      continue;
    }

    if (kind === "volume" || kind === "shopping-vol") {
      const g = ensureGroup(`vol:${slug}`, {
        ingredient, category: item.category, kind: "volume",
        tsp: 0, oz: 0, qty: 0, rawText: "",
      });
      const factor = kind === "volume" ? (VOL_TO_TSP[unit] ?? 1) : (SHOPPING_TO_TSP[unit] ?? 1);
      g.tsp += qty * factor;
    } else {
      const g = ensureGroup(`wt:${slug}`, {
        ingredient, category: item.category, kind: "weight",
        tsp: 0, oz: 0, qty: 0, rawText: "",
      });
      g.oz += qty * (WEIGHT_TO_OZ[unit] ?? 1);
    }
  }

  return keyOrder.map((key) => {
    const g = groups.get(key)!;

    if (g.kind === "opaque") {
      return { text: g.rawText, normalizedText: g.rawText, ingredientName: g.rawText, category: g.category };
    }

    const slug = ingredientSlug(g.ingredient);
    const displayIngredient = capitalize(g.ingredient);
    let text: string;

    if (g.kind === "count") {
      const n = formatNumber(g.qty);
      text = n ? `${n} ${displayIngredient}` : displayIngredient;
    } else if (g.kind === "volume") {
      if (g.tsp < SPICE_THRESHOLD_TSP) {
        text = displayIngredient;
      } else {
        const preferredUnit = getPreferredUnit(slug);
        const activeUnit = preferredUnit ?? INGREDIENT_SHOPPING_UNIT[slug];
        text = activeUnit
          ? applyVolumeUnit(g.tsp, activeUnit, g.ingredient)
          : `${rationalizeVolumeTsp(g.tsp)} ${displayIngredient}`;
      }
    } else {
      text = `${rationalizeWeightOz(g.oz)} ${displayIngredient}`;
    }

    return { text, normalizedText: text, ingredientName: displayIngredient, category: g.category };
  });
}
