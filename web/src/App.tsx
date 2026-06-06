// App router. /signin and /setup sit outside the household gate
// (a signed-in user without a household still needs /setup);
// /, /settings, and future plan/shop/import routes live inside both
// RequireAuth and RequireHousehold.

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Home } from "./routes/Home";
import { HouseholdSetup } from "./routes/HouseholdSetup";
import { Import } from "./routes/Import";
import { Invite } from "./routes/Invite";
import { RequireAuth } from "./routes/RequireAuth";
import { RequireHousehold } from "./routes/RequireHousehold";
import { Settings } from "./routes/Settings";
import { SignIn } from "./routes/SignIn";

export function App() {
  return (
    <BrowserRouter>
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
