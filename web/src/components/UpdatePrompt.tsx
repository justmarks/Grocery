// SW update + offline-ready toast. Registers the service worker via
// vite-plugin-pwa's React hook so we can show a friendly update
// prompt (registerType: "prompt") instead of silently reloading
// mid-shopping. Reloading mid-checkoff would scroll the user away
// from where they were — even worse during plan-mode composer
// typing. See PLAN.md for the rationale.

import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Button, Toast } from "./ui";

export function UpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(err) {
      // eslint-disable-next-line no-console
      console.error("[sw] register error:", err);
    },
  });

  // Auto-dismiss the offline-ready toast after a beat. The
  // need-refresh toast stays until the user taps Reload — we want
  // it persistent so they can act on it.
  useEffect(() => {
    if (!offlineReady) return;
    const t = window.setTimeout(() => setOfflineReady(false), 3500);
    return () => window.clearTimeout(t);
  }, [offlineReady, setOfflineReady]);

  if (needRefresh) {
    return (
      <div
        role="status"
        style={{
          position: "fixed",
          bottom: "calc(96px + env(safe-area-inset-bottom))",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 60,
          background: "var(--bg-card)",
          border: "1px solid var(--border-faint)",
          borderRadius: "var(--radius-pill)",
          padding: "var(--space-2) var(--space-2) var(--space-2) var(--space-4)",
          boxShadow: "var(--shadow-md)",
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--space-3)",
        }}
      >
        <span style={{ fontSize: "var(--text-sm)", color: "var(--ink-700)" }}>
          A new version is ready.
        </span>
        <Button
          size="sm"
          variant="success"
          icon="check"
          onClick={() => {
            void updateServiceWorker(true);
            setNeedRefresh(false);
          }}
        >
          Reload
        </Button>
      </div>
    );
  }

  return <Toast visible={offlineReady}>Ready to work offline.</Toast>;
}
