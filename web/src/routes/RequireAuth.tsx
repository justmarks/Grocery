// Route guard. Redirects to /signin when there's no authenticated
// user. While the initial auth state is still resolving, renders a
// quiet brand-only placeholder rather than flashing the sign-in
// screen for a frame.

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Brand } from "../components/ui";
import { useAuth } from "../lib/useAuth";

export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

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

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
