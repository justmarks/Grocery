// Household creation + live subscription. The household doc is the
// single source of truth for the list — name, stores, category order,
// member list. Items + catalog live as subcollections (wired in
// Phases 3 + 5).
//
// Create flow is a single batch: write households/{newId} + bump
// users/{uid}.householdId. firestore.rules allows the user-doc
// rewrite only when the prior value was null (first join). Switching
// households is a Phase 7 server-side flow.

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import {
  DEFAULT_CATEGORY_ORDER,
  DEFAULT_STORES,
  type Household,
} from "@grocery/shared";
import { db } from "./firebase";

function householdRef(id: string) {
  return doc(db, "households", id);
}

export type CreateHouseholdOptions = {
  uid: string;
  displayName: string;
  /** Defaults to "<FirstName>'s Household". */
  name?: string;
};

/**
 * Create a brand-new household with the calling user as owner +
 * sole member. Atomically bumps users/{uid}.householdId in the
 * same batch. Returns the new household id.
 *
 * Safe to call only when the caller's current householdId is null
 * — firestore.rules will reject the user-doc rewrite otherwise.
 */
export async function createHousehold(
  opts: CreateHouseholdOptions,
): Promise<string> {
  const newRef = doc(collection(db, "households"));
  const userRef = doc(db, "users", opts.uid);
  const firstName = opts.displayName.trim().split(/\s+/)[0] || opts.displayName;
  const name = opts.name?.trim() || `${firstName}'s Household`;

  const batch = writeBatch(db);
  batch.set(newRef, {
    name,
    ownerId: opts.uid,
    memberIds: [opts.uid],
    members: {
      [opts.uid]: {
        role: "owner",
        joinedAt: serverTimestamp(),
        displayName: opts.displayName,
      },
    },
    stores: [...DEFAULT_STORES],
    categoryOrder: [...DEFAULT_CATEGORY_ORDER],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.update(userRef, {
    householdId: newRef.id,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
  return newRef.id;
}

/**
 * Update mutable household metadata — name, stores, categoryOrder,
 * storeLogos. Any member may call (owner-only invariants are enforced
 * by rules). Passing `storeLogos` replaces the whole map, so callers
 * send the complete map each save (dropping a store also drops its
 * logo entry).
 */
export type HouseholdMutation = Partial<
  Pick<Household, "name" | "stores" | "categoryOrder" | "storeLogos">
>;

export async function updateHouseholdMetadata(
  householdId: string,
  changes: HouseholdMutation,
): Promise<void> {
  const ref = householdRef(householdId);
  const batch = writeBatch(db);
  batch.update(ref, { ...changes, updatedAt: serverTimestamp() });
  await batch.commit();
}

/**
 * Subscribe to a household doc. Returns null while loading or when
 * the household has been deleted out from under the caller.
 */
export type UseHouseholdResult = {
  household: (Household & { id: string }) | null;
  loading: boolean;
  error: Error | null;
};

export function useHousehold(householdId: string | null): UseHouseholdResult {
  const [household, setHousehold] = useState<
    (Household & { id: string }) | null
  >(null);
  const [loading, setLoading] = useState<boolean>(householdId != null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!householdId) {
      setHousehold(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(
      householdRef(householdId),
      (snap) => {
        if (!snap.exists()) {
          setHousehold(null);
        } else {
          setHousehold({ id: snap.id, ...(snap.data() as Household) });
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
    return unsub;
  }, [householdId]);

  return { household, loading, error };
}
