// Thin callable + subscription wrappers around the Phase 7 Cloud
// Functions. The five backend entry points are:
//
//   inviteToHousehold({ householdId, email }) → { inviteId }
//   acceptInvite({ inviteId })                 → { householdId }
//   revokeInvite({ inviteId })                 → { ok: true }
//   leaveHousehold({})                          → { ok, deleted }
//   removeMember({ uid })                      → { ok: true }
//
// Confirm-and-move at accept-time is enforced server-side (the
// transaction sees both households); the client only owns the
// "show the warning before they tap Accept" presentation.

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import type { Invite } from "@grocery/shared";
import { db, firebaseApp } from "./firebase";

const functions = getFunctions(firebaseApp);

export type InviteWithId = Invite & { id: string };

export async function inviteToHouseholdCall(
  householdId: string,
  email: string,
): Promise<{ inviteId: string; link: string }> {
  const call = httpsCallable<
    { householdId: string; email: string },
    { inviteId: string }
  >(functions, "inviteToHousehold");
  const res = await call({ householdId, email });
  const inviteId = res.data.inviteId;
  const link = `${window.location.origin}/invite/${inviteId}`;
  return { inviteId, link };
}

export async function acceptInviteCall(
  inviteId: string,
): Promise<{ householdId: string }> {
  const call = httpsCallable<{ inviteId: string }, { householdId: string }>(
    functions,
    "acceptInvite",
  );
  const res = await call({ inviteId });
  return res.data;
}

export async function revokeInviteCall(inviteId: string): Promise<void> {
  const call = httpsCallable<{ inviteId: string }, { ok: boolean }>(
    functions,
    "revokeInvite",
  );
  await call({ inviteId });
}

export async function leaveHouseholdCall(): Promise<{ deleted: boolean }> {
  const call = httpsCallable<Record<string, never>, { ok: boolean; deleted: boolean }>(
    functions,
    "leaveHousehold",
  );
  const res = await call({});
  return { deleted: res.data.deleted };
}

export async function removeMemberCall(uid: string): Promise<void> {
  const call = httpsCallable<{ uid: string }, { ok: boolean }>(
    functions,
    "removeMember",
  );
  await call({ uid });
}

// ---------- live subscriptions ----------

export type UseInviteResult = {
  invite: InviteWithId | null;
  loading: boolean;
  error: Error | null;
};

/**
 * Subscribe to a single invite doc by id. Drives the accept page.
 * Returns null while loading, on not-found, or when the user can't
 * read it (wrong email / not a member of the target household).
 */
export function useInvite(inviteId: string | null): UseInviteResult {
  const [invite, setInvite] = useState<InviteWithId | null>(null);
  const [loading, setLoading] = useState<boolean>(inviteId != null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!inviteId) {
      setInvite(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(
      doc(db, "invites", inviteId),
      (snap) => {
        setInvite(
          snap.exists() ? { id: snap.id, ...(snap.data() as Invite) } : null,
        );
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
    return unsub;
  }, [inviteId]);

  return { invite, loading, error };
}

/**
 * Pending invites for a household. Subscribed via a `householdId ==`
 * + `status == pending` query so it stays current as invites are
 * created/accepted/revoked.
 */
export type UsePendingInvitesResult = {
  invites: InviteWithId[];
  loading: boolean;
  error: Error | null;
};

export function usePendingInvites(
  householdId: string | null,
): UsePendingInvitesResult {
  const [invites, setInvites] = useState<InviteWithId[]>([]);
  const [loading, setLoading] = useState<boolean>(householdId != null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!householdId) {
      setInvites([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    const q = query(
      collection(db, "invites"),
      where("householdId", "==", householdId),
      where("status", "==", "pending"),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setInvites(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Invite) })),
        );
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
    return unsub;
  }, [householdId]);

  return { invites, loading, error };
}
