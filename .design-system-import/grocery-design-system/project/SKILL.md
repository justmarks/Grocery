---
name: grocery-design
description: Use this skill to generate well-branded interfaces and assets for Grocery (the Marks Family shared-household grocery-list PWA), either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

Grocery is a shared-household grocery-list PWA, a sibling of the Marks Family Recipe
Book and built on the same warm, editorial design language (cream paper, tomato + olive
accents, Newsreader / Manrope / JetBrains Mono). Plan in write mode, shop in read mode,
share one list across the household, import meal plans from RecipeTracker.

Key files:
- `readme.md` — the full design guide: content voice, visual foundations, iconography,
  and a manifest of everything here.
- `styles.css` — link this one file to get all tokens, fonts, and component CSS.
- `tokens/` — color, category, type, spacing, effects tokens as CSS custom properties.
- `components/` — React primitives (Button, Icon, GroceryItemRow, AisleHeader,
  ModeToggle, StoreFilter, Checkbox, CategoryTag, Toast, EmptyState, …). Each has a
  `.prompt.md` with a usage example.
- `ui_kits/grocery_app/` — a full interactive PWA recreation to crib screen structure.
- `assets/` — the brand monogram SVG and the three variable fonts.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out and
create static HTML files for the user to view. If working on production code, copy assets
and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without other guidance, ask them what they want to build
or design, ask a few clarifying questions, and act as an expert designer who outputs HTML
artifacts _or_ production code, depending on the need.

Non-negotiables when designing for Grocery:
- Never pure white or pure black — warm paper surfaces, warm ink text.
- Tomato is the primary accent; olive is the "checked / done / got-it" green.
- Sentence case everywhere; uppercase only for the tracked eyebrow label. No emoji.
- Outline-only Lucide-style icons from `components/core/Icon.jsx` — never a third-party
  icon library; add a path instead.
- 44px minimum tap targets; serif (Newsreader) for headers, sans (Manrope) for UI,
  mono (JetBrains Mono) for counts and quantities.
