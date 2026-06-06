// Catalog CRUD + live subscription. The catalog lives under
// households/{householdId}/catalog/{catalogId} where catalogId is a
// deterministic slug of the item text (so two writes for "Lemons" /
// "lemons" merge cleanly).
//
// Phase 5 wiring:
//   - After every successful item add (and after every item edit),
//     items.ts calls upsertCatalogEntry to record the latest
//     defaults + bump timesUsed.
//   - The plan-mode composer subscribes via useCatalog and shows
//     prefix suggestions ranked by usage.
//   - At add time, findExactCatalogMatch decides whether to inherit
//     remembered defaults onto a brand-new item.
//
// We keep the whole catalog in memory (a household's catalog is
// small — hundreds of entries at most) so autocomplete is snappy
// and works offline.

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  catalogIdForText,
  catalogSearchTokens,
  type CatalogEntry,
  type CatalogEntryWithId,
  type GroceryCategory,
} from "@grocery/shared";
import { db } from "./firebase";

function catalogCol(householdId: string) {
  return collection(db, "households", householdId, "catalog");
}
function catalogRef(householdId: string, id: string) {
  return doc(db, "households", householdId, "catalog", id);
}

export type CatalogUpsertInput = {
  text: string;
  category: GroceryCategory;
  stores: string[];
  quantity: number;
};

/**
 * Record (or refresh) a catalog entry for a household. Increments
 * `timesUsed` and stamps `lastUsedAt`. Skipped silently when the
 * text normalizes to an empty slug (e.g., pure punctuation).
 */
export async function upsertCatalogEntry(
  householdId: string,
  input: CatalogUpsertInput,
): Promise<void> {
  const id = catalogIdForText(input.text);
  if (!id) return;
  const ref = catalogRef(householdId, id);
  const snap = await getDoc(ref);
  const prior = snap.exists() ? (snap.data() as CatalogEntry) : null;

  const text = input.text.trim();
  const textLower = text.toLowerCase();
  const searchTokens = catalogSearchTokens(text);
  const timesUsed = (prior?.timesUsed ?? 0) + 1;

  await setDoc(ref, {
    text,
    textLower,
    searchTokens,
    defaultCategory: input.category,
    defaultStores: input.stores,
    defaultQuantity: input.quantity,
    timesUsed,
    lastUsedAt: serverTimestamp(),
  });
}

export type UseCatalogResult = {
  catalog: CatalogEntryWithId[];
  loading: boolean;
  error: Error | null;
};

/**
 * Subscribe to the household's catalog. Returns the full array —
 * suggestion ranking + prefix matching happens client-side in
 * @grocery/shared / catalogCore so the matching logic is easy to
 * test and stays consistent across surfaces (composer, import
 * preview, etc.).
 */
export function useCatalog(householdId: string | null): UseCatalogResult {
  const [catalog, setCatalog] = useState<CatalogEntryWithId[]>([]);
  const [loading, setLoading] = useState<boolean>(householdId != null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!householdId) {
      setCatalog([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(
      catalogCol(householdId),
      (snap) => {
        const next: CatalogEntryWithId[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as CatalogEntry),
        }));
        setCatalog(next);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
    return unsub;
  }, [householdId]);

  return { catalog, loading, error };
}
