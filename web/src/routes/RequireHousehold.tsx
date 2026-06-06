// RequireHousehold — second gate (after RequireAuth). Bounces to
// /setup when the user has no household yet. Renders a quiet brand
// placeholder during the user-doc loading frame so we don't flash
// /setup before the snapshot lands.

import { Navigate, Outlet } from "react-router-dom";
import { Brand } from "../components/ui";
import { useAuth } from "../lib/useAuth";
import { useUserDoc } from "../lib/userDoc";

export function RequireHousehold() {
  const { user } = useAuth();
  const { userDoc, loading } = useUserDoc(user?.uid ?? null);

  if (loading) {
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
        <Brand variant="mark" />
      </div>
    );
  }

  if (!userDoc?.householdId) {
    return <Navigate to="/setup" replace />;
  }

  return <Outlet />;
}
