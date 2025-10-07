import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize MSW
async function enableMocking() {
  if (import.meta.env.MODE === 'development' || import.meta.env.VITE_API_BASE_URL?.includes('/mock')) {
    const { worker } = await import('./lib/msw/browser');
    return worker.start({
      onUnhandledRequest: 'bypass',
    });
  }
  return Promise.resolve();
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
