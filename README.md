# Grocery

A shared household grocery list PWA for planning trips and shopping efficiently across multiple stores. Designed to receive imports from [RecipeTracker](../RecipeTracker) meal plans.

## What it does

- **Plan** in *write mode*: add items with a count, tag them by aisle and by which stores carry them.
- **Shop** in *read mode*: items grouped by store, big checkboxes, one-tap checkoff.
- **Share** with your household — every member sees and edits the same single list in real time. Sharing model mirrors RecipeTracker's `sharedWith` + `autoShares` pattern.
- **Remembers** what you've bought: typing "lemons" autocompletes with its usual aisle and stores.
- **Imports** from RecipeTracker meal plans via deep link (`/import?source=mealplan&payload=…`).

There is **one list per household**, not many lists per user. Each user belongs to a single household at a time.

## Stack

Mirrors RecipeTracker so types and conventions can be shared:

- **Vite + React + TypeScript**, **pnpm workspaces** (`shared/`, `web/`, optional `functions/`)
- **Firebase** — Auth (Google via `signInWithRedirect`), Firestore, Hosting
- **vite-plugin-pwa** — installable, offline-capable
- **Tailwind CSS** — mobile-first

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

## Related

- [RecipeTracker](../RecipeTracker) — sibling app; source of meal-plan imports.
