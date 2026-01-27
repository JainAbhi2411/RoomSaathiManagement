import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { registerServiceWorker, setupInstallPrompt, checkForUpdates } from './utils/pwa';

// Register Service Worker and setup PWA
registerServiceWorker().then((registration) => {
  if (registration) {
    console.log('[PWA] Service Worker registered successfully');
    checkForUpdates(registration);
  }
}).catch((error) => {
  console.error('[PWA] Service Worker registration failed:', error);
});

setupInstallPrompt();

createRoot(document.getElementById("root")!).render(
  
    <AppWrapper>
      <App />
    </AppWrapper>
  
);
