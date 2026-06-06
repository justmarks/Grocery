// /invite/:inviteId — the page the invitee lands on after clicking
// a share link. Reads the invite doc directly (allowed by rules
// when the invitee's email matches), shows who invited them and
// to which household, and surfaces the confirm-and-move warning
// when the invitee already belongs to a different household.

import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  Brand,
  Button,
  EmptyState,
  IconButton,
  Toast,
} from "../components/ui";
import { useAuth } from "../lib/useAuth";
import { useUserDoc } from "../lib/userDoc";
import { useHousehold } from "../lib/household";
import { useItems } from "../lib/items";
import { acceptInviteCall, useInvite } from "../lib/invites";

export function Invite() {
  const { inviteId } = useParams<{ inviteId: string }>();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { invite, loading: inviteLoading } = useInvite(inviteId ?? null);
  const { userDoc } = useUserDoc(user?.uid ?? null);
  const { household: currentHousehold } = useHousehold(
    userDoc?.householdId ?? null,
  );
  const { items: currentItems } = useItems(userDoc?.householdId ?? null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  // After accept, the upsert flips userDoc.householdId → bounce home.
  useEffect(() => {
    if (accepted && userDoc?.householdId === invite?.householdId) {
      const t = window.setTimeout(() => navigate("/", { replace: true }), 1200);
      return () => window.clearTimeout(t);
    }
  }, [accepted, userDoc?.householdId, invite?.householdId, navigate]);

  if (!inviteId) return <Navigate to="/" replace />;

  const isAlreadyMember =
    invite && userDoc?.householdId === invite.householdId;

  const willSwitchFromExisting =
    invite
    && userDoc?.householdId
    && userDoc.householdId !== invite.householdId;

  const wrongEmail =
    invite
    && user?.email
    && invite.invitedEmail.toLowerCase() !== user.email.toLowerCase();

  const isSoleMemberOfCurrent =
    !!currentHousehold && currentHousehold.memberIds.length === 1;

  async function handleAccept() {
    if (!inviteId) return;
    setBusy(true);
    setError(null);
    try {
      await acceptInviteCall(inviteId);
      setAccepted(true);
      // Toast surfaces immediately; navigate happens once useUserDoc
      // picks up the new householdId (via the useEffect above).
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[invite] acceptInvite:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't accept the invite. Please try again.",
      );
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--paper-100)",
        color: "var(--ink-900)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--space-4) var(--space-5)",
          borderBottom: "1px solid var(--border-faint)",
        }}
      >
        <Brand variant="lockup" />
        <IconButton
          icon="log-out"
          aria-label="Sign out"
          onClick={() => signOut()}
        />
      </header>

      <main
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "var(--space-8) var(--space-5) var(--space-12)",
        }}
      >
        {inviteLoading ? (
          <EmptyState icon="mail" title="Loading invite…">
            Just a sec.
          </EmptyState>
        ) : !invite ? (
          <EmptyState icon="x" title="Invite not found.">
            This link may have been revoked, accepted, or sent to a different
            account. Ask the sender for a fresh invite.
          </EmptyState>
        ) : invite.status === "revoked" ? (
          <EmptyState icon="x" title="This invite was revoked.">
            Ask <strong>{invite.inviterName}</strong> for a fresh link.
          </EmptyState>
        ) : invite.status === "accepted" || isAlreadyMember ? (
          <EmptyState icon="check" title="You're already in this household.">
            <Button
              variant="ghost"
              icon="arrow-left"
              onClick={() => navigate("/", { replace: true })}
            >
              Go to your list
            </Button>
          </EmptyState>
        ) : wrongEmail ? (
          <EmptyState icon="mail" title="Different email.">
            This invite was sent to <strong>{invite.invitedEmail}</strong>, but
            you're signed in as <strong>{user?.email}</strong>. Sign out and
            sign back in with the right account.
          </EmptyState>
        ) : (
          <>
            <p
              style={{
                color: "var(--ink-500)",
                fontSize: "var(--text-sm)",
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "var(--tracking-caps)",
                fontWeight: 600,
              }}
            >
              You've been invited
            </p>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: "var(--text-3xl)",
                letterSpacing: "var(--tracking-tight)",
                margin: "var(--space-2) 0 var(--space-2)",
              }}
            >
              {invite.householdName}
            </h1>
            <p
              style={{
                color: "var(--ink-700)",
                margin: "0 0 var(--space-6)",
              }}
            >
              <strong>{invite.inviterName}</strong> wants you on the household
              list.
            </p>

            {willSwitchFromExisting && currentHousehold && (
              <div
                style={{
                  background: "var(--saffron-100)",
                  color: "var(--saffron-700)",
                  border: "1px solid var(--saffron-300)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-4)",
                  marginBottom: "var(--space-6)",
                  fontSize: "var(--text-sm)",
                  lineHeight: 1.5,
                }}
              >
                Accepting will move you from{" "}
                <strong>{currentHousehold.name}</strong>{" "}
                {isSoleMemberOfCurrent ? (
                  <>
                    — that household's <strong>{currentItems.length}</strong>{" "}
                    item{currentItems.length === 1 ? "" : "s"} will be deleted
                    because you're the only member.
                  </>
                ) : (
                  <>
                    — you'll leave the other{" "}
                    {(currentHousehold.memberIds.length - 1).toString()} member
                    {currentHousehold.memberIds.length - 1 === 1 ? "" : "s"}{" "}
                    behind. Your items stay with the household.
                  </>
                )}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "var(--space-2)",
                alignItems: "center",
              }}
            >
              <Button
                size="lg"
                icon="check"
                onClick={handleAccept}
                disabled={busy || accepted}
              >
                {busy ? "Accepting…" : accepted ? "Joining…" : "Accept invite"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/", { replace: true })}
                disabled={busy}
              >
                Not now
              </Button>
            </div>

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
          </>
        )}
      </main>

      <Toast visible={accepted}>Joined {invite?.householdName ?? ""}.</Toast>
    </div>
  );
}
