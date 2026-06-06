# Grocery — Implementation Plan

## Goals

Build a shared household grocery list PWA. One household, one list, many members. Must accept imports from RecipeTracker meal plans without lossy translation, feel fast on mobile, work offline, remember what you usually buy, and split cleanly between *planning* (write) and *shopping* (read) modes.

## Design system

A complete design system ships in `design-system/` at the repo root — a handoff bundle from Claude Design containing tokens, components, fonts, brand assets, and a reference PWA. Read `design-system/project/readme.md` first; it covers voice/tone, visual foundations, iconography, and the manifest. The skill entry point is `design-system/project/SKILL.md`.

### What's in it

- **`project/tokens/`** — CSS custom properties for colors (paper/ink ramps, brand hues, semantic aliases), per-aisle category colors, typography (Newsreader/Manrope/JetBrains Mono with a 1.2 scale), spacing (4px grid + 44px tap target), effects (warm ink-tinted shadows, ease curves, durations). Single `styles.css` is the import chain — link that one file and you get everything.
- **`project/components/`** — 20 React/JSX primitives organized by group: `core/` (Brand, Button, IconButton, Avatar, Icon), `forms/` (Input, Select, Field, Checkbox), `grocery/` (CategoryTag, GroceryItemRow, AisleHeader, ModeToggle, StoreFilter + the `CATEGORIES` constants + helpers), `feedback/` (Toast, EmptyState). Each component has a sibling `.d.ts` (props contract) and `.prompt.md` (usage example + key variants).
- **`project/assets/`** — the brand monogram SVG and the three genuine variable-font binaries (Newsreader, Manrope, JetBrains Mono).
- **`project/ui_kits/grocery_app/`** — interactive PWA recreation: sign-in → Plan → Shop. Crib screen structure from this, not the implementation.
- **`project/guidelines/`** — foundation specimen cards (color, type, spacing, effects).

### Non-negotiables (lifted from the design guide)

- **Never pure white or pure black.** Pages sit on `--paper-100` (`#fbf6ee`); text is `--ink-900` (`#2a1f18`).
- **Two semantic colors do most of the work.** `--accent` (tomato-500, `#c8553d`) for primary actions/links/active states. `--checked` (olive-500, `#7c8f5b`) for the shopping "done / got it" state — the single most important semantic in shopping mode.
- **Three font families, no substitutes.** Newsreader serif for the wordmark, page titles, and aisle headers (set tomato + italic for the "Grocery" line of the lockup). Manrope for all UI text and buttons. JetBrains Mono for counts, quantities, store filters, and any tabular number.
- **44px minimum tap target** on every interactive control. Item rows at 18px (`--text-md`).
- **Sentence case everywhere.** The *only* uppercase is the tracked eyebrow label (`SHARED WITH 4 MEMBERS`, `FROM RECIPETRACKER`).
- **No emoji. No third-party icon library.** All icons are 1.5px-stroke outline glyphs from the design system's `Icon.jsx` (Lucide-style, inlined — not the Lucide runtime). Add a path if a new glyph is needed.
- **Warm ink-tinted shadows**, never neutral gray (`rgba(70, 53, 40, …)`).
- **Single motion curve**: `cubic-bezier(0.22, 1, 0.36, 1)`, fast durations (120/200/320 ms). No bounce, no scale-on-press, no decorative loops.
- **No photographic backgrounds, no gradients-as-decoration, no patterns/textures, no glassmorphism.** Warmth comes from the paper color itself.

### Aisle category colors

The 11 categories (10 from RecipeTracker + `freezer`) each own a color family the shopper learns to scan for. The design system's `tokens/categories.css` defines `--cat-<slug>-bg|mid|fg` for each. The mappings are:

| Slug | Family |
|---|---|
| `fruits` | berry |
| `vegetables` | olive |
| `meats` | tomato |
| `dairy` | sky |
| `cheeses` | saffron |
| `baking-and-dry-goods` | cocoa |
| `bread-and-crackers` | plum |
| `beverages` | sage |
| `paper-goods` | slate |
| `freezer` | frost *(Grocery-only)* |
| `misc` | neutral paper |

The design system's `CATEGORIES` array in `components/grocery/categories.js` is in **canonical store-walk order** — fruits → vegetables → meats → dairy → cheeses → baking → bread → beverages → paper → freezer → misc. This is the seeded default value for `households/{id}.categoryOrder` on creation.

### How the design system gets consumed

The bundle is a *reference* — JSX prototypes meant to be ported, not shipped as-is. During Phase 0:

1. **Copy `project/assets/fonts/`** → `web/public/fonts/`.
2. **Copy `project/assets/brand/grocery-icon.svg`** → `web/public/icons/` and inline a TSX `<Monogram />` from `project/components/core/Brand.jsx`.
3. **Port `project/tokens/*.css`** → `web/src/styles/tokens/` and re-create the `styles.css` import chain. These are framework-agnostic CSS variables — they live in `:root` and are consumed by both design-system component CSS and Tailwind utilities.
4. **Port `project/components/`** → `web/src/components/ui/` as TSX (preserve the prop contracts in the `.d.ts` files). Keep the prompt files in the design-system bundle as reference; don't ship them.
5. **Configure Tailwind v4** to *coexist* with the design system: Tailwind owns layout utilities (flex/grid/gap); the design system owns branded primitives and tokens. Tailwind's theme should reference the CSS variables directly (`color: var(--ink-900)`) so there's one source of truth.
6. **Manifest** — set `theme_color: "#c8553d"` (tomato-500), `background_color: "#fbf6ee"` (paper-100). These match the design system's first-paint expectations.

### Locked design decisions from the design-system chat

The design-system author iterated with Justin and landed on three signals worth treating as locked:

- **Brand mark is approved.** Tomato grocery-list card monogram with checked top row + olive sprig. Don't redesign.
- **Plan / Shop are the two pivot verbs.** No "edit mode", no "shopping list", no "buy mode" — just *Plan* (write) and *Shop* (read).
- **No import button in the Plan UI.** The import flow is **entry-from-deep-link only** — RecipeTracker pushes via `/import?source=mealplan&payload=…`, Grocery never has a "find a meal plan to import" affordance in the Plan view. Settings may show a one-line help row ("Send a meal plan from RecipeTracker → it'll open here") but no item-discovery UI. Captured in Phase 8.

## Architectural alignment with RecipeTracker

RecipeTracker is a sibling Firebase PWA. To keep the import surface clean and avoid re-solving problems Justin has already solved, this app mirrors its conventions:

| Convention | Source in RecipeTracker | Applied here |
|---|---|---|
| Vite + React + TS, pnpm workspaces | repo root | same |
| `shared/` package with Zod schemas | `shared/src/recipe.ts`, `mealPlan.ts` | new `shared/src/household.ts`, `groceryList.ts` |
| Firebase Auth with `signInWithRedirect` (popup is broken in iOS PWA) | `web/src/lib/useAuth.tsx` | same |
| `searchTokens` array + `array-contains-any` for search | `shared/src/searchTokens.ts` | reuse for catalog autocomplete |
| `sharedWith: string[]` on doc + `autoShares` collection for blanket access | `recipes/{id}.sharedWith` + `autoShares/{ownerId}_{granteeUid}` | household members serve this role — see below |
| User-scoped prefs in `users/{uid}` | `users/{uid}.categories` | `users/{uid}.householdId` |
| `vite-plugin-pwa` with `registerType: "autoUpdate"`, no SW caching of Firestore/Auth | `web/vite.config.ts` | same |
| Cloud Functions for write paths that need server enforcement | `functions/src/shareRecipe.ts` | `functions/src/inviteToHousehold.ts` |

**Most critical alignment:** the `GroceryItem` schema. RecipeTracker's `shared/src/mealPlan.ts` already defines:

```ts
GROCERY_CATEGORIES = ["fruits","vegetables","meats","dairy","cheeses",
  "baking-and-dry-goods","bread-and-crackers","beverages","paper-goods","misc"]

GroceryItem = { text: string; category: GroceryCategory }
GroceryList = { items: GroceryItem[] }
```

This is the *canonical* shape the Recipe app emits. The Grocery app:
1. **Adopts this enum verbatim as the "aisle" axis**, extending with `"freezer"` for items the meal-plan model didn't anticipate.
2. **Treats `GroceryItem.text` as a single shopper-friendly string** ("Yellow onions (3 medium)"). Doesn't try to parse out quantity at import time — the count is already baked into `text`. The Grocery app's separate `quantity` field is a numeric count for *manually entered* items; imports default it to 1 and leave the human-readable count in `text`.

**Sharing model — simpler than RecipeTracker's:** because each user belongs to one household and the household *is* the list, there's no per-list `sharedWith` array and no `autoShares` collection. Membership is set on `households/{householdId}.memberIds[]` and a pointer on `users/{uid}.householdId`. Conceptually it's the same idea — uid-array membership — just collapsed into the household doc.

## Additional patterns to inherit

A deeper pass through RecipeTracker surfaced these — none are obvious from the data model but each prevented a real problem upstream:

### Service-worker update strategy: **`prompt`, not `autoUpdate`**

RecipeTracker's `vite.config.ts` deliberately uses `registerType: "prompt"`, not the `autoUpdate` referenced in its CLAUDE.md. The comment explains why: silent auto-update reloads the page mid-recipe, scrolling away from the user's place. The same argument is *stronger* for Grocery — a silent reload while shopping would un-scroll the user mid-store, possibly losing a checkoff in-flight. **Use `registerType: "prompt"` and show a toast** ("Update available — reload") via `useRegisterSW({ onNeedRefresh })`. The earlier section of this plan that said `autoUpdate` is wrong; this supersedes it.

### Dev-mode popup, prod-mode redirect

RecipeTracker's `useAuth.tsx` branches on `import.meta.env.DEV`: popup in dev (same-origin, more reliable), redirect in prod (works in iOS installed-PWA). Mirror exactly. The dev popup requires a Vite server header: `Cross-Origin-Opener-Policy: same-origin-allow-popups` — Chrome warns about COOP polling otherwise.

### Schema validation in security rules, not just client

RecipeTracker defines `isValidRecipe(data)` and `isValidMealPlan(data)` helpers in `firestore.rules` and uses them in every `create`/`update` rule. Required fields, type checks, size caps. Optional fields use the tolerant pattern `(!('x' in data) || data.x is list)` so old docs aren't orphaned when the schema grows. Apply: `isValidHousehold`, `isValidItem`, `isValidCatalogEntry`, `isValidInvite`.

### Firestore composite indexes

RecipeTracker declares two composite indexes in `firestore.indexes.json` for queries that combine equality + ordering. For Grocery, anticipate:
- `(addedAt ASC)` — single-field, no composite needed; the primary items listener uses this and the client ranks sections via `categoryOrder` on the household
- `(stores arrayContains, addedAt ASC)` — when the sticky store filter shifts to a server-side query at scale (defer until needed; ~200 items fits comfortably in a single fetch + client-side filter)
- `(searchTokens arrayContainsAny)` doesn't need composite indexing but the field must exist on every catalog entry

Add to `firestore.indexes.json` when the first listener that needs them is wired up; Firestore will emit a "create index" link in the error message if one is missing.

### Hosting cache headers

Verbatim from `firebase.json`:
- `index.html`, `sw.js`, `manifest.webmanifest` → `Cache-Control: no-cache, no-store, must-revalidate`
- Hashed assets (`*.js`, `*.css`, fonts, images) → `public, max-age=31536000, immutable`

This is what makes PWA updates actually arrive — without `no-cache` on `index.html`, CDN intermediaries serve stale shells.

### Pnpm workspace excludes `functions/`

RecipeTracker's `pnpm-workspace.yaml` lists `web` and `shared` but **not** `functions`. The `functions/` directory uses npm (Firebase tooling assumes this). The root has `postinstall: npm --prefix functions install` so one `pnpm install` primes both. Predeploy hook in `firebase.json` runs `npm --prefix functions run lint && build`. Mirror exactly — fighting Firebase's tooling assumptions isn't worth it.

### Bundle chunking

RecipeTracker's `vite.config.ts` splits Firebase per product (firestore / auth / core) and React as its own chunk, raises `chunkSizeWarningLimit` to 600 KB (Firestore alone is ~400 KB). Mirror — without this, a patch to one Firebase product invalidates the whole vendor chunk cache.

### Service-worker config specifics

From RecipeTracker's `vite.config.ts`:
- `navigateFallback: "/index.html"` so deep links work offline
- `navigateFallbackDenylist: [/^\/__\/auth/, /^\/api\//]` — must NOT intercept Firebase Auth's iframe handler or function calls
- `cleanupOutdatedCaches: true`
- `globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf}"]`
- Runtime caching: bypass Firestore/Auth (they manage their own cache); CacheFirst for Google Fonts if used
- `devOptions: { enabled: false }` — no SW in dev (default, but be explicit)

### Pure-helpers split for testability

RecipeTracker pairs Firebase-touching code with a `*Core.ts` companion that holds the pure logic (e.g. `tagsCore.ts`, `mealPlansCore.ts`). The core file has no Firestore imports and can be unit-tested with vitest. Apply to Grocery: `catalogCore.ts` (token generation, text normalization), `importCore.ts` (payload base64url decode, Zod validation, category mapping), `householdCore.ts` (member-role helpers, default seeders).

### Emulator switch

`VITE_USE_EMULATOR=1` in `web/.env` makes `firebase.ts` connect to emulators. Single flag, no code branches in app logic. Adopt.

### `firebase.json` conveniences

Two RecipeTracker patterns worth copying verbatim:
- `auth.providers.googleSignIn` block declares OAuth brand display name + support email — avoids a manual console step on a fresh project
- `functions[0].disallowLegacyRuntimeConfig: true` — forces Secret Manager / `defineSecret`, prevents accidentally committing API keys to runtime config

### Setup gotcha to document

The `<project>.web.app` domain is **not** in Firebase Auth's authorized-domains list by default — only `<project>.firebaseapp.com` is. Sign-in fails on `.web.app` until you add it manually (Console → Authentication → Settings → Authorized domains). Pure console fix, nothing to deploy. Add to Grocery README's setup section so it's not rediscovered.

### CI/CD shape

Push-to-main triggers a full Firebase deploy via GitHub Actions, with a concurrency gate so two pushes can't race. Service account needs the role list documented in RecipeTracker's README (the non-obvious one for Grocery v1: `roles/secretmanager.admin` is only needed if functions use `defineSecret`; since Grocery v1 has no AI calls, skip it until a function actually needs a secret).

### PWA testing reality

PWA install + service worker only fire on **production builds** (`pnpm build && pnpm preview`), not the dev server. Document this in the Grocery README so the install prompt's absence in dev doesn't get debugged as a bug.

## Data model (Firestore)

```
users/{uid}
  displayName, email, photoURL
  householdId       string | null      // pointer to current household
  createdAt, updatedAt

households/{householdId}
  name              "Marks Family"
  ownerId           uid
  memberIds         [uid, uid, ...]    // includes owner
  members           { uid: { role: "owner"|"editor", joinedAt, displayName } }
  stores            ["Trader Joe's", "Costco", "Target", "QFC"]
  categoryOrder     // canonical store-walk order from design-system CATEGORIES, seeded on create:
                    // ["fruits","vegetables","meats","dairy","cheeses",
                    //  "baking-and-dry-goods","bread-and-crackers","beverages",
                    //  "paper-goods","freezer","misc"]
  createdAt, updatedAt

households/{householdId}/items/{itemId}
  text              "Lemons"           // free-text shopper line
  quantity          2                  // number, default 1; imports default to 1 with count in text
  category          "fruits"           // GROCERY_CATEGORIES | "freezer"
  stores            ["Trader Joe's", "Costco"]
  checked           false
  checkedBy         uid | null
  checkedAt         timestamp | null
  addedBy           uid
  addedAt           timestamp
  source            "manual" | "catalog" | "mealplan"
  sourceRef         { mealPlanId, recipeIds?: string[] } | null

households/{householdId}/catalog/{catalogItemId}
  text              "Lemons"
  textLower         "lemons"
  searchTokens      ["l","le","lem","lemo","lemon","lemons"]
  defaultCategory   "fruits"
  defaultStores     ["Trader Joe's", "Costco"]
  defaultQuantity   2                  // number
  timesUsed         12
  lastUsedAt        timestamp

invites/{inviteId}
  householdId       string
  invitedEmail      string
  invitedBy         uid
  createdAt, expiresAt
  status            "pending" | "accepted" | "revoked"
```

**Why a `households` collection (not `lists`):** the user explicitly wants one list per household. Naming the collection `households` makes the cardinality obvious in the data and rules, and removes a layer of indirection (no list picker, no `householdId.lists[0]`).

**Why per-household catalog:** the household's buying habits are shared. Two unrelated families using the app shouldn't pollute each other's autocomplete.

**Why `text` (not `name`) on items:** matches RecipeTracker's `GroceryItem.text`. Items from meal-plan import already arrive as full shopper-friendly strings; making `text` the canonical field avoids a translation layer.

**Why `quantity: number`:** user's explicit decision. Default 1. Imported meal-plan items: `quantity = 1`, `text = "Yellow onions (3 medium)"` (the count stays in the human-readable text — the import doesn't try to extract a number from `"3 medium"`).

### Canonical item sort order: by section

Items are always ordered **by grocery-store section** (i.e., by `category`, ranked using `households/{id}.categoryOrder`), then by `addedAt ASC` within a section. This is the primary user-visible order in both write and shopping modes — not addedAt, not alphabetical. The reasoning: when shopping, you walk the store section by section, and when planning you mentally group "what produce do we need / what dairy do we need." Either way, section is the dominant axis.

Implementation: the items listener fetches with `orderBy("addedAt", "asc")` and the client groups + ranks sections by `categoryOrder` (which lives on the household doc). At ~200 items per household max, client-side ranking is instant and avoids denormalizing a `categoryRank` integer onto every item.

The "group by store" toggle remains available as an alternate view (some users prefer to see "everything at Costco" as one block), but it is not the default in either mode. Within each store group, sub-grouping still falls back to section order.

## Security rules sketch

Validation helpers go in the file (mirroring RecipeTracker's `isValidRecipe`) — required fields, type checks, size caps, tolerant `(!('x' in data) || data.x is list)` pattern for optional fields:

```
function isValidHousehold(data) { … name, ownerId, memberIds, stores, categoryOrder, timestamps … }
function isValidItem(data)      { … text, quantity (number), category (enum), stores (list), checked (bool), addedBy, addedAt … }
function isValidCatalog(data)   { … text, textLower, searchTokens (list), defaultCategory, defaultStores, defaultQuantity (number) … }
function isValidInvite(data)    { … householdId, invitedEmail, invitedBy, status enum, expiresAt … }
```

Match blocks:

```
users/{uid}:
  read/write: request.auth.uid == uid

households/{householdId}:
  read:  request.auth.uid in resource.data.memberIds
  create: request.auth.uid == request.resource.data.ownerId && isValidHousehold(request.resource.data)
  update: request.auth.uid in resource.data.memberIds
          && (changes to ownerId / memberIds require request.auth.uid == resource.data.ownerId)
          && isValidHousehold(request.resource.data)
  delete: request.auth.uid == resource.data.ownerId

households/{householdId}/items/{itemId}:
  read/write: request.auth.uid in get(parent household).data.memberIds
  create/update: also isValidItem(request.resource.data)

households/{householdId}/catalog/{catalogItemId}:
  read/write: same membership check on parent household
  create/update: also isValidCatalog(request.resource.data)

invites/{inviteId}:
  read:   invitedEmail == request.auth.token.email || invitedBy == request.auth.uid
  create: invitedBy == request.auth.uid
          && request.auth.uid in get(/households/<householdId>).data.memberIds
          && isValidInvite(request.resource.data)
  update: only the invitee may flip status to "accepted"; only the inviter may revoke
```

## Import contract with RecipeTracker

RecipeTracker meal plans already produce a `GroceryList`. Integration is one-way push: user opens a meal plan in RecipeTracker, taps "Send to Grocery," lands in the Grocery app's import screen for review and commit into their household.

**Transport: deep link, GET, URL-encoded JSON payload.** Mirrors RecipeTracker's existing share-target/`/import?url=…` pattern — no new infrastructure, works across separately-deployed Firebase projects, no cross-project Firestore reads.

```
https://<grocery-host>/import?source=mealplan
  &payload=<base64url(JSON.stringify({
    schemaVersion: 1,
    mealPlanId: "...",
    mealPlanName: "Thanksgiving 2026",
    items: GroceryList["items"]   // exact shape from RecipeTracker
  }))>
```

**On the Grocery side:**
- Route `/import` decodes the payload, validates against a vendored copy of `GroceryListSchema` (so a RecipeTracker schema change doesn't silently corrupt imports).
- Resolves the user's `householdId`; if none, prompts to create one before continuing.
- Shows a preview: each item with its category, plus dropdowns to assign stores. Catalog lookup: if a previously-bought item matches by `textLower`, prefill its `defaultStores`.
- User confirms → batched write to `households/{householdId}/items` with `quantity: 1`, `source: "mealplan"`, `sourceRef: { mealPlanId }`.

**Schema drift protection:** version the payload (`schemaVersion: 1`). The Grocery app refuses payloads with unknown versions and shows a "RecipeTracker is newer, update Grocery" error.

**Future enhancement (not v1):** add a "Send to Grocery" button in RecipeTracker's meal-plan view that constructs and opens this URL. Defer until the Grocery side works end-to-end.

## Should `shared/` be cross-repo?

**Decision: no, vendor instead.** Tempting to extract `GroceryItem`/`GroceryList` schemas into a third repo that both apps consume, but: (a) cross-repo TS deps in pnpm workspaces add friction (file:// links or a published package), (b) the schema is small and stable, (c) versioning the payload protects against drift better than a shared package would. Vendor a copy of `GroceryItem`/`GroceryList`/`GROCERY_CATEGORIES` into `Grocery/shared/src/groceryList.ts` with a header pointing to the RecipeTracker source.

## Build phases

Each phase ends in something usable on a real device. Don't move on until the current phase works end-to-end.

### Phase 0 — Scaffold
- `pnpm init`, workspace config matching RecipeTracker (`pnpm-workspace.yaml` includes `web` + `shared` but **not** `functions`)
- Root `package.json` mirrors RecipeTracker scripts (`dev`, `build`, `preview`, `lint`, `typecheck`, `deploy`, `deploy:hosting`, `deploy:functions`, `deploy:rules`, `postinstall: npm --prefix functions install`); pin `engines.node >=20` and `packageManager: pnpm@<version>`
- Vite + React + TS scaffold in `web/`; bundle chunking config (firebase split per product, react chunk, `chunkSizeWarningLimit: 600`); dev-server COOP header
- Tailwind v4, configured to coexist with the design system (Tailwind for layout utilities; design system for tokens + branded primitives — both reference the same `:root` CSS variables)
- **Port the design system from `design-system/project/`** into `web/`: fonts → `web/public/fonts/`, brand SVG → `web/public/icons/`, token CSS files → `web/src/styles/tokens/` with a `styles.css` import chain, JSX components → `web/src/components/ui/` as TSX (preserve the `.d.ts` prop contracts; keep the source bundle as reference, don't ship `.prompt.md` files)
- Base layout shell, mobile-first, page sits on `--paper-100`, text in `--ink-900`
- Firebase project (separate from RecipeTracker), `web/.env.example` with `VITE_FIREBASE_*` + `VITE_USE_EMULATOR=1` flag, `web/src/lib/firebase.ts` reads emulator flag
- `firebase.json` with: hosting `**` → `/index.html` rewrite; cache headers (`no-cache` on index.html/sw.js/manifest, `immutable` on hashed assets); `functions[].disallowLegacyRuntimeConfig: true`; predeploy hook `npm --prefix functions run lint && build`; `auth.providers.googleSignIn` block
- `vite-plugin-pwa` with `registerType: "prompt"`, `navigateFallback: "/index.html"`, `navigateFallbackDenylist: [/^\/__\/auth/, /^\/api\//]`, `cleanupOutdatedCaches: true`, no runtime caching of Firestore/Auth; manifest `theme_color: "#c8553d"` (tomato-500), `background_color: "#fbf6ee"` (paper-100) so the first paint matches the design system before React mounts
- `shared/` package skeleton, vendor `GROCERY_CATEGORIES` + `GroceryItem`/`GroceryList` with `// SOURCE: RecipeTracker/shared/src/mealPlan.ts` header; vitest configured
- Deploy "hello world" to Firebase Hosting, confirm PWA install on phone via `pnpm build && pnpm preview` (not dev server)

### Phase 1 — Auth
- Google sign-in with **dev-popup / prod-redirect** branch on `import.meta.env.DEV` (verbatim from RecipeTracker's `useAuth.tsx`)
- `getRedirectResult` on boot
- `AuthContext` + `useAuth()` hook
- Create/update `users/{uid}` doc on first sign-in (no household yet)
- Document the `<project>.web.app` authorized-domains gotcha in `README.md` setup section

### Phase 2 — Household setup
- On first sign-in (or any time `users/{uid}.householdId` is null), prompt: create a new household, or wait for an invite. Use the design system's `EmptyState` component for the "no household yet" empty state and `Button` (primary tomato) for "Create household."
- "Create household" → write `households/{newId}` with default stores + `categoryOrder` seeded from the design system's canonical store-walk order (`design-system/project/components/grocery/categories.js` → `CATEGORIES.map(c => c.slug)`), set `users/{uid}.householdId`
- Settings page: rename household, edit stores list, drag-to-reorder categories
- `useHousehold()` hook reads `users/{uid}.householdId`, subscribes to the household doc + items subcollection

### Phase 3 — Items CRUD
- Add item: `text` (design system `Input` + `Field`), `quantity` (number input, default 1), `category` (`Select` or `CategoryTag` picker), `stores` (multi-select pills)
- Edit, delete via the `GroceryItemRow.trailing` slot with `IconButton`s (pencil / trash)
- Realtime listener on items subcollection
- Empty state: use `EmptyState` with the copy "Your list is empty — Add items as you think of them, or import a meal plan from RecipeTracker." (the design guide's reference copy)
- Toast confirmations via design system `Toast`: "Added Lemons", "Removed Lemons"

### Phase 4 — Grouping & view modes
- **Default order: by section.** Items grouped under design system `AisleHeader` components in the order defined by `households/{id}.categoryOrder`; within a section, items sort by `addedAt ASC`. This is the default in both write and shopping modes.
- Top-of-list pivot: `ModeToggle` (Plan / Shop) — locked labels from the design system.
- Alternate view: group by **Store** (toggle). Items with multiple stores appear in each relevant store group, with visual indicator (the design system's `GroceryItemRow.showCategory` prop surfaces the category chip when an item lives outside an aisle header). Within a store group, sub-order is still by section.
- Section headers collapse/expand (use the warm `--border-faint` hairline divider, not boxed grids — non-negotiable from the design guide), empty sections hidden
- Drag-to-reorder categories within the household (writes to `households/{id}.categoryOrder`) — the same array is the rank source for the items view

### Phase 5 — Catalog + autocomplete
- On item save, upsert into `households/{id}/catalog/{textLowerId}` with prefix `searchTokens`
- Add-item input: type-ahead against catalog using `array-contains-any` on tokens
- Selecting a suggestion prefills category, stores, quantity
- Bump `timesUsed`/`lastUsedAt`

### Phase 6 — Shopping (read) mode
- Top-of-screen `ModeToggle` (Plan / Shop) — the active "Shop" option tints **olive** to signal the "at the store" context (this is the design system's intent; don't replace it with tomato)
- **Default order: by section** (same as write mode) — when you walk into the store you want to see Produce first, then your way through to the freezer. The section-by-section walk is the whole point of categorizing items.
- Tap-to-check uses the design system's **big olive `Checkbox`** (the largest tap target in the app, well above the 44px floor). Checked rows strike through in olive and tint via `--checked-bg`. Items float to the bottom of their section (still inside the section header — doesn't migrate to a global "checked" bucket).
- **Sticky store filter** — design system `StoreFilter` chip row at the top of shopping mode ("All stores" / "Trader Joe's" / "Costco" / …). Selecting a store filters the visible items to those that include it in their `stores` array; section ordering still organizes what remains. Selection persists in local storage so reopening the app at the store keeps the filter. Same mode, not a separate sub-mode.
- Live progress chip near the toggle: "2/16 in the cart" (JetBrains Mono numerals, never a percentage — design guide rule).
- "End trip" → bulk clear checked, or keep for next trip. Toast on completion: "Trip ended — checked items cleared" (matches the design guide's example copy).

### Phase 7 — Household sharing (invites)
- `functions/src/inviteToHousehold.ts` — owner/member creates `invites/{id}` for a given email
- Invite email contains a deep link `/invite/{inviteId}`
- `functions/src/acceptInvite.ts` — invitee accepts: appends their uid to `households/{id}.memberIds`, sets `users/{uid}.householdId`
- **Confirm-and-move** when invitee already has a household: show "You'll leave '<old household>' (N items will be lost). Continue?" before completing the move. If the invitee was the only member of their old household, the old household doc is deleted in the same transaction; if there were other members, the invitee just leaves them behind.
- Member list UI, leave household, remove member (owner only)
- Verify rules enforce role boundaries

### Phase 8 — Recipe import
- **Entry path is the deep link only** (design decision from the design-system chat). No "Import" affordance in the Plan view, no item-discovery UI in Settings. RecipeTracker pushes; Grocery receives.
- Route `/import` accepts `?source=mealplan&payload=<encoded>`
- Decode, validate against vendored `GroceryListSchema`, reject on `schemaVersion` mismatch
- If user has no household, route through household-create first, then resume import
- Preview screen as a bottom sheet (matches design system's import-sheet pattern): `FROM RECIPETRACKER` tracked-eyebrow label at top, meal plan title in Newsreader, items pre-sorted into the household's section order with `CategoryTag` chips and `×N` count badges, per-item store dropdown (`Select`), bulk "apply <store> to all" action
- Catalog lookup prefills stores for known items
- Dual-action sheet footer (`Button` primary "Add to list" / ghost "Not now")
- Batched commit to `households/{id}/items` with `quantity: 1`, `source: "mealplan"`, `sourceRef: { mealPlanId }`
- Toast on success: "Added 5 items from Friday Taco Night" (design guide reference copy)
- Settings may include a one-line help row ("Send a meal plan from RecipeTracker — it'll open here") — informational only, no button
- *(Companion change in RecipeTracker — defer)*: add "Send to Grocery" button in meal-plan view that builds the URL and `window.open`s it

### Phase 9 — PWA polish & ship
- Icons (192/256/384/512 + maskable) generated from the design system's brand monogram (`design-system/project/assets/brand/grocery-icon.svg`)
- Splash + theme: `theme_color: "#c8553d"` (tomato-500), `background_color: "#fbf6ee"` (paper-100), Apple `<meta>` tags for status bar
- Service worker: precache shell + fonts, runtime cache fonts (CacheFirst), bypass Firestore/Auth
- Install prompt UX and update toast (mirror RecipeTracker's `useRegisterSW({ onNeedRefresh })` — use the design system `Toast` component)
- Lighthouse PWA audit → 100
- Firestore composite indexes for catalog queries
- Production deploy

## Resolved decisions

- **Separate Firebase project** from RecipeTracker — independent quotas, rules, auth domains; matches the "deep-link payload, not cross-read" integration model.
- **Confirm-and-move** on invite-accept when invitee already has a household — show what they'll lose ("N items in '<old household>'") before completing the move. Old household doc deleted only if the leaving user was the sole member.
- **Sticky single-store filter** in shopping mode (not a sub-mode) — chip at top of screen, persists across reloads in local storage.
- **`freezer` is a Grocery-only category** — added as the 11th value in this app's `GroceryCategory` enum; not pushed back into RecipeTracker. Imported items never carry `freezer`; user reassigns in the import preview if needed.
- **Quantity = number** (default 1). Imported meal-plan items default `quantity: 1`; their human-readable count stays in `text`.
- **One household, one list** — modeled as `households/{householdId}` (not `lists/{listId}`) to make the cardinality obvious. Each user has `users/{uid}.householdId` pointing to their current household.
- **`text` field** on items (not `name`) — matches RecipeTracker's `GroceryItem.text` so imports are zero-translation.

## Non-goals (v1)

- Native iOS/Android apps (PWA only — same call as RecipeTracker)
- Barcode scanning
- Price tracking / comparison
- Coupons or deal integration
- Meal planning (that's RecipeTracker's job)
- Two-way sync with RecipeTracker — import is one-way (meal plan → grocery)
- Multiple households per user — each user is in exactly one household at a time
