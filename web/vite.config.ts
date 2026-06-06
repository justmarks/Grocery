import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    headers: {
      // Required for dev-mode `signInWithPopup` to communicate back across
      // origins — without this Chrome warns COOP "would block" window.closed
      // polling. Prod uses signInWithRedirect (see web/src/lib/useAuth.tsx)
      // so the header is dev-only.
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
  build: {
    // Firestore alone is ~400 kB minified — raise the chunk warning so
    // it fires for things that would actually be actionable.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          "firebase-firestore": ["firebase/firestore"],
          "firebase-auth": ["firebase/auth"],
          "firebase-core": ["firebase/app", "firebase/functions"],
          react: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Prompt — never autoUpdate. A silent reload mid-shopping would
      // un-scroll the user and possibly lose an in-flight checkoff.
      // The update toast lives in src/components/UpdatePrompt.tsx.
      registerType: "prompt",
      manifest: {
        name: "Grocery",
        short_name: "Grocery",
        description: "A shared household grocery list for planning trips and shopping efficiently.",
        lang: "en",
        dir: "ltr",
        id: "/",
        start_url: "/",
        scope: "/",
        display: "standalone",
        display_override: ["window-controls-overlay", "standalone", "minimal-ui", "browser"],
        orientation: "portrait-primary",
        // Match the design system's first-paint expectations:
        // tomato-500 for chrome, paper-100 for the splash background.
        theme_color: "#c8553d",
        background_color: "#fbf6ee",
        categories: ["food", "lifestyle", "productivity"],
        launch_handler: { client_mode: "navigate-existing" },
        icons: [
          // SVG is enough for v1; bitmap icons get generated later in Phase 9.
          { src: "/icons/grocery-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
          { src: "/icons/grocery-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
        ],
        prefer_related_applications: false,
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: "/index.html",
        // Never intercept Firebase Auth's iframe handler or any callable-functions
        // path. Both must always hit the network.
        navigateFallbackDenylist: [/^\/__\/auth/, /^\/api\//],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf}"],
        // Variable fonts are precached on first load (they're in the
        // glob above), but the runtime cache here is the safety net
        // for any /fonts/ asset that slips past precache (e.g.,
        // a future deploy that adds a new weight). CacheFirst with
        // a 1y expiration matches the immutable-asset cache headers
        // in firebase.json.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/fonts/"),
            handler: "CacheFirst",
            options: {
              cacheName: "grocery-fonts",
              expiration: {
                maxEntries: 12,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
