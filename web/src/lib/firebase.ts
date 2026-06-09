// Firebase init. Single source of truth for the app/auth/firestore
// singletons. The VITE_USE_EMULATOR=1 flag in web/.env.local points
// the client at locally-running emulators (Phase 2+ usage).

import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // Optional. When present, lib/analytics.ts will lazy-init GA4 on
  // the first event. When absent, analytics is a silent no-op so dev
  // setups without a measurement id keep working unchanged.
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

if (!isConfigured && import.meta.env.DEV) {
  // Don't crash the dev server when the project hasn't been wired up
  // yet — just warn. The hello-world shell renders without Firebase.
  // eslint-disable-next-line no-console
  console.warn(
    "[firebase] VITE_FIREBASE_* env vars are missing. Copy web/.env.example → web/.env.local and fill in your Firebase project values.",
  );
}

export const firebaseApp = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);

// Persistent IndexedDB cache so a repeat cold load renders the
// last-seen list instantly from disk while the network refreshes in
// the background — the single biggest perceived-cold-start win on a
// phone. The multi-tab manager keeps multiple open tabs coherent.
//
// `initializeFirestore` throws if Firestore was already initialized
// (e.g. a Vite HMR re-run of this module), and persistent cache can't
// be enabled in some locked-down storage contexts — fall back to the
// already-initialized / in-memory instance in both cases so the app
// still works.
function makeDb(): Firestore {
  try {
    return initializeFirestore(firebaseApp, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    return getFirestore(firebaseApp);
  }
}

export const db = makeDb();

export const googleProvider = new GoogleAuthProvider();
// Force account chooser so a wrong-account-mid-session is recoverable
// without signing out first.
googleProvider.setCustomParameters({ prompt: "select_account" });

if (import.meta.env.VITE_USE_EMULATOR === "1") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

export const FIREBASE_CONFIGURED = isConfigured;
