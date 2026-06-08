// HouseholdSetup — the landing surface for a signed-in user with no
// household. Phase 2 ships create-only ("Create household" Button +
// rename Input); Phase 7 adds the wait-for-invite path with a
// "Send a meal plan from RecipeTracker" help row in Settings.
//
// Already-in-a-household users redirect to Home. The HouseholdSetup
// → Home transition fires naturally when users/{uid}.householdId
// flips post-write — useUserDoc's snapshot listener drives it.

import { useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Brand,
  Button,
  EmptyState,
  Field,
  Input,
  Toast,
} from "../components/ui";
import { useAuth } from "../lib/useAuth";
import { useUserDoc } from "../lib/userDoc";
import { createHousehold } from "../lib/household";
import { PENDING_IMPORT_KEY } from "./Import";

export function HouseholdSetup() {
  const { user, signOut } = useAuth();
  const { userDoc, loading: userDocLoading } = useUserDoc(user?.uid ?? null);

  const displayName = userDoc?.displayName ?? user?.displayName ?? user?.email ?? "";
  const firstName = displayName.trim().split(/\s+/)[0] || displayName;

  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  // If the user already has a household, bounce home — unless they
  // were trampolined here mid-import, in which case resume the
  // import flow.
  if (!userDocLoading && userDoc?.householdId) {
    const pending = window.sessionStorage.getItem(PENDING_IMPORT_KEY);
    if (pending) {
      window.sessionStorage.removeItem(PENDING_IMPORT_KEY);
      return <Navigate to={pending} replace />;
    }
    return <Navigate to="/" replace />;
  }

  const placeholder = firstName ? `${firstName}'s Household` : "Marks Family";

  async function handleCreate() {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await createHousehold({
        uid: user.uid,
        displayName,
        name: name.trim() || undefined,
      });
      setToast(true);
      // No explicit navigation — useUserDoc's snapshot fires the
      // householdId update, the Navigate guard above runs on the
      // next render, and we land on Home.
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[setup] createHousehold:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't create the household. Please try again.",
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
        <Button variant="ghost" size="sm" icon="log-out" onClick={() => signOut()}>
          Sign out
        </Button>
      </header>

      <main
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "var(--space-8) var(--space-5) var(--space-12)",
        }}
      >
        <EmptyState
          icon="users"
          title="Let's set up your household."
        >
          A household is the shared list everyone in your family sees and
          edits. You'll be the owner — invite the rest of your household
          once it's set up.
        </EmptyState>

        <section
          style={{
            marginTop: "var(--space-6)",
            background: "var(--bg-card)",
            border: "1px solid var(--border-faint)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-sm)",
            padding: "var(--space-6)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          <Field
            label="Household name"
            hint="You can rename this any time in Settings."
          >
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={placeholder}
              maxLength={120}
              disabled={busy}
            />
          </Field>

          <Button
            size="lg"
            icon="plus"
            onClick={handleCreate}
            disabled={busy || !user}
          >
            {busy ? "Creating…" : "Create household"}
          </Button>

          {error && (
            <span
              role="alert"
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--tomato-700)",
              }}
            >
              {error}
            </span>
          )}
        </section>

        <p
          style={{
            marginTop: "var(--space-6)",
            color: "var(--ink-500)",
            fontSize: "var(--text-sm)",
            textAlign: "center",
          }}
        >
          Already invited to a household? Open the invite link from your email
        </p>
      </main>

      <Toast visible={toast}>Household created.</Toast>
    </div>
  );
}
