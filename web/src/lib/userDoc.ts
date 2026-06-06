// User-doc CRUD + subscription. The doc lives at users/{uid} and is
// written on every sign-in (create-on-first / refresh-on-subsequent)
// so display info stays in sync with the Google account.
//
// Shape lives in @grocery/shared.ts → UserDocSchema; firestore.rules
// enforces it via isValidUserDoc.
//
// Phase 1 only writes display info. Phase 7's acceptInvite callable
// is the only writer of householdId — the client-side `update` rule
// requires householdId to match the existing value, so a stray
// client write can't move someone between households.

import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import type { UserDoc } from "@grocery/shared";
import { db } from "./firebase";

function userRef(uid: string) {
  return doc(db, "users", uid);
}

/**
 * Create the user doc on first sign-in, refresh display fields on
 * subsequent sign-ins. Never touches householdId — that field is
 * owned by the server-side join flow.
 *
 * Idempotent: safe to call on every auth state change.
 */
export async function upsertUserDoc(user: User): Promise<void> {
  const ref = userRef(user.uid);
  const snap = await getDoc(ref);

  const displayName = user.displayName ?? user.email ?? user.uid;
  const email = user.email ?? "";
  const photoURL = user.photoURL ?? null;

  if (!snap.exists()) {
    await setDoc(ref, {
      displayName,
      email,
      photoURL,
      householdId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return;
  }

  // Refresh display fields without touching householdId or createdAt.
  await setDoc(
    ref,
    {
      displayName,
      photoURL,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/**
 * Subscribe to the user doc. Returns the current value and a loading
 * flag. Returns `userDoc: null, loading: false` when `uid` is null.
 */
export type UseUserDocResult = {
  userDoc: UserDoc | null;
  loading: boolean;
  error: Error | null;
};

import { useEffect, useState } from "react";

export function useUserDoc(uid: string | null): UseUserDocResult {
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState<boolean>(uid != null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!uid) {
      setUserDoc(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(
      userRef(uid),
      (snap) => {
        setUserDoc(snap.exists() ? (snap.data() as UserDoc) : null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
    return unsub;
  }, [uid]);

  return { userDoc, loading, error };
}
