import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split large vendors into cacheable chunks so app-code changes
        // don't invalidate the whole bundle
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("monaco") || id.includes("state-conductor")) return "monaco";
          if (
            id.includes("yjs") ||
            id.includes("y-monaco") ||
            id.includes("y-protocols") ||
            id.includes("socket.io")
          ) {
            return "collab";
          }
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("react-router") ||
            id.includes("scheduler")
          ) {
            return "react";
          }
          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
});
