import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { prerender } from "./scripts/prerender-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode, isSsrBuild }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), prerender()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    // Read by the prerender plugin to preload each page's chunk; removed after.
    manifest: !isSsrBuild,
    // The prerender SSR build runs in Node and needs no vendor splitting.
    rollupOptions: isSsrBuild ? {} : {
      output: {
        // Split heavy third-party deps into their own chunks so the landing
        // bundle stays small and cached vendor code is shared across routes.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          // Keep React + its JSX runtime in their own chunk so they don't
          // get pulled into whatever vendor chunk happens to use them first.
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/scheduler/") ||
            id.includes("/react/jsx-runtime")
          ) return "vendor-react";
          if (id.includes("@supabase")) return "vendor-supabase";
          if (id.includes("@stripe")) return "vendor-stripe";
          if (
            id.includes("/react-markdown/") ||
            id.includes("/remark-") ||
            id.includes("/micromark") ||
            id.includes("/mdast-") ||
            id.includes("/hast-") ||
            id.includes("/unist-") ||
            id.includes("/unified/")
          ) return "vendor-markdown";
          if (id.includes("framer-motion")) return "vendor-motion";
          // No shared Radix chunk: grouping every primitive together made the
          // home page download admin-only widgets (Select, Slider, ScrollArea).
          // Left alone, Rollup puts each primitive with the code that uses it.
          if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
          if (id.includes("lucide-react")) return "vendor-icons";
          if (id.includes("react-icons")) return "vendor-react-icons";
          if (id.includes("@tanstack")) return "vendor-tanstack";
          if (id.includes("react-router")) return "vendor-router";
        },
      },
    },
  },
}));
