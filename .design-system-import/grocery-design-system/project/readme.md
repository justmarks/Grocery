# Marks Family — Grocery Design System

A design system for **Grocery**, a shared-household grocery-list PWA for planning
trips and shopping efficiently across multiple stores. Grocery is a sibling of the
**Marks Family Recipe Book** and inherits that product's warm, editorial visual
language wholesale — the two apps are meant to read as one family, so a meal plan
imported from RecipeTracker lands in a visually identical world.

> **One household, one list, many members.** Plan together in write mode, shop apart
> in read mode, and let the list remember what you usually buy.

---

## Source material

This system was built by reading the product specs and the sibling app's codebase.
You don't need access to build with this system, but if you have it, go deeper:

- **Grocery** — product spec & data model (`README.md`, `PLAN.md`):
  https://github.com/justmarks/Grocery — *the source of truth for behavior, the
  data model (categories, stores, sharing), and the RecipeTracker import contract.*
- **RecipeTracker** — the sibling app whose design system Grocery mirrors:
  https://github.com/justmarks/RecipeTracker — *the origin of the color tokens, the
  three-family type system, the icon set, the `Button`/`Tag`/`Field` primitives, the
  `Brand` lockup pattern, and the `sharedWith` + `autoShares` sharing model. Read
  `web/src/index.css`, `web/src/components/ui/`, and `web/src/components/Brand.tsx`
  to see the originals.*

Fonts (`Newsreader`, `Manrope`, `JetBrains Mono`) and the meal-plan import shape were
lifted directly from the RecipeTracker repo. **No fonts were substituted** — all three
are the genuine variable-font binaries, copied into `assets/fonts/`.

---

## What Grocery is

- **Plan** in *write mode*: add items with a count, tag them by aisle category and by
  which stores carry them. Inline edit and delete per row.
- **Shop** in *read mode*: items regroup under the selected store, big checkboxes,
  one-tap checkoff, a live "in the cart" progress count.
- **Share** with the household — every member sees and edits the same single list in
  real time. The sharing model mirrors RecipeTracker's `sharedWith` + `autoShares`.
- **Remembers** what you've bought: typing "lemons" autocompletes with its usual
  aisle and stores (the "pantry memory").

---

## Content fundamentals

The voice is **warm, plain-spoken, and domestic** — a calm kitchen assistant, never a
corporate app. It carries over directly from the Recipe Book.

- **Person & address.** Speaks to *you* ("Your list is empty", "What you'll see at the
  shelf"). The household is named in the third person ("the **Marks Family** list").
  Never "we".
- **Casing.** Sentence case everywhere — buttons ("Add item", "End trip", "Continue
  with Google"), titles, labels. The **only** uppercase is the tracked eyebrow label
  (`SHARED WITH 4 MEMBERS`, `FROM RECIPETRACKER`). Never ALL-CAPS for emphasis in body.
- **Verbs are concrete and short.** "Add item", "End trip", "Import", "Not now". Two
  words max on a button. The primary verb pair the whole app pivots on is
  **Plan / Shop**.
- **Tone of confirmation.** Toasts are friendly and specific: "Added Lemons", "Added 5
  items from Friday Taco Night", "Trip ended — checked items cleared". The all-done
  empty state is encouraging: "All checked off! Nice work."
- **Numbers read like a kitchen.** Counts are "×3", "×12"; quantities can carry a human
  note ("Yellow onions (3 medium)"). Progress is "2/16 in the cart", never a percentage.
- **No emoji.** The brand expresses warmth through serif type, cream paper, and the
  olive sprig — not emoji. (The data model's category icons are line glyphs, not emoji.)
- **Store names are real and untranslated** — "Trader Joe's", "Costco", "QFC" — shown
  in monospace as quiet metadata under each item.

**Example copy in the wild:**
> *Empty list:* "Your list is empty — Add items as you think of them, or import a meal
> plan from RecipeTracker."
> *Sign-in tagline:* "One shared list for the whole household. Plan together, shop apart."
> *Import sheet:* "Friday Taco Night · 3 recipes · 5 items to add".

---

## Visual foundations

**Overall vibe.** Warm editorial paper. Think a well-set cookbook page, not a SaaS
dashboard. Cream surfaces, warm near-black ink, a tomato-red accent, and an olive-green
"done" state. Generous tap targets, serif section headers, restrained motion.

- **Color.** Never pure white or pure black. Pages sit on warm cream `--paper-100`;
  text is warm `--ink-900` (`#2a1f18`). Four brand hues — **tomato** (primary: buttons,
  links, active nav), **olive** (the "checked / done / got-it" green — the single most
  important semantic in shopping mode), **saffron** (highlight/warning), **plum**
  (accent, used for the Import affordance). Eleven **aisle categories** each own a color
  (berry fruits, olive vegetables, tomato meats, sky dairy, saffron cheeses, cocoa
  baking, plum bread, sage beverages, slate paper-goods, **frost freezer**, neutral
  misc) so a shopper learns to scan for a section by color. Frost is the one new family
  Grocery adds to the inherited palette — for its Grocery-only `freezer` aisle.
- **Type.** Three families. **Newsreader** (editorial serif) for the wordmark, page
  titles, and aisle/section headers — set at weight 500 with tight tracking, and used
  *italic in tomato* for the "Grocery" line of the lockup. **Manrope** (sans) for all UI,
  item text, labels, and buttons. **JetBrains Mono** for counts, quantities, store
  filters, and any tabular number. Scale is a 1.2 ratio; UI text never below 14px, item
  rows at 18px for thumb-friendly reading.
- **Spacing & targets.** 4px base grid. Mobile-first: every interactive control honors a
  **44px minimum tap target** (checkboxes, tab-bar items, buttons, store pills). Rows
  breathe (10–12px vertical) but stay dense enough that a week's list is a few scrolls.
- **Backgrounds.** Flat warm paper, occasionally a *very* subtle radial wash from
  `--paper-200` at the top (sign-in, launch). **No photographic backgrounds, no
  gradients-as-decoration, no patterns or textures.** The warmth comes from the paper
  color itself.
- **Corners & cards.** Radii: 4px chips/tags, 8px inputs/buttons, 14px cards, 20px
  launch/sign-in cards, full-pill for avatars, store-filter chips, and counters. Cards
  are white (`#fff`) on cream, lifted with a soft shadow and a hairline `--border-faint`
  — never a heavy outline.
- **Shadows.** Warm, **ink-tinted** (`rgba(70,53,40,…)`), never neutral gray. They read
  as soft paper lift, not material elevation. Four steps (`xs`→`lg`) plus a tomato focus
  halo (`--shadow-focus`) on every focusable control.
- **Motion.** Restrained. A single ease-out curve (`cubic-bezier(.22,1,.36,1)`), fast
  durations (120/200/320ms). Used for hover color shifts, the mode toggle's sliding
  thumb, and the import bottom sheet. The **one playful moment** is the confirmation
  toast, which slides up + fades from `bottom`. No infinite/looping decorative motion.
- **Hover / press states.** Hover = a paper wash (`--paper-200`) for neutral controls, a
  one-step-darker fill for filled buttons (tomato-500 → 600). Press = the next darker
  step (→ 700). No scale/bounce on press. Focus is always the tomato halo, never a
  browser outline.
- **Borders.** Hairline and warm — `--border-faint` (`#e5dccc`) for dividers,
  `--paper-400` for input/control outlines. Dividers under aisle headers and between
  rows, never boxed-in grids.
- **Transparency & blur.** Used sparingly — only the import sheet's scrim
  (`rgba(42,31,24,.4)`). No glassmorphism, no backdrop blur.
- **Imagery.** The brand ships no photography. Where a product photo or member avatar is
  needed, avatars fall back to **initials on a deterministic warm-palette disc**. If real
  imagery is added later, keep it warm and naturally lit to match the paper.

---

## Iconography

- **One source, outline-only.** All icons come from a single hand-curated set
  (`components/core/Icon.jsx`) of **Lucide-style stroke glyphs** — 24×24 viewBox, 1.5px
  stroke, `currentColor`, never filled (except the checkoff's interior check). This is
  lifted from RecipeTracker's `Icon.tsx` (also an inlined Lucide-style set, *not* the
  Lucide runtime) and extended with the glyphs Grocery needs: `shopping-cart` (shop mode
  + cart), `store` (store filter), `snowflake` (the freezer aisle), `minus` (quantity),
  `filter` (all-stores). **Do not** add a third-party icon library — add a path to
  `Icon.jsx` instead, matching the 1.5px outline style.
- **No emoji, no unicode icons.** Category "icons" in the data model are line glyphs, not
  emoji. The freezer aisle is the one category that shows an icon (the snowflake) instead
  of a color dot.
- **Brand mark.** `assets/brand/grocery-icon.svg` — a tomato grocery-list card with a
  checked-off top row (olive check + struck line) and the **family olive sprig** tucked
  at the corner, the shared signature with the Recipe Book's red book mark. The `Brand`
  component re-draws this monogram from CSS tokens so it always tracks the palette.

---

## Index / manifest

**Root**
- `styles.css` — the global CSS entry point (import manifest only). Consumers link this.
- `readme.md` — this guide.
- `SKILL.md` — Agent-Skills-compatible entry point for using this system in Claude Code.

**`tokens/`** — design tokens, each `@import`ed from `styles.css`
- `fonts.css` — the three `@font-face` declarations.
- `colors.css` — paper/ink ramps, brand hues, extended tag families, semantic aliases.
- `categories.css` — the eleven per-aisle category color tokens (`--cat-*`).
- `typography.css` — families, 1.2 type scale, line-height & tracking.
- `spacing.css` — 4px grid + 44px tap target.
- `effects.css` — radii, warm shadows, motion curves & durations.
- `base.css` — base element styles (headings, eyebrow, item text, links).
- `components.css` — real CSS classes for the primitives (hover/focus/checked states).

**`components/`** — reusable React primitives (compiled to `window.GroceryDesignSystem_df55be`)
- `core/` — `Brand` (+`Monogram`), `Button`, `IconButton`, `Avatar`, `Icon` (+`ICON_NAMES`).
- `forms/` — `Input`, `Select`, `Field`, `Checkbox` (the big olive checkoff).
- `grocery/` — `CategoryTag`, `GroceryItemRow`, `AisleHeader`, `StoreFilter`,
  `ModeToggle` (Plan/Shop), plus the `categories.js` constants & helpers.
- `feedback/` — `Toast`, `EmptyState`.

**`ui_kits/grocery_app/`** — the interactive PWA recreation
- `index.html` — the full click-through app (sign-in → plan → shop). Phone frame.
- `data.js` — fake household, list, and pantry memory.
- `SignIn.jsx`, `PlanView.jsx`, `ShopView.jsx`, `GroceryApp.jsx` — the surfaces.

**`guidelines/`** — foundation specimen cards (the Design System tab).
- Color, type, spacing, effects, and brand cards.

**`assets/`** — `brand/grocery-icon.svg`, `fonts/` (the three variable fonts).

---

## Starting points

Two entries are exposed to consuming projects' Starting Points picker:
- **Button** (Core) — the primary action button.
- **GroceryItemRow** (Grocery) — a single checkoff list row.
