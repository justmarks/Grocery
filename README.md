# Grocery

A shared household grocery list PWA for planning trips and shopping efficiently across multiple stores. Designed to receive imports from [RecipeTracker](../RecipeTracker) meal plans.

## What it does

- **Plan** in *write mode*: add items with a count, tag them by aisle and by which stores carry them. Items always appear in **store-section order** — produce, dairy, freezer, dry goods, etc. — using your household's section ranking.
- **Shop** in *read mode*: same section order so you walk the store top-to-bottom; sticky single-store filter narrows to one store at a time; big checkboxes, one-tap checkoff.
- **Share** with your household — every member sees and edits the same single list in real time. Sharing model mirrors RecipeTracker's `sharedWith` + `autoShares` pattern.
- **Remembers** what you've bought: typing "lemons" autocompletes with its usual aisle and stores.
- **Imports** from RecipeTracker meal plans via deep link (`/import?source=mealplan&payload=…`).

There is **one list per household**, not many lists per user. Each user belongs to a single household at a time.

## Stack

Mirrors RecipeTracker so types and conventions can be shared:

- **Vite + React + TypeScript**, **pnpm workspaces** (`shared/`, `web/`, optional `functions/`)
- **Firebase** — Auth (Google via `signInWithRedirect`), Firestore, Hosting
- **vite-plugin-pwa** — installable, offline-capable
- **Design system** (`design-system/`) — token CSS files, JSX/TSX component primitives, brand assets, and the three variable fonts. See [PLAN.md § Design system](PLAN.md#design-system) for what to consume and how
- **Tailwind v4** — layout utilities, sharing the same `:root` CSS variables as the design system

## Stores & categories

- **Default stores:** Trader Joe's, Costco, Target, QFC — editable per household.
- **Aisle categories** (the "area"): adopts RecipeTracker's `GROCERY_CATEGORIES` enum so imports land cleanly:
  `fruits`, `vegetables`, `meats`, `dairy`, `cheeses`, `baking-and-dry-goods`, `bread-and-crackers`, `beverages`, `paper-goods`, `misc`, plus a Grocery-app addition: `freezer`.

Stores and categories are orthogonal: an item has one category but can be carried at multiple stores ("Lemons" → `fruits`, available at Trader Joe's *and* Costco).

## Getting started

> Not yet scaffolded — see [PLAN.md](PLAN.md) for the build order.

Once initialized:

```bash
pnpm install                         # also runs `npm --prefix functions install` via postinstall
pnpm --filter web dev                # http://localhost:5173
pnpm --filter web build
firebase deploy --only hosting
```

Needs a Firebase project (**separate from RecipeTracker**) with Google Auth + Firestore enabled. Config in `web/.env.local` (see `.env.example`). Set `VITE_USE_EMULATOR=1` to point the client at the local Firebase emulator suite.

### Setup gotcha — authorized domains

Firebase Auth's authorized-domains list contains `<project>.firebaseapp.com` by default but **not** `<project>.web.app`. Google sign-in will fail on the `.web.app` URL until you add it manually: Firebase Console → Authentication → Settings → Authorized domains → Add domain. Pure console fix, nothing to deploy.

### Testing the PWA

PWA install prompt and service worker only fire on production builds, not the dev server. To test installability, share-target behavior, or offline mode:

```bash
pnpm --filter web build
pnpm --filter web preview
```

## Project layout (planned)

```
shared/
  src/groceryList.ts         vendored GroceryItem schema from RecipeTracker
  src/household.ts           Household, Member, Store, Item, Catalog types + Zod
  src/searchTokens.ts        catalog autocomplete tokens (mirrors RecipeTracker)
web/
  src/routes/                household, shopping, import, settings
  src/lib/firebase.ts
  src/lib/useAuth.tsx        signInWithRedirect + getRedirectResult
  src/lib/useHousehold.ts    resolves users/{uid}.householdId → household doc + items stream
  src/lib/catalog.ts         item memory + autocomplete
functions/
  src/inviteToHousehold.ts   email → uid resolution, append to memberIds
  src/acceptInvite.ts        move user to inviter's household
firestore.rules
firebase.json
```

## Visual identity

Warm editorial — think a well-set cookbook page, not a SaaS dashboard. Cream paper surfaces (`--paper-100`), warm near-black ink (`--ink-900`), tomato as primary accent (buttons, links, active states), olive as the "checked / done / got-it" green (the most important semantic in shopping mode). Three fonts: **Newsreader** (serif, page titles + aisle headers), **Manrope** (sans, all UI), **JetBrains Mono** (counts + quantities + store metadata). Sentence case everywhere, no emoji, outline-only icons. Full guide: `design-system/project/readme.md`.

## TODO
- Settings doesn't open
- speed up cold start on phone
- Incorporate Google Analytics
- Auto deploy from GitHub
- Deal with functions warning: !  functions: Runtime Node.js 20 was deprecated on 2026-04-30 and will be decommissioned on 2026-10-30, after which you will not be able to deploy without upgrading. Consider upgrading now to avoid disruption. See https://cloud.google.com/functions/docs/runtime-support for full details on the lifecycle policy
- Polish pass deferred items
  - Bitmap icons (192/256/384/512 PNG variants). The manifest references the SVG monogram with sizes: "any" for both any and maskable purposes, which Chrome / Edge / Safari 16+ accept. Lighthouse may flag this as "use PNG fallback" depending on version. To add: run an SVG-to-PNG generator (sharp or @resvg/resvg-js) and update the manifest icons array.
  - Drag-to-reorder categories in Settings — currently up/down chevrons. Functional + accessible; touch dnd would need @dnd-kit or hand-rolled touch handlers.
  - RecipeTracker side — adding a "Send to Grocery" button that constructs the /import?source=mealplan&payload=… URL and window.opens it. One-file change in RecipeTracker, deferred to a session in that repo.
  - Lighthouse audit — run against the live URL once deployed and address any specific findings.
- Audit the app against the design system
- partial search (milk, berri)
- Icons instead of text for stores
  - https://yt3.googleusercontent.com/ytc/AIdro_ntUsDzBbRsrRfsKby0Vj2Gap0fqQownWKn5gwPHBckgw=s900-c-k-c0x00ffffff-no-rj
  - https://dribbble.com/shots/6868902-Costco-App-Icon-Concept
  - https://corporate.target.com/getmedia/890f3192-ce35-496a-a3cf-15fc0a8105d0/Target_Bullseye-Logo_Red.jpg?width=620
  - https://play-lh.googleusercontent.com/NjbklWh9hl5xClU-IagcOXtMlajt8V_bPN4m4LbNPbUGetFSIPFhYfhUi6arA_Tl93F2=w240-h480-rw

## Related

- [RecipeTracker](../RecipeTracker) — sibling app; source of meal-plan imports and the editorial visual language Grocery inherits.
