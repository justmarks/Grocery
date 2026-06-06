// Household membership flows. All writes that span more than the
// caller's own doc go through here so we can run them atomically
// (transactions) and with the elevated admin-SDK trust the client
// can't have (e.g., admin SDK can write users/{otherUid} on
// remove-member, which the client-side rule would reject).
//
// The five callables:
//   inviteToHousehold({ householdId, email })  → { inviteId }
//   acceptInvite({ inviteId })                 → { householdId }
//   revokeInvite({ inviteId })                 → { ok: true }
//   leaveHousehold({})                          → { ok, deleted }
//   removeMember({ uid })                      → { ok: true }
//
// Confirm-and-move on acceptInvite: when the invitee already
// belongs to a different household, we leave the old one in the
// same transaction. If they were the only member, the old
// household doc is deleted and its items + catalog subcollections
// are swept after the txn commits (txns can't see subcollections).

import { onCall, HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2/options";
import { initializeApp } from "firebase-admin/app";
import {
  FieldValue,
  Timestamp,
  getFirestore,
} from "firebase-admin/firestore";

initializeApp();
setGlobalOptions({ region: "us-central1", maxInstances: 10 });

const db = getFirestore();

const INVITE_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const SUBCOLLECTION_BATCH = 450; // Firestore caps batches at 500.

function requireAuth(request: CallableRequest): {
  uid: string;
  email: string;
} {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }
  const rawEmail = request.auth.token.email;
  if (typeof rawEmail !== "string" || !rawEmail) {
    throw new HttpsError(
      "failed-precondition",
      "Your account is missing an email address.",
    );
  }
  return { uid: request.auth.uid, email: rawEmail };
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpsError("invalid-argument", `${field} is required.`);
  }
  return value.trim();
}

async function deleteSubcollections(householdId: string): Promise<void> {
  for (const sub of ["items", "catalog"] as const) {
    const col = db.collection("households").doc(householdId).collection(sub);
    while (true) {
      const snap = await col.limit(SUBCOLLECTION_BATCH).get();
      if (snap.empty) return;
      const batch = db.batch();
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      if (snap.size < SUBCOLLECTION_BATCH) return;
    }
  }
}

// ============================================================
// inviteToHousehold
// ============================================================

export const inviteToHousehold = onCall(async (request) => {
  const { uid } = requireAuth(request);
  const data = (request.data ?? {}) as Record<string, unknown>;
  const householdId = requireString(data.householdId, "householdId");
  const rawEmail = requireString(data.email, "email");
  if (!rawEmail.includes("@")) {
    throw new HttpsError("invalid-argument", "Enter a valid email.");
  }
  const invitedEmail = rawEmail.toLowerCase();

  const householdRef = db.collection("households").doc(householdId);
  const householdSnap = await householdRef.get();
  if (!householdSnap.exists) {
    throw new HttpsError("not-found", "Household not found.");
  }
  const household = householdSnap.data() as {
    name: string;
    memberIds: string[];
  };
  if (!Array.isArray(household.memberIds) || !household.memberIds.includes(uid)) {
    throw new HttpsError(
      "permission-denied",
      "Only household members can invite.",
    );
  }

  const inviterSnap = await db.collection("users").doc(uid).get();
  const inviter = inviterSnap.exists ? inviterSnap.data() : null;
  const inviterName =
    (inviter?.displayName as string | undefined) ?? "A household member";

  const now = Timestamp.now();
  const inviteRef = db.collection("invites").doc();
  await inviteRef.set({
    householdId,
    householdName: household.name,
    invitedEmail,
    invitedBy: uid,
    inviterName,
    status: "pending",
    createdAt: now,
    expiresAt: Timestamp.fromMillis(now.toMillis() + INVITE_TTL_MS),
  });

  return { inviteId: inviteRef.id };
});

// ============================================================
// acceptInvite
// ============================================================

export const acceptInvite = onCall(async (request) => {
  const { uid, email } = requireAuth(request);
  const data = (request.data ?? {}) as Record<string, unknown>;
  const inviteId = requireString(data.inviteId, "inviteId");

  const inviteRef = db.collection("invites").doc(inviteId);
  const userRef = db.collection("users").doc(uid);

  const result = await db.runTransaction(async (tx) => {
    const [inviteSnap, userSnap] = await Promise.all([
      tx.get(inviteRef),
      tx.get(userRef),
    ]);
    if (!inviteSnap.exists) {
      throw new HttpsError("not-found", "Invite not found.");
    }
    const invite = inviteSnap.data() as {
      householdId: string;
      invitedEmail: string;
      status: string;
      expiresAt: Timestamp;
    };
    if (invite.status !== "pending") {
      throw new HttpsError("failed-precondition", `Invite is ${invite.status}.`);
    }
    if (invite.invitedEmail.toLowerCase() !== email.toLowerCase()) {
      throw new HttpsError(
        "permission-denied",
        "This invite was sent to a different email.",
      );
    }
    if (invite.expiresAt.toMillis() < Date.now()) {
      throw new HttpsError("failed-precondition", "Invite has expired.");
    }

    const newHouseholdRef = db.collection("households").doc(invite.householdId);
    const newHouseholdSnap = await tx.get(newHouseholdRef);
    if (!newHouseholdSnap.exists) {
      throw new HttpsError(
        "not-found",
        "Household no longer exists.",
      );
    }
    const newHousehold = newHouseholdSnap.data() as {
      memberIds: string[];
      members: Record<string, unknown>;
    };

    if (newHousehold.memberIds.includes(uid)) {
      // Already a member — just mark the invite accepted.
      tx.update(inviteRef, { status: "accepted" });
      return {
        householdId: invite.householdId,
        soleMemberOfOld: false,
        oldHouseholdId: null as string | null,
      };
    }

    const userDoc = userSnap.exists ? (userSnap.data() as Record<string, unknown>) : null;
    const currentHouseholdId =
      (userDoc?.householdId as string | null | undefined) ?? null;
    let soleMemberOfOld = false;
    let oldHouseholdId: string | null = null;

    if (currentHouseholdId && currentHouseholdId !== invite.householdId) {
      const oldRef = db.collection("households").doc(currentHouseholdId);
      const oldSnap = await tx.get(oldRef);
      if (oldSnap.exists) {
        const old = oldSnap.data() as {
          memberIds: string[];
          members: Record<string, unknown>;
          ownerId: string;
        };
        if (old.memberIds.length <= 1) {
          soleMemberOfOld = true;
          oldHouseholdId = currentHouseholdId;
          tx.delete(oldRef);
        } else {
          const remaining = { ...(old.members ?? {}) };
          delete remaining[uid];
          let nextOwnerId = old.ownerId;
          if (old.ownerId === uid) {
            const remainingIds = old.memberIds
              .filter((m) => m !== uid)
              .sort();
            nextOwnerId = remainingIds[0];
          }
          tx.update(oldRef, {
            memberIds: FieldValue.arrayRemove(uid),
            members: remaining,
            ownerId: nextOwnerId,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }
    }

    const joinerName =
      (userDoc?.displayName as string | undefined) ?? email;

    const updatedMembers = {
      ...(newHousehold.members ?? {}),
      [uid]: {
        role: "editor",
        joinedAt: FieldValue.serverTimestamp(),
        displayName: joinerName,
      },
    };
    tx.update(newHouseholdRef, {
      memberIds: FieldValue.arrayUnion(uid),
      members: updatedMembers,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // The admin SDK bypasses rules — this rewrites householdId
    // even when the prior value was a different string (the
    // client-side rule blocks that transition; only this server
    // path is allowed to switch households).
    tx.set(
      userRef,
      {
        householdId: invite.householdId,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    tx.update(inviteRef, { status: "accepted" });

    return {
      householdId: invite.householdId,
      soleMemberOfOld,
      oldHouseholdId,
    };
  });

  if (result.soleMemberOfOld && result.oldHouseholdId) {
    await deleteSubcollections(result.oldHouseholdId);
  }
  return { householdId: result.householdId };
});

// ============================================================
// revokeInvite
// ============================================================

export const revokeInvite = onCall(async (request) => {
  const { uid } = requireAuth(request);
  const data = (request.data ?? {}) as Record<string, unknown>;
  const inviteId = requireString(data.inviteId, "inviteId");

  const inviteRef = db.collection("invites").doc(inviteId);
  const snap = await inviteRef.get();
  if (!snap.exists) {
    throw new HttpsError("not-found", "Invite not found.");
  }
  const invite = snap.data() as { invitedBy: string; status: string };
  if (invite.invitedBy !== uid) {
    throw new HttpsError(
      "permission-denied",
      "Only the inviter can revoke.",
    );
  }
  if (invite.status !== "pending") {
    throw new HttpsError("failed-precondition", `Invite is ${invite.status}.`);
  }
  await inviteRef.update({ status: "revoked" });
  return { ok: true };
});

// ============================================================
// leaveHousehold
// ============================================================

export const leaveHousehold = onCall(async (request) => {
  const { uid } = requireAuth(request);
  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();
  const user = userSnap.exists ? (userSnap.data() as Record<string, unknown>) : null;
  const householdId = (user?.householdId as string | null | undefined) ?? null;
  if (!householdId) {
    throw new HttpsError("failed-precondition", "You're not in a household.");
  }
  const householdRef = db.collection("households").doc(householdId);

  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(householdRef);
    if (!snap.exists) {
      tx.set(
        userRef,
        { householdId: null, updatedAt: FieldValue.serverTimestamp() },
        { merge: true },
      );
      return { deleted: false };
    }
    const household = snap.data() as {
      memberIds: string[];
      members: Record<string, unknown>;
      ownerId: string;
    };
    if (!household.memberIds.includes(uid)) {
      tx.set(
        userRef,
        { householdId: null, updatedAt: FieldValue.serverTimestamp() },
        { merge: true },
      );
      return { deleted: false };
    }
    if (household.memberIds.length <= 1) {
      tx.delete(householdRef);
      tx.set(
        userRef,
        { householdId: null, updatedAt: FieldValue.serverTimestamp() },
        { merge: true },
      );
      return { deleted: true };
    }
    const remaining = { ...(household.members ?? {}) };
    delete remaining[uid];
    let nextOwnerId = household.ownerId;
    if (household.ownerId === uid) {
      const remainingIds = household.memberIds
        .filter((m) => m !== uid)
        .sort();
      nextOwnerId = remainingIds[0];
    }
    tx.update(householdRef, {
      memberIds: FieldValue.arrayRemove(uid),
      members: remaining,
      ownerId: nextOwnerId,
      updatedAt: FieldValue.serverTimestamp(),
    });
    tx.set(
      userRef,
      { householdId: null, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
    return { deleted: false };
  });

  if (result.deleted) {
    await deleteSubcollections(householdId);
  }
  return { ok: true, deleted: result.deleted };
});

// ============================================================
// removeMember
// ============================================================

export const removeMember = onCall(async (request) => {
  const { uid: callerUid } = requireAuth(request);
  const data = (request.data ?? {}) as Record<string, unknown>;
  const targetUid = requireString(data.uid, "uid");
  if (targetUid === callerUid) {
    throw new HttpsError(
      "invalid-argument",
      "Use leaveHousehold to remove yourself.",
    );
  }

  const callerUser = await db.collection("users").doc(callerUid).get();
  const householdId = callerUser.data()?.householdId as string | undefined;
  if (!householdId) {
    throw new HttpsError("failed-precondition", "You're not in a household.");
  }
  const householdRef = db.collection("households").doc(householdId);
  const targetUserRef = db.collection("users").doc(targetUid);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(householdRef);
    if (!snap.exists) {
      throw new HttpsError("not-found", "Household not found.");
    }
    const household = snap.data() as {
      memberIds: string[];
      members: Record<string, unknown>;
      ownerId: string;
    };
    if (household.ownerId !== callerUid) {
      throw new HttpsError(
        "permission-denied",
        "Only the owner can remove members.",
      );
    }
    if (!household.memberIds.includes(targetUid)) {
      throw new HttpsError("not-found", "User is not a member.");
    }
    const remaining = { ...(household.members ?? {}) };
    delete remaining[targetUid];
    tx.update(householdRef, {
      memberIds: FieldValue.arrayRemove(targetUid),
      members: remaining,
      updatedAt: FieldValue.serverTimestamp(),
    });
    tx.set(
      targetUserRef,
      { householdId: null, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
  });

  return { ok: true };
});
