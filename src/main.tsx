import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const container = document.getElementById("root")!;

// Pages built ahead of time ship static markup and page-level JSON-LD for
// crawlers. The app renders from scratch, so clear both first: otherwise the
// structured data would be duplicated when <Seo> adds its own.
if (container.hasAttribute("data-prerendered")) {
  container.replaceChildren();
  container.removeAttribute("data-prerendered");
  document.querySelectorAll('script[data-seo-jsonld]').forEach((el) => el.remove());
}

createRoot(container).render(<App />);
