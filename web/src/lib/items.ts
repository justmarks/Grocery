// Items CRUD + live subscription. Items live under
// households/{householdId}/items/{itemId}. Membership is enforced
// by firestore.rules; this module is just the typed plumbing.
//
// The realtime listener returns items in addedAt-ascending order;
// section grouping (by household.categoryOrder) happens in the view
// layer via groupByAisle from @grocery/shared.

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import type { GroceryCategory, Item } from "@grocery/shared";
import { db } from "./firebase";
import { upsertCatalogEntry } from "./catalog";

function itemsRef(householdId: string) {
  return collection(db, "households", householdId, "items");
}
function itemRef(householdId: string, itemId: string) {
  return doc(db, "households", householdId, "items", itemId);
}

export type AddItemInput = {
  text: string;
  quantity?: number;
  category?: GroceryCategory;
  stores?: string[];
};

/**
 * Append a new item to the household's list. `addedBy`, `addedAt`,
 * `checked`, and `source` are filled in here so callers can't drift
 * from the security-rules invariants.
 *
 * Returns the new item id (a Firestore auto-id).
 */
export async function addItem(
  householdId: string,
  uid: string,
  input: AddItemInput,
): Promise<string> {
  const newRef = doc(itemsRef(householdId));
  const payload = {
    text: input.text.trim(),
    quantity: clampQuantity(input.quantity ?? 1),
    category: (input.category ?? "misc") satisfies GroceryCategory,
    stores: dedupeStores(input.stores ?? []),
    checked: false,
    checkedBy: null,
    checkedAt: null,
    addedBy: uid,
    addedAt: serverTimestamp(),
    source: "manual" as const,
    sourceRef: null,
  };
  await setDoc(newRef, payload);
  // Record the latest defaults for autocomplete. Failures here are
  // intentionally silent — the item itself is the source of truth;
  // a catalog hiccup shouldn't bubble up to the user.
  upsertCatalogEntry(householdId, {
    text: payload.text,
    category: payload.category,
    stores: payload.stores,
    quantity: payload.quantity,
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.warn("[items] catalog upsert failed:", err);
  });
  return newRef.id;
}

export type ItemPatch = Partial<
  Pick<Item, "text" | "quantity" | "category" | "stores">
>;

/**
 * Patch a subset of editable fields on an item. `addedBy` / `addedAt`
 * / `source` are never touched; toggling `checked` goes through
 * `toggleItemChecked` instead so the checkedBy/checkedAt audit
 * fields stay paired.
 */
export async function updateItem(
  householdId: string,
  itemId: string,
  patch: ItemPatch,
): Promise<void> {
  const next: Record<string, unknown> = {};
  if (patch.text !== undefined) next.text = patch.text.trim();
  if (patch.quantity !== undefined) next.quantity = clampQuantity(patch.quantity);
  if (patch.category !== undefined) next.category = patch.category;
  if (patch.stores !== undefined) next.stores = dedupeStores(patch.stores);
  if (Object.keys(next).length === 0) return;
  await updateDoc(itemRef(householdId, itemId), next);

  // After-edit catalog refresh: snapshot the post-patch shape and
  // upsert it so the next "Add Lemons" sees the user's latest
  // category / stores / qty as defaults. Silent on failure.
  try {
    const snap = await getDoc(itemRef(householdId, itemId));
    if (snap.exists()) {
      const d = snap.data() as Item;
      upsertCatalogEntry(householdId, {
        text: d.text,
        category: d.category,
        stores: d.stores,
        quantity: d.quantity,
      }).catch((err) => {
        // eslint-disable-next-line no-console
        console.warn("[items] catalog upsert failed:", err);
      });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[items] post-update read for catalog failed:", err);
  }
}

export async function deleteItem(
  householdId: string,
  itemId: string,
): Promise<void> {
  await deleteDoc(itemRef(householdId, itemId));
}

export type ItemRowInput = {
  text: string;
  category: GroceryCategory;
  stores: string[];
  quantity?: number;
};

export type BatchSource =
  | { source: "manual" }
  | { source: "mealplan"; sourceRef: { mealPlanId: string } };

/**
 * Append many items in one batched write — used by the meal-plan
 * import flow in Phase 8. Chunks past Firestore's 500-write batch
 * cap so a meal plan with hundreds of ingredients still imports
 * atomically per chunk. Returns the count of rows written.
 *
 * Catalog fan-out is fire-and-forget (and per-item, not batched)
 * so a single bad row doesn't poison the catalog write — matches
 * the single-add behavior in `addItem`.
 */
export async function addItemsBatch(
  householdId: string,
  uid: string,
  rows: readonly ItemRowInput[],
  meta: BatchSource,
): Promise<number> {
  if (rows.length === 0) return 0;
  const ts = serverTimestamp();
  const sourceRef =
    meta.source === "mealplan" ? meta.sourceRef : null;

  const BATCH_CAP = 450;
  for (let i = 0; i < rows.length; i += BATCH_CAP) {
    const slice = rows.slice(i, i + BATCH_CAP);
    const batch = writeBatch(db);
    for (const row of slice) {
      const newRef = doc(itemsRef(householdId));
      batch.set(newRef, {
        text: row.text.trim(),
        quantity: clampQuantity(row.quantity ?? 1),
        category: row.category,
        stores: dedupeStores(row.stores),
        checked: false,
        checkedBy: null,
        checkedAt: null,
        addedBy: uid,
        addedAt: ts,
        source: meta.source,
        sourceRef,
      });
    }
    await batch.commit();
  }
  // Fan out catalog upserts. Non-blocking so a slow catalog write
  // doesn't slow down the toast / navigate-home transition.
  for (const row of rows) {
    upsertCatalogEntry(householdId, {
      text: row.text,
      category: row.category,
      stores: row.stores,
      quantity: row.quantity ?? 1,
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.warn("[items] batch catalog upsert failed:", err);
    });
  }
  return rows.length;
}

/**
 * Bulk-delete all checked items in the household. Used by the "End
 * trip" action in shopping mode. Batched so the writes are atomic
 * even with a large cart.
 *
 * Returns the count cleared. Firestore caps a single batch at 500
 * writes; we chunk past that boundary so massive lists still work.
 */
export async function clearCheckedItems(
  householdId: string,
): Promise<number> {
  const q = query(itemsRef(householdId), where("checked", "==", true));
  const snap = await getDocs(q);
  if (snap.empty) return 0;
  const BATCH_CAP = 450; // headroom below Firestore's 500 limit
  for (let i = 0; i < snap.docs.length; i += BATCH_CAP) {
    const slice = snap.docs.slice(i, i + BATCH_CAP);
    const batch = writeBatch(db);
    slice.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  return snap.size;
}

/**
 * Toggle the checked state. Keeps `checkedBy` + `checkedAt` paired
 * so an audit trail is possible later. `checked: false` clears both.
 */
export async function toggleItemChecked(
  householdId: string,
  itemId: string,
  next: boolean,
  uid: string,
): Promise<void> {
  await updateDoc(itemRef(householdId, itemId), {
    checked: next,
    checkedBy: next ? uid : null,
    checkedAt: next ? serverTimestamp() : null,
  });
}

export type ItemWithId = Item & { id: string };

export type UseItemsResult = {
  items: ItemWithId[];
  loading: boolean;
  error: Error | null;
};

/**
 * Live subscription to the household's items. Ordered by addedAt
 * ascending — the within-section sort order. Section grouping is the
 * caller's job (use groupByAisle from @grocery/shared).
 */
export function useItems(householdId: string | null): UseItemsResult {
  const [items, setItems] = useState<ItemWithId[]>([]);
  const [loading, setLoading] = useState<boolean>(householdId != null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!householdId) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    const q = query(itemsRef(householdId), orderBy("addedAt", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const next: ItemWithId[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Item),
        }));
        setItems(next);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
    return unsub;
  }, [householdId]);

  return { items, loading, error };
}

// ---------- helpers ----------

function clampQuantity(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(999, Math.max(1, Math.round(n)));
}

function dedupeStores(stores: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of stores) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}
