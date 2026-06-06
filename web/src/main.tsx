import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./lib/useAuth";
import { App } from "./App";
import { UpdatePrompt } from "./components/UpdatePrompt";
import "./styles/styles.css";

// SW registration lives inside <UpdatePrompt> so the React component
// owns the needRefresh / offlineReady state and renders the user-
// facing prompt. The component must mount inside StrictMode but
// outside any router — it's a global piece of chrome.

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <UpdatePrompt />
    </AuthProvider>
  </StrictMode>,
);
