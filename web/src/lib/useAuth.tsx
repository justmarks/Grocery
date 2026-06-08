// Auth context + hook. Dev uses signInWithPopup (same-origin, more
// reliable for local iteration); prod uses signInWithRedirect (works
// in iOS installed-PWA, where popup breaks). Branch on
// import.meta.env.DEV — matches the RecipeTracker pattern verbatim.
//
// The Vite dev server header `Cross-Origin-Opener-Policy:
// same-origin-allow-popups` (set in web/vite.config.ts) keeps the
// popup path from emitting COOP warnings.
//
// On every onAuthStateChanged tick where a user is present, the
// users/{uid} doc is upserted — create on first sign-in, refresh
// display fields on subsequent sessions. Downstream code can assume
// the doc exists by the time `user` flips to non-null AND
// `userDocReady` flips to true.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { auth, googleProvider, FIREBASE_CONFIGURED } from "./firebase";
import { trackEvent } from "./analytics";
import { upsertUserDoc } from "./userDoc";

const useDevPopup = import.meta.env.DEV;

async function doSignInWithGoogle(): Promise<void> {
  if (useDevPopup) {
    await signInWithPopup(auth, googleProvider);
    trackEvent("login");
  } else {
    await signInWithRedirect(auth, googleProvider);
    // No event here — sign-in completes after the redirect returns;
    // getRedirectResult in the provider's effect picks it up.
  }
}

type AuthContextValue = {
  user: User | null;
  /** True while the initial auth state is still being resolved. */
  loading: boolean;
  /** True once the users/{uid} doc has been upserted post-sign-in. */
  userDocReady: boolean;
  /** True iff VITE_FIREBASE_* env vars are present. */
  configured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userDocReady, setUserDocReady] = useState(false);

  useEffect(() => {
    if (!FIREBASE_CONFIGURED) {
      setLoading(false);
      return;
    }

    // Resolve a pending redirect sign-in on app boot. Errors surface
    // to the console; the auth-state subscription still drives UI.
    getRedirectResult(auth)
    .then((result) => {
      if (result) {
        // Redirect sign-in just completed. Log the GA4 `login` event
        // here so we don't miss it (popup path logs from signIn
        // directly).
        trackEvent("login", {
          method: result.providerId ?? "unknown",
        });
      }
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("[auth] getRedirectResult:", err);
    });

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);

      if (u) {
        setUserDocReady(false);
        upsertUserDoc(u)
          .then(() => setUserDocReady(true))
          .catch((err) => {
            // The auth state stays valid even if the doc write fails —
            // downstream consumers can show a "couldn't save profile"
            // banner. For now, log + continue so sign-in isn't blocked.
            // eslint-disable-next-line no-console
            console.error("[auth] upsertUserDoc:", err);
            setUserDocReady(true);
          });
      } else {
        setUserDocReady(false);
      }
    });
    return unsub;
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    userDocReady,
    configured: FIREBASE_CONFIGURED,
    signInWithGoogle: doSignInWithGoogle,
    signOut: () => fbSignOut(auth),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
