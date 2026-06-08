// App router. /signin and /setup sit outside the household gate
// (a signed-in user without a household still needs /setup);
// /, /settings, and future plan/shop/import routes live inside both
// RequireAuth and RequireHousehold.

import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./lib/useAuth";
import { setAnalyticsUser, trackEvent } from "./lib/analytics";
import { Home } from "./routes/Home";
import { HouseholdSetup } from "./routes/HouseholdSetup";
import { Import } from "./routes/Import";
import { Invite } from "./routes/Invite";
import { RequireAuth } from "./routes/RequireAuth";
import { RequireHousehold } from "./routes/RequireHousehold";
import { Settings } from "./routes/Settings";
import { SignIn } from "./routes/SignIn";

export function App() {
  const { user  } = useAuth();

  // Keep the GA4 user-id property tied to the signed-in user so the
  // analytics dashboard can stitch sessions across devices. Detach on
  // sign-out by passing null. setAnalyticsUser is silent when
  // analytics isn't configured, so this is a no-op in dev.
  useEffect(() => {
    setAnalyticsUser(user?.uid ?? null);
  }, [user?.uid]);

  return (
    <BrowserRouter>
      <PageViewTracker />
      <Routes>
        <Route path="/signin" element={<SignIn />} />

        {/* Auth-only routes — no household required. */}
        <Route element={<RequireAuth />}>
          <Route path="/setup" element={<HouseholdSetup />} />
          {/* /invite and /import are intentionally outside
              RequireHousehold — a brand-new user may land here
              directly from an email or RecipeTracker push, before
              they've created any household of their own. /import
              trampolines through /setup if needed; /invite renders
              its own no-household-friendly UI. */}
          <Route path="/invite/:inviteId" element={<Invite />} />
          <Route path="/import" element={<Import />} />

          {/* Auth + household-required routes. */}
          <Route element={<RequireHousehold />}>
            <Route path="/" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * Fires a `page_view` event each time the SPA route changes. GA4's
 * automatic page tracking only fires on full document loads, which an
 * SPA never does after the initial mount — without this, the entire
 * post-auth surface would register as one "page view" forever.
 *
 * We log `page_path` rather than `page_location` so the URL stays
 * scrubbed of query parameters that occasionally hold recipe ids
 * (e.g. ?chapter=entree is fine but we don't pretend ids are PII-free).
 */
function PageViewTracker() {
  const location = useLocation();
  useEffect(() => {
    // Normalize dynamic segments to their route templates so the
    // GA4 dashboard groups them sensibly (e.g. /recipes/abc and
    // /recipes/def both report as `/recipes/:id`). Without this we'd
    // see hundreds of distinct page paths and zero useful aggregates.
    trackEvent("page_view", {
      page_path: location.pathname,
      page_template: routeTemplate(location.pathname),
    });
  }, [location.pathname]);
  return null;
}

function routeTemplate(path: string): string {
  if (path === "/") return "/";
  if (path === "/setup") return "/setup";
  if (path === "/settings") return "/settings";
  if (path === "/import") return "/import";
  return path;
}