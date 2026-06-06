// Sign-in surface. Stacked Brand + "Continue with Google" + the tagline
// from the design guide. Mirrors design-system/ui_kits/grocery_app/SignIn.jsx
// pixel-for-pixel.

import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Brand, Button } from "../components/ui";
import { useAuth } from "../lib/useAuth";

export function SignIn() {
  const { user, loading, configured, signInWithGoogle } = useAuth();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return <CenteredCard><Brand variant="mark" /></CenteredCard>;
  }

  if (user) {
    // Honor the location.state.from set by RequireAuth — e.g. when a
    // signed-out user clicked an invite link, send them back to it
    // after sign-in instead of dumping them on the household home.
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
    return <Navigate to={from && from !== "/signin" ? from : "/"} replace />;
  }

  async function handleSignIn() {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[signin] sign-in failed:", err);
      setError(
        err instanceof Error ? err.message : "Couldn't sign in. Please try again.",
      );
      setBusy(false);
    }
    // On success, onAuthStateChanged flips `user` and the Navigate
    // above takes over. `busy` stays true until the unmount.
  }

  return (
    <CenteredCard>
      <Brand variant="stacked" />

      <p
        style={{
          margin: 0,
          color: "var(--ink-500)",
          fontSize: 15,
          maxWidth: "26ch",
          lineHeight: 1.4,
        }}
      >
        One shared list for the whole household. Plan together, shop apart.
      </p>

      {configured ? (
        <>
          <Button
            size="lg"
            icon="mail"
            onClick={handleSignIn}
            disabled={busy}
            style={{ width: "100%" }}
          >
            {busy ? "Opening Google…" : "Continue with Google"}
          </Button>
          {error && (
            <span
              role="alert"
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--tomato-700)",
                marginTop: "var(--space-1)",
              }}
            >
              {error}
            </span>
          )}
        </>
      ) : (
        <UnconfiguredHint />
      )}

      <span
        style={{
          marginTop: 2,
          fontSize: "var(--text-xs)",
          color: "var(--ink-500)",
        }}
      >
        You'll join the <strong>Marks Family</strong> list.
      </span>
    </CenteredCard>
  );
}

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-6)",
        background:
          "radial-gradient(110% 60% at 50% 0%, var(--paper-200), transparent 70%), var(--bg-page)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "var(--bg-card)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-md)",
          padding: "36px 28px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "var(--space-4)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function UnconfiguredHint() {
  return (
    <div
      style={{
        background: "var(--paper-200)",
        border: "1px solid var(--border-faint)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-4)",
        fontSize: "var(--text-sm)",
        color: "var(--ink-700)",
        textAlign: "left",
        lineHeight: 1.5,
      }}
    >
      <strong style={{ display: "block", marginBottom: "var(--space-1)" }}>
        Firebase isn't wired up yet.
      </strong>
      Copy <code>web/.env.example</code> → <code>web/.env.local</code> and fill
      in your <code>VITE_FIREBASE_*</code> values, then restart the dev server.
      See the project README for the full setup checklist.
    </div>
  );
}
