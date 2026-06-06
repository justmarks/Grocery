// Pure group + sort logic for the items view. Lives in @grocery/shared
// (Firestore-free) so it can be unit tested with vitest without
// mocking Firebase, and shared across the items list view, the
// shopping store-filter view, and the import preview.

import type { GroceryCategory } from "./groceryList";
import type { Item } from "./household";

/**
 * A single aisle group — the unit of rendering on the list view.
 * `items` is in the within-aisle sort order (addedAt ascending; checked
 * items float to the bottom when `checkedFloat` is true).
 */
export type AisleGroup<T extends { id: string }> = {
  category: GroceryCategory;
  items: T[];
};

/**
 * Shape we need from an item to group + sort it. We ask for an
 * `addedAt` accessor instead of a raw timestamp so callers can pass
 * either a Firestore Timestamp or a plain number, and so this helper
 * stays free of firebase types.
 */
export type GroupableItem = {
  id: string;
  category: GroceryCategory;
  checked: boolean;
  addedAtMillis: number;
};

export type GroupByAisleOptions = {
  /** Float checked items to the bottom of each section. Default true. */
  checkedFloat?: boolean;
  /** Filter to items that carry this store. Empty / "all" → no filter. */
  storeFilter?: string;
  /** Carrier function — pass a way to read an item's stores list. */
};

/**
 * Group items by category in the given `categoryOrder` order. Items
 * whose category isn't in `categoryOrder` are bucketed into the first
 * category equal to "misc", or appended at the end if no misc bucket
 * exists. Empty groups are omitted.
 */
export function groupByAisle<T extends GroupableItem>(
  items: readonly T[],
  categoryOrder: readonly GroceryCategory[],
  options: GroupByAisleOptions = {},
): AisleGroup<T>[] {
  const { checkedFloat = true } = options;

  const orderIndex = new Map<GroceryCategory, number>();
  categoryOrder.forEach((c, i) => orderIndex.set(c, i));

  // Bucket items by category, falling back to misc when unknown.
  const buckets = new Map<GroceryCategory, T[]>();
  for (const item of items) {
    const target = orderIndex.has(item.category)
      ? item.category
      : ("misc" as GroceryCategory);
    const bucket = buckets.get(target);
    if (bucket) bucket.push(item);
    else buckets.set(target, [item]);
  }

  // Walk categoryOrder; emit non-empty groups in declared order.
  const groups: AisleGroup<T>[] = [];
  for (const category of categoryOrder) {
    const bucket = buckets.get(category);
    if (!bucket || bucket.length === 0) continue;
    bucket.sort((a, b) => {
      if (checkedFloat && a.checked !== b.checked) {
        return a.checked ? 1 : -1;
      }
      return a.addedAtMillis - b.addedAtMillis;
    });
    groups.push({ category, items: bucket });
  }
  return groups;
}

/**
 * A store group — the unit of rendering when the view is grouped by
 * store. An item with multiple stores is duplicated across each
 * group it qualifies for. Within a group, items sub-sort by the
 * household's categoryOrder, then addedAt.
 *
 * `store` is the empty string for the trailing "Unassigned" group
 * — items the user hasn't picked stores for yet.
 */
export type StoreGroup<T extends { id: string }> = {
  store: string;
  items: T[];
};

export type GroupByStoreOptions = GroupByAisleOptions;

/**
 * Group items by store, with the canonical category-then-addedAt
 * sub-order inside each store group. Stores are emitted in the
 * order given by `stores` (the household's stores list); any store
 * referenced by an item but missing from the list is appended at
 * the end. Items with no `stores` entries land in a trailing
 * group with `store: ""`.
 */
export function groupByStore<
  T extends GroupableItem & { stores: readonly string[] },
>(
  items: readonly T[],
  stores: readonly string[],
  categoryOrder: readonly GroceryCategory[],
  options: GroupByStoreOptions = {},
): StoreGroup<T>[] {
  const { checkedFloat = true } = options;

  const orderIndex = new Map<GroceryCategory, number>();
  categoryOrder.forEach((c, i) => orderIndex.set(c, i));

  function sortFn(a: T, b: T): number {
    if (checkedFloat && a.checked !== b.checked) return a.checked ? 1 : -1;
    const ai = orderIndex.get(a.category) ?? Number.MAX_SAFE_INTEGER;
    const bi = orderIndex.get(b.category) ?? Number.MAX_SAFE_INTEGER;
    if (ai !== bi) return ai - bi;
    return a.addedAtMillis - b.addedAtMillis;
  }

  const buckets = new Map<string, T[]>();
  const unassigned: T[] = [];
  for (const item of items) {
    if (item.stores.length === 0) {
      unassigned.push(item);
      continue;
    }
    for (const s of item.stores) {
      const bucket = buckets.get(s);
      if (bucket) bucket.push(item);
      else buckets.set(s, [item]);
    }
  }

  const seen = new Set<string>();
  const groups: StoreGroup<T>[] = [];
  for (const store of stores) {
    const bucket = buckets.get(store);
    if (!bucket || bucket.length === 0) continue;
    bucket.sort(sortFn);
    groups.push({ store, items: bucket });
    seen.add(store);
  }
  // Stores referenced by items but not in the household list (legacy
  // data after a store rename, etc.). Sort the store names so the
  // emission order is stable.
  const orphanStores: string[] = [];
  for (const store of buckets.keys()) {
    if (!seen.has(store)) orphanStores.push(store);
  }
  orphanStores.sort();
  for (const store of orphanStores) {
    const bucket = buckets.get(store)!;
    bucket.sort(sortFn);
    groups.push({ store, items: bucket });
  }
  if (unassigned.length > 0) {
    unassigned.sort(sortFn);
    groups.push({ store: "", items: unassigned });
  }
  return groups;
}

/** Pretty join of a stores list with " · " — matches the design guide. */
export function formatStores(stores: readonly string[]): string {
  return stores.join(" · ");
}

/**
 * Pick the `addedAtMillis` value off a stored Item — handles either a
 * Firestore Timestamp shape or a serverTimestamp() placeholder. Used
 * by the list view to feed groupByAisle without leaking firebase
 * types into shared code.
 */
export function itemAddedAtMillis(item: Pick<Item, "addedAt">): number {
  const raw = item.addedAt as unknown;
  if (raw && typeof raw === "object") {
    const t = raw as { toMillis?: () => number; seconds?: number };
    if (typeof t.toMillis === "function") return t.toMillis();
    if (typeof t.seconds === "number") return t.seconds * 1000;
  }
  if (typeof raw === "number") return raw;
  // Pending serverTimestamp placeholder — treat as "now" so optimistic
  // adds slot to the bottom of the section until the server stamp lands.
  return Date.now();
}
