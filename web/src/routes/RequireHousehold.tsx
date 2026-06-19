// RequireHousehold — second gate (after RequireAuth). Sends users
// with no household to /setup. Renders a quiet brand placeholder
// while anything is still resolving.
//
// CRITICAL: only redirect to /setup when we are CERTAIN the user has
// no household — i.e. auth resolved, the user doc finished loading,
// there was no read error, and householdId is genuinely empty. A
// transient Firestore read error (or a slow cold-load read) must NOT
// be mistaken for "no household": doing so bounced direct loads of
// /settings to /setup, which then bounced to / because the user
// actually DOES have a household. The result looked like
// "/settings redirects to the homepage."

import { Navigate, Outlet } from "react-router-dom";
import { Brand, Button } from "../components/ui";
import { useAuth } from "../lib/useAuth";
import { useUserDoc } from "../lib/userDoc";

function CenteredBrand() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--paper-100)",
      }}
    >
      <Brand variant="stacked" />
    </div>
  );
}

export function RequireHousehold() {
  const { user, loading: authLoading } = useAuth();
  const { userDoc, loading: docLoading, error } = useUserDoc(
    user?.uid ?? null,
  );

  // Still resolving auth or the user doc — hold, don't decide.
  if (authLoading || docLoading) {
    return <CenteredBrand />;
  }

  // The user-doc read failed. Don't misread a transient error as
  // "no household" and bounce — show a lightweight retry instead.
  if (error) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-4)",
          padding: "var(--space-6)",
          textAlign: "center",
          background: "var(--paper-100)",
          color: "var(--ink-900)",
          fontFamily: "var(--font-sans)",
        }}
      >
        <Brand variant="stacked" />
        <p style={{ color: "var(--ink-500)", maxWidth: "32ch", margin: 0 }}>
          Couldn't reach your list just now. Check your connection and try
          again.
        </p>
        <Button icon="arrow-left" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  // Resolved with no error: if there's genuinely no household, set up.
  // `userDoc === null` here means the doc finished loading and truly
  // doesn't exist (a brand-new account mid-onboarding) — that's a
  // legitimate /setup case, distinct from the error path above.
  if (!userDoc?.householdId) {
    return <Navigate to="/setup" replace />;
  }

  return <Outlet />;
}
