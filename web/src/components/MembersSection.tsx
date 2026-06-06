// Settings → Members + invite form + pending invites + leave/remove.
// All actions go through Cloud Functions (admin SDK enforces the
// ownership / membership invariants). The component owns its own
// busy / error / toast state for each row.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Household, Invite } from "@grocery/shared";
import {
  Avatar,
  Button,
  Field,
  IconButton,
  Input,
  Toast,
} from "./ui";
import {
  inviteToHouseholdCall,
  leaveHouseholdCall,
  removeMemberCall,
  revokeInviteCall,
  usePendingInvites,
} from "../lib/invites";

type MembersSectionProps = {
  household: Household & { id: string };
  /** The signed-in user's uid; used to hide self-actions. */
  currentUid: string;
  /** Display name fallback for the invite-sender label. */
  currentDisplayName: string;
};

type InviteResult = { email: string; link: string };

export function MembersSection({
  household,
  currentUid,
}: MembersSectionProps) {
  const navigate = useNavigate();
  const { invites } = usePendingInvites(household.id);
  const isOwner = household.ownerId === currentUid;
  const isSoleMember = household.memberIds.length === 1;

  const [email, setEmail] = useState("");
  const [busyInvite, setBusyInvite] = useState(false);
  const [busyRemoval, setBusyRemoval] = useState<string | null>(null);
  const [busyLeave, setBusyLeave] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [lastInvite, setLastInvite] = useState<InviteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function flashToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  }

  async function handleSendInvite() {
    const candidate = email.trim();
    if (!candidate.includes("@")) {
      setError("Enter a valid email.");
      return;
    }
    setBusyInvite(true);
    setError(null);
    try {
      const result = await inviteToHouseholdCall(household.id, candidate);
      setLastInvite({ email: candidate, link: result.link });
      setEmail("");
      flashToast(`Invite ready for ${candidate}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't create invite. Please try again.",
      );
    } finally {
      setBusyInvite(false);
    }
  }

  async function copyLink(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      flashToast("Link copied");
    } catch {
      flashToast("Couldn't copy — long-press the link to copy.");
    }
  }

  async function handleRevoke(invite: Invite & { id: string }) {
    setBusyRemoval(invite.id);
    setError(null);
    try {
      await revokeInviteCall(invite.id);
      flashToast(`Invite revoked`);
      if (lastInvite?.email === invite.invitedEmail) setLastInvite(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't revoke invite.");
    } finally {
      setBusyRemoval(null);
    }
  }

  async function handleRemove(uid: string, displayName: string) {
    setBusyRemoval(uid);
    setError(null);
    try {
      await removeMemberCall(uid);
      flashToast(`Removed ${displayName}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't remove member.");
    } finally {
      setBusyRemoval(null);
    }
  }

  async function handleLeave() {
    setBusyLeave(true);
    setError(null);
    try {
      const { deleted } = await leaveHouseholdCall();
      flashToast(deleted ? "Household deleted." : "You left the household.");
      // useUserDoc snapshot flips householdId → null; RequireHousehold
      // will bounce to /setup on the next render. Navigate explicitly
      // so we don't sit on Settings while that propagates.
      window.setTimeout(() => navigate("/setup", { replace: true }), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't leave household.");
      setBusyLeave(false);
      setConfirmLeave(false);
    }
  }

  // members object keys aren't guaranteed in any order — sort owners
  // first, then everyone else by displayName.
  const memberRows = Object.entries(household.members ?? {})
    .map(([uid, m]) => ({
      uid,
      displayName: m.displayName,
      role: m.role,
    }))
    .sort((a, b) => {
      if (a.role === "owner" && b.role !== "owner") return -1;
      if (a.role !== "owner" && b.role === "owner") return 1;
      return a.displayName.localeCompare(b.displayName);
    });

  return (
    <section>
      <SectionHeader>Members</SectionHeader>

      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
        }}
      >
        {memberRows.map((m) => (
          <li
            key={m.uid}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              background: "var(--bg-card)",
              border: "1px solid var(--border-faint)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-2) var(--space-3)",
            }}
          >
            <Avatar name={m.displayName} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  color: "var(--ink-900)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {m.displayName}
                {m.uid === currentUid && (
                  <span
                    style={{
                      marginLeft: "var(--space-2)",
                      fontSize: "var(--text-xs)",
                      color: "var(--ink-500)",
                      fontWeight: 400,
                    }}
                  >
                    (you)
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--ink-500)",
                  textTransform: "uppercase",
                  letterSpacing: "var(--tracking-caps)",
                }}
              >
                {m.role === "owner" ? "Owner" : "Member"}
              </div>
            </div>
            {isOwner && m.uid !== currentUid && (
              <IconButton
                icon="trash"
                variant="danger"
                aria-label={`Remove ${m.displayName}`}
                disabled={busyRemoval === m.uid}
                onClick={() => handleRemove(m.uid, m.displayName)}
              />
            )}
          </li>
        ))}
      </ul>

      {/* ---------- Invite form ---------- */}
      <div
        style={{
          marginTop: "var(--space-5)",
          background: "var(--bg-card)",
          border: "1px solid var(--border-faint)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-4)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        <Field
          label="Invite by email"
          hint="They'll get a link to join the household. The link is valid for 14 days."
        >
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            type="email"
            disabled={busyInvite}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSendInvite();
              }
            }}
          />
        </Field>
        <div>
          <Button
            icon="mail"
            onClick={handleSendInvite}
            disabled={busyInvite || !email.trim()}
          >
            {busyInvite ? "Creating…" : "Create invite"}
          </Button>
        </div>

        {lastInvite && (
          <div
            style={{
              background: "var(--olive-50)",
              border: "1px solid var(--olive-100)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-3)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
            }}
          >
            <div
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--olive-700)",
              }}
            >
              Share this link with <strong>{lastInvite.email}</strong>:
            </div>
            <div
              style={{
                display: "flex",
                gap: "var(--space-2)",
                alignItems: "center",
              }}
            >
              <Input
                value={lastInvite.link}
                readOnly
                onFocus={(e) => e.currentTarget.select()}
                style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" }}
              />
              <Button
                variant="secondary"
                onClick={() => copyLink(lastInvite.link)}
              >
                Copy
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ---------- Pending invites ---------- */}
      {invites.length > 0 && (
        <div style={{ marginTop: "var(--space-5)" }}>
          <p
            style={{
              color: "var(--ink-500)",
              fontSize: "var(--text-xs)",
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-caps)",
              margin: "0 0 var(--space-2)",
              fontWeight: 600,
            }}
          >
            Pending invites
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
            }}
          >
            {invites.map((inv) => (
              <li
                key={inv.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-faint)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-2) var(--space-3)",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--text-sm)",
                      color: "var(--ink-900)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {inv.invitedEmail}
                  </div>
                  <div
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--ink-500)",
                    }}
                  >
                    Invited by {inv.inviterName}
                  </div>
                </div>
                {inv.invitedBy === currentUid && (
                  <IconButton
                    icon="trash"
                    variant="danger"
                    aria-label={`Revoke invite for ${inv.invitedEmail}`}
                    disabled={busyRemoval === inv.id}
                    onClick={() => handleRevoke(inv)}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <p
          role="alert"
          style={{
            marginTop: "var(--space-3)",
            color: "var(--tomato-700)",
            fontSize: "var(--text-sm)",
          }}
        >
          {error}
        </p>
      )}

      {/* ---------- Leave household ---------- */}
      <div
        style={{
          marginTop: "var(--space-8)",
          paddingTop: "var(--space-5)",
          borderTop: "1px solid var(--border-faint)",
        }}
      >
        <p
          style={{
            color: "var(--ink-500)",
            fontSize: "var(--text-xs)",
            textTransform: "uppercase",
            letterSpacing: "var(--tracking-caps)",
            margin: "0 0 var(--space-2)",
            fontWeight: 600,
          }}
        >
          Danger zone
        </p>
        {!confirmLeave ? (
          <Button
            variant="danger"
            icon="log-out"
            onClick={() => setConfirmLeave(true)}
          >
            Leave household
          </Button>
        ) : (
          <div
            style={{
              background: "var(--tomato-50)",
              border: "1px solid var(--tomato-100)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-4)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "var(--text-sm)",
                color: "var(--ink-900)",
                lineHeight: 1.4,
              }}
            >
              {isSoleMember ? (
                <>
                  You're the only member. Leaving will{" "}
                  <strong>permanently delete the household</strong>, including
                  all items and pantry memory.
                </>
              ) : isOwner ? (
                <>
                  You're the owner. Leaving will pass ownership to another
                  member. Your items stay with the household.
                </>
              ) : (
                <>
                  You'll be removed from the household. Items stay with the
                  household.
                </>
              )}
            </p>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <Button
                variant="danger"
                icon="log-out"
                onClick={handleLeave}
                disabled={busyLeave}
              >
                {busyLeave
                  ? "Leaving…"
                  : isSoleMember
                    ? "Leave & delete"
                    : "Leave household"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setConfirmLeave(false)}
                disabled={busyLeave}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <Toast visible={toast != null}>{toast ?? ""}</Toast>
    </section>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        fontSize: "var(--text-xs)",
        textTransform: "uppercase",
        letterSpacing: "var(--tracking-caps)",
        color: "var(--ink-500)",
        margin: "0 0 var(--space-3)",
      }}
    >
      {children}
    </h2>
  );
}
